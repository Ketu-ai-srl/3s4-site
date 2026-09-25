// Raspunsurile precompletate ale chestionarului din constructor, la 5 domenii (fisa de masurare
// `acasa-constructor.md` §10.4). Doar coduri, niciun text.
//
// DE CE STAU SEPARAT de `acasa-constructor.ts`: le citeste starea constructorului
// (`src/components/constructor/stare.ts`), care e in pachetul paginii de start. Cand stateau acolo,
// importul tragea in pachetul paginii tot continutul celor 9 scene, desi lumea constructorului se
// incarca lenes: 335 din cele 432 de literale de sir (de cel putin 6 caractere) ale continutului
// erau in `app/page-*.js` (masurat pe build, 25.09). Modulul asta e mic si nu importa nimic din
// continutul scenelor, deci el poate sta in pachetul paginii.

import type { CodCanal, CodCine, CodIndustrie, CodVolum } from "./acasa";

export type Precompletare = { canale: CodCanal[]; volum: CodVolum; cine: CodCine };

/** Raspunsurile precompletate la 5 domenii (§10.4). Nu suprascriu raspunsurile vizitatorului. */
export const PRECOMPLETARI: Partial<Record<CodIndustrie, Precompletare>> = {
  avocatura: { canale: ["email", "hartie"], volum: "v50", cine: "eu" },
  imobiliare: { canale: ["email", "mesaj"], volum: "v50", cine: "eu" },
  asigurari: { canale: ["email", "hartie"], volum: "v99", cine: "coleg" },
  notariat: { canale: ["hartie", "email"], volum: "v50", cine: "coleg" },
  consultanta: { canale: ["email"], volum: "v10", cine: "nimeni" },
};
