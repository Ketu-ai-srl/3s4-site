import { expect, test, type Browser, type Page } from '@playwright/test'
import { COMPARATIE_STOCARE } from '../../src/content/comparatii'
import { IMPACTURI_BLOCANTE, masoaraAccesibilitatea } from './ajutor/detectori'

/**
 * Probele de browser ale feliei `comparatii-termene` (comparatie-drive.md, comparatie-stocare.md,
 * instrumente__termene-pastrare.md): ce nu se poate vedea in HTML-ul randat pe server.
 *
 *   - verificatorul: Romania aleasa implicit; clicul pe o pastila schimba panoul instant, fara sa
 *     miste pagina, si scrie tara in adresa; adresa cu `?tara=` alege tara la incarcare; un rand se
 *     deschide si arata temeiul si sursa;
 *   - HTML-ul servit FARA JavaScript are panourile tuturor tarilor (continutul se indexeaza), iar
 *     detectorul care masoara asta e probat pe un HTML din care lipseste un panou;
 *   - comutatorul stocarii: grup radio cu un singur buton in ordinea Tab, sageti si Home / End;
 *   - conectorul animat se opreste cu `prefers-reduced-motion`;
 *   - subpagina de tiparit: butonul cheama `window.print()` o data; la tipar antetul, subsolul si
 *     bara dispar;
 *   - accesibilitatea la 390 (poarta comuna PA-03 masoara la latimea implicita a proiectului).
 * Latimea ferestrei se CITESTE din pagina la fiecare masuratoare si se tipareste.
 */

const TERMENE = '/instrumente/termene-pastrare'
const TIPAR = '/instrumente/termene-pastrare/tipar'
const STOCARE = '/comparatie-stocare'
const DRIVE = '/comparatie-drive'

// Etichetele comutatorului, din date: textele se rescriu la lungimea rolului, proba ramane.
const [NOR, S3] = COMPARATIE_STOCARE.comutator.optiuni

/** Panourile verificatorului prezente in HTML-ul servit, citit cu JavaScript OPRIT. */
async function panouriServite(browser: Browser, url: string, modifica?: (html: string) => string) {
  const context = await browser.newContext({ javaScriptEnabled: false })
  const pagina = await context.newPage()
  if (modifica) {
    await pagina.route(url, async (ruta) => {
      const raspuns = await ruta.fetch()
      await ruta.fulfill({ response: raspuns, body: modifica(await raspuns.text()) })
    })
  }
  await pagina.goto(url, { waitUntil: 'load' })
  const ids = await pagina.evaluate(() => [...document.querySelectorAll('[id^="panou-"]')].map((e) => e.id).sort())
  await context.close()
  return ids
}

async function starePanouri(page: Page) {
  return page.evaluate(() => ({
    iw: innerWidth,
    vizibile: [...document.querySelectorAll<HTMLElement>('[id^="panou-"]')].filter((e) => !e.hidden).map((e) => e.id),
    apasate: [...document.querySelectorAll('[aria-pressed="true"]')].map((e) => (e.textContent ?? '').trim()),
    cautare: location.search,
    sy: Math.round(scrollY),
  }))
}

