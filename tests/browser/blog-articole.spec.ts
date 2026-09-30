import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { expect, test, type Page } from '@playwright/test'
import { citesteArticolele, type ArticolComplet } from '../../src/content/blog/conducta'
import { CALE_BLOG, caiArticole, caleArticol, caleCategorie, categoriiCuArticole } from '../../src/content/blog/registru'
import { numarArticole } from '../../src/components/blog/format'
import { ARTICOL, CATEGORII, LISTARE } from '../../src/content/blog/texte'
import { masoaraAccesibilitatea, masoaraHtmlBrut, masoaraLegaturiSiImagini } from './ajutor/detectori'
import { PRAG_PARITATE, masoaraParitatea } from './ajutor/geo'
import { asteaptaHidratarea } from './ajutor/hidratare'
import { INCERCARI_NAVIGARE, PAUZA_REINCERCARE_MS, esuateDeTransport, navigheaza, reincarca, stareaMasinii, urmareste } from './ajutor/navigare'
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
    const r = await navigheaza(page, cale, { waitUntil: 'domcontentloaded' })
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
    await navigheaza(page, cale, { waitUntil: 'networkidle' })
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
      await navigheaza(page, cale, { waitUntil: 'networkidle' })
      const m = await masoaraAccesibilitatea(page)
      const l = await latime(page)
      // Tabelele de articol trec prin primitiva `TabelDate`, a carei zona derulabila are, de la livrarea
      // S4-5, rol, nume si `tabindex=0` (`ZonaDerulabila`); exceptia pentru `scrollable-region-focusable`
      // care statea aici pana atunci s-a scos, deci axe trebuie sa dea lista goala intreaga.
      console.log(
        '[blog-articole axe] ' + cale + ' innerWidth ' + l + ' | blocante ' + (m.grave.map((g) => g.regula).join(', ') || '(niciuna)'),
      )
      expect(l).toBe(fereastra.width)
      expect(m.grave.map((g) => g.regula)).toEqual([])
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
  await navigheaza(page, CALE_BLOG, { waitUntil: 'networkidle' })
  await page.getByLabel(LISTARE.etichetaCautare).fill(cerere)
  const carduri = page.locator('[data-card="L"]')
  await expect(carduri.filter({ hasText: (tinta as ArticolComplet).titlu })).toHaveCount(1)
  console.log('[blog-articole cautare] "' + cerere + '" -> ' + (await carduri.count()) + ' carduri | innerWidth ' + (await latime(page)))
})

