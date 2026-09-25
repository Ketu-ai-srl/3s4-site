import { expect, test } from '@playwright/test'
import { STOCARE_ALEGERE, masoaraTerti, stocareNedeclarata } from './ajutor/detectori'
import {
  GAZDA_STRAINA_PIXEL,
  GAZDA_STRAINA_SCRIPT,
  pornesteFixturile,
  type ServerFixturi,
} from './ajutor/fixturi'
import { rutePublice } from './ajutor/proiect'

/**
 * `C-01` Zero retea terta si zero stocare inainte de orice interactiune. Poarta-mama a
 * sectiunii de consimtamant din PORTI-FABRICA.md.
 *
 * Pragul e ZERO, fara exceptii pentru fonturi, harti, video, chat sau CMP. Astazi site-ul
 * nu are terti (fonturile vin prin `next/font`, adica autogazduite la build), deci poarta
 * TRECE. Asta nu e un motiv sa fie mai slaba: e o poarta de regresie, si valoarea ei se
 * vede in ziua in care cineva lipeste un pixel.
 *
 * Ramura de banner nu e cod mort chiar daca site-ul nu are banner azi: martorii o executa
 * la fiecare rulare, deci nu poate putrezi in tacere pana la prima campanie platita.
 *
 * ALEGEREA PASTRATA DUPA REFUZ (decizia owner-ului din 24.09, planul valului S4 §8-§10): bannerul
 * real intra pe drumul cu GA4 in ziua operatorului, iar un refuz respectat lasa in stocarea locala
 * o singura cheie, alegerea insasi (`STOCARE_ALEGERE`, strict necesara, declarata in politica de
 * cookie-uri). Pragul "zero stocare" ramane intreg INAINTE de orice interactiune; dupa refuz se
 * accepta numai cheia aceea. Martorii de mai jos prind si o cheie in plus, si cheia scrisa la
 * incarcare. Masuratoarea pe drumul cu GA4, pe copia cu operator, e in `comutator.spec.ts`.
 */

let fixturi: ServerFixturi

test.beforeAll(async () => {
  fixturi = await pornesteFixturile()
})

test.afterAll(async () => {
  await fixturi.oprire()
})

const rute = rutePublice()

