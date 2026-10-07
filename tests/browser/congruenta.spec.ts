import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { join, relative, sep } from 'node:path'
import type { Browser, Page } from '@playwright/test'
import ts from 'typescript'
import { expect, test } from './ajutor/baza'
import { mediuProfil3sMd, pornesteCopia3sMd, type Copie3sMd } from './ajutor/copie-3s-md'
import { pornesteCopiaOperator, type CopieOperator } from './ajutor/copie-operator'
import { masoaraRaspunsul, type DeclaratieRaspuns } from './ajutor/geo'
import { RADACINA } from './ajutor/proiect'
import { citesteDeclaratiile, entitatiCuNumarul, LOC_NUMAR } from './ajutor/raspunsuri'
import { numarAfisat } from '../../src/content/canale'
import { configurareCanale } from '../../src/lib/canale-mediu'

/**
 * Congruenta paginilor 3s.md cu perechile lor de pe site-ul RO (decizia 53: aceleasi componente si aceeasi compunere,
 * cu textul in limba editiei). Build-ul real al probelor (serverul din `playwright.config.ts`) e cel romanesc; paginile
 * 3s.md vin din copia construita cu profilul 3s.md (`ajutor/copie-3s-md.ts`).
 *
 * CE SE MASOARA, pe fiecare pereche declarata in `config/congruenta/<pereche>.json`:
 *  1. Semnatura de forma, din HTML-ul servit: secventa radacinilor de sectiune din `<main>` (sectiunile care nu au alta
 *     sectiune deasupra lor in `<main>`), fiecare ca tuplu (tag; prima clasa de modul CSS fara hash, altfel prima clasa
 *     globala; `aria-labelledby`, altfel `id`; prezenta lui `aria-label`; `data-ciot`), plus multimea claselor de modul
 *     din `<main>` si numaratorile randurilor `camp`. Diferentele permise sunt numai randurile listei declarate.
 *     O clasa de modul pe care RO n-o are e permisa pe 3s.md NUMAI numita, una cu una, in `clase` pe un rand `camp` cu
 *     `ro: 0`, adica pe un element pe care RO nu-l are deloc si pe care randul il numara (vizualul fara cuvinte al
 *     pasului Store din P01, pus in locul machetei portalului): fara asta, regula "clase de modul pe 3s.md care nu
 *     exista pe RO" refuza orice componenta adaugata, oricat de declarata ar fi. Ce NU verifica: ca o clasa numita
 *     apare numai in elementul numarat (o regaseste oriunde in `<main>`).
 *  2. Stilurile calculate ale radacinilor (fundal, spatiere, `grid-template-columns`, inaltimea minima), la 1440 si la
 *     390 de pixeli, cu `innerWidth` citit din pagina.
 *  3. Zero text RO pe paginile EN (dictionarul de siruri al editiei RO, construit din sursa la rulare) si zero
 *     diacritice romanesti; zero `RON` in HTML-ul fiecarei pagini 3s.md si in bucatile JS CERUTE de ea, cu exceptia
 *     declarata in `config/congruenta/exceptii-pachet.json`.
 *  Plus G-AI-02 pe rutele EN de marketing ale copiei (declaratiile din `config/seo/en-*.json`): in "Verdict CI"
 *  build-ul e cel romanesc, iar `geo.spec.ts` urmeaza rutele lui, deci acolo rutele EN nu se masoara.
 *
 * STAREA PERECHII SE MASOARA, NU SE DECLARA. Cat timp radacina paginii 3s.md e `CorpPagina` (toate sectiunile din
 * `<main>` stau in marcajul ei, `article[data-pagina]`, fiindca nu are clasa de modul proprie, si nicio radacina de
 * sectiune nu are clasa) sau `CorpDocument` (toate radacinile sunt sectiunile lui, fara clasa si cu cheia in
 * `data-sectiune`, direct sub acelasi element `Proza`, clasa de modul `bloc_proza`), perechea e "nemigrata": se raporteaza, cu numaratorile ei, si nu se compara.
 * Altfel e migrata, indiferent ce scrie lista, si orice diferenta nedeclarata o pica. Pe o pagina nemigrata se verifica
 * totusi partea RO a fiecarui rand din lista (radacina exista o singura data, clasa exista, numaratoarea RO e cea
 * declarata), ca lista sa nu imbatraneasca in tacere.
 *
 * CONTROALELE semnaturii se fac pe o MIGRARE SIMULATA in memorie: HTML-ul RO al perechii cu randurile listei aplicate
 * (radacinile scoase, clasele scoase, numaratorile aduse la valoarea EN). Ea trebuie sa iasa verde (martorul negativ,
 * care dovedeste si ca lista se poate aplica), iar fiecare abatere trebuie s-o inroseasca: (a) o radacina scoasa,
 * (a2) o clasa de modul straina, (b) pe /platforma o radacina nedeclarata scoasa cu una declarata lasata la loc, (c) o
 * numaratoare EN schimbata cu 1, (c2) o clasa scoasa fara randul ei, (e) pagina 3s.md reala cu alta radacina decat
 * `CorpPagina`, (e2) o migrare rosie deghizata in nemigrata (un `article[data-pagina]` gol langa ea, radacinile
 * invelite intr-un `bloc_proza`, sau mutata intreaga intr-un `article[data-pagina]`, forma sloturilor lui CorpPagina).
 * (d) cere ca un text schimbat sa ramana verde, (e3) ca paginile reale CorpPagina si
 * CorpDocument ale copiei sa fie recunoscute. (a3) cere ca o clasa straina numita in `clase` pe un camp cu `ro: 0` sa
 * nu mai fie abatere, si ca aceeasi clasa sa ramana abatere fara rand, numita pe un camp pe care RO il are, sau cand
 * randul numeste alta clasa; plus, pe partea RO, o clasa "noua" care exista deja pe RO. Controlul (f), randul fara
 * cod sau cu un cod din afara listei inchise, e in `tests/congruenta.test.ts`.
 *
 * DOMENIUL verificarilor de text: paginile EN ale perechilor; al verificarii RON: toate paginile din harta site-ului
 * copiei. Bucatile JS cerute se culeg din jurnalul de retea, cu miscare permisa, cu derulare pana jos si cu paleta
 * deschisa (Ctrl K); ce se incarca abia dupa alt clic nu e cules.
 *
 * PERECHEA JURIDICA (`config/congruenta/juridic.json`): indexul `/juridic` exista numai cu operator de date, iar
 * build-ul RO al probelor are operatorul `null` (raspunde 404). Partea RO a perechii vine din copia cu operator SEE
 * sintetic (`ajutor/copie-operator.ts`), pornita numai cand o lista are pagina RO sub `/juridic`; celelalte perechi
 * raman pe build-ul probelor. Controlul: 404 pe build-ul probelor si 200 pe copie, plus un martor pozitiv pe indexul
 * EN real (cardurile scoase inrosesc perechea).
 *
 * Ce NU masoara: textul tradus in semnatura de forma (controlul (d)) si continutul care apare abia dupa clic.
 * Capturile alaturate (privite de un om) nu sunt aici.
 */

// ---------------------------------------------------------------------------------------------------------------------
// Listele declarate
// ---------------------------------------------------------------------------------------------------------------------

const DIR_CONGRUENTA = join(RADACINA, 'config', 'congruenta')

type Radacina = { tag?: string; clasa?: string; eticheta?: string; ariaLabel?: boolean; ciot?: string }
/** Codul de temei: unul, sau mai multe cand campul cade pe mai multe decizii (validarea e in `tests/congruenta.test.ts`). */
type Cod = string | string[]
type Rand =
  | { tip: 'componenta'; radacina: Radacina; cod: Cod; motiv: string }
  | { tip: 'clasa'; clasa: string; cod: Cod; motiv: string }
  /** `clase`: numai cu `ro: 0`, clasele de modul (fara hash) ale elementului adaugat pe 3s.md, una cu una. */
  | { tip: 'camp'; selector: string; ro: number; en: number; clase?: string[]; cod: Cod; motiv: string }
type Pereche = { pereche: string; ro: string; pagini_3s_md: string[]; randuri: Rand[] }

function citesteJson<T>(nume: string): T {
  return JSON.parse(readFileSync(join(DIR_CONGRUENTA, nume), 'utf8')) as T
}

/** Listele perechilor: fisierele din `config/congruenta` care au cheia `pereche`. */
function perechi(): Pereche[] {
  return readdirSync(DIR_CONGRUENTA)
    .filter((f) => f.endsWith('.json'))
    .map((f) => citesteJson<Record<string, unknown>>(f))
    .filter((j) => typeof j.pereche === 'string')
    .map((j) => j as unknown as Pereche)
}

const PERECHI = perechi()
const TEMEIURI = new Set(Object.keys(citesteJson<{ coduri: Record<string, unknown> }>('temeiuri.json').coduri))

// ---------------------------------------------------------------------------------------------------------------------
// Analiza in pagina: DOMParser pe HTML-ul servit (fara JavaScript, fara retea), intr-o pagina goala a browserului
// ---------------------------------------------------------------------------------------------------------------------

type Tuplu = { tag: string; clasa: string; eticheta: string; ariaLabel: boolean; ciot: string }
type Semnatura = {
  corp: 'CorpPagina' | 'CorpDocument' | null
  radacini: Tuplu[]
  /** Clasele de modul (fara hash) din fiecare radacina, si cele din afara oricarei radacini. */
  clasePeRadacina: string[][]
  claseInAfara: string[]
  numaratori: Record<string, number>
  areMain: boolean
}

