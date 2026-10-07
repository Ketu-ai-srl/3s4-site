import { writeFileSync } from 'node:fs'
import { join } from 'node:path'
import type { Page, TestInfo } from '@playwright/test'
import { expect, test } from './ajutor/baza'
import { mediuProfil3sMd, pornesteCopia3sMd, type Copie3sMd } from './ajutor/copie-3s-md'
import { RADACINA } from './ajutor/proiect'

/**
 * Piesele globale (felia 142), masurate pe cele doua copii ale site-ului: 3s.md (engleza la radacina, romana sub /ro)
 * si 3s.com.ro (romana la radacina, engleza sub /en). Defectele masurate in browserul real:
 *  - TIPARIREA unei pagini obisnuite (Ctrl P / Salvare ca PDF) lua asezarea de telefon, iar pastila antetului si bara
 *    de canale de jos se repetau pe fiecare foaie A4, peste continut;
 *  - SELECTORUL DE LIMBA din subsol, pe telefon si pe tableta: butonul sta in stanga, panoul se deschidea aliniat la
 *    dreapta lui si iesea din ecran spre stanga (optiunile nu se puteau atinge);
 *  - SUBSOLUL la 1440 si 2304: numarul de WhatsApp se rupea in doua ("+40 743" / "130 567"), iar "Politica de
 *    cookie-uri" se rupea dupa cratima din cuvant;
 *  - lipsea meta-ul `format-detection` (pe iOS numarul afisat ca text devenea legatura de apel GSM);
 *  - TITLURILE principale lasau un singur cuvant pe ultimul rand (H1-ul startului la 1440 si la 390).
 *
 * CE SE CERE (masurat in pagina, cu `innerWidth` citit din pagina):
 *  1. in modul print, la latimea tiparibila a unei foi A4 (718 px) si la 1440: niciun element `position: fixed`
 *     vizibil; primul paragraf al continutului, adus la marginea de sus a ferestrei, nu e acoperit (hit-test), iar
 *     marginea de jos a ferestrei nu cade intr-o piesa fixa; paragraful sta in latimea paginii; legaturile din paragrafe
 *     au contrast de cel putin 4,5:1 pe alb. Paginile: informatiile legale (EN) si termenii (RO), pe ambele copii; se
 *     scrie si PDF-ul A4 al fiecareia, ca artefact de privit. Pe START (EN si RO, ambele copii), derulat pana la
 *     constructor (tema lui inchisa activa), la 718 si 1440: niciun element `position: fixed` vizibil (stratul temei
 *     era fix si, tiparit cu grafica de fundal, acoperea fiecare foaie), stratul ramane in cutia sectiunii lui, iar
 *     PDF-ul cu grafica de fundal se scrie ca artefact;
 *  2. selectorul din subsol deschis la 360, 390, 768 si 1440, pe EN si RO, pe ambele copii: panoul intreg in
 *     [0, innerWidth] si fiecare optiune apasabila (hit-test in centrul ei intoarce chiar legatura);
 *  3. subsolul la 1025, 1199, 1200, 1440 si 2304: nicio legatura din coloane nu se rupe dupa o cratima din interiorul
 *     unui cuvant (rand masurat pe dreptunghiul fiecarui caracter) si nimic nu iese din coloana lui; de la 1200
 *     (containerul la latimea maxima, unde coloana de canale ia latimea continutului) numarul de WhatsApp sta pe un
 *     singur rand, la fel fiecare legatura scurta (cel mult trei cuvinte, de pilda "Politica de cookie-uri"), iar grila
 *     nu iese din container si pagina nu se deruleaza lateral. Sub 1200 randul numarului se masoara si se scrie in
 *     jurnal;
 *  4. HTML-ul servit al starturilor (EN si RO, ambele copii) are `<meta name="format-detection" content="telephone=no">`;
 *  5. pe starturi (EN si RO), la 1440, 718 si 390: niciun titlu principal (H1-ul eroului si titlurile de sectiune,
 *     clasele `t-h1-erou` si `t-h2-sectiune`) nu are pe ultimul lui rand un singur cuvant, cand
 *     ultimul segment (de la ultimul `<br>` la capat) are cel putin trei cuvinte. LIMITA DECLARATA: un segment inchis
 *     de un `<br>` (prima propozitie a H1-ului eroului) nu e atins de nicio regula `text-wrap` - navigatorul nu
 *     echilibreaza un bloc cu rupere fortata -, deci acolo cuvantul singur se masoara si se scrie in jurnal, dar
 *     nici marcajul nu-l repara: masurat cu propozitia pusa in blocul ei, `pretty` lasa cuvantul singur pe loc, iar
 *     `balance` il muta pe primul rand (RO, trei cuvinte: orice impartire in doua randuri lasa unul singur) sau nu
 *     schimba nimic (EN). Se repara numai din text sau din latimea titlului;
 *
 * MARTORII:
 *  - POZITIV, tiparirea: aceeasi masuratoare, dupa ce regulile de tiparire ale feliei se scot din foaia de stil a
 *    paginii, vede piesele fixe si paragraful acoperit (deci verdictul de la 1 nu e o masuratoare oarba); pe start,
 *    derulat pana la constructor, vede stratul fix al temei inchise;
 *  - POZITIV, selectorul: cu asezarea veche repusa pe panou (aliniat la dreapta, fara plafon), panoul iese din ecran;
 *  - POZITIV, subsolul: cu grila veche repusa si bucatile nerupte lasate sa se rupa, numarul, cuvantul si o legatura
 *    scurta se rup; cu coloane de legaturi mai late decat containerul, masuratoarea vede grila iesita;
 *  - POZITIV, titlurile: cu `text-wrap: wrap` pus inapoi pe H1-ul startului la 1440, cuvantul singur reapare;
 *  - NEGATIV, foaia de tipar a listei de preturi: cu si fara regulile feliei, foaia e singura pe hartie si are exact
 *    aceeasi asezare (dreptunghiul fiecarui element), deci regulile noi nu o ating;
 *  - NEGATIV, selectorul din antet la 1440 ramane aliniat la dreapta butonului lui (regula subsolului nu se scurge);
 *  - NEGATIV, titlurile: regulile noi (`balance` pe titlurile de sectiune, `pretty` pe erou) nu schimba numarul de
 *    randuri al niciunui titlu masurat.
 */

