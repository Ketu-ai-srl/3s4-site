import { createHash } from 'node:crypto'
import type { Browser, Page } from '@playwright/test'
import { navigheaza } from './navigare'
import { nemasurat } from './proiect'

/**
 * Detectoarele GEO (planul valului S4, §8.3; cercetarea cautare-agenti-ai, P1 si P2; planul E5,
 * pasii 25-26): ce ajunge la un robot care NU executa JavaScript. Pagina reala si martorii trec
 * prin aceleasi functii de aici.
 *
 * TEXTUL SERVIT se citeste din pagina deschisa cu JavaScript OPRIT: nodurile de text, cu un spatiu
 * la fiecare granita de element care nu e `inline`, fara `script`, `style` si `template`. Asa:
 *   - payload-ul RSC din `<script>` nu intra in text (un `textContent` pe HTML-ul luat cu `fetch`
 *     l-ar include si ar raporta paritate pe continut pe care nu-l vede nimeni);
 *   - textul ascuns prin CSS pana la hidratare intra, fiindca e in HTML si un robot il citeste;
 *   - doua blocuri vecine nu se lipesc intr-un cuvant, dar "3<span>S</span>" ramane "3S".
 */

/** Pragul de paritate brut / randat: 95%, ales de cercetare, calibrabil numai cu motiv scris. */
export const PRAG_PARITATE = 0.95

/** Fereastra in care trebuie sa stea raspunsul paginii, in cuvinte. */
export const FEREASTRA_RASPUNS = 400

/** Lungimea primului paragraf din `<main>`, in cuvinte (P2). */
export const PARAGRAF_MIN = 30
export const PARAGRAF_MAX = 80

/**
 * Deschideri care fac paragraful dependent de ce e inaintea lui (pronume de reluare) sau il
 * transforma in brosura. Forma normalizata: fara diacritice, minuscule.
 */
export const DESCHIDERI_INTERZISE = [
  'acesta',
  'aceasta',
  'acestea',
  'acestia',
  'el',
  'ea',
  'ei',
  'ele',
  'in lumea de azi',
  'suntem o companie',
  'solutia noastra',
]

/** Fara diacritice, minuscule, spatii simple. */
export function normalizeaza(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase()
}

/** Cuvintele unui text normalizat. */
export function cuvinte(text: string): string[] {
  return normalizeaza(text).split(' ').filter((c) => /[a-z0-9]/.test(c))
}

/** Entitatea apare ca secventa intreaga de cuvinte (nu ca bucata dintr-un cuvant mai lung). */
export function contineEntitatea(text: string, entitate: string): boolean {
  const e = normalizeaza(entitate).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return new RegExp('(^|[^a-z0-9])' + e + '($|[^a-z0-9])').test(normalizeaza(text))
}

/** Propozitiile unui text randat: pe randuri, apoi dupa punct, semnul intrebarii sau exclamarii. */
export function propozitii(text: string): string[] {
  return text
    .split(/\n+/)
    .flatMap((rand) => rand.split(/(?<=[.!?])\s+/))
    .map((p) => p.replace(/\s+/g, ' ').trim())
    .filter((p) => /[\p{L}\p{N}]/u.test(p))
}

/**
 * Textul servit al primului element care se potriveste cu `selector`, citit in pagina deschisa
 * fara JavaScript. `null` cand elementul lipseste.
 */
