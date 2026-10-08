import { writeFileSync } from 'node:fs'
import { join } from 'node:path'
import type { Page } from '@playwright/test'
import { EROU_EN } from '../../src/content/en/acasa-componente'
import { EROU_RO_MD } from '../../src/content/ro-md/acasa-componente'
import { expect, test } from './ajutor/baza'
import { mediuProfil3sMd, pornesteCopia3sMd, type Copie3sMd } from './ajutor/copie-3s-md'
import { RADACINA } from './ajutor/proiect'

/**
 * Titlurile, tiparul si paginile 404 (felia 147), masurate pe cele doua copii ale site-ului: 3s.md (engleza la
 * radacina, romana sub /ro) si 3s.com.ro (romana la radacina, engleza sub /en). Defectele masurate in browserul real:
 *  - H1-ul STARTULUI: prima propozitie lasa un cuvant singur pe rand ("firmei." si "documents." la 1440 si la 390);
 *  - randul de GARANTII de sub eroul /enterprise: cand se rupe (390), al treilea element incepe randul 2 cu punctul-
 *    separator inainte;
 *  - TABELUL de pe /platforma sub 760 px: capul de coloana e ascuns vizual (ramane pentru cititoarele de ecran), iar
 *    cardurile nu spun care celula e scanarea simpla si care e 3S;
 *  - PAGINILE 404 ale editiilor (fara layout, deci fara metadatele lui) n-aveau `format-detection`;
 *  - TIPARIREA startului derulat pana la constructor: fara grafica de fundal, textul alb al temei inchise iesea pe
 *    hartie alba (#ababab, 2,3:1, masurat pe PDF); rezumatele randurilor inchise ale demonstratiei de cautare se
 *    pictau peste randul urmator ("Factura_energie" peste rezumatul randului "Contract", pagina 3 a PDF-ului).
 *
 * CE SE CERE (masurat in pagina, cu `innerWidth` citit din pagina):
 *  1. pe starturi (EN si RO, ambele copii), la 2304, 1920, 1600, 1440, 768, 390, 375 si 360: nicio propozitie a
 *     H1-ului nu are un rand de un singur cuvant; propozitia scurta (cel mult trei cuvinte) sta pe un rand; cuvintele
 *     titlului sunt exact cele din continut (textul nu se schimba). Propozitia scurta, intinsa in golul dintre
 *     coloane, nu atinge figura eroului (nodurile si inelele) de la 1181 la 2304. Prima forma a feliei lasa singur
 *     PRIMUL cuvant al propozitiei RO ("Intreaba") la 360, 375, 1600, 1920 si 2304: cu marimea din `.t-h1-erou`
 *     propozitia nu incapea pe un rand. Marimea titlului startului are acum plafon peste 1180 px si urmeaza fereastra
 *     sub 390 px; martorul pozitiv repune marimea veche si cere cuvantul singur inapoi;
 *  2. pe /enterprise (EN si RO, ambele copii), la 360, 390, 768 si 1440: punctul-separator al primului element de pe
 *     orice rand nu se vede (hit-test in centrul lui), cel al oricarui alt element se vede, iar textele care incep
 *     randuri stau la aceeasi margine;
 *  3. pe /platforma (EN si RO, ambele copii): la 390 fiecare celula isi arata eticheta, egala cu textul capului ei de
 *     coloana; la 1440 nicio eticheta; arborele de accesibilitate al tabelului e acelasi la 390 si la 1440;
 *  4. paginile 404 ale ambelor editii, pe ambele copii: raspuns 404, limba editiei si exact un
 *     `<meta name="format-detection" content="telephone=no">`;
 *  5. startul (EN si RO, ambele copii) derulat pana la constructor (tema inchisa), in modul print: orice text deschis
 *     din sectiune si stratul temei se tiparesc cu `print-color-adjust: exact`; in demonstratia de cautare numai
 *     rezumatul randului deschis ramane in pagina. PDF-ul fara grafica de fundal se scrie ca artefact (masuratoarea pe
 *     PDF, cu PyMuPDF, e in raportul feliei: navigatorul n-are aici un cititor de PDF).
 *
 * MARTORII:
 *  - POZITIV, titlul: cu regulile feliei scoase din pagina (`wrap` pe propozitii, fara margini, ultimele doua cuvinte
 *    lasate sa se desparta), la 1440 cuvantul singur reapare, pe RO si pe EN;
 *  - NEGATIV, titlul: la 1024 si 768, unde titlul n-avea cuvant singur, randurile sunt aceleasi cu si fara regulile
 *    feliei;
 *  - POZITIV, separatorul: fara taietura listei, la 390 punctul de la inceputul randului 2 se vede;
 *  - NEGATIV, separatorul: la 1440 (un singur rand) textele stau exact unde stateau cu asezarea veche repusa;
 *  - POZITIV, tabelul: o eticheta fara text alternativ gol schimba arborele de accesibilitate (comparatia vede);
 *  - NEGATIV, tabelul: la 1440 capul de coloana se vede si nicio celula nu are eticheta;
 *  - POZITIV, 404: aceeasi citire gaseste meta-ul pe start; NEGATIV: pe /robots.txt nu gaseste nimic;
 *  - POZITIV, tiparul: cu regulile de tipar ale feliei scoase, textul constructorului revine la `economy` si
 *    rezumatele inchise raman in pagina;
 *  - NEGATIV, tiparul: pe ecran (fara print) nimic nu se schimba: rezumatele inchise raman in DOM cu inaltime zero,
 *    iar sectiunea ramane la `economy`.
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

type Copie = () => Copie3sMd
type Cai = { start: string; enterprise: string; platforma: string; negasit: string; lang: string }
const COPII: { nume: string; copie: Copie; en: Cai; ro: Cai }[] = [
  {
    nume: '3s.md',
    copie: () => md,
    en: { start: '/', enterprise: '/enterprise', platforma: '/platform', negasit: '/nu-exista-147', lang: 'en' },
    ro: { start: '/ro', enterprise: '/ro/enterprise', platforma: '/ro/platforma', negasit: '/ro/nu-exista-147', lang: 'ro' },
  },
  {
    nume: '3s.com.ro',
    copie: () => comro,
    en: { start: '/en', enterprise: '/en/enterprise', platforma: '/en/platform', negasit: '/en/nu-exista-147', lang: 'en' },
    ro: { start: '/', enterprise: '/enterprise', platforma: '/platforma', negasit: '/nu-exista-147', lang: 'ro' },
  },
]

async function deschide(page: Page, adresa: string, latime: number, inaltime = 900): Promise<void> {
  await page.setViewportSize({ width: latime, height: inaltime })
  const r = await page.goto(adresa, { waitUntil: 'load' })
  expect(r?.status(), adresa).toBe(200)
  await page.evaluate(() => document.fonts.ready.then(() => undefined))
  expect(await page.evaluate(() => window.innerWidth)).toBe(latime)
}

// ------------------------------------------------------------------------------------------------ titlul startului

type Propozitie = { scurta: boolean; randuri: string[][] }

/** Propozitiile H1-ului eroului (copiii lui directi) si randurile fiecareia, din dreptunghiul primei litere a cuvantului. */
async function masoaraH1(page: Page): Promise<Propozitie[]> {
  return page.evaluate(() => {
    const h = document.querySelector('h1#erou-titlu') as HTMLElement
    const blocuri = [...h.children].filter((e) => e.tagName === 'SPAN') as HTMLElement[]
    return blocuri.map((b) => {
      const cuvinte: { top: number; text: string }[] = []
      const w = document.createTreeWalker(b, NodeFilter.SHOW_TEXT)
      for (let n = w.nextNode(); n; n = w.nextNode()) {
        const t = n as Text
        for (const m of t.data.matchAll(/\S+/g)) {
          const r = document.createRange()
          r.setStart(t, m.index ?? 0)
          r.setEnd(t, (m.index ?? 0) + 1)
          const d = r.getClientRects()[0]
          if (d) cuvinte.push({ top: Math.round(d.top), text: m[0] })
        }
      }
      const randuri: string[][] = []
      let sus: number | null = null
      for (const c of cuvinte) {
        if (sus === null || Math.abs(c.top - sus) > 3) {
          randuri.push([])
          sus = c.top
        }
        randuri[randuri.length - 1].push(c.text)
      }
      return { scurta: b.hasAttribute('data-scurta'), randuri }
    })
  })
}

