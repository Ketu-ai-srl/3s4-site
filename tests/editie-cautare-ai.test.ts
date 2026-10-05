import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { createElement, type ComponentType } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'

/**
 * PAGINA EN P03 `/features/search` PE COMPONENTELE CINEMA ALE PERECHII RO (felia 105, decizia 53, intrebarea 5 a).
 *
 * CE DOVEDESTE PROBA ASTA si ce nu. Aici se dovedeste partea EDITIEI, pe randarea statica:
 *   - vederile insulelor (avalansa, frustrarea, lumina) nu importa niciun continut, iar invelitorile EN nu importa
 *     continutul RO; cu un continut sintetic, fiecare piesa scoate exact textul primit si nimic din modulul RO;
 *   - pagina EN are un h1 (eticheta eroului), zero formulare, zero moneda romaneasca, zero legaturi spre cont, un
 *     singur buton de canal (WhatsApp, cu textul precompletat si `ref`-ul paginii);
 *   - tot textul propus al fisei e in `<main>`, numarat camp cu camp; scena romaneasca sta numai sub `lang="ro"`;
 *   - regulile de continut ale paginilor de produs EN (deciziile 43 si 49, "Nu spune") pe textul povestii;
 *   - declaratia G-AI-02 a rutei (`config/seo/en-produs.json`) pe textul servit al paginii.
 * Partea RO (HTML-ul si fluxul RSC neschimbate) NU se dovedeste aici: randarea statica nu vede fluxul RSC. Dovada RO e
 * invarianta pe build (`tests/invarianta-ro.test.ts`, fixtura `/functionalitati/cautare-ai`). Congruenta de forma si
 * stilurile calculate sunt in `tests/browser/congruenta.spec.ts`, pe copia 3s.md.
 *
 * FIXTURILE se asambleaza la rulare (prefix si contor, bucati lipite), ca fisierul sa nu poarte literal ce vaneaza.
 * Fiecare detector are un martor pozitiv (o abatere fabricata e prinsa) si, unde are sens, unul negativ.
 */

vi.hoisted(() => {
  // Canalele aplicatiei 3s.md (forma din `config/profil-3s-md.json`), cu un numar de proba: pagina citeste
  // `CANALE` la import, deci variabila se pune inaintea oricarui import al modulelor site-ului.
  process.env.CANALE_JSON = JSON.stringify({ formulare: false, whatsapp: '37300000002', telefon: '', email: '', emailSecuritate: 'security@example.test' })
})

const { default: PaginaEn } = await import('../src/app/(en)/features/search/page.en')
const { default: AvalansaVedere } = await import('../src/components/functionalitati/cautare-ai/AvalansaVedere')
const { default: FrustrareVedere } = await import('../src/components/functionalitati/cautare-ai/FrustrareVedere')
const { default: LuminaVedere } = await import('../src/components/functionalitati/cautare-ai/LuminaVedere')
const { default: Recunoastere } = await import('../src/components/functionalitati/cautare-ai/Recunoastere')
const { default: Extragere } = await import('../src/components/functionalitati/cautare-ai/Extragere')
const { DesenAcum, DesenInainte } = await import('../src/components/functionalitati/cautare-ai/DeseneContrast')
const { default: CtaCinema } = await import('../src/components/cinema/CtaCinema')
const { TerminalErou } = await import('../src/components/cinema/EroulCinema')
const RO = await import('../src/content/functionalitati/cautare-ai')
const EN = await import('../src/content/en/features-search')
const SCENA = await import('../src/content/functionalitati/cautare-ai-3s-md')

const RADACINA = join(__dirname, '..')
const DOSAR = join(RADACINA, 'src', 'components', 'functionalitati', 'cautare-ai')

// ---------------------------------------------------------------------------------------------
// Unelte: sirurile unui obiect, textul HTML cu si fara subarborii marcati ca romana
// ---------------------------------------------------------------------------------------------

/** Cheile care poarta valori de tip (felul randului, tonul cipului), nu text afisat. */
const CHEI_TIP = new Set(['tip', 'ton', 'calitativ'])

