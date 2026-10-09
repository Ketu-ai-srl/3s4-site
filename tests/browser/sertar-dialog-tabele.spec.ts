import type { Page } from '@playwright/test'
import { expect, test } from './ajutor/baza'
import { pornesteCopia3sMd, type Copie3sMd } from './ajutor/copie-3s-md'
import { ANTET } from '../../src/content/navigatie'

/**
 * Lista functionala din auditul din 09.10 (felia 151), masurata in browser:
 *
 *  (a) SERTARUL MOBIL deschis la 768 ramanea deschis cand fereastra trecea la 1440: se vedeau simultan meniul desktop
 *      si sertarul, iar `body` ramanea cu `overflow: hidden` (derularea blocata) pana la clicul pe X. Acum sertarul se
 *      inchide la trecerea peste pragul antetului mobil (1200 px) si derularea revine. Pe build-ul RO al probelor.
 *  (c) PALETA deschisa din Ctrl K (focus pe BODY) intorcea focusul pe BODY dupa Escape. Acum il intoarce pe butonul de
 *      cautare vizibil la latimea curenta. Pe build-ul RO al probelor.
 *  (b) DIALOGUL "Setari cookie-uri" la 390: tabelul cookie-urilor avea 352 px (RO) si 370 px (EN) intr-un loc de circa
 *      300, deci corpul panoului se derula orizontal (27 si 44 px). Acum incape; la 768 si 1440 regulile raman cele
 *      de dinainte. Pe copia 3s.md cu analitica proprie pornita (numai acolo exista dialogul).
 *  (d) TABELELE JURIDICE derulabile la 390: zona are rol `region`, `tabindex="0"` si numele din titlul tabelului, iar
 *      semnul de derulare (umbra la marginea dreapta) e mai lat si mai inchis; la 768 tabelele incap, deci zona nu are
 *      nici `tabindex`, nici umbra. Pe aceeasi copie (documentele juridice exista numai cu operator).
 *
 * `innerWidth` se citeste dupa fiecare redimensionare si se scrie in jurnal.
 *
 * MARTORI. POZITIVI: (a) detectorul vede sertarul deschis si derularea blocata la 768, inainte de redimensionare;
 * (b) regulile vechi ale dialogului, repuse in pagina, fac din nou corpul sa se deruleze orizontal; (d) o zona careia
 * i se scoate numele nu mai e gasita dupa nume. NEGATIVI: (a) de la 390 la 768 (tot sub prag) sertarul ramane deschis;
 * (c) deschisa din buton, paleta intoarce focusul pe acel buton, ca inainte; (d) la 768 nicio zona nu primeste
 * `tabindex` sau umbra.
 */

const UMAMI_FICTIV = { UMAMI_URL: 'http://127.0.0.1:' + 9, UMAMI_WEBSITE_ID: ['0c0a1b2c', '3d4e', '4f5a', '8b6c', '7d8e9f0a1b2c'].join('-') }

/** Asteapta hidratarea antetului: ascultatorii (Ctrl K, redimensionarea) exista abia dupa ea. */
async function hidratat(page: Page): Promise<void> {
  await page.waitForFunction(() => {
    const b = document.querySelector('header button')
    return b !== null && Object.keys(b).some((k) => k.startsWith('__react'))
  })
}

async function stareSertar(page: Page) {
  return page.evaluate(() => ({
    latime: window.innerWidth,
    sertar: document.querySelectorAll('[data-sertar]').length,
    fundal: document.querySelectorAll('[data-sertar-fundal]').length,
    overflow: getComputedStyle(document.body).overflow,
  }))
}

test.describe('(a) sertarul mobil la trecerea peste pragul antetului', () => {
  test.use({ viewport: { width: 768, height: 900 } })

  test('martor POZITIV: la 768, cu sertarul deschis, detectorul vede sertarul si derularea blocata', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' })
    await hidratat(page)
    await page.locator('[data-hamburger]').click()
    await expect(page.locator('[data-sertar]')).toHaveCount(1)
    const s = await stareSertar(page)
    console.log('[f151 a] deschis la 768 ' + JSON.stringify(s))
    expect(s.latime).toBe(768)
    expect(s).toMatchObject({ sertar: 1, fundal: 1, overflow: 'hidden' })
  })

  for (const cale of ['/', '/preturi']) {
    test(cale + ': deschis la 768, apoi 1440: sertarul se inchide si derularea revine; inapoi la 390 ramane inchis', async ({ page }) => {
      await page.goto(cale, { waitUntil: 'networkidle' })
      await hidratat(page)
      await page.locator('[data-hamburger]').click()
      await expect(page.locator('[data-sertar]')).toHaveCount(1)
      await page.setViewportSize({ width: 1440, height: 900 })
      await expect(page.locator('[data-sertar]')).toHaveCount(0)
      const s = await stareSertar(page)
      console.log('[f151 a] ' + cale + ' dupa 1440 ' + JSON.stringify(s))
      expect(s.latime).toBe(1440)
      expect(s).toMatchObject({ sertar: 0, fundal: 0 })
      expect(s.overflow).not.toBe('hidden')
      await page.setViewportSize({ width: 390, height: 844 })
      await expect.poll(() => page.evaluate(() => window.innerWidth)).toBe(390)
      const jos = await stareSertar(page)
      expect(jos).toMatchObject({ latime: 390, sertar: 0 })
      expect(jos.overflow).not.toBe('hidden')
    })
  }

  test('martor NEGATIV: deschis la 390, apoi 768 (tot sub prag): sertarul ramane deschis', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/', { waitUntil: 'networkidle' })
    await hidratat(page)
    await page.locator('[data-hamburger]').click()
    await expect(page.locator('[data-sertar]')).toHaveCount(1)
    await page.setViewportSize({ width: 768, height: 900 })
    await expect.poll(() => page.evaluate(() => window.innerWidth)).toBe(768)
    const s = await stareSertar(page)
    console.log('[f151 a] 390 -> 768 ' + JSON.stringify(s))
    expect(s).toMatchObject({ sertar: 1, overflow: 'hidden' })
  })
})

