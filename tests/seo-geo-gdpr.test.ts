import { execFileSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { createElement, type ReactElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { prerenderToNodeStream } from 'react-dom/static'
import { afterEach, describe, expect, it, vi } from 'vitest'
import Acasa from '../src/app/page'
import sitemap from '../src/app/sitemap'
import { CAI_CTA_URMARITE, EVENIMENTE, evenimentValid } from '../src/components/consimtamant/evenimente'
import { prefixRetea, randEvidenta, valideazaEvidenta } from '../src/components/consimtamant/evidenta'
import { CAI_POLITICI, legaturiPolitici } from '../src/components/consimtamant/PunctConsimtamant'
import { domeniiCookie, numeCookieGa } from '../src/components/consimtamant/stare-ga4'
import { CHEIE_ALEGERE, alegereValida } from '../src/components/consimtamant/stocare'
import DateFirAriadnei from '../src/components/seo/DateFirAriadnei'
import { grafAcasa, grafFirAriadnei, grafSite, iduri, serializeaza } from '../src/components/seo/date-structurate'
import {
  ALT_IMAGINE,
  CALE_IMAGINE_CARD,
  CALE_IMAGINE_OG,
  LIMITE_SEO,
  MARIME_IMAGINE,
  TIP_IMAGINE,
  abateriMetadata,
  metadataPagina,
} from '../src/components/seo/metadata'
import { INTREBARI } from '../src/content/acasa'
import { AUTORITATI } from '../src/content/juridic/autoritati'
import { CHEI_ART13, DESCRIERE_EVENIMENTE, inSee } from '../src/content/juridic/confidentialitate'
import { CHEI_L284 } from '../src/content/juridic/cookie-uri'
import { COOKIE_ALEGERE, FURNIZORI, MECANISME_MD, MECANISME_UE } from '../src/content/juridic/furnizori'
import { texteJuridice } from '../src/content/juridic/index'
import { textIntreg, type DocumentJuridic } from '../src/content/juridic/tipuri'
import { CALE_INREGISTRARE, toateLegaturileNavigatiei } from '../src/content/navigatie'
import { RUTE, rutePentruHarta } from '../src/content/rute'
import { VERSIUNE_INFORMARE, amprenta, idGa4, stareAnalitica } from '../src/lib/analitica'
import { dataUltimuluiCommit, istoricComplet, surseleRutei } from '../src/lib/istoric-git'
import { textLlms } from '../src/lib/llms'
import { OPERATOR, citesteOperator, lipsuriInformare, type CampOperator, type Operator } from '../src/lib/operator'
import { linieSemnal, textRobots } from '../src/lib/roboti'
import { adresaSite, urlAbsolut } from '../src/lib/site'
import { citesteDeclaratiile } from './browser/ajutor/raspunsuri'

/**
 * Probele feliei seo-geo-gdpr (planul valului S4, §8 SEO/GEO/GA4, §9 GDPR RO/UE/MD, §10 comutatorul
 * operatorului). Probele de browser - comutatorul pe build, paritatea brut/randat, raspunsul in
 * primele 400 de cuvinte - sunt in tests/browser/comutator.spec.ts si tests/browser/geo.spec.ts.
 *
 * FIXTURILE se asambleaza la RULARE: operatorul sintetic are valori pe domeniul rezervat `.test`,
 * ID-ul GA4 sintetic se lipeste din bucati, iar textele interzise din martori la fel - o proba care
 * poarta literal ce vaneaza devine ea insasi o instanta a defectului pentru alte porti.
 */

const RADACINA = join(__dirname, '..')
const citeste = (cale: string) => readFileSync(join(RADACINA, cale), 'utf8')

/** Textul normalizat cum il normalizeaza poarta juridica: fara diacritice, spatii simple, minuscule. */
function normalizat(text: string): string {
  return text.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, ' ').toLowerCase()
}

/** Operatorul sintetic: fiecare camp din `_forma`, valori evident de proba. */
function operatorSintetic(extra: Partial<Operator> = {}): Operator {
  return {
    denumire: 'Trei S Proba SRL',
    sediu: 'Strada Exemplului 1, Pitesti',
    email: 'date@operator-3s.test',
    telefon: '',
    numar_orc: 'J03/0/2026',
    cod_fiscal: 'RO' + '0'.repeat(8),
    tara: 'România',
    dpo: '',
    ...extra,
  }
}

const ID_GA4_SINTETIC = 'G-' + 'SINTETIC01'

/**
 * HTML-ul randat pe server, cu granitele Suspense ASTEPTATE, ca la constructia statica a paginii:
 * bannerul e o componenta `lazy` (`ConsimtamantLenes`), iar `renderToStaticMarkup` ar da in locul
 * lui rezerva granitei, adica nimic.
 */
async function randeazaIntreg(element: ReactElement): Promise<string> {
  const { prelude } = await prerenderToNodeStream(element)
  const bucati: Buffer[] = []
  for await (const b of prelude) bucati.push(Buffer.from(b as Uint8Array))
  return Buffer.concat(bucati).toString('utf8')
}

afterEach(() => {
  vi.unstubAllEnvs()
  vi.doUnmock('../config/operator.json')
  vi.resetModules()
})

// ---------------------------------------------------------------------------------------------
// A. SEO: adresa site-ului, metadata, date structurate
// ---------------------------------------------------------------------------------------------

describe('adresa site-ului (SITE_URL)', () => {
  it('fara variabila, e mediul de proba de azi', () => {
    expect(adresaSite(undefined)).toBe('https://3s4.ke2.in')
    expect(adresaSite('')).toBe('https://3s4.ke2.in')
  })

  it('martor NEGATIV: o origine https valida trece, fara bara la final', () => {
    expect(adresaSite('https://www.3s.com.ro')).toBe('https://www.3s.com.ro')
    expect(adresaSite('https://www.3s.com.ro/')).toBe('https://www.3s.com.ro')
    expect(urlAbsolut('/preturi', 'https://www.3s.com.ro')).toBe('https://www.3s.com.ro/preturi')
  })

  it('martor POZITIV: http, cale, parametri si text opresc construirea', () => {
    for (const rau of ['http://www.3s.com.ro', 'https://www.3s.com.ro/ro', 'https://www.3s.com.ro/?a=1', 'nu e adresa']) {
      expect(() => adresaSite(rau), rau).toThrow()
    }
  })
})

describe('metadataPagina', () => {
  it('pragurile sunt chiar cele ale portii de SEO (PRAGURI din poarta-seo.py)', () => {
    const poarta = citeste('.claude/scripts/porti/poarta-seo.py')
    const prag = (cheie: string) => Number(poarta.match(new RegExp("'" + cheie + "': (\\d+)"))?.[1])
    expect(prag('titlu_min')).toBe(LIMITE_SEO.titluMin)
    expect(prag('titlu_max')).toBe(LIMITE_SEO.titluMax)
    expect(prag('descriere_min')).toBe(LIMITE_SEO.descriereMin)
    expect(prag('descriere_max')).toBe(LIMITE_SEO.descriereMax)
  })

  it('martor NEGATIV: o pagina buna primeste titlu absolut, canonical, Open Graph si card', () => {
    const m = metadataPagina({
      titlu: 'Prețurile 3S, toate la 0 RON astăzi',
      descriere: 'Pachetele 3S pentru arhiva firmei, cu ce include fiecare și prețul de astăzi: 0 RON.',
      cale: '/preturi',
    })
    expect(m.title).toEqual({ absolute: 'Prețurile 3S, toate la 0 RON astăzi' })
    expect(m.alternates?.canonical).toBe('/preturi')
    expect(m.openGraph).toMatchObject({ url: '/preturi', title: 'Prețurile 3S, toate la 0 RON astăzi', locale: 'ro_RO' })
    expect(m.twitter).toMatchObject({ card: 'summary_large_image' })
  })

  // Un `openGraph` sau `twitter` declarat de pagina INLOCUIESTE obiectul din layout, cu imaginea
  // generata de src/app/opengraph-image.tsx cu tot (Next 15.5, resolve-metadata: imaginea din fisier
  // se pune numai cand nivelul curent nu are `images`). Masurat pe 25.09.2026, pe o pagina interioara
  // construita cu metadataPagina (SITE_ENV=productie): in <head> nicio eticheta og:image si nicio
  // twitter:image, fata de cate una pe start si pe pagina de negasit. Deci imaginea se da aici.
  it('imaginea sociala e data explicit, pentru Open Graph si pentru card, cu marimea si textul ei', () => {
    const m = metadataPagina({
      titlu: 'Prețurile 3S, toate la 0 RON astăzi',
      descriere: 'Pachetele 3S pentru arhiva firmei, cu ce include fiecare și prețul de astăzi: 0 RON.',
      cale: '/preturi',
    })
    const imagine = { width: 1200, height: 630, alt: ALT_IMAGINE, type: 'image/png' }
    expect((m.openGraph as { images?: unknown }).images).toEqual([{ url: '/opengraph-image', ...imagine }])
    expect((m.twitter as { images?: unknown }).images).toEqual([{ url: '/twitter-image', ...imagine }])
  })

  it('adresele, marimea si textul imaginii sunt cele ale fisierelor care o genereaza (fara drift)', async () => {
    for (const [fisier, cale] of [
      ['src/app/opengraph-image.tsx', CALE_IMAGINE_OG],
      ['src/app/twitter-image.tsx', CALE_IMAGINE_CARD],
    ] as const) {
      // Ruta fisierului de imagine e numele lui fara extensie, pe radacina aplicatiei.
      expect('/' + fisier.split('/').pop()?.replace(/\.tsx$/, '')).toBe(cale)
      const modul = (await import('../' + fisier)) as { alt: string; size: { width: number; height: number }; contentType: string }
      expect(modul.alt, fisier).toBe(ALT_IMAGINE)
      expect(modul.size, fisier).toEqual(MARIME_IMAGINE)
      expect(modul.contentType, fisier).toBe(TIP_IMAGINE)
    }
  })

  it('martor POZITIV: titlu scurt, descriere lunga si cale cu parametri sunt refuzate', () => {
    expect(abateriMetadata({ titlu: '3S', descriere: 'x'.repeat(80), cale: '/a' })[0]).toContain('titlu de 2 caractere')
    expect(abateriMetadata({ titlu: 'Un titlu suficient de lung', descriere: 'x'.repeat(200), cale: '/a' })[0]).toContain(
      'descriere de 200',
    )
    expect(abateriMetadata({ titlu: 'Un titlu suficient de lung', descriere: 'x'.repeat(80), cale: '/a?b=1' })).toHaveLength(1)
    expect(() => metadataPagina({ titlu: '3S', descriere: 'scurt', cale: 'fara-bara' })).toThrow(/metadataPagina/)
  })
})

/** Toate cheile si tipurile dintr-un arbore JSON-LD. */
function chei(nod: unknown, adunate = new Set<string>()): Set<string> {
  if (Array.isArray(nod)) nod.forEach((n) => chei(n, adunate))
  else if (nod && typeof nod === 'object') {
    for (const [k, v] of Object.entries(nod)) {
      adunate.add(k)
      if (k === '@type' && typeof v === 'string') adunate.add('@type:' + v)
      chei(v, adunate)
    }
  }
  return adunate
}

/** Campurile de firma, citite din poarta (CAMPURI_FIRMA), ca lista sa nu poata diverge. */
function campuriFirmaDinPoarta(): string[] {
  const bloc = citeste('.claude/scripts/porti/poarta-seo.py').match(/CAMPURI_FIRMA = \{([^}]+)\}/)?.[1] ?? ''
  return [...bloc.matchAll(/'([^']+)'/g)].map((m) => m[1])
}

