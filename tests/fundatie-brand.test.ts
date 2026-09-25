import { createHash } from 'node:crypto'
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { RAPORT_SIGLA } from '../src/components/global/SiglaMarca'
import { BRAND, adresaMarcii, postaMarcii } from '../src/content/entitate'
import { SUBSOL } from '../src/content/navigatie'

/**
 * Marca pe site (felia 43, plan S4 §7): doar brandul - numele, sigla, adresa de e-mail CONFIRMATA -
 * si nicio data de firma. Sursa unica e `config/brand.json`.
 *
 * ADRESA. Pe 24.09 pagina afisa o adresa care nu primea posta (domeniul ei nu are inregistrare
 * MX, masurat). Acum adresa lipseste pana o confirma owner-ul. Proba o dovedeste pe doua COPII ale
 * configurarii, injectate la rulare, fiecare cu starea ei: adresa goala (nicio adresa, niciun
 * `mailto:`) si o adresa sintetica (apare in intrebari si in subsol). Niciuna nu citeste adresa de
 * pe disc: gestul corect al owner-ului, o adresa confirmata in `config/brand.json`, nu are voie sa
 * inroseasca proba (critic, runda 1: cu o adresa pusa, 3 din 76 de probe picau). Controlul
 * injectiei e citit din modulul incarcat, nu presupus. Pe site-ul construit, in
 * tests/browser/fundatie-antet-intreg.spec.ts, pagina reala arata exact ce cere configurarea, iar
 * copia arata adresa sintetica.
 *
 * OPERATORUL. `config/operator.json` e comutatorul din planul valului (§10): `null` pana la
 * infiintarea firmei, iar in ziua operatorului un obiect cu campurile din `_forma`. Proba ii
 * verifica FORMA, nu starea: si `null`, si un operator numit trec.
 *
 * SIGLA. Forma compacta (iconita + ADRIA) trebuie sa fie DECUPATA din fisierul oficial, nu
 * redesenata: fiecare traseu al ei se cauta, caracter cu caracter, in fisierul oficial.
 */

const RADACINA = join(__dirname, '..')
const citeste = (cale: string) => readFileSync(join(RADACINA, cale), 'utf8')

/** Adresa sintetica: domeniul `.test` e rezervat (RFC 2606), nu duce nicaieri. */
const SINTETICA = 'posta@marca-3s.test'

/** Orice adresa de posta dintr-un text. Controlul ei: cazul cu adresa sintetica o gaseste. */
const ADRESA = /[\w.+-]+@[\w-]+(?:\.[\w-]+)+/g

/** Urmele unor date de firma: cod fiscal, numar de registru, telefon romanesc, substituentul. */
const URME_DE_FIRMA = [/\bRO\d{6,10}\b/, /\bJ\d{2}\/\d+\/\d{4}\b/, /(?:\+40|\b0)\s?7\d{2}[\s.]?\d{3}[\s.]?\d{3}\b/, /de completat/i]

/** Titlurile coloanelor de legaturi ale subsolului, in ordine. */
const coloane = (subsol: string) => [...subsol.matchAll(/<h2[^>]*>([^<]+)<\/h2>/g)].map((m) => m[1])

/**
 * Ce nu se potriveste cu forma comutatorului operatorului: cheia `operator` e `null` sau un obiect
 * numai cu campuri din `_forma`. Lista goala = forma buna. Un camp necunoscut e o greseala de tastare
 * sau un camp nedocumentat; poarta juridica (L-01) citeste numai campurile ei.
 */
function abateriOperator(cfg: Record<string, unknown>): string[] {
  const forma = cfg._forma
  if (typeof forma !== 'object' || forma === null || Array.isArray(forma)) return ['lipseste _forma']
  if (!('operator' in cfg)) return ['lipseste cheia operator']
  const operator = cfg.operator
  if (operator === null) return []
  if (typeof operator !== 'object' || Array.isArray(operator)) {
    return ['operator trebuie sa fie null sau un obiect, nu ' + (Array.isArray(operator) ? 'o lista' : typeof operator)]
  }
  return Object.keys(operator).filter((k) => !(k in forma)).map((k) => 'camp necunoscut: ' + k)
}

/** Randeaza startul si subsolul cu o configurare de marca data (null = cea de pe disc). */
async function randeaza(email: string | null) {
  vi.resetModules()
  if (email !== null) {
    const brand = JSON.parse(citeste('config/brand.json')) as Record<string, unknown>
    vi.doMock('../config/brand.json', () => ({ default: { ...brand, email } }))
  }
  const marca = await import('../src/content/entitate')
  const { INTREBARI } = await import('../src/content/acasa')
  const Acasa = (await import('../src/app/page')).default
  const Subsol = (await import('../src/components/global/Subsol')).default
  const nav = await import('../src/content/navigatie')
  const { CAI_EXISTENTE } = await import('../src/content/cai')
  const legaturiPosta = nav.SUBSOL.coloane.flatMap((c) => c.legaturi).filter((l) => l.href?.startsWith('mailto:'))
  return {
    email: marca.BRAND.email,
    coloaneAsteptate: nav.SUBSOL.coloane
      .filter((c) => nav.vizibile(c.legaturi, CAI_EXISTENTE).length > 0)
      .map((c) => c.titlu),
    legaturaPosta: legaturiPosta.some((l) => nav.seVede(l, CAI_EXISTENTE)),
    intrebari: INTREBARI,
    acasa: renderToStaticMarkup(createElement(Acasa)),
    subsol: renderToStaticMarkup(createElement(Subsol)),
  }
}

