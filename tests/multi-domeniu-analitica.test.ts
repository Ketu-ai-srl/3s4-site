import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { afterEach, describe, expect, it, vi } from 'vitest'
import Analitica from '../src/components/analitica/Analitica'
import { AVERTISMENT_FARA_OPERATOR, CALE_SCRIPT, CALE_TRIMITERE, analiticaProprie, rescrieriAnalitica, stareAnaliticaProprie } from '../src/components/analitica/config'
import { VERSIUNE_ANALITICA, texteAnalitica } from '../src/content/juridic/analitica'
import { CHEI_ART13, VERSIUNE_CONFIDENTIALITATE, politicaConfidentialitate } from '../src/content/juridic/confidentialitate'
import { CHEI_L284, VERSIUNE_COOKIE, politicaCookie } from '../src/content/juridic/cookie-uri'
import { texteJuridice } from '../src/content/juridic/index'
import { textIntreg, type DocumentJuridic } from '../src/content/juridic/tipuri'
import { stareAnalitica } from '../src/lib/analitica'
import { citesteOperator, operatorComplet, type Operator } from '../src/lib/operator'

// Regula operatorului (mai jos) face ca `Analitica()` si `next.config.ts` sa depinda de operatorul rezolvat, iar acesta se
// citeste si din `OPERATOR_JSON`: se goleste inainte de orice import, ca proba sa masoare codul, nu masina celui care o ruleaza.
vi.hoisted(() => {
  process.env.OPERATOR_JSON = ''
})

/**
 * Felia multi-domeniu, punctul 3: ANALITICA FARA COOKIE, GAZDUITA DE NOI (`UMAMI_URL` + `UMAMI_WEBSITE_ID`).
 * Scriptul se incarca prin CALE PROPRIE a site-ului, cu atributul do-not-track, fara cookie si fara stocare
 * scrisa; fara variabile, nimic. De la masurarea S-B (decizia 13) scriptul NU mai sta in layout: il pune
 * bannerul, dupa accept (`incarcator-umami.ts`, proba lui in `tests/analitica-s-b.test.ts`); aici "elementul din
 * pagina" devine analitica proprie din starea bannerului (`stareAnalitica(...).umami`), iar `Analitica` nu mai
 * randeaza nimic, cu sau fara variabile. Proba de browser (`tests/browser/multi-domeniu.spec.ts`) masoara pe un
 * build real ca browserul vorbeste numai cu originea site-ului (poarta C-01), ca evenimentele ajung la
 * instanta prin proxy, ca nu se scrie niciun cookie si nicio cheie de stocare; aici se masoara regulile
 * variabilelor, rescrierile din `next.config.ts`, elementul din pagina si textele juridice.
 *
 * FARA OPERATOR, NIMIC (constatarea criticului, runda 1; planul §9): analitica proprie prelucreaza date personale
 * (adresa IP intra in calculul codului vizitei), deci porneste numai cu un operator numit SI complet, exact ca GA4
 * (`src/lib/analitica.ts`). Cu variabilele date si fara operator nu exista nici script, nici rescrierile `/a/`.
 *
 * FIXTURILE se asambleaza la RULARE: instanta si operatorul sunt pe domenii rezervate `.test`, iar
 * identificatorul site-ului are forma unui UUID, dar nu e al nimanui.
 */

// Importurile dinamice si copiile modulelor transforma de fiecare data pagina, componentele si stilurile: masurat 1 s pe statia
// libera si peste 5 s pe una incarcata de alte rulari. Plafonul e al fisierului, nu al unui caz.
vi.setConfig({ testTimeout: 60_000 })

const RADACINA = join(__dirname, '..')
const citeste = (cale: string) => readFileSync(join(RADACINA, cale), 'utf8')

const ID = ['3f2b8c1e', '5a4d', '4c3b', '9e7f', '0a1b2c3d4e5f'].join('-')
const INSTANTA = 'https://' + ['statistica', 'exemplu', 'test'].join('.')

