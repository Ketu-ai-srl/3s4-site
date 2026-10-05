import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import type { Page } from '@playwright/test'
import { EDITII } from '../../src/lib/editii'
import { expect, test } from './ajutor/baza'
import { mediuProfil3sMd, pornesteCopia3sMd, type Copie3sMd } from './ajutor/copie-3s-md'
import { masoaraRaspunsul, type DeclaratieRaspuns } from './ajutor/geo'
import { RADACINA } from './ajutor/proiect'

/**
 * Oglinzile /ro ale paginilor EN (felia ro-md-oglinda, decizia 59) pe COPIA 3s.md (`ajutor/copie-3s-md.ts`): build-ul
 * real al probelor e cel romanesc, unde paginile RO-MD nu exista.
 *
 * Ce se cere, pe HTML-ul servit (fara JavaScript), pe fiecare pagina a feliei: 200, `<html lang="ro">`,
 * `Content-Language` al editiei ro-MD, un singur H1, noindex pe staging, zero `<form`, zero RON; legaturile WhatsApp
 * din `<main>` poarta `[ref:<ref>]` al paginii; nicio eticheta "(în engleză)" (tintele /ro exista acum); fiecare
 * legatura interna din `<main>` ramane in editia /ro si raspunde 200. Apoi hreflang reciproc intre pagina EN si
 * oglinda ei, selectorul EN | RO pe ambele, declaratiile G-AI-02 masurate, harta de site cu cele opt pagini, si
 * FAQPage din JSON-LD egal cu intrebarile si raspunsurile vizibile (sau absent, pe paginile fara intrebari).
 *
 * Asteptarile (caile, cheile, codurile `ref`, perechile) se citesc la RULARE din manifeste si din tabelul navigatiei.
 * Fixturile tiparelor se asambleaza din bucati.
 */

const PROFIL = mediuProfil3sMd()
const ORIGINE = PROFIL.SITE_URL.replace(/\/+$/, '')
const CANALE = JSON.parse(PROFIL.CANALE_JSON) as { whatsapp: string }
const WA = 'https://wa.me/' + CANALE.whatsapp + '?text='
const RON = new RegExp('\\b' + 'R' + 'ON\\b')
const LIMBA = EDITII['ro-MD'].inLanguage
const ETICHETA_EN = '(în ' + 'engleză)'

const citeste = (...cale: string[]) => readFileSync(join(RADACINA, ...cale), 'utf8')

/** Rutele feliei, citite ca text de sub marcajul ei din manifestul RO-MD. */
function ruteFelie(): { cale: string; cheie: string }[] {
  const text = citeste('src', 'content', 'rute-ro-md.ts')
  const start = text.indexOf('<<felie:ro-md-oglinda>>')
  // Blocul se termina la urmatorul marcaj de felie (ro-md-acasa-contact sta dupa el) sau la sfarsitul listei.
  const urmator = start < 0 ? -1 : text.indexOf('<<felie:', start + 1)
  const bucata = start < 0 ? '' : text.slice(start, urmator < 0 ? text.indexOf('\n];', start) : urmator)
  return [...bucata.matchAll(/cale:\s*"([^"]+)"[\s\S]*?cheie:\s*"([^"]+)"/g)].map((m) => ({ cale: m[1], cheie: m[2] }))
}

/** Codul `ref` al fiecarei cai, din tabelul navigatiei RO-MD. */
function refuri(): Map<string, string> {
  const text = citeste('src', 'content', 'navigatie-ro-md.ts')
  // Un `ref` poate fi o constanta a fisierului (`ref: REF_CAUTARE`): se rezolva din declaratia ei, tot ca text.
  const constante = new Map([...text.matchAll(/^const\s+([A-Z_]+)\s*=\s*"([^"]+)";/gm)].map((m) => [m[1], m[2]]))
  return new Map(
    [...text.matchAll(/cale:\s*"([^"]+)",\s*ref:\s*(?:"([^"]+)"|([A-Z_]+))/g)].map((m) => [m[1], m[2] ?? constante.get(m[3]) ?? '(constanta nerezolvata)']),
  )
}

/** Calea EN a fiecarei chei, din manifestele EN (sursa independenta de tabelul de echivalente). */
function caiEn(): Map<string, string> {
  const harta = new Map<string, string>()
  for (const fisier of ['rute-en-nucleu.ts', 'rute-en-produs.ts', 'rute-en-referinta.ts']) {
    for (const m of citeste('src', 'content', fisier).matchAll(/cale:\s*"([^"]+)"[\s\S]*?cheie:\s*"([^"]+)"/g)) harta.set(m[2], m[1])
  }
  return harta
}

const RUTE = ruteFelie()
const REF = refuri()
const EN = caiEn()
const PERECHI = RUTE.map((r) => ({ cheie: r.cheie, en: EN.get(r.cheie) ?? '(fara pagina EN)', ro: r.cale }))
const DECLARATII = (JSON.parse(citeste('config', 'seo', 'ro-md-oglinda.json')) as { raspuns_autonom: Record<string, DeclaratieRaspuns> }).raspuns_autonom

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

