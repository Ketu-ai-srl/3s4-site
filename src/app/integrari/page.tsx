import CtaFinalInchis from "@/components/primitive/CtaFinalInchis";
import PaginaIntegrari from "@/components/produs/PaginaIntegrari";
import { metadataPagina } from "@/components/seo/metadata";
import { CALE_INTEGRARI, META_INTEGRARI } from "@/content/produs/integrari";

// Pagina `/integrari` (felia `produs`; fisa integrari.md). Corpul sta in `PaginaIntegrari`, textele
// in contractul `src/content/produs/integrari.ts`. Firul de pagina emite `BreadcrumbList`; pagina
// nu are intrebari frecvente, deci nici `FAQPage`.

export const metadata = metadataPagina({
  titlu: META_INTEGRARI.titlu,
  descriere: META_INTEGRARI.descriere,
  cale: CALE_INTEGRARI,
});

export default function Integrari() {
  return (
    <main>
      <PaginaIntegrari />
      <CtaFinalInchis />
    </main>
  );
}