let md: Copie3sMd
let comro: Copie3sMd

test.beforeAll(async () => {
  test.setTimeout(1_500_000)
  // Una dupa alta, nu in paralel: doua build-uri deodata dubleaza memoria ceruta statiei.
  md = await pornesteCopia3sMd()
  comro = await pornesteCopia3sMd(mediuProfil3sMd(join(RADACINA, 'config', 'profil-3s-com-ro.json')))
})

test.afterAll(async () => {
  await md?.opreste()
  await comro?.opreste()
})

/** Latimea tiparibila a unei foi A4 cu marginile implicite ale navigatorului (794 - 2 x 38 px). */
const LATIME_A4 = 718

type Copie = () => Copie3sMd
const COPII: { nume: string; copie: Copie; juridicEn: string; juridicRo: string; preturiEn: string; preturiRo: string; startEn: string; startRo: string }[] = [
  {
    nume: '3s.md',
    copie: () => md,
    juridicEn: '/legal/legal-information',
    juridicRo: '/ro/juridic/termeni',
    preturiEn: '/pricing',
    preturiRo: '/ro/preturi',
    startEn: '/',
    startRo: '/ro',
  },
  {
    nume: '3s.com.ro',
    copie: () => comro,
    juridicEn: '/en/legal/legal-information',
    juridicRo: '/juridic/termeni',
    preturiEn: '/en/pricing',
    preturiRo: '/preturi',
    startEn: '/en',
    startRo: '/',
  },
]

async function deschide(page: Page, adresa: string, latime: number, inaltime = 900): Promise<void> {
  await page.setViewportSize({ width: latime, height: inaltime })
  const r = await page.goto(adresa, { waitUntil: 'load' })
  expect(r?.status(), adresa).toBe(200)
  await page.evaluate(() => document.fonts.ready.then(() => undefined))
}

async function capteaza(page: Page, info: TestInfo, nume: string, tinta?: string): Promise<void> {
  const cale = info.outputPath(nume + '.png')
  if (tinta) await page.locator(tinta).first().screenshot({ path: cale })
  else await page.screenshot({ path: cale })
  await info.attach(nume, { path: cale, contentType: 'image/png' })
}

// ------------------------------------------------------------------------------------------------ tiparirea

type MasuraTipar = {
  latime: number
  fixe: string[]
  paragraf: string
  acoperitSus: string | null
  acoperitJos: string | null
  stanga: number
  dreapta: number
  latimeParagraf: number
  legaturiSlabe: string[]
}

