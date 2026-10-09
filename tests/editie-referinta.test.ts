import { createElement, type ComponentType } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import EFacturare from '../src/app/e-facturare/page'
import PaginaG1 from '../src/app/(en)/guides/e-invoice-archiving-eu/page.en'
import TabelMarcaje from '../src/components/comparatii/TabelMarcaje'
import MachetaDrumFactura from '../src/components/efacturare/MachetaDrumFactura'
import Rigla11Ani from '../src/components/efacturare/Rigla11Ani'
import { EFACTURARE_RO } from '../src/components/efacturare/SectiuniEfacturare'
import EroulInstrument from '../src/components/termene/EroulInstrument'
import IesiriTermene from '../src/components/termene/IesiriTermene'
import PanouTara from '../src/components/termene/PanouTara'
import { COMPARATIE_DRIVE } from '../src/content/comparatii'
import * as comparatie from '../src/content/en/compare-3s-vs-google-and-box'
import * as efacturi from '../src/content/en/guides-e-invoice-archiving-eu'
import * as moldova from '../src/content/en/guides-records-retention-moldova'
import { MOLDOVA } from '../src/content/termene/moldova'

/**
 * Mecanismul pe editie al feliei editie-referinta (decizia 53, specificatia de congruenta 2.2): componentele perechilor
 * G1-G3 primesc continutul prin proprietati optionale, cu implicitul romanesc. Proba de aici masoara, pe randarea
 * statica, ca fara proprietati componentele dau textul romanesc de azi, iar cu continutul EN dau textul EN si niciun
 * sir romanesc al componentei. Dovada ca HTML-ul si fluxul RSC al paginilor RO raman aceleasi e invarianta pe build
 * (`tests/invarianta-ro.test.ts`, fixturile `/e-facturare`, `/comparatie-drive`, `/comparatie-stocare`,
 * `/instrumente/termene-pastrare` si `/tipar`), nu randarea de aici, care nu vede fluxul.
 *
 * Martorii: fiecare pereche de cazuri (RO / EN) e propriul control: acelasi sir e cautat pe ambele randari, deci un
 * "lipseste pe EN" nu poate veni dintr-o citire goala.
 */

