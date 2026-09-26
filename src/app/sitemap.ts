import type { MetadataRoute } from "next";
import { ARTICOLE, caleArticol } from "@/content/blog/registru";
import { rutePentruHarta } from "@/content/rute";
import { dataUltimuluiCommit, surseleRutei } from "@/lib/istoric-git";
import { adresaSite, urlAbsolut } from "@/lib/site";

// Harta de site se DERIVA din manifestul de rute si din registrul blogului, nu se scrie de mana.
// O lista scrisa de mana devine falsa exact atunci cand cineva face lucrul corect si adauga o
// pagina: harta ar ramane la fel, iar motorul ar continua sa vada un site pe care nu il mai avem.
//
// Articolele stau in registrul blogului (`src/content/blog/registru.ts`), nu in `RUTE`: ruta lor
// e dinamica (`/blog/<slug>`). Felia `blog` umple registrul; harta le preia fara sa fie atinsa.
//
// `lastmod` (planul valului S4, §8.1) vine numai din date REALE:
//   - la paginile din `RUTE`, momentul ultimului commit care a atins sursele paginii
//     (`src/lib/istoric-git.ts`); cand istoria git lipseste sau e superficiala, campul lipseste;
//   - la articole, data publicarii din registru.
// `new Date()` la construire ar declara ca TOATE paginile s-au schimbat la fiecare build, ceea ce e
// neadevarat si face campul sa fie ignorat. Un camp lipsa e mai onest decat unul inventat.
//
// `changeFrequency` si `priority` lipsesc deliberat: Google le ignora, iar ca declaratii despre
// viitor nu le putem sustine.

export default function sitemap(): MetadataRoute.Sitemap {
  const baza = adresaSite();
  const intrari: MetadataRoute.Sitemap = [];
  const vazute = new Set<string>();
  const adauga = (url: string, lastModified: string | null) => {
    if (vazute.has(url)) return;
    vazute.add(url);
    intrari.push(lastModified === null ? { url } : { url, lastModified });
  };
  for (const ruta of rutePentruHarta()) {
    adauga(urlAbsolut(ruta.cale, baza), dataUltimuluiCommit(surseleRutei(ruta.cale)));
  }
  for (const articol of ARTICOLE) {
    adauga(urlAbsolut(caleArticol(articol), baza), articol.data);
  }
  return intrari;
}
