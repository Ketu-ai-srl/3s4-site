import { spawnSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { expect, test, type APIRequestContext, type Browser, type Page } from '@playwright/test'
import { AUTORITATI } from '../../src/content/juridic/autoritati'
import { CHEI_ART13 } from '../../src/content/juridic/confidentialitate'
import { CHEI_L284 } from '../../src/content/juridic/cookie-uri'
import { FURNIZORI, furnizoriCategorie } from '../../src/content/juridic/furnizori'
import { SIGILIU } from '../../src/content/juridic/pagini'
import { CALE_JURIDIC, DOCUMENTE_JURIDICE, SLUGURI_JURIDICE, caleDocument } from '../../src/content/juridic/publicare'
import { OPERATOR_SINTETIC, pornesteCopiaOperator, type CopieOperator } from './ajutor/copie-operator'
import { IMPACTURI_BLOCANTE, masoaraAccesibilitatea, masoaraDerapaj } from './ajutor/detectori'
import { PRAG_PARITATE, masoaraParitatea, masoaraRaspunsul, normalizeaza, type DeclaratieRaspuns } from './ajutor/geo'
import { RADACINA, nemasurat } from './ajutor/proiect'

/**
 * Proba COMUTATORULUI feliei `juridic` (plan §10): aceleasi surse, construite intr-o copie cu
 * operatorul de date SINTETIC din `ajutor/copie-operator.ts` (build-ul real are `operator: null`, deci
 * paginile juridice nu exista acolo; vezi juridic.spec.ts). Pe copie cele opt pagini trebuie sa:
 *
 *   1. intre in RUTE: raspund 200, sunt in harta XML, in harta site-ului si in subsol (sase dintre
 *      ele, cate numeste coloana Juridic), iar o cale necunoscuta sub /juridic ramane 404;
 *   2. treaca portile GDPR ale feliei (cercetarea gdpr-moldova §8; docs/gdpr/acoperire.md):
 *      G-MD-01 si G-MD-08 in pagina (atributele `data-art13` si `data-l284`), G-MD-09 / L-10,
 *      G-MD-10 (autoritatile despartite pe jurisdictie), G-MD-11 (tara fiecarui furnizor),
 *      G-MD-12 (gazdele incarcate = destinatarii declarati), G-MD-14 (termenele de raspuns),
 *      G-MD-18 (nicio atestare nedovedita);
 *   3. treaca POARTA JURIDICA reala (`poarta-juridic.py`: L-09, L-10, L-15, C-01), rulata pe un arbore
 *      facut din sursa si din HTML-ul servit de copie, cu martor pozitiv (o pagina scoasa TREBUIE
 *      prinsa de L-15) si martor negativ (pusa la loc, cererea dispare);
 *   4. poarte sigiliul SHA-256 al textului randat, recalculat aici din pagina;
 *   5. aiba forma sablonului A la 1440 si la 390 (juridic__sablon.md: grila 240 + 864, bara lipita la
 *      96, cipuri sub 768, fir cu trei niveluri), zero incalcari axe grave, niciun derapaj la 390;
 *   6. treaca G-AI-01 si G-AI-02 cu declaratiile din `config/seo/juridic.json`,
 *      `raspuns_autonom_cu_operator` (se muta in `raspuns_autonom` in ziua operatorului);
 *   7. tina bugetele de la 390 cu procesorul incetinit de 4 ori, pe documentul cel mai lung.
 *
 * Martorii NEGATIVI ai comutatorului (operator null = nimic din toate astea) sunt in juridic.spec.ts,
 * pe build-ul real, si in tests/juridic.test.ts, pe module.
 */

const CAI = [CALE_JURIDIC, ...SLUGURI_JURIDICE.map(caleDocument)]
const DOCUMENTE = SLUGURI_JURIDICE.map(caleDocument)
/** Legaturile juridice din coloana Juridic a subsolului (navigatie.ts): sase documente. */
const IN_SUBSOL = (['informatii-legale', 'confidentialitate', 'termeni', 'cookies', 'politici-publice', 'licenta-software'] as const).map(caleDocument)

/** Tiparele portilor, asamblate la rulare ca proba sa nu fie ea insasi o instanta a defectului. */
const TIPAR_L10 = new RegExp('\\bnum' + '[ae]r\\w*\\b.{0,120}?\\boperator')
const TIPARE_SOL = [new RegExp('consumers' + '/' + 'odr'), new RegExp('\\bsolutionarea\\s+online\\s+a\\s+' + 'litigiilor\\b')]
const INTERZISE_G_MD_18 = ['conform ' + 'gdpr', 'certificat ' + 'gdpr', 'privacy ' + 'shield', 'nivel ' + 'adecvat']
const LINIUTE_LUNGI = new RegExp('[' + String.fromCharCode(0x2013) + String.fromCharCode(0x2014) + ']')
const SUSPENSIE = String.fromCharCode(0x2026)
const TIPAR_GOOGLE = /(^|\.)(google[a-z-]*|gstatic|doubleclick)\./

let copie: CopieOperator

test.beforeAll(async () => {
  // Build-ul copiei: ~1 min pe statia libera; plafonul acopera o masina incarcata.
  test.setTimeout(300_000)
  copie = await pornesteCopiaOperator()
})

test.afterAll(async () => {
  await copie?.opreste()
})

async function deschide(page: Page, cale: string, latime: number, inaltime = 900): Promise<number> {
  await page.setViewportSize({ width: latime, height: inaltime })
  const raspuns = await page.goto(copie.baza + cale, { waitUntil: 'networkidle' })
  if (!raspuns || raspuns.status() !== 200) nemasurat('copie ' + cale + ': ' + (raspuns ? raspuns.status() : 'fara raspuns'))
  return page.evaluate(() => window.innerWidth)
}

async function textPagina(page: Page, cale: string): Promise<string> {
  await deschide(page, cale, 1440)
  return page.evaluate(() => (document.querySelector('main') as HTMLElement).innerText)
}

// ---------------------------------------------------------------------------------------------
// 1. Paginile intra in RUTE
// ---------------------------------------------------------------------------------------------

test('copie: cele opt pagini raspund 200, sunt in harta XML si in harta site-ului; o cale necunoscuta ramane 404', async ({ request }) => {
  const stari: string[] = []
  for (const cale of CAI) {
    const r = await request.get(copie.baza + cale)
    stari.push(cale + ' ' + r.status())
    expect(r.status(), cale).toBe(200)
  }
  for (const cale of [CALE_JURIDIC + '/nu-exista', caleDocument('termeni') + '/in-plus']) {
    const r = await request.get(copie.baza + cale, { maxRedirects: 0 })
    stari.push(cale + ' ' + r.status())
    expect(r.status(), cale).toBe(404)
  }
  const xml = await (await request.get(copie.baza + '/sitemap.xml')).text()
  const inXml = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname)
  const harta = await (await request.get(copie.baza + '/harta-site')).text()
  const inHarta = [...harta.slice(harta.indexOf('data-harta-grupe')).matchAll(/<a[^>]*href="([^"]+)"/g)].map((m) => m[1])
  console.log('[copie] ' + stari.join(' | ') + ' | harta XML: ' + inXml.join(', '))
  for (const cale of CAI) {
    expect(inXml, 'harta XML: ' + cale).toContain(cale)
    expect(inHarta, 'harta site-ului: ' + cale).toContain(cale)
  }
})

