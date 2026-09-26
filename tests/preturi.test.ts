import { readdirSync, readFileSync } from 'node:fs'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import Preturi, { metadata } from '../src/app/preturi/page'
import { asezare, GRILA_MESE, LOCURI_PE_MASA, locul, numarMese } from '../src/components/preturi/birou-asezare'
import { directieCamera, ORBITA } from '../src/components/preturi/birou-scena'
import {
  calculeaza,
  ePeGrila,
  formatBani,
  formatOre,
  formatZecimal,
  oreCautare,
  oreEchivalent,
  planPentru,
  valoareOre,
  valoriCursor,
} from '../src/components/preturi/calcul'
import { textTeaser } from '../src/components/preturi/Calculator'
import { grafIntrebariPreturi } from '../src/components/preturi/date-structurate'
import { dataRomaneasca, FoaieOferta, REGULI_TIPAR } from '../src/components/preturi/ListaPdf'
import LumeaPreturi from '../src/components/preturi/LumeaPreturi'
import { iduri } from '../src/components/seo/date-structurate'
import { abateriMetadata } from '../src/components/seo/metadata'
import registru from '../src/content/afirmatii/preturi.json'
import { CAI_EXISTENTE } from '../src/content/cai'
import * as continut from '../src/content/preturi'
import {
  ANCORE_PRETURI,
  ANTET_PRETURI,
  BIROU,
  CALCULATOR,
  CALE_PRETURI,
  COMPARATIE,
  COMUTATOR,
  cuDe,
  GRILA,
  INTREBARI_PRETURI,
  LISTA_PDF,
  META_PRETURI,
  PLANURI,
  POARTA_BAZA,
  POARTA_ENTERPRISE,
  randuriPlan,
  valoareSpusa,
  type Cursor,
} from '../src/content/preturi'
import { RUTE } from '../src/content/rute'
import { adresaSite, urlAbsolut } from '../src/lib/site'

/**
 * Probele feliei `preturi` care nu cer browser: HTML-ul servit al paginii (ambele stari, poarta
 * fara JavaScript, cardul enterprise inert), formula calculatorului, contractul de continut (toate
 * sumele 0 RON, 3 pachete, 9 randuri, 14 randuri de tabel, 7 intrebari), asezarea biroului, foaia de
 * tiparit si datele structurate. Comportamentul viu (plecarea, pliurile, scena, tiparirea) e in
 * `tests/browser/preturi.spec.ts`.
 *
 * Cifrele formulei vin din fisa `preturi.md` §6b (depozitul fabricii): combinatiile citite pe
 * referinta, la tariful ei. Aici se verifica FORMA calculului pe ele; preturile referintei nu intra
 * in depozit, iar cu pretul 3S de astazi rezultatul in ore e 0.
 */

const html = renderToStaticMarkup(createElement(Preturi))

/** Numarul de aparitii ale unui subsir. */
const numara = (text: string, cautat: string) => text.split(cautat).length - 1

/** Clasa CSS (cu sufixul ei generat) care contine fragmentul dat, prima gasita in HTML. */
const clasa = (text: string, fragment: string) =>
  (text.match(/class="([^"]*)"/g) ?? [])
    .flatMap((c) => c.slice(7, -1).split(' '))
    .find((c) => c.includes(fragment)) ?? '(lipsa)'

/** Liniutele lungi (en si em), construite din coduri: proba nu le poarta literal. */
const LINIUTA = new RegExp('[' + String.fromCharCode(0x2013, 0x2014) + ']')

/** Toate sirurile dintr-o valoare (obiecte, liste, functii chemate cu valori-proba). */
function siruri(v: unknown, adanc = 0): string[] {
  if (adanc > 6) return []
  if (typeof v === 'string') return [v]
  if (typeof v === 'function') {
    try {
      return siruri((v as (...a: unknown[]) => unknown)(7, 3), adanc + 1)
    } catch {
      return []
    }
  }
  if (Array.isArray(v)) return v.flatMap((x) => siruri(x, adanc + 1))
  if (v && typeof v === 'object') return Object.values(v).flatMap((x) => siruri(x, adanc + 1))
  return []
}

