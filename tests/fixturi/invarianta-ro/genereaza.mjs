// Produce fixturile probei de invarianta RO (tests/invarianta-ro.test.ts) din build-ul aflat in `.next`.
//
// SE RULEAZA NUMAI PE BAZA, inainte de schimbarea a carei invarianta o masuram: fixturile sunt
// fotografia build-ului RO de dinainte. Rulata dupa schimbare, comanda ar face proba sa compare build-ul
// cu el insusi. Pasi: `pnpm build` (fara SITE_EDITII, fara operator), apoi, din radacina depozitului,
// `node tests/fixturi/invarianta-ro/genereaza.mjs`. Normalizarea e aceeasi functie pe care o foloseste proba.
import { createHash } from 'node:crypto'
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'

const radacina = process.cwd()
const { normalizeaza, PAGINI_MARTOR } = await import(pathToFileURL(join(radacina, 'tests', 'fixturi', 'invarianta-ro', 'normalizeaza.ts')).href)
const app = join(radacina, '.next', 'server', 'app')
const idBuild = readFileSync(join(radacina, '.next', 'BUILD_ID'), 'utf8')
const start = readFileSync(join(app, 'index.html'), 'utf8')
if (!start.includes('<html lang="ro"')) throw new Error('build-ul din .next nu e cel romanesc (startul nu are lang="ro")')

const destinatie = join(radacina, 'tests', 'fixturi', 'invarianta-ro', 'pagini')
mkdirSync(destinatie, { recursive: true })
for (const p of PAGINI_MARTOR) {
  writeFileSync(join(destinatie, p.fisier), normalizeaza(readFileSync(join(app, p.fisier), 'utf8'), idBuild), 'utf8')
}
const harta = [...readFileSync(join(app, 'sitemap.xml.body'), 'utf8').matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1])
const termeneIcsSha256 = createHash('sha256').update(readFileSync(join(app, 'instrumente', 'termene.ics.body'))).digest('hex')
const paginiHtml = readdirSync(app, { recursive: true })
  .map((f) => String(f).split(String.fromCharCode(92)).join('/'))
  .filter((f) => f.endsWith('.html'))
  .sort()
writeFileSync(join(radacina, 'tests', 'fixturi', 'invarianta-ro', 'baza.json'), JSON.stringify({ harta, termeneIcsSha256, paginiHtml }, null, 2) + '\n', 'utf8')
console.log('fixturi scrise: ' + PAGINI_MARTOR.length + ' pagini, ' + harta.length + ' adrese in harta, ' + paginiHtml.length + ' fisiere html')
