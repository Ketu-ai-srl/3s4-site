import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { expect, test } from './ajutor/baza'
import { mediuProfil3sMd, pornesteCopia3sMd, type Copie3sMd } from './ajutor/copie-3s-md'
import { RADACINA } from './ajutor/proiect'
import { ECHIVALENTE } from '../../src/content/echivalente'
import { EDITII, editiiDinText, type Editie } from '../../src/lib/editii'

/**
 * Proba de acceptanta a domeniului 3s.md (limbile, semnalele de limba, canalele si formularele), pe COPIA construita si servita cu
 * variabilele aplicatiei 3s.md (`ajutor/copie-3s-md.ts`, profilul `config/profil-3s-md.json`).
 *
 * Caile NU se scriu aici: se iau din `/sitemap.xml` al copiei, deci o pagina noua intra singura in proba. Martorul
 * listei: multimea din harta de site trebuie sa fie egala cu un CONTROL calculat din sursa (documentele cu poarta B
 * din `config/juridic-rute.json`, in ambele limbi, plus caile scrise in manifestele de rute ale editiilor
 * `src/content/rute-en-*.ts` si `rute-ro-md.ts`, cu `inHarta: true`) si sa aiba mai mult de 10 cai. O harta de
 * site goala sau taiata pica aici, nu trece tacut prin "zero defecte".
 *
 * Pe fiecare cale, pe HTML-ul servit (fara JavaScript) si pe antetele raspunsului:
 *   - 200; `<html lang>` si `Content-Language` ale editiei, dupa prefixul caii, din catalogul EDITII;
 *   - zero `<form`; zero legaturi spre /inregistrare, /descarca, /preturi; zero `RON` (cuvant intreg, cu majuscule);
 *   - in subsol: legatura WhatsApp spre numarul canalului, `tel:` cu telefonul canalului si legatura spre
 *     informatiile legale in romana (adresa din `config/juridic-rute.json`);
 *   - JSON-LD: cel putin un `telephone`, toate egale cu telefonul canalului (`CANALE_JSON` din profil).
 * Pe server: /inregistrare, /descarca, /preturi si POST /api/formular raspund 404.
 * Paginile cu pereche hreflang (alternate spre alta pagina) sunt exact cele din `src/content/echivalente.ts` cu cel
 * putin doua editii ale profilului; reciprocitatea perechilor o masoara `poarta-reciprocitate.py`.
 *
 * Fiecare detector are martor POZITIV pe un HTML asamblat la rulare; martorul NEGATIV e un HTML corect, tot asamblat.
 */

const PROFIL = mediuProfil3sMd()
const ORIGINE = PROFIL.SITE_URL.replace(/\/+$/, '')
const CANALE = JSON.parse(PROFIL.CANALE_JSON) as { whatsapp: string; telefon: string }
const EDITII_PROFIL = editiiDinText(PROFIL.SITE_EDITII).map((c) => EDITII[c])

type Document = { en: string; ro: string; poarta: string }
const JURIDIC = JSON.parse(readFileSync(join(RADACINA, 'config', 'juridic-rute.json'), 'utf8')) as { documente: Record<string, Document> }
const INFORMATII_LEGALE_RO = JURIDIC.documente['informatii-legale'].ro

/** Caile pe care 3s.md nu le are: fara cont, fara aplicatie de descarcat, fara pretul RO. */
const INTERZISE = ['/inregistrare', '/descarca', '/pret' + 'uri']
const RON = new RegExp('\\b' + 'R' + 'ON\\b', 'g')
const WA = 'https://wa.me/' + CANALE.whatsapp
const TEL = 'tel:' + CANALE.telefon

let copie: Copie3sMd
let cai: string[] = []

/** Editia unei cai: cea cu prefixul cel mai lung care o acopera, dintre editiile profilului. */
function editiaCaii(cale: string): Editie {
  const potrivite = EDITII_PROFIL.filter((e) => e.prefix === '' || cale === e.prefix || cale.startsWith(e.prefix + '/'))
  potrivite.sort((a, b) => b.prefix.length - a.prefix.length)
  return potrivite[0]
}

