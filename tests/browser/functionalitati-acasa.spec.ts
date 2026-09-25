import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Locator, type Page } from '@playwright/test'

/**
 * Functionalitatile de pe start, piesa completa (felia `functionalitati-acasa`, S4-2), pe
 * build-ul local. Forma STATICA (fara JavaScript, miscare redusa) si inaltimile ei sunt ale probei
 * `fundatie-start.spec.ts`; aici se masoara comportamentul viu, deci cele mai multe probe ruleaza
 * FARA miscare redusa (configurarea portilor o porneste implicit).
 *
 * Ce se masoara, cu sursa fiecarei cifre in `acasa-functionalitati.md`:
 *   - pragurile pasului activ: 40% din fereastra in jos, 60% in sus (§9), pe ambele laturi ale
 *     fiecarui prag, plus banda de histerezis dintre ele;
 *   - ceasul machetelor: pornit la ACTIVAREA pasului (abaterea §14.3), 400 ms / 3000 ms la macheta
 *     1, 900 ms + 500 ms la macheta 3;
 *   - interactiunile: hover, clic, tastatura, atingere (abaterile §14.2, §14.9);
 *   - panza 3D peste 1340 px si teancul care creste cu pasul (§8);
 *   - pista de 300lvh sub 900 px, cardul activ la 0,34 / 0,67 si punctele care aliniaza exact
 *     cardul (§11, abaterea §14.12);
 *   - ecranul culcat (844 x 390): fara pista, iar machetele pornesc cand intra in ecran (§5-§7, §12);
 *   - contrastul pasilor inactivi si al machetelor, cu axe, in fiecare stare (abaterea §14.1), si o
 *     a doua trecere fara estompare, in care axe nu lasa niciun nod nejudecat;
 *   - estomparea de jos a machetelor, pe pixeli: acopera numai randul taiat, iar textul intreg din
 *     rama ramane peste 4,5:1 (abaterea §14.7), cu martorul #94a3b8 = 2,56:1.
 *
 * `innerWidth` se CITESTE din pagina la fiecare latime si se scrie in raport. Asteptarile de timp
 * au margine larga: poarta ruleaza pe o masina incarcata, iar o proba care pica din intarzierea
 * masinii se invata a fi ignorata. Ce se cere e FORMA ceasului (nu porneste inainte de activare,
 * bataile vin la perioada lor), nu milisecunda.
 */

const SECTIUNE = '#functionalitati'

async function citesteLatimea(page: Page, eticheta: string): Promise<number> {
  const latime = await page.evaluate(() => window.innerWidth)
  console.log('[' + eticheta + '] innerWidth CITIT: ' + latime)
  return latime
}

/** Derulare instantanee si asteptarea a doua cadre, ca handler-ul de derulare sa fi rulat. */
async function deruleaza(page: Page, y: number): Promise<void> {
  await page.evaluate(async (yy) => {
    window.scrollTo({ top: yy, behavior: 'instant' })
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))
  }, y)
}

/** Marginea de sus a blocului `i` (0..2) si a sectiunii, in pagina. */
async function geometrie(page: Page) {
  return page.evaluate((sel) => {
    const s = document.querySelector(sel)!
    const y = (e: Element) => e.getBoundingClientRect().top + window.scrollY
    return {
      sectiune: y(s),
      blocuri: [...s.querySelectorAll('ol > li')].map(y),
      vh: window.innerHeight,
    }
  }, SECTIUNE)
}

const pasul = (page: Page) => page.locator(SECTIUNE + ' [data-pas]').getAttribute('data-pas')

/** Machetele cardului lipit (desktop), in ordinea pasilor. */
const machetaCard = (page: Page, i: number) => page.locator(SECTIUNE + ' [class*="card"] figure').nth(i)

/**
 * A doua trecere axe pe contrast, cu estomparea scoasa: pseudo-elementul ei, asezat peste text, ii
 * lasa lui axe fundalul nedeterminat, iar nodurile de sub el ies `incomplete`, nu judecate
 * (masurat de critic: la 1440, pasul 2, 12 noduri judecate si 19 incomplete). Proba de contrast le
 * citea doar pe cele INCALCATE, deci era oarba exact acolo.
 *
 * In aceeasi trecere, taietura machetelor e data in forma pe care axe o intelege: axe-core 4.13 ia
 * drept taietura numai `overflow: hidden` (`getOverflowHiddenAncestors` compara exact cu 'hidden'),
 * deci o macheta taiata cu `clip` ii pare revarsata peste textul de sub ea (la 390, eticheta, titlul
 * si paragraful cardului ies `incomplete`, "bgOverlap"). `hidden` si `clip` deseneaza identic; se
 * deosebesc doar prin derulare, care aici nu intervine (nimic nu e derulat in timpul masurarii).
 *
 * Mai ramane o aproximare a lui axe, masurata la 390: suprapunerile le cauta intr-o grila de celule
 * de 200 px asezand fiecare element dupa cutia lui TAIATA, dar punctul textului il testeaza pe cutia
 * NETAIATA (`getRectStack`). Rezumatul deschis al machetei 1 (436-565 px, taiat de rama la 501)
 * ajunge astfel "deasupra" etichetei cardului (553 px), cand in pagina `elementsFromPoint` da chiar
 * eticheta. De aceea trecerea are doua jumatati: machetele singure, apoi restul sectiunii cu
 * machetele ascunse - textul de sub ele nu depinde de ele, deci fiecare nod e judecat o data.
 *
 * Se cere: zero incalcari si zero noduri `incomplete`. Singura exceptie e cea pe care axe o declara
 * ca atare, "nonBmp" - un nod numai cu simboluri, pe care axe nu il judeca prin constructie: bifa-
 * caracter a insignei verzi. Ea nu se sare, se verifica altfel: e ascunsa cititorului de ecran si are
 * exact culoarea textului insignei, text pe care axe il judeca.
 */
const FARA_ESTOMPARE_PENTRU_AXE =
  '#functionalitati [class*="_estompat__"]::after{content:none!important}' +
  '#functionalitati [class*="_macheta__"],#functionalitati [class*="_card__"],#functionalitati [class*="_fereastra__"]{overflow:hidden!important}'

async function contrastFaraEstompare(page: Page, eticheta: string) {
  const stil = await page.addStyleTag({ content: FARA_ESTOMPARE_PENTRU_AXE })
  // Controlul injectarii: estomparea chiar a disparut.
  const ramase = await page.evaluate((sel) => [...document.querySelectorAll(sel + ' [class*="_estompat__"]')].filter((f) => getComputedStyle(f, '::after').content !== 'none').length, SECTIUNE)
  const machete = await new AxeBuilder({ page }).include(SECTIUNE + ' figure').withRules(['color-contrast']).analyze()
  const faraMachete = await page.addStyleTag({ content: '#functionalitati figure{visibility:hidden!important}' })
  const restul = await new AxeBuilder({ page }).include(SECTIUNE).withRules(['color-contrast']).analyze()
  await faraMachete.evaluate((n) => (n as Element).remove())
  await stil.evaluate((n) => (n as Element).remove())
  const r = {
    passes: machete.passes.concat(restul.passes),
    violations: machete.violations.concat(restul.violations),
    incomplete: machete.incomplete.concat(restul.incomplete),
  }
  const incomplete = r.incomplete.flatMap((v) => v.nodes)
  const simboluri = incomplete.filter((n) => [...n.any, ...n.all, ...n.none].some((c) => (c.data as { messageKey?: string } | null)?.messageKey === 'nonBmp'))
  const nejudecate = incomplete.filter((n) => !simboluri.includes(n))
  const verificateAltfel: { ascunsa: boolean; aceeasiCuloare: boolean }[] = []
  for (const n of simboluri) {
    verificateAltfel.push(
      await page.locator(n.target.join(' ')).first().evaluate((e) => ({
        ascunsa: e.closest('[aria-hidden="true"]') !== null,
        aceeasiCuloare: e.parentElement !== null && getComputedStyle(e).color === getComputedStyle(e.parentElement).color,
      })),
    )
  }
  const judecate = r.passes.flatMap((v) => v.nodes).length + r.violations.flatMap((v) => v.nodes).length
  console.log(
    '[axe fara estompare ' + eticheta + '] judecate ' + judecate + ' (machete ' + machete.passes.concat(machete.violations).flatMap((v) => v.nodes).length + ')' +
      ' | incalcari ' + r.violations.flatMap((v) => v.nodes).length +
      ' | incomplete ' + nejudecate.length + (nejudecate.length ? ' -> ' + nejudecate.map((n) => n.target.join(' ').slice(-70)).join(' || ') : '') +
      ' | simboluri verificate altfel ' + simboluri.length,
  )
  expect(ramase).toBe(0)
  expect(r.violations.flatMap((v) => v.nodes.map((n) => n.target.join(' ')))).toEqual([])
  expect(nejudecate.map((n) => n.target.join(' '))).toEqual([])
  for (const v of verificateAltfel) expect(v).toEqual({ ascunsa: true, aceeasiCuloare: true })
  return judecate
}

