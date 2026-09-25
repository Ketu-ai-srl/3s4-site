import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { join } from 'node:path'
import { createElement, type ReactElement } from 'react'
import { prerenderToNodeStream } from 'react-dom/static'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { abateriMetadata } from '../src/components/seo/metadata'
import { caleArticol, type ArticolBlog } from '../src/content/blog/registru'
import { toateLegaturileNavigatiei } from '../src/content/navigatie'
import { ACTE } from '../src/content/juridic/acte'
import { AUTORITATI } from '../src/content/juridic/autoritati'
import { juridicPublicat, verificaComutator } from '../src/content/juridic/comutator'
import { CHEI_ART13 } from '../src/content/juridic/confidentialitate'
import { CHEI_L284, tabelCookie } from '../src/content/juridic/cookie-uri'
import { COOKIE_ALEGERE, FURNIZORI, furnizoriCategorie } from '../src/content/juridic/furnizori'
import { grupaPentruCale, grupeHarta } from '../src/content/juridic/harta'
import { documentPentruSlug, texteJuridice, type TexteJuridice } from '../src/content/juridic/index'
import { inRomania, randuriIdentificare } from '../src/content/juridic/mentiuni-legale'
import {
  DATA_DECLARATIE,
  GRUPE_HARTA,
  META_ACCESIBILITATE,
  META_DOCUMENTE,
  META_HARTA,
  META_INDEX_JURIDIC,
  declaratieAccesibilitate,
  linieVersiune,
} from '../src/content/juridic/pagini'
import {
  CALE_JURIDIC,
  DOCUMENTE_JURIDICE,
  SLUGURI_JURIDICE,
  caleDocument,
  ruteJuridice,
} from '../src/content/juridic/publicare'
import { subimputerniciti } from '../src/content/juridic/subimputerniciti'
import { ANCORA_ANEXA } from '../src/content/juridic/termeni'
import {
  dataInCuvinte,
  fragmenteInLinie,
  textIntreg,
  textPentruAmprenta,
  textSimplu,
  type DocumentJuridic,
} from '../src/content/juridic/tipuri'
import { RUTE, rutePentruHarta, type Ruta } from '../src/content/rute'
import { OPERATOR, type Operator } from '../src/lib/operator'

/**
 * Probele feliei `juridic` (valul S4-4; plan §9-§10; COMPONENTE §4.12). Probele de browser - paginile
 * construite, pe build-ul real si pe copia cu operator sintetic - sunt in tests/browser/juridic.spec.ts
 * si tests/browser/juridic-comutator.spec.ts.
 *
 * FIXTURILE se asambleaza la RULARE: operatorul sintetic are valori pe domeniul rezervat `.test`, iar
 * tiparele pe care le vaneaza portile (numar langa operator, trimiteri SOL, nume de terti, numele
 * firmei-mame, liniutele lungi) se lipesc din bucati, ca proba sa nu fie ea insasi o instanta a
 * defectului pentru alte porti.
 */

// Probele care reincarca modulele paginii (operatorul se schimba intre ele) transforma de fiecare
// data pagina, componentele si stilurile: masurat 1 s pe statia libera si peste 5 s pe una incarcata
// de alte rulari. Plafonul e al fisierului, nu al unui caz: niciun caz nu asteapta altceva.
vi.setConfig({ testTimeout: 60_000 })

const RADACINA = join(__dirname, '..')
const citeste = (cale: string) => readFileSync(join(RADACINA, cale), 'utf8')
const cere = createRequire(__filename)

/** Semnele diacritice combinate (U+0300-U+036F), construite la rulare. */
const SEMNE = new RegExp('[' + String.fromCharCode(0x300) + '-' + String.fromCharCode(0x36f) + ']', 'g')
/** Liniutele lungi (en si em), construite la rulare. */
const LINIUTE_LUNGI = new RegExp('[' + String.fromCharCode(0x2013) + String.fromCharCode(0x2014) + ']')
const SUSPENSIE = String.fromCharCode(0x2026)

/** Textul normalizat ca in poarta juridica: fara diacritice, spatii simple, minuscule. */
function normalizat(text: string): string {
  return text.normalize('NFD').replace(SEMNE, '').replace(/\s+/g, ' ').toLowerCase()
}

/** Operator sintetic COMPLET: fiecare camp din `_forma`, valori evident de proba. */
function operatorSintetic(extra: Partial<Operator> = {}): Operator {
  return {
    denumire: ['Trei S', 'Proba', 'SRL'].join(' '),
    sediu: 'Strada Exemplului 1, Pitesti',
    email: ['date', 'operator-3s.test'].join('@'),
    telefon: '+40 000 000 000',
    numar_orc: 'J03/0/2026',
    cod_fiscal: 'RO' + '0'.repeat(8),
    tara: 'România',
    dpo: '',
    ...extra,
  }
}

