import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join, relative } from 'node:path'
import { pathToFileURL } from 'node:url'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import CorpPagina from '../src/components/continut/CorpPagina'
import CorpDocument from '../src/components/juridic/CorpDocument'
import TextInLinie from '../src/components/juridic/TextInLinie'
import { CAI_EXISTENTE } from '../src/content/cai'
import { documentMdBrut, texteJuridice } from '../src/content/juridic/index'
import type { Masurare } from '../src/content/juridic/masurare'
import { CHEI_MD } from '../src/content/juridic/md/registru'
import { fragmenteInLinie, legaturiInLinie, textSimplu, type DocumentJuridic, type LimbaJuridica } from '../src/content/juridic/tipuri'
import { numarCuvinte, type PaginaContinut } from '../src/content/model/tipuri'
import type { Operator } from '../src/lib/operator'

/**
 * Felia 94 (`marcaj-in-linie`): o legatura in interiorul unui accent se randeaza ca legatura in `strong`,
 * nu ca marcaj brut. Probele 1, 3, 4 si 5 ale specificatiei; proba 2 (copia 3s.md, trei suprafete) e in
 * `tests/browser/marcaj-brut.spec.ts`.
 *
 * FIXTURILE se asambleaza la RULARE: marcajul pe care il vaneaza detectorul (stelutele duble, paranteza
 * dreapta lipita de cea rotunda) se compune din bucati, ca fisierul sa nu fie el insusi o instanta a
 * reziduului pentru alte porti sau pentru detectorul formei inverse.
 *
 * MUTANTUL e parserul vechi, pe o COPIE a modulului real (`node_modules/.cache`, nu sursa): accentul nu-si
 * mai desface interiorul. Copia inlocuieste modulul prin `vi.doMock`, deci componentele reale il folosesc.
 */

vi.hoisted(() => {
  process.env.OPERATOR_JSON = ''
  process.env.UMAMI_URL = ''
  process.env.UMAMI_WEBSITE_ID = ''
  process.env.NEXT_PUBLIC_GA4_ID = ''
})

const RADACINA = join(__dirname, '..')
const SURSA_TIPURI = join(RADACINA, 'src', 'content', 'juridic', 'tipuri.ts')
const DOSAR_EN = join(RADACINA, 'src', 'content', 'en')
const DOSAR_RO_MD = join(RADACINA, 'src', 'content', 'ro-md')
const DOSAR_MD = join(RADACINA, 'src', 'content', 'juridic', 'md')
const DOSAR_CONTINUT = join(RADACINA, 'src', 'content')

// ---------------------------------------------------------------------------------------------
// Detectorul de reziduuri, asamblat din bucati
// ---------------------------------------------------------------------------------------------

const STELE = '*'.repeat(2)
const LIPITURA = ']' + '('
const PARANTEZA = '['
/** O paranteza dreapta deschisa, urmata (pe acelasi rand) de lipitura: forma unei legaturi nedesfacute. */
const LEGATURA_BRUTA = new RegExp('\\' + PARANTEZA + '[^\\n]*?\\]\\(')
/** Forma inversa, interzisa in sursa: paranteza dreapta urmata direct de stelutele accentului. */
const FORMA_INVERSA = new RegExp('\\' + PARANTEZA + '\\*\\*')

/** Reziduurile de marcaj dintr-un text (fara etichete): ce s-ar vedea brut pe pagina. */
function reziduuri(text: string): string[] {
  const gasite: string[] = []
  for (const rand of text.split('\n')) {
    if (rand.includes(STELE)) gasite.push('stele: ' + rand.trim().slice(0, 120))
    if (rand.includes(LIPITURA)) gasite.push('lipitura: ' + rand.trim().slice(0, 120))
    else if (LEGATURA_BRUTA.test(rand)) gasite.push('legatura: ' + rand.trim().slice(0, 120))
  }
  return gasite
}

/** Textul unui HTML static: etichetele devin randuri noi, entitatile uzuale se decodeaza. */
function textDin(html: string): string {
  return html
    .replace(/<[^>]+>/g, '\n')
    .replace(/&amp;/g, '&')
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
}

