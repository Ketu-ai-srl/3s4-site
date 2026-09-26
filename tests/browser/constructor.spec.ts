import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Browser, type Page } from '@playwright/test'
import { SCENARII } from '../../src/content/acasa-constructor'
import { IMPACTURI_BLOCANTE } from './ajutor/detectori'

/**
 * Constructorul pe industrii de pe start (felia `constructor`, valul S4-2; fisa
 * `acasa-constructor.md`), in browser: starea statica, lumea celor 9 industrii, tema inchisa cu
 * antetul plecat, alinierea automata, programul pasilor, oprirea la iesire, chestionarul, duelul,
 * estimarea, CTA-ul cu parametri, miscarea redusa si accesibilitatea pe ambele teme.
 *
 * INALTIMILE sunt cele masurate pe referinta (§6.3, §10.1, chestionarul deschis din §0), cu ±3 px
 * pe fiecare industrie, la 1440 si la 390. Textele sunt ale noastre, dar asezate pe acelasi numar de
 * randuri ca ale referintei la ambele latimi (masurat 24.09: toate cele 18 lumi in ±2,6 px), deci la
 * 390 nu e nevoie de nicio exceptie de text. O toleranta relativa (8%, cat era inainte) lasa sa
 * treaca ±104..117 px, adica orice abatere de stil: randul butoanelor, gap-ul integrarilor, pastila.
 * `innerWidth` se CITESTE din pagina. Probele ruleaza implicit cu miscare redusa
 * (playwright.config.ts); cele de timp o opresc explicit.
 */

type Latime = 390 | 1440

/** [sectiunea, cardul] dupa alegerea industriei, masurate pe referinta (acasa-constructor.md §6.3). */
const INALTIMI: Record<Latime, Record<string, [number, number]>> = {
  1440: {
    constructii: [1304, 883],
    contabilitate: [1229, 808],
    logistica: [1187, 766],
    it: [1310, 866],
    avocatura: [1413, 992],
    imobiliare: [1458, 1014],
    asigurari: [1365, 944],
    notariat: [1351, 907],
    consultanta: [1414, 994],
  },
  390: {
    constructii: [1820, 1293],
    contabilitate: [1715, 1187],
    logistica: [1749, 1222],
    it: [1748, 1197],
    avocatura: [1850, 1323],
    imobiliare: [1941, 1413],
    asigurari: [2015, 1487],
    notariat: [1900, 1349],
    consultanta: [1821, 1293],
  },
}

/** Poarta (starea statica): 52 + 100lvh + 56 la 1440, 928 la 390 (§2.1). */
const POARTA: Record<Latime, { fereastra: number; inaltime: number }> = {
  1440: { fereastra: 900, inaltime: 1008 },
  390: { fereastra: 844, inaltime: 928 },
}

/** Expandorul inchis (§10.1) si chestionarul deschis cu simularea gata (Constructii, 3 canale,
 * peste 50, "nimeni"; §0): [expandor inchis, expandor deschis, sectiunea cu el deschis]. */
const CHESTIONAR_H: Record<Latime, [number, number, number]> = {
  1440: [73, 1378.8, 2664],
  390: [106, 2123.5, 3918],
}

/** Toleranta, in pixeli, fata de inaltimile masurate pe referinta. */
const TOLERANTA_PX = 3

/** Abaterea fata de tinta, sau null cand e in toleranta. */
function abatere(valoare: number, tinta: number, toleranta = TOLERANTA_PX): string | null {
  const d = Math.round((valoare - tinta) * 10) / 10
  return Math.abs(d) > toleranta ? valoare + ' fata de ' + tinta + ' (' + (d > 0 ? '+' : '') + d + ' px)' : null
}

async function sectiune(page: Page) {
  return page.locator('#constructor').evaluate((s) => {
    const r = s.getBoundingClientRect()
    return { sus: Math.round(r.top), y: Math.round(r.top + scrollY), h: Math.round(r.height), tema: (s as HTMLElement).dataset.tema }
  })
}

async function stareAntet(page: Page) {
  return page.locator('header').first().getAttribute('data-antet')
}

async function deschide(page: Page) {
  await page.goto('/', { waitUntil: 'networkidle' })
  return page.evaluate(() => window.innerWidth)
}

/** Alege o industrie din grila si asteapta lumea (modulul ei e incarcat lenes). */
async function alege(page: Page, cod: string) {
  await page.locator('#constructor [data-industrie="' + cod + '"]').click()
  await page.waitForSelector('[data-panou]')
}

/** Adresa CTA-ului: legatura cand ruta exista, altfel elementul inert cu tinta asteptata. */
async function adresaCta(page: Page) {
  return page.locator('[data-cta-constructor] > *').first().evaluate((el) => el.getAttribute('href') ?? el.getAttribute('data-tinta-lipsa'))
}

