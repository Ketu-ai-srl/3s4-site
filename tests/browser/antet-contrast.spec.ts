import AxeBuilder from '@axe-core/playwright'
import type { Page } from '@playwright/test'
import { expect, test } from './ajutor/baza'
import { pornesteCopia3sMd, type Copie3sMd } from './ajutor/copie-3s-md'

/**
 * Antetul global in starea de PASTILA, cand sub el trece o sectiune inchisa la culoare (testimonialul, blocul de
 * final): startul romanesc (build-ul probelor) si, pe COPIA construita cu variabilele aplicatiei 3s.md, startul EN.
 * Antetul e aceeasi piesa pe toate editiile; startul /ro al copiei nu are inca nicio sectiune inchisa la culoare
 * (masurat: zero pasi), deci acolo proba n-ar avea ce judeca si nu ruleaza.
 *
 * DE CE. Pastila e alba, semitransparenta, cu estompare peste ce trece dedesubt. Cu albul la 85%, peste o sectiune
 * inchisa fundalul compus ajungea la #dbdcdf, iar legaturile antetului (#666666) aveau 4,18:1, sub AA. Masurat si pe
 * startul EN, si pe cel RO: defectul e al piesei comune, nu al vreunei pagini.
 *
 * CE SE MASOARA, la 1440 (sub 1200 px antetul nu are text: sigla, lupa si hamburgerul). Pagina se parcurge in pasi;
 * la fiecare pas, cu antetul in starea `pastila`, fiecare element de text din antet se compune pe fundalul EFECTIV:
 * straturile din antet (elementul, stramosii lui, pastila) peste fundalul opac al paginii aflat SUB centrul lui
 * (`elementsFromPoint`, fara nodurile antetului). Pasii in care cel putin un element sta peste un fundal inchis
 * (luminanta relativa < 0,05) sunt cei judecati; pragul e 4,5:1 (text de 14 px, normal sau semiaccentuat, deci nu
 * "text mare"). Al doilea instrument, din alta familie: axe (`color-contrast`, numai pe antet) in pasul cel mai rau.
 *
 * CONTROALE. (1) Extragerea: macar un pas peste o sectiune inchisa si macar cinci elemente de text in antet, altfel
 * un "trece" ar veni dintr-o lista goala. (2) MARTORUL POZITIV: pe startul RO, peste o sectiune inchisa, pastilei i se
 * pune la rulare albul de dinainte de reparatie (85%); atat masurarea calculata, cat si axe trebuie sa-l acuze. Fara
 * el, pragul "trecut" ar putea veni dintr-o masurare care nu vede fundalul paginii de sub antet. (3) MARTORUL NEGATIV:
 * acelasi alb, peste o sectiune deschisa, nu e acuzat de niciunul, deci proba nu acuza pastila oriunde.
 *
 * LIMITA DECLARATA. Estomparea (`backdrop-filter`) nu intra in calcul: modelul ia fundalul sectiunii ca uniform. Pe
 * mijlocul unei sectiuni inchise estomparea nu schimba culoarea; la marginea ei amesteca fundalul inchis cu cel
 * deschis, adica ridica fundalul compus, deci contrastul real e cel putin cel masurat.
 */

const PRAG = 4.5
/** Sub aceasta luminanta relativa, fundalul de sub antet e "inchis la culoare". */
const PRAG_INCHIS = 0.05
/** Albul pastilei de dinainte de reparatie: martorul pozitiv. */
const ALFA_MARTOR = 0.85

type Masurare = {
  text: string
  culoare: string
  fundal: string
  dedesubt: string
  luminantaDedesubt: number
  raport: number
  eroare: string | null
}