describe('formula calculatorului (fisa §6b)', () => {
  // Combinatiile citite pe referinta: persoane, minute, tarif -> ore, bani afisati.
  const MASURATE: [number, number, number, number, string][] = [
    [1, 10, 71, 4, '284'],
    [1, 120, 71, 44, '3.124'],
    [3, 15, 71, 17, '1.207'],
    [5, 30, 71, 55, '3.905'],
    [7, 45, 71, 116, '8.236'],
    [11, 30, 71, 121, '8.591'],
    [35, 90, 71, 1155, '82.005'],
    [50, 120, 71, 2200, '156.200'],
    [8, 40, 23, 117, '2.691'],
    [8, 40, 207, 117, '24.219'],
  ]

  for (const [p, m, t, ore, bani] of MASURATE) {
    it(p + ' persoane, ' + m + ' min, ' + t + ' RON/h -> ' + ore + ' h, ' + bani + ' RON', () => {
      const r = calculeaza({ persoane: p, minute: m, tarif: t }, 'anual', PLANURI, CALCULATOR.zileLucratoare)
      expect(r.ore).toBe(ore)
      expect(formatOre(r.ore)).toBe(String(ore))
      expect(formatBani(r.bani)).toBe(bani)
    })
  }

  it('rotunjirea e pe ore, iar banii se calculeaza din orele deja rotunjite', () => {
    // 3 x 15 / 60 x 22 = 16,5 -> 17 h; banii 17 x 71, nu 16,5 x 71.
    expect(oreCautare(3, 15, 22)).toBe(17)
    expect(valoareOre(17, 71)).toBe(1207)
  })

  it('pachetul potrivit: primul cu destule conturi; peste cel mai mare, niciunul', () => {
    const nume = (p: number) => planPentru(p, PLANURI)?.nume ?? null
    expect([1, 5, 6, 10, 11, 20].map(nume)).toEqual(['Start', 'Start', 'Plus', 'Plus', 'Pro', 'Pro'])
    // Runda 1 a criticului: la 21-50 de persoane iesirea spunea "Se potriveste Pro" (20 de conturi).
    expect(planPentru(21, PLANURI)).toBeNull()
    expect(planPentru(50, PLANURI)).toBeNull()
    const r = calculeaza({ persoane: 21, minute: 30, tarif: 70 }, 'anual', PLANURI, 22)
    expect([r.plan, r.pret, r.oreEchivalent]).toEqual([null, null, null])
    // timpul de acum se calculeaza si fara pachet
    expect(r.ore).toBe(oreCautare(21, 30, 22))
  })

  it('pretul de astazi in ore e 0 pentru orice combinatie si orice perioada: calculul nu promite castig', () => {
    for (const perioada of ['lunar', 'anual'] as const) {
      for (const p of [1, 5, 6, 12, 20]) {
        const r = calculeaza({ persoane: p, minute: 30, tarif: 70 }, perioada, PLANURI, 22)
        expect(r.pret).toBe(0)
        expect(r.oreEchivalent).toBe(0)
      }
    }
  })

  it('martor POZITIV: cu un pret nenul, formula orelor echivalente chiar calculeaza (o zecimala)', () => {
    expect(oreEchivalent(100, 70)).toBe(1.4)
    expect(oreEchivalent(150, 70)).toBe(2.1)
    expect(formatZecimal(oreEchivalent(100, 70))).toBe('1,4')
    // tarif nul: 0, nu Infinity
    expect(oreEchivalent(100, 0)).toBe(0)
  })

  it('formatarea: punct la mii, orele fara separator, zecimala cu virgula', () => {
    expect(formatBani(0)).toBe('0')
    expect(formatBani(999)).toBe('999')
    expect(formatBani(1000)).toBe('1.000')
    expect(formatBani(1234567)).toBe('1.234.567')
    expect(formatOre(1155)).toBe('1155')
    expect(formatZecimal(0)).toBe('0')
    expect(formatZecimal(2)).toBe('2')
    expect(formatZecimal(1.25)).toBe('1,3')
  })

  it('cursoarele: valoarea de pornire si capetele sunt pe grila fiecaruia (la referinta tariful nu era)', () => {
    for (const c of Object.values(CALCULATOR.cursoare)) {
      expect(ePeGrila(c, c.implicit), c.eticheta).toBe(true)
      expect(ePeGrila(c, c.min), c.eticheta).toBe(true)
      expect(ePeGrila(c, c.max), c.eticheta).toBe(true)
      expect(valoriCursor(c)).toContain(c.implicit)
      expect(valoriCursor(c).at(-1)).toBe(c.max)
    }
    const tarif = CALCULATOR.cursoare.tarif
    expect([tarif.min, tarif.max, tarif.pas, tarif.implicit]).toEqual([22, 210, 4, 50])
    // Valorile de pornire sunt ale 3S (regula de text D1b: nu cifrele de exemplu ale referintei).
    const c = CALCULATOR.cursoare
    expect([c.persoane.implicit, c.minute.implicit, c.tarif.implicit]).toEqual([4, 25, 50])
  })

  it('martor POZITIV: grila referintei (din 23, pas 4) nu contine nici 70, nici 210 - verificarea chiar respinge', () => {
    const referinta = { ...CALCULATOR.cursoare.tarif, min: 23 }
    expect(ePeGrila(referinta, 70)).toBe(false)
    expect(ePeGrila(referinta, 210)).toBe(false)
    expect(ePeGrila(referinta, 71)).toBe(true)
  })

  it('teaserul spune presupunerile de pornire si rezultatul lor, cu numeralul romanesc', () => {
    const t = textTeaser()
    // 4 x 25 / 60 x 22 = 36,67 -> 37 de ore
    expect(t.presupuneri).toBe('Cu 4 colegi care caută acte câte 25 de minute zilnic')
    expect(t.rezultat).toBe('se adună 37 de ore lunar')
    expect(html).toContain(t.presupuneri)
    expect(html).toContain(t.rezultat)
  })

  it('numeralul: "de" de la 20 in sus si la sutele rotunde, nu sub 20', () => {
    expect([1, 5, 19, 20, 55, 100, 101, 119, 120].map((n) => n + cuDe(n))).toEqual([
      '1',
      '5',
      '19',
      '20 de',
      '55 de',
      '100 de',
      '101',
      '119',
      '120 de',
    ])
  })

  // Runda 2 a criticului: `aria-valuetext` lipea valoarea de unitate, deci la pornire cititorul de
  // ecran auzea "25 minute pe zi" si "50 lei pe oră", iar la capete "1 persoane". Valorile probei
  // acopera singularul, sub 20, 20, peste 20, sutele cu si fara "de".
  const VALORI_SPUSE = [1, 4, 20, 25, 50, 120, 210]
  const c = CALCULATOR.cursoare
  const ASTEPTATE: [Cursor, string[]][] = [
    [c.persoane, ['1 persoană', '4 persoane', '20 de persoane', '25 de persoane', '50 de persoane', '120 de persoane', '210 persoane']],
    [
      c.minute,
      ['1 minut pe zi', '4 minute pe zi', '20 de minute pe zi', '25 de minute pe zi', '50 de minute pe zi', '120 de minute pe zi', '210 minute pe zi'],
    ],
    [c.tarif, ['1 leu pe oră', '4 lei pe oră', '20 de lei pe oră', '25 de lei pe oră', '50 de lei pe oră', '120 de lei pe oră', '210 lei pe oră']],
  ]

  it('valoarea spusa a cursoarelor (aria-valuetext): singular la 1 si numeralul romanesc', () => {
    for (const [cursor, asteptate] of ASTEPTATE) {
      expect(VALORI_SPUSE.map((n) => valoareSpusa(cursor, n)), cursor.eticheta).toEqual(asteptate)
    }
    // cum le aude cititorul la deschiderea calculatorului, cu valorile de pornire
    expect([valoareSpusa(c.persoane, 4), valoareSpusa(c.minute, 25), valoareSpusa(c.tarif, 50)]).toEqual([
      '4 persoane',
      '25 de minute pe zi',
      '50 de lei pe oră',
    ])
  })

  it('martor POZITIV: lipirea directa (valoare + spatiu + unitate) e respinsa exact la 1 si unde se cere "de"', () => {
    // Forma din runda 2, refacuta aici: aceeasi tabela o respinge la 1, 20, 25, 50 si 120 si o lasa
    // sa treaca la 4 si 210, unde lipirea directa e corecta; deci proba deosebeste, nu respinge orice.
    const lipita = (cursor: Cursor, n: number) => n + ' ' + cursor.unitateSpusa.multe
    for (const [cursor, asteptate] of ASTEPTATE) {
      const respinse = VALORI_SPUSE.filter((n, i) => lipita(cursor, n) !== asteptate[i])
      expect(respinse, cursor.eticheta).toEqual([1, 20, 25, 50, 120])
    }
    expect(lipita(c.minute, 25)).toBe('25 minute pe zi')
  })
})