/** Forma operatorului sintetic din copia de browser: fara telefon, registru si cod fiscal. */
function operatorPartial(): Operator {
  return operatorSintetic({ telefon: '', numar_orc: '', cod_fiscal: '' })
}

const BAZA = 'https://3s4.ke2.in'

function texte(operator: Operator = operatorSintetic()): TexteJuridice {
  const t = texteJuridice(operator, BAZA)
  if (t === null) throw new Error('textele juridice nu s-au construit pentru operatorul sintetic')
  return t
}

const toateDocumentele = (t: TexteJuridice) => SLUGURI_JURIDICE.map((slug) => ({ slug, d: documentPentruSlug(t, slug) }))

afterEach(() => {
  vi.doUnmock('../config/operator.json')
  vi.resetModules()
})

// ---------------------------------------------------------------------------------------------
// A. Comutatorul paginilor (plan §9-§10)
// ---------------------------------------------------------------------------------------------

describe('comutatorul paginilor juridice', () => {
  it('fara operator nicio ruta juridica; cu operator complet, toate opt, in ordinea subsolului', () => {
    expect(ruteJuridice(juridicPublicat(null))).toEqual([])
    expect(juridicPublicat(null)).toBe(false)
    const cai = ruteJuridice(juridicPublicat(operatorSintetic())).map((r) => r.cale)
    expect(cai).toEqual([CALE_JURIDIC, ...SLUGURI_JURIDICE.map((s) => CALE_JURIDIC + '/' + s)])
    // Si operatorul fara telefon, registru si cod fiscal (al copiei de browser) e complet.
    expect(ruteJuridice(juridicPublicat(operatorPartial()))).toHaveLength(8)
  })

  it('martor POZITIV: un operator numit dar incomplet NU publica paginile', () => {
    expect(ruteJuridice(juridicPublicat(operatorSintetic({ email: '' })))).toEqual([])
    expect(ruteJuridice(juridicPublicat(operatorSintetic({ sediu: 'de completat' })))).toEqual([])
    expect(texteJuridice(operatorSintetic({ tara: '' }), BAZA)).toBeNull()
  })

  it('invariantul: un operator numit dar incomplet OPRESTE construirea; null si complet trec', () => {
    // Browserul vede numai "numit" (publicare.ts); fara invariant, paleta ar lega pagini neconstruite.
    expect(() => verificaComutator(operatorSintetic({ email: '' }))).toThrow(/lipsesc: email/)
    expect(() => verificaComutator(operatorSintetic({ sediu: 'de completat' }))).toThrow(/sediu/)
    expect(() => verificaComutator(null)).not.toThrow()
    expect(() => verificaComutator(operatorSintetic())).not.toThrow()
  })

  it('publicare.ts nu importa lib/operator: pachetul de browser primeste numai cheia operator', () => {
    const sursa = citeste('src/content/juridic/publicare.ts')
    expect(sursa).not.toMatch(/from ["'][^"']*lib\/operator["']/)
    // Controlul: aceeasi cautare prinde importul din modulul de server.
    expect(citeste('src/content/juridic/comutator.ts')).toMatch(/from ["'][^"']*lib\/operator["']/)
  })

  it('RUTE pe configurarea reala: harta si accesibilitatea mereu, paginile juridice numai cu operator', () => {
    const cai = RUTE.map((r) => r.cale)
    expect(cai).toContain('/harta-site')
    expect(cai).toContain('/accesibilitate')
    const juridice = cai.filter((c) => c === CALE_JURIDIC || c.startsWith(CALE_JURIDIC + '/'))
    expect(juridice).toEqual(juridicPublicat(OPERATOR) ? ruteJuridice(juridicPublicat(OPERATOR)).map((r) => r.cale) : [])
  })

  async function modulePornite(operator: Operator | null) {
    vi.resetModules()
    const reala = JSON.parse(citeste('config/operator.json')) as Record<string, unknown>
    vi.doMock('../config/operator.json', () => ({ default: { ...reala, operator } }))
    const rute = await import('../src/content/rute')
    const cai = await import('../src/content/cai')
    const pagina = await import('../src/app/juridic/[[...document]]/page')
    return { rute, cai, pagina }
  }

  it('cu operator sintetic: RUTE, harta XML si caile existente primesc cele opt pagini, iar pagina le construieste', async () => {
    const m = await modulePornite(operatorPartial())
    const asteptate = [CALE_JURIDIC, ...SLUGURI_JURIDICE.map(caleDocument)]
    const dinRute = m.rute.RUTE.map((r: Ruta) => r.cale)
    for (const c of asteptate) {
      expect(dinRute, c).toContain(c)
      expect(m.cai.CAI_EXISTENTE.has(c), c).toBe(true)
      expect(m.rute.rutePentruHarta().map((r: Ruta) => r.cale), c).toContain(c)
    }
    // Ordinea: paginile juridice inaintea hartii si a accesibilitatii, ca in coloana Juridic a subsolului.
    expect(dinRute.indexOf(caleDocument('subimputerniciti'))).toBeLessThan(dinRute.indexOf('/harta-site'))
    // Pagina construieste exact caile din RUTE, nici mai mult, nici mai putin.
    const construite = m.pagina.generateStaticParams().map((p: { document: string[] }) =>
      p.document.length === 0 ? CALE_JURIDIC : CALE_JURIDIC + '/' + p.document.join('/'),
    )
    expect([...construite].sort()).toEqual([...asteptate].sort())
    expect(m.pagina.dynamicParams).toBe(false)
  })

  it('martor POZITIV: cu operator numit dar incomplet, generateStaticParams opreste construirea', async () => {
    const m = await modulePornite({ ...operatorPartial(), email: '' })
    expect(() => m.pagina.generateStaticParams()).toThrow(/lipsesc: email/)
  })

  it('martor NEGATIV: cu operator null, pagina nu construieste nimic si RUTE nu are nicio pagina juridica', async () => {
    const m = await modulePornite(null)
    expect(m.pagina.generateStaticParams()).toEqual([])
    expect(m.rute.RUTE.some((r: Ruta) => r.cale.startsWith(CALE_JURIDIC))).toBe(false)
    // Controlul: aceeasi incarcare vede harta si accesibilitatea, deci RUTE chiar s-a citit.
    expect(m.rute.RUTE.map((r: Ruta) => r.cale)).toEqual(expect.arrayContaining(['/harta-site', '/accesibilitate']))
  })
})

