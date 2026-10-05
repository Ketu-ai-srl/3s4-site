import { readFileSync } from 'node:fs'
import type { Page } from '@playwright/test'
import { join } from 'node:path'
import { expect, test } from './ajutor/baza'
import { pornesteCopia3sMd, type Copie3sMd } from './ajutor/copie-3s-md'
import { RADACINA } from './ajutor/proiect'
import { CTA_POVESTE, EROU_POVESTE, pagina as cautare } from '../../src/content/en/features-search'
import { SCENA_CAUTARE_3S_MD, SEMNE_3S_MD } from '../../src/content/functionalitati/cautare-ai-3s-md'
import type { PaginaContinut } from '../../src/content/model/tipuri'

/**
 * Paginile de produs EN ale lui 3s.md (felia en-produs: P03 `/features/search`; P04 a iesit prin decizia 49), pe COPIA
 * construita si servita cu variabilele aplicatiei 3s.md (`ajutor/copie-3s-md.ts`, profilul `config/profil-3s-md.json`):
 * build-ul real al probelor e cel romanesc, unde paginile EN nu exista.
 *
 * Ce se cere, pe fiecare pagina:
 *   - pe HTML-ul SERVIT (fara JavaScript): 200, `<html lang="en">`, un singur H1, egal cu eticheta eroului cinema,
 *     noindex pe staging, zero `<form`, zero `RON` ca cuvant;
 *   - CTA-ul WhatsApp duce la `wa.me` cu textul precompletat al paginii, care poarta `[ref:<ref>]` al ei (decodat
 *     inapoi si comparat cu modulul);
 *   - pe DOM-ul din browser: entitatile declaratiei G-AI-02 (`config/seo/en-produs.json`) si H1-ul in primele 400 de
 *     cuvinte din `<main>`.
 * Plus: paginile P05-P07, scoase de la lansare (decizia 43), si P04 `/features/whatsapp` (decizia 49: asistentul pe
 * WhatsApp nu exista in platforma) raspund 404 cu pagina de negasit EN; harta de site si llms.txt nu mai au P04.
 *
 * AUTORIZARE (felia 105, decizia 53, intrebarea 5 varianta a): pagina compune povestea cinema a perechii RO
 * (`/functionalitati/cautare-ai`), deci doua asteptari ale formei vechi (`CorpPagina` cu erou si bloc de final) se
 * rescriu, cu motivul aici: (1) H1-ul e eticheta eroului cinema (`EROU_POVESTE`, legata cu punctul de mijloc), nu H1-ul
 * aprobat al corpului, care nu incape in cutia etichetei (fisa, camp A-adaptat); (2) in `<main>` e exact UN buton
 * WhatsApp, cel din CTA-ul cinema: eroul cinema n-are buton, nici pe perechea RO. Faptele raman neatinse: zero `<form`,
 * zero RON, `wa.me` cu textul si `ref`-ul paginii, 404 pe paginile scoase, harta si llms.txt. Plus, pe pagina noua:
 * scena romaneasca (intrebarea, pasajul citat, desenul "Acum") sta sub `lang="ro"` si nimic cu diacritice nu iese in
 * afara ei; nota de sub buton are contrast AA (4,5:1) pe fundalul cinema, la 390 si la 1440; niciun card-citat al
 * frustrarii nu sta peste text, la 390 si la 1440 (ordinea masurata cu elementFromPoint, nu geometria).
 *
 * CONTROALE. Expresiile care numara `<form`, `RON` si legaturile WhatsApp se probeaza intai pe un HTML asamblat
 * la rulare (un martor pozitiv si unul negativ, cu titlurile cerute de proba de completitudine); pe pagina reala, extragerea trebuie sa gaseasca cel putin un H1 si
 * exact o legatura WhatsApp, ca un zero sa nu poata veni dintr-o citire goala. Scena si contrastul au martorii lor,
 * pe pagina servita: scoaterea lui `lang` de pe pasajul citat scoate diacritice in afara; o culoare slaba injectata pe
 * nota coboara contrastul sub prag, iar albul plin il tine peste.
 */

type Declaratie = { intrebare: string; entitati: string[] }
const DECLARATII = (
  JSON.parse(readFileSync(join(RADACINA, 'config', 'seo', 'en-produs.json'), 'utf8')) as {
    raspuns_autonom: Record<string, Declaratie>
  }
).raspuns_autonom

