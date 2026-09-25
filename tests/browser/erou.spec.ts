import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Locator, type Page } from '@playwright/test'
import { EROU } from '../../src/content/acasa'
import { MACHETA, TUR } from '../../src/content/acasa-erou'
import { masoaraAccesibilitatea } from './ajutor/detectori'

/**
 * Eroul paginii de start in navigator (felia `erou`, valul S4-2; fisa acasa-erou.md).
 *
 * CE MASOARA, pe fiecare latime cu `innerWidth` CITIT din pagina:
 *   - bucla: viteza cometei (un tur in 12 000 ms, deci 116,4 u/s), punctele, pulsurile nodurilor si
 *     ale centrului; la miscare redusa, starea statica (cometa la 30%, fara puncte);
 *   - intrarea coloanei: titlul, elementul LCP, nu porneste de la opacitate 0;
 *   - popover-ul primei pastile: hover, tastatura, Escape (abatere: la referinta Escape nu inchide),
 *     la 390 pe ecran tactil ramanerea in fereastra (la referinta ieseau 33,9 px) si, fara
 *     JavaScript, textul lui in HTML-ul servit;
 *   - pe 15 latimi, 320-1440: nicio eticheta (de nod sau de lob) sub centru, sub pastila lui sau
 *     sub un disc, niciun disc sub pastila, nimic in afara ferestrei (defecte ale referintei la
 *     latimi mici, corectate). Centrul si pastila se masoara la scala maxima a respiratiei;
 *   - macheta: lansarea, turul, aplicatia cu 4 ecrane, rama de telefon, intoarcerea la bucla,
 *     cadrul 3D PE PIXELI contra masuratorii (si dupa pornirea plutirii), paralaxa, foile
 *     zburatoare, accesibilitatea fiecarui ecran (axe nu o vede altfel: in repaus macheta nu
 *     exista in pagina) si bucata machetei care nu vine (bucla ramane, al doilea clic reincearca);
 *   - aplicatia construita dinainte, in timpul turului: exista, dar nimic din ea nu se vede peste
 *     tur, iar in aplicatie nimic din ecranele ascunse nu se vede peste cel afisat;
 *   - tintele turului in scena 3D, pe ecran (WCAG 2.5.8, axe target-size), pe 4 latimi;
 *   - latenta interactiunilor machetei (Event Timing, CPU incetinit x4, plan §8.4: <= 200 ms).
 *
 * Probele ruleaza implicit cu miscare redusa (playwright.config.ts); cele care masoara miscarea
 * cer `no-preference` explicit. Centrul respira, deci fara miscare redusa clicul pe el se da cu
 * `force`: Playwright asteapta altfel un element nemiscat, iar un om nu are nevoie de asta.
 */

const erou = (page: Page) => page.locator('[data-ciot="erou"]')
const centru = (page: Page) => erou(page).locator('button').filter({ hasText: EROU.bucla.centru.pastila })
const pastila = (page: Page) => erou(page).locator('button[aria-controls]')
const macheta = (page: Page) => erou(page).getByRole('figure', { name: MACHETA.declaratie })

async function deschide(page: Page, latime: number): Promise<void> {
  await page.goto('/', { waitUntil: 'networkidle' })
  // Hidratarea: centrul devine buton abia dupa montare.
  await expect(centru(page)).toHaveCount(1)
  expect(await page.evaluate(() => window.innerWidth), 'innerWidth CITIT').toBe(latime)
}

async function lanseaza(page: Page, forta = false): Promise<void> {
  await centru(page).click({ force: forta })
  await expect(macheta(page)).toBeVisible()
}

/** Pana la aplicatie: sageata "urmatoarea" pe cele 3 scene (la miscare redusa nu exista avans automat). */
async function panaLaAplicatie(page: Page): Promise<void> {
  for (let i = 0; i < TUR.scene.length; i++) {
    await macheta(page).getByRole('button', { name: TUR.urmatoarea }).click()
  }
  await expect(macheta(page).locator('[data-cadru="aplicatie"]')).toBeVisible()
}

/** Scala maxima a respiratiei centrului (fisa §1.4.7). Pastila e parte din buton si creste cu el. */
const RESPIRATIE = 1.045

/**
 * Suprapunerile din bucla, ca lista de propozitii (goala = curat). Centrul e un cerc, discurile
 * sunt cercuri de 46 px; centrul si pastila se iau la scala maxima a respiratiei, in jurul
 * mijlocului centrului. Se cer si numerele: 4 etichete de nod si 2 de lob, altfel o lista goala ar
 * putea veni dintr-un selector care nu mai gaseste nimic.
 */
async function suprapuneriBucla(page: Page): Promise<string[]> {
  const g = await erou(page).evaluate((s) => {
    const cutie = (e: Element) => {
      const r = e.getBoundingClientRect()
      return { x: r.x, y: r.y, w: r.width, h: r.height }
    }
    const pastilaEl = s.querySelector('[data-pastila-centru]')
    const centruEl = pastilaEl?.parentElement
    return {
      latime: window.innerWidth,
      centru: centruEl ? cutie(centruEl) : null,
      pastila: pastilaEl ? cutie(pastilaEl) : null,
      etichete: [
        ...[...s.querySelectorAll('[data-eticheta-nod]')].map((e) => ({ fel: 'eticheta', text: e.textContent ?? '', cutie: cutie(e) })),
        ...[...s.querySelectorAll('[data-eticheta-lob]')].map((e) => ({ fel: 'lob', text: e.textContent ?? '', cutie: cutie(e) })),
      ],
      discuri: [...s.querySelectorAll('[data-nod]')].map((e) => ({ nume: e.getAttribute('data-nod') ?? '', cutie: cutie(e) })),
    }
  })
  type Cutie = { x: number; y: number; w: number; h: number }
  const probleme: string[] = []
  if (!g.centru || !g.pastila) return ['centrul sau pastila lui lipsesc']
  const noduri = g.etichete.filter((e) => e.fel === 'eticheta').length
  const lobi = g.etichete.filter((e) => e.fel === 'lob').length
  if (noduri !== 4 || lobi !== 2 || g.discuri.length !== 4) return ['numaratoare gresita: ' + noduri + ' etichete de nod, ' + lobi + ' de lob, ' + g.discuri.length + ' discuri']

  const cx = g.centru.x + g.centru.w / 2
  const cy = g.centru.y + g.centru.h / 2
  const scalat = (b: Cutie): Cutie => ({ x: cx + (b.x - cx) * RESPIRATIE, y: cy + (b.y - cy) * RESPIRATIE, w: b.w * RESPIRATIE, h: b.h * RESPIRATIE })
  const pastilaMax = scalat(g.pastila)
  /** Cat intra cercul in cutie, in px (0 = nu se ating). */
  const inCerc = (b: Cutie, x: number, y: number, r: number) => r - Math.hypot(Math.max(b.x, Math.min(x, b.x + b.w)) - x, Math.max(b.y, Math.min(y, b.y + b.h)) - y)
  const arie = (a: Cutie, b: Cutie) =>
    Math.max(0, Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x)) * Math.max(0, Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y))
  const disc = (d: Cutie) => ({ x: d.x + d.w / 2, y: d.y + d.h / 2, r: d.w / 2 })

  for (const e of g.etichete) {
    const nume = e.fel + ' ' + e.text
    const subCentru = inCerc(e.cutie, cx, cy, (g.centru.w / 2) * RESPIRATIE)
    if (subCentru > 0.5) probleme.push(nume + ' sub centru (' + subCentru.toFixed(1) + ' px)')
    if (arie(e.cutie, pastilaMax) > 1) probleme.push(nume + ' sub pastila centrului')
    for (const d of g.discuri) {
      const c = disc(d.cutie)
      if (inCerc(e.cutie, c.x, c.y, c.r) > 0.5) probleme.push(nume + ' sub discul ' + d.nume)
    }
    if (e.cutie.x < 0 || e.cutie.x + e.cutie.w > g.latime) probleme.push(nume + ' iese din fereastra')
  }
  for (const d of g.discuri) {
    const c = disc(d.cutie)
    const sub = inCerc(pastilaMax, c.x, c.y, c.r)
    if (sub > 0.5) probleme.push('discul ' + d.nume + ' sub pastila centrului (' + sub.toFixed(1) + ' px)')
  }
  return probleme
}

