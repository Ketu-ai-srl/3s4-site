import { expect, test, type Page } from '@playwright/test'
import { masoaraAccesibilitatea } from './ajutor/detectori'

/**
 * Paginile de solutii (felia `solutii`, S4-3): hubul si cele 7 sectoare, pe build-ul local.
 *
 * Ce se masoara, cu sursa fiecarei cifre in fisele `solutii__sablon.md` si `solutii.md`:
 *   - scena hartiilor: pornirea automata la 4,6 s de bucla activa, clicul, asamblarea in
 *     1400 + 14 x numarul foilor (62 la constructii: 2268 ms), oprirea in afara ferestrei, miscarea
 *     redusa (direct ordinea) si esecul WebGL (cardul dispare, banda ramane);
 *   - cautarea din sector: inaltimea rezervata (cardul nu creste la rezultat) si lupa de 18 px care
 *     nu se ingusteaza cand interogarea se rupe pe doua randuri (defectul sursei, neprelurat);
 *   - cautarea cu file a hubului: fila urmatoare la 6,5 s, ciclul oprit in afara ferestrei si cat
 *     focusul de tastatura sta in card (WCAG 2.2.2), clicul pe fila;
 *   - acordeonul intrebarilor: un singur rand deschis, tastatura;
 *   - axe la 1440 si la 390 pe toate cele 8 rute (proba generala le masoara la o singura latime);
 *   - bugetele de pe 390 cu procesorul incetinit x4: latenta interactiunilor (INP <= 200 ms) si
 *     deplasarea cumulata (CLS <= 0,1). LCP-ul ramane in afara portii, ca la erou: depinde de
 *     incarcarea masinii; se masoara la livrare si se trece in raport.
 *
 * `innerWidth` se CITESTE din pagina si se scrie in raport. Asteptarile de timp au margine larga:
 * poarta ruleaza pe o masina incarcata. Se cere FORMA ceasului (nimic inainte de prag, pornirea dupa
 * el, ordinea dupa asamblare), nu milisecunda.
 */

const SECTOR = '/solutii/constructii'
/** Constructii: 59 de foi + 3 documente-erou. */
const ASAMBLARE_MS = 1400 + 14 * 62

async function citesteLatimea(page: Page, eticheta: string): Promise<number> {
  const latime = await page.evaluate(() => window.innerWidth)
  console.log('[' + eticheta + '] innerWidth CITIT: ' + latime)
  return latime
}

const cardScena = (page: Page) => page.locator('[data-scena-stare]')

/** Aduce cardul-scena in mijlocul ferestrei, dintr-un salt. */
async function aduceScena(page: Page): Promise<void> {
  await cardScena(page).evaluate((el) => el.scrollIntoView({ block: 'center', behavior: 'instant' }))
}

type EsantionScena = { t: number; canvas: boolean; buton: boolean; stare: string | null }

/**
 * Esantioneaza starea cardului-scena la ~50 ms, `durata` ms. `t` e masurat de la PRIMUL cadru in
 * care exista canvas-ul (bucla gazdei a pornit), nu de la incarcare: pragul de 4,6 s e al buclei.
 */
async function esantioneazaScena(page: Page, durata: number, clicDupa?: number): Promise<EsantionScena[]> {
  return page.evaluate(
    async ([durata, clicDupa]) => {
      const card = document.querySelector('[data-scena-stare]')!
      const citeste = () => ({
        canvas: !!card.querySelector('canvas'),
        buton: !!card.querySelector('button'),
        stare: card.getAttribute('data-scena-stare'),
      })
      const start = performance.now()
      let pornire: number | null = null
      let apasat = false
      const out: { t: number; canvas: boolean; buton: boolean; stare: string | null }[] = []
      while (performance.now() - start < durata + 15_000) {
        const e = citeste()
        const acum = performance.now()
        if (pornire === null && e.canvas) pornire = acum
        if (pornire !== null) {
          const t = acum - pornire
          out.push({ t, ...e })
          if (clicDupa !== null && !apasat && t >= clicDupa && e.buton) {
            ;(card.querySelector('button') as HTMLButtonElement).click()
            apasat = true
          }
          if (t >= durata) break
        }
        await new Promise((r) => setTimeout(r, 50))
      }
      return out
    },
    [durata, clicDupa ?? null] as const,
  )
}

const primul = (e: EsantionScena[], f: (x: EsantionScena) => boolean) => e.find(f)?.t ?? null