test.describe('functionalitatile la 1440 x 900, cu miscare', () => {
  test.use({ viewport: { width: 1440, height: 900 }, reducedMotion: 'no-preference' })

  test('pasul activ urmeaza pragurile: 40% din fereastra in jos, 60% in sus', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' })
    expect(await citesteLatimea(page, 'praguri 1440')).toBe(1440)
    const g = await geometrie(page)
    await deruleaza(page, g.sectiune)
    expect(await pasul(page)).toBe('0')
    const citit: string[] = []
    for (const k of [1, 2]) {
      const bloc = g.blocuri[k]
      // In jos: cu blocul la 5 px deasupra pragului, pasul nu se schimba; la 1 px sub, da.
      await deruleaza(page, bloc - 0.4 * g.vh - 5)
      expect(await pasul(page)).toBe(String(k - 1))
      await deruleaza(page, bloc - 0.4 * g.vh + 1)
      await expect.poll(() => pasul(page)).toBe(String(k))
      // In sus: pana la 60% pasul ramane; peste, revine.
      await deruleaza(page, bloc - 0.6 * g.vh + 5)
      expect(await pasul(page)).toBe(String(k))
      await deruleaza(page, bloc - 0.6 * g.vh - 1)
      await expect.poll(() => pasul(page)).toBe(String(k - 1))
      await deruleaza(page, bloc - 0.4 * g.vh + 1)
      await expect.poll(() => pasul(page)).toBe(String(k))
      citit.push('pasul ' + (k + 1) + ': jos la ' + Math.round(bloc - 0.4 * g.vh) + ', sus la ' + Math.round(bloc - 0.6 * g.vh))
    }
    console.log('[praguri 1440] vh ' + g.vh + ' | ' + citit.join(' | '))
  })

  test('martor NEGATIV: in banda de histerezis pasul nu se schimba, din niciun sens', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' })
    const g = await geometrie(page)
    const mijloc = g.blocuri[1] - 0.5 * g.vh
    await deruleaza(page, g.sectiune)
    await deruleaza(page, mijloc)
    expect(await pasul(page)).toBe('0')
    await deruleaza(page, g.blocuri[1])
    await expect.poll(() => pasul(page)).toBe('1')
    await deruleaza(page, mijloc)
    expect(await pasul(page)).toBe('1')
  })

  test('ceasul machetelor porneste la activarea pasului, nu la intrarea cardului in ecran', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' })
    const g = await geometrie(page)
    // Pasul 1 activ, cardul in ecran. La referinta, aici pornea si secventa machetei 3 (prima
    // verificare la 900 ms): dupa 1,5 s ar fi avut deja cel putin una.
    await deruleaza(page, g.sectiune + 300)
    await page.waitForTimeout(1500)
    expect(await machetaCard(page, 2).getAttribute('data-verificari')).toBe('0')
    // Salt la pasul 3 si cronologia verificarilor, esantionata in pagina.
    const cronologie = await page.evaluate(async ([tinta, sel]) => {
      const fig = document.querySelectorAll(sel + ' [class*="card"] figure')[2]
      const t0 = performance.now()
      window.scrollTo({ top: tinta, behavior: 'instant' })
      const aparute: number[] = []
      let ultim = 0
      await new Promise<void>((gata) => {
        const pas = () => {
          const n = Number(fig.getAttribute('data-verificari'))
          if (n !== ultim) {
            aparute.push(Math.round(performance.now() - t0))
            ultim = n
          }
          if (n >= 4 || performance.now() - t0 > 8000) gata()
          else requestAnimationFrame(pas)
        }
        requestAnimationFrame(pas)
      })
      return aparute
    }, [g.blocuri[2] - 0.2 * g.vh, SECTIUNE] as const)
    console.log('[ceas macheta 3] verificari la (ms de la salt): ' + cronologie.join(' / '))
    expect(cronologie).toHaveLength(4)
    expect(cronologie[0]).toBeGreaterThanOrEqual(700)
    for (let i = 1; i < 4; i++) expect(cronologie[i] - cronologie[i - 1]).toBeGreaterThanOrEqual(350)
  })

  test('macheta 1: primul rand la ~400 ms, urmatorul la 3 s; hover-ul il tine, clicul il inchide', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' })
    const g = await geometrie(page)
    const cronologie = await page.evaluate(async ([tinta, sel]) => {
      const fig = document.querySelectorAll(sel + ' [class*="card"] figure')[0]
      const t0 = performance.now()
      window.scrollTo({ top: tinta, behavior: 'instant' })
      const ev: string[] = []
      let ultim = ''
      await new Promise<void>((gata) => {
        const pas = () => {
          const stare = [...fig.querySelectorAll('button[aria-expanded]')].map((b) => (b.getAttribute('aria-expanded') === 'true' ? '1' : '0')).join('')
          if (stare !== ultim) {
            ev.push(Math.round(performance.now() - t0) + ':' + stare)
            ultim = stare
          }
          if (ev.length >= 3 || performance.now() - t0 > 9000) gata()
          else requestAnimationFrame(pas)
        }
        requestAnimationFrame(pas)
      })
      return ev
    }, [g.sectiune + 300, SECTIUNE] as const)
    console.log('[ceas macheta 1] ' + cronologie.join(' / '))
    const [, deschis1, deschis2] = cronologie.map((e) => ({ t: Number(e.split(':')[0]), s: e.split(':')[1] }))
    expect(deschis1.s).toBe('100')
    expect(deschis1.t).toBeGreaterThanOrEqual(250)
    expect(deschis1.t).toBeLessThanOrEqual(2000)
    expect(deschis2.s).toBe('010')
    expect(deschis2.t - deschis1.t).toBeGreaterThanOrEqual(2500)
    expect(deschis2.t - deschis1.t).toBeLessThanOrEqual(4000)

    const randuri = machetaCard(page, 0).locator('button[aria-expanded]')
    // Hover pe randul 1: se deschide si ciclul sta (mai mult de o perioada). Nu pe randul 3: cat e
    // deschis randul 2, randul 3 e sub rama (fisa §4, ca la referinta), iar macheta taiata cu `clip`
    // nu se mai lasa derulata ca sa-l arate.
    await randuri.nth(0).hover()
    await expect(randuri.nth(0)).toHaveAttribute('aria-expanded', 'true')
    await page.waitForTimeout(3400)
    await expect(randuri.nth(0)).toHaveAttribute('aria-expanded', 'true')
    // Clicul, dupa hover, comuta randul atins spre "niciunul".
    await randuri.nth(0).click()
    await expect.poll(() => randuri.evaluateAll((b) => b.map((x) => x.getAttribute('aria-expanded')).join(''))).toBe('falsefalsefalse')
  })

  test('tastatura: Enter deschide si inchide un rand, iar portalul alege persoana; focusul are conturul site-ului', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' })
    const g = await geometrie(page)
    await deruleaza(page, g.sectiune + 300)
    const rand = machetaCard(page, 0).locator('button[aria-expanded]').nth(1)
    await rand.focus()
    const contur = await rand.evaluate((b) => {
      const cs = getComputedStyle(b)
      return { vizibil: b.matches(':focus-visible'), stil: cs.outlineStyle, latime: cs.outlineWidth, culoare: cs.outlineColor }
    })
    console.log('[tastatura] focus pe rand: ' + JSON.stringify(contur))
    expect(contur).toMatchObject({ vizibil: true, stil: 'solid', latime: '2px', culoare: 'rgb(37, 99, 235)' })
    const inainte = await rand.getAttribute('aria-expanded')
    await page.keyboard.press('Enter')
    await expect(rand).toHaveAttribute('aria-expanded', inainte === 'true' ? 'false' : 'true')
    await page.keyboard.press('Enter')
    await expect(rand).toHaveAttribute('aria-expanded', inainte === 'true' ? 'true' : 'false')

    await deruleaza(page, g.blocuri[1])
    await expect.poll(() => pasul(page)).toBe('1')
    const persoane = machetaCard(page, 1).locator('button[aria-pressed]')
    await persoane.nth(2).focus()
    await page.keyboard.press('Enter')
    await expect(persoane.nth(2)).toHaveAttribute('aria-pressed', 'true')
    await expect(persoane.nth(0)).toHaveAttribute('aria-pressed', 'false')
  })

  test('sloturile: crossfade de 450 ms, iar cele inactive sunt inerte', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' })
    const g = await geometrie(page)
    await deruleaza(page, g.sectiune + 300)
    const sloturi = page.locator(SECTIUNE + ' [class*="card"] > div')
    await expect(sloturi).toHaveCount(3)
    const stari = await sloturi.evaluateAll((noduri) =>
      noduri.map((n) => ({ inert: (n as HTMLElement).inert, opacitate: getComputedStyle(n).opacity, durata: getComputedStyle(n).transitionDuration })),
    )
    expect(stari.map((x) => x.inert)).toEqual([false, true, true])
    expect(stari[0].durata).toBe('0.45s, 0.45s')
    await deruleaza(page, g.blocuri[1])
    await expect.poll(() => pasul(page)).toBe('1')
    await expect(sloturi.nth(1)).toHaveCSS('opacity', '1')
    await expect(sloturi.nth(0)).toHaveCSS('opacity', '0')
    expect(await sloturi.evaluateAll((noduri) => noduri.map((n) => (n as HTMLElement).inert))).toEqual([true, false, true])
  })

  test('panza 3D: deseneaza peste 1340 px, iar teancul creste cu pasul', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' })
    const g = await geometrie(page)
    await deruleaza(page, g.sectiune + 300)
    const panza = page.locator(SECTIUNE + ' canvas')
    await expect(panza).toHaveCount(1)
    const card = await page.locator(SECTIUNE + ' [class*="card"]').first().boundingBox()
    if (!card) throw new Error('cardul lipit nu are cutie')
    // Coloana teancului: la 40-64 px de marginea cardului, deasupra centrului lui (fisa §8).
    const coloana = { x: Math.round(card.x + card.width + 40), y: Math.round(card.y + 40), width: 24, height: Math.round(card.height / 2 - 40) }
    const pixeliColoana = async () => {
      await page.waitForTimeout(1300)
      const png = await page.screenshot({ clip: coloana })
      return page.evaluate(async (b64) => {
        const img = new Image()
        img.src = 'data:image/png;base64,' + b64
        await img.decode()
        const c = document.createElement('canvas')
        c.width = img.width
        c.height = img.height
        const x = c.getContext('2d')!
        x.drawImage(img, 0, 0)
        const d = x.getImageData(0, 0, c.width, c.height).data
        let n = 0
        for (let i = 0; i < d.length; i += 4) if (d[i] < 245 || d[i + 1] < 245 || d[i + 2] < 245) n++
        return n
      }, png.toString('base64'))
    }
    const laPas1 = await pixeliColoana()
    await deruleaza(page, g.blocuri[2])
    await expect.poll(() => pasul(page)).toBe('2')
    const laPas3 = await pixeliColoana()
    console.log('[panza 1440] pixeli desenati in coloana teancului: pas 1 ' + laPas1 + ', pas 3 ' + laPas3)
    // Teancul de 12 foi urca peste centrul cardului; la pasul 1, cu 4 foi, coloana de sus e aproape goala.
    expect(laPas3).toBeGreaterThan(laPas1 + 150)
  })

  test('machetele: bifa si fulgerul stau pe linia de baza a textului, iar fraza din dreapta a portalului e centrata pe verticala', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' })
    const g = await geometrie(page)
    await deruleaza(page, g.sectiune + 300)
    const m = await page.evaluate((sel) => {
      const figuri = document.querySelectorAll(sel + ' [class*="_card__"] figure')
      const insigne = figuri[0].querySelector('[class*="_insigne__"]')!
      const [bifa, fulger] = [...insigne.querySelectorAll('svg')].map((s) => s.getBoundingClientRect())
      const cutie = insigne.getBoundingClientRect()
      const st = figuri[1].querySelector('[class*="_subsolStanga__"]')!.getBoundingClientRect()
      const dr = figuri[1].querySelector('[class*="_subsolDreapta__"]')!.getBoundingClientRect()
      return {
        bifaJos: bifa.bottom, fulgerJos: fulger.bottom, bifaSus: bifa.top, centruInsigne: cutie.top + cutie.height / 2,
        centruStanga: (st.top + st.bottom) / 2, centruDreapta: (dr.top + dr.bottom) / 2,
      }
    }, SECTIUNE)
    console.log('[machete 1440] ' + JSON.stringify(m))
    // Pe linia de baza, iconitele au acelasi fund; centrate, fundurile ar diferi cu 1,5 px (14 fata de 11).
    expect(Math.abs(m.bifaJos - m.fulgerJos)).toBeLessThan(0.5)
    // Bifa de 14 px sta sus pe randul de 20,8 (la referinta, la 1 px de marginea lui), nu la mijloc.
    expect(m.bifaSus).toBeLessThan(m.centruInsigne - 8)
    expect(Math.abs(m.centruStanga - m.centruDreapta)).toBeLessThan(1)
  })

  test('ancora #functionalitati aterizeaza pe titlul sectiunii, sub antet (abaterea §14.11)', async ({ page }) => {
    await page.goto('/#functionalitati', { waitUntil: 'networkidle' })
    await page.waitForTimeout(1200)
    const sus = await page.locator('#functionalitati-titlu').evaluate((h) => h.getBoundingClientRect().top)
    console.log('[ancora] titlul sectiunii la ' + Math.round(sus) + ' px de marginea ferestrei')
    expect(sus).toBeGreaterThanOrEqual(0)
    expect(sus).toBeLessThan(300)
  })

  test('contrastul: nicio incalcare axe in sectiune, la niciunul dintre cei 3 pasi; fara estompare, niciun nod lasat nejudecat', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' })
    const g = await geometrie(page)
    for (const [k, y] of [[0, g.sectiune + 300], [1, g.blocuri[1]], [2, g.blocuri[2]]] as const) {
      await deruleaza(page, y)
      await expect.poll(() => pasul(page)).toBe(String(k))
      // Tranzitiile se termina inainte de masura: axe citeste opacitatea din mijlocul unui fade.
      await page.waitForTimeout(1200)
      const r = await new AxeBuilder({ page }).include(SECTIUNE).analyze()
      const grave = r.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical')
      const judecateCu = r.passes.concat(r.violations).filter((v) => v.id === 'color-contrast').flatMap((v) => v.nodes).length
      console.log('[axe pas ' + (k + 1) + '] reguli: ' + (r.passes.length + r.violations.length) + ' | contrast judecat pe ' + judecateCu + ' noduri | grave: ' + grave.map((v) => v.id + ' x' + v.nodes.length).join(', '))
      expect(r.passes.length).toBeGreaterThan(5)
      expect(grave.map((v) => v.id)).toEqual([])
      // A doua trecere, fara estompare: axe judeca tot textul sectiunii, iar trecerea nu e goala. Nu se
      // compara cu prima: acolo axe "judeca" si text ascuns de `overflow: clip`, pe care nu-l vede taiat.
      const judecateFara = await contrastFaraEstompare(page, '1440 pas ' + (k + 1))
      expect(judecateFara).toBeGreaterThan(10)
    }
  })

  test('martor POZITIV: titlul inactiv pe #94a3b8 (2,56:1) e prins de axe, desi are 29,6 px', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' })
    const g = await geometrie(page)
    await deruleaza(page, g.sectiune + 300)
    await expect.poll(() => pasul(page)).toBe('0')
    // Culoarea referintei pentru pasii inactivi, pusa in pagina pe titlul pasului 2. Textul mare
    // cere 3:1, deci 2,56:1 pica si la 29,6 px: de aici culoarea aleasa, #8f8f8f (3,23:1).
    // Tranzitia de 350 ms a titlului se opreste intai: altfel axe citeste culoarea din mijlocul ei,
    // inca peste 3:1 (masurat: o rulare a portii a trecut asa martorul, fara nicio prindere).
    const injectat = await page.locator(SECTIUNE + ' ol > li').nth(1).locator('h3').evaluate((h) => {
      const e = h as HTMLElement
      e.style.transition = 'none'
      e.style.color = '#94a3b8'
      const cs = getComputedStyle(e)
      return { marime: cs.fontSize, culoare: cs.color }
    })
    // Controlul injectarii: culoarea a aterizat intreaga, nu o treapta a tranzitiei.
    expect(injectat.culoare).toBe('rgb(148, 163, 184)')
    const r = await new AxeBuilder({ page }).include(SECTIUNE).withRules(['color-contrast']).analyze()
    const prinse = r.violations.flatMap((v) => v.nodes.map((n) => n.target.join(' ')))
    console.log('[martor contrast] h3 la ' + injectat.marime + ' pe ' + injectat.culoare + ', prins: ' + prinse.join(' | '))
    expect(prinse.some((t) => t.includes('h3'))).toBe(true)
  })
})

