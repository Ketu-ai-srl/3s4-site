import { expect, test, type Browser, type BrowserContext, type Page } from '@playwright/test'
import { CALE_EVIDENTA } from '../../src/components/consimtamant/evidenta'
import { CHEIE_ALEGERE } from '../../src/components/consimtamant/stocare'
import { stareAnalitica } from '../../src/lib/analitica'
import { ID_GA4_SINTETIC, pornesteCopiaOperator, type CopieOperator } from './ajutor/copie-operator'
import { STOCARE_ALEGERE, masoaraTerti, stocareNedeclarata } from './ajutor/detectori'
import {
  GAZDA_FISIERE_FONTURI_GOOGLE,
  GAZDA_FONTURI_GOOGLE,
  pornesteFixturile,
  type ServerFixturi,
} from './ajutor/fixturi'
import { rutePublice } from './ajutor/proiect'

/**
 * PROBA COMUTATORULUI (planul valului S4, §10; felia seo-geo-gdpr). Aceleasi pagini, de doua ori:
 *
 *   1. BUILD-UL REAL, in starea pe care o dau `config/operator.json` si mediul (`stareAnalitica()`).
 *      Cu analitica oprita (operatorul null, decizia owner-ului din 24.09, "Nimeni deocamdata"):
 *      zero banner, zero legatura "Setari cookie-uri", zero cereri catre terti, zero cookie-uri, zero
 *      stocare, calea evidentei nu exista (404) si nici CODUL nu e in pagina: niciun script incarcat
 *      nu poarta incarcatorul GA4 sau bannerul. Proba nu scrie starea de mana: in ziua operatorului,
 *      fara ID GA4 in mediul local, analitica ramane oprita (motivul devine "fara-id") si asertiunile
 *      raman aceleasi; cu ID, build-ul real trebuie sa arate ce arata copia de mai jos.
 *   2. O COPIE cu operator SINTETIC si ID GA4 SINTETIC, asamblate la rulare
 *      (`ajutor/copie-operator.ts`, cu cele trei controale ale ei: fixtura a aterizat, build-ul iese
 *      0, startul construit poarta bannerul): bannerul si legatura sunt in HTML-ul servit; inainte de
 *      accept nicio cerere catre Google si nici bucata incarcatorului in pagina (bucata bannerului da,
 *      ca martor ca detectorul citeste JavaScript-ul); dupa accept, bucata incarcatorului si EXACT o
 *      cerere catre scriptul gtag, cu ID-ul sintetic; refuzul are forma acceptului si nu cere nimic,
 *      nici dupa reincarcare; nicio caseta bifata implicit; panoul de setari are forma masurata
 *      (centrat la 1440, pe tot ecranul la 390); retragerea din subsolul oricarei pagini opreste
 *      masurarea si sterge cookie-urile ei; fiecare alegere lasa un rand de evidenta in jurnalul
 *      serverului.
 *
 * Portile din planul E5 pe care le masoara: G-CONS-01 (zero cereri, cookie-uri si stocare - inclusiv
 * IndexedDB - inainte de accept; exact una dupa), G-CONS-02 (simetria refuzului), G-CONS-03 (nicio
 * caseta bifata, retragere pe orice pagina). Si C-01 pe drumul cu GA4 (decizia owner-ului din 24.09,
 * plan §8-§10): detectorul portii (`masoaraTerti`, acelasi cod ca in `consimtamant.spec.ts`)
 * ruleaza pe copie, cu refuz.
 *
 * O ABATERE DECLARATA de la litera lui G-CONS-02 (E5, pasul 5): pragul "refuzul atins in acelasi
 * numar de tabulari sau mai putine" ar cere refuzul INAINTEA acceptului in ordinea tastaturii. Forma
 * masurata a bannerului pune acceptul primul (componente-globale.md §7), iar ordinea tastaturii
 * trebuie sa urmeze ordinea vizuala (WCAG 2.4.3). Se cere deci: refuzul in primul strat, imediat
 * dupa accept (o singura tabulare). Pragul E5 e ales de noi, nu de lege; EDPB nu impune o ordine,
 * cere refuzul in primul strat, ca buton.
 *
 * CERERILE CATRE ALTE GAZDE SE BLOCHEAZA LA RETEA in fiecare context de aici: proba le vede (asta
 * masoara), dar nu pleaca nimic spre Google, nici cand codul e corect (scriptul cerut dupa accept),
 * nici cand ar fi defect.
 *
 * CE NU ACOPERA INCA, si de ce: paginile juridice publice si formularele trimise catre o destinatie
 * de test (tabelul din plan §10) sunt ale feliilor `juridic` si `enterprise-formular` / `conversie`;
 * cand ele aterizeaza, jumatatea cu operator de aici e locul in care se adauga.
 */

/** Rutele publice ale build-ului, plus pagina de negasit: subsolul si bannerul sunt pe ORICE pagina. */
const CALE_NEGASITA = '/pagina-care-nu-exista-comutator'
const CAI = [...rutePublice(), CALE_NEGASITA]

/** Starea analiticii pe build-ul real: aceeasi configurare si acelasi mediu ca build-ul. */
const STARE_REALA = stareAnalitica()
const DESCRIERE_STARE = STARE_REALA.activa ? 'pornita' : 'oprita, motiv ' + STARE_REALA.motiv

/** Gazdele Google, dupa nume: orice gazda a Google pe care ar putea-o cere GA4 sau fonturile. */
const TIPAR_GOOGLE = /(^|\.)(google[a-z-]*|gstatic|doubleclick)\./

const FONTURI_GOOGLE = [GAZDA_FONTURI_GOOGLE, GAZDA_FISIERE_FONTURI_GOOGLE]

/** Contrastul minim al fiecarui buton din primul strat (G-CONS-02, WCAG 1.4.3). */
const CONTRAST_MINIM = 4.5

/**
 * Ce se cauta in JavaScript-ul INCARCAT de pagina (raspunsurile de tip script de pe origine proprie,
 * citite intregi). Numele gazdei scriptului Google e semnatura incarcatorului GA4: pe build-ul cu
 * analitica oprita nu are voie sa fie in pagina deloc, iar pe copie numai dupa accept. Marcajele
 * codului de consimtamant (atributul bannerului, calea evidentei, fanionul de oprire GA4) nu au voie
 * sa fie in pagina cu analitica oprita; pe copie, bucata bannerului trebuie sa se incarce (controlul
 * ca detectorul chiar citeste JavaScript-ul). Se asambleaza la rulare, ca proba sa nu poarte literal
 * ce vaneaza.
 */
const SCRIPT_GOOGLE = ['googletag', 'manager'].join('')
const MARCAJE_CONSIMTAMANT = ['data-' + 'consimtamant', CALE_EVIDENTA, 'ga-' + 'disable-']

