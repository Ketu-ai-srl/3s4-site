import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { FORMAT_ROMANESC } from '../src/components/preturi/calcul'
import BirouInteractiv from '../src/components/preturi/BirouInteractiv'
import { FORMAT_EN, PacheteEn, PliuriEn, textTeaserEn } from '../src/components/preturi/PreturiEn'
import TabelPlanuri from '../src/components/preturi/TabelPlanuri'
import { ECHIVALENTE } from '../src/content/echivalente'
import * as contactEn from '../src/content/en/contact-componente'
import * as enterpriseEn from '../src/content/en/enterprise-componente'
import * as pricing from '../src/content/en/pricing'
import * as pretEn from '../src/content/en/pricing-componente'
import * as contactRoMd from '../src/content/ro-md/contact-componente'

/**
 * Paginile P08 `/pricing`, P09 `/enterprise`, P10 `/contact` si `/ro/contact` pe editiile 3s.md (felia 104): aceleasi
 * componente ca perechile RO (decizia 53), cu continutul editiei in `*-componente.ts`. Proba masoara pe SURSA si pe
 * randarea statica a pieselor: sumele in EUR ale grilei decise (decizia 18) si formatul american al cifrelor, insigna pe
 * Starter (decizia 59), propozitia TVA (decizia 24), intrebarile aprobate ale fisei, si ce nu are voie sa intre (RON,
 * functiile deciziei 43, AES si TLS, Germania, legatura de apel). Paginile servite (forma fata de RO, RON in bucatile
 * JS cerute dupa interactiuni, JSON-LD) le masoara `tests/browser/editie-preturi-enterprise-contact.spec.ts` si
 * `tests/browser/congruenta.spec.ts`, pe copia 3s.md.
 *
 * Fixturile cazurilor pozitive (cuvintele interzise) se asambleaza la rulare, din bucati.
 */

const RADACINA = join(__dirname, '..')
const citeste = (...cale: string[]) => readFileSync(join(RADACINA, ...cale), 'utf8')

/** Toate sirurile dintr-o valoare (frunzele de tip sir, recursiv), cu functiile chemate pe argumente de proba. */
function siruri(valoare: unknown, acc: string[] = []): string[] {
  if (typeof valoare === 'string') acc.push(valoare)
  else if (Array.isArray(valoare)) for (const v of valoare) siruri(v, acc)
  else if (valoare && typeof valoare === 'object') for (const v of Object.values(valoare)) siruri(v, acc)
  return acc
}

const MODULE = [
  { nume: 'src/content/en/pricing-componente.ts', modul: pretEn as Record<string, unknown> },
  { nume: 'src/content/en/enterprise-componente.ts', modul: enterpriseEn as Record<string, unknown> },
  { nume: 'src/content/en/contact-componente.ts', modul: contactEn as Record<string, unknown> },
  { nume: 'src/content/ro-md/contact-componente.ts', modul: contactRoMd as Record<string, unknown> },
]

/** Textul unui modul: sirurile exportate plus rezultatele functiilor lui de continut, pe argumente de proba. */
function textModul(m: Record<string, unknown>): string {
  const extra: string[] = []
  if (m === pretEn) {
    for (const p of pretEn.PLANURI_EN) extra.push(...siruri(pretEn.randuriPlanEn(p)))
    extra.push(pretEn.CALCULATOR_EN.teaser.presupuneri('4 people', '25 minutes'), pretEn.CALCULATOR_EN.pesteConturi.inainte(25))
  }
  if (m === contactEn) extra.push(contactEn.subtitluContactEn('+373 60 055 599', ''))
  if (m === contactRoMd) extra.push(contactRoMd.subtitluContactRoMd('+373 60 055 599', ''))
  return [...siruri(Object.values(m)), ...extra].join('\n')
}

