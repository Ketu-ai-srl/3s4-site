import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Browser, type Page } from '@playwright/test'
import { PORTAL, ROLURI_PORTAL, type RolPortal } from '../../src/content/functionalitati/portal-clienti'
import { IMPACTURI_BLOCANTE, masoaraAccesibilitatea } from './ajutor/detectori'
import { nemasurat } from './ajutor/proiect'

/**
 * Paginile cinema ale feliei `cinema-1` in navigator: `/functionalitati/cautare-ai`,
 * `/functionalitati/automatizari-ai`, `/functionalitati/portal-clienti` (fisele
 * functionalitati__sablon.md si functionalitati__<pagina>.md).
 *
 * CE MASOARA, cu `innerWidth` CITIT din pagina la fiecare latime:
 *   - starea statica: la miscare redusa fiecare sectiune sta la p = 1 si niciun text nu se scrie, si
 *     dupa derularea pana la capat (plan: HTML-ul servit si miscarea redusa arata forma finala);
 *   - grila de fundal acopera partea vizibila din `main` la orice derulare (abaterea de la referinta,
 *     unde stratul de grila iese din ecran dupa ~6000 px);
 *   - puntea dintre cardurile "Inainte / Acum" ramane in banda ei la 390 si la 1440 (abaterea: la
 *     referinta desenul rotit trece ~140 px peste ambele carduri);
 *   - comutatorul de rol din portal: clic, Enter, Spatiu, ciclul de 2,5 s numai cu miscare permisa,
 *     pauza de 10 s dupa o alegere, si aceeasi stare pe buton, pe zona documentului si pe coloana;
 *   - axe la 1440 si la 390 (poarta de accesibilitate a site-ului masoara o singura latime);
 *   - axe CU MISCARE, pe fiecare sectiune derulata la p = 0,5 (centrata, unde se citeste): poarta
 *     site-ului ruleaza axe numai la miscare redusa, deci nu vede textul stins de o lista in trepte
 *     care se aprinde prea tarziu (critic 25.09: 12 noduri la 1440, 13 la 390); si, alaturi, contrastul
 *     CALCULAT pe fiecare text, fiindca axe lasa "incomplet" textul de peste fundaluri cu imagine;
 *   - terminalul eroului are latimea lui (600 / 660), nu latimea textului: masurat pe cererea scurta
 *     de pe portal-clienti, unde un terminal fara latime proprie iesea 510 px;
 *   - bara din S5 pe cautare-ai: un rand cat textul scris incape pe unul, lupa pe acel rand, iar
 *     indicatia de sub bara nu se misca pana la final;
 *   - bugetele de la 390 cu procesorul incetinit de 4 ori: LCP <= 2500 ms si CLS <= 0,1 la incarcare,
 *     INP <= 200 ms pe clicul din comutator (singurul element interactiv din corpul paginilor).
 *
 * Asteptarile vin din fise (2,5 s si 10 s: fisa portal-clienti S6), nu din cod: o constanta
 * schimbata in componenta nu isi poate trage proba dupa ea.
 */

const PAGINI = ['/functionalitati/cautare-ai', '/functionalitati/automatizari-ai', '/functionalitati/portal-clienti'] as const
/** Paginile cu puntea desenata (varianta `svg` a contrastului); portalul are linia machetelor. */
const PAGINI_CU_PUNTE = ['/functionalitati/cautare-ai', '/functionalitati/automatizari-ai'] as const

/** Fisa portal-clienti S6: schimbari masurate la 2,38-2,65 s; dupa un clic, urmatoarea la ~12,4 s. */
const CICLU_FISA_MS = 2650
const PAUZA_FISA_MS = 10000

async function deschide(page: Page, cale: string, latime: number): Promise<void> {
  await page.goto(cale, { waitUntil: 'networkidle' })
  expect(await page.evaluate(() => window.innerWidth), 'innerWidth CITIT').toBe(latime)
}

// --- Starea statica ------------------------------------------------------------------------------

type StareNefinala = { probleme: string[]; sectiuni: number }

/**
 * Ce nu e in forma finala: o sectiune cu p sub 1, un text in curs de scriere, eroul care inca scrie.
 * Numara si sectiunile, ca o lista goala sa nu poata veni dintr-un selector care nu mai gaseste nimic.
 */
async function stareNefinala(page: Page): Promise<StareNefinala> {
  return page.evaluate(() => {
    const probleme: string[] = []
    const sectiuni = [...document.querySelectorAll('main section[data-sectiune]')]
    for (const s of sectiuni) {
      const nume = s.getAttribute('data-sectiune') ?? '?'
      if (nume === 'erou') {
        const faza = s.getAttribute('data-faza')
        if (faza !== 'static') probleme.push('eroul in faza ' + faza)
        continue
      }
      const p = getComputedStyle(s).getPropertyValue('--p').trim()
      if (p !== '1') probleme.push('sectiunea ' + nume + ' la p = ' + p)
    }
    for (const e of document.querySelectorAll('main [data-scriere]')) {
      const stare = e.getAttribute('data-scriere')
      if (stare !== 'static') probleme.push('text in starea ' + stare + ': ' + (e.textContent ?? '').trim().slice(0, 40))
    }
    return { probleme, sectiuni: sectiuni.length }
  })
}

test.describe('starea statica, la miscare redusa, 1440', () => {
  test.use({ viewport: { width: 1440, height: 900 } })

  for (const cale of PAGINI) {
    test(cale + ': fiecare sectiune la p = 1 si fiecare text intreg, sus si dupa derularea pana la capat', async ({ page }) => {
      await deschide(page, cale, 1440)
      const sus = await stareNefinala(page)
      console.log('[static ' + cale + '] sectiuni: ' + sus.sectiuni + ' | probleme: ' + (sus.probleme.join('; ') || '(niciuna)'))
      expect(sus.sectiuni, 'sectiuni gasite').toBeGreaterThanOrEqual(7)
      expect(sus.probleme).toEqual([])
      await page.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' }))
      await page.waitForTimeout(700)
      expect((await stareNefinala(page)).probleme).toEqual([])
    })
  }
})

test.describe('detectorul starii statice, cu miscare', () => {
  test.use({ viewport: { width: 1440, height: 900 }, reducedMotion: 'no-preference' })

  test('martor POZITIV: in capul paginii, sectiunile de sub ecran si scrierea din erou TREBUIE prinse', async ({ page }) => {
    await deschide(page, PAGINI[0], 1440)
    await page.waitForTimeout(400)
    const { probleme } = await stareNefinala(page)
    console.log('[static martor pozitiv] ' + probleme.slice(0, 6).join('; '))
    expect(probleme.some((p) => p.startsWith('sectiunea '))).toBe(true)
    expect(probleme.some((p) => p.startsWith('eroul') || p.startsWith('text in starea'))).toBe(true)
  })
})

test.describe('detectorul starii statice, fara JavaScript', () => {
  test.use({ viewport: { width: 1440, height: 900 }, reducedMotion: 'no-preference', javaScriptEnabled: false })

  test('martor NEGATIV: fara scripturi p ramane 1 din CSS si nimic nu se scrie; NU trebuie prins nimic', async ({ page }) => {
    for (const cale of PAGINI) {
      await deschide(page, cale, 1440)
      const r = await stareNefinala(page)
      console.log('[static martor negativ ' + cale + '] sectiuni: ' + r.sectiuni + ' | probleme: ' + (r.probleme.join('; ') || '(niciuna)'))
      expect(r.sectiuni).toBeGreaterThanOrEqual(7)
      expect(r.probleme).toEqual([])
    }
  })
})