afterEach(() => {
  vi.doUnmock('../config/brand.json')
  vi.resetModules()
})

describe('config/brand.json', () => {
  it('are numai numele, sigla si adresa: nicio data de firma', () => {
    const cfg = JSON.parse(citeste('config/brand.json')) as Record<string, unknown>
    expect(Object.keys(cfg).filter((k) => !k.startsWith('_')).sort()).toEqual(['email', 'nume', 'sigla'])
    expect(existsSync(join(RADACINA, 'config', 'entitate.ro.json'))).toBe(false)
  })

  it('numele marcii e cel din randul de drepturi al subsolului', () => {
    expect(BRAND.nume).toBe(SUBSOL.copyright.detinator)
  })

  it('fisierele siglei numite in configurare exista in public/', () => {
    for (const cale of Object.values(BRAND.sigla)) {
      expect(existsSync(join(RADACINA, 'public', cale)), cale).toBe(true)
    }
  })
})

describe('config/operator.json, comutatorul operatorului (plan §9-§10)', () => {
  const cfg = JSON.parse(citeste('config/operator.json')) as Record<string, unknown>
  const forma = cfg._forma as Record<string, unknown>

  it('are forma comutatorului: operator null sau obiectul cu campurile din _forma', () => {
    expect(abateriOperator(cfg)).toEqual([])
  })

  it('martor NEGATIV: null si un operator sintetic numit, cu toate campurile, au forma buna', () => {
    const numit = Object.fromEntries(Object.keys(forma).map((k) => [k, 'valoare sintetica']))
    // Controlul fixturii: operatorul numit chiar are campuri, altfel ar trece ca obiect gol.
    expect(Object.keys(numit).length).toBeGreaterThan(0)
    expect(abateriOperator({ ...cfg, operator: null })).toEqual([])
    expect(abateriOperator({ ...cfg, operator: numit })).toEqual([])
  })

  it('martor POZITIV: text, lista, camp necunoscut si cheie lipsa sunt raportate', () => {
    expect(abateriOperator({ ...cfg, operator: 'ADRIA' })).toHaveLength(1)
    expect(abateriOperator({ ...cfg, operator: ['ADRIA'] })).toHaveLength(1)
    expect(abateriOperator({ ...cfg, operator: { denumire: 'x', cui: 'y' } })).toEqual(['camp necunoscut: cui'])
    expect(abateriOperator({ _forma: forma })).toEqual(['lipseste cheia operator'])
  })
})

describe('adresa marcii', () => {
  it('goala: nicio adresa, iar legatura de posta e o destinatie nedecisa', () => {
    expect(adresaMarcii('')).toBeNull()
    expect(adresaMarcii('   ')).toBeNull()
    expect(postaMarcii('')).toEqual({ text: '', href: null, ruta: null })
  })

  it('confirmata: devine legatura mailto', () => {
    expect(postaMarcii(SINTETICA)).toEqual({ text: SINTETICA, href: 'mailto:' + SINTETICA, ruta: null })
  })

  it('martor POZITIV: o valoare care nu e adresa opreste construirea, nu ajunge pe pagina', () => {
    expect(() => adresaMarcii('de completat')).toThrow(/config\/brand\.json/)
    expect(() => adresaMarcii('contact@')).toThrow(/config\/brand\.json/)
  })
})

describe('startul si subsolul, pe o copie a configurarii cu adresa GOALA', () => {
  it('martor NEGATIV: nicio adresa, niciun mailto si nicio urma de firma', async () => {
    const r = await randeaza('')
    // Controlul: injectia a aterizat. Cat timp adresa de pe disc e tot goala, controlul nu deosebeste
    // injectia de disc; in ziua in care owner-ul confirma una, fara injectie proba ar citi adresa lui
    // si ar pica pe lucrul corect.
    expect(r.email).toBe('')
    for (const [unde, html] of [['start', r.acasa], ['subsol', r.subsol]] as const) {
      expect(html.match(ADRESA) ?? [], unde).toEqual([])
      expect(html, unde).not.toContain('mailto:')
      for (const urma of URME_DE_FIRMA) expect(html, unde + ' ' + urma).not.toMatch(urma)
    }
    // Randul de sub intrebari exista, dar fara adresa si fara sa trimita spre un canal.
    expect(r.intrebari.subsol.posta.href).toBeNull()
    expect(r.acasa).toContain(r.intrebari.subsol.inainte)
    expect(r.intrebari.subsol.inainte).not.toMatch(/scrie|trimite|primim|contact/i)
    // Fara adresa, legatura "Ajutor prin e-mail" nu se arata, deci coloana ei ramane doar daca are
    // alta legatura vizibila. Asteptarea se deriva din datele modulului REIMPORTAT cu injectia
    // (25.09): constanta de la S4-1, ['Resurse'], picase pe fiecare felie S4-3 cu rute noi.
    expect(coloane(r.subsol)).toEqual(r.coloaneAsteptate)
    expect(r.legaturaPosta).toBe(false)
  })
})

