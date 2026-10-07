import { mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { createElement, type ComponentType } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { afterEach, describe, expect, it, vi } from 'vitest'
import modelD2 from '../config/model-d2.json'
import rute from '../config/juridic-rute.json'
import { CHEI_ART13, verificaOperatorPentruTexte } from '../src/content/juridic/confidentialitate'
import { familiePublicata, verificaComutator } from '../src/content/juridic/comutator'
import { CHEI_L284 } from '../src/content/juridic/cookie-uri'
import { familieDinTara, familieJuridica } from '../src/content/juridic/familie'
import { grupaPentruCale } from '../src/content/juridic/harta'
import { contextMd, documentMdBrut, documentPentruSlug, rezolvaLegaturi, texteJuridice } from '../src/content/juridic/index'
import { MESAJ_S_C, conditiiActive, intrariMasurare, masurareDin, type Masurare } from '../src/content/juridic/masurare'
import { valoareCamp } from '../src/content/juridic/md/context'
import { CHEI_MD, MARCAJ_SECTIUNI_MD, REGISTRU_MD, cheiPublicate, tintaLegatura, type CheieMd } from '../src/content/juridic/md/registru'
import { META_DOCUMENTE_MD, linieVersiuneMd } from '../src/content/juridic/pagini'
import { ruteJuridice, ruteJuridiceMd } from '../src/content/juridic/publicare'
import { textIntreg, textPentruAmprenta, textSimplu, type BlocJuridic, type DocumentJuridic, type LimbaJuridica } from '../src/content/juridic/tipuri'
import CorpDocument, { type CorpDocumentIntrare } from '../src/components/juridic/CorpDocument'
import type { PaginaContinut } from '../src/content/model/tipuri'
import type { Operator } from '../src/lib/operator'

/**
 * Felia 73: familia juridica `md` (operatorul din Republica Moldova). Criteriul de gata, punct cu punct:
 * (1) 6 documente la poarta B, in romana si in engleza; (3) paritatea RO-EN pe cele 8 perechi; (4) zero
 * acolade duble si zero marcaje de data in module, cu control pozitiv; tokenurile de legatura din afara
 * pachetului rezolvate fara oprire. G-MD-02 (cazul pozitiv) sta in `tests/seo-geo-gdpr.test.ts`.
 *
 * FIXTURILE se asambleaza la RULARE: operatorul de proba e modelul `OPERATOR_JSON` al pachetului
 * juridic (3S Demerzel SRL, cu marcajul D2 pe cele trei campuri ale extrasului), compus aici din bucati;
 * tiparele pe care le vaneaza probele (acoladele duble, marcajele de data) se lipesc tot din bucati.
 */

vi.hoisted(() => {
  process.env.OPERATOR_JSON = ''
  process.env.UMAMI_URL = ''
  process.env.UMAMI_WEBSITE_ID = ''
  process.env.NEXT_PUBLIC_GA4_ID = ''
})

afterEach(() => {
  vi.unstubAllEnvs()
})

const RADACINA = join(__dirname, '..')
const DOSAR_MD = join(RADACINA, 'src', 'content', 'juridic', 'md')
const MODULE_MD = readdirSync(DOSAR_MD).filter((f) => /\.(ro|en)\.ts$/.test(f))
const sursa = (f: string) => readFileSync(join(DOSAR_MD, f), 'utf8')

const D2 = modelD2.marcaj.ro

/** Operatorul-model al pachetului juridic, asamblat la rulare. */
function operatorModel(extra: Partial<Operator> = {}): Operator {
  return {
    denumire: ['3S', 'Demerzel', 'SRL'].join(' '),
    sediu: D2,
    email: ['contact', ['3s', 'md'].join('.')].join('@'),
    telefon: ['+373', '68', '055', '599'].join(' '),
    numar_orc: D2,
    cod_fiscal: D2,
    tara: ['Republica', 'Moldova'].join(' '),
    dpo: '',
    ...extra,
  }
}

const S0: Masurare = { stare: 'S0', ga4: false }
const STARI: { nume: string; m: Masurare; linkedin: boolean }[] = [
  { nume: 'S0', m: S0, linkedin: false },
  { nume: 'S-GA4', m: { stare: 'S-GA4', ga4: true }, linkedin: false },
  { nume: 'S-B', m: { stare: 'S-B', ga4: false }, linkedin: true },
  { nume: 'S-B cu GA4', m: { stare: 'S-B', ga4: true }, linkedin: false },
]

const PUBLICATE_B: CheieMd[] = ['informatii-legale', 'confidentialitate', 'cookie-uri', 'termeni', 'notificare-si-actiune', 'inteligenta-artificiala']

/** Toate sirurile unui document, cu marcaj (pentru cautari de legaturi si tokenuri). */
function siruri(d: DocumentJuridic): string[] {
  const bloc = (b: BlocJuridic) => [
    ...(b.eticheta ? [b.eticheta] : []),
    ...b.paragrafe,
    ...(b.lista?.elemente ?? []),
    ...Object.values(b.lista?.subelemente ?? {}).flat(),
    ...(b.tabel ? [b.tabel.titlu, ...(b.tabel.antet ?? []), ...b.tabel.randuri.flat().flatMap((c) => (typeof c === 'string' ? [c] : [c.text, c.detaliu]))] : []),
    ...(b.dupa ?? []),
  ]
  return [d.titlu, d.introducere, ...(d.preambul ?? []).flatMap(bloc), ...d.sectiuni.flatMap((s) => [s.titlu, ...s.blocuri.flatMap(bloc)])]
}

// ---------------------------------------------------------------------------------------------
// A. Familia si modelul D2
// ---------------------------------------------------------------------------------------------

describe('familia textelor dupa tara operatorului', () => {
  it('Republica Moldova -> md (lista inchisa, dupa normalizare); SEE -> see; restul opreste construirea', () => {
    expect(familieJuridica(operatorModel())).toBe('md')
    for (const tara of ['Moldova', ' republica  moldova ', 'REPUBLICA MOLDOVA']) expect(familieDinTara(tara), tara).toBe('md')
    expect(familieDinTara('România')).toBe('see')
    expect(() => familieJuridica(operatorModel({ tara: 'Statele Unite' }))).toThrow(/reprezentant/)
    // Martor: o forma din afara listei inchise nu e ghicita drept Moldova
    expect(familieDinTara('Moldova, Republica')).toBeNull()
  })

  it('verificaOperatorPentruTexte pastreaza numai completitudinea si numeste sursa reala', () => {
    expect(() => verificaOperatorPentruTexte(operatorModel())).not.toThrow()
    const sursaMediu = ['OPERATOR', 'JSON'].join('_')
    expect(() => verificaOperatorPentruTexte(operatorModel({ email: '' }), sursaMediu)).toThrow(new RegExp('email din ' + sursaMediu))
  })

  it('D2: valoareCamp da marcajul limbii numai pe campurile admise si numai pe marcajul exact (NFC)', () => {
    expect(valoareCamp(operatorModel(), 'sediu', 'en')).toBe(modelD2.marcaj.en)
    expect(valoareCamp(operatorModel(), 'numar_orc', 'ro')).toBe(D2)
    expect(valoareCamp(operatorModel({ cod_fiscal: D2.normalize('NFD') }), 'cod_fiscal', 'en')).toBe(modelD2.marcaj.en)
    // Martori negativi: camp neadmis, marcaj fara diacritice, valoare reala
    expect(valoareCamp(operatorModel({ denumire: D2 }), 'denumire', 'en')).toBe(D2)
    const faraDiacritice = D2.normalize('NFD').replace(/[̀-ͯ]/g, '')
    expect(valoareCamp(operatorModel({ sediu: faraDiacritice }), 'sediu', 'en')).toBe(faraDiacritice)
    const idno = ['100', '360', '000', '0000'].join('')
    expect(valoareCamp(operatorModel({ numar_orc: idno }), 'numar_orc', 'en')).toBe(idno)
  })

  it('01, sectiunea 1: eticheta registrului e IDNO, iar celula lui vine din operator', () => {
    for (const limba of ['ro', 'en'] as const) {
      const tabel = documentMdBrut('informatii-legale', operatorModel(), limba, S0).sectiuni[0].blocuri.find((b) => b.tabel)?.tabel
      if (!tabel) throw new Error('01 fara tabelul din sectiunea 1')
      const rand = tabel.randuri.find((r) => typeof r[0] === 'string' && r[0].includes('(IDNO)'))
      expect(rand?.[1], limba).toBe(modelD2.marcaj[limba])
      const idno = ['100', '360', '000', '0000'].join('')
      const cuIdno = documentMdBrut('informatii-legale', operatorModel({ numar_orc: idno }), limba, S0).sectiuni[0].blocuri.find((b) => b.tabel)?.tabel
      expect(cuIdno?.randuri.find((r) => r[0] === rand?.[0])?.[1], limba).toBe(idno)
    }
    expect(textIntreg(documentMdBrut('informatii-legale', operatorModel(), 'ro', S0))).not.toContain('registrul comerțului')
  })
})

// ---------------------------------------------------------------------------------------------
// B. Starea masurarii (decizia 13: S-C nu se publica)
// ---------------------------------------------------------------------------------------------

describe('starea masurarii', () => {
  it('S0, S-GA4, S-B din intrari; S-C (Umami fara acord) opreste construirea', () => {
    expect(masurareDin({ ga4: false, umami: false, umamiAsteaptaAcordul: false })).toEqual(S0)
    expect(masurareDin({ ga4: true, umami: false, umamiAsteaptaAcordul: false })).toEqual({ stare: 'S-GA4', ga4: true })
    expect(masurareDin({ ga4: true, umami: true, umamiAsteaptaAcordul: true })).toEqual({ stare: 'S-B', ga4: true })
    expect(() => masurareDin({ ga4: false, umami: true, umamiAsteaptaAcordul: false })).toThrow(MESAJ_S_C)
    expect([...conditiiActive({ stare: 'S-B', ga4: false })].sort()).toEqual(['activ', 'banner', 'umami', 'umami-b'])
    expect([...conditiiActive(S0)]).toEqual(['s0'])
  })

  it('drumul real cu UMAMI_* in mediu: S-B si textele se construiesc; fara asteptarea acordului, S-C e refuzata', () => {
    // Pana la felia masurarii S-B, UMAMI_ASTEAPTA_ACORDUL era false si cazul cerea refuzul S-C pe drumul real (textele si
    // comutatorul). De atunci constanta e true (decizia 13: Umami porneste numai dupa acord), deci acelasi drum da S-B si
    // construieste textele. Refuzul S-C ramane aparat aici pe intrarile reale, cu asteptarea acordului scoasa explicit, si pe
    // build de mutantul din tests/analitica-s-b.test.ts.
    const umami = { UMAMI_URL: 'https://' + ['statistica', 'proba', 'test'].join('.'), UMAMI_WEBSITE_ID: '0f1e2d3c-4b5a-4968-8776-a5b4c3d2e1f0' }
    expect(intrariMasurare(operatorModel(), umami).umami).toBe(true)
    expect(masurareDin(intrariMasurare(operatorModel(), umami)).stare).toBe('S-B')
    expect(() => masurareDin(intrariMasurare(operatorModel(), umami, false))).toThrow(MESAJ_S_C)
    vi.stubEnv('UMAMI_URL', umami.UMAMI_URL)
    vi.stubEnv('UMAMI_WEBSITE_ID', umami.UMAMI_WEBSITE_ID)
    expect(texteJuridice(operatorModel(), { limba: 'en' })?.size).toBe(6)
    expect(() => verificaComutator(operatorModel())).not.toThrow()
    vi.unstubAllEnvs()
    expect(texteJuridice(operatorModel(), { limba: 'en' })?.size).toBe(6)
    expect(() => verificaComutator(operatorModel())).not.toThrow()
  })

  it('niciun bloc al starii S-C nu a intrat in module (nu exista cheie pentru el)', () => {
    const umamiC = ['umami', 'c'].join('-')
    const pozitia = '[' + ['poziția', 'juristului'].join(' ')
    for (const f of MODULE_MD) {
      expect(sursa(f), f).not.toContain('"' + umamiC + '"')
      expect(sursa(f), f).not.toContain(pozitia)
    }
    // Controlul: aceeasi cautare prinde cheia intr-un text asamblat
    expect('conditie: ["' + umamiC + '"]').toContain('"' + umamiC + '"')
  })
})

// ---------------------------------------------------------------------------------------------
// C. Criteriul (1): 6 documente la poarta B, in ambele limbi; 8 la C
// ---------------------------------------------------------------------------------------------

describe('publicarea pe poarta', () => {
  it('texteJuridice(model, ro) si (model, en) intorc exact cele 6 chei ale portii B; 05 si 06 lipsesc', () => {
    expect(rute.poarta_curenta).toBe('B')
    for (const limba of ['ro', 'en'] as const) {
      const t = texteJuridice(operatorModel(), { limba })
      expect([...(t?.keys() ?? [])], limba).toEqual(PUBLICATE_B)
      expect(t?.has('dpa')).toBe(false)
      expect(t?.has('subimputerniciti')).toBe(false)
      for (const [cheie, d] of t ?? []) {
        expect(d.limba, cheie).toBe(limba)
        expect(d.cheie).toBe(cheie)
      }
    }
    expect(cheiPublicate('C')).toEqual([...CHEI_MD])
    expect([...(texteJuridice(operatorModel(), { limba: 'ro', poarta: 'C', masurare: S0 })?.keys() ?? [])]).toEqual([...CHEI_MD])
  })

  it('documentPentruSlug gaseste documentul dupa slugul romanesc sau englezesc; unul nepublicat arunca', () => {
    const en = texteJuridice(operatorModel(), { limba: 'en' })
    if (!en) throw new Error('fara texte EN')
    expect(documentPentruSlug(en, 'privacy')).toBe(en.get('confidentialitate'))
    expect(documentPentruSlug(en, 'cookies')).toBe(en.get('cookie-uri'))
    expect(() => documentPentruSlug(en, 'dpa')).toThrow(/dpa/)
  })

  it('familia SEE nu are engleza; familia md nu are forma veche cu adresa ca sir', () => {
    const see = operatorModel({ tara: 'România', sediu: 'Strada Exemplului 1, Pitesti' })
    expect(() => texteJuridice(see, { limba: 'en' })).toThrow(/numai cu limba/)
    expect(() => texteJuridice(operatorModel(), 'https://' + ['3s', 'md'].join('.'))).toThrow(/forma veche/)
    expect(familiePublicata(operatorModel())).toBe('md')
    expect(familiePublicata(null)).toBeNull()
  })
})

// ---------------------------------------------------------------------------------------------
// D. Legaturile interne (criteriul 4, partea a doua)
// ---------------------------------------------------------------------------------------------

describe('legaturile interne pe cheie', () => {
  const legaturi = (d: DocumentJuridic) => siruri(d).flatMap((s) => [...s.matchAll(/\]\(([^)\s]+)\)/g)].map((m) => m[1]))

  it('la poarta B: nicio cheie nerezolvata, nicio legatura spre 05 sau 06, propozitia ramane', () => {
    for (const limba of ['ro', 'en'] as const) {
      for (const [cheie, d] of texteJuridice(operatorModel(), { limba }) ?? []) {
        const tinte = legaturi(d)
        expect(tinte.filter((t) => /^cale(-ro)?:/.test(t)), cheie).toEqual([])
        // O tinta interna e un document al registrului sau o pagina legata PUBLICATA in configurare, in limba
        // paginii (felia 132: Termeni 15.11 duce la sectiunea existenta `securitate-si-locul-datelor`).
        const legatePublicate = Object.values(rute.pagini_legate as Record<string, { en: string | null; ro: string | null; publicata: boolean }>)
          .filter((p) => p.publicata && p[limba] !== null)
          .map((p) => p[limba] as string)
        for (const t of tinte.filter((x) => x.startsWith('/'))) {
          expect([...Object.values(REGISTRU_MD).flatMap((r) => [r.en, r.ro]), ...legatePublicate], cheie + ' ' + t).toContain(t)
          expect([REGISTRU_MD.dpa[limba], REGISTRU_MD.subimputerniciti[limba]], cheie).not.toContain(t)
        }
      }
    }
    const ro = texteJuridice(operatorModel(), { limba: 'ro' })?.get('informatii-legale')
    const alte = ro?.sectiuni.find((s) => s.cheie === 's11')?.blocuri[0].lista?.elemente ?? []
    // Legatura scoasa, textul pastrat
    expect(alte.some((e) => textSimplu(e) === e && e.includes('(DPA)'))).toBe(true)
  })

  it('la poarta C, legaturile spre 05 si 06 exista, in limba paginii', () => {
    const ro = texteJuridice(operatorModel(), { limba: 'ro', poarta: 'C', masurare: S0 })?.get('informatii-legale')
    expect(ro && legaturi(ro)).toContain(REGISTRU_MD.dpa.ro)
    const en = texteJuridice(operatorModel(), { limba: 'en', poarta: 'C', masurare: S0 })?.get('informatii-legale')
    expect(en && legaturi(en)).toContain(REGISTRU_MD.subimputerniciti.en)
  })

  it('pagina EN de informatii legale trimite la versiunea autentica, in romana (cale-ro)', () => {
    const en = texteJuridice(operatorModel(), { limba: 'en' })?.get('informatii-legale')
    expect(en && legaturi(en)).toContain(REGISTRU_MD['informatii-legale'].ro)
  })

  it('tokenurile din afara pachetului sunt cunoscute si se rezolva fara oprire, in toate starile, la B si la C', () => {
    const numara = (tipar: string) => MODULE_MD.reduce((n, f) => n + sursa(f).split(tipar).length - 1, 0)
    // Numarate in blocurile publicabile ale pachetului: 4, 4, 2 si 1 (raportul conversiei). Felia 132 (decizia 74,
    // marcajele de lucru din termeni): 3.8 trimite numai la DPA si la descrierea data in scris, la cerere, deci
    // `securitate-si-locul-datelor` ramane numai in 15.11, RO si EN: 2 din cele 4.
    expect(numara('](cale:preturi)')).toBe(4)
    expect(numara('](cale:securitate-si-locul-datelor)')).toBe(2)
    expect(numara('](cale:comutare-si-export)')).toBe(2)
    expect(numara('](cale-ro:')).toBe(1)
    for (const { m, linkedin } of STARI) {
      for (const poarta of ['B', 'C'] as const) {
        for (const limba of ['ro', 'en'] as const) {
          expect(() => texteJuridice(operatorModel(), { limba, poarta, masurare: m, linkedin })).not.toThrow()
        }
      }
    }
    // preturi: pagina /pricing nu e publicata inca -> text; cheile nescrise -> text
    expect(tintaLegatura('cale', 'preturi', 'en')).toEqual({ fel: 'text' })
    expect(tintaLegatura('cale', 'comutare-si-export', 'ro')).toEqual({ fel: 'text' })
  })

  it('Termeni 15.11 identifica sectiunea existenta a site-ului (Data Act art. 28 alin. (2)) si nu declara publicate masurile', () => {
    // Felia 132, reparatia rundei 3: clauza trimitea la cheia `securitate-si-locul-datelor` cu adrese nule, deci la
    // randare nu purta nicio adresa, iar EN spunea ca masurile "are published" desi sectiunea nu le are inca.
    // Cheia duce acum la ancora existenta a paginii despre 3S, iar masurile sunt un angajament la viitor, EN = RO.
    expect(tintaLegatura('cale', 'securitate-si-locul-datelor', 'en')).toEqual({ fel: 'adresa', cale: '/about#security' })
    expect(tintaLegatura('cale', 'securitate-si-locul-datelor', 'ro')).toEqual({ fel: 'adresa', cale: '/ro/securitate#security' })
    const clauza: Record<'ro' | 'en', [string, RegExp, RegExp]> = {
      ro: ['/ro/securitate#security', /3S va adăuga în aceeași secțiune/, /măsurilor[^.]*(?:se publică|sunt publicate)/],
      en: ['/about#security', /3S will add to the same section/, /measures[^.]*(?:are published|is published)/],
    }
    for (const limba of ['ro', 'en'] as const) {
      const d = texteJuridice(operatorModel(), { limba })?.get('termeni')
      expect(d).toBeDefined()
      const p = siruri(d as DocumentJuridic).find((x) => x.includes('15.11'))
      expect(p).toBeDefined()
      const [adresa, viitor, prezent] = clauza[limba]
      expect(p).toContain('](' + adresa + ')')
      expect(p).toMatch(viitor)
      expect(p).not.toMatch(prezent)
    }
  })

  it('martor POZITIV: o cheie necunoscuta opreste construirea; un URL extern ramane neatins', () => {
    const necunoscuta = ['cheie', 'inventata'].join('-')
    expect(() => rezolvaLegaturi('Vezi [pagina](cale:' + necunoscuta + ').', 'ro')).toThrow(new RegExp(necunoscuta))
    const extern = '[site](https://' + ['exemplu', 'test'].join('.') + ')'
    expect(rezolvaLegaturi(extern, 'en')).toBe(extern)
  })
})

