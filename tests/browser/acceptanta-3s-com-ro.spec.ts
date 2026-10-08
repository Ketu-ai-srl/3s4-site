import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import type { Page } from '@playwright/test'
import { expect, test } from './ajutor/baza'
import { mediuProfil3sComRo, pornesteCopia3sComRo, type Copie3sComRo, type Mutatie } from './ajutor/copie-3s-com-ro'
import { asteaptaHidratarea } from './ajutor/hidratare'
import { RADACINA } from './ajutor/proiect'
import { BAZA_RUNDA_3, ETICHETA_CU_MASURARE, MASURARE, ancore, faraEvadari, formePolitete, scripturi, texteCap } from './ajutor/juridic-servit'
import { DESCRIERE_MD } from '../../src/content/juridic/publicare'
import { ECHIVALENTE } from '../../src/content/echivalente'

/**
 * Proba de acceptanta a domeniului 3s.com.ro (asezarea `ro`: romana la radacina, engleza sub `/en`), pe COPIA construita
 * si servita cu variabilele aplicatiei 3s.com.ro (`ajutor/copie-3s-com-ro.ts`, profilul `config/profil-3s-com-ro.json`),
 * plus o instanta de analitica sintetica (ca bannerul de consimtamant sa existe; nicio cerere nu pleaca spre ea fara acord).
 *
 * CE MASOARA, dupa hidratare (ce nu se vede in HTML-ul servit si deci nu prinde comparatia `identitate` din CI): fiecare
 * componenta care citeste calea paginii in browser (`usePathname`, care intoarce calea SERVITA) trebuie s-o traduca in
 * calea SURSA (`useCaleSursa`), altfel alege alta pagina sau nicio pagina:
 *   - selectorul RO | EN, pe fiecare pagina cu pereche: optiunile duc la `/x` si `/en/x`, niciodata la `/ro/...`, iar
 *     optiunea activa e pagina insasi;
 *   - paleta Ctrl+K, pe `/` si pe `/en`: fiecare rezultat (fara interogare si cu "contact") e o cale servita care
 *     raspunde 200; pe `/en`, rezultatul de contact duce la `/en/contact`, pe `/` la `/contact`;
 *   - bara mobila si legaturile de canal pe `/contact` si `/en/contact`: WhatsApp spre numarul profilului, cu codul
 *     `ref` al paginii SURSA (tabelele de texte precompletate din sursa, citite ca text);
 *   - starea activa din antet pe `/en/pricing` (si pe `/preturi`, controlul);
 *   - zero legaturi de apel (decizia 56), pe HTML-ul servit al tuturor paginilor cu pereche si in DOM-ul hidratat;
 *   - bannerul de consimtamant cu legaturile spre politicile SERVITE (`/juridic/...` pe romana, `/en/legal/...` pe engleza);
 *   - pagina de negasit romaneasca (404, `lang="ro"`, drumurile ei servite si vii).
 *
 * ORACOLUL caii servite e regula asezarii din specificatie (romana `/ro/x` -> `/x`, engleza `/x` -> `/en/x`), aplicata
 * pe perechile din `src/content/echivalente.ts`; numarul de WhatsApp vine din profil, codurile `ref` din sursa.
 *
 * MUTANTI (o singura data, local, notati in raportul feliei): variabila `MUTATII_3S_COM_RO` = calea unui fisier JSON
 * cu `[{fisier, ancora, inlocuire}]`, aplicate pe COPIE (`ajutor/copie-3s-com-ro.ts`). Fara ea, copia e arborele curat.
 *
 * Fiecare detector are martor POZITIV pe date asamblate la rulare; martorul NEGATIV e un set de date corect.
 */

const PROFIL = mediuProfil3sComRo()
const CANALE = JSON.parse(PROFIL.CANALE_JSON) as { whatsapp: string }
const WA = 'https://wa.me/' + CANALE.whatsapp
/** Schema legaturii de apel, asamblata la rulare (proba nu poarta literal ce vaneaza). */
const SCHEMA_APEL = 'te' + 'l:'
const TIPAR_APEL = new RegExp('(?<![a-z])' + SCHEMA_APEL, 'gi')
const PREFIX_EN = '/en'
const PREFIX_RO_SURSA = '/ro'
/** Instanta de analitica: o origine locala la care nu se ajunge niciodata fara acord (nicio cerere nu e asteptata). */
const UMAMI = { UMAMI_URL: 'http://127.0.0.1:9', UMAMI_WEBSITE_ID: ['3c4d5e6f', '7a8b', '4c9d', '8e0f', '1a2b3c4d5e6f'].join('-') }

