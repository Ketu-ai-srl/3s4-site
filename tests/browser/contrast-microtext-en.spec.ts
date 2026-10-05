import type { Page } from '@playwright/test'
import { expect, test } from './ajutor/baza'
import { pornesteCopia3sMd, type Copie3sMd } from './ajutor/copie-3s-md'
import { pagina as comparatie } from '../../src/content/en/compare-3s-vs-google-and-box'
import { pagina as efacturi } from '../../src/content/en/guides-e-invoice-archiving-eu'
import { pagina as moldova } from '../../src/content/en/guides-records-retention-moldova'
import { inJur as inJurCautare, pagina as cautare } from '../../src/content/en/features-search'
import { MICROTEXT as MICROTEXT_EN } from '../../src/content/en/home'
import { MICROTEXT as MICROTEXT_RO_MD } from '../../src/content/ro-md/acasa'

/**
 * Contrastul microtextului de sub butonul de canal pe paginile EN de referinta ale lui 3s.md (G1, G2, G3, scheletul
 * `src/app/(en)/guides/_referinta/PaginaReferinta.tsx`) si pe pagina de produs P03 (`/features/search`, scheletul
 * `src/app/(en)/features/_produs/PaginaProdus.tsx`), pe COPIA construita cu variabilele aplicatiei 3s.md.
 *
 * DE CE. Ambele schelete imprumutau clasa paragrafului din cutia CTA inchisa (`ctaText`, culoarea ardezie-3, gandita
 * pentru fundalul ardezie-9), dar o asezau pe fundalul alb al paginii: pe G1 la 390 textul era aproape invizibil, iar
 * pe P03 masurarea dadea acelasi 1,48:1.
 *
 * P03 A IESIT DIN PROBA (felia 105, decizia 53, intrebarea 5 varianta a): `/features/search` nu mai foloseste scheletul
 * `PaginaProdus`, ci povestea cinema a perechii RO; microtextul a devenit nota de sub butonul CTA, pe fundal inchis,
 * iar contrastul ei se masoara, cu martorii ei, in `tests/browser/en-produs.spec.ts`. Scheletul ramane in depozit,
 * nefolosit de nicio pagina, deci nu mai are ce masura aici.
 *
 * CE SE MASOARA. Raportul de contrast WCAG 2.x intre culoarea calculata a textului si fundalul EFECTIV: se urca din
 * element spre radacina, se compun straturile de fundal semitransparente pana la primul opac (implicit alb, panza),
 * iar opacitatea elementului si a stramosilor se aplica textului. Un fundal cu imagine nu se poate masura din stil,
 * deci e refuzat zgomotos, nu ghicit. Culorile se citesc printr-o panza 2D, ca orice forma de culoare calculata
 * (rgb, rgba, oklab, color()) sa ajunga la aceiasi patru octeti.
 *
 * PRAGUL. 4,5:1 (AA, text normal): microtextul are 16 px la greutate normala, deci nu e "text mare".
 * LATIMI. 390 si 1440.
 *
 * CONTROALE. (1) Formula, pe valori cu raspuns cunoscut: negru pe alb 21:1, alb pe alb 1:1. (2) Martorii pe pagina:
 * pe copia servita, microtextului i se injecteaza la rulare o culoare citita din tokenii paginii, nu scrisa aici.
 * POZITIV: culoarea slaba (`--color-ardezie-3`) coboara masurarea sub prag; fara asta, un prag "trecut" ar putea
 * veni dintr-o masurare care nu vede culoarea. NEGATIV: culoarea titlurilor (`--color-ardezie-9`) ramane peste prag,
 * deci proba nu acuza orice text. (3) Extragerea gasea exact doua microtexte pe
 * fiecare pagina (eroul si blocul de final), cu textul modulului, ca un "trece" sa nu vina dintr-o lista goala. In lotul
 * s4-12d (105 + 106) nicio pagina nu mai are scheletul: (2) si (3) ruleaza pe un schelet sintetic injectat in pagina
 * reala (vezi lista PAGINI).
 *
 * INVENTARUL. Celelalte pagini ale copiei care au microtextul (EN si /ro) se masoara si se ataseaza raportului, fara
 * prag: ele nu folosesc cele doua schelete, iar proba de fata nu le judeca.
 */

const PRAG = 4.5
const LATIMI = [390, 1440] as const

// G1, G2 si G3 au iesit din lista odata cu scheletul lor (felia 106, decizia 53): ghidurile compun acum componentele
// perechilor RO, iar microtextul de sub butonul de canal sta in blocul de final inchis, pe fundalul lui, ca pe paginile
// RO. P03 a iesit si el (felia 105, antetul). In lot, NICIO pagina servita nu mai poarta vreunul din cele doua
// schelete: `PaginaReferinta` e sters (106), `PaginaProdus` ramane in depozit fara nicio pagina (105).
//
// Asteptarea, adusa la starea combinata: pe fiecare din cele patru pagini care purtau scheletul, ZERO paragrafe sub
// `[data-canale-pagina]` (o pagina care l-ar readuce, cu paragraful pe fundal alb, se inroseste aici, nu trece
// nemasurata). Lista nu ramane goala; martorii se muta pe P03 (prima pagina a listei), pe un schelet SINTETIC
// injectat la rulare cu forma celui real (`div[data-canale-pagina] > p` cu microtextul modulului, pe fundalul
// paginii): acelasi selector si aceeasi masurare, deci un zero de mai sus nu poate veni dintr-un selector orb.
const PAGINI: { cale: string; microtext: string | null }[] = [
  { cale: cautare.meta.cale, microtext: inJurCautare.microtext },
  { cale: efacturi.meta.cale, microtext: null },
  { cale: moldova.meta.cale, microtext: null },
  { cale: comparatie.meta.cale, microtext: null },
]