/** Raspunde la chestionar si confirma; intoarce raspunsurile date. */
async function raspunde(page: Page, canale: string[], volum: string, cine: string) {
  const cap = page.locator('[data-chestionar] > button').first()
  if ((await cap.getAttribute('aria-expanded')) !== 'true') await cap.click()
  for (const c of ['email', 'mesaj', 'hartie']) {
    const jeton = page.locator('[data-canal="' + c + '"]')
    const apasat = (await jeton.getAttribute('aria-pressed')) === 'true'
    if (canale.includes(c) !== apasat) await jeton.click()
  }
  // ultimul canal nu se poate deselecta: se aleg intai cele cerute, apoi se scot celelalte
  for (const c of ['email', 'mesaj', 'hartie']) {
    const jeton = page.locator('[data-canal="' + c + '"]')
    if (canale.includes(c) !== ((await jeton.getAttribute('aria-pressed')) === 'true')) await jeton.click()
  }
  await page.locator('[data-volum="' + volum + '"]').click()
  await page.locator('[data-cine="' + cine + '"]').click()
  await page.locator('[data-confirma]').click()
}

test.describe('comparatia inaltimilor', () => {
  test('martor POZITIV: o abatere de 4 px e raportata (expandorul de 79,2 px de dinainte trecea de 8%)', () => {
    expect(abatere(1004, 1000)).toBe('1004 fata de 1000 (+4 px)')
    expect(abatere(79.2, 73)).toBe('79.2 fata de 73 (+6.2 px)')
  })

  test('martor NEGATIV: o abatere de 3 px nu e raportata', () => {
    expect(abatere(1003, 1000)).toBeNull()
    expect(abatere(997, 1000)).toBeNull()
  })
})

for (const latime of [1440, 390] as Latime[]) {
  test.describe('constructorul la ' + latime, () => {
    test.use({ viewport: { width: latime, height: POARTA[latime].fereastra } })

    test.describe('fara JavaScript', () => {
      test.use({ javaScriptEnabled: false })

      test('e poarta, cu inaltimea ciotului si cele 9 industrii', async ({ page }) => {
        await page.goto('/', { waitUntil: 'load' })
        const citit = await page.evaluate(() => window.innerWidth)
        const s = await sectiune(page)
        const butoane = await page.locator('#constructor [data-industrie]').count()
        console.log('[fara JS ' + latime + '] innerWidth CITIT: ' + citit + ' | sectiune ' + s.h + ' | butoane ' + butoane)
        expect(citit).toBe(latime)
        expect(butoane).toBe(9)
        expect(abatere(s.h, POARTA[latime].inaltime)).toBeNull()
        expect(s.tema).toBe('deschisa')
      })
    })

    test('fiecare industrie isi construieste lumea, cu inaltimile din fisa (±3 px), fara derapaj', async ({ page }) => {
      const citit = await deschide(page)
      expect(citit).toBe(latime)
      const abateri: string[] = []
      const linii: string[] = []
      for (const cod of Object.keys(INALTIMI[latime])) {
        await alege(page, cod)
        // miscare redusa: panoul e direct in starea finala (§15)
        await expect(page.locator('[data-panou]')).toHaveAttribute('data-panou', 'gata', { timeout: 2000 })
        await expect(page.locator('[data-procent]')).toHaveText('100%')
        const m = await page.evaluate(() => {
          const s = document.getElementById('constructor')!
          const c = document.querySelector('[data-panou]')!
          const e = document.querySelector('[data-chestionar]')!
          const zecimi = (x: number) => Math.round(x * 10) / 10
          return {
            sectiune: zecimi(s.getBoundingClientRect().height),
            card: zecimi(c.getBoundingClientRect().height),
            expandor: zecimi(e.getBoundingClientRect().height),
            derapaj: document.documentElement.scrollWidth - window.innerWidth,
            focus: document.activeElement?.textContent ?? '',
            benzi: [...document.querySelectorAll('[data-banda]')].map((b) => (b as HTMLElement).dataset.banda),
          }
        })
        const [ts, tc] = INALTIMI[latime][cod]
        linii.push(cod + ' ' + m.sectiune + '/' + ts + ' card ' + m.card + '/' + tc + ' exp ' + m.expandor)
        const a1 = abatere(m.sectiune, ts)
        const a2 = abatere(m.card, tc)
        const a3 = abatere(m.expandor, CHESTIONAR_H[latime][0], 1)
        if (a1) abateri.push(cod + ' sectiune: ' + a1)
        if (a2) abateri.push(cod + ' card: ' + a2)
        if (a3) abateri.push(cod + ' expandor inchis: ' + a3)
        expect(m.derapaj, cod + ': derapaj orizontal').toBeLessThanOrEqual(0)
        expect(m.focus, cod + ': focusul trece pe schimbarea industriei').toContain('la domenii')
        expect(m.benzi.length, cod).toBeGreaterThanOrEqual(2)
        // inapoi la grila: focusul pe primul buton
        await page.locator('[data-industrie-aleasa] button').first().click()
        await expect(page.locator('#constructor [data-industrie]').first()).toBeFocused()
      }
      console.log('[lume ' + latime + '] innerWidth CITIT: ' + citit + ' | ' + linii.join(' | '))
      expect(abateri).toEqual([])
    })
  })
}

