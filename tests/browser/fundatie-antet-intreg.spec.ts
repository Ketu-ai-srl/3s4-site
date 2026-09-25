import { expect, test, type Locator, type Page } from '@playwright/test'
import { EROU } from '../../src/content/acasa'
import { BRAND } from '../../src/content/entitate'
import {
  ANTET,
  FOAIE_FUNCTIONALITATI,
  FOAIE_SOLUTII,
  PANOU_DESCARCA,
  SERTAR,
  type Legatura,
} from '../../src/content/navigatie'
import { POSTA_SINTETICA, pornesteCopiaCompleta, type CopieCompleta } from './ajutor/copie-navigatie-completa'
import { masoaraAccesibilitatea } from './ajutor/detectori'
import { rutePublice } from './ajutor/proiect'

/**
 * Antetul INTREG (felia `fundatie`): meniul mare si panoul Descarca, masurate pe o copie a
 * site-ului in care toate caile navigatiei sunt declarate existente (ajutor/copie-navigatie-completa.ts).
 *
 * DE CE EXISTA. Antetul e piesa inghetata pentru toate feliile, dar pe build-ul real de la S4-1
 * meniul mare si Descarca sunt filtrate (nu exista inca paginile lor). Trei defecte au trecut
 * asa nevazute pana la o masurare pe copie: clicul pe Descarca inchidea panoul pe care hover-ul
 * tocmai il deschisese; Escape din meniu sau din panou il redeschidea prin focusul intors pe
 * declansator; in sertarul de la 390, sub-vederea Descarca lasa focusul pe BODY, iar Tab iesea
 * din dialog. Pe codul de dinainte de reparatie, 8 din cele 9 probe care ruleaza pe copie au
 * picat, fiecare la asertiunea defectului ei (a noua e controlul copiei); dupa reparatie trec.
 *
 * Comportamentul cerut (componente-globale.md §2.4, §3.1, §5): hover sau focus deschid panoul;
 * clicul pe Descarca il fixeaza deschis, iar un al doilea clic il inchide; Escape inchide la
 * prima apasare si lasa focusul pe declansator; iesirea focusului sau a mouse-ului din zona il
 * inchide; in sertar focusul nu paraseste niciodata dialogul.
 *
 * Tot pe copie se masoara contrastul starilor pe care poarta de accesibilitate nu le vede
 * (Descarca deschis, hover pe butonul contur): un critic a gasit acolo text de 4,23:1, iar
 * poarta era verde, pentru ca axe ruleaza pe pagina in repaus a build-ului real.
 *
 * Si posta marcii (felia 43): build-ul real arata exact ce cere configurarea marcii - fara adresa,
 * nicio adresa si niciun `mailto:`; cu o adresa confirmata, numai ea. Copia are o adresa sintetica,
 * care trebuie sa apara in intrebari si in subsol. Pe 24.09 pagina arata o adresa care nu primea
 * posta.
 */

let copie: CopieCompleta

test.beforeAll(async () => {
  // Build-ul copiei: ~30 s pe statie; plafonul acopera o masina de CI mai lenta.
  test.setTimeout(300_000)
  copie = await pornesteCopiaCompleta()
})

test.afterAll(async () => {
  await copie?.opreste()
})

function antet(page: Page): Locator {
  return page.locator('header[data-antet]')
}

/**
 * Deschide startul copiei si asteapta hidratarea. `networkidle` nu vine niciodata pe copie:
 * prefetch-urile catre rutele declarate existente, dar fara pagina, raman deschise (masurat: 5
 * cereri `?_rsc=` neterminate dupa 15 s). Hidratarea se dovedeste printr-un efect al antetului,
 * care exista numai dupa ea: derularea peste prag il face pastila.
 */
async function deschideStartul(page: Page, eticheta: string): Promise<void> {
  await page.goto(copie.baza + '/', { waitUntil: 'load' })
  await expect(async () => {
    await page.evaluate(() => window.scrollTo(0, 40))
    await expect(antet(page)).toHaveAttribute('data-antet', 'pastila', { timeout: 250 })
  }).toPass({ timeout: 20_000 })
  await page.evaluate(() => window.scrollTo(0, 0))
  await expect(antet(page)).toHaveAttribute('data-antet', 'plat')
  console.log('[' + eticheta + '] innerWidth CITIT: ' + (await page.evaluate(() => window.innerWidth)))
}

function butonDescarca(page: Page): Locator {
  return antet(page).getByRole('button', { name: ANTET.descarca.text, exact: true })
}