/** Masoara fiecare element de text vizibil din antet, pe fundalul compus cu ce trece sub el. */
async function masoaraAntetul(page: Page): Promise<Masurare[]> {
  return page.evaluate(() => {
    const panza = document.createElement('canvas')
    panza.width = 1
    panza.height = 1
    const ctx = panza.getContext('2d', { willReadFrequently: true })
    if (ctx === null) throw new Error('panza 2D indisponibila')
    type Rgba = [number, number, number, number]
    type Rgb = [number, number, number]
    const rgba = (c: string): Rgba => {
      ctx.clearRect(0, 0, 1, 1)
      ctx.fillStyle = '#000'
      ctx.fillStyle = c
      ctx.fillRect(0, 0, 1, 1)
      const d = ctx.getImageData(0, 0, 1, 1).data
      return [d[0], d[1], d[2], d[3] / 255]
    }
    const peste = (sus: Rgba, jos: Rgb): Rgb => [
      sus[0] * sus[3] + jos[0] * (1 - sus[3]),
      sus[1] * sus[3] + jos[1] * (1 - sus[3]),
      sus[2] * sus[3] + jos[2] * (1 - sus[3]),
    ]
    const lum = (c: Rgb) => {
      const l = c.map((v) => {
        const s = v / 255
        return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
      })
      return 0.2126 * l[0] + 0.7152 * l[1] + 0.0722 * l[2]
    }
    const hex = (c: number[]) => '#' + c.map((v) => Math.round(v).toString(16).padStart(2, '0')).join('')

    const antet = document.querySelector('header[data-antet]')
    if (antet === null) throw new Error('antetul lipseste')

    // Elementele cu text propriu (un nod de text nevid), vizibile.
    const elemente = [...antet.querySelectorAll<HTMLElement>('*')].filter((el) => {
      const areText = [...el.childNodes].some((n) => n.nodeType === 3 && (n.textContent ?? '').trim() !== '')
      if (!areText) return false
      const r = el.getBoundingClientRect()
      const st = getComputedStyle(el)
      return r.width > 0 && r.height > 0 && st.visibility !== 'hidden' && el.closest('[hidden],[aria-hidden="true"]') === null
    })

    return elemente.map((el) => {
      let eroare: string | null = null
      let opacitate = 1
      const straturi: Rgba[] = []
      const opac = () => straturi.some((s) => s[3] >= 1)
      // Straturile din antet: elementul si stramosii lui, pana la antet inclusiv.
      for (let n: HTMLElement | null = el; n !== null; n = n.parentElement) {
        const st = getComputedStyle(n)
        opacitate *= Number(st.opacity)
        if (!opac()) {
          if (st.backgroundImage !== 'none') eroare ??= 'fundal cu imagine in antet pe ' + n.tagName.toLowerCase()
          const f = rgba(st.backgroundColor)
          if (f[3] > 0) straturi.push(f)
        }
        if (n === antet) break
      }
      // Fundalul paginii SUB centrul elementului: primul nod din afara antetului, urcat pana la primul opac.
      const r = el.getBoundingClientRect()
      const x = r.left + r.width / 2
      const y = r.top + r.height / 2
      const sub = document.elementsFromPoint(x, y).find((n) => !antet.contains(n)) as HTMLElement | undefined
      const dedesubtStraturi: Rgba[] = []
      for (let n: HTMLElement | null = sub ?? null; n !== null; n = n.parentElement) {
        if (dedesubtStraturi.some((s) => s[3] >= 1)) break
        const st = getComputedStyle(n)
        if (st.backgroundImage !== 'none') {
          eroare ??= 'fundal cu imagine sub antet pe ' + n.tagName.toLowerCase()
          break
        }
        const f = rgba(st.backgroundColor)
        if (f[3] > 0) dedesubtStraturi.push(f)
      }
      let dedesubt: Rgb = [255, 255, 255]
      for (let i = dedesubtStraturi.length - 1; i >= 0; i--) dedesubt = peste(dedesubtStraturi[i], dedesubt)
      // Straturile din antet se compun peste fundalul paginii (cel opac, daca exista, e ultimul si acopera tot).
      let fundal: Rgb = dedesubt
      for (let i = straturi.length - 1; i >= 0; i--) fundal = peste(straturi[i], fundal)
      const t = rgba(getComputedStyle(el).color)
      const culoare = peste([t[0], t[1], t[2], t[3] * opacitate], fundal)
      const a = lum(culoare)
      const b = lum(fundal)
      return {
        text: (el.textContent ?? '').trim(),
        culoare: hex(culoare),
        fundal: hex(fundal),
        dedesubt: hex(dedesubt),
        luminantaDedesubt: Math.round(lum(dedesubt) * 10000) / 10000,
        raport: Math.round(((Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)) * 100) / 100,
        eroare,
      }
    })
  })
}

