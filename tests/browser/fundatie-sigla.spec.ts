import { expect, test, type Locator, type Page } from '@playwright/test'

/**
 * Sigla marcii se CITESTE, in antet si in subsol (felia 43). Regula: docs/design/DIRECTIA.md,
 * "Sigla".
 *
 * DE CE. Pana la felia 43 antetul punea sigla oficiala intreaga (iconita si trei randuri de text)
 * intr-un slot de 106,5 px: la 40 px inaltime, DOC MANAGEMENT avea 3,6 px, iar subsolul, la 44 px,
 * 4 px. Nimic nu masura asta; poarta de accesibilitate nu citeste textul desenat in imagini.
 *
 * CUM SE MASOARA. Pe pixeli, nu din geometrie: imaginea asa cum o deseneaza navigatorul, la
 * marimea ei randata, e redesenata pe o panza; coloanele cu cerneala dau elementele (iconita,
 * linia, blocul de text), iar in fiecare, randurile cu cerneala dau benzile de litere. Pragul se
 * masoara in aceeasi pagina: majusculele unui text de 11 px in fontul site-ului, minimul de text
 * al site-ului (DIRECTIA.md, abaterile). Fiecare banda de litere a siglei trebuie sa-l atinga.
 * `innerWidth` se citeste la fiecare masuratoare.
 */

type Banda = { y0: number; h: number }
type Element = { x0: number; x1: number; benzi: Banda[] }
type Analiza = { latime: number; inaltime: number; elemente: Element[] }

/** Deseneaza imaginea pe o panza si o imparte in elemente si benzi de litere (px CSS). */
async function analizeaza(img: Locator): Promise<Analiza> {
  await img.scrollIntoViewIfNeeded()
  await expect.poll(() => img.evaluate((i: HTMLImageElement) => i.complete && i.naturalWidth > 0)).toBe(true)
  return img.evaluate((i: HTMLImageElement) => {
    const r = i.getBoundingClientRect()
    const dpr = window.devicePixelRatio
    const W = Math.round(r.width * dpr)
    const H = Math.round(r.height * dpr)
    const panza = document.createElement('canvas')
    panza.width = W
    panza.height = H
    const c = panza.getContext('2d')!
    c.drawImage(i, 0, 0, W, H)
    const d = c.getImageData(0, 0, W, H).data
    const cerneala = (x: number, y: number) => d[(y * W + x) * 4 + 3] > 64
    // Trepte de cel putin 4 px desparte elementele; de cel putin 2 px, benzile de litere.
    const tronsoane = (plin: boolean[], pas: number): [number, number][] => {
      const iesire: [number, number][] = []
      let start = -1
      let gol = 0
      for (let k = 0; k <= plin.length; k++) {
        if (k < plin.length && plin[k]) {
          if (start < 0) start = k
          gol = 0
        } else if (start >= 0) {
          gol++
          if (gol >= pas || k === plin.length) {
            iesire.push([start, k - gol])
            start = -1
            gol = 0
          }
        }
      }
      return iesire
    }
    const coloane = Array.from({ length: W }, (_, x) => {
      for (let y = 0; y < H; y++) if (cerneala(x, y)) return true
      return false
    })
    return {
      latime: r.width,
      inaltime: r.height,
      elemente: tronsoane(coloane, 4 * dpr).map(([a, b]) => {
        const randuri = Array.from({ length: H }, (_, y) => {
          for (let x = a; x <= b; x++) if (cerneala(x, y)) return true
          return false
        })
        return {
          x0: a / dpr,
          x1: (b + 1) / dpr,
          benzi: tronsoane(randuri, 2 * dpr).map(([p, q]) => ({ y0: p / dpr, h: (q - p + 1) / dpr })),
        }
      }),
    }
  })
}

/** Inaltimea majusculelor unui text de `px` in fontul paginii, pe pixeli (acelasi prag de cerneala). */
async function majuscule(page: Page, px: number): Promise<number> {
  await page.evaluate(() => document.fonts.ready.then(() => true))
  return page.evaluate((marime) => {
    const font = getComputedStyle(document.body).fontFamily
    const panza = document.createElement('canvas')
    panza.width = marime * 4
    panza.height = marime * 3
    const c = panza.getContext('2d')!
    c.font = '400 ' + marime + 'px ' + font
    c.fillText('H', 4, marime * 2)
    const d = c.getImageData(0, 0, panza.width, panza.height).data
    let sus = -1
    let jos = -1
    for (let y = 0; y < panza.height; y++) {
      for (let x = 0; x < panza.width; x++) {
        if (d[(y * panza.width + x) * 4 + 3] > 64) {
          if (sus < 0) sus = y
          jos = y
          break
        }
      }
    }
    return (jos - sus + 1) / window.devicePixelRatio
  }, px)
}

function descrie(a: Analiza): string {
  return a.latime.toFixed(1) + 'x' + a.inaltime.toFixed(1) + ' | ' + a.elemente
    .map((e) => 'x ' + e.x0.toFixed(0) + '-' + e.x1.toFixed(0) + ': ' + e.benzi.map((b) => b.h.toFixed(1)).join('/'))
    .join(' ; ')
}

/** Blocul de text al siglei complete: ultimul element (dupa iconita si linia despartitoare). */
function blocText(a: Analiza): Element {
  return a.elemente[a.elemente.length - 1]
}

const SIGLA_SUBSOL = 'footer img[data-sigla="completa"]'

