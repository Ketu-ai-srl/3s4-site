// Pagina preturilor, editia `en` (P08, `/pricing`): aceleasi componente si aceeasi compunere ca pagina de preturi RO
// (`src/app/preturi/page.tsx`, decizia 53), cu textul in engleza si sumele in EUR (decizia 54), din
// `src/content/en/pricing-componente.ts`. Piesele client vin din invelitoarea EN (`PreturiEn.tsx`), cele de server
// (linia de baza, tabelul, intrebarile) primesc continutul EN prin proprietati.
//
// Ordinea RO: EroulInterior, LumeaPreturi (poarta, apoi lumea: LiniaDeBaza, Pachete, Pliuri cu TabelPlanuri,
// FaqPreturi). Diferentele de forma sunt in lista declarata a perechii (`config/congruenta/p08.json`).
//
// Canalele: butoanele planurilor duc la WhatsApp, cu textul precompletat al paginii (`[ref:en-price]`, din `pricing.ts`);
// fara formular (decizia 3). Metadata, nodul WebPage si registrul de afirmatii vin din `pricing.ts`; firul
// (`BreadcrumbList`) il emite eroul, o singura data, iar nodul FAQPage se construieste din intrebarile VIZIBILE. Fara
// `Offer` si `priceCurrency` (fisa: pana la regimul TVA).

import type { Metadata } from "next";
import FaqPreturi from "@/components/preturi/FaqPreturi";
import LiniaDeBaza from "@/components/preturi/LiniaDeBaza";
import { ButonInapoiEn, LumeaPreturiEn, PacheteEn, PliuriEn } from "@/components/preturi/PreturiEn";
import TabelPlanuri from "@/components/preturi/TabelPlanuri";
import EroulInterior from "@/components/primitive/EroulInterior";
import type { NodJsonLd } from "@/components/seo/date-structurate";
import JsonLd from "@/components/seo/JsonLd";
import { metadataPagina } from "@/components/seo/metadata";
import { legaturaWhatsApp } from "@/content/canale";
import { pagina } from "@/content/en/pricing";
import {
  ANCORE_PRETURI_EN,
  ANTET_PRETURI_EN,
  ETICHETA_FIR_EN,
  INTREBARI_EN,
  LINIA_DE_BAZA_EN,
  PLANURI_EN,
  TABEL_EN,
} from "@/content/en/pricing-componente";
import { stareAnalitica } from "@/lib/analitica";
import { adresaSite } from "@/lib/site";

export const metadata: Metadata = metadataPagina({
  titlu: pagina.meta.titlu,
  descriere: pagina.meta.descriere,
  cale: pagina.meta.cale,
  editie: "en",
  cheie: pagina.cheie,
});

/** Nodurile paginii: cele din modul, fara firul (il emite eroul) si fara trimiterea la el, plus FAQPage. */
function noduri(baza: string): NodJsonLd[] {
  const dinModul = (pagina.jsonLd as NodJsonLd[])
    .filter((n) => n["@type"] !== "BreadcrumbList")
    .map((n) => Object.fromEntries(Object.entries(n).filter(([k]) => k !== "breadcrumb")) as NodJsonLd);
  const faq = {
    "@type": "FAQPage",
    "@id": baza + pagina.meta.cale + "#faq",
    inLanguage: "en",
    mainEntity: INTREBARI_EN.intrebari.map((i) => ({
      "@type": "Question",
      name: i.intrebare,
      acceptedAnswer: { "@type": "Answer", text: i.raspuns },
    })),
  } as NodJsonLd;
  return [...dinModul, faq];
}

export default function PaginaPreturiEn() {
  const baza = adresaSite();
  const gazda = new URL(baza).host;
  const analitica = stareAnalitica().activa;
  const whatsapp = legaturaWhatsApp(pagina.cta.ref, pagina.cta.textWhatsapp);

  return (
    <main>
      <JsonLd date={{ "@context": "https://schema.org", "@graph": noduri(baza) }} />
      <EroulInterior
        fir={ANTET_PRETURI_EN.fir}
        titlu={ANTET_PRETURI_EN.titlu}
        subtitlu={ANTET_PRETURI_EN.subtitlu}
        etichetaFir={ETICHETA_FIR_EN}
      />
      <LumeaPreturiEn
        lume={
          <>
            <LiniaDeBaza continut={LINIA_DE_BAZA_EN} inapoi={<ButonInapoiEn />} />
            <PacheteEn gazda={gazda} analitica={analitica} whatsapp={whatsapp} />
            <PliuriEn tabel={<TabelPlanuri continut={TABEL_EN} planuri={PLANURI_EN} />} />
            <FaqPreturi continut={INTREBARI_EN} ancora={ANCORE_PRETURI_EN.intrebari} />
          </>
        }
      />
    </main>
  );
}
