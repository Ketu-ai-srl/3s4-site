import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import Acasa from '../src/app/page'
import FunctionalitatiAcasa from '../src/components/functionalitati-acasa/FunctionalitatiAcasa'
import {
  cardDinProgres,
  pasDupaPraguri,
  PRAG_JOS,
  PRAG_SUS,
  progresPista,
  tintaPunct,
  translatieBanda,
} from '../src/components/functionalitati-acasa/derulare'
import { ESTOMPARE_MAXIMA, inaltimeEstompare } from '../src/components/functionalitati-acasa/estompare'
import { deplasareRand, MARGINE_FOCUS } from '../src/components/functionalitati-acasa/MachetaCautare'
import {
  amesteca,
  BARA,
  CARD,
  DEZORDINE,
  dezordine,
  distantaCamera,
  FOAIE,
  FOI,
  foiInTeanc,
  iesireCubica,
  inaltimeBara,
  pozaDezordine,
  pozaTeanc,
  replanificaFoi,
  STARE_FINALA,
  TEANC,
  TRANZITIE,
  valoareLa,
  type Animatie,
  type FoaieDezordine,
} from '../src/components/functionalitati-acasa/panza'
import { creeazaAleator } from '../src/components/scena3d/aleator'
import { SAMANTA_PANZA } from '../src/components/functionalitati-acasa/PasiFunctionalitati'
import { FUNCTIONALITATI } from '../src/content/acasa'
import { MACHETA_CAUTARE, MACHETA_PORTAL, MACHETA_REGISTRU } from '../src/content/acasa-functionalitati'
import registruFelie from '../src/content/afirmatii/functionalitati-acasa.json'

/**
 * Probele feliei `functionalitati-acasa` care nu cer browser: forma statica randata pe server,
 * continutul machetelor, pragurile de derulare si matematica panzei 3D.
 *
 * Ce apara, pe scurt: HTML-ul servit e forma statica a ciotului (fara pista, fara pas activ,
 * machetele in starea finala), iar regulile fisei (histerezis 40 / 60, pista 0,34 / 0,67, teancul
 * 4 / 8 / 12, decalajul de 70 ms) sunt cifre verificate, nu constante copiate in proba: fiecare
 * regula e probata pe marginea ei, de ambele parti.
 */

const html = renderToStaticMarkup(createElement(FunctionalitatiAcasa))
const pagina = renderToStaticMarkup(createElement(Acasa))

/** Toate valorile unui atribut, in ordinea din HTML. */
const valori = (text: string, atribut: string) => [...text.matchAll(new RegExp('\\s' + atribut + '="([^"]*)"', 'g'))].map((m) => m[1])

/** Id-urile care apar de mai multe ori. */
function duplicate(ids: string[]): string[] {
  const vazute = new Set<string>()
  const dubluri = new Set<string>()
  for (const id of ids) (vazute.has(id) ? dubluri : vazute).add(id)
  return [...dubluri]
}

