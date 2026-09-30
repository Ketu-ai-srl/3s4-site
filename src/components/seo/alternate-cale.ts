// Forma alternatelor hreflang, intr-un modul FARA importuri, folosit de doua piese care nu pot
// importa una de la alta:
//   - `src/lib/site.ts` (server): citeste si valideaza `SITE_ALTERNATE` la construire;
//   - `AlternateHreflangClient.tsx` (browser): compune adresa paginii curente pe fiecare varianta.
// Piesa de browser nu are voie sa importe `@/lib/site`: acela importa manifestul de rute (`rute.ts`), deci
// manifestul ar intra in bucata comuna a layout-ului. Compunerea adresei sta aici, intr-un singur
// loc, si o folosesc amandoua: nu exista o a doua copie care sa poata diverge.

/**
 * O varianta a site-ului: codul hreflang si adresa de baza a variantei, adica originea domeniului
 * plus, cand versiunea sta sub un prefix de cale, prefixul (`https://gazda/ro`). Fara bara la final.
 */
export type Alternata = { hreflang: string; adresa: string };

/** Codul pentru "nicio varianta nu se potriveste vizitatorului" (Google: pagina de rezerva). */
export const X_DEFAULT = "x-default";

/**
 * Adresa unei pagini pe varianta data: baza variantei plus calea paginii. Radacina (`/`) se scrie
 * fara bara finala, ca `canonical`-ul pe care Next il pune paginii de start (`metadataBase` + `/` da
 * `https://gazda`): hreflang si canonical spun la fel. Prefixul nu produce niciodata `//`, fiindca baza
 * nu are bara la final, iar calea incepe cu una.
 */
export function adresaAlternata(adresa: string, cale: string): string {
  return adresa + (cale === "/" ? "" : cale);
}
