// Datele structurate ale paginilor EN de referinta (G1, G2, G3): nodurile Article si WebPage din modulul paginii,
// cu `@id`, autorul si editorul (organizatia site-ului, prin `@id`) si legatura dintre ele. `BreadcrumbList` il pune
// firul de pagina (`FirPagina`), ca pe perechile RO; `FAQPage`, unde pagina are intrebari vizibile, il pune sectiunea
// intrebarilor (G1), din aceleasi intrebari. Organizatia si site-ul le pune layout-ul.

import {
  iduri,
  type GrafJsonLd,
  type NodJsonLd,
} from "@/components/seo/date-structurate";
import type { PaginaReferinta } from "@/content/en/referinta-comun";
import { adresaSite, urlAbsolut } from "@/lib/site";

export function grafReferinta(
  pagina: PaginaReferinta,
  baza: string = adresaSite(),
): GrafJsonLd {
  const url = urlAbsolut(pagina.meta.cale, baza);
  const id = iduri(baza);
  const articol = pagina.jsonLd.find((n) => n["@type"] === "Article");
  const webPage = pagina.jsonLd.find((n) => n["@type"] === "WebPage");
  if (articol === undefined)
    throw new Error(pagina.cheie + ": modulul nu are nodul Article");
  if (webPage === undefined)
    throw new Error(pagina.cheie + ": modulul nu are nodul WebPage");
  const noduri: NodJsonLd[] = [
    {
      ...articol,
      "@type": "Article",
      "@id": url + "#articol",
      mainEntityOfPage: { "@id": url + "#pagina" },
      author: { "@id": id.organizatie },
      publisher: { "@id": id.organizatie },
    },
    {
      ...webPage,
      "@type": "WebPage",
      "@id": url + "#pagina",
      url,
      isPartOf: { "@id": id.site },
    },
  ];
  return { "@context": "https://schema.org", "@graph": noduri };
}