const OPERATOR_SINTETIC: Operator = {
  denumire: ['Operator', 'Sintetic', 'Proba', 'SRL'].join(' '),
  sediu: 'Strada Exemplului 1, Pitesti',
  email: ['date', ['operator-3s', 'test'].join('.')].join('@'),
  telefon: '',
  numar_orc: '',
  cod_fiscal: '',
  tara: 'România',
  dpo: '',
}

function mesaj(f: () => unknown): string {
  try {
    f()
  } catch (e) {
    return e instanceof Error ? e.message : String(e)
  }
  return '(nu a aruncat)'
}

const JSON_OPERATOR = '../config/operator.json'

/** JSON-ul variabilei `OPERATOR_JSON`, cu forma din `config/operator.json`. */
const jsonOperator = (operator: Operator | null) => JSON.stringify({ operator })

afterEach(() => {
  vi.unstubAllEnvs()
  vi.restoreAllMocks()
  vi.doUnmock(JSON_OPERATOR)
  vi.resetModules()
})

describe('UMAMI_URL si UMAMI_WEBSITE_ID: cand porneste analitica', () => {
  it('martor NEGATIV: fara variabile (nesetate, goale, cu spatii) nu exista analitica, nicio rescriere, nimic in pagina', () => {
    for (const mediu of [{}, { UMAMI_URL: '', UMAMI_WEBSITE_ID: '' }, { UMAMI_URL: '  ', UMAMI_WEBSITE_ID: '\n' }]) {
      expect(analiticaProprie(mediu), JSON.stringify(mediu)).toEqual({ activa: false })
      // Chiar cu un operator complet, fara variabile nu exista nicio rescriere
      expect(rescrieriAnalitica(mediu, true), JSON.stringify(mediu)).toEqual([])
    }
    vi.stubEnv('UMAMI_URL', '')
    vi.stubEnv('UMAMI_WEBSITE_ID', '')
    expect(Analitica({ operator: OPERATOR_SINTETIC })).toBeNull()
  })

  it('martor POZITIV: cu amandoua, pornita; instanta doar ca origine, identificatorul cu litere mici', () => {
    expect(analiticaProprie({ UMAMI_URL: INSTANTA + '/', UMAMI_WEBSITE_ID: ID.toUpperCase() })).toEqual({
      activa: true,
      origine: INSTANTA,
      idSite: ID,
    })
    // http e acceptat numai pe masina locala (pentru probe si lucru local)
    expect(analiticaProprie({ UMAMI_URL: 'http://127.0.0.1:4693', UMAMI_WEBSITE_ID: ID })).toMatchObject({ activa: true, origine: 'http://127.0.0.1:4693' })
    expect(analiticaProprie({ UMAMI_URL: 'http://localhost:4693', UMAMI_WEBSITE_ID: ID })).toMatchObject({ activa: true })
  })

  it('martor POZITIV: o configurare pe jumatate sau gresita opreste construirea, cu variabila in mesaj', () => {
    expect(mesaj(() => analiticaProprie({ UMAMI_URL: INSTANTA }))).toBe('UMAMI_URL si UMAMI_WEBSITE_ID se seteaza impreuna: lipseste UMAMI_WEBSITE_ID')
    expect(mesaj(() => analiticaProprie({ UMAMI_WEBSITE_ID: ID }))).toBe('UMAMI_URL si UMAMI_WEBSITE_ID se seteaza impreuna: lipseste UMAMI_URL')
    const rele: [string, Record<string, string>, RegExp][] = [
      ['identificator care nu e UUID', { UMAMI_URL: INSTANTA, UMAMI_WEBSITE_ID: 'site-3s' }, /UMAMI_WEBSITE_ID trebuie sa fie un UUID/],
      ['UUID cu o cifra in plus', { UMAMI_URL: INSTANTA, UMAMI_WEBSITE_ID: ID + '0' }, /UUID/],
      ['instanta pe http, pe alta gazda decat cea locala', { UMAMI_URL: 'http://statistica.exemplu.test', UMAMI_WEBSITE_ID: ID }, /UMAMI_URL trebuie sa inceapa cu https/],
      ['instanta cu cale', { UMAMI_URL: INSTANTA + '/umami', UMAMI_WEBSITE_ID: ID }, /doar originea/],
      ['instanta cu parametri', { UMAMI_URL: INSTANTA + '/?a=1', UMAMI_WEBSITE_ID: ID }, /doar originea/],
      ['instanta cu credentiale', { UMAMI_URL: 'https://u:p@statistica.exemplu.test', UMAMI_WEBSITE_ID: ID }, /doar originea/],
      ['instanta care nu e adresa', { UMAMI_URL: 'statistica', UMAMI_WEBSITE_ID: ID }, /UMAMI_URL nu e o adresa web/],
    ]
    for (const [caz, mediu, tipar] of rele) expect(mesaj(() => analiticaProprie(mediu)), caz).toMatch(tipar)
  })
})

