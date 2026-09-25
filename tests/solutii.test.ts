import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import * as paginaHub from '../src/app/solutii/page'
import * as paginaAsigurari from '../src/app/solutii/asigurari/page'
import * as paginaAvocatura from '../src/app/solutii/avocatura/page'
import * as paginaConstructii from '../src/app/solutii/constructii/page'
import * as paginaContabilitate from '../src/app/solutii/contabilitate/page'
import * as paginaImobiliare from '../src/app/solutii/imobiliare/page'
import * as paginaLogistica from '../src/app/solutii/logistica/page'
import * as paginaNotariate from '../src/app/solutii/notariate/page'
import { creeazaAleator } from '../src/components/scena3d/aleator'
import { abateriMetadata } from '../src/components/seo/metadata'
import { durataAsamblare, FOI_PE_FORMATIE, tinteFormatie } from '../src/components/solutii/formatii'
import { grafIntrebari } from '../src/components/solutii/IntrebariSolutii'
import PaginaHub from '../src/components/solutii/PaginaHub'
import PaginaSector from '../src/components/solutii/PaginaSector'
import { iesireCubica, orbitaErou, orbitaFoaie, pozaOrbita } from '../src/components/solutii/scena-hartii'
import registru from '../src/content/afirmatii/solutii.json'
import { FOAIE_SOLUTII } from '../src/content/navigatie'
import { RUTE } from '../src/content/rute'
import { ASIGURARI } from '../src/content/solutii/asigurari'
import { AVOCATURA } from '../src/content/solutii/avocatura'
import { SECTOR_COMUN } from '../src/content/solutii/comun'
import { CONSTRUCTII } from '../src/content/solutii/constructii'
import { CONTABILITATE } from '../src/content/solutii/contabilitate'
import { HUB } from '../src/content/solutii/hub'
import { IMOBILIARE } from '../src/content/solutii/imobiliare'
import { LOGISTICA } from '../src/content/solutii/logistica'
import { NOTARIATE } from '../src/content/solutii/notariate'
import { formaNumar, textFragment, type Formatie, type Sector } from '../src/content/solutii/tipuri'
import { urlAbsolut } from '../src/lib/site'

/**
 * Probele feliei `solutii` care nu cer browser: rutele si metadatele celor 8 pagini, HTML-ul servit
 * (forma statica a pieselor animate), datele structurate ale intrebarilor, matematica scenei
 * hartiilor si datele fictive ale consolei.
 *
 * Cifrele verificate sunt cele din fisele de design (formatiile, duratele asamblarii, intervalele
 * orbitelor), nu constante copiate din cod: fiecare regula are, langa ea, un martor care arata ca
 * verificarea chiar poate pica.
 */

const RADACINA = join(__dirname, '..')

const SECTOARE: Sector[] = [CONSTRUCTII, CONTABILITATE, IMOBILIARE, AVOCATURA, LOGISTICA, NOTARIATE, ASIGURARI]

/** Ordinea din meniu: hubul, apoi sectoarele in ordinea foii Solutii. */
const CAI_ASTEPTATE = [
  '/solutii',
  '/solutii/constructii',
  '/solutii/contabilitate',
  '/solutii/imobiliare',
  '/solutii/avocatura',
  '/solutii/logistica',
  '/solutii/notariate',
  '/solutii/asigurari',
]

const PAGINI: [string, { metadata: unknown }][] = [
  ['/solutii', paginaHub],
  ['/solutii/constructii', paginaConstructii],
  ['/solutii/contabilitate', paginaContabilitate],
  ['/solutii/imobiliare', paginaImobiliare],
  ['/solutii/avocatura', paginaAvocatura],
  ['/solutii/logistica', paginaLogistica],
  ['/solutii/notariate', paginaNotariate],
  ['/solutii/asigurari', paginaAsigurari],
]

/** Caile scrise sub marcajul unei felii din `src/content/rute.ts`, in ordinea din fisier. */
function caiSubMarcaj(felie: string): string[] {
  const text = readFileSync(join(RADACINA, 'src/content/rute.ts'), 'utf8')
  const start = text.indexOf('// <<felie:' + felie + '>>')
  if (start < 0) return []
  const urmator = text.indexOf('// <<felie:', start + 5)
  const bucata = text.slice(start, urmator < 0 ? undefined : urmator)
  return [...bucata.matchAll(/cale:\s*"([^"]+)"/g)].map((m) => m[1])
}

