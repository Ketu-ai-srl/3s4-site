import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { expect, test } from './ajutor/baza'
import { mediuProfil3sMd, pornesteCopia3sMd, type Copie3sMd } from './ajutor/copie-3s-md'
import { RADACINA } from './ajutor/proiect'

/**
 * Paginile EN nucleu (felia en-nucleu) pe COPIA 3s.md (`ajutor/copie-3s-md.ts`, profilul `config/profil-3s-md.json`):
 * build-ul real al probelor e cel romanesc, unde paginile EN nu exista.
 *
 * Ce se cere, pe HTML-ul servit (fara JavaScript), pe fiecare din cele 6 pagini ale manifestului
 * `src/content/rute-en-nucleu.ts`: 200, `<html lang="en">`, un singur H1, in `<main>` legatura WhatsApp spre numarul
 * domeniului cu textul precompletat care poarta `[ref:<ref>]` al paginii, zero `<form`, zero RON; antetul si subsolul
 * fara "Solutions" si fara functiile scoase. Plus: o adresa EN necunoscuta raspunde 404 cu pagina de negasit EN
 * (segmentul `[negasit]` al fundatiei a fost scos), iar jurnalul serverului nu mai are `NoFallbackError`.
 *
 * Asteptarile (caile, codurile `ref`, numarul) se citesc la RULARE din manifest, din tabelul navigatiei si din profil.
 * Controlul extragerii: pe fiecare pagina, `<main>` are exact o legatura WhatsApp cu ref-ul paginii in blocul de sus
 * si una in blocul de final (pagina de contact: una, in cardul WhatsApp).
 */

const PROFIL = mediuProfil3sMd()
const CANALE = JSON.parse(PROFIL.CANALE_JSON) as { whatsapp: string; telefon: string }
const WA = 'https://wa.me/' + CANALE.whatsapp + '?text='

/** Rutele grupului, citite ca text din manifest: calea si cheia. */
function ruteNucleu(): { cale: string; cheie: string }[] {
  const text = readFileSync(join(RADACINA, 'src', 'content', 'rute-en-nucleu.ts'), 'utf8')
  return [...text.matchAll(/cale:\s*"([^"]+)"[\s\S]*?cheie:\s*"([^"]+)"/g)].map((m) => ({ cale: m[1], cheie: m[2] }))
}

/** Codul `ref` al fiecarei cai, citit ca text din tabelul navigatiei EN. */
function refuri(): Map<string, string> {
  const text = readFileSync(join(RADACINA, 'src', 'content', 'navigatie-en.ts'), 'utf8')
  return new Map([...text.matchAll(/cale:\s*"([^"]+)",\s*ref:\s*"([^"]+)"/g)].map((m) => [m[1], m[2]]))
}

const RUTE = ruteNucleu()
const REF = refuri()
const RON = new RegExp('\\b' + 'R' + 'ON\\b')

/**
 * Decizia 49: asistentul pe WhatsApp (intrebari puse documentelor, raspunsuri, chat, documente primite pe WhatsApp) a
 * iesit de pe paginile EN, iar pagina lui (P04) cu el. Tiparul e cel din `tests/en-nucleu.test.ts`, asamblat din
 * bucati; contactul cu un om ("Message us on ...", "reach 3S on ... at") trece.
 */
const NUME_WA = 'Whats' + 'App'
const ASISTENT = '(ask|asking|asked|questions?|answers?|answered|assistant|chat|chatting|bot|search(es|ed|ing)?|find(?!\\s+(us|3S|our team)\\b)|finds|finding|look(s|ing)? up|quer(y|ies|ying)|retriev(e|es|ed|ing))'
const PRIMIRE = '(receives?|arrives?|takes? in|(send|upload|forward)\\w* (your |the )?(documents|files|invoices|scans))'
const ACEEASI_PROPOZITIE = '[^.?!\\n]{0,50}'
const ASISTENT_WA = new RegExp(
  [
    '\\b(' + ASISTENT.slice(1, -1) + '|in pilot)\\b' + ACEEASI_PROPOZITIE + '\\b' + NUME_WA + '\\b',
    '\\b' + NUME_WA + '\\b' + ACEEASI_PROPOZITIE + '\\b(' + ASISTENT.slice(1, -1) + '|in pilot)\\b',
    '\\b' + NUME_WA + ':? ?\\(?pilot',
    '\\b' + PRIMIRE + ACEEASI_PROPOZITIE + '\\bon ' + NUME_WA + '\\b',
  ].join('|'),
  'gi',
)
const CALE_P04 = '/features/' + 'whats' + 'app'

