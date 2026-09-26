import PaginaDescarca from "@/components/conversie/PaginaDescarca";
import { metadataPagina } from "@/components/seo/metadata";
import { CALE_DESCARCA, META_DESCARCA } from "@/content/conversie";

// Pagina /descarca (felia conversie; descarca.md, sablonul interior-880). Aplicatia exista pe toate
// platformele (plan D4c), fara instalatori publici inca: fiecare tinta duce la contul gratuit
// (plan §6.9). `BreadcrumbList` il pune `FirPagina`.

export const metadata = metadataPagina({
  titlu: META_DESCARCA.titlu,
  descriere: META_DESCARCA.descriere,
  cale: CALE_DESCARCA,
});

export default function Descarca() {
  return (
    <main>
      <PaginaDescarca />
    </main>
  );
}
