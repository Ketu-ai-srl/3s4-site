import { expect, test, type Page } from '@playwright/test'
import { masoaraAccesibilitatea } from './ajutor/detectori'

/**
 * Probele de browser ale feliei flux-efacturare (/flux-documente, /e-facturare, calendarul .ics).
 *
 *   - scena lipita: pregatita numai cu miscare permisa, legata de derulare (la derulare fixa nimic
 *     nu se misca), faza a doua si pasii pe rand; la miscare redusa, statica si cu tot textul vizibil;
 *   - selectorul de domenii: tabindex itinerant, sageti / Home / End muta focusul si selectia;
 *     machetele asteapta sub ecran si pornesc la vedere, nu la incarcare;
 *   - rigla: la 390 eticheta benzii NU se suprapune peste anii ramasi (defectul referintei);
 *   - calendarul: servit ca text/calendar, cu o alarma pe fiecare eveniment.
 *
 * `innerWidth` se citeste din pagina la fiecare masuratoare si se tipareste.
 */

async function latime(page: Page): Promise<number> {
  return page.evaluate(() => window.innerWidth)
}

/** Deruleaza pinul scenei la distanta `u` pe scara de 1800 si asteapta doua cadre. */
async function laDistanta(page: Page, u: number): Promise<void> {
  await page.evaluate((u) => {
    const pin = document.querySelector('[data-scena-flux]') as HTMLElement
    const sus = pin.getBoundingClientRect().top + window.scrollY
    const drum = pin.offsetHeight - window.innerHeight
    // Instant: la miscare permisa html are derulare lina, iar masuratoarea ar prinde drumul, nu tinta.
    window.scrollTo({ top: sus + (u / 1800) * drum, behavior: 'instant' })
  }, u)
  await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))))
}

/** Chenarul cipului stampilat in faza a doua, contra culorii albastre a temei. */
async function chenarStampilat(page: Page): Promise<{ chenar: string; albastru: string }> {
  return page.evaluate(() => {
    const d = document.querySelector('[data-scena-flux] [data-stampilat="da"]') as HTMLElement | null
    const proba = document.createElement('span')
    proba.style.color = 'var(--color-albastru)'
    document.body.appendChild(proba)
    const albastru = getComputedStyle(proba).color
    proba.remove()
    return { chenar: d ? getComputedStyle(d).borderTopColor : 'lipsa', albastru }
  })
}

test.describe('scena lipita, miscare permisa, 1440x900', () => {
  test.use({ reducedMotion: 'no-preference', viewport: { width: 1440, height: 900 } })

  test('se pregateste, trece in faza a doua si aprinde pasii pe rand', async ({ page }) => {
    await page.goto('/flux-documente', { waitUntil: 'networkidle' })
    const pin = page.locator('[data-scena-flux]')
    await expect(pin).toHaveAttribute('data-gata', 'da')
    const inaltime = await pin.evaluate((el) => el.getBoundingClientRect().height)
    console.log('[scena] innerWidth CITIT: ' + (await latime(page)) + ' | inaltimea pinului: ' + inaltime)
    // 300lvh la o fereastra de 900.
    expect(Math.round(inaltime)).toBe(2700)

    await laDistanta(page, 400)
    await expect(pin).toHaveAttribute('data-faza', '1')
    await laDistanta(page, 1000)
    await expect(pin).toHaveAttribute('data-faza', '2')
    const stari = await page.locator('[data-scena-flux] li').evaluateAll((l) => l.map((e) => (e as HTMLElement).dataset.stare))
    console.log('[scena] la u=1000 pasii: ' + JSON.stringify(stari))
    // Pasii devin curenti la 858 si 958: la 1000 primul e trecut, al doilea e curent.
    expect(stari).toEqual(['on', 'now', '', '', ''])
    // Cipul stampilat primeste chenarul albastru (regula lui trebuie sa bata specificitatea pinului).
    const c = await chenarStampilat(page)
    console.log('[scena] 1440 cip stampilat: ' + JSON.stringify(c))
    expect(c.chenar).toBe(c.albastru)
    expect(c.chenar).not.toBe('rgb(226, 232, 240)')
  })

  test('pozitiile sunt legate de derulare: la derulare fixa documentul nu se misca', async ({ page }) => {
    await page.goto('/flux-documente', { waitUntil: 'networkidle' })
    await laDistanta(page, 280)
    const doc = page.locator('[data-scena-flux] [aria-hidden="true"]', { hasText: 'Factura_F2026-0412.pdf' }).first()
    const a = await doc.evaluate((el) => (el as HTMLElement).style.transform)
    await page.waitForTimeout(600)
    const b = await doc.evaluate((el) => (el as HTMLElement).style.transform)
    console.log('[scena] transform la 0 ms: ' + a + ' | la 600 ms: ' + b)
    expect(a).not.toBe('')
    expect(b).toBe(a)
  })

  test('machetele domeniilor asteapta sub ecran si pornesc la vedere', async ({ page }) => {
    await page.goto('/flux-documente', { waitUntil: 'networkidle' })
    const zona = page.locator('[data-panouri-domenii]')
    await expect(zona).toHaveAttribute('data-stare', 'asteapta')
    await zona.scrollIntoViewIfNeeded()
    await expect(zona).toHaveAttribute('data-stare', 'ruleaza')
  })
})

