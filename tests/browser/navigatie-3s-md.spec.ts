import { spawn, spawnSync, type ChildProcess } from 'node:child_process'
import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs'
import { createServer } from 'node:net'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { ECHIVALENTE } from '../../src/content/echivalente'
import { expect, test } from './ajutor/baza'
import { mediuProfil3sMd } from './ajutor/copie-3s-md'
import { RADACINA } from './ajutor/proiect'

/**
 * Navigatia pe editie pe site-ul 3s.md (felia navigatie-pe-editie): antetul si subsolul EN pe pagina de negasit
 * EN si pe o pagina EN de proba, antetul si subsolul RO-MD pe pagina RO-MD a informatiilor legale, canalele
 * domeniului (WhatsApp cu textul paginii, numarul de WhatsApp ca text, bara de jos pe mobil cu un singur buton) si
 * nimic din site-ul romanesc (niciun formular). Decizia 56 (03.10.2026, fara apeluri GSM): nicio legatura de apel,
 * nici in subsol, nici in bara; inainte proba cerea legatura de apel pe mobil, iar cerinta s-a intors odata cu decizia.
 *
 * COPIA. Build-ul real al probelor e cel romanesc, deci layout-urile `(en)` si `(romd)` nu se randeaza acolo.
 * Proba construieste o copie a arborelui cu variabilele aplicatiei 3s.md (`config/profil-3s-md.json`, prin
 * `mediuProfil3sMd` din `ajutor/copie-3s-md.ts`) si cu UN fisier de proba asamblat aici, la rulare: o pagina EN,
 * `/proba-navigatie`, ca layout-ul EN sa se randeze pe o pagina fara intrare in tabelul de canale. Pagina RO-MD
 * `/ro/juridic/informatii-legale` e cea reala, adusa de felia paginilor juridice (80), cu operatorul-model din
 * profil; pana la ea proba o injecta, impreuna cu intrarea ei in `rute-ro-md.ts`, iar injectia a fost scoasa
 * cand pagina a devenit reala (altfel copia ar fi avut aceeasi cale de doua ori, static si in segmentul juridic).
 * `ajutor/copie-3s-md.ts` nu primeste fisiere de proba (copiaza sursa neschimbata), de aceea copia se face aici,
 * cu acelasi mediu. Sursa depozitului nu se atinge.
 *
 * MENIUL ANTETULUI /ro (felia meniu-antet-ro, decizia 59: /ro oglindeste EN): pe `/ro`, meniul principal are atatea
 * intrari cate are cel EN pe `/`, in aceeasi ordine, fiecare tinta fiind perechea /ro (tabelul de echivalente) a
 * tintei EN si raspunzand 200 pe copie; la fel elementele foilor (Produs, Ghiduri), deschise la hover pe 1440, si
 * grupurile sertarului pe 390. Inainte meniul /ro avea numai "Contact".
 *
 * CONTROALE, fiecare cu esec zgomotos: injectia a aterizat (fisierul copiei contine marcajul probei), build-ul
 * copiei iese 0, serverul raspunde la `robots.txt`.
 */

const MARCAJ = 'PROBA navigatie-3s-md'
const DE_COPIAT = ['src', 'public', 'config', 'package.json', 'pnpm-lock.yaml', 'next.config.ts', 'tsconfig.json', 'postcss.config.mjs']
const VARIABILE_DOMENIU = [
  'SITE_URL', 'SITE_ENV', 'SITE_EDITII', 'SITE_ALTERNATE', 'OPERATOR_JSON', 'UMAMI_URL', 'UMAMI_WEBSITE_ID', 'INDEXNOW_KEY',
  'NEXT_PUBLIC_GA4_ID', 'FORMULARE_DESTINATIE', 'FORMULARE_SECRET', 'GOOGLE_SITE_VERIFICATION', 'BASIC_AUTH_USER', 'BASIC_AUTH_PASS',
  'CANALE_JSON',
]

const PROFIL = mediuProfil3sMd()
const CANALE = JSON.parse(PROFIL.CANALE_JSON) as { whatsapp: string; telefon: string }
const CALE_JURIDIC_RO = '/ro/juridic/informatii-legale'

const PAGINA_EN = `// ${MARCAJ}: pagina EN de proba, numai in copie.
export default function ProbaNavigatie() {
  return (
    <main>
      <h1>Navigation probe</h1>
    </main>
  );
}
`

type Copie = { baza: string; opreste: () => Promise<void> }
let copie: Copie

