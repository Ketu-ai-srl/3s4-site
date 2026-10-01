// Textul lui `/llms.txt` (planul valului S4, §8.3), generat din ACEEASI sursa ca harta de site:
// rutele din `RUTE` care intra in harta si articolele din registrul blogului. Deci nu poate lista o
// pagina pe care harta n-o are, si nu poate rata una pe care o are.
//
// POZITIA, scrisa ca sa nu fie vanduta altfel (cercetarea cautare-agenti-ai, §3): niciun motor AI
// major nu declara ca citeste fisierul in productie. Il generam fiindca nu costa nimic si nu poate
// minti; nu e o parghie si nu se promite nimic pe el.
//
// Forma e cea din propunerea llms.txt: titlu H1, rezumat in citat, apoi sectiuni H2 cu liste de
// legaturi "- [nume](adresa): nota".
//
// PE EDITIE (felia metadata-hreflang): fisierul e unul pe domeniu, deci urmeaza editia de la radacina. Pe
// build-ul romanesc, textul de azi, neschimbat. Pe cel international, textul in engleza (americana) din
// arhitectura site-ului EN: titlul, rezumatul si numai paginile care exista (`RUTE`, acelasi filtru ca harta
// si navigatia). Pana la primele pagini EN fisierul are numai titlul si rezumatul, fara nicio legatura spre
// o pagina inexistenta. Blogul e romanesc, deci nu intra acolo.

import { META_ACASA } from "@/content/acasa";
import { ARTICOLE, caleArticol } from "@/content/blog/registru";
import { BRAND } from "@/content/entitate";
import { SUBSOL } from "@/content/navigatie";
import { rutePentruHarta, type Ruta } from "@/content/rute";
import { DESCRIERE_EN } from "@/components/seo/date-structurate";
import type { CodEditie } from "./editii";
import { editiaRadacinii, urlAbsolut } from "./site";

/** Rezumatul in engleza (citatul de sub titlu): textul aprobat al site-ului international, fara cifre. */
export const REZUMAT_EN =
  DESCRIERE_EN +
  " It works in the browser; WhatsApp is available in pilot. Files are stored in Germany, in one EU region. 3S is operated from Moldova. Its plans are priced in euros.";

/** Textul unei legaturi Markdown, fara parantezele drepte care i-ar rupe forma. */
function eticheta(text: string): string {
  return text.replace(/[[\]]/g, "").trim();
}

/** Textul EN: titlul, rezumatul si, cand exista, paginile din harta. */
function textEn(baza: string, rute: readonly Ruta[]): string {
  const linii = ["# " + BRAND.nume, "", "> " + REZUMAT_EN];
  if (rute.length > 0) {
    linii.push("", "## Pages", "");
    for (const ruta of rute) {
      linii.push("- [" + eticheta(ruta.scurt) + "](" + urlAbsolut(ruta.cale, baza) + "): " + ruta.descriere);
    }
  }
  return linii.join("\n") + "\n";
}

export function textLlms(baza: string, editie: CodEditie = editiaRadacinii().cod): string {
  if (editie === "en") {
    return textEn(
      baza,
      rutePentruHarta().filter((r) => r.editie === "en"),
    );
  }
  const linii = ["# " + BRAND.nume, "", "> " + SUBSOL.brand.descriere, "", META_ACASA.descriere, "", "## Pagini", ""];
  for (const ruta of rutePentruHarta()) {
    linii.push("- [" + eticheta(ruta.scurt) + "](" + urlAbsolut(ruta.cale, baza) + "): " + ruta.descriere);
  }
  if (ARTICOLE.length > 0) {
    linii.push("", "## Articole", "");
    for (const articol of ARTICOLE) {
      linii.push("- [" + eticheta(articol.titlu) + "](" + urlAbsolut(caleArticol(articol), baza) + "): " + articol.extras);
    }
  }
  return linii.join("\n") + "\n";
}