/**
 * Textul pe care il vede omul in HTML-ul servit, fara JavaScript: fara `<script>` si `<style>` (payload-ul RSC ar
 * dubla textul), fiecare eticheta devine un rand nou, plus atributele care se afiseaza sau se citesc (content, alt,
 * title, aria-label). Entitatile uzuale se decodeaza.
 */
function textVazut(html: string): string {
  const fara = html.replace(/<script\b[\s\S]*?<\/script>/gi, '\n').replace(/<style\b[\s\S]*?<\/style>/gi, '\n')
  const atribute = [...fara.matchAll(/\s(?:content|alt|title|aria-label)="([^"]*)"/g)].map((m) => m[1])
  return [fara.replace(/<[^>]+>/g, '\n'), ...atribute]
    .join('\n')
    .replace(/&amp;/g, '&')
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&nbsp;/g, ' ')
}

/** Frazele asistentului gasite in textul vazut al unei pagini. */
function frazeAsistent(html: string): string[] {
  return [...textVazut(html).matchAll(ASISTENT_WA)].map((m) => m[0])
}

let copie: Copie3sMd

async function servit(cale: string): Promise<{ status: number; html: string }> {
  const r = await fetch(copie.baza + cale, { redirect: 'manual' })
  return { status: r.status, html: await r.text() }
}

function bucata(html: string, start: RegExp, stop: string): string {
  const m = start.exec(html)
  if (m === null) return ''
  const sfarsit = html.indexOf(stop, m.index)
  return sfarsit < 0 ? '' : html.slice(m.index, sfarsit + stop.length)
}

function hrefuri(html: string): string[] {
  return [...html.matchAll(/<a\b[^>]*\shref="([^"]*)"/g)].map((m) => m[1].split('&amp;').join('&'))
}

/** Textul precompletat al unei legaturi wa.me, decodat. */
function textWa(href: string): string {
  return decodeURIComponent(href.slice(WA.length))
}

test.beforeAll(async () => {
  test.setTimeout(600_000)
  copie = await pornesteCopia3sMd()
})

test.afterAll(async () => {
  await copie?.opreste()
})

test('preconditia: 6 rute in manifest, fiecare cu ref in tabelul navigatiei, si un numar WhatsApp in profil', () => {
  expect(RUTE.map((r) => r.cale).sort()).toEqual(['/', '/about', '/contact', '/enterprise', '/platform', '/pricing'])
  for (const r of RUTE) expect(REF.get(r.cale), r.cale).toMatch(/^en-[a-z-]+$/)
  expect(CANALE.whatsapp).toMatch(/^\d{8,15}$/)
})

