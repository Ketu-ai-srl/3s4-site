import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { PacheteRoMd, PliuriRoMd } from '../src/app/(romd)/ro/_editie/PreturiRoMd'
import TabelPlanuri from '../src/components/preturi/TabelPlanuri'
import { CONECTARE, LIMITE_PLANURI, ORDINE_PLANURI, SUPLIMENTE } from '../src/content/limite-planuri'
import * as enterpriseRoMd from '../src/content/ro-md/enterprise-componente'
import * as pretRoMd from '../src/content/ro-md/preturi-componente'

/**
 * Limitele pe plan pe /ro (felia 129, oglinda probei `limite-pe-plan.test.ts` a feliei 127; deciziile 66-69). Proba
 * masoara pe SURSA si pe randarea statica a pieselor /ro/preturi si /ro/enterprise de pe 3s.md:
 *  1. cardurile arata conturile si cele patru limite ale fiecarui plan, in formatul romanesc (punct la mii) si cu "de"
 *     dupa regula numeralului, cu cifrele din `limite-planuri.ts` (aceleasi ca pe EN: o singura sursa);
 *  2. tabelul comparativ are randurile de limita si taxa de conectare, pastrand 4 categorii si 14 randuri;
 *  3. al treilea pliu (suplimentele, conectarea, intrebarile despre limite) exista pe /ro, fara nicio legatura;
 *  4. /ro/enterprise numeste limitele de baza;
 *  5. textul nou nu spune "procesare" / documente procesate, nu numeste costuri sau marje, nu mai spune ca pachetele
 *     difera "numai" prin conturi, nu foloseste "dumneavoastra" (pe 3s.md, /ro e la "tu"), si pune pilotul la 14 zile;
 *  6. registrul `ro-md-limite.json` poarta aceleasi cifre ca modulul.
 * Paginile servite le masoara `tests/browser/limite-ro-md.spec.ts`, pe copia 3s.md.
 *
 * Fixturile cuvintelor interzise se asambleaza la rulare, din bucati.
 */

const RADACINA = join(__dirname, '..')

/** Formatul romanesc al unei cifre, scris a doua oara aici: proba compara doua surse, nu modulul cu el insusi. */
const mii = (n: number) => n.toLocaleString('de-DE')

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
    ...pretRoMd.PLANURI_RO_MD.flatMap((p) => siruri(pretRoMd.randuriPlanRoMd(p))),
    ...siruri(pretRoMd.TABEL_RO_MD),
    ...siruri(pretRoMd.SUPLIMENTE_RO_MD),
    ...siruri(enterpriseRoMd.LIVRABILE_RO_MD),
    pretRoMd.POARTA_BAZA_RO_MD.text,
    pretRoMd.LINIA_DE_BAZA_RO_MD.paragraf,
    pretRoMd.PLIURI_RO_MD.birou.paragraf,
  ].join('\n')
}

const INTERZISE: { motiv: string; tipar: RegExp }[] = [
  { motiv: 'procesare (decizia 66)', tipar: new RegExp('\\bproces' + '(are|ar|at|ate|ează|ăm)\\w*', 'iu') },
  { motiv: 'costuri interne sau marje', tipar: new RegExp('(\\bU' + 'SD\\b|\\bmarj' + '|costul nos' + 'tru|costurile noas' + 'tre)', 'iu') },
  { motiv: 'pachetele difera numai prin conturi (contrazis de limite)', tipar: new RegExp('(numai|doar) prin num' + 'ărul de conturi', 'iu') },
  { motiv: 'legatura de canal in pliu', tipar: new RegExp('wa\\.' + 'me') },
  { motiv: 'registrul "dumneavoastra" (decizia 35: /ro pe 3s.md e la "tu")', tipar: new RegExp('dumnea' + 'voastr', 'iu') },
]

function incalcari(text: string): string[] {
  return INTERZISE.filter((i) => i.tipar.test(text)).map((i) => i.motiv)
}

const PILOT_30 = new RegExp('pilot[^.\\n]{0,40}\\b3' + '0 de zile|3' + '0 de zile[^.\\n]{0,20}gratuit', 'iu')