// --- Grila de fundal ----------------------------------------------------------------------------

type GolGrila = { sus: number; jos: number; y: number; grila: boolean }

/** Cati px din partea VIZIBILA a lui `main` raman neacoperiti de stratul de grila, sus si jos. */
async function golGrila(page: Page): Promise<GolGrila> {
  return page.evaluate(() => {
    const grila = document.querySelector('[data-grila-cinema]')
    const main = document.querySelector('main')
    if (!grila || !main) return { sus: -1, jos: -1, y: window.scrollY, grila: false }
    const g = grila.getBoundingClientRect()
    const m = main.getBoundingClientRect()
    const vizibilSus = Math.max(0, m.top)
    const vizibilJos = Math.min(window.innerHeight, m.bottom)
    return {
      sus: Math.max(0, g.top - vizibilSus),
      jos: Math.max(0, vizibilJos - g.bottom),
      y: window.scrollY,
      grila: getComputedStyle(grila).backgroundImage !== 'none',
    }
  })
}

/** Stratul de grila in forma referintei: fix, 100vh + 120vh, mutat cu -0,18 x derularea data. */
async function grilaCaLaReferinta(page: Page, derulare: number): Promise<void> {
  await page.evaluate((y) => {
    const g = document.querySelector('[data-grila-cinema]') as HTMLElement
    g.style.cssText = 'position: fixed; top: 0; left: 0; right: 0; height: 220vh; transform: translate3d(0, ' + -0.18 * y + 'px, 0)'
  }, derulare)
}

test.describe('grila de fundal, cu miscare, 1440', () => {
  test.use({ viewport: { width: 1440, height: 900 }, reducedMotion: 'no-preference' })

  for (const cale of PAGINI) {
    test(cale + ': grila acopera partea vizibila din main la orice derulare, si dupa 6000 px', async ({ page }) => {
      await deschide(page, cale, 1440)
      const maxim = await page.evaluate(() => document.documentElement.scrollHeight - window.innerHeight)
      const pozitii = [0, 1234, 3000, 5000, 6100, maxim].filter((y) => y <= maxim)
      const masuri: GolGrila[] = []
      for (const y of pozitii) {
        await page.evaluate((v) => window.scrollTo({ top: v, behavior: 'instant' }), y)
        await page.waitForTimeout(250)
        masuri.push(await golGrila(page))
      }
      console.log('[grila ' + cale + '] derulare maxima ' + maxim + ' | ' + masuri.map((m) => m.y + ': sus ' + m.sus.toFixed(1) + ' jos ' + m.jos.toFixed(1)).join(' | '))
      expect(maxim, 'pagina trece de zona in care grila referintei se termina').toBeGreaterThan(6000)
      for (const m of masuri) {
        expect(m.grila, 'stratul gasit are grila desenata').toBe(true)
        expect(m.sus, 'gol sus la ' + m.y).toBeLessThanOrEqual(0.5)
        expect(m.jos, 'gol jos la ' + m.y).toBeLessThanOrEqual(0.5)
      }
    })
  }

  test('martor POZITIV: stratul referintei dupa 8000 px de derulare TREBUIE prins (lasa jos fundal gol)', async ({ page }) => {
    await deschide(page, PAGINI[0], 1440)
    await page.evaluate(() => window.scrollTo({ top: 3000, behavior: 'instant' }))
    await page.waitForTimeout(250)
    await grilaCaLaReferinta(page, 8000)
    const m = await golGrila(page)
    console.log('[grila martor pozitiv] sus ' + m.sus.toFixed(1) + ' jos ' + m.jos.toFixed(1))
    expect(m.jos).toBeGreaterThan(100)
  })

  test('martor NEGATIV: acelasi strat al referintei, fara derulare, acopera fereastra si NU trebuie prins', async ({ page }) => {
    await deschide(page, PAGINI[0], 1440)
    await page.evaluate(() => window.scrollTo({ top: 3000, behavior: 'instant' }))
    await page.waitForTimeout(250)
    await grilaCaLaReferinta(page, 0)
    const m = await golGrila(page)
    console.log('[grila martor negativ] sus ' + m.sus.toFixed(1) + ' jos ' + m.jos.toFixed(1))
    expect(m.sus).toBeLessThanOrEqual(0.5)
    expect(m.jos).toBeLessThanOrEqual(0.5)
  })
})

// --- Puntea contrastului ------------------------------------------------------------------------

type Punte = { gasita: boolean; probleme: string[] }

/**
 * Desenul si eticheta puntii (sau, cu `container`, puntea insasi) contra celor doua carduri: orice
 * suprapunere mai mare de 0,5 px pe ambele axe, si orice iesire din fereastra.
 */
async function punteaIeseDinBanda(page: Page, container = false): Promise<Punte> {
  return page.evaluate((cuContainer) => {
    const sectiune = document.querySelector('section[data-sectiune="contrast"]')
    const inainte = sectiune?.querySelector('[data-latura="inainte"]')
    const acum = sectiune?.querySelector('[data-latura="acum"]')
    const punte = inainte?.nextElementSibling
    if (!inainte || !acum || !punte || punte === acum) return { gasita: false, probleme: [] }
    const carduri = [inainte, acum].map((e) => ({ nume: e.getAttribute('data-latura') ?? '?', r: e.getBoundingClientRect() }))
    const tinte = cuContainer ? [punte] : [...punte.querySelectorAll(':scope > svg, :scope > span')]
    const probleme: string[] = []
    for (const t of tinte) {
      const r = t.getBoundingClientRect()
      const nume = t.tagName.toLowerCase()
      for (const c of carduri) {
        const x = Math.min(r.right, c.r.right) - Math.max(r.left, c.r.left)
        const y = Math.min(r.bottom, c.r.bottom) - Math.max(r.top, c.r.top)
        if (x > 0.5 && y > 0.5) probleme.push(nume + ' peste cardul ' + c.nume + ' (' + x.toFixed(1) + ' x ' + y.toFixed(1) + ' px)')
      }
      if (r.left < -0.5 || r.right > window.innerWidth + 0.5) probleme.push(nume + ' iese din fereastra')
    }
    if (tinte.length === 0) probleme.push('puntea nu are desen')
    return { gasita: true, probleme }
  }, container)
}

for (const latime of [390, 1440]) {
  test.describe('puntea contrastului, ' + latime, () => {
    test.use({ viewport: { width: latime, height: latime === 390 ? 844 : 900 } })

    for (const cale of PAGINI_CU_PUNTE) {
      test(cale + ': desenul si eticheta puntii nu intra in carduri', async ({ page }) => {
        await deschide(page, cale, latime)
        await page.locator('section[data-sectiune="contrast"]').scrollIntoViewIfNeeded()
        const r = await punteaIeseDinBanda(page)
        console.log('[punte ' + latime + ' ' + cale + '] ' + (r.probleme.join('; ') || '(in banda)'))
        expect(r.gasita).toBe(true)
        expect(r.probleme).toEqual([])
      })
    }
  })
}