/** Masuratoarea de tipar, in pagina deja trecuta in modul print. */
async function masoaraTipar(page: Page): Promise<MasuraTipar> {
  return page.evaluate(async () => {
    const vizibil = (e: Element) => {
      const r = e.getBoundingClientRect()
      if (r.width < 1 || r.height < 1) return false
      for (let x: Element | null = e; x; x = x.parentElement) {
        const st = getComputedStyle(x)
        if (st.display === 'none' || st.visibility === 'hidden' || Number(st.opacity) < 0.02) return false
      }
      return true
    }
    const descrie = (e: Element) => {
      const atr = [...e.attributes].filter((a) => a.name.startsWith('data-') || a.name === 'role').map((a) => a.name)
      return e.tagName.toLowerCase() + (atr.length ? '[' + atr.join(',') + ']' : '') + '.' + String(e.className).split(' ')[0]
    }
    const fixe = [...document.querySelectorAll('body *')].filter((e) => getComputedStyle(e).position === 'fixed' && vizibil(e)).map(descrie)

    const zona = document.getElementById('zona-continut') as HTMLElement
    const p = [...zona.querySelectorAll('main p')].find((x) => (x.textContent ?? '').trim().length > 40 && vizibil(x)) as HTMLElement
    if (!p) throw new Error('niciun paragraf de continut vizibil')
    const cine = (y: number) => {
      const r = p.getBoundingClientRect()
      const el = document.elementFromPoint(r.left + r.width / 2, y)
      return el && (el === p || p.contains(el)) ? null : el ? descrie(el) : 'nimic'
    }
    // Sus: paragraful adus la marginea de sus a ferestrei; hit-test in centrul primului lui rand.
    window.scrollTo({ top: Math.max(0, window.scrollY + p.getBoundingClientRect().top - 4), behavior: 'instant' as ScrollBehavior })
    await new Promise((g) => requestAnimationFrame(() => requestAnimationFrame(g)))
    const rs = p.getBoundingClientRect()
    const acoperitSus = cine(rs.top + Math.min(8, rs.height / 2))
    // Jos: primul paragraf sta de obicei prea sus ca sa poata fi adus la marginea de jos, deci se masoara marginea
    // insasi, cu pagina derulata la o treime: punctul de la 10 px deasupra ei nu are voie sa cada intr-o piesa fixa.
    window.scrollTo({ top: Math.round(document.documentElement.scrollHeight / 3), behavior: 'instant' as ScrollBehavior })
    await new Promise((g) => requestAnimationFrame(() => requestAnimationFrame(g)))
    let acoperitJos: string | null = null
    for (let x: Element | null = document.elementFromPoint(window.innerWidth / 2, window.innerHeight - 10); x; x = x.parentElement) {
      if (getComputedStyle(x).position === 'fixed') {
        acoperitJos = descrie(x)
        break
      }
    }
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })

    const lum = (c: string) => {
      const m = c.match(/[\d.]+/g)
      if (!m) return 1
      const [r, g, b] = m.slice(0, 3).map((v) => {
        const s = Number(v) / 255
        return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
      })
      return 0.2126 * r + 0.7152 * g + 0.0722 * b
    }
    const legaturiSlabe = [...zona.querySelectorAll('main p a')]
      .filter(vizibil)
      .filter((a) => {
        const st = getComputedStyle(a)
        const alfa = st.color.startsWith('rgba') ? Number(st.color.split(',')[3]) : 1
        return alfa < 0.99 || 1.05 / (lum(st.color) + 0.05) < 4.5
      })
      .map((a) => (a.textContent ?? '').trim().slice(0, 40))

    const rp = p.getBoundingClientRect()
    return {
      latime: window.innerWidth,
      fixe,
      paragraf: (p.textContent ?? '').trim().slice(0, 60),
      acoperitSus,
      acoperitJos,
      stanga: rp.left,
      dreapta: rp.right,
      latimeParagraf: rp.width,
      legaturiSlabe,
    }
  })
}

/** Scoate din foile de stil ale paginii regulile de tiparire ale feliei (le recunoaste dupa bara de canale). */
async function scoateReguliTipar(page: Page): Promise<number> {
  return page.evaluate(() => {
    let scoase = 0
    for (const foaie of [...document.styleSheets]) {
      let reguli: CSSRuleList
      try {
        reguli = foaie.cssRules
      } catch {
        continue
      }
      for (let i = reguli.length - 1; i >= 0; i--) {
        const r = reguli[i]
        if (r instanceof CSSMediaRule && r.conditionText.includes('print') && r.cssText.includes('data-bara-mobil')) {
          foaie.deleteRule(i)
          scoase++
        }
      }
    }
    return scoase
  })
}

/** Startul, derulat pana la constructor, cu tema lui inchisa activa (asa cum il are vizitatorul care a ajuns acolo). */
async function deschideLaConstructor(page: Page, adresa: string, latime: number): Promise<void> {
  await deschide(page, adresa, latime)
  const sectiune = page.locator('section[data-ciot="constructor"]')
  await sectiune.evaluate((e) => e.scrollIntoView({ block: 'start', behavior: 'instant' as ScrollBehavior }))
  await expect(sectiune).toHaveAttribute('data-tema', 'inchisa')
}

type MasuraStrat = { tema: string | null; fixe: string[]; strat: { sus: number; jos: number }; sectiune: { sus: number; jos: number } }

/** Elementele fixe vizibile si cutia stratului temei fata de cutia sectiunii constructorului, in modul curent. */
async function masoaraStrat(page: Page): Promise<MasuraStrat> {
  return page.evaluate(() => {
    const vizibil = (e: Element) => {
      const r = e.getBoundingClientRect()
      if (r.width < 1 || r.height < 1) return false
      for (let x: Element | null = e; x; x = x.parentElement) {
        const st = getComputedStyle(x)
        if (st.display === 'none' || st.visibility === 'hidden' || Number(st.opacity) < 0.02) return false
      }
      return true
    }
    const descrie = (e: Element) => {
      const atr = [...e.attributes].filter((a) => a.name.startsWith('data-') || a.name.startsWith('aria-') || a.name === 'role').map((a) => a.name)
      return e.tagName.toLowerCase() + (atr.length ? '[' + atr.join(',') + ']' : '') + '.' + String(e.className).split(' ')[0]
    }
    const sectiune = document.querySelector('section[data-ciot="constructor"]') as HTMLElement
    const strat = sectiune.querySelector(':scope > [aria-hidden="true"]') as HTMLElement
    const rs = sectiune.getBoundingClientRect()
    const rt = strat.getBoundingClientRect()
    return {
      tema: sectiune.getAttribute('data-tema'),
      fixe: [...document.querySelectorAll('body *')].filter((e) => getComputedStyle(e).position === 'fixed' && vizibil(e)).map(descrie),
      strat: { sus: rt.top, jos: rt.bottom },
      sectiune: { sus: rs.top, jos: rs.bottom },
    }
  })
}