/** Randurile de un singur cuvant ale propozitiilor de cel putin doua cuvinte. */
function randuriSingure(p: Propozitie[]): string[] {
  return p.filter((x) => x.randuri.flat().length > 1).flatMap((x) => x.randuri.filter((r) => r.length === 1).map((r) => r[0]))
}

/** Scoate din pagina regulile feliei pe titlu: `wrap` pe propozitii, fara margini, ultimele cuvinte nelegate. */
async function faraReguliTitlu(page: Page): Promise<void> {
  await page.evaluate(() => {
    for (const b of document.querySelectorAll<HTMLElement>('h1#erou-titlu > span')) {
      b.style.textWrap = 'wrap'
      b.style.margin = '0'
      for (const l of b.querySelectorAll<HTMLElement>('[data-lipit]')) l.style.whiteSpace = 'normal'
    }
  })
}

function cuvinteContinut(e: { titlu: { primaPropozitie: string; aDouaInainteDeAccent: string; accent: string } }): string[] {
  return [e.titlu.primaPropozitie, e.titlu.aDouaInainteDeAccent, e.titlu.accent].join(' ').split(/\s+/).filter(Boolean)
}

/** Distanta minima de la cuvintele propozitiei scurte la figura eroului: nodurile si inelele (cercurile mari). */
async function distantaFigura(page: Page): Promise<{ noduri: number; inele: number } | null> {
  return page.evaluate(() => {
    const b = document.querySelector('h1#erou-titlu > span[data-scurta]')
    if (!b) return null
    const cuv: DOMRect[] = []
    const w = document.createTreeWalker(b, NodeFilter.SHOW_TEXT)
    for (let n = w.nextNode(); n; n = w.nextNode()) {
      const t = n as Text
      for (const m of t.data.matchAll(/[^\s]+/g)) {
        const r = document.createRange()
        r.setStart(t, m.index ?? 0)
        r.setEnd(t, (m.index ?? 0) + m[0].length)
        const d = r.getClientRects()[0]
        if (d) cuv.push(d)
      }
    }
    const figura = document.querySelector('section[data-ciot="erou"] [class*="spatiu"]')
    if (!figura) throw new Error('figura eroului lipseste')
    let noduri = Infinity
    for (const e of figura.querySelectorAll('[class*="nod"]')) {
      const q = e.getBoundingClientRect()
      if (q.width < 1 || q.width > 400) continue
      for (const c of cuv) noduri = Math.min(noduri, Math.hypot(Math.max(0, q.left - c.right, c.left - q.right), Math.max(0, q.top - c.bottom, c.top - q.bottom)))
    }
    let inele = Infinity
    for (const ci of figura.querySelectorAll('circle')) {
      const q = ci.getBoundingClientRect()
      if (q.width < 100) continue
      const cx = (q.left + q.right) / 2
      const cy = (q.top + q.bottom) / 2
      for (const c of cuv) {
        const x = Math.min(Math.max(cx, c.left), c.right)
        const y = Math.min(Math.max(cy, c.top), c.bottom)
        inele = Math.min(inele, Math.hypot(x - cx, y - cy) - q.width / 2)
      }
    }
    return { noduri: Math.round(noduri), inele: Math.round(inele) }
  })
}