test.describe('(c) focusul dupa Escape in paleta de cautare', () => {
  const butonVizibil = (page: Page) => page.locator('header button:visible[aria-label="' + ANTET.cautare.eticheta + '"]')

  for (const latime of [1440, 390]) {
    test('la ' + latime + ': deschisa din Ctrl K, Escape intoarce focusul pe butonul de cautare vizibil', async ({ page }) => {
      await page.setViewportSize({ width: latime, height: 900 })
      await page.goto('/', { waitUntil: 'networkidle' })
      await hidratat(page)
      expect(await page.evaluate(() => document.activeElement === document.body), 'controlul: focusul pleaca de pe BODY').toBe(true)
      await page.keyboard.press('Control+k')
      await expect(page.locator('[data-paleta]')).toHaveCount(1)
      await page.keyboard.press('Escape')
      await expect(page.locator('[data-paleta]')).toHaveCount(0)
      await expect(butonVizibil(page)).toHaveCount(1)
      await expect(butonVizibil(page)).toBeFocused()
      console.log('[f151 c] ' + latime + ' innerWidth ' + (await page.evaluate(() => window.innerWidth)) + ' focus pe ' + (await page.evaluate(() => document.activeElement?.getAttribute('aria-label'))))
    })
  }

  test('martor NEGATIV: deschisa din butonul de cautare, Escape intoarce focusul pe acelasi buton, ca inainte', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('/', { waitUntil: 'networkidle' })
    await hidratat(page)
    await butonVizibil(page).click()
    await expect(page.locator('[data-paleta]')).toHaveCount(1)
    await page.keyboard.press('Escape')
    await expect(butonVizibil(page)).toBeFocused()
  })
})

