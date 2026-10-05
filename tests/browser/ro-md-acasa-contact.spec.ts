import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { numarAfisat } from '../../src/content/canale'
import { configurareCanale } from '../../src/lib/canale-mediu'
import { EDITII } from '../../src/lib/editii'
import { expect, test } from './ajutor/baza'
import { mediuProfil3sMd, pornesteCopia3sMd, type Copie3sMd } from './ajutor/copie-3s-md'
import { masoaraRaspunsul, type DeclaratieRaspuns } from './ajutor/geo'
import { asteaptaHidratarea } from './ajutor/hidratare'
import { RADACINA } from './ajutor/proiect'
import { entitatiCuNumarul, LOC_NUMAR } from './ajutor/raspunsuri'

/**
 * Paginile RO-MD de prezentare (felia ro-md-acasa-contact), `/ro` si `/ro/contact`, pe COPIA 3s.md
 * (`ajutor/copie-3s-md.ts`, profilul `config/profil-3s-md.json`): build-ul real al probelor e cel romanesc, unde
 * paginile RO-MD nu exista.
 *
 * Ce se cere, pe HTML-ul servit (fara JavaScript), pe fiecare pagina: 200, `<html lang="ro">`, `Content-Language` al
 * editiei ro-MD din catalog, un singur H1, noindex pe staging, zero `<form`, zero RON; in `<main>` legaturile WhatsApp
 * poarta `[ref:<ref>]` al paginii (start: eroul si blocul final; contact: caseta, randul canalului si blocul final),
 * CTA-ul din antet are eticheta deciziei 35 si acelasi ref, iar subsolul are numarul de WhatsApp ca text, fara nicio legatura de apel (decizia 56),
 * si legatura spre informatiile legale RO. Apoi:
 * hreflang reciproc intre `/` si `/ro` si intre `/contact` si `/ro/contact`; selectorul EN | RO pe toate patru
 * paginile, cu martorul negativ pe o pagina EN fara pereche; zero forme de politete, zero fraze despre asistentul pe
 * WhatsApp si zero functii ale deciziei 43 in textul vazut, cu martori; declaratiile G-AI-02 masurate.
 *
 * Asteptarile (caile, cheile, codurile `ref`, perechile, numarul, calea informatiilor legale) se citesc la RULARE din
 * manifest, din tabelul navigatiei, din echivalente si din configurare. Fixturile tiparelor se asambleaza din bucati.
 */

const PROFIL = mediuProfil3sMd()
const ORIGINE = PROFIL.SITE_URL.replace(/\/+$/, '')
const CANALE = JSON.parse(PROFIL.CANALE_JSON) as { whatsapp: string; telefon: string }
const WA = 'https://wa.me/' + CANALE.whatsapp + '?text='
const RON = new RegExp('\\b' + 'R' + 'ON\\b')
const LIMBA = EDITII['ro-MD'].inLanguage

const citeste = (...cale: string[]) => readFileSync(join(RADACINA, ...cale), 'utf8')

/** Rutele feliei, citite ca text de sub marcajul ei din manifestul RO-MD. */
function ruteFelie(): { cale: string; cheie: string }[] {
  const text = citeste('src', 'content', 'rute-ro-md.ts')
  const start = text.indexOf('<<felie:ro-md-acasa-contact>>')
  const bucata = start < 0 ? '' : text.slice(start, text.indexOf('\n];', start))
  return [...bucata.matchAll(/cale:\s*"([^"]+)"[\s\S]*?cheie:\s*"([^"]+)"/g)].map((m) => ({ cale: m[1], cheie: m[2] }))
}

/** Codul `ref` al fiecarei cai, din tabelul navigatiei RO-MD (intrarile fara prefix). */
function refuri(): Map<string, string> {
  const text = citeste('src', 'content', 'navigatie-ro-md.ts')
  return new Map([...text.matchAll(/cale:\s*"([^"]+)",\s*ref:\s*"([^"]+)"/g)].map((m) => [m[1], m[2]]))
}

