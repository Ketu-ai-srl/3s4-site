import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { editiiBuild, type CodEditie } from '../../../src/lib/editii'
import type { DeclaratieRaspuns } from './geo'

/**
 * Declaratiile de raspuns ale rutelor (poarta G-AI-02: cercetarea cautare-agenti-ai, P2; planul E5,
 * pasul 26), UN FISIER PE FELIE: `config/seo/<felia>.json`, cu numele marcajului sub care sta ruta in
 * manifestul de rute (comentariul cu numele feliei, cel pe care il descrie antetul lui `src/content/rute.ts`;
 * nu-l scriu aici pe litere, ca acest fisier sa nu devina el insusi un marcaj pentru cine le cauta).
 * Fiecare fisier are obiectul `raspuns_autonom`:
 * cheia e calea, valoarea intrebarea la care raspunde pagina si entitatile care trebuie sa apara in
 * primele 400 de cuvinte din `<main>` (masurate de tests/browser/geo.spec.ts).
 *
 * DE CE UN FISIER PE FELIE, si nu unul comun. Planul valului S4 (§5.1, regula 2) admite un singur
 * fisier comun, `rute.ts`, cu marcaje; un JSON nu poate avea marcaje, deci cinci felii paralele care
 * adauga chei in acelasi obiect s-ar ciocni la pliere. Aici fiecare felie scrie numai fisierul ei.
 *
 * MANIFESTUL E PE EDITIE (fundatia editiilor, `src/lib/editii.ts`): rutele romanesti in `src/content/rute.ts`,
 * cele in engleza in `src/content/rute-en-<grup>.ts`, cele pentru Republica Moldova in
 * `src/content/rute-ro-md.ts`, fiecare fisier cu marcajele feliilor lui. Marcajele se citesc din TOATE, deci
 * `config/seo/en-<grup>.json` e al feliei care scrie `rute-en-<grup>.ts`. O declaratie pentru o ruta a unei
 * editii care NU e in build-ul de fata se verifica numai ca forma (ruta exista sub marcajul feliei, declaratia
 * are campurile cerute); in `declaratii` intra numai rutele editiilor din build, cele pe care le masoara proba.
 *
 * REGULILE, verificate de `citesteDeclaratiile` (fiecare incalcare e o abatere cu nume):
 *   - fisierul poarta numele unei felii care are marcaj in manifest;
 *   - o ruta se declara numai in fisierul feliei sub al carei marcaj sta, deci nu poate avea doua
 *     declaratii si o felie nu poate scrie declaratia alteia;
 *   - fiecare ruta din `RUTE` are declaratia ei (asta o cere proba, pe ruta, cu fisierul asteptat);
 *   - regula primului paragraf (30-80 de cuvinte) se ridica pentru o ruta numai cu motivul scris in
 *     `fara_regula_paragrafului`; entitatile si titlul nu se ridica niciodata.
 *
 * Manifestul se citeste ca TEXT (ca portile de rute), fiindca marcajele sunt comentarii. Controlul
 * citirii: rutele gasite in textul fisierelor editiilor din build trebuie sa fie exact cele din modulul
 * `RUTE`; o intrare construita altfel decat `cale: "..."` sub un marcaj iese abatere, nu trece nevazuta.
 */

/** Dosarul declaratiilor, relativ la radacina. */
export const DOSAR_DECLARATII = 'config/seo'

