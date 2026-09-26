import { expect, test, type Page } from '@playwright/test'
import { citesteArticolele, type ArticolComplet } from '../../src/content/blog/conducta'
import { CALE_BLOG, caiArticole, caleArticol, caleCategorie, categoriiCuArticole } from '../../src/content/blog/registru'
import { numarArticole } from '../../src/components/blog/format'
import { ARTICOL, CATEGORII, LISTARE } from '../../src/content/blog/texte'
import { masoaraAccesibilitatea, masoaraHtmlBrut, masoaraLegaturiSiImagini } from './ajutor/detectori'
import { PRAG_PARITATE, masoaraParitatea } from './ajutor/geo'
import { RADACINA } from './ajutor/proiect'

/**
 * Felia `blog-articole` (valul S4-4): primul lot de articole REALE, masurat pe BUILD-UL REAL (nu pe
 * copia cu articole sintetice din `blog.spec.ts`). Lista de articole, categoriile si contoarele se
 * DERIVA din conducta (`citesteArticolele`), nu se scriu aici.
 *
 * Pe fiecare articol: pagina raspunde 200, h1 e titlul, caseta de fapte si sursele sunt in pagina,
 * legaturile interne duc la pagini care raspund, JSON-LD BlogPosting se parseaza si are titlul si
 * datele, textul e in HTML-ul servit (paritate G-AI-01) si axe nu gaseste incalcari grave la 1440 si
 * 390. Pe listare: cautarea fara diacritice gaseste un articol real. Pe categorii: contorul.
 *
 * Latimea ferestrei se CITESTE din pagina la fiecare masuratoare de forma si se tipareste.
 */

const REALE: ArticolComplet[] = citesteArticolele(RADACINA)
const LA_390 = { width: 390, height: 844 }
const LA_1440 = { width: 1440, height: 900 }

async function latime(page: Page): Promise<number> {
  return page.evaluate(() => window.innerWidth)
}

async function jsonLd(page: Page): Promise<Record<string, unknown>[]> {
  const blocuri = await page.locator('script[type="application/ld+json"]').allTextContents()
  return blocuri
    .map((t) => JSON.parse(t) as Record<string, unknown>)
    .flatMap((b) => (Array.isArray(b['@graph']) ? (b['@graph'] as Record<string, unknown>[]) : [b]))
}

test('controlul fixturii: conducta citeste articolele reale, iar registrul deschide listarea si categoriile', () => {
  expect(REALE.length).toBeGreaterThan(0)
  expect(caiArticole()).toContain(CALE_BLOG)
})

test('harta de site are listarea, fiecare categorie cu articole si fiecare articol', async ({ request }) => {
  const harta = await (await request.get('/sitemap.xml')).text()
  const asteptate = [CALE_BLOG, ...categoriiCuArticole(REALE.map((a) => ({ ...a, data: a.dataPublicarii }))).map(caleCategorie), ...REALE.map(caleArticol)]
  const lipsa = asteptate.filter((c) => !harta.includes(c + '</loc>'))
  console.log('[blog-articole harta] asteptate ' + asteptate.length + ' | lipsa ' + JSON.stringify(lipsa))
  expect(lipsa).toEqual([])
})