/** Calea EN a fiecarei chei, citita ca text din manifestul EN nucleu (sursa independenta de tabelul de echivalente). */
function caiEn(): Map<string, string> {
  const text = citeste('src', 'content', 'rute-en-nucleu.ts')
  return new Map([...text.matchAll(/cale:\s*"([^"]+)"[\s\S]*?cheie:\s*"([^"]+)"/g)].map((m) => [m[2], m[1]]))
}

/** Perechea en - ro-MD a unei chei, din tabelul de echivalente. */
function pereche(cheie: string): { en: string; ro: string } | null {
  const m = new RegExp('^\\s*' + cheie + ':\\s*\\{\\s*en:\\s*"([^"]+)",\\s*"ro-MD":\\s*"([^"]+)"', 'm').exec(citeste('src', 'content', 'echivalente.ts'))
  return m === null ? null : { en: m[1], ro: m[2] }
}

const RUTE = ruteFelie()
const REF = refuri()
// Perechea ASTEPTATA vine din manifeste (aceeasi cheie in EN nucleu si in RO-MD), nu din tabel: o pereche scoasa din
// tabel trebuie sa inroseasca paginile servite, nu sa schimbe asteptarea.
const EN = caiEn()
const PERECHI = RUTE.map((r) => ({ cheie: r.cheie, en: EN.get(r.cheie) ?? '(fara pagina EN)', ro: r.cale }))
const JURIDIC = JSON.parse(citeste('config', 'juridic-rute.json')) as { documente: Record<string, { ro: string }> }
const CALE_LEGAL_RO = JURIDIC.documente['informatii-legale'].ro
/** Numarul afisat al canalului din profil: valoarea pusa de cititor (`entitatiCuNumarul`) in locul lui `LOC_NUMAR`. */
const NUMAR_PROFIL = numarAfisat(configurareCanale(PROFIL.CANALE_JSON))
const BRUTE = (JSON.parse(citeste('config', 'seo', 'ro-md-acasa-contact.json')) as { raspuns_autonom: Record<string, DeclaratieRaspuns> }).raspuns_autonom
const DECLARATII: Record<string, DeclaratieRaspuns> = Object.fromEntries(
  Object.entries(BRUTE).map(([cale, d]) => [cale, { ...d, entitati: entitatiCuNumarul(d.entitati, PROFIL.CANALE_JSON) }]),
)

let copie: Copie3sMd

async function servit(cale: string): Promise<{ status: number; html: string; robots: string; limba: string }> {
  const r = await fetch(copie.baza + cale, { redirect: 'manual' })
  return { status: r.status, html: await r.text(), robots: r.headers.get('x-robots-tag') ?? '', limba: r.headers.get('content-language') ?? '' }
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

/** Alternatele din `<head>`: hreflang -> adresa. */
function alternate(html: string): Record<string, string> {
  const rezultat: Record<string, string> = {}
  for (const m of html.matchAll(/<link\b[^>]*>/g)) {
    if (!/\brel="alternate"/.test(m[0])) continue
    const limba = /\bhrefLang="([^"]+)"/i.exec(m[0])?.[1]
    const adresa = /\bhref="([^"]+)"/.exec(m[0])?.[1]
    if (limba && adresa) rezultat[limba] = adresa
  }
  return rezultat
}

/** Textul vazut in HTML-ul servit: fara `<script>` si `<style>`, fiecare eticheta un rand, entitatile uzuale decodate. */
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

