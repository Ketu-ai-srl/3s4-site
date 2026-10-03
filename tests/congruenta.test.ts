import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

/**
 * Listele declarate ale probei de congruenta (`config/congruenta/*.json`), validate pe sursa: forma fiecarui rand,
 * codul de temei din lista INCHISA (`temeiuri.json`), caile perechilor (pagina RO si paginile 3s.md exista in
 * `src/app`), exceptiile pachetului JS si lista alba a textului. Masurarea pe paginile servite (semnatura de forma,
 * stilurile, textul RO pe EN, RON in bucatile JS) e in `tests/browser/congruenta.spec.ts`, pe build-ul RO si pe copia
 * 3s.md.
 *
 * Controlul (f) al specificatiei: un rand fara cod, cu un cod din afara listei sau un rand `camp` fara selector si
 * numaratori e refuzat. Randurile-martor se asambleaza la rulare.
 */

const RADACINA = join(__dirname, '..')
const DIR = join(RADACINA, 'config', 'congruenta')

type Json = Record<string, unknown>

function citeste(nume: string): Json {
  return JSON.parse(readFileSync(join(DIR, nume), 'utf8')) as Json
}

const TEMEIURI = citeste('temeiuri.json') as { coduri: Record<string, { fel: string; rezumat: string }> }
const CODURI = new Set(Object.keys(TEMEIURI.coduri))
const FISIERE_PERECHI = readdirSync(DIR).filter((f) => f.endsWith('.json') && typeof citeste(f).pereche === 'string')
const PERECHI = FISIERE_PERECHI.map((f) => ({ fisier: f, lista: citeste(f) }))

const CHEI_RADACINA = new Set(['tag', 'clasa', 'eticheta', 'ariaLabel', 'ciot'])
const CHEI_PERECHE = new Set(['_nota', '_nedeclarate', 'pereche', 'ro', 'pagini_3s_md', 'randuri'])
/** Clasa de modul fara hash: `Fisier_local` (numele fisierului, apoi numele local). */
const CLASA_MODUL = /^[A-Za-z][A-Za-z0-9-]*_[A-Za-z0-9_-]+$/
/** Sufixul de hash pe care Next il pune claselor de modul (`__` urmat de 5 caractere). */
const CU_HASH = /__[A-Za-z0-9_-]{5}$/

function numarNatural(v: unknown): boolean {
  return typeof v === 'number' && Number.isInteger(v) && v >= 0
}

/** Motivele pentru care un rand e refuzat; lista goala = randul e valid. */
function refuzuri(rand: unknown, coduri: Set<string>): string[] {
  if (rand === null || typeof rand !== 'object') return ['randul nu e obiect']
  const r = rand as Json
  const motive: string[] = []
  const cod = r.cod
  const lista = typeof cod === 'string' ? [cod] : Array.isArray(cod) ? cod : null
  if (lista === null || lista.length === 0) motive.push('randul nu are cod de temei')
  else {
    for (const c of lista) if (typeof c !== 'string' || !coduri.has(c)) motive.push('codul ' + JSON.stringify(c) + ' nu e in lista inchisa')
    if (new Set(lista).size !== lista.length) motive.push('cod repetat in acelasi rand')
  }
  if (typeof r.motiv !== 'string' || r.motiv.trim().length < 10) motive.push('randul nu are motiv scris')
  if (r.tip === 'componenta') {
    const rad = r.radacina
    if (rad === null || typeof rad !== 'object' || Object.keys(rad).length === 0) motive.push('componenta fara radacina')
    else for (const k of Object.keys(rad)) if (!CHEI_RADACINA.has(k)) motive.push('cheie necunoscuta in radacina: ' + k)
  } else if (r.tip === 'clasa') {
    if (typeof r.clasa !== 'string' || !CLASA_MODUL.test(r.clasa) || CU_HASH.test(r.clasa)) motive.push('clasa nu e un nume de modul fara hash')
  } else if (r.tip === 'camp') {
    if (typeof r.selector !== 'string' || r.selector.trim() === '') motive.push('campul nu are selector')
    if (!numarNatural(r.ro) || !numarNatural(r.en)) motive.push('campul nu are numaratorile RO si EN')
  } else {
    motive.push('tip necunoscut: ' + JSON.stringify(r.tip))
  }
  return motive
}

