import { expect, test, type Browser, type Page } from '@playwright/test'
import { CAUTARE } from '../../src/content/promo'
import { masoaraAccesibilitatea, masoaraDerapaj } from './ajutor/detectori'
import { nemasurat } from './ajutor/proiect'

/**
 * Paginile promo ale feliei `promo` in navigator: `/promo` si `/promo/scanare-cu-telefonul` (fisele promo.md
 * si promo__scanare-cu-telefonul.md, sablonul "cinema-promo").
 *
 * CE MASOARA, cu `innerWidth` CITIT din pagina la fiecare latime:
 *   - starea statica la miscare redusa: niciun interior de sectiune stins, micsorat sau estompat, scena
 *     bonului statica, intrebarea intreaga, contorul la valoarea finala, si dupa derularea pana la capat;
 *   - cu miscare: fiecare sectiune ajunge la varf (interior la opacitate 1, scara 1) cand incepe la 10% din
 *     fereastra, INCLUSIV ultima (abaterea de la referinta, unde CTA-ul ramanea la e = 0,875); sub fereastra
 *     o sectiune e stinsa (martorul care arata ca formula chiar ruleaza);
 *   - tastarea intrebarii (porneste la vedere, se termina cu textul intreg) si scena bonului (linia trece o
 *     data, cele 8 randuri ajung vizibile);
 *   - axe la 1440 si 390, la miscare redusa si cu miscare, pe fiecare sectiune adusa la varf;
 *   - derapajul orizontal la 390;
 *   - martorul negativ: la miscare redusa aceeasi sectiune de sub fereastra ramane vizibila;
 *   - bugetele de la 390 cu procesorul incetinit de 4 ori: LCP <= 2500 ms si CLS <= 0,1 (mediana a 3
 *     incarcari), cu martor pozitiv pe CLS.
 */

const PAGINI = ['/promo', '/promo/scanare-cu-telefonul'] as const
const LATIMI = [1440, 390] as const

async function deschide(page: Page, cale: string, latime: number, inaltime = latime === 390 ? 844 : 900): Promise<void> {
  await page.setViewportSize({ width: latime, height: inaltime })
  await page.goto(cale, { waitUntil: 'networkidle' })
  expect(await page.evaluate(() => window.innerWidth), 'innerWidth CITIT').toBe(latime)
}

type StareInterior = { nume: string; opacitate: number; transform: string; filtru: string }

async function interioare(page: Page): Promise<StareInterior[]> {
  return page.evaluate(() =>
    [...document.querySelectorAll('main section[data-sectiune]')].map((s) => {
      const i = s.querySelector('[data-interior-promo]') as HTMLElement
      const cs = getComputedStyle(i)
      return { nume: s.getAttribute('data-sectiune') ?? '?', opacitate: Number(cs.opacity), transform: cs.transform, filtru: cs.filter }
    }),
  )
}

// --- starea statica ------------------------------------------------------------------------------

for (const latime of LATIMI) {
  test.describe('starea statica, miscare redusa, ' + latime, () => {
    for (const cale of PAGINI) {
      test(cale + ': toate sectiunile vizibile, scena si textele in forma finala, si dupa derulare', async ({ page }) => {
        await page.emulateMedia({ reducedMotion: 'reduce' })
        await deschide(page, cale, latime)
        for (const y of [0, 100000]) {
          await page.evaluate((v) => window.scrollTo({ top: v, behavior: 'instant' }), y)
          await page.waitForTimeout(300)
          const st = await interioare(page)
          expect(st.length, 'sectiuni gasite').toBeGreaterThanOrEqual(7)
          for (const s of st) {
            expect(s.opacitate, s.nume).toBe(1)
            expect(['none', 'matrix(1, 0, 0, 1, 0, 0)'], s.nume + ' transform').toContain(s.transform)
            expect(s.filtru, s.nume).toBe('none')
          }
        }
        if (cale === '/promo') {
          await expect(page.locator('[data-tastare]')).toHaveAttribute('data-tastare', 'static')
          await expect(page.locator('[data-tastare]')).toContainText(CAUTARE.intrebare)
          await expect(page.locator('[data-numara]')).toHaveAttribute('data-numara', 'final')
        } else {
          await expect(page.locator('[data-scena]')).toHaveAttribute('data-scena', 'static')
          await expect(page.locator('[data-linie-scanare]')).toBeHidden()
        }
      })
    }
  })
}

