import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import Pliuri from '../src/components/preturi/Pliuri'
import { PacheteEn, PliuriEn } from '../src/components/preturi/PreturiEn'
import TabelPlanuri from '../src/components/preturi/TabelPlanuri'
import * as enterpriseEn from '../src/content/en/enterprise-componente'
import * as pretEn from '../src/content/en/pricing-componente'
import {
  CONECTARE,
  CONTURI_MINIME_ENTERPRISE,
  LIMITE_PLANURI,
  ORDINE_PLANURI,
  SUPLIMENTE,
  VALABILITATE_SUPLIMENT_ZILE,
  type LimitePlan,
} from '../src/content/limite-planuri'

/**
 * Limitele pe plan (felia 127, deciziile 66-68 ale owner-ului, 05.10.2026). Proba masoara pe SURSA si pe randarea
 * statica a pieselor:
 *  1. modulul de date are exact tabelul final al deciziei (descarcarile si coloana Enterprise incluse, Starter la
 *     80 de raspunsuri), cu limitele crescatoare de la un plan la urmatorul;
 *  2. cardurile /pricing arata limitele fiecarui plan, in formatul american si cu unitatile decise, iar tabelul
 *     comparativ are randurile de limita si taxa de conectare;
 *  3. al treilea pliu (suplimentele, conectarea, intrebarile despre limite) exista pe EN si NU pe RO, fara nicio
 *     legatura (numarul legaturilor WhatsApp din <main> ramane cel al perechii RO);
 *  4. /enterprise numeste limitele de baza;
 *  5. textul nou nu spune "processing" / documente procesate, nu numeste costuri sau marje, pune pilotul la 14 zile
 *     si nu mai spune ca planurile difera "numai" prin conturi;
 *  6. registrul `en-limite.json` poarta aceleasi cifre ca modulul.
 * Paginile servite le masoara `tests/browser/limite-pe-plan.spec.ts`, pe copia 3s.md.
 *
 * Fixturile cuvintelor interzise se asambleaza la rulare, din bucati.
 */

const RADACINA = join(__dirname, '..')

/** Tabelul final al deciziei, scris aici a doua oara: proba compara doua surse, nu modulul cu el insusi. */
const TABEL_FINAL: Record<string, LimitePlan> = {
  starter: { conturi: 5, stocareGb: 100, raspunsuriAiPeLuna: 80, paginiOcrPeLuna: 1000, descarcariGbPeLuna: 15 },
  pro: { conturi: 10, stocareGb: 200, raspunsuriAiPeLuna: 200, paginiOcrPeLuna: 2500, descarcariGbPeLuna: 30 },
  business: { conturi: 20, stocareGb: 400, raspunsuriAiPeLuna: 400, paginiOcrPeLuna: 5000, descarcariGbPeLuna: 60 },
  enterprise: { conturi: 60, stocareGb: 500, raspunsuriAiPeLuna: 600, paginiOcrPeLuna: 20000, descarcariGbPeLuna: 200 },
}

const SUPLIMENTE_FINALE = [
  ['raspunsuriAi', 25, 22, 'o-data'],
  ['raspunsuriAi', 100, 79, 'o-data'],
  ['stocare', 25, 9, 'lunar'],
  ['stocare', 100, 29, 'lunar'],
  ['stocare', 500, 139, 'lunar'],
  ['paginiOcr', 1000, 6, 'o-data'],
  ['paginiOcr', 5000, 24, 'o-data'],
  ['descarcari', 50, 12, 'o-data'],
]

/** Planurile cu limitele strict crescatoare pe fiecare resursa; intoarce incalcarile. */
function necrescatoare(limite: Record<string, LimitePlan>): string[] {
  const rele: string[] = []
  for (let i = 1; i < ORDINE_PLANURI.length; i++) {
    const a = limite[ORDINE_PLANURI[i - 1]]
    const b = limite[ORDINE_PLANURI[i]]
    for (const k of Object.keys(a) as (keyof LimitePlan)[]) if (!(b[k] > a[k])) rele.push(ORDINE_PLANURI[i] + '.' + k)
  }
  return rele
}

/** Toate sirurile dintr-o valoare (frunzele de tip sir, recursiv). */
function siruri(valoare: unknown, acc: string[] = []): string[] {
  if (typeof valoare === 'string') acc.push(valoare)
  else if (Array.isArray(valoare)) for (const v of valoare) siruri(v, acc)
  else if (valoare && typeof valoare === 'object') for (const v of Object.values(valoare)) siruri(v, acc)
  return acc
}

