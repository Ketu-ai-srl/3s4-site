import { expect, test } from './ajutor/baza'
import { pornesteCopia3sMd, type Copie3sMd } from './ajutor/copie-3s-md'

/**
 * Limitele pe plan pe paginile /ro SERVITE (felia 129, oglinda lui `limite-pe-plan.spec.ts` a feliei 127; deciziile
 * 66-69): /ro/preturi si /ro/enterprise pe copia 3s.md. Proba de sursa e `tests/limite-ro-md.test.ts`; aici se masoara
 * ce ajunge la vizitator:
 *  1. HTML-ul servit /ro/preturi: limitele fiecarui card (cifra ingrosata + unitatea), randurile de limita ale
 *     tabelului, pliul suplimentelor cu tabelul si intrebarile lui; /ro/enterprise: limitele de baza;
 *  2. cu toate pliurile deschise, la 1440 si la 390 (latimea citita din pagina), pagina nu se deruleaza pe orizontala,
 *     iar tabelul suplimentelor se deruleaza in panoul lui la 390 (controlul: tabelul e mai lat decat panoul);
 *  3. detectorul pliului gaseste pe /ro/preturi ce gaseste pe /pricing (trei pliuri, unul cu suplimentele: perechea
 *     P08 are pliul pe ambele pagini 3s.md), iar pe /ro/enterprise, care nu are pliuri de preturi, zero suplimente
 *     (martorul NEGATIV, pe aceeasi copie, ca prezenta pe /ro/preturi sa nu vina dintr-un selector care prinde orice).
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
  ['5', '100', '80', '1.000', '15'],
  ['10', '200', '200', '2.500', '30'],
  ['20', '400', '400', '5.000', '60'],
]
// Unitatile, fara "de": regula numeralului il pune numai dupa unele cifre, deci se accepta optional.
const UNITATI = ['conturi pentru echipă', 'GB de stocare', 'răspunsuri AI pe lună', 'pagini OCR pe lună', 'GB de descărcări pe lună']

test('/ro/preturi servit: limitele pe carduri, randurile tabelului si pliul suplimentelor', async () => {
  const html = await (await fetch(copie.baza + '/ro/preturi')).text()
  for (const card of CARDURI) {
    // React separa nodurile de text alaturate cu un comentariu gol in HTML-ul servit; il accepta, nu il cere.
    card.forEach((cifra, i) =>
      expect(html, cifra + ' ' + UNITATI[i]).toMatch(new RegExp('<strong>' + cifra.replace('.', '\\.') + '</strong> (<!-- -->)?(de )?' + UNITATI[i])),
    )
  }
  for (const rand of ['Stocare', 'Răspunsuri AI pe lună', 'Pagini OCR pe lună', 'Descărcări pe lună', 'Taxă de conectare, la 1.000 de pagini (o singură dată)']) {
    expect(html, rand).toContain('>' + rand + '</th>')
  }
  expect(html.match(/data-pliu-suplimente/g) ?? []).toHaveLength(1)
  for (const t of [
    'Ai nevoie de mai mult? Suplimente și regulile limitelor',
    '6 EUR la 1.000 de pagini importate, o singură dată',
    'O singură dată, valabile 90 de zile',
    'Limitele se aplică pe utilizator sau pe firmă?',
  ]) {
    expect(html, t).toContain(t)
  }
})

test('/ro/enterprise servit: limitele de baza in lista pentru IT si achizitii', async () => {
  const html = await (await fetch(copie.baza + '/ro/enterprise')).text()
  for (const t of [
    'De la 21 la 60 de conturi de utilizator',
    '500 GB de stocare',
    '600 de răspunsuri AI pe lună',
    '20.000 de pagini OCR pe lună',
    '200 GB de descărcări pe lună',
  ]) {
    expect(html, t).toContain(t)
  }
})

for (const latime of [1440, 390]) {
  test('/ro/preturi la ' + latime + ': cu pliurile deschise, pagina nu se deruleaza pe orizontala', async ({ page }) => {
    await page.setViewportSize({ width: latime, height: 900 })
    await page.goto(copie.baza + '/ro/preturi#pachete')
    const pliuri = page.locator('main details > summary')
    await expect(pliuri).toHaveCount(3)
    for (const s of await pliuri.all()) await s.click()
    const pliu = page.locator('details[data-pliu-suplimente]')
    await expect(pliu).toHaveAttribute('open', '')
    // Panoul derulabil al tabelului (raspunsurile acordeonului sunt si ele `region`, dar ascunse si cu alt nume).
    const panou = pliu.getByRole('region', { name: /^Tabelul suplimentelor/ })
    await expect(panou).toBeVisible()
    const m = await page.evaluate(() => {
      const r = document.querySelector('details[data-pliu-suplimente] [role="region"][aria-label^="Tabelul suplimentelor"]') as HTMLElement
      return {
        latime: window.innerWidth,
        pagina: document.documentElement.scrollWidth,
        panou: r.clientWidth,
        tabel: (r.querySelector('table') as HTMLElement).scrollWidth,
      }
    })
    console.log('[f129] /ro/preturi ' + JSON.stringify(m))
    expect(m.latime).toBe(latime)
    expect(m.pagina).toBeLessThanOrEqual(m.latime)
    if (latime === 390) expect(m.tabel).toBeGreaterThan(m.panou)
  })
}

/** Detectorul pliului: aceiasi doi selectori pe toate paginile, ca o absenta sa nu fie o cautare oarba. */
async function pliuri(page: import('@playwright/test').Page): Promise<{ rezumate: number; suplimente: number }> {
  return { rezumate: await page.locator('main details > summary').count(), suplimente: await page.locator('[data-pliu-suplimente]').count() }
}

test('martor POZITIV: perechea P08 pe 3s.md, /ro/preturi are aceleasi pliuri ca /pricing, trei, unul cu suplimentele', async ({ page }) => {
  await page.goto(copie.baza + '/pricing#pachete')
  const en = await pliuri(page)
  await page.goto(copie.baza + '/ro/preturi#pachete')
  const ro = await pliuri(page)
  expect(en).toEqual({ rezumate: 3, suplimente: 1 })
  expect(ro).toEqual(en)
})

test('martor NEGATIV: /ro/enterprise nu are pliul suplimentelor', async ({ page }) => {
  await page.goto(copie.baza + '/ro/enterprise')
  expect((await pliuri(page)).suplimente).toBe(0)
})