type ScriptIncarcat = { url: string; text: string; citit: boolean }

type Retea = { gazdaProprie: string; cereri: string[]; blocate: string[]; scripturi: Promise<ScriptIncarcat>[] }

function gazdaDin(url: string): string {
  try {
    return new URL(url).host
  } catch {
    return ''
  }
}

/**
 * Context nou in care fiecare cerere se inregistreaza, iar cele catre alte gazde se blocheaza.
 * Scripturile de pe origine proprie se citesc intregi, pentru detectorul de JavaScript incarcat.
 */
async function contextPazit(browser: Browser, baza: string): Promise<{ context: BrowserContext; pagina: Page; retea: Retea }> {
  const context = await browser.newContext()
  const retea: Retea = { gazdaProprie: new URL(baza).host, cereri: [], blocate: [], scripturi: [] }
  context.on('request', (c) => retea.cereri.push(c.url()))
  context.on('response', (r) => {
    if (r.request().resourceType() !== 'script' || gazdaDin(r.url()) !== retea.gazdaProprie) return
    retea.scripturi.push(
      r.text().then(
        (text) => ({ url: r.url(), text, citit: true }),
        () => ({ url: r.url(), text: '', citit: false }),
      ),
    )
  })
  await context.route('**/*', (ruta) => {
    const url = ruta.request().url()
    const gazda = gazdaDin(url)
    if (gazda !== '' && gazda !== retea.gazdaProprie) {
      retea.blocate.push(url)
      return ruta.abort('blockedbyclient')
    }
    return ruta.continue()
  })
  const pagina = await context.newPage()
  return { context, pagina, retea }
}

/**
 * JavaScript-ul incarcat pana acum, citit. Un script necitit ar face orice "nu contine" adevarat,
 * deci se cere ca toate sa fi fost citite; se cheama INAINTE de inchiderea contextului.
 */
async function jsIncarcat(r: Retea): Promise<ScriptIncarcat[]> {
  const toate = await Promise.all(r.scripturi)
  expect(toate.filter((s) => !s.citit).map((s) => s.url), 'scripturi pe care detectorul nu le-a putut citi').toEqual([])
  return toate
}

const cuSir = (js: ScriptIncarcat[], siruri: string[]) =>
  js.filter((s) => siruri.some((sir) => s.text.includes(sir))).map((s) => new URL(s.url).pathname)

const straine = (r: Retea) => r.cereri.filter((u) => ![r.gazdaProprie, ''].includes(gazdaDin(u)))
const google = (r: Retea) => r.cereri.filter((u) => TIPAR_GOOGLE.test(gazdaDin(u)))
const fonturiGoogle = (r: Retea) => r.cereri.filter((u) => FONTURI_GOOGLE.includes(gazdaDin(u)))
const scriptGa = (r: Retea) =>
  r.cereri.filter((u) => /\/gtag\/js\?id=/.test(u) && TIPAR_GOOGLE.test(gazdaDin(u)))

/** Stocarea paginii: localStorage, sessionStorage si bazele IndexedDB (G-CONS-01). */
async function stocare(pagina: Page): Promise<string[]> {
  return pagina.evaluate(async () => {
    const chei: string[] = []
    for (let i = 0; i < localStorage.length; i++) chei.push('localStorage:' + localStorage.key(i))
    for (let i = 0; i < sessionStorage.length; i++) chei.push('sessionStorage:' + sessionStorage.key(i))
    try {
      for (const baza of await indexedDB.databases()) chei.push('indexedDB:' + baza.name)
    } catch {
      chei.push('indexedDB inaccesibil')
    }
    return chei
  })
}

async function alegerea(pagina: Page): Promise<Record<string, unknown> | null> {
  return pagina.evaluate((cheie) => {
    const brut = localStorage.getItem(cheie)
    return brut === null ? null : (JSON.parse(brut) as Record<string, unknown>)
  }, CHEIE_ALEGERE)
}

/** Semnalele de consimtamant puse in dataLayer, in ordine: [tip, semnale]. */
async function semnale(pagina: Page): Promise<[string, Record<string, string>][]> {
  return pagina.evaluate(() => {
    const strat = (window as unknown as { dataLayer?: ArrayLike<unknown>[] }).dataLayer ?? []
    return Array.from(strat)
      .map((a) => Array.from(a))
      .filter((a) => a[0] === 'consent')
      .map((a) => [String(a[1]), a[2] as Record<string, string>] as [string, Record<string, string>])
  })
}

/** Randurile de evidenta din jurnalul copiei, citite ca JSON. */
function randuriEvidenta(jurnal: string): Record<string, unknown>[] {
  return jurnal
    .split(/\r?\n/)
    .filter((r) => r.includes('"tip":"3s-consimtamant"'))
    .map((r) => JSON.parse(r.slice(r.indexOf('{'))) as Record<string, unknown>)
}

async function asteaptaLinistea(pagina: Page, ms = 2000): Promise<void> {
  await pagina.waitForLoadState('networkidle').catch(() => {})
  await pagina.waitForTimeout(ms)
}

// ---------------------------------------------------------------------------------------------
// Simetria acceptului si a refuzului (G-CONS-02; gdprscan SITE-04, "acelasi nivel de vizibilitate")
// ---------------------------------------------------------------------------------------------

/** Contrastul minim al marginii unui buton fata de banner (WCAG 1.4.11, componente de interfata). */
const CONTRAST_MARGINE_MINIM = 3

/** Ce se masoara la fiecare buton, cu JavaScript, in pagina deschisa. */
type MasuraButon = {
  tag: string
  latime: number
  inaltime: number
  font: string
  adancime: number
  opacitate: number
  /** Textul pe fundalul butonului; NaN cand fundalul nu e opac. */
  contrast: number
  fundal: string
  chenar: string
  /** Primul fundal opac de deasupra butonului: bannerul sau panoul. */
  fundalSuport: string
  /** Cat se desprinde butonul de suport: fundalul lui sau chenarul, care e mai tare. */
  contrastMargine: number
  inEcran: boolean
  innerWidth: number
}

/**
 * Acceptul si refuzul din `container`, masurate cu acelasi cod pe copia reala si pe martori.
 * Marginea butonului fata de suport e cea mai tare dintre fundal si chenar; un fundal care nu e
 * opac nu se masoara (NaN), deci nu trece drept buton plin.
 */