/** Formele de politete (decizia 35) si frazele interzise (deciziile 43 si 49), asamblate din bucati. */
const POLITETE = new RegExp(
  '(?<!\\p{L})(' + ['dumnea' + 'voastră', 'dv' + 's', 'v' + 'ă', 'voas' + 'tră', 'vos' + 'tru'].join('|') + ')(?!\\p{L})|\\p{L}+(ați|eți|iți|âți)(?!\\p{L})',
  'giu',
)
const NUME_WA = 'Whats' + 'App'
// "gasesti numarul/adresa" (omul gaseste datele de contact, decizia 56 pune WhatsApp langa ele) nu e asistentul.
const ASISTENT_RO = ['întreb\\p{L}*', 'întreab\\p{L}*', 'răspun\\p{L}*', 'asistent\\p{L}*', 'chat\\p{L}*', 'caut\\p{L}*', 'căut\\p{L}*', 'găse\\p{L}*(?!\\p{L})(?! (adresa|numărul)(?!\\p{L}))', 'primești', 'trimit\\p{L}*', 'în testare'].join('|')
/** Schema legaturii de apel, asamblata la rulare (decizia 56: nicio legatura de apel). */
const SCHEMA_APEL = 'te' + 'l:'
const ASISTENT_WA = new RegExp(
  '(?<!\\p{L})(' + ASISTENT_RO + ')(?!\\p{L})[^.?!\\n]{0,50}' + NUME_WA + '|' + NUME_WA + '[^.?!\\n]{0,50}(?<!\\p{L})(' + ASISTENT_RO + ')(?!\\p{L})',
  'giu',
)
const DECIZIA_43 = new RegExp('(port' + 'al|autentificar\\p{L}* ' + 'unic|\\bA' + 'PI\\b|stocar\\p{L}* ' + 'propri|reguli\\p{L}* ' + 'automat|aplicați\\p{L}* ' + 'instalabil|/features/' + 'whats' + 'app)', 'giu')

function gasite(tipar: RegExp, text: string): string[] {
  return [...text.matchAll(tipar)].map((m) => m[0])
}

test.beforeAll(async () => {
  test.setTimeout(600_000)
  copie = await pornesteCopia3sMd()
})

test.afterAll(async () => {
  await copie?.opreste()
})

test('preconditia: 2 rute sub marcajul feliei, fiecare cu ref, pereche EN si declaratie G-AI-02', () => {
  expect(RUTE.map((r) => r.cale).sort()).toEqual(['/ro', '/ro/contact'])
  for (const r of RUTE) {
    expect(REF.get(r.cale), r.cale).toMatch(/^ro-md-[a-z-]+$/)
    expect(DECLARATII[r.cale], r.cale).toBeDefined()
  }
  expect(PERECHI.map((p) => [p.cheie, p.en, p.ro]).sort()).toEqual([
    ['contact', '/contact', '/ro/contact'],
    ['home', '/', '/ro'],
  ])
  // Numarul din declaratia /ro/contact vine din profil: locul lui e in fisier, valoarea nu, iar dupa inlocuire
  // entitatea e numarul afisat al canalului (controlul ca inlocuirea a rulat, nu ca a trecut pe langa).
  expect(BRUTE['/ro/contact'].entitati).toContain(LOC_NUMAR)
  expect(BRUTE['/ro/contact'].entitati).not.toContain(NUMAR_PROFIL)
  expect(NUMAR_PROFIL).toMatch(/^\+\d+( \d+)+$/)
  expect(DECLARATII['/ro/contact'].entitati).toContain(NUMAR_PROFIL)
  expect(Object.values(DECLARATII).flatMap((d) => d.entitati).filter((e) => e.includes('{'))).toEqual([])
  // Tabelul de echivalente are exact perechile manifestelor.
  for (const p of PERECHI) expect(pereche(p.cheie), p.cheie).toEqual({ en: p.en, ro: p.ro })
  expect(CANALE.whatsapp).toMatch(/^\d{8,15}$/)
  expect(LIMBA).toBe('ro-MD')
})

