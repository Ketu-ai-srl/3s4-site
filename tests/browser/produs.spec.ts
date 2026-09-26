import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Browser, type Page } from '@playwright/test'
import { CANALE_SEIF } from '../../src/components/produs/seif-canale'
import { INTREBARI_PLATFORMA } from '../../src/content/produs/platforma'
import { SEIF, VERIFICARE_BROWSER } from '../../src/content/produs/securitate'
import { masoaraAccesibilitatea } from './ajutor/detectori'

/**
 * Paginile de produs in navigator (felia `produs`, valul S4-3; fisele platforma.md, integrari.md,
 * securitate.md). Fiecare masuratoare citeste `innerWidth` din pagina.
 *
 * CE MASOARA:
 *   - macheta platformei: 7 animatii infinite de 3,6 s cu miscare; niciuna la miscare redusa;
 *   - antetul cardului "problema" lipit la 96 px peste 981 px, si nelipit la 390;
 *   - diagrama la 390: nodurile au inaltimea continutului (la referinta, 180 px cu 88 goi);
 *   - apelurile la 390: codul se deruleaza in bloc, pagina nu;
 *   - intrebarile frecvente: platforma toate inchise si independente, securitatea cu primul deschis;
 *   - verificarea din browser: 3 cereri GET la `/api/sanatate` cand cardul intra in fereastra,
 *     mediana in ms, "masurati din nou" cu inca 3; martorul pozitiv: cu punctul picat, "indisponibil";
 *   - seiful legat de derulare: zavoare, roata, usa, eticheta, randuri, pe p, si drumul inapoi;
 *     forma statica la miscare redusa; la 390 camera cuprinde tot continutul;
 *   - harta la 390: eticheta de minim 11 px, in cadru; matricea la 390: derulare in invelis;
 *   - latenta gesturilor paginii de securitate (INP <= 200 ms la 390 cu CPU x4): "masurati din nou"
 *     si o intrebare frecventa, mediana a 3 drumuri; martorii: acelasi ascultator pus pe buton,
 *     tinand firul 250 ms (peste prag) si 0 ms (sub prag);
 *   - focusul pe "masurati din nou": ramane pe buton dupa Enter si dupa Tab, cat masoara si dupa;
 *     martorul pozitiv: acelasi buton, dezactivat de mana, pierde focusul si citirea il vede;
 *   - macheta platformei cu miscare, la 390: axe pe cel mai slab cadru al buclei (45 %), fara
 *     contrast sub prag; martorul pozitiv: jetoanele la opacitatea referintei (.55) sunt prinse;
 *   - cardul "lipseste" de pe integrari: 880 x 117 la 1440 cu butonul pe acelasi rand, coloana la 390;
 *   - piesele inghetate (CTA-ul final, eroul interior, acordeonul) nu mostenesc `text-wrap` de la
 *     felie: CTA-ul are aceleasi randuri pe /integrari ca pe start.
 *
 * Probele ruleaza implicit cu miscare redusa (playwright.config.ts); cele care masoara miscarea
 * isi deschid un context cu `no-preference`.
 */

async function deschide(page: Page, cale: string, latime: number, inaltime = 900): Promise<void> {
  await page.setViewportSize({ width: latime, height: inaltime })
  await page.goto(cale, { waitUntil: 'networkidle' })
  expect(await page.evaluate(() => window.innerWidth), 'innerWidth CITIT').toBe(latime)
}

async function cuMiscare(browser: Browser, baseURL: string | undefined, latime: number, inaltime = 900) {
  const context = await browser.newContext({
    baseURL,
    viewport: { width: latime, height: inaltime },
    reducedMotion: 'no-preference',
  })
  const page = await context.newPage()
  return { context, page }
}

/** Derulare pana la `p` in cursa seiful; intoarce p-ul citit din pagina. */
async function laProgres(page: Page, p: number): Promise<number> {
  return page.evaluate((tinta) => {
    const s = document.querySelector('section[aria-labelledby="seif-titlu"]') as HTMLElement
    const r = s.getBoundingClientRect()
    const cursa = r.height - window.innerHeight
    window.scrollTo({ top: window.scrollY + r.top + tinta * cursa, behavior: 'instant' })
    const r2 = s.getBoundingClientRect()
    return -r2.top / cursa
  }, p)
}

