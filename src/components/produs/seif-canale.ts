// Canalele seifului legat de derulare (securitate.md §13, tabelul "Miscarea"; COMPONENTE §4.6).
// Functii pure: componenta `Seif.tsx` le aplica pe elemente, probele le verifica fara browser.
//
// `p` = cat s-a parcurs din cursa sectiunii: 0 cand varful ei atinge varful ferestrei, 1 cand baza
// ei atinge baza ferestrei (cursa = inaltimea sectiunii minus inaltimea ferestrei).
//
//   zavoarele 1 / 2 / 3   0,06-0,20 / 0,13-0,27 / 0,20-0,34   translateX 0 -> -20 px, ease-out cubic
//   roata                 0,24-0,52                           rotate 0 -> 200 grade, ease-out cubic
//   eticheta de stare     de la 0,51                          incuiat -> descuiat
//   usa                   0,52-0,80                           rotateY 0 -> -88 grade, ease-out cubic
//   randurile 1 / 2 / 3   0,62-0,74 / 0,68-0,80 / 0,74-0,86   opacitate 0 -> 1, translateY 14 -> 0, liniar
//   nota si butonul       0,82-0,94                           opacitate 0 -> 1, translateY 10 -> 0, liniar

export type Interval = readonly [number, number];

export const CANALE_SEIF = {
  zavoare: [
    [0.06, 0.2],
    [0.13, 0.27],
    [0.2, 0.34],
  ] as readonly Interval[],
  roata: [0.24, 0.52] as Interval,
  stare: 0.51,
  usa: [0.52, 0.8] as Interval,
  randuri: [
    [0.62, 0.74],
    [0.68, 0.8],
    [0.74, 0.86],
  ] as readonly Interval[],
  final: [0.82, 0.94] as Interval,
} as const;

export const CURSA_ZAVOR = 20;
export const UNGHI_ROATA = 200;
export const UNGHI_USA = -88;
export const URCARE_RAND = 14;
export const URCARE_FINAL = 10;

const intre = (x: number, a: number, b: number) => Math.min(b, Math.max(a, x));

/** Cat s-a parcurs dintr-un interval: 0 inainte, 1 dupa, liniar intre. */
export function progres(p: number, [a, b]: Interval): number {
  return intre((p - a) / (b - a), 0, 1);
}

export function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - intre(t, 0, 1), 3);
}

/** `p` din pozitia sectiunii fata de fereastra (valorile lui `getBoundingClientRect`). */
export function progresSectiune(varf: number, inaltime: number, fereastra: number): number {
  const cursa = inaltime - fereastra;
  if (cursa <= 0) return varf <= 0 ? 1 : 0;
  return intre(-varf / cursa, 0, 1);
}

export type Aparitie = { opacitate: number; y: number };

export type StareSeif = {
  /** Deplasarea fiecarui zavor, in px (negativa: zavorul intra in usa). */
  zavoare: number[];
  roata: number;
  usa: number;
  deschis: boolean;
  randuri: Aparitie[];
  final: Aparitie;
};

function aparitie(p: number, interval: Interval, urcare: number): Aparitie {
  const t = progres(p, interval);
  return { opacitate: t, y: urcare * (1 - t) };
}

export function stareSeif(p: number): StareSeif {
  const c = CANALE_SEIF;
  return {
    zavoare: c.zavoare.map((i) => -CURSA_ZAVOR * easeOutCubic(progres(p, i))),
    roata: UNGHI_ROATA * easeOutCubic(progres(p, c.roata)),
    usa: UNGHI_USA * easeOutCubic(progres(p, c.usa)),
    deschis: p >= c.stare,
    randuri: c.randuri.map((i) => aparitie(p, i, URCARE_RAND)),
    final: aparitie(p, c.final, URCARE_FINAL),
  };
}

/**
 * Netezirea usii dupa un salt de derulare: la referinta usa ajunge la tinta in ~150 ms. Cu o
 * constanta de timp de 38 ms, dupa 150 ms ramane sub 2% din distanta.
 */
export const TAU_USA_MS = 38;

export function pasNetezire(curent: number, tinta: number, dtMs: number): number {
  const k = 1 - Math.exp(-Math.max(0, dtMs) / TAU_USA_MS);
  return curent + (tinta - curent) * k;
}
