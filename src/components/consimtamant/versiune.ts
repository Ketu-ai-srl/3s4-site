// VERSIUNEA ALEGERII pe un domeniu cu mai multe limbi (3s.md: engleza la radacina, romana sub `/ro`).
//
// Regula de produs: o alegere din banner priveste SCOPURILE (categoriile) si FURNIZORII, nu limba in care au fost
// descrise. Daca sunt aceiasi in ambele limbi, alegerea facuta intr-o limba tine si in cealalta; daca un scop sau un
// furnizor se schimba, bannerul intreaba din nou, in ambele limbi. Deci valabilitatea se masoara pe CATALOG
// (`src/content/juridic/furnizori.ts`, sursa unica, independenta de limba), nu pe textul tradus.
//
// De ce nu ajungea versiunea informarii (`versiuneInformare`, `src/lib/analitica.ts`): ea poarta limba si amprenta
// textelor, deci o alegere facuta pe `/` (versiunea `en-...`) era respinsa pe `/ro` (versiunea `ro-...`) si invers,
// iar bannerul reaparea la fiecare trecere de limba. Masurat pe build-ul local cu profilul 3s.md: ambele directii.
//
// Versiunea informarii ramane in alegere si in evidenta (dovada TEXTULUI la care s-a raspuns); catalogul decide
// numai daca alegerea e inca valabila. Pe site-ul romanesc (o singura limba) catalogul nu se foloseste: acolo
// alegerea ramane legata de versiunea informarii, ca inainte, deci HTML-ul lui nu se schimba.

import {
  COOKIE_ALEGERE,
  FURNIZORI,
  SERVICII_STATISTICA_PANOU,
  type CookieDeclarat,
  type Furnizor,
  type ServiciuPanou,
  type Unealta,
  type UnelteActive,
} from "@/content/juridic/furnizori";
import { amprenta } from "@/lib/analitica";
import { EDITII } from "@/lib/editii";
import type { CodEditie } from "@/lib/editii";

/** Prefixul versiunii de catalog (`c-` si 8 cifre hexazecimale). */
export const PREFIX_CATALOG = "c-";

type ServiciiPanou = Readonly<Record<Unealta, Readonly<Record<"ro" | "en", ServiciuPanou>>>>;

/**
 * Ce se consimte, fara text tradus: categoriile, cheia alegerii, furnizorii care privesc domeniul (cu tara,
 * mecanismele de transfer si cookie-urile lor) si serviciile de statistica active, cu cheile pe care le folosesc.
 * Fiecare cookie si fiecare cheie intra cu SCOPUL si durata din catalogul romanesc (sursa unica), nu din traducerea
 * panoului: un scop schimbat in catalog da alta versiune in ambele limbi, o traducere schimbata nu. Proza din jur
 * (rolul furnizorului, temeiul) nu intra: nu e nici scop, nici furnizor.
 *
 * Fiecare parte a catalogului e un parametru, cu implicitul din `furnizori.ts`: furnizorii, cheile de statistica si
 * cheia alegerii. Asa o proba poate schimba oricare dintre ele pe o COPIE si arata ca versiunea se schimba; o parte
 * citita direct din modul n-ar avea martor (scopul cheii alegerii putea fi scos fara ca vreo proba sa se inroseasca).
 */
export function catalogConsimtamant(
  unelte: UnelteActive,
  furnizori: readonly Furnizor[] = FURNIZORI,
  servicii: ServiciiPanou = SERVICII_STATISTICA_PANOU,
  alegere: CookieDeclarat = COOKIE_ALEGERE,
) {
  const ordine: Unealta[] = ["umami", "ga4"];
  return {
    categorii: ["strict-necesare", "statistica"],
    alegere: { nume: alegere.nume, fel: alegere.fel, durata: alegere.durata, scop: alegere.scop },
    furnizori: furnizori
      .filter((f) => f.categorie !== "statistica" || unelte.ga4)
      .map((f) => ({
        cheie: f.cheie,
        destinatar: f.destinatar,
        tara: f.tara,
        inSee: f.inSee,
        mecanismUe: f.mecanismUe,
        mecanismMd: f.mecanismMd,
        categorie: f.categorie,
        cookieuri: f.cookieuri.map((c) => ({ nume: c.nume, fel: c.fel, durata: c.durata, scop: c.scop })),
      })),
    statistica: ordine
      .filter((u) => unelte[u])
      .map((u) => ({
        unealta: u,
        chei: servicii[u].ro.randuri.map((r) => ({ nume: r.nume, durata: r.durata, scop: r.scop, numaiCitit: r.numaiCitit === true })),
      })),
  };
}

/** Versiunea de catalog: aceeasi in toate limbile domeniului, alta cand se schimba un scop sau un furnizor. */
export function versiuneCatalog(
  unelte: UnelteActive,
  furnizori: readonly Furnizor[] = FURNIZORI,
  servicii: ServiciiPanou = SERVICII_STATISTICA_PANOU,
  alegere: CookieDeclarat = COOKIE_ALEGERE,
): string {
  return PREFIX_CATALOG + amprenta(JSON.stringify(catalogConsimtamant(unelte, furnizori, servicii, alegere)));
}

/** Domeniul are mai multe limbi (editiile build-ului au mai mult de un `lang`)? Atunci alegerea tine pe catalog. */
export function domeniuCuMaiMulteLimbi(editii: readonly CodEditie[]): boolean {
  return new Set(editii.map((c) => EDITII[c].lang)).size > 1;
}