describe('contractul de continut', () => {
  it('toate sumele sunt 0 RON astazi, lunar si anual (D3), iar insigna anuala nu are procent', () => {
    expect(PLANURI.map((p) => [p.pret.lunar, p.pret.anual])).toEqual([
      [0, 0],
      [0, 0],
      [0, 0],
    ])
    expect(COMUTATOR.insigna).not.toMatch(/%/)
    expect(COMUTATOR.insigna).toContain('0\u00a0RON')
  })

  it('trei pachete, 5 / 10 / 20 de conturi, unul singur recomandat', () => {
    expect(PLANURI.map((p) => [p.nume, p.conturi])).toEqual([
      ['Start', 5],
      ['Plus', 10],
      ['Pro', 20],
    ])
    expect(PLANURI.filter((p) => p.recomandat).map((p) => p.nume)).toEqual(['Start'])
  })

  it('fiecare pachet are 9 randuri; primul spune conturile, al saselea are explicatia "i"', () => {
    for (const p of PLANURI) {
      const r = randuriPlan(p)
      expect(r).toHaveLength(9)
      expect(r[0].cifra).toBe(String(p.conturi))
      expect(r.map((x) => x.explicatie !== null)).toEqual([false, false, false, false, false, true, false, false, false])
    }
    expect(randuriPlan(PLANURI[0])[0].text).toBe('conturi pentru echipă')
    expect(randuriPlan(PLANURI[2])[0].text).toBe('de conturi pentru echipă')
  })

  it('pachetele difera NUMAI prin conturi: randurile 2-9 sunt aceleasi in toate', () => {
    const rest = PLANURI.map((p) => JSON.stringify(randuriPlan(p).slice(1)))
    expect(new Set(rest).size).toBe(1)
  })

  it('tabelul: 4 categorii, 2 + 5 + 4 + 3 = 14 randuri, conturile din tabel sunt ale pachetelor', () => {
    expect(COMPARATIE.categorii.map((c) => c.randuri.length)).toEqual([2, 5, 4, 3])
    const randuri = COMPARATIE.categorii.flatMap((c) => c.randuri)
    const conturi = randuri.find((r) => r.functie.startsWith('Conturi'))
    expect(conturi).toBeDefined()
    const valori = PLANURI.map((p) => {
      const c = conturi!.celule[p.cheie]
      return c.fel === 'valoare' ? c.text : null
    })
    expect(valori).toEqual(PLANURI.map((p) => String(p.conturi)))
    const pret = randuri.find((r) => r.functie === 'Prețul astăzi')
    expect(PLANURI.map((p) => pret!.celule[p.cheie])).toEqual(PLANURI.map(() => ({ fel: 'valoare', text: '0\u00a0RON' })))
  })

  it('7 intrebari, fiecare cu raspuns de cel putin 20 de cuvinte', () => {
    expect(INTREBARI_PRETURI.intrebari).toHaveLength(7)
    for (const i of INTREBARI_PRETURI.intrebari) {
      expect(i.raspuns.split(' ').filter(Boolean).length, i.intrebare).toBeGreaterThanOrEqual(20)
    }
  })

  it('fara cifra de tractiune ("popular") si fara liniuta lunga in textele vizibile', () => {
    const toate = siruri(continut)
    expect(toate.length).toBeGreaterThan(100)
    expect(toate.filter((s) => /popular/i.test(s))).toEqual([])
    expect(toate.filter((s) => LINIUTA.test(s))).toEqual([])
  })

  it('martor POZITIV: cautarea prinde un "popular" si o liniuta lunga puse intr-o copie', () => {
    const toate = siruri({ ...continut, proba: ['Alegerea populară', 'a ' + String.fromCharCode(0x2014) + ' b'] })
    expect(toate.filter((s) => /popular/i.test(s))).toHaveLength(1)
    expect(toate.filter((s) => LINIUTA.test(s))).toHaveLength(1)
  })

  it('nicio conditie comerciala nestabilita: niciun text nu fixeaza un contract pentru Enterprise', () => {
    // Registrul (preturi-enterprise-contract) spune ca pagina nu fixeaza nici prag, nici contract;
    // runda anterioara a criticului a gasit contractul in subtitlul eroului, dupa ce il scosese din FAQ.
    const toate = siruri(continut)
    expect(toate.filter((s) => /contract/i.test(s))).toEqual([])
    // martor POZITIV: aceeasi cautare prinde o formulare cu contract pusa intr-o copie
    const cuProba = siruri({ ...continut, proba: ['3S Enterprise se stabilește prin ' + 'contract.'] })
    expect(cuProba.filter((s) => /contract/i.test(s))).toHaveLength(1)
  })

  it('biroul: textele contorului si ale scenei, cu numeralul', () => {
    expect([BIROU.initial, BIROU.maxim]).toEqual([5, 36])
    expect(BIROU.scena(5, 2)).toBe('Desen: un birou cu 5 dispozitive pe 2 mese')
    expect(BIROU.scena(36, 9)).toBe('Desen: un birou cu 36 de dispozitive pe 9 mese')
    expect(BIROU.locuri(20)).toBe('20 de conturi, câte unul pentru fiecare coleg')
    expect(BIROU.locuri(5)).toBe('5 conturi, câte unul pentru fiecare coleg')
  })

  it('textele vizibile ale componentelor vin din contract: niciun sir cu diacritice in src/components/preturi', () => {
    const dosar = 'src/components/preturi'
    const ghilimele = /"[^"]*[ăâîșțĂÂÎȘȚ][^"]*"/
    const gasite = readdirSync(dosar)
      .filter((f) => /\.tsx?$/.test(f))
      .flatMap((f) =>
        readFileSync(dosar + '/' + f, 'utf8')
          .split(String.fromCharCode(10))
          .filter((rand) => !rand.trim().startsWith('//') && ghilimele.test(rand))
          .map((rand) => f + ': ' + rand.trim()),
      )
    expect(gasite).toEqual([])
  })
})