/** Toate sirurile afisate dintr-o valoare (obiect, tablou, sir), in ordinea parcurgerii. */
function siruri(v: unknown): string[] {
  if (typeof v === 'string') return [v]
  if (Array.isArray(v)) return v.flatMap(siruri)
  if (v !== null && typeof v === 'object') return Object.entries(v).flatMap(([k, x]) => (CHEI_TIP.has(k) ? [] : siruri(x)))
  return []
}

function decodeaza(t: string): string {
  return t
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
}

const GOALE = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'source', 'track', 'wbr'])

/**
 * Textul si etichetele accesibile ale unui HTML, impartite: ce sta sub un element cu `lang` care incepe cu `ro`
 * (scena romaneasca, declarata) si ce sta in afara. `<script>` si `<style>` nu se citesc.
 */
function textPeLimba(html: string): { afara: string; subRo: string } {
  const stiva: { tag: string; ro: boolean; sare: boolean }[] = []
  let afara = ''
  let subRo = ''
  let i = 0
  const eticheta = /<(\/?)([a-zA-Z][a-zA-Z0-9-]*)((?:[^>"']|"[^"]*"|'[^']*')*)>/g
  for (let m = eticheta.exec(html); m !== null; m = eticheta.exec(html)) {
    const text = decodeaza(html.slice(i, m.index))
    const ro = stiva.some((x) => x.ro)
    const sare = stiva.some((x) => x.sare)
    if (!sare) {
      if (ro) subRo += text
      else afara += text
    }
    i = m.index + m[0].length
    const [, inchide, tag, atribute] = m
    const t = tag.toLowerCase()
    if (inchide) {
      const k = stiva.map((x) => x.tag).lastIndexOf(t)
      if (k >= 0) stiva.length = k
      continue
    }
    const roAici = /\slang="ro(-[^"]*)?"/.test(atribute)
    const sareAici = t === 'script' || t === 'style'
    for (const a of atribute.matchAll(/\s(?:aria-label|alt|title)="([^"]*)"/g)) {
      if (roAici || ro) subRo += ' ' + decodeaza(a[1]) + ' '
      else afara += ' ' + decodeaza(a[1]) + ' '
    }
    if (GOALE.has(t) || atribute.trim().endsWith('/')) continue
    stiva.push({ tag: t, ro: roAici, sare: sareAici })
    afara += ' '
  }
  return { afara: afara.replace(/\s+/g, ' '), subRo: subRo.replace(/\s+/g, ' ') }
}

const DIACRITICE_RO = /[ăâîșțşţĂÂÎȘȚŞŢ]/g

/**
 * Sirurile identice in ambele limbi PRIN NATURA LOR, fiecare cu motivul: numai ele se scad din dictionar. Nu se scade
 * tot modulul EN: o fraza RO fara diacritice ajunsa in modulul EN ar iesi altfel din dictionar si n-ar mai fi prinsa.
 */
const IDENTICE_RO_EN: Record<string, string> = {
  '1 h 25 min': 'durata din contorul cautarii de mana: cifre si unitati, la fel in ambele limbi',
}

/** Sirurile RO de cel putin doua cuvinte din modulul RO al perechii (dictionarul probei). */
function dictionarRo(): string[] {
  return [...new Set(siruri(RO))]
    .map((x) => x.replace(/\s+/g, ' ').trim())
    .filter((x) => x.split(' ').filter((c) => /\p{L}/u.test(c)).length >= 2 && !(x in IDENTICE_RO_EN))
}

function siruriRoIn(text: string): string[] {
  return dictionarRo().filter((x) => text.includes(x))
}

function html(c: ComponentType<never>, props: object = {}): string {
  return renderToStaticMarkup(createElement(c as ComponentType<object>, props))
}

/** Continutul `<main>` al paginii EN, randat static. */
function mainEn(): string {
  const h = html(PaginaEn as ComponentType<never>)
  const a = h.indexOf('<main')
  const b = h.lastIndexOf('</main>')
  expect(a, 'pagina EN are <main>').toBeGreaterThanOrEqual(0)
  return h.slice(a, b + '</main>'.length)
}

// ---------------------------------------------------------------------------------------------
// 1. Vederile si invelitorile: importurile
// ---------------------------------------------------------------------------------------------

/** Modulele de continut importate de un fisier sursa (valori si tipuri). */
function importuriContinut(fisier: string): string[] {
  const sursa = readFileSync(join(DOSAR, fisier), 'utf8')
  return [...sursa.matchAll(/from\s+"(@\/content\/[^"]+)"/g)].map((m) => m[1])
}

