import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'
import stamp from '../../src/content/_stamp.json'
import { CULOARE_MARCA, NUME_SCURT_MARCA } from '../../src/components/global/culoare-marca'
import { citesteArticolele } from '../../src/content/blog/conducta'
import { caleArticol } from '../../src/content/blog/registru'
import { CAI_EXISTENTE } from '../../src/content/cai'
import { BRAND } from '../../src/content/entitate'
import { RADACINA, rutePublice } from './ajutor/proiect'

/**
 * Livrarea valului S4 (plan §S4-5): ce se verifica o data, pe lotul final, pe toate rutele.
 *
 *   1. Completitudinea navigatiei PE PAGINA: in antet (cu meniurile lui), subsol, firul de pagina si
 *      harta site-ului, fiecare legatura interna randata duce la o cale din `CAI_EXISTENTE`, si
 *      niciuna nu e inerta (`data-tinta-lipsa`). Partea de date (lista legaturilor ascunse si
 *      motivele lor, paleta) e in tests/livrare-completitudine.test.ts.
 *   2. WCAG 2.5.8 (axe `target-size`, oprita implicit in axe 4.13, deci ceruta explicit) pe fiecare
 *      ruta, la 1440 si la 390. Tintele turului din erou in scena 3D au proba lor, dupa lansare, in
 *      tests/browser/erou.spec.ts.
 *   3. Zona derulabila a tabelelor (`TabelDate`): la 390 are rol, nume si `tabindex=0`.
 *   4. Marca: manifestul, `theme-color`, iconitele si imaginea Open Graph de 1200 x 630.
 *   5. Marcajul `/stamp` = valoarea din `src/content/_stamp.json`.
 */

const rute = rutePublice()
const LA_1440 = { width: 1440, height: 900 }
const LA_390 = { width: 390, height: 844 }

