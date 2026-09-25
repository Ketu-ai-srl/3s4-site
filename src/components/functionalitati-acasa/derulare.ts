// Logica de derulare a functionalitatilor, fara DOM: pragurile pasului activ (desktop) si pista
// orizontala (pana la 900 px). Sta separat ca sa poata fi probata cu cifre, in `tests/`.
//
// DESKTOP (acasa-functionalitati.md §9): histerezis 40% / 60% din inaltimea ferestrei.
//   - in jos, pasul urmator devine activ cand marginea de sus a blocului lui ajunge la <= 40% vh;
//   - in sus, pasul anterior revine cand marginea de sus a blocului CURENT ajunge la >= 60% vh.
// La referinta regula iesea dintr-un observator de intersectii cu banda 20%-80%; aici e scrisa
// direct, cum recomanda fisa, deci nu depinde de latenta asincrona a observatorului.
//
// MOBIL (fisa §11): p = cat din cursa pistei s-a parcurs, 0..1, fara easing si fara magnet; banda
// de 3 carduri se muta cu 2 ferestre inmultit cu p. Cardul activ: p < 0,34 -> 1, < 0,67 -> 2,
// altfel 3. Clicul pe un punct aliniaza EXACT cardul lui (fisa §14.12: la referinta punctele 1 si 3
// lasau cardul decalat cu o treime de ecran).

/** Pragul de coborare, fractie din inaltimea ferestrei. */
export const PRAG_JOS = 0.4;
/** Pragul de urcare, fractie din inaltimea ferestrei. */
export const PRAG_SUS = 0.6;

/**
 * Pasul activ dupa o derulare, pornind de la cel curent.
 * `topuri`: marginea de sus a fiecarui bloc, fata de fereastra (px). `vh`: inaltimea ferestrei.
 */
export function pasDupaPraguri(curent: number, topuri: readonly number[], vh: number): number {
  const ultim = topuri.length - 1;
  let pas = Math.min(Math.max(curent, 0), ultim);
  while (pas < ultim && topuri[pas + 1] <= PRAG_JOS * vh) pas++;
  while (pas > 0 && topuri[pas] >= PRAG_SUS * vh) pas--;
  return pas;
}

/** Cat din cursa pistei s-a parcurs: 0 la lipire, 1 la desprindere. */
export function progresPista(topPista: number, inaltimePista: number, inaltimeFereastra: number): number {
  const cursa = inaltimePista - inaltimeFereastra;
  if (cursa <= 0) return 0;
  return Math.min(1, Math.max(0, -topPista / cursa));
}

/** Cardul activ al pistei, dupa progres (fisa §11: 0,34 si 0,67). */
export function cardDinProgres(p: number): number {
  if (p < 0.34) return 0;
  if (p < 0.67) return 1;
  return 2;
}

/**
 * Translatia benzii, in procente din latimea ei. Banda are 3 ferestre, deci 2 ferestre de cursa
 * inseamna 2/3 din latimea ei. Procentele nu depind de bara de derulare, cum ar depinde `vw`.
 */
export function translatieBanda(p: number): string {
  const procent = (-200 / 3) * Math.min(1, Math.max(0, p));
  return "translate3d(" + (Math.round(procent * 10000) / 10000 || 0) + "%, 0px, 0px)";
}

/** Derularea la care cardul `index` (0..2) sta exact in fereastra: p = index / 2. */
export function tintaPunct(index: number, topPistaInPagina: number, cursa: number): number {
  return Math.round(topPistaInPagina + (Math.min(2, Math.max(0, index)) / 2) * cursa);
}
