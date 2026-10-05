// Pagina Enterprise, editia `en` (P09, `/enterprise`): aceleasi componente si aceeasi compunere ca pagina Enterprise
// RO (`src/app/enterprise/page.tsx`, decizia 53), cu textul in engleza din `src/content/en/enterprise-componente.ts`.
//
// Ordinea RO: EroulEnterprise, BandaDrumDocument, ListaLivrabile, SectiuneFormular. Formularul nu exista pe 3s.md
// (decizia 3): in sectiunea lui, cu aceeasi ancora, acelasi invelis si acelasi cap, sta blocul de canal WhatsApp, cu
// textul aprobat. Diferentele de forma sunt in lista declarata a perechii (`config/congruenta/p09.json`).
//
// Canalele: butonul din erou si cel din blocul de canal duc la WhatsApp, cu textul precompletat al paginii
// (`[ref:en-ent]`, din `enterprise.ts`). Metadata, nodul WebPage si registrul de afirmatii vin din `enterprise.ts`;
// firul (`BreadcrumbList`) il emite eroul, o singura data.

import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import LegaturaCanal from "@/components/canale/LegaturaCanal";
import BandaDrumDocumentEn from "@/components/enterprise/BandaDrumDocumentEn";
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
import { pagina } from "@/content/en/enterprise";
import {
  ANCORA_CANAL,
  BUTON_EROU_EN,
  CANAL_ENTERPRISE_EN,
  EROU_ENTERPRISE_EN,
  ETICHETA_FIR_EN,
  LIVRABILE_EN,
} from "@/content/en/enterprise-componente";
import { MICROTEXT } from "@/content/en/home";
import { ETICHETA_WHATSAPP_EN } from "@/content/navigatie-en";
import type { LegaturaPeCale } from "@/content/navigatie";

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

export default function PaginaEnterpriseEn() {
  const href = legaturaWhatsApp(pagina.cta.ref, pagina.cta.textWhatsapp);
  const whatsapp: LegaturaPeCale | null = href === null ? null : { implicit: href, pagini: [] };
  const e = EROU_ENTERPRISE_EN;

  return (
    <main>
      <JsonLd date={{ "@context": "https://schema.org", "@graph": noduri() }} />
      <EroulEnterprise
        continut={e}
        etichetaFir={ETICHETA_FIR_EN}
        butoane={
          <>
            {whatsapp === null ? null : (
              <LegaturaCanal legatura={whatsapp} canal="whatsapp" className={es.butonErou}>
                <span>{BUTON_EROU_EN}</span>
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
      <BandaDrumDocumentEn />
      <ListaLivrabile continut={LIVRABILE_EN} />
      <section id={ANCORA_CANAL} className={fs.sectiune} aria-labelledby={ANCORA_CANAL + "-titlu"}>
        <div className="container-site">
          <Reveal className={fs.invelis}>
            <CapSectiune
              eticheta={CANAL_ENTERPRISE_EN.eticheta}
              titlu={CANAL_ENTERPRISE_EN.titlu}
              subtitlu={CANAL_ENTERPRISE_EN.subtitlu}
              margineJos={32}
              id={ANCORA_CANAL + "-titlu"}
            />
            <div className={fs.card} data-canal-pagina="">
              {whatsapp === null ? null : (
                <LegaturaCanal legatura={whatsapp} canal="whatsapp" className={fs.trimite}>
                  <span>{ETICHETA_WHATSAPP_EN}</span>
                  <ArrowRight size={16} strokeWidth={2} aria-hidden="true" />
                </LegaturaCanal>
              )}
              <p className={fs.informare}>{MICROTEXT}</p>
            </div>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
