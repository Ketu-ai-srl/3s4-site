import { spawn, spawnSync, type ChildProcess } from 'node:child_process'
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs'
import { createServer, type IncomingMessage, type Server, type ServerResponse } from 'node:http'
import type { AddressInfo } from 'node:net'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import type { Browser, BrowserContext, Page } from '@playwright/test'
import { expect, test } from './ajutor/baza'
import { mediuProfil3sMd } from './ajutor/copie-3s-md'
import { RADACINA } from './ajutor/proiect'

/**
 * MASURAREA S-B pe 3s.md (felia 78; decizia 13 din 30.09.2026): analitica proprie (Umami) porneste numai dupa
 * acordul din banner si se opreste la retragere, fara reincarcarea paginii. Criteriul de gata (1), masurat din
 * reteaua paginii, cu martori:
 *   - ZERO cereri spre `/a/` inainte de accept (si niciun element <script> al analiticii), pe pagina EN si pe
 *     pagina RO-MD, iar instanta nu primeste nimic;
 *   - dupa accept: scriptul de pe `/a/script.js`, vizita trimisa la `/a/api/send` si primita de instanta (martorul
 *     pozitiv al masuratorii);
 *   - dupa retragere (legatura "Cookie settings" din subsol, statistica oprita, salvare): ZERO trimiteri, desi
 *     scriptul ramane in pagina si pagina chiar incearca sa trimita (o vizita ceruta de mana si o navigare in
 *     istoric, care inainte de retragere PLEACA - martorul ca proba poate produce o trimitere);
 *   - refuzul: nimic, nici dupa reincarcare;
 *   - bannerul in engleza pe `/` si in romana pe `/ro`, cu `<html lang>` al editiei;
 *   - evidenta alegerii, pe server, cu versiunea `en-` (criteriul 3, pe drumul real al middleware-ului);
 *   - evenimentul `contact` (WhatsApp) pleaca dupa accept si nu mai pleaca dupa retragere;
 *   - nicio cheie de stocare in afara alegerii din banner (nici `umami.disabled`), niciun cookie.
 *
 * COPIA: arborele, construit si pornit cu profilul aplicatiei 3s.md (`config/profil-3s-md.json`, prin
 * `mediuProfil3sMd`), plus `UMAMI_URL` spre o instanta FALSA de pe masina locala si un `UMAMI_WEBSITE_ID` sintetic.
 * Instanta reala nu se foloseste. Cat timp editiile n-au pagini de start, copia primeste cate una de proba, la `/`
 * si la `/ro` (numai daca fisierul lipseste; cand pagina reala exista, se masoara ea). Sursa depozitului nu se atinge.
 *
 * TRACKERUL-MODEL reproduce ce face, fata de pagina, scriptul servit de instanta noastra (citit 01.10.2026): iese
 * daca `document.currentScript` lipseste; citeste `data-website-id`, `data-do-not-track` si `data-before-send`;
 * inainte de fiecare trimitere cheama `window[<data-before-send>](tip, date)` si nu trimite pe o valoare falsa;
 * trimite vizita la incarcare si la `history.pushState`; expune `window.umami.track`. Proba masoara PAGINA noastra.
 *
 * CERERILE CATRE ALTE GAZDE se blocheaza la retea (legaturile `wa.me` nu pleaca nicaieri).
 *
 * CONTROALE, fiecare cu esec zgomotos: injectia a aterizat (fisierul copiei poarta marcajul), build-ul iese 0,
 * serverul raspunde, iar build-ul are rescrierile `/a/` (fara ele, zeroul de dinainte de accept n-ar dovedi nimic).
 */

const MARCAJ = 'PROBA umami-acord'
const ID_SITE = ['7c2d3e4f', '5a6b', '4c7d', '8e9f', '0a1b2c3d4e5f'].join('-')
const DE_COPIAT = ['src', 'public', 'config', 'package.json', 'pnpm-lock.yaml', 'next.config.ts', 'tsconfig.json', 'postcss.config.mjs']
const VARIABILE_DOMENIU = [
  'SITE_URL', 'SITE_ENV', 'SITE_EDITII', 'SITE_ALTERNATE', 'OPERATOR_JSON', 'UMAMI_URL', 'UMAMI_WEBSITE_ID', 'INDEXNOW_KEY',
  'NEXT_PUBLIC_GA4_ID', 'FORMULARE_DESTINATIE', 'FORMULARE_SECRET', 'GOOGLE_SITE_VERIFICATION', 'BASIC_AUTH_USER', 'BASIC_AUTH_PASS',
  'CANALE_JSON',
]