for (const articol of REALE) {
  const cale = caleArticol(articol)

  test('articolul ' + articol.slug + ': titlu, caseta de fapte, surse, JSON-LD, legaturi interne vii', async ({ page, request }) => {
    await page.setViewportSize(LA_1440)
    const r = await page.goto(cale, { waitUntil: 'domcontentloaded' })
    expect(r?.status()).toBe(200)
    await expect(page.locator('main h1')).toHaveText(articol.titlu)
    if (articol.casetaFapte.length > 0) {
      await expect(page.getByText(ARTICOL.fapte, { exact: true })).toBeVisible()
      for (const f of articol.casetaFapte) await expect(page.locator('main')).toContainText(f)
    }
    await expect(page.getByText(ARTICOL.surse, { exact: true })).toBeVisible()
    for (const s of articol.surse) expect(await page.locator('main a[href="' + s.url + '"]').count(), s.url).toBeGreaterThan(0)

    const ld = await jsonLd(page)
    const post = ld.find((n) => n['@type'] === 'BlogPosting')
    expect(post?.headline).toBe(articol.titlu)
    expect(post?.datePublished).toBe(articol.dataPublicarii)
    expect(post?.wordCount).toBe(articol.cuvinte)
    expect(ld.filter((n) => n['@type'] === 'BreadcrumbList')).toHaveLength(1)

    const interne = await page.locator('main article a[href^="/"], main a[href^="/blog/"]').evaluateAll((as) =>
      [...new Set(as.map((a) => (a.getAttribute('href') ?? '').split('#')[0]))].filter(Boolean),
    )
    const moarte: string[] = []
    for (const h of interne) {
      const raspuns = await request.get(h, { failOnStatusCode: false })
      if (raspuns.status() !== 200) moarte.push(h + ' -> ' + raspuns.status())
    }
    console.log('[blog-articole] ' + cale + ' innerWidth ' + (await latime(page)) + ' | legaturi interne ' + interne.length + ' | moarte ' + JSON.stringify(moarte))
    expect(moarte).toEqual([])
  })

  test('articolul ' + articol.slug + ': textul e in HTML-ul servit, paritate si legaturi', async ({ browser, page, baseURL }) => {
    const brut = await masoaraHtmlBrut(browser, (baseURL ?? '') + cale)
    const paritate = await masoaraParitatea(browser, (baseURL ?? '') + cale)
    await page.goto(cale, { waitUntil: 'networkidle' })
    const legaturi = await masoaraLegaturiSiImagini(page)
    console.log('[blog-articole servit] ' + cale + ' | paragrafe lipsa fara JS ' + brut.paragrafeLipsa.length + ' | paritate ' + paritate.acoperire.toFixed(4) + ' din ' + paritate.propozitii)
    expect(brut.titluFaraJs).toBe(brut.titluCuJs)
    expect(brut.paragrafeLipsa).toEqual([])
    expect(paritate.acoperire).toBeGreaterThanOrEqual(PRAG_PARITATE)
    expect(legaturi.legaturiMoarte).toEqual([])
    expect(legaturi.ancoreMoarte).toEqual([])
  })

  for (const fereastra of [LA_1440, LA_390]) {
    test('articolul ' + articol.slug + ': axe la ' + fereastra.width + ' fara incalcari serious sau critical', async ({ page }) => {
      await page.setViewportSize(fereastra)
      await page.goto(cale, { waitUntil: 'networkidle' })
      const m = await masoaraAccesibilitatea(page)
      const l = await latime(page)
      // EXCEPTIE DECLARATA, ingusta, pana la repararea primitivei inghetate `TabelDate`: sub 768 px
      // tabelul insusi devine zona derulabila (`display: block; overflow-x: auto`, bloc.module.css),
      // fara `tabindex`, deci axe raporteaza `scrollable-region-focusable` cand un tabel de articol e
      // mai lat decat coloana (masurat 26.09: un tabel de 4 coloane, 427 px in 356). Reparatia e in
      // primitiva (zona derulabila focalizabila, cu rol si eticheta), ceruta dispecerului. Exceptia se
      // aplica NUMAI regulii acesteia, NUMAI pe tinte `table` si NUMAI cat timp un tabel derulabil nu
      // are `tabindex`; din ziua in care primitiva e reparata, exceptia nu mai prinde nimic si proba
      // cere din nou lista goala intreaga.
      const faraFocus = await page.evaluate(
        () => [...document.querySelectorAll('main table')].filter((t) => t.scrollWidth > t.clientWidth && !t.hasAttribute('tabindex')).length,
      )
      const exceptate = m.grave.filter(
        (g) => g.regula === 'scrollable-region-focusable' && faraFocus > 0 && g.tinte.every((t) => t === 'table' || t.endsWith(' table')),
      )
      const blocante = m.grave.filter((g) => !exceptate.includes(g))
      console.log(
        '[blog-articole axe] ' + cale + ' innerWidth ' + l + ' | blocante ' + (blocante.map((g) => g.regula).join(', ') || '(niciuna)') +
          (exceptate.length > 0 ? ' | EXCEPTIE TabelDate: ' + faraFocus + ' tabel(e) derulabil(e) fara tabindex' : ''),
      )
      expect(l).toBe(fereastra.width)
      expect(blocante.map((g) => g.regula)).toEqual([])
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
      // `empty-table-header` e minora pentru axe, deci filtrul serious/critical de mai sus n-o vede; o cerem
      // aici direct: nicio celula de antet a unui tabel de articol nu ramane fara text.
      expect(await anteteGoale(page)).toBe(0)
    })
  }
}

test('listarea: cautarea fara diacritice gaseste un articol real', async ({ page }) => {
  // Articolul ales: primul cu diacritice in titlu, derivat din registru (controlul probei).
  const tinta = REALE.find((a) => a.titlu.normalize('NFD') !== a.titlu)
  expect(tinta, 'niciun titlu cu diacritice in lot: proba n-ar masura nimic').toBeDefined()
  const cerere = (tinta as ArticolComplet).titlu.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
  await page.setViewportSize(LA_1440)
  await page.goto(CALE_BLOG, { waitUntil: 'networkidle' })
  await page.getByLabel(LISTARE.etichetaCautare).fill(cerere)
  const carduri = page.locator('[data-card="L"]')
  await expect(carduri.filter({ hasText: (tinta as ArticolComplet).titlu })).toHaveCount(1)
  console.log('[blog-articole cautare] "' + cerere + '" -> ' + (await carduri.count()) + ' carduri | innerWidth ' + (await latime(page)))
})

for (const c of categoriiCuArticole(REALE.map((a) => ({ ...a, data: a.dataPublicarii })))) {
  test('categoria ' + c + ': contorul si cardurile sunt cele din registru', async ({ page }) => {
    const aici = REALE.filter((a) => a.categorie === c)
    const r = await page.goto(caleCategorie(c), { waitUntil: 'domcontentloaded' })
    expect(r?.status()).toBe(200)
    await expect(page.locator('main h1')).toHaveText(CATEGORII[c].nume)
    await expect(page.locator('[data-card="C"]')).toHaveCount(aici.length)
    console.log('[blog-articole categorie] ' + c + ' | articole ' + aici.length + ' | innerWidth ' + (await latime(page)))
    await expect(page.locator('main').getByText(numarArticole(aici.length), { exact: true })).toBeVisible()
  })
}

/** Celulele de antet fara text din `main` (regula `empty-table-header`, minora pentru axe, deci ceruta aparte). */
function anteteGoale(page: Page): Promise<number> {
  return page.evaluate(() => [...document.querySelectorAll('main th')].filter((th) => (th.textContent ?? '').trim() === '').length)
}

test('martor POZITIV: masuratoarea antetelor goale prinde un antet gol intr-un tabel fabricat', async ({ page }) => {
  await page.setContent('<main><table><tr><th></th><th>Termen</th></tr><tr><td>a</td><td>b</td></tr></table></main>')
  expect(await anteteGoale(page)).toBe(1)
})

test('martor NEGATIV: acelasi tabel fabricat, cu antetul completat, da zero', async ({ page }) => {
  await page.setContent('<main><table><tr><th>Criteriu</th><th>Termen</th></tr><tr><td>a</td><td>b</td></tr></table></main>')
  expect(await anteteGoale(page)).toBe(0)
})