type CadruPictat = { x: number; y: number; w: number; h: number; stanga: number; dreapta: number }

/**
 * Cadrul machetei asa cum e PICTAT, nu cum il raporteaza geometria. Cadrul se vopseste magenta
 * (copiii ascunsi, fara umbra), iar ce il poate acoperi se ascunde: butonul "inapoi" (peste coltul
 * din stanga-jos), fantoma si reflexia (reflexia e in acelasi plan si se picteaza peste marginea de
 * jos). Se face captura ferestrei si se citesc pixelii: cutia vopselei si INTINDEREA ei (primul si
 * ultimul rand vopsit) pe coloanele de la 40 px de fiecare margine. In perspectiva latura mai
 * departata e mai scurta; pe o proiectie plata cele doua intinderi sunt egale.
 *
 * De ce pe pixeli: `getBoundingClientRect` raporta cutia 3D a referintei si cand cadrul se picta
 * PLAT (figura dintre spatiu si plutitor aplatiza contextul 3D), deci o proba pe geometrie trecea
 * chiar pe defect. Masurat pe forma defecta: geometria 639,6 / 320,3 / 776,5 x 412,6, pixelii
 * 582 / 317 / 844 x 418, cu intinderi egale (418 si 418).
 */
async function cadruPictat(page: Page): Promise<CadruPictat> {
  await macheta(page).evaluate((f) => {
    const ascunde = (e: Element) => (e as HTMLElement).style.setProperty('visibility', 'hidden', 'important')
    const cadru = f.querySelector('[data-cadru]') as HTMLElement
    cadru.style.setProperty('background', 'rgb(255, 0, 255)', 'important')
    cadru.style.setProperty('box-shadow', 'none', 'important')
    cadru.style.setProperty('outline', 'none', 'important')
    for (const copil of Array.from(cadru.children)) ascunde(copil)
    for (const b of Array.from(f.querySelectorAll(':scope > button'))) ascunde(b)
    for (const vecin of Array.from(cadru.parentElement?.children ?? [])) if (vecin !== cadru) ascunde(vecin)
  })
  const png = (await page.screenshot()).toString('base64')
  return page.evaluate(async (b64) => {
    const img = new Image()
    img.src = 'data:image/png;base64,' + b64
    await img.decode()
    const panza = document.createElement('canvas')
    panza.width = img.naturalWidth
    panza.height = img.naturalHeight
    const ctx = panza.getContext('2d')
    if (!ctx) throw new Error('fara context 2d')
    ctx.drawImage(img, 0, 0)
    const { data, width, height } = ctx.getImageData(0, 0, panza.width, panza.height)
    const vopsit = (x: number, y: number) => {
      const i = (y * width + x) * 4
      return data[i] > 200 && data[i + 1] < 80 && data[i + 2] > 200
    }
    let x0 = width
    let x1 = -1
    let y0 = height
    let y1 = -1
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (!vopsit(x, y)) continue
        if (x < x0) x0 = x
        if (x > x1) x1 = x
        if (y < y0) y0 = y
        if (y > y1) y1 = y
      }
    }
    const intindere = (x: number) => {
      let sus = -1
      let jos = -1
      for (let y = 0; y < height; y++) {
        if (!vopsit(x, y)) continue
        if (sus < 0) sus = y
        jos = y
      }
      return sus < 0 ? 0 : jos - sus + 1
    }
    return { x: x0, y: y0, w: x1 - x0 + 1, h: y1 - y0 + 1, stanga: intindere(x0 + 40), dreapta: intindere(x1 - 40) }
  }, png)
}