// ---------------------------------------------------------------------------------------------
// E. Criteriul (4): sursa modulelor, fara tokenuri, fara marcaje de data, fara note de redactare
// ---------------------------------------------------------------------------------------------

describe('modulele convertite', () => {
  const ACOLADE = '{' + '{'
  // Marcajul de data (intre paranteze drepte), nu sintagma: 05 RO spune in proza, legitim, ca Moldova nu
  // figureaza pe lista de adecvare „la data publicării” (singura aparitie, verificata mai jos).
  const DATA = '[' + ['data', 'publicării'].join(' ') + ']'
  const DATA_EN = '[' + ['publication', 'date'].join(' ') + ']'
  const NOTE = [['Nota', 'de', 'redactare'].join(' '), ['Drafting', 'note'].join(' '), ['NOTA', 'DE', 'REDACTARE'].join('-'), ['TEXT', 'PUBLICABIL'].join('-'), ['BLOC', 'TEMPORAR'].join('-')]
  const gaseste = (text: string, ace: string[]) => ace.filter((a) => text.includes(a))

  it('sunt 16 (8 chei x ro/en), fiecare cu sha256 al sursei in antet', () => {
    expect(MODULE_MD.sort()).toEqual(CHEI_MD.flatMap((c) => [c + '.en.ts', c + '.ro.ts']).sort())
    for (const f of MODULE_MD) expect(sursa(f), f).toMatch(/sha256 [0-9a-f]{64}\./)
  })

  it('zero acolade duble, zero marcaje de data si zero note de redactare; controlul prinde fiecare', () => {
    for (const f of MODULE_MD) expect(gaseste(sursa(f), [ACOLADE, DATA, DATA_EN, ...NOTE]), f).toEqual([])
    // Controale pozitive, pe fixturi asamblate: aceeasi functie prinde fiecare ac
    for (const ac of [ACOLADE, DATA, DATA_EN, ...NOTE]) expect(gaseste('x ' + ac + ' y', [ACOLADE, DATA, DATA_EN, ...NOTE])).toContain(ac)
    // Sintagma fara paranteze apare o singura data, in proza din 05 RO
    const sintagma = DATA.slice(1, -1)
    expect(MODULE_MD.filter((f) => sursa(f).includes(sintagma))).toEqual(['dpa.ro.ts'])
    expect(sursa('dpa.ro.ts').split(sintagma).length - 1).toBe(1)
  })

  it('linia versiunii: formula pachetului, cu data; EN in forma americana', () => {
    expect(linieVersiuneMd('2026-10-01', 'ro')).toBe('Ultima actualizare: 1 octombrie 2026')
    expect(linieVersiuneMd('2026-10-01', 'en')).toBe('Last updated: October 1, 2026')
    expect(() => linieVersiuneMd('01.10.2026', 'en')).toThrow()
    for (const cheie of CHEI_MD) expect(documentMdBrut(cheie, operatorModel(), 'ro', S0).versiune, cheie).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })

  it('metadata pe limba respecta pragurile portii SEO (titlu 15-65, descriere 50-160)', () => {
    for (const cheie of CHEI_MD) {
      for (const limba of ['ro', 'en'] as const) {
        const m = META_DOCUMENTE_MD[cheie][limba]
        expect(m.titlu.length, cheie + limba).toBeGreaterThanOrEqual(15)
        expect(m.titlu.length, cheie + limba).toBeLessThanOrEqual(65)
        expect(m.descriere.length, cheie + limba).toBeGreaterThanOrEqual(50)
        expect(m.descriere.length, cheie + limba).toBeLessThanOrEqual(160)
      }
    }
  })
})