for (const r of ruteNucleu()) {
  test(r.cale + ': 200, <html lang="en">, un H1, WhatsApp cu ref-ul paginii, zero <form, zero RON', async () => {
    const { status, html } = await servit(r.cale)
    expect(status).toBe(200)
    expect(html).toMatch(/<html[^>]*\blang="en"/)
    expect(html.match(/<h1\b/g) ?? []).toHaveLength(1)
    const main = bucata(html, /<main\b/, '</main>')
    expect(main).not.toBe('')
    const wa = hrefuri(main).filter((h) => h.startsWith(WA))
    expect(wa.length, 'legaturi WhatsApp in <main>').toBe(r.cale === '/contact' ? 1 : 2)
    for (const h of wa) {
      expect(textWa(h)).toContain('[ref:' + REF.get(r.cale) + ']')
      expect(textWa(h).split('[ref:').length - 1).toBe(1)
    }
    expect(html).not.toContain('<form')
    expect(RON.test(html)).toBe(false)
    // Antetul si subsolul: fara grupul de segmente si fara functiile scoase; controlul: antetul are meniul principal.
    const antet = bucata(html, /<header\b/, '</header>')
    const subsol = bucata(html, /<footer\b/, '</footer>')
    expect(antet).toContain('aria-label="Main menu"')
    expect(subsol).not.toBe('')
    for (const bloc of [antet, subsol]) {
      expect(bloc).not.toContain('Solutions')
      expect(hrefuri(bloc).filter((h) => /\/solutions\/|#(portal|rules|devices)$/.test(h))).toEqual([])
    }
  })

  test(r.cale + ': zero fraze despre asistentul pe WhatsApp si nicio legatura spre P04 (decizia 49); contactul ramane', async () => {
    const { html } = await servit(r.cale)
    // Controlul extragerii: textul vazut are numele canalului (butonul de contact), deci zeroul de mai jos nu vine
    // dintr-un text gol.
    expect(textVazut(html)).toContain(NUME_WA)
    expect(frazeAsistent(html)).toEqual([])
    expect(hrefuri(html).filter((h) => h.split(/[?#]/)[0].endsWith(CALE_P04))).toEqual([])
  })
}

test('P03 /features/search: zero fraze despre asistentul pe WhatsApp si nicio legatura spre P04 (decizia 49)', async () => {
  const { status, html } = await servit('/features/search')
  expect(status).toBe(200)
  expect(textVazut(html)).toContain(NUME_WA)
  expect(frazeAsistent(html)).toEqual([])
  expect(hrefuri(html).filter((h) => h.split(/[?#]/)[0].endsWith(CALE_P04))).toEqual([])
})

test('martorii deciziei 49 pe HTML asamblat la rulare: asistentul e prins, contactul cu un om trece', () => {
  const rau =
    '<html><head><meta name="description" content="Ask your archive on ' + NUME_WA + '."></head><body><main>' +
    '<p>It works in the browser; ' + NUME_WA + ' is available in pilot.</p><p>Search your archive straight from ' + NUME_WA + '.</p>' +
    '<a href="' + CALE_P04 + '">' + NUME_WA + ' (pilot)</a><script>self.x="Can I ask on ' + NUME_WA + '?"</script></main></body></html>'
  // Patru fraze vazute (meta, doua paragrafe, legatura); cea din script nu se numara.
  expect(frazeAsistent(rau)).toHaveLength(4)
  expect(hrefuri(rau).filter((h) => h.endsWith(CALE_P04))).toHaveLength(1)
  const bun =
    '<main><a href="' + WA + 'x">Message us on ' + NUME_WA + '</a><p>Message 3S on ' + NUME_WA + ' or call +373 68 055 599. ' +
    'Tell us which archive you have and where. We reply in English or Romanian.</p>' +
    '<p>' + NUME_WA + ' is our main channel. On this number you talk to people from our team.</p></main>'
  expect(frazeAsistent(bun)).toEqual([])
  expect(textVazut(bun)).toContain(NUME_WA)
})

test('ancorele de pe pagini exista in HTML-ul servit: /#how-do-i-start, /about#security, /about#limits, /pricing#pilot', async () => {
  const asteptate: [string, string][] = [
    ['/', 'how-do-i-start'],
    ['/about', 'security'],
    ['/about', 'limits'],
    ['/pricing', 'pilot'],
  ]
  for (const [cale, id] of asteptate) {
    const { html } = await servit(cale)
    expect(html, cale + '#' + id).toMatch(new RegExp('\\sid="' + id + '"'))
  }
})

test('o adresa EN necunoscuta: 404 cu pagina de negasit EN; jurnalul serverului fara NoFallbackError', async () => {
  for (const cale of ['/o-pagina-' + 'care-nu-exista', '/a/b/c']) {
    const { status, html } = await servit(cale)
    expect(status, cale).toBe(404)
    expect(html, cale).toMatch(/<html[^>]*\blang="en"/)
    expect(html, cale).toContain('Page not found')
  }
  // Controlul jurnalului: serverul a scris ceva (pornirea), deci absenta de mai jos nu vine dintr-un jurnal gol.
  expect(copie.jurnal().length).toBeGreaterThan(0)
  expect(copie.jurnal()).not.toContain('NoFallbackError')
})

test('martor POZITIV: extragerea legaturilor WhatsApp prinde ref-ul intr-un HTML asamblat la rulare', () => {
  const href = WA + encodeURIComponent('Hello 3S, I read x [ref:' + 'en-proba]. Hi.')
  const html = '<main><a class="b" href="' + href + '">Message us</a></main>'
  const wa = hrefuri(bucata(html, /<main\b/, '</main>')).filter((h) => h.startsWith(WA))
  expect(wa).toHaveLength(1)
  expect(textWa(wa[0])).toContain('[ref:en-proba]')
  expect(RON.test('pret 0 ' + 'R' + 'ON')).toBe(true)
  expect(RON.test('ENVIRONMENT, Romanian')).toBe(false)
})

test('martor NEGATIV: un HTML curat (ref-ul paginii, fara formular, fara RON) nu e acuzat de aceleasi verificari', () => {
  const href = WA + encodeURIComponent('Hello 3S, I read your pricing page [ref:' + 'en-price]. I would like to ask for a quote.')
  const html = '<html lang="en"><header aria-label="Main menu"></header><main><h1>Pricing</h1><a href="' + href + '">Message us</a></main><footer>Product</footer></html>'
  const wa = hrefuri(bucata(html, /<main\b/, '</main>')).filter((h) => h.startsWith(WA))
  expect(wa).toHaveLength(1)
  expect(wa.map(textWa).every((t) => t.split('[ref:').length - 1 === 1 && t.includes('[ref:en-price]'))).toBe(true)
  expect(html).not.toContain('<form')
  expect(RON.test(html)).toBe(false)
  expect(bucata(html, /<header\b/, '</header>')).not.toContain('Solutions')
})
