import { expect, test } from './ajutor/baza'
import { masoaraAccesibilitatea, IMPACTURI_BLOCANTE } from './ajutor/detectori'
import { pornesteFixturile, type ServerFixturi } from './ajutor/fixturi'
import { rutePublice } from './ajutor/proiect'

/**
 * `PA-03` Zero incalcari de accesibilitate `serious` sau `critical`.
 * `PA-05` Contrast minim 4,5:1 pentru text normal, inclus in `axe-core`.
 *
 * Prag: PORTI-FABRICA.md, `PA-03` si `PA-05`. Incadrare `INDUSTRIE`, nu `LEGAL`, pentru
 * ca EAA cere contract de consum si scuteste microintreprinderile. Poarta isi schimba
 * clasa cand steagurile din configurarea juridica se schimba: atunci `minor` devine
 * blocant, iar singurul loc de modificat e `IMPACTURI_BLOCANTE` din detectori.
 */

let fixturi: ServerFixturi

test.beforeAll(async () => {
  fixturi = await pornesteFixturile()
})

test.afterAll(async () => {
  await fixturi.oprire()
})

const rute = rutePublice()

test.describe('PA-03 accesibilitate', () => {
  for (const ruta of rute) {
    test('pagina reala ' + ruta + ' nu are incalcari serious sau critical', async ({ page }) => {
      await page.goto(ruta, { waitUntil: 'networkidle' })
      const masura = await masoaraAccesibilitatea(page)

      console.log(
        '[PA-03] ' +
          ruta +
          ' | axe ' +
          masura.versiuneAxe +
          ' | reguli evaluate: ' +
          masura.reguliRulate +
          ' | blocante: ' +
          masura.grave.length +
          ' | de raportat (minor/moderate): ' +
          masura.usoare.length,
      )
      for (const u of masura.usoare) {
        console.log('    raportat, nu blocheaza: ' + u.regula + ' (' + u.impact + ') x' + u.noduri)
      }
      for (const g of masura.grave) {
        console.log('    BLOCANT: ' + g.regula + ' (' + g.impact + ') x' + g.noduri + ' - ' + g.descriere)
        for (const t of g.tinte) console.log('        ' + t)
        if (g.noduri > g.tinte.length) {
          console.log('        ... si inca ' + (g.noduri - g.tinte.length) + ' nod(uri)')
        }
      }

      expect(
        masura.grave.map((g) => g.regula),
        'incalcari ' + IMPACTURI_BLOCANTE.join('/') + ' pe ' + ruta,
      ).toEqual([])
    })
  }

  test('martor POZITIV: contrast prost si imagine fara text alternativ TREBUIE sa o inroseasca', async ({
    page,
  }) => {
    await page.goto(fixturi.baza + '/a11y/rau', { waitUntil: 'networkidle' })
    const masura = await masoaraAccesibilitatea(page)
    const reguli = masura.grave.map((g) => g.regula)

    console.log('[PA-03 martor pozitiv] blocante gasite: ' + (reguli.join(', ') || '(niciuna)'))

    // Nu e destul sa fie "ceva rosu": se cere fiecare dintre cele doua clase injectate.
    // Altfel un detector care prinde doar contrastul ar trece controlul si ar fi orb la
    // imaginile fara alt, adica exact defectul cel mai frecvent.
    expect(reguli, 'detectorul trebuie sa vada contrastul prost').toContain('color-contrast')
    expect(reguli, 'detectorul trebuie sa vada imaginea fara alt').toContain('image-alt')
  })

  test('martor NEGATIV: pagina corecta NU trebuie prinsa', async ({ page }) => {
    await page.goto(fixturi.baza + '/a11y/bun', { waitUntil: 'networkidle' })
    const masura = await masoaraAccesibilitatea(page)

    console.log(
      '[PA-03 martor negativ] reguli evaluate: ' +
        masura.reguliRulate +
        ' | blocante: ' +
        masura.grave.map((g) => g.regula).join(', '),
    )

    expect(masura.grave, 'poarta e prea lata: inroseste o pagina corecta').toEqual([])
  })
})