describe('metadatele si ruta', () => {
  it('titlul (15-65) si descrierea (50-160) trec pragurile, iar calea e cea din RUTE', () => {
    expect(abateriMetadata({ titlu: META_PRETURI.titlu, descriere: META_PRETURI.descriere, cale: CALE_PRETURI })).toEqual([])
    expect(RUTE.filter((r) => r.cale === CALE_PRETURI)).toHaveLength(1)
    expect(JSON.stringify(metadata)).toContain(META_PRETURI.descriere)
  })

  it('martor POZITIV: un titlu prea scurt si o descriere prea lunga sunt prinse de aceeasi verificare', () => {
    const abateri = abateriMetadata({ titlu: 'Prețuri', descriere: 'x'.repeat(161), cale: CALE_PRETURI })
    expect(abateri).toHaveLength(2)
  })
})

describe('HTML-ul servit (fara JavaScript)', () => {
  it('eroul: titlul si subtitlul, care e primul paragraf din <main>, de 30-80 de cuvinte', () => {
    const main = html.slice(html.indexOf('<main'))
    expect(main).toContain('>' + ANTET_PRETURI.titlu + '</h1>')
    const primul = /<p[ >][\s\S]*?<\/p>/.exec(main)
    expect(primul?.[0]).toContain(ANTET_PRETURI.subtitlu)
    const cuvinte = ANTET_PRETURI.subtitlu.split(' ').filter(Boolean).length
    expect(cuvinte).toBeGreaterThanOrEqual(30)
    expect(cuvinte).toBeLessThanOrEqual(80)
  })

  it('raspunsurile celor 7 intrebari sunt in HTML-ul servit, in afara datelor structurate', () => {
    // Runda 2 a criticului: raspunsurile inchise existau doar in JSON-LD si in sarcina RSC. Acordeonul
    // din baza S4-3 le tine in DOM sub `hidden`; aici se cere textul lor fara niciun <script>.
    const faraScripturi = html.replace(/<script[\s\S]*?<\/script>/g, '')
    const gasite = INTREBARI_PRETURI.intrebari.filter((i) => faraScripturi.includes(i.raspuns))
    expect(gasite).toHaveLength(7)
    // martor POZITIV: acelasi filtru pe HTML-ul cu scripturi taiate pierde un raspuns pus doar in script
    const martor = '<script>' + INTREBARI_PRETURI.intrebari[0].raspuns + '</script>'
    expect(martor.replace(/<script[\s\S]*?<\/script>/g, '')).not.toContain(INTREBARI_PRETURI.intrebari[0].raspuns)
  })

  it('ambele stari sunt in HTML: poarta si lumea pachetelor, cu ancorele lor', () => {
    expect(html).toContain('id="' + ANCORE_PRETURI.poarta + '"')
    expect(html).toContain('id="' + ANCORE_PRETURI.pachete + '"')
    expect(html).toContain('id="' + ANCORE_PRETURI.intrebari + '"')
    expect(html).toContain('data-vedere="poarta"')
    // cardul de baza e o legatura spre pachete, "inapoi" o legatura spre poarta
    expect(html).toMatch(/<a href="#pachete" class="[^"]*_panouBaza_/)
    expect(html).toContain('<a href="#' + ANCORE_PRETURI.poarta + '"')
  })

  // Lumea fara /enterprise se fabrica (26.09): forma veche cerea ca ruta sa lipseasca din RUTE si picea
  // pe lotul S4-3, unde felia enterprise-formular o adauga corect.
  const faraEnterprise = new Set([...CAI_EXISTENTE].filter((c) => c !== POARTA_ENTERPRISE.tinta.ruta))

  it('cardul enterprise e INERT cat timp /enterprise lipseste: acelasi aspect, fara href', () => {
    const inert = renderToStaticMarkup(createElement(LumeaPreturi, { lume: null, cai: faraEnterprise }))
    expect(inert).toMatch(/<span class="[^"]*_panouEnterprise_[^"]*" data-tinta-lipsa="\/enterprise">/)
    expect(inert).not.toContain('href="/enterprise"')
    // in elementul inert nu sta niciun bloc: textul cardului ramane span
    expect(inert).toContain('<span class="' + clasa(inert, '_text_') + '">' + POARTA_ENTERPRISE.text + '</span>')
    // HTML-ul servit urmeaza RUTE: inert fara ruta, legatura cu ea
    expect(html).toMatch(
      CAI_EXISTENTE.has('/enterprise')
        ? /<a class="[^"]*_panouEnterprise_[^"]*" href="\/enterprise">/
        : /<span class="[^"]*_panouEnterprise_[^"]*" data-tinta-lipsa="\/enterprise">/,
    )
  })

  it('martor POZITIV: cu /enterprise printre caile existente, acelasi card devine legatura', () => {
    const cai = new Set([...CAI_EXISTENTE, POARTA_ENTERPRISE.tinta.ruta as string])
    const cuRuta = renderToStaticMarkup(createElement(LumeaPreturi, { lume: null, cai }))
    expect(cuRuta).toMatch(/<a class="[^"]*_panouEnterprise_[^"]*" href="\/enterprise">/)
    expect(cuRuta).not.toContain('data-tinta-lipsa')
    // in legatura, textul cardului e paragraf, ca la cardul de baza
    expect(cuRuta).toContain('<p class="' + clasa(cuRuta, '_text_') + '">' + POARTA_ENTERPRISE.text + '</p>')
    const faraRuta = renderToStaticMarkup(createElement(LumeaPreturi, { lume: null, cai: faraEnterprise }))
    expect(faraRuta).toContain('data-tinta-lipsa="/enterprise"')
  })

  it('primele doua paragrafe de cel putin 40 de caractere, in ordinea DOM, sunt vizibile in poarta (S-17)', () => {
    // Aceeasi alegere ca detectorul portii S-17: toate `p`-urile, in ordine, primele doua lungi. Lumea
    // pachetelor e ascunsa la incarcare, deci niciun paragraf al ei nu are voie sa treaca inainte.
    const lungi = [...html.matchAll(/<p(?:\s[^>]*)?>([\s\S]*?)<\/p>/g)]
      .map((m) => m[1].replace(/<[^>]+>/g, '').trim())
      .filter((t) => t.length >= 40)
      .slice(0, 2)
    expect(lungi).toEqual([ANTET_PRETURI.subtitlu, POARTA_BAZA.text])
    const poarta = html.slice(html.indexOf('id="' + ANCORE_PRETURI.poarta + '"'), html.indexOf('id="' + ANCORE_PRETURI.pachete + '"'))
    expect(poarta).toContain('<p class="' + clasa(html, '_text_') + '">' + POARTA_BAZA.text + '</p>')
  })

  it('codul evenimentelor de analitica nu e importat static de calculator (se cere lenes, numai cu analitica)', () => {
    const sursa = readFileSync('src/components/preturi/Calculator.tsx', 'utf8')
    expect(sursa).not.toMatch(/^import[^;]*consimtamant\/evenimente/m)
    expect(sursa).toMatch(/import\("@\/components\/consimtamant\/evenimente"\)/)
    expect(sursa).toMatch(/if \(analitica\)/)
  })

  it('pachetele: numele, sumele 0 si cele 27 de randuri ale grilei; butoanele de cont inerte', () => {
    for (const p of PLANURI) expect(html).toContain('>' + p.nume + '</h3>')
    expect(numara(html, '>0</span><span class="_unitatePret_')).toBe(3)
    expect(numara(html, 'class="_rand_')).toBe(27)
    // fara formularul de cont butoanele sunt inerte, nu legaturi moarte; cu el devin legaturi. Ramura se
    // alege dupa CAI_EXISTENTE (26.09): forma veche cerea /inregistrare lipsa si picea pe felia conversie,
    // care o adauga corect (rularea 36230388457).
    const cont = CAI_EXISTENTE.has(GRILA.buton.href)
    expect(numara(html, cont ? 'href="' + GRILA.buton.href + '"' : 'data-tinta-lipsa="' + GRILA.buton.href + '"')).toBe(3)
    expect(html).toContain(LISTA_PDF.buton)
  })

  it('tabelul e in HTML intreg: 14 randuri de functie, 4 de categorie, bifele cu text pentru cititor', () => {
    expect(numara(html, 'scope="row"')).toBe(14)
    expect(numara(html, 'scope="colgroup"')).toBe(4)
    // 6 randuri cu bifa pe fiecare pachet; celelalte 8 au valori scrise
    expect(numara(html, '<span class="doar-cititor">' + COMPARATIE.inclus + '</span>')).toBe(6 * 3)
    expect(html).toMatch(/role="region" aria-label="[^"]+" tabindex="0"/)
  })

  it('pliurile sunt `details` inchise, iar scena 3D nu e in HTML (se incarca lenes, la deschidere)', () => {
    expect(numara(html, '<details')).toBe(2)
    expect(html).not.toMatch(/<details[^>]* open/)
    expect(html).not.toContain('<canvas')
    expect(html).toContain('data-contor-dispozitive=""')
  })

  it('intrebarile: titlul si cele 7 intrebari, ca butoane de acordeon inchise', () => {
    expect(html).toContain('>' + INTREBARI_PRETURI.titlu + '</h2>')
    for (const i of INTREBARI_PRETURI.intrebari) expect(html).toContain('<span>' + i.intrebare + '</span>')
    expect(numara(html, 'aria-expanded="false"')).toBeGreaterThanOrEqual(7)
  })
})