describe('/ro/preturi: cardurile, tabelul si pliul suplimentelor', () => {
  it('formatul romanesc al cifrelor (martorul: sub o mie nu apare punctul) si taxa de conectare', () => {
    expect(pretRoMd.miiRoMd(1000)).toBe('1.000')
    expect(pretRoMd.miiRoMd(20000)).toBe('20.000')
    expect(pretRoMd.miiRoMd(999)).toBe('999')
    // Felia 143: suma si moneda sunt legate prin spatiu nedespartitor (si "la" de numarul de pagini pe RO), ca taxa sa nu
    // se rupa la capat de rand pe /enterprise; textul e acelasi.
    expect(pretRoMd.CONECTARE_RO_MD).toBe('6\u00a0EUR la\u00a01.000 de pagini importate, o singură dată')
  })

  it('fiecare card arata conturile si cele patru limite ale planului, din modul, pe randurile 1-5; iconita ramane pe al saselea', () => {
    for (const p of pretRoMd.PLANURI_RO_MD) {
      const l = LIMITE_PLANURI[p.cheie]
      const randuri = pretRoMd.randuriPlanRoMd(p)
      expect(randuri, p.cheie).toHaveLength(9)
      const de = (n: number) => (n >= 20 ? 'de ' : '')
      expect(randuri.slice(0, 5).map((r) => (r.cifra ?? '') + ' ' + r.text), p.cheie).toEqual([
        l.conturi + ' ' + de(l.conturi) + 'conturi pentru echipă',
        mii(l.stocareGb) + ' GB de stocare',
        mii(l.raspunsuriAiPeLuna) + ' ' + de(l.raspunsuriAiPeLuna) + 'răspunsuri AI pe lună',
        mii(l.paginiOcrPeLuna) + ' ' + de(l.paginiOcrPeLuna) + 'pagini OCR pe lună',
        mii(l.descarcariGbPeLuna) + ' GB de descărcări pe lună',
      ])
      expect(p.conturi, p.cheie).toBe(l.conturi)
      expect(randuri.map((r) => r.explicatie !== null)).toEqual([false, false, false, false, false, true, false, false, false])
    }
    // Martorul regulii numeralului: Pro (10 conturi) fara "de", Starter cu "80 de".
    expect(pretRoMd.randuriPlanRoMd(pretRoMd.PLANURI_RO_MD[1])[0].text).toBe('conturi pentru echipă')
    expect(pretRoMd.randuriPlanRoMd(pretRoMd.PLANURI_RO_MD[0])[2].text).toBe('de răspunsuri AI pe lună')
  })

  it('randarea statica a grilei: Starter cu 80 de raspunsuri si 15 GB de descarcari, Business cu 5.000 de pagini OCR', () => {
    const html = renderToStaticMarkup(createElement(PacheteRoMd, { gazda: '3s.md', analitica: false, whatsapp: 'https://wa.me/1?text=x' }))
    for (const t of ['<strong>80</strong> de răspunsuri AI pe lună', '<strong>15</strong> GB de descărcări pe lună', '<strong>5.000</strong> de pagini OCR pe lună']) {
      expect(html, t).toContain(t)
    }
  })

  it('tabelul comparativ: 4 categorii si 14 randuri, randurile de limita si taxa de conectare, cu cifrele modulului', () => {
    expect(pretRoMd.TABEL_RO_MD.categorii).toHaveLength(4)
    const randuri = pretRoMd.TABEL_RO_MD.categorii.flatMap((c) => c.randuri)
    expect(randuri).toHaveLength(14)
    const valori = (f: string) =>
      ['starter', 'pro', 'business'].map((k) => {
        const c = randuri.find((r) => r.functie === f)?.celule[k as 'starter']
        return c?.fel === 'valoare' ? c.text : null
      })
    expect(valori('Stocare')).toEqual(['100 GB', '200 GB', '400 GB'])
    expect(valori('Răspunsuri AI pe lună')).toEqual(['80', '200', '400'])
    expect(valori('Pagini OCR pe lună')).toEqual(['1.000', '2.500', '5.000'])
    expect(valori('Descărcări pe lună')).toEqual(['15 GB', '30 GB', '60 GB'])
    // Felia 143: suma e legata de moneda prin spatiu nedespartitor (la 390 celula se rupea intre "6" si "EUR").
    expect(valori('Taxă de conectare, la 1.000 de pagini (o singură dată)')).toEqual(['6\u00a0EUR', '6\u00a0EUR', '6\u00a0EUR'])
    const tabel = renderToStaticMarkup(createElement(TabelPlanuri, { continut: pretRoMd.TABEL_RO_MD, planuri: pretRoMd.PLANURI_RO_MD }))
    for (const t of ['>100 GB<', '>2.500<', '>60 GB<', '>Taxă de conectare, la 1.000 de pagini (o singură dată)<', '>6\u00a0EUR<']) expect(tabel, t).toContain(t)
  })

  it('randul pilotului sta intre conturi si costul pe persoana, ca pe EN, si numeste 14 zile', () => {
    const cat = pretRoMd.TABEL_RO_MD.categorii.find((c) => c.randuri.some((r) => /^Pilot gratuit/.test(r.functie)))!
    const i = cat.randuri.findIndex((r) => /^Pilot gratuit/.test(r.functie))
    expect([cat.randuri[i - 1].functie, cat.randuri[i].functie, cat.randuri[i + 1].functie]).toEqual([
      'Conturi pentru echipă',
      'Pilot gratuit de 14 zile',
      'Cost pe persoană',
    ])
  })

  it('al treilea pliu pe /ro: 8 suplimente, "valabile 90 de zile" pe cele 5 platite o data, conectarea si 4 intrebari; zero legaturi', () => {
    const ro = renderToStaticMarkup(createElement(PliuriRoMd, { tabel: null }))
    expect(ro.match(/<details/g) ?? []).toHaveLength(3)
    expect(ro).toContain('data-pliu-suplimente')
    const pliu = ro.slice(ro.indexOf('data-pliu-suplimente'))
    expect(pliu.match(/<th scope="row"/g) ?? []).toHaveLength(SUPLIMENTE.length)
    expect(pliu.match(/O singură dată, valabile 90 de zile/g) ?? []).toHaveLength(SUPLIMENTE.filter((s) => s.facturare === 'o-data').length)
    expect(pliu.match(/În fiecare lună/g) ?? []).toHaveLength(SUPLIMENTE.filter((s) => s.facturare === 'lunar').length)
    for (const s of SUPLIMENTE) expect(pliu, s.resursa + ' ' + s.cantitate).toContain('>' + mii(s.pretEur) + '\u00a0EUR<') // felia 143: spatiu nedespartitor
    expect(pliu).toContain('Conectare: 6\u00a0EUR la\u00a01.000 de pagini importate, o singură dată')
    expect(pliu.match(/<h3/g) ?? []).toHaveLength(4)
    expect(pliu).not.toContain('<a ')
  })
})