test.describe('titlul startului', () => {
  for (const c of COPII) {
    test(c.nume + ': pe starturile EN si RO, de la 360 la 2304, nicio propozitie a H1-ului cu un rand de un cuvant, textul neschimbat', async ({ page }) => {
      test.setTimeout(420_000)
      const gasite: string[] = []
      for (const [limba, cai, continut] of [
        ['EN', c.en, EROU_EN],
        ['RO', c.ro, EROU_RO_MD],
      ] as const) {
        for (const latime of [2304, 1920, 1600, 1440, 768, 390, 375, 360]) {
          await deschide(page, c.copie().baza + cai.start, latime)
          const p = await masoaraH1(page)
          console.log('[h1] ' + c.nume + ' ' + limba + ' ' + latime + ' ' + JSON.stringify(p))
          expect(p.length, 'doua propozitii').toBe(2)
          expect(p.flatMap((x) => x.randuri.flat()).join(' '), 'cuvintele titlului').toBe(cuvinteContinut(continut).join(' '))
          for (const s of randuriSingure(p)) gasite.push(limba + ' ' + latime + ': ' + s)
          for (const x of p.filter((y) => y.scurta)) expect(x.randuri.length, limba + ' ' + latime + ' propozitia scurta pe un rand').toBe(1)
        }
      }
      expect(gasite).toEqual([])
    })

    test(c.nume + ': propozitia scurta, intinsa in golul dintre coloane, nu atinge figura eroului de la 1181 la 2304', async ({ page }) => {
      test.setTimeout(180_000)
      for (const cai of [c.en, c.ro]) {
        for (const latime of [1181, 1280, 1440, 1600, 1920, 2304]) {
          await deschide(page, c.copie().baza + cai.start, latime, 1000)
          const d = await distantaFigura(page)
          console.log('[h1 figura] ' + c.nume + ' ' + cai.start + ' ' + latime + ' ' + JSON.stringify(d))
          if (d === null) continue
          expect(d.noduri, 'distanta la noduri').toBeGreaterThan(8)
          expect(d.inele, 'distanta la inele').toBeGreaterThan(8)
        }
      }
    })
  }

  test('martor POZITIV: cu regulile feliei scoase, la 1440 cuvantul singur reapare pe RO si pe EN', async ({ page }) => {
    test.setTimeout(60_000)
    for (const cale of [comro.baza + '/', comro.baza + '/en']) {
      await deschide(page, cale, 1440)
      await faraReguliTitlu(page)
      const p = await masoaraH1(page)
      console.log('[h1 martor+] ' + cale + ' ' + JSON.stringify(p))
      expect(randuriSingure(p).length, cale).toBeGreaterThan(0)
    }
  })

  test('martor POZITIV al plafonului: cu marimea din .t-h1-erou repusa, la 1920 si la 360 "Intreaba" ramane singur pe RO', async ({ page }) => {
    test.setTimeout(60_000)
    for (const latime of [1920, 360]) {
      await deschide(page, comro.baza + '/', latime)
      await page.evaluate(() => {
        const h = document.querySelector<HTMLElement>('h1#erou-titlu')
        if (!h) throw new Error('H1-ul eroului lipseste')
        // Valorile din globals.css (.t-h1-erou), fara plafonul din Erou.module.css.
        h.style.setProperty('font-size', innerWidth > 1180 ? 'clamp(2rem, 3.1vw, 3.3rem)' : 'clamp(1.7rem, 6vw, 2.2rem)', 'important')
      })
      const p = await masoaraH1(page)
      console.log('[h1 martor plafon] ' + latime + ' ' + JSON.stringify(p))
      expect(randuriSingure(p).length, String(latime)).toBeGreaterThan(0)
    }
  })

  test('martor NEGATIV: la 1024 si 768, unde titlul n-avea cuvant singur, randurile sunt aceleasi cu si fara regulile feliei', async ({ page }) => {
    test.setTimeout(120_000)
    for (const cale of [comro.baza + '/', comro.baza + '/en', md.baza + '/', md.baza + '/ro']) {
      for (const latime of [1024, 768]) {
        await deschide(page, cale, latime)
        const cu = await masoaraH1(page)
        await faraReguliTitlu(page)
        const fara = await masoaraH1(page)
        expect(cu.map((x) => x.randuri), cale + ' ' + latime).toEqual(fara.map((x) => x.randuri))
      }
    }
  })
})