test.describe('fara derapaj orizontal intre 1341 si 1439 px, unde panza 3D trece de fereastra', () => {
  test.use({ reducedMotion: 'no-preference' })

  test('la 1341 x 800 si 1366 x 768 pagina nu se deruleaza lateral, iar cardul ramane lipit la 14%', async ({ page }) => {
    for (const [w, h] of [[1341, 800], [1366, 768]] as const) {
      await page.setViewportSize({ width: w, height: h })
      await page.goto('/', { waitUntil: 'networkidle' })
      const latime = await citesteLatimea(page, 'derapaj ' + w + ' x ' + h)
      expect(latime).toBe(w)
      const g = await geometrie(page)
      await deruleaza(page, g.blocuri[1] - 0.2 * g.vh)
      const m = await page.evaluate((sel) => {
        const gazda = document.querySelector(sel + ' [data-scena3d]')!.getBoundingClientRect()
        const card = document.querySelector(sel + ' [class*="_card__"]')!.getBoundingClientRect()
        window.scrollTo({ left: 500, behavior: 'instant' })
        const sx = window.scrollX
        window.scrollTo({ left: 0, behavior: 'instant' })
        return { sw: document.documentElement.scrollWidth, sx, gazdaDreapta: Math.round(gazda.right), cardSus: card.top, vh: window.innerHeight }
      }, SECTIUNE)
      console.log('[derapaj ' + w + ' x ' + h + '] scrollWidth ' + m.sw + ' | scrollX dupa 500 la stanga: ' + m.sx + ' | gazda 3D pana la ' + m.gazdaDreapta + ' | card la ' + m.cardSus)
      // Controlul: aici gazda chiar trece de fereastra; altfel proba n-ar avea ce prinde.
      expect(m.gazdaDreapta).toBeGreaterThan(latime)
      expect(m.sw).toBe(latime)
      expect(m.sx).toBe(0)
      // `clip`, nu `hidden`: sectiunea nu devine zona de derulare, deci cardul ramane lipit.
      expect(Math.abs(m.cardSus - 0.14 * m.vh)).toBeLessThan(1)
    }
  })

  test('martor POZITIV: fara taietura pe sectiune, derapajul reapare la 1366 x 768', async ({ page }) => {
    await page.setViewportSize({ width: 1366, height: 768 })
    await page.goto('/', { waitUntil: 'networkidle' })
    const m = await page.evaluate((sel) => {
      const s = document.querySelector(sel) as HTMLElement
      s.style.overflowX = 'visible'
      const fara = document.documentElement.scrollWidth
      s.style.overflowX = ''
      return { fara, cu: document.documentElement.scrollWidth, iw: window.innerWidth }
    }, SECTIUNE)
    console.log('[derapaj martor 1366] innerWidth CITIT ' + m.iw + ' | scrollWidth fara taietura ' + m.fara + ', cu taietura ' + m.cu)
    expect(m.fara).toBeGreaterThan(m.iw)
    expect(m.cu).toBe(m.iw)
  })
})