async function masoaraButoane(pagina: Page, container: string): Promise<[MasuraButon, MasuraButon]> {
  // Cursorul se muta in colt: un buton aflat sub cursor are culoarea de hover, iar proba ar vedea
  // un fundal diferit care nu e al butonului in repaus. Masurat pe 25.09.2026, la capturi: refuzul
  // din panoul de 390, sub cursorul lasat de clicul pe "Setari cookie-uri", avea rgb(29, 78, 216),
  // iar dupa mutarea cursorului rgb(37, 99, 235), ca acceptul.
  await pagina.mouse.move(0, 0)
  const [accept, refuz] = await Promise.all(
    ['[data-accept]', '[data-refuz]'].map((sel) =>
      pagina.locator(container + ' ' + sel).evaluate((el): MasuraButon => {
        const canale = (culoare: string) => {
          const m = culoare.match(/^rgba?\(([^)]+)\)$/)
          if (!m) return null
          const v = m[1].split(/[\s,/]+/).filter(Boolean).map(Number)
          return { r: v[0], g: v[1], b: v[2], a: v.length > 3 ? v[3] : 1 }
        }
        const compune = (sus: { r: number; g: number; b: number; a: number }, jos: { r: number; g: number; b: number }) => ({
          r: sus.a * sus.r + (1 - sus.a) * jos.r,
          g: sus.a * sus.g + (1 - sus.a) * jos.g,
          b: sus.a * sus.b + (1 - sus.a) * jos.b,
        })
        const luminanta = ({ r, g, b }: { r: number; g: number; b: number }) => {
          const c = [r, g, b].map((v) => {
            const s = v / 255
            return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
          })
          return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]
        }
        const raport = (x: { r: number; g: number; b: number }, y: { r: number; g: number; b: number }) => {
          const [l1, l2] = [luminanta(x), luminanta(y)]
          return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05)
        }
        const cutie = el.getBoundingClientRect()
        const stil = getComputedStyle(el)
        let opacitate = 1
        let adancime = 0
        for (let e: Element | null = el; e; e = e.parentElement) {
          opacitate *= Number(getComputedStyle(e).opacity)
          adancime++
        }
        // Suportul: primul stramos cu fundal opac. Fara niciunul, panza paginii (alba).
        let suport = { r: 255, g: 255, b: 255, a: 1 }
        let fundalSuport = 'panza paginii'
        for (let e = el.parentElement; e; e = e.parentElement) {
          const c = canale(getComputedStyle(e).backgroundColor)
          if (c && c.a === 1) {
            suport = c
            fundalSuport = getComputedStyle(e).backgroundColor
            break
          }
        }
        const fundal = canale(stil.backgroundColor)
        const text = canale(stil.color)
        const margine = canale(stil.borderTopColor)
        // Numai un fundal opac se masoara (altfel NaN, deci proba pica, ca la contrastul textului).
        // Chenarul se compune peste fundalul butonului: unul transparent nu trece drept negru.
        let contrastMargine = Number.NaN
        if (fundal && fundal.a === 1) {
          contrastMargine = raport(fundal, suport)
          const grosime = parseFloat(stil.borderTopWidth)
          if (margine && grosime >= 1 && stil.borderTopStyle !== 'none') {
            contrastMargine = Math.max(contrastMargine, raport(compune(margine, fundal), suport))
          }
        }
        return {
          tag: el.tagName,
          latime: cutie.width,
          inaltime: cutie.height,
          font: stil.fontSize + ' ' + stil.fontWeight + ' ' + stil.fontFamily,
          adancime,
          opacitate,
          // Un fundal care nu e opac nu da un contrast de text masurabil aici: NaN, deci proba pica.
          contrast: fundal && text && fundal.a === 1 ? raport(text, fundal) : Number.NaN,
          fundal: stil.backgroundColor,
          chenar: stil.borderTopWidth + ' ' + stil.borderTopStyle + ' ' + stil.borderTopColor,
          fundalSuport,
          contrastMargine,
          inEcran: cutie.top >= 0 && cutie.bottom <= window.innerHeight,
          innerWidth: window.innerWidth,
        }
      }),
    ),
  )
  return [accept, refuz]
}

/**
 * Ce deosebeste refuzul de accept, ca nivel vizual. Lista goala = acelasi nivel. `cutie` false
 * scuteste numai marimea: in piciorul panoului, la latime mare, butoanele au latimea textului lor.
 */
function abateriSimetrie(accept: MasuraButon, refuz: MasuraButon, { cutie = true } = {}): string[] {
  const a: string[] = []
  const la = ' la ' + accept.innerWidth
  for (const [nume, b] of [['acceptul', accept], ['refuzul', refuz]] as const) {
    if (b.tag !== 'BUTTON') a.push(nume + ' nu e <button>, e <' + b.tag.toLowerCase() + '>')
    if (b.opacitate !== 1) a.push(nume + ' are opacitatea ' + b.opacitate + la)
    if (!(b.contrast >= CONTRAST_MINIM)) a.push('textul ' + (nume === 'acceptul' ? 'acceptului' : 'refuzului') + ' are contrast ' + b.contrast.toFixed(2) + ':1' + la)
    if (!(b.contrastMargine >= CONTRAST_MARGINE_MINIM)) {
      a.push(nume + ' se desprinde de suport doar ' + b.contrastMargine.toFixed(2) + ':1 (minim ' + CONTRAST_MARGINE_MINIM + ':1)' + la)
    }
    if (!b.inEcran) a.push(nume + ' iese din ecran' + la)
  }
  if (cutie && Math.abs(refuz.latime - accept.latime) > 1) a.push('latimi diferite' + la + ': ' + accept.latime + ' / ' + refuz.latime)
  if (cutie && Math.abs(refuz.inaltime - accept.inaltime) > 1) a.push('inaltimi diferite' + la + ': ' + accept.inaltime + ' / ' + refuz.inaltime)
  if (refuz.font !== accept.font) a.push('font diferit' + la + ': ' + accept.font + ' / ' + refuz.font)
  if (refuz.adancime !== accept.adancime) a.push('nivel DOM diferit: ' + accept.adancime + ' / ' + refuz.adancime)
  if (refuz.fundal !== accept.fundal) a.push('fundal diferit' + la + ': acceptul ' + accept.fundal + ', refuzul ' + refuz.fundal)
  if (refuz.chenar !== accept.chenar) a.push('chenar diferit' + la + ': acceptul ' + accept.chenar + ', refuzul ' + refuz.chenar)
  return a
}

type MasuraInainte = {
  innerWidth: number
  subsol: number
  bannerInDom: number
  bannerVizibil: boolean
  legatura: number
  bannerInHtmlServit: boolean
  legaturaInHtmlServit: boolean
  scriptAnalitica: number
  gtag: string
  cookies: string[]
  stocare: string[]
  /** Scripturi de pe origine proprie incarcate si citite. */
  jsCitite: number
  /** Caile scripturilor incarcate care poarta semnatura incarcatorului GA4. */
  jsCuGoogle: string[]
  /** Caile scripturilor incarcate care poarta codul de consimtamant. */
  jsCuConsimtamant: string[]
  retea: Retea
}