test.describe('tiparirea unei pagini obisnuite', () => {
  for (const c of COPII) {
    for (const [limba, cale] of [
      ['EN', (x: (typeof COPII)[number]) => x.juridicEn],
      ['RO', (x: (typeof COPII)[number]) => x.juridicRo],
    ] as const) {
      test(c.nume + ' ' + limba + ': in modul print nicio piesa fixa, paragraful neacoperit, in latimea paginii, si PDF-ul A4', async ({ page }, info) => {
        test.setTimeout(120_000)
        const adresa = c.copie().baza + cale(c)
        for (const latime of [LATIME_A4, 1440]) {
          await deschide(page, adresa, latime)
          await page.emulateMedia({ media: 'print' })
          const m = await masoaraTipar(page)
          console.log('[tipar] ' + c.nume + ' ' + cale(c) + ' ' + JSON.stringify(m))
          expect(m.latime).toBe(latime)
          expect(m.fixe, 'piese fixe vizibile la tiparire').toEqual([])
          expect(m.acoperitSus, 'paragraful acoperit sus').toBeNull()
          expect(m.acoperitJos, 'paragraful acoperit jos').toBeNull()
          expect(m.stanga).toBeGreaterThanOrEqual(0)
          expect(m.dreapta).toBeLessThanOrEqual(m.latime)
          expect(m.latimeParagraf).toBeGreaterThan(m.latime * 0.5)
          expect(m.legaturiSlabe, 'legaturi greu de citit la tiparire').toEqual([])
          await page.emulateMedia({ media: 'screen' })
        }
        // `page.pdf` tipareste cu media emulata: dupa `screen` de mai sus ar iesi PDF-ul ecranului, nu al tiparirii.
        await page.emulateMedia({ media: 'print' })
        const pdf = await page.pdf({ format: 'A4', printBackground: true })
        expect(pdf.length).toBeGreaterThan(1000)
        const nume = 'tipar-' + c.nume + '-' + limba + '.pdf'
        await info.attach(nume, { body: pdf, contentType: 'application/pdf' })
        writeFileSync(info.outputPath(nume), pdf)
      })
    }
  }

  for (const c of COPII) {
    for (const [limba, cale] of [
      ['EN', c.startEn],
      ['RO', c.startRo],
    ] as const) {
      test(c.nume + ' ' + limba + ': startul derulat pana la constructor, in modul print, fara nicio piesa fixa, si PDF-ul cu grafica de fundal', async ({ page }, info) => {
        test.setTimeout(120_000)
        for (const latime of [LATIME_A4, 1440]) {
          await deschideLaConstructor(page, c.copie().baza + cale, latime)
          await page.emulateMedia({ media: 'print' })
          const m = await masoaraStrat(page)
          console.log('[tipar start] ' + c.nume + ' ' + cale + ' ' + latime + ' ' + JSON.stringify(m))
          expect(m.tema).toBe('inchisa')
          expect(m.fixe, 'piese fixe vizibile la tiparirea startului').toEqual([])
          expect(m.strat.sus).toBeGreaterThanOrEqual(m.sectiune.sus - 0.5)
          expect(m.strat.jos).toBeLessThanOrEqual(m.sectiune.jos + 0.5)
          await page.emulateMedia({ media: 'screen' })
        }
        await page.emulateMedia({ media: 'print' })
        const pdf = await page.pdf({ format: 'A4', printBackground: true })
        expect(pdf.length).toBeGreaterThan(1000)
        const nume = 'tipar-start-' + c.nume + '-' + limba + '.pdf'
        await info.attach(nume, { body: pdf, contentType: 'application/pdf' })
        writeFileSync(info.outputPath(nume), pdf)
      })
    }
  }

  test('martor POZITIV: startul derulat pana la constructor, fara regulile de tiparire ale feliei, are stratul fix al temei', async ({ page }) => {
    test.setTimeout(60_000)
    await deschideLaConstructor(page, comro.baza + '/', LATIME_A4)
    expect(await scoateReguliTipar(page)).toBeGreaterThan(0)
    await page.emulateMedia({ media: 'print' })
    const m = await masoaraStrat(page)
    console.log('[tipar start martor+] ' + JSON.stringify(m))
    expect(m.tema).toBe('inchisa')
    expect(m.fixe.some((f) => f.startsWith('div[aria-hidden]'))).toBe(true)
  })

  test('martor POZITIV: fara regulile de tiparire ale feliei, masuratoarea vede piesele fixe si paragraful acoperit', async ({ page }) => {
    test.setTimeout(120_000)
    await deschide(page, comro.baza + COPII[1].juridicEn, LATIME_A4)
    expect(await scoateReguliTipar(page), 'regulile de tiparire ale feliei lipsesc din foaia de stil').toBeGreaterThan(0)
    await page.emulateMedia({ media: 'print' })
    const m = await masoaraTipar(page)
    console.log('[tipar martor+] ' + JSON.stringify(m))
    expect(m.fixe.length).toBeGreaterThan(0)
    expect(m.fixe.some((f) => f.startsWith('header[data-antet'))).toBe(true)
    expect(m.fixe.some((f) => f.includes('data-bara-mobil'))).toBe(true)
    expect(m.acoperitSus).not.toBeNull()
    expect(m.acoperitJos).not.toBeNull()
  })

  test('martor NEGATIV: foaia de tipar a listei de preturi e singura pe hartie, cu aceeasi asezare cu si fara regulile feliei', async ({ page }) => {
    test.setTimeout(120_000)
    for (const c of COPII) {
      for (const cale of [c.preturiEn, c.preturiRo]) {
        await deschide(page, c.copie().baza + cale, 1440)
        await page.locator('[data-foaie-oferta]').waitFor({ state: 'attached' })
        await page.evaluate(() => document.documentElement.classList.add('tipar-oferta-3s'))
        await page.emulateMedia({ media: 'print' })
        const fotografie = () =>
          page.evaluate(() => {
            const foaie = document.querySelector('[data-foaie-oferta]') as HTMLElement
            const inAfara = [...document.body.children].filter((e) => e !== foaie && e.getBoundingClientRect().height > 0 && getComputedStyle(e).display !== 'none').map((e) => e.tagName)
            const elemente = [foaie, ...foaie.querySelectorAll('*')].map((e) => {
              const r = e.getBoundingClientRect()
              const st = getComputedStyle(e)
              return [e.tagName, Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height), st.fontSize, st.color].join(' ')
            })
            return { inAfara, elemente, text: (foaie.innerText ?? '').length }
          })
        const cu = await fotografie()
        expect(await scoateReguliTipar(page)).toBeGreaterThan(0)
        const fara = await fotografie()
        console.log('[foaie] ' + c.nume + ' ' + cale + ' elemente ' + cu.elemente.length + ' text ' + cu.text)
        expect(cu.inAfara).toEqual([])
        expect(cu.text).toBeGreaterThan(100)
        expect(cu.elemente).toEqual(fara.elemente)
        await page.emulateMedia({ media: 'screen' })
      }
    }
  })
})

