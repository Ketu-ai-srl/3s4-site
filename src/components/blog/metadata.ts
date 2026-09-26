// Metadata paginilor de blog, prin `metadataPagina` (felia seo-geo-gdpr): titlul si descrierea in
// pragurile portii, canonical-ul pe adresa site-ului, Open Graph si cardul social cu imaginea marcii.
// Articolul primeste in plus forma de articol a Open Graph (data publicarii si a modificarii, sectiunea).
//
// Titlul articolului e titlul lui, fara numele marcii (blog__articol-sablon.md, "Date structurate"),
// descrierea e extrasul (acelasi text cu sapoul). Unicitatea pe tot site-ul o cere poarta de SEO;
// conducta refuza doua articole cu acelasi titlu sau acelasi extras.

import type { Metadata } from "next";
import { metadataPagina } from "@/components/seo/metadata";
import type { ArticolComplet } from "@/content/blog/conducta";
import { CALE_BLOG, caleArticol, caleCategorie, type CategorieBlog } from "@/content/blog/registru";
import { ARTICOL, CATEGORII, LISTARE } from "@/content/blog/texte";
import { dataModificarii } from "./date-structurate";

export function metadataListare(): Metadata {
  return metadataPagina({ titlu: LISTARE.titluPagina, descriere: LISTARE.descriere, cale: CALE_BLOG });
}

export function metadataCategorie(categorie: CategorieBlog): Metadata {
  const info = CATEGORII[categorie];
  return metadataPagina({ titlu: info.titluPagina, descriere: info.descriere, cale: caleCategorie(categorie) });
}

export function metadataArticol(articol: ArticolComplet): Metadata {
  const baza = metadataPagina({ titlu: articol.titlu, descriere: articol.extras, cale: caleArticol(articol) });
  return {
    ...baza,
    openGraph: {
      ...baza.openGraph,
      type: "article",
      publishedTime: articol.dataPublicarii,
      modifiedTime: dataModificarii(articol),
      section: CATEGORII[articol.categorie].nume,
      authors: [ARTICOL.autor],
    },
  };
}