async function textServitDin(pagina: Page, selector: string): Promise<string | null> {
  return pagina.evaluate((sel) => {
    const radacina = document.querySelector(sel)
    if (!radacina) return null
    const sari = new Set(['SCRIPT', 'STYLE', 'TEMPLATE'])
    const parcurge = (nod: Node): string => {
      let text = ''
      for (const copil of Array.from(nod.childNodes)) {
        if (copil.nodeType === Node.TEXT_NODE) {
          text += copil.nodeValue ?? ''
        } else if (copil.nodeType === Node.ELEMENT_NODE) {
          const el = copil as Element
          if (sari.has(el.tagName)) continue
          // Numai `inline` (si `contents`) lipeste textul de vecini; `inline-flex`, `inline-block`
          // si restul sunt cutii separate pe ecran, deci si cuvinte separate.
          const afisare = getComputedStyle(el).display
          const bloc = el.tagName === 'BR' || (afisare !== 'inline' && afisare !== 'contents')
          text += (bloc ? ' ' : '') + parcurge(el) + (bloc ? ' ' : '')
        }
      }
      return text
    }
    return parcurge(radacina)
  }, selector)
}

async function deschideFaraJs(browser: Browser, url: string): Promise<{ pagina: Page; inchide: () => Promise<void> }> {
  const context = await browser.newContext({ javaScriptEnabled: false })
  const pagina = await context.newPage()
  // Prin `navigheaza`: eroarea de transport a masinii de rulare se reia, nu pica proba (`ajutor/navigare.ts`).
  const raspuns = await navigheaza(pagina, url, { waitUntil: 'load' })
  if (!raspuns || raspuns.status() >= 400) {
    await context.close()
    nemasurat('pagina nu s-a servit (' + (raspuns ? raspuns.status() : 'fara raspuns') + '): ' + url)
  }
  return { pagina, inchide: () => context.close() }
}

// ---------------------------------------------------------------------------
// G-AI-01. Paritatea HTML servit / randat
// ---------------------------------------------------------------------------

export type MasuraParitate = {
  url: string
  innerWidth: number
  propozitii: number
  gasite: number
  acoperire: number
  lipsa: string[]
}

/**
 * Propozitiile textului randat (JavaScript pornit, dupa linistea retelei), cate se regasesc in
 * textul servit (JavaScript oprit), ambele normalizate. Sub trei propozitii randate masuratoarea
 * e NEMASURATA: o pagina goala nu are paritate buna, n-are nimic de comparat.
 */
export async function masoaraParitatea(browser: Browser, url: string): Promise<MasuraParitate> {
  const cuJs = await browser.newContext()
  const pagina = await cuJs.newPage()
  await navigheaza(pagina, url, { waitUntil: 'load' })
  await pagina.waitForLoadState('networkidle').catch(() => {})
  await pagina.waitForTimeout(1000)
  const randat = await pagina.evaluate(() => ({ text: document.body.innerText, innerWidth: window.innerWidth }))
  await cuJs.close()

  const lista = propozitii(randat.text)
  if (lista.length < 3) {
    nemasurat('pagina randata are ' + lista.length + ' propozitii, nu exista ce compara: ' + url)
  }

  const { pagina: faraJs, inchide } = await deschideFaraJs(browser, url)
  const servit = normalizeaza((await textServitDin(faraJs, 'body')) ?? '')
  await inchide()

  const lipsa = lista.filter((p) => !servit.includes(normalizeaza(p)))
  const gasite = lista.length - lipsa.length
  return {
    url,
    innerWidth: randat.innerWidth,
    propozitii: lista.length,
    gasite,
    acoperire: gasite / lista.length,
    lipsa,
  }
}

// ---------------------------------------------------------------------------
// G-AI-02. Raspunsul in primele 400 de cuvinte din <main>, in HTML-ul servit
// ---------------------------------------------------------------------------

/** Ce declara o ruta in fisierul feliei ei, `config/seo/<felia>.json`, cheia `raspuns_autonom`. */
export type DeclaratieRaspuns = {
  intrebare: string
  entitati: string[]
  /** Motivul scris pentru care ruta nu are paragraf de raspuns de 30-80 de cuvinte. */
  fara_regula_paragrafului?: string
}

export type MasuraRaspuns = {
  url: string
  cuvinteMain: number
  entitatiLipsa: string[]
  titlu: string | null
  primulParagraf: string | null
  cuvintePrimulParagraf: number
  abateri: string[]
}

