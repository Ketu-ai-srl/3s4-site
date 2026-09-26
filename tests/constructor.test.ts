import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import Constructor from '../src/components/constructor/Constructor'
import Chestionar from '../src/components/constructor/Chestionar'
import { construiesteSimularea, stareDupa, stareFinala } from '../src/components/constructor/duel-motor'
import {
  PORNIRE_DUPA_ALEGERE,
  apropieProgres,
  pasiFacuti,
  programPasi,
  tintaProgres,
} from '../src/components/constructor/program'
import {
  RASPUNSURI_GOALE,
  bandaCanalelorActiva,
  confirma,
  raspunsuriLaAlegere,
  schimba,
  type Raspunsuri,
} from '../src/components/constructor/stare'
import {
  CODURI_CANAL,
  CODURI_INDUSTRIE,
  CONSTRUCTOR,
  adresaInregistrare,
  citesteParametriInregistrare,
  type CodCanal,
  type CodIndustrie,
  type CodVolum,
} from '../src/content/acasa'
import {
  CHESTIONAR,
  COMUN,
  DIVIZOR_CU_PRODUS,
  ESTIMARE,
  PRECOMPLETARI,
  SCENARII,
  benziPeEcran,
  estimare,
  formatTimp,
  indiciTermeneRatate,
  indiciToast,
  listaCanale,
  numeFisier,
  type Estimare,
} from '../src/content/acasa-constructor'

/**
 * Probele constructorului (felia `constructor`, valul S4-2; fisa `acasa-constructor.md`).
 *
 * CIFRELE DE REFERINTA de mai jos sunt masurate pe referinta vizuala si scrise in fisa, nu
 * derivate din codul de aici: formula pe cele 24 de combinatii (§13), cronologia pe industrie
 * (§6.3), lungimile textelor pe rol (numarate pe textul referintei, numai ca lungime). Asa
 * unealta si asteptarea nu pot drifta impreuna.
 */

// --- Formula (§13): 7 seturi de canale x 3 volume, plus cele 3 variante de "cine" -------------

const SETURI_CANALE: CodCanal[][] = [
  ['email'],
  ['mesaj'],
  ['hartie'],
  ['email', 'mesaj'],
  ['email', 'hartie'],
  ['mesaj', 'hartie'],
  ['email', 'mesaj', 'hartie'],
]

/** Tabelul din fisa: [ore manual, ore cu produsul, raportul barei], pe numar de canale si volum. */
const TABEL_FORMULA: Record<number, Record<CodVolum, [number, number, number]>> = {
  1: { v10: [12, 1, 0.083], v50: [44, 4, 0.091], v99: [88, 8, 0.091] },
  2: { v10: [13, 1, 0.077], v50: [50, 5, 0.1], v99: [99, 9, 0.091] },
  3: { v10: [15, 1, 0.067], v50: [55, 5, 0.091], v99: [110, 10, 0.091] },
}

const COMBINATII: { canale: CodCanal[]; volum: CodVolum }[] = []
for (const canale of SETURI_CANALE) for (const volum of ['v10', 'v50', 'v99'] as CodVolum[]) COMBINATII.push({ canale, volum })

/**
 * Comparatorul probei: combinatiile pe care o functie de estimare le da ALTFEL decat tabelul fisei.
 * Primeste functia din afara, ca martorul pozitiv sa treaca prin acelasi comparator si prin functia
 * paginii (`estimare`), cu divizorul mutat prin cusatura ei - nu printr-o copie a formulei.
 */
function abateriDeLaTabel(calcul: (numarCanale: number, volum: CodVolum) => Estimare): string[] {
  const abateri: string[] = []
  for (const { canale, volum } of COMBINATII) {
    const e = calcul(canale.length, volum)
    const [manual, cuProdus, raport] = TABEL_FORMULA[canale.length][volum]
    if (e.manual !== manual || e.cuProdus !== cuProdus || e.raport !== raport) {
      abateri.push(canale.join('+') + ' ' + volum + ': ' + [e.manual, e.cuProdus, e.raport].join('/'))
    }
  }
  return abateri
}