// ---------------------------------------------------------------------------------------------
// B. Textele celor 7 documente (cu operator sintetic)
// ---------------------------------------------------------------------------------------------

/** Tiparele portilor, asamblate la rulare (poarta-juridic.py: L-10, L-09; C-01 pe nume). */
const TIPAR_L10 = new RegExp('\\bnum' + '[ae]r\\w*\\b.{0,120}?\\boperator')
const TIPARE_SOL = [
  new RegExp('consumers' + '/' + 'odr'),
  new RegExp('\\bsolutionarea\\s+online\\s+a\\s+' + 'litigiilor\\b'),
  new RegExp('\\bplatforma\\s+' + 'sol\\b'),
  new RegExp('\\bonline\\s+dispute\\s+' + 'resolution\\b'),
]
const NUME_TERTI = ['googletag' + 'manager', 'google' + '-analytics', 'gtag' + '/js', 'double' + 'click', 'analytics' + '.js']
const INTERZISE_G_MD_18 = ['conform ' + 'gdpr', 'certificat ' + 'gdpr', 'privacy ' + 'shield', 'nivel ' + 'adecvat']
const FIRMA_MAMA = ['ad', 'ria'].join('')

describe('documentele juridice', () => {
  const t = texte()

  it('toate sapte se construiesc, fiecare cu titlu, data versiunii si cel putin o sectiune', () => {
    for (const { slug, d } of toateDocumentele(t)) {
      expect(d.titlu.length, slug).toBeGreaterThan(5)
      expect(d.versiune, slug).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      expect(d.sectiuni.length, slug).toBeGreaterThan(0)
      // Cheile sectiunilor sunt unice in document: ele devin atribute si chei React.
      const chei = d.sectiuni.map((s) => s.cheie)
      expect(new Set(chei).size, slug).toBe(chei.length)
    }
  })

  it('nicio mentiune de inregistrare ca operator (L-10), nicio trimitere SOL (L-09), niciun tert (C-01)', () => {
    for (const { slug, d } of toateDocumentele(t)) {
      const n = normalizat(textIntreg(d))
      expect(TIPAR_L10.test(n), slug).toBe(false)
      for (const tipar of TIPARE_SOL) expect(tipar.test(n), slug + ' ' + tipar).toBe(false)
      for (const nume of NUME_TERTI) expect(n.includes(nume), slug + ' ' + nume).toBe(false)
    }
  })

  it('martor POZITIV: tiparele de mai sus prind fraza pe care o vaneaza', () => {
    expect(TIPAR_L10.test(normalizat('Num' + 'ărul de înregistrare ca operator de date este 1.'))).toBe(true)
    expect(TIPARE_SOL[1].test(normalizat('Soluționarea online a ' + 'litigiilor'))).toBe(true)
    expect(LINIUTE_LUNGI.test('a ' + String.fromCharCode(0x2014) + ' b')).toBe(true)
  })

  it('G-MD-18 pe toate documentele: nicio atestare nedovedita si nicio adecvare langa Moldova', () => {
    for (const { slug, d } of toateDocumentele(t)) {
      const n = normalizat(textIntreg(d))
      for (const f of INTERZISE_G_MD_18) expect(n, slug + ' ' + f).not.toContain(f)
      expect(/adecvar.{0,200}moldova|moldova.{0,200}adecvar/.test(n), slug).toBe(false)
    }
  })

  it('D10: numele firmei-mame nu apare in niciun document; doar cratima, nicio liniuta lunga', () => {
    for (const { slug, d } of toateDocumentele(t)) {
      const text = textIntreg(d)
      expect(text.toLowerCase().includes(FIRMA_MAMA), slug).toBe(false)
      expect(LINIUTE_LUNGI.test(text), slug).toBe(false)
    }
  })

  it('niciun termen in zile, ore sau luni inventat in termeni, licenta si lista subimputernicitilor', () => {
    // Termenele se decid de owner si de jurist (docs/ziua-operatorului.md); legea da regula fara cifra.
    for (const slug of ['termeni', 'subimputerniciti', 'licenta-software'] as const) {
      const text = textIntreg(documentPentruSlug(t, slug))
      expect(/\b\d+\s+(de\s+)?(zile|ore|luni|săptămâni)\b/i.test(text), slug).toBe(false)
    }
  })

  it('fiecare legatura interna trimite la o ruta juridica sau la o ruta numita in contractul de navigatie', () => {
    const juridice = new Set(ruteJuridice(juridicPublicat(operatorSintetic())).map((r) => r.cale))
    const navigatie = new Set(toateLegaturileNavigatiei().map((l) => l.ruta).filter((r): r is string => r !== null))
    const gasite: string[] = []
    const verifica = (sir: string, slug: string) => {
      for (const f of fragmenteInLinie(sir)) {
        if (f.fel !== 'legatura' || !f.adresa.startsWith('/')) continue
        const ruta = f.adresa.split('#')[0]
        gasite.push(ruta)
        expect(juridice.has(ruta) || navigatie.has(ruta), slug + ': ' + f.adresa).toBe(true)
      }
    }
    for (const { slug, d } of toateDocumentele(t)) {
      verifica(d.introducere, slug)
      for (const s of d.sectiuni) {
        for (const b of s.blocuri) for (const p of [...b.paragrafe, ...(b.lista?.elemente ?? []), ...(b.dupa ?? [])]) verifica(p, slug)
      }
    }
    // Controlul: documentele chiar au legaturi interne, deci bucla a verificat ceva.
    expect(gasite.length).toBeGreaterThan(10)
  })

  it('ancora anexei: separatorul exista inaintea anexei si legaturile spre ea o numesc exact', () => {
    const termeni = documentPentruSlug(t, 'termeni')
    const anexa = termeni.sectiuni.find((s) => s.ancoraInainte !== undefined)
    expect(anexa?.ancoraInainte).toBe(ANCORA_ANEXA)
    expect(termeni.introducere).toContain('](#' + ANCORA_ANEXA + ')')
    const articole = termeni.sectiuni.filter((s) => s.nivel === 3).map((s) => s.cheie)
    expect(articole).toEqual(Array.from({ length: 12 }, (_, i) => 'art-' + (i + 1)))
    // Articolul 4 urmeaza literele a)-h) din GDPR art. 28 alin. (3), plus instructiunea ilegala.
    const art4 = termeni.sectiuni.find((s) => s.cheie === 'art-4')?.blocuri[0].lista
    expect(art4?.numerotata).toBe(true)
    expect(art4?.elemente).toHaveLength(9)
  })
})

