// Iconitele-forma ale eroului cinema (functionalitati__sablon.md §4.1, "Active de produs de noi"):
// conturul in care se aseaza foile de hartie. Desenate de noi pe grila de 24 (ca setul Lucide al
// site-ului), din trasaturi simple: linii, arce, poligoane. Nimic din desenele referintei.
//
// Fiecare forma e o lista de TRASEE (linii frante, in coordonatele grilei, y in jos) si o UNITATE:
// cate unitati de scena are o celula a grilei. Unitatea e aleasa ca forma asezata sa aiba marimea
// masurata la referinta la 1440 x 900 (fisa §4.1 si fisele paginilor, fara text, +-25 px):
//   lupa     ~576 x 595   (cautare-ai)        fulger   ~533 x 715   (automatizari-ai)
//   persoane ~599 x 558   (portal-clienti)    restul: 450-624 x 427-731 (cinema-2 le poate regla)
// Calculul: la 1440 x 900 camera (34 de grade, distanta 13) vede 7,95 unitati pe 900 px, deci 113,2 px
// pe unitate; grupul are scara 0,82; foile adauga ~40 px cutiei. Unitatile au fost apoi potrivite pe
// cutia MASURATA a formei asezate (aceeasi sonda ca la referinta, 25.09): lupa 582 x 586, fulger
// 541 x 714, persoane 593 x 558, toate in +-10 px de referinta.
//
// O forma noua (felia cinema-2 sau alta) se adauga aici, cu aceeasi constructie, sau se da direct
// componentei `FormaHartii` prin proprietatea `forma` ca obiect `FormaIconita`.

export type Punct = readonly [number, number];
export type Traseu = readonly Punct[];

export type FormaIconita = {
  /** Traseele conturului, pe grila de 24 (x la dreapta, y in jos). */
  trasee: readonly Traseu[];
  /** Unitati de scena pe o celula a grilei. */
  unitate: number;
};

/** Un arc de cerc ca linie franta: centru, raza, unghiuri in grade (0 = dreapta, sensul acelor). */
export function arc(cx: number, cy: number, r: number, dela: number, panaLa: number, segmente = 48): Punct[] {
  const puncte: Punct[] = [];
  for (let i = 0; i <= segmente; i++) {
    const u = ((dela + ((panaLa - dela) * i) / segmente) * Math.PI) / 180;
    puncte.push([cx + r * Math.cos(u), cy + r * Math.sin(u)]);
  }
  return puncte;
}

/** Lupa cu un plus in lentila (cautare-ai). */
export const LUPA: FormaIconita = {
  trasee: [
    arc(10.5, 10.5, 7.5, 0, 360, 72),
    [
      [15.9, 15.9],
      [21, 21],
    ],
    [
      [10.5, 7],
      [10.5, 14],
    ],
    [
      [7, 10.5],
      [14, 10.5],
    ],
  ],
  unitate: 0.334,
};

/** Fulgerul (automatizari-ai): un zigzag inchis, mai inalt decat lat. */
export const FULGER: FormaIconita = {
  trasee: [
    [
      [13.2, 2],
      [4.7, 14],
      [12, 14],
      [10.8, 22],
      [19.3, 10],
      [12, 10],
      [13.2, 2],
    ],
  ],
  unitate: 0.373,
};

/** Doua persoane (portal-clienti): capetele si umerii, a doua persoana pe jumatate in spate. */
export const PERSOANE: FormaIconita = {
  trasee: [
    arc(9, 7.5, 4, 0, 360, 56),
    [[2.5, 21], ...arc(6.5, 19, 4, 180, 270, 16), [11.5, 15], ...arc(11.5, 19, 4, 270, 360, 16), [15.5, 21]],
    arc(16, 7.5, 4, -70, 70, 24),
    [[18.6, 15.3], ...arc(18, 19, 3.7, 280, 360, 12), [21.7, 21]],
  ],
  unitate: 0.31,
};

/** Documentul cu coltul indoit si doua randuri (e-facturi-si-avize). */
export const DOCUMENT: FormaIconita = {
  trasee: [
    [
      [6, 2],
      [14, 2],
      [20, 8],
      [20, 22],
      [6, 22],
      [6, 2],
    ],
    [
      [14, 2],
      [14, 8],
      [20, 8],
    ],
    [
      [9, 13],
      [17, 13],
    ],
    [
      [9, 17],
      [17, 17],
    ],
  ],
  unitate: 0.33,
};

/** Telefonul (aplicatie-mobila): rama cu colturi rotunjite si linia de jos. */
export const TELEFON: FormaIconita = {
  trasee: [
    [
      ...arc(9, 4, 2, 180, 270, 8),
      ...arc(15, 4, 2, 270, 360, 8),
      ...arc(15, 20, 2, 0, 90, 8),
      ...arc(9, 20, 2, 90, 180, 8),
      [7, 4],
    ],
    [
      [11, 18.5],
      [13, 18.5],
    ],
  ],
  unitate: 0.34,
};

/** Semnatura ondulata pe o linie de baza (semnatura-calificata). */
export const SEMNATURA: FormaIconita = {
  trasee: [
    Array.from({ length: 49 }, (_, i): Punct => {
      const x = 2 + (20 * i) / 48;
      return [x, 12 - 4 * Math.sin((i / 48) * Math.PI * 3) * (1 - i / 80)];
    }),
    [
      [2, 20],
      [22, 20],
    ],
  ],
  unitate: 0.3,
};

export const FORME = {
  lupa: LUPA,
  fulger: FULGER,
  persoane: PERSOANE,
  document: DOCUMENT,
  telefon: TELEFON,
  semnatura: SEMNATURA,
} as const;

export type NumeForma = keyof typeof FORME;
