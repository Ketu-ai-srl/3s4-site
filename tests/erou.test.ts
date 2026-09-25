import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import Erou from '../src/components/erou/Erou'
import {
  ARC_COMETA,
  CAP_COMETA_STATIC,
  FRACTII_NODURI,
  LUNGIME_BUCLA,
  PERIOADA_MS,
  capete,
  liniutaCometa,
  lungimeCalculata,
  pulsuriIntre,
  punctLaFractie,
  type TintaPuls,
} from '../src/components/erou/geometrie'
import { MACHETA, TUR } from '../src/content/acasa-erou'

/**
 * Probele feliei `erou` (valul S4-2) care nu cer navigator: geometria si ceasul buclei, starea
 * statica randata pe server si continutul machetei.
 *
 * ASTEPTARILE VIN DIN AFARA CODULUI: lungimea drumului (1396,34, masurata pe referinta cu
 * `getTotalLength`), pozitiile nodurilor, arcul cometei si ordinea pulsurilor sunt cifrele fisei de
 * masurare (acasa-erou.md §1.4-§1.5), nu ale functiilor de aici. Asa, geometria si asteptarea nu
 * pot drifta impreuna.
 */

const html = renderToStaticMarkup(createElement(Erou))

describe('geometria buclei, contra masuratorii', () => {
  it('lungimea calculata e cea masurata pe referinta (1396,34 u)', () => {
    expect(Math.abs(lungimeCalculata() - 1396.34)).toBeLessThan(0.05)
    expect(LUNGIME_BUCLA).toBe(1396.34)
  })

  it('nodurile cad pe drum unde le-a masurat fisa (§1.4.5)', () => {
    const fisa: Record<string, [number, number]> = {
      'sus-stanga': [212, 105.2],
      'jos-stanga': [212, 314.8],
      'sus-dreapta': [428, 105.2],
      'jos-dreapta': [428, 314.8],
    }
    for (const [pozitie, [x, y]] of Object.entries(fisa)) {
      const p = punctLaFractie(FRACTII_NODURI[pozitie as keyof typeof FRACTII_NODURI])
      expect(Math.abs(p.x - x), pozitie + ' x').toBeLessThan(0.3)
      expect(Math.abs(p.y - y), pozitie + ' y').toBeLessThan(0.3)
    }
  })

  it('fractiile 0 si 0,5 sunt centrul, 0,25 si 0,75 capetele lobilor', () => {
    for (const [f, x, y] of [
      [0, 320, 210],
      [0.5, 320, 210],
      [0.25, 90, 210],
      [0.75, 550, 210],
    ]) {
      const p = punctLaFractie(f)
      expect(Math.abs(p.x - x), 'x la ' + f).toBeLessThan(0.05)
      expect(Math.abs(p.y - y), 'y la ' + f).toBeLessThan(0.05)
    }
  })

  it('cometa de miscare redusa: arc de 10% (139,63 u), capul la 30% din drum', () => {
    const l = liniutaCometa(CAP_COMETA_STATIC)
    expect(l.dasharray).toBe('139.63 1256.71')
    expect(l.dashoffset).toBeCloseTo(-(0.3 - ARC_COMETA) * 1396.34, 2)
  })

  it('cele trei capete sunt defazate cu o treime si fac un tur in 12 000 ms, liniar', () => {
    expect(PERIOADA_MS).toBe(12000)
    const c = capete(3000)
    expect(c[0]).toBeCloseTo(0.25, 9)
    expect(c[1]).toBeCloseTo(0.25 + 1 / 3, 9)
    expect(c[2]).toBeCloseTo(0.25 + 2 / 3, 9)
    expect(capete(12000)[0]).toBeCloseTo(0, 9)
  })
})