test.describe('copia 3s.md cu analitica proprie: dialogul de cookie-uri si tabelele juridice', () => {
  let copie: Copie3sMd

  test.beforeAll(async () => {
    test.setTimeout(600_000)
    copie = await pornesteCopia3sMd(UMAMI_FICTIV)
  })

  test.afterAll(async () => {
    await copie?.opreste()
  })

  /** Deschide dialogul de setari din banner si toate categoriile lui; intoarce masura corpului si a tabelelor. */
  async function dialogDeschis(page: Page, cale: string) {
    await page.goto(copie.baza + cale, { waitUntil: 'networkidle' })
    await hidratat(page)
    await page.locator('button:visible', { hasText: /^(Setări cookie-uri|Cookie settings)$/ }).last().click()
    const dialog = page.locator('dialog[open][data-consimtamant-setari]')
    await expect(dialog).toHaveCount(1)
    for (let i = 0; i < 6; i++) {
      const inchise = dialog.locator('button[aria-expanded="false"]')
      if ((await inchise.count()) === 0) break
      await inchise.first().click()
    }
    await expect(dialog.locator('button[aria-expanded="false"]')).toHaveCount(0)
  }

  const masoaraDialogul = (page: Page) =>
    page.evaluate(() => {
      const d = document.querySelector('dialog[open][data-consimtamant-setari]') as HTMLElement
      const corp = [...d.querySelectorAll<HTMLElement>('*')].find((e) => getComputedStyle(e).overflowY === 'auto')!
      const p = d.getBoundingClientRect()
      const tabele = [...d.querySelectorAll('table')].filter((t) => t.offsetParent !== null)
      return {
        latime: window.innerWidth,
        depasire: corp.scrollWidth - corp.clientWidth,
        tabele: tabele.length,
        iesite: tabele.filter((t) => { const r = t.getBoundingClientRect(); return r.right > p.right + 0.5 || r.left < p.left - 0.5 }).length,
        retragere: tabele.map((t) => getComputedStyle(t.parentElement as HTMLElement).paddingLeft),
        nume: tabele.map((t) => getComputedStyle(t.querySelector('tbody td') as HTMLElement).whiteSpace),
      }
    })

  for (const cale of ['/', '/ro']) {
    test('(b) ' + cale + ' la 390: tabelele din Setari cookie-uri incap in panou, corpul nu se deruleaza orizontal', async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 })
      await dialogDeschis(page, cale)
      const m = await masoaraDialogul(page)
      console.log('[f151 b] ' + cale + ' 390 ' + JSON.stringify(m))
      expect(m.latime).toBe(390)
      expect(m.tabele, 'controlul: dialogul are tabele de masurat').toBeGreaterThan(0)
      expect(m.depasire).toBeLessThanOrEqual(0)
      expect(m.iesite).toBe(0)
    })

    test('(b) ' + cale + ' la 768 si 1440: regulile dialogului raman cele de dinainte, fara depasire', async ({ page }) => {
      for (const latime of [768, 1440]) {
        await page.setViewportSize({ width: latime, height: 900 })
        await dialogDeschis(page, cale)
        const m = await masoaraDialogul(page)
        console.log('[f151 b] ' + cale + ' ' + latime + ' ' + JSON.stringify(m))
        expect(m.latime).toBe(latime)
        expect(m.tabele).toBeGreaterThan(0)
        expect(m.depasire).toBeLessThanOrEqual(0)
        expect(m.retragere.every((r) => r === '50px'), 'retragerea detaliilor: ' + m.retragere.join(',')).toBe(true)
        expect(m.nume.every((w) => w === 'nowrap'), 'numele cookie-ului pe un rand: ' + m.nume.join(',')).toBe(true)
      }
    })
  }

  test('(b) martor POZITIV: regulile vechi repuse in pagina la 390 fac din nou corpul dialogului sa se deruleze orizontal', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await dialogDeschis(page, '/')
    await page.addStyleTag({
      content:
        'dialog[data-consimtamant-setari] div:has(> table) { padding-left: 50px !important } ' +
        'dialog[data-consimtamant-setari] tbody td:first-child { white-space: nowrap !important }',
    })
    const m = await masoaraDialogul(page)
    console.log('[f151 b] martor pozitiv ' + JSON.stringify(m))
    expect(m.depasire).toBeGreaterThan(0)
  })

  /** Zonele derulabile ale tabelelor din <main>, cu numele lor si semnul de derulare. */
  const zone = (page: Page) =>
    page.evaluate(() =>
      [...document.querySelectorAll<HTMLElement>('main [data-zona-derulabila]')].map((z) => {
        const id = z.getAttribute('aria-labelledby')
        const st = getComputedStyle(z)
        return {
          rol: z.getAttribute('role'),
          tabindex: z.getAttribute('tabindex'),
          nume: (id ? document.getElementById(id)?.textContent : z.getAttribute('aria-label')) ?? '',
          deruleaza: z.scrollWidth > z.clientWidth + 1,
          umbra: st.backgroundImage.includes('gradient'),
          marime: st.backgroundSize,
        }
      }),
    )

  for (const cale of ['/ro/juridic/confidentialitate', '/legal/privacy', '/ro/juridic/cookies']) {
    test('(d) ' + cale + ' la 390: zona fiecarui tabel derulabil are rol, tabindex 0, numele titlului si umbra de 28 px', async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 })
      await page.goto(copie.baza + cale, { waitUntil: 'networkidle' })
      await hidratat(page)
      await expect(page.locator('main [data-zona-derulabila][tabindex="0"]').first()).toBeAttached()
      const z = (await zone(page)).filter((x) => x.deruleaza)
      console.log('[f151 d] ' + cale + ' 390 innerWidth ' + (await page.evaluate(() => window.innerWidth)) + ' ' + JSON.stringify(z))
      expect(z.length, 'controlul: pagina are tabele care se deruleaza la 390').toBeGreaterThan(0)
      for (const x of z) {
        expect(x).toMatchObject({ rol: 'region', tabindex: '0', umbra: true })
        expect(x.nume.trim().length).toBeGreaterThan(0)
        expect(x.marime).toContain('28px')
        await expect(page.getByRole('region', { name: x.nume, exact: true })).not.toHaveCount(0)
      }
    })
  }

  test('(d) martor POZITIV: o zona careia i se scoate numele nu mai e gasita dupa nume', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto(copie.baza + '/legal/privacy', { waitUntil: 'networkidle' })
    await hidratat(page)
    const [prima] = (await zone(page)).filter((x) => x.deruleaza)
    await expect(page.getByRole('region', { name: prima.nume, exact: true })).toHaveCount(1)
    await page.evaluate(() => document.querySelector('main [data-zona-derulabila]')?.removeAttribute('aria-labelledby'))
    await expect(page.getByRole('region', { name: prima.nume, exact: true })).toHaveCount(0)
  })

  test('(d) martor NEGATIV: la 768 tabelele juridice incap, deci nicio zona nu are tabindex sau umbra', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 900 })
    await page.goto(copie.baza + '/ro/juridic/confidentialitate', { waitUntil: 'networkidle' })
    await hidratat(page)
    const z = await zone(page)
    console.log('[f151 d] 768 innerWidth ' + (await page.evaluate(() => window.innerWidth)) + ' ' + JSON.stringify(z))
    expect(z.length).toBeGreaterThan(0)
    for (const x of z) expect(x).toMatchObject({ deruleaza: false, tabindex: null, umbra: false })
  })
})
