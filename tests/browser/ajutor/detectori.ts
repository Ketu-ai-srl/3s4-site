import AxeBuilder from '@axe-core/playwright'
import type { Browser, Page } from '@playwright/test'
import { CHEIE_ALEGERE } from '../../../src/components/consimtamant/stocare'
import { nemasurat } from './proiect'

/**
 * Detectoarele portilor de browser.
 *
 * Sunt scoase din probe in mod deliberat: martorul pozitiv, martorul negativ si pagina
 * reala trebuie sa treaca prin ACELASI cod. Un control care ruleaza alta functie decat
 * poarta nu dovedeste nimic despre poarta.
 */

// ---------------------------------------------------------------------------
// 0. Accesibilitate (axe-core injectat in pagina randata)
// ---------------------------------------------------------------------------

export type IncalcareAxe = {
  regula: string
  impact: string
  noduri: number
  descriere: string
  tinte: string[]
}

export type MasuraAxe = {
  grave: IncalcareAxe[]
  usoare: IncalcareAxe[]
  reguliRulate: number
  versiuneAxe: string
}

// Pragul din `PA-03`: opresc doar `critical` si `serious`. `minor` si `moderate` se
// raporteaza, ca sa fie vizibile, dar nu blocheaza lotul. Incadrarea se schimba automat
// in ziua in care steagurile juridice trec poarta in clasa LEGAL, si atunci lista de mai
// jos e singurul loc de modificat.
export const IMPACTURI_BLOCANTE = ['critical', 'serious']

export async function masoaraAccesibilitatea(page: Page): Promise<MasuraAxe> {
  const rezultat = await new AxeBuilder({ page }).analyze()

  const converteste = (v: (typeof rezultat.violations)[number]): IncalcareAxe => ({
    regula: v.id,
    impact: v.impact ?? 'necunoscut',
    noduri: v.nodes.length,
    descriere: v.help,
    // Pana la 5 tinte, nu doar prima: un raport care spune doar CA exista contrast prost
    // trimite omul sa caute manual prin toata pagina. Opt noduri inseamna opt locuri.
    tinte: v.nodes.slice(0, 5).map((n) => (n.target ?? []).join(' ')),
  })

  const grave = rezultat.violations
    .filter((v) => IMPACTURI_BLOCANTE.includes(v.impact ?? ''))
    .map(converteste)
  const usoare = rezultat.violations
    .filter((v) => !IMPACTURI_BLOCANTE.includes(v.impact ?? ''))
    .map(converteste)

  const reguliRulate =
    rezultat.violations.length +
    rezultat.passes.length +
    rezultat.incomplete.length +
    rezultat.inapplicable.length

  // Zero incalcari poate insemna "curat" sau "axe nu a rulat nimic". Fara numarul de
  // reguli evaluate, cele doua stari arata identic in raport.
  if (reguliRulate === 0) {
    nemasurat('axe-core nu a evaluat nicio regula pe ' + page.url())
  }

  return { grave, usoare, reguliRulate, versiuneAxe: rezultat.testEngine.version }
}

// ---------------------------------------------------------------------------
// 1. Derapaj orizontal
// ---------------------------------------------------------------------------

export type MasuraDerapaj = {
  latimeCeruta: number
  innerWidth: number
  scrollWidth: number
  devicePixelRatio: number
  vinovati: string[]
}

/**
 * `innerWidth` se CITESTE din pagina dupa redimensionare, nu se presupune egal cu
 * latimea ceruta. Raportul de pixeli nu e constant intre rulari (masurat 1.5 si 1.0 pe
 * aceeasi masina, la doua saptamani distanta), deci orice factor de inmultire fix ar fi
 * o presupunere deghizata in masuratoare.
 */
