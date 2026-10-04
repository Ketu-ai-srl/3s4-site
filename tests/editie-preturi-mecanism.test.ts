import { readFileSync } from 'node:fs'
import { createElement, type ComponentType, type ReactNode } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import BirouInteractivVedere, { type ContinutBirou } from '../src/components/preturi/BirouInteractivVedere'
import ButonInapoiVedere from '../src/components/preturi/ButonInapoiVedere'
import CalculatorVedere, { type ContinutCalculator } from '../src/components/preturi/CalculatorVedere'
import ComutatorPerioadaVedere from '../src/components/preturi/ComutatorPerioadaVedere'
import FaqPreturi from '../src/components/preturi/FaqPreturi'
import GrilaPlanuriVedere, { type ContinutGrila } from '../src/components/preturi/GrilaPlanuriVedere'
import LiniaDeBaza from '../src/components/preturi/LiniaDeBaza'
import ListaPdfVedere, { FoaieOfertaVedere, type ContinutListaPdf } from '../src/components/preturi/ListaPdfVedere'
import LumeaPreturiVedere, { type ContinutLumeaPreturi } from '../src/components/preturi/LumeaPreturiVedere'
import PacheteVedere from '../src/components/preturi/PacheteVedere'
import PliuriVedere from '../src/components/preturi/PliuriVedere'
import TabelPlanuri, { type ContinutTabelPlanuri } from '../src/components/preturi/TabelPlanuri'
import { formatBani, formatZecimal, FORMAT_ROMANESC } from '../src/components/preturi/calcul'
import * as PRETURI from '../src/content/preturi'
import type { Cursor, Perioada, Plan, RandPlan } from '../src/content/preturi'

/**
 * MECANISMUL PE EDITIE AL PIESELOR DE PRET (felia 102). Insulele client ale paginii de preturi au o vedere
 * fara continut si o invelitoare RO la aceeasi cale (Pachete, LumeaPreturi, Pliuri, ButonInapoi si piesele
 * lor: Calculator, ComutatorPerioada, GrilaPlanuri, ListaPdf, BirouInteractiv); componentele de server
 * (LiniaDeBaza, TabelPlanuri, FaqPreturi) primesc continutul prin proprietati optionale, cu implicitul RO.
 *
 * CE DOVEDESTE PROBA ASTA si ce nu. Aici se dovedeste partea EDITIEI: cu un continut sintetic, vederea scoate
 * exact textul primit si nimic din continutul romanesc, iar sursa vederilor nu importa nicio valoare din
 * `src/content/` si nu poarta niciun sir RO (deci pachetul JS al unei editii care le monteaza cu invelitoarea
 * ei nu primeste textul RO prin ele). Partea RO (HTML-ul si fluxul RSC ale lui `/preturi` neschimbate) NU se
 * dovedeste aici: dovada RO e invarianta pe build (`tests/invarianta-ro.test.ts`), iar starile de dupa clic
 * (calculatorul deschis, pliurile, tiparirea) le tin probele de browser ale preturilor, neschimbate.
 *
 * DICTIONARUL RO se construieste la rulare: toate sirurile din modulul `src/content/preturi.ts` (frunzele
 * constantelor) plus textele si etichetele din randarea RO a fiecarei componente, fara proprietati, plus
 * rezultatele functiilor de continut (randurile planurilor). Intra sirurile de cel putin doua cuvinte si cele
 * cu diacritice. CONTINUTUL SINTETIC se asambleaza la rulare, din prefix si contor, deci proba nu poarta
 * literal niciun text al vreunei editii. MARTORUL: acelasi continut sintetic, cu un singur sir RO strecurat
 * intr-un camp, e prins.
 */

// ---------------------------------------------------------------------------------------------
// Dictionarul RO si detectorul (aceeasi forma ca proba mecanismului startului)
// ---------------------------------------------------------------------------------------------

const DIACRITICE = /[ăâîșțşţĂÂÎȘȚŞŢ]/

