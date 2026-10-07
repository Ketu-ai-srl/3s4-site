import { join } from 'node:path'
import type { Browser, Page } from '@playwright/test'
import { expect, test } from './ajutor/baza'
import { cuFoileDeStil, foiLipsa, urmaresteFoile } from './ajutor/foi-de-stil'
import { mediuProfil3sMd, pornesteCopia3sMd, type Copie3sMd } from './ajutor/copie-3s-md'
import { RADACINA } from './ajutor/proiect'
import { CONTRAST_POVESTE, EROU_POVESTE, EXTRAGERE_POVESTE, LUMINA_POVESTE } from '../../src/content/en/features-search'

/**
 * GLOSA EN A DEMONSTRATIEI DE CAUTARE (felia 137, decizia 75 "Romana + glosa EN"), pe paginile SERVITE ale ambelor
 * domenii: copia 3s.md (`/features/search`) si copia 3s.com.ro (`/en/features/search`, aceeasi pagina sub asezarea
 * romaneasca), ambele construite cu profilul aplicatiei lor (`ajutor/copie-3s-md.ts`); build-ul real al probelor e cel
 * romanesc, unde pagina EN nu exista. O singura copie e vie odata: blocul 3s.md isi opreste copia inainte ca blocul
 * 3s.com.ro sa o construiasca pe a lui.
 *
 * CE SE CERE, la 1440 si la 390, la miscare redusa (forma statica, cum o vede si un robot):
 *   - exact cinci glose in `<main>`, in ordine: sub terminalul eroului, sub bara din lumina, sub cardul extragerii si,
 *     sub desenul "Acum" din contrast, intrebarea apoi raspunsul (text HTML); fiecare cu `lang="en"`, in afara oricarui
 *     stramos `lang="ro"`, cu textul din modulul EN;
 *   - fiecare SUB bucata pe care o traduce (terminalul, bara, cardul; sub desen, intrebarea sub desen si raspunsul sub
 *     glosa intrebarii): incepe sub ea, la cel mult `DEPARTARE_MAX` px, iar textul ei porneste unde porneste textul
 *     romanesc (`ALINIERE_PX`; sub desen, textul din cardul desenului, x 26 din 280);
 *   - lizibila: corp pe ecran de cel putin `CORP_MIN_PX` (masurat; in SVG, la 390, glosa desenului avea ~8,9 px);
 *   - subordonata vizual: culoarea textului secundar al ACELEIASI sectiuni (in erou indiciul de derulare, sub bara
 *     indicatia, sub card legenda, la desen nota raspunsului), citita din pagina, nu scrisa aici; corp mai mic decat
 *     textul romanesc in erou, lumina si extragere; la desen corpul celorlalte glose (textele desenului au pe ecran
 *     ~10 px la 390 si ~12,6 px la 1440, deci o glosa lizibila nu poate fi mai mica decat ele: subordonarea acolo e
 *     culoarea si locul, sub desen, in afara lui); contrast AA (4,5:1) pe fundalul efectiv (straturile compuse, ca in
 *     `en-produs.spec.ts`);
 *   - glosa din erou e pe PRIMUL ECRAN (prima aparitie a intrebarii): se termina deasupra marginii de jos a ferestrei;
 *   - sub desen, glosele nu acopera desenul si nu ies din latimea lui; textele romanesti ale desenului SE VAD (premisa
 *     glosei de sub desen: caseta nevida, opacitate 1, umplere nevida).
 * CU MISCARE, la 1440: glosa din erou e ascunsa cat intrebarea se scrie si apare dupa, fara sa-si schimbe locul; glosa
 * intrebarii din lumina e ascunsa cat intrebarea se scrie si apare dupa; glosa raspunsului intra odata cu cardul; locul
 * glosei intrebarii din lumina nu se misca (celula barei isi rezerva inaltimea).
 * MARTORUL NEGATIV: paginile romanesti ale cautarii (RO pe build-ul probelor; `/ro/functionalitati/cautare-ai` pe
 * 3s.md; aceeasi pagina la radacina pe 3s.com.ro) au demonstratia si zero glose.
 * MARTORUL POZITIV: o culoare slaba injectata coboara contrastul sub prag, o glosa mutata sub `lang="ro"` si una
 * dezaliniata sunt acuzate, iar la desen o glosa mutata peste desen, una cu alta culoare si una cu corpul din SVG.
 *
 * Ce NU masoara: sensul traducerii (citit de om; ancorele mecanice sunt in `tests/glosa-demo-cautare.test.ts`), fluxul
 * RSC al build-ului RO (invarianta pe build) si contrastul pe PIXELI peste forma din hartii a eroului (aici fundalul e
 * cel calculat din straturile CSS; forma e o panza sub text, iar textele secundare ale eroului au masuratoarea lor pe
 * pixeli in `EroulCinema.module.css`, a carei culoare o foloseste si glosa).
 */