for (const latime of [1440, 390] as Latime[]) {
  test.describe('chestionarul deschis la ' + latime, () => {
    test.use({ viewport: { width: latime, height: POARTA[latime].fereastra } })

    test('Constructii, 3 canale, 50 si peste, "nimeni": expandorul si sectiunea au inaltimile referintei (±3 px)', async ({ page }) => {
      const citit = await deschide(page)
      expect(citit).toBe(latime)
      await alege(page, 'constructii')
      await raspunde(page, ['email', 'mesaj', 'hartie'], 'v99', 'nimeni')
      // miscare redusa: scorul si estimarea apar direct dupa confirmare (§15)
      await expect(page.locator('[data-estimare]')).toBeVisible()
      await page.waitForTimeout(600)
      const m = await page.evaluate(() => {
        const zecimi = (x: number) => Math.round(x * 10) / 10
        return {
          expandor: zecimi(document.querySelector('[data-chestionar]')!.getBoundingClientRect().height),
          sectiune: zecimi(document.getElementById('constructor')!.getBoundingClientRect().height),
        }
      })
      const [, exp, sec] = CHESTIONAR_H[latime]
      console.log('[chestionar ' + latime + '] innerWidth CITIT: ' + citit + ' | expandor ' + m.expandor + '/' + exp + ' | sectiune ' + m.sectiune + '/' + sec)
      expect([abatere(m.expandor, exp), abatere(m.sectiune, sec)]).toEqual([null, null])
    })
  })
}

test.describe('primul clic pe o industrie (fara miscare redusa)', () => {
  test.use({ viewport: { width: 1440, height: 900 }, reducedMotion: 'no-preference' })

  /** Starile pe care le vede omul, cadru cu cadru, de la clic: grila, rezerva goala, lumea. */
  async function pornesteDetectorul(page: Page) {
    await page.evaluate(() => {
      const w = window as unknown as { __stari: [number, string][]; __t0: number | null }
      w.__stari = []
      w.__t0 = null
      document.addEventListener('click', () => (w.__t0 = performance.now()), { capture: true, once: true })
      const bucla = () => {
        if (w.__t0 !== null) {
          const stare = document.querySelector('[data-industrie-aleasa]')
            ? 'lume'
            : document.querySelector('[data-rezerva-lume]')
              ? 'rezerva'
              : document.querySelector('#constructor [data-industrie]')
                ? 'grila'
                : 'nimic'
          const u = w.__stari[w.__stari.length - 1]
          if (!u || u[1] !== stare) w.__stari.push([Math.round(performance.now() - w.__t0), stare])
        }
        if (w.__t0 === null || performance.now() - w.__t0 < 1000) requestAnimationFrame(bucla)
      }
      requestAnimationFrame(bucla)
    })
  }

  async function stari(page: Page) {
    return page.evaluate(() => (window as unknown as { __stari: [number, string][] }).__stari)
  }

  test('cu poarta pe ecran 1,5 s si clic de mouse, primul cadru dupa clic arata deja lumea, fara rezerva goala', async ({ page }) => {
    const citit = await deschide(page)
    const { y } = await sectiune(page)
    await page.evaluate((v) => window.scrollTo({ top: v, behavior: 'instant' }), y)
    await page.waitForTimeout(1500)
    await pornesteDetectorul(page)
    const b = (await page.locator('#constructor [data-industrie="logistica"]').boundingBox())!
    await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2)
    await page.mouse.down()
    await page.mouse.up()
    await page.waitForTimeout(1100)
    const s = await stari(page)
    console.log('[primul clic] innerWidth CITIT: ' + citit + ' | stari (ms: stare): ' + s.map((x) => x[0] + ':' + x[1]).join(' '))
    expect(citit).toBe(1440)
    // Inainte de reparatie: rezerva goala in primele cadre si lumea abia la ~330 ms (Suspense).
    expect(s.map((x) => x[1])).toEqual(['lume'])
    expect(s[0][0]).toBeLessThanOrEqual(150)
  })

  test('martor POZITIV: o rezerva goala pusa pe ecran dupa clic e prinsa de acelasi detector', async ({ page }) => {
    await deschide(page)
    await pornesteDetectorul(page)
    await page.evaluate(() => {
      const grila = document.querySelector('#constructor [role="group"]')!
      const rezerva = document.createElement('div')
      rezerva.setAttribute('data-rezerva-lume', '')
      document.dispatchEvent(new MouseEvent('click'))
      grila.replaceWith(rezerva)
    })
    await page.waitForTimeout(300)
    expect((await stari(page)).map((x) => x[1])).toContain('rezerva')
  })
})