// ---------------------------------------------------------------------------------------------
// F. Criteriul (3): paritatea RO-EN pe cele 8 perechi
// ---------------------------------------------------------------------------------------------

type Amprenta = { paragrafe: number; elemente: number; sub: number; randuri: number; dupa: number; cifre: string; legaturi: string; marcaje: number }

const CIFRE = /\d+/g
/** Marcajele: text intre paranteze drepte care nu e textul unei legaturi. */
const MARCAJ = /\[[^\]]+\](?!\()/g

function amprentaBloc(b: BlocJuridic): Amprenta {
  const toate = [
    ...(b.eticheta ? [b.eticheta] : []),
    ...b.paragrafe,
    ...(b.lista?.elemente ?? []),
    ...Object.values(b.lista?.subelemente ?? {}).flat(),
    ...(b.tabel ? [...(b.tabel.antet ?? []), ...b.tabel.randuri.flat().flatMap((c) => (typeof c === 'string' ? [c] : [c.text, c.detaliu]))] : []),
    ...(b.dupa ?? []),
  ]
  const text = toate.join('\n')
  return {
    paragrafe: b.paragrafe.length,
    elemente: b.lista?.elemente.length ?? 0,
    sub: Object.values(b.lista?.subelemente ?? {}).flat().length,
    randuri: b.tabel?.randuri.length ?? 0,
    dupa: b.dupa?.length ?? 0,
    // Cifrele fara ordine: engleza americana muta ziua dupa luna in date
    cifre: (textSimplu(text).match(CIFRE) ?? []).sort().join(','),
    // Tintele legaturilor: cheile interne si adresele externe; `cale-ro` e trimiterea EN spre originalul romanesc
    legaturi: [...text.matchAll(/\]\(([^)\s]+)\)/g)].map((m) => m[1]).filter((t) => !t.startsWith('cale-ro:')).join(','),
    marcaje: (text.match(MARCAJ) ?? []).length,
  }
}