export async function masoaraDerapaj(page: Page, latimeCeruta: number): Promise<MasuraDerapaj> {
  await page.setViewportSize({ width: latimeCeruta, height: 844 })
  await page.waitForLoadState('networkidle')

  const masura = await page.evaluate(() => {
    const innerWidth = window.innerWidth
    const scrollWidth = document.documentElement.scrollWidth
    const vinovati: string[] = []
    if (scrollWidth > innerWidth) {
      // Cine depaseste: se listeaza elementele care ies in dreapta, ca raportul sa
      // spuna UNDE e defectul, nu doar ca exista.
      for (const el of Array.from(document.querySelectorAll('body *'))) {
        const cutie = el.getBoundingClientRect()
        if (cutie.width === 0 && cutie.height === 0) continue
        if (cutie.right > innerWidth + 1) {
          const eticheta =
            el.tagName.toLowerCase() +
            (el.id ? '#' + el.id : '') +
            (typeof el.className === 'string' && el.className
              ? '.' + el.className.trim().split(/\s+/).slice(0, 3).join('.')
              : '')
          if (!vinovati.includes(eticheta)) vinovati.push(eticheta)
          if (vinovati.length >= 10) break
        }
      }
    }
    return {
      innerWidth,
      scrollWidth,
      devicePixelRatio: window.devicePixelRatio,
      vinovati,
    }
  })

  return { latimeCeruta, ...masura }
}

// ---------------------------------------------------------------------------
// 2. Raspuns in HTML brut, cu JavaScript dezactivat
// ---------------------------------------------------------------------------

export type MasuraHtmlBrut = {
  titluCuJs: string
  titluFaraJs: string
  paragrafeAsteptate: string[]
  paragrafeLipsa: string[]
}

const LUNGIME_MINIMA_PARAGRAF = 40

function normalizeaza(text: string): string {
  return text.replace(/\s+/g, ' ').trim()
}

/**
 * Asteptarea NU e scrisa de mana: se randeaza pagina cu JavaScript pornit, se iau titlul
 * si primele doua paragrafe de acolo, apoi se cere aceeasi substanta din HTML-ul livrat
 * fara JavaScript. Asa poarta nu devine falsa cand cineva rescrie textul, dar ramane rosie
 * cand textul migreaza in JavaScript, adica exact clasa pe care o vaneaza.
 *
 * Pragul de 40 de caractere alege paragrafe de continut, nu etichete scurte care s-ar
 * potrivi trivial. Sub doua paragrafe eligibile, masuratoarea e invalida, nu curata.
 */
export async function masoaraHtmlBrut(browser: Browser, url: string): Promise<MasuraHtmlBrut> {
  const cuJs = await browser.newContext({ javaScriptEnabled: true })
  const paginaCuJs = await cuJs.newPage()
  await paginaCuJs.goto(url, { waitUntil: 'networkidle' })
  const titluCuJs = normalizeaza(await paginaCuJs.title())
  const paragrafeAsteptate = await paginaCuJs.evaluate((minim) => {
    const gasite: string[] = []
    for (const p of Array.from(document.querySelectorAll('p'))) {
      const text = (p.textContent ?? '').replace(/\s+/g, ' ').trim()
      if (text.length >= minim) gasite.push(text)
      if (gasite.length === 2) break
    }
    return gasite
  }, LUNGIME_MINIMA_PARAGRAF)
  await cuJs.close()

  if (paragrafeAsteptate.length < 2) {
    nemasurat(
      'pagina randata are ' +
        paragrafeAsteptate.length +
        ' paragraf(e) de cel putin ' +
        LUNGIME_MINIMA_PARAGRAF +
        ' caractere, deci nu exista ce compara in HTML-ul brut: ' +
        url,
    )
  }

  const faraJs = await browser.newContext({ javaScriptEnabled: false })
  const paginaFaraJs = await faraJs.newPage()
  await paginaFaraJs.goto(url, { waitUntil: 'domcontentloaded' })
  const titluFaraJs = normalizeaza(await paginaFaraJs.title())
  const textBrut = normalizeaza(
    await paginaFaraJs.evaluate(() => document.body.innerText || document.body.textContent || ''),
  )
  await faraJs.close()

  const paragrafeLipsa = paragrafeAsteptate.filter((p) => !textBrut.includes(p))
  return { titluCuJs, titluFaraJs, paragrafeAsteptate, paragrafeLipsa }
}

// ---------------------------------------------------------------------------
// 3. Terti si consimtamant
// ---------------------------------------------------------------------------

export type MasuraTerti = {
  gazdaProprie: string
  gazdeStraine: string[]
  cereriStraine: string[]
  totalCereri: number
  bannerGasit: boolean
  refuzApasat: boolean
  cookies: string[]
  cheiStocare: string[]
  /** Cookie-urile si stocarea citite INAINTE de orice interactiune, dupa linistea retelei. */
  cookiesInainte: string[]
  cheiStocareInainte: string[]
}

