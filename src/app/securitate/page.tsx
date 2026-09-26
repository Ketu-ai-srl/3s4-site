import PaginaSecuritate from "@/components/produs/PaginaSecuritate";
import JsonLd from "@/components/seo/JsonLd";
import { metadataPagina } from "@/components/seo/metadata";
import { grafIntrebariPagina } from "@/content/produs/intrebari";
import { CALE_SECURITATE, INTREBARI_SECURITATE, META_SECURITATE } from "@/content/produs/securitate";

// Pagina `/securitate` (felia `produs`; fisa securitate.md). Corpul sta in `PaginaSecuritate`,
// textele in contractul `src/content/produs/securitate.ts`. Fara CTA-ul final inchis: seiful ii tine
// locul, ca in forma masurata. Datele structurate: `BreadcrumbList` din `FirPagina` si `FAQPage`
// din aceleasi intrebari care se vad pe pagina.

export const metadata = metadataPagina({
  titlu: META_SECURITATE.titlu,
  descriere: META_SECURITATE.descriere,
  cale: CALE_SECURITATE,
});

export default function Securitate() {
  return (
    <main>
      <PaginaSecuritate />
      <JsonLd date={grafIntrebariPagina(CALE_SECURITATE, INTREBARI_SECURITATE)} />
    </main>
  );
}