test('copie: subsolul numeste cele sase documente din coloana Juridic, ca legaturi active', async ({ page }) => {
  const latime = await deschide(page, '/', 1440)
  const gasite = await page.locator('footer a[href^="' + CALE_JURIDIC + '"]').evaluateAll((a) => a.map((x) => x.getAttribute('href')))
  console.log('[copie subsol] innerWidth CITIT ' + latime + ' | ' + gasite.join(', '))
  expect([...gasite].sort()).toEqual([...IN_SUBSOL].sort())
})

// ---------------------------------------------------------------------------------------------
// 2. Portile G-MD, pe paginile servite de copie
// ---------------------------------------------------------------------------------------------

test('G-MD-01: politica de confidentialitate are cele 12 sectiuni data-art13, in ordine, fiecare cu text', async ({ page }) => {
  await deschide(page, caleDocument('confidentialitate'), 1440)
  const sectiuni = await page.locator('[data-art13]').evaluateAll((s) =>
    s.map((x) => ({ cheie: x.getAttribute('data-art13'), text: (x as HTMLElement).innerText.trim().length })),
  )
  console.log('[G-MD-01] ' + sectiuni.map((s) => s.cheie + ':' + s.text).join(' '))
  expect(sectiuni.map((s) => s.cheie)).toEqual([...CHEI_ART13])
  for (const s of sectiuni) expect(s.text, 'sectiunea ' + s.cheie).toBeGreaterThan(40)
})

test('G-MD-08: politica de cookie-uri are cele 8 sectiuni data-l284, fiecare cu text', async ({ page }) => {
  await deschide(page, caleDocument('cookies'), 1440)
  const sectiuni = await page.locator('[data-l284]').evaluateAll((s) =>
    s.map((x) => ({ cheie: x.getAttribute('data-l284'), text: (x as HTMLElement).innerText.trim().length })),
  )
  console.log('[G-MD-08] ' + sectiuni.map((s) => s.cheie + ':' + s.text).join(' '))
  expect(sectiuni.map((s) => s.cheie).sort()).toEqual([...CHEI_L284].sort())
  for (const s of sectiuni) expect(s.text, 'sectiunea ' + s.cheie).toBeGreaterThan(40)
})