test.describe('bucla, fara miscare redusa, la 1440', () => {
  test.use({ viewport: { width: 1440, height: 900 }, reducedMotion: 'no-preference' })

  test('cometa face un tur in 12 000 ms (116,4 u/s), cu 9 puncte pe drum', async ({ page }) => {
    await deschide(page, 1440)
    const citeste = () =>
      page.evaluate(() => {
        const p = document.querySelector('[data-ciot="erou"] [data-cometa]')
        return { t: performance.now(), o: Number(p?.getAttribute('stroke-dashoffset')) }
      })
    const a = await citeste()
    await page.waitForTimeout(2000)
    const b = await citeste()
    const lungime = 1396.34
    const parcurs = (((a.o - b.o) % lungime) + lungime) % lungime
    const viteza = parcurs / (b.t - a.t)
    console.log('[bucla] dashoffset ' + a.o + ' -> ' + b.o + ' in ' + Math.round(b.t - a.t) + ' ms; viteza ' + (viteza * 1000).toFixed(1) + ' u/s')
    expect(Math.abs(viteza * 1000 - lungime / 12) / (lungime / 12)).toBeLessThan(0.04)
    // Numai cercurile punctelor: iconitele din erou (butonul "play", globul) au si ele cercuri.
    const puncte = await erou(page).locator('[data-puncte] circle').evaluateAll((c) => c.filter((x) => Number(x.getAttribute('cx')) > 0).length)
    expect(puncte).toBe(9)
  })

  test('pulsurile: fiecare nod o data la 4 s, centrul o data la 2 s (inele vazute pe pseudo-elemente)', async ({ page }) => {
    await deschide(page, 1440)
    // Fiecare puls porneste o animatie NOUA pe pseudo-elementul inelului; se numara obiectele
    // distincte de animatie, nu starea clasei (clasa ramane pusa intre doua pulsuri).
    const vazute = await erou(page).evaluate(async (s) => {
      const tinte = [
        ...[...s.querySelectorAll('[data-nod]')].map((el) => ({ nume: el.getAttribute('data-nod') ?? '', el, pseudo: '::after' })),
        { nume: 'centru', el: s.querySelector('[data-pastila-centru]')?.parentElement as Element, pseudo: '::before' },
      ]
      const vazute: Record<string, Set<Animation>> = {}
      for (const t of tinte) vazute[t.nume] = new Set()
      const final = performance.now() + 4600
      while (performance.now() < final) {
        for (const t of tinte) {
          for (const a of t.el.getAnimations({ subtree: true })) {
            if ((a.effect as KeyframeEffect | null)?.pseudoElement === t.pseudo) vazute[t.nume].add(a)
          }
        }
        await new Promise((r) => setTimeout(r, 30))
      }
      return Object.fromEntries(Object.entries(vazute).map(([k, v]) => [k, v.size]))
    })
    console.log('[pulsuri in 4,6 s] ' + JSON.stringify(vazute))
    for (const nod of ['sus-stanga', 'jos-stanga', 'sus-dreapta', 'jos-dreapta']) expect(vazute[nod] ?? 0, nod).toBeGreaterThanOrEqual(1)
    expect(vazute.centru ?? 0).toBeGreaterThanOrEqual(2)
  })

  // Pe drumul primei picturi: la 390 cu procesorul incetinit x4 si 4G, titlul tinut la opacitate 0
  // in intrarea coloanei a impins LCP-ul peste 2,5 s (plan §8.4; masurat de doua ori, cate 6
  // rulari: 2 si 4 peste prag). Masuratoarea de LCP ramane in afara portii, fiindca depinde de
  // incarcarea masinii; aici se citesc cadrele-cheie ale animatiilor de pe titlu si de pe TOTI
  // stramosii lui pana la sectiune: niciun cadru cu opacitate sub 1. Martorul din aceeasi
  // masuratoare: pastilele si butoanele isi pastreaza intrarea (opacitate 0 -> 1), deci citirea
  // cadrelor chiar vede o intrare cand exista.
  test('titlul, elementul LCP, nu porneste de la opacitate 0; pastilele si butoanele intra in trepte', async ({ page }) => {
    await deschide(page, 1440)
    const minime = await erou(page).evaluate((s) => {
      const minimPeLant = (el: Element | null) => {
        let minim = 1
        for (let e = el; e && e !== s.parentElement; e = e.parentElement) {
          for (const a of e.getAnimations()) {
            for (const k of (a.effect as KeyframeEffect).getKeyframes()) {
              if (k.opacity !== undefined && k.opacity !== null) minim = Math.min(minim, Number(k.opacity))
            }
          }
        }
        return minim
      }
      return {
        titlu: minimPeLant(s.querySelector('h1')),
        pastile: minimPeLant(s.querySelector('[aria-controls="erou-popover"]')),
        butoane: minimPeLant(s.querySelector('a[href="/inregistrare"], [data-tinta-lipsa="/inregistrare"]')),
      }
    })
    console.log('[intrarea coloanei] opacitatea minima pe lant: ' + JSON.stringify(minime))
    expect(minime.titlu).toBe(1)
    expect(minime.pastile).toBe(0)
    expect(minime.butoane).toBe(0)
  })
})

test.describe('bucla cu miscare redusa, la 1440', () => {
  test.use({ viewport: { width: 1440, height: 900 } })

  test('martor NEGATIV: cometa sta la 30% si nu exista puncte; centrul nu respira', async ({ page }) => {
    await deschide(page, 1440)
    const offset = () => erou(page).locator('[data-cometa]').getAttribute('stroke-dashoffset')
    const inainte = await offset()
    await page.waitForTimeout(800)
    expect(await offset()).toBe(inainte)
    expect(inainte).toBe((-(0.3 - 0.1) * 1396.34).toFixed(2))
    expect(await erou(page).locator('[data-puncte] circle').count()).toBe(0)
    expect(await centru(page).evaluate((b) => getComputedStyle(b).animationName)).toBe('none')
  })
})

test.describe('popover-ul primei pastile, la 1440', () => {
  test.use({ viewport: { width: 1440, height: 900 } })

  test('hover deschide, iesirea inchide; de la tastatura Enter deschide si Escape inchide', async ({ page }) => {
    await deschide(page, 1440)
    const popover = erou(page).locator('#erou-popover')
    await pastila(page).hover()
    await expect(pastila(page)).toHaveAttribute('aria-expanded', 'true')
    await expect(popover).toBeVisible()
    const cutie = await popover.boundingBox()
    console.log('[popover 1440] ' + JSON.stringify(cutie))
    // Fisa: 320 x 233,2, la 10 px sub pastila, aliniat la marginea ei stanga.
    expect(cutie?.width).toBeCloseTo(320, 0)
    await page.mouse.move(700, 880)
    await expect(pastila(page)).toHaveAttribute('aria-expanded', 'false')
    await expect(popover).toBeHidden()

    await pastila(page).focus()
    await page.keyboard.press('Enter')
    await expect(popover).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(popover).toBeHidden()
    await expect(pastila(page)).toBeFocused()
  })
})

test.describe('popover-ul fara JavaScript (HTML-ul servit)', () => {
  test.use({ viewport: { width: 1440, height: 900 }, javaScriptEnabled: false })

  // Afirmatiile de incredere si legatura interna se citesc si fara JavaScript (plan §8, G-AI-01):
  // un robot care nu executa scripturi le gaseste in HTML, nu doar in datele RSC din <script>.
  // Controlul ca pagina chiar e cea servita: pastila e `span`, nu buton (nimic nu s-a hidratat).
  test('panoul e in HTML: cele 3 randuri si legatura spre securitate, ascunse pana la deschidere', async ({ page }) => {
    await page.goto('/')
    await expect(erou(page).locator('button[aria-controls]')).toHaveCount(0)
    await expect(erou(page).getByText(EROU.pastile.intrebare.text)).toHaveCount(1)
    const popover = erou(page).locator('#erou-popover')
    await expect(popover).toHaveCount(1)
    await expect(popover).toBeHidden()
    const text = (await popover.textContent()) ?? ''
    for (const r of EROU.popover.randuri) expect(text).toContain(r.text)
    expect(text).toContain(EROU.popover.legatura.text)
    const href = EROU.popover.legatura.href ?? ''
    await expect(popover.locator('[href="' + href + '"], [data-tinta-lipsa="' + href + '"]')).toHaveCount(1)
  })
})

test.describe('la 390, ecran tactil', () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true })

  /** Cat iese popover-ul din fereastra, in px (0 = incape). */
  const iesire = (page: Page) =>
    erou(page)
      .locator('#erou-popover')
      .evaluate((p) => {
        const r = p.getBoundingClientRect()
        return Math.max(0, r.right - window.innerWidth, -r.left)
      })

  test('popover-ul deschis la atingere ramane in fereastra', async ({ page }) => {
    await deschide(page, 390)
    await pastila(page).tap()
    await expect(pastila(page)).toHaveAttribute('aria-expanded', 'true')
    expect(await iesire(page)).toBe(0)
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390)
  })

  test('martor POZITIV: popover-ul asezat ca la referinta (320, aliniat la pastila) e prins ca iesit', async ({ page }) => {
    await deschide(page, 390)
    await pastila(page).tap()
    await erou(page).locator('#erou-popover').evaluate((p) => {
      const el = p as HTMLElement
      el.style.translate = 'none'
      el.style.left = '0px'
      el.style.width = '320px'
    })
    const iese = await iesire(page)
    console.log('[popover 390, asezarea referintei] iese cu ' + iese.toFixed(1) + ' px')
    expect(iese).toBeGreaterThan(10)
  })
})