/** Numarul din `rotate(...)`, `rotateY(...)` sau `translateX(...)` pus de script pe element. */
async function valoareStil(page: Page, selector: string, index = 0): Promise<number> {
  return page.evaluate(
    ([sel, i]) => {
      const el = document.querySelectorAll(sel)[i as number] as HTMLElement
      const m = /\((-?[\d.]+)/.exec(el.style.transform)
      return m ? Number(m[1]) : 0
    },
    [selector, index] as const,
  )
}

test.describe('platforma', () => {
  test('macheta: 7 animatii infinite de 3,6 s cu miscare, niciuna la miscare redusa', async ({ browser, baseURL, page }) => {
    const { context, page: cu } = await cuMiscare(browser, baseURL, 1440)
    await cu.goto('/platforma', { waitUntil: 'networkidle' })
    expect(await cu.evaluate(() => window.innerWidth), 'innerWidth CITIT').toBe(1440)
    const cuMisc = await cu.evaluate(() =>
      document
        .querySelector('figure')!
        .getAnimations({ subtree: true })
        .map((a) => {
          const t = a.effect!.getTiming()
          return { durata: Number(t.duration), repetari: Number(t.iterations) }
        }),
    )
    await context.close()
    console.log('[produs] macheta cu miscare: ' + JSON.stringify(cuMisc))
    expect(cuMisc).toHaveLength(7)
    for (const a of cuMisc) {
      expect(a.durata).toBe(3600)
      expect(a.repetari).toBe(Infinity)
    }

    await deschide(page, '/platforma', 1440)
    const redus = await page.evaluate(
      () => document.querySelector('figure')!.getAnimations({ subtree: true }).filter((a) => a.playState === 'running').length,
    )
    expect(redus).toBe(0)
  })

  test('antetul cardului "problema": lipit la 96 px la 1440, nelipit la 390', async ({ page }) => {
    for (const [latime, lipit] of [
      [1440, true],
      [390, false],
    ] as const) {
      await deschide(page, '/platforma', latime)
      const m = await page.evaluate(() => {
        const h2 = document.querySelector('#platforma-problema') as HTMLElement
        const antet = h2.parentElement as HTMLElement
        const card = antet.parentElement as HTMLElement
        const sus = card.getBoundingClientRect().top + window.scrollY
        window.scrollTo({ top: sus + 60, behavior: 'instant' })
        return { antet: antet.getBoundingClientRect().top, card: card.getBoundingClientRect().top, pozitie: getComputedStyle(antet).position }
      })
      console.log('[produs] antet problema la ' + latime + ': ' + JSON.stringify(m))
      if (lipit) {
        expect(m.pozitie).toBe('sticky')
        expect(Math.abs(m.antet - 96)).toBeLessThan(1.5)
      } else {
        expect(m.pozitie).toBe('static')
        expect(m.antet).toBeLessThan(96)
      }
    }
  })

  test('diagrama: 114 px la 1440, inaltimea continutului la 390', async ({ page }) => {
    await deschide(page, '/platforma', 1440)
    const lat = await page.evaluate(() =>
      [...document.querySelectorAll('[class*="platforma_nod_"]')].map((e) => e.getBoundingClientRect().height),
    )
    await deschide(page, '/platforma', 390, 844)
    const ingust = await page.evaluate(() =>
      [...document.querySelectorAll('[class*="platforma_nod_"]')].map((e) => {
          const r = e.getBoundingClientRect()
          const continut = [...e.querySelectorAll('p')].reduce((s, p) => s + p.getBoundingClientRect().height, 0)
          return { h: r.height, continut }
        }),
    )
    console.log('[produs] noduri 1440: ' + JSON.stringify(lat) + ' | 390: ' + JSON.stringify(ingust))
    expect(lat).toHaveLength(3)
    for (const h of lat) expect(Math.abs(h - 114)).toBeLessThan(4)
    expect(ingust).toHaveLength(3)
    for (const n of ingust) expect(n.h - n.continut).toBeLessThan(60)
  })

  test('apelurile la 390: codul se deruleaza in bloc, pagina nu', async ({ page }) => {
    await deschide(page, '/platforma', 390, 844)
    const m = await page.evaluate(() => ({
      pagina: document.documentElement.scrollWidth,
      blocuri: [...document.querySelectorAll('pre[role="region"]')].map((p) => ({ lat: p.clientWidth, cod: p.scrollWidth })),
    }))
    console.log('[produs] apeluri 390: ' + JSON.stringify(m))
    expect(m.pagina).toBe(390)
    expect(m.blocuri).toHaveLength(2)
    for (const b of m.blocuri) expect(b.cod).toBeGreaterThan(b.lat)
  })

  test('intrebarile frecvente: toate inchise, independente', async ({ page }) => {
    await deschide(page, '/platforma', 1440)
    const detalii = page.locator('details')
    await expect(detalii).toHaveCount(INTREBARI_PLATFORMA.intrebari.length)
    for (let i = 0; i < INTREBARI_PLATFORMA.intrebari.length; i++) await expect(detalii.nth(i)).not.toHaveAttribute('open', '')
    await detalii.nth(0).locator('summary').click()
    await detalii.nth(1).locator('summary').click()
    await expect(detalii.nth(0)).toHaveAttribute('open', '')
    await expect(detalii.nth(1)).toHaveAttribute('open', '')
  })
})

test.describe('securitate: verificarea din browser', () => {
  test('3 cereri la vedere, mediana in ms, inca 3 la "masurati din nou"', async ({ page }) => {
    const cereri: string[] = []
    page.on('request', (r) => {
      if (new URL(r.url()).pathname === '/api/sanatate') cereri.push(r.method())
    })
    await deschide(page, '/securitate', 1440)
    const card = page.locator('[data-stare]')
    expect(cereri, 'nicio cerere inainte ca cardul sa intre in fereastra').toHaveLength(0)
    await card.scrollIntoViewIfNeeded()
    await expect(card).toHaveAttribute('data-stare', 'gata')
    expect(cereri).toEqual(['GET', 'GET', 'GET'])
    const valori = await page.evaluate(() => ({
      server: document.querySelector('[data-camp="server"]')!.textContent,
      criptare: document.querySelector('[data-camp="criptare"]')!.textContent,
      timp: document.querySelector('[data-camp="timp"]')!.textContent,
      gazda: location.host,
      protocol: location.protocol,
    }))
    console.log('[produs] verificare: ' + JSON.stringify(valori))
    expect(valori.server).toBe(valori.gazda)
    expect(valori.timp).toMatch(/^\d+ ms$/)
    expect(valori.criptare).toBe(valori.protocol === 'https:' ? VERIFICARE_BROWSER.criptareDa : VERIFICARE_BROWSER.criptareNu)

    await page.getByRole('button', { name: VERIFICARE_BROWSER.reia }).click()
    await expect(card).toHaveAttribute('data-stare', 'gata')
    expect(cereri).toHaveLength(6)
  })

  // Defectul plantat (punctul de sanatate picat) TREBUIE vazut de card: e martor pozitiv.
  test('martor POZITIV: cu punctul picat, timpul e "indisponibil" si punctul nu se face verde', async ({ page }) => {
    await page.route('**/api/sanatate', (r) => r.abort())
    await deschide(page, '/securitate', 1440)
    const card = page.locator('[data-stare]')
    await card.scrollIntoViewIfNeeded()
    await expect(card).toHaveAttribute('data-stare', 'eroare')
    await expect(page.locator('[data-camp="timp"]')).toHaveText(VERIFICARE_BROWSER.indisponibil)
  })

  test('axe dupa masurare, la 390: nicio incalcare grava', async ({ page }) => {
    await deschide(page, '/securitate', 390, 844)
    const card = page.locator('[data-stare]')
    await card.scrollIntoViewIfNeeded()
    await expect(card).toHaveAttribute('data-stare', 'gata')
    const axe = await masoaraAccesibilitatea(page)
    console.log('[produs] axe securitate 390 dupa masurare: ' + JSON.stringify(axe.grave))
    expect(axe.grave).toEqual([])
  })
})

test.describe('securitate: seiful', () => {
  test('cu miscare: zavoare, roata, eticheta, usa, randuri pe p, si inapoi', async ({ browser, baseURL }) => {
    const { context, page } = await cuMiscare(browser, baseURL, 1440)
    await page.goto('/securitate', { waitUntil: 'networkidle' })
    expect(await page.evaluate(() => window.innerWidth), 'innerWidth CITIT').toBe(1440)
    const stare = page.locator('span[class*="Seif_stare_"]')

    await laProgres(page, 0.1)
    await page.waitForTimeout(250)
    await expect(stare).toHaveText(SEIF.stare.inchis)

    const p40 = await laProgres(page, 0.4)
    await page.waitForTimeout(250)
    const roata = await valoareStil(page, '[class*="Seif_roata"]')
    const zavor = await valoareStil(page, '[class*="Seif_zavor"]', 2)
    console.log('[produs] seif p=' + p40.toFixed(3) + ': roata ' + roata + ', zavor 3 ' + zavor)
    expect(Math.abs(roata - 184.2)).toBeLessThan(4)
    expect(Math.abs(zavor - -20)).toBeLessThan(0.5)
    await expect(stare).toHaveText(SEIF.stare.inchis)

    const p70 = await laProgres(page, 0.7)
    await page.waitForTimeout(500)
    const usa = await valoareStil(page, '[class*="Seif_usa"]')
    const rand1 = await page.evaluate(() => Number((document.querySelector('[class*="Seif_raft"] li') as HTMLElement).style.opacity))
    console.log('[produs] seif p=' + p70.toFixed(3) + ': usa ' + usa + ', randul 1 ' + rand1)
    expect(Math.abs(usa - -84)).toBeLessThan(2)
    expect(Math.abs(rand1 - (0.7 - CANALE_SEIF.randuri[0][0]) / 0.12)).toBeLessThan(0.08)
    await expect(stare).toHaveText(SEIF.stare.deschis)

    await laProgres(page, 0.2)
    await page.waitForTimeout(500)
    expect(Math.abs(await valoareStil(page, '[class*="Seif_usa"]'))).toBeLessThan(0.5)
    await expect(stare).toHaveText(SEIF.stare.inchis)
    await context.close()
  })

  test('miscare redusa: inaltimea continutului, fara usa, randurile la vedere', async ({ page }) => {
    await deschide(page, '/securitate', 1440)
    const m = await page.evaluate(() => {
      const s = document.querySelector('section[aria-labelledby="seif-titlu"]') as HTMLElement
      const usa = s.querySelector('[class*="Seif_usa"]') as HTMLElement
      const randuri = [...s.querySelectorAll('[class*="Seif_raft"] li')].map((r) => Number(getComputedStyle(r).opacity))
      const sub = s.querySelector('[class*="Seif_subtitlu"]') as HTMLElement
      return { inaltime: s.getBoundingClientRect().height, usa: getComputedStyle(usa).display, randuri, subtitlu: sub.textContent }
    })
    console.log('[produs] seif redus 1440: ' + JSON.stringify(m))
    // Fara usa, subtitlul nu mai descrie animatia.
    expect(m.subtitlu).toBe(SEIF.subtitluStatic)
    // Si tot pe 2 randuri: inaltimea statica ramane cea masurata inainte de schimbarea textului (698,86).
    expect(Math.abs(m.inaltime - 698.86)).toBeLessThan(2)
    expect(m.inaltime).toBeLessThan(1000)
    expect(m.usa).toBe('none')
    expect(m.randuri).toEqual([1, 1, 1])
  })

  test('la 390, cu miscare: camera cuprinde tot continutul', async ({ browser, baseURL }) => {
    const { context, page } = await cuMiscare(browser, baseURL, 390, 844)
    await page.goto('/securitate', { waitUntil: 'networkidle' })
    expect(await page.evaluate(() => window.innerWidth), 'innerWidth CITIT').toBe(390)
    await laProgres(page, 1)
    await page.waitForTimeout(400)
    const m = await page.evaluate(() => {
      const interior = document.querySelector('[class*="Seif_interior"]') as HTMLElement
      const camera = interior.parentElement as HTMLElement
      const ci = camera.getBoundingClientRect()
      const copii = [...interior.children].filter((c) => !c.classList.contains('doar-cititor')).map((c) => c.getBoundingClientRect())
      return {
        camera: { sus: ci.top, jos: ci.bottom },
        sus: Math.min(...copii.map((c) => c.top)),
        jos: Math.max(...copii.map((c) => c.bottom)),
      }
    })
    console.log('[produs] seif 390: ' + JSON.stringify(m))
    expect(m.sus).toBeGreaterThanOrEqual(m.camera.sus)
    expect(m.jos).toBeLessThanOrEqual(m.camera.jos)
    await context.close()
  })
})

test.describe('securitate la 390: harta si matricea', () => {
  test('eticheta hartii: minim 11 px, in cadru; matricea se deruleaza in invelis', async ({ page }) => {
    await deschide(page, '/securitate', 390, 844)
    const m = await page.evaluate(() => {
      const eticheta = document.querySelector('[class*="reperEticheta"]') as HTMLElement
      const cadru = eticheta.closest('figure') as HTMLElement
      const e = eticheta.getBoundingClientRect()
      const c = cadru.getBoundingClientRect()
      const invelis = document.querySelector('[class*="matriceInvelis"]') as HTMLElement
      return {
        font: parseFloat(getComputedStyle(eticheta).fontSize),
        inCadru: e.left >= c.left && e.right <= c.right && e.top >= c.top && e.bottom <= c.bottom,
        pagina: document.documentElement.scrollWidth,
        invelis: { lat: invelis.clientWidth, continut: invelis.scrollWidth, tab: invelis.tabIndex },
      }
    })
    console.log('[produs] harta si matrice 390: ' + JSON.stringify(m))
    expect(m.font).toBeGreaterThanOrEqual(11)
    expect(m.inCadru).toBe(true)
    expect(m.pagina).toBe(390)
    expect(m.invelis.continut).toBeGreaterThanOrEqual(640)
    expect(m.invelis.lat).toBeLessThan(m.invelis.continut)
    expect(m.invelis.tab).toBe(0)
  })

  test('intrebarile frecvente: primul deschis, chevronul albastru', async ({ page }) => {
    await deschide(page, '/securitate', 1440)
    const detalii = page.locator('details')
    await expect(detalii).toHaveCount(6)
    await expect(detalii.nth(0)).toHaveAttribute('open', '')
    await expect(detalii.nth(1)).not.toHaveAttribute('open', '')
    const culoare = await detalii.nth(0).locator('summary svg').evaluate((s) => getComputedStyle(s).color)
    expect(culoare).toBe('rgb(37, 99, 235)')
  })
})

// ---------------------------------------------------------------------------------------------------
// Latenta gesturilor (plan §8.4: INP <= 200 ms, la 390 cu procesorul incetinit de 4 ori)
// ---------------------------------------------------------------------------------------------------

const BUGET_INP_MS = 200
const INCETINIRE_CPU = 4

type Gest = 'masoara-din-nou' | 'intrebare'

/**
 * Durata unui gest ca in INP: cea mai lunga intrare Event Timing a lui (pointerdown, pointerup si
 * click au acelasi `interactionId`), de la eveniment pana la primul cadru de dupa el. Incetinirea
 * porneste inaintea incarcarii si tine toata vizita. Gestul vine dupa ce cardul verificarii a terminat
 * prima masurare: efectul lui a rulat, deci radacina e hidratata (pagina nu are granite Suspense proprii).
 *
 * Un clic dat IN TIMPUL hidratarii plateste hidratarea sincrona a intregii radacini; costul acela e al
 * site-ului, nu al gestului, si se vede la fel pe meniul din antet - masurat separat, in raportul feliei.
 *
 * `lentPeLoc` pune pe tinta un ascultator care tine firul principal atatia ms. Martorii folosesc
 * acelasi ascultator, cu 250 ms (pozitiv) si cu 0 ms (negativ): diferenta dintre ei e numai
 * intarzierea plantata, nu felul in care proba se agata de buton.
 */
async function durataGestului(browser: Browser, baseURL: string | undefined, gest: Gest, lentPeLoc: number | null = null) {
  const context = await browser.newContext({ baseURL, viewport: { width: 390, height: 844 }, reducedMotion: 'no-preference' })
  try {
    await context.addInitScript(() => {
      const w = window as unknown as { __gesturi: { id: number; durata: number }[] }
      w.__gesturi = []
      type Intrare = PerformanceEntry & { interactionId?: number }
      new PerformanceObserver((lista) => {
        for (const e of lista.getEntries() as Intrare[]) if (e.interactionId) w.__gesturi.push({ id: e.interactionId, durata: e.duration })
      }).observe({ type: 'event', buffered: true, durationThreshold: 16 } as PerformanceObserverInit)
    })
    const page = await context.newPage()
    const cdp = await context.newCDPSession(page)
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: INCETINIRE_CPU })
    await page.goto('/securitate', { waitUntil: 'networkidle' })
    const latime = await page.evaluate(() => window.innerWidth)
    const card = page.locator('[data-stare]')
    await card.scrollIntoViewIfNeeded()
    await expect(card).toHaveAttribute('data-stare', 'gata', { timeout: 20_000 })
    const tinta = gest === 'masoara-din-nou' ? card.locator('button') : page.locator('details').nth(1).locator('summary')
    await tinta.scrollIntoViewIfNeeded()
    if (lentPeLoc !== null) {
      await tinta.evaluate((el, ms) => {
        el.addEventListener('pointerdown', () => {
          const t = performance.now()
          while (performance.now() - t < ms) {
            // firul principal tinut pe loc
          }
        })
      }, lentPeLoc)
    }
    await page.evaluate(() => {
      ;(window as unknown as { __gesturi: unknown[] }).__gesturi.length = 0
    })
    await tinta.click()
    if (gest === 'intrebare') await expect(page.locator('details').nth(1)).toHaveAttribute('open', '')
    else await expect(card).toHaveAttribute('data-stare', 'gata', { timeout: 20_000 })
    // intrarea Event Timing vine dupa pictura de dupa gest
    await page.waitForTimeout(700)
    const gesturi = await page.evaluate(() => (window as unknown as { __gesturi: { id: number; durata: number }[] }).__gesturi)
    // Sub 16 ms navigatorul nu raporteaza intrarea deloc: gestul a fost sub prag.
    const durata = gesturi.length ? Math.max(...gesturi.map((g) => g.durata)) : 0
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: 1 })
    return { durata, latime }
  } finally {
    await context.close()
  }
}

