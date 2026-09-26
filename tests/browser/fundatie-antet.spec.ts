import { expect, test, type Page } from '@playwright/test'
import { ANTET, PALETA, SELECTOR_LIMBA, SERTAR } from '../../src/content/navigatie'
import { rutePublice } from './ajutor/proiect'

/**
 * Globalele din layout (felia `fundatie`): antetul in cele doua stari, paleta Ctrl K, sertarul
 * mobil, selectorul de limba si structura servita fara JavaScript.
 *
 * DE CE EXISTA. Antetul sta in `src/app/layout.tsx`, deci o legatura moarta sau un meniu care nu
 * se mai deschide strica TOATE paginile deodata. Proba inlocuieste vechea proba a meniului
 * pliabil (directia anterioara) si ii pastreaza cele trei intrebari: meniul se deschide si se
 * inchide, arata rutele care exista, iar structura site-ului e in HTML-ul servit, nu construita
 * din JavaScript.
 *
 * Caile existente vin din `rutePublice()` (arborele `src/app`), sursa independenta de contractul
 * de navigatie: daca proba ar citi filtrul din componenta, ar compara filtrul cu el insusi.
 */

const CAI = new Set(rutePublice())

/**
 * Legaturile interne de sub `radacina` care duc la o cale inexistenta sau, cand pagina curenta e
 * chiar tinta, la o ancora fara element. Probele de aici ruleaza pe `/`, unde stau ancorele
 * navigatiei (`/#functionalitati`, `/#intrebari`).
 */
async function legaturiMoarte(page: Page, radacina: string): Promise<string[]> {
  const legaturi = await page.locator(radacina + ' a[href]').evaluateAll((noduri) =>
    noduri.map((a) => (a as HTMLAnchorElement).getAttribute('href') ?? ''),
  )
  const caleCurenta = new URL(page.url()).pathname
  const moarte: string[] = []
  for (const href of legaturi) {
    if (!href.startsWith('/')) continue
    const url = new URL(href, 'http://proba.invalid')
    if (!CAI.has(url.pathname)) {
      moarte.push(href)
    } else if (url.hash && url.pathname === caleCurenta) {
      const id = decodeURIComponent(url.hash.slice(1))
      const exista = await page.evaluate((x) => document.getElementById(x) !== null, id)
      if (!exista) moarte.push(href)
    }
  }
  return moarte
}