// ------------------------------------------------------------------------------------------------ garantiile /enterprise

type Garantie = { text: string; top: number; textStanga: number; primul: boolean; punctVazut: boolean }

/** Elementele randului de garantii: randul, marginea textului si daca punctul lor e atins de hit-test. */
async function masoaraGarantii(page: Page): Promise<Garantie[]> {
  return page.evaluate(() => {
    // Lista: cea al carei AL DOILEA element are punctul de 3 px (si in asezarea veche, si in cea noua).
    const tinta = [...document.querySelectorAll<HTMLElement>('main ul')].find((u) => {
      const b = u.children[1] ? getComputedStyle(u.children[1], '::before') : null
      return b !== null && b.width === '3px' && b.height === '3px'
    })
    if (!tinta) throw new Error('randul de garantii lipseste')
    tinta.scrollIntoView({ block: 'center', behavior: 'instant' as ScrollBehavior })
    const li = [...tinta.children] as HTMLElement[]
    const date = li.map((e) => {
      const r = e.getBoundingClientRect()
      const t = [...e.childNodes].find((n) => n.nodeType === 3 && (n as Text).data.trim()) as Text
      const rg = document.createRange()
      rg.selectNodeContents(t)
      const rt = rg.getClientRects()[0]
      const b = getComputedStyle(e, '::before')
      const are = b.content !== 'none' && b.display !== 'none'
      const x = r.left + (parseFloat(b.marginLeft) || 0) + 1.5
      const y = r.top + r.height / 2
      const lovit = are ? document.elementFromPoint(x, y) : null
      return { text: (e.textContent ?? '').trim(), top: Math.round(r.top), left: r.left, textStanga: Math.round(rt.left * 10) / 10, punctVazut: lovit !== null && (lovit === e || e.contains(lovit)) }
    })
    return date.map((d) => ({ text: d.text, top: d.top, textStanga: d.textStanga, punctVazut: d.punctVazut, primul: date.every((o) => Math.abs(o.top - d.top) > 3 || o.left >= d.left) }))
  })
}

