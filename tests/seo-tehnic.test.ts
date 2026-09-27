import { readdirSync, readFileSync } from 'node:fs'
import { join, relative, sep } from 'node:path'
import { describe, expect, it } from 'vitest'
import { dateFir } from '../src/components/primitive/FirPagina'
import {
  PAGINARE,
  PE_PAGINA,
  articolePagina,
  calePagina,
  numarPagini,
  paginaDinSegment,
  vecini,
} from '../src/components/blog/paginare'
import { tintaActiva } from '../src/components/primitive/Tinta'
import { LIMITE_SEO, abateriMetadata } from '../src/components/seo/metadata'
import { TARI_DESERVITE, nodOrganizatie } from '../src/components/seo/date-structurate'
import { META_ACASA } from '../src/content/acasa'
import { ARTICOLE } from '../src/content/blog/registru'
import { META_CAUTARE_AI } from '../src/content/functionalitati/cautare-ai'
import { SUBSOL } from '../src/content/navigatie'
import { META_PLATFORMA } from '../src/content/produs/platforma'
import { RUTE } from '../src/content/rute'
import { RADACINA } from './browser/ajutor/proiect'

/**
 * Felia seo-tehnic: constatarile auditului SEO din 27.09 (M1, M3, D2, m1, m3, m4, m5, m9) si GEO M2,
 * partea care se poate masura fara server. Legaturile intrate pe HTML-ul servit, pagina 404 si foaia
 * de tipar se masoara in `tests/browser/seo-tehnic.spec.ts`.
 */

// --------------------------------------------------------------------------------------------
// M3: titlurile documentului pe start, /platforma si /functionalitati/cautare-ai
// --------------------------------------------------------------------------------------------

/** Ce trebuie sa numeasca fiecare titlu (termenii cautati din audit), fara diacritice, litere mici. */
const TITLURI = [
  { cale: '/', titlu: META_ACASA.titlu, descriere: META_ACASA.descriere, cere: ['arhivare documente', 'sursa citata'] },
  { cale: '/platforma', titlu: META_PLATFORMA.titlu, descriere: META_PLATFORMA.descriere, cere: ['arhivare electronica a documentelor'] },
  {
    cale: '/functionalitati/cautare-ai',
    titlu: META_CAUTARE_AI.titlu,
    descriere: META_CAUTARE_AI.descriere,
    cere: ['documente scanate', 'pagina citata'],
  },
]

const simplu = (t: string) => t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

/** Abaterile unui titlu de la regulile M3 + D15. Lista goala = titlu bun. */
function abateriTitlu(titlu: string, cere: readonly string[]): string[] {
  const a: string[] = []
  if (!titlu.endsWith(' | 3S')) a.push('nu se termina in „ | 3S"')
  if (/\.\s*$/.test(titlu.replace(/ \| 3S$/, ''))) a.push('punct final')
  if (titlu.length < LIMITE_SEO.titluMin || titlu.length > LIMITE_SEO.titluMax) a.push('lungime ' + titlu.length)
  if (simplu(titlu).includes('dumneavoastra')) a.push('forma de politete (D15)')
  for (const c of cere) if (!simplu(titlu).includes(c)) a.push('lipseste „' + c + '"')
  return a
}

describe('M3: titlurile documentului', () => {
  it('fiecare titlu numeste termenul cautat, se termina in „| 3S", fara punct si fara „dumneavoastra"', () => {
    for (const t of TITLURI) {
      expect(abateriTitlu(t.titlu, t.cere), t.cale).toEqual([])
      expect(abateriMetadata({ titlu: t.titlu, descriere: t.descriere, cale: t.cale }), t.cale).toEqual([])
    }
  })

  it('titlurile sunt unice intre ele', () => {
    expect(new Set(TITLURI.map((t) => t.titlu)).size).toBe(TITLURI.length)
  })

  it('martor POZITIV: fiecare regula prinde titlul care o incalca', () => {
    expect(abateriTitlu('Arhivare documente cu sursa citată', ['arhivare documente'])).toEqual(['nu se termina in „ | 3S"'])
    expect(abateriTitlu('Arhivare documente pentru firma ta. | 3S', ['arhivare documente'])).toEqual(['punct final'])
    expect(abateriTitlu('Arhivarea documentelor dumneavoastră | 3S', [])).toEqual(['forma de politete (D15)'])
    expect(abateriTitlu('Platforma 3S | 3S', ['arhivare electronica a documentelor'])).toEqual([
      'lipseste „arhivare electronica a documentelor"',
    ])
    expect(abateriTitlu('X'.repeat(70) + ' | 3S', [])).toEqual(['lungime 75'])
  })
})

