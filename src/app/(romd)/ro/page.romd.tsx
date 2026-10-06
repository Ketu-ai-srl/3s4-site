// Pagina de start a editiei `ro-MD` (`/ro` pe 3s.md): aceleasi componente si aceeasi compunere ca pagina de start RO
// (`src/app/page.tsx`) si ca startul EN (`src/app/(en)/page.en.tsx`), decizia 53, cu textul in romana editiei din
// `src/content/ro-md/acasa-componente.ts`.
//
// Ordinea RO, cu ce lipseste si de ce (lista declarata a perechii: `config/congruenta/p01.json`, comuna cu `/`):
//   Erou, [BandaIntegrari: iese, decizia 43], Constructor (invelitoarea ro-MD a feliei 122, decizia 59),
//   FunctionalitatiAcasa, BandaCifre, GrilaIndustrii, Testimonial, CardSecuritate, CardEnterprise, BandaPret,
//   FaqAcasa, CtaFinalInchis.
//
// Scena eroului: bucla editiei RO (`src/content/acasa.ts`), aceeasi figura ca pe site-ul RO, fara centrul care
// lanseaza macheta si fara legenda (`lansare={false}`), ca pe EN. Bucla se ia aici, pe server: modulul de componente
// al editiei il importa si invelitoarea client a pasilor, deci nu poate aduce continutul RO.
//
// Canalele: butoanele eroului si ale finalului duc la WhatsApp, cu textul precompletat al paginii
// (`[ref:ro-md-acasa]`, din `ro-md/acasa.ts`) si eticheta deciziei 35; fara formular (decizia 3). Fraza de sub
// intrebari numeste adresa de e-mail numai cand domeniul o are (P-40). Metadata, nodul WebPage si registrul de
// afirmatii vin din `ro-md/acasa.ts`; nodul FAQPage se construieste aici, din intrebarile VIZIBILE ale paginii, ca
// sa le oglindeasca exact. Organizatia si site-ul le pune layout-ul.

import type { Metadata } from "next";
import BandaCifre from "@/components/acasa/BandaCifre";
import BandaPret from "@/components/acasa/BandaPret";
import CardEnterprise from "@/components/acasa/CardEnterprise";
import CardSecuritate from "@/components/acasa/CardSecuritate";
import ConstructorRoMd from "@/components/constructor/ConstructorRoMd";
import FaqAcasa from "@/components/acasa/FaqAcasa";
import GrilaIndustrii from "@/components/acasa/GrilaIndustrii";
import Testimonial from "@/components/acasa/Testimonial";
import LegaturaCanal from "@/components/canale/LegaturaCanal";
import Erou, { type ContinutErou } from "@/components/erou/Erou";
import FunctionalitatiAcasa from "@/components/functionalitati-acasa/FunctionalitatiAcasa";
import PasiFunctionalitatiRoMd from "@/components/functionalitati-acasa/PasiFunctionalitatiRoMd";
import Buton, { claseButon, type VariantaButon } from "@/components/primitive/Buton";
import s from "@/components/primitive/Buton.module.css";
import CtaFinalInchis from "@/components/primitive/CtaFinalInchis";
import Iconita from "@/components/primitive/Iconita";
import SiglaTert from "@/components/primitive/SiglaTert";
import type { NodJsonLd } from "@/components/seo/date-structurate";
import JsonLd from "@/components/seo/JsonLd";
import { metadataPagina } from "@/components/seo/metadata";
import { EROU } from "@/content/acasa";
import { CANALE, legaturaWhatsApp } from "@/content/canale";
import type { LegaturaPeCale } from "@/content/navigatie";
import { ETICHETA_WHATSAPP_RO_MD } from "@/content/navigatie-ro-md";
import { emailAcasa, ghiduriPublicate, pagina } from "@/content/ro-md/acasa";
import {
  ANCORA_FINAL_RO_MD,
  BANDA_PRET_RO_MD,
  CARD_ENTERPRISE_RO_MD,
  CARD_SECURITATE_RO_MD,
  CIFRE_RO_MD,
  CTA_FINAL_RO_MD,
  EROU_RO_MD,
  EROU_SECUNDAR_RO_MD,
  FUNCTIONALITATI_RO_MD,
  INDUSTRII_RO_MD,
  INTREBARI_RO_MD,
  SUBSOL_FAQ_CU_EMAIL,
  TESTIMONIAL_RO_MD,
  TESTIMONIAL_RO_MD_FARA_GHIDURI,
} from "@/content/ro-md/acasa-componente";
import { atributeLimba } from "@/lib/asezare";
import { adresaSite } from "@/lib/site";

