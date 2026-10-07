import { createElement, type ComponentType } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'

/**
 * GLOSA EN A DEMONSTRATIEI DE CAUTARE (felia 137, decizia 75 "Romana + glosa EN"). Pe pagina EN a cautarii
 * (`/features/search` pe 3s.md, `/en/features/search` pe 3s.com.ro: aceeasi pagina, alta asezare) demonstratia ramane in
 * romana, cum raspunde produsul, iar sub fiecare intrebare si sub fiecare raspuns romanesc vizibil apare traducerea
 * lor in engleza americana, cu `lang="en"`: sub terminalul eroului (prima aparitie a intrebarii, pe primul ecran), sub
 * bara din lumina, sub cardul extragerii si sub desenul "Acum" din contrast, ca text HTML. Paginile
 * romanesti ale cautarii raman cum erau.
 *
 * CE DOVEDESTE PROBA ASTA, pe randarea statica:
 *   1. continutul: cinci glose in modulul EN, cu limba "en", ASCII, fiecare incepe cu majuscula si se termina cu semnul
 *      originalului (sau fara semn, ca originalul), cu un numar de cuvinte apropiat de al originalului; fidelitatea
 *      VERIFICABILA MECANIC, derivata din textul romanesc al scenei, nu scrisa aici: aceleasi numere, data romaneasca
 *      in forma SUA, fiecare termen al scenei din glosar cu traducerea lui ("garantie" e "warranty"), nimic din afara
 *      exemplului (3S, limba engleza); glosa din erou e aceeasi cu cea din lumina (aceeasi intrebare);
 *   2. pagina EN: exact cinci elemente `[data-glosa]` in `<main>`, in ordine (erou, lumina, extragere, doua in desen),
 *      fiecare cu `lang="en"`, in afara oricarui stramos `lang="ro"`, cu textul din modul, fiecare IMEDIAT DUPA bucata
 *      pe care o traduce (terminalul, celula barei, cardul, desenul cu textele romanesti) si, unde exista, inaintea
 *      textului care o urma inainte (primul subtitlu, indicatia, legenda); elementele cu `lang="en"` din `<main>` sunt
 *      exact glosele; glosele nu aduc nicio clasa care sa lipseasca din `<main>`-ul paginii RO (proba congruentei
 *      compara multimea claselor de modul din fiecare sectiune, deci o clasa noua numai pe EN ar fi o abatere
 *      nedeclarata);
 *   3. paginile romanesti (RO `/functionalitati/cautare-ai`; 3s.md `/ro/functionalitati/cautare-ai`, servita pe
 *      3s.com.ro la radacina): zero glose, zero texte ale glosei, zero `lang="en"`;
 *   4. componentele: cu o glosa sintetica, marcajul are EXACT elementele glosei in plus fata de continutul fara camp,
 *      cu limba primita (nu una scrisa in componenta); scoase ele, marcajul e identic cu cel fara glosa; fara camp,
 *      niciun `data-glosa` si niciun `lang`.
 * Fiecare detector are martorul lui pozitiv (o abatere fabricata e prinsa).
 *
 * CE NU DOVEDESTE: HTML-ul si fluxul RSC ale build-ului RO (invarianta pe build, `tests/invarianta-ro.test.ts`),
 * stilul calculat, locul pe ecran, primul ecran, contrastul si cele doua domenii servite
 * (`tests/browser/glosa-demo-cautare.spec.ts`), sensul traducerii dincolo de ancorele mecanice (citit de om, propozitie
 * cu propozitie). Regulile de continut ale paginilor EN (deciziile 43 si 49, "Nu spune") se aplica glosei prin
 * `tests/editie-cautare-ai.test.ts` §5, care citeste toate sirurile povestii, glosa inclusa.
 *
 * FIXTURILE se asambleaza la rulare (prefix si contor), ca fisierul sa nu poarte literal ce vaneaza.
 */

vi.hoisted(() => {
  // Canalele aplicatiei 3s.md (forma din `config/profil-3s-md.json`), cu un numar de proba: paginile citesc `CANALE`
  // la import, deci variabila se pune inaintea oricarui import al modulelor site-ului.
  process.env.CANALE_JSON = JSON.stringify({ formulare: false, whatsapp: '37300000002', telefon: '', email: '', emailSecuritate: 'security@example.test' })
})

const { default: PaginaEn } = await import('../src/app/(en)/features/search/page.en')
const { default: PaginaRo } = await import('../src/app/functionalitati/cautare-ai/page')
const { default: PaginaRoMd } = await import('../src/app/(romd)/ro/functionalitati/cautare-ai/page.romd')
const { default: LuminaVedere } = await import('../src/components/functionalitati/cautare-ai/LuminaVedere')
const { default: Extragere } = await import('../src/components/functionalitati/cautare-ai/Extragere')
const { DesenAcum } = await import('../src/components/functionalitati/cautare-ai/DeseneContrast')
const { TerminalErou } = await import('../src/components/cinema/EroulCinema')
const { default: STIL_EROU } = await import('../src/components/cinema/EroulCinema.module.css')
const EN = await import('../src/content/en/features-search')
const SCENA = await import('../src/content/functionalitati/cautare-ai-3s-md')

