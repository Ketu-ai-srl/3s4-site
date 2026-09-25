import PaginaSector from "@/components/solutii/PaginaSector";
import { metadataPagina } from "@/components/seo/metadata";
import { AVOCATURA } from "@/content/solutii/avocatura";

// Pagina de sector pe sablonul comun (`PaginaSector`); continutul e in `src/content/solutii/avocatura.ts`.

export const metadata = metadataPagina({
  titlu: AVOCATURA.meta.titlu,
  descriere: AVOCATURA.meta.descriere,
  cale: AVOCATURA.cale,
});

export default function Pagina() {
  return <PaginaSector sector={AVOCATURA} />;
}