test.describe('detectorul puntii, 390', () => {
  test.use({ viewport: { width: 390, height: 844 } })

  test('martor POZITIV: desenul rotit ca la referinta (350 x 9 px, 90 de grade) TREBUIE prins', async ({ page }) => {
    await deschide(page, PAGINI_CU_PUNTE[0], 390)
    await page.evaluate(() => {
      const svg = document.querySelector('section[data-sectiune="contrast"] [data-latura="inainte"] + * > svg') as SVGElement
      svg.style.cssText = 'width: 350px; height: 9px; margin: 0; transform: rotate(90deg)'
    })
    const r = await punteaIeseDinBanda(page)
    console.log('[punte martor pozitiv] ' + r.probleme.join('; '))
    expect(r.probleme.some((p) => p.includes('inainte'))).toBe(true)
    expect(r.probleme.some((p) => p.includes('acum'))).toBe(true)
  })

  test('martor NEGATIV: banda puntii atinge ambele carduri fara sa intre in ele si NU trebuie prinsa', async ({ page }) => {
    await deschide(page, PAGINI_CU_PUNTE[0], 390)
    const r = await punteaIeseDinBanda(page, true)
    console.log('[punte martor negativ] ' + (r.probleme.join('; ') || '(nimic)'))
    expect(r.gasita).toBe(true)
    expect(r.probleme).toEqual([])
  })
})

// --- Comutatorul de rol din portal ---------------------------------------------------------------

const BUTOANE: Record<RolPortal, string> = {
  client: PORTAL.roluri.client.buton,
  contabil: PORTAL.roluri.contabil.buton,
  echipa: PORTAL.roluri.echipa.buton,
}

type StareRol = { apasate: string[]; zone: string[]; coloane: string[] }

/** Butonul apasat, zona evidentiata din document si coloana din grila: trebuie sa arate acelasi rol. */
async function stareRol(page: Page): Promise<StareRol> {
  return page.evaluate(() => {
    const s = document.querySelector('section[data-sectiune="portal"]')
    if (!s) return { apasate: [], zone: [], coloane: [] }
    return {
      apasate: [...s.querySelectorAll('button[aria-pressed="true"]')].map((b) => (b.textContent ?? '').trim()),
      zone: [...s.querySelectorAll('[data-macheta="document-zone"] [data-activa]')].map((z) => z.getAttribute('data-activa') ?? ''),
      coloane: [...s.querySelectorAll('[data-macheta="grila-drepturi"] th[data-activa]')].map((z) => z.getAttribute('data-activa') ?? ''),
    }
  })
}

function asteptat(rol: RolPortal): StareRol {
  const k = ROLURI_PORTAL.indexOf(rol)
  const semn = ROLURI_PORTAL.map((_, i) => (i === k ? 'da' : 'nu'))
  return { apasate: [BUTOANE[rol]], zone: semn, coloane: semn }
}

const butonRol = (page: Page, rol: RolPortal) =>
  page.locator('section[data-sectiune="portal"] [role="group"]').getByRole('button', { name: BUTOANE[rol], exact: true })

async function laComutator(page: Page): Promise<void> {
  await page.locator('section[data-sectiune="portal"] [role="group"]').scrollIntoViewIfNeeded()
  await page.mouse.move(4, 4)
}

test.describe('comutatorul de rol, la miscare redusa, 1440', () => {
  test.use({ viewport: { width: 1440, height: 900 } })

  test('porneste pe client si nu se schimba singur; Enter si Spatiu aleg rolul, pe buton, zona si coloana', async ({ page }) => {
    await deschide(page, PAGINI[2], 1440)
    await laComutator(page)
    expect(await stareRol(page)).toEqual(asteptat('client'))
    await page.waitForTimeout(CICLU_FISA_MS + 1000)
    expect(await stareRol(page), 'fara miscare ciclul nu porneste').toEqual(asteptat('client'))

    await butonRol(page, 'echipa').focus()
    await page.keyboard.press('Enter')
    await expect.poll(() => stareRol(page)).toEqual(asteptat('echipa'))
    await butonRol(page, 'contabil').focus()
    await page.keyboard.press('Space')
    await expect.poll(() => stareRol(page)).toEqual(asteptat('contabil'))
    await butonRol(page, 'client').click()
    await expect.poll(() => stareRol(page)).toEqual(asteptat('client'))
  })
})

test.describe('comutatorul de rol, cu miscare, 1440', () => {
  test.use({ viewport: { width: 1440, height: 900 }, reducedMotion: 'no-preference' })

  test('ciclul merge cat comutatorul se vede, iar dupa un clic asteapta 10 s', async ({ page }) => {
    test.setTimeout(60_000)
    await deschide(page, PAGINI[2], 1440)
    await laComutator(page)
    await expect.poll(() => stareRol(page), { timeout: CICLU_FISA_MS + 2000 }).toEqual(asteptat('contabil'))

    await butonRol(page, 'echipa').click()
    const ales = Date.now()
    await page.mouse.move(4, 4)
    await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur())
    expect(await stareRol(page)).toEqual(asteptat('echipa'))
    await page.waitForTimeout(CICLU_FISA_MS + 1500)
    expect(await stareRol(page), 'in pauza de dupa clic ciclul sta').toEqual(asteptat('echipa'))
    await expect.poll(() => stareRol(page), { timeout: PAUZA_FISA_MS + CICLU_FISA_MS + 2000 }).toEqual(asteptat('client'))
    const dupa = Date.now() - ales
    console.log('[comutator] urmatoarea schimbare dupa clic: ' + dupa + ' ms')
    expect(dupa).toBeGreaterThanOrEqual(PAUZA_FISA_MS)
  })
})

// --- Accesibilitate la 1440 si la 390 ------------------------------------------------------------

for (const latime of [1440, 390]) {
  test.describe('axe, ' + latime, () => {
    test.use({ viewport: { width: latime, height: latime === 390 ? 844 : 900 } })

    for (const cale of PAGINI) {
      test(cale + ': nicio incalcare ' + IMPACTURI_BLOCANTE.join('/'), async ({ page }) => {
        await deschide(page, cale, latime)
        const masura = await masoaraAccesibilitatea(page)
        console.log('[axe ' + latime + ' ' + cale + '] reguli evaluate: ' + masura.reguliRulate + ' | blocante: ' + masura.grave.length + ' | de raportat: ' + masura.usoare.map((u) => u.regula + ' x' + u.noduri).join(', '))
        for (const g of masura.grave) console.log('    BLOCANT: ' + g.regula + ' (' + g.impact + ') x' + g.noduri + ' ' + g.tinte.join(' | '))
        expect(masura.grave.map((g) => g.regula)).toEqual([])
      })
    }
  })
}

// --- Accesibilitate CU MISCARE, fiecare sectiune la p = 0,5 --------------------------------------

type AxeSectiune = { nume: string; p: string; noduri: number; detalii: string[] }

/** Deruleaza sectiunea `nume` la progresul `p`: p = (0,5 vh - top) / inaltime (sablon §1.4). */
async function laProgres(page: Page, nume: string, p: number): Promise<void> {
  const y = await page.evaluate(
    ({ nume, p }) => {
      const s = document.querySelector('main section[data-sectiune="' + nume + '"]')
      if (!s) return -1
      const r = s.getBoundingClientRect()
      return Math.round(r.top + window.scrollY - 0.5 * window.innerHeight + p * r.height)
    },
    { nume, p },
  )
  expect(y, 'sectiunea ' + nume + ' gasita').toBeGreaterThanOrEqual(0)
  await page.evaluate((v) => window.scrollTo({ top: v, behavior: 'instant' }), y)
}

/**
 * axe (reguli WCAG A / AA) pe o singura sectiune, dupa ce animatiile ei CU SFARSIT s-au oprit: tranzitiile
 * legate de derulare si lipirea etichetelor din portal (pornita la intrarea in fereastra, 2,6 s). O stare
 * de trecere nu e starea de citit; buclele fara capat (clipiri, plutiri) nu se asteapta.
 */
