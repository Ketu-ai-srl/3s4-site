import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import Acasa from '../src/app/page'
import sitemap from '../src/app/sitemap'
import { HARTA_ICONITE } from '../src/components/primitive/Iconita'
import { CHEI_SIGLE } from '../src/components/primitive/SiglaTert'
import { creeazaAleator } from '../src/components/scena3d/aleator'
import { distantaPixelLaPixel } from '../src/components/scena3d/Scena3D'
import {
  ANCORE_ACASA,
  CONSTRUCTOR,
  EROU,
  INDUSTRII,
  INTEGRARI,
  INTREBARI,
  TESTIMONIAL,
  toateLegaturileAcasa,
} from '../src/content/acasa'
import { ARTICOLE, CATEGORII_BLOG } from '../src/content/blog/registru'
import { CAI_EXISTENTE } from '../src/content/cai'
import { FOAIE_FUNCTIONALITATI, FOAIE_SOLUTII, SUBSOL } from '../src/content/navigatie'
import { RUTE } from '../src/content/rute'

/**
 * Probele paginii de start si ale fundatiei (felia `fundatie`, valul S4-1): pagina randata pe
 * server, cioturile la caile lor fixe, ancorele, legaturile din corp, manifestul de rute cu
 * marcajele tuturor feliilor, registrul blogului gol si harta de site derivata.
 */

const RADACINA = join(__dirname, '..')
const citeste = (cale: string) => readFileSync(join(RADACINA, cale), 'utf8')
const html = renderToStaticMarkup(createElement(Acasa))

/** Feliile planului (§5.3), in ordinea meniului si a subsolului. */
const FELII = [
  'fundatie',
  'text-acasa',
  'erou',
  'constructor',
  'functionalitati-acasa',
  'flux-efacturare',
  'cinema-1',
  'cinema-2',
  'solutii',
  'preturi',
  'blog',
  'produs',
  'enterprise-formular',
  'comparatii-termene',
  'promo',
  'conversie',
  'juridic',
]