export const metadata: Metadata = metadataPagina({
  titlu: pagina.meta.titlu,
  descriere: pagina.meta.descriere,
  cale: pagina.meta.cale,
  editie: "ro-MD",
  cheie: pagina.cheie,
});

/** Bucla editiei RO fara centru si fara legenda: pe 3s.md centrul arata numai sigla (`lansare={false}`). */
function buclaFaraLansare(bucla: ContinutErou["bucla"]): ContinutErou["bucla"] {
  const rest = { ...bucla };
  delete rest.centru;
  delete rest.legenda;
  return rest;
}

const EROU_PAGINA: ContinutErou = { ...EROU_RO_MD, bucla: buclaFaraLansare(EROU.bucla) };

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
      <span>{ETICHETA_WHATSAPP_RO_MD}</span>
      <Iconita nume="arrow-right" marime={18} contur={1.5} className={s.sageata} />
    </LegaturaCanal>
  );
}

/** Nodul FAQPage: intrebarile si raspunsurile vizibile ale sectiunii de intrebari, exact. */
function nodFaq(): NodJsonLd {
  const baza = adresaSite();
  return {
    "@type": "FAQPage",
    "@id": baza + "/ro#faq",
    inLanguage: atributeLimba("ro-MD").inLanguage,
    mainEntity: INTREBARI_RO_MD.intrebari.map((i) => ({
      "@type": "Question",
      name: i.intrebare,
      acceptedAnswer: { "@type": "Answer", text: i.raspuns },
    })),
  } as NodJsonLd;
}

export default function PaginaStartRoMd() {
  const href = legaturaWhatsApp(pagina.cta.ref, pagina.cta.textWhatsapp);
  const whatsapp: LegaturaPeCale | null = href === null ? null : { implicit: href, pagini: [] };
  const email = emailAcasa();
  const intrebari =
    email === null
      ? INTREBARI_RO_MD
      : { ...INTREBARI_RO_MD, subsol: { inainte: SUBSOL_FAQ_CU_EMAIL, posta: { text: CANALE.email, href: email, ruta: null } } };
  const noduri = [...(pagina.jsonLd as NodJsonLd[]), nodFaq()];

  return (
    <main>
      <JsonLd date={{ "@context": "https://schema.org", "@graph": noduri }} />
      <Erou
        continut={EROU_PAGINA}
        lansare={false}
        butoane={
          <>
            <ButonCanal legatura={whatsapp} varianta="plin" stralucire />
            <Buton
              varianta="contur"
              marime="mare"
              iconitaInainte="circle-play"
              legatura={{ text: EROU_SECUNDAR_RO_MD.text, href: EROU_SECUNDAR_RO_MD.href, ruta: null }}
            >
              {EROU_SECUNDAR_RO_MD.text}
            </Buton>
          </>
        }
      />
      <ConstructorRoMd tinta={href} />
      <FunctionalitatiAcasa continut={FUNCTIONALITATI_RO_MD} pasi={<PasiFunctionalitatiRoMd />} />
      <BandaCifre continut={CIFRE_RO_MD} />
      <GrilaIndustrii continut={INDUSTRII_RO_MD} />
      <Testimonial continut={ghiduriPublicate() ? TESTIMONIAL_RO_MD : TESTIMONIAL_RO_MD_FARA_GHIDURI} />
      <CardSecuritate continut={CARD_SECURITATE_RO_MD} />
      <CardEnterprise continut={CARD_ENTERPRISE_RO_MD} />
      <BandaPret continut={BANDA_PRET_RO_MD} />
      <FaqAcasa continut={intrebari} />
      <CtaFinalInchis
        id={ANCORA_FINAL_RO_MD}
        continut={CTA_FINAL_RO_MD}
        butoane={<ButonCanal legatura={whatsapp} varianta="alb-pe-inchis" stralucire={false} />}
      />
    </main>
  );
}