test.describe('scena lipita, miscare permisa, 390x844', () => {
  test.use({ reducedMotion: 'no-preference', viewport: { width: 390, height: 844 } })

  test('cipul stampilat are chenar albastru in faza a doua', async ({ page }) => {
    await page.goto('/flux-documente', { waitUntil: 'networkidle' })
    const pin = page.locator('[data-scena-flux]')
    await expect(pin).toHaveAttribute('data-gata', 'da')
    await laDistanta(page, 1000)
    await expect(pin).toHaveAttribute('data-faza', '2')
    const c = await chenarStampilat(page)
    console.log('[scena] 390 innerWidth CITIT: ' + (await latime(page)) + ' | cip stampilat: ' + JSON.stringify(c))
    expect(c.chenar).toBe(c.albastru)
  })
})

test.describe('scena lipita, miscare redusa, 390x844', () => {
  test.use({ reducedMotion: 'reduce', viewport: { width: 390, height: 844 } })

  test('ramane statica si arata toate cele cinci descrieri', async ({ page }) => {
    await page.goto('/flux-documente', { waitUntil: 'networkidle' })
    const pin = page.locator('[data-scena-flux]')
    await expect(pin).not.toHaveAttribute('data-gata', /.*/)
    const opacitati = await page
      .locator('[data-scena-flux] p')
      .evaluateAll((l) => l.map((e) => getComputedStyle(e).opacity))
    console.log('[scena redusa] innerWidth CITIT: ' + (await latime(page)) + ' | opacitati: ' + JSON.stringify(opacitati))
    expect(opacitati).toEqual(['1', '1', '1', '1', '1'])
  })
})

test.describe('selectorul de domenii, tastatura', () => {
  test('tabindex itinerant; sagetile, Home si End muta focusul si selectia', async ({ page }) => {
    await page.goto('/flux-documente', { waitUntil: 'networkidle' })
    const taburi = page.getByRole('tab')
    await expect(taburi).toHaveCount(7)
    await taburi.first().focus()
    await page.keyboard.press('ArrowRight')
    await expect(taburi.nth(1)).toBeFocused()
    await expect(taburi.nth(1)).toHaveAttribute('aria-selected', 'true')
    await expect(taburi.nth(1)).toHaveAttribute('tabindex', '0')
    await expect(taburi.nth(0)).toHaveAttribute('tabindex', '-1')
    await expect(page.locator('#flux-panou-contabilitate')).toBeVisible()
    await expect(page.locator('#flux-panou-imobiliare')).toBeHidden()
    await page.keyboard.press('End')
    await expect(taburi.nth(6)).toBeFocused()
    await page.keyboard.press('ArrowRight')
    await expect(taburi.nth(0)).toBeFocused()
    await page.keyboard.press('ArrowLeft')
    await expect(taburi.nth(6)).toHaveAttribute('aria-selected', 'true')
    await page.keyboard.press('Home')
    await expect(taburi.nth(0)).toHaveAttribute('aria-selected', 'true')
    // Focus vizibil: conturul de 2 px.
    const contur = await taburi.nth(0).evaluate((e) => getComputedStyle(e).outlineWidth)
    console.log('[taburi] innerWidth CITIT: ' + (await latime(page)) + ' | contur la focus: ' + contur)
    expect(contur).toBe('2px')
  })
})

test.describe('rigla de pe /e-facturare', () => {
  test.use({ viewport: { width: 390, height: 844 } })

  test('la 390 eticheta benzii nu se suprapune peste niciun an vizibil', async ({ page }) => {
    await page.goto('/e-facturare', { waitUntil: 'networkidle' })
    const m = await suprapuneriRigla(page)
    console.log('[rigla 390] innerWidth CITIT: ' + m.latime + ' | ani vizibili: ' + m.ani + ' | suprapuneri: ' + m.suprapuse)
    // Controlul: masuratoarea chiar a vazut anii (2028, 2032, 2036).
    expect(m.ani).toBe(3)
    expect(m.suprapuse).toBe(0)
  })

  test('martor POZITIV: eticheta asezata peste ani, ca la referinta, TREBUIE prinsa', async ({ page }) => {
    await page.goto('/e-facturare', { waitUntil: 'networkidle' })
    // Forma referintei: eticheta absoluta, jos-dreapta, peste randul anilor.
    await page.addStyleTag({
      content: '[data-rigla-banda]{position:absolute!important;right:0!important;bottom:auto!important;top:80px!important;max-width:52%!important;margin:0!important}',
    })
    const m = await suprapuneriRigla(page)
    console.log('[rigla martor pozitiv] suprapuneri: ' + m.suprapuse)
    expect(m.ani).toBe(3)
    expect(m.suprapuse).toBeGreaterThan(0)
  })
})