describe('formula estimarii, pe cele 24 de combinatii masurate', () => {
  it('21 de combinatii canale x volum dau cifrele din fisa', () => {
    expect(COMBINATII).toHaveLength(21)
    expect(abateriDeLaTabel((n, v) => estimare(n, v))).toEqual([])
  })

  it('martor POZITIV: divizorul mutat la 10 prin cusatura lui `estimare` iese din tabel', () => {
    const abateri = abateriDeLaTabel((n, v) => estimare(n, v, 10))
    expect(abateri.length).toBeGreaterThan(0)
    // de pilda 3 canale, 10-50: 55 h manual, 6 h in loc de 5 cu produsul
    expect(abateri).toContain('email+mesaj+hartie v50: 55/6/0.109')
  })

  it('martor NEGATIV: acelasi comparator, cu divizorul paginii dat explicit, nu gaseste nimic', () => {
    expect(abateriDeLaTabel((n, v) => estimare(n, v, DIVIZOR_CU_PRODUS))).toEqual([])
  })

  it('cele 3 variante de "cine" nu schimba cifrele, doar parametrul din adresa', () => {
    const adrese = (['eu', 'coleg', 'nimeni'] as const).map((who) =>
      adresaInregistrare({ ind: 'constructii', src: ['email', 'mesaj', 'hartie'], vol: 'v99', who }),
    )
    expect(new Set(adrese).size).toBe(3)
    for (const a of adrese) expect(a.replace(/&who=[a-z]+$/, '')).toBe(adrese[0].replace(/&who=[a-z]+$/, ''))
    expect(estimare(3, 'v99')).toMatchObject({ manual: 110, cuProdus: 10 })
  })

  it('rotunjirea e cea a lui Math.round: 49,5 ore devin 50 (2 canale, 10-50)', () => {
    expect((30 * 4.5 * 22) / 60).toBe(49.5)
    expect(estimare(2, 'v50').manual).toBe(50)
  })

  it('conteaza CATE canale sunt, nu care', () => {
    expect(estimare(['email', 'hartie'].length, 'v10')).toEqual(estimare(['mesaj', 'hartie'].length, 'v10'))
  })

  it('cu minimul de 1 h, un volum mic nu da zero ore cu produsul', () => {
    for (const n of [1, 2, 3]) expect(estimare(n, 'v10').cuProdus).toBe(1)
  })
})

// --- Programul pasilor (§6.1-§6.3) -------------------------------------------------------------

/**
 * Cronologia masurata pe referinta (§6.3, ms de la clic): cand intra benzile, cand se bifeaza si
 * cand vine finalul. Diferenta fata de programul nostru trebuie sa fie intarzierea de incarcare a
 * modulului scenei (70-240 ms masurat), aceeasi pentru toti pasii aceleiasi rulari.
 */
const CRONOLOGIE: Record<CodIndustrie, { intra: number[]; bifate: number[]; final: number }> = {
  constructii: { intra: [3279, 3620, 3942], bifate: [4459, 4778, 5088], final: 7269 },
  contabilitate: { intra: [3347, 3686], bifate: [4532, 4819], final: 6997 },
  logistica: { intra: [3215, 3542], bifate: [4045, 4362], final: 6875 },
  it: { intra: [3212, 3548, 3876], bifate: [4709, 5034, 5347], final: 7210 },
  avocatura: { intra: [3226, 3586, 3908, 4238], bifate: [4741, 5077, 5373], final: 7567 },
  imobiliare: { intra: [3245, 3547, 3879], bifate: [4415, 4416, 4723], final: 7214 },
  asigurari: { intra: [3258, 3588, 3905, 4249], bifate: [4776, 4777, 5095], final: 7582 },
  notariat: { intra: [3320, 3645, 3971], bifate: [4497, 4498, 5119], final: 7306 },
  consultanta: { intra: [3240, 3579, 3900, 4230], bifate: [4732, 4736, 5067, 6026], final: 7539 },
}

