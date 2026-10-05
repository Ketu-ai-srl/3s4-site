import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { ECHIVALENTE } from '../src/content/echivalente'
import { problemePagina, type PaginaContinut } from '../src/content/model/tipuri'
import { TEXTE_WHATSAPP_RO_MD } from '../src/content/navigatie-ro-md'
import { RUTE_EN_NUCLEU } from '../src/content/rute-en-nucleu'
import { RUTE_EN_PRODUS } from '../src/content/rute-en-produs'
import { RUTE_EN_REFERINTA } from '../src/content/rute-en-referinta'
import { RUTE_RO_MD } from '../src/content/rute-ro-md'
import * as acasa from '../src/content/ro-md/acasa'
import * as acasaComp from '../src/content/ro-md/acasa-componente'
import * as cautare from '../src/content/ro-md/cautare-ai'
import * as cautareComp from '../src/content/ro-md/cautare-ai-componente'
import * as comparatie from '../src/content/ro-md/comparatie-componente'
import * as contactComp from '../src/content/ro-md/contact-componente'
import * as enterprise from '../src/content/ro-md/enterprise'
import * as enterpriseComp from '../src/content/ro-md/enterprise-componente'
import * as efacturare from '../src/content/ro-md/ghid-e-facturare-componente'
import * as termene from '../src/content/ro-md/ghid-termene-moldova-componente'
import * as platforma from '../src/content/ro-md/platforma'
import * as platformaComp from '../src/content/ro-md/platforma-componente'
import * as preturi from '../src/content/ro-md/preturi'
import * as preturiComp from '../src/content/ro-md/preturi-componente'
import * as securitate from '../src/content/ro-md/securitate'
import * as securitateComp from '../src/content/ro-md/securitate-componente'

/**
 * Oglinda /ro a paginilor EN (felia ro-md-oglinda, decizia 59): perechile /ro ale lui P02, P03, P08, P09, P11, G1, G2 si
 * G3 pe 3s.md. Proba masoara pe SURSA: manifestul, echivalentele, textele WhatsApp ale navigatiei, legatura cu registrul
 * de afirmatii, forma paginilor `PaginaContinut`, variantele conditionate ale paginii despre 3S, legaturile interne (spre
 * paginile /ro, nu spre perechile EN) si ce nu are voie sa ajunga pe aceste pagini: RON, AES si TLS, Germania ca loc al
 * gazduirii, functiile deciziei 43, asistentul pe WhatsApp, apelul GSM, scanarea facuta de 3S, pilotul de 30 de zile
 * (decizia 65: 14 zile), marcajul "(în engleză)". Paginile servite le masoara `tests/browser/ro-md-oglinda.spec.ts` si
 * `tests/browser/congruenta.spec.ts`, pe copia 3s.md.
 *
 * Fixturile cazurilor pozitive se asambleaza la rulare, din bucati.
 */

const RADACINA = join(__dirname, '..')
const citeste = (...cale: string[]) => readFileSync(join(RADACINA, ...cale), 'utf8')

/** Rutele feliei, citite ca text de sub marcajul ei din manifestul RO-MD (sursa independenta de modulul importat). */
function ruteFelie(): { cale: string; cheie: string }[] {
  const text = citeste('src', 'content', 'rute-ro-md.ts')
  const start = text.indexOf('<<felie:' + 'ro-md-oglinda>>')
  // Blocul se termina la urmatorul marcaj de felie (ro-md-acasa-contact sta dupa el) sau la sfarsitul listei.
  const urmator = start < 0 ? -1 : text.indexOf('<<felie:', start + 1)
  const bucata = start < 0 ? '' : text.slice(start, urmator < 0 ? text.indexOf('\n];', start) : urmator)
  return [...bucata.matchAll(/cale:\s*"([^"]+)"[\s\S]*?cheie:\s*"([^"]+)"/g)].map((m) => ({ cale: m[1], cheie: m[2] }))
}

