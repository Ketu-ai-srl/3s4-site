import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { adresaPagina, alternatePagina, metadataPagina, type ContextAlternate } from '../src/components/seo/metadata'
import type { CaiPeEditie } from '../src/content/echivalente'
import { ASEZARI, VARIANTE_SERVITE, type RutaAsezabila } from '../src/lib/asezare'
import { problemeAlternateAsezare } from '../src/lib/editii'
import { X_DEFAULT, alternateSite, type Alternata } from '../src/lib/site'

/**
 * ALTERNATELE HREFLANG. Doua straturi:
 *   1. lista bazelor, `SITE_ALTERNATE` (felia multi-domeniu): forma, normalizarea, validarea - neschimbate;
 *   2. legaturile fiecarei pagini (felia metadata-hreflang): scrise pe server de `metadataPagina`, din editia
 *      paginii si din tabelul de echivalente (`src/content/echivalente.ts`). Regula veche, "aceeasi cale pe
 *      fiecare varianta", si piesa de browser care o aplica s-au retras: `/preturi` si `/pricing` sunt aceeasi
 *      pagina, cu cai diferite.
 * Proba de browser (`tests/browser/multi-domeniu.spec.ts`) le masoara in `<head>`-ul servit al unui build real;
 * aici se masoara regulile, pe module, cu tabele de echivalente FABRICATE (tabelul real e gol pana la primele
 * perechi juridice).
 *
 * REGULILE lui Google (documentatia oficiala, citita pe 2026-09-30, linkul e in `src/lib/site.ts`): fiecare
 * varianta se listeaza pe ea insasi si pe celelalte, variantele se refera una la alta, adresele sunt complete,
 * codurile sunt limba cu regiune optionala. Ce nu se poate masura de aici: ca Google le si accepta; asta se vede
 * in Search Console, dupa lansare.
 */

// Domeniile din cerinta: Romania, site-ul international (engleza) si versiunea romaneasca a lui, sub /ro.
const RO = 'https://3s.com.ro'
const INT = 'https://3s.md'
const LISTA = ['ro-RO=' + RO, 'en=' + INT, 'ro-MD=' + INT + '/ro'].join(',')
const LISTA_CU_IMPLICIT = LISTA + ',x-default=' + INT

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

  it('prefixul ramane fara bara finala, oricum ar fi scris; baza fara prefix iese originea goala', () => {
    for (const cu of [INT + '/ro', INT + '/ro/', INT + '/ro//']) {
      const md = alternateSite('en=' + INT + ',ro-MD=' + cu, INT).find((a) => a.hreflang === 'ro-MD')
      expect(md?.adresa, cu).toBe(INT + '/ro')
    }
    expect(alternateSite('en=' + INT + '/', INT)[0].adresa).toBe(INT)
    expect(alternateSite('en=' + INT + ',ro-MD=' + INT + '/ro/md', INT)[1].adresa).toBe(INT + '/ro/md')
    // Adresa unei pagini: radacina fara bara finala (ca `canonical`), restul caii intreg, niciodata `//`
    expect(adresaPagina(INT, '/')).toBe(INT)
    expect(adresaPagina(INT, '/pricing')).toBe(INT + '/pricing')
    expect(adresaPagina(INT, '/ro/juridic/confidentialitate')).toBe(INT + '/ro/juridic/confidentialitate')
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

  it('domeniul lipsa din lista: pe asezarea ro mesajul numeste codul ro-RO, pe md ramane forma generala cod=', () => {
    vi.stubEnv('NEXT_PUBLIC_SITE_ASEZARE', '')
    vi.stubEnv('SITE_ASEZARE', 'ro')
    expect(mesaj(() => alternateSite('en=' + INT, RO))).toContain('Se adauga perechea ro-RO=' + RO)
    vi.stubEnv('SITE_ASEZARE', '')
    expect(mesaj(() => alternateSite('en=' + INT, RO))).toContain('Se adauga perechea cod=' + RO)
  })
})

