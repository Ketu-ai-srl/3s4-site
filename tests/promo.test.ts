import { readFileSync } from 'node:fs'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import PaginaPromo from '../src/app/promo/page'
import PaginaScanare from '../src/app/promo/scanare-cu-telefonul/page'
import {
  caractereTastate,
  easeOutCubic,
  fazaSectiune,
  INTARZIERI_RANDURI_S,
  opacitateCopil,
  stareErou,
  stareSectiune,
  valoareContor,
} from '../src/components/promo/miscare-promo'
import { abateriMetadata } from '../src/components/seo/metadata'
import * as PROMO from '../src/content/promo'
import { RUTE } from '../src/content/rute'

/**
 * Probele feliei `promo` care nu cer navigator: formulele de derulare contra punctelor masurate in fisa
 * (promo.md, "Miscarea legata de derulare"), timpii pieselor animate, starea statica a celor doua pagini
 * randate pe server si regulile continutului (metadata, un singur h1, bonul fictiv, cifrele din registru).
 *
 * ASTEPTARILE VIN DIN FISE: 0,88 la intrare, 0,92 si 7 px de estompare la x = 1, 17 px la x = 2, primul
 * ecran la opacitate 0 si scara 0,85 dupa 810 px pe o fereastra de 900 (vh / 2 = 450, deci deja la 450),
 * contorul pe easeOutCubic (318 / 418 / 472 / 495 / 500 masurate pe 500, pornite la ~0,515 s inaintea probei).
 */

const PAGINI = {
  '/promo': renderToStaticMarkup(createElement(PaginaPromo)),
  '/promo/scanare-cu-telefonul': renderToStaticMarkup(createElement(PaginaScanare)),
} as const

const text = (html: string) =>
  html
    .replace(/<script[\s\S]*?<\/script>/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/\s+/g, ' ')

/** Cifra de control a unui cod fiscal romanesc (cheia 753217532, suma x 10 mod 11, 10 devine 0). */
function cifraControlCui(corp: string): number {
  const cheie = '753217532'
  let suma = 0
  for (let i = 0; i < corp.length; i++) {
    suma += Number(corp[corp.length - 1 - i]) * Number(cheie[cheie.length - 1 - i])
  }
  return ((suma * 10) % 11) % 10
}

function cuiValid(cod: string): boolean {
  const cifre = cod.replace(/\D/g, '')
  if (cifre.length < 2 || cifre.length > 10) return false
  return Number(cifre.slice(-1)) === cifraControlCui(cifre.slice(0, -1))
}

const aproape = (a: number, b: number, eps = 1e-6) => expect(Math.abs(a - b)).toBeLessThan(eps)