test('G-MD-09 / L-10, L-09 si G-MD-18 pe cele opt pagini: nimic din ce vaneaza portile, doar cratima', async ({ page }) => {
  for (const cale of CAI) {
    const text = await textPagina(page, cale)
    const n = normalizeaza(text)
    expect(TIPAR_L10.test(n), cale + ': numar langa operator').toBe(false)
    for (const t of TIPARE_SOL) expect(t.test(n), cale + ': ' + t).toBe(false)
    for (const f of INTERZISE_G_MD_18) expect(n, cale).not.toContain(f)
    expect(/adecvar.{0,200}moldova|moldova.{0,200}adecvar/.test(n), cale + ': adecvare langa Moldova').toBe(false)
    expect(LINIUTE_LUNGI.test(text), cale + ': liniuta lunga').toBe(false)
  }
  // Martorul: aceleasi tipare prind fraza pe care o vaneaza.
  expect(TIPAR_L10.test(normalizeaza('Num' + 'ărul de înregistrare ca operator: 1'))).toBe(true)
})

test('G-MD-10: fiecare autoritate sta numai in blocul jurisdictiei ei', async ({ page }) => {
  for (const cale of [caleDocument('confidentialitate'), caleDocument('informatii-legale')]) {
    await deschide(page, cale, 1440)
    const blocuri = await page.locator('[data-jurisdictie]').evaluateAll((b) =>
      b.map((x) => ({ j: x.getAttribute('data-jurisdictie'), text: (x as HTMLElement).innerText })),
    )
    const ro = blocuri.filter((b) => b.j === 'ro').map((b) => b.text).join(' ')
    const md = blocuri.filter((b) => b.j === 'md').map((b) => b.text).join(' ')
    console.log('[G-MD-10 ' + cale + '] blocuri ro ' + blocuri.filter((b) => b.j === 'ro').length + ', md ' + blocuri.filter((b) => b.j === 'md').length)
    expect(ro, cale).toContain(AUTORITATI.ro.sigla)
    expect(md, cale).toContain(AUTORITATI.md.sigla)
    expect(ro, cale).not.toContain(AUTORITATI.md.sigla)
    expect(md, cale).not.toContain(AUTORITATI.ro.sigla)
  }
})

test('G-MD-11 si G-MD-14: fiecare furnizor cu tara lui; termenele de raspuns si adresa pentru cereri', async ({ page }) => {
  const text = await textPagina(page, caleDocument('confidentialitate'))
  for (const f of FURNIZORI) {
    expect(text, f.cheie).toContain(f.destinatar)
    expect(text, f.cheie).toContain(f.tara)
  }
  const n = normalizeaza(text)
  expect(n).toContain('o luna')
  expect(n).toContain('doua luni')
  expect(text).toContain(OPERATOR_SINTETIC.email)
})

test('G-MD-12: fara acord nicio gazda straina pe cele opt pagini; dupa accept, numai gazdele furnizorului declarat', async ({ browser }) => {
  const gazdaProprie = new URL(copie.baza).host
  const context = await browser.newContext()
  const straine: string[] = []
  await context.route('**/*', (ruta) => {
    const gazda = new URL(ruta.request().url()).host
    if (gazda !== '' && gazda !== gazdaProprie) {
      straine.push(gazda)
      return ruta.abort('blockedbyclient')
    }
    return ruta.continue()
  })
  const pagina = await context.newPage()
  try {
    for (const cale of CAI) {
      await pagina.goto(copie.baza + cale, { waitUntil: 'networkidle' })
      expect(straine, 'gazde straine inainte de acord pe ' + cale).toEqual([])
    }
    // Controlul: bannerul exista si acceptul chiar porneste masurarea, deci zeroul de mai sus nu e orb.
    await pagina.goto(copie.baza + caleDocument('cookies'), { waitUntil: 'networkidle' })
    await pagina.locator('[data-consimtamant] [data-accept]').click()
    await expect.poll(() => straine.length, { timeout: 10_000 }).toBeGreaterThan(0)
    await pagina.waitForTimeout(1500)
    const politica = await pagina.evaluate(() => (document.querySelector('main') as HTMLElement).innerText)
    console.log('[G-MD-12] gazde dupa accept: ' + [...new Set(straine)].join(', '))
    for (const g of straine) expect(TIPAR_GOOGLE.test(g), 'gazda nedeclarata: ' + g).toBe(true)
    // Gazdele de mai sus sunt ale furnizorului de statistica, iar politica il numeste.
    const statistica = furnizoriCategorie('statistica')
    expect(statistica.length).toBeGreaterThan(0)
    for (const f of statistica) expect(politica, f.cheie).toContain(f.destinatar)
  } finally {
    await context.close()
  }
})

// ---------------------------------------------------------------------------------------------
// 3. Poarta juridica reala, pe un arbore facut din copie
// ---------------------------------------------------------------------------------------------