const PAGINI: PaginaContinut[] = [cautare]
/** H1-ul paginii cinema: eticheta eroului, in doua bucati legate cu punctul de mijloc. */
const H1: Record<string, string> = {
  [cautare.meta.cale]: EROU_POVESTE.etichetaNumar + SEMNE_3S_MD.mijloc + EROU_POVESTE.etichetaNume,
}
const CALE_P04 = '/features/' + 'whats' + 'app'
const SCOASE: [string, string][] = [
  ['/features/mobile-app', 'decizia 43'],
  ['/features/client-portal', 'decizia 43'],
  ['/features/automations', 'decizia 43'],
  [CALE_P04, 'decizia 49'],
]

const MONEDA = new RegExp('\\b' + 'R' + 'ON' + '\\b')
const FORMULAR = new RegExp('<' + 'form\\b', 'i')

function hrefuriWhatsApp(html: string): string[] {
  return [...html.matchAll(/<a\b[^>]*\shref="(https:\/\/wa\.me\/[^"]*)"/g)].map((m) => m[1].split('&amp;').join('&'))
}

function textDinWa(href: string): string {
  return new URL(href).searchParams.get('text') ?? ''
}

let copie: Copie3sMd

async function servit(cale: string): Promise<{ status: number; html: string; robots: string }> {
  const r = await fetch(copie.baza + cale, { redirect: 'manual' })
  return {
    status: r.status,
    html: await r.text(),
    robots: r.headers.get('x-robots-tag') ?? '',
  }
}

test('martor POZITIV: formularul, moneda si legatura WhatsApp sunt prinse pe un HTML asamblat la rulare', () => {
  const href = 'https://wa.me/1?text=' + encodeURIComponent('Hello [ref:x-y].')
  const rau = '<main><' + 'form action="/a"></form><p>12 ' + 'R' + 'ON</p><a class="b" href="' + href + '">W</a></main>'
  expect(FORMULAR.test(rau)).toBe(true)
  expect(MONEDA.test(rau)).toBe(true)
  expect(hrefuriWhatsApp(rau).map(textDinWa)).toEqual(['Hello [ref:x-y].'])
})

test('martor NEGATIV: un HTML curat, cu cuvinte-capcana (ENVIRONMENT, PRONTO, formular), nu e acuzat', () => {
  const bun = '<main><p>From EUR 90, ENVIRONMENT, PRONTO, formular</p></main>'
  expect(FORMULAR.test(bun)).toBe(false)
  expect(MONEDA.test(bun)).toBe(false)
  expect(hrefuriWhatsApp(bun)).toEqual([])
})

test.beforeAll(async () => {
  test.setTimeout(600_000)
  copie = await pornesteCopia3sMd()
})

test.afterAll(async () => {
  await copie?.opreste()
})

test('preconditia: o pagina in grup (P04 a iesit, decizia 49), cu declaratia ei G-AI-02', () => {
  expect(PAGINI.map((p) => p.meta.cale)).toEqual(['/features/search'])
  expect(Object.keys(DECLARATII).sort()).toEqual(PAGINI.map((p) => p.meta.cale).sort())
})

for (const p of PAGINI) {
  test(p.meta.cale + ': 200, <html lang="en">, un H1, noindex, zero formulare, zero moneda romaneasca', async () => {
    const { status, html, robots } = await servit(p.meta.cale)
    expect(status).toBe(200)
    expect(html).toMatch(/<html[^>]*\blang="en"/)
    const h1 = [...html.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/g)].map((m) => m[1])
    expect(h1).toEqual([H1[p.meta.cale]])
    expect(robots).toContain('noindex')
    expect(FORMULAR.test(html)).toBe(false)
    expect(MONEDA.test(html)).toBe(false)
  })

  test(p.meta.cale + ': CTA-urile WhatsApp poarta textul paginii, cu [ref:' + p.cta.ref + ']', async () => {
    const { html } = await servit(p.meta.cale)
    const corp = html.slice(html.indexOf('<main'), html.indexOf('</main>'))
    const texte = hrefuriWhatsApp(corp).map(textDinWa)
    // Povestea cinema: un singur buton de canal, in CTA (eroul cinema n-are buton), cu textul paginii.
    expect(texte).toHaveLength(1)
    for (const t of texte) expect(t).toBe(p.cta.textWhatsapp)
    expect(p.cta.textWhatsapp).toContain('[ref:' + p.cta.ref + ']')
  })

  test(p.meta.cale + ': entitatile G-AI-02 si H1-ul in primele 400 de cuvinte din <main>', async ({ page }) => {
    await page.goto(copie.baza + p.meta.cale)
    const text = await page.locator('main').innerText()
    const fereastra = text.split(/\s+/).filter(Boolean).slice(0, 400).join(' ')
    expect(fereastra).toContain(H1[p.meta.cale])
    const decl = DECLARATII[p.meta.cale]
    const lipsa = decl.entitati.filter((e) => !fereastra.toLowerCase().includes(e.toLowerCase()))
    expect(lipsa).toEqual([])
  })
}

