// Pagina Enterprise a editiei `ro-MD` (P09, `/ro/enterprise` pe 3s.md): aceleasi componente si aceeasi compunere ca
// pagina Enterprise RO (`src/app/enterprise/page.tsx`) si ca perechea EN (`src/app/(en)/enterprise/page.en.tsx`,
// decizia 53), cu textul editiei din `src/content/ro-md/enterprise-componente.ts`.
//
// Ordinea RO: EroulEnterprise, BandaDrumDocument, ListaLivrabile, SectiuneFormular. Formularul nu exista pe 3s.md
// (decizia 3): in sectiunea lui, cu aceeasi ancora, acelasi invelis si acelasi cap, sta blocul de canal WhatsApp.
// Diferentele de forma sunt in lista declarata a perechii (`config/congruenta/p09.json`).
//
// Canalele: butonul din erou si cel din blocul de canal duc la WhatsApp, cu textul precompletat al paginii
// (`[ref:ro-md-enterprise]`, din `enterprise.ts`). Metadata, nodul WebPage si registrul de afirmatii vin din
// `enterprise.ts`; firul (`BreadcrumbList`) il emite eroul, o singura data.

import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import LegaturaCanal from "@/components/canale/LegaturaCanal";
import EroulEnterprise from "@/components/enterprise/EroulEnterprise";
import ListaLivrabile from "@/components/enterprise/ListaLivrabile";
import es from "@/components/enterprise/enterprise.module.css";
import fs from "@/components/formular/Formular.module.css";
import CapSectiune from "@/components/primitive/CapSectiune";
import Reveal from "@/components/primitive/Reveal";
import Tinta from "@/components/primitive/Tinta";
import type { NodJsonLd } from "@/components/seo/date-structurate";
import JsonLd from "@/components/seo/JsonLd";
import { metadataPagina } from "@/components/seo/metadata";
import { legaturaWhatsApp } from "@/content/canale";
import type { LegaturaPeCale } from "@/content/navigatie";
import { pagina } from "@/content/ro-md/enterprise";
import {
  ANCORA_CANAL,
  BUTON_WHATSAPP_ENTERPRISE_RO_MD,
  CANAL_ENTERPRISE_RO_MD,
  EROU_ENTERPRISE_RO_MD,
  LIVRABILE_RO_MD,
  MICROTEXT_ENTERPRISE_RO_MD,
} from "@/content/ro-md/enterprise-componente";
import BandaDrumDocumentRoMd from "../_editie/BandaDrumDocumentRoMd";

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

export default function PaginaEnterpriseRoMd() {
  const href = legaturaWhatsApp(pagina.cta.ref, pagina.cta.textWhatsapp);
  const whatsapp: LegaturaPeCale | null = href === null ? null : { implicit: href, pagini: [] };
  const e = EROU_ENTERPRISE_RO_MD;

  return (
    <main>
      <JsonLd date={{ "@context": "https://schema.org", "@graph": noduri() }} />
      <EroulEnterprise
        continut={e}
        butoane={
          <>
            {whatsapp === null ? null : (
              <LegaturaCanal legatura={whatsapp} canal="whatsapp" className={es.butonErou}>
                <span>{BUTON_WHATSAPP_ENTERPRISE_RO_MD}</span>
                <ArrowRight size={16} strokeWidth={2} aria-hidden="true" />
              </LegaturaCanal>
            )}
            {e.secundara ? (
              <Tinta legatura={e.secundara} className={es.legaturaSecundara}>
                {e.secundara.text}
              </Tinta>
            ) : null}
          </>
        }
      />
      <BandaDrumDocumentRoMd />
      <ListaLivrabile continut={LIVRABILE_RO_MD} />
      <section id={ANCORA_CANAL} className={fs.sectiune} aria-labelledby={ANCORA_CANAL + "-titlu"}>
        <div className="container-site">
          <Reveal className={fs.invelis}>
            <CapSectiune
              eticheta={CANAL_ENTERPRISE_RO_MD.eticheta}
              titlu={CANAL_ENTERPRISE_RO_MD.titlu}
              subtitlu={CANAL_ENTERPRISE_RO_MD.subtitlu}
              margineJos={32}
              id={ANCORA_CANAL + "-titlu"}
            />
            <div className={fs.card} data-canal-pagina="">
              {whatsapp === null ? null : (
                <LegaturaCanal legatura={whatsapp} canal="whatsapp" className={fs.trimite}>
                  <span>{BUTON_WHATSAPP_ENTERPRISE_RO_MD}</span>
                  <ArrowRight size={16} strokeWidth={2} aria-hidden="true" />
                </LegaturaCanal>
              )}
              <p className={fs.informare}>{MICROTEXT_ENTERPRISE_RO_MD}</p>
            </div>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