describe('rescrierile Next.js: browserul vorbeste numai cu originea site-ului', () => {
  it('doua cai proprii, exacte, spre instanta: scriptul si primirea, nimic altceva', () => {
    const r = rescrieriAnalitica({ UMAMI_URL: INSTANTA, UMAMI_WEBSITE_ID: ID }, true)
    expect(r).toEqual([
      { source: '/a/script.js', destination: INSTANTA + '/script.js' },
      { source: '/a/api/send', destination: INSTANTA + '/api/send' },
    ])
    expect(CALE_SCRIPT).toBe('/a/script.js')
    expect(CALE_TRIMITERE).toBe('/a/api/send')
    // Trackerul isi ia adresa de trimitere din directorul propriului `src`: `/a/script.js` da `/a/api/send`
    expect(CALE_SCRIPT.split('/').slice(0, -1).join('/') + '/api/send').toBe(CALE_TRIMITERE)
    // Calea din pagina nu poarta niciodata gazda instantei, iar rescrierile nu au caractere-joker
    for (const { source } of r) expect(source).not.toMatch(/[*:()]/)
  })

  it('next.config.ts: fara variabile lista e goala, cu variabile si operator rescrierile de mai sus, iar antetele de securitate raman', async () => {
    const config = (await import('../next.config')).default
    vi.stubEnv('OPERATOR_JSON', jsonOperator(OPERATOR_SINTETIC))
    vi.stubEnv('UMAMI_URL', '')
    vi.stubEnv('UMAMI_WEBSITE_ID', '')
    expect(await config.rewrites?.()).toEqual([])
    vi.stubEnv('UMAMI_URL', INSTANTA)
    vi.stubEnv('UMAMI_WEBSITE_ID', ID)
    expect(await config.rewrites?.()).toEqual(rescrieriAnalitica({ UMAMI_URL: INSTANTA, UMAMI_WEBSITE_ID: ID }, true))
    expect(await config.rewrites?.()).toHaveLength(2)
    // O configurare gresita opreste construirea aici, inainte de compilare
    vi.stubEnv('UMAMI_WEBSITE_ID', '')
    await expect(Promise.resolve().then(() => config.rewrites?.())).rejects.toThrow(/UMAMI_URL si UMAMI_WEBSITE_ID se seteaza impreuna/)
    // Controlul: nu s-a atins ce nu era al feliei
    const antete = (await config.headers?.()) ?? []
    const chei = antete.flatMap((a) => a.headers.map((h) => h.key))
    expect(chei).toEqual(expect.arrayContaining(['X-Content-Type-Options', 'Content-Security-Policy', 'X-Frame-Options']))
  })
})

