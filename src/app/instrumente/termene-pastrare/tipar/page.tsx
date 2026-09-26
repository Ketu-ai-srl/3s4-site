// /instrumente/termene-pastrare/tipar: varianta de tiparit a verificatorului de termene (decizia
// dispecerului, planul valului S4 §6.6: ruta se construieste). Nu intra in harta de site (e o forma
// a aceleiasi informatii); fara `FirPagina` pe ecran, deci firul pentru motoare vine din
// `DateFirAriadnei`.

import { metadataPagina } from "@/components/seo/metadata";
import DateFirAriadnei from "@/components/seo/DateFirAriadnei";
import FoaieTipar from "@/components/termene/FoaieTipar";
import { CALE_TIPAR, FIR_TIPAR, META_TIPAR } from "@/content/termene/date";

export const metadata = metadataPagina({ ...META_TIPAR, cale: CALE_TIPAR });

export default function PaginaTiparTermene() {
  return (
    <main>
      <DateFirAriadnei niveluri={FIR_TIPAR} />
      <FoaieTipar />
    </main>
  );
}
