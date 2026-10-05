// Pagina G1 a editiei `ro-MD`: `/ro/ghiduri/arhivare-e-facturi-ue` pe 3s.md. Aceleasi componente si aceeasi compunere
// ca pagina RO `/e-facturare` si ca perechea EN `/guides/e-invoice-archiving-eu` (decizia 53), cu textul editiei din
// `src/content/ro-md/ghid-e-facturare-componente.ts`, importat DIRECT (conditia portii de registru).
//
// Ordinea RO, toate cele 12 sectiuni (lista declarata a perechii: `config/congruenta/g1.json`): Erou, Fraza, Mandate,
// TabelPiete, Jurnal, TreiReguli, Emiterea, Rigla, Casa, Standarde, Intrebari, CtaFinalInchis. Butoanele: in erou,
// canalul WhatsApp si "celelalte canale" (pagina de contact /ro); in final, numai canalul WhatsApp, cu
// `[ref:ro-md-einv]`. Fara formular (decizia 3).
//
// Butonul de canal si datele structurate sunt piesele comune ale paginilor de referinta (`(en)/guides/_referinta`), fara
// text propriu: aceeasi forma ca pe EN. FAQPage il pune sectiunea intrebarilor, din intrebarile vizibile.

import type { Metadata } from "next";
import ButonCanal from "@/app/(en)/guides/_referinta/ButonCanal";
import { grafReferinta } from "@/app/(en)/guides/_referinta/date-structurate";
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
import Buton from "@/components/primitive/Buton";
import CtaFinalInchis from "@/components/primitive/CtaFinalInchis";
import JsonLd from "@/components/seo/JsonLd";
import { metadataPagina } from "@/components/seo/metadata";
import {
  CTA_FINAL_EFACTURARE_RO_MD,
  EFACTURARE_RO_MD,
  ETICHETA_BUTON_CANAL_RO_MD,
  PAGINA_EFACTURARE_RO_MD,
} from "@/content/ro-md/ghid-e-facturare-componente";

const pagina = PAGINA_EFACTURARE_RO_MD;

export const metadata: Metadata = metadataPagina({
  titlu: pagina.meta.titlu,
  descriere: pagina.meta.descriere,
  cale: pagina.meta.cale,
  editie: "ro-MD",
  cheie: pagina.cheie,
});

export default function Pagina() {
  const c = EFACTURARE_RO_MD;
  return (
    <main>
      <JsonLd date={grafReferinta(pagina)} />
      <ErouEfacturare
        continut={c}
        butoane={
          <>
            <ButonCanal cta={pagina.cta} text={ETICHETA_BUTON_CANAL_RO_MD} varianta="plin" marime="plat" sageata />
            <Buton varianta="fantoma" marime="plat" legatura={c.erou.butonContur}>
              {c.erou.butonContur.text}
            </Buton>
          </>
        }
      />
      <FrazaEfacturare continut={c} />
      <MandateEfacturare continut={c} />
      <TabelPiete continut={c} />
      <JurnalEfacturare continut={c} />
      <TreiReguliEfacturare continut={c} />
      <EmitereaEfacturare continut={c} />
      <RiglaEfacturare continut={c} />
      <CasaEfacturare continut={c} />
      <StandardeEfacturare continut={c} />
      <IntrebariEfacturare continut={c} />
      <CtaFinalInchis
        continut={CTA_FINAL_EFACTURARE_RO_MD}
        butoane={<ButonCanal cta={pagina.cta} text={ETICHETA_BUTON_CANAL_RO_MD} varianta="alb-pe-inchis" marime="mare" sageata />}
      />
    </main>
  );
}