test.describe('etichetele, discurile si pastila centrului, pe latimi', () => {
  test.use({ viewport: { width: 1440, height: 900 } })

  // Latimile de telefon cele mai dese, capetele benzii in care pastila coboara sub discuri (scena
  // pana la 700 px: 732 inauntru, 736 in afara), tableta si desktopul.
  const LATIMI = [320, 360, 375, 390, 414, 480, 540, 600, 700, 732, 736, 768, 1024, 1180, 1440]

  test('nicio eticheta sub centru, sub pastila sau sub un disc; niciun disc sub pastila', async ({ page }) => {
    const gasite: string[] = []
    for (const latime of LATIMI) {
      await page.setViewportSize({ width: latime, height: 900 })
      await deschide(page, latime)
      const probleme = await suprapuneriBucla(page)
      console.log('[bucla ' + latime + '] ' + (probleme.length ? probleme.join(' | ') : 'curat'))
      for (const p of probleme) gasite.push(latime + ': ' + p)
    }
    expect(gasite).toEqual([])
  })

  test('martor POZITIV: la 390, asezarea referintei (eticheta sub disc, pastila la 12 px) e prinsa', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await deschide(page, 390)
    await erou(page).evaluate((s) => {
      for (const e of s.querySelectorAll('[data-eticheta-nod]')) {
        const el = e as HTMLElement
        el.style.position = 'static'
        el.style.transform = 'none'
        const nod = el.parentElement as HTMLElement
        nod.style.display = 'flex'
        nod.style.flexDirection = 'column'
        nod.style.alignItems = 'center'
        nod.style.width = 'auto'
        nod.style.height = 'auto'
        nod.style.gap = '6px'
      }
      const p = s.querySelector('[data-pastila-centru]') as HTMLElement
      p.style.top = 'calc(100% + 12px)'
    })
    const gasite = await suprapuneriBucla(page)
    console.log('[390, asezarea referintei] ' + gasite.join(' / '))
    expect(gasite.filter((g) => g.startsWith('eticheta ') && g.includes('sub centru')).length).toBeGreaterThan(0)
  })

  test('martor POZITIV: la 320, lobii asezati ca la referinta (26% / 74%) sunt prinsi sub centru', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 900 })
    await deschide(page, 320)
    await erou(page).evaluate((s) => {
      s.querySelectorAll('[data-eticheta-lob]').forEach((e, i) => {
        const lob = e.parentElement as HTMLElement
        lob.style.display = 'block'
        lob.style.left = i === 0 ? '26%' : '74%'
        lob.style.right = 'auto'
        lob.style.transform = 'translate(-50%, -50%)'
      })
    })
    const gasite = await suprapuneriBucla(page)
    console.log('[320, lobii referintei] ' + gasite.join(' / '))
    expect(gasite.filter((g) => g.startsWith('lob ') && g.includes('sub centru')).length).toBe(2)
  })

  test('martor POZITIV: la 480, pastila la distanta fixa de sub centru e prinsa peste discurile de jos', async ({ page }) => {
    await page.setViewportSize({ width: 480, height: 900 })
    await deschide(page, 480)
    await erou(page).locator('[data-pastila-centru]').evaluate((p) => {
      ;(p as HTMLElement).style.top = 'calc(100% + 16px)'
    })
    const gasite = await suprapuneriBucla(page)
    console.log('[480, pastila la 16 px] ' + gasite.join(' / '))
    expect(gasite.filter((g) => g.startsWith('discul ') && g.includes('sub pastila')).length).toBe(2)
  })
})

