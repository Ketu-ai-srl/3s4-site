// Rutele editiei `en` (site-ul international, la radacina), grupul produs: paginile de produs. La lansare numai P03;
// P04 (`/features/whatsapp`) a iesit prin decizia 49 (asistentul pe WhatsApp nu exista in platforma).
//
// Fisier GOL la fundatia editiilor: il umple felia al carei marcaj sta mai jos, NUMAI sub marcajul ei (aceeasi
// regula ca in `rute.ts`). Fiecare intrare are `editie: "en"` si `cheie` (identificatorul paginii peste
// editii, `src/content/echivalente.ts`), iar pagina ei e un `page.en.tsx` sub `src/app/(en)`. Portile de rute
// citesc fisierul ca text, pe editia `en`, iar declaratiile G-AI-02 ale grupului stau in
// `config/seo/<marcaj>.json`.
import type { RutaEditie } from "./rute";

export const RUTE_EN_PRODUS: RutaEditie<"en">[] = [
  // <<felie:en-produs>>
  {
    cale: "/features/search",
    scurt: "Search with sources",
    descriere: "Ask a question about your documents and check the source of each answer.",
    inHarta: true,
    editie: "en",
    cheie: "features-search",
  },
];
