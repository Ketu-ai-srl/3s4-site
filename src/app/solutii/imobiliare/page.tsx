import PaginaSector from "@/components/solutii/PaginaSector";
import { metadataPagina } from "@/components/seo/metadata";
import { IMOBILIARE } from "@/content/solutii/imobiliare";

// Pagina de sector pe sablonul comun (`PaginaSector`); continutul e in `src/content/solutii/imobiliare.ts`.

export const metadata = metadataPagina({
  titlu: IMOBILIARE.meta.titlu,
  descriere: IMOBILIARE.meta.descriere,
  cale: IMOBILIARE.cale,
});

export default function Pagina() {
  return <PaginaSector sector={IMOBILIARE} />;
}