/** Fisierul paginii unei cai /ro, sub grupul `(romd)`. */
const fisierPagina = (cale: string) => join('src', 'app', '(romd)', ...cale.split('/').filter(Boolean), 'page.romd.tsx')

/** Modulele de continut ale feliei, cu numele de fisier (pentru registrul de afirmatii). */
const MODULE: { nume: string; modul: Record<string, unknown> }[] = [
  { nume: 'src/content/ro-md/platforma.ts', modul: platforma },
  { nume: 'src/content/ro-md/platforma-componente.ts', modul: platformaComp },
  { nume: 'src/content/ro-md/cautare-ai.ts', modul: cautare },
  { nume: 'src/content/ro-md/cautare-ai-componente.ts', modul: cautareComp },
  { nume: 'src/content/ro-md/preturi.ts', modul: preturi },
  { nume: 'src/content/ro-md/preturi-componente.ts', modul: preturiComp },
  { nume: 'src/content/ro-md/enterprise.ts', modul: enterprise },
  { nume: 'src/content/ro-md/enterprise-componente.ts', modul: enterpriseComp },
  { nume: 'src/content/ro-md/securitate.ts', modul: securitate },
  { nume: 'src/content/ro-md/securitate-componente.ts', modul: securitateComp },
  { nume: 'src/content/ro-md/ghid-e-facturare-componente.ts', modul: efacturare },
  { nume: 'src/content/ro-md/ghid-termene-moldova-componente.ts', modul: termene },
  { nume: 'src/content/ro-md/comparatie-componente.ts', modul: comparatie },
]

/** Toate sirurile dintr-o valoare (frunzele de tip sir, recursiv). */
function siruri(valoare: unknown, acc: string[] = []): string[] {
  if (typeof valoare === 'string') acc.push(valoare)
  else if (Array.isArray(valoare)) for (const v of valoare) siruri(v, acc)
  else if (valoare && typeof valoare === 'object') for (const v of Object.values(valoare)) siruri(v, acc)
  return acc
}

/** Textul unui modul: sirurile exportate plus rezultatele functiilor lui de continut, pe argumente de proba. */
function textModul(m: Record<string, unknown>): string {
  const extra: string[] = []
  if (m === preturiComp) {
    for (const p of preturiComp.PLANURI_RO_MD) extra.push(...siruri(preturiComp.randuriPlanRoMd(p)))
    extra.push(preturiComp.CALCULATOR_RO_MD.teaser.presupuneri('4 colegi', '25 de minute'), preturiComp.CALCULATOR_RO_MD.pesteConturi.inainte(25))
    extra.push(preturiComp.BIROU_RO_MD.locuri(20), preturiComp.GRILA_RO_MD.detalii('x'))
  }
  if (m === securitateComp) for (const o of [false, true]) extra.push(...siruri(securitateComp.securitateRoMd(o)))
  if (m === securitate) for (const o of [false, true]) extra.push(...siruri(securitate.paginaSecuritate(o)))
  if (m === termene) extra.push(termene.PANOU_TERMENE_RO_MD.contor(6, 7))
  return [...siruri(Object.values(m)), ...extra].join('\n')
}