// ---------------------------------------------------------------------------------------------------------------------
// Felia 105: scena romaneasca sub `lang="ro"` si contrastul notei de sub buton, pe pagina servita
// ---------------------------------------------------------------------------------------------------------------------

const DIACRITICE_RO = /[ăâîșțşţĂÂÎȘȚŞŢ]/g

/** Ruleaza in pagina: textul vazut din `<main>` (cu etichetele accesibile), separat in afara si sub `[lang^="ro"]`. */
function textPeLimba(): { afara: string; subRo: string } {
  const main = document.querySelector('main')
  if (main === null) return { afara: '', subRo: '' }
  let afara = ''
  let subRo = ''
  const umbla = (n: Node, ro: boolean) => {
    if (n.nodeType === Node.TEXT_NODE) {
      if (ro) subRo += ' ' + (n.nodeValue ?? '')
      else afara += ' ' + (n.nodeValue ?? '')
      return
    }
    if (n.nodeType !== Node.ELEMENT_NODE) return
    const el = n as Element
    if (el.tagName === 'SCRIPT' || el.tagName === 'STYLE') return
    const aici = ro || /^ro(-|$)/.test(el.getAttribute('lang') ?? '')
    for (const a of ['aria-label', 'alt', 'title']) {
      const v = el.getAttribute(a)
      if (v) {
        if (aici) subRo += ' ' + v
        else afara += ' ' + v
      }
    }
    for (const c of Array.from(el.childNodes)) umbla(c, aici)
  }
  umbla(main, false)
  return { afara, subRo }
}

test('/features/search: scena romaneasca sta sub lang="ro" (intrebarea, pasajul citat, desenul); in afara ei, zero diacritice', async ({ page }) => {
  await page.goto(copie.baza + cautare.meta.cale)
  const { afara, subRo } = await page.evaluate(textPeLimba)
  for (const sir of [SCENA_CAUTARE_3S_MD.intrebare, SCENA_CAUTARE_3S_MD.citat, SCENA_CAUTARE_3S_MD.intrebareScurta, SCENA_CAUTARE_3S_MD.raspunsNota]) {
    expect(subRo, sir).toContain(sir)
  }
  expect(afara.match(DIACRITICE_RO) ?? []).toEqual([])
})

test('martor POZITIV: fara lang pe pasajul citat, diacriticele lui ies in afara scenei', async ({ page }) => {
  await page.goto(copie.baza + cautare.meta.cale)
  await page.evaluate(() => document.querySelector('main blockquote[lang]')?.removeAttribute('lang'))
  const { afara } = await page.evaluate(textPeLimba)
  expect((afara.match(DIACRITICE_RO) ?? []).length).toBeGreaterThan(0)
})

