import { imagineSociala } from "@/components/seo/imagine-sociala";

// Imaginea Open Graph a editiei `en`, la aceeasi adresa ca pe site-ul romanesc (`/opengraph-image`): aceeasi
// iconita a marcii, fara text, generata la construire (`src/components/seo/imagine-sociala.tsx`).
//
// E o RUTA, nu un fisier de metadata. Un `opengraph-image.en.tsx` (conventia de metadata a lui Next) schimba
// build-ul romanesc chiar daca nu e compilat acolo: muta o foaie de stil intre pagini (masurat la alegerea
// variantei editiilor, doua build-uri din doua pe fiecare arbore). Ca ruta, build-ul romanesc ramane identic.
// Fiind ruta, Next n-o pune singur in `<head>`: paginile EN o declara explicit, prin `metadataPagina` (marimea
// si textul alternativ EN sunt acolo, `src/components/seo/metadata.ts`).
//
// Exista numai pe build-ul cu editia `en` (extensia `.en.tsx` e in `pageExtensions` doar acolo).

export const dynamic = "force-static";

export function GET() {
  return imagineSociala();
}
