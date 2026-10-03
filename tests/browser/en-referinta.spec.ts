import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { expect, test } from './ajutor/baza'
import { pornesteCopia3sMd, type Copie3sMd } from './ajutor/copie-3s-md'
import { RADACINA } from './ajutor/proiect'
import { inJur as inJurComparatie, pagina as comparatie } from '../../src/content/en/compare-3s-vs-google-and-box'
import { inJur as inJurEfacturi, pagina as efacturi } from '../../src/content/en/guides-e-invoice-archiving-eu'
import { inJur as inJurMoldova, pagina as moldova } from '../../src/content/en/guides-records-retention-moldova'
import type { PaginaContinut } from '../../src/content/model/tipuri'

/**
 * Paginile EN de referinta ale lui 3s.md (felia en-referinta: G1 `/guides/e-invoice-archiving-eu`, G2
 * `/guides/records-retention-moldova`, G3 `/compare/3s-vs-google-and-box`), pe COPIA construita si servita cu
 * variabilele aplicatiei 3s.md (`ajutor/copie-3s-md.ts`, profilul `config/profil-3s-md.json`): build-ul real al
 * probelor e cel romanesc, unde paginile EN nu exista.
 *
 * Ce se cere, pe fiecare pagina:
 *   - pe HTML-ul SERVIT (fara JavaScript): 200, `<html lang="en">`, un singur H1, egal cu cel din modul, noindex pe
 *     staging, zero `<form`, zero `RON` ca cuvant;
 *   - legaturile WhatsApp din `<main>` duc la `wa.me` si poarta `[ref:<ref>]` al paginii: CTA-ul din erou si cel din
 *     final cu textul paginii, legatura "Tell us if ... is out of date" cu textul ei (decodate si comparate cu modulul);
 *   - pe DOM-ul din browser: entitatile declaratiei G-AI-02 (`config/seo/en-referinta.json`) si H1-ul in primele 400
 *     de cuvinte din `<main>`.
 * Pe tot site-ul EN: harta de site are 10 pagini EN de marketing (in afara celor juridice si a editiei `/ro`), cu cele
 * trei; llms.txt are cele trei adrese; nicio pagina din harta nu mai are o legatura inerta spre `/guides` sau `/compare`
 * (pe baza erau 7); grupul Guides apare in antet si in subsol, cu legaturi reale.
 *
 * CONTROALE. Expresiile care numara `<form`, `RON`, legaturile WhatsApp si legaturile inerte se probeaza intai pe un
 * HTML asamblat la rulare (un martor pozitiv si unul negativ); pe paginile reale, extragerea trebuie sa gaseasca cel
 * putin un H1, trei legaturi WhatsApp si cel putin o legatura reala spre ghiduri, ca un zero sa nu vina dintr-o
 * citire goala.
 */

type Declaratie = { intrebare: string; entitati: string[] }
const DECLARATII = (
  JSON.parse(readFileSync(join(RADACINA, 'config', 'seo', 'en-referinta.json'), 'utf8')) as {
    raspuns_autonom: Record<string, Declaratie>
  }
).raspuns_autonom

const PAGINI: { pagina: PaginaContinut; semnalare: string }[] = [
  { pagina: efacturi, semnalare: inJurEfacturi.semnalare.textWhatsapp },
  { pagina: moldova, semnalare: inJurMoldova.semnalare.textWhatsapp },
  { pagina: comparatie, semnalare: inJurComparatie.semnalare.textWhatsapp },
]
const CAI = PAGINI.map((p) => p.pagina.meta.cale)

const MONEDA = new RegExp('\\b' + 'R' + 'ON' + '\\b')
const FORMULAR = new RegExp('<' + 'form\\b', 'i')
const INERTE_REFERINTA = /data-tinta-lipsa="(\/(?:guides|compare)\/[^"]*)"/g
const REALE_REFERINTA = /<a\b[^>]*\shref="(\/(?:guides|compare)\/[^"#]*)/g

function hrefuriWhatsApp(html: string): string[] {
  return [...html.matchAll(/<a\b[^>]*\shref="(https:\/\/wa\.me\/[^"]*)"/g)].map((m) => m[1].split('&amp;').join('&'))
}