test('martor NEGATIV: la miscare redusa, sectiunea de sub fereastra NU e stinsa (formula nu ruleaza fara miscare)', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await deschide(page, '/promo', 1440)
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }))
  await page.waitForTimeout(300)
  const st = await interioare(page)
  const sub = st.find((s) => s.nume === 'haos')
  expect(sub, 'sectiunea haos gasita').toBeTruthy()
  // aceeasi pozitie care, cu miscare, da opacitate sub 0,05 (proba din "derularea, cu miscare")
  expect(sub?.opacitate).toBe(1)
})

// --- miscarea legata de derulare -----------------------------------------------------------------

/** Derulare care aduce varful sectiunii la `fractie` din fereastra; intoarce derularea ceruta si pe cea reala. */
async function aduLa(page: Page, nume: string, fractie: number): Promise<{ ceruta: number; reala: number }> {
  return page.evaluate(
    ([n, f]) => {
      const s = document.querySelector('main section[data-sectiune="' + n + '"]') as HTMLElement
      const ceruta = Math.round(s.getBoundingClientRect().top + window.scrollY - f * window.innerHeight)
      window.scrollTo({ top: ceruta, behavior: 'instant' })
      return { ceruta, reala: Math.round(window.scrollY) }
    },
    [nume, fractie] as const,
  )
}

async function stareSectiune(page: Page, nume: string): Promise<StareInterior> {
  await page.waitForTimeout(250)
  const toate = await interioare(page)
  const s = toate.find((x) => x.nume === nume)
  if (!s) throw new Error('nu gasesc sectiunea ' + nume)
  return s
}

for (const latime of LATIMI) {
  test.describe('derularea, cu miscare, ' + latime, () => {
    for (const cale of PAGINI) {
      test(cale + ': fiecare sectiune ajunge la varf, ultima inclusiv; sub fereastra e stinsa', async ({ page }) => {
        await page.emulateMedia({ reducedMotion: 'no-preference' })
        await deschide(page, cale, latime)
        const nume = (await interioare(page)).map((s) => s.nume).filter((n) => n !== 'erou')
        expect(nume.length).toBeGreaterThanOrEqual(6)

        // martor: prima sectiune de dupa erou, cu pagina la 0, e sub 90% din fereastra, deci stinsa
        await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }))
        const sub = await stareSectiune(page, nume[0])
        expect(sub.opacitate, 'martor: sectiune sub fereastra').toBeLessThan(0.05)

        for (const n of nume) {
          const d = await aduLa(page, n, 0.1)
          expect(Math.abs(d.reala - d.ceruta), n + ': derularea ceruta ' + d.ceruta + ' / reala ' + d.reala).toBeLessThanOrEqual(1)
          const s = await stareSectiune(page, n)
          expect(s.opacitate, n + ' la varf').toBeGreaterThan(0.995)
          expect(s.filtru === 'none' || s.filtru === '', n + ' fara estompare').toBe(true)
        }

        // iesirea: o sectiune urcata 0,8 vh peste varf e stinsa si estompata (7 px)
        const n = nume[1]
        await aduLa(page, n, 0.1 - 0.8)
        const iesita = await stareSectiune(page, n)
        expect(iesita.opacitate).toBeLessThan(0.05)
        expect(iesita.filtru).toMatch(/blur\((6\.9|7)/)
      })
    }

    for (const cale of PAGINI) {
      test(cale + ': ultima sectiune ajunge la varf si FARA subsol; martor: la 80svh nu ajunge', async ({ page }) => {
        await page.emulateMedia({ reducedMotion: 'no-preference' })
        await deschide(page, cale, latime)
        // subsolul (din layout) scos din flux: varful ultimei sectiuni nu mai poate veni din spatiul lui
        await page.evaluate(() => document.querySelectorAll('footer').forEach((f) => ((f as HTMLElement).style.display = 'none')))
        const ultima = (await interioare(page)).map((s) => s.nume).at(-1) ?? ''
        const d = await aduLa(page, ultima, 0.1)
        expect(Math.abs(d.reala - d.ceruta), ultima + ' fara subsol: ceruta ' + d.ceruta + ' / reala ' + d.reala).toBeLessThanOrEqual(1)
        const s = await stareSectiune(page, ultima)
        expect(s.opacitate, ultima + ' la varf, fara subsol').toBeGreaterThan(0.995)

        // martor: aceeasi sectiune adusa la forma referintei (80svh, padding simetric) nu mai ajunge la varf
        await page.evaluate(() => {
          const t = [...document.querySelectorAll('main section[data-sectiune]')].at(-1) as HTMLElement
          t.style.minHeight = '80svh'
          t.style.paddingBottom = getComputedStyle(t).paddingTop
        })
        const m = await aduLa(page, ultima, 0.1)
        expect(m.ceruta - m.reala, 'martor: la 80svh derularea se opreste sub varf').toBeGreaterThan(20)
      })
    }

    test('/promo: intrebarea se tasteaza la vedere si se termina intreaga', async ({ page }) => {
      await page.emulateMedia({ reducedMotion: 'no-preference' })
      await deschide(page, '/promo', latime)
      const tastare = page.locator('[data-tastare]')
      await expect(tastare).toHaveAttribute('data-tastare', 'tasteaza')
      await aduLa(page, 'cautare', 0.1)
      await expect(tastare).toHaveAttribute('data-tastare', 'gata', { timeout: 5000 })
      await expect(tastare).toContainText(CAUTARE.intrebare)
    })

    test('/promo/scanare-cu-telefonul: scena porneste o data, linia trece, cele 8 randuri ajung vizibile', async ({ page }) => {
      await page.emulateMedia({ reducedMotion: 'no-preference' })
      await deschide(page, '/promo/scanare-cu-telefonul', latime)
      const scena = page.locator('[data-scena]')
      await expect(scena).toHaveAttribute('data-scena', 'asteapta')
      const randuriInainte = await page.locator('[data-scena] dl > div').evaluateAll((r) => r.map((e) => Number(getComputedStyle(e).opacity)))
      expect(randuriInainte.length).toBe(8)
      expect(Math.max(...randuriInainte), 'martor: randurile ascunse inainte de vedere').toBe(0)
      await aduLa(page, 'scanare', 0.1)
      await expect(scena).toHaveAttribute('data-scena', 'in')
      const animatii = await page.locator('[data-linie-scanare]').evaluate((e) => e.getAnimations().map((a) => (a.effect?.getTiming().iterations ?? 0)))
      expect(animatii, 'linia de scanare: o singura trecere').toEqual([1])
      await page.waitForTimeout(2600)
      const randuri = await page.locator('[data-scena] dl > div').evaluateAll((r) => r.map((e) => Number(getComputedStyle(e).opacity)))
      expect(Math.min(...randuri)).toBe(1)
    })
  })
}