test.describe('scena hartiilor la 1440, miscare normala', () => {
  test.use({ viewport: { width: 1440, height: 900 }, reducedMotion: 'no-preference' })

  test('pornirea automata: butonul dispare la ~4,6 s de bucla, cipul trece in ordine dupa asamblare', async ({ page }) => {
    await page.goto(SECTOR, { waitUntil: 'networkidle' })
    await citesteLatimea(page, 'scena automata')
    await aduceScena(page)
    const e = await esantioneazaScena(page, 9000)
    const faraButon = primul(e, (x) => !x.buton)
    const ordine = primul(e, (x) => x.stare === 'ordine')
    console.log('[scena automata] fara buton la ' + Math.round(faraButon ?? -1) + ' ms, ordine la ' + Math.round(ordine ?? -1) + ' ms (asamblare in fisa: ' + ASAMBLARE_MS + ' ms)')
    expect(faraButon, 'butonul trebuie sa dispara').not.toBeNull()
    expect(faraButon!).toBeGreaterThanOrEqual(4000)
    expect(faraButon!).toBeLessThanOrEqual(6500)
    expect(ordine, 'cipul trebuie sa treaca in ordine').not.toBeNull()
    expect(ordine! - faraButon!).toBeGreaterThanOrEqual(ASAMBLARE_MS - 400)
    expect(ordine! - faraButon!).toBeLessThanOrEqual(ASAMBLARE_MS + 1500)
  })

  test('martor NEGATIV: in primele 3,8 s de bucla nu porneste nimic (butonul exista, cipul e in haos)', async ({ page }) => {
    await page.goto(SECTOR, { waitUntil: 'networkidle' })
    await aduceScena(page)
    const e = await esantioneazaScena(page, 3800)
    console.log('[scena, martor negativ] esantioane: ' + e.length + ', ultimul la ' + Math.round(e.at(-1)?.t ?? -1) + ' ms')
    expect(e.length).toBeGreaterThan(20)
    expect(e.every((x) => x.buton && x.stare === 'haos')).toBe(true)
  })

  test('clicul porneste asamblarea pe loc; ordinea vine dupa 1400 + 14 x 62 ms, inainte de pragul automat', async ({ page }) => {
    await page.goto(SECTOR, { waitUntil: 'networkidle' })
    await aduceScena(page)
    const e = await esantioneazaScena(page, 5000, 800)
    const faraButon = primul(e, (x) => !x.buton)
    const ordine = primul(e, (x) => x.stare === 'ordine')
    console.log('[scena clic] clic la ~800 ms, fara buton la ' + Math.round(faraButon ?? -1) + ' ms, ordine la ' + Math.round(ordine ?? -1) + ' ms')
    expect(faraButon!).toBeLessThan(1500)
    expect(ordine! - 800).toBeGreaterThanOrEqual(ASAMBLARE_MS - 400)
    expect(ordine!).toBeLessThan(4600)
  })

  test('bucla sta in afara ferestrei: dupa 6 s departe, butonul inca exista la revenire', async ({ page }) => {
    await page.goto(SECTOR, { waitUntil: 'networkidle' })
    await aduceScena(page)
    await expect(cardScena(page).locator('canvas')).toHaveCount(1)
    await page.waitForTimeout(1500)
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }))
    await page.waitForTimeout(6000)
    await aduceScena(page)
    const laRevenire = await cardScena(page).evaluate((c) => ({ buton: !!c.querySelector('button'), stare: c.getAttribute('data-scena-stare') }))
    console.log('[scena in afara ferestrei] la revenire: ' + JSON.stringify(laRevenire))
    expect(laRevenire).toEqual({ buton: true, stare: 'haos' })
    // Si porneste totusi, dupa pragul ei de bucla activa, cu cardul in fereastra.
    await expect(cardScena(page)).toHaveAttribute('data-scena-stare', 'ordine', { timeout: 15_000 })
  })

  test('esecul WebGL ascunde tot cardul-scena, iar banda ramane', async ({ page }) => {
    await page.addInitScript(() => {
      const original = HTMLCanvasElement.prototype.getContext
      // Numai contextele WebGL cad; 2D (texturile) ramane, ca la un browser fara accelerare.
      HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, tip: string, ...rest: unknown[]) {
        if (/webgl/i.test(tip)) return null
        return (original as (...a: unknown[]) => unknown).call(this, tip, ...rest)
      } as typeof HTMLCanvasElement.prototype.getContext
    })
    await page.goto(SECTOR, { waitUntil: 'networkidle' })
    await aduceScena(page)
    await expect.poll(async () => cardScena(page).evaluate((c) => getComputedStyle(c).display), { timeout: 10_000 }).toBe('none')
    // Banda se gaseste dupa structura (sectiunea care tine cardul-scena), nu dupa textul titlului:
    // proba urmareste forma, iar titlul se poate rescrie fara ca ea sa se inroseasca din motive straine.
    const banda = page.locator('section', { has: cardScena(page) })
    await expect(banda).toHaveCount(1)
    await expect(banda.getByRole('heading', { level: 2 })).toBeVisible()
    await expect(banda.locator('li').first()).toBeVisible()
  })

  test('martor NEGATIV: cu WebGL, cardul-scena se vede si are canvas', async ({ page }) => {
    await page.goto(SECTOR, { waitUntil: 'networkidle' })
    await aduceScena(page)
    await expect(cardScena(page).locator('canvas')).toHaveCount(1, { timeout: 10_000 })
    expect(await cardScena(page).evaluate((c) => getComputedStyle(c).display)).not.toBe('none')
  })

  test('focusul de tastatura pe butonul scenei: contur 2 px albastru, la 2 px', async ({ page }) => {
    await page.goto(SECTOR, { waitUntil: 'networkidle' })
    await aduceScena(page)
    const buton = cardScena(page).locator('button')
    await buton.focus()
    const stil = await buton.evaluate((b) => {
      const s = getComputedStyle(b)
      return { vizibil: b.matches(':focus-visible'), latime: s.outlineWidth, culoare: s.outlineColor, stil: s.outlineStyle, distanta: s.outlineOffset }
    })
    console.log('[focus buton scena] ' + JSON.stringify(stil))
    expect(stil).toEqual({ vizibil: true, latime: '2px', culoare: 'rgb(37, 99, 235)', stil: 'solid', distanta: '2px' })
  })
})