const PAGINA_EN = `// ${MARCAJ}: pagina de start EN de proba, numai in copie.
export default function ProbaAcordEn() {
  return (
    <main>
      <h1>Probe page</h1>
    </main>
  );
}
`

const PAGINA_RO_MD = `// ${MARCAJ}: pagina de start RO-MD de proba, numai in copie.
export default function ProbaAcordRoMd() {
  return (
    <main>
      <h1>Pagină de probă</h1>
    </main>
  );
}
`

/** Trackerul-model: ce face scriptul instantei fata de pagina, in cateva randuri. */
const TRACKER_MODEL = [
  '(function(){',
  'var cs=document.currentScript; if(!cs) return;',
  "var g=function(n){return cs.getAttribute('data-'+n)};",
  "var website=g('website-id'), dnt=g('do-not-track')==='true', bs=g('before-send');",
  "var endpoint=cs.src.split('/').slice(0,-1).join('/')+'/api/send';",
  "var off=function(){return !website||(window.localStorage&&window.localStorage.getItem('umami.disabled'))||(dnt&&[1,'1','yes'].indexOf(window.doNotTrack||navigator.doNotTrack)>=0)};",
  'var send=async function(t,p){ if(off()) return; var f=window[bs]; if(typeof f===\'function\'){ p=await Promise.resolve(f(t,p)); } if(!p) return;',
  "  fetch(endpoint,{keepalive:true,method:'POST',body:JSON.stringify({type:t,payload:p}),headers:{'Content-Type':'application/json'},credentials:'omit'}).catch(function(){}); };",
  "var baza=function(){return {website:website,url:location.href,title:document.title,language:navigator.language,hostname:location.hostname}};",
  "var track=function(n,d){ if(typeof n==='string'){ var p=baza(); p.name=n; p.data=d; return send('event',p);} return send('event',baza()); };",
  'if(!window.umami) window.umami={track:track};',
  "var ps=history.pushState; history.pushState=function(){ var r=ps.apply(history,arguments); setTimeout(function(){ send('event',baza()); },50); return r; };",
  "send('event',baza());",
  '})();',
].join('\n')

type Primit = { metoda: string; url: string; corp: string }

type Instanta = { origine: string; primite: Primit[]; opreste: () => Promise<void> }

