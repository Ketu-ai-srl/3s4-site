import CtaFinalInchis from "@/components/primitive/CtaFinalInchis";
import PaginaPlatforma from "@/components/produs/PaginaPlatforma";
import JsonLd from "@/components/seo/JsonLd";
import { metadataPagina } from "@/components/seo/metadata";
import { grafIntrebariPagina } from "@/content/produs/intrebari";
import { CALE_PLATFORMA, INTREBARI_PLATFORMA, META_PLATFORMA } from "@/content/produs/platforma";

// Pagina `/platforma` (felia `produs`; fisa platforma.md). Corpul sta in `PaginaPlatforma`, textele
// in contractul `src/content/produs/platforma.ts`. Datele structurate: firul de pagina il emite
// `FirPagina` (BreadcrumbList), intrebarile frecvente se dau aici ca `FAQPage`, din acelasi text
// care se vede pe pagina.

export const metadata = metadataPagina({
  titlu: META_PLATFORMA.titlu,
  descriere: META_PLATFORMA.descriere,
  cale: CALE_PLATFORMA,
});

export default function Platforma() {
  return (
    <main>
      <PaginaPlatforma />
      <CtaFinalInchis />
      <JsonLd date={grafIntrebariPagina(CALE_PLATFORMA, INTREBARI_PLATFORMA)} />
    </main>
  );
}