/** Un motiv de scutire are o fraza intreaga, nu un cuvant pus ca sa treaca. */
const MOTIV_MINIM = 40

export async function masoaraRaspunsul(
  browser: Browser,
  url: string,
  declaratie: DeclaratieRaspuns,
): Promise<MasuraRaspuns> {
  const abateri: string[] = []
  if (normalizeaza(declaratie.intrebare).length < 10 || declaratie.entitati.length === 0) {
    abateri.push('declaratia nu are intrebare sau entitati')
  }
  const scutire = (declaratie.fara_regula_paragrafului ?? '').trim()
  if (declaratie.fara_regula_paragrafului !== undefined && scutire.length < MOTIV_MINIM) {
    abateri.push('scutirea de regula paragrafului nu are motiv scris (' + scutire.length + ' caractere)')
  }

  const { pagina, inchide } = await deschideFaraJs(browser, url)
  const main = await textServitDin(pagina, 'main')
  const titlu = await textServitDin(pagina, 'main h1')
  const primulParagraf = await textServitDin(pagina, 'main p')
  await inchide()

  if (main === null) {
    abateri.push('pagina nu are <main> in HTML-ul servit')
    return { url, cuvinteMain: 0, entitatiLipsa: declaratie.entitati, titlu, primulParagraf, cuvintePrimulParagraf: 0, abateri }
  }

  const toate = cuvinte(main)
  const fereastra = toate.slice(0, FEREASTRA_RASPUNS).join(' ')
  const entitatiLipsa = declaratie.entitati.filter((e) => !contineEntitatea(fereastra, e))
  for (const e of entitatiLipsa) abateri.push('entitatea "' + e + '" nu e in primele ' + FEREASTRA_RASPUNS + ' cuvinte')

  if (titlu === null) {
    abateri.push('pagina nu are <h1> in <main>')
  } else if (!fereastra.includes(cuvinte(titlu).join(' '))) {
    abateri.push('titlul <h1> nu e in primele ' + FEREASTRA_RASPUNS + ' cuvinte')
  }

  const cuvinteParagraf = primulParagraf === null ? 0 : cuvinte(primulParagraf).length
  if (primulParagraf === null) {
    abateri.push('<main> nu are niciun <p>')
  } else {
    const inceput = cuvinte(primulParagraf).join(' ')
    const interzisa = DESCHIDERI_INTERZISE.find((d) => inceput === d || inceput.startsWith(d + ' '))
    if (interzisa) abateri.push('primul paragraf incepe cu "' + interzisa + '"')
    if (scutire === '' && (cuvinteParagraf < PARAGRAF_MIN || cuvinteParagraf > PARAGRAF_MAX)) {
      abateri.push(
        'primul paragraf are ' + cuvinteParagraf + ' cuvinte, nu ' + PARAGRAF_MIN + '-' + PARAGRAF_MAX,
      )
    }
  }

  return {
    url,
    cuvinteMain: toate.length,
    entitatiLipsa,
    titlu,
    primulParagraf,
    cuvintePrimulParagraf: cuvinteParagraf,
    abateri,
  }
}

// ---------------------------------------------------------------------------
// Metadata sociala: og:url = canonical, og:title = <title>, imaginea servita
// ---------------------------------------------------------------------------

/** Imaginea unei etichete sociale, cum a raspuns serverul local. */
export type ImagineSociala = {
  eticheta: 'og:image' | 'twitter:image'
  /** Adresa din eticheta, `null` cand eticheta lipseste. */
  adresa: string | null
  /** Adresa ceruta de fapt: aceeasi cale, pe serverul local care serveste originea DECLARATA (`origineLocala`). */
  ceruta: string | null
  status: number | null
  tip: string | null
  octeti: number
  png: boolean
  /** Amprenta SHA-256 a octetilor primiti (hex), `null` cand imaginea nu s-a cerut. */
  sha256: string | null
}