// ------------------------------------------------------------------ oracolul asezarii

/** Calea servita pe 3s.com.ro a unei cai sursa romanesti (`/ro/x` -> `/x`). */
function servitaRo(sursa: string): string {
  if (sursa === PREFIX_RO_SURSA) return '/'
  if (!sursa.startsWith(PREFIX_RO_SURSA + '/')) throw new Error('nu e o cale sursa romaneasca: ' + sursa)
  return sursa.slice(PREFIX_RO_SURSA.length)
}

/** Calea servita pe 3s.com.ro a unei cai sursa englezesti (`/x` -> `/en/x`). */
function servitaEn(sursa: string): string {
  return sursa === '/' ? PREFIX_EN : PREFIX_EN + sursa
}

type Pereche = { ro: string; en: string; sursaRo: string; sursaEn: string }

/** Perechile servite, din tabelul de echivalente (paginile care au si romana, si engleza). */
function perechi(): Pereche[] {
  const lista: Pereche[] = []
  for (const e of Object.values(ECHIVALENTE)) {
    const sursaRo = e['ro-MD']
    const sursaEn = e.en
    if (typeof sursaRo === 'string' && typeof sursaEn === 'string') {
      lista.push({ ro: servitaRo(sursaRo), en: servitaEn(sursaEn), sursaRo, sursaEn })
    }
  }
  return lista
}

/** Codurile `ref` pe cale sursa, citite ca TEXT din tabelele de texte precompletate (`{ cale: "...", ref: "..." }`). */
function refuriSursa(): Map<string, string> {
  const harta = new Map<string, string>()
  for (const fisier of ['navigatie-ro-md.ts', 'navigatie-en.ts']) {
    const text = readFileSync(join(RADACINA, 'src', 'content', fisier), 'utf8')
    const constante = new Map([...text.matchAll(/const ([A-Z_]+) = "([a-z0-9-]+)";/g)].map((m) => [m[1], m[2]]))
    for (const m of text.matchAll(/cale:\s*"([^"]+)",\s*(?:prefix:\s*(?:true|false),\s*)?ref:\s*(?:"([a-z0-9-]+)"|([A-Z_]+))/g)) {
      const ref = m[2] ?? constante.get(m[3])
      if (ref === undefined) throw new Error('refuriSursa: constanta ' + m[3] + ' nerezolvata in ' + fisier)
      harta.set(m[1], ref)
    }
  }
  return harta
}

// ------------------------------------------------------------------ detectorii (functii pure)

type Optiune = { href: string; activa: boolean }

/** Problemele selectorului pe pagina servita `cale`, cu perechea ei. */
function problemeSelector(cale: string, p: Pereche, optiuni: Optiune[]): string[] {
  const probleme: string[] = []
  const hrefuri = optiuni.map((o) => o.href).sort()
  const asteptate = [p.ro, p.en].sort()
  if (JSON.stringify(hrefuri) !== JSON.stringify(asteptate)) probleme.push('optiunile ' + JSON.stringify(hrefuri) + ', asteptat ' + JSON.stringify(asteptate))
  for (const h of hrefuri) if (h === PREFIX_RO_SURSA || h.startsWith(PREFIX_RO_SURSA + '/')) probleme.push('optiune spre adresa sursa ' + h)
  const active = optiuni.filter((o) => o.activa).map((o) => o.href)
  if (active.length !== 1 || active[0] !== cale) probleme.push('optiunea activa ' + JSON.stringify(active) + ', asteptat ' + cale)
  return probleme
}

/** Problemele legaturilor WhatsApp ale unei pagini: numarul profilului si codul `ref` asteptat, pe fiecare. */
function problemeWhatsApp(hrefuri: string[], ref: string): string[] {
  if (hrefuri.length === 0) return ['nicio legatura WhatsApp']
  const probleme: string[] = []
  for (const h of hrefuri) {
    if (!(h === WA || h.startsWith(WA + '?'))) probleme.push('alt numar: ' + h)
    const text = new URL(h).searchParams.get('text') ?? ''
    const coduri = [...text.matchAll(/\[ref:([a-z0-9-]+)\]/g)].map((m) => m[1])
    if (coduri.length !== 1 || coduri[0] !== ref) probleme.push('ref ' + JSON.stringify(coduri) + ', asteptat ' + ref + ' (' + h + ')')
  }
  return probleme
}

