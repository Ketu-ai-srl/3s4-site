import { spawn, spawnSync, type ChildProcess } from 'node:child_process'
import { cpSync, existsSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs'
import { createServer } from 'node:net'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { RADACINA } from './proiect'

/**
 * O copie a site-ului in care TOATE caile de care depinde navigatia sunt declarate existente,
 * construita si pornita pe un port liber.
 *
 * DE CE. Antetul e o piesa inghetata (COMPONENTE.md §6), dar in valurile intermediare navigatia e
 * filtrata pe rutele din RUTE (plan §5.1 regula 5): la S4-1 exista numai `/`, deci meniul mare si
 * panoul Descarca nu se randeaza deloc pe build-ul real. Fara copia asta, comportamentul lor
 * (hover, clic, tastatura, Escape) ar ramane nemasurat pana cand apar paginile tinta (S4-4).
 *
 * CE SE SCHIMBA IN COPIE, si numai atat:
 *   - `src/content/cai.ts`, rescris ca sa adauge caile tuturor legaturilor navigatiei;
 *   - `config/brand.json`, cu o adresa de e-mail SINTETICA (`POSTA_SINTETICA`, pe domeniul rezervat
 *     `.test`): pe build-ul real adresa marcii e goala pana o confirma owner-ul, deci randurile de
 *     posta (intrebarile startului, subsolul) nu se randeaza; copia le arata, ca sa poata fi masurate.
 * Restul e codul arborelui curent, construit cu acelasi `next build`. Sursa nu se atinge: o cale
 * sau o adresa de proba in codul de productie ar ajunge pe site.
 *
 * TREI CONTROALE, fiecare cu esec zgomotos: `cai.ts` rescris contine marcajul copiei, `brand.json`
 * rescris contine adresa sintetica (injectiile au aterizat) si build-ul copiei iese 0 (copia inca
 * se construieste). Al patrulea, vizibil in probe: antetul copiei are panoul Descarca, pe care
 * build-ul real il ascunde.
 *
 * LEGATURA `node_modules` e jonctiune (Windows) sau legatura simbolica (Linux): `rmSync` recursiv
 * sterge legatura, nu tinta - masurat pe Node 24 / Windows 11, tinta a ramas intacta.
 */

/** Marcajul scris in `cai.ts` al copiei; controlul cauta exact sirul asta. */
export const MARCAJ_COPIE = 'COPIE DE PROBA: navigatie completa'

/** Adresa marcii in copie. Domeniul `.test` e rezervat (RFC 2606): nu trimite nimic nicaieri. */
export const POSTA_SINTETICA = 'posta@marca-3s.test'

/** Ce intra in copie: exact ce citeste `next build`, nimic din probe, documente sau porti. */
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

const CAI_COPIE = `// ${MARCAJ_COPIE} (tests/browser/ajutor/copie-navigatie-completa.ts).
// Toate caile de care depinde navigatia sunt declarate existente, ca antetul sa se randeze intreg.
import { caiArticole } from "./blog/registru";
import { multimeaCailor, toateLegaturileNavigatiei, type CaiExistente } from "./navigatie";
import { RUTE } from "./rute";

export const CAI_EXISTENTE: CaiExistente = multimeaCailor(RUTE, [
  ...caiArticole(),
  ...toateLegaturileNavigatiei()
    .map((l) => l.ruta)
    .filter((r): r is string => r !== null),
]);
`

export type CopieCompleta = {
  /** Adresa serverului copiei, fara bara la final. */
  baza: string
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

/** Mediul copiei: fara `standalone` (copierea fisierelor urmarite nu e masurata aici). */
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

/** Pregateste copia, o construieste si o porneste. Arunca, cu motivul, la orice control picat. */
export async function pornesteCopiaCompleta(): Promise<CopieCompleta> {
  const director = mkdtempSync(join(tmpdir(), 'antet-intreg-'))
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

    const caleCai = join(director, 'src', 'content', 'cai.ts')
    writeFileSync(caleCai, CAI_COPIE, 'utf8')
    if (!readFileSync(caleCai, 'utf8').includes(MARCAJ_COPIE)) {
      throw new Error('controlul 1 a picat: cai.ts din copie nu poarta marcajul, injectia n-a aterizat')
    }

    const caleBrand = join(director, 'config', 'brand.json')
    const brand = JSON.parse(readFileSync(caleBrand, 'utf8')) as { email: string }
    writeFileSync(caleBrand, JSON.stringify({ ...brand, email: POSTA_SINTETICA }, null, 2) + '\n', 'utf8')
    if ((JSON.parse(readFileSync(caleBrand, 'utf8')) as { email: string }).email !== POSTA_SINTETICA) {
      throw new Error('controlul 2 a picat: brand.json din copie nu are adresa sintetica, injectia n-a aterizat')
    }

    const next = join(director, 'node_modules', 'next', 'dist', 'bin', 'next')
    const build = await ruleaza([next, 'build', '--no-lint'], director)
    if (build.cod !== 0) {
      throw new Error('controlul 3 a picat: build-ul copiei a iesit ' + build.cod + '\n' + coada(build.iesire))
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