// ---------------------------------------------------------------------------------------------
// Ce se randeaza: toate modulele EN, toate modulele ro-md, toate documentele juridice
// ---------------------------------------------------------------------------------------------

function fisiereTs(dosar: string): string[] {
  if (!existsSync(dosar)) return []
  return readdirSync(dosar, { recursive: true, withFileTypes: true })
    .filter((f) => f.isFile() && f.name.endsWith('.ts'))
    .map((f) => join(f.parentPath, f.name))
    .sort()
}

/**
 * Modulele de continut ale COMPONENTELOR unei editii (decizia 53: pagina compune componentele RO cu textul editiei),
 * numite `<pagina>-componente.ts`: nu exporta o `pagina` randata prin CorpPagina, ci date pentru componente. Felia
 * 99 le-a adus; controlul "fiecare fisier a dat o pagina" le numara separat, iar sirurile lor trec prin acelasi
 * detector de reziduuri, ca nimic sa nu iasa din proba.
 */
const MODUL_COMPONENTE = /-componente\.ts$/

/** Toate sirurile dintr-o valoare (frunzele de tip sir, recursiv). */
function siruri(valoare: unknown, acc: string[] = []): string[] {
  if (typeof valoare === 'string') acc.push(valoare)
  else if (Array.isArray(valoare)) for (const v of valoare) siruri(v, acc)
  else if (valoare && typeof valoare === 'object') for (const v of Object.values(valoare)) siruri(v, acc)
  return acc
}

async function componenteDin(dosar: string): Promise<{ fisier: string; texte: string[]; arePagina: boolean }[]> {
  const iesire: { fisier: string; texte: string[]; arePagina: boolean }[] = []
  for (const fisier of fisiereTs(dosar).filter((f) => MODUL_COMPONENTE.test(f))) {
    const modul = (await import(pathToFileURL(fisier).href)) as Record<string, unknown>
    iesire.push({ fisier: relative(RADACINA, fisier), texte: siruri(Object.values(modul)), arePagina: 'pagina' in modul })
  }
  return iesire
}

/**
 * Felia 106 (decizia 53): modulele paginilor de referinta G1-G3 si piesele lor comune poarta contractele componentelor
 * perechilor RO, nu o `pagina` randata prin CorpPagina. Se numara separat, iar sirurile lor trec prin acelasi detector
 * de reziduuri, ca nimic sa nu iasa din proba.
 */
const MODULE_REFERINTA = new Set(['compare-3s-vs-google-drive.ts', 'guides-e-invoice-archiving-eu.ts', 'guides-records-retention-moldova.ts', 'referinta-comun.ts'])

/** Toate sirurile dintr-o valoare (frunzele de tip sir, recursiv). */
function siruriReferinta(valoare: unknown, acc: string[] = []): string[] {
  if (typeof valoare === 'string') acc.push(valoare)
  else if (Array.isArray(valoare)) for (const v of valoare) siruriReferinta(v, acc)
  else if (valoare && typeof valoare === 'object') for (const v of Object.values(valoare)) siruriReferinta(v, acc)
  return acc
}

async function referintaDin(dosar: string): Promise<{ fisier: string; texte: string[] }[]> {
  const iesire: { fisier: string; texte: string[] }[] = []
  for (const fisier of fisiereTs(dosar).filter((f) => MODULE_REFERINTA.has(f.split(/[\\/]/).pop() ?? ''))) {
    const modul = (await import(pathToFileURL(fisier).href)) as Record<string, unknown>
    iesire.push({ fisier: relative(RADACINA, fisier), texte: siruriReferinta(Object.values(modul)) })
  }
  return iesire
}

async function paginiDin(dosar: string): Promise<{ fisier: string; pagina: PaginaContinut }[]> {
  const iesire: { fisier: string; pagina: PaginaContinut }[] = []
  for (const fisier of fisiereTs(dosar).filter((f) => !MODULE_REFERINTA.has(f.split(/[\\/]/).pop() ?? ''))) {
    const modul = (await import(pathToFileURL(fisier).href)) as { pagina?: PaginaContinut }
    if (modul.pagina) iesire.push({ fisier: relative(RADACINA, fisier), pagina: modul.pagina })
  }
  return iesire
}