function textDinWa(href: string): string {
  return new URL(href).searchParams.get('text') ?? ''
}

function inerte(html: string): string[] {
  return [...html.matchAll(INERTE_REFERINTA)].map((m) => m[1])
}

function reale(html: string): string[] {
  return [...html.matchAll(REALE_REFERINTA)].map((m) => m[1])
}

/** Caile din harta de site, fara gazda. */
function caiDinHarta(xml: string): string[] {
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname.replace(/\/$/, '') || '/')
}

/** Paginile EN de marketing: fara cele juridice si fara editia RO-MD de sub `/ro`. */
function deMarketing(cai: string[]): string[] {
  return cai.filter((c) => !c.startsWith('/legal') && c !== '/ro' && !c.startsWith('/ro/'))
}

let copie: Copie3sMd

async function servit(cale: string): Promise<{ status: number; html: string; robots: string }> {
  const r = await fetch(copie.baza + cale, { redirect: 'manual' })
  return {
    status: r.status,
    html: await r.text(),
    robots: r.headers.get('x-robots-tag') ?? '',
  }
}

test('martor POZITIV: formularul, moneda, legatura WhatsApp si legatura inerta spre un ghid sunt prinse pe un HTML asamblat la rulare', () => {
  const href = 'https://wa.me/1?text=' + encodeURIComponent('Hello [ref:x-y].')
  const rau =
    '<main><' +
    'form action="/a"></form><p>12 ' +
    'R' +
    'ON</p><a class="b" href="' +
    href +
    '">W</a><span data-tinta-lipsa="/guides/' +
    'x">G</span><a class="c" href="/compare/' +
    'y">C</a></main>'
  expect(FORMULAR.test(rau)).toBe(true)
  expect(MONEDA.test(rau)).toBe(true)
  expect(hrefuriWhatsApp(rau).map(textDinWa)).toEqual(['Hello [ref:x-y].'])
  expect(inerte(rau)).toEqual(['/guides/x'])
  expect(reale(rau)).toEqual(['/compare/y'])
  expect(deMarketing(caiDinHarta('<loc>https://a.test/</loc><loc>https://a.test/legal/terms</loc><loc>https://a.test/ro/contact</loc><loc>https://a.test/guides/x</loc>'))).toEqual(['/', '/guides/x'])
})

test('martor NEGATIV: un HTML curat, cu cuvinte-capcana (ENVIRONMENT, PRONTO, formular, /guidesx), nu e acuzat', () => {
  const bun = '<main><p>From EUR 90, ENVIRONMENT, PRONTO, formular</p><span data-tinta-lipsa="/guidesx">x</span></main>'
  expect(FORMULAR.test(bun)).toBe(false)
  expect(MONEDA.test(bun)).toBe(false)
  expect(hrefuriWhatsApp(bun)).toEqual([])
  expect(inerte(bun)).toEqual([])
})

test.beforeAll(async () => {
  test.setTimeout(600_000)
  copie = await pornesteCopia3sMd()
})

test.afterAll(async () => {
  await copie?.opreste()
})

test('preconditia: trei pagini in grup, cu declaratiile lor G-AI-02', () => {
  expect(CAI).toEqual(['/guides/e-invoice-archiving-eu', '/guides/records-retention-moldova', '/compare/3s-vs-google-and-box'])
  expect(Object.keys(DECLARATII).sort()).toEqual([...CAI].sort())
})

