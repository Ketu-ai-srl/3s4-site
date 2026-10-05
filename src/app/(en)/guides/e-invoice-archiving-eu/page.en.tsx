// Pagina G1 a editiei `en`: `/guides/e-invoice-archiving-eu` (grupul referinta). Aceleasi componente si aceeasi
// compunere ca pagina RO `/e-facturare` (decizia 53), cu textul in engleza din modulul
// `src/content/en/guides-e-invoice-archiving-eu.ts`, importat DIRECT (conditia portii de registru: afirmatiile
// paginii numesc modulul).
//
// Ordinea RO, toate cele 12 sectiuni (lista declarata a perechii: `config/congruenta/g1.json`): Erou, Fraza,
// Mandate, TabelPiete, Jurnal, TreiReguli, Emiterea, Rigla, Casa, Standarde, Intrebari, CtaFinalInchis.
// Butoanele: in erou, canalul WhatsApp in locul incercarii gratuite si "celelalte canale" (pagina de contact) in
// locul demonstratiei; in final, numai canalul WhatsApp. Textul precompletat poarta `[ref:en-einv]`. Fara formular
// (decizia 3).
//
// Datele structurate: nodurile Article si WebPage din modul (`_referinta/date-structurate.ts`); FAQPage il pune sectiunea intrebarilor, din intrebarile
// vizibile; organizatia si site-ul le pune layout-ul.

import type { Metadata } from "next";
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
  CTA_FINAL_EN,
  EFACTURARE_EN,
  pagina,
} from "@/content/en/guides-e-invoice-archiving-eu";
import { ETICHETA_BUTON_CANAL } from "@/content/en/referinta-comun";
import ButonCanal from "../_referinta/ButonCanal";
import { grafReferinta } from "../_referinta/date-structurate";

export const metadata: Metadata = metadataPagina({
  titlu: pagina.meta.titlu,
  descriere: pagina.meta.descriere,
  cale: pagina.meta.cale,
  editie: "en",
  cheie: pagina.cheie,
});

export default function Pagina() {
  const c = EFACTURARE_EN;
  return (
    <main>
      <JsonLd date={grafReferinta(pagina)} />
      <ErouEfacturare
        continut={c}
        butoane={
          <>
            <ButonCanal
              cta={pagina.cta}
              text={ETICHETA_BUTON_CANAL}
              varianta="plin"
              marime="plat"
              sageata
            />
            <Buton
              varianta="fantoma"
              marime="plat"
              legatura={c.erou.butonContur}
            >
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
        continut={CTA_FINAL_EN}
        butoane={
          <ButonCanal
            cta={pagina.cta}
            text={ETICHETA_BUTON_CANAL}
            varianta="alb-pe-inchis"
            marime="mare"
            sageata
          />
        }
      />
    </main>
  );
}