// --------------------------------------------------------------------------------------------
// GEO M2: Organization cu areaServed si, numai cu adresa confirmata, email + contactPoint
// --------------------------------------------------------------------------------------------

describe('GEO M2: nodul Organization', () => {
  const BAZA = 'https://exemplu-lansare.ro'

  it('areaServed numeste Romania si Republica Moldova, pe orice brand', () => {
    for (const email of ['', 'contact@exemplu-lansare.ro']) {
      const n = nodOrganizatie(BAZA, email)
      expect(n.areaServed).toEqual(TARI_DESERVITE.map((cod) => ({ '@type': 'Country', name: cod })))
    }
    expect([...TARI_DESERVITE]).toEqual(['RO', 'MD'])
  })

  it('brand sintetic CU adresa: apar email si contactPoint, cu aceeasi adresa', () => {
    const n = nodOrganizatie(BAZA, 'contact@exemplu-lansare.ro')
    expect(n.email).toBe('contact@exemplu-lansare.ro')
    expect(n.contactPoint).toMatchObject({ '@type': 'ContactPoint', email: 'contact@exemplu-lansare.ro' })
  })

  it('brand sintetic FARA adresa: lipsesc amandoua (azi config/brand.json are adresa goala)', () => {
    const n = nodOrganizatie(BAZA, '')
    expect('email' in n).toBe(false)
    expect('contactPoint' in n).toBe(false)
    expect(JSON.stringify(n)).not.toContain('@exemplu-lansare.ro')
  })

  it('martor NEGATIV: o adresa fara forma de adresa opreste, nu ajunge in date', () => {
    expect(() => nodOrganizatie(BAZA, 'nu-e-adresa')).toThrow()
  })

  it('niciun camp de firma in nod, cu sau fara adresa (poarta S-09)', () => {
    const interzise = ['address', 'legalName', 'taxID', 'vatID', 'telephone', 'faxNumber']
    for (const email of ['', 'contact@exemplu-lansare.ro']) {
      const text = JSON.stringify(nodOrganizatie(BAZA, email))
      for (const c of interzise) expect(text, c).not.toContain('"' + c + '"')
    }
  })
})

// --------------------------------------------------------------------------------------------
// D2: nicio adresa absoluta scrisa din ADRESA_BAZA in afara lui `adresaSite()`
// --------------------------------------------------------------------------------------------

/** Codul fara comentarii: un comentariu care numeste constanta nu o citeste. */
const faraComentarii = (t: string) => t.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1')

/** Fisierele din `src` care citesc `ADRESA_BAZA` direct. Singurii cititori permisi: definitia si `adresaSite()`. */
function cititoriAdresaBaza(fisiere: { cale: string; text: string }[]): string[] {
  const permise = new Set(['src/content/rute.ts', 'src/lib/site.ts'])
  return fisiere.filter((f) => !permise.has(f.cale) && /\bADRESA_BAZA\b/.test(faraComentarii(f.text))).map((f) => f.cale)
}

function fisiereSursa(): { cale: string; text: string }[] {
  const rezultat: { cale: string; text: string }[] = []
  const mergi = (dir: string) => {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      const p = join(dir, e.name)
      if (e.isDirectory()) mergi(p)
      else if (/\.(tsx?|mdx?)$/.test(e.name)) rezultat.push({ cale: relative(RADACINA, p).split(sep).join('/'), text: readFileSync(p, 'utf8') })
    }
  }
  mergi(join(RADACINA, 'src'))
  return rezultat
}

