import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { afterEach, describe, expect, it, vi } from 'vitest'
import modelD2 from '../config/model-d2.json'
import rute from '../config/juridic-rute.json'
import { CHEI_ART13, verificaOperatorPentruTexte } from '../src/content/juridic/confidentialitate'
import { familiePublicata, verificaComutator } from '../src/content/juridic/comutator'
import { CHEI_L284 } from '../src/content/juridic/cookie-uri'
import { familieDinTara, familieJuridica } from '../src/content/juridic/familie'
import { grupaPentruCale } from '../src/content/juridic/harta'
import { documentMdBrut, documentPentruSlug, rezolvaLegaturi, texteJuridice } from '../src/content/juridic/index'
import { MESAJ_S_C, conditiiActive, intrariMasurare, masurareDin, type Masurare } from '../src/content/juridic/masurare'
import { valoareCamp } from '../src/content/juridic/md/context'
import { CHEI_MD, MARCAJ_SECTIUNI_MD, REGISTRU_MD, cheiPublicate, tintaLegatura, type CheieMd } from '../src/content/juridic/md/registru'
import { META_DOCUMENTE_MD, linieVersiuneMd } from '../src/content/juridic/pagini'
import { ruteJuridice, ruteJuridiceMd } from '../src/content/juridic/publicare'
import { textIntreg, textSimplu, type BlocJuridic, type DocumentJuridic, type LimbaJuridica } from '../src/content/juridic/tipuri'
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
        for (const t of tinte.filter((x) => x.startsWith('/'))) {
          expect([...Object.values(REGISTRU_MD).flatMap((r) => [r.en, r.ro])], cheie + ' ' + t).toContain(t)
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
    // Numarate in blocurile publicabile ale pachetului: 4, 4, 2 si 1 (raportul conversiei)
    expect(numara('](cale:preturi)')).toBe(4)
    expect(numara('](cale:securitate-si-locul-datelor)')).toBe(4)
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
