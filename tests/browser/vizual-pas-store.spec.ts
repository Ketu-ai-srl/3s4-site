import { join } from 'node:path'
import type { Browser, Page } from '@playwright/test'
import { expect, test } from './ajutor/baza'
import { mediuProfil3sMd, pornesteCopia3sMd, type Copie3sMd } from './ajutor/copie-3s-md'
import { RADACINA } from './ajutor/proiect'

/**
 * Felia 139 (`vizual-pas-store`): pe start, in sectiunea #functionalitati, slotul pasului 02 Store era gol pe editiile
 * 3s.md (innerHTML 0), fiindca macheta portalului clientilor a iesit prin decizia 43. Acum tine vizualul fara cuvinte
 * al dosarelor (`src/components/functionalitati-acasa/MachetaDosare.tsx`). Se masoara pe trei servere: copia 3s.md
 * (`/` si `/ro`), copia 3s.com.ro (`/`, romana la radacina, aceeasi pagina ca `/ro`) si build-ul probelor, editia
 * ro-RO, care e martorul: acolo pasul 02 pastreaza macheta portalului.
 *
 * CE SE CERE:
 *  1. HTML-ul servit (fara JavaScript): slotul 02 al cardului lipit are continut si tine vizualul; vizualul apare de
 *     doua ori pe pagina (slotul si cardul de mobil), cu `aria-hidden="true"`, fara nimic focalizabil si fara niciun
 *     caracter de text (litere sau cifre); are documente. Pe ro-RO: zero vizualuri, iar slotul 02 tine macheta
 *     portalului.
 *  2. Intreg in rama: la 1440 x 900 (pasul 02 activ, cardul lipit) si la 390 x 844 (cardul 2 al pistei, cu miscare, si
 *     cardurile stivuite, cu miscare redusa), vizualul sta in rama lui (slotul, respectiv cardul) si fiecare descendent
 *     cu marime sta in cutia vizualului. Latimea se citeste din pagina.
 *  3. Intrarea, ca la registru: cu miscare, documentele sunt ascunse pana la activarea pasului (`data-documente` 0) si
 *     apar apoi toate; cu miscare redusa se vad toate de la incarcare, fara secventa.
 *
 * MARTORII, asamblati la rulare: un text strecurat in vizual si un slot 02 golit sunt prinse de 1 (POZITIV); un rand
 * al vizualului inaltat peste rama e prins de 2 (POZITIV); paginile reale trec (NEGATIV).
 *
 * Ce NU masoara: forma claselor fata de RO (o masoara `congruenta.spec.ts`, cu randul vizualului din
 * `config/congruenta/p01.json`), contrastul si axe pe start (`editie-start-en.spec.ts`) si aspectul (capturile, privite
 * de un om).
 */

const VIZUAL = '[data-macheta-dosare]'
const SECTIUNE = '#functionalitati'

let copieMd: Copie3sMd
let copieComRo: Copie3sMd

test.beforeAll(async () => {
  // Doua build-uri, unul dupa altul (memoria statiei si a masinii CI).
  test.setTimeout(1_200_000)
  copieMd = await pornesteCopia3sMd()
  copieComRo = await pornesteCopia3sMd(mediuProfil3sMd(join(RADACINA, 'config', 'profil-3s-com-ro.json')))
})

test.afterAll(async () => {
  await paginaGoala?.context().close()
  await copieMd?.opreste()
  await copieComRo?.opreste()
})

/** Paginile 3s.md ale feliei: adresa si eticheta din raport. */
function pagini(): { eticheta: string; adresa: string }[] {
  return [
    { eticheta: '3s.md /', adresa: copieMd.baza + '/' },
    { eticheta: '3s.md /ro', adresa: copieMd.baza + '/ro' },
    { eticheta: '3s.com.ro /', adresa: copieComRo.baza + '/' },
  ]
}

async function htmlServit(adresa: string): Promise<string> {
  const r = await fetch(adresa, { redirect: 'manual' })
  if (r.status !== 200) throw new Error(adresa + ' a raspuns ' + r.status)
  return r.text()
}

type Static = {
  sloturi: number[]
  vizualeInSlot2: number
  portalInSlot2: number
  vizuale: number
  ariaHidden: (string | null)[]
  focalizabile: number
  text: string[]
  documente: number[]
}

