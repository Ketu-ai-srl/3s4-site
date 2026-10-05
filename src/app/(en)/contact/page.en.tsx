// Pagina de contact, editia `en` (P10, `/contact`): aceleasi componente si aceeasi compunere ca pagina de contact RO
// (`src/app/contact/page.tsx`, decizia 53), cu textul in engleza din `src/content/en/contact-componente.ts`.
//
// Ordinea RO: PaginaContact (erou, caseta, subiecte, canale, marca), SectiuneFormular, CtaFinalInchis. Formularul nu
// exista pe 3s.md (decizia 3); canalele raman in caseta, in panoul de canale si in blocul de final. Diferentele de forma
// sunt in lista declarata a perechii (`config/congruenta/p10.json`).
//
// Canalele urmeaza canalele domeniului (`CANALE_JSON`): WhatsApp cu textul precompletat al paginii (`[ref:en-contact]`,
// din `contact.ts`), numarul afisat ca numar de WhatsApp (fara legatura de apel, decizia 56), e-mailul numai cand
// domeniul are adresa (P-40). Metadata, nodul WebPage si registrul de afirmatii vin din `contact.ts`; firul
// (`BreadcrumbList`) il emite eroul, o singura data.

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
import { pagina } from "@/content/en/contact";
import {
  BUTON_CASETA_EN,
  BUTON_FINAL_EN,
  CANALE_EN,
  CONTACT_EN,
  CTA_FINAL_CONTACT_EN,
  ETICHETA_FIR_EN,
  subtitluContactEn,
} from "@/content/en/contact-componente";
import { alegePeCale, type LegaturaPeCale } from "@/content/navigatie";
import { navigatieEn } from "@/content/navigatie-en";

export const metadata: Metadata = metadataPagina({
  titlu: pagina.meta.titlu,
  descriere: pagina.meta.descriere,
  cale: pagina.meta.cale,
  editie: "en",
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
  text,
  varianta,
  marime,
  sageata,
}: {
  legatura: LegaturaPeCale | null;
  text: string;
  varianta: VariantaButon;
  marime: MarimeButon;
  sageata: boolean;
}) {
  if (legatura === null) return null;
  return (
    <LegaturaCanal legatura={legatura} canal="whatsapp" className={claseButon(varianta, marime)}>
      <span>{text}</span>
      {sageata ? <Iconita nume="arrow-right" marime={18} contur={1.5} className={bs.sageata} /> : null}
    </LegaturaCanal>
  );
}

export default function PaginaContactEn() {
  const href = legaturaWhatsApp(pagina.cta.ref, pagina.cta.textWhatsapp);
  const whatsapp: LegaturaPeCale | null = href === null ? null : { implicit: href, pagini: [] };
  const numar = numarAfisat();
  // Adresa de e-mail numai dupa P-40: legatura (cu subiectul si corpul paginii, din navigatie) exista numai cand
  // domeniul are adresa.
  const posta = navigatieEn().subsol.contact?.email?.legatura ?? null;
  const mailto = posta === null ? null : alegePeCale(posta, pagina.meta.cale);
  const randuri: RandPanou[] = [
    ...(href === null ? [] : [{ nume: CANALE_EN.whatsapp, legatura: { text: numar, href, ruta: null }, stare: CANALE_EN.deschis }]),
    ...(mailto === null ? [] : [{ nume: CANALE_EN.email, legatura: { text: CANALE.email, href: mailto, ruta: null }, stare: CANALE_EN.deschis }]),
  ];
  const continut = { ...CONTACT_EN, erou: { ...CONTACT_EN.erou, subtitlu: subtitluContactEn(numar, mailto === null ? "" : CANALE.email) } };

  return (
    <main>
      <JsonLd date={{ "@context": "https://schema.org", "@graph": noduri() }} />
      <PaginaContact
        continut={continut}
        etichetaFir={ETICHETA_FIR_EN}
        randuri={randuri}
        butonCaseta={<ButonCanal legatura={whatsapp} text={BUTON_CASETA_EN} varianta="plin" marime="plat" sageata={false} />}
      />
      <CtaFinalInchis
        continut={CTA_FINAL_CONTACT_EN}
        butoane={<ButonCanal legatura={whatsapp} text={BUTON_FINAL_EN} varianta="alb-pe-inchis" marime="mare" sageata />}
      />
    </main>
  );
}