test.describe('macheta, cu miscare redusa, la 1440', () => {
  test.use({ viewport: { width: 1440, height: 900 } })

  test('clic pe centru: turul direct pe scena 1, apoi aplicatia cu 4 ecrane, apoi inapoi la bucla', async ({ page }) => {
    await deschide(page, 1440)
    await lanseaza(page)
    // Fara bun-venit la miscare redusa (fisa §1.6.4).
    await expect(macheta(page).getByRole('heading', { name: TUR.scene[0].titlu })).toBeVisible()
    await expect(macheta(page).getByText(TUR.bunVenit)).toHaveCount(0)
    // Bucla ramane in pagina cat se vede macheta, doar ascunsa (ScenaErou.tsx).
    await expect(erou(page).locator('[data-cometa]')).toBeHidden()

    // Geometria plana a cadrului (fisa: 861,7 x 420 in tur, 477,7 in aplicatie). Cutia proiectata
    // se masoara pe pixeli, in proba de mai jos.
    const cadru = macheta(page).locator('[data-cadru]')
    const plan = await cadru.evaluate((c) => [(c as HTMLElement).offsetWidth, (c as HTMLElement).offsetHeight])
    console.log('[cadru 1440] plan ' + plan.join(' x '))
    expect(Math.abs(plan[0] - 861.7)).toBeLessThan(2)
    expect(Math.abs(plan[1] - 420)).toBeLessThan(2)

    // Punctele sar direct; sageata stanga e circulara.
    await macheta(page).getByRole('button', { name: TUR.punct(3, 3) }).click()
    await expect(macheta(page).getByRole('heading', { name: TUR.scene[2].titlu })).toBeVisible()
    await macheta(page).getByRole('button', { name: TUR.anterioara }).click()
    await expect(macheta(page).getByRole('heading', { name: TUR.scene[1].titlu })).toBeVisible()
    await macheta(page).getByRole('button', { name: TUR.punct(1, 3) }).click()

    await panaLaAplicatie(page)
    const meniu = macheta(page).getByRole('navigation', { name: MACHETA.etichetaMeniu })
    await expect(meniu.getByRole('button')).toHaveCount(4)
    await expect(macheta(page).getByText(MACHETA.primite.adresaPrimire)).toBeVisible()
    await meniu.getByRole('button', { name: MACHETA.meniu[1].text }).click()
    await expect(macheta(page).getByText(MACHETA.documente.spatiu)).toBeVisible()
    await meniu.getByRole('button', { name: MACHETA.meniu[2].text }).click()
    await expect(macheta(page).getByText(MACHETA.cautare.gasite)).toBeVisible()
    await meniu.getByRole('button', { name: MACHETA.meniu[3].text }).click()
    await expect(macheta(page).getByText(MACHETA.portal.firma.nume)).toBeVisible()
    const planAplicatie = await cadru.evaluate((c) => (c as HTMLElement).offsetHeight)
    expect(Math.abs(planAplicatie - 477.7)).toBeLessThan(2)

    await macheta(page).getByRole('button', { name: MACHETA.inapoi }).click()
    await expect(macheta(page)).toHaveCount(0)
    await expect(centru(page)).toBeFocused()
    await expect(erou(page).locator('[data-cometa]')).toHaveCount(1)
    await expect(erou(page).locator('[data-cometa]')).toBeVisible()
  })

  // Cutia masurata pe referinta: 639,6 / 320,3, 776,5 x 412,6. Toleranta de 3-4 px: marginile
  // netezite ale vopselei trec pragul de culoare cu un pixel mai devreme sau mai tarziu.
  test('cadrul 3D se picteaza in perspectiva, in cutia referintei (masurat pe pixeli)', async ({ page }) => {
    await deschide(page, 1440)
    await lanseaza(page)
    const c = await cadruPictat(page)
    console.log('[cadru pictat 1440] ' + JSON.stringify(c) + ' raport stanga/dreapta ' + (c.stanga / c.dreapta).toFixed(3))
    expect(Math.abs(c.x - 639.6)).toBeLessThan(3)
    expect(Math.abs(c.y - 320.3)).toBeLessThan(3)
    expect(Math.abs(c.w - 776.5)).toBeLessThan(4)
    expect(Math.abs(c.h - 412.6)).toBeLessThan(4)
    expect(c.stanga / c.dreapta).toBeLessThan(0.95)
  })

  test('martor POZITIV: figura plata (contextul 3D rupt) e prinsa pe pixeli', async ({ page }) => {
    await deschide(page, 1440)
    await lanseaza(page)
    await macheta(page).evaluate((f) => {
      ;(f as HTMLElement).style.setProperty('transform-style', 'flat', 'important')
    })
    const c = await cadruPictat(page)
    console.log('[cadru pictat, figura plata] ' + JSON.stringify(c) + ' raport ' + (c.stanga / c.dreapta).toFixed(3))
    expect(c.stanga / c.dreapta).toBeGreaterThan(0.98)
    expect(Math.abs(c.x - 639.6)).toBeGreaterThan(20)
  })

  // O livrare noua cu o fila veche deschisa, sau reteaua mobila cazuta: bucata machetei nu vine.
  // Se opreste DOAR bucata care poarta macheta (recunoscuta dupa continut, nu dupa numarul ei,
  // care se schimba de la un build la altul). Controlul ca oprirea chiar a avut loc: contorul.
  // Fazele prin care trece spatiul se inregistreaza: bucla nu are voie nici macar sa inceapa
  // iesirea, altfel o cerere care atarna ar lasa scena goala cat atarna.
  test('bucata machetei nu vine: bucla ramane, fara erori necapturate; al doilea clic reincearca', async ({ page }) => {
    let opreste = true
    let oprite = 0
    await page.route('**/_next/static/chunks/**', async (route) => {
      const raspuns = await route.fetch()
      const corp = await raspuns.text()
      if (opreste && corp.includes('data-etapa')) {
        oprite++
        await route.abort()
        return
      }
      await route.fulfill({ response: raspuns, body: corp })
    })
    const erori: string[] = []
    page.on('pageerror', (e) => erori.push(e.message))
    await deschide(page, 1440)
    const spatiu = erou(page).locator('[data-faza]')
    await spatiu.evaluate((el) => {
      const w = window as Window & { __faze?: string[] }
      w.__faze = [el.getAttribute('data-faza') ?? '']
      new MutationObserver(() => w.__faze?.push(el.getAttribute('data-faza') ?? '')).observe(el, { attributeFilter: ['data-faza'] })
    })
    await centru(page).click()
    await expect.poll(() => oprite).toBeGreaterThan(0)
    // Cat sa se fi terminat si iesirea (330 ms) daca ar fi pornit.
    await page.waitForTimeout(600)
    await expect(spatiu).toHaveAttribute('data-faza', 'bucla')
    await expect(centru(page)).toBeEnabled()
    await expect(erou(page).locator('[data-cometa]')).toHaveCount(1)
    await expect(macheta(page)).toHaveCount(0)
    const faze = await page.evaluate(() => (window as Window & { __faze?: string[] }).__faze ?? [])
    console.log('[bucata oprita] cereri oprite: ' + oprite + '; faze: ' + faze.join(' > ') + '; erori: ' + (erori.join(' | ') || 'niciuna'))
    expect(faze).toEqual(['bucla'])
    expect(erori).toEqual([])

    opreste = false
    await centru(page).click()
    await expect(macheta(page)).toBeVisible()
  })

  test('axe pe macheta lansata: turul si cele 4 ecrane, zero incalcari serious sau critical', async ({ page }) => {
    await deschide(page, 1440)
    await lanseaza(page)
    const grave: string[] = []
    const masoara = async (unde: string) => {
      const m = await masoaraAccesibilitatea(page)
      for (const g of m.grave) grave.push(unde + ': ' + g.regula + ' (' + g.tinte.join(' | ') + ')')
      console.log('[axe macheta] ' + unde + ': ' + m.reguliRulate + ' reguli, blocante ' + m.grave.length)
    }
    await masoara('tur')
    await panaLaAplicatie(page)
    const meniu = macheta(page).getByRole('navigation', { name: MACHETA.etichetaMeniu })
    for (const e of MACHETA.meniu) {
      await meniu.getByRole('button', { name: e.text }).click()
      // Ecranul afisat urmeaza fila printr-o tranzitie (Aplicatie.tsx): axe ruleaza pe el, nu pe cel dinainte.
      await expect(macheta(page).locator('[data-ecran="' + e.cheie + '"]')).toBeVisible()
      await masoara(e.cheie)
    }
    expect(grave).toEqual([])
  })
})

