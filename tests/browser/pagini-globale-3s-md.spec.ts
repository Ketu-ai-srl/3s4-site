import type { Browser, BrowserContext, Page } from '@playwright/test'
import { CHEIE_ALEGERE } from '../../src/components/consimtamant/stocare'
import { expect, test } from './ajutor/baza'
import { pornesteCopia3sMd, type Copie3sMd } from './ajutor/copie-3s-md'

/**
 * PIESELE GLOBALE pe COPIA 3s.md (felia 134; `ajutor/copie-3s-md.ts`, profilul `config/profil-3s-md.json`, plus o
 * analitica proprie sintetica, ca bannerul sa existe). Defectele vin din testul 3s.md in browserul real; fiecare caz
 * are martorul lui:
 *   - M3: o alegere facuta pe `/` tine pe `/ro` si invers, cu cheia `3s-consimtamant` citita inainte si dupa; martorul:
 *     o alegere pe ALT catalog face bannerul sa apara (deci absenta bannerului vine din potrivirea catalogului);
 *   - M2: pagina de negasit are stilul site-ului (titlul sub antetul fix, corpul de litera al titlurilor interioare),
 *     iar "Cookie settings" din subsol deschide panoul;
 *   - m15: cu bannerul pe ecran (martorul), sertarul deschis la 390 nu mai e acoperit (butonul WhatsApp din sertar e
 *     elementul de sub centrul lui), iar bannerul revine la inchidere; la fel, bannerul se retrage cat e deschisa paleta;
 *   - m8: pe ecran tactil (fara hover) paleta nu arata indicatii de tastatura; martorul, pe desktop, le arata;
 *   - m7: paleta deschisa pe `/` nu propune pagini `/ro`, iar pe `/ro` propune numai pagini `/ro`;
 *   - m18: legatura din randul de jos al subsolului EN are corpul de litera al vecinilor.
 *
 * Cererile catre alte gazde se blocheaza (legaturile wa.me si instanta de statistica nu pleaca nicaieri).
 */

const INSTANTA = 'https://' + ['statistica', 'proba-134', 'test'].join('.')
const ID_SITE = ['6a1b2c3d', '4e5f', '4a6b', '8c7d', '9e0f1a2b3c4d'].join('-')

let copie: Copie3sMd

test.beforeAll(async () => {
  test.setTimeout(420_000)
  copie = await pornesteCopia3sMd({ UMAMI_URL: INSTANTA, UMAMI_WEBSITE_ID: ID_SITE })
})

test.afterAll(async () => {
  await copie?.opreste()
})

async function context(browser: Browser, optiuni: Parameters<Browser['newContext']>[0] = {}): Promise<{ ctx: BrowserContext; pagina: Page }> {
  const ctx = await browser.newContext(optiuni)
  const proprie = new URL(copie.baza).host
  await ctx.route('**/*', (r) => (new URL(r.request().url()).host === proprie ? r.continue() : r.abort('blockedbyclient')))
  return { ctx, pagina: await ctx.newPage() }
}

async function deschide(pagina: Page, cale: string): Promise<number> {
  const r = await pagina.goto(copie.baza + cale, { waitUntil: 'domcontentloaded' })
  await pagina.waitForLoadState('networkidle').catch(() => {})
  return r?.status() ?? 0
}

const cheie = (pagina: Page) => pagina.evaluate((k) => localStorage.getItem(k), CHEIE_ALEGERE)