/** Fisierul in care `next build` scrie pagina statica a unei cai (`/juridic/x` -> `juridic/x.html`). */
function fisierHtml(cale: string): string {
  return cale === '/' ? 'index.html' : cale.slice(1) + '.html'
}

function poartaJuridica(radacina: string): { cod: number | null; iesire: string } {
  const r = spawnSync('python', [join(RADACINA, '.claude', 'scripts', 'porti', 'poarta-juridic.py'), '--radacina', radacina, '--mediu', 'staging'], {
    encoding: 'utf8',
    env: { ...process.env, PYTHONIOENCODING: 'utf-8' },
  })
  if (r.error) nemasurat('poarta juridica nu a pornit: ' + String(r.error))
  return { cod: r.status, iesire: (r.stdout ?? '') + (r.stderr ?? '') }
}

/** Arborele pe care ruleaza poarta: facut o data, folosit de cele trei probe de mai jos, sters la final. */
let arbore: string | null = null
const CALE_TERMENI_HTML = ['.next', 'server', 'app', 'juridic', 'termeni.html']

async function arboreDinCopie(request: APIRequestContext): Promise<string> {
  if (arbore !== null) return arbore
  const radacina = mkdtempSync(join(tmpdir(), 'juridic-poarta-'))
  // Sursa reala, configurarea cu operatorul copiei, apoi HTML-ul SERVIT de copie, scris DUPA sursa
  // (poarta refuza un build mai vechi decat sursa).
  for (const d of ['src', 'public', 'config']) cpSync(join(RADACINA, d), join(radacina, d), { recursive: true })
  const caleOperator = join(radacina, 'config', 'operator.json')
  const cfg = JSON.parse(readFileSync(caleOperator, 'utf8')) as Record<string, unknown>
  writeFileSync(caleOperator, JSON.stringify({ ...cfg, operator: OPERATOR_SINTETIC }, null, 2) + '\n', 'utf8')
  for (const cale of ['/', ...CAI, '/harta-site', '/accesibilitate']) {
    const r = await request.get(copie.baza + cale)
    expect(r.status(), cale).toBe(200)
    const tinta = join(radacina, '.next', 'server', 'app', ...fisierHtml(cale).split('/'))
    mkdirSync(dirname(tinta), { recursive: true })
    writeFileSync(tinta, await r.text(), 'utf8')
  }
  arbore = radacina
  return radacina
}

test.afterAll(() => {
  if (arbore !== null) rmSync(arbore, { recursive: true, force: true })
})

test('L-15, L-09, L-10 si C-01: poarta-juridic.py trece pe arborele copiei', async ({ request }) => {
  test.setTimeout(120_000)
  const curat = poartaJuridica(await arboreDinCopie(request))
  console.log('[poarta juridica pe copie] iesire ' + curat.cod + '\n' + curat.iesire.trim())
  expect(curat.cod, curat.iesire).toBe(0)
  expect(curat.iesire).toContain('L-15: se aplica')
  expect(curat.iesire).not.toMatch(/^(OPRESTE|AVERT)\s+(L-15|L-09|L-10|C-01)\b/m)
})

test('martor POZITIV: fara pagina termenilor, aceeasi poarta pe acelasi arbore TREBUIE s-o ceara (L-15)', async ({ request }) => {
  test.setTimeout(120_000)
  const radacina = await arboreDinCopie(request)
  const pagina = join(radacina, ...CALE_TERMENI_HTML)
  const html = readFileSync(pagina, 'utf8')
  rmSync(pagina)
  try {
    const fara = poartaJuridica(radacina)
    console.log('[poarta juridica, martor pozitiv] iesire ' + fara.cod + ' | ' + (fara.iesire.match(/^.*L-15.*$/gm) ?? []).join(' || '))
    expect(fara.iesire).toMatch(/^AVERT\s+L-15\s+lipseste ruta juridica \/termeni /m)
  } finally {
    writeFileSync(pagina, html, 'utf8')
  }
})

test('martor NEGATIV: cu pagina termenilor pusa la loc, aceeasi poarta NU mai cere nimic (L-15)', async ({ request }) => {
  test.setTimeout(120_000)
  // Cererea din martorul pozitiv vine din pagina scoasa, nu din restul arborelui: pusa la loc, dispare.
  const radacina = await arboreDinCopie(request)
  expect(readFileSync(join(radacina, ...CALE_TERMENI_HTML), 'utf8').length, 'pagina termenilor e la loc').toBeGreaterThan(1000)
  const cu = poartaJuridica(radacina)
  console.log('[poarta juridica, martor negativ] iesire ' + cu.cod + ' | L-15: ' + ((cu.iesire.match(/^(OPRESTE|AVERT)\s+L-15.*$/gm) ?? []).join(' || ') || '(nimic)'))
  expect(cu.cod, cu.iesire).toBe(0)
  expect(cu.iesire).not.toMatch(/^(OPRESTE|AVERT)\s+L-15\b/m)
})