describe('formulele de derulare (promo.md)', () => {
  it('faza: 0 cand sectiunea incepe la 90% din fereastra, 1 cand incepe la 10%', () => {
    expect(fazaSectiune(810, 900)).toBe(0)
    aproape(fazaSectiune(90, 900), 1)
    aproape(fazaSectiune(450, 900), 0.5)
    // sub fereastra, taiata la 0; mult deasupra, taiata la 4
    expect(fazaSectiune(2000, 900)).toBe(0)
    expect(fazaSectiune(-10000, 900)).toBe(4)
  })

  it('intrarea: opacitate clamp((e - 1/6) x 1,2), scara 0,88 + 0,12 e, 50 (1 - e) px', () => {
    const z = stareSectiune(0)
    expect(z.opacitate).toBe(0)
    aproape(z.scara, 0.88)
    aproape(z.y, 50)
    const j = stareSectiune(0.5)
    aproape(j.opacitate, (0.5 - 1 / 6) * 1.2)
    aproape(j.scara, 0.94)
    aproape(j.y, 25)
    const v = stareSectiune(1)
    expect(v).toMatchObject({ opacitate: 1, scara: 1, y: 0, blur: 0, cascada: 1 })
  })

  it('la e = 0,875 (ultima sectiune a referintei) interiorul e la ~0,85', () => {
    aproape(stareSectiune(0.875).opacitate, 0.85, 1e-3)
  })

  it('iesirea: scara 0,92, -25 px si 7 px de estompare la x = 1; 17 px la x = 2; opacitate simetrica', () => {
    const x1 = stareSectiune(2)
    aproape(x1.scara, 0.92)
    aproape(x1.y, -25)
    aproape(x1.blur, 7)
    expect(x1.opacitate).toBe(0)
    aproape(stareSectiune(3).blur, 17)
    aproape(stareSectiune(3).scara, 0.92)
    // simetria: la x = 0,5 opacitatea e cea de la e = 0,5
    aproape(stareSectiune(1.5).opacitate, stareSectiune(0.5).opacitate)
    expect(stareSectiune(1.2).blur).toBe(0)
  })

  it('cascada copiilor: pragul creste cu 1/12 pe copil, panta 1,8, pana la al patrulea', () => {
    expect(opacitateCopil(1, 0)).toBe(1)
    expect(opacitateCopil(1, 3)).toBe(1)
    aproape(opacitateCopil(0.5, 0), (0.5 - 1 / 6) * 1.8)
    aproape(opacitateCopil(0.5, 1), (0.5 - 1 / 6 - 1 / 12) * 1.8)
    expect(opacitateCopil(0.5, 7)).toBe(opacitateCopil(0.5, 3))
    expect(opacitateCopil(0.2, 1)).toBe(0)
  })

  it('primul ecran: opacitate 1 - y / 0,5 vh, scara pana la 0,85', () => {
    expect(stareErou(0, 900)).toEqual({ opacitate: 1, scara: 1 })
    const j = stareErou(225, 900)
    aproape(j.opacitate, 0.5)
    aproape(j.scara, 0.925)
    expect(stareErou(810, 900)).toEqual({ opacitate: 0, scara: 0.85 })
  })
})

describe('timpii pieselor animate', () => {
  it('contorul urmeaza easeOutCubic si ajunge exact la valoare in 1,8 s', () => {
    aproape(easeOutCubic(0), 0)
    aproape(easeOutCubic(1), 1)
    // punctele masurate pe 500, cu ~515 ms deja scursi (potrivit pe primul punct) la inceputul probei
    const puncte: [number, number][] = [
      [0, 318],
      [300, 418],
      [600, 472],
      [900, 495],
    ]
    for (const [t, v] of puncte) expect(Math.abs(valoareContor(t + 515, 500) - v)).toBeLessThanOrEqual(3)
    expect(valoareContor(1800, 10)).toBe(10)
    expect(valoareContor(0, 10)).toBe(0)
  })

  it('tastarea: un caracter la ~37 ms, 8 caractere in ~300 ms', () => {
    expect(caractereTastate(0, 30)).toBe(1)
    expect(caractereTastate(296, 30)).toBe(9)
    expect(caractereTastate(100000, 30)).toBe(30)
  })

  it('intarzierile randurilor de date sunt cele din fisa, 8 randuri', () => {
    expect([...INTARZIERI_RANDURI_S]).toEqual([0.69, 0.83, 0.97, 1.11, 1.25, 1.39, 1.5, 1.8])
    expect(PROMO.DATE_CITITE.length + 2).toBe(INTARZIERI_RANDURI_S.length)
  })
})

describe('paginile randate pe server (starea statica)', () => {
  for (const [cale, html] of Object.entries(PAGINI)) {
    it(cale + ': un singur h1, JSON-LD BreadcrumbList, tema inchisa, invelisul cinema', () => {
      expect(html.match(/<h1[\s>]/g)?.length).toBe(1)
      expect(html).toContain('"BreadcrumbList"')
      expect(html).toContain('data-tema-pagina="inchisa"')
      expect(html).toContain('data-invelis="cinema"')
    })

    it(cale + ': nicio sectiune cu stil scris pe server (stare statica, vizibila)', () => {
      const interioare = html.match(/<div[^>]*data-interior-promo[^>]*>/g) ?? []
      expect(interioare.length).toBeGreaterThanOrEqual(7)
      for (const d of interioare) expect(d).not.toMatch(/style=/)
    })

    it(cale + ': butonul CTA duce la crearea contului (sau asteapta ruta, inert)', () => {
      expect(html).toMatch(/href="\/inregistrare"|data-tinta-lipsa="\/inregistrare"/)
    })
  }

  it('/promo: textul intreg al intrebarii si valoarea finala a contorului sunt in HTML-ul servit', () => {
    const t = text(PAGINI['/promo'])
    expect(t).toContain(PROMO.CAUTARE.intrebare)
    for (const c of PROMO.CONTOARE) expect(t).toContain(c.valoare)
  })

  it('/promo/scanare-cu-telefonul: toate cele 8 randuri de date sunt in HTML-ul servit, scena in starea statica', () => {
    const html = PAGINI['/promo/scanare-cu-telefonul']
    const t = text(html)
    for (const r of PROMO.DATE_CITITE) expect(t).toContain(r.valoare)
    expect(t).toContain(PROMO.RAND_QR.cip)
    expect(t).toContain(PROMO.FISIER_BON)
    expect(html).toContain('data-scena="static"')
  })
})