for (const c of categoriiCuArticole(REALE.map((a) => ({ ...a, data: a.dataPublicarii })))) {
  test('categoria ' + c + ': contorul si cardurile sunt cele din registru', async ({ page }) => {
    const aici = REALE.filter((a) => a.categorie === c)
    const r = await navigheaza(page, caleCategorie(c), { waitUntil: 'domcontentloaded' })
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

// --- Navigarea cu reincercare pe eroarea de transport (`ajutor/navigare.ts`) ---------------------------
//
// CI 36286812854: `page.goto` a cazut cu `net::ERR_NO_BUFFER_SPACE` la axe pe /blog/inchiderea-firmei-si-arhiva
// (1,1 s, fara nicio masuratoare); aceeasi eroare, in 36310864983, pe o proba din comutator (66 ms).
// Mai jos, aceeasi functie pe care o folosesc probele, cu o pagina fabricata care pica exact cum a picat
// runner-ul: cazul care TREBUIE reluat, cel care NU trebuie, si epuizarea. Starea masinii se injecteaza,
// ca proba sa nu cheme `netstat` la fiecare esec fabricat.

/**
 * O pagina fabricata: primele `esecuri` apeluri la `goto` (sau la `reload`, care numara in aceeasi stare) arunca
 * `mesaj`, apoi raspunde. Numara apelurile si pauzele.
 */
function paginaFabricata(esecuri: number, mesaj: string) {
  const stare = { apeluri: 0, pauze: [] as number[] }
  const apel = async () => {
    stare.apeluri++
    if (stare.apeluri <= esecuri) throw new Error(mesaj)
    return null
  }
  return {
    stare,
    goto: apel,
    reload: apel,
    url: () => 'http://127.0.0.1:56744/blog/x',
    waitForTimeout: async (ms: number) => {
      stare.pauze.push(ms)
    },
  }
}

/** Mesajul din jurnalul CI 36286812854, cu adresa lui. */
const MESAJ_CI = [
  'page.goto: net::ERR_NO_BUFFER_SPACE at http://127.0.0.1:56744/blog/inchiderea-firmei-si-arhiva',
  'Call log:',
  '  - navigating to "http://127.0.0.1:56744/blog/inchiderea-firmei-si-arhiva", waiting until "networkidle"',
  '',
].join('\n')

const STARE_DE_PROBA = 'stare de proba'

test('martor POZITIV: o navigare cazuta pe net::ERR_NO_BUFFER_SPACE (mesajul din CI) se reia si reuseste, cu reincercarile si starea masinii in jurnal', async () => {
  const p = paginaFabricata(2, MESAJ_CI)
  const jurnal: string[] = []
  await navigheaza(p, '/blog/x', { waitUntil: 'networkidle' }, (m) => jurnal.push(m), () => STARE_DE_PROBA)
  expect(p.stare.apeluri).toBe(3)
  expect(p.stare.pauze).toEqual([PAUZA_REINCERCARE_MS, 2 * PAUZA_REINCERCARE_MS])
  // Doua incercari cazute, plus starea masinii, scrisa o singura data (la prima).
  expect(jurnal).toHaveLength(3)
  expect(jurnal.filter((m) => m.includes(STARE_DE_PROBA))).toHaveLength(1)
})

test('martor NEGATIV: o eroare care nu e de transport (conexiune refuzata) trece la prima aparitie, fara nicio reincercare', async () => {
  const p = paginaFabricata(5, 'page.goto: net::ERR_CONNECTION_REFUSED at http://127.0.0.1:1/x')
  await expect(navigheaza(p, '/x', undefined, () => {}, () => STARE_DE_PROBA)).rejects.toThrow('ERR_CONNECTION_REFUSED')
  expect(p.stare.apeluri).toBe(1)
})

test('cand toate incercarile cad pe transport, masuratoarea e NEMASURATA: nici picata, nici trecuta', async () => {
  const p = paginaFabricata(INCERCARI_NAVIGARE + 5, MESAJ_CI)
  await expect(navigheaza(p, '/x', undefined, () => {}, () => STARE_DE_PROBA)).rejects.toThrow('NEMASURAT:')
  expect(p.stare.apeluri).toBe(INCERCARI_NAVIGARE)
})

test('urmarirea noteaza cererile esuate ale paginii; anularea de navigare nu intra, iar semnatura de transport se recunoaste', async () => {
  const ascultatori = new Map<string, (arg: unknown) => void>()
  const pagina = { on: (eveniment: string, fn: (arg: unknown) => void) => void ascultatori.set(eveniment, fn) }
  const u = urmareste(pagina as never)
  const cerere = (url: string, text: string) => ({ method: () => 'GET', url: () => url, failure: () => ({ errorText: text }) })
  const cazuta = ascultatori.get('requestfailed')
  expect(cazuta, 'urmarirea asculta cererile esuate').toBeDefined()
  cazuta?.(cerere('http://127.0.0.1:1/a.js', 'net::ERR_ABORTED'))
  cazuta?.(cerere('http://127.0.0.1:1/b.js', 'net::ERR_NO_BUFFER_SPACE'))
  cazuta?.(cerere('http://127.0.0.1:1/c.css', 'net::ERR_CONNECTION_RESET'))
  expect(u.cereriEsuate).toEqual(['GET http://127.0.0.1:1/b.js: net::ERR_NO_BUFFER_SPACE', 'GET http://127.0.0.1:1/c.css: net::ERR_CONNECTION_RESET'])
  expect(esuateDeTransport(u)).toEqual(['GET http://127.0.0.1:1/b.js: net::ERR_NO_BUFFER_SPACE'])
})

test('starea masinii se citeste fara sa arunce: memorie, iar pe Windows socket-uri TCP si porturile dinamice (sau spune ca netsh lipseste)', () => {
  const stare = stareaMasinii()
  console.log('[starea masinii] ' + stare)
  expect(stare).toMatch(/memorie libera \d+ din \d+ MB/)
  if (process.platform === 'win32') {
    expect(stare).toMatch(/socket-uri TCP \{/)
    // `netsh` scrie etichetele in limba sistemului: pe unul localizat citirea nu reuseste, iar starea o spune.
    expect(stare).toMatch(/porturi dinamice \d+ de la \d+|netsh indisponibil/)
  }
})

test('martor POZITIV: o reincarcare cazuta pe net::ERR_NO_BUFFER_SPACE se reia ca navigarea, cu adresa paginii in jurnal', async () => {
  const p = paginaFabricata(1, MESAJ_CI.replace('page.goto', 'page.reload'))
  const jurnal: string[] = []
  await reincarca(p, { waitUntil: 'networkidle' }, (m) => jurnal.push(m), () => STARE_DE_PROBA)
  expect(p.stare.apeluri).toBe(2)
  expect(p.stare.pauze).toEqual([PAUZA_REINCERCARE_MS])
  expect(jurnal.filter((m) => m.includes(p.url()))).toHaveLength(1)
  expect(jurnal.filter((m) => m.includes(STARE_DE_PROBA))).toHaveLength(1)
})

test('martor NEGATIV: o reincarcare cazuta pe alta eroare trece la prima aparitie, fara nicio reincercare', async () => {
  const p = paginaFabricata(5, 'page.reload: net::ERR_CONNECTION_REFUSED at http://127.0.0.1:1/x')
  await expect(reincarca(p, undefined, () => {}, () => STARE_DE_PROBA)).rejects.toThrow('ERR_CONNECTION_REFUSED')
  expect(p.stare.apeluri).toBe(1)
})

test('cand toate reincarcarile cad pe transport, masuratoarea e NEMASURATA, iar mesajul spune ca era o reincarcare', async () => {
  const p = paginaFabricata(INCERCARI_NAVIGARE + 5, MESAJ_CI)
  await expect(reincarca(p, undefined, () => {}, () => STARE_DE_PROBA)).rejects.toThrow(/NEMASURAT:.*reincarcarea paginii http:\/\/127\.0\.0\.1:56744\/blog\/x/)
  expect(p.stare.apeluri).toBe(INCERCARI_NAVIGARE)
})

// --- Poarta pe navigarea bruta din ajutoarele comune (`ajutor/*.ts`) -----------------------------------------
//
// Un `page.goto` brut intr-un ajutor comun expune deodata toate probele care trec prin el (detectorii de HTML
// brut, de terti si cei GEO: sute de probe), pe cand unul dintr-o proba expune una. De aceea poarta cerceteaza
// ajutoarele si probele acestei felii. Probele celorlalte felii au inca apeluri brute: ele raman ale feliilor lor,
// iar mutarea lor pe `navigheaza` e o decizie a dispecerului.

/** Liniile de COD (nu de comentariu) care cheama `.goto(` sau `.reload(` direct. */
function navigariBrute(sursa: string): string[] {
  return sursa
    .split(/\r?\n/)
    .filter((linie) => !/^\s*(\/\/|\/?\*)/.test(linie) && /\.(goto|reload)\(/.test(linie))
    .map((linie) => linie.trim())
}

/** Fixtura asamblata la rulare: o proba care ar purta literal ce vaneaza s-ar prinde pe ea insasi. */
const apel = (obiect: string, nume: string, argumente: string) => obiect + '.' + nume + '(' + argumente + ')'

test('martor POZITIV: poarta prinde un goto brut si un reload brut, cu si fara await', () => {
  const sursa = [
    '  await ' + apel('page', 'goto', "'/x', { waitUntil: 'load' }"),
    '  const r = await ' + apel('pagina', 'reload', ''),
    '  return ' + apel('p', 'goto', 'url'),
  ].join('\n')
  expect(navigariBrute(sursa)).toHaveLength(3)
})

test('martor NEGATIV: poarta lasa in pace navigheaza, reincarca, comentariile si numele fara apel', () => {
  const sursa = [
    "  await navigheaza(page, '/x', { waitUntil: 'load' })",
    '  await reincarca(page)',
    '  // ' + apel('page', 'goto', 'url') + ' ramane brut aici doar ca exemplu',
    '   * ' + apel('pagina', 'reload', ''),
    '  goto: async () => null,',
    "  const mesaj = 'page.goto: net::ERR_NO_BUFFER_SPACE'",
  ].join('\n')
  expect(navigariBrute(sursa)).toEqual([])
})

test('poarta: ajutoarele comune si probele acestei felii navigheaza prin ajutor/navigare.ts, nu cu goto sau reload brut', () => {
  const dir = join(RADACINA, 'tests', 'browser')
  const fisiere = [
    ...readdirSync(join(dir, 'ajutor'))
      .filter((f) => f.endsWith('.ts') && f !== 'navigare.ts')
      .map((f) => 'ajutor/' + f),
    'blog-articole.spec.ts',
    'cinema-1.spec.ts',
  ]
  // Controlul cercetarii: ajutoarele chiar au fost gasite (detectori, geo, fixturi, proiect ...), nu o lista goala.
  expect(fisiere.filter((f) => f.startsWith('ajutor/')).length).toBeGreaterThanOrEqual(5)
  const brute = fisiere.flatMap((f) => navigariBrute(readFileSync(join(dir, f), 'utf8')).map((linie) => f + ': ' + linie))
  console.log('[poarta navigare] cercetate ' + fisiere.length + ' fisiere | apeluri brute ' + brute.length)
  expect(brute, 'foloseste navigheaza() / reincarca() din ajutor/navigare.ts (CI 36286812854, 36310864983)').toEqual([])
})

// --- Asteptarea hidratarii (`ajutor/hidratare.ts`) ------------------------------------------------------------
//
// CI 36688120515, incercarea 1: martorul din `livrare.spec.ts` a scris o legatura in subsol si un element in fir
// imediat dupa `load`, iar hidratarea le-a scos ("primit [], asteptate 2 defecte"). Mai jos: asteptarea pe o
// pagina fabricata (nu se termina cat elementul n-are cheia React, se termina cand o primeste), cazul care
// trebuie sa cada, si controlul pe pagina reala: dupa asteptare, ce se scrie in subsol si in fir ramane.

/** Ce pune React pe un element cand ii termina hidratarea; aici il pune proba, ca sa nu depinda de un build. */
const CHEIE_REACT = '__reactFiber$proba'

test('martor POZITIV: asteptarea hidratarii nu se termina cat elementul n-are cheia React si se termina cand o primeste', async ({ page }) => {
  await page.setContent('<footer>subsol</footer>')
  let iesit = false
  const asteptare = asteaptaHidratarea(page, ['footer']).then(() => {
    iesit = true
  })
  // O asteptare care nu cauta cheia (sau se multumeste ca elementul exista) ar fi iesit in acest timp.
  await page.waitForTimeout(400)
  expect(iesit, 'asteptarea a iesit inainte ca elementul sa primeasca cheia').toBe(false)
  await page.evaluate((cheie) => Object.assign(document.querySelector('footer') as Element, { [cheie]: {} }), CHEIE_REACT)
  await asteptare
  expect(iesit).toBe(true)
})

test('martor NEGATIV: un element care nu se hidrateaza si unul care lipseste fac asteptarea sa cada, cu starea fiecaruia in mesaj', async ({ page }) => {
  await page.setContent('<footer>subsol</footer><nav>fir</nav>')
  await page.evaluate((cheie) => Object.assign(document.querySelector('nav') as Element, { [cheie]: {} }), CHEIE_REACT)
  const eroare = await asteaptaHidratarea(page, ['footer', 'nav', 'aside'], 300).then(
    () => null,
    (e: unknown) => e as Error,
  )
  expect(eroare, 'asteptarea nu trebuia sa reuseasca').not.toBeNull()
  const mesaj = eroare?.message ?? ''
  expect(mesaj).toContain('hidratarea nu a ajuns in 300 ms')
  expect(mesaj).toContain('footer: nehidratat')
  expect(mesaj).toContain('aside: lipseste din pagina')
  expect(mesaj).toContain('nav: hidratat')
})

test('martor NEGATIV: pe pagina reala, dupa asteptare, ce se scrie in subsol si in fir ramane, iar React nu da eroare de hidratare', async ({ page }) => {
  const erori: string[] = []
  page.on('pageerror', (e) => erori.push(String(e.message).slice(0, 160)))
  await navigheaza(page, '/securitate', { waitUntil: 'load' })
  const selectoare = ['footer', 'nav[aria-label="Fir de navigare"]']
  await asteaptaHidratarea(page, selectoare)
  await page.evaluate((sel) => {
    for (const s of sel) {
      const nod = document.createElement('span')
      nod.setAttribute('data-proba-hidratare', s)
      document.querySelector(s)?.appendChild(nod)
    }
  }, selectoare)
  // Fereastra de observare: daca hidratarea ar mai avea ceva de scos din aceste elemente, il scoate aici.
  await page.waitForTimeout(1500)
  const ramase = await page.locator('[data-proba-hidratare]').count()
  const deHidratare = erori.filter((e) => /#4(18|23|25)|hydrat/i.test(e))
  console.log('[hidratare] /securitate innerWidth ' + (await latime(page)) + ' | noduri scrise ' + selectoare.length + ' | ramase ' + ramase + ' | erori de hidratare ' + deHidratare.length)
  expect(ramase).toBe(selectoare.length)
  expect(deHidratare).toEqual([])
})