describe('/ro/enterprise: limitele de baza', () => {
  it('lista pentru IT si achizitii numeste conturile 21-60, cele patru limite si conectarea, din modul', () => {
    const text = enterpriseRoMd.LIVRABILE_RO_MD.elemente.map((e) => e.text).join('\n')
    expect(enterpriseRoMd.LIVRABILE_RO_MD.elemente).toHaveLength(6)
    const e = LIMITE_PLANURI.enterprise
    for (const t of [
      'De la 21 la ' + e.conturi + ' de conturi de utilizator',
      e.stocareGb + ' GB de stocare',
      e.raspunsuriAiPeLuna + ' de răspunsuri AI pe lună',
      mii(e.paginiOcrPeLuna) + ' de pagini OCR pe lună',
      e.descarcariGbPeLuna + ' GB de descărcări pe lună',
      CONECTARE.eur + '\u00a0EUR la\u00a0' + mii(CONECTARE.pagini) + ' de pagini importate, o singură dată',
    ]) {
      expect(text, t).toContain(t)
    }
  })
})

describe('ce nu are voie textul nou', () => {
  it('martorii: fiecare tipar prinde o fraza fabricata, iar textul corect trece', () => {
    const rau = [
      'Include ' + 'procesare AI.',
      'Documente ' + 'procesate pe lună.',
      'Costul nos' + 'tru este mic.',
      'Pachetele diferă numai prin num' + 'ărul de conturi.',
      'Vezi https://wa.' + 'me/1.',
      'Vă rugăm, dumnea' + 'voastră, să ne scrieți.',
    ]
    for (const r of rau) expect(incalcari(r), r).toHaveLength(1)
    expect(incalcari('Ca să comanzi un supliment, scrie-ne. Pachetele diferă prin numărul de conturi și prin limitele lunare.')).toEqual([])
    expect(PILOT_30.test('Un pilot gratuit de 3' + '0 de zile.')).toBe(true)
    expect(PILOT_30.test('În pilotul gratuit de 14 zile.')).toBe(false)
  })

  it('zero incalcari in textul nou; pilotul numit in pliu are 14 zile', () => {
    const text = textNou()
    expect(text.length).toBeGreaterThan(1500)
    expect(incalcari(text)).toEqual([])
    const pliu = siruri(pretRoMd.SUPLIMENTE_RO_MD).join('\n')
    expect(PILOT_30.test(pliu)).toBe(false)
    expect(pliu.match(/pilotul gratuit de 14 zile/g) ?? []).toHaveLength(2)
  })

  it('aceleasi cifre ca pe EN: fiecare limita a fiecarui plan apare in textul /ro (o singura sursa, doua editii)', () => {
    const text = textNou()
    for (const k of ORDINE_PLANURI) {
      const l = LIMITE_PLANURI[k]
      for (const v of [l.stocareGb, l.raspunsuriAiPeLuna, l.paginiOcrPeLuna, l.descarcariGbPeLuna]) expect(text, k + ': ' + v).toContain(mii(v))
    }
  })
})

