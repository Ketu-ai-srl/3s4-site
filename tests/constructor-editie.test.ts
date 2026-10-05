import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createElement, type ComponentType } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import Chestionar from '../src/components/constructor/Chestionar'
import Constructor from '../src/components/constructor/Constructor'
import ConstructorEn from '../src/components/constructor/ConstructorEn'
import ConstructorRoMd from '../src/components/constructor/ConstructorRoMd'
import { CONTINUT_LUME_RO as RO } from '../src/components/constructor/Lume'
import type { ContinutLume } from '../src/components/constructor/LumeVedere'
import Panou, { semnalGol } from '../src/components/constructor/Panou'
import { construiesteSimularea, stareFinala } from '../src/components/constructor/duel-motor'
import { RASPUNSURI_GOALE, type Raspunsuri } from '../src/components/constructor/stare'
import { CODURI_INDUSTRIE, type CodCanal, type CodCine, type CodIndustrie, type CodVolum } from '../src/content/acasa'
import { continutLumeEn } from '../src/content/en/acasa-constructor-componente'
import { continutLumeRoMd } from '../src/content/ro-md/acasa-constructor-componente'

/**
 * CONSTRUCTORUL PE EDITIE (felia 122, decizia 59, forma (a) a intrebarii 2). Constructorul de pe start are o vedere
 * fara continut (`ConstructorVedere`, `LumeVedere` si piesele lor: Panou, Chestionar, Duel, Scene, duel-motor) si cate
 * o invelitoare pe editie: RO (`Constructor`, `Lume`, aceleasi cai si exporturi ca inainte), `en` (`ConstructorEn`,
 * `ConstructorLumeEn`) si `ro-MD` (`ConstructorRoMd`, `ConstructorLumeRoMd`).
 *
 * CE DOVEDESTE PROBA ASTA si ce nu. Aici: (1) sursa vederilor nu importa nicio valoare din `src/content/` (deci
 * pachetul JS al unei editii 3s.md nu primeste textul RO prin ele); (2) continutul EN si cel ro-MD acopera fiecare
 * camp de text al constructorului RO, in afara listei INCHISE a campurilor scoase de forma (a) (lista de reguli si
 * randul de integrari, numele canalelor din banda, benzile si toast-urile scenelor, pista termenului din scena
 * Avocatura), cu aceleasi acolade; (3) textul EN e ASCII, fara niciun sir al constructorului RO, si niciuna din
 * editiile 3s.md nu scrie lei; (4) randarea pe editie: panoul fara reguli, integrari si benzi, pista termenului
 * scoasa, butonul final si CTA-ul estimarii pe legatura WhatsApp primita, fara toast in duel; pe RO, aceleasi ramuri
 * exista si duc spre `/inregistrare` (martorul ramurilor). Partea RO (HTML-ul si fluxul RSC ale lui `/` neschimbate)
 * NU se dovedeste aici: dovada e invarianta pe build (`tests/invarianta-ro.test.ts`), iar lumea de dupa clic o tin
 * probele de browser ale constructorului, neschimbate; pe 3s.md, `tests/browser/constructor-editie.spec.ts`.
 *
 * FIXTURILE se asambleaza la rulare: legatura WhatsApp e compusa din bucati, dictionarul RO se construieste din
 * modulele RO, martorii primesc un sir RO luat tot de acolo.
 */

const RADACINA = fileURLToPath(new URL('..', import.meta.url))
const WA = 'https://' + 'wa.me/' + '37300000000?text=' + encodeURIComponent('[ref:proba-122]')
const EN = continutLumeEn(WA)
const RO_MD = continutLumeRoMd(WA)
const DIACRITICE = /[ăâîșțşţĂÂÎȘȚŞŢ]/
const LEI = new RegExp('\\b(' + 'R' + 'ON|' + 'lei)\\b', 'i')

// ---------------------------------------------------------------------------------------------
// 1. Vederile nu importa valori din `src/content/`
// ---------------------------------------------------------------------------------------------

const VEDERI = [
  'ConstructorVedere.tsx',
  'LumeVedere.tsx',
  'Panou.tsx',
  'Chestionar.tsx',
  'Duel.tsx',
  'Scene.tsx',
  'duel-motor.ts',
  'Iconite.tsx',
  'stare.ts',
  'program.ts',
  'Arbore3D.tsx',
]

/** Modulele de continut fara text pe care o vedere le poate importa ca valori: numai coduri. */
const PERMISE = new Set(['acasa-constructor-precompletari'])