/** HTML-ul servit al unei pagini de solutii. */
const htmlSector = (s: Sector) => renderToStaticMarkup(createElement(PaginaSector, { sector: s }))
const htmlHub = renderToStaticMarkup(createElement(PaginaHub))

/**
 * Textul vizibil al unui HTML, fara scripturi (JSON-LD) si fara etichete. Etichetele de evidentiere
 * (`mark`) sunt in linie, deci se scot fara spatiu; restul devin spatiu, ca blocurile sa nu se lipeasca.
 */
function textVizibil(html: string): string {
  return html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, ' ')
    .replace(/<\/?mark\b[^>]*>/g, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/\s+/g, ' ')
}

/**
 * Fragmentele de rezultat sunt un paragraf cu bucati in linie (`span` si `mark`): se citesc cu toate
 * etichetele scoase fara spatiu, ca textul sa iasa exact cum se vede.
 */
const textInLinie = (html: string) =>
  html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, ' ')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")

/** Nodurile JSON-LD ale unui HTML. */
function noduriJsonLd(html: string): Record<string, unknown>[] {
  const scripturi = [...html.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)]
  return scripturi.flatMap((m) => {
    const date = JSON.parse(m[1]) as { '@graph'?: Record<string, unknown>[] }
    return date['@graph'] ?? [date as Record<string, unknown>]
  })
}

// Liniile lungi se construiesc din cod, nu se scriu: fisierul insusi respecta regula pe care o probeaza.
const LINIE_EN = String.fromCharCode(0x2013)
const LINIE_EM = String.fromCharCode(0x2014)

/** Cratima e singura linie permisa: liniile lungi (en, em) sunt interzise in textul vizibil. */
const areLiniiInterzise = (text: string) => text.includes(LINIE_EN) || text.includes(LINIE_EM)

/** Insignele de conformitate nu au voie sa poarte certificari sau standarde pe care 3S nu le are. */
const CERTIFICARI = /\b(iso|soc ?2|nist|dora|eidas|gdpr|certific|conform|hipaa)/i

/** Cifra de control a unui cod fiscal romanesc (cheia 753217532, suma x 10 mod 11, 10 -> 0). */
function cifraControl(cui: string): number {
  const cheie = '753217532'
  const corp = cui.slice(0, -1).padStart(9, '0')
  let suma = 0
  for (let i = 0; i < 9; i++) suma += Number(corp[i]) * Number(cheie[i])
  const rest = (suma * 10) % 11
  return rest === 10 ? 0 : rest
}
const cuiValid = (cui: string) => /^\d{2,10}$/.test(cui) && cifraControl(cui) === Number(cui.at(-1))

// ---------------------------------------------------------------------------------------------------

describe('rutele si metadatele', () => {
  it('sub marcajul feliei stau exact cele 8 cai, in ordinea meniului', () => {
    expect(caiSubMarcaj('solutii')).toEqual(CAI_ASTEPTATE)
    // Martor: acelasi cititor, pe marcajul fundatiei, gaseste startul (deci chiar citeste marcajele).
    expect(caiSubMarcaj('fundatie')).toEqual(['/'])
  })

  it('fiecare cale are pagina ei in src/app si intrare in manifest', () => {
    const inManifest = new Set(RUTE.map((r) => r.cale))
    for (const cale of CAI_ASTEPTATE) {
      expect(existsSync(join(RADACINA, 'src/app', cale, 'page.tsx')), cale).toBe(true)
      expect(inManifest.has(cale), cale).toBe(true)
    }
    // Martor: o cale inventata nu are pagina.
    expect(existsSync(join(RADACINA, 'src/app/solutii/inexistent/page.tsx'))).toBe(false)
  })

  it('metadatele sunt in pragurile portii SEO, cu canonical pe propria cale, si titluri distincte', () => {
    const titluri = new Set<string>()
    for (const [cale, modul] of PAGINI) {
      const m = modul.metadata as { title: { absolute: string }; description: string; alternates: { canonical: string } }
      expect(abateriMetadata({ titlu: m.title.absolute, descriere: m.description, cale }), cale).toEqual([])
      expect(m.alternates.canonical).toBe(cale)
      titluri.add(m.title.absolute)
    }
    expect(titluri.size).toBe(PAGINI.length)
    // Martor: un titlu de 10 caractere e refuzat de acelasi verificator.
    expect(abateriMetadata({ titlu: 'Solutii 3S', descriere: HUB.meta.descriere, cale: '/solutii' }).length).toBeGreaterThan(0)
  })
})