/** Ruleaza in pagina: contrastul WCAG 2.x al notei de sub butonul CTA, pe fundalul efectiv (straturile compuse). */
function contrastNota(text: string): { raport: number; culoare: string; fundal: string } | null {
  const el = [...document.querySelectorAll('main small')].find((x) => (x.textContent ?? '').trim() === text) as HTMLElement | undefined
  if (el === undefined) return null
  const panza = document.createElement('canvas')
  panza.width = 1
  panza.height = 1
  const ctx = panza.getContext('2d', { willReadFrequently: true })
  if (ctx === null) return null
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
  const straturi: [number, number, number, number][] = []
  let opacitate = 1
  for (let n: HTMLElement | null = el; n !== null; n = n.parentElement) {
    const st = getComputedStyle(n)
    opacitate *= Number(st.opacity)
    const f = rgba(st.backgroundColor)
    if (f[3] > 0 && straturi.every((s) => s[3] < 1)) straturi.push(f)
  }
  let fundal: [number, number, number] = [255, 255, 255]
  for (let i = straturi.length - 1; i >= 0; i--) fundal = peste(straturi[i], fundal)
  const t = rgba(getComputedStyle(el).color)
  const culoare = peste([t[0], t[1], t[2], t[3] * opacitate], fundal)
  const a = lum(culoare)
  const b = lum(fundal)
  const hex = (c: number[]) => '#' + c.map((v) => Math.round(v).toString(16).padStart(2, '0')).join('')
  return { raport: Math.round(((Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)) * 100) / 100, culoare: hex(culoare), fundal: hex(fundal) }
}

for (const latime of [390, 1440] as const) {
  test.describe('nota CTA la ' + latime, () => {
    test.use({ viewport: { width: latime, height: latime === 390 ? 844 : 900 } })

    test('/features/search la ' + latime + ': nota de sub butonul CTA are contrast >= 4,5:1 pe fundalul efectiv', async ({ page }) => {
      await page.goto(copie.baza + cautare.meta.cale)
      expect(await page.evaluate(() => innerWidth)).toBe(latime)
      const m = await page.evaluate(contrastNota, CTA_POVESTE.nota)
      console.log('[contrast nota ' + latime + '] ' + JSON.stringify(m))
      expect(m).not.toBeNull()
      expect(m!.raport, JSON.stringify(m)).toBeGreaterThanOrEqual(4.5)
    })

    test('martor POZITIV la ' + latime + ': o culoare slaba injectata pe nota coboara contrastul sub prag; martor NEGATIV: albul plin il tine peste', async ({ page }) => {
      await page.goto(copie.baza + cautare.meta.cale)
      await page.addStyleTag({ content: 'main small{color:rgba(255,255,255,0.2) !important}' })
      expect((await page.evaluate(contrastNota, CTA_POVESTE.nota))!.raport).toBeLessThan(4.5)
      await page.addStyleTag({ content: 'main small{color:#ffffff !important}' })
      expect((await page.evaluate(contrastNota, CTA_POVESTE.nota))!.raport).toBeGreaterThanOrEqual(4.5)
    })
  })
}

type MasuraCitate = {
  citate: number
  puncteText: number
  acoperite: number
  exemple: string[]
  puncteCitate: number
  citateDeasupra: number
}

/**
 * Ruleaza in pagina: cate puncte de text din `<main>` au deasupra lor un card-citat al frustrarii. Pe fiecare dreptunghi
 * de text (Range.getClientRects), 5 puncte pe linia de mijloc; `elementFromPoint` spune cine e deasupra. Pagina se
 * deruleaza in pasi de un sfert de fereastra si fiecare punct se masoara o singura data, cand e in banda din mijloc
 * (departe de antetul fix, care altfel ar ascunde un citat). Punctele citatelor insesi se numara separat: cate sunt
 * deasupra (vizibile). Citatele au `pointer-events: none`, deci `elementFromPoint` le sare: proba le forteaza inainte.
 */