describe('fara operator, analitica proprie nu porneste, chiar cu variabile (planul §9, ca GA4)', () => {
  const MEDIU = { UMAMI_URL: INSTANTA, UMAMI_WEBSITE_ID: ID }
  const INCOMPLET: Operator = { ...OPERATOR_SINTETIC, sediu: '', email: '', tara: '' }
  const SUBSTITUENT: Operator = { ...OPERATOR_SINTETIC, sediu: 'de completat' }
  /** Cazurile operatorului, cu raspunsul asteptat: porneste numai un operator numit SI complet. */
  const CAZURI: [string, Operator | null, boolean][] = [
    ['niciun operator', null, false],
    ['operator numit, cu trei campuri goale', INCOMPLET, false],
    ['operator numit, cu un substituent la sediu', SUBSTITUENT, false],
    ['operator numit si complet', OPERATOR_SINTETIC, true],
  ]

  it('martor NEGATIV (reproducerea constatarii): UMAMI_* in mediu si niciun operator, `Analitica` nu randeaza nimic', () => {
    vi.stubEnv('UMAMI_URL', INSTANTA)
    vi.stubEnv('UMAMI_WEBSITE_ID', ID)
    expect(Analitica({ operator: null })).toBeNull()
  })

  it('analitica proprie ajunge in starea bannerului numai cu operator numit si complet; un operator incomplet sau cu substituent nu ajunge', () => {
    vi.stubEnv('UMAMI_URL', INSTANTA)
    vi.stubEnv('UMAMI_WEBSITE_ID', ID)
    for (const [caz, operator, asteptat] of CAZURI) {
      const stare = stareAnalitica(operator, null, MEDIU)
      expect(stare.activa && stare.umami !== null, caz).toBe(asteptat)
      // Masurarea S-B: componenta din layout nu mai pune nimic in pagina, in niciun caz
      expect(Analitica({ operator }), caz).toBeNull()
    }
  })

  it('aceeasi regula ca la GA4: pe aceiasi operatori, `stareAnalitica` si analitica proprie dau acelasi raspuns', () => {
    const raspunsuri = CAZURI.map(([caz, operator, asteptat]) => {
      const ga4 = stareAnalitica(operator, 'G-PROBA12345').activa
      const proprie = stareAnaliticaProprie(MEDIU, operatorComplet(operator)).activa
      expect(proprie, caz).toBe(ga4)
      expect(proprie, caz).toBe(asteptat)
      return proprie
    })
    // Controlul: regula chiar deosebeste cazurile (nu e "totul oprit" sau "totul pornit")
    expect(raspunsuri).toContain(true)
    expect(raspunsuri).toContain(false)
  })

  it('starea spune de ce nu ruleaza (nesetata sau fara operator), iar cea pornita poarta originea si identificatorul', () => {
    expect(stareAnaliticaProprie({}, true)).toEqual({ activa: false, motiv: 'nesetata' })
    expect(stareAnaliticaProprie({}, false)).toEqual({ activa: false, motiv: 'nesetata' })
    expect(stareAnaliticaProprie(MEDIU, false)).toEqual({ activa: false, motiv: 'fara-operator' })
    expect(stareAnaliticaProprie(MEDIU, true)).toEqual({ activa: true, origine: INSTANTA, idSite: ID })
  })

  it('o configurare gresita se raporta si fara operator: eroarea nu se ascunde in spatele lipsei lui', () => {
    expect(mesaj(() => stareAnaliticaProprie({ UMAMI_URL: INSTANTA }, false))).toContain('UMAMI_WEBSITE_ID')
    expect(mesaj(() => rescrieriAnalitica({ UMAMI_URL: INSTANTA, UMAMI_WEBSITE_ID: 'nu-e-uuid' }, false))).toContain('UUID')
  })

  it('rescrierile: fara operator lista e goala (nici `/a/api/send` nu trece spre instanta), cu operator sunt cele doua', () => {
    expect(rescrieriAnalitica(MEDIU, false)).toEqual([])
    expect(rescrieriAnalitica(MEDIU, true)).toHaveLength(2)
  })

  it('avertismentul din jurnalul build-ului numeste variabilele, sursele operatorului si starea, fara diacritice si fara liniute lungi', () => {
    expect(AVERTISMENT_FARA_OPERATOR).toContain('UMAMI_URL si UMAMI_WEBSITE_ID sunt setate')
    expect(AVERTISMENT_FARA_OPERATOR).toContain('OPERATOR_JSON')
    expect(AVERTISMENT_FARA_OPERATOR).toContain('config/operator.json')
    expect(AVERTISMENT_FARA_OPERATOR).toContain('analitica proprie ramane OPRITA')
    // Numai ASCII tipariabil: nicio diacritica si nicio liniuta lunga (jurnalul unui build trece prin terminale si panouri care nu le afiseaza la fel)
    expect(AVERTISMENT_FARA_OPERATOR).toMatch(/^[\x20-\x7e]+$/)
  })
})