/** Aparitiile schemei de apel intr-un text (HTML servit sau DOM), oriunde. */
function aparitiiApel(text: string): number {
  return (text.match(TIPAR_APEL) ?? []).length
}

/** Caile care nu sunt servite pe 3s.com.ro (adresele sursa ale romanei, care raspund cu redirect). */
function caiSursa(hrefuri: string[]): string[] {
  return hrefuri.filter((h) => h === PREFIX_RO_SURSA || h.startsWith(PREFIX_RO_SURSA + '/') || h.startsWith(PREFIX_RO_SURSA + '#'))
}

// ------------------------------------------------------------------ copia si ajutoare

let copie: Copie3sComRo
let PERECHI: Pereche[] = []

async function status(cale: string): Promise<number> {
  return (await fetch(copie.baza + cale, { redirect: 'manual' })).status
}

async function deschide(page: Page, cale: string, hidratate: string[]): Promise<void> {
  const r = await page.goto(copie.baza + cale)
  expect(r?.status(), cale).toBe(200)
  await asteaptaHidratarea(page, hidratate)
}

function mutatii(): Mutatie[] {
  const fisier = process.env.MUTATII_3S_COM_RO
  if (!fisier) return []
  const lista = JSON.parse(readFileSync(fisier, 'utf8')) as Mutatie[]
  console.log('[acceptanta-3s-com-ro] MUTANT: ' + lista.length + ' mutatii pe copie (' + lista.map((m) => m.fisier).join(', ') + ')')
  return lista
}

test.beforeAll(async () => {
  test.setTimeout(600_000)
  copie = await pornesteCopia3sComRo(UMAMI, mutatii())
  PERECHI = perechi()
})

test.afterAll(async () => {
  await copie?.opreste()
})

test('martorul perechilor: mai mult de 10 perechi, fiecare pagina servita (romana si engleza) raspunde 200, adresele sursa /ro nu', async () => {
  console.log('[acceptanta-3s-com-ro] perechi din echivalente: ' + PERECHI.length)
  expect(PERECHI.length).toBeGreaterThan(10)
  const probleme: string[] = []
  for (const p of PERECHI) {
    for (const c of [p.ro, p.en]) if ((await status(c)) !== 200) probleme.push(c + ': ' + (await status(c)))
    // Controlul oracolului: adresa sursa a romanei nu e servita (redirect permanent), deci oracolul nu e identitatea.
    if ((await status(p.sursaRo)) !== 308) probleme.push(p.sursaRo + ' nu e redirect (308)')
  }
  expect(probleme).toEqual([])
})

test('selectorul RO | EN pe fiecare pagina cu pereche: optiunile duc la /x si /en/x, niciodata la /ro/x; activa e pagina insasi', async ({ page }) => {
  test.setTimeout(300_000)
  await page.setViewportSize({ width: 1440, height: 900 })
  const buton = 'header [data-selector-limba] button'
  const probleme: string[] = []
  let masurate = 0
  for (const p of PERECHI) {
    for (const cale of [p.ro, p.en]) {
      masurate++
      await deschide(page, cale, ['header nav'])
      // Selectorul lipsa (sau scos de client la hidratare) e chiar defectul cautat: se numeste, nu se asteapta pana la termen.
      if ((await page.locator(buton).count()) === 0) {
        probleme.push(cale + ': selectorul de limba lipseste din antet')
        continue
      }
      try {
        await asteaptaHidratarea(page, [buton], 5000)
      } catch {
        probleme.push(cale + ': selectorul de limba nu se hidrateaza (' + (await page.locator(buton).count()) + ' butoane dupa 5 s)')
        continue
      }
      await page.locator(buton).click()
      const legaturi = page.locator('header [data-selector-limba] a')
      await expect(legaturi.first()).toBeVisible()
      const optiuni = await legaturi.evaluateAll((noduri) =>
        noduri.map((n) => ({ href: n.getAttribute('href') ?? '', activa: n.getAttribute('aria-current') === 'true' })),
      )
      for (const x of problemeSelector(cale, p, optiuni)) probleme.push(cale + ': ' + x)
    }
  }
  console.log('[acceptanta-3s-com-ro] pagini cu selector masurate: ' + masurate + ' (' + PERECHI.length + ' perechi)')
  expect(masurate).toBe(2 * PERECHI.length)
  expect(probleme).toEqual([])
})