/** Importurile de VALORI dintr-un modul `@/content/...` (cele `import type` nu intra). */
function importuriDeValori(sursa: string): string[] {
  const gasite: string[] = []
  // Clauza nu trece de `;` si nu contine `from`: altfel potrivirea ar incepe la un import anterior.
  const tipar = /(?:^|\n)\s*(import|export)\s+((?:(?!\bfrom\b)[^;])*?)\s+from\s+["']@\/content\/([^"']+)["']/g
  for (const m of sursa.matchAll(tipar)) {
    const clauza = m[2].trim()
    if (clauza.startsWith('type ')) continue
    // `import { type A, type B }`: numai tipuri, deci nicio valoare.
    const acolade = /^\{([\s\S]*)\}$/.exec(clauza)
    if (acolade && acolade[1].split(',').map((x) => x.trim()).filter(Boolean).every((x) => x.startsWith('type '))) continue
    if (!PERMISE.has(m[3])) gasite.push(m[3])
  }
  return gasite
}

describe('vederile constructorului nu importa continut', () => {
  it('nicio valoare din src/content/ in cele ' + VEDERI.length + ' fisiere ale vederii', () => {
    const abateri: string[] = []
    for (const f of VEDERI) {
      const sursa = readFileSync(join(RADACINA, 'src', 'components', 'constructor', f), 'utf8')
      for (const m of importuriDeValori(sursa)) abateri.push(f + ' importa valori din @/content/' + m)
    }
    expect(abateri).toEqual([])
  })

  it('martor POZITIV: un import de valoare fabricat e prins; martor NEGATIV: importurile de tip nu', () => {
    const modul = 'acasa' + '-constructor'
    expect(importuriDeValori('import { COMUN } from "@/content/' + modul + '";')).toEqual([modul])
    expect(importuriDeValori('import {\n  ESTIMARE,\n  type Banda,\n} from "@/content/' + modul + '";')).toEqual([modul])
    expect(importuriDeValori('export { COMUN } from "@/content/' + modul + '";')).toEqual([modul])
    expect(importuriDeValori('import type { Banda } from "@/content/' + modul + '";')).toEqual([])
    expect(importuriDeValori('import { type Banda, type Scenariu } from "@/content/' + modul + '";')).toEqual([])
    // Martorul de sensibilitate pe fisierele reale: invelitoarea RO importa continut si trebuie acuzata.
    const ro = readFileSync(join(RADACINA, 'src', 'components', 'constructor', 'Lume.tsx'), 'utf8')
    expect(importuriDeValori(ro).length).toBeGreaterThan(0)
  })
})

// ---------------------------------------------------------------------------------------------
// 2. Acoperirea: fiecare camp de text RO are pereche pe editie, in afara listei inchise
// ---------------------------------------------------------------------------------------------

/** Cheile care nu poarta text: iconitele, codurile si starea actelor din scena Imobiliare (cod). */
function faraText(cale: string[]): boolean {
  const k = cale[cale.length - 1]
  if (k === 'iconita' || k === 'cod') return !(cale[1] === 'constructii' && cale[2] === 'obiect')
  return k === 'stare' && cale[1] === 'imobiliare' && cale[3] === 'acte'
}

function frunze(o: unknown, cale: string[] = [], acc = new Map<string, string>()): Map<string, string> {
  if (typeof o === 'string') {
    if (!faraText(cale)) acc.set(cale.join('.'), o)
  } else if (Array.isArray(o)) {
    o.forEach((v, i) => frunze(v, [...cale, String(i)], acc))
  } else if (o && typeof o === 'object') {
    for (const [k, v] of Object.entries(o)) if (typeof v !== 'function') frunze(v, [...cale, k], acc)
  }
  return acc
}

/** Textul unei editii: capul, comunele, canalele, chestionarul, duelul, estimarea si scenele. */
function texteEditie(c: ContinutLume): Map<string, string> {
  const { cap, comun, numeCanal, chestionar, duel, estimare, scenarii } = c
  return frunze({ cap, comun, numeCanal, chestionar, duel, estimare, scenarii })
}

/** LISTA INCHISA a campurilor scoase de forma (a), ca tipare pe cale. */
const SCOASE: RegExp[] = [
  /^comun\.automatizari$/,
  /^comun\.integrari\./,
  /^numeCanal\.(email|mesaj|hartie)\.banda$/,
  /^scenarii\.[a-z]+\.benzi\./,
  /^scenarii\.[a-z]+\.duel\.toast$/,
  /^scenarii\.avocatura\.obiect\.(zileInitial|zileCorect|dataInitiala|dataCorecta)$/,
]

function acolade(t: string, faraDe: boolean): string[] {
  return [...t.matchAll(/\{(\w+)(\|de)?\}/g)].map((m) => m[1] + (faraDe ? '' : m[2] ?? '')).sort()
}

