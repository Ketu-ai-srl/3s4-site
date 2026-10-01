import { expect, test } from './ajutor/baza'
import { masoaraDerapaj } from './ajutor/detectori'
import { pornesteFixturile, type ServerFixturi } from './ajutor/fixturi'
import { rutePublice } from './ajutor/proiect'

/**
 * Fara derapaj orizontal la 390 px.
 *
 * Prag: <<din cercetare>>. PORTI-FABRICA.md NU contine o poarta de derapaj orizontal si
 * nu numeste nicaieri o latime de referinta, deci codul stabil lipseste si latimea de
 * 390 px vine din brief, nu din catalog. Se citeaza asa pana cand catalogul primeste
 * intrarea. Ce ramane netrivial: 390 px e latimea CSS ceruta, nu cea obtinuta.
 *
 * De aceea `innerWidth` se CITESTE din pagina dupa fiecare redimensionare si se scrie in
 * raport. Raportul de pixeli al masinii nu e constant intre rulari, deci nu exista factor
 * de inmultit; singura cifra onesta e cea intoarsa de pagina.
 */

const LATIME = 390

let fixturi: ServerFixturi

test.beforeAll(async () => {
  fixturi = await pornesteFixturile()
})

test.afterAll(async () => {
  await fixturi.oprire()
})

const rute = rutePublice()

test.describe('Derapaj orizontal la ' + LATIME + ' px', () => {
  for (const ruta of rute) {
    test('pagina reala ' + ruta + ' nu derapeaza la ' + LATIME + ' px', async ({ page }) => {
      await page.goto(ruta, { waitUntil: 'networkidle' })
      const masura = await masoaraDerapaj(page, LATIME)

      console.log(
        '[derapaj] ' +
          ruta +
          ' | cerut: ' +
          masura.latimeCeruta +
          ' px | innerWidth CITIT: ' +
          masura.innerWidth +
          ' | devicePixelRatio: ' +
          masura.devicePixelRatio +
          ' | scrollWidth: ' +
          masura.scrollWidth,
      )
      for (const v of masura.vinovati) console.log('    depaseste: ' + v)

      expect(
        masura.scrollWidth,
        'derapaj orizontal pe ' +
          ruta +
          ': scrollWidth ' +
          masura.scrollWidth +
          ' peste innerWidth ' +
          masura.innerWidth,
      ).toBeLessThanOrEqual(masura.innerWidth)
    })
  }

  test('martor POZITIV: un bloc de 1200 px TREBUIE sa o inroseasca', async ({ page }) => {
    await page.goto(fixturi.baza + '/derapaj/rau', { waitUntil: 'networkidle' })
    const masura = await masoaraDerapaj(page, LATIME)

    console.log(
      '[derapaj martor pozitiv] innerWidth CITIT: ' +
        masura.innerWidth +
        ' | scrollWidth: ' +
        masura.scrollWidth +
        ' | vinovati: ' +
        masura.vinovati.join(', '),
    )

    expect(masura.scrollWidth).toBeGreaterThan(masura.innerWidth)
    // Poarta trebuie sa spuna si UNDE, nu doar CA. O poarta care raporteaza doar
    // "exista derapaj" trimite omul sa caute manual prin toata pagina.
    expect(masura.vinovati.length).toBeGreaterThan(0)
  })

  test('martor NEGATIV: o pagina fluida NU trebuie prinsa', async ({ page }) => {
    await page.goto(fixturi.baza + '/derapaj/bun', { waitUntil: 'networkidle' })
    const masura = await masoaraDerapaj(page, LATIME)

    console.log(
      '[derapaj martor negativ] innerWidth CITIT: ' +
        masura.innerWidth +
        ' | scrollWidth: ' +
        masura.scrollWidth,
    )

    expect(masura.scrollWidth, 'poarta inroseste o pagina fluida').toBeLessThanOrEqual(
      masura.innerWidth,
    )
  })
})
