// Pagina platformei a editiei `ro-MD` (P02, `/ro/platforma` pe 3s.md): aceleasi componente si aceeasi compunere ca
// pagina RO `/platforma` (`src/app/platforma/page.tsx`) si ca perechea EN (`src/app/(en)/platform/page.en.tsx`,
// decizia 53), cu textul editiei din `src/content/ro-md/platforma-componente.ts`.
//
// Ordinea RO, cu ce lipseste si de ce (lista declarata a perechii: `config/congruenta/p02.json`):
//   PaginaPlatforma (Erou, Piloni, [Problema: poarta juridica 40-41], Model, [BlocDate: aceeasi poarta], BlocArhiva,
//   BlocIntrebari, Comparatie, Suveranitate, [Apeluri: d43], Cazuri, Conformitate, Intrebari), CtaFinalInchis.
//
// Canalele: butonul principal al eroului si butonul finalului duc la WhatsApp, cu textul precompletat al paginii
// (`[ref:ro-md-platforma]`, din `platforma.ts`); fara formular (decizia 3). Nodul FAQPage se construieste aici, din
// intrebarile VIZIBILE; firul il emite `FirPagina` (BreadcrumbList), cu eticheta lui implicita, in romana.

import type { Metadata } from "next";
import LegaturaCanal from "@/components/canale/LegaturaCanal";
import Buton, { claseButon, type MarimeButon, type VariantaButon } from "@/components/primitive/Buton";
import sb from "@/components/primitive/Buton.module.css";
import CtaFinalInchis from "@/components/primitive/CtaFinalInchis";
import Iconita from "@/components/primitive/Iconita";
import SiglaTert from "@/components/primitive/SiglaTert";
import PaginaPlatforma from "@/components/produs/PaginaPlatforma";
import sp from "@/components/produs/platforma.module.css";
import type { NodJsonLd } from "@/components/seo/date-structurate";
import JsonLd from "@/components/seo/JsonLd";
import { metadataPagina } from "@/components/seo/metadata";
import { legaturaWhatsApp } from "@/content/canale";
import type { LegaturaPeCale } from "@/content/navigatie";
import { pagina } from "@/content/ro-md/platforma";
import {
  CTA_FINAL_PLATFORMA_RO_MD,
  EROU_SECUNDAR_PLATFORMA_RO_MD,
  ETICHETA_BUTON_CANAL_PLATFORMA_RO_MD,
  PLATFORMA_RO_MD,
  SECTIUNI_PLATFORMA_RO_MD,
} from "@/content/ro-md/platforma-componente";
import { adresaSite } from "@/lib/site";

export const metadata: Metadata = metadataPagina({
  titlu: pagina.meta.titlu,
  descriere: pagina.meta.descriere,
  cale: pagina.meta.cale,
  editie: "ro-MD",
  cheie: pagina.cheie,
});

/** Butonul de canal WhatsApp cu forma butonului RO din acelasi loc, cu sigla canalului inainte (ca pe EN). */
function ButonCanal({
  legatura,
  varianta,
  marime,
  className,
}: {
  legatura: LegaturaPeCale | null;
  varianta: VariantaButon;
  marime: MarimeButon;
  className?: string;
}) {
  if (legatura === null) {
    return null;
  }
  const sageata = marime === "plat" ? { marime: 15, contur: 2 } : { marime: 18, contur: 1.5 };
  return (
    <LegaturaCanal legatura={legatura} canal="whatsapp" className={claseButon(varianta, marime, false, false, className)}>
      <SiglaTert cheie="whatsapp" marime={sageata.marime + 1} />
      <span>{ETICHETA_BUTON_CANAL_PLATFORMA_RO_MD}</span>
      <Iconita nume="arrow-right" marime={sageata.marime} contur={sageata.contur} className={sb.sageata} />
    </LegaturaCanal>
  );
}

/** Nodul FAQPage: intrebarile si raspunsurile vizibile ale sectiunii de intrebari, exact. */
function nodFaq(): NodJsonLd {
  const pag = adresaSite() + pagina.meta.cale;
  return {
    "@type": "FAQPage",
    "@id": pag + "#intrebari",
    url: pag,
    name: PLATFORMA_RO_MD.intrebari!.titlu,
    inLanguage: "ro-MD",
    mainEntity: PLATFORMA_RO_MD.intrebari!.intrebari.map((i) => ({
      "@type": "Question",
      name: i.intrebare,
      acceptedAnswer: { "@type": "Answer", text: i.raspuns },
    })),
  } as NodJsonLd;
}

/** Nodurile modulului, fara BreadcrumbList (il emite firul) si fara trimiterea la el. */
function noduriPagina(): NodJsonLd[] {
  return (pagina.jsonLd as NodJsonLd[])
    .filter((n) => n["@type"] !== "BreadcrumbList" && n["@type"] !== "FAQPage")
    .map((n) => {
      const copie: Record<string, unknown> = { ...n };
      delete copie.breadcrumb;
      return copie as NodJsonLd;
    });
}

export default function PaginaPlatformaRoMd() {
  const href = legaturaWhatsApp(pagina.cta.ref, pagina.cta.textWhatsapp);
  const whatsapp: LegaturaPeCale | null = href === null ? null : { implicit: href, pagini: [] };

  return (
    <main>
      <PaginaPlatforma
        continut={PLATFORMA_RO_MD}
        sectiuni={SECTIUNI_PLATFORMA_RO_MD}
        butoane={
          <>
            <ButonCanal legatura={whatsapp} varianta="plin" marime="plat" className={sp.erouButon} />
            <Buton varianta="fantoma" marime="plat" legatura={EROU_SECUNDAR_PLATFORMA_RO_MD} className={sp.erouButon}>
              {EROU_SECUNDAR_PLATFORMA_RO_MD.text}
            </Buton>
          </>
        }
      />
      <CtaFinalInchis continut={CTA_FINAL_PLATFORMA_RO_MD} butoane={<ButonCanal legatura={whatsapp} varianta="alb-pe-inchis" marime="mare" />} />
      <JsonLd date={{ "@context": "https://schema.org", "@graph": [...noduriPagina(), nodFaq()] }} />
    </main>
  );
}
