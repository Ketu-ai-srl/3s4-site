// Pagina G2 a editiei `ro-MD`: `/ro/ghiduri/termene-pastrare-moldova` pe 3s.md. Aceleasi componente si aceeasi
// compunere ca verificatorul RO `/instrumente/termene-pastrare` si ca perechea EN `/guides/records-retention-moldova`
// (decizia 53, intrebarea 5 varianta a), cu textul editiei din `src/content/ro-md/ghid-termene-moldova-componente.ts`.
//
// Ordinea RO (lista declarata a perechii: `config/congruenta/g2.json`): EroulInstrument, sectiunea instrumentului
// (SelectorTari cu PanouTara, IesiriTermene), CtaFinalInchis. Panoul Romaniei si iesirea spre tabelul de tiparit ies,
// ca pe EN. Butonul final duce la WhatsApp, cu `[ref:ro-md-termene-moldova]`; fara formular (decizia 3).
//
// Butonul de canal si datele structurate sunt piesele comune ale paginilor de referinta (`(en)/guides/_referinta`), fara
// text propriu. Fara FAQPage: perechea RO n-are intrebari vizibile.

import type { Metadata } from "next";
import ButonCanal from "@/app/(en)/guides/_referinta/ButonCanal";
import { grafReferinta } from "@/app/(en)/guides/_referinta/date-structurate";
import CtaFinalInchis from "@/components/primitive/CtaFinalInchis";
import JsonLd from "@/components/seo/JsonLd";
import { metadataPagina } from "@/components/seo/metadata";
import EroulInstrument from "@/components/termene/EroulInstrument";
import IesiriTermene from "@/components/termene/IesiriTermene";
import PanouTara from "@/components/termene/PanouTara";
import SelectorTari from "@/components/termene/SelectorTari";
import s from "@/components/termene/termene.module.css";
import { ETICHETA_BUTON_CANAL_RO_MD } from "@/content/ro-md/ghid-e-facturare-componente";
import {
  CTA_FINAL_TERMENE_RO_MD,
  EROU_TERMENE_RO_MD,
  IESIRI_TERMENE_RO_MD,
  INSTRUMENT_TERMENE_RO_MD,
  PAGINA_TERMENE_RO_MD,
  PANOU_TERMENE_RO_MD,
  TARI_TERMENE_RO_MD,
} from "@/content/ro-md/ghid-termene-moldova-componente";

const pagina = PAGINA_TERMENE_RO_MD;

export const metadata: Metadata = metadataPagina({
  titlu: pagina.meta.titlu,
  descriere: pagina.meta.descriere,
  cale: pagina.meta.cale,
  editie: "ro-MD",
  cheie: pagina.cheie,
});

export default function Pagina() {
  return (
    <main>
      <JsonLd date={grafReferinta(pagina)} />
      <EroulInstrument continut={EROU_TERMENE_RO_MD} />
      <section className={s.instrument} aria-label={INSTRUMENT_TERMENE_RO_MD.etichetaSectiune}>
        <div className="container-site">
          <SelectorTari tari={TARI_TERMENE_RO_MD.map((t) => ({ cod: t.cod, nume: t.nume }))} eticheta={INSTRUMENT_TERMENE_RO_MD.etichetaSelector}>
            {TARI_TERMENE_RO_MD.map((t) => (
              <PanouTara key={t.cod} tara={t} continut={PANOU_TERMENE_RO_MD} />
            ))}
          </SelectorTari>
          <IesiriTermene iesiri={IESIRI_TERMENE_RO_MD} />
        </div>
      </section>
      <CtaFinalInchis
        continut={CTA_FINAL_TERMENE_RO_MD}
        butoane={<ButonCanal cta={pagina.cta} text={ETICHETA_BUTON_CANAL_RO_MD} varianta="alb-pe-inchis" marime="mare" sageata />}
      />
    </main>
  );
}