function amprentaDocument(d: DocumentJuridic) {
  return {
    introducere: amprentaBloc({ jurisdictie: null, paragrafe: d.introducere === '' ? [] : [d.introducere] }),
    preambul: (d.preambul ?? []).map(amprentaBloc),
    sectiuni: d.sectiuni.map((s) => ({ cheie: s.cheie, nivel: s.nivel ?? 2, cifreTitlu: (s.titlu.match(CIFRE) ?? []).join(','), blocuri: s.blocuri.map(amprentaBloc) })),
  }
}

describe('paritatea RO-EN', () => {
  for (const cheie of CHEI_MD) {
    it(cheie + ': aceleasi sectiuni, blocuri, cifre, legaturi si marcaje, in fiecare stare', () => {
      for (const { nume, m, linkedin } of STARI) {
        const ro = documentMdBrut(cheie, operatorModel(), 'ro', m, linkedin)
        const en = documentMdBrut(cheie, operatorModel(), 'en', m, linkedin)
        expect(amprentaDocument(en), cheie + ' / ' + nume).toEqual(amprentaDocument(ro))
      }
    })
  }

  it('singura diferenta de legaturi: trimiterea EN spre originalul romanesc, in 01', () => {
    const cuRo = (l: LimbaJuridica) =>
      CHEI_MD.flatMap((c) => siruri(documentMdBrut(c, operatorModel(), l, S0))).join('\n').split('](cale-ro:').length - 1
    expect(cuRo('en')).toBe(1)
    expect(cuRo('ro')).toBe(0)
  })

  it('martor POZITIV: o cifra schimbata intr-o singura limba strica paritatea', () => {
    const ro = documentMdBrut('termeni', operatorModel(), 'ro', S0)
    const en = structuredClone(documentMdBrut('termeni', operatorModel(), 'en', S0))
    const bloc = en.sectiuni[1].blocuri[0]
    bloc.paragrafe[0] = bloc.paragrafe[0] + ' ' + String(7 * 11)
    expect(amprentaDocument(en)).not.toEqual(amprentaDocument(ro))
  })
})

