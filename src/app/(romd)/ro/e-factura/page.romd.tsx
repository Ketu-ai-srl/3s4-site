// Pagina "Arhiva e-Factura" a editiei `ro-MD`: `/ro/e-factura` pe 3s.md (geamana `/e-factura` pe 3s.com.ro). Serviciul
// de arhivare automata a facturilor din RO e-Factura e in pregatire; actiunea paginii e inscrierea la acces timpuriu,
// pe WhatsApp, cu `[ref:ro-md-e-factura]` (decizia 3: pe 3s.md contactul e pe canale, nu pe formular). Fara alta
// actiune concurenta: butonul din erou si cel din blocul de final duc in aceeasi conversatie.
//
// Compunerea, din piese existente: EroulInterior (varianta `sector`: fir, h1, subtitlu, butonul, nota de sub el, plus
// pastila "Acces timpuriu"), sectiunile din `SectiuniArhivaEfactura` (clasele paginii /e-facturare), CtaFinalInchis.
// Textul vine din `src/content/ro-md/e-factura-componente.ts`, importat DIRECT (conditia portii de registru); metadata,
// nodul WebPage si textul precompletat din `src/content/ro-md/e-factura.ts`. Firul il emite `FirPagina` (BreadcrumbList).

import type { Metadata } from "next";
import ButonCanal from "@/app/(en)/guides/_referinta/ButonCanal";
import {
  ContabiliEfactura,
  FereastraSpv,
  IntrebariArhivaEfactura,
  LoculDatelorEfactura,
  PasiEfactura,
  PreturiEfactura,
  PrimestiEfactura,
} from "@/components/efacturare/SectiuniArhivaEfactura";
import CtaFinalInchis from "@/components/primitive/CtaFinalInchis";
import s from "@/components/efacturare/efacturare.module.css";
import EroulInterior from "@/components/primitive/EroulInterior";
import Pastila from "@/components/primitive/Pastila";
import type { NodJsonLd } from "@/components/seo/date-structurate";
import JsonLd from "@/components/seo/JsonLd";
import { metadataPagina } from "@/components/seo/metadata";
import { pagina } from "@/content/ro-md/e-factura";
import {
  CTA_FINAL_EFACTURA_RO_MD,
  EFACTURA_RO_MD,
  ETICHETA_BUTON_FINAL_EFACTURA_RO_MD,
} from "@/content/ro-md/e-factura-componente";
import { atributeLimba } from "@/lib/asezare";

export const metadata: Metadata = metadataPagina({
  titlu: pagina.meta.titlu,
  descriere: pagina.meta.descriere,
  cale: pagina.meta.cale,
  editie: "ro-MD",
  cheie: pagina.cheie,
});

export default function PaginaArhivaEfactura() {
  const c = EFACTURA_RO_MD;
  return (
    <main>
      <JsonLd date={{ "@context": "https://schema.org", "@graph": pagina.jsonLd as NodJsonLd[] }} />
      <EroulInterior
        varianta="sector"
        fir={c.erou.fir}
        eticheta={<Pastila varianta="categorie">{c.erou.eticheta}</Pastila>}
        titlu={c.erou.titlu}
        subtitlu={c.erou.subtitlu}
        actiuni={
          // Eticheta lunga se rupe pe doua randuri pe telefon (clasa din `efacturare.module.css`), in loc sa iasa din buton.
          <span className={s.erouButonLung}>
            <ButonCanal cta={pagina.cta} text={c.erou.buton} varianta="plin" marime="plat" sageata />
          </span>
        }
        nota={c.erou.subButon}
      />
      <FereastraSpv continut={c} />
      <PasiEfactura continut={c} />
      <PrimestiEfactura continut={c} />
      <ContabiliEfactura continut={c} />
      <LoculDatelorEfactura continut={c} />
      <PreturiEfactura continut={c} />
      <IntrebariArhivaEfactura continut={c} cale={pagina.meta.cale} limba={atributeLimba("ro-MD").inLanguage} />
      <CtaFinalInchis
        continut={CTA_FINAL_EFACTURA_RO_MD}
        butoane={
          <ButonCanal cta={pagina.cta} text={ETICHETA_BUTON_FINAL_EFACTURA_RO_MD} varianta="alb-pe-inchis" marime="mare" sageata />
        }
      />
    </main>
  );
}