const WA = 'Whats' + 'App'
const INTERZISE: { motiv: string; tipar: RegExp }[] = [
  { motiv: 'RON (decizia 54)', tipar: new RegExp('\\b' + 'R' + 'ON\\b') },
  { motiv: 'AES / TLS (decizia 31)', tipar: new RegExp('\\b(A' + 'ES|T' + 'LS)\\b') },
  { motiv: 'Germania ca loc al gazduirii (decizia 42)', tipar: new RegExp('(German' + 'y|German' + 'ia|one EU ' + 'region|o singură ' + 'regiune)', 'i') },
  { motiv: 'portalul (decizia 43)', tipar: new RegExp('port' + 'al', 'i') },
  { motiv: 'API, webhook, SSO (decizia 43)', tipar: new RegExp('(\\bA' + 'PI\\b|web' + 'hook|\\bSS' + 'O\\b|single ' + 'sign-on)', 'i') },
  { motiv: 'reguli automate (decizia 43)', tipar: new RegExp('(automatic ' + 'rules|reguli ' + 'automate)', 'i') },
  { motiv: 'integrari cu nume (decizia 43)', tipar: new RegExp('(Out' + 'look|Gm' + 'ail|Microsoft ' + '365|Google ' + 'Workspace)', 'i') },
  { motiv: 'clasare automata in dosare (val-ro-i2)', tipar: new RegExp('(automatic ' + 'filing|clasare ' + 'automat)', 'i') },
  { motiv: 'asistentul pe WhatsApp (decizia 49)', tipar: new RegExp('(ask|answers?|question)[^.\\n]{0,30}on ' + WA + '|' + WA + ' (assistant|answers)', 'i') },
  { motiv: 'legatura de apel (decizia 56)', tipar: new RegExp('(te' + 'l:|call ' + 'us|sun' + 'ă-ne)', 'i') },
  { motiv: 'scanarea facuta de 3S (poarta juridica 40-41)', tipar: new RegExp('(we ' + 'scan|3S ' + 'scans|scanăm|scanează)', 'i') },
]

function incalcari(text: string): string[] {
  return INTERZISE.filter((i) => i.tipar.test(text)).map((i) => i.motiv)
}

describe('ce nu ajunge in modulele de continut ale feliei', () => {
  it('martorii: fiecare tipar prinde o fraza fabricata, iar textul de contact cu un om nu e acuzat', () => {
    const rau = [
      'Costa 0 ' + 'R' + 'ON.',
      'Criptare A' + 'ES-256.',
      'Stored in German' + 'y.',
      'Client port' + 'al.',
      'Public A' + 'PI.',
      'Automatic ' + 'rules for folders.',
      'Connect Out' + 'look.',
      'Automatic ' + 'filing into folders.',
      'Ask your archive on ' + WA + '.',
      'Or call ' + 'us now.',
      'We ' + 'scan your paper.',
    ]
    for (const r of rau) expect(incalcari(r), r).toHaveLength(1)
    expect(incalcari('Message us on ' + WA + '. A person replies, in English or Romanian.')).toEqual([])
  })

  for (const { nume, modul } of MODULE) {
    it(nume + ': zero incalcari in tot ce exporta modulul (numarate)', () => {
      const text = textModul(modul)
      // Controlul extragerii: textul strans nu e gol.
      expect(text.length, nume).toBeGreaterThan(400)
      expect(incalcari(text), nume).toEqual([])
    })
  }

  it('modulele si invelitoarea EN importa din continutul RO numai tipuri (import type), deci nu aduc text RO in pachet', () => {
    const fisiere = [...MODULE.map((m) => m.nume), 'src/components/preturi/PreturiEn.tsx', 'src/components/enterprise/BandaDrumDocumentEn.tsx']
    const RO = /^import\s+(?!type\b)[^;]*from\s+"@\/content\/(preturi|conversie|enterprise|acasa|navigatie)"/m
    for (const f of fisiere) expect(citeste(f), f).not.toMatch(RO)
    // Martorul tiparului: un import de valoare fabricat e prins, unul de tip nu.
    expect('import { PLANURI } from "@/content/' + 'preturi";').toMatch(RO)
    expect('import type { Plan } from "@/content/' + 'preturi";').not.toMatch(RO)
  })
})