describe('datele structurate: doar brandul, un singur @id per entitate', () => {
  const baza = 'https://3s4.ke2.in'
  const site = grafSite(baza)
  const acasa = grafAcasa(baza)

  it('graful comun are organizatia si site-ul, fiecare cu @id-ul lui fix', () => {
    const id = iduri(baza)
    expect(site['@graph'].map((n) => [n['@type'], n['@id']])).toEqual([
      ['Organization', id.organizatie],
      ['WebSite', id.site],
    ])
    expect(acasa['@graph'].map((n) => n['@type'])).toEqual(['SoftwareApplication', 'FAQPage'])
  })

  it('niciun nod nu poarta date de firma sau note (listele din poarta de SEO)', () => {
    const interzise = campuriFirmaDinPoarta()
    // Controlul extragerii: lista citita din poarta nu e goala si contine campul-reper.
    expect(interzise).toContain('taxID')
    const gasite = chei([site, acasa])
    for (const camp of [...interzise, 'aggregateRating', 'review', '@type:AggregateRating', '@type:Review']) {
      expect(gasite.has(camp), camp).toBe(false)
    }
  })

  it('martor POZITIV: acelasi detector gaseste un camp de firma pus intr-o copie a grafului', () => {
    const stricat = JSON.parse(JSON.stringify(site))
    stricat['@graph'][0]['tax' + 'ID'] = 'RO' + '0'.repeat(8)
    expect(chei(stricat).has('taxID')).toBe(true)
  })

  it('aplicatia costa 0 RON, fara nota, si refera organizatia prin @id', () => {
    const aplicatie = acasa['@graph'][0]
    expect(aplicatie.offers).toEqual({ '@type': 'Offer', price: '0', priceCurrency: 'RON' })
    expect(aplicatie.publisher).toEqual({ '@id': iduri(baza).organizatie })
    expect(aplicatie['@id']).toBe(iduri(baza).aplicatie)
  })

  it('intrebarile din FAQPage sunt exact cele vizibile pe pagina de start', () => {
    const faq = acasa['@graph'][1] as unknown as { mainEntity: { name: string; acceptedAnswer: { text: string } }[] }
    expect(faq.mainEntity.map((q) => q.name)).toEqual(INTREBARI.intrebari.map((i) => i.intrebare))
    const html = renderToStaticMarkup(createElement(Acasa))
    const text = (s: string) => s.replace(/&#x27;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, '&')
    for (const q of faq.mainEntity) {
      expect(text(html)).toContain(q.name)
      expect(text(html)).toContain(q.acceptedAnswer.text)
    }
  })

  it('firul de Ariadna: pozitii continue de la 1, adrese absolute pe adresa site-ului, cel putin doua niveluri', () => {
    const fir = grafFirAriadnei(
      [
        { nume: 'Acasă', cale: '/' },
        { nume: 'Soluții', cale: '/solutii' },
        { nume: 'Construcții', cale: '/solutii/constructii' },
      ],
      'https://www.3s.com.ro',
    )
    const lista = fir['@graph'][0] as unknown as { itemListElement: { position: number; item: string }[]; '@id': string }
    expect(lista.itemListElement.map((e) => e.position)).toEqual([1, 2, 3])
    expect(lista.itemListElement[2].item).toBe('https://www.3s.com.ro/solutii/constructii')
    expect(lista['@id']).toBe('https://www.3s.com.ro/solutii/constructii#fir')
    expect(() => grafFirAriadnei([{ nume: 'Acasă', cale: '/' }])).toThrow()
  })

  it('componenta firului de Ariadna pune graful in HTML-ul servit, ca bloc JSON-LD', () => {
    const niveluri = [
      { nume: 'Acasă', cale: '/' },
      { nume: 'Blog', cale: '/blog' },
    ]
    const html = renderToStaticMarkup(createElement(DateFirAriadnei, { niveluri }))
    const bloc = html.match(/^<script type="application\/ld\+json">(.*)<\/script>$/)
    expect(bloc, html).not.toBeNull()
    expect(JSON.parse(bloc?.[1] ?? '{}')).toEqual(grafFirAriadnei(niveluri))
    expect(() => renderToStaticMarkup(createElement(DateFirAriadnei, { niveluri: niveluri.slice(0, 1) }))).toThrow()
  })

  it('serializarea nu poate inchide eticheta <script>', () => {
    const s = serializeaza({ text: '</script><script>alert(1)</script>' })
    expect(s).not.toContain('</script>')
    expect(JSON.parse(s).text).toBe('</script><script>alert(1)</script>')
  })
})

// ---------------------------------------------------------------------------------------------
// B. Harta de site si lastmod din istoria git
// ---------------------------------------------------------------------------------------------

function git(argumente: string[], cwd: string): string {
  return execFileSync('git', argumente, { cwd, encoding: 'utf8' }).trim()
}

describe('harta de site', () => {
  it('fara priority si changefreq; adresele sunt cele din RUTE, pe adresa site-ului', () => {
    const intrari = sitemap()
    expect(intrari.map((i) => i.url)).toEqual(rutePentruHarta().map((r) => urlAbsolut(r.cale)))
    for (const i of intrari) {
      expect(i).not.toHaveProperty('priority')
      expect(i).not.toHaveProperty('changeFrequency')
    }
  })

  it('sursele startului sunt pagina si modulul de continut importat direct', () => {
    expect(surseleRutei('/', RADACINA)).toEqual(['src/app/page.tsx', 'src/content/acasa.ts'])
  })

  it('lastmod e data commitului care a atins ultima oara sursele (masurat aici, cu git)', () => {
    if (!istoricComplet(RADACINA)) {
      // Clona superficiala (CI cu fetch-depth 1): campul trebuie sa LIPSEASCA, nu sa fie inventat.
      expect(sitemap()[0]).not.toHaveProperty('lastModified')
      return
    }
    const asteptat = git(['log', '-1', '--format=%cI', '--', 'src/app/page.tsx', 'src/content/acasa.ts'], RADACINA)
    expect(asteptat).toMatch(/^\d{4}-\d{2}-\d{2}T/)
    expect(sitemap().find((i) => i.url === urlAbsolut('/'))?.lastModified).toBe(asteptat)
  })

  it('martor POZITIV: fara depozit git si intr-o clona superficiala, lastmod lipseste', () => {
    const gol = mkdtempSync(join(tmpdir(), 'fara-git-'))
    try {
      expect(istoricComplet(gol)).toBe(false)
      expect(dataUltimuluiCommit(['src/app/page.tsx'], gol)).toBeNull()
    } finally {
      rmSync(gol, { recursive: true, force: true })
    }
    if (!istoricComplet(RADACINA)) return
    const clona = mkdtempSync(join(tmpdir(), 'clona-superficiala-'))
    try {
      git(['clone', '--quiet', '--depth', '1', 'file://' + RADACINA.replace(/\\/g, '/'), clona], RADACINA)
      // Controlul fixturii: clona chiar e superficiala si chiar are fisierul.
      expect(git(['rev-parse', '--is-shallow-repository'], clona)).toBe('true')
      expect(surseleRutei('/', clona)).toContain('src/app/page.tsx')
      expect(istoricComplet(clona)).toBe(false)
      expect(dataUltimuluiCommit(surseleRutei('/', clona), clona)).toBeNull()
    } finally {
      rmSync(clona, { recursive: true, force: true })
    }
  }, 60_000)

  it('articolele din registru intra in harta cu data publicarii', async () => {
    vi.resetModules()
    vi.doMock('../src/content/blog/registru', async (original) => {
      const real = await original<typeof import('../src/content/blog/registru')>()
      const articol = { slug: 'termene-de-pastrare', titlu: 'Termene', extras: 'Extras', categorie: 'juridic' as const, data: '2026-09-20' }
      return { ...real, ARTICOLE: [articol], caiArticole: () => ['/blog/termene-de-pastrare'] }
    })
    const harta = (await import('../src/app/sitemap')).default()
    expect(harta.find((i) => i.url.endsWith('/blog/termene-de-pastrare'))?.lastModified).toBe('2026-09-20')
    vi.doUnmock('../src/content/blog/registru')
  })
})

// ---------------------------------------------------------------------------------------------
// C. robots.txt, citit cu un evaluator de reguli (RFC 9309), nu cu o cautare de text
// ---------------------------------------------------------------------------------------------

type Grup = { agenti: string[]; reguli: { permis: boolean; cale: string }[]; linii: string[] }

/** Grupurile unui robots.txt: linii User-Agent consecutive, apoi regulile lor. */
function grupuri(text: string): Grup[] {
  const rezultat: Grup[] = []
  let curent: Grup | null = null
  let inAgenti = false
  for (const brut of text.split('\n')) {
    const rand = brut.replace(/#.*$/, '').trim()
    if (rand === '') continue
    const [camp, ...rest] = rand.split(':')
    const valoare = rest.join(':').trim()
    const c = camp.trim().toLowerCase()
    if (c === 'user-agent') {
      if (!inAgenti || curent === null) {
        curent = { agenti: [], reguli: [], linii: [] }
        rezultat.push(curent)
      }
      curent.agenti.push(valoare.toLowerCase())
      inAgenti = true
      continue
    }
    inAgenti = false
    if (curent === null) continue
    curent.linii.push(rand)
    if (c === 'allow' || c === 'disallow') curent.reguli.push({ permis: c === 'allow', cale: valoare })
  }
  return rezultat
}

/** RFC 9309: grupul robotului (sau `*`), apoi regula cu potrivirea cea mai lunga; la egalitate, Allow. */
function permis(text: string, robot: string, cale: string): boolean {
  const toate = grupuri(text)
  const token = robot.toLowerCase()
  const ale = toate.filter((g) => g.agenti.includes(token))
  const aplicabile = ale.length > 0 ? ale : toate.filter((g) => g.agenti.includes('*'))
  let castig: { permis: boolean; lungime: number } | null = null
  for (const r of aplicabile.flatMap((g) => g.reguli)) {
    if (r.cale === '' || !cale.startsWith(r.cale)) continue
    if (castig === null || r.cale.length > castig.lungime || (r.cale.length === castig.lungime && r.permis)) {
      castig = { permis: r.permis, lungime: r.cale.length }
    }
  }
  return castig === null ? true : castig.permis
}

describe('robots.txt', () => {
  const cfg = JSON.parse(citeste('config/seo.json')) as {
    semnal_continut: Record<string, string>
    roboti_permisi: string[]
    roboti_blocati: string[]
  }
  const productie = textRobots({ indexare: true, adresa: 'https://www.3s.com.ro' })
  const cai = ['/', '/preturi', '/solutii/constructii', '/_next/static/chunks/a.js', '/llms.txt']

  it('pe staging interzice tot, ca pana acum, fara semnal si fara harta', () => {
    expect(textRobots({ indexare: false, adresa: 'https://3s4.ke2.in' })).toBe('User-Agent: *\nDisallow: /\n')
  })

  it('in productie: fiecare robot permis intra peste tot, fiecare robot blocat nicaieri', () => {
    expect(cfg.roboti_permisi.length).toBeGreaterThan(10)
    for (const robot of cfg.roboti_permisi) for (const cale of cai) expect(permis(productie, robot, cale), robot + ' ' + cale).toBe(true)
    for (const robot of cfg.roboti_blocati) for (const cale of cai) expect(permis(productie, robot, cale), robot + ' ' + cale).toBe(false)
    expect(cfg.roboti_blocati).toContain('Bytespider')
  })

  it('semnalul de continut sta in grupul `*`, exact cu valorile din configurare, iar harta e absoluta', () => {
    const stea = grupuri(productie).find((g) => g.agenti.includes('*'))
    expect(stea?.linii).toContain(linieSemnal(cfg.semnal_continut))
    expect(linieSemnal(cfg.semnal_continut)).toBe('Content-Signal: search=yes, ai-input=yes, ai-train=yes')
    expect(productie).toContain('Sitemap: https://www.3s.com.ro/sitemap.xml')
  })

  it('martor POZITIV: evaluatorul vede un robot lasat liber si potrivirea fara majuscule', () => {
    const fara = textRobots({ indexare: true, adresa: 'https://x.test', configurare: { ...cfg, roboti_blocati: [] } })
    expect(permis(fara, 'Bytespider', '/')).toBe(true)
    expect(permis(productie, 'bytespider', '/')).toBe(false)
  })

  it('martor NEGATIV: o regula Allow mai lunga castiga peste un Disallow mai scurt', () => {
    const text = 'User-Agent: *\nDisallow: /a\nAllow: /a/b\n'
    expect(permis(text, 'GPTBot', '/a/b/c')).toBe(true)
    expect(permis(text, 'GPTBot', '/a/x')).toBe(false)
  })
})

describe('/llms.txt', () => {
  const text = textLlms('https://3s4.ke2.in')
  const adrese = [...text.matchAll(/\]\((https:\/\/[^)]+)\)/g)].map((m) => m[1])

  it('are titlul marcii, rezumatul si o legatura pentru fiecare pagina din harta', () => {
    expect(text.startsWith('# 3S Scan Store Solve\n\n> ')).toBe(true)
    expect(adrese).toEqual(sitemap().map((i) => i.url))
  })

  it('martor POZITIV: o adresa pe care harta nu o are e gasita de aceeasi comparatie', () => {
    const cuIntrus = text + '- [Intrus](https://3s4.ke2.in/nu-exista): nota\n'
    const din = [...cuIntrus.matchAll(/\]\((https:\/\/[^)]+)\)/g)].map((m) => m[1])
    const harta = new Set(sitemap().map((i) => i.url))
    expect(din.filter((a) => !harta.has(a))).toEqual(['https://3s4.ke2.in/nu-exista'])
  })
})

