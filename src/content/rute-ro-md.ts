// Rutele editiei `ro-MD` (romana pentru Republica Moldova, sub `/ro`).
//
// Fisier GOL la fundatia editiilor: il umple felia al carei marcaj sta mai jos, NUMAI sub marcajul ei (aceeasi
// regula ca in `rute.ts`). Fiecare intrare are `editie: "ro-MD"`, `cheie` (`src/content/echivalente.ts`) si o
// cale care incepe cu `/ro`; pagina ei e un `page.romd.tsx` sub `src/app/(romd)/ro`. Portile de rute citesc
// fisierul ca text, pe editia `ro-MD`.
import type { RutaEditie } from "./rute";

export const RUTE_RO_MD: RutaEditie<"ro-MD">[] = [
  // <<felie:juridic-pagini-3s-md>>
];
