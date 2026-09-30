import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { X_DEFAULT, adresaAlternata, type Alternata } from '../src/components/seo/alternate-cale'
import { alternateSite } from '../src/lib/site'

// Piesa de browser citeste calea si segmentele arborelui din Next; proba le da din afara, ca sa poata randa
// piesa pe orice cale, inclusiv pe pagina de negasit (calea ceruta in browser, segmentul `/_not-found`).
const pagina = vi.hoisted(() => ({ cale: '/' as string | null, segmente: [] as string[] }))
vi.mock('next/navigation', () => ({ usePathname: () => pagina.cale, useSelectedLayoutSegments: () => pagina.segmente }))

// Importurile dinamice ale componentelor transforma fisierele la prima folosire: plafonul e al fisierului, nu al unui caz.
vi.setConfig({ testTimeout: 60_000 })

/**
 * Felia multi-domeniu, punctul 2: ALTERNATELE HREFLANG configurabile (`SITE_ALTERNATE`). Proba de browser
 * (`tests/browser/multi-domeniu.spec.ts`) le masoara in `<head>`-ul unui build real, pe trei rute, si la
 * navigarea din browser; aici se masoara regulile listei si compunerea adreselor, pe module.
 *
 * REGULILE lui Google (documentatia oficiala, citita pe 2026-09-30, linkul e in `src/lib/site.ts`):
 * fiecare varianta se listeaza pe ea insasi si pe celelalte, variantele se refera una la alta, adresele
 * sunt complete, codurile sunt limba cu regiune optionala. Ce nu se poate masura de aici: ca Google le
 * si accepta; asta se vede in Search Console, dupa lansare.
 */

// Domeniile din cerinta: Romania, site-ul international (engleza) si versiunea romaneasca a lui, sub /ro.
const RO = 'https://3s.com.ro'
const INT = 'https://3s.md'
const LISTA = ['ro-RO=' + RO, 'en=' + INT, 'ro-MD=' + INT + '/ro'].join(',')
const LISTA_CU_IMPLICIT = LISTA + ',x-default=' + INT

/** Rutele pe care se masoara: radacina (cazul special), o pagina statica, o categorie de blog cu trei segmente. */
const RUTE_PROBA = ['/', '/preturi', '/blog/categorie/it']

function mesaj(f: () => unknown): string {
  try {
    f()
  } catch (e) {
    return e instanceof Error ? e.message : String(e)
  }
  return '(nu a aruncat)'
}

afterEach(() => {
  vi.unstubAllEnvs()
  pagina.cale = '/'
  pagina.segmente = []
})