function decodeaza(t: string): string {
  return t
    .replace(/&#x27;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
}

/** Spatiul de nedespartire devine spatiu obisnuit, ca textul randat si constantele sa se compare la fel. */
function plat(t: string): string {
  return t.replace(/ /g, ' ')
}

/** Textul si etichetele accesibile; continutul lui `<style>` (regulile de tiparire, cod) nu e text. */
function textSiEtichete(html: string): string[] {
  html = html.replace(/<style>[\s\S]*?<\/style>/g, '<style></style>')
  const texte = [...html.matchAll(/>([^<]+)</g)].map((m) => plat(decodeaza(m[1])).trim())
  const atribute = [...html.matchAll(/\s(?:aria-label|title|alt|aria-valuetext)="([^"]*)"/g)].map((m) => plat(decodeaza(m[1])).trim())
  return [...texte, ...atribute].filter((t) => t !== '')
}

function semnificativ(t: string): boolean {
  return t.split(/\s+/).filter(Boolean).length >= 2 || DIACRITICE.test(t)
}

function frunze(valoare: unknown, acc: string[] = []): string[] {
  if (typeof valoare === 'string') {
    const t = plat(valoare).trim()
    if (t !== '' && !/^(\/|#|https?:|mailto:)/.test(t) && semnificativ(t)) acc.push(t)
  } else if (Array.isArray(valoare)) {
    for (const v of valoare) frunze(v, acc)
  } else if (valoare && typeof valoare === 'object') {
    for (const v of Object.values(valoare)) frunze(v, acc)
  }
  return acc
}

function render(c: ComponentType<never> | ((p: never) => ReactNode), props: Record<string, unknown> = {}): string {
  return renderToStaticMarkup(createElement(c as ComponentType<Record<string, unknown>>, props))
}

/** Invelitorile RO, randate fara proprietati de continut: sursa a doua a dictionarului. */
async function randariRo(): Promise<string[]> {
  const { default: LumeaPreturi } = await import('../src/components/preturi/LumeaPreturi')
  const { default: Pachete } = await import('../src/components/preturi/Pachete')
  const { default: Pliuri } = await import('../src/components/preturi/Pliuri')
  const { default: BirouInteractiv } = await import('../src/components/preturi/BirouInteractiv')
  const { FoaieOferta } = await import('../src/components/preturi/ListaPdf')
  return [
    render(LumeaPreturi, { lume: null }),
    render(LiniaDeBaza),
    render(Pachete, { gazda: 'exemplu.invalid', analitica: false }),
    render(Pliuri, { tabel: createElement(TabelPlanuri) }),
    render(BirouInteractiv, { activ: false }),
    render(FoaieOferta, { gazda: 'exemplu.invalid', data: '1 1 2026' }),
    render(FaqPreturi),
  ]
}

const RANDURI_RO = PRETURI.PLANURI.flatMap((p) => PRETURI.randuriPlan(p))

async function construiesteDictionar(): Promise<string[]> {
  const dinRandare = (await randariRo()).flatMap((h) => textSiEtichete(h)).filter(semnificativ)
  const dinConstante = frunze(Object.values(PRETURI)).concat(frunze(RANDURI_RO))
  return [...new Set([...dinRandare, ...dinConstante])]
}

function scapari(html: string, dict: string[]): string[] {
  const tinta = textSiEtichete(html).join('\n')
  return dict.filter((d) => tinta.includes(d))
}

// ---------------------------------------------------------------------------------------------
// Continutul sintetic
// ---------------------------------------------------------------------------------------------

function fabrica() {
  let n = 0
  const produse: string[] = []
  const t = (rol: string) => {
    n += 1
    const sir = ['Qx', rol, 'v' + n].join(' ')
    produse.push(sir)
    return sir
  }
  return { t, produse }
}

const leg = (text: string, href: string) => ({ text, href, ruta: href })

/** Trei planuri sintetice; primul recomandat. Numele si descrierile vin din fabrica. */
function planuriSintetice(t: (r: string) => string): Plan[] {
  return (['starter', 'pro', 'business'] as const).map((cheie, i) => ({
    cheie,
    nume: t('plan'),
    descriere: t('descriere'),
    pret: { lunar: 0, anual: 0 },
    conturi: 5 * (i + 1),
    recomandat: i === 0,
  }))
}

function cursor(t: (r: string) => string, min: number, max: number, pas: number, implicit: number): Cursor {
  return { eticheta: t('cursor'), unitate: t('unitate'), unitateSpusa: { unu: t('unu'), multe: t('multe') }, min, max, pas, implicit }
}

type Caz = {
  nume: string
  /** Randarea editiei cu continut sintetic; `strecurat` (daca e dat) inlocuieste un camp text. */
  editie: (strecurat?: string) => { html: string; produse: string[] }
}

const CAZURI: Caz[] = [
  {
    nume: 'LumeaPreturiVedere',
    editie: (strecurat) => {
      const { t, produse } = fabrica()
      const continut: ContinutLumeaPreturi = {
        ancore: { pachete: 'packages', poarta: 'choice' },
        etichetaPoarta: t('eticheta'),
        baza: { nume: t('nume'), titlu: t('titlu'), text: strecurat ?? t('text'), mergi: t('mergi') },
        // Textul tintei nu se randeaza pe card (cardul isi are textele lui), deci nu intra in `produse`.
        enterprise: { nume: t('nume'), titlu: t('titlu'), text: t('text'), mergi: t('mergi'), tinta: leg('h', '/enterprise') },
      }
      return { html: render(LumeaPreturiVedere, { lume: null, continut }), produse }
    },
  },
  {
    nume: 'LiniaDeBaza (cu slotul inapoi = ButonInapoiVedere)',
    editie: (strecurat) => {
      const { t, produse } = fabrica()
      const inapoi = createElement(ButonInapoiVedere, { continut: { text: t('inapoi'), ancoraPoarta: 'choice' } })
      const html = render(LiniaDeBaza, { continut: { titlu: t('titlu'), promisiune: t('promisiune'), paragraf: strecurat ?? t('paragraf') }, inapoi })
      return { html, produse }
    },
  },
  {
    nume: 'CalculatorVedere (teaserul)',
    editie: (strecurat) => {
      const { t, produse } = fabrica()
      const continut: ContinutCalculator = {
        teaser: { presupuneri: t('presupuneri'), rezultat: t('rezultat'), cta: strecurat ?? t('cta') },
        eticheta: t('eticheta'),
        cursoare: { persoane: cursor(t, 1, 50, 1, 4), minute: cursor(t, 10, 120, 5, 25), tarif: cursor(t, 22, 210, 4, 50) },
        zileLucratoare: 22,
        timpAcum: { inainte: 'a', dupaBani: 'b', dupaOre: 'c' },
        pretInOre: { inainte: 'a', dupaPlan: 'b', dupaPret: 'c', dupaOre: 'd' },
        pesteConturi: { inainte: () => 'e', dupa: 'f' },
        nota: 'g',
        valoareSpusa: (_c, n) => String(n),
        enterprise: leg('h', '/enterprise'),
      }
      // Teaserul e starea servita; textele starii deschise nu sunt in HTML, deci nu intra in `produse`.
      const vazute = produse.filter((p) => p.includes('presupuneri') || p.includes('rezultat') || p.includes('cta'))
      return { html: render(CalculatorVedere, { perioada: 'anual', continut, planuri: planuriSintetice(t) }), produse: vazute }
    },
  },
  {
    nume: 'ComutatorPerioadaVedere',
    editie: (strecurat) => {
      const { t, produse } = fabrica()
      const continut = { eticheta: t('eticheta'), lunar: t('lunar'), anual: t('anual'), insigna: strecurat ?? t('insigna'), nota: t('nota') }
      return { html: render(ComutatorPerioadaVedere, { perioada: 'anual', laSchimbare: () => undefined, continut }), produse }
    },
  },
  {
    nume: 'GrilaPlanuriVedere',
    editie: (strecurat) => {
      const { t, produse } = fabrica()
      const continut: ContinutGrila = { recomandat: t('recomandat'), unitate: t('unitate'), buton: leg(t('buton'), '/x'), detalii: (r) => r + ' i' }
      const planuri = planuriSintetice(t)
      const randuri: Record<string, RandPlan[]> = {}
      for (const p of planuri) {
        randuri[p.cheie] = [
          { cifra: String(p.conturi), text: t('rand'), explicatie: null },
          { cifra: null, text: p.cheie === 'pro' && strecurat ? strecurat : t('rand'), explicatie: null },
        ]
      }
      const html = render(GrilaPlanuriVedere, { perioada: 'anual', continut, planuri, randuri: (p: Plan) => randuri[p.cheie] })
      return { html, produse }
    },
  },
  {
    nume: 'ListaPdfVedere si FoaieOfertaVedere',
    editie: (strecurat) => {
      const { t, produse } = fabrica()
      const continut: ContinutListaPdf = {
        buton: t('buton'),
        foaie: {
          marca: t('marca'),
          titlu: t('titlu'),
          coloane: { plan: t('col'), lunar: t('col'), anual: t('col') },
          note: [t('nota'), strecurat ?? t('nota')],
          adresa: t('adresa'),
        },
      }
      const planuri = planuriSintetice(t)
      const buton = render(ListaPdfVedere, { gazda: 'exemplu.invalid', continut, planuri, cale: '/pricing', formatData: () => 'd' })
      const foaie = render(FoaieOfertaVedere, { gazda: 'exemplu.invalid', data: 'd', continut, planuri, cale: '/pricing' })
      return { html: buton + foaie, produse }
    },
  },
  {
    nume: 'PliuriVedere (cu BirouInteractivVedere si TabelPlanuri)',
    editie: (strecurat) => {
      const { t, produse } = fabrica()
      const planuri = planuriSintetice(t)
      const birou: ContinutBirou = {
        contor: t('contor'),
        nelimitat: t('nelimitat'),
        adauga: t('adauga'),
        initial: 5,
        maxim: 36,
        conturi: t('conturi'),
        locuri: (n) => 'L' + n,
        scena: () => 's',
      }
      const Birou = (p: { activ: boolean }) => createElement(BirouInteractivVedere, { ...p, continut: birou, planuri })
      const tabelContinut: ContinutTabelPlanuri = {
        functie: t('functie'),
        inclus: t('inclus'),
        derulare: t('derulare'),
        categorii: [
          {
            titlu: t('categorie'),
            randuri: [
              { functie: t('rand'), celule: { starter: { fel: 'da' }, pro: { fel: 'da' }, business: { fel: 'da' } } },
              { functie: t('rand'), celule: { starter: { fel: 'valoare', text: strecurat ?? t('valoare') }, pro: { fel: 'da' }, business: { fel: 'da' } } },
            ],
          },
        ],
      }
      const tabel = createElement(TabelPlanuri, { continut: tabelContinut, planuri })
      const continut = { eticheta: t('eticheta'), birou: { titlu: t('titlu'), paragraf: t('paragraf') }, comparatie: { titlu: t('titlu'), paragraf: t('paragraf') } }
      // Descrierile planurilor nu apar in pliuri (numai numele, pe segmente si in antetul tabelului).
      return { html: render(PliuriVedere, { tabel, continut, Birou }), produse: produse.filter((p) => !p.includes('descriere')) }
    },
  },
  {
    nume: 'FaqPreturi',
    editie: (strecurat) => {
      const { t, produse } = fabrica()
      const continut = {
        titlu: t('titlu'),
        subtitlu: t('subtitlu'),
        intrebari: [
          { intrebare: t('intrebare'), raspuns: strecurat ?? t('raspuns') },
          { intrebare: t('intrebare'), raspuns: t('raspuns') },
        ],
      }
      return { html: render(FaqPreturi, { continut, ancora: 'pricing-questions' }), produse }
    },
  },
]

describe('mecanismul pe editie al preturilor: continut sintetic, zero text RO', async () => {
  const dict = await construiesteDictionar()

  it('dictionarul RO s-a construit si detectorul vede RO (controlul preconditiei)', async () => {
    expect(dict.length, 'siruri RO in dictionar').toBeGreaterThan(50)
    const ro = (await randariRo()).join('\n')
    expect(scapari(ro, dict).length, 'siruri RO gasite in randarea RO').toBeGreaterThan(30)
  })

  for (const caz of CAZURI) {
    describe(caz.nume, () => {
      it('scoate fiecare sir sintetic primit si niciun sir RO', () => {
        const { html, produse } = caz.editie()
        const text = textSiEtichete(html).join('\n')
        expect(produse.length, 'siruri sintetice').toBeGreaterThan(0)
        const lipsa = produse.filter((p) => !text.includes(p))
        expect(lipsa, 'siruri sintetice care nu apar').toEqual([])
        expect(scapari(html, dict), 'siruri RO pe editie').toEqual([])
        expect(html, 'moneda RO pe editie').not.toMatch(/\bRON\b/)
      })

      it('martor: un sir RO strecurat intr-un camp e prins', () => {
        // Sirul cu moneda RO din insigna comutatorului: prins si de dictionar, si de garda monedei.
        const strecurat = plat(PRETURI.COMUTATOR.insigna)
        const { html } = caz.editie(strecurat)
        expect(scapari(html, dict)).toContain(strecurat)
        expect(html).toMatch(/\bRON\b/)
      })
    })
  }
})

// ---------------------------------------------------------------------------------------------
// Sursa vederilor: nicio valoare din continut, niciun sir RO, acelasi context "inapoi"
// ---------------------------------------------------------------------------------------------

const VEDERI = [
  'LumeaPreturiVedere',
  'ButonInapoiVedere',
  'PacheteVedere',
  'CalculatorVedere',
  'ComutatorPerioadaVedere',
  'GrilaPlanuriVedere',
  'ListaPdfVedere',
  'PliuriVedere',
  'BirouInteractivVedere',
].map((n) => 'src/components/preturi/' + n + '.tsx')
const FARA_CONTINUT = [...VEDERI, 'src/components/preturi/contextLume.ts', 'src/components/preturi/calcul.ts']

/** Importurile de VALORI dintr-un modul de continut (cele `import type` nu ajung in pachet). */
function importuriDeContinut(sursa: string): string[] {
  return [...sursa.matchAll(/^import\s+(?!type\s)[^;]*?from\s+"(@\/content\/[^"]+)"/gm)].map((m) => m[1])
}

/** Sursa fara comentarii: sirurile ramase sunt cod, nu proza. */
function faraComentarii(sursa: string): string {
  return sursa.replace(/\{\s*\/\*[\s\S]*?\*\/\s*\}/g, '').replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '')
}

describe('sursa vederilor de pret', async () => {
  const dict = await construiesteDictionar()

  it('nicio vedere (si nici contextul, nici formula) nu importa o valoare din src/content', () => {
    const gasite = FARA_CONTINUT.flatMap((f) => importuriDeContinut(readFileSync(f, 'utf8')).map((m) => f + ' -> ' + m))
    expect(gasite).toEqual([])
  })

  it('martor: un import de valoare din continut, intr-o copie a unei vederi, e prins', () => {
    const copie = readFileSync(VEDERI[0], 'utf8').replace(/^import type \{ CardPoarta \} from "@\/content\/preturi";$/m, 'import { type CardPoarta, POARTA_BAZA } from "@/content/preturi";')
    expect(copie, 'mutatia a aterizat').toContain('POARTA_BAZA')
    expect(importuriDeContinut(copie)).toEqual(['@/content/preturi'])
  })

  it('nicio vedere nu poarta in cod un sir din dictionarul RO', () => {
    const gasite = VEDERI.flatMap((f) => {
      const cod = plat(faraComentarii(readFileSync(f, 'utf8')))
      return dict.filter((d) => cod.includes(d)).map((d) => f + ': ' + d)
    })
    expect(gasite).toEqual([])
  })

  it('martor: un text RO scris direct intr-o copie a unei vederi e prins', () => {
    const rand = plat(RANDURI_RO[2].text)
    const copie = plat(faraComentarii(readFileSync(VEDERI[2], 'utf8'))) + '\n<span>' + rand + '</span>'
    expect(dict.filter((d) => copie.includes(d))).toContain(rand)
  })

  it('lumea si butonul "inapoi" folosesc acelasi context, din modulul fara continut', () => {
    const lume = readFileSync('src/components/preturi/LumeaPreturiVedere.tsx', 'utf8')
    const buton = readFileSync('src/components/preturi/ButonInapoiVedere.tsx', 'utf8')
    expect(lume).toMatch(/import \{[^}]*\bContextLume\b[^}]*\} from "\.\/contextLume";/)
    expect(buton).toMatch(/import \{ useInapoi \} from "\.\/contextLume";/)
    for (const f of FARA_CONTINUT.concat('src/components/preturi/LumeaPreturi.tsx')) {
      if (f.endsWith('contextLume.ts')) continue
      expect(readFileSync(f, 'utf8'), f + ' isi face propriul context').not.toMatch(/createContext\(/)
    }
  })
})

// ---------------------------------------------------------------------------------------------
// Invelitorile RO = vederea cu continutul RO; formatul cifrelor
// ---------------------------------------------------------------------------------------------

describe('invelitorile RO randeaza exact ce randeaza vederea cu continutul RO', () => {
  it('GrilaPlanuri = vederea cu GRILA, PLANURI si randuriPlan', async () => {
    const { default: GrilaPlanuri } = await import('../src/components/preturi/GrilaPlanuri')
    const a = render(GrilaPlanuri, { perioada: 'anual' })
    const b = render(GrilaPlanuriVedere, { perioada: 'anual', continut: PRETURI.GRILA, planuri: PRETURI.PLANURI, randuri: PRETURI.randuriPlan })
    expect(a).toBe(b)
    expect(a).toContain(PRETURI.GRILA.recomandat)
  })

  it('insigna "recomandat" sta pe Starter, singura (cardul recomandat din datele RO)', async () => {
    const { default: GrilaPlanuri } = await import('../src/components/preturi/GrilaPlanuri')
    const html = render(GrilaPlanuri, { perioada: 'lunar' })
    const eticheta = '>' + PRETURI.GRILA.recomandat + '<'
    expect(html.split(eticheta).length - 1).toBe(1)
    const starter = PRETURI.PLANURI.find((p) => p.cheie === 'starter')
    expect(starter?.recomandat).toBe(true)
    // Eticheta vine imediat dupa numele planului recomandat, in acelasi rand.
    expect(html).toMatch(new RegExp('>' + starter?.nume + '</h3><span[^>]*' + eticheta))
  })

  it('ComutatorPerioada = vederea cu COMUTATOR', async () => {
    const { default: ComutatorPerioada } = await import('../src/components/preturi/ComutatorPerioada')
    const p: { perioada: Perioada; laSchimbare: () => void } = { perioada: 'anual', laSchimbare: () => undefined }
    expect(render(ComutatorPerioada, p)).toBe(render(ComutatorPerioadaVedere, { ...p, continut: PRETURI.COMUTATOR }))
  })

  it('LiniaDeBaza fara proprietati = cu LINIA_DE_BAZA si butonul RO in slot', async () => {
    const { default: ButonInapoi } = await import('../src/components/preturi/ButonInapoi')
    expect(render(LiniaDeBaza)).toBe(render(LiniaDeBaza, { continut: PRETURI.LINIA_DE_BAZA, inapoi: createElement(ButonInapoi) }))
    expect(render(LiniaDeBaza)).toContain(PRETURI.LINIA_DE_BAZA.inapoi)
  })

  it('PacheteVedere randeaza piesele primite, in ordine, in sectiunea cu ancora si eticheta primite', () => {
    const piesa = (nume: string) => {
      const Piesa = () => createElement('i', null, nume)
      Piesa.displayName = 'Piesa-' + nume
      return Piesa
    }
    const html = render(PacheteVedere, {
      gazda: 'exemplu.invalid',
      analitica: false,
      ancora: 'packages',
      eticheta: 'Qx sectiune',
      piese: { Calculator: piesa('c'), Comutator: piesa('m'), Grila: piesa('g'), ListaPdf: piesa('l') },
    })
    expect(html).toContain('id="packages"')
    expect(html).toContain('aria-label="Qx sectiune"')
    expect(html).toMatch(/<i>c<\/i><i>m<\/i><i>g<\/i><i>l<\/i>/)
  })

  it('TabelPlanuri ia antetul si latimea randului de categorie din `planuri`, nu din PLANURI RO', () => {
    // Doua planuri (RO are trei), cu nume sintetice: un antet citit din constanta RO sau un colSpan
    // calculat din ea se vad aici, fiindca numele si numarul difera de datele RO.
    const { t } = fabrica()
    const planuri = planuriSintetice(t).slice(0, 2)
    expect(planuri.length).not.toBe(PRETURI.PLANURI.length)
    const continut: ContinutTabelPlanuri = {
      functie: t('functie'),
      inclus: t('inclus'),
      derulare: t('derulare'),
      categorii: [{ titlu: t('categorie'), randuri: [{ functie: t('rand'), celule: { starter: { fel: 'da' }, pro: { fel: 'da' }, business: { fel: 'da' } } }] }],
    }
    const html = render(TabelPlanuri, { continut, planuri })
    const antet = html.match(/<thead>([\s\S]*?)<\/thead>/)?.[1] ?? ''
    const coloane = [...antet.matchAll(/<th[^>]*scope="col"[^>]*>([^<]*)<\/th>/g)].map((m) => plat(decodeaza(m[1])))
    expect(coloane, 'coloanele antetului').toEqual([continut.functie, ...planuri.map((p) => p.nume)])
    for (const p of PRETURI.PLANURI) expect(antet, 'numele RO ' + p.nume + ' in antet').not.toContain('>' + p.nume + '<')
    expect(html).toMatch(/colspan="3"/i)
    expect(html).not.toMatch(/colspan="[^3]"/i)
  })

  it('FaqPreturi pune ancora primita pe sectiune, nu ancora RO', () => {
    const { t } = fabrica()
    const continut = { titlu: t('titlu'), subtitlu: t('subtitlu'), intrebari: [{ intrebare: t('intrebare'), raspuns: t('raspuns') }] }
    const html = render(FaqPreturi, { continut, ancora: 'pricing-questions' })
    expect(html).toContain('id="pricing-questions"')
    expect(html).not.toContain('id="' + PRETURI.ANCORE_PRETURI.intrebari + '"')
    // Controlul implicitului: fara ancora, sectiunea poarta ancora RO.
    expect(render(FaqPreturi, { continut })).toContain('id="' + PRETURI.ANCORE_PRETURI.intrebari + '"')
  })

  it('formatul cifrelor: implicitul romanesc neschimbat, separatorii ca parametru', () => {
    expect(formatBani(156200)).toBe('156.200')
    expect(formatBani(156200, ',')).toBe('156,200')
    expect(formatZecimal(1.64)).toBe('1,6')
    expect(formatZecimal(1.64, '.')).toBe('1.6')
    expect(FORMAT_ROMANESC.bani(3850)).toBe('3.850')
    expect(FORMAT_ROMANESC.zecimal(0)).toBe('0')
  })
})