/** Starea focusului de tastatura intr-o macheta: ce e derulat, cat din rand se vede, ce e deschis. */
async function focusInMacheta(page: Page) {
  return page.evaluate(() => {
    const e = document.activeElement as HTMLElement
    const fig = e.closest('figure')
    const derulari: string[] = []
    for (let x = e.parentElement; x && x !== document.documentElement; x = x.parentElement) {
      if (x.scrollTop || x.scrollLeft) derulari.push((x.getAttribute('class') || x.tagName).slice(0, 40) + ' ' + x.scrollTop + '/' + x.scrollLeft)
    }
    if (!fig) return { rand: null, derulari, liberSus: 0, liberJos: 0, deschis: null }
    const r = e.getBoundingClientRect()
    const f = fig.getBoundingClientRect()
    const cs = getComputedStyle(fig)
    const estompare = parseFloat(getComputedStyle(fig, '::after').height) || 0
    return {
      // Al catelea rand e focalizat, dupa ordinea butoanelor, nu dupa un marcaj al implementarii.
      rand: String([...fig.querySelectorAll('button[aria-expanded]')].indexOf(e)),
      derulari,
      // Cat loc ramane intre rand si marginea de sus a ramei, respectiv estomparea de jos.
      liberSus: Math.round((r.top - (f.top + parseFloat(cs.borderTopWidth))) * 10) / 10,
      liberJos: Math.round((f.bottom - parseFloat(cs.borderBottomWidth) - estompare - r.bottom) * 10) / 10,
      deschis: e.getAttribute('aria-expanded'),
    }
  })
}

test.describe('tastatura in macheta 1: randul focalizat se vede intreg, nimic nu se deruleaza', () => {
  test.use({ reducedMotion: 'no-preference' })

  for (const [w, h] of [[1440, 900], [390, 844]] as const) {
    test('la ' + w + ' x ' + h + ': Tab pe cele 3 randuri, apoi focusul pleaca si continutul revine', async ({ page }) => {
      await page.setViewportSize({ width: w, height: h })
      await page.goto('/', { waitUntil: 'networkidle' })
      expect(await citesteLatimea(page, 'tastatura ' + w)).toBe(w)
      const start = await page.evaluate((sel) => {
        const s = document.querySelector(sel)!
        const y = (e: Element) => e.getBoundingClientRect().top + window.scrollY
        const pista = s.querySelector('[data-pista]')?.firstElementChild
        return window.innerWidth > 900 ? y(s) + 300 : y(pista!) + 5
      }, SECTIUNE)
      await deruleaza(page, start)
      await page.waitForTimeout(600)
      // Plecarea tastaturii: titlul sectiunii, focalizat fara derulare (ca un om ajuns acolo cu Tab).
      await page.evaluate(() => {
        const t = document.querySelector('#functionalitati-titlu') as HTMLElement
        t.setAttribute('tabindex', '-1')
        t.focus({ preventScroll: true })
        t.removeAttribute('tabindex')
      })
      for (let i = 0; i < 3; i++) {
        await page.keyboard.press('Tab')
        // Randurile se deschid si continutul urca in 200 ms: se masoara starea ASEZATA (doua citiri
        // la rand identice), nu o clipa din mijlocul tranzitiei.
        let anterior = ''
        await expect
          .poll(async () => {
            const acum = JSON.stringify(await focusInMacheta(page))
            const asezat = acum === anterior
            anterior = acum
            return asezat
          }, { intervals: [150, 150, 250, 500], timeout: 5000 })
          .toBe(true)
        const f = await focusInMacheta(page)
        console.log('[tastatura ' + w + '] Tab ' + (i + 1) + ': ' + JSON.stringify(f))
        expect(f.rand).toBe(String(i))
        expect(f.derulari).toEqual([])
        // Conturul de focus (4 px) incape si sus, si deasupra estomparii.
        expect(f.liberSus).toBeGreaterThanOrEqual(3.5)
        expect(f.liberJos).toBeGreaterThanOrEqual(3.5)
        expect(f.deschis).toBe('true')
      }
      for (let i = 0; i < 3; i++) await page.keyboard.press('Shift+Tab')
      await expect
        .poll(() => page.evaluate((sel) => [...document.querySelectorAll(sel + ' figure')].map((f) => f.scrollTop + '|' + ((f.querySelector('[class*="_lista__"]') as HTMLElement | null)?.style.transform ?? '')).filter((x) => x !== '0|').length, SECTIUNE))
        .toBe(0)
    })
  }
})

test.describe('atingerea, pe un ecran tactil de 1440 x 900', () => {
  test.use({ viewport: { width: 1440, height: 900 }, reducedMotion: 'no-preference', hasTouch: true })

  test('atingerea pe un rand inchis il deschide si il tine deschis (la referinta inchidea tot)', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' })
    expect(await citesteLatimea(page, 'atingere 1440')).toBe(1440)
    const g = await geometrie(page)
    await deruleaza(page, g.sectiune + 300)
    const randuri = machetaCard(page, 0).locator('button[aria-expanded]')
    // Ceasul deschide randul 1; randul 2 ramane inchis si vizibil sub el pana la bataia de la 3 s.
    await expect(randuri.nth(0)).toHaveAttribute('aria-expanded', 'true')
    await expect(randuri.nth(1)).toHaveAttribute('aria-expanded', 'false')
    await randuri.nth(1).tap()
    await expect(randuri.nth(1)).toHaveAttribute('aria-expanded', 'true')
    // Ceasul tace dupa atingere: randul atins ramane deschis peste o perioada intreaga.
    await page.waitForTimeout(3400)
    await expect(randuri.nth(1)).toHaveAttribute('aria-expanded', 'true')
  })
})

