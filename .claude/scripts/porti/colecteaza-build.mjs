#!/usr/bin/env node
// Colectia unui build: ce serveste `next start` pe build-ul din `.next`, cale cu cale, scris pe disc ca sa poata fi
// comparat cu colectia altui build (`compara-build.py`).
//
// DE CE EXISTA. Doua intrebari care nu se pot pune pe surse, ci numai pe ce iese din server:
//   - invarianta relativa: o felie care declara ca nu schimba un site (3s.md sau site-ul RO) il construieste pe baza
//     si pe felie si cere zero diferente, pe TOATE rutele, nu pe cateva pagini-martor;
//   - identitatea a doua domenii construite din acelasi cod: aceleasi pagini, cu o lista inchisa de diferente.
//
// CE COLECTEAZA. Lista cailor = rutele prerandate din `.next/prerender-manifest.json` (paginile, imaginile, harta,
// robots, llms, manifestul, security.txt, calendarul), plus cele cerute oricum: `/`, `/robots.txt`, `/sitemap.xml`,
// `/llms.txt`, `/manifest.webmanifest`, `/.well-known/security.txt`, o cale care nu exista, si caile din `--cai`
// (fisier JSON, lista de siruri). Pentru fiecare: statusul, antetele `Content-Type`, `Content-Language`,
// `X-Robots-Tag` si `Location` (redirectarile nu se urmeaza), apoi corpul: textul ca atare, binarul prin sha256.
//
// CE NU COLECTEAZA: rutele dinamice neprerandate (`/api/...`) si comportamentul din browser dupa hidratare. Normalizarea
// (id-ul build-ului, numele cu amprenta) NU se face aici, ci in `compara-build.py`, ca sa se poata aplica pe textul
// brut regulile de identitate care au nevoie de context (de pilda adresele dintr-o legatura hreflang).
//
// Folosire (din radacina depozitului, dupa `pnpm build`):
//   node .claude/scripts/porti/colecteaza-build.mjs --iesire <director> [--port 4760] [--cai <fisier.json>]
// Iesire: 0 colectia e scrisa | 2 folosire gresita | 3 NEMASURAT (build lipsa, serverul nu porneste, o cerere esueaza)
import { spawn, spawnSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const NEMASURAT = 3
const CAI_CERUTE = ['/', '/robots.txt', '/sitemap.xml', '/llms.txt', '/manifest.webmanifest', '/.well-known/security.txt']
/** O cale care nu exista pe niciun profil: pagina de negasit, asa cum o serveste build-ul. */
const CALE_INEXISTENTA = '/colectie-cale-inexistenta-404'
const ANTETE = ['content-type', 'content-language', 'x-robots-tag', 'location']
/** Tipurile de continut citite ca text (restul se compara prin sha256). */
const TEXT = /^(text\/|application\/(xml|json|manifest\+json|javascript|ld\+json)|image\/svg\+xml)/

function moare(cod, mesaj) {
  console.error((cod === NEMASURAT ? 'NEMASURAT: ' : 'EROARE: ') + mesaj)
  process.exit(cod)
}

function argumente(argv) {
  const a = { iesire: '', port: 4760, cai: '' }
  for (let i = 0; i < argv.length; i++) {
    const v = argv[i + 1]
    const cheie = { '--iesire': 'iesire', '--port': 'port', '--cai': 'cai' }[argv[i]]
    if (!cheie || !v) moare(2, 'argument necunoscut sau fara valoare: ' + argv[i])
    a[cheie] = cheie === 'port' ? Number(v) : v
    i++
  }
  if (!a.iesire) moare(2, '--iesire <director> e obligatoriu')
  if (!Number.isInteger(a.port) || a.port < 1024) moare(2, '--port trebuie sa fie un numar >= 1024')
  return a
}

/** Lista cailor: prerandatele build-ului + cele cerute + `--cai`, fara dubluri, sortata. */
function listaCai(radacina, fisierCai) {
  const manifest = JSON.parse(readFileSync(join(radacina, '.next', 'prerender-manifest.json'), 'utf8'))
  const cai = new Set([...Object.keys(manifest.routes ?? {}), ...CAI_CERUTE, CALE_INEXISTENTA])
  if (fisierCai) {
    const extra = JSON.parse(readFileSync(fisierCai, 'utf8'))
    if (!Array.isArray(extra) || extra.some((c) => typeof c !== 'string' || !c.startsWith('/'))) {
      moare(2, '--cai trebuie sa fie o lista JSON de cai care incep cu /')
    }
    for (const c of extra) cai.add(c)
  }
  return [...cai].sort()
}

function opreste(copil) {
  if (copil.pid === undefined || copil.exitCode !== null) return
  // Numai arborele procesului pornit aici.
  if (process.platform === 'win32') spawnSync('taskkill', ['/pid', String(copil.pid), '/T', '/F'], { stdio: 'ignore' })
  else copil.kill('SIGTERM')
}

async function main() {
  const a = argumente(process.argv.slice(2))
  const radacina = process.cwd()
  const fisierId = join(radacina, '.next', 'BUILD_ID')
  if (!existsSync(fisierId)) moare(NEMASURAT, 'nu exista build in ' + join(radacina, '.next') + ' (lipseste BUILD_ID)')
  const idBuild = readFileSync(fisierId, 'utf8').trim()
  const cai = listaCai(radacina, a.cai)
  const next = join(radacina, 'node_modules', 'next', 'dist', 'bin', 'next')
  if (!existsSync(next)) moare(NEMASURAT, 'next nu e instalat in ' + radacina)

  const baza = 'http://127.0.0.1:' + a.port
  let jurnal = ''
  const server = spawn(process.execPath, [next, 'start', '--hostname', '127.0.0.1', '--port', String(a.port)], {
    cwd: radacina,
    env: { ...process.env, NEXT_TELEMETRY_DISABLED: '1' },
  })
  server.stdout.on('data', (b) => (jurnal += String(b)))
  server.stderr.on('data', (b) => (jurnal += String(b)))
  process.once('exit', () => opreste(server))

  try {
    const termen = Date.now() + 90_000
    for (;;) {
      if (server.exitCode !== null) moare(NEMASURAT, 'serverul s-a oprit cu ' + server.exitCode + '\n' + jurnal.slice(-3000))
      try {
        if ((await fetch(baza + '/robots.txt')).ok) break
      } catch {
        // inca porneste
      }
      if (Date.now() > termen) moare(NEMASURAT, 'serverul nu raspunde in 90 s\n' + jurnal.slice(-3000))
      await new Promise((r) => setTimeout(r, 250))
    }

    rmSync(a.iesire, { recursive: true, force: true })
    mkdirSync(join(a.iesire, 'corp'), { recursive: true })
    const pagini = []
    for (const [i, cale] of cai.entries()) {
      let r
      try {
        r = await fetch(baza + cale, { redirect: 'manual' })
      } catch (e) {
        moare(NEMASURAT, 'cererea ' + cale + ' a esuat: ' + String(e))
      }
      const antete = {}
      for (const h of ANTETE) {
        const v = r.headers.get(h)
        if (v !== null) antete[h] = v
      }
      const octeti = Buffer.from(await r.arrayBuffer())
      const text = TEXT.test(antete['content-type'] ?? '')
      const fisier = 'corp/' + String(i).padStart(4, '0') + (text ? '.txt' : '.bin')
      writeFileSync(join(a.iesire, fisier), octeti)
      pagini.push({ cale, status: r.status, antete, fisier, text, sha256: createHash('sha256').update(octeti).digest('hex') })
    }
    const colectie = { format: 1, idBuild, caleInexistenta: CALE_INEXISTENTA, pagini }
    writeFileSync(join(a.iesire, 'colectie.json'), JSON.stringify(colectie, null, 2) + '\n', 'utf8')
    const statusuri = {}
    for (const p of pagini) statusuri[p.status] = (statusuri[p.status] ?? 0) + 1
    console.log('colectie scrisa in ' + a.iesire + ': ' + pagini.length + ' cai, statusuri ' + JSON.stringify(statusuri) + ', build ' + idBuild)
  } finally {
    opreste(server)
  }
}

await main()
