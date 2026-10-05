import type { Browser, Page } from '@playwright/test'
import { expect, test } from './ajutor/baza'
import { pornesteCopia3sMd, type Copie3sMd } from './ajutor/copie-3s-md'

/**
 * Paginile P08 `/pricing`, P09 `/enterprise`, P10 `/contact` si `/ro/contact` pe COPIA 3s.md (felia 104): aceleasi
 * componente ca perechile RO (decizia 53). Forma fata de RO (semnatura, stilurile, textul RO, RON pe incarcarea
 * simpla) o masoara `congruenta.spec.ts`; aici se masoara ce cere felia in plus:
 *   1. pe /pricing, zero RON in bucatile JS cerute DUPA interactiuni (lumea pachetelor deschisa, calculatorul deschis si
 *      cursoarele miscate, comutatorul de perioada pe ambele pozitii, ambele pliuri deschise, paleta deschisa), in
 *      afara bucatilor cu RON pe care pagina le cere deja la incarcarea simpla (exceptia declarata a paletei, pana la
 *      felia 109, `config/congruenta/exceptii-pachet.json`): interactiunile nu au voie sa aduca o bucata noua cu RON;
 *   2. sumele in EUR in carduri, pe ambele perioade, si fraza calculatorului cu moneda inaintea sumei si virgula la mii;
 *   3. insigna "Recommended" pe Starter (decizia 59); JSON-LD fara `Offer` si fara `priceCurrency`, cu FAQPage egal cu
 *      intrebarile vizibile;
 *   4. pe toate patru paginile: zero `<form`, fiecare legatura WhatsApp din `<main>` cu ref-ul paginii.
 * MARTORUL interactiunilor: pe build-ul RO, aceleasi interactiuni pe `/preturi` cer bucati cu RON in plus fata de
 * incarcarea simpla (insulele pretului RO), deci un "zero" pe /pricing nu vine dintr-o interactiune care n-a incarcat
 * nimic.
 */

const RON = new RegExp('\\b' + 'R' + 'ON\\b')

let copie: Copie3sMd

test.beforeAll(async () => {
  test.setTimeout(600_000)
  copie = await pornesteCopia3sMd()
})

test.afterAll(async () => {
  await copie?.opreste()
})

/** Bucatile JS cerute de pagina (calea -> continutul), cat ruleaza `faci`. */
async function bucati(browser: Browser, adresa: string, faci: (p: Page) => Promise<void>): Promise<Map<string, string>> {
  const ctx = await browser.newContext({ reducedMotion: 'no-preference' })
  const page = await ctx.newPage()
  const cerute = new Map<string, string>()
  const asteptari: Promise<void>[] = []
  const origine = new URL(adresa).origin
  page.on('response', (r) => {
    const u = new URL(r.url())
    if (u.origin === origine && r.request().resourceType() === 'script') {
      asteptari.push(r.text().then((t) => void cerute.set(u.pathname, t)).catch(() => undefined))
    }
  })
  try {
    await page.goto(adresa, { waitUntil: 'networkidle' })
    await faci(page)
    await page.waitForLoadState('networkidle')
    await Promise.all(asteptari)
  } finally {
    await ctx.close()
  }
  return cerute
}

const cuRon = (m: Map<string, string>) => [...m.entries()].filter(([, t]) => RON.test(t)).map(([k]) => k).sort()

/** Interactiunile pe pagina de preturi, cu numele accesibile ale editiei. */
async function interactioneaza(page: Page, n: { teaser: RegExp; calculator: string; lunar: string; anual: RegExp; perioada: string }): Promise<void> {
  await page.getByRole('button', { name: n.teaser }).click()
  const grup = page.getByRole('group', { name: n.calculator })
  await expect(grup).toBeVisible()
  for (const cursor of await grup.locator('input[type="range"]').all()) {
    await cursor.focus()
    await page.keyboard.press('End')
  }
  const perioada = page.getByRole('group', { name: n.perioada })
  await perioada.getByRole('button', { name: n.lunar }).click()
  await perioada.getByRole('button', { name: n.anual }).click()
  for (const s of await page.locator('details > summary').all()) await s.click()
  await page.keyboard.press('Control+k')
}