test.describe('pista la 390 x 844, cu miscare', () => {
  test.use({ viewport: { width: 390, height: 844 }, reducedMotion: 'no-preference' })

  test('pista: 300lvh, banda urmeaza derularea fara magnet, cardul se schimba la 0,34 si 0,67', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' })
    expect(await citesteLatimea(page, 'pista 390')).toBe(390)
    const m = await page.evaluate((sel) => {
      const s = document.querySelector(sel)!
      const grila = s.querySelector('[data-pista]')!
      const pista = grila.firstElementChild as HTMLElement
      const fereastra = pista.firstElementChild as HTMLElement
      return {
        sectiune: s.getBoundingClientRect().height,
        pista: pista.offsetHeight,
        fereastra: fereastra.offsetHeight,
        top: pista.getBoundingClientRect().top + window.scrollY,
      }
    }, SECTIUNE)
    console.log('[pista 390] sectiune ' + m.sectiune + ' | pista ' + m.pista + ' | fereastra ' + m.fereastra)
    // 48 + 229 + 32 + 2532 + 64 + 154,8 (fisa, antet si §11).
    expect(Math.abs(m.sectiune - 3059.8) / 3059.8).toBeLessThan(0.02)
    expect(m.pista).toBe(3 * 844)
    const cursa = m.pista - m.fereastra
    const banda = page.locator(SECTIUNE + ' ol')
    const card = () => page.locator(SECTIUNE + ' [data-pista]').getAttribute('data-card')
    for (const [p, asteptat] of [[0.2, '0'], [0.33, '0'], [0.35, '1'], [0.66, '1'], [0.68, '2']] as const) {
      await deruleaza(page, m.top + p * cursa)
      await expect.poll(card).toBe(asteptat)
    }
    await deruleaza(page, m.top + 0.5 * cursa)
    await expect(banda).toHaveAttribute('style', /translate3d\(-33\.33\d*%/)
  })

  test('clicul pe punctul n aliniaza exact cardul n (abaterea §14.12)', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' })
    const g = await geometrie(page)
    await deruleaza(page, g.blocuri[0] + 5)
    const puncte = page.locator(SECTIUNE + ' button[aria-label^="Pasul"]')
    await expect(puncte).toHaveCount(3)
    for (const n of [2, 0, 1]) {
      await puncte.nth(n).click()
      // Derularea e lina: se asteapta pana sta.
      await expect
        .poll(async () => {
          const a = await page.evaluate(() => window.scrollY)
          await page.waitForTimeout(150)
          return a === (await page.evaluate(() => window.scrollY))
        })
        .toBe(true)
      const stanga = await page.locator(SECTIUNE + ' ol > li').nth(n).evaluate((li) => li.getBoundingClientRect().left)
      console.log('[puncte 390] punctul ' + (n + 1) + ': cardul la x ' + stanga.toFixed(2))
      expect(Math.abs(stanga)).toBeLessThan(1.5)
      await expect(puncte.nth(n)).toHaveAttribute('aria-current', 'step')
    }
  })

  test('cardurile din afara ferestrei sunt inerte, iar pagina nu derapeaza', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' })
    const g = await geometrie(page)
    for (const y of [g.blocuri[0], g.blocuri[0] + 844, g.blocuri[0] + 1688]) {
      await deruleaza(page, y)
      await page.waitForTimeout(200)
      const stare = await page.evaluate((sel) => ({
        latime: document.documentElement.scrollWidth,
        fereastra: window.innerWidth,
        inerte: [...document.querySelectorAll(sel + ' ol > li > figure')].map((f) => (f as HTMLElement).inert),
        card: document.querySelector(sel + ' [data-pista]')!.getAttribute('data-card'),
      }), SECTIUNE)
      console.log('[pista 390] card ' + stare.card + ' | inerte ' + stare.inerte.join(',') + ' | scrollWidth ' + stare.latime)
      expect(stare.latime).toBeLessThanOrEqual(stare.fereastra)
      expect(stare.inerte.filter((x) => !x)).toHaveLength(1)
      expect(stare.inerte[Number(stare.card)]).toBe(false)
    }
  })

  test('contrastul pe pista: nicio incalcare axe in sectiune, pe fiecare card; fara estompare, niciun nod lasat nejudecat', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' })
    const g = await geometrie(page)
    for (const [k, y] of [[0, g.blocuri[0]], [1, g.blocuri[0] + 844], [2, g.blocuri[0] + 1688]] as const) {
      await deruleaza(page, y)
      await expect.poll(() => page.locator(SECTIUNE + ' [data-pista]').getAttribute('data-card')).toBe(String(k))
      await page.waitForTimeout(1200)
      const r = await new AxeBuilder({ page }).include(SECTIUNE).analyze()
      const grave = r.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical')
      const judecateCu = r.passes.concat(r.violations).filter((v) => v.id === 'color-contrast').flatMap((v) => v.nodes).length
      console.log('[axe card ' + (k + 1) + ' 390] contrast judecat pe ' + judecateCu + ' noduri | grave: ' + grave.map((v) => v.id + ' x' + v.nodes.length).join(', '))
      expect(grave.map((v) => v.id)).toEqual([])
      const judecateFara = await contrastFaraEstompare(page, '390 card ' + (k + 1))
      expect(judecateFara).toBeGreaterThan(10)
    }
  })
})

test.describe('ecran scund culcat, 844 x 390, cu miscare', () => {
  test.use({ viewport: { width: 844, height: 390 }, reducedMotion: 'no-preference' })

  test('fara pista: cardurile unul sub altul, vizualul cel mult 60vh (fisa §12)', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' })
    expect(await citesteLatimea(page, 'culcat 844')).toBe(844)
    const s = page.locator(SECTIUNE)
    // Marcajul de miscare e pus (JavaScript, fara miscare redusa), dar pista nu se aplica.
    await expect(s.locator('[data-pista]')).toHaveCount(1)
    await expect(s.locator('[data-card]')).toHaveCount(0)
    const m = await s.evaluate((sec) => ({
      figuri: [...sec.querySelectorAll('ol > li > figure')].map((f) => ({
        h: Math.round(f.getBoundingClientRect().height * 10) / 10,
        inert: (f as HTMLElement).inert,
      })),
      fereastra: getComputedStyle(sec.querySelector('ol')!.parentElement!).position,
      banda: (sec.querySelector('ol') as HTMLElement).style.transform,
      vh: window.innerHeight,
    }))
    console.log('[culcat 844 x 390] vizualuri ' + m.figuri.map((f) => f.h).join(' / ') + ' | fereastra ' + m.fereastra + ' | vh ' + m.vh)
    expect(m.figuri.map((f) => f.inert)).toEqual([false, false, false])
    for (const f of m.figuri) expect(f.h).toBeLessThanOrEqual(0.6 * m.vh + 0.5)
    expect(m.fereastra).not.toBe('sticky')
    expect(m.banda).toBe('')
  })

  test('machetele pornesc cand intra in ecran: fara pas si fara card activ, ceasul il porneste vizibilitatea (fisa §5-§7)', async ({ page }) => {
    // Defectul prins de critic: pe ecranul culcat nu exista pista, deci nici card activ, iar
    // machetele nu porneau niciodata - dupa 6 s in ecran, randurile 000, persoana 1, 0 verificari din
    // 4 si lista de 2 px, mai sarace decat forma statica. Martorul NEGATIV e chiar starea aceea: pe
    // codul de dinainte, fiecare dintre asteptarile de mai jos expira.
    await page.goto('/', { waitUntil: 'networkidle' })
    expect(await citesteLatimea(page, 'culcat ceas')).toBe(844)
    const figuri = page.locator(SECTIUNE + ' ol > li > figure')
    const randuri = () => figuri.nth(0).locator('button[aria-expanded]').evaluateAll((b) => b.map((x) => (x.getAttribute('aria-expanded') === 'true' ? '1' : '0')).join(''))
    const persoana = () => figuri.nth(1).locator('button[aria-pressed]').evaluateAll((b) => b.findIndex((x) => x.getAttribute('aria-pressed') === 'true'))
    const aduInEcran = async (i: number) => {
      const y = await figuri.nth(i).evaluate((f) => {
        const r = f.getBoundingClientRect()
        return r.top + window.scrollY + r.height / 2 - window.innerHeight / 2
      })
      await deruleaza(page, y)
    }
    // In afara ecranului: cu miscare, montarea a golit starea statica, iar niciun ceas n-a pornit.
    await expect.poll(randuri).toBe('000')
    await expect(figuri.nth(2)).toHaveAttribute('data-verificari', '0')
    // Macheta 1: randul 1 se deschide la ~400 ms dupa intrarea in ecran.
    await aduInEcran(0)
    const t1 = Date.now()
    await expect.poll(randuri, { timeout: 3000 }).toBe('100')
    const dupaRand = Date.now() - t1
    // Portalul: prima schimbare de persoana la 4,4 s.
    await aduInEcran(1)
    const t2 = Date.now()
    expect(await persoana()).toBe(0)
    await expect.poll(persoana, { timeout: 8000 }).toBe(1)
    const dupaPortal = Date.now() - t2
    // Registrul: prima verificare la 900 ms, apoi cate una la 500 ms; lista creste cu ele.
    await aduInEcran(2)
    const t3 = Date.now()
    await expect(figuri.nth(2)).toHaveAttribute('data-verificari', '4', { timeout: 6000 })
    const dupaRegistru = Date.now() - t3
    const lista = await figuri.nth(2).locator('ul').evaluate((u) => u.getBoundingClientRect().height)
    console.log('[culcat ceas] randul 1 deschis dupa ' + dupaRand + ' ms | persoana 2 dupa ' + dupaPortal + ' ms | 4 verificari dupa ' + dupaRegistru + ' ms, lista ' + lista.toFixed(1) + ' px (asteptarile citesc starea la 100-1000 ms)')
    // Rotatia portalului nu vine inainte de perioada ei (4 s): ceasul are forma lui, nu doar porneste.
    expect(dupaPortal).toBeGreaterThanOrEqual(3500)
    expect(lista).toBeGreaterThan(150)
  })
})