const MARCAJ = /\/\/\s*<<felie:([a-z0-9-]+)>>/
const CALE = /\bcale:\s*"([^"]*)"/
/** Inceputul listei de rute dintr-un manifest: `export const RUTE: Ruta[] = [`, `const RUTE_RO_RO: Ruta[] = [`... */
const START_LISTA = /^(?:export\s+)?const\s+RUTE\w*\b[^=\n]*=\s*\[\s*$/m

export type FeliileRutelor = {
  /** Feliile, in ordinea marcajelor. */
  felii: string[]
  /** Ruta -> felia sub al carei marcaj sta. */
  rute: Map<string, string>
  abateri: string[]
}

/**
 * Citeste din textul unui manifest, numai din lista lui de rute, carei felii ii apartine fiecare ruta.
 * `fisier` e numele din mesaje (implicit manifestul romanesc).
 */
export function feliileRutelor(textRute: string, fisier: string = 'src/content/rute.ts'): FeliileRutelor {
  const abateri: string[] = []
  const felii: string[] = []
  const rute = new Map<string, string>()
  const gasit = START_LISTA.exec(textRute)
  const start = gasit === null ? -1 : gasit.index
  const stop = start < 0 ? -1 : textRute.indexOf('\n];', start)
  if (start < 0 || stop < 0) {
    abateri.push(fisier + ': nu gasesc lista `export const RUTE` ... `];`')
    return { felii, rute, abateri }
  }
  let curenta: string | null = null
  for (const rand of textRute.slice(start, stop).split(/\r?\n/)) {
    const marcaj = MARCAJ.exec(rand)
    if (marcaj) {
      curenta = marcaj[1]
      felii.push(curenta)
      continue
    }
    const cale = CALE.exec(rand)
    if (!cale) continue
    if (curenta === null) {
      abateri.push(fisier + ': ruta ' + cale[1] + ' sta inaintea oricarui marcaj de felie')
    } else if (rute.has(cale[1])) {
      abateri.push(fisier + ': ruta ' + cale[1] + ' apare de doua ori')
    } else {
      rute.set(cale[1], curenta)
    }
  }
  return { felii, rute, abateri }
}

/** Editia unui fisier de manifest dupa nume (acelasi criteriu ca portile de rute), sau `null`. */
export function editiaManifestului(nume: string): CodEditie | null {
  if (nume === 'rute.ts') return 'ro-RO'
  if (nume === 'rute-en.ts' || (nume.startsWith('rute-en-') && nume.endsWith('.ts'))) return 'en'
  if (nume === 'rute-ro-md.ts') return 'ro-MD'
  return null
}

type Manifest = { fisier: string; editie: CodEditie } & FeliileRutelor

/** Manifestele de rute ale depozitului: `rute.ts` intai (obligatoriu), apoi celelalte, in ordinea numelor. */
function manifestele(radacina: string): Manifest[] {
  const dosar = join(radacina, 'src', 'content')
  const nume = ['rute.ts', ...readdirSync(dosar).filter((f) => f !== 'rute.ts' && editiaManifestului(f) !== null).sort()]
  return nume.map((f) => {
    const fisier = 'src/content/' + f
    const text = readFileSync(join(dosar, f), 'utf8')
    // Agregatorul unei editii (`rute-en.ts`) nu are lista proprie si nicio ruta: nu e o abatere.
    const citit = START_LISTA.test(text) ? feliileRutelor(text, fisier) : { felii: [], rute: new Map<string, string>(), abateri: [] }
    return { fisier, editie: editiaManifestului(f) as CodEditie, ...citit }
  })
}

/** Forma unei declaratii: intrebare, entitati nevide, motivul optional, nimic altceva. */
export function formaDeclaratiei(d: unknown): d is DeclaratieRaspuns {
  if (typeof d !== 'object' || d === null || Array.isArray(d)) return false
  const o = d as Record<string, unknown>
  const permise = ['intrebare', 'entitati', 'fara_regula_paragrafului']
  if (Object.keys(o).some((k) => !permise.includes(k))) return false
  if (typeof o.intrebare !== 'string') return false
  if (!Array.isArray(o.entitati) || o.entitati.length === 0 || o.entitati.some((e) => typeof e !== 'string')) return false
  return o.fara_regula_paragrafului === undefined || typeof o.fara_regula_paragrafului === 'string'
}

export type Declaratii = {
  declaratii: Map<string, DeclaratieRaspuns>
  /** Ruta -> fisierul in care trebuie sa stea declaratia ei. */
  fisierAsteptat: Map<string, string>
  abateri: string[]
}

/**
 * Aduna declaratiile din `config/seo/*.json`. `caiRute` sunt caile din modulul `RUTE`: controlul
 * citirii textuale a manifestului. `editii` sunt editiile build-ului (implicit cele din mediu, ca `RUTE`).
 */
export function citesteDeclaratiile(radacina: string, caiRute: readonly string[], editii: readonly CodEditie[] = editiiBuild()): Declaratii {
  const manifeste = manifestele(radacina)
  const abateri = manifeste.flatMap((m) => m.abateri)
  const felii = [...new Set(manifeste.flatMap((m) => m.felii))]
  const dinBuild = manifeste.filter((m) => editii.includes(m.editie))

  const dinText = dinBuild.flatMap((m) => [...m.rute.keys()]).sort()
  const dinModul = [...caiRute].sort()
  if (JSON.stringify(dinText) !== JSON.stringify(dinModul)) {
    abateri.push(
      'src/content/rute.ts citit ca text da rutele ' + JSON.stringify(dinText) + ', iar modulul RUTE are ' +
        JSON.stringify(dinModul) + ': o intrare nu sta sub un marcaj, sau nu e scrisa `cale: "..."`',
    )
  }

  const declaratii = new Map<string, DeclaratieRaspuns>()
  const fisierAsteptat = new Map(dinBuild.flatMap((m) => [...m.rute].map(([cale, felie]): [string, string] => [cale, DOSAR_DECLARATII + '/' + felie + '.json'])))
  const dosar = join(radacina, ...DOSAR_DECLARATII.split('/'))
  const fisiere = existsSync(dosar) ? readdirSync(dosar).filter((f) => f.endsWith('.json')).sort() : []
  for (const fisier of fisiere) {
    const rel = DOSAR_DECLARATII + '/' + fisier
    const felie = fisier.slice(0, -'.json'.length)
    if (!felii.includes(felie)) {
      abateri.push(rel + ': nu exista felia "' + felie + '" printre marcajele din src/content/rute.ts')
      continue
    }
    let continut: unknown
    try {
      continut = JSON.parse(readFileSync(join(dosar, fisier), 'utf8'))
    } catch {
      abateri.push(rel + ': nu e JSON valid')
      continue
    }
    const bloc = (continut as { raspuns_autonom?: unknown } | null)?.raspuns_autonom
    if (typeof bloc !== 'object' || bloc === null || Array.isArray(bloc)) {
      abateri.push(rel + ': lipseste obiectul raspuns_autonom')
      continue
    }
    for (const [cale, declaratie] of Object.entries(bloc)) {
      if (cale.startsWith('_')) continue
      // Manifestele in care ruta exista; a feliei care declara are intaietate (aceeasi cale poate fi in doua editii).
      const unde = manifeste.filter((m) => m.rute.has(cale))
      const aFeliei = unde.find((m) => m.rute.get(cale) === felie)
      if (unde.length === 0) {
        abateri.push(rel + ': ruta ' + cale + ' nu e in RUTE')
      } else if (aFeliei === undefined) {
        const a = unde[0].rute.get(cale) as string
        abateri.push(rel + ': ruta ' + cale + ' e a feliei ' + a + ', deci se declara in ' + (fisierAsteptat.get(cale) ?? DOSAR_DECLARATII + '/' + a + '.json'))
      } else if (!formaDeclaratiei(declaratie)) {
        abateri.push(rel + ': declaratia rutei ' + cale + ' nu are forma { intrebare, entitati, fara_regula_paragrafului? }')
      } else if (editii.includes(aFeliei.editie)) {
        declaratii.set(cale, declaratie)
      }
    }
  }
  return { declaratii, fisierAsteptat, abateri }
}
