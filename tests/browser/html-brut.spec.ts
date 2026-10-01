import { expect, test } from './ajutor/baza'
import { masoaraHtmlBrut } from './ajutor/detectori'
import { pornesteFixturile, type ServerFixturi } from './ajutor/fixturi'
import { rutePublice } from './ajutor/proiect'

/**
 * `S-17` Faptele obligatorii exista ca TEXT in HTML brut, plus spiritul lui `S-08`
 * (paritate brut contra randat).
 *
 * Asta e poarta pe care un site concurent o pica, masurat de noi: in HTML-ul lui
 * brut apar literal `0%`, `0h pe luna` si `0 documente pe zi`, fiindca
 * sunt contoare animate din JavaScript. Un crawler AI nu executa JavaScript, deci citeste
 * propunerea de valoare a concurentului ca fiind zero.
 *
 * Aici nu se compara cu o lista de fapte scrisa de mana, ci se cere ca titlul si primele
 * doua paragrafe ale paginii RANDATE sa existe si in HTML-ul livrat fara JavaScript.
 * Asteptarea se deriva la fiecare rulare, deci nu se invecheste cand se rescrie textul.
 */

let fixturi: ServerFixturi

test.beforeAll(async () => {
  fixturi = await pornesteFixturile()
})

test.afterAll(async () => {
  await fixturi.oprire()
})

const rute = rutePublice()

test.describe('S-17 raspuns in HTML brut', () => {
  for (const ruta of rute) {
    test('pagina reala ' + ruta + ' se citeste fara JavaScript', async ({ browser, baseURL }) => {
      const masura = await masoaraHtmlBrut(browser, (baseURL ?? '') + ruta)

      console.log('[S-17] ' + ruta)
      console.log('    titlu cu JS   : ' + masura.titluCuJs)
      console.log('    titlu fara JS : ' + masura.titluFaraJs)
      masura.paragrafeAsteptate.forEach((p, i) => {
        console.log(
          '    paragraf ' + (i + 1) + ' (' + p.length + ' car.): ' + p.slice(0, 90) + '...',
        )
      })
      console.log('    paragrafe lipsa fara JS: ' + masura.paragrafeLipsa.length)

      expect(masura.titluFaraJs, 'titlul lipseste din HTML-ul brut al ' + ruta).not.toBe('')
      expect(masura.titluFaraJs, 'titlul difera intre brut si randat pe ' + ruta).toBe(
        masura.titluCuJs,
      )
      expect(masura.paragrafeLipsa, 'paragrafe livrate doar prin JavaScript pe ' + ruta).toEqual([])
    })
  }

  test('martor POZITIV: continut injectat din JavaScript TREBUIE sa o inroseasca', async ({
    browser,
  }) => {
    const masura = await masoaraHtmlBrut(browser, fixturi.baza + '/brut/rau')

    console.log(
      '[S-17 martor pozitiv] titlu fara JS: "' +
        masura.titluFaraJs +
        '" | paragrafe lipsa: ' +
        masura.paragrafeLipsa.length,
    )

    // Ambele fete ale defectului, nu doar una: titlul rescris din JS si textul injectat.
    expect(masura.titluFaraJs).not.toBe(masura.titluCuJs)
    expect(masura.paragrafeLipsa.length).toBeGreaterThan(0)
  })

  test('martor NEGATIV: continut randat pe server NU trebuie prins', async ({ browser }) => {
    const masura = await masoaraHtmlBrut(browser, fixturi.baza + '/brut/bun')

    console.log(
      '[S-17 martor negativ] titlu identic: ' +
        (masura.titluFaraJs === masura.titluCuJs) +
        ' | paragrafe lipsa: ' +
        masura.paragrafeLipsa.length,
    )

    expect(masura.titluFaraJs).toBe(masura.titluCuJs)
    expect(masura.paragrafeLipsa, 'poarta inroseste o pagina randata corect pe server').toEqual([])
  })
})