/** Benzile de pe ecran la prima rulare: banda canalelor exista numai la precompletare. */
function benziInitiale(cod: CodIndustrie) {
  const p = PRECOMPLETARI[cod]
  return benziPeEcran(cod, p ? p.canale : null)
}

/** Momentele programului la care se bifeaza benzile, crescator. */
function bifeProgram(cod: CodIndustrie): number[] {
  const benzi = benziInitiale(cod)
  const pasi = programPasi(benzi.length)
  return benzi
    .filter((b) => b.laPas !== null)
    .map((b) => pasi.find((p) => p.nume === 'T' + b.laPas)!.timp)
    .sort((a, b) => a - b)
}

describe('programul pasilor', () => {
  it('are 14 + L pasi, in ordinea fisei, cu finalul la 6100 + 330 x L', () => {
    for (const L of [2, 3, 4]) {
      const pasi = programPasi(L)
      expect(pasi).toHaveLength(14 + L)
      expect(pasi.map((p) => p.timp)).toEqual([...pasi.map((p) => p.timp)].sort((a, b) => a - b))
      expect(pasi[pasi.length - 1]).toEqual({ nume: 'final', timp: 6100 + 330 * L })
    }
  })

  it('pauza de la alegere pune programul pe mediana decalajelor masurate la referinta (±10 ms)', () => {
    // Decalajul referintei: cand vine pasul la referinta (de la clic) minus cand il cere programul.
    // Programul nostru porneste la PORNIRE_DUPA_ALEGERE socotit de la CLIC (`momentAlegere` in
    // Panou), nu de la montarea panoului, care vine in treapta a doua a lumii.
    const decalaje: number[] = []
    for (const cod of CODURI_INDUSTRIE) {
      const pasi = programPasi(benziInitiale(cod).length)
      const m = CRONOLOGIE[cod]
      const intra = pasi.filter((p) => p.nume.startsWith('B')).map((p) => p.timp)
      decalaje.push(...m.intra.map((t, i) => t - intra[i]))
      decalaje.push(...m.bifate.map((t, i) => t - bifeProgram(cod)[i]))
      decalaje.push(m.final - pasi[pasi.length - 1].timp)
    }
    decalaje.sort((a, b) => a - b)
    const n = decalaje.length
    const mediana = (decalaje[Math.floor(n / 2)] + decalaje[Math.floor((n - 1) / 2)]) / 2
    expect(n).toBe(63)
    expect(mediana).toBe(147)
    expect(Math.abs(PORNIRE_DUPA_ALEGERE - mediana)).toBeLessThanOrEqual(10)
  })

  it('reproduce cronologia masurata pe fiecare industrie, cu aceeasi intarziere de incarcare', () => {
    for (const cod of CODURI_INDUSTRIE) {
      const benzi = benziInitiale(cod)
      const pasi = programPasi(benzi.length)
      const m = CRONOLOGIE[cod]
      expect(benzi.length, cod + ': numarul de benzi').toBe(m.intra.length)
      const intra = pasi.filter((p) => p.nume.startsWith('B')).map((p) => p.timp)
      const decalaje = [
        ...m.intra.map((t, i) => t - intra[i]),
        ...m.bifate.map((t, i) => t - bifeProgram(cod)[i]),
        m.final - pasi[pasi.length - 1].timp,
      ]
      expect(bifeProgram(cod), cod + ': cate benzi se bifeaza').toHaveLength(m.bifate.length)
      for (const d of decalaje) {
        expect(d, cod + ': intarzierea ' + decalaje.join('/')).toBeGreaterThanOrEqual(60)
        expect(d, cod + ': intarzierea ' + decalaje.join('/')).toBeLessThanOrEqual(300)
      }
      expect(Math.max(...decalaje) - Math.min(...decalaje), cod + ': aceeasi intarziere').toBeLessThanOrEqual(60)
    }
  })

  it('bara de progres urmeaza curba masurata la Constructii (± 7 puncte)', () => {
    // Referinta (§6.2), de la clic: 50% la 3,9 s, 74% la 5,3 s, 88% la 6,1 s, 95% la 6,8 s, 100% la 7,6 s.
    const repere: [number, number][] = [
      [3900, 50],
      [5300, 74],
      [6100, 88],
      [6800, 95],
      [7600, 100],
    ]
    const L = 3
    const pasi = programPasi(L)
    const incarcare = 180
    let afisat = 0
    const valori = new Map<number, number>()
    for (let t = 0; t <= 8000; t += 1000 / 60) {
      const f = pasiFacuti(pasi, t - incarcare)
      afisat = apropieProgres(afisat, f === 0 ? 0 : tintaProgres(f, L))
      for (const [r] of repere) if (!valori.has(r) && t >= r) valori.set(r, afisat)
    }
    for (const [r, asteptat] of repere) expect(Math.abs(valori.get(r)! - asteptat), 'la ' + r + ' ms').toBeLessThanOrEqual(7)
  })

  it('tinta nu trece de 96 inainte de final, iar la final e 100', () => {
    for (const L of [2, 3, 4]) {
      for (let f = 0; f <= 13 + L; f++) expect(tintaProgres(f, L)).toBeLessThanOrEqual(96)
      expect(tintaProgres(14 + L, L)).toBe(100)
    }
  })
})

