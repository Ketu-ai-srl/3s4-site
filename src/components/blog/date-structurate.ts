// Datele structurate ale blogului (blog.md §C; blog__articol-sablon.md "Date structurate"), pe
// identificatorii si tipurile feliei seo-geo-gdpr (`src/components/seo/date-structurate.ts`) si emise
// prin componenta ei, `JsonLd`. `BreadcrumbList` nu se emite aici: il pune `FirPagina`, o singura data
// pe pagina (la referinta, pe paginile de categorie, apare de doua ori).
//
//   - listarea si categoriile: `ItemList` cu TOATE articolele (nu doar cele 9 afisate), in ordinea
//     listarii. La referinta lista sta intr-un `CollectionPage`; tipul acela nu e in vocabularul
//     portii de SEO (`TIPURI_CUNOSCUTE`), iar lista e informatia care conteaza;
//   - articolul: `BlogPosting` cu `wordCount` numarat pe corp, autor si editor = organizatia marcii
//     (prin `@id`, deci o singura entitate pe tot site-ul), sursele articolului in `citation`.
// Nicio data de firma, nicio nota, nicio persoana (poarta S-09).

import { iduri, type GrafJsonLd, type NodJsonLd } from "@/components/seo/date-structurate";
import { CALE_IMAGINE_OG } from "@/components/seo/metadata";
import type { ArticolComplet } from "@/content/blog/conducta";
import { caleArticol, type ArticolBlog } from "@/content/blog/registru";
import { adresaSite, urlAbsolut } from "@/lib/site";

export function nodListaArticole(nume: string, cale: string, articole: readonly ArticolBlog[], baza: string = adresaSite()): NodJsonLd {
  const url = urlAbsolut(cale, baza);
  return {
    "@type": "ItemList",
    "@id": url + "#articole",
    name: nume,
    url,
    numberOfItems: articole.length,
    itemListOrder: "https://schema.org/ItemListOrderDescending",
    itemListElement: articole.map((a, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: urlAbsolut(caleArticol(a), baza),
      name: a.titlu,
    })),
  };
}

export function grafListaArticole(nume: string, cale: string, articole: readonly ArticolBlog[], baza: string = adresaSite()): GrafJsonLd {
  return { "@context": "https://schema.org", "@graph": [nodListaArticole(nume, cale, articole, baza)] };
}

/** Ziua ultimei schimbari: verificarea, sau publicarea daca e mai tarzie. */
export function dataModificarii(articol: Pick<ArticolComplet, "dataPublicarii" | "dataVerificarii">): string {
  return articol.dataVerificarii > articol.dataPublicarii ? articol.dataVerificarii : articol.dataPublicarii;
}

export function nodArticol(articol: ArticolComplet, numeCategorie: string, baza: string = adresaSite()): NodJsonLd {
  const id = iduri(baza);
  const url = urlAbsolut(caleArticol(articol), baza);
  return {
    "@type": "BlogPosting",
    "@id": url + "#articol",
    headline: articol.titlu,
    description: articol.extras,
    url,
    mainEntityOfPage: url,
    datePublished: articol.dataPublicarii,
    dateModified: dataModificarii(articol),
    articleSection: numeCategorie,
    wordCount: articol.cuvinte,
    inLanguage: "ro-RO",
    image: urlAbsolut(CALE_IMAGINE_OG, baza),
    author: { "@id": id.organizatie },
    publisher: { "@id": id.organizatie },
    isPartOf: { "@id": id.site },
    citation: articol.surse.map((s) => s.url),
  };
}

export function grafArticol(articol: ArticolComplet, numeCategorie: string, baza: string = adresaSite()): GrafJsonLd {
  return { "@context": "https://schema.org", "@graph": [nodArticol(articol, numeCategorie, baza)] };
}