describe('mentiunile legale', () => {
  it('tabelul de identificare are numai campurile completate, niciodata o valoare goala', () => {
    const complet = randuriIdentificare(operatorSintetic())
    expect(complet.map((r) => r[0])).toEqual([
      'Denumirea',
      'Sediul',
      'Țara',
      'Nr. de ordine în registrul comerțului',
      'Cod de identificare fiscală',
      'E-mail',
      'Telefon',
    ])
    const partial = randuriIdentificare(operatorPartial())
    expect(partial.map((r) => r[0])).toEqual(['Denumirea', 'Sediul', 'Țara', 'E-mail'])
    for (const rand of [...complet, ...partial]) expect(String(rand[1]).trim()).not.toBe('')
  })

  it('datele operatorului vin din configurare, nu sunt scrise in sursa', () => {
    const o = operatorSintetic()
    const d = documentPentruSlug(texte(o), 'informatii-legale')
    const text = textIntreg(d)
    for (const camp of [o.denumire, o.sediu, o.email, o.telefon, o.numar_orc, o.cod_fiscal]) expect(text).toContain(camp)
    // Controlul: aceleasi valori nu exista in fisierul-sursa al documentului.
    const sursa = citeste('src/content/juridic/mentiuni-legale.ts')
    for (const camp of [o.denumire, o.email, o.numar_orc]) expect(sursa).not.toContain(camp)
  })

  it('autoritatile stau fiecare in blocul jurisdictiei ei (ca G-MD-10)', () => {
    const d = documentPentruSlug(texte(), 'informatii-legale')
    const blocuri = d.sectiuni.find((s) => s.cheie === 'supraveghere')?.blocuri ?? []
    const ro = blocuri.filter((b) => b.jurisdictie === 'ro').flatMap((b) => b.paragrafe).join(' ')
    const md = blocuri.filter((b) => b.jurisdictie === 'md').flatMap((b) => b.paragrafe).join(' ')
    expect(ro).toContain(AUTORITATI.ro.sigla)
    expect(ro).not.toContain(AUTORITATI.md.sigla)
    expect(md).toContain(AUTORITATI.md.sigla)
    expect(md).not.toContain(AUTORITATI.ro.sigla)
    // Un operator din alt stat SEE nu primeste ANSPDCP drept autoritate a sediului.
    const german = documentPentruSlug(texte(operatorSintetic({ tara: 'Germania' })), 'informatii-legale')
    const roGerman = german.sectiuni.find((s) => s.cheie === 'supraveghere')?.blocuri.find((b) => b.jurisdictie === 'ro')
    expect(roGerman?.paragrafe[0]).not.toContain(AUTORITATI.ro.sigla)
    expect(roGerman?.paragrafe[0]).toContain('Germania')
  })

  it('inRomania: forma cu si fara diacritice, nu alte tari', () => {
    expect(inRomania('România')).toBe(true)
    expect(inRomania(' romania ')).toBe(true)
    expect(inRomania('Germania')).toBe(false)
  })
})