test.describe('M3: alegerea din banner tine in ambele limbi', () => {
  for (const [prima, aDoua] of [
    ['/', '/ro'],
    ['/ro', '/'],
  ] as const) {
    test('refuz pe ' + prima + ', apoi ' + aDoua + ': bannerul nu reapare, cheia ramane aceeasi', async ({ browser }) => {
      const { ctx, pagina } = await context(browser)
      await deschide(pagina, prima)
      const inainte = await cheie(pagina)
      const banner = pagina.locator('[data-consimtamant]')
      await expect(banner).toBeVisible()
      await banner.locator('[data-refuz]').click()
      await expect(banner).toBeHidden()
      const dupaAlegere = await cheie(pagina)
      await deschide(pagina, aDoua)
      await pagina.waitForTimeout(1000)
      const pe2 = { banner: await banner.isVisible(), cheie: await cheie(pagina) }
      await ctx.close()
      console.log('[M3] ' + prima + ' -> ' + aDoua + ' inainte=' + inainte + ' dupa=' + dupaAlegere + ' pe a doua=' + JSON.stringify(pe2))
      expect(inainte).toBeNull()
      expect(JSON.parse(dupaAlegere ?? '{}')).toMatchObject({ metoda: 'refuz-tot', catalog: expect.stringMatching(/^c-[0-9a-f]{8}$/) })
      expect(pe2).toEqual({ banner: false, cheie: dupaAlegere })
    })
  }

  test('martor POZITIV: o alegere pe ALT catalog nu tine, bannerul apare pe / si pe /ro', async ({ browser }) => {
    const { ctx, pagina } = await context(browser)
    const straina = { versiune: 'en-' + '0'.repeat(8), id: 'a1b2c3d4-0000-4000-8000-000000000134', moment: new Date().toISOString(), statistica: false, metoda: 'refuz-tot', catalog: 'c-' + '0'.repeat(8) }
    await ctx.addInitScript(([k, v]) => localStorage.setItem(k, v), [CHEIE_ALEGERE, JSON.stringify(straina)] as const)
    for (const cale of ['/', '/ro']) {
      await deschide(pagina, cale)
      await expect(pagina.locator('[data-consimtamant]'), cale).toBeVisible()
    }
    await ctx.close()
  })
})

test.describe('M2: pagina de negasit', () => {
  for (const latime of [390, 1440]) {
    test('la ' + latime + ': 404, titlul sub antet cu corpul titlurilor interioare; "Cookie settings" deschide panoul', async ({ browser }) => {
      const { ctx, pagina } = await context(browser, { viewport: { width: latime, height: latime < 800 ? 844 : 900 } })
      const status = await deschide(pagina, '/o-adresa-' + 'care-nu-exista-134')
      const m = await pagina.evaluate(() => {
        const h1 = document.querySelector('main h1') as HTMLElement
        const antet = document.querySelector('header') as HTMLElement
        return {
          lang: document.documentElement.lang,
          marime: parseFloat(getComputedStyle(h1).fontSize),
          sus: h1.getBoundingClientRect().top,
          antetJos: antet.getBoundingClientRect().bottom,
        }
      })
      // Martorul corpului de litera: un titlu cu clasa titlurilor interioare, pus in aceeasi pagina, pe aceeasi latime.
      const martor = await pagina.evaluate(() => {
        const h = document.createElement('h1')
        h.className = 't-h1-interior'
        h.textContent = 'martor'
        document.body.append(h)
        const marime = parseFloat(getComputedStyle(h).fontSize)
        h.remove()
        return marime
      })
      // Bannerul e si el pe pagina de negasit (il monteaza pagina): refuzul il inchide, ca butonul din subsol sa fie liber.
      const banner = pagina.locator('[data-consimtamant]')
      await expect(banner).toBeVisible()
      await banner.locator('[data-refuz]').click()
      await expect(banner).toBeHidden()
      const buton = pagina.locator('footer [data-cookie-settings]')
      await expect(buton).toHaveCount(1)
      await buton.click()
      await expect(pagina.locator('[data-consimtamant-setari]')).toBeVisible()
      await ctx.close()
      console.log('[M2] ' + latime + ' ' + JSON.stringify({ status, ...m, martor }))
      expect(status).toBe(404)
      expect(m.lang).toBe('en')
      expect(m.marime).toBeGreaterThan(16)
      expect(m.marime).toBe(martor)
      expect(m.sus).toBeGreaterThanOrEqual(m.antetJos)
    })
  }
})

