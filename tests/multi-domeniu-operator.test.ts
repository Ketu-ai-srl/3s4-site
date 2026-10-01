import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { VARIABILA_FAMILIE_JURIDICA, citesteFamilie } from '../src/content/juridic/familie'
import { ruteJuridice } from '../src/content/juridic/publicare'
import { VARIABILA_OPERATOR, VARIABILA_OPERATOR_NUMIT, citesteOperatorNumit, configurareOperatorDinMediu, operatorNumitInMediu } from '../src/lib/operator-mediu'
import { SURSA_FISIER, alegeOperator, citesteOperator, lipsuriInformare, type Operator } from '../src/lib/operator'

// Domeniile pornesc din acelasi cod, fiecare cu variabilele lui. Fisierul se citeste si cand cineva are
// `OPERATOR_JSON` in mediul de lucru: se goleste inainte de orice import, ca proba sa masoare codul, nu masina.
vi.hoisted(() => {
  process.env.OPERATOR_JSON = ''
})

// Probele care reincarca modulele paginii transforma de fiecare data pagina, componentele si stilurile: masurat 1 s pe statia
// libera si peste 5 s pe una incarcata de alte rulari. Plafonul e al fisierului, nu al unui caz.
vi.setConfig({ testTimeout: 60_000 })

/**
 * Felia multi-domeniu, punctul 1: OPERATORUL PE DOMENIU (`OPERATOR_JSON`, planul valului S4, §10).
 * Aceeasi schema ca `config/operator.json`, validata cu ACEEASI functie de citire, prioritara fata de
 * fisier; fara variabila (nesetata sau goala), comportamentul de azi. Proba de browser
 * (`tests/browser/multi-domeniu.spec.ts`) construieste un domeniu cu operatorul din mediu si masoara
 * paginile juridice, formularul si consola browserului.
 *
 * FIXTURILE se asambleaza la RULARE: valorile sunt pe domeniul rezervat `.test`, iar o proba care poarta
 * literal ce vaneaza portile devine ea insasi o instanta a defectului.
 */

const OPERATOR_SINTETIC: Operator = {
  denumire: ['Operator', 'Sintetic', 'Domeniu', 'SRL'].join(' '),
  sediu: 'Strada Exemplului 1, Pitesti',
  email: ['date', ['operator-3s', 'test'].join('.')].join('@'),
  telefon: '',
  numar_orc: '',
  cod_fiscal: '',
  tara: 'România',
  dpo: '',
}

const OPERATOR_DIN_FISIER: Operator = { ...OPERATOR_SINTETIC, denumire: ['Operator', 'Din', 'Fisier', 'SRL'].join(' ') }

const DESTINATIE = 'https://' + ['destinatie', 'proba', 'test'].join('.') + '/formulare'

/** JSON-ul variabilei, cu forma din `_forma`. */
const jsonOperator = (operator: Operator | null) => JSON.stringify({ operator })

/** Mesajul erorii aruncate, sau `null` daca nu s-a aruncat nimic. */
function mesaj(f: () => unknown): string | null {
  try {
    f()
    return null
  } catch (e) {
    return e instanceof Error ? e.message : String(e)
  }
}

afterEach(() => {
  vi.unstubAllEnvs()
  vi.resetModules()
})

