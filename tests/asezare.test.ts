import { spawnSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { ECHIVALENTE } from '../src/content/echivalente'
import type { Ruta } from '../src/content/rute'
import {
  ASEZARI,
  FISIERE_DOMENIU,
  RUTE_GRUP,
  asezareBuild,
  asezareDinText,
  atributeLimba,
  caServita,
  caSursa,
  caleServita,
  caleSursa,
  perechiAsezare,
  prefixServit,
  problemeAsezare,
  redirectariAsezare,
  type CodAsezare,
} from '../src/lib/asezare'
import { EDITII } from '../src/lib/editii'

// ASEZAREA (`src/lib/asezare.ts`): catalogul inchis `md` / `ro`, cele doua tipuri de cale si traducerea lor, garda
// din `next.config.ts` si fisierul de perechi pentru proba de identitate. Rutele sunt cele ale build-ului 3s.md,
// incarcate cu mediul din `config/profil-3s-md.json` (nu o lista scrisa aici, ca proba sa urmeze site-ul).

const PROFIL_3S_MD = JSON.parse(readFileSync(join(__dirname, '..', 'config', 'profil-3s-md.json'), 'utf8')) as Record<string, unknown>
const textProfil = (p: Record<string, unknown>, k: string) => (typeof p[k] === 'string' ? (p[k] as string) : JSON.stringify(p[k]))

let RUTE_3S_MD: Ruta[] = []

beforeAll(async () => {
  vi.stubEnv('SITE_EDITII', textProfil(PROFIL_3S_MD, 'SITE_EDITII'))
  vi.stubEnv('OPERATOR_JSON', textProfil(PROFIL_3S_MD, 'OPERATOR_JSON'))
  vi.stubEnv('NEXT_PUBLIC_SITE_EDITII', '')
  vi.stubEnv('NEXT_PUBLIC_OPERATOR_NUMIT', '')
  vi.stubEnv('NEXT_PUBLIC_FAMILIE_JURIDICA', '')
  vi.resetModules()
  RUTE_3S_MD = (await import('../src/content/rute')).RUTE
  vi.unstubAllEnvs()
  vi.resetModules()
  console.info('asezare: ' + RUTE_3S_MD.length + ' rute pe profilul 3s.md')
})

// Tabelul asteptat pe asezarea `ro`, scris de mana (nu calculat cu regula pe care o masoara), pe toate caile din
// `src/content/echivalente.ts`: engleza sub `/en`, romana la radacina.
const ASTEPTAT_RO: Readonly<Record<string, string>> = {
  '/': '/en',
  '/ro': '/',
  '/contact': '/en/contact',
  '/ro/contact': '/contact',
  '/platform': '/en/platform',
  '/ro/platforma': '/platforma',
  '/features/search': '/en/features/search',
  '/ro/functionalitati/cautare-ai': '/functionalitati/cautare-ai',
  '/pricing': '/en/pricing',
  '/ro/preturi': '/preturi',
  '/enterprise': '/en/enterprise',
  '/ro/enterprise': '/enterprise',
  '/about': '/en/about',
  '/ro/securitate': '/securitate',
  '/guides/e-invoice-archiving-eu': '/en/guides/e-invoice-archiving-eu',
  '/ro/ghiduri/arhivare-e-facturi-ue': '/ghiduri/arhivare-e-facturi-ue',
  '/guides/records-retention-moldova': '/en/guides/records-retention-moldova',
  '/ro/ghiduri/termene-pastrare-moldova': '/ghiduri/termene-pastrare-moldova',
  '/compare/3s-vs-google-drive': '/en/compare/3s-vs-google-drive',
  '/ro/comparatie-drive': '/comparatie-drive',
  '/legal/legal-information': '/en/legal/legal-information',
  '/ro/juridic/informatii-legale': '/juridic/informatii-legale',
  '/legal/privacy': '/en/legal/privacy',
  '/ro/juridic/confidentialitate': '/juridic/confidentialitate',
  '/legal/cookies': '/en/legal/cookies',
  '/ro/juridic/cookies': '/juridic/cookies',
  '/legal/terms': '/en/legal/terms',
  '/ro/juridic/termeni': '/juridic/termeni',
  '/legal/notice-and-action': '/en/legal/notice-and-action',
  '/ro/juridic/notificare-si-actiune': '/juridic/notificare-si-actiune',
  '/legal/ai-notice': '/en/legal/ai-notice',
  '/ro/juridic/inteligenta-artificiala': '/juridic/inteligenta-artificiala',
  '/legal': '/en/legal',
  '/ro/juridic': '/juridic',
}

describe('catalogul asezarii', () => {
  it('md e chiar catalogul editiilor (prefix si atribute de limba), deci pe md nu se schimba nimic', () => {
    for (const ed of ['en', 'ro-MD'] as const) {
      const { prefix, lang, ogLocale, inLanguage } = EDITII[ed]
      expect(ASEZARI.md[ed]).toEqual({ prefix, lang, ogLocale, inLanguage })
    }
  })

  it('ro: romana la radacina cu atributele ro-RO, engleza sub /en', () => {
    expect(ASEZARI.ro['ro-MD']).toEqual({ prefix: '', lang: 'ro', ogLocale: 'ro_RO', inLanguage: 'ro-RO' })
    expect(ASEZARI.ro.en).toEqual({ prefix: '/en', lang: 'en', ogLocale: 'en_US', inLanguage: 'en' })
    expect(prefixServit('ro-MD', 'ro')).toBe('')
    expect(prefixServit('en', 'ro')).toBe('/en')
    expect(prefixServit('ro-MD', 'md')).toBe('/ro')
    expect(atributeLimba('ro-MD', 'ro')).toEqual({ lang: 'ro', ogLocale: 'ro_RO', inLanguage: 'ro-RO' })
    expect(atributeLimba('ro-MD', 'md')).toEqual({ lang: 'ro', ogLocale: 'ro_MD', inLanguage: 'ro-MD' })
  })

  it('valorile admise sunt numai md si ro; gol = md; orice altceva opreste, cu numele variabilei', () => {
    expect(asezareDinText(undefined)).toBe('md')
    expect(asezareDinText('  ')).toBe('md')
    expect(asezareDinText('ro')).toBe('ro')
    expect(asezareDinText(' md ')).toBe('md')
    expect(() => asezareDinText('com-ro')).toThrow(/SITE_ASEZARE: asezarea "com-ro" nu exista/)
    expect(() => asezareDinText('en')).toThrow(/asezarile sunt md, ro/)
  })

  it('asezareBuild: valoarea publica (pusa de next.config.ts) inaintea celei de server', () => {
    vi.stubEnv('SITE_ASEZARE', 'ro')
    vi.stubEnv('NEXT_PUBLIC_SITE_ASEZARE', '')
    expect(asezareBuild()).toBe('ro')
    vi.stubEnv('NEXT_PUBLIC_SITE_ASEZARE', 'md')
    expect(asezareBuild()).toBe('md')
    vi.stubEnv('NEXT_PUBLIC_SITE_ASEZARE', 'x')
    expect(() => asezareBuild()).toThrow(/NEXT_PUBLIC_SITE_ASEZARE/)
    vi.unstubAllEnvs()
  })

  it('coerenta cu editiile: ro cere exact en,ro-MD; md nu cere nimic', () => {
    expect(problemeAsezare('ro', ['en', 'ro-MD'])).toEqual([])
    expect(problemeAsezare('ro', ['ro-RO'])).toHaveLength(1)
    expect(problemeAsezare('ro', ['en'])[0]).toContain('cere SITE_EDITII exact en,ro-MD')
    expect(problemeAsezare('md', ['ro-RO'])).toEqual([])
    expect(problemeAsezare('md', ['en', 'ro-MD'])).toEqual([])
  })

  // Adresa comparatiei EN s-a mutat (pagina compara numai Google Drive): vechea adresa duce permanent la cea noua, pe
  // ambele asezari, la prefixul servit al englezei. Pe site-ul romanesc vechi (`ro-RO`) nu exista engleza, deci nimic.
  const VECHE = '/compare/3s-vs-google-and-box'
  const NOUA = '/compare/3s-vs-google-drive'
  it('redirectarile: pe ro vechile adrese /ro duc la radacina si adresa mutata a englezei sub /en, permanent', () => {
    expect(redirectariAsezare('ro', ['en', 'ro-MD'])).toEqual([
      { source: '/ro', destination: '/', permanent: true },
      { source: '/ro/:cale*', destination: '/:cale*', permanent: true },
      { source: '/en' + VECHE, destination: '/en' + NOUA, permanent: true },
    ])
  })

  it('redirectarile: pe md (3s.md) numai adresa mutata, la radacina; pe ro-RO niciuna', () => {
    expect(redirectariAsezare('md', ['en', 'ro-MD'])).toEqual([{ source: VECHE, destination: NOUA, permanent: true }])
    expect(redirectariAsezare('md', ['ro-RO'])).toEqual([])
  })

  it('adresa mutata: tinta e ruta a englezei (si pereche in echivalente), sursa nu mai e ruta nicaieri', () => {
    const cai = new Set(RUTE_3S_MD.map((r) => r.cale))
    expect(cai.has(NOUA)).toBe(true)
    expect(cai.has(VECHE)).toBe(false)
    expect(Object.values(ECHIVALENTE).some((e) => e.en === NOUA)).toBe(true)
    expect(Object.values(ECHIVALENTE).some((e) => e.en === VECHE)).toBe(false)
  })
})

describe('caleServita si caleSursa pe rutele 3s.md', () => {
  it('martor: rutele 3s.md sunt incarcate, cu paginile juridice (fiecare cale din echivalente e ruta)', () => {
    const cai = new Set(RUTE_3S_MD.map((r) => r.cale))
    // Martorul incarcarii: fiecare ruta 3s.md are pereche in echivalente (decizia 59 + indexul juridic), deci
    // rutele fara pereche sunt ZERO, iar tabelul are exact cate o intrare pe ruta. Inainte controlul cerea mai
    // multe rute decat intrari in tabel (exista rute fara pereche); cu perechea /legal - /ro/juridic diferenta a
    // ajuns la zero, iar `>=` ar fi slabit proba. Numararea de mai jos prinde si o ruta noua fara pereche, si o
    // lista de rute neincarcata (goala, deci fara egalitate de lungime).
    const cuPereche = new Set(Object.values(ECHIVALENTE).flatMap((p) => Object.values(p)))
    expect(RUTE_3S_MD.filter((r) => !cuPereche.has(r.cale)).map((r) => r.cale)).toEqual([])
    expect(RUTE_3S_MD.length).toBe(Object.keys(ASTEPTAT_RO).length)
    for (const pereche of Object.values(ECHIVALENTE)) {
      for (const cale of Object.values(pereche)) expect(cai.has(cale), cale).toBe(true)
    }
    expect(new Set(Object.keys(ASTEPTAT_RO))).toEqual(new Set(Object.values(ECHIVALENTE).flatMap((p) => Object.values(p))))
  })

  it('pe md: identitatea pe fiecare ruta, si inversa la fel', () => {
    let n = 0
    for (const r of RUTE_3S_MD) {
      expect(caleServita(caSursa(r.cale), RUTE_3S_MD, 'md')).toBe(r.cale)
      expect(caleSursa(caServita(r.cale), RUTE_3S_MD, 'md')).toBe(r.cale)
      n++
    }
    expect(n).toBe(RUTE_3S_MD.length)
  })

  it('pe ro: tabelul asteptat, scris din echivalente', () => {
    for (const [sursa, servita] of Object.entries(ASTEPTAT_RO)) {
      expect(caleServita(caSursa(sursa), RUTE_3S_MD, 'ro'), sursa).toBe(servita)
    }
  })

  it('pe ro: fiecare ruta se muta (engleza sub /en, romana fara /ro), iar inversa o aduce inapoi exact, pe ambele asezari', () => {
    const servite = new Set<string>()
    for (const r of RUTE_3S_MD) {
      const s = caleServita(caSursa(r.cale), RUTE_3S_MD, 'ro')
      if (r.editie === 'en') expect(s === '/en' || s.startsWith('/en/'), r.cale + ' -> ' + s).toBe(true)
      else expect(s === '/ro' || s.startsWith('/ro/'), r.cale + ' -> ' + s).toBe(false)
      servite.add(s)
      for (const asezare of ['md', 'ro'] as CodAsezare[]) {
        expect(caleSursa(caleServita(caSursa(r.cale), RUTE_3S_MD, asezare), RUTE_3S_MD, asezare)).toBe(r.cale)
      }
    }
    expect(servite.size).toBe(RUTE_3S_MD.length)
  })

  it('caile care nu sunt rute raman neschimbate pe ro (imagini, analitica, fisiere statice, ancora singura)', () => {
    for (const cale of ['/opengraph-image', '/a/script.js', '#ancora', '/_next/static/x.js', '/sitemap.xml', '/ro/juridic/dpa']) {
      expect(caleServita(caSursa(cale), RUTE_3S_MD, 'ro'), cale).toBe(cale)
      expect(caleSursa(caServita(cale), RUTE_3S_MD, 'ro'), cale).toBe(cale)
    }
  })

  it('fragmentul si interogarea se pastreaza, in ambele directii', () => {
    expect(caleServita(caSursa('/about#limits'), RUTE_3S_MD, 'ro')).toBe('/en/about#limits')
    expect(caleServita(caSursa('/pricing?plan=starter#x'), RUTE_3S_MD, 'ro')).toBe('/en/pricing?plan=starter#x')
    expect(caleServita(caSursa('/ro/contact#whatsapp'), RUTE_3S_MD, 'ro')).toBe('/contact#whatsapp')
    expect(caleServita(caSursa('/#cum-functioneaza'), RUTE_3S_MD, 'ro')).toBe('/en#cum-functioneaza')
    expect(caleSursa(caServita('/contact#whatsapp'), RUTE_3S_MD, 'ro')).toBe('/ro/contact#whatsapp')
    expect(caleSursa(caServita('/en/about#limits'), RUTE_3S_MD, 'ro')).toBe('/about#limits')
  })

  it('in browser, calea citita din bara de adrese se aduce la sursa (/contact e romana, /en/contact e engleza)', () => {
    expect(caleSursa(caServita('/contact'), RUTE_3S_MD, 'ro')).toBe('/ro/contact')
    expect(caleSursa(caServita('/en/contact'), RUTE_3S_MD, 'ro')).toBe('/contact')
    expect(caleSursa(caServita('/'), RUTE_3S_MD, 'ro')).toBe('/ro')
    expect(caleSursa(caServita('/en'), RUTE_3S_MD, 'ro')).toBe('/')
  })

  it('garda: pe ro, o cale /en intrata in caleServita e o traducere de doua ori si arunca; pe md nu e nimic special', () => {
    for (const cale of ['/en/pricing', '/en', '/en#sus', '/en?x=1']) {
      expect(() => caleServita(caSursa(cale), RUTE_3S_MD, 'ro'), cale).toThrow(/e deja o cale servita/)
    }
    expect(caleServita(caSursa('/en/pricing'), RUTE_3S_MD, 'md')).toBe('/en/pricing')
    // `/english` nu e sub prefixul /en: nu e prinsa de garda
    expect(caleServita(caSursa('/english'), RUTE_3S_MD, 'ro')).toBe('/english')
  })

  it('compilarea refuza o cale servita (si un sir nemarcat) acolo unde se cere una sursa', () => {
    const traduce = () => {
      // @ts-expect-error - o cale SERVITA nu se traduce a doua oara (daca tipul n-o mai refuza, tsc cade pe directiva nefolosita)
      caleServita(caServita('/contact'), RUTE_3S_MD, 'ro')
      // @ts-expect-error - un sir nemarcat nu spune ce fel de cale e
      caleServita('/contact', RUTE_3S_MD, 'ro')
      // @ts-expect-error - si invers: caleSursa nu primeste o cale sursa
      caleSursa(caSursa('/ro/contact'), RUTE_3S_MD, 'ro')
    }
    expect(typeof traduce).toBe('function')
  })

  it('martor POZITIV al bijectiei: doua rute servite la aceeasi adresa opresc traducerea; o ruta ro-RO nu se aseaza', () => {
    // o ruta ro-MD fara prefixul editiei e refuzata
    expect(() => caleServita(caSursa('/x'), [{ cale: '/x', editie: 'ro-MD' as const }], 'ro')).toThrow(/nu incepe cu prefixul editiei \/ro/)
    // ro-MD `/ro/en/x` -> `/en/x`, iar en `/x` -> `/en/x`: aceeasi adresa servita
    const ciocnire = [
      { cale: '/ro/en/x', editie: 'ro-MD' as const },
      { cale: '/x', editie: 'en' as const },
    ]
    expect(() => caleServita(caSursa('/x'), ciocnire, 'ro')).toThrow(/ar fi servite amandoua la \/en\/x/)
    expect(() => caleServita(caSursa('/preturi'), [{ cale: '/preturi' }], 'ro')).toThrow(/site-ului romanesc vechi/)
    expect(caleServita(caSursa('/preturi'), [{ cale: '/preturi' }], 'md')).toBe('/preturi')
  })
})

describe('perechile pentru proba de identitate', () => {
  it('fiecare ruta, fiecare ruta de grup si fiecare fisier al domeniului, o singura data pe fiecare parte', () => {
    const p = perechiAsezare(RUTE_3S_MD)
    expect(p).toHaveLength(RUTE_3S_MD.length + RUTE_GRUP.en.length + RUTE_GRUP['ro-MD'].length + FISIERE_DOMENIU.length)
    expect(new Set(p.map((x) => x.a)).size).toBe(p.length)
    expect(new Set(p.map((x) => x.b)).size).toBe(p.length)
    for (const [sursa, servita] of Object.entries(ASTEPTAT_RO)) expect(p).toContainEqual({ a: sursa, b: servita })
    expect(p).toContainEqual({ a: '/opengraph-image', b: '/en/opengraph-image' })
    expect(p).toContainEqual({ a: '/robots.txt', b: '/robots.txt' })
    // `comune` intra ca perechi identice, o singura data
    const cuComune = perechiAsezare(RUTE_3S_MD, 'md', 'ro', ['/proba-comuna.ico'])
    expect(cuComune).toHaveLength(p.length + 1)
    expect(cuComune).toContainEqual({ a: '/proba-comuna.ico', b: '/proba-comuna.ico' })
    // md -> md: identitatea pe toate
    for (const x of perechiAsezare(RUTE_3S_MD, 'md', 'md')) expect(x.b).toBe(x.a)
  })
})

describe('next.config.ts cu SITE_ASEZARE', () => {
  const salvat = { ...process.env }
  afterEach(() => {
    for (const k of Object.keys(process.env)) if (!(k in salvat)) delete process.env[k]
    Object.assign(process.env, salvat)
    vi.resetModules()
  })

  type Configurare = { env?: Record<string, string>; redirects?: () => Promise<unknown>; pageExtensions?: string[] }
  const configurare = async (mediu: Record<string, string | undefined>) => {
    for (const k of ['SITE_EDITII', 'NEXT_PUBLIC_SITE_EDITII', 'SITE_URL', 'SITE_ALTERNATE', 'OPERATOR_JSON', 'SITE_ASEZARE', 'NEXT_PUBLIC_SITE_ASEZARE']) delete process.env[k]
    for (const [k, v] of Object.entries(mediu)) if (v !== undefined) process.env[k] = v
    vi.resetModules()
    return (await import('../next.config')).default as Configurare
  }
  const PROFIL_MD = {
    SITE_EDITII: textProfil(PROFIL_3S_MD, 'SITE_EDITII'),
    SITE_URL: textProfil(PROFIL_3S_MD, 'SITE_URL'),
    SITE_ALTERNATE: textProfil(PROFIL_3S_MD, 'SITE_ALTERNATE'),
  }

  // Pe ro-RO (site-ul romanesc vechi) cheia `redirects` nu exista; pe profilul 3s.md exista numai pentru adresa mutata a
  // englezei (aceeasi pe md implicit si scris), fara cheie publica.
  it('pe md (implicit sau scris) si pe ro-RO: obiectul de configurare are exact cheile de fara asezare si fara cheie publica', async () => {
    for (const baza of [{}, PROFIL_MD]) {
      const fara = await configurare(baza)
      const scris = await configurare({ ...baza, SITE_ASEZARE: 'md' })
      expect(Object.keys(scris)).toEqual(Object.keys(fara))
      expect(scris.env).toEqual(fara.env)
      expect(scris.env !== undefined && 'NEXT_PUBLIC_SITE_ASEZARE' in scris.env).toBe(false)
      if (baza === PROFIL_MD) {
        expect(await scris.redirects?.()).toEqual(redirectariAsezare('md', ['en', 'ro-MD']))
        expect(await fara.redirects?.()).toEqual(redirectariAsezare('md', ['en', 'ro-MD']))
      } else {
        expect('redirects' in scris).toBe(false)
        expect('redirects' in fara).toBe(false)
      }
    }
  })

  it('pe ro cu profilul en,ro-MD: cheia publica si redirectarile permanente /ro', async () => {
    const c = await configurare({ ...PROFIL_MD, SITE_ASEZARE: 'ro' })
    expect(c.env?.NEXT_PUBLIC_SITE_ASEZARE).toBe('ro')
    // Pe ro arborele construit e NUMAI cel geaman (comro): daca ar ramane en.tsx sau romd.tsx, `/` ar exista de doua
    // ori, din (en)/page.en.tsx si din (comro)/page.comro.tsx. Deci lista e exact asta, nu cea a profilului en,ro-MD.
    expect(c.pageExtensions).toEqual(['comro.tsx', 'ts', 'md', 'mdx'])
    expect(await c.redirects?.()).toEqual(redirectariAsezare('ro', ['en', 'ro-MD']))
  })

  it('martor POZITIV: profil gresit (ro cu ro-RO, ro fara SITE_EDITII), valoare necunoscuta si valoare publica pusa de mana opresc construirea', async () => {
    await expect(configurare({ SITE_ASEZARE: 'ro', SITE_EDITII: 'ro-RO' })).rejects.toThrow(/SITE_ASEZARE=ro cere SITE_EDITII exact en,ro-MD/)
    await expect(configurare({ SITE_ASEZARE: 'ro' })).rejects.toThrow(/profilul construit e ro-RO/)
    await expect(configurare({ ...PROFIL_MD, SITE_ASEZARE: 'comro' })).rejects.toThrow(/asezarea "comro" nu exista/)
    await expect(configurare({ ...PROFIL_MD, NEXT_PUBLIC_SITE_ASEZARE: 'ro' })).rejects.toThrow(/nu se seteaza de mana/)
    // martor NEGATIV: egala cu cea calculata, trece
    expect((await configurare({ ...PROFIL_MD, SITE_ASEZARE: 'ro', NEXT_PUBLIC_SITE_ASEZARE: 'ro' })).env?.NEXT_PUBLIC_SITE_ASEZARE).toBe('ro')
  })
})

describe('perechi-asezare.mjs', () => {
  const SCRIPT = join(__dirname, '..', '.claude', 'scripts', 'porti', 'perechi-asezare.mjs')
  const PROFIL_A = join(__dirname, '..', 'config', 'profil-3s-md.json')
  let dir = ''

  beforeAll(() => {
    dir = mkdtempSync(join(tmpdir(), 'perechi-asezare-'))
  })
  afterAll(() => rmSync(dir, { recursive: true, force: true }))

  // Profilul B se fabrica la rulare din profilul 3s.md: alt domeniu, asezarea ro, alte contacte (valori sintetice,
  // derivate, nu numere reale scrise aici).
  type Profil = {
    SITE_URL: string
    SITE_ASEZARE?: string
    OPERATOR_JSON: { operator: { email: string; telefon: string } }
    CANALE_JSON: { telefon: string; whatsapp: string }
  }
  const profilB = (schimba: (p: Profil) => void = () => {}) => {
    const p = JSON.parse(readFileSync(PROFIL_A, 'utf8')) as Profil
    p.SITE_URL = 'https://' + ['domeniu', 'proba', 'test'].join('-') + '.example'
    p.SITE_ASEZARE = 'ro'
    p.OPERATOR_JSON.operator.email = 'contact@' + new URL(p.SITE_URL).host
    p.OPERATOR_JSON.operator.telefon = p.OPERATOR_JSON.operator.telefon.replace(/\d$/, '0')
    p.CANALE_JSON.telefon = p.CANALE_JSON.telefon.replace(/\d$/, '0')
    p.CANALE_JSON.whatsapp = p.CANALE_JSON.whatsapp.replace(/\d$/, '0')
    schimba(p)
    const cale = join(dir, 'profil-b-' + Math.random().toString(36).slice(2) + '.json')
    writeFileSync(cale, JSON.stringify(p), 'utf8')
    return cale
  }
  // Pictogramele din `src/app`, citite aici cu un filtru mai larg decat al scriptului (oracol independent): scriptul
  // trebuie sa le dea pe toate, ca fisiere ale domeniului.
  const PICTOGRAME = readdirSync(join(__dirname, '..', 'src', 'app'))
    .filter((n) => /icon/i.test(n) && /\.[a-z]+$/i.test(n))
    .sort()
    .map((n) => '/' + n)
  const ruleaza = (...argv: string[]) => {
    const r = spawnSync(process.execPath, [SCRIPT, ...argv], { encoding: 'utf8', cwd: join(__dirname, '..') })
    return { cod: r.status, iesire: r.stdout + r.stderr }
  }
  const colectie = (cai: string[]) => {
    const d = join(dir, 'colectie-' + Math.random().toString(36).slice(2))
    mkdirSync(d)
    const pagini = [...cai, '/_not-found', '/inexistenta-proba'].map((cale) => ({ cale }))
    writeFileSync(join(d, 'colectie.json'), JSON.stringify({ format: 1, idBuild: 'x', caleInexistenta: '/inexistenta-proba', pagini }), 'utf8')
    return d
  }

  it('scrie fisierul cu valorile ambelor domenii si perechile din manifestul de rute (aceleasi ca perechiAsezare)', () => {
    const iesire = join(dir, 'perechi.json')
    const r = ruleaza('--profil-a', PROFIL_A, '--profil-b', profilB(), '--iesire', iesire)
    expect(r.cod, r.iesire).toBe(0)
    expect(r.iesire).not.toMatch(/Warning/)
    const f = JSON.parse(readFileSync(iesire, 'utf8'))
    expect(Object.keys(f).sort()).toEqual(['_nota', 'a', 'b', 'perechi'])
    expect(f.a.origine).toBe(textProfil(PROFIL_3S_MD, 'SITE_URL'))
    expect(f.a.limba).toBe('ro-MD')
    expect(f.a.ogLocale).toBe('ro_MD')
    expect(f.b.limba).toBe('ro-RO')
    expect(f.b.ogLocale).toBe('ro_RO')
    expect(f.b.origine).toMatch(/^https:\/\/domeniu-proba-test\.example$/)
    expect(f.b.telefonAfisat).not.toBe(f.a.telefonAfisat)
    // martor: citirea directorului chiar gaseste pictograme (doua dintre ele, numite)
    expect(PICTOGRAME).toEqual(expect.arrayContaining(['/favicon.ico', '/icon.svg']))
    expect(f.perechi).toEqual(perechiAsezare(RUTE_3S_MD, 'md', 'ro', PICTOGRAME))
    for (const cale of PICTOGRAME) expect(f.perechi).toContainEqual({ a: cale, b: cale })
  })

  it('cu colectia: potrivirea exacta trece; o cale in plus sau una lipsa e NEMASURAT, numita', () => {
    const cai = perechiAsezare(RUTE_3S_MD, 'md', 'ro', PICTOGRAME).map((p) => p.a)
    const iesire = join(dir, 'perechi-col.json')
    const b = profilB()
    const bun = ruleaza('--profil-a', PROFIL_A, '--profil-b', b, '--iesire', iesire, '--colectie', colectie(cai))
    expect(bun.cod, bun.iesire).toBe(0)
    expect(bun.iesire).toContain('colectia A: ' + cai.length + ' cai, toate imperecheate')
    const plus = ruleaza('--profil-a', PROFIL_A, '--profil-b', b, '--iesire', iesire, '--colectie', colectie([...cai, '/fisier-nou.txt']))
    expect(plus.cod, plus.iesire).toBe(3)
    expect(plus.iesire).toContain('calea colectiei fara pereche: /fisier-nou.txt')
    const lipsa = ruleaza('--profil-a', PROFIL_A, '--profil-b', b, '--iesire', iesire, '--colectie', colectie(cai.filter((c) => c !== '/stamp')))
    expect(lipsa.cod, lipsa.iesire).toBe(3)
    expect(lipsa.iesire).toContain('pereche fara cale in colectie: /stamp')
  })

  it('martor POZITIV: un profil fara numarul de WhatsApp e NEMASURAT; folosirea gresita iese cu 2', () => {
    const r = ruleaza('--profil-a', PROFIL_A, '--profil-b', profilB((p) => (p.CANALE_JSON.whatsapp = '')), '--iesire', join(dir, 'x.json'))
    expect(r.cod, r.iesire).toBe(3)
    expect(r.iesire).toContain('profilul B: valori goale sau lipsa: whatsapp')
    expect(ruleaza('--profil-a', PROFIL_A).cod).toBe(2)
  })
})