test.describe('stilurile masurate ale pieselor mici', () => {
  test('pastila de propunere are varianta fiecarei scene (26,5 / 25,8 / 29,8 / 26,5 px, rand 1,6)', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await deschide(page)
    const asteptat: Record<string, number> = { logistica: 26.5, it: 25.8, imobiliare: 29.8, consultanta: 26.5 }
    const gasit: Record<string, number> = {}
    for (const cod of Object.keys(asteptat)) {
      await alege(page, cod)
      await expect(page.locator('[data-panou]')).toHaveAttribute('data-panou', 'gata')
      gasit[cod] = await page
        .locator('[data-panou] [class*="Scene_pastila__"]')
        .first()
        .evaluate((el) => Math.round(el.getBoundingClientRect().height * 10) / 10)
      await page.locator('[data-industrie-aleasa] button').first().click()
    }
    console.log('[pastile] ' + JSON.stringify(gasit))
    for (const cod of Object.keys(asteptat)) expect(abatere(gasit[cod], asteptat[cod], 0.5), cod).toBeNull()
  })

  test('la 390 randul de integrari are 48,9 px si punctul ramane la capatul randului 1', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    const citit = await deschide(page)
    await alege(page, 'imobiliare')
    await expect(page.locator('[data-panou]')).toHaveAttribute('data-panou', 'gata')
    const m = await page.locator('[data-panou] [class*="Panou_integrari__"]').evaluate((rand) => {
      const r = rand.getBoundingClientRect()
      const punct = rand.querySelector('[class*="Panou_punct__"]')!.getBoundingClientRect()
      const elemente = [...rand.querySelectorAll('[class*="Panou_elementIntegrare__"]')].map((e) => e.getBoundingClientRect())
      return { h: Math.round(r.height * 10) / 10, punct: Math.round(punct.top), primul: Math.round(elemente[0].top), alDoilea: Math.round(elemente[1].top) }
    })
    console.log('[integrari 390] innerWidth CITIT: ' + citit + ' | ' + JSON.stringify(m))
    expect(citit).toBe(390)
    expect(abatere(m.h, 48.9, 1)).toBeNull()
    // randul se rupe: al doilea element coboara, punctul ramane pe randul primului
    expect(m.alDoilea).toBeGreaterThan(m.primul)
    expect(m.punct).toBe(m.primul)
  })

  test('focusul din chestionar e alb pe tema inchisa (cel putin 3:1) si albastru pe cea deschisa', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await deschide(page)
    await alege(page, 'constructii')
    const cap = page.locator('[data-chestionar] > button').first()
    await cap.click()
    // Focus FARA derulare: un focus care aduce elementul in fereastra muta sectiunea in banda din
    // mijloc si schimba chiar tema masurata. Tasta Shift trece navigatorul pe modul tastatura, ca
    // elementul sa fie `:focus-visible` dupa clicurile de mai sus.
    const culoare = async (loc: ReturnType<Page['locator']>) => {
      await loc.evaluate((el) => (el as HTMLElement).focus({ preventScroll: true }))
      await page.keyboard.press('Shift')
      return loc.evaluate((el) => (el.matches(':focus-visible') ? getComputedStyle(el).outlineColor : 'fara focus vizibil'))
    }
    const { y } = await sectiune(page)
    await page.evaluate((v) => window.scrollTo({ top: v, behavior: 'instant' }), y)
    await expect.poll(async () => (await sectiune(page)).tema).toBe('inchisa')
    const inchisa = [await culoare(cap), await culoare(page.locator('[data-canal="email"]'))]
    expect((await sectiune(page)).tema).toBe('inchisa')
    await page.evaluate((v) => window.scrollTo({ top: v - 600, behavior: 'instant' }), y)
    await expect.poll(async () => (await sectiune(page)).tema).toBe('deschisa')
    const deschisa = [await culoare(cap), await culoare(page.locator('[data-canal="email"]'))]
    expect((await sectiune(page)).tema).toBe('deschisa')
    console.log('[focus] inchisa: ' + inchisa.join(' / ') + ' | deschisa: ' + deschisa.join(' / '))
    // martorul NEGATIV e tema deschisa: acelasi selector, acelasi element, albastrul referintei
    expect(inchisa).toEqual(['rgb(255, 255, 255)', 'rgb(255, 255, 255)'])
    expect(deschisa).toEqual(['rgb(37, 99, 235)', 'rgb(37, 99, 235)'])
  })
})

test.describe('tema inchisa si antetul', () => {
  test.use({ viewport: { width: 1440, height: 900 } })

  test('cat sectiunea taie banda din mijloc: strat inchis si antet plecat; in afara, revin', async ({ page }) => {
    const citit = await deschide(page)
    const { y } = await sectiune(page)
    // varful la 300 px: sectiunea taie banda 441-459 -> tema inchisa
    await page.evaluate((v) => window.scrollTo({ top: v - 300, behavior: 'instant' }), y)
    await expect.poll(async () => (await sectiune(page)).tema).toBe('inchisa')
    await expect.poll(() => stareAntet(page)).toBe('plecat')
    const strat = await page.locator('#constructor > div').first().evaluate((el) => getComputedStyle(el).opacity)
    // varful la 600 px: sectiunea e sub banda -> tema deschisa, antetul revine
    await page.evaluate((v) => window.scrollTo({ top: v - 600, behavior: 'instant' }), y)
    await expect.poll(async () => (await sectiune(page)).tema).toBe('deschisa')
    await expect.poll(() => stareAntet(page)).not.toBe('plecat')
    console.log('[tema] innerWidth CITIT: ' + citit + ' | opacitatea stratului pe inchis: ' + strat)
    expect(citit).toBe(1440)
    expect(strat).toBe('1')
  })
})