test.describe('randul de garantii de pe /enterprise', () => {
  for (const c of COPII) {
    test(c.nume + ': separatorul nu incepe niciodata un rand, la 360, 390, 768 si 1440, pe EN si RO', async ({ page }) => {
      test.setTimeout(180_000)
      for (const cai of [c.en, c.ro]) {
        for (const latime of [360, 390, 768, 1440]) {
          await deschide(page, c.copie().baza + cai.enterprise, latime)
          const e = await masoaraGarantii(page)
          console.log('[garantii] ' + c.nume + ' ' + cai.enterprise + ' ' + latime + ' ' + JSON.stringify(e))
          expect(e.length).toBeGreaterThan(1)
          expect(e.filter((x) => x.primul && x.punctVazut).map((x) => x.text), 'punct la inceput de rand').toEqual([])
          expect(e.filter((x) => !x.primul && !x.punctVazut).map((x) => x.text), 'punct lipsa intre elemente').toEqual([])
          const margini = new Set(e.filter((x) => x.primul).map((x) => Math.round(x.textStanga)))
          expect(margini.size, 'textele de la inceput de rand la aceeasi margine').toBe(1)
          if (latime <= 390) expect(new Set(e.map((x) => x.top)).size, 'la ' + latime + ' randul se rupe (cazul masurat)').toBeGreaterThan(1)
        }
      }
    })
  }

  test('martor POZITIV: fara taietura listei, la 390 punctul de la inceputul randului 2 se vede', async ({ page }) => {
    test.setTimeout(60_000)
    await deschide(page, comro.baza + '/enterprise', 390)
    await page.evaluate(() => {
      for (const u of document.querySelectorAll<HTMLElement>('main ul')) u.style.clipPath = 'none'
    })
    const e = await masoaraGarantii(page)
    console.log('[garantii martor+] ' + JSON.stringify(e))
    expect(e.filter((x) => x.primul && x.punctVazut).length).toBeGreaterThan(0)
  })

  test('martor NEGATIV: la 1440, pe un singur rand, textele stau unde stateau cu asezarea veche', async ({ page }) => {
    test.setTimeout(60_000)
    for (const cale of [comro.baza + '/enterprise', md.baza + '/enterprise']) {
      await deschide(page, cale, 1440)
      const nou = await masoaraGarantii(page)
      await page.evaluate(() => {
        const st = document.createElement('style')
        // Asezarea de dinainte: fara tragerea spre stanga si fara taietura; primul element fara punct.
        st.textContent = '.vechi-147 { margin-left: 0 !important; clip-path: none !important; } .vechi-147 > li:first-child::before { display: none !important; }'
        document.head.appendChild(st)
        for (const u of document.querySelectorAll<HTMLElement>('main ul')) {
          const b = u.children[1] ? getComputedStyle(u.children[1], '::before') : null
          if (b && b.width === '3px' && b.height === '3px') u.classList.add('vechi-147')
        }
      })
      const vechi = await masoaraGarantii(page)
      console.log('[garantii martor-] ' + cale + ' ' + JSON.stringify({ nou, vechi }))
      expect(new Set(nou.map((x) => x.top)).size).toBe(1)
      expect(nou.length).toBe(vechi.length)
      for (let i = 0; i < nou.length; i++) expect(Math.abs(nou[i].textStanga - vechi[i].textStanga), nou[i].text).toBeLessThanOrEqual(0.6)
    }
  })
})

