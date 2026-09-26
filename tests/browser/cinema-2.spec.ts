import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'
import { LOT, TOTAL_LOT } from '../../src/content/functionalitati/semnatura-calificata'
import { IMPACTURI_BLOCANTE, masoaraAccesibilitatea } from './ajutor/detectori'

/**
 * Paginile cinema ale feliei `cinema-2` in navigator: `/functionalitati/e-facturi-si-avize`,
 * `/functionalitati/aplicatie-mobila`, `/functionalitati/semnatura-calificata` (fisele
 * functionalitati__sablon.md si functionalitati__<pagina>.md). `innerWidth` se CITESTE din pagina.
 *
 * CE MASOARA:
 *   - starea statica: la miscare redusa fiecare sectiune sta la p = 1, niciun text nu se scrie, iar piesele
 *     cu prag (generatorul, lotul) sunt in forma finala;
 *   - pragul "o singura data" (sablon §4.5, fisele e-facturi S4 si semnatura S5), cu miscare: sub prag
 *     piesa ASTEAPTA (martorul ca detectorul vede starea nefinala), peste prag trece in starea finala, iar
 *     la urcare sub prag RAMANE acolo; lotul se incheie pe "gata de semnat", niciodata pe "semnat";
 *   - telefonul din aplicatie-mobila: pe primul ecran cat nu se vede, ciclul (3,5 s) merge numai in fereastra;
 *   - axe la 1440 si la 390, si axe CU MISCARE pe fiecare sectiune la p = 0,5 (poarta site-ului ruleaza axe
 *     numai la miscare redusa, deci nu vede textul inca stins de o aparitie prea tarzie);
 *   - nicio depasire orizontala la 390.
 */

const PAGINI = ['/functionalitati/e-facturi-si-avize', '/functionalitati/aplicatie-mobila', '/functionalitati/semnatura-calificata'] as const

async function deschide(page: Page, cale: string, latime: number): Promise<void> {
  await page.goto(cale, { waitUntil: 'networkidle' })
  expect(await page.evaluate(() => window.innerWidth), 'innerWidth CITIT').toBe(latime)
}

/** Deruleaza sectiunea `nume` la progresul `p`: p = (0,5 vh - top) / inaltime (sablon §1.4). */
async function laProgres(page: Page, nume: string, p: number): Promise<void> {
  const y = await page.evaluate(
    ({ nume, p }) => {
      const s = document.querySelector('main section[data-sectiune="' + nume + '"]')
      if (!s) return -1
      const r = s.getBoundingClientRect()
      return Math.round(r.top + window.scrollY - 0.5 * window.innerHeight + p * r.height)
    },
    { nume, p },
  )
  expect(y, 'sectiunea ' + nume + ' gasita').toBeGreaterThanOrEqual(0)
  await page.evaluate((v) => window.scrollTo({ top: v, behavior: 'instant' }), y)
}

// --- Starea statica ------------------------------------------------------------------------------

test.describe('starea statica, la miscare redusa, 1440', () => {
  test.use({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' })

  for (const cale of PAGINI) {
    test(cale + ': fiecare sectiune la p = 1, niciun text scris, dupa derularea pana la capat', async ({ page }) => {
      await deschide(page, cale, 1440)
      await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight))
      await page.waitForTimeout(600)
      const r = await page.evaluate(() => {
        const probleme: string[] = []
        const sectiuni = [...document.querySelectorAll('main section[data-sectiune]')]
        for (const s of sectiuni) {
          const nume = s.getAttribute('data-sectiune') ?? '?'
          if (nume === 'erou') continue
          const p = getComputedStyle(s).getPropertyValue('--p').trim()
          if (p !== '1') probleme.push(nume + ' la p = ' + p)
        }
        for (const e of document.querySelectorAll('main [data-scriere]')) {
          if (e.getAttribute('data-scriere') !== 'static') probleme.push('text in starea ' + e.getAttribute('data-scriere'))
        }
        for (const e of document.querySelectorAll('main [data-prag]')) {
          if (e.getAttribute('data-prag') !== 'static') probleme.push('prag in starea ' + e.getAttribute('data-prag'))
        }
        return { probleme, sectiuni: sectiuni.length }
      })
      expect(r.sectiuni, 'sectiuni gasite').toBeGreaterThanOrEqual(7)
      expect(r.probleme).toEqual([])
    })
  }
})

// --- Pragul "o singura data" -----------------------------------------------------------------------