for (const { pagina: p, semnalare } of PAGINI) {
  test(p.meta.cale + ': 200, <html lang="en">, un H1, noindex, zero formulare, zero moneda romaneasca', async () => {
    const { status, html, robots } = await servit(p.meta.cale)
    expect(status).toBe(200)
    expect(html).toMatch(/<html[^>]*\blang="en"/)
    const h1 = [...html.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/g)].map((m) => m[1])
    expect(h1).toEqual([p.h1])
    expect(robots).toContain('noindex')
    expect(FORMULAR.test(html)).toBe(false)
    expect(MONEDA.test(html)).toBe(false)
  })

  test(p.meta.cale + ': legaturile WhatsApp din <main> poarta [ref:' + p.cta.ref + '] (erou, semnalare, final)', async () => {
    const { html } = await servit(p.meta.cale)
    const corp = html.slice(html.indexOf('<main'), html.indexOf('</main>'))
    const texte = hrefuriWhatsApp(corp).map(textDinWa)
    expect(texte).toEqual([p.cta.textWhatsapp, semnalare, p.cta.textWhatsapp])
    for (const t of texte) expect(t).toContain('[ref:' + p.cta.ref + ']')
  })

  test(p.meta.cale + ': entitatile G-AI-02 si H1-ul in primele 400 de cuvinte din <main>', async ({ page }) => {
    await page.goto(copie.baza + p.meta.cale)
    const text = await page.locator('main').innerText()
    const fereastra = text.split(/\s+/).filter(Boolean).slice(0, 400).join(' ')
    expect(fereastra).toContain(p.h1)
    const decl = DECLARATII[p.meta.cale]
    const lipsa = decl.entitati.filter((e) => !fereastra.toLowerCase().includes(e.toLowerCase()))
    expect(lipsa).toEqual([])
  })
}

test('harta de site: 10 pagini EN de marketing, cu cele trei; llms.txt are cele trei adrese', async () => {
  const harta = await servit('/sitemap.xml')
  expect(harta.status).toBe(200)
  const cai = caiDinHarta(harta.html)
  // Controlul citirii: harta are si paginile juridice EN, deci filtrul chiar scoate ceva.
  expect(cai.filter((c) => c.startsWith('/legal')).length).toBeGreaterThan(0)
  const marketing = deMarketing(cai)
  for (const c of CAI) expect(marketing).toContain(c)
  expect(marketing).toHaveLength(10)
  const llms = await servit('/llms.txt')
  expect(llms.status).toBe(200)
  // Legatura Markdown spre fiecare pagina: adresa se termina cu calea paginii.
  for (const c of CAI) expect(llms.html, c).toContain(c + ')')
})

test('nicio pagina EN din harta nu mai are o legatura inerta spre /guides sau /compare; legaturile reale exista', async () => {
  const cai = caiDinHarta((await servit('/sitemap.xml')).html)
  expect(cai.length).toBeGreaterThan(10)
  const gasite: string[] = []
  let realeTotal = 0
  for (const c of cai) {
    const { status, html } = await servit(c)
    expect(status, c).toBe(200)
    gasite.push(...inerte(html).map((x) => c + ' -> ' + x))
    realeTotal += reale(html).length
  }
  expect(gasite).toEqual([])
  // Controlul: extragerea citeste legaturi spre ghiduri (antet, subsol, textul paginilor), deci zeroul nu vine din citire.
  expect(realeTotal).toBeGreaterThan(cai.length)
})

test.describe('grupul Guides la 1440', () => {
  test.use({ viewport: { width: 1440, height: 900 } })

  test('grupul Guides: foaia din antet are cele trei pagini, iar subsolul le are ca legaturi reale', async ({ page }) => {
    await page.goto(copie.baza + '/')
    const subsol = page.locator('footer')
    await expect(subsol.getByText('Guides', { exact: true })).toHaveCount(1)
    for (const c of CAI) await expect(subsol.locator('a[href="' + c + '"]')).toHaveCount(1)
    const declansator = page.locator('header[data-antet] [data-declansator="Guides"]')
    await expect(declansator).toHaveCount(1)
    await expect(declansator).toHaveAttribute('href', CAI[0])
    // Hover-ul deschide foaia (comportamentul antetului); controlul: aria-expanded trece pe true.
    await declansator.hover()
    await expect(declansator).toHaveAttribute('aria-expanded', 'true')
    const elemente = page.locator('header[data-antet] [data-element-meniu]')
    const hrefuri = await elemente.evaluateAll((el) => el.map((e) => (e.closest('a') ?? e.querySelector('a'))?.getAttribute('href') ?? ''))
    // Foile meniului sunt montate impreuna (Product si Guides); cele trei pagini apar o data fiecare.
    for (const c of CAI) expect(hrefuri.filter((h) => h === c), c).toHaveLength(1)
    expect(inerte(await page.locator('header[data-antet]').evaluate((el) => el.outerHTML))).toEqual([])
  })
})