test.describe('verificatorul de termene', () => {
  test('Romania e aleasa implicit; clicul pe Moldova schimba panoul, pastila si adresa, fara derulare', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto(TERMENE, { waitUntil: 'networkidle' })
    const inainte = await starePanouri(page)
    console.log('[termene] innerWidth ' + inainte.iw + ' | la incarcare: ' + JSON.stringify(inainte))
    expect(inainte.vizibile).toEqual(['panou-ro'])
    expect(inainte.apasate).toEqual(['România'])
    expect(inainte.cautare).toBe('')

    await page.evaluate(() => window.scrollTo(0, 300))
    const sy = await page.evaluate(() => Math.round(scrollY))
    await page.getByRole('button', { name: 'Republica Moldova' }).click()
    const dupa = await starePanouri(page)
    console.log('[termene] dupa clic: ' + JSON.stringify(dupa))
    expect(dupa.vizibile).toEqual(['panou-md'])
    expect(dupa.apasate).toEqual(['Republica Moldova'])
    expect(dupa.cautare).toBe('?tara=md')
    expect(dupa.sy).toBe(sy)
  })

  test('adresa cu ?tara=md alege Moldova la incarcare; un cod necunoscut lasa Romania', async ({ page }) => {
    await page.goto(TERMENE + '?tara=md', { waitUntil: 'networkidle' })
    await expect(page.locator('#panou-md')).toBeVisible()
    await expect(page.locator('#panou-ro')).toBeHidden()
    await page.goto(TERMENE + '?tara=xx', { waitUntil: 'networkidle' })
    await expect(page.locator('#panou-ro')).toBeVisible()
    await expect(page.locator('#panou-md')).toBeHidden()
  })

  test('un rand se deschide independent si arata temeiul si sursa, deschisa in fereastra noua', async ({ page }) => {
    await page.goto(TERMENE, { waitUntil: 'networkidle' })
    const randuri = page.locator('#panou-ro details')
    await expect(randuri).toHaveCount(7)
    await randuri.nth(0).locator('summary').click()
    await randuri.nth(3).locator('summary').click()
    const deschise = await page.evaluate(() => [...document.querySelectorAll('#panou-ro details')].map((d) => (d as HTMLDetailsElement).open))
    console.log('[termene] randuri deschise: ' + JSON.stringify(deschise))
    expect(deschise).toEqual([true, false, false, true, false, false, false])
    const temei = randuri.nth(0).getByText('Temei legal')
    await expect(temei).toBeVisible()
    const sursa = randuri.nth(0).locator('a[href^="https://"]').first()
    await expect(sursa).toBeVisible()
    await expect(sursa).toHaveAttribute('target', '_blank')
    await expect(sursa).toHaveAttribute('rel', 'noopener nofollow')
  })

  test('HTML-ul servit fara JavaScript are panourile ambelor tari', async ({ browser, baseURL }) => {
    const ids = await panouriServite(browser, (baseURL ?? '') + TERMENE)
    console.log('[termene fara JS] panouri: ' + ids.join(', '))
    expect(ids).toEqual(['panou-md', 'panou-ro'])
  })

  test('martor POZITIV: un HTML din care lipseste panoul Moldovei TREBUIE prins de detector', async ({ browser, baseURL }) => {
    const url = (baseURL ?? '') + TERMENE
    const ids = await panouriServite(browser, url, (html) => html.replace('id="panou-md"', 'id="scos-md"'))
    console.log('[termene martor pozitiv] panouri gasite in HTML-ul fabricat: ' + ids.join(', '))
    expect(ids).toEqual(['panou-ro'])
  })

  test('martor NEGATIV: un panou ascuns cu `hidden` ramane in HTML si NU e raportat lipsa', async ({ browser, baseURL }) => {
    const url = (baseURL ?? '') + TERMENE
    const ids = await panouriServite(browser, url, (html) => html.replace('id="panou-ro"', 'hidden="" id="panou-ro"'))
    expect(ids).toEqual(['panou-md', 'panou-ro'])
  })
})

