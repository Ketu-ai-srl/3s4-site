import PaginaSector from "@/components/solutii/PaginaSector";
import { metadataPagina } from "@/components/seo/metadata";
import { CONTABILITATE } from "@/content/solutii/contabilitate";

// Pagina de sector pe sablonul comun (`PaginaSector`); continutul e in `src/content/solutii/contabilitate.ts`.

export const metadata = metadataPagina({
  titlu: CONTABILITATE.meta.titlu,
  descriere: CONTABILITATE.meta.descriere,
  cale: CONTABILITATE.cale,
});

export default function Pagina() {
  return <PaginaSector sector={CONTABILITATE} />;
}