test.describe('securitate la 390, CPU x' + INCETINIRE_CPU + ': latenta gesturilor', () => {
  for (const gest of ['masoara-din-nou', 'intrebare'] as const) {
    test(gest + ': mediana a 3 drumuri sub ' + BUGET_INP_MS + ' ms', async ({ browser, baseURL }) => {
      // plafonul configuratiei (60 s) pe fiecare drum: la CPU x4, pe masina incarcata, un drum a tinut 34 s
      test.setTimeout(3 * 60_000)
      const rulari: number[] = []
      for (let i = 0; i < 3; i++) {
        const { durata, latime } = await durataGestului(browser, baseURL, gest)
        expect(latime, 'innerWidth CITIT').toBe(390)
        rulari.push(durata)
      }
      const mediana = [...rulari].sort((a, b) => a - b)[1]
      console.log('[produs] INP ' + gest + ' 390 x' + INCETINIRE_CPU + ': rulari (ms) ' + rulari.join(' / ') + ' | mediana ' + mediana)
      expect(mediana).toBeLessThanOrEqual(BUGET_INP_MS)
    })
  }

  test('martor POZITIV: un gest tinut pe loc 250 ms iese peste prag prin aceeasi masura', async ({ browser, baseURL }) => {
    test.setTimeout(90_000)
    const { durata, latime } = await durataGestului(browser, baseURL, 'masoara-din-nou', 250)
    console.log('[produs] INP martor pozitiv: innerWidth CITIT ' + latime + ' | durata ' + durata + ' ms')
    expect(latime).toBe(390)
    expect(durata).toBeGreaterThan(BUGET_INP_MS)
  })

  test('martor NEGATIV: acelasi ascultator, tinut pe loc 0 ms, NU iese peste prag', async ({ browser, baseURL }) => {
    test.setTimeout(90_000)
    const { durata, latime } = await durataGestului(browser, baseURL, 'masoara-din-nou', 0)
    console.log('[produs] INP martor negativ: innerWidth CITIT ' + latime + ' | durata ' + durata + ' ms')
    expect(latime).toBe(390)
    expect(durata).toBeLessThanOrEqual(BUGET_INP_MS)
  })
})