function caleDin(url: string): string {
  const fara = url.split(/[?#]/)[0]
  const cale = fara.startsWith(ORIGINE) ? fara.slice(ORIGINE.length) : fara
  return cale === '' ? '/' : cale.length > 1 ? cale.replace(/\/+$/, '') : cale
}

/** Controlul listei de cai, din sursa: documentele B (ambele limbi) si caile literale din manifestele editiilor. */
function caiControl(): Set<string> {
  const control = new Set<string>()
  for (const d of Object.values(JURIDIC.documente)) {
    if (d.poarta === 'B') {
      control.add(d.en)
      control.add(d.ro)
    }
  }
  const dosar = join(RADACINA, 'src', 'content')
  for (const fisier of readdirSync(dosar).filter((f) => /^rute-(en|ro-md)(-[\w-]+)?\.ts$/.test(f))) {
    const text = readFileSync(join(dosar, fisier), 'utf8')
    for (const m of text.matchAll(/\{[^{}]*?\bcale:\s*"([^"]+)"[^{}]*?\binHarta:\s*(true|false)[^{}]*\}/g)) {
      if (m[2] === 'true') control.add(m[1])
    }
  }
  return control
}

/** Paginile care trebuie sa aiba pereche hreflang: cheile din echivalente cu cel putin doua editii ale profilului. */
function paginiCuPerecheAsteptate(): Set<string> {
  const asteptate = new Set<string>()
  for (const caiPeEditie of Object.values(ECHIVALENTE)) {
    const din = EDITII_PROFIL.map((e) => caiPeEditie[e.cod]).filter((c): c is string => typeof c === 'string')
    if (din.length >= 2) din.forEach((c) => asteptate.add(c))
  }
  return asteptate
}

// ------------------------------------------------------------------ detectorii

function hrefuri(html: string): string[] {
  return [...html.matchAll(/\shref="([^"]*)"/g)].map((m) => m[1].split('&amp;').join('&'))
}

function legaturiInterzise(html: string): string[] {
  return hrefuri(html).filter((h) => {
    const cale = caleDin(h)
    return INTERZISE.some((i) => cale === i || cale.startsWith(i + '/'))
  })
}

function formulare(html: string): number {
  return (html.match(/<form\b/gi) ?? []).length
}

function potriviriRon(html: string): number {
  return (html.match(RON) ?? []).length
}

function subsol(html: string): string {
  return /<footer\b[\s\S]*?<\/footer>/.exec(html)?.[0] ?? ''
}

/** Ce lipseste din subsol: legatura WhatsApp, `tel:`, informatiile legale in romana. */
function lipsuriSubsol(html: string): string[] {
  const h = hrefuri(subsol(html))
  const lipsa: string[] = []
  if (!h.some((x) => x === WA || x.startsWith(WA + '?'))) lipsa.push('WhatsApp ' + WA)
  if (!h.includes(TEL)) lipsa.push(TEL)
  if (!h.some((x) => caleDin(x) === INFORMATII_LEGALE_RO)) lipsa.push(INFORMATII_LEGALE_RO)
  return lipsa
}

function langHtml(html: string): string | null {
  return /<html\b[^>]*\blang="([^"]+)"/.exec(html)?.[1] ?? null
}

/** Toate valorile `telephone` din blocurile JSON-LD; un bloc care nu se parseaza da `null` in lista. */
function telefoaneLd(html: string): (string | null)[] {
  const gasite: (string | null)[] = []
  const strabate = (nod: unknown): void => {
    if (Array.isArray(nod)) nod.forEach(strabate)
    else if (nod && typeof nod === 'object') {
      for (const [cheie, valoare] of Object.entries(nod)) {
        if (cheie === 'telephone') gasite.push(typeof valoare === 'string' ? valoare : JSON.stringify(valoare))
        else strabate(valoare)
      }
    }
  }
  for (const m of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try {
      strabate(JSON.parse(m[1]))
    } catch {
      gasite.push(null)
    }
  }
  return gasite
}

/** Alternatele hreflang ale paginii spre ALTA adresa decat a ei. */
function alternateStraine(html: string, cale: string): string[] {
  const proprie = caleDin(ORIGINE + (cale === '/' ? '' : cale))
  const straine: string[] = []
  for (const m of html.matchAll(/<link\b[^>]*>/g)) {
    if (!/\brel="alternate"/.test(m[0]) || !/\bhrefLang="/i.test(m[0])) continue
    const adresa = /\bhref="([^"]+)"/.exec(m[0])?.[1]
    if (adresa && caleDin(adresa) !== proprie) straine.push(adresa)
  }
  return straine
}

type Raspuns = { status: number; html: string; limbaAntet: string | null }

