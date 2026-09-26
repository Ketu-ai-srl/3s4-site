import { createServer, type Server } from 'node:http'
import { expect, test, type Page } from '@playwright/test'
import { TEXTE_BANNER } from '../../src/components/consimtamant/texte'
import { stareFormular } from '../../src/components/formular/stare'
import { FORMULAR } from '../../src/content/formular'
import { CONTACT, DESCARCA, INCEPE, INREGISTRARE } from '../../src/content/conversie'
import { pornesteCopiaOperator, type CopieOperator } from './ajutor/copie-operator'

/**
 * Felia conversie, in browser: /contact, /inregistrare, /descarca, /incepe (planul valului S4, §5.3,
 * §6.9, §9, §10).
 *
 *   1. BUILD-UL REAL (operator `null`): formularul de cont valideaza tot, corectorul opreste primul
 *      clic, iar dupa o completare valida NU pleaca nicio cerere (niciun POST, nimic spre
 *      `/api/formular`); langa buton apare mesajul cinstit. Parametrii constructorului produc
 *      rezumatul; fara ei, nimic. Pe /contact caseta duce la formular (nicio adresa confirmata).
 *   2. /descarca: platforma din sirul agentului e prima si e marcata; toate tintele duc la contul
 *      gratuit; la 390 nimic nu iese din ecran (grila `minmax(0, 1fr)`).
 *   3. /incepe: scenele demonstratiei sunt in HTML-ul servit; rularea porneste la apasare, iar dupa
 *      final apar cele doua iesiri (ceasul paginii e controlat de proba).
 *   4. COPIA cu operator SINTETIC (`ajutor/copie-operator.ts`, cu controalele ei) si destinatie de
 *      proba LOCALA: cererea de cont ajunge o singura data, pe contractul punctului de trimitere, FARA
 *      parola si fara utilizator in alt camp decat mesajul.
 */

const LATIMI = [
  { latime: 1440, inaltime: 900 },
  { latime: 390, inaltime: 844 },
]

const RUTE_FELIE = ['/contact', '/inregistrare', '/descarca', '/incepe']

/** Datele de proba, asamblate la rulare. Parola nu seamana cu una reala. */
const DATE = {
  prenume: 'Ion',
  nume: 'Exemplu',
  email: ['proba', ['firma-proba', 'test'].join('.')].join('@'),
  utilizator: 'ion.exemplu',
  parola: ['proba', 'parola', String(2026)].join('-'),
}

const camp = (p: Page, c: string) => p.locator('#inregistrare-' + c)
const trimite = (p: Page) => p.locator('main form button[type=submit]')

function detectorTrimiteri(page: Page): string[] {
  const trimise: string[] = []
  page.on('request', (r) => {
    if (r.method() !== 'GET' || new URL(r.url()).pathname === '/api/formular') trimise.push(r.method() + ' ' + r.url())
  })
  return trimise
}

async function completeaza(p: Page, email = DATE.email) {
  await camp(p, 'prenume').fill(DATE.prenume)
  await camp(p, 'nume').fill(DATE.nume)
  await camp(p, 'email').fill(email)
  await camp(p, 'utilizator').fill(DATE.utilizator)
  await camp(p, 'parola').fill(DATE.parola)
  await camp(p, 'termeni').check()
}

test.describe('fara derapaj si cu innerWidth citit', () => {
  for (const cale of RUTE_FELIE) {
    for (const { latime, inaltime } of LATIMI) {
      test(cale + ' la ' + latime, async ({ page }) => {
        await page.setViewportSize({ width: latime, height: inaltime })
        await page.goto(cale)
        const m = await page.evaluate(() => ({ w: innerWidth, sw: document.documentElement.scrollWidth }))
        expect(m.w).toBe(latime)
        expect(m.sw, 'derapaj orizontal pe ' + cale).toBeLessThanOrEqual(m.w)
      })
    }
  }
})