test.describe('cu miscare redusa (forma statica, cu JavaScript)', () => {
  test('390: fara pista, cardurile unul sub altul, machetele in starea finala', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/', { waitUntil: 'networkidle' })
    expect(await citesteLatimea(page, 'redus 390')).toBe(390)
    const s = page.locator(SECTIUNE)
    await expect(s.locator('[data-pista]')).toHaveCount(0)
    const figuri = s.locator('ol > li > figure')
    expect(await figuri.evaluateAll((f) => f.map((x) => (x as HTMLElement).inert))).toEqual([false, false, false])
    await expect(figuri.nth(2)).toHaveAttribute('data-verificari', '4')
    await expect(figuri.nth(0).locator('button[aria-expanded]').nth(0)).toHaveAttribute('aria-expanded', 'true')
  })

  test('1440: panza 3D e un singur cadru in starea finala - teancul intreg si bara plina - la oricare pas (COMPONENTE §2.5)', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('/', { waitUntil: 'networkidle' })
    expect(await citesteLatimea(page, 'panza redus 1440')).toBe(1440)
    const g = await geometrie(page)
    // Fasia de la 125 la 205 px sub marginea de sus a cardului, in dreptul barei si al teancului.
    // Calculat din fisa §8: teancul complet urca pana la ~153 px, bara plina pana la ~163; la pasul 1,
    // teancul de 4 foi incepe abia la ~229, iar bara la ~242 - deci fasia ar fi goala.
    const masoara = async () => {
      await page.waitForTimeout(1300)
      const card = await page.locator(SECTIUNE + ' [class*="_card__"]').first().boundingBox()
      if (!card) throw new Error('cardul lipit nu are cutie')
      const zona = { x: Math.round(card.x + card.width + 14), y: Math.round(card.y + 125), width: 54, height: 80 }
      const png = await page.screenshot({ clip: zona })
      return page.evaluate(async (b64) => {
        const img = new Image()
        img.src = 'data:image/png;base64,' + b64
        await img.decode()
        const c = document.createElement('canvas')
        c.width = img.width
        c.height = img.height
        const x = c.getContext('2d')!
        x.drawImage(img, 0, 0)
        const d = x.getImageData(0, 0, c.width, c.height).data
        let foaie = 0
        let albastru = 0
        for (let i = 0; i < d.length; i += 4) {
          if (d[i + 2] > d[i] + 40) albastru++
          else if (d[i] < 245 || d[i + 1] < 245 || d[i + 2] < 245) foaie++
        }
        return { foaie, albastru }
      }, png.toString('base64'))
    }
    await deruleaza(page, g.sectiune + 300)
    await expect.poll(() => pasul(page)).toBe('0')
    const pas1 = await masoara()
    await deruleaza(page, g.blocuri[2])
    await expect.poll(() => pasul(page)).toBe('2')
    const pas3 = await masoara()
    console.log('[panza redus 1440] deasupra teancului de la pasul 1: pas 1 ' + JSON.stringify(pas1) + ', pas 3 ' + JSON.stringify(pas3))
    // La pasul 1 teancul pasului (4 foi) nu ajunge aici; teancul final da, iar bara plina la fel.
    expect(pas1.foaie).toBeGreaterThan(600)
    expect(pas1.albastru).toBeGreaterThan(20)
    // Un singur cadru: pasul 3 arata la fel.
    expect(Math.abs(pas3.foaie - pas1.foaie)).toBeLessThan(40)
  })

  test('1440: pasul se schimba pe loc, fara crossfade (abaterea §14.4)', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('/', { waitUntil: 'networkidle' })
    const g = await geometrie(page)
    await deruleaza(page, g.sectiune + 300)
    await expect.poll(() => pasul(page)).toBe('0')
    await deruleaza(page, g.blocuri[1])
    await expect.poll(() => pasul(page)).toBe('1')
    // La 100 ms, un crossfade de 450 ms ar fi pe la o treime; cu miscare redusa e deja gata.
    await page.waitForTimeout(100)
    const opacitati = await page.locator(SECTIUNE + ' [class*="card"] > div').evaluateAll((n) => n.map((x) => getComputedStyle(x).opacity))
    expect(opacitati).toEqual(['0', '1', '0'])
  })
})

// ---------------------------------------------------------------------------------------------
// Estomparea de jos, masurata pe pixeli (abaterea §14.7)
// ---------------------------------------------------------------------------------------------

/** Un rand de text (un fragment al unui nod de text), in px CSS fata de fereastra. */
type RandText = { text: string; x: number; y: number; w: number; h: number; golJos: number; prag: number }

/**
 * Randurile de text ale figurii: INTREGI (tot continutul in rama si netaiat de niciun stramos - un
 * rezumat inchis e taiat la inaltimea 0) si TAIATE de marginea de jos a ramei. Elementele inactive
 * (dosarele fara acces, `aria-disabled`) sunt scutite de WCAG 1.4.3 si nu se numara.
 */
function randurileFigurii(fig: Element) {
  const cs = getComputedStyle(fig)
  const fr = fig.getBoundingClientRect()
  const sus = fr.top + parseFloat(cs.borderTopWidth)
  const jos = fr.bottom - parseFloat(cs.borderBottomWidth)
  const dupa = getComputedStyle(fig, '::after')
  const estompare = dupa.content === 'none' || dupa.content === 'normal' ? 0 : parseFloat(dupa.height) || 0
  // Figura plin vizibila: un slot inactiv (sau in mijlocul unui crossfade) ar da alte culori.
  let opacitate = 1
  let transformata = false
  for (let x: Element | null = fig; x; x = x.parentElement) {
    const c = getComputedStyle(x)
    opacitate *= Number(c.opacity)
    if (x !== fig && c.transform !== 'none' && !/^matrix\(1, 0, 0, 1, [-\d.]+, 0\)$/.test(c.transform)) transformata = true
  }
  const intregi: RandText[] = []
  const taiate: string[] = []
  const umblator = document.createTreeWalker(fig, NodeFilter.SHOW_TEXT)
  for (let n = umblator.nextNode(); n; n = umblator.nextNode()) {
    const el = n.parentElement
    const text = (n.textContent ?? '').trim()
    if (!el || !text || el.closest('.doar-cititor, figcaption, [aria-disabled="true"]')) continue
    let t = -Infinity
    let b = Infinity
    let l = -Infinity
    let r = Infinity
    let ascuns = false
    for (let x: Element | null = el; x && x !== fig.parentElement; x = x.parentElement) {
      const c = getComputedStyle(x)
      if (c.display === 'none' || c.visibility === 'hidden' || Number(c.opacity) < 0.05) ascuns = true
      if (c.overflowX !== 'visible' || c.overflowY !== 'visible') {
        const d = x.getBoundingClientRect()
        t = Math.max(t, d.top)
        b = Math.min(b, d.bottom)
        l = Math.max(l, d.left)
        r = Math.min(r, d.right)
      }
    }
    if (ascuns) continue
    const stil = getComputedStyle(el)
    const px = parseFloat(stil.fontSize)
    const prag = px >= 24 || (px >= 18.66 && Number(stil.fontWeight) >= 700) ? 3 : 4.5
    const interval = document.createRange()
    interval.selectNodeContents(n)
    for (const d of interval.getClientRects()) {
      const st = Math.max(d.left, l)
      const dr = Math.min(d.right, r)
      if (dr - st < 1 || Math.min(d.bottom, b) - Math.max(d.top, t) < 0.5) continue
      if (d.top >= Math.max(sus, t) - 0.5 && d.bottom <= Math.min(jos, b) + 0.5) {
        intregi.push({ text: text.slice(0, 30), x: st, y: d.top, w: dr - st, h: d.height, golJos: Math.round((jos - d.bottom) * 100) / 100, prag })
      } else if (d.bottom > jos) {
        taiate.push(text.slice(0, 30) + ' (' + Math.round((jos - d.top) * 10) / 10 + ' din ' + Math.round(d.height * 10) / 10 + ' px)')
      }
    }
  }
  return { estompare, rama: Math.round((jos - sus) * 100) / 100, opacitate, transformata, intregi, taiate }
}

/**
 * Contrastul fiecarui rand de text, din pixeli: `a` = captura cu estompare, `b` = fara, aceeasi
 * stare, la DPR 2 (trasaturile literelor acopera pixeli intregi, deci cel mai inchis pixel are
 * culoarea textului). Pe fiecare rand de pixeli: contrastul celui mai inchis pixel fata de fundal, in
 * B si in A. Randurile de CERNEALA PLINA sunt cele care ating 85% din maximul din B. Contrastul
 * EFECTIV = maximul din B (culoarea textului pe fundalul lui) inmultit cu cel mai slab raport A / B
 * pe randurile de cerneala plina: cat lasa estomparea din randul cel mai spalat.
 */
