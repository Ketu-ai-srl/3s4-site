import { expect, test, type Browser, type Page } from '@playwright/test'
import { ARTICOLE, caleArticol } from '../../src/content/blog/registru'
import { adresaMarcii } from '../../src/content/entitate'
import {
  DATA_DECLARATIE,
  GRUPE_HARTA,
  HARTA_PAGINA,
  STANDARD_ACCESIBILITATE,
  declaratieAccesibilitate,
} from '../../src/content/juridic/pagini'
import { juridicPublicat } from '../../src/content/juridic/comutator'
import { CALE_JURIDIC, SLUGURI_JURIDICE, caleDocument } from '../../src/content/juridic/publicare'
import { rutePentruHarta } from '../../src/content/rute'
import { masoaraDerapaj } from './ajutor/detectori'
import { nemasurat } from './ajutor/proiect'

/**
 * Felia `juridic` pe build-ul REAL (plan §9-§10; COMPONENTE §4.12; fisele harta-site.md si
 * accesibilitate.md). Copia cu operator sintetic are proba ei: juridic-comutator.spec.ts.
 *
 *   1. Comutatorul, pe ce se livreaza: cu operatorul din `config/operator.json` (azi `null`) cele opt
 *      pagini juridice NU exista (404), nu sunt in harta XML si nici in subsol; harta site-ului si
 *      declaratia de accesibilitate exista oricum. In ziua operatorului aceleasi probe cer invers.
 *   2. Harta site-ului, la 1440 si la 390: multimea legaturilor e exact multimea rutelor hartii XML
 *      plus articolele din registrul blogului; grila automata pe coloane de 280 cu pas de 48.
 *   3. Declaratia de accesibilitate, la 1440 si la 390: sectiunile in ordine, data, standardul
 *      citit, nicio adresa neconfirmata; blocul de 880 si paragrafele de cel mult 720.
 *   4. Bugetele de la 390 cu procesorul incetinit de 4 ori (LCP <= 2500 ms pe mediana a 3 incarcari
 *      curate, CLS <= 0,1), cu pagina-martor inaintea fiecarei incarcari si cu martor pozitiv.
 *
 * `innerWidth` se CITESTE din pagina la fiecare masuratoare si intra in raport; nu se presupune.
 */

const PUBLICAT = juridicPublicat()
const CAI_JURIDICE = [CALE_JURIDIC, ...SLUGURI_JURIDICE.map(caleDocument)]

async function deschide(page: Page, cale: string, latime: number): Promise<number> {
  await page.setViewportSize({ width: latime, height: 900 })
  const raspuns = await page.goto(cale, { waitUntil: 'networkidle' })
  if (!raspuns || raspuns.status() !== 200) nemasurat(cale + ' nu s-a servit: ' + (raspuns ? raspuns.status() : 'fara raspuns'))
  return page.evaluate(() => window.innerWidth)
}

// ---------------------------------------------------------------------------------------------
// 1. Comutatorul pe build-ul real
// ---------------------------------------------------------------------------------------------