/** Ruleaza in browser. Nu are voie sa foloseasca nimic din afara corpului ei. */
function semnaturaInPagina(arg: { html: string; selectori: string[] }): Semnatura {
  const d = new DOMParser().parseFromString(arg.html, 'text/html')
  const main = d.querySelector('main')
  const goala = { corp: null, radacini: [], clasePeRadacina: [], claseInAfara: [], numaratori: {}, areMain: false }
  if (main === null) return goala
  const modul = (c: string): string | null => {
    const m = /^(.*)__[A-Za-z0-9_-]{5}$/.exec(c)
    return m !== null && m[1].includes('_') ? m[1] : null
  }
  const radacini = [...main.querySelectorAll('section')].filter((s) => {
    const sus = s.parentElement?.closest('section') ?? null
    return sus === null || !main.contains(sus)
  })
  const clase = (el: Element): string[] => {
    const toate = [el, ...el.querySelectorAll('*')]
    return [...new Set(toate.flatMap((e) => [...e.classList].map(modul).filter((x): x is string => x !== null)))].sort()
  }
  const tuplu = (s: Element): Tuplu => {
    const cl = [...s.classList]
    return {
      tag: s.tagName.toLowerCase(),
      clasa: cl.map(modul).find((x) => x !== null) ?? cl[0] ?? '',
      eticheta: s.getAttribute('aria-labelledby') ?? s.getAttribute('id') ?? '',
      ariaLabel: s.hasAttribute('aria-label'),
      ciot: s.getAttribute('data-ciot') ?? '',
    }
  }
  const inRadacini = new Set<Element>()
  for (const r of radacini) for (const e of [r, ...r.querySelectorAll('*')]) inRadacini.add(e)
  const inAfara = [main, ...main.querySelectorAll('*')].filter((e) => !inRadacini.has(e))
  const claseInAfara = [...new Set(inAfara.flatMap((e) => [...e.classList].map(modul).filter((x): x is string => x !== null)))].sort()
  const numaratori: Record<string, number> = {}
  for (const sel of arg.selectori) numaratori[sel] = main.querySelectorAll(sel).length
  // Radacina paginii, nu prezenta marcajului: CorpPagina numai cand TOATE sectiunile din <main> stau intr-un
  // `article[data-pagina]` (un articol ramas langa o compunere migrata nu o face nemigrata); CorpDocument numai cand
  // toate radacinile sunt copiii directi ai ACELUIASI element `bloc_proza` si au forma sectiunilor lui CorpDocument:
  // fara clasa, cu cheia in `data-sectiune` (sau `data-art13` / `data-l284`). O compunere migrata invelita intr-un
  // `div` cu clasa `bloc_proza` pastreaza clasele radacinilor ei, deci nu trece drept CorpDocument.
  const articole = [...main.querySelectorAll('article[data-pagina]')]
  const toateSectiunile = [...main.querySelectorAll('section')]
  // Si nicio radacina cu clasa (de modul sau globala): sloturile lui CorpPagina (`dupaCapsula`, `final`) se randeaza
  // in articol, deci o compunere RO pusa intreaga in ele are toate sectiunile acolo, dar radacinile ei poarta clase;
  // sectiunile proprii ale lui CorpPagina (si cea a slotului de pe paginile de azi) n-au niciuna.
  const corpPagina =
    articole.length > 0 &&
    toateSectiunile.every((s) => articole.some((a) => a.contains(s))) &&
    radacini.every((r) => r.classList.length === 0)
  const proza = radacini[0]?.parentElement ?? null
  const corpDocument =
    radacini.length > 0 &&
    proza !== null &&
    [...proza.classList].map(modul).includes('bloc_proza') &&
    radacini.every(
      (r) =>
        r.parentElement === proza &&
        r.classList.length === 0 &&
        (r.hasAttribute('data-sectiune') || r.hasAttribute('data-art13') || r.hasAttribute('data-l284')),
    )
  return {
    corp: corpPagina ? 'CorpPagina' : corpDocument ? 'CorpDocument' : null,
    radacini: radacini.map(tuplu),
    clasePeRadacina: radacini.map(clase),
    claseInAfara,
    numaratori,
    areMain: true,
  }
}

/**
 * Ruleaza in browser. Migrarea simulata: HTML-ul RO cu randurile listei aplicate, plus abaterile controalelor.
 * `scoate` = indicii radacinilor de scos; `pune` = indicii radacinilor scoase de lista care raman totusi;
 * `text` = un text schimbat in prima radacina ramasa.
 */
function migrareInPagina(arg: {
  html: string
  scoase: number[]
  clase: string[]
  campuri: { selector: string; en: number }[]
  extraScoase: number[]
  pastrate: number[]
  text: boolean
  clasaStraina: string
}): string {
  const d = new DOMParser().parseFromString(arg.html, 'text/html')
  const main = d.querySelector('main')
  if (main === null) return arg.html
  const modul = (c: string): string | null => {
    const m = /^(.*)__[A-Za-z0-9_-]{5}$/.exec(c)
    return m !== null && m[1].includes('_') ? m[1] : null
  }
  const radacini = [...main.querySelectorAll('section')].filter((s) => {
    const sus = s.parentElement?.closest('section') ?? null
    return sus === null || !main.contains(sus)
  })
  const deScos = new Set([...arg.scoase.filter((i) => !arg.pastrate.includes(i)), ...arg.extraScoase])
  radacini.forEach((r, i) => {
    if (deScos.has(i)) r.remove()
  })
  for (const el of main.querySelectorAll('*')) {
    for (const c of [...el.classList]) if (arg.clase.includes(modul(c) ?? '')) el.classList.remove(c)
  }
  for (const { selector, en } of arg.campuri) {
    const gasite = [...main.querySelectorAll(selector)]
    gasite.slice(en).forEach((e) => e.remove())
    for (let i = gasite.length; i < en && gasite.length > 0; i++) gasite[gasite.length - 1].after(gasite[gasite.length - 1].cloneNode(true))
    // Un camp pe care RO nu-l are deloc (ro 0, de pilda pliul suplimentelor, d66) nu are ce clona: migrarea il FABRICA
    // in prima radacina ramasa, ca element fara clase, purtand numai atributul selectorului `[data-x]`.
    const atribut = /^\[([a-z][a-z0-9-]*)\]$/.exec(selector)
    if (gasite.length === 0 && en > 0 && atribut !== null) {
      const gazda = radacini.find((_, i) => !deScos.has(i)) ?? main
      for (let i = 0; i < en; i++) {
        const nou = d.createElement('div')
        nou.setAttribute(atribut[1], '')
        gazda.append(nou)
      }
    }
  }
  if (arg.clasaStraina !== '') {
    const prima = radacini.find((_, i) => !deScos.has(i))
    prima?.firstElementChild?.classList.add(arg.clasaStraina)
  }
  if (arg.text) {
    // Numai nodurile de text ale primei radacini ramase: structura (elementele, clasele) ramane neatinsa.
    const prima = radacini.find((_, i) => !deScos.has(i))
    if (prima) {
      const w = d.createTreeWalker(prima, NodeFilter.SHOW_TEXT)
      for (let n = w.nextNode(); n !== null; n = w.nextNode()) {
        if ((n.textContent ?? '').trim() !== '') n.textContent = 'Different words in English.'
      }
    }
  }
  return '<!DOCTYPE html>' + d.documentElement.outerHTML
}

let paginaGoala: Page | null = null

async function analizor(browser: Browser): Promise<Page> {
  if (paginaGoala === null) {
    const ctx = await browser.newContext({ javaScriptEnabled: true })
    await ctx.route('**/*', (r) => r.abort())
    paginaGoala = await ctx.newPage()
  }
  return paginaGoala
}

async function semnatura(browser: Browser, html: string, selectori: string[]): Promise<Semnatura> {
  return (await analizor(browser)).evaluate(semnaturaInPagina, { html, selectori })
}

function selectoriLista(p: Pereche): string[] {
  return p.randuri.flatMap((r) => (r.tip === 'camp' ? [r.selector] : []))
}

function potriveste(t: Tuplu, r: Radacina): boolean {
  return (Object.keys(r) as (keyof Radacina)[]).every((k) => t[k] === r[k])
}

function scrieTuplu(t: Tuplu): string {
  return t.tag + '.' + t.clasa + (t.eticheta ? '#' + t.eticheta : '') + (t.ariaLabel ? '[aria-label]' : '') + (t.ciot ? '[ciot=' + t.ciot + ']' : '')
}

/** Partea RO a listei: fiecare rand se poate aplica pe HTML-ul RO al perechii. Intoarce indicii radacinilor scoase. */
function verificaPeRo(p: Pereche, ro: Semnatura): { abateri: string[]; scoase: number[] } {
  const abateri: string[] = []
  const scoase: number[] = []
  if (!ro.areMain) abateri.push(p.ro + ': pagina RO nu are <main>')
  for (const r of p.randuri) {
    for (const c of typeof r.cod === 'string' ? [r.cod] : r.cod) {
      if (!TEMEIURI.has(c)) abateri.push(p.pereche + ': codul "' + c + '" nu e in temeiuri.json')
    }
    if (r.tip === 'componenta') {
      const idx = ro.radacini.flatMap((t, i) => (potriveste(t, r.radacina) ? [i] : []))
      if (idx.length !== 1) abateri.push(p.pereche + ': radacina ' + JSON.stringify(r.radacina) + ' se potriveste de ' + idx.length + ' ori pe RO, nu o data')
      else scoase.push(idx[0])
    }
  }
  const claseRamase = new Set([...ro.claseInAfara, ...ro.clasePeRadacina.flatMap((c, i) => (scoase.includes(i) ? [] : c))])
  for (const r of p.randuri) {
    if (r.tip === 'clasa' && !claseRamase.has(r.clasa)) abateri.push(p.pereche + ': clasa declarata "' + r.clasa + '" nu exista pe RO in afara radacinilor scoase')
    if (r.tip === 'camp' && ro.numaratori[r.selector] !== r.ro) {
      abateri.push(p.pereche + ': campul ' + r.selector + ' are ' + ro.numaratori[r.selector] + ' elemente pe RO, lista spune ' + r.ro)
    }
    // Clasele noi ale unui element adaugat: numai pe un camp pe care RO nu-l are, si numai clase pe care RO nu le are.
    if (r.tip === 'camp' && r.clase !== undefined) {
      if (r.ro !== 0) abateri.push(p.pereche + ': campul ' + r.selector + ' numeste clase noi, dar exista pe RO (ro ' + r.ro + ')')
      for (const c of r.clase) if (claseRamase.has(c)) abateri.push(p.pereche + ': clasa noua "' + c + '" a campului ' + r.selector + ' exista deja pe RO')
    }
  }
  return { abateri, scoase }
}

/** Comparatia unei pagini 3s.md migrate cu perechea ei RO, prin lista. Lista goala = congruenta. */
function compara(p: Pereche, ro: Semnatura, en: Semnatura, scoase: number[]): string[] {
  const abateri: string[] = []
  const asteptate = ro.radacini.filter((_, i) => !scoase.includes(i)).map(scrieTuplu)
  const gasite = en.radacini.map(scrieTuplu)
  if (asteptate.join('\n') !== gasite.join('\n')) {
    abateri.push('secventa radacinilor difera:\n  RO (fara cele declarate): ' + asteptate.join(' | ') + '\n  3s.md: ' + gasite.join(' | '))
  }
  const claseDeclarate = new Set(p.randuri.flatMap((r) => (r.tip === 'clasa' ? [r.clasa] : [])))
  const claseRo = new Set([...ro.claseInAfara, ...ro.clasePeRadacina.flatMap((c, i) => (scoase.includes(i) ? [] : c))])
  const claseEn = new Set([...en.claseInAfara, ...en.clasePeRadacina.flat()])
  const lipsaNedeclarate = [...claseRo].filter((c) => !claseEn.has(c) && !claseDeclarate.has(c))
  const declarateDarPrezente = [...claseDeclarate].filter((c) => claseEn.has(c))
  // O clasa pe care RO n-o are trece numai numita in `clase` pe un camp cu ro 0 (un element adaugat, numarat de rand).
  // Fara exceptarea asta regula de mai jos refuza orice componenta adaugata pe 3s.md, oricat de declarata, iar pasul
  // Store din P01 n-ar putea avea vizualul care inlocuieste macheta portalului (d43). Exceptarea numeste clase, nu
  // tipare: o clasa noua nenumita, sau numita pe un camp pe care RO il are, ramane abatere (controlul (a3)).
  const claseNoi = new Set(p.randuri.flatMap((r) => (r.tip === 'camp' && r.ro === 0 ? (r.clase ?? []) : [])))
  const inPlus = [...claseEn].filter((c) => !claseRo.has(c) && !claseNoi.has(c))
  if (lipsaNedeclarate.length > 0) abateri.push('clase de modul care lipsesc pe 3s.md fara rand in lista: ' + lipsaNedeclarate.join(', '))
  if (declarateDarPrezente.length > 0) abateri.push('clase declarate scoase, dar prezente pe 3s.md: ' + declarateDarPrezente.join(', '))
  if (inPlus.length > 0) abateri.push('clase de modul pe 3s.md care nu exista pe RO: ' + inPlus.join(', '))
  for (const r of p.randuri) {
    if (r.tip === 'camp' && en.numaratori[r.selector] !== r.en) {
      abateri.push('campul ' + r.selector + ' are ' + en.numaratori[r.selector] + ' elemente pe 3s.md, lista spune ' + r.en)
    }
  }
  return abateri
}

