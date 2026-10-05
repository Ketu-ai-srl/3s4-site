// /e-facturare (e-facturare.md): sablonul "subiect lung". Erou pe doua coloane pe tot containerul,
// apoi blocuri de 880 cu cap, doua grile de 3 carduri pe 1100, rigla animata, FAQ si CTA-ul final.
//
// Datele despre piete, jurnal si calendar vin din `src/content/efacturare/`, fiecare valoare cu
// sursa ei oficiala alaturi; textele, din `pagina.ts`.
//
// Sectiunile stau in `src/components/efacturare/SectiuniEfacturare.tsx` (mutate din pagina asta, fara schimbare de
// HTML: fixtura `/e-facturare` a invariantei RO), ca ghidul EN al lui 3s.md sa compuna aceleasi componente
// (decizia 53). Pagina RO nu le paseaza nimic: fiecare randeaza implicitul romanesc.

import {
  CasaEfacturare,
  EmitereaEfacturare,
  ErouEfacturare,
  FrazaEfacturare,
  IntrebariEfacturare,
  JurnalEfacturare,
  MandateEfacturare,
  RiglaEfacturare,
  StandardeEfacturare,
  TabelPiete,
  TreiReguliEfacturare,
} from "@/components/efacturare/SectiuniEfacturare";
import CtaFinalInchis from "@/components/primitive/CtaFinalInchis";
import { metadataPagina } from "@/components/seo/metadata";
import { CALE_EFACTURARE, META_EFACTURARE } from "@/content/efacturare/pagina";

export const metadata = metadataPagina({
  titlu: META_EFACTURARE.titlu,
  descriere: META_EFACTURARE.descriere,
  cale: CALE_EFACTURARE,
});

export default function EFacturare() {
  return (
    <main>
      {/* §1 Erou pe doua coloane */}
      <ErouEfacturare />

      {/* §2 Fraza-ancora */}
      <FrazaEfacturare />

      {/* §3 Mandatele, in doua batai */}
      <MandateEfacturare />

      {/* §4 Tabelul pietelor */}
      <TabelPiete />

      {/* §5 Jurnalul */}
      <JurnalEfacturare />

      {/* §6 Trei repere din regula romaneasca */}
      <TreiReguliEfacturare />

      {/* §7 Emiterea e jumatate din regula */}
      <EmitereaEfacturare />

      {/* §8 Rigla */}
      <RiglaEfacturare />

      {/* §9 Ce face 3S cu facturile */}
      <CasaEfacturare />

      {/* §10 Standardele */}
      <StandardeEfacturare />

      {/* §11 FAQ */}
      <IntrebariEfacturare />

      {/* §12 CTA-ul final comun */}
      <CtaFinalInchis />
    </main>
  );
}
