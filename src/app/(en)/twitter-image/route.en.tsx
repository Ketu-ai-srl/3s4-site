import { imagineSociala } from "@/components/seo/imagine-sociala";

// Imaginea cardului social (`twitter:image`) a editiei `en`, la aceeasi adresa ca pe site-ul romanesc
// (`/twitter-image`): aceeasi imagine ca Open Graph, declarata separat ca retelele care citesc numai eticheta
// lor s-o gaseasca fara sa ghiceasca. RUTA, nu fisier de metadata, din acelasi motiv ca
// `../opengraph-image/route.en.tsx`; paginile EN o declara explicit, prin `metadataPagina`.

export const dynamic = "force-static";

export function GET() {
  return imagineSociala();
}
