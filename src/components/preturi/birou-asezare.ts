// Asezarea dispozitivelor in biroul din primul pliu (preturi.md §7): cate 4 pe masa, mesele pe o
// grila de 3 x 3. Functii pure, fara `three`: le citesc si componenta (contorul, eticheta scenei),
// si scena, si probele.
//
// Ce s-a masurat pe capturile referintei (fisa §7, completat aici din pozitiile picioarelor meselor,
// la 1440 si la 390): la pornire 5 dispozitive, pe doua mese alaturate (una cu 4, una cu 1); la 6,
// "doua mese, una cu 2 si una cu 4"; la 36 (plafonul), noua mese de cate 4, pe trei randuri de cate
// trei. Cele doua mese de la pornire sunt RANDUL DIN MIJLOC, primele doua coloane: la 36 raman exact in
// acelasi loc pe ecran, iar mesele noi apar in jurul lor. Deci masa din fata e plina de la inceput,
// cea din spate se umple prima, apoi se completeaza randul din mijloc, apoi randul din spate, apoi
// cel din fata.

export type TipDispozitiv = "laptop" | "monitor" | "telefon";

export type Loc = {
  /** Indicele mesei, in ordinea aparitiei. */
  masa: number;
  /** Locul pe masa, 0..3, de la capatul din stanga la cel din dreapta. */
  loc: number;
  tip: TipDispozitiv;
};

export const LOCURI_PE_MASA = 4;

/**
 * Ce sta pe fiecare masa urmeaza COLOANA ei, nu ordinea in care apare: pe captura de la 36, toate
 * mesele din aceeasi coloana au aceeasi secventa, de la capatul din stanga la cel din dreapta. E
 * acelasi ciclu laptop - telefon - monitor, pornit din alt loc pe fiecare coloana.
 */
const MODELE: TipDispozitiv[][] = [
  ["laptop", "telefon", "monitor", "laptop"],
  ["monitor", "laptop", "telefon", "monitor"],
  ["telefon", "monitor", "laptop", "telefon"],
];

/**
 * Pozitia mesei `i` pe grila: coloana de-a lungul meselor (0..2), randul spre privitor (0..2).
 * Primele doua mese stau pe randul din mijloc.
 */
export const GRILA_MESE: ReadonlyArray<{ coloana: number; rand: number }> = [
  { coloana: 0, rand: 1 },
  { coloana: 1, rand: 1 },
  { coloana: 2, rand: 1 },
  { coloana: 0, rand: 0 },
  { coloana: 1, rand: 0 },
  { coloana: 2, rand: 0 },
  { coloana: 0, rand: 2 },
  { coloana: 1, rand: 2 },
  { coloana: 2, rand: 2 },
];

/** Locul dispozitivului cu indicele `i` (0 = primul). */
export function locul(i: number): Loc {
  let masa: number;
  let loc: number;
  if (i < 4) {
    masa = 1;
    loc = i;
  } else if (i < 8) {
    masa = 0;
    loc = i - 4;
  } else {
    masa = 2 + Math.floor((i - 8) / LOCURI_PE_MASA);
    loc = (i - 8) % LOCURI_PE_MASA;
  }
  return { masa, loc, tip: MODELE[GRILA_MESE[masa].coloana][loc] };
}

/** Locurile celor `n` dispozitive. */
export function asezare(n: number): Loc[] {
  return Array.from({ length: Math.max(0, n) }, (_, i) => locul(i));
}

/** Cate mese sunt pe ecran pentru `n` dispozitive (doua de la inceput). */
export function numarMese(n: number): number {
  if (n <= 8) return 2;
  return 2 + Math.ceil((n - 8) / LOCURI_PE_MASA);
}
