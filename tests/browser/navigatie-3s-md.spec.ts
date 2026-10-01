import { spawn, spawnSync, type ChildProcess } from 'node:child_process'
import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs'
import { createServer } from 'node:net'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { expect, test } from './ajutor/baza'
import { mediuProfil3sMd } from './ajutor/copie-3s-md'
import { RADACINA } from './ajutor/proiect'

/**
 * Navigatia pe editie pe site-ul 3s.md (felia navigatie-pe-editie): antetul si subsolul EN pe pagina de negasit
 * EN si pe o pagina EN de proba, antetul si subsolul RO-MD pe o pagina RO-MD de proba, canalele domeniului
 * (WhatsApp cu textul paginii, telefonul ca text si `tel:` numai pe mobil, bara de jos pe mobil) si nimic
 * din site-ul romanesc (niciun formular).
 *
 * COPIA. Build-ul real al probelor e cel romanesc, iar pe profilul 3s.md nu exista azi nicio pagina EN sau RO-MD:
 * orice adresa raspunde din pagina de negasit, deci layout-urile `(en)` si `(romd)` nu s-ar randa nicaieri.
 * Proba construieste o copie a arborelui cu variabilele aplicatiei 3s.md (`config/profil-3s-md.json`, prin
 * `mediuProfil3sMd` din `ajutor/copie-3s-md.ts`) si cu DOUA fisiere de proba asamblate aici, la rulare:
 *   - o pagina EN, `/proba-navigatie`, ca layout-ul EN sa se randeze;
 *   - pagina RO-MD `/ro/juridic/informatii-legale` si intrarea ei in `rute-ro-md.ts`, ca layout-ul RO-MD sa se
 *     randeze si ca legatura spre informatiile legale in romana sa treaca de filtrul pe rute (azi pagina nu
 *     exista: o aduce felia paginilor juridice).
 * `ajutor/copie-3s-md.ts` nu primeste fisiere de proba (copiaza sursa neschimbata), de aceea copia se face aici,
 * cu acelasi mediu. Sursa depozitului nu se atinge.
 *
 * CONTROALE, fiecare cu esec zgomotos: injectiile au aterizat (fisierele copiei contin marcajul probei), build-ul
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

const PAGINA_RO_MD = `// ${MARCAJ}: pagina RO-MD de proba, numai in copie.
export default function ProbaJuridicRoMd() {
  return (
    <main>
      <h1>Pagină de probă</h1>
    </main>
  );
}
`

const INTRARE_RO_MD =
  '  // ' + MARCAJ + '\n' +
  '  { cale: "' + CALE_JURIDIC_RO + '", scurt: "Proba", descriere: "Pagina de proba a copiei.", inHarta: false, editie: "ro-MD", cheie: "informatii-legale" },\n'

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

    // Injectiile, cu control: fiecare fisier rescris trebuie sa poarte marcajul.
    const dosarEn = join(director, 'src', 'app', '(en)', 'proba-navigatie')
    mkdirSync(dosarEn, { recursive: true })
    writeFileSync(join(dosarEn, 'page.en.tsx'), PAGINA_EN)
    const dosarRoMd = join(director, 'src', 'app', '(romd)', ...CALE_JURIDIC_RO.split('/').filter(Boolean))
    mkdirSync(dosarRoMd, { recursive: true })
    writeFileSync(join(dosarRoMd, 'page.romd.tsx'), PAGINA_RO_MD)
    const fisierRute = join(director, 'src', 'content', 'rute-ro-md.ts')
    const rute = readFileSync(fisierRute, 'utf8')
    const ancora = '// <<felie:juridic-pagini-3s-md>>\n'
    if (!rute.includes(ancora)) throw new Error('controlul injectiei a picat: rute-ro-md.ts nu mai are marcajul feliei juridice')
    writeFileSync(fisierRute, rute.replace(ancora, ancora + INTRARE_RO_MD))
    for (const f of [join(dosarEn, 'page.en.tsx'), join(dosarRoMd, 'page.romd.tsx'), fisierRute]) {
      if (!readFileSync(f, 'utf8').includes(MARCAJ)) throw new Error('controlul injectiei a picat: ' + f)
    }

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
const TEL = 'tel:' + CANALE.telefon
const ref = (cod: string) => '%5Bref%3A' + cod + '%5D'

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
    test(nume + ': antet EN cu CTA WhatsApp, subsol cu wa.me, tel: si informatiile legale in romana, 0 <form', async () => {
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
      expect(hs).toContain(TEL)
      expect(hs).toContain(CALE_JURIDIC_RO)
      expect(subsol).toMatch(/<a[^>]*lang="ro"[^>]*>Informații legale<\/a>/)
      expect(html).not.toContain('<form')
      expect(hrefuri(html).filter((h) => /\/inregistrare|\/descarca/.test(h))).toEqual([])
    })
  }

  test('telefonul: legatura tel: vizibila numai pe mobil, numarul ca text pe desktop; bara de jos numai pe mobil', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto(copie.baza + '/proba-navigatie')
    const telSubsol = page.locator('footer a[href="' + TEL + '"]')
    const textSubsol = page.locator('footer [data-subsol-contact] span', { hasText: /^\+\d/ })
    await expect(telSubsol).toBeHidden()
    await expect(textSubsol).toBeVisible()
    await expect(page.locator('[data-bara-mobil]')).toBeHidden()

    await page.setViewportSize({ width: 390, height: 844 })
    await expect(telSubsol).toBeVisible()
    await expect(textSubsol).toBeHidden()
    const bara = page.locator('[data-bara-mobil]')
    await expect(bara).toBeVisible()
    await expect(bara.locator('a[href^="' + WA + '"]')).toHaveCount(1)
    await expect(bara.locator('a[href="' + TEL + '"]')).toHaveCount(1)
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
  test('pagina RO-MD de proba: CTA "Mesaj pe WhatsApp" cu textul paginilor juridice, coloanele Juridic si Contact', async () => {
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
    expect(antet).toContain('Mesaj pe WhatsApp')
    expect(subsol).toContain('>Juridic</h2>')
    expect(hrefuri(subsol)).toContain(CALE_JURIDIC_RO)
    expect(hrefuri(subsol)).toContain(TEL)
    expect(html).not.toContain('<form')
  })
})