// ---------------------------------------------------------------------------------------------
// 4. Sigiliul SHA-256
// ---------------------------------------------------------------------------------------------

test('sigiliul: amprenta SHA-256 a textului randat, recalculata din pagina, pe fiecare document', async ({ page }) => {
  for (const cale of DOCUMENTE) {
    await deschide(page, cale, 1440)
    const m = await page.evaluate(() => {
      const articol = document.querySelector('article[data-document]') as HTMLElement
      const cod = document.querySelector('[data-sigiliu] code') as HTMLElement
      const eticheta = document.querySelector('[data-sigiliu] span') as HTMLElement
      return {
        text: articol.textContent ?? '',
        amprenta: cod.getAttribute('data-amprenta') ?? '',
        titlu: cod.getAttribute('title') ?? '',
        afisat: cod.textContent ?? '',
        eticheta: eticheta.textContent ?? '',
        explicatie: eticheta.getAttribute('title') ?? '',
        font: getComputedStyle(cod).fontFamily,
      }
    })
    const recalculata = createHash('sha256').update(m.text.replace(/\s+/g, ''), 'utf8').digest('hex')
    console.log('[sigiliu ' + cale + '] ' + m.afisat + ' | recalculat ' + recalculata.slice(0, 16) + ' | text ' + m.text.length + ' caractere')
    expect(m.text.length, cale).toBeGreaterThan(500)
    expect(recalculata, cale).toBe(m.amprenta)
    expect(m.titlu).toBe(m.amprenta)
    expect(m.afisat).toBe(m.amprenta.slice(0, 16) + SUSPENSIE)
    expect(m.eticheta).toBe(SIGILIU.eticheta)
    expect(m.explicatie).toBe(SIGILIU.explicatie)
    expect(m.font).toMatch(/mono/i)
  }
})

// ---------------------------------------------------------------------------------------------
// 5. Forma sablonului A
// ---------------------------------------------------------------------------------------------

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

test('sablonul A la 1440: bara de 240 lipita la 96, coloana de 864 la 48 de ea, fir cu trei niveluri', async ({ page }) => {
  const latime = await deschide(page, caleDocument('termeni'), 1440)
  const m = await page.evaluate(() => {
    const bara = document.querySelector('nav[aria-label="Documentele juridice"]') as HTMLElement
    const coloana = bara.nextElementSibling as HTMLElement
    const b = bara.getBoundingClientRect()
    const c = coloana.getBoundingClientRect()
    const activ = bara.querySelector('a[aria-current="page"]') as HTMLElement
    const sb = getComputedStyle(activ)
    const versiune = document.querySelector('article time') as HTMLElement
    return {
      bara: { x: b.left, latime: b.width, pozitie: getComputedStyle(bara).position, sus: getComputedStyle(bara).top },
      coloana: { x: c.left, latime: c.width },
      activ: { text: activ.textContent, greutate: sb.fontWeight, fundal: sb.backgroundColor, culoare: sb.color },
      legaturi: bara.querySelectorAll('a').length,
      fir: Array.from(document.querySelectorAll('nav[aria-label="Fir de navigare"] li')).map((li) => li.textContent?.trim()),
      h1: document.querySelectorAll('main h1').length,
      versiune: { data: versiune.getAttribute('datetime'), marime: getComputedStyle(versiune.parentElement as HTMLElement).fontSize },
    }
  })
  const pal = await culoareToken(page, '--color-albastru-pal')
  const apasat = await culoareToken(page, '--color-albastru-apasat')
  await page.evaluate(() => window.scrollTo(0, 1500))
  await page.waitForTimeout(300)
  const susDupaDerulare = await page.evaluate(() => (document.querySelector('nav[aria-label="Documentele juridice"]') as HTMLElement).getBoundingClientRect().top)
  console.log('[sablon A 1440] innerWidth CITIT ' + latime + ' | ' + JSON.stringify(m) + ' | bara dupa 1500 px: ' + susDupaDerulare)
  expect(latime).toBe(1440)
  expect(Math.abs(m.bara.latime - 240)).toBeLessThanOrEqual(0.5)
  expect(Math.abs(m.coloana.x - (m.bara.x + m.bara.latime) - 48)).toBeLessThanOrEqual(0.5)
  expect(Math.abs(m.coloana.latime - 864)).toBeLessThanOrEqual(1)
  expect([m.bara.pozitie, m.bara.sus]).toEqual(['sticky', '96px'])
  expect(Math.abs(susDupaDerulare - 96)).toBeLessThanOrEqual(1)
  expect(m.legaturi).toBe(DOCUMENTE_JURIDICE.length)
  expect(m.activ).toEqual({ text: 'Termeni și condiții', greutate: '600', fundal: pal, culoare: apasat })
  expect(m.fir).toEqual(['Acasă', 'Documente juridice', 'Termeni și condiții'])
  expect(m.h1).toBe(1)
  expect(m.versiune.data).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  expect(m.versiune.marime).toBe('14px')
})

