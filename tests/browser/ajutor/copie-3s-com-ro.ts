import { spawn, spawnSync, type ChildProcess } from 'node:child_process'
import { cpSync, existsSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs'
import { createServer } from 'node:net'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { RADACINA } from './proiect'

/**
 * Copia "3s.com.ro" a site-ului (asezarea `ro`, `src/lib/asezare.ts`): acelasi cod, construit si pornit cu variabilele
 * aplicatiei 3s.com.ro din `config/profil-3s-com-ro.json` (romana la radacina, engleza sub `/en`, acelasi operator ca
 * 3s.md, contactele domeniului). Dupa modelul `copie-3s-md.ts`: build-ul real al probelor e cel romanesc vechi, deci
 * arborele asezarii `ro` (`(comro)`, `(comroen)`) nu exista acolo.
 *
 * CE SE SCHIMBA IN COPIE: mediul construirii si al serverului (variabilele profilului, peste un mediu din care s-au scos
 * variabilele de domeniu mostenite) si, NUMAI cand se cer, `mutatii`: inlocuiri de text in fisierele COPIEI, pentru
 * mutantii care dovedesc ca o proba prinde ce vaneaza (fiecare mutatie trebuie sa aterizeze exact o data, altfel copia
 * nu se construieste). Sursa depozitului nu se atinge niciodata.
 *
 * DOUA CONTROALE, fiecare cu esec zgomotos: build-ul copiei iese 0 si serverul raspunde cu `robots.txt`.
 */

const DE_COPIAT = ['src', 'public', 'config', 'package.json', 'pnpm-lock.yaml', 'next.config.ts', 'tsconfig.json', 'postcss.config.mjs']

/** Variabilele de domeniu: se sterg din mediul mostenit, ca masina sa nu poata schimba copia. */
const VARIABILE_DOMENIU = [
  'SITE_URL', 'SITE_ENV', 'SITE_EDITII', 'SITE_ASEZARE', 'SITE_ALTERNATE', 'OPERATOR_JSON', 'UMAMI_URL', 'UMAMI_WEBSITE_ID',
  'INDEXNOW_KEY', 'NEXT_PUBLIC_GA4_ID', 'FORMULARE_DESTINATIE', 'FORMULARE_SECRET', 'GOOGLE_SITE_VERIFICATION', 'BASIC_AUTH_USER',
  'BASIC_AUTH_PASS', 'CANALE_JSON',
]

/** Variabilele aplicatiei 3s.com.ro, din profil: cheile cu `_` sunt note, o valoare obiect se scrie ca JSON. */
export function mediuProfil3sComRo(cale: string = join(RADACINA, 'config', 'profil-3s-com-ro.json')): Record<string, string> {
  const profil = JSON.parse(readFileSync(cale, 'utf8')) as Record<string, unknown>
  const mediu: Record<string, string> = {}
  for (const [cheie, valoare] of Object.entries(profil)) {
    if (cheie.startsWith('_')) continue
    mediu[cheie] = typeof valoare === 'string' ? valoare : JSON.stringify(valoare)
  }
  return mediu
}

/** O inlocuire de text intr-un fisier al copiei (cale relativa la radacina depozitului). */
export type Mutatie = { fisier: string; ancora: string; inlocuire: string }

export type Copie3sComRo = {
  /** Adresa serverului copiei, fara bara la final. */
  baza: string
  /** Directorul copiei (are `.next` si `node_modules`, deci `colecteaza-build.mjs` poate rula cu el drept director curent). */
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

/** Aplica mutatiile pe copie; arunca daca o ancora lipseste sau apare de mai multe ori (mutantul n-ar masura nimic). */
function aplicaMutatii(director: string, mutatii: readonly Mutatie[]): void {
  for (const m of mutatii) {
    const cale = join(director, m.fisier)
    const text = readFileSync(cale, 'utf8')
    const aparitii = text.split(m.ancora).length - 1
    if (aparitii !== 1) throw new Error('mutatia nu aterizeaza: ancora apare de ' + aparitii + ' ori in ' + m.fisier)
    writeFileSync(cale, text.replace(m.ancora, m.inlocuire), 'utf8')
    if (!readFileSync(cale, 'utf8').includes(m.inlocuire)) throw new Error('mutatia nu s-a scris in ' + m.fisier)
  }
}

/**
 * Pregateste copia, o construieste cu profilul 3s.com.ro (plus `mutatii`, daca se dau) si o porneste. `extra` se pune
 * peste variabilele profilului. Arunca, cu motivul, la orice control picat.
 */
export async function pornesteCopia3sComRo(extra: Record<string, string> = {}, mutatii: readonly Mutatie[] = []): Promise<Copie3sComRo> {
  const director = mkdtempSync(join(tmpdir(), 'profil-3s-com-ro-'))
  const sterge = () => rmSync(director, { recursive: true, force: true })
  const env = mediu({ ...mediuProfil3sComRo(), ...extra })
  let server: ChildProcess | null = null
  const laIesire = () => server && opresteProcesul(server)
  process.once('exit', laIesire)

  try {
    for (const intrare of DE_COPIAT) {
      const sursa = join(RADACINA, intrare)
      if (!existsSync(sursa)) throw new Error('copia nu se poate face: lipseste ' + sursa)
      cpSync(sursa, join(director, intrare), { recursive: true })
    }
    aplicaMutatii(director, mutatii)
    symlinkSync(join(RADACINA, 'node_modules'), join(director, 'node_modules'), 'junction')

    const next = join(director, 'node_modules', 'next', 'dist', 'bin', 'next')
    const build = await ruleaza([next, 'build', '--no-lint'], director, env)
    if (build.cod !== 0) {
      throw new Error('controlul 1 a picat: build-ul copiei 3s.com.ro a iesit ' + build.cod + '\n' + coada(build.iesire))
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
        throw new Error('serverul copiei 3s.com.ro s-a oprit cu ' + pornit.exitCode + '\n' + coada(jurnal))
      }
      try {
        if ((await fetch(baza + '/robots.txt')).ok) break
      } catch {
        // inca porneste
      }
      if (Date.now() > termen) throw new Error('controlul 2 a picat: serverul copiei 3s.com.ro nu raspunde in 60 s\n' + coada(jurnal))
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
