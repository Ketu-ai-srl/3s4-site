import { createElement, isValidElement, type ComponentType, type ReactElement, type ReactNode } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import PaginaContact, { type ContinutPaginaContact, type RandPanou } from '../src/components/conversie/PaginaContact'
import BandaDrumDocument from '../src/components/enterprise/BandaDrumDocument'
import BandaDrumDocumentVedere, { type ContinutDrumDocument } from '../src/components/enterprise/BandaDrumDocumentVedere'
import EroulEnterprise, { type ContinutEroulEnterprise } from '../src/components/enterprise/EroulEnterprise'
import ListaLivrabile, { type ContinutListaLivrabile } from '../src/components/enterprise/ListaLivrabile'
import HartaEuropa from '../src/components/produs/HartaEuropa'
import MachetaStrat from '../src/components/produs/MachetaStrat'
import PaginaPlatforma, { SECTIUNI_PLATFORMA, type ContinutPaginaPlatforma, type SectiunePlatforma } from '../src/components/produs/PaginaPlatforma'
import PaginaSecuritate, { SECTIUNI_SECURITATE, type ContinutPaginaSecuritate, type SectiuneSecuritate } from '../src/components/produs/PaginaSecuritate'
import VerificareBrowser from '../src/components/produs/VerificareBrowser'
import type { StareFormular } from '../src/components/formular/stare'
import EroulInterior from '../src/components/primitive/EroulInterior'
import VerificareBrowserVedere, { type ContinutVerificareBrowser } from '../src/components/produs/VerificareBrowserVedere'
import { CONTACT } from '../src/content/conversie'
import { DRUM_DOCUMENT, EROU_ENTERPRISE, LIVRABILE } from '../src/content/enterprise'
import * as platforma from '../src/content/produs/platforma'
import * as securitate from '../src/content/produs/securitate'

/**
 * MECANISMUL PE EDITIE AL PAGINILOR NUCLEU (felia 101): platforma, securitatea, enterprise si contactul.
 * Componentele primesc continutul prin proprietati optionale, cu implicitul RO; paginile compuse primesc
 * continutul pe sectiuni si o lista optionala de sectiuni; insulele client (verificarea din browser, banda
 * drumului unui document) au o vedere fara continut si o invelitoare RO la aceeasi cale.
 *
 * CE DOVEDESTE PROBA ASTA si ce nu. Aici se dovedeste partea EDITIEI: cu un continut sintetic, componenta
 * scoate exact textul primit si nimic din continutul romanesc; plus ramurile optionale, lista de sectiuni si
 * sloturile. Partea RO (HTML-ul si fluxul RSC neschimbate) NU se dovedeste aici: randarea statica nu vede
 * fluxul RSC. Dovada RO e invarianta pe build (`tests/invarianta-ro.test.ts`), pe `/platforma`,
 * `/securitate`, `/enterprise`, `/contact` si pe celelalte rute-martor.
 *
 * DICTIONARUL RO se construieste la rulare, din sirurile constantelor RO pe care componentele le iau implicit
 * si din textele (plus etichetele accesibile) randarii RO fara proprietati; a doua sursa prinde si sirurile
 * scrise direct in componenta, inclusiv cele fara diacritice. Intra sirurile de cel putin doua cuvinte si
 * cele cu diacritice.
 *
 * CONTINUTUL SINTETIC se obtine la rulare din forma constantei RO: fiecare frunza de tip sir devine un sir
 * nou (prefix, rolul campului, contor), cu exceptia cailor, a numelor de iconite si a valorilor de enumerare.
 * Proba nu poarta literal niciun text al vreunei editii. MARTORUL: acelasi continut sintetic, cu un singur sir
 * RO strecurat intr-un camp, e prins.
 */

// ---------------------------------------------------------------------------------------------
// Dictionarul RO si detectorul (aceeasi forma ca la proba mecanismului startului)
// ---------------------------------------------------------------------------------------------

const DIACRITICE = /[ăâîșțşţĂÂÎȘȚŞŢ]/