describe('OPERATOR_JSON: fara variabila, comportamentul de azi', () => {
  it('martor NEGATIV: nesetata, goala sau cu spatii inseamna "nu exista variabila", nu "JSON stricat"', () => {
    for (const valoare of [undefined, '', '   ', '\n\t ']) {
      expect(configurareOperatorDinMediu(valoare), JSON.stringify(valoare)).toBeNull()
      expect(operatorNumitInMediu(valoare), JSON.stringify(valoare)).toBeNull()
    }
  })

  it('martor NEGATIV: fara variabila decide fisierul, si sursa spune asta', () => {
    expect(alegeOperator(null, { operator: null })).toEqual({ operator: null, sursa: SURSA_FISIER })
    expect(alegeOperator(null, { operator: OPERATOR_DIN_FISIER })).toEqual({ operator: OPERATOR_DIN_FISIER, sursa: SURSA_FISIER })
  })

  it('martor NEGATIV: pe modulele reale, cu variabila goala, OPERATOR e chiar cel din config/operator.json', async () => {
    vi.resetModules()
    vi.stubEnv('OPERATOR_JSON', '')
    const modul = await import('../src/lib/operator')
    const fisier = await import('../config/operator.json')
    expect(modul.OPERATOR).toEqual(citesteOperator(fisier.default as unknown))
    expect(modul.SURSA_OPERATOR).toBe(SURSA_FISIER)
    const rute = await import('../src/content/rute')
    // Controlul: azi fisierul are operator null, deci nicio ruta juridica; daca fisierul se schimba,
    // proba isi schimba asteptarea odata cu el, fiindca o citeste tot de acolo.
    const cai = rute.RUTE.map((r) => r.cale).filter((c) => c === '/juridic' || c.startsWith('/juridic/'))
    expect(cai.length > 0).toBe(fisier.default.operator !== null)
  })
})

describe('OPERATOR_JSON: cu variabila, ea are prioritate', () => {
  it('martor POZITIV: un operator complet din mediu intra, cu sursa OPERATOR_JSON, campurile curatate de spatii', () => {
    const cfg = configurareOperatorDinMediu(jsonOperator({ ...OPERATOR_SINTETIC, sediu: '  ' + OPERATOR_SINTETIC.sediu + '  ' }))
    expect(cfg).not.toBeNull()
    const ales = alegeOperator(cfg, { operator: null })
    expect(ales.operator).toEqual(OPERATOR_SINTETIC)
    expect(ales.sursa).toBe(VARIABILA_OPERATOR)
    expect(lipsuriInformare(ales.operator as Operator)).toEqual([])
  })

  it('martor POZITIV: mediul bate fisierul si cand fisierul numeste alt operator', () => {
    const ales = alegeOperator(configurareOperatorDinMediu(jsonOperator(OPERATOR_SINTETIC)), { operator: OPERATOR_DIN_FISIER })
    expect(ales.operator?.denumire).toBe(OPERATOR_SINTETIC.denumire)
    expect(ales.operator?.denumire).not.toBe(OPERATOR_DIN_FISIER.denumire)
  })

  it('{"operator": null} din mediu e o valoare, nu o lipsa: domeniul nu are operator chiar daca fisierul numeste unul', () => {
    const cfg = configurareOperatorDinMediu('{"operator": null}')
    expect(cfg).not.toBeNull()
    expect(alegeOperator(cfg, { operator: OPERATOR_DIN_FISIER })).toEqual({ operator: null, sursa: VARIABILA_OPERATOR })
    expect(operatorNumitInMediu('{"operator": null}')).toBe(false)
    expect(operatorNumitInMediu(jsonOperator(OPERATOR_SINTETIC))).toBe(true)
  })

  it('un BOM la inceputul valorii nu strica citirea (unele unelte il pun in fata)', () => {
    const bom = String.fromCharCode(0xfeff)
    expect(alegeOperator(configurareOperatorDinMediu(bom + '{"operator": null}'), { operator: OPERATOR_DIN_FISIER }).operator).toBeNull()
  })
})