describe('forma statica, randata pe server', () => {
  it('are exact 9 titluri si paragrafe: machetele nu adauga niciunul (proba fundatie-start le numara)', () => {
    const numar = (html.match(/<(h2|h3|p)\b/g) ?? []).length
    expect(numar).toBe(9)
  })

  it('nu are aria-expanded: pe server randurile machetei 1 nu promit nimic, iar intrebarile raman primele', () => {
    expect(valori(html, 'aria-expanded')).toEqual([])
    // Martorul: in pagina intreaga, primul aria-expanded e al intrebarilor, deschis.
    expect(valori(pagina, 'aria-expanded')[0]).toBe('true')
  })

  it('nu are pista si nici pas activ: fara JavaScript, cardurile raman unul sub altul', () => {
    expect(html).not.toContain('data-pista')
    expect(html).not.toContain('data-js')
    // Niciun pas marcat activ (sloturile cardului au marcajul lor, separat).
    expect(html).not.toMatch(/<li[^>]*data-activ/)
    expect(html).toMatch(/<li[^>]*data-step="0"/)
  })

  it('cardul lipit arata macheta 1; sloturile 2 si 3 sunt inerte', () => {
    const sloturi = [...html.matchAll(/<div class="[^"]*slot[^"]*"([^>]*)>/g)].map((m) => m[1])
    expect(sloturi).toHaveLength(3)
    expect(sloturi[0]).not.toContain('inert')
    expect(sloturi[1]).toContain('inert')
    expect(sloturi[2]).toContain('inert')
  })

  it('machetele sunt in starea finala: randul 1 deschis, prima persoana aleasa, 4 verificari', () => {
    // Fiecare macheta apare de doua ori: in cardul pistei si in cardul lipit.
    expect(valori(html, 'aria-pressed')).toEqual(['true', 'false', 'false', 'true', 'false', 'false'])
    const ascunse = valori(html, 'aria-hidden').filter((v) => v === 'true').length
    // 2 rezumate inchise in fiecare dintre cele 2 instante ale machetei 1, plus iconitele decorative.
    expect(ascunse).toBeGreaterThanOrEqual(4)
    expect(valori(html, 'data-verificari')).toEqual(['4', '4'])
    for (const v of MACHETA_REGISTRU.verificari) expect(html.split(v.text).length - 1).toBe(2)
  })

  it('fiecare macheta isi declara datele fictive (plan D9)', () => {
    const legende = [...html.matchAll(/<figcaption[^>]*>([^<]*)<\/figcaption>/g)].map((m) => m[1])
    expect(legende).toHaveLength(6)
    for (const l of legende) expect(l).toMatch(/^Exemplu cu date fictive: /)
  })

  it('nu repeta niciun id, desi machetele apar de doua ori', () => {
    const ids = valori(html, 'id')
    expect(ids.length).toBeGreaterThan(4)
    expect(duplicate(ids)).toEqual([])
  })

  it('martor POZITIV: detectorul de dubluri prinde un id repetat', () => {
    expect(duplicate(['a', 'b', 'a'])).toEqual(['a'])
    expect(duplicate(['a', 'b'])).toEqual([])
  })

  it('textele pasilor vin din contractul startului, o singura data', () => {
    for (const p of FUNCTIONALITATI.pasi) {
      expect(html.split(p.titlu).length - 1).toBe(1)
      expect(html.split(p.paragraf).length - 1).toBe(1)
    }
  })

  it('punctele pistei au etichete in romana', () => {
    const etichete = valori(html, 'aria-label').filter((v) => v.startsWith('Pasul'))
    expect(etichete).toEqual(FUNCTIONALITATI.pasi.map((p, i) => 'Pasul ' + (i + 1) + ' din 3: ' + p.eticheta))
  })
})

/** Ce 3S nu are azi (plan D4c) sau nu poate sustine: nu apare in machete. */
const INTERZISE = [/semn[aă]tur/i, /\blegea\b.*\b20\d\d\b/i, /\b20\d\d\b.*\blegea\b/i]

function afirmatiiInterzise(texte: string[]): string[] {
  return texte.filter((t) => INTERZISE.some((r) => r.test(t)))
}

/** Termenele aratate care n-au o intrare in registrul de afirmatii ("... de N ani"). */
function termeneFaraIntrare(termene: string[], registru: { text: string }[]): string[] {
  return [...new Set(termene)].filter((t) => !registru.some((i) => i.text.includes(' de ' + t)))
}

function texteMachete(): string[] {
  return [
    MACHETA_CAUTARE.eticheta,
    MACHETA_CAUTARE.intrebare,
    MACHETA_CAUTARE.gasite,
    ...Object.values(MACHETA_CAUTARE.insigne),
    ...MACHETA_CAUTARE.randuri.flatMap((r) => [r.fisier, r.tip.text, r.rezumat.titlu, r.rezumat.text]),
    MACHETA_PORTAL.eticheta,
    MACHETA_PORTAL.cip,
    MACHETA_PORTAL.subsol.stanga,
    MACHETA_PORTAL.subsol.dreapta,
    ...MACHETA_PORTAL.persoane.flatMap((p) => [p.nume, p.rol, ...p.foldere.map((f) => f.nume)]),
    MACHETA_REGISTRU.eticheta,
    MACHETA_REGISTRU.insigna,
    ...MACHETA_REGISTRU.randuri.flatMap((r) => [r.fisier, r.tip.text, r.termen]),
    ...MACHETA_REGISTRU.verificari.map((v) => v.text),
  ]
}

