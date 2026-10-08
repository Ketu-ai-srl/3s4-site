import { createElement, isValidElement, type ComponentType, type ReactElement, type ReactNode } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import BandaCifre, { type ContinutCifra } from '../src/components/acasa/BandaCifre'
import BandaPret, { type ContinutBandaPret } from '../src/components/acasa/BandaPret'
import CardSecuritate, { type ContinutCardSecuritate } from '../src/components/acasa/CardSecuritate'
import FaqAcasa, { type ContinutFaqAcasa } from '../src/components/acasa/FaqAcasa'
import Testimonial, { type ContinutTestimonial } from '../src/components/acasa/Testimonial'
import Erou, { type ContinutErou } from '../src/components/erou/Erou'
import ScenaErou from '../src/components/erou/ScenaErou'
import FunctionalitatiAcasa, { type ContinutFunctionalitatiAcasa } from '../src/components/functionalitati-acasa/FunctionalitatiAcasa'
import MachetaCautareVedere, { type ContinutMachetaCautare, type MachetaProps } from '../src/components/functionalitati-acasa/MachetaCautareVedere'
import MachetaRegistruVedere, { type ContinutMachetaRegistru } from '../src/components/functionalitati-acasa/MachetaRegistruVedere'
import PasiFunctionalitati from '../src/components/functionalitati-acasa/PasiFunctionalitati'
import PasiFunctionalitatiVedere, { type PunctePista } from '../src/components/functionalitati-acasa/PasiFunctionalitatiVedere'
import CtaFinalInchis, { type ContinutCtaFinal } from '../src/components/primitive/CtaFinalInchis'
import EroulInterior from '../src/components/primitive/EroulInterior'
import FirPagina from '../src/components/primitive/FirPagina'
import { BANDA_PRET, CARD_SECURITATE, CIFRE, CTA_FINAL, EROU, FUNCTIONALITATI, INTREBARI, TESTIMONIAL } from '../src/content/acasa'
import { BIFA_TEXT, ETICHETA_EXEMPLU, MACHETA_CAUTARE, MACHETA_PORTAL, MACHETA_REGISTRU, PUNCTE_PISTA } from '../src/content/acasa-functionalitati'

/**
 * MECANISMUL PE EDITIE AL PIESELOR STARTULUI (felia 98). Componentele startului primesc continutul prin
 * proprietati optionale, cu implicitul RO; insulele client au o vedere fara continut si o invelitoare RO.
 *
 * CE DOVEDESTE PROBA ASTA si ce nu. Aici se dovedeste partea EDITIEI: cu un continut sintetic, componenta
 * scoate exact textul primit si nimic din continutul romanesc. Partea RO (HTML-ul si fluxul RSC neschimbate)
 * NU se dovedeste aici: randarea statica nu vede fluxul RSC, deci ar trece si cu o proprietate `"$undefined"`
 * in flux. Dovada RO e invarianta pe build (`tests/invarianta-ro.test.ts`), pe `/` si pe rutele-martor.
 *
 * DICTIONARUL RO se construieste la rulare, din doua surse: sirurile din constantele RO pe care componentele
 * le iau implicit, si textele (plus etichetele accesibile) din randarea RO a fiecarei componente, fara
 * proprietati. A doua sursa prinde si sirurile scrise direct in componenta, inclusiv cele fara diacritice.
 * Intra sirurile de cel putin doua cuvinte si cele cu diacritice (un cuvant fara diacritice, ca "exemplu",
 * poate exista in ambele limbi si n-ar dovedi nimic).
 *
 * CONTINUTUL SINTETIC se asambleaza la rulare, din prefix si contor, deci proba nu poarta literal niciun text
 * al vreunei editii. MARTORUL: acelasi continut sintetic, cu un singur sir RO strecurat intr-un camp, e prins.
 */

// ---------------------------------------------------------------------------------------------
// Dictionarul RO si detectorul
// ---------------------------------------------------------------------------------------------

const DIACRITICE = /[ăâîșțşţĂÂÎȘȚŞŢ]/