test.describe('comutatorul paginilor juridice pe build-ul real (operator ' + (PUBLICAT ? 'numit' : 'null') + ')', () => {
  test('cele opt pagini juridice ' + (PUBLICAT ? 'raspund 200' : 'raspund 404') + '; harta si declaratia raspund 200', async ({ request }) => {
    const stari: string[] = []
    for (const cale of CAI_JURIDICE) {
      const r = await request.get(cale, { maxRedirects: 0 })
      stari.push(cale + ' ' + r.status())
      expect(r.status(), cale).toBe(PUBLICAT ? 200 : 404)
    }
    // Controlul: cele doua pagini publicate oricum raspund, deci 404-ul de mai sus nu e un server cazut.
    for (const cale of ['/harta-site', '/accesibilitate']) {
      const r = await request.get(cale)
      stari.push(cale + ' ' + r.status())
      expect(r.status(), cale).toBe(200)
    }
    // Segmentul optional nu inghite orice: o cale necunoscuta sub /juridic ramane 404 si cu operator.
    for (const cale of [CALE_JURIDIC + '/nu-exista', caleDocument('termeni') + '/in-plus']) {
      const r = await request.get(cale, { maxRedirects: 0 })
      stari.push(cale + ' ' + r.status())
      expect(r.status(), cale).toBe(404)
    }
    console.log('[comutator real] ' + stari.join(' | '))
  })

  test('harta XML: paginile juridice ' + (PUBLICAT ? 'sunt' : 'lipsesc') + ', harta si declaratia sunt', async ({ request }) => {
    const xml = await (await request.get('/sitemap.xml')).text()
    const cai = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname)
    console.log('[comutator real] harta XML: ' + cai.join(', '))
    expect(cai.length, 'harta XML nu are nicio adresa: masuratoarea n-are ce compara').toBeGreaterThan(2)
    for (const cale of CAI_JURIDICE) expect(cai.includes(cale), cale).toBe(PUBLICAT)
    expect(cai).toEqual(expect.arrayContaining(['/harta-site', '/accesibilitate']))
  })

  test('subsolul: legaturile juridice ' + (PUBLICAT ? 'sunt active' : 'nu se arata') + ', harta si accesibilitatea sunt active', async ({ page }) => {
    const latime = await deschide(page, '/', 1440)
    const subsol = page.locator('footer')
    const juridice = await subsol.locator('a[href^="' + CALE_JURIDIC + '"]').evaluateAll((a) => a.map((x) => x.getAttribute('href')))
    const inerte = await page.locator('[data-tinta-lipsa^="' + CALE_JURIDIC + '"]').count()
    console.log('[comutator real] innerWidth CITIT ' + latime + ' | legaturi juridice in subsol: ' + (juridice.join(', ') || '(niciuna)') + ' | inerte in pagina: ' + inerte)
    expect(juridice.length).toBe(PUBLICAT ? 6 : 0)
    // Nici in restul paginii: navigatia ascunde legatura fara ruta, iar corpul startului nu trimite acolo.
    expect(await page.locator('a[href^="' + CALE_JURIDIC + '"]').count()).toBe(PUBLICAT ? juridice.length : 0)
    await expect(subsol.locator('a[href="/harta-site"]')).toBeVisible()
    await expect(subsol.locator('a[href="/accesibilitate"]')).toBeVisible()
  })

  // Martorul NEGATIV al celor trei masuri de mai sus: aceleasi detectoare (starea raspunsului,
  // adresele din harta XML, legaturile active din subsol), puse pe cele doua pagini care exista
  // oricare ar fi operatorul, TREBUIE sa le gaseasca. Altfel "lipsesc" de mai sus ar putea veni
  // dintr-un detector orb, nu din comutator.
  test('martor NEGATIV: harta si declaratia, prin aceleasi masuri, NU ies lipsa (200, in harta XML, active in subsol)', async ({ request, page }) => {
    const prezente = ['/accesibilitate', '/harta-site']
    const stari: number[] = []
    for (const cale of prezente) stari.push((await request.get(cale, { maxRedirects: 0 })).status())
    const xml = await (await request.get('/sitemap.xml')).text()
    const inXml = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname)
    const latime = await deschide(page, '/', 1440)
    const inSubsol = await page
      .locator(prezente.map((c) => 'footer a[href="' + c + '"]').join(', '))
      .evaluateAll((a) => a.map((x) => x.getAttribute('href') ?? ''))
    console.log('[martor negativ real] innerWidth CITIT ' + latime + ' | stari ' + stari.join('/') + ' | in subsol: ' + inSubsol.join(', '))
    expect(stari).toEqual([200, 200])
    for (const cale of prezente) expect(inXml, cale).toContain(cale)
    expect([...inSubsol].sort()).toEqual(prezente)
  })
})

// ---------------------------------------------------------------------------------------------
// 2. Harta site-ului
// ---------------------------------------------------------------------------------------------

type MasuraHarta = {
  innerWidth: number
  scrollWidth: number
  grupe: { titlu: string; x: number; y: number; latime: number; legaturi: string[] }[]
  latimeGrila: number
  pas: string
  margineSus: string
  latimeMaxima: string
  titluGrupa: { marime: string; greutate: string }
  legatura: { marime: string; inaltimeRand: string }
  h1: string
  subtitlu: string
  textMain: string
}