/** Operatorul-model al familiei md, asamblat la rulare (aceeasi forma ca in tests/juridic-md.test.ts). */
function operatorMd(): Operator {
  const d2 = 'D2'
  return {
    denumire: ['3S', 'Demerzel', 'SRL'].join(' '),
    sediu: d2,
    email: ['contact', ['3s', 'md'].join('.')].join('@'),
    telefon: ['+373', '68', '055', '599'].join(' '),
    numar_orc: d2,
    cod_fiscal: d2,
    tara: ['Republica', 'Moldova'].join(' '),
    dpo: '',
  }
}

/** Operatorul sintetic al familiei SEE, pe domeniul rezervat `.test`. */
function operatorSee(): Operator {
  return {
    denumire: ['Trei S', 'Proba', 'SRL'].join(' '),
    sediu: 'Strada Exemplului 1, Pitesti',
    email: ['date', 'operator-3s.test'].join('@'),
    telefon: '+40 000 000 000',
    numar_orc: 'J03/0/2026',
    cod_fiscal: 'RO' + '0'.repeat(8),
    tara: 'România',
    dpo: '',
  }
}

const STARI: { m: Masurare; linkedin: boolean }[] = [
  { m: { stare: 'S0', ga4: false }, linkedin: false },
  { m: { stare: 'S-GA4', ga4: true }, linkedin: false },
  { m: { stare: 'S-B', ga4: true }, linkedin: true },
]
const LIMBI: LimbaJuridica[] = ['ro', 'en']

function documenteMd(): { nume: string; d: DocumentJuridic }[] {
  return CHEI_MD.flatMap((cheie) =>
    LIMBI.flatMap((limba) => STARI.map((s) => ({ nume: cheie + '.' + limba + ' ' + s.m.stare + (s.linkedin ? '+in' : ''), d: documentMdBrut(cheie, operatorMd(), limba, s.m, s.linkedin) }))),
  )
}

function documenteSee(): { nume: string; d: DocumentJuridic }[] {
  const texte = texteJuridice(operatorSee(), {})
  if (texte === null) throw new Error('familia SEE nu s-a construit pentru operatorul sintetic')
  return [...texte.entries()].map(([cheie, d]) => ({ nume: 'see ' + cheie, d }))
}

const randeazaPagina = (p: PaginaContinut) => renderToStaticMarkup(createElement(CorpPagina, { pagina: p }))
const randeazaDocument = (d: DocumentJuridic) => renderToStaticMarkup(createElement(CorpDocument, { document: d }))

// ---------------------------------------------------------------------------------------------
// Mutantul: parserul vechi, pe o copie
// ---------------------------------------------------------------------------------------------

const DOSAR_MUTANT = join(RADACINA, 'node_modules', '.cache', 'marcaj-in-linie')
/** Linia care desface interiorul accentului; mutantul o inlocuieste cu interiorul brut (parserul vechi). */
const LINIA_ACCENT = 'const interior = fragmenteAccent(m[1]);'

function scrieMutantul(): string {
  const sursa = readFileSync(SURSA_TIPURI, 'utf8')
  const aparitii = sursa.split(LINIA_ACCENT).length - 1
  if (aparitii !== 1) throw new Error('mutantul nu se poate face: linia accentului apare de ' + aparitii + ' ori in sursa')
  const mutant = sursa.replace(LINIA_ACCENT, 'const interior: FragmentInLinie[] = [{ fel: "text", text: m[1] }];')
  mkdirSync(DOSAR_MUTANT, { recursive: true })
  const cale = join(DOSAR_MUTANT, 'tipuri-mutant.ts')
  writeFileSync(cale, mutant, 'utf8')
  if (!readFileSync(cale, 'utf8').includes('text: m[1] }];')) throw new Error('mutantul n-a aterizat in copie')
  return cale
}

type ModulTipuri = typeof import('../src/content/juridic/tipuri')

