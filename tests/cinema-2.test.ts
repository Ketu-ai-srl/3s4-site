import { readFileSync } from 'node:fs'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import PaginaMobila from '../src/app/functionalitati/aplicatie-mobila/page'
import PaginaEFacturi from '../src/app/functionalitati/e-facturi-si-avize/page'
import PaginaSemnatura from '../src/app/functionalitati/semnatura-calificata/page'
import { pragSegment } from '../src/components/functionalitati/aplicatie-mobila/ZiuaTeren'
import { ecranUrmator } from '../src/components/functionalitati/aplicatie-mobila/Telefon'
import { OPACITATI_FLUX, PRAG_GENERATOR } from '../src/components/functionalitati/e-facturi-si-avize/Generator'
import * as MOBILA from '../src/content/functionalitati/aplicatie-mobila'
import * as EFACTURI from '../src/content/functionalitati/e-facturi-si-avize'
import * as SEMNATURA from '../src/content/functionalitati/semnatura-calificata'
import { RUTE } from '../src/content/rute'

/**
 * Probele feliei `cinema-2` care nu cer navigator: starea statica a celor trei pagini randate pe server,
 * formulele machetelor contra punctelor masurate in fise, regulile continutului (lungimi SEO, date
 * fictive care nu pot fi ale nimanui, un singur h1) si decizia D4c pe pagina semnaturii calificate.
 *
 * ASTEPTARILE VIN DIN FISE si din decizii, nu din cod: contorul de zile si amprenta pe punctele citate in
 * fisa semnaturii, pragul generatorului pe intervalul masurat (0,193-0,258), ciclul telefonului pe ordinea
 * masurata. Unde 3S se abate declarat de la referinta (scara stransa, virgula zecimala), proba spune
 * abaterea.
 */

const PAGINI = {
  '/functionalitati/e-facturi-si-avize': renderToStaticMarkup(createElement(PaginaEFacturi)),
  '/functionalitati/aplicatie-mobila': renderToStaticMarkup(createElement(PaginaMobila)),
  '/functionalitati/semnatura-calificata': renderToStaticMarkup(createElement(PaginaSemnatura)),
} as const