describe('subimputernicitii, cookie-urile si regulile publice', () => {
  it('subimputernicitii vin din furnizori.ts: azi numai gazduirea platformei', () => {
    const gazduire = FURNIZORI.find((f) => f.cheie === 'gazduire-platforma')
    expect(subimputerniciti()).toEqual([expect.objectContaining({ furnizor: gazduire?.destinatar, tara: gazduire?.tara })])
    // Analitica site-ului nu e subimputernicit al platformei.
    expect(subimputerniciti().some((s) => s.furnizor.includes('Google'))).toBe(false)
  })

  it('tabelul de cookie-uri are exact ce declara panoul bannerului, cu durata si scopul din aceeasi sursa', () => {
    const tabel = tabelCookie()
    const asteptate = [COOKIE_ALEGERE, ...furnizoriCategorie('statistica').flatMap((f) => f.cookieuri)]
    expect(tabel.randuri).toHaveLength(asteptate.length)
    tabel.randuri.forEach((rand, i) => {
      expect(rand[0]).toEqual({ text: asteptate[i].nume, detaliu: asteptate[i].fel })
      expect(rand[2]).toBe(asteptate[i].durata)
      expect(rand[3]).toBe(asteptate[i].scop)
    })
  })

  it('cheile portilor raman pe sectiuni: 12 pe politica de confidentialitate, 8 pe cea de cookie-uri', () => {
    const t = texte()
    const politica = documentPentruSlug(t, 'confidentialitate').sectiuni.map((s) => s.cheie)
    expect(politica).toEqual([...CHEI_ART13])
    const cookie = documentPentruSlug(t, 'cookies').sectiuni.map((s) => s.cheie)
    for (const cheie of CHEI_L284) expect(cookie).toContain(cheie)
  })

  it('regulile publice trimit la adresele citite, fiecare cu data citirii', () => {
    const d = documentPentruSlug(texte(), 'politici-publice')
    const elemente = d.sectiuni.flatMap((s) => s.blocuri.flatMap((b) => b.lista?.elemente ?? []))
    expect(elemente).toHaveLength(Object.keys(ACTE).length)
    for (const a of Object.values(ACTE)) {
      expect(a.adresa).toMatch(/^https:\/\//)
      expect(elemente.some((e) => e.includes('](' + a.adresa + ')')), a.scurt).toBe(true)
      expect(elemente.some((e) => e.includes(dataInCuvinte(a.citit))), a.scurt).toBe(true)
    }
  })

  it('legea moldoveana: la adresa ei e o prezentare, deci lista spune asta si niciun alt document nu trimite acolo', () => {
    const t = texte()
    const adresa = ACTE.legea195md.adresa
    const md = documentPentruSlug(t, 'politici-publice')
      .sectiuni.flatMap((s) => s.blocuri.flatMap((b) => b.lista?.elemente ?? []))
      .find((e) => e.includes('](' + adresa + ')'))
    expect(md).toContain('prezentarea legii')
    expect(md).not.toContain('text citit')
    // Controlul: celelalte acte chiar spun "text citit", deci diferenta vine din date, nu din sablon.
    const gdpr = documentPentruSlug(t, 'politici-publice')
      .sectiuni.flatMap((s) => s.blocuri.flatMap((b) => b.lista?.elemente ?? []))
      .find((e) => e.includes('](' + ACTE.gdpr.adresa + ')'))
    expect(gdpr).toContain('text citit pe')
    for (const { slug, d } of toateDocumentele(t)) {
      if (slug === 'politici-publice') continue
      expect(JSON.stringify(d).includes(adresa), slug).toBe(false)
    }
  })
})

// ---------------------------------------------------------------------------------------------
// C. Marcajul in linie, versiunea si amprenta
// ---------------------------------------------------------------------------------------------

describe('marcajul in linie si amprenta', () => {
  it('accentul si legatura se desfac; textul simplu pierde numai marcajul', () => {
    const sir = 'A **bold** si [aici](/juridic/termeni#anexa-a), apoi [lege](https://exemplu.test/x?a=1).'
    expect(fragmenteInLinie(sir).map((f) => f.fel)).toEqual(['text', 'accent', 'text', 'legatura', 'text', 'legatura', 'text'])
    expect(textSimplu(sir)).toBe('A bold si aici, apoi lege.')
    expect(fragmenteInLinie('fara marcaj')).toEqual([{ fel: 'text', text: 'fara marcaj' }])
  })

  it('data versiunii se scrie in cuvinte; o data fara forma ISO opreste construirea', () => {
    expect(dataInCuvinte('2026-09-25')).toBe('25 septembrie 2026')
    expect(linieVersiune('2026-01-05')).toBe('Versiunea din 5 ianuarie 2026')
    for (const rau of ['25.09.2026', '2026-13-01', '2026-09-32', '']) expect(() => dataInCuvinte(rau), rau).toThrow()
  })

  it('amprenta: tot textul vizibil, fara spatii; o litera schimbata o schimba, o spatiere nu', () => {
    const d = documentPentruSlug(texte(), 'termeni')
    const linie = linieVersiune(d.versiune ?? '')
    const text = textPentruAmprenta(d, linie)
    expect(/\s/.test(text)).toBe(false)
    expect(text.startsWith(d.titlu.replace(/\s+/g, '') + linie.replace(/\s+/g, ''))).toBe(true)
    const altaLitera: DocumentJuridic = { ...d, titlu: d.titlu + 'x' }
    expect(textPentruAmprenta(altaLitera, linie)).not.toBe(text)
    const altaSpatiere: DocumentJuridic = { ...d, titlu: ' ' + d.titlu.replace(/ /g, '  ') + ' ' }
    expect(textPentruAmprenta(altaSpatiere, linie)).toBe(text)
  })
})

// ---------------------------------------------------------------------------------------------
// D. Paginile randate pe server (cu operator sintetic, module reincarcate)
// ---------------------------------------------------------------------------------------------

async function randeaza(element: ReactElement): Promise<string> {
  const { prelude } = await prerenderToNodeStream(element)
  const bucati: Buffer[] = []
  for await (const b of prelude) bucati.push(Buffer.from(b as Uint8Array))
  return Buffer.concat(bucati).toString('utf8')
}

/** Textul unui fragment HTML: fara etichete, cu entitatile de baza decodate. */
function textDinHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, '')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
}