const WA = 'Whats' + 'App'
const INTERZISE: { motiv: string; tipar: RegExp }[] = [
  { motiv: 'RON (decizia 54)', tipar: new RegExp('\\b' + 'R' + 'ON\\b') },
  { motiv: 'AES / TLS (decizia 31)', tipar: new RegExp('\\b(A' + 'ES|T' + 'LS)\\b') },
  // Germania ramane pe ghidul e-facturilor ca tara a carei lege o descriem (termenul de pastrare); se cauta Germania ca LOC al fisierelor.
  // Verbele locului: "gazduite", "stocate" si "pastrate" (participiul, cum scriu chiar modulele feliei despre fisiere).
  // Numai participiul "pastrat-": substantivul "pastrare" si "pastreaza" descriu pe ghid termenul legal al unei tari, nu
  // locul fisierelor. Flag-ul u si \p{L}, ca o litera cu diacritic sa nu opreasca potrivirea.
  { motiv: 'Germania ca loc al gazduirii (decizia 42)', tipar: new RegExp('((găzdu|stoc|păstrat)\\p{L}*[^.\\n]{0,40}German' + 'ia|servere\\p{L}*[^.\\n]{0,20}German' + 'ia|o singură ' + 'regiune)', 'iu') },
  { motiv: 'portalul (decizia 43)', tipar: new RegExp('port' + 'al(ul)? pentru clien', 'i') },
  // API cu majuscule: calea serverului site-ului (`/api/sanatate`) nu e o functie a platformei.
  { motiv: 'API, webhook, SSO (decizia 43)', tipar: new RegExp('(\\bA' + 'PI\\b|[Ww]eb' + 'hook|\\bSS' + 'O\\b)') },
  { motiv: 'reguli automate (decizia 43)', tipar: new RegExp('reguli ' + 'automate', 'i') },
  // Google Workspace ramane pe comparatie ca produsul tertului si ca editor al surselor lui (decizia 11).
  { motiv: 'integrari cu nume (decizia 43)', tipar: new RegExp('(Out' + 'look|Gm' + 'ail|Microsoft ' + '365|integr\\w* cu Google)', 'i') },
  { motiv: 'clasare automata in dosare (val-ro-i2)', tipar: new RegExp('clasare ' + 'automat', 'i') },
  { motiv: 'asistentul pe WhatsApp (decizia 49)', tipar: new RegExp('(întreb\\w*|răspuns\\w*)[^.\\n]{0,30} pe ' + WA, 'i') },
  { motiv: 'legatura de apel (decizia 56)', tipar: new RegExp('(te' + 'l:|sun' + 'ă-ne)', 'i') },
  { motiv: 'scanarea facuta de 3S (poarta juridica 40-41)', tipar: new RegExp('(scan' + 'ăm|3S scan' + 'ează|echipa 3S scan)', 'i') },
  { motiv: 'pilotul de 30 de zile (decizia 65)', tipar: new RegExp('(pilot[^.\\n]{0,40}30 de zile|30 de zile[^.\\n]{0,20}gratuit)', 'i') },
  { motiv: 'trimitere spre o pagina EN (felia 108 aduce perechile /ro)', tipar: new RegExp('\\(în ' + 'engleză\\)', 'i') },
]

function incalcari(text: string): string[] {
  return INTERZISE.filter((i) => i.tipar.test(text)).map((i) => i.motiv)
}