describe('datele structurate', () => {
  const baza = adresaSite()
  const graf = grafIntrebariPreturi(baza)
  const nod = graf['@graph'][0] as Record<string, unknown>

  it('FAQPage cu identificator propriu, parte din site prin identificatorul comun, cele 7 intrebari', () => {
    expect(nod['@type']).toBe('FAQPage')
    expect(nod['@id']).toBe(urlAbsolut(CALE_PRETURI, baza) + '#intrebari')
    expect(nod.isPartOf).toEqual({ '@id': iduri(baza).site })
    const intrebari = nod.mainEntity as { name: string; acceptedAnswer: { text: string } }[]
    expect(intrebari.map((q) => q.name)).toEqual(INTREBARI_PRETURI.intrebari.map((i) => i.intrebare))
    expect(intrebari.map((q) => q.acceptedAnswer.text)).toEqual(INTREBARI_PRETURI.intrebari.map((i) => i.raspuns))
  })

  it('pagina are exact un FAQPage si un BreadcrumbList (firul), fara identificatori dublati', () => {
    expect(numara(html, '"@type":"FAQPage"')).toBe(1)
    expect(numara(html, '"@type":"BreadcrumbList"')).toBe(1)
    const ids = [...html.matchAll(/"@id":"([^"]+)"/g)].map((m) => m[1])
    // nodul paginii se declara o singura data; trimiterea spre site foloseste identificatorul comun
    expect(ids.filter((id) => id.endsWith('#intrebari'))).toHaveLength(1)
    expect(ids).toContain(iduri(baza).site)
  })
})

