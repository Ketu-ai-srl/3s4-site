import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

/**
 * Probele tokenilor (felia `fundatie`, directia REF-N): culorile din `globals.css` si contrastul
 * scris langa ele, regulile globale de miscare redusa si focus, fonturile din layout.
 *
 * CE CLASA DE DEFECT INCHID.
 *   1. Contrastul scris in comentariu care nu mai corespunde culorii: cineva schimba un hex si
 *      lasa cifra veche, iar urmatorul om alege culoarea pe baza cifrei. Proba recalculeaza
 *      fiecare cifra din hex, cu formula WCAG 2.x, si cere potrivire la doua zecimale.
 *   2. Un rol de text care coboara sub AA pe alb.
 *   3. Un `var(--color-...)` scris intr-o componenta pentru o culoare care nu exista in tokeni:
 *      CSS-ul nu crapa, doar cade pe culoarea mostenita, deci defectul e invizibil pana la captura.
 */

const RADACINA = join(__dirname, '..')
const citeste = (cale: string) => readFileSync(join(RADACINA, cale), 'utf8')
const css = citeste('src/app/globals.css')

const tema = css.slice(css.indexOf('@theme {'), css.indexOf('\n}', css.indexOf('@theme {')))
const culori: Record<string, string> = Object.fromEntries(
  [...tema.matchAll(/--color-([\w-]+):\s*(#[\da-f]{6});/g)].map((m) => [m[1], m[2]]),
)

function luminanta(hex: string): number {
  const [r, g, b] = hex
    .slice(1)
    .match(/../g)!
    .map((v) => parseInt(v, 16) / 255)
    .map((v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4))
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

function contrast(a: string, b: string): number {
  const [jos, sus] = [luminanta(a), luminanta(b)].sort((x, y) => x - y)
  return (sus + 0.05) / (jos + 0.05)
}

/** Fisierele sursa in care se pot folosi tokenii. */
function fisiere(dir: string, ext: RegExp): string[] {
  const rezultat: string[] = []
  for (const nume of readdirSync(join(RADACINA, dir))) {
    const cale = dir + '/' + nume
    if (statSync(join(RADACINA, cale)).isDirectory()) rezultat.push(...fisiere(cale, ext))
    else if (ext.test(nume)) rezultat.push(cale)
  }
  return rezultat
}

/** Tokenii de culoare folositi, care NU exista in tema. */
function tokeniNecunoscuti(texte: string[], cunoscute: Record<string, string>): string[] {
  const folosite = new Set<string>()
  for (const t of texte) for (const m of t.matchAll(/var\(--color-([\w-]+)\)/g)) folosite.add(m[1])
  return [...folosite].filter((n) => !(n in cunoscute)).sort()
}

describe('formula de contrast', () => {
  it('da valorile cunoscute ale standardului (control)', () => {
    expect(contrast('#000000', '#ffffff')).toBe(21)
    expect(contrast('#ffffff', '#ffffff')).toBe(1)
    // #767676 e pragul clasic de 4,54:1 pe alb.
    expect(contrast('#767676', '#ffffff')).toBeCloseTo(4.54, 2)
  })
})

describe('tokenii de culoare', () => {
  it('tema are rolurile de baza ale directiei', () => {
    for (const rol of ['alb', 'cerneala', 'cerneala-2', 'cerneala-3', 'ardezie-9', 'ardezie-5', 'albastru', 'albastru-apasat']) {
      expect(culori[rol], 'lipseste rolul ' + rol).toMatch(/^#[\da-f]{6}$/)
    }
    expect(Object.keys(culori).length).toBeGreaterThan(60)
  })

  it('cifra de contrast scrisa langa fiecare culoare e cea calculata din hex', () => {
    const scrise = [...tema.matchAll(/--color-([\w-]+):\s*(#[\da-f]{6});\s*\/\*\s*(\d+),(\d+):1(?! pe)/g)]
    expect(scrise.length, 'prea putine cifre de contrast gasite: tiparul nu mai prinde').toBeGreaterThan(20)
    for (const [, rol, hex, intregi, zecimale] of scrise) {
      const scris = Number(intregi + '.' + zecimale)
      expect(Math.abs(contrast(hex, '#ffffff') - scris), rol + ': scris ' + scris).toBeLessThan(0.006)
    }
  })

  it('martor POZITIV: o cifra gresita e prinsa de aceeasi comparatie', () => {
    const fals = '--color-proba: #666666; /* 7,50:1 */'
    const [, , hex, intregi, zecimale] = fals.match(/--color-([\w-]+):\s*(#[\da-f]{6});\s*\/\*\s*(\d+),(\d+):1/)!
    expect(Math.abs(contrast(hex, '#ffffff') - Number(intregi + '.' + zecimale))).toBeGreaterThan(0.006)
  })

  it('rolurile de text trec AA pe alb (4,5:1)', () => {
    const text = ['cerneala', 'cerneala-2', 'cerneala-3', 'noapte', 'ardezie-9', 'ardezie-8', 'ardezie-7', 'ardezie-6', 'ardezie-5', 'albastru', 'albastru-apasat', 'violet', 'verde-text', 'rosu', 'chihlimbar', 'gri-meta', 'gri-eticheta']
    for (const rol of text) {
      expect(contrast(culori[rol], culori.alb), rol).toBeGreaterThanOrEqual(4.5)
    }
  })

  it('rolurile decorative raman sub AA si sunt marcate ca atare in comentariu', () => {
    for (const rol of ['ardezie-4', 'gri-lob', 'gri-sigla', 'albastru-clar']) {
      expect(contrast(culori[rol], culori.alb), rol).toBeLessThan(4.5)
      const rand = tema.split('\n').find((r) => r.includes('--color-' + rol + ':'))!
      expect(rand, rol + ' nu spune unde are voie').toMatch(/DOAR|NU pe text|doar/)
    }
  })

  it('textul pe inchis din CTA si testimonial trece AA', () => {
    expect(contrast(culori.alb, culori['ardezie-9'])).toBeGreaterThanOrEqual(4.5)
    expect(contrast(culori['albastru-clar'], culori['ardezie-9'])).toBeGreaterThanOrEqual(4.5)
    expect(contrast(culori.alb, culori.albastru)).toBeGreaterThanOrEqual(4.5)
  })

  it('orice var(--color-...) folosit in src exista in tema', () => {
    const texte = [...fisiere('src', /\.(css|tsx|ts)$/)].map(citeste)
    expect(tokeniNecunoscuti(texte, culori)).toEqual([])
  })

  it('martor NEGATIV si POZITIV al cautarii de tokeni necunoscuti', () => {
    expect(tokeniNecunoscuti(['color: var(--color-alb);'], culori)).toEqual([])
    expect(tokeniNecunoscuti(['color: var(--color-alb-inventat);'], culori)).toEqual(['alb-inventat'])
  })
})

describe('regulile globale', () => {
  it('miscarea redusa opreste tranzitiile si animatiile peste tot', () => {
    const bloc = css.slice(css.indexOf('@media (prefers-reduced-motion: reduce)'))
    expect(bloc).toContain('transition-duration: 0.001ms !important')
    expect(bloc).toContain('animation-duration: 0.001ms !important')
    expect(bloc).toContain('scroll-behavior: auto')
  })

  it('focusul de tastatura are contur propriu, albastru', () => {
    expect(css).toMatch(/:focus-visible\s*\{\s*outline: 2px solid var\(--color-albastru\);/)
  })

  it('ancorele aterizeaza sub antetul fix', () => {
    expect(css).toMatch(/\[id\]\s*\{\s*scroll-margin-top: var\(--ancora-margine\);/)
  })
})

describe('fonturile', () => {
  const layout = citeste('src/app/layout.tsx')

  it('layout-ul incarca familiile directiei prin next/font, gazduite de site', () => {
    expect(layout).toMatch(/import \{[^}]*Plus_Jakarta_Sans[^}]*\} from "next\/font\/google"/)
    expect(layout).toContain('JetBrains_Mono')
    expect(layout).toContain('latin-ext')
  })

  it('variabilele de font din layout sunt cele citite de tema', () => {
    for (const v of ['--fnt-jakarta', '--fnt-mono', '--fnt-mana', '--fnt-jakarta-italic']) {
      expect(layout, v + ' lipseste din layout').toContain('"' + v + '"')
      expect(tema, v + ' lipseste din tema').toContain('var(' + v + ')')
    }
  })

  it('nicio adresa de fonturi externe in sursa (poarta C-01)', () => {
    const texte = fisiere('src', /\.(css|tsx|ts)$/).map(citeste).join('\n')
    expect(texte).not.toMatch(/fonts\.(googleapis|gstatic)\.com/)
  })
})