async function cuMutantul<T>(f: (m: { tipuri: ModulTipuri; CorpPagina: typeof CorpPagina; CorpDocument: typeof CorpDocument }) => Promise<T>): Promise<T> {
  const cale = scrieMutantul()
  vi.resetModules()
  vi.doMock('../src/content/juridic/tipuri', () => import(pathToFileURL(cale).href))
  try {
    const tipuri = (await import('../src/content/juridic/tipuri')) as ModulTipuri
    const cp = (await import('../src/components/continut/CorpPagina')).default
    const cd = (await import('../src/components/juridic/CorpDocument')).default
    return await f({ tipuri, CorpPagina: cp, CorpDocument: cd })
  } finally {
    vi.doUnmock('../src/content/juridic/tipuri')
    vi.resetModules()
  }
}

// ---------------------------------------------------------------------------------------------
// Fixturile asamblate la rulare
// ---------------------------------------------------------------------------------------------

/** Un accent care contine o legatura spre `adresa`, cu text dupa el. */
function accentCuLegatura(text: string, adresa: string, dupa = ' Rest.'): string {
  return STELE + PARANTEZA + text + LIPITURA + adresa + ').' + STELE + dupa
}

function paginaSintetica(element: string): PaginaContinut {
  return {
    cheie: 'proba',
    meta: { titlu: 'Proba', descriere: 'x', cale: '/proba' },
    h1: 'Proba',
    capsula: 'Capsula.',
    sectiuni: [{ cheie: 'unu', titlu: 'Unu?', blocuri: [{ paragrafe: [], lista: { elemente: [element] } }] }],
    cta: { ref: 'en-proba', titluBloc: 'x', textWhatsapp: 'x', subiectEmail: 'x' },
    jsonLd: [],
    afirmatii: [],
  }
}

// ---------------------------------------------------------------------------------------------
// Forma fragmentului
// ---------------------------------------------------------------------------------------------

describe('forma fragmentului si legaturiInLinie', () => {
  it('un accent cu legatura: text = textul simplu al accentului, fragmente = text si legatura', () => {
    const sir = 'A ' + accentCuLegatura('Cauta', '/y')
    const f = fragmenteInLinie(sir)
    expect(f.map((x) => x.fel)).toEqual(['text', 'accent', 'text'])
    expect(f[1]).toEqual({
      fel: 'accent',
      text: 'Cauta.',
      fragmente: [
        { fel: 'legatura', text: 'Cauta', adresa: '/y' },
        { fel: 'text', text: '.' },
      ],
    })
    expect(textSimplu(sir)).toBe('A Cauta. Rest.')
    expect(legaturiInLinie(sir)).toEqual([{ text: 'Cauta', adresa: '/y' }])
  })

  it('un accent fara legatura are fragmente = [{ fel: "text", text }]; fara accent in accent', () => {
    expect(fragmenteInLinie(STELE + 'gros' + STELE)).toEqual([{ fel: 'accent', text: 'gros', fragmente: [{ fel: 'text', text: 'gros' }] }])
    for (const f of fragmenteInLinie('x ' + accentCuLegatura('a', '/b') + ' ' + STELE + 'c' + STELE)) {
      if (f.fel === 'accent') expect(f.fragmente.every((g) => g.fel !== 'accent')).toBe(true)
    }
  })

  it('legaturiInLinie: toate legaturile, inclusiv din accente, in ordinea din sir', () => {
    const sir = PARANTEZA + 'unu' + LIPITURA + '/1) si ' + accentCuLegatura('doi', '/2') + PARANTEZA + 'trei' + LIPITURA + '/3)'
    expect(legaturiInLinie(sir).map((l) => l.adresa)).toEqual(['/1', '/2', '/3'])
    expect(legaturiInLinie('fara marcaj')).toEqual([])
  })
})

// ---------------------------------------------------------------------------------------------
// Proba 1: zero reziduuri in textul randat de componentele reale
// ---------------------------------------------------------------------------------------------