// ---------------------------------------------------------------------------------------------------
// Focusul pe "masurati din nou" (runda de reparatii 1: dupa Enter focusul cadea pe <body>)
// ---------------------------------------------------------------------------------------------------

/** Punctul de sanatate raspunde cu intarziere, ca masurarea sa tina destul cat sa se vada focusul. */
async function sanatateLenta(page: Page, ms = 400): Promise<void> {
  await page.route('**/api/sanatate', async (r) => {
    await new Promise((gata) => setTimeout(gata, ms))
    await r.continue()
  })
}

type CitireFocus = { peButon: boolean; activ: string | null; stare: string | null; ariaDisabled: string | null; dezactivat: boolean }

/** Unde e focusul fata de butonul "masurati din nou" si in ce stare e cardul. */
async function focusPeReia(page: Page): Promise<CitireFocus> {
  return page.evaluate(() => {
    const card = document.querySelector('[data-stare]') as HTMLElement
    const buton = card.querySelector('button') as HTMLButtonElement
    const activ = document.activeElement
    return {
      peButon: activ === buton,
      activ: activ ? activ.tagName.toLowerCase() : null,
      stare: card.dataset.stare ?? null,
      ariaDisabled: buton.getAttribute('aria-disabled'),
      dezactivat: buton.disabled,
    }
  })
}