// ---------------------------------------------------------------------------------------------
// G. Registrul, rutele si harta
// ---------------------------------------------------------------------------------------------

describe('registrul si rutele familiei md', () => {
  it('adresele confirmate: EN sub /legal, RO sub /ro/juridic, 05 si 06 la poarta C', () => {
    expect(ruteJuridiceMd('en').map((r) => r.cale)).toEqual([
      '/legal/legal-information',
      '/legal/privacy',
      '/legal/cookies',
      '/legal/terms',
      '/legal/notice-and-action',
      '/legal/ai-notice',
    ])
    expect(ruteJuridiceMd('ro').map((r) => r.cale)).toEqual([
      '/ro/juridic/informatii-legale',
      '/ro/juridic/confidentialitate',
      '/ro/juridic/cookies',
      '/ro/juridic/termeni',
      '/ro/juridic/notificare-si-actiune',
      '/ro/juridic/inteligenta-artificiala',
    ])
    expect([REGISTRU_MD.dpa.poarta, REGISTRU_MD.subimputerniciti.poarta]).toEqual(['C', 'C'])
    expect(ruteJuridiceMd('en', 'C').map((r) => r.cale)).toEqual(expect.arrayContaining(['/legal/dpa', '/legal/subprocessors']))
  })

  it('familia md nu are paginile /juridic ale familiei SEE; SEE le are pe toate opt', () => {
    expect(ruteJuridice(true, 'md')).toEqual([])
    expect(ruteJuridice(true, 'see')).toHaveLength(8)
    expect(ruteJuridice(false, 'see')).toEqual([])
  })

  it('grupa Juridic a hartii recunoaste /legal si /ro/juridic', () => {
    expect(grupaPentruCale('/legal/privacy')).toBe('Juridic')
    expect(grupaPentruCale('/ro/juridic/cookies')).toBe('Juridic')
    // Control: o pagina de produs de pe acelasi domeniu nu cade in Juridic
    expect(grupaPentruCale('/pricing')).toBe('Produs')
  })

  it('maparea sectiunilor pe data-art13 si data-l284 acopera toate cheile portilor, pe sectiuni care exista in ambele limbi', () => {
    const verifica = (cheie: 'confidentialitate' | 'cookie-uri', chei: readonly string[]) => {
      const harta = MARCAJ_SECTIUNI_MD[cheie].sectiuni as Record<string, string>
      expect(Object.keys(harta).sort()).toEqual([...chei].sort())
      for (const limba of ['ro', 'en'] as const) {
        const existente = documentMdBrut(cheie, operatorModel(), limba, S0).sectiuni.map((s) => s.cheie)
        for (const [k, sectiune] of Object.entries(harta)) expect(existente, cheie + ' ' + k).toContain(sectiune)
      }
    }
    verifica('confidentialitate', CHEI_ART13)
    verifica('cookie-uri', CHEI_L284)
  })
})