// ---------------------------------------------------------------------------------------------
// Legaturile paginii, din echivalente
// ---------------------------------------------------------------------------------------------

/**
 * Un tabel de echivalente FABRICAT: o pereche juridica en/ro-MD, contactul en/ro-MD, preturile pe toate trei editiile
 * (cu calea `ro-RO` a site-ului romanesc vechi DIFERITA de cea servita a romanei pe 3s.com.ro, ca sa se vada din ce rand
 * se scrie varianta `ro-RO`), o pagina numai EN.
 */
const TABEL: Record<string, CaiPeEditie> = {
  confidentialitate: { en: '/legal/privacy', 'ro-MD': '/ro/juridic/confidentialitate' },
  contact: { en: '/contact', 'ro-MD': '/ro/contact' },
  preturi: { 'ro-RO': '/preturi-vechi', en: '/pricing', 'ro-MD': '/ro/preturi' },
  despre: { en: '/about' },
}

/** Manifestul de rute FABRICAT al build-ului international (cai SURSA, cu editia), pentru calea servita a paginii. */
const RUTE_INT: RutaAsezabila[] = Object.values(TABEL).flatMap((r) => [
  ...(r.en ? [{ cale: r.en, editie: 'en' as const }] : []),
  ...(r['ro-MD'] ? [{ cale: r['ro-MD'], editie: 'ro-MD' as const }] : []),
])

/** Lista comuna celor doua domenii (specificatia 3s.com.ro, §3): aceeasi valoare pe ambele aplicatii. */
const LISTA_COMUNA = ['en=' + INT, 'ro-MD=' + INT + '/ro', 'ro-RO=' + RO, 'x-default=' + INT].join(',')

/** Contextul build-ului 3s.md (asezarea `md`), cu lista comuna. */
function ctx3sMd(schimbari: Partial<ContextAlternate> = {}): ContextAlternate {
  return { alternate: alternateSite(LISTA_COMUNA, INT), baza: INT, editii: ['en', 'ro-MD'], echivalente: TABEL, asezare: 'md', rute: RUTE_INT, ...schimbari }
}

/** Contextul build-ului 3s.com.ro (asezarea `ro`: romana la radacina, engleza sub /en), cu aceeasi lista. */
function ctx3sComRo(schimbari: Partial<ContextAlternate> = {}): ContextAlternate {
  return { alternate: alternateSite(LISTA_COMUNA, RO), baza: RO, editii: ['en', 'ro-MD'], echivalente: TABEL, asezare: 'ro', rute: RUTE_INT, ...schimbari }
}

/** Multimea `hreflang -> adresa` din rezultat. */
function limbi(a: ReturnType<typeof alternatePagina>): Record<string, string> {
  return (a.languages ?? {}) as Record<string, string>
}

/** Multimea (cod, adresa), fara ordine. */
function forma(l: Record<string, string>): string[] {
  return Object.entries(l)
    .sort()
    .map((p) => p.join('='))
}