describe('OPERATOR_JSON: o valoare gresita opreste construirea, cu mesaj care numeste variabila si campul', () => {
  it('martor POZITIV: text care nu e JSON', () => {
    const m = mesaj(() => configurareOperatorDinMediu('{operator: null'))
    expect(m).toContain('OPERATOR_JSON nu e JSON valid')
    expect(m).toContain('Forma:')
    expect(mesaj(() => configurareOperatorDinMediu('null'))).toBeNull() // e JSON valid; forma o judeca citesteOperator
    expect(mesaj(() => alegeOperator(configurareOperatorDinMediu('null'), { operator: null }))).toContain('OPERATOR_JSON: lipseste cheia "operator"')
  })

  it('martor POZITIV: acelasi mesaj ca pentru fisier, cu numele variabilei in loc de al fisierului (aceeasi functie de citire)', () => {
    const rele: [string, unknown][] = [
      ['fara cheia operator', {}],
      ['operator text', { operator: 'Alfa Exemplu' }],
      ['operator lista', { operator: [] }],
      ['camp necunoscut', { operator: { denumire: 'x', cui: 'y' } }],
      ['camp netextual', { operator: { denumire: 3 } }],
      ['campurile firmei la radacina', { denumire: 'x', sediu: 'y' }],
    ]
    for (const [caz, cfg] of rele) {
      const dinFisier = mesaj(() => citesteOperator(cfg))
      const dinMediu = mesaj(() => alegeOperator(configurareOperatorDinMediu(JSON.stringify(cfg)), { operator: null }))
      // Controlul: fisierul chiar respinge cazul (altfel egalitatea de mai jos ar fi doi `null`).
      expect(dinFisier, caz).not.toBeNull()
      expect(dinFisier, caz).toContain(SURSA_FISIER)
      expect(dinMediu, caz).toBe((dinFisier as string).replace(SURSA_FISIER, VARIABILA_OPERATOR))
    }
    // Indiciul pentru greseala cea mai probabila: campurile puse langa cheia operator, nu sub ea.
    expect(mesaj(() => citesteOperator({ denumire: 'x' }, VARIABILA_OPERATOR))).toContain('stau sub cheia "operator"')
  })

  it('un operator numit dar incomplet: lista campurilor care lipsesc, nu doar "eroare"', () => {
    const doarDenumire = configurareOperatorDinMediu(jsonOperator({ ...OPERATOR_SINTETIC, sediu: '', email: '', tara: '' }))
    const m = mesaj(() => alegeOperator(doarDenumire, { operator: null }))
    expect(m).toContain('OPERATOR_JSON')
    expect(m).toContain('lipsesc: sediu, email, tara')
    // Un substituent tine loc de camp gol, ca in fisier (poarta juridica are aceeasi regula).
    const substituent = configurareOperatorDinMediu(jsonOperator({ ...OPERATOR_SINTETIC, sediu: 'de completat' }))
    expect(mesaj(() => alegeOperator(substituent, { operator: null }))).toContain('lipsesc: sediu')
    // Martor NEGATIV: acelasi operator, complet, trece.
    expect(mesaj(() => alegeOperator(configurareOperatorDinMediu(jsonOperator(OPERATOR_SINTETIC)), { operator: null }))).toBeNull()
  })

  it('pe modulele reale, JSON-ul stricat opreste incarcarea inainte de orice pagina', async () => {
    vi.resetModules()
    vi.stubEnv('OPERATOR_JSON', '{"operator": ')
    await expect(import('../src/lib/operator')).rejects.toThrow(/OPERATOR_JSON nu e JSON valid/)
    vi.resetModules()
    await expect(import('../src/content/rute')).rejects.toThrow(/OPERATOR_JSON nu e JSON valid/)
  })
})