async function axePeSectiune(page: Page, nume: string): Promise<AxeSectiune> {
  await page.waitForTimeout(400)
  await page.evaluate(async (n) => {
    const s = document.querySelector('main section[data-sectiune="' + n + '"]')
    if (!s) return
    const cuSfarsit = s.getAnimations({ subtree: true }).filter((a) => Number.isFinite(Number(a.effect?.getComputedTiming().endTime)))
    await Promise.all(cuSfarsit.map((a) => a.finished.catch(() => undefined)))
  }, nume)
  await page.waitForTimeout(200)
  const p = await page.evaluate(
    (n) => getComputedStyle(document.querySelector('main section[data-sectiune="' + n + '"]') as Element).getPropertyValue('--p').trim(),
    nume,
  )
  const r = await new AxeBuilder({ page })
    .include('main section[data-sectiune="' + nume + '"]')
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze()
  const grave = r.violations.filter((v) => IMPACTURI_BLOCANTE.includes(v.impact ?? ''))
  return {
    nume,
    p,
    noduri: grave.reduce((a, v) => a + v.nodes.length, 0),
    detalii: grave.flatMap((v) => v.nodes.map((n) => v.id + ' ' + n.target.join(' ') + ' | ' + (n.any[0]?.message ?? '').slice(0, 90))),
  }
}

for (const latime of [1440, 390]) {
  test.describe('axe cu miscare, fiecare sectiune la p = 0,5, ' + latime, () => {
    test.use({ viewport: { width: latime, height: latime === 390 ? 844 : 900 }, reducedMotion: 'no-preference' })

    for (const cale of PAGINI) {
      test(cale + ': nicio incalcare ' + IMPACTURI_BLOCANTE.join('/') + ' cu sectiunea centrata', async ({ page }) => {
        test.setTimeout(120_000)
        await deschide(page, cale, latime)
        const nume = await page.evaluate(() =>
          [...document.querySelectorAll('main section[data-sectiune]')].map((s) => s.getAttribute('data-sectiune') ?? '').filter((n) => n !== 'erou'),
        )
        expect(nume.length, 'sectiuni cu progres gasite').toBeGreaterThanOrEqual(6)
        const masuri: AxeSectiune[] = []
        for (const n of nume) {
          await laProgres(page, n, 0.5)
          masuri.push(await axePeSectiune(page, n))
        }
        console.log('[axe miscare ' + latime + ' ' + cale + '] ' + masuri.map((m) => m.nume + ' p=' + m.p + ': ' + m.noduri).join(' | '))
        for (const m of masuri) for (const d of m.detalii) console.log('    BLOCANT: ' + m.nume + ' ' + d)
        // Masura e la p 0,5, nu la alt progres: un selector care nu mai derula ar da "curat" la p 0.
        for (const m of masuri) expect(Math.abs(Number(m.p) - 0.5), 'progresul sectiunii ' + m.nume).toBeLessThan(0.02)
        expect(masuri.flatMap((m) => m.detalii)).toEqual([])
      })
    }
  })
}

// --- Contrast CALCULAT cu miscare, la p = 0,5, acolo unde axe nu masoara -------------------------

/**
 * axe lasa "incomplete" textul peste un fundal cu imagine sau pseudo-element (masurat 25.09: toata
 * cronologia din S2 automatizari-ai), deci proba axe de mai sus nu-l vede. Aici contrastul se CALCULEAZA
 * pe fiecare element cu text: culoarea lui si fundalurile stramosilor (fara imagini), compuse peste
 * `negru-cinema`, amandoua inmultite cu opacitatea efectiva (produsul opacitatilor stramosilor).
 * Prag 4,5:1 (3:1 la text mare: 24 px, sau 18,66 px la 700).
 *
 * Scoase, cu motiv: scenele cu dezvaluire pe toata lungimea lor (avalansa lipita de 200vh pe cautare-ai,
 * arborele cu voal din portal - randurile care nu s-au aratat inca NU sunt text de citit la p 0,5, sunt
 * ilustratia "prea multe"); zonele inactive ale documentului din portal (`data-activa="nu"`, .55 ca la
 * referinta, starea "rolul asta nu vede aici", comandata de butoanele de rol); textul ascuns vederii.
 */
const SCENE_CU_DEZVALUIRE = ['avalansa', 'arbore']

async function contrastCalculat(page: Page, nume: string): Promise<string[]> {
  return page.evaluate((n) => {
    type Culoare = { r: number; g: number; b: number; a: number }
    const citeste = (c: string): Culoare | null => {
      const m = c.match(/rgba?\(([^)]+)\)/)
      if (!m) return null
      const v = m[1].split(/[ ,/]+/).filter(Boolean).map(Number)
      return { r: v[0], g: v[1], b: v[2], a: v.length > 3 ? v[3] : 1 }
    }
    const peste = (sus: Culoare, jos: Culoare): Culoare => ({
      r: sus.r * sus.a + jos.r * (1 - sus.a),
      g: sus.g * sus.a + jos.g * (1 - sus.a),
      b: sus.b * sus.a + jos.b * (1 - sus.a),
      a: 1,
    })
    const luminanta = (c: Culoare) => {
      const f = (x: number) => {
        const y = x / 255
        return y <= 0.03928 ? y / 12.92 : ((y + 0.055) / 1.055) ** 2.4
      }
      return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b)
    }
    const raport = (a: Culoare, b: Culoare) => {
      const [x, y] = [luminanta(a), luminanta(b)].sort((p, q) => q - p)
      return (x + 0.05) / (y + 0.05)
    }
    const PAGINA: Culoare = { r: 5, g: 5, b: 7, a: 1 }
    const s = document.querySelector('main section[data-sectiune="' + n + '"]')
    if (!s) return ['sectiunea lipseste']
    const probleme: string[] = []
    const vazute = new Set<Element>()
    const umblator = document.createTreeWalker(s, NodeFilter.SHOW_TEXT)
    while (umblator.nextNode()) {
      const nod = umblator.currentNode
      const el = nod.parentElement
      if (!el || !(nod.nodeValue ?? '').trim() || vazute.has(el)) continue
      vazute.add(el)
      if (el.closest('[aria-hidden="true"], .doar-cititor, [data-activa="nu"]')) continue
      const cs = getComputedStyle(el)
      if (cs.visibility !== 'visible' || cs.display === 'none') continue
      const cutie = el.getBoundingClientRect()
      if (cutie.width <= 1.5 || cutie.height <= 1.5) continue
      let opacitate = 1
      const fonduri: Culoare[] = []
      for (let e: Element | null = el; e && e !== s.parentElement; e = e.parentElement) {
        const c = getComputedStyle(e)
        opacitate *= Number(c.opacity)
        const f = citeste(c.backgroundColor)
        if (f && f.a > 0) fonduri.push(f)
      }
      if (opacitate < 0.02) continue
      let fond = PAGINA
      for (const f of fonduri.reverse()) fond = peste(f, fond)
      const culoare = citeste(cs.color)
      if (!culoare) continue
      const text = peste({ ...peste(culoare, fond), a: opacitate }, PAGINA)
      const fondEfectiv = peste({ ...fond, a: opacitate }, PAGINA)
      const k = raport(text, fondEfectiv)
      const px = parseFloat(cs.fontSize)
      const mare = px >= 24 || (px >= 18.66 && Number(cs.fontWeight) >= 700)
      if (k < (mare ? 3 : 4.5)) probleme.push(k.toFixed(2) + ':1 (opacitate ' + opacitate.toFixed(2) + ', ' + px + ' px) "' + (nod.nodeValue ?? '').trim().slice(0, 40) + '"')
    }
    return probleme
  }, nume)
}