// ------------------------------------------------------------------------------------------------ selectorul

type MasuraSelector = { latime: number; stanga: number; dreapta: number; sus: number; optiuni: { text: string; apasabila: boolean; x: number }[] }

async function deschideSelectorul(page: Page, zona: string): Promise<void> {
  const buton = page.locator(zona + ' [data-selector-limba] > button').first()
  await buton.evaluate((e) => e.scrollIntoView({ block: 'center', behavior: 'instant' as ScrollBehavior }))
  await buton.click()
  await expect(buton).toHaveAttribute('aria-expanded', 'true')
}

async function masoaraSelector(page: Page, zona: string): Promise<MasuraSelector> {
  return page.evaluate((z) => {
    const buton = document.querySelector(z + ' [data-selector-limba] > button') as HTMLElement
    const panou = document.getElementById(buton.getAttribute('aria-controls') ?? '') as HTMLElement
    const r = panou.getBoundingClientRect()
    const optiuni = [...panou.querySelectorAll('a')].map((a) => {
      const ro = a.getBoundingClientRect()
      const x = ro.left + ro.width / 2
      const y = ro.top + ro.height / 2
      const lovit = x >= 0 && x < window.innerWidth ? document.elementFromPoint(x, y) : null
      return { text: (a.textContent ?? '').trim(), apasabila: !!lovit && (lovit === a || a.contains(lovit)), x: Math.round(x) }
    })
    return { latime: window.innerWidth, stanga: r.left, dreapta: r.right, sus: r.top, optiuni }
  }, zona)
}

test.describe('selectorul de limba din subsol', () => {
  for (const c of COPII) {
    for (const [limba, cale] of [
      ['EN', (x: (typeof COPII)[number]) => x.preturiEn],
      ['RO', (x: (typeof COPII)[number]) => x.preturiRo],
    ] as const) {
      test(c.nume + ' ' + limba + ': panoul deschis intreg in fereastra, cu toate optiunile apasabile, la 360, 390, 768 si 1440', async ({ page }, info) => {
        test.setTimeout(120_000)
        for (const latime of [360, 390, 768, 1440]) {
          await deschide(page, c.copie().baza + cale(c), latime, 800)
          await deschideSelectorul(page, 'footer')
          const m = await masoaraSelector(page, 'footer')
          console.log('[selector] ' + c.nume + ' ' + cale(c) + ' ' + JSON.stringify(m))
          expect(m.latime).toBe(latime)
          expect(m.stanga).toBeGreaterThanOrEqual(0)
          expect(m.dreapta).toBeLessThanOrEqual(m.latime)
          expect(m.sus).toBeGreaterThanOrEqual(0)
          expect(m.optiuni.length).toBeGreaterThanOrEqual(2)
          expect(m.optiuni.filter((o) => !o.apasabila)).toEqual([])
          if (c.nume === '3s.com.ro' && limba === 'RO' && (latime === 390 || latime === 768)) {
            await capteaza(page, info, 'selector-' + latime)
          }
        }
      })
    }
  }

  test('martor POZITIV: cu asezarea veche repusa pe panou, la 390 panoul iese din ecran si optiunile nu se pot atinge', async ({ page }) => {
    test.setTimeout(120_000)
    await deschide(page, comro.baza + '/preturi', 390, 800)
    await deschideSelectorul(page, 'footer')
    await page.evaluate(() => {
      const buton = document.querySelector('footer [data-selector-limba] > button') as HTMLElement
      const panou = document.getElementById(buton.getAttribute('aria-controls') ?? '') as HTMLElement
      panou.style.left = 'auto'
      panou.style.right = '0'
      panou.style.maxWidth = 'none'
    })
    const m = await masoaraSelector(page, 'footer')
    console.log('[selector martor+] ' + JSON.stringify(m))
    expect(m.stanga).toBeLessThan(0)
    expect(m.optiuni.some((o) => !o.apasabila)).toBe(true)
  })

  test('martor NEGATIV: selectorul din antet la 1440 ramane aliniat la dreapta butonului lui', async ({ page }) => {
    test.setTimeout(60_000)
    await deschide(page, comro.baza + '/preturi', 1440, 800)
    const buton = page.locator('header [data-selector-limba] > button').first()
    expect(await buton.count(), 'antetul nu are selector de limba la 1440').toBeGreaterThan(0)
    await buton.click()
    const r = await page.evaluate(() => {
      const b = document.querySelector('header [data-selector-limba] > button') as HTMLElement
      const panou = document.getElementById(b.getAttribute('aria-controls') ?? '') as HTMLElement
      const zona = b.parentElement as HTMLElement
      return { zona: zona.getBoundingClientRect().right, panou: panou.getBoundingClientRect().right }
    })
    expect(Math.abs(r.zona - r.panou)).toBeLessThan(1)
  })
})