// --- accesibilitate si derapaj ---------------------------------------------------------------------

for (const latime of LATIMI) {
  for (const cale of PAGINI) {
    test('axe ' + latime + ' ' + cale + ': zero incalcari grave, la miscare redusa si cu fiecare sectiune la varf', async ({ page }) => {
      test.setTimeout(120_000)
      await page.emulateMedia({ reducedMotion: 'reduce' })
      await deschide(page, cale, latime)
      const static_ = await masoaraAccesibilitatea(page)
      console.log('[axe ' + latime + ' ' + cale + ' static] reguli ' + static_.reguliRulate + ' | grave ' + JSON.stringify(static_.grave))
      expect(static_.grave).toEqual([])

      await page.emulateMedia({ reducedMotion: 'no-preference' })
      await page.reload({ waitUntil: 'networkidle' })
      const nume = (await interioare(page)).map((s) => s.nume)
      for (const n of nume) {
        if (n === 'erou') await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }))
        else await aduLa(page, n, 0.1)
        // tastarea, numaratoarea si randurile bonului se termina in ~2,6 s
        await page.waitForTimeout(n === 'scanare' || n === 'cautare' || n === 'contoare' ? 2800 : 300)
        const m = await masoaraAccesibilitatea(page)
        expect(m.grave, n).toEqual([])
      }
    })
  }

  if (latime === 390) {
    for (const cale of PAGINI) {
      test('derapaj 390 ' + cale + ': scrollWidth <= innerWidth', async ({ page }) => {
        await page.goto(cale, { waitUntil: 'networkidle' })
        const m = await masoaraDerapaj(page, 390)
        console.log('[derapaj ' + cale + '] ' + JSON.stringify(m))
        expect(m.innerWidth).toBe(390)
        expect(m.scrollWidth, m.vinovati.join(', ')).toBeLessThanOrEqual(m.innerWidth)
      })
    }
  }
}

