// Rutele editiei `en` (site-ul international, la radacina), grupul segmente: segmentele S1-S3.
//
// Fisier GOL la fundatia editiilor: il umple felia al carei marcaj sta mai jos, NUMAI sub marcajul ei (aceeasi
// regula ca in `rute.ts`). Fiecare intrare are `editie: "en"` si `cheie` (identificatorul paginii peste
// editii, `src/content/echivalente.ts`), iar pagina ei e un `page.en.tsx` sub `src/app/(en)`. Portile de rute
// citesc fisierul ca text, pe editia `en`, iar declaratiile G-AI-02 ale grupului stau in
// `config/seo/<marcaj>.json`.
import type { RutaEditie } from "./rute";

export const RUTE_EN_SEGMENTE: RutaEditie<"en">[] = [
  // <<felie:en-segmente>>
];
