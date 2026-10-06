import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import type { Page } from '@playwright/test'
import { expect, test } from './ajutor/baza'
import { mediuProfil3sMd, pornesteCopia3sMd, type Copie3sMd } from './ajutor/copie-3s-md'
import { IMPACTURI_BLOCANTE, masoaraAccesibilitatea, masoaraDerapaj } from './ajutor/detectori'
import { RADACINA, nemasurat } from './ajutor/proiect'
import { SIGILIU } from '../../src/content/juridic/pagini'
import { INDEX_JURIDIC } from '../../src/content/juridic/publicare'

/**
 * Paginile juridice ale lui 3s.md (felia juridic-pagini-3s-md), pe COPIA construita si servita cu variabilele
 * aplicatiei 3s.md (`ajutor/copie-3s-md.ts`, profilul `config/profil-3s-md.json`, operatorul-model D2): build-ul
 * real al probelor e cel romanesc, unde paginile EN si RO-MD nu exista.
 *
 * Ce se cere, pe HTML-ul servit (fara JavaScript):
 *   - cele 6 + 6 pagini cu poarta B din `config/juridic-rute.json`: 200, `<html lang>` al editiei, un singur H1;
 *   - hreflang reciproc pe fiecare pereche, cu adresele de pe domeniul profilului si `x-default` = pagina EN;
 *   - marcajul modelului D2 (`config/model-d2.json`) pe informatiile legale, in limba paginii;
 *   - nicio legatura spre documentele cu poarta C, iar adresele lor raspund 404, cu pagina de negasit EN;
 *   - indexurile `/legal` si `/ro/juridic` (felia editie-juridic, ca `/juridic` pe site-ul romanesc): 200, `lang`
 *     al editiei, un H1, cardurile celor 6 documente B ale limbii, firul pe doua niveluri, nicio legatura spre C.
 *
 * Asteptarile se citesc din fisierele de configurare la RULARE, nu se scriu aici. Controlul extragerii de
 * legaturi: pe fiecare pagina, bara laterala trebuie sa duca spre celelalte documente B ale limbii; o extragere
 * care n-ar citi nimic ar pica acolo, nu ar trece tacut la "zero legaturi spre C".
 */

type Document = { en: string; ro: string; poarta: string }
const CONFIG = JSON.parse(readFileSync(join(RADACINA, 'config', 'juridic-rute.json'), 'utf8')) as { documente: Record<string, Document> }
const D2 = JSON.parse(readFileSync(join(RADACINA, 'config', 'model-d2.json'), 'utf8')) as { marcaj: { ro: string; en: string } }
const ORIGINE = mediuProfil3sMd().SITE_URL.replace(/\/+$/, '')

/**
 * Varianta `ro-RO` din lista hreflang a profilului (dupa felia hreflang-doua-domenii lista e comuna 3s.md si 3s.com.ro):
 * romana de la radacina 3s.com.ro, acelasi continut ca /ro de pe 3s.md. Calea ei se scrie aici independent de cod:
 * pagina /ro/... fara prefixul /ro.
 */