test.describe('C-01 zero terti', () => {
  for (const ruta of rute) {
    test('pagina reala ' + ruta + ' nu contacteaza niciun tert', async ({ browser, baseURL }) => {
      const masura = await masoaraTerti(browser, (baseURL ?? '') + ruta)

      console.log(
        '[C-01] ' +
          ruta +
          ' | gazda proprie: ' +
          masura.gazdaProprie +
          ' | cereri totale: ' +
          masura.totalCereri +
          ' | gazde straine: ' +
          (masura.gazdeStraine.join(', ') || '(niciuna)') +
          ' | banner: ' +
          (masura.bannerGasit ? 'da, refuz apasat=' + masura.refuzApasat : 'nu exista'),
      )
      console.log(
        '    cookies: ' +
          (masura.cookies.join(', ') || '(niciunul)') +
          ' | chei de stocare: ' +
          (masura.cheiStocare.join(', ') || '(niciuna)'),
      )

      // O masuratoare care nu a vazut nicio cerere nu e "curata", e goala. Pagina isi
      // cere macar propriul document.
      expect(masura.totalCereri, 'nu s-a inregistrat nicio cerere pe ' + ruta).toBeGreaterThan(0)
      expect(masura.gazdeStraine, 'cereri catre terti pe ' + ruta).toEqual([])
      expect(masura.cookiesInainte, 'cookie-uri inainte de orice interactiune pe ' + ruta).toEqual([])
      expect(masura.cheiStocareInainte, 'stocare inainte de orice interactiune pe ' + ruta).toEqual([])
      expect(masura.cookies, 'cookie-uri scrise fara consimtamant pe ' + ruta).toEqual([])
      expect(stocareNedeclarata(masura), 'stocare locala scrisa fara consimtamant pe ' + ruta).toEqual([])
    })
  }

  test('martor NEGATIV: refuzul care lasa NUMAI alegerea, sub cheia declarata, NU trebuie prins', async ({
    browser,
  }) => {
    const masura = await masoaraTerti(browser, fixturi.baza + '/terti/bun-banner-alegere')
    console.log(
      '[C-01 martor negativ, alegere] refuz apasat: ' + masura.refuzApasat + ' | stocare: ' +
        (masura.cheiStocare.join(', ') || '(niciuna)'),
    )
    // Controlul: cheia chiar s-a scris, deci exceptia a fost pusa la lucru, nu ocolita.
    expect(masura.refuzApasat).toBe(true)
    expect(masura.cheiStocare).toEqual([STOCARE_ALEGERE])
    expect(masura.cheiStocareInainte).toEqual([])
    expect(stocareNedeclarata(masura)).toEqual([])
  })

  test('martor POZITIV: refuzul care lasa si o cheie nedeclarata TREBUIE prins', async ({ browser }) => {
    const masura = await masoaraTerti(browser, fixturi.baza + '/terti/rau-banner-stocare')
    console.log('[C-01 martor pozitiv, stocare in plus] ' + stocareNedeclarata(masura).join(', '))
    expect(masura.refuzApasat).toBe(true)
    expect(stocareNedeclarata(masura).length).toBe(1)
  })

  test('martor POZITIV: cheia alegerii scrisa la incarcare, inainte de clic, TREBUIE prinsa', async ({
    browser,
  }) => {
    const masura = await masoaraTerti(browser, fixturi.baza + '/terti/rau-alegere-la-incarcare')
    console.log('[C-01 martor pozitiv, la incarcare] inainte: ' + masura.cheiStocareInainte.join(', '))
    // Dupa refuz, pagina arata exact ca cea corecta: numai citirea de dinaintea clicului o prinde.
    expect(stocareNedeclarata(masura)).toEqual([])
    expect(masura.cheiStocareInainte).toEqual([STOCARE_ALEGERE])
  })

  test('martor POZITIV: script si pixel catre gazde straine TREBUIE sa o inroseasca', async ({
    browser,
  }) => {
    const masura = await masoaraTerti(browser, fixturi.baza + '/terti/rau')

    console.log('[C-01 martor pozitiv] gazde straine: ' + masura.gazdeStraine.join(', '))

    // Se cer AMBELE familii de subresursa. Un detector care ar asculta doar `<script>` ar
    // trece un pixel de urmarire, adica exact forma cea mai des folosita.
    expect(masura.gazdeStraine, 'scriptul strain nu a fost vazut').toContain(GAZDA_STRAINA_SCRIPT)
    expect(masura.gazdeStraine, 'pixelul strain nu a fost vazut').toContain(GAZDA_STRAINA_PIXEL)
  })

  test('martor POZITIV: banner care incarca tertul INAINTE de interactiune TREBUIE sa o inroseasca', async ({
    browser,
  }) => {
    const masura = await masoaraTerti(browser, fixturi.baza + '/terti/rau-banner')

    console.log(
      '[C-01 martor pozitiv, banner] banner gasit: ' +
        masura.bannerGasit +
        ' | refuz apasat: ' +
        masura.refuzApasat +
        ' | gazde straine: ' +
        masura.gazdeStraine.join(', '),
    )

    expect(masura.bannerGasit, 'bannerul fixturii nu a fost gasit').toBe(true)
    expect(masura.refuzApasat, 'butonul de refuz nu a fost apasat').toBe(true)
    expect(masura.gazdeStraine).toContain(GAZDA_STRAINA_SCRIPT)
  })

  test('martor NEGATIV: banner corect, cu refuz respectat, NU trebuie prins', async ({
    browser,
  }) => {
    const masura = await masoaraTerti(browser, fixturi.baza + '/terti/bun-banner')

    console.log(
      '[C-01 martor negativ, banner] banner gasit: ' +
        masura.bannerGasit +
        ' | refuz apasat: ' +
        masura.refuzApasat +
        ' | gazde straine: ' +
        (masura.gazdeStraine.join(', ') || '(niciuna)'),
    )

    // Fara verificarea pe `refuzApasat`, un detector care nu gaseste butonul ar trece
    // martorul negativ din motivul gresit: n-a apasat nimic, deci n-a incarcat nimic.
    expect(masura.bannerGasit).toBe(true)
    expect(masura.refuzApasat, 'ramura de refuz nu s-a executat, deci nu s-a masurat').toBe(true)
    expect(masura.gazdeStraine, 'poarta inroseste un banner care respecta refuzul').toEqual([])
  })

  test('martor NEGATIV: pagina fara terti NU trebuie prinsa', async ({ browser }) => {
    const masura = await masoaraTerti(browser, fixturi.baza + '/terti/bun')

    console.log(
      '[C-01 martor negativ] cereri totale: ' +
        masura.totalCereri +
        ' | gazde straine: ' +
        (masura.gazdeStraine.join(', ') || '(niciuna)'),
    )

    expect(masura.totalCereri).toBeGreaterThan(0)
    expect(masura.gazdeStraine).toEqual([])
  })
})