describe('vederile nu importa continut; invelitorile EN nu importa continutul RO', () => {
  const VEDERI = ['AvalansaVedere.tsx', 'FrustrareVedere.tsx', 'LuminaVedere.tsx']
  const EN_INVELITORI = ['AvalansaEn.tsx', 'FrustrareEn.tsx', 'LuminaEn.tsx']
  const PERMISE_EN = ['@/content/en/features-search', '@/content/functionalitati/cautare-ai-3s-md']

  it('martor POZITIV: invelitoarea RO a avalansei importa modulul RO, iar detectorul il vede', () => {
    expect(importuriContinut('Avalansa.tsx')).toEqual(['@/content/functionalitati/cautare-ai'])
  })

  it('cele 3 vederi: zero importuri din @/content', () => {
    for (const v of VEDERI) expect(importuriContinut(v), v).toEqual([])
  })

  it('cele 3 invelitori EN: numai modulul EN al paginii si modulul scenei', () => {
    for (const v of EN_INVELITORI) {
      const imp = importuriContinut(v)
      expect(imp.length, v).toBeGreaterThan(0)
      expect(imp.filter((x) => !PERMISE_EN.includes(x)), v).toEqual([])
    }
  })
})

// ---------------------------------------------------------------------------------------------
// 2. Fiecare piesa scoate exact continutul primit
// ---------------------------------------------------------------------------------------------

/** Un fabricant de siruri sintetice: prefix + contor, deci unice si fara text al vreunei editii. */
function fabricant() {
  let n = 0
  return () => 'Zq' + 'sint ' + ++n + ' xk'
}

function avalansaSintetica(s: () => string) {
  return {
    declaratie: s(),
    cale: [s(), s()],
    numar: s(),
    randuri: [
      { tip: 'pdf' as const, nume: s(), cip: { text: s(), ton: 'neutru' as const }, ora: s() },
      { tip: 'email' as const, nume: s(), ora: s() },
    ],
    etichetaExemplu: s(),
  }
}

function frustrareSintetica(s: () => string) {
  return {
    declaratie: s(),
    inCurs: s(),
    sesiune: s(),
    fisiere: { eticheta: s(), sub: s() },
    timp: { eticheta: s(), sub: s() },
    colegi: { eticheta: s(), sub: s() },
    rezultat: { eticheta: s(), sub: s() },
    negasit: s(),
    continua: s(),
    maxime: { fisiere: 3, minute: 7, colegi: 2 },
    citate: [s(), s(), s(), s(), s()],
  }
}

const PIESE: { nume: string; randeaza: (s: () => string) => { html: string; asteptat: string[] } }[] = [
  {
    nume: 'AvalansaVedere',
    randeaza: (s) => {
      const c = avalansaSintetica(s)
      return { html: html(AvalansaVedere as ComponentType<never>, { continut: c }), asteptat: siruri(c) }
    },
  },
  {
    nume: 'FrustrareVedere',
    randeaza: (s) => {
      const c = frustrareSintetica(s)
      return { html: html(FrustrareVedere as ComponentType<never>, { continut: c }), asteptat: siruri(c) }
    },
  },
  {
    nume: 'LuminaVedere',
    randeaza: (s) => {
      const c = { intrebare: s(), declaratie: s(), indicatie: s() }
      return { html: html(LuminaVedere as ComponentType<never>, { continut: c }), asteptat: siruri(c) }
    },
  },
  {
    nume: 'Recunoastere',
    randeaza: (s) => {
      const c = { titlu: s(), paragraf: s() }
      return { html: html(Recunoastere as ComponentType<never>, { continut: c }), asteptat: siruri(c) }
    },
  },
  {
    nume: 'Extragere',
    randeaza: (s) => {
      const c = { declaratie: s(), fisier: s(), pagina: s(), citat: s(), meta: s(), legenda: s() }
      return { html: html(Extragere as ComponentType<never>, { continut: c }), asteptat: siruri(c) }
    },
  },
  {
    nume: 'DesenInainte',
    randeaza: (s) => {
      const c = { declaratie: s() }
      return { html: html(DesenInainte as ComponentType<never>, { continut: c }), asteptat: siruri(c) }
    },
  },
  {
    nume: 'DesenAcum',
    randeaza: (s) => {
      const c = { declaratie: s(), intrebareScurta: s(), raspunsInceput: s() + ' ', raspunsAccent: s(), raspunsNota: s(), sursa: s() }
      return { html: html(DesenAcum as ComponentType<never>, { continut: c }), asteptat: siruri(c).map((x) => x.trim()) }
    },
  },
]