function decodeaza(t: string): string {
  return t
    .replace(/&#x27;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
}

/** Textele dintre etichete si valorile etichetelor accesibile, decodate, fara goluri. */
function textSiEtichete(html: string): string[] {
  const texte = [...html.matchAll(/>([^<]+)</g)].map((m) => decodeaza(m[1]).trim())
  const atribute = [...html.matchAll(/\s(?:aria-label|title|alt)="([^"]*)"/g)].map((m) => decodeaza(m[1]).trim())
  return [...texte, ...atribute].filter((t) => t !== '')
}

function semnificativ(t: string): boolean {
  return t.split(/\s+/).filter(Boolean).length >= 2 || DIACRITICE.test(t)
}

/** Sirurile semnificative dintr-o valoare (frunzele de tip sir, recursiv), fara cai si adrese. */
function frunze(valoare: unknown, acc: string[] = []): string[] {
  if (typeof valoare === 'string') {
    const t = valoare.trim()
    if (t !== '' && !/^(\/|#|https?:|mailto:)/.test(t) && semnificativ(t)) acc.push(t)
  } else if (Array.isArray(valoare)) {
    for (const v of valoare) frunze(v, acc)
  } else if (valoare && typeof valoare === 'object') {
    for (const v of Object.values(valoare)) frunze(v, acc)
  }
  return acc
}

function dictionar(htmlRo: string, ...constante: unknown[]): string[] {
  const dinRandare = textSiEtichete(htmlRo).filter(semnificativ)
  const dinConstante = constante.flatMap((c) => frunze(c))
  return [...new Set([...dinRandare, ...dinConstante])]
}

/** Sirurile RO gasite in HTML-ul editiei. */
function scapari(htmlEditie: string, dictionarRo: string[]): string[] {
  const tinta = textSiEtichete(htmlEditie).join('\n')
  return dictionarRo.filter((d) => tinta.includes(d))
}

// ---------------------------------------------------------------------------------------------
// Continutul sintetic, derivat din forma constantei RO
// ---------------------------------------------------------------------------------------------

/** Fabrica de siruri sintetice; tine minte ce a produs, ca proba sa le caute pe toate in HTML. */
function fabrica() {
  let n = 0
  const produse: string[] = []
  const t = (rol: string) => {
    n += 1
    const sir = ['Qx', rol, 'v' + n].join(' ')
    produse.push(sir)
    return sir
  }
  return { t, produse }
}

/** Campurile care nu sunt text de citit: cai, iconite, numere de bloc, valori de enumerare. */
const PASTREAZA = new Set(['href', 'ruta', 'cale', 'iconita', 'numar', 'valori'])

/** Aceeasi forma ca `valoare`, cu fiecare sir de citit inlocuit de un sir sintetic. */
function sintetic<T>(valoare: T, t: (rol: string) => string, cheie = 'sir'): T {
  if (typeof valoare === 'string') return (PASTREAZA.has(cheie) ? valoare : t(cheie)) as T
  if (Array.isArray(valoare)) return valoare.map((v) => sintetic(v, t, cheie)) as T
  if (valoare && typeof valoare === 'object') {
    return Object.fromEntries(Object.entries(valoare).map(([k, v]) => [k, sintetic(v, t, k)])) as T
  }
  return valoare
}

function render(c: ComponentType<never> | ((p: never) => ReactNode), props: Record<string, unknown> = {}): string {
  return renderToStaticMarkup(createElement(c as ComponentType<Record<string, unknown>>, props))
}

const STARE_INCHISA: StareFormular = { activ: false, adresa: null, operator: null, pastrare: '', analitica: false }

/** Continutul RO al paginilor compuse, asamblat aici din constantele modulelor, ca baza a formei sintetice. */
const PLATFORMA_RO: ContinutPaginaPlatforma = {
  fir: platforma.FIR_PLATFORMA,
  erou: platforma.EROU_PLATFORMA,
  macheta: platforma.MACHETA_STRAT,
  piloni: platforma.PILONI_PLATFORMA,
  problema: platforma.PROBLEMA_PLATFORMA,
  model: platforma.MODEL_PLATFORMA,
  blocDate: platforma.BLOC_DATE,
  blocArhiva: platforma.BLOC_ARHIVA,
  blocIntrebari: platforma.BLOC_INTREBARI,
  comparatie: { ...platforma.COMPARATIE_PLATFORMA, etichetaCriteriu: 'x' },
  suveranitate: platforma.SUVERANITATE_PLATFORMA,
  apeluri: platforma.APELURI_PLATFORMA,
  cazuri: platforma.CAZURI_PLATFORMA,
  conformitate: { ...platforma.CONFORMITATE_PLATFORMA, etichetaInsigne: 'x' },
  intrebari: platforma.INTREBARI_PLATFORMA,
}

const SECURITATE_RO: ContinutPaginaSecuritate = {
  fir: securitate.FIR_SECURITATE,
  erou: securitate.EROU_SECURITATE,
  piloni: { titlu: securitate.TITLU_PILONI_SECURITATE, elemente: securitate.PILONI_SECURITATE },
  infrastructura: securitate.BLOC_INFRASTRUCTURA,
  stocareProprie: securitate.BLOC_STOCARE_PROPRIE,
  criptare: securitate.BLOC_CRIPTARE,
  acces: securitate.BLOC_ACCES,
  ciclu: securitate.BLOC_CICLU,
  reglementare: securitate.BLOC_REGLEMENTARE,
  originale: securitate.BLOC_ORIGINALE,
  raportare: securitate.BLOC_RAPORTARE,
  intrebari: securitate.INTREBARI_SECURITATE,
}

/** Securitatea pe editie: fara seif (insula lui nu e in mecanismul feliei; pe 3s.md iese, d43). */
const SECURITATE_FARA_SEIF = SECTIUNI_SECURITATE.filter((k) => k !== 'seif')

type Caz = {
  nume: string
  /** Randarea RO, fara proprietati de continut (implicitul). */
  ro: () => string
  /** Constantele RO pe care componenta le ia implicit. */
  constante: unknown[]
  /** Randarea editiei cu continut sintetic; `strecurat` (daca e dat) inlocuieste un camp text. */
  editie: (strecurat?: string) => { html: string; produse: string[] }
}

const CAZURI: Caz[] = [
  {
    nume: 'PaginaPlatforma (toate sectiunile, cu butoane si eticheta firului)',
    ro: () => render(PaginaPlatforma),
    constante: [PLATFORMA_RO],
    editie: (strecurat) => {
      const { t, produse } = fabrica()
      const continut = sintetic(PLATFORMA_RO, t)
      if (strecurat) continut.erou = { ...continut.erou, subtitlu: strecurat }
      const butoane = createElement('a', { href: '#canal' }, t('buton canal'))
      const html = render(PaginaPlatforma, { continut, butoane, etichetaFir: t('eticheta fir') })
      return { html, produse }
    },
  },
  {
    nume: 'PaginaSecuritate (fara seif, cu slotul verificarii si etichetele)',
    ro: () => render(PaginaSecuritate),
    constante: [SECURITATE_RO, securitate.VERIFICARE_BROWSER],
    editie: (strecurat) => {
      const { t, produse } = fabrica()
      const continut = sintetic(SECURITATE_RO, t)
      if (strecurat) continut.erou = { ...continut.erou, subtitlu: strecurat }
      const verificare = createElement('p', null, t('slot verificare'))
      const html = render(PaginaSecuritate, {
        continut,
        sectiuni: SECURITATE_FARA_SEIF,
        verificare,
        etichetaVerificare: t('eticheta verificare'),
        etichetaFir: t('eticheta fir'),
      })
      return { html, produse }
    },
  },
  {
    nume: 'EroulEnterprise (cu butoane si eticheta firului)',
    ro: () => render(EroulEnterprise),
    constante: [EROU_ENTERPRISE],
    editie: (strecurat) => {
      const { t, produse } = fabrica()
      const continut: ContinutEroulEnterprise = sintetic(EROU_ENTERPRISE, t)
      if (strecurat) continut.subtitlu = strecurat
      const butoane = createElement('a', { href: '#canal' }, t('buton canal'))
      const html = render(EroulEnterprise, { continut, butoane, etichetaFir: t('eticheta fir') })
      // Slotul `butoane` inlocuieste butonul spre formular si legatura secundara: textele lor nu se cer.
      return { html, produse: produse.filter((p) => p !== continut.buton && p !== continut.secundara?.text) }
    },
  },
  {
    nume: 'ListaLivrabile',
    ro: () => render(ListaLivrabile),
    constante: [LIVRABILE],
    editie: (strecurat) => {
      const { t, produse } = fabrica()
      const continut: ContinutListaLivrabile = sintetic(LIVRABILE, t)
      if (strecurat) continut.text = strecurat
      return { html: render(ListaLivrabile, { continut }), produse }
    },
  },
  {
    nume: 'BandaDrumDocumentVedere',
    ro: () => render(BandaDrumDocument),
    constante: [DRUM_DOCUMENT],
    editie: (strecurat) => {
      const { t, produse } = fabrica()
      const continut: ContinutDrumDocument = sintetic(DRUM_DOCUMENT, t)
      if (strecurat) continut.nota = strecurat
      return { html: render(BandaDrumDocumentVedere, { continut }), produse }
    },
  },
  {
    nume: 'VerificareBrowserVedere',
    ro: () => render(VerificareBrowser),
    constante: [securitate.VERIFICARE_BROWSER],
    editie: (strecurat) => {
      const { t, produse } = fabrica()
      const continut: ContinutVerificareBrowser = sintetic(securitate.VERIFICARE_BROWSER, t)
      // HTML-ul servit are numai starea de asteptare: textele starilor de dupa masurare nu apar.
      for (const k of ['criptareDa', 'criptareNu', 'indisponibil'] as const) produse.splice(produse.indexOf(continut[k]), 1)
      if (strecurat) continut.nota = strecurat
      return { html: render(VerificareBrowserVedere, { continut, cale: '/api/sanatate' }), produse }
    },
  },
  {
    nume: 'PaginaContact (cu randurile panoului si butonul casetei)',
    ro: () => render(PaginaContact, { stare: STARE_INCHISA, adresa: null }),
    constante: [CONTACT],
    editie: (strecurat) => {
      const { t, produse } = fabrica()
      // Numai campurile citite de componenta (constanta RO are si textele formularului, randat de pagina).
      const { fir, erou, caseta, subiecte, canale, marca } = CONTACT
      const continut: ContinutPaginaContact = sintetic({ fir, erou, caseta, subiecte, canale, marca }, t)
      // Nota panoului are doua variante dupa starea formularului; pe pagina apare numai cea a starii date.
      produse.splice(produse.indexOf(continut.canale.notaDeschis as string), 1)
      if (strecurat) continut.erou = { ...continut.erou, subtitlu: strecurat }
      const randuri: RandPanou[] = [
        { nume: t('canal'), legatura: { text: t('canal legatura'), href: 'https://wa.me/1', ruta: null }, stare: t('canal stare') },
        { nume: t('canal'), legatura: null, text: t('canal text'), stare: t('canal stare') },
      ]
      const butonCaseta = createElement('a', { href: '#canal' }, t('buton canal'))
      const html = render(PaginaContact, { stare: STARE_INCHISA, adresa: null, continut, randuri, butonCaseta, etichetaFir: t('eticheta fir') })
      // Campurile RO ale canalelor (formular, cont, posta, tur, starile) nu se folosesc cand editia isi da
      // randurile; continutul sintetic le are, deci nu se cer pe pagina.
      const nefolosite = new Set(frunzeSintetice(continut.canale, ['titlu', 'text', 'notaEticheta', 'notaInchis', 'notaDeschis']))
      const butonFormular = continut.caseta.butonFormular
      return { html, produse: produse.filter((p) => !nefolosite.has(p) && p !== butonFormular) }
    },
  },
]

/** Sirurile sintetice din `obiect`, in afara cheilor de prim nivel numite. */
function frunzeSintetice(obiect: object, fara: string[]): string[] {
  const acc: string[] = []
  for (const [k, v] of Object.entries(obiect)) if (!fara.includes(k)) colecteaza(v, acc)
  return acc
}

function colecteaza(v: unknown, acc: string[]): void {
  if (typeof v === 'string') acc.push(v)
  else if (Array.isArray(v)) v.forEach((x) => colecteaza(x, acc))
  else if (v && typeof v === 'object') Object.values(v).forEach((x) => colecteaza(x, acc))
}

describe('mecanismul pe editie: continut sintetic, zero text RO', () => {
  for (const caz of CAZURI) {
    describe(caz.nume, () => {
      const htmlRo = caz.ro()
      const dict = dictionar(htmlRo, ...caz.constante)

      it('dictionarul RO s-a construit (controlul preconditiei)', () => {
        expect(dict.length, 'siruri RO in dictionar').toBeGreaterThan(0)
        expect(scapari(htmlRo, dict).length).toBeGreaterThan(0)
      })

      it('scoate fiecare sir sintetic primit si niciun sir RO', () => {
        const { html, produse } = caz.editie()
        expect(produse.length, 'siruri sintetice produse').toBeGreaterThan(0)
        const text = textSiEtichete(html).join('\n')
        const lipsa = produse.filter((p) => !text.includes(p))
        expect(lipsa, 'siruri sintetice care nu apar').toEqual([])
        expect(scapari(html, dict), 'siruri RO pe editie').toEqual([])
      })

      it('martor: un sir RO strecurat intr-un camp e prins', () => {
        const strecurat = dict[dict.length - 1]
        const { html } = caz.editie(strecurat)
        expect(scapari(html, dict)).toContain(strecurat)
      })
    })
  }
})

// ---------------------------------------------------------------------------------------------
// Lista de sectiuni
// ---------------------------------------------------------------------------------------------

/** Valorile `aria-labelledby` ale sectiunilor, in ordinea din HTML. */
function sectiuniDinHtml(html: string): string[] {
  return [...html.matchAll(/<section[^>]*aria-labelledby="([^"]+)"/g)].map((m) => m[1])
}

describe('lista de sectiuni: ordinea componentei, implicit toate', () => {
  it('PaginaPlatforma: implicit 13 sectiuni; fara problema, blocul 01 si apeluri raman 10, in aceeasi ordine', () => {
    const toate = sectiuniDinHtml(render(PaginaPlatforma))
    expect(toate.length).toBe(SECTIUNI_PLATFORMA.length)
    const scoase = ['problema', 'blocDate', 'apeluri'] as const
    const alese = SECTIUNI_PLATFORMA.filter((k) => !(scoase as readonly string[]).includes(k))
    // Lista data in alta ordine: ordinea ramane a componentei.
    const partial = sectiuniDinHtml(render(PaginaPlatforma, { sectiuni: [...alese].reverse() }))
    const asteptat = toate.filter((id) => !['platforma-problema', 'platforma-bloc-01', 'platforma-apeluri'].includes(id))
    expect(partial).toEqual(asteptat)
    expect(partial.length).toBe(10)
  })

  it('PaginaSecuritate: implicit cu seif si verificare; fara ele, nici seiful, nici verificarea RO', () => {
    const ro = render(PaginaSecuritate)
    expect(ro).toContain(securitate.SEIF.titlu)
    expect(ro).toContain(securitate.VERIFICARE_BROWSER.titlu)
    const alese: SectiuneSecuritate[] = SECTIUNI_SECURITATE.filter((k) => k !== 'seif' && k !== 'verificare')
    const fara = render(PaginaSecuritate, { sectiuni: alese })
    expect(fara).not.toContain(securitate.SEIF.titlu)
    expect(fara).not.toContain(securitate.VERIFICARE_BROWSER.titlu)
    expect(sectiuniDinHtml(fara)).toEqual(sectiuniDinHtml(ro).filter((id) => sectiuniDinHtml(fara).includes(id)))
  })

  it('o sectiune ceruta fara continut opreste randarea, cu numele ei', () => {
    const { problema, ...faraProblema } = PLATFORMA_RO
    expect(problema).toBeDefined()
    expect(() => render(PaginaPlatforma, { continut: faraProblema })).toThrow(/problema/)
    const alese: SectiunePlatforma[] = SECTIUNI_PLATFORMA.filter((k) => k !== 'problema')
    expect(() => render(PaginaPlatforma, { continut: faraProblema, sectiuni: alese })).not.toThrow()
    const { stocareProprie, ...faraStocare } = SECURITATE_RO
    expect(stocareProprie).toBeDefined()
    expect(() => render(PaginaSecuritate, { continut: faraStocare })).toThrow(/stocareProprie/)
  })
})

// ---------------------------------------------------------------------------------------------
// Ramurile optionale si sloturile
// ---------------------------------------------------------------------------------------------

describe('ramurile optionale pastreaza RO si scot campul pe editie', () => {
  it('PaginaPlatforma: fara legaturi si butoane, textele lor nu se randeaza; RO le are pe toate', () => {
    const p = PLATFORMA_RO
    const legaturi = [p.blocArhiva!.legatura!, p.comparatie!.legatura!, p.suveranitate!.legatura!, p.apeluri!.legatura!, p.cazuri!.legatura!]
    const butoane = [p.erou.butonPrincipal!, p.erou.butonSecundar!]
    const continut: ContinutPaginaPlatforma = {
      ...p,
      erou: { titlu: p.erou.titlu, subtitlu: p.erou.subtitlu },
      blocArhiva: { ...p.blocArhiva!, legatura: undefined },
      comparatie: { ...p.comparatie!, legatura: undefined },
      suveranitate: { ...p.suveranitate!, legatura: undefined },
      apeluri: { ...p.apeluri!, legatura: undefined },
      cazuri: { ...p.cazuri!, legatura: undefined },
    }
    const fara = render(PaginaPlatforma, { continut })
    const ro = render(PaginaPlatforma)
    for (const l of [...legaturi, ...butoane]) {
      expect(ro, 'control RO: ' + l.text).toContain(l.text)
      expect(fara, 'scos pe editie: ' + l.text).not.toContain(l.text)
    }
    // Nota comparatiei ramane, fara spatiul care o lega de legatura.
    expect(fara).toContain(p.comparatie!.nota)
  })

  it('PaginaPlatforma: slotul `butoane` inlocuieste butoanele eroului; macheta ia continutul dat', () => {
    const { t } = fabrica()
    const marca = t('slot')
    const html = render(PaginaPlatforma, { butoane: createElement('span', null, marca), sectiuni: ['erou'] })
    expect(html).toContain(marca)
    expect(html).not.toContain(platforma.EROU_PLATFORMA.butonPrincipal.text)
    expect(html).toContain(platforma.MACHETA_STRAT.eticheta)
  })

  it('PaginaSecuritate: fara butonul stocarii proprii, butonul nu apare; nota ramane', () => {
    const b = securitate.BLOC_STOCARE_PROPRIE
    const html = render(PaginaSecuritate, { continut: { ...SECURITATE_RO, stocareProprie: { ...b, buton: undefined } }, sectiuni: ['stocareProprie'] })
    expect(render(PaginaSecuritate)).toContain(b.buton.text)
    expect(html).not.toContain(b.buton.text)
    expect(html).toContain(b.nota)
  })

  it('EroulEnterprise: fara buton si legatura secundara, niciuna nu apare; ancora e a editiei', () => {
    const { buton, secundara, ...rest } = EROU_ENTERPRISE
    const ro = render(EroulEnterprise)
    expect(ro).toContain(buton)
    expect(ro).toContain(secundara.text)
    const fara = render(EroulEnterprise, { continut: rest })
    expect(fara).not.toContain(buton)
    expect(fara).not.toContain(secundara.text)
    const { t } = fabrica()
    const ancora = t('ancora').replace(/\s/g, '')
    expect(render(EroulEnterprise, { ancora })).toContain('href="#' + ancora + '"')
  })

  it('PaginaContact: fara nota casetei si a panoului, ele lipsesc; randurile si butonul editiei inlocuiesc pe cele RO', () => {
    const ro = render(PaginaContact, { stare: STARE_INCHISA, adresa: null })
    expect(ro).toContain(CONTACT.caseta.nota)
    expect(ro).toContain(CONTACT.canale.notaEticheta)
    expect(ro).toContain(CONTACT.canale.formular.nume)
    const { nota, ...caseta } = CONTACT.caseta
    const { notaEticheta, notaInchis, notaDeschis, ...canale } = CONTACT.canale
    expect([notaInchis, notaDeschis].every(Boolean)).toBe(true)
    const { t } = fabrica()
    const marca = t('buton')
    const rand = t('rand')
    const fara = render(PaginaContact, {
      stare: STARE_INCHISA,
      adresa: null,
      continut: { ...CONTACT, caseta, canale },
      randuri: [{ nume: rand, legatura: null, text: t('text'), stare: t('stare') }],
      butonCaseta: createElement('span', null, marca),
    })
    expect(fara).not.toContain(nota)
    expect(fara).not.toContain(notaEticheta)
    expect(fara).not.toContain(CONTACT.canale.formular.nume)
    expect(fara).not.toContain(CONTACT.caseta.butonFormular)
    expect(fara).toContain(rand)
    expect(fara).toContain(marca)
  })

  it('PaginaContact: caile firului au implicitul RO si se pot da pe editie', () => {
    const caiFir = (radacina: unknown) => {
      const eroi = elemente(radacina).filter((e) => e.type === EroulInterior)
      expect(eroi.length).toBe(1)
      return (eroi[0].props as { fir: { cale: string }[] }).fir.map((n) => n.cale)
    }
    expect(caiFir(PaginaContact({ stare: STARE_INCHISA, adresa: null }))).toEqual(['/', '/contact'])
    const continut: ContinutPaginaContact = { ...CONTACT, fir: { ...CONTACT.fir, caleAcasa: '/ro', calePagina: '/ro/contact' } }
    expect(caiFir(PaginaContact({ stare: STARE_INCHISA, adresa: null, continut }))).toEqual(['/ro', '/ro/contact'])
  })
})

// ---------------------------------------------------------------------------------------------
// Granita server-client si invelitorile RO
// ---------------------------------------------------------------------------------------------

/** Toate elementele React dintr-un arbore nerandat (proprietatile si copiii, recursiv). */
function elemente(nod: unknown, acc: ReactElement[] = []): ReactElement[] {
  if (Array.isArray(nod)) {
    for (const n of nod) elemente(n, acc)
  } else if (isValidElement(nod)) {
    acc.push(nod)
    for (const v of Object.values(nod.props as Record<string, unknown>)) elemente(v, acc)
  }
  return acc
}

describe('granita server-client: insula RO primeste exact ce primea', () => {
  it('PaginaSecuritate pe RO pune `<VerificareBrowser />` fara nicio proprietate; slotul o inlocuieste', () => {
    const insule = elemente(PaginaSecuritate({})).filter((e) => e.type === VerificareBrowser)
    expect(insule.length).toBe(1)
    expect(Object.keys(insule[0].props as object)).toEqual([])
    const slot = createElement('p', null, 'x')
    expect(elemente(PaginaSecuritate({ verificare: slot })).filter((e) => e.type === VerificareBrowser).length).toBe(0)
  })
})

describe('invelitorile RO randeaza exact ce randa vederea cu continutul RO', () => {
  it('VerificareBrowser = vederea cu VERIFICARE_BROWSER si CALE_SANATATE', () => {
    const a = render(VerificareBrowser)
    const b = render(VerificareBrowserVedere, { continut: securitate.VERIFICARE_BROWSER, cale: securitate.CALE_SANATATE })
    expect(a).toBe(b)
    expect(a).toContain(securitate.VERIFICARE_BROWSER.titlu)
  })

  it('BandaDrumDocument = vederea cu DRUM_DOCUMENT', () => {
    const a = render(BandaDrumDocument)
    const b = render(BandaDrumDocumentVedere, { continut: DRUM_DOCUMENT })
    expect(a).toBe(b)
    expect(a).toContain(DRUM_DOCUMENT.titlu)
  })

  it('HartaEuropa si MachetaStrat: implicitul e constanta RO', () => {
    expect(render(HartaEuropa)).toBe(render(HartaEuropa, { continut: securitate.BLOC_INFRASTRUCTURA.harta }))
    expect(render(HartaEuropa)).toContain(securitate.BLOC_INFRASTRUCTURA.harta.legenda)
    expect(render(MachetaStrat)).toBe(render(MachetaStrat, { continut: platforma.MACHETA_STRAT }))
    expect(render(MachetaStrat)).toContain(platforma.MACHETA_STRAT.eticheta)
  })
})