async function paginaCuOperator(slug: string | null, operator: Operator | null = operatorPartial()): Promise<string> {
  vi.resetModules()
  const reala = JSON.parse(citeste('config/operator.json')) as Record<string, unknown>
  vi.doMock('../config/operator.json', () => ({ default: { ...reala, operator } }))
  const modul = await import('../src/app/juridic/[[...document]]/page')
  const element = await modul.default({ params: Promise.resolve({ document: slug === null ? [] : [slug] }) })
  return randeaza(element)
}

describe('paginile juridice randate', () => {
  it('politica de confidentialitate: cele 12 chei data-art13, in ordine; jurisdictiile despartite; un h1', async () => {
    const html = await paginaCuOperator('confidentialitate')
    const chei = [...html.matchAll(/data-art13="([^"]+)"/g)].map((m) => m[1])
    expect(chei).toEqual([...CHEI_ART13])
    expect(html).toContain('data-jurisdictie="ro"')
    expect(html).toContain('data-jurisdictie="md"')
    expect(html.match(/<h1[\s>]/g)).toHaveLength(1)
    expect(html).toMatch(/aria-current="page"[^>]*>Politica de confidențialitate</)
  })

  it('politica de cookie-uri: cele 8 chei data-l284, fara alte chei pe atributul portii', async () => {
    const html = await paginaCuOperator('cookies')
    const chei = [...html.matchAll(/data-l284="([^"]+)"/g)].map((m) => m[1])
    expect([...chei].sort()).toEqual([...CHEI_L284].sort())
    // Sectiunea temeiului nu e o litera a legii: poarta alt atribut.
    expect(html).toContain('data-sectiune="temei"')
  })

  it('sigiliul poarta amprenta SHA-256 a textului randat al documentului (recalculata din HTML)', async () => {
    for (const slug of ['termeni', 'informatii-legale', 'cookies', 'licenta-software'] as const) {
      const html = await paginaCuOperator(slug)
      const amprenta = html.match(/data-amprenta="([0-9a-f]{64})"/)?.[1]
      expect(amprenta, slug).toBeDefined()
      const articol = html.match(/<article data-document="[^"]+">([\s\S]*?)<\/article>/)?.[1] ?? ''
      // Controlul: articolul chiar s-a gasit si are textul documentului.
      expect(articol.length, slug).toBeGreaterThan(500)
      const recalculata = createHash('sha256').update(textDinHtml(articol).replace(/\s+/g, ''), 'utf8').digest('hex')
      expect(recalculata, slug).toBe(amprenta)
      // Afisata: primele 16 caractere si semnul de suspensie.
      expect(html, slug).toContain('>' + amprenta?.slice(0, 16) + SUSPENSIE + '<')
    }
  })

  it('indexul: 7 carduri in ordinea barei, fara element activ in bara', async () => {
    const html = await paginaCuOperator(null)
    const carduri = [...html.matchAll(/data-card-document="([^"]+)"/g)].map((m) => m[1])
    expect(carduri).toEqual([...SLUGURI_JURIDICE])
    // Singurul `aria-current` e nivelul curent din firul de pagina.
    expect((html.match(/aria-current="page"/g) ?? []).length).toBe(1)
    expect(html).toMatch(/<span[^>]*aria-current="page"[^>]*>Documente juridice</)
  })

  it('martor NEGATIV: fara operator, pagina cere 404 si nu randeaza nimic', async () => {
    await expect(paginaCuOperator('termeni', null)).rejects.toThrow(/NEXT_HTTP_ERROR_FALLBACK;404|NEXT_NOT_FOUND/)
  })
})