const LATIMI = [1440, 390] as const
const PRAG_CONTRAST = 4.5
/** Glosa incepe sub bucata tradusa, la cel mult atatia pixeli (marginea ei e 12, iar 4 intre glosele desenului). */
const DEPARTARE_MAX = 24
/** Corpul minim pe ecran al unei glose, masurat (constatarea criticului: ~8,9 px in SVG la 390). */
const CORP_MIN_PX = 12
/** Textul glosei porneste unde porneste textul romanesc, cu rotunjirea subpixelilor. */
const ALINIERE_PX = 2

/** Glosele asteptate, in ordinea din pagina: sectiunea si rolul, cu textul din modul. */
const GLOSE: [string, string][] = [
  ['erou/intrebare', EROU_POVESTE.glosa.text],
  ['lumina/intrebare', LUMINA_POVESTE.glosa.text],
  ['extragere/raspuns', EXTRAGERE_POVESTE.glosa.text],
  ['contrast/intrebare', CONTRAST_POVESTE.acum.glosa.intrebare],
  ['contrast/raspuns', CONTRAST_POVESTE.acum.glosa.raspuns],
]

type Glosa = {
  id: string
  lang: string | null
  text: string
  subRo: boolean
  /** Sus-ul glosei minus jos-ul bucatii traduse (terminalul, bara, cardul; desenul, apoi glosa intrebarii lui). */
  departare: number
  /** Inceputul textului glosei minus inceputul textului romanesc. */
  aliniere: number
  marime: number
  marimeOriginal: number
  culoare: string
  culoareSecundara: string
  contrast: number
  opacitate: number
  /** Jos-ul glosei minus inaltimea ferestrei, cu pagina sus (numai erou; negativ = pe primul ecran). */
  pestePrimulEcran: number
  /** La desen: daca glosa acopera desenul sau iese din latimea lui. */
  suprapuneri: string[]
  /** Corpul pe ecran, in pixeli (un text din SVG: corpul din desen inmultit cu scara lui). */
  corpPeEcran: number
}

type Masura = {
  glose: Glosa[]
  demonstratie: boolean
  /** Textele romanesti ale desenului "Acum" (cele cu `lang="ro"`), cu vizibilitatea lor. */
  desenRo: { text: string; vizibil: boolean }[]
}