async function masoaraHarta(page: Page): Promise<MasuraHarta> {
  return page.evaluate(() => {
    const grila = document.querySelector('[data-harta-grupe]') as HTMLElement
    const stil = getComputedStyle(grila)
    const grupe = Array.from(grila.querySelectorAll('section[data-grupa]')).map((s) => {
      const c = s.getBoundingClientRect()
      return {
        titlu: s.getAttribute('data-grupa') ?? '',
        x: Math.round(c.left),
        y: Math.round(c.top + window.scrollY),
        latime: Math.round(c.width),
        legaturi: Array.from(s.querySelectorAll('a')).map((a) => a.getAttribute('href') ?? ''),
      }
    })
    const h2 = grila.querySelector('h2') as HTMLElement
    const a = grila.querySelector('a') as HTMLElement
    return {
      innerWidth: window.innerWidth,
      scrollWidth: document.documentElement.scrollWidth,
      grupe,
      latimeGrila: grila.getBoundingClientRect().width,
      pas: stil.columnGap,
      margineSus: stil.marginTop,
      latimeMaxima: stil.maxWidth,
      titluGrupa: { marime: getComputedStyle(h2).fontSize, greutate: getComputedStyle(h2).fontWeight },
      legatura: { marime: getComputedStyle(a).fontSize, inaltimeRand: getComputedStyle(a).lineHeight },
      h1: document.querySelector('main h1')?.textContent ?? '',
      subtitlu: document.querySelector('main header p')?.textContent ?? '',
      textMain: (document.querySelector('main') as HTMLElement).innerText,
    }
  })
}

test.describe('harta site-ului', () => {
  const asteptate = [...rutePentruHarta().map((r) => r.cale), ...ARTICOLE.map(caleArticol)].sort()

  for (const latime of [1440, 390]) {
    test('la ' + latime + ': exact rutele hartii XML si articolele, grupate in ordinea subsolului', async ({ page }) => {
      const citita = await deschide(page, '/harta-site', latime)
      const m = await masoaraHarta(page)
      console.log(
        '[harta ' + latime + '] innerWidth CITIT ' + citita + ' | grila ' + m.latimeGrila.toFixed(1) + ' px, pas ' + m.pas +
          ', margine ' + m.margineSus + ', max ' + m.latimeMaxima + ' | grupe: ' +
          m.grupe.map((g) => g.titlu + '@' + g.x + ',' + g.y + ' (' + g.legaturi.length + ')').join('; '),
      )
      expect(citita).toBe(latime)
      expect(m.h1).toBe(HARTA_PAGINA.titlu)
      expect(m.subtitlu).toBe(HARTA_PAGINA.subtitlu)

      // Multimea legaturilor: nici una in plus, nici una lipsa, niciuna de doua ori.
      const gasite = m.grupe.flatMap((g) => g.legaturi)
      expect([...gasite].sort()).toEqual(asteptate)
      expect(new Set(gasite).size).toBe(gasite.length)
      expect(m.textMain).not.toContain('undefined')
      // Grupele, in ordinea coloanelor din subsol, fara grupe goale.
      const ordine = GRUPE_HARTA.filter((g) => m.grupe.some((x) => x.titlu === g))
      expect(m.grupe.map((g) => g.titlu)).toEqual(ordine)
      for (const g of m.grupe) expect(g.legaturi.length, g.titlu).toBeGreaterThan(0)

      // Grila (harta-site.md): auto-fill pe coloane de minimum 280, pas si margine sus 48; la <= 768
      // o coloana, pas si margine 40. La 1440 fisa masoara 3 coloane de 334,66.
      const pas = latime > 768 ? 48 : 40
      expect(m.pas).toBe(pas + 'px')
      expect(m.margineSus).toBe(pas + 'px')
      expect(m.latimeMaxima).toBe('1100px')
      expect(m.titluGrupa).toEqual({ marime: '16px', greutate: '600' })
      expect(m.legatura).toEqual({ marime: '14px', inaltimeRand: '19.6px' })
      const coloane = Math.max(1, Math.floor((m.latimeGrila + pas) / (280 + pas)))
      if (latime === 1440) expect(coloane).toBe(3)
      const primulRand = m.grupe.filter((g) => g.y === m.grupe[0].y)
      expect(primulRand.length).toBe(Math.min(coloane, m.grupe.length))
      if (primulRand.length > 1) {
        const coloana = (m.latimeGrila - (coloane - 1) * pas) / coloane
        expect(Math.abs(primulRand[1].x - primulRand[0].x - (coloana + pas))).toBeLessThanOrEqual(1)
      }
      if (latime === 390) {
        expect(new Set(m.grupe.map((g) => g.x)).size).toBe(1)
        const d = await masoaraDerapaj(page, 390)
        expect(d.scrollWidth, 'derapaj: ' + d.vinovati.join(', ')).toBeLessThanOrEqual(d.innerWidth)
      }
    })
  }
})

