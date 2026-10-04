import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import type { ReactElement } from 'react'
import { prerenderToNodeStream } from 'react-dom/static'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { pathToFileURL } from 'node:url'
import { BARA_JURIDICA, INDEX_PAGINA, SIGILIU } from '../src/content/juridic/pagini'
import { INDEX_JURIDIC, SCURT_MD, SLUGURI_JURIDICE } from '../src/content/juridic/publicare'
import { caleMd, cheiPublicate, slugMd, type CheieMd } from '../src/content/juridic/md/registru'

/**
 * Editia paginilor juridice (felia `editie-juridic`, decizia de congruenta: aceleasi piese pe 3s.md ca pe
 * `/juridic/*`). Doua parti:
 *
 *   A. GARDA RO: paginile `/juridic` ale familiei SEE (indexul si cele 7 documente), randate pe server cu un
 *      operator SEE sintetic, au HTML-ul IDENTIC octet cu octet cu cel de pe BAZA. Amprentele SHA-256 ale
 *      HTML-ului de pe baza stau in fixtura `tests/fixturi/editie-juridic/ro-see.json`, capturata intr-un commit
 *      separat, facut inaintea oricarui cod (ordinea se vede in istoric). Se rescrie numai cu `SCRIE_FIXTURA=1`,
 *      explicit; o fixtura lipsa pica proba, nu se scrie singura. De ce randarea statica si nu proba de
 *      invarianta pe build: pe build-ul RO real operatorul e `null`, deci `/juridic/*` raspunde 404 si nu are
 *      HTML de pazit; paginile exista numai cu un operator SEE, pe care niciun profil nu-l are azi.
 *
 *   B. EDITIA: paginile `/legal/<document>` (EN) si `/ro/juridic/<document>` (RO-MD) ale lui 3s.md, randate cu
 *      variabilele profilului `config/profil-3s-md.json` (operatorul-model D2), au SCHELETUL paginii RO
 *      `/juridic/termeni`: aceleasi elemente, cu aceleasi clase, in aceeasi ordine, de la `<main>` pana la
 *      articol, plus sigiliul. Textul documentului (corpul articolului) nu intra in schelet: el difera prin
 *      constructie. Listele (bara si firul) intra ca multime de forme de element, iar numarul de elemente se
 *      compara separat, cu diferentele DECLARATE mai jos, fiecare cu motivul. Apoi: sigiliul poarta amprenta
 *      SHA-256 a textului randat al articolului (recalculata din HTML), cu textele editiei; zero texte de
 *      interfata romanesti pe paginile EN; firul de pagina (si `BreadcrumbList`) incepe la startul editiei.
 *
 * MARTORI: (A) acelasi randament cu alt operator (alta denumire) da alt HTML pe informatiile legale, deci un
 * "identic" nu poate veni dintr-o randare care nu citeste nimic; (B) un schelet EN cu sigiliul sau cu bara
 * scoase e prins; fiecare text RO cautat pe EN exista pe pagina RO (cautarea chiar gaseste ce vaneaza).
 */

// Reincarcarea modulelor paginii (operatorul se schimba intre cazuri) costa cateva secunde pe o statie incarcata.
vi.setConfig({ testTimeout: 120_000 })

const RADACINA = join(__dirname, '..')
const DOSAR_FIXTURI = join(RADACINA, 'tests', 'fixturi', 'editie-juridic')
const FIXTURA_RO = join(DOSAR_FIXTURI, 'ro-see.json')

/** Variabilele de domeniu care schimba randarea; se golesc pentru garda RO si se refac dupa fiecare caz. */
const VARIABILE = ['OPERATOR_JSON', 'SITE_EDITII', 'NEXT_PUBLIC_SITE_EDITII', 'SITE_URL', 'SITE_ALTERNATE', 'SITE_ENV', 'CANALE_JSON'] as const
const MEDIU_INITIAL = Object.fromEntries(VARIABILE.map((v) => [v, process.env[v]]))