describe('proba 1: zero reziduuri de marcaj in textul randat', () => {
  it('toate modulele EN, toate modulele ro-md si toate documentele juridice; numarul randat = numarul de pe disc', async () => {
    const en = await paginiDin(DOSAR_EN)
    const roMd = await paginiDin(DOSAR_RO_MD)
    const md = documenteMd()
    const see = documenteSee()
    // Controlul contra modulelor ratate: fiecare fisier de pe disc a dat o pagina randata, in afara modulelor de
    // continut al componentelor (felia 99), care nu au pagina si se verifica mai jos, pe sirurile lor.
    const compEn = await componenteDin(DOSAR_EN)
    const compRoMd = await componenteDin(DOSAR_RO_MD)
    expect(compEn.map((c) => c.fisier.split(/[\\/]/).pop())).toContain('acasa-componente.ts')
    expect(compEn.map((c) => c.fisier.split(/[\\/]/).pop())).toContain('platforma-componente.ts')
    for (const c of [...compEn, ...compRoMd]) {
      expect(c.arePagina, c.fisier).toBe(false)
      expect(c.texte.length, c.fisier).toBeGreaterThan(20)
    }
    // Si modulele paginilor de referinta congruente (felia 106), verificate tot mai jos, pe sirurile lor.
    const referinta = await referintaDin(DOSAR_EN)
    expect(referinta.map((r) => r.fisier.split(/[\\/]/).pop()).sort()).toEqual([...MODULE_REFERINTA].sort())
    for (const r of referinta) expect(r.texte.length, r.fisier).toBeGreaterThan(5)
    expect(en.length).toBe(fisiereTs(DOSAR_EN).length - compEn.length - referinta.length)
    expect(en.length).toBeGreaterThanOrEqual(7)
    expect(roMd.length).toBe(fisiereTs(DOSAR_RO_MD).length - compRoMd.length)
    const moduleMd = readdirSync(DOSAR_MD).filter((f) => /\.(ro|en)\.ts$/.test(f))
    expect(new Set(md.map((x) => x.nume.split(' ')[0])).size).toBe(moduleMd.length)
    expect(see.length).toBeGreaterThan(0)

    const gasite: string[] = []
    for (const { fisier, pagina } of [...en, ...roMd]) for (const r of reziduuri(textDin(randeazaPagina(pagina)))) gasite.push(fisier + ': ' + r)
    for (const { fisier, texte } of [...compEn, ...compRoMd]) for (const t of texte) for (const r of reziduuri(t)) gasite.push(fisier + ': ' + r)
    for (const { fisier, texte } of referinta) for (const t of texte) for (const r of reziduuri(t)) gasite.push(fisier + ': ' + r)
    for (const { nume, d } of [...md, ...see]) for (const r of reziduuri(textDin(randeazaDocument(d)))) gasite.push(nume + ': ' + r)
    expect(gasite).toEqual([])
    console.log(
      '[marcaj-in-linie] randate: EN ' + en.length + ', ro-md ' + roMd.length + ', md ' + md.length + ' (' + moduleMd.length + ' module x ' + STARI.length + ' stari), SEE ' + see.length,
    )
  })

  it('pagina de start EN: "Search with sources" e in strong, ca legatura sau tinta, fara marcaj', async () => {
    const home = (await import('../src/content/en/home')).pagina
    const html = randeazaPagina(home)
    expect(html).toMatch(/<strong>(<a [^>]*href="\/features\/search"[^>]*>|<span [^>]*data-tinta-lipsa="\/features\/search"[^>]*>)Search with sources<\/(a|span)>\.<\/strong>/)
  })
})

// ---------------------------------------------------------------------------------------------
// Proba 3: controalele pozitive si mutantul
// ---------------------------------------------------------------------------------------------