const INVENTAR = ['/', '/about', '/contact', '/enterprise', '/platform', '/pricing', '/ro', '/ro/contact']

type Masurare = { text: string; culoare: string; fundal: string; raport: number; eroare: string | null }

/** Masoara, in pagina, contrastul fiecarui element dat de selector. */
async function masoara(page: Page, selector: string, texte: string[] | null): Promise<Masurare[]> {
  return page.evaluate(
    ({ selector, texte }) => {
      const panza = document.createElement('canvas')
      panza.width = 1
      panza.height = 1
      const ctx = panza.getContext('2d', { willReadFrequently: true })
      if (ctx === null) throw new Error('panza 2D indisponibila')
      const rgba = (c: string): [number, number, number, number] => {
        ctx.clearRect(0, 0, 1, 1)
        ctx.fillStyle = '#000'
        ctx.fillStyle = c
        ctx.fillRect(0, 0, 1, 1)
        const d = ctx.getImageData(0, 0, 1, 1).data
        return [d[0], d[1], d[2], d[3] / 255]
      }
      const peste = (sus: [number, number, number, number], jos: [number, number, number]): [number, number, number] => [
        sus[0] * sus[3] + jos[0] * (1 - sus[3]),
        sus[1] * sus[3] + jos[1] * (1 - sus[3]),
        sus[2] * sus[3] + jos[2] * (1 - sus[3]),
      ]
      const lum = (c: [number, number, number]) => {
        const l = c.map((v) => {
          const s = v / 255
          return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
        })
        return 0.2126 * l[0] + 0.7152 * l[1] + 0.0722 * l[2]
      }
      const elemente = [...document.querySelectorAll<HTMLElement>(selector)].filter(
        (el) => texte === null || texte.includes((el.textContent ?? '').trim()),
      )
      return elemente.map((el) => {
        const text = (el.textContent ?? '').trim()
        const straturi: [number, number, number, number][] = []
        let opacitate = 1
        let eroare: string | null = null
        for (let n: HTMLElement | null = el; n !== null; n = n.parentElement) {
          const st = getComputedStyle(n)
          opacitate *= Number(st.opacity)
          if (st.backgroundImage !== 'none' && eroare === null && straturi.every((s) => s[3] < 1)) {
            eroare = 'fundal cu imagine pe ' + n.tagName.toLowerCase()
          }
          const f = rgba(st.backgroundColor)
          if (f[3] > 0 && straturi.every((s) => s[3] < 1)) straturi.push(f)
        }
        let fundal: [number, number, number] = [255, 255, 255]
        for (let i = straturi.length - 1; i >= 0; i--) fundal = peste(straturi[i], fundal)
        const t = rgba(getComputedStyle(el).color)
        const culoare = peste([t[0], t[1], t[2], t[3] * opacitate], fundal)
        const a = lum(culoare)
        const b = lum(fundal)
        const raport = (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)
        const hex = (c: number[]) => '#' + c.map((v) => Math.round(v).toString(16).padStart(2, '0')).join('')
        const r = el.getBoundingClientRect()
        if (eroare === null && (r.width === 0 || r.height === 0)) eroare = 'element fara cutie'
        return { text, culoare: hex(culoare), fundal: hex(fundal), raport: Math.round(raport * 100) / 100, eroare }
      })
    },
    { selector, texte },
  )
}

/** Formula de contrast, aceeasi cu cea din pagina, pe doua culori opace (pentru controlul 1). */
async function raportFormula(page: Page, text: string, fundal: string): Promise<number> {
  await page.setContent('<p style="color:' + text + ';background:' + fundal + '">x</p>')
  const [m] = await masoara(page, 'p', null)
  return m.raport
}

const SELECTOR_MICROTEXT = '[data-canale-pagina] > p'

let copie: Copie3sMd

test.beforeAll(async () => {
  test.setTimeout(600_000)
  copie = await pornesteCopia3sMd()
})

test.afterAll(async () => {
  await copie?.opreste()
})

test('control 1: formula da 21:1 pe negru/alb si 1:1 pe alb/alb', async ({ page }) => {
  expect(await raportFormula(page, '#000000', '#ffffff')).toBe(21)
  expect(await raportFormula(page, '#ffffff', '#ffffff')).toBe(1)
})