afterEach(() => {
  for (const v of VARIABILE) {
    if (MEDIU_INITIAL[v] === undefined) delete process.env[v]
    else process.env[v] = MEDIU_INITIAL[v]
  }
  vi.doUnmock('../config/operator.json')
  vi.resetModules()
})

type OperatorSee = Record<'denumire' | 'sediu' | 'email' | 'telefon' | 'numar_orc' | 'cod_fiscal' | 'tara' | 'dpo', string>

/** Operator SEE sintetic COMPLET, asamblat la rulare; valori evident de proba. */
function operatorSee(extra: Partial<OperatorSee> = {}): OperatorSee {
  return {
    denumire: ['Trei S', 'Proba', 'Editie', 'SRL'].join(' '),
    sediu: ['Strada Exemplului 1', 'Pitesti'].join(', '),
    email: ['date', ['operator-3s', 'test'].join('.')].join('@'),
    telefon: '',
    numar_orc: ['J03', '0', '2026'].join('/'),
    cod_fiscal: 'RO' + '0'.repeat(8),
    tara: 'România',
    dpo: '',
    ...extra,
  }
}

async function randeaza(element: ReactElement): Promise<string> {
  const { prelude } = await prerenderToNodeStream(element)
  const bucati: Buffer[] = []
  for await (const b of prelude) bucati.push(Buffer.from(b as Uint8Array))
  return Buffer.concat(bucati).toString('utf8')
}

const sha = (text: string) => createHash('sha256').update(text, 'utf8').digest('hex')

/** Pagina RO `/juridic/<slug>` (sau indexul, `null`), cu operatorul SEE dat, fara variabile de domeniu. */
async function paginaRo(slug: string | null, operator: OperatorSee = operatorSee()): Promise<string> {
  for (const v of VARIABILE) delete process.env[v]
  vi.resetModules()
  const reala = JSON.parse(readFileSync(join(RADACINA, 'config', 'operator.json'), 'utf8')) as Record<string, unknown>
  vi.doMock('../config/operator.json', () => ({ default: { ...reala, operator } }))
  const modul = await import('../src/app/juridic/[[...document]]/page')
  const element = await modul.default({ params: Promise.resolve({ document: slug === null ? [] : [slug] }) })
  return randeaza(element)
}

const PAGINI_RO: (string | null)[] = [null, ...SLUGURI_JURIDICE]
const numePagina = (slug: string | null) => (slug === null ? '/juridic' : '/juridic/' + slug)

describe('A. garda RO: paginile /juridic (familia SEE) au HTML-ul de pe baza', () => {
  it('fixtura exista (sau se scrie, explicit, cu SCRIE_FIXTURA=1) si are indexul plus cele 7 documente', async () => {
    if (process.env.SCRIE_FIXTURA === '1') {
      const amprente: Record<string, string> = {}
      for (const slug of PAGINI_RO) amprente[numePagina(slug)] = sha(await paginaRo(slug))
      mkdirSync(DOSAR_FIXTURI, { recursive: true })
      writeFileSync(FIXTURA_RO, JSON.stringify({ _nota: 'SHA-256 al HTML-ului randat pe server pe BAZA, operator SEE sintetic din tests/editie-juridic.test.ts. Se rescrie numai cu SCRIE_FIXTURA=1.', amprente }, null, 2) + '\n', 'utf8')
    }
    expect(existsSync(FIXTURA_RO), 'fixtura lipseste: ' + FIXTURA_RO).toBe(true)
    const { amprente } = JSON.parse(readFileSync(FIXTURA_RO, 'utf8')) as { amprente: Record<string, string> }
    expect(Object.keys(amprente).sort()).toEqual(PAGINI_RO.map(numePagina).sort())
  })

  for (const slug of PAGINI_RO) {
    it(numePagina(slug) + ': HTML identic cu baza', async () => {
      const { amprente } = JSON.parse(readFileSync(FIXTURA_RO, 'utf8')) as { amprente: Record<string, string> }
      const html = await paginaRo(slug)
      // Controlul: pagina chiar s-a randat (un main, un h1), nu o pagina goala care ar avea mereu aceeasi amprenta.
      expect(html).toContain('<main')
      expect(html.match(/<h1[\s>]/g) ?? []).toHaveLength(1)
      expect(sha(html), numePagina(slug)).toBe(amprente[numePagina(slug)])
    })
  }

  it('martor POZITIV: alt operator da alt HTML pe informatiile legale (amprenta chiar citeste pagina)', async () => {
    const { amprente } = JSON.parse(readFileSync(FIXTURA_RO, 'utf8')) as { amprente: Record<string, string> }
    const altul = await paginaRo('informatii-legale', operatorSee({ denumire: ['Alt', 'Operator', 'Proba', 'SRL'].join(' ') }))
    expect(sha(altul)).not.toBe(amprente['/juridic/informatii-legale'])
  })
})