function acoperire(editie: ContinutLume, faraDe: boolean) {
  const ro = texteEditie(RO)
  const ed = texteEditie(editie)
  const lipsa = [...ro.keys()].filter((k) => !ed.has(k))
  const lipsaNedeclarata = lipsa.filter((k) => !SCOASE.some((t) => t.test(k)))
  const declarataPrezenta = [...ed.keys()].filter((k) => SCOASE.some((t) => t.test(k)))
  const orfane = [...ed.keys()].filter((k) => !ro.has(k))
  const goale = [...ed.entries()].filter(([, v]) => v.trim() === '').map(([k]) => k)
  const acoladeDiferite = [...ed.entries()]
    .filter(([k, v]) => ro.has(k) && acolade(v, faraDe).join() !== acolade(ro.get(k)!, faraDe).join())
    .map(([k]) => k)
  return { ro: ro.size, ed: ed.size, lipsa, lipsaNedeclarata, declarataPrezenta, orfane, goale, acoladeDiferite }
}

describe('acoperirea textelor pe editie', () => {
  for (const [nume, c, faraDe] of [
    ['en', EN, true],
    ['ro-MD', RO_MD, false],
  ] as const) {
    it(nume + ': fiecare camp RO are pereche, in afara listei inchise; aceleasi acolade; nimic orfan sau gol', () => {
      const r = acoperire(c, faraDe)
      expect(r.lipsaNedeclarata).toEqual([])
      expect(r.declarataPrezenta).toEqual([])
      expect(r.orfane).toEqual([])
      expect(r.goale).toEqual([])
      expect(r.acoladeDiferite).toEqual([])
      // Numaratoarea fisei de continut: 485 de campuri RO, 67 scoase, 418 scrise. Aici 484 si 66: al 485-lea camp,
      // actiunea benzii canalelor (`BANDA_CANALE`), nu e un camp al continutului lumii, ci intra prin `benziPeEcran`,
      // pe care editiile 3s.md il au gol.
      expect([r.ro, r.lipsa.length, r.ed]).toEqual([484, 66, 418])
    })
  }

  it('martor POZITIV: un camp scos de forma (a) pus inapoi si un camp sters sunt prinse', () => {
    const cuBanda: ContinutLume = {
      ...EN,
      scenarii: { ...EN.scenarii, it: { ...EN.scenarii.it, duel: { ...EN.scenarii.it.duel, toast: 'x y' } } },
    }
    expect(acoperire(cuBanda, true).declarataPrezenta).toEqual(['scenarii.it.duel.toast'])
    const faraFraza = { ...EN, comun: { ...EN.comun, schimba: undefined as unknown as string } }
    expect(acoperire(faraFraza, true).lipsaNedeclarata).toEqual(['comun.schimba'])
  })
})

// ---------------------------------------------------------------------------------------------
// 3. Limba: EN in ASCII, fara siruri RO; nicio editie 3s.md nu scrie lei
// ---------------------------------------------------------------------------------------------

/**
 * Dictionarul RO al constructorului: textele RO de cel putin doua cuvinte sau cu diacritice, fara cele lasate
 * identice pe EN in acelasi camp (simbolurile: numere de dosar, revizii, perioade).
 */
function dictionarRo(): string[] {
  const ro = texteEditie(RO)
  const en = texteEditie(EN)
  return [...ro.entries()]
    .filter(([k, v]) => en.get(k) !== v)
    .map(([, v]) => v.trim())
    .filter((v) => v.split(/\s+/).length >= 2 || DIACRITICE.test(v))
}

/**
 * Forma fara diacritice (NFD, semnele combinate scoase: s si t cu virgula sau cu sedila devin s si t). Poarta ASCII
 * obliga orice text EN sa nu aiba diacritice, deci un sir RO scurs in EN ar arata exact asa.
 */
const faraDiacritice = (t: string) => t.normalize('NFD').replace(/\p{M}/gu, '')

/**
 * Sirurile dictionarului gasite in text: identic, sau (numai cele de cel putin doua cuvinte, ca un cuvant scurt fara
 * diacritice sa nu se potriveasca intamplator cu engleza) dupa scoaterea diacriticelor din ambele.
 */
function siruriRoIn(text: string, dictionar: string[]): string[] {
  const t = faraDiacritice(text)
  return dictionar.filter((s) => text.includes(s) || (s.split(/\s+/).length >= 2 && t.includes(faraDiacritice(s))))
}