test.describe('macheta fara miscare redusa, la 1440', () => {
  test.use({ viewport: { width: 1440, height: 900 }, reducedMotion: 'no-preference' })

  test('bun-venitul, apoi scena 1 (la ~3,25 s de la clic); paralaxa urmeaza mouse-ul', async ({ page }) => {
    await deschide(page, 1440)
    await page.mouse.move(700, 450)
    const t0 = Date.now()
    await lanseaza(page, true)
    await expect(macheta(page).getByText(TUR.bunVenit)).toBeVisible()
    await expect(macheta(page).getByRole('heading', { name: TUR.scene[0].titlu })).toBeVisible({ timeout: 6000 })
    const dupa = Date.now() - t0
    console.log('[tur 1440] scena 1 la ' + dupa + ' ms de la clic (fisa: 3251)')
    expect(dupa).toBeGreaterThan(2500)

    // Paralaxa (fisa §1.6.3): colturile de jos dau rx -3,84 si ry +-3,84 grade.
    const cutie = await erou(page).boundingBox()
    await page.mouse.move((cutie?.x ?? 0) + (cutie?.width ?? 0) * 0.02, (cutie?.y ?? 0) + (cutie?.height ?? 0) * 0.98)
    await page.waitForTimeout(300)
    const vars = await macheta(page)
      .locator('[data-paralaxa]')
      .evaluate((el) => ({ ry: getComputedStyle(el).getPropertyValue('--paralaxa-ry'), rx: getComputedStyle(el).getPropertyValue('--paralaxa-rx') }))
    console.log('[paralaxa stanga-jos] ' + JSON.stringify(vars))
    expect(parseFloat(vars.ry)).toBeCloseTo(-3.84, 1)
    expect(parseFloat(vars.rx)).toBeCloseTo(-3.84, 1)
  })

  // Plutirea porneste la 4,6 s de la intrarea machetei. Cand contextul 3D se rupea la figura,
  // transformarea plutirii rupea lantul si in geometrie: cutia sarea de la 639,6 la 581,7. Mouse-ul
  // pleaca pe antet, deci paralaxa e la zero; plutirea misca numai pe verticala (0 -> -6 px).
  test('dupa pornirea plutirii cadrul ramane in perspectiva, in cutia referintei (pe pixeli)', async ({ page }) => {
    await deschide(page, 1440)
    await lanseaza(page, true)
    const t0 = Date.now()
    await page.mouse.move(720, 20)
    await page.waitForTimeout(Math.max(0, 6000 - (Date.now() - t0)))
    const c = await cadruPictat(page)
    console.log('[cadru pictat 1440, plutire] ' + JSON.stringify(c) + ' raport ' + (c.stanga / c.dreapta).toFixed(3))
    expect(Math.abs(c.x - 639.6)).toBeLessThan(3)
    expect(Math.abs(c.y - 317.3)).toBeLessThan(6)
    expect(Math.abs(c.w - 776.5)).toBeLessThan(4)
    expect(c.stanga / c.dreapta).toBeLessThan(0.95)
  })

  test('in aplicatie, fiecare act nou trimite o foaie zburatoare spre cadru', async ({ page }) => {
    await deschide(page, 1440)
    await page.mouse.move(700, 450)
    await lanseaza(page, true)
    for (let i = 0; i < TUR.scene.length; i++) {
      await macheta(page).getByRole('button', { name: TUR.urmatoarea }).click({ force: true })
    }
    const zbor = await erou(page).evaluate(async (s) => {
      const final = performance.now() + 2500
      while (performance.now() < final) {
        const vizibile = [...s.querySelectorAll('[data-foaie]')].filter((f) => Number(getComputedStyle(f).opacity) > 0.5)
        if (vizibile.length > 0) return getComputedStyle(vizibile[0]).transform
        await new Promise((r) => setTimeout(r, 10))
      }
      return null
    })
    console.log('[foaie zburatoare] ' + zbor)
    expect(zbor).not.toBeNull()
  })
})

test.describe('macheta la 390, cu miscare redusa', () => {
  test.use({ viewport: { width: 390, height: 844 } })

  test('scena plana creste ca la referinta, iar aplicatia devine rama de telefon', async ({ page }) => {
    await deschide(page, 390)
    const spatiu = erou(page).locator('[data-faza]')
    await expect(spatiu).toHaveCount(1)
    const repaus = (await spatiu.boundingBox())?.height ?? 0
    await lanseaza(page)
    const scena = (await spatiu.boundingBox())?.height ?? 0
    await panaLaAplicatie(page)
    const telefon = (await spatiu.boundingBox())?.height ?? 0
    console.log('[390] zona ' + repaus + ' -> scena ' + scena + ' -> telefon ' + telefon + ' (fisa: 346,1 / 521 / 532)')
    expect(Math.abs(repaus - 346.1)).toBeLessThan(2)
    expect(Math.abs(scena - 521) / 521).toBeLessThan(0.03)
    expect(Math.abs(telefon - 532) / 532).toBeLessThan(0.02)

    const rama = macheta(page).locator('[data-cadru] > div')
    const cutie = await rama.boundingBox()
    expect(Math.abs((cutie?.width ?? 0) - 358)).toBeLessThan(1)
    expect(await rama.evaluate((r) => getComputedStyle(r).borderTopLeftRadius)).toBe('32px')

    // Numele filelor: minimum 11 px (la referinta 9,6), iar adresa de primire nu e taiata.
    const file = macheta(page).getByRole('navigation', { name: MACHETA.etichetaMeniu }).getByRole('button')
    await expect(file).toHaveCount(4)
    const marimi = await file.evaluateAll((b) => b.map((x) => parseFloat(getComputedStyle(x).fontSize)))
    expect(Math.min(...marimi)).toBeGreaterThanOrEqual(11)
    const adresa = macheta(page).getByText(MACHETA.primite.adresaPrimire)
    const taiata = await adresa.evaluate((a) => a.scrollWidth > a.clientWidth + 0.5)
    expect(taiata).toBe(false)
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390)
  })

  test('axe pe rama de telefon: zero incalcari serious sau critical', async ({ page }) => {
    await deschide(page, 390)
    await lanseaza(page)
    await panaLaAplicatie(page)
    const m = await masoaraAccesibilitatea(page)
    console.log('[axe telefon] ' + m.reguliRulate + ' reguli, blocante ' + m.grave.map((g) => g.regula + ' ' + g.tinte.join(' | ')).join('; '))
    expect(m.grave.map((g) => g.regula)).toEqual([])
  })
})

// ---------------------------------------------------------------------------------------------------
// Aplicatia construita dinainte (Macheta.tsx, Aplicatie.tsx): in pagina, dar nevazuta
// ---------------------------------------------------------------------------------------------------

/**
 * Ce se vede din ce ar trebui sa fie ascuns: elementele cu `visibility: visible` si cu cutie, din
 * aplicatia pregatita (in tur) si din ecranele ascunse (in aplicatie). Un `visibility: visible`
 * scris pe un descendent strapunge ascunderea parintelui; vazut pe forma defecta: cu miscare
 * redusa, tot blocul rezultatelor cautarii se vedea peste tur. Se intorc si numaratorile, ca o
 * lista goala sa nu poata veni dintr-un selector care nu mai gaseste nimic.
 */
async function vazuteInAscunse(page: Page): Promise<{ ascunse: number; verificate: number; vazute: string[] }> {
  return macheta(page).evaluate((f) => {
    const ascunse = [...f.querySelectorAll('[data-aplicatie], [data-ecran]')].filter((e) => getComputedStyle(e).visibility === 'hidden')
    const verificate = new Set<Element>()
    const vazute = new Set<string>()
    for (const a of ascunse) {
      for (const e of a.querySelectorAll('*')) {
        verificate.add(e)
        const r = e.getBoundingClientRect()
        if (getComputedStyle(e).visibility === 'visible' && r.width > 0 && r.height > 0) {
          vazute.add(e.tagName.toLowerCase() + ' "' + (e.textContent ?? '').trim().slice(0, 30) + '"')
        }
      }
    }
    return { ascunse: ascunse.length, verificate: verificate.size, vazute: [...vazute] }
  })
}