describe('D2: adresa de baza vine numai din adresaSite()', () => {
  const fisiere = fisiereSursa()

  it('niciun fisier din src, in afara definitiei si a lui adresaSite(), nu citeste ADRESA_BAZA', () => {
    expect(fisiere.length).toBeGreaterThan(100)
    expect(cititoriAdresaBaza(fisiere)).toEqual([])
  })

  it('martor POZITIV: un fisier care importa ADRESA_BAZA e prins', () => {
    const fabricat = { cale: 'src/components/primitive/Fabricat.tsx', text: ['import { ADRESA', '_BAZA } from "@/content/rute";'].join('') }
    expect(cititoriAdresaBaza([...fisiere, fabricat])).toEqual(['src/components/primitive/Fabricat.tsx'])
  })

  it('martor NEGATIV: un comentariu care numeste constanta nu e o citire', () => {
    const numeste = { cale: 'src/components/primitive/Numeste.tsx', text: ['// inainte venea din ADRESA', '_BAZA', '\n', 'export const x = 1;'].join('') }
    expect(cititoriAdresaBaza([numeste])).toEqual([])
  })

  it('firul de pagina scrie adresele pe baza primita, nu pe domeniul de proba', () => {
    const d = dateFir([{ text: 'Acasă', cale: '/' }, { text: 'Blog', cale: '/blog' }], 'https://exemplu-lansare.ro')
    expect(d.itemListElement.map((i) => i.item)).toEqual(['https://exemplu-lansare.ro/', 'https://exemplu-lansare.ro/blog'])
  })
})

// --------------------------------------------------------------------------------------------
// m1: paginarea listarii blogului
// --------------------------------------------------------------------------------------------

describe('m1: paginarea blogului', () => {
  it('paginile acopera fiecare articol din registru exact o data', () => {
    const total = numarPagini(ARTICOLE.length)
    const vazute = Array.from({ length: total }, (_, i) => articolePagina(ARTICOLE, i + 1)).flat().map((a) => a.slug)
    expect(vazute.sort()).toEqual(ARTICOLE.map((a) => a.slug).sort())
    expect(PE_PAGINA).toBe(9)
  })

  it('adresele: prima pagina e /blog, restul /blog/pagina/<n>; vecinii se leaga in ambele sensuri', () => {
    expect(calePagina(1)).toBe('/blog')
    expect(calePagina(2)).toBe('/blog/pagina/2')
    expect(vecini(1, 3)).toEqual({ anterioara: null, urmatoare: '/blog/pagina/2' })
    expect(vecini(2, 3)).toEqual({ anterioara: '/blog', urmatoare: '/blog/pagina/3' })
    expect(vecini(3, 3)).toEqual({ anterioara: '/blog/pagina/2', urmatoare: null })
    expect(vecini(1, 1)).toEqual({ anterioara: null, urmatoare: null })
  })

  it('segmentul de adresa: numai 2..total; 1, zerouri in fata si depasirea nu sunt pagini', () => {
    expect(paginaDinSegment('2', 2)).toBe(2)
    for (const s of ['1', '02', '3', '0', 'doi', '2.0', '']) expect(paginaDinSegment(s, 2), s).toBeNull()
  })

  it('titlurile si descrierile paginilor intra in pragurile portii si difera de ale listarii', () => {
    for (const n of [2, 3, 12]) {
      expect(abateriMetadata({ titlu: PAGINARE.titluPagina(n), descriere: PAGINARE.descriere(n), cale: calePagina(n) }), String(n)).toEqual([])
    }
    expect(PAGINARE.titluPagina(2)).not.toBe(PAGINARE.titluPagina(3))
  })
})

// --------------------------------------------------------------------------------------------
// M1 si m9: legaturile din subsol si de pe start
// --------------------------------------------------------------------------------------------

describe('M1 si m9: legaturile subsolului', () => {
  const produs = SUBSOL.coloane.find((c) => c.titlu === 'Produs')!
  const resurse = SUBSOL.coloane.find((c) => c.titlu === 'Resurse')!
  const PAGINI_PRODUS = RUTE.map((r) => r.cale).filter((c) => c.startsWith('/functionalitati/') || c === '/flux-documente')

  it('coloana Produs duce la cele 6 functionalitati, la fluxul documentelor si la ambele comparatii, toate active', () => {
    expect(PAGINI_PRODUS.length).toBe(7)
    const tinte = produs.legaturi.filter((l) => tintaActiva(l)).map((l) => l.href)
    for (const cale of [...PAGINI_PRODUS, '/comparatie-drive', '/comparatie-stocare']) expect(tinte, cale).toContain(cale)
  })

  it('coloana Resurse nu mai tinteste articole care nu exista (m9)', () => {
    const articole = new Set(ARTICOLE.map((a) => '/blog/' + a.slug))
    const spreArticole = resurse.legaturi.map((l) => l.href).filter((h): h is string => h !== null && /^\/blog\/(?!categorie\/)[^/]+$/.test(h))
    expect(spreArticole.length).toBeGreaterThan(0)
    expect(spreArticole.filter((h) => !articole.has(h))).toEqual([])
  })
})
