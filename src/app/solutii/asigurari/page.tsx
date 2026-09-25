import PaginaSector from "@/components/solutii/PaginaSector";
import { metadataPagina } from "@/components/seo/metadata";
import { ASIGURARI } from "@/content/solutii/asigurari";

// Pagina de sector pe sablonul comun (`PaginaSector`); continutul e in `src/content/solutii/asigurari.ts`.

export const metadata = metadataPagina({
  titlu: ASIGURARI.meta.titlu,
  descriere: ASIGURARI.meta.descriere,
  cale: ASIGURARI.cale,
});

export default function Pagina() {
  return <PaginaSector sector={ASIGURARI} />;
}
