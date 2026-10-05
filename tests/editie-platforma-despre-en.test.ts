import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { createElement, type ComponentType } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import CtaFinalInchis from '../src/components/primitive/CtaFinalInchis'
import PaginaPlatforma, { SECTIUNI_PLATFORMA } from '../src/components/produs/PaginaPlatforma'
import PaginaSecuritate, { SECTIUNI_SECURITATE } from '../src/components/produs/PaginaSecuritate'
import VerificareBrowserEn from '../src/components/produs/VerificareBrowserEn'
import { CTA_FINAL } from '../src/content/acasa'
import * as despre from '../src/content/en/despre-componente'
import * as platforma from '../src/content/en/platforma-componente'
import * as ro from '../src/content/produs/platforma'
import * as roSec from '../src/content/produs/securitate'

/**
 * FELIA 103 (`editie-platforma-despre-en`): P02 `/platform` si P11 `/about` compun `PaginaPlatforma` si
 * `PaginaSecuritate` (componentele paginilor RO `/platforma` si `/securitate`) cu continutul din
 * `src/content/en/{platforma,despre}-componente.ts`. Aici se dovedeste partea de CONTINUT si de COMPONENTA, fara build:
 *  1. modulele EN nu poarta nimic din continutul RO al componentelor (dictionarul RO se construieste la rulare, din
 *     constantele pe care componentele le iau implicit), zero diacritice, zero RON si zero fapte scoase de decizii
 *     (AES/TLS - d31; Germania - d42; WhatsApp ca asistent - d49; API, portal - d43; hartia - poarta 40-41);
 *  2. compunerea: sectiunile montate sunt cele ale perechii RO minus cele scoase (spec. de congruenta, sectiunea 3),
 *     in ordinea componentei; bucatile paginii /about refac exact lista; blocurile numerotate se citesc fara gol;
 *  3. fiecare componenta, randata cu continutul EN, scoate fiecare sir EN primit si niciun sir RO;
 *  4. reperul hartii e pe Frankfurt: proiectia hartii se reface din conturul SVG (8 puncte de tarm cunoscute) si
 *     aceeasi proiectie pune centrul Germaniei pe reperul RO (controlul ca proiectia e cea a desenului).
 * HTML-ul servit, canalele, FAQPage si ancorele sunt in `tests/browser/editie-platforma-despre-en.spec.ts`; RO
 * neschimbat il dovedeste invarianta pe build (`tests/invarianta-ro.test.ts`), fiindca felia nu atinge nicio componenta.
 *
 * MARTORII: un sir RO strecurat intr-o copie a continutului EN e prins; o sectiune scoasa din lista e prinsa de
 * comparatia compunerii; un reper mutat cu 1% din cadru iese din toleranta.
 */

const DIACRITICE = /[ăâîșțşţĂÂÎȘȚŞŢ]/
const RON = new RegExp('\\b' + 'R' + 'ON\\b')

/** Faptele scoase de decizii, ca tipare (asamblate din bucati: fisierul nu le poarta pe litere ca text de pagina). */
const SCOASE: { motiv: string; tipar: RegExp }[] = [
  { motiv: 'AES (d31)', tipar: new RegExp('\\b' + 'A' + 'ES\\b') },
  { motiv: 'TLS (d31)', tipar: new RegExp('\\b' + 'T' + 'LS\\b') },
  { motiv: 'Germania (d42)', tipar: new RegExp('\\b' + 'Germ' + '(any|an)\\b') },
  { motiv: 'WhatsApp in text (d49)', tipar: new RegExp('Whats' + 'App', 'i') },
  { motiv: 'API, webhook (d43)', tipar: new RegExp('\\b(' + 'A' + 'PI|web' + 'hooks?)\\b', 'i') },
  { motiv: 'portal (d43)', tipar: new RegExp('\\b' + 'port' + 'al\\b', 'i') },
  // "original files" ramane: exportul fisierelor originale (digitale) e fapt confirmat; tiparul vaneaza hartia.
  { motiv: 'hartia, rafturile, depozitul (poarta 40-41)', tipar: new RegExp('\\b(' + 'pap' + 'er|shel' + '(f|ves)|dep' + 'ot|hand(ed)? ' + 'over)\\b', 'i') },
  { motiv: 'o singura regiune (d42)', tipar: new RegExp('\\b' + 'single' + ' region\\b', 'i') },
]

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