test.describe('/inregistrare pe build-ul real (operator null)', () => {
  test('configurarea de azi tine formularul inactiv', () => {
    expect(stareFormular().activ, 'operatorul exista: proba se muta pe copie').toBe(false)
  })

  for (const { latime, inaltime } of LATIMI) {
    test('erori, corector, parola si zero cereri la ' + latime, async ({ page }) => {
      await page.setViewportSize({ width: latime, height: inaltime })
      const trimise = detectorTrimiteri(page)
      await page.goto('/inregistrare')
      expect(await page.evaluate(() => innerWidth)).toBe(latime)
      await expect(page.locator('[data-rezumat-constructor]')).toHaveCount(0)

      // Trimitere goala: prenume, nume, e-mail, utilizator, parola, termeni; telefonul e optional.
      await trimite(page).click()
      for (const c of ['prenume', 'nume', 'email', 'utilizator', 'parola', 'termeni']) {
        await expect(camp(page, c)).toHaveAttribute('aria-invalid', 'true')
      }
      await expect(camp(page, 'telefon')).not.toHaveAttribute('aria-invalid', 'true')
      await expect(camp(page, 'prenume')).toBeFocused()
      await expect(page.locator('#inregistrare-parola-indiciu')).toHaveText(INREGISTRARE.erori.parola)

      // Butonul ochi comuta tipul si eticheta.
      await camp(page, 'parola').fill(DATE.parola)
      await page.getByRole('button', { name: INREGISTRARE.arataParola }).click()
      await expect(camp(page, 'parola')).toHaveAttribute('type', 'text')
      await page.getByRole('button', { name: INREGISTRARE.ascundeParola }).click()
      await expect(camp(page, 'parola')).toHaveAttribute('type', 'password')

      // Domeniu scris gresit: primul clic nu trimite.
      await completeaza(page, 'proba@' + ['gmial', 'com'].join('.'))
      await trimite(page).click()
      await expect(page.locator('main [role=status]').filter({ hasText: FORMULAR.corector.propunereInainte })).toBeVisible()
      await expect(page.locator('[data-formular-inactiv]')).toHaveCount(0)

      // Al doilea clic: operatorul e null, nimic nu pleaca.
      await trimite(page).click()
      await expect(page.locator('[data-formular-inactiv]')).toHaveText(INREGISTRARE.inactiv)
      await page.waitForTimeout(500)
      expect(trimise, 'cereri de trimitere cu operator null').toEqual([])
    })
  }

  test('martor POZITIV: o trimitere facuta din pagina TREBUIE prinsa de detector', async ({ page }) => {
    const trimise = detectorTrimiteri(page)
    await page.goto('/inregistrare')
    await page.evaluate(() => fetch('/api/formular', { method: 'POST', body: '{}' }).then(() => undefined, () => undefined))
    await expect.poll(() => trimise.length).toBe(1)
  })

  test('martor NEGATIV: pagina incarcata, fara trimitere, NU produce cereri pentru detector', async ({ page }) => {
    const trimise = detectorTrimiteri(page)
    await page.goto('/inregistrare')
    await page.waitForTimeout(500)
    expect(trimise).toEqual([])
  })

  test('parametrii constructorului produc rezumatul, codurile necunoscute nu', async ({ page }) => {
    await page.goto('/inregistrare?ind=avocatura&src=email,hartie,necunoscut&vol=v50&who=coleg')
    const r = page.locator('[data-rezumat-constructor]')
    await expect(r).toBeVisible()
    await expect(r).toContainText('Avocatură')
    await expect(r).toContainText('e-mailul firmei, originale pe hârtie')
    await page.goto('/inregistrare?ind=inexistent&vol=v0')
    await expect(page.locator('[data-rezumat-constructor]')).toHaveCount(0)
  })

  test('bifa de noutati e separata, nebifata si neobligatorie', async ({ page }) => {
    await page.goto('/inregistrare')
    const bife = page.locator('main form input[type=checkbox]')
    await expect(bife).toHaveCount(2)
    await expect(page.locator('main form input[name=marketing]')).not.toBeChecked()
    await expect(page.locator('main form input[name=marketing]')).not.toHaveAttribute('aria-required', 'true')
    await expect(page.locator('main [data-informare-formular]')).toContainText('art. 6 alin. (1) lit. b)')
  })
})