// ---------------------------------------------------------------------------------------------
// 3. Declaratia de accesibilitate
// ---------------------------------------------------------------------------------------------

test.describe('declaratia de accesibilitate', () => {
  const declaratie = declaratieAccesibilitate('necitit', adresaMarcii())

  for (const latime of [1440, 390]) {
    test('la ' + latime + ': sectiunile in ordine, data, standardul citit si forma sablonului ingust', async ({ page }) => {
      const citita = await deschide(page, '/accesibilitate', latime)
      const m = await page.evaluate(() => {
        const main = document.querySelector('main') as HTMLElement
        const sm = getComputedStyle(main)
        const h1 = main.querySelector('h1') as HTMLElement
        const bloc = h1.closest('header')?.parentElement as HTMLElement
        const data = main.querySelector('time') as HTMLElement
        const paragrafe = Array.from(main.querySelectorAll('[data-declaratie] p')) as HTMLElement[]
        const sectiuni = Array.from(main.querySelectorAll('section[data-declaratie]')) as HTMLElement[]
        const h2 = sectiuni[0].querySelector('h2') as HTMLElement
        return {
          innerWidth: window.innerWidth,
          sus: sm.paddingTop,
          jos: sm.paddingBottom,
          h1: h1.textContent,
          latimeBloc: bloc.getBoundingClientRect().width,
          blocMax: getComputedStyle(bloc).maxWidth,
          data: { text: data.textContent, dateTime: data.getAttribute('datetime'), marime: getComputedStyle(data.parentElement as HTMLElement).fontSize, jos: getComputedStyle(data.parentElement as HTMLElement).marginBottom },
          sectiuni: sectiuni.map((s) => ({ id: s.getAttribute('data-declaratie'), h2: s.querySelector('h2')?.textContent ?? '', jos: getComputedStyle(s).marginBottom })),
          h2Jos: getComputedStyle(h2).marginBottom,
          paragrafMax: Math.max(...paragrafe.map((p) => p.getBoundingClientRect().width)),
          paragraf: { marime: getComputedStyle(paragrafe[0]).fontSize, rand: getComputedStyle(paragrafe[0]).lineHeight },
          mailto: main.querySelectorAll('a[href^="mailto:"]').length,
          standard: Array.from(main.querySelectorAll('a')).map((a) => a.getAttribute('href')),
          curent: document.querySelector('nav[aria-label="Fir de navigare"] [aria-current="page"]')?.textContent ?? '',
          scrollWidth: document.documentElement.scrollWidth,
        }
      })
      console.log(
        '[accesibilitate ' + latime + '] innerWidth CITIT ' + citita + ' | zona ' + m.sus + ' / ' + m.jos + ' | bloc ' +
          m.latimeBloc.toFixed(1) + ' (max ' + m.blocMax + ') | paragraf max ' + m.paragrafMax.toFixed(1) + ' | sectiuni ' +
          m.sectiuni.map((s) => s.id).join(', ') + ' | scrollWidth ' + m.scrollWidth,
      )
      expect(citita).toBe(latime)
      expect(m.h1).toBe(declaratie.titlu)
      expect(m.curent).toBe(declaratie.titlu)
      expect(m.data).toEqual({ text: declaratie.data, dateTime: DATA_DECLARATIE, marime: '14px', jos: '48px' })
      expect(m.sectiuni.map((s) => s.id)).toEqual(declaratie.sectiuni.map((s) => s.id))
      expect(m.sectiuni.map((s) => s.h2)).toEqual(declaratie.sectiuni.map((s) => s.titlu))
      for (const s of m.sectiuni) expect(s.jos, s.id ?? '').toBe('40px')
      expect(m.h2Jos).toBe('12px')
      expect(m.standard).toContain(STANDARD_ACCESIBILITATE.adresa)
      // Adresa pentru semnalari apare numai confirmata in config/brand.json.
      expect(m.mailto).toBe(adresaMarcii() === null ? 0 : 1)
      // Sablonul ingust: bloc de 880, paragrafe de cel mult 720, 16/27,2.
      expect(m.blocMax).toBe('880px')
      expect(m.latimeBloc).toBeLessThanOrEqual(880.5)
      expect(m.paragrafMax).toBeLessThanOrEqual(720.5)
      expect(m.paragraf).toEqual({ marime: '16px', rand: '27.2px' })
      expect([m.sus, m.jos]).toEqual(latime > 767 ? ['120px', '80px'] : ['88px', '56px'])
      expect(m.scrollWidth).toBeLessThanOrEqual(m.innerWidth)
    })
  }
})