// ---------------------------------------------------------------------------------------------------------------------
// B. Editia: /legal/* si /ro/juridic/* au scheletul paginii /juridic/termeni
// ---------------------------------------------------------------------------------------------------------------------

const PROFIL = JSON.parse(readFileSync(join(RADACINA, 'config', 'profil-3s-md.json'), 'utf8')) as Record<string, unknown>

/** Variabilele aplicatiei 3s.md din profil (cheile cu `_` sunt note; un obiect se scrie ca JSON). */
function mediu3sMd(): void {
  for (const v of VARIABILE) delete process.env[v]
  for (const [cheie, valoare] of Object.entries(PROFIL)) {
    if (cheie.startsWith('_')) continue
    process.env[cheie] = typeof valoare === 'string' ? valoare : JSON.stringify(valoare)
  }
  process.env.NEXT_PUBLIC_SITE_EDITII = process.env.SITE_EDITII
}

const FISIERE_EDITIE = {
  en: join(RADACINA, 'src', 'app', '(en)', 'legal', '[[...document]]', 'page.en.tsx'),
  ro: join(RADACINA, 'src', 'app', '(romd)', 'ro', 'juridic', '[[...document]]', 'page.romd.tsx'),
} as const

type PaginaServer = { default: (p: { params: Promise<{ document?: string[] }> }) => Promise<ReactElement> }

/** Pagina unui document `md` pe 3s.md, in limba data; `null` = indexul (`/legal`, `/ro/juridic`). */
async function paginaMd(cheie: CheieMd | null, limba: 'en' | 'ro'): Promise<string> {
  mediu3sMd()
  vi.resetModules()
  const modul = (await import(/* @vite-ignore */ pathToFileURL(FISIERE_EDITIE[limba]).href)) as PaginaServer
  return randeaza(await modul.default({ params: Promise.resolve({ document: cheie === null ? [] : [slugMd(cheie, limba)] }) }))
}

/** Calea indexului juridic al editiei. */
const CALE_INDEX = { en: '/legal', ro: '/ro/juridic' } as const

// Un analizor minimal de HTML, pentru iesirea lui React: atribute cu ghilimele duble, etichete inchise explicit.

type Nod = { tag: string; atribute: Record<string, string>; copii: Nod[]; text: string }

const GOALE = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'source', 'track', 'wbr'])
const ETICHETA_HTML = new RegExp(
  [
    '<!--[\\s\\S]*?-->',
    '<script\\b[\\s\\S]*?</script>',
    '<(/?)([a-zA-Z][a-zA-Z0-9-]*)((?:\\s+[^\\s=>/]+(?:="[^"]*")?)*)\\s*(/?)>',
    '([^<]+)',
  ].join('|'),
  'g',
)