describe('continutul machetelor', () => {
  it('nu promite semnatura calificata si nici o lege nenumita (plan D4c)', () => {
    expect(afirmatiiInterzise(texteMachete())).toEqual([])
  })

  it('martor POZITIV: randurile referintei pe care nu le luam sunt prinse', () => {
    expect(afirmatiiInterzise(['Semnătură electronică validă', 'Pregătit pentru legea din 2026'])).toHaveLength(2)
  })

  it('termenele de pastrare din registru: forma "N ani", declarate ilustrative, fiecare cu intrare in registrul de afirmatii', () => {
    // Termenele sunt o relatare neverificata (antetul continutului): pagina nu le da drept regula,
    // iar registrul feliei le tine la vedere pana le confirma cineva la sursa.
    for (const r of MACHETA_REGISTRU.randuri) expect(r.termen).toMatch(/^\d+ ani$/)
    expect(MACHETA_REGISTRU.declaratie).toMatch(/termen de păstrare ilustrativ/)
    expect(termeneFaraIntrare(MACHETA_REGISTRU.randuri.map((r) => r.termen), registruFelie)).toEqual([])
    for (const i of registruFelie) expect(i.unde).toBe('src/content/acasa-functionalitati.ts')
  })

  it('martor POZITIV: un termen fara intrare in registru e prins', () => {
    expect(termeneFaraIntrare(['5 ani', '7 ani'], registruFelie)).toEqual(['7 ani'])
  })

  it('portalul: 4 dosare pe persoana, intai cele cu acces; echipa le vede pe toate (fisa §6)', () => {
    for (const p of MACHETA_PORTAL.persoane) {
      const acces = p.foldere.map((f) => f.numar !== null)
      expect(acces.indexOf(false) === -1 || acces.slice(acces.indexOf(false)).every((a) => !a)).toBe(true)
    }
    expect(MACHETA_PORTAL.persoane.map((p) => p.foldere.filter((f) => f.numar !== null).length)).toEqual([2, 2, 4])
  })

  it('cautarea: 3 acte, bifa "scanat" numai pe cele scanate (doua PDF-uri), rezumat pe 1-2 propozitii', () => {
    expect(MACHETA_CAUTARE.randuri.map((r) => r.scanat)).toEqual([true, true, false])
    for (const r of MACHETA_CAUTARE.randuri) {
      expect(r.rezumat.text.length).toBeGreaterThan(60)
      expect(r.rezumat.text.length).toBeLessThan(130)
    }
  })
})

/** Cea mai inalta estompare de jos: cazul cel mai greu pentru randul focalizat. */
const ESTOMPARE = ESTOMPARE_MAXIMA