test.describe('alinierea automata (fara miscare redusa)', () => {
  test.use({ viewport: { width: 1440, height: 900 }, reducedMotion: 'no-preference' })

  test('martor POZITIV: derularea cu rotita, venind de sus, aliniaza sectiunea la varf', async ({ page }) => {
    await deschide(page)
    const { y } = await sectiune(page)
    await page.mouse.move(720, 450)
    let derulat = 0
    while (derulat < y - 520) {
      await page.mouse.wheel(0, 200)
      derulat += 200
      await page.waitForTimeout(30)
    }
    await expect.poll(async () => Math.abs((await sectiune(page)).sus), { timeout: 4000 }).toBeLessThanOrEqual(2)
    expect((await sectiune(page)).tema).toBe('inchisa')
  })

  test('martor NEGATIV: derularea programatica (ancora, scriptul) nu e deturnata', async ({ page }) => {
    await deschide(page)
    const { y } = await sectiune(page)
    await page.evaluate((v) => window.scrollTo({ top: v - 300, behavior: 'instant' }), y)
    await page.waitForTimeout(1200)
    const s = await sectiune(page)
    expect(s.tema).toBe('inchisa')
    expect(s.sus).toBe(300)
  })
})

test.describe('programul panoului (fara miscare redusa)', () => {
  test.use({ viewport: { width: 1440, height: 900 }, reducedMotion: 'no-preference' })

  test('benzile se bifeaza in ordinea scenei, iar finalul vine dupa ~7,1 s (Constructii)', async ({ page }) => {
    await deschide(page)
    await page.evaluate(() => {
      const w = window as unknown as { __cronologie: { t: number; ce: string }[]; __t0: number }
      w.__cronologie = []
      w.__t0 = 0
      document.addEventListener('click', () => (w.__t0 = performance.now()), { capture: true, once: true })
      new MutationObserver((ms) => {
        for (const m of ms) {
          const el = m.target as HTMLElement
          if (m.attributeName === 'data-banda' && el.dataset.banda === 'gata') {
            const i = [...document.querySelectorAll('[data-banda]')].indexOf(el)
            w.__cronologie.push({ t: performance.now() - w.__t0, ce: 'banda ' + i })
          }
          if (m.attributeName === 'data-panou' && el.dataset.panou === 'gata') w.__cronologie.push({ t: performance.now() - w.__t0, ce: 'final' })
        }
      }).observe(document.body, { subtree: true, attributes: true, attributeFilter: ['data-banda', 'data-panou'] })
    })
    await alege(page, 'constructii')
    await expect(page.locator('[data-panou]')).toHaveAttribute('data-panou', 'gata', { timeout: 12000 })
    const c = await page.evaluate(() => (window as unknown as { __cronologie: { t: number; ce: string }[] }).__cronologie)
    console.log('[program] ' + c.map((x) => x.ce + '@' + Math.round(x.t)).join(' '))
    // §7.1: T1 bifeaza banda 3 (alarma garantiei), T2 banda 1 (anuntul revizie), T3 banda 2 (atasarea PV-ului).
    expect(c.map((x) => x.ce)).toEqual(['banda 2', 'banda 0', 'banda 1', 'final'])
    const final = c[c.length - 1].t
    expect(final).toBeGreaterThanOrEqual(7090)
    expect(final).toBeLessThanOrEqual(7090 + 900)
  })

  test('iesirea din fereastra opreste programul; intoarcerea il reia de la 0 si il termina', async ({ page }) => {
    await deschide(page)
    await alege(page, 'logistica')
    await page.waitForTimeout(800)
    // sectiunea iese din fereastra (sub 15% vizibil)
    await page.evaluate(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'instant' }))
    await page.waitForTimeout(8000)
    await expect(page.locator('[data-panou]')).toHaveAttribute('data-panou', 'in-lucru')
    const { y } = await sectiune(page)
    await page.evaluate((v) => window.scrollTo({ top: v, behavior: 'instant' }), y)
    await expect.poll(() => page.locator('[data-procent]').textContent(), { timeout: 1500 }).not.toBe('100%')
    await expect(page.locator('[data-panou]')).toHaveAttribute('data-panou', 'gata', { timeout: 10000 })
  })
})

test.describe('miscarea redusa', () => {
  test.use({ viewport: { width: 1440, height: 900 } })

  test('la 350 ms dupa clic panoul e la 100%, cu benzile bifate si randul final', async ({ page }) => {
    await deschide(page)
    await alege(page, 'asigurari')
    await page.waitForTimeout(350)
    await expect(page.locator('[data-procent]')).toHaveText('100%')
    const benzi = await page.locator('[data-banda]').evaluateAll((b) => b.map((x) => (x as HTMLElement).dataset.banda))
    // Asigurari: banda canalelor + 3 ale scenei; autorizatia de reparatie NU se bifeaza (actul lipseste)
    expect(benzi).toEqual(['gata', 'gata', 'gata', 'asteapta'])
    expect((await sectiune(page)).tema).toBe('inchisa')
  })
})