/** Fisierul paginii unei cai pe editia ei: `src/app/<cale>/page.tsx` (RO), `page.en.tsx` sub `(en)`, `page.romd.tsx` sub `(romd)`. */
function paginaExista(cale: string, editie: 'ro' | 'en' | 'romd'): boolean {
  const segmente = cale.split('/').filter(Boolean)
  if (editie === 'ro') return existsSync(join(RADACINA, 'src', 'app', ...segmente, 'page.tsx'))
  if (editie === 'en') return existsSync(join(RADACINA, 'src', 'app', '(en)', ...segmente, 'page.en.tsx'))
  return existsSync(join(RADACINA, 'src', 'app', '(romd)', ...segmente, 'page.romd.tsx'))
}

describe('lista inchisa a codurilor de temei', () => {
  it('are deciziile citate si cele trei reguli fara numar; fiecare cod are fel si rezumat', () => {
    for (const c of ['d3', 'd31', 'd38', 'd42', 'd43', 'd49', 'd54', 'val-ro-1.1', 'val-ro-i2', 'poarta-juridica-40-41']) {
      expect(CODURI.has(c), c).toBe(true)
    }
    for (const [c, v] of Object.entries(TEMEIURI.coduri)) {
      expect(['decizie', 'regula'], c).toContain(v.fel)
      expect(v.rezumat.length, c).toBeGreaterThanOrEqual(30)
      if (v.fel === 'decizie') expect(c).toMatch(/^d\d+$/)
    }
  })
})

describe('listele perechilor', () => {
  it('exista cel putin perechile din specificatie (fara juridic), fiecare intr-un singur fisier', () => {
    const nume = PERECHI.map((p) => p.lista.pereche as string)
    expect(new Set(nume).size).toBe(nume.length)
    for (const p of ['P01', 'P02', 'P03', 'P08', 'P09', 'P10', 'P11', 'G1', 'G2', 'G3']) expect(nume, p).toContain(p)
  })

  for (const { fisier, lista } of PERECHI) {
    it(fisier + ': cheile, caile si fiecare rand sunt valide', () => {
      for (const k of Object.keys(lista)) expect(CHEI_PERECHE.has(k), 'cheie necunoscuta ' + k).toBe(true)
      const ro = lista.ro as string
      expect(paginaExista(ro, 'ro'), 'pagina RO ' + ro).toBe(true)
      const pagini = lista.pagini_3s_md as string[]
      expect(pagini.length).toBeGreaterThan(0)
      for (const c of pagini) {
        const editie = c === '/ro' || c.startsWith('/ro/') ? 'romd' : 'en'
        expect(paginaExista(c, editie), 'pagina 3s.md ' + c).toBe(true)
      }
      const randuri = lista.randuri as unknown[]
      expect(Array.isArray(randuri)).toBe(true)
      expect(randuri.flatMap((r, i) => refuzuri(r, CODURI).map((m) => 'randul ' + i + ': ' + m))).toEqual([])
      // Un selector sau o clasa declarate de doua ori ar numara acelasi lucru de doua ori.
      const chei = randuri.map((r) => {
        const x = r as Json
        return x.tip === 'camp' ? 'camp:' + x.selector : x.tip === 'clasa' ? 'clasa:' + x.clasa : 'componenta:' + JSON.stringify(x.radacina)
      })
      expect(chei.filter((c, i) => chei.indexOf(c) !== i)).toEqual([])
    })
  }
})

