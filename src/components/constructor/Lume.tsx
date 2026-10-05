"use client";

// Lumea constructorului, INVELITOAREA RO: aceeasi cale si acelasi export ca inainte, incarcata lenes din
// `Constructor`. Aduna continutul romanesc (`src/content/acasa.ts`, capul; `src/content/acasa-constructor.ts`,
// scenele, chestionarul, duelul, estimarea si calculul) si randeaza `LumeVedere`, care nu importa continut.
// Modulul si continutul scenelor stau intr-o bucata JS separata, nu in pachetul paginii de start (proba de
// browser o verifica pe build). Editiile 3s.md isi au invelitoarele lor, cu continutul lor.

import { CONSTRUCTOR, adresaInregistrare } from "@/content/acasa";
import {
  CHESTIONAR,
  COMUN,
  DUEL,
  ESTIMARE,
  NUME_CANAL,
  PARAMETRI_DUEL,
  SCENARII,
  ZILE_LUCRATOARE,
  benziPeEcran,
  completeaza,
  estimare,
  formatMinute,
  formatTimp,
  indiciTermeneRatate,
  indiciToast,
  listaCanale,
  minutePeDocument,
  numeFisier,
} from "@/content/acasa-constructor";
import { CALE_INREGISTRARE } from "@/content/navigatie";
import LumeVedere, { type ContinutLume, type PropsLume } from "./LumeVedere";

export { INTERVAL_ARBORE } from "./LumeVedere";

/** Continutul lumii pe editia RO: constantele de azi, neschimbate, plus tintele spre `/inregistrare`. */
export const CONTINUT_LUME_RO: ContinutLume = {
  cap: CONSTRUCTOR,
  comun: COMUN,
  numeCanal: NUME_CANAL,
  chestionar: CHESTIONAR,
  duel: DUEL,
  estimare: ESTIMARE,
  scenarii: SCENARII,
  text: { completeaza, listaCanale, formatTimp, formatMinute, benziPeEcran },
  calcul: {
    estimare,
    zileLucratoare: ZILE_LUCRATOARE,
    parametriDuel: PARAMETRI_DUEL,
    indiciTermeneRatate,
    indiciToast,
    minutePeDocument,
    numeFisier,
  },
  tinte: {
    final: { legatura: { text: COMUN.final.buton, href: CALE_INREGISTRARE, ruta: CALE_INREGISTRARE } },
    // Parametrii spre `/inregistrare` se compun NUMAI prin contractul din `src/content/acasa.ts`.
    estimare: (p) => ({ legatura: { text: ESTIMARE.buton, href: adresaInregistrare(p), ruta: CALE_INREGISTRARE } }),
  },
};

export default function Lume(props: PropsLume) {
  return <LumeVedere {...props} continut={CONTINUT_LUME_RO} />;
}
