import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import Erou from '../src/components/erou/Erou'
import { EROU } from '../src/content/acasa'
import { EROU_EN } from '../src/content/en/acasa-componente'

/**
 * SCENA EROULUI DUPA FIGURA PLATFORMEI (decizia 61, 04.10.2026): figura din pagina de autentificare a
 * aplicatiei 3S, pe fiecare editie a startului - site-ul RO (ro-RO) si 3s.md (en). /ro primeste aceeasi
 * scena odata cu eroul lui, intr-o felie ulterioara.
 *
 * Ce se masoara, pe HTML-ul randat pe server si pe foaia de stil a scenei:
 *   - etichetele: lobii si cele sase noduri sunt textele aplicatiei, pe limba editiei, in ordinea drumului;
 *     listele de mai jos sunt scrise de mana din textele aplicatiei, nu citite din continutul site-ului;
 *   - eticheta accesibila a figurii e cea a aplicatiei, pe un singur element `role="img"`, iar cuvintele
 *     din figura (lobii, nodurile) sunt ascunse cititoarelor de ecran;
 *   - pe 3s.md (lansare false) scena poarta martorul `data-fara-lansare` scris pe server, iar pe RO nu;
 *     fara legenda si fara pastila centrului pe 3s.md. Butonul centrului se randeaza abia dupa montare,
 *     deci in HTML-ul de pe server lipseste pe ORICE editie si absenta lui de aici nu dovedeste nimic:
 *     garda butonului (zero `<button>` in scena dupa hidratare, cu control pe centru) e cazul de browser
 *     din tests/browser/editie-start-en.spec.ts;
 *   - miscarea redusa: fiecare clasa a foii care porneste o animatie e oprita in blocul
 *     `prefers-reduced-motion` (citit din foaie, cu martor pozitiv pe o foaie mutata);
 *   - contrastul: etichetele nodurilor si ale lobilor, pe fundalul lor, cel putin 4,5:1.
 */

const NODURI_RO = ['Scanare', 'Text OCR', 'Încărcare', 'Clasificare 3S', 'Căutare', 'Chat 3S']
const NODURI_EN = ['Scan', 'OCR text', 'Upload', '3S classification', 'Search', '3S chat']
const ORDINE = ['sus-stanga', 'capat-stanga', 'jos-stanga', 'sus-dreapta', 'capat-dreapta', 'jos-dreapta']

const html = {
  ro: renderToStaticMarkup(createElement(Erou)),
  en: renderToStaticMarkup(createElement(Erou, { continut: EROU_EN, lansare: false })),
}

/** Textele din `[data-eticheta-nod]` si `[data-eticheta-lob]`, in ordinea documentului. */
const texte = (h: string, atribut: string) => [...h.matchAll(new RegExp(atribut + '="">([^<]*)<', 'g'))].map((m) => m[1])
const pozitii = (h: string) => [...h.matchAll(/data-pozitie="([^"]+)"/g)].map((m) => m[1])
/** Scena: de la gazda ei pana la sfarsitul sectiunii (dupa coloana de text). */
const scena = (h: string) => h.slice(h.indexOf('scenaGazda'))

describe('etichetele figurii, pe fiecare editie', () => {
  it('ro-RO: lobii Preluare / Arhivă si cele sase noduri ale aplicatiei, in ordinea drumului', () => {
    expect(texte(html.ro, 'data-eticheta-lob')).toEqual(['Preluare', 'Arhivă'])
    expect(texte(html.ro, 'data-eticheta-nod')).toEqual(NODURI_RO)
    expect(pozitii(html.ro)).toEqual(ORDINE)
  })

  it('3s.md (en): lobii Intake / Archive si cele sase noduri ale aplicatiei, in ordinea drumului', () => {
    expect(texte(html.en, 'data-eticheta-lob')).toEqual(['Intake', 'Archive'])
    expect(texte(html.en, 'data-eticheta-nod')).toEqual(NODURI_EN)
    expect(pozitii(html.en)).toEqual(ORDINE)
  })

  it('eticheta figurii e a aplicatiei, pe un singur role="img"; cuvintele din figura sunt ascunse', () => {
    const asteptat = {
      ro: 'Drumul unui document: scanat, citit prin OCR, încărcat, clasificat, căutabil după sens și disponibil în conversație.',
      en: 'The path a document takes: scanned, read by OCR, uploaded, classified, searchable by meaning, and answerable in chat.',
    }
    for (const editie of ['ro', 'en'] as const) {
      const h = scena(html[editie])
      expect(h.match(/role="img"/g), editie).toHaveLength(1)
      expect(h, editie).toContain('role="img" aria-label="' + asteptat[editie] + '"')
      // Fiecare nod si fiecare lob sta intr-un element aria-hidden.
      expect(h.match(/class="[^"]*nod[^"]*" data-pozitie="[^"]+" style="[^"]+" aria-hidden="true"/g), editie).toHaveLength(6)
      expect(h.match(/<span class="[^"]*lob[^"]*" style="[^"]+" aria-hidden="true"><span data-eticheta-lob/g), editie).toHaveLength(2)
    }
    expect(EROU.bucla.etichetaFigura).toBe(asteptat.ro)
    expect(EROU_EN.bucla.etichetaFigura).toBe(asteptat.en)
  })

  it('3s.md: martorul fara lansare scris pe server, fara legenda si fara pastila centrului; RO le pastreaza', () => {
    const en = scena(html.en)
    // Martorul fara lansare: pe EN exact o data, pe spatiul scenei; pe RO deloc (controlul).
    expect(html.en.match(/data-fara-lansare=""/g), 'en').toHaveLength(1)
    expect(html.en).toMatch(/<div class="[^"]*spatiu[^"]*" data-faza="bucla" data-fara-lansare=""/)
    expect(html.ro, 'ro').not.toContain('data-fara-lansare')
    expect(en).not.toContain('data-pastila-centru')
    expect(en).not.toMatch(/class="[^"]*legenda/)
    // Controlul: pe RO aceleasi selectoare gasesc pastila si legenda (deci absenta de pe EN nu e oarba).
    const ro = scena(html.ro)
    expect(ro).toContain('data-pastila-centru')
    expect(ro).toMatch(/class="[^"]*legenda/)
  })
})