describe('manifestul, echivalentele si navigatia', () => {
  const rute = ruteFelie()

  it('opt rute sub marcajul feliei, fiecare cu pagina pe disc, in harta, editia ro-MD, in modulul importat', () => {
    expect(rute.map((r) => r.cale).sort()).toEqual(
      [
        '/ro/comparatie-drive',
        '/ro/enterprise',
        '/ro/functionalitati/cautare-ai',
        '/ro/ghiduri/arhivare-e-facturi-ue',
        '/ro/ghiduri/termene-pastrare-moldova',
        '/ro/platforma',
        '/ro/preturi',
        '/ro/securitate',
      ].sort(),
    )
    for (const r of rute) {
      expect(existsSync(join(RADACINA, fisierPagina(r.cale))), r.cale).toBe(true)
      const ruta = RUTE_RO_MD.find((x) => x.cale === r.cale)
      expect(ruta?.editie, r.cale).toBe('ro-MD')
      expect(ruta?.inHarta, r.cale).toBe(true)
      expect(ruta?.cheie, r.cale).toBe(r.cheie)
    }
    // Martorul citirii: o cale inventata nu e in lista citita din text.
    expect(rute.some((r) => r.cale === '/ro/despre')).toBe(false)
  })

  it('fiecare ruta are pereche EN cu aceeasi cheie, iar echivalentele leaga exact cele doua cai', () => {
    const en = [...RUTE_EN_NUCLEU, ...RUTE_EN_PRODUS, ...RUTE_EN_REFERINTA]
    for (const r of rute) {
      const caleEn = en.find((x) => x.cheie === r.cheie)?.cale
      expect(caleEn, r.cheie).toBeDefined()
      expect(ECHIVALENTE[r.cheie], r.cheie).toEqual({ en: caleEn, 'ro-MD': r.cale })
    }
  })

  it('fiecare pagina are textul WhatsApp al fisei in tabelul navigatiei, cu ref-ul paginii o singura data', () => {
    const cta: Record<string, { ref: string; textWhatsapp: string }> = {
      '/ro/platforma': platforma.pagina.cta,
      '/ro/functionalitati/cautare-ai': cautare.pagina.cta,
      '/ro/preturi': preturi.pagina.cta,
      '/ro/enterprise': enterprise.pagina.cta,
      '/ro/securitate': securitate.pagina.cta,
      '/ro/ghiduri/arhivare-e-facturi-ue': efacturare.PAGINA_EFACTURARE_RO_MD.cta,
      '/ro/ghiduri/termene-pastrare-moldova': termene.PAGINA_TERMENE_RO_MD.cta,
      '/ro/comparatie-drive': comparatie.PAGINA_COMPARATIE_RO_MD.cta,
    }
    for (const r of rute) {
      const rand = TEXTE_WHATSAPP_RO_MD.find((t) => t.cale === r.cale && !t.prefix)
      expect(rand, r.cale).toBeDefined()
      expect(cta[r.cale].ref, r.cale).toBe(rand!.ref)
      expect(cta[r.cale].textWhatsapp, r.cale).toBe(rand!.text)
      expect(rand!.text.split('[ref:' + rand!.ref + ']').length - 1, r.cale).toBe(1)
      expect(rand!.text.startsWith('Bună ziua, 3S. '), r.cale).toBe(true)
    }
    expect(new Set(TEXTE_WHATSAPP_RO_MD.map((t) => t.ref)).size).toBe(TEXTE_WHATSAPP_RO_MD.length)
  })
})

describe('registrul de afirmatii', () => {
  type Intrare = { id: string; unde: string; stare: string }
  const registru: Intrare[] = ['ro-md-acasa-contact.json', 'ro-md-oglinda.json'].flatMap(
    (f) => JSON.parse(citeste('src', 'content', 'afirmatii', f)) as Intrare[],
  )
  const ids = new Map(registru.map((i) => [i.id, i]))
  const pagini: { nume: string; afirmatii: readonly string[] }[] = [
    { nume: 'src/content/ro-md/platforma.ts', afirmatii: platforma.pagina.afirmatii },
    { nume: 'src/content/ro-md/cautare-ai.ts', afirmatii: cautare.pagina.afirmatii },
    { nume: 'src/content/ro-md/preturi.ts', afirmatii: preturi.pagina.afirmatii },
    { nume: 'src/content/ro-md/enterprise.ts', afirmatii: enterprise.pagina.afirmatii },
    { nume: 'src/content/ro-md/securitate.ts', afirmatii: securitate.paginaSecuritate(true).afirmatii },
    { nume: 'src/content/ro-md/ghid-e-facturare-componente.ts', afirmatii: efacturare.PAGINA_EFACTURARE_RO_MD.afirmatii },
    { nume: 'src/content/ro-md/ghid-termene-moldova-componente.ts', afirmatii: termene.PAGINA_TERMENE_RO_MD.afirmatii },
    { nume: 'src/content/ro-md/comparatie-componente.ts', afirmatii: comparatie.PAGINA_COMPARATIE_RO_MD.afirmatii },
  ]

  it('fiecare ID citat de o pagina exista in registrul ro-md, iar intrarea numeste modulul paginii in `unde`', () => {
    const lipsa: string[] = []
    for (const p of pagini) {
      expect(p.afirmatii.length, p.nume).toBeGreaterThan(0)
      for (const id of p.afirmatii) {
        const i = ids.get(id)
        if (i === undefined) lipsa.push(p.nume + ': ' + id + ' lipseste din registru')
        else if (!i.unde.split(',').map((u) => u.trim()).includes(p.nume)) lipsa.push(p.nume + ': ' + id + ' nu numeste modulul')
      }
    }
    expect(lipsa).toEqual([])
  })

  it('oglinda OCR pe /ro: startul citeaza intrarea functiilor in productie (pct. 47)', () => {
    expect(citeste('src', 'content', 'ro-md', 'acasa.ts')).toMatch(/"ro-md-functii-in-productie"/)
    expect(ids.get('ro-md-functii-in-productie')?.unde).toContain('src/content/ro-md/acasa.ts')
  })

  it('martorul: un ID inventat nu e gasit', () => {
    expect(ids.has('ro-md-' + 'inexistent')).toBe(false)
  })
})