async function contrastPePixeli(page: Page, a: Buffer, b: Buffer, randuri: RandText[], clip: { x: number; y: number }) {
  return page.evaluate(
    async ([a64, b64, lista, x0c, y0c]) => {
      const incarca = async (sir: string) => {
        const img = new Image()
        img.src = 'data:image/png;base64,' + sir
        await img.decode()
        const c = document.createElement('canvas')
        c.width = img.width
        c.height = img.height
        const x = c.getContext('2d')!
        x.drawImage(img, 0, 0)
        return { d: x.getImageData(0, 0, c.width, c.height).data, w: c.width, h: c.height }
      }
      const A = await incarca(a64)
      const B = await incarca(b64)
      const dpr = window.devicePixelRatio
      const lin = (v: number) => {
        const s = v / 255
        return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
      }
      const lum = (d: Uint8ClampedArray, i: number) => 0.2126 * lin(d[i]) + 0.7152 * lin(d[i + 1]) + 0.0722 * lin(d[i + 2])
      const k = (x: number, y: number) => (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05)
      const cheie = (d: Uint8ClampedArray, i: number) => (d[i] << 16) | (d[i + 1] << 8) | d[i + 2]
      return lista.map((f) => {
        const x0 = Math.max(0, Math.round((f.x - x0c) * dpr))
        const x1 = Math.min(B.w, Math.round((f.x + f.w - x0c) * dpr))
        const y0 = Math.max(0, Math.round((f.y - y0c) * dpr))
        const y1 = Math.min(B.h, Math.round((f.y + f.h - y0c) * dpr))
        // Fundalul: culoarea cea mai frecventa a dreptunghiului, in B.
        const frecvente = new Map<number, number>()
        for (let y = y0; y < y1; y++) {
          for (let x = x0; x < x1; x++) {
            const c = cheie(B.d, (y * B.w + x) * 4)
            frecvente.set(c, (frecvente.get(c) ?? 0) + 1)
          }
        }
        let fundal = 0
        let cate = -1
        for (const [c, n] of frecvente) {
          if (n > cate) {
            cate = n
            fundal = c
          }
        }
        const lf = 0.2126 * lin((fundal >> 16) & 255) + 0.7152 * lin((fundal >> 8) & 255) + 0.0722 * lin(fundal & 255)
        const pe: { cB: number; cA: number }[] = []
        for (let y = y0; y < y1; y++) {
          // Fundalul lui A pe randul acesta: acolo unde B are fundalul.
          let lfa = lf
          for (let x = x0; x < x1; x++) {
            const i = (y * B.w + x) * 4
            if (cheie(B.d, i) === fundal) {
              lfa = lum(A.d, i)
              break
            }
          }
          let cB = 1
          let cA = 1
          for (let x = x0; x < x1; x++) {
            const i = (y * B.w + x) * 4
            cB = Math.max(cB, k(lum(B.d, i), lf))
            cA = Math.max(cA, k(lum(A.d, i), lfa))
          }
          pe.push({ cB, cA })
        }
        const kMax = Math.max(...pe.map((r) => r.cB))
        const raport = Math.min(...pe.filter((r) => r.cB >= 0.85 * kMax).map((r) => r.cA / r.cB))
        return {
          text: f.text,
          golJos: f.golJos,
          prag: f.prag,
          kMax: Math.round(kMax * 100) / 100,
          raport: Math.round(raport * 1000) / 1000,
          efectiv: Math.round(kMax * raport * 100) / 100,
        }
      })
    },
    [a.toString('base64'), b.toString('base64'), randuri, clip.x, clip.y] as const,
  )
}

/** O stare a figurii: captura cu estompare si fara, apoi contrastul randurilor intregi pe care estomparea le poate atinge. */
async function masoaraEstomparea(page: Page, fig: Locator, eticheta: string) {
  // Tranzitiile randurilor (200 ms) si ale sloturilor (450 ms) se termina inainte de captura.
  await page.waitForTimeout(600)
  const cutie = await fig.boundingBox()
  if (!cutie) throw new Error('figura nu are cutie: ' + eticheta)
  const clip = {
    x: Math.floor(cutie.x),
    y: Math.floor(cutie.y),
    width: Math.ceil(cutie.x + cutie.width) - Math.floor(cutie.x),
    height: Math.ceil(cutie.y + cutie.height) - Math.floor(cutie.y),
  }
  // Figura intreaga in fereastra: altfel captura ar fi taiata si coordonatele n-ar mai corespunde.
  const fereastra = page.viewportSize()!
  expect(clip.x >= 0 && clip.y >= 0 && clip.x + clip.width <= fereastra.width && clip.y + clip.height <= fereastra.height, eticheta + ': figura iese din fereastra').toBe(true)
  const inainte = await fig.evaluate(randurileFigurii)
  expect({ opacitate: inainte.opacitate, transformata: inainte.transformata }, eticheta + ': figura plin vizibila, nescalata').toEqual({ opacitate: 1, transformata: false })
  const A = await page.screenshot({ clip })
  const stil = await page.addStyleTag({ content: '#functionalitati [class*="_estompat__"]::after{content:none!important}' })
  const B = await page.screenshot({ clip })
  await stil.evaluate((n) => (n as Element).remove())
  // Starea nu s-a schimbat intre capturi: niciun ceas n-a batut intre ele.
  expect(JSON.stringify((await fig.evaluate(randurileFigurii)).intregi)).toBe(JSON.stringify(inainte.intregi))
  // Randurile intregi din banda estomparii si cele de deasupra ei, pe cel mult 40 px: in fiecare stare
  // se masoara ceva, iar randurile departe de banda au raportul 1 si isi arata contrastul propriu.
  const aproape = inainte.intregi.filter((r) => r.golJos < inainte.estompare + 40)
  const rez = await contrastPePixeli(page, A, B, aproape, clip)
  console.log(
    '[estompare ' + eticheta + '] rama ' + inainte.rama + ' | estompare ' + inainte.estompare + ' px | randuri intregi ' + inainte.intregi.length +
      ' | taiate: ' + (inainte.taiate.join('; ') || '-'),
  )
  for (const r of rez) {
    console.log('    intreg "' + r.text + '", la ' + r.golJos + ' px de margine: ' + r.kMax + ':1 fara estompare, raport ' + r.raport + ' -> ' + r.efectiv + ':1 (prag ' + r.prag + ')')
  }
  return { ...inainte, rez }
}

/** Martorul masuratorii pe pixeli: un text #94a3b8 pe alb, cu contrast cunoscut (2,56:1). */
async function martorCuloare(page: Page) {
  const r = await page.evaluate(() => {
    const s = document.createElement('span')
    s.id = 'martor-contrast'
    s.textContent = 'Termen de păstrare 2025'
    s.style.cssText = 'position:fixed;left:16px;top:96px;z-index:2147483647;padding:6px;background:#fff;color:#94a3b8;font:600 13.6px/21.76px var(--font-sans)'
    document.body.appendChild(s)
    const i = document.createRange()
    i.selectNodeContents(s.firstChild!)
    const d = i.getClientRects()[0]
    return { text: 'martor #94a3b8', x: d.left, y: d.top, w: d.width, h: d.height, golJos: 0, prag: 4.5 }
  })
  const clip = { x: 0, y: 80, width: 360, height: 60 }
  const png = await page.screenshot({ clip })
  const [m] = await contrastPePixeli(page, png, png, [r], clip)
  await page.evaluate(() => document.getElementById('martor-contrast')?.remove())
  console.log('[martor culoare] #94a3b8 pe alb, citit din pixeli: ' + m.kMax + ':1')
  return m.kMax
}

/** Randurile machetei 1: '100' = randul 1 deschis. */
const randuriDeschise = (fig: Locator) =>
  fig.locator('button[aria-expanded]').evaluateAll((b) => b.map((x) => (x.getAttribute('aria-expanded') === 'true' ? '1' : '0')).join(''))

/** Punctul unui element in fereastra, fata de coltul lui (implicit, centrul). */
async function punct(el: Locator, dx?: number, dy?: number) {
  const b = await el.boundingBox()
  if (!b) throw new Error('elementul nu are cutie')
  return { x: b.x + (dx ?? b.width / 2), y: b.y + (dy ?? b.height / 2) }
}

/** Macheta 1 adusa in stare cu mouse-ul, care tine ceasul pe loc: deasupra randului il deschide, iar
 *  clicul pe randul deschis le inchide pe toate (fisa §5, ca la referinta). Mouse-ul merge direct la
 *  coordonate, fara `hover()` / `click()`: acelea deruleaza elementul "in vedere", iar un rand taiat
 *  de rama nu e niciodata intreg in vedere (masurat la 1440: pagina a coborat de la 2521 la 2460 pe
 *  doua treceri ale mouse-ului). Intr-o rulare, pasul a revenit la 1 in mijlocul masuratorii
 *  portalului (rama 406,2 = 412,4 x 0,985, scara slotului inactiv); declansatorul exact nu l-am
 *  izolat, de aceea masuratoarea cere si figura plin vizibila. */
async function stareCuMouse(page: Page, fig: Locator, rand: number, inchis: boolean) {
  const p = await punct(fig.locator('button[aria-expanded]').nth(rand), 24, 10)
  await page.mouse.move(p.x, p.y)
  await expect.poll(() => randuriDeschise(fig)).toBe(['100', '010', '001'][rand])
  if (!inchis) return
  await page.mouse.click(p.x, p.y)
  await expect.poll(() => randuriDeschise(fig)).toBe('000')
}

/** Clicul pe un tab al portalului, la coordonate (fara derularea automata): alege persoana si
 *  opreste rotatia 10 s, deci starea sta pe loc cat se masoara. */
async function alegePersoana(page: Page, fig: Locator, k: number) {
  const tab = fig.locator('button[aria-pressed]').nth(k)
  const p = await punct(tab)
  await page.mouse.click(p.x, p.y)
  await expect(tab).toHaveAttribute('aria-pressed', 'true')
}

type Masura = Awaited<ReturnType<typeof masoaraEstomparea>>

/**
 * Toate masuratorile: niciun rand intreg sub prag, iar proba a avut ce masura. Estomparea urmeaza
 * asezarea (`estompare.ts`): lipseste unde nimic nu e taiat si nu trece de spatiul liber de sub cel
 * mai de jos lucru intreg, deci nu se cere in fiecare stare - se cere sa fie vie: pusa macar intr-o
 * stare cu rand taiat.
 */
function textIntregLizibil(masuri: Masura[], minimMasurate: number) {
  const toate = masuri.flatMap((m) => m.rez)
  expect(toate.length).toBeGreaterThanOrEqual(minimMasurate)
  expect(toate.filter((r) => r.efectiv < r.prag)).toEqual([])
  expect(masuri.some((m) => m.taiate.length > 0 && m.estompare > 0)).toBe(true)
}

