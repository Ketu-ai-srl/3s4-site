// Pagina platformei, editia `en` (P02, `/platform`): aceleasi componente si aceeasi compunere ca pagina RO
// `/platforma` (`src/app/platforma/page.tsx`, decizia 53), cu textul in engleza din
// `src/content/en/platforma-componente.ts`.
//
// Ordinea RO, cu ce lipseste si de ce (lista declarata a perechii: `config/congruenta/p02.json`):
//   PaginaPlatforma (Erou, Piloni, [Problema: poarta juridica 40-41], Model, [BlocDate: aceeasi poarta], BlocArhiva,
//   BlocIntrebari, Comparatie, Suveranitate, [Apeluri: d43], Cazuri, Conformitate, Intrebari), CtaFinalInchis.
//
// Canalele: butonul principal al eroului si butonul finalului duc la WhatsApp, cu textul precompletat al paginii
// (`[ref:en-platform]`, din `platform.ts`); fara formular (decizia 3). Butoanele au clasele butoanelor RO din aceleasi
// locuri. Metadata, nodul WebPage si registrul de afirmatii vin din `platform.ts`; nodul FAQPage se construieste aici,
// din intrebarile VIZIBILE ale paginii, ca sa le oglindeasca exact. Firul il emite `FirPagina` (BreadcrumbList), deci
// nodul BreadcrumbList al modulului nu se mai pune. Organizatia si site-ul le pune layout-ul.

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
import {
  CTA_FINAL_PLATFORMA_EN,
  EROU_SECUNDAR_PLATFORMA,
  ETICHETA_BUTON_CANAL_PLATFORMA,
  ETICHETA_FIR_EN,
  PLATFORMA_EN,
  SECTIUNI_PLATFORMA_EN,
} from "@/content/en/platforma-componente";
import { pagina } from "@/content/en/platform";
import type { LegaturaPeCale } from "@/content/navigatie";
import { adresaSite } from "@/lib/site";

export const metadata: Metadata = metadataPagina({
  titlu: pagina.meta.titlu,
  descriere: pagina.meta.descriere,
  cale: pagina.meta.cale,
  editie: "en",
  cheie: pagina.cheie,
});

/**
 * Butonul de canal WhatsApp cu forma butonului RO din acelasi loc (varianta, marimea, sageata, clasa locului), cu
 * sigla canalului inainte. Sigla nu primeste clasa de iconita a butonului: pe pagina RO pereche clasa aceea nu
 * apare, iar `inline-flex` cu `gap` o aseaza la fel. Fara WhatsApp pe domeniu nu se randeaza nimic.
 */
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
      <span>{ETICHETA_BUTON_CANAL_PLATFORMA}</span>
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
    name: PLATFORMA_EN.intrebari!.titlu,
    inLanguage: "en",
    mainEntity: PLATFORMA_EN.intrebari!.intrebari.map((i) => ({
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

export default function PaginaPlatformaEn() {
  const href = legaturaWhatsApp(pagina.cta.ref, pagina.cta.textWhatsapp);
  const whatsapp: LegaturaPeCale | null = href === null ? null : { implicit: href, pagini: [] };

  return (
    <main>
      <PaginaPlatforma
        continut={PLATFORMA_EN}
        sectiuni={SECTIUNI_PLATFORMA_EN}
        etichetaFir={ETICHETA_FIR_EN}
        butoane={
          <>
            <ButonCanal legatura={whatsapp} varianta="plin" marime="plat" className={sp.erouButon} />
            <Buton varianta="fantoma" marime="plat" legatura={EROU_SECUNDAR_PLATFORMA} className={sp.erouButon}>
              {EROU_SECUNDAR_PLATFORMA.text}
            </Buton>
          </>
        }
      />
      <CtaFinalInchis
        continut={CTA_FINAL_PLATFORMA_EN}
        butoane={<ButonCanal legatura={whatsapp} varianta="alb-pe-inchis" marime="mare" />}
      />
      <JsonLd date={{ "@context": "https://schema.org", "@graph": [...noduriPagina(), nodFaq()] }} />
    </main>
  );
}