const NUME_EN = { teaser: /Try it with your own figures/, calculator: 'Time lost searching for documents', lunar: 'Monthly', anual: /Annual/, perioada: 'Billing period' }
const NUME_RO = { teaser: /Încearcă cu cifrele firmei/, calculator: 'Calculul timpului pierdut căutând acte', lunar: 'Lunar', anual: /Anual/, perioada: 'Perioada de plată' }

test('/pricing: interactiunile nu cer nicio bucata JS noua cu RON (in afara celor ale incarcarii simple)', async ({ browser }) => {
  test.setTimeout(180_000)
  const simplu = await bucati(browser, copie.baza + '/pricing#pachete', async () => undefined)
  const dupa = await bucati(browser, copie.baza + '/pricing#pachete', (p) => interactioneaza(p, NUME_EN))
  const noiEn = cuRon(dupa).filter((b) => !cuRon(simplu).includes(b))
  console.log('[f104] /pricing: ' + simplu.size + ' bucati la incarcare (' + cuRon(simplu).length + ' cu RON: ' + cuRon(simplu).join(', ') + '), ' + dupa.size + ' dupa interactiuni, ' + noiEn.length + ' noi cu RON')
  // Interactiunile au cerut cod in plus (calculatorul, pliurile), deci masuratoarea a vazut ceva.
  expect(dupa.size).toBeGreaterThanOrEqual(simplu.size)
  expect(noiEn).toEqual([])
})

test('martor POZITIV: pe build-ul RO, aceleasi interactiuni pe /preturi cer bucati NOI cu RON (insulele pretului RO)', async ({ browser, baseURL }) => {
  test.setTimeout(180_000)
  const roSimplu = await bucati(browser, baseURL + '/preturi#pachete', async () => undefined)
  const roDupa = await bucati(browser, baseURL + '/preturi#pachete', (p) => interactioneaza(p, NUME_RO))
  const noiRo = cuRon(roDupa).filter((b) => !cuRon(roSimplu).includes(b))
  console.log('[f104] martor /preturi: ' + cuRon(roSimplu).length + ' bucati cu RON la incarcare, ' + cuRon(roDupa).length + ' dupa interactiuni, ' + noiRo.length + ' noi')
  expect(noiRo.length).toBeGreaterThan(0)
})

/** Legaturile WhatsApp din `<main>` si cate dintre ele NU poarta ref-ul paginii exact o data. */
function refuriGresite(html: string, ref: string): { wa: string[]; gresite: string[] } {
  const main = html.slice(html.indexOf('<main'), html.indexOf('</main>'))
  const wa = [...main.matchAll(/<a\b[^>]*\shref="(https:\/\/wa\.me\/[^"]*)"/g)].map((m) => decodeURIComponent(m[1].split('&amp;').join('&')))
  return { wa, gresite: wa.filter((h) => h.split('[ref:' + ref + ']').length - 1 !== 1) }
}

test('martor NEGATIV si POZITIV al verificarii ref-ului, pe HTML asamblat la rulare: ref-ul paginii trece, un ref strain pica', () => {
  const leg = (r: string) => '<main><a href="https://wa.me/1?text=' + encodeURIComponent('Hello [ref:' + r + ']') + '">x</a></main>'
  expect(refuriGresite(leg('en-' + 'price'), 'en-price')).toEqual({ wa: ['https://wa.me/1?text=Hello [ref:en-price]'], gresite: [] })
  expect(refuriGresite(leg('en-' + 'home'), 'en-price').gresite).toHaveLength(1)
})