function panouDescarca(page: Page): Locator {
  return page.getByRole('group', { name: PANOU_DESCARCA.eticheta })
}

function declansator(page: Page, text: string): Locator {
  return page.locator('[data-declansator="' + text + '"]')
}

/** Valoarea unui token de culoare, citita din pagina si scrisa cum o intoarce `getComputedStyle`. */
async function culoareaTokenului(page: Page, token: string): Promise<string> {
  const valoare = await page.evaluate((t) => getComputedStyle(document.documentElement).getPropertyValue(t), token)
  const hex = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(valoare.trim())
  if (!hex) throw new Error('tokenul ' + token + ' nu s-a rezolvat la o culoare hex: "' + valoare + '"')
  return 'rgb(' + hex.slice(1).map((x) => parseInt(x, 16)).join(', ') + ')'
}

/**
 * Axe pe toata pagina, cu acelasi detector ca poarta de accesibilitate, cat timp starea masurata
 * e activa. Controlul starii vine intai: fundalul tintei trebuie sa fie `albastru-pal`, altfel o
 * proba care n-a deschis sau n-a atins nimic ar masura pagina in repaus si ar trece.
 */
async function faraIncalcariInStare(page: Page, tinta: Locator, eticheta: string): Promise<void> {
  const pal = await culoareaTokenului(page, '--color-albastru-pal')
  await expect(tinta, 'starea "' + eticheta + '" nu e activa').toHaveCSS('background-color', pal)
  const masura = await masoaraAccesibilitatea(page)
  console.log('[contrast ' + eticheta + '] reguli evaluate: ' + masura.reguliRulate + ' | blocante: ' + masura.grave.length)
  for (const g of masura.grave) {
    console.log('    BLOCANT: ' + g.regula + ' (' + g.impact + ') x' + g.noduri + ' - ' + g.tinte.join(' | '))
  }
  expect(
    masura.grave.map((g) => g.regula),
    'incalcari serious/critical cu starea "' + eticheta + '"',
  ).toEqual([])
}

/** Focusul e inca pe elementul dat si nimic nu s-a redeschis nici dupa o scurta asteptare. */
async function ramaneInchis(page: Page, tinta: Locator): Promise<void> {
  await expect(tinta).toBeFocused()
  await expect(tinta).toHaveAttribute('aria-expanded', 'false')
  await expect(page.locator('[data-element-meniu]')).toHaveCount(0)
  // O redeschidere prin focus e sincrona; asteptarea prinde si una intarziata (cadru, temporizator).
  await page.waitForTimeout(300)
  await expect(tinta).toHaveAttribute('aria-expanded', 'false')
  await expect(page.locator('[data-element-meniu]')).toHaveCount(0)
}