for (const latime of [1440, 390]) {
  test.describe('sigla la ' + latime, () => {
    test.use({ viewport: { width: latime, height: latime === 1440 ? 900 : 844 } })

    test('subsolul are sigla completa, cu fiecare rand de litere cel putin cat majusculele de 11 px', async ({ page }) => {
      await page.goto('/', { waitUntil: 'networkidle' })
      const prag = await majuscule(page, 11)
      const a = await analizeaza(page.locator(SIGLA_SUBSOL).first())
      console.log('[sigla subsol] innerWidth CITIT: ' + (await page.evaluate(() => window.innerWidth)) + ' | prag ' + prag + ' | ' + descrie(a))
      // Iconita, linia despartitoare si blocul de text; in bloc, ADRIA, DOC MANAGEMENT, scan-store-solve.
      expect(a.elemente).toHaveLength(3)
      const benzi = blocText(a).benzi.map((b) => b.h)
      expect(benzi).toHaveLength(3)
      for (const h of benzi) expect(h).toBeGreaterThanOrEqual(prag)
    })
  })
}

test.describe('sigla in antet la 1440', () => {
  test.use({ viewport: { width: 1440, height: 900 } })

  test('martor NEGATIV: forma compacta, cu ADRIA cel putin cat majusculele de 11 px', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' })
    const prag = await majuscule(page, 11)
    const img = page.locator('header[data-antet] img[data-sigla="compacta"]')
    const a = await analizeaza(img)
    const cadru = await img.evaluate((i) => i.parentElement!.getBoundingClientRect().width)
    console.log('[sigla antet] innerWidth CITIT: ' + (await page.evaluate(() => window.innerWidth)) + ' | prag ' + prag + ' | cadru ' + cadru + ' | ' + descrie(a))
    // Iconita si cuvantul ADRIA, amandoua in cadru.
    expect(a.elemente).toHaveLength(2)
    expect(cadru).toBeGreaterThanOrEqual(a.elemente[1].x1 - 0.5)
    expect(a.elemente[1].benzi).toHaveLength(1)
    expect(a.elemente[1].benzi[0].h).toBeGreaterThanOrEqual(prag)
  })

  test('martor POZITIV: sigla completa la 40 px, forma veche din antet, e prinsa ca ilizibila', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' })
    const prag = await majuscule(page, 11)
    // Aceeasi imagine si aceeasi masuratoare ca mai sus, pe fisierul complet pus la 40 px.
    const src = await page.locator(SIGLA_SUBSOL).first().getAttribute('src')
    await page.evaluate((s) => {
      const i = document.createElement('img')
      i.src = s!
      i.alt = ''
      i.id = 'sigla-veche'
      // Latimea din raportul propriu al fisierului (`width: auto`), ca in antetul de dinainte.
      i.style.cssText = 'position:fixed;left:0;top:200px;height:40px;width:auto;max-width:none;z-index:9999'
      document.body.appendChild(i)
    }, src)
    const a = await analizeaza(page.locator('#sigla-veche'))
    console.log('[sigla veche] prag ' + prag + ' | ' + descrie(a))
    const benzi = blocText(a).benzi.map((b) => b.h)
    expect(benzi.length).toBeGreaterThanOrEqual(2)
    expect(Math.min(...benzi)).toBeLessThan(prag)
  })
})

test.describe('sigla in antet la 390', () => {
  test.use({ viewport: { width: 390, height: 844 } })

  test('ramane doar iconita: cadrul taie imaginea dupa ea, fara s-o strivesca', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' })
    const img = page.locator('header[data-antet] img[data-sigla="compacta"]')
    const a = await analizeaza(img)
    const cadru = await img.evaluate((i) => {
      const r = i.parentElement!.getBoundingClientRect()
      return { latime: r.width, inaltime: r.height }
    })
    console.log('[sigla antet 390] innerWidth CITIT: ' + (await page.evaluate(() => window.innerWidth)) + ' | cadru ' + cadru.latime + 'x' + cadru.inaltime + ' | ' + descrie(a))
    // Imaginea isi pastreaza marimea (nu e turtita in cadru); iconita e in cadru, ADRIA in afara lui.
    expect(a.latime).toBeGreaterThan(cadru.latime * 2)
    expect(a.elemente).toHaveLength(2)
    expect(a.elemente[0].x1).toBeLessThanOrEqual(cadru.latime + 0.5)
    expect(a.elemente[1].x0).toBeGreaterThanOrEqual(cadru.latime)
    expect(a.elemente[0].benzi[0].h).toBeCloseTo(cadru.inaltime, 0)
  })

  test('sertarul mobil are forma compacta intreaga, cu ADRIA cel putin cat majusculele de 11 px', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' })
    const prag = await majuscule(page, 11)
    await page.locator('[data-hamburger]').click()
    const sertar = page.locator('[data-sertar]')
    await expect(sertar).toBeVisible()
    const a = await analizeaza(sertar.locator('img[data-sigla="compacta"]'))
    console.log('[sigla sertar] innerWidth CITIT: ' + (await page.evaluate(() => window.innerWidth)) + ' | prag ' + prag + ' | ' + descrie(a))
    expect(a.elemente).toHaveLength(2)
    expect(a.elemente[1].benzi).toHaveLength(1)
    expect(a.elemente[1].benzi[0].h).toBeGreaterThanOrEqual(prag)
  })
})