test.describe('contrast calculat cu miscare, fiecare sectiune la p = 0,5, 1440', () => {
  test.use({ viewport: { width: 1440, height: 900 }, reducedMotion: 'no-preference' })

  for (const cale of PAGINI) {
    test(cale + ': niciun text sub 4,5:1 (3:1 mare) cu sectiunea centrata', async ({ page }) => {
      test.setTimeout(120_000)
      await deschide(page, cale, 1440)
      const nume = await page.evaluate(() =>
        [...document.querySelectorAll('main section[data-sectiune]')].map((s) => s.getAttribute('data-sectiune') ?? '').filter((n) => n !== 'erou'),
      )
      const masurate = nume.filter((n) => !SCENE_CU_DEZVALUIRE.includes(n))
      expect(masurate.length, 'sectiuni masurate').toBeGreaterThanOrEqual(6)
      const toate: string[] = []
      for (const n of masurate) {
        await laProgres(page, n, 0.5)
        await axePeSectiune(page, n)
        const probleme = await contrastCalculat(page, n)
        toate.push(...probleme.map((p) => n + ': ' + p))
      }
      console.log('[contrast calculat ' + cale + '] sectiuni: ' + masurate.join(', ') + ' | sub prag: ' + (toate.join(' | ') || '(niciunul)'))
      expect(toate).toEqual([])
    })
  }

  test('martor POZITIV: cronologia din S2 automatizari-ai cu scara referintei TREBUIE prinsa (axe o lasa incompleta)', async ({ page }) => {
    await deschide(page, PAGINI[1], 1440)
    await laProgres(page, 'cost', 0.5)
    await page.evaluate(() => {
      for (const li of document.querySelectorAll('main section[data-sectiune="cost"] li')) {
        ;(li as HTMLElement).style.opacity = 'max(0.15, min(1, calc(2 * (var(--p) - 0.06 * var(--i, 0)))))'
      }
    })
    await axePeSectiune(page, 'cost')
    const probleme = await contrastCalculat(page, 'cost')
    console.log('[contrast calculat martor pozitiv] ' + probleme.join(' | '))
    expect(probleme.length).toBeGreaterThanOrEqual(2)
  })
})

// --- Treptele pe TOATA derularea, nu doar la p = 0,5 --------------------------------------------

/**
 * Critic 25.09 (runda 2): la p 0,5 treptele erau intregi, dar oprita pe o pozitie intermediara pagina lasa
 * randuri la .2-.6, deci text vizibil la 1,1-3,5:1. Acum treptele sunt 0 sau 1 (tranzitie in timp). Proba
 * opreste derularea pe cinci pozitii de pe rampa fiecarei scene in trepte si calculeaza contrastul dupa ce
 * tranzitiile s-au oprit; martorul de mai jos pune scara continua inapoi si TREBUIE prins.
 */
const SCENE_IN_TREPTE: ReadonlyArray<readonly [string, string]> = [
  [PAGINI[1], 'cost'],
  [PAGINI[1], 'regula'],
  [PAGINI[2], 'recunoastere'],
  [PAGINI[2], 'jurnal'],
]
const PROGRESE_RAMPA = [0.1, 0.18, 0.26, 0.34, 0.42]

for (const latime of [1440, 390]) {
  test.describe('contrast calculat pe rampa treptelor, ' + latime, () => {
    test.use({ viewport: { width: latime, height: latime === 390 ? 844 : 900 }, reducedMotion: 'no-preference' })

    for (const cale of [PAGINI[1], PAGINI[2]]) {
      test(cale + ': niciun text sub prag pe nicio pozitie a rampei', async ({ page }) => {
        test.setTimeout(120_000)
        await deschide(page, cale, latime)
        const toate: string[] = []
        for (const [c, n] of SCENE_IN_TREPTE) {
          if (c !== cale) continue
          for (const p of PROGRESE_RAMPA) {
            await laProgres(page, n, p)
            await axePeSectiune(page, n)
            toate.push(...(await contrastCalculat(page, n)).map((x) => n + ' p=' + p + ': ' + x))
          }
        }
        console.log('[contrast rampa ' + latime + ' ' + cale + '] ' + (toate.join(' | ') || '(niciunul)'))
        expect(toate).toEqual([])
      })
    }
  })
}

test.describe('martor POZITIV al rampei, 1440', () => {
  test.use({ viewport: { width: 1440, height: 900 }, reducedMotion: 'no-preference' })

  test('scara CONTINUA de dinainte (penumbra .15, panta 4) pe cronologie TREBUIE prinsa la p 0,18', async ({ page }) => {
    await deschide(page, PAGINI[1], 1440)
    await laProgres(page, 'cost', 0.18)
    await page.evaluate(() => {
      for (const li of document.querySelectorAll('main section[data-sectiune="cost"] li')) {
        ;(li as HTMLElement).style.opacity = 'max(0.15, min(1, calc(4 * (var(--p) - 0.05 * var(--i, 0)))))'
      }
    })
    await axePeSectiune(page, 'cost')
    const probleme = await contrastCalculat(page, 'cost')
    console.log('[contrast rampa martor pozitiv] ' + probleme.join(' | '))
    expect(probleme.length).toBeGreaterThanOrEqual(2)
  })
})

test.describe('detectorul de contrast cu miscare, 1440', () => {
  test.use({ viewport: { width: 1440, height: 900 }, reducedMotion: 'no-preference' })

  test('martor POZITIV: jurnalul din portal cu scara referintei (intreg abia la p 0,74) TREBUIE prins la p 0,5', async ({ page }) => {
    await deschide(page, PAGINI[2], 1440)
    await laProgres(page, 'jurnal', 0.5)
    // Formula referintei (fisa S7), pusa pe fiecare rand peste cea a site-ului.
    await page.evaluate(() => {
      for (const li of document.querySelectorAll('main section[data-sectiune="jurnal"] li')) {
        ;(li as HTMLElement).style.opacity = 'max(0.2, min(1, calc(2 * (var(--p) - 0.06 - 0.06 * var(--i, 0)))))'
      }
    })
    const m = await axePeSectiune(page, 'jurnal')
    console.log('[axe miscare martor pozitiv] p=' + m.p + ' noduri: ' + m.noduri)
    expect(m.noduri).toBeGreaterThanOrEqual(3)
  })
})

// --- Terminalul eroului: latimea lui, nu a textului ----------------------------------------------

type Terminal = { latime: number; x: number; text: number; fereastra: number }

async function masoaraTerminalul(page: Page): Promise<Terminal> {
  return page.evaluate(() => {
    const t = document.querySelector('main [data-terminal]') as HTMLElement
    const b = t.getBoundingClientRect()
    const baza = t.querySelector('[data-scriere] > span') as HTMLElement
    const interval = document.createRange()
    interval.selectNodeContents(baza)
    return { latime: b.width, x: b.x, text: interval.getBoundingClientRect().width, fereastra: window.innerWidth }
  })
}