/**
 * Starea unei pagini INAINTE de orice alegere: context nou, nimic atins, dupa linistea retelei.
 * Aceeasi functie masoara build-ul real si copia. `asteaptaBannerul` asteapta hidratarea (bannerul
 * devine vizibil numai dupa ce componenta citeste ca nu exista o alegere pastrata).
 */
async function masoaraInainteDeAlegere(
  browser: Browser,
  baza: string,
  cale: string,
  asteaptaBannerul: boolean,
): Promise<MasuraInainte> {
  const { context, pagina, retea } = await contextPazit(browser, baza)
  const raspuns = await pagina.goto(baza + cale, { waitUntil: 'load' })
  const servit = raspuns ? await raspuns.text() : ''
  if (asteaptaBannerul) {
    await expect(pagina.locator('[data-consimtamant]'), 'bannerul nu apare pe ' + baza + cale).toBeVisible()
  }
  await asteaptaLinistea(pagina)
  const js = await jsIncarcat(retea)
  const masura: MasuraInainte = {
    innerWidth: await pagina.evaluate(() => window.innerWidth),
    subsol: await pagina.locator('footer').count(),
    bannerInDom: await pagina.locator('[data-consimtamant]').count(),
    bannerVizibil: await pagina.locator('[data-consimtamant]').isVisible(),
    legatura: await pagina.locator('footer [data-cookie-settings]').count(),
    bannerInHtmlServit: servit.includes('data-consimtamant'),
    legaturaInHtmlServit: servit.includes('data-cookie-settings'),
    scriptAnalitica: await pagina.locator('script[data-analitica]').count(),
    gtag: await pagina.evaluate(() => typeof (window as unknown as { gtag?: unknown }).gtag),
    cookies: (await context.cookies()).map((c) => c.name),
    stocare: await stocare(pagina),
    jsCitite: js.length,
    jsCuGoogle: cuSir(js, [SCRIPT_GOOGLE]),
    jsCuConsimtamant: cuSir(js, MARCAJE_CONSIMTAMANT),
    retea,
  }
  await context.close()
  console.log(
    '[inainte de alegere] ' + baza + cale + ' | innerWidth CITIT: ' + masura.innerWidth + ' | cereri: ' +
      retea.cereri.length + ' | straine: ' + (straine(retea).join(', ') || '(niciuna)') + ' | banner: ' +
      masura.bannerInDom + (masura.bannerVizibil ? ' vizibil' : '') + ' | legatura subsol: ' + masura.legatura +
      ' | fonturi Google: ' + fonturiGoogle(retea).length + ' | stocare: ' + (masura.stocare.join(', ') || '(niciuna)') +
      ' | JS citit: ' + masura.jsCitite + ' | JS cu incarcatorul GA4: ' + (masura.jsCuGoogle.join(', ') || '(niciunul)') +
      ' | JS cu codul de consimtamant: ' + (masura.jsCuConsimtamant.join(', ') || '(niciunul)'),
  )
  // Controale: pagina chiar s-a masurat (cereri, subsol randat - locul in care sta legatura - si
  // JavaScript citit, altfel "niciun script nu contine" ar fi adevarat despre nimic).
  expect(retea.cereri.length, 'nicio cerere inregistrata pe ' + cale).toBeGreaterThan(0)
  expect(masura.subsol, 'subsolul nu s-a randat pe ' + cale).toBeGreaterThan(0)
  expect(masura.jsCitite, 'niciun script de pe origine citit pe ' + cale).toBeGreaterThan(0)
  return masura
}

/** Analitica oprita: nimic din consimtamant in pagina si nimic plecat. */
function verificaOprita(m: MasuraInainte, cale: string): void {
  expect(m.bannerInDom, 'banner cu analitica oprita pe ' + cale).toBe(0)
  expect(m.bannerInHtmlServit).toBe(false)
  expect(m.legatura, 'legatura "Setari cookie-uri" cu analitica oprita pe ' + cale).toBe(0)
  expect(m.legaturaInHtmlServit).toBe(false)
  expect(m.scriptAnalitica).toBe(0)
  expect(m.gtag).toBe('undefined')
  expect(straine(m.retea), 'cereri catre terti pe ' + cale).toEqual([])
  expect(fonturiGoogle(m.retea), 'fonturi cerute de la Google pe ' + cale).toEqual([])
  expect(m.cookies, 'cookie-uri pe ' + cale).toEqual([])
  expect(m.stocare, 'stocare pe ' + cale).toEqual([])
  // Nici codul: fara analitica, JavaScript-ul paginii nu poarta incarcatorul GA4 si nici bannerul.
  expect(m.jsCuGoogle, 'incarcatorul GA4 e in JavaScript-ul paginii cu analitica oprita, pe ' + cale).toEqual([])
  expect(m.jsCuConsimtamant, 'codul bannerului e in JavaScript-ul paginii cu analitica oprita, pe ' + cale).toEqual([])
}

/** Analitica pornita, inainte de accept: bannerul si legatura in HTML-ul servit, nimic plecat. */
function verificaInainteDeAccept(m: MasuraInainte, cale: string): void {
  expect(m.bannerVizibil, 'bannerul nu e vizibil pe ' + cale).toBe(true)
  expect(m.bannerInHtmlServit, 'bannerul nu e in HTML-ul servit pe ' + cale).toBe(true)
  expect(m.legatura, 'legatura "Setari cookie-uri" lipseste din subsol pe ' + cale).toBe(1)
  expect(m.legaturaInHtmlServit, 'legatura e injectata de JavaScript, nu servita, pe ' + cale).toBe(true)
  expect(google(m.retea), 'cereri catre Google INAINTE de accept pe ' + cale).toEqual([])
  expect(straine(m.retea), 'cereri catre terti inainte de accept pe ' + cale).toEqual([])
  expect(fonturiGoogle(m.retea)).toEqual([])
  expect(m.scriptAnalitica).toBe(0)
  expect(m.gtag).toBe('undefined')
  expect(m.cookies, 'cookie-uri inainte de alegere pe ' + cale).toEqual([])
  expect(m.stocare, 'stocare inainte de alegere pe ' + cale).toEqual([])
  // Bucata bannerului se incarca (e randat), dar incarcatorul GA4 nu, pana la accept.
  expect(m.jsCuConsimtamant.length, 'bucata bannerului nu e in JavaScript-ul incarcat pe ' + cale).toBeGreaterThan(0)
  expect(m.jsCuGoogle, 'incarcatorul GA4 e in pagina INAINTE de accept, pe ' + cale).toEqual([])
}