describe('alternatePagina: legaturile scrise pe server, din echivalente', () => {
  it('martor NEGATIV: fara SITE_ALTERNATE, numai canonical-ul, pe orice editie (HTML-ul romanesc nu se schimba)', () => {
    for (const [cale, editie, cheie] of [
      ['/preturi', undefined, undefined],
      ['/', undefined, undefined],
      ['/pricing', 'en', 'preturi'],
      ['/ro/juridic/confidentialitate', 'ro-MD', 'confidentialitate'],
    ] as const) {
      expect(alternatePagina({ cale, editie, cheie }, ctx3sMd({ alternate: [] })), cale).toEqual({ canonical: cale })
    }
  })

  it('pereche en/ro-MD pe 3s.md: fiecare pagina se listeaza pe ea, pe cealalta, pe romana 3s.com.ro si x-default spre EN', () => {
    const en = limbi(alternatePagina({ cale: '/legal/privacy', editie: 'en', cheie: 'confidentialitate' }, ctx3sMd()))
    const md = limbi(alternatePagina({ cale: '/ro/juridic/confidentialitate', editie: 'ro-MD', cheie: 'confidentialitate' }, ctx3sMd()))
    const asteptat = {
      en: INT + '/legal/privacy',
      'ro-MD': INT + '/ro/juridic/confidentialitate',
      'ro-RO': RO + '/juridic/confidentialitate',
      'x-default': INT + '/legal/privacy',
    }
    expect(en).toEqual(asteptat)
    expect(md).toEqual(asteptat)
    // Ordinea din <head>: pagina insasi, celelalte variante in ordinea tabelului inchis, x-default ultimul.
    expect(Object.keys(en)).toEqual(['en', 'ro-MD', 'ro-RO', 'x-default'])
    expect(Object.keys(md)).toEqual(['ro-MD', 'en', 'ro-RO', 'x-default'])
  })

  it('observatia 19: pe asezarea ro, /contact (continut ro-MD) emite ro-MD spre 3s.md/ro/contact, ro-RO spre el insusi, en si x-default spre 3s.md/contact', () => {
    const a = alternatePagina({ cale: '/ro/contact', editie: 'ro-MD', cheie: 'contact' }, ctx3sComRo())
    expect(a.canonical).toBe('/contact')
    expect(limbi(a)).toEqual({
      'ro-RO': RO + '/contact',
      'ro-MD': INT + '/ro/contact',
      en: INT + '/contact',
      'x-default': INT + '/contact',
    })
  })

  it('reciprocitate pe trei capete: pentru fiecare cheie cu en si ro-MD, 3s.md EN, 3s.md /ro si 3s.com.ro emit ACEEASI multime', () => {
    const chei = Object.entries(TABEL).filter(([, r]) => r.en && r['ro-MD'])
    expect(chei.length).toBe(3)
    for (const [cheie, r] of chei) {
      const capete = [
        alternatePagina({ cale: r.en!, editie: 'en', cheie }, ctx3sMd()),
        alternatePagina({ cale: r['ro-MD']!, editie: 'ro-MD', cheie }, ctx3sMd()),
        alternatePagina({ cale: r['ro-MD']!, editie: 'ro-MD', cheie }, ctx3sComRo()),
      ].map(limbi)
      expect(Object.keys(capete[0]).sort(), cheie).toEqual(['en', 'ro-MD', 'ro-RO', 'x-default'])
      expect(forma(capete[1]), cheie).toEqual(forma(capete[0]))
      expect(forma(capete[2]), cheie).toEqual(forma(capete[0]))
      // Auto-referinta pe capatul 3s.com.ro: romana de la radacina, fara /ro.
      expect(capete[2]['ro-RO'], cheie).toBe(RO + r['ro-MD']!.slice('/ro'.length))
    }
  })

  it('martor POZITIV: cu lista 3s.md fara ro-RO, capetele 3s.md nu mai emit perechea pe care 3s.com.ro o cere (reciprocitatea se rupe)', () => {
    const fara = alternateSite(['en=' + INT, 'ro-MD=' + INT + '/ro', 'x-default=' + INT].join(','), INT)
    const md = limbi(alternatePagina({ cale: '/ro/contact', editie: 'ro-MD', cheie: 'contact' }, ctx3sMd({ alternate: fara })))
    const ro = limbi(alternatePagina({ cale: '/ro/contact', editie: 'ro-MD', cheie: 'contact' }, ctx3sComRo()))
    expect(md['ro-RO']).toBeUndefined()
    expect(ro['ro-MD']).toBe(INT + '/ro/contact')
    expect(forma(md)).not.toEqual(forma(ro))
  })

  it('pe asezarea ro, paginile engleze (/en/...) nu au hreflang, iar canonical-ul e pagina de pe domeniul englezei (3s.md)', () => {
    expect(alternatePagina({ cale: '/contact', editie: 'en', cheie: 'contact' }, ctx3sComRo())).toEqual({ canonical: INT + '/contact' })
    expect(alternatePagina({ cale: '/', editie: 'en' }, ctx3sComRo({ rute: [...RUTE_INT, { cale: '/', editie: 'en' }] }))).toEqual({ canonical: INT })
    // Fara lista, sau cu o lista fara baza en, domeniul englezei nu se stie. Inainte, canonical-ul ramanea atunci calea servita
    // a copiei (/en/contact pe 3s.com.ro): o copie concurenta a lui 3s.md, tacut. Acum constructia se opreste, cu motivul
    // (specificatia 3s.com.ro, felia 119: pe ro, adresa site-ului apare in lista cu ro-RO).
    expect(mesaj(() => alternatePagina({ cale: '/contact', editie: 'en', cheie: 'contact' }, ctx3sComRo({ alternate: [] })))).toMatch(
      /SITE_ALTERNATE pe asezarea ro: lista lipseste/,
    )
    const faraEn = alternateSite('ro-MD=' + INT + '/ro,ro-RO=' + RO, RO)
    expect(mesaj(() => alternatePagina({ cale: '/contact', editie: 'en', cheie: 'contact' }, ctx3sComRo({ alternate: faraEn })))).toMatch(
      /lipseste baza en/,
    )
    // Si romana de la radacina se opreste pe aceeasi lista (grupul ei ar iesi fara en si fara x-default spre engleza).
    expect(mesaj(() => alternatePagina({ cale: '/ro/contact', editie: 'ro-MD', cheie: 'contact' }, ctx3sComRo({ alternate: [] })))).toMatch(
      /lista lipseste/,
    )
    // Martor NEGATIV: pe asezarea md, lista goala ramane "numai canonical-ul" (site-ul fara variante).
    expect(alternatePagina({ cale: '/contact', editie: 'en', cheie: 'contact' }, ctx3sMd({ alternate: [] }))).toEqual({ canonical: '/contact' })
  })

  it('o pagina fara echivalent (sau fara cheie) se listeaza numai pe ea, cu x-default spre ea insasi; canonical-ul ramane calea', () => {
    const despre = alternatePagina({ cale: '/about', editie: 'en', cheie: 'despre' }, ctx3sMd())
    expect(despre).toEqual({ canonical: '/about', languages: { en: INT + '/about', 'x-default': INT + '/about' } })
    expect(limbi(alternatePagina({ cale: '/ro/contact', editie: 'ro-MD' }, ctx3sMd()))).toEqual({ 'ro-MD': INT + '/ro/contact', 'x-default': INT + '/ro/contact' })
    expect(limbi(alternatePagina({ cale: '/ro/contact', editie: 'ro-MD' }, ctx3sComRo()))).toEqual({ 'ro-RO': RO + '/contact', 'x-default': RO + '/contact' })
  })

  it('P-17 ingustata: varianta ro-RO a grupului e romana de pe 3s.com.ro; calea ro-RO a site-ului romanesc vechi nu intra nicaieri', () => {
    const en = limbi(alternatePagina({ cale: '/pricing', editie: 'en', cheie: 'preturi' }, ctx3sMd()))
    expect(en['ro-RO']).toBe(RO + '/preturi')
    expect(Object.values(en).some((a) => a.endsWith('/preturi-vechi'))).toBe(false)
    // Pagina site-ului romanesc vechi, pe gazda ei, cu aceeasi lista: numai ea insasi.
    const vechi = limbi(alternatePagina({ cale: '/preturi-vechi', cheie: 'preturi' }, { ...ctx3sMd(), baza: RO, editii: ['ro-RO'] }))
    expect(vechi).toEqual({ 'ro-RO': RO + '/preturi-vechi', 'x-default': RO + '/preturi-vechi' })
    // Martor POZITIV al aceluiasi tabel: randul chiar are calea ro-RO (deci absenta ei de mai sus vine din regula).
    expect(TABEL.preturi['ro-RO']).toBe('/preturi-vechi')
  })

  it('o editie pe care build-ul nu o construieste nu intra pe domeniul propriu; varianta altui domeniu ramane', () => {
    const doarEn = limbi(alternatePagina({ cale: '/legal/privacy', editie: 'en', cheie: 'confidentialitate' }, ctx3sMd({ editii: ['en'] })))
    expect(doarEn).toEqual({ en: INT + '/legal/privacy', 'ro-RO': RO + '/juridic/confidentialitate', 'x-default': INT + '/legal/privacy' })
  })

  it('o varianta fara baza in lista nu intra; o pagina ro-MD fara EN in lista isi ia x-default pe ea insasi', () => {
    const faraEn: Alternata[] = [
      { hreflang: 'ro-MD', adresa: INT + '/ro' },
      { hreflang: 'ro-RO', adresa: RO },
      { hreflang: X_DEFAULT, adresa: RO },
    ]
    const md = limbi(alternatePagina({ cale: '/ro/juridic/confidentialitate', editie: 'ro-MD', cheie: 'confidentialitate' }, ctx3sMd({ alternate: faraEn })))
    expect(md).toEqual({
      'ro-MD': INT + '/ro/juridic/confidentialitate',
      'ro-RO': RO + '/juridic/confidentialitate',
      'x-default': INT + '/ro/juridic/confidentialitate',
    })
  })

  it('martor POZITIV: un tabel care contrazice pagina, sau o cale care nu sta sub prefixul editiei ori al bazei ei, opresc construirea', () => {
    expect(mesaj(() => alternatePagina({ cale: '/pricing-vechi', editie: 'en', cheie: 'preturi' }, ctx3sMd()))).toMatch(
      /tabelul de echivalente da pentru cheia preturi si editia en calea \/pricing/,
    )
    const stricat = { confidentialitate: { en: '/legal/privacy', 'ro-MD': '/juridic/confidentialitate' } }
    expect(mesaj(() => alternatePagina({ cale: '/legal/privacy', editie: 'en', cheie: 'confidentialitate' }, ctx3sMd({ echivalente: stricat })))).toMatch(
      /nu sta sub prefixul \/ro/,
    )
    // Fara baza ro-MD in lista, aceeasi cale stricata e prinsa la traducerea spre 3s.com.ro (nu iese o adresa inventata).
    const faraMd = alternateSite('en=' + INT + ',ro-RO=' + RO, INT)
    expect(mesaj(() => alternatePagina({ cale: '/legal/privacy', editie: 'en', cheie: 'confidentialitate' }, ctx3sMd({ echivalente: stricat, alternate: faraMd })))).toMatch(
      /nu incepe cu prefixul editiei \/ro/,
    )
    // Martor NEGATIV: tabelul bun trece, pe ambele asezari.
    expect(mesaj(() => alternatePagina({ cale: '/legal/privacy', editie: 'en', cheie: 'confidentialitate' }, ctx3sMd()))).toBe('(nu a aruncat)')
    expect(mesaj(() => alternatePagina({ cale: '/ro/juridic/confidentialitate', editie: 'ro-MD', cheie: 'confidentialitate' }, ctx3sComRo()))).toBe('(nu a aruncat)')
  })

  it('lista necoerenta cu asezarea opreste construirea: un cod care nu e varianta servita; pe ro, site-ul lipsa sau cu alt cod', () => {
    const coduri = Object.keys(VARIANTE_SERVITE)
    expect(problemeAlternateAsezare('md', alternateSite(LISTA_COMUNA, INT), INT, coduri)).toEqual([])
    expect(problemeAlternateAsezare('ro', alternateSite(LISTA_COMUNA, RO), RO, coduri)).toEqual([])
    // Lista goala pe ro e o PROBLEMA (cazul era invers inainte: "nimic de masurat"). Pe 3s.com.ro lista poarta varianta
    // ro-RO a romanei de la radacina si baza en spre care au canonical-ul paginile /en; fara ea build-ul trecea tacut, cu
    // canonical-ul englezei pe copia de aici (o copie concurenta a lui 3s.md, contra I1) si cu romana fara grup hreflang
    // (specificatia 3s.com.ro §4, felia 119). Pe md lista goala ramane fara probleme.
    const goala = problemeAlternateAsezare('ro', [], RO, coduri).join(' | ')
    expect(goala).toMatch(/^SITE_ALTERNATE pe asezarea ro: lista lipseste/)
    expect(goala).toContain('ro-RO=' + RO)
    expect(problemeAlternateAsezare('md', [], INT, coduri)).toEqual([])
    const rele: [string, 'md' | 'ro', string, string, RegExp][] = [
      ['cod in afara tabelului', 'md', 'en=' + INT + ',fr=' + INT + '/fr', INT, /codul fr .* nu e o varianta servita/],
      ['ro: site-ul numit cu ro-MD', 'ro', 'en=' + INT + ',ro-MD=' + RO, RO, /lista o numeste ro-MD=/],
      ['ro: site-ul numit si cu en sub prefix', 'ro', 'ro-RO=' + RO + ',en=' + RO + '/en', RO, /lista o numeste ro-RO=.*en=/],
      ['ro: fara baza en (canonical-ul paginilor /en n-ar avea domeniu)', 'ro', 'ro-MD=' + INT + '/ro,ro-RO=' + RO, RO, /lipseste baza en/],
    ]
    for (const [caz, asezare, lista, baza, tipar] of rele) {
      expect(problemeAlternateAsezare(asezare, alternateSite(lista, baza), baza, coduri).join(' | '), caz).toMatch(tipar)
    }
    // Lista care nu numeste deloc acest site nu ajunge aici (o opreste alternateSite); controlul direct, pe variante date:
    expect(problemeAlternateAsezare('ro', [{ hreflang: 'en', adresa: INT }], RO, coduri).join(' | ')).toMatch(/o numeste deloc/)
    // Si prin alternatePagina: pe asezarea ro, o baza care nu e cea cu ro-RO arunca, cu motivul.
    const lista = alternateSite('en=' + INT + ',ro-MD=' + INT + '/ro,ro-RO=' + RO, INT)
    expect(mesaj(() => alternatePagina({ cale: '/ro/contact', editie: 'ro-MD', cheie: 'contact' }, ctx3sComRo({ alternate: lista, baza: INT })))).toMatch(
      /SITE_ALTERNATE pe asezarea ro/,
    )
  })

  it('tabelul inchis al variantelor servite: fiecare cod e chiar inLanguage al editiei pe asezarea ei, in ordinea din <head>', () => {
    expect(Object.keys(VARIANTE_SERVITE)).toEqual(['en', 'ro-MD', 'ro-RO'])
    for (const [cod, v] of Object.entries(VARIANTE_SERVITE)) expect(ASEZARI[v.asezare][v.editie].inLanguage, cod).toBe(cod)
  })

  it('og:locale din asezare: ro_RO pe romana 3s.com.ro, ro_MD ramane pe 3s.md /ro, en_US pe engleza, catalogul pe ro-RO', () => {
    const date = { titlu: 'Contact 3S pentru arhiva firmei', descriere: 'Pagina de contact a echipei 3S, cu legăturile de mesagerie și datele de contact.' }
    const og = (m: ReturnType<typeof metadataPagina>) => m.openGraph as { locale?: string; url?: string }
    // Pe asezarea ro lista e obligatorie (problemeAlternateAsezare), deci cazurile ro ruleaza ca aplicatia reala: lista
    // comuna, pe originea 3s.com.ro. Cazurile md raman fara lista, ca inainte.
    vi.stubEnv('SITE_ALTERNATE', LISTA_COMUNA)
    vi.stubEnv('SITE_URL', RO)
    vi.stubEnv('SITE_EDITII', 'en,ro-MD')
    const ro = og(metadataPagina({ ...date, cale: '/ro/contact', editie: 'ro-MD', cheie: 'contact' }, { asezare: 'ro', rute: RUTE_INT }))
    expect(ro).toMatchObject({ locale: 'ro_RO', url: '/contact' })
    expect(og(metadataPagina({ ...date, cale: '/contact', editie: 'en', cheie: 'contact' }, { asezare: 'ro', rute: RUTE_INT })).locale).toBe('en_US')
    vi.stubEnv('SITE_ALTERNATE', '')
    vi.stubEnv('SITE_URL', INT)
    const md = og(metadataPagina({ ...date, cale: '/ro/contact', editie: 'ro-MD', cheie: 'contact' }, { asezare: 'md', rute: RUTE_INT }))
    expect(md).toMatchObject({ locale: 'ro_MD', url: '/ro/contact' })
    expect(og(metadataPagina({ ...date, cale: '/contact', editie: 'en', cheie: 'contact' }, { asezare: 'md', rute: RUTE_INT })).locale).toBe('en_US')
    vi.stubEnv('SITE_EDITII', '')
    expect(og(metadataPagina({ ...date, cale: '/contact' })).locale).toBe('ro_RO')
    // Martorul garzii pe drumul real (metadataPagina, nu numai functia de coerenta): pe ro, fara lista, constructia se opreste.
    expect(mesaj(() => metadataPagina({ ...date, cale: '/contact', editie: 'en', cheie: 'contact' }, { asezare: 'ro', rute: RUTE_INT }))).toMatch(
      /SITE_ALTERNATE pe asezarea ro: lista lipseste/,
    )
  })

  it('metadataPagina scrie alternatele din mediu: fara SITE_ALTERNATE numai canonical, cu ea pagina proprie si x-default', () => {
    const date = { titlu: 'Prețurile 3S pentru arhiva firmei', descriere: 'Pachetele 3S pentru arhiva firmei, cu ce include fiecare și prețul pe lună.', cale: '/preturi' }
    vi.stubEnv('SITE_ALTERNATE', '')
    expect(metadataPagina(date).alternates).toEqual({ canonical: '/preturi' })
    vi.stubEnv('SITE_ALTERNATE', LISTA_CU_IMPLICIT)
    vi.stubEnv('SITE_URL', INT)
    vi.stubEnv('SITE_EDITII', 'ro-RO')
    expect(metadataPagina(date).alternates).toEqual({ canonical: '/preturi', languages: { 'ro-RO': INT + '/preturi', 'x-default': INT + '/preturi' } })
  })
})

describe('piesa de browser retrasa', () => {
  const RADACINA = join(__dirname, '..')

  it('componentele hreflang de browser nu mai exista, iar layout-ul romanesc nu le mai monteaza', () => {
    for (const f of ['AlternateHreflang.tsx', 'AlternateHreflangClient.tsx', 'alternate-cale.ts']) {
      expect(existsSync(join(RADACINA, 'src', 'components', 'seo', f)), f).toBe(false)
    }
    const layout = readFileSync(join(RADACINA, 'src', 'app', 'layout.tsx'), 'utf8')
    expect(layout).not.toMatch(/AlternateHreflang/)
    // Controlul cautarii: acelasi fisier chiar e layout-ul cu analitica (deci zeroul de mai sus nu e un fisier gresit)
    expect(layout).toContain('<Analitica />')
  })

  it('startul isi scrie alternatele prin acelasi helper ca paginile interioare', () => {
    const start = readFileSync(join(RADACINA, 'src', 'app', 'page.tsx'), 'utf8')
    expect(start).toMatch(/alternates: alternatePagina\(\{ cale: "\/" \}\)/)
  })
})
