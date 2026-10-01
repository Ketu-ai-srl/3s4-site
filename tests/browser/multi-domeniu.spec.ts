import { spawn, spawnSync, type ChildProcess } from 'node:child_process'
import { cpSync, existsSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync, symlinkSync } from 'node:fs'
import { createServer, type IncomingMessage, type Server, type ServerResponse } from 'node:http'
import type { AddressInfo } from 'node:net'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import type { Page } from '@playwright/test'
import { expect, test } from './ajutor/baza'
import { PALETA } from '../../src/content/navigatie'
import { masoaraTerti, stocareNedeclarata } from './ajutor/detectori'
import { RADACINA, nemasurat } from './ajutor/proiect'

/**
 * Proba feliei MULTI-DOMENIU (planul valului S4, §8-§10): acelasi cod, construit pentru alt domeniu, cu
 * variabilele lui, intr-o COPIE a site-ului (ca `comutator.spec.ts`): SITE_URL=https://3s.md, operatorul
 * din OPERATOR_JSON, SITE_ALTERNATE cu trei variante, analitica proprie (UMAMI_URL + UMAMI_WEBSITE_ID) spre o
 * instanta FALSA de pe masina locala, INDEXNOW_KEY, plus GA4 cu bannerul, ca sa se vada ca nu se calca.
 * Copia e construita pe `SITE_ENV=productie`: pe mediul de proba `robots.txt` interzice tot si nu poarta nicio
 * adresa, deci "zero aparitii ale domeniului de proba" ar fi trecut si fara nicio schimbare.
 *
 * CE SE MASOARA, pe build-ul real si pe copie:
 *   1. alternatele hreflang in `<head>`-ul servit (fara JavaScript), pe trei rute, scrise pe server de
 *      `metadataPagina` din editia paginii si din tabelul de echivalente (felia metadata-hreflang; regula veche
 *      "aceeasi cale pe fiecare varianta" s-a retras): o pagina romaneasca fara echivalent se listeaza numai pe
 *      ea insasi (codul editiei, `ro-RO`) si x-default, cu adresa egala cu `canonical`; nicio legatura spre
 *      celelalte domenii din lista (P-17); la navigarea din browser se schimba odata cu calea; pagina de negasit
 *      nu primeste;
 *   2. analitica: scriptul si evenimentele merg numai spre originea site-ului, instanta le primeste prin proxy,
 *      niciun cookie si nicio cheie de stocare scrisa, Do Not Track opreste trimiterea; C-01 (zero terti) ramane
 *      verde cu analitica pornita si prinde o pagina care ar incarca trackerul direct de la instanta;
 *   2b. analitica fara operator: o a doua copie, cu `UMAMI_*` si FARA operator (fisierul are `null`, mediul nu
 *      il numeste), nu are script, nu are rescrierile `/a/`, nu trimite nimic la instanta, iar jurnalul
 *      build-ului spune de ce (planul §9: analitica prelucreaza date personale, deci cere operator);
 *   3. operatorul din mediu: paginile juridice cu paragraful despre analitica, harta, subsolul, formularul care
 *      chiar trimite, cautarea Ctrl+K care le gaseste (pachetul de browser nu vede `OPERATOR_JSON`, dar vede
 *      valoarea calculata de `next.config.ts`); un operator incomplet opreste build-ul, cu campurile care lipsesc;
 *   4. `/indexnow.txt` cu cheie (copia) si fara ea (build-ul real);
 *   5. domeniul: zero aparitii ale gazdei de proba in `.next/server/app`, harta, robots, llms.txt, security.txt
 *      si JSON-LD, iar aceeasi numarare pe build-ul real chiar le gaseste.
 * Fara variabile (build-ul real): nimic din toate acestea nu exista in pagina.
 *
 * INSTANTA FALSA reproduce ce face trackerul real in ce priveste PAGINA (citit pe 2026-09-30 din scriptul
 * servit de instanta noastra, detaliul in `src/components/analitica/config.ts`): adresa de trimitere din
 * directorul lui `src`, `credentials: "omit"`, din stocare citeste numai `umami.disabled`, respecta
 * `data-do-not-track`. Proba masoara ce face pagina noastra, nu aplicatia lor.
 *
 * FIXTURILE se asambleaza la RULARE, din bucati (operatorul pe `.test`, identificatorul si cheia sintetice).
 */

const ID_SITE = ['3f2b8c1e', '5a4d', '4c3b', '9e7f', '0a1b2c3d4e5f'].join('-')
const CHEIE_INDEXNOW = ['exemplu', 'cheie', 'indexnow', '3s'].join('-')
const ID_GA4 = ['G', 'MULTIDOM' + String(69)].join('-')
const GAZDA_PROBA = ['3s4', 'ke2', 'in'].join('.')

const RO = 'https://3s.com.ro'
const INT = 'https://3s.md'
const LISTA_ALTERNATE = ['ro-RO=' + RO, 'en=' + INT, 'ro-MD=' + INT + '/ro', 'x-default=' + INT].join(',')

const OPERATOR = {
  denumire: ['Operator', 'Sintetic', 'Domeniu', 'SRL'].join(' '),
  sediu: ['Strada Exemplului 1', 'Pitesti'].join(', '),
  email: ['date', ['operator-3s', 'test'].join('.')].join('@'),
  telefon: '',
  numar_orc: '',
  cod_fiscal: '',
  tara: 'România',
  dpo: '',
}

/** Rutele pe care se masoara alternatele: radacina (cazul special), o pagina statica, o categorie cu trei segmente. */
const RUTE_ALTERNATE = ['/', '/preturi', '/blog/categorie/it']

/** Cele opt pagini juridice, in ordinea documentului de porti. */
const PAGINI_JURIDICE = ['/juridic', ...['informatii-legale', 'confidentialitate', 'termeni', 'cookies', 'politici-publice', 'licenta-software', 'subimputerniciti'].map((s) => '/juridic/' + s)]

// ---------------------------------------------------------------------------------------------
// Instanta de statistica falsa si serverul de fixturi
// ---------------------------------------------------------------------------------------------

type Primit = { metoda: string; url: string; cookie: string | null; corp: string }