/** Textul nou al feliei: cardurile, tabelul, pliul suplimentelor, lista Enterprise si textele schimbate ale poartei. */
function textNou(): string {
  return [
    ...pretEn.PLANURI_EN.flatMap((p) => siruri(pretEn.randuriPlanEn(p))),
    ...siruri(pretEn.TABEL_EN),
    ...siruri(pretEn.SUPLIMENTE_EN),
    ...siruri(enterpriseEn.LIVRABILE_EN),
    pretEn.POARTA_BAZA_EN.text,
    pretEn.LINIA_DE_BAZA_EN.paragraf,
    pretEn.PLIURI_EN.birou.paragraf,
  ].join('\n')
}

const INTERZISE: { motiv: string; tipar: RegExp }[] = [
  { motiv: 'procesare (decizia 66)', tipar: new RegExp('\\bproc' + 'ess(ing|ed|es)?\\b', 'i') },
  { motiv: 'costuri interne sau marje', tipar: new RegExp('(\\bU' + 'SD\\b|\\bmarg' + 'in|\\bour co' + 'st|\\bmar' + 'ja)', 'i') },
  { motiv: 'planurile difera numai prin conturi (contrazis de limite)', tipar: new RegExp('differ only|only in the number of user acc' + 'ounts', 'i') },
  { motiv: 'legatura de canal in pliu', tipar: new RegExp('wa\\.' + 'me') },
]

function incalcari(text: string): string[] {
  return INTERZISE.filter((i) => i.tipar.test(text)).map((i) => i.motiv)
}

/**
 * Pilotul de 30 de zile (decizia 65), numai in textul SCRIS de felie (pliul suplimentelor): randul "Free 30-day pilot"
 * din tabel si elementul de pilot din lista Enterprise sunt text aprobat, pe care il schimba felia pilotului (126).
 */
const PILOT_30 = new RegExp('\\b3' + '0-day pilot|pilot[^.]{0,40}\\b3' + '0 days', 'i')

describe('modulul de date (deciziile 66-68)', () => {
  it('limitele sunt tabelul final, cu cotele crescatoare; martorul: o copie stricata e prinsa', () => {
    expect(LIMITE_PLANURI).toEqual(TABEL_FINAL)
    expect(necrescatoare(LIMITE_PLANURI)).toEqual([])
    const stricat = { ...TABEL_FINAL, enterprise: { ...TABEL_FINAL.enterprise, stocareGb: 400 } }
    expect(necrescatoare(stricat)).toEqual(['enterprise.stocareGb'])
    expect(CONTURI_MINIME_ENTERPRISE).toBe(21)
  })

  it('suplimentele: preturile si facturarea deciziei; conectarea 6 EUR la 1.000 de pagini; valabilitatea 90 de zile', () => {
    expect(SUPLIMENTE.map((s) => [s.resursa, s.cantitate, s.pretEur, s.facturare])).toEqual(SUPLIMENTE_FINALE)
    expect(CONECTARE).toEqual({ eur: 6, pagini: 1000 })
    expect(VALABILITATE_SUPLIMENT_ZILE).toBe(90)
    // Fara procesare de documente si fara text suplimentar (decizia 66): resursele sunt numai cele patru.
    expect([...new Set(SUPLIMENTE.map((s) => s.resursa))].sort()).toEqual(['descarcari', 'paginiOcr', 'raspunsuriAi', 'stocare'])
  })
})

