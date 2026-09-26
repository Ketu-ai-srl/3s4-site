import { imagineSociala } from "@/components/seo/imagine-sociala";

// Imaginea Open Graph a site-ului: sigla oficiala, generata la construire
// (`src/components/seo/imagine-sociala.tsx`). Next o pune singur numai pe paginile care nu-si
// declara `openGraph` (startul, pagina de negasit); paginile interioare o primesc explicit din
// `metadataPagina` (`src/components/seo/metadata.ts`, unde e si motivul).
// Valorile de mai jos se scriu literal: Next le citeste ca metadata a fisierului. Proba le compara
// cu constantele din `metadata.ts` (tests/seo-geo-gdpr.test.ts).

export const alt = "Sigla 3S Scan Store Solve";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function ImagineOpenGraph() {
  return imagineSociala();
}