/** Trackerul-model: ce face scriptul real pe partea paginii, in cateva randuri. */
const TRACKER_MODEL = [
  '(function(){',
  'var cs=document.currentScript; if(!cs) return;',
  "var website=cs.getAttribute('data-website-id');",
  "var dnt=cs.getAttribute('data-do-not-track')==='true';",
  "var host=cs.getAttribute('data-host-url');",
  "var base=host||cs.src.split('/').slice(0,-1).join('/');",
  "if(base.slice(-1)==='/')base=base.slice(0,-1);",
  "var endpoint=base+'/api/send';",
  "var off=function(){return !website||(window.localStorage&&window.localStorage.getItem('umami.disabled'))||(dnt&&[1,'1','yes'].indexOf(window.doNotTrack||navigator.doNotTrack||navigator.msDoNotTrack)>=0)};",
  "var send=function(t,p){if(off())return;fetch(endpoint,{keepalive:true,method:'POST',body:JSON.stringify({type:t,payload:p}),headers:{'Content-Type':'application/json'},credentials:'omit'}).catch(function(){})};",
  "send('event',{website:website,url:location.href,referrer:document.referrer,title:document.title,language:navigator.language,screen:screen.width+'x'+screen.height,hostname:location.hostname});",
  '})();',
].join('\n')

type Fixturi = {
  /** Originea instantei false (`http://127.0.0.1:port`). */
  instanta: string
  /** Originea serverului de fixturi (alta origine decat instanta si decat site-ul). */
  fixturi: string
  primite: Primit[]
  /** Trimiterile de formular primite la destinatie, ca JSON. */
  formulare: Record<string, unknown>[]
  opreste: () => Promise<void>
}

function asculta(server: Server): Promise<number> {
  return new Promise((gata) => server.listen(0, '127.0.0.1', () => gata((server.address() as AddressInfo).port)))
}

async function pornesteFixturile(): Promise<Fixturi> {
  const primite: Primit[] = []
  const formulare: Record<string, unknown>[] = []
  const citeste = (c: IncomingMessage) =>
    new Promise<string>((gata) => {
      let corp = ''
      c.on('data', (b) => (corp += b))
      c.on('end', () => gata(corp))
    })

  const instanta = createServer(async (c: IncomingMessage, r: ServerResponse) => {
    const corp = await citeste(c)
    primite.push({ metoda: c.method ?? '', url: c.url ?? '', cookie: c.headers.cookie ?? null, corp })
    if (c.url === '/script.js') {
      r.setHeader('content-type', 'application/javascript; charset=utf-8')
      return void r.end(TRACKER_MODEL)
    }
    if (c.url === '/api/send' && c.method === 'POST') {
      r.setHeader('content-type', 'application/json')
      return void r.end('{"ok":true}')
    }
    r.statusCode = 404
    r.end()
  })
  const portInstanta = await asculta(instanta)

  const fixturi = createServer(async (c: IncomingMessage, r: ServerResponse) => {
    const corp = await citeste(c)
    if (c.url === '/directa') {
      // O pagina care incarca trackerul direct de la instanta: exact ce ar face un site fara calea proprie
      r.setHeader('content-type', 'text/html; charset=utf-8')
      return void r.end(
        '<!doctype html><html lang="ro"><head><meta charset="utf-8"><title>fixtura</title></head><body><h1>Fixtura</h1>' +
          '<script defer src="http://127.0.0.1:' + portInstanta + '/script.js" data-website-id="' + ID_SITE + '"></script></body></html>',
      )
    }
    if (c.url === '/formulare' && c.method === 'POST') {
      formulare.push(JSON.parse(corp))
      r.statusCode = 200
      return void r.end('{}')
    }
    r.statusCode = 404
    r.end()
  })
  const portFixturi = await asculta(fixturi)

  return {
    instanta: 'http://127.0.0.1:' + portInstanta,
    fixturi: 'http://127.0.0.1:' + portFixturi,
    primite,
    formulare,
    opreste: () =>
      Promise.all([instanta, fixturi].map((s) => new Promise((gata) => s.close(gata)))).then(() => undefined),
  }
}

// ---------------------------------------------------------------------------------------------
// Copia site-ului, cu variabilele unui domeniu
// ---------------------------------------------------------------------------------------------

const DE_COPIAT = ['src', 'public', 'config', 'package.json', 'pnpm-lock.yaml', 'next.config.ts', 'tsconfig.json', 'postcss.config.mjs']

/** Variabilele feliei si ale domeniului: se sterg din mediul mostenit, ca masina sa nu poata schimba proba. */
const VARIABILE_DOMENIU = [
  'SITE_URL', 'SITE_ENV', 'SITE_EDITII', 'SITE_ALTERNATE', 'OPERATOR_JSON', 'UMAMI_URL', 'UMAMI_WEBSITE_ID', 'INDEXNOW_KEY',
  'NEXT_PUBLIC_GA4_ID', 'FORMULARE_DESTINATIE', 'FORMULARE_SECRET', 'GOOGLE_SITE_VERIFICATION', 'BASIC_AUTH_USER', 'BASIC_AUTH_PASS',
]

function mediu(extra: Record<string, string>): NodeJS.ProcessEnv {
  const m: NodeJS.ProcessEnv = { ...process.env, BUILD_STANDALONE: '', NEXT_TELEMETRY_DISABLED: '1' }
  for (const v of VARIABILE_DOMENIU) delete m[v]
  return { ...m, ...extra }
}

function coada(text: string): string {
  return text.length > 3000 ? '...' + text.slice(-3000) : text
}

function opresteProcesul(copil: ChildProcess): void {
  if (copil.pid === undefined || copil.exitCode !== null) return
  if (process.platform === 'win32') {
    spawnSync('taskkill', ['/pid', String(copil.pid), '/T', '/F'], { stdio: 'ignore' })
  } else {
    try {
      process.kill(-copil.pid, 'SIGTERM')
    } catch {
      copil.kill('SIGTERM')
    }
  }
}

function ruleaza(comanda: string[], cwd: string, env: NodeJS.ProcessEnv): Promise<{ cod: number | null; iesire: string }> {
  return new Promise((gata) => {
    const copil = spawn(process.execPath, comanda, { cwd, env })
    let iesire = ''
    copil.stdout.on('data', (b) => (iesire += String(b)))
    copil.stderr.on('data', (b) => (iesire += String(b)))
    copil.on('error', (e) => gata({ cod: null, iesire: iesire + '\n' + String(e) }))
    copil.on('close', (cod) => gata({ cod, iesire }))
  })
}

type Copie = {
  director: string
  baza: string
  /** Jurnalul serverului copiei (stdout si stderr), la zi. */
  jurnal: () => string
  /** Tot ce a scris `next build` al copiei: avertismentele lui sunt parte din ce se masoara. */
  iesireBuild: string
  opreste: () => Promise<void>
}