function decodeaza(t: string): string {
  return t
    .replace(/&#x27;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
}

/**
 * Felia 147: titlul eroului leaga ultimele doua cuvinte ale fiecarei propozitii intr-un `<span data-lipit="">`, ca
 * randul sa nu ramana cu un singur cuvant. Legatura nu e text nou (textContent-ul ramane sirul din continut), dar
 * imparte sirul in doua noduri de text; aici se scoate eticheta ei, ca sirul sa se caute intreg, cum il vede omul.
 */
function faraLipire(html: string): string {
  return html.replace(/<span data-lipit="">([^<]*)<\/span>/g, '$1')
}

/** Textele dintre etichete si valorile etichetelor accesibile, decodate, fara goluri. */
function textSiEtichete(html: string): string[] {
  const texte = [...faraLipire(html).matchAll(/>([^<]+)</g)].map((m) => decodeaza(m[1]).trim())
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
// Continutul sintetic
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

const leg = (text: string, href: string) => ({ text, href, ruta: href })

function render(c: ComponentType<never> | ((p: never) => ReactNode), props: Record<string, unknown> = {}): string {
  return renderToStaticMarkup(createElement(c as ComponentType<Record<string, unknown>>, props))
}

type Caz = {
  nume: string
  /** Randarea RO, fara proprietati (implicitul). */
  ro: () => string
  /** Constantele RO pe care componenta le ia implicit. */
  constante: unknown[]
  /** Randarea editiei cu continut sintetic; `strecurat` (daca e dat) inlocuieste un camp text. */
  editie: (strecurat?: string) => { html: string; produse: string[] }
}

const CAZURI: Caz[] = [
  {
    nume: 'Erou',
    ro: () => render(Erou),
    constante: [EROU],
    editie: (strecurat) => {
      const { t, produse } = fabrica()
      const continut: ContinutErou = {
        pastile: { intrebare: { text: strecurat ?? t('pastila'), iconita: 'check' } },
        popover: { randuri: [{ iconita: 'globe', text: t('popover') }], legatura: leg(t('popover-legatura'), '/about') },
        titlu: { primaPropozitie: t('titlu-1'), aDouaInainteDeAccent: t('titlu-2'), accent: t('accent') },
        subtitlu: t('subtitlu'),
        bucla: {
          lobStanga: t('lob-s'),
          lobDreapta: t('lob-d'),
          noduri: [
            { pozitie: 'sus-stanga', eticheta: t('nod'), iconita: 'file-text' },
            { pozitie: 'jos-stanga', eticheta: t('nod'), iconita: 'scan-line' },
            { pozitie: 'sus-dreapta', eticheta: t('nod'), iconita: 'archive' },
            { pozitie: 'jos-dreapta', eticheta: t('nod'), iconita: 'message-square-text' },
          ],
        },
      }
      const buton = t('buton-canal')
      const html = render(Erou, { continut, lansare: false, butoane: createElement('a', { href: '#canal' }, buton) })
      return { html, produse }
    },
  },
  {
    nume: 'BandaCifre',
    ro: () => render(BandaCifre),
    constante: [CIFRE],
    editie: (strecurat) => {
      const { t, produse } = fabrica()
      const continut: ContinutCifra[] = [
        { cifra: '1', eticheta: strecurat ?? t('cifra') },
        { cifra: '2', eticheta: t('cifra') },
      ]
      return { html: render(BandaCifre, { continut }), produse }
    },
  },
  {
    nume: 'BandaPret',
    ro: () => render(BandaPret),
    constante: [BANDA_PRET],
    editie: (strecurat) => {
      const { t, produse } = fabrica()
      const continut: ContinutBandaPret = { titlu: t('titlu'), fraza: strecurat ?? t('fraza'), legatura: leg(t('legatura'), '/pricing') }
      return { html: render(BandaPret, { continut, ancora: 'pricing' }), produse }
    },
  },
  {
    nume: 'CardSecuritate',
    ro: () => render(CardSecuritate),
    constante: [CARD_SECURITATE],
    editie: (strecurat) => {
      const { t, produse } = fabrica()
      const continut: ContinutCardSecuritate = { titlu: t('titlu'), text: strecurat ?? t('text'), legatura: leg(t('legatura'), '/about') }
      return { html: render(CardSecuritate, { continut }), produse }
    },
  },
  {
    nume: 'FaqAcasa',
    ro: () => render(FaqAcasa),
    constante: [INTREBARI],
    editie: (strecurat) => {
      const { t, produse } = fabrica()
      const continut: ContinutFaqAcasa = {
        titlu: t('titlu'),
        intrebari: [
          { intrebare: t('intrebare'), raspuns: strecurat ?? t('raspuns') },
          { intrebare: t('intrebare'), raspuns: t('raspuns') },
        ],
        subsol: { inainte: t('subsol'), posta: leg(t('posta'), '#posta') },
      }
      return { html: render(FaqAcasa, { continut, ancora: 'questions' }), produse }
    },
  },
  {
    nume: 'Testimonial',
    ro: () => render(Testimonial),
    constante: [TESTIMONIAL],
    editie: (strecurat) => {
      const { t, produse } = fabrica()
      const continut: ContinutTestimonial = {
        esteCitat: false,
        fraza: t('fraza'),
        continuare: strecurat ?? t('continuare'),
        atribuire: { rol: t('rol'), firma: t('firma') },
      }
      return { html: render(Testimonial, { continut }), produse }
    },
  },
  {
    nume: 'FunctionalitatiAcasa (cu slotul pasi)',
    ro: () => render(FunctionalitatiAcasa),
    constante: [FUNCTIONALITATI, MACHETA_CAUTARE, MACHETA_PORTAL, MACHETA_REGISTRU, PUNCTE_PISTA.grup],
    editie: (strecurat) => {
      const { t, produse } = fabrica()
      const continut: ContinutFunctionalitatiAcasa = {
        titlu: t('titlu'),
        subtitlu: strecurat ?? t('subtitlu'),
        final: { fraza: t('final'), buton: leg(t('final-buton'), '/contact') },
      }
      const slot = createElement('p', null, t('slot'))
      return { html: render(FunctionalitatiAcasa, { continut, ancora: 'features', pasi: slot }), produse }
    },
  },
  {
    nume: 'CtaFinalInchis (fara buton secundar si fara vizual)',
    ro: () => render(CtaFinalInchis),
    constante: [CTA_FINAL],
    editie: (strecurat) => {
      const { t, produse } = fabrica()
      const continut: ContinutCtaFinal = {
        titlu: t('titlu'),
        subtitlu: t('subtitlu'),
        butonPrincipal: leg(t('buton'), '/contact'),
        microtext: strecurat ?? t('microtext'),
      }
      return { html: render(CtaFinalInchis, { continut, id: 'contact' }), produse }
    },
  },
  {
    nume: 'FirPagina',
    ro: () => render(FirPagina, { niveluri: [{ text: 'A', cale: '/' }, { text: 'B', cale: '/b' }] }),
    constante: [],
    editie: (strecurat) => {
      const { t, produse } = fabrica()
      const html = render(FirPagina, {
        niveluri: [
          { text: t('nivel'), cale: '/' },
          { text: t('nivel'), cale: '/b' },
        ],
        eticheta: strecurat ?? t('eticheta'),
      })
      return { html, produse }
    },
  },
  {
    nume: 'EroulInterior',
    ro: () => render(EroulInterior, { fir: [{ text: 'A', cale: '/' }, { text: 'B', cale: '/b' }], titlu: 'T' }),
    constante: [],
    editie: (strecurat) => {
      const { t, produse } = fabrica()
      const html = render(EroulInterior, {
        fir: [
          { text: t('nivel'), cale: '/' },
          { text: t('nivel'), cale: '/b' },
        ],
        titlu: t('titlu'),
        etichetaFir: strecurat ?? t('eticheta'),
      })
      return { html, produse }
    },
  },
  {
    nume: 'PasiFunctionalitatiVedere (cu machetele vederii)',
    ro: () => render(PasiFunctionalitati, { pasi: FUNCTIONALITATI.pasi }),
    constante: [FUNCTIONALITATI.pasi, MACHETA_CAUTARE, MACHETA_PORTAL, MACHETA_REGISTRU, PUNCTE_PISTA.grup, ETICHETA_EXEMPLU, BIFA_TEXT],
    editie: (strecurat) => {
      const { t, produse } = fabrica()
      const cautare: ContinutMachetaCautare = {
        declaratie: t('declaratie'),
        eticheta: t('eticheta'),
        intrebare: t('intrebare'),
        gasite: t('gasite'),
        insigne: { etichetat: t('insigna') },
        randuri: [0, 1, 2].map((i) => ({
          placuta: 'PDF',
          fisier: 'f' + i + '.pdf',
          tip: { cod: 'factura' as const, text: t('tip') },
          data: '0' + i,
          scanat: true,
          rezumat: { titlu: t('rezumat-titlu'), text: i === 1 && strecurat ? strecurat : t('rezumat') },
        })),
        exemplu: t('exemplu'),
        bifa: '+',
      }
      const registru: ContinutMachetaRegistru = {
        declaratie: t('declaratie'),
        eticheta: t('eticheta'),
        insigna: t('insigna'),
        coloane: [t('col'), t('col'), t('col'), t('col'), t('col')],
        stare: t('stare'),
        randuri: [0, 1, 2].map((i) => ({ nr: '00' + i, fisier: 'r' + i + '.pdf', tip: { cod: 'raport' as const, text: t('tip') }, termen: t('termen') })),
        verificari: [t('verificare'), t('verificare'), t('verificare'), t('verificare')].map((text) => ({ iconita: 'tag' as const, text })),
        exemplu: t('exemplu'),
      }
      const Cautare = (p: MachetaProps) => createElement(MachetaCautareVedere, { ...p, continut: cautare })
      const Registru = (p: MachetaProps) => createElement(MachetaRegistruVedere, { ...p, continut: registru })
      const grup = t('grup')
      const prefix = t('punct')
      const puncte: PunctePista = { grup, punct: (n, total, e) => prefix + ' ' + n + '/' + total + ' ' + e }
      const pasi = (['01', '02', '03'] as const).map((numar) => ({ numar, eticheta: t('pas-eticheta'), titlu: t('pas-titlu'), paragraf: t('pas-paragraf') }))
      // Pasul 2 fara macheta: editia poate scoate o macheta (pe 3s.md, portalul), forma ramane.
      const html = render(PasiFunctionalitatiVedere, { pasi, machete: [Cautare, undefined, Registru], puncte })
      return { html, produse }
    },
  },
]

describe('mecanismul pe editie: continut sintetic, zero text RO', () => {
  for (const caz of CAZURI) {
    describe(caz.nume, () => {
      const htmlRo = caz.ro()
      const dict = dictionar(htmlRo, ...caz.constante)

      it('dictionarul RO s-a construit (controlul preconditiei)', () => {
        expect(dict.length, 'siruri RO in dictionar').toBeGreaterThan(0)
        // Randarea RO contine ea insasi sirurile din dictionar luate din randare: detectorul vede RO.
        expect(scapari(htmlRo, dict).length).toBeGreaterThan(0)
      })

      it('scoate fiecare sir sintetic primit si niciun sir RO', () => {
        const { html, produse } = caz.editie()
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
// Ramurile conditionale si proprietatile spre componentele client
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

function propsScena(radacina: unknown): Record<string, unknown> {
  const scene = elemente(radacina).filter((e) => e.type === ScenaErou)
  expect(scene.length, 'un singur ScenaErou in arbore').toBe(1)
  return scene[0].props as Record<string, unknown>
}

describe('Erou: proprietatile spre ScenaErou (componenta client)', () => {
  it('pe RO, ScenaErou nu primeste cheia `lansare` si primeste centrul ca pana acum', () => {
    const p = propsScena(Erou({}))
    expect('lansare' in p).toBe(false)
    expect(p.etichetaCentru).toBe(EROU.bucla.centru.eticheta)
    expect(p.pastilaCentru).toBe(EROU.bucla.centru.pastila)
    expect(p.legenda).not.toBeNull()
  })

  it('`lansare={undefined}` trimis explicit nu ajunge ca cheie (raspandirea conditionata)', () => {
    const p = propsScena(Erou({ lansare: undefined }))
    expect('lansare' in p).toBe(false)
  })

  it('`lansare={false}` ajunge ca `false`; fara centru si legenda, cheile centrului lipsesc', () => {
    const { bucla, ...rest } = EROU
    const continut: ContinutErou = { ...rest, bucla: { lobStanga: bucla.lobStanga, lobDreapta: bucla.lobDreapta, noduri: bucla.noduri } }
    const p = propsScena(Erou({ continut, lansare: false }))
    expect(p.lansare).toBe(false)
    expect('etichetaCentru' in p).toBe(false)
    expect('pastilaCentru' in p).toBe(false)
    expect(p.legenda).toBeNull()
  })

  it('nicio proprietate cu valoarea `undefined` spre ScenaErou, pe RO si pe editie', () => {
    for (const radacina of [Erou({}), Erou({ lansare: false })]) {
      const p = propsScena(radacina)
      const nedefinite = Object.entries(p).filter(([, v]) => v === undefined).map(([k]) => k)
      expect(nedefinite).toEqual([])
    }
  })
})

describe('ramurile optionale pastreaza RO si scot campul pe editie', () => {
  it('Erou: fara pastila-legatura, nota, butoane si legenda, nimic din ele nu se randeaza', () => {
    const html = render(Erou, {
      continut: { ...EROU, pastile: { intrebare: EROU.pastile.intrebare }, nota: undefined, butonPrincipal: undefined, butonSecundar: undefined, bucla: { ...EROU.bucla, legenda: undefined } },
    })
    expect(html).not.toContain(EROU.pastile.legatura.text)
    expect(html).not.toContain(EROU.nota)
    expect(html).not.toContain(EROU.butonPrincipal.text)
    expect(html).not.toContain(EROU.bucla.legenda)
    // Control: aceeasi randare, cu RO intreg, le are pe toate.
    const ro = render(Erou)
    for (const t of [EROU.pastile.legatura.text, EROU.nota, EROU.butonPrincipal.text, EROU.bucla.legenda]) expect(ro).toContain(t)
  })

  it('Erou: slotul `butoane` inlocuieste butoanele implicite', () => {
    const { t } = fabrica()
    const marca = t('slot')
    const html = render(Erou, { butoane: createElement('span', null, marca) })
    expect(html).toContain(marca)
    expect(html).not.toContain(EROU.butonPrincipal.text)
    expect(html).not.toContain(EROU.butonSecundar.text)
  })

  it('CtaFinalInchis: fara buton secundar si vizual, nici butonul, nici figura; `butoane` inlocuieste', () => {
    const { butonSecundar, vizual, ...rest } = CTA_FINAL
    const html = render(CtaFinalInchis, { continut: rest })
    expect(html).not.toContain(butonSecundar.text)
    expect(html).not.toContain(vizual.declaratie)
    expect(html).not.toContain('<figure')
    expect(render(CtaFinalInchis)).toContain('<figure')
    const { t } = fabrica()
    const marca = t('slot')
    const cuSlot = render(CtaFinalInchis, { butoane: createElement('span', null, marca) })
    expect(cuSlot).toContain(marca)
    expect(cuSlot).not.toContain(CTA_FINAL.butonPrincipal.text)
  })

  it('FunctionalitatiAcasa: fara slot ramane partea vie RO; cu slot, partea vie RO lipseste', () => {
    const ro = render(FunctionalitatiAcasa)
    const cuSlot = render(FunctionalitatiAcasa, { pasi: createElement('p', null, 'slot') })
    for (const p of FUNCTIONALITATI.pasi) {
      expect(ro).toContain(p.titlu)
      expect(cuSlot).not.toContain(p.titlu)
    }
    expect(ro).toContain(MACHETA_CAUTARE.eticheta)
    expect(cuSlot).not.toContain(MACHETA_CAUTARE.eticheta)
  })

  it('MachetaCautareVedere: fara eticheta insignei de scanare, insigna nu apare la niciun rand', () => {
    const cu = render(MachetaCautareVedere, { activ: false, continut: { ...MACHETA_CAUTARE, exemplu: ETICHETA_EXEMPLU, bifa: BIFA_TEXT } })
    const fara = render(MachetaCautareVedere, {
      activ: false,
      continut: { ...MACHETA_CAUTARE, insigne: { etichetat: MACHETA_CAUTARE.insigne.etichetat }, exemplu: ETICHETA_EXEMPLU, bifa: BIFA_TEXT },
    })
    expect(cu).toContain(MACHETA_CAUTARE.insigne.scanat)
    expect(fara).not.toContain(MACHETA_CAUTARE.insigne.scanat)
  })
})

describe('invelitorile RO randeaza exact ce randa vederea cu continutul RO', () => {
  it('MachetaCautare = vederea cu MACHETA_CAUTARE', async () => {
    const { default: MachetaCautare } = await import('../src/components/functionalitati-acasa/MachetaCautare')
    const a = render(MachetaCautare, { activ: false })
    const b = render(MachetaCautareVedere, { activ: false, continut: { ...MACHETA_CAUTARE, exemplu: ETICHETA_EXEMPLU, bifa: BIFA_TEXT } })
    expect(a).toBe(b)
    expect(a).toContain(MACHETA_CAUTARE.intrebare)
  })

  it('MachetaRegistru = vederea cu MACHETA_REGISTRU', async () => {
    const { default: MachetaRegistru } = await import('../src/components/functionalitati-acasa/MachetaRegistru')
    const a = render(MachetaRegistru, { activ: false })
    const b = render(MachetaRegistruVedere, { activ: false, continut: { ...MACHETA_REGISTRU, exemplu: ETICHETA_EXEMPLU } })
    expect(a).toBe(b)
    expect(a).toContain(MACHETA_REGISTRU.insigna)
  })
})
