import { expect, test } from './ajutor/baza'
import { pornesteCopia3sMd, type Copie3sMd } from './ajutor/copie-3s-md'

/**
 * Limitele pe plan pe paginile SERVITE (felia 127, deciziile 66-68): /pricing si /enterprise pe copia 3s.md, /preturi
 * pe build-ul RO al probelor. Proba de sursa e `tests/limite-pe-plan.test.ts`; aici se masoara ce ajunge la vizitator:
 *  1. HTML-ul servit /pricing: limitele fiecarui card (cifra ingrosata + unitatea), randurile de limita ale tabelului,
 *     pliul suplimentelor cu tabelul si intrebarile lui; /enterprise: limitele de baza;
 *  2. cu toate pliurile deschise, la 1440 si la 390 (latimea citita din pagina), pagina nu se deruleaza pe orizontala,
 *     tabelul suplimentelor incape la 390 in panoul lui (felia 133), iar tabelul pachetelor se deruleaza in al lui
 *     (controlul: el e mai lat decat panoul, deci zeroul de derulare a paginii nu vine dintr-un tabel ascuns sau ingust);
 *  3. pagina RO /preturi ramane cu doua pliuri si fara pliul suplimentelor (martorul NEGATIV); acelasi detector gaseste
 *     pe /pricing trei pliuri, unul cu suplimentele (martorul POZITIV), deci absenta pe RO nu e o cautare oarba.
 */

let copie: Copie3sMd

test.beforeAll(async () => {
  test.setTimeout(600_000)
  copie = await pornesteCopia3sMd()
})

test.afterAll(async () => {
  await copie?.opreste()
})

const CARDURI = [
  ['5', '100', '80', '1,000', '15'],
  ['10', '200', '200', '2,500', '30'],
  ['20', '400', '400', '5,000', '60'],
]
const UNITATI = ['user accounts', 'GB of storage', 'AI answers a month', 'OCR pages a month', 'GB of downloads a month']

test('/pricing servit: limitele pe carduri, randurile tabelului si pliul suplimentelor', async () => {
  const html = await (await fetch(copie.baza + '/pricing')).text()
  for (const card of CARDURI) {
    // React separa nodurile de text alaturate cu un comentariu gol in HTML-ul servit; il accepta, nu il cere.
    card.forEach((cifra, i) => expect(html, cifra + ' ' + UNITATI[i]).toMatch(new RegExp('<strong>' + cifra + '</strong> (<!-- -->)?' + UNITATI[i])))
  }
  for (const rand of ['Storage', 'AI answers a month', 'OCR pages a month', 'Downloads a month', 'One-time connection, per 1,000 pages']) {
    expect(html, rand).toContain('>' + rand + '</th>')
  }
  expect(html.match(/data-pliu-suplimente/g) ?? []).toHaveLength(1)
  // Felia 143, runda 2: suma ramane lipita de EUR pe ecran (spatiu nedespartitor in HTML-ul servit).
  for (const t of ['Need more? Add-ons and how limits work', 'EUR\u00a06 per 1,000 pages imported, once', 'Once, valid 90 days', 'Are the limits per user or per company?']) {
    expect(html, t).toContain(t)
  }
})

test('/enterprise servit: limitele de baza in lista pentru IT si achizitii', async () => {
  const html = await (await fetch(copie.baza + '/enterprise')).text()
  for (const t of ['From 21 to 60 user accounts', '500 GB of storage', '600 AI answers a month', '20,000 OCR pages a month', '200 GB of downloads a month']) {
    expect(html, t).toContain(t)
  }
})

for (const latime of [1440, 390]) {
  test('/pricing la ' + latime + ': cu pliurile deschise, pagina nu se deruleaza pe orizontala', async ({ page }) => {
    await page.setViewportSize({ width: latime, height: 900 })
    await page.goto(copie.baza + '/pricing#pachete')
    const pliuri = page.locator('main details > summary')
    await expect(pliuri).toHaveCount(3)
    for (const s of await pliuri.all()) await s.click()
    const pliu = page.locator('details[data-pliu-suplimente]')
    await expect(pliu).toHaveAttribute('open', '')
    // Panoul derulabil al tabelului (raspunsurile acordeonului sunt si ele `region`, dar ascunse si cu alt nume).
    const panou = pliu.getByRole('region', { name: /^Add-ons table/ })
    await expect(panou).toBeVisible()
    const m = await page.evaluate(() => {
      const r = document.querySelector('details[data-pliu-suplimente] [role="region"][aria-label^="Add-ons table"]') as HTMLElement
      return {
        latime: window.innerWidth,
        pagina: document.documentElement.scrollWidth,
        panou: r.clientWidth,
        tabel: (r.querySelector('table') as HTMLElement).scrollWidth,
        // Controlul de continere: tabelul pachetelor (pliul al doilea, deschis si el) ramane mai lat decat panoul lui la 390.
        panouPlanuri: (document.querySelector('[role="region"][aria-label^="Plans table"]') as HTMLElement).clientWidth,
        tabelPlanuri: (document.querySelector('[role="region"][aria-label^="Plans table"] table') as HTMLElement).scrollWidth,
      }
    })
    console.log('[f127] /pricing ' + JSON.stringify(m))
    expect(m.latime).toBe(latime)
    expect(m.pagina).toBeLessThanOrEqual(m.latime)
    // De la felia 133 tabelul suplimentelor INCAPE la 390 (eticheta pe 8,5rem, doua valori pe 6,5rem): controlul vechi
    // (tabelul mai lat decat panoul) masura asezarea defecta. Zeroul de derulare a paginii ramane semnificativ prin
    // tabelul pachetelor, care se deruleaza in panoul lui; suplimentele se cer vizibile si pe toata latimea panoului.
    if (latime === 390) {
      expect(m.tabelPlanuri).toBeGreaterThan(m.panouPlanuri)
      expect(m.tabel).toBeLessThanOrEqual(m.panou)
      expect(m.tabel).toBeGreaterThanOrEqual(m.panou - 1)
    }
  })
}

/** Detectorul pliului: aceiasi doi selectori pe ambele editii, ca absenta pe RO sa nu fie o cautare oarba. */
async function pliuri(page: import('@playwright/test').Page): Promise<{ rezumate: number; suplimente: number }> {
  return { rezumate: await page.locator('main details > summary').count(), suplimente: await page.locator('[data-pliu-suplimente]').count() }
}

test('martor POZITIV: detectorul pliului gaseste pe /pricing trei pliuri, unul cu suplimentele', async ({ page }) => {
  await page.goto(copie.baza + '/pricing#pachete')
  expect(await pliuri(page)).toEqual({ rezumate: 3, suplimente: 1 })
})

test('martor NEGATIV: /preturi (RO) ramane cu doua pliuri, fara pliul suplimentelor', async ({ page, baseURL }) => {
  await page.goto(String(baseURL) + '/preturi#pachete')
  expect(await pliuri(page)).toEqual({ rezumate: 2, suplimente: 0 })
})
