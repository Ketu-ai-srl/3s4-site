import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join, resolve } from 'node:path'

// Radacina repo-ului, dedusa din locul fisierului, nu din cwd: Playwright poate fi
// pornit din alt director, iar o cale relativa la cwd ar face portile sa masoare alt
// arbore fara sa spuna nimic.
export const RADACINA = resolve(__dirname, '..', '..', '..')

/** Marcaj de masuratoare invalida. Vezi `browser-rulator.mjs`, care il traduce in iesire 3. */
export const NEMASURAT = 'NEMASURAT:'

export function nemasurat(motiv: string): never {
  throw new Error(NEMASURAT + ' ' + motiv)
}

/** Un segment dinamic de App Router: `[x]`, `[...x]` sau `[[...x]]`. */
export function esteSegmentDinamic(nume: string): boolean {
  return nume.startsWith('[') && nume.endsWith(']')
}

/**
 * Tiparele rutelor, DEDUSE din `src/app`, nu scrise de mana: fiecare `page.tsx` e o ruta.
 * O ruta cu segment dinamic ramane aici in forma ei de director (`/blog/[slug]`).
 *
 * O lista scrisa de mana devine falsa exact atunci cand cineva face lucrul corect
 * (adauga o pagina): poarta ar ramane verde pe un site pe care nu l-a mai vazut.
 */
export function tipareRute(baza: string = join(RADACINA, 'src', 'app')): string[] {
  const gasite: string[] = []

  const mergi = (director: string, ruta: string) => {
    for (const intrare of readdirSync(director, { withFileTypes: true })) {
      if (intrare.isDirectory()) {
        // Grupurile de rute `(nume)` si directoarele private `_nume` nu produc segment.
        const nume = intrare.name
        if (nume.startsWith('_') || nume.startsWith('.')) continue
        const segment = nume.startsWith('(') && nume.endsWith(')') ? '' : '/' + nume
        mergi(join(director, nume), ruta + segment)
      } else if (/^page\.(tsx|ts|jsx|js|mdx)$/.test(intrare.name)) {
        gasite.push(ruta === '' ? '/' : ruta)
      }
    }
  }

  mergi(baza, '')
  return [...new Set(gasite)].sort()
}

/**
 * Expresia regulata care recunoaste instantele concrete ale unui tipar de ruta:
 * `[x]` = un segment, `[...x]` = unul sau mai multe, `[[...x]]` = zero sau mai multe (deci si
 * ruta fara segment, adica baza).
 */
export function expresieTipar(tipar: string): RegExp {
  const parti = tipar.split('/').filter(Boolean)
  let sursa = '^'
  for (const p of parti) {
    if (/^\[\[\.\.\.[^\]]+\]\]$/.test(p)) sursa += '(?:/[^?#]+)?'
    else if (/^\[\.\.\.[^\]]+\]$/.test(p)) sursa += '/[^?#]+'
    else if (/^\[[^\]]+\]$/.test(p)) sursa += '/[^/?#]+'
    else sursa += '/' + p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  }
  if (sursa === '^') sursa += '/'
  return new RegExp(sursa + '$')
}

/**
 * Instantele concrete ale rutelor dinamice, citite din build: `.next/prerender-manifest.json`,
 * cheia `routes`, adica paginile generate de `generateStaticParams`. Registrul de continut (de
 * pilda articolele blogului) nu se citeste aici: build-ul e ce se serveste, deci el e sursa.
 */
export function instanteDinBuild(tipare: string[], manifest: { routes?: Record<string, unknown> }): string[] {
  const cai = Object.keys(manifest.routes ?? {})
  const gasite: string[] = []
  for (const tipar of tipare) {
    const expresie = expresieTipar(tipar)
    for (const cale of cai) if (expresie.test(cale)) gasite.push(cale)
  }
  return [...new Set(gasite)].sort()
}

/**
 * Rutele publice CONCRETE ale site-ului: rutele statice din `src/app`, plus instantele rutelor
 * dinamice din build.
 *
 * Fara segmente dinamice nu se citeste nimic din build. Cu segmente dinamice si fara build,
 * masuratoarea e NEMASURAT, nu "zero instante": o poarta care ar trece peste articolele blogului
 * pentru ca nu le-a gasit ar da verde pe exact paginile pe care nu le-a vazut.
 *
 * Un tipar dinamic fara nicio instanta in build (de pilda blogul cu registrul gol) nu produce
 * nicio ruta, si asta e starea adevarata: nu exista nicio pagina de deschis.
 */
export function rutePublice(): string[] {
  const tipare = tipareRute()
  const statice = tipare.filter((t) => !t.split('/').some(esteSegmentDinamic))
  const dinamice = tipare.filter((t) => t.split('/').some(esteSegmentDinamic))
  if (dinamice.length === 0) return statice

  const caleManifest = join(RADACINA, '.next', 'prerender-manifest.json')
  if (!existsSync(caleManifest)) {
    nemasurat('rutele dinamice (' + dinamice.join(', ') + ') cer build-ul: lipseste ' + caleManifest)
  }
  let manifest: { routes?: Record<string, unknown> }
  try {
    manifest = JSON.parse(readFileSync(caleManifest, 'utf8'))
  } catch (e) {
    nemasurat('manifestul de prerandare nu se poate citi: ' + String(e))
  }
  return [...new Set([...statice, ...instanteDinBuild(dinamice, manifest)])].sort()
}