test.describe('antetul intreg la 1440', () => {
  test.use({ viewport: { width: 1440, height: 900 } })

  test('martor POZITIV al copiei: antetul are Descarca si ambele foi ale meniului mare', async ({ page }) => {
    await deschideStartul(page, 'antet intreg')
    await expect(butonDescarca(page)).toBeVisible()
    await expect(declansator(page, 'Funcționalități')).toHaveAttribute('aria-expanded', 'false')
    await expect(declansator(page, 'Soluții')).toHaveAttribute('aria-expanded', 'false')
    await expect(antet(page).getByRole('link', { name: ANTET.autentificare.text })).toBeVisible()
  })

  test('martor NEGATIV: pe build-ul real Descarca si foile apar numai cand rutele lor exista', async ({ page }) => {
    // Asteptarea se deriva din arborele src/app (rutePublice), independent de filtrul antetului;
    // o constanta scrisa aici s-ar inrosi in ziua in care o felie adauga pagina tinta. La S4-1
    // raspunsul e "nimic" pentru toate trei: de aceea exista copia.
    const existente = new Set(rutePublice())
    const exista = (l: Legatura) => l.href !== null && (l.ruta === null || existente.has(l.ruta))
    await page.goto('/', { waitUntil: 'networkidle' })
    console.log('[antet real] innerWidth CITIT: ' + (await page.evaluate(() => window.innerWidth)))
    const descarca = PANOU_DESCARCA.grupuri.some((g) => g.elemente.some(exista))
    await expect(butonDescarca(page)).toHaveCount(descarca ? 1 : 0)
    for (const l of ANTET.legaturi) {
      if (!l.foaie) continue
      const areFoaie = exista(l) && [l.foaie.lider, ...l.foaie.elemente].some((e) => e !== null && exista(e))
      await expect(declansator(page, l.text), l.text).toHaveCount(areFoaie ? 1 : 0)
    }
  })

  test('Descarca cu mouse-ul: hover deschide, clicul lasa deschis, al doilea clic inchide', async ({ page }) => {
    await deschideStartul(page, 'descarca mouse')
    const buton = butonDescarca(page)
    await buton.hover()
    await expect(buton).toHaveAttribute('aria-expanded', 'true')
    await expect(panouDescarca(page)).toBeVisible()

    // Clicul real (miscare, apasare, eliberare) peste un panou deschis de hover: ramane deschis.
    await buton.click()
    await expect(buton).toHaveAttribute('aria-expanded', 'true')
    await expect(panouDescarca(page)).toBeVisible()
    await page.waitForTimeout(300)
    await expect(panouDescarca(page)).toBeVisible()

    // Al doilea clic il inchide; mouse-ul ramas pe buton nu-l redeschide.
    await buton.click()
    await expect(buton).toHaveAttribute('aria-expanded', 'false')
    await expect(panouDescarca(page)).toHaveCount(0)

    // Iesirea si intoarcerea mouse-ului: hover-ul redeschide, iesirea inchide.
    await page.mouse.move(600, 600)
    await buton.hover()
    await expect(panouDescarca(page)).toBeVisible()
    await page.mouse.move(600, 600)
    await expect(buton).toHaveAttribute('aria-expanded', 'false')
  })

  test('Descarca de la tastatura: Tab deschide, Enter lasa deschis, al doilea Enter inchide', async ({ page }) => {
    await deschideStartul(page, 'descarca tastatura')
    const buton = butonDescarca(page)
    await antet(page).getByRole('link', { name: ANTET.autentificare.text }).focus()
    await page.keyboard.press('Tab')
    await expect(buton).toBeFocused()
    await expect(buton).toHaveAttribute('aria-expanded', 'true')

    await page.keyboard.press('Enter')
    await expect(buton).toHaveAttribute('aria-expanded', 'true')
    await expect(panouDescarca(page)).toBeVisible()

    await page.keyboard.press('Enter')
    await ramaneInchis(page, buton)
  })

  test('Escape din panoul Descarca inchide la prima apasare; focusul urmator redeschide', async ({ page }) => {
    await deschideStartul(page, 'descarca escape')
    const buton = butonDescarca(page)
    await antet(page).getByRole('link', { name: ANTET.autentificare.text }).focus()
    await page.keyboard.press('Tab')
    await page.keyboard.press('ArrowDown')
    await expect(panouDescarca(page).locator('[data-element-meniu]').first()).toBeFocused()

    await page.keyboard.press('Escape')
    await ramaneInchis(page, buton)

    // Supresia tine un singur focus: plecat si intors cu Tab, panoul se deschide iar.
    await page.keyboard.press('Shift+Tab')
    await page.keyboard.press('Tab')
    await expect(buton).toBeFocused()
    await expect(buton).toHaveAttribute('aria-expanded', 'true')
  })

  for (const [text, foaie] of [
    ['Funcționalități', FOAIE_FUNCTIONALITATI],
    ['Soluții', FOAIE_SOLUTII],
  ] as const) {
    test('Escape din foaia ' + text + ' inchide la prima apasare si lasa focusul pe declansator', async ({ page }) => {
      await deschideStartul(page, 'meniu ' + text)
      const legatura = declansator(page, text)
      await legatura.focus()
      await expect(legatura).toHaveAttribute('aria-expanded', 'true')
      await expect(page.getByRole('group', { name: foaie.eticheta })).toBeVisible()

      await page.keyboard.press('ArrowDown')
      await expect(page.locator('[role="group"]:not([aria-hidden]) [data-element-meniu]').first()).toBeFocused()

      await page.keyboard.press('Escape')
      await ramaneInchis(page, legatura)
    })
  }

  test('iesirea focusului din zona inchide meniul mare si panoul Descarca', async ({ page }) => {
    await deschideStartul(page, 'iesire focus')
    // Meniul mare: dupa ultimul element al foii, Tab duce pe cautare, in afara zonei.
    const legatura = declansator(page, 'Soluții')
    await legatura.focus()
    await page.keyboard.press('ArrowDown')
    // ArrowDown muta focusul pe primul element abia in cadrul urmator (requestAnimationFrame).
    // Fara asteptarea starii, cand cadrul intarzia (masina incarcata), el cadea intre focusul pus
    // mai jos pe ultimul element si Tab: focusul sarea inapoi pe primul, iar Tab ajungea pe al
    // doilea element al foii, nu pe cautare. Reprodus cu cadrul intarziat artificial 10 / 15 ms:
    // 5 / 4 esecuri din 20 fara asteptare, 0 din 20 cu ea.
    const elemente = page.locator('[role="group"]:not([aria-hidden]) a')
    await expect(elemente.first()).toBeFocused()
    await elemente.last().focus()
    await page.keyboard.press('Tab')
    await expect(antet(page).getByRole('button', { name: ANTET.cautare.eticheta })).toBeFocused()
    await expect(legatura).toHaveAttribute('aria-expanded', 'false')
    await expect(page.locator('[data-element-meniu]')).toHaveCount(0)

    // Descarca: dupa ultimul element al panoului, Tab duce pe butonul plin.
    const buton = butonDescarca(page)
    await buton.focus()
    await expect(buton).toHaveAttribute('aria-expanded', 'true')
    await panouDescarca(page).locator('a').last().focus()
    await page.keyboard.press('Tab')
    await expect(buton).toHaveAttribute('aria-expanded', 'false')
    await expect(panouDescarca(page)).toHaveCount(0)
  })

  // CONTRASTUL STARILOR. Textul pe `albastru-pal` e `albastru-apasat` (5,49:1), nu `albastru`
  // (4,24:1, sub AA): abaterea de la referinta din COMPONENTE.md §5.1 si docs/design/DIRECTIA.md.
  // Poarta de accesibilitate nu vede starile astea: axe ruleaza pe pagina in repaus, iar pe
  // build-ul real Descarca e filtrat si butoanele sunt inerte. Pe regula veche (text `albastru`)
  // ambele cazuri de mai jos pica pe `color-contrast`, fiecare cu un nod: butonul starii.

  test('contrast: Descarca deschis de la tastatura nu are incalcari axe', async ({ page }) => {
    await deschideStartul(page, 'contrast descarca')
    const buton = butonDescarca(page)
    await antet(page).getByRole('link', { name: ANTET.autentificare.text }).focus()
    await page.keyboard.press('Tab')
    await page.keyboard.press('Enter')
    await expect(buton).toHaveAttribute('aria-expanded', 'true')
    await expect(panouDescarca(page)).toBeVisible()
    // Mouse-ul n-a atins antetul: se masoara starea deschisa, nu hover-ul.
    await faraIncalcariInStare(page, buton, 'Descarca deschis')
  })

  test('contrast: hover pe butonul contur din erou nu are incalcari axe', async ({ page }) => {
    await deschideStartul(page, 'contrast contur')
    const contur = page.locator('main').getByRole('link', { name: EROU.butonSecundar.text })
    await contur.hover()
    await faraIncalcariInStare(page, contur, 'hover pe butonul contur')
  })
})