test.describe('/contact', () => {
  test('caseta duce la formular, cardurile la paginile existente, formularul e pe pagina', async ({ page, request }) => {
    await page.goto('/contact')
    await expect(page.locator('#contact-form form')).toHaveCount(1)
    const buton = page.getByRole('link', { name: CONTACT.caseta.butonFormular })
    await expect(buton).toHaveAttribute('href', '#contact-form')
    const carduri = page.locator('main ul li a[href^="/"]').filter({ has: page.locator('svg') })
    await expect(carduri).toHaveCount(CONTACT.subiecte.carduri.length)
    for (const c of CONTACT.subiecte.carduri) {
      const r = await request.get(c.legatura.href!)
      expect(r.status(), c.legatura.href!).toBe(200)
    }
    // Nicio adresa de e-mail pe pagina cat timp marca nu are una confirmata.
    await expect(page.locator('main a[href^="mailto:"]')).toHaveCount(0)
    await expect(page.locator('main')).toContainText(CONTACT.canale.stareFormularInchis)
  })
})

test.describe('/descarca', () => {
  test('agentul Windows: Windows primul si marcat, toate tintele la contul gratuit', async ({ page }) => {
    await page.goto('/descarca')
    await expect(page.locator('[data-platforma="windows"]')).toBeVisible()
    await expect(page.getByText(DESCARCA.recomandat.eticheta)).toBeVisible()
    await expect(page.locator('main ul h3').first()).toHaveText('Windows')
    await expect(page.locator('main a[aria-current="true"]')).toHaveCount(1)
    const tinte = await page.locator('main section[aria-labelledby="descarca-platforme"] a').evaluateAll((a) => a.map((x) => x.getAttribute('href')))
    expect(tinte.length).toBeGreaterThan(5)
    for (const t of tinte) expect(t).toBe('/inregistrare')
  })

  test('agentul Android la 390: ordinea fixa (fara salt), elementul Android marcat', async ({ browser, baseURL }) => {
    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Linux; Android 14; Pixel 8) Chrome/125.0 Mobile',
      viewport: { width: 390, height: 844 },
    })
    const page = await context.newPage()
    await page.goto((baseURL ?? '') + '/descarca')
    await expect(page.locator('[data-platforma="android"]')).toBeVisible()
    await expect(page.locator('main a[aria-current="true"]')).toHaveCount(1)
    await expect(page.locator('main ul h3').first()).toHaveText('Windows')
    await context.close()
  })

  test('agentul Android peste 720: grupul mobil primul', async ({ browser, baseURL }) => {
    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Linux; Android 14; Pixel 8) Chrome/125.0 Mobile',
      viewport: { width: 1024, height: 900 },
    })
    const page = await context.newPage()
    await page.goto((baseURL ?? '') + '/descarca')
    await expect(page.locator('[data-platforma="android"]')).toBeVisible()
    await expect(page.locator('main ul h3').first()).toHaveText('Mobil')
    await context.close()
  })

  test('fara JavaScript: starea generica, fara platforma', async ({ browser, baseURL }) => {
    const context = await browser.newContext({ javaScriptEnabled: false })
    const page = await context.newPage()
    await page.goto((baseURL ?? '') + '/descarca')
    await expect(page.locator('[data-platforma="necunoscuta"]')).toBeVisible()
    await expect(page.getByText(DESCARCA.recomandat.buton)).toBeVisible()
    await context.close()
  })
})

