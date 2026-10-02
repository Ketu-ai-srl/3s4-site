import type { Page } from '@playwright/test'
import { expect, test } from './ajutor/baza'
import { pornesteCopia3sMd, type Copie3sMd } from './ajutor/copie-3s-md'

/**
 * Felia 94 (`marcaj-in-linie`), proba 2: zero reziduuri de marcaj in linie pe COPIA 3s.md (`ajutor/copie-3s-md.ts`),
 * pe fiecare cale din `/sitemap.xml` si pe trei suprafete:
 *   1. `document.body.textContent` intreg, nu numai `<main>`: antetul si subsolul poarta etichetele navigatiei EN;
 *   2. continutul fiecarui `script[type="application/ld+json"]`: FAQPage se construieste din acelasi marcaj prin
 *      `textSimplu`, iar un reziduu acolo il citesc motoarele si asistentii AI fara sa se vada pe pagina;
 *   3. atributul `content` al lui `meta[name=description]` si al fiecarui `meta[property^="og:"]`.
 * Plus pagina de start: "Search with sources" e legatura spre `/features/search`, in `strong`, in `<main>`.
 *
 * CONTROALELE, asamblate la RULARE (marcajul vanat se lipeste din bucati, ca fisierul sa nu-l poarte literal):
 * detectorul iese rosu pe o COPIE a HTML-ului paginii de start cu un reziduu fabricat NUMAI in JSON-LD, apoi numai in
 * meta description si numai in corp; numarul de cai verificate = numarul de intrari din harta, si peste 10.
 */

const STELE = '*'.repeat(2)
const LIPITURA = ']' + '('
const PARANTEZA = '['

type Suprafete = { corp: string; jsonLd: string[]; meta: string[]; rsc: string }

/**
 * Cele trei suprafete ale paginii incarcate, plus fluxul RSC separat. Corpul e `textContent`-ul intreg al lui
 * `body` FARA elementele `script` si `style`: JSON-LD-ul e suprafata a doua, numarata pe bloc, iar scripturile
 * fluxului RSC poarta CHEILE React ale paragrafelor, care sunt chiar sirurile modulului, cu marcaj (masurat pe
 * 3s.md, identic pe baza si pe felie: 16 lipituri, in cate o cheie pe /platform, /enterprise, /pricing, /about si
 * /contact - paragraful "See also" -, de forma `["$","p","<sirul cu marcaj>",{"children":[...]}]`, langa copiii
 * deja desfacuti; zero in DOM-ul fara scripturi). Cheia nu e text: nu o vede omul si nu e in DOM. Reziduurile din
 * fluxul RSC se numara si se tiparesc, fara sa opreasca proba.
 */
async function suprafete(pagina: Page): Promise<Suprafete> {
  return pagina.evaluate(() => {
    const corp = document.body.cloneNode(true) as HTMLElement
    const scripturi = [...corp.querySelectorAll('script')]
    const rsc = scripturi
      .filter((s) => s.getAttribute('type') !== 'application/ld+json')
      .map((s) => s.textContent ?? '')
      .join('\n')
    for (const e of corp.querySelectorAll('script, style')) e.remove()
    return {
      corp: corp.textContent ?? '',
      jsonLd: [...document.querySelectorAll('script[type="application/ld+json"]')].map((s) => s.textContent ?? ''),
      meta: [...document.querySelectorAll('meta[name="description"], meta[property^="og:"]')].map((m) => m.getAttribute('content') ?? ''),
      rsc,
    }
  })
}

/** Reziduurile unui text: stelutele duble, lipitura legaturii, sau o paranteza deschisa urmata de lipitura. */
function reziduuri(text: string): string[] {
  const gasite: string[] = []
  const legaturaBruta = new RegExp('\\' + PARANTEZA + '[^\\n]{0,200}?\\]\\(')
  for (const [i, bucata] of text.split(STELE).entries()) if (i > 0) gasite.push('stele: ...' + bucata.slice(0, 60))
  for (const [i, bucata] of text.split(LIPITURA).entries()) if (i > 0) gasite.push('lipitura: ...' + bucata.slice(0, 60))
  if (!text.includes(LIPITURA) && legaturaBruta.test(text)) gasite.push('legatura bruta')
  return gasite
}

function reziduuriPePagina(s: Suprafete): { suprafata: string; reziduu: string }[] {
  return [
    ...reziduuri(s.corp).map((r) => ({ suprafata: 'corp', reziduu: r })),
    ...s.jsonLd.flatMap((j, i) => reziduuri(j).map((r) => ({ suprafata: 'json-ld ' + i, reziduu: r }))),
    ...s.meta.flatMap((m) => reziduuri(m).map((r) => ({ suprafata: 'meta', reziduu: r }))),
  ]
}

let copie: Copie3sMd

/** Caile din harta de site a copiei (adresele absolute de pe domeniul profilului devin cai). */
async function caiDinHarta(): Promise<string[]> {
  const xml = await (await fetch(copie.baza + '/sitemap.xml')).text()
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => {
    const u = new URL(m[1].trim())
    return u.pathname + u.search
  })
}

