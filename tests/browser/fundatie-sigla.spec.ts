import { expect, test, type Locator, type Page } from '@playwright/test'

/**
 * Sigla marcii se CITESTE, in antet, in sertar si in subsol. Regula: docs/design/DIRECTIA.md,
 * "Sigla".
 *
 * CE E SIGLA ACUM. Decizia owner-ului D10 (25.09): pe site sta doar ICONITA marcii 3S - chenarul
 * de scanare, dosarul si "3S" - decupata din fisierul oficial, fara randurile de text. Singurul
 * text al ei e "3S", decupat (gol) in forma albastru-inchis a dosarului.
 *
 * CUM SE MASOARA. Pe pixeli, nu din geometrie: imaginea asa cum o deseneaza navigatorul, la
 * marimea ei randata, e redesenata pe o panza. Literele "3S" sunt GOLURI in forma albastru-inchis
 * (#226699): pe fiecare rand din jumatatea de sus a imaginii se cauta pixeli transparenti prinsi
 * intre doi pixeli albastru-inchis. Randurile care au asa ceva dau banda literelor; inaltimea ei
 * se compara cu majusculele unui text de 11 px in fontul site-ului, masurate in aceeasi pagina
 * (minimul de text al site-ului, DIRECTIA.md, abaterile). `innerWidth` se citeste la fiecare
 * masuratoare.
 */

type Analiza = {
  latime: number
  inaltime: number
  /** Inaltimea benzii literelor "3S", in px CSS (0 = negasita). */
  litere: number
  /** Latimea desenului cu cerneala raportata la latimea imaginii: 1 = iconita singura, patrata. */
  umplere: number
}

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
    const px = (x: number, y: number) => d.subarray((y * W + x) * 4, (y * W + x) * 4 + 4)
    const inchis = (x: number, y: number) => {
      const [R, G, B, A] = px(x, y)
      return A > 200 && Math.abs(R - 34) < 45 && Math.abs(G - 102) < 45 && Math.abs(B - 153) < 45
    }
    const gol = (x: number, y: number) => px(x, y)[3] < 64
    const cerneala = (x: number) => {
      for (let y = 0; y < H; y++) if (px(x, y)[3] > 64) return true
      return false
    }
    let primaX = -1
    let ultimaX = -1
    for (let x = 0; x < W; x++) {
      if (cerneala(x)) {
        if (primaX < 0) primaX = x
        ultimaX = x
      }
    }
    const randuri: number[] = []
    for (let y = 0; y < Math.floor(H / 2); y++) {
      let vazutInchis = false
      let golDupaInchis = false
      let prins = false
      for (let x = 0; x < W; x++) {
        if (inchis(x, y)) {
          if (golDupaInchis) {
            prins = true
            break
          }
          vazutInchis = true
        } else if (vazutInchis && gol(x, y)) {
          golDupaInchis = true
        }
      }
      if (prins) randuri.push(y)
    }
    const litere = randuri.length === 0 ? 0 : (randuri[randuri.length - 1] - randuri[0] + 1) / dpr
    return {
      latime: r.width,
      inaltime: r.height,
      litere,
      umplere: primaX < 0 ? 0 : (ultimaX - primaX + 1) / W,
    }
  })
}

/** Inaltimea majusculelor unui text de `px` in fontul paginii, pe pixeli. */
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

const descrie = (a: Analiza) =>
  a.latime.toFixed(1) + 'x' + a.inaltime.toFixed(1) + ' | 3S: ' + a.litere.toFixed(1) + ' px | umplere ' + a.umplere.toFixed(2)

/** Iconita e patrata, desenul ei umple imaginea (nimic in afara iconitei) si "3S" se citeste. */
function verificaIconita(a: Analiza, prag: number, latura: number) {
  expect(a.latime).toBeCloseTo(latura, 0)
  expect(a.inaltime).toBeCloseTo(latura, 0)
  expect(a.umplere).toBeGreaterThan(0.95)
  expect(a.litere).toBeGreaterThanOrEqual(prag)
  // Banda literelor e a "3S", nu a intregii forme: sub jumatate din latura.
  expect(a.litere).toBeLessThan(latura / 2)
}

const SIGLA_ANTET = 'header[data-antet] img[data-sigla="iconita"]'
const SIGLA_SUBSOL = 'footer img[data-sigla="iconita"]'

for (const latime of [1440, 390]) {
  test.describe('sigla la ' + latime, () => {
    test.use({ viewport: { width: latime, height: latime === 1440 ? 900 : 844 } })

    test('martor NEGATIV: antetul are doar iconita, 40 px, cu "3S" cel putin cat majusculele de 11 px', async ({ page }) => {
      await page.goto('/', { waitUntil: 'networkidle' })
      const prag = await majuscule(page, 11)
      await expect(page.locator(SIGLA_ANTET)).toHaveCount(1)
      const a = await analizeaza(page.locator(SIGLA_ANTET))
      console.log('[sigla antet] innerWidth CITIT: ' + (await page.evaluate(() => window.innerWidth)) + ' | prag ' + prag + ' | ' + descrie(a))
      verificaIconita(a, prag, 40)
    })

    test('subsolul are doar iconita, 56 px, cu "3S" cel putin cat majusculele de 11 px', async ({ page }) => {
      await page.goto('/', { waitUntil: 'networkidle' })
      const prag = await majuscule(page, 11)
      await expect(page.locator(SIGLA_SUBSOL)).toHaveCount(1)
      const a = await analizeaza(page.locator(SIGLA_SUBSOL))
      console.log('[sigla subsol] innerWidth CITIT: ' + (await page.evaluate(() => window.innerWidth)) + ' | prag ' + prag + ' | ' + descrie(a))
      verificaIconita(a, prag, 56)
    })
  })
}

test.describe('sigla in sertar si martorul la 390', () => {
  test.use({ viewport: { width: 390, height: 844 } })

  test('sertarul mobil are iconita, 40 px, cu "3S" cel putin cat majusculele de 11 px', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' })
    const prag = await majuscule(page, 11)
    await page.locator('[data-hamburger]').click()
    const sertar = page.locator('[data-sertar]')
    await expect(sertar).toBeVisible()
    const a = await analizeaza(sertar.locator('img[data-sigla="iconita"]'))
    console.log('[sigla sertar] innerWidth CITIT: ' + (await page.evaluate(() => window.innerWidth)) + ' | prag ' + prag + ' | ' + descrie(a))
    verificaIconita(a, prag, 40)
  })

  test('martor POZITIV: aceeasi iconita la 24 px are "3S" sub prag si e prinsa ca ilizibila', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' })
    const prag = await majuscule(page, 11)
    const src = await page.locator(SIGLA_ANTET).getAttribute('src')
    await page.evaluate((s) => {
      const i = document.createElement('img')
      i.src = s!
      i.alt = ''
      i.id = 'sigla-mica'
      i.style.cssText = 'position:fixed;left:0;top:200px;width:24px;height:24px;max-width:none;z-index:9999'
      document.body.appendChild(i)
    }, src)
    const a = await analizeaza(page.locator('#sigla-mica'))
    console.log('[sigla mica] innerWidth CITIT: ' + (await page.evaluate(() => window.innerWidth)) + ' | prag ' + prag + ' | ' + descrie(a))
    // Controlul: masuratoarea a gasit literele (nu zero), dar sub prag.
    expect(a.litere).toBeGreaterThan(0)
    expect(a.litere).toBeLessThan(prag)
  })
})