/** Copiaza sursa intr-un director temporar si leaga `node_modules` printr-o jonctiune. */
function pregateste(): string {
  const director = mkdtempSync(join(tmpdir(), 'multi-domeniu-'))
  for (const intrare of DE_COPIAT) {
    const sursa = join(RADACINA, intrare)
    if (!existsSync(sursa)) throw new Error('copia nu se poate face: lipseste ' + sursa)
    cpSync(sursa, join(director, intrare), { recursive: true })
  }
  symlinkSync(join(RADACINA, 'node_modules'), join(director, 'node_modules'), 'junction')
  return director
}

const cliNext = (director: string) => join(director, 'node_modules', 'next', 'dist', 'bin', 'next')

async function stergeCuReincercari(director: string): Promise<void> {
  // Windows elibereaza fisierele procesului oprit cu o mica intarziere.
  for (let i = 0; i < 20; i++) {
    try {
      rmSync(director, { recursive: true, force: true })
      return
    } catch {
      await new Promise((r) => setTimeout(r, 250))
    }
  }
  rmSync(director, { recursive: true, force: true })
}

async function portLiber(): Promise<number> {
  const s = createServer()
  const port = await asculta(s)
  await new Promise((gata) => s.close(gata))
  return port
}

/** Construieste si porneste copia domeniului. Arunca, cu motivul, daca build-ul sau serverul nu merg. */
async function pornesteCopia(env: Record<string, string>): Promise<Copie> {
  const director = pregateste()
  let server: ChildProcess | null = null
  const laIesire = () => server && opresteProcesul(server)
  process.once('exit', laIesire)
  try {
    const build = await ruleaza([cliNext(director), 'build', '--no-lint'], director, mediu(env))
    if (build.cod !== 0) throw new Error('build-ul copiei a iesit ' + build.cod + '\n' + coada(build.iesire))
    const port = await portLiber()
    const baza = 'http://127.0.0.1:' + port
    let jurnal = ''
    const pornit = spawn(process.execPath, [cliNext(director), 'start', '--hostname', '127.0.0.1', '--port', String(port)], {
      cwd: director,
      env: mediu(env),
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
      director,
      baza,
      jurnal: () => jurnal,
      iesireBuild: build.iesire,
      opreste: async () => {
        opresteProcesul(pornit)
        process.removeListener('exit', laIesire)
        await stergeCuReincercari(director)
      },
    }
  } catch (e) {
    if (server) opresteProcesul(server)
    process.removeListener('exit', laIesire)
    try {
      await stergeCuReincercari(director)
    } catch {
      // eroarea de mai jos e cea care conteaza
    }
    throw e
  }
}

// ---------------------------------------------------------------------------------------------
// Stare comuna
// ---------------------------------------------------------------------------------------------

let fixturi: Fixturi
let copie: Copie

test.beforeAll(async () => {
  // Build-ul copiei: ~1-2 min pe statia libera; plafonul acopera o masina incarcata.
  test.setTimeout(420_000)
  fixturi = await pornesteFixturile()
  copie = await pornesteCopia({
    SITE_ENV: 'productie',
    // Site-ul ROMANESC construit pe gazda internationala, ca sa se masoare alternatele si domeniul: profilul se
    // scrie EXPLICIT, altfel verificarea de coerenta a editiilor (`src/lib/editii.ts`) opreste construirea, pe
    // drept, fiindca lista de alternate numeste gazda asta pentru en si ro-MD.
    SITE_EDITII: 'ro-RO',
    SITE_URL: INT,
    OPERATOR_JSON: JSON.stringify({ operator: OPERATOR }),
    SITE_ALTERNATE: LISTA_ALTERNATE,
    UMAMI_URL: fixturi.instanta,
    UMAMI_WEBSITE_ID: ID_SITE,
    INDEXNOW_KEY: CHEIE_INDEXNOW,
    NEXT_PUBLIC_GA4_ID: ID_GA4,
    FORMULARE_DESTINATIE: fixturi.fixturi + '/formulare',
  })
})

test.afterAll(async () => {
  await copie?.opreste()
  await fixturi?.opreste()
})

/**
 * Deschide o pagina si asteapta linistea retelei fara sa depinda de ea (o pagina cu cereri continue nu trebuie sa
 * blocheze proba): incarcarea documentului, apoi cel mult cat tine `networkidle`.
 */
async function deschide(page: Page, adresa: string): Promise<void> {
  await page.goto(adresa, { waitUntil: 'domcontentloaded' })
  await page.waitForLoadState('networkidle').catch(() => {})
}

/** HTML-ul unei pagini, cerut fara JavaScript. */
async function html(baza: string, cale: string): Promise<string> {
  const r = await fetch(baza + cale)
  if (r.status !== 200) nemasurat(baza + cale + ': ' + r.status)
  return r.text()
}

/** Legaturile `<link rel="alternate" hreflang>` din `<head>`: hreflang -> href, in ordinea din pagina. */
function alternateDinHtml(pagina: string): [string, string][] {
  const head = pagina.slice(0, pagina.indexOf('</head>'))
  const iesire: [string, string][] = []
  for (const m of head.matchAll(/<link\b[^>]*>/gi)) {
    const eticheta = m[0]
    if (!/\brel="alternate"/i.test(eticheta)) continue
    const cod = /\bhreflang="([^"]*)"/i.exec(eticheta)?.[1]
    const href = /\bhref="([^"]*)"/i.exec(eticheta)?.[1]
    if (cod !== undefined && href !== undefined) iesire.push([cod, href])
  }
  return iesire
}

/**
 * Ce trebuie sa emita o pagina a copiei, scris independent de cod: site-ul romanesc (editia `ro-RO`) pe gazda
 * internationala, fara echivalente in tabel, deci numai pagina insasi, cu codul editiei ei, si x-default spre ea.
 * Radacina fara bara finala.
 */
function asteptate(cale: string): [string, string][] {
  const sfarsit = cale === '/' ? '' : cale
  return [
    ['ro-RO', INT + sfarsit],
    ['x-default', INT + sfarsit],
  ]
}

const PRIMIT_POST = (p: Primit) => p.metoda === 'POST' && p.url === '/api/send'

/**
 * Evenimentele primite de instanta falsa pentru adresa data, DUPA pozitia `desde` din jurnalul ei (numai
 * ce a produs pasul curent, nu ce au lasat testele de dinainte). Asteapta pana apare unul, cel mult `asteapta` ms.
 */