test.describe('/incepe', () => {
  test('HTML-ul servit are textul tuturor scenelor si declaratia', async ({ request }) => {
    const html = await (await request.get('/incepe')).text()
    const a = INCEPE.demo.aplicatie
    for (const t of [a.intrare.fisier, a.dosar.regula, a.raspuns.text, INCEPE.demo.declaratie, INCEPE.titlu]) {
      expect(html).toContain(t.replace(/&/g, '&amp;'))
    }
    expect(html).toContain('data-pagina-imersiva')
  })

  test('rularea porneste la apasare si se termina cu cele doua iesiri', async ({ page }) => {
    await page.clock.install()
    await page.goto('/incepe')
    const rama = page.locator('figure[data-stare]')
    await expect(rama).toHaveAttribute('data-stare', 'repaus')
    await expect(page.locator('[data-final-demo]')).toBeHidden()
    await page.getByRole('button', { name: INCEPE.demo.porneste }).first().click()
    await expect(rama).toHaveAttribute('data-stare', 'ruleaza')
    await page.clock.runFor(6000)
    await expect(rama).toHaveAttribute('data-scena', '1')
    await page.clock.runFor(20000)
    await expect(rama).toHaveAttribute('data-stare', 'final')
    await expect(page.locator('[data-final-demo]')).toBeVisible()
    await expect(page.locator('[data-final-demo] a[href="/inregistrare"]')).toHaveCount(1)
    await expect(page.locator('[data-final-demo] a[href="/descarca"]')).toHaveCount(1)
  })

  test('eticheta de exemplu e vizibila, de cel putin 11 px', async ({ page }) => {
    await page.goto('/incepe')
    const insigna = page.getByText(INCEPE.demo.exemplu, { exact: true })
    await expect(insigna).toBeVisible()
    const px = await insigna.evaluate((el) => parseFloat(getComputedStyle(el).fontSize))
    expect(px).toBeGreaterThanOrEqual(11)
  })
})

test.describe('/inregistrare pe copia cu operator sintetic', () => {
  let copie: CopieOperator | null = null
  let destinatie: Server | null = null
  const primite: Record<string, unknown>[] = []

  test.beforeAll(async () => {
    test.setTimeout(420_000)
    destinatie = createServer((cerere, raspuns) => {
      let corp = ''
      cerere.on('data', (b) => (corp += String(b)))
      cerere.on('end', () => {
        if (cerere.method === 'POST') primite.push(JSON.parse(corp) as Record<string, unknown>)
        raspuns.statusCode = 200
        raspuns.end()
      })
    })
    await new Promise<void>((gata) => destinatie!.listen(0, '127.0.0.1', () => gata()))
    const adresa = destinatie.address()
    const port = typeof adresa === 'object' && adresa ? adresa.port : 0
    const anterior = process.env.FORMULARE_DESTINATIE
    process.env.FORMULARE_DESTINATIE = 'http://127.0.0.1:' + port + '/formulare'
    try {
      copie = await pornesteCopiaOperator()
    } finally {
      if (anterior === undefined) delete process.env.FORMULARE_DESTINATIE
      else process.env.FORMULARE_DESTINATIE = anterior
    }
  })

  test.afterAll(async () => {
    await copie?.opreste()
    await new Promise<void>((gata) => (destinatie ? destinatie.close(() => gata()) : gata()))
  })

  test('cererea de cont ajunge o singura data, pe contract, fara parola', async ({ page }) => {
    primite.length = 0
    await page.goto(copie!.baza + '/inregistrare?ind=notariat&vol=v10')
    const refuz = page.getByRole('button', { name: TEXTE_BANNER.refuz })
    if (await refuz.isVisible().catch(() => false)) await refuz.click()
    await completeaza(page)
    await trimite(page).click()
    await expect(page.getByText(INREGISTRARE.succes.titlu)).toBeVisible()
    expect(primite).toHaveLength(1)
    const { primit, ...rest } = primite[0]
    expect(typeof primit).toBe('string')
    expect(Object.keys(rest).sort()).toEqual(['companie', 'email', 'formular', 'marketing', 'mesaj', 'nume', 'telefon'])
    expect(rest.formular).toBe('inregistrare')
    expect(rest.nume).toBe(DATE.prenume + ' ' + DATE.nume)
    expect(String(rest.mesaj)).toContain(DATE.utilizator)
    expect(String(rest.mesaj)).toContain('Notariat')
    expect(JSON.stringify(primite[0])).not.toContain(DATE.parola)
  })
})