test('paleta Ctrl+K pe / si pe /en: rezultate pe cai servite care raspund 200; contactul duce la /contact, respectiv /en/contact', async ({ page }) => {
  test.setTimeout(180_000)
  await page.setViewportSize({ width: 1440, height: 900 })
  const paleta = page.locator('[data-paleta] [role="dialog"]')
  const probleme: string[] = []
  for (const [start, contact] of [
    ['/', '/contact'],
    [PREFIX_EN, PREFIX_EN + '/contact'],
  ] as const) {
    for (const interogare of ['', 'contact']) {
      await deschide(page, start, ['header'])
      // Tasta se apasa numai cat paleta nu e deschisa (a doua apasare ar inchide-o), pana se hidrateaza ascultatorul.
      await expect(async () => {
        if (!(await paleta.isVisible())) await page.keyboard.press('Control+k')
        await expect(paleta).toBeVisible({ timeout: 1500 })
      }).toPass({ timeout: 15_000 })
      await paleta.getByRole('combobox').fill(interogare)
      if (interogare !== '') await expect.poll(async () => (await paleta.getByRole('option').allInnerTexts()).join(' | ')).toContain(contact)
      const servite = await paleta.getByRole('option').evaluateAll((noduri) => noduri.map((n) => n.lastElementChild?.textContent?.trim() ?? ''))
      console.log('[acceptanta-3s-com-ro] paleta pe ' + start + ' cu "' + interogare + '": ' + servite.length + ' rezultate')
      if (servite.length === 0) probleme.push(start + ' "' + interogare + '": zero rezultate')
      for (const s of caiSursa(servite)) probleme.push(start + ' "' + interogare + '": adresa sursa ' + s)
      for (const s of new Set(servite)) {
        const st = await status(s.split('#')[0])
        if (st !== 200) probleme.push(start + ' "' + interogare + '": ' + s + ' raspunde ' + st)
      }
      if (interogare === 'contact') {
        if (!servite.includes(contact)) probleme.push(start + ': contactul nu e ' + contact + ' in ' + JSON.stringify(servite))
        // Navigarea reala: clic pe rezultatul de contact.
        await paleta.getByRole('option').filter({ hasText: contact }).first().click()
        await expect(page).toHaveURL(copie.baza + contact)
      }
    }
  }
  expect(probleme).toEqual([])
})

test('bara mobila si legaturile de canal pe /contact si /en/contact: WhatsApp spre numarul profilului, cu ref-ul paginii sursa', async ({ page }) => {
  test.setTimeout(120_000)
  await page.setViewportSize({ width: 390, height: 844 })
  const refuri = refuriSursa()
  const probleme: string[] = []
  for (const [cale, sursa] of [
    ['/contact', PREFIX_RO_SURSA + '/contact'],
    [PREFIX_EN + '/contact', '/contact'],
  ] as const) {
    const ref = refuri.get(sursa)
    expect(ref, 'codul ref al sursei ' + sursa).toBeTruthy()
    await deschide(page, cale, ['[data-bara-mobil] a', 'main a[data-canal="whatsapp"]'])
    await expect(page.locator('[data-bara-mobil] a')).toBeVisible()
    const bara = await page.locator('[data-bara-mobil] a').getAttribute('href')
    const toate = await page.locator('a[href^="https://wa.me/"]').evaluateAll((n) => n.map((a) => a.getAttribute('href') ?? ''))
    console.log('[acceptanta-3s-com-ro] ' + cale + ': ' + toate.length + ' legaturi WhatsApp, ref asteptat ' + ref)
    for (const x of problemeWhatsApp([bara ?? ''], ref as string)) probleme.push(cale + ' bara: ' + x)
    for (const x of problemeWhatsApp(toate, ref as string)) probleme.push(cale + ': ' + x)
    const canal = await page.locator('main a[data-canal="whatsapp"]').count()
    if (canal === 0) probleme.push(cale + ': nicio LegaturaCanal in corpul paginii')
  }
  expect(probleme).toEqual([])
})