const text = (html: string) =>
  html
    .replace(/<script[\s\S]*?<\/script>/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')

/** Cifra de control a unui cod fiscal romanesc (cheia 753217532, suma x 10 mod 11, 10 devine 0). */
function cifraControlCui(corp: string): number {
  const cheie = '753217532'
  let suma = 0
  for (let i = 0; i < corp.length; i++) {
    suma += Number(corp[corp.length - 1 - i]) * Number(cheie[cheie.length - 1 - i])
  }
  return ((suma * 10) % 11) % 10
}

function cuiValid(cod: string): boolean {
  const cifre = cod.replace(/\D/g, '')
  if (cifre.length < 2 || cifre.length > 10) return false
  return Number(cifre.slice(-1)) === cifraControlCui(cifre.slice(0, -1))
}

describe('formulele machetelor, contra fiselor', () => {
  it('contorul de zile: 4p la referinta, aici 5p cu virgula; intreg sub 1, o zecimala de la 1', () => {
    expect(SEMNATURA.zileLa(0)).toBe('0')
    expect(SEMNATURA.zileLa(0.1)).toBe('1')
    expect(SEMNATURA.zileLa(0.3)).toBe('1,5')
    expect(SEMNATURA.zileLa(1)).toBe(String(SEMNATURA.ZILE_TOTAL) + ',0')
    expect(SEMNATURA.zileLa(2)).toBe(String(SEMNATURA.ZILE_TOTAL) + ',0')
  })

  it('amprenta se scrie cu derularea: punctele masurate in fisa S4', () => {
    // fisa: 5 la p 0,189, 15 la 0,256, 24 la 0,323, 34 la 0,389; 0 la p 0,1; plina de la ~0,6
    expect(SEMNATURA.caractereAmprenta(0.189)).toBe(5)
    expect(SEMNATURA.caractereAmprenta(0.256)).toBe(15)
    expect(SEMNATURA.caractereAmprenta(0.323)).toBe(24)
    expect(SEMNATURA.caractereAmprenta(0.389)).toBe(33) // fisa 34: masurat cu tranzitie, formula da 33,99
    expect(SEMNATURA.caractereAmprenta(0.1)).toBe(0)
    expect(SEMNATURA.caractereAmprenta(0.75)).toBe(64)
    expect(SEMNATURA.AMPRENTA).toMatch(/^[0-9a-f]{64}$/)
  })

  it('pragul "o singura data" al generatorului sta in intervalul masurat (0,193-0,258)', () => {
    expect(PRAG_GENERATOR).toBeGreaterThan(0.193)
    expect(PRAG_GENERATOR).toBeLessThanOrEqual(0.258)
    expect(SEMNATURA.PRAG_LOT).toBeGreaterThan(0.233)
    expect(SEMNATURA.PRAG_LOT).toBeLessThanOrEqual(0.293)
  })

  it('randurile fluxului descresc, iar ultimul ramane peste pragul de citire', () => {
    expect([...OPACITATI_FLUX]).toEqual([...OPACITATI_FLUX].sort((a, b) => b - a))
    expect(Math.min(...OPACITATI_FLUX)).toBeGreaterThanOrEqual(0.75)
  })

  it('segmentele zilei se incheie pana la p ~0,46 (scara stransa, abaterea declarata)', () => {
    const ultim = MOBILA.ZIUA.segmente.length - 1
    expect(pragSegment(0)).toBe(0.05)
    expect(pragSegment(ultim) + 1 / 6).toBeLessThanOrEqual(0.47)
  })

  it('ziua din exemplu se aduna: 610 minute, iar statisticile sunt sumele segmentelor', () => {
    const s = MOBILA.ZIUA.segmente
    const suma = (fel: string) => s.filter((x) => x.fel === fel).reduce((t, x) => t + MOBILA.minuteDin(x.durata), 0)
    expect(s.reduce((t, x) => t + MOBILA.minuteDin(x.durata), 0)).toBe(610)
    for (const st of MOBILA.ZIUA.statistici) expect(MOBILA.minuteDin(st.valoare), st.eticheta).toBe(suma(st.fel))
    expect(MOBILA.minuteDin(MOBILA.ZIUA.contorValoare)).toBe(suma('acte'))
  })

  it('ciclul telefonului: 1 -> 2 -> 3 -> 1, la 3,5 s', () => {
    expect([0, 1, 2].map(ecranUrmator)).toEqual([1, 2, 0])
    expect(MOBILA.ECRAN_MS).toBe(3500)
  })
})

describe('starea statica, randata pe server', () => {
  it('fiecare pagina are un singur h1', () => {
    for (const [cale, html] of Object.entries(PAGINI)) {
      expect((html.match(/<h1[\s>]/g) ?? []).length, cale).toBe(1)
    }
  })

  it('textele scrise sunt intregi: cererile din terminal si amprenta', () => {
    expect(text(PAGINI['/functionalitati/e-facturi-si-avize'])).toContain(EFACTURI.EROU_E_FACTURI.cerere)
    expect(text(PAGINI['/functionalitati/aplicatie-mobila'])).toContain(MOBILA.EROU_MOBILA.cerere)
    const semnatura = text(PAGINI['/functionalitati/semnatura-calificata'])
    expect(semnatura).toContain(SEMNATURA.EROU_SEMNATURA.cerere)
    expect(semnatura).toContain(SEMNATURA.AMPRENTA)
  })

  it('piesele cu prag stau in starea finala: generatorul, lotul, contorul', () => {
    const ef = PAGINI['/functionalitati/e-facturi-si-avize']
    expect(ef).toContain('data-prag="static"')
    expect(ef).not.toContain('data-prag="asteapta"')
    const sc = text(PAGINI['/functionalitati/semnatura-calificata'])
    expect(sc).toContain(SEMNATURA.TOTAL_LOT + ' / ' + SEMNATURA.TOTAL_LOT + ' · ' + SEMNATURA.LOT.butonFinal)
    expect(sc).not.toContain(SEMNATURA.LOT.stareInitiala)
    expect(sc).toContain(SEMNATURA.zileLa(1) + ' ' + SEMNATURA.DRUM.unitate)
  })

  it('telefonul porneste pe primul ecran', () => {
    const html = PAGINI['/functionalitati/aplicatie-mobila']
    expect(html).toContain('data-ecran="1"')
    expect(text(html)).toContain(MOBILA.TELEFON.ecrane[0].legenda)
  })

  it('fiecare macheta isi declara datele ca exemplu', () => {
    for (const [cale, html] of Object.entries(PAGINI)) {
      const machete = (html.match(/data-macheta="/g) ?? []).length
      const declaratii = (html.match(/<figcaption class="doar-cititor">Exemplu/g) ?? []).length
      expect(machete, cale).toBeGreaterThanOrEqual(2)
      expect(declaratii, cale).toBeGreaterThanOrEqual(machete)
    }
  })

  it('CTA-ul duce la inregistrare numai cand ruta exista; altfel ramane inert; nicio alta legatura in corp', () => {
    const caiExistente = new Set(RUTE.map((r) => r.cale))
    for (const [cale, html] of Object.entries(PAGINI)) {
      const legaturi = [...html.matchAll(/<a\s[^>]*href="([^"]+)"/g)].map((m) => m[1])
      for (const href of legaturi) expect(caiExistente.has(href) || href.startsWith('#'), cale + ' -> ' + href).toBe(true)
      if (caiExistente.has('/inregistrare')) expect(legaturi, cale).toContain('/inregistrare')
      else expect(html, cale).toContain('data-tinta-lipsa="/inregistrare"')
    }
  })

  it('butoanele din machete sunt decorative: niciun <button> in corpul paginilor', () => {
    for (const [cale, html] of Object.entries(PAGINI)) expect(html.includes('<button'), cale).toBe(false)
  })
})

describe('decizia D4c: semnatura calificata nu e disponibila azi', () => {
  const t = text(PAGINI['/functionalitati/semnatura-calificata'])

  it('pagina spune "integrare in curs cu furnizorii acreditati" in pivot, in machete si in CTA', () => {
    expect(SEMNATURA.IN_CURS).toBe('integrare în curs cu furnizorii acreditați')
    const aparitii = t.split(SEMNATURA.IN_CURS).length - 1
    expect(aparitii).toBeGreaterThanOrEqual(4)
    expect(t).toContain(SEMNATURA.PIVOT_SEMNATURA.linie)
  })

  it('coloana a doua a contrastului spune in card ca e integrare in curs, nu starea de azi', () => {
    const acum = SEMNATURA.CONTRAST_SEMNATURA.acum
    expect(acum.titlu).not.toBe('Acum')
    expect(acum.subtitlu).toBe(SEMNATURA.IN_CURS)
    expect(acum.metrici[0]).toMatchObject({ cheie: 'Integrare', valoare: 'în curs' })
    expect(t).toContain(acum.stampila)
  })

  it('nicio stare nu spune ca s-a semnat calificat prin 3S', () => {
    // Formele care ar sugera semnarea facuta azi; "semnat" apare doar in cererea din terminal si in desene
    // ca adjectiv al exemplarului de hartie. Se cauta cuvintele de stare ale referintei.
    for (const interzis of ['· semnat', 'Semnat ', 'valabil juridic', 'Semnează selectate', 'Re-semnează tot']) {
      expect(t.includes(interzis), interzis).toBe(false)
    }
    // Control: detectorul prinde forma cand ea exista.
    expect(('18 / 18 · semnat').includes('· semnat')).toBe(true)
  })

  it('niciun emitent real de certificate numit: emitentul e generic', () => {
    expect(SEMNATURA.SIGILIU.randuri.emitent.valoare).toMatch(/prestator calificat/)
    expect(SEMNATURA.CONTRAST_SEMNATURA.acum.emitent).toBe('prestator calificat')
  })

  it('nota legala are sursa primara langa ea', () => {
    expect(SEMNATURA.NOTA_LEGALA.sursa).toMatch(/^https:\/\/eur-lex\.europa\.eu\/.*32014R0910/)
    expect(SEMNATURA.NOTA_LEGALA.text).toContain('910/2014, art. 25 alin. (2)')
  })
})

describe('continutul', () => {
  const meta = [EFACTURI.META_E_FACTURI, MOBILA.META_APLICATIE_MOBILA, SEMNATURA.META_SEMNATURA]

  it('titlurile au 15-65 de caractere, descrierile 50-160', () => {
    for (const m of meta) {
      expect(m.titlu.length, m.titlu).toBeGreaterThanOrEqual(15)
      expect(m.titlu.length, m.titlu).toBeLessThanOrEqual(65)
      expect(m.descriere.length, m.descriere).toBeGreaterThanOrEqual(50)
      expect(m.descriere.length, m.descriere).toBeLessThanOrEqual(160)
    }
  })

  it('codul fiscal din generator are cifra de control gresita, deci nu e al nimanui', () => {
    const rand = EFACTURI.GENERATOR.meta.find((r) => r.cheie === 'CUI')
    const cod = rand?.valoare ?? ''
    expect(cod.replace(/\D/g, '').length).toBeGreaterThanOrEqual(6)
    expect(cuiValid(cod)).toBe(false)
    const corp = cod.replace(/\D/g, '').slice(0, -1)
    expect(cuiValid(corp + String(cifraControlCui(corp)))).toBe(true)
  })

  it('machetele cu date de firma poarta eticheta vizibila "exemplu" (D11)', () => {
    expect(PAGINI['/functionalitati/e-facturi-si-avize']).toMatch(/>exemplu</)
    expect(PAGINI['/functionalitati/semnatura-calificata']).toMatch(/>exemplu</)
  })

  it('nicio liniuta lunga in HTML-ul paginilor, nici in atribute', () => {
    const liniute = new RegExp('[' + String.fromCharCode(0x2013, 0x2014) + ']')
    for (const [cale, html] of Object.entries(PAGINI)) expect(liniute.test(html), cale).toBe(false)
    expect(liniute.test('a ' + String.fromCharCode(0x2014) + ' b')).toBe(true)
  })

  it('nicio marca de sistem de operare in text: platformele se scriu generic', () => {
    const marci = new RegExp('\\b(' + ['i' + 'OS', 'mac' + 'OS', 'App ' + 'Store', 'Go' + 'ogle Play'].join('|') + ')\\b')
    for (const [cale, html] of Object.entries(PAGINI)) expect(marci.test(text(html)), cale).toBe(false)
    expect(marci.test('pe ' + 'i' + 'OS')).toBe(true)
  })

  it('registrul feliei acopera cele trei pagini, cu stari cunoscute', () => {
    const registru = JSON.parse(readFileSync('src/content/afirmatii/cinema-2.json', 'utf8')) as Array<{
      unde: string
      stare: string
      sursa: string
      confirmat_de: string
    }>
    const unde = registru.map((a) => a.unde).join(', ')
    for (const f of ['e-facturi-si-avize.ts', 'aplicatie-mobila.ts', 'semnatura-calificata.ts']) {
      expect(unde).toContain('src/content/functionalitati/' + f)
    }
    for (const a of registru) {
      expect(['confirmat', 'neconfirmat', 'retras']).toContain(a.stare)
      if (a.stare === 'confirmat') {
        expect(a.sursa.length).toBeGreaterThan(20)
        expect(a.confirmat_de.length).toBeGreaterThan(0)
      }
    }
  })

  it('rutele feliei sunt in RUTE, sub marcajul ei', () => {
    const textRute = readFileSync('src/content/rute.ts', 'utf8')
    const start = textRute.indexOf('// <<felie:cinema-2>>')
    const stop = textRute.indexOf('// <<felie:', start + 5)
    expect(start).toBeGreaterThan(0)
    expect(stop).toBeGreaterThan(start)
    const cai = [...textRute.slice(start, stop).matchAll(/cale: "([^"]+)"/g)].map((m) => m[1])
    expect(cai).toEqual(['/functionalitati/semnatura-calificata', '/functionalitati/aplicatie-mobila', '/functionalitati/e-facturi-si-avize'])
  })
})
