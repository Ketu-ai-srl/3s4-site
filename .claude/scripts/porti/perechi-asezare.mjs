#!/usr/bin/env node
// Fisierul de perechi pentru proba de identitate a doua domenii (`compara-build.py --regula identitate --perechi`).
//
// DE CE EXISTA. Doua aplicatii construite din acelasi cod, cu asezari diferite (`src/lib/asezare.ts`): pe una romana
// sta sub `/ro`, pe cealalta la radacina. Comparatia lor cere, pentru fiecare cale a primului domeniu, calea
// geamana a celui de-al doilea, plus valorile care au voie sa difere (originea, contactele, limba romanei). Caile
// NU se scriu de mana: vin din manifestul de rute al build-ului (`src/content/rute.ts`), trecute prin aceeasi
// regula pe care o folosesc paginile (`perechiAsezare`), deci perechile nu pot diverge de site.
//
// DE UNDE VIN VALORILE. Din doua fisiere de profil (`config/profil-*.json`, variabilele de construire ale unei
// aplicatii): originea si domeniul din `SITE_URL`; e-mailul si numarul afisat ale operatorului din `OPERATOR_JSON`
// (cele din textele juridice); numarul E.164 si cifrele de WhatsApp din `CANALE_JSON`; limba si `og:locale` ale
// romanei din catalogul asezarii (`SITE_ASEZARE` a profilului, implicit `md`). Rutele se calculeaza cu mediul
// profilului A (editiile si operatorul decid ce pagini juridice exista).
//
// PICTOGRAMELE din `src/app` intra ca fisiere ale domeniului, citite din director (aceeasi cale pe ambele parti).
//
// CU `--colectie` (colectia build-ului A, scrisa de `colecteaza-build.mjs`): perechile trebuie sa acopere EXACT
// caile colectiei (in afara paginii de negasit). O cale a colectiei fara pereche, sau o pereche fara cale in
// colectie, e NEMASURAT: lista de fisiere ale domeniului din `asezare.ts` s-a invechit, iar o imperechere tacuta
// a caii cu ea insasi ar ascunde exact diferenta pe care proba o cauta.
//
// Folosire (din radacina depozitului):
//   node .claude/scripts/porti/perechi-asezare.mjs --profil-a <profil.json> --profil-b <profil.json> --iesire <fisier.json>
//        [--colectie <director colectie A>]
// Iesire: 0 fisierul e scris | 2 folosire gresita | 3 NEMASURAT (profil fara o valoare, colectia nu se potriveste)
import { registerHooks } from 'node:module'
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const NEMASURAT = 3
const RADACINA = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', '..')
/**
 * Pictogramele din `src/app` (conventia de metadate Next: `favicon.ico`, `icon.*`, `<nume>-icon.*`), servite la radacina
 * pe orice asezare. Se citesc din director, nu se scriu de mana: lista urmeaza arborele.
 */
const PICTOGRAMA = /^(?:favicon\.ico|(?:[a-z]+-)?icon\d*\.(?:ico|jpe?g|png|svg))$/i
/** Paginile de negasit ale colectiei nu au pereche: le compara separat `compara-build.py` (numai statusul). */
const NEGASIT_MANIFEST = '/_not-found'

function moare(cod, mesaj) {
  console.error((cod === NEMASURAT ? 'NEMASURAT: ' : 'EROARE: ') + mesaj)
  process.exit(cod)
}

function argumente(argv) {
  const a = { profilA: '', profilB: '', iesire: '', colectie: '' }
  const chei = { '--profil-a': 'profilA', '--profil-b': 'profilB', '--iesire': 'iesire', '--colectie': 'colectie' }
  for (let i = 0; i < argv.length; i += 2) {
    const cheie = chei[argv[i]]
    if (!cheie || !argv[i + 1]) moare(2, 'argument necunoscut sau fara valoare: ' + argv[i])
    a[cheie] = argv[i + 1]
  }
  if (!a.profilA || !a.profilB || !a.iesire) moare(2, '--profil-a, --profil-b si --iesire sunt obligatorii')
  return a
}

// Modulele site-ului sunt TypeScript, cu importuri fara extensie si JSON fara atribut de import: Node le ruleaza
// singur (tipurile se sterg), dar numai cu aceste doua adaptari, scrise aici ca sa nu ceara nicio unealta in plus.
registerHooks({
  resolve(specificator, context, urmator) {
    if (specificator.startsWith('.') && context.parentURL?.startsWith('file:')) {
      const cale = fileURLToPath(new URL(specificator, context.parentURL))
      if (!existsSync(cale) || !/\.[a-z]+$/i.test(cale)) {
        for (const ext of ['.ts', '.tsx', '/index.ts']) {
          if (existsSync(cale + ext)) return { url: pathToFileURL(cale + ext).href, shortCircuit: true }
        }
      }
    }
    return urmator(specificator, context)
  },
  load(url, context, urmator) {
    if (url.startsWith('file:') && url.endsWith('.json')) {
      return { format: 'module', source: 'export default ' + readFileSync(fileURLToPath(url), 'utf8'), shortCircuit: true }
    }
    // Formatul spus direct: fara el Node ghiceste (CommonJS, apoi modul) si avertizeaza la fiecare fisier.
    if (url.startsWith('file:') && url.endsWith('.ts')) {
      return { format: 'module-typescript', source: readFileSync(fileURLToPath(url), 'utf8'), shortCircuit: true }
    }
    return urmator(url, context)
  },
})