// ---------------------------------------------------------------------------------------------------------------------
// HTML-ul servit, de pe ambele servere
// ---------------------------------------------------------------------------------------------------------------------

let copie: Copie3sMd
let copieRo: CopieOperator | null = null
const CACHE = new Map<string, string>()

/** Perechile a caror pagina RO exista numai cu operator de date: grupul `/juridic` (404 pe build-ul probelor). */
function cuOperator(p: Pereche): boolean {
  return p.ro === '/juridic' || p.ro.startsWith('/juridic/')
}

/** Adresa paginii RO a perechii: copia cu operator pentru grupul juridic, altfel build-ul probelor. */
function adresaRo(p: Pereche, baseURL: string | undefined): string {
  if (!cuOperator(p)) return String(baseURL) + p.ro
  if (copieRo === null) throw new Error(p.pereche + ': copia cu operator nu e pornita')
  return copieRo.baza + p.ro
}

async function html(adresa: string): Promise<string> {
  const din = CACHE.get(adresa)
  if (din !== undefined) return din
  const r = await fetch(adresa, { redirect: 'manual' })
  if (r.status !== 200) throw new Error(adresa + ' a raspuns ' + r.status)
  const t = await r.text()
  CACHE.set(adresa, t)
  return t
}

function raport(linie: string): void {
  console.log('[congruenta] ' + linie)
}

/**
 * Copia se construieste cu analitica proprie pornita, ca aplicatia 3s.md din productie (care are `UMAMI_*`, pe care
 * profilul nu le poarta): fara ea, bannerul de consimtamant nu se randeaza si textul lui n-ar fi masurat. Instanta e
 * fictiva, pe masina locala, pe un port pe care nu asculta nimic: scriptul se cere numai dupa acord, iar proba nu
 * accepta niciodata. Identificatorul site-ului e sintetic.
 */
const UMAMI_FICTIV = { UMAMI_URL: 'http://127.0.0.1:' + 9, UMAMI_WEBSITE_ID: ['0c0a1b2c', '3d4e', '4f5a', '8b6c', '7d8e9f0a1b2c'].join('-') }

test.beforeAll(async () => {
  // Doua build-uri, unul dupa altul (nu in paralel: memoria statiei si a masinii CI).
  test.setTimeout(1_200_000)
  copie = await pornesteCopia3sMd(UMAMI_FICTIV)
  if (PERECHI.some(cuOperator)) copieRo = await pornesteCopiaOperator()
})

test.afterAll(async () => {
  await paginaGoala?.context().close()
  await copie?.opreste()
  await copieRo?.opreste()
})

// ---------------------------------------------------------------------------------------------------------------------
// Primele cazuri: masuratori raportate ca numar, inaintea oricarui criteriu
// ---------------------------------------------------------------------------------------------------------------------

/** Clasele de modul din CSS-ul unui build: numele local (fara hash) -> multimea hash-urilor. */
function claseCss(dirBuild: string): Map<string, Set<string>> {
  const dir = join(dirBuild, '.next', 'static', 'css')
  const harta = new Map<string, Set<string>>()
  if (!existsSync(dir)) return harta
  const fisiere: string[] = []
  const umbla = (d: string) => {
    for (const f of readdirSync(d)) {
      const c = join(d, f)
      if (statSync(c).isDirectory()) umbla(c)
      else if (f.endsWith('.css')) fisiere.push(c)
    }
  }
  umbla(dir)
  for (const f of fisiere) {
    for (const m of readFileSync(f, 'utf8').matchAll(/\.([A-Za-z][A-Za-z0-9-]*_[A-Za-z0-9_-]+?)__([A-Za-z0-9_-]{5})(?![A-Za-z0-9_-])/g)) {
      const s = harta.get(m[1]) ?? new Set<string>()
      s.add(m[2])
      harta.set(m[1], s)
    }
  }
  return harta
}

test('masuratoarea 1: hash-ul claselor de modul intre build-ul RO si copia 3s.md (Erou_erou si toate clasele comune)', () => {
  const ro = claseCss(RADACINA)
  const md = claseCss(copie.director)
  expect(ro.size, 'clase de modul in CSS-ul build-ului RO').toBeGreaterThan(50)
  expect(md.size, 'clase de modul in CSS-ul copiei 3s.md').toBeGreaterThan(20)
  const erouRo = [...(ro.get('Erou_erou') ?? [])]
  const erouMd = [...(md.get('Erou_erou') ?? [])]
  raport('Erou_erou: RO ' + (erouRo.join(',') || 'absent') + ' | 3s.md ' + (erouMd.join(',') || 'absent din CSS-ul copiei'))
  const comune = [...ro.keys()].filter((k) => md.has(k))
  const identice = comune.filter((k) => [...ro.get(k)!].sort().join() === [...md.get(k)!].sort().join())
  raport('clase de modul: RO ' + ro.size + ', 3s.md ' + md.size + ', comune ' + comune.length + ', cu acelasi hash ' + identice.length + ', cu hash diferit ' + (comune.length - identice.length))
  // Comparatia de forma lucreaza oricum pe numele fara hash; masuratoarea spune numai daca deductia "hash din cale si
  // nume" tine. Controlul: masuratoarea a gasit clase comune, deci zeroul de mai jos nu vine dintr-o multime goala.
  expect(comune.length).toBeGreaterThan(10)
})

// ---------------------------------------------------------------------------------------------------------------------
// 1. Semnatura de forma
// ---------------------------------------------------------------------------------------------------------------------

