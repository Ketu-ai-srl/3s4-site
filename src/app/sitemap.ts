import type { MetadataRoute } from "next";
import { ARTICOLE, caleArticol } from "@/content/blog/registru";
import { editiaRutei, rutePentruHarta } from "@/content/rute";
import { asezareBuild } from "@/lib/asezare";
import { editiaInBuild } from "@/lib/editii";
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
// PE EDITIE (fundatia editiilor): `rutePentruHarta()` da rutele editiilor acestui build, iar articolele intra
// numai cand editia `ro-RO` e in build - sunt pagini romanesti, deci pe build-ul international ar fi fost
// adrese care raspund 404.
//
// ASEZAREA (`src/lib/asezare.ts`): adresa din harta e cea SERVITA a rutei (`ruta.servita`), iar `lastmod` se cauta
// dupa calea SURSA (`ruta.cale`), fiindca sursele paginii stau in arbore dupa ea: cu adresa servita, istoria git n-ar
// gasi fisierul si campul ar disparea tacut. Pe asezarea `md` cele doua coincid.
//
// ENGLEZA PE ASEZAREA `ro` (3s.com.ro, recomandarea I1): paginile de sub `/en` sunt copii pentru vizitatori, cu
// canonical-ul spre aceeasi pagina de pe 3s.md (`src/components/seo/metadata.ts`). O harta care ar lista o adresa al
// carei canonical arata in alta parte i-ar cere motorului sa indexeze exact ce pagina ii spune sa nu indexeze, deci pe
// `ro` harta are numai paginile romanesti. Regula tine de asezare, nu de lista hreflang: engleza indexata e una singura,
// cea de pe 3s.md. Pe `md` engleza ramane in harta, neschimbat.
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
  const faraEngleza = asezareBuild() === "ro";
  for (const ruta of rutePentruHarta()) {
    if (faraEngleza && editiaRutei(ruta) === "en") continue;
    adauga(urlAbsolut(ruta.servita, baza), dataUltimuluiCommit(surseleRutei(ruta.cale, undefined, editiaRutei(ruta))));
  }
  for (const articol of editiaInBuild("ro-RO") ? ARTICOLE : []) {
    adauga(urlAbsolut(caleArticol(articol), baza), articol.data);
  }
  return intrari;
}