async function portLiber(): Promise<number> {
  return new Promise((gata, esec) => {
    const s = createServer()
    s.once('error', esec)
    s.listen(0, '127.0.0.1', () => {
      const a = s.address()
      const port = typeof a === 'object' && a ? a.port : 0
      s.close(() => gata(port))
    })
  })
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

function coada(text: string): string {
  return text.length > 3000 ? '...' + text.slice(-3000) : text
}

async function pornesteCopia(): Promise<Copie> {
  const director = mkdtempSync(join(tmpdir(), 'navigatie-3s-md-'))
  const sterge = () => rmSync(director, { recursive: true, force: true })
  try {
    for (const intrare of DE_COPIAT) {
      cpSync(join(RADACINA, intrare), join(director, intrare), { recursive: true })
    }
    symlinkSync(join(RADACINA, 'node_modules'), join(director, 'node_modules'), 'junction')

    // Injectia, cu control: fisierul scris trebuie sa poarte marcajul.
    const dosarEn = join(director, 'src', 'app', '(en)', 'proba-navigatie')
    mkdirSync(dosarEn, { recursive: true })
    writeFileSync(join(dosarEn, 'page.en.tsx'), PAGINA_EN)
    if (!readFileSync(join(dosarEn, 'page.en.tsx'), 'utf8').includes(MARCAJ)) throw new Error('controlul injectiei a picat: ' + dosarEn)

    const env: NodeJS.ProcessEnv = { ...process.env, BUILD_STANDALONE: '', NEXT_TELEMETRY_DISABLED: '1' }
    for (const v of VARIABILE_DOMENIU) delete env[v]
    Object.assign(env, PROFIL)

    const next = join(director, 'node_modules', 'next', 'dist', 'bin', 'next')
    const build = spawnSync(process.execPath, [next, 'build', '--no-lint'], { cwd: director, env, encoding: 'utf8' })
    if (build.status !== 0) {
      throw new Error('build-ul copiei 3s.md a iesit ' + build.status + '\n' + coada((build.stdout ?? '') + (build.stderr ?? '')))
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

/** HTML-ul servit (fara JavaScript), cu starea raspunsului. */
async function servit(cale: string): Promise<{ status: number; html: string }> {
  const r = await fetch(copie.baza + cale)
  return { status: r.status, html: await r.text() }
}

function hrefuri(html: string): string[] {
  return [...html.matchAll(/\shref="([^"]*)"/g)].map((m) => m[1].split('&amp;').join('&'))
}

/** Bucata de HTML dintre doua etichete (antetul, subsolul). */
function bucata(html: string, deschidere: RegExp, inchidere: string): string {
  const m = deschidere.exec(html)
  if (!m) return ''
  const sfarsit = html.indexOf(inchidere, m.index)
  return sfarsit < 0 ? '' : html.slice(m.index, sfarsit)
}

const WA = 'https://wa.me/' + CANALE.whatsapp + '?text='
/** Schema legaturii de apel, asamblata la rulare (proba nu poarta literal ce vaneaza). */
const SCHEMA_APEL = 'te' + 'l:'
const fataApel = (hs: string[]) => hs.filter((h) => h.toLowerCase().startsWith(SCHEMA_APEL))
/** Randul cu numarul de WhatsApp din subsol: prefixul tarii si grupele, cu spatii. */
const RAND_NUMAR = /^WhatsApp: \+\d{3} \d{2} \d{3} \d{3}$/
const ref = (cod: string) => '%5Bref%3A' + cod + '%5D'

/** Perechea /ro a fiecarei cai EN, din tabelul de echivalente (nu din contractul RO-MD pe care il masuram). */
const PE_RO = new Map(Object.values(ECHIVALENTE).flatMap((p) => (p.en && p['ro-MD'] ? [[p.en, p['ro-MD']] as const] : [])))
const pereche = (en: string) => PE_RO.get(en) ?? '(fara pereche: ' + en + ')'

/** Tintele meniului principal din HTML-ul servit (eticheta accesibila a meniului alege editia). */
function meniuServit(html: string, eticheta: string): string[] {
  return hrefuri(bucata(html, new RegExp('<nav aria-label="' + eticheta + '"'), '</nav>'))
}

/** Tintele elementelor din foile meniului, deschise pe rand la hover pe declansatori (1440). */
async function foiDeschise(page: import('@playwright/test').Page, cale: string): Promise<string[][]> {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto(copie.baza + cale)
  const declansatori = page.locator('header nav [data-declansator]')
  const n = await declansatori.count()
  const foi: string[][] = []
  for (let i = 0; i < n; i++) {
    await declansatori.nth(i).hover()
    const grup = page.locator('header [role="group"]:not([aria-hidden])')
    await expect(grup).toBeVisible()
    foi.push(await grup.locator('a').evaluateAll((as) => as.map((a) => a.getAttribute('href') ?? '')))
  }
  return foi
}

test.beforeAll(async () => {
  test.setTimeout(600_000)
  copie = await pornesteCopia()
})

test.afterAll(async () => {
  await copie?.opreste()
})

test.describe('3s.md: antetul si subsolul EN', () => {
  for (const [nume, cale, statusAsteptat] of [
    ['pagina de negasit EN', '/o-adresa-care-nu-exista', 404],
    ['pagina EN de proba', '/proba-navigatie', 200],
  ] as const) {
    test(nume + ': antet EN cu CTA WhatsApp, subsol cu wa.me, numarul de WhatsApp ca text, fara apel, informatiile legale in romana, 0 <form', async () => {
      const { status, html } = await servit(cale)
      expect(status).toBe(statusAsteptat)
      expect(html).toMatch(/<html[^>]*\blang="en"/)
      const antet = bucata(html, /<header\b/, '</header>')
      const subsol = bucata(html, /<footer\b/, '</footer>')
      // Controlul: piesele exista, deci absentele de mai jos nu vin dintr-un HTML fara antet sau subsol.
      expect(antet).not.toBe('')
      expect(subsol).not.toBe('')
      expect(antet).toContain('aria-label="Main menu"')
      const ctaAntet = hrefuri(antet).filter((h) => h.startsWith(WA))
      expect(ctaAntet).toHaveLength(1)
      // O adresa fara intrare in tabelul de canale (negasit, pagina de proba) foloseste textul paginii de start.
      expect(ctaAntet[0]).toContain(ref('en-home'))
      const hs = hrefuri(subsol)
      expect(hs.some((h) => h.startsWith(WA))).toBe(true)
      expect(fataApel(hrefuri(html))).toEqual([])
      expect(subsol).toContain('>WhatsApp: +')
      expect(hs).toContain(CALE_JURIDIC_RO)
      expect(subsol).toMatch(/<a[^>]*lang="ro"[^>]*>Informații legale<\/a>/)
      expect(html).not.toContain('<form')
      expect(hrefuri(html).filter((h) => /\/inregistrare|\/descarca/.test(h))).toEqual([])
    })
  }

  test('numarul de WhatsApp: text vizibil pe desktop si pe mobil, fara legatura de apel; bara de jos numai pe mobil, un singur buton', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto(copie.baza + '/proba-navigatie')
    const textSubsol = page.locator('footer [data-subsol-contact] span', { hasText: RAND_NUMAR })
    // Controlul selectorului: in coloana Contact exista legatura WhatsApp, deci absenta apelului nu vine din alt loc.
    await expect(page.locator('footer [data-subsol-contact] a[href^="' + WA + '"]')).toHaveCount(1)
    await expect(textSubsol).toBeVisible()
    await expect(page.locator('a[href^="' + SCHEMA_APEL + '" i]')).toHaveCount(0)
    await expect(page.locator('[data-bara-mobil]')).toBeHidden()

    await page.setViewportSize({ width: 390, height: 844 })
    await expect(textSubsol).toBeVisible()
    await expect(page.locator('a[href^="' + SCHEMA_APEL + '" i]')).toHaveCount(0)
    const bara = page.locator('[data-bara-mobil]')
    await expect(bara).toBeVisible()
    await expect(bara.locator('a')).toHaveCount(1)
    await expect(bara.locator('a[href^="' + WA + '"]')).toHaveCount(1)
    // Bara nu acopera continutul: distantierul de dinaintea ei are cel putin inaltimea ei.
    const inaltimi = await page.evaluate(() => {
      const b = document.querySelector('[data-bara-mobil]')!.getBoundingClientRect().height
      const d = document.querySelector('[data-bara-distantier]')!.getBoundingClientRect().height
      return { b, d }
    })
    expect(inaltimi.b).toBeGreaterThan(0)
    expect(inaltimi.d).toBeGreaterThanOrEqual(inaltimi.b)
  })
})

test.describe('martorii, pe serverul real al probelor (build-ul romanesc, contractul implicit)', () => {
  test('martor POZITIV: detectorul de legaturi interzise pe 3s.md prinde /inregistrare in antetul romanesc, unde CTA-ul chiar duce acolo', async ({ request }) => {
    const r = await request.get('/')
    expect(r.status()).toBe(200)
    const antet = bucata(await r.text(), /<header\b/, '</header>')
    expect(antet).not.toBe('')
    expect(hrefuri(antet).filter((h) => /\/inregistrare|\/descarca/.test(h)).length).toBeGreaterThan(0)
  })

  test('martor NEGATIV: site-ul romanesc nu primeste nimic din canalele domeniului 3s.md (fara wa.me, fara bara de mobil, fara legatura locala)', async ({ request }) => {
    const r = await request.get('/')
    expect(r.status()).toBe(200)
    const html = await r.text()
    // Controlul: pagina chiar are antet si subsol, deci absentele nu vin dintr-un HTML gol.
    expect(bucata(html, /<header\b/, '</header>')).not.toBe('')
    expect(bucata(html, /<footer\b/, '</footer>')).not.toBe('')
    expect(hrefuri(html).filter((h) => h.startsWith('https://wa.me/'))).toEqual([])
    expect(html).not.toContain('data-bara-mobil')
    expect(html).not.toContain('data-subsol-contact')
    expect(hrefuri(html)).not.toContain(CALE_JURIDIC_RO)
  })
})

test.describe('3s.md: antetul si subsolul RO-MD', () => {
  test('pagina RO-MD a informatiilor legale: CTA "Scrie-ne pe WhatsApp" cu textul paginilor juridice, coloanele Juridic si Contact', async () => {
    const { status, html } = await servit(CALE_JURIDIC_RO)
    expect(status).toBe(200)
    expect(html).toMatch(/<html[^>]*\blang="ro"/)
    const antet = bucata(html, /<header\b/, '</header>')
    const subsol = bucata(html, /<footer\b/, '</footer>')
    expect(antet).not.toBe('')
    expect(subsol).not.toBe('')
    const cta = hrefuri(antet).filter((h) => h.startsWith(WA))
    expect(cta).toHaveLength(1)
    expect(cta[0]).toContain(ref('ro-md-juridic'))
    expect(antet).toContain('Scrie-ne pe WhatsApp')
    expect(subsol).toContain('>Juridic</h2>')
    expect(hrefuri(subsol)).toContain(CALE_JURIDIC_RO)
    expect(fataApel(hrefuri(html))).toEqual([])
    expect(subsol).toContain('>WhatsApp: +')
    expect(html).not.toContain('<form')
  })

  test('meniul antetului /ro: acelasi numar de intrari si aceeasi ordine ca EN, perechile /ro, fiecare tinta 200', async () => {
    const en = await servit('/')
    const ro = await servit('/ro')
    expect(en.status).toBe(200)
    expect(ro.status).toBe(200)
    const meniuEn = meniuServit(en.html, 'Main menu')
    const meniuRo = meniuServit(ro.html, 'Meniul principal')
    // Controlul: EN are meniu (nu comparam doua liste goale) si tabelul cunoaste startul.
    expect(meniuEn.length).toBeGreaterThan(1)
    expect(pereche('/')).toBe('/ro')
    expect(meniuRo).toEqual(meniuEn.map(pereche))
    for (const t of meniuRo) expect((await servit(t)).status, '/ro -> ' + t).toBe(200)
  })

  test('foile meniului /ro (hover, 1440): aceleasi elemente ca pe EN, cu perechile /ro, fiecare 200; sertarul pe 390 le are pe toate', async ({ page }) => {
    const foiEn = await foiDeschise(page, '/')
    const foiRo = await foiDeschise(page, '/ro')
    // Controlul: EN are foi cu elemente, deci egalitatea de mai jos nu e intre doua liste goale.
    expect(foiEn.length).toBeGreaterThan(0)
    expect(foiEn.every((f) => f.length > 0)).toBe(true)
    expect(foiRo).toEqual(foiEn.map((f) => f.map(pereche)))
    for (const t of foiRo.flat()) expect((await servit(t)).status, 'foaie /ro -> ' + t).toBe(200)

    // Sertarul ia meniul din acelasi contract: pe 390 contine fiecare tinta a meniului si a foilor.
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto(copie.baza + '/ro')
    await page.locator('[data-hamburger]').click()
    const sertar = page.locator('[data-sertar]')
    await expect(sertar).toBeVisible()
    const tinte = () => sertar.locator('nav a').evaluateAll((as) => as.map((a) => a.getAttribute('href') ?? ''))
    // Grupurile sertarului se deschid unul cate unul (deschiderea unuia il inchide pe celalalt): se aduna pe rand.
    const tinteSertar = await tinte()
    // Grupurile sunt declansatorii antetului (selectorul de limba din sertar e tot un buton pliabil, deci nu se numara).
    const declansatori = await page.locator('header nav [data-declansator]').evaluateAll((as) => as.map((a) => a.getAttribute('data-declansator') ?? ''))
    expect(declansatori, 'declansatori, unul pe foaie').toHaveLength(foiRo.length)
    for (const nume of declansatori) {
      const grup = sertar.locator('nav').getByRole('button', { name: nume, exact: true })
      await grup.click()
      await expect(grup).toHaveAttribute('aria-expanded', 'true')
      tinteSertar.push(...(await tinte()))
    }
    const asteptate = [...meniuServit((await servit('/ro')).html, 'Meniul principal'), ...foiRo.flat()]
    expect(asteptate.filter((t) => !tinteSertar.includes(t))).toEqual([])
  })
})