/** Ruleaza in browser, pe HTML-ul servit (DOMParser, fara JavaScript). Nu are voie sa foloseasca nimic din afara ei. */
function staticInPagina(arg: { html: string; vizual: string; sectiune: string }): Static {
  const d = new DOMParser().parseFromString(arg.html, 'text/html')
  const s = d.querySelector(arg.sectiune)
  const sloturi = s ? [...s.querySelectorAll('[class*="_slot__"]')] : []
  const vizuale = s ? [...s.querySelectorAll(arg.vizual)] : []
  return {
    sloturi: sloturi.map((e) => e.innerHTML.length),
    vizualeInSlot2: sloturi[1]?.querySelectorAll(arg.vizual).length ?? -1,
    portalInSlot2: sloturi[1]?.querySelectorAll('figure[class*="Machete_portal__"]').length ?? -1,
    vizuale: vizuale.length,
    ariaHidden: vizuale.map((v) => v.getAttribute('aria-hidden')),
    focalizabile: vizuale.flatMap((v) => [...v.querySelectorAll('a[href], button, input, select, textarea, [tabindex]')]).length,
    text: vizuale.map((v) => (v.textContent ?? '').replace(/\s+/g, '')),
    documente: vizuale.map((v) => v.querySelectorAll('[class*="MachetaDosare_document__"]').length),
  }
}

let paginaGoala: Page | null = null

async function analizeaza(browser: Browser, html: string): Promise<Static> {
  if (paginaGoala === null) {
    const ctx = await browser.newContext({ javaScriptEnabled: true })
    await ctx.route('**/*', (r) => r.abort())
    paginaGoala = await ctx.newPage()
  }
  return paginaGoala.evaluate(staticInPagina, { html, vizual: VIZUAL, sectiune: SECTIUNE })
}

/** Abaterile de la criteriul 1 pe o pagina 3s.md; lista goala = slotul 02 tine vizualul, fara text. */
function abateriStatic(m: Static): string[] {
  const a: string[] = []
  if (m.sloturi.length !== 3) a.push('sloturi: ' + m.sloturi.length + ', nu 3')
  if (!(m.sloturi[1] > 0)) a.push('slotul 02 are innerHTML ' + m.sloturi[1])
  if (m.vizualeInSlot2 !== 1) a.push('vizualuri in slotul 02: ' + m.vizualeInSlot2)
  if (m.vizuale !== 2) a.push('vizualuri pe pagina: ' + m.vizuale + ', nu 2 (slotul si cardul de mobil)')
  if (m.ariaHidden.some((x) => x !== 'true')) a.push('aria-hidden: ' + m.ariaHidden.join(','))
  if (m.focalizabile !== 0) a.push('elemente focalizabile in vizual: ' + m.focalizabile)
  for (const t of m.text) if (t !== '') a.push('text in vizual: "' + t.slice(0, 60) + '"')
  if (m.documente.some((n) => n === 0)) a.push('vizual fara documente: ' + m.documente.join(','))
  return a
}

test('1. HTML-ul servit: slotul 02 tine vizualul pe /, /ro (3s.md) si / (3s.com.ro), fara text; pe ro-RO, macheta portalului (martor NEGATIV: paginile reale trec; martor POZITIV: textul strecurat si slotul golit sunt prinse)', async ({ browser, baseURL }) => {
  const total: number[] = []
  for (const p of pagini()) {
    const m = await analizeaza(browser, await htmlServit(p.adresa))
    console.log('[' + p.eticheta + '] sloturi ' + m.sloturi.join('/') + ', vizualuri ' + m.vizuale + ', documente ' + m.documente.join('/') + ', text ' + m.text.map((t) => t.length).join('/'))
    expect(abateriStatic(m), p.eticheta).toEqual([])
    total.push(...m.documente)
  }
  // Acelasi vizual pe toate cele trei pagini: acelasi numar de documente.
  expect(new Set(total).size).toBe(1)

  // Martorul ro-RO (build-ul probelor): pasul 02 pastreaza macheta portalului, fara vizual.
  const ro = await analizeaza(browser, await htmlServit(String(baseURL) + '/'))
  console.log('[ro-RO /] sloturi ' + ro.sloturi.join('/') + ', vizualuri ' + ro.vizuale + ', portal in slotul 02 ' + ro.portalInSlot2)
  expect(ro.vizuale).toBe(0)
  expect(ro.portalInSlot2).toBe(1)

  // Martorii POZITIVI, pe HTML-ul real al lui /, modificat in memorie: un text strecurat in vizual si slotul 02 golit.
  const html = await htmlServit(copieMd.baza + '/')
  const cuText = html.replace(/(<figure[^>]*data-macheta-dosare[^>]*>)/, '$1' + 'Mar' + 'tor 7')
  expect(cuText, 'martorul textului a aterizat').not.toBe(html)
  expect(abateriStatic(await analizeaza(browser, cuText)).join('\n')).toContain('text in vizual')
  const golit = await paginaGoala!.evaluate((h) => {
    const d = new DOMParser().parseFromString(h, 'text/html')
    const slot = d.querySelectorAll('#functionalitati [class*="_slot__"]')[1]
    if (slot) slot.innerHTML = ''
    return '<!DOCTYPE html>' + d.documentElement.outerHTML
  }, html)
  expect(abateriStatic(await analizeaza(browser, golit)).join('\n')).toContain('slotul 02 are innerHTML 0')
})

