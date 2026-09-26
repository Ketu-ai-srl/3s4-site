import { spawn, spawnSync, type ChildProcess } from 'node:child_process'
import { cpSync, existsSync, mkdtempSync, readdirSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs'
import { createServer } from 'node:net'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { expect, test, type Browser, type Page } from '@playwright/test'
import { citesteArticolele, indexRegistru, type ArticolComplet } from '../../src/content/blog/conducta'
import { ARTICOLE, caiArticole, type CategorieBlog } from '../../src/content/blog/registru'
import { ARTICOL, CATEGORII, LISTARE } from '../../src/content/blog/texte'
import { masoaraAccesibilitatea, masoaraHtmlBrut, masoaraLegaturiSiImagini } from './ajutor/detectori'
import { PRAG_PARITATE, masoaraParitatea, masoaraRaspunsul, type DeclaratieRaspuns } from './ajutor/geo'
import { RADACINA, nemasurat } from './ajutor/proiect'

/**
 * Felia `blog` (valul S4-4; plan §5.3, §6.10; COMPONENTE §4.13): conducta de continut, listarea,
 * categoriile si articolul, masurate in doua stari.
 *
 *   1. BUILD-UL REAL, in starea registrului, DERIVATA: cu registrul gol nicio pagina de blog nu
 *      exista; cu primul lot (felia blog-articole) listarea, categoriile si articolele dau 200, iar
 *      navigatia si harta de site duc spre ele. Probele pe articolele reale: `blog-articole.spec.ts`.
 *   2. O COPIE a site-ului cu 12 articole SINTETICE, asamblate la rulare in formatul lotului de
 *      articole (antet YAML + corp Markdown + citat `**3S**`) si scrise in `src/content/blog/` al
 *      copiei, in locul articolelor reale (scoase numai din copie), cu indexul `articole.json` regenerat prin aceeasi conducta. Doua controale cu esec
 *      zgomotos: fixtura a aterizat (fisierele si indexul copiei au exact cele 12 articole) si site-ul
 *      inca se construieste (build 0, iar manifestul de prerandare are listarea, 4 categorii si 12
 *      articole). Pe copie: listarea, cautarea fara diacritice, filtrul pe loc, categoriile, articolul
 *      (bara de progres, coloana, coperta, caseta de fapte, sursele, caseta CTA, inrudite), datele
 *      structurate, accesibilitatea la 1440 si 390, HTML-ul servit, paritatea si raspunsul GEO,
 *      legaturile, bugetele de performanta la 390 cu procesorul incetinit de 4 ori si poarta de SEO
 *      rulata pe build-ul copiei.
 *
 * Sursa site-ului nu se atinge: un articol de proba in `src/` ar ajunge pe site. Latimea ferestrei se
 * CITESTE din pagina la fiecare masuratoare de forma (`innerWidth`) si se tipareste.
 */

// ---------------------------------------------------------------------------------------------
// Articolele sintetice (asamblate la rulare)
// ---------------------------------------------------------------------------------------------

type Sintetic = { slug: string; titlu: string; extras: string; categorie: CategorieBlog; data: string; fapte: string[] }

const SINTETICE: Sintetic[] = [
  ['pastrarea-facturilor-electronice', 'Păstrarea facturilor primite electronic', 'Cum țineți facturile primite prin sistemul electronic, ca să le găsiți întregi și după câțiva ani de la primire.', 'contabilitate', '2026-09-12', 2],
  ['registrul-jurnal-pas-cu-pas', 'Registrul jurnal și cartea mare, pas cu pas', 'Ordinea în care se completează registrele contabile obligatorii și unde le păstrați după închiderea anului.', 'contabilitate', '2026-09-11', 0],
  ['extrasele-de-cont-la-inchidere', 'Extrasele de cont după închiderea exercițiului', 'Ce faceți cu extrasele de cont după închiderea exercițiului financiar și cât timp rămân în arhiva firmei.', 'contabilitate', '2026-09-10', 0],
  ['statele-de-salarii-lunare', 'Statele de salarii și dosarul lunar al firmei', 'Cum se adună statele de salarii într-un dosar lunar și de ce contează ordinea lor la un control al inspectorilor.', 'contabilitate', '2026-09-09', 0],
  ['nomenclatorul-arhivistic', 'Nomenclatorul arhivistic pentru o firmă mică', 'Ce este nomenclatorul arhivistic, cine îl aprobă și cum îl folosiți ca să știți unde stă fiecare dosar al firmei.', 'juridic', '2026-09-08', 4],
  ['comisia-de-selectionare', 'Comisia de selecționare: cine face parte din ea', 'Cine intră în comisia de selecționare a documentelor, ce semnează și ce pași urmează înainte de orice eliminare.', 'juridic', '2026-09-07', 0],
  ['predarea-la-arhiva-proprie', 'Predarea dosarelor la arhiva proprie a firmei', 'Când se predau dosarele la arhiva proprie, cu ce acte de însoțire și cine semnează procesul-verbal de predare.', 'juridic', '2026-09-06', 0],
  ['inventarul-fondului-de-arhiva', 'Inventarul unui fond de arhivă, rând cu rând', 'Coloanele inventarului unui fond de arhivă, cum se completează corect și câte exemplare trebuie să păstrați.', 'juridic', '2026-09-06', 0],
  ['actele-la-mutarea-sediului', 'Ce se întâmplă cu actele la mutarea sediului', 'Pașii pentru arhiva firmei când se mută sediul: ce anunțați, ce mutați și cum păstrați evidența dosarelor mutate.', 'juridic', '2026-09-04', 0],
  ['scanarea-cu-text-recunoscut', 'Scanarea cu text recunoscut, explicată simplu', 'Ce înseamnă scanarea cu text recunoscut, de ce contează la căutare și ce verificați la un document scanat vechi.', 'it', '2026-09-03', 0],
  ['denumirea-fisierelor-scanate', 'Denumirea fișierelor scanate într-o arhivă', 'O regulă simplă de denumire a fișierelor scanate, ca un coleg nou să găsească orice act fără să întrebe pe nimeni.', 'it', '2026-09-02', 0],
  ['calendar-anual-pentru-arhiva', 'Un calendar anual pentru arhiva firmei', 'Termenele care revin în fiecare an pentru arhiva unei firme mici, puse pe luni, ca să nu le aflați de la un control.', 'management', '2026-09-01', 0],
].map(([slug, titlu, extras, categorie, data, fapte]) => ({
  slug: slug as string,
  titlu: titlu as string,
  extras: extras as string,
  categorie: categorie as CategorieBlog,
  data: data as string,
  fapte: Array.from({ length: fapte as number }, (_, i) => 'Faptul ' + (i + 1) + ' al articolului, cu termenul și actul din care vine, într-o singură frază.'),
}))

/** Articolul masurat in detaliu: are caseta de fapte, tabel, liste si citatul CTA. */
const DE_MASURAT = SINTETICE[4]

function corpSintetic(a: Sintetic, i: number): string {
  const vecin = SINTETICE[(i + 1) % SINTETICE.length]
  const paragraf = (n: number) =>
    'Paragraful ' + n + ' explică pe larg ce are de făcut o firmă mică, cu exemple de acte reale, termene și pașii pe care îi urmează cine ține arhiva. ' +
    'Fraza a doua adaugă detalii despre dosare, registre și predarea lor, ca textul să aibă lungimea unui articol adevărat.'
  return [
    paragraf(1) + ' Vedeți și [articolul despre ' + vecin.titlu.toLowerCase() + '](/blog/' + vecin.slug + ').',
    '',
    '## Ce cere legea',
    '',
    paragraf(2),
    '',
    '1. Primul pas al procedurii, cu **actul** de însoțire.',
    '2. Al doilea pas, cu *semnătura* celui care predă.',
    '3. Al treilea pas, cu [textul oficial](https://legislatie.just.ro/Public/DetaliiDocument/' + (100 + i) + ').',
    '',
    '## Termenele pe tipuri de acte',
    '',
    '| Tip de document | Termen de păstrare | Temeiul |',
    '|---|---|---|',
    '| Registre contabile | 10 ani | legea contabilității |',
    '| Documente justificative | 5 ani | normele de aplicare |',
    '| Dosarele de personal | 75 de ani | legea arhivelor |',
    '',
    '## Greșeli frecvente',
    '',
    paragraf(3),
    '',
    '- Dosare fără inventar.',
    '- Acte distruse înainte de termen, fără [procedura potrivită](/solutii/avocatura).',
    '',
    paragraf(4),
    '',
    '> **3S** Textul casetei CTA al articolului ' + (i + 1) + ': actele încărcate primesc termenul lor, iar răspunsul vine pe web sau pe WhatsApp.',
  ].join('\n')
}

function articolSintetic(a: Sintetic, i: number): string {
  return [
    '---',
    'slug: ' + a.slug,
    'titlu: "' + a.titlu + '"',
    'extras: "' + a.extras + '"',
    'categorie: ' + a.categorie,
    'data_verificarii: ' + a.data,
    a.fapte.length === 0 ? 'caseta_fapte: []' : 'caseta_fapte:\n' + a.fapte.map((f) => '  - "' + f + '"').join('\n'),
    'surse:',
    '  - url: https://legislatie.just.ro/Public/DetaliiDocument/' + (200 + i),
    '    ce_sustine: "Textul consolidat al actului normativ citat în articol"',
    '  - url: https://www.exemplu-oficial.test/procedura-' + i,
    '    ce_sustine: "Pagina autorității care publică procedura"',
    '---',
    '',
    corpSintetic(a, i),
    '',
  ].join('\n')
}

// ---------------------------------------------------------------------------------------------
// Copia site-ului, cu articolele sintetice
// ---------------------------------------------------------------------------------------------

type CopieBlog = { baza: string; director: string; articole: ArticolComplet[]; opreste: () => Promise<void> }

const DE_COPIAT = ['src', 'public', 'config', 'package.json', 'pnpm-lock.yaml', 'next.config.ts', 'tsconfig.json', 'postcss.config.mjs']

async function portLiber(): Promise<number> {
  return new Promise((gata, esec) => {
    const s = createServer()
    s.once('error', esec)
    s.listen(0, '127.0.0.1', () => {
      const adresa = s.address()
      const port = typeof adresa === 'object' && adresa ? adresa.port : 0
      s.close(() => gata(port))
    })
  })
}

function coada(text: string): string {
  return text.length > 3000 ? '...' + text.slice(-3000) : text
}

function mediu(): NodeJS.ProcessEnv {
  return { ...process.env, BUILD_STANDALONE: '', NEXT_TELEMETRY_DISABLED: '1', SITE_ENV: 'local' }
}

function ruleaza(comanda: string[], cwd: string): Promise<{ cod: number | null; iesire: string }> {
  return new Promise((gata) => {
    const copil = spawn(process.execPath, comanda, { cwd, env: mediu() })
    let iesire = ''
    copil.stdout.on('data', (b) => (iesire += String(b)))
    copil.stderr.on('data', (b) => (iesire += String(b)))
    copil.on('error', (e) => gata({ cod: null, iesire: iesire + '\n' + String(e) }))
    copil.on('close', (cod) => gata({ cod, iesire }))
  })
}

function opresteProcesul(copil: ChildProcess): void {
  if (copil.pid === undefined || copil.exitCode !== null) return
  if (process.platform === 'win32') {
    // Arborele procesului pornit de proba, si numai el.
    spawnSync('taskkill', ['/pid', String(copil.pid), '/T', '/F'], { stdio: 'ignore' })
  } else {
    try {
      process.kill(-copil.pid, 'SIGTERM')
    } catch {
      copil.kill('SIGTERM')
    }
  }
}

async function pornesteCopiaBlog(): Promise<CopieBlog> {
  const director = mkdtempSync(join(tmpdir(), 'blog-'))
  const sterge = () => rmSync(director, { recursive: true, force: true })
  let server: ChildProcess | null = null
  const laIesire = () => server && opresteProcesul(server)
  process.once('exit', laIesire)
  try {
    for (const intrare of DE_COPIAT) {
      const sursa = join(RADACINA, intrare)
      if (!existsSync(sursa)) throw new Error('copia nu se poate face: lipseste ' + sursa)
      cpSync(sursa, join(director, intrare), { recursive: true })
    }
    symlinkSync(join(RADACINA, 'node_modules'), join(director, 'node_modules'), 'junction')

    const dosar = join(director, 'src', 'content', 'blog')
    // Copia masoara conducta pe o multime CUNOSCUTA: articolele reale ale sursei se scot din copie
    // (numai din copie), altfel controlul 1 ar numara si primul lot (felia blog-articole).
    for (const f of readdirSync(dosar).filter((n) => n.endsWith('.mdx'))) rmSync(join(dosar, f))
    SINTETICE.forEach((a, i) => writeFileSync(join(dosar, a.slug + '.mdx'), articolSintetic(a, i), 'utf8'))
    const articole = citesteArticolele(director)
    writeFileSync(join(dosar, 'articole.json'), JSON.stringify(indexRegistru(articole), null, 2) + '\n', 'utf8')

    // Controlul 1: fixtura a aterizat, in fisiere si in indexul pe care il citeste navigatia.
    const mdx = readdirSync(dosar).filter((f) => f.endsWith('.mdx'))
    const index = JSON.parse(readFileSync(join(dosar, 'articole.json'), 'utf8')) as { slug: string }[]
    if (mdx.length !== SINTETICE.length || index.length !== SINTETICE.length) {
      throw new Error('controlul 1 a picat: copia are ' + mdx.length + ' fisiere .mdx si ' + index.length + ' intrari in index, nu ' + SINTETICE.length)
    }

    // Controlul 2: site-ul inca se construieste, cu paginile blogului prerandate.
    const next = join(director, 'node_modules', 'next', 'dist', 'bin', 'next')
    const build = await ruleaza([next, 'build', '--no-lint'], director)
    if (build.cod !== 0) throw new Error('controlul 2 a picat: build-ul copiei a iesit ' + build.cod + '\n' + coada(build.iesire))

    const port = await portLiber()
    const baza = 'http://127.0.0.1:' + port
    let jurnal = ''
    const pornit = spawn(process.execPath, [next, 'start', '--hostname', '127.0.0.1', '--port', String(port)], {
      cwd: director,
      env: mediu(),
      detached: process.platform !== 'win32',
    })
    server = pornit
    pornit.stdout?.on('data', (b) => (jurnal += String(b)))
    pornit.stderr?.on('data', (b) => (jurnal += String(b)))
    const termen = Date.now() + 60_000
    for (;;) {
      if (pornit.exitCode !== null) throw new Error('serverul copiei s-a oprit cu ' + pornit.exitCode + '\n' + coada(jurnal))
      try {
        if ((await fetch(baza + '/')).ok) break
      } catch {
        // inca porneste
      }
      if (Date.now() > termen) throw new Error('serverul copiei nu raspunde in 60 s\n' + coada(jurnal))
      await new Promise((r) => setTimeout(r, 250))
    }

    return {
      baza,
      director,
      articole,
      opreste: async () => {
        opresteProcesul(pornit)
        process.removeListener('exit', laIesire)
        for (let i = 0; i < 20; i++) {
          try {
            sterge()
            return
          } catch {
            await new Promise((r) => setTimeout(r, 250))
          }
        }
        sterge()
      },
    }
  } catch (e) {
    if (server) opresteProcesul(server)
    process.removeListener('exit', laIesire)
    try {
      sterge()
    } catch {
      // copia ramane in directorul temporar; eroarea de mai jos e cea care conteaza
    }
    throw e
  }
}

// ---------------------------------------------------------------------------------------------
// Ajutoare de masurare
// ---------------------------------------------------------------------------------------------

async function latime(page: Page): Promise<number> {
  return page.evaluate(() => window.innerWidth)
}

async function coloaneGrila(page: Page, selector: string): Promise<number> {
  return page.locator(selector).first().evaluate((el) => getComputedStyle(el).gridTemplateColumns.split(' ').filter(Boolean).length)
}

async function jsonLd(page: Page): Promise<Record<string, unknown>[]> {
  const blocuri = await page.locator('script[type="application/ld+json"]').allTextContents()
  return blocuri
    .map((t) => JSON.parse(t) as Record<string, unknown>)
    .flatMap((b) => (Array.isArray(b['@graph']) ? (b['@graph'] as Record<string, unknown>[]) : [b]))
}

/**
 * Capturi de FEREASTRA (sus si doua pozitii mai jos), numai cand `BLOG_CAPTURI` numeste un dosar:
 * pentru privirea lor langa capturile referintei, la 1440 si 390. Fara variabila nu se scrie nimic.
 */
async function captura(page: Page, nume: string): Promise<void> {
  const dosar = process.env.BLOG_CAPTURI
  if (!dosar) return
  const inaltime = await page.evaluate(() => document.documentElement.scrollHeight)
  const fereastra = await page.evaluate(() => window.innerHeight)
  const pozitii = [0, Math.round(fereastra * 0.9), Math.round(fereastra * 1.8)].filter((y, i) => i === 0 || y < inaltime - fereastra / 2)
  for (const [i, y] of pozitii.entries()) {
    await page.evaluate((v) => window.scrollTo(0, v), y)
    await page.waitForTimeout(300)
    await page.screenshot({ path: join(dosar, nume + '-0' + i + '.png') })
  }
  await page.evaluate(() => window.scrollTo(0, 0))
}

const CARD_L = '[data-card="L"]'
const CARD_C = '[data-card="C"]'
const CARD_INRUDIT = '[data-card="inrudit"]'
/** Ordinea de afisare a pastilelor (blog.md 3b si §B: latimile 79/130/191/125/131 si 73/127/191/121/128). */
const ORDINE_PASTILE = (['contabilitate', 'juridic', 'it', 'management'] as const).map((c) => CATEGORII[c].nume)
const LA_390 = { width: 390, height: 844 }
const LA_1440 = { width: 1440, height: 900 }

// Bugetele din plan, la 390 cu procesorul incetinit de 4 ori; aceleasi praguri ca in probele
// celorlalte felii. Metricile de timp se iau ca MEDIANA a 3 rulari CURATE, fiecare precedata de o
// pagina-martor. De ce: pe statia incarcata de alti agenti (procesor la 85-100%) aceeasi listare, fara
// nicio schimbare de cod, a dat INP intre 96 si 800 ms si LCP intre 768 si 4212 ms (masurat 25.09);
// ACEEASI munca a paginii a luat 95 ms de scripturi intr-o rulare si 375 ms in alta. Martorul separa
// masina de pagina: cu martorul curat INP-ul listarii a ramas 128-280 ms, iar descompunerea de mai jos
// a aratat cauza in pagina (asezarea fortata din clicul pe „mai multe articole", vezi antetul lui
// `ListareBlog.tsx`). Dupa reparatie, cu martorul curat: 56-72 ms.
const INCETINIRE_CPU = 4
const PRAG_LCP_MS = 2500
const PRAG_CLS = 0.1
const PRAG_INP_MS = 200

type Buget = { lcp: number; cls: number; inp: number; celMaiLung: string; innerWidth: number }

/** Pagina-martor a masinii, servita de proba insasi (interceptata), pe originea copiei. */
const CALE_MARTOR = '/__martor-bugete-blog'
/** Un titlu, un paragraf si un buton care schimba un cuvant; fara fonturi, fara CSS extern. */
const HTML_MARTOR =
  '<!doctype html><html lang="ro"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">' +
  '<title>Martor</title></head><body style="margin:0;font:16px system-ui"><main style="padding:48px 16px">' +
  '<h1 style="font-size:40px;line-height:1.2;margin:0">Un titlu de doua randuri, cat al unei listari</h1>' +
  '<p id="stare">Un paragraf scurt.</p><button type="button" id="apasa">Apasa</button></main>' +
  '<script>document.getElementById("apasa").addEventListener("click", function () { document.getElementById("stare").textContent = "Apasat" })</script>' +
  '</body></html>'
/**
 * Pragurile martorului. LCP: pagina-martor a probei `cinema-1`, de aceeasi forma, are 64-176 ms cu
 * masina libera (relatat de acea proba, masurat 25.09). Clicul: un handler de o linie se picteaza in
 * cadrul urmator, deci peste 100 ms masina e ocupata de altceva. Rularea de dupa un martor peste
 * prag se arunca si se reia; fara 3 rulari curate din 8, masuratoarea e NEMASURATA, nu rosie.
 */
const PRAG_MARTOR_LCP_MS = 250
const PRAG_MARTOR_INP_MS = 100
const RULARI_CURATE = 3
const INCERCARI = 8

// ---------------------------------------------------------------------------------------------
// 1. Build-ul real, in starea registrului (derivata: gol sau cu articole)
// ---------------------------------------------------------------------------------------------

// Starea se DERIVA din registrul real, nu se scrie de mana: azi e gol, iar ziua primului lot de
// articole probele de aici trec singure pe ramura cealalta, in loc sa se inroseasca pe lucrul corect.
const REGISTRU_GOL = ARTICOLE.length === 0

test.describe('build-ul real, in starea registrului (' + (REGISTRU_GOL ? 'gol' : ARTICOLE.length + ' articole') + ')', () => {
  const existente = caiArticole()
  const cautate = REGISTRU_GOL ? ['/blog', '/blog/categorie/juridic', '/blog/' + DE_MASURAT.slug] : existente

  for (const cale of cautate) {
    test('pagina ' + cale + (REGISTRU_GOL ? ' nu exista (404)' : ' exista (200)'), async ({ request }) => {
      const r = await request.get(cale, { failOnStatusCode: false })
      console.log('[blog, build real] ' + cale + ' -> ' + r.status())
      expect(r.status()).toBe(REGISTRU_GOL ? 404 : 200)
    })
  }

  test('o adresa de blog care nu e in registru e 404', async ({ request }) => {
    const r = await request.get('/blog/articol-sintetic-inexistent', { failOnStatusCode: false })
    expect(r.status()).toBe(404)
  })

  test('navigatia si harta de site duc spre blog numai cand exista articole', async ({ page, request }) => {
    await page.setViewportSize(LA_1440)
    await page.goto('/', { waitUntil: 'domcontentloaded' })
    const spreBlog = await page.locator('a[href="/blog"]').count()
    const harta = await (await request.get('/sitemap.xml')).text()
    console.log('[blog, build real] innerWidth ' + (await latime(page)) + ' | legaturi spre /blog pe start: ' + spreBlog + ' | articole in harta: ' + ARTICOLE.filter((a) => harta.includes('/blog/' + a.slug)).length)
    if (REGISTRU_GOL) {
      expect(spreBlog).toBe(0)
      expect(harta).not.toContain('/blog')
    } else {
      expect(spreBlog).toBeGreaterThan(0)
      for (const c of existente) expect(harta, c).toContain(c + '</loc>')
    }
  })
})

// ---------------------------------------------------------------------------------------------
// 2. Copia cu 12 articole sintetice
// ---------------------------------------------------------------------------------------------

test.describe('copia cu articole sintetice', () => {
  let copie: CopieBlog

  test.beforeAll(async () => {
    // Build-ul copiei: cateva minute pe statia comuna; plafonul acopera o masina de CI mai lenta.
    test.setTimeout(900_000)
    copie = await pornesteCopiaBlog()
  })

  test.afterAll(async () => {
    await copie?.opreste()
  })

  const url = (cale: string) => copie.baza + cale

  test('controlul copiei: manifestul de prerandare are listarea, cele 4 categorii si cele 12 articole', () => {
    const manifest = JSON.parse(readFileSync(join(copie.director, '.next', 'prerender-manifest.json'), 'utf8')) as {
      routes: Record<string, unknown>
    }
    const blog = Object.keys(manifest.routes).filter((r) => r.startsWith('/blog')).sort()
    console.log('[blog, copie] rute prerandate: ' + blog.length + ' | ' + blog.join(', '))
    const asteptat = [
      '/blog',
      ...(['contabilitate', 'it', 'juridic', 'management'] as const).map((c) => '/blog/categorie/' + c),
      ...SINTETICE.map((a) => '/blog/' + a.slug),
    ].sort()
    expect(blog).toEqual(asteptat)
  })

  test('martor NEGATIV: pe copie o pagina de articol exista (200), deci 404-ul de pe build-ul real e al registrului gol', async ({ request }) => {
    const r = await request.get(url('/blog/' + DE_MASURAT.slug), { failOnStatusCode: false })
    expect(r.status()).toBe(200)
  })

  test('martor POZITIV: o adresa de blog care nu e in registru ramane 404 si pe copie', async ({ request }) => {
    const r = await request.get(url('/blog/articol-care-nu-exista'), { failOnStatusCode: false })
    const r2 = await request.get(url('/blog/categorie/fiscal'), { failOnStatusCode: false })
    expect(r.status()).toBe(404)
    expect(r2.status()).toBe(404)
  })

  test('listarea la 1440: antet centrat, cautare 480 x 44, 5 pastile, grila de 3 cu 9 carduri, apoi toate 12', async ({ page }) => {
    await page.setViewportSize(LA_1440)
    await page.goto(url('/blog'), { waitUntil: 'networkidle' })
    const w = await latime(page)
    const h1 = page.locator('main h1')
    await expect(h1).toHaveText(LISTARE.titlu)
    const antet = await h1.evaluate((el) => ({ marime: getComputedStyle(el).fontSize, aliniere: getComputedStyle(el.parentElement as Element).alignItems }))
    const cautare = await page.locator('#cautare-blog').boundingBox()
    const pastile = page.locator('nav[aria-label="' + LISTARE.etichetaPastile + '"] a')
    const card = await page.locator(CARD_L).first().boundingBox()
    console.log('[blog L 1440] innerWidth ' + w + ' | h1 ' + antet.marime + ' | cautare ' + cautare?.width + ' x ' + cautare?.height + ' | card ' + card?.width + ' x ' + card?.height)
    expect(w).toBe(1440)
    expect(antet.marime).toBe('40px')
    expect(antet.aliniere).toBe('center')
    expect(cautare?.width).toBe(480)
    expect(cautare?.height).toBe(44)
    await expect(pastile).toHaveCount(5)
    expect(await pastile.allTextContents()).toEqual([LISTARE.toate, ...ORDINE_PASTILE])
    await expect(page.locator(CARD_L)).toHaveCount(9)
    // Cardul L: 417 la referinta (3e), cu titlul si extrasul pe 2 randuri; primul rand de carduri le are.
    // Butonul „mai multe": pastila de 44 (3f).
    const buton = await page.getByRole('button', { name: LISTARE.maiMulte }).boundingBox()
    console.log('[blog L 1440] card h ' + card?.height + ' | buton ' + buton?.width + ' x ' + buton?.height)
    expect(Math.abs((card?.height ?? 0) - 417)).toBeLessThan(1.5)
    expect(Math.abs((buton?.height ?? 0) - 44)).toBeLessThan(1)
    expect(await coloaneGrila(page, '[data-card="L"] >> xpath=..')).toBe(3)
    expect(Math.abs((card?.width ?? 0) - 370.67)).toBeLessThan(2)
    await captura(page, 'blog-L-1440')

    await page.getByRole('button', { name: LISTARE.maiMulte }).click()
    await expect(page.locator(CARD_L)).toHaveCount(12)
    await expect(page.getByRole('button', { name: LISTARE.maiMulte })).toHaveCount(0)
    // Focusul trece pe primul card nou, nu ramane pe un buton disparut. Pagina urmatoare e o
    // tranzitie, deci focusul se muta dupa ce cardurile s-au pictat: asteptarea e cu reincercare.
    await expect(page.locator('[data-card-index="9"]')).toBeFocused()
  })

  test('listarea la 390: o coloana de 358, pastile de 34, cautarea pe toata latimea', async ({ page }) => {
    await page.setViewportSize(LA_390)
    await page.goto(url('/blog'), { waitUntil: 'networkidle' })
    const w = await latime(page)
    const card = await page.locator(CARD_L).first().boundingBox()
    const cautare = await page.locator('#cautare-blog').boundingBox()
    const pastila = await page.locator('nav[aria-label="' + LISTARE.etichetaPastile + '"] a').first().boundingBox()
    const h1 = await page.locator('main h1').evaluate((el) => getComputedStyle(el).fontSize)
    console.log('[blog L 390] innerWidth ' + w + ' | card ' + card?.width + ' | cautare ' + cautare?.width + ' | pastila h ' + pastila?.height + ' | h1 ' + h1)
    expect(w).toBe(390)
    expect(await coloaneGrila(page, '[data-card="L"] >> xpath=..')).toBe(1)
    expect(Math.round(card?.width ?? 0)).toBe(358)
    expect(Math.round(cautare?.width ?? 0)).toBe(358)
    expect(Math.round(pastila?.height ?? 0)).toBe(34)
    expect(h1).toBe('30px')
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
    await captura(page, 'blog-L-390')
  })

  test('cautarea potriveste fara diacritice, arata contorul si starea goala', async ({ page }) => {
    await page.setViewportSize(LA_1440)
    await page.goto(url('/blog'), { waitUntil: 'networkidle' })
    const camp = page.getByLabel(LISTARE.etichetaCautare)
    await camp.fill('pastrarea')
    await expect(page.locator(CARD_L)).toHaveCount(1)
    await expect(page.locator(CARD_L)).toContainText('Păstrarea facturilor primite electronic')
    await expect(page.getByText('1 articol găsit')).toBeVisible()
    await camp.fill('selectionare')
    await expect(page.locator(CARD_L)).toHaveCount(1)
    await camp.fill('zzqqxx')
    await expect(page.locator(CARD_L)).toHaveCount(0)
    await expect(page.getByText(LISTARE.gol)).toBeVisible()
    await expect(page.getByText('Niciun articol găsit')).toBeVisible()
    await camp.fill('')
    await expect(page.locator(CARD_L)).toHaveCount(9)
  })

  // Pentru `no-preference` tranzitia de vedere a site-ului intercepteaza legaturile spre ALT pathname;
  // o pastila spre pagina categoriei ar ajunge acolo in loc sa filtreze. Configuratia comuna fixeaza
  // `reduce`, deci cazul obisnuit se masoara intr-un context propriu.
  for (const miscare of ['reduce', 'no-preference'] as const) {
    test('pastilele filtreaza pe loc si tin categoria in adresa; accesul direct da aceeasi stare (miscare ' + miscare + ')', async ({ browser }) => {
      const context = await browser.newContext({ viewport: LA_1440, reducedMotion: miscare })
      try {
        const page = await context.newPage()
        await page.goto(url('/blog'), { waitUntil: 'networkidle' })
        // Controlul contextului: la `no-preference` tranzitia chiar poate porni (API prezent, fara reduce).
        const mediu = await page.evaluate(() => ({
          api: typeof (document as { startViewTransition?: unknown }).startViewTransition === 'function',
          reduce: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
          w: window.innerWidth,
        }))
        console.log('[blog pastile ' + miscare + '] innerWidth ' + mediu.w + ' | startViewTransition ' + mediu.api + ' | reduce ' + mediu.reduce)
        expect(mediu.reduce).toBe(miscare === 'reduce')
        if (miscare === 'no-preference') expect(mediu.api).toBe(true)
        const nav = page.locator('nav[aria-label="' + LISTARE.etichetaPastile + '"]')
        await nav.getByRole('link', { name: CATEGORII.it.nume }).click()
        await expect(page).toHaveURL(/\/blog\?categorie=it$/)
        await expect(page.locator(CARD_L)).toHaveCount(2)
        await expect(page.locator('main h1')).toHaveText(LISTARE.titlu)
        await expect(nav.getByRole('link', { name: CATEGORII.it.nume })).toHaveAttribute('aria-current', 'true')
        // Tranzitia ar schimba ruta dupa clic, nu in el: dupa 1,5 s pagina e tot listarea filtrata.
        await page.waitForTimeout(1500)
        await expect(page).toHaveURL(/\/blog\?categorie=it$/)
        await expect(page.locator(CARD_L)).toHaveCount(2)
        await page.reload({ waitUntil: 'networkidle' })
        await expect(page.locator(CARD_L)).toHaveCount(2)
        await expect(page.getByText('2 articole găsite')).toBeVisible()
        await nav.getByRole('link', { name: LISTARE.toate }).click()
        await expect(page).toHaveURL(/\/blog$/)
        await expect(page.locator(CARD_L)).toHaveCount(9)
      } finally {
        await context.close()
      }
    })
  }

  test('categoria la 1440 si 390: eticheta, pastile la stanga cu cea activa pe albastru, contor, toate articolele, grila 3 / 1', async ({ page }) => {
    await page.setViewportSize(LA_1440)
    await page.goto(url('/blog/categorie/juridic'), { waitUntil: 'networkidle' })
    const w = await latime(page)
    await expect(page.locator('main h1')).toHaveText(CATEGORII.juridic.nume)
    await expect(page.locator(CARD_C)).toHaveCount(5)
    await expect(page.getByText('5 articole', { exact: true })).toBeVisible()
    const activa = page.locator('a[aria-current="page"]', { hasText: CATEGORII.juridic.nume })
    const fundal = await activa.evaluate((el) => getComputedStyle(el).backgroundColor)
    const prima = await page.locator('main nav ul').last().locator('a').first().boundingBox()
    const container = await page.locator('main .container-site').last().boundingBox()
    console.log('[blog C 1440] innerWidth ' + w + ' | activa ' + fundal + ' | prima pastila x ' + prima?.x + ' | container x ' + container?.x)
    expect(fundal).toBe('rgb(37, 99, 235)')
    expect((await page.locator('main nav ul').last().locator('a').allTextContents()).slice(1)).toEqual(ORDINE_PASTILE)
    expect(Math.abs((prima?.x ?? 0) - ((container?.x ?? 0) + 24))).toBeLessThan(1.5)
    expect(await coloaneGrila(page, '[data-card="C"] >> xpath=..')).toBe(3)
    await captura(page, 'blog-C-1440')

    await page.setViewportSize(LA_390)
    await page.goto(url('/blog/categorie/juridic'), { waitUntil: 'networkidle' })
    const w2 = await latime(page)
    const card = await page.locator(CARD_C).first().boundingBox()
    console.log('[blog C 390] innerWidth ' + w2 + ' | card ' + card?.width)
    expect(w2).toBe(390)
    expect(await coloaneGrila(page, '[data-card="C"] >> xpath=..')).toBe(1)
    expect(Math.round(card?.width ?? 0)).toBe(358)
    await captura(page, 'blog-C-390')
  })

  test('articolul la 1440: bara de progres, coloana de 720, coperta 16:9, caseta de fapte, tabel, surse, caseta CTA, 3 inrudite', async ({ page }) => {
    await page.setViewportSize(LA_1440)
    await page.goto(url('/blog/' + DE_MASURAT.slug), { waitUntil: 'networkidle' })
    const w = await latime(page)
    const bara = page.locator('[data-vizibila]')
    const inainte = await bara.evaluate((el) => {
      const c = getComputedStyle(el)
      return { pozitie: c.position, inaltime: c.height, strat: c.zIndex, opacitate: c.opacity }
    })
    // Drumul barei e inaltimea corpului minus fereastra. Se deruleaza la jumatatea LUI, nu a corpului:
    // la un corp scurt o fractiune din corp poate depasi deja drumul si bara ar fi plina (scala 1).
    // Derularea e instantanee, altfel `scroll-behavior: smooth` ar da o citire din mijlocul animatiei.
    const geometrie = await page.locator('#corp-articol').evaluate((el) => {
      const y = el.getBoundingClientRect().top + window.scrollY
      const h = (el as HTMLElement).offsetHeight
      return { y, h, drum: h - window.innerHeight }
    })
    expect(geometrie.drum).toBeGreaterThan(100)
    await page.evaluate((tinta) => window.scrollTo({ top: tinta, behavior: 'instant' }), geometrie.y + geometrie.drum / 2)
    await expect(bara).toHaveAttribute('data-vizibila', 'da')
    await expect.poll(() => bara.evaluate((el) => new DOMMatrix(getComputedStyle(el).transform).a)).toBeCloseTo(0.5, 1)
    const scala = await bara.evaluate((el) => new DOMMatrix(getComputedStyle(el).transform).a)
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }))
    const coloana = await page.locator('main h1').evaluate((el) => (el.parentElement as HTMLElement).getBoundingClientRect().width)
    const coperta = await page.locator('main article svg[viewBox="0 0 1200 630"]').first().boundingBox()
    const fapte = page.getByText(ARTICOL.fapte, { exact: true })
    const cta = await page.locator('section[aria-labelledby="cta-titlu"]').evaluate((el) => ({
      latime: el.getBoundingClientRect().width,
      fundal: getComputedStyle(el).backgroundColor,
    }))
    console.log('[blog articol 1440] innerWidth ' + w + ' | bara ' + JSON.stringify(inainte) + ' | corp ' + JSON.stringify(geometrie) + ' | scala la jumatatea drumului ' + scala.toFixed(3) + ' | coloana ' + coloana + ' | coperta ' + coperta?.width + ' x ' + coperta?.height + ' | cta ' + JSON.stringify(cta))
    expect(w).toBe(1440)
    expect(inainte).toEqual({ pozitie: 'fixed', inaltime: '2.5px', strat: '1300', opacitate: '0' })
    expect(scala).toBeCloseTo(0.5, 1)
    expect(coloana).toBe(720)
    expect(Math.abs((coperta?.width ?? 0) / (coperta?.height ?? 1) - 16 / 9)).toBeLessThan(0.02)
    await expect(fapte).toBeVisible()
    await expect(page.locator('section[aria-labelledby="fapte-titlu"] li')).toHaveCount(4)
    await expect(page.locator('#corp-articol table')).toHaveCount(1)
    await expect(page.locator('section[aria-labelledby="surse-titlu"] li')).toHaveCount(2)
    expect(cta.latime).toBe(720)
    expect(cta.fundal).toBe('rgb(15, 23, 42)')
    await expect(page.locator(CARD_INRUDIT)).toHaveCount(3)
    expect(await coloaneGrila(page, '[data-card="inrudit"] >> xpath=..')).toBe(3)
    const inrudit = await page.locator(CARD_INRUDIT).first().boundingBox()
    console.log('[blog articol 1440] inrudit h ' + inrudit?.height)
    expect(Math.abs((inrudit?.height ?? 0) - 387)).toBeLessThan(1.5)
    // Inruditele: intai aceeasi categorie.
    await expect(page.locator(CARD_INRUDIT).first()).toContainText('Comisia de selecționare')
    await captura(page, 'blog-articol-1440')
  })

  test('articolul la 390: coloana de 358, caseta CTA cu padding 28 si butonul pe un rand, inruditele pe o coloana', async ({ page }) => {
    await page.setViewportSize(LA_390)
    await page.goto(url('/blog/' + DE_MASURAT.slug), { waitUntil: 'networkidle' })
    const w = await latime(page)
    const coloana = await page.locator('main h1').evaluate((el) => (el.parentElement as HTMLElement).getBoundingClientRect().width)
    const cta = await page.locator('section[aria-labelledby="cta-titlu"]').evaluate((el) => getComputedStyle(el).paddingLeft)
    // Butonul e tinta inerta sau legatura, dupa cum exista /inregistrare (felia conversie); se masoara oricare ar fi.
    const buton = await page.locator('section[aria-labelledby="cta-titlu"] :is([data-tinta-lipsa="/inregistrare"], a[href="/inregistrare"])').boundingBox()
    console.log('[blog articol 390] innerWidth ' + w + ' | coloana ' + coloana + ' | cta padding ' + cta + ' | buton ' + buton?.width + ' x ' + buton?.height)
    expect(w).toBe(390)
    expect(Math.round(coloana)).toBe(358)
    expect(cta).toBe('28px')
    expect(buton?.height).toBeLessThanOrEqual(54)
    expect(await coloaneGrila(page, '[data-card="inrudit"] >> xpath=..')).toBe(1)
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
    await captura(page, 'blog-articol-390')
  })

  test('datele structurate: ItemList cu toate articolele, BreadcrumbList o singura data, BlogPosting cu wordCount masurat', async ({ page }) => {
    await page.goto(url('/blog'))
    const listare = await jsonLd(page)
    const lista = listare.find((n) => n['@type'] === 'ItemList')
    expect(lista?.numberOfItems).toBe(12)
    expect(listare.filter((n) => n['@type'] === 'BreadcrumbList')).toHaveLength(1)

    await page.goto(url('/blog/categorie/it'))
    const categorie = await jsonLd(page)
    expect(categorie.find((n) => n['@type'] === 'ItemList')?.numberOfItems).toBe(2)
    expect(categorie.filter((n) => n['@type'] === 'BreadcrumbList')).toHaveLength(1)

    await page.goto(url('/blog/' + DE_MASURAT.slug))
    const articol = await jsonLd(page)
    const post = articol.find((n) => n['@type'] === 'BlogPosting')
    const masurat = copie.articole.find((a) => a.slug === DE_MASURAT.slug)
    console.log('[blog JSON-LD] wordCount ' + post?.wordCount + ' | conducta ' + masurat?.cuvinte)
    expect(post?.wordCount).toBe(masurat?.cuvinte)
    expect(post?.datePublished).toBe(DE_MASURAT.data)
    expect(articol.filter((n) => n['@type'] === 'BreadcrumbList')).toHaveLength(1)
    expect(await page.locator('meta[property="og:type"]').getAttribute('content')).toBe('article')
  })

  for (const [nume, cale] of [
    ['listarea', '/blog'],
    ['categoria', '/blog/categorie/juridic'],
    ['articolul', '/blog/' + DE_MASURAT.slug],
  ] as const) {
    for (const fereastra of [LA_1440, LA_390]) {
      test('accesibilitatea: ' + nume + ' la ' + fereastra.width + ' nu are incalcari serious sau critical', async ({ page }) => {
        await page.setViewportSize(fereastra)
        await page.goto(url(cale), { waitUntil: 'networkidle' })
        const m = await masoaraAccesibilitatea(page)
        console.log('[blog axe] ' + cale + ' innerWidth ' + (await latime(page)) + ' | reguli ' + m.reguliRulate + ' | blocante ' + m.grave.map((g) => g.regula).join(', '))
        expect(m.grave.map((g) => g.regula)).toEqual([])
      })
    }

    test('HTML-ul servit, paritatea si legaturile: ' + nume, async ({ browser, page }) => {
      const brut = await masoaraHtmlBrut(browser, url(cale))
      const paritate = await masoaraParitatea(browser, url(cale))
      await page.goto(url(cale), { waitUntil: 'networkidle' })
      const legaturi = await masoaraLegaturiSiImagini(page)
      console.log(
        '[blog servit] ' + cale + ' | paragrafe lipsa fara JS ' + brut.paragrafeLipsa.length + ' | paritate ' + paritate.acoperire.toFixed(4) +
          ' din ' + paritate.propozitii + ' | legaturi interne ' + legaturi.legaturiInterne + ', moarte ' + legaturi.legaturiMoarte.length,
      )
      expect(brut.titluFaraJs).toBe(brut.titluCuJs)
      expect(brut.paragrafeLipsa).toEqual([])
      expect(paritate.acoperire).toBeGreaterThanOrEqual(PRAG_PARITATE)
      expect(legaturi.legaturiMoarte).toEqual([])
      expect(legaturi.ancoreMoarte).toEqual([])
    })
  }

  test('raspunsul listarii (G-AI-02), cu declaratia din config/seo/blog.json', async ({ browser }) => {
    const fisier = JSON.parse(readFileSync(join(RADACINA, 'config', 'seo', 'blog.json'), 'utf8')) as {
      raspuns_autonom: Record<string, DeclaratieRaspuns>
    }
    const m = await masoaraRaspunsul(browser, url('/blog'), fisier.raspuns_autonom['/blog'])
    console.log('[blog G-AI-02] cuvinte in main ' + m.cuvinteMain + ' | abateri ' + (m.abateri.join('; ') || '(niciuna)'))
    expect(m.abateri).toEqual([])
  })

  test('antetul apare in 0,45 s; la miscare redusa e vizibil direct', async ({ browser }) => {
    for (const miscare of ['no-preference', 'reduce'] as const) {
      const context = await browser.newContext({ reducedMotion: miscare, viewport: LA_1440 })
      const pagina = await context.newPage()
      await pagina.goto(url('/blog'), { waitUntil: 'domcontentloaded' })
      const durata = await pagina.locator('[data-aparitie]').evaluate((el) => {
        const a = el.getAnimations()[0]
        return a ? Number(a.effect?.getComputedTiming().duration ?? 0) : 0
      })
      await expect(pagina.locator('[data-aparitie]')).toHaveCSS('opacity', '1')
      console.log('[blog aparitie] ' + miscare + ' | durata animatiei ' + durata + ' ms')
      if (miscare === 'reduce') expect(durata).toBeLessThan(1)
      else expect(durata).toBe(450)
      await context.close()
    }
  })

  test('tastatura: din cautare, Tab trece prin pastile si ajunge pe primul card, cu focus vizibil', async ({ page }) => {
    await page.setViewportSize(LA_1440)
    await page.goto(url('/blog'), { waitUntil: 'networkidle' })
    await page.getByLabel(LISTARE.etichetaCautare).focus()
    for (let i = 0; i < 6; i++) await page.keyboard.press('Tab')
    const focus = await page.evaluate(() => {
      const el = document.activeElement as HTMLElement
      return { index: el.getAttribute('data-card-index'), contur: getComputedStyle(el, '::after').outlineStyle }
    })
    console.log('[blog tastatura] ' + JSON.stringify(focus))
    expect(focus).toEqual({ index: '0', contur: 'solid' })
  })

  /**
   * O incarcare proaspata la 390, in context nou, cu procesorul incetinit si miscarea permisa (cazul
   * greu): LCP, CLS si cea mai lunga interactiune (Event Timing, ca INP), cu descompunerea ei:
   * asteptare / handler / pana la cadru. O depasire din asteptare arata masina incarcata, una din
   * handler arata codul. Pe listare interactiunile sunt „mai multe articole", clicul in cautare si
   * scrierea unui cuvant; articolul nu are alt control decat legaturi, deci acolo INP iese 0. Pe
   * pagina-martor (`CALE_MARTOR`) interactiunea e clicul pe singurul buton.
   * `blocajMs` e martorul pozitiv: fiecare apasare tine firul principal ocupat atatea ms.
   */
  async function masoaraBugetul(browser: Browser, cale: string, blocajMs = 0): Promise<Buget> {
    const context = await browser.newContext({ viewport: LA_390, reducedMotion: 'no-preference' })
    try {
      if (cale === CALE_MARTOR) {
        await context.route('**' + CALE_MARTOR, (r) => r.fulfill({ status: 200, contentType: 'text/html; charset=utf-8', body: HTML_MARTOR }))
      }
      const pagina = await context.newPage()
      const cdp = await context.newCDPSession(pagina)
      await cdp.send('Emulation.setCPUThrottlingRate', { rate: INCETINIRE_CPU })
      await pagina.addInitScript((blocaj: number) => {
        type Eveniment = { name: string; duration: number; interactionId?: number; startTime: number; processingStart: number; processingEnd: number; target?: Element | null }
        type Cadru = { startTime: number; duration: number; renderStart: number; styleAndLayoutStart: number; scripts?: { duration: number }[] }
        const w = window as unknown as { __lcp: number; __cls: number; __inp: number; __cel: string; __fereastra: number[]; __cadre: Cadru[] }
        w.__lcp = 0
        w.__cls = 0
        w.__inp = 0
        w.__cel = ''
        w.__fereastra = [0, 0]
        w.__cadre = []
        new PerformanceObserver((l) => {
          for (const e of l.getEntries()) w.__lcp = e.startTime
        }).observe({ type: 'largest-contentful-paint', buffered: true })
        new PerformanceObserver((l) => {
          for (const e of l.getEntries() as unknown as { value: number; hadRecentInput: boolean }[]) if (!e.hadRecentInput) w.__cls += e.value
        }).observe({ type: 'layout-shift', buffered: true })
        new PerformanceObserver((l) => {
          for (const e of l.getEntries() as unknown as Eveniment[]) {
            if (!e.interactionId || e.duration <= w.__inp) continue
            w.__inp = e.duration
            w.__fereastra = [e.startTime, e.startTime + e.duration]
            const asteptare = Math.round(e.processingStart - e.startTime)
            const handler = Math.round(e.processingEnd - e.processingStart)
            const tinta = e.target ? e.target.tagName.toLowerCase() + ' ' + (e.target.textContent ?? '').trim().slice(0, 24) : '?'
            w.__cel = e.name + ' pe ' + tinta + ' | asteptare ' + asteptare + ' handler ' + handler + ' pana la cadru ' + Math.round(e.duration - asteptare - handler)
          }
        }).observe({ type: 'event', buffered: true, durationThreshold: 16 } as PerformanceObserverInit)
        // Cadrele lungi de pe firul principal spun unde s-a dus „pana la cadru": in scripturi sau in
        // stil, asezare si pictare. Daca interactiunea e lunga si niciun cadru nu e, timpul s-a pierdut
        // in afara firului principal (compozitor, rasterizare, planificarea masinii).
        try {
          new PerformanceObserver((l) => {
            for (const e of l.getEntries()) w.__cadre.push(e as unknown as Cadru)
          }).observe({ type: 'long-animation-frame', buffered: true })
        } catch {
          // navigatorul nu stie cadrele lungi: descompunerea ramane doar cea din Event Timing
        }
        if (blocaj > 0) {
          window.addEventListener(
            'pointerdown',
            () => {
              const t = performance.now()
              while (performance.now() - t < blocaj) {
                // firul principal ramane ocupat: exact ce trebuie sa prinda masuratoarea
              }
            },
            true,
          )
        }
      }, blocajMs)
      await pagina.goto(url(cale), { waitUntil: 'load' })
      await pagina.waitForTimeout(1500)
      if (cale === CALE_MARTOR) {
        await pagina.locator('#apasa').click()
      } else if (cale === '/blog') {
        await pagina.getByRole('button', { name: LISTARE.maiMulte }).click()
        await pagina.getByLabel(LISTARE.etichetaCautare).click()
        await pagina.keyboard.type('arhiva', { delay: 60 })
      } else {
        await pagina.mouse.wheel(0, 1500)
        await pagina.locator(CARD_INRUDIT).first().hover()
      }
      await pagina.waitForTimeout(800)
      return await pagina.evaluate(() => {
        type Script = { duration: number; invoker?: string; invokerType?: string; sourceFunctionName?: string; sourceURL?: string; forcedStyleAndLayoutDuration?: number }
        type Cadru = { startTime: number; duration: number; renderStart: number; styleAndLayoutStart: number; scripts?: Script[] }
        const w = window as unknown as { __lcp: number; __cls: number; __inp: number; __cel: string; __fereastra: number[]; __cadre: Cadru[] }
        const [de, pana] = w.__fereastra
        const cadre = w.__cadre
          .filter((c) => c.startTime < pana && c.startTime + c.duration > de)
          .map((c) => {
            const sfarsit = c.startTime + c.duration
            const scripturi = Math.round((c.scripts ?? []).reduce((s, x) => s + x.duration, 0))
            const randare = c.renderStart > 0 ? Math.round(sfarsit - c.renderStart) : 0
            const stil = c.styleAndLayoutStart > 0 ? Math.round(sfarsit - c.styleAndLayoutStart) : 0
            // Cele mai lungi scripturi ale cadrului: cine le-a pornit, functia si fisierul, plus
            // asezarea FORTATA din ele (un `focus()` sau o citire de geometrie o face pe loc).
            const top = [...(c.scripts ?? [])]
              .sort((a, b) => b.duration - a.duration)
              .slice(0, 3)
              .map((x) => {
                const fisier = (x.sourceURL ?? '').split('/').pop() ?? ''
                return (x.invokerType ?? '?') + ' ' + (x.invoker ?? '?') + ' ' + (x.sourceFunctionName || '?') + '@' + fisier + ' ' + Math.round(x.duration) + ' ms, fortat ' + Math.round(x.forcedStyleAndLayoutDuration ?? 0)
              })
            return Math.round(c.duration) + ' ms (scripturi ' + scripturi + ', randare ' + randare + ', din care stil, asezare, pictare ' + stil + '; ' + top.join(' / ') + ')'
          })
        const detaliu = w.__inp === 0 ? '' : cadre.length > 0 ? ' | cadre lungi: ' + cadre.join('; ') : ' | niciun cadru lung pe firul principal'
        return { lcp: Math.round(w.__lcp), cls: Number(w.__cls.toFixed(4)), inp: Math.round(w.__inp), celMaiLung: w.__cel + detaliu, innerWidth: window.innerWidth }
      })
    } finally {
      await context.close()
    }
  }

  /**
   * Rulari curate ale unei pagini: fiecare masuratoare e precedata de pagina-martor, in aceleasi
   * conditii, si se pastreaza numai daca martorul a iesit sub ambele praguri. Se opreste la 3 curate.
   */
  async function rulariCurate(browser: Browser, cale: string): Promise<{ curate: Buget[]; aruncate: Buget[]; martori: string[] }> {
    const curate: Buget[] = []
    const aruncate: Buget[] = []
    const martori: string[] = []
    for (let i = 0; i < INCERCARI && curate.length < RULARI_CURATE; i++) {
      const m = await masoaraBugetul(browser, CALE_MARTOR)
      martori.push(m.lcp + '/' + m.inp)
      const r = await masoaraBugetul(browser, cale)
      if (m.innerWidth === 390 && m.lcp > 0 && m.lcp <= PRAG_MARTOR_LCP_MS && m.inp <= PRAG_MARTOR_INP_MS) curate.push(r)
      else aruncate.push(r)
    }
    return { curate, aruncate, martori }
  }

  test('bugetele la 390 cu procesorul incetinit de 4 ori: LCP <= 2,5 s si INP <= 200 ms (mediana a 3 rulari curate), CLS <= 0,1 (maximul)', async ({ browser }) => {
    test.setTimeout(900_000)
    const mediana = (valori: number[]) => [...valori].sort((a, b) => a - b)[1]
    for (const cale of ['/blog', '/blog/' + DE_MASURAT.slug]) {
      const { curate, aruncate, martori } = await rulariCurate(browser, cale)
      console.log(
        '[blog bugete 390 CPU x' + INCETINIRE_CPU + '] ' + cale + ' | martor LCP/INP (ms): ' + martori.join(' ; ') +
          ' | aruncate ' + JSON.stringify(aruncate) + ' | curate ' + JSON.stringify(curate),
      )
      if (curate.length < RULARI_CURATE) {
        nemasurat(
          cale + ': numai ' + curate.length + ' rulari curate din ' + INCERCARI + ' (martor LCP/INP: ' + martori.join(' ; ') +
            ' ms; praguri ' + PRAG_MARTOR_LCP_MS + '/' + PRAG_MARTOR_INP_MS + ' ms): masina e ocupata, pagina nu e masurata',
        )
      }
      const lcp = mediana(curate.map((r) => r.lcp))
      const inp = mediana(curate.map((r) => r.inp))
      const cls = Math.max(...curate.map((r) => r.cls))
      console.log('[blog bugete 390 CPU x' + INCETINIRE_CPU + '] ' + cale + ' | mediana LCP ' + lcp + ' | mediana INP ' + inp + ' | CLS maxim ' + cls)
      for (const r of curate) {
        expect(r.innerWidth).toBe(390)
        expect(r.lcp).toBeGreaterThan(0)
      }
      expect(lcp).toBeLessThanOrEqual(PRAG_LCP_MS)
      expect(cls).toBeLessThanOrEqual(PRAG_CLS)
      expect(inp).toBeLessThanOrEqual(PRAG_INP_MS)
    }
  })

  test('martor POZITIV: pe listare, o apasare tinuta 250 ms pe firul principal TREBUIE vazuta peste 200 ms', async ({ browser }) => {
    test.setTimeout(120_000)
    const r = await masoaraBugetul(browser, '/blog', 250)
    console.log('[blog bugete martor pozitiv] ' + JSON.stringify(r))
    expect(r.innerWidth).toBe(390)
    expect(r.inp).toBeGreaterThan(PRAG_INP_MS)
  })

  test('poarta de SEO, rulata pe build-ul copiei, trece pe paginile blogului', async () => {
    test.setTimeout(120_000)
    const python = process.platform === 'win32' ? 'python' : 'python3'
    const r = spawnSync(python, [join(RADACINA, '.claude', 'scripts', 'porti', 'poarta-seo.py'), '--radacina', copie.director], {
      encoding: 'utf8',
    })
    const iesire = (r.stdout ?? '') + (r.stderr ?? '')
    const sursa = /SURSA: (\d+) pagina/.exec(iesire)?.[1]
    console.log('[blog poarta SEO pe copie] cod ' + r.status + ' | pagini ' + sursa + '\n' + iesire.split('\n').filter((l) => /OPRESTE|AVERT|DEFECTE/.test(l)).join('\n'))
    expect(iesire).toContain('/blog/' + DE_MASURAT.slug)
    expect(iesire).toContain('/blog/categorie/juridic')
    expect(r.status).toBe(0)
  })
})

// Sursa site-ului ramane neatinsa: niciun articol de proba nu ajunge in `src/`, nici in index.
test('sursa ramane neatinsa: articolele sintetice nu sunt in registrul real', () => {
  const dosar = join(RADACINA, 'src', 'content', 'blog')
  const sintetice = new Set(SINTETICE.map((a) => a.slug))
  expect(readdirSync(dosar).filter((f) => sintetice.has(f.replace(/\.mdx$/, '')))).toEqual([])
  expect((JSON.parse(readFileSync(join(dosar, 'articole.json'), 'utf8')) as { slug: string }[]).filter((a) => sintetice.has(a.slug))).toEqual([])
})
