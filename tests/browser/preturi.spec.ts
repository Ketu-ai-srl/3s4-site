import { expect, test, type Locator, type Page } from '@playwright/test'
import {
  BIROU,
  CALCULATOR,
  COMUTATOR,
  INTREBARI_PRETURI,
  LINIA_DE_BAZA,
  LISTA_PDF,
  POARTA_BAZA,
  POARTA_ENTERPRISE,
} from '../../src/content/preturi'
import { RUTE } from '../../src/content/rute'
import { stareAnalitica } from '../../src/lib/analitica'
import { masoaraAccesibilitatea } from './ajutor/detectori'

/**
 * Pagina de preturi (felia `preturi`, valul S4-3), pe build-ul local. Forma statica si textul servit
 * sunt ale probei `tests/preturi.test.ts`; aici se masoara comportamentul viu, cu sursa fiecarei
 * cifre in fisa `preturi.md` (depozitul fabricii):
 *   - poarta: clicul pe cardul de baza porneste plecarea (.42 s), apoi lumea pachetelor intra; adresa
 *     nu se schimba, focusul trece pe titlul lumii; "inapoi" revine pe loc (§3, §5);
 *   - ancora `#pachete`, la incarcare si din legatura "Pachete" a subsolului, deschide lumea (§3);
 *   - fara JavaScript: cardul e o legatura, lumea se deschide prin `:target`;
 *   - calculatorul, comutatorul, tooltip-ul, pliurile (biroul pana la 36, banda de conturi,
 *     tabelul derulat in panou la 390), intrebarile exclusive (§6-§8);
 *   - miscarea biroului dupa +1, cu timpul paginii fixat: se misca, apoi se linisteste pana la 1,2 s;
 *   - tiparirea listei de preturi: numai foaia ramane in flux, un singur PDF de o pagina (§6e);
 *   - axe in starea pachetelor, cu pliurile deschise, la 1440 si la 390.
 *
 * Cardul enterprise si linia Enterprise a calculatorului urmeaza RUTE: fara ruta `/enterprise` sunt
 * INERTE (span, fara href, fara focus, fara efect), cu ruta sunt legaturi spre ea, cu acelasi aspect.
 * Forma veche cerea ruta LIPSA si a picat pe lotul feliilor 48-56 (rularea CI 36200373839), unde felia
 * enterprise-formular o adauga corect. Probele se aleg dupa RUTE, ca proba unit (tests/preturi.test.ts).
 *
 * `innerWidth` se CITESTE din pagina la fiecare latime si se scrie in raport.
 */

const CALE = '/preturi'

/** Exista pagina Enterprise pe site? Se citeste din manifestul rutelor, nu se presupune. */
const ENTERPRISE_EXISTA = RUTE.some((r) => r.cale === POARTA_ENTERPRISE.tinta.ruta)

async function citesteLatimea(page: Page, eticheta: string): Promise<number> {
  const latime = await page.evaluate(() => window.innerWidth)
  console.log('[' + eticheta + '] innerWidth CITIT: ' + latime)
  return latime
}

/** Pagina incarcata si hidratata (starea isi pune marcajul dupa hidratare). */
async function deschide(page: Page, adresa = CALE): Promise<void> {
  await page.goto(adresa, { waitUntil: 'networkidle' })
  await page.locator('[data-vedere][data-hidratat]').waitFor({ state: 'attached' })
}

const vedere = (page: Page) => page.locator('[data-vedere]').getAttribute('data-vedere')

/** Elementul e desenat (are cutii), nu doar prezent in DOM. */
const peEcran = (page: Page, selector: string) =>
  page.evaluate((s) => {
    const e = document.querySelector(s)
    return e !== null && e.getClientRects().length > 0
  }, selector)

const cardBaza = (page: Page) => page.locator('#alegere a[href="#pachete"]')

/** O intrare din jurnalul trecerii: ce s-a intamplat, cand, si starea poartii si a lumii atunci. */
type IntrareJurnal = { fel: 'pornire' | 'clic' | 'schimbare'; t: number; plecare: string | null; vedere: string | null; lume: boolean }

/**
 * Jurnalul trecerii poarta -> lume, tinut IN PAGINA de un observator pus INAINTE de clic: clicul
 * (in faza de captura, pe document) si fiecare schimbare a marcajului de plecare (#alegere) sau a
 * vederii, cu momentul ei si cu starea lumii. Starea plecarii dureaza 420 ms; o citire facuta dupa
 * clic, printr-un dus-intors la pagina, o rata pe masina incarcata (runda 2 a criticului: 1 din 8
 * rulari, "plecare: null, lume: true" pe un comportament corect). Observatorul nu are dus-intors.
 */
