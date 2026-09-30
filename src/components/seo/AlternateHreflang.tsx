// Locul alternatelor hreflang in layout (componenta de server). Citeste `SITE_ALTERNATE` la construire
// (`alternateSite`, `src/lib/site.ts`) si nu randeaza NIMIC cand variabila lipseste: fara ea, HTML-ul
// e cel de pana acum. Cu ea, da variantele piesei de browser, care stie calea paginii.
//
// DE CE E O PIESA DE BROWSER SI NU `metadata`. Adresa unei pagini pe celelalte domenii se compune din
// calea ei, iar layout-ul comun nu cunoaste calea (nu poate, fara sa faca toate paginile dinamice).
// `alternates.languages` din `metadata` ar cere in plus ca FIECARE pagina sa si-l declare: paginile
// isi scriu singure `alternates` (start, blog, articole), iar obiectul unei pagini il inlocuieste pe
// cel din layout, deci o singura pagina uitata ar ramane fara ele. Piesa de aici acopera toate
// paginile la fel, inclusiv cele viitoare.
//
// UNA DIN CELE TREI METODE, nu toate: Google spune ca elementele `<link>` din HTML, antetele HTTP si
// harta de site sunt echivalente ("The three methods are equivalent from Google's perspective") si ca
// folosirea tuturor deodata nu aduce nimic in cautare ("there's no benefit in Search"; documentatia
// oficiala, citita pe 2026-09-30:
// https://developers.google.com/search/docs/specialty/international/localized-versions). Aici e
// metoda cu elemente `<link>`; harta de site (`src/app/sitemap.ts`) NU poarta alternate.

import { alternateSite } from "@/lib/site";
import AlternateHreflangClient from "./AlternateHreflangClient";

export default function AlternateHreflang() {
  const alternate = alternateSite();
  if (alternate.length === 0) {
    return null;
  }
  return <AlternateHreflangClient alternate={alternate} />;
}
