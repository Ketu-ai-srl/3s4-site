import type { Browser, Page } from '@playwright/test'
import { expect, test } from './ajutor/baza'
import { mediuProfil3sMd, pornesteCopia3sMd, type Copie3sMd } from './ajutor/copie-3s-md'
import { abateriWhatsApp, legaturaProba, MARCAJ, texteEn } from './ajutor/whatsapp-ro'

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
 *   4. pe toate patru paginile: zero `<form`, fiecare legatura WhatsApp din `<main>` cu textul paginii, din felia 164
 *      FARA marcajul ref si atribuit paginii in Umami (`ajutor/whatsapp-ro.ts`).
 * MARTORUL interactiunilor: pe build-ul RO, aceleasi interactiuni pe `/preturi` cer bucati cu RON in plus fata de
 * incarcarea simpla (insulele pretului RO), deci un "zero" pe /pricing nu vine dintr-o interactiune care n-a incarcat
 * nimic.
 */

const RON = new RegExp('\\b' + 'R' + 'ON\\b')
/** Numarul de WhatsApp al domeniului 3s.md, din profil (paginile in romana, felia 164). */
const NUMAR_WA = (JSON.parse(mediuProfil3sMd().CANALE_JSON) as { whatsapp: string }).whatsapp

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
// Numele accesibile ale BUILD-ULUI RO (`src/content/preturi.ts`, editia RO de la `baseURL`), pe care ruleaza martorul de
// mai jos. Felia 164 a rescris numai textele editiei ro-MD (`src/content/ro-md/preturi-componente.ts`): o prima varianta
// a feliei pusese aici numele ro-MD ("Calculează cu cifrele companiei tale"), care nu exista pe build-ul RO, iar martorul
// astepta butonul pana la termenul de 180 s (CI 41802934979). Editia RO nu e in mandatul feliei, deci numele ei raman.
const NUME_RO = { teaser: /Încearcă cu cifrele firmei/, calculator: 'Calculul timpului pierdut căutând acte', lunar: 'Lunar', anual: /Anual/, perioada: 'Perioada de plată' }
// Numele accesibile ale EDITIEI ro-MD (`/ro/preturi` pe copia 3s.md, `src/content/ro-md/preturi-componente.ts:236-238`).
// Sunt alt obiect decat NUME_RO fiindca proba de mai jos ruleaza pe alt build: cu un singur obiect, repararea martorului
// RO a mutat numele si pe /ro/preturi, care a asteptat apoi butonul RO pana la 60 s (CI 41822856990).
const NUME_RO_MD = { teaser: /Calculează cu cifrele companiei tale/, calculator: 'Calculul timpului pierdut căutând documente', lunar: 'Lunar', anual: /Anual/, perioada: 'Perioada de plată' }

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

/** Legaturile WhatsApp din `<main>`, brute (cum stau in atribut). */
function waDinMain(html: string): string[] {
  const main = html.slice(html.indexOf('<main'), html.indexOf('</main>'))
  return [...main.matchAll(/<a\b[^>]*\shref="(https:\/\/wa\.me\/[^"]*)"/g)].map((m) => m[1].split('&amp;').join('&'))
}

// Felia 164 (decizia Marian 04.11.2026, „1 da”): mesajul pleaca fara [ref:...] pe EN ca pe RO-MD; martorii detectorului
// (`ajutor/whatsapp-ro.ts`), pe textul real al paginii din tabelul de canale EN.
test('martor NEGATIV si POZITIV al verificarii mesajului, pe HTML asamblat la rulare: textul curat trece, marcajul repus si textul strain pica', () => {
  const text = texteEn().get('en-price') ?? ''
  expect(text, 'controlul: tabelul EN are textul paginii').not.toBe('')
  const leg = (t: string) => '<main><a href="' + legaturaProba(NUMAR_WA, t) + '">x</a></main>'
  const o = { numar: NUMAR_WA, ref: 'en-price', adresaPaginii: 'http://127.0.0.1:1/pricing', limba: 'en' as const }
  expect(abateriWhatsApp(waDinMain(leg(text)), o)).toEqual([])
  expect(abateriWhatsApp(waDinMain(leg(text.replace('pricing page.', 'pricing page ' + MARCAJ + 'en-price].'))), o).join(' | ')).toContain('marcajul')
  expect(abateriWhatsApp(waDinMain(leg(texteEn().get('en-home') ?? '')), o).join(' | ')).toContain('alt text')
})

test('/pricing: sumele in EUR pe ambele perioade, fraza calculatorului cu "EUR" inaintea sumei si virgula la mii', async ({ page }) => {
  await page.goto(copie.baza + '/pricing#pachete')
  const sume = page.locator('[class*="pachete_suma__"]')
  await expect(sume).toHaveText(['75', '125', '200'])
  // Pretul anual pe luna poarta perioada langa el (testul 3s.md din 06.10: 75 / 125 / 200 se citeau ca preturi lunare).
  await expect(page.locator('[class*="pachete_unitatePret__"]').first()).toHaveText('EUR / month, billed annually')
  const perioada = page.getByRole('group', { name: NUME_EN.perioada })
  await perioada.getByRole('button', { name: NUME_EN.lunar }).click()
  await expect(sume).toHaveText(['90', '150', '240'])
  await expect(page.locator('[class*="pachete_unitatePret__"]').first()).toHaveText('EUR / month')
  await page.getByRole('button', { name: NUME_EN.teaser }).click()
  const grup = page.getByRole('group', { name: NUME_EN.calculator })
  const tarif = grup.locator('input[type="range"]').nth(2)
  await tarif.focus()
  await page.keyboard.press('End')
  // 4 persoane x 25 de minute x 22 de zile = 36,67 h; la 100 EUR pe ora, 3.666,67 EUR din orele exacte: scris "EUR 3,667"
  // (formula veche inmultea orele rotunjite: 3,700). Orele sub 100 se scriu din 07.10 cu o zecimala ("36.7 h", inainte
  // "37 h"), ca inmultirea din fraza sa se poata verifica pe ecran. Din felia 143 orele rotunjite au "about" in fata.
  await expect(page.locator('[class*="pachete_frazaIesire__"]').first()).toContainText('Today you pay EUR 3,667 a month for about 36.7 h')
  await expect(page.locator('[class*="pachete_frazaPlan__"]')).toContainText('The plan that fits is Starter: EUR 90 a month')
  expect(RON.test(await page.locator('main').innerText())).toBe(false)
})