describe('declaratiile de raspuns (G-AI-02): un fisier pe felie, config/seo/<felia>.json', () => {
  // Marcajele de felie se lipesc la rulare: fisierul probei nu trebuie sa fie el insusi un marcaj.
  const marcaj = (felie: string) => '  // <<' + 'felie:' + felie + '>>'
  const RUTE_FIXTURA = [
    'export type Ruta = { cale: string };',
    'export const RUTE: Ruta[] = [',
    marcaj('fundatie'),
    '  { cale: "/", scurt: "Acasă", descriere: "x", inHarta: true },',
    marcaj('preturi'),
    '  {',
    '    cale: "/preturi",',
    '    scurt: "Prețuri",',
    '  },',
    marcaj('blog'),
    '];',
  ].join('\n')
  const CAI_FIXTURA = ['/', '/preturi']
  const DECL = { intrebare: 'Cât costă 3S astăzi?', entitati: ['0 RON'] }

  /** Un depozit fabricat: `rute.ts` si fisierele din `config/seo/`, sters dupa `f`. */
  function cuArbore<T>(fisiere: Record<string, unknown>, f: (radacina: string) => T, textRute = RUTE_FIXTURA): T {
    const d = mkdtempSync(join(tmpdir(), 'declaratii-'))
    const scrie = (rel: string, continut: string) => {
      const cale = join(d, rel)
      mkdirSync(dirname(cale), { recursive: true })
      writeFileSync(cale, continut, 'utf8')
    }
    try {
      scrie('src/content/rute.ts', textRute)
      for (const [nume, c] of Object.entries(fisiere)) scrie('config/seo/' + nume, typeof c === 'string' ? c : JSON.stringify(c))
      return f(d)
    } finally {
      rmSync(d, { recursive: true, force: true })
    }
  }

  it('pe depozitul real: nicio abatere, iar fiecare ruta din RUTE are declaratia ei', () => {
    const r = citesteDeclaratiile(RADACINA, RUTE.map((x) => x.cale))
    expect(r.abateri).toEqual([])
    for (const x of RUTE) expect(r.declaratii.has(x.cale), x.cale + ' in ' + r.fisierAsteptat.get(x.cale)).toBe(true)
  })

  it('martor NEGATIV: fiecare felie isi declara rutele in fisierul ei', () => {
    const r = cuArbore({ 'fundatie.json': { raspuns_autonom: { '/': DECL } }, 'preturi.json': { raspuns_autonom: { '/preturi': DECL } } }, (d) =>
      citesteDeclaratiile(d, CAI_FIXTURA),
    )
    expect(r.abateri).toEqual([])
    expect([...r.declaratii.keys()].sort()).toEqual(['/', '/preturi'])
    expect(r.fisierAsteptat.get('/preturi')).toBe('config/seo/preturi.json')
  })

  it('martor POZITIV: o ruta declarata in fisierul altei felii e refuzata, cu fisierul corect in mesaj', () => {
    const r = cuArbore({ 'fundatie.json': { raspuns_autonom: { '/': DECL, '/preturi': DECL } } }, (d) => citesteDeclaratiile(d, CAI_FIXTURA))
    expect(r.abateri).toEqual(['config/seo/fundatie.json: ruta /preturi e a feliei preturi, deci se declara in config/seo/preturi.json'])
    expect(r.declaratii.has('/preturi')).toBe(false)
  })

  it('martor POZITIV: un fisier comun, fara felie, si o ruta care nu exista sunt refuzate', () => {
    const r = cuArbore(
      { 'comun.json': { raspuns_autonom: { '/': DECL } }, 'fundatie.json': { raspuns_autonom: { '/nu-exista': DECL } } },
      (d) => citesteDeclaratiile(d, CAI_FIXTURA),
    )
    expect(r.abateri).toEqual([
      'config/seo/comun.json: nu exista felia "comun" printre marcajele din src/content/rute.ts',
      'config/seo/fundatie.json: ruta /nu-exista nu e in RUTE',
    ])
  })

  it('martor POZITIV: declaratie fara entitati si JSON stricat sunt refuzate', () => {
    const r = cuArbore({ 'fundatie.json': { raspuns_autonom: { '/': { intrebare: 'Ce face 3S?' } } }, 'preturi.json': '{ nu e json' }, (d) =>
      citesteDeclaratiile(d, CAI_FIXTURA),
    )
    expect(r.abateri).toEqual([
      'config/seo/fundatie.json: declaratia rutei / nu are forma { intrebare, entitati, fara_regula_paragrafului? }',
      'config/seo/preturi.json: nu e JSON valid',
    ])
  })

  it('martor POZITIV: o ruta inaintea oricarui marcaj si o citire care nu da rutele modulului', () => {
    const faraMarcaj = RUTE_FIXTURA.replace(marcaj('fundatie') + '\n', '')
    const r = cuArbore({}, (d) => citesteDeclaratiile(d, CAI_FIXTURA), faraMarcaj)
    expect(r.abateri[0]).toBe('src/content/rute.ts: ruta / sta inaintea oricarui marcaj de felie')
    expect(r.abateri[1]).toContain('citit ca text da rutele ["/preturi"]')
  })
})