test('/pricing: sumele in EUR pe ambele perioade, fraza calculatorului cu "EUR" inaintea sumei si virgula la mii', async ({ page }) => {
  await page.goto(copie.baza + '/pricing#pachete')
  const sume = page.locator('[class*="pachete_suma__"]')
  await expect(sume).toHaveText(['75', '125', '200'])
  await expect(page.locator('[class*="pachete_unitatePret__"]').first()).toHaveText('EUR / month')
  const perioada = page.getByRole('group', { name: NUME_EN.perioada })
  await perioada.getByRole('button', { name: NUME_EN.lunar }).click()
  await expect(sume).toHaveText(['90', '150', '240'])
  await page.getByRole('button', { name: NUME_EN.teaser }).click()
  const grup = page.getByRole('group', { name: NUME_EN.calculator })
  const tarif = grup.locator('input[type="range"]').nth(2)
  await tarif.focus()
  await page.keyboard.press('End')
  // 4 persoane x 25 de minute x 22 de zile = 37 h; la 100 EUR pe ora, 3.700 EUR: scris "EUR 3,700".
  await expect(page.locator('[class*="pachete_frazaIesire__"]').first()).toContainText('Today you pay EUR 3,700 a month for the 37 h')
  await expect(page.locator('[class*="pachete_frazaPlan__"]')).toContainText('The plan that fits is Starter: EUR 90 a month')
  expect(RON.test(await page.locator('main').innerText())).toBe(false)
})

test('/pricing: insigna pe Starter; JSON-LD fara Offer si priceCurrency, cu FAQPage egal cu intrebarile vizibile', async ({ page }) => {
  const html = await (await fetch(copie.baza + '/pricing')).text()
  await page.goto(copie.baza + '/pricing#pachete')
  await expect(page.locator('[class*="pachete_cardRecomandat__"] h3')).toHaveText(['Starter'])
  await expect(page.locator('[class*="pachete_cardRecomandat__"] [class*="pachete_eticheta__"]')).toHaveText(['Recommended'])
  const blocuri = [...html.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].map((m) => m[1])
  expect(blocuri.length).toBeGreaterThan(0)
  const ld = blocuri.join('\n')
  // Martorul cautarii: un Offer fabricat ar fi prins de aceeasi cautare.
  expect(/"@type":"Offer"|priceCurrency/.test('{"@type":"' + 'Offer","priceCurrency":"EUR"}')).toBe(true)
  expect(/"@type":"Offer"|priceCurrency/.test(ld)).toBe(false)
  const noduri = blocuri.flatMap((b) => {
    const j = JSON.parse(b) as { '@graph'?: Record<string, unknown>[] } & Record<string, unknown>
    return j['@graph'] ?? [j]
  })
  expect(noduri.filter((n) => n['@type'] === 'BreadcrumbList')).toHaveLength(1)
  const faq = noduri.find((n) => n['@type'] === 'FAQPage') as { mainEntity: { name: string }[] } | undefined
  expect(faq).toBeDefined()
  const vizibile = await page.locator('section[aria-labelledby="intrebari-preturi-titlu"] button').allInnerTexts()
  expect(faq!.mainEntity.map((q) => q.name)).toEqual(vizibile.map((t) => t.trim()))
  expect(vizibile).toHaveLength(7)
})

for (const [cale, ref] of [
  ['/pricing', 'en-price'],
  ['/enterprise', 'en-ent'],
  ['/contact', 'en-contact'],
  ['/ro/contact', 'ro-md-contact'],
] as const) {
  test(cale + ': zero <form, legaturile WhatsApp din <main> poarta ref-ul paginii, o singura data', async () => {
    const html = await (await fetch(copie.baza + cale)).text()
    expect(html).not.toContain('<form')
    const { wa, gresite } = refuriGresite(html, ref)
    // Controlul extragerii: fiecare pagina are cel putin o legatura WhatsApp in <main>.
    expect(wa.length, cale).toBeGreaterThan(0)
    expect(gresite).toEqual([])
  })
}