for (const latime of LATIMI) {
  test.describe('la ' + latime, () => {
    test.use({ viewport: { width: latime, height: latime === 390 ? 844 : 900 } })

    for (const p of PAGINI) {
      test(p.cale + ': microtextul de sub buton are contrast >= ' + PRAG + ':1 pe fundalul efectiv', async ({ page }) => {
        await page.goto(copie.baza + p.cale)
        const toate = await masoara(page, SELECTOR_MICROTEXT, null)
        test.info().annotations.push({ type: 'contrast ' + latime, description: p.cale + ' ' + JSON.stringify(toate) })
        console.log('[contrast ' + latime + '] ' + p.cale + ' ' + JSON.stringify(toate.map((m) => [m.raport, m.culoare, m.fundal, m.eroare])))
        // Starea combinata (antetul listei PAGINI): pagina nu mai poarta scheletul, deci zero paragrafe sub selector;
        // daca il readuce, fiecare paragraf trebuie sa treaca pragul.
        expect(toate, 'paragrafe sub [data-canale-pagina]').toHaveLength(0)
        for (const m of toate) {
          expect(m.eroare, m.text).toBeNull()
          expect(m.raport, m.text + ' ' + m.culoare + ' pe ' + m.fundal).toBeGreaterThanOrEqual(PRAG)
        }
        // Controlul 3, adus la starea combinata: pe ACEEASI pagina, scheletul sintetic e gasit de acelasi selector,
        // deci zero-ul de mai sus nu vine dintr-o extragere oarba.
        await injecteazaSchelet(page, 'Microtext sintetic de control')
        expect((await masoara(page, SELECTOR_MICROTEXT, null)).map((m) => m.text)).toEqual(['Microtext sintetic de control'])
      })
    }

    /**
     * Pune in pagina un schelet SINTETIC cu forma celui real (`div[data-canale-pagina] > p`), ca prim copil al lui
     * `<body>`, adica pe fundalul paginii, unde scheletul real isi aseza paragraful.
     */
    async function injecteazaSchelet(page: Page, text: string): Promise<void> {
      await page.evaluate((t) => {
        const div = document.createElement('div')
        div.setAttribute('data-canale-pagina', 'martor')
        const p = document.createElement('p')
        p.textContent = t
        div.appendChild(p)
        document.body.prepend(div)
      }, text)
    }

    /** Injecteaza pe microtextul scheletului sintetic culoarea unui token citit din pagina si intoarce masurarea lui. */
    async function cuCuloarea(page: Page, p: (typeof PAGINI)[number], token: string): Promise<Masurare[]> {
      await page.goto(copie.baza + p.cale)
      const microtext = p.microtext
      if (microtext === null) throw new Error('martorii cer o pagina cu microtextul modulului: ' + p.cale)
      expect(await masoara(page, SELECTOR_MICROTEXT, null), 'pagina reala nu mai are scheletul').toHaveLength(0)
      await injecteazaSchelet(page, microtext)
      const culoare = await page.evaluate((t) => getComputedStyle(document.documentElement).getPropertyValue(t).trim(), token)
      expect(culoare, token).not.toBe('')
      await page.addStyleTag({ content: SELECTOR_MICROTEXT + '{color:' + culoare + ' !important}' })
      const micro = (await masoara(page, SELECTOR_MICROTEXT, null)).filter((m) => m.text === microtext)
      expect(micro).toHaveLength(1)
      for (const m of micro) expect(m.eroare).toBeNull()
      return micro
    }

    // Martorii, pe P03 (PAGINI[0]), cu scheletul sintetic: nicio pagina servita nu mai are scheletul real (antetul
    // listei PAGINI).
    for (const p of [PAGINI[0]]) {
      test('martor POZITIV la ' + latime + ' pe ' + p.cale + ': culoarea slaba a sistemului injectata pe microtext coboara masurarea sub prag', async ({ page }) => {
        for (const m of await cuCuloarea(page, p, '--color-ardezie-3')) expect(m.raport).toBeLessThan(PRAG)
      })

      test('martor NEGATIV la ' + latime + ' pe ' + p.cale + ': culoarea titlurilor injectata pe microtext ramane peste prag', async ({ page }) => {
        for (const m of await cuCuloarea(page, p, '--color-ardezie-9')) expect(m.raport).toBeGreaterThanOrEqual(PRAG)
      })
    }

    test('inventar (fara prag): microtextul pe celelalte pagini ale copiei', async ({ page }) => {
      const gasite: string[] = []
      for (const cale of INVENTAR) {
        await page.goto(copie.baza + cale)
        const m = await masoara(page, 'p', [MICROTEXT_EN, MICROTEXT_RO_MD])
        gasite.push(cale + ' ' + JSON.stringify(m.map((x) => ({ raport: x.raport, culoare: x.culoare, fundal: x.fundal, eroare: x.eroare }))))
      }
      test.info().annotations.push({ type: 'inventar ' + latime, description: gasite.join('\n') })
      console.log('[inventar ' + latime + ']\n' + gasite.join('\n'))
      // Controlul citirii: cel putin o pagina din inventar are microtextul.
      expect(gasite.some((g) => g.includes('raport'))).toBe(true)
    })
  })
}
