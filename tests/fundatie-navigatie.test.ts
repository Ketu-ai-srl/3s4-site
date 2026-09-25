import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import Antet, { foaieFiltrata } from '../src/components/global/Antet'
import { cereAntetulPlecat, antetulEstePlecat } from '../src/components/global/antet-stare'
import { detecteazaPlatforma, grupuriVizibile } from '../src/components/global/descarcare'
import { continutPaleta, normalizeaza } from '../src/components/global/paleta'
import Subsol, { randDrepturi } from '../src/components/global/Subsol'
import Tinta, { type TintaProps } from '../src/components/primitive/Tinta'
import { ARTICOLE, type ArticolBlog } from '../src/content/blog/registru'
import { CAI_EXISTENTE } from '../src/content/cai'
import { BRAND } from '../src/content/entitate'
import {
  ANTET,
  FOAIE_FUNCTIONALITATI,
  FOAIE_SOLUTII,
  PALETA,
  SUBSOL,
  ascunse,
  multimeaCailor,
  seVede,
  toateLegaturileNavigatiei,
  vizibile,
} from '../src/content/navigatie'
import { RUTE } from '../src/content/rute'

/**
 * Probele navigatiei filtrate (plan §5.1 regula 5): antetul, foile, panoul Descarca, paleta si
 * subsolul arata NUMAI legaturi spre rute care exista. In valurile intermediare cele mai multe
 * tinte lipsesc, deci o legatura nefiltrata ar fi moarta pe fiecare pagina deodata.
 *
 * Martorul pozitiv al fiecarui filtru e multimea "toate caile": cu ea nimic nu are voie sa fie
 * ascuns. Fara el, un filtru care ascunde tot ar trece probele de "nu arata legaturi moarte".
 */

/** Toate caile de care depinde navigatia: starea de la livrarea valului (S4-5). */
const TOATE = multimeaCailor(
  toateLegaturileNavigatiei()
    .map((l) => l.ruta)
    .filter((r): r is string => r !== null)
    .map((cale) => ({ cale })),
)

/**
 * Caile interne din legaturile (`<a href>`) unui HTML randat, fara ancora si fara parametri.
 * Numai ancorele: `<link rel="preload" href>` pus de imaginile prioritare nu e o legatura.
 */
