/**
 * Masuratorile pe OCTETII SERVITI ai documentelor juridice (felia 144, runda 2), comune probei pe serverul 3s.md
 * (`tests/editii.test.ts`, jobul "Profil 3s.md") si probei asezarii `ro` (`acceptanta-3s-com-ro.spec.ts`):
 *   - textele din <head> pe care le citeste omul sau motorul de cautare: titlul si descrierile (`description`,
 *     `og:description`, `twitter:description`, plus titlurile og/twitter);
 *   - formele de politete (decizia 77) intr-un text: pronumele, auxiliarul, "v-" si verbele la persoana a II-a plural;
 *   - ancorele unui HTML, cu atributele si textul lor.
 * Tiparele se lipesc din bucati, ca fisierul sa nu poarte pe litere formele pe care le vaneaza.
 */

const ENTITATI: Record<string, string> = { '&amp;': '&', '&quot;': '"', '&#x27;': "'", '&#39;': "'", '&lt;': '<', '&gt;': '>' }

export function decodeaza(text: string): string {
  return text.replace(/&(amp|quot|#x27|#39|lt|gt);/g, (e) => ENTITATI[e] ?? e)
}

/** Atributele unei etichete de deschidere, cu valorile decodate; numele raman cum le scrie React (`hrefLang`). */
export function atribute(eticheta: string): Record<string, string> {
  const rezultat: Record<string, string> = {}
  for (const m of eticheta.matchAll(/\s([a-zA-Z:-]+)="([^"]*)"/g)) rezultat[m[1]] = decodeaza(m[2])
  return rezultat
}

/** Partea <head> a documentului; arunca daca lipseste (o extragere goala ar trece orice proba de absenta). */
export function cap(html: string): string {
  const m = /<head[^>]*>([\s\S]*?)<\/head>/.exec(html)
  if (m === null) throw new Error('HTML-ul servit nu are <head>')
  return m[1]
}

/** Titlul si continutul meta-urilor de titlu si descriere din <head>, decodate. */
export function texteCap(html: string): { titlu: string; descrieri: string[]; titluri: string[] } {
  const h = cap(html)
  const titlu = decodeaza(/<title>([^<]*)<\/title>/.exec(h)?.[1] ?? '')
  const descrieri: string[] = []
  const titluri: string[] = []
  for (const m of h.matchAll(/<meta\b[^>]*>/g)) {
    const a = atribute(m[0])
    const nume = a.name ?? a.property ?? ''
    if (['description', 'og:description', 'twitter:description'].includes(nume)) descrieri.push(a.content ?? '')
    if (['og:title', 'twitter:title'].includes(nume)) titluri.push(a.content ?? '')
  }
  return { titlu, descrieri, titluri }
}

const PRONUME = new RegExp(
  '(?<!\\p{L})(' + ['dumnea' + 'voastr\\p{L}*', 'v' + 'ă', 'v' + 'i', 'a' + 'ți'].join('|') + ')(?!\\p{L})|(?<!\\p{L})v-(?=\\p{L})',
  'giu',
)
const VERB_PLURAL = /\p{L}+(ați|eți|iți|âți)(?!\p{L})/giu
/** Finaluri de plural care nu sunt adresare: participii despre altii si verbe la persoana a II-a singular. */
const NU_SUNT_POLITETE = new Set(['autorizați', 'subîmputerniciți', 'exerciți', 'trimiți'])

/** Formele de politete dintr-un text (cu "VI" numeralul roman exclus). */
export function formePolitete(text: string): string[] {
  return [
    ...[...text.matchAll(PRONUME)].map((m) => m[0]).filter((w) => w !== 'VI'),
    ...[...text.matchAll(VERB_PLURAL)].map((m) => m[0]).filter((w) => !NU_SUNT_POLITETE.has(w.toLowerCase())),
  ]
}

/** Trimiterile la masurarea vizitelor, pe limba. */
export const MASURARE: Record<'ro' | 'en', RegExp> = {
  ro: /măsur\p{L}* (a )?vizit|măsurăm vizitele/iu,
  en: /measur\p{L}* (of )?visits|visit measurement|measuring visits|measure visits/iu,
}

export type Ancora = { atribute: Record<string, string>; text: string }

/** Ancorele dintr-un HTML, cu atributele si textul lor (etichetele interioare scoase). */
export function ancore(html: string): Ancora[] {
  return [...html.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/g)].map((m) => ({
    atribute: atribute(' ' + m[1]),
    text: decodeaza(m[2].replace(/<[^>]+>/g, '')).trim(),
  }))
}

// ---------------------------------------------------------------------------------------------
// Runda 3: descrierile documentelor din rute (paleta, /llms.txt, pachetul de browser) si eticheta EN de cookie-uri
// ---------------------------------------------------------------------------------------------

/** Adresele scripturilor dintr-un HTML servit (`<script src>`), in ordinea aparitiei, fara repetitii. */
export function scripturi(html: string): string[] {
  return [...new Set([...html.matchAll(/<script\b[^>]*\bsrc="([^"]+)"/g)].map((m) => decodeaza(m[1])))]
}

/**
 * Un pachet JS cu evadarile `\uXXXX` si `\xNN` desfacute, ca un sir cu diacritice sa se gaseasca oricum l-a scris
 * minificatorul. Masurat pe pachetul servit de 3s.md (08.10): „î” si „â” (Latin-1) ies ca `\xee` si `\xe2`, restul
 * diacriticelor raman litere; fara a doua evadare, descrierile cu „în” sau „hotărâm” nu se gasesc.
 */
export function faraEvadari(js: string): string {
  return js
    .replace(/\\u([0-9a-fA-F]{4})/g, (_, h: string) => String.fromCharCode(parseInt(h, 16)))
    .replace(/\\x([0-9a-fA-F]{2})/g, (_, h: string) => String.fromCharCode(parseInt(h, 16)))
}

/**
 * MARTORUL PE BAZA: descrierile din rute si eticheta EN de cookie-uri asa cum erau inainte de runda 3, asamblate la
 * rulare din bucati (fisierul nu le poarta pe litere). O proba care nu le-ar gasi pe baza nu masoara nimic.
 */
export const BAZA_RUNDA_3 = {
  descrieriRo: [
    'Cine furnizează serviciul 3S, cum ne contact' + 'ați și ce autorități supraveghează serviciul.',
    'Ce date personale prelucrăm, în ce scop, pe ce temei, cui le transmitem și ce drepturi av' + 'eți.',
    'Ce stochează sau citește site-ul în browser, cum ' + 'măsurăm vizitele și cum ' + 'v' + 'ă răzgândiți.',
    'Cum ne semnal' + 'ați o informație ilicită, cum hotărâm și regulile de utilizare acceptabilă.',
  ],
  cookieEn: 'What the website stores or reads in your browser, how we ' + 'measure visits and how to change your mind.',
  etichetaEn: 'Cookies and ' + 'measurement',
}

/** Eticheta EN a paginii de cookie-uri promite masurarea? */
export const ETICHETA_CU_MASURARE = /measur/i