function textSubCitate(): MasuraCitate | null {
  const main = document.querySelector('main')
  const card = main?.querySelector('[data-macheta="sesiune"]')
  const strat = card?.nextElementSibling
  if (!main || !card || !strat) return null
  const citate = [...strat.querySelectorAll('figure')]
  const alCui = (n: Node | null): Element | null => {
    const el = n instanceof Element ? n : (n?.parentElement ?? null)
    const f = el?.closest('figure') ?? null
    return f !== null && citate.includes(f) ? f : null
  }
  const noduri: Text[] = []
  const umbla = document.createTreeWalker(main, NodeFilter.SHOW_TEXT)
  for (let n = umbla.nextNode(); n !== null; n = umbla.nextNode()) {
    if ((n.textContent ?? '').trim() !== '' && n.parentElement?.closest('.doar-cititor') == null) noduri.push(n as Text)
  }
  const m: MasuraCitate = { citate: citate.length, puncteText: 0, acoperite: 0, exemple: [], puncteCitate: 0, citateDeasupra: 0 }
  const masurate = new Set<string>()
  const H = innerHeight
  const W = innerWidth
  const pas = Math.floor(H / 4)
  for (let y = 0; y < document.documentElement.scrollHeight; y += pas) {
    scrollTo(0, y)
    noduri.forEach((t, i) => {
      const propriu = alCui(t)
      const interval = document.createRange()
      interval.selectNodeContents(t)
      Array.from(interval.getClientRects()).forEach((d, j) => {
        if (d.width < 4 || d.height < 4) return
        const ym = d.top + d.height / 2
        if (ym < H / 4 || ym > (3 * H) / 4) return
        for (let k = 1; k <= 5; k++) {
          const x = d.left + (d.width * k) / 6
          const cheie = i + ':' + j + ':' + k
          if (x < 1 || x > W - 1 || masurate.has(cheie)) continue
          masurate.add(cheie)
          const sus = alCui(document.elementFromPoint(x, ym))
          if (propriu !== null) {
            m.puncteCitate++
            if (sus === propriu) m.citateDeasupra++
            continue
          }
          m.puncteText++
          if (sus !== null) {
            m.acoperite++
            if (m.exemple.length < 6) m.exemple.push((t.textContent ?? '').trim().slice(0, 40) + ' <- ' + (sus.textContent ?? '').trim().slice(0, 40))
          }
        }
      })
    })
  }
  scrollTo(0, 0)
  return m
}

type CaractereCitate = { citate: number; litere: number; ascunse: number; pe: { text: string; litere: number; ascunse: string }[] }

/**
 * Ruleaza in pagina: cate caractere ale citatelor frustrarii stau SUB alt element (cardul sesiunii). Fiecare citat se
 * aduce in mijlocul ferestrei; pentru fiecare caracter care nu e spatiu, `elementFromPoint` in centrul lui trebuie sa
 * intoarca propriul citat. `pe` aduna caracterele ascunse, pe citat, ca raportul sa arate ce se pierde la citire.
 * Cere fortarea `pointer-events` (FORTEAZA_CITATE), altfel niciun caracter nu e "vizibil".
 */
function caractereSubCard(): CaractereCitate | null {
  const card = document.querySelector('main [data-macheta="sesiune"]')
  const strat = card?.nextElementSibling
  if (!card || !strat) return null
  const citate = [...strat.querySelectorAll('figure')]
  const r: CaractereCitate = { citate: citate.length, litere: 0, ascunse: 0, pe: [] }
  for (const f of citate) {
    f.scrollIntoView({ block: 'center' })
    let ascunse = ''
    let litere = 0
    const umbla = document.createTreeWalker(f, NodeFilter.SHOW_TEXT)
    for (let n = umbla.nextNode(); n !== null; n = umbla.nextNode()) {
      const t = n.textContent ?? ''
      for (let i = 0; i < t.length; i++) {
        if (/\s/.test(t[i])) continue
        const interval = document.createRange()
        interval.setStart(n, i)
        interval.setEnd(n, i + 1)
        const d = interval.getClientRects()[0]
        if (!d || d.width < 1) continue
        litere++
        const sus = document.elementFromPoint(d.left + d.width / 2, d.top + d.height / 2)
        if (sus === null || sus.closest('figure') !== f) ascunse += t[i]
      }
    }
    r.litere += litere
    r.ascunse += ascunse.length
    r.pe.push({ text: (f.textContent ?? '').trim(), litere, ascunse })
  }
  scrollTo(0, 0)
  return r
}

/** Perechea RO a paginii, pe build-ul romanesc al probelor (baseURL). */
const PERECHE_RO = '/functionalitati/cautare-ai'

/** Masuratoarea perechii RO, cu controalele citirii: 5 citate, cel putin 80 de caractere. */
async function caractereRo(page: Page): Promise<CaractereCitate> {
  await page.goto(PERECHE_RO)
  await page.addStyleTag({ content: FORTEAZA_CITATE })
  const ro = await page.evaluate(caractereSubCard)
  expect(ro?.citate).toBe(5)
  expect(ro!.litere).toBeGreaterThanOrEqual(80)
  return ro!
}