// ------------------------------------------------------------------------------------------------ subsolul

type MasuraSubsol = { latime: number; randuriNumar: number; numar: string; rupteLaCratima: string[]; peDouaRanduri: string[]; iesite: string[]; depasire: number }

async function masoaraSubsol(page: Page): Promise<MasuraSubsol> {
  return page.evaluate(() => {
    const randuri = (nod: Text, de: number, pana: number) => {
      const tops = new Set<number>()
      for (let i = de; i < pana; i++) {
        if (/\s/.test(nod.data[i])) continue
        const r = document.createRange()
        r.setStart(nod, i)
        r.setEnd(nod, i + 1)
        const d = r.getClientRects()[0]
        if (d) tops.add(Math.round(d.top))
      }
      return tops
    }
    const texte = (e: Element) => {
      const w = document.createTreeWalker(e, NodeFilter.SHOW_TEXT)
      const t: Text[] = []
      for (let n = w.nextNode(); n; n = w.nextNode()) t.push(n as Text)
      return t
    }
    // Numarul: de la primul "+" (sau de la prima cifra) pana la capat, peste toate nodurile de text ale randului.
    const span = document.querySelector('footer [data-numar-whatsapp]')
    let randuriNumar = 0
    let numar = ''
    if (span) {
      const tops = new Set<number>()
      let inceput = false
      for (const n of texte(span)) {
        let de = 0
        if (!inceput) {
          const k = n.data.search(/\+|\d/)
          if (k < 0) continue
          inceput = true
          de = k
        }
        numar += n.data.slice(de)
        for (const t of randuri(n, de, n.data.length)) tops.add(t)
      }
      randuriNumar = tops.size
    }
    // Cratima din interiorul unui cuvant: litera, "-", litera pe acelasi rand.
    const rupteLaCratima: string[] = []
    for (const a of document.querySelectorAll('footer nav a')) {
      for (const n of texte(a)) {
        for (const m of n.data.matchAll(/\p{L}-\p{L}/gu)) {
          const i = (m.index ?? 0) + 1
          const t = [...randuri(n, i, i + 2)]
          if (t.length > 1) rupteLaCratima.push((a.textContent ?? '').trim())
        }
      }
    }
    // Legaturile scurte din coloane (cel mult trei cuvinte) care se intind pe mai multe randuri (top-ul fiecarui caracter).
    const peDouaRanduri: string[] = []
    for (const a of document.querySelectorAll('footer nav li > a')) {
      if ((a.textContent ?? '').trim().split(/\s+/).length > 3) continue
      const tops = new Set<number>()
      for (const n of texte(a)) for (const t of randuri(n, 0, n.data.length)) tops.add(t)
      if (tops.size > 1) peDouaRanduri.push((a.textContent ?? '').trim())
    }
    // Nimic din coloane nu iese din coloana lui (un cuvant mai lat decat coloana nu se rupe, iese).
    const iesite: string[] = []
    for (const nav of document.querySelectorAll('footer nav')) {
      const dreapta = nav.getBoundingClientRect().right
      for (const e of nav.querySelectorAll('li > *')) {
        if ([...e.getClientRects()].some((r) => r.right > dreapta + 0.5)) iesite.push((e.textContent ?? '').trim())
      }
    }
    // Grila subsolului (coloanele cel putin cat legatura lor) nu iese din container, iar pagina nu se deruleaza lateral.
    const grila = (document.querySelector('footer [data-subsol-contact]') as HTMLElement | null)?.parentElement
    const containerDreapta = grila?.getBoundingClientRect().right ?? window.innerWidth
    const coloaneDreapta = grila ? Math.max(...[...grila.children].map((e) => e.getBoundingClientRect().right)) : 0
    const depasire = Math.max(coloaneDreapta - containerDreapta, document.documentElement.scrollWidth - window.innerWidth, 0)
    return { latime: window.innerWidth, randuriNumar, numar: numar.trim(), rupteLaCratima, peDouaRanduri, iesite, depasire }
  })
}