test.describe('chestionarul, duelul si estimarea', () => {
  test.use({ viewport: { width: 1440, height: 900 } })

  test('dezvaluirea pe rand, confirmarea, banda canalelor si CTA-ul cu parametrii contractului', async ({ page }) => {
    await deschide(page)
    await alege(page, 'constructii')
    expect(await page.locator('[data-banda]').count()).toBe(3)
    const cap = page.locator('[data-chestionar] > button').first()
    await cap.click()
    await expect(cap).toHaveAttribute('aria-expanded', 'true')
    const pasi = page.locator('[data-pas]')
    await expect(pasi.nth(1)).toHaveAttribute('data-pas', 'ascuns')
    await page.locator('[data-canal="email"]').click()
    await expect(pasi.nth(1)).toHaveAttribute('data-pas', 'vizibil')
    await expect(pasi.nth(2)).toHaveAttribute('data-pas', 'ascuns')
    // martorul regulii: ultimul canal ramas nu se deselecteaza
    await page.locator('[data-canal="email"]').click()
    await expect(page.locator('[data-canal="email"]')).toHaveAttribute('aria-pressed', 'true')
    await raspunde(page, ['email', 'mesaj', 'hartie'], 'v99', 'nimeni')
    // confirmarea: panoul se reia cu banda canalelor in fata (3 -> 4 benzi)
    await expect(page.locator('[data-banda]')).toHaveCount(4)
    await expect(page.locator('[data-duel]')).toHaveAttribute('data-duel', 'gata')
    await expect(page.locator('[data-nesortate]')).toHaveText('26')
    await expect(page.locator('[data-estimare]')).toHaveAttribute('data-estimare', '110')
    expect(await adresaCta(page)).toBe('/inregistrare?ind=constructii&src=email,mesaj,hartie&vol=v99&who=nimeni')
    // dupa confirmare, o schimbare recalculeaza pe loc
    await page.locator('[data-volum="v10"]').click()
    await expect(page.locator('[data-estimare]')).toHaveAttribute('data-estimare', '15')
    expect(await adresaCta(page)).toBe('/inregistrare?ind=constructii&src=email,mesaj,hartie&vol=v10&who=nimeni')
  })

  test('precompletarea: Avocatura vine cu raspunsurile gata, iar prima atingere dezvaluie tot', async ({ page }) => {
    await deschide(page)
    await alege(page, 'avocatura')
    // banda canalelor e pe ecran de la inceput (§6.3): L = 4
    expect(await page.locator('[data-banda]').count()).toBe(4)
    await page.locator('[data-chestionar] > button').first().click()
    await expect(page.locator('[data-canal="email"]')).toHaveAttribute('aria-pressed', 'true')
    await expect(page.locator('[data-canal="hartie"]')).toHaveAttribute('aria-pressed', 'true')
    await expect(page.locator('[data-pas]').nth(1)).toHaveAttribute('data-pas', 'ascuns')
    await page.locator('[data-canal="mesaj"]').click()
    for (const i of [1, 2, 3]) await expect(page.locator('[data-pas]').nth(i)).toHaveAttribute('data-pas', 'vizibil')
    await expect(page.locator('[data-confirma]')).toBeEnabled()
  })

  test('raspunsurile raman la schimbarea industriei', async ({ page }) => {
    await deschide(page)
    await alege(page, 'contabilitate')
    await raspunde(page, ['mesaj'], 'v50', 'coleg')
    await page.locator('[data-industrie-aleasa] button').first().click()
    await alege(page, 'logistica')
    await expect(page.locator('[data-chestionar]')).toHaveAttribute('data-chestionar', 'deschis')
    await expect(page.locator('[data-volum="v50"]')).toHaveAttribute('aria-checked', 'true')
    expect(await adresaCta(page)).toBe('/inregistrare?ind=logistica&src=mesaj&vol=v50&who=coleg')
  })
})

test.describe('simularea in timp real (fara miscare redusa)', () => {
  test.use({ viewport: { width: 1440, height: 900 }, reducedMotion: 'no-preference' })

  test('8 documente la 1150 ms: scorul la final, iar estimarea apare abia dupa simulare', async ({ page }) => {
    await deschide(page)
    await alege(page, 'constructii')
    await raspunde(page, ['email'], 'v10', 'eu')
    const duel = page.locator('[data-duel]')
    await duel.evaluate((d) => window.scrollTo({ top: d.getBoundingClientRect().top + scrollY - 100, behavior: 'instant' }))
    await page.waitForTimeout(2500)
    await expect(duel).toHaveAttribute('data-duel', 'ruleaza')
    await expect(page.locator('[data-pas]').nth(5)).toHaveAttribute('data-pas', 'ascuns')
    await expect(duel).toHaveAttribute('data-duel', 'gata', { timeout: 12000 })
    await expect(page.locator('[data-nesortate]')).toHaveText('8')
    await expect(page.locator('[data-pas]').nth(5)).toHaveAttribute('data-pas', 'vizibil')
    await expect(page.locator('[data-estimare]')).toHaveAttribute('data-estimare', '12')
  })
})

// --- Performanta: primul clic pe o industrie (plan §8.4) ---------------------------------------