test('starea activa din antet: pe /en/pricing legatura activa e /en/pricing (controlul: pe /preturi e /preturi)', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  for (const cale of [PREFIX_EN + '/pricing', '/preturi']) {
    await deschide(page, cale, ['header nav'])
    const active = await page.locator('header nav a[aria-current="page"]').evaluateAll((n) => n.map((a) => a.getAttribute('href')))
    expect(active, cale).toEqual([cale])
  }
})

test('zero legaturi de apel (decizia 56): in HTML-ul servit al fiecarei pagini cu pereche si in DOM-ul hidratat al paginilor de contact', async ({ page }) => {
  test.setTimeout(180_000)
  const probleme: string[] = []
  let masurate = 0
  for (const p of PERECHI) {
    for (const cale of [p.ro, p.en]) {
      const html = await (await fetch(copie.baza + cale)).text()
      const n = aparitiiApel(html)
      if (n > 0) probleme.push(cale + ': ' + n + ' aparitii in HTML-ul servit')
      masurate++
    }
  }
  for (const cale of ['/contact', PREFIX_EN + '/contact']) {
    await deschide(page, cale, ['header'])
    const n = aparitiiApel(await page.content())
    if (n > 0) probleme.push(cale + ': ' + n + ' aparitii in DOM-ul hidratat')
  }
  console.log('[acceptanta-3s-com-ro] pagini masurate pentru schema de apel: ' + masurate)
  expect(masurate).toBe(2 * PERECHI.length)
  expect(probleme).toEqual([])
})

test('bannerul de consimtamant (analitica pornita): legaturile spre politici sunt cele servite, vii', async ({ browser }) => {
  for (const [cale, asteptate] of [
    ['/', ['/juridic/confidentialitate', '/juridic/cookies']],
    [PREFIX_EN, [PREFIX_EN + '/legal/privacy', PREFIX_EN + '/legal/cookies']],
  ] as const) {
    // Context nou: fara alegere salvata, deci bannerul apare.
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } })
    const page = await context.newPage()
    const r = await page.goto(copie.baza + cale)
    expect(r?.status()).toBe(200)
    const banner = page.locator('[data-consimtamant]')
    await expect(banner).toBeVisible({ timeout: 15_000 })
    const hrefuri = await banner.locator('a').evaluateAll((n) => n.map((a) => a.getAttribute('href') ?? ''))
    console.log('[acceptanta-3s-com-ro] bannerul pe ' + cale + ': ' + JSON.stringify(hrefuri))
    expect([...new Set(hrefuri)].sort(), cale).toEqual([...asteptate].sort())
    for (const h of asteptate) expect(await status(h), h).toBe(200)
    await context.close()
  }
})

test('pagina de negasit romaneasca: 404, lang="ro", titlul romanesc, drumurile ei pe cai servite si vii', async ({ page }) => {
  const r = await page.goto(copie.baza + '/nu-exista-' + 'proba')
  expect(r?.status()).toBe(404)
  expect(await page.locator('html').getAttribute('lang')).toBe('ro')
  await expect(page.locator('main h1')).toHaveText('Pagina nu există')
  const drumuri = await page.locator('main a[href^="/"]').evaluateAll((n) => n.map((a) => a.getAttribute('href') ?? ''))
  console.log('[acceptanta-3s-com-ro] drumurile paginii de negasit: ' + drumuri.length)
  expect(drumuri.length).toBeGreaterThan(0)
  expect(caiSursa(drumuri)).toEqual([])
  for (const d of new Set(drumuri)) expect(await status(d.split('#')[0]), d).toBe(200)
})