test.describe('aplicatia construita dinainte, cu miscare redusa, la 1440', () => {
  test.use({ viewport: { width: 1440, height: 900 } })

  test('in tur aplicatia si cele 4 ecrane exista, dar nimic din ele nu se vede; in aplicatie, nimic din ecranele ascunse', async ({ page }) => {
    await deschide(page, 1440)
    await lanseaza(page)
    await expect(macheta(page).locator('[data-aplicatie="pregatita"] [data-ecran]')).toHaveCount(4)
    const tur = await vazuteInAscunse(page)
    console.log('[aplicatia pregatita, in tur] ' + tur.ascunse + ' ascunse, ' + tur.verificate + ' elemente verificate, vazute: ' + (tur.vazute.join(' | ') || 'niciunul'))
    expect(tur.verificate).toBeGreaterThan(300)
    expect(tur.vazute).toEqual([])

    await panaLaAplicatie(page)
    const meniu = macheta(page).getByRole('navigation', { name: MACHETA.etichetaMeniu })
    for (const e of MACHETA.meniu) {
      await meniu.getByRole('button', { name: e.text }).click()
      await expect(macheta(page).locator('[data-ecran="' + e.cheie + '"]')).toBeVisible()
      const a = await vazuteInAscunse(page)
      console.log('[aplicatie, ecranul ' + e.cheie + '] ' + a.ascunse + ' ecrane ascunse, ' + a.verificate + ' elemente verificate, vazute: ' + (a.vazute.join(' | ') || 'niciunul'))
      expect(a.ascunse).toBe(MACHETA.meniu.length - 1)
      expect(a.vazute).toEqual([])
    }
  })

  test('martor POZITIV: un `visibility: visible` pe un descendent al aplicatiei pregatite e prins', async ({ page }) => {
    await deschide(page, 1440)
    await lanseaza(page)
    await expect(macheta(page).locator('[data-aplicatie="pregatita"] [data-ecran]')).toHaveCount(4)
    await macheta(page)
      .locator('[data-ecran="documente"] button')
      .first()
      .evaluate((b) => (b as HTMLElement).style.setProperty('visibility', 'visible'))
    const tur = await vazuteInAscunse(page)
    console.log('[martor, strapuns] vazute: ' + tur.vazute.join(' | '))
    expect(tur.vazute.length).toBeGreaterThan(0)
  })
})

// ---------------------------------------------------------------------------------------------------
// Tintele turului in scena 3D (WCAG 2.5.8): pe ecran, nu in CSS
// ---------------------------------------------------------------------------------------------------

/**
 * Butoanele turului (sageti si puncte), cu cutia PICTATA, si verdictul axe target-size pe macheta.
 * In scena 3D cadrul e proiectat mai mic decat in CSS (masurat: o tinta de 24 se picta 21,8 x 22,9).
 * Regula target-size e oprita implicit in axe 4.13, deci se cere explicit. Pentru fiecare punct se
 * citeste si marimea pe care a socotit-o axe: o tinta pe care axe o declara "acoperita" trece regula
 * fara sa fi fost masurata (s-a intamplat cat rezultatele cautarii strapungeau aplicatia pregatita).
 */
async function tinteleTurului(page: Page) {
  const cutii = await macheta(page)
    .locator('button[aria-label^="Scena "]')
    .evaluateAll((b) =>
      b.map((x) => {
        const r = x.getBoundingClientRect()
        return { eticheta: x.getAttribute('aria-label') ?? '', w: r.width, h: r.height }
      }),
    )
  const r = await new AxeBuilder({ page }).include('[data-ciot="erou"] figure').withRules(['target-size']).analyze()
  const noduri = (grup: typeof r.violations) =>
    grup
      .filter((v) => v.id === 'target-size')
      .flatMap((v) => v.nodes.map((n) => ({ tinta: n.target.join(' '), date: n.any.map((c) => c.data as { width?: number } | null) })))
  const incalcari = noduri(r.violations).map((n) => n.tinta)
  const puncteMasurate = noduri(r.passes).filter((n) => n.tinta.includes(' din ') && n.date.some((d) => typeof d?.width === 'number'))
  return { cutii, incalcari, puncteMasurate: puncteMasurate.length }
}

test.describe('tintele turului, in scena 3D (WCAG 2.5.8, axe target-size)', () => {
  test.use({ viewport: { width: 1440, height: 900 } })

  test('pe 4 latimi ale scenei 3D, sagetile si punctele au pe ecran cel putin 24 x 24, iar axe e curat', async ({ page }) => {
    for (const latime of [1181, 1280, 1440, 1920]) {
      await page.setViewportSize({ width: latime, height: 900 })
      await deschide(page, latime)
      await lanseaza(page)
      const t = await tinteleTurului(page)
      console.log(
        '[tinte ' + latime + '] ' + t.cutii.map((c) => c.eticheta + ' ' + c.w.toFixed(1) + 'x' + c.h.toFixed(1)).join(' | ') +
          '; axe: ' + (t.incalcari.join(', ') || 'curat') + ', puncte masurate ' + t.puncteMasurate,
      )
      expect(t.cutii).toHaveLength(2 + TUR.scene.length)
      for (const c of t.cutii) expect(Math.min(c.w, c.h), latime + ' ' + c.eticheta).toBeGreaterThanOrEqual(24)
      expect(t.incalcari).toEqual([])
      expect(t.puncteMasurate).toBe(TUR.scene.length)
    }
  })

  test('martor POZITIV: punctele la 24 x 24 in CSS (forma de dinainte) se picteaza sub 24 si axe le prinde pe toate 3', async ({ page }) => {
    await deschide(page, 1440)
    await lanseaza(page)
    await macheta(page)
      .locator('button[aria-label*=" din "]')
      .evaluateAll((b) => {
        for (const x of b) {
          ;(x as HTMLElement).style.width = '24px'
          ;(x as HTMLElement).style.height = '24px'
        }
      })
    const t = await tinteleTurului(page)
    console.log('[tinte 1440, puncte de 24] ' + t.cutii.map((c) => c.eticheta + ' ' + c.w.toFixed(1) + 'x' + c.h.toFixed(1)).join(' | ') + '; axe: ' + t.incalcari.join(', '))
    expect(t.incalcari).toHaveLength(TUR.scene.length)
  })
})

// ---------------------------------------------------------------------------------------------------
// Latenta interactiunilor machetei (plan §8.4: INP <= 200 ms, masurat pe 390 cu CPU incetinit)
// ---------------------------------------------------------------------------------------------------

const BUGET_INP_MS = 200

type IntrareInteractiune = { id: number; d: number; t: number }
type FereastraCuInteractiuni = Window & { __interactiuni?: IntrareInteractiune[] }

/** Observatorul Event Timing, pus inaintea oricarui script al paginii. */
async function ascultaInteractiunile(page: Page): Promise<void> {
  await page.addInitScript(() => {
    const w = window as FereastraCuInteractiuni
    w.__interactiuni = []
    new PerformanceObserver((lista) => {
      for (const e of lista.getEntries() as (PerformanceEntry & { interactionId?: number })[]) {
        if (e.interactionId) w.__interactiuni?.push({ id: e.interactionId, d: e.duration, t: e.startTime })
      }
    }).observe({ type: 'event', durationThreshold: 16, buffered: true } as PerformanceObserverInit)
  })
}

/**
 * Latenta unei interactiuni, ca in INP: cea mai lunga intrare Event Timing a ei (pointerdown,
 * pointerup si click sunt aceeasi interactiune), de la eveniment pana la pictura de dupa el. Intrarea
 * vine dupa pictura, deci se asteapta 700 ms. Observatorul nu raporteaza sub 16 ms: o interactiune
 * care nu apare deloc a fost sub 16 ms (`interactiuni` = 0).
 */