// ---------------------------------------------------------------------------------------------
// Unelte: un arbore minimal din marcajul static (React scrie marcaj bine format)
// ---------------------------------------------------------------------------------------------

type Nod = { tag: string; atribute: string; parinte: Nod | null; copii: (Nod | string)[] }

const GOALE = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'source', 'track', 'wbr'])

function decodeaza(t: string): string {
  return t
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
}

function arbore(html: string): Nod {
  const radacina: Nod = { tag: '#', atribute: '', parinte: null, copii: [] }
  let curent = radacina
  let i = 0
  const eticheta = /<(\/?)([a-zA-Z][a-zA-Z0-9-]*)((?:[^>"']|"[^"]*"|'[^']*')*)>/g
  for (let m = eticheta.exec(html); m !== null; m = eticheta.exec(html)) {
    const text = html.slice(i, m.index)
    if (text !== '') curent.copii.push(decodeaza(text))
    i = m.index + m[0].length
    const [, inchide, tag, atribute] = m
    const t = tag.toLowerCase()
    if (inchide) {
      for (let n: Nod | null = curent; n !== null && n !== radacina; n = n.parinte) {
        if (n.tag === t) {
          curent = n.parinte ?? radacina
          break
        }
      }
      continue
    }
    const nod: Nod = { tag: t, atribute, parinte: curent, copii: [] }
    curent.copii.push(nod)
    if (!GOALE.has(t) && !atribute.trim().endsWith('/')) curent = nod
  }
  return radacina
}

function atribut(n: Nod, nume: string): string | null {
  const m = new RegExp('\\s' + nume + '="([^"]*)"').exec(n.atribute)
  return m === null ? null : decodeaza(m[1])
}

function elemente(n: Nod): Nod[] {
  return n.copii.flatMap((c) => (typeof c === 'string' ? [] : [c, ...elemente(c)]))
}

function text(n: Nod): string {
  return n.copii.map((c) => (typeof c === 'string' ? c : text(c))).join('')
}

function subRo(n: Nod): boolean {
  for (let p = n.parinte; p !== null; p = p.parinte) if (/^ro(-|$)/.test(atribut(p, 'lang') ?? '')) return true
  return false
}

/** Sectiunea (`data-sectiune`) cea mai apropiata in care sta elementul. */
function sectiune(n: Nod): string | null {
  for (let p = n.parinte; p !== null; p = p.parinte) {
    const s = atribut(p, 'data-sectiune')
    if (s !== null) return s
  }
  return null
}

/** Fratele-element de dinainte sau de dupa, la `pas` elemente distanta (textul alb dintre ele nu conteaza). */
function frate(n: Nod, pas: number): Nod | null {
  const fratii = (n.parinte?.copii ?? []).filter((c): c is Nod => typeof c !== 'string')
  return fratii[fratii.indexOf(n) + pas] ?? null
}

function clasa(n: Nod | null): string {
  return n === null ? '' : (atribut(n, 'class') ?? '')
}

function clase(n: Nod): string[] {
  return clasa(n).split(/\s+/).filter(Boolean)
}

function html(c: ComponentType<never>, props: object = {}): string {
  return renderToStaticMarkup(createElement(c as ComponentType<object>, props))
}

/** `<main>` unui marcaj, ca arbore. */
function mainDin(h: string): Nod {
  const m = elemente(arbore(h)).find((n) => n.tag === 'main')
  expect(m, 'pagina are <main>').toBeDefined()
  return m!
}

/** `<main>` unei pagini (pagina se randeaza fara layout, deci `<main>` e al ei). */
function main(Pagina: ComponentType<never>): Nod {
  return mainDin(html(Pagina))
}

const glose = (m: Nod) => elemente(m).filter((n) => atribut(n, 'data-glosa') !== null)

/** Toate clasele din `<main>`-ul paginii RO a perechii: glosele nu au voie sa aduca alta. */
const CLASE_RO = new Set(elemente(main(PaginaRo as ComponentType<never>)).flatMap(clase))

// ---------------------------------------------------------------------------------------------
// 1. Continutul glosei
// ---------------------------------------------------------------------------------------------

const S = SCENA.SCENA_CAUTARE_3S_MD
const DESEN = EN.CONTRAST_POVESTE.acum.glosa

type Pereche = { loc: string; rol: string; glosa: { text: string; limba: string }; original: string }

/** Glosele paginii, in ordinea din pagina: sectiunea, rolul, glosa din modul si originalul romanesc afisat. */
const PERECHI: Pereche[] = [
  { loc: 'erou', rol: 'intrebare', glosa: EN.EROU_POVESTE.glosa, original: S.intrebare },
  { loc: 'lumina', rol: 'intrebare', glosa: EN.LUMINA_POVESTE.glosa, original: S.intrebare },
  { loc: 'extragere', rol: 'raspuns', glosa: EN.EXTRAGERE_POVESTE.glosa, original: S.citat },
  { loc: 'contrast', rol: 'intrebare', glosa: { text: DESEN.intrebare, limba: DESEN.limba }, original: S.intrebareScurta },
  // Raspunsul desenului e pe doua randuri: inceputul cu partea evidentiata, apoi nota.
  { loc: 'contrast', rol: 'raspuns', glosa: { text: DESEN.raspuns, limba: DESEN.limba }, original: (S.raspunsInceput + S.raspunsAccent).trim() + ' ' + S.raspunsNota },
]

/** Termenii scenei si traducerea lor: un termen romanesc prezent in original cere termenul englez in glosa. */
const GLOSAR: [string, string][] = [
  ['garanți', 'warranty'],
  ['compresor', 'compressor'],
  ['hala', 'hall'],
  ['dată', 'date'],
  ['calculează', 'calculated'],
  ['perioada', 'period'],
  // "month" prinde si pluralul ("24 months") si adjectivul compus american ("a 24-month warranty").
  ['luni', 'month'],
  ['punerea în funcțiune', 'commissioning'],
  ['punerii în funcțiune', 'commissioning'],
  // Inceputul termenului si al calculului ("de la ce dată", "de la punerea", "din ziua"). Cu spatiul de dupa, ca un
  // cuvant care incepe cu "la" (de pilda "de lansare") sa nu ceara "from".
  ['de la ', 'from'],
  ['din ziua', 'from the day'],
]

const LUNI_RO = ['ianuarie', 'februarie', 'martie', 'aprilie', 'mai', 'iunie', 'iulie', 'august', 'septembrie', 'octombrie', 'noiembrie', 'decembrie']
const LUNI_EN = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

const cuvinte = (s: string) => s.split(/\s+/).filter((c) => /\p{L}|\d/u.test(c)).length
const semnFinal = (s: string) => /[.?!]$/.exec(s.trim())?.[0] ?? ''

/** Abaterile de fidelitate verificabile mecanic ale unei glose fata de originalul ei. */
function abateriFidelitate(original: string, glosa: string): string[] {
  const abateri: string[] = []
  const numere = (s: string) => (s.match(/\d+/g) ?? []).sort()
  if (numere(original).join(' ') !== numere(glosa).join(' ')) abateri.push('numerele difera: ' + numere(original).join(',') + ' / ' + numere(glosa).join(','))
  const data = new RegExp('(\\d{1,2}) (' + LUNI_RO.join('|') + ') (\\d{4})').exec(original)
  if (data !== null) {
    const sua = LUNI_EN[LUNI_RO.indexOf(data[2])] + ' ' + data[1] + ', ' + data[3]
    if (!glosa.includes(sua)) abateri.push('data nu e in forma SUA: lipseste "' + sua + '"')
  }
  for (const [ro, en] of GLOSAR) {
    if (original.toLowerCase().includes(ro) && !glosa.toLowerCase().includes(en)) abateri.push('termenul "' + ro + '" fara "' + en + '"')
  }
  // Nimic din afara exemplului: originalul nu numeste produsul si nu vorbeste despre limba.
  for (const strain of ['3S', 'English', 'Romanian', 'translat']) {
    if (glosa.includes(strain) && !original.includes(strain)) abateri.push('glosa adauga "' + strain + '"')
  }
  return abateri
}

/** Abaterile de forma ale unei glose: limba, ASCII, majuscula, semnul final, lungimea fata de original. */
function abateriForma(p: Pereche): string[] {
  const a: string[] = []
  const t = p.glosa.text
  if (p.glosa.limba !== 'en') a.push('limba ' + p.glosa.limba)
  if (!/^[\x20-\x7e]+$/.test(t)) a.push('nu e ASCII')
  if (!/^[A-Z]/.test(t)) a.push('nu incepe cu majuscula')
  if (semnFinal(t) !== semnFinal(p.original)) a.push('semnul final "' + semnFinal(t) + '", nu "' + semnFinal(p.original) + '"')
  // O traducere, nu o eticheta si nu o explicatie: intre 0,6 si 1,6 din cuvintele originalului.
  const r = cuvinte(t) / cuvinte(p.original)
  if (r < 0.6 || r > 1.6) a.push('lungimea: ' + cuvinte(t) + ' cuvinte fata de ' + cuvinte(p.original))
  if (/\s-{2,}\s/.test(t)) a.push('linie dubla in loc de cratima')
  return a
}

describe('continutul glosei, in modulul EN', () => {
  it('cinci glose, cu limba "en", ASCII, cu majuscula, cu semnul final al originalului si lungimea unei traduceri', () => {
    expect(PERECHI.length).toBe(5)
    for (const p of PERECHI) expect(abateriForma(p), p.loc + '/' + p.rol).toEqual([])
  })

  it('glosa din erou e aceeasi cu cea din lumina: aceeasi intrebare, scrisa de doua ori', () => {
    expect(EN.EROU_POVESTE.glosa).toEqual(EN.LUMINA_POVESTE.glosa)
  })

  it('fidelitatea verificabila mecanic: numerele, data in forma SUA, termenii scenei; nimic din afara exemplului', () => {
    for (const p of PERECHI) expect(abateriFidelitate(p.original, p.glosa.text), p.loc + '/' + p.rol).toEqual([])
    // Controlul citirii: originalele au chiar ce masoara regulile (numere, o data, termeni ai glosarului).
    expect(PERECHI.flatMap((p) => p.original.match(/\d+/g) ?? []).length).toBeGreaterThanOrEqual(5)
    expect(PERECHI.some((p) => new RegExp('\\d (' + LUNI_RO.join('|') + ') \\d{4}').test(p.original))).toBe(true)
    expect(GLOSAR.filter(([ro]) => PERECHI.some((p) => p.original.toLowerCase().includes(ro))).length).toBeGreaterThanOrEqual(9)
  })

  it('martor POZITIV: un numar schimbat, data in forma romaneasca, "garantie" ca "guarantee", "de la" fara "from" si un "3S" adaugat sunt prinse', () => {
    const r = PERECHI[2]
    expect(abateriFidelitate(r.original, r.glosa.text.replace(/\b24\b/, '12')).join('\n')).toContain('numerele difera')
    const data = new RegExp('(' + LUNI_EN.join('|') + ') (\\d{1,2}), (\\d{4})').exec(r.glosa.text)
    expect(data, 'glosa raspunsului are o data').not.toBeNull()
    expect(abateriFidelitate(r.original, r.glosa.text.replace(data![0], data![2] + ' ' + data![1] + ' ' + data![3])).join('\n')).toContain('forma SUA')
    const q = PERECHI[0]
    expect(abateriFidelitate(q.original, q.glosa.text.replace('warranty', 'guarant' + 'ee')).join('\n')).toContain('fara "warranty"')
    // "since" in loc de "from", pe fiecare glosa cu inceput de termen: e prins pe fiecare.
    for (const p of PERECHI.filter((x) => /de la |din ziua/.test(x.original))) {
      expect(abateriFidelitate(p.original, p.glosa.text.replace(/\bfrom\b/, 'since')).join('\n'), p.loc + '/' + p.rol).toContain('fara "from')
    }
    expect(abateriFidelitate(q.original, q.glosa.text.replace(/\?$/, ' in 3S?')).join('\n')).toContain('adauga "3S"')
  })

  it('martor POZITIV pe desen: unitatea scoasa, "commissioning" scos si un semn final adaugat sunt prinse', () => {
    const d = PERECHI[4]
    expect(abateriFidelitate(d.original, d.glosa.text.replace(/-month\b/, '')).join('\n')).toContain('fara "month"')
    expect(abateriFidelitate(d.original, d.glosa.text.replace('commissioning', 'start' + 'up')).join('\n')).toContain('fara "commissioning"')
    expect(abateriForma({ ...d, glosa: { ...d.glosa, text: d.glosa.text + '.' } }).join('\n')).toContain('semnul final')
    // O eticheta de un cuvant nu e o traducere.
    expect(abateriForma({ ...d, glosa: { ...d.glosa, text: 'War' + 'ranty' } }).join('\n')).toContain('lungimea')
  })
})

// ---------------------------------------------------------------------------------------------
// 2. Pagina EN: cinci glose, la locul lor
// ---------------------------------------------------------------------------------------------

/** Textul elementelor `lang="ro"` din `n` si din urmasii lui. */
function textRo(n: Nod | null): string[] {
  return n === null ? [] : [n, ...elemente(n)].filter((e) => /^ro$/.test(atribut(e, 'lang') ?? '')).map(text)
}

/** Abaterile de asezare ale unei glose fata de bucata pe care o traduce; lista goala = la locul ei. */
function abateriLoc(n: Nod, p: Pereche): string[] {
  const a: string[] = []
  const id = p.loc + '/' + p.rol
  const inainte = frate(n, -1)
  const dupa = frate(n, 1)
  if (p.loc === 'erou') {
    // Sub terminal (cu intrebarea sub lang="ro"), inaintea primului subtitlu; numai clasa subtitlului, cu intrarea lui.
    if (inainte === null || atribut(inainte, 'data-terminal') === null) a.push(id + ': deasupra nu e terminalul')
    if (!textRo(inainte).some((t) => t.includes(p.original))) a.push(id + ': elementul de deasupra nu poarta originalul sub lang="ro"')
    if (!clasa(dupa).includes('subtitluRand1')) a.push(id + ': dupa glosa nu vine primul subtitlu')
    if (clasa(n) !== STIL_EROU.subtitlu) a.push(id + ': clasa "' + clasa(n) + '", nu numai clasa subtitlului')
    if (atribut(n, 'data-intrare') === null) a.push(id + ': fara data-intrare (intrarea dupa scriere)')
  } else if (p.loc === 'lumina' || p.loc === 'extragere') {
    const macheta = inainte === null ? [] : [inainte, ...elemente(inainte)].map((e) => atribut(e, 'data-macheta'))
    const asteptata = p.loc === 'lumina' ? 'bara-cautare' : 'extragere'
    if (!macheta.includes(asteptata)) a.push(id + ': deasupra nu e macheta ' + asteptata)
    if (!textRo(inainte).some((t) => t.includes(p.original))) a.push(id + ': elementul de deasupra nu poarta originalul sub lang="ro"')
    // Textul care urma inainte (indicatia sub bara, legenda sub card) ramane imediat dupa glosa.
    const urmator = p.loc === 'lumina' ? 'indicatie' : 'legenda'
    if (!clasa(dupa).includes(urmator)) a.push(id + ': dupa glosa nu vine ' + urmator)
  } else {
    // Sub desenul "Acum" (svg role="img"), ca paragrafe HTML (in SVG corpul efectiv era ~8,9 px la 390): intrebarea
    // imediat dupa desen, raspunsul imediat dupa glosa intrebarii; desenul poarta, sub lang="ro", textele traduse
    // (intrebarea un rand; raspunsul doua randuri consecutive: inceputul cu partea evidentiata si nota).
    if (n.tag !== 'p') a.push(id + ': nu e un <p> sub desen')
    const desen = p.rol === 'intrebare' ? frate(n, -1) : frate(n, -2)
    if (p.rol === 'raspuns' && atribut(frate(n, -1) ?? n, 'data-glosa') !== 'intrebare') a.push(id + ': deasupra nu e glosa intrebarii')
    if (desen === null || desen.tag !== 'svg' || atribut(desen, 'role') !== 'img') a.push(id + ': deasupra nu e desenul svg')
    const ro = desen === null ? [] : elemente(desen).filter((e) => e.tag === 'text' && atribut(e, 'lang') === 'ro').map((e) => text(e).trim())
    const gasit = p.rol === 'intrebare' ? ro.includes(p.original) : ro.some((t, i) => i + 1 < ro.length && t + ' ' + ro[i + 1] === p.original)
    if (!gasit) a.push(id + ': desenul de deasupra nu poarta textele romanesti traduse (' + JSON.stringify(ro) + ')')
  }
  return a
}

/** Abaterile gloselor dintr-un `<main>` EN; lista goala = cum cere decizia 75. */
function abateriPagina(m: Nod): string[] {
  const abateri: string[] = []
  const g = glose(m)
  const ordine = g.map((n) => sectiune(n) + '/' + atribut(n, 'data-glosa')).join(',')
  const asteptat = PERECHI.map((p) => p.loc + '/' + p.rol).join(',')
  if (ordine !== asteptat) abateri.push('glosele din <main>: [' + ordine + '], nu [' + asteptat + ']')
  g.forEach((n, i) => {
    const p = PERECHI[i]
    if (p === undefined) return
    const id = p.loc + '/' + p.rol
    if (atribut(n, 'lang') !== 'en') abateri.push(id + ': lang ' + atribut(n, 'lang') + ', nu en')
    if (subRo(n)) abateri.push(id + ': sta sub un stramos lang="ro"')
    if (text(n) !== p.glosa.text) abateri.push(id + ': alt text decat modulul')
    abateri.push(...abateriLoc(n, p))
    const straine = clase(n).filter((c) => !CLASE_RO.has(c))
    if (straine.length > 0) abateri.push(id + ': clase care nu sunt in <main>-ul paginii RO: ' + straine.join(' '))
  })
  const en = elemente(m).filter((n) => atribut(n, 'lang') === 'en')
  if (en.length !== g.length || en.some((n) => !g.includes(n))) abateri.push('elementele lang="en" din <main> nu sunt exact glosele: ' + en.length)
  return abateri
}

describe('pagina EN /features/search (si /en/features/search pe 3s.com.ro: aceeasi pagina)', () => {
  const sursa = html(PaginaEn as ComponentType<never>)

  it('cinci glose, in ordine, cu lang="en", in afara scenei, imediat sub bucata tradusa, fara clase noi fata de RO', () => {
    const m = mainDin(sursa)
    const g = glose(m)
    console.log('[glosa-demo-cautare] pagina EN: ' + g.length + ' glose (' + g.map((n) => sectiune(n) + '/' + atribut(n, 'data-glosa') + '/' + atribut(n, 'lang')).join(', ') + ')')
    // Controlul citirii: clasele paginii RO au fost citite (altfel garda claselor n-ar compara nimic).
    expect(CLASE_RO.size).toBeGreaterThan(20)
    expect(abateriPagina(m)).toEqual([])
  })

  /** Paragraful unei glose HTML (primul cu atributele date) din marcajul paginii. */
  const paragraf = (h: string, rol: string, nr = 0) => [...h.matchAll(new RegExp('<p\\b[^>]*\\sdata-glosa="' + rol + '"[^>]*>[\\s\\S]*?</p>', 'g'))][nr]?.[0]
  const abateriDin = (h: string) => abateriPagina(mainDin(h)).join('\n')

  it('martor POZITIV: glosa mutata sub lang="ro", glosa scoasa, glosa fara lang si glosa barei mutata dupa indicatie sunt prinse', () => {
    const elLumina = paragraf(sursa, 'intrebare', 1)
    expect(elLumina, 'glosa barei e in marcaj').toBeDefined()
    const lang = ' lang="' + EN.LUMINA_POVESTE.glosa.limba + '"'
    expect(abateriDin(sursa.replace(elLumina!, '<div lang="ro">' + elLumina + '</div>'))).toContain('stramos lang="ro"')
    expect(abateriDin(sursa.replace(elLumina!, ''))).toContain('glosele din <main>')
    expect(abateriDin(sursa.replace(elLumina!, elLumina!.replace(lang, '')))).toContain('lang null, nu en')
    const indicatie = /<p\b[^>]*class="[^"]*indicatie[^"]*"[^>]*>[\s\S]*?<\/p>/.exec(sursa)![0]
    expect(abateriDin(sursa.replace(elLumina!, '').replace(indicatie, indicatie + elLumina))).toContain('deasupra nu e macheta bara-cautare')
  })

  it('martor POZITIV pe erou: glosa scoasa, glosa mutata dupa primul subtitlu si glosa cu o clasa straina sunt prinse', () => {
    const elErou = paragraf(sursa, 'intrebare', 0)
    expect(elErou, 'glosa eroului e in marcaj').toBeDefined()
    expect(abateriDin(sursa.replace(elErou!, ''))).toContain('glosele din <main>: [lumina/intrebare')
    const rand1 = /<p\b[^>]*class="[^"]*subtitluRand1[^"]*"[^>]*>[\s\S]*?<\/p>/.exec(sursa)![0]
    expect(abateriDin(sursa.replace(elErou!, '').replace(rand1, rand1 + elErou))).toContain('erou/intrebare: deasupra nu e terminalul')
    // O clasa de modul care nu exista pe RO (forma unei clase Next, asamblata la rulare).
    const straina = ['cautare', 'glosa' + 'Erou', '_' + 'x1y2z'].join('_')
    expect(abateriDin(sursa.replace(elErou!, elErou!.replace('class="', 'class="' + straina + ' ')))).toContain('clase care nu sunt in <main>-ul paginii RO: ' + straina)
  })

  it('martor POZITIV pe desen: glosa intrebarii mutata in desen, ordinea gloselor inversata si nota scoasa din desen sunt prinse', () => {
    const gi = paragraf(sursa, 'intrebare', 2)
    const gr = paragraf(sursa, 'raspuns', 1)
    expect(gi, 'glosa intrebarii din desen e in marcaj').toBeDefined()
    expect(gr, 'glosa raspunsului din desen e in marcaj').toBeDefined()
    // Glosa intrebarii mutata inapoi in SVG, dupa cursor (locul din runda 2): deasupra ei nu mai e desenul.
    const cursor = /<rect\b[^>]*class="[^"]*cursorDesen[^"]*"[^>]*\/?>(<\/rect>)?/.exec(sursa)![0]
    expect(abateriDin(sursa.replace(gi!, '').replace(cursor, cursor + gi))).toContain('contrast/intrebare: deasupra nu e desenul svg')
    // Ordinea inversata: raspunsul imediat dupa desen, intrebarea dupa el.
    expect(abateriDin(sursa.replace(gi! + gr!, gr! + gi!))).toContain('glosele din <main>')
    // Nota raspunsului scoasa din desen: originalul raspunsului nu mai e in desenul de deasupra.
    const nota = new RegExp('<text\\b[^>]*>' + S.raspunsNota.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '</text>').exec(sursa)![0]
    expect(abateriDin(sursa.replace(nota, ''))).toContain('contrast/raspuns: desenul de deasupra nu poarta textele romanesti traduse')
  })
})

// ---------------------------------------------------------------------------------------------
// 3. Paginile romanesti ale cautarii: zero glose
// ---------------------------------------------------------------------------------------------

function urmeGlosa(m: Nod): string[] {
  const t = text(m)
  return [
    ...glose(m).map((n) => 'element [data-glosa=' + atribut(n, 'data-glosa') + ']'),
    ...PERECHI.filter((p, i) => t.includes(p.glosa.text) && PERECHI.findIndex((x) => x.glosa.text === p.glosa.text) === i).map((p) => 'textul glosei ' + p.loc + '/' + p.rol),
    ...elemente(m)
      .filter((n) => atribut(n, 'lang') === 'en')
      .map((n) => 'lang="en" pe <' + n.tag + '>'),
  ]
}

describe('paginile romanesti ale cautarii raman fara glosa', () => {
  const PAGINI_RO: [string, ComponentType<never>][] = [
    ['RO /functionalitati/cautare-ai', PaginaRo as ComponentType<never>],
    ['3s.md /ro/functionalitati/cautare-ai (pe 3s.com.ro la radacina)', PaginaRoMd as ComponentType<never>],
  ]

  it('martor NEGATIV: zero elemente [data-glosa], zero texte ale glosei, zero lang="en" in <main>', () => {
    for (const [nume, P] of PAGINI_RO) {
      const m = main(P)
      // Controlul citirii: pagina are terminalul eroului, bara, cardul si desenul, deci zeroul nu vine dintr-un <main> gol.
      expect(elemente(m).map((n) => atribut(n, 'data-macheta')), nume).toEqual(expect.arrayContaining(['bara-cautare', 'extragere']))
      expect(elemente(m).some((n) => atribut(n, 'data-terminal') !== null), nume + ': terminalul').toBe(true)
      expect(elemente(m).filter((n) => n.tag === 'svg' && atribut(n, 'role') === 'img').length, nume + ': desenele').toBeGreaterThanOrEqual(2)
      expect(urmeGlosa(m), nume).toEqual([])
    }
  })

  it('martor POZITIV: o glosa injectata in pagina RO e numarata', () => {
    const sursa = html(PaginaRo as ComponentType<never>)
    const i = sursa.lastIndexOf('</main>')
    const cu = sursa.slice(0, i) + '<p lang="en" data-glosa="raspuns">' + PERECHI[4].glosa.text + '</p>' + sursa.slice(i)
    expect(urmeGlosa(mainDin(cu))).toEqual(['element [data-glosa=raspuns]', 'textul glosei contrast/raspuns', 'lang="en" pe <p>'])
  })
})

// ---------------------------------------------------------------------------------------------
// 4. Componentele: fara glosa, marcajul de dinainte; cu glosa, exact elementele ei in plus
// ---------------------------------------------------------------------------------------------

/** Un fabricant de siruri sintetice: prefix + contor, deci unice si fara text al vreunei editii. */
function fabricant() {
  let n = 0
  return () => 'Zq' + 'glosa ' + ++n + ' xk'
}

/** Elementul glosei cu rolul si eticheta date, ca subsir al marcajului (sau null). */
function elementGlosa(h: string, rol: string, tag = 'p'): string | null {
  return new RegExp('<' + tag + '\\b[^>]*\\sdata-glosa="' + rol + '"[^>]*>[\\s\\S]*?</' + tag + '>').exec(h)?.[0] ?? null
}

describe('componentele demonstratiei: glosa e singura diferenta', () => {
  // O limba sintetica, alta decat a paginii EN: componenta pune limba primita, nu una scrisa in ea.
  const LIMBA = ['f', 'r'].join('')

  it('LuminaVedere: cu glosa, un singur paragraf in plus, intre celula barei si indicatie; scos el, marcajul fara camp', () => {
    const s = fabricant()
    const baza = { intrebare: s(), declaratie: s(), indicatie: s() }
    const glosa = { text: s(), limba: LIMBA }
    const fara = html(LuminaVedere as ComponentType<never>, { continut: baza })
    const cu = html(LuminaVedere as ComponentType<never>, { continut: { ...baza, glosa } })
    const p = elementGlosa(cu, 'intrebare')
    expect(p).not.toBeNull()
    expect(p).toContain(' lang="' + LIMBA + '"')
    expect(p).toContain('>' + glosa.text + '</p>')
    expect(cu.replace(p!, '')).toBe(fara)
    expect(elementGlosa(fara, 'intrebare')).toBeNull()
    // Locul: imediat dupa celula barei, imediat inaintea indicatiei.
    const n = elemente(arbore(cu)).find((e) => atribut(e, 'data-glosa') === 'intrebare')!
    expect(clasa(frate(n, -1))).toContain('locBara')
    expect(clasa(frate(n, 1))).toContain('indicatie')
  })

  it('Extragere: cu glosa, un singur paragraf in plus, intre card si legenda; scos el, marcajul fara camp', () => {
    const s = fabricant()
    const baza = { declaratie: s(), fisier: s(), pagina: s(), citat: s(), meta: s(), legenda: s() }
    const glosa = { text: s(), limba: LIMBA }
    const fara = html(Extragere as ComponentType<never>, { continut: baza })
    const cu = html(Extragere as ComponentType<never>, { continut: { ...baza, glosa } })
    const p = elementGlosa(cu, 'raspuns')
    expect(p).not.toBeNull()
    expect(p).toContain(' lang="' + LIMBA + '"')
    expect(p).toContain('>' + glosa.text + '</p>')
    expect(cu.replace(p!, '')).toBe(fara)
    expect(elementGlosa(fara, 'raspuns')).toBeNull()
    const n = elemente(arbore(cu)).find((e) => atribut(e, 'data-glosa') === 'raspuns')!
    expect(atribut(frate(n, -1)!, 'data-macheta')).toBe('extragere')
    expect(clasa(frate(n, 1))).toContain('legenda')
  })

  it('TerminalErou: cu glosa, un singur paragraf in plus, imediat dupa terminal, cu clasa subtitlului; scos el, marcajul fara camp', () => {
    const s = fabricant()
    const baza = { text: s(), pas: 35, latime: 660, marime: 'mare', limba: 'ro' }
    const glosa = { text: s(), limba: LIMBA }
    const fara = html(TerminalErou as ComponentType<never>, baza)
    const cu = html(TerminalErou as ComponentType<never>, { ...baza, glosa })
    const p = elementGlosa(cu, 'intrebare')
    expect(p).not.toBeNull()
    expect(p).toContain(' lang="' + LIMBA + '"')
    expect(p).toContain('>' + glosa.text + '</p>')
    // In afara unui erou faza e `static`: glosa se vede de la inceput, ca subtitlul.
    expect(p).toContain(' data-intrare="static"')
    expect(cu.replace(p!, '')).toBe(fara)
    expect(fara).not.toMatch(/data-glosa|data-intrare|\sstyle=/)
    const n = elemente(arbore(cu)).find((e) => atribut(e, 'data-glosa') === 'intrebare')!
    expect(atribut(frate(n, -1)!, 'data-terminal')).not.toBeNull()
    expect(clasa(n)).toBe(STIL_EROU.subtitlu)
    // Latimea glosei e a terminalului: 660 pe varianta lata, 600 altfel.
    expect(atribut(n, 'style')).toContain('width:660px')
    const ingust = elementGlosa(html(TerminalErou as ComponentType<never>, { text: s(), glosa }), 'intrebare')
    expect(ingust).toContain('width:600px')
  })

  it('DesenAcum: cu glosa, desenul de pe RO urmat de doua <p>, intr-un <div> fara clasa; scoase ele, marcajul fara camp', () => {
    const s = fabricant()
    const baza = { declaratie: s(), intrebareScurta: s(), raspunsInceput: s() + ' ', raspunsAccent: s(), raspunsNota: s(), sursa: s() }
    const glosa = { intrebare: s(), raspuns: s(), limba: LIMBA }
    const fara = html(DesenAcum as ComponentType<never>, { continut: baza, limba: 'ro' })
    const cu = html(DesenAcum as ComponentType<never>, { continut: { ...baza, glosa }, limba: 'ro' })
    const ti = elementGlosa(cu, 'intrebare')
    const tr = elementGlosa(cu, 'raspuns')
    expect(ti).not.toBeNull()
    expect(tr).not.toBeNull()
    for (const [t, x] of [[ti!, glosa.intrebare], [tr!, glosa.raspuns]] as const) {
      expect(t).toContain(' lang="' + LIMBA + '"')
      expect(t).toContain('>' + x + '</p>')
      expect(t).not.toContain('class=')
    }
    // Invelisul si stilul SVG-ului (latimea pe care i-o dadea cutia vizualului) scoase: exact desenul de pe RO.
    const invelis = /^<div data-desen-glosa="" style="[^"]*">([\s\S]*)<\/div>$/.exec(cu.replace(ti!, '').replace(tr!, ''))
    expect(invelis, 'un singur <div> fara clasa in jurul desenului si al gloselor').not.toBeNull()
    expect(invelis![1].replace(' style="display:block;width:100%;height:auto"', '')).toBe(fara)
    const toate = elemente(arbore(cu))
    const ni = toate.find((e) => atribut(e, 'data-glosa') === 'intrebare')!
    const nr = toate.find((e) => atribut(e, 'data-glosa') === 'raspuns')!
    expect(frate(ni, -1)?.tag).toBe('svg')
    expect(atribut(frate(nr, -1)!, 'data-glosa')).toBe('intrebare')
    expect(frate(nr, 1)).toBeNull()
  })

  it('martor NEGATIV: fara camp (implicitul RO al Extragerii si al desenului, terminalul si bara fara glosa), nicio glosa si niciun lang', () => {
    expect(elementGlosa(html(Extragere as ComponentType<never>), 'raspuns')).toBeNull()
    const desenRo = html(DesenAcum as ComponentType<never>)
    expect(desenRo).not.toMatch(/data-glosa|\slang=/)
    const s = fabricant()
    expect(elementGlosa(html(LuminaVedere as ComponentType<never>, { continut: { intrebare: s(), declaratie: s(), indicatie: s() } }), 'intrebare')).toBeNull()
    expect(html(TerminalErou as ComponentType<never>, { text: s() })).not.toMatch(/data-glosa|\slang=/)
  })
})
