// Programul pasilor panoului (acasa-constructor.md §6.1-§6.2): acelasi pentru toate scenele, cu
// timpii masurati pe referinta. Scena decide doar ce se schimba la fiecare pas. Functii pure,
// probate in `tests/constructor.test.ts`.
//
//   start      60 ms                          cardul intra
//   X1         440                            titlul-durere
//   X2         1740                           obiectul principal al scenei
//   X3-X5      2020 / 2300 / 2580             elemente secundare
//   B1-BL      3100 + 330 x i                 benzile de automatizare, una cate una
//   T1-T5      3280 + 330 x L + 320 x k       rezolvarea: benzile se bifeaza, scena se schimba
//   Y1, Y2     5080 + 330 x L, +300           randul de integrari intra la Y1
//   final      6100 + 330 x L                 concluzia si randul final; progresul tinteste 100
//
// L = numarul de benzi de pe ecran (2, 3 sau 4). Ordinea pasilor e aceeasi pentru orice L: ultima
// banda intra cu 510 ms inaintea lui T1, iar Y1 vine la 520 ms dupa T5.

export type NumePas =
  | "start"
  | "X1"
  | "X2"
  | "X3"
  | "X4"
  | "X5"
  | "B1"
  | "B2"
  | "B3"
  | "B4"
  | "T1"
  | "T2"
  | "T3"
  | "T4"
  | "T5"
  | "Y1"
  | "Y2"
  | "final";

export type Pas = { nume: NumePas; timp: number };

/** Numarul maxim de benzi pe care il stie programul (banda canalelor + 3 ale scenei). */
export const BENZI_MAXIM = 4;

/**
 * Cand porneste programul la PRIMA pornire, in ms de la CLICUL care a ales industria.
 *
 * La referinta, lumea e pe ecran la 8 ms dupa clic, dar programul porneste abia cand soseste
 * modulul scenei industriei: pe cronologia celor 9 industrii (§6.3, 63 de momente: intrarile
 * benzilor, bifele si finalul) decalajul de la clic la program are mediana 147 ms, cu jumatate din
 * valori intre 125 si 181 ms (numarul si mediana le verifica `tests/constructor.test.ts`). La noi
 * modulul e deja descarcat cand omul alege, deci fara pauza programul ar veni cu ~150 ms inaintea
 * referintei. Reperul e clicul, nu montarea panoului: panoul intra in treapta a doua a lumii
 * (Lume.tsx), a carei intarziere depinde de procesor. Daca panoul se monteaza dupa acest moment,
 * programul porneste la montare (Panou.tsx). Reluarile (butonul rotund, confirmarea
 * chestionarului, intoarcerea in fereastra) pornesc fara pauza, ca la referinta, unde modulul e
 * atunci deja incarcat.
 */
export const PORNIRE_DUPA_ALEGERE = 145;

export function programPasi(benzi: number): Pas[] {
  const L = Math.max(0, Math.min(BENZI_MAXIM, Math.round(benzi)));
  const pasi: Pas[] = [
    { nume: "start", timp: 60 },
    { nume: "X1", timp: 440 },
    { nume: "X2", timp: 1740 },
    { nume: "X3", timp: 2020 },
    { nume: "X4", timp: 2300 },
    { nume: "X5", timp: 2580 },
  ];
  for (let i = 0; i < L; i++) pasi.push({ nume: ("B" + (i + 1)) as NumePas, timp: 3100 + 330 * i });
  for (let k = 0; k < 5; k++) pasi.push({ nume: ("T" + (k + 1)) as NumePas, timp: 3280 + 330 * L + 320 * k });
  pasi.push({ nume: "Y1", timp: 5080 + 330 * L });
  pasi.push({ nume: "Y2", timp: 5380 + 330 * L });
  pasi.push({ nume: "final", timp: 6100 + 330 * L });
  return pasi;
}

/** Cati pasi s-au facut la momentul `t` (ms de la pornirea programului). */
export function pasiFacuti(pasi: readonly Pas[], t: number): number {
  let n = 0;
  while (n < pasi.length && pasi[n].timp <= t) n++;
  return n;
}

/**
 * Tinta barei de progres dupa `facuti` pasi: `min(96, round(facuti / (13 + L) x 100))`, iar la
 * final 100. Numarul de pasi numarati e 13 + L (start, 5 X, L benzi, 5 T, 2 Y); finalul nu intra.
 */
export function tintaProgres(facuti: number, benzi: number): number {
  const total = 13 + benzi;
  if (facuti > total) return 100;
  return Math.min(96, Math.round((facuti / total) * 100));
}

/** Pasul afisajului: se apropie cu 13% din diferenta pe cadru si sare pe tinta sub 0,4 puncte. */
export function apropieProgres(afisat: number, tinta: number): number {
  const d = tinta - afisat;
  if (Math.abs(d) < 0.4) return tinta;
  return afisat + d * 0.13;
}

/** Functia "a ajuns programul la pasul X?" pentru un numar de pasi facuti. */
export function ajuns(pasi: readonly Pas[], facuti: number): (nume: NumePas) => boolean {
  const indice = new Map<NumePas, number>();
  pasi.forEach((p, i) => indice.set(p.nume, i));
  return (nume) => {
    const i = indice.get(nume);
    return i !== undefined && i < facuti;
  };
}
