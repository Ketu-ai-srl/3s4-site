import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { continutPaleta } from '../src/components/global/paleta'
import { ARTICOLE } from '../src/content/blog/registru'
import { CAI_EXISTENTE } from '../src/content/cai'
import { grupeHarta } from '../src/content/juridic/harta'
import { CALE_JURIDIC, OPERATOR_NUMIT, SLUGURI_JURIDICE } from '../src/content/juridic/publicare'
import { ascunse, multimeaCailor, toateLegaturileNavigatiei, type Legatura } from '../src/content/navigatie'
import { RUTE, rutePentruHarta } from '../src/content/rute'
import { expresieTipar, RADACINA, tipareRute } from './browser/ajutor/proiect'

/**
 * COMPLETITUDINEA NAVIGATIEI LA LIVRARE (plan S4 §5.1 regula 5, §S4-5). In valurile intermediare
 * navigatia isi ascundea legaturile spre rutele care nu existau inca. La livrare, o legatura
 * ascunsa e permisa numai dintr-un motiv DECIS, iar lista motivelor e inchisa:
 *
 *   - `fara-destinatie`: `href: null` - nimeni n-a decis inca unde duce (retelele fara cont
 *     cunoscut, "Despre 3S", posta cat timp `config/brand.json` n-are adresa confirmata);
 *   - `juridic-fara-operator`: pagina juridica exista in cod, dar decizia owner-ului din 24.09
 *     („Nimeni deocamdata", plan §9) o tine in afara RUTE cat timp `config/operator.json` e null;
 *
 * Motivul `articol-propus` (un articol de blog propus de navigatie si nescris) a iesit din lista
 * odata cu felia seo-tehnic (auditul SEO din 27.09, m9): cele trei articole propuse si nescrise au
 * primit `href: null`, deci sunt acum `fara-destinatie`. O legatura spre un articol care nu exista
 * nu mai are niciun motiv permis: e defect, iar martorul de mai jos o prinde.
 *
 * Orice alta legatura ascunsa e DEFECT, iar o legatura ascunsa spre o pagina care exista (pe disc
 * sau in registrul blogului) e defect oricare ar fi motivul, in afara celui juridic.
 */

/** Articolele propuse candva de navigatie si nescrise; azi toate trei au `href: null`. */
const ARTICOLE_NESCRISE = [
  '/blog/biroul-fara-hartie',
  '/blog/fluxuri-automate-de-documente',
  '/blog/actele-firmei-si-gdpr',
] as const

type Motiv = 'fara-destinatie' | 'juridic-fara-operator'

/** Rutele statice din `src/app` si tiparele dinamice, citite o data. */
const TIPARE = tipareRute()