/** Ruleaza in pagina: glosele din `<main>`, cu locul, stilul si contrastul lor. Nu foloseste nimic din afara corpului. */
function masoaraGlose(): Masura {
  const main = document.querySelector('main')
  const erou = document.querySelector('main section[data-sectiune="erou"]')
  const terminal = erou?.querySelector('[data-terminal]') ?? null
  const bara = document.querySelector('main [data-macheta="bara-cautare"]')
  const card = document.querySelector('main [data-macheta="extragere"]')
  // Desenul "Acum": desenul din contrast care are texte (cel "Inainte" are numai semne de intrebare).
  const desen =
    [...document.querySelectorAll('main section[data-sectiune="contrast"] svg[role="img"]')].find((s) =>
      [...s.querySelectorAll('text')].some((t) => (t.textContent ?? '').trim().length > 3),
    ) ?? null
  const demonstratie = main !== null && terminal !== null && bara !== null && card !== null && desen !== null
  if (main === null) return { glose: [], demonstratie, desenRo: [] }
  const panza = document.createElement('canvas')
  panza.width = 1
  panza.height = 1
  const ctx = panza.getContext('2d', { willReadFrequently: true })
  const rgba = (c: string): [number, number, number, number] => {
    if (ctx === null) return [0, 0, 0, 0]
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
  const esteSvg = (el: Element) => el instanceof SVGElement
  /** Culoarea textului: `fill` in desen, `color` in HTML. */
  const culoareText = (el: Element) => (esteSvg(el) ? getComputedStyle(el).fill : getComputedStyle(el).color)
  const opacitateEfectiva = (el: Element) => {
    let o = 1
    for (let n: Element | null = el; n !== null; n = n.parentElement) o *= Number(getComputedStyle(n).opacity)
    return o
  }
  const contrast = (el: Element): { raport: number; opacitate: number } => {
    const straturi: [number, number, number, number][] = []
    for (let n: Element | null = el; n !== null; n = n.parentElement) {
      const f = rgba(getComputedStyle(n).backgroundColor)
      if (f[3] > 0 && straturi.every((s) => s[3] < 1)) straturi.push(f)
    }
    let fundal: [number, number, number] = [255, 255, 255]
    for (let i = straturi.length - 1; i >= 0; i--) fundal = peste(straturi[i], fundal)
    const opacitate = opacitateEfectiva(el)
    const t = rgba(culoareText(el))
    const a = lum(peste([t[0], t[1], t[2], t[3] * opacitate], fundal))
    const b = lum(fundal)
    return { raport: Math.round(((Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)) * 100) / 100, opacitate }
  }
  /** Marginea din stanga a continutului (de unde porneste textul aliniat la stanga); in desen, caseta textului. */
  const stangaContinut = (el: Element) => {
    if (esteSvg(el)) return el.getBoundingClientRect().left
    const st = getComputedStyle(el)
    return el.getBoundingClientRect().left + parseFloat(st.borderLeftWidth) + parseFloat(st.paddingLeft)
  }
  const seIntersecteaza = (a: DOMRect, b: DOMRect) => a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom
  const textRo = desen === null ? [] : [...desen.querySelectorAll('text[lang="ro"]')]
  const nota = textRo.find((t) => rgba(getComputedStyle(t).fill)[3] < 1) ?? null
  const scara = desen === null ? 1 : desen.getBoundingClientRect().width / 280

  const glose = [...main.querySelectorAll('[data-glosa]')].map((g): Glosa => {
    const loc = g.closest('[data-sectiune]')?.getAttribute('data-sectiune') ?? '?'
    const rol = g.getAttribute('data-glosa') ?? ''
    let tradus: Element | null = null
    let original: Element | null = null
    let secundar: Element | null = null
    const suprapuneri: string[] = []
    if (loc === 'erou') {
      tradus = terminal
      original = terminal?.querySelector('[data-scriere]') ?? null
      secundar = erou?.querySelector('[data-indiciu]') ?? null
    } else if (loc === 'lumina') {
      tradus = bara
      original = bara?.querySelector('[data-scriere]') ?? null
      secundar = g.nextElementSibling
    } else if (loc === 'extragere') {
      tradus = card
      original = card?.querySelector('blockquote') ?? null
      secundar = g.nextElementSibling
    } else if (desen !== null) {
      // Sub desen, ca text HTML: intrebarea imediat sub desen, raspunsul imediat sub glosa intrebarii. Textul amandurora
      // porneste cu textul din cardul desenului (inceputul raspunsului, al doilea text romanesc, x 26 din 280).
      original = textRo[1] ?? null
      tradus = rol === 'intrebare' ? desen : g.previousElementSibling
      secundar = nota
      const r = g.getBoundingClientRect()
      const d = desen.getBoundingClientRect()
      if (seIntersecteaza(r, d)) suprapuneri.push('acopera desenul')
      if (r.left < d.left - 0.5 || r.right > d.right + 0.5) suprapuneri.push('iese din latimea desenului')
    }
    const c = contrast(g)
    const marime = parseFloat(getComputedStyle(g).fontSize)
    return {
      id: loc + '/' + rol,
      lang: g.getAttribute('lang'),
      text: (g.textContent ?? '').trim(),
      subRo: (g.parentElement?.closest('[lang^="ro"]') ?? null) !== null,
      departare: tradus ? g.getBoundingClientRect().top - tradus.getBoundingClientRect().bottom : Number.NaN,
      aliniere: original ? stangaContinut(g) - stangaContinut(original) : Number.NaN,
      marime,
      marimeOriginal: original ? Math.round(parseFloat(getComputedStyle(original).fontSize) * (esteSvg(original) ? scara : 1) * 100) / 100 : Number.NaN,
      culoare: culoareText(g),
      culoareSecundara: secundar ? culoareText(secundar) : '',
      contrast: c.raport,
      opacitate: c.opacitate,
      pestePrimulEcran: g.getBoundingClientRect().bottom + window.scrollY - window.innerHeight,
      suprapuneri,
      corpPeEcran: Math.round((esteSvg(g) ? marime * scara : marime) * 100) / 100,
    }
  })
  const desenRo = textRo.map((t) => {
    const r = t.getBoundingClientRect()
    const st = getComputedStyle(t)
    const vizibil = r.width > 0 && r.height > 0 && opacitateEfectiva(t) === 1 && st.visibility === 'visible' && rgba(st.fill)[3] > 0
    return { text: (t.textContent ?? '').trim(), vizibil }
  })
  return { glose, demonstratie, desenRo }
}

/** Abaterile de la ce cere decizia 75, pe masurile unei pagini EN; lista goala = conform. */
function abateri(m: Masura): string[] {
  const a: string[] = []
  if (!m.demonstratie) a.push('pagina nu are demonstratia (terminalul, bara, cardul si desenul)')
  const ordine = m.glose.map((g) => g.id).join(',')
  const asteptat = GLOSE.map(([id]) => id).join(',')
  if (ordine !== asteptat) a.push('glosele: [' + ordine + '], nu [' + asteptat + ']')
  // Premisa glosei din desen: textele romanesti ale desenului se vad (intrebarea, raspunsul, nota, sursa).
  if (m.desenRo.length !== 4 || m.desenRo.some((t) => !t.vizibil)) a.push('textele romanesti ale desenului: ' + JSON.stringify(m.desenRo))
  for (const g of m.glose) {
    const asteptata = GLOSE.find(([id]) => id === g.id)?.[1]
    if (g.lang !== 'en') a.push(g.id + ': lang ' + g.lang)
    if (g.subRo) a.push(g.id + ': sta sub un stramos lang="ro"')
    if (asteptata === undefined || g.text !== asteptata) a.push(g.id + ': textul nu e cel din modul')
    if (!(g.departare >= 0 && g.departare <= DEPARTARE_MAX)) a.push(g.id + ': nu incepe sub bucata tradusa (departare ' + g.departare.toFixed(1) + ' px)')
    if (!(Math.abs(g.aliniere) <= ALINIERE_PX)) a.push(g.id + ': textul nu porneste cu originalul (abatere ' + g.aliniere.toFixed(1) + ' px)')
    if (!(g.corpPeEcran >= CORP_MIN_PX)) a.push(g.id + ': corpul pe ecran ' + g.corpPeEcran + ' px, sub ' + CORP_MIN_PX)
    if (g.id.startsWith('contrast/')) {
      // La desen: corpul celorlalte glose (al glosei din extragere), nu mai mic decat textele desenului (vezi antetul).
      const ref = m.glose.find((x) => x.id === 'extragere/raspuns')?.marime ?? Number.NaN
      if (!(Math.abs(g.marime - ref) <= 0.1)) a.push(g.id + ': corpul ' + g.marime + ', nu al celorlalte glose ' + ref)
    } else if (!(g.marime < g.marimeOriginal)) a.push(g.id + ': corpul ' + g.marime + ' nu e mai mic decat originalul ' + g.marimeOriginal)
    if (g.culoare !== g.culoareSecundara) a.push(g.id + ': culoarea ' + g.culoare + ', nu a textului secundar ' + g.culoareSecundara)
    if (!(g.contrast >= PRAG_CONTRAST)) a.push(g.id + ': contrast ' + g.contrast + ' sub ' + PRAG_CONTRAST)
    if (g.opacitate !== 1) a.push(g.id + ': opacitate ' + g.opacitate + ' in forma statica')
    if (g.id.startsWith('erou/') && !(g.pestePrimulEcran <= 0)) a.push(g.id + ': nu e pe primul ecran (iese cu ' + g.pestePrimulEcran.toFixed(1) + ' px)')
    if (g.suprapuneri.length > 0) a.push(g.id + ': ' + g.suprapuneri.join('; '))
  }
  return a
}

async function masoara(page: Page, adresa: string, latime: number): Promise<Masura> {
  await page.setViewportSize({ width: latime, height: latime === 390 ? 844 : 900 })
  // O incarcare fara toate foile de stil masoara alta pagina (vezi `ajutor/foi-de-stil.ts`): nu se masoara, se reia.
  // Lotul s4-12k (CI 37577265527) a picat aici pe copia 3s.com.ro la 1440 cu semnatura paginii fara foi: originalul din
  // erou cu corpul implicit de 16 px (18,4 cu foaia), glosa la 413 px de el, textele desenului la 31,5 px (12,61 cu foaia);
  // aceeasi proba, pe acelasi arbore fara felia 146 (un singur rand, titlul startului RO), a trecut in 37577237115.
  return cuFoileDeStil('glosa ' + adresa + ' @' + latime, async () => {
    const foi = urmaresteFoile(page)
    await page.goto(adresa, { waitUntil: 'load' })
    expect(await page.evaluate(() => window.innerWidth), 'innerWidth citit din pagina').toBe(latime)
    const lipsa = await foiLipsa(page)
    return { rezultat: await page.evaluate(masoaraGlose), lipsa, probleme: foi.probleme }
  })
}

/** Abaterile paginii EN a unui domeniu, la 1440 si la 390, cu masurile in jurnal. */
async function abateriDomeniu(page: Page, domeniu: string, adresa: string): Promise<string[]> {
  const toate: string[] = []
  for (const latime of LATIMI) {
    const m = await masoara(page, adresa, latime)
    console.log(
      '[glosa ' + domeniu + ' @' + latime + '] ' +
        m.glose
          .map(
            (g) =>
              g.id + ' lang=' + g.lang + ' departare=' + g.departare.toFixed(1) + ' aliniere=' + g.aliniere.toFixed(2) + ' corp=' + g.marime + '/' + g.marimeOriginal +
              ' pe ecran=' + g.corpPeEcran + ' culoare=' + g.culoare + ' contrast=' + g.contrast + (g.id.startsWith('erou/') ? ' jos-fereastra=' + g.pestePrimulEcran.toFixed(1) : ''),
          )
          .join(' | ') +
        ' | desen RO vizibil ' + m.desenRo.filter((t) => t.vizibil).length + '/' + m.desenRo.length,
    )
    toate.push(...abateri(m).map((x) => domeniu + ' @' + latime + ': ' + x))
  }
  return toate
}

/** O pagina romaneasca a cautarii: 200, demonstratia pe pagina, zero glose si zero texte ale glosei. */
async function faraGlosa(page: Page, nume: string, adresa: string): Promise<void> {
  const r = await page.goto(adresa, { waitUntil: 'load' })
  expect(r?.status(), nume).toBe(200)
  const m = await page.evaluate(masoaraGlose)
  const texte = GLOSE.map(([, t]) => t)
  const textGlose = await page.evaluate((t) => t.filter((x) => (document.querySelector('main')?.textContent ?? '').includes(x)), texte)
  console.log('[glosa martor negativ] ' + nume + ': demonstratie ' + m.demonstratie + ', glose ' + m.glose.length + ', texte ale glosei ' + textGlose.length)
  expect(m.demonstratie, nume + ': terminalul, bara, cardul si desenul sunt pe pagina').toBe(true)
  expect(m.glose, nume).toEqual([])
  expect(textGlose, nume).toEqual([])
}

/** Ceasul de derulare pornit: fiecare sectiune cu progres are `--p` scris ca stil (dupa hidratare). */
async function asteaptaCeasul(page: Page): Promise<void> {
  await page.waitForFunction(
    () => {
      const s = [...document.querySelectorAll<HTMLElement>('main section[data-sectiune]')].filter((x) => x.getAttribute('data-sectiune') !== 'erou')
      return s.length > 0 && s.every((x) => x.style.getPropertyValue('--p') !== '')
    },
    undefined,
    { timeout: 15_000 },
  )
}

/** Deruleaza sectiunea `nume` la progresul `p`: p = (0,5 vh - top) / inaltime (sablonul sectiunilor cinema). */
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

/** Opacitatea efectiva a glosei dintr-o sectiune (elementul si stramosii) si locul ei in asezare (fara transformari). */
async function stare(page: Page, sectiune: string, rol: string): Promise<{ opacitate: number; loc: number }> {
  return page.evaluate(
    ({ sectiune, rol }) => {
      const g = document.querySelector('main section[data-sectiune="' + sectiune + '"] [data-glosa="' + rol + '"]') as HTMLElement | null
      if (g === null) return { opacitate: Number.NaN, loc: Number.NaN }
      let opacitate = 1
      for (let n: Element | null = g; n !== null; n = n.parentElement) opacitate *= Number(getComputedStyle(n).opacity)
      let loc = 0
      for (let n: HTMLElement | null = g; n !== null; n = n.offsetParent as HTMLElement | null) loc += n.offsetTop
      return { opacitate, loc }
    },
    { sectiune, rol },
  )
}

async function cuMiscare(browser: Browser): Promise<Page> {
  const ctx = await browser.newContext({ reducedMotion: 'no-preference', viewport: { width: 1440, height: 900 } })
  return ctx.newPage()
}

test.describe('copia 3s.md', () => {
  let md: Copie3sMd

  test.beforeAll(async () => {
    test.setTimeout(600_000)
    md = await pornesteCopia3sMd()
  })

  test.afterAll(async () => {
    await md?.opreste()
  })

  test('/features/search la 1440 si 390: cinci glose lang="en", sub bucata tradusa, aliniate cu textul ei, corp lizibil si subordonat, culoarea textului secundar, contrast AA; glosa eroului pe primul ecran', async ({ page }) => {
    test.setTimeout(120_000)
    expect(await abateriDomeniu(page, '3s.md', md.baza + '/features/search')).toEqual([])
  })

  test('cu miscare, 1440: glosa eroului si a barei apar dupa ce intrebarea s-a scris, fara sa se mute; glosa raspunsului odata cu cardul', async ({ browser }) => {
    test.setTimeout(120_000)
    const page = await cuMiscare(browser)
    try {
      await page.goto(md.baza + '/features/search', { waitUntil: 'load' })
      // Eroul: inainte de hidratare si cat se scrie intrebarea, glosa e ascunsa; dupa scriere intra.
      await expect.poll(async () => (await stare(page, 'erou', 'intrebare')).opacitate, { message: 'glosa eroului ascunsa cat intrebarea se scrie', timeout: 5000 }).toBe(0)
      const inainteErou = (await stare(page, 'erou', 'intrebare')).loc
      await expect.poll(async () => (await stare(page, 'erou', 'intrebare')).opacitate, { message: 'glosa eroului vizibila dupa scriere', timeout: 15_000 }).toBe(1)
      const dupaErou = (await stare(page, 'erou', 'intrebare')).loc
      console.log('[glosa cu miscare] locul glosei eroului: ' + inainteErou + ' -> ' + dupaErou)
      expect(Math.abs(dupaErou - inainteErou), 'locul glosei eroului (ascunsa cu opacitate, nu scoasa din asezare)').toBeLessThanOrEqual(0.5)
      await asteaptaCeasul(page)
      await laProgres(page, 'lumina', 0.2)
      await expect.poll(async () => (await stare(page, 'lumina', 'intrebare')).opacitate, { message: 'glosa barei ascunsa cat intrebarea se scrie (p 0,2)', timeout: 5000 }).toBe(0)
      const inainte = (await stare(page, 'lumina', 'intrebare')).loc
      await laProgres(page, 'lumina', 0.7)
      await expect.poll(async () => (await stare(page, 'lumina', 'intrebare')).opacitate, { message: 'glosa barei vizibila dupa scriere (p 0,7)', timeout: 5000 }).toBe(1)
      const dupa = (await stare(page, 'lumina', 'intrebare')).loc
      console.log('[glosa cu miscare] locul glosei barei: ' + inainte + ' -> ' + dupa)
      expect(Math.abs(dupa - inainte), 'locul glosei barei (rezervat sub bara)').toBeLessThanOrEqual(0.5)
      await laProgres(page, 'extragere', 0.2)
      await expect.poll(async () => (await stare(page, 'extragere', 'raspuns')).opacitate, { message: 'glosa raspunsului ascunsa inaintea cardului (p 0,2)', timeout: 5000 }).toBe(0)
      await laProgres(page, 'extragere', 0.6)
      await expect.poll(async () => (await stare(page, 'extragere', 'raspuns')).opacitate, { message: 'glosa raspunsului vizibila odata cu cardul (p 0,6)', timeout: 5000 }).toBe(1)
    } finally {
      await page.context().close()
    }
  })

  test('martor POZITIV: pe pagina servita, o culoare slaba, o glosa sub lang="ro", o glosa dezaliniata, o glosa a desenului peste desen, una cu alta culoare si una cu corpul din SVG sunt acuzate', async ({ page }) => {
    // Incarcarea de pornire trece prin garda foilor de stil (`masoara`): pagina neatinsa trebuie sa fie chiar pagina construita.
    expect(abateri(await masoara(page, md.baza + '/features/search', 1440)), 'pagina neatinsa e conforma').toEqual([])
    // Culoarea slaba se citeste din tokenii paginii, nu se scrie aici: textul de pe fundal deschis.
    await page.evaluate(() => {
      const slaba = getComputedStyle(document.documentElement).getPropertyValue('--color-ardezie-8').trim()
      ;(document.querySelector('main section[data-sectiune="erou"] [data-glosa]') as HTMLElement).style.color = slaba
    })
    expect(abateri(await page.evaluate(masoaraGlose))).toContainEqual(expect.stringContaining('erou/intrebare: contrast'))
    await page.reload({ waitUntil: 'load' })
    await page.evaluate(() => {
      const g = document.querySelector('main section[data-sectiune="extragere"] [data-glosa]') as HTMLElement
      const invelis = document.createElement('div')
      invelis.setAttribute('lang', 'ro')
      g.replaceWith(invelis)
      invelis.appendChild(g)
    })
    expect(abateri(await page.evaluate(masoaraGlose))).toContainEqual(expect.stringContaining('extragere/raspuns: sta sub un stramos lang="ro"'))
    await page.reload({ waitUntil: 'load' })
    await page.evaluate(() => {
      ;(document.querySelector('main section[data-sectiune="erou"] [data-glosa]') as HTMLElement).style.paddingLeft = '0px'
    })
    expect(abateri(await page.evaluate(masoaraGlose))).toContainEqual(expect.stringContaining('erou/intrebare: textul nu porneste cu originalul'))
    await page.reload({ waitUntil: 'load' })
    await page.evaluate(() => {
      ;(document.querySelector('main section[data-sectiune="contrast"] [data-glosa="intrebare"]') as HTMLElement).style.marginTop = '-100px'
    })
    expect(abateri(await page.evaluate(masoaraGlose))).toContainEqual(expect.stringContaining('contrast/intrebare: acopera desenul'))
    await page.reload({ waitUntil: 'load' })
    await page.evaluate(() => {
      // Culoarea textului principal al desenului (alb aproape plin), citita din pagina.
      const g = document.querySelector('main section[data-sectiune="contrast"] [data-glosa="raspuns"]') as HTMLElement
      const principal = document.querySelector('main section[data-sectiune="contrast"] text[lang="ro"]') as SVGTextElement
      g.style.color = getComputedStyle(principal).fill
    })
    expect(abateri(await page.evaluate(masoaraGlose))).toContainEqual(expect.stringContaining('contrast/raspuns: culoarea'))
    await page.reload({ waitUntil: 'load' })
    await page.evaluate(() => {
      // Corpul pe care il avea glosa in SVG la 390 (~8,9 px), pus pe glosa HTML.
      ;(document.querySelector('main section[data-sectiune="contrast"] [data-glosa="raspuns"]') as HTMLElement).style.fontSize = '8.9px'
    })
    expect(abateri(await page.evaluate(masoaraGlose))).toContainEqual(expect.stringContaining('contrast/raspuns: corpul pe ecran 8.9 px'))
  })

  test('martor NEGATIV: /ro/functionalitati/cautare-ai pe 3s.md si /functionalitati/cautare-ai pe build-ul RO al probelor au demonstratia si zero glose', async ({ page, baseURL }) => {
    await faraGlosa(page, 'RO, build-ul probelor', baseURL + '/functionalitati/cautare-ai')
    await faraGlosa(page, '3s.md /ro', md.baza + '/ro/functionalitati/cautare-ai')
  })
})

test.describe('copia 3s.com.ro', () => {
  let comRo: Copie3sMd

  test.beforeAll(async () => {
    test.setTimeout(600_000)
    comRo = await pornesteCopia3sMd(mediuProfil3sMd(join(RADACINA, 'config', 'profil-3s-com-ro.json')))
  })

  test.afterAll(async () => {
    await comRo?.opreste()
  })

  test('/en/features/search la 1440 si 390: cinci glose lang="en", sub bucata tradusa, aliniate cu textul ei, corp lizibil si subordonat, culoarea textului secundar, contrast AA; glosa eroului pe primul ecran', async ({ page }) => {
    test.setTimeout(120_000)
    expect(await abateriDomeniu(page, '3s.com.ro', comRo.baza + '/en/features/search')).toEqual([])
  })

  test('martor NEGATIV: /functionalitati/cautare-ai pe 3s.com.ro (romana la radacina) are demonstratia si zero glose', async ({ page }) => {
    await faraGlosa(page, '3s.com.ro, la radacina', comRo.baza + '/functionalitati/cautare-ai')
  })
})