/** Citiri la fiecare 100 ms, pana cand cardul a terminat masurarea (sau 20 s). */
async function citestePanaLaGata(page: Page): Promise<CitireFocus[]> {
  const citiri: CitireFocus[] = []
  const limita = Date.now() + 20_000
  for (;;) {
    const c = await focusPeReia(page)
    citiri.push(c)
    if (c.stare === 'gata' || c.stare === 'eroare' || Date.now() > limita) return citiri
    await page.waitForTimeout(100)
  }
}

test.describe('securitate: focusul pe "masurati din nou"', () => {
  test('dupa Enter, focusul ramane pe buton cat masoara si dupa: aria-disabled, nu disabled', async ({ page }) => {
    await sanatateLenta(page)
    await deschide(page, '/securitate', 1440)
    const card = page.locator('[data-stare]')
    await card.scrollIntoViewIfNeeded()
    await expect(card).toHaveAttribute('data-stare', 'gata', { timeout: 20_000 })
    await card.locator('button').focus()
    await page.keyboard.press('Enter')
    const citiri = await citestePanaLaGata(page)
    const ultima = citiri[citiri.length - 1]
    console.log('[produs] focus dupa Enter (' + citiri.length + ' citiri): prima ' + JSON.stringify(citiri[0]) + ' | ultima ' + JSON.stringify(ultima))
    expect(citiri[0].stare, 'imediat dupa Enter masurarea ruleaza').toBe('masoara')
    expect(citiri[0].ariaDisabled).toBe('true')
    expect(ultima.stare).toBe('gata')
    expect(ultima.ariaDisabled).toBeNull()
    for (const c of citiri) {
      expect(c.peButon, 'focusul e pe ' + c.activ + ' in starea ' + c.stare).toBe(true)
      expect(c.dezactivat).toBe(false)
    }
  })

  test('Tab aduce cardul in fereastra si porneste masurarea, iar focusul ramane pe buton', async ({ page }) => {
    await sanatateLenta(page)
    await deschide(page, '/securitate', 1440)
    // Focusul pe elementul focalizabil dinaintea butonului, in ordinea documentului; cardul e inca
    // in afara ferestrei, deci nu a masurat nimic.
    const inainte = await page.evaluate(() => {
      const buton = document.querySelector('[data-stare] button') as HTMLElement
      const focalizabile = [
        ...document.querySelectorAll<HTMLElement>('a[href], button, summary, input, select, textarea, [tabindex]'),
      ].filter((e) => e.tabIndex >= 0 && !(e as HTMLButtonElement).disabled && e.getClientRects().length > 0)
      const i = focalizabile.indexOf(buton)
      const precedent = focalizabile[i - 1]
      precedent.focus()
      const r = buton.getBoundingClientRect()
      return {
        precedent: precedent.tagName.toLowerCase() + ' ' + (precedent.textContent ?? '').trim().slice(0, 30),
        peElement: document.activeElement === precedent,
        butonInFereastra: r.top < window.innerHeight && r.bottom > 0,
      }
    })
    const card = page.locator('[data-stare]')
    expect(inainte.peElement).toBe(true)
    expect(inainte.butonInFereastra, 'cardul trebuie sa fie in afara ferestrei inainte de Tab').toBe(false)
    await expect(card).toHaveAttribute('data-stare', 'asteptare')
    await page.keyboard.press('Tab')
    const citiri = await citestePanaLaGata(page)
    const ultima = citiri[citiri.length - 1]
    console.log('[produs] Tab de pe ' + inainte.precedent + ': ' + citiri.length + ' citiri | ultima ' + JSON.stringify(ultima))
    expect(citiri.some((c) => c.stare === 'masoara'), 'Tab-ul a pornit masurarea').toBe(true)
    expect(ultima.stare).toBe('gata')
    for (const c of citiri) expect(c.peButon, 'focusul e pe ' + c.activ + ' in starea ' + c.stare).toBe(true)
  })

  // Aceeasi citire, pe defectul plantat: un buton care devine `disabled` cu focusul pe el.
  test('martor POZITIV: acelasi buton, dezactivat de mana, pierde focusul, iar aceeasi citire il vede', async ({ page }) => {
    await deschide(page, '/securitate', 1440)
    const card = page.locator('[data-stare]')
    await card.scrollIntoViewIfNeeded()
    await expect(card).toHaveAttribute('data-stare', 'gata', { timeout: 20_000 })
    const buton = card.locator('button')
    await buton.focus()
    const inainte = await focusPeReia(page)
    await buton.evaluate((b) => {
      ;(b as HTMLButtonElement).disabled = true
    })
    await page.waitForTimeout(100)
    const dupa = await focusPeReia(page)
    console.log('[produs] martor focus: inainte ' + JSON.stringify(inainte) + ' | dupa disabled ' + JSON.stringify(dupa))
    expect(inainte.peButon).toBe(true)
    expect(dupa.dezactivat).toBe(true)
    expect(dupa.peButon, 'un buton dezactivat pierde focusul; daca citirea nu vede asta, proba nu masoara').toBe(false)
  })
})