const BAZA_RO_RO = (mediuProfil3sMd().SITE_ALTERNATE.split(',').find((v) => v.startsWith('ro-RO=')) ?? '').slice('ro-RO='.length)
const peRoRo = (cale: string) => {
  const rest = cale.replace(/^\/ro(?=\/|$)/, '')
  return BAZA_RO_RO + (rest === '/' ? '' : rest)
}

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
    expect(BAZA_RO_RO, 'controlul: lista profilului are ro-RO').toMatch(/^https:\/\//)
    const asteptate = { en: ORIGINE + d.en, 'ro-MD': ORIGINE + d.ro, 'ro-RO': peRoRo(d.ro), 'x-default': ORIGINE + d.en }
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

for (const cale of CAI_C) {
  test(cale + ': 404, pagina de negasit EN, noindex', async () => {
    const { status, html, robots } = await servit(cale)
    expect(status).toBe(404)
    expect(html).toMatch(/<html[^>]*\blang="en"/)
    expect(robots).toContain('noindex')
  })
}

// ---------------------------------------------------------------------------------------------------------------------
// Editia (felia editie-juridic): aceleasi piese ca documentele /juridic/* ale site-ului romanesc, masurate pe pagina
// randata cu aceleasi numere ca acolo (tests/browser/juridic-comutator.spec.ts, sablonul A): bara de 240 lipita la
// 96, coloana de 864 la 48 de ea, firul la 24 px de h1, cipuri sub 768, sigiliul SHA-256 al textului randat. Firul
// are trei niveluri, ca pe RO: startul editiei, indexul (`/legal`, `/ro/juridic`), documentul.
// ---------------------------------------------------------------------------------------------------------------------

/** Etichetele accesibile ale barei si ale firului, si startul firului, pe limba (textele paginilor). */
const PIESE = {
  en: { bara: 'Legal documents', fir: 'Breadcrumb', start: 'Home', index: 'Legal documents', cale: '/legal', sigiliu: 'Text fingerprint (SHA-256)' },
  ro: { bara: 'Documentele juridice', fir: 'Fir de navigare', start: 'Acasă', index: INDEX_JURIDIC.scurt, cale: '/ro/juridic', sigiliu: SIGILIU.eticheta },
} as const
const SUSPENSIE = String.fromCharCode(0x2026)

async function deschide(page: Page, cale: string, latime: number, inaltime = 900): Promise<number> {
  await page.setViewportSize({ width: latime, height: inaltime })
  const raspuns = await page.goto(copie.baza + cale, { waitUntil: 'networkidle' })
  if (!raspuns || raspuns.status() !== 200) nemasurat('copie ' + cale + ': ' + (raspuns ? raspuns.status() : 'fara raspuns'))
  return page.evaluate(() => window.innerWidth)
}

async function culoareToken(page: Page, token: string): Promise<string> {
  return page.evaluate((t) => {
    const d = document.createElement('div')
    d.style.color = 'var(' + t + ')'
    document.body.appendChild(d)
    const c = getComputedStyle(d).color
    d.remove()
    return c
  }, token)
}

for (const limba of ['en', 'ro'] as const) {
  const p = PAGINI.find((x) => x.limba === limba && x.cheie === 'termeni')
  test('sablonul A la 1440 pe ' + (p?.cale ?? limba) + ': bara de 240 lipita la 96, coloana de 864 la 48, fir cu trei niveluri', async ({ page }) => {
    if (p === undefined) throw new Error('documentul termenilor lipseste din configurare')
    const piese = PIESE[limba]
    const latime = await deschide(page, p.cale, 1440)
    const m = await page.evaluate((et) => {
      const bara = document.querySelector('nav[aria-label="' + et.bara + '"]') as HTMLElement
      const coloana = bara.nextElementSibling as HTMLElement
      const b = bara.getBoundingClientRect()
      const c = coloana.getBoundingClientRect()
      const activ = bara.querySelector('a[aria-current="page"]') as HTMLElement
      const sb = getComputedStyle(activ)
      return {
        bara: { latime: b.width, x: b.left, pozitie: getComputedStyle(bara).position, sus: getComputedStyle(bara).top },
        coloana: { x: c.left, latime: c.width },
        activ: { greutate: sb.fontWeight, fundal: sb.backgroundColor, culoare: sb.color },
        legaturi: bara.querySelectorAll('a').length,
        fir: Array.from(document.querySelectorAll('nav[aria-label="' + et.fir + '"] li')).map((li) => li.textContent?.trim()),
        h1: Array.from(document.querySelectorAll('main h1')).map((h) => h.textContent?.trim()),
      }
    }, piese)
    const pal = await culoareToken(page, '--color-albastru-pal')
    const apasat = await culoareToken(page, '--color-albastru-apasat')
    console.log('[editie-juridic 1440 ' + p.cale + '] innerWidth CITIT ' + latime + ' | ' + JSON.stringify(m))
    expect(latime).toBe(1440)
    expect(Math.abs(m.bara.latime - 240)).toBeLessThanOrEqual(0.5)
    expect(Math.abs(m.coloana.x - (m.bara.x + m.bara.latime) - 48)).toBeLessThanOrEqual(0.5)
    expect(Math.abs(m.coloana.latime - 864)).toBeLessThanOrEqual(1)
    expect([m.bara.pozitie, m.bara.sus]).toEqual(['sticky', '96px'])
    expect(m.legaturi).toBe(B.length)
    expect(m.activ).toEqual({ greutate: '600', fundal: pal, culoare: apasat })
    expect(m.h1).toHaveLength(1)
    expect(m.fir).toEqual([piese.start, piese.index, m.h1[0]])
  })
}

for (const limba of ['en', 'ro'] as const) {
  const piese = PIESE[limba]
  const lang = limba === 'en' ? 'en' : 'ro'
  test(piese.cale + ': indexul, 200, lang ' + lang + ', un H1, cardurile celor 6 documente B, firul pe doua niveluri, nimic activ in bara', async ({ page }) => {
    const { status, html } = await servit(piese.cale)
    expect(status).toBe(200)
    expect(html).toMatch(new RegExp('<html[^>]*\\blang="' + lang + '"'))
    expect(html.match(/<h1\b/g) ?? []).toHaveLength(1)
    expect(legaturiSpreC(html)).toEqual([])
    const latime = await deschide(page, piese.cale, 1440)
    const m = await page.evaluate((et) => {
      const bara = document.querySelector('nav[aria-label="' + et.bara + '"]') as HTMLElement
      return {
        carduri: Array.from(document.querySelectorAll('[data-card-document]')).map((a) => a.getAttribute('href')),
        activ: bara.querySelectorAll('a[aria-current="page"]').length,
        fir: Array.from(document.querySelectorAll('nav[aria-label="' + et.fir + '"] li')).map((li) => li.textContent?.trim()),
      }
    }, piese)
    console.log('[editie-juridic index ' + piese.cale + '] innerWidth CITIT ' + latime + ' | ' + JSON.stringify(m))
    expect(latime).toBe(1440)
    expect(m.carduri).toEqual(B.map(([, d]) => d[limba]))
    expect(m.activ).toBe(0)
    expect(m.fir).toEqual([piese.start, piese.index])
  })
}

for (const latimeCeruta of [1440, 390] as const) {
  test('cele 12 documente la ' + latimeCeruta + ': firul la 24 px (+/- 2) de h1, sigiliul SHA-256 al textului randat, fara derapaj', async ({ page }) => {
    test.setTimeout(240_000)
    const masuri: string[] = []
    for (const p of PAGINI) {
      const piese = PIESE[p.limba]
      const latime = await deschide(page, p.cale, latimeCeruta, latimeCeruta === 390 ? 844 : 900)
      expect(latime, p.cale).toBe(latimeCeruta)
      const m = await page.evaluate((et) => {
        const fir = document.querySelector('nav[aria-label="' + et.fir + '"]') as HTMLElement
        const h1 = document.querySelector('main article h1') as HTMLElement
        const articol = document.querySelector('article[data-document]') as HTMLElement
        const cod = document.querySelector('[data-sigiliu] code') as HTMLElement
        const eticheta = document.querySelector('[data-sigiliu] span') as HTMLElement
        return {
          distanta: h1.getBoundingClientRect().top - fir.getBoundingClientRect().bottom,
          text: articol.textContent ?? '',
          amprenta: cod.getAttribute('data-amprenta') ?? '',
          afisat: cod.textContent ?? '',
          eticheta: eticheta.textContent ?? '',
        }
      }, piese)
      const recalculata = createHash('sha256').update(m.text.replace(/\s+/g, ''), 'utf8').digest('hex')
      const d = await masoaraDerapaj(page, latimeCeruta)
      masuri.push(p.cale + ' fir->h1 ' + m.distanta.toFixed(1) + ' | ' + m.afisat + ' | scrollWidth ' + d.scrollWidth + '/' + d.innerWidth)
      expect(Math.abs(m.distanta - 24), p.cale + ': ' + m.distanta).toBeLessThanOrEqual(2)
      expect(m.text.length, p.cale).toBeGreaterThan(500)
      expect(recalculata, p.cale).toBe(m.amprenta)
      expect(m.afisat, p.cale).toBe(m.amprenta.slice(0, 16) + SUSPENSIE)
      expect(m.eticheta, p.cale).toBe(piese.sigiliu)
      expect(d.scrollWidth, p.cale + ' derapaj: ' + d.vinovati.join(', ')).toBeLessThanOrEqual(d.innerWidth)
    }
    console.log('[editie-juridic ' + latimeCeruta + '] ' + masuri.join(' || '))
  })
}

test('la 390 pe /legal/terms si pe pereche: o coloana, bara devine cipuri pe randuri, deasupra continutului', async ({ page }) => {
  for (const p of PAGINI.filter((x) => x.cheie === 'termeni')) {
    const latime = await deschide(page, p.cale, 390, 844)
    const m = await page.evaluate((et) => {
      const bara = document.querySelector('nav[aria-label="' + et.bara + '"]') as HTMLElement
      const coloana = bara.nextElementSibling as HTMLElement
      const cipuri = Array.from(bara.querySelectorAll('a')) as HTMLElement[]
      return {
        bara: { x: bara.getBoundingClientRect().left, pozitie: getComputedStyle(bara).position, jos: bara.getBoundingClientRect().bottom },
        coloana: { x: coloana.getBoundingClientRect().left, sus: coloana.getBoundingClientRect().top },
        cipuri: cipuri.map((c) => ({ sus: Math.round(c.getBoundingClientRect().top), raza: getComputedStyle(c).borderTopLeftRadius, marime: getComputedStyle(c).fontSize })),
      }
    }, PIESE[p.limba])
    console.log('[editie-juridic 390 ' + p.cale + '] innerWidth CITIT ' + latime + ' | ' + JSON.stringify(m))
    expect(latime).toBe(390)
    expect(m.bara.pozitie).toBe('static')
    expect(Math.abs(m.bara.x - m.coloana.x)).toBeLessThanOrEqual(0.5)
    expect(m.coloana.sus).toBeGreaterThan(m.bara.jos)
    expect(m.cipuri[0].sus).toBe(m.cipuri[1].sus)
    for (const c of m.cipuri) expect([c.raza, c.marime]).toEqual(['9999px', '12px'])
  }
})

test('axe pe cele 12 documente si pe cele doua indexuri: zero incalcari grave', async ({ page }) => {
  test.setTimeout(240_000)
  for (const p of [...PAGINI, { cale: PIESE.en.cale }, { cale: PIESE.ro.cale }]) {
    await deschide(page, p.cale, 1280, 720)
    const a = await masoaraAccesibilitatea(page)
    console.log('[axe ' + p.cale + '] reguli ' + a.reguliRulate + ' | grave ' + a.grave.map((g) => g.regula).join(', ') + ' | usoare ' + a.usoare.map((u) => u.regula).join(', '))
    expect(a.grave.map((g) => g.regula + ' ' + g.tinte.join(' ; ')), 'incalcari ' + IMPACTURI_BLOCANTE.join('/') + ' pe ' + p.cale).toEqual([])
  }
})