/**
 * Bugetul din plan (§8.4): INP de cel mult 200 ms, masurat la 390 cu procesorul incetinit. Aici
 * incetinirea e de 4 ori (ca in profilul mobil al Lighthouse), prin CDP, iar masura e durata Event
 * Timing a clicului: de la eveniment pana la primul cadru de dupa el, pe gestul intreg (pointerdown,
 * pointerup si click au acelasi `interactionId`). Primul clic de pe o pagina proaspata e cazul
 * greu: codul lumii ruleaza atunci prima oara.
 *
 * PROCEDURA: incetinirea porneste inaintea incarcarii si tine toata vizita, ca pe un telefon lent.
 * Mediana a 3 pagini proaspete, fiecare intr-un context nou (fara cache de cod de la rularea
 * dinainte). Cursorul sta pe buton 400 ms inainte de apasare, cum face un om cu mouse-ul: altfel
 * mutarea si apasarea cad in aceeasi sarcina, iar masura ar cuprinde si reactia la hover.
 *
 * DE CE INCETINIREA DE LA INCARCARE, nu doar la clic (masurat 25.09, cate 3 pagini): cu
 * incetinirea pornita abia dupa incarcare, varianta veche (panoul intreg asezat in clic) dadea
 * 192-240 ms, adica abia peste prag, iar cea reparata 64-104 ms. Cu procedura de aici, varianta
 * veche da 352-416 ms, iar cea reparata 72-88 ms. Prima procedura ar fi lasat sa treaca o regresie
 * reala pe un calculator ceva mai rapid.
 *
 * MARTORUL POZITIV trece prin aceeasi masura cu un clic facut lent pe loc (un ascultator care tine
 * firul principal 250 ms): daca masura nu il vede peste prag, ea nu masoara clicul.
 */
const PRAG_INP_MS = 200
const INCETINIRE_CPU = 4

async function duratiaPrimuluiClic(browser: Browser, baza: string, lentPeLoc = 0): Promise<{ durata: number; latime: number }> {
  const context = await browser.newContext({ baseURL: baza, viewport: { width: 390, height: 844 }, reducedMotion: 'no-preference' })
  try {
    await context.addInitScript(() => {
      const w = window as unknown as { __gesturi: { nume: string; id: number; durata: number }[] }
      w.__gesturi = []
      // `interactionId` lipseste din tipurile DOM ale TypeScript-ului de aici, desi Chromium il da.
      type Intrare = PerformanceEntry & { interactionId?: number }
      new PerformanceObserver((lista) => {
        for (const e of lista.getEntries() as Intrare[]) {
          if (e.interactionId) w.__gesturi.push({ nume: e.name, id: e.interactionId, durata: e.duration })
        }
      }).observe({ type: 'event', buffered: true, durationThreshold: 16 } as PerformanceObserverInit)
    })
    const page = await context.newPage()
    const cdp = await context.newCDPSession(page)
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: INCETINIRE_CPU })
    await page.goto('/', { waitUntil: 'networkidle' })
    const latime = await page.evaluate(() => window.innerWidth)
    const { y } = await sectiune(page)
    await page.evaluate((v) => window.scrollTo({ top: v, behavior: 'instant' }), y)
    await page.waitForTimeout(1500)
    const b = (await page.locator('#constructor [data-industrie="constructii"]').boundingBox())!
    await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2)
    await page.waitForTimeout(400)
    await page.evaluate((ms) => {
      ;(window as unknown as { __gesturi: unknown[] }).__gesturi = []
      if (ms > 0) {
        document.addEventListener(
          'click',
          () => {
            const t = performance.now()
            while (performance.now() - t < ms) {
              // firul principal ramane ocupat: clicul se face lent pe loc
            }
          },
          { capture: true, once: true },
        )
      }
    }, lentPeLoc)
    await page.mouse.down()
    await page.mouse.up()
    await page.waitForSelector('[data-industrie-aleasa]')
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

test.describe('primul clic pe o industrie, la 390 cu procesorul incetinit de 4 ori', () => {
  test('durata Event Timing a clicului: mediana a 3 pagini proaspete e cel mult 200 ms', async ({ browser, baseURL }) => {
    test.setTimeout(150_000)
    const rulari: number[] = []
    for (let i = 0; i < 3; i++) {
      const { durata, latime } = await duratiaPrimuluiClic(browser, baseURL!)
      expect(latime).toBe(390)
      rulari.push(durata)
    }
    const mediana = [...rulari].sort((a, b) => a - b)[1]
    console.log('[INP 390 x' + INCETINIRE_CPU + '] innerWidth CITIT: 390 | rulari (ms): ' + rulari.join(' / ') + ' | mediana ' + mediana)
    expect(mediana).toBeLessThanOrEqual(PRAG_INP_MS)
  })

  test('martor POZITIV: un clic facut lent pe loc (250 ms) iese peste prag prin aceeasi masura', async ({ browser, baseURL }) => {
    test.setTimeout(90_000)
    const { durata, latime } = await duratiaPrimuluiClic(browser, baseURL!, 250)
    console.log('[INP martor] innerWidth CITIT: ' + latime + ' | durata ' + durata + ' ms')
    expect(latime).toBe(390)
    expect(durata).toBeGreaterThan(PRAG_INP_MS)
  })
})

// --- Pachetul paginii: continutul scenelor vine cu lumea -----------------------------------------

/**
 * Sabloanele de fisier ale duelurilor (cu `{n}`, numai caractere ASCII): siruri care exista doar in
 * continutul scenelor, deci gasite intr-o bucata JS arata unde a ajuns acel continut. Se iau din
 * continut la rulare, nu se scriu aici.
 */
