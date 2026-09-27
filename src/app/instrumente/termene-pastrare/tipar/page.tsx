// /instrumente/termene-pastrare/tipar: varianta de tiparit a verificatorului de termene (decizia
// dispecerului, planul valului S4 §6.6: ruta se construieste). Nu intra in harta de site (e o forma
// a aceleiasi informatii); fara `FirPagina` pe ecran, deci firul pentru motoare vine din
// `DateFirAriadnei`.

//
// NEINDEXATA, dar URMARITA (felia seo-tehnic, auditul SEO m5): foaia repeta tabelul paginii
// interactive, deci n-are ce cauta in index ca rezultat separat; legaturile ei spre sursele oficiale
// si spre instrument raman de urmat. `robots` de aici inlocuieste pe cel din layout pe aceasta pagina,
// pe orice mediu: pe mediul de proba, antetul `X-Robots-Tag: noindex, nofollow` pus de
// `src/middleware.ts` ramane plasa, iar motoarele aplica regula cea mai stricta dintre antet si meta.

import type { Metadata } from "next";
import { metadataPagina } from "@/components/seo/metadata";
import DateFirAriadnei from "@/components/seo/DateFirAriadnei";
import FoaieTipar from "@/components/termene/FoaieTipar";
import { CALE_TIPAR, FIR_TIPAR, META_TIPAR } from "@/content/termene/date";

export const metadata: Metadata = {
  ...metadataPagina({ ...META_TIPAR, cale: CALE_TIPAR }),
  robots: { index: false, follow: true },
};

export default function PaginaTiparTermene() {
  return (
    <main>
      <DateFirAriadnei niveluri={FIR_TIPAR} />
      <FoaieTipar />
    </main>
  );
}