test.beforeAll(async () => {
  test.setTimeout(600_000)
  copie = await pornesteCopia3sMd()
})

test.afterAll(async () => {
  await copie?.opreste()
})

test('fiecare cale din sitemap: zero reziduuri pe corp, JSON-LD si meta (numarul de cai = harta, peste 10)', async ({ page }) => {
  test.setTimeout(600_000)
  const cai = await caiDinHarta()
  expect(cai.length, 'intrari in /sitemap.xml').toBeGreaterThan(10)
  // Controlul hartii: are editia EN la radacina si editia romaneasca sub /ro.
  expect(cai).toContain('/')
  expect(cai.some((c) => c.startsWith('/ro'))).toBe(true)
  expect(cai.some((c) => c.startsWith('/legal/'))).toBe(true)

  const gasite: string[] = []
  let verificate = 0
  let blocuriJsonLd = 0
  let reziduuriRsc = 0
  for (const cale of cai) {
    const raspuns = await page.goto(copie.baza + cale)
    expect(raspuns?.status(), cale).toBe(200)
    const s = await suprafete(page)
    // Controlul extragerii: corpul are text si meta description exista, deci un zero nu vine dintr-o pagina goala.
    expect(s.corp.length, cale).toBeGreaterThan(200)
    expect(s.meta.length, cale).toBeGreaterThan(0)
    blocuriJsonLd += s.jsonLd.length
    reziduuriRsc += reziduuri(s.rsc).length
    for (const r of reziduuriPePagina(s)) gasite.push(cale + ' [' + r.suprafata + '] ' + r.reziduu)
    verificate++
  }
  console.log(
    '[marcaj-brut] cai verificate: ' + verificate + ' din ' + cai.length + ' in harta; blocuri JSON-LD citite: ' + blocuriJsonLd +
      '; reziduuri in fluxul RSC (chei React, informativ): ' + reziduuriRsc,
  )
  expect(gasite).toEqual([])
  expect(verificate).toBe(cai.length)
  expect(blocuriJsonLd).toBeGreaterThan(0)
})

test('pagina de start: "Search with sources" e legatura spre /features/search, in strong, in <main>', async ({ page }) => {
  await page.goto(copie.baza + '/')
  const legaturi = page.locator('main strong > a[href="/features/search"]', { hasText: 'Search with sources' })
  await expect(legaturi).toHaveCount(1)
  // Textul accentului e cel din modul, fara marcaj: legatura plus punctul.
  const accent = page.locator('main strong').filter({ has: page.locator('a[href="/features/search"]') })
  await expect(accent).toHaveCount(1)
  await expect(accent).toHaveText('Search with sources.')
})

test('martor NEGATIV: copia neatinsa a HTML-ului startului, incarcata ca atare, iese curata pe toate suprafetele', async ({ page }) => {
  const html = await (await fetch(copie.baza + '/')).text()
  await page.setContent(html)
  const s = await suprafete(page)
  // Controlul extragerii: suprafetele copiei au continut (corp, JSON-LD, meta), deci zeroul nu vine dintr-o pagina goala.
  expect(s.corp.length).toBeGreaterThan(200)
  expect(s.jsonLd.length).toBeGreaterThan(0)
  expect(s.meta.length).toBeGreaterThan(0)
  expect(reziduuriPePagina(s)).toEqual([])
})

test('martor POZITIV: un reziduu fabricat numai in JSON-LD, numai in meta sau numai in corp, pe o copie a startului, e prins', async ({ page }) => {
  const html = await (await fetch(copie.baza + '/')).text()
  const reziduu = 'Vezi ' + STELE + PARANTEZA + 'aici' + LIPITURA + '/x).' + STELE

  const numaiJsonLd = html.replace('</head>', '<script type="application/ld+json">' + JSON.stringify({ '@type': 'Thing', name: reziduu }) + '</script></head>')
  expect(numaiJsonLd).not.toBe(html)
  await page.setContent(numaiJsonLd)
  const j = reziduuriPePagina(await suprafete(page))
  expect(j.length).toBeGreaterThan(0)
  expect(j.every((r) => r.suprafata.startsWith('json-ld'))).toBe(true)

  const numaiMeta = html.replace(/(<meta name="description" content=")[^"]*"/, '$1' + reziduu + '"')
  expect(numaiMeta).not.toBe(html)
  await page.setContent(numaiMeta)
  const m = reziduuriPePagina(await suprafete(page))
  expect(m.length).toBeGreaterThan(0)
  expect(m.every((r) => r.suprafata === 'meta')).toBe(true)

  const numaiCorp = html.replace('</footer>', '<p>' + reziduu + '</p></footer>')
  expect(numaiCorp).not.toBe(html)
  await page.setContent(numaiCorp)
  const c = reziduuriPePagina(await suprafete(page))
  expect(c.length).toBeGreaterThan(0)
  expect(c.every((r) => r.suprafata === 'corp')).toBe(true)
})