// ---------------------------------------------------------------------------------------------
// 4. Bugetele de la 390, procesor incetinit de 4 ori
// ---------------------------------------------------------------------------------------------

const INCETINIRE_CPU = 4
const PRAG_LCP_MS = 2500
const PRAG_CLS = 0.1
/** Pagina-martor, servita de proba insasi pe originea site-ului: titlu, paragraf, nimic altceva. */
const CALE_MARTOR = '/__martor-lcp-juridic'
const HTML_MARTOR =
  '<!doctype html><html lang="ro"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">' +
  '<title>Martor</title></head><body style="margin:0;font:16px system-ui"><main style="padding:48px 16px">' +
  '<h1 style="font-size:32px;line-height:1.2;margin:0">Un titlu de doua randuri, cat al unei pagini juridice</h1>' +
  '<p>Un paragraf scurt sub titlu.</p></main></body></html>'
/** Peste 250 ms pentru pagina-martor, masina e ocupata de altceva: incarcarea se arunca si se reia. */
const PRAG_MARTOR_MS = 250
const INCARCARI_CURATE = 3
const INCERCARI = 8

type Incarcare = { lcp: number; element: string; cls: number; latime: number }

async function incarcare(browser: Browser, baza: string, cale: string, raspunsTarziuMs = 0): Promise<Incarcare> {
  const context = await browser.newContext({ baseURL: baza, viewport: { width: 390, height: 844 }, reducedMotion: 'no-preference' })
  try {
    if (cale === CALE_MARTOR) {
      await context.route('**' + CALE_MARTOR, (r) => r.fulfill({ status: 200, contentType: 'text/html; charset=utf-8', body: HTML_MARTOR }))
    }
    if (raspunsTarziuMs > 0) {
      await context.route('**' + cale, async (r) => {
        await new Promise((gata) => setTimeout(gata, raspunsTarziuMs))
        await r.continue()
      })
    }
    await context.addInitScript(() => {
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
    })
    const page = await context.newPage()
    const cdp = await context.newCDPSession(page)
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: INCETINIRE_CPU })
    await page.goto(cale, { waitUntil: 'load' })
    await page.waitForTimeout(cale === CALE_MARTOR ? 1500 : 5000)
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

async function buget(browser: Browser, baza: string, cale: string, raspunsTarziuMs = 0) {
  const curate: Incarcare[] = []
  const aruncate: number[] = []
  const martori: number[] = []
  for (let i = 0; i < INCERCARI && curate.length < INCARCARI_CURATE; i++) {
    const m = await incarcare(browser, baza, CALE_MARTOR)
    martori.push(Math.round(m.lcp))
    const r = await incarcare(browser, baza, cale, raspunsTarziuMs)
    if (m.lcp > 0 && m.lcp <= PRAG_MARTOR_MS) curate.push(r)
    else aruncate.push(Math.round(r.lcp))
  }
  if (curate.length < INCARCARI_CURATE) {
    nemasurat(cale + ': numai ' + curate.length + ' incarcari curate din ' + INCERCARI + ' (martor: ' + martori.join(' / ') + ' ms)')
  }
  const lcp = curate.map((c) => c.lcp).sort((a, b) => a - b)[1]
  const cls = Math.max(...curate.map((c) => c.cls))
  return { lcp, cls, curate, aruncate, martori }
}

test.describe('bugetele de la 390, procesor incetinit de 4 ori', () => {
  // Cu operator numit, bugetul se cere si pe cel mai lung document al sablonului A; pana atunci il
  // masoara copia cu operator sintetic (juridic-comutator.spec.ts).
  for (const cale of ['/accesibilitate', '/harta-site', ...(PUBLICAT ? [caleDocument('termeni')] : [])]) {
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

  test('martor POZITIV: declaratia servita cu 3 s intarziere TREBUIE sa treaca de 2500 ms, prin aceeasi masura', async ({ browser, baseURL }) => {
    test.setTimeout(180_000)
    const b = await buget(browser, baseURL ?? '', '/accesibilitate', 3000)
    console.log('[bugete martor pozitiv] mediana ' + Math.round(b.lcp) + ' ms | ' + b.curate.map((c) => c.element).join(' / '))
    expect(b.lcp).toBeGreaterThan(PRAG_LCP_MS)
  })
})
