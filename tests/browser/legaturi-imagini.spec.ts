import { expect, test } from './ajutor/baza'
import { masoaraLegaturiSiImagini } from './ajutor/detectori'
import { pornesteFixturile, type ServerFixturi } from './ajutor/fixturi'
import { rutePublice } from './ajutor/proiect'

/**
 * Zero legaturi interne moarte, zero imagini fara text alternativ.
 *
 * Praguri: `PA-04` (fiecare `<img>` are `alt`, gol doar cu `role="presentation"`) si
 * `S-07`/`S-15` pentru legaturile care trebuie sa duca undeva. Cifra care justifica
 * severitatea, din PORTI-FABRICA.md §5: 34,82% din fetch-urile ChatGPT si 34,16% din cele
 * Claude ajung pe 404, fata de 8,22% la Googlebot, deci o legatura moarta costa mai mult
 * la un cititor automat decat la unul uman.
 *
 * Se verifica DOAR legaturile catre propria origine. O legatura externa depinde de reteaua
 * publica, iar o poarta care se inroseste cand pica serverul altcuiva se invata a fi ignorata.
 *
 * Onestitate despre ce masoara azi: pagina reala nu are nicio `<img>`, deci multimea e
 * VIDA si verdictul verde nu spune nimic despre detector. Numarul de imagini si de legaturi
 * examinate se tipareste la fiecare rulare, iar dovada ca detectorul vede e martorul pozitiv.
 */

let fixturi: ServerFixturi

test.beforeAll(async () => {
  fixturi = await pornesteFixturile()
})

test.afterAll(async () => {
  await fixturi.oprire()
})

const rute = rutePublice()

test.describe('Legaturi si imagini', () => {
  for (const ruta of rute) {
    test('pagina reala ' + ruta + ' nu are legaturi moarte sau imagini fara alt', async ({
      page,
    }) => {
      await page.goto(ruta, { waitUntil: 'networkidle' })
      const masura = await masoaraLegaturiSiImagini(page)

      console.log(
        '[legaturi] ' +
          ruta +
          ' | legaturi interne verificate: ' +
          masura.legaturiInterne +
          ' | ancore verificate: ' +
          masura.ancore +
          ' | imagini examinate: ' +
          masura.imagini,
      )
      for (const l of masura.legaturiMoarte) console.log('    legatura moarta: ' + l)
      for (const a of masura.ancoreMoarte) console.log('    ancora fara tinta: ' + a)
      for (const i of masura.imaginiFaraAlt) console.log('    imagine fara alt: ' + i)

      expect(masura.legaturiMoarte, 'legaturi interne moarte pe ' + ruta).toEqual([])
      expect(masura.ancoreMoarte, 'ancore fara tinta pe ' + ruta).toEqual([])
      expect(masura.imaginiFaraAlt, 'imagini fara text alternativ pe ' + ruta).toEqual([])
    })
  }

  test('martor POZITIV: ruta inexistenta, ancora fara tinta si imagine fara alt TREBUIE sa o inroseasca', async ({
    page,
  }) => {
    await page.goto(fixturi.baza + '/legaturi/rau', { waitUntil: 'networkidle' })
    const masura = await masoaraLegaturiSiImagini(page)

    console.log(
      '[legaturi martor pozitiv] moarte: ' +
        masura.legaturiMoarte.join(', ') +
        ' | ancore moarte: ' +
        masura.ancoreMoarte.join(', ') +
        ' | imagini fara alt: ' +
        masura.imaginiFaraAlt.length,
    )

    // Cele trei clase se cer separat: un detector care prinde doar una ar trece controlul
    // si ar fi orb la celelalte doua.
    expect(masura.legaturiMoarte.length, 'legatura catre o ruta 404 nu a fost vazuta').toBeGreaterThan(0)
    expect(masura.ancoreMoarte.length, 'ancora fara tinta nu a fost vazuta').toBeGreaterThan(0)
    expect(masura.imaginiFaraAlt.length, 'imaginea fara alt nu a fost vazuta').toBeGreaterThan(0)
  })

  test('martor NEGATIV: legaturi valide, ancora existenta si alt corect NU trebuie prinse', async ({
    page,
  }) => {
    await page.goto(fixturi.baza + '/legaturi/bun', { waitUntil: 'networkidle' })
    const masura = await masoaraLegaturiSiImagini(page)

    console.log(
      '[legaturi martor negativ] legaturi interne: ' +
        masura.legaturiInterne +
        ' | ancore: ' +
        masura.ancore +
        ' | imagini: ' +
        masura.imagini,
    )

    // Martorul negativ trebuie sa aiba ce examina, altfel trece din lipsa de subiect.
    expect(masura.legaturiInterne, 'martorul negativ nu are nicio legatura interna').toBeGreaterThan(0)
    expect(masura.ancore, 'martorul negativ nu are nicio ancora').toBeGreaterThan(0)
    expect(masura.imagini, 'martorul negativ nu are nicio imagine').toBeGreaterThan(0)

    expect(masura.legaturiMoarte, 'poarta inroseste o legatura valida').toEqual([])
    expect(masura.ancoreMoarte, 'poarta inroseste o ancora existenta').toEqual([])
    expect(masura.imaginiFaraAlt, 'poarta inroseste un alt corect sau o decorativa marcata').toEqual(
      [],
    )
  })
})