function arbore(html: string): Nod {
  const radacina: Nod = { tag: '#', atribute: {}, copii: [], text: '' }
  const stiva: Nod[] = [radacina]
  for (const m of html.matchAll(ETICHETA_HTML)) {
    if (m[5] !== undefined) {
      stiva[stiva.length - 1].text += m[5]
      continue
    }
    if (m[2] === undefined) continue
    const tag = m[2].toLowerCase()
    if (m[1] === '/') {
      const i = stiva.map((n) => n.tag).lastIndexOf(tag)
      if (i > 0) stiva.length = i
      continue
    }
    const atribute: Record<string, string> = {}
    for (const a of (m[3] ?? '').matchAll(/([^\s=>/]+)(?:="([^"]*)")?/g)) atribute[a[1]] = a[2] ?? ''
    const nod: Nod = { tag, atribute, copii: [], text: '' }
    stiva[stiva.length - 1].copii.push(nod)
    if (!GOALE.has(tag) && m[4] !== '/') stiva.push(nod)
  }
  return radacina
}

function cauta(nod: Nod, p: (n: Nod) => boolean): Nod | null {
  if (p(nod)) return nod
  for (const c of nod.copii) {
    const g = cauta(c, p)
    if (g !== null) return g
  }
  return null
}

/** Atributele care tin de forma (prezenta lor, nu valoarea): textul si adresele difera intre editii. */
const ATRIBUTE_FORMA = ['aria-label', 'aria-current', 'data-document', 'data-sigiliu', 'data-amprenta', 'datetime', 'href', 'data-tinta-lipsa']

/**
 * Scheletul unui nod: eticheta, clasa, prezenta atributelor de forma, apoi copiii. In articol intra numai antetul
 * si radacina corpului (textul documentului difera prin constructie). O lista (`ul`, `ol`) intra ca multimea
 * formelor elementelor ei, sortata (elementul activ poate fi oricare); numarul lor se compara separat.
 */
function schelet(nod: Nod, numaiCapul = false): string {
  const marci = ATRIBUTE_FORMA.filter((a) => a in nod.atribute).join(',')
  const cap = nod.tag + (nod.atribute.class ? '.' + nod.atribute.class : '') + (marci ? '[' + marci + ']' : '')
  if (numaiCapul) return cap
  let copii: string[]
  if (nod.tag === 'article') copii = nod.copii.map((c) => (c.tag === 'header' ? schelet(c) : schelet(c, true)))
  else if (nod.tag === 'ul' || nod.tag === 'ol') copii = [...new Set(nod.copii.map((c) => schelet(c)))].sort()
  else copii = nod.copii.map((c) => schelet(c))
  return copii.length === 0 ? cap : cap + '(' + copii.join(' ') + ')'
}

function main(html: string): Nod {
  const m = cauta(arbore(html), (n) => n.tag === 'main')
  if (m === null) throw new Error('pagina nu are <main>')
  return m
}

/** Numarul de elemente `li` ale primei liste cu eticheta data si cu un fragment dat in clasa. */
function numarElemente(html: string, tagLista: 'ul' | 'ol', fragmentClasa: string): number {
  const lista = cauta(main(html), (n) => n.tag === tagLista && (n.atribute.class ?? '').includes(fragmentClasa))
  if (lista === null) throw new Error('lista ' + tagLista + '.' + fragmentClasa + ' lipseste')
  return lista.copii.filter((c) => c.tag === 'li').length
}

/** Textul unui fragment HTML: fara etichete, cu entitatile de baza decodate. */
function textDinHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, '')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
}