async function pornesteJurnalul(page: Page): Promise<void> {
  await page.evaluate(() => {
    const poarta = document.getElementById('alegere')
    const stare = document.querySelector('[data-vedere]')
    if (!poarta || !stare) throw new Error('lipseste poarta sau starea')
    const jurnal: IntrareJurnal[] = []
    const noteaza = (fel: IntrareJurnal['fel']) =>
      jurnal.push({
        fel,
        t: performance.now(),
        plecare: poarta.getAttribute('data-plecare'),
        vedere: stare.getAttribute('data-vedere'),
        lume: (document.getElementById('pachete')?.getClientRects().length ?? 0) > 0,
      })
    noteaza('pornire')
    document.addEventListener('click', () => noteaza('clic'), { capture: true, once: true })
    const observator = new MutationObserver(() => noteaza('schimbare'))
    observator.observe(poarta, { attributes: true, attributeFilter: ['data-plecare'] })
    observator.observe(stare, { attributes: true, attributeFilter: ['data-vedere'] })
    ;(window as unknown as { __jurnalTrecere: IntrareJurnal[] }).__jurnalTrecere = jurnal
  })
}

/** Jurnalul citit dupa ce trecerea s-a terminat, cu momentele in ms de la clic (pentru raport). */
async function citesteJurnalul(page: Page, eticheta: string): Promise<IntrareJurnal[]> {
  const jurnal = await page.evaluate(() => (window as unknown as { __jurnalTrecere: IntrareJurnal[] }).__jurnalTrecere)
  const clic = jurnal.find((j) => j.fel === 'clic')?.t ?? jurnal[0].t
  console.log('[' + eticheta + '] jurnalul trecerii: ' + JSON.stringify(jurnal.map((j) => ({ ...j, t: Math.round(j.t - clic) }))))
  return jurnal
}

async function intraInPachete(page: Page): Promise<void> {
  await cardBaza(page).click()
  await expect.poll(() => vedere(page), { timeout: 5000 }).toBe('pachete')
  await expect.poll(() => peEcran(page, '#pachete')).toBe(true)
}

/** Momentele cadrelor dupa clic, in ms: intervalele sunt 0-80, 80-160, ..., 1200-1600. */
const MOMENTE_BIROU = [0, 80, 160, 300, 500, 800, 1200, 1600]

/**
 * Profilul miscarii scenei biroului: pixelii schimbati intre cadre consecutive ale panzei (media
 * |dR|, |dG|, |dB| peste 8, compus pe alb), cu timpul paginii FIXAT. Scena citeste timpul numai prin
 * `performance.now`, deci fiecare cadru cade exact la momentul cerut dupa clic, oricat de incarcata
 * ar fi masina. Citirea panzei se face in acelasi cadru in care scena a desenat.
 */
async function profilBirou(pliu: Locator, clic: boolean): Promise<number[]> {
  return pliu.evaluate(
    async (el, { clic, momente, eticheta }) => {
      const panza = el.querySelector('canvas')
      const contor = el.querySelector('[data-contor-dispozitive]')
      const buton = [...el.querySelectorAll('button')].find((b) => (b.textContent ?? '').includes(eticheta))
      if (!panza || !contor || !buton) throw new Error('lipseste panza, contorul sau butonul')
      const L = panza.width
      const H = panza.height
      const cadru = () => new Promise<void>((r) => requestAnimationFrame(() => r()))
      const citeste = () => {
        const c = document.createElement('canvas')
        c.width = L
        c.height = H
        const g = c.getContext('2d')
        if (!g) throw new Error('fara context 2d')
        g.fillStyle = '#fff'
        g.fillRect(0, 0, L, H)
        g.drawImage(panza, 0, 0)
        return g.getImageData(0, 0, L, H).data
      }
      const real = performance.now.bind(performance)
      let fix = real()
      performance.now = () => fix
      try {
        await cadru()
        await cadru()
        const t0 = fix
        if (clic) {
          const inainte = contor.textContent
          buton.click()
          for (let i = 0; i < 120 && contor.textContent === inainte; i++) await cadru()
        }
        await cadru()
        await cadru()
        await cadru()
        const cadre: Uint8ClampedArray[] = []
        for (const m of momente) {
          fix = t0 + m
          await cadru()
          await cadru()
          cadre.push(citeste())
        }
        const dif: number[] = []
        for (let k = 1; k < cadre.length; k++) {
          const a = cadre[k - 1]
          const b = cadre[k]
          let n = 0
          for (let i = 0; i < a.length; i += 4) {
            if ((Math.abs(a[i] - b[i]) + Math.abs(a[i + 1] - b[i + 1]) + Math.abs(a[i + 2] - b[i + 2])) / 3 > 8) n++
          }
          dif.push(n)
        }
        return dif
      } finally {
        Reflect.deleteProperty(performance, 'now')
      }
    },
    { clic, momente: MOMENTE_BIROU, eticheta: BIROU.adauga },
  )
}