describe('registrul ro-md-limite.json', () => {
  type Intrare = { id: string; text: string; unde: string; stare: string; sursa?: string; confirmat_de?: string }
  const registru = JSON.parse(readFileSync(join(RADACINA, 'src', 'content', 'afirmatii', 'ro-md-limite.json'), 'utf8')) as Intrare[]
  const en = JSON.parse(readFileSync(join(RADACINA, 'src', 'content', 'afirmatii', 'en-limite.json'), 'utf8')) as Intrare[]

  it('oglinda registrului EN: aceleasi intrari si aceleasi stari; fiecare `unde` exista pe disc; confirmarile au sursa si autor', () => {
    expect(registru.map((i) => [i.id.replace(/^ro-md-/, ''), i.stare])).toEqual(en.map((i) => [i.id.replace(/^en-/, ''), i.stare]))
    for (const i of registru) {
      expect(i.id).toMatch(/^ro-md-limite-[a-z0-9-]+$/)
      for (const f of i.unde.split(',').map((x) => x.trim())) expect(existsSync(join(RADACINA, f)), i.id + ': ' + f).toBe(true)
      if (i.stare === 'confirmat') {
        expect(i.sursa ?? '', i.id).not.toBe('')
        expect(i.confirmat_de ?? '', i.id).not.toBe('')
      }
    }
  })

  it('intrarea limitelor si a suplimentelor poarta cifrele modulului, in formatul paginii', () => {
    const t = registru.find((i) => i.id === 'ro-md-limite-pe-plan')!.text
    for (const k of ORDINE_PLANURI) {
      const l = LIMITE_PLANURI[k]
      for (const v of [l.stocareGb + ' GB', mii(l.paginiOcrPeLuna), l.descarcariGbPeLuna + ' GB', String(l.raspunsuriAiPeLuna)]) {
        expect(t, k + ': ' + v).toContain(v)
      }
    }
    const s = registru.find((i) => i.id === 'ro-md-limite-suplimente')!.text
    for (const x of SUPLIMENTE) expect(s, x.resursa + ' ' + x.cantitate).toContain(x.pretEur + ' EUR')
  })
})
