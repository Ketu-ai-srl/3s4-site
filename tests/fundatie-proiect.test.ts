import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { RUTE } from '../src/content/rute'
import { expresieTipar, instanteDinBuild, rutePublice, tipareRute } from './browser/ajutor/proiect'

/**
 * Ajutorul comun al probelor de browser, extins pentru segmentele dinamice (plan §5.7): blogul
 * are `/blog/[slug]` si `/blog/categorie/[categorie]`, iar portile de browser deschideau rutele
 * LITERAL, deci ar fi cerut `/blog/[slug]` de la server. Instantele vin acum din build
 * (`.next/prerender-manifest.json`), ca felia `blog` sa nu atinga ajutorul comun.
 */

describe('tiparele de ruta', () => {
  it('un segment simplu, un rest si un rest optional', () => {
    expect(expresieTipar('/blog/[slug]').test('/blog/primul-articol')).toBe(true)
    expect(expresieTipar('/blog/[slug]').test('/blog/a/b')).toBe(false)
    expect(expresieTipar('/blog/[slug]').test('/blog')).toBe(false)
    expect(expresieTipar('/documente/[...cale]').test('/documente/a/b')).toBe(true)
    expect(expresieTipar('/documente/[...cale]').test('/documente')).toBe(false)
    expect(expresieTipar('/ajutor/[[...cale]]').test('/ajutor')).toBe(true)
    expect(expresieTipar('/ajutor/[[...cale]]').test('/ajutor/x/y')).toBe(true)
    expect(expresieTipar('/').test('/')).toBe(true)
  })

  it('literele cu sens in expresii regulate nu scapa din tipar', () => {
    expect(expresieTipar('/a.b/[x]').test('/axb/1')).toBe(false)
    expect(expresieTipar('/a.b/[x]').test('/a.b/1')).toBe(true)
  })

  it('instantele se iau din manifestul de prerandare, numai cele care se potrivesc', () => {
    const manifest = {
      routes: { '/': {}, '/blog/unu': {}, '/blog/doi': {}, '/blog/categorie/it': {}, '/preturi': {} },
    }
    expect(instanteDinBuild(['/blog/[slug]'], manifest)).toEqual(['/blog/doi', '/blog/unu'])
    expect(instanteDinBuild(['/blog/categorie/[categorie]'], manifest)).toEqual(['/blog/categorie/it'])
    expect(instanteDinBuild(['/blog/[slug]'], {})).toEqual([])
  })
})

describe('rutele publice ale arborelui real', () => {
  // Asteptarea se deriva din arbore si din RUTE (25.09). Forma veche, `toEqual(['/'])`, era starea
  // valului S4-1 scrisa de mana si a picat pe fiecare felie S4-3 care adauga corect o pagina.
  it('fara segmente dinamice, rutele publice vin din arbore fara build si acopera RUTE', () => {
    const tipare = tipareRute()
    const publice = rutePublice()
    expect(publice).toContain('/')
    if (!tipare.some((t) => t.includes('['))) expect([...publice].sort()).toEqual([...tipare].sort())
    for (const r of RUTE) {
      if (!r.cale.includes('[')) expect(publice, 'ruta din RUTE fara pagina in src/app: ' + r.cale).toContain(r.cale)
    }
  })

  it('tiparele se deduc din src/app, cu grupuri si directoare private sarite', () => {
    const baza = mkdtempSync(join(tmpdir(), 'rute-'))
    try {
      for (const d of ['(grup)/despre', '_privat/x', 'blog/[slug]', 'blog']) mkdirSync(join(baza, d), { recursive: true })
      for (const f of ['page.tsx', '(grup)/despre/page.tsx', '_privat/x/page.tsx', 'blog/[slug]/page.tsx', 'blog/page.tsx']) {
        writeFileSync(join(baza, f), 'export default function P() { return null }')
      }
      expect(tipareRute(baza)).toEqual(['/', '/blog', '/blog/[slug]', '/despre'])
    } finally {
      rmSync(baza, { recursive: true, force: true })
    }
  })
})