describe('forma paginilor si variantele conditionate', () => {
  it('paginile PaginaContinut ale feliei respecta modelul (lungimi, capsula, ref, chei)', () => {
    const toate: PaginaContinut[] = [platforma.pagina, cautare.pagina, preturi.pagina, enterprise.pagina, securitate.paginaSecuritate(false), securitate.paginaSecuritate(true)]
    expect(toate.flatMap((p) => problemePagina(p))).toEqual([])
  })

  it('pagina despre 3S: "operat din Moldova" si intrebarea operatorului numai dupa inregistrarea firmei', () => {
    const inainte = securitateComp.securitateRoMd(false)
    const dupa = securitateComp.securitateRoMd(true)
    expect(JSON.stringify(inainte)).not.toMatch(/operat\w* din Republica Moldova|Operat din Moldova/)
    expect(JSON.stringify(dupa)).toMatch(/operat\w* din Republica Moldova/)
    expect(dupa.intrebari!.intrebari.length - inainte.intrebari!.intrebari.length).toBe(1)
    // Congruenta (lista declarata p11): insignele raman 6 si cardurile 4, ca pe RO si pe EN, in ambele variante.
    for (const c of [inainte, dupa]) {
      expect(c.reglementare!.insigne).toHaveLength(6)
      expect(c.reglementare!.carduri).toHaveLength(4)
    }
    expect(securitate.paginaSecuritate(false).meta.titlu).not.toContain('operează')
    expect(securitate.paginaSecuritate(true).meta.titlu).toContain('operează')
  })

  it('preturile: sumele grilei deciziei 18, insigna pe Starter, propozitia TVA, formatul romanesc', () => {
    expect(preturiComp.PLANURI_RO_MD.map((p) => [p.nume, p.pret.lunar, p.pret.anual, p.conturi, p.recomandat])).toEqual([
      ['Starter', 90, 75, 5, true],
      ['Pro', 150, 125, 10, false],
      ['Business', 240, 200, 20, false],
    ])
    expect(preturiComp.COMUTATOR_RO_MD.nota).toBe(preturi.PROPOZITIE_TVA_RO_MD)
    expect(preturiComp.randuriPlanRoMd(preturiComp.PLANURI_RO_MD[2])[0].text).toBe('de conturi pentru echipă')
    expect(preturiComp.randuriPlanRoMd(preturiComp.PLANURI_RO_MD[0])[0].text).toBe('conturi pentru echipă')
    expect(preturiComp.valoareSpusaRoMd(preturiComp.CURSOARE_RO_MD.minute, 25)).toBe('25 de minute pe zi')
    expect(preturiComp.dataRoMd(new Date(2026, 9, 5))).toBe('5 octombrie 2026')
  })

  it('cifrele de congruenta pe care le numara listele declarate (p09, p03, g3) sunt cele ale perechii EN', () => {
    const d = enterpriseComp.DRUM_DOCUMENT_RO_MD
    expect(d.intrare.elemente.length + d.intelegere.elemente.length + d.iesire.elemente.length).toBe(7)
    expect(d.stocare.pastile).toHaveLength(2)
    expect(d.fapte).toHaveLength(4)
    expect(cautareComp.AVALANSA_CAUTARE_RO_MD.randuri.filter((r) => 'cip' in r)).toHaveLength(9)
    expect(comparatie.TABEL_COMPARATIE_RO_MD.randuri).toHaveLength(2)
  })
})