/**
 * Firul de pagina -> h1 pe documente: 24 px (juridic__sablon.md §3). Regula pusa pe clasa trecuta
 * primitivei pierdea in cascada in fata lui `.fir { margin: 0 }` si distanta iesea 0 (masurat de
 * critic, 25.09.2026); de aceea se masoara pe fiecare document, la ambele latimi.
 */
for (const latimeCeruta of [1440, 390] as const) {
  test('documentele la ' + latimeCeruta + ': de la firul de pagina la h1 sunt 24 px (+/- 2)', async ({ page }, info) => {
    const masuri: string[] = []
    for (const cale of DOCUMENTE) {
      const latime = await deschide(page, cale, latimeCeruta, latimeCeruta === 390 ? 844 : 900)
      expect(latime, cale).toBe(latimeCeruta)
      const m = await page.evaluate(() => {
        const fir = document.querySelector('nav[aria-label="Fir de navigare"]') as HTMLElement
        const h1 = document.querySelector('main article h1') as HTMLElement
        return { fir: fir.getBoundingClientRect().bottom, h1: h1.getBoundingClientRect().top }
      })
      const distanta = m.h1 - m.fir
      masuri.push(cale + ' ' + distanta.toFixed(1) + ' (h1 la ' + m.h1.toFixed(1) + ')')
      if (cale === caleDocument('termeni')) await page.screenshot({ path: info.outputPath('termeni-' + latimeCeruta + '.png') })
      expect(Math.abs(distanta - 24), cale + ': ' + distanta).toBeLessThanOrEqual(2)
    }
    console.log('[fir -> h1 ' + latimeCeruta + '] innerWidth CITIT ' + latimeCeruta + ' | ' + masuri.join(' | '))
  })
}

test('indexul la 1440: 7 carduri de 82 in ordinea barei, raza 16, fir cu doua niveluri', async ({ page }) => {
  const latime = await deschide(page, CALE_JURIDIC, 1440)
  const m = await page.evaluate(() => ({
    carduri: Array.from(document.querySelectorAll('[data-card-document]')).map((c) => ({
      slug: c.getAttribute('data-card-document'),
      inaltime: c.getBoundingClientRect().height,
      raza: getComputedStyle(c).borderTopLeftRadius,
      eticheta: c.tagName,
    })),
    fir: Array.from(document.querySelectorAll('nav[aria-label="Fir de navigare"] li')).map((li) => li.textContent?.trim()),
  }))
  console.log('[index 1440] innerWidth CITIT ' + latime + ' | ' + m.carduri.map((c) => c.slug + ' ' + c.inaltime.toFixed(1)).join(', '))
  expect(latime).toBe(1440)
  expect(m.carduri.map((c) => c.slug)).toEqual([...SLUGURI_JURIDICE])
  for (const c of m.carduri) {
    expect(Math.abs(c.inaltime - 82), c.slug ?? '').toBeLessThanOrEqual(1)
    expect(c.raza).toBe('16px')
    expect(c.eticheta, 'cardul e legatura activa').toBe('A')
  }
  expect(m.fir).toEqual(['Acasă', 'Documente juridice'])
})

test('sablonul A la 390: o coloana, bara devine cipuri pe randuri, fara derapaj', async ({ page }) => {
  const latime = await deschide(page, caleDocument('termeni'), 390, 844)
  const m = await page.evaluate(() => {
    const bara = document.querySelector('nav[aria-label="Documentele juridice"]') as HTMLElement
    const coloana = bara.nextElementSibling as HTMLElement
    const cipuri = Array.from(bara.querySelectorAll('a')) as HTMLElement[]
    return {
      bara: { x: bara.getBoundingClientRect().left, pozitie: getComputedStyle(bara).position },
      coloana: { x: coloana.getBoundingClientRect().left, sus: coloana.getBoundingClientRect().top, josBara: bara.getBoundingClientRect().bottom },
      cipuri: cipuri.map((c) => ({ sus: Math.round(c.getBoundingClientRect().top), raza: getComputedStyle(c).borderTopLeftRadius, marime: getComputedStyle(c).fontSize })),
    }
  })
  const d = await masoaraDerapaj(page, 390)
  console.log('[sablon A 390] innerWidth CITIT ' + latime + ' / ' + d.innerWidth + ' | ' + JSON.stringify(m) + ' | scrollWidth ' + d.scrollWidth)
  expect(latime).toBe(390)
  expect(m.bara.pozitie).toBe('static')
  expect(Math.abs(m.bara.x - m.coloana.x)).toBeLessThanOrEqual(0.5)
  expect(m.coloana.sus).toBeGreaterThan(m.coloana.josBara)
  expect(m.cipuri[0].sus).toBe(m.cipuri[1].sus)
  for (const c of m.cipuri) expect([c.raza, c.marime]).toEqual(['9999px', '12px'])
  expect(d.scrollWidth, 'derapaj: ' + d.vinovati.join(', ')).toBeLessThanOrEqual(d.innerWidth)
})