/** Pozitiile citatelor ascunse intreg, si caracterele ascunse pe citatele vazute macar in parte. */
function ascunseInParte(m: CaractereCitate): { intregi: number[]; caractere: number } {
  const intregi: number[] = []
  let caractere = 0
  m.pe.forEach((c, i) => {
    if (c.litere > 0 && c.ascunse.length === c.litere) intregi.push(i + 1)
    else caractere += c.ascunse.length
  })
  return { intregi, caractere }
}

/**
 * Ruleaza in pagina (martorii): primul citat vazut intreg se muta cu `translate` astfel incat centrul lui sa cada pe
 * marginea din stanga a cardului sesiunii, la jumatatea inaltimii lui: jumatate din citat ajunge in dreptul cardului.
 */
function impingeCitatPeCard(): boolean {
  const card = document.querySelector('main [data-macheta="sesiune"]')
  const strat = card?.nextElementSibling
  if (!card || !strat) return false
  const c = card.getBoundingClientRect()
  const tinta = [...strat.querySelectorAll('figure')].find((f) => {
    const d = f.getBoundingClientRect()
    return d.width > 0 && (d.right <= c.left || d.left >= c.right || d.bottom <= c.top || d.top >= c.bottom)
  })
  if (!(tinta instanceof HTMLElement)) return false
  const d = tinta.getBoundingClientRect()
  const dx = c.left - (d.left + d.width / 2)
  const dy = c.top + c.height / 2 - (d.top + d.height / 2)
  tinta.style.setProperty('translate', dx + 'px ' + dy + 'px', 'important')
  return true
}

/** Citatele frustrarii (stratul de dupa cardul sesiunii) primesc `pointer-events`, ca `elementFromPoint` sa le vada. */
const FORTEAZA_CITATE = '[data-macheta="sesiune"] ~ div, [data-macheta="sesiune"] ~ div *{pointer-events:auto !important}'

/*
 * SUPRAPUNERI (felia 105, runda 2): pe EN, niciun card-citat al frustrarii nu sta peste text. La 390 citatele 2 si 4
 * cad sub cardul sesiunii (z-index 2 peste 1, card opac), ca pe perechea RO; un dreptunghi de text care se intersecteaza
 * cu altul nu e o suprapunere vizibila, deci se masoara ordinea, nu geometria. Miscarea redusa tine citatele pe loc
 * (plutirea de 10 px se opreste) si progresul la 1, deci masuratoarea nu depinde de momentul ei.
 * CONTROALE: (1) cel putin 100 de puncte de text si un punct de citat vizibil (o citire goala nu da zero); (2) fara
 * fortarea `pointer-events`, niciun citat nu e gasit deasupra (fortarea e necesara); (3) martorul POZITIV: un citat
 * impins pe marginea cardului, cu stratul citatelor ridicat peste card (z-index 3), trebuie sa dea puncte de text
 * acoperite. Martorul nu se mai sprijina pe un citat care atinge cardul singur: dupa scurtarea citatului 5 EN (runda 3),
 * la 1440 niciun citat nu mai ajunge in dreptul cardului, deci ridicarea stratului singura nu mai acoperea nimic.
 */