describe('foaia de stil a scenei', () => {
  const foaie = readFileSync(join(__dirname, '..', 'src', 'components', 'erou', 'Erou.module.css'), 'utf8')

  /** Clasele care pornesc o animatie (in afara blocului de miscare redusa) si cele oprite in el. */
  function analiza(css: string): { animate: string[]; oprite: string[] } {
    const start = css.indexOf('@media (prefers-reduced-motion: reduce)')
    if (start < 0) return { animate: [], oprite: [] }
    const bloc = css.slice(start)
    const restul = css.slice(0, start)
    const animate = new Set<string>()
    for (const m of restul.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
      if (!/(^|[\s;])animation\s*:\s*(?!none)/.test(m[2])) continue
      for (const sel of m[1].split(',')) {
        const clase = sel.match(/\.[A-Za-z][\w-]*/g)
        if (clase) animate.add(clase[clase.length - 1])
      }
    }
    const oprite = new Set<string>()
    for (const m of bloc.matchAll(/([^{}]+)\{([^{}]*animation\s*:\s*none[^{}]*)\}/g)) {
      for (const sel of m[1].split(',')) {
        const clase = sel.match(/\.[A-Za-z][\w-]*/g)
        if (clase) oprite.add(clase[clase.length - 1])
      }
    }
    return { animate: [...animate].sort(), oprite: [...oprite].sort() }
  }

  it('miscarea redusa opreste fiecare animatie a scenei (cometele, inelele de puls, respiratia)', () => {
    const { animate, oprite } = analiza(foaie)
    // Controlul: analiza chiar gaseste animatiile figurii.
    for (const c of ['.urma', '.capUrma', '.inelNod', '.inelCentru']) expect(animate, c).toContain(c)
    expect(animate.filter((c) => !oprite.includes(c))).toEqual([])
  })

  it('martor POZITIV: o foaie din care lipseste oprirea urmei e prinsa', () => {
    const mutata = foaie.replace(/(@media \(prefers-reduced-motion: reduce\)[\s\S]*?)\n\s*\.urma,/, '$1')
    expect(mutata).not.toBe(foaie)
    const { animate, oprite } = analiza(mutata)
    expect(animate.filter((c) => !oprite.includes(c))).toEqual(['.urma'])
  })

  /** Contrastul WCAG intre doua culori #rrggbb. */
  function contrast(a: string, b: string): number {
    const l = (hex: string) => {
      const [r, g, bl] = [1, 3, 5].map((i) => {
        const c = parseInt(hex.slice(i, i + 2), 16) / 255
        return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
      })
      return 0.2126 * r + 0.7152 * g + 0.0722 * bl
    }
    const [x, y] = [l(a), l(b)].sort((p, q) => q - p)
    return (x + 0.05) / (y + 0.05)
  }

  it('etichetele nodurilor si ale lobilor: cel putin 4,5:1 pe fundalul lor', () => {
    const globale = readFileSync(join(__dirname, '..', 'src', 'app', 'globals.css'), 'utf8')
    const token = (nume: string) => {
      const m = globale.match(new RegExp('--color-' + nume + ':\\s*(#[0-9a-fA-F]{6})'))
      if (!m) throw new Error('token lipsa: ' + nume)
      return m[1]
    }
    const regula = (clasa: string) => {
      const m = foaie.match(new RegExp('\\n\\.' + clasa + ' \\{([^}]*)\\}'))
      if (!m) throw new Error('regula lipsa: .' + clasa)
      const c = m[1].match(/(?:^|\n)\s*color:\s*var\(--color-([\w-]+)\)/)
      if (!c) throw new Error('fara culoare: .' + clasa)
      return token(c[1])
    }
    // Placuta etichetei de nod e rgba(250, 251, 252, 0.85); peste alb (cel mai deschis caz) e #fbfcfd, peste
    // cel mai inchis fundal al eroului (pista, #d7dce6) e mai inchisa - se ia cazul mai slab: amestecul.
    const placuta = '#f6f7f9'
    const nod = contrast(regula('eticheta'), placuta)
    const lob = contrast(regula('lob'), '#ffffff')
    expect(nod).toBeGreaterThanOrEqual(4.5)
    expect(lob).toBeGreaterThanOrEqual(4.5)
    // Martor: culoarea pistei pe alb nu trece, deci masuratoarea deosebeste.
    expect(contrast(token('drum-baza'), '#ffffff')).toBeLessThan(4.5)
  })
})