describe('ce nu ajunge in modulele feliei', () => {
  it('martorii: fiecare tipar prinde o fraza fabricata, iar textul corect nu e acuzat', () => {
    const rau = [
      'Costa 0 ' + 'R' + 'ON.',
      'Criptare A' + 'ES-256.',
      'Fișierele sunt păstrate pe servere din German' + 'ia.',
      'Fișierele încărcate în 3S sunt păstrate în German' + 'ia, la Frankfurt.',
      'Un port' + 'al pentru clienți.',
      'Un A' + 'PI REST.',
      'Reguli ' + 'automate pe dosar.',
      'Legat de Gm' + 'ail.',
      'Clasare ' + 'automată în dosare.',
      'Întrebi și primești răspunsul pe ' + WA + '.',
      'Sun' + 'ă-ne oricând.',
      'Echipa 3S scan' + 'ează hârtia.',
      'Un pilot gratuit de 30 de zile.',
      'Vezi [Prețuri](/pricing) (în ' + 'engleză).',
    ]
    for (const f of rau) expect(incalcari(f), f).toHaveLength(1)
    expect(incalcari('Scrie-ne pe ' + WA + '. Îți răspunde o persoană din echipa 3S. Pilot gratuit de 14 zile, în UE (Frankfurt).')).toEqual([])
    // Martorul negativ al ghidului e-facturilor: Germania ca tara a carei lege fixeaza termenul de pastrare.
    expect(incalcari('Fiecare stat din UE își stabilește termenul de păstrare a facturilor: 8 ani în German' + 'ia, 10 în Franța.')).toEqual([])
    expect(incalcari('Păstrează XML-ul original: German' + 'ia și Franța cer acest lucru.')).toEqual([])
  })

  it('zero incalcari in textul tuturor modulelor feliei (siruri si functii de continut)', () => {
    const gasite: string[] = []
    for (const { nume, modul } of MODULE) {
      const text = textModul(modul)
      expect(text.length, nume).toBeGreaterThan(200)
      for (const m of incalcari(text)) gasite.push(nume + ': ' + m)
    }
    expect(gasite).toEqual([])
  })

  it('legaturile interne ale modulelor duc la paginile /ro ale editiei, nu la perechile EN si nu la /ro/despre', () => {
    const cai = new Set(RUTE_RO_MD.map((r) => r.cale))
    const rele: string[] = []
    for (const { nume, modul } of MODULE) {
      const text = textModul(modul)
      // legaturile din marcaj ("](/cale)") si campurile href/cale ale componentelor, citite din sursa
      const din = [...text.matchAll(/\]\((\/[^)\s]*)\)/g)].map((m) => m[1])
      const sursa = citeste(...nume.split('/'))
      const campuri = [...sursa.matchAll(/(?:href|cale|ruta):\s*"(\/[^"]*)"/g)].map((m) => m[1])
      for (const h of [...din, ...campuri]) {
        const cale = h.split('#')[0]
        // Paginile juridice /ro exista numai cu operator numit (rute-ro-md.ts); calea lor e a familiei md, nu o pereche EN.
        if (!cai.has(cale) && !cale.startsWith('/ro/juridic/')) rele.push(nume + ': ' + h)
      }
    }
    expect(rele).toEqual([])
    // Martorul: o legatura spre o pagina EN nu e in multimea cailor /ro.
    expect(cai.has('/pricing')).toBe(false)
  })

  it('/ro/contact: cardurile raspunsurilor publicate duc la paginile /ro, iar sectiunea nu le mai numeste "in engleza"', () => {
    // contact-componente.ts nu e un modul al oglinzii (pagina e a feliei startului /ro), dar cardurile lui trimit la
    // paginile oglinzii: regula legaturilor se aplica si lor, pe obiectul randat si pe sursa (ajutorul `cale(...)`).
    const cai = new Set(RUTE_RO_MD.map((r) => r.cale))
    // Fara href (null) cardul n-ar avea tinta: se numara ca tinta rea, cu sirul gol.
    const tinteRele = (carduri: readonly { legatura: { href: string | null; ruta?: string | null } }[]) =>
      carduri.flatMap((c) => [c.legatura.href ?? '', c.legatura.ruta ?? c.legatura.href ?? '']).filter((h) => !cai.has(h.split('#')[0]))
    const subiecte = contactComp.CONTACT_RO_MD.subiecte
    expect(subiecte.carduri).toHaveLength(5)
    expect(tinteRele(subiecte.carduri)).toEqual([])

    const scriseRele = (sursa: string) =>
      [...sursa.matchAll(/(?:(?:href|cale|ruta):\s*|cale\()"(\/[^"]*)"/g)].map((m) => m[1]).filter((h) => !cai.has(h.split('#')[0]))
    const sursa = citeste('src', 'content', 'ro-md', 'contact-componente.ts')
    expect([...sursa.matchAll(/cale\("\/ro\//g)].length).toBe(5)
    expect(scriseRele(sursa)).toEqual([])

    const marcaj = new RegExp('în ' + 'engleză', 'u')
    expect(siruri(subiecte).filter((t) => marcaj.test(t))).toEqual([])

    // Martorii: o tinta EN, scrisa in obiect sau in sursa, si marcajul limbii sunt prinse.
    const en = '/pri' + 'cing'
    expect(tinteRele([{ legatura: { href: en, ruta: en } }])).toHaveLength(2)
    expect(scriseRele(sursa.replace('cale("/ro/preturi")', 'cale("' + en + '")'))).toEqual([en])
    expect(marcaj.test('Fiecare card deschide pagina, deocamdată în ' + 'engleză.')).toBe(true)
  })
})

describe('decizia 63: pe paginile /ro, legea SUA se spune impreuna cu cadrul UE', () => {
  // O mentiune a SUA (tara, CLOUD Act, legea americana) e un sir care o numeste; sirul trebuie sa numeasca si UE,
  // Uniunea Europeana, GDPR sau Europa. Unitatea e sirul (fraza, insigna, randul), nu pagina: o insigna "SUA"
  // cu GDPR numai in nota vecina ar spune pe ecran doar jumatate. Exceptiile de mai jos sunt randuri dintr-un bloc
  // (lista, tabel de specificatii, proza de doua paragrafe) al carui alt rand spune UE; fiecare e citata pe cale,
  // iar proba cere ca blocul sa poarte UE si ca randul sa fie inca o mentiune (altfel exceptia e veche).
  const MENTIUNE = new RegExp('\\b' + 'SU' + 'A\\b|CLOUD ' + 'Act|Statele ' + 'Unite|americ', 'u')
  const CADRU_UE = new RegExp('\\b' + 'U' + 'E\\b|Uniunea Europe|GD' + 'PR|europe|Europa', 'iu')

  const RADACINI: Record<string, unknown> = {
    'securitate(false)': securitate.paginaSecuritate(false),
    'securitate(true)': securitate.paginaSecuritate(true),
    'securitateComp(false)': securitateComp.securitateRoMd(false),
    'securitateComp(true)': securitateComp.securitateRoMd(true),
    platforma: platforma.pagina,
    platformaComp,
    cautare: cautare.pagina,
    cautareComp,
    preturi: preturi.pagina,
    preturiComp,
    enterprise: enterprise.pagina,
    enterpriseComp,
    efacturare,
    termene,
    comparatie,
    acasa: acasa.pagina,
    acasaComp,
    contactComp,
  }

  /** Bloc -> randurile lui care numesc SUA fara UE in acelasi sir. */
  const EXCEPTII: Record<string, string[]> = {
    'securitate(false).sectiuni[0].blocuri[0].lista.elemente': ['[3]'],
    'securitate(true).sectiuni[0].blocuri[0].lista.elemente': ['[3]'],
    'securitateComp(false).infrastructura.specificatii': ['[3].termen'],
    'securitateComp(true).infrastructura.specificatii': ['[3].termen'],
    'platformaComp.PLATFORMA_RO_MD.suveranitate': ['.proza[1]'],
  }

  function frunze(v: unknown, cale: string, acc: [string, string][] = []): [string, string][] {
    if (typeof v === 'string') acc.push([cale, v])
    else if (Array.isArray(v)) v.forEach((x, i) => frunze(x, cale + '[' + i + ']', acc))
    else if (v && typeof v === 'object') for (const [k, x] of Object.entries(v)) frunze(x, cale + '.' + k, acc)
    return acc
  }

  /** Sirurile care numesc SUA fara cadrul UE; identificatorii de afirmatii (fara spatiu) nu sunt text. */
  function faraUe(radacini: Record<string, unknown>): { mentiuni: number; fara: string[] } {
    let mentiuni = 0
    const fara: string[] = []
    for (const [nume, v] of Object.entries(radacini))
      for (const [cale, text] of frunze(v, nume)) {
        if (/^[a-z0-9-]+$/.test(text) || !MENTIUNE.test(text)) continue
        mentiuni++
        if (!CADRU_UE.test(text)) fara.push(cale)
      }
    return { mentiuni, fara }
  }

  const permis = new Set(Object.entries(EXCEPTII).flatMap(([bloc, r]) => r.map((x) => bloc + x)))

  it('fiecare sir care numeste SUA numeste si cadrul UE, in afara randurilor declarate', () => {
    const { mentiuni, fara } = faraUe(RADACINI)
    // Cifra masurata la redactare: 31 de siruri numesc SUA, 5 fara UE in acelasi sir, toate randuri declarate.
    expect(mentiuni).toBeGreaterThanOrEqual(20)
    expect(fara.filter((c) => !permis.has(c))).toEqual([])
    // Exceptiile sunt vii: fiecare rand declarat e inca o mentiune fara UE.
    expect([...permis].filter((c) => !fara.includes(c))).toEqual([])
  })

  it('blocul fiecarei exceptii spune UE in alt rand', () => {
    for (const bloc of Object.keys(EXCEPTII)) {
      const text = frunze(RADACINI, '')
        .filter(([c]) => c.slice(1).startsWith(bloc))
        .map(([, t]) => t)
        .join('\n')
      expect(text.length, bloc).toBeGreaterThan(0)
      expect(CADRU_UE.test(text), bloc).toBe(true)
    }
  })

  it('martorul: insigna Amazon scrisa numai "SUA" (cu GDPR doar in nota vecina) e prinsa', () => {
    const c = securitateComp.securitateRoMd(true)
    const insigne = c.reglementare!.insigne.map((i) => (i.marca === 'Amazon' ? { ...i, nume: 'SU' + 'A' } : i))
    const rau = { ...c, reglementare: { ...c.reglementare!, insigne } }
    expect(faraUe({ 'securitateComp(true)': rau }).fara.filter((x) => !permis.has(x))).toEqual(['securitateComp(true).reglementare.insigne[3].nume'])
    expect(faraUe({ 'securitateComp(true)': c }).fara.filter((x) => !permis.has(x))).toEqual([])
  })
})
