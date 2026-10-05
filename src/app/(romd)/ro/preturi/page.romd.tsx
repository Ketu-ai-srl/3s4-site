// Pagina de preturi a editiei `ro-MD` (P08, `/ro/preturi` pe 3s.md): aceleasi componente si aceeasi compunere ca pagina
// de preturi RO (`src/app/preturi/page.tsx`) si ca perechea EN (`src/app/(en)/pricing/page.en.tsx`, decizia 53), cu
// textul si sumele editiei din `src/content/ro-md/preturi-componente.ts`, in EUR (decizia 54).
//
// Ordinea RO: EroulInterior, LumeaPreturi (LiniaDeBaza, Pachete, Pliuri, FaqPreturi). Insulele client primesc
// invelitoarea ro-MD (`../_editie/PreturiRoMd.tsx`); butoanele grilei duc la WhatsApp, cu textul precompletat al
// paginii (`[ref:ro-md-preturi]`). Nodul FAQPage se construieste aici, din intrebarile VIZIBILE. Fara `Offer`.

import type { Metadata } from "next";
import FaqPreturi from "@/components/preturi/FaqPreturi";
import LiniaDeBaza from "@/components/preturi/LiniaDeBaza";
import TabelPlanuri from "@/components/preturi/TabelPlanuri";
import EroulInterior from "@/components/primitive/EroulInterior";
import type { NodJsonLd } from "@/components/seo/date-structurate";
import JsonLd from "@/components/seo/JsonLd";
import { metadataPagina } from "@/components/seo/metadata";
import { legaturaWhatsApp } from "@/content/canale";
import { pagina } from "@/content/ro-md/preturi";
import {
  ANCORE_PRETURI_RO_MD,
  ANTET_PRETURI_RO_MD,
  INTREBARI_RO_MD,
  LINIA_DE_BAZA_RO_MD,
  PLANURI_RO_MD,
  TABEL_RO_MD,
} from "@/content/ro-md/preturi-componente";
import { stareAnalitica } from "@/lib/analitica";
import { adresaSite } from "@/lib/site";
import { ButonInapoiRoMd, LumeaPreturiRoMd, PacheteRoMd, PliuriRoMd } from "../_editie/PreturiRoMd";

export const metadata: Metadata = metadataPagina({
  titlu: pagina.meta.titlu,
  descriere: pagina.meta.descriere,
  cale: pagina.meta.cale,
  editie: "ro-MD",
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
    inLanguage: "ro-MD",
    mainEntity: INTREBARI_RO_MD.intrebari.map((i) => ({
      "@type": "Question",
      name: i.intrebare,
      acceptedAnswer: { "@type": "Answer", text: i.raspuns },
    })),
  } as NodJsonLd;
  return [...dinModul, faq];
}

export default function PaginaPreturiRoMd() {
  const baza = adresaSite();
  const gazda = new URL(baza).host;
  const analitica = stareAnalitica().activa;
  const whatsapp = legaturaWhatsApp(pagina.cta.ref, pagina.cta.textWhatsapp);

  return (
    <main>
      <JsonLd date={{ "@context": "https://schema.org", "@graph": noduri(baza) }} />
      <EroulInterior fir={ANTET_PRETURI_RO_MD.fir} titlu={ANTET_PRETURI_RO_MD.titlu} subtitlu={ANTET_PRETURI_RO_MD.subtitlu} />
      <LumeaPreturiRoMd
        lume={
          <>
            <LiniaDeBaza continut={LINIA_DE_BAZA_RO_MD} inapoi={<ButonInapoiRoMd />} />
            <PacheteRoMd gazda={gazda} analitica={analitica} whatsapp={whatsapp} />
            <PliuriRoMd tabel={<TabelPlanuri continut={TABEL_RO_MD} planuri={PLANURI_RO_MD} />} />
            <FaqPreturi continut={INTREBARI_RO_MD} ancora={ANCORE_PRETURI_RO_MD.intrebari} />
          </>
        }
      />
    </main>
  );
}