describe('ceasul pulsurilor, contra jurnalului din fisa (§1.5)', () => {
  /** Pulsurile vazute cadru cu cadru (16 ms, ca la 60 de cadre pe secunda), cu momentul lor. */
  function jurnal(pana: number): { t: number; tinta: TintaPuls }[] {
    const rezultat: { t: number; tinta: TintaPuls }[] = []
    let anterior = 0
    for (let t = 16; t <= pana; t += 16) {
      for (const tinta of pulsuriIntre(anterior, t)) rezultat.push({ t, tinta })
      anterior = t
    }
    return rezultat
  }

  it('ordinea si distantele intr-o fereastra de 4000 ms: 0 / 560 / 1120 / 2000 / 2560 / 3120', () => {
    const j = jurnal(24000)
    const start = j.findIndex((e) => e.tinta === 'sus-stanga')
    const fereastra = j.slice(start, start + 7)
    expect(fereastra.map((e) => e.tinta)).toEqual([
      'sus-stanga',
      'centru',
      'jos-dreapta',
      'sus-dreapta',
      'centru',
      'jos-stanga',
      'sus-stanga',
    ])
    const fisa = [0, 560, 1120, 2000, 2560, 3120, 4000]
    fereastra.forEach((e, i) => {
      // Fisa: confirmat pe jurnal cu abateri sub 60 ms; aici pasul de cadru e 16 ms.
      expect(Math.abs(e.t - fereastra[0].t - fisa[i]), e.tinta + ' la ' + fisa[i]).toBeLessThan(20)
    })
  })

  it('fiecare nod pulseaza o data la 4000 ms, centrul o data la 2000 ms', () => {
    const j = jurnal(12000 * 2)
    const numar = (tinta: TintaPuls) => j.filter((e) => e.tinta === tinta).length
    for (const nod of ['sus-stanga', 'jos-stanga', 'sus-dreapta', 'jos-dreapta'] as const) {
      expect(numar(nod), nod).toBe(6)
    }
    expect(numar('centru')).toBe(12)
  })

  it('martor POZITIV: o pauza lunga (fila ascunsa) nu porneste pulsuri de recuperare', () => {
    // Control: aceeasi fereastra, parcursa cadru cu cadru, are pulsuri; sarita dintr-odata, niciunul.
    expect(jurnal(5000).length).toBeGreaterThan(0)
    expect(pulsuriIntre(0, 5000)).toEqual([])
  })

  it('martor NEGATIV: timpul care nu avanseaza nu produce pulsuri', () => {
    expect(pulsuriIntre(1488, 1488)).toEqual([])
    expect(pulsuriIntre(2000, 1000)).toEqual([])
  })
})

describe('eroul randat pe server: starea statica a ciotului', () => {
  const erou = html

  it('ramane la calea ciotului, cu un singur h1', () => {
    expect(erou).toContain('data-ciot="erou"')
    expect(erou.match(/<h1\b/g)).toHaveLength(1)
  })

  it('fara JavaScript nu promite nimic ce nu poate face: niciun buton si niciun aria-expanded', () => {
    // Prima pastila si centrul devin butoane abia dupa montare. Si proba acordeonului de pe start
    // (tests/fundatie-start.test.ts) citeste primele aria-expanded din pagina: eroul, care vine
    // primul, nu are voie sa-i adauge unul.
    expect(erou).not.toMatch(/<button\b/)
    expect(erou).not.toContain('aria-expanded')
  })

  it('cometa sta cu capul la 30% din drum, iar punctele nu exista fara JavaScript', () => {
    expect(erou).toContain('stroke-dashoffset="' + (-(0.3 - 0.1) * 1396.34).toFixed(2) + '"')
    expect(erou).toContain('stroke-dasharray="139.63 1256.71"')
    // Punctele poarta clasele `punct-cap`, `punct-mijloc`, `punct-coada`. Un simplu `<circle` nu e
    // semnul lor: iconita "play" a butonului secundar are si ea un cerc.
    expect(erou).not.toContain('punct-')
  })

  it('nodurile stau la procentele din fisa (33,12 / 25,04 ... 66,88 / 74,96)', () => {
    for (const stil of ['left:33.12%;top:25.04%', 'left:33.12%;top:74.96%', 'left:66.88%;top:25.04%', 'left:66.88%;top:74.96%']) {
      expect(erou).toContain(stil)
    }
  })

  it('macheta nu e in HTML-ul servit: se incarca lenes, la clic', () => {
    expect(erou).not.toContain(TUR.bunVenit)
    expect(erou).not.toContain(MACHETA.inapoi)
  })
})