describe('SITE_ALTERNATE: forma listei', () => {
  it('martor NEGATIV: fara variabila nu se emite nimic (nesetata, goala, cu spatii)', () => {
    for (const valoare of [undefined, '', '   ', '\n']) {
      expect(alternateSite(valoare, INT), JSON.stringify(valoare)).toEqual([])
    }
  })

  it('perechile din cerinta, cu prefix de cale pe ro-MD si x-default spre prima varianta cand nu e dat', () => {
    expect(alternateSite(LISTA, INT)).toEqual<Alternata[]>([
      { hreflang: 'ro-RO', adresa: RO },
      { hreflang: 'en', adresa: INT },
      { hreflang: 'ro-MD', adresa: INT + '/ro' },
      { hreflang: X_DEFAULT, adresa: RO },
    ])
  })

  it('x-default dat explicit are prioritate, iar cel implicit urmeaza ordinea listei', () => {
    const explicit = alternateSite(LISTA_CU_IMPLICIT, INT)
    expect(explicit.at(-1)).toEqual({ hreflang: X_DEFAULT, adresa: INT })
    // x-default sta ultimul indiferent de locul in care e scris
    const inFata = alternateSite('x-default=' + INT + ',' + LISTA, INT)
    expect(inFata).toEqual(explicit)
    // Prima varianta se schimba odata cu ordinea listei
    expect(alternateSite('en=' + INT + ',ro-RO=' + RO, INT).at(-1)?.adresa).toBe(INT)
  })

  it('codurile se normalizeaza (ro-md -> ro-MD), spatiile si liniile noi din jurul intrarilor nu conteaza', () => {
    const lista = alternateSite('  RO-ro = ' + RO + ' ,\n en=' + INT + ',\nro-md=' + INT + '/ro ,, X-Default=' + INT, INT)
    expect(lista.map((a) => a.hreflang)).toEqual(['ro-RO', 'en', 'ro-MD', 'x-default'])
  })

  it('prefixul se lipeste fara "//": bara finala din valoare se scoate, iar calea incepe cu una singura', () => {
    for (const cu of [INT + '/ro', INT + '/ro/', INT + '/ro//']) {
      const md = alternateSite('en=' + INT + ',ro-MD=' + cu, INT).find((a) => a.hreflang === 'ro-MD')
      expect(md?.adresa, cu).toBe(INT + '/ro')
    }
    // Baza fara prefix: si "https://gazda" si "https://gazda/" dau aceeasi adresa
    expect(alternateSite('en=' + INT + '/', INT)[0].adresa).toBe(INT)
    // Prefix pe mai multe segmente
    expect(alternateSite('en=' + INT + ',ro-MD=' + INT + '/ro/md', INT)[1].adresa).toBe(INT + '/ro/md')
    // Compunerea: radacina fara bara finala (ca `canonical`), restul caii intreg
    expect(adresaAlternata(INT + '/ro', '/')).toBe(INT + '/ro')
    expect(adresaAlternata(INT + '/ro', '/preturi')).toBe(INT + '/ro/preturi')
    expect(adresaAlternata(INT, '/')).toBe(INT)
    expect(adresaAlternata(INT, '/blog/categorie/it')).toBe(INT + '/blog/categorie/it')
    for (const cale of RUTE_PROBA) {
      for (const a of alternateSite(LISTA_CU_IMPLICIT, INT)) {
        expect(adresaAlternata(a.adresa, cale).replace(/^https:\/\//, ''), a.hreflang + ' ' + cale).not.toContain('//')
      }
    }
  })

  it('martor POZITIV: o lista gresita opreste construirea, cu variabila si motivul in mesaj', () => {
    const rele: [string, string, RegExp][] = [
      ['fara =', 'en', /nu are forma cod=adresa/],
      ['cod de limba prea lung', 'romana=' + INT, /nu e o limba cu regiune optionala/],
      ['cod cu o singura litera', 'r=' + INT, /nu e o limba/],
      ['regiune fara limba', '-MD=' + INT, /nu e o limba/],
      ['regiune prea lunga', 'ro-MDA=' + INT, /nu e o limba/],
      ['trei parti', 'ro-MD-x=' + INT, /nu e o limba/],
      ['liniuta de subliniere', 'ro_MD=' + INT, /nu e o limba/],
      ['cod dublu', 'en=' + INT + ',en=' + RO, /apare de doua ori/],
      ['cod dublu, scris altfel', 'ro-MD=' + INT + ',ro-md=' + RO + ',en=' + INT, /apare de doua ori/],
      ['http', 'en=http://3s.md', /https/],
      ['adresa fara schema', 'en=3s.md', /nu e o adresa web/],
      ['parametri', 'en=' + INT + '/?a=1', /fara parametri/],
      ['ancora', 'en=' + INT + '/#x', /fara parametri/],
      ['credentiale', 'en=https://u:p@3s.md', /fara parametri/],
      ['segment gol in prefix', 'en=' + INT + ',ro-MD=' + INT + '//ro', /prefix de cale/],
      ['caractere speciale in prefix', 'en=' + INT + ',ro-MD=' + INT + '/r o', /prefix de cale/],
      ['numai x-default', 'x-default=' + INT, /nicio varianta de limba/],
      ['domeniul curent lipseste', 'ro-RO=' + RO, /nu contine adresa acestui site/],
      ['domeniul curent doar cu prefix', 'ro-RO=' + RO + ',ro-MD=' + INT + '/ro', /fara prefix de cale/],
      ['x-default spre un domeniu din afara listei', LISTA + ',x-default=https://3s-selector.test', /x-default trebuie sa fie una dintre variantele/],
    ]
    for (const [caz, valoare, tipar] of rele) {
      const m = mesaj(() => alternateSite(valoare, INT))
      expect(m, caz + ': ' + valoare).toMatch(/^SITE_ALTERNATE/)
      expect(m, caz).toMatch(tipar)
    }
    // Martor NEGATIV: lista din cerinta trece
    expect(mesaj(() => alternateSite(LISTA_CU_IMPLICIT, INT))).toBe('(nu a aruncat)')
  })

  it('SITE_ALTERNATE se citeste din mediu, iar domeniul curent din SITE_URL', () => {
    vi.stubEnv('SITE_ALTERNATE', LISTA)
    vi.stubEnv('SITE_URL', INT)
    expect(alternateSite().map((a) => a.hreflang)).toEqual(['ro-RO', 'en', 'ro-MD', 'x-default'])
    vi.stubEnv('SITE_URL', RO)
    expect(alternateSite()).toHaveLength(4)
    // Un domeniu care nu e in lista opreste construirea, oricat de bine ar fi scrisa lista
    vi.stubEnv('SITE_URL', 'https://3s-altul.test')
    expect(mesaj(() => alternateSite())).toMatch(/nu contine adresa acestui site/)
  })
})

describe('SITE_ALTERNATE: reciprocitate si auto-referinta pe trei rute', () => {
  const DOMENII = [RO, INT]

  /** Multimea `hreflang -> adresa` a unei pagini, asa cum o emite domeniul `baza`. */
  function emise(baza: string, cale: string): Record<string, string> {
    return Object.fromEntries(alternateSite(LISTA_CU_IMPLICIT, baza).map((a) => [a.hreflang, adresaAlternata(a.adresa, cale)]))
  }

  it('martor POZITIV: fiecare pagina se refera la ea insasi si la aceeasi cale pe celelalte domenii, iar listele coincid', () => {
    for (const cale of RUTE_PROBA) {
      const multimi = DOMENII.map((d) => ({ domeniu: d, emise: emise(d, cale) }))
      for (const { domeniu, emise: e } of multimi) {
        const adrese = Object.values(e)
        // auto-referinta: adresa paginii insesi, pe domeniul ei, e printre cele emise
        expect(adrese, domeniu + ' ' + cale + ' se refera la ea insasi').toContain(adresaAlternata(domeniu, cale))
        // fiecare varianta din lista e prezenta, cu calea cerut de pagina
        expect(Object.keys(e).sort()).toEqual(['en', 'ro-MD', 'ro-RO', 'x-default'])
        expect(e['ro-RO']).toBe(adresaAlternata(RO, cale))
        expect(e.en).toBe(adresaAlternata(INT, cale))
        expect(e['ro-MD']).toBe(adresaAlternata(INT + '/ro', cale))
      }
      // reciprocitate: A o listeaza pe B si B pe A; cum lista e aceeasi, multimile sunt egale
      const [a, b] = multimi
      expect(Object.values(a.emise), 'A o listeaza pe B').toContain(adresaAlternata(b.domeniu, cale))
      expect(Object.values(b.emise), 'B o listeaza pe A').toContain(adresaAlternata(a.domeniu, cale))
      expect(a.emise).toEqual(b.emise)
    }
  })

  it('martor POZITIV: cu ro-MD sub /ro, versiunea romaneasca a site-ului international e aceeasi cale, sub prefix', () => {
    expect(emise(INT, '/preturi')['ro-MD']).toBe('https://3s.md/ro/preturi')
    expect(emise(INT, '/')['ro-MD']).toBe('https://3s.md/ro')
    expect(emise(INT, '/blog/categorie/it')['ro-MD']).toBe('https://3s.md/ro/blog/categorie/it')
  })

  it('martor NEGATIV: un domeniu care lipseste din lista nu primeste alternate si nu poate fi confirmat de celelalte', () => {
    // Fara domeniul curent in lista, construirea se opreste (mesajul e verificat mai sus): nicio pagina nu iese fara auto-referinta
    expect(mesaj(() => alternateSite(LISTA_CU_IMPLICIT, 'https://3s-altul.test'))).toMatch(/nu contine adresa acestui site/)
  })
})

describe('AlternateHreflang si piesa de browser', () => {
  /** Legaturile `<link rel="alternate">` din HTML-ul randat, ca perechi hreflang -> href. */
  function legaturi(html: string): Record<string, string> {
    const iesire: Record<string, string> = {}
    for (const m of html.matchAll(/<link rel="alternate" hrefLang="([^"]+)" href="([^"]+)"\/>/g)) iesire[m[1]] = m[2]
    return iesire
  }

  it('martor NEGATIV: fara SITE_ALTERNATE, componenta serverului nu randeaza nimic', async () => {
    vi.stubEnv('SITE_ALTERNATE', '')
    const { default: AlternateHreflang } = await import('../src/components/seo/AlternateHreflang')
    expect(AlternateHreflang()).toBeNull()
  })

  it('martor POZITIV: cu SITE_ALTERNATE, componenta serverului da variantele piesei de browser, care le randeaza pe calea curenta', async () => {
    vi.stubEnv('SITE_ALTERNATE', LISTA_CU_IMPLICIT)
    vi.stubEnv('SITE_URL', INT)
    const { default: AlternateHreflang } = await import('../src/components/seo/AlternateHreflang')
    const { default: Client } = await import('../src/components/seo/AlternateHreflangClient')
    const element = AlternateHreflang()
    expect(element).not.toBeNull()
    expect(element?.type).toBe(Client)
    const alternate = (element?.props as { alternate: Alternata[] }).alternate
    expect(alternate.map((a) => a.hreflang)).toEqual(['ro-RO', 'en', 'ro-MD', 'x-default'])
    for (const cale of RUTE_PROBA) {
      pagina.cale = cale
      const html = renderToStaticMarkup(createElement(Client, { alternate }))
      const iesire = legaturi(html)
      expect(Object.keys(iesire), cale).toEqual(['ro-RO', 'en', 'ro-MD', 'x-default'])
      for (const a of alternate) expect(iesire[a.hreflang], cale + ' ' + a.hreflang).toBe(adresaAlternata(a.adresa, cale))
      // exact patru elemente, fara altceva in jur
      expect(html.match(/<link /g)).toHaveLength(4)
    }
  })

  it('martor NEGATIV: paginile interne Next (/_not-found) si lipsa unei cai nu primesc alternate', async () => {
    const { default: Client } = await import('../src/components/seo/AlternateHreflangClient')
    const alternate = alternateSite(LISTA_CU_IMPLICIT, INT)
    for (const cale of ['/_not-found', '/_error', null]) {
      pagina.cale = cale
      expect(renderToStaticMarkup(createElement(Client, { alternate })), String(cale)).toBe('')
    }
    // Controlul: aceeasi randare, pe o cale obisnuita, produce elementele
    pagina.cale = '/preturi'
    pagina.segmente = ['preturi']
    expect(renderToStaticMarkup(createElement(Client, { alternate }))).toContain('hrefLang="en"')
  })

  it('martor NEGATIV: in browser, pe pagina de negasit, calea e cea ceruta de om, dar segmentul arborelui ramane /_not-found: fara alternate', async () => {
    const { default: Client } = await import('../src/components/seo/AlternateHreflangClient')
    const alternate = alternateSite(LISTA_CU_IMPLICIT, INT)
    pagina.cale = '/o-cale-care-nu-exista'
    pagina.segmente = ['/_not-found']
    expect(renderToStaticMarkup(createElement(Client, { alternate }))).toBe('')
    // Martor POZITIV al aceleiasi cai: cand segmentul e al unei pagini care exista, aceeasi cale primeste alternate
    pagina.segmente = ['o-cale-care-exista']
    expect(renderToStaticMarkup(createElement(Client, { alternate })).match(/<link /g)).toHaveLength(4)
  })

  it('piesa de browser nu importa manifestul de rute: doar modulul fara importuri si Next', async () => {
    const { readFileSync } = await import('node:fs')
    const { join } = await import('node:path')
    const sursa = readFileSync(join(__dirname, '..', 'src', 'components', 'seo', 'AlternateHreflangClient.tsx'), 'utf8')
    const importuri = [...sursa.matchAll(/^import .* from "([^"]+)";$/gm)].map((m) => m[1])
    expect(importuri.sort()).toEqual(['./alternate-cale', 'next/navigation'])
    // Controlul: modulul serverului chiar importa `@/lib/site` (cautarea de mai sus nu e oarba)
    const server = readFileSync(join(__dirname, '..', 'src', 'components', 'seo', 'AlternateHreflang.tsx'), 'utf8')
    expect(server).toContain('@/lib/site')
    const comun = readFileSync(join(__dirname, '..', 'src', 'components', 'seo', 'alternate-cale.ts'), 'utf8')
    expect(comun).not.toMatch(/^import /m)
  })
})
