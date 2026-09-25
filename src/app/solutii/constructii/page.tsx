import PaginaSector from "@/components/solutii/PaginaSector";
import { metadataPagina } from "@/components/seo/metadata";
import { CONSTRUCTII } from "@/content/solutii/constructii";

// Pagina de sector pe sablonul comun (`PaginaSector`); continutul e in `src/content/solutii/constructii.ts`.

export const metadata = metadataPagina({
  titlu: CONSTRUCTII.meta.titlu,
  descriere: CONSTRUCTII.meta.descriere,
  cale: CONSTRUCTII.cale,
});

export default function Pagina() {
  return <PaginaSector sector={CONSTRUCTII} />;
}