function sondeContinut(): string[] {
  return Object.values(SCENARII)
    .flatMap((s) => s.duel.fisiere.map((f) => f.sablon))
    .filter((x) => /^[\x20-\x7e]+$/.test(x))
}

test.describe('pachetul paginii de start', () => {
  test('scriptele din HTML nu poarta continutul scenelor; il aduce bucata lumii, dupa import', async ({ page, request }) => {
    const sonde = sondeContinut()
    expect(sonde.length).toBeGreaterThanOrEqual(10)
    const html = await (await request.get('/')).text()
    const initiale = [...html.matchAll(/<script src="([^"]+\.js)"/g)].map((m) => m[1])
    expect(initiale.length).toBeGreaterThanOrEqual(3)
    const cuContinut: string[] = []
    for (const src of initiale) {
      const js = await (await request.get(src)).text()
      if (sonde.some((s) => js.includes(s))) cuContinut.push(src)
    }
    // martorul POZITIV: dupa alegerea unei industrii, pagina a primit o bucata cu toate sondele
    await page.goto('/', { waitUntil: 'networkidle' })
    await alege(page, 'constructii')
    const cerute = await page.evaluate(() =>
      performance
        .getEntriesByType('resource')
        .map((r) => r.name)
        .filter((n) => n.endsWith('.js')),
    )
    const cuToateSondele: string[] = []
    for (const url of cerute) {
      const js = await (await request.get(url)).text()
      if (sonde.every((s) => js.includes(s))) cuToateSondele.push(url.split('/').pop()!)
    }
    console.log('[pachet] scripte in HTML: ' + initiale.length + ' | cu continutul scenelor: ' + cuContinut.length + ' | bucati cu toate cele ' + sonde.length + ' sonde, dupa clic: ' + cuToateSondele.join(', '))
    expect(cuContinut).toEqual([])
    expect(cuToateSondele.length).toBeGreaterThanOrEqual(1)
  })
})

// --- Arborele 3D: montat numai de la 1341 px (§8) ------------------------------------------------

for (const [latime, asteptat] of [
  [1340, 0],
  [1341, 1],
] as const) {
  test.describe('arborele la ' + latime, () => {
    test.use({ viewport: { width: latime, height: 900 } })

    test('gazda arborelui e in lume: ' + asteptat, async ({ page }) => {
      const citit = await deschide(page)
      await alege(page, 'logistica')
      const gazde = await page.locator('[data-industrie-aleasa] [class*="Panou_arbore__"]').count()
      console.log('[arbore] innerWidth CITIT: ' + citit + ' | gazde: ' + gazde)
      expect(citit).toBe(latime)
      expect(gazde).toBe(asteptat)
    })
  })
}

/** Axe numai pe sectiunea constructorului, cu pragul portii de accesibilitate (PA-03). */
async function axeConstructor(page: Page) {
  const r = await new AxeBuilder({ page }).include('#constructor').analyze()
  return r.violations.filter((v) => IMPACTURI_BLOCANTE.includes(v.impact ?? '')).map((v) => v.id + ' x' + v.nodes.length)
}

test.describe('accesibilitatea lumii, pe ambele teme', () => {
  test.use({ viewport: { width: 1440, height: 900 } })

  test('martor NEGATIV: lumea cu chestionarul, duelul si estimarea nu are incalcari grave', async ({ page }) => {
    await deschide(page)
    await alege(page, 'imobiliare')
    await raspunde(page, ['email', 'hartie'], 'v99', 'coleg')
    await expect(page.locator('[data-estimare]')).toBeVisible()
    // Masuratoarea se face cu capul sectiunii IN fereastra: stratul inchis e fix, deci axe il vede
    // sub text numai acolo; un text din afara ferestrei ar fi masurat pe albul paginii.
    const { y } = await sectiune(page)
    await page.evaluate((v) => window.scrollTo({ top: v, behavior: 'instant' }), y)
    await expect.poll(async () => (await sectiune(page)).tema).toBe('inchisa')
    const inchisa = await axeConstructor(page)
    await page.evaluate((v) => window.scrollTo({ top: v - 600, behavior: 'instant' }), y)
    await expect.poll(async () => (await sectiune(page)).tema).toBe('deschisa')
    const deschisa = await axeConstructor(page)
    console.log('[axe] inchisa: ' + (inchisa.join(', ') || '0') + ' | deschisa: ' + (deschisa.join(', ') || '0'))
    expect(inchisa).toEqual([])
    expect(deschisa).toEqual([])
  })

  test('martor POZITIV: un text slab injectat in lume e prins de acelasi detector', async ({ page }) => {
    await deschide(page)
    await alege(page, 'imobiliare')
    await page.locator('[data-panou]').evaluate((c) => {
      const p = document.createElement('p')
      p.textContent = 'Text de proba cu contrast prea mic'
      p.style.cssText = 'color:#2a3446;font-size:12px'
      c.appendChild(p)
    })
    expect((await axeConstructor(page)).some((v) => v.startsWith('color-contrast'))).toBe(true)
  })
})