async function evenimentePentru(adresa: string, desde: number, asteapta = 6000): Promise<Record<string, string>[]> {
  const termen = Date.now() + asteapta
  const gasite = () =>
    fixturi.primite
      .slice(desde)
      .filter(PRIMIT_POST)
      .map((p) => JSON.parse(p.corp) as { payload: Record<string, string> })
      .filter((p) => p.payload.url === adresa)
      .map((p) => p.payload)
  while (Date.now() < termen && gasite().length === 0) await new Promise((r) => setTimeout(r, 200))
  return gasite()
}

// ---------------------------------------------------------------------------------------------
// 1. Alternatele hreflang
// ---------------------------------------------------------------------------------------------

test('copie: alternatele hreflang sunt in <head>-ul servit fara JavaScript, pe trei rute, cu auto-referinta egala cu canonical', async () => {
  for (const cale of RUTE_ALTERNATE) {
    const pagina = await html(copie.baza, cale)
    const gasite = alternateDinHtml(pagina)
    console.log('[hreflang] ' + cale + ' -> ' + gasite.map(([c, h]) => c + ' ' + h).join(' | '))
    expect(gasite, cale).toEqual(asteptate(cale))
    // auto-referinta: adresa paginii insesi, cu codul editiei ei, e canonical-ul paginii
    const canonical = /<link rel="canonical" href="([^"]+)"/.exec(pagina)?.[1]
    expect(canonical, cale + ': canonical').toBe(gasite.find(([c]) => c === 'ro-RO')?.[1])
    // fara `//` in afara schemei, si fara bara finala pe radacina
    for (const [, href] of gasite) expect(href.replace(/^https:\/\//, ''), href).not.toContain('//')
    // Nicio legatura spre celelalte domenii ale listei (P-17: reciproca n-ar exista), desi lista le numeste
    expect(gasite.some(([, h]) => h.startsWith(RO)), cale + ': spre ' + RO).toBe(false)
    expect(LISTA_ALTERNATE).toContain(RO)
  }
})

test('martor POZITIV: alternatele urmeaza calea la navigarea din browser, fara reincarcare, iar cele vechi dispar', async ({ page }) => {
  const erori: string[] = []
  page.on('pageerror', (e) => erori.push(String(e)))
  await deschide(page, copie.baza + '/')
  const citeste = () => page.evaluate(() => [...document.head.querySelectorAll('link[rel="alternate"]')].map((l) => [l.getAttribute('hreflang'), l.getAttribute('href')]))
  expect(await citeste()).toEqual(asteptate('/'))
  await page.evaluate(() => {
    ;(window as unknown as { __marcaj: string }).__marcaj = 'fara-reincarcare'
  })
  await page.locator('header a[href="/preturi"]').first().click()
  await page.waitForURL('**/preturi')
  await expect.poll(citeste, { timeout: 8000 }).toEqual(asteptate('/preturi'))
  // Controlul navigarii din browser: pagina nu s-a reincarcat, deci alternatele s-au schimbat prin React, nu prin HTML nou
  expect(await page.evaluate(() => (window as unknown as { __marcaj?: string }).__marcaj)).toBe('fara-reincarcare')
  expect(await page.evaluate(() => document.head.querySelectorAll('link[rel="alternate"][hreflang]').length)).toBe(asteptate('/preturi').length)
  expect(erori).toEqual([])
})

test('martor NEGATIV: pagina de negasit nu primeste alternate, nici in HTML-ul servit, nici dupa hidratare', async ({ page }) => {
  const raspuns = await fetch(copie.baza + '/o-cale-care-nu-exista')
  expect(raspuns.status).toBe(404)
  expect(alternateDinHtml(await raspuns.text())).toEqual([])
  await deschide(page, copie.baza + '/o-cale-care-nu-exista')
  await page.waitForTimeout(1500)
  expect(await page.evaluate(() => document.head.querySelectorAll('link[rel="alternate"]').length)).toBe(0)
  // Controlul: aceeasi pagina de browser, pe o ruta care exista, are alternatele ei
  await deschide(page, copie.baza + '/preturi')
  expect(await page.evaluate(() => document.head.querySelectorAll('link[rel="alternate"][hreflang]').length)).toBe(asteptate('/preturi').length)
})

test('copie: consola browserului ramane curata (fara erori de hidratare) pe pagini cu formular, cu documente juridice si cu banner', async ({ page }) => {
  test.setTimeout(180_000)
  const probleme: string[] = []
  page.on('console', (m) => {
    if (m.type() === 'error' || m.type() === 'warning') probleme.push(m.type() + ': ' + m.text())
  })
  page.on('pageerror', (e) => probleme.push('pageerror: ' + String(e)))
  for (const cale of ['/', '/contact', '/inregistrare', '/juridic/confidentialitate', '/juridic/cookies']) {
    const r = await page.goto(copie.baza + cale, { waitUntil: 'domcontentloaded' })
    expect(r?.status(), cale).toBe(200)
    await page.waitForLoadState('networkidle').catch(() => {})
    await page.waitForTimeout(800)
  }
  expect(probleme).toEqual([])
})

// ---------------------------------------------------------------------------------------------
// 2. Analitica proprie, fara cookie
// ---------------------------------------------------------------------------------------------