async function latenta(page: Page, actiune: () => Promise<void>): Promise<{ ms: number; interactiuni: number }> {
  const inainte = await page.evaluate(() => performance.now())
  await actiune()
  await page.waitForTimeout(700)
  return page.evaluate((inainte) => {
    const pe: Record<number, number> = {}
    for (const e of (window as FereastraCuInteractiuni).__interactiuni ?? []) {
      if (e.t >= inainte - 5) pe[e.id] = Math.max(pe[e.id] ?? 0, e.d)
    }
    return { ms: Math.max(0, ...Object.values(pe)), interactiuni: Object.keys(pe).length }
  }, inainte)
}

/**
 * Un drum prin macheta cu procesorul incetinit x4, ca in plan: lansarea, o sageata a turului, trecerea
 * de pe scena 3 in aplicatie, cele 4 ecrane si "inapoi"; intoarce latenta fiecarei interactiuni.
 * Inaintea clicurilor din tur se cere ca aplicatia si cele 4 ecrane sa fie construite dinainte (in
 * timpul bun-venitului): pe asta se sprijina trecerea ieftina. `frana` pune, pentru martor, o sarcina
 * de atatea ms in handlerul filei Documente.
 */
async function drumulMachetei(page: Page, tactil: boolean, frana = 0): Promise<Record<string, number>> {
  await page.goto('/', { waitUntil: 'networkidle' })
  await expect(centru(page)).toHaveCount(1)
  const cdp = await page.context().newCDPSession(page)
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 })
  try {
    const apasa = (l: Locator) => (tactil ? l.tap({ force: true }) : l.click({ force: true }))
    const m: Record<string, number> = {}
    // Nu `scrollIntoViewIfNeeded`: acela asteapta un element nemiscat, iar centrul respira.
    await centru(page).evaluate((c) => c.scrollIntoView({ block: 'center' }))
    m['lansarea'] = (await latenta(page, () => apasa(centru(page)))).ms
    // Asteptarea asta e o PRECONDITIE (turul a ajuns la prima scena), nu masura: latenta se
    // citeste din Event Timing, mai sus si mai jos. Cu CPU x4 pe o masina incarcata de alte porti,
    // bun-venitul a depasit 10 s in 2 din 3 rulari complete ale lotului (25.09), si 0 din 6 izolat -
    // un rosu care nu spunea nimic despre interactiuni. Plafonul mai mare nu slabeste bugetul INP.
    await expect(macheta(page).getByRole('heading', { name: TUR.scene[0].titlu })).toBeVisible({ timeout: 30_000 })
    await expect(macheta(page).locator('[data-aplicatie="pregatita"] [data-ecran]')).toHaveCount(4)

    const urmatoarea = macheta(page).getByRole('button', { name: TUR.urmatoarea })
    m['tur, scena 2'] = (await latenta(page, () => apasa(urmatoarea))).ms
    await apasa(urmatoarea)
    await expect(macheta(page).getByRole('heading', { name: TUR.scene[2].titlu })).toBeVisible()
    const trecere = await latenta(page, () => apasa(urmatoarea))
    m['tur -> aplicatie'] = trecere.ms
    // Control: trecerea, cea mai grea interactiune, chiar a fost vazuta de observator.
    expect(trecere.interactiuni, 'trecerea in aplicatie, in Event Timing').toBe(1)
    await expect(macheta(page).locator('[data-aplicatie="activa"]')).toBeVisible()

    const file = macheta(page).getByRole('navigation', { name: MACHETA.etichetaMeniu }).getByRole('button')
    if (frana) {
      await file.nth(1).evaluate((b, ms) => {
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
    for (const i of [1, 2, 3, 0]) {
      const e = MACHETA.meniu[i]
      m['ecranul ' + e.cheie] = (await latenta(page, () => apasa(file.nth(i)))).ms
      await expect(macheta(page).locator('[data-ecran="' + e.cheie + '"]')).toBeVisible()
    }
    m['inapoi'] = (await latenta(page, () => apasa(macheta(page).getByRole('button', { name: MACHETA.inapoi })))).ms
    await expect(macheta(page)).toHaveCount(0)
    return m
  } finally {
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: 1 })
  }
}

/** Interactiunile peste buget, ca propozitii (goala = toate in buget). */
const pesteBuget = (m: Record<string, number>) =>
  Object.entries(m)
    .filter(([, ms]) => ms > BUGET_INP_MS)
    .map(([nume, ms]) => nume + ' ' + ms + ' ms')

for (const [latime, inaltime, tactil] of [
  [390, 844, true],
  [1440, 900, false],
] as const) {
  test.describe('latenta machetei la ' + latime + (tactil ? ', tactil' : ', mouse') + ', CPU x4', () => {
    test.use({ viewport: { width: latime, height: inaltime }, hasTouch: tactil, isMobile: tactil, reducedMotion: 'no-preference' })

    // Doua drumuri, fiecare cu pagina incarcata din nou; verdictul ia, pe fiecare interactiune,
    // minimul celor doua. Zgomotul masinii (alti agenti, CPU 60-90%) doar adauga timp, deci minimul
    // e costul propriu al interactiunii: o regresie de constructie (aplicatia sau un ecran construite
    // in clic: 248-336 ms masurat) iese peste buget in ambele drumuri; o intarziere a masinii, intr-unul.
    test('fiecare interactiune a machetei ramane sub ' + BUGET_INP_MS + ' ms (Event Timing, minimul a 2 drumuri)', async ({ page }) => {
      // Doua drumuri, fiecare cu o preconditie de pana la 30 s: plafonul implicit de 60 s nu le ajunge.
      test.slow()
      await ascultaInteractiunile(page)
      const drumuri = [await drumulMachetei(page, tactil), await drumulMachetei(page, tactil)]
      expect(await page.evaluate(() => window.innerWidth), 'innerWidth CITIT').toBe(latime)
      const minim = Object.fromEntries(Object.keys(drumuri[0]).map((k) => [k, Math.min(...drumuri.map((d) => d[k]))]))
      for (const k of Object.keys(minim)) console.log('[latenta ' + latime + '] ' + k + ': ' + drumuri.map((d) => d[k]).join(' / ') + ' ms, minim ' + minim[k])
      expect(pesteBuget(minim)).toEqual([])
    })

    if (tactil) {
      test('martor POZITIV: o sarcina de 300 ms in handlerul filei Documente iese peste buget', async ({ page }) => {
        await ascultaInteractiunile(page)
        const m = await drumulMachetei(page, tactil, 300)
        console.log('[latenta ' + latime + ', martor 300 ms] ' + Object.entries(m).map(([k, v]) => k + ' ' + v).join(' | '))
        expect(m['ecranul documente']).toBeGreaterThanOrEqual(300)
        expect(pesteBuget(m).some((p) => p.startsWith('ecranul documente '))).toBe(true)
      })
    }
  })
}