type Rama = {
  latime: number
  documente: string | null
  vizual: { x: number; y: number; w: number; h: number }
  inRama: boolean
  iesiri: string[]
}

/** Vizualul pasului 02 in rama lui: slotul cardului lipit (desktop) sau cardul lui (mobil), plus descendentii lui. */
async function masoaraRama(page: Page, mobil: boolean): Promise<Rama> {
  return page.evaluate(
    ([sel, vizual, mob]) => {
      const s = document.querySelector(sel)!
      const fig = mob
        ? (s.querySelectorAll('ol > li')[1].querySelector(vizual) as HTMLElement)
        : (s.querySelectorAll('[class*="_slot__"]')[1].querySelector(vizual) as HTMLElement)
      const rama = (mob ? fig.closest('li') : fig.closest('[class*="_slot__"]'))!.getBoundingClientRect()
      const r = fig.getBoundingClientRect()
      const in_ = (q: DOMRect, c: DOMRect) => q.left >= c.left - 0.5 && q.right <= c.right + 0.5 && q.top >= c.top - 0.5 && q.bottom <= c.bottom + 0.5
      const iesiri = [...fig.querySelectorAll('*')]
        .filter((e) => {
          const q = e.getBoundingClientRect()
          return q.width > 0 && q.height > 0 && !in_(q, r)
        })
        .map((e) => e.tagName.toLowerCase() + '.' + String(e.getAttribute('class') ?? '').split(' ')[0].slice(0, 40))
      return {
        latime: window.innerWidth,
        documente: fig.getAttribute('data-documente'),
        vizual: { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) },
        inRama: in_(r, rama) && r.width > 0 && r.height > 0,
        iesiri,
      }
    },
    [SECTIUNE, VIZUAL, mobil] as const,
  )
}

/** Cate documente are vizualul din slotul 02, citit din pagina (nu scris aici). */
async function documenteVizual(page: Page): Promise<number> {
  return page.locator(SECTIUNE + ' [class*="_slot__"]').nth(1).locator('[class*="MachetaDosare_document__"]').count()
}

async function laPasul2Desktop(page: Page): Promise<void> {
  await page.waitForSelector(SECTIUNE + ' [data-js]')
  const tinta = await page.evaluate((sel) => {
    const li = document.querySelectorAll(sel + ' ol > li')[1]
    return li.getBoundingClientRect().top + window.scrollY - 0.3 * window.innerHeight
  }, SECTIUNE)
  await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), tinta)
  await expect(page.locator(SECTIUNE + ' [data-pas]')).toHaveAttribute('data-pas', '1')
}

async function laCardul2Pista(page: Page): Promise<void> {
  await page.waitForSelector(SECTIUNE + ' [data-pista]')
  await page.locator(SECTIUNE + ' [role="group"] button').nth(1).click()
  await expect(page.locator(SECTIUNE + ' [data-pista]')).toHaveAttribute('data-card', '1')
}

async function laCardul2Stivuit(page: Page): Promise<void> {
  await page.locator(SECTIUNE + ' ol > li').nth(1).scrollIntoViewIfNeeded()
}