test('martor POZITIV: analitica - scriptul vine de pe originea site-ului, iar evenimentul ajunge la instanta prin proxy', async ({ browser }) => {
  const context = await browser.newContext()
  const page = await context.newPage()
  const cereri: string[] = []
  page.on('request', (r) => cereri.push(r.url()))
  const inainte = fixturi.primite.length
  await deschide(page, copie.baza + '/preturi')
  const evenimente = await evenimentePentru(copie.baza + '/preturi', inainte)

  // Ce a facut BROWSERUL: cerere numai catre originea site-ului
  expect(cereri).toContain(copie.baza + '/a/script.js')
  expect(cereri).toContain(copie.baza + '/a/api/send')
  expect(cereri.filter((u) => u.startsWith(fixturi.instanta)), 'nicio cerere a browserului spre instanta').toEqual([])
  // Elementul din pagina: identificatorul si do-not-track, nimic care sa duca spre alta gazda
  const script = await page.evaluate(() => {
    const s = document.querySelector('script[src="/a/script.js"]')
    return s ? { website: s.getAttribute('data-website-id'), dnt: s.getAttribute('data-do-not-track'), host: s.getAttribute('data-host-url') } : null
  })
  expect(script).toEqual({ website: ID_SITE, dnt: 'true', host: null })
  // Ce a primit INSTANTA, prin serverul site-ului: scriptul cerut o data si evenimentul cu adresa paginii
  const primite = fixturi.primite.slice(inainte)
  expect(primite.some((p) => p.metoda === 'GET' && p.url === '/script.js')).toBe(true)
  expect(evenimente).toHaveLength(1)
  expect(evenimente[0]).toMatchObject({ website: ID_SITE, url: copie.baza + '/preturi', language: expect.any(String), screen: expect.stringMatching(/^\d+x\d+$/) })
  expect(evenimente[0].title.length).toBeGreaterThan(5)
  // Fara cookie: nici cererile spre instanta nu poarta unul, nici browserul nu are vreunul
  expect(primite.every((p) => p.cookie === null)).toBe(true)
  expect(await context.cookies()).toEqual([])
  expect(await page.evaluate(() => Object.keys(localStorage).concat(Object.keys(sessionStorage)))).toEqual([])
  await context.close()
})

test('martor POZITIV: Do Not Track opreste orice trimitere, iar fara el evenimentul pleaca (controlul masuratorii)', async ({ browser }) => {
  const adresa = copie.baza + '/blog'
  const startDnt = fixturi.primite.length
  const cuDnt = await browser.newContext()
  await cuDnt.addInitScript(() => {
    Object.defineProperty(Navigator.prototype, 'doNotTrack', { get: () => '1' })
  })
  const pagDnt = await cuDnt.newPage()
  await deschide(pagDnt, adresa)
  // Controlul injectiei: browserul chiar raporteaza DNT, iar scriptul a fost incarcat (atributul e in pagina)
  expect(await pagDnt.evaluate(() => navigator.doNotTrack)).toBe('1')
  expect(await pagDnt.locator('script[src="/a/script.js"][data-do-not-track="true"]').count()).toBe(1)
  await pagDnt.waitForTimeout(2500)
  expect(await evenimentePentru(adresa, startDnt, 500), 'niciun eveniment cu DNT').toEqual([])
  await cuDnt.close()

  const startFara = fixturi.primite.length
  const fara = await browser.newContext()
  const pagFara = await fara.newPage()
  await deschide(pagFara, adresa)
  expect(await evenimentePentru(adresa, startFara), 'fara DNT evenimentul pleaca').toHaveLength(1)
  await fara.close()
})

test('C-01 cu analitica pornita: zero gazde straine, zero cookie-uri, zero stocare in afara alegerii, pe cinci rute', async ({ browser }) => {
  // Fiecare ruta asteapta 3 s dupa refuz (o cerere intarziata ar scapa sub un prag mai scurt): cinci rute nu incap in 60 s pe o masina incarcata
  test.setTimeout(180_000)
  for (const cale of ['/', '/preturi', '/contact', '/blog', '/juridic/cookies']) {
    const m = await masoaraTerti(browser, copie.baza + cale, { blocheazaStraine: true })
    console.log(
      '[C-01 multi-domeniu] ' + cale + ' | cereri: ' + m.totalCereri + ' | gazde straine: ' + (m.gazdeStraine.join(', ') || '(niciuna)') +
        ' | banner: ' + m.bannerGasit + ', refuz apasat: ' + m.refuzApasat + ' | cookies: ' + (m.cookies.join(', ') || '(niciunul)') +
        ' | chei de stocare: ' + (m.cheiStocare.join(', ') || '(niciuna)'),
    )
    expect(m.totalCereri, cale + ': nicio cerere inregistrata').toBeGreaterThan(0)
    expect(m.gazdeStraine, cale + ': cereri catre alte origini').toEqual([])
    expect(m.cookiesInainte, cale).toEqual([])
    expect(m.cheiStocareInainte, cale).toEqual([])
    expect(m.cookies, cale).toEqual([])
    expect(stocareNedeclarata(m), cale).toEqual([])
    // Controlul: bannerul GA4 chiar exista pe copie si refuzul a fost apasat, deci ramura de refuz s-a executat
    expect(m.bannerGasit, cale).toBe(true)
    expect(m.refuzApasat, cale).toBe(true)
  }
})

test('martor POZITIV: o pagina care incarca trackerul direct de la instanta e prinsa de aceeasi masuratoare (C-01)', async ({ browser }) => {
  const m = await masoaraTerti(browser, fixturi.fixturi + '/directa', { blocheazaStraine: true })
  console.log('[C-01 martor pozitiv, tracker direct] gazde straine: ' + m.gazdeStraine.join(', '))
  expect(m.totalCereri).toBeGreaterThan(0)
  expect(m.gazdeStraine).toContain(new URL(fixturi.instanta).host)
})

// ---------------------------------------------------------------------------------------------
// 2b. Analitica proprie FARA operator
// ---------------------------------------------------------------------------------------------

/**
 * Constatarea criticului (runda 1): cu `UMAMI_*` in mediu si fara operator, statistica proprie masura vizitatorii
 * fara nicio politica publicata si fara banner, contrar planului §9 ("analitica prelucreaza date personale ...
 * deci cere operator"; GA4 are aceeasi regula in `src/lib/analitica.ts`). Copia de aici e exact reproducerea ei:
 * SITE_URL pe alt domeniu, SITE_ENV=productie, `UMAMI_*` spre instanta falsa, NICIUN operator (fisierul are `null`,
 * mediul nu are `OPERATOR_JSON`).
 */