const r = (c: ComponentType<Record<string, unknown>>, props: Record<string, unknown> = {}): string =>
  renderToStaticMarkup(createElement(c, props)).replace(/&#x27;/g, "'")

const FEREASTRA_RO = '(se deschide într-o fereastră nouă)'

describe('TabelMarcaje: legenda, eticheta ei si sufixul ferestrei noi', () => {
  it('fara proprietati: textul romanesc; cu cele EN: textul EN si niciun sir romanesc al componentei', () => {
    const ro = r(TabelMarcaje as ComponentType<Record<string, unknown>>, { tabel: COMPARATIE_DRIVE.tabel })
    expect(ro).toContain('aria-label="Legenda marcajelor"')
    expect(ro).toContain(FEREASTRA_RO)
    expect(ro).toContain('>Parțial<')
    const en = r(TabelMarcaje as ComponentType<Record<string, unknown>>, {
      tabel: comparatie.TABEL_EN,
      surseSuplimentare: comparatie.SURSE_CARD_EN,
      legenda: comparatie.LEGENDA_EN,
      etichetaLegenda: comparatie.ETICHETA_LEGENDA_EN,
      fereastraNoua: comparatie.FEREASTRA_NOUA_EN,
    })
    // Felia 150: "ratings", nu "marks" (marks se citeste note scolare sau marci).
    expect(en).toContain('aria-label="Key to the ratings"')
    expect(en).toContain('(opens in a new window)')
    expect(en).toContain('>Partial<')
    expect(en).toContain('Drive: yes.')
    for (const sir of ['Legenda marcajelor', FEREASTRA_RO, 'Parțial', '>Da<', '>Nu<']) expect(en, sir).not.toContain(sir)
    // Doua randuri in tabel, plus grupul de surse al cardului in caseta pliata.
    expect(en.match(/<tr>/g)).toHaveLength(3)
    expect(en).toContain('Card: what Google Drive covers')
  })
})

describe('termenele: eroul, panoul tarii si iesirile', () => {
  it('fara proprietati: textul romanesc; cu cele EN: textul EN si niciun sir romanesc al componentelor', () => {
    const ro = r(EroulInstrument) + r(PanouTara as ComponentType<Record<string, unknown>>, { tara: MOLDOVA }) + r(IesiriTermene)
    for (const sir of ['Fir de navigare', 'Termen confirmat pentru 6 din 7 acte', 'De când curge termenul', FEREASTRA_RO, 'Facturi de intrare și ieșire', 'Tabelul de tipărit']) {
      expect(ro, sir).toContain(sir)
    }
    const en =
      r(EroulInstrument as ComponentType<Record<string, unknown>>, { continut: moldova.EROU_EN }) +
      r(PanouTara as ComponentType<Record<string, unknown>>, { tara: moldova.MOLDOVA_EN, continut: moldova.PANOU_EN }) +
      r(IesiriTermene as ComponentType<Record<string, unknown>>, { iesiri: moldova.IESIRI_EN })
    for (const sir of ['aria-label="Breadcrumb"', 'Term confirmed for 6 of 7 record types', 'Counted from', '(opens in a new window)', 'Purchase and sales invoices', 'E-invoice archiving in the EU']) {
      expect(en, sir).toContain(sir)
    }
    for (const sir of ['Fir de navigare', 'Termen confirmat', 'De când curge termenul', FEREASTRA_RO, 'Facturi de intrare', 'Tabelul de tipărit']) expect(en, sir).not.toContain(sir)
  })
})

describe('e-facturare: macheta, rigla si sectiunile', () => {
  it('macheta: eticheta de exemplu si canalele, pe editie', () => {
    const ro = r(MachetaDrumFactura)
    expect(ro).toContain('>Exemplu<')
    expect(ro.match(/efacturare_drumCanal|_drumCanal_/g)?.length).toBe(5)
    const en = r(MachetaDrumFactura as ComponentType<Record<string, unknown>>, { continut: efacturi.EFACTURARE_EN.macheta })
    expect(en).toContain('>Example<')
    expect(en).not.toContain('>Exemplu<')
    expect(en.match(/efacturare_drumCanal|_drumCanal_/g)?.length).toBe(1)
  })

  it('rigla: textul pentru cititorul de ecran e romanesc fara `descriere` si cel al editiei cu ea', () => {
    const baza = { fisier: 'F.xml', eticheta: 'e', banda: 'b', anStart: 2026, aniScala: 11, aniPastrare: 8 }
    expect(r(Rigla11Ani as ComponentType<Record<string, unknown>>, baza)).toContain('Scala anilor: de la 2026 la 2037; păstrarea din exemplu ține până în 2034.')
    const en = r(Rigla11Ani as ComponentType<Record<string, unknown>>, { ...baza, descriere: efacturi.EFACTURARE_EN.rigla.descriere })
    expect(en).toContain('Year scale: 2026 to 2037; the example is kept until 2034.')
    expect(en).not.toContain('Scala anilor')
  })

  it('pagina RO pastreaza calendarul si cele trei surse ale randului Romaniei; ghidul EN le scoate (lista declarata a lui G1)', () => {
    const ro = r(EFacturare)
    expect(ro).toMatch(/_calendarButon_/)
    expect(ro).toContain('href="' + EFACTURARE_RO.tabel.calendar!.cale + '"')
    const randRo = ro.slice(ro.indexOf('id="romania"'), ro.indexOf('id="uniunea-europeana"'))
    expect(randRo.match(/_sursaLegatura_/g)).toHaveLength(3)
    const en = r(PaginaG1)
    expect(en).not.toMatch(/_calendar(Buton|Titlu|Text)?_/)
    const randEn = en.slice(en.indexOf('id="romania"'), en.indexOf('id="european-union"'))
    expect(randEn.match(/_sursaLegatura_/g)).toHaveLength(1)
    // Aceleasi 11 sectiuni inainte de blocul de final, in aceeasi ordine a etichetelor (aria-labelledby).
    const etichete = (h: string) => [...h.matchAll(/<section[^>]*aria-labelledby="(efacturare-[a-z]+)"/g)].map((m) => m[1])
    expect(etichete(en)).toEqual(etichete(ro))
    expect(etichete(ro)).toHaveLength(10)
  })
})