describe('/pricing: cardurile, tabelul si pliul suplimentelor', () => {
  it('formatul american al cifrelor (martorul: sub o mie nu apare virgula)', () => {
    expect(pretEn.miiEn(1000)).toBe('1,000')
    expect(pretEn.miiEn(20000)).toBe('20,000')
    expect(pretEn.miiEn(999)).toBe('999')
    // Felia 143, runda 2: suma ramane lipita de EUR pe ecran (spatiu nedespartitor), ca pe editia ro-MD.
    expect(pretEn.CONECTARE_EN).toBe('EUR\u00a06 per 1,000 pages imported, once')
  })

  it('fiecare card arata conturile si cele patru limite ale planului, cu unitatile decise, pe randurile 1-5', () => {
    for (const p of pretEn.PLANURI_EN) {
      const l = LIMITE_PLANURI[p.cheie]
      const randuri = pretEn.randuriPlanEn(p).slice(0, 5).map((r) => (r.cifra ?? '') + ' ' + r.text)
      expect(randuri, p.cheie).toEqual([
        l.conturi + ' user accounts',
        pretEn.miiEn(l.stocareGb) + ' GB of storage',
        pretEn.miiEn(l.raspunsuriAiPeLuna) + ' AI answers a month',
        pretEn.miiEn(l.paginiOcrPeLuna) + ' OCR pages a month',
        pretEn.miiEn(l.descarcariGbPeLuna) + ' GB of downloads a month',
      ])
      // Conturile cardului sunt cele ale planului de pret: aceeasi cifra din doua surse.
      expect(p.conturi, p.cheie).toBe(l.conturi)
    }
  })

  it('randarea statica a grilei: Starter cu 80 de raspunsuri si 15 GB de descarcari, Business cu 5,000 de pagini OCR', () => {
    const html = renderToStaticMarkup(createElement(PacheteEn, { gazda: '3s.md', analitica: false, whatsapp: 'https://wa.me/1?text=x' }))
    for (const t of ['<strong>80</strong> AI answers a month', '<strong>15</strong> GB of downloads a month', '<strong>5,000</strong> OCR pages a month']) {
      expect(html, t).toContain(t)
    }
  })

  it('tabelul comparativ are randurile de limita si taxa de conectare, cu cifrele modulului', () => {
    const tabel = renderToStaticMarkup(createElement(TabelPlanuri, { continut: pretEn.TABEL_EN, planuri: pretEn.PLANURI_EN }))
    const randuri = pretEn.TABEL_EN.categorii.flatMap((c) => c.randuri)
    const rand = (f: string) => randuri.find((r) => r.functie === f)
    const valori = (f: string) => ['starter', 'pro', 'business'].map((k) => {
      const c = rand(f)?.celule[k as 'starter']
      return c?.fel === 'valoare' ? c.text : null
    })
    expect(valori('Storage')).toEqual(['100 GB', '200 GB', '400 GB'])
    expect(valori('AI answers a month')).toEqual(['80', '200', '400'])
    expect(valori('OCR pages a month')).toEqual(['1,000', '2,500', '5,000'])
    expect(valori('Downloads a month')).toEqual(['15 GB', '30 GB', '60 GB'])
    // Felia 143, runda 2: suma ramane lipita de EUR pe ecran (spatiu nedespartitor), ca pe editia ro-MD.
    expect(valori('One-time connection, per 1,000 pages')).toEqual(['EUR\u00a06', 'EUR\u00a06', 'EUR\u00a06'])
    for (const t of ['>100 GB<', '>2,500<', '>60 GB<', '>One-time connection, per 1,000 pages<', '>EUR\u00a06<']) expect(tabel, t).toContain(t)
  })

  it('randul pilotului ramane pe locul lui, intre conturi si taxa pe utilizator (felia pilotului il schimba pe loc)', () => {
    // Mutat in alta categorie, randul ar iesi din blocul de conflict cu schimbarea pilotului si vechiul text ar
    // supravietui oricarei rezolvari la pliere. Se masoara vecinii, nu textul (pe care il schimba felia pilotului).
    const vecini = (categorii: { randuri: { functie: string }[] }[]) => {
      for (const c of categorii) {
        const i = c.randuri.findIndex((r) => /day pilot$/.test(r.functie))
        if (i >= 0) return [c.randuri[i - 1]?.functie, c.randuri[i + 1]?.functie]
      }
      return null
    }
    expect(vecini(pretEn.TABEL_EN.categorii)).toEqual(['User accounts', 'Per-user fee'])
    // Martorul: pilotul mutat la inceputul ultimei categorii e prins.
    const mutat: { randuri: { functie: string }[] }[] = pretEn.TABEL_EN.categorii.map((c) => ({
      randuri: c.randuri.filter((r) => !/day pilot$/.test(r.functie)),
    }))
    mutat[3].randuri.unshift({ functie: 'Free 14-day pilot' })
    expect(vecini(mutat)).not.toEqual(['User accounts', 'Per-user fee'])
  })

  it('al treilea pliu pe EN: 8 suplimente, "valid 90 days" pe cele 5 platite o data, conectarea si 4 intrebari; zero legaturi', () => {
    const en = renderToStaticMarkup(createElement(PliuriEn, { tabel: null }))
    expect(en.match(/<details/g) ?? []).toHaveLength(3)
    expect(en).toContain('data-pliu-suplimente')
    const pliu = en.slice(en.indexOf('data-pliu-suplimente'))
    expect(pliu.match(/<th scope="row"/g) ?? []).toHaveLength(SUPLIMENTE.length)
    expect(pliu.match(/Once, valid 90 days/g) ?? []).toHaveLength(SUPLIMENTE.filter((s) => s.facturare === 'o-data').length)
    expect(pliu.match(/Every month/g) ?? []).toHaveLength(3)
    // Felia 143, runda 2: suma ramane lipita de EUR pe ecran (spatiu nedespartitor), ca pe editia ro-MD.
    for (const t of ['>EUR\u00a022<', '>EUR\u00a079<', '>EUR\u00a0139<', '>EUR\u00a024<', '>EUR\u00a012<', 'EUR\u00a06 per 1,000 pages imported, once']) expect(pliu, t).toContain(t)
    expect(pliu.match(/<h3/g) ?? []).toHaveLength(4)
    expect(pliu).not.toContain('<a ')
  })

  it('pagina RO ramane cu cele doua pliuri si fara pliul suplimentelor (implicitul vederii)', () => {
    const ro = renderToStaticMarkup(createElement(Pliuri, { tabel: null }))
    expect(ro.match(/<details/g) ?? []).toHaveLength(2)
    expect(ro).not.toContain('data-pliu-suplimente')
    // Controlul: acelasi selector gaseste pliul pe EN (cazul de mai sus), deci absenta aici nu e o cautare oarba.
    expect(renderToStaticMarkup(createElement(PliuriEn, { tabel: null }))).toContain('data-pliu-suplimente')
  })
})

