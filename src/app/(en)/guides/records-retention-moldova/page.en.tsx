// Pagina G2 a editiei `en`: `/guides/records-retention-moldova` (grupul referinta). Aceleasi componente si aceeasi
// compunere ca verificatorul RO `/instrumente/termene-pastrare` (decizia 53), cu textul in engleza din modulul
// `src/content/en/guides-records-retention-moldova.ts`, importat DIRECT (conditia portii de registru: afirmatiile
// paginii numesc modulul).
//
// Ordinea RO, cu ce lipseste si de ce (lista declarata a perechii: `config/congruenta/g2.json`):
//   EroulInstrument, sectiunea instrumentului (SelectorTari cu panourile, IesiriTermene), CtaFinalInchis.
//   Panoul Romaniei si iesirea spre tabelul de tiparit nu se monteaza; blocul de final are un singur buton, cel de
//   canal (WhatsApp, cu textul precompletat al paginii; fara formular, decizia 3).
//
// Datele structurate: nodurile Article si WebPage din modul (`_referinta/date-structurate.ts`); organizatia si site-ul le pune layout-ul. Firul pune
// singur `BreadcrumbList`, ca pe RO.

import type { Metadata } from "next";
import CtaFinalInchis from "@/components/primitive/CtaFinalInchis";
import JsonLd from "@/components/seo/JsonLd";
import { metadataPagina } from "@/components/seo/metadata";
import EroulInstrument from "@/components/termene/EroulInstrument";
import IesiriTermene from "@/components/termene/IesiriTermene";
import PanouTara from "@/components/termene/PanouTara";
import SelectorTari from "@/components/termene/SelectorTari";
import s from "@/components/termene/termene.module.css";
import {
  CTA_FINAL_EN,
  EROU_EN,
  IESIRI_EN,
  INSTRUMENT_EN,
  PANOU_EN,
  TARI_EN,
  pagina,
} from "@/content/en/guides-records-retention-moldova";
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
  return (
    <main>
      <JsonLd date={grafReferinta(pagina)} />
      <EroulInstrument continut={EROU_EN} />
      <section
        className={s.instrument}
        aria-label={INSTRUMENT_EN.etichetaSectiune}
      >
        <div className="container-site">
          <SelectorTari
            tari={TARI_EN.map((t) => ({ cod: t.cod, nume: t.nume }))}
            eticheta={INSTRUMENT_EN.etichetaSelector}
          >
            {TARI_EN.map((t) => (
              <PanouTara key={t.cod} tara={t} continut={PANOU_EN} />
            ))}
          </SelectorTari>
          <IesiriTermene iesiri={IESIRI_EN} />
        </div>
      </section>
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