describe('estomparea de jos: numai peste randul taiat, niciodata peste ceva intreg (fisa §14.7)', () => {
  // Cifrele sunt masurate pe pixeli: la 390 (rama 278), data randului 2 are marginea de jos a
  // continutului la 3,7 px de rama; la 360, primul rand al registrului la 0,58 px.
  it('fara niciun rand taiat, estomparea lipseste: n-are ce inmuia', () => {
    expect(inaltimeEstompare(278, [278 - 3.7], 0)).toBe(0)
  })

  it('cu un rand taiat, estomparea sta sub cel mai de jos lucru intreg', () => {
    // 1440, randul 3 deschis: cel mai jos rand intreg la 14,19 px de margine -> plafonul de 12.
    expect(inaltimeEstompare(412.4, [412.4 - 14.19, 300], 1)).toBe(12)
    // 390, randul 1 deschis: primul rand al rezumatului intreg la 9,19 px -> 9.
    expect(inaltimeEstompare(278, [278 - 9.19], 1)).toBe(9)
  })

  it('martor NEGATIV: un rand intreg lipit de margine nu lasa loc de estompare', () => {
    expect(inaltimeEstompare(254, [254 - 0.58], 1)).toBe(0)
    // Nici un buton intreg al carui contur (+4 px) ajunge la margine.
    expect(inaltimeEstompare(278, [278 - 20, 278 - 1 + 4], 1)).toBe(0)
  })

  it('plafonul e cel al fisei si al criticii (12 px), sub inaltimea unui rand de macheta', () => {
    expect(ESTOMPARE_MAXIMA).toBe(12)
    expect(inaltimeEstompare(500, [], 3)).toBe(ESTOMPARE_MAXIMA)
  })
})

describe('macheta 1: randul focalizat de la tastatura se vede intreg', () => {
  // Cifrele sunt ale machetei: randul inchis are 76,7 (+1 chenar), lista incepe la ~137; rama are
  // 412,4 in cardul lipit si 278 pe pista; estomparea de jos, in cazul cel mai greu, la plafon.

  it('un rand care incape deasupra estomparii nu muta nimic', () => {
    expect(deplasareRand(137.4, 76.7, 412.4, ESTOMPARE)).toBe(0)
    // Randul 3 cu primele doua inchise, in cardul lipit: incape.
    expect(deplasareRand(137.4 + 2 * 77.7, 76.7, 412.4, ESTOMPARE)).toBeLessThanOrEqual(MARGINE_FOCUS)
  })

  it('pe pista, randul 3 urca exact cat sa se vada cu conturul lui, deasupra estomparii', () => {
    const sus = 137.4 + 2 * 77.7
    const d = deplasareRand(sus, 76.7, 278, ESTOMPARE)
    expect(sus - d + 76.7 + MARGINE_FOCUS).toBeLessThanOrEqual(278 - ESTOMPARE)
    expect(sus - d + 76.7 + MARGINE_FOCUS).toBeGreaterThan(278 - ESTOMPARE - 1)
  })

  it('un rand mai inalt decat locul isi arata varful, nu fundul', () => {
    expect(deplasareRand(300, 300, 278, ESTOMPARE)).toBe(300 - MARGINE_FOCUS)
  })
})

describe('pragurile pasului activ (fisa §9: histerezis 40% / 60%)', () => {
  const vh = 900
  // Blocurile au 80vh; pozitia se da prin marginea de sus a blocului 2.
  const topuri = (sus2: number) => [sus2 - 720, sus2, sus2 + 720]

  it('in jos, pasul 2 porneste cand blocul lui ajunge la 40% din fereastra, nu inainte', () => {
    expect(pasDupaPraguri(0, topuri(PRAG_JOS * vh + 1), vh)).toBe(0)
    expect(pasDupaPraguri(0, topuri(PRAG_JOS * vh), vh)).toBe(1)
  })

  it('in sus, pasul 1 revine cand blocul CURENT coboara la 60% din fereastra, nu inainte', () => {
    expect(pasDupaPraguri(1, topuri(PRAG_SUS * vh - 1), vh)).toBe(1)
    expect(pasDupaPraguri(1, topuri(PRAG_SUS * vh), vh)).toBe(0)
  })

  it('martor NEGATIV: in banda de histerezis, pasul ramane cel de dinainte, in ambele sensuri', () => {
    const mijloc = topuri(0.5 * vh)
    expect(pasDupaPraguri(0, mijloc, vh)).toBe(0)
    expect(pasDupaPraguri(1, mijloc, vh)).toBe(1)
  })

  it('un salt peste mai multi pasi ajunge direct la pasul potrivit', () => {
    expect(pasDupaPraguri(0, [-2000, -1280, -560], vh)).toBe(2)
    expect(pasDupaPraguri(2, [800, 1520, 2240], vh)).toBe(0)
  })
})