test.describe('scena hartiilor, miscare redusa', () => {
  test.use({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' })

  test('cipul e direct in ordine si butonul lipseste', async ({ page }) => {
    await page.goto(SECTOR, { waitUntil: 'networkidle' })
    await aduceScena(page)
    await expect(cardScena(page)).toHaveAttribute('data-scena-stare', 'ordine')
    await expect(cardScena(page).locator('button')).toHaveCount(0)
  })
})

// ---------------------------------------------------------------------------------------------------
// Cautarea din sector: inaltimea rezervata si lupa
// ---------------------------------------------------------------------------------------------------

/** Inaltimile cardului de cautare pe tot drumul lui: bara goala, tastare, rezultat. */
async function drumulCautarii(page: Page): Promise<{ inaltimi: number[]; tastatMax: number; rezultat: boolean }> {
  const card = page.locator('[data-demo-cautare]')
  await card.evaluate((c) => c.scrollIntoView({ block: 'center', behavior: 'instant' }))
  return card.evaluate(async (c) => {
    const inaltimi: number[] = []
    let tastatMax = 0
    const start = performance.now()
    let rezultatLa: number | null = null
    while (performance.now() - start < 12_000) {
      inaltimi.push(Math.round(c.getBoundingClientRect().height * 10) / 10)
      tastatMax = Math.max(tastatMax, (c.querySelector('[data-tastat]')?.textContent ?? '').length)
      if (rezultatLa === null && c.querySelector('[data-rezultat="vizibil"]')) rezultatLa = performance.now()
      if (rezultatLa !== null && performance.now() - rezultatLa > 700) break
      await new Promise((r) => setTimeout(r, 30))
    }
    return { inaltimi, tastatMax, rezultat: rezultatLa !== null }
  })
}

for (const [latime, inaltime] of [
  [1440, 900],
  [390, 844],
] as const) {
  test.describe('cautarea din sector la ' + latime + ', miscare normala', () => {
    test.use({ viewport: { width: latime, height: inaltime }, reducedMotion: 'no-preference' })

    test('cardul are aceeasi inaltime de la bara goala pana la rezultat (inaltime rezervata)', async ({ page }) => {
      await page.goto(SECTOR, { waitUntil: 'networkidle' })
      await citesteLatimea(page, 'cautare ' + latime)
      const d = await drumulCautarii(page)
      const variatie = Math.max(...d.inaltimi) - Math.min(...d.inaltimi)
      console.log('[cautare ' + latime + '] esantioane: ' + d.inaltimi.length + ', inaltime ' + Math.min(...d.inaltimi) + ' - ' + Math.max(...d.inaltimi) + ', tastat pana la ' + d.tastatMax + ' caractere')
      // Controlul drumului: s-a tastat si a aparut rezultatul, deci s-au masurat toate fazele.
      expect(d.rezultat).toBe(true)
      expect(d.tastatMax).toBeGreaterThan(20)
      expect(variatie).toBeLessThanOrEqual(0.5)
    })

    test('martor POZITIV: fara rezerva de inaltime, aceeasi masuratoare vede cardul crescand', async ({ page }) => {
      await page.goto(SECTOR, { waitUntil: 'networkidle' })
      // Rezerva e rezultatul pus in aceeasi celula cu scheletul inca de la inceput, ascuns. Scos din
      // asezare cat e ascuns, cardul are forma sursei: creste abia cand apare rezultatul.
      await page.addStyleTag({ content: '[data-demo-cautare] [data-rezultat="ascuns"] { display: none !important; }' })
      const d = await drumulCautarii(page)
      const variatie = Math.max(...d.inaltimi) - Math.min(...d.inaltimi)
      console.log('[cautare ' + latime + ', martor pozitiv] inaltime ' + Math.min(...d.inaltimi) + ' - ' + Math.max(...d.inaltimi))
      expect(d.rezultat).toBe(true)
      expect(variatie).toBeGreaterThan(20)
    })
  })
}

test.describe('lupa cautarii la 390', () => {
  test.use({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' })

  const lupa = (page: Page) => page.locator('[data-demo-cautare] [data-faza] > div').first().locator('svg').first()

  test('ramane de 18 px cand interogarea se rupe pe doua randuri (imobiliare)', async ({ page }) => {
    await page.goto('/solutii/imobiliare', { waitUntil: 'networkidle' })
    await citesteLatimea(page, 'lupa 390')
    const m = await lupa(page).evaluate((s) => ({ lupa: Math.round(s.getBoundingClientRect().width * 10) / 10, bara: Math.round(s.parentElement!.getBoundingClientRect().height * 10) / 10 }))
    console.log('[lupa 390] ' + JSON.stringify(m))
    // Controlul: interogarea chiar e pe doua randuri (bara 70,8 px), deci lupa a fost pusa la proba.
    expect(m.bara).toBeGreaterThan(60)
    expect(m.lupa).toBe(18)
  })

  test('martor POZITIV: cu flex-shrink 1 (forma sursei), lupa se ingusteaza si masuratoarea o vede', async ({ page }) => {
    await page.goto('/solutii/imobiliare', { waitUntil: 'networkidle' })
    const latimeLupa = await lupa(page).evaluate((s) => {
      ;(s as unknown as HTMLElement).style.flexShrink = '1'
      return Math.round(s.getBoundingClientRect().width * 10) / 10
    })
    console.log('[lupa 390, martor pozitiv] ' + latimeLupa)
    expect(latimeLupa).toBeLessThan(18)
  })
})

// ---------------------------------------------------------------------------------------------------
// Hubul: cautarea cu 4 file
// ---------------------------------------------------------------------------------------------------

test.describe('cautarea cu file a hubului, miscare normala', () => {
  test.use({ viewport: { width: 1440, height: 900 }, reducedMotion: 'no-preference' })

  const card = (page: Page) => page.locator('[data-demo-file]')
  const filaActiva = (page: Page) => card(page).getAttribute('data-fila-activa')

  async function aduceCardul(page: Page): Promise<void> {
    await card(page).evaluate((c) => c.scrollIntoView({ block: 'center', behavior: 'instant' }))
  }

  test('cu cardul in fereastra, fila urmatoare vine la ~6,5 s', async ({ page }) => {
    await page.goto('/solutii', { waitUntil: 'networkidle' })
    await citesteLatimea(page, 'hub file')
    await aduceCardul(page)
    const schimbare = await card(page).evaluate(async (c) => {
      const initial = c.getAttribute('data-fila-activa')
      const start = performance.now()
      while (performance.now() - start < 12_000) {
        if (c.getAttribute('data-fila-activa') !== initial) return { dupa: performance.now() - start, initial, noua: c.getAttribute('data-fila-activa') }
        await new Promise((r) => setTimeout(r, 50))
      }
      return { dupa: null, initial, noua: null }
    })
    console.log('[hub file] ' + JSON.stringify(schimbare))
    expect(schimbare.initial).toBe('0')
    expect(schimbare.noua).toBe('1')
    expect(schimbare.dupa!).toBeGreaterThanOrEqual(5500)
    expect(schimbare.dupa!).toBeLessThanOrEqual(9500)
  })

  test('martor NEGATIV: cu cardul in afara ferestrei, ciclul sta (aceeasi fila dupa 9 s)', async ({ page }) => {
    await page.goto('/solutii', { waitUntil: 'networkidle' })
    await aduceCardul(page)
    await page.waitForTimeout(1000)
    await page.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' }))
    const inainte = await filaActiva(page)
    await page.waitForTimeout(9000)
    const dupa = await filaActiva(page)
    console.log('[hub file in afara ferestrei] ' + inainte + ' -> ' + dupa)
    expect(dupa).toBe(inainte)
  })

  test('focusul de tastatura in card opreste ciclul (WCAG 2.2.2)', async ({ page }) => {
    await page.goto('/solutii', { waitUntil: 'networkidle' })
    await aduceCardul(page)
    const fila = card(page).getByRole('button').first()
    await fila.focus()
    expect(await fila.evaluate((b) => b.matches(':focus-visible'))).toBe(true)
    const inainte = await filaActiva(page)
    await page.waitForTimeout(9000)
    expect(await filaActiva(page)).toBe(inainte)
  })

  test('mouse-ul pe card amana rotirea filelor; la iesire, fila urmatoare vine pe loc (WCAG 2.2.2)', async ({ page }) => {
    await page.goto('/solutii', { waitUntil: 'networkidle' })
    await aduceCardul(page)
    await card(page).hover({ position: { x: 20, y: 200 } })
    const inainte = await filaActiva(page)
    await page.waitForTimeout(9000)
    const subMouse = await filaActiva(page)
    // Fila curenta isi termina tastarea: interogarea intreaga, nu inghetata la jumatate.
    const tastat = await card(page).evaluate((c) => {
      const t = c.querySelector('[data-tastat]')!
      return { tastat: t.textContent ?? '', intreaga: t.parentElement!.children[Number(c.getAttribute('data-fila-activa'))]?.textContent ?? '' }
    })
    await page.mouse.move(5, 5)
    await page.waitForTimeout(800)
    const dupa = await filaActiva(page)
    console.log('[hub file hover] ' + JSON.stringify({ inainte, subMouse, dupa, tastat: tastat.tastat.length }))
    expect(subMouse).toBe(inainte)
    expect(tastat.tastat).toBe(tastat.intreaga)
    expect(dupa).not.toBe(inainte)
  })

  test('clicul pe o fila o activeaza pe loc si reia tastarea', async ({ page }) => {
    await page.goto('/solutii', { waitUntil: 'networkidle' })
    await aduceCardul(page)
    await page.waitForTimeout(2500)
    const a3a = card(page).getByRole('button').nth(2)
    await a3a.click()
    await expect(a3a).toHaveAttribute('aria-pressed', 'true')
    expect(await filaActiva(page)).toBe('2')
    const tastat = await card(page).evaluate((c) => (c.querySelector('[data-tastat]')?.textContent ?? '').length)
    console.log('[hub clic pe fila] caractere tastate imediat dupa clic: ' + tastat)
    expect(tastat).toBeLessThan(12)
  })

  /**
   * Ce vede omul in card: fila activa, textul din bara, interogarile INTREGI ale filelor (randurile
   * de rezerva din aceeasi celula cu textul tastat), rezultatele vizibile (indicele lor) si scheletul.
   */
  const vedere = (page: Page) =>
    card(page).evaluate((c) => {
      const tastat = c.querySelector('[data-tastat]')!
      const rezerve = [...tastat.parentElement!.children].filter((e) => e !== tastat).map((e) => e.textContent ?? '')
      const rezultate = [...c.querySelectorAll('[data-rezultat]')]
      const activ = document.activeElement as HTMLElement | null
      const inCard = !!activ && c.contains(activ)
      return {
        fila: c.getAttribute('data-fila-activa'),
        tastat: tastat.textContent ?? '',
        rezerve,
        vizibile: rezultate.flatMap((r, i) => (r.getAttribute('data-rezultat') === 'vizibil' ? [i] : [])),
        schelet: !!c.querySelector('[data-schelet]'),
        // Doar focusul din card se descrie (textul filei); in afara lui, numai eticheta elementului.
        focus: inCard
          ? (activ.textContent ?? '').trim() + (activ.matches(':focus-visible') ? ' (focus-visible)' : '')
          : '(in afara cardului: ' + (activ?.tagName ?? '-') + ')',
      }
    })

  test('Tab in file in timpul tastarii, apoi Enter pe alta fila: interogarea ei intreaga si rezultatul ei', async ({ page }) => {
    await page.goto('/solutii', { waitUntil: 'networkidle' })
    await citesteLatimea(page, 'hub file tastatura')
    await aduceCardul(page)
    // Controlul drumului: intrarea in file cade in mijlocul tastarii primei file, nu dupa ea.
    await page.waitForFunction(() => (document.querySelector('[data-demo-file] [data-tastat]')?.textContent ?? '').length >= 5)
    const inainte = await vedere(page)
    expect(inainte.tastat.length).toBeLessThan(inainte.rezerve[0].length)
    // Focus pe elementul de dinaintea filelor, apoi Tab: in file se intra de la tastatura.
    await card(page).evaluate((c) => {
      const prima = c.querySelector('button')!
      const toate = [...document.querySelectorAll<HTMLElement>('a[href], button, [tabindex]')].filter((e) => e.tabIndex >= 0)
      toate[toate.indexOf(prima) - 1].focus()
    })
    await page.keyboard.press('Tab')
    const intrare = await vedere(page)
    await page.keyboard.press('Tab')
    await page.keyboard.press('Enter')
    await expect(card(page).getByRole('button').nth(1)).toHaveAttribute('aria-pressed', 'true')
    const alegere = await vedere(page)
    await page.waitForTimeout(3500)
    const dupa = await vedere(page)
    console.log('[hub file tastatura] inainte: ' + JSON.stringify({ ...inainte, rezerve: undefined }))
    console.log('[hub file tastatura] la intrarea in file: ' + JSON.stringify({ ...intrare, rezerve: undefined }))
    console.log('[hub file tastatura] dupa Enter pe fila 2: ' + JSON.stringify({ ...alegere, rezerve: undefined }))
    console.log('[hub file tastatura] +3,5 s: ' + JSON.stringify({ ...dupa, rezerve: undefined }))
    // La intrarea in pauza, fila curenta se arata intreaga, cu rezultatul ei.
    expect(intrare.focus).toContain('(focus-visible)')
    expect(intrare.tastat).toBe(intrare.rezerve[0])
    expect(intrare.vizibile).toEqual([0])
    // Fila aleasa cu Enter: interogarea intreaga, rezultatul ei, fara schelet; si tot asa dupa 3,5 s.
    for (const v of [alegere, dupa]) {
      expect(v.fila).toBe('1')
      expect(v.tastat).toBe(v.rezerve[1])
      expect(v.vizibile).toEqual([1])
      expect(v.schelet).toBe(false)
    }
    // Focusul iese din card: ciclul se reia de la inceputul filei alese (tastarea porneste din nou).
    await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur())
    await page.waitForFunction(
      (intreaga) => {
        const t = document.querySelector('[data-demo-file] [data-tastat]')?.textContent ?? ''
        return t.length < intreaga
      },
      alegere.rezerve[1].length,
      { timeout: 3000 },
    )
    expect(await filaActiva(page)).toBe('1')
  })
})

// Fragmentele rezultatelor din cautarea cu file: 2 randuri la 1440 pe toate filele; la 390, 6 randuri
// pe imobiliare si 5 pe celelalte (solutii.md S3, masurat pe toate 4 file). Rezerva de inaltime e cea a
// celui mai inalt rezultat, deci cardul are, in orice faza, inaltimea cardului sursei cu rezultatul
// imobiliarelor: 304,9 px la 1440 si 459,4 px la 390.
for (const [latime, inaltime, randuriAsteptate, cardAsteptat] of [
  [1440, 900, [2, 2, 2, 2], 304.9],
  [390, 844, [6, 5, 5, 5], 459.4],
] as const) {
  test.describe('fragmentele cautarii cu file la ' + latime, () => {
    test.use({ viewport: { width: latime, height: inaltime }, reducedMotion: 'reduce' })

    test('randurile fiecarui fragment si inaltimea cardului, ca la referinta in starea „rezultat”', async ({ page }) => {
      await page.goto('/solutii', { waitUntil: 'networkidle' })
      await citesteLatimea(page, 'fragmente hub ' + latime)
      const m = await page.locator('[data-demo-file]').evaluate((c) => {
        const randuri = [...c.querySelectorAll('[data-rezultat] p')].map((p) =>
          Math.round(p.getBoundingClientRect().height / parseFloat(getComputedStyle(p).lineHeight)),
        )
        const sectiune = c.closest('section')?.getBoundingClientRect().height ?? 0
        return { randuri, card: Math.round(c.getBoundingClientRect().height * 10) / 10, sectiune: Math.round(sectiune * 10) / 10 }
      })
      console.log('[fragmente hub ' + latime + '] ' + JSON.stringify(m))
      expect(m.randuri).toEqual([...randuriAsteptate])
      expect(Math.abs(m.card - cardAsteptat)).toBeLessThanOrEqual(1.5)
    })
  })
}

// ---------------------------------------------------------------------------------------------------
// Intrebarile: acordeonul `sector`
// ---------------------------------------------------------------------------------------------------

test.describe('intrebarile de sector', () => {
  test.use({ viewport: { width: 1440, height: 900 } })

  const randuri = (page: Page) => page.locator('main button[aria-expanded]')

  test('martor NEGATIV: la incarcare toate cele 4 randuri sunt inchise', async ({ page }) => {
    await page.goto(SECTOR, { waitUntil: 'networkidle' })
    await expect(randuri(page)).toHaveCount(4)
    for (let i = 0; i < 4; i++) await expect(randuri(page).nth(i)).toHaveAttribute('aria-expanded', 'false')
  })

  test('un singur rand deschis: al doilea il inchide pe primul; Enter deschide de la tastatura', async ({ page }) => {
    await page.goto(SECTOR, { waitUntil: 'networkidle' })
    await randuri(page).nth(0).click()
    await expect(randuri(page).nth(0)).toHaveAttribute('aria-expanded', 'true')
    await randuri(page).nth(1).click()
    await expect(randuri(page).nth(1)).toHaveAttribute('aria-expanded', 'true')
    await expect(randuri(page).nth(0)).toHaveAttribute('aria-expanded', 'false')
    await randuri(page).nth(1).click()
    await expect(randuri(page).nth(1)).toHaveAttribute('aria-expanded', 'false')
    await randuri(page).nth(2).focus()
    await page.keyboard.press('Enter')
    await expect(randuri(page).nth(2)).toHaveAttribute('aria-expanded', 'true')
  })
})

// ---------------------------------------------------------------------------------------------------
// axe la 1440 si 390 pe toate cele 8 rute
// ---------------------------------------------------------------------------------------------------

const RUTE_SOLUTII = [
  '/solutii',
  '/solutii/constructii',
  '/solutii/contabilitate',
  '/solutii/imobiliare',
  '/solutii/avocatura',
  '/solutii/logistica',
  '/solutii/notariate',
  '/solutii/asigurari',
]

for (const [latime, inaltime] of [
  [1440, 900],
  [390, 844],
] as const) {
  test.describe('axe la ' + latime, () => {
    test.use({ viewport: { width: latime, height: inaltime } })
    for (const ruta of RUTE_SOLUTII) {
      test(ruta + ' nu are incalcari serious sau critical', async ({ page }) => {
        await page.goto(ruta, { waitUntil: 'networkidle' })
        await citesteLatimea(page, 'axe ' + latime + ' ' + ruta)
        const m = await masoaraAccesibilitatea(page)
        for (const g of m.grave) console.log('    BLOCANT: ' + g.regula + ' (' + g.impact + ') ' + g.tinte.join(' | '))
        expect(m.grave.map((g) => g.regula)).toEqual([])
      })
    }
  })
}

// ---------------------------------------------------------------------------------------------------
// Bugetele de pe 390, cu procesorul incetinit x4
// ---------------------------------------------------------------------------------------------------

const BUGET_INP_MS = 200
const BUGET_CLS = 0.1

type Interactiune = { id: number; d: number; t: number }
type FereastraMasurata = Window & { __interactiuni?: Interactiune[]; __deplasari?: { t: number; v: number }[] }

/** Observatorii Event Timing si layout-shift, pusi inaintea oricarui script al paginii. */
async function ascultaPagina(page: Page): Promise<void> {
  await page.addInitScript(() => {
    const w = window as FereastraMasurata
    w.__interactiuni = []
    w.__deplasari = []
    new PerformanceObserver((lista) => {
      for (const e of lista.getEntries() as (PerformanceEntry & { interactionId?: number })[]) {
        if (e.interactionId) w.__interactiuni?.push({ id: e.interactionId, d: e.duration, t: e.startTime })
      }
    }).observe({ type: 'event', durationThreshold: 16, buffered: true } as PerformanceObserverInit)
    new PerformanceObserver((lista) => {
      for (const e of lista.getEntries() as (PerformanceEntry & { value: number; hadRecentInput: boolean })[]) {
        if (!e.hadRecentInput) w.__deplasari?.push({ t: e.startTime, v: e.value })
      }
    }).observe({ type: 'layout-shift', buffered: true } as PerformanceObserverInit)
  })
}

/** Latenta unei interactiuni, ca in INP: cea mai lunga intrare Event Timing a ei (se asteapta pictura). */
async function latenta(page: Page, actiune: () => Promise<void>): Promise<number> {
  const inainte = await page.evaluate(() => performance.now())
  await actiune()
  await page.waitForTimeout(700)
  return page.evaluate((inainte) => {
    const pe: Record<number, number> = {}
    for (const e of (window as FereastraMasurata).__interactiuni ?? []) {
      if (e.t >= inainte - 5) pe[e.id] = Math.max(pe[e.id] ?? 0, e.d)
    }
    return Math.max(0, ...Object.values(pe))
  }, inainte)
}

/** CLS ca in Web Vitals: cea mai mare fereastra de sesiune (pauza 1 s, lungime maxima 5 s). */
async function cls(page: Page): Promise<number> {
  return page.evaluate(() => {
    const d = (window as FereastraMasurata).__deplasari ?? []
    let maxim = 0
    let suma = 0
    let inceput = -Infinity
    let ultim = -Infinity
    for (const x of d) {
      if (x.t - ultim > 1000 || x.t - inceput > 5000) {
        suma = 0
        inceput = x.t
      }
      suma += x.v
      ultim = x.t
      maxim = Math.max(maxim, suma)
    }
    return maxim
  })
}

async function cuProcesorIncetinit<T>(page: Page, f: () => Promise<T>): Promise<T> {
  const cdp = await page.context().newCDPSession(page)
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 })
  try {
    return await f()
  } finally {
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: 1 })
  }
}