/**
 * Serverele locale ale originilor declarate: originea dintr-o eticheta (`https://3s.md`) -> originea serverului local
 * care serveste build-ul acelui domeniu (`http://127.0.0.1:4751`). O proba care masoara pagini al caror card social
 * arata alt domeniu (copia engleza a lui 3s.com.ro, cu canonical-ul pe 3s.md) da aici serverul acelui domeniu.
 */
export type OriginiLocale = Readonly<Record<string, string>>

export type MasuraSociala = {
  url: string
  titlu: string
  canonical: string | null
  ogUrl: string | null
  ogTitlu: string | null
  imagini: ImagineSociala[]
  abateri: string[]
}

/** Semnatura oricarui fisier PNG (specificatia PNG, sectiunea 5.2). */
const SEMNATURA_PNG = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]

/** Calea fara bara finala (radacina ramane `/`), ca `https://x` si `https://x/` sa fie aceeasi pagina. */
function caleFaraBara(cale: string): string {
  const c = cale.replace(/\/+$/, '')
  return c === '' ? '/' : c
}

/**
 * Serverul local care serveste originea DECLARATA a unei imagini, sau `null` cand nu se stie. Ordinea:
 *   1. `origini` (dat de proba), pe originea declarata;
 *   2. pagina deschisa E documentul canonical (aceeasi cale ca a canonical-ului, iar imaginea e pe originea lui): atunci
 *      serverul paginii serveste chiar originea canonical-ului, deci si imaginea declarata acolo;
 *   3. altfel nu exista un server cunoscut pentru originea declarata. Inainte, imaginea se cerea mereu pe originea
 *      paginii deschise, deci o copie servita aici, cu canonical-ul pe alt domeniu, masura imaginea ei, nu pe cea
 *      declarata (corect numai cat timp cele doua erau aceiasi octeti).
 */
function origineLocala(declarata: URL, canonical: string | null, urlPagina: string, origini: OriginiLocale): string | null {
  const data = origini[declarata.origin]
  if (data !== undefined) return data
  if (canonical === null) return null
  const c = new URL(canonical, urlPagina)
  const p = new URL(urlPagina)
  return c.origin === declarata.origin && caleFaraBara(c.pathname) === caleFaraBara(p.pathname) ? p.origin : null
}

/**
 * Imaginea unei etichete, ceruta la adresa DECLARATA, prin serverul local al originii ei (`origineLocala`). Eticheta
 * poarta adresa absoluta a site-ului (`metadataBase`, din SITE_URL), deci o cerere directa ar pleca spre mediul public,
 * nu spre build-ul masurat: se cere aceeasi cale pe serverul care serveste originea declarata. O imagine care nu e pe
 * originea canonical-ului e deja o abatere; ea se cere, informativ, pe originea paginii (forma de dinainte). O imagine
 * pe originea canonical-ului fara server cunoscut e NEMASURATA si se scrie ca abatere, nu se masoara in alt loc.
 */
