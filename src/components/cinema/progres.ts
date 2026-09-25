// Logica pura a cadrului cinema, fara DOM: progresul sectiunilor, formulele de aparitie, paralaxa
// grilei si ceasul scrierii. Sta separat ca sa poata fi probata cu cifre (`tests/cinema-1.test.ts`).
//
// PROGRESUL p (functionalitati__sablon.md §1.4): masura comuna a tuturor efectelor legate de derulare,
//
//     p = (0,5 x inaltimea ferestrei - varful sectiunii) / inaltimea sectiunii, taiat la [0, 1].
//
// p = 0 cand varful sectiunii atinge mijlocul ferestrei, 0,5 cand mijlocul sectiunii e in mijlocul
// ferestrei, 1 cand baza sectiunii trece de mijloc. Toate valorile "p" din fise sunt in unitatea asta.
//
// STAREA STATICA e p = 1 (fisa §6: la miscare redusa "toate progresele sunt fortate la 1"). Tot ea e
// starea din HTML-ul servit: fara JavaScript pagina e completa, cu fiecare piesa in forma ei finala.

/** Taie o valoare la [min, max]. */
export function limiteaza(v: number, min = 0, max = 1): number {
  if (Number.isNaN(v)) return min;
  return Math.min(max, Math.max(min, v));
}

/** Progresul unei sectiuni: `top` si `inaltime` in px, fata de fereastra; `vh` inaltimea ferestrei. */
export function progresSectiune(top: number, inaltime: number, vh: number): number {
  if (!(inaltime > 0)) return 0;
  return limiteaza((0.5 * vh - top) / inaltime);
}

/** Progresul rotunjit la 4 zecimale: sub pragul asta o schimbare nu se vede si nu merita o pictare. */
export function rotunjesteProgres(p: number): number {
  return Math.round(limiteaza(p) * 10000) / 10000;
}

/**
 * Aparitia proportionala (sablon §4.2): opacitate = min(1, panta x (p - prag)), taiata la [0, 1].
 * Anxietatea are panta 2 si prag 0; pivotul panta 2 si prag 0,05.
 */
export function aparitie(p: number, panta = 2, prag = 0): number {
  return limiteaza(panta * (p - prag));
}

/**
 * Lista in trepte (sablon §4.2): randul `i` porneste de la opacitatea `baza` si se aprinde cu `panta`
 * de la pragul `start + pas x i`.
 */
export function treapta(p: number, i: number, pas: number, panta: number, baza = 0, start = 0): number {
  return Math.max(baza, limiteaza(panta * (p - start - pas * i)));
}

/**
 * Deriva spre dreapta a unui rand deja aprins: `translateX(max(0, amplitudine x (p - prag)))`.
 * Randurile vechi ajung mai la dreapta decat cele noi, deci lista arata ca o scara.
 */
export function deriva(p: number, amplitudine: number, prag: number): number {
  return Math.max(0, amplitudine * (p - prag));
}

// ---------------------------------------------------------------------------------------------
// Paralaxa grilei de fundal (sablon §1.1)
// ---------------------------------------------------------------------------------------------

/** Latura celulei grilei, in px. */
export const CELULA_GRILA = 72;
/** Factorul paralaxei: grila urca cu 18% din viteza derularii (promo: 20%). */
export const FACTOR_PARALAXA = 0.18;

/**
 * Deplasarea stratului de grila, in px, pentru o derulare data.
 *
 * La referinta grila e un strat fix, inalt cat fereastra plus 120vh, mutat cu `-0,18 x scrollY`: dupa
 * ~5000 px de derulare iese complet din ecran si fundalul ramane negru (defect numit de fisa promo).
 * La 3S grila acopera toata pagina, iar miscarea ramane aceeasi: grila e periodica, cu perioada o
 * celula, deci o deplasare de `0,18 x scrollY` si una de `0,18 x scrollY mod 72` arata identic.
 * Stratul are o celula in plus sus si e asezat la -72 px, deci deplasarea intoarsa e in (0, 72].
 */
export function decalajGrila(scrollY: number, factor = FACTOR_PARALAXA, celula = CELULA_GRILA): number {
  const brut = (factor * Math.max(0, scrollY)) % celula;
  return celula - brut;
}

// ---------------------------------------------------------------------------------------------
// Scrierea litera cu litera (sablon §4.1)
// ---------------------------------------------------------------------------------------------

/** Scrierea incepe la 500 ms dupa montare. */
export const INTARZIERE_SCRIERE = 500;
/** Pasul implicit, in ms pe caracter (35 pe cautare-ai si automatizari-ai). */
export const PAS_SCRIERE = 32;

/** Cate caractere sunt scrise la momentul `ms` (de la montare). */
export function caractereScrise(ms: number, lungime: number, pas = PAS_SCRIERE, intarziere = INTARZIERE_SCRIERE): number {
  if (ms < intarziere) return 0;
  return Math.min(lungime, Math.floor((ms - intarziere) / pas) + 1);
}

/** Cat dureaza scrierea intreaga, de la montare. */
export function durataScrierii(lungime: number, pas = PAS_SCRIERE, intarziere = INTARZIERE_SCRIERE): number {
  return intarziere + Math.max(0, lungime - 1) * pas;
}

/**
 * Scrierea legata de derulare (cautare-ai, S5): caractere = floor((p - start) / durata x lungime),
 * deci incepe la p = start si e completa la p = start + durata.
 */
export function caractereDupaProgres(p: number, lungime: number, start: number, durata: number): number {
  if (durata <= 0) return p >= start ? lungime : 0;
  return Math.min(lungime, Math.max(0, Math.floor(((p - start) / durata) * lungime)));
}
