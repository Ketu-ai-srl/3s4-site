import { imagineSociala } from "@/components/seo/imagine-sociala";

// Imaginea cardului social (`twitter:image`): aceeasi ca imaginea Open Graph, declarata separat ca
// retelele care citesc numai eticheta lor sa o gaseasca fara sa ghiceasca. Ca si imaginea Open
// Graph, Next o pune singur numai pe paginile care nu-si declara `twitter`; paginile interioare o
// primesc explicit din `metadataPagina`. Valorile se scriu literal; proba le compara cu `metadata.ts`.

export const alt = "Sigla 3S Scan Store Solve";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function ImagineCard() {
  return imagineSociala();
}