// ---------------------------------------------------------------------------------------------
// D. Comutatorul: operatorul, ID-ul GA4, bannerul si legatura din subsol
// ---------------------------------------------------------------------------------------------

describe('comutatorul operatorului si al analiticii (plan §9-§10)', () => {
  it('forma: null trece, un operator cu campurile din _forma trece', () => {
    expect(citesteOperator({ operator: null })).toBeNull()
    expect(citesteOperator({ operator: operatorSintetic() })?.denumire).toBe('Trei S Proba SRL')
  })

  it('martor POZITIV: cheie lipsa, text, camp necunoscut si camp netextual opresc construirea', () => {
    expect(() => citesteOperator({})).toThrow(/operator/)
    expect(() => citesteOperator({ operator: 'ADRIA' })).toThrow()
    expect(() => citesteOperator({ operator: { denumire: 'x', cui: 'y' } })).toThrow(/cui/)
    expect(() => citesteOperator({ operator: { denumire: 3 } })).toThrow(/text/)
  })

  it('ID-ul GA4: gol = absent, forma G-... trece, altceva opreste construirea', () => {
    expect(idGa4('')).toBeNull()
    expect(idGa4(undefined)).toBeNull()
    expect(idGa4(ID_GA4_SINTETIC)).toBe(ID_GA4_SINTETIC)
    for (const rau of ['UA-12345-1', 'g-abc123', 'G-', 'G-abc def']) expect(() => idGa4(rau), rau).toThrow()
  })

  it('fara operator, GA4 ramane oprit CHIAR CU ID (decizia owner-ului, plan §9)', () => {
    expect(stareAnalitica(null, ID_GA4_SINTETIC)).toEqual({ activa: false, motiv: 'fara-operator' })
  })

  it('operator incomplet sau fara ID: oprit; operator complet si ID: pornit', () => {
    expect(stareAnalitica(operatorSintetic({ email: '' }), ID_GA4_SINTETIC)).toEqual({ activa: false, motiv: 'operator-incomplet' })
    expect(stareAnalitica(operatorSintetic({ sediu: 'de completat' }), ID_GA4_SINTETIC).activa).toBe(false)
    expect(stareAnalitica(operatorSintetic(), null)).toEqual({ activa: false, motiv: 'fara-id' })
    expect(stareAnalitica(operatorSintetic(), ID_GA4_SINTETIC)).toEqual({ activa: true, idGa4: ID_GA4_SINTETIC })
  })

  // Substituentii scurti (N/A, TODO, TBD, lorem) sunt cuvinte, nu bucati de cuvant. Masurat de critic
  // pe 25.09.2026, cu tiparul vechi: sediul "Str. Ana Ipatescu 12" iesea loc gol, deci in ziua
  // operatorului analitica ramanea oprita si textele juridice nu se construiau, fara niciun semnal.
  const VALORI_REALE: [CampOperator, string][] = [
    ['sediu', 'Str. Ana Ipătescu 12, București'],
    ['sediu', 'Poiana Brașov, județul Brașov'],
    ['denumire', 'Arhiva Română SRL'],
    ['denumire', 'Arhiva Romana SRL'],
    ['denumire', 'Todoran Arhive SRL'],
  ]

  it('martor NEGATIV: nume si adrese reale care contin "na" sau "todo" nu sunt locuri goale', () => {
    for (const [camp, valoare] of VALORI_REALE) {
      const operator = operatorSintetic({ [camp]: valoare })
      expect(lipsuriInformare(operator), camp + ': ' + valoare).toEqual([])
      expect(stareAnalitica(operator, ID_GA4_SINTETIC).activa, camp + ': ' + valoare).toBe(true)
      expect(texteJuridice(operator, 'https://3s4.ke2.in'), camp + ': ' + valoare).not.toBeNull()
    }
  })

  it('martor POZITIV: substituentii raman locuri goale, singuri sau lipiti de cifre si de _', () => {
    const substituenti = ['N/A', 'n/a', 'NA', 'Sediu: N/A', 'TODO', 'TODO_sediu', 'TBD', 'Lorem ipsum', 'de completat',
      'necunoscut', 'XXXX', 'RO1234XXXX', '???', '<sediul firmei>']
    for (const valoare of substituenti) {
      expect(lipsuriInformare(operatorSintetic({ sediu: valoare })), valoare).toEqual(['sediu'])
    }
    // Controlul: acelasi operator, cu sediul real, e complet (deci lipsa de mai sus vine din valoare).
    expect(lipsuriInformare(operatorSintetic())).toEqual([])
  })

  it('pe configurarea reala, bannerul si legatura din subsol urmeaza starea analiticii', async () => {
    // Azi: operator null, fara ID, deci nimic. In ziua operatorului, fara ID in mediul local, tot
    // nimic (motivul devine "fara-id"); cu ID, amandoua. Proba nu se inroseste pe comutarea corecta.
    const stare = stareAnalitica()
    const Subsol = (await import('../src/components/global/Subsol')).default
    const Punct = (await import('../src/components/consimtamant/PunctConsimtamant')).default
    const subsol = renderToStaticMarkup(createElement(Subsol))
    // Controlul: subsolul chiar s-a randat.
    expect(subsol).toContain('<footer')
    expect(subsol.includes('data-cookie-settings'), 'legatura din subsol, cu analitica ' + JSON.stringify(stare)).toBe(
      stare.activa,
    )
    expect(
      (await randeazaIntreg(createElement(Punct))).includes('data-consimtamant'),
      'bannerul, cu analitica ' + JSON.stringify(stare),
    ).toBe(stare.activa)
  })

  /** Randeaza subsolul si bannerul pe o copie a configurarii cu operator sintetic si ID GA4. */
  async function randeazaPornit(operator: Operator | null, id: string) {
    vi.resetModules()
    vi.stubEnv('NEXT_PUBLIC_GA4_ID', id)
    const reala = JSON.parse(citeste('config/operator.json')) as Record<string, unknown>
    vi.doMock('../config/operator.json', () => ({ default: { ...reala, operator } }))
    const { OPERATOR } = await import('../src/lib/operator')
    const Subsol = (await import('../src/components/global/Subsol')).default
    const Punct = (await import('../src/components/consimtamant/PunctConsimtamant')).default
    return {
      operator: OPERATOR,
      subsol: renderToStaticMarkup(createElement(Subsol)),
      banner: await randeazaIntreg(createElement(Punct)),
    }
  }

  it('martor POZITIV: cu operator sintetic si ID, bannerul si legatura apar in HTML-ul servit', async () => {
    const r = await randeazaPornit(operatorSintetic(), ID_GA4_SINTETIC)
    // Controlul injectiei: modulul incarcat chiar vede operatorul sintetic.
    expect(r.operator?.email).toBe('date@operator-3s.test')
    expect(r.subsol).toContain('data-cookie-settings')
    expect(r.banner).toContain('data-consimtamant')
    // Pe server bannerul e ascuns: il arata componenta, dupa ce citeste alegerea din browser.
    expect(r.banner).toMatch(/<section[^>]*hidden=""/)
    // Nicio caseta bifata la prima randare; singura caseta e a statisticii.
    const casete = [...r.banner.matchAll(/<input[^>]*type="checkbox"[^>]*>/g)].map((m) => m[0])
    expect(casete).toHaveLength(1)
    expect(casete[0]).not.toMatch(/checked/)
    // Primul strat: acceptul si refuzul sunt amandoua butoane, unul langa altul, in aceeasi ordine
    // ca in panou. Marimea si forma lor se masoara in browser (tests/browser/comutator.spec.ts).
    const primulStrat = r.banner.slice(0, r.banner.indexOf('</section>'))
    const butoane = [...primulStrat.matchAll(/<button type="button"[^>]*data-(accept|refuz|setari)=""/g)]
    expect(butoane.map((b) => b[1])).toEqual(['accept', 'refuz', 'setari'])
    // Niciun script Google in HTML-ul servit: se incarca numai dupa accept, in browser.
    expect(r.banner + r.subsol).not.toMatch(/googletag|gtag\/js/)
    // Primul strat spune ca acordul se retrage, si de unde, INAINTE de accept (GDPR art. 7 alin. (3)).
    const descriere = primulStrat.match(/<p id="[^"]*"[^>]*>([^<]*)<\/p>/)?.[1] ?? ''
    expect(descriere).toContain('retrage')
    expect(descriere).toContain('subsolul')
  })

  it('marcajul bannerului din poarta juridica (MARCAJ_BANNER, L-15) e atributul bannerului randat', async () => {
    const marcaj = citeste('.claude/scripts/porti/poarta-juridic.py').match(/^MARCAJ_BANNER = '([^']+)'/m)?.[1]
    // Controlul extragerii: constanta chiar s-a citit.
    expect(marcaj).toMatch(/^data-/)
    const r = await randeazaPornit(operatorSintetic(), ID_GA4_SINTETIC)
    expect(r.banner).toContain(marcaj + '=""')
  })

  it('martor NEGATIV: cu ID dar fara operator, nimic nu apare (GA4 oprit chiar cu ID)', async () => {
    const r = await randeazaPornit(null, ID_GA4_SINTETIC)
    expect(r.operator).toBeNull()
    expect(r.subsol).toContain('<footer')
    expect(r.subsol).not.toContain('data-cookie-settings')
    expect(r.banner).toBe('')
  })

  it('legaturile bannerului duc numai la politici care exista; caile sunt cele din navigatie', () => {
    const navigatie = toateLegaturileNavigatiei().map((l) => l.ruta)
    expect(navigatie).toContain(CAI_POLITICI.confidentialitate)
    expect(navigatie).toContain(CAI_POLITICI.cookie)
    expect(legaturiPolitici(new Set(['/']))).toEqual({ confidentialitate: null, cookie: null })
    expect(legaturiPolitici(new Set(['/', CAI_POLITICI.cookie])).cookie).toBe(CAI_POLITICI.cookie)
  })
})