describe('proba 3: controalele pozitive, asamblate la rulare, si mutantul', () => {
  it('un modul sintetic cu accent care contine o legatura da o legatura cu href in strong', () => {
    // O cale care exista in build-ul probei (altfel `Tinta` o randeaza inerta), aleasa la rulare.
    const cale = [...CAI_EXISTENTE].find((c) => c !== '/' && !c.includes('#'))
    expect(cale).toBeDefined()
    const html = randeazaPagina(paginaSintetica(accentCuLegatura('Titlu de card', cale as string)))
    expect(html).toContain('<strong><a href="' + cale + '">Titlu de card</a>.</strong>')
    expect(reziduuri(textDin(html))).toEqual([])
    // Si o adresa interna de pagina (`#`), care nu trece prin `Tinta`.
    const ancora = renderToStaticMarkup(createElement(TextInLinie, { text: accentCuLegatura('Sus', '#y') }))
    expect(ancora).toBe('<strong><a href="#y">Sus</a>.</strong> Rest.')
  })

  it('detectorul iese rosu pe reziduuri fabricate (stele, lipitura, legatura bruta) si verde pe text curat', () => {
    expect(reziduuri('a ' + STELE + 'b')).toHaveLength(1)
    expect(reziduuri('vezi ' + PARANTEZA + 'x' + LIPITURA + '/y)')).toHaveLength(1)
    expect(reziduuri(textDin('<p>' + accentCuLegatura('Search', '/s') + '</p>'))).toHaveLength(2)
    expect(reziduuri('[ref:en-home] si [1] si (paranteza)')).toEqual([])
  })

  it('MUTANTUL (parserul vechi, pe o copie) inroseste proba 1 pe pagina de start EN si controlul pozitiv', async () => {
    const reziduuriMutant = await cuMutantul(async ({ tipuri, CorpPagina: cp }) => {
      // Controlul ca mutantul chiar e cel incarcat: accentul lui nu se desface.
      expect(tipuri.textSimplu(accentCuLegatura('a', '/b'))).toContain(LIPITURA)
      const home = ((await import('../src/content/en/home')) as { pagina: PaginaContinut }).pagina
      const sintetic = renderToStaticMarkup(createElement(cp, { pagina: paginaSintetica(accentCuLegatura('Titlu', '/y')) }))
      return { home: reziduuri(textDin(renderToStaticMarkup(createElement(cp, { pagina: home })))), sintetic: reziduuri(textDin(sintetic)) }
    })
    expect(reziduuriMutant.home.length).toBeGreaterThan(0)
    expect(reziduuriMutant.sintetic.length).toBeGreaterThan(0)
    // Dupa mutant, modulul real e la loc.
    expect(textSimplu(accentCuLegatura('a', '/b'))).toBe('a. Rest.')
  })
})

// ---------------------------------------------------------------------------------------------
// Proba 4: textSimplu identic cu baza pe toate sirurile existente, cu o singura exceptie
// ---------------------------------------------------------------------------------------------

/** Toate sirurile dintr-o valoare (obiecte, liste), in adancime. */
function siruriDin(v: unknown, iesire: Set<string>): void {
  if (typeof v === 'string') iesire.add(v)
  else if (Array.isArray(v)) for (const x of v) siruriDin(x, iesire)
  else if (v !== null && typeof v === 'object') for (const x of Object.values(v)) siruriDin(x, iesire)
}

const SIR_LITERAL = /"(?:[^"\\\n]|\\.)*"/g