test.describe('terminalul eroului, 1440', () => {
  test.use({ viewport: { width: 1440, height: 900 } })

  test('portal-clienti: cererea scurta NU strange cardul - 600 +- 2 px la x 420 (fisa S0)', async ({ page }) => {
    await deschide(page, PAGINI[2], 1440)
    const t = await masoaraTerminalul(page)
    console.log('[terminal portal 1440] ' + JSON.stringify(t))
    // Martorul cazului: textul e scurt, deci un card cat textul ar iesi mult sub 600.
    expect(t.text, 'cererea e scurta').toBeLessThan(480)
    expect(Math.abs(t.latime - 600)).toBeLessThanOrEqual(2)
    expect(Math.abs(t.x - 420)).toBeLessThanOrEqual(2)
  })

  test('cautare-ai: varianta lata, 660 +- 2 px la x 390 (fisa S0)', async ({ page }) => {
    await deschide(page, PAGINI[0], 1440)
    const t = await masoaraTerminalul(page)
    console.log('[terminal cautare 1440] ' + JSON.stringify(t))
    expect(Math.abs(t.latime - 660)).toBeLessThanOrEqual(2)
    expect(Math.abs(t.x - 390)).toBeLessThanOrEqual(2)
  })

  // Defectul masurat de critic era un terminal cat continutul lui (blocul eroului se strangea pe
  // titlu, iar terminalul cu el). Cat de mult se strange depinde si de titlu, deci martorul pune
  // direct forma defectului: terminalul cat textul lui.
  test('martor POZITIV: acelasi terminal, cat textul lui, TREBUIE prins', async ({ page }) => {
    await deschide(page, PAGINI[2], 1440)
    await page.evaluate(() => {
      const t = document.querySelector('main [data-terminal]') as HTMLElement
      t.style.width = 'fit-content'
    })
    const t = await masoaraTerminalul(page)
    console.log('[terminal martor pozitiv] ' + JSON.stringify(t))
    expect(Math.abs(t.latime - 600)).toBeGreaterThan(2)
  })
})

test.describe('terminalul eroului, 390', () => {
  test.use({ viewport: { width: 390, height: 844 } })

  for (const cale of [PAGINI[0], PAGINI[2]]) {
    test(cale + ': 350 +- 2 px, in fereastra', async ({ page }) => {
      await deschide(page, cale, 390)
      const t = await masoaraTerminalul(page)
      console.log('[terminal 390 ' + cale + '] ' + JSON.stringify(t))
      expect(Math.abs(t.latime - 350)).toBeLessThanOrEqual(2)
      expect(t.x).toBeGreaterThanOrEqual(0)
      expect(t.x + t.latime).toBeLessThanOrEqual(t.fereastra)
    })
  }
})

// --- Forma din hartii: luminozitatea, masurata ca la referinta -----------------------------------

/**
 * Pixelii formei din erou, cu aceeasi masura ca sonda criticului pe referinta (functionalitati__sablon.md
 * §4.1): antetul si tot textul eroului ascunse, captura de fereastra, pixelii cu max(R,G,B) >= 40 sub
 * y 80; media lor, cati trec de 90 si controlul (coltul stanga-jos, 120 x 60, fara foi: 0).
 * La miscare redusa gazda deseneaza direct cadrul asezat, identic cu cel de dupa animatie.
 * `filtru` e pentru martor: un filtru CSS pus pe panza (ex. `brightness(1.3)`).
 */
type PixeliForma = { pixeli: number; medie: number; peste90: number; control: number; latime: number }

async function pixeliForma(page: Page, filtru = ''): Promise<PixeliForma> {
  await page.locator('main section[data-sectiune="erou"] canvas').waitFor({ state: 'attached', timeout: 20_000 })
  await page.waitForTimeout(1500)
  await page.evaluate((f) => {
    const s = document.querySelector('main section[data-sectiune="erou"]') as HTMLElement
    const panza = s.querySelector('canvas') as HTMLCanvasElement
    for (const e of document.querySelectorAll('header, nav')) (e as HTMLElement).style.visibility = 'hidden'
    const pastrate = new Set<Element>()
    let e: Element | null = panza
    while (e && e !== s) {
      pastrate.add(e)
      e = e.parentElement
    }
    for (const x of s.querySelectorAll('*')) if (!pastrate.has(x) && x !== panza && !x.contains(panza)) (x as HTMLElement).style.visibility = 'hidden'
    panza.style.filter = f
  }, filtru)
  await page.waitForTimeout(300)
  const png = await page.screenshot()
  return page.evaluate(async (b64) => {
    const img = new Image()
    img.src = 'data:image/png;base64,' + b64
    await img.decode()
    const c = document.createElement('canvas')
    c.width = img.width
    c.height = img.height
    const g = c.getContext('2d') as CanvasRenderingContext2D
    g.drawImage(img, 0, 0)
    const d = g.getImageData(0, 0, c.width, c.height).data
    let pixeli = 0
    let suma = 0
    let peste90 = 0
    let control = 0
    for (let y = 80; y < c.height; y++) {
      for (let x = 0; x < c.width; x++) {
        const i = (y * c.width + x) * 4
        const m = Math.max(d[i], d[i + 1], d[i + 2])
        if (m < 40) continue
        pixeli++
        suma += m
        if (m >= 90) peste90++
        if (y >= c.height - 60 && x < 120) control++
      }
    }
    return { pixeli, medie: pixeli ? suma / pixeli : 0, peste90, control, latime: window.innerWidth }
  }, png.toString('base64'))
}

/**
 * Referinta (sonda criticului, 1440, 8,5 s): media 57,2-58,6 si 1.599-2.652 de pixeli peste 90, pe
 * paginile de aici. Banda cere aceeasi luminozitate (+-5) si acelasi ordin de marime. Inainte de
 * reparatie (materialul neluminat si fiecare suprapunere amestecata) iesea 68,9-72,4 si 10.383-16.237.
 */
const FORMA_MEDIE = { min: 52, max: 63 } as const
const FORMA_PESTE_90 = { min: 500, max: 6000 } as const

test.describe('forma din hartii, luminozitatea, 1440', () => {
  test.use({ viewport: { width: 1440, height: 900 } })

  for (const cale of PAGINI) {
    test(cale + ': media si pixelii luminosi in banda referintei', async ({ page }) => {
      await deschide(page, cale, 1440)
      const m = await pixeliForma(page)
      console.log('[forma ' + cale + '] ' + JSON.stringify({ ...m, medie: m.medie.toFixed(1) }))
      expect(m.latime).toBe(1440)
      expect(m.control, 'coltul fara foi').toBe(0)
      expect(m.pixeli, 'forma s-a desenat').toBeGreaterThan(40_000)
      expect(m.medie).toBeGreaterThanOrEqual(FORMA_MEDIE.min)
      expect(m.medie).toBeLessThanOrEqual(FORMA_MEDIE.max)
      expect(m.peste90).toBeGreaterThanOrEqual(FORMA_PESTE_90.min)
      expect(m.peste90).toBeLessThanOrEqual(FORMA_PESTE_90.max)
    })
  }

  // Foile sunt albe cu alfa mic, deci un `brightness()` nu le schimba (albul ramane alb; masurat: media
  // 58,6 -> 59,8). Martorul urca ALFA foilor, cu un filtru SVG: exact ce facea defectul, prin suprapuneri.
  test('martor POZITIV: aceeasi forma, cu foile de 1,6 ori mai opace, TREBUIE sa iasa din banda', async ({ page }) => {
    await deschide(page, PAGINI[2], 1440)
    await page.evaluate(() => {
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
      svg.setAttribute('width', '0')
      svg.setAttribute('height', '0')
      svg.style.position = 'absolute'
      svg.innerHTML = '<filter id="martor-alfa"><feComponentTransfer><feFuncA type="linear" slope="1.6"/></feComponentTransfer></filter>'
      document.body.appendChild(svg)
    })
    const m = await pixeliForma(page, 'url(#martor-alfa)')
    console.log('[forma martor pozitiv] ' + JSON.stringify({ ...m, medie: m.medie.toFixed(1) }))
    expect(m.medie > FORMA_MEDIE.max || m.peste90 > FORMA_PESTE_90.max).toBe(true)
  })
})

// --- Bara din S5 pe cautare-ai ------------------------------------------------------------------