/** Suprapunerile dintre eticheta benzii si anii vizibili ai riglei. */
async function suprapuneriRigla(page: Page) {
  await page.locator('[data-rigla]').scrollIntoViewIfNeeded()
  return page.evaluate(() => {
    const banda = document.querySelector('[data-rigla-banda]')!.getBoundingClientRect()
    const ani = [...document.querySelectorAll('[data-rigla-an]')]
      .map((e) => e.getBoundingClientRect())
      .filter((r) => r.width > 0)
    const suprapuse = ani.filter((r) => !(r.bottom <= banda.top || r.top >= banda.bottom || r.right <= banda.left || r.left >= banda.right))
    return { latime: window.innerWidth, ani: ani.length, suprapuse: suprapuse.length }
  })
}

/** Cate evenimente dintr-un .ics NU au alarma. */
function evenimenteFaraAlarma(text: string): number {
  return text
    .split('BEGIN:VEVENT')
    .slice(1)
    .filter((e) => !e.split('END:VEVENT')[0].includes('BEGIN:VALARM')).length
}

test.describe('calendarul .ics', () => {
  test('se serveste ca text/calendar, cu alarma pe fiecare eveniment', async ({ request }) => {
    const r = await request.get('/instrumente/termene.ics')
    expect(r.status()).toBe(200)
    expect(r.headers()['content-type']).toBe('text/calendar; charset=utf-8')
    const text = await r.text()
    const evenimente = (text.match(/BEGIN:VEVENT/g) ?? []).length
    const alarme = (text.match(/BEGIN:VALARM/g) ?? []).length
    console.log('[ics] evenimente: ' + evenimente + ' | alarme: ' + alarme)
    expect(evenimente).toBeGreaterThan(0)
    expect(alarme).toBe(evenimente)
    expect(evenimenteFaraAlarma(text)).toBe(0)
  })

  test('martor POZITIV: un eveniment fara alarma TREBUIE prins', () => {
    const fabricat = ['BEGIN:VCALENDAR', 'BEGIN:VEVENT', 'UID:a', 'BEGIN:VALARM', 'END:VALARM', 'END:VEVENT', 'BEGIN:VEVENT', 'UID:b', 'END:VEVENT', 'END:VCALENDAR'].join(String.fromCharCode(13, 10))
    expect(evenimenteFaraAlarma(fabricat)).toBe(1)
  })

  test('martor NEGATIV: evenimentele cu alarma NU trebuie prinse', () => {
    const fabricat = ['BEGIN:VCALENDAR', 'BEGIN:VEVENT', 'UID:a', 'BEGIN:VALARM', 'END:VALARM', 'END:VEVENT', 'END:VCALENDAR'].join(String.fromCharCode(13, 10))
    expect(evenimenteFaraAlarma(fabricat)).toBe(0)
  })
})

// axe la 1440 si la 390, cu miscarea PERMISA: poarta comuna ruleaza la 1280 cu miscare redusa, deci
// nu vede starea pregatita a scenei, starea de asteptare a machetelor si nici latimea de 390.
for (const [w, h] of [
  [1440, 900],
  [390, 844],
] as const) {
  test.describe('axe la ' + w + ', miscare permisa', () => {
    test.use({ reducedMotion: 'no-preference', viewport: { width: w, height: h } })
    for (const ruta of ['/flux-documente', '/e-facturare']) {
      test(ruta + ' nu are incalcari serious sau critical', async ({ page }) => {
        await page.goto(ruta, { waitUntil: 'networkidle' })
        const m = await masoaraAccesibilitatea(page)
        console.log('[axe ' + w + '] ' + ruta + ' | innerWidth CITIT: ' + (await latime(page)) + ' | reguli: ' + m.reguliRulate + ' | blocante: ' + m.grave.map((g) => g.regula).join(', '))
        expect(m.reguliRulate).toBeGreaterThan(0)
        expect(m.grave.map((g) => g.regula)).toEqual([])
      })
    }
  })
}