/** Toate problemele unei cai; goala = cale acceptata. */
function problemeCale(cale: string, r: Raspuns): string[] {
  const editie = editiaCaii(cale)
  const p: string[] = []
  if (r.status !== 200) p.push('status ' + r.status)
  if (langHtml(r.html) !== editie.lang) p.push('<html lang="' + langHtml(r.html) + '">, asteptat ' + editie.lang)
  if (r.limbaAntet !== editie.inLanguage) p.push('Content-Language ' + r.limbaAntet + ', asteptat ' + editie.inLanguage)
  if (formulare(r.html) > 0) p.push(formulare(r.html) + ' <form')
  const interzise = legaturiInterzise(r.html)
  if (interzise.length > 0) p.push('legaturi interzise: ' + interzise.join(', '))
  if (potriviriRon(r.html) > 0) p.push(potriviriRon(r.html) + ' potriviri ' + RON.source)
  const lipsa = lipsuriSubsol(r.html)
  if (lipsa.length > 0) p.push('subsolul nu are: ' + lipsa.join(', '))
  const telefoane = telefoaneLd(r.html)
  if (telefoane.length === 0) p.push('JSON-LD fara telephone')
  const gresite = telefoane.filter((t) => t !== CANALE.telefon)
  if (gresite.length > 0) p.push('JSON-LD cu telephone diferit de canal: ' + gresite.map(String).join(', '))
  return p
}

async function servit(cale: string, init: RequestInit = {}): Promise<Raspuns> {
  const r = await fetch(copie.baza + cale, { redirect: 'manual', ...init })
  return { status: r.status, html: await r.text(), limbaAntet: r.headers.get('content-language') }
}

// ------------------------------------------------------------------ fixturi asamblate la rulare

function htmlFabricat(o: { lang?: string; form?: boolean; interzisa?: string; ron?: boolean; subsol?: string[]; telefon?: string | null; ldRupt?: boolean }): string {
  const bucati = ['<html lang="' + (o.lang ?? 'en') + '"><head>']
  if (o.telefon !== null) {
    bucati.push('<script type="application/ld+json">' + JSON.stringify({ '@graph': [{ '@type': 'Organization', telephone: o.telefon ?? CANALE.telefon }] }) + '</script>')
  }
  if (o.ldRupt) bucati.push('<script type="application/ld+json">{"@graph": [</script>')
  bucati.push('</head><body><main><p>Text</p>')
  if (o.form) bucati.push('<' + 'form action="/x"></' + 'form>')
  if (o.interzisa) bucati.push('<a href="' + o.interzisa + '">x</a>')
  if (o.ron) bucati.push('<p>9 ' + 'R' + 'ON</p>')
  bucati.push('</main><' + 'footer>')
  for (const h of o.subsol ?? [WA + '?text=x', TEL, INFORMATII_LEGALE_RO]) bucati.push('<a href="' + h + '">x</a>')
  bucati.push('</' + 'footer></body></html>')
  return bucati.join('')
}

const CORECT: Raspuns = { status: 200, html: htmlFabricat({}), limbaAntet: EDITII.en.inLanguage }

// ------------------------------------------------------------------ probele

test.beforeAll(async () => {
  test.setTimeout(600_000)
  copie = await pornesteCopia3sMd()
  const harta = await (await fetch(copie.baza + '/sitemap.xml')).text()
  cai = [...harta.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => caleDin(m[1].trim()))
})

test.afterAll(async () => {
  await copie?.opreste()
})

test('martorul listei: caile din harta de site = controlul calculat din sursa, mai mult de 10', () => {
  const control = caiControl()
  console.log('[acceptanta-3s-md] cai in harta de site: ' + cai.length + ', in controlul din sursa: ' + control.size)
  expect(new Set(cai).size, 'cai repetate in harta de site').toBe(cai.length)
  expect(cai.length).toBeGreaterThan(10)
  expect([...cai].sort()).toEqual([...control].sort())
})

test('fiecare cale din harta de site: lang, Content-Language, fara formulare, fara RON, subsol cu canale, JSON-LD cu telefonul canalului', async () => {
  test.setTimeout(180_000)
  expect(cai.length).toBeGreaterThan(10)
  const probleme: string[] = []
  let verificate = 0
  for (const cale of cai) {
    const p = problemeCale(cale, await servit(cale))
    verificate++
    for (const x of p) probleme.push(cale + ': ' + x)
  }
  console.log('[acceptanta-3s-md] cai verificate: ' + verificate + ' din ' + cai.length)
  expect(verificate).toBe(cai.length)
  expect(probleme).toEqual([])
})

