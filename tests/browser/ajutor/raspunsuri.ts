import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import type { DeclaratieRaspuns } from './geo'

/**
 * Declaratiile de raspuns ale rutelor (poarta G-AI-02: cercetarea cautare-agenti-ai, P2; planul E5,
 * pasul 26), UN FISIER PE FELIE: `config/seo/<felia>.json`, cu numele marcajului sub care sta ruta in
 * `src/content/rute.ts` (comentariul cu numele feliei, cel pe care il descrie antetul acelui fisier;
 * nu-l scriu aici pe litere, ca acest fisier sa nu devina el insusi un marcaj pentru cine le cauta).
 * Fiecare fisier are obiectul `raspuns_autonom`:
 * cheia e calea, valoarea intrebarea la care raspunde pagina si entitatile care trebuie sa apara in
 * primele 400 de cuvinte din `<main>` (masurate de tests/browser/geo.spec.ts).
 *
 * DE CE UN FISIER PE FELIE, si nu unul comun. Planul valului S4 (§5.1, regula 2) admite un singur
 * fisier comun, `rute.ts`, cu marcaje; un JSON nu poate avea marcaje, deci cinci felii paralele care
 * adauga chei in acelasi obiect s-ar ciocni la pliere. Aici fiecare felie scrie numai fisierul ei.
 *
 * REGULILE, verificate de `citesteDeclaratiile` (fiecare incalcare e o abatere cu nume):
 *   - fisierul poarta numele unei felii care are marcaj in `rute.ts`;
 *   - o ruta se declara numai in fisierul feliei sub al carei marcaj sta, deci nu poate avea doua
 *     declaratii si o felie nu poate scrie declaratia alteia;
 *   - fiecare ruta din `RUTE` are declaratia ei (asta o cere proba, pe ruta, cu fisierul asteptat);
 *   - regula primului paragraf (30-80 de cuvinte) se ridica pentru o ruta numai cu motivul scris in
 *     `fara_regula_paragrafului`; entitatile si titlul nu se ridica niciodata.
 *
 * `rute.ts` se citeste ca TEXT (ca portile de rute), fiindca marcajele sunt comentarii. Controlul
 * citirii: rutele gasite in text trebuie sa fie exact cele din modulul `RUTE`; o intrare construita
 * altfel decat `cale: "..."` sub un marcaj iese abatere, nu trece nevazuta.
 */

/** Dosarul declaratiilor, relativ la radacina. */
export const DOSAR_DECLARATII = 'config/seo'

const MARCAJ = /\/\/\s*<<felie:([a-z0-9-]+)>>/
const CALE = /\bcale:\s*"([^"]*)"/

export type FeliileRutelor = {
  /** Feliile, in ordinea marcajelor. */
  felii: string[]
  /** Ruta -> felia sub al carei marcaj sta. */
  rute: Map<string, string>
  abateri: string[]
}

/** Citeste din textul lui `rute.ts`, numai din lista `RUTE`, carei felii ii apartine fiecare ruta. */
export function feliileRutelor(textRute: string): FeliileRutelor {
  const abateri: string[] = []
  const felii: string[] = []
  const rute = new Map<string, string>()
  const start = textRute.indexOf('export const RUTE')
  const stop = start < 0 ? -1 : textRute.indexOf('\n];', start)
  if (start < 0 || stop < 0) {
    abateri.push('src/content/rute.ts: nu gasesc lista `export const RUTE` ... `];`')
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
      abateri.push('src/content/rute.ts: ruta ' + cale[1] + ' sta inaintea oricarui marcaj de felie')
    } else if (rute.has(cale[1])) {
      abateri.push('src/content/rute.ts: ruta ' + cale[1] + ' apare de doua ori')
    } else {
      rute.set(cale[1], curenta)
    }
  }
  return { felii, rute, abateri }
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
 * citirii textuale a lui `rute.ts`.
 */
export function citesteDeclaratiile(radacina: string, caiRute: readonly string[]): Declaratii {
  const { felii, rute, abateri } = feliileRutelor(readFileSync(join(radacina, 'src', 'content', 'rute.ts'), 'utf8'))
  const dinText = [...rute.keys()].sort()
  const dinModul = [...caiRute].sort()
  if (JSON.stringify(dinText) !== JSON.stringify(dinModul)) {
    abateri.push(
      'src/content/rute.ts citit ca text da rutele ' + JSON.stringify(dinText) + ', iar modulul RUTE are ' +
        JSON.stringify(dinModul) + ': o intrare nu sta sub un marcaj, sau nu e scrisa `cale: "..."`',
    )
  }

  const declaratii = new Map<string, DeclaratieRaspuns>()
  const fisierAsteptat = new Map([...rute].map(([cale, felie]) => [cale, DOSAR_DECLARATII + '/' + felie + '.json']))
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
      const a = rute.get(cale)
      if (a === undefined) {
        abateri.push(rel + ': ruta ' + cale + ' nu e in RUTE')
      } else if (a !== felie) {
        abateri.push(rel + ': ruta ' + cale + ' e a feliei ' + a + ', deci se declara in ' + fisierAsteptat.get(cale))
      } else if (!formaDeclaratiei(declaratie)) {
        abateri.push(rel + ': declaratia rutei ' + cale + ' nu are forma { intrebare, entitati, fara_regula_paragrafului? }')
      } else {
        declaratii.set(cale, declaratie)
      }
    }
  }
  return { declaratii, fisierAsteptat, abateri }
}