test.describe('poarta si lumea pachetelor la 1440 x 900, cu miscare', () => {
  test.use({ viewport: { width: 1440, height: 900 }, reducedMotion: 'no-preference' })

  test('clicul pe cardul de baza: plecarea, apoi lumea; adresa ramane, focusul pe titlul lumii', async ({ page }) => {
    await deschide(page)
    await citesteLatimea(page, 'poarta 1440')
    const adresa = page.url()
    await pornesteJurnalul(page)
    await cardBaza(page).click()
    await expect.poll(() => vedere(page), { timeout: 5000 }).toBe('pachete')
    const jurnal = await citesteJurnalul(page, 'poarta')
    const fel = jurnal.map((j) => j.fel)
    expect(jurnal[0]).toMatchObject({ fel: 'pornire', plecare: null, vedere: 'poarta', lume: false })
    // plecarea a existat, dupa clic, cu lumea inca ascunsa
    const iClic = fel.indexOf('clic')
    const iPlecare = jurnal.findIndex((j) => j.plecare === 'baza')
    expect(iClic).toBeGreaterThan(0)
    expect(iPlecare).toBeGreaterThan(iClic)
    expect(jurnal[iPlecare]).toMatchObject({ vedere: 'poarta', lume: false })
    // si a precedat lumea: lumea apare intr-o schimbare ULTERIOARA, fara marcajul plecarii. Fisa
    // spune .42 s; incarcarea masinii doar lungeste intervalul, deci pragul de 300 ms e sigur.
    const iLume = jurnal.findIndex((j) => j.lume)
    expect(iLume).toBeGreaterThan(iPlecare)
    expect(jurnal[iLume]).toMatchObject({ plecare: null, vedere: 'pachete' })
    expect(jurnal[iLume].t - jurnal[iPlecare].t).toBeGreaterThanOrEqual(300)
    expect(await peEcran(page, '#alegere')).toBe(false)
    expect(await peEcran(page, '#pachete')).toBe(true)
    expect(page.url()).toBe(adresa)
    await expect.poll(() => page.evaluate(() => document.activeElement?.id)).toBe('pachete-titlu')
  })

  test('martor NEGATIV: fara clic, lumea nu e pe ecran si poarta nu pleaca', async ({ page }) => {
    await deschide(page)
    await page.waitForTimeout(700)
    expect(await vedere(page)).toBe('poarta')
    expect(await peEcran(page, '#pachete')).toBe(false)
    expect(await peEcran(page, '#alegere')).toBe(true)
    expect(await page.locator('#alegere').getAttribute('data-plecare')).toBeNull()
  })

  test('"inapoi" aduce poarta pe loc, cu focusul pe cardul de baza', async ({ page }) => {
    await deschide(page)
    await intraInPachete(page)
    await page.getByRole('link', { name: LINIA_DE_BAZA.inapoi }).click()
    expect(await vedere(page)).toBe('poarta')
    expect(await peEcran(page, '#alegere')).toBe(true)
    expect(await peEcran(page, '#pachete')).toBe(false)
    await expect.poll(() => page.evaluate(() => document.activeElement?.getAttribute('href'))).toBe('#pachete')
  })

  test('ancora #pachete la incarcare deschide lumea fara plecare si aduce pachetele sub antet', async ({ page }) => {
    await deschide(page, CALE + '#pachete')
    expect(await vedere(page)).toBe('pachete')
    expect(await page.locator('#alegere').getAttribute('data-plecare')).toBeNull()
    const sus = await page.evaluate(() => document.getElementById('pachete')!.getBoundingClientRect().top)
    console.log('[ancora] #pachete la ' + Math.round(sus) + ' px de sus, scrollY ' + (await page.evaluate(() => window.scrollY)))
    expect(Math.abs(sus)).toBeLessThan(140)
  })

  test('legatura "Pachete" din subsol, pe aceeasi pagina, deschide lumea si sare la pachete', async ({ page }) => {
    await deschide(page)
    const legatura = page.locator('footer a[href="/preturi#pachete"]')
    await expect(legatura).toHaveCount(1)
    await legatura.click()
    await expect.poll(() => vedere(page)).toBe('pachete')
    await expect
      .poll(() => page.evaluate(() => Math.abs(document.getElementById('pachete')!.getBoundingClientRect().top)))
      .toBeLessThan(140)
  })

  test('cardul enterprise urmeaza RUTE: inert fara /enterprise, legatura focusabila cu ea', async ({ page }) => {
    await deschide(page)
    console.log('[enterprise] ruta in RUTE: ' + ENTERPRISE_EXISTA)
    if (!ENTERPRISE_EXISTA) {
      // fara ruta: span inert, fara href, fara focus, fara efect la clic
      const card = page.locator('#alegere [data-tinta-lipsa="/enterprise"]')
      await expect(card).toHaveCount(1)
      expect(await card.evaluate((e) => e.tagName)).toBe('SPAN')
      await expect(page.locator('#alegere a[href="/enterprise"]')).toHaveCount(0)
      expect(await card.evaluate((e) => (e as HTMLElement).tabIndex)).toBe(-1)
      await card.click()
      await page.waitForTimeout(600)
      expect(new URL(page.url()).pathname).toBe(CALE)
      expect(await vedere(page)).toBe('poarta')
      expect(await page.locator('#alegere').getAttribute('data-plecare')).toBeNull()
      return
    }
    // cu ruta: legatura spre /enterprise, focusabila, cu aceeasi clasa de card si aceeasi forma
    const card = page.locator('#alegere a[href="/enterprise"]')
    await expect(card).toHaveCount(1)
    await expect(page.locator('#alegere [data-tinta-lipsa="/enterprise"]')).toHaveCount(0)
    expect(await card.evaluate((e) => /_panouEnterprise_/.test(e.className))).toBe(true)
    await card.focus()
    expect(await card.evaluate((e) => e === document.activeElement)).toBe(true)
    const cutie = await card.boundingBox()
    expect(cutie).not.toBeNull()
    expect(cutie!.width).toBeGreaterThan(200)
    expect(cutie!.height).toBeGreaterThan(100)
  })

  test('calculatorul: teaserul e inlocuit, focusul pe primul cursor, iar formula urmeaza cursoarele', async ({ page }) => {
    await deschide(page)
    await intraInPachete(page)
    await page.getByRole('button', { name: new RegExp(CALCULATOR.teaser.cta) }).click()
    const grup = page.getByRole('group', { name: CALCULATOR.eticheta })
    await expect(grup).toBeVisible()
    await expect(page.getByRole('button', { name: new RegExp(CALCULATOR.teaser.cta) })).toHaveCount(0)
    await expect.poll(() => page.evaluate(() => (document.activeElement as HTMLInputElement | null)?.type)).toBe('range')
    const iesire = grup.locator('[aria-live="polite"]')
    const cursoare = grup.locator('input[type="range"]')
    // Ce aude cititorul de ecran pe fiecare cursor. Runda 2 a criticului: la pornire se anunta
    // "25 minute pe zi" si "50 lei pe oră", iar la capete "50 persoane" si "1 persoane".
    const spuse = () => cursoare.evaluateAll((l) => l.map((c) => c.getAttribute('aria-valuetext')))
    expect(await spuse()).toEqual(['4 persoane', '25 de minute pe zi', '50 de lei pe oră'])
    // valorile de pornire: 4 persoane, 25 min, 50 RON -> 37 h, 1.850 RON; pachetul Start, 0 RON, 0 h
    // (toContainText normalizeaza spatiile, inclusiv pe cel neseparabil dintre suma si moneda)
    await expect(iesire).toContainText('plătiți 1.850 RON lunar pentru cele 37 h')
    await expect(iesire).toContainText('1.850 RON')
    await expect(iesire).toContainText('Se potrivește pachetul Start: 0 RON pe lună')
    // capetele din tastatura: 50 persoane, 120 min -> 2200 h; niciun pachet nu ajunge, deci iesirea
    // trimite la Enterprise (inert fara ruta, legatura cu ea - dupa RUTE), nu recomanda Pro
    await cursoare.nth(0).press('End')
    await cursoare.nth(1).press('End')
    await expect(iesire).toContainText('pentru cele 2200 h în care')
    await expect(iesire).toContainText('110.000 RON')
    await expect(iesire).not.toContainText('Se potrivește')
    await expect(iesire).toContainText('Pentru 50 de persoane, pachetele nu ajung: discutați cu echipa 3S despre 3S Enterprise.')
    if (ENTERPRISE_EXISTA) {
      await expect(iesire.locator('a[href="/enterprise"]')).toHaveCount(1)
      await expect(iesire.locator('[data-tinta-lipsa]')).toHaveCount(0)
    } else {
      await expect(iesire.locator('[data-tinta-lipsa="/enterprise"]')).toHaveCount(1)
      await expect(iesire.locator('a[href="/enterprise"]')).toHaveCount(0)
    }
    await expect.poll(spuse).toEqual(['50 de persoane', '120 de minute pe zi', '50 de lei pe oră'])
    // inapoi sub 20: pachetul revine; la 1, singularul
    await cursoare.nth(0).press('Home')
    await expect(iesire).toContainText('Se potrivește pachetul Start: 0 RON pe lună')
    await expect.poll(spuse).toEqual(['1 persoană', '120 de minute pe zi', '50 de lei pe oră'])
    await cursoare.nth(0).press('End')
    await cursoare.nth(2).press('End')
    expect(await cursoare.nth(2).inputValue()).toBe('210')
    await expect(iesire).toContainText('462.000 RON')
    await expect.poll(spuse).toEqual(['50 de persoane', '120 de minute pe zi', '210 lei pe oră'])
  })

  test('calculatorul: randul de control are 24 px pe toate campurile, iar cursoarele de pe acelasi rand stau la acelasi y', async ({ page }) => {
    // Fisa §6b: randul de control are 24 px (valoarea 24 / 24, unitatea 12 / 12). Runda 2 a criticului
    // a masurat 30 px: unitatea fara `line-height` mostenea 24 px, iar cursorul cu unitate cobora cu 3 px
    // fata de vecinul lui fara unitate.
    await deschide(page)
    await citesteLatimea(page, 'calculator randuri 1440')
    await intraInPachete(page)
    await page.getByRole('button', { name: new RegExp(CALCULATOR.teaser.cta) }).click()
    const grup = page.getByRole('group', { name: CALCULATOR.eticheta })
    await expect(grup).toBeVisible()
    const m = await grup.evaluate((g) =>
      [...g.querySelectorAll('input[type="range"]')].map((c) => {
        const rand = (c.parentElement as HTMLElement).getBoundingClientRect()
        const r = c.getBoundingClientRect()
        return { rand: rand.height, y: r.top + r.height / 2, unitate: c.parentElement?.querySelector('small') !== null }
      }),
    )
    console.log('[calculator randuri] ' + JSON.stringify(m))
    expect(m).toHaveLength(3)
    // martorul: masuratoarea vede si un camp CU unitate (cel care strica randul), nu doar pe cel fara
    expect(m.map((x) => x.unitate)).toEqual([false, true, true])
    for (const x of m) expect(x.rand).toBeCloseTo(24, 0)
    expect(Math.abs(m[0].y - m[1].y)).toBeLessThan(0.5)
  })

  test('codul evenimentelor de analitica: cerut numai cu analitica pornita, nici la incarcare, nici dupa calculator', async ({ page }) => {
    // Marcajele codului de consimtamant, aceleasi ca in comutator.spec.ts, compuse la rulare.
    const MARCAJE = ['data-' + 'consimtamant', '/api/' + 'consimtamant', 'ga-' + 'disable-']
    const analitica = stareAnalitica()
    const scripturi: Promise<{ url: string; text: string }>[] = []
    page.on('response', (r) => {
      if (r.request().resourceType() !== 'script') return
      scripturi.push(
        r
          .text()
          .then((text) => ({ url: r.url(), text }))
          .catch(() => ({ url: r.url(), text: '' })),
      )
    })
    await deschide(page)
    await intraInPachete(page)
    await page.getByRole('button', { name: new RegExp(CALCULATOR.teaser.cta) }).click()
    await page.locator('#pachete input[type="range"]').first().press('End')
    await page.waitForTimeout(800)
    const js = await Promise.all(scripturi)
    const cuMarcaj = js.filter((x) => MARCAJE.some((m) => x.text.includes(m))).map((x) => new URL(x.url).pathname)
    console.log(
      '[analitica ' + (analitica.activa ? 'pornita' : 'oprita, motiv ' + analitica.motiv) + '] scripturi citite: ' +
        js.filter((x) => x.text.length > 0).length + ' | cu codul de consimtamant: ' + (cuMarcaj.join(', ') || '(niciunul)'),
    )
    // Controlul: masuratoarea chiar a citit JavaScript-ul paginii.
    expect(js.filter((x) => x.text.length > 0).length).toBeGreaterThan(3)
    if (analitica.activa) expect(cuMarcaj.length).toBeGreaterThan(0)
    else expect(cuMarcaj).toEqual([])
  })

  test('comutatorul: anual la pornire, lunar la clic; sumele raman 0 si indicatorul se muta', async ({ page }) => {
    await deschide(page)
    await intraInPachete(page)
    const grup = page.getByRole('group', { name: COMUTATOR.eticheta })
    const lunar = grup.getByRole('button', { name: COMUTATOR.lunar })
    const anual = grup.getByRole('button', { name: new RegExp(COMUTATOR.anual) })
    await expect(anual).toHaveAttribute('aria-pressed', 'true')
    const pozitie = () => grup.evaluate((g) => (g.querySelector('[aria-hidden="true"]') as HTMLElement | null)?.style.left ?? null)
    const inainte = await pozitie()
    await lunar.click()
    await expect(lunar).toHaveAttribute('aria-pressed', 'true')
    await expect(anual).toHaveAttribute('aria-pressed', 'false')
    await expect.poll(pozitie).not.toBe(inainte)
    const sume = await page.locator('#pachete p').filter({ hasText: 'RON / lună' }).allInnerTexts()
    expect(sume.map((t) => t.replace(/\s+/g, ' ').trim())).toEqual(['0 RON / lună', '0 RON / lună', '0 RON / lună'])
  })

  test('tooltip-ul "i": clic il deschide, clic in afara il inchide, Escape il inchide si lasa focusul', async ({ page }) => {
    await deschide(page)
    await intraInPachete(page)
    const info = page.locator('#pachete button[aria-label^="Ce înseamnă"]').first()
    await info.scrollIntoViewIfNeeded()
    await info.click()
    await expect(page.getByRole('tooltip')).toHaveCount(1)
    await expect(info).toHaveAttribute('aria-expanded', 'true')
    await page.mouse.click(8, 450)
    await expect(page.getByRole('tooltip')).toHaveCount(0)
    await info.click()
    await expect(page.getByRole('tooltip')).toHaveCount(1)
    await page.keyboard.press('Escape')
    await expect(page.getByRole('tooltip')).toHaveCount(0)
    expect(await info.evaluate((e) => e === document.activeElement)).toBe(true)
  })

  test('pliul biroului: scena se incarca la deschidere, +1 pana la 36, apoi butonul e dezactivat', async ({ page }) => {
    await deschide(page)
    await intraInPachete(page)
    const pliu = page.locator('details').nth(0)
    expect(await pliu.locator('canvas').count()).toBe(0)
    await pliu.locator('summary').click()
    await expect(pliu.locator('canvas')).toHaveCount(1, { timeout: 15000 })
    const contor = pliu.locator('[data-contor-dispozitive]')
    await expect(contor).toHaveText(String(BIROU.initial))
    const adauga = pliu.getByRole('button', { name: BIROU.adauga })
    for (let i = BIROU.initial; i < BIROU.maxim; i++) await adauga.click()
    await expect(contor).toHaveText(String(BIROU.maxim))
    await expect(adauga).toHaveAttribute('aria-disabled', 'true')
    // butonul ramane focalizabil (aria-disabled), deci un clic ajunge la el si nu trebuie sa adauge
    await adauga.dispatchEvent('click')
    await expect(contor).toHaveText(String(BIROU.maxim))
    // banda de conturi: 5 / 10 / 20, independenta de dispozitive
    const segmente = pliu.locator('[role="group"] button')
    await expect(segmente).toHaveCount(3)
    await segmente.nth(1).click()
    await expect(pliu.getByText(BIROU.locuri(10))).toBeVisible()
    await segmente.nth(2).click()
    await expect(pliu.getByText(BIROU.locuri(20))).toBeVisible()
    await expect(segmente.nth(2)).toHaveAttribute('aria-pressed', 'true')
    await expect(contor).toHaveText(String(BIROU.maxim))
  })

  test('biroul: dupa +1 camera se misca si se linisteste pana la 1,2 s; fara clic panza sta pe loc', async ({ page }) => {
    // Fisa §7: in repaus panza e statica; dupa un clic imaginea se misca si se stinge treptat (la
    // referinta raman 16 pixeli schimbati la 1200 ms). Pragul de 100 lasa loc esantioanelor de
    // netezire care comuta sub o deplasare de sutimi de pixel.
    await deschide(page, CALE + '#pachete')
    await citesteLatimea(page, 'birou miscare 1440')
    const pliu = page.locator('details').nth(0)
    await pliu.locator('summary').click()
    await expect(pliu.locator('canvas')).toHaveCount(1, { timeout: 15000 })
    await pliu.locator('canvas').evaluate((c) => c.scrollIntoView({ block: 'center' }))
    await page.waitForTimeout(1500)
    const martor = await profilBirou(pliu, false)
    const dupaClic = await profilBirou(pliu, true)
    console.log(
      '[birou miscare] pixeli schimbati pe ' + MOMENTE_BIROU.slice(1).map((m, i) => MOMENTE_BIROU[i] + '-' + m).join(' / ') +
        ' ms | fara clic: ' + martor.join(' / ') + ' | dupa +1: ' + dupaClic.join(' / '),
    )
    expect(martor).toEqual([0, 0, 0, 0, 0, 0, 0])
    // martorul pozitiv: masuratoarea vede panza (cu o citire goala si randul de mai jos ar iesi 0)
    expect(dupaClic[1]).toBeGreaterThan(1000)
    expect(dupaClic[6]).toBeLessThan(100)
    expect(dupaClic[6]).toBeLessThan(dupaClic[1] / 100)
  })

  test('intrebarile sunt exclusive: a doua deschisa o inchide pe prima', async ({ page }) => {
    await deschide(page)
    await intraInPachete(page)
    const butoane = page.locator('#intrebari-preturi button[aria-expanded]')
    await expect(butoane).toHaveCount(INTREBARI_PRETURI.intrebari.length)
    await butoane.nth(0).click()
    await expect(butoane.nth(0)).toHaveAttribute('aria-expanded', 'true')
    await expect(page.getByText(INTREBARI_PRETURI.intrebari[0].raspuns)).toBeVisible()
    await butoane.nth(1).click()
    await expect(butoane.nth(0)).toHaveAttribute('aria-expanded', 'false')
    await expect(butoane.nth(1)).toHaveAttribute('aria-expanded', 'true')
  })

  test('tiparirea listei: numai foaia ramane in flux, iar PDF-ul are o singura pagina', async ({ page }) => {
    await deschide(page)
    await intraInPachete(page)
    await page.evaluate(() => {
      const w = window as unknown as { __tiparit: number }
      w.__tiparit = 0
      window.print = () => {
        w.__tiparit++
      }
    })
    await page.getByRole('button', { name: LISTA_PDF.buton }).click()
    await expect.poll(() => page.evaluate(() => (window as unknown as { __tiparit: number }).__tiparit)).toBe(1)
    expect(await page.evaluate(() => document.documentElement.classList.contains('tipar-oferta-3s'))).toBe(true)
    await page.emulateMedia({ media: 'print' })
    const m = await page.evaluate(() => {
      const foaie = document.querySelector('[data-foaie-oferta]')
      return {
        foaie: foaie ? getComputedStyle(foaie).display : null,
        parinte: foaie?.parentElement?.tagName ?? null,
        altele: [...document.body.children].filter((c) => c !== foaie && getComputedStyle(c).display !== 'none').map((c) => c.tagName),
      }
    })
    console.log('[tiparire] ' + JSON.stringify(m))
    expect(m.foaie).toBe('block')
    expect(m.parinte).toBe('BODY')
    expect(m.altele).toEqual([])
    const pdf = await page.pdf({ format: 'A4' })
    const pagini = (pdf.toString('latin1').match(/\/Type\s*\/Page(?!s)/g) ?? []).length
    console.log('[tiparire] PDF cu foaia: ' + pagini + ' pagina(i), ' + pdf.length + ' octeti')
    expect(pagini).toBe(1)
    await page.emulateMedia({ media: 'screen' })
    await page.evaluate(() => window.dispatchEvent(new Event('afterprint')))
    expect(await page.evaluate(() => document.documentElement.classList.contains('tipar-oferta-3s'))).toBe(false)
  })

  test('martor POZITIV: fara clasa (Ctrl P), pagina se tipareste ea insasi, pe mai multe pagini', async ({ page }) => {
    await deschide(page)
    await intraInPachete(page)
    await page.emulateMedia({ media: 'print' })
    const altele = await page.evaluate(() =>
      [...document.body.children].filter((c) => !c.hasAttribute('data-foaie-oferta') && getComputedStyle(c).display !== 'none').length,
    )
    const pdf = await page.pdf({ format: 'A4' })
    const pagini = (pdf.toString('latin1').match(/\/Type\s*\/Page(?!s)/g) ?? []).length
    console.log('[tiparire martor] elemente tiparite in afara foii: ' + altele + ', pagini: ' + pagini)
    expect(altele).toBeGreaterThan(0)
    expect(pagini).toBeGreaterThan(1)
  })

  test('axe in starea pachetelor, cu pliurile deschise: zero incalcari serious / critical', async ({ page }) => {
    await deschide(page)
    await intraInPachete(page)
    for (const s of await page.locator('details summary').all()) await s.click()
    await page.getByRole('button', { name: new RegExp(CALCULATOR.teaser.cta) }).click()
    await page.waitForTimeout(600)
    const m = await masoaraAccesibilitatea(page)
    console.log('[axe 1440 pachete] reguli: ' + m.reguliRulate + ' | blocante: ' + m.grave.map((g) => g.regula + ' x' + g.noduri).join(', '))
    expect(m.reguliRulate).toBeGreaterThan(10)
    expect(m.grave.map((g) => g.regula)).toEqual([])
  })
})