type Pas = { y: number; masurari: Masurare[] }

/**
 * Parcurge pagina in pasi de 120 px si intoarce pasii in care antetul e pastila si macar un element de text sta peste
 * un fundal inchis. Pasii in care antetul a plecat (comandat de o piesa) nu se judeca.
 */
async function pasiPesteInchis(page: Page): Promise<Pas[]> {
  const inaltime = await page.evaluate(() => document.documentElement.scrollHeight)
  const pasi: Pas[] = []
  for (let y = 200; y <= inaltime; y += 120) {
    await page.evaluate((y) => window.scrollTo(0, y), y)
    await page.waitForTimeout(80)
    const stare = await page.locator('header[data-antet]').getAttribute('data-antet')
    if (stare !== 'pastila') continue
    const masurari = await masoaraAntetul(page)
    if (masurari.some((m) => m.eroare === null && m.luminantaDedesubt < PRAG_INCHIS)) pasi.push({ y, masurari })
  }
  return pasi
}

function judecati(p: Pas): Masurare[] {
  return p.masurari.filter((m) => m.eroare === null && m.luminantaDedesubt < PRAG_INCHIS)
}

function minim(p: Pas): number {
  return Math.min(...judecati(p).map((m) => m.raport))
}

async function axeAntet(page: Page): Promise<string[]> {
  const r = await new AxeBuilder({ page }).include('header[data-antet]').withRules(['color-contrast']).analyze()
  return r.violations.flatMap((v) => v.nodes.map((n) => v.id + ' ' + (n.target ?? []).join(' ')))
}

async function verifica(page: Page, adresa: string, eticheta: string): Promise<void> {
  await page.goto(adresa, { waitUntil: 'networkidle' })
  const pasi = await pasiPesteInchis(page)
  console.log('[antet-contrast] ' + eticheta + ' | pasi peste sectiuni inchise: ' + pasi.length)
  // Controlul 1: extragerea a gasit sectiuni inchise si text in antet.
  expect(pasi.length, 'pasi peste sectiuni inchise').toBeGreaterThan(0)
  const elementeText = Math.max(...pasi.map((p) => p.masurari.length))
  expect(elementeText, 'elemente de text in antet').toBeGreaterThanOrEqual(5)

  let celMaiRau = pasi[0]
  for (const p of pasi) {
    const sub = judecati(p).filter((m) => m.raport < PRAG)
    for (const m of sub)
      console.log('    SUB PRAG y=' + p.y + ' | ' + m.text + ' | ' + m.culoare + ' pe ' + m.fundal + ' = ' + m.raport + ':1')
    if (minim(p) < minim(celMaiRau)) celMaiRau = p
  }
  const rau = judecati(celMaiRau).reduce((a, b) => (b.raport < a.raport ? b : a))
  console.log(
    '[antet-contrast] ' + eticheta + ' | minim y=' + celMaiRau.y + ' | ' + rau.text + ' | ' + rau.culoare + ' pe ' +
      rau.fundal + ' (dedesubt ' + rau.dedesubt + ') = ' + rau.raport + ':1',
  )
  for (const p of pasi) expect(minim(p), 'contrastul minim la y=' + p.y).toBeGreaterThanOrEqual(PRAG)

  // Al doilea instrument, in pasul cel mai rau.
  await page.evaluate((y) => window.scrollTo(0, y), celMaiRau.y)
  await page.waitForTimeout(150)
  await expect(page.locator('header[data-antet]')).toHaveAttribute('data-antet', 'pastila')
  const axe = await axeAntet(page)
  console.log('[antet-contrast] ' + eticheta + ' | axe color-contrast pe antet: ' + axe.length)
  expect(axe).toEqual([])
}