// Felia 144, runda 2: documentele juridice in octetii serviti ai asezarii `ro` (pereche cu proba din tests/editii.test.ts,
// care masoara 3s.md). Detectorii (`ajutor/juridic-servit.ts`) au martorii lor in proba-pereche; aici, controlul extragerii.
test('juridic servit: <head> la "tu" pe cele 5 documente RO, Cookies fara masurare, „Informații legale” din /en/legal/legal-information cu lang ro si hrefLang ro-RO', async () => {
  const text = async (cale: string) => {
    const r = await fetch(copie.baza + cale, { redirect: 'manual' })
    expect(r.status, cale).toBe(200)
    return r.text()
  }
  const RUTE_JURIDICE = JSON.parse(readFileSync(join(RADACINA, 'config', 'juridic-rute.json'), 'utf8')) as { documente: Record<string, { en: string; ro: string }> }
  const doc = (cheie: string) => RUTE_JURIDICE.documente[cheie]
  for (const k of ['confidentialitate', 'cookie-uri', 'notificare-si-actiune', 'inteligenta-artificiala', 'informatii-legale']) {
    const t = texteCap(await text(servitaRo(doc(k).ro)))
    expect(t.descrieri, k).toHaveLength(3)
    expect(formePolitete([t.titlu, ...t.titluri, ...t.descrieri].join(' ')), k).toEqual([])
  }
  for (const [limba, cale] of [['ro', servitaRo(doc('cookie-uri').ro)], ['en', servitaEn(doc('cookie-uri').en)]] as const) {
    const t = texteCap(await text(cale))
    expect(t.descrieri, cale).toHaveLength(3)
    for (const d of t.descrieri) expect(d, cale).not.toMatch(MASURARE[limba])
  }
  const a = ancore(await text(servitaEn(doc('informatii-legale').en)))
  const ro = a.filter((x) => x.text === 'Informații legale')
  // Introducerea documentului si eticheta locala din subsol (martorul pozitiv, felia 141): aceleasi atribute.
  expect(ro, JSON.stringify(ro)).toHaveLength(2)
  for (const x of ro) {
    expect(x.atribute.href).toBe(servitaRo(doc('informatii-legale').ro))
    expect(x.atribute.lang).toBe('ro')
    expect(x.atribute.hrefLang).toBe('ro-RO')
  }
  // Martorul negativ: legaturile obisnuite spre documentele EN raman fara atribute de limba.
  const en = a.filter((x) => (x.atribute.href ?? '').startsWith(PREFIX_EN + '/legal/'))
  expect(en.length).toBeGreaterThan(3)
  for (const x of en) expect(x.atribute.lang === undefined && x.atribute.hrefLang === undefined, x.atribute.href).toBe(true)
})

// Felia 144, runda 3: descrierile documentelor din rute (paleta, /llms.txt, pachetul de browser) si eticheta EN de cookie-uri,
// in octetii serviti ai asezarii `ro`, care ruleaza fara masurare (pereche cu proba din tests/editii.test.ts pe 3s.md).
// Martorii pe baza ai detectorilor sunt in proba-pereche; aici, controlul extragerii (descrierile curente SUNT in pachet).
test('juridic servit, runda 3: descrierile din rute la "tu" si fara masurare in pachet si in /llms.txt; eticheta EN „Cookie policy”, pereche cu „Politica de cookie-uri”', async () => {
  test.setTimeout(120_000)
  const text = async (cale: string) => {
    const r = await fetch(new URL(cale, copie.baza), { redirect: 'manual' })
    expect(r.status, cale).toBe(200)
    return r.text()
  }
  const RUTE_JURIDICE = JSON.parse(readFileSync(join(RADACINA, 'config', 'juridic-rute.json'), 'utf8')) as { documente: Record<string, { en: string; ro: string }> }
  const doc = (cheie: string) => RUTE_JURIDICE.documente[cheie]
  const CINCI = ['confidentialitate', 'cookie-uri', 'notificare-si-actiune', 'inteligenta-artificiala', 'informatii-legale'] as const

  // /llms.txt: linia documentului de cookie-uri (control: exista, cu descrierea curenta), fara masurare.
  const llms = await text('/llms.txt')
  const linie = llms.split(/\r?\n/).filter((l) => l.includes(servitaEn(doc('cookie-uri').en) + ')'))
  expect(linie, llms.slice(0, 400)).toHaveLength(1)
  expect(linie[0]).toContain(DESCRIERE_MD['cookie-uri'].en)
  expect(linie[0]).not.toMatch(MASURARE.en)

  // Pachetul de browser al paginii de start (paleta isi cauta rezultatele si in descrieri).
  const acasa = await text('/')
  const surse = scripturi(acasa)
  expect(surse.length).toBeGreaterThan(0)
  let js = ''
  for (const s of surse) js += faraEvadari(await text(s)) + String.fromCharCode(10)
  for (const k of CINCI) {
    expect(js.includes(DESCRIERE_MD[k].ro), 'ro ' + k).toBe(true)
    expect(js.includes(DESCRIERE_MD[k].en), 'en ' + k).toBe(true)
    expect(formePolitete(DESCRIERE_MD[k].ro), k).toEqual([])
  }
  expect(DESCRIERE_MD['cookie-uri'].ro).not.toMatch(MASURARE.ro)
  for (const vechi of [...BAZA_RUNDA_3.descrieriRo, BAZA_RUNDA_3.cookieEn]) expect(js.includes(vechi), vechi).toBe(false)

  // Subsolul: EN pe /en, RO pe /; etichetele legaturii spre pagina de cookie-uri, adevarate fara masurare.
  const en = ancore(await text(PREFIX_EN)).filter((x) => x.atribute.href === servitaEn(doc('cookie-uri').en))
  expect(en.length, JSON.stringify(en)).toBeGreaterThan(0)
  for (const x of en) expect(x.text).not.toMatch(ETICHETA_CU_MASURARE)
  expect(en.map((x) => x.text)).toContain('Cookie policy')
  const ro = ancore(acasa).filter((x) => x.atribute.href === servitaRo(doc('cookie-uri').ro))
  expect(ro.map((x) => x.text), JSON.stringify(ro)).toContain('Politica de cookie-uri')
})