type Bara = { p: string; scrise: number; inaltime: number; scara: number; lupa: number; rand: number; indicatie: number }

/** Bara din S5: inaltimea pe ecran si la scara 1, centrul lupei si al primului rand (fata de bara). */
async function masoaraBara(page: Page): Promise<Bara> {
  return page.evaluate(() => {
    const bara = document.querySelector('[data-macheta="bara-cautare"]') as HTMLElement
    const b = bara.getBoundingClientRect()
    const scara = b.width / bara.offsetWidth
    const lupa = (bara.querySelector('svg') as SVGElement).getBoundingClientRect()
    const scris = bara.querySelector('[data-scriere]') as HTMLElement
    const copie = scris.querySelector('[aria-hidden="true"]') ?? scris.firstElementChild
    const randuri = (copie as HTMLElement).getClientRects()
    const r = randuri.length > 0 ? randuri[0] : (copie as HTMLElement).getBoundingClientRect()
    const indicatie = (bara.parentElement?.nextElementSibling as HTMLElement).getBoundingClientRect()
    return {
      p: getComputedStyle(bara.closest('section') as Element).getPropertyValue('--p').trim(),
      scrise: (copie?.textContent ?? '').length,
      inaltime: b.height,
      scara,
      lupa: lupa.y + lupa.height / 2 - b.y,
      rand: r.y + r.height / 2 - b.y,
      indicatie: indicatie.y + window.scrollY,
    }
  })
}

test.describe('bara din S5 pe cautare-ai, cu miscare, 1440', () => {
  test.use({ viewport: { width: 1440, height: 900 }, reducedMotion: 'no-preference' })

  test('un rand cat textul incape pe unul, lupa pe el, indicatia pe loc pana la final', async ({ page }) => {
    await deschide(page, PAGINI[0], 1440)
    const masuri: Bara[] = []
    for (const p of [0.2, 0.35, 0.7]) {
      await laProgres(page, 'lumina', p)
      await page.waitForTimeout(900)
      masuri.push(await masoaraBara(page))
    }
    console.log('[bara S5] ' + masuri.map((m) => JSON.stringify(m)).join(' | '))
    const [inceput, mijloc, final] = masuri
    // La p 0,2 s-au scris cateva caractere: un singur rand (65 px la scara 1, ca la referinta).
    expect(inceput.scrise).toBeGreaterThan(0)
    expect(inceput.inaltime / inceput.scara).toBeLessThan(70)
    expect(Math.abs(inceput.lupa - inceput.rand), 'lupa pe randul scris').toBeLessThanOrEqual(3)
    expect(mijloc.inaltime / mijloc.scara).toBeLessThan(70)
    // La final textul e intreg, pe doua randuri.
    expect(final.inaltime / final.scara).toBeGreaterThan(80)
    // Locul se rezerva sub bara: indicatia nu se misca.
    expect(Math.abs(final.indicatie - inceput.indicatie)).toBeLessThanOrEqual(0.5)
  })

  test('martor POZITIV: bara care isi rezerva textul intreg in ea (ca inainte) TREBUIE prinsa la p 0,2', async ({ page }) => {
    await deschide(page, PAGINI[0], 1440)
    await laProgres(page, 'lumina', 0.2)
    await page.waitForTimeout(900)
    await page.evaluate(() => {
      const baza = document.querySelector('[data-macheta="bara-cautare"] [data-scriere] > span') as HTMLElement
      baza.style.cssText = 'position: static; width: auto; height: auto; clip-path: none; white-space: normal; color: transparent'
    })
    const m = await masoaraBara(page)
    console.log('[bara S5 martor pozitiv] ' + JSON.stringify(m))
    expect(m.inaltime / m.scara).toBeGreaterThan(70)
  })
})

// --- Bugetele de performanta, 390, procesor incetinit de 4 ori ----------------------------------

const INCETINIRE_CPU = 4
const PRAG_LCP_MS = 2500
const PRAG_CLS = 0.1
const PRAG_INP_MS = 200

type Incarcare = { lcp: number; element: string; cls: number; latime: number }

/** Calea paginii-martor, servita de proba insasi (interceptata), pe originea site-ului. */
const CALE_MARTOR = '/__martor-lcp-cinema-1'
/** Pagina-martor: un titlu de doua randuri si un paragraf, fara fonturi, fara scripturi, fara CSS extern. */
const HTML_MARTOR =
  '<!doctype html><html lang="ro"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">' +
  '<title>Martor</title></head><body style="margin:0;background:#050507;color:#fff;font:16px system-ui">' +
  '<main style="padding:48px 16px"><h1 style="font-size:40px;line-height:1.2;margin:0">Un titlu de doua randuri, cat al unui erou</h1>' +
  '<p>Un paragraf scurt sub titlu.</p></main></body></html>'
/**
 * Pragul martorului: cu masina libera pagina-martor are LCP ~60-180 ms cu procesorul incetinit de 4 ori
 * (masurat 25.09: 64-176 ms). Peste 250 ms masina e ocupata de altceva, iar o incarcare facuta atunci
 * masoara coada procesorului, nu pagina: se arunca si se reia.
 */
const PRAG_MARTOR_MS = 250
/** Incarcari curate cerute si incercari permise, per pagina. */
const INCARCARI_CURATE = 3
const INCERCARI = 8

type OptiuniIncarcare = { deplasareTarzie?: boolean; raspunsTarziuMs?: number }

/**
 * LCP si CLS ale unei incarcari proaspete, in context nou, cu incetinirea pornita inaintea incarcarii
 * (ca pe un telefon lent) si cu miscare permisa (cazul greu: scrierea din erou si aparitiile ruleaza).
 * Se citesc dupa 6 s fara nicio interactiune: o interactiune ar opri inregistrarea LCP.
 * Martorii pozitivi: `deplasareTarzie` insereaza la 1 s un bloc de 300 px deasupra continutului;
 * `raspunsTarziuMs` tine raspunsul documentului atatea ms (interceptat), deci totul se picteaza tarziu.
 * (Un `main` ascuns din CSS nu merge ca martor: hidratarea scoate stilul strain si LCP-ul ramane
 * la ~1,4 s - masurat 25.09.)
 */
async function incarcare(browser: Browser, baza: string, cale: string, optiuni: OptiuniIncarcare = {}): Promise<Incarcare> {
  const context = await browser.newContext({ baseURL: baza, viewport: { width: 390, height: 844 }, reducedMotion: 'no-preference' })
  try {
    if (cale === CALE_MARTOR) {
      await context.route('**' + CALE_MARTOR, (r) => r.fulfill({ status: 200, contentType: 'text/html; charset=utf-8', body: HTML_MARTOR }))
    }
    const intarziere = optiuni.raspunsTarziuMs ?? 0
    if (intarziere > 0) {
      await context.route('**' + cale, async (r) => {
        await new Promise((gata) => setTimeout(gata, intarziere))
        await r.continue()
      })
    }
    await context.addInitScript((o: OptiuniIncarcare) => {
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
      if (o.deplasareTarzie) {
        window.addEventListener('load', () => {
          setTimeout(() => {
            const bloc = document.createElement('div')
            bloc.style.height = '300px'
            document.querySelector('main')?.prepend(bloc)
          }, 1000)
        })
      }
    }, optiuni)
    const page = await context.newPage()
    const cdp = await context.newCDPSession(page)
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: INCETINIRE_CPU })
    await page.goto(cale, { waitUntil: 'load' })
    await page.waitForTimeout(cale === CALE_MARTOR ? 1500 : 6000)
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

type Buget = { lcp: number; cls: number; curate: Incarcare[]; aruncate: number[]; martori: number[] }