// --- bugetele de la 390, procesor incetinit de 4 ori ---------------------------------------------

const INCETINIRE_CPU = 4
const PRAG_LCP_MS = 2500
const PRAG_CLS = 0.1

type Incarcare = { lcp: number; element: string; cls: number; latime: number }

async function incarcare(browser: Browser, baza: string, cale: string, deplasareTarzie = false): Promise<Incarcare> {
  const context = await browser.newContext({ baseURL: baza, viewport: { width: 390, height: 844 }, reducedMotion: 'no-preference' })
  try {
    await context.addInitScript((deplasare: boolean) => {
      const w = window as unknown as { __lcp: { t: number; el: string }[]; __cls: number }
      w.__lcp = []
      w.__cls = 0
      new PerformanceObserver((lista) => {
        for (const e of lista.getEntries() as (PerformanceEntry & { element?: Element | null })[]) {
          const el = e.element
          w.__lcp.push({ t: e.startTime, el: el ? el.tagName.toLowerCase() + ' ' + (el.textContent ?? '').trim().slice(0, 30) : '?' })
        }
      }).observe({ type: 'largest-contentful-paint', buffered: true })
      new PerformanceObserver((lista) => {
        for (const e of lista.getEntries() as (PerformanceEntry & { value: number; hadRecentInput: boolean })[]) {
          if (!e.hadRecentInput) w.__cls += e.value
        }
      }).observe({ type: 'layout-shift', buffered: true })
      if (deplasare) {
        window.addEventListener('load', () => {
          setTimeout(() => {
            const bloc = document.createElement('div')
            bloc.style.height = '300px'
            document.querySelector('main')?.prepend(bloc)
          }, 1000)
        })
      }
    }, deplasareTarzie)
    const page = await context.newPage()
    const cdp = await context.newCDPSession(page)
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: INCETINIRE_CPU })
    await page.goto(cale, { waitUntil: 'load' })
    await page.waitForTimeout(5000)
    const latime = await page.evaluate(() => window.innerWidth)
    const r = await page.evaluate(() => {
      const w = window as unknown as { __lcp: { t: number; el: string }[]; __cls: number }
      const ultim = w.__lcp[w.__lcp.length - 1]
      return { lcp: ultim ? ultim.t : -1, element: ultim ? ultim.el : '(niciun LCP)', cls: w.__cls }
    })
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: 1 })
    return { ...r, latime }
  } finally {
    await context.close()
  }
}

test.describe('bugetele de la 390, procesor incetinit de 4 ori', () => {
  for (const cale of PAGINI) {
    test(cale + ': LCP <= 2500 ms (mediana a 3 incarcari) si CLS <= 0,1', async ({ browser, baseURL }) => {
      test.setTimeout(150_000)
      const r: Incarcare[] = []
      for (let i = 0; i < 3; i++) r.push(await incarcare(browser, baseURL ?? '', cale))
      const lcp = r.map((x) => x.lcp).sort((a, b) => a - b)[1]
      const cls = Math.max(...r.map((x) => x.cls))
      console.log('[bugete ' + cale + '] innerWidth CITIT: ' + r.map((x) => x.latime).join('/') + ' | LCP ' + r.map((x) => Math.round(x.lcp) + ' (' + x.element + ')').join(' / ') + ' | mediana ' + Math.round(lcp) + ' ms | CLS max ' + cls.toFixed(4))
      for (const x of r) expect(x.latime).toBe(390)
      if (lcp <= 0) nemasurat(cale + ': niciun LCP inregistrat')
      expect(lcp).toBeLessThanOrEqual(PRAG_LCP_MS)
      expect(cls).toBeLessThanOrEqual(PRAG_CLS)
    })
  }

  test('martor POZITIV: un bloc de 300 px inserat tarziu TREBUIE sa treaca de CLS 0,1, prin aceeasi masura', async ({ browser, baseURL }) => {
    test.setTimeout(60_000)
    const r = await incarcare(browser, baseURL ?? '', PAGINI[0], true)
    console.log('[bugete martor pozitiv CLS] ' + r.cls.toFixed(4))
    expect(r.cls).toBeGreaterThan(PRAG_CLS)
  })
})
