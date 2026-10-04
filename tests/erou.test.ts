import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import Erou from '../src/components/erou/Erou'
import {
  INTARZIERI_CENTRU,
  ORDINE_NODURI,
  TUR_S,
  intarziereNod,
  intarziereUrma,
  punctNod,
  type PozitieNod,
} from '../src/components/erou/geometrie'
import { EROU } from '../src/content/acasa'
import { MACHETA, TUR } from '../src/content/acasa-erou'

/**
 * Probele feliei `erou` care nu cer navigator: geometria si ceasul figurii, starea statica randata pe
 * server si continutul machetei.
 *
 * FIGURA (decizia 61, 04.10.2026): cea din pagina de autentificare a aplicatiei 3S - doua inele egale,
 * alaturate, sase noduri (trei pe fiecare inel: sus, la capatul dinspre margine, jos), sigla in centru, o
 * cometa pe fiecare inel, intr-un tur de 14 s. Figura aplicatiei are 520 x 320 de unitati, inele de raza
 * 98 la x 158 si 362; scena site-ului are 640 x 420, deci figura intra marita de 121 / 98 (raza 121,
 * mijloacele la 320 -/+ 126, pe y 210).
 *
 * ASTEPTARILE SUNT SCRISE DE MANA, din figura de mai sus, nu cerute functiilor de aici: coordonatele
 * nodurilor si intarzierile pulsurilor (sosirea capului: pornirea inelului, decalajul capului fata de
 * urma - 0,07 s in sens invers, 3,01 s in sens normal - si partea de tur pana la nod). Asa, geometria si
 * asteptarea nu pot drifta impreuna.
 */

const html = renderToStaticMarkup(createElement(Erou))

/** Nodurile figurii, de mana: [x, y] in unitati de scena si intarzierea pulsului, in secunde. */
const FIGURA: Record<PozitieNod, { x: number; y: number; puls: number }> = {
  'sus-stanga': { x: 194, y: 89, puls: 3.43 },
  'capat-stanga': { x: 73, y: 210, puls: 6.93 },
  'jos-stanga': { x: 194, y: 331, puls: 10.43 },
  'sus-dreapta': { x: 446, y: 89, puls: 2.79 },
  'capat-dreapta': { x: 567, y: 210, puls: -7.71 },
  'jos-dreapta': { x: 446, y: 331, puls: -4.21 },
}

describe('geometria figurii, contra figurii aplicatiei', () => {
  it('sase noduri, in ordinea drumului: trei pe preluare, trei pe arhiva', () => {
    expect(ORDINE_NODURI).toEqual(['sus-stanga', 'capat-stanga', 'jos-stanga', 'sus-dreapta', 'capat-dreapta', 'jos-dreapta'])
  })

  it('nodurile stau pe inele unde le pune figura', () => {
    for (const [pozitie, f] of Object.entries(FIGURA)) {
      const p = punctNod(pozitie as PozitieNod)
      expect(Math.abs(p.x - f.x), pozitie + ' x').toBeLessThan(0.01)
      expect(Math.abs(p.y - f.y), pozitie + ' y').toBeLessThan(0.01)
    }
  })

  it('pulsul fiecarui nod porneste cand ajunge capul cometei (+/-0,01 s)', () => {
    for (const [pozitie, f] of Object.entries(FIGURA)) {
      expect(Math.abs(intarziereNod(pozitie as PozitieNod) - f.puls), pozitie).toBeLessThan(0.01)
    }
  })

  it('pe fiecare inel capul trece pe la noduri in ordinea drumului, la cate un sfert de tur (3,5 s)', () => {
    const peTur = (s: number) => ((s % TUR_S) + TUR_S) % TUR_S
    for (const inel of [ORDINE_NODURI.slice(0, 3), ORDINE_NODURI.slice(3)]) {
      const t = inel.map((n) => peTur(intarziereNod(n)))
      expect(peTur(t[1] - t[0]), inel.join('>')).toBeCloseTo(3.5, 6)
      expect(peTur(t[2] - t[1]), inel.join('>')).toBeCloseTo(3.5, 6)
    }
  })

  it('centrul pulseaza o data pentru fiecare cap: la estul inelului stang si la vestul celui drept', () => {
    expect(INTARZIERI_CENTRU.map((x) => Number(x.toFixed(2)))).toEqual([13.93, -0.71])
  })

  it('urmele: preluarea porneste la 0, arhiva la -4,7 s; capul are decalajul sensului sau', () => {
    expect(intarziereUrma('preluare', false)).toBe(0)
    expect(intarziereUrma('arhiva', false)).toBe(-4.7)
    expect(intarziereUrma('preluare', true)).toBeCloseTo(-0.07, 6)
    expect(intarziereUrma('arhiva', true)).toBeCloseTo(-4.7 - 3.01, 6)
  })

  it('martor POZITIV: un nod mutat pe alt unghi e prins de tabelul de mana', () => {
    const gresit = { x: 194 + 121, y: 210 }
    const f = FIGURA['capat-stanga']
    expect(Math.abs(gresit.x - f.x)).toBeGreaterThan(1)
  })
})

describe('eroul randat pe server: starea statica', () => {
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

  it('doua inele cu cate o urma si un cap, cu sensul si intarzierea fiecaruia in HTML', () => {
    expect(erou.match(/data-inel-figura="/g)).toHaveLength(2)
    expect(erou.match(/data-urma=""/g)).toHaveLength(2)
    expect(erou.match(/data-cometa=""/g)).toHaveLength(2)
    expect(erou).toContain('animation-delay:0s;animation-direction:reverse')
    expect(erou).toContain('animation-delay:-4.7s;animation-direction:normal')
    expect(erou).toContain('animation-delay:-0.07s;animation-direction:reverse')
    expect(erou).toContain('animation-delay:-7.71s;animation-direction:normal')
  })

  it('nodurile stau la procentele figurii, fiecare cu inelul lui de puls', () => {
    for (const stil of [
      'left:30.31%;top:21.19%',
      'left:11.41%;top:50.00%',
      'left:30.31%;top:78.81%',
      'left:69.69%;top:21.19%',
      'left:88.59%;top:50.00%',
      'left:69.69%;top:78.81%',
    ]) {
      expect(erou).toContain(stil)
    }
    expect(erou.match(/data-nod="/g)).toHaveLength(6)
    // 6 noduri + 2 inele ale centrului.
    expect(erou.match(/data-inel-puls=""/g)).toHaveLength(8)
  })

  it('etichetele: lobii si nodurile platformei, iar figura poarta eticheta ei accesibila', () => {
    for (const t of [EROU.bucla.lobStanga, EROU.bucla.lobDreapta, ...EROU.bucla.noduri.map((n) => n.eticheta)]) {
      expect(erou).toContain('>' + t + '<')
    }
    expect(erou).toContain('role="img" aria-label="' + EROU.bucla.etichetaFigura + '"')
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
