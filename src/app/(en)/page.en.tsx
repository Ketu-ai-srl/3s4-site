// Pagina de start a editiei `en` (P01, `/`): aceleasi componente si aceeasi compunere ca pagina de start RO
// (`src/app/page.tsx`, decizia 53), cu textul in engleza din `src/content/en/acasa-componente.ts`.
//
// Ordinea RO, cu ce lipseste si de ce (lista declarata a perechii: `config/congruenta/p01.json`):
//   Erou, [BandaIntegrari: iese, decizia 43], [Constructor: forma lui pe editie e felia proprie, dupa aceasta],
//   FunctionalitatiAcasa, BandaCifre, GrilaIndustrii, Testimonial, CardSecuritate, CardEnterprise, BandaPret,
//   FaqAcasa, CtaFinalInchis.
//
// Canalele: butoanele eroului si ale finalului duc la WhatsApp, cu textul precompletat al paginii (`[ref:en-home]`,
// din `home.ts`); fara formular (decizia 3). Scena eroului fara lansarea machetei (`lansare={false}`). Metadata,
// nodul WebPage si registrul de afirmatii vin din `home.ts`; nodul FAQPage se construieste aici, din intrebarile
// VIZIBILE ale paginii, ca sa le oglindeasca exact. Organizatia si site-ul le pune layout-ul.

import type { Metadata } from "next";
import BandaCifre from "@/components/acasa/BandaCifre";
import BandaPret from "@/components/acasa/BandaPret";
import CardEnterprise from "@/components/acasa/CardEnterprise";
import CardSecuritate from "@/components/acasa/CardSecuritate";
import FaqAcasa from "@/components/acasa/FaqAcasa";
import GrilaIndustrii from "@/components/acasa/GrilaIndustrii";
import Testimonial from "@/components/acasa/Testimonial";
import LegaturaCanal from "@/components/canale/LegaturaCanal";
import Erou from "@/components/erou/Erou";
import FunctionalitatiAcasa from "@/components/functionalitati-acasa/FunctionalitatiAcasa";
import PasiFunctionalitatiEn from "@/components/functionalitati-acasa/PasiFunctionalitatiEn";
import Buton, { claseButon, type VariantaButon } from "@/components/primitive/Buton";
import s from "@/components/primitive/Buton.module.css";
import CtaFinalInchis from "@/components/primitive/CtaFinalInchis";
import Iconita from "@/components/primitive/Iconita";
import SiglaTert from "@/components/primitive/SiglaTert";
import type { NodJsonLd } from "@/components/seo/date-structurate";
import JsonLd from "@/components/seo/JsonLd";
import { metadataPagina } from "@/components/seo/metadata";
import { legaturaWhatsApp } from "@/content/canale";
import {
  ANCORA_FINAL,
  BANDA_PRET_EN,
  CARD_ENTERPRISE_EN,
  CARD_SECURITATE_EN,
  CIFRE_EN,
  CTA_FINAL_EN,
  EROU_EN,
  EROU_SECUNDAR,
  ETICHETA_BUTON_CANAL,
  FUNCTIONALITATI_EN,
  INDUSTRII_EN,
  INTREBARI_EN,
  TESTIMONIAL_EN,
} from "@/content/en/acasa-componente";
import { pagina } from "@/content/en/home";
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
 * Butonul de canal WhatsApp cu forma butonului plin al eroului (sau a butonului alb din final): sigla canalului
 * inainte, textul, sageata dupa, cu clasele butonului site-ului. Fara WhatsApp pe domeniu nu se randeaza nimic.
 */
function ButonCanal({
  legatura,
  varianta,
  stralucire,
}: {
  legatura: LegaturaPeCale | null;
  varianta: VariantaButon;
  stralucire: boolean;
}) {
  if (legatura === null) {
    return null;
  }
  return (
    <LegaturaCanal legatura={legatura} canal="whatsapp" className={claseButon(varianta, "mare", false, stralucire)}>
      <SiglaTert cheie="whatsapp" marime={18} className={s.iconita} />
      <span>{ETICHETA_BUTON_CANAL}</span>
      <Iconita nume="arrow-right" marime={18} contur={1.5} className={s.sageata} />
    </LegaturaCanal>
  );
}

/** Nodul FAQPage: intrebarile si raspunsurile vizibile ale sectiunii de intrebari, exact. */
function nodFaq(): NodJsonLd {
  const baza = adresaSite();
  return {
    "@type": "FAQPage",
    "@id": baza + "/#faq",
    inLanguage: "en",
    mainEntity: INTREBARI_EN.intrebari.map((i) => ({
      "@type": "Question",
      name: i.intrebare,
      acceptedAnswer: { "@type": "Answer", text: i.raspuns },
    })),
  } as NodJsonLd;
}

export default function PaginaStartEn() {
  const href = legaturaWhatsApp(pagina.cta.ref, pagina.cta.textWhatsapp);
  const whatsapp: LegaturaPeCale | null = href === null ? null : { implicit: href, pagini: [] };
  const noduri = [...(pagina.jsonLd as NodJsonLd[]).filter((n) => n["@type"] !== "FAQPage"), nodFaq()];

  return (
    <main>
      <JsonLd date={{ "@context": "https://schema.org", "@graph": noduri }} />
      <Erou
        continut={EROU_EN}
        lansare={false}
        butoane={
          <>
            <ButonCanal legatura={whatsapp} varianta="plin" stralucire />
            <Buton
              varianta="contur"
              marime="mare"
              iconitaInainte="circle-play"
              legatura={{ text: EROU_SECUNDAR.text, href: EROU_SECUNDAR.href, ruta: null }}
            >
              {EROU_SECUNDAR.text}
            </Buton>
          </>
        }
      />
      <FunctionalitatiAcasa continut={FUNCTIONALITATI_EN} pasi={<PasiFunctionalitatiEn />} />
      <BandaCifre continut={CIFRE_EN} />
      <GrilaIndustrii continut={INDUSTRII_EN} />
      <Testimonial continut={TESTIMONIAL_EN} />
      <CardSecuritate continut={CARD_SECURITATE_EN} />
      <CardEnterprise continut={CARD_ENTERPRISE_EN} />
      <BandaPret continut={BANDA_PRET_EN} />
      <FaqAcasa continut={INTREBARI_EN} />
      <CtaFinalInchis
        id={ANCORA_FINAL}
        continut={CTA_FINAL_EN}
        butoane={<ButonCanal legatura={whatsapp} varianta="alb-pe-inchis" stralucire={false} />}
      />
    </main>
  );
}