// ---------------------------------------------------------------------------------------------
// 1. Build-ul real, in starea din configurare si din mediu
// ---------------------------------------------------------------------------------------------

test.describe('comutatorul pe build-ul real (analitica ' + DESCRIERE_STARE + ')', () => {
  for (const cale of CAI) {
    const titlu = STARE_REALA.activa
      ? ': bannerul si legatura exista, nimic de la Google inainte de accept'
      : ': zero banner, zero legatura, zero terti, zero urmarire'
    test('pagina reala ' + cale + titlu, async ({ browser, baseURL }) => {
      const m = await masoaraInainteDeAlegere(browser, baseURL ?? '', cale, STARE_REALA.activa)
      if (STARE_REALA.activa) verificaInainteDeAccept(m, cale)
      else verificaOprita(m, cale)
    })
  }

  test('evidenta pe build-ul real: calea exista numai cu analitica pornita', async ({ request, baseURL }) => {
    const raspuns = await request.post((baseURL ?? '') + CALE_EVIDENTA, {
      data: { id: 'a1b2c3d4-0000-4000-8000-000000000000', versiune: 'ro-00000000', statistica: false, metoda: 'refuz-tot', cale: '/' },
      failOnStatusCode: false,
    })
    console.log('[build real, ' + DESCRIERE_STARE + '] POST ' + CALE_EVIDENTA + ' -> ' + raspuns.status())
    expect(raspuns.status()).toBe(STARE_REALA.activa ? 204 : 404)
  })
})

// ---------------------------------------------------------------------------------------------
// 2. Copia: operator sintetic + ID GA4 sintetic
// ---------------------------------------------------------------------------------------------