describe('pista de mobil (fisa §11)', () => {
  it('progresul e cat s-a parcurs din cursa, limitat la 0..1', () => {
    expect(progresPista(100, 2532, 844)).toBe(0)
    expect(progresPista(-844, 2532, 844)).toBe(0.5)
    expect(progresPista(-5000, 2532, 844)).toBe(1)
    expect(progresPista(-10, 800, 844)).toBe(0)
  })

  it('cardul activ se schimba la 0,34 si la 0,67', () => {
    expect([0, 0.339, 0.34, 0.669, 0.67, 1].map(cardDinProgres)).toEqual([0, 0, 1, 1, 2, 2])
  })

  it('banda se muta liniar pana la 2 ferestre (2/3 din latimea ei)', () => {
    expect(translatieBanda(0)).toBe('translate3d(0%, 0px, 0px)')
    expect(translatieBanda(0.5)).toBe('translate3d(-33.3333%, 0px, 0px)')
    expect(translatieBanda(1)).toBe('translate3d(-66.6667%, 0px, 0px)')
    expect(translatieBanda(3)).toBe('translate3d(-66.6667%, 0px, 0px)')
  })

  it('punctul n deruleaza pana cand cardul n sta exact in fereastra (fisa §14.12)', () => {
    expect([0, 1, 2].map((i) => tintaPunct(i, 2630, 1688))).toEqual([2630, 3474, 4318])
    // Progresul la tinta fiecarui punct aliniaza exact cardul: 0, 1/2, 1.
    expect([0, 1, 2].map((i) => progresPista(2630 - tintaPunct(i, 2630, 1688), 2532, 844))).toEqual([0, 0.5, 1])
  })
})

/**
 * O foaie din dezordine atinge teancul complet sau bara, pe ecran? Calcul INDEPENDENT de generator
 * (care lucreaza cu cutii aliniate si o margine de siguranta): colturile foii rotite pe Z, la capetele
 * leganatului si ale micro-rotatiei, proiectate cu perspectiva camerei, apoi separarea pe axe intre
 * patrulater si dreptunghiul teancului + barei.
 */
function atingeTeancul(f: FoaieDezordine): boolean {
  const d = distantaCamera()
  const margine = CARD.latime / 2
  const scaraTeanc = d / (d - (TEANC.z + (FOI - 1) * TEANC.zPas))
  const zona = {
    x1: margine + BARA.x - BARA.grosime / 2,
    x2: (margine + TEANC.x + FOAIE.latime / 2 + 1) * scaraTeanc,
    y1: (TEANC.baza - FOAIE.inaltime / 2 - 1) * scaraTeanc,
    y2: (TEANC.baza + (FOI - 1) * TEANC.pas + FOAIE.inaltime / 2 + 1) * scaraTeanc,
  }
  const x = margine + DEZORDINE.de + f.fx * (DEZORDINE.pana - DEZORDINE.de)
  const y = (0.5 - f.fy) * (CARD.inaltime - FOAIE.inaltime)
  const scara = d / (d - f.z)
  const h = [FOAIE.latime / 2, FOAIE.inaltime / 2]
  for (const leganat of [-1, -0.5, 0, 0.5, 1]) {
    for (const micro of [-0.03, 0, 0.03]) {
      const c = Math.cos(f.rz + micro)
      const s = Math.sin(f.rz + micro)
      const colturi = [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([a, b]) => [
        (x + a * h[0] * c - b * h[1] * s) * scara,
        (y + leganat * f.amplitudine + a * h[0] * s + b * h[1] * c) * scara,
      ])
      if (seIntersecteaza(colturi, zona)) return true
    }
  }
  return false
}