const FORME = [
  { forma: '1440', viewport: { width: 1440, height: 900 }, reducedMotion: 'no-preference' as const, mobil: false, la: laPasul2Desktop },
  { forma: '390 pista', viewport: { width: 390, height: 844 }, reducedMotion: 'no-preference' as const, mobil: true, la: laCardul2Pista },
  { forma: '390 stivuit', viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' as const, mobil: true, la: laCardul2Stivuit },
]

test('2. intreg in rama: la 1440 si la 390 (pista si stivuit), pe toate cele trei pagini (martor POZITIV: un rand inaltat peste rama e prins)', async ({ browser }) => {
  test.setTimeout(240_000)
  for (const p of pagini()) {
    for (const f of FORME) {
      const ctx = await browser.newContext({ viewport: f.viewport, reducedMotion: f.reducedMotion })
      const page = await ctx.newPage()
      await page.goto(p.adresa)
      await f.la(page)
      const total = String(await documenteVizual(page))
      // Secventa de intrare terminata: toate documentele vizibile, fara deplasarea celor inca ascunse.
      const fig = f.mobil ? page.locator(SECTIUNE + ' ol > li').nth(1).locator(VIZUAL) : page.locator(SECTIUNE + ' [class*="_slot__"]').nth(1).locator(VIZUAL)
      await expect(fig).toHaveAttribute('data-documente', total, { timeout: 15_000 })
      await page.waitForTimeout(400)
      const m = await masoaraRama(page, f.mobil)
      console.log('[rama ' + p.eticheta + ' ' + f.forma + '] innerWidth CITIT ' + m.latime + ', vizual ' + JSON.stringify(m.vizual) + ', in rama ' + m.inRama + ', iesiri ' + m.iesiri.length)
      expect(m.inRama, p.eticheta + ' ' + f.forma).toBe(true)
      expect(m.iesiri, p.eticheta + ' ' + f.forma).toEqual([])
      if (p.eticheta === '3s.md /' && f.forma === '1440') {
        // Martorul POZITIV: ultimul rand al arborelui inaltat peste rama trebuie sa iasa din cutia vizualului.
        await page.addStyleTag({ content: VIZUAL + ' li:last-child { min-height: 600px !important; flex: none !important; }' })
        const martor = await masoaraRama(page, f.mobil)
        console.log('[rama martor] iesiri ' + martor.iesiri.length)
        expect(martor.iesiri.length).toBeGreaterThan(0)
      }
      await ctx.close()
    }
  }
})

test('3. intrarea: cu miscare, documentele apar dupa activarea pasului 02; cu miscare redusa se vad toate de la incarcare', async ({ browser }) => {
  test.setTimeout(120_000)
  for (const p of pagini()) {
    // Cu miscare: dupa hidratare documentele sunt ascunse si raman asa cat pasul 02 nu e activ.
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'no-preference' })
    const page = await ctx.newPage()
    await page.goto(p.adresa)
    await page.waitForSelector(SECTIUNE + ' [data-js]')
    const total = String(await documenteVizual(page))
    const fig = page.locator(SECTIUNE + ' [class*="_slot__"]').nth(1).locator(VIZUAL)
    await expect(fig).toHaveAttribute('data-documente', '0')
    await page.waitForTimeout(1500)
    expect(await fig.getAttribute('data-documente'), p.eticheta + ': fara pasul 02 activ').toBe('0')
    const t0 = Date.now()
    await laPasul2Desktop(page)
    await expect(fig).toHaveAttribute('data-documente', total, { timeout: 15_000 })
    console.log('[intrare ' + p.eticheta + '] ' + total + ' documente, toate vizibile la ' + (Date.now() - t0) + ' ms dupa activare')
    await ctx.close()

    // Cu miscare redusa: starea finala de la incarcare, fara secventa.
    const ctxR = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' })
    const pageR = await ctxR.newPage()
    await pageR.goto(p.adresa)
    await pageR.waitForSelector(SECTIUNE + ' [data-js]')
    const figR = pageR.locator(SECTIUNE + ' [class*="_slot__"]').nth(1).locator(VIZUAL)
    await pageR.waitForTimeout(1000)
    expect(await figR.getAttribute('data-documente'), p.eticheta + ': miscare redusa').toBe(total)
    expect(await pageR.locator(SECTIUNE + ' ' + VIZUAL + ' [data-ascuns]').count(), p.eticheta + ': miscare redusa').toBe(0)
    await ctxR.close()
  }
})