test.describe('sertarul intreg la 390', () => {
  test.use({ viewport: { width: 390, height: 844 } })

  async function deschideSertarul(page: Page): Promise<Locator> {
    await deschideStartul(page, 'sertar intreg')
    await page.locator('[data-hamburger]').click()
    const sertar = page.getByRole('dialog', { name: SERTAR.eticheta })
    await expect(sertar).toBeVisible()
    return sertar
  }

  async function focusulEInSertar(sertar: Locator): Promise<boolean> {
    return sertar.evaluate((d) => d.contains(document.activeElement))
  }

  test('Descarca din sertar muta focusul pe Inapoi; Tab ramane in dialog; Inapoi il intoarce', async ({ page }) => {
    const sertar = await deschideSertarul(page)
    const descarca = sertar.getByRole('button', { name: ANTET.descarca.text, exact: true })
    await descarca.focus()
    await page.keyboard.press('Enter')

    const inapoi = sertar.getByRole('button', { name: PANOU_DESCARCA.inapoi })
    await expect(inapoi).toBeFocused()

    // Doua ture complete prin sub-vedere, in ambele sensuri: focusul nu iese din dialog.
    const pasi = 2 * (await sertar.locator('a[href], button:not([disabled])').count())
    for (let i = 0; i < pasi; i++) {
      await page.keyboard.press('Tab')
      expect(await focusulEInSertar(sertar), 'Tab ' + (i + 1)).toBe(true)
    }
    for (let i = 0; i < pasi; i++) {
      await page.keyboard.press('Shift+Tab')
      expect(await focusulEInSertar(sertar), 'Shift+Tab ' + (i + 1)).toBe(true)
    }

    await inapoi.focus()
    await page.keyboard.press('Enter')
    await expect(descarca).toBeFocused()
  })

  test('capcana de focus: focusul ajuns in afara dialogului revine in sertar la Tab si la Shift+Tab', async ({ page }) => {
    // Clasa defectului de mai sus, fara sub-vedere: orice cale prin care focusul scapa (un element
    // demontat, un script) nu are voie sa lase Tab-ul sa mearga mai departe prin pagina de sub fundal.
    const sertar = await deschideSertarul(page)
    const afara = page.locator('#zona-continut a[href]')
    expect(await afara.count(), 'pagina nu are legaturi sub sertar: proba n-ar masura nimic').toBeGreaterThan(2)

    await afara.nth(1).focus()
    expect(await focusulEInSertar(sertar), 'controlul: focusul chiar e in afara').toBe(false)
    await page.keyboard.press('Tab')
    expect(await focusulEInSertar(sertar), 'Tab').toBe(true)

    await afara.nth(2).focus()
    expect(await focusulEInSertar(sertar), 'controlul: focusul chiar e in afara').toBe(false)
    await page.keyboard.press('Shift+Tab')
    expect(await focusulEInSertar(sertar), 'Shift+Tab').toBe(true)
  })
})