describe('continutul', () => {
  it('metadata in pragurile portii (titlu 15-65, descriere 50-160)', () => {
    expect(abateriMetadata({ ...PROMO.META_PROMO, cale: PROMO.CALE_PROMO })).toEqual([])
    expect(abateriMetadata({ ...PROMO.META_SCANARE, cale: PROMO.CALE_PROMO_SCANARE })).toEqual([])
  })

  it('ambele rute sunt in RUTE, sub marcajul feliei', () => {
    const cai = RUTE.map((r) => r.cale)
    expect(cai).toContain('/promo')
    expect(cai).toContain('/promo/scanare-cu-telefonul')
    const textRute = readFileSync('src/content/rute.ts', 'utf8')
    const bloc = textRute.slice(textRute.indexOf('// <<felie:promo>>'), textRute.indexOf('// <<felie:conversie>>'))
    expect(bloc).toContain('cale: "/promo"')
    expect(bloc).toContain('cale: "/promo/scanare-cu-telefonul"')
  })

  it('codul fiscal de pe bon e INVALID prin constructie (control: acelasi corp cu cifra buna e valid)', () => {
    expect(cuiValid(PROMO.BON.codFiscal)).toBe(false)
    const corp = PROMO.BON.codFiscal.replace(/\D/g, '').slice(0, -1)
    expect(cuiValid(corp + String(cifraControlCui(corp)))).toBe(true)
  })

  it('totalul bonului e suma articolelor (defectul referintei, corectat) si apare in date', () => {
    const suma = PROMO.BON.articole.reduce((s, a) => s + a.cantitate * a.pretBani, 0)
    expect(PROMO.totalBon()).toBe(suma)
    expect(PROMO.formatBani(suma)).toBe('251,50')
    expect(PROMO.formatBani(123456)).toBe('1.234,56')
    expect(PROMO.DATE_CITITE.find((r) => r.cheie === 'Total')?.valoare).toBe('251,50 RON')
  })

  it('firmele si persoanele din machete sunt evident fictive (poarta cuvantul Exemplu)', () => {
    expect(PROMO.BON.comerciant).toMatch(/EXEMPLU/)
    expect(PROMO.PRIMIRE.fisier).toMatch(/exemplu/)
    expect(PROMO.AUTOMATIZARE.jurnal.some((j) => /Exemplu/.test(j.rezultat))).toBe(true)
  })

  it('contoarele si cifrele poarta numai fapte din registrul feliei', () => {
    const registru = JSON.parse(readFileSync('src/content/afirmatii/promo.json', 'utf8')) as { id: string; text: string }[]
    const texte = registru.map((r) => r.text).join(' | ')
    expect(texte).toContain('0 RON')
    expect(texte).toContain('10 integrări')
    expect(texte).toContain('Germania')
    expect(texte).toContain('AES-256')
    expect(PROMO.CONTOARE.find((c) => c.numara !== undefined)?.numara).toBe(10)
  })

  it('niciun nume al firmei-mame pe pagini (decizia D10)', () => {
    // Numele se asambleaza la rulare: proba nu poarta literal ce vaneaza, altfel `git grep` pe fisierele
    // feliei (verificarea D10) il gaseste chiar aici.
    const nume = new RegExp(['AD', 'RIA'].join(''), 'i')
    for (const html of Object.values(PAGINI)) expect(html).not.toMatch(nume)
  })
})