describe('fiecare piesa scoate exact continutul primit si nimic din modulul RO', () => {
  it('dictionarul probei are siruri (controlul citirii)', () => {
    expect(dictionarRo().length).toBeGreaterThan(30)
  })

  for (const p of PIESE) {
    it(p.nume + ': toate sirurile sintetice, zero siruri RO, zero diacritice', () => {
      const { html: h, asteptat } = p.randeaza(fabricant())
      const { afara } = textPeLimba(h)
      expect(asteptat.filter((x) => !afara.includes(x))).toEqual([])
      expect(siruriRoIn(afara)).toEqual([])
      expect(afara.match(DIACRITICE_RO) ?? []).toEqual([])
    })
  }

  it('martor POZITIV: acelasi continut sintetic, cu un sir RO strecurat intr-un camp, e prins', () => {
    const s = fabricant()
    const c = frustrareSintetica(s)
    const strecurat = RO.FRUSTRARE.citate[1]
    c.citate[2] = strecurat
    const { afara } = textPeLimba(html(FrustrareVedere as ComponentType<never>, { continut: c }))
    expect(siruriRoIn(afara)).toContain(strecurat)
  })
})

// ---------------------------------------------------------------------------------------------
// 3. Proprietatile noi: limba scenei, locul butonului
// ---------------------------------------------------------------------------------------------

describe('proprietatile noi ale pieselor comune', () => {
  it('TerminalErou: cu `limba`, `lang` pe corpul terminalului; fara ea (RO), niciun `lang`', () => {
    const text = 'Zq' + 'intrebare'
    const cu = html(TerminalErou as ComponentType<never>, { text, limba: 'ro' })
    const fara = html(TerminalErou as ComponentType<never>, { text })
    expect(textPeLimba(cu).subRo).toContain(text)
    expect(fara).not.toMatch(/\slang=/)
  })

  it('Extragere si DesenAcum: fara limba (RO), niciun `lang`; cu limba, citatul si textele desenului sub `lang`', () => {
    expect(html(Extragere as ComponentType<never>)).not.toMatch(/\slang=/)
    expect(html(DesenAcum as ComponentType<never>)).not.toMatch(/\slang=/)
    const cu = textPeLimba(html(DesenAcum as ComponentType<never>, { limba: 'ro' }))
    expect(cu.subRo).toContain(RO.CONTRAST_CAUTARE.acum.intrebareScurta)
    expect(cu.afara).toContain(RO.CONTRAST_CAUTARE.acum.declaratie)
  })

  it('CtaCinema: fara `butoane` (RO), butonul spre cont; cu `butoane`, elementul dat primeste clasa butonului', () => {
    const baza = { titlu: 'T', paragraf: 'P', buton: 'B', nota: 'N' }
    const ro = html(CtaCinema as ComponentType<never>, baza)
    expect(ro).toMatch(/inregistrare/)
    const cu = html(CtaCinema as ComponentType<never>, {
      ...baza,
      butoane: (clasa: string) => createElement('a', { href: '#canal', className: clasa }, 'C'),
    })
    expect(cu).not.toMatch(/inregistrare/)
    const clasaRo = /class="([^"]*buton[^"]*)"/.exec(ro)?.[1]
    expect(clasaRo).toBeDefined()
    expect(cu).toContain('<a href="#canal" class="' + clasaRo + '">C</a>')
    const gol = html(CtaCinema as ComponentType<never>, { ...baza, butoane: () => null })
    expect(gol).not.toMatch(/<a\b/)
  })
})

// ---------------------------------------------------------------------------------------------
// 4. Pagina EN
// ---------------------------------------------------------------------------------------------

const H1_EN = EN.EROU_POVESTE.etichetaNumar + SCENA.SEMNE_3S_MD.mijloc + EN.EROU_POVESTE.etichetaNume
const MONEDA = new RegExp('\\b' + 'R' + 'ON' + '\\b')
const FORMULAR = new RegExp('<' + 'form\\b', 'i')