test('axe si derapajul pe cele opt pagini: zero incalcari grave, nimic peste 390', async ({ page }) => {
  test.setTimeout(180_000)
  for (const cale of CAI) {
    await deschide(page, cale, 1280, 720)
    const a = await masoaraAccesibilitatea(page)
    const d = await masoaraDerapaj(page, 390)
    console.log('[axe ' + cale + '] reguli ' + a.reguliRulate + ' | grave ' + a.grave.map((g) => g.regula).join(', ') + ' | usoare ' + a.usoare.map((u) => u.regula).join(', ') + ' | 390: ' + d.innerWidth + '/' + d.scrollWidth)
    expect(a.grave.map((g) => g.regula + ' ' + g.tinte.join(' ; ')), 'incalcari ' + IMPACTURI_BLOCANTE.join('/') + ' pe ' + cale).toEqual([])
    expect(d.scrollWidth, cale + ' derapaj: ' + d.vinovati.join(', ')).toBeLessThanOrEqual(d.innerWidth)
  }
})

// ---------------------------------------------------------------------------------------------
// 6. G-AI-01 si G-AI-02
// ---------------------------------------------------------------------------------------------

const DECLARATII = (JSON.parse(readFileSync(join(RADACINA, 'config', 'seo', 'juridic.json'), 'utf8')) as {
  raspuns_autonom_cu_operator: Record<string, DeclaratieRaspuns>
}).raspuns_autonom_cu_operator

test('G-AI-01 si G-AI-02 pe copie: paritatea de cel putin 95% si raspunsul declarat in primele 400 de cuvinte', async ({ browser }) => {
  test.setTimeout(240_000)
  for (const cale of CAI) {
    const declaratie = DECLARATII[cale]
    expect(declaratie, 'declaratia rutei ' + cale + ' in config/seo/juridic.json').toBeDefined()
    const p = await masoaraParitatea(browser, copie.baza + cale)
    const r = await masoaraRaspunsul(browser, copie.baza + cale, declaratie)
    console.log(
      '[G-AI ' + cale + '] paritate ' + (p.acoperire * 100).toFixed(1) + '% (' + p.gasite + '/' + p.propozitii + ', innerWidth ' + p.innerWidth +
        ') | main ' + r.cuvinteMain + ' cuvinte | primul paragraf ' + r.cuvintePrimulParagraf + ' | abateri: ' + (r.abateri.join('; ') || '-'),
    )
    expect(p.acoperire, cale + ' lipsa: ' + p.lipsa.slice(0, 3).join(' | ')).toBeGreaterThanOrEqual(PRAG_PARITATE)
    expect(r.abateri, cale).toEqual([])
  }
})

// ---------------------------------------------------------------------------------------------
// 7. Bugetele de la 390, pe documentul cel mai lung
// ---------------------------------------------------------------------------------------------

const INCETINIRE_CPU = 4
const PRAG_LCP_MS = 2500
const PRAG_CLS = 0.1
const PRAG_INP_MS = 200
const CALE_MARTOR = '/__martor-lcp-juridic-copie'
const HTML_MARTOR =
  '<!doctype html><html lang="ro"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">' +
  '<title>Martor</title></head><body style="margin:0;font:16px system-ui"><main style="padding:48px 16px">' +
  '<h1 style="font-size:32px;line-height:1.2;margin:0">Un titlu de doua randuri, cat al unei pagini juridice</h1>' +
  '<p>Un paragraf scurt sub titlu.</p></main></body></html>'
const PRAG_MARTOR_MS = 250

async function incarcare(browser: Browser, cale: string): Promise<{ lcp: number; element: string; cls: number; latime: number }> {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'no-preference' })
  try {
    if (cale === CALE_MARTOR) {
      await context.route('**' + CALE_MARTOR, (r) => r.fulfill({ status: 200, contentType: 'text/html; charset=utf-8', body: HTML_MARTOR }))
    }
    await context.addInitScript(() => {
      const w = window as unknown as { __lcp: { t: number; el: string }[]; __cls: number }
      w.__lcp = []
      w.__cls = 0
      new PerformanceObserver((l) => {
        for (const e of l.getEntries() as (PerformanceEntry & { element?: Element | null })[]) {
          w.__lcp.push({ t: e.startTime, el: e.element ? e.element.tagName.toLowerCase() + ' ' + (e.element.textContent ?? '').trim().slice(0, 30) : '?' })
        }
      }).observe({ type: 'largest-contentful-paint', buffered: true })
      new PerformanceObserver((l) => {
        for (const e of l.getEntries() as (PerformanceEntry & { value: number; hadRecentInput: boolean })[]) if (!e.hadRecentInput) w.__cls += e.value
      }).observe({ type: 'layout-shift', buffered: true })
    })
    const page = await context.newPage()
    const cdp = await context.newCDPSession(page)
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: INCETINIRE_CPU })
    await page.goto(copie.baza + cale, { waitUntil: 'load' })
    await page.waitForTimeout(cale === CALE_MARTOR ? 1500 : 5000)
    const r = await page.evaluate(() => {
      const w = window as unknown as { __lcp: { t: number; el: string }[]; __cls: number }
      const u = w.__lcp[w.__lcp.length - 1]
      return { lcp: u ? u.t : -1, element: u ? u.el : '(niciun LCP)', cls: w.__cls, latime: window.innerWidth }
    })
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: 1 })
    return r
  } finally {
    await context.close()
  }
}