export type OptiuniTerti = {
  /**
   * Cererile catre alte gazde se inregistreaza si apoi se BLOCHEAZA la retea: masuratoarea le
   * vede, dar nu pleaca nicaieri. Pentru copiile cu analitica pornita (proba comutatorului), unde
   * un defect ar trimite altfel o cerere reala catre Google.
   */
  blocheazaStraine?: boolean
}

/**
 * Cheia sub care bannerul pastreaza alegerea: SINGURA stocare permisa dupa un refuz. E strict
 * necesara (Legea 506/2004 art. 4 alin. (6) lit. b)) - fara ea refuzul n-ar putea fi respectat pe
 * pagina urmatoare - si e declarata in politica de cookie-uri (`COOKIE_ALEGERE`).
 *
 * DE CE EXISTA (poarta C-01, decizia owner-ului din 24.09, planul valului S4 §8-§10): bannerul
 * intra pe drumul cu GA4, iar un refuz respectat LASA aceasta cheie. Fara exceptie, C-01 s-ar
 * inrosi pe site-ul corect exact in ziua operatorului. Exceptia e ingusta: o cheie, numai in
 * `localStorage`, numai dupa un refuz apasat efectiv; inainte de interactiune stocarea trebuie sa
 * fie goala (`cheiStocareInainte`), deci o pagina care o scrie la incarcare e prinsa.
 */
export const STOCARE_ALEGERE = 'localStorage:' + CHEIE_ALEGERE

/** Stocarea care NU e alegerea unui refuz apasat. Lista goala = curat. */
export function stocareNedeclarata(m: Pick<MasuraTerti, 'cheiStocare' | 'refuzApasat'>): string[] {
  const permise = m.refuzApasat ? [STOCARE_ALEGERE] : []
  return m.cheiStocare.filter((k) => !permise.includes(k))
}

async function citesteStocarea(pagina: Page): Promise<string[]> {
  return pagina.evaluate(() => {
    const chei: string[] = []
    try {
      for (let i = 0; i < localStorage.length; i++) chei.push('localStorage:' + localStorage.key(i))
      for (let i = 0; i < sessionStorage.length; i++)
        chei.push('sessionStorage:' + sessionStorage.key(i))
    } catch {
      chei.push('stocare inaccesibila')
    }
    return chei
  })
}

function gazdaCererii(url: string): string {
  try {
    return new URL(url).host
  } catch {
    return ''
  }
}

/**
 * Context nou, storageState gol, zero interactiune inainte de masuratoare. Daca apare un
 * banner, se apasa REFUZ si abia apoi se lasa pagina sa mai respire: poarta trebuie sa
 * spuna ce pleaca in scenariul in care utilizatorul a spus nu.
 *
 * Inainte de clic, dupa linistea retelei, se citesc cookie-urile si stocarea: ce exista ATUNCI
 * s-a scris fara nicio interactiune. Cererile se inregistreaza pe tot parcursul, deci si cele de
 * dinaintea clicului.
 *
 * Cookie-urile se citesc din context (`context.cookies()`), nu din `document.cookie`,
 * fiindca al doilea nu vede cookie-urile `HttpOnly`.
 */