function citesteJson(cale, ce) {
  try {
    return JSON.parse(readFileSync(cale, 'utf8'))
  } catch (e) {
    return moare(NEMASURAT, ce + ' nu se poate citi (' + cale + '): ' + e.message)
  }
}

/** Valoarea unei variabile din profil, ca text (un obiect se scrie ca JSON, ca in mediul aplicatiei). */
function text(profil, cheie) {
  const v = profil[cheie]
  return v === undefined ? '' : typeof v === 'string' ? v : JSON.stringify(v)
}

/** Valorile unui domeniu, in cheile cerute de `compara-build.py` (lista inchisa, toate nevide). */
function valori(profil, nume, ASEZARI, asezareDinText) {
  const operator = (typeof profil.OPERATOR_JSON === 'object' && profil.OPERATOR_JSON?.operator) || {}
  const canale = typeof profil.CANALE_JSON === 'object' && profil.CANALE_JSON !== null ? profil.CANALE_JSON : {}
  let url
  try {
    url = new URL(text(profil, 'SITE_URL'))
  } catch {
    return moare(NEMASURAT, nume + ': SITE_URL lipseste sau nu e o adresa')
  }
  const romana = ASEZARI[asezareDinText(text(profil, 'SITE_ASEZARE'))]['ro-MD']
  const v = {
    origine: url.origin,
    domeniu: url.host,
    email: operator.email ?? '',
    telefonAfisat: operator.telefon ?? '',
    telefonE164: canale.telefon ?? '',
    whatsapp: canale.whatsapp ?? '',
    limba: romana.inLanguage,
    ogLocale: romana.ogLocale,
  }
  const goale = Object.entries(v).filter(([, x]) => typeof x !== 'string' || x === '').map(([k]) => k)
  if (goale.length > 0) moare(NEMASURAT, nume + ': valori goale sau lipsa: ' + goale.join(', '))
  return v
}

/** Potrivirea exacta intre perechi si colectia lui A. Intoarce lista problemelor. */
function problemeColectie(perechi, director) {
  const col = citesteJson(join(director, 'colectie.json'), 'colectia')
  if (col.format !== 1 || !Array.isArray(col.pagini)) moare(NEMASURAT, 'colectia ' + director + ' nu are formatul 1')
  const inColectie = new Set(col.pagini.map((p) => p.cale))
  inColectie.delete(NEGASIT_MANIFEST)
  if (col.caleInexistenta) inColectie.delete(col.caleInexistenta)
  const inPerechi = new Set(perechi.map((p) => p.a))
  const probleme = []
  for (const c of [...inColectie].sort()) if (!inPerechi.has(c)) probleme.push('calea colectiei fara pereche: ' + c)
  for (const c of [...inPerechi].sort()) if (!inColectie.has(c)) probleme.push('pereche fara cale in colectie: ' + c)
  return { probleme, numar: inColectie.size }
}

const a = argumente(process.argv.slice(2))
const profilA = citesteJson(resolve(a.profilA), 'profilul A')
const profilB = citesteJson(resolve(a.profilB), 'profilul B')

// Mediul profilului A, inainte de primul import al site-ului: manifestul de rute se calculeaza la incarcare.
for (const k of Object.keys(profilA)) if (!k.startsWith('_')) process.env[k] = text(profilA, k)
for (const k of ['NEXT_PUBLIC_SITE_EDITII', 'NEXT_PUBLIC_SITE_ASEZARE', 'NEXT_PUBLIC_OPERATOR_NUMIT', 'NEXT_PUBLIC_FAMILIE_JURIDICA']) delete process.env[k]

const { ASEZARI, asezareDinText, perechiAsezare } = await import(pathToFileURL(join(RADACINA, 'src', 'lib', 'asezare.ts')).href)
const { RUTE } = await import(pathToFileURL(join(RADACINA, 'src', 'content', 'rute.ts')).href)

const va = valori(profilA, 'profilul A', ASEZARI, asezareDinText)
const vb = valori(profilB, 'profilul B', ASEZARI, asezareDinText)
let perechi
try {
  const pictograme = readdirSync(join(RADACINA, 'src', 'app')).filter((n) => PICTOGRAMA.test(n)).sort().map((n) => '/' + n)
  perechi = perechiAsezare(RUTE, asezareDinText(text(profilA, 'SITE_ASEZARE')), asezareDinText(text(profilB, 'SITE_ASEZARE')), pictograme)
} catch (e) {
  moare(NEMASURAT, e.message)
}
if (RUTE.length === 0 || perechi.length === 0) moare(NEMASURAT, 'zero rute pe profilul A (zero nu e un fisier de perechi)')

if (a.colectie) {
  const { probleme, numar } = problemeColectie(perechi, resolve(a.colectie))
  if (probleme.length > 0) moare(NEMASURAT, probleme.length + ' nepotriviri cu colectia (' + numar + ' cai):\n  ' + probleme.join('\n  '))
  console.log('colectia A: ' + numar + ' cai, toate imperecheate')
}

const fisier = {
  _nota: 'Scris de .claude/scripts/porti/perechi-asezare.mjs din manifestul de rute si din profilurile ' + a.profilA + ' si ' + a.profilB + '; nu se editeaza de mana.',
  a: va,
  b: vb,
  perechi,
}
writeFileSync(resolve(a.iesire), JSON.stringify(fisier, null, 2) + '\n', 'utf8')
const traduse = perechi.filter((p) => p.a !== p.b).length
console.log('perechi scrise in ' + a.iesire + ': ' + perechi.length + ' (' + RUTE.length + ' rute, ' + traduse + ' cai traduse), ' + va.origine + ' -> ' + vb.origine)