// --- Duelul (§11) -------------------------------------------------------------------------------

describe('simularea zilei', () => {
  const peste50 = { industrie: 'constructii' as const, canale: ['email', 'mesaj', 'hartie'] as CodCanal[], volum: 'v99' as const, cine: 'nimeni' as const }

  it('peste 50 si 3 canale: 26 vs 0, 2h 10m, 3 termene, dosarele 6/5/5/5/5 (masurat pe referinta)', () => {
    const s = stareFinala(peste50)
    expect(s.final).toBe(true)
    expect(s.nesortate).toBe(26)
    expect(formatTimp(s.timpPierdut)).toBe('2h 10m')
    expect(formatTimp(s.timpEconomisit)).toBe('2h 10m')
    expect(s.termene).toBe(3)
    expect(s.dosareDreapta).toEqual([6, 5, 5, 5, 5])
    expect(construiesteSimularea(peste50).sfarsit).toBe(11880)
  })

  it('volumul da numarul de documente, pasul si finalul: 8 / 1150 / 9,9 s si 16 / 680 / 11,58 s', () => {
    const p10 = construiesteSimularea({ ...peste50, volum: 'v10', canale: ['email'] })
    const p50 = construiesteSimularea({ ...peste50, volum: 'v50' })
    expect([p10.documente, p10.pas, p10.sfarsit]).toEqual([8, 1150, 9900])
    expect([p50.documente, p50.pas, p50.sfarsit]).toEqual([16, 680, 11580])
    // Masurat la Avocatura (10-50, 3 canale): 16 vs 0, 1h 20m, 2 termene.
    const av = stareFinala({ industrie: 'avocatura', canale: ['email', 'mesaj', 'hartie'], volum: 'v50', cine: 'eu' })
    expect([av.nesortate, formatTimp(av.timpPierdut), av.termene]).toEqual([16, '1h 20m', 2])
  })

  it('termenele ratate si toastul cad la documentele din fisa', () => {
    expect(indiciTermeneRatate('v10')).toEqual([5])
    expect(indiciTermeneRatate('v50')).toEqual([6, 12])
    expect(indiciTermeneRatate('v99')).toEqual([7, 14, 20])
    expect(indiciToast('v99')).toEqual([7, 18])
  })

  it('numele fisierelor cresc la fiecare trecere si gramada tine cel mult 8 randuri', () => {
    const sim = construiesteSimularea(peste50)
    let maxim = 0
    for (let n = 0; n <= sim.evenimente.length; n++) {
      const s = stareDupa(sim, peste50, n)
      maxim = Math.max(maxim, s.gramadaStanga.length, s.gramadaDreapta.length)
    }
    expect(maxim).toBe(8)
    const f = SCENARII.constructii.duel.fisiere[0]
    expect(numeFisier(f, 0)).not.toBe(numeFisier(f, 5))
    expect(stareFinala(peste50).gramadaDreapta[0].nume).toBe(numeFisier(f, 5))
  })

  it('finalul pune fraza despre "cine", cu timpul zilei', () => {
    expect(stareFinala({ ...peste50, cine: 'coleg' }).stres?.text).toContain('2h 10m')
  })

  it('formatul timpului: sub o ora in minute, apoi ore si minute', () => {
    expect([formatTimp(30), formatTimp(60), formatTimp(80), formatTimp(130)]).toEqual(['30 min', '1h', '1h 20m', '2h 10m'])
  })
})