test('martor POZITIV: fiecare detector prinde defectul lui, pe date asamblate la rulare', () => {
  const p: Pereche = { ro: '/a', en: PREFIX_EN + '/a', sursaRo: PREFIX_RO_SURSA + '/a', sursaEn: '/a' }
  // Selectorul: o optiune spre adresa sursa, una lipsa, activa gresita.
  expect(problemeSelector('/a', p, [{ href: PREFIX_RO_SURSA + '/a', activa: true }, { href: p.en, activa: false }]).join(' | ')).toContain('adresa sursa')
  expect(problemeSelector('/a', p, [{ href: '/a', activa: true }]).join(' | ')).toContain('optiunile')
  expect(problemeSelector('/a', p, [{ href: '/a', activa: false }, { href: p.en, activa: true }]).join(' | ')).toContain('optiunea activa')
  // WhatsApp: alt numar, alt ref, niciun ref, nicio legatura.
  const text = (ref: string) => '?text=' + encodeURIComponent('Text [ref:' + ref + ']')
  expect(problemeWhatsApp(['https://wa.me/' + '37' + '300000000' + text('x')], 'x').join(' | ')).toContain('alt numar')
  expect(problemeWhatsApp([WA + text('y')], 'x').join(' | ')).toContain('ref ["y"]')
  expect(problemeWhatsApp([WA + '?text=Text'], 'x').join(' | ')).toContain('ref []')
  expect(problemeWhatsApp([], 'x')).toEqual(['nicio legatura WhatsApp'])
  // Schema de apel: in legatura, in text cu majuscule.
  expect(aparitiiApel('<a href="' + SCHEMA_APEL + '+' + CANALE.whatsapp + '">x</a>')).toBe(1)
  expect(aparitiiApel('<p>' + SCHEMA_APEL.toUpperCase() + '+40</p>')).toBe(1)
  // Adresele sursa ale romanei.
  expect(caiSursa([PREFIX_RO_SURSA, PREFIX_RO_SURSA + '/contact', '/contact'])).toEqual([PREFIX_RO_SURSA, PREFIX_RO_SURSA + '/contact'])
  // Oracolul refuza o cale care nu e sursa romaneasca (altfel ar intoarce-o neschimbata).
  expect(() => servitaRo('/contact')).toThrow()
})

test('martor NEGATIV: date corecte nu sunt acuzate', () => {
  const p: Pereche = { ro: '/a', en: PREFIX_EN + '/a', sursaRo: PREFIX_RO_SURSA + '/a', sursaEn: '/a' }
  expect(problemeSelector('/a', p, [{ href: '/a', activa: true }, { href: p.en, activa: false }])).toEqual([])
  expect(problemeSelector(p.en, p, [{ href: '/a', activa: false }, { href: p.en, activa: true }])).toEqual([])
  expect(problemeWhatsApp([WA + '?text=' + encodeURIComponent('Text [ref:x]')], 'x')).toEqual([])
  // Cuvintele care doar se termina in literele schemei nu sunt apel; nici o cale care incepe cu /ro altfel (/romana).
  expect(aparitiiApel('<p>Ho' + SCHEMA_APEL + ' x, mo' + SCHEMA_APEL + ' y</p>')).toBe(0)
  expect(caiSursa(['/romana', '/', PREFIX_EN + '/contact'])).toEqual([])
  expect(servitaRo(PREFIX_RO_SURSA)).toBe('/')
  expect(servitaEn('/')).toBe(PREFIX_EN)
})