// ------------------------------------------------------------------------------------------------ tabelul /platforma

const TABEL = 'section[aria-labelledby="platforma-comparatie"] [role="table"]'

/** Etichetele vizibile ale celulelor si textul capului de coloana al fiecareia. */
async function masoaraTabel(page: Page): Promise<{ capVizibil: boolean; celule: { eticheta: string | null; cap: string }[] }> {
  return page.locator(TABEL).evaluate((t) => {
    const randuri = [...t.querySelectorAll('[role="row"]')]
    const capuri = [...randuri[0].querySelectorAll('[role="columnheader"]')].map((h) => (h.textContent ?? '').trim())
    const celule = randuri.slice(1).flatMap((r) =>
      [...r.children].map((c, i) => ({ c, i })).filter(({ c }) => c.getAttribute('role') === 'cell').map(({ c, i }) => {
        const b = getComputedStyle(c, '::before')
        const vizibil = b.content !== 'none' && b.content !== 'normal' && b.display !== 'none'
        // `"Text" / ""`: textul afisat e primul sir din valoare.
        const m = vizibil ? /^"((?:[^"\\]|\\.)*)"/.exec(b.content) : null
        return { eticheta: m ? m[1] : null, cap: capuri[i] }
      }),
    )
    return { capVizibil: randuri[0].getBoundingClientRect().width > 2, celule }
  })
}

test.describe('tabelul de pe /platforma', () => {
  for (const c of COPII) {
    test(c.nume + ': la 390 fiecare celula isi arata eticheta coloanei, la 1440 niciuna, iar arborele de accesibilitate e acelasi', async ({ page }) => {
      test.setTimeout(120_000)
      for (const cai of [c.en, c.ro]) {
        await deschide(page, c.copie().baza + cai.platforma, 1440)
        const lat = await masoaraTabel(page)
        const ariaLat = await page.locator(TABEL).ariaSnapshot()
        await deschide(page, c.copie().baza + cai.platforma, 390)
        const ingust = await masoaraTabel(page)
        const ariaIngust = await page.locator(TABEL).ariaSnapshot()
        console.log('[tabel] ' + c.nume + ' ' + cai.platforma + ' ' + JSON.stringify({ lat, ingust }))
        expect(lat.capVizibil).toBe(true)
        expect(lat.celule.filter((x) => x.eticheta !== null)).toEqual([])
        expect(ingust.capVizibil).toBe(false)
        expect(ingust.celule.length).toBeGreaterThan(0)
        expect(ingust.celule.filter((x) => x.eticheta !== x.cap || !x.cap)).toEqual([])
        expect(ariaIngust, 'arborele de accesibilitate la 390 fata de 1440').toBe(ariaLat)
      }
    })
  }

  test('martor POZITIV: o eticheta fara text alternativ gol schimba arborele de accesibilitate', async ({ page }) => {
    test.setTimeout(60_000)
    await deschide(page, comro.baza + '/platforma', 390)
    const inainte = await page.locator(TABEL).ariaSnapshot()
    await page.addStyleTag({ content: '[data-eticheta]::before { content: attr(data-eticheta) !important; }' })
    const dupa = await page.locator(TABEL).ariaSnapshot()
    expect(dupa).not.toBe(inainte)
  })

  test('martor NEGATIV: la 1440 capul de coloana se vede si nicio celula nu are eticheta', async ({ page }) => {
    test.setTimeout(60_000)
    await deschide(page, md.baza + '/ro/platforma', 1440)
    const t = await masoaraTabel(page)
    expect(t.capVizibil).toBe(true)
    expect(t.celule.every((x) => x.eticheta === null)).toBe(true)
  })
})