/** Legaturile interne (cale absoluta pe acelasi site), fara ancora si fara interogare. */
function interne(html: string): string[] {
  return hrefuri(html)
    .filter((h) => h.startsWith('/') && !h.startsWith('//'))
    .map((h) => h.split('#')[0].split('?')[0])
    .filter((h) => h !== '')
}

/** Legaturile interne care ies din editia /ro. */
function iesiriDinEditie(html: string): string[] {
  return interne(html).filter((c) => c !== '/ro' && !c.startsWith('/ro/'))
}

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

test.beforeAll(async () => {
  test.setTimeout(600_000)
  copie = await pornesteCopia3sMd()
})

test.afterAll(async () => {
  await copie?.opreste()
})

test('preconditia: 8 rute sub marcajul feliei, fiecare cu ref, pereche EN si declaratie G-AI-02', () => {
  expect(RUTE.map((r) => r.cale).sort()).toEqual([
    '/ro/comparatie-drive',
    '/ro/enterprise',
    '/ro/functionalitati/cautare-ai',
    '/ro/ghiduri/arhivare-e-facturi-ue',
    '/ro/ghiduri/termene-pastrare-moldova',
    '/ro/platforma',
    '/ro/preturi',
    '/ro/securitate',
  ])
  for (const r of RUTE) {
    expect(REF.get(r.cale), r.cale).toMatch(/^ro-md-[a-z-]+$/)
    expect(DECLARATII[r.cale], r.cale).toBeDefined()
  }
  for (const p of PERECHI) expect(p.en, p.cheie).toMatch(/^\/[a-z]/)
  expect(LIMBA).toBe('ro-MD')
})

test('martor POZITIV al detectorilor: legatura spre EN, eticheta engleza si RON sunt prinse', () => {
  const html = '<a href="/ro/preturi">a</a><a href="/pricing#pilot">b</a><a href="/ro">c</a><a href="https://x.y/z">d</a>'
  expect(iesiriDinEditie(html)).toEqual(['/pricing'])
  expect(interne(html)).toEqual(['/ro/preturi', '/pricing', '/ro'])
  expect(('Ghidul ' + ETICHETA_EN).includes(ETICHETA_EN)).toBe(true)
  expect(RON.test('Pret: 15 ' + 'R' + 'ON')).toBe(true)
})

test('martor NEGATIV al detectorilor: legaturile /ro si externe nu sunt acuzate, un cuvant care doar contine literele nu e RON', () => {
  expect(iesiriDinEditie('<a href="/ro/preturi">a</a><a href="/ro#faq">b</a><a href="https://x.y/z">c</a>')).toEqual([])
  expect(RON.test('ac' + 'RON' + 'ym')).toBe(false)
  expect('Ghidul în română'.includes(ETICHETA_EN)).toBe(false)
})

for (const r of ruteFelie()) {
  test(r.cale + ': 200, lang="ro", Content-Language ' + LIMBA + ', un H1, noindex, zero <form, zero RON, fara eticheta engleza', async () => {
    const { status, html, robots, limba } = await servit(r.cale)
    expect(status).toBe(200)
    expect(html).toMatch(/<html[^>]*\blang="ro"/)
    expect(limba).toBe(LIMBA)
    expect(html.match(/<h1\b/g) ?? []).toHaveLength(1)
    expect(robots).toContain('noindex')
    expect(html).not.toContain('<form')
    expect(RON.test(html)).toBe(false)
    expect(bucata(html, /<main\b/, '</main>')).not.toContain(ETICHETA_EN)
  })

  test(r.cale + ': WhatsApp cu ref-ul paginii in antet si in <main>, legaturile interne raman in /ro si raspund 200', async () => {
    const { html } = await servit(r.cale)
    const ref = '[ref:' + REF.get(r.cale) + ']'
    const main = bucata(html, /<main\b/, '</main>')
    expect(main).not.toBe('')
    const cta = hrefuri(bucata(html, /<header\b/, '</header>')).filter((h) => h.startsWith(WA))
    expect(cta).toHaveLength(1)
    expect(decodeURIComponent(cta[0].slice(WA.length))).toContain(ref)
    const wa = hrefuri(main).filter((h) => h.startsWith(WA))
    // Pagina despre 3S n-are bloc de final, ca perechile ei RO si EN: canalul ei e numai in antet.
    if (r.cale === '/ro/securitate') expect(wa, 'legaturi WhatsApp in <main>').toEqual([])
    else expect(wa.length, 'legaturi WhatsApp in <main>').toBeGreaterThan(0)
    for (const h of wa) expect(decodeURIComponent(h.slice(WA.length))).toContain(ref)
    expect(iesiriDinEditie(main)).toEqual([])
    const tinte = [...new Set(interne(main))]
    for (const t of tinte) expect((await servit(t)).status, r.cale + ' -> ' + t).toBe(200)
  })

  test(r.cale + ': declaratia G-AI-02 (entitatile si H1-ul in primele 400 de cuvinte, primul paragraf)', async ({ browser }) => {
    const m = await masoaraRaspunsul(browser, copie.baza + r.cale, DECLARATII[r.cale])
    expect(m.cuvinteMain).toBeGreaterThan(100)
    expect(m.abateri).toEqual([])
  })
}