describe('pagina EN /features/search', () => {
  it('un h1, egal cu eticheta eroului; zero formulare, zero moneda romaneasca, zero legaturi spre cont', () => {
    const m = mainEn()
    const h1 = [...m.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/g)].map((x) => decodeaza(x[1]))
    expect(h1).toEqual([H1_EN])
    expect(FORMULAR.test(m)).toBe(false)
    expect(MONEDA.test(m)).toBe(false)
    expect(m).not.toMatch(/inregistrare/)
  })

  it('un singur buton de canal, in CTA: wa.me cu textul precompletat al paginii si [ref:en-search]', () => {
    const m = mainEn()
    const wa = [...m.matchAll(/<a\b[^>]*\shref="(https:\/\/wa\.me\/[^"]*)"/g)].map((x) => decodeaza(x[1]))
    expect(wa).toHaveLength(1)
    expect(new URL(wa[0]).searchParams.get('text')).toBe(EN.pagina.cta.textWhatsapp)
    expect(EN.pagina.cta.textWhatsapp).toContain('[ref:' + EN.pagina.cta.ref + ']')
  })

  it('tot textul propus al fisei e in <main>: fiecare camp EN in afara scenei, fiecare camp al scenei sub lang="ro"', () => {
    const { afara, subRo } = textPeLimba(mainEn())
    const povestea = [
      EN.EROU_POVESTE,
      EN.AVALANSA_POVESTE,
      EN.RECUNOASTERE_POVESTE,
      EN.FRUSTRARE_POVESTE,
      EN.SOAPTA_POVESTE,
      EN.LUMINA_POVESTE,
      EN.EXTRAGERE_POVESTE,
      EN.CONTRAST_POVESTE,
      EN.CTA_POVESTE,
    ]
    // Bucatile etichetei si ale puntii apar lipite; numele firului apare numai in JSON-LD (ca pe RO).
    const lipite = new Set<string>([EN.EROU_POVESTE.etichetaNumar, EN.EROU_POVESTE.etichetaNume, EN.CONTRAST_POVESTE.punteDe, EN.CONTRAST_POVESTE.punteLa])
    const campuri = povestea.flatMap(siruri).filter((x) => !lipite.has(x))
    const intregi = [H1_EN, EN.CONTRAST_POVESTE.punteDe + SCENA.SEMNE_3S_MD.sageata + EN.CONTRAST_POVESTE.punteLa]
    const scena = siruri(SCENA.SCENA_CAUTARE_3S_MD).map((x) => x.trim())
    const lipsaEn = [...campuri, ...intregi].filter((x) => !afara.includes(x))
    const lipsaScena = scena.filter((x) => !subRo.includes(x))
    console.log('[editie-cautare-ai] campuri EN ' + (campuri.length + intregi.length) + ', ale scenei ' + scena.length + '; lipsa ' + lipsaEn.length + ' / ' + lipsaScena.length)
    expect(lipsaEn).toEqual([])
    expect(lipsaScena).toEqual([])
  })

  it('martor POZITIV: un camp scos din HTML e raportat lipsa', () => {
    const m = mainEn().split(EN.SOAPTA_POVESTE.emfaza).join('')
    expect(textPeLimba(m).afara.includes(EN.SOAPTA_POVESTE.emfaza)).toBe(false)
  })

  it('scena romaneasca: zero diacritice si zero siruri ale modulului RO in afara elementelor cu lang="ro"', () => {
    const { afara, subRo } = textPeLimba(mainEn())
    expect(afara.match(DIACRITICE_RO) ?? []).toEqual([])
    expect(siruriRoIn(afara)).toEqual([])
    // Controlul citirii: scena chiar are diacritice, sub lang.
    expect((subRo.match(DIACRITICE_RO) ?? []).length).toBeGreaterThan(5)
  })

  it('lista sirurilor identice RO = EN e exacta: fiecare sir e in ambele module si are motiv', () => {
    const ro = new Set(siruri(RO).map((x) => x.replace(/\s+/g, ' ').trim()))
    const en = new Set(siruri(EN).map((x) => x.replace(/\s+/g, ' ').trim()))
    for (const [sir, motiv] of Object.entries(IDENTICE_RO_EN)) {
      expect(ro.has(sir) && en.has(sir), sir).toBe(true)
      expect(motiv.length, sir).toBeGreaterThan(10)
    }
  })

  it('martor POZITIV pe pagina: un camp EN inlocuit cu un sir RO FARA diacritice e prins in afara lui lang="ro"', () => {
    // Sirul se alege la rulare din dictionar: primul fara diacritice (deci invizibil pentru regula diacriticelor).
    const fara = dictionarRo().find((x) => (x.match(DIACRITICE_RO) ?? []).length === 0)
    expect(fara, 'dictionarul are un sir RO fara diacritice').toBeDefined()
    const citate = EN.FRUSTRARE_POVESTE.citate as unknown as string[]
    const vechi = citate[0]
    citate[0] = fara!
    try {
      const { afara } = textPeLimba(mainEn())
      expect(afara.match(DIACRITICE_RO) ?? []).toEqual([])
      expect(siruriRoIn(afara)).toContain(fara)
    } finally {
      citate[0] = vechi
    }
    expect(siruriRoIn(textPeLimba(mainEn()).afara)).toEqual([])
  })

  it('martor POZITIV: fara `lang` pe pasajul citat, diacriticele lui ies in afara', () => {
    const m = mainEn().replace(/(<blockquote\b[^>]*?)\slang="ro"/, '$1')
    expect((textPeLimba(m).afara.match(DIACRITICE_RO) ?? []).length).toBeGreaterThan(0)
  })
})