/** Separarea pe axe: un patrulater convex si un dreptunghi aliniat se ating daca nicio axa nu-i desparte. */
function seIntersecteaza(p: number[][], z: { x1: number; x2: number; y1: number; y2: number }): boolean {
  const dreptunghi = [[z.x1, z.y1], [z.x2, z.y1], [z.x2, z.y2], [z.x1, z.y2]]
  const axe = [[1, 0], [0, 1], [p[1][1] - p[0][1], p[0][0] - p[1][0]], [p[2][1] - p[1][1], p[1][0] - p[2][0]]]
  for (const [ax, ay] of axe) {
    const proiectie = (pts: number[][]) => pts.map(([px, py]) => px * ax + py * ay)
    const a = proiectie(p)
    const b = proiectie(dreptunghi)
    if (Math.max(...a) < Math.min(...b) || Math.max(...b) < Math.min(...a)) return false
  }
  return true
}

describe('panza 3D (fisa §8)', () => {
  it('teancul are 4 / 8 / 12 foi, iar bara 1/3, 2/3, 3/3 din 118', () => {
    expect([0, 1, 2].map(foiInTeanc)).toEqual([4, 8, 12])
    expect([0, 1, 2].map((p) => Math.round(inaltimeBara(p) * 100) / 100)).toEqual([39.33, 78.67, 118])
  })

  it('curba ease-out cubic', () => {
    expect(iesireCubica(0)).toBe(0)
    expect(iesireCubica(0.5)).toBe(0.875)
    expect(iesireCubica(1)).toBe(1)
  })

  it('dezordinea e aceeasi la aceeasi samanta si sta in intervalele masurate', () => {
    const a = dezordine(creeazaAleator(SAMANTA_PANZA))
    expect(dezordine(creeazaAleator(SAMANTA_PANZA))).toEqual(a)
    expect(a).toHaveLength(FOI)
    const margine = CARD.latime / 2
    for (const f of a) {
      const p = pozaDezordine(f, 0, margine, CARD.inaltime)
      // Banda e a CENTRELOR foilor (fisa §8).
      expect(p.x).toBeGreaterThanOrEqual(margine + DEZORDINE.de - 0.001)
      expect(p.x).toBeLessThanOrEqual(margine + DEZORDINE.pana + 0.001)
      expect(Math.abs(p.y)).toBeLessThanOrEqual(CARD.inaltime / 2)
      expect(f.z).toBeGreaterThanOrEqual(DEZORDINE.zMin)
      expect(f.z).toBeLessThanOrEqual(DEZORDINE.zMax)
      for (const r of [f.rx, f.ry, f.rz]) expect(Math.abs(r)).toBeLessThanOrEqual(DEZORDINE.rotatie)
      expect(f.amplitudine).toBeGreaterThanOrEqual(4)
      expect(f.amplitudine).toBeLessThanOrEqual(6)
    }
  })

  it('foile din dezordine acopera toata inaltimea, si la pasul 1 (8 foi), si la pasul 2 (4 foi)', () => {
    const a = dezordine(creeazaAleator(SAMANTA_PANZA))
    const optimi = a.slice(foiInTeanc(0)).map((f) => Math.floor(f.fy * 8))
    expect([...optimi].sort()).toEqual([0, 1, 2, 3, 4, 5, 6, 7])
    const sferturi = a.slice(foiInTeanc(1)).map((f) => Math.floor(f.fy * 4))
    expect([...sferturi].sort()).toEqual([0, 1, 2, 3])
  })

  it('nicio foaie din dezordine nu cade peste teanc sau peste bara, pe ecran (masurat pe colturi, alt calcul decat generatorul)', () => {
    for (const samanta of [SAMANTA_PANZA, 1, 2, 3, 4, 5]) {
      const a = dezordine(creeazaAleator(samanta))
      // Foile 0-3 nu ies niciodata din teanc; se verifica cele 8 care se vad.
      const peste = a.slice(foiInTeanc(0)).filter((f) => atingeTeancul(f))
      expect(peste, 'samanta ' + samanta).toEqual([])
    }
  })

  it('martor POZITIV: o foaie asezata pe coloana teancului e prinsa de verificarea pe colturi', () => {
    // x la 52 de marginea cardului (coloana), la mijlocul teancului, fara inclinare.
    const peColoana: FoaieDezordine = {
      fx: (TEANC.x - DEZORDINE.de) / (DEZORDINE.pana - DEZORDINE.de),
      fy: 0.5 - (TEANC.baza + 5 * TEANC.pas) / (CARD.inaltime - FOAIE.inaltime),
      z: 0, rx: 0, ry: 0, rz: 0, amplitudine: 4, viteza: 0.5, faza: 0,
    }
    expect(atingeTeancul(peColoana)).toBe(true)
    // Martor negativ: aceeasi foaie la capatul din dreapta al benzii e libera.
    expect(atingeTeancul({ ...peColoana, fx: 1 })).toBe(false)
  })

  it('martor POZITIV: alta samanta da alta asezare', () => {
    expect(dezordine(creeazaAleator(48))).not.toEqual(dezordine(creeazaAleator(47)))
  })

  it('miscarea redusa deseneaza starea finala: teancul de 12 foi si bara plina (COMPONENTE §2.5)', () => {
    expect(STARE_FINALA).toEqual({ foi: foiInTeanc(2), bara: inaltimeBara(2) })
  })

  it('teancul: coloana la 52 px de card, de la 66 px sub centru, cu 9,5 px intre foi', () => {
    // La t = 0 leganatul foii 0 e zero.
    const p0 = pozaTeanc(0, 0, 259)
    expect(p0).toMatchObject({ x: 259 + TEANC.x, y: TEANC.baza, z: TEANC.z, ry: TEANC.rotY, rz: TEANC.rotZ })
    expect(pozaTeanc(11, 0, 259).z).toBeCloseTo(-12 + 1.4 * 11, 6)
    expect(BARA).toMatchObject({ x: 20, baza: -74, inaltime: 118, grosime: 3 })
  })

  it('la trecerea 4 -> 8 zboara numai foile 5-8, la 70 ms una dupa alta, spre teanc', () => {
    const repaus: Animatie[] = Array.from({ length: FOI }, (_, i) => ({ de: i < 4 ? 1 : 0, spre: i < 4 ? 1 : 0, start: 0 }))
    const noi = replanificaFoi(repaus, 4, 8, 1000)
    expect(noi.slice(0, 4)).toEqual(repaus.slice(0, 4))
    expect(noi.slice(8)).toEqual(repaus.slice(8))
    expect(noi.slice(4, 8).map((a) => a.start)).toEqual([1000, 1070, 1140, 1210])
    expect(noi.slice(4, 8).every((a) => a.de === 0 && a.spre === 1)).toBe(true)
    // Inapoi, 8 -> 4: aceleasi foi, spre dezordine.
    const inapoi = replanificaFoi(noi, 8, 4, 5000)
    expect(inapoi.slice(4, 8).every((a) => a.spre === 0)).toBe(true)
  })

  it('o schimbare in mijlocul zborului pleaca din locul in care e foaia, fara salt', () => {
    const zbor: Animatie[] = [{ de: 0, spre: 1, start: 0 }]
    const laMijloc = valoareLa(zbor[0], TRANZITIE.foaie / 2, TRANZITIE.foaie)
    expect(laMijloc).toBe(0.875)
    const intors = replanificaFoi(zbor, 1, 0, TRANZITIE.foaie / 2)
    expect(intors[0].de).toBe(0.875)
    expect(intors[0].spre).toBe(0)
  })

  it('amestecul trece liniar intre doua poze', () => {
    const a = { x: 0, y: 0, z: 0, rx: 0, ry: 0, rz: 0 }
    const b = { x: 10, y: -20, z: 4, rx: 1, ry: -1, rz: 0.5 }
    expect(amesteca(a, b, 0)).toEqual(a)
    expect(amesteca(a, b, 1)).toEqual(b)
    expect(amesteca(a, b, 0.5)).toEqual({ x: 5, y: -10, z: 2, rx: 0.5, ry: -0.5, rz: 0.25 })
  })
})