// ---------------------------------------------------------------------------------------------
// H. Preambulul si subelementele pe pagina (felia 95)
// ---------------------------------------------------------------------------------------------

/** Cere compilatorului ca `A` sa fie atribuibil lui `B`; altfel typecheck-ul pica aici. */
type Atribuibil<A extends B, B> = A extends B ? true : never

describe('CorpDocument randeaza preambulul si subelementele documentelor md', () => {
  type Randator = ComponentType<{ document: CorpDocumentIntrare }>

  /** Textul randat, fara etichete si cu entitatile HTML ale lui React decodate: ce citeste omul. */
  const textRandat = (html: string) =>
    html
      .replace(/<[^>]+>/g, '')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#x27;/g, "'")
      .replace(/&#39;/g, "'")
      .replace(/&amp;/g, '&')
  const randeaza = (d: CorpDocumentIntrare, C: Randator = CorpDocument) => renderToStaticMarkup(createElement(C, { document: d }))

  /** Sirurile unui bloc, cu marcaj, in ordinea din pagina (ca `textBloc`). */
  const sirurileBlocului = (b: BlocJuridic) => [
    ...(b.eticheta ? [b.eticheta] : []),
    ...b.paragrafe,
    ...(b.lista?.elemente ?? []).flatMap((e, i) => [e, ...(b.lista?.subelemente?.[i] ?? [])]),
    ...(b.tabel ? [b.tabel.titlu, ...(b.tabel.antet ?? []), ...b.tabel.randuri.flat().flatMap((c) => (typeof c === 'string' ? [c] : [c.text, c.detaliu]))] : []),
    ...(b.dupa ?? []),
  ]
  const subelementeDin = (d: DocumentJuridic) =>
    [...(d.preambul ?? []), ...d.sectiuni.flatMap((x) => x.blocuri)].flatMap((b) => Object.values(b.lista?.subelemente ?? {}).flat())

  /** Toate documentele md, la poarta C (cele 8 chei), in ambele limbi si in fiecare stare a masurarii. */
  const toate = () =>
    STARI.flatMap(({ nume, m, linkedin }) =>
      (['ro', 'en'] as const).flatMap((limba) =>
        [...(texteJuridice(operatorModel(), { limba, poarta: 'C', masurare: m, linkedin }) ?? [])].map(([cheie, d]) => ({ eticheta: cheie + '.' + limba + ' / ' + nume, d })),
      ),
    )

  /** Corpul din amprenta: `textPentruAmprenta` fara titlu si fara linia versiunii (aici goala). */
  function corpAmprenta(d: DocumentJuridic): string {
    const tot = textPentruAmprenta(d, '')
    const titlu = textSimplu(d.titlu).replace(/\s+/g, '')
    if (!tot.startsWith(titlu)) throw new Error('amprenta nu incepe cu titlul')
    return tot.slice(titlu.length)
  }
  const faraSpatii = (html: string) => textRandat(html).replace(/\s+/g, '')

  /** Un document sintetic, asamblat la rulare: introducere, preambul cu o lista si o sectiune cu subelemente. */
  function sintetic(): DocumentJuridic {
    const cuv = (n: number) => ['Alfa', 'Beta', 'Gama', 'Delta', 'Epsilon', 'Zeta', 'Eta'][n] + ' ' + String(n * 13)
    return {
      titlu: 'Document ' + cuv(0),
      introducere: 'Introducerea ' + cuv(1),
      preambul: [{ jurisdictie: null, paragrafe: ['Preambulul ' + cuv(2)], lista: { elemente: ['Rezumat ' + cuv(3)] } }],
      sectiuni: [
        {
          cheie: 's1',
          titlu: 'Sectiunea ' + cuv(4),
          blocuri: [{ jurisdictie: null, paragrafe: [], lista: { numerotata: true, elemente: ['Pasul ' + cuv(5)], subelemente: { 0: ['Subpunctul ' + cuv(6)] } } }],
        },
      ],
    }
  }

  it('tipul de intrare primeste si DocumentJuridic, si corpul paginilor de continut (verificat de compilator)', () => {
    const atribuibile: [Atribuibil<DocumentJuridic, CorpDocumentIntrare>, Atribuibil<{ introducere: string; sectiuni: PaginaContinut['sectiuni'] }, CorpDocumentIntrare>] = [true, true]
    expect(atribuibile).toEqual([true, true])
  })

  it('fiecare sir din preambul si din subelemente apare in HTML-ul randat, pe fiecare document md', () => {
    const lipsa: string[] = []
    let cuPreambul = 0
    let cuSubelemente = 0
    let siruri = 0
    for (const { eticheta, d } of toate()) {
      const text = textRandat(randeaza(d))
      const asteptate = [...(d.preambul ?? []).flatMap(sirurileBlocului), ...subelementeDin(d)].map(textSimplu)
      if ((d.preambul ?? []).length > 0) cuPreambul++
      if (subelementeDin(d).length > 0) cuSubelemente++
      siruri += asteptate.length
      const gasite = asteptate.filter((a) => text.includes(a))
      if (gasite.length !== asteptate.length) lipsa.push(eticheta + ': ' + gasite.length + ' din ' + asteptate.length)
    }
    expect(lipsa).toEqual([])
    // Controlul ca bucla a vazut campurile: 5 chei cu preambul si 1 cu subelemente, x 2 limbi x 4 stari.
    expect(cuPreambul).toBe(5 * 2 * STARI.length)
    expect(cuSubelemente).toBe(1 * 2 * STARI.length)
    expect(siruri).toBeGreaterThan(cuPreambul)
  })

  it('martor POZITIV: preambulul si subpunctul unui document sintetic se randeaza; martor NEGATIV: fara preambul, niciun element gol', () => {
    const d = sintetic()
    const html = randeaza(d)
    expect(html).toContain('data-preambul')
    for (const a of [d.preambul?.[0].paragrafe[0], d.sectiuni[0].blocuri[0].lista?.subelemente?.[0][0]]) expect(textRandat(html)).toContain(a)
    // Subpunctul sta IN elementul lui de lista, intr-o lista cu buline
    expect(html).toMatch(/<li>Pasul [^<]*<ul class="[^"]*"><li>Subpunctul /)
    const fara = { ...d, preambul: undefined, sectiuni: [{ ...d.sectiuni[0], blocuri: [{ jurisdictie: null, paragrafe: ['x'], lista: { elemente: ['y'] } }] }] }
    const htmlFara = randeaza(fara)
    expect(htmlFara).not.toContain('data-preambul')
    expect(htmlFara).not.toMatch(/<ul[^>]*><\/ul>|<div[^>]*><\/div>/)
    expect(randeaza({ ...fara, preambul: [] })).toBe(htmlFara)
  })

  it('ordinea: textul randat, fara spatii, e corpul din amprenta, pe fiecare document md', () => {
    const diferite: string[] = []
    let n = 0
    for (const { eticheta, d } of toate()) {
      n++
      if (faraSpatii(randeaza(d)) !== corpAmprenta(d)) diferite.push(eticheta)
    }
    expect(diferite).toEqual([])
    expect(n).toBe(8 * 2 * STARI.length)
    // Martor POZITIV: documentul sintetic, cu introducere nevida, preambul si subelemente
    expect(faraSpatii(randeaza(sintetic()))).toBe(corpAmprenta(sintetic()))
  })

  it('mutant: o copie a componentei cu preambulul inaintea introducerii inroseste proba ordinii', async () => {
    const dosar = join(RADACINA, 'src', 'components', 'juridic')
    const sursa = readFileSync(join(dosar, 'CorpDocument.tsx'), 'utf8')
    const inceputIntro = sursa.indexOf('{document.introducere === ""')
    const inceputPreambul = sursa.indexOf('{preambul.length === 0')
    const inceputSectiuni = sursa.indexOf('{document.sectiuni.map')
    expect([inceputIntro, inceputPreambul, inceputSectiuni].every((i) => i > 0) && inceputIntro < inceputPreambul && inceputPreambul < inceputSectiuni).toBe(true)
    const intro = sursa.slice(inceputIntro, inceputPreambul)
    const preambul = sursa.slice(inceputPreambul, inceputSectiuni)
    const mutant = (sursa.slice(0, inceputIntro) + preambul + intro + sursa.slice(inceputSectiuni))
      .replace('from "./TextInLinie"', 'from ' + JSON.stringify(pathToFileURL(join(dosar, 'TextInLinie.tsx')).href))
      .replace('from "./juridic.module.css"', 'from ' + JSON.stringify(pathToFileURL(join(dosar, 'juridic.module.css')).href))
    expect(mutant).not.toBe(sursa)
    expect(mutant.indexOf('{preambul.length === 0')).toBeLessThan(mutant.indexOf('{document.introducere === ""'))
    const d = mkdtempSync(join(tmpdir(), 'corp-mutant-'))
    try {
      const f = join(d, 'CorpDocument.tsx')
      writeFileSync(f, mutant, 'utf8')
      const m = (await import(/* @vite-ignore */ pathToFileURL(f).href)) as { default: Randator }
      // Controlul ca mutantul randeaza: acelasi text, alta ordine
      const html = randeaza(sintetic(), m.default)
      expect(faraSpatii(html).length).toBe(corpAmprenta(sintetic()).length)
      expect(faraSpatii(html)).not.toBe(corpAmprenta(sintetic()))
    } finally {
      rmSync(d, { recursive: true, force: true })
    }
  })
})

// ---------------------------------------------------------------------------------------------
// I. Politica de confidentialitate: datele verificarii in s. 6 si jurnalul dupa incetare in s. 3, 4, 15
// ---------------------------------------------------------------------------------------------

/**
 * De ce exista (felia 132, runda 3): s. 6 spunea „la data ultimei actualizari a paginii” despre doua
 * liste externe (Cadrul UE-SUA si lista de adecvare a Comisiei). Orice schimbare de text din ALTA sectiune
 * muta `versiune` si re-data afirmatia fara ca listele sa fi fost recitite. Acum fiecare afirmatie isi
 * poarta data verificarii, scrisa literal; proba schimba `versiune` pe o COPIE a modulului si cere ca
 * afirmatia sa ramana pe data ei, iar un mutant (tot pe copie) care readuce formula relativa o inroseste.
 * A doua parte: randul din s. 7 (jurnalul de activitate dupa incetare, 3S operator, interes legitim) are
 * corespondent in tabelul din s. 3, in lista interesului legitim din s. 4 si in exceptia din s. 15.
 */
describe('Politica: datele verificarii (s. 6) si jurnalul dupa incetare (s. 3, 4, 15)', () => {
  // Data ultimei recitiri documentate a celor doua liste; se schimba numai cu o recitire noua.
  const DATA_VERIFICARII: Record<LimbaJuridica, string> = { ro: ['7', 'octombrie', '2026'].join(' '), en: ['October', '7,', '2026'].join(' ') }
  // Formula relativa la versiune, asamblata din bucati: proba nu poarta intreg ce vaneaza.
  const RELATIVA: Record<LimbaJuridica, string> = { ro: ['ultimei', 'actualizări'].join(' '), en: ['last', 'update', 'of', 'this', 'page'].join(' ') }
  const JURNAL: Record<LimbaJuridica, RegExp> = { ro: /jurnal\w* de activitate/i, en: /activity log/i }
  const NOTIFICARI: Record<LimbaJuridica, RegExp> = { ro: /notificăril/, en: /notices/ }
  const INTERES: Record<LimbaJuridica, RegExp> = { ro: /lit\. f\)/, en: /6\(1\)\(f\)/ }

  const textSectiune = (d: DocumentJuridic, cheie: string) =>
    textIntreg({ ...d, titlu: '', introducere: '', preambul: [], sectiuni: d.sectiuni.filter((s) => s.cheie === cheie) })
  const textCelula = (c: string | { text: string }) => (typeof c === 'string' ? c : c.text)

  /** Ce e gresit in s. 6: lista goala inseamna ca ambele afirmatii au data lor si nicio formula relativa. */
  function defecteS6(d: DocumentJuridic, limba: LimbaJuridica): string[] {
    const t = textSectiune(d, 's6')
    const defecte: string[] = []
    if (t.split(DATA_VERIFICARII[limba]).length - 1 !== 2) defecte.push('data verificarii nu apare de 2 ori')
    if (t.includes(RELATIVA[limba])) defecte.push('formula relativa la versiune')
    const an = (d.versiune ?? '').slice(0, 4)
    if (t.includes(an) && !DATA_VERIFICARII[limba].includes(an)) defecte.push('anul versiunii in s. 6')
    return defecte
  }

  /** Ce lipseste in s. 3, 4 si 15 fata de randul jurnalului din s. 7. */
  function lipsuriJurnal(d: DocumentJuridic, limba: LimbaJuridica): string[] {
    const blocuri = (cheie: string) => d.sectiuni.filter((s) => s.cheie === cheie).flatMap((s) => s.blocuri)
    const randuri = (cheie: string) => blocuri(cheie).flatMap((b) => b.tabel?.randuri ?? []).map((r) => r.map(textCelula))
    const elemente = (cheie: string) => blocuri(cheie).flatMap((b) => b.lista?.elemente ?? [])
    const lipsuri: string[] = []
    if (!randuri('s7').some((r) => JURNAL[limba].test(r[0] ?? ''))) lipsuri.push('s7')
    if (!randuri('s3').some((r) => JURNAL[limba].test(r[1] ?? '') && INTERES[limba].test(r[3] ?? ''))) lipsuri.push('s3')
    if (!elemente('s4').some((e) => JURNAL[limba].test(e) && NOTIFICARI[limba].test(e))) lipsuri.push('s4')
    if (!elemente('s15').some((e) => JURNAL[limba].test(e) && e.includes('3S Demerzel SRL') && INTERES[limba].test(e))) lipsuri.push('s15')
    return lipsuri
  }

  it('s. 6 in ambele limbi: fiecare afirmatie pe o lista externa are data ei, fara formula relativa', () => {
    for (const limba of ['ro', 'en'] as const) expect(defecteS6(documentMdBrut('confidentialitate', operatorModel(), limba, S0), limba), limba).toEqual([])
  })

  it('pe o COPIE a modulului cu alta `versiune`, s. 6 ramane pe data ei; mutantul cu formula relativa e prins', async () => {
    const d = mkdtempSync(join(tmpdir(), 'conf-versiune-'))
    try {
      for (const limba of ['ro', 'en'] as const) {
        const original = sursa('confidentialitate.' + limba + '.ts')
        const importuri = (s: string) =>
          s
            .replaceAll('from "./context"', 'from ' + JSON.stringify(pathToFileURL(join(DOSAR_MD, 'context.ts')).href))
            .replaceAll('from "../tipuri"', 'from ' + JSON.stringify(pathToFileURL(join(DOSAR_MD, '..', 'tipuri.ts')).href))
        const versiuneNoua = ['2031', '03', '15'].join('-')
        const copie = importuri(original.replace(/versiune: "\d{4}-\d{2}-\d{2}"/, 'versiune: "' + versiuneNoua + '"'))
        const formula = limba === 'ro' ? 'La data ' + RELATIVA.ro + ' a paginii' : 'At the date of the ' + RELATIVA.en
        const mutant = copie.replace((limba === 'ro' ? 'La ' : 'On ') + DATA_VERIFICARII[limba], formula)
        // Controalele: copia a schimbat versiunea, mutantul a schimbat textul
        expect(copie).not.toBe(importuri(original))
        expect(mutant).not.toBe(copie)
        const incarca = async (nume: string, text: string) => {
          const f = join(d, nume + '.' + limba + '.ts')
          writeFileSync(f, text, 'utf8')
          const m = (await import(/* @vite-ignore */ pathToFileURL(f).href)) as { default: (c: ReturnType<typeof contextMd>) => DocumentJuridic }
          return m.default(contextMd(operatorModel(), limba, S0, conditiiActive(S0, false), 'https://' + ['3s', 'md'].join('.')))
        }
        const doc = await incarca('copie', copie)
        expect(doc.versiune, limba).toBe(versiuneNoua)
        expect(defecteS6(doc, limba), limba).toEqual([])
        expect(defecteS6(await incarca('mutant', mutant), limba), limba).toContain('formula relativa la versiune')
      }
    } finally {
      rmSync(d, { recursive: true, force: true })
    }
  })

  it('randul jurnalului din s. 7 are corespondent in s. 3, s. 4 si s. 15, in fiecare stare si limba', () => {
    for (const { nume, m, linkedin } of STARI) {
      for (const limba of ['ro', 'en'] as const) {
        expect(lipsuriJurnal(documentMdBrut('confidentialitate', operatorModel(), limba, m, linkedin), limba), limba + ' / ' + nume).toEqual([])
      }
    }
  })

  it('martor POZITIV: fara randul din s. 3, fara elementul din s. 4 si fara exceptia din s. 15, detectorul le numeste', () => {
    for (const limba of ['ro', 'en'] as const) {
      const d = structuredClone(documentMdBrut('confidentialitate', operatorModel(), limba, S0))
      for (const s of d.sectiuni) {
        for (const b of s.blocuri) {
          if (s.cheie === 's3' && b.tabel) b.tabel.randuri = b.tabel.randuri.filter((r) => !JURNAL[limba].test(textCelula(r[1] ?? '')))
          if ((s.cheie === 's4' || s.cheie === 's15') && b.lista) b.lista.elemente = b.lista.elemente.filter((e) => !JURNAL[limba].test(e))
        }
      }
      expect(lipsuriJurnal(d, limba), limba).toEqual(['s3', 's4', 's15'])
    }
  })
})