/**
 * Testul 3s.md din 06.10: pretul anual pe luna fara perioada langa el, in cardurile si in fraza calculatorului, si
 * orele fara separator de mii langa banii cu separator. Pe fiecare editie: unitatea cardurilor si fraza pachetului la
 * Anual (implicit) si la Lunar (martorul: fraza lunara nu numeste plata anuala), apoi orele la capetele cursoarelor.
 * Din 07.10 si orele sub 100 cu o zecimala: la 1 coleg, 10 min si 5 EUR/h fraza spunea "EUR 18 ... for the 4 h" (4 x 5 =
 * 20, nu 18); acum "3.7 h" / "3,7 h", deci inmultirea se verifica pe ecran. Din felia 143 orele rotunjite au "about" /
 * "circa" in fata.
 */
for (const e of [
  { cale: '/pricing', nume: NUME_EN, anual: 'EUR / month, billed annually', lunar: 'EUR / month', planAnual: 'The plan that fits is Starter: EUR 75 a month billed annually', planLunar: 'The plan that fits is Starter: EUR 90 a month, the cost of', ore: 'for about 2,200 h', oreMici: 'EUR 18 a month for about 3.7 h', marcaAnual: 'billed annually' },
  { cale: '/ro/preturi', nume: NUME_RO_MD, anual: 'EUR / lună, la plata anuală', lunar: 'EUR / lună', planAnual: 'Se potrivește pachetul Starter: 75 EUR pe lună, la plata anuală', planLunar: 'Se potrivește pachetul Starter: 90 EUR pe lună, adică', ore: 'pentru cele circa 2.200 h', oreMici: '18 EUR lunar pentru cele circa 3,7 h', marcaAnual: 'la plata anuală' },
]) {
  test(e.cale + ': perioada langa pretul anual (carduri si calculator), separatorul de mii la ore si zecimala sub 100 de ore', async ({ page }) => {
    await page.goto(copie.baza + e.cale + '#pachete')
    const unitati = page.locator('[class*="pachete_unitatePret__"]')
    await expect(unitati).toHaveText([e.anual, e.anual, e.anual])
    await page.getByRole('button', { name: e.nume.teaser }).click()
    const grup = page.getByRole('group', { name: e.nume.calculator })
    const plan = page.locator('[class*="pachete_frazaPlan__"]')
    await expect(plan).toContainText(e.planAnual)
    const perioada = page.getByRole('group', { name: e.nume.perioada })
    await perioada.getByRole('button', { name: e.nume.lunar }).click()
    await expect(unitati).toHaveText([e.lunar, e.lunar, e.lunar])
    await expect(plan).toContainText(e.planLunar)
    await expect(plan).not.toContainText(e.marcaAnual)
    const cursoare = grup.locator('input[type="range"]')
    await cursoare.nth(0).press('End')
    await cursoare.nth(1).press('End')
    // 50 x 120 min x 22 de zile = 2.200 h, scrisa cu separatorul editiei, ca banii din aceeasi fraza.
    await expect(page.locator('[class*="pachete_frazaIesire__"]').first()).toContainText(e.ore)
    // 1 x 10 min x 22 de zile = 3,67 h; la 5 EUR pe ora, 18,33 EUR: orele cu o zecimala, langa suma rotunjita.
    for (const i of [0, 1, 2]) await cursoare.nth(i).press('Home')
    await expect(page.locator('[class*="pachete_frazaIesire__"]').first()).toContainText(e.oreMici)
  })
}

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
  // Felia 164 (GO Marian 04.11.2026 pe documentul lui Adrian Mihai, apoi decizia Marian 04.11.2026, „1 da”, si pe EN):
  // mesajul pleaca fara [ref:...]; ref-ul alege doar randul tabelului de canale, iar atribuirea o poarta evenimentul
  // Umami `contact` cu `pagina`.
  const limba = cale.startsWith('/ro/') ? ('ro' as const) : ('en' as const)
  test(cale + ': zero <form, legaturile WhatsApp din <main> poarta textul paginii, fara marcaj, atribuit paginii in Umami', async () => {
    const html = await (await fetch(copie.baza + cale)).text()
    expect(html).not.toContain('<form')
    const wa = waDinMain(html)
    // Controlul extragerii: fiecare pagina are cel putin o legatura WhatsApp in <main>.
    expect(wa.length, cale).toBeGreaterThan(0)
    expect(abateriWhatsApp(wa, { numar: NUMAR_WA, ref, adresaPaginii: copie.baza + cale, limba })).toEqual([])
  })
}
