import PaginaHub from "@/components/solutii/PaginaHub";
import { metadataPagina } from "@/components/seo/metadata";
import { HUB } from "@/content/solutii/hub";

// Hub-ul solutiilor (`PaginaHub`); continutul e in `src/content/solutii/hub.ts`.

export const metadata = metadataPagina({
  titlu: HUB.meta.titlu,
  descriere: HUB.meta.descriere,
  cale: HUB.cale,
});

export default function Pagina() {
  return <PaginaHub />;
}
