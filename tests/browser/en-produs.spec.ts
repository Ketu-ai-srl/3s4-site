import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { expect, test } from './ajutor/baza'
import { pornesteCopia3sMd, type Copie3sMd } from './ajutor/copie-3s-md'
import { RADACINA } from './ajutor/proiect'
import { pagina as cautare } from '../../src/content/en/features-search'
import type { PaginaContinut } from '../../src/content/model/tipuri'

/**
 * Paginile de produs EN ale lui 3s.md (felia en-produs: P03 `/features/search`; P04 a iesit prin decizia 49), pe COPIA
 * construita si servita cu variabilele aplicatiei 3s.md (`ajutor/copie-3s-md.ts`, profilul `config/profil-3s-md.json`):
 * build-ul real al probelor e cel romanesc, unde paginile EN nu exista.
 *
 * Ce se cere, pe fiecare pagina:
 *   - pe HTML-ul SERVIT (fara JavaScript): 200, `<html lang="en">`, un singur H1, egal cu cel din modul, noindex pe
 *     staging, zero `<form`, zero `RON` ca cuvant;
 *   - CTA-ul WhatsApp din erou si cel din final duc la `wa.me` cu textul precompletat al paginii, care poarta
 *     `[ref:<ref>]` al ei (decodat inapoi si comparat cu modulul);
 *   - pe DOM-ul din browser: entitatile declaratiei G-AI-02 (`config/seo/en-produs.json`) si H1-ul in primele 400 de
 *     cuvinte din `<main>`.
 * Plus: paginile P05-P07, scoase de la lansare (decizia 43), si P04 `/features/whatsapp` (decizia 49: asistentul pe
 * WhatsApp nu exista in platforma) raspund 404 cu pagina de negasit EN; harta de site si llms.txt nu mai au P04.
 *
 * CONTROALE. Expresiile care numara `<form`, `RON` si legaturile WhatsApp se probeaza intai pe un HTML asamblat
 * la rulare (un martor pozitiv si unul negativ, cu titlurile cerute de proba de completitudine); pe pagina reala, extragerea trebuie sa gaseasca cel putin un H1 si cel
 * putin doua legaturi WhatsApp, ca un zero sa nu poata veni dintr-o citire goala.
 */

type Declaratie = { intrebare: string; entitati: string[] }
const DECLARATII = (
  JSON.parse(readFileSync(join(RADACINA, 'config', 'seo', 'en-produs.json'), 'utf8')) as {
    raspuns_autonom: Record<string, Declaratie>
  }
).raspuns_autonom

const PAGINI: PaginaContinut[] = [cautare]
const CALE_P04 = '/features/' + 'whats' + 'app'
const SCOASE: [string, string][] = [
  ['/features/mobile-app', 'decizia 43'],
  ['/features/client-portal', 'decizia 43'],
  ['/features/automations', 'decizia 43'],
  [CALE_P04, 'decizia 49'],
]

const MONEDA = new RegExp('\\b' + 'R' + 'ON' + '\\b')
const FORMULAR = new RegExp('<' + 'form\\b', 'i')

function hrefuriWhatsApp(html: string): string[] {
  return [...html.matchAll(/<a\b[^>]*\shref="(https:\/\/wa\.me\/[^"]*)"/g)].map((m) => m[1].split('&amp;').join('&'))
}

function textDinWa(href: string): string {
  return new URL(href).searchParams.get('text') ?? ''
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

test('martor POZITIV: formularul, moneda si legatura WhatsApp sunt prinse pe un HTML asamblat la rulare', () => {
  const href = 'https://wa.me/1?text=' + encodeURIComponent('Hello [ref:x-y].')
  const rau = '<main><' + 'form action="/a"></form><p>12 ' + 'R' + 'ON</p><a class="b" href="' + href + '">W</a></main>'
  expect(FORMULAR.test(rau)).toBe(true)
  expect(MONEDA.test(rau)).toBe(true)
  expect(hrefuriWhatsApp(rau).map(textDinWa)).toEqual(['Hello [ref:x-y].'])
})

test('martor NEGATIV: un HTML curat, cu cuvinte-capcana (ENVIRONMENT, PRONTO, formular), nu e acuzat', () => {
  const bun = '<main><p>From EUR 90, ENVIRONMENT, PRONTO, formular</p></main>'
  expect(FORMULAR.test(bun)).toBe(false)
  expect(MONEDA.test(bun)).toBe(false)
  expect(hrefuriWhatsApp(bun)).toEqual([])
})

test.beforeAll(async () => {
  test.setTimeout(600_000)
  copie = await pornesteCopia3sMd()
})

test.afterAll(async () => {
  await copie?.opreste()
})

test('preconditia: o pagina in grup (P04 a iesit, decizia 49), cu declaratia ei G-AI-02', () => {
  expect(PAGINI.map((p) => p.meta.cale)).toEqual(['/features/search'])
  expect(Object.keys(DECLARATII).sort()).toEqual(PAGINI.map((p) => p.meta.cale).sort())
})

for (const p of PAGINI) {
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

  test(p.meta.cale + ': CTA-urile WhatsApp poarta textul paginii, cu [ref:' + p.cta.ref + ']', async () => {
    const { html } = await servit(p.meta.cale)
    const corp = html.slice(html.indexOf('<main'), html.indexOf('</main>'))
    const texte = hrefuriWhatsApp(corp).map(textDinWa)
    // Eroul si blocul de final: cel putin doua, toate cu textul paginii.
    expect(texte.length).toBeGreaterThanOrEqual(2)
    for (const t of texte) expect(t).toBe(p.cta.textWhatsapp)
    expect(p.cta.textWhatsapp).toContain('[ref:' + p.cta.ref + ']')
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

for (const [cale, decizia] of SCOASE) {
  test(cale + ': 404 cu pagina de negasit EN (scoasa de la lansare, ' + decizia + ')', async () => {
    const { status, html } = await servit(cale)
    expect(status).toBe(404)
    expect(html).toMatch(/<html[^>]*\blang="en"/)
    expect(html).toContain('Page not found')
  })
}

test('harta de site si llms.txt fara P04 (decizia 49); controlul: amandoua au P03', async () => {
  for (const fisier of ['/sitemap.xml', '/llms.txt']) {
    const { status, html } = await servit(fisier)
    expect(status, fisier).toBe(200)
    expect(html, fisier).toContain('/features/search')
    expect(html, fisier).not.toContain(CALE_P04)
  }
})
