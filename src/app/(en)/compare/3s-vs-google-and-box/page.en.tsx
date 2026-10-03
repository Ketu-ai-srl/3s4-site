// Pagina G3 a editiei `en`: `/compare/3s-vs-google-and-box` (grupul referinta). Textul e in modulul `src/content/en/compare-3s-vs-google-and-box.ts`, importat
// DIRECT (conditia portii de registru: afirmatiile paginii numesc modulul). Scheletul, canalele si datele
// structurate sunt ale scheletului comun `../../guides/_referinta/PaginaReferinta`.

import { metadataPagina } from "@/components/seo/metadata";
import { inJur, pagina } from "@/content/en/compare-3s-vs-google-and-box";
import PaginaReferinta from "../../guides/_referinta/PaginaReferinta";

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