// ------------------------------------------------------------------------------------------------ paginile 404

async function metaFormat(adresa: string): Promise<{ status: number; lang: string | null; meta: string[] }> {
  const r = await fetch(adresa)
  const html = await r.text()
  const meta = [...html.matchAll(/<meta\b[^>]*>/g)].map((x) => x[0]).filter((x) => /name="format-detection"/.test(x))
  return { status: r.status, lang: (/<html\b[^>]*\blang="([^"]+)"/.exec(html) ?? [])[1] ?? null, meta }
}

test('paginile 404 ale ambelor editii, pe ambele copii, opresc detectarea numerelor de telefon', async () => {
  for (const c of COPII) {
    for (const cai of [c.en, c.ro]) {
      const m = await metaFormat(c.copie().baza + cai.negasit)
      console.log('[404] ' + c.nume + ' ' + cai.negasit + ' ' + JSON.stringify(m))
      expect(m.status).toBe(404)
      expect(m.lang?.split('-')[0]).toBe(cai.lang)
      expect(m.meta.length).toBe(1)
      expect(m.meta[0]).toContain('content="telephone=no"')
    }
  }
})

test('martor POZITIV: aceeasi citire gaseste meta-ul pe start; martor NEGATIV: pe /robots.txt nu gaseste nimic', async () => {
  const start = await metaFormat(comro.baza + '/')
  expect(start.meta.length).toBe(1)
  const robots = await metaFormat(comro.baza + '/robots.txt')
  expect(robots.status).toBe(200)
  expect(robots.meta).toEqual([])
})

// ------------------------------------------------------------------------------------------------ tiparul startului

type MasuraTipar = { tema: string | null; textDeschis: number; textFaraExact: string[]; strat: string; rezumate: { deschis: boolean; display: string; inaltime: number }[] }

async function masoaraTiparStart(page: Page): Promise<MasuraTipar> {
  return page.evaluate(() => {
    const lum = (c: string) => {
      const m = c.match(/[\d.]+/g)
      if (!m) return 0
      const [r, g, b] = m.slice(0, 3).map((v) => {
        const s = Number(v) / 255
        return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
      })
      return 0.2126 * r + 0.7152 * g + 0.0722 * b
    }
    const s = document.querySelector('section[data-ciot="constructor"]') as HTMLElement
    const deschise = [...s.querySelectorAll<HTMLElement>('*')].filter((e) => {
      const propriu = [...e.childNodes].some((n) => n.nodeType === 3 && (n as Text).data.trim())
      const r = e.getBoundingClientRect()
      return propriu && r.width > 0 && lum(getComputedStyle(e).color) > 0.6
    })
    const strat = s.querySelector(':scope > [aria-hidden="true"]') as HTMLElement
    // Pagina are doua machete (desktop si pista de telefon), una ascunsa: se masoara cea afisata.
    const rezumate = [...document.querySelectorAll<HTMLElement>('[data-rand]')]
      .filter((b) => b.getBoundingClientRect().width > 0)
      .map((b) => {
        const z = b.nextElementSibling as HTMLElement
        const continut = z.firstElementChild as HTMLElement | null
        return { deschis: !z.hasAttribute('aria-hidden'), display: getComputedStyle(z).display, inaltime: Math.round(continut?.scrollHeight ?? 0) }
      })
    return {
      tema: s.getAttribute('data-tema'),
      textDeschis: deschise.length,
      textFaraExact: deschise.filter((e) => getComputedStyle(e).printColorAdjust !== 'exact').map((e) => (e.textContent ?? '').trim().slice(0, 30)),
      strat: getComputedStyle(strat).printColorAdjust,
      rezumate,
    }
  })
}