describe('preturile EN (deciziile 18, 24, 54, 59)', () => {
  it('planurile poarta grila decisa: 90 / 150 / 240 pe luna, 75 / 125 / 200 la plata anuala, 5 / 10 / 20 de conturi', () => {
    const grila = pricing.GRILA.map((g) => [g.plan, Number(g.lunar), Number(g.anualPeLuna), Number(g.conturi)])
    expect(pretEn.PLANURI_EN.map((p) => [p.nume, p.pret.lunar, p.pret.anual, p.conturi])).toEqual(grila)
  })

  it('insigna "Recommended" pe Starter si numai pe el (decizia 59, ca pe RO)', () => {
    expect(pretEn.PLANURI_EN.filter((p) => p.recomandat).map((p) => p.cheie)).toEqual(['starter'])
  })

  it('nota de sub comutator e propozitia TVA a deciziei 24, cuvant cu cuvant; unitatea si coloanele sunt in EUR', () => {
    expect(pretEn.COMUTATOR_EN.nota).toBe(pricing.PROPOZITIE_TVA)
    expect(pretEn.GRILA_EN.unitate).toBe('EUR / month')
    expect(pretEn.CURSOARE_EN.tarif.unitate).toBe('EUR')
    expect(pretEn.LISTA_PDF_EN.foaie.coloane.lunar).toContain('EUR')
  })

  it('cele sapte intrebari vizibile sunt cele sapte sectiuni aprobate ale fisei (ca multime de titluri)', () => {
    const aprobate = pricing.pagina.sectiuni.filter((s) => s.cheie !== 'plans').map((s) => s.titlu)
    expect(pretEn.INTREBARI_EN.intrebari.map((i) => i.intrebare).sort()).toEqual([...aprobate].sort())
  })

  it('formatul american al cifrelor: virgula la mii, punctul zecimal (martor: formatul romanesc da altceva)', () => {
    expect(FORMAT_EN.bani(3700)).toBe('3,700')
    expect(FORMAT_EN.zecimal(1.5)).toBe('1.5')
    expect(FORMAT_ROMANESC.bani(3700)).toBe('3.700')
    expect(FORMAT_ROMANESC.zecimal(1.5)).toBe('1,5')
    expect(pretEn.valoareSpusaEn(pretEn.CURSOARE_EN.persoane, 1)).toBe('1 person')
    expect(pretEn.valoareSpusaEn(pretEn.CURSOARE_EN.persoane, 4)).toBe('4 people')
    expect(pretEn.dataEn(new Date(2026, 8, 25))).toBe('September 25, 2026')
    expect(textTeaserEn().presupuneri).toBe('With 4 people searching for documents 25 minutes a day')
  })

  it('cursorul tarifului: pornirea si capatul sunt pe grila lui', () => {
    const c = pretEn.CURSOARE_EN.tarif
    for (const v of [c.implicit, c.max]) expect(Number.isInteger((v - c.min) / c.pas), String(v)).toBe(true)
  })

  it('lista unui plan are 9 randuri, iconita "i" pe al saselea; tabelul are 4 categorii si 14 randuri, ca pe RO', () => {
    for (const p of pretEn.PLANURI_EN) {
      const r = pretEn.randuriPlanEn(p)
      expect(r).toHaveLength(9)
      expect(r.map((x, i) => (x.explicatie ? i : -1)).filter((i) => i >= 0)).toEqual([5])
    }
    expect(pretEn.TABEL_EN.categorii).toHaveLength(4)
    expect(pretEn.TABEL_EN.categorii.flatMap((c) => c.randuri)).toHaveLength(14)
  })

  it('randarea statica a pachetelor EN: sumele anuale in EUR, butoanele planurilor spre WhatsApp, zero RON; fara WhatsApp, butonul e inert', () => {
    const wa = 'https://wa.me/37360055599?text=x'
    const html = renderToStaticMarkup(createElement(PacheteEn, { gazda: '3s.md', analitica: false, whatsapp: wa }))
    for (const suma of ['75', '125', '200']) expect(html).toContain('>' + suma + '<')
    expect(html.split('href="' + wa + '"').length - 1).toBe(3)
    expect(html).toContain('EUR / month')
    expect(new RegExp('\\b' + 'R' + 'ON\\b').test(html)).toBe(false)
    const fara = renderToStaticMarkup(createElement(PacheteEn, { gazda: '3s.md', analitica: false, whatsapp: null }))
    expect(fara).not.toContain('wa.me')
    expect(fara.split('data-tinta-lipsa').length - 1).toBe(3)
    const tabel = renderToStaticMarkup(createElement(TabelPlanuri, { continut: pretEn.TABEL_EN, planuri: pretEn.PLANURI_EN }))
    expect(tabel).toContain('>Frankfurt<')
    expect(tabel).toContain('>240<')
  })

  it('biroul EN se monteaza fara demonstratia dispozitivelor (val-ro-1.1): fara contor si buton de adaugare, cu banda de conturi; RO ramane intreg', () => {
    // Piesele demonstratiei, numite prin marcajul vederii; controlul: biroul RO, randat cu aceeasi vedere, le are pe toate.
    // Clasele de modul ies in proba ca `_<nume>_<hash>`.
    const piese = ['data-contor-dispozitive', 'aria-live="polite"', '_adauga_', '_contor_', '_contorNota_']
    const en = renderToStaticMarkup(createElement(PliuriEn, { tabel: null }))
    const ro = renderToStaticMarkup(createElement(BirouInteractiv, { activ: false }))
    for (const p of piese) {
      expect(ro, 'RO: ' + p).toContain(p)
      expect(en, 'EN: ' + p).not.toContain(p)
    }
    // Ce ramane: cardul, scena, banda de conturi cu cele trei pachete si locurile primului (5).
    for (const c of ['cardBirou', 'scena', 'capConturi', 'segmente', 'etichetaLocuri']) expect(en, c).toContain('_' + c + '_')
    expect(en).toContain('Accounts in plan')
    expect(en).toContain('5 accounts, one for each colleague')
    expect(en.match(/aria-pressed=/g) ?? []).toHaveLength(3)
  })
})