// --- Starea chestionarului (§9, §10) -----------------------------------------------------------

describe('chestionarul', () => {
  it('precompletarea la cele 5 industrii din fisa, cu Q1 singura vizibila', () => {
    expect(Object.keys(PRECOMPLETARI).sort()).toEqual(['asigurari', 'avocatura', 'consultanta', 'imobiliare', 'notariat'])
    const r = raspunsuriLaAlegere('avocatura', RASPUNSURI_GOALE)
    expect(r).toMatchObject({ canale: ['email', 'hartie'], volum: 'v50', cine: 'eu', precompletat: true, dezvaluit: 1 })
    expect(bandaCanalelorActiva(r)).toBe(true)
    expect(raspunsuriLaAlegere('constructii', RASPUNSURI_GOALE)).toMatchObject({ canale: [], precompletat: false })
  })

  it('prima atingere a raspunsurilor precompletate dezvaluie tot deodata', () => {
    const r = schimba(raspunsuriLaAlegere('asigurari', RASPUNSURI_GOALE), { fel: 'canal', canal: 'mesaj' })
    expect(r.dezvaluit).toBe(4)
  })

  it('dezvaluirea pe rand: canal -> volum -> "cine" -> confirmare', () => {
    let r = raspunsuriLaAlegere('constructii', RASPUNSURI_GOALE)
    r = schimba(r, { fel: 'canal', canal: 'email' })
    expect(r.dezvaluit).toBe(2)
    r = schimba(r, { fel: 'volum', volum: 'v10' })
    expect(r.dezvaluit).toBe(3)
    r = schimba(r, { fel: 'cine', cine: 'eu' })
    expect(r.dezvaluit).toBe(4)
    expect(bandaCanalelorActiva(r)).toBe(false)
    const c = confirma(r)
    expect([c.confirmat, c.rulare, bandaCanalelorActiva(c)]).toEqual([true, r.rulare + 1, true])
  })

  it('schimbarile de dupa confirmare reiau simularea si panoul; cele de dinainte, nu', () => {
    let r: Raspunsuri = raspunsuriLaAlegere('constructii', RASPUNSURI_GOALE)
    r = schimba(schimba(schimba(r, { fel: 'canal', canal: 'email' }), { fel: 'volum', volum: 'v10' }), { fel: 'cine', cine: 'eu' })
    expect(r.rulare).toBe(0)
    r = confirma(r)
    const dupa = schimba(r, { fel: 'volum', volum: 'v99' })
    expect(dupa.rulare).toBe(r.rulare + 1)
  })

  it('raspunsurile vizitatorului raman la schimbarea industriei; precompletarea nu le suprascrie', () => {
    const r = schimba(raspunsuriLaAlegere('constructii', RASPUNSURI_GOALE), { fel: 'canal', canal: 'mesaj' })
    const dupa = raspunsuriLaAlegere('avocatura', { ...r, deschis: true })
    expect([dupa.canale, dupa.deschis, dupa.precompletat]).toEqual([['mesaj'], true, false])
  })

  it('martor POZITIV: ultimul canal ramas nu se poate deselecta', () => {
    const r = schimba(raspunsuriLaAlegere('constructii', RASPUNSURI_GOALE), { fel: 'canal', canal: 'email' })
    expect(schimba(r, { fel: 'canal', canal: 'email' })).toBe(r)
  })

  it('martor NEGATIV: un al doilea canal se poate scoate', () => {
    const r = schimba(schimba(raspunsuriLaAlegere('constructii', RASPUNSURI_GOALE), { fel: 'canal', canal: 'email' }), {
      fel: 'canal',
      canal: 'hartie',
    })
    expect(schimba(r, { fel: 'canal', canal: 'email' }).canale).toEqual(['hartie'])
  })
})