describe('sigla in subsol', () => {
  it('e decorativa si marcata ca atare: alt gol plus role="presentation", pe ambele variante', async () => {
    const { subsol } = await randeaza(null)
    const imagini = subsol.match(/<img\b[^>]*data-sigla="[^"]+"[^>]*>/g) ?? []
    // Varianta pentru fundal deschis si cea pentru fundal inchis.
    expect(imagini).toHaveLength(2)
    for (const img of imagini) {
      expect(img).toContain('alt=""')
      expect(img).toContain('role="presentation"')
    }
  })
})

describe('startul si subsolul, pe o copie a configurarii cu adresa sintetica', () => {
  it('martor POZITIV: adresa apare in intrebari si in subsol, ca legatura', async () => {
    const r = await randeaza(SINTETICA)
    // Controlul: injectia a aterizat in modulul pe care il citesc componentele.
    expect(r.email).toBe(SINTETICA)
    const legaturi = (html: string) => html.split('href="mailto:' + SINTETICA + '"').length - 1
    const afisari = (html: string) => html.split('>' + SINTETICA + '<').length - 1
    // Intrebarile: randul cu adresa, o legatura. Subsolul: randul din brand, "Ajutor" si iconita.
    expect([legaturi(r.acasa), afisari(r.acasa)]).toEqual([1, 1])
    expect([legaturi(r.subsol), afisari(r.subsol)]).toEqual([3, 1])
    expect(r.acasa).toContain(r.intrebari.subsol.inainte)
    expect(r.intrebari.subsol.inainte).not.toBe('')
    // Cu adresa, "Ajutor prin e-mail" are destinatie, deci coloana "Companie" revine oricare ar fi
    // celelalte rute existente.
    expect(r.legaturaPosta).toBe(true)
    expect(coloane(r.subsol)).toEqual(r.coloaneAsteptate)
    expect(coloane(r.subsol)).toContain('Companie')
  })
})

describe('sigla compacta: decupata din fisierul oficial, nu redesenata', () => {
  const oficial = citeste('public/brand/sigla-3s.svg')
  const compacta = citeste('public/brand/sigla-3s-compacta.svg')
  const trasee = compacta.match(/<path\b[^>]*\/>/g) ?? []

  it('fisierul oficial e cel inregistrat, cu amprenta scrisa in docs/design/ACTIVE.md', () => {
    const scrisa = /sha256 `([0-9a-f]{64})`/.exec(citeste('docs/design/ACTIVE.md'))?.[1]
    expect(scrisa).toBeTruthy()
    const amprenta = createHash('sha256').update(readFileSync(join(RADACINA, 'public/brand/sigla-3s.svg'))).digest('hex')
    expect(amprenta).toBe(scrisa)
  })

  it('iconita (7 trasee) si ADRIA (5 litere) sunt copiate neschimbate din fisierul oficial', () => {
    expect(trasee).toHaveLength(12)
    for (const t of trasee) expect(oficial.includes(t), t.slice(0, 80)).toBe(true)
    expect(trasee.slice(7).every((t) => t.includes('fill="#226699"'))).toBe(true)
  })

  it('martor POZITIV: un traseu cu o singura cifra schimbata nu mai e gasit in fisierul oficial', () => {
    const primul = trasee[0] ?? ''
    expect(primul).not.toBe('')
    const retusat = primul.replace(/(\d)(\D*)$/, (_, c: string, rest: string) => String((Number(c) + 1) % 10) + rest)
    expect(retusat).not.toBe(primul)
    expect(oficial.includes(retusat)).toBe(false)
  })

  it('raportul folosit la randare e cel din viewBox-ul fiecarui fisier', () => {
    const viewBox = (cale: string) => /viewBox="([^"]+)"/.exec(citeste(cale))![1].split(/\s+/).map(Number)
    for (const [forma, cale] of [
      ['completa', 'public/brand/sigla-3s.svg'],
      ['compacta', 'public/brand/sigla-3s-compacta.svg'],
    ] as const) {
      const [, , l, i] = viewBox(cale)
      expect(RAPORT_SIGLA[forma], forma).toBeCloseTo(l / i, 4)
    }
  })
})