async function masoaraImaginea(
  eticheta: ImagineSociala['eticheta'],
  adresa: string | null,
  canonical: string | null,
  urlPagina: string,
  abateri: string[],
  origini: OriginiLocale,
): Promise<ImagineSociala> {
  const gol: ImagineSociala = { eticheta, adresa, ceruta: null, status: null, tip: null, octeti: 0, png: false, sha256: null }
  if (adresa === null) {
    abateri.push('lipseste ' + eticheta)
    return gol
  }
  let absoluta: URL
  try {
    absoluta = new URL(adresa)
  } catch {
    abateri.push(eticheta + ' nu e o adresa absoluta: ' + adresa)
    return gol
  }
  const peCanonical = canonical === null || absoluta.origin === new URL(canonical, urlPagina).origin
  if (!peCanonical) {
    abateri.push(eticheta + ' (' + adresa + ') nu e pe originea canonical-ului (' + canonical + ')')
  }
  const server = origineLocala(absoluta, canonical, urlPagina, origini) ?? (peCanonical ? null : new URL(urlPagina).origin)
  if (server === null) {
    abateri.push(eticheta + ' (' + adresa + ') NEMASURAT: originea declarata nu are server local (se da in `origini`)')
    return gol
  }
  const ceruta = new URL(absoluta.pathname + absoluta.search, server).toString()
  const raspuns = await fetch(ceruta, { redirect: 'manual' })
  const corp = new Uint8Array(await raspuns.arrayBuffer())
  const tip = raspuns.headers.get('content-type')
  const png = SEMNATURA_PNG.every((b, i) => corp[i] === b)
  const sha256 = createHash('sha256').update(corp).digest('hex')
  if (raspuns.status !== 200) abateri.push(eticheta + ' raspunde ' + raspuns.status + ' la ' + ceruta)
  else if (!(tip ?? '').startsWith('image/png')) abateri.push(eticheta + ' are tipul ' + tip + ', nu image/png')
  else if (!png) abateri.push(eticheta + ' se declara image/png, dar nu are semnatura PNG')
  return { eticheta, adresa, ceruta, status: raspuns.status, tip, octeti: corp.length, png, sha256 }
}

/**
 * Pe fiecare pagina, cardul social arata pagina insasi: `og:url` e canonical-ul, `og:title` e
 * titlul. Layout-ul pune valorile startului ca implicit, deci o pagina interioara care nu-si da
 * metadata proprie (`metadataPagina`) ar imparti in retele startul, nu pe ea.
 *
 * Si are imaginea: `og:image` si `twitter:image` exista, sunt pe originea site-ului si raspund
 * 200 image/png, cu semnatura PNG, la adresa DECLARATA (prin serverul local al originii ei, vezi
 * `origineLocala`; `origini` le da pe cele pe care pagina deschisa nu le serveste). Un `openGraph`
 * declarat de pagina inlocuieste obiectul din layout cu imagine cu tot, deci o pagina interioara
 * poate pierde imaginea fara ca nimic altceva sa se schimbe (constatarea criticului, 25.09.2026).
 */
export async function masoaraMetadataSociala(browser: Browser, url: string, origini: OriginiLocale = {}): Promise<MasuraSociala> {
  const { pagina, inchide } = await deschideFaraJs(browser, url)
  const date = await pagina.evaluate(() => ({
    titlu: document.title,
    canonical: document.querySelector('link[rel="canonical"]')?.getAttribute('href') ?? null,
    ogUrl: document.querySelector('meta[property="og:url"]')?.getAttribute('content') ?? null,
    ogTitlu: document.querySelector('meta[property="og:title"]')?.getAttribute('content') ?? null,
    ogImagine: document.querySelector('meta[property="og:image"]')?.getAttribute('content') ?? null,
    cardImagine: document.querySelector('meta[name="twitter:image"]')?.getAttribute('content') ?? null,
  }))
  await inchide()
  const abateri: string[] = []
  if (date.canonical === null) abateri.push('lipseste canonical')
  if (date.ogUrl === null) abateri.push('lipseste og:url')
  if (date.canonical !== null && date.ogUrl !== null && date.ogUrl !== date.canonical) {
    abateri.push('og:url (' + date.ogUrl + ') nu e canonical-ul (' + date.canonical + ')')
  }
  if (date.ogTitlu !== date.titlu) abateri.push('og:title (' + date.ogTitlu + ') nu e titlul (' + date.titlu + ')')
  const imagini = [
    await masoaraImaginea('og:image', date.ogImagine, date.canonical, url, abateri, origini),
    await masoaraImaginea('twitter:image', date.cardImagine, date.canonical, url, abateri, origini),
  ]
  return {
    url,
    titlu: date.titlu,
    canonical: date.canonical,
    ogUrl: date.ogUrl,
    ogTitlu: date.ogTitlu,
    imagini,
    abateri,
  }
}