describe('cu modulele reale: operatorul e cel rezolvat, OPERATOR_JSON inaintea fisierului', () => {
  /**
   * Reincarca starea bannerului si configurarea Next cu un `OPERATOR_JSON` dat (`''` = nesetat) si cu variabilele
   * analiticii. `componenta` raspunde ca inainte la "e analitica proprie in pagina?", acum prin starea bannerului
   * (masurarea S-B: scriptul il pune bannerul dupa accept): `null` cand nu e, identificatorul cand e.
   */
  async function incarca(operatorJson: string) {
    vi.resetModules()
    vi.stubEnv('OPERATOR_JSON', operatorJson)
    vi.stubEnv('UMAMI_URL', INSTANTA)
    vi.stubEnv('UMAMI_WEBSITE_ID', ID)
    const { stareAnalitica: stareReala } = await import('../src/lib/analitica')
    const config = (await import('../next.config')).default
    const componenta = (argumente: Record<string, never>) => {
      void argumente
      const stare = stareReala(undefined, null)
      return stare.activa ? stare.umami : null
    }
    return { componenta, config }
  }
  /** Fisierul de configurare cu un operator pus in el (mock, ca fisierul din depozit sa ramana neatins). */
  async function fisierCuOperator(operator: Operator) {
    const real = await import('../config/operator.json')
    vi.doMock(JSON_OPERATOR, () => ({ default: { ...real.default, operator } }))
  }

  it('martor POZITIV: OPERATOR_JSON cu operator complet, scriptul in pagina si cele doua rescrieri, fara avertisment', async () => {
    const avertisment = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const { componenta, config } = await incarca(jsonOperator(OPERATOR_SINTETIC))
    expect(componenta({})).not.toBeNull()
    expect(await config.rewrites?.()).toHaveLength(2)
    expect(avertisment).not.toHaveBeenCalled()
  })

  it('martor NEGATIV: {"operator": null} in mediu, nimic in pagina, nicio rescriere, iar avertismentul apare o singura data pe proces', async () => {
    const avertisment = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const { componenta, config } = await incarca(jsonOperator(null))
    expect(componenta({})).toBeNull()
    expect(await config.rewrites?.()).toEqual([])
    // Next cheama `rewrites()` de doua ori intr-un build (rutele si manifestul tipurilor de rute): masurat, iar jurnalul nu se dubleaza
    expect(await config.rewrites?.()).toEqual([])
    expect(avertisment).toHaveBeenCalledTimes(1)
    expect(String(avertisment.mock.calls[0][0])).toContain(AVERTISMENT_FARA_OPERATOR)
  })

  it('martor NEGATIV: fara OPERATOR_JSON decide fisierul; azi are null, deci nimic (proba isi muta asteptarea daca fisierul se schimba)', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    const fisier = await import('../config/operator.json')
    const { componenta, config } = await incarca('')
    const complet = operatorComplet(citesteOperator(fisier.default as unknown))
    expect(componenta({}) !== null).toBe(complet)
    expect(((await config.rewrites?.()) as unknown[]).length).toBe(complet ? 2 : 0)
  })

  it('martor POZITIV: fisierul numeste un operator complet, mediul nu spune nimic, analitica porneste (calea fisierului)', async () => {
    const avertisment = vi.spyOn(console, 'warn').mockImplementation(() => {})
    await fisierCuOperator(OPERATOR_SINTETIC)
    const { componenta, config } = await incarca('')
    expect(componenta({})).not.toBeNull()
    expect(await config.rewrites?.()).toHaveLength(2)
    expect(avertisment).not.toHaveBeenCalled()
  })

  it('martor NEGATIV: {"operator": null} din mediu bate operatorul din fisier, analitica ramane oprita', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    await fisierCuOperator(OPERATOR_SINTETIC)
    const { componenta, config } = await incarca(jsonOperator(null))
    expect(componenta({})).toBeNull()
    expect(await config.rewrites?.()).toEqual([])
  })

  it('martor NEGATIV: fara variabilele analiticii nu se scrie niciun avertisment, cu sau fara operator', async () => {
    const avertisment = vi.spyOn(console, 'warn').mockImplementation(() => {})
    vi.resetModules()
    vi.stubEnv('OPERATOR_JSON', jsonOperator(null))
    vi.stubEnv('UMAMI_URL', '')
    vi.stubEnv('UMAMI_WEBSITE_ID', '')
    const config = (await import('../next.config')).default
    expect(await config.rewrites?.()).toEqual([])
    expect(avertisment).not.toHaveBeenCalled()
  })
})