describe('limba editiilor', () => {
  const textEn = [...texteEditie(EN).values()].join('\n')

  it('EN: numai ASCII, zero diacritice, zero siruri din dictionarul RO al constructorului', () => {
    const dictionar = dictionarRo()
    expect(dictionar.length).toBeGreaterThan(300)
    expect([...textEn].filter((ch) => ch.charCodeAt(0) > 127)).toEqual([])
    expect(DIACRITICE.test(textEn)).toBe(false)
    expect(siruriRoIn(textEn, dictionar)).toEqual([])
  })

  it('martor POZITIV: un sir RO strecurat intr-un camp EN e prins', () => {
    const dictionar = dictionarRo()
    const strecurat = textEn + '\n' + RO.scenarii.logistica.durere
    expect(siruriRoIn(strecurat, dictionar)).toEqual([RO.scenarii.logistica.durere])
  })

  it('martor POZITIV: un sir RO scris FARA diacritice (forma pe care o cere poarta ASCII) e prins', () => {
    const dictionar = dictionarRo()
    const sir = RO.comun.schimba
    expect(DIACRITICE.test(sir)).toBe(true)
    const fara = faraDiacritice(sir)
    expect(DIACRITICE.test(fara)).toBe(false)
    const strecurat = { ...EN, comun: { ...EN.comun, schimba: fara } }
    const text = [...texteEditie(strecurat).values()].join(' ')
    expect([...text].filter((ch) => ch.charCodeAt(0) > 127)).toEqual([])
    expect(siruriRoIn(text, dictionar)).toEqual([sir])
  })

  it('niciun lei pe editiile 3s.md (EN si ro-MD); martor: textul RO al panoului are', () => {
    expect(LEI.test(textEn)).toBe(false)
    expect(LEI.test([...texteEditie(RO_MD).values()].join('\n'))).toBe(false)
    expect(LEI.test(RO.comun.final.subRand)).toBe(true)
  })
})

// ---------------------------------------------------------------------------------------------
// 4. Randarea pe editie
// ---------------------------------------------------------------------------------------------

const h = (C: ComponentType<never>, p: object) => renderToStaticMarkup(createElement(C, p as never))

function panou(c: ContinutLume, industrie: CodIndustrie, canale: CodCanal[] | null = null): string {
  return h(Panou as ComponentType<never>, {
    industrie,
    numeIndustrie: 'X',
    scenariu: c.scenarii[industrie],
    benzi: c.text.benziPeEcran(industrie, canale),
    cheie: 0,
    activ: true,
    semnal: { current: semnalGol() },
    laReluare: () => {},
    momentAlegere: 0,
    continut: c,
  })
}

function chestionar(c: ContinutLume, industrie: CodIndustrie, canale: CodCanal[], volum: CodVolum, cine: CodCine): string {
  const raspunsuri: Raspunsuri = {
    ...RASPUNSURI_GOALE,
    canale,
    volum,
    cine,
    atinse: true,
    dezvaluit: 4,
    confirmat: true,
    deschis: true,
    estimareDezvaluita: true,
    rulare: 1,
  }
  return h(Chestionar as ComponentType<never>, { industrie, raspunsuri, setRaspunsuri: () => {}, continut: c })
}