describe('HTML-ul servit al celor 7 sectoare', () => {
  for (const sector of SECTOARE) {
    describe(sector.cale, () => {
      const html = htmlSector(sector)
      const text = textVizibil(html)

      it('are un singur h1, titlul eroului', () => {
        const h1 = [...html.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/g)].map((m) => textVizibil(m[1]).trim())
        expect(h1).toEqual([sector.erou.titlu])
      })

      it('scena are in HTML starea de la incarcare: cipul „haos” si butonul, fara canvas', () => {
        expect(html).toContain('data-scena-stare="haos"')
        expect(text).toContain(SECTOR_COMUN.stareScena.haos)
        expect(text).toContain(SECTOR_COMUN.stareScena.buton)
        expect(html).not.toContain('<canvas')
        // Martor: textul starii „ordine” nu e in HTML (starea finala vine abia din scena).
        expect(text).not.toContain(SECTOR_COMUN.stareScena.ordine)
      })

      it('cele 3 momente poarta numele de fisier care ajung pe documentele-erou', () => {
        for (const m of sector.momente.lista) expect(text).toContain(m.fisier)
        expect(new Set(sector.momente.lista.map((m) => m.fisier)).size).toBe(3)
      })

      it('cautarea are in HTML interogarea intreaga si fragmentul rezultatului (inaltimea rezervata)', () => {
        expect(text).toContain(sector.pasi.demo.interogare)
        expect(textInLinie(html)).toContain(textFragment(sector.pasi.demo.rezultat.fragment))
        expect(sector.pasi.demo.rezultat.fragment.match(/\[\[/g)?.length).toBe(2)
        // Martor: marcajele fragmentului nu ajung pe ecran.
        expect(text).not.toContain('[[')
      })

      it('intrebarile: 4 randuri inchise si un nod FAQPage cu aceleasi 4, pe @id-ul paginii', () => {
        const intrebari = [...sector.intrebari, ...SECTOR_COMUN.intrebariComune]
        expect(html.match(/aria-expanded="false"/g)?.length).toBe(4)
        const faq = noduriJsonLd(html).filter((n) => n['@type'] === 'FAQPage')
        expect(faq).toHaveLength(1)
        expect(faq[0]['@id']).toBe(urlAbsolut(sector.cale) + '#intrebari')
        const q = faq[0].mainEntity as { name: string; acceptedAnswer: { text: string } }[]
        expect(q.map((x) => x.name)).toEqual(intrebari.map((x) => x.intrebare))
        expect(q.map((x) => x.acceptedAnswer.text)).toEqual(intrebari.map((x) => x.raspuns))
        for (const x of intrebari) expect(text).toContain(x.intrebare)
      })

      it('consola cu toti clientii apare numai la contabilitate', () => {
        expect(text.includes(CONTABILITATE.consola!.titlu)).toBe(sector === CONTABILITATE)
      })

      it('textul vizibil nu are linii lungi (en, em)', () => {
        expect(areLiniiInterzise(text)).toBe(false)
      })
    })
  }

  it('martor: verificarea liniilor prinde linia em si linia en, dar nu cratima', () => {
    expect(areLiniiInterzise('actele ' + LINIE_EM + ' toate')).toBe(true)
    expect(areLiniiInterzise('2020' + LINIE_EN + '2021')).toBe(true)
    expect(areLiniiInterzise('Pitești - Arad')).toBe(false)
  })
})

describe('HTML-ul servit al hubului', () => {
  const text = textVizibil(htmlHub)

  it('are un singur h1 si butoanele eroului spre formular si spre platforma', () => {
    expect(htmlHub.match(/<h1\b/g)).toHaveLength(1)
    expect(text).toContain(HUB.erou.titlu)
    expect(HUB.erou.butonPrincipal.href).toBe('/inregistrare')
    expect(HUB.erou.butonSecundar.href).toBe('/platforma')
  })

  it('cardurile sunt 2 + 4 + 1, din foaia Solutii a meniului, fiecare sector o singura data', () => {
    const [principale, alte, transport] = HUB.benzi
    expect([principale.elemente.length, alte.elemente.length, transport.elemente.length]).toEqual([2, 4, 1])
    const caiCarduri = HUB.benzi.flatMap((b) => b.elemente.map((e) => e.href))
    expect(new Set(caiCarduri).size).toBe(7)
    expect(new Set(caiCarduri)).toEqual(new Set(CAI_ASTEPTATE.slice(1)))
    // Numele, iconita si tinta vin din meniu; descrierea poate fi proprie hub-ului (DESCRIERI_HUB,
    // ca benzile sa tina la 390 randurile referintei), dar e servita in HTML.
    for (const e of HUB.benzi.flatMap((b) => b.elemente)) {
      const dinMeniu = FOAIE_SOLUTII.elemente.find((m) => m.href === e.href)
      expect(dinMeniu).toBeDefined()
      expect({ ...e, descriere: '' }).toEqual({ ...dinMeniu, descriere: '' })
      expect(text).toContain(e.text)
      expect(text).toContain(e.descriere)
    }
  })

  it('cautarea are 4 file si fiecare fila are in HTML interogarea si fragmentul', () => {
    expect(HUB.cautare.file).toHaveLength(4)
    for (const f of HUB.cautare.file) {
      expect(text).toContain(f.eticheta)
      expect(text).toContain(f.interogare)
      expect(textInLinie(htmlHub)).toContain(textFragment(f.rezultat.fragment))
    }
  })

  it('caseta de conformitate are 8 insigne, fara nicio certificare pe care 3S nu o are', () => {
    expect(HUB.conformitate.insigne).toHaveLength(8)
    for (const i of HUB.conformitate.insigne) {
      expect(CERTIFICARI.test(i), i).toBe(false)
      expect(text).toContain(i)
    }
    // Martor: aceeasi verificare prinde insignele de certificare, scrise generic (standarde publice).
    for (const i of ['ISO 27001', 'SOC 2 Type II', 'Conform DORA', 'Certificat NIST']) expect(CERTIFICARI.test(i), i).toBe(true)
  })

  it('faptele din caseta sunt CONFIRMATE in registru (gazduirea, stocarea proprie, functiile, platformele)', () => {
    const stare = new Map(registru.map((a) => [a.id, a.stare]))
    for (const id of ['solutii-functii-existente', 'solutii-gazduire-amazon-germania', 'solutii-stocare-proprie', 'solutii-aplicatie-pe-toate-platformele']) {
      expect(stare.get(id), id).toBe('confirmat')
    }
    // Martor: registrul chiar are si afirmatii neconfirmate, deci verificarea deosebeste starile.
    expect(stare.get('solutii-criptare-aes-256-tls')).toBe('neconfirmat')
  })

  it('7 intrebari, un singur nod FAQPage, cu @id distinct de al sectoarelor', () => {
    expect(htmlHub.match(/aria-expanded="false"/g)?.length).toBe(7)
    const faq = noduriJsonLd(htmlHub).filter((n) => n['@type'] === 'FAQPage')
    expect(faq).toHaveLength(1)
    const iduri = new Set([faq[0]['@id'], ...SECTOARE.map((s) => urlAbsolut(s.cale) + '#intrebari')])
    expect(iduri.size).toBe(8)
    // Martor: acelasi constructor, pe alta cale, da alt @id.
    expect(grafIntrebari('/solutii/x', 'x', [])['@graph'][0]['@id']).not.toBe(faq[0]['@id'])
  })

  it('textul vizibil nu are linii lungi (en, em)', () => {
    expect(areLiniiInterzise(text)).toBe(false)
  })
})

describe('formatiile scenei hartiilor', () => {
  // Din fisele de sector: numarul total de foi (cu cei 3 eroi) si durata asamblarii.
  const FISA: Record<Formatie, { total: number; ms: number }> = {
    piramida: { total: 62, ms: 2268 },
    raft: { total: 66, ms: 2324 },
    turnuri: { total: 49, ms: 2086 },
    bibliorafturi: { total: 81, ms: 2534 },
    drum: { total: 63, ms: 2282 },
    perete: { total: 63, ms: 2282 },
    cercuri: { total: 61, ms: 2254 },
  }

  it('fiecare sector are alta formatie si alta samanta, iar formatia e cea din fisa lui', () => {
    const formatii = SECTOARE.map((s) => s.schimbare.formatie)
    expect(formatii).toEqual(['piramida', 'raft', 'turnuri', 'bibliorafturi', 'drum', 'perete', 'cercuri'])
    expect(new Set(SECTOARE.map((s) => s.schimbare.samanta)).size).toBe(7)
  })

  for (const f of Object.keys(FISA) as Formatie[]) {
    it(f + ': ' + FISA[f].total + ' de foi cu eroii, asamblare in ' + FISA[f].ms + ' ms', () => {
      const t = tinteFormatie(f, creeazaAleator(7))
      expect(t.foi).toHaveLength(FOI_PE_FORMATIE[f])
      expect(t.foi.length + t.eroi.length).toBe(FISA[f].total)
      expect(durataAsamblare(t.foi.length + t.eroi.length)).toBe(FISA[f].ms)
      for (const x of [...t.foi, ...t.eroi]) {
        for (const v of [x.pozitie.x, x.pozitie.y, x.pozitie.z, x.rotatie.x, x.rotatie.y, x.rotatie.z]) expect(Number.isFinite(v)).toBe(true)
      }
    })
  }

  it('piramida: 9 randuri de 9, 9, 8, 8, 7, 6, 5, 4, 3 foi, pas 0,78 x 0,5, de la y 0,5', () => {
    const { foi } = tinteFormatie('piramida', creeazaAleator(1))
    const peRand = new Map<number, number[]>()
    for (const x of foi) {
      const y = Math.round(x.pozitie.y * 100) / 100
      peRand.set(y, [...(peRand.get(y) ?? []), x.pozitie.x])
    }
    const randuri = [...peRand.keys()].sort((a, b) => a - b)
    expect(randuri).toEqual([0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5])
    expect(randuri.map((y) => peRand.get(y)!.length)).toEqual([9, 9, 8, 8, 7, 6, 5, 4, 3])
    const primul = peRand.get(0.5)!.sort((a, b) => a - b)
    expect(primul[1] - primul[0]).toBeCloseTo(0.78, 6)
  })

  it('formatiile cu abateri sunt deterministe pe samanta; alta samanta le schimba (martor)', () => {
    for (const f of ['bibliorafturi', 'cercuri'] as Formatie[]) {
      expect(tinteFormatie(f, creeazaAleator(4409))).toEqual(tinteFormatie(f, creeazaAleator(4409)))
      expect(tinteFormatie(f, creeazaAleator(4409))).not.toEqual(tinteFormatie(f, creeazaAleator(4410)))
    }
  })
})

describe('miscarea scenei', () => {
  it('asamblarea foloseste iesirea cubica 1 - (1 - t)^3, prinsa la capete', () => {
    expect(iesireCubica(0)).toBe(0)
    expect(iesireCubica(1)).toBe(1)
    expect(iesireCubica(0.5)).toBeCloseTo(0.875, 10)
    expect(iesireCubica(-1)).toBe(0)
    expect(iesireCubica(2)).toBe(1)
    let anterior = -1
    for (let i = 0; i <= 20; i++) {
      const v = iesireCubica(i / 20)
      expect(v).toBeGreaterThan(anterior)
      anterior = v
    }
  })

  it('orbitele foilor stau in intervalele fisei, cu aproximativ 15% in sens invers', () => {
    const aleator = creeazaAleator(1101)
    const orbite = Array.from({ length: 4000 }, () => orbitaFoaie(aleator))
    for (const o of orbite) {
      expect(o.raza).toBeGreaterThanOrEqual(2)
      expect(o.raza).toBeLessThanOrEqual(5.4)
      expect(Math.abs(o.viteza)).toBeGreaterThanOrEqual(0.1)
      expect(Math.abs(o.viteza)).toBeLessThanOrEqual(0.26)
      expect(o.inaltime).toBeGreaterThanOrEqual(0.5)
      expect(o.inaltime).toBeLessThanOrEqual(3.4)
      expect(o.amplitudine).toBeGreaterThanOrEqual(0.25)
      expect(o.amplitudine).toBeLessThanOrEqual(0.75)
      expect(o.frecventa).toBeGreaterThanOrEqual(0.4)
      expect(o.frecventa).toBeLessThanOrEqual(0.9)
      expect(Math.abs(o.rostogolire[0])).toBeLessThanOrEqual(0.45)
      expect(Math.abs(o.rostogolire[1])).toBeLessThanOrEqual(0.55)
      expect(Math.abs(o.rostogolire[2])).toBeLessThanOrEqual(0.35)
    }
    const inversa = orbite.filter((o) => o.viteza < 0).length / orbite.length
    expect(inversa).toBeGreaterThan(0.12)
    expect(inversa).toBeLessThan(0.18)
  })

  it('eroii orbiteaza mai aproape (1,4 / 1,9 / 2,4), mai sus pe rand, de 0,55 ori mai incet', () => {
    for (let i = 0; i < 3; i++) {
      const baza = orbitaFoaie(creeazaAleator(99 + i))
      const erou = orbitaErou(creeazaAleator(99 + i), i)
      expect(erou.raza).toBe([1.4, 1.9, 2.4][i])
      expect(erou.inaltime).toBe([1.4, 2.1, 2.8][i])
      expect(erou.viteza).toBeCloseTo(baza.viteza * 0.55, 12)
      expect(erou.rostogolire[1]).toBeCloseTo(baza.rostogolire[1] * 0.3, 12)
    }
  })

  it('orbita e o elipsa turtita la 0,62 in adancime, in jurul verticalei', () => {
    const o = orbitaFoaie(creeazaAleator(5))
    for (const t of [0, 1.3, 7.9, 40]) {
      const p = pozaOrbita(o, t).pozitie
      expect((p.x / o.raza) ** 2 + (p.z / (o.raza * 0.62)) ** 2).toBeCloseTo(1, 9)
      expect(Math.abs(p.y - o.inaltime)).toBeLessThanOrEqual(o.amplitudine + 1e-9)
    }
    // Martor: fara turtire (adancimea egala cu raza) relatia nu mai tine.
    const p = pozaOrbita(o, 1.3).pozitie
    if (Math.abs(p.z) > 0.1) expect((p.x / o.raza) ** 2 + (p.z / o.raza) ** 2).not.toBeCloseTo(1, 3)
  })
})

describe('datele fictive ale consolei', () => {
  const clienti = CONTABILITATE.consola!.clienti

  it('fiecare cod fiscal din macheta e INVALID (cifra de control gresita)', () => {
    expect(clienti.length).toBeGreaterThan(0)
    for (const c of clienti) expect(cuiValid(c.cui), c.nume + ' ' + c.cui).toBe(false)
  })

  it('martor: verificatorul recunoaste un cod construit corect si respinge unul modificat', () => {
    const corp = '1234567'
    const valid = corp + String(cifraControl(corp + '0'))
    expect(cuiValid(valid)).toBe(true)
    const gresit = corp + String((Number(valid.at(-1)) + 1) % 10)
    expect(cuiValid(gresit)).toBe(false)
  })

  it('macheta se declara exemplu, iar codurile nu se repeta', () => {
    expect(CONTABILITATE.consola!.bara.pastila).toMatch(/exemplu/i)
    expect(new Set(clienti.map((c) => c.cui)).size).toBe(clienti.length)
  })

  it('firmele din macheta sunt EVIDENT fictive (decizia D11): fiecare nume poarta „Exemplu”', () => {
    for (const c of clienti) expect(c.nume, c.nume).toMatch(/\bExemplu\b/)
    // Martor: un nume plauzibil, care ar putea exista la registrul comertului, e refuzat.
    expect('Termoinstal Grup SRL').not.toMatch(/\bExemplu\b/)
  })
})

describe('eticheta vizibila „exemplu” a machetelor cu nume (decizia D11)', () => {
  it('cautarile cu nume de firme sau de persoane au in HTML-ul servit eticheta din colt', () => {
    for (const s of [CONTABILITATE, NOTARIATE]) {
      expect(s.pasi.demo.insigna, s.cale).toMatch(/exemplu/i)
      const html = htmlSector(s)
      expect(html, s.cale).toContain('data-insigna-exemplu')
      expect(textVizibil(html)).toContain(s.pasi.demo.insigna!)
      // Numele din cautare sunt si ele evident fictive.
      expect(textFragment(s.pasi.demo.rezultat.fragment)).toMatch(/\bExemplu\b/)
    }
    // Martor: un sector fara nume in cautare nu primeste eticheta, deci verificarea deosebeste.
    expect(htmlSector(CONSTRUCTII)).not.toContain('data-insigna-exemplu')
  })
})

describe('consola: eticheta indicatorului se acorda cu numarul', () => {
  const consola = CONTABILITATE.consola!
  const text = textVizibil(htmlSector(CONTABILITATE))

  it('1 cere singularul, 0 si 2 sau mai mult cer pluralul', () => {
    const forme = { unul: 'depășit', multe: 'depășite' }
    expect(formaNumar(1, forme)).toBe('depășit')
    for (const n of [0, 2, 3, 12]) expect(formaNumar(n, forme)).toBe('depășite')
  })

  it('pe pagina un card cu valoarea 1 poarta singularul etichetei, nu pluralul', () => {
    // Formele se citesc din continut, nu se scriu aici: proba urmareste eticheta, oricare ar fi ea.
    const { depasite, noi } = consola.indicatori
    const rand = (n: number, eticheta: string) => new RegExp('(^|\\s)' + n + ' ' + eticheta + '(\\s|$)')
    // Controlul: macheta chiar are un card cu un singur termen expirat, deci verificarea se exercita.
    expect(consola.clienti.some((c) => c.depasite === 1)).toBe(true)
    expect(depasite.unul).not.toBe(depasite.multe)
    expect(text).toMatch(rand(1, depasite.unul))
    expect(text).not.toMatch(rand(1, depasite.multe))
    expect(text).not.toMatch(rand(1, noi.multe))
    // Martor: fara acord, randul gresit ar fi fost prins de aceeasi verificare.
    expect(' 1 ' + depasite.multe + ' ').toMatch(rand(1, depasite.multe))
  })
})

describe('afirmatiile de sector care cer o permisiune sau o incadrare legala', () => {
  // HTML-ul intreg, cu datele structurate: raspunsurile intrebarilor inchise stau acolo.
  // Tiparul tinteste custodia, nu cuvantul „depozit” in general: un depozit de marfa dintr-un exemplu
  // nu e o afirmatie de custodie.
  const CUSTODIE = /depozitul (?:ei|lor)|depozit\w* din afara|se preia|preia arhiva|se predă|predați arhiva|aduc\w* înapoi|firma-mamă/i

  // Locul scanarii e un serviciu operational neconfirmat (retras in runda 2): nici custodia, nici sediul.
  const LOC_SCANARE = /sediul biroului|scanate la sediu|nu pleacă (?:de acolo|din)/i

  it('notariatele: doar functia produsului; nicio predare, nicio custodie, niciun loc al scanarii', () => {
    const html = htmlSector(NOTARIATE)
    expect(html).not.toMatch(CUSTODIE)
    expect(html).not.toMatch(LOC_SCANARE)
    expect(textVizibil(html)).toContain('după numele părților')
    expect(htmlHub).not.toMatch(LOC_SCANARE)
    // Si cardul notariatelor de pe hub: descrierea proprie inlocuieste textul meniului cu custodia.
    expect(htmlHub).not.toMatch(CUSTODIE)
    const stare = new Map(registru.map((a) => [a.id, a.stare]))
    expect(stare.get('solutii-notari-custodie')).toBe('retras')
    expect(stare.get('solutii-notari-scanare-la-sediu')).toBe('retras')
    // Martor: formularea retrasa in runda 2 e prinsa de tiparul locului.
    expect('Volumele se scanează la sediul biroului și nu pleacă de acolo.').toMatch(LOC_SCANARE)
    // Martor: formularea retrasa e prinsa de acelasi tipar.
    expect('Cu 3S, arhiva se preia cu proces-verbal, iar originalul stă într-un depozit din afara biroului.').toMatch(CUSTODIE)
  })

  it('constructiile: nicio declaratie de performanta pentru materiale; al treilea moment e procesul-verbal al hidroizolatiei', () => {
    const html = htmlSector(CONSTRUCTII)
    const performanta = /declarați\w* de performanță pentru oțel|DoP_/i
    expect(html).not.toMatch(performanta)
    expect(CONSTRUCTII.momente.lista[2].fisier).toBe('PV_ascunse_hidroizolatie.pdf')
    expect(textVizibil(html)).toContain('hidroizolația a fost verificată înainte de acoperire')
    // Martor: randul vechi e prins de acelasi tipar.
    expect('Comisia vrea declarațiile de performanță pentru oțelul-beton livrat în martie.').toMatch(performanta)
  })
})