test('martor NEGATIV: domeniu FARA operator, cu UMAMI_* in mediu - fara script, fara rescrierile /a/, nimic la instanta, iar jurnalul build-ului spune de ce', async ({ browser }) => {
  test.setTimeout(480_000)
  const inainte = fixturi.primite.length
  const fara = await pornesteCopia({ SITE_ENV: 'productie', SITE_URL: INT, UMAMI_URL: fixturi.instanta, UMAMI_WEBSITE_ID: ID_SITE })
  const context = await browser.newContext()
  try {
    // Controlul fixturii: operatorul lipseste chiar, deci scenariul e cel al constatarii, nu altul
    const fisier = JSON.parse(readFileSync(join(fara.director, 'config', 'operator.json'), 'utf8')) as { operator: unknown }
    expect(fisier.operator, 'fisierul copiei are operator null').toBeNull()

    // 1. HTML-ul servit, fara JavaScript, pe trei rute: niciun script, nicio preincarcare, niciun identificator de site
    for (const cale of ['/', '/preturi', '/blog']) {
      const pagina = await html(fara.baza, cale)
      expect(pagina.includes('/a/script.js'), cale + ': scriptul de analitica').toBe(false)
      expect(/umami/i.test(pagina), cale + ': umami').toBe(false)
      expect(pagina.includes('data-website-id'), cale + ': data-website-id').toBe(false)
      expect(pagina.includes(ID_SITE), cale + ': identificatorul site-ului').toBe(false)
    }

    // 2. Caile proprii nu exista: nicio rescriere spre instanta (nici macar cea de primire, care nu depinde de script)
    expect((await fetch(fara.baza + '/a/script.js')).status, 'GET /a/script.js').toBe(404)
    const primire = await fetch(fara.baza + '/a/api/send', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'event', payload: { website: ID_SITE, url: fara.baza + '/' } }) })
    expect(primire.status, 'POST /a/api/send').toBe(404)

    // 3. Browser real: nicio cerere spre /a/ si niciuna spre instanta, pe trei pagini
    const page = await context.newPage()
    const cereri: string[] = []
    page.on('request', (r) => cereri.push(r.url()))
    for (const cale of ['/', '/preturi', '/blog']) await deschide(page, fara.baza + cale)
    await page.waitForTimeout(2500)
    expect(cereri.length, 'cererile chiar s-au inregistrat').toBeGreaterThan(3)
    expect(cereri.filter((u) => new URL(u).pathname.startsWith('/a/')), 'cereri spre calea proprie a analiticii').toEqual([])
    expect(cereri.filter((u) => u.startsWith(fixturi.instanta)), 'cereri spre instanta').toEqual([])

    // 4. Instanta n-a primit nimic de la aceasta copie: nici scriptul, nici un eveniment (cele doua cereri de mai sus au primit 404 la site)
    expect(fixturi.primite.slice(inainte), 'cereri primite de instanta').toEqual([])

    // 5. Jurnalul build-ului spune de ce: variabilele sunt date, dar operatorul lipseste, deci analitica ramane oprita
    console.log('[analitica fara operator] ' + fara.iesireBuild.split('\n').filter((l) => l.includes('analitica proprie')).join(' | '))
    expect(fara.iesireBuild).toContain('UMAMI_URL si UMAMI_WEBSITE_ID sunt setate')
    expect(fara.iesireBuild).toContain('analitica proprie ramane OPRITA')
    // O singura data (Next cheama `rewrites()` de doua ori, iar avertismentul se dedubleaza pe proces)
    expect(fara.iesireBuild.split('analitica proprie ramane OPRITA').length - 1, 'aparitii ale avertismentului in jurnalul build-ului').toBe(1)
    // Controlul avertismentului: copia principala (cu operator) nu il primeste, iar aceeasi cale ii raspunde cu scriptul
    expect(copie.iesireBuild).not.toContain('analitica proprie ramane OPRITA')
    expect((await fetch(copie.baza + '/a/script.js')).status, 'martor pozitiv: GET /a/script.js pe copia cu operator').toBe(200)
  } finally {
    await context.close()
    await fara.opreste()
  }
})

// ---------------------------------------------------------------------------------------------
// 3. Operatorul din mediu
// ---------------------------------------------------------------------------------------------

test('copie: operatorul din OPERATOR_JSON - cele opt pagini juridice raspund 200, sunt in harta si in subsol, cu paragraful despre analitica', async ({ page, request }) => {
  for (const cale of PAGINI_JURIDICE) expect((await request.get(copie.baza + cale)).status(), cale).toBe(200)
  expect((await request.get(copie.baza + '/juridic/nu-exista', { maxRedirects: 0 })).status()).toBe(404)
  const harta = await (await request.get(copie.baza + '/sitemap.xml')).text()
  const inHarta = [...harta.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname)
  for (const cale of PAGINI_JURIDICE) expect(inHarta, 'harta: ' + cale).toContain(cale)
  await deschide(page, copie.baza + '/')
  const subsol = await page.locator('footer a[href^="/juridic"]').evaluateAll((a) => a.map((x) => x.getAttribute('href')))
  expect(subsol.length).toBe(6)

  // Politica de confidentialitate: cele 12 elemente art. 13, cu paragraful despre analitica si operatorul din mediu
  await deschide(page, copie.baza + '/juridic/confidentialitate')
  const text = await page.locator('main').innerText()
  expect(await page.locator('[data-art13]').count()).toBe(12)
  expect(text).toContain(OPERATOR.denumire)
  expect(text).toContain('Măsurarea vizitelor, fără cookie.')
  expect(text).toContain('Invocăm interesul legitim pentru jurnalele serverului')
  expect(text).not.toContain('numai pentru jurnalele serverului')
  expect(text).toContain('30 septembrie 2026')
  // Politica de cookie-uri: cele 8 sectiuni L284, cu acelasi paragraf dupa tabel
  await deschide(page, copie.baza + '/juridic/cookies')
  const cookie = await page.locator('main').innerText()
  expect(await page.locator('[data-l284]').count()).toBe(8)
  expect(cookie).toContain('Măsurarea vizitelor, fără cookie.')
  expect(cookie).toContain('Do Not Track')
  // Nicio liniuta lunga in textele noi (regula de tipografie)
  expect(text + cookie).not.toMatch(new RegExp('[' + String.fromCharCode(0x2013) + String.fromCharCode(0x2014) + ']'))
})

/**
 * Constatarea criticului (runda 1): cautarea Ctrl+K nu gasea paginile juridice cand operatorul vine numai din
 * `OPERATOR_JSON`. Pachetul de browser nu primeste variabilele fara prefixul `NEXT_PUBLIC_`, deci lista de rute
 * din browser (`RUTE`) decidea dupa fisier, iar fisierul copiei are `null`: serverul avea cele opt pagini si
 * subsolul cu sase legaturi, dar paleta nu gasea nimic ("confiden", "cookie", "termeni": zero rezultate).
 * Reparatia: `next.config.ts` calculeaza `NEXT_PUBLIC_OPERATOR_NUMIT` din `OPERATOR_JSON` si o inlocuieste in toate
 * pachetele, iar `publicare.ts` o citeste inaintea variabilei si a fisierului.
 */