// ---------------------------------------------------------------------------------------------
// E. Evenimentele (lista inchisa), evidenta si piesele incarcatorului
// ---------------------------------------------------------------------------------------------

describe('evenimentele de analitica, lista inchisa (plan §8.5)', () => {
  it('lista e cea din plan si fiecare eveniment are descriere in politica', () => {
    expect(Object.keys(EVENIMENTE).sort()).toEqual(
      ['calculator_folosit', 'clic_cta', 'formular_inceput', 'formular_trimis', 'industrie_aleasa'].sort(),
    )
    expect(Object.keys(DESCRIERE_EVENIMENTE).sort()).toEqual(Object.keys(EVENIMENTE).sort())
    expect(CAI_CTA_URMARITE[0]).toBe(CALE_INREGISTRARE)
  })

  it('martor NEGATIV: evenimentele din lista, cu parametrii lor, trec', () => {
    expect(evenimentValid('clic_cta', { tinta: '/inregistrare' })).toBe(true)
    expect(evenimentValid('formular_trimis', { formular: 'contact' })).toBe(true)
    expect(evenimentValid('industrie_aleasa', { industrie: 'constructii' })).toBe(true)
    expect(evenimentValid('calculator_folosit', {})).toBe(true)
  })

  it('martor POZITIV: nume necunoscut, parametru in plus si text liber sunt respinse', () => {
    expect(evenimentValid('page_view', {})).toBe(false)
    expect(evenimentValid('clic_cta', { tinta: '/inregistrare', email: 'x' })).toBe(false)
    expect(evenimentValid('industrie_aleasa', { industrie: 'ana' + '@' + 'firma-proba.test' })).toBe(false)
    expect(evenimentValid('industrie_aleasa', { industrie: 'Ion Popescu' })).toBe(false)
    expect(evenimentValid('clic_cta', { tinta: '/inregistrare?email=a' })).toBe(false)
    expect(evenimentValid('formular_trimis', { formular: 'newsletter' })).toBe(false)
  })
})