// ---------------------------------------------------------------------------------------------------
// Contrastul machetei platformei IN MISCARE (portile generale ruleaza axe numai cu miscare redusa)
// ---------------------------------------------------------------------------------------------------

const MACHETA = '[class*="MachetaStrat_macheta"]'
const JETON_FISIER = '[class*="MachetaStrat_fisier"]'

/** Opreste fiecare animatie a machetei in cadrul de la 45 % din bucla, cel mai slab; intoarce opacitatile. */
async function laCadrulSlab(page: Page): Promise<number[]> {
  return page.evaluate(
    ([macheta, jeton]) => {
      const figura = document.querySelector(macheta) as HTMLElement
      for (const a of figura.getAnimations({ subtree: true })) {
        const t = a.effect!.getTiming()
        a.pause()
        a.currentTime = Number(t.delay ?? 0) + 0.45 * Number(t.duration)
      }
      return [...figura.querySelectorAll(jeton)].map((e) => Number(getComputedStyle(e).opacity))
    },
    [MACHETA, JETON_FISIER] as const,
  )
}

/** axe, doar regula de contrast, doar pe macheta: nodurile picate si cele trecute, cu raportul lor. */
async function contrastMacheta(page: Page) {
  const r = await new AxeBuilder({ page }).include(MACHETA).withRules(['color-contrast']).analyze()
  const noduri = (lista: typeof r.violations) =>
    lista.flatMap((v) =>
      v.nodes.map((n) => ({
        tinta: n.target.join(' '),
        raport: (n.any[0]?.data as { contrastRatio?: number } | undefined)?.contrastRatio ?? null,
      })),
    )
  return { picate: noduri(r.violations), trecute: noduri(r.passes), neclare: noduri(r.incomplete) }
}