async function pornesteInstanta(): Promise<Instanta> {
  const primite: Primit[] = []
  const server: Server = createServer((c: IncomingMessage, r: ServerResponse) => {
    let corp = ''
    c.on('data', (b) => (corp += b))
    c.on('end', () => {
      primite.push({ metoda: c.method ?? '', url: c.url ?? '', corp })
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
  })
  const port = await new Promise<number>((gata) => server.listen(0, '127.0.0.1', () => gata((server.address() as AddressInfo).port)))
  return { origine: 'http://127.0.0.1:' + port, primite, opreste: () => new Promise((gata) => server.close(() => gata())) }
}

type Copie = { baza: string; jurnal: () => string; opreste: () => Promise<void> }

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

function coada(text: string): string {
  return text.length > 3000 ? '...' + text.slice(-3000) : text
}

async function portLiber(): Promise<number> {
  const s = createServer()
  const port = await new Promise<number>((gata) => s.listen(0, '127.0.0.1', () => gata((s.address() as AddressInfo).port)))
  await new Promise((gata) => s.close(gata))
  return port
}

async function pornesteCopia(instanta: string): Promise<Copie> {
  const director = mkdtempSync(join(tmpdir(), 'umami-acord-'))
  const sterge = () => rmSync(director, { recursive: true, force: true })
  try {
    for (const intrare of DE_COPIAT) cpSync(join(RADACINA, intrare), join(director, intrare), { recursive: true })
    symlinkSync(join(RADACINA, 'node_modules'), join(director, 'node_modules'), 'junction')

    // Paginile de start EN si RO-MD, numai daca lipsesc (le aduc feliile paginilor). Pagina de negasit EN are
    // propriul <html> si nu trece prin layout-ul editiei; bannerul il monteaza ea insasi (felia 134).
    for (const [dosar, fisier, continut] of [
      [join(director, 'src', 'app', '(en)'), 'page.en.tsx', PAGINA_EN],
      [join(director, 'src', 'app', '(romd)', 'ro'), 'page.romd.tsx', PAGINA_RO_MD],
    ] as const) {
      const cale = join(dosar, fisier)
      if (existsSync(cale)) continue
      mkdirSync(dosar, { recursive: true })
      writeFileSync(cale, continut)
      if (!readFileSync(cale, 'utf8').includes(MARCAJ)) throw new Error('controlul injectiei a picat: ' + cale)
    }

    const env: NodeJS.ProcessEnv = { ...process.env, BUILD_STANDALONE: '', NEXT_TELEMETRY_DISABLED: '1' }
    for (const v of VARIABILE_DOMENIU) delete env[v]
    Object.assign(env, mediuProfil3sMd(), { UMAMI_URL: instanta, UMAMI_WEBSITE_ID: ID_SITE })

    const next = join(director, 'node_modules', 'next', 'dist', 'bin', 'next')
    const build = spawnSync(process.execPath, [next, 'build', '--no-lint'], { cwd: director, env, encoding: 'utf8' })
    if (build.status !== 0) {
      throw new Error('build-ul copiei 3s.md cu Umami a iesit ' + build.status + '\n' + coada((build.stdout ?? '') + (build.stderr ?? '')))
    }
    const rescrieri = readFileSync(join(director, '.next', 'routes-manifest.json'), 'utf8')
    if (!rescrieri.includes('/a/script.js') || !rescrieri.includes('/a/api/send')) {
      throw new Error('controlul rescrierilor a picat: build-ul copiei nu are /a/script.js si /a/api/send')
    }

    const port = await portLiber()
    const baza = 'http://127.0.0.1:' + port
    let jurnal = ''
    const server = spawn(process.execPath, [next, 'start', '--hostname', '127.0.0.1', '--port', String(port)], {
      cwd: director,
      env,
      detached: process.platform !== 'win32',
    })
    server.stdout?.on('data', (b) => (jurnal += String(b)))
    server.stderr?.on('data', (b) => (jurnal += String(b)))
    const termen = Date.now() + 60_000
    for (;;) {
      if (server.exitCode !== null) throw new Error('serverul copiei s-a oprit cu ' + server.exitCode + '\n' + coada(jurnal))
      try {
        if ((await fetch(baza + '/robots.txt')).ok) break
      } catch {
        // inca porneste
      }
      if (Date.now() > termen) {
        opresteProcesul(server)
        throw new Error('serverul copiei nu raspunde in 60 s\n' + coada(jurnal))
      }
      await new Promise((r) => setTimeout(r, 250))
    }
    return {
      baza,
      jurnal: () => jurnal,
      opreste: async () => {
        opresteProcesul(server)
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
    try {
      sterge()
    } catch {
      // directorul ramane in temporar; eroarea de mai sus e cea care conteaza
    }
    throw e
  }
}

let instanta: Instanta
let copie: Copie

test.beforeAll(async () => {
  test.setTimeout(420_000)
  instanta = await pornesteInstanta()
  copie = await pornesteCopia(instanta.origine)
})

test.afterAll(async () => {
  await copie?.opreste()
  await instanta?.opreste()
})

// ---------------------------------------------------------------------------------------------
// Unelte de masura
// ---------------------------------------------------------------------------------------------

type Retea = { cereriA: string[]; trimiteri: () => number }

/** Context nou: cererile spre alte gazde blocate, cererile spre `/a/` numarate. */
async function contextPazit(browser: Browser): Promise<{ context: BrowserContext; pagina: Page; retea: Retea }> {
  const context = await browser.newContext()
  const proprie = new URL(copie.baza).host
  const retea: Retea = { cereriA: [], trimiteri: () => retea.cereriA.filter((u) => new URL(u).pathname === '/a/api/send').length }
  context.on('request', (c) => {
    const u = new URL(c.url())
    if (u.host === proprie && u.pathname.startsWith('/a/')) retea.cereriA.push(c.url())
  })
  await context.route('**/*', (ruta) => (new URL(ruta.request().url()).host === proprie ? ruta.continue() : ruta.abort('blockedbyclient')))
  return { context, pagina: await context.newPage(), retea }
}

const POST_PRIMITE = () => instanta.primite.filter((p) => p.metoda === 'POST' && p.url === '/api/send')

async function deschide(pagina: Page, cale: string): Promise<void> {
  await pagina.goto(copie.baza + cale, { waitUntil: 'domcontentloaded' })
  await pagina.waitForLoadState('networkidle').catch(() => {})
}

/** O pagina incearca sa trimita: o vizita ceruta de mana si o navigare in istoric (trackerul le prinde pe amandoua). */
async function incearcaSaTrimita(pagina: Page): Promise<void> {
  await pagina.evaluate(() => {
    const u = (window as unknown as { umami?: { track: () => unknown } }).umami
    u?.track()
    history.pushState({}, '', location.pathname + '#proba-' + Date.now())
  })
}

/** Clic pe legatura WhatsApp, cu navigarea oprita de proba (ascultatorul paginii ruleaza inainte, in captura). */
async function clicWhatsapp(pagina: Page): Promise<boolean> {
  return pagina.evaluate(() => {
    const a = document.querySelector('a[href^="https://wa.me/"]') as HTMLAnchorElement | null
    if (!a) return false
    a.addEventListener('click', (e) => e.preventDefault(), { once: true })
    a.click()
    return true
  })
}

function randuriEvidenta(jurnal: string): Record<string, unknown>[] {
  return jurnal
    .split(/\r?\n/)
    .filter((r) => r.includes('"tip":"3s-consimtamant"'))
    .map((r) => JSON.parse(r.slice(r.indexOf('{'))) as Record<string, unknown>)
}

// ---------------------------------------------------------------------------------------------
// Bannerul pe limba si nimic inainte de accept
// ---------------------------------------------------------------------------------------------

for (const [cale, lang, titlu] of [
  ['/', 'en', 'Measuring visits'],
  ['/ro', 'ro', 'Măsurarea vizitelor'],
] as const) {
  test('inainte de accept, ' + cale + ': bannerul in ' + lang + ', zero cereri spre /a/, niciun script, nimic la instanta', async ({ browser }) => {
    const { context, pagina, retea } = await contextPazit(browser)
    const primiteInainte = instanta.primite.length
    await deschide(pagina, cale)
    const banner = pagina.locator('[data-consimtamant]')
    await expect(banner).toBeVisible()
    await pagina.waitForTimeout(2000)
    const masura = {
      lang: await pagina.evaluate(() => document.documentElement.lang),
      titlu: (await banner.locator('h2').textContent())?.trim(),
      cereriA: retea.cereriA.length,
      script: await pagina.locator('script[src="/a/script.js"]').count(),
      instanta: instanta.primite.length - primiteInainte,
      stocare: await pagina.evaluate(() => Object.keys(localStorage).concat(Object.keys(sessionStorage))),
      cookies: (await context.cookies()).map((c) => c.name),
    }
    await context.close()
    console.log('[inainte de accept] ' + cale + ' ' + JSON.stringify(masura))
    expect(masura).toEqual({ lang, titlu, cereriA: 0, script: 0, instanta: 0, stocare: [], cookies: [] })
  })
}

// ---------------------------------------------------------------------------------------------
// Accept, apoi retragere fara reincarcare
// ---------------------------------------------------------------------------------------------

test('martor POZITIV: dupa accept scriptul si vizita pleaca; dupa retragere, zero trimiteri, desi pagina incearca', async ({ browser }) => {
  test.setTimeout(120_000)
  const { context, pagina, retea } = await contextPazit(browser)
  await deschide(pagina, '/')
  await expect(pagina.locator('[data-consimtamant]')).toBeVisible()
  expect(retea.cereriA, 'cereri /a/ inainte de accept').toEqual([])
  const postInainte = POST_PRIMITE().length

  await pagina.locator('[data-consimtamant] [data-accept]').click()
  await expect.poll(() => retea.trimiteri(), { timeout: 10_000, message: 'nicio trimitere dupa accept' }).toBeGreaterThan(0)
  await expect.poll(() => POST_PRIMITE().length - postInainte, { timeout: 10_000 }).toBeGreaterThan(0)
  expect(retea.cereriA.some((u) => new URL(u).pathname === '/a/script.js')).toBe(true)
  const element = await pagina.evaluate(() => {
    const s = document.querySelector('script[src="/a/script.js"]')
    return s ? { website: s.getAttribute('data-website-id'), dnt: s.getAttribute('data-do-not-track'), inainte: s.getAttribute('data-before-send'), tip: s.getAttribute('type') } : null
  })
  expect(element).toMatchObject({ website: ID_SITE, dnt: 'true', tip: null })
  expect(element?.inainte).toBeTruthy()

  // Martorul probei: inainte de retragere, aceeasi incercare CHIAR trimite (vizita si navigarea in istoric)
  const inainteDeIncercare = retea.trimiteri()
  await incearcaSaTrimita(pagina)
  await expect.poll(() => retea.trimiteri() - inainteDeIncercare, { timeout: 10_000 }).toBeGreaterThanOrEqual(2)
  // Si evenimentul `contact` pleaca, cu canalul si limba
  const inainteDeContact = POST_PRIMITE().length
  expect(await clicWhatsapp(pagina), 'pagina EN nu are legatura WhatsApp').toBe(true)
  await expect
    .poll(() => POST_PRIMITE().slice(inainteDeContact).filter((p) => JSON.parse(p.corp).payload.name === 'contact').length, { timeout: 10_000 })
    .toBe(1)
  const contact = POST_PRIMITE().slice(inainteDeContact).map((p) => JSON.parse(p.corp).payload).find((p) => p.name === 'contact')
  expect(contact.data).toEqual({ canal: 'whatsapp', lang: 'en' })

  // Retragerea: legatura din subsol, statistica oprita, salvare. Fara reincarcare.
  await pagina.evaluate(() => {
    ;(window as unknown as { __marcaj: string }).__marcaj = 'fara-reincarcare'
  })
  await pagina.locator('footer [data-cookie-settings]').click()
  const panou = pagina.locator('dialog[data-consimtamant-setari]')
  await expect(panou).toBeVisible()
  const caseta = panou.locator('input[type="checkbox"]')
  await expect(caseta, 'panoul nu arata acordul dat').toBeChecked()
  await caseta.uncheck()
  await panou.locator('[data-salveaza]').click()
  await expect(panou).toBeHidden()
  await pagina.waitForTimeout(1000)

  const dupaRetragere = retea.trimiteri()
  const postDupaRetragere = POST_PRIMITE().length
  await incearcaSaTrimita(pagina)
  expect(await clicWhatsapp(pagina)).toBe(true)
  await pagina.waitForTimeout(3000)
  const masura = {
    reincarcata: (await pagina.evaluate(() => (window as unknown as { __marcaj?: string }).__marcaj)) !== 'fara-reincarcare',
    scriptInPagina: await pagina.locator('script[src="/a/script.js"]').count(),
    trimiteriDupa: retea.trimiteri() - dupaRetragere,
    primiteDupa: POST_PRIMITE().length - postDupaRetragere,
    stocare: await pagina.evaluate(() => Object.keys(localStorage).concat(Object.keys(sessionStorage))),
    cookies: (await context.cookies()).map((c) => c.name),
  }
  await context.close()
  console.log('[dupa retragere] ' + JSON.stringify(masura))
  // Scriptul ramane in pagina (deci zeroul nu vine din lipsa lui), dar nu mai pleaca nimic
  expect(masura).toEqual({ reincarcata: false, scriptInPagina: 1, trimiteriDupa: 0, primiteDupa: 0, stocare: ['3s-consimtamant'], cookies: [] })
})

test('martor NEGATIV: refuzul nu produce nicio cerere spre /a/, nici dupa reincarcare; evidenta pe server poarta versiunea en-', async ({ browser }) => {
  // Martorul negativ al fisierului: aceeasi pagina ca in martorul pozitiv, dar cu refuz. Zero cereri aici, langa
  // trimiterile de dupa accept din martorul pozitiv, arata ca alegerea din banner decide incarcarea.
  const { context, pagina, retea } = await contextPazit(browser)
  await deschide(pagina, '/')
  await pagina.locator('[data-consimtamant] [data-refuz]').click()
  await expect(pagina.locator('[data-consimtamant]')).toBeHidden()
  await pagina.waitForTimeout(1500)
  await pagina.reload({ waitUntil: 'domcontentloaded' })
  await pagina.waitForLoadState('networkidle').catch(() => {})
  await pagina.waitForTimeout(1500)
  const alegerea = await pagina.evaluate(() => JSON.parse(localStorage.getItem('3s-consimtamant') ?? 'null') as { id: string; versiune: string } | null)
  const masura = { cereriA: retea.cereriA.length, script: await pagina.locator('script[src="/a/script.js"]').count(), banner: await pagina.locator('[data-consimtamant]').isVisible() }
  await context.close()
  console.log('[refuz] ' + JSON.stringify(masura) + ' | alegerea: ' + JSON.stringify(alegerea))
  expect(masura).toEqual({ cereriA: 0, script: 0, banner: false })
  expect(alegerea?.versiune).toMatch(/^en-[0-9a-f]{8}$/)
  await expect.poll(() => randuriEvidenta(copie.jurnal()).filter((r) => r.id === alegerea?.id).length, { timeout: 10_000 }).toBe(1)
  expect(randuriEvidenta(copie.jurnal()).find((r) => r.id === alegerea?.id)).toMatchObject({ versiune: alegerea?.versiune, statistica: false, metoda: 'refuz-tot' })
})