describe('elementul din pagina (masurarea S-B)', () => {
  it('layout-ul nu mai pune scriptul; bannerul primeste numai identificatorul site-ului, nu adresa instantei', () => {
    vi.stubEnv('UMAMI_URL', INSTANTA)
    vi.stubEnv('UMAMI_WEBSITE_ID', ID)
    expect(Analitica({ operator: OPERATOR_SINTETIC })).toBeNull()
    const stare = stareAnalitica(OPERATOR_SINTETIC, null, { UMAMI_URL: INSTANTA, UMAMI_WEBSITE_ID: ID })
    // Controlul: cu aceleasi intrari analitica proprie chiar e pornita, deci `null` de mai sus nu vine dintr-o stare oprita
    expect(stare).toEqual({ activa: true, idGa4: null, umami: { idSite: ID } })
    // Nimic care sa duca browserul spre instanta: in pagina ajunge numai identificatorul, scriptul se cere de pe cale proprie
    expect(JSON.stringify(stare)).not.toContain(INSTANTA)
    expect(CALE_SCRIPT.startsWith('/')).toBe(true)
  })
})

describe('textele juridice despre analitica fara cookie', () => {
  const DOMENIU = '3s.md'
  const sectiune = (d: DocumentJuridic, cheie: string) => d.sectiuni.find((s) => s.cheie === cheie)
  const paragrafe = (d: DocumentJuridic, cheie: string) => (sectiune(d, cheie)?.blocuri ?? []).flatMap((b) => [...b.paragrafe, ...(b.dupa ?? [])])
  const fara = (t: string) => t.normalize('NFD').replace(new RegExp('[' + String.fromCharCode(0x300) + '-' + String.fromCharCode(0x36f) + ']', 'g'), '').replace(/\s+/g, ' ').toLowerCase()

  it('martor NEGATIV: fara analitica, cele doua documente raman cele de pana acum, cu data lor', () => {
    expect(texteAnalitica(OPERATOR_SINTETIC.email, false)).toBeNull()
    const conf = politicaConfidentialitate(OPERATOR_SINTETIC, { domeniu: DOMENIU, analitica: false })
    const cook = politicaCookie(OPERATOR_SINTETIC, { analitica: false })
    expect(conf.versiune).toBe(VERSIUNE_CONFIDENTIALITATE)
    expect(cook.versiune).toBe(VERSIUNE_COOKIE)
    // Structura de pana acum: 4 paragrafe la ce prelucram, 1 la interese, 4 la pastrare, 1 dupa tabelul cookie-urilor
    expect(paragrafe(conf, '1c')).toHaveLength(4)
    expect(paragrafe(conf, '1d')).toEqual([
      'Invocăm interesul legitim numai pentru jurnalele serverului: ca site-ul să funcționeze, să poată fi depanat și să fie apărat de atacuri. Datele din jurnale nu se folosesc pentru publicitate și nu se combină cu alte surse.',
    ])
    expect(paragrafe(conf, '2a')).toHaveLength(4)
    expect(paragrafe(cook, '2b')).toHaveLength(2) // paragraful de deschidere si cel de dupa tabel
    expect(fara(textIntreg(conf) + textIntreg(cook))).not.toContain('fara cookie')
    // Fara parametru, citirea din mediu (goala aici) da acelasi document
    vi.stubEnv('UMAMI_URL', '')
    vi.stubEnv('UMAMI_WEBSITE_ID', '')
    expect(politicaConfidentialitate(OPERATOR_SINTETIC, { domeniu: DOMENIU })).toEqual(conf)
    expect(politicaCookie(OPERATOR_SINTETIC)).toEqual(cook)
  })

  it('martor POZITIV: cu analitica, paragraful exact apare in sectiunile potrivite, cu data lui, fara sa contrazica ce era', () => {
    const t = texteAnalitica(OPERATOR_SINTETIC.email, true)
    expect(t).not.toBeNull()
    const conf = politicaConfidentialitate(OPERATOR_SINTETIC, { domeniu: DOMENIU, analitica: true })
    const cook = politicaCookie(OPERATOR_SINTETIC, { analitica: true })
    expect(conf.versiune).toBe(VERSIUNE_ANALITICA)
    expect(cook.versiune).toBe(VERSIUNE_ANALITICA)
    expect(VERSIUNE_ANALITICA > VERSIUNE_CONFIDENTIALITATE).toBe(true)
    // ce se prelucreaza (art. 13 alin. (1) lit. c)), interesul (lit. d)), durata (alin. (2) lit. a)), lista din cookie-uri
    expect(paragrafe(conf, '1c')).toContain(t?.prelucrare)
    expect(paragrafe(conf, '1c')).toHaveLength(5)
    expect(paragrafe(conf, '1d')).toEqual([t?.jurnale, t?.interes])
    expect(paragrafe(conf, '2a')).toContain(t?.pastrare)
    expect(paragrafe(cook, '2b')).toContain(t?.cookie)
    // "numai pentru jurnalele serverului" nu mai poate sta langa interesul masurarii: ar fi o contradictie
    expect(fara(textIntreg(conf))).not.toContain('numai pentru jurnalele serverului')
    expect(fara(textIntreg(conf))).toContain('si pentru masurarea vizitelor fara cookie')
    // adresa la care se face opozitia e cea a operatorului, iar cheile art. 13 si L284 raman aceleasi
    expect(t?.interes).toContain(OPERATOR_SINTETIC.email)
    expect(conf.sectiuni.map((s) => s.cheie)).toEqual([...CHEI_ART13])
    expect(cook.sectiuni.filter((s) => (CHEI_L284 as readonly string[]).includes(s.cheie)).map((s) => s.cheie).sort()).toEqual([...CHEI_L284].sort())
  })

  it('cele doua documente construite de `texteJuridice` urmeaza variabilele, nu un parametru', () => {
    const baza = 'https://3s.md'
    vi.stubEnv('UMAMI_URL', INSTANTA)
    vi.stubEnv('UMAMI_WEBSITE_ID', ID)
    const cu = texteJuridice(OPERATOR_SINTETIC, baza)
    expect(cu?.confidentialitate.versiune).toBe(VERSIUNE_ANALITICA)
    expect(paragrafe(cu!.confidentialitate, '1c').some((p) => p.startsWith('Măsurarea vizitelor, fără cookie.'))).toBe(true)
    vi.stubEnv('UMAMI_URL', '')
    vi.stubEnv('UMAMI_WEBSITE_ID', '')
    const fara_ = texteJuridice(OPERATOR_SINTETIC, baza)
    expect(fara_?.confidentialitate.versiune).toBe(VERSIUNE_CONFIDENTIALITATE)
    expect(paragrafe(fara_!.confidentialitate, '1c').some((p) => p.startsWith('Măsurarea vizitelor'))).toBe(false)
  })

  it('ce spun textele e ce s-a masurat: fara cookie, do-not-track, ce primeste, IP nesalvat, fara publicitate, fara "anonim"', () => {
    const t = texteAnalitica(OPERATOR_SINTETIC.email, true)!
    const toate = fara(Object.values(t).join('\n'))
    for (const fapt of [
      'fara cookie',
      'nimic in stocarea locala',
      'do not track',
      'adresa paginii',
      'dimensiunea ecranului',
      'adresa ip nu se salveaza',
      'nu se folosesc pentru publicitate',
      'server administrat de noi',
    ]) {
      expect(toate, fapt).toContain(fapt)
    }
    // Ce NU afirma, deliberat (motivele sunt in antetul `src/content/juridic/analitica.ts`): "anonim", ca masurarea nu cere acord, un termen in cifre, tara serverului
    for (const nu of ['anonim', 'nu cere acord', 'nu necesita acord', 'nu are nevoie de acord', 'in germania', 'in romania', 'timp de ', ' luni', ' zile', ' ani']) {
      expect(toate, nu).not.toContain(nu)
    }
    // Fara date de firma si fara liniute lungi
    expect(Object.values(t).join('\n')).not.toMatch(new RegExp('[' + String.fromCharCode(0x2013) + String.fromCharCode(0x2014) + ']'))
    expect(toate).not.toContain(fara(OPERATOR_SINTETIC.denumire))
  })

  it('poarta juridica nu are ce sa ii reproseze: niciun nume de tert din C-01, niciun numar langa "operator" (L-10)', () => {
    const poarta = citeste('.claude/scripts/porti/poarta-juridic.py')
    const bloc = poarta.slice(poarta.indexOf('NUME_TERTI = ['), poarta.indexOf(']', poarta.indexOf('NUME_TERTI = [')))
    const nume = [...bloc.matchAll(/'([^']+)'/g)].map((m) => m[1])
    // Controlul extragerii: lista chiar s-a citit si e cea cunoscuta
    expect(nume).toEqual(expect.arrayContaining(['googletagmanager', 'plausible.io', 'matomo']))
    expect(nume.length).toBeGreaterThan(10)
    const t = texteAnalitica(OPERATOR_SINTETIC.email, true)!
    const surse = [citeste('src/content/juridic/analitica.ts'), citeste('src/components/analitica/config.ts'), citeste('src/components/analitica/Analitica.tsx'), Object.values(t).join('\n')]
    for (const text of surse) for (const n of nume) expect(text.toLowerCase(), n).not.toContain(n)
    // Aceeasi expresie ca in poarta (`re.S` acolo); aici `[\s\S]` in loc de steagul `s`, pe care tinta ES2017 nu-l cunoaste
    const tiparOperator = /\bnum[ae]r\w*\b[\s\S]{0,120}?\boperator/
    expect(fara(Object.values(t).join('\n'))).not.toMatch(tiparOperator)
    // Martorul pozitiv al cautarii: aceeasi expresie prinde o propozitie care chiar contine tiparul
    expect(tiparOperator.test(fara('Numărul de înscriere al operatorului'))).toBe(true)
  })
})