test.describe('pragul o singura data, cu miscare, 1440', () => {
  test.use({ viewport: { width: 1440, height: 900 }, reducedMotion: 'no-preference' })

  test('martor POZITIV: cu miscare, sub prag, generatorul TREBUIE prins in asteptare', async ({ page }) => {
    await deschide(page, '/functionalitati/e-facturi-si-avize', 1440)
    await laProgres(page, 'generator', 0.1)
    await page.waitForTimeout(500)
    expect(await page.locator('[data-prag]').first().getAttribute('data-prag')).toBe('asteapta')
  })

  test('e-facturi: generatorul trece la p 0,3 si ramane in starea finala la urcare', async ({ page }) => {
    await deschide(page, '/functionalitati/e-facturi-si-avize', 1440)
    const stare = () => page.locator('[data-prag]').first().getAttribute('data-prag')
    await laProgres(page, 'generator', 0.1)
    await page.waitForTimeout(500)
    await laProgres(page, 'generator', 0.3)
    await expect.poll(stare).toBe('gata')
    await laProgres(page, 'generator', 0.05)
    await page.waitForTimeout(700)
    expect(await stare()).toBe('gata')
    const opacitate = await page.locator('[data-prag] ol li').last().evaluate((e) => Number(getComputedStyle(e).opacity))
    expect(opacitate).toBeGreaterThanOrEqual(0.75)
  })

  test('semnatura: lotul porneste la prag, se incheie pe "gata de semnat" si ramane asa la urcare', async ({ page }) => {
    await deschide(page, '/functionalitati/semnatura-calificata', 1440)
    const buton = page.locator('main section[data-sectiune="lot"] [data-stare]')
    await laProgres(page, 'lot', 0.1)
    await page.waitForTimeout(500)
    expect(await buton.getAttribute('data-stare')).toBe('initial')
    await laProgres(page, 'lot', 0.35)
    await expect(buton).toHaveAttribute('data-stare', 'gata', { timeout: 8000 })
    await expect(buton).toContainText(TOTAL_LOT + ' / ' + TOTAL_LOT + ' · ' + LOT.butonFinal)
    await laProgres(page, 'lot', 0.05)
    await page.waitForTimeout(700)
    expect(await buton.getAttribute('data-stare')).toBe('gata')
    // D4c: nicaieri pe pagina o stare "semnat" a lotului.
    const textLot = (await page.locator('main section[data-sectiune="lot"]').innerText()).toLowerCase()
    expect(textLot).not.toMatch(/·\s*semnat\b/)
    expect(textLot).toContain('integrare în curs cu furnizorii acreditați')
  })
})

test.describe('pragul o singura data, la miscare redusa, 1440', () => {
  test.use({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' })

  test('martor NEGATIV: sub prag, generatorul e in forma finala si NU trebuie prins in asteptare', async ({ page }) => {
    await deschide(page, '/functionalitati/e-facturi-si-avize', 1440)
    await laProgres(page, 'generator', 0.1)
    await page.waitForTimeout(500)
    expect(await page.locator('[data-prag]').first().getAttribute('data-prag')).toBe('static')
  })
})

// --- Telefonul ---------------------------------------------------------------------------------------

test.describe('telefonul din aplicatie-mobila, cu miscare, 1440', () => {
  test.use({ viewport: { width: 1440, height: 900 }, reducedMotion: 'no-preference' })

  test('sta pe primul ecran cat nu se vede; in fereastra schimba ecranul la ~3,5 s', async ({ page }) => {
    await deschide(page, '/functionalitati/aplicatie-mobila', 1440)
    const ecran = () => page.locator('[data-macheta="telefon"]').getAttribute('data-ecran')
    await page.waitForTimeout(4200)
    expect(await ecran(), 'in afara ferestrei').toBe('1')
    await laProgres(page, 'telefon', 0.5)
    await page.waitForTimeout(4200)
    expect(await ecran(), 'dupa ~4 s in fereastra').toBe('2')
  })
})

// --- Accesibilitate ------------------------------------------------------------------------------

for (const latime of [1440, 390]) {
  test.describe('axe, ' + latime, () => {
    test.use({ viewport: { width: latime, height: latime === 390 ? 844 : 900 } })

    for (const cale of PAGINI) {
      test(cale + ': nicio incalcare ' + IMPACTURI_BLOCANTE.join('/') + ', nicio depasire orizontala', async ({ page }) => {
        await deschide(page, cale, latime)
        const masura = await masoaraAccesibilitatea(page)
        for (const g of masura.grave) console.log('    BLOCANT: ' + g.regula + ' (' + g.impact + ') x' + g.noduri + ' ' + g.tinte.join(' | '))
        expect(masura.grave.map((g) => g.regula)).toEqual([])
        expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBe(0)
      })
    }
  })
}

for (const latime of [1440, 390]) {
  test.describe('axe cu miscare, fiecare sectiune la p = 0,5, ' + latime, () => {
    test.use({ viewport: { width: latime, height: latime === 390 ? 844 : 900 }, reducedMotion: 'no-preference' })

    for (const cale of PAGINI) {
      test(cale + ': nicio incalcare cu sectiunea centrata', async ({ page }) => {
        test.setTimeout(120_000)
        await deschide(page, cale, latime)
        const nume = await page.evaluate(() =>
          [...document.querySelectorAll('main section[data-sectiune]')].map((s) => s.getAttribute('data-sectiune') ?? '').filter((n) => n !== 'erou'),
        )
        expect(nume.length).toBeGreaterThanOrEqual(6)
        const detalii: string[] = []
        for (const n of nume) {
          await laProgres(page, n, 0.5)
          await page.waitForTimeout(900)
          const p = await page.evaluate(
            (x) => getComputedStyle(document.querySelector('main section[data-sectiune="' + x + '"]') as Element).getPropertyValue('--p').trim(),
            n,
          )
          expect(Math.abs(Number(p) - 0.5), 'progresul sectiunii ' + n).toBeLessThan(0.02)
          const r = await new AxeBuilder({ page })
            .include('main section[data-sectiune="' + n + '"]')
            .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
            .analyze()
          for (const v of r.violations.filter((v) => IMPACTURI_BLOCANTE.includes(v.impact ?? ''))) {
            for (const nod of v.nodes) detalii.push(n + ' ' + v.id + ' ' + nod.target.join(' ') + ' | ' + (nod.any[0]?.message ?? '').slice(0, 90))
          }
        }
        for (const d of detalii) console.log('    BLOCANT: ' + d)
        expect(detalii).toEqual([])
      })
    }
  })
}