test.describe('la 390 x 844', () => {
  test.use({ viewport: { width: 390, height: 844 }, reducedMotion: 'no-preference' })

  test('ambele stari fara derulare laterala; tabelul se deruleaza in panoul lui, nu pagina', async ({ page }) => {
    await deschide(page)
    const w = await citesteLatimea(page, 'preturi 390')
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(w)
    await intraInPachete(page)
    for (const s of await page.locator('details summary').all()) await s.click()
    const panou = page.getByRole('region', { name: /Tabelul pachetelor/ })
    const m = await panou.evaluate((e) => ({ sw: e.scrollWidth, cw: e.clientWidth }))
    console.log('[390] panou tabel: scrollWidth ' + m.sw + ', clientWidth ' + m.cw + ' | pagina scrollWidth ' + (await page.evaluate(() => document.documentElement.scrollWidth)))
    expect(m.sw).toBeGreaterThan(m.cw)
    await panou.evaluate((e) => e.scrollBy(200, 0))
    expect(await panou.evaluate((e) => e.scrollLeft)).toBeGreaterThan(0)
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(w)
    // scena biroului are 240 px la <= 768 (fisa §7)
    await expect(page.locator('details').nth(0).locator('canvas')).toHaveCount(1, { timeout: 15000 })
    const inaltime = await page.locator('details').nth(0).locator('canvas').evaluate((c) => c.getBoundingClientRect().height)
    expect(Math.round(inaltime)).toBe(240)
  })

  test('martor POZITIV: fara blocul continator pe panou, textele pentru cititor din tabel lat pagina', async ({ page }) => {
    await deschide(page)
    const w = await citesteLatimea(page, 'martor derapaj 390')
    await intraInPachete(page)
    await page.locator('details').nth(1).locator('summary').click()
    const panou = page.getByRole('region', { name: /Tabelul pachetelor/ })
    const cu = await page.evaluate(() => document.documentElement.scrollWidth)
    await panou.evaluate((e) => {
      ;(e as HTMLElement).style.position = 'static'
    })
    const fara = await page.evaluate(() => document.documentElement.scrollWidth)
    console.log('[390 martor] scrollWidth cu blocul continator ' + cu + ', fara ' + fara + ' (innerWidth ' + w + ')')
    expect(cu).toBeLessThanOrEqual(w)
    expect(fara).toBeGreaterThan(w)
  })

  test('calculatorul la 390: randul de control are 20 px, iar fraza din dreapta are 5 randuri pe fiecare pachet', async ({ page }) => {
    // Fisa §6b si arborele referintei la 390: valoarea e 20 / 600 / 20, deci randul de control are
    // 20 px (cu randul de 24 mostenit de pe desktop cardul crestea cu 12 px); coloanele iesirii au
    // 144 px, iar fraza din dreapta 5 randuri. Cu valorile de pornire (starea masurata la referinta)
    // randul iesirii are 136 = 8 + 5 x 25,6; cu alte cifre fraza din stanga isi urmeaza lungimea.
    await deschide(page)
    await citesteLatimea(page, 'calculator 390')
    await intraInPachete(page)
    await page.getByRole('button', { name: new RegExp(CALCULATOR.teaser.cta) }).click()
    const grup = page.getByRole('group', { name: CALCULATOR.eticheta })
    await expect(grup).toBeVisible()
    const randuri = await grup.evaluate((g) =>
      [...g.querySelectorAll('input[type="range"]')].map((c) => (c.parentElement as HTMLElement).getBoundingClientRect().height),
    )
    console.log('[calculator 390] randurile de control: ' + JSON.stringify(randuri))
    expect(randuri).toHaveLength(3)
    for (const h of randuri) expect(h).toBeCloseTo(20, 0)
    const iesire = grup.locator('[aria-live="polite"]')
    const masoara = () =>
      iesire.evaluate((e) => {
        const dr = e.querySelectorAll('p')[1] as HTMLElement
        dr.style.alignSelf = 'start'
        const h = dr.getBoundingClientRect().height
        dr.style.alignSelf = ''
        return { dreapta: Math.round(h / 25.6), rand: e.getBoundingClientRect().height }
      })
    const pornire = await masoara()
    console.log('[calculator 390] la pornire: ' + JSON.stringify(pornire))
    expect(pornire.dreapta).toBe(5)
    expect(pornire.rand).toBeCloseTo(136, 0)
    const cursoare = grup.locator('input[type="range"]')
    // persoanele pe 3, 8 si 15 (de la 1, cu sageata): pachetele Start, Plus si Pro
    for (const [persoane, plan] of [[3, 'Start'], [8, 'Plus'], [15, 'Pro']] as const) {
      await cursoare.nth(0).press('Home')
      for (let i = 1; i < persoane; i++) await cursoare.nth(0).press('ArrowRight')
      expect(await cursoare.nth(0).inputValue()).toBe(String(persoane))
      await expect(iesire).toContainText('Se potrivește pachetul ' + plan)
      const r = await masoara()
      console.log('[calculator 390] ' + plan + ': ' + JSON.stringify(r))
      expect(r.dreapta).toBe(5)
    }
  })

  test('axe in starea pachetelor la 390, cu pliurile deschise: zero incalcari serious / critical', async ({ page }) => {
    await deschide(page)
    await intraInPachete(page)
    for (const s of await page.locator('details summary').all()) await s.click()
    await page.waitForTimeout(600)
    const m = await masoaraAccesibilitatea(page)
    console.log('[axe 390 pachete] reguli: ' + m.reguliRulate + ' | blocante: ' + m.grave.map((g) => g.regula + ' x' + g.noduri).join(', '))
    expect(m.grave.map((g) => g.regula)).toEqual([])
  })
})