for (const latime of [390, 1440] as const) {
  test.describe('citatele frustrarii la ' + latime, () => {
    test.use({ viewport: { width: latime, height: latime === 390 ? 844 : 900 } })

    test('/features/search la ' + latime + ': niciun card-citat nu sta peste text (elementFromPoint, miscare redusa)', async ({ page }) => {
      await page.emulateMedia({ reducedMotion: 'reduce' })
      await page.goto(copie.baza + cautare.meta.cale)
      expect(await page.evaluate(() => innerWidth)).toBe(latime)
      const neFortat = await page.evaluate(textSubCitate)
      await page.addStyleTag({ content: FORTEAZA_CITATE })
      const m = await page.evaluate(textSubCitate)
      console.log('[citate ' + latime + '] ' + JSON.stringify(m) + ' | fara fortare: ' + JSON.stringify(neFortat))
      expect(m).not.toBeNull()
      expect(m!.citate).toBe(5)
      expect(m!.puncteText).toBeGreaterThanOrEqual(100)
      expect(m!.citateDeasupra).toBeGreaterThan(0)
      expect(neFortat!.citateDeasupra).toBe(0)
      expect(m!.acoperite, m!.exemple.join(' | ')).toBe(0)
    })

    test('martor POZITIV la ' + latime + ': un citat impins pe marginea cardului si ridicat peste el acopera text', async ({ page }) => {
      await page.emulateMedia({ reducedMotion: 'reduce' })
      await page.goto(copie.baza + cautare.meta.cale)
      await page.addStyleTag({ content: FORTEAZA_CITATE + ' [data-macheta="sesiune"] ~ div{z-index:3 !important}' })
      expect(await page.evaluate(impingeCitatPeCard)).toBe(true)
      const m = await page.evaluate(textSubCitate)
      console.log('[citate martor ' + latime + '] ' + JSON.stringify(m))
      expect(m!.acoperite).toBeGreaterThan(0)
    })

    /*
     * Al doilea criteriu (text SUB card, nu peste): pe EN, citatele nu pierd sub cardul sesiunii mai mult decat pe perechea
     * RO, la aceeasi latime si cu miscare redusa. Masurat per caracter (elementFromPoint in centrul fiecarui caracter).
     * Doua parti: (a) citatele ascunse INTREG sub card (la 390 citatele 2 si 4, prin asezare, si pe RO) sunt aceleasi pe
     * ambele pagini; (b) pe citatele vazute macar in parte, caracterele ascunse pe EN nu sunt mai multe decat pe RO (la
     * 1440, RO pierde "O" din citatul 5). CONTROALE: 5 citate si cel putin 80 de caractere citite pe fiecare pagina;
     * martorul POZITIV impinge pe EN un citat vazut intreg pe marginea cardului si cere mai multe caractere ascunse.
     */
    test('/features/search la ' + latime + ': citatele nu pierd sub card mai multe caractere decat pe perechea RO', async ({ page }) => {
      await page.emulateMedia({ reducedMotion: 'reduce' })
      const ro = await caractereRo(page)
      await page.goto(copie.baza + cautare.meta.cale)
      expect(await page.evaluate(() => innerWidth)).toBe(latime)
      await page.addStyleTag({ content: FORTEAZA_CITATE })
      const en = await page.evaluate(caractereSubCard)
      console.log('[caractere ' + latime + '] RO ' + JSON.stringify(ro) + ' | EN ' + JSON.stringify(en))
      expect(en?.citate).toBe(5)
      expect(en!.litere).toBeGreaterThanOrEqual(80)
      const [r, e] = [ascunseInParte(ro), ascunseInParte(en!)]
      expect(e.intregi, 'citatele ascunse intreg').toEqual(r.intregi)
      expect(e.caractere, JSON.stringify(en!.pe)).toBeLessThanOrEqual(r.caractere)
    })

    test('martor POZITIV la ' + latime + ': un citat EN impins pe marginea cardului pierde mai multe caractere decat pe RO', async ({ page }) => {
      await page.emulateMedia({ reducedMotion: 'reduce' })
      const ro = await caractereRo(page)
      await page.goto(copie.baza + cautare.meta.cale)
      await page.addStyleTag({ content: FORTEAZA_CITATE })
      expect(await page.evaluate(impingeCitatPeCard)).toBe(true)
      const en = await page.evaluate(caractereSubCard)
      console.log('[caractere martor ' + latime + '] RO ' + JSON.stringify(ro) + ' | EN ' + JSON.stringify(en))
      expect(ascunseInParte(en!).caractere).toBeGreaterThan(ascunseInParte(ro).caractere)
    })
  })
}

for (const [cale, decizia] of SCOASE) {
  test(cale + ': 404 cu pagina de negasit EN (scoasa de la lansare, ' + decizia + ')', async () => {
    const { status, html } = await servit(cale)
    expect(status).toBe(404)
    expect(html).toMatch(/<html[^>]*\blang="en"/)
    expect(html).toContain('Page not found')
  })
}

test('harta de site si llms.txt fara P04 (decizia 49); controlul: amandoua au P03', async () => {
  for (const fisier of ['/sitemap.xml', '/llms.txt']) {
    const { status, html } = await servit(fisier)
    expect(status, fisier).toBe(200)
    expect(html, fisier).toContain('/features/search')
    expect(html, fisier).not.toContain(CALE_P04)
  }
})