// ---------------------------------------------------------------------------------------------
// 5. Regulile de continut ale paginilor de produs EN, pe textul povestii
// ---------------------------------------------------------------------------------------------

/**
 * Tiparele din `tests/en-produs.test.ts`, asamblate din bucati, aplicate textului povestii (acolo se aplica textului
 * aprobat al modulului, care nu se mai monteaza). O singura abatere, scrisa: tiparul deciziei 43 pentru instalare
 * cere aici forma de aplicatie ("install the app", "installation of 3S"), fiindca povestea numeste montajul unui
 * compresor (o replica de birou si numele unui fisier al dosarului fictiv), nu o aplicatie de instalat. Martorii o
 * arata: instalarea unei aplicatii e prinsa, montajul utilajului nu.
 */
const WA = 'Whats' + 'App'
const ASISTENT = '(ask|asking|asked|questions?|answers?|answered|assistant|chat|chatting|bot|search(es|ed|ing)?|find(?!\\s+(us|3S|our team)\\b)|finds|finding|look(s|ing)? up|quer(y|ies|ying)|retriev(e|es|ed|ing))'
const ACEEASI = '[^.?!\\n]{0,50}'
const INSTALARE_APLICATIE = 'install(s|ed|ing|ation)?\\s+(of\\s+)?(the\\s+|our\\s+|a\\s+)?(3S|ap' + 'p|application|software|client|agent)'
const REGULI: { nume: string; tipar: RegExp; rau: string }[] = [
  { nume: 'moneda romaneasca', tipar: MONEDA, rau: 'From 90 ' + 'R' + 'ON a month.' },
  { nume: 'garantie a produsului', tipar: new RegExp('\\bguarant' + 'ee', 'i'), rau: 'A ' + 'guarant' + 'eed answer.' },
  { nume: 'instant', tipar: new RegExp('\\binst' + 'ant(ly)?\\b', 'i'), rau: 'Answers ' + 'inst' + 'antly.' },
  { nume: 'procent de acuratete', tipar: new RegExp('\\d\\s*' + '%'), rau: '98' + '% accurate.' },
  { nume: 'numar de pagina ca fapt', tipar: new RegExp('\\bp\\.\\s*\\d|\\bpage\\s+\\d', 'i'), rau: 'Source: contract.pdf, p.' + ' 4' },
  {
    nume: 'functie scoasa prin decizia 43',
    tipar: new RegExp(
      ['\\bS' + 'SO\\b', '\\bA' + 'PI\\b', 'webh' + 'ook', 'client port' + 'al', 'automat' + 'ion', 'mobile ' + 'app', 'desktop ' + 'app', INSTALARE_APLICATIE, 'own stor' + 'age', 'integrat' + 'ion'].join('|'),
      'i',
    ),
    rau: 'Install the desktop ' + 'app first.',
  },
  {
    nume: 'asistent pe WhatsApp (decizia 49)',
    tipar: new RegExp(['\\b' + ASISTENT + '\\b' + ACEEASI + '\\b' + WA + '\\b', '\\b' + WA + '\\b' + ACEEASI + '\\b' + ASISTENT + '\\b'].join('|'), 'i'),
    rau: 'Ask your archive on ' + WA + '.',
  },
]

