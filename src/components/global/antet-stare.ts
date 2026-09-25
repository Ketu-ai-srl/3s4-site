// API-ul starii "plecat" a antetului: antetul iese din ecran in sus (`translateY(-120%)`, 0,28 s,
// fara evenimente de mouse) cat timp o piesa o cere. Pe start o cere constructorul, cat timp e
// in tema inchisa (acasa-constructor.md §3). Mecanismul e al antetului; momentul e al piesei.
//
// Folosire, dintr-o componenta client a altei felii:
//
//     import { cereAntetulPlecat } from "@/components/global/antet-stare";
//     cereAntetulPlecat("constructor", true);   // pleaca
//     cereAntetulPlecat("constructor", false);  // revine
//
// Starea e o multime de surse, nu un boolean: doua piese care cer plecarea in acelasi timp nu se
// anuleaza una pe alta, iar antetul revine abia cand ultima sursa renunta.

const surse = new Set<string>();
const ascultatori = new Set<() => void>();

function anunta() {
  for (const f of ascultatori) f();
}

/** Cere (sau retrage cererea) ca antetul sa iasa din ecran. `sursa` identifica piesa. */
export function cereAntetulPlecat(sursa: string, activ: boolean): void {
  const aveaSursa = surse.has(sursa);
  if (activ && !aveaSursa) {
    surse.add(sursa);
    anunta();
  } else if (!activ && aveaSursa) {
    surse.delete(sursa);
    anunta();
  }
}

/** E antetul plecat acum? */
export function antetulEstePlecat(): boolean {
  return surse.size > 0;
}

/** Abonare pentru `useSyncExternalStore`. Intoarce functia de dezabonare. */
export function ascultaAntetul(f: () => void): () => void {
  ascultatori.add(f);
  return () => {
    ascultatori.delete(f);
  };
}
