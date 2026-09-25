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

import { META_ACASA } from "@/content/acasa";
import { ARTICOLE, caleArticol } from "@/content/blog/registru";
import { BRAND } from "@/content/entitate";
import { SUBSOL } from "@/content/navigatie";
import { rutePentruHarta } from "@/content/rute";
import { urlAbsolut } from "./site";

/** Textul unei legaturi Markdown, fara parantezele drepte care i-ar rupe forma. */
function eticheta(text: string): string {
  return text.replace(/[[\]]/g, "").trim();
}

export function textLlms(baza: string): string {
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
