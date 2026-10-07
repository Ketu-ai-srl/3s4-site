// Pagina de contact a editiei `ro-MD` (`/ro/contact` pe 3s.md): aceleasi componente si aceeasi compunere ca pagina de
// contact RO (`src/app/contact/page.tsx`, decizia 53), cu textul editiei din `src/content/ro-md/contact-componente.ts`;
// blocul de final are textul startului /ro. Aceeasi pagina, in engleza, e `src/app/(en)/contact/page.en.tsx`.
//
// Ordinea RO: PaginaContact (erou, caseta, subiecte, canale, marca), SectiuneFormular, CtaFinalInchis. Formularul nu
// exista pe 3s.md (decizia 3). Diferentele de forma sunt in lista declarata a perechii (`config/congruenta/p10.json`).
//
// Canalele urmeaza canalele domeniului (`CANALE_JSON`): WhatsApp cu textul precompletat al paginii
// (`[ref:ro-md-contact]`, din `contact.ts`), numarul afisat ca numar de WhatsApp (fara legatura de apel, decizia 56),
// e-mailul numai cand domeniul are adresa (P-40). Metadata, nodul WebPage si registrul de afirmatii vin din
// `contact.ts`; firul (`BreadcrumbList`) il emite eroul, o singura data.

import type { Metadata } from "next";
import LegaturaCanal from "@/components/canale/LegaturaCanal";
import PaginaContact, { type RandPanou } from "@/components/conversie/PaginaContact";
import { claseButon, type MarimeButon, type VariantaButon } from "@/components/primitive/Buton";
import bs from "@/components/primitive/Buton.module.css";
import CtaFinalInchis from "@/components/primitive/CtaFinalInchis";
import Iconita from "@/components/primitive/Iconita";
import type { NodJsonLd } from "@/components/seo/date-structurate";
import JsonLd from "@/components/seo/JsonLd";
import { metadataPagina } from "@/components/seo/metadata";
import { CANALE, legaturaWhatsApp, numarAfisat } from "@/content/canale";
import type { LegaturaPeCale } from "@/content/navigatie";
import { CTA_FINAL_RO_MD } from "@/content/ro-md/acasa-componente";
import { emailContact, pagina } from "@/content/ro-md/contact";
import {
  BUTON_WHATSAPP_RO_MD,
  CANALE_RO_MD,
  CONTACT_RO_MD,
  LEGATURA_INFORMATII_LEGALE_RO_MD,
  subtitluContactRoMd,
} from "@/content/ro-md/contact-componente";

export const metadata: Metadata = metadataPagina({
  titlu: pagina.meta.titlu,
  descriere: pagina.meta.descriere,
  cale: pagina.meta.cale,
  editie: "ro-MD",
  cheie: pagina.cheie,
});

/** Nodurile paginii: cele din modul, fara firul (il emite eroul) si fara trimiterea la el. */
function noduri(): NodJsonLd[] {
  return (pagina.jsonLd as NodJsonLd[])
    .filter((n) => n["@type"] !== "BreadcrumbList")
    .map((n) => Object.fromEntries(Object.entries(n).filter(([k]) => k !== "breadcrumb")) as NodJsonLd);
}

/** Butonul de canal WhatsApp, cu clasele butonului site-ului si sageata; fara WhatsApp pe domeniu, nimic. */
function ButonCanal({
  legatura,
  varianta,
  marime,
  sageata,
}: {
  legatura: LegaturaPeCale | null;
  varianta: VariantaButon;
  marime: MarimeButon;
  sageata: boolean;
}) {
  if (legatura === null) return null;
  return (
    <LegaturaCanal legatura={legatura} canal="whatsapp" className={claseButon(varianta, marime)}>
      <span>{BUTON_WHATSAPP_RO_MD}</span>
      {sageata ? <Iconita nume="arrow-right" marime={18} contur={1.5} className={bs.sageata} /> : null}
    </LegaturaCanal>
  );
}

export default function PaginaContactRoMd() {
  const href = legaturaWhatsApp(pagina.cta.ref, pagina.cta.textWhatsapp);
  const whatsapp: LegaturaPeCale | null = href === null ? null : { implicit: href, pagini: [] };
  const numar = numarAfisat();
  const mailto = emailContact();
  const randuri: RandPanou[] = [
    ...(href === null ? [] : [{ nume: CANALE_RO_MD.whatsapp, legatura: { text: numar, href, ruta: null } }]),
    ...(mailto === null ? [] : [{ nume: CANALE_RO_MD.email, legatura: { text: CANALE.email, href: mailto, ruta: null } }]),
  ];
  const continut = { ...CONTACT_RO_MD, erou: { ...CONTACT_RO_MD.erou, subtitlu: subtitluContactRoMd(numar, mailto === null ? "" : CANALE.email) } };

  return (
    <main>
      <JsonLd date={{ "@context": "https://schema.org", "@graph": noduri() }} />
      <PaginaContact
        continut={continut}
        randuri={randuri}
        legaturaInText={LEGATURA_INFORMATII_LEGALE_RO_MD}
        butonCaseta={<ButonCanal legatura={whatsapp} varianta="plin" marime="plat" sageata={false} />}
      />
      <CtaFinalInchis continut={CTA_FINAL_RO_MD} butoane={<ButonCanal legatura={whatsapp} varianta="alb-pe-inchis" marime="mare" sageata />} />
    </main>
  );
}