async function laConstructor(page: Page, adresa: string): Promise<void> {
  await deschide(page, adresa, 718)
  const s = page.locator('section[data-ciot="constructor"]')
  await s.evaluate((e) => e.scrollIntoView({ block: 'start', behavior: 'instant' as ScrollBehavior }))
  await expect(s).toHaveAttribute('data-tema', 'inchisa')
}

/** Scoate regulile de tipar ale feliei (cele doua din blocul `@media print` al foii globale), nu tot blocul. */
async function faraReguliTipar(page: Page): Promise<number> {
  return page.evaluate(() => {
    let scoase = 0
    for (const foaie of [...document.styleSheets]) {
      let reguli: CSSRuleList
      try {
        reguli = foaie.cssRules
      } catch {
        continue
      }
      for (const r of [...reguli]) {
        if (!(r instanceof CSSMediaRule) || !r.conditionText.includes('print')) continue
        for (let i = r.cssRules.length - 1; i >= 0; i--) {
          const t = r.cssRules[i].cssText
          if (t.includes('data-tema="inchisa"') || t.includes('[data-rand]')) {
            r.deleteRule(i)
            scoase++
          }
        }
      }
    }
    return scoase
  })
}

test.describe('tiparul startului', () => {
  for (const c of COPII) {
    test(c.nume + ': startul derulat pana la constructor, in print, tipareste tema inchisa si numai rezumatul deschis, pe EN si RO', async ({ page }, info) => {
      test.setTimeout(120_000)
      for (const [limba, cai] of [
        ['EN', c.en],
        ['RO', c.ro],
      ] as const) {
        await laConstructor(page, c.copie().baza + cai.start)
        await page.emulateMedia({ media: 'print' })
        const m = await masoaraTiparStart(page)
        console.log('[tipar start] ' + c.nume + ' ' + limba + ' ' + JSON.stringify(m))
        expect(m.tema).toBe('inchisa')
        expect(m.textDeschis).toBeGreaterThan(0)
        expect(m.textFaraExact, 'text deschis care s-ar tipari fara fondul lui').toEqual([])
        expect(m.strat).toBe('exact')
        expect(m.rezumate.length).toBeGreaterThan(1)
        expect(m.rezumate.filter((x) => !x.deschis && x.display !== 'none').length, 'rezumate inchise in pagina').toBe(0)
        expect(m.rezumate.filter((x) => x.deschis && x.display !== 'none').length, 'rezumatul deschis').toBe(1)
        const pdf = await page.pdf({ format: 'A4', printBackground: false })
        expect(pdf.length).toBeGreaterThan(1000)
        const nume = 'tipar-start-fara-fundal-' + c.nume + '-' + limba + '.pdf'
        await info.attach(nume, { body: pdf, contentType: 'application/pdf' })
        writeFileSync(info.outputPath(nume), pdf)
        await page.emulateMedia({ media: 'screen' })
      }
    })
  }

  test('martor POZITIV: cu regulile de tipar ale feliei scoase, textul constructorului e la economy si rezumatele inchise raman', async ({ page }) => {
    test.setTimeout(60_000)
    await laConstructor(page, comro.baza + '/')
    expect(await faraReguliTipar(page)).toBe(2)
    await page.emulateMedia({ media: 'print' })
    const m = await masoaraTiparStart(page)
    console.log('[tipar start martor+] ' + JSON.stringify(m))
    expect(m.textFaraExact.length).toBeGreaterThan(0)
    expect(m.strat).not.toBe('exact')
    expect(m.rezumate.filter((x) => !x.deschis && x.display !== 'none' && x.inaltime > 0).length).toBeGreaterThan(0)
  })

  test('martor NEGATIV: pe ecran nimic nu se schimba, rezumatele inchise raman in DOM si sectiunea la economy', async ({ page }) => {
    test.setTimeout(60_000)
    await laConstructor(page, md.baza + '/')
    const m = await masoaraTiparStart(page)
    console.log('[tipar start martor-] ' + JSON.stringify(m))
    expect(m.strat).not.toBe('exact')
    expect(m.rezumate.filter((x) => !x.deschis && x.display === 'none')).toEqual([])
  })
})