test.describe('comutatorul stocarii', () => {
  test('clicul schimba doar nodul stocarii; sagetile si Home / End aleg; un singur buton in ordinea Tab', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto(STOCARE, { waitUntil: 'networkidle' })
    const stare = () =>
      page.evaluate(() => ({
        bifat: [...document.querySelectorAll('[role="radio"]')].map((b) => b.getAttribute('aria-checked') + '/' + (b as HTMLElement).tabIndex),
        nod: (document.querySelector('[aria-live="polite"]')?.textContent ?? '').trim(),
      }))
    const initial = await stare()
    expect(initial.bifat).toEqual(['true/0', 'false/-1'])
    expect(initial.nod).toContain(NOR.titlu)

    await page.getByRole('radio', { name: S3.buton, exact: true }).click()
    const dupaClic = await stare()
    console.log('[comutator] dupa clic: ' + JSON.stringify(dupaClic))
    expect(dupaClic.bifat).toEqual(['false/-1', 'true/0'])
    expect(dupaClic.nod).toContain('s3://')

    await page.keyboard.press('ArrowLeft')
    expect((await stare()).bifat).toEqual(['true/0', 'false/-1'])
    await page.keyboard.press('End')
    expect((await stare()).bifat).toEqual(['false/-1', 'true/0'])
    await page.keyboard.press('Home')
    expect((await stare()).bifat).toEqual(['true/0', 'false/-1'])
    await expect(page.getByRole('radio', { name: NOR.buton, exact: true })).toBeFocused()

    await page.keyboard.press('Tab')
    const dupaTab = await page.evaluate(() => document.activeElement?.getAttribute('role') ?? document.activeElement?.tagName)
    expect(dupaTab).not.toBe('radio')
  })

  test('conectorul animat se opreste cand omul cere mai putina miscare', async ({ browser, baseURL }) => {
    const nume = async (miscare: 'reduce' | 'no-preference') => {
      const context = await browser.newContext({ reducedMotion: miscare })
      const pagina = await context.newPage()
      await pagina.goto((baseURL ?? '') + STOCARE, { waitUntil: 'networkidle' })
      const n = await pagina.evaluate(() => getComputedStyle(document.querySelector('svg path[pathLength]') as Element).animationName)
      await context.close()
      return n
    }
    const cuMiscare = await nume('no-preference')
    const fara = await nume('reduce')
    console.log('[comutator] animatie: fara preferinta ' + cuMiscare + ' | cu reducere ' + fara)
    expect(cuMiscare).not.toBe('none')
    expect(fara).toBe('none')
  })
})

test.describe('subpagina de tiparit', () => {
  test('butonul cheama window.print o data; la tipar antetul, subsolul si bara dispar', async ({ page }) => {
    await page.goto(TIPAR, { waitUntil: 'networkidle' })
    await page.evaluate(() => {
      ;(window as unknown as { __tiparit: number }).__tiparit = 0
      window.print = () => {
        ;(window as unknown as { __tiparit: number }).__tiparit++
      }
    })
    await page.getByRole('button', { name: 'Tipăriți' }).click()
    expect(await page.evaluate(() => (window as unknown as { __tiparit: number }).__tiparit)).toBe(1)

    await page.emulateMedia({ media: 'print' })
    const afisare = await page.evaluate(() => ({
      antet: getComputedStyle(document.querySelector('header[data-antet]') as Element).display,
      subsol: getComputedStyle(document.querySelector('body > footer') as Element).display,
      bara: getComputedStyle((document.querySelector('main button') as Element).parentElement as Element).display,
    }))
    console.log('[tipar] la tiparire: ' + JSON.stringify(afisare))
    expect(afisare).toEqual({ antet: 'none', subsol: 'none', bara: 'none' })
  })
})

test.describe('accesibilitatea la 390', () => {
  for (const ruta of [DRIVE, STOCARE, TERMENE, TIPAR]) {
    test('pagina ' + ruta + ' nu are incalcari ' + IMPACTURI_BLOCANTE.join('/') + ' la 390', async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 })
      await page.goto(ruta, { waitUntil: 'networkidle' })
      const iw = await page.evaluate(() => innerWidth)
      const masura = await masoaraAccesibilitatea(page)
      console.log('[a11y 390] ' + ruta + ' | innerWidth ' + iw + ' | blocante: ' + masura.grave.map((g) => g.regula).join(', '))
      expect(iw).toBe(390)
      expect(masura.grave.map((g) => g.regula)).toEqual([])
    })
  }
})
