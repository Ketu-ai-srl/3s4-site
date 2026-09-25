import PaginaSector from "@/components/solutii/PaginaSector";
import { metadataPagina } from "@/components/seo/metadata";
import { LOGISTICA } from "@/content/solutii/logistica";

// Pagina de sector pe sablonul comun (`PaginaSector`); continutul e in `src/content/solutii/logistica.ts`.

export const metadata = metadataPagina({
  titlu: LOGISTICA.meta.titlu,
  descriere: LOGISTICA.meta.descriere,
  cale: LOGISTICA.cale,
});

export default function Pagina() {
  return <PaginaSector sector={LOGISTICA} />;
}