test.describe('subsolul pe desktop', () => {
  for (const c of COPII) {
    test(c.nume + ': numarul de WhatsApp pe un rand si nicio legatura rupta dupa cratima sau iesita din coloana, pe EN si RO', async ({ page }, info) => {
      test.setTimeout(180_000)
      for (const cale of [c.preturiEn, c.preturiRo]) {
        for (const latime of [1025, 1199, 1200, 1440, 2304]) {
          await deschide(page, c.copie().baza + cale, latime)
          const m = await masoaraSubsol(page)
          console.log('[subsol] ' + c.nume + ' ' + cale + ' ' + JSON.stringify(m))
          expect(m.latime).toBe(latime)
          expect(m.numar, 'numarul de WhatsApp lipseste din subsol').toMatch(/\d{3}/)
          expect(m.rupteLaCratima).toEqual([])
          expect(m.iesite, 'text iesit din coloana subsolului').toEqual([])
          expect(m.depasire, 'grila subsolului iese din container').toBeLessThanOrEqual(0.5)
          // Numarul pe un rand de la 1200 (containerul la latimea maxima); sub 1200 se masoara si se scrie in jurnal.
          if (latime >= 1200) expect(m.randuriNumar).toBe(1)
          if (latime >= 1200) expect(m.peDouaRanduri, 'legaturi scurte din subsol pe doua randuri').toEqual([])
          if (c.nume === '3s.com.ro' && cale === c.preturiRo && latime === 1440) {
            await capteaza(page, info, 'subsol-1440', 'footer')
          }
        }
      }
    })
  }

  test('martor POZITIV: cu asezarea veche repusa (grila de coloane egale, fara bucati nerupte), la 1440 numarul, cuvantul cu cratima si o legatura se rup', async ({ page }) => {
    test.setTimeout(60_000)
    await deschide(page, comro.baza + '/preturi', 1440)
    const lasate = await page.evaluate(() => {
      const grila = (document.querySelector('footer [data-subsol-contact]') as HTMLElement).parentElement as HTMLElement
      grila.style.gridTemplateColumns = '1.8fr repeat(var(--coloane-subsol), 1fr)'
      const bucati = [...document.querySelectorAll<HTMLElement>('footer span')].filter((e) => getComputedStyle(e).whiteSpace === 'nowrap')
      for (const b of bucati) b.style.whiteSpace = 'normal'
      for (const a of document.querySelectorAll<HTMLElement>('footer nav li > a')) a.style.whiteSpace = 'normal'
      return bucati.length
    })
    expect(lasate).toBeGreaterThan(1)
    const m = await masoaraSubsol(page)
    console.log('[subsol martor+] ' + JSON.stringify(m))
    expect(m.randuriNumar).toBeGreaterThan(1)
    expect(m.rupteLaCratima.length).toBeGreaterThan(0)
    expect(m.peDouaRanduri.length).toBeGreaterThan(0)
  })

  test('martor POZITIV: cu coloane de legaturi mai late decat containerul, la 1200 masuratoarea vede grila iesita', async ({ page }) => {
    test.setTimeout(60_000)
    await deschide(page, comro.baza + '/preturi', 1200)
    await page.evaluate(() => {
      const grila = (document.querySelector('footer [data-subsol-contact]') as HTMLElement).parentElement as HTMLElement
      grila.style.gridTemplateColumns = '1.8fr repeat(var(--coloane-legaturi), minmax(320px, 1fr)) max-content'
    })
    const m = await masoaraSubsol(page)
    console.log('[subsol martor depasire] ' + JSON.stringify(m.depasire))
    expect(m.depasire).toBeGreaterThan(0.5)
  })
})

// ------------------------------------------------------------------------------------------------ meta si titlurile

test('format-detection: HTML-ul servit al starturilor, EN si RO pe ambele copii, opreste detectarea numerelor de telefon', async () => {
  for (const c of COPII) {
    for (const cale of [c.startEn, c.startRo]) {
      const html = await (await fetch(c.copie().baza + cale)).text()
      const meta = [...html.matchAll(/<meta\b[^>]*>/g)].map((x) => x[0]).filter((x) => /name="format-detection"/.test(x))
      console.log('[format-detection] ' + c.nume + ' ' + cale + ' ' + JSON.stringify(meta))
      expect(meta.length, c.nume + cale).toBe(1)
      expect(meta[0]).toContain('content="telephone=no"')
    }
  }
})

type Titlu = { tag: string; text: string; randuri: number; orfane: string[]; orfaneLaBr: string[] }

/** Titlurile H1 si H2 vizibile din continut: randurile si cuvintele singure de pe ultimul rand al fiecarui segment. */
/** Titlurile principale care primesc regula: H1-ul eroului si titlurile de sectiune (clasele globale de tipografie). */
const TITLURI_PRINCIPALE = 'main h1.t-h1-erou, main h2.t-h2-sectiune'