/** Legaturile WhatsApp randate, cu `data-canal`. */
function legaturiWa(html: string): number {
  return [...html.matchAll(/<a href="https:\/\/wa\.me\/[^"]+"[^>]*data-canal="whatsapp"/g)].length
}

describe('randarea pe editie', () => {
  // Panoul se randeaza in starea finala (miscare redusa): `matchMedia` intoarce `matches: true`.
  const w = globalThis as unknown as { window?: unknown }
  let vechi: unknown
  beforeAll(() => {
    vechi = w.window
    w.window = { matchMedia: () => ({ matches: true, addEventListener() {}, removeEventListener() {} }) }
  })
  afterAll(() => {
    w.window = vechi
  })

  for (const [nume, c] of [
    ['en', EN],
    ['ro-MD', RO_MD],
  ] as const) {
    it(nume + ': panoul pe 9 industrii fara reguli, integrari si benzi, cu butonul final pe WhatsApp', () => {
      for (const ind of CODURI_INDUSTRIE) {
        const html = panou(c, ind, ['email', 'hartie'])
        expect(html, ind).toContain('data-panou="gata"')
        expect(html, ind).not.toMatch(/_automatizari_|_integrari_|_banda_|_etichetaAuto_/)
        expect(legaturiWa(html), ind).toBe(1)
        expect(html, ind).not.toContain('/inregistrare')
        expect(html, ind).toContain(c.comun.final.titlu.replace(/'/g, '&#x27;'))
        expect(html, ind).toContain(c.scenarii[ind].concluzie.replace(/'/g, '&#x27;'))
      }
    })

    it(nume + ': scena Avocatura fara pista termenului, cu nota', () => {
      const html = panou(c, 'avocatura')
      expect(html).not.toMatch(/_pistaTermen_|_zid_|_dataLimita_|class="_zile_/)
      expect(html).toContain('_notaLimita_')
    })

    it(nume + ': chestionarul confirmat duce estimarea spre WhatsApp, fara /inregistrare', () => {
      for (const ind of CODURI_INDUSTRIE) {
        const html = chestionar(c, ind, ['email', 'mesaj'], 'v50', 'coleg')
        expect(legaturiWa(html), ind).toBe(1)
        expect(html, ind).not.toContain('/inregistrare')
        expect(html, ind).toContain('data-estimare="' + c.calcul.estimare(2, 'v50').manual + '"')
      }
    })

    it(nume + ': duelul fara toast pe toate industriile, cu cifrele formulei RO', () => {
      for (const ind of CODURI_INDUSTRIE) {
        const p = { industrie: ind, canale: ['email', 'mesaj', 'hartie'] as CodCanal[], volum: 'v99' as const, cine: 'nimeni' as const }
        expect(construiesteSimularea(p, c).evenimente.filter((e) => e.fel === 'toast').length, ind).toBe(0)
        const s = stareFinala(p, c)
        const r = stareFinala(p, RO)
        expect([s.nesortate, s.timpPierdut, s.termene, s.dosareDreapta], ind).toEqual([r.nesortate, r.timpPierdut, r.termene, r.dosareDreapta])
      }
    })
  }

  it('en: minutele cu punct, canalele cu "and", estimarea in ore', () => {
    const html = chestionar(EN, 'it', ['email', 'mesaj'], 'v50', 'eu')
    expect(html).toContain('4.5 min')
    const fraza = EN.text.completeaza(EN.duel.final.eu, {
      volum: EN.duel.volumInCuvinte.v50,
      canale: EN.text.listaCanale(['hartie', 'email'], 'fraza'),
      timp: '1 h',
    })
    expect(fraza).toContain(EN.numeCanal.email.fraza + ' and ' + EN.numeCanal.hartie.fraza)
    expect(fraza).not.toMatch(/\{\w+\}/)
  })

  it('ro-MD: formulele pastreaza forma cu "de", minutele cu virgula', () => {
    const html = chestionar(RO_MD, 'it', ['email', 'mesaj'], 'v50', 'eu')
    expect(html).toContain('4,5')
    expect(RO_MD.text.completeaza('{n|de}', { n: 30 })).toBe('30 de')
  })

  it('fara WhatsApp pe domeniu, butoanele raman inerte (`data-tinta-lipsa`), nu dispar', () => {
    const fara = continutLumeEn(null)
    const html = panou(fara, 'it')
    expect(legaturiWa(html)).toBe(0)
    expect(html).toContain('data-tinta-lipsa="nedecisa"')
  })

  it('martorul ramurilor, pe RO: lista de reguli, randul de integrari, benzile si pista termenului exista; tinta e /inregistrare', () => {
    const html = panou(RO, 'avocatura', ['email', 'hartie'])
    expect(html).toMatch(/_automatizari_/)
    expect(html).toMatch(/_integrari_/)
    expect(html).toMatch(/_banda_/)
    expect(html).toMatch(/_pistaTermen_/)
    expect(html).toContain('/inregistrare')
    expect(legaturiWa(html)).toBe(0)
    const sim = construiesteSimularea({ industrie: 'it', canale: ['email'], volum: 'v99', cine: 'eu' }, RO)
    expect(sim.evenimente.filter((e) => e.fel === 'toast').length).toBe(2)
  })

  it('capul servit: aceeasi forma pe RO, EN si ro-MD (etichete, clase, ancora), cu textul editiei', () => {
    const forma = (html: string) => html.replace(/>[^<]+</g, '><')
    const ro = h(Constructor as ComponentType<never>, {})
    const en = h(ConstructorEn as ComponentType<never>, { tinta: WA })
    const md = h(ConstructorRoMd as ComponentType<never>, { tinta: WA })
    expect(forma(en)).toBe(forma(ro))
    expect(forma(md)).toBe(forma(ro))
    expect(en).toContain('id="constructor"')
    expect(en).toContain('>' + EN.cap.titlu.replace(/'/g, '&#x27;') + '<')
    expect([...en.matchAll(/data-industrie="/g)].length).toBe(9)
    expect(DIACRITICE.test(en)).toBe(false)
  })
})