describe('evidenta consimtamantului', () => {
  const buna = { id: 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d', versiune: VERSIUNE_INFORMARE, statistica: true, metoda: 'accept-tot', cale: '/' }

  it('martor NEGATIV: o cerere cu exact forma asteptata trece', () => {
    expect(valideazaEvidenta(buna)).toEqual(buna)
  })

  it('martor POZITIV: camp in plus, id liber, versiune straina, metoda necunoscuta, cale cu parametri', () => {
    expect(valideazaEvidenta({ ...buna, ip: '1.2.3.4' })).toBeNull()
    expect(valideazaEvidenta({ ...buna, id: 'Ion Popescu' })).toBeNull()
    expect(valideazaEvidenta({ ...buna, versiune: 'orice' })).toBeNull()
    expect(valideazaEvidenta({ ...buna, metoda: 'implicit' })).toBeNull()
    expect(valideazaEvidenta({ ...buna, cale: '/?email=a' })).toBeNull()
    expect(valideazaEvidenta([buna])).toBeNull()
  })

  it('prefixul de retea: IPv4 cu ultimul octet zero, IPv6 cu primii 48 de biti, nimic altceva', () => {
    expect(prefixRetea('203.0.113.77, 10.0.0.1')).toBe('203.0.113.0')
    expect(prefixRetea('::ffff:198.51.100.23')).toBe('198.51.100.0')
    expect(prefixRetea('2001:db8:85a3::8a2e:370:7334')).toBe('2001:db8:85a3::')
    expect(prefixRetea('2001:0db8:0000:0000:0000:0000:0000:0001')).toBe('2001:db8:0::')
    expect(prefixRetea('999.1.1.1')).toBe('')
    expect(prefixRetea('nu-e-ip')).toBe('')
    expect(prefixRetea(null)).toBe('')
  })

  it('randul de jurnal nu poarta adresa IP completa', () => {
    const rand = randEvidenta(buna as never, '2026-09-24T10:00:00.000Z', prefixRetea('203.0.113.77'))
    expect(JSON.parse(rand)).toMatchObject({ tip: '3s-consimtamant', retea: '203.0.113.0', statistica: true })
    expect(rand).not.toContain('203.0.113.77')
  })

  it('alegerea pastrata in browser e declarata in politica si are forma verificata', () => {
    expect(CHEIE_ALEGERE).toBe(COOKIE_ALEGERE.nume)
    expect(alegereValida({ versiune: 'ro-00000000', id: 'id-1', moment: '2026-09-24T10:00:00Z', statistica: false, metoda: 'refuz-tot' })).toBe(true)
    expect(alegereValida({ versiune: 'ro-00000000', id: 'id-1', moment: 'ieri', statistica: false, metoda: 'refuz-tot' })).toBe(false)
  })

  it('versiunea informarii are forma asteptata si se schimba cand se schimba textul', () => {
    expect(VERSIUNE_INFORMARE).toMatch(/^ro-[0-9a-f]{8}$/)
    expect(amprenta('Cookie-uri de statistică')).not.toBe(amprenta('Cookie-uri de statistica'))
  })

  it('stergerea cookie-urilor GA4 ia gazda si parintii ei, si numai cookie-urile _ga', () => {
    expect(domeniiCookie('3s4.ke2.in')).toEqual(['3s4.ke2.in', 'ke2.in'])
    expect(numeCookieGa('_ga=GA1.1.1; alt=1; _ga_ABC123=GS1.1; x_ga=2')).toEqual(['_ga', '_ga_ABC123'])
  })
})

// ---------------------------------------------------------------------------------------------
// F. Textele juridice, NEPUBLICATE, pe portile G-MD (cercetarea gdpr-moldova, §8)
// ---------------------------------------------------------------------------------------------

describe('textele juridice (plan §9-§10, nepublicate)', () => {
  const texte = texteJuridice(operatorSintetic(), 'https://3s4.ke2.in')
  const politica = texte?.confidentialitate as DocumentJuridic
  const cookie = texte?.cookie as DocumentJuridic
  const sectiune = (d: DocumentJuridic, cheie: string) => d.sectiuni.find((s) => s.cheie === cheie)
  const textSectiune = (d: DocumentJuridic, cheie: string) =>
    (sectiune(d, cheie)?.blocuri ?? []).flatMap((b) => b.paragrafe).join(' ')

  it('fara operator nu exista texte; cat timp comutatorul e null, nicio ruta juridica nu e in RUTE', () => {
    expect(texteJuridice(null)).toBeNull()
    expect(texte).not.toBeNull()
    // In ziua operatorului paginile juridice intra in RUTE (docs/ziua-operatorului.md, pasul 3);
    // de atunci le cere poarta juridica (L-15), nu proba asta.
    if (OPERATOR === null) expect(RUTE.some((r) => r.cale.startsWith('/juridic'))).toBe(false)
  })

  it('G-MD-01: politica are toate cele 12 elemente din art. 13, fiecare cu text (peste 40 de caractere)', () => {
    expect(politica.sectiuni.map((s) => s.cheie)).toEqual([...CHEI_ART13])
    for (const cheie of CHEI_ART13) expect(textSectiune(politica, cheie).length, cheie).toBeGreaterThan(40)
  })

  /** Ce vede vizitatorul unei jurisdictii dintr-o sectiune: blocurile ei plus cele pentru toti. */
  const vazutDe = (d: DocumentJuridic, cheie: string, jurisdictie: 'ro' | 'md') =>
    (sectiune(d, cheie)?.blocuri ?? [])
      .filter((b) => b.jurisdictie === jurisdictie || b.jurisdictie === null)
      .flatMap((b) => b.paragrafe)
      .join(' ')

  it('G-MD-01 lit. f): copia garantiilor de transfer si cum se cere, pentru RO si pentru MD', () => {
    // Legea 195/2024 art. 13 alin. (1) lit. f): cand transferul se sprijina pe art. 46 (clauzele
    // standard, calea pentru MD), informarea cuprinde si mijloacele de a obtine o copie a garantiilor.
    for (const jurisdictie of ['ro', 'md'] as const) {
      const t = vazutDe(politica, '1f', jurisdictie)
      expect(t, jurisdictie).toContain('copie a garanțiilor de transfer')
      expect(t, jurisdictie).toContain('date@operator-3s.test')
    }
    // Controlul: blocul MD chiar numeste clauzele standard, deci fraza de mai sus e ceruta acolo.
    expect(vazutDe(politica, '1f', 'md')).toContain('2021/914')
  })

  it('martor POZITIV: fraza pusa numai in blocul RO nu ajunge la vizitatorul din MD', () => {
    const numaiRo = JSON.parse(JSON.stringify(politica)) as DocumentJuridic
    const s1f = numaiRo.sectiuni.find((s) => s.cheie === '1f')
    if (!s1f) throw new Error('sectiunea 1f lipseste din politica')
    const comuna = s1f.blocuri.find((b) => b.jurisdictie === null)
    const ro = s1f.blocuri.find((b) => b.jurisdictie === 'ro')
    if (!comuna || !ro) throw new Error('sectiunea 1f nu mai are blocul comun sau cel RO')
    ro.paragrafe.push(...comuna.paragrafe)
    s1f.blocuri = s1f.blocuri.filter((b) => b !== comuna)
    expect(vazutDe(numaiRo, '1f', 'ro')).toContain('copie a garanțiilor de transfer')
    expect(vazutDe(numaiRo, '1f', 'md')).not.toContain('copie a garanțiilor de transfer')
  })

  it('G-MD-08: politica de cookie-uri acopera lit. b)-h) din Legea 284/2004 si masurile', () => {
    for (const cheie of CHEI_L284) expect(textSectiune(cookie, cheie).length, cheie).toBeGreaterThan(40)
    expect(textSectiune(cookie, 'temei')).toContain('Legea nr. 506/2004')
  })

  it('operatorul numit apare in politica, cu contactul lui; fara el, textul nu se construieste', () => {
    const cine = textSectiune(politica, '1a')
    expect(cine).toContain('Trei S Proba SRL')
    expect(cine).toContain('date@operator-3s.test')
    expect(texteJuridice(operatorSintetic({ email: '' }))).toBeNull()
  })

  it('G-MD-02: un operator din afara SEE nu primeste texte fara reprezentant in Moldova', () => {
    expect(inSee('România')).toBe(true)
    expect(inSee('Germania')).toBe(true)
    expect(inSee('Statele Unite')).toBe(false)
    expect(() => texteJuridice(operatorSintetic({ tara: 'Statele Unite' }))).toThrow(/reprezentant/)
  })

  /** Tiparul L-10 al portii juridice (si G-MD-09), aplicat pe textul normalizat. */
  const TIPAR_L10 = /\bnum[ae]r\w*\b.{0,120}?\boperator/

  it('G-MD-09: nicaieri un cod de inscriere ca operator (tiparul L-10)', () => {
    for (const d of [politica, cookie]) expect(TIPAR_L10.test(normalizat(textIntreg(d)))).toBe(false)
  })

  it('martor POZITIV: tiparul L-10 prinde fraza pe care o vaneaza', () => {
    const fraza = 'Num' + 'ărul de înregistrare ca operator de date este 1.'
    expect(TIPAR_L10.test(normalizat(fraza))).toBe(true)
  })

  it('G-MD-10: autoritatile sunt numite corect, fiecare in blocul jurisdictiei ei', () => {
    const blocuri = sectiune(politica, '2d')?.blocuri ?? []
    const ro = blocuri.filter((b) => b.jurisdictie === 'ro').flatMap((b) => b.paragrafe).join(' ')
    const md = blocuri.filter((b) => b.jurisdictie === 'md').flatMap((b) => b.paragrafe).join(' ')
    expect(ro).toContain(AUTORITATI.ro.nume)
    expect(ro).not.toContain(AUTORITATI.md.sigla)
    expect(md).toContain(AUTORITATI.md.nume)
    expect(md).not.toContain(AUTORITATI.ro.sigla)
  })

  it('G-MD-11: fiecare furnizor are tara, iar cei din afara SEE un mecanism din lista inchisa', () => {
    for (const f of FURNIZORI) {
      expect(f.tara.length, f.serviciu).toBeGreaterThan(0)
      expect(MECANISME_UE).toContain(f.mecanismUe)
      expect(MECANISME_MD).toContain(f.mecanismMd)
      expect(f.mecanismUe === 'see', f.serviciu).toBe(f.inSee)
      expect(f.mecanismMd === 'see', f.serviciu).toBe(f.inSee)
      expect(f.transferUe.length, f.serviciu).toBeGreaterThan(40)
      expect(f.transferMd.length, f.serviciu).toBeGreaterThan(40)
    }
    const google = FURNIZORI.find((f) => f.cheie === 'analitica')
    expect(google).toMatchObject({ mecanismUe: 'dpf', mecanismMd: 'scc-2021-914' })
    expect(google?.transferUe).toContain('Data Privacy Framework')
    expect(google?.transferMd).toContain('2021/914')
    // Lista pentru Moldova e cea inchisa din G-MD-11: adecvarea Comisiei nu e in ea (Legea 195/2024 art. 45).
    expect([...MECANISME_MD].sort()).toEqual(['bcr', 'decizie-centru', 'derogare-art49', 'scc-2021-914', 'see'])
  })

  it('G-MD-14: drepturile, termenul de o luna si prelungirea cu doua luni, adresa pentru cereri', () => {
    const drepturi = normalizat(textSectiune(politica, '2b'))
    for (const d of ['acces', 'rectificare', 'stergere', 'restrictionare', 'portabilitate', 'opozitie', 'cui le-am comunicat']) {
      expect(drepturi, d).toContain(d)
    }
    expect(drepturi).toContain('o luna')
    expect(drepturi).toContain('doua luni')
    expect(drepturi).toContain('date@operator-3s.test')
  })

  /** Formularile interzise de G-MD-18, asamblate la rulare. */
  const INTERZISE = ['conform ' + 'gdpr', 'certificat ' + 'gdpr', 'privacy ' + 'shield', 'nivel ' + 'adecvat']

  it('G-MD-18: nicio atestare nedovedita si nicio adecvare pusa langa Moldova', () => {
    for (const d of [politica, cookie]) {
      const t = normalizat(textIntreg(d))
      for (const f of INTERZISE) expect(t, f).not.toContain(f)
      expect(/adecvar.{0,200}moldova|moldova.{0,200}adecvar/.test(t)).toBe(false)
    }
  })

  it('martor POZITIV: detectorul G-MD-18 prinde adecvarea pusa langa Moldova', () => {
    const t = normalizat('Datele pleaca in SUA pe baza deciziei de ' + 'adecvare, inclusiv pentru Republica Moldova.')
    expect(/adecvar.{0,200}moldova|moldova.{0,200}adecvar/.test(t)).toBe(true)
  })

  it('formularele au temei precontractual, nu consimtamant (L-05, G-MD-06)', () => {
    const t = normalizat(textIntreg(politica))
    expect(t).toContain('demersuri precontractuale')
    expect(/trimiterea\s+(acestui\s+)?formular\w*.{0,90}?consimt/.test(t)).toBe(false)
  })

  it('cookie-urile declarate sunt cele din panoul bannerului: alegerea si cele doua ale GA4', () => {
    const t = textSectiune(cookie, '2b')
    expect(t).toContain(COOKIE_ALEGERE.nume)
    expect(t).toContain('_ga')
    expect(t).toContain('2 ani')
  })
})