test('m15: la 390, cu bannerul pe ecran, sertarul deschis nu e acoperit (butonul WhatsApp e sub centrul lui)', async ({ browser }) => {
  const { ctx, pagina } = await context(browser, { viewport: { width: 390, height: 844 } })
  await deschide(pagina, '/ro')
  await expect(pagina.locator('[data-consimtamant]')).toBeVisible()
  await pagina.locator('[data-hamburger]').click()
  const sertar = pagina.locator('[data-sertar]')
  await expect(sertar).toBeVisible()
  await pagina.waitForTimeout(500)
  const lovit = await pagina.evaluate(() => {
    const a = document.querySelector('[data-sertar] a[href^="https://wa.me/"]') as HTMLElement | null
    if (a === null) return 'fara buton WhatsApp in sertar'
    const r = a.getBoundingClientRect()
    const e = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2)
    return e !== null && a.contains(e) ? 'butonul' : e?.closest('[data-consimtamant]') ? 'bannerul' : String(e?.className)
  })
  await pagina.keyboard.press('Escape')
  await expect(sertar).toHaveCount(0)
  await pagina.waitForTimeout(400)
  const bannerDupa = await pagina.locator('[data-consimtamant]').isVisible()
  await ctx.close()
  expect(lovit).toBe('butonul')
  // Bannerul se intoarce la inchiderea sertarului: nu s-a pierdut, s-a retras.
  expect(bannerDupa).toBe(true)
})

test.describe('paleta de cautare', () => {
  for (const [nume, optiuni, asteptat] of [
    ['ecran tactil', { hasTouch: true, isMobile: true }, { subsol: false, esc: false, x: true }],
    ['martor NEGATIV: desktop (cu hover, nimic ascuns)', {}, { subsol: true, esc: true, x: false }],
  ] as const) {
    test('m8, ' + nume + ': indicatiile de tastatura ' + (asteptat.subsol ? 'se vad' : 'nu se vad'), async ({ browser }) => {
      const { ctx, pagina } = await context(browser, { viewport: { width: 390, height: 844 }, ...optiuni })
      await deschide(pagina, '/')
      // Bannerul e pe ecran inainte (martorul) si se retrage cat e deschisa paleta (ii acoperea rezultatele).
      const banner = pagina.locator('[data-consimtamant]')
      await expect(banner).toBeVisible()
      await pagina.locator('header button[aria-label="Open search"]:visible').first().click()
      const panou = pagina.locator('[data-paleta] [role="dialog"]')
      await expect(panou).toBeVisible()
      await expect(banner).toBeHidden()
      const m = {
        subsol: await panou.locator('[class*="PaletaCautare_subsol"]').isVisible(),
        esc: await panou.locator('[class*="PaletaCautare_tastaEscText"]').isVisible(),
        x: await panou.locator('[class*="PaletaCautare_tastaEscIconita"]').isVisible(),
      }
      await ctx.close()
      expect(m).toEqual(asteptat)
    })
  }

  for (const [cale, q, editie] of [
    ['/', 'contact', 'en'],
    ['/', 'enterprise', 'en'],
    ['/ro', 'contact', 'ro'],
  ] as const) {
    test('m7: pe ' + cale + ', "' + q + '" da numai pagini ale editiei ' + editie, async ({ browser }) => {
      const { ctx, pagina } = await context(browser, { viewport: { width: 1440, height: 900 } })
      await deschide(pagina, cale)
      await pagina.keyboard.press('Control+k')
      const camp = pagina.locator('[data-paleta] input[role="combobox"]')
      await expect(camp).toBeFocused()
      await camp.fill(q)
      const caiRezultate = await pagina.locator('[data-paleta] [role="option"] span:last-child').allTextContents()
      await ctx.close()
      expect(caiRezultate.length, q).toBeGreaterThan(0)
      const peRo = (c: string) => c === '/ro' || c.startsWith('/ro/')
      expect(caiRezultate.filter((c) => (editie === 'en' ? peRo(c) : !peRo(c))), caiRezultate.join(' ')).toEqual([])
    })
  }
})

test('m18: pe EN, legatura din randul de jos al subsolului are corpul de litera al vecinilor', async ({ browser }) => {
  const { ctx, pagina } = await context(browser, { viewport: { width: 1440, height: 900 } })
  await deschide(pagina, '/pricing')
  const m = await pagina.evaluate(() => {
    const buton = document.querySelector('footer [data-cookie-settings]') as HTMLElement
    const rand = buton.parentElement as HTMLElement
    const legatura = rand.querySelector('a') as HTMLElement | null
    return { legatura: legatura ? getComputedStyle(legatura).fontSize : null, buton: getComputedStyle(buton).fontSize, text: getComputedStyle(rand.querySelector('p') as HTMLElement).fontSize }
  })
  await ctx.close()
  expect(m.legatura, 'controlul: randul are legatura').not.toBeNull()
  expect(m).toEqual({ legatura: m.text, buton: m.text, text: m.text })
})