test.describe('platforma: contrastul machetei in miscare', () => {
  test('la 390, in cadrul de la 45 % al buclei, axe nu gaseste contrast sub prag pe macheta', async ({ browser, baseURL }) => {
    const { context, page } = await cuMiscare(browser, baseURL, 390, 844)
    try {
      await page.goto('/platforma', { waitUntil: 'networkidle' })
      expect(await page.evaluate(() => window.innerWidth), 'innerWidth CITIT').toBe(390)
      const opacitati = await laCadrulSlab(page)
      const m = await contrastMacheta(page)
      console.log('[produs] macheta 390 la 45 %: opacitati ' + opacitati.join(' / ') + ' | ' + JSON.stringify(m))
      expect(opacitati).toHaveLength(4)
      for (const o of opacitati) expect(o, 'chiar suntem in cadrul slab').toBeLessThan(1)
      expect(m.picate).toEqual([])
      expect(m.neclare.filter((n) => n.tinta.includes('fisier'))).toEqual([])
      expect(m.trecute.filter((n) => n.tinta.includes('fisier'))).toHaveLength(4)
    } finally {
      await context.close()
    }
  })

  test('martor POZITIV: jetoanele la opacitatea referintei (.55) sunt prinse de aceeasi masura', async ({ browser, baseURL }) => {
    const { context, page } = await cuMiscare(browser, baseURL, 390, 844)
    try {
      await page.goto('/platforma', { waitUntil: 'networkidle' })
      expect(await page.evaluate(() => window.innerWidth), 'innerWidth CITIT').toBe(390)
      await page.evaluate(
        ([macheta, jeton]) => {
          const figura = document.querySelector(macheta) as HTMLElement
          for (const a of figura.getAnimations({ subtree: true })) a.cancel()
          for (const e of figura.querySelectorAll<HTMLElement>(jeton)) e.style.opacity = '0.55'
        },
        [MACHETA, JETON_FISIER] as const,
      )
      const m = await contrastMacheta(page)
      console.log('[produs] macheta martor .55: ' + JSON.stringify(m.picate))
      expect(m.picate.filter((n) => n.tinta.includes('fisier')).length).toBeGreaterThan(0)
    } finally {
      await context.close()
    }
  })
})

// ---------------------------------------------------------------------------------------------------
// Cardul "lipseste" de pe integrari (fisa integrari.md §2d: 880 x 117 la 1440, coloana sub 640)
// ---------------------------------------------------------------------------------------------------