test.describe('antetul la 1440', () => {
  test.use({ viewport: { width: 1440, height: 900 } })

  test('pe start e plat sus si devine pastila dupa 20 px de derulare', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' })
    const latime = await page.evaluate(() => window.innerWidth)
    console.log('[antet] innerWidth CITIT: ' + latime)
    const antet = page.locator('header[data-antet]')
    await expect(antet).toHaveAttribute('data-antet', 'plat')
    await page.evaluate(() => window.scrollTo(0, 20))
    await expect(antet).toHaveAttribute('data-antet', 'plat')
    await page.evaluate(() => window.scrollTo(0, 21))
    await expect(antet).toHaveAttribute('data-antet', 'pastila')
    await page.evaluate(() => window.scrollTo(0, 0))
    await expect(antet).toHaveAttribute('data-antet', 'plat')
  })

  test('antetul si subsolul nu au legaturi moarte', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' })
    expect(await legaturiMoarte(page, 'header')).toEqual([])
    expect(await legaturiMoarte(page, 'footer')).toEqual([])
  })

  test('martor POZITIV: o ruta inexistenta si o ancora fara tinta, puse in antet, sunt prinse', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' })
    await page.evaluate(() => {
      for (const href of ['/ruta-care-nu-exista-inca', '/#ancora-care-nu-exista']) {
        const a = document.createElement('a')
        a.setAttribute('href', href)
        a.textContent = 'x'
        document.querySelector('header nav')?.appendChild(a)
      }
    })
    expect(await legaturiMoarte(page, 'header')).toEqual(['/ruta-care-nu-exista-inca', '/#ancora-care-nu-exista'])
  })

  test('martor NEGATIV: antetul neatins nu e prins', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' })
    const toate = await page.locator('header a[href]').count()
    expect(toate, 'antetul nu are nicio legatura: detectorul n-ar avea ce masura').toBeGreaterThan(0)
    expect(await legaturiMoarte(page, 'header')).toEqual([])
  })

  test('Ctrl K deschide paleta; cauta fara diacritice; Escape o inchide', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' })
    await page.keyboard.press('Control+k')
    const paleta = page.getByRole('dialog', { name: PALETA.eticheta })
    await expect(paleta).toBeVisible()
    await expect(page.getByRole('combobox')).toBeFocused()
    await page.keyboard.type('acasa')
    await expect(paleta.getByRole('option', { name: /Acasă/ })).toBeVisible()
    await page.keyboard.type('zzzqqq')
    await expect(paleta.getByText(PALETA.faraRezultate)).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(paleta).toHaveCount(0)
  })

  test('butonul de cautare deschide aceeasi paleta, iar clicul pe fundal o inchide', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' })
    await page.getByRole('button', { name: ANTET.cautare.eticheta }).first().click()
    const paleta = page.getByRole('dialog', { name: PALETA.eticheta })
    await expect(paleta).toBeVisible()
    await page.mouse.click(20, 880)
    await expect(paleta).toHaveCount(0)
  })

  test('selectorul de limba are o singura optiune, activa, si se inchide la Escape', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' })
    const buton = page.locator('header[data-antet]').getByRole('button', { name: SELECTOR_LIMBA.eticheta })
    await buton.click()
    await expect(buton).toHaveAttribute('aria-expanded', 'true')
    await expect(page.locator('header[data-antet]').getByRole('link', { name: 'Română' })).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(buton).toHaveAttribute('aria-expanded', 'false')
  })
})

test.describe('sertarul mobil la 390', () => {
  test.use({ viewport: { width: 390, height: 844 } })

  test('hamburgerul deschide sertarul, focusul intra pe X, Escape il inchide si intoarce focusul', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' })
    console.log('[sertar] innerWidth CITIT: ' + (await page.evaluate(() => window.innerWidth)))
    const hamburger = page.locator('[data-hamburger]')
    await expect(hamburger).toBeVisible()
    await expect(page.locator('header[data-antet] nav')).toBeHidden()
    await hamburger.click()
    const sertar = page.getByRole('dialog', { name: SERTAR.eticheta })
    await expect(sertar).toBeVisible()
    await expect(sertar.getByRole('button', { name: SERTAR.inchide })).toBeFocused()
    await expect(sertar.getByRole('link', { name: 'Acasă' })).toBeVisible()
    expect(await legaturiMoarte(page, '[data-sertar]')).toEqual([])
    await page.keyboard.press('Escape')
    await expect(sertar).toHaveCount(0)
    await expect(hamburger).toBeFocused()
  })

  test('antetul nu depaseste latimea ferestrei', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' })
    const cutie = await page.locator('header[data-antet]').boundingBox()
    const latime = await page.evaluate(() => window.innerWidth)
    expect(cutie!.width).toBeLessThanOrEqual(latime)
  })
})

test.describe('structura servita fara JavaScript', () => {
  test('HTML-ul brut al startului are meniul principal si subsolul cu legaturile lor', async ({ request }) => {
    const raspuns = await request.get('/')
    expect(raspuns.status()).toBe(200)
    const html = await raspuns.text()
    expect(html).toMatch(/<nav aria-label="Meniul principal"><ul[^>]*>/)
    for (const l of ['Acasă', 'Funcționalități']) expect(html, l).toContain('>' + l + '<')
    expect(html).toMatch(/<footer[^>]*>/)
    // Suprapunerile nu sunt in HTML-ul servit: se deschid numai la cerere.
    expect(html).not.toContain('data-sertar=""')
    expect(html).not.toContain('aria-label="' + PALETA.eticheta + '"')
  })
})