/** Un drum prin interactiunile paginilor, cu `frana` ms de sarcina sintetica pe prima intrebare. */
async function drumulInteractiunilor(page: Page, frana = 0): Promise<Record<string, number>> {
  const m: Record<string, number> = {}
  await page.goto(SECTOR, { waitUntil: 'networkidle' })
  await cuProcesorIncetinit(page, async () => {
    await aduceScena(page)
    await expect(cardScena(page).locator('canvas')).toHaveCount(1, { timeout: 15_000 })
    m['butonul scenei'] = await latenta(page, () => cardScena(page).locator('button').click())
    const intrebare = page.locator('main button[aria-expanded]').first()
    await intrebare.scrollIntoViewIfNeeded()
    if (frana) {
      await intrebare.evaluate((b, ms) => {
        b.addEventListener(
          'click',
          () => {
            const t0 = performance.now()
            while (performance.now() - t0 < ms) {
              // sarcina sintetica: tine firul principal ocupat
            }
          },
          { capture: true, once: true },
        )
      }, frana)
    }
    m['o intrebare'] = await latenta(page, () => intrebare.click())
  })
  if (frana) return m
  await page.goto('/solutii', { waitUntil: 'networkidle' })
  await cuProcesorIncetinit(page, async () => {
    const fila = page.locator('[data-demo-file]').getByRole('button').nth(1)
    await fila.scrollIntoViewIfNeeded()
    m['o fila a hubului'] = await latenta(page, () => fila.click())
  })
  return m
}