describe('asezarea biroului (fisa §7)', () => {
  const pe = (n: number) => {
    const m = new Map<number, number>()
    for (const l of asezare(n)) m.set(l.masa, (m.get(l.masa) ?? 0) + 1)
    return [...m.entries()].sort((a, b) => a[0] - b[0])
  }

  it('la pornire: 5 dispozitive pe doua mese, una cu 4 si una cu 1; la 6: una cu 4 si una cu 2', () => {
    expect(pe(5)).toEqual([
      [0, 1],
      [1, 4],
    ])
    expect(pe(6)).toEqual([
      [0, 2],
      [1, 4],
    ])
    expect(numarMese(5)).toBe(2)
    expect(numarMese(8)).toBe(2)
    expect(numarMese(9)).toBe(3)
  })

  it('la 36: noua mese pline, fiecare loc o data, pe o grila de 3 x 3', () => {
    const toate = asezare(BIROU.maxim)
    expect(numarMese(BIROU.maxim)).toBe(9)
    expect(new Set(toate.map((l) => l.masa + ':' + l.loc)).size).toBe(36)
    expect(toate.every((l) => l.loc >= 0 && l.loc < LOCURI_PE_MASA && l.masa < 9)).toBe(true)
    expect(new Set(GRILA_MESE.map((g) => g.coloana + ':' + g.rand)).size).toBe(9)
    // primele doua mese sunt randul din mijloc
    expect(GRILA_MESE.slice(0, 2)).toEqual([
      { coloana: 0, rand: 1 },
      { coloana: 1, rand: 1 },
    ])
  })

  it('ce sta pe masa urmeaza coloana ei, iar fiecare masa are toate cele trei feluri', () => {
    const peMasa = new Map<number, string[]>()
    for (let i = 0; i < BIROU.maxim; i++) {
      const l = locul(i)
      const s = peMasa.get(l.masa) ?? ['', '', '', '']
      s[l.loc] = l.tip
      peMasa.set(l.masa, s)
    }
    const peColoana = new Map<number, string>()
    for (const [masa, s] of peMasa) {
      expect(new Set(s).size, 'masa ' + masa).toBe(3)
      const c = GRILA_MESE[masa].coloana
      const cheie = s.join(',')
      if (peColoana.has(c)) expect(cheie, 'masa ' + masa).toBe(peColoana.get(c))
      else peColoana.set(c, cheie)
    }
    expect(peColoana.size).toBe(3)
    // masa de la pornire (masa 0) incepe cu un laptop, ca pe captura referintei
    expect(locul(4).tip).toBe('laptop')
  })

  it('miscarea de dupa +1 e o ORBITA in jurul verticalei, nu o apropiere (critic, runda 2)', () => {
    // La referinta sus aluneca spre dreapta si jos spre stanga, iar stanga urca si dreapta coboara:
    // campul unei rotatii de azimut. O orbita pastreaza elevatia si distanta si schimba doar
    // directia orizontala; o apropiere ar lasa directia neschimbata.
    const repaus = directieCamera(0)
    const puls = directieCamera(ORBITA.amplitudine)
    const orizontal = (d: number[]) => Math.hypot(d[0], d[2])
    expect(puls[1]).toBeCloseTo(repaus[1], 12)
    expect(orizontal(puls)).toBeCloseTo(orizontal(repaus), 12)
    expect(Math.hypot(...puls)).toBeCloseTo(1, 12)
    const unghi = Math.acos((puls[0] * repaus[0] + puls[2] * repaus[2]) / (orizontal(puls) * orizontal(repaus)))
    expect(unghi).toBeCloseTo(ORBITA.amplitudine, 9)
    // martor POZITIV: fara abatere directia e aceeasi, deci masuratoarea de mai sus vede abaterea
    expect(directieCamera(0)).toEqual(repaus)
    expect(unghi).toBeGreaterThan(0.005)
    // se stinge: dupa 1,2 s abaterea e sub o miime din cea de pornire
    expect(Math.exp(-1.2 / ORBITA.constanta)).toBeLessThan(0.002)
  })
})