describe('OPERATOR_JSON: cu un operator sintetic din mediu, paginile juridice si formularul pornesc', () => {
  async function moduleCuOperatorDinMediu(operator: Operator | null | undefined) {
    vi.resetModules()
    vi.stubEnv('OPERATOR_JSON', operator === undefined ? '' : jsonOperator(operator))
    const modul = await import('../src/lib/operator')
    const rute = await import('../src/content/rute')
    const cai = await import('../src/content/cai')
    const pagina = await import('../src/app/juridic/[[...document]]/page')
    const stare = await import('../src/components/formular/stare')
    const logica = await import('../src/app/api/formular/logica')
    return { modul, rute, cai, pagina, stare, logica }
  }

  it('martor POZITIV: cele opt pagini intra in RUTE si in caile existente, pagina le construieste, formularul se activeaza', async () => {
    const m = await moduleCuOperatorDinMediu(OPERATOR_SINTETIC)
    // Controlul injectiei: modulul incarcat chiar vede operatorul din mediu, nu pe cel din fisier.
    expect(m.modul.OPERATOR?.email).toBe(OPERATOR_SINTETIC.email)
    expect(m.modul.SURSA_OPERATOR).toBe(VARIABILA_OPERATOR)
    const asteptate = ruteJuridice(true).map((r) => r.cale)
    expect(asteptate).toHaveLength(8)
    const dinRute = m.rute.RUTE.map((r) => r.cale)
    for (const cale of asteptate) {
      expect(dinRute, cale).toContain(cale)
      expect(m.cai.CAI_EXISTENTE.has(cale), cale).toBe(true)
    }
    const construite = m.pagina.generateStaticParams().map((p: { document: string[] }) => (p.document.length === 0 ? '/juridic' : '/juridic/' + p.document.join('/')))
    expect([...construite].sort()).toEqual([...asteptate].sort())
    expect(m.stare.stareFormular(m.modul.OPERATOR).activ).toBe(true)
  })

  it('martor POZITIV: cu operator din mediu si o destinatie, o cerere valida chiar pleaca, o data', async () => {
    const m = await moduleCuOperatorDinMediu(OPERATOR_SINTETIC)
    const trimise: string[] = []
    const trimite = (async (url: string | URL | Request) => {
      trimise.push(String(url))
      return new Response(null, { status: 200 })
    }) as typeof fetch
    const cerere = new Request('http://127.0.0.1/api/formular', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Origin: 'https://3s4.ke2.in' },
      body: JSON.stringify({
        formular: 'enterprise',
        nume: 'Ioana Proba',
        email: ['ioana', ['firma-proba', 'test'].join('.')].join('@'),
        telefon: '',
        companie: 'Firma Proba',
        mesaj: 'Avem 40 de cutii de arhiva.',
        marketing: false,
      }),
    })
    const r = await m.logica.trateazaCerere(cerere, { operator: m.modul.OPERATOR, destinatie: DESTINATIE, trimite, site: 'https://3s4.ke2.in' })
    expect(r.status).toBe(200)
    expect(trimise).toEqual([DESTINATIE])
  })

  it('martor NEGATIV: fara variabila, aceleasi module raman ca azi (nicio pagina juridica, formular inactiv)', async () => {
    const fisier = await import('../config/operator.json')
    const m = await moduleCuOperatorDinMediu(undefined)
    expect(m.modul.SURSA_OPERATOR).toBe(SURSA_FISIER)
    const dinRute = m.rute.RUTE.map((r) => r.cale)
    const juridice = dinRute.filter((c) => c === '/juridic' || c.startsWith('/juridic/'))
    expect(juridice.length > 0).toBe(fisier.default.operator !== null)
    expect(m.stare.stareFormular(m.modul.OPERATOR).activ).toBe(fisier.default.operator !== null && lipsuriInformare(m.modul.OPERATOR as Operator).length === 0)
    if (fisier.default.operator === null) {
      expect(m.pagina.generateStaticParams()).toEqual([])
      const r = await m.logica.trateazaCerere(new Request('http://127.0.0.1/api/formular', { method: 'POST', body: '{}' }), { operator: m.modul.OPERATOR, destinatie: DESTINATIE })
      expect(await r.json()).toEqual({ stare: 'inactiv', motiv: 'fara-operator' })
    }
  })

  it('martor NEGATIV: {"operator": null} din mediu tine domeniul fara pagini juridice si cu formular inactiv', async () => {
    const m = await moduleCuOperatorDinMediu(null)
    expect(m.modul.OPERATOR).toBeNull()
    expect(m.modul.SURSA_OPERATOR).toBe(VARIABILA_OPERATOR)
    expect(m.rute.RUTE.some((r) => r.cale === '/juridic' || r.cale.startsWith('/juridic/'))).toBe(false)
    expect(m.pagina.generateStaticParams()).toEqual([])
    expect(m.stare.stareFormular(m.modul.OPERATOR).activ).toBe(false)
    // Controlul: aceeasi incarcare vede harta si accesibilitatea, deci RUTE chiar s-a citit.
    expect(m.rute.RUTE.map((r) => r.cale)).toEqual(expect.arrayContaining(['/harta-site', '/accesibilitate']))
  })
})

