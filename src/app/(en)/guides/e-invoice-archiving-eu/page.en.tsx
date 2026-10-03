// Pagina G1 a editiei `en`: `/guides/e-invoice-archiving-eu` (grupul referinta). Textul e in modulul `src/content/en/guides-e-invoice-archiving-eu.ts`, importat
// DIRECT (conditia portii de registru: afirmatiile paginii numesc modulul). Scheletul, canalele si datele
// structurate sunt ale scheletului comun `../_referinta/PaginaReferinta`.

import { metadataPagina } from "@/components/seo/metadata";
import { inJur, pagina } from "@/content/en/guides-e-invoice-archiving-eu";
import PaginaReferinta from "../_referinta/PaginaReferinta";

export const metadata = metadataPagina({
  titlu: pagina.meta.titlu,
  descriere: pagina.meta.descriere,
  cale: pagina.meta.cale,
  editie: "en",
  cheie: pagina.cheie,
});

export default function Pagina() {
  return <PaginaReferinta pagina={pagina} inJur={inJur} />;
}
