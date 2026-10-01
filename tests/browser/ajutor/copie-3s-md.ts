import { spawn, spawnSync, type ChildProcess } from 'node:child_process'
import { cpSync, existsSync, mkdtempSync, readFileSync, rmSync, symlinkSync } from 'node:fs'
import { createServer } from 'node:net'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { RADACINA } from './proiect'

/**
 * Copia "3s.md" a site-ului (fundatia editiilor, `src/lib/editii.ts`): acelasi cod, construit si pornit cu
 * variabilele aplicatiei 3s.md din `config/profil-3s-md.json` (engleza la radacina, romana pentru Republica
 * Moldova sub `/ro`, operatorul-model, mediul de proba). Pentru probele de browser ale feliilor care aduc
 * paginile EN si RO-MD: build-ul real al probelor e cel romanesc, deci paginile lor nu exista acolo.
 *
 * CE SE SCHIMBA IN COPIE: numai mediul construirii si al serverului (variabilele profilului, peste un mediu din
 * care s-au scos variabilele de domeniu mostenite). Sursa si fisierele de configurare nu se ating.
 *
 * DOUA CONTROALE, fiecare cu esec zgomotos: build-ul copiei iese 0 (profilul inca se construieste) si serverul
 * raspunde cu `robots.txt` (ruta exista pe ambele profile; startul `/` poate fi 404 cat timp editia EN nu are
 * pagina de start, deci nu e un semn de viata).
 */

const DE_COPIAT = ['src', 'public', 'config', 'package.json', 'pnpm-lock.yaml', 'next.config.ts', 'tsconfig.json', 'postcss.config.mjs']

/** Variabilele de domeniu: se sterg din mediul mostenit, ca masina sa nu poata schimba copia. */
const VARIABILE_DOMENIU = [
  'SITE_URL', 'SITE_ENV', 'SITE_EDITII', 'SITE_ALTERNATE', 'OPERATOR_JSON', 'UMAMI_URL', 'UMAMI_WEBSITE_ID', 'INDEXNOW_KEY',
  'NEXT_PUBLIC_GA4_ID', 'FORMULARE_DESTINATIE', 'FORMULARE_SECRET', 'GOOGLE_SITE_VERIFICATION', 'BASIC_AUTH_USER', 'BASIC_AUTH_PASS',
  'CANALE_JSON',
]

/** Variabilele aplicatiei 3s.md, din profil: cheile cu `_` sunt note, o valoare obiect se scrie ca JSON. */
export function mediuProfil3sMd(cale: string = join(RADACINA, 'config', 'profil-3s-md.json')): Record<string, string> {
  const profil = JSON.parse(readFileSync(cale, 'utf8')) as Record<string, unknown>
  const mediu: Record<string, string> = {}
  for (const [cheie, valoare] of Object.entries(profil)) {
    if (cheie.startsWith('_')) continue
    mediu[cheie] = typeof valoare === 'string' ? valoare : JSON.stringify(valoare)
  }
  return mediu
}

export type Copie3sMd = {
  /** Adresa serverului copiei, fara bara la final. */
  baza: string
  /** Directorul copiei (pentru citirea build-ului: `.next/server/app`). */
  director: string
  /** Tot ce a scris `next build` al copiei. */
  iesireBuild: string
  /** Tot ce a scris serverul copiei pana acum (stdout si stderr). */
  jurnal: () => string
  opreste: () => Promise<void>
}

function mediu(extra: Record<string, string>): NodeJS.ProcessEnv {
  const m: NodeJS.ProcessEnv = { ...process.env, BUILD_STANDALONE: '', NEXT_TELEMETRY_DISABLED: '1' }
  for (const v of VARIABILE_DOMENIU) delete m[v]
  return { ...m, ...extra }
}

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

/**
 * Pregateste copia, o construieste cu profilul 3s.md si o porneste. `extra` se pune peste variabilele profilului
 * (de pilda `SITE_ENV`). Arunca, cu motivul, la orice control picat.
 */
export async function pornesteCopia3sMd(extra: Record<string, string> = {}): Promise<Copie3sMd> {
  const director = mkdtempSync(join(tmpdir(), 'profil-3s-md-'))
  const sterge = () => rmSync(director, { recursive: true, force: true })
  const env = mediu({ ...mediuProfil3sMd(), ...extra })
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

    const next = join(director, 'node_modules', 'next', 'dist', 'bin', 'next')
    const build = await ruleaza([next, 'build', '--no-lint'], director, env)
    if (build.cod !== 0) {
      throw new Error('controlul 1 a picat: build-ul copiei 3s.md a iesit ' + build.cod + '\n' + coada(build.iesire))
    }

    const port = await portLiber()
    const baza = 'http://127.0.0.1:' + port
    let jurnal = ''
    const pornit = spawn(process.execPath, [next, 'start', '--hostname', '127.0.0.1', '--port', String(port)], {
      cwd: director,
      env,
      detached: process.platform !== 'win32',
    })
    server = pornit
    pornit.stdout?.on('data', (b) => (jurnal += String(b)))
    pornit.stderr?.on('data', (b) => (jurnal += String(b)))

    const termen = Date.now() + 60_000
    for (;;) {
      if (pornit.exitCode !== null) {
        throw new Error('serverul copiei 3s.md s-a oprit cu ' + pornit.exitCode + '\n' + coada(jurnal))
      }
      try {
        if ((await fetch(baza + '/robots.txt')).ok) break
      } catch {
        // inca porneste
      }
      if (Date.now() > termen) throw new Error('controlul 2 a picat: serverul copiei 3s.md nu raspunde in 60 s\n' + coada(jurnal))
      await new Promise((r) => setTimeout(r, 250))
    }

    return {
      baza,
      director,
      iesireBuild: build.iesire,
      jurnal: () => jurnal,
      opreste: async () => {
        opresteProcesul(pornit)
        process.removeListener('exit', laIesire)
        // Windows elibereaza fisierele procesului oprit cu o mica intarziere.
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