describe('controlul (f): randul fara cod, cu un cod din afara listei sau un camp fara selector si numaratori e refuzat', () => {
  const bun = { tip: 'camp', selector: '[data-' + 'martor]', ro: 3, en: 1, cod: 'd' + '49', motiv: 'Un rand-martor asamblat la rulare.' }

  it('martorul negativ: un rand complet trece, si cu mai multe coduri', () => {
    expect(refuzuri(bun, CODURI)).toEqual([])
    expect(refuzuri({ ...bun, cod: ['d' + '43', 'd' + '49'] }, CODURI)).toEqual([])
  })

  it('fara cod, cu cod gol sau cu lista goala: refuzat', () => {
    const faraCod: Json = { ...bun }
    delete faraCod.cod
    expect(refuzuri(faraCod, CODURI)).toContain('randul nu are cod de temei')
    expect(refuzuri({ ...bun, cod: [] }, CODURI)).toContain('randul nu are cod de temei')
  })

  it('cu un cod din afara listei inchise: refuzat', () => {
    const strain = 'd' + String(900 + 99)
    expect(CODURI.has(strain)).toBe(false)
    expect(refuzuri({ ...bun, cod: strain }, CODURI).join('\n')).toContain('nu e in lista inchisa')
    expect(refuzuri({ ...bun, cod: ['d' + '43', strain] }, CODURI).join('\n')).toContain('nu e in lista inchisa')
    // Numarul gol "(43)" se scrie `d43`; forma fara prefix nu e in lista.
    expect(refuzuri({ ...bun, cod: '43' }, CODURI).join('\n')).toContain('nu e in lista inchisa')
  })

  it('un camp fara selector sau fara numaratori: refuzat', () => {
    const faraSelector: Json = { ...bun }
    delete faraSelector.selector
    expect(refuzuri(faraSelector, CODURI)).toContain('campul nu are selector')
    const faraEn: Json = { ...bun }
    delete faraEn.en
    expect(refuzuri(faraEn, CODURI)).toContain('campul nu are numaratorile RO si EN')
    expect(refuzuri({ ...bun, ro: -1 }, CODURI)).toContain('campul nu are numaratorile RO si EN')
    expect(refuzuri({ ...bun, en: 1.5 }, CODURI)).toContain('campul nu are numaratorile RO si EN')
  })

  it('o componenta fara radacina, o clasa cu hash si un tip necunoscut: refuzate', () => {
    expect(refuzuri({ tip: 'componenta', radacina: {}, cod: 'd3', motiv: 'Sectiunea formularului.' }, CODURI)).toContain('componenta fara radacina')
    expect(refuzuri({ tip: 'clasa', clasa: 'Erou_erou__' + 'AbCdE', cod: 'd43', motiv: 'Clasa cu hash, gresit.' }, CODURI)).toContain(
      'clasa nu e un nume de modul fara hash',
    )
    expect(refuzuri({ ...bun, tip: 'pagina' }, CODURI).join('\n')).toContain('tip necunoscut')
  })
})

describe('exceptiile pachetului JS si lista alba a textului', () => {
  it('fiecare exceptie numeste module care exista, pana cand si de ce', () => {
    const e = citeste('exceptii-pachet.json') as { exceptii: { module: string[]; pana_la: string; motiv: string }[] }
    expect(e.exceptii.length).toBeGreaterThan(0)
    for (const x of e.exceptii) {
      expect(x.module.length).toBeGreaterThan(0)
      for (const m of x.module) expect(existsSync(join(RADACINA, m)), m).toBe(true)
      expect(x.pana_la.length).toBeGreaterThan(5)
      expect(x.motiv.length).toBeGreaterThanOrEqual(60)
    }
  })

  it('fiecare intrare a listei albe are motiv scris', () => {
    const a = citeste('lista-alba-text.json') as { siruri: { sir: string; motiv: string }[]; elemente: { selector: string; motiv: string }[] }
    for (const x of [...a.siruri.map((s) => ({ cheie: s.sir, motiv: s.motiv })), ...a.elemente.map((s) => ({ cheie: s.selector, motiv: s.motiv }))]) {
      expect(x.cheie.trim().length, JSON.stringify(x)).toBeGreaterThan(0)
      expect(x.motiv.length, x.cheie).toBeGreaterThanOrEqual(30)
    }
  })
})
