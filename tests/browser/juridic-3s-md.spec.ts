import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { expect, test } from './ajutor/baza'
import { mediuProfil3sMd, pornesteCopia3sMd, type Copie3sMd } from './ajutor/copie-3s-md'
import { RADACINA } from './ajutor/proiect'

/**
 * Paginile juridice ale lui 3s.md (felia juridic-pagini-3s-md), pe COPIA construita si servita cu variabilele
 * aplicatiei 3s.md (`ajutor/copie-3s-md.ts`, profilul `config/profil-3s-md.json`, operatorul-model D2): build-ul
 * real al probelor e cel romanesc, unde paginile EN si RO-MD nu exista.
 *
 * Ce se cere, pe HTML-ul servit (fara JavaScript):
 *   - cele 6 + 6 pagini cu poarta B din `config/juridic-rute.json`: 200, `<html lang>` al editiei, un singur H1;
 *   - hreflang reciproc pe fiecare pereche, cu adresele de pe domeniul profilului si `x-default` = pagina EN;
 *   - marcajul modelului D2 (`config/model-d2.json`) pe informatiile legale, in limba paginii;
 *   - nicio legatura spre documentele cu poarta C, iar adresele lor raspund 404; la fel `/legal` si `/ro/juridic`
 *     (fara pagina de index), cu pagina de negasit EN.
 *
 * Asteptarile se citesc din fisierele de configurare la RULARE, nu se scriu aici. Controlul extragerii de
 * legaturi: pe fiecare pagina, bara laterala trebuie sa duca spre celelalte documente B ale limbii; o extragere
 * care n-ar citi nimic ar pica acolo, nu ar trece tacut la "zero legaturi spre C".
 */

type Document = { en: string; ro: string; poarta: string }
const CONFIG = JSON.parse(readFileSync(join(RADACINA, 'config', 'juridic-rute.json'), 'utf8')) as { documente: Record<string, Document> }
const D2 = JSON.parse(readFileSync(join(RADACINA, 'config', 'model-d2.json'), 'utf8')) as { marcaj: { ro: string; en: string } }
const ORIGINE = mediuProfil3sMd().SITE_URL.replace(/\/+$/, '')

const B = Object.entries(CONFIG.documente).filter(([, d]) => d.poarta === 'B')
const C = Object.entries(CONFIG.documente).filter(([, d]) => d.poarta === 'C')
const CAI_C = C.flatMap(([, d]) => [d.en, d.ro])
const PAGINI = B.flatMap(([cheie, d]) => [
  { cheie, cale: d.en, lang: 'en', limba: 'en' as const },
  { cheie, cale: d.ro, lang: 'ro', limba: 'ro' as const },
])

let copie: Copie3sMd

async function servit(cale: string): Promise<{ status: number; html: string; robots: string }> {
  const r = await fetch(copie.baza + cale, { redirect: 'manual' })
  return { status: r.status, html: await r.text(), robots: r.headers.get('x-robots-tag') ?? '' }
}

function hrefuri(html: string): string[] {
  return [...html.matchAll(/<a\b[^>]*\shref="([^"]*)"/g)].map((m) => m[1].split('&amp;').join('&'))
}

/** Legaturile dintr-un HTML spre documentele cu poarta C (relative, cu ancora sau absolute pe domeniu). */
function legaturiSpreC(html: string): string[] {
  const cale = (h: string) => (h.startsWith(ORIGINE + '/') ? h.slice(ORIGINE.length) : h).split(/[?#]/)[0]
  return hrefuri(html).filter((h) => CAI_C.includes(cale(h)))
}

/** Alternatele din `<head>`: hreflang -> adresa. */
function alternate(html: string): Record<string, string> {
  const rezultat: Record<string, string> = {}
  for (const m of html.matchAll(/<link\b[^>]*>/g)) {
    const eticheta = m[0]
    if (!/\brel="alternate"/.test(eticheta)) continue
    const limba = /\bhrefLang="([^"]+)"/i.exec(eticheta)?.[1]
    const adresa = /\bhref="([^"]+)"/.exec(eticheta)?.[1]
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

test('preconditia: 6 documente B si 2 C in configurare, 12 pagini de masurat', () => {
  expect(B).toHaveLength(6)
  expect(C).toHaveLength(2)
  expect(PAGINI).toHaveLength(12)
})

for (const p of PAGINI) {
  test(p.cale + ': 200, <html lang="' + p.lang + '">, un H1, noindex pe staging, legaturi spre celelalte documente B', async () => {
    const { status, html, robots } = await servit(p.cale)
    expect(status).toBe(200)
    expect(html).toMatch(new RegExp('<html[^>]*\\blang="' + p.lang + '"'))
    expect(html.match(/<h1\b/g) ?? []).toHaveLength(1)
    expect(robots).toContain('noindex')
    const legaturi = hrefuri(html)
    // Controlul extragerii: bara laterala duce spre celelalte documente B, in limba paginii.
    for (const [, d] of B) {
      if (d[p.limba] !== p.cale) expect(legaturi, d[p.limba]).toContain(d[p.limba])
    }
    expect(legaturiSpreC(html)).toEqual([])
  })
}

test('martor POZITIV: filtrul prinde legaturile spre documentele C intr-un HTML asamblat la rulare', () => {
  const html = CAI_C.map((c, i) => '<a href="' + (i === 0 ? c : ORIGINE + c + '#s1') + '">' + c + '</a>').join('')
  expect(legaturiSpreC(html)).toHaveLength(CAI_C.length)
})

test('martor NEGATIV: pagina de negasit nu are alternate hreflang, iar o pagina B nu are legaturi spre C', async () => {
  expect(alternate((await servit(CAI_C[0])).html)).toEqual({})
  expect(legaturiSpreC((await servit(PAGINI[0].cale)).html)).toEqual([])
})

for (const [cheie, d] of B) {
  test(cheie + ': hreflang reciproc intre ' + d.en + ' si ' + d.ro + ', x-default pe pagina EN', async () => {
    const asteptate = { en: ORIGINE + d.en, 'ro-MD': ORIGINE + d.ro, 'x-default': ORIGINE + d.en }
    expect(alternate((await servit(d.en)).html)).toEqual(asteptate)
    expect(alternate((await servit(d.ro)).html)).toEqual(asteptate)
  })
}

test('marcajul modelului D2 pe informatiile legale, in limba paginii', async () => {
  const d = CONFIG.documente['informatii-legale']
  const en = (await servit(d.en)).html
  const ro = (await servit(d.ro)).html
  expect(en).toContain(D2.marcaj.en)
  expect(ro).toContain(D2.marcaj.ro)
  // Controlul: marcajul unei limbi nu apare pe pagina celeilalte (proba deosebeste paginile).
  expect(en).not.toContain(D2.marcaj.ro)
  expect(ro).not.toContain(D2.marcaj.en)
})

for (const cale of [...CAI_C, '/legal', '/ro/juridic']) {
  test(cale + ': 404, pagina de negasit EN, noindex', async () => {
    const { status, html, robots } = await servit(cale)
    expect(status).toBe(404)
    expect(html).toMatch(/<html[^>]*\blang="en"/)
    expect(robots).toContain('noindex')
  })
}