function caiDinHtml(html: string): string[] {
  return [...html.matchAll(/<a\b[^>]*?\shref="(\/[^"#?]*)/g)].map((m) => m[1] || '/')
}

/** Titlurile coloanelor de subsol care au macar o legatura vizibila, in ordinea contractului. */
function coloaneVizibile(subsol: typeof SUBSOL, cai: ReadonlySet<string>): string[] {
  return subsol.coloane.filter((c) => vizibile(c.legaturi, cai).length > 0).map((c) => c.titlu)
}

describe('multimea cailor existente', () => {
  it('la S4-1 contine exact rutele din RUTE si articolele registrului', () => {
    expect([...CAI_EXISTENTE].sort()).toEqual([...RUTE.map((r) => r.cale), ...ARTICOLE.map((a) => '/blog/' + a.slug)].sort())
    expect(CAI_EXISTENTE.has('/')).toBe(true)
  })
})

describe('antetul', () => {
  it('arata numai legaturile cu ruta existenta, in ordinea contractului', () => {
    const cai = multimeaCailor([{ cale: '/' }])
    expect(vizibile(ANTET.legaturi, cai).map((l) => l.text)).toEqual(['Acasă', 'Funcționalități'])
  })

  it('o foaie fara niciun element vizibil dispare, iar declansatorul ramane legatura simpla', () => {
    const cai = multimeaCailor([{ cale: '/' }])
    expect(foaieFiltrata(FOAIE_FUNCTIONALITATI, cai)).toBeNull()
    expect(foaieFiltrata(FOAIE_SOLUTII, cai)).toBeNull()
  })

  it('martor POZITIV: cu toate caile, foile raman intregi', () => {
    const f = foaieFiltrata(FOAIE_FUNCTIONALITATI, TOATE)!
    expect(f.lider?.text).toBe(FOAIE_FUNCTIONALITATI.lider?.text)
    expect(f.elemente).toHaveLength(FOAIE_FUNCTIONALITATI.elemente.length)
    expect(foaieFiltrata(FOAIE_SOLUTII, TOATE)!.elemente).toHaveLength(7)
  })

  it('o foaie partiala pastreaza doar elementele existente si ascunde subsolul fara tinta', () => {
    const cai = multimeaCailor([{ cale: '/' }, { cale: '/functionalitati/cautare-ai' }])
    const f = foaieFiltrata(FOAIE_FUNCTIONALITATI, cai)!
    expect(f.lider).toBeNull()
    expect(f.elemente.map((e) => e.href)).toEqual(['/functionalitati/cautare-ai'])
    expect(f.subsol.href).toBeNull()
  })

  it('HTML-ul servit al antetului are legaturile, fara legaturi moarte', () => {
    const html = renderToStaticMarkup(createElement(Antet))
    // Controlul extragerii: sigla si "Acasă" duc la "/", deci lista nu are voie sa iasa goala.
    expect(caiDinHtml(html)).toContain('/')
    expect(caiDinHtml('<a class="x" href="/preturi#pachete">x</a><link href="/f.svg">')).toEqual(['/preturi'])
    expect(html).toContain('>Acasă<')
    expect(html).toContain('>Funcționalități<')
    // Celelalte legaturi se arata EXACT cand ruta lor exista. Asteptarea se deriva din date, nu se
    // scrie pe starea unui val: la S4-1 era „fara Soluții si Prețuri", iar constanta aceea a picat
    // pe fiecare felie S4-3 care adauga corect o ruta (25.09). Filtrul insusi e aparat concret de
    // probele pe multimi sintetice de mai sus; aici se verifica doar ca antetul il aplica.
    for (const l of ANTET.legaturi) {
      if (seVede(l, CAI_EXISTENTE)) expect(html, 'lipseste din antet: ' + l.text).toContain('>' + l.text + '<')
      else expect(html, 'legatura fara ruta in antet: ' + l.text).not.toContain('>' + l.text + '<')
    }
    for (const cale of caiDinHtml(html)) {
      expect(CAI_EXISTENTE.has(cale), 'legatura moarta in antet: ' + cale).toBe(true)
    }
    // Structura e servita fara JavaScript: meniul principal e o lista in HTML.
    expect(html).toMatch(/<nav aria-label="Meniul principal"><ul/)
    expect(html).toContain('data-antet="plat"')
  })

  it('panoul Descarca e gol cat timp nu exista formularul de inregistrare', () => {
    expect(grupuriVizibile(multimeaCailor([{ cale: '/' }]))).toEqual([])
    expect(grupuriVizibile(TOATE).map((g) => g.titlu)).toEqual(['Windows', 'macOS', 'Linux', 'Mobil', 'Web'])
  })

  it('detecteaza platforma dupa agent, fara sa ghiceasca', () => {
    expect(detecteazaPlatforma('Mozilla/5.0 (Windows NT 10.0; Win64; x64)')).toBe('windows')
    expect(detecteazaPlatforma('Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)')).toBe('ios')
    expect(detecteazaPlatforma('Mozilla/5.0 (Linux; Android 15)')).toBe('android')
    expect(detecteazaPlatforma('agent necunoscut')).toBeNull()
  })

  it('starea plecat se cere pe surse: revine abia cand ultima sursa renunta', () => {
    expect(antetulEstePlecat()).toBe(false)
    cereAntetulPlecat('a', true)
    cereAntetulPlecat('b', true)
    cereAntetulPlecat('a', false)
    expect(antetulEstePlecat()).toBe(true)
    cereAntetulPlecat('b', false)
    expect(antetulEstePlecat()).toBe(false)
  })
})

describe('paleta de cautare', () => {
  const doarStart = multimeaCailor([{ cale: '/' }])

  it('fara interogare arata grupurile contractului, filtrate', () => {
    const grupuri = continutPaleta('', doarStart, RUTE, [])
    expect(grupuri.map((g) => g.titlu)).toEqual(['Pagini'])
    expect(grupuri[0].elemente).toEqual([{ titlu: 'Acasă', cale: '/' }])
  })

  it('potrivirea ignora diacriticele si majusculele', () => {
    expect(normalizeaza('Căutare ÎN Arhivă')).toBe('cautare in arhiva')
    expect(continutPaleta('ACASA', doarStart, RUTE, [])[0].elemente[0].cale).toBe('/')
    expect(continutPaleta('whatsapp', doarStart, RUTE, [])[0].elemente[0].cale).toBe('/')
  })

  it('martor NEGATIV: o interogare fara potrivire da zero grupuri', () => {
    expect(continutPaleta('zzzqqq', doarStart, RUTE, [])).toEqual([])
  })

  it('martor POZITIV: cu toate caile si un articol, apar Actiunile si grupul de articole', () => {
    const articol: ArticolBlog = { slug: 'proba', titlu: 'Arhiva unui birou', extras: 'Un extras.', categorie: 'it', data: '2026-09-24' }
    const cai = new Set([...TOATE, '/blog/proba'])
    const fara = continutPaleta('', cai, RUTE, [articol])
    expect(fara.map((g) => g.titlu)).toEqual(['Pagini', 'Acțiuni'])
    expect(fara[0].elemente).toHaveLength(PALETA.grupuri[0].elemente.length)
    const cu = continutPaleta('arhiva unui', cai, RUTE, [articol])
    expect(cu.map((g) => g.titlu)).toEqual([PALETA.grupArticole])
    expect(cu[0].elemente).toEqual([{ titlu: 'Arhiva unui birou', cale: '/blog/proba' }])
  })

  it('un articol din registru fara cale existenta nu apare', () => {
    const articol: ArticolBlog = { slug: 'inexistent', titlu: 'Arhiva unui birou', extras: '', categorie: 'it', data: '2026-09-24' }
    expect(continutPaleta('arhiva unui', doarStart, RUTE, [articol])).toEqual([])
  })
})

describe('subsolul', () => {
  it('coloanele fara nicio legatura vizibila nu se randeaza', () => {
    const html = renderToStaticMarkup(createElement(Subsol))
    expect(caiDinHtml(html)).toContain('/')
    const titluri = [...html.matchAll(/<h2[^>]*>([^<]+)<\/h2>/g)].map((m) => m[1])
    // "Companie" sta vizibila numai prin "Ajutor prin e-mail", deci coloanele asteptate vin din
    // configurarea marcii: fara adresa confirmata, coloana dispare; cu adresa, revine.
    // Ambele forme, pe copii injectate ale configurarii, sunt in tests/fundatie-brand.test.ts.
    // Coloanele asteptate se deriva din date (25.09): o coloana se randeaza cand are macar o
    // legatura vizibila. Constanta de la S4-1 (['Resurse']) picase pe orice felie cu rute noi.
    expect(titluri).toEqual(coloaneVizibile(SUBSOL, CAI_EXISTENTE))
    for (const cale of caiDinHtml(html)) {
      expect(CAI_EXISTENTE.has(cale), 'legatura moarta in subsol: ' + cale).toBe(true)
    }
  })

  it('insignele sunt cele 5 fapte din contract', () => {
    const html = renderToStaticMarkup(createElement(Subsol))
    for (const i of SUBSOL.insigne) expect(html).toContain(i.text)
  })

  it('drepturile sunt in numele marcii, fara nicio data de firma (plan §7)', () => {
    const rand = randDrepturi(2026)
    expect(rand).toBe('© 2026 ' + SUBSOL.copyright.detinator + ' · ' + SUBSOL.copyright.mentiune)
    expect(rand).not.toMatch(/de completat/i)
  })

  it('retelele fara adresa nu apar; posta apare numai cu adresa confirmata a marcii', () => {
    const html = renderToStaticMarkup(createElement(Subsol))
    // Controlul: subsolul chiar s-a randat, deci o absenta de mai jos nu vine dintr-un HTML gol.
    expect(html).toContain(SUBSOL.brand.slogan)
    expect(html).not.toContain('3S pe LinkedIn')
    // Posta urmeaza configurarea marcii: fara adresa, nicio legatura de posta; cu o adresa
    // confirmata, iconita si legaturile duc numai la ea (ambele forme, pe copii injectate, in
    // tests/fundatie-brand.test.ts).
    const posta = [...html.matchAll(/href="(mailto:[^"]*)"/g)].map((m) => m[1])
    if (BRAND.email === '') {
      expect(html).not.toContain('aria-label="Scrieți-ne pe e-mail"')
      expect(posta).toEqual([])
    } else {
      expect(html).toContain('aria-label="Scrieți-ne pe e-mail"')
      expect(posta.length).toBeGreaterThan(0)
      expect(posta.filter((p) => p !== 'mailto:' + BRAND.email)).toEqual([])
    }
  })
})

describe('legaturile din corpul paginilor (Tinta)', () => {
  const doarStart = multimeaCailor([{ cale: '/' }])
  const tinta = (props: Omit<TintaProps, 'children'>, copil: string) => createElement(Tinta, props as TintaProps, copil)

  it('o tinta lipsa devine element inert cu acelasi continut', () => {
    const html = renderToStaticMarkup(
      tinta({ legatura: { text: 'x', href: '/preturi', ruta: '/preturi' }, cai: doarStart, className: 'c' }, 'Prețuri'),
    )
    expect(html).toBe('<span class="c" data-tinta-lipsa="/preturi">Prețuri</span>')
  })

  it('martor POZITIV: tinta existenta devine legatura', () => {
    const html = renderToStaticMarkup(
      tinta({ legatura: { text: 'x', href: '/#intrebari', ruta: '/' }, cai: doarStart }, 'Întrebări'),
    )
    expect(html).toBe('<a href="/#intrebari">Întrebări</a>')
  })

  it('posta electronica e mereu legatura', () => {
    const html = renderToStaticMarkup(
      tinta({ legatura: { text: 'x', href: 'mailto:a@b.ro', ruta: null }, cai: doarStart }, 'a@b.ro'),
    )
    expect(html).toBe('<a href="mailto:a@b.ro">a@b.ro</a>')
  })
})

describe('completitudinea, pentru livrare (S4-5)', () => {
  it('la S4-1 multe legaturi sunt inca ascunse, si lista lor se poate citi', () => {
    const lipsa = ascunse(toateLegaturileNavigatiei(), CAI_EXISTENTE)
    expect(lipsa.length).toBeGreaterThan(30)
    // Martorul: cu toate caile, raman ascunse doar legaturile fara destinatie decisa.
    expect(ascunse(toateLegaturileNavigatiei(), TOATE).every((l) => l.href === null)).toBe(true)
  })
})