test.describe('integrari: cardul "lipseste"', () => {
  async function cardLipseste(page: Page) {
    return page.evaluate(() => {
      const card = document.querySelector('[class*="integrari_lipseste__"]') as HTMLElement
      const text = card.firstElementChild as HTMLElement
      const buton = card.lastElementChild as HTMLElement
      const c = card.getBoundingClientRect()
      const t = text.getBoundingClientRect()
      const b = buton.getBoundingClientRect()
      const randuri = (el: Element) => Math.round(el.getBoundingClientRect().height / parseFloat(getComputedStyle(el).lineHeight))
      return {
        card: { latime: Math.round(c.width * 10) / 10, inaltime: Math.round(c.height * 10) / 10 },
        text: { dreapta: t.right, sus: t.top, jos: t.bottom },
        buton: { stanga: b.left, sus: b.top, jos: b.bottom },
        randuriTitlu: randuri(text.querySelector('h2')!),
        randuriText: randuri(text.querySelector('p')!),
      }
    })
  }

  test('880 x 117 la 1440, butonul in dreapta pe acelasi rand; la 390 o coloana', async ({ page }) => {
    await deschide(page, '/integrari', 1440)
    const lat = await cardLipseste(page)
    await deschide(page, '/integrari', 390, 844)
    const ingust = await cardLipseste(page)
    console.log('[produs] lipseste 1440: ' + JSON.stringify(lat) + ' | 390: ' + JSON.stringify(ingust))
    expect(lat.card.latime).toBe(880)
    expect(Math.abs(lat.card.inaltime - 117)).toBeLessThan(2)
    expect(lat.randuriTitlu).toBe(1)
    expect(lat.randuriText).toBe(1)
    expect(lat.buton.stanga).toBeGreaterThanOrEqual(lat.text.dreapta)
    expect(lat.buton.sus).toBeLessThan(lat.text.jos)
    expect(lat.buton.jos).toBeGreaterThan(lat.text.sus)
    expect(ingust.buton.sus).toBeGreaterThanOrEqual(ingust.text.jos)
  })
})

// ---------------------------------------------------------------------------------------------------
// Piesele inghetate nu mostenesc `text-wrap` de la felie (runda 1: regula de pe <main> le rupea altfel)
// ---------------------------------------------------------------------------------------------------

type Randuri = { latimi: number[]; stil: string }

/** Latimea fiecarui rand de text al primului element care se potriveste, si `text-wrap` calculat. */
async function randuriText(page: Page, selector: string): Promise<Randuri> {
  return page.evaluate((sel) => {
    const el = document.querySelector(sel) as HTMLElement
    const interval = document.createRange()
    interval.selectNodeContents(el)
    const drepte = [...interval.getClientRects()].filter((q) => q.width > 0).sort((a, b) => a.top - b.top)
    const linii: { mijloc: number; st: number; dr: number }[] = []
    for (const q of drepte) {
      const mijloc = (q.top + q.bottom) / 2
      const l = linii.find((x) => Math.abs(x.mijloc - mijloc) < 6)
      if (l) {
        l.st = Math.min(l.st, q.left)
        l.dr = Math.max(l.dr, q.right)
      } else linii.push({ mijloc, st: q.left, dr: q.right })
    }
    const s = getComputedStyle(el) as CSSStyleDeclaration & { textWrapStyle?: string; textWrap?: string }
    return { latimi: linii.map((l) => Math.round(l.dr - l.st)), stil: s.textWrapStyle || s.textWrap || '' }
  }, selector)
}

const STILURI_FELIE = ['balance', 'pretty']

test.describe('piesele inghetate pe paginile de produs', () => {
  test('CTA-ul final are aceleasi randuri pe /integrari ca pe start; eroul interior si acordeonul, fara text-wrap', async ({ page }) => {
    await deschide(page, '/', 1440)
    const ctaStart = await randuriText(page, 'h2.t-h2-cta')
    await deschide(page, '/integrari', 1440)
    const ctaIntegrari = await randuriText(page, 'h2.t-h2-cta')
    const erouIntegrari = await randuriText(page, 'h1.t-h1-interior')
    await deschide(page, '/securitate', 1440)
    const erouSecuritate = await randuriText(page, 'h1.t-h1-interior')
    const acordeon = await page.evaluate(() =>
      [...document.querySelectorAll('details, details summary, details p')].slice(0, 6).map((e) => {
        const s = getComputedStyle(e) as CSSStyleDeclaration & { textWrapStyle?: string; textWrap?: string }
        return s.textWrapStyle || s.textWrap || ''
      }),
    )
    console.log(
      '[produs] CTA start ' + JSON.stringify(ctaStart) + ' | CTA integrari ' + JSON.stringify(ctaIntegrari) +
        ' | erou integrari ' + JSON.stringify(erouIntegrari) + ' | erou securitate ' + JSON.stringify(erouSecuritate) +
        ' | acordeon ' + JSON.stringify(acordeon),
    )
    expect(ctaStart.latimi.length).toBeGreaterThan(1)
    expect(ctaIntegrari).toEqual(ctaStart)
    for (const s of [ctaIntegrari.stil, erouIntegrari.stil, erouSecuritate.stil, ...acordeon]) expect(STILURI_FELIE).not.toContain(s)
  })

  // Regula veche, pusa la loc de mana: aceeasi masura trebuie sa vada randurile schimbate.
  test('martor POZITIV: cu `text-wrap: balance` pe titlurile din <main>, CTA-ul isi schimba randurile', async ({ page }) => {
    await deschide(page, '/integrari', 1440)
    const inainte = await randuriText(page, 'h2.t-h2-cta')
    await page.addStyleTag({ content: 'main :is(h1, h2, h3) { text-wrap: balance; }' })
    const dupa = await randuriText(page, 'h2.t-h2-cta')
    console.log('[produs] martor text-wrap: inainte ' + JSON.stringify(inainte) + ' | cu regula veche ' + JSON.stringify(dupa))
    expect(dupa.stil).toBe('balance')
    expect(dupa.latimi).not.toEqual(inainte.latimi)
  })
})