describe('cautarea Ctrl+K: pachetul de browser primeste valoarea calculata la construire, nu variabila', () => {
  // Constatarea criticului (runda 1): pachetul de browser nu vede `OPERATOR_JSON` (Next inlocuieste numai `NEXT_PUBLIC_*`), deci
  // `RUTE` de acolo decidea dupa fisier, iar cautarea Ctrl+K nu gasea paginile juridice pe un domeniu al carui operator vine
  // numai din mediu, desi serverul le construia. `next.config.ts` calculeaza `NEXT_PUBLIC_OPERATOR_NUMIT` din `OPERATOR_JSON`
  // si Next o inlocuieste in TOATE pachetele; `publicare.ts` o citeste inaintea variabilei si a fisierului.
  const JSON_OPERATOR = '../config/operator.json'
  const cai = (rute: readonly { cale: string }[]) => rute.map((r) => r.cale)
  const JURIDICE = ruteJuridice(true).map((r) => r.cale)

  /** Pachetul de browser: fara `OPERATOR_JSON` in mediu, cu valoarea calculata (`valoare`, sau nesetata) in locul ei. */
  async function ruteInBrowser(valoare: string | undefined, fisierCuOperator?: Operator) {
    vi.resetModules()
    vi.stubEnv('OPERATOR_JSON', '')
    // `undefined` sterge variabila: o valoare pusa de un apel anterior din aceeasi proba nu trebuie sa ramana
    vi.stubEnv(VARIABILA_OPERATOR_NUMIT, valoare)
    if (fisierCuOperator !== undefined) {
      const real = await import('../config/operator.json')
      vi.doMock(JSON_OPERATOR, () => ({ default: { ...real.default, operator: fisierCuOperator } }))
    }
    const publicare = await import('../src/content/juridic/publicare')
    const rute = await import('../src/content/rute')
    return { publicare, rute }
  }

  afterEach(() => {
    vi.doUnmock(JSON_OPERATOR)
  })

  it('citesteOperatorNumit: numai "true" si "false" sunt raspunsuri; orice altceva lasa fisierul sa decida', () => {
    expect(citesteOperatorNumit('true')).toBe(true)
    expect(citesteOperatorNumit('false')).toBe(false)
    for (const valoare of [undefined, '', 'null', 'da', '1', 'TRUE', ' true']) expect(citesteOperatorNumit(valoare), JSON.stringify(valoare)).toBeNull()
    // Valoarea scrisa de `next.config.ts` e chiar rezultatul lui `operatorNumitInMediu`, ca text
    expect(citesteOperatorNumit(String(operatorNumitInMediu(jsonOperator(OPERATOR_SINTETIC))))).toBe(true)
    expect(citesteOperatorNumit(String(operatorNumitInMediu('{"operator": null}')))).toBe(false)
    expect(citesteOperatorNumit(String(operatorNumitInMediu('')))).toBeNull()
  })

  it('next.config.ts defineste NEXT_PUBLIC_OPERATOR_NUMIT din OPERATOR_JSON, in toate cele trei stari (numit / fara operator / nesetat)', async () => {
    const configCu = async (json: string) => {
      vi.resetModules()
      vi.stubEnv('OPERATOR_JSON', json)
      return (await import('../next.config')).default
    }
    // Felia 73: langa ea, mereu, familia textelor juridice ("see" / "md" / "null"), din operatorul rezolvat
    expect((await configCu(jsonOperator(OPERATOR_SINTETIC))).env).toEqual({ [VARIABILA_OPERATOR_NUMIT]: 'true', [VARIABILA_FAMILIE_JURIDICA]: 'see' })
    expect((await configCu('{"operator": null}')).env).toEqual({ [VARIABILA_OPERATOR_NUMIT]: 'false', [VARIABILA_FAMILIE_JURIDICA]: 'null' })
    // Nesetat: cheia exista oricum ("null"), ca o valoare pusa de altcineva in mediul build-ului sa nu ajunga in pachet;
    // familia vine atunci din fisier (azi fara operator)
    const fisier = await import('../config/operator.json')
    expect((await configCu('')).env).toEqual({
      [VARIABILA_OPERATOR_NUMIT]: 'null',
      [VARIABILA_FAMILIE_JURIDICA]: fisier.default.operator === null ? 'null' : expect.stringMatching(/^(see|md)$/),
    })
  })

  it('next.config.ts: familia "md" pentru un operator din Republica Moldova; o tara fara familie opreste construirea', async () => {
    const configCu = async (json: string) => {
      vi.resetModules()
      vi.stubEnv('OPERATOR_JSON', json)
      return (await import('../next.config')).default
    }
    const moldova: Operator = { ...OPERATOR_SINTETIC, tara: ['Republica', 'Moldova'].join(' ') }
    expect((await configCu(jsonOperator(moldova))).env).toEqual({ [VARIABILA_OPERATOR_NUMIT]: 'true', [VARIABILA_FAMILIE_JURIDICA]: 'md' })
    await expect(configCu(jsonOperator({ ...OPERATOR_SINTETIC, tara: ['Statele', 'Unite'].join(' ') }))).rejects.toThrow(/reprezentant/)
  })

  it('citesteFamilie: "see", "md" si "null" sunt raspunsuri; orice altceva lasa sursele de dinainte sa decida', () => {
    expect(citesteFamilie('see')).toBe('see')
    expect(citesteFamilie('md')).toBe('md')
    expect(citesteFamilie('null')).toBeNull()
    for (const valoare of [undefined, '', 'MD', ' see', 'ro']) expect(citesteFamilie(valoare), JSON.stringify(valoare)).toBeUndefined()
  })

  it('pachetul de browser al unui domeniu md: operator numit, dar nicio pagina /juridic (acelea sunt ale familiei SEE)', async () => {
    vi.stubEnv(VARIABILA_FAMILIE_JURIDICA, 'md')
    const { publicare, rute } = await ruteInBrowser('true')
    expect(publicare.FAMILIE_JURIDICA).toBe('md')
    expect(cai(rute.RUTE).filter((c) => c === '/juridic' || c.startsWith('/juridic/'))).toEqual([])
    // Controlul: aceleasi module, cu familia "see", au cele opt pagini
    vi.stubEnv(VARIABILA_FAMILIE_JURIDICA, 'see')
    const see = await ruteInBrowser('true')
    for (const cale of JURIDICE) expect(cai(see.rute.RUTE), cale).toContain(cale)
  })

  it('martor POZITIV (pachetul de browser): cu "true", fara OPERATOR_JSON si cu fisierul pe null, RUTE are cele opt pagini juridice', async () => {
    const { publicare, rute } = await ruteInBrowser('true')
    expect(publicare.OPERATOR_NUMIT).toBe(true)
    expect(JURIDICE).toHaveLength(8)
    for (const cale of JURIDICE) expect(cai(rute.RUTE), cale).toContain(cale)
    // Controlul: aceleasi module, fara valoare, ar fi ramas pe fisier (null azi), deci proba masoara valoarea, nu fisierul
    const fisier = await import('../config/operator.json')
    const fara = await ruteInBrowser(undefined)
    expect(fara.publicare.OPERATOR_NUMIT).toBe(fisier.default.operator !== null)
  })

  it('martor NEGATIV al inversului: cu "false" si un operator in fisier, RUTE nu are nicio pagina juridica', async () => {
    const { publicare, rute } = await ruteInBrowser('false', OPERATOR_DIN_FISIER)
    expect(publicare.OPERATOR_NUMIT).toBe(false)
    expect(cai(rute.RUTE).filter((c) => c === '/juridic' || c.startsWith('/juridic/'))).toEqual([])
    // Controlul: fara valoare, acelasi fisier ar fi publicat cele opt (fisierul chiar numeste un operator in aceasta proba)
    const fara = await ruteInBrowser(undefined, OPERATOR_DIN_FISIER)
    expect(fara.publicare.OPERATOR_NUMIT).toBe(true)
    for (const cale of JURIDICE) expect(cai(fara.rute.RUTE), cale).toContain(cale)
  })

  it('martor NEGATIV: o valoare care nu e "true" sau "false" ("null", goala, gunoi) lasa fisierul sa decida, ca inainte', async () => {
    const fisier = await import('../config/operator.json')
    for (const valoare of ['null', '', 'da', '1']) {
      const { publicare } = await ruteInBrowser(valoare)
      expect(publicare.OPERATOR_NUMIT, JSON.stringify(valoare)).toBe(fisier.default.operator !== null)
    }
  })

  it('pe server, valoarea calculata si citirea directa a variabilei dau acelasi raspuns (nu exista doua adevaruri)', async () => {
    vi.resetModules()
    vi.stubEnv('OPERATOR_JSON', jsonOperator(OPERATOR_SINTETIC))
    vi.stubEnv(VARIABILA_OPERATOR_NUMIT, String(operatorNumitInMediu(jsonOperator(OPERATOR_SINTETIC))))
    const { OPERATOR_NUMIT } = await import('../src/content/juridic/publicare')
    expect(OPERATOR_NUMIT).toBe(true)
    vi.resetModules()
    vi.stubEnv('OPERATOR_JSON', jsonOperator(null))
    vi.stubEnv(VARIABILA_OPERATOR_NUMIT, String(operatorNumitInMediu(jsonOperator(null))))
    expect((await import('../src/content/juridic/publicare')).OPERATOR_NUMIT).toBe(false)
  })

  it('sursa: publicare.ts citeste valoarea prin expresia LITERALA process.env.NEXT_PUBLIC_OPERATOR_NUMIT, singura pe care Next o inlocuieste in pachetul de browser', () => {
    // Fara comentarii: expresia trebuie sa fie in cod, nu numai pomenita
    const faraComentarii = (text: string) => text.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '')
    const expresie = 'process.env.' + VARIABILA_OPERATOR_NUMIT
    const cod = faraComentarii(readFileSync(join(__dirname, '..', 'src', 'content', 'juridic', 'publicare.ts'), 'utf8'))
    expect(cod).toContain(expresie)
    // Felia 73: familia textelor juridice, acelasi tipar
    expect(cod).toContain('process.env.' + VARIABILA_FAMILIE_JURIDICA)
    // O citire dinamica (`process.env[nume]`) ar ramane nedefinita in browser, fara nicio eroare
    expect(cod).not.toMatch(/process\.env\s*\[/)
    // Martorii curatarii: expresia din cod ramane, cea pomenita doar intr-un comentariu dispare
    expect(faraComentarii('const v = ' + expresie + ' // nota')).toContain(expresie)
    expect(faraComentarii(['// ' + expresie, 'const v = 1', '/* ' + expresie + ' */'].join('\n'))).not.toContain(expresie)
  })
})