describe('foaia de tiparit (lista de preturi ca PDF)', () => {
  it('data in romana', () => {
    expect(dataRomaneasca(new Date(2026, 8, 25))).toBe('25 septembrie 2026')
    expect(dataRomaneasca(new Date(2027, 0, 1))).toBe('1 ianuarie 2027')
  })

  it('regulile scot din flux tot ce nu e foaia, numai la tiparire si numai cu clasa pusa', () => {
    expect(REGULI_TIPAR.startsWith('@media print{')).toBe(true)
    expect(REGULI_TIPAR).toContain('html.tipar-oferta-3s body>:not([data-foaie-oferta]){display:none!important}')
  })

  it('foaia: cele 3 pachete cu 0 / 0, notele si pagina preturilor; ascunsa cititorului de ecran', () => {
    const f = renderToStaticMarkup(createElement(FoaieOferta, { gazda: 'exemplu.invalid', data: '25 septembrie 2026' }))
    expect(f).toContain('data-foaie-oferta=""')
    expect(f).toContain('aria-hidden="true"')
    for (const p of PLANURI) expect(f).toContain(p.nume)
    expect(numara(f, '>0</td>')).toBe(6)
    for (const n of LISTA_PDF.foaie.note) expect(f).toContain(n)
    expect(f).toContain('exemplu.invalid' + CALE_PRETURI)
  })
})

describe('registrul de afirmatii al paginii (RR-01)', () => {
  const STARI = ['confirmat', 'neconfirmat', 'retras']

  it('fiecare afirmatie are forma registrului si trimite la contractul paginii', () => {
    expect(registru.length).toBeGreaterThan(5)
    for (const a of registru as Record<string, unknown>[]) {
      expect(Object.keys(a).sort()).toEqual(['confirmat_de', 'data', 'id', 'stare', 'sursa', 'text', 'unde'])
      expect(STARI).toContain(a.stare)
      expect(a.unde).toBe('src/content/preturi.ts')
      expect(String(a.id)).toMatch(/^preturi-/)
    }
    expect(new Set((registru as { id: string }[]).map((a) => a.id)).size).toBe(registru.length)
  })

  it('pretul de 0 RON e o afirmatie confirmata (decizia owner-ului)', () => {
    const pret = (registru as { id: string; stare: string }[]).find((a) => a.id === 'preturi-0-ron-lunar-anual')
    expect(pret?.stare).toBe('confirmat')
  })
})