// --- Continutul (§17) ---------------------------------------------------------------------------

/** Lungimile rolurilor pe referinta (numarate, niciodata preluate): fraza / durerea / concluzia. */
const LUNGIMI: Record<CodIndustrie, [number, number, number]> = {
  constructii: [128, 95, 86],
  contabilitate: [145, 78, 71],
  logistica: [146, 94, 67],
  it: [154, 92, 88],
  avocatura: [146, 93, 73],
  imobiliare: [162, 70, 91],
  asigurari: [132, 111, 84],
  notariat: [189, 76, 66],
  consultanta: [118, 67, 90],
}

/** Cate perechi declansator / actiune are fiecare scena la referinta (§17). */
const BENZI_PROPRII: Record<CodIndustrie, number> = {
  constructii: 3,
  contabilitate: 2,
  logistica: 2,
  it: 3,
  avocatura: 3,
  imobiliare: 2,
  asigurari: 3,
  notariat: 2,
  consultanta: 3,
}

function inToleranta(valoare: number, referinta: number, fractie = 0.15): boolean {
  return Math.abs(valoare - referinta) <= referinta * fractie
}

describe('continutul celor 9 scenarii', () => {
  it('fraza, durerea si concluzia stau in +/-15% din lungimea rolului pe referinta', () => {
    for (const cod of CODURI_INDUSTRIE) {
      const s = SCENARII[cod]
      const [f, d, c] = LUNGIMI[cod]
      expect(inToleranta(s.fraza.length, f), cod + ' fraza ' + s.fraza.length).toBe(true)
      expect(inToleranta(s.durere.length, d), cod + ' durere ' + s.durere.length).toBe(true)
      expect(inToleranta(s.concluzie.length, c), cod + ' concluzie ' + s.concluzie.length).toBe(true)
    }
  })

  it('martor POZITIV: o fraza cu 20% mai lunga iese din toleranta', () => {
    expect(inToleranta(120, 100)).toBe(false)
  })

  it('martor NEGATIV: o fraza cu 10% mai lunga ramane in toleranta', () => {
    expect(inToleranta(110, 100)).toBe(true)
  })

  it('fiecare scena are benzile, duelul si sabloanele de fisier din fisa', () => {
    for (const cod of CODURI_INDUSTRIE) {
      const s = SCENARII[cod]
      expect(s.benzi, cod).toHaveLength(BENZI_PROPRII[cod])
      for (const b of s.benzi) expect(b.laPas === null || (b.laPas >= 1 && b.laPas <= 5)).toBe(true)
      expect(s.duel.dosare).toHaveLength(5)
      expect(s.duel.tipuri).toHaveLength(5)
      expect(s.duel.fisiere.every((f) => f.sablon.includes('{n}'))).toBe(true)
      expect(s.duel.stres.length).toBeGreaterThanOrEqual(3)
      expect(s.duel.stres.length).toBeLessThanOrEqual(4)
      expect(s.duel.termeneRatate).toHaveLength(3)
      expect(s.duel.toast.length).toBeGreaterThan(10)
    }
  })

  it('cautarea din registrul notarial are 14 caractere, tastate in 5 trepte', () => {
    expect(SCENARII.notariat.obiect.cautare).toHaveLength(14)
  })

  it('datele sunt declarate ca exemplu, pe ecran (plan D9)', () => {
    expect(COMUN.tipSpatiu.toLowerCase()).toContain('exemplu')
    expect(ESTIMARE.formula).toContain('exemplu')
  })

  it('banda canalelor numeste canalele alese, in ordinea contractului', () => {
    expect(listaCanale(['hartie', 'email'], 'banda')).toBe('e-mail și hârtie')
    expect(listaCanale(['hartie', 'mesaj', 'email'], 'fraza')).toBe('prin e-mail, prin WhatsApp și prin poștă')
    expect(CODURI_CANAL).toEqual(['email', 'mesaj', 'hartie'])
    expect(CHESTIONAR.canale.optiuni.map((o) => o.cod)).toEqual([...CODURI_CANAL])
  })
})