describe('pagina de start randata pe server', () => {
  it('are un singur h1, cel al eroului', () => {
    expect(html.match(/<h1\b/g)).toHaveLength(1)
    expect(html).toContain(EROU.titlu.accent)
  })

  it('are ancorele pe care le cere navigatia', () => {
    for (const ancora of Object.values(ANCORE_ACASA)) {
      expect(html, '#' + ancora).toContain('id="' + ancora + '"')
    }
  })

  it('cele trei cioturi sunt la locul lor, in ordinea masurata', () => {
    const erou = html.indexOf('data-ciot="erou"')
    const constructor = html.indexOf('data-ciot="constructor"')
    const functionalitati = html.indexOf('data-ciot="functionalitati"')
    expect(erou).toBeGreaterThanOrEqual(0)
    expect(constructor).toBeGreaterThan(erou)
    expect(functionalitati).toBeGreaterThan(constructor)
    for (const cale of ['src/components/erou/Erou.tsx', 'src/components/constructor/Constructor.tsx', 'src/components/functionalitati-acasa/FunctionalitatiAcasa.tsx']) {
      expect(existsSync(join(RADACINA, cale)), cale).toBe(true)
    }
  })

  it('constructorul are cele 9 industrii ca butoane, iar poarta nu navigheaza', () => {
    const butoane = [...html.matchAll(/data-industrie="([a-z]+)"/g)].map((m) => m[1])
    expect(butoane).toEqual(CONSTRUCTOR.industrii.map((i) => i.cod))
  })

  it('sectiunile statice poarta textele contractului', () => {
    expect(html).toContain(INTEGRARI.fraza)
    for (const g of INTEGRARI.grupuri) for (const e of g.elemente) expect(html).toContain('>' + e.nume + '<')
    for (const c of INDUSTRII.carduri) expect(html).toContain(c.text)
    for (const q of INTREBARI.intrebari) expect(html).toContain(q.intrebare)
  })

  it('prima intrebare e deschisa, celelalte inchise', () => {
    const stari = [...html.matchAll(/aria-expanded="(true|false)"/g)].map((m) => m[1])
    expect(stari.slice(0, INTREBARI.intrebari.length)).toEqual(['true', 'false', 'false', 'false'])
  })

  it('testimonialul nu pare citat cat timp nu exista acord scris', () => {
    expect(TESTIMONIAL.esteCitat).toBe(false)
    expect(html).not.toContain('<blockquote')
    expect(html).toContain(TESTIMONIAL.fraza)
  })

  it('nicio legatura din corp nu duce la o ruta care lipseste', () => {
    const cai = (text: string) => [...text.matchAll(/<a\b[^>]*?\shref="(\/[^"#?]*)/g)].map((m) => m[1] || '/')
    // Controlul extragerii, pe un fragment cu raspuns stiut dinainte: pe start, la S4-1, corpul
    // nu are nicio legatura interna activa, deci un zero de mai jos trebuie sa fie un zero real.
    expect(cai('<p><a class="c" href="/preturi#pachete">x</a><link href="/f.svg"></p>')).toEqual(['/preturi'])
    for (const cale of cai(html)) {
      expect(CAI_EXISTENTE.has(cale), 'legatura moarta: ' + cale).toBe(true)
    }
  })

  it('tintele lipsa sunt randate inert, cu tinta asteptata in atribut, si numai ele', () => {
    const inerteDin = (text: string) => [...text.matchAll(/data-tinta-lipsa="([^"]+)"/g)].map((m) => m[1])
    // Controlul extragerii, pe un fragment cu raspuns stiut dinainte: un zero de mai jos e un zero real.
    expect(inerteDin('<span data-tinta-lipsa="/preturi#pachete">x</span><a href="/">y</a>')).toEqual(['/preturi#pachete'])
    const inerte = inerteDin(html)
    const legaturi = toateLegaturileAcasa().filter((l) => l.href && l.ruta)
    const asteptate = legaturi.filter((l) => l.ruta && !CAI_EXISTENTE.has(l.ruta))
    // Asteptarea se deriva din CAI_EXISTENTE (25.09). Pragul fix `> 10`, scris pe lumea S4-1, picase pe
    // felia solutii (10 tinte inerte, rularea 36187747307) si ar fi picat pe lotul S4-3 cu toate feliile (5).
    for (const l of asteptate) expect(inerte, l.href!).toContain(l.href)
    // Si invers: o tinta inerta e ori o ruta lipsa, ori o destinatie nedecisa (href null, vezi Tinta).
    const hrefLipsa = new Set([...asteptate.map((l) => l.href), 'nedecisa'])
    for (const t of inerte) expect(hrefLipsa.has(t), 'inerta desi ruta exista: ' + t).toBe(true)
    // Martorul ca lista de intrare nu e goala; numarul legaturilor startului nu scade cand vin rute noi.
    expect(legaturi.length).toBeGreaterThan(10)
  })

  it('iconitele si siglele numite de contracte exista toate', () => {
    const nume = [
      EROU.pastile.intrebare.iconita,
      EROU.pastile.legatura.iconita,
      ...EROU.popover.randuri.map((r) => r.iconita),
      ...EROU.bucla.noduri.map((n) => n.iconita),
      ...CONSTRUCTOR.industrii.map((i) => i.iconita),
      ...INDUSTRII.carduri.map((c) => c.iconita),
      ...(FOAIE_FUNCTIONALITATI.lider ? [FOAIE_FUNCTIONALITATI.lider.iconita] : []),
      ...FOAIE_FUNCTIONALITATI.elemente.map((e) => e.iconita),
      ...FOAIE_SOLUTII.elemente.map((e) => e.iconita),
      ...SUBSOL.insigne.map((i) => i.iconita),
    ]
    expect(nume.filter((n) => !(n in HARTA_ICONITE))).toEqual([])
    const sigle = [...INTEGRARI.grupuri.flatMap((g) => g.elemente.map((e) => e.sigla)), ...SUBSOL.retele.map((r) => r.retea)]
    expect(sigle.filter((s) => !CHEI_SIGLE.includes(s))).toEqual([])
    // Martorul: un nume inventat e prins de acelasi filtru.
    expect(['nume-inventat'].filter((n) => !(n in HARTA_ICONITE))).toEqual(['nume-inventat'])
  })
})

describe('manifestul de rute', () => {
  const sursa = citeste('src/content/rute.ts')

  it('are marcajul fiecarei felii o singura data, in ordinea planului', () => {
    const marcaje = [...sursa.matchAll(/^\s*\/\/ <<felie:([a-z0-9-]+)>>/gm)].map((m) => m[1])
    expect(marcaje).toEqual(FELII)
  })

  it('RUTE are numai rute cu pagina pe disc', () => {
    for (const r of RUTE) {
      const dir = r.cale === '/' ? '' : r.cale
      expect(existsSync(join(RADACINA, 'src', 'app', dir, 'page.tsx')), r.cale).toBe(true)
    }
  })

  it('martor NEGATIV: o cale inventata nu are pagina', () => {
    expect(existsSync(join(RADACINA, 'src', 'app', 'cale-inventata-' + Date.now(), 'page.tsx'))).toBe(false)
  })
})

describe('registrul blogului si harta de site', () => {
  it('registrul e gol la S4-1, iar categoriile sunt cele din plan', () => {
    expect(ARTICOLE).toEqual([])
    expect([...CATEGORII_BLOG]).toEqual(['contabilitate', 'it', 'juridic', 'management'])
  })

  it('harta de site e derivata din RUTE, fara dubluri', () => {
    const adrese = sitemap().map((i) => new URL(i.url).pathname)
    expect(adrese).toEqual(RUTE.filter((r) => r.inHarta).map((r) => r.cale))
  })
})

describe('Scena3D', () => {
  it('generatorul cu samanta da acelasi sir la aceeasi samanta', () => {
    const a = creeazaAleator(42)
    const b = creeazaAleator(42)
    const sirA = Array.from({ length: 5 }, a)
    expect(Array.from({ length: 5 }, b)).toEqual(sirA)
    for (const x of sirA) {
      expect(x).toBeGreaterThanOrEqual(0)
      expect(x).toBeLessThan(1)
    }
  })

  it('martor POZITIV: alta samanta da alt sir', () => {
    const a = Array.from({ length: 5 }, creeazaAleator(42))
    const b = Array.from({ length: 5 }, creeazaAleator(43))
    expect(b).not.toEqual(a)
  })

  it('camera implicita pune 1 unitate = 1 pixel pe planul z = 0', () => {
    const d = distantaPixelLaPixel(900, 45)
    // Inaltimea vazuta la distanta d, cu unghiul vertical de 45 de grade, e exact 900.
    expect(2 * d * Math.tan((45 * Math.PI) / 360)).toBeCloseTo(900, 6)
  })

  it('three nu intra in pachetul paginii: se incarca lenes', () => {
    const scena = citeste('src/components/scena3d/Scena3D.tsx')
    expect(scena).toContain('await import("three")')
    expect(scena).not.toMatch(/^import \* as THREE from "three"/m)
    expect(scena).toMatch(/^import type \* as TreiTipuri from "three"/m)
  })
})