// ---------------------------------------------------------------------------------------------
// E. Harta site si declaratia de accesibilitate
// ---------------------------------------------------------------------------------------------

describe('harta site', () => {
  const articole: ArticolBlog[] = [
    { slug: 'exemplu-unu', titlu: 'Articol de exemplu', extras: 'Extras', categorie: 'juridic', data: '2026-09-20' },
  ]

  it('fiecare ruta si fiecare articol cade in exact o grupa; nicio grupa goala; niciun text gol', () => {
    const rute: Ruta[] = [
      { cale: '/', scurt: 'Acasă', descriere: 'd', inHarta: true },
      { cale: '/solutii/avocatura', scurt: 'Avocatură', descriere: 'd', inHarta: true },
      { cale: '/blog', scurt: 'Blog', descriere: 'd', inHarta: true },
      { cale: '/contact', scurt: 'Contact', descriere: 'd', inHarta: true },
      ...ruteJuridice(juridicPublicat(operatorSintetic())),
      { cale: '/harta-site', scurt: 'Harta site', descriere: 'd', inHarta: true },
    ]
    const grupe = grupeHarta(rute, articole)
    const toate = grupe.flatMap((g) => g.legaturi.map((l) => l.cale))
    expect([...toate].sort()).toEqual([...rute.map((r) => r.cale), caleArticol(articole[0])].sort())
    expect(new Set(toate).size).toBe(toate.length)
    expect(grupe.map((g) => g.titlu)).toEqual([...GRUPE_HARTA])
    for (const g of grupe) for (const l of g.legaturi) expect(l.text.trim(), l.cale).not.toBe('')
    expect(grupe.find((g) => g.titlu === 'Resurse')?.legaturi.map((l) => l.text)).toContain('Articol de exemplu')
  })

  it('grupa dupa cale: prefixul intreg, nu o bucata de cuvant', () => {
    expect(grupaPentruCale('/solutii')).toBe('Sectoare')
    expect(grupaPentruCale('/solutii-noi')).toBe('Produs')
    expect(grupaPentruCale('/juridic/termeni')).toBe('Juridic')
    expect(grupaPentruCale('/blogul-altcuiva')).toBe('Produs')
  })

  it('pe configurarea reala, harta randata are exact rutele hartii XML si articolele din registru', async () => {
    const { default: Harta } = await import('../src/app/harta-site/page')
    const { ARTICOLE } = await import('../src/content/blog/registru')
    const html = await randeaza(createElement(Harta))
    const grila = html.slice(html.indexOf('data-harta-grupe'))
    const legaturi = [...grila.matchAll(/<a[^>]*href="([^"]+)"/g)].map((m) => m[1])
    const asteptate = [...rutePentruHarta().map((r) => r.cale), ...ARTICOLE.map(caleArticol)]
    expect([...legaturi].sort()).toEqual([...asteptate].sort())
    expect(html).not.toContain('undefined')
  })
})