describe('proba 4: invarianta lui textSimplu fata de parserul vechi', () => {
  it('pe toate sirurile existente (sursa src/content si obiectele compuse) difera exact un sir, cel din home.ts', async () => {
    const siruri = new Set<string>()
    for (const f of fisiereTs(DOSAR_CONTINUT)) {
      for (const m of readFileSync(f, 'utf8').matchAll(SIR_LITERAL)) {
        try {
          siruri.add(JSON.parse(m[0]) as string)
        } catch {
          // un literal care nu e JSON valid (de pilda o secventa de evadare TypeScript); obiectele compuse il acopera
        }
      }
    }
    for (const { pagina } of [...(await paginiDin(DOSAR_EN)), ...(await paginiDin(DOSAR_RO_MD))]) siruriDin(pagina, siruri)
    for (const { d } of [...documenteMd(), ...documenteSee()]) siruriDin(d, siruri)
    expect(siruri.size).toBeGreaterThan(2000)

    const vechi = await cuMutantul(async ({ tipuri }) => new Map([...siruri].map((s) => [s, tipuri.textSimplu(s)])))
    const diferite = [...siruri].filter((s) => textSimplu(s) !== vechi.get(s))
    console.log('[marcaj-in-linie] proba 4: ' + siruri.size + ' siruri comparate, ' + diferite.length + ' diferite')
    expect(diferite).toHaveLength(1)
    // Exceptia asteptata: sirul de pe pagina de start EN, cu legatura in accent.
    expect(readFileSync(join(DOSAR_EN, 'home.ts'), 'utf8')).toContain(JSON.stringify(diferite[0]))
    expect(fragmenteInLinie(diferite[0]).some((f) => f.fel === 'accent' && f.fragmente.some((g) => g.fel === 'legatura'))).toBe(true)
    // farMarcaj (model/tipuri.ts) urmeaza aceeasi regula: numarul de cuvinte e cel al textului simplu.
    expect(numarCuvinte(diferite[0])).toBe(textSimplu(diferite[0]).trim().split(/\s+/).length)
  })
})

// ---------------------------------------------------------------------------------------------
// Proba 5: o legatura moarta intr-un accent e prinsa de bucla trecuta pe legaturiInLinie
// ---------------------------------------------------------------------------------------------

describe('proba 5: legaturile din accente ale documentelor juridice', () => {
  // Cele doua forme ale buclei din tests/juridic.test.ts (legaturile interne trebuie sa duca la o ruta
  // cunoscuta), copiate aici ca functii: noua (`legaturiInLinie`) si vechea (primul nivel).
  const nouaLegaturi = (sir: string) => legaturiInLinie(sir).filter((l) => l.adresa.startsWith('/')).map((l) => l.adresa.split('#')[0])
  const vecheLegaturi = (sir: string) =>
    fragmenteInLinie(sir)
      .flatMap((f) => (f.fel === 'legatura' && f.adresa.startsWith('/') ? [f.adresa.split('#')[0]] : []))

  function siruriDocument(d: DocumentJuridic): string[] {
    return [d.introducere, ...d.sectiuni.flatMap((s) => s.blocuri.flatMap((b) => [...b.paragrafe, ...(b.lista?.elemente ?? []), ...(b.dupa ?? [])]))]
  }

  it('pe o copie a unui document SEE cu o legatura moarta intr-un accent: bucla noua o prinde, cea veche nu', () => {
    const original = documenteSee()[0].d
    const copie = structuredClone(original)
    const moarta = '/' + ['nu', 'exista', String(Date.now())].join('-')
    copie.sectiuni[0].blocuri[0].paragrafe.push(accentCuLegatura('Vezi', moarta))
    const noua = siruriDocument(copie).flatMap(nouaLegaturi)
    const veche = siruriDocument(copie).flatMap(vecheLegaturi)
    expect(noua).toContain(moarta)
    // Controlul ca martorul chiar a ajuns in accent: bucla veche nu-l vede.
    expect(veche).not.toContain(moarta)
    // Pe originalul neatins cele doua bucle vad aceleasi legaturi (azi niciun accent juridic nu are legatura).
    expect(siruriDocument(original).flatMap(nouaLegaturi)).toEqual(siruriDocument(original).flatMap(vecheLegaturi))
  })
})

// ---------------------------------------------------------------------------------------------
// Forma inversa: interzisa in sursa
// ---------------------------------------------------------------------------------------------

describe('forma inversa (stelutele in textul legaturii) e interzisa in src/content', () => {
  it('zero aparitii in sursa; martorul asamblat la rulare e prins', () => {
    const gasite = fisiereTs(DOSAR_CONTINUT).filter((f) => FORMA_INVERSA.test(readFileSync(f, 'utf8')))
    expect(gasite.map((f) => relative(RADACINA, f))).toEqual([])
    expect(FORMA_INVERSA.test(PARANTEZA + STELE + 'Text' + STELE + LIPITURA + '/cale)')).toBe(true)
    expect(FORMA_INVERSA.test(accentCuLegatura('Text', '/cale'))).toBe(false)
  })
})