/**
 * Textul randat, fara etichete (grupurile nerupte stau in `<span>`-uri in linie, deci un sir ramane intreg), plus
 * valorile etichetelor accesibile si ale numerelor desenate din atribut (`data-numar`), decodate.
 */
function texteHtml(html: string): string {
  const text = decodeaza(html.replace(/<[^>]+>/g, ''))
  const atribute = [...html.matchAll(/\s(?:aria-label|title|alt|data-numar)="([^"]*)"/g)].map((m) => decodeaza(m[1]))
  return [text, ...atribute].join('\n')
}

/** Cheile care nu poarta text vizibil: numele iconitelor, pozitiile, tintele, ancorele. */
const CHEI_FARA_TEXT = new Set(['iconita', 'reper', 'href', 'ruta', 'cale', 'ancora'])

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

/** Dictionarul RO: sirurile de cel putin doua cuvinte sau cu diacritice ale constantelor RO ale celor doua pagini. */
const DICTIONAR_RO = [
  ...new Set(
    frunze([Object.values(ro), Object.values(roSec), CTA_FINAL, 'Fir de navigare', 'Verificarea conexiunii din browser', 'Ce poate arăta 3S']).filter(
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

describe('modulele EN ale paginilor /platform si /about: zero continut RO, zero fapte scoase', () => {
  const toate = frunze([Object.values(platforma), Object.values(despre)])

  it('dictionarul RO s-a construit si modulele au text (controlul preconditiei)', () => {
    expect(DICTIONAR_RO.length).toBeGreaterThan(150)
    expect(toate.length).toBeGreaterThan(150)
  })

  it('niciun sir RO, nicio diacritica, niciun RON si niciun fapt scos in modulele EN', () => {
    const text = toate.join('\n')
    expect(scapariRo(text)).toEqual([])
    expect(toate.filter((t) => DIACRITICE.test(t))).toEqual([])
    expect(RON.test(text)).toBe(false)
    expect(SCOASE.filter((s) => s.tipar.test(text)).map((s) => s.motiv)).toEqual([])
  })

  it('martori: un sir RO strecurat intr-o copie e prins; fiecare tipar de fapt scos prinde fraza lui RO', () => {
    const copie = { ...platforma.PLATFORMA_EN.erou, subtitlu: ro.EROU_PLATFORMA.subtitlu }
    expect(scapariRo(frunze(copie).join('\n'))).toContain(ro.EROU_PLATFORMA.subtitlu)
    // Fiecare tipar are un martor in textul RO tradus de fisa (forma EN a faptului scos).
    const martori = [
      'Files are encrypted with ' + 'A' + 'ES-256.',
      'Only over ' + 'T' + 'LS 1.2 or newer.',
      'Servers in ' + 'Germ' + 'any.',
      'Ask on ' + 'Whats' + 'App.',
      'Use the REST ' + 'A' + 'PI.',
      'Clients see it in the ' + 'port' + 'al.',
      'We keep the ' + 'pap' + 'er on our ' + 'shel' + 'ves, in the ' + 'dep' + 'ot.',
      'One ' + 'single' + ' region of the EU.',
    ]
    for (const [i, s] of SCOASE.entries()) expect(s.tipar.test(martori[i]), s.motiv).toBe(true)
  })
})

describe('compunerea: aceleasi componente, in ordinea RO, minus sectiunile scoase de decizii', () => {
  it('/platform: toate sectiunile PaginaPlatforma, fara Problema, BlocDate si Apeluri (spec. sectiunea 3, P02)', () => {
    const scoase = ['problema', 'blocDate', 'apeluri']
    expect([...platforma.SECTIUNI_PLATFORMA_EN]).toEqual(SECTIUNI_PLATFORMA.filter((s) => !scoase.includes(s)))
  })

  it('/about: fara StocareProprie, Criptare, Acces, Originale, Raportare si Seif; bucatile paginii refac exact lista', () => {
    const scoase = ['stocareProprie', 'criptare', 'acces', 'originale', 'raportare', 'seif']
    expect([...despre.SECTIUNI_DESPRE_EN]).toEqual(SECTIUNI_SECURITATE.filter((s) => !scoase.includes(s)))
    expect(despre.BUCATI_DESPRE_EN.flatMap((b) => [...b.sectiuni])).toEqual([...despre.SECTIUNI_DESPRE_EN])
    expect(despre.BUCATI_DESPRE_EN.map((b) => b.ancora)).toEqual([null, 'security', 'limits'])
    // Ancorele stau inaintea blocului cu locul datelor si inaintea intrebarilor (tintele legaturilor).
    expect(despre.BUCATI_DESPRE_EN[1].sectiuni[0]).toBe('infrastructura')
    expect(despre.BUCATI_DESPRE_EN[2].sectiuni[0]).toBe('intrebari')
  })

  it('martor: o sectiune in plus sau lipsa in lista EN schimba comparatia', () => {
    const cuProblema = ['erou', 'piloni', 'problema', ...platforma.SECTIUNI_PLATFORMA_EN.slice(2)]
    expect(cuProblema).not.toEqual(SECTIUNI_PLATFORMA.filter((s) => !['problema', 'blocDate', 'apeluri'].includes(s)))
  })

  it('blocurile numerotate se citesc fara gol: 01-02 pe /platform, 01-04 pe /about', () => {
    const p = platforma.PLATFORMA_EN
    expect([p.blocArhiva!.numar, p.blocIntrebari!.numar]).toEqual(['01', '02'])
    const d = despre.DESPRE_EN
    expect([d.infrastructura!.numar, d.ciclu!.numar, d.reglementare!.numar, d.intrebari!.numar]).toEqual(['01', '02', '03', '04'])
    expect(d.ciclu!.pasi.map((x) => x.numar)).toEqual(['01', '02', '03', '04', '05'])
  })

  it('numarul de elemente al campurilor care raman e cel RO (fisa: sloturile rescrise din fapte confirmate)', () => {
    const p = platforma.PLATFORMA_EN
    expect(p.macheta.fisiere.length).toBe(ro.MACHETA_STRAT.fisiere.length)
    expect(p.macheta.campuri.length).toBe(ro.MACHETA_STRAT.campuri.length)
    expect(p.macheta.insigne.length).toBe(ro.MACHETA_STRAT.insigne.length)
    expect(p.piloni!.piloni.length).toBe(ro.PILONI_PLATFORMA.piloni.length)
    expect(p.model!.noduri.length).toBe(ro.MODEL_PLATFORMA.noduri.length)
    expect(p.blocIntrebari!.carduri.length).toBe(ro.BLOC_INTREBARI.carduri.length)
    expect(p.comparatie!.randuri.length).toBe(ro.COMPARATIE_PLATFORMA.randuri.length)
    expect(p.suveranitate!.carduri.length).toBe(ro.SUVERANITATE_PLATFORMA.carduri.length)
    expect(p.conformitate!.insigne.length).toBe(ro.CONFORMITATE_PLATFORMA.insigne.length)
    expect([p.blocArhiva!.randuri.length, p.cazuri!.cazuri.length, p.intrebari!.intrebari.length]).toEqual([3, 3, 5])
    const d = despre.DESPRE_EN
    expect(d.piloni!.elemente.length).toBe(roSec.PILONI_SECURITATE.length)
    expect(d.infrastructura!.specificatii.length).toBe(roSec.BLOC_INFRASTRUCTURA.specificatii.length)
    expect(d.ciclu!.pasi.length).toBe(roSec.BLOC_CICLU.pasi.length)
    // Reglementare: sloturile legaturii de partajare si ale exportului zip (fara intrare confirmata in registrul EN)
    // iau fapte confirmate, ca la Conformitate pe /platform; numarul ramane cel RO (6 insigne, 4 carduri).
    expect(d.reglementare!.insigne.length).toBe(roSec.BLOC_REGLEMENTARE.insigne.length)
    expect(d.reglementare!.carduri.length).toBe(roSec.BLOC_REGLEMENTARE.carduri.length)
    expect(d.reglementare!.insigne.map((x) => x.marca)).toEqual(['EU', 'AI', 'MD', 'Amazon', 'US', 'Folder'])
    expect(d.intrebari!.intrebari.length).toBe(roSec.INTREBARI_SECURITATE.intrebari.length)
  })
})

describe('diferentele de numar ale campurilor P02 sunt declarate in lista perechii, cu numerele continutului', () => {
  // Proba de congruenta din browser numara numai campurile declarate; o diferenta de numar nedeclarata trece acolo
  // verde. Aici fiecare camp al /platform care pierde elemente fata de RO trebuie sa aiba randul lui `camp` in
  // config/congruenta/p02.json, cu ro si en egale cu lungimile continutului.
  type Lista = { randuri: { tip: string; selector?: string; ro?: number; en?: number }[] }
  const lista = JSON.parse(readFileSync(join(__dirname, '..', 'config', 'congruenta', 'p02.json'), 'utf8')) as Lista
  const p = platforma.PLATFORMA_EN
  const asteptate: [string, number, number][] = [
    ['platforma_rand__', ro.BLOC_ARHIVA.randuri.length, p.blocArhiva!.randuri.length],
    ['platforma_caz__', ro.CAZURI_PLATFORMA.cazuri.length, p.cazuri!.cazuri.length],
  ]
  function nepotriviri(l: Lista): string[] {
    return asteptate.flatMap(([fragment, nRo, nEn]) => {
      const gasite = l.randuri.filter((r) => r.tip === 'camp' && (r.selector ?? '').includes(fragment))
      if (nRo === nEn) return gasite.length === 0 ? [] : [fragment + ': declarat, dar numarul nu difera']
      if (gasite.length !== 1) return [fragment + ': ' + nRo + ' -> ' + nEn + ', ' + gasite.length + ' randuri camp']
      const r = gasite[0]!
      return r.ro === nRo && r.en === nEn ? [] : [fragment + ': lista ' + r.ro + '/' + r.en + ', continutul ' + nRo + '/' + nEn]
    })
  }

  it('BlocArhiva (5 -> 3) si Cazuri (5 -> 3): cate un rand camp, cu ro si en ale continutului', () => {
    expect(asteptate.map(([, nRo, nEn]) => [nRo, nEn])).toEqual([[5, 3], [5, 3]])
    expect(nepotriviri(lista)).toEqual([])
  })

  it('MARTORI: lista fara randul BlocArhiva, sau cu en schimbat cu 1, e prinsa', () => {
    const fara: Lista = { randuri: lista.randuri.filter((r) => !(r.selector ?? '').includes('platforma_rand__')) }
    expect(nepotriviri(fara)).toEqual(['platforma_rand__: 5 -> 3, 0 randuri camp'])
    const schimbata: Lista = {
      randuri: lista.randuri.map((r) => ((r.selector ?? '').includes('platforma_rand__') ? { ...r, en: (r.en ?? 0) + 1 } : r)),
    }
    expect(nepotriviri(schimbata)).toEqual(['platforma_rand__: lista 5/4, continutul 5/3'])
  })
})

describe('componentele, randate cu continutul EN', () => {
  it('PaginaPlatforma: fiecare sir EN primit apare, niciun sir RO; legaturile duc pe caile 3s.md', () => {
    const html = render(PaginaPlatforma, {
      continut: platforma.PLATFORMA_EN,
      sectiuni: platforma.SECTIUNI_PLATFORMA_EN,
      etichetaFir: platforma.ETICHETA_FIR_EN,
      butoane: null,
    })
    const text = texteHtml(html)
    expect(frunze(platforma.PLATFORMA_EN).filter((s) => !text.includes(s))).toEqual([])
    expect(scapariRo(text)).toEqual([])
    expect(DIACRITICE.test(text)).toBe(false)
    expect(html).toContain('aria-label="Breadcrumb"')
    expect(html).not.toMatch(/href="\/(securitate|e-facturare|solutii|integrari|inregistrare)/)
    // In vitest caile existente sunt ale editiei RO, deci tintele EN ies ca `data-tinta-lipsa`; legatura reala se
    // masoara pe copia 3s.md, in proba de browser a feliei.
    expect(html).toMatch(/(href|data-tinta-lipsa)="\/about#security"/)
    expect(html).toMatch(/(href|data-tinta-lipsa)="\/guides\/e-invoice-archiving-eu"/)
  })

  it('CtaFinalInchis: textul fisei si macheta ca pe start; butonul principal din continut nu se randeaza (il pune pagina)', () => {
    const html = render(CtaFinalInchis, { continut: platforma.CTA_FINAL_PLATFORMA_EN, butoane: null })
    const text = texteHtml(html)
    expect(frunze({ ...platforma.CTA_FINAL_PLATFORMA_EN, butonPrincipal: null }).filter((s) => !text.includes(s))).toEqual([])
    expect(scapariRo(text)).toEqual([])
  })

  it('PaginaSecuritate: fiecare sir EN primit apare, niciun sir RO; verificarea e invelitoarea EN', () => {
    const html = render(PaginaSecuritate, {
      continut: despre.DESPRE_EN,
      sectiuni: despre.SECTIUNI_DESPRE_EN,
      etichetaFir: despre.ETICHETA_FIR_DESPRE_EN,
      etichetaVerificare: despre.ETICHETA_VERIFICARE_EN,
      verificare: createElement(VerificareBrowserEn),
    })
    const text = texteHtml(html)
    const asteptate = frunze([despre.DESPRE_EN, despre.ETICHETA_FIR_DESPRE_EN, despre.ETICHETA_VERIFICARE_EN])
    expect(asteptate.filter((s) => !text.includes(s))).toEqual([])
    // Starea din HTML-ul servit a verificarii (inainte de masurare) e cea EN.
    for (const s of [despre.VERIFICARE_EN.titlu, despre.VERIFICARE_EN.nota, despre.VERIFICARE_EN.reia, ...Object.values(despre.VERIFICARE_EN.asteptare)]) {
      expect(text, s).toContain(s)
    }
    expect(scapariRo(text)).toEqual([])
    expect(DIACRITICE.test(text)).toBe(false)
    expect(html).not.toMatch(/securitate-bloc-0[23478]|seif-titlu/)
  })

  it('verificarea spune ca masoara acest site, nu platforma (intrebarea 9, decizia 59)', () => {
    expect(despre.VERIFICARE_EN.titlu).toMatch(/website/)
    expect(despre.VERIFICARE_EN.nota).toMatch(/not of the 3S platform/)
  })

  it('martor: un sir RO pus in locul unui camp EN apare in scaparile componentei', () => {
    const copie = { ...despre.DESPRE_EN, erou: { ...despre.DESPRE_EN.erou, titlu: roSec.EROU_SECURITATE.titlu } }
    const html = render(PaginaSecuritate, { continut: copie, sectiuni: ['erou'] })
    expect(scapariRo(texteHtml(html))).toContain(roSec.EROU_SECURITATE.titlu)
  })
})

describe('harta: reperul pe Frankfurt, in proiectia desenului', () => {
  // Proiectia desenului (antetul SVG-ului): Lambert azimutala echivalenta, centru 10 E / 50 N. Scara si originea nu
  // sunt scrise in fisier; se refac aici din contur, prin cele mai mici distante la 8 puncte de tarm cunoscute.
  const svg = readFileSync(join(__dirname, '..', 'public', 'produs', 'harta-europa.svg'), 'utf8')
  const contur = [...svg.split('<g mask').slice(2).join('').matchAll(/(-?\d+\.\d+)[ ,](-?\d+\.\d+)/g)].map((m) => [Number(m[1]), Number(m[2])])
  const laea = (lon: number, lat: number): [number, number] => {
    const r = Math.PI / 180
    const l = (lon - 10) * r
    const p = lat * r
    const p0 = 50 * r
    const k = Math.sqrt(2 / (1 + Math.sin(p0) * Math.sin(p) + Math.cos(p0) * Math.cos(p) * Math.cos(l)))
    return [k * Math.cos(p) * Math.sin(l), k * (Math.cos(p0) * Math.sin(p) - Math.sin(p0) * Math.cos(p) * Math.cos(l))]
  }
  // Cabo da Roca, Cabo de Sao Vicente, Punta de Tarifa, Land's End, Skagen, Santa Maria di Leuca, Capo Passero, Capul Matapan.
  const TARM: [number, number][] = [[-9.5, 38.78], [-8.99, 37.02], [-5.61, 36.01], [-5.71, 50.07], [10.6, 57.75], [18.36, 39.8], [15.13, 36.69], [22.48, 36.39]]
  const distanta = (x: number, y: number) => Math.min(...contur.map(([a, b]) => Math.hypot(a - x, b - y)))
  const eroare = (s: number, cx: number, cy: number) => TARM.map(([lo, la]) => laea(lo, la)).map(([x, y]) => distanta(cx + s * x, cy - s * y))

  // Ajustarea, facuta o data (scara 838, originea 356,5 / 244,5); proba verifica ca ea se potriveste conturului.
  const S = 838
  const CX = 356.5
  const CY = 244.5
  const inProcente = (lon: number, lat: number) => {
    const [x, y] = laea(lon, lat)
    return { x: ((CX + S * x) / 800) * 100, y: ((CY - S * y) / 480) * 100 }
  }

  it('preconditia: conturul are puncte, iar proiectia pune fiecare punct de tarm la sub 2 px de contur', () => {
    expect(contur.length).toBeGreaterThan(1000)
    const e = eroare(S, CX, CY)
    expect(Math.max(...e)).toBeLessThan(2)
  })

  it('martor NEGATIV: o scara gresita cu 5% departeaza punctele de tarm de contur', () => {
    expect(Math.max(...eroare(S * 1.05, CX, CY))).toBeGreaterThan(5)
  })

  it('controlul proiectiei: centrul Germaniei (10,45 E / 51,16 N) cade pe reperul RO, la sub 0,1% din cadru', () => {
    const g = inProcente(10.45, 51.16)
    expect(Math.abs(g.x - roSec.BLOC_INFRASTRUCTURA.harta.reper.x)).toBeLessThan(0.1)
    expect(Math.abs(g.y - roSec.BLOC_INFRASTRUCTURA.harta.reper.y)).toBeLessThan(0.1)
  })

  it('reperul EN e Frankfurt (8,68 E / 50,11 N), la sub 0,1% din cadru; martor: mutat cu 1% iese din toleranta', () => {
    const f = inProcente(8.682, 50.11)
    const reper = despre.DESPRE_EN.infrastructura!.harta.reper
    expect(Math.abs(f.x - reper.x)).toBeLessThan(0.1)
    expect(Math.abs(f.y - reper.y)).toBeLessThan(0.1)
    expect(Math.abs(f.x - (reper.x + 1))).toBeGreaterThan(0.1)
    expect(despre.DESPRE_EN.infrastructura!.harta.eticheta).toBe('Frankfurt')
  })
})