for (const r of ruteFelie()) {
  test(r.cale + ': 200, lang="ro", Content-Language ' + LIMBA + ', un H1, noindex, zero <form, zero RON', async () => {
    const { status, html, robots, limba } = await servit(r.cale)
    expect(status).toBe(200)
    expect(html).toMatch(/<html[^>]*\blang="ro"/)
    expect(limba).toBe(LIMBA)
    expect(html.match(/<h1\b/g) ?? []).toHaveLength(1)
    expect(robots).toContain('noindex')
    expect(html).not.toContain('<form')
    expect(RON.test(html)).toBe(false)
  })

  test(r.cale + ': WhatsApp cu ref-ul paginii in <main> si in antet (eticheta deciziei 35), numarul de WhatsApp si informatiile legale in subsol, fara apel', async () => {
    const { html } = await servit(r.cale)
    const ref = '[ref:' + REF.get(r.cale) + ']'
    const main = bucata(html, /<main\b/, '</main>')
    const antet = bucata(html, /<header\b/, '</header>')
    const subsol = bucata(html, /<footer\b/, '</footer>')
    expect(main).not.toBe('')
    expect(antet).not.toBe('')
    expect(subsol).not.toBe('')
    const wa = hrefuri(main).filter((h) => h.startsWith(WA))
    // AUTORIZARE (felia 104, regula comuna a specificatiei de congruenta: probele care fixeaza forma veche se rescriu in
    // felia paginii): /ro/contact randa modulul prin CorpPagina, cu o singura legatura WhatsApp, in cardul canalului.
    // Pagina compune acum componentele paginii de contact RO (decizia 53), cu WhatsApp in cele trei locuri ale
    // canalului de acolo: butonul casetei, randul din panoul de canale (numarul) si butonul blocului de final. Faptul
    // pazit (fiecare legatura poarta ref-ul paginii, o singura data) ramane mai jos, neschimbat.
    expect(wa.length, 'legaturi WhatsApp in <main>').toBe(r.cale === '/ro/contact' ? 3 : 2)
    for (const h of wa) {
      expect(textWa(h)).toContain(ref)
      expect(textWa(h).split('[ref:').length - 1).toBe(1)
    }
    const cta = hrefuri(antet).filter((h) => h.startsWith(WA))
    expect(cta).toHaveLength(1)
    expect(textWa(cta[0])).toContain(ref)
    expect(antet).toContain('Scrie-ne pe ' + NUME_WA)
    expect(subsol).toContain('>WhatsApp: +')
    expect(hrefuri(html).filter((h) => h.toLowerCase().startsWith(SCHEMA_APEL))).toEqual([])
    expect(hrefuri(subsol)).toContain(CALE_LEGAL_RO)
  })

  test(r.cale + ': zero forme de politete, zero fraze despre asistentul pe WhatsApp si zero functii ale deciziei 43', async () => {
    const { html } = await servit(r.cale)
    const text = textVazut(bucata(html, /<header\b/, '</header>') + bucata(html, /<main\b/, '</main>') + bucata(html, /<footer\b/, '</footer>'))
    // Controlul extragerii: textul vazut are butonul de contact si microtextul paginii.
    expect(text).toContain('Scrie-ne pe ' + NUME_WA)
    expect(text).toContain('Îți răspunde o persoană din echipa 3S')
    expect(gasite(POLITETE, text)).toEqual([])
    expect(gasite(ASISTENT_WA, text)).toEqual([])
    expect(gasite(DECIZIA_43, text)).toEqual([])
  })

  test(r.cale + ': declaratia G-AI-02 (entitatile si H1-ul in primele 400 de cuvinte, primul paragraf)', async ({ browser }) => {
    const m = await masoaraRaspunsul(browser, copie.baza + r.cale, DECLARATII[r.cale])
    expect(m.cuvinteMain).toBeGreaterThan(100)
    expect(m.abateri).toEqual([])
  })
}

test('martor POZITIV al tiparelor: fraze fabricate sunt prinse, contactul cu o persoana pe WhatsApp nu', () => {
  expect(gasite(POLITETE, 'V' + 'ă rugăm să ne scrie' + 'ți; dumnea' + 'voastră alege' + 'ți.')).toHaveLength(4)
  expect(gasite(ASISTENT_WA, 'Întreabă arhiva direct pe ' + NUME_WA + '.')).toHaveLength(1)
  expect(gasite(DECIZIA_43, 'Port' + 'alul pentru clienți și aplicații ' + 'instalabile.')).toHaveLength(2)
  expect(gasite(ASISTENT_WA, 'Scrie-ne pe ' + NUME_WA + ' și descrie pe scurt arhiva firmei. Îți răspunde o persoană din echipa 3S.')).toEqual([])
  expect(gasite(ASISTENT_WA, 'Pe ' + NUME_WA + ' găsești documentul cu pagina lui.')).toHaveLength(1)
  expect(gasite(ASISTENT_WA, 'Dacă preferi o convorbire pe ' + NUME_WA + ', găsești numărul pe pagina de contact.')).toEqual([])
  expect(gasite(POLITETE, 'Poți contacta echipa 3S; situații, informații, aplicații.')).toEqual([])
})