export async function masoaraTerti(
  browser: Browser,
  url: string,
  optiuni: OptiuniTerti = {},
): Promise<MasuraTerti> {
  const context = await browser.newContext()
  const pagina = await context.newPage()
  const gazdaProprie = new URL(url).host

  const cereri: string[] = []
  pagina.on('request', (cerere) => cereri.push(cerere.url()))
  context.on('request', (cerere) => cereri.push(cerere.url()))
  if (optiuni.blocheazaStraine) {
    await context.route('**/*', (ruta) => {
      const gazda = gazdaCererii(ruta.request().url())
      return gazda !== '' && gazda !== gazdaProprie ? ruta.abort('blockedbyclient') : ruta.continue()
    })
  }

  await pagina.goto(url, { waitUntil: 'domcontentloaded' })

  await pagina.waitForLoadState('networkidle').catch(() => {})
  const cheiStocareInainte = await citesteStocarea(pagina)
  const cookiesInainte = (await context.cookies()).map((c) => c.name + '@' + c.domain)

  let bannerGasit = false
  let refuzApasat = false
  const banner = pagina.locator('[data-consimtamant]').first()
  if (await banner.count()) {
    bannerGasit = true
    const refuz = banner.locator('[data-refuz], button:has-text("Refuz")').first()
    if (await refuz.count()) {
      await refuz.click()
      refuzApasat = true
    }
  }

  // Se asteapta linistea retelei si inca putin: un tert intarziat dintr-un `setTimeout`
  // ar scapa sub un prag prea scurt.
  await pagina.waitForLoadState('networkidle').catch(() => {})
  await pagina.waitForTimeout(3000)

  const cheiStocare = await citesteStocarea(pagina)

  const cookies = (await context.cookies()).map((c) => c.name + '@' + c.domain)
  await context.close()

  const cereriStraine = cereri.filter((u) => {
    const gazda = gazdaCererii(u)
    return gazda !== '' && gazda !== gazdaProprie
  })
  const gazdeStraine = [...new Set(cereriStraine.map((u) => new URL(u).host))].sort()

  return {
    gazdaProprie,
    gazdeStraine,
    cereriStraine,
    totalCereri: cereri.length,
    bannerGasit,
    refuzApasat,
    cookies,
    cheiStocare,
    cookiesInainte,
    cheiStocareInainte,
  }
}

// ---------------------------------------------------------------------------
// 4. Legaturi si imagini
// ---------------------------------------------------------------------------

export type MasuraLegaturi = {
  legaturiInterne: number
  ancore: number
  imagini: number
  ancoreMoarte: string[]
  legaturiMoarte: string[]
  imaginiFaraAlt: string[]
}

export async function masoaraLegaturiSiImagini(page: Page): Promise<MasuraLegaturi> {
  const cules = await page.evaluate(() => {
    const interne: string[] = []
    const ancoreMoarte: string[] = []
    let ancore = 0

    for (const a of Array.from(document.querySelectorAll('a[href]'))) {
      const brut = a.getAttribute('href') ?? ''
      if (/^(mailto:|tel:|sms:|javascript:)/i.test(brut)) continue

      const absolut = new URL(brut, document.baseURI)
      if (absolut.origin !== location.origin) continue

      if (absolut.hash) {
        ancore++
        const id = decodeURIComponent(absolut.hash.slice(1))
        if (id !== '' && id !== 'top') {
          const tinta =
            document.getElementById(id) ?? document.querySelector('[name="' + id + '"]')
          // O ancora se verifica doar in pagina care o poarta: alta pagina are alt DOM.
          if (!tinta && absolut.pathname === location.pathname) {
            ancoreMoarte.push(brut)
          }
        }
      }

      if (absolut.pathname !== location.pathname || !absolut.hash) {
        interne.push(absolut.origin + absolut.pathname + absolut.search)
      }
    }

    const imaginiFaraAlt: string[] = []
    const imagini = Array.from(document.querySelectorAll('img'))
    for (const img of imagini) {
      const alt = img.getAttribute('alt')
      const decorativa =
        img.getAttribute('role') === 'presentation' ||
        img.getAttribute('role') === 'none' ||
        img.getAttribute('aria-hidden') === 'true'
      // Lipsa atributului e defect intotdeauna. Alt gol e permis DOAR pe o imagine
      // marcata explicit ca decorativa: altfel e "am uitat", nu "am decis".
      if (alt === null || (alt.trim() === '' && !decorativa)) {
        imaginiFaraAlt.push(img.getAttribute('src')?.slice(0, 80) ?? '(fara src)')
      }
    }

    return {
      interne: [...new Set(interne)],
      ancore,
      ancoreMoarte,
      imagini: imagini.length,
      imaginiFaraAlt,
    }
  })

  const legaturiMoarte: string[] = []
  for (const adresa of cules.interne) {
    const raspuns = await page.request.get(adresa, { failOnStatusCode: false })
    if (raspuns.status() >= 400) legaturiMoarte.push(adresa + ' -> ' + raspuns.status())
  }

  return {
    legaturiInterne: cules.interne.length,
    ancore: cules.ancore,
    imagini: cules.imagini,
    ancoreMoarte: cules.ancoreMoarte,
    legaturiMoarte,
    imaginiFaraAlt: cules.imaginiFaraAlt,
  }
}