/** Clicul pe legatura spre anexa, singura interactiune din corpul documentului: durata Event Timing. */
async function clicAnexa(browser: Browser): Promise<{ durata: number; latime: number }> {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' })
  try {
    await context.addInitScript(() => {
      const w = window as unknown as { __gesturi: { nume: string; id: number; durata: number }[] }
      w.__gesturi = []
      new PerformanceObserver((l) => {
        for (const e of l.getEntries() as (PerformanceEntry & { interactionId?: number })[]) {
          if (e.interactionId) w.__gesturi.push({ nume: e.name, id: e.interactionId, durata: e.duration })
        }
      }).observe({ type: 'event', buffered: true, durationThreshold: 16 } as PerformanceObserverInit)
    })
    const page = await context.newPage()
    const cdp = await context.newCDPSession(page)
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: INCETINIRE_CPU })
    await page.goto(copie.baza + caleDocument('termeni'), { waitUntil: 'networkidle' })
    const latime = await page.evaluate(() => window.innerWidth)
    const tinta = page.locator('article a[href="#anexa-a"]').first()
    await tinta.scrollIntoViewIfNeeded()
    await page.waitForTimeout(800)
    await page.evaluate(() => {
      ;(window as unknown as { __gesturi: unknown[] }).__gesturi = []
    })
    await tinta.click()
    await expect.poll(() => page.evaluate(() => location.hash)).toBe('#anexa-a')
    await page.waitForTimeout(1200)
    const gesturi = await page.evaluate(() => (window as unknown as { __gesturi: { nume: string; id: number; durata: number }[] }).__gesturi)
    const clic = gesturi.find((g) => g.nume === 'click')
    // Sub 16 ms navigatorul nu raporteaza intrarea deloc: gestul a fost sub prag.
    const durata = clic ? Math.max(...gesturi.filter((g) => g.id === clic.id).map((g) => g.durata)) : 0
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: 1 })
    return { durata, latime }
  } finally {
    await context.close()
  }
}

test(caleDocument('termeni') + ' pe copie, la 390 cu procesorul incetinit de 4 ori: LCP <= 2500 ms, CLS <= 0,1, INP <= 200 ms', async ({ browser }) => {
  test.setTimeout(240_000)
  const curate: { lcp: number; element: string; cls: number; latime: number }[] = []
  const martori: number[] = []
  for (let i = 0; i < 8 && curate.length < 3; i++) {
    const m = await incarcare(browser, CALE_MARTOR)
    martori.push(Math.round(m.lcp))
    const r = await incarcare(browser, caleDocument('termeni'))
    if (m.lcp > 0 && m.lcp <= PRAG_MARTOR_MS) curate.push(r)
  }
  if (curate.length < 3) nemasurat('numai ' + curate.length + ' incarcari curate (martor: ' + martori.join(' / ') + ' ms)')
  const lcp = curate.map((c) => c.lcp).sort((a, b) => a - b)[1]
  const cls = Math.max(...curate.map((c) => c.cls))
  const clicuri: number[] = []
  for (let i = 0; i < 3; i++) {
    const c = await clicAnexa(browser)
    expect(c.latime).toBe(390)
    clicuri.push(Math.round(c.durata))
  }
  const inp = [...clicuri].sort((a, b) => a - b)[1]
  console.log(
    '[bugete copie termeni] innerWidth CITIT: ' + curate.map((c) => c.latime).join('/') + ' | LCP ' +
      curate.map((c) => Math.round(c.lcp) + ' (' + c.element + ')').join(' / ') + ' | mediana ' + Math.round(lcp) + ' ms | CLS max ' +
      cls.toFixed(4) + ' | martor ' + martori.join(' / ') + ' ms | clic spre anexa ' + clicuri.join(' / ') + ' ms, mediana ' + inp,
  )
  for (const c of curate) expect(c.latime).toBe(390)
  expect(lcp).toBeGreaterThan(0)
  expect(lcp).toBeLessThanOrEqual(PRAG_LCP_MS)
  expect(cls).toBeLessThanOrEqual(PRAG_CLS)
  expect(inp).toBeLessThanOrEqual(PRAG_INP_MS)
})
