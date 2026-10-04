import { createElement, type ComponentType } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import BandaCifre from '../src/components/acasa/BandaCifre'
import BandaPret from '../src/components/acasa/BandaPret'
import CardEnterprise from '../src/components/acasa/CardEnterprise'
import CardSecuritate from '../src/components/acasa/CardSecuritate'
import FaqAcasa from '../src/components/acasa/FaqAcasa'
import GrilaIndustrii, { type ContinutGrilaIndustrii } from '../src/components/acasa/GrilaIndustrii'
import Testimonial from '../src/components/acasa/Testimonial'
import Erou from '../src/components/erou/Erou'
import FunctionalitatiAcasa from '../src/components/functionalitati-acasa/FunctionalitatiAcasa'
import PasiFunctionalitatiEn from '../src/components/functionalitati-acasa/PasiFunctionalitatiEn'
import CtaFinalInchis from '../src/components/primitive/CtaFinalInchis'
import {
  BANDA_PRET,
  CARD_ENTERPRISE,
  CARD_SECURITATE,
  CIFRE,
  CTA_FINAL,
  EROU,
  FUNCTIONALITATI,
  INDUSTRII,
  INTREBARI,
  TESTIMONIAL,
} from '../src/content/acasa'
import { MACHETA_CAUTARE, MACHETA_PORTAL, MACHETA_REGISTRU, PUNCTE_PISTA } from '../src/content/acasa-functionalitati'
import * as en from '../src/content/en/acasa-componente'

/**
 * FELIA 99 (`editie-start-en`): pagina de start EN compune componentele startului RO cu continutul din
 * `src/content/en/acasa-componente.ts`. Aici se dovedeste partea de CONTINUT si de COMPONENTA, fara build:
 *  1. modulul EN nu poarta nimic din continutul RO al componentelor (dictionarul RO se construieste la rulare, din
 *     constantele pe care componentele le iau implicit), zero diacritice romanesti, zero RON;
 *  2. fiecare componenta, randata cu continutul EN, scoate fiecare sir EN al ei si niciun sir RO;
 *  3. GrilaIndustrii: un card fara legatura e element simplu, fara chevron (decizia 38 pe 3s.md); pe RO, fiecare card
 *     ramane legatura cu chevron; CardEnterprise: tinta EN.
 * HTML-ul servit, scena fara buton, canalele si capturile sunt in `tests/browser/editie-start-en.spec.ts`; HTML-ul si
 * fluxul RSC RO neschimbate le dovedeste invarianta pe build (`tests/invarianta-ro.test.ts`).
 *
 * MARTORII: un sir RO strecurat intr-o copie a continutului EN e prins de detector; un card cu legatura, intr-o copie
 * a grilei EN, primeste inapoi chevronul.
 */

const DIACRITICE = /[ăâîșțşţĂÂÎȘȚŞŢ]/
const RON = new RegExp('\\b' + 'R' + 'ON\\b')

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

/** Textele dintre etichete si valorile etichetelor accesibile, decodate. */
function texteHtml(html: string): string {
  const texte = [...html.matchAll(/>([^<]+)</g)].map((m) => decodeaza(m[1]))
  const atribute = [...html.matchAll(/\s(?:aria-label|title|alt)="([^"]*)"/g)].map((m) => decodeaza(m[1]))
  return [...texte, ...atribute].join('\n')
}

/** Cheile care nu poarta text vizibil: numele iconitelor, codurile de culoare, pozitiile, tintele. */
const CHEI_FARA_TEXT = new Set(['iconita', 'cod', 'pozitie', 'href', 'ruta'])