test.describe('bugetele la 390, procesor x4', () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, reducedMotion: 'no-preference' })

  test('latenta interactiunilor sub ' + BUGET_INP_MS + ' ms (Event Timing, minimul a 2 drumuri)', async ({ page }) => {
    await ascultaPagina(page)
    const drumuri = [await drumulInteractiunilor(page), await drumulInteractiunilor(page)]
    expect(await page.evaluate(() => window.innerWidth), 'innerWidth CITIT').toBe(390)
    const minim = Object.fromEntries(Object.keys(drumuri[0]).map((k) => [k, Math.min(...drumuri.map((d) => d[k]))]))
    for (const k of Object.keys(minim)) console.log('[INP 390] ' + k + ': ' + drumuri.map((d) => d[k]).join(' / ') + ' ms, minim ' + minim[k])
    expect(Object.entries(minim).filter(([, ms]) => ms > BUGET_INP_MS)).toEqual([])
  })

  test('martor POZITIV: o sarcina de 300 ms in handlerul unei intrebari iese peste buget', async ({ page }) => {
    await ascultaPagina(page)
    const m = await drumulInteractiunilor(page, 300)
    console.log('[INP 390, martor pozitiv] ' + JSON.stringify(m))
    expect(m['o intrebare']).toBeGreaterThan(BUGET_INP_MS)
  })

  test('deplasarea cumulata (CLS) sub ' + BUGET_CLS + ' pe tot drumul paginii de sector', async ({ page }) => {
    await ascultaPagina(page)
    await page.goto(SECTOR, { waitUntil: 'networkidle' })
    const valoare = await cuProcesorIncetinit(page, async () => {
      // Drumul: cautarea tastata pana la rezultat, apoi scena pornita si asamblata.
      await drumulCautarii(page)
      await aduceScena(page)
      await cardScena(page).locator('button').click({ timeout: 15_000 })
      await expect(cardScena(page)).toHaveAttribute('data-scena-stare', 'ordine', { timeout: 20_000 })
      return cls(page)
    })
    console.log('[CLS 390] ' + valoare.toFixed(4))
    expect(valoare).toBeLessThanOrEqual(BUGET_CLS)
  })

  test('martor POZITIV: un bloc de 300 px inserat sus dupa incarcare e prins ca deplasare', async ({ page }) => {
    await ascultaPagina(page)
    await page.goto(SECTOR, { waitUntil: 'networkidle' })
    await page.evaluate(async () => {
      const bloc = document.createElement('div')
      bloc.style.height = '300px'
      document.querySelector('main')!.prepend(bloc)
      await new Promise((r) => setTimeout(r, 300))
    })
    const valoare = await cls(page)
    console.log('[CLS 390, martor pozitiv] ' + valoare.toFixed(4))
    expect(valoare).toBeGreaterThan(BUGET_CLS)
  })
})