/** Exista o pagina a site-ului pentru calea data (pe disc sau in registrul blogului)? */
export function arePagina(cale: string, articole: readonly { slug: string }[] = ARTICOLE): boolean {
  const curata = cale.split(/[?#]/)[0] || '/'
  if (curata.startsWith('/blog/') && !curata.startsWith('/blog/categorie/')) {
    const slug = curata.slice('/blog/'.length)
    return articole.some((a) => a.slug === slug) || existsSync(join(RADACINA, 'src', 'content', 'blog', slug + '.mdx'))
  }
  if (curata === CALE_JURIDIC || curata.startsWith(CALE_JURIDIC + '/')) {
    const slug = curata.slice(CALE_JURIDIC.length + 1)
    return curata === CALE_JURIDIC || (SLUGURI_JURIDICE as readonly string[]).includes(slug)
  }
  return TIPARE.some((t) => !t.includes('[') && t === curata) || TIPARE.some((t) => t.includes('[') && !t.startsWith('/blog') && !t.startsWith(CALE_JURIDIC) && expresieTipar(t).test(curata))
}

export type Clasificare = { permise: { legatura: Legatura; motiv: Motiv }[]; defecte: { legatura: Legatura; de_ce: string }[] }

/** Clasifica legaturile ascunse pe lista inchisa de motive. Totul e parametru, pentru martori. */
export function clasificaAscunse(
  legaturi: Legatura[],
  cai: ReadonlySet<string>,
  operatorNumit: boolean,
  pagina: (cale: string) => boolean = (c) => arePagina(c),
): Clasificare {
  const rezultat: Clasificare = { permise: [], defecte: [] }
  for (const l of ascunse(legaturi, cai)) {
    if (l.href === null) {
      rezultat.permise.push({ legatura: l, motiv: 'fara-destinatie' })
      continue
    }
    const ruta = l.ruta ?? l.href
    const juridic = ruta === CALE_JURIDIC || ruta.startsWith(CALE_JURIDIC + '/')
    if (juridic && !operatorNumit && pagina(ruta)) {
      rezultat.permise.push({ legatura: l, motiv: 'juridic-fara-operator' })
      continue
    }
    if (pagina(ruta)) {
      rezultat.defecte.push({ legatura: l, de_ce: 'ascunsa, dar pagina ' + ruta + ' exista' })
      continue
    }
    rezultat.defecte.push({ legatura: l, de_ce: 'ascunsa fara motiv decis (' + ruta + ')' })
  }
  return rezultat
}

/** Calea interna a unei tinte, fara ancora si parametri; `null` pentru posta si exterior. */
function caleInterna(href: string): string | null {
  if (!href.startsWith('/')) return null
  return href.split(/[?#]/)[0] || '/'
}

describe('completitudinea navigatiei la livrare (S4-5)', () => {
  const toate = toateLegaturileNavigatiei()
  const real = clasificaAscunse(toate, CAI_EXISTENTE, OPERATOR_NUMIT)

  it('nicio legatura ascunsa fara motiv decis, si niciuna ascunsa spre o pagina care exista', () => {
    const rezumat = real.permise.map((p) => p.motiv + ' ' + (p.legatura.href ?? '(null) ' + p.legatura.text))
    console.log('[completitudine] legaturi ' + toate.length + ' | ascunse ' + (real.permise.length + real.defecte.length) + ' | permise: ' + rezumat.join('; '))
    expect(real.defecte.map((d) => d.de_ce)).toEqual([])
  })

  it('fiecare legatura vizibila duce la o cale din CAI_EXISTENTE', () => {
    const vizibile = toate.filter((l) => !ascunse([l], CAI_EXISTENTE).length && l.href !== null)
    expect(vizibile.length).toBeGreaterThan(40)
    const moarte = vizibile.map((l) => caleInterna(l.href as string)).filter((c): c is string => c !== null && !CAI_EXISTENTE.has(c))
    expect(moarte).toEqual([])
  })

  it('niciun motiv in afara listei inchise; articolele nescrise nu mai sunt tinta niciunei legaturi', () => {
    const motive = new Set(real.permise.map((p) => p.motiv))
    expect([...motive].filter((m) => m !== 'fara-destinatie' && m !== 'juridic-fara-operator')).toEqual([])
    const tinte = toate.map((l) => l.href).filter((h): h is string => h !== null)
    for (const cale of ARTICOLE_NESCRISE) {
      expect(arePagina(cale), cale).toBe(false)
      expect(tinte, cale).not.toContain(cale)
    }
  })

  it('martor POZITIV: o legatura spre un articol nescris, cu destinatie, e prinsa ca defect', () => {
    const cale = ARTICOLE_NESCRISE[0]
    const propusa: Legatura = { text: 'x', href: cale, ruta: cale }
    const r = clasificaAscunse([...toate, propusa], CAI_EXISTENTE, OPERATOR_NUMIT)
    expect(r.defecte.map((d) => d.de_ce)).toEqual(['ascunsa fara motiv decis (' + cale + ')'])
  })

  it('motivul juridic se aplica numai cat timp operatorul e null', () => {
    const juridice = real.permise.filter((p) => p.motiv === 'juridic-fara-operator')
    if (OPERATOR_NUMIT) expect(juridice).toEqual([])
    else expect(juridice.length).toBeGreaterThan(0)
  })

  it('paleta de cautare: fiecare rezultat, pentru orice litera, duce la o cale existenta', () => {
    const interogari = ['', ...'abcdefghijklmnopqrstuvwxyz'.split('')]
    const cai = new Set<string>()
    for (const q of interogari) {
      for (const g of continutPaleta(q, CAI_EXISTENTE, RUTE, ARTICOLE)) for (const e of g.elemente) {
        const c = caleInterna(e.cale)
        if (c !== null) cai.add(c)
      }
    }
    expect(cai.size).toBeGreaterThan(20)
    expect([...cai].filter((c) => !CAI_EXISTENTE.has(c))).toEqual([])
  })

  it('harta site-ului: fiecare legatura duce la o cale existenta si fiecare ruta din harta apare', () => {
    const legaturi = grupeHarta(rutePentruHarta(), ARTICOLE).flatMap((g) => g.legaturi.map((l) => l.cale))
    expect(legaturi.filter((c) => !CAI_EXISTENTE.has(c))).toEqual([])
    expect(rutePentruHarta().map((r) => r.cale).filter((c) => !legaturi.includes(c))).toEqual([])
  })

  it('martor POZITIV: o ruta scoasa din CAI_EXISTENTE, cu pagina pe disc, e prinsa ca defect', () => {
    const faraSecuritate = multimeaCailor([...CAI_EXISTENTE].filter((c) => c !== '/securitate').map((cale) => ({ cale })))
    const r = clasificaAscunse(toate, faraSecuritate, OPERATOR_NUMIT)
    expect(r.defecte.map((d) => d.de_ce)).toContain('ascunsa, dar pagina /securitate exista')
  })

  it('martor POZITIV: o legatura spre o ruta inventata, fara motiv, e prinsa ca defect', () => {
    const inventata: Legatura = { text: 'x', href: '/nu-exista-la-livrare', ruta: '/nu-exista-la-livrare' }
    const r = clasificaAscunse([...toate, inventata], CAI_EXISTENTE, OPERATOR_NUMIT)
    expect(r.defecte.map((d) => d.de_ce)).toEqual(['ascunsa fara motiv decis (/nu-exista-la-livrare)'])
  })

  it('martor POZITIV: cu operator numit, legaturile juridice ascunse devin defecte', () => {
    const r = clasificaAscunse(toate, CAI_EXISTENTE, true)
    expect(r.defecte.some((d) => d.de_ce.includes(CALE_JURIDIC + '/'))).toBe(!OPERATOR_NUMIT)
  })

  it('martor NEGATIV: cu toate caile existente si articolele scrise, nimic nu e defect si raman doar cele fara destinatie', () => {
    const toateCaile = multimeaCailor(toate.map((l) => l.ruta).filter((r): r is string => r !== null).map((cale) => ({ cale })))
    const r = clasificaAscunse(toate, toateCaile, true, () => true)
    expect(r.defecte).toEqual([])
    expect(r.permise.every((p) => p.motiv === 'fara-destinatie')).toBe(true)
  })

  it('arePagina: controale pe cai cunoscute', () => {
    expect(arePagina('/securitate')).toBe(true)
    expect(arePagina('/blog/' + ARTICOLE[0].slug)).toBe(true)
    expect(arePagina('/juridic/termeni')).toBe(true)
    expect(arePagina('/nu-exista-la-livrare')).toBe(false)
    expect(arePagina('/blog/biroul-fara-hartie')).toBe(false)
  })
})