// --- Starea statica si contractul spre /inregistrare --------------------------------------------

describe('starea statica randata pe server', () => {
  const html = renderToStaticMarkup(createElement(Constructor))

  it('e poarta: sectiunea cu ancora, tema deschisa, cele 9 industrii ca butoane, fara lume', () => {
    expect(html).toContain('id="constructor"')
    expect(html).toContain('data-ciot="constructor"')
    expect(html).toContain('data-tema="deschisa"')
    expect(html).toContain('data-stare="poarta"')
    expect([...html.matchAll(/data-industrie="([a-z]+)"/g)].map((m) => m[1])).toEqual(CONSTRUCTOR.industrii.map((i) => i.cod))
    expect(html).not.toContain('data-panou')
    expect(html).not.toContain('/inregistrare')
    expect(html).toContain(CONSTRUCTOR.titlu)
    expect(html).toContain(CONSTRUCTOR.intrebare)
  })
})

describe('CTA-ul final trimite raspunsurile prin contractul din acasa.ts', () => {
  const raspunsuri: Raspunsuri = {
    ...RASPUNSURI_GOALE,
    canale: ['hartie', 'email'],
    volum: 'v50',
    cine: 'coleg',
    atinse: true,
    dezvaluit: 4,
    confirmat: true,
    deschis: true,
    estimareDezvaluita: true,
    rulare: 1,
  }
  const html = renderToStaticMarkup(
    createElement(Chestionar, { industrie: 'notariat', raspunsuri, setRaspunsuri: () => {} }),
  )
  const asteptat = adresaInregistrare({ ind: 'notariat', src: ['hartie', 'email'], vol: 'v50', who: 'coleg' })

  it('adresa din pagina e exact cea din contract, citita inapoi fara pierderi', () => {
    expect(asteptat).toBe('/inregistrare?ind=notariat&src=email,hartie&vol=v50&who=coleg')
    const gasite = [...html.matchAll(/(?:href|data-tinta-lipsa)="(\/inregistrare\?[^"]+)"/g)].map((m) => m[1].replace(/&amp;/g, '&'))
    expect(gasite).toEqual([asteptat])
    expect(citesteParametriInregistrare(new URLSearchParams(asteptat.split('?')[1]))).toEqual({
      ind: 'notariat',
      src: ['email', 'hartie'],
      vol: 'v50',
      who: 'coleg',
    })
  })

  it('martor POZITIV: o adresa fara "who" nu trece de verificarea contractului', () => {
    const fara = asteptat.replace(/&who=[a-z]+/, '')
    expect(citesteParametriInregistrare(new URLSearchParams(fara.split('?')[1])).who).toBeUndefined()
  })

  it('martor NEGATIV: estimarea din pagina e cea a formulei pentru aceleasi raspunsuri', () => {
    expect(html).toContain('data-estimare="' + estimare(2, 'v50').manual + '"')
  })
})
