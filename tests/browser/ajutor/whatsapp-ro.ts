import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { evenimentDinLegatura } from '../../../src/components/consimtamant/evenimente'
import { RADACINA } from './proiect'

/**
 * CONTRACTUL LEGATURILOR WhatsApp FARA MARCAJ, de la felia 164, pe toate editiile 3s.md si 3s.com.ro.
 *
 * DE CE S-A SCHIMBAT. Intai pe paginile in romana: GO Marian 04.11.2026 („go pe curatenie si corecturi”), pe documentul
 * lui Adrian Mihai din 04.11.2026 (`Site 3s.com.ro - structura, informatia, marketingul`): codul intern din mesajul
 * pre-completat „arata a mesaj automat, nu a conversatie”, iar „codul paginii poate sta intr-un parametru de urmarire,
 * nu in textul mesajului”. Apoi decizia Marian 04.11.2026 („1 da, 2 da”): si pe paginile EN, si in subiectele de
 * e-mail. Regula deciziei 35 (eticheta ref in textul mesajului) iese de peste tot. `legaturaWhatsApp` si `legaturaEmail`
 * (`src/content/canale.ts`) scot marcajul la construirea legaturii; atribuirea pe pagina s-a mutat in evenimentul Umami
 * `contact`, care poarta calea servita a paginii (`pagina`, `src/components/consimtamant/evenimente.ts`).
 *
 * CE SE CERE ACUM, pe fiecare legatura wa.me (nu „nimic”, ci trei lucruri, fiecare cu martor):
 *   1. numarul domeniului, iar textul NU contine marcajul (cine il repune inroseste proba);
 *   2. textul e EXACT textul sursa al paginii, fara marcaj: implicit randul ref-ului din tabelul de canale al editiei
 *      (`src/content/navigatie-ro-md.ts`, `src/content/navigatie-en.ts`), altfel textul sursa dat de proba; pagina se
 *      recunoaste dupa textul ei, deci un text copiat de pe alta pagina tot pica;
 *   3. atribuirea pe noul canal: `evenimentDinLegatura` (functia pe care o cheama ascultatorul clicului din pagina, cu
 *      `location.href`) da, pe legatura si pe adresa paginii, evenimentul `contact` cu `canal: whatsapp`, limba paginii
 *      si `pagina` = calea servita.
 *
 * Asteptarea vine din sursa citita ca TEXT, nu din `textFaraMarcaj`: proba nu foloseste functia pe care o masoara ca
 * sa-si calculeze raspunsul. (Numele fisierului e cel din prima runda a feliei, cand regula privea numai romana.)
 */

/** Marcajul scos din mesaj, asamblat la rulare (proba nu poarta literal ce vaneaza). */
export const MARCAJ = '[' + 'ref:'

/** Textul sursa fara marcajul ref-ului dat (si fara spatiul dinaintea lui). */
export function faraMarcajSursa(text: string, ref: string): string {
  const m = MARCAJ + ref + ']'
  return text.split(' ' + m).join('').split(m).join('').trim()
}

/**
 * Textul fiecarui ref din tabelul de canale al editiei, fara marcaj, citit ca text din sursa. Textul unui rand e un sir
 * literal sau o concatenare de siruri si constante ale fisierului (`"... [ref:" + REF_CAUTARE + "]"`).
 */
function texteTabel(fisier: string): Map<string, string> {
  const text = readFileSync(join(RADACINA, 'src', 'content', fisier), 'utf8')
  const constante = new Map([...text.matchAll(/^const\s+([A-Z_]+)\s*=\s*"([^"]+)";/gm)].map((m) => [m[1], m[2]]))
  const harta = new Map<string, string>()
  for (const m of text.matchAll(/ref:\s*(?:"([a-z0-9-]+)"|([A-Z_]+)),\s*text:\s*((?:"[^"]*"|[A-Z_]+)(?:\s*\+\s*(?:"[^"]*"|[A-Z_]+))*)/g)) {
    const ref = m[1] ?? constante.get(m[2])
    if (ref === undefined) throw new Error('texteTabel: constanta ' + m[2] + ' nerezolvata in ' + fisier)
    const bucati = [...m[3].matchAll(/"([^"]*)"|([A-Z_]+)/g)].map((b) => {
      if (b[1] !== undefined) return b[1]
      const v = constante.get(b[2])
      if (v === undefined) throw new Error('texteTabel: constanta ' + b[2] + ' nerezolvata in ' + fisier)
      return v
    })
    harta.set(ref, faraMarcajSursa(bucati.join(''), ref))
  }
  return harta
}