describe('/enterprise: limitele de baza', () => {
  it('lista pentru IT si achizitii numeste conturile 21-60, cele patru limite si conectarea, din modul', () => {
    const text = enterpriseEn.LIVRABILE_EN.elemente.map((e) => e.text).join('\n')
    for (const t of [
      'From 21 to 60 user accounts',
      '500 GB of storage',
      '600 AI answers a month',
      '20,000 OCR pages a month',
      '200 GB of downloads a month',
      // Felia 143, runda 2: suma lipita de EUR (spatiu nedespartitor).
      'EUR\u00a06 per 1,000 pages imported, once',
    ]) {
      expect(text, t).toContain(t)
    }
  })
})

describe('ce nu are voie textul nou', () => {
  it('martorii: fiecare tipar prinde o fraza fabricata, iar textul de contact fara legatura trece', () => {
    const rau = [
      'Includes AI proc' + 'essing.',
      'Our co' + 'st is low.',
      'They differ ' + 'only in accounts.',
      'See https://wa.' + 'me/1.',
    ]
    for (const r of rau) expect(incalcari(r), r).toHaveLength(1)
    expect(incalcari('To order an add-on, message us.')).toEqual([])
    expect(PILOT_30.test('A free 3' + '0-day pilot.')).toBe(true)
    expect(PILOT_30.test('During the free 14-day pilot.')).toBe(false)
  })

  it('zero incalcari in textul nou; pilotul numit in pliu are 14 zile', () => {
    const text = textNou()
    expect(text.length).toBeGreaterThan(1500)
    expect(incalcari(text)).toEqual([])
    const pliu = siruri(pretEn.SUPLIMENTE_EN).join('\n')
    expect(PILOT_30.test(pliu)).toBe(false)
    expect(pliu.match(/free 14-day pilot/g) ?? []).toHaveLength(2)
  })
})

describe('registrul en-limite.json', () => {
  type Intrare = { id: string; text: string; unde: string; stare: string; sursa?: string; confirmat_de?: string }
  const registru = JSON.parse(readFileSync(join(RADACINA, 'src', 'content', 'afirmatii', 'en-limite.json'), 'utf8')) as Intrare[]

  it('id-urile poarta prefixul en-limite-, fiecare `unde` exista pe disc, confirmarile au sursa si autor', () => {
    expect(registru.length).toBe(4)
    for (const i of registru) {
      expect(i.id).toMatch(/^en-limite-[a-z0-9-]+$/)
      for (const f of i.unde.split(',').map((x) => x.trim())) expect(existsSync(join(RADACINA, f)), i.id + ': ' + f).toBe(true)
      if (i.stare === 'confirmat') {
        expect(i.sursa ?? '', i.id).not.toBe('')
        expect(i.confirmat_de ?? '', i.id).not.toBe('')
      }
    }
  })

  it('intrarea limitelor poarta cifrele modulului, in formatul paginii', () => {
    const t = registru.find((i) => i.id === 'en-limite-pe-plan')!.text
    for (const k of ORDINE_PLANURI) {
      const l = LIMITE_PLANURI[k]
      for (const v of [l.stocareGb + ' GB', pretEn.miiEn(l.paginiOcrPeLuna), l.descarcariGbPeLuna + ' GB', String(l.raspunsuriAiPeLuna)]) {
        expect(t, k + ': ' + v).toContain(v)
      }
    }
    const s = registru.find((i) => i.id === 'en-limite-suplimente')!.text
    for (const x of SUPLIMENTE) expect(s, x.resursa + ' ' + x.cantitate).toContain('EUR ' + x.pretEur)
  })
})