test('preconditia: listele perechilor exista, fiecare cu pagina RO si cel putin o pagina 3s.md', () => {
  expect(PERECHI.length, 'liste de perechi in config/congruenta').toBeGreaterThanOrEqual(10)
  for (const p of PERECHI) {
    expect(p.ro, p.pereche).toMatch(/^\//)
    expect(p.pagini_3s_md.length, p.pereche).toBeGreaterThan(0)
  }
})

test('semnatura de forma pe fiecare pereche: partea RO a listei se aplica; perechile migrate sunt congruente, cele nemigrate se raporteaza', async ({ browser, baseURL }) => {
  test.setTimeout(180_000)
  const abateri: string[] = []
  let migrate = 0
  let nemigrate = 0
  for (const p of PERECHI) {
    const ro = await semnatura(browser, await html(adresaRo(p, baseURL)), selectoriLista(p))
    const { abateri: peRo, scoase } = verificaPeRo(p, ro)
    abateri.push(...peRo)
    for (const cale of p.pagini_3s_md) {
      const en = await semnatura(browser, await html(copie.baza + cale), selectoriLista(p))
      if (!en.areMain) {
        abateri.push(p.pereche + ' ' + cale + ': pagina 3s.md nu are <main>')
        continue
      }
      if (en.corp !== null) {
        nemigrate++
        raport(p.pereche + ' ' + cale + ' <-> ' + p.ro + ': NEMIGRAT (radacina ' + en.corp + '); RO are ' + ro.radacini.length + ' radacini, din care ' + scoase.length + ' declarate scoase; lista are ' + p.randuri.length + ' randuri')
        continue
      }
      migrate++
      const d = compara(p, ro, en, scoase)
      raport(p.pereche + ' ' + cale + ' <-> ' + p.ro + ': MIGRAT, ' + (d.length === 0 ? 'congruent' : d.length + ' abateri'))
      abateri.push(...d.map((x) => p.pereche + ' ' + cale + ': ' + x))
    }
  }
  raport('perechi masurate: ' + PERECHI.length + ' liste, ' + (migrate + nemigrate) + ' pagini 3s.md, migrate ' + migrate + ', nemigrate ' + nemigrate)
  expect(migrate + nemigrate).toBe(PERECHI.reduce((s, p) => s + p.pagini_3s_md.length, 0))
  expect(abateri).toEqual([])
})

/** Migrarea simulata a unei perechi, cu abaterile cerute de un control. */
async function simulata(
  browser: Browser,
  baseURL: string,
  p: Pereche,
  extra: { extraScoase?: number[]; pastrate?: number[]; text?: boolean; clasaStraina?: string; campuri?: { selector: string; en: number }[] } = {},
): Promise<{ ro: Semnatura; en: Semnatura; scoase: number[] }> {
  const htmlRo = await html(adresaRo(p, baseURL))
  const ro = await semnatura(browser, htmlRo, selectoriLista(p))
  const { scoase } = verificaPeRo(p, ro)
  const htmlEn = await (await analizor(browser)).evaluate(migrareInPagina, {
    html: htmlRo,
    scoase,
    clase: p.randuri.flatMap((r) => (r.tip === 'clasa' ? [r.clasa] : [])),
    campuri: extra.campuri ?? p.randuri.flatMap((r) => (r.tip === 'camp' ? [{ selector: r.selector, en: r.en }] : [])),
    extraScoase: extra.extraScoase ?? [],
    pastrate: extra.pastrate ?? [],
    text: extra.text ?? false,
    clasaStraina: extra.clasaStraina ?? '',
  })
  return { ro, en: await semnatura(browser, htmlEn, selectoriLista(p)), scoase }
}

function pereche(nume: string): Pereche {
  const p = PERECHI.find((x) => x.pereche === nume)
  if (p === undefined) throw new Error('lipseste lista perechii ' + nume)
  return p
}

test('martor NEGATIV: migrarea simulata a fiecarei perechi (RO cu lista aplicata) e congruenta si e recunoscuta ca migrata', async ({ browser, baseURL }) => {
  test.setTimeout(120_000)
  const abateri: string[] = []
  for (const p of PERECHI) {
    const { ro, en, scoase } = await simulata(browser, baseURL!, p)
    expect(en.corp, p.pereche).toBeNull()
    abateri.push(...compara(p, ro, en, scoase).map((x) => p.pereche + ': ' + x))
  }
  expect(abateri).toEqual([])
})

test('martor POZITIV (a): o sectiune scoasa dintr-o copie in memorie inroseste proba', async ({ browser, baseURL }) => {
  const p = pereche('P01')
  const { ro, scoase } = await simulata(browser, baseURL!, p)
  const nedeclarata = ro.radacini.findIndex((_, i) => !scoase.includes(i))
  const { en } = await simulata(browser, baseURL!, p, { extraScoase: [nedeclarata] })
  const d = compara(p, ro, en, scoase)
  expect(d.join('\n')).toContain('secventa radacinilor difera')
})

test('martor POZITIV (b): pe /platforma, o sectiune-standard nedeclarata scoasa, cu una declarata lasata la loc, inroseste proba', async ({ browser, baseURL }) => {
  const p = pereche('P02')
  const { ro, scoase } = await simulata(browser, baseURL!, p)
  const declarata = scoase.find((i) => ro.radacini[i].clasa === 'sectiune-standard')
  const nedeclarata = ro.radacini.findIndex((t, i) => t.clasa === 'sectiune-standard' && !scoase.includes(i))
  expect(declarata, 'o radacina sectiune-standard declarata scoasa in lista P02').toBeDefined()
  expect(nedeclarata).toBeGreaterThanOrEqual(0)
  const { en } = await simulata(browser, baseURL!, p, { extraScoase: [nedeclarata], pastrate: [declarata!] })
  // Acelasi numar de radacini, alta secventa: o comparatie numai pe clase sau pe numar n-ar vedea nimic.
  expect(en.radacini.length).toBe(ro.radacini.length - scoase.length)
  expect(compara(p, ro, en, scoase).join('\n')).toContain('secventa radacinilor difera')
})

test('martor POZITIV (c): un rand camp cu numaratoarea EN schimbata cu 1 inroseste proba', async ({ browser, baseURL }) => {
  const p = PERECHI.find((x) => x.randuri.some((r) => r.tip === 'camp'))
  expect(p, 'o lista cu cel putin un rand camp').toBeDefined()
  const rand = p!.randuri.find((r) => r.tip === 'camp') as Extract<Rand, { tip: 'camp' }>
  const { ro, en, scoase } = await simulata(browser, baseURL!, p!)
  expect(compara(p!, ro, en, scoase)).toEqual([])
  const schimbata: Pereche = { ...p!, randuri: p!.randuri.map((r) => (r === rand ? { ...rand, en: rand.en + 1 } : r)) }
  expect(compara(schimbata, ro, en, scoase).join('\n')).toContain('campul ' + rand.selector)
})

test('martor POZITIV (c2): o clasa scoasa pe copie, cu randul ei `clasa` sters din lista, inroseste proba', async ({ browser, baseURL }) => {
  const p = pereche('P01')
  const rand = p.randuri.find((r) => r.tip === 'clasa') as Extract<Rand, { tip: 'clasa' }> | undefined
  expect(rand, 'lista P01 are cel putin un rand clasa').toBeDefined()
  const { ro, en, scoase } = await simulata(browser, baseURL!, p)
  const faraRand: Pereche = { ...p, randuri: p.randuri.filter((r) => r !== rand) }
  expect(compara(faraRand, ro, en, scoase).join('\n')).toContain('fara rand in lista: ' + rand!.clasa)
})

test('martor POZITIV (a2): o clasa de modul pe care RO n-o are, adaugata pe copie, inroseste proba', async ({ browser, baseURL }) => {
  const p = pereche('P01')
  const { ro, en, scoase } = await simulata(browser, baseURL!, p, { clasaStraina: 'Strain_martor__' + 'Ab1cD' })
  expect(compara(p, ro, en, scoase).join('\n')).toContain('clase de modul pe 3s.md care nu exista pe RO: Strain_martor')
})

test('martor NEGATIV si POZITIV (a3): o clasa noua trece numai numita in `clase` pe un camp pe care RO nu-l are (ro 0)', async ({ browser, baseURL }) => {
  const p = pereche('P01')
  // Clasa straina si atributul campului adaugat se asambleaza la rulare.
  const straina = 'Strain_' + 'adaugat'
  const { ro, en, scoase } = await simulata(browser, baseURL!, p, { clasaStraina: straina + '__' + 'Ab1cD' })
  const cuCamp = (roCamp: number, clase: string[]): Pereche => ({
    ...p,
    randuri: [...p.randuri, { tip: 'camp', selector: '[data-' + 'martor-adaugat]', ro: roCamp, en: 0, clase, cod: 'd43', motiv: 'Rand-martor asamblat la rulare.' }],
  })
  const inPlus = (lista: Pereche) => compara(lista, ro, en, scoase).filter((x) => x.startsWith('clase de modul pe 3s.md care nu exista pe RO'))
  // NEGATIV: numita pe un camp adaugat (ro 0), clasa nu mai e abatere.
  expect(inPlus(cuCamp(0, [straina]))).toEqual([])
  // POZITIV: fara rand, numita pe un camp pe care RO il are, sau cu randul numind alta clasa, ramane abatere.
  expect(inPlus(p).join('\n')).toContain(straina)
  expect(inPlus(cuCamp(1, [straina])).join('\n')).toContain(straina)
  expect(inPlus(cuCamp(0, ['Alta_' + 'clasa'])).join('\n')).toContain(straina)
  // POZITIV cu ACELASI prefix: randul numeste o clasa vecina (`Strain_` + alt nume). Exceptarea numeste clase, nu
  // tipare, deci clasa de pe copie ramane abatere; o scutire dupa prefix (partea dinaintea primului `_`) ar trece-o.
  expect(inPlus(cuCamp(0, ['Strain_' + 'altceva'])).join('\n')).toContain(straina)
  // POZITIV pe partea RO: o clasa "noua" care exista deja pe RO, si clase noi pe un camp pe care RO il are.
  const clasaRo = [...ro.claseInAfara, ...ro.clasePeRadacina.flatMap((c, i) => (scoase.includes(i) ? [] : c))][0]
  expect(clasaRo, 'o clasa de modul pe RO, in afara radacinilor scoase').toBeDefined()
  expect(verificaPeRo(cuCamp(0, [clasaRo]), ro).abateri.join('\n')).toContain('clasa noua "' + clasaRo + '"')
  expect(verificaPeRo(cuCamp(1, [straina]), ro).abateri.join('\n')).toContain('numeste clase noi, dar exista pe RO')
})

test('martor NEGATIV (d): un text schimbat pe copie lasa proba verde', async ({ browser, baseURL }) => {
  const p = pereche('P01')
  const { ro, en, scoase } = await simulata(browser, baseURL!, p, { text: true })
  expect(compara(p, ro, en, scoase)).toEqual([])
})

/**
 * O pereche a carei prima pagina 3s.md e INCA pe `CorpPagina`, aleasa la rulare. Controalele (e) si (e3) lucrau pe
 * P02, iar felia 103 (decizia 53) a migrat `/platform`: perechea fixa ar fi facut controlul sa masoare o pagina care
 * nu mai are forma ceruta de el.
 *
 * In lotul s4-12d (103 + 105 + 106 peste 100, 104, 122) nicio pereche nu mai are pagina 3s.md pe CorpPagina (rularea
 * CI 37237917611 a dat exact eroarea de mai jos pe (e) si (e3)). Controalele nu se sar: fara pereche nemigrata, se
 * muta pe forma CorpPagina SINTETICA a primei pagini 3s.md a lui P02, asamblata la rulare din pagina reala
 * (`inCorpPaginaInPagina`), iar raportul spune care din doua a rulat. Masuratoarea `semnatura` e aceeasi.
 */
async function perecheCorpPagina(browser: Browser): Promise<{ p: Pereche; html: string; sintetica: boolean }> {
  for (const p of PERECHI) {
    const h = await html(copie.baza + p.pagini_3s_md[0])
    if ((await semnatura(browser, h, [])).corp === 'CorpPagina') return { p, html: h, sintetica: false }
  }
  const p = pereche('P02')
  const reala = await html(copie.baza + p.pagini_3s_md[0])
  const h = await (await analizor(browser)).evaluate(inCorpPaginaInPagina, { html: reala })
  expect(h, 'forma sintetica a aterizat').not.toBe(reala)
  return { p, html: h, sintetica: true }
}

/**
 * Ruleaza in browser. Forma CorpPagina a unei compuneri migrate: radacinile din `<main>`, fara clase, mutate intr-un
 * `article[data-pagina]` (sectiunile proprii ale lui CorpPagina n-au clase si stau toate in articol).
 */
function inCorpPaginaInPagina(arg: { html: string }): string {
  const d = new DOMParser().parseFromString(arg.html, 'text/html')
  const main = d.querySelector('main')
  if (main === null) return arg.html
  const radacini = [...main.querySelectorAll('section')].filter((s) => {
    const sus = s.parentElement?.closest('section') ?? null
    return sus === null || !main.contains(sus)
  })
  const a = d.createElement('article')
  a.setAttribute('data-pagina', 'martor')
  for (const r of radacini) {
    r.removeAttribute('class')
    a.append(r)
  }
  main.append(a)
  return '<!DOCTYPE html>' + d.documentElement.outerHTML
}

test('martor POZITIV (e): o copie a paginii 3s.md cu alta radacina decat CorpPagina e tratata ca migrata si pica', async ({ browser }) => {
  const { p, html: original, sintetica } = await perecheCorpPagina(browser)
  raport('controlul (e) pe ' + p.pereche + ' ' + p.pagini_3s_md[0] + (sintetica ? ' (forma CorpPagina sintetica)' : ''))
  const reala = await semnatura(browser, original, selectoriLista(p))
  expect(reala.corp).toBe('CorpPagina')
  const alta = original.split('data-pagina=').join('data-alta-radacina=')
  expect(alta).not.toBe(original)
  const en = await semnatura(browser, alta, selectoriLista(p))
  expect(en.corp).toBeNull()
  const ro = await semnatura(browser, await html(test.info().project.use.baseURL + p.ro), selectoriLista(p))
  const { scoase } = verificaPeRo(p, ro)
  expect(compara(p, ro, en, scoase).length).toBeGreaterThan(0)
})

/**
 * Ruleaza in browser. Trei deghizari ale unei compuneri migrate in "nemigrata": un `article[data-pagina]` gol pus in
 * `<main>` langa ea (un rest lasat de o migrare pe jumatate), radacinile ei mutate intr-un `div` cu clasa data, sau
 * tot continutul din `<main>` mutat intr-un `article[data-pagina]` (forma sloturilor `dupaCapsula` si `final` ale
 * lui CorpPagina, umplute cu componentele RO).
 */
function deghizeazaInPagina(arg: { html: string; fel: 'articol' | 'proza' | 'sloturi'; clasa: string }): string {
  const d = new DOMParser().parseFromString(arg.html, 'text/html')
  const main = d.querySelector('main')
  if (main === null) return arg.html
  if (arg.fel === 'articol') {
    const a = d.createElement('article')
    a.setAttribute('data-pagina', 'rest')
    a.hidden = true
    main.prepend(a)
  } else if (arg.fel === 'sloturi') {
    const a = d.createElement('article')
    a.setAttribute('data-pagina', 'sloturi')
    while (main.firstChild !== null) a.append(main.firstChild)
    main.append(a)
  } else {
    const radacini = [...main.querySelectorAll('section')].filter((s) => {
      const sus = s.parentElement?.closest('section') ?? null
      return sus === null || !main.contains(sus)
    })
    const inv = d.createElement('div')
    inv.className = arg.clasa
    radacini[0]?.before(inv)
    for (const r of radacini) inv.append(r)
  }
  return '<!DOCTYPE html>' + d.documentElement.outerHTML
}

test('martor POZITIV (e2): o migrare simulata rosie ramane rosie cu un article[data-pagina] gol langa ea, cu radacinile intr-un bloc_proza sau mutata intreaga intr-un article[data-pagina]', async ({ browser, baseURL }) => {
  const p = pereche('P02')
  const { ro, scoase } = await simulata(browser, baseURL!, p)
  const nedeclarata = ro.radacini.findIndex((_, i) => !scoase.includes(i))
  const rosie = await simulata(browser, baseURL!, p, { extraScoase: [nedeclarata] })
  expect(rosie.en.corp).toBeNull()
  const abateriRosie = compara(p, ro, rosie.en, scoase)
  expect(abateriRosie.length).toBeGreaterThan(0)
  // Aceeasi migrare rosie, ca HTML, din nou (migrareInPagina e determinista), apoi deghizata.
  const htmlRosie = await (await analizor(browser)).evaluate(migrareInPagina, {
    html: await html(baseURL + p.ro),
    scoase,
    clase: p.randuri.flatMap((r) => (r.tip === 'clasa' ? [r.clasa] : [])),
    campuri: p.randuri.flatMap((r) => (r.tip === 'camp' ? [{ selector: r.selector, en: r.en }] : [])),
    extraScoase: [nedeclarata],
    pastrate: [],
    text: false,
    clasaStraina: '',
  })
  const clasa = 'bloc' + '_proza__' + 'AbCdE'
  for (const fel of ['articol', 'proza', 'sloturi'] as const) {
    const deghizata = await (await analizor(browser)).evaluate(deghizeazaInPagina, { html: htmlRosie, fel, clasa })
    expect(deghizata, 'deghizarea ' + fel + ' a aterizat').not.toBe(htmlRosie)
    const en = await semnatura(browser, deghizata, selectoriLista(p))
    expect(en.corp, 'deghizarea ' + fel).toBeNull()
    expect(compara(p, ro, en, scoase).length, 'deghizarea ' + fel).toBeGreaterThan(0)
  }
})

test('perechea juridica: /juridic raspunde 404 pe build-ul probelor si 200 pe copia cu operator; pe 3s.md, /legal si /ro/juridic raspund 200', async ({ baseURL }) => {
  const p = pereche('JURIDIC')
  expect(cuOperator(p)).toBe(true)
  // Martorul: build-ul probelor nu are pagina (operator null), deci copia chiar e necesara.
  expect((await fetch(baseURL + p.ro, { redirect: 'manual' })).status).toBe(404)
  expect((await fetch(adresaRo(p, baseURL), { redirect: 'manual' })).status).toBe(200)
  for (const cale of p.pagini_3s_md) expect((await fetch(copie.baza + cale, { redirect: 'manual' })).status, cale).toBe(200)
  // Martorul negativ al selectiei: o pereche din afara grupului ramane pe build-ul probelor.
  expect(adresaRo(pereche('P01'), baseURL).startsWith(String(baseURL))).toBe(true)
})

/** Ruleaza in browser. Scoate din `<main>` lista cu clasa de modul data (fara hash). */
function scoateListaInPagina(arg: { html: string; clasa: string }): string {
  const d = new DOMParser().parseFromString(arg.html, 'text/html')
  const lista = [...(d.querySelector('main')?.querySelectorAll('ul') ?? [])].find((u) => [...u.classList].some((c) => c.startsWith(arg.clasa + '__')))
  lista?.remove()
  return '<!DOCTYPE html>' + d.documentElement.outerHTML
}

test('martor POZITIV (juridic): indexul /legal real e congruent cu /juridic, iar fara carduri inroseste perechea', async ({ browser, baseURL }) => {
  const p = pereche('JURIDIC')
  const ro = await semnatura(browser, await html(adresaRo(p, baseURL)), selectoriLista(p))
  const { scoase } = verificaPeRo(p, ro)
  const original = await html(copie.baza + p.pagini_3s_md[0])
  const real = await semnatura(browser, original, selectoriLista(p))
  expect(real.corp).toBeNull()
  expect(compara(p, ro, real, scoase)).toEqual([])
  const fara = await (await analizor(browser)).evaluate(scoateListaInPagina, { html: original, clasa: 'juridic' + '_carduri' })
  expect(fara, 'mutatia a aterizat').not.toBe(original)
  const d = compara(p, ro, await semnatura(browser, fara, selectoriLista(p)), scoase).join(' | ')
  expect(d).toContain('campul [data-card-document]')
})

test('martor NEGATIV (e3): pagina juridica reala a copiei e recunoscuta CorpDocument, o pagina nemigrata (reala sau, fara ea, forma sintetica) CorpPagina', async ({ browser }) => {
  const legala = (await pagini3sMd()).find((c) => c.startsWith('/legal/'))
  expect(legala, 'o pagina juridica in harta copiei').toBeDefined()
  expect((await semnatura(browser, await html(copie.baza + legala), [])).corp).toBe('CorpDocument')
  // Pana la felia 103 controlul era P02; perechea se alege acum la rulare (`perecheCorpPagina`), cu forma sintetica
  // cand nu mai exista nicio pagina nemigrata (lotul s4-12d).
  const { p, html: h, sintetica } = await perecheCorpPagina(browser)
  raport('controlul (e3) pe ' + p.pereche + ' ' + p.pagini_3s_md[0] + (sintetica ? ' (forma CorpPagina sintetica)' : ''))
  expect((await semnatura(browser, h, [])).corp).toBe('CorpPagina')
  // Si pagina reala din care s-a asamblat forma sintetica nu e CorpPagina: altfel controlul n-ar deosebi nimic.
  if (sintetica) expect((await semnatura(browser, await html(copie.baza + p.pagini_3s_md[0]), [])).corp).toBeNull()
})

// ---------------------------------------------------------------------------------------------------------------------
// 2. Stilurile calculate ale radacinilor, la 1440 si la 390
// ---------------------------------------------------------------------------------------------------------------------

const PROPRIETATI = [
  'backgroundColor', 'backgroundImage',
  'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft',
  'marginTop', 'marginRight', 'marginBottom', 'marginLeft',
  'gridTemplateColumns', 'minHeight',
] as const

/**
 * Toleranta pentru valorile in pixeli (pistele grilei si inaltimea minima): 2 px, rotunjirea subpixelilor intre doua
 * randari. Inaltimea efectiva a radacinii nu se compara: textul difera intre limbi, deci si inaltimea.
 */
const TOLERANTA_PX = 2

type StilRadacina = Record<(typeof PROPRIETATI)[number], string>

async function stiluri(page: Page, latime: number, adresa: string, scoase: number[]): Promise<{ innerWidth: number; radacini: StilRadacina[] }> {
  await page.setViewportSize({ width: latime, height: 900 })
  await page.goto(adresa, { waitUntil: 'load' })
  return page.evaluate(
    ({ props, scoase: sc }) => {
      const main = document.querySelector('main')
      if (main === null) return { innerWidth: window.innerWidth, radacini: [] }
      const radacini = [...main.querySelectorAll('section')].filter((s) => {
        const sus = s.parentElement?.closest('section') ?? null
        return sus === null || !main.contains(sus)
      })
      return {
        innerWidth: window.innerWidth,
        radacini: radacini
          .filter((_, i) => !sc.includes(i))
          .map((r) => {
            const cs = getComputedStyle(r) as unknown as Record<string, string>
            return Object.fromEntries(props.map((p) => [p, cs[p]])) as StilRadacina
          }),
      }
    },
    { props: [...PROPRIETATI], scoase },
  )
}

function egaleCuToleranta(a: string, b: string): boolean {
  if (a === b) return true
  const na = a.match(/-?\d+(\.\d+)?px/g) ?? []
  const nb = b.match(/-?\d+(\.\d+)?px/g) ?? []
  if (na.length === 0 || na.length !== nb.length) return false
  if (a.replace(/-?\d+(\.\d+)?px/g, 'N') !== b.replace(/-?\d+(\.\d+)?px/g, 'N')) return false
  return na.every((x, i) => Math.abs(parseFloat(x) - parseFloat(nb[i])) <= TOLERANTA_PX)
}

function comparaStiluri(ro: StilRadacina[], en: StilRadacina[]): string[] {
  if (ro.length !== en.length) return ['numar de radacini diferit: RO ' + ro.length + ', 3s.md ' + en.length]
  const abateri: string[] = []
  ro.forEach((r, i) => {
    for (const p of PROPRIETATI) if (!egaleCuToleranta(r[p], en[i][p])) abateri.push('radacina ' + i + ' ' + p + ': RO "' + r[p] + '", 3s.md "' + en[i][p] + '"')
  })
  return abateri
}

test('stilurile calculate ale radacinilor, la 1440 si la 390, pe perechile migrate; martor NEGATIV si POZITIV pe aceeasi pagina RO', async ({ browser, baseURL }) => {
  test.setTimeout(240_000)
  const ctx = await browser.newContext({ reducedMotion: 'reduce' })
  const page = await ctx.newPage()
  try {
    // Martorii comparatorului: aceeasi pagina RO de doua ori e egala; cu spatierea unei radacini schimbata, nu.
    for (const latime of [1440, 390]) {
      const a = await stiluri(page, latime, baseURL + '/platforma', [])
      const b = await stiluri(page, latime, baseURL + '/platforma', [])
      expect(a.innerWidth, 'innerWidth citit din pagina').toBe(latime)
      expect(a.radacini.length).toBeGreaterThan(5)
      expect(comparaStiluri(a.radacini, b.radacini)).toEqual([])
      await page.evaluate(() => {
        const s = document.querySelectorAll('main > section')[2] as HTMLElement
        s.style.paddingTop = '137px'
        s.style.backgroundColor = 'rgb(1, 2, 3)'
      })
      const c = await page.evaluate(() => {
        const s = document.querySelectorAll('main > section')[2]
        const cs = getComputedStyle(s)
        return { paddingTop: cs.paddingTop, backgroundColor: cs.backgroundColor }
      })
      const schimbata = a.radacini.map((r, i) => (i === 2 ? { ...r, ...c } : r))
      expect(comparaStiluri(a.radacini, schimbata).length).toBe(2)
    }
    let comparate = 0
    const abateri: string[] = []
    for (const p of PERECHI) {
      const ro = await semnatura(browser, await html(adresaRo(p, baseURL)), selectoriLista(p))
      const { scoase } = verificaPeRo(p, ro)
      for (const cale of p.pagini_3s_md) {
        const en = await semnatura(browser, await html(copie.baza + cale), selectoriLista(p))
        if (en.corp !== null) continue
        for (const latime of [1440, 390]) {
          const sr = await stiluri(page, latime, adresaRo(p, baseURL), scoase)
          const se = await stiluri(page, latime, copie.baza + cale, [])
          expect(se.innerWidth).toBe(latime)
          abateri.push(...comparaStiluri(sr.radacini, se.radacini).map((x) => p.pereche + ' ' + cale + ' @' + latime + ': ' + x))
          comparate++
        }
      }
    }
    raport('stiluri: ' + comparate + ' comparatii (pagina x latime) pe perechile migrate')
    expect(abateri).toEqual([])
  } finally {
    await ctx.close()
  }
})

// ---------------------------------------------------------------------------------------------------------------------
// 3a. Zero text RO pe paginile EN: dictionarul de siruri al editiei RO, construit din sursa la rulare
// ---------------------------------------------------------------------------------------------------------------------

/**
 * Editia unui fisier din `src/`: `en` (textul EN al lui 3s.md), `ro-md` (romana lui 3s.md; in afara dictionarului, ca in
 * specificatie, dar nu se scade din el, fiindca e tot romana) sau `ro` (editia RO si piesele comune).
 */
function editiaFisierului(caleRel: string): 'en' | 'ro-md' | 'ro' {
  const c = caleRel.split(sep).join('/')
  if (/^src\/content\/en\//.test(c) || /^src\/app\/\(en\)\//.test(c) || /\.en\.tsx?$/.test(c) || /^src\/content\/[^/]*-en(-[^/]*)?\.ts$/.test(c)) return 'en'
  if (/^src\/content\/(ro-md|juridic\/md)\//.test(c) || /^src\/app\/\(romd\)\//.test(c) || /\.(romd|ro)\.tsx?$/.test(c) || /^src\/content\/[^/]*-ro-md\.ts$/.test(c)) return 'ro-md'
  return 'ro'
}

function fisiere(dir: string, ext: RegExp): string[] {
  const iesire: string[] = []
  const umbla = (d: string) => {
    for (const f of readdirSync(d)) {
      const c = join(d, f)
      if (statSync(c).isDirectory()) umbla(c)
      else if (ext.test(f)) iesire.push(c)
    }
  }
  umbla(dir)
  return iesire
}

/** Toate sirurile scrise intr-un fisier TS/TSX: literalele, sabloanele fara expresii, bucatile sabloanelor, textul JSX. */
function siruriDinSursa(cale: string): string[] {
  const sursa = ts.createSourceFile(cale, readFileSync(cale, 'utf8'), ts.ScriptTarget.Latest, true, cale.endsWith('x') ? ts.ScriptKind.TSX : ts.ScriptKind.TS)
  const iesire: string[] = []
  const vizita = (n: ts.Node) => {
    if (ts.isImportDeclaration(n) || ts.isExportDeclaration(n)) return
    if (ts.isStringLiteral(n) || ts.isNoSubstitutionTemplateLiteral(n)) iesire.push(n.text)
    else if (ts.isTemplateHead(n) || ts.isTemplateMiddle(n) || ts.isTemplateTail(n)) iesire.push(n.text)
    else if (ts.isJsxText(n)) iesire.push(n.text)
    n.forEachChild(vizita)
  }
  vizita(sursa)
  return iesire
}

/** Un nume de constanta sau de variabila care spune ca valoarea e in engleza: `BANNER_EN_BAZA`, `PANOU_EN`, `texteEn`. */
const NUME_EN = /(^|_)EN(_|$)|[a-z0-9]En$/

/** O conditie `x === "en"`. Numai egalitatea: pe `!==` ramura "da" e cealalta limba. */
function conditieEn(e: ts.Expression): boolean {
  if (!ts.isBinaryExpression(e)) return false
  const op = e.operatorToken.kind
  if (op !== ts.SyntaxKind.EqualsEqualsEqualsToken && op !== ts.SyntaxKind.EqualsEqualsToken) return false
  return [e.left, e.right].some((x) => ts.isStringLiteral(x) && x.text === 'en')
}

function inauntru(n: ts.Node, sus: ts.Node): boolean {
  return n.pos >= sus.pos && n.end <= sus.end
}

/**
 * Ramura in engleza a unui modul bilingv (de pilda textele bannerului de consimtamant): sirul sta in valoarea unei
 * chei `en`, in initializarea unei constante cu nume EN, sau pe ramura "da" a unei conditii `limba === "en"`.
 */
function peRamuraEn(n: ts.Node): boolean {
  for (let p = n.parent; p !== undefined; p = p.parent) {
    if (ts.isPropertyAssignment(p) && (ts.isIdentifier(p.name) || ts.isStringLiteral(p.name)) && p.name.text === 'en' && inauntru(n, p.initializer)) return true
    if (ts.isVariableDeclaration(p) && ts.isIdentifier(p.name) && NUME_EN.test(p.name.text) && p.initializer !== undefined && inauntru(n, p.initializer)) return true
    if (ts.isIfStatement(p) && conditieEn(p.expression) && inauntru(n, p.thenStatement)) return true
    if (ts.isConditionalExpression(p) && conditieEn(p.condition) && inauntru(n, p.whenTrue)) return true
  }
  return false
}

/** Sirurile unui fisier, impartite: cele de pe o ramura EN (`peRamuraEn`) si restul. */
function siruriPeLimba(cale: string): { en: string[]; rest: string[] } {
  const sursa = ts.createSourceFile(cale, readFileSync(cale, 'utf8'), ts.ScriptTarget.Latest, true, cale.endsWith('x') ? ts.ScriptKind.TSX : ts.ScriptKind.TS)
  const en: string[] = []
  const rest: string[] = []
  const vizita = (n: ts.Node) => {
    if (ts.isImportDeclaration(n) || ts.isExportDeclaration(n)) return
    if (ts.isStringLiteral(n) || ts.isNoSubstitutionTemplateLiteral(n) || ts.isTemplateHead(n) || ts.isTemplateMiddle(n) || ts.isTemplateTail(n) || ts.isJsxText(n)) {
      ;(peRamuraEn(n) ? en : rest).push(n.text)
    }
    n.forEachChild(vizita)
  }
  vizita(sursa)
  return { en, rest }
}

/** Spatii normalizate si marcajul in linie scos (`[text](adresa)` -> text, `**`). */
function curata(s: string): string {
  return s
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .split('**').join('')
    .replace(/\s+/g, ' ')
    .trim()
}

function areDouaCuvinte(s: string): boolean {
  return s.split(' ').filter((c) => /\p{L}/u.test(c)).length >= 2
}

type ListaAlba = { siruri: { sir: string; motiv: string }[]; elemente: { selector: string; motiv: string }[] }
const LISTA_ALBA = citesteJson<ListaAlba>('lista-alba-text.json')

/**
 * Dictionarul RO: sirurile modulelor `src/content/**` ale editiei RO, ale componentelor `src/components/**` si ale
 * paginilor RO din `src/app/**` (acestea scriu si ele text direct, de pilda pagina de e-facturare), de cel putin 2
 * cuvinte. Se scad sirurile care apar si in sursa EN a lui 3s.md (acolo sunt text EN sau un nume comun ambelor limbi)
 * si cele din lista alba. Sirurile de pe ramurile EN ale modulelor bilingve din fisierele RO (`peRamuraEn`) intra in
 * multimea EN, nu in dictionar.
 */
function dictionarRo(): { siruri: string[]; fisiere: number; scazuteEn: number; ramuriEn: number } {
  const toate = [
    ...fisiere(join(RADACINA, 'src', 'content'), /\.tsx?$/),
    ...fisiere(join(RADACINA, 'src', 'components'), /\.tsx?$/),
    ...fisiere(join(RADACINA, 'src', 'app'), /\.tsx?$/),
  ]
  const ro = new Set<string>()
  const en = new Set<string>()
  let numarate = 0
  let ramuriEn = 0
  for (const f of toate) {
    const editia = editiaFisierului(relative(RADACINA, f))
    if (editia === 'ro-md') continue
    if (editia === 'ro') numarate++
    const { en: peEn, rest } = siruriPeLimba(f)
    // Intr-un fisier RO, ramurile EN ale unui modul bilingv sunt text EN, nu dictionar RO.
    for (const s of rest) {
      const c = curata(s)
      if (areDouaCuvinte(c)) (editia === 'en' ? en : ro).add(c)
    }
    for (const s of peEn) {
      const c = curata(s)
      if (!areDouaCuvinte(c)) continue
      en.add(c)
      if (editia === 'ro') ramuriEn++
    }
  }
  const alba = new Set(LISTA_ALBA.siruri.map((x) => x.sir))
  const siruri = [...ro].filter((s) => !en.has(s) && !alba.has(s))
  return { siruri, fisiere: numarate, scazuteEn: [...ro].filter((s) => en.has(s)).length, ramuriEn }
}

type TextPagina = { text: string; diacritice: string[]; banner: string }

/**
 * Ruleaza in browser: textul vazut si atributele accesibile ale paginii (fara `<script>`, deci fara fluxul RSC, si fara
 * elementele scutite de lista alba), plus cuvintele cu diacritice romanesti din ele.
 */
function textInPagina(arg: { html: string; scutite: string[] }): TextPagina {
  const d = new DOMParser().parseFromString(arg.html, 'text/html')
  for (const e of d.querySelectorAll('script, style, template, noscript')) e.remove()
  // Martorul bannerului de consimtamant: textul lui, citit inaintea scutirilor (gol = bannerul nu e in HTML).
  const banner = (d.body.querySelector('[data-consimtamant]')?.textContent ?? '').replace(/\s+/g, ' ').trim()
  // Numai in corp: `<html lang="ro">` al unei pagini RO s-ar potrivi altfel cu scutirea si ar sterge tot documentul.
  for (const sel of arg.scutite) for (const e of d.body.querySelectorAll(sel)) e.remove()
  const bucati: string[] = []
  const walker = d.createTreeWalker(d.body, NodeFilter.SHOW_TEXT)
  for (let n = walker.nextNode(); n !== null; n = walker.nextNode()) bucati.push(n.textContent ?? '')
  for (const e of d.querySelectorAll('[aria-label], [title], [alt], [placeholder]')) {
    for (const a of ['aria-label', 'title', 'alt', 'placeholder']) {
      const v = e.getAttribute(a)
      if (v) bucati.push(v)
    }
  }
  const text = ' ' + bucati.join(' ').replace(/\s+/g, ' ') + ' '
  return { banner, text, diacritice: text.match(/[\p{L}]*[\u0103\u00e2\u00ee\u0219\u021b\u015f\u0163\u0102\u00c2\u00ce\u0218\u021a\u015e\u0162][\p{L}]*/gu) ?? [] }
}

/** Un fragment pus inaintea ultimului `</body>` (primul `<main` din document poate sta intr-un sir al fluxului RSC). */
function inainteDeSfarsitulCorpului(h: string, fragment: string): string {
  const i = h.lastIndexOf('</body>')
  if (i < 0) throw new Error('documentul nu are </body>')
  return h.slice(0, i) + fragment + h.slice(i)
}

async function textPagina(browser: Browser, h: string): Promise<TextPagina> {
  return (await analizor(browser)).evaluate(textInPagina, { html: h, scutite: LISTA_ALBA.elemente.map((x) => x.selector) })
}

function potriviri(text: string, dictionar: string[]): string[] {
  return dictionar.filter((s) => text.includes(s))
}

let DICTIONAR: ReturnType<typeof dictionarRo> | null = null
function dictionar(): ReturnType<typeof dictionarRo> {
  DICTIONAR ??= dictionarRo()
  return DICTIONAR
}

/** Paginile EN ale perechilor (fara /ro). */
function paginiEn(): { pereche: string; cale: string }[] {
  return PERECHI.flatMap((p) => p.pagini_3s_md.filter((c) => c !== '/ro' && !c.startsWith('/ro/')).map((cale) => ({ pereche: p.pereche, cale })))
}

test('masuratoarea 3 si criteriul: zero siruri din dictionarul RO si zero diacritice pe fiecare pagina EN a perechilor', async ({ browser }) => {
  test.setTimeout(180_000)
  const dic = dictionar()
  raport('dictionarul RO: ' + dic.siruri.length + ' siruri de cel putin 2 cuvinte, din ' + dic.fisiere + ' fisiere; ' + dic.scazuteEn + ' scazute fiindca apar si in sursa EN; ' + dic.ramuriEn + ' siruri de pe ramurile EN ale fisierelor RO, trecute la EN')
  expect(dic.siruri.length).toBeGreaterThan(1000)
  const abateri: string[] = []
  for (const { pereche: nume, cale } of paginiEn()) {
    const h = await html(copie.baza + cale)
    const s = await semnatura(browser, h, [])
    const t = await textPagina(browser, h)
    const gasite = potriviri(t.text, dic.siruri)
    // Bannerul e randat (copia are analitica proprie), deci textul lui intra in masurare.
    if (t.banner === '') abateri.push(cale + ': bannerul de consimtamant lipseste din HTML, textul lui nu e masurat')
    raport(nume + ' ' + cale + ' (' + (s.corp === null ? 'migrat' : 'nemigrat') + '): ' + gasite.length + ' siruri RO, ' + t.diacritice.length + ' cuvinte cu diacritice' +
      (gasite.length > 0 ? ' | ' + gasite.slice(0, 12).map((x) => JSON.stringify(x)).join(', ') : '') +
      (t.diacritice.length > 0 ? ' | diacritice: ' + [...new Set(t.diacritice)].slice(0, 8).join(', ') : ''))
    abateri.push(...gasite.map((g) => cale + ': sir RO "' + g + '"'))
    abateri.push(...t.diacritice.map((g) => cale + ': cuvant cu diacritice "' + g + '"'))
  }
  expect(abateri).toEqual([])
})

test('martor POZITIV: "Fir de navigare" injectat intr-o copie a paginii EN e prins, iar pagina RO a perechii G1 are potrivirile ei numarate; martor NEGATIV: copia neatinsa nu il are', async ({ browser, baseURL }) => {
  const dic = dictionar()
  const sir = ['Fir', 'de', 'navigare'].join(' ')
  expect(dic.siruri, 'sirul e in dictionar').toContain(sir)
  const original = await html(copie.baza + '/platform')
  expect(potriviri((await textPagina(browser, original)).text, dic.siruri)).not.toContain(sir)
  const cuMartor = inainteDeSfarsitulCorpului(original, '<nav aria-label="' + sir + '"></nav>')
  expect(potriviri((await textPagina(browser, cuMartor)).text, dic.siruri)).toContain(sir)
  // Diacriticele: un cuvant romanesc fara pereche in dictionar (un singur cuvant) e prins de a doua verificare.
  const cuCuvant = inainteDeSfarsitulCorpului(original, '<p>Arhiv' + '\u0103</p>')
  expect((await textPagina(browser, cuCuvant)).diacritice).toContain('Arhiv' + '\u0103')
  // Dictionarul s-a construit si gaseste textul unei pagini servite: pagina RO a perechii G1, cu textul scris direct in pagina.
  const peRo = potriviri((await textPagina(browser, await html(baseURL + '/e-facturare'))).text, dic.siruri)
  raport('martorul dictionarului: pagina RO /e-facturare are ' + peRo.length + ' siruri din dictionarul RO')
  expect(peRo.length).toBeGreaterThan(50)
})

test('martor: bannerul de consimtamant e in HTML-ul paginii EN, in engleza; ramura EN a modulului bilingv e scoasa din dictionar, ramura RO ramane si e prinsa', async ({ browser }) => {
  const dic = dictionar()
  const acceptEn = ['Accept', 'all'].join(' ')
  const acceptRo = ['Accept', 'tot'].join(' ')
  const original = await html(copie.baza + '/platform')
  const t = await textPagina(browser, original)
  raport('bannerul pe /platform: ' + JSON.stringify(t.banner.slice(0, 120)) + '; ' + dic.ramuriEn + ' siruri de pe ramuri EN trecute la EN')
  expect(t.banner).toContain(acceptEn)
  expect(dic.ramuriEn).toBeGreaterThan(0)
  expect(dic.siruri).not.toContain(acceptEn)
  expect(dic.siruri).toContain(acceptRo)
  expect(potriviri(t.text, dic.siruri)).not.toContain(acceptRo)
  const cuRo = inainteDeSfarsitulCorpului(original, '<p>' + acceptRo + '</p>')
  expect(potriviri((await textPagina(browser, cuRo)).text, dic.siruri)).toContain(acceptRo)
})

// ---------------------------------------------------------------------------------------------------------------------
// 3b. Zero RON pe 3s.md: in HTML si in bucatile JS cerute de fiecare pagina
// ---------------------------------------------------------------------------------------------------------------------

/** Cu `g`, pentru numarare; `RON_UNU` (fara stare) pentru intrebarea "are". */
const RON = new RegExp('\\b' + 'R' + 'ON\\b', 'g')
const RON_UNU = new RegExp('\\b' + 'R' + 'ON\\b')

type Exceptii = { exceptii: { module: string[]; pana_la: string; motiv: string }[] }
const EXCEPTII = citesteJson<Exceptii>('exceptii-pachet.json')

/** Secventele de evadare ale unui literal JS minificat. */
function decodeaza(s: string): string {
  return s.replace(/\\(u\{([0-9a-fA-F]+)\}|u([0-9a-fA-F]{4})|x([0-9a-fA-F]{2})|(.))/g, (_, _t, cp, u, x, c) => {
    if (cp !== undefined) return String.fromCodePoint(parseInt(cp, 16))
    if (u !== undefined) return String.fromCharCode(parseInt(u, 16))
    if (x !== undefined) return String.fromCharCode(parseInt(x, 16))
    return c === 'n' ? '\n' : c === 't' ? '\t' : c
  })
}

/** Literalul JS in care sta o potrivire, decodat (bucatile minificate scriu sirurile intre ghilimele). */
function literalInJurul(text: string, poz: number): string | null {
  const evadat = (k: number) => {
    let n = 0
    while (k - 1 - n >= 0 && text[k - 1 - n] === '\\') n++
    return n % 2 === 1
  }
  for (let i = poz - 1; i >= 0 && poz - i < 4000; i--) {
    const c = text[i]
    if ((c === '"' || c === "'" || c === '`') && !evadat(i)) {
      for (let j = poz; j < text.length && j - poz < 4000; j++) {
        if (text[j] === c && !evadat(j)) return decodeaza(text.slice(i + 1, j))
      }
      return null
    }
  }
  return null
}

/** Sirurile din toata sursa `src/**` (TS, TSX si JSON), cu fisierul lor, pentru atribuirea unei potriviri pe modul. */
function indexSursa(): { sir: string; fisier: string }[] {
  const iesire: { sir: string; fisier: string }[] = []
  for (const f of fisiere(join(RADACINA, 'src'), /\.(tsx?|json)$/)) {
    const rel = relative(RADACINA, f).split('\\').join('/')
    if (f.endsWith('.json')) {
      const umbla = (v: unknown): void => {
        if (typeof v === 'string') iesire.push({ sir: v, fisier: rel })
        else if (Array.isArray(v)) v.forEach(umbla)
        else if (v !== null && typeof v === 'object') Object.values(v).forEach(umbla)
      }
      umbla(JSON.parse(readFileSync(f, 'utf8')))
    } else {
      for (const s of siruriDinSursa(f)) iesire.push({ sir: s, fisier: rel })
    }
  }
  return iesire
}

type PotrivireRon = { bucata: string; literal: string | null; module: string[]; exceptata: boolean }

function atribuie(bucata: string, corp: string, index: { sir: string; fisier: string }[]): PotrivireRon[] {
  const exceptate = new Set(EXCEPTII.exceptii.flatMap((e) => e.module))
  return [...corp.matchAll(RON)].map((m) => {
    const literal = literalInJurul(corp, m.index!)
    // Sursa unui literal: sirurile care il contin, sau, cand minificatorul a lipit mai multe, sirurile cu RON pe care
    // el le contine. Un literal scurt (sub 6 caractere) nu se atribuie: s-ar potrivi cu prea multe.
    const surse =
      literal === null || literal.length < 6
        ? []
        : [...new Set(index.filter((x) => x.sir.includes(literal) || (x.sir.length >= 6 && RON_UNU.test(x.sir) && literal.includes(x.sir))).map((x) => x.fisier))]
    return { bucata, literal, module: surse, exceptata: surse.length > 0 && surse.every((x) => exceptate.has(x)) }
  })
}

/** Bucatile JS cerute de o pagina: incarcare cu JavaScript si miscare, derulare pana jos, paleta deschisa. */
async function bucatiCerute(browser: Browser, adresa: string, schimba?: { bucata: string; adaos: string }): Promise<Map<string, string>> {
  const ctx = await browser.newContext({ reducedMotion: 'no-preference' })
  const page = await ctx.newPage()
  const cerute = new Map<string, string>()
  const asteptari: Promise<void>[] = []
  const origine = new URL(adresa).origin
  if (schimba) {
    await page.route('**/' + schimba.bucata, async (r) => {
      const raspuns = await r.fetch()
      await r.fulfill({ response: raspuns, body: (await raspuns.text()) + schimba.adaos })
    })
  }
  page.on('response', (r) => {
    const u = new URL(r.url())
    if (u.origin === origine && r.request().resourceType() === 'script') {
      asteptari.push(r.text().then((t) => void cerute.set(u.pathname, t)).catch(() => undefined))
    }
  })
  try {
    await page.goto(adresa, { waitUntil: 'networkidle' })
    for (let y = 0; y < 30; y++) {
      const gata = await page.evaluate(() => {
        window.scrollBy(0, window.innerHeight)
        return window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2
      })
      await page.waitForTimeout(120)
      if (gata) break
    }
    await page.keyboard.press('Control+k')
    await page.waitForLoadState('networkidle')
    await Promise.all(asteptari)
  } finally {
    await ctx.close()
  }
  return cerute
}

/** Paginile publice ale copiei: din harta site-ului ei. */
async function pagini3sMd(): Promise<string[]> {
  const xml = await (await fetch(copie.baza + '/sitemap.xml')).text()
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname)
}

let INDEX: { sir: string; fisier: string }[] | null = null

test('masuratoarea 2 si criteriul: zero RON in HTML-ul si in bucatile JS cerute de fiecare pagina 3s.md, in afara exceptiei declarate', async ({ browser }) => {
  test.setTimeout(420_000)
  INDEX ??= indexSursa()
  const pagini = await pagini3sMd()
  expect(pagini.length, 'pagini in harta site-ului copiei').toBeGreaterThan(10)
  const abateri: string[] = []
  const bucatiCuRon = new Map<string, PotrivireRon[]>()
  let cerereTotal = 0
  for (const cale of pagini) {
    const h = await html(copie.baza + cale)
    if ((h.match(RON) ?? []).length > 0) abateri.push(cale + ': RON in HTML-ul servit')
    const cerute = await bucatiCerute(browser, copie.baza + cale)
    cerereTotal += cerute.size
    const cuRon: string[] = []
    for (const [bucata, corp] of cerute) {
      if (!RON_UNU.test(corp)) continue
      cuRon.push(bucata)
      const atr = bucatiCuRon.get(bucata) ?? atribuie(bucata, corp, INDEX)
      bucatiCuRon.set(bucata, atr)
      for (const a of atr.filter((x) => !x.exceptata)) {
        abateri.push(cale + ': ' + bucata + ' are RON in ' + JSON.stringify((a.literal ?? '').slice(0, 80)) + ' (module: ' + (a.module.join(', ') || 'neatribuit') + ')')
      }
    }
    raport('RON ' + cale + ': ' + cerute.size + ' bucati JS cerute, ' + cuRon.length + ' cu RON' + (cuRon.length > 0 ? ' (' + cuRon.join(', ') + ')' : ''))
  }
  for (const [bucata, atr] of bucatiCuRon) {
    raport('RON in ' + bucata + ': ' + atr.length + ' aparitii, module: ' + [...new Set(atr.flatMap((a) => a.module))].join(', ') + ', exceptate ' + atr.filter((a) => a.exceptata).length)
  }
  raport('RON: ' + pagini.length + ' pagini, ' + cerereTotal + ' bucati cerute (cu repetitii), ' + bucatiCuRon.size + ' bucati distincte cu RON')
  expect(cerereTotal).toBeGreaterThan(pagini.length)
  expect(abateri).toEqual([])
})

test('martor POZITIV: o bucata ceruta cu "0 RON" injectat e prinsa; martor NEGATIV: aceeasi in afara bucatilor cerute e ignorata', async ({ browser }) => {
  test.setTimeout(120_000)
  INDEX ??= indexSursa()
  const adresa = copie.baza + '/platform'
  const curate = await bucatiCerute(browser, adresa)
  const tinta = [...curate.keys()].find((b) => !RON_UNU.test(curate.get(b)!))
  expect(tinta, 'o bucata ceruta fara RON').toBeDefined()
  const nume = tinta!.split('/').pop()!
  const adaos = ';self.__martorCongruenta="Pachetul martor costa 0 ' + 'R' + 'ON pe luna";'
  const cuMartor = await bucatiCerute(browser, adresa, { bucata: nume, adaos })
  const atr = atribuie(tinta!, cuMartor.get(tinta!)!, INDEX)
  expect(atr.length).toBe(1)
  expect(atr[0].exceptata).toBe(false)
  expect(atr[0].module).toEqual([])
  // Aceeasi bucata pusa pe disc, in build-ul copiei, sub un nume pe care nicio pagina nu-l cere: nu intra in masurare.
  const dirBucati = join(copie.director, '.next', 'static', 'chunks')
  const neceruta = 'martor-neceruta-congruenta.js'
  writeFileSync(join(dirBucati, neceruta), adaos)
  const dinNou = await bucatiCerute(browser, adresa)
  expect([...dinNou.keys()].some((b) => b.endsWith(neceruta))).toBe(false)
  expect([...dinNou.values()].some((c) => c.includes('__martorCongruenta'))).toBe(false)
  expect(readdirSync(dirBucati)).toContain(neceruta)
})

// ---------------------------------------------------------------------------------------------------------------------
// G-AI-02 pe rutele EN de marketing ale copiei
// ---------------------------------------------------------------------------------------------------------------------

/** Profilul canalelor al copiei si numarul lui afisat: valoarea pusa de cititor in locul lui `LOC_NUMAR`. */
const CANALE_PROFIL = mediuProfil3sMd().CANALE_JSON
const NUMAR_PROFIL = numarAfisat(configurareCanale(CANALE_PROFIL))

/** Declaratiile EN cum stau in fisiere (`bruta`) si cu numarul din profil pus in locul lui (`declaratie`). */
function declaratiiEn(): { cale: string; fisier: string; bruta: DeclaratieRaspuns; declaratie: DeclaratieRaspuns }[] {
  const dir = join(RADACINA, 'config', 'seo')
  return readdirSync(dir)
    .filter((f) => /^en-.*\.json$/.test(f))
    .flatMap((f) => {
      const j = JSON.parse(readFileSync(join(dir, f), 'utf8')) as { raspuns_autonom?: Record<string, DeclaratieRaspuns> }
      return Object.entries(j.raspuns_autonom ?? {}).map(([cale, bruta]) => ({
        cale,
        fisier: f,
        bruta,
        declaratie: { ...bruta, entitati: entitatiCuNumarul(bruta.entitati, CANALE_PROFIL) },
      }))
    })
}

test('declaratiile EN: numarul de pe /contact vine din profil, nu e scris in fisier', () => {
  const contact = declaratiiEn().find((d) => d.cale === '/contact')
  expect(contact, 'declaratia /contact').toBeDefined()
  expect(contact!.bruta.entitati).toContain(LOC_NUMAR)
  expect(contact!.bruta.entitati).not.toContain(NUMAR_PROFIL)
  expect(NUMAR_PROFIL).toMatch(/^\+\d+( \d+)+$/)
  // Controlul inlocuirii: dupa ea entitatea e numarul afisat, si nicio entitate nu mai poarta un loc neinlocuit.
  expect(contact!.declaratie.entitati).toContain(NUMAR_PROFIL)
  expect(declaratiiEn().flatMap((d) => d.declaratie.entitati).filter((e) => e.includes('{'))).toEqual([])
})

// Cititorul comun (`citesteDeclaratiile`, cel din geo.spec.ts) pune numarul in locul lui pe editiile build-ului:
// cu profilul 3s.md, /contact si /ro/contact poarta numarul afisat; fara profil (CANALE_JSON gol), fiecare ruta cu
// locul iese abatere care spune ce lipseste, in loc sa ajunga in proba cu o entitate pe care pagina n-o poate avea.
test('martor: cititorul declaratiilor pune numarul din profil; fara profil, abatere clara pe fiecare ruta cu locul', () => {
  expect(entitatiCuNumarul(['3S', LOC_NUMAR], CANALE_PROFIL)).toEqual(['3S', NUMAR_PROFIL])
  expect(entitatiCuNumarul(['3S'], '')).toEqual(['3S'])
  expect(() => entitatiCuNumarul(['3S', LOC_NUMAR], '')).toThrow(/CANALE_JSON/)
  const cuProfil = citesteDeclaratiile(RADACINA, [], ['en', 'ro-MD'], CANALE_PROFIL)
  expect(cuProfil.declaratii.get('/contact')?.entitati).toContain(NUMAR_PROFIL)
  expect(cuProfil.declaratii.get('/ro/contact')?.entitati).toContain(NUMAR_PROFIL)
  expect([...cuProfil.declaratii.values()].flatMap((d) => d.entitati).filter((e) => e.includes('{'))).toEqual([])
  expect(cuProfil.abateri.filter((a) => a.includes(LOC_NUMAR))).toEqual([])
  const faraProfil = citesteDeclaratiile(RADACINA, [], ['en', 'ro-MD'], '')
  const lipsa = faraProfil.abateri.filter((a) => a.includes(LOC_NUMAR))
  expect(lipsa.map((a) => a.split(': ')[1]).sort()).toEqual(['ruta /contact', 'ruta /ro/contact'])
  expect(lipsa.every((a) => a.includes('CANALE_JSON'))).toBe(true)
  expect(faraProfil.declaratii.has('/contact')).toBe(false)
})

test('G-AI-02 pe rutele EN de marketing ale copiei 3s.md: entitatile declarate si titlul in primele 400 de cuvinte, primul paragraf autonom', async ({ browser }) => {
  test.setTimeout(180_000)
  const declaratii = declaratiiEn()
  expect(declaratii.length, 'rute EN declarate in config/seo/en-*.json').toBeGreaterThanOrEqual(10)
  const abateri: string[] = []
  for (const { cale, fisier, declaratie } of declaratii) {
    const m = await masoaraRaspunsul(browser, copie.baza + cale, declaratie)
    raport('G-AI-02 ' + cale + ' (' + fisier + '): ' + m.cuvinteMain + ' cuvinte in <main>, ' + m.abateri.length + ' abateri')
    abateri.push(...m.abateri.map((a) => cale + ': ' + a))
  }
  expect(abateri).toEqual([])
})

test('martor POZITIV G-AI-02: o entitate absenta adaugata la declaratia unei rute EN pica numai pe ea', async ({ browser }) => {
  const { cale, declaratie } = declaratiiEn().find((d) => d.cale === '/platform')!
  const absenta = 'Zz' + 'entitate martor congruenta'
  const m = await masoaraRaspunsul(browser, copie.baza + cale, { ...declaratie, entitati: [...declaratie.entitati, absenta] })
  expect(m.entitatiLipsa).toEqual([absenta])
})