/** Textele editiei ro-MD (tabelul de canale ro-MD), fara marcaj. */
export function texteRoMd(): Map<string, string> {
  return texteTabel('navigatie-ro-md.ts')
}

/** Textele editiei EN (tabelul de canale EN), fara marcaj. */
export function texteEn(): Map<string, string> {
  return texteTabel('navigatie-en.ts')
}

const TEXTE = { ro: texteRoMd(), en: texteEn() }

/** Textul pre-completat al unei legaturi wa.me (decodat), sau sirul gol. */
export function textMesaj(href: string): string {
  try {
    return new URL(href).searchParams.get('text') ?? ''
  } catch {
    return ''
  }
}

export type AsteptareWhatsApp = {
  /** Numarul domeniului, din profil. */
  numar: string
  /** Randul tabelului (sau ref-ul textului sursa dat). */
  ref: string
  /** Adresa servita a paginii: din ea se citeste `pagina`. */
  adresaPaginii: string
  /** Limba paginii; implicit `ro`. */
  limba?: 'ro' | 'en'
  /** Textul SURSA al paginii, cu marcaj, cand nu e cel din tabelul editiei (CTA-ul din corpul unei pagini EN). */
  textSursa?: string
}

/** Abaterile legaturilor wa.me ale unei pagini de la contractul de mai sus. */
export function abateriWhatsApp(hrefuri: readonly string[], o: AsteptareWhatsApp): string[] {
  if (hrefuri.length === 0) return ['nicio legatura WhatsApp']
  const limba = o.limba ?? 'ro'
  const asteptat = o.textSursa !== undefined ? faraMarcajSursa(o.textSursa, o.ref) : TEXTE[limba].get(o.ref)
  if (asteptat === undefined) return ['ref-ul ' + o.ref + ' nu are text in tabelul de canale ' + limba]
  const cale = new URL(o.adresaPaginii).pathname
  const abateri: string[] = []
  for (const h of hrefuri) {
    if (!h.startsWith('https://wa.me/' + o.numar + '?text=')) abateri.push('alt numar sau alta forma: ' + h)
    const text = textMesaj(h)
    if (text.includes(MARCAJ)) abateri.push('marcajul e inca in mesaj: ' + text)
    else if (text !== asteptat) abateri.push('alt text decat al paginii (' + o.ref + '): "' + text + '", asteptat "' + asteptat + '"')
    const ev = evenimentDinLegatura({ href: h, lang: null }, o.adresaPaginii, limba)
    const asteptatEv = JSON.stringify(['contact', { canal: 'whatsapp', lang: limba, pagina: cale }])
    if (JSON.stringify(ev) !== asteptatEv) abateri.push('atribuirea Umami: ' + JSON.stringify(ev) + ', asteptat ' + asteptatEv)
  }
  return abateri
}

/** Forma din prima runda a feliei: pagina in romana, textul din tabelul ro-MD. */
export function abateriWhatsAppRo(hrefuri: readonly string[], o: { numar: string; ref: string; adresaPaginii: string }): string[] {
  return abateriWhatsApp(hrefuri, { ...o, limba: 'ro' })
}

/** O legatura wa.me asamblata la rulare, pentru martorii detectorului: numarul si textul date. */
export function legaturaProba(numar: string, text: string): string {
  return 'https://wa.me/' + numar + '?text=' + encodeURIComponent(text)
}