describe('enterprise si contact pe editie', () => {
  it('Enterprise: randul de incredere are 4 elemente, banda 2 / 3 / 2 / 2 si 4 fapte, lista 6 elemente', () => {
    expect(enterpriseEn.EROU_ENTERPRISE_EN.incredere).toHaveLength(4)
    const d = enterpriseEn.DRUM_DOCUMENT_EN
    expect([d.intrare.elemente.length, d.intelegere.elemente.length, d.stocare.pastile.length, d.iesire.elemente.length, d.fapte.length]).toEqual([2, 3, 2, 2, 4])
    expect(enterpriseEn.LIVRABILE_EN.elemente).toHaveLength(6)
    // Ancora blocului de canal e cea a formularului RO, deci sectiunea pastreaza tuplul formei.
    expect(enterpriseEn.ANCORA_CANAL).toBe('contact-form')
  })

  it('contact: cinci carduri, fiecare spre perechea ei de pe 3s.md (P09, P08, P11, P02, G2), pe ambele editii', () => {
    const cai = ['/enterprise', '/pricing', '/about', '/platform', '/guides/records-retention-moldova']
    expect(contactEn.CONTACT_EN.subiecte.carduri.map((c) => c.legatura.href)).toEqual(cai)
    // Pe /ro/contact acelasi card duce la perechea /ro a paginii EN (decizia 59), citita din tabelul echivalentelor.
    const peRo = cai.map((c) => Object.values(ECHIVALENTE).find((e) => e.en === c)?.['ro-MD'])
    expect(peRo).toEqual(['/ro/enterprise', '/ro/preturi', '/ro/securitate', '/ro/platforma', '/ro/ghiduri/termene-pastrare-moldova'])
    expect(contactRoMd.CONTACT_RO_MD.subiecte.carduri.map((c) => c.legatura.href)).toEqual(peRo)
  })

  it('subtitlul de contact: numarul si adresa vin din canale; fara adresa (inainte de P-40) nu numeste e-mailul', () => {
    const numar = '+373 60 055 599'
    const adresa = 'contact' + '@3s.md'
    expect(contactEn.subtitluContactEn(numar, '')).toBe('You can reach 3S on WhatsApp at ' + numar + ', for messages and calls. We reply in English or Romanian.')
    expect(contactEn.subtitluContactEn(numar, adresa)).toContain(', or by e-mail at ' + adresa + '.')
    expect(contactRoMd.subtitluContactRoMd(numar, '')).not.toContain('e-mail')
    expect(contactRoMd.subtitluContactRoMd(numar, adresa)).toContain(', ori prin e-mail, la ' + adresa + '.')
  })

  it('/ro/contact la "tu" (decizia 35): zero forme de politete in textul modulului', () => {
    const POLITETE = new RegExp('(?<!\\p{L})(' + ['dumnea' + 'voastră', 'v' + 'ă', 'voas' + 'tră', 'vos' + 'tru'].join('|') + ')(?!\\p{L})|\\p{L}+(ați|eți|iți)(?!\\p{L})', 'giu')
    expect(('V' + 'ă rugăm să scrie' + 'ți.').match(POLITETE)).toHaveLength(2)
    expect(textModul(contactRoMd as Record<string, unknown>).match(POLITETE) ?? []).toEqual([])
  })
})
