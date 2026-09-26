import { spawn, spawnSync, type ChildProcess } from 'node:child_process'
import { cpSync, existsSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs'
import { createServer } from 'node:net'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { RADACINA } from './proiect'

/**
 * Copia "operator pornit" a site-ului, pentru proba comutatorului (planul valului S4, §10): acelasi
 * cod, construit cu un operator de date SINTETIC in `config/operator.json` si cu un ID GA4 SINTETIC
 * in mediu. Pe build-ul real (operator `null`) bannerul, legatura "Setari cookie-uri" si evidenta nu
 * exista; pe copie trebuie sa existe toate, iar GA4 sa porneasca numai dupa accept.
 *
 * CE SE SCHIMBA IN COPIE, si numai atat:
 *   - `config/operator.json`: cheia `operator` primeste `OPERATOR_SINTETIC` (valori de proba, pe
 *     domeniul rezervat `.test`);
 *   - mediul construirii si al serverului: `NEXT_PUBLIC_GA4_ID` = `ID_GA4_SINTETIC`, fara
 *     autentificare de baza (evidenta trece prin ea pe mediile cu acces restrans).
 * Sursa nu se atinge: un operator de proba in codul de productie ar ajunge pe site.
 *
 * TREI CONTROALE, fiecare cu esec zgomotos: fisierul rescris are operatorul sintetic (fixtura a
 * aterizat), build-ul copiei iese 0 (site-ul inca se construieste) si HTML-ul construit al startului
 * poarta bannerul si ID-ul sintetic (comutatorul a ajuns pana in build, nu doar in fisier).
 *
 * Valorile se asambleaza la RULARE, din bucati (vezi `fixturi.ts`): o proba care poarta literal
 * ce vaneaza devine ea insasi o instanta a defectului pentru alte porti.
 *
 * JURNALUL serverului copiei se pastreaza: evidenta consimtamantului e un rand in el
 * (`src/middleware.ts`), si proba il citeste de acolo.
 */

/** ID-ul GA4 al copiei: are forma unui ID real (`G-` + litere mari si cifre), dar nu e al nimanui. */
export const ID_GA4_SINTETIC = ['G', 'COMUTATOR' + String(44)].join('-')

/** Operatorul copiei: fiecare camp din `_forma`, cu valori evident de proba. */
export const OPERATOR_SINTETIC: Record<string, string> = {
  denumire: ['Operator', 'Sintetic', 'Proba', 'SRL'].join(' '),
  sediu: ['Strada Exemplului 1', 'Pitesti'].join(', '),
  email: ['date', ['operator-3s', 'test'].join('.')].join('@'),
  telefon: '',
  numar_orc: '',
  cod_fiscal: '',
  tara: 'România',
  dpo: '',
}

const DE_COPIAT = [
  'src',
  'public',
  'config',
  'package.json',
  'pnpm-lock.yaml',
  'next.config.ts',
  'tsconfig.json',
  'postcss.config.mjs',
]

export type CopieOperator = {
  /** Adresa serverului copiei, fara bara la final. */
  baza: string
  /** Tot ce a scris serverul copiei pana acum (stdout si stderr). */
  jurnal: () => string
  opreste: () => Promise<void>
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

function mediu(): NodeJS.ProcessEnv {
  const m: NodeJS.ProcessEnv = {
    ...process.env,
    BUILD_STANDALONE: '',
    NEXT_TELEMETRY_DISABLED: '1',
    SITE_ENV: 'local',
    NEXT_PUBLIC_GA4_ID: ID_GA4_SINTETIC,
  }
  delete m.BASIC_AUTH_USER
  delete m.BASIC_AUTH_PASS
  return m
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

/** Pregateste copia, o construieste si o porneste. Arunca, cu motivul, la orice control picat. */
export async function pornesteCopiaOperator(): Promise<CopieOperator> {
  const director = mkdtempSync(join(tmpdir(), 'comutator-'))
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

    const caleOperator = join(director, 'config', 'operator.json')
    const configurare = JSON.parse(readFileSync(caleOperator, 'utf8')) as Record<string, unknown>
    writeFileSync(caleOperator, JSON.stringify({ ...configurare, operator: OPERATOR_SINTETIC }, null, 2) + '\n', 'utf8')
    const scris = JSON.parse(readFileSync(caleOperator, 'utf8')) as { operator: Record<string, string> | null }
    if (scris.operator?.denumire !== OPERATOR_SINTETIC.denumire) {
      throw new Error('controlul 1 a picat: operator.json din copie nu are operatorul sintetic, injectia n-a aterizat')
    }

    const next = join(director, 'node_modules', 'next', 'dist', 'bin', 'next')
    const build = await ruleaza([next, 'build', '--no-lint'], director)
    if (build.cod !== 0) {
      throw new Error('controlul 2 a picat: build-ul copiei a iesit ' + build.cod + '\n' + coada(build.iesire))
    }

    const startul = readFileSync(join(director, '.next', 'server', 'app', 'index.html'), 'utf8')
    if (!startul.includes('data-consimtamant') || !startul.includes(ID_GA4_SINTETIC)) {
      throw new Error(
        'controlul 3 a picat: startul construit nu poarta bannerul si ID-ul sintetic, comutatorul n-a ajuns in build',
      )
    }

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
      if (pornit.exitCode !== null) {
        throw new Error('serverul copiei s-a oprit cu ' + pornit.exitCode + '\n' + coada(jurnal))
      }
      try {
        const raspuns = await fetch(baza + '/')
        if (raspuns.ok) break
      } catch {
        // inca porneste
      }
      if (Date.now() > termen) throw new Error('serverul copiei nu raspunde in 60 s\n' + coada(jurnal))
      await new Promise((r) => setTimeout(r, 250))
    }

    return {
      baza,
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