/** Pista de la 390: marginea ei de sus in pagina si cursa. */
async function pozitiaPistei(page: Page) {
  return page.evaluate((sel) => {
    const p = document.querySelector(sel + ' [data-pista]')!.firstElementChild as HTMLElement
    const f = p.firstElementChild as HTMLElement
    return { top: p.getBoundingClientRect().top + window.scrollY, cursa: p.offsetHeight - f.offsetHeight }
  }, SECTIUNE)
}

/** O figura din lista cardurilor (mobil), adusa in mijlocul ferestrei. */
async function figuraInEcran(page: Page, i: number) {
  const fig = page.locator(SECTIUNE + ' ol > li').nth(i).locator('figure')
  const y = await fig.evaluate((f) => {
    const r = f.getBoundingClientRect()
    return r.top + window.scrollY + r.height / 2 - window.innerHeight / 2
  })
  await deruleaza(page, y)
  return fig
}

test.describe('estomparea de jos, pe pixeli, la 1440 x 900: acopera doar randul taiat (abaterea §14.7)', () => {
  test.use({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2, reducedMotion: 'no-preference' })

  test('machetele 1 si 2, in fiecare stare: textul intreg din rama ramane peste 4,5:1', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' })
    expect(await citesteLatimea(page, 'estompare 1440')).toBe(1440)
    const g = await geometrie(page)
    await deruleaza(page, g.sectiune + 300)
    await expect.poll(() => pasul(page)).toBe('0')
    const m1 = machetaCard(page, 0)
    const masuri: Masura[] = []
    await stareCuMouse(page, m1, 0, false)
    masuri.push(await masoaraEstomparea(page, m1, '1440 cautare 100'))
    await stareCuMouse(page, m1, 0, true)
    masuri.push(await masoaraEstomparea(page, m1, '1440 cautare 000'))
    await stareCuMouse(page, m1, 1, false)
    masuri.push(await masoaraEstomparea(page, m1, '1440 cautare 010'))
    // Randul 3 e in rama numai cu primele doua inchise.
    await stareCuMouse(page, m1, 1, true)
    await stareCuMouse(page, m1, 2, false)
    masuri.push(await masoaraEstomparea(page, m1, '1440 cautare 001'))
    await page.mouse.move(0, 0)
    await deruleaza(page, g.blocuri[1])
    await expect.poll(() => pasul(page)).toBe('1')
    const m2 = machetaCard(page, 1)
    for (const k of [0, 2]) {
      await alegePersoana(page, m2, k)
      masuri.push(await masoaraEstomparea(page, m2, '1440 portal persoana ' + (k + 1)))
      expect(await pasul(page)).toBe('1')
    }
    textIntregLizibil(masuri, 4)
  })
})

/** Cele 3 carduri ale pistei, masurate pe pixeli in starile machetei 1, cu portalul si registrul complet. */
async function pistaPePixeli(page: Page, latime: number) {
  await page.goto('/', { waitUntil: 'networkidle' })
  expect(await citesteLatimea(page, 'estompare ' + latime)).toBe(latime)
  const p = await pozitiaPistei(page)
  const card = () => page.locator(SECTIUNE + ' [data-pista]').getAttribute('data-card')
  const figura = (i: number) => page.locator(SECTIUNE + ' ol > li').nth(i).locator('figure')
  // Progresul 0, 0,5 si 1: fiecare card aliniat exact in fereastra (intre ele banda urmeaza
  // derularea, iar cardul activ e deplasat lateral, deci captura lui ar iesi din ecran).
  await deruleaza(page, p.top)
  await expect.poll(card).toBe('0')
  const masuri: Masura[] = []
  await stareCuMouse(page, figura(0), 0, false)
  masuri.push(await masoaraEstomparea(page, figura(0), latime + ' cautare 100'))
  await stareCuMouse(page, figura(0), 0, true)
  masuri.push(await masoaraEstomparea(page, figura(0), latime + ' cautare 000'))
  await stareCuMouse(page, figura(0), 1, false)
  masuri.push(await masoaraEstomparea(page, figura(0), latime + ' cautare 010'))
  await page.mouse.move(0, 0)
  await deruleaza(page, p.top + 0.5 * p.cursa)
  await expect.poll(card).toBe('1')
  await alegePersoana(page, figura(1), 0)
  masuri.push(await masoaraEstomparea(page, figura(1), latime + ' portal'))
  await page.mouse.move(0, 0)
  await deruleaza(page, p.top + p.cursa)
  await expect.poll(card).toBe('2')
  await expect(figura(2)).toHaveAttribute('data-verificari', '4', { timeout: 6000 })
  masuri.push(await masoaraEstomparea(page, figura(2), latime + ' registru'))
  textIntregLizibil(masuri, 4)
}

test.describe('estomparea de jos, pe pixeli, la 360 x 800 pe pista', () => {
  test.use({ viewport: { width: 360, height: 800 }, deviceScaleFactor: 2, reducedMotion: 'no-preference' })

  // Aici o estompare de inaltime FIXA (5 px) spala primul rand al registrului, intreg la 0,58 px de
  // margine: 1,08:1 pe randul lui cel mai de jos de cerneala (masurat). Inaltimea urmeaza asezarea.
  test('cele 3 carduri, in starile machetei 1: textul intreg din rama ramane peste 4,5:1', async ({ page }) => {
    await pistaPePixeli(page, 360)
  })
})

test.describe('estomparea de jos, pe pixeli, la 390 x 844 pe pista', () => {
  test.use({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, reducedMotion: 'no-preference' })

  test('cele 3 carduri, in starile machetei 1: textul intreg din rama ramane peste 4,5:1', async ({ page }) => {
    await pistaPePixeli(page, 390)
  })

  test('martor POZITIV: estomparea de 40 px a rundei anterioare spala textul intreg si e prinsa; #94a3b8 pe alb se citeste 2,56:1', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' })
    const p = await pozitiaPistei(page)
    await deruleaza(page, p.top)
    await expect.poll(() => page.locator(SECTIUNE + ' [data-pista]').getAttribute('data-card')).toBe('0')
    // Martorul de culoare: masuratoarea citeste din pixeli un contrast cunoscut.
    expect(Math.abs((await martorCuloare(page)) - 2.56)).toBeLessThan(0.05)
    // Starea in care textul intreg sta cel mai jos (data si eticheta randului 2), cu estomparea veche.
    const fig = page.locator(SECTIUNE + ' ol > li').nth(0).locator('figure')
    await stareCuMouse(page, fig, 1, false)
    const veche = await page.addStyleTag({ content: '#functionalitati [class*="_estompat__"]::after{height:40px!important}' })
    const m = await masoaraEstomparea(page, fig, 'martor 40 px')
    await veche.evaluate((n) => (n as Element).remove())
    // Controlul injectarii: estomparea masurata chiar e cea veche.
    expect(m.estompare).toBe(40)
    const prinse = m.rez.filter((r) => r.efectiv < r.prag)
    console.log('[martor 40 px] randuri intregi prinse sub prag: ' + prinse.map((r) => r.text + ' ' + r.efectiv + ':1').join(' | '))
    expect(prinse.length).toBeGreaterThan(0)
  })
})

test.describe('estomparea de jos, pe pixeli, pe ecranul culcat (844 x 390)', () => {
  test.use({ viewport: { width: 844, height: 390 }, deviceScaleFactor: 2, reducedMotion: 'no-preference' })

  test('cele 3 machete, unul sub altul: textul intreg din rama ramane peste 4,5:1', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' })
    expect(await citesteLatimea(page, 'estompare culcat')).toBe(844)
    const masuri: Masura[] = []
    const m1 = await figuraInEcran(page, 0)
    await stareCuMouse(page, m1, 0, false)
    masuri.push(await masoaraEstomparea(page, m1, 'culcat cautare 100'))
    await stareCuMouse(page, m1, 0, true)
    masuri.push(await masoaraEstomparea(page, m1, 'culcat cautare 000'))
    await stareCuMouse(page, m1, 1, false)
    masuri.push(await masoaraEstomparea(page, m1, 'culcat cautare 010'))
    await page.mouse.move(0, 0)
    const m2 = await figuraInEcran(page, 1)
    await alegePersoana(page, m2, 0)
    masuri.push(await masoaraEstomparea(page, m2, 'culcat portal'))
    await page.mouse.move(0, 0)
    const m3 = await figuraInEcran(page, 2)
    await expect(m3).toHaveAttribute('data-verificari', '4', { timeout: 6000 })
    masuri.push(await masoaraEstomparea(page, m3, 'culcat registru'))
    textIntregLizibil(masuri, 4)
  })
})

test.describe('estomparea de jos, pe pixeli, cu miscare redusa la 390 (forma statica)', () => {
  test.use({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, reducedMotion: 'reduce' })

  test('cele 3 carduri unul sub altul, in starea finala: textul intreg din rama ramane peste 4,5:1', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' })
    expect(await citesteLatimea(page, 'estompare redus 390')).toBe(390)
    const masuri: Masura[] = []
    for (const i of [0, 1, 2]) masuri.push(await masoaraEstomparea(page, await figuraInEcran(page, i), 'redus 390 macheta ' + (i + 1)))
    textIntregLizibil(masuri, 1)
  })
})