test('paginile cu pereche hreflang = echivalentele cu doua editii ale profilului', async () => {
  const asteptate = paginiCuPerecheAsteptate()
  const cuPereche: string[] = []
  for (const cale of cai) {
    if (alternateStraine((await servit(cale)).html, cale).length > 0) cuPereche.push(cale)
  }
  console.log('[acceptanta-3s-md] pagini cu pereche hreflang: ' + cuPereche.length + ', asteptate din echivalente: ' + asteptate.size)
  expect(cuPereche.length).toBeGreaterThan(0)
  expect(cuPereche.sort()).toEqual([...asteptate].sort())
})

for (const cale of INTERZISE) {
  test(cale + ': 404 pe 3s.md', async () => {
    expect((await servit(cale)).status).toBe(404)
  })
}

test('POST /api/formular: 404 pe 3s.md (formularele sunt oprite pe domeniu)', async () => {
  const r = await servit('/api/formular', { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{}' })
  expect(r.status).toBe(404)
})

test('martor POZITIV: fiecare detector prinde defectul lui, pe un HTML asamblat la rulare', () => {
  const caz = (html: string, raspuns: Partial<Raspuns> = {}) => problemeCale('/', { ...CORECT, html, ...raspuns }).join(' | ')
  expect(caz(htmlFabricat({ form: true }))).toContain('<form')
  for (const i of INTERZISE) {
    expect(caz(htmlFabricat({ interzisa: i }))).toContain('legaturi interzise')
    expect(caz(htmlFabricat({ interzisa: ORIGINE + i + '/x?a=1' }))).toContain('legaturi interzise')
  }
  expect(caz(htmlFabricat({ ron: true }))).toContain('potriviri')
  expect(caz(htmlFabricat({ subsol: [TEL, INFORMATII_LEGALE_RO] }))).toContain('WhatsApp')
  expect(caz(htmlFabricat({ subsol: [WA, INFORMATII_LEGALE_RO] }))).toContain(TEL)
  expect(caz(htmlFabricat({ subsol: [WA, TEL] }))).toContain(INFORMATII_LEGALE_RO)
  expect(caz(htmlFabricat({ telefon: null }))).toContain('JSON-LD fara telephone')
  expect(caz(htmlFabricat({ telefon: CANALE.telefon + '0' }))).toContain('diferit de canal')
  expect(caz(htmlFabricat({ ldRupt: true }))).toContain('diferit de canal')
  expect(caz(htmlFabricat({ lang: 'ro' }))).toContain('<html lang="ro">')
  expect(caz(htmlFabricat({}), { limbaAntet: null })).toContain('Content-Language')
  expect(caz(htmlFabricat({}), { status: 500 })).toContain('status 500')
  // Prefixul alege editia: o cale RO-MD cu lang="en" si antet en e prinsa pe ambele.
  const roMd = problemeCale('/ro/x', CORECT).join(' | ')
  expect(roMd).toContain('<html lang="en">')
  expect(roMd).toContain('Content-Language en')
  // Alternatele spre alta pagina se vad; cele spre propria adresa nu.
  const cuAlternate = '<link rel="alternate" hrefLang="ro-MD" href="' + ORIGINE + '/ro/a"/><link rel="alternate" hrefLang="en" href="' + ORIGINE + '/a"/>'
  expect(alternateStraine(cuAlternate, '/a')).toEqual([ORIGINE + '/ro/a'])
})

test('martor NEGATIV: un HTML corect nu e acuzat, iar cuvintele care doar contin literele nu sunt RON', () => {
  expect(problemeCale('/', CORECT)).toEqual([])
  const roMd = EDITII_PROFIL.find((e) => e.prefix !== '')
  if (roMd) {
    expect(problemeCale(roMd.prefix + '/x', { ...CORECT, html: htmlFabricat({ lang: roMd.lang }), limbaAntet: roMd.inLanguage })).toEqual([])
  }
  expect(potriviriRon('<p>' + 'R' + 'ONDA, ' + 'ac' + 'RON' + 'ym, ' + 'r' + 'on</p>')).toBe(0)
  expect(legaturiInterzise('<a href="/pricing">x</a><a href="/descarcari">y</a>')).toEqual([])
  expect(alternateStraine('<link rel="alternate" hrefLang="en" href="' + ORIGINE + '"/>', '/')).toEqual([])
})