test('martor POZITIV: cautarea Ctrl+K gaseste paginile juridice cand operatorul vine numai din OPERATOR_JSON (fisierul copiei are null)', async ({ page }) => {
  test.setTimeout(120_000)
  // Controlul fixturii: fisierul copiei chiar nu numeste niciun operator, deci operatorul vine doar din mediu
  const fisier = JSON.parse(readFileSync(join(copie.director, 'config', 'operator.json'), 'utf8')) as { operator: unknown }
  expect(fisier.operator, 'fisierul copiei are operator null').toBeNull()
  await page.setViewportSize({ width: 1440, height: 900 })
  await deschide(page, copie.baza + '/')
  const latime = await page.evaluate(() => window.innerWidth)
  console.log('[Ctrl+K] innerWidth ' + latime)
  expect(latime).toBe(1440)
  // Controlul serverului: aceleasi pagini raspund 200 si sunt legate din subsol (constatarea spunea ca doar paleta lipsea)
  expect(await page.locator('footer a[href^="/juridic"]').count()).toBe(6)

  const paleta = page.getByRole('dialog', { name: PALETA.eticheta })
  const optiuni = paleta.getByRole('option')
  const citeste = async () => (await optiuni.allInnerTexts()).map((t) => t.replace(/\s+/g, ' '))
  /** Deschide paleta, scrie interogarea, asteapta sa apara `cale` (sau mesajul "fara rezultate" cand nu se da), o inchide. */
  const cauta = async (interogare: string, cale?: string): Promise<string[]> => {
    // Tasta se apasa numai cat paleta nu e deschisa (o a doua apasare ar inchide-o), iar incercarea se repeta pana
    // se hidrateaza pagina: pe un runner incarcat prima apasare poate veni inainte ca ascultatorul sa existe
    await expect(async () => {
      if (!(await paleta.isVisible())) await page.keyboard.press('Control+k')
      await expect(paleta).toBeVisible({ timeout: 1500 })
    }).toPass({ timeout: 15_000 })
    const camp = paleta.getByRole('combobox')
    await camp.fill(interogare)
    await expect(camp).toHaveValue(interogare)
    if (cale === undefined) {
      await expect(paleta.getByText(PALETA.faraRezultate)).toBeVisible()
    } else {
      // Lista se recalculeaza dupa fiecare tasta: se asteapta ruta cautata, iar la esec mesajul arata ce a gasit paleta
      await expect
        .poll(async () => (await citeste()).join(' | '), { timeout: 8000, message: '"' + interogare + '" trebuie sa gaseasca ' + cale })
        .toContain(cale)
    }
    const gasite = await citeste()
    await page.keyboard.press('Escape')
    await expect(paleta).toHaveCount(0)
    return gasite
  }
  for (const [interogare, cale] of [
    ['confiden', '/juridic/confidentialitate'],
    ['cookie', '/juridic/cookies'],
    ['termeni', '/juridic/termeni'],
  ]) {
    const gasite = await cauta(interogare, cale)
    console.log('[Ctrl+K] "' + interogare + '" -> ' + gasite.length + ' rezultate: ' + gasite.join(' | '))
  }
  // Controlul cautarii: doua pagini care nu depind de operator se gasesc in aceeasi paleta, iar un cuvant fara sens nu gaseste nimic
  for (const [interogare, cale] of [
    ['harta', '/harta-site'],
    ['preturi', '/preturi'],
  ]) {
    await cauta(interogare, cale)
  }
  expect(await cauta('zzzqqqxx')).toEqual([])
})

test('martor POZITIV: cu operatorul din mediu si o destinatie, formularul chiar trimite (o data, cu campurile lui)', async ({ request }) => {
  const inainte = fixturi.formulare.length
  const corp = {
    formular: 'enterprise',
    nume: 'Ioana Proba',
    email: ['ioana', ['firma-proba', 'test'].join('.')].join('@'),
    telefon: '',
    companie: 'Firma Proba',
    mesaj: 'Avem 40 de cutii de arhiva.',
    marketing: false,
  }
  const r = await request.post(copie.baza + '/api/formular', { data: corp, headers: { Origin: INT } })
  expect(r.status()).toBe(200)
  expect(await r.json()).toEqual({ stare: 'trimis' })
  expect(fixturi.formulare).toHaveLength(inainte + 1)
  expect(fixturi.formulare[inainte]).toMatchObject({ formular: 'enterprise', nume: corp.nume, companie: corp.companie })
})

test('martor POZITIV: un operator numit dar incomplet in OPERATOR_JSON opreste build-ul, cu campurile care lipsesc in mesaj', async () => {
  test.setTimeout(420_000)
  const director = pregateste()
  try {
    const incomplet = { ...OPERATOR, sediu: '', email: '', tara: '' }
    const build = await ruleaza([cliNext(director), 'build', '--no-lint'], director, mediu({ SITE_ENV: 'productie', SITE_URL: INT, OPERATOR_JSON: JSON.stringify({ operator: incomplet }) }))
    console.log('[build cu operator incomplet] cod ' + build.cod + ' | ' + coada(build.iesire).split('\n').filter((l) => l.includes('OPERATOR_JSON')).slice(0, 2).join(' | '))
    expect(build.cod, 'build-ul trebuia sa pice').not.toBe(0)
    expect(build.cod).not.toBeNull()
    expect(build.iesire).toContain('OPERATOR_JSON: operatorul e numit, dar informarea nu e completa (lipsesc: sediu, email, tara)')
  } finally {
    await stergeCuReincercari(director)
  }
})

// ---------------------------------------------------------------------------------------------
// 4. /indexnow.txt
// ---------------------------------------------------------------------------------------------

test('martor POZITIV: /indexnow.txt intoarce cheia din INDEXNOW_KEY, ca text simplu', async ({ request }) => {
  const r = await request.get(copie.baza + '/indexnow.txt')
  expect(r.status()).toBe(200)
  expect(r.headers()['content-type']).toContain('text/plain')
  expect((await r.text()).trim()).toBe(CHEIE_INDEXNOW)
})

// ---------------------------------------------------------------------------------------------
// 5. Build pe alt domeniu
// ---------------------------------------------------------------------------------------------

/** Aparitiile unui sir in toate fisierele unui director, recursiv (numarare pe continut, nu pe nume). */
function numara(director: string, sir: string): { total: number; fisiere: Record<string, number> } {
  const fisiere: Record<string, number> = {}
  let total = 0
  const mergi = (d: string) => {
    for (const nume of readdirSync(d)) {
      const cale = join(d, nume)
      if (statSync(cale).isDirectory()) mergi(cale)
      else {
        const n = readFileSync(cale, 'utf8').split(sir).length - 1
        if (n > 0) {
          fisiere[cale.slice(director.length + 1).replace(/\\/g, '/')] = n
          total += n
        }
      }
    }
  }
  mergi(director)
  return { total, fisiere }
}