for (const p of PERECHI) {
  test(p.cheie + ': hreflang reciproc intre pagina EN si pagina RO-MD, x-default pe pagina EN', async () => {
    const adresa = (cale: string) => ORIGINE + (cale === '/' ? '' : cale)
    const asteptate = { en: adresa(p.en), 'ro-MD': adresa(p.ro), 'x-default': adresa(p.en) }
    expect(alternate((await servit(p.en)).html)).toEqual(asteptate)
    expect(alternate((await servit(p.ro)).html)).toEqual(asteptate)
  })

  for (const [editie, cale, alta] of [
    ['EN', p.en, p.ro],
    ['RO-MD', p.ro, p.en],
  ]) {
    test(p.cheie + ', pagina ' + editie + ': selectorul EN | RO e in antet si duce la pagina pereche', async ({ page }) => {
      expect((await servit(cale)).html).toContain('data-selector-limba')
      await page.goto(copie.baza + cale)
      // Panoul se randeaza abia dupa ce React aplica clicul; pe pagina rece, cu hidratarea inca in curs, asta se poate
      // intampla DUPA ce clicul s-a intors, iar citirea imediata gasea o lista goala (CI: 1 din 2 rulari, primul caz al
      // fisierului; local: 1 din 130, prima pagina dupa construire). Deci se asteapta hidratarea butonului inainte de
      // clic si panoul deschis (prima optiune vizibila) inainte de citire; asertia ramane aceeasi.
      await asteaptaHidratarea(page, ['header [data-selector-limba] button'])
      const selector = page.locator('header [data-selector-limba]').first()
      await selector.locator('button').click()
      await expect(selector.locator('button')).toHaveAttribute('aria-expanded', 'true')
      await expect(selector.locator('a').first()).toBeVisible()
      const legaturi = await selector.locator('a').evaluateAll((el) => el.map((a) => a.getAttribute('href')))
      expect(legaturi).toContain(alta)
    })
  }
}

test('martor NEGATIV al selectorului: o pagina fara pereche (adresa fabricata, cu antetul EN) nu il are', async () => {
  // Dupa decizia 59 fiecare pagina EN are pereche /ro, deci pagina fara pereche se fabrica la rulare: o adresa fara
  // ruta, pe care copia o serveste cu pagina de negasit EN, cu acelasi antet. Controalele: antetul e acolo (absenta
  // nu vine dintr-un antet lipsa), adresa nu e in echivalente, iar pe /pricing, care are pereche, selectorul apare.
  const cale = '/fara-pereche-' + Date.now().toString(36)
  expect(pereche('pricing')).not.toBeNull()
  expect(citeste('src', 'content', 'echivalente.ts')).not.toContain('"' + cale + '"')
  const fara = await servit(cale)
  expect(fara.status).toBe(404)
  const antet = bucata(fara.html, /<header\b/, '</header>')
  expect(antet).toContain('href="/"')
  expect(antet).not.toContain('data-selector-limba')
  expect(bucata((await servit('/pricing')).html, /<header\b/, '</header>')).toContain('data-selector-limba')
})

test('harta de site are cele doua pagini RO-MD, pe domeniul profilului', async () => {
  const { status, html } = await servit('/sitemap.xml')
  expect(status).toBe(200)
  const adrese = [...html.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]))
  // Controlul extragerii: harta are pagina de contact EN, pe acelasi domeniu.
  expect(adrese.map((u) => u.pathname)).toContain('/contact')
  expect(adrese.every((u) => u.origin === ORIGINE)).toBe(true)
  for (const r of RUTE) expect(adrese.map((u) => u.pathname), r.cale).toContain(r.cale)
})