/** Sirurile unei valori (frunzele de tip sir, recursiv), fara cai, adrese si chei fara text. */
function frunze(valoare: unknown, acc: string[] = []): string[] {
  if (typeof valoare === 'string') {
    const t = valoare.trim()
    if (t !== '' && !/^(\/|#|https?:|mailto:)/.test(t)) acc.push(t)
  } else if (Array.isArray(valoare)) {
    for (const v of valoare) frunze(v, acc)
  } else if (valoare && typeof valoare === 'object') {
    for (const [k, v] of Object.entries(valoare)) if (!CHEI_FARA_TEXT.has(k)) frunze(v, acc)
  }
  return acc
}

/** Dictionarul RO: sirurile de cel putin doua cuvinte sau cu diacritice ale constantelor RO ale startului. */
const DICTIONAR_RO = [
  ...new Set(
    frunze([EROU, FUNCTIONALITATI, CIFRE, INDUSTRII, TESTIMONIAL, CARD_SECURITATE, CARD_ENTERPRISE, BANDA_PRET, INTREBARI, CTA_FINAL, MACHETA_CAUTARE, MACHETA_PORTAL, MACHETA_REGISTRU, PUNCTE_PISTA.grup]).filter(
      (t) => t.split(/\s+/).length >= 2 || DIACRITICE.test(t),
    ),
  ),
]

function scapariRo(text: string): string[] {
  return DICTIONAR_RO.filter((d) => text.includes(d))
}

function render(c: ComponentType<never>, props: Record<string, unknown> = {}): string {
  return renderToStaticMarkup(createElement(c as unknown as ComponentType<Record<string, unknown>>, props))
}

/** Continutul EN pe componente: ce primeste fiecare si ce trebuie sa scoata. */
const PE_COMPONENTE: { nume: string; html: () => string; continut: unknown }[] = [
  { nume: 'Erou', html: () => render(Erou, { continut: en.EROU_EN, lansare: false, butoane: null }), continut: en.EROU_EN },
  {
    nume: 'FunctionalitatiAcasa',
    html: () => render(FunctionalitatiAcasa, { continut: en.FUNCTIONALITATI_EN, pasi: createElement(PasiFunctionalitatiEn) }),
    continut: [en.FUNCTIONALITATI_EN, en.PASI_EN, en.MACHETA_CAUTARE_EN, en.MACHETA_REGISTRU_EN],
  },
  { nume: 'BandaCifre', html: () => render(BandaCifre, { continut: en.CIFRE_EN }), continut: en.CIFRE_EN },
  { nume: 'GrilaIndustrii', html: () => render(GrilaIndustrii, { continut: en.INDUSTRII_EN }), continut: en.INDUSTRII_EN },
  { nume: 'Testimonial', html: () => render(Testimonial, { continut: en.TESTIMONIAL_EN }), continut: en.TESTIMONIAL_EN },
  { nume: 'CardSecuritate', html: () => render(CardSecuritate, { continut: en.CARD_SECURITATE_EN }), continut: en.CARD_SECURITATE_EN },
  { nume: 'CardEnterprise', html: () => render(CardEnterprise, { continut: en.CARD_ENTERPRISE_EN }), continut: en.CARD_ENTERPRISE_EN },
  { nume: 'BandaPret', html: () => render(BandaPret, { continut: en.BANDA_PRET_EN }), continut: en.BANDA_PRET_EN },
  { nume: 'FaqAcasa', html: () => render(FaqAcasa, { continut: en.INTREBARI_EN }), continut: en.INTREBARI_EN },
  {
    nume: 'CtaFinalInchis',
    html: () => render(CtaFinalInchis, { continut: en.CTA_FINAL_EN, id: en.ANCORA_FINAL, butoane: null }),
    // Butonul principal din continut nu se randeaza: pagina pune butonul WhatsApp in `butoane`.
    continut: { ...en.CTA_FINAL_EN, butonPrincipal: null },
  },
]

describe('modulul EN al startului: zero continut RO', () => {
  const toate = frunze(Object.values(en))

  it('dictionarul RO s-a construit si modulul are text (controlul preconditiei)', () => {
    expect(DICTIONAR_RO.length).toBeGreaterThan(60)
    expect(toate.length).toBeGreaterThan(80)
  })

  it('niciun sir RO, nicio diacritica romaneasca, niciun RON in modulul EN', () => {
    const text = toate.join('\n')
    expect(scapariRo(text)).toEqual([])
    expect(toate.filter((t) => DIACRITICE.test(t))).toEqual([])
    expect(RON.test(text)).toBe(false)
  })

  it('martor: un sir RO strecurat intr-o copie a continutului e prins', () => {
    const copie = { ...en.CARD_SECURITATE_EN, text: CARD_SECURITATE.text }
    expect(scapariRo(frunze(copie).join('\n'))).toContain(CARD_SECURITATE.text)
  })
})

describe('componentele startului cu continutul EN', () => {
  for (const c of PE_COMPONENTE) {
    it(c.nume + ': scoate fiecare sir EN primit si niciun sir RO', () => {
      const html = c.html()
      const text = texteHtml(html)
      const lipsa = frunze(c.continut).filter((s) => !text.includes(s))
      expect(lipsa).toEqual([])
      expect(scapariRo(text)).toEqual([])
      expect(DIACRITICE.test(text)).toBe(false)
    })
  }

  it('martor: un sir RO pus in locul unui camp EN apare in scaparile componentei', () => {
    const html = render(BandaPret, { continut: { ...en.BANDA_PRET_EN, fraza: BANDA_PRET.fraza } })
    expect(scapariRo(texteHtml(html))).toContain(BANDA_PRET.fraza)
  })
})

describe('GrilaIndustrii si CardEnterprise pe editie (decizia 59)', () => {
  const chevron = (html: string) => (html.match(/lucide-chevron-right/g) ?? []).length
  const legaturiCard = (html: string) => (html.match(/<a\b[^>]*industrie/g) ?? []).length

  it('RO, fara proprietati: 7 carduri-legatura, fiecare cu chevron (ramura RO neschimbata)', () => {
    const html = render(GrilaIndustrii)
    expect(INDUSTRII.carduri).toHaveLength(7)
    expect(chevron(html)).toBe(7)
    for (const c of INDUSTRII.carduri) expect(html).toContain('href="' + c.href + '"')
  })

  it('EN: 7 carduri fara legatura si fara chevron; cardul "toate" duce la /contact; zero legaturi spre segmente', () => {
    const html = render(GrilaIndustrii, { continut: en.INDUSTRII_EN })
    expect(en.INDUSTRII_EN.carduri).toHaveLength(7)
    expect(chevron(html)).toBe(0)
    expect(legaturiCard(html)).toBe(1)
    expect(html).toContain('href="/contact"')
    expect(html).not.toMatch(/\/solutii|\/solutions/)
  })

  it('martor: acelasi card EN, cu legatura, primeste inapoi chevronul si legatura', () => {
    const copie: ContinutGrilaIndustrii = {
      ...en.INDUSTRII_EN,
      carduri: [{ ...en.INDUSTRII_EN.carduri[0], href: '/contact', ruta: '/contact' }, ...en.INDUSTRII_EN.carduri.slice(1)],
    }
    const html = render(GrilaIndustrii, { continut: copie })
    expect(chevron(html)).toBe(1)
    expect(legaturiCard(html)).toBe(2)
  })

  it('CardEnterprise: RO duce la /securitate, EN la /enterprise, cu eticheta accesibila a editiei', () => {
    expect(render(CardEnterprise)).toContain('href="' + CARD_ENTERPRISE.tinta.href + '"')
    const html = render(CardEnterprise, { continut: en.CARD_ENTERPRISE_EN })
    expect(html).toContain('href="/enterprise"')
    expect(html).toContain('aria-label="' + en.CARD_ENTERPRISE_EN.tinta.text + '"')
  })
})
