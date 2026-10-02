// Pagina P03 a editiei `en`: `/features/search` (grupul produs). Textul e in modulul `src/content/en/features-search.ts`,
// importat DIRECT (conditia portii de registru: afirmatiile paginii numesc modulul). Scheletul, canalele si datele
// structurate sunt ale scheletului comun `../_produs/PaginaProdus`.

import { metadataPagina } from "@/components/seo/metadata";
import { inJur, pagina } from "@/content/en/features-search";
import PaginaProdus from "../_produs/PaginaProdus";

export const metadata = metadataPagina({
  titlu: pagina.meta.titlu,
  descriere: pagina.meta.descriere,
  cale: pagina.meta.cale,
  editie: "en",
  cheie: pagina.cheie,
});

export default function Pagina() {
  return <PaginaProdus pagina={pagina} inJur={inJur} />;
}