for (const p of PERECHI) {
  test(p.cheie + ': hreflang reciproc intre ' + p.en + ' si ' + p.ro + ', x-default pe pagina EN', async () => {
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
      const selector = page.locator('header [data-selector-limba]').first()
      await selector.locator('button').click()
      const legaturi = await selector.locator('a').evaluateAll((el) => el.map((a) => a.getAttribute('href')))
      expect(legaturi).toContain(alta)
    })
  }
}

/**
 * Sectiunea de intrebari a paginilor cu FAQPage, dupa cheia paginii: atributul `aria-labelledby` al componentei
 * (aceleasi componente ca perechile EN). O pagina a feliei care nu e aici nu are voie sa emita FAQPage.
 */
const SECTIUNI_FAQ: Record<string, string> = {
  platform: 'platforma-intrebari',
  pricing: 'intrebari-preturi-titlu',
  about: 'securitate-intrebari',
  'guides-e-invoice-archiving-eu': 'efacturare-intrebari',
}

type NodFaq = { mainEntity: { name: string; acceptedAnswer: { text: string } }[] }
const curat = (t: string) => t.replace(/\s+/g, ' ').trim()

/** Nodurile JSON-LD ale paginii incarcate (blocurile cu `@graph` desfacute). */
async function noduriLd(page: Page): Promise<Record<string, unknown>[]> {
  const blocuri = await page.locator('script[type="application/ld+json"]').allTextContents()
  expect(blocuri.length).toBeGreaterThan(0)
  return blocuri.flatMap((b) => {
    const j = JSON.parse(b) as { '@graph'?: Record<string, unknown>[] } & Record<string, unknown>
    return j['@graph'] ?? [j]
  })
}

test('preconditia FAQPage: fiecare cheie cu sectiune de intrebari e o pagina a feliei', () => {
  const chei = RUTE.map((r) => r.cheie)
  for (const c of Object.keys(SECTIUNI_FAQ)) expect(chei, c).toContain(c)
})

for (const r of ruteFelie()) {
  test(r.cale + ': FAQPage din JSON-LD = intrebarile si raspunsurile vizibile, in ordine (fara sectiune, fara FAQPage)', async ({ page }) => {
    await page.goto(copie.baza + r.cale)
    const faq = (await noduriLd(page)).filter((n) => n['@type'] === 'FAQPage') as NodFaq[]
    const id = SECTIUNI_FAQ[r.cheie]
    if (id === undefined) {
      expect(faq).toHaveLength(0)
      return
    }
    expect(faq).toHaveLength(1)
    const sectiune = page.locator('section[aria-labelledby="' + id + '"]')
    await expect(sectiune).toHaveCount(1)
    // Acordeonul are doua forme: `details` (intrebarea in `summary`) si butonul cu `aria-expanded` (raspunsul intr-o
    // regiune ascunsa cat e inchisa, dar prezenta in DOM).
    const intrebari = (await sectiune.locator('summary, button[aria-expanded]').allTextContents()).map(curat)
    const raspunsuri = (await sectiune.locator('details > div, [role="region"]').allTextContents()).map(curat)
    console.log('[ro-md-oglinda] ' + r.cale + ': FAQPage ' + faq[0].mainEntity.length + ' intrebari, vizibile ' + intrebari.length + ', raspunsuri ' + raspunsuri.length)
    expect(intrebari.length).toBeGreaterThan(2)
    expect(faq[0].mainEntity.map((q) => curat(q.name))).toEqual(intrebari)
    expect(faq[0].mainEntity.map((q) => curat(q.acceptedAnswer.text))).toEqual(raspunsuri)
    // Martorii: nodul fara o intrebare si nodul in alta ordine nu mai egaleaza lista vizibila.
    expect(faq[0].mainEntity.slice(1).map((q) => curat(q.name))).not.toEqual(intrebari)
    expect(faq[0].mainEntity.map((q) => curat(q.name)).reverse()).not.toEqual(intrebari)
  })
}

test('harta de site are cele opt pagini ale feliei, pe domeniul profilului', async () => {
  const { status, html } = await servit('/sitemap.xml')
  expect(status).toBe(200)
  const adrese = [...html.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]))
  // Controlul extragerii: harta are pagina de contact /ro, pusa de alta felie.
  expect(adrese.map((u) => u.pathname)).toContain('/ro/contact')
  expect(adrese.every((u) => u.origin === ORIGINE)).toBe(true)
  for (const r of RUTE) expect(adrese.map((u) => u.pathname), r.cale).toContain(r.cale)
})