test.describe('comutatorul pornit: copie cu operator si GA4 sintetice', () => {
  let copie: CopieOperator

  test.beforeAll(async () => {
    // Build-ul copiei: ~1 min pe statie; plafonul acopera o masina mai lenta.
    test.setTimeout(300_000)
    copie = await pornesteCopiaOperator()
  })

  test.afterAll(async () => {
    await copie?.opreste()
  })

  for (const cale of CAI) {
    test('martor POZITIV: copie ' + cale + ': bannerul si legatura exista, nimic de la Google inainte de accept', async ({
      browser,
    }) => {
      verificaInainteDeAccept(await masoaraInainteDeAlegere(browser, copie.baza, cale, true), cale)
    })
  }

  test('martor POZITIV: dupa accept, EXACT o cerere catre scriptul gtag, cu ID-ul sintetic (blocata la retea)', async ({
    browser,
  }) => {
    const { context, pagina, retea } = await contextPazit(browser, copie.baza)
    await pagina.goto(copie.baza + '/', { waitUntil: 'load' })
    await expect(pagina.locator('[data-consimtamant]')).toBeVisible()
    await asteaptaLinistea(pagina, 500)
    expect(google(retea), 'Google cerut inainte de accept').toEqual([])
    const jsInainte = await jsIncarcat(retea)

    await pagina.locator('[data-consimtamant] [data-accept]').click()
    await expect.poll(() => scriptGa(retea).length, { timeout: 10_000 }).toBeGreaterThan(0)
    await expect(pagina.locator('[data-consimtamant]')).toBeHidden()
    // O cerere in plus ar veni dintr-o a doua incarcare a scriptului: se lasa timp sa apara.
    await pagina.waitForTimeout(1500)

    const cereri = scriptGa(retea)
    const consimtamant = await semnale(pagina)
    const aleasa = await alegerea(pagina)
    const jsDupa = await jsIncarcat(retea)
    await context.close()
    console.log(
      '[copie, accept] script: ' + cereri.join(', ') + ' | semnale: ' + JSON.stringify(consimtamant) +
        ' | JS cu incarcatorul GA4, inainte: ' + (cuSir(jsInainte, [SCRIPT_GOOGLE]).join(', ') || '(niciunul)') +
        ', dupa: ' + (cuSir(jsDupa, [SCRIPT_GOOGLE]).join(', ') || '(niciunul)'),
    )

    // Bucata incarcatorului se cere abia la accept: inainte nu e in pagina, dupa e.
    expect(jsInainte.length, 'niciun script citit inainte de accept').toBeGreaterThan(0)
    expect(cuSir(jsInainte, [SCRIPT_GOOGLE]), 'incarcatorul GA4 era in pagina inainte de accept').toEqual([])
    expect(cuSir(jsDupa, [SCRIPT_GOOGLE]).length, 'bucata incarcatorului nu s-a cerut la accept').toBeGreaterThan(0)
    expect(cereri).toHaveLength(1)
    expect(new URL(cereri[0]).searchParams.get('id')).toBe(ID_GA4_SINTETIC)
    expect(retea.blocate, 'cererea catre Google a plecat, nu a fost blocata').toContain(cereri[0])
    // Consent Mode v2: implicitul refuza tot, apoi numai statistica trece pe acordat.
    expect(consimtamant[0]).toEqual([
      'default',
      { ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied', analytics_storage: 'denied' },
    ])
    expect(consimtamant[1]).toEqual(['update', { analytics_storage: 'granted' }])
    expect(aleasa).toMatchObject({ statistica: true, metoda: 'accept-tot' })

    await expect
      .poll(() => randuriEvidenta(copie.jurnal()).filter((r) => r.id === aleasa?.id && r.metoda === 'accept-tot').length, {
        timeout: 10_000,
      })
      .toBe(1)
    const rand = randuriEvidenta(copie.jurnal()).find((r) => r.id === aleasa?.id)
    console.log('[copie, accept] evidenta: ' + JSON.stringify(rand))
    expect(rand).toMatchObject({ statistica: true, versiune: aleasa?.versiune, cale: '/' })
    expect(JSON.stringify(rand)).not.toContain('127.0.0.1')
  })

  test('martor NEGATIV: refuzul are forma acceptului si nu cere nimic de la Google, nici dupa reincarcare', async ({
    browser,
  }) => {
    const { context, pagina, retea } = await contextPazit(browser, copie.baza)
    await pagina.goto(copie.baza + '/', { waitUntil: 'load' })
    await expect(pagina.locator('[data-consimtamant]')).toBeVisible()
    await asteaptaLinistea(pagina, 500)

    // G-CONS-02 si gdprscan SITE-04, la doua latimi, cu innerWidth citit: acelasi element, aceeasi
    // cutie (deci aceeasi arie), acelasi font, acelasi nivel in DOM, acelasi fundal si acelasi
    // chenar, text de cel putin 4,5:1, marginea de cel putin 3:1 fata de banner, opacitate 1,
    // amandoua in ecran, fara niciun clic. Fundalul si marginea sunt din runda a doua a criticului
    // (25.09.2026): cutia si fontul erau egale, dar acceptul era plin (5,17:1 fata de banner) si
    // refuzul o pata aproape alba (1,10:1), adica alt nivel vizual.
    for (const latime of [1280, 390]) {
      await pagina.setViewportSize({ width: latime, height: 844 })
      await expect.poll(() => pagina.evaluate(() => window.innerWidth), { message: 'latimea ceruta nu s-a aplicat' }).toBe(latime)
      // Bannerul apare cu o tranzitie de opacitate: se asteapta starea finala, nu un cadru din ea.
      await expect
        .poll(async () => (await masoaraButoane(pagina, '[data-consimtamant]')).map((b) => b.opacitate), { timeout: 5_000 })
        .toEqual([1, 1])
      const [accept, refuz] = await masoaraButoane(pagina, '[data-consimtamant]')
      console.log(
        '[copie, simetrie] ceruta ' + latime + ' | innerWidth CITIT: ' + accept.innerWidth + ' | accept: ' +
          JSON.stringify(accept) + ' | refuz: ' + JSON.stringify(refuz),
      )
      expect(abateriSimetrie(accept, refuz), 'refuzul nu e la nivelul acceptului, la ' + accept.innerWidth).toEqual([])
    }

    // Tastatura: refuzul vine imediat dupa accept (abaterea declarata in antet).
    await pagina.locator('[data-consimtamant] [data-accept]').focus()
    await pagina.keyboard.press('Tab')
    expect(await pagina.evaluate(() => document.activeElement?.hasAttribute('data-refuz') ?? false)).toBe(true)

    await pagina.keyboard.press('Enter')
    await expect(pagina.locator('[data-consimtamant]')).toBeHidden()
    await asteaptaLinistea(pagina, 3000)
    const aleasa = await alegerea(pagina)
    expect(google(retea), 'Google cerut dupa refuz').toEqual([])
    expect(straine(retea)).toEqual([])
    expect((await context.cookies()).map((c) => c.name)).toEqual([])
    expect(await stocare(pagina)).toEqual([STOCARE_ALEGERE])
    expect(aleasa).toMatchObject({ statistica: false, metoda: 'refuz-tot' })

    // G-CONS-03: dupa refuz si reincarcare, bannerul nu revine, nimic nu pleaca, iar panoul
    // deschis din subsol arata statistica oprita.
    await pagina.reload({ waitUntil: 'load' })
    await asteaptaLinistea(pagina, 1500)
    expect(await pagina.locator('[data-consimtamant]').isVisible()).toBe(false)
    await pagina.locator('footer [data-cookie-settings]').click()
    const panou = pagina.locator('dialog[data-consimtamant-setari]')
    await expect(panou).toBeVisible()
    await expect(panou.locator('input[type="checkbox"]')).not.toBeChecked()
    expect(google(retea), 'Google cerut dupa reincarcare').toEqual([])
    // Refuzul nu aduce in pagina nici codul care incarca Google, nici inainte, nici dupa reincarcare.
    expect(cuSir(await jsIncarcat(retea), [SCRIPT_GOOGLE]), 'incarcatorul GA4 s-a cerut dupa refuz').toEqual([])
    await context.close()

    await expect
      .poll(() => randuriEvidenta(copie.jurnal()).filter((r) => r.id === aleasa?.id && r.metoda === 'refuz-tot').length, {
        timeout: 10_000,
      })
      .toBe(1)
  })

  test('nicio caseta bifata: panoul se deschide cu statistica oprita', async ({ browser }) => {
    const { context, pagina, retea } = await contextPazit(browser, copie.baza)
    await pagina.goto(copie.baza + '/', { waitUntil: 'load' })
    await expect(pagina.locator('[data-consimtamant]')).toBeVisible()
    await pagina.locator('[data-consimtamant] [data-setari]').click()
    const panou = pagina.locator('dialog[data-consimtamant-setari]')
    await expect(panou).toBeVisible()
    const casete = panou.locator('input[type="checkbox"]')
    const numar = await casete.count()
    const bifate = await casete.evaluateAll((el) => el.filter((e) => (e as HTMLInputElement).checked).length)
    const bifateInHtml = await pagina.locator('input[type="checkbox"][checked]').count()
    await asteaptaLinistea(pagina, 500)
    await context.close()
    console.log('[copie, panou] casete: ' + numar + ' | bifate: ' + bifate + ' | cu atributul checked: ' + bifateInHtml)
    // O singura caseta (statistica); categoria strict necesara are un indicator blocat, nu o caseta.
    expect(numar).toBe(1)
    expect(bifate).toBe(0)
    expect(bifateInHtml).toBe(0)
    expect(google(retea)).toEqual([])
  })

  test('panoul de setari: la 1440 x 900 centrat, 688 x 600, varful la 150; la 390 pe tot ecranul; refuzul la nivelul acceptului', async ({ browser }) => {
    // Forma masurata a sursei (componente-globale.md §7): 688 x 600, centrat, varful la 150 la 1440 x 900;
    // inaltimea e fixa la sursa, nu data de continut. Tailwind anuleaza marginea automata a
    // dialogului; fara `margin: auto` panoul sta in coltul stanga-sus, cu aceeasi marime, deci o proba
    // care masoara doar vizibilitatea nu vede nimic. Fara inaltimea fixa, panoul cu doua categorii
    // (sursa are trei) iese mai scund si varful coboara.
    const { context, pagina } = await contextPazit(browser, copie.baza)
    await pagina.setViewportSize({ width: 1440, height: 900 })
    await pagina.goto(copie.baza + '/', { waitUntil: 'load' })
    await expect(pagina.locator('[data-consimtamant]')).toBeVisible()
    await pagina.locator('[data-consimtamant] [data-setari]').click()
    const panou = pagina.locator('dialog[data-consimtamant-setari]')
    await expect(panou).toBeVisible()
    const cutie = () =>
      panou.evaluate((el) => {
        const r = el.getBoundingClientRect()
        return { stanga: r.left, sus: r.top, latime: r.width, inaltime: r.height, innerWidth: window.innerWidth, innerHeight: window.innerHeight }
      })
    const mare = await cutie()
    // Acceptul si refuzul din piciorul panoului: acelasi nivel vizual ca in primul strat. Cursorul
    // se pune intai pe refuz, deliberat: masuratoarea trebuie sa vada butonul in repaus, nu starea
    // de hover (controlul mutarii cursorului din masoaraButoane).
    await panou.locator('[data-refuz]').hover()
    const butoaneMari = await masoaraButoane(pagina, 'dialog[data-consimtamant-setari]')
    await pagina.setViewportSize({ width: 390, height: 844 })
    await expect.poll(async () => (await cutie()).innerWidth).toBe(390)
    const mic = await cutie()
    const butoaneMici = await masoaraButoane(pagina, 'dialog[data-consimtamant-setari]')
    await context.close()
    console.log('[copie, panou] ceruta 1440 x 900 | CITIT: ' + JSON.stringify(mare) + ' || ceruta 390 x 844 | CITIT: ' + JSON.stringify(mic))
    for (const [accept, refuz] of [butoaneMari, butoaneMici]) {
      console.log('[copie, panou, simetrie] innerWidth CITIT: ' + accept.innerWidth + ' | accept: ' + JSON.stringify(accept) + ' | refuz: ' + JSON.stringify(refuz))
      expect(abateriSimetrie(accept, refuz, { cutie: false }), 'refuzul din panou, la ' + accept.innerWidth).toEqual([])
    }

    expect(Math.abs(mare.latime - 688), 'latimea panoului la ' + mare.innerWidth).toBeLessThanOrEqual(2)
    expect(Math.abs(mare.inaltime - 600), 'inaltimea panoului la ' + mare.innerWidth).toBeLessThanOrEqual(2)
    expect(Math.abs(mare.stanga - (mare.innerWidth - mare.latime) / 2), 'panoul nu e centrat pe orizontala').toBeLessThanOrEqual(2)
    expect(Math.abs(mare.sus - (mare.innerHeight - mare.inaltime) / 2), 'panoul nu e centrat pe verticala').toBeLessThanOrEqual(2)
    expect(Math.abs(mare.sus - 150), 'varful panoului la ' + mare.innerHeight).toBeLessThanOrEqual(2)
    // La 390: tot ecranul, fara margini.
    expect(Math.abs(mic.stanga) + Math.abs(mic.sus), 'panoul nu porneste din colt la ' + mic.innerWidth).toBeLessThanOrEqual(1)
    expect(Math.abs(mic.latime - mic.innerWidth), 'panoul nu umple latimea la ' + mic.innerWidth).toBeLessThanOrEqual(1)
    expect(Math.abs(mic.inaltime - mic.innerHeight), 'panoul nu umple inaltimea la ' + mic.innerWidth).toBeLessThanOrEqual(1)
  })

  for (const cale of CAI) {
    test('copie ' + cale + ': retragerea din subsol opreste masurarea si sterge cookie-urile ei', async ({
      browser,
    }) => {
      const { context, pagina, retea } = await contextPazit(browser, copie.baza)
      await pagina.goto(copie.baza + cale, { waitUntil: 'load' })
      await pagina.locator('[data-consimtamant] [data-accept]').click()
      await expect.poll(() => scriptGa(retea).length, { timeout: 10_000 }).toBeGreaterThan(0)

      // Cookie-urile pe care GA4 le-ar fi scris (scriptul e blocat, deci le punem noi): retragerea
      // trebuie sa le stearga pe loc, fara reincarcare.
      const gazda = new URL(copie.baza).hostname
      const sufix = ID_GA4_SINTETIC.slice(2)
      await context.addCookies([
        { name: '_ga', value: 'GA1.1.111.222', domain: gazda, path: '/' },
        { name: '_ga_' + sufix, value: 'GS1.1.333', domain: gazda, path: '/' },
      ])
      expect((await context.cookies()).map((c) => c.name).sort()).toEqual(['_ga', '_ga_' + sufix])

      const legatura = pagina.locator('footer [data-cookie-settings]')
      expect(await legatura.boundingBox(), 'legatura din subsol nu are cutie pe ' + cale).not.toBeNull()
      await legatura.click()
      const panou = pagina.locator('dialog[data-consimtamant-setari]')
      await expect(panou).toBeVisible()
      const caseta = panou.locator('input[type="checkbox"]')
      await expect(caseta, 'panoul nu arata acordul dat').toBeChecked()
      await caseta.uncheck()
      await panou.locator('[data-salveaza]').click()
      await expect(panou).toBeHidden()

      const oprit = await pagina.evaluate(
        (id) => (window as unknown as Record<string, unknown>)['ga-disable-' + id],
        ID_GA4_SINTETIC,
      )
      const consimtamant = await semnale(pagina)
      const aleasa = await alegerea(pagina)
      const cookies = (await context.cookies()).map((c) => c.name)
      await context.close()
      console.log('[copie, retragere] ' + cale + ' | fanion: ' + oprit + ' | cookie-uri ramase: ' + (cookies.join(', ') || '(niciunul)'))

      expect(oprit).toBe(true)
      expect(consimtamant[consimtamant.length - 1]).toEqual(['update', { analytics_storage: 'denied' }])
      expect(aleasa).toMatchObject({ statistica: false, metoda: 'setari' })
      expect(cookies).toEqual([])
      await expect
        .poll(() => randuriEvidenta(copie.jurnal()).filter((r) => r.id === aleasa?.id && r.metoda === 'setari').length, {
          timeout: 10_000,
        })
        .toBe(1)
    })
  }

  for (const cale of CAI) {
    test('C-01 pe drumul cu GA4, copie ' + cale + ': detectorul portii, cu refuz', async ({ browser }) => {
      const m = await masoaraTerti(browser, copie.baza + cale, { blocheazaStraine: true })
      console.log(
        '[C-01 cu GA4] ' + cale + ' | banner: ' + m.bannerGasit + ' | refuz apasat: ' + m.refuzApasat +
          ' | gazde straine: ' + (m.gazdeStraine.join(', ') || '(niciuna)') + ' | stocare: ' + (m.cheiStocare.join(', ') || '(niciuna)'),
      )
      expect(m.totalCereri).toBeGreaterThan(0)
      expect(m.bannerGasit, 'bannerul copiei nu a fost gasit').toBe(true)
      expect(m.refuzApasat, 'refuzul nu a fost apasat, deci nu s-a masurat').toBe(true)
      expect(m.gazdeStraine).toEqual([])
      expect(m.cookiesInainte).toEqual([])
      expect(m.cheiStocareInainte).toEqual([])
      expect(m.cookies).toEqual([])
      expect(stocareNedeclarata(m)).toEqual([])
      expect(m.cheiStocare).toEqual([STOCARE_ALEGERE])
    })
  }

  test('evidenta pe copie: numai cererea cu forma exacta ajunge in jurnal', async ({ request }) => {
    const url = copie.baza + CALE_EVIDENTA
    const buna = { id: 'a1b2c3d4-0000-4000-8000-00000000c0de', versiune: 'ro-0000beef', statistica: false, metoda: 'refuz-tot', cale: '/' }
    const inainte = randuriEvidenta(copie.jurnal()).length
    const raspunsuri = {
      buna: (await request.post(url, { data: buna, failOnStatusCode: false })).status(),
      campInPlus: (await request.post(url, { data: { ...buna, ip: '203.0.113.9' }, failOnStatusCode: false })).status(),
      textLiber: (await request.post(url, { data: 'nu e json', failOnStatusCode: false })).status(),
      preaMare: (await request.post(url, { data: { ...buna, cale: '/' + 'a'.repeat(2000) }, failOnStatusCode: false })).status(),
      get: (await request.get(url, { failOnStatusCode: false })).status(),
    }
    console.log('[copie, evidenta] ' + JSON.stringify(raspunsuri))
    expect(raspunsuri).toEqual({ buna: 204, campInPlus: 400, textLiber: 400, preaMare: 413, get: 405 })
    await expect.poll(() => randuriEvidenta(copie.jurnal()).length - inainte, { timeout: 10_000 }).toBe(1)
    expect(randuriEvidenta(copie.jurnal()).some((r) => r.id === buna.id)).toBe(true)
  })
})

// ---------------------------------------------------------------------------------------------
// 3. Martorii detectoarelor de fonturi si de stocare (serverul de fixturi, cereri blocate la retea)
// ---------------------------------------------------------------------------------------------

test.describe('detectoarele: fonturile Google, stocarea IndexedDB si simetria butoanelor', () => {
  let fixturi: ServerFixturi

  test.beforeAll(async () => {
    fixturi = await pornesteFixturile()
  })

  test.afterAll(async () => {
    await fixturi.oprire()
  })

  test('martor POZITIV: foaia de fonturi ceruta de la Google TREBUIE prinsa (si blocata)', async ({ browser }) => {
    const { context, pagina, retea } = await contextPazit(browser, fixturi.baza)
    await pagina.goto(fixturi.baza + '/fonturi/google', { waitUntil: 'load' })
    await asteaptaLinistea(pagina, 500)
    await context.close()
    console.log('[fonturi martor pozitiv] ' + fonturiGoogle(retea).join(', '))
    expect(fonturiGoogle(retea).length).toBeGreaterThan(0)
    expect(retea.blocate).toEqual(expect.arrayContaining(fonturiGoogle(retea)))
  })

  test('martor NEGATIV: fontul de pe aceeasi origine NU trebuie prins', async ({ browser }) => {
    const { context, pagina, retea } = await contextPazit(browser, fixturi.baza)
    await pagina.goto(fixturi.baza + '/fonturi/proprii', { waitUntil: 'load' })
    await asteaptaLinistea(pagina, 500)
    await context.close()
    // Controlul: fontul propriu chiar s-a cerut, deci pagina a ajuns la el.
    expect(retea.cereri.some((u) => u.includes('/fonturi/proprie.woff2'))).toBe(true)
    expect(fonturiGoogle(retea)).toEqual([])
  })

  test('martor POZITIV: o baza IndexedDB deschisa la incarcare TREBUIE vazuta', async ({ browser }) => {
    const { context, pagina } = await contextPazit(browser, fixturi.baza)
    await pagina.goto(fixturi.baza + '/stocare/indexeddb', { waitUntil: 'load' })
    await asteaptaLinistea(pagina, 500)
    const chei = await stocare(pagina)
    await context.close()
    console.log('[stocare martor pozitiv] ' + chei.join(', '))
    expect(chei).toEqual(['indexedDB:urmarire-proba'])
  })

  test('martor NEGATIV: pagina fara stocare NU trebuie prinsa', async ({ browser }) => {
    const { context, pagina } = await contextPazit(browser, fixturi.baza)
    await pagina.goto(fixturi.baza + '/terti/bun', { waitUntil: 'load' })
    await asteaptaLinistea(pagina, 500)
    const chei = await stocare(pagina)
    await context.close()
    expect(chei).toEqual([])
  })

  /** Abaterile de simetrie ale unei fixturi, masurate cu acelasi cod ca bannerul copiei. */
  async function simetrieFixtura(browser: Browser, cale: string): Promise<string[]> {
    const { context, pagina } = await contextPazit(browser, fixturi.baza)
    await pagina.goto(fixturi.baza + cale, { waitUntil: 'load' })
    const [accept, refuz] = await masoaraButoane(pagina, '[data-consimtamant]')
    await context.close()
    const abateri = abateriSimetrie(accept, refuz)
    console.log(
      '[simetrie ' + cale + '] innerWidth CITIT: ' + accept.innerWidth + ' | margine: ' + accept.contrastMargine.toFixed(2) +
        ' / ' + refuz.contrastMargine.toFixed(2) + ' | abateri: ' + (abateri.join('; ') || '(niciuna)'),
    )
    return abateri
  }

  test('martor POZITIV: acceptul plin langa refuzul deschis (forma pana la 25.09) TREBUIE prins', async ({ browser }) => {
    const abateri = await simetrieFixtura(browser, '/simetrie/rau')
    // Cutia, fontul si nivelul sunt egale in fixtura: numai tratamentul le desparte.
    expect(abateri).toHaveLength(2)
    expect(abateri[0]).toMatch(/^refuzul se desprinde de suport doar 1\.10:1/)
    expect(abateri[1]).toMatch(/^fundal diferit/)
  })

  test('martor POZITIV: doua butoane deschise, fara chenar, TREBUIE prinse, desi sunt egale', async ({ browser }) => {
    const abateri = await simetrieFixtura(browser, '/simetrie/sterse')
    expect(abateri).toHaveLength(2)
    expect(abateri[0]).toMatch(/^acceptul se desprinde de suport doar 1\.10:1/)
    expect(abateri[1]).toMatch(/^refuzul se desprinde de suport doar 1\.10:1/)
  })

  test('martor POZITIV: doua butoane in albastru la 10% opacitate TREBUIE prinse, nu trec drept pline', async ({ browser }) => {
    const abateri = await simetrieFixtura(browser, '/simetrie/translucide')
    // Pe fiecare buton: textul si marginea nu se pot masura pe un fundal care nu e opac.
    expect(abateri).toHaveLength(4)
    expect(abateri.filter((x) => /^(acceptul|refuzul) se desprinde de suport doar NaN:1/.test(x))).toHaveLength(2)
    expect(abateri.filter((x) => /^textul (acceptului|refuzului) are contrast NaN:1/.test(x))).toHaveLength(2)
  })

  test('martor NEGATIV: acceptul si refuzul pline, in aceeasi culoare, NU trebuie prinse', async ({ browser }) => {
    expect(await simetrieFixtura(browser, '/simetrie/bun')).toEqual([])
  })

  test('martor NEGATIV: acceptul si refuzul deschise, cu chenar de peste 3:1, NU trebuie prinse', async ({ browser }) => {
    expect(await simetrieFixtura(browser, '/simetrie/bun-chenar')).toEqual([])
  })
})