/** Pune pe pastila, la rulare, un alb de opacitatea data (martorii). */
async function puneAlbul(page: Page, alfa: number): Promise<void> {
  await page.evaluate((alfa) => {
    const c = document.querySelector<HTMLElement>('header[data-antet] > div')
    if (c === null) throw new Error('containerul antetului lipseste')
    c.style.backgroundColor = 'rgba(255, 255, 255, ' + alfa + ')'
  }, alfa)
}

test.describe('antetul pastila peste sectiuni inchise, la 1440', () => {
  test.use({ viewport: { width: 1440, height: 900 } })

  test('startul romanesc (build-ul probelor)', async ({ page }) => {
    await verifica(page, '/', 'RO /')
  })

  test('martor POZITIV: albul de dinainte de reparatie, pus pe pastila peste o sectiune inchisa, e acuzat de masurare si de axe', async ({
    page,
  }) => {
    await page.goto('/', { waitUntil: 'networkidle' })
    const pasi = await pasiPesteInchis(page)
    expect(pasi.length, 'pasi peste sectiuni inchise').toBeGreaterThan(0)
    await page.evaluate((y) => window.scrollTo(0, y), pasi[0].y)
    await page.waitForTimeout(150)
    await expect(page.locator('header[data-antet]')).toHaveAttribute('data-antet', 'pastila')
    const inainte = Math.min(...judecati({ y: pasi[0].y, masurari: await masoaraAntetul(page) }).map((m) => m.raport))
    await puneAlbul(page, ALFA_MARTOR)
    const dupa = judecati({ y: pasi[0].y, masurari: await masoaraAntetul(page) }).map((m) => m.raport)
    const axe = await axeAntet(page)
    console.log(
      '[antet-contrast martor POZITIV] y=' + pasi[0].y + ' | ' + inainte + ':1 -> ' + Math.min(...dupa) + ':1 | axe ' + axe.length,
    )
    expect(dupa.length).toBeGreaterThan(0)
    expect(inainte).toBeGreaterThanOrEqual(PRAG)
    expect(Math.min(...dupa)).toBeLessThan(PRAG)
    expect(axe.length).toBeGreaterThan(0)
  })

  test('martor NEGATIV: acelasi alb, peste o sectiune deschisa, nu e acuzat', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' })
    // Primul pas cu antetul pastila in care TOT textul antetului sta peste un fundal deschis.
    const inaltime = await page.evaluate(() => document.documentElement.scrollHeight)
    let gasit: number | null = null
    for (let y = 200; y <= inaltime && gasit === null; y += 120) {
      await page.evaluate((y) => window.scrollTo(0, y), y)
      await page.waitForTimeout(80)
      if ((await page.locator('header[data-antet]').getAttribute('data-antet')) !== 'pastila') continue
      const m = await masoaraAntetul(page)
      if (m.length >= 5 && m.every((x) => x.eroare === null && x.luminantaDedesubt > 0.8)) gasit = y
    }
    expect(gasit, 'un pas peste o sectiune deschisa').not.toBeNull()
    await puneAlbul(page, ALFA_MARTOR)
    const m = await masoaraAntetul(page)
    const axe = await axeAntet(page)
    console.log('[antet-contrast martor NEGATIV] y=' + gasit + ' | minim ' + Math.min(...m.map((x) => x.raport)) + ':1 | axe ' + axe.length)
    expect(Math.min(...m.map((x) => x.raport))).toBeGreaterThanOrEqual(PRAG)
    expect(axe).toEqual([])
  })

  test.describe('copia 3s.md', () => {
    let copie: Copie3sMd

    test.beforeAll(async () => {
      test.setTimeout(600_000)
      copie = await pornesteCopia3sMd()
    })

    test.afterAll(async () => {
      await copie?.opreste()
    })

    test('startul EN', async ({ page }) => {
      await verifica(page, copie.baza + '/', 'EN /')
    })
  })
})