async function masoaraTitluri(page: Page, doar?: string): Promise<Titlu[]> {
  return page.evaluate((selector) => {
    const titluri = [...document.querySelectorAll<HTMLElement>(selector)].filter((h) => {
      const r = h.getBoundingClientRect()
      const st = getComputedStyle(h)
      return r.width > 2 && r.height > 2 && st.visibility !== 'hidden' && st.position !== 'absolute'
    })
    return titluri.map((h) => {
      // Cuvintele, in ordine, cu segmentul (`<br>` incepe unul nou) si randul (top-ul primului caracter).
      const cuvinte: { seg: number; top: number; text: string }[] = []
      let seg = 0
      const w = document.createTreeWalker(h, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT)
      for (let n = w.nextNode(); n; n = w.nextNode()) {
        if (n.nodeType === 1) {
          if ((n as Element).tagName === 'BR') seg++
          continue
        }
        const t = n as Text
        for (const m of t.data.matchAll(/\S+/g)) {
          const r = document.createRange()
          r.setStart(t, m.index ?? 0)
          r.setEnd(t, (m.index ?? 0) + 1)
          const d = r.getClientRects()[0]
          if (!d) continue
          cuvinte.push({ seg, top: Math.round(d.top), text: m[0] })
        }
      }
      const randuri = new Set(cuvinte.map((c) => c.seg + ':' + c.top)).size
      // `orfane`: ultimul segment al titlului; `orfaneLaBr`: segmentele inchise de un `<br>`, pe care nicio regula de
      // `text-wrap` nu le atinge (navigatorul nu echilibreaza un bloc cu rupere fortata) - se masoara si se raporteaza.
      const orfane: string[] = []
      const orfaneLaBr: string[] = []
      for (let s = 0; s <= seg; s++) {
        const dinSeg = cuvinte.filter((c) => c.seg === s)
        if (dinSeg.length < 3) continue
        const ultimTop = dinSeg[dinSeg.length - 1].top
        const peUltim = dinSeg.filter((c) => c.top === ultimTop)
        if (peUltim.length === 1 && new Set(dinSeg.map((c) => c.top)).size > 1) (s < seg ? orfaneLaBr : orfane).push(peUltim[0].text)
      }
      return { tag: h.tagName, text: (h.textContent ?? '').trim().slice(0, 70), randuri, orfane, orfaneLaBr }
    })
  }, doar ?? TITLURI_PRINCIPALE)
}

test.describe('titlurile startului', () => {
  for (const c of COPII) {
    test(c.nume + ': pe starturile EN si RO, la 1440, 718 si 390, niciun titlu principal cu un singur cuvant pe ultimul rand', async ({ page }, info) => {
      test.setTimeout(180_000)
      // Toate cele patru masuratori, apoi verdictul: raportul arata fiecare titlu cu cuvant singur, nu doar primul.
      const cuOrfane: string[] = []
      for (const cale of [c.startEn, c.startRo]) {
        for (const latime of [1440, LATIME_A4, 390]) {
          await deschide(page, c.copie().baza + cale, latime)
          const t = await masoaraTitluri(page)
          console.log('[titluri] ' + c.nume + ' ' + cale + ' ' + latime + ' ' + JSON.stringify(t))
          expect(t.length).toBeGreaterThan(0)
          for (const x of t.filter((y) => y.orfane.length > 0)) cuOrfane.push(cale + ' ' + latime + ' ' + x.tag + ' "' + x.text + '": ' + x.orfane.join(', '))
          if (c.nume === '3s.com.ro' && cale === c.startRo) await capteaza(page, info, 'h1-start-' + latime, 'main h1')
        }
      }
      expect(cuOrfane).toEqual([])
    })
  }

  test('martor POZITIV: cu text-wrap: wrap pus inapoi pe H1-ul startului la 1440, cuvantul singur reapare', async ({ page }) => {
    test.setTimeout(60_000)
    await deschide(page, comro.baza + '/', 1440)
    await page.evaluate(() => {
      ;(document.querySelector('main h1') as HTMLElement).style.textWrap = 'wrap'
    })
    const [h1] = await masoaraTitluri(page, 'main h1')
    console.log('[titluri martor+] ' + JSON.stringify(h1))
    expect(h1.orfane.length).toBeGreaterThan(0)
  })

  test('martor NEGATIV: regula titlurilor nu schimba numarul de randuri al niciunui titlu masurat', async ({ page }) => {
    test.setTimeout(300_000)
    for (const c of COPII) {
      for (const [cale, latime] of [c.startEn, c.startRo].flatMap((x) => [[x, 1440], [x, LATIME_A4], [x, 390]] as const)) {
        await deschide(page, c.copie().baza + cale, latime)
        const echilibrat = await masoaraTitluri(page)
        await page.evaluate(() => {
          for (const h of document.querySelectorAll<HTMLElement>('main h1.t-h1-erou, main h2.t-h2-sectiune')) h.style.textWrap = 'wrap'
        })
        const simplu = await masoaraTitluri(page)
        expect(echilibrat.map((x) => x.randuri)).toEqual(simplu.map((x) => x.randuri))
      }
    }
  })
})