/**
 * Bugetul unei pagini pe incarcari CURATE: fiecare incarcare e precedata de pagina-martor, iar daca
 * martorul trece de 250 ms incarcarea se arunca (masina era ocupata). Verdictul e pe mediana LCP a
 * celor 3 incarcari curate si pe cel mai mare CLS dintre ele. Fara 3 incarcari curate in 8 incercari,
 * masuratoarea e NEMASURATA, nu trecuta si nu picata.
 */
async function buget(browser: Browser, baza: string, cale: string, optiuni: OptiuniIncarcare = {}): Promise<Buget> {
  const curate: Incarcare[] = []
  const aruncate: number[] = []
  const martori: number[] = []
  for (let i = 0; i < INCERCARI && curate.length < INCARCARI_CURATE; i++) {
    const m = await incarcare(browser, baza, CALE_MARTOR)
    martori.push(Math.round(m.lcp))
    const r = await incarcare(browser, baza, cale, optiuni)
    if (m.lcp > 0 && m.lcp <= PRAG_MARTOR_MS) curate.push(r)
    else aruncate.push(Math.round(r.lcp))
  }
  if (curate.length < INCARCARI_CURATE) {
    nemasurat(cale + ': numai ' + curate.length + ' incarcari curate din ' + INCERCARI + ' (martor: ' + martori.join(' / ') + ' ms, prag ' + PRAG_MARTOR_MS + ')')
  }
  const lcp = curate.map((c) => c.lcp).sort((a, b) => a - b)[1]
  const cls = Math.max(...curate.map((c) => c.cls))
  return { lcp, cls, curate, aruncate, martori }
}

/** Durata Event Timing a clicului pe un buton de rol (gestul intreg: acelasi `interactionId`). */
async function clicRol(browser: Browser, baza: string, lentPeLoc = 0): Promise<{ durata: number; latime: number }> {
  const context = await browser.newContext({ baseURL: baza, viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' })
  try {
    await context.addInitScript(() => {
      const w = window as unknown as { __gesturi: { nume: string; id: number; durata: number }[] }
      w.__gesturi = []
      type Intrare = PerformanceEntry & { interactionId?: number }
      new PerformanceObserver((lista) => {
        for (const e of lista.getEntries() as Intrare[]) {
          if (e.interactionId) w.__gesturi.push({ nume: e.name, id: e.interactionId, durata: e.duration })
        }
      }).observe({ type: 'event', buffered: true, durationThreshold: 16 } as PerformanceObserverInit)
    })
    const page = await context.newPage()
    const cdp = await context.newCDPSession(page)
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: INCETINIRE_CPU })
    await page.goto(PAGINI[2], { waitUntil: 'networkidle' })
    const latime = await page.evaluate(() => window.innerWidth)
    await page.locator('section[data-sectiune="portal"] [role="group"]').scrollIntoViewIfNeeded()
    await page.waitForTimeout(1500)
    const b = await butonRol(page, 'echipa').boundingBox()
    if (!b) throw new Error('butonul de rol nu are cutie')
    await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2)
    await page.waitForTimeout(400)
    await page.evaluate((ms) => {
      ;(window as unknown as { __gesturi: unknown[] }).__gesturi = []
      if (ms > 0) {
        document.addEventListener(
          'click',
          () => {
            const t = performance.now()
            while (performance.now() - t < ms) {
              // firul principal ramane ocupat: clicul se face lent pe loc
            }
          },
          { capture: true, once: true },
        )
      }
    }, lentPeLoc)
    await page.mouse.down()
    await page.mouse.up()
    await expect(butonRol(page, 'echipa')).toHaveAttribute('aria-pressed', 'true')
    await page.waitForTimeout(1200)
    const gesturi = await page.evaluate(() => (window as unknown as { __gesturi: { nume: string; id: number; durata: number }[] }).__gesturi)
    const clic = gesturi.find((g) => g.nume === 'click')
    // Sub 16 ms navigatorul nu raporteaza intrarea deloc: gestul a fost sub prag.
    const durata = clic ? Math.max(...gesturi.filter((g) => g.id === clic.id).map((g) => g.durata)) : 0
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: 1 })
    return { durata, latime }
  } finally {
    await context.close()
  }
}

test.describe('bugetele de la 390, procesor incetinit de 4 ori', () => {
  for (const cale of PAGINI) {
    test(cale + ': LCP <= 2500 ms (mediana a 3 incarcari curate) si CLS <= 0,1', async ({ browser, baseURL }) => {
      test.setTimeout(180_000)
      const b = await buget(browser, baseURL ?? '', cale)
      console.log(
        '[bugete ' + cale + '] innerWidth CITIT: ' + b.curate.map((c) => c.latime).join('/') + ' | LCP curate ' +
          b.curate.map((c) => Math.round(c.lcp) + ' (' + c.element + ')').join(' / ') + ' | mediana ' + Math.round(b.lcp) +
          ' ms | CLS max ' + b.cls.toFixed(4) + ' | martor ' + b.martori.join(' / ') + ' ms | aruncate ' + (b.aruncate.join(' / ') || '-'),
      )
      for (const c of b.curate) expect(c.latime).toBe(390)
      expect(b.lcp, 'LCP masurat').toBeGreaterThan(0)
      expect(b.lcp).toBeLessThanOrEqual(PRAG_LCP_MS)
      expect(b.cls).toBeLessThanOrEqual(PRAG_CLS)
    })
  }

  test('martor POZITIV: pagina servita cu 3 s intarziere TREBUIE sa treaca de 2500 ms, prin aceeasi masura', async ({ browser, baseURL }) => {
    test.setTimeout(180_000)
    const b = await buget(browser, baseURL ?? '', PAGINI[2], { raspunsTarziuMs: 3000 })
    console.log('[bugete martor pozitiv LCP] mediana ' + Math.round(b.lcp) + ' ms | ' + b.curate.map((c) => c.element).join(' / '))
    expect(b.lcp).toBeGreaterThan(PRAG_LCP_MS)
  })

  test('martor POZITIV: un bloc de 300 px inserat tarziu deasupra continutului TREBUIE sa treaca de 0,1', async ({ browser, baseURL }) => {
    test.setTimeout(90_000)
    const r = await incarcare(browser, baseURL ?? '', PAGINI[2], { deplasareTarzie: true })
    console.log('[bugete martor pozitiv CLS] CLS ' + r.cls.toFixed(4))
    expect(r.cls).toBeGreaterThan(PRAG_CLS)
  })

  test('clicul pe un rol din portal: INP <= 200 ms, mediana a 3 pagini proaspete', async ({ browser, baseURL }) => {
    test.setTimeout(150_000)
    const rulari: number[] = []
    for (let i = 0; i < 3; i++) {
      const r = await clicRol(browser, baseURL ?? '')
      expect(r.latime).toBe(390)
      rulari.push(r.durata)
    }
    const mediana = [...rulari].sort((a, b) => a - b)[1]
    console.log('[INP comutator] rulari: ' + rulari.join(' / ') + ' ms | mediana ' + mediana + ' ms')
    expect(mediana).toBeLessThanOrEqual(PRAG_INP_MS)
  })

  test('martor POZITIV: un clic tinut 250 ms pe firul principal TREBUIE vazut peste 200 ms', async ({ browser, baseURL }) => {
    test.setTimeout(90_000)
    const r = await clicRol(browser, baseURL ?? '', 250)
    console.log('[INP martor pozitiv] ' + r.durata + ' ms')
    expect(r.durata).toBeGreaterThan(PRAG_INP_MS)
  })
})