test.describe('cu miscare redusa', () => {
  test.use({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' })

  test('clicul pe cardul de baza deschide lumea pe loc, fara plecare', async ({ page }) => {
    // Acelasi jurnal ca proba cu miscare: o citire dupa clic ar fi trecut si cu o plecare scurta,
    // cat timp dus-intorsul o depasea; observatorul vede orice marcaj, oricat ar tine.
    await deschide(page)
    await pornesteJurnalul(page)
    await cardBaza(page).click()
    await expect.poll(() => vedere(page), { timeout: 5000 }).toBe('pachete')
    const jurnal = await citesteJurnalul(page, 'miscare redusa')
    expect(jurnal.filter((j) => j.plecare !== null)).toEqual([])
    // prima schimbare dupa clic e chiar lumea pe ecran, fara stare intermediara. Intervalul se scrie
    // in jurnal, nu se cere: il da montarea lumii (30 ms masurat), care creste cu incarcarea masinii.
    const iClic = jurnal.findIndex((j) => j.fel === 'clic')
    expect(iClic).toBeGreaterThan(0)
    expect(jurnal[iClic + 1]).toMatchObject({ fel: 'schimbare', vedere: 'pachete', lume: true })
  })
})

test.describe('fara JavaScript', () => {
  test.use({ viewport: { width: 1440, height: 900 }, javaScriptEnabled: false })

  test('cardul de baza deschide lumea prin ancora, iar "inapoi" aduce poarta', async ({ page }) => {
    await page.goto(CALE, { waitUntil: 'load' })
    expect(await peEcran(page, '#pachete')).toBe(false)
    await page.locator('#alegere a[href="#pachete"]').click()
    await expect.poll(() => peEcran(page, '#pachete')).toBe(true)
    expect(await peEcran(page, '#alegere')).toBe(false)
    await page.locator('a[href="#alegere"]').click()
    await expect.poll(() => peEcran(page, '#alegere')).toBe(true)
    expect(await peEcran(page, '#pachete')).toBe(false)
    // pliurile native merg si ele fara JavaScript
    await page.locator('#alegere a[href="#pachete"]').click()
    const pliu = page.locator('details').nth(1)
    await pliu.locator('summary').click()
    await expect(pliu).toHaveAttribute('open', '')
    await expect(pliu.locator('table')).toBeVisible()
  })

  test('martor NEGATIV: fara ancora in adresa, lumea ramane ascunsa si textul ei ramane in pagina', async ({ page }) => {
    await page.goto(CALE, { waitUntil: 'load' })
    expect(await peEcran(page, '#pachete')).toBe(false)
    expect(await page.locator('#pachete').count()).toBe(1)
    expect(await page.locator('#alegere').innerText()).toContain(POARTA_BAZA.titlu)
  })
})