/** Un text asa cum il scrie React intr-un atribut sau intre etichete (apostroful devine entitate). */
const caInHtml = (t: string) => t.replace(/&/g, '&amp;').replace(/'/g, '&#x27;').replace(/"/g, '&quot;')

/**
 * Textele de interfata ale editiilor, asteptate pe pagini. Stau in fisierele paginilor (constante locale: o pagina
 * Next nu poate exporta altceva), deci asteptarea se scrie aici; o schimbare de text propus o inroseste, intentionat.
 */
const BARA_LEGAL = { titlu: 'Legal', eticheta: 'Legal documents' }
const ETICHETA_FIR_LEGAL = 'Breadcrumb'
const START_FIR_LEGAL = { text: 'Home', cale: '/' }
const START_FIR_JURIDIC = { text: 'Acasă', cale: '/ro' }
const INDEX_FIR = { en: { text: 'Legal documents', cale: CALE_INDEX.en }, ro: { text: INDEX_JURIDIC.scurt, cale: CALE_INDEX.ro } }
const SIGILIU_LEGAL = {
  eticheta: 'Text fingerprint (SHA-256)',
  explicatie: "The SHA-256 fingerprint of this document's text, computed when the page was built. Any change to the text changes it.",
}

const SUSPENSIE = String.fromCharCode(0x2026)
const CHEI = cheiPublicate()
const LIMBI = ['en', 'ro'] as const

/**
 * Diferentele DECLARATE fata de `/juridic/termeni`, numarate (RO / 3s.md). Orice alta diferenta de forma pica.
 *   - bara si cardurile indexului: documentele familiei `md` publicate la poarta curenta (`config/juridic-rute.json`),
 *     nu cele 7 SEE (codul `juridic-md` din `config/congruenta/temeiuri.json`).
 * Firul are aceleasi niveluri ca pe RO (start, index, document; pe index: start, index): pe 3s.md exista indexul.
 */
const DECLARATE = {
  bara: { ro: SLUGURI_JURIDICE.length, md: CHEI.length },
  fir: { ro: 3, md: 3 },
  firIndex: { ro: 2, md: 2 },
}

describe('B. editia: /legal/* si /ro/juridic/* compun piesele paginii /juridic/termeni', () => {
  it('preconditia: 6 documente md publicate la poarta curenta, 7 documente SEE', () => {
    expect(CHEI).toHaveLength(6)
    expect(SLUGURI_JURIDICE).toHaveLength(7)
  })

  for (const limba of LIMBI) {
    it(CALE_INDEX[limba] + ': indexul exista exact cand familia md e publicata (slugul gol in generateStaticParams)', async () => {
      type CuParametri = { generateStaticParams: () => { document: string[] }[] }
      const parametri = async () => {
        vi.resetModules()
        return ((await import(/* @vite-ignore */ pathToFileURL(FISIERE_EDITIE[limba]).href)) as CuParametri).generateStaticParams()
      }
      // Fara operator (mediul probelor si build-ul romanesc): nicio pagina, deci nici indexul.
      for (const v of VARIABILE) delete process.env[v]
      expect(await parametri()).toEqual([])
      // Cu profilul 3s.md (familia md): indexul, primul, si cele 6 documente, o singura data fiecare.
      mediu3sMd()
      const cu = await parametri()
      expect(cu[0]).toEqual({ document: [] })
      expect(cu.map((p) => p.document.join('/'))).toEqual(['', ...CHEI.map((c) => slugMd(c, limba))])
    })
  }

  for (const limba of LIMBI) {
    for (const cheie of CHEI) {
      it(caleMd(cheie, limba) + ': scheletul /juridic/termeni; bara si firul cu numaratorile declarate', async () => {
        const ro = await paginaRo('termeni')
        const md = await paginaMd(cheie, limba)
        expect(schelet(main(md))).toBe(schelet(main(ro)))
        expect([numarElemente(ro, 'ul', 'baraLista'), numarElemente(md, 'ul', 'baraLista')]).toEqual([DECLARATE.bara.ro, DECLARATE.bara.md])
        expect([numarElemente(ro, 'ol', 'fir'), numarElemente(md, 'ol', 'fir')]).toEqual([DECLARATE.fir.ro, DECLARATE.fir.md])
        // Elementul activ al barei e documentul paginii, numit ca in registru.
        const activ = cauta(main(md), (n) => n.atribute['aria-current'] === 'page' && (n.atribute.class ?? '').includes('baraLegatura'))
        expect(textDinHtml(activ?.text ?? '')).toBe(SCURT_MD[cheie][limba])
      })
    }
  }

  for (const limba of LIMBI) {
    it(CALE_INDEX[limba] + ': scheletul indexului /juridic; bara si cardurile cu numaratorile declarate, nimic activ', async () => {
      const ro = await paginaRo(null)
      const md = await paginaMd(null, limba)
      expect(schelet(main(md))).toBe(schelet(main(ro)))
      expect([numarElemente(ro, 'ul', 'baraLista'), numarElemente(md, 'ul', 'baraLista')]).toEqual([DECLARATE.bara.ro, DECLARATE.bara.md])
      expect([numarElemente(ro, 'ul', 'carduri'), numarElemente(md, 'ul', 'carduri')]).toEqual([DECLARATE.bara.ro, DECLARATE.bara.md])
      expect([numarElemente(ro, 'ol', 'fir'), numarElemente(md, 'ol', 'fir')]).toEqual([DECLARATE.firIndex.ro, DECLARATE.firIndex.md])
      // Pe index nimic din bara nu e activ (aria-current sta numai pe ultimul nivel al firului).
      expect(cauta(main(md), (n) => n.atribute['aria-current'] === 'page' && (n.atribute.class ?? '').includes('baraLegatura'))).toBeNull()
      // Cardurile duc spre documentele editiei, in ordinea registrului, cu cheia lor.
      const carduri = [...md.matchAll(/<a\b[^>]*data-card-document="([^"]+)"[^>]*href="([^"]+)"/g)].map((m) => [m[2], m[1]])
      expect(carduri).toEqual(CHEI.map((c) => [caleMd(c, limba), c]))
    })
  }

  it('martor POZITIV: scheletul indexului prinde cardurile scoase de pe /legal', async () => {
    const ro = await paginaRo(null)
    const md = await paginaMd(null, 'en')
    const fara = md.replace(/<ul class="[^"]*carduri[^"]*">[\s\S]*?<\/ul>/, '')
    expect(fara, 'mutatia a aterizat').not.toBe(md)
    expect(schelet(main(fara))).not.toBe(schelet(main(ro)))
  })

  it('martor POZITIV: scheletul prinde, pe copii ale paginii EN, sigiliul scos si bara scoasa', async () => {
    const ro = await paginaRo('termeni')
    const md = await paginaMd(CHEI[0], 'en')
    expect(schelet(main(md)), 'martorul negativ: pagina reala are scheletul RO').toBe(schelet(main(ro)))
    const faraSigiliu = md.replace(/<div[^>]*data-sigiliu[^>]*>[\s\S]*?<\/code><\/div>/, '')
    expect(faraSigiliu, 'mutatia a aterizat').not.toBe(md)
    expect(schelet(main(faraSigiliu))).not.toBe(schelet(main(ro)))
    const faraBara = md.replace(new RegExp('<nav[^>]*aria-label="' + BARA_LEGAL.eticheta + '"[^>]*>[\\s\\S]*?</nav>'), '')
    expect(faraBara, 'mutatia a aterizat').not.toBe(md)
    expect(schelet(main(faraBara))).not.toBe(schelet(main(ro)))
  })

  for (const limba of LIMBI) {
    it('sigiliul pe ' + limba + ': amprenta SHA-256 a textului randat al articolului, pe fiecare document, cu textele editiei', async () => {
      const texte = limba === 'en' ? SIGILIU_LEGAL : SIGILIU
      for (const cheie of CHEI) {
        const html = await paginaMd(cheie, limba)
        const amprenta = html.match(/data-amprenta="([0-9a-f]{64})"/)?.[1]
        expect(amprenta, cheie).toBeDefined()
        const articol = html.match(/<article data-document="[^"]+">([\s\S]*?)<\/article>/)?.[1] ?? ''
        // Controlul: articolul chiar s-a gasit si are textul documentului.
        expect(articol.length, cheie).toBeGreaterThan(500)
        expect(sha(textDinHtml(articol).replace(/\s+/g, '')), cheie).toBe(amprenta)
        expect(html, cheie).toContain('>' + amprenta?.slice(0, 16) + SUSPENSIE + '<')
        expect(html, cheie).toContain('title="' + caInHtml(texte.explicatie) + '"')
        expect(html, cheie).toContain('>' + caInHtml(texte.eticheta) + '<')
      }
    })
  }

  it('zero texte de interfata romanesti pe paginile EN; fiecare text cautat exista pe pagina RO (martor)', async () => {
    const romanesti = [BARA_JURIDICA.titlu, BARA_JURIDICA.eticheta, SIGILIU.eticheta, SIGILIU.explicatie, INDEX_JURIDIC.scurt, 'Fir de navigare', 'Acasă']
    const htmlRo = await paginaRo('termeni')
    for (const t of romanesti) expect(textDinHtml(htmlRo).includes(t) || htmlRo.includes(caInHtml(t)), 'martorul: ' + t).toBe(true)
    for (const cheie of CHEI) {
      const en = await paginaMd(cheie, 'en')
      const gasite = romanesti.filter((t) => en.includes(caInHtml(t)) || textDinHtml(en).includes(t))
      expect(gasite, cheie).toEqual([])
      // Textele EN ale pieselor sunt chiar pe pagina (cautarea de mai sus nu trece pe o pagina goala).
      for (const t of [BARA_LEGAL.titlu, BARA_LEGAL.eticheta, ETICHETA_FIR_LEGAL, START_FIR_LEGAL.text]) expect(en, cheie + ': ' + t).toContain(t)
    }
    const indexEn = await paginaMd(null, 'en')
    const indexRo = await paginaRo(null)
    const romanestiIndex = [BARA_JURIDICA.titlu, BARA_JURIDICA.eticheta, INDEX_JURIDIC.scurt, 'Fir de navigare', 'Acasă', INDEX_PAGINA.titlu, INDEX_PAGINA.subtitlu]
    for (const t of romanestiIndex) expect(textDinHtml(indexRo).includes(t) || indexRo.includes(caInHtml(t)), 'martorul indexului: ' + t).toBe(true)
    expect(romanestiIndex.filter((t) => indexEn.includes(caInHtml(t)) || textDinHtml(indexEn).includes(t)), '/legal').toEqual([])
  })

  for (const limba of LIMBI) {
    it('firul pe ' + limba + ': incepe la startul editiei, ca legatura activa, iar BreadcrumbList are aceleasi adrese', async () => {
      const start = limba === 'en' ? START_FIR_LEGAL : START_FIR_JURIDIC
      const baza = String(PROFIL.SITE_URL).replace(/\/+$/, '')
      const index = INDEX_FIR[limba]
      for (const cheie of [null, ...CHEI]) {
        const nume = cheie ?? CALE_INDEX[limba]
        const html = await paginaMd(cheie, limba)
        const fir = cauta(main(html), (n) => n.tag === 'ol' && (n.atribute.class ?? '').includes('fir'))
        const legaturi: Nod[] = []
        const aduna = (n: Nod) => {
          if (n.tag === 'a') legaturi.push(n)
          n.copii.forEach(aduna)
        }
        if (fir !== null) aduna(fir)
        expect(legaturi[0]?.atribute.href, nume).toBe(start.cale)
        expect(legaturi[0]?.text, nume).toBe(start.text)
        // Nivelul intermediar: indexul editiei, ca legatura pe documente.
        if (cheie !== null) {
          expect(legaturi[1]?.atribute.href, nume).toBe(index.cale)
          expect(legaturi[1]?.text, nume).toBe(index.text)
        }
        const ld = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => JSON.parse(m[1]) as Record<string, unknown>)
        const lista = ld.filter((n) => n['@type'] === 'BreadcrumbList')
        expect(lista, nume).toHaveLength(1)
        const adrese = (lista[0].itemListElement as { item: string }[]).map((e) => e.item)
        const cai = cheie === null ? [start.cale, index.cale] : [start.cale, index.cale, caleMd(cheie, limba)]
        expect(adrese, nume).toEqual(cai.map((c) => new URL(c, baza + '/').toString()))
      }
    })
  }
})