describe('declaratia de accesibilitate', () => {
  it('fara adresa confirmata nu arata nicio adresa; cu adresa, o legatura mailto', () => {
    const fara = JSON.stringify(declaratieAccesibilitate('3s4.ke2.in', null))
    expect(fara).not.toContain('@')
    expect(fara).not.toContain('mailto:')
    const cu = JSON.stringify(declaratieAccesibilitate('3s4.ke2.in', 'contact@marca-3s.test'))
    expect(cu).toContain('mailto:contact@marca-3s.test')
  })

  it('declaratia citeaza standardul citit si nu promite conformitate deplina', () => {
    const d = declaratieAccesibilitate('3s4.ke2.in', null)
    const text = JSON.stringify(d)
    expect(text).toContain('](' + ACTE.wcag22.adresa + ')')
    expect(normalizat(text)).toContain('nu declaram inca o conformitate deplina')
    expect(d.data).toBe('Întocmită pe ' + dataInCuvinte(DATA_DECLARATIE))
  })

  // Afirmatiile declaratiei, fiecare legata de lucrul pe care il descrie: daca lucrul se schimba,
  // proba se inroseste si declaratia se rescrie, nu ramane falsa.
  it('afirmatiile despre site sunt adevarate in cod: saltul la continut, focusul, miscarea redusa, limba', () => {
    const layout = citeste('src/app/layout.tsx')
    expect(layout).toMatch(/<html lang="ro"/)
    expect(layout).toMatch(/className="sari-la-continut" href="#zona-continut"/)
    // Legatura de salt e inaintea antetului, deci prima pe pagina.
    expect(layout.indexOf('sari-la-continut')).toBeLessThan(layout.indexOf('<Antet'))
    const globale = citeste('src/app/globals.css')
    expect(globale).toMatch(/:focus-visible\s*\{\s*outline:\s*2px solid var\(--color-albastru\)/)
    const redusa = globale.slice(globale.indexOf('@media (prefers-reduced-motion: reduce)'))
    expect(redusa).toMatch(/scroll-behavior:\s*auto/)
    expect(redusa).toMatch(/transition-duration:\s*0\.001ms !important/)
    expect(redusa).toMatch(/animation-duration:\s*0\.001ms !important/)
  })

  it('limitarea declarata a focusului e adevarata: campul paletei isi ascunde conturul', () => {
    // Cand paleta primeste contur, proba se inroseste si limitarea se scoate din declaratie.
    const paleta = citeste('src/components/global/PaletaCautare.module.css')
    expect(paleta).toMatch(/\.camp \{[^}]*outline: none;/)
    expect(paleta).toMatch(/\.campInvelis:focus-within \{\s*outline: none;/)
    const text = JSON.stringify(declaratieAccesibilitate('3s4.ke2.in', null))
    expect(text).toContain('paleta de comenzi')
  })

  it('afirmatiile despre verificari: fereastra de 1280, 390 px si regulile axe numite', () => {
    const d = JSON.stringify(declaratieAccesibilitate('3s4.ke2.in', null))
    expect(citeste('tests/browser/playwright.config.ts')).toContain("devices['Desktop Chrome']")
    expect(d).toContain('1280')
    expect(citeste('tests/browser/derapaj.spec.ts')).toMatch(/const LATIME = 390/)
    expect(d).toContain('390')
    // Contrastul e in regulile implicite; tinta de atingere (2.5.8) nu e - cum spune declaratia.
    const sursaAxe = readFileSync(cere.resolve('axe-core/axe.js'), 'utf8')
    expect(sursaAxe).toMatch(/id: 'color-contrast',[^}]*?tags:/)
    expect(sursaAxe).not.toMatch(/id: 'color-contrast',[^}]*?enabled: false/)
    expect(sursaAxe).toMatch(/id: 'target-size',[^}]*?enabled: false/)
  })
})

// ---------------------------------------------------------------------------------------------
// F. Metadata si declaratiile GEO
// ---------------------------------------------------------------------------------------------

describe('metadata si declaratiile de raspuns', () => {
  it('titlurile si descrierile celor 10 rute sunt in pragurile portii de SEO si unice', () => {
    const toate = [
      { ...META_INDEX_JURIDIC, cale: CALE_JURIDIC },
      ...DOCUMENTE_JURIDICE.map((d) => ({ ...META_DOCUMENTE[d.slug], cale: caleDocument(d.slug) })),
      { ...META_HARTA, cale: '/harta-site' },
      { ...META_ACCESIBILITATE, cale: '/accesibilitate' },
    ]
    for (const m of toate) expect(abateriMetadata(m), m.cale).toEqual([])
    expect(new Set(toate.map((m) => m.titlu)).size).toBe(toate.length)
    expect(new Set(toate.map((m) => m.descriere)).size).toBe(toate.length)
  })

  it('config/seo/juridic.json: rutele publicate azi si, separat, cele opt din ziua operatorului', () => {
    const cfg = JSON.parse(citeste('config/seo/juridic.json')) as {
      raspuns_autonom: Record<string, unknown>
      raspuns_autonom_cu_operator: Record<string, { intrebare: string; entitati: string[] }>
    }
    expect(Object.keys(cfg.raspuns_autonom).filter((k) => !k.startsWith('_')).sort()).toEqual(['/accesibilitate', '/harta-site'])
    const cuOperator = Object.keys(cfg.raspuns_autonom_cu_operator).filter((k) => !k.startsWith('_'))
    expect([...cuOperator].sort()).toEqual(ruteJuridice(juridicPublicat(operatorSintetic())).map((r) => r.cale).sort())
    for (const cale of cuOperator) {
      const d = cfg.raspuns_autonom_cu_operator[cale]
      expect(d.intrebare.length, cale).toBeGreaterThan(10)
      expect(d.entitati.length, cale).toBeGreaterThan(0)
    }
  })
})