test.describe('posta marcii', () => {
  test.use({ viewport: { width: 1440, height: 900 } })

  /** Orice adresa de posta dintr-un text. Controlul ei: pe copie gaseste adresa sintetica. */
  const ADRESA = /[\w.+-]+@[\w-]+(?:\.[\w-]+)+/g

  /**
   * Posta pe pagina deschisa, pentru un build facut cu adresa `adresa` ('' = fara adresa confirmata).
   * Fara adresa: nicio adresa in text si niciun `mailto:`. Cu adresa: doua afisari (randul de sub
   * intrebari si randul din brand) si patru legaturi (cele doua, plus "Ajutor prin e-mail" si
   * iconita de posta din subsol), toate catre ea, si nicio alta adresa - forma de dinainte de
   * 24.09, cu adresa buna.
   */
  async function verificaPosta(page: Page, adresa: string, eticheta: string): Promise<void> {
    const text = await page.evaluate(() => document.body.innerText)
    const gasite = text.match(ADRESA) ?? []
    const mailto = page.locator('a[href^="mailto:"]')
    console.log('[posta ' + eticheta + '] innerWidth CITIT: ' + (await page.evaluate(() => window.innerWidth))
      + ' | adresa ceruta: ' + (adresa === '' ? '(niciuna)' : adresa)
      + ' | adrese in text: ' + gasite.length + ' | mailto: ' + (await mailto.count()))
    // Controlul: pagina chiar are sectiunea intrebarilor si subsolul, deci zeroul nu vine din lipsa lor.
    await expect(page.locator('#intrebari')).toHaveCount(1)
    await expect(page.locator('footer')).toHaveCount(1)
    if (adresa === '') {
      expect(gasite).toEqual([])
      await expect(mailto).toHaveCount(0)
      return
    }
    const catreAdresa = page.locator('a[href="mailto:' + adresa + '"]')
    expect(gasite).toEqual([adresa, adresa])
    await expect(mailto).toHaveCount(4)
    await expect(catreAdresa).toHaveCount(4)
    await expect(page.locator('#intrebari').locator(catreAdresa)).toHaveText(adresa)
    await expect(page.locator('footer').locator(catreAdresa)).toHaveCount(3)
  }

  // Pagina reala urmeaza configurarea marcii, citita aici din acelasi `config/brand.json` din care
  // s-a construit: fara adresa, zero adrese si zero `mailto:`; cu o adresa confirmata de owner,
  // proba cere adresa lui si nu se inroseste (critic, runda 1: forma veche pica pe lucrul corect).
  test('build-ul real arata posta exact cum o cere config/brand.json', async ({ page, request }) => {
    const servit = await (await request.get('/')).text()
    const inServit = servit.match(ADRESA) ?? []
    console.log('[posta reala] adrese in HTML servit: ' + inServit.length)
    if (BRAND.email === '') {
      expect(inServit).toEqual([])
      expect(servit).not.toContain('mailto:')
    } else {
      expect(inServit.length).toBeGreaterThan(0)
      expect(inServit.filter((a) => a !== BRAND.email)).toEqual([])
    }
    await page.goto('/', { waitUntil: 'networkidle' })
    await verificaPosta(page, BRAND.email, 'reala')
  })

  test('martor POZITIV: pe copie, adresa sintetica apare in intrebari si in subsol', async ({ page }) => {
    await deschideStartul(page, 'posta pe copie')
    await verificaPosta(page, POSTA_SINTETICA, 'copie')
  })
})
