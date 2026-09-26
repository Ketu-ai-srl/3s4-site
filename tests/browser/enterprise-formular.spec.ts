import { createServer, type Server } from 'node:http'
import { expect, test, type Page } from '@playwright/test'
import { TEXTE_BANNER } from '../../src/components/consimtamant/texte'
import { CALE_API_FORMULAR } from '../../src/components/formular/FormularContact'
import { stareFormular } from '../../src/components/formular/stare'
import { DRUM_DOCUMENT, EROU_ENTERPRISE } from '../../src/content/enterprise'
import { FORMULAR } from '../../src/content/formular'
import { pornesteCopiaOperator, type CopieOperator } from './ajutor/copie-operator'

/**
 * Felia enterprise-formular, in browser (planul valului S4, §10: proba comutatorului pe formulare).
 *
 *   1. BUILD-UL REAL, cu `config/operator.json` null: formularul valideaza tot, corectorul opreste
 *      primul clic, iar dupa o completare valida NU pleaca nicio cerere de trimitere (niciun POST,
 *      nimic spre `/api/formular`); langa buton apare mesajul cinstit. Punctul de trimitere raspunde
 *      "inactiv". Banda cu drumul documentului: starea finala in HTML-ul servit si la miscare redusa;
 *      cu miscare, bucla porneste la vedere si se opreste pe pas in afara ferestrei.
 *   2. O COPIE cu operator SINTETIC (`ajutor/copie-operator.ts`, cu cele trei controale ale ei) si
 *      cu `FORMULARE_DESTINATIE` spre un server de proba LOCAL, pornit aici: trimiterea ajunge acolo
 *      o singura data, cu campurile scrise, si pagina arata starea de succes; cand destinatia
 *      raspunde 500, pagina arata starea de rezerva cu mesajul compus. Nimic nu pleaca in afara
 *      masinii.
 *
 * Proba nu scrie starea de mana: prima jumatate cere `stareFormular().activ === false`; in ziua
 * operatorului ea se inroseste pe asertiunea aceea, cu motivul, si se muta pe copie.
 */

const CALE = '/enterprise'
const LATIMI = [
  { latime: 1440, inaltime: 900 },
  { latime: 390, inaltime: 844 },
]

/** Datele de proba, asamblate la rulare (fara adrese personale literale in proba). */
const DATE = {
  nume: 'Proba Enterprise',
  email: ['proba', ['firma-proba', 'test'].join('.')].join('@'),
  companie: 'Firma Proba',
  mesaj: 'Mesaj de proba pentru formular.',
}

const camp = (p: Page, c: string) => p.locator('#formular-enterprise-' + c)
const trimite = (p: Page) => p.locator('#contact-form button[type=submit]')

/** Detectorul probei: orice cerere care nu e GET, si orice cerere spre punctul de trimitere. */
function detectorTrimiteri(page: Page): string[] {
  const trimise: string[] = []
  page.on('request', (r) => {
    if (r.method() !== 'GET' || new URL(r.url()).pathname === CALE_API_FORMULAR) trimise.push(r.method() + ' ' + r.url())
  })
  return trimise
}

async function completeaza(p: Page, email = DATE.email) {
  await camp(p, 'nume').fill(DATE.nume)
  await camp(p, 'email').fill(email)
  await camp(p, 'companie').fill(DATE.companie)
  await camp(p, 'mesaj').fill(DATE.mesaj)
}

test.describe('formularul pe build-ul real (operator null)', () => {
  test('configurarea de azi tine formularul inactiv', () => {
    expect(stareFormular().activ, 'operatorul exista: proba se muta pe copie').toBe(false)
  })

  for (const { latime, inaltime } of LATIMI) {
    test('zero cereri de trimitere, erori, corector si mesajul cinstit la ' + latime, async ({ page }) => {
      await page.setViewportSize({ width: latime, height: inaltime })
      const trimise = detectorTrimiteri(page)
      await page.goto(CALE)
      expect(await page.evaluate(() => innerWidth)).toBe(latime)

      // Trimitere goala: trei erori, pe nume, e-mail si mesaj.
      await trimite(page).click()
      await expect(page.locator('#contact-form [aria-invalid="true"]')).toHaveCount(3)
      for (const c of ['nume', 'email', 'mesaj']) await expect(camp(page, c)).toHaveAttribute('aria-invalid', 'true')
      await expect(camp(page, 'telefon')).not.toHaveAttribute('aria-invalid', 'true')

      // Domeniu scris gresit: primul clic nu trimite, apare blocul corectorului.
      await completeaza(page, 'proba@' + ['gmial', 'com'].join('.'))
      await trimite(page).click()
      await expect(page.locator('#contact-form [role=status]').filter({ hasText: FORMULAR.corector.propunereInainte })).toBeVisible()
      await expect(page.locator('[data-formular-inactiv]')).toHaveCount(0)

      // Al doilea clic trece de corector; operatorul e null, deci nimic nu pleaca.
      await trimite(page).click()
      await expect(page.locator('[data-formular-inactiv]')).toHaveText(FORMULAR.inactiv)

      // Si cu o adresa fara corector.
      await camp(page, 'email').fill(DATE.email)
      await trimite(page).click()
      await expect(page.locator('[data-formular-inactiv]')).toBeVisible()
      await page.waitForTimeout(500)
      expect(trimise, 'cereri de trimitere cu operator null').toEqual([])
    })
  }

  test('martor POZITIV: o trimitere facuta din pagina TREBUIE prinsa de detector', async ({ page }) => {
    const trimise = detectorTrimiteri(page)
    await page.goto(CALE)
    await page.evaluate((cale) => fetch(cale, { method: 'POST', body: '{}' }).then(() => undefined, () => undefined), CALE_API_FORMULAR)
    await expect.poll(() => trimise.length).toBe(1)
  })

  test('martor NEGATIV: pagina incarcata, fara trimitere, NU produce cereri pentru detector', async ({ page }) => {
    const trimise = detectorTrimiteri(page)
    await page.goto(CALE)
    await page.waitForTimeout(500)
    expect(trimise).toEqual([])
  })

  test('punctul de trimitere raspunde "inactiv"', async ({ request }) => {
    const r = await request.post(CALE_API_FORMULAR, { data: { formular: 'enterprise', ...DATE, telefon: '', marketing: false } })
    expect(r.status()).toBe(503)
    expect(await r.json()).toEqual({ stare: 'inactiv', motiv: 'fara-operator' })
  })
})

