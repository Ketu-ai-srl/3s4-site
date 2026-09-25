import PaginaSector from "@/components/solutii/PaginaSector";
import { metadataPagina } from "@/components/seo/metadata";
import { NOTARIATE } from "@/content/solutii/notariate";

// Pagina de sector pe sablonul comun (`PaginaSector`); continutul e in `src/content/solutii/notariate.ts`.

export const metadata = metadataPagina({
  titlu: NOTARIATE.meta.titlu,
  descriere: NOTARIATE.meta.descriere,
  cale: NOTARIATE.cale,
});

export default function Pagina() {
  return <PaginaSector sector={NOTARIATE} />;
}