/** Toate valorile-text dintr-un JSON, oricat de adanc. */
function texte(v: unknown): string[] {
  if (typeof v === 'string') return [v]
  if (Array.isArray(v)) return v.flatMap(texte)
  if (v !== null && typeof v === 'object') return Object.values(v).flatMap(texte)
  return []
}

test('build pe alt domeniu: nicio aparitie a gazdei de proba in .next/server/app, harta, robots, llms.txt, security.txt si JSON-LD; canonical pe domeniul nou', async ({ request }) => {
  const dinBuild = numara(join(copie.director, '.next', 'server', 'app'), GAZDA_PROBA)
  const fisiereText: Record<string, string> = {}
  for (const cale of ['/sitemap.xml', '/robots.txt', '/llms.txt', '/.well-known/security.txt']) {
    fisiereText[cale] = await (await request.get(copie.baza + cale)).text()
  }
  const jsonLd: string[] = []
  for (const cale of RUTE_ALTERNATE) {
    const pagina = await html(copie.baza, cale)
    for (const m of pagina.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)) jsonLd.push(m[1])
    // canonical pe domeniul nou
    expect(/<link rel="canonical" href="([^"]+)"/.exec(pagina)?.[1], cale + ': canonical').toBe(INT + (cale === '/' ? '' : cale))
  }
  expect(jsonLd.length, 'JSON-LD-ul chiar s-a citit').toBeGreaterThan(0)
  const adreseLd = jsonLd.flatMap((j) => texte(JSON.parse(j))).filter((t) => /^https?:\/\//.test(t))
  expect(adreseLd.length).toBeGreaterThan(0)

  const numere = {
    '.next/server/app': dinBuild.total,
    'sitemap.xml': fisiereText['/sitemap.xml'].split(GAZDA_PROBA).length - 1,
    'robots.txt': fisiereText['/robots.txt'].split(GAZDA_PROBA).length - 1,
    'llms.txt': fisiereText['/llms.txt'].split(GAZDA_PROBA).length - 1,
    'security.txt': fisiereText['/.well-known/security.txt'].split(GAZDA_PROBA).length - 1,
    'JSON-LD (3 pagini)': jsonLd.join('\n').split(GAZDA_PROBA).length - 1,
  }
  // Controalele numararii: pe copie fiecare fisier chiar poarta domeniul nou (deci zeroul de mai sus nu e o cautare oarba)
  const noi = {
    'sitemap.xml': fisiereText['/sitemap.xml'].split(INT).length - 1,
    'robots.txt': fisiereText['/robots.txt'].split(INT).length - 1,
    'llms.txt': fisiereText['/llms.txt'].split(INT).length - 1,
    'security.txt': fisiereText['/.well-known/security.txt'].split(INT).length - 1,
    'JSON-LD': adreseLd.filter((a) => a.startsWith(INT)).length,
    '.next/server/app': numara(join(copie.director, '.next', 'server', 'app'), INT).total,
  }
  console.log('[domeniu nou ' + INT + '] aparitii ale gazdei de proba: ' + JSON.stringify(numere) + ' | aparitii ale domeniului nou: ' + JSON.stringify(noi))
  for (const [loc, n] of Object.entries(numere)) expect(n, loc + ': aparitii ale gazdei de proba').toBe(0)
  for (const [loc, n] of Object.entries(noi)) expect(n, loc + ': aparitii ale domeniului nou').toBeGreaterThan(0)
  // Robots pe productie: harta pe domeniul nou
  expect(fisiereText['/robots.txt']).toContain('Sitemap: ' + INT + '/sitemap.xml')
})

// ---------------------------------------------------------------------------------------------
// Fara variabile: build-ul real
// ---------------------------------------------------------------------------------------------

test('martor NEGATIV: fara variabile (build-ul real) nu exista nici alternate, nici script de analitica, nici /indexnow.txt, iar gazda de proba e ce era', async ({ request, baseURL }) => {
  const baza = baseURL ?? ''
  for (const cale of RUTE_ALTERNATE) {
    const pagina = await html(baza, cale)
    const cap = pagina.slice(0, pagina.indexOf('</head>'))
    expect(alternateDinHtml(pagina), cale + ': alternate').toEqual([])
    expect(/hreflang/i.test(cap), cale + ': hreflang').toBe(false)
    expect(pagina.includes('/a/script.js'), cale + ': scriptul de analitica').toBe(false)
    expect(/umami/i.test(pagina), cale + ': umami').toBe(false)
  }
  expect((await request.get(baza + '/indexnow.txt')).status()).toBe(404)
  expect((await request.get(baza + '/a/script.js')).status()).toBe(404)
  expect((await request.get(baza + '/a/api/send', { maxRedirects: 0 })).status()).toBe(404)
  // Formularul: cu operator null (azi, config/operator.json) raspunde "inactiv"; daca fisierul numeste un operator, asteptarea se muta cu el
  const fisier = JSON.parse(readFileSync(join(RADACINA, 'config', 'operator.json'), 'utf8')) as { operator: unknown }
  const r = await request.post(baza + '/api/formular', { data: {}, headers: { Origin: baza } })
  if (fisier.operator === null) {
    expect(r.status()).toBe(503)
    expect(await r.json()).toEqual({ stare: 'inactiv', motiv: 'fara-operator' })
  } else {
    expect(await r.json()).not.toEqual({ stare: 'inactiv', motiv: 'fara-operator' })
  }
})

test('martor POZITIV al numararii: pe build-ul real, fara SITE_URL, gazda de proba chiar apare, deci zeroul de pe copie nu e o cautare oarba', async () => {
  const dosar = join(RADACINA, '.next', 'server', 'app')
  if (!existsSync(dosar)) nemasurat('lipseste build-ul real (' + dosar + '): numararea de control cere `pnpm build`')
  const real = numara(dosar, GAZDA_PROBA)
  console.log('[build real] aparitii ale gazdei de proba in .next/server/app: ' + real.total + ' in ' + Object.keys(real.fisiere).length + ' fisiere')
  expect(real.total).toBeGreaterThan(0)
  expect(real.fisiere['index.html'] ?? 0).toBeGreaterThan(0)
})