describe('regulile de continut pe textul povestii', () => {
  const text = [EN.EROU_POVESTE, EN.AVALANSA_POVESTE, EN.RECUNOASTERE_POVESTE, EN.FRUSTRARE_POVESTE, EN.SOAPTA_POVESTE, EN.LUMINA_POVESTE, EN.EXTRAGERE_POVESTE, EN.CONTRAST_POVESTE, EN.CTA_POVESTE]
    .flatMap(siruri)
    .join('\n')

  it('martorii: fiecare tipar prinde fraza lui fabricata; montajul utilajului nu e acuzat', () => {
    for (const r of REGULI) expect(r.tipar.test(r.rau), r.nume).toBe(true)
    const montaj = 'Another company did the ' + 'install; install_' + 'capture.png'
    for (const r of REGULI) expect(r.tipar.test(montaj), r.nume).toBe(false)
  })

  it('niciun tipar nu prinde textul povestii', () => {
    expect(REGULI.filter((r) => r.tipar.test(text)).map((r) => r.nume + ': ' + text.match(r.tipar)?.[0])).toEqual([])
  })
})

// ---------------------------------------------------------------------------------------------
// 6. G-AI-02 pe textul servit (aproximarea statica a masuratorii din browser)
// ---------------------------------------------------------------------------------------------

describe('declaratia G-AI-02 a rutei, pe textul servit al paginii EN', () => {
  const decl = (
    JSON.parse(readFileSync(join(RADACINA, 'config', 'seo', 'en-produs.json'), 'utf8')) as {
      raspuns_autonom: Record<string, { intrebare: string; entitati: string[]; fara_regula_paragrafului?: string }>
    }
  ).raspuns_autonom['/features/search']

  /** Cuvintele normalizate, ca in `tests/browser/ajutor/geo.ts`. */
  const cuvinte = (t: string) =>
    t
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .toLowerCase()
      .replace(/\s+/g, ' ')
      .split(' ')
      .filter((c) => /[a-z0-9]/.test(c))

  it('entitatile declarate si h1-ul in primele 400 de cuvinte din <main>; scutirea paragrafului are motiv scris', () => {
    const m = mainEn()
    const { afara, subRo } = textPeLimba(m)
    expect(subRo.length).toBeGreaterThan(0)
    // Textul intreg al lui <main>, in ordinea din pagina (cu scena), cum il citeste masuratoarea din browser.
    const tot = decodeaza(m.replace(/<script\b[\s\S]*?<\/script>/g, ' ').replace(/<[^>]+>/g, ' '))
    const fereastra = ' ' + cuvinte(tot).slice(0, 400).join(' ') + ' '
    console.log('[editie-cautare-ai] cuvinte in <main>: ' + cuvinte(tot).length + '; in afara scenei: ' + cuvinte(afara).length)
    const lipsa = decl.entitati.filter((e) => !new RegExp('(^|[^a-z0-9])' + cuvinte(e).join(' ') + '($|[^a-z0-9])').test(fereastra))
    expect(lipsa).toEqual([])
    expect(fereastra).toContain(' ' + cuvinte(H1_EN).join(' ') + ' ')
    expect((decl.fara_regula_paragrafului ?? '').trim().length).toBeGreaterThanOrEqual(40)
  })

  it('martor POZITIV: o entitate absenta din pagina nu e gasita', () => {
    const fereastra = ' ' + cuvinte(decodeaza(mainEn().replace(/<[^>]+>/g, ' '))).slice(0, 400).join(' ') + ' '
    expect(fereastra.includes(' zq' + 'entitate martor ')).toBe(false)
    expect(fereastra.includes(' ' + cuvinte(EN.EROU_POVESTE.rand1).join(' ') + ' ')).toBe(true)
  })
})