describe('continutul machetei', () => {
  /** Lungimile rolurilor, din fisa (§1.6.4): bun-venit, titlu si paragraf pe fiecare scena. */
  const LUNGIMI_FISA = {
    bunVenit: 26,
    scene: [
      [20, 185],
      [54, 122],
      [29, 192],
    ],
    inapoi: 16,
    cerere: 57,
  }

  const inBanda = (text: string, tinta: number) => Math.abs(Array.from(text).length - tinta) / tinta <= 0.15

  it('fiecare text sta in +/-15% din lungimea rolului sau la referinta', () => {
    expect(inBanda(TUR.bunVenit, LUNGIMI_FISA.bunVenit), TUR.bunVenit).toBe(true)
    TUR.scene.forEach((s, i) => {
      expect(inBanda(s.titlu, LUNGIMI_FISA.scene[i][0]), s.titlu).toBe(true)
      expect(inBanda(s.paragraf, LUNGIMI_FISA.scene[i][1]), s.paragraf).toBe(true)
    })
    expect(inBanda(MACHETA.inapoi, LUNGIMI_FISA.inapoi), MACHETA.inapoi).toBe(true)
    expect(inBanda(MACHETA.cautare.cerere, LUNGIMI_FISA.cerere), MACHETA.cautare.cerere).toBe(true)
  })

  /** Semnatura calificata e "integrare in curs" (plan D4c): turul nu o prezinta ca existenta. */
  const SEMNATURA_ELECTRONICA = /semn[aă]tur\S*\s+(electronic|calificat|digital)|\be-?sign/i

  it('turul nu promite semnatura electronica sau calificata', () => {
    const texte = TUR.scene.flatMap((s) => [s.titlu, s.paragraf])
    expect(texte.filter((t) => SEMNATURA_ELECTRONICA.test(t))).toEqual([])
    // Controlul tiparului, pe o fraza asamblata aici: forma interzisa e prinsa.
    expect(SEMNATURA_ELECTRONICA.test(['Semnătură', 'calificată', 'pe', 'facturi'].join(' '))).toBe(true)
  })

  it('datele sunt declarate ca exemplu, pe ecran si pentru cititoarele de ecran', () => {
    expect(MACHETA.declaratie).toMatch(/fictive/)
    expect(MACHETA.adresa).toMatch(/exemplu/i)
    expect(MACHETA.exempluTelefon).toMatch(/exemplu/i)
  })

  it('adresele de posta din macheta nu pot ajunge la nimeni (domeniu .exemplu)', () => {
    const toate = JSON.stringify(MACHETA)
    const adrese = [...toate.matchAll(/[\w.+-]+@[\w-]+(?:\.[\w-]+)+/g)].map((m) => m[0])
    expect(adrese.length).toBeGreaterThan(0)
    expect(adrese.filter((a) => !a.endsWith('.exemplu'))).toEqual([])
  })

  it('patru ecrane, patru acte care se rotesc, patru dosare', () => {
    expect(MACHETA.meniu.map((e) => e.cheie)).toEqual(['primite', 'documente', 'cautare', 'portal'])
    expect(MACHETA.primite.acte.map((a) => a.tip)).toEqual(['factura', 'contract', 'aviz', 'raport'])
    expect(MACHETA.documente.dosare).toHaveLength(4)
    // Fiecare act merge intr-un dosar care exista in banda de dosare.
    const dosare = MACHETA.primite.dosare.map((d) => d.nume)
    for (const a of MACHETA.primite.acte) expect(dosare, a.dosar).toContain(a.dosar)
  })
})