test.describe('banda cu drumul documentului', () => {
  test('HTML-ul servit are starea finala si tot textul', async ({ request }) => {
    const html = await (await request.get(CALE)).text()
    expect(html).toContain('data-pas="9"')
    for (const t of [...DRUM_DOCUMENT.intrare.elemente, ...DRUM_DOCUMENT.iesire.elemente, DRUM_DOCUMENT.nota]) {
      expect(html).toContain(t)
    }
    expect(html).toContain(EROU_ENTERPRISE.titlu)
  })

  test('miscare redusa: starea finala, fara bucla', async ({ page }) => {
    await page.goto(CALE)
    const banda = page.locator('section[data-pas]')
    await expect(banda).toHaveAttribute('data-pas', '9')
    await page.waitForTimeout(3000)
    await expect(banda).toHaveAttribute('data-pas', '9')
  })

  test('cu miscare: porneste la vedere si se opreste pe pas in afara ferestrei', async ({ browser, baseURL }) => {
    const context = await browser.newContext({ reducedMotion: 'no-preference', viewport: { width: 1440, height: 900 } })
    const page = await context.newPage()
    await page.goto((baseURL ?? '') + CALE)
    const banda = page.locator('section[data-pas]')
    // Banda incepe la y ~634, deci e in fereastra: pasul 0, apoi pasul 1 la +2,0 s.
    await expect(banda).toHaveAttribute('data-pas', '0')
    await expect(banda).toHaveAttribute('data-pas', '1', { timeout: 4000 })
    await expect(banda).toHaveAttribute('data-pas', '3', { timeout: 4000 })
    // Plecat din fereastra: pasul ramane.
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight))
    const oprit = await banda.getAttribute('data-pas')
    await page.waitForTimeout(3000)
    expect(await banda.getAttribute('data-pas')).toBe(oprit)
    // Revenit: pasul urmator dupa ~0,8 s.
    await page.evaluate(() => window.scrollTo(0, 400))
    await expect(banda).not.toHaveAttribute('data-pas', oprit ?? '', { timeout: 2500 })
    await context.close()
  })
})

test.describe('formularul pe copia cu operator sintetic', () => {
  let copie: CopieOperator | null = null
  let destinatie: Server | null = null
  let status = 200
  const primite: Record<string, unknown>[] = []

  test.beforeAll(async () => {
    test.setTimeout(420_000)
    destinatie = createServer((cerere, raspuns) => {
      let corp = ''
      cerere.on('data', (b) => (corp += String(b)))
      cerere.on('end', () => {
        if (cerere.method === 'POST') primite.push(JSON.parse(corp) as Record<string, unknown>)
        raspuns.statusCode = status
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

  async function deschide(page: Page) {
    await page.goto(copie!.baza + CALE)
    // Copia are GA4 sintetic, deci bannerul: se refuza, ca sa nu acopere butonul.
    const refuz = page.getByRole('button', { name: TEXTE_BANNER.refuz })
    if (await refuz.isVisible().catch(() => false)) await refuz.click()
  }

  test('trimiterea ajunge o singura data la destinatia de proba, apoi starea de succes', async ({ page }) => {
    status = 200
    primite.length = 0
    await deschide(page)
    await completeaza(page)
    await trimite(page).click()
    await expect(page.locator('#contact-form').getByText(FORMULAR.succes.titlu)).toBeVisible()
    expect(primite).toHaveLength(1)
    const { primit, ...rest } = primite[0]
    expect(typeof primit).toBe('string')
    expect(rest).toEqual({ formular: 'enterprise', ...DATE, telefon: '', marketing: false })
  })

  test('destinatia raspunde 500: starea de rezerva cu mesajul compus', async ({ page }) => {
    status = 500
    primite.length = 0
    await deschide(page)
    await completeaza(page)
    await trimite(page).click()
    await expect(page.locator('#contact-form').getByText(FORMULAR.rezerva.explicatie)).toBeVisible()
    await expect(page.locator('#contact-form')).toContainText(DATE.mesaj)
    await expect(page.locator('#contact-form')).toContainText('Cerere enterprise - ' + DATE.companie)
    expect(primite).toHaveLength(1)
    // Intoarcerea la editare pastreaza campurile.
    await page.getByRole('button', { name: FORMULAR.rezerva.inapoi }).click()
    await expect(camp(page, 'nume')).toHaveValue(DATE.nume)
  })
})