/** Zonele de navigatie ale paginii, cu legaturile interne si elementele inerte din fiecare. */
async function navigatiaPaginii(page: Page) {
  return page.evaluate(() => {
    const zone: Record<string, string> = {
      antet: 'header',
      subsol: 'footer',
      fir: 'nav[aria-label="Fir de navigare"]',
      harta: '[data-harta-grupe]',
    }
    const rezultat: { zona: string; cai: string[]; inerte: string[] }[] = []
    for (const [zona, selector] of Object.entries(zone)) {
      const cai: string[] = []
      const inerte: string[] = []
      for (const el of document.querySelectorAll(selector)) {
        for (const a of el.querySelectorAll('a[href]')) {
          const href = a.getAttribute('href') ?? ''
          if (href.startsWith('/')) cai.push(href.split(/[?#]/)[0] || '/')
        }
        for (const i of el.querySelectorAll('[data-tinta-lipsa]')) inerte.push(i.getAttribute('data-tinta-lipsa') ?? '')
      }
      rezultat.push({ zona, cai, inerte })
    }
    return { innerWidth: window.innerWidth, zone: rezultat }
  })
}

function defecteNavigatie(m: Awaited<ReturnType<typeof navigatiaPaginii>>): string[] {
  const defecte: string[] = []
  for (const z of m.zone) {
    for (const c of z.cai) if (!CAI_EXISTENTE.has(c)) defecte.push(z.zona + ': legatura spre ' + c)
    for (const i of z.inerte) defecte.push(z.zona + ': legatura inerta spre ' + i)
  }
  return defecte
}

async function tinteMici(page: Page): Promise<string[]> {
  const r = await new AxeBuilder({ page }).withRules(['target-size']).analyze()
  return r.violations.flatMap((v) => v.nodes.map((n) => v.id + ' ' + n.target.join(' ')))
}

test.describe('livrare: completitudinea navigatiei pe fiecare pagina', () => {
  test.use({ viewport: LA_1440 })

  for (const ruta of rute) {
    test('pagina reala ' + ruta + ': antet, subsol, fir si harta duc numai la cai existente', async ({ page }) => {
      await page.goto(ruta, { waitUntil: 'load' })
      const m = await navigatiaPaginii(page)
      const numar = m.zone.map((z) => z.zona + ' ' + z.cai.length).join(', ')
      console.log('[livrare navigatie] ' + ruta + ' innerWidth ' + m.innerWidth + ' | ' + numar)
      expect(m.zone.find((z) => z.zona === 'antet')?.cai.length ?? 0).toBeGreaterThan(5)
      expect(m.zone.find((z) => z.zona === 'subsol')?.cai.length ?? 0).toBeGreaterThan(20)
      expect(defecteNavigatie(m)).toEqual([])
    })
  }

  test('martor POZITIV: o legatura moarta in subsol si una inerta in fir sunt prinse', async ({ page }) => {
    await page.goto('/securitate', { waitUntil: 'load' })
    await page.evaluate(() => {
      const a = document.createElement('a')
      a.href = '/nu-exista-la-livrare'
      a.textContent = 'x'
      document.querySelector('footer')?.appendChild(a)
      const s = document.createElement('span')
      s.setAttribute('data-tinta-lipsa', '/nici-asta')
      document.querySelector('nav[aria-label="Fir de navigare"]')?.appendChild(s)
    })
    const defecte = defecteNavigatie(await navigatiaPaginii(page))
    expect(defecte).toEqual(['subsol: legatura spre /nu-exista-la-livrare', 'fir: legatura inerta spre /nici-asta'])
  })

  test('martor NEGATIV: harta site-ului reala are legaturi si toate sunt curate', async ({ page }) => {
    await page.goto('/harta-site', { waitUntil: 'load' })
    const m = await navigatiaPaginii(page)
    expect(m.zone.find((z) => z.zona === 'harta')?.cai.length ?? 0).toBeGreaterThan(30)
    expect(m.zone.find((z) => z.zona === 'fir')?.cai.length ?? 0).toBeGreaterThan(0)
    expect(defecteNavigatie(m)).toEqual([])
  })
})

test.describe('livrare: tintele de cel putin 24 x 24 (WCAG 2.5.8, axe target-size)', () => {
  for (const fereastra of [LA_1440, LA_390]) {
    for (const ruta of rute) {
      test('pagina reala ' + ruta + ' la ' + fereastra.width + ': axe target-size curat', async ({ page }) => {
        await page.setViewportSize(fereastra)
        await page.goto(ruta, { waitUntil: 'networkidle' })
        const l = await page.evaluate(() => window.innerWidth)
        const mici = await tinteMici(page)
        console.log('[livrare tinte] ' + ruta + ' innerWidth ' + l + ' | incalcari ' + (mici.join('; ') || '0'))
        expect(l).toBe(fereastra.width)
        expect(mici).toEqual([])
      })
    }
  }

  test('martor POZITIV: doua butoane de 14 x 14 lipite unul de altul sunt prinse', async ({ page }) => {
    await page.setViewportSize(LA_1440)
    await page.goto('/securitate', { waitUntil: 'load' })
    await page.evaluate(() => {
      const c = document.createElement('div')
      c.style.cssText = 'position:fixed;left:40px;top:300px;display:flex;z-index:99999'
      for (const t of ['a', 'b']) {
        const b = document.createElement('button')
        b.type = 'button'
        b.setAttribute('aria-label', 'martor ' + t)
        b.style.cssText = 'width:14px;height:14px;padding:0;margin:0;border:0;background:#1a1a1a'
        c.appendChild(b)
      }
      document.body.appendChild(c)
    })
    const mici = await tinteMici(page)
    expect(mici.length).toBeGreaterThanOrEqual(2)
  })
})

test.describe('livrare: zona derulabila a tabelelor (TabelDate)', () => {
  const articole = citesteArticolele(RADACINA).map(caleArticol)

  test('martor NEGATIV: la 390, fiecare tabel mai lat decat coloana sta intr-o zona cu rol, nume si tabindex; axe e curat', async ({ page }) => {
    await page.setViewportSize(LA_390)
    let derulabile = 0
    for (const cale of articole) {
      await page.goto(cale, { waitUntil: 'networkidle' })
      const zone = await page.evaluate(() =>
        [...document.querySelectorAll('main [data-zona-derulabila]')].map((z) => {
          const el = z as HTMLElement
          const numitaDe = el.getAttribute('aria-labelledby')
          const nume = numitaDe ? (document.getElementById(numitaDe)?.textContent ?? '').trim() : (el.getAttribute('aria-label') ?? '')
          return {
            derulabila: el.scrollWidth > el.clientWidth + 1,
            rol: el.getAttribute('role'),
            nume,
            tabindex: el.getAttribute('tabindex'),
          }
        }),
      )
      for (const z of zone.filter((x) => x.derulabila)) {
        derulabile++
        expect(z.rol, cale).toBe('region')
        expect(z.nume.length, cale).toBeGreaterThan(0)
        expect(z.tabindex, cale).toBe('0')
      }
      const r = await new AxeBuilder({ page }).include('main').withRules(['scrollable-region-focusable']).analyze()
      expect(r.violations.map((v) => v.id), cale).toEqual([])
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), cale).toBe(true)
    }
    console.log('[livrare tabele 390] articole ' + articole.length + ' | zone derulabile ' + derulabile)
    expect(derulabile).toBeGreaterThan(0)
  })

  test('la 1440 tabelele incap, iar zona lor nu mai e oprire de tabulare', async ({ page }) => {
    await page.setViewportSize(LA_1440)
    await page.goto(articole[0], { waitUntil: 'networkidle' })
    const zone = await page.evaluate(() =>
      [...document.querySelectorAll('main [data-zona-derulabila]')].map((z) => ({
        derulabila: (z as HTMLElement).scrollWidth > (z as HTMLElement).clientWidth + 1,
        tabindex: z.getAttribute('tabindex'),
      })),
    )
    expect(zone.length).toBeGreaterThan(0)
    for (const z of zone) expect(z).toEqual({ derulabila: false, tabindex: null })
  })

  test('martor POZITIV: zona derulabila fara tabindex e prinsa de axe', async ({ page }) => {
    await page.setViewportSize(LA_390)
    let prinsa = false
    for (const cale of articole) {
      await page.goto(cale, { waitUntil: 'networkidle' })
      const scoase = await page.evaluate(() => {
        let n = 0
        for (const z of document.querySelectorAll('main [data-zona-derulabila]')) {
          const el = z as HTMLElement
          if (el.scrollWidth > el.clientWidth + 1) {
            el.removeAttribute('tabindex')
            n++
          }
        }
        return n
      })
      if (scoase === 0) continue
      const r = await new AxeBuilder({ page }).include('main').withRules(['scrollable-region-focusable']).analyze()
      prinsa = r.violations.some((v) => v.id === 'scrollable-region-focusable')
      break
    }
    expect(prinsa).toBe(true)
  })
})

test.describe('livrare: marca in navigator', () => {
  test('manifestul: numele marcii, numele scurt, culoarea din tokeni si iconitele raspund', async ({ page, request }) => {
    await page.goto('/', { waitUntil: 'load' })
    const legatura = await page.locator('link[rel="manifest"]').getAttribute('href')
    expect(legatura).toBe('/manifest.webmanifest')
    const culoare = await page.locator('meta[name="theme-color"]').getAttribute('content')
    expect(culoare).toBe(CULOARE_MARCA)
    const r = await request.get('/manifest.webmanifest')
    expect(r.status()).toBe(200)
    const m = (await r.json()) as { name: string; short_name: string; theme_color: string; icons: { src: string; type: string }[] }
    expect(m.name).toBe(BRAND.nume)
    expect(m.name).toBe('3S Scan Store Solve')
    expect(m.short_name).toBe(NUME_SCURT_MARCA)
    expect(m.theme_color).toBe(CULOARE_MARCA)
    expect(m.icons.length).toBe(2)
    for (const i of m.icons) {
      const ri = await request.get(i.src)
      console.log('[livrare manifest] ' + i.src + ' ' + ri.status() + ' ' + ri.headers()['content-type'])
      expect(ri.status(), i.src).toBe(200)
      expect(ri.headers()['content-type'] ?? '', i.src).toContain(i.type === 'image/x-icon' ? 'icon' : i.type)
    }
  })

  test('imaginea Open Graph: PNG de 1200 x 630', async ({ request }) => {
    const r = await request.get('/opengraph-image')
    expect(r.status()).toBe(200)
    expect(r.headers()['content-type']).toContain('image/png')
    const b = await r.body()
    // Antetul PNG: semnatura de 8 octeti, apoi IHDR cu latimea si inaltimea pe 4 octeti fiecare.
    expect(b.subarray(1, 4).toString('latin1')).toBe('PNG')
    expect([b.readUInt32BE(16), b.readUInt32BE(20)]).toEqual([1200, 630])
  })

  test('marcajul /stamp raspunde cu valoarea din commit', async ({ request }) => {
    const r = await request.get('/stamp')
    expect(r.status()).toBe(200)
    const text = await r.text()
    console.log('[livrare stamp] ' + text)
    expect(text).toBe(stamp.marcaj)
    expect(text).toMatch(/^E\d+-\d{4}$/)
  })
})
