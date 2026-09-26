// Ce arata site-ul despre cine il face: MARCA 3S, citita dintr-un singur loc, `config/brand.json`.
//
// DECIZIA (owner, 24.09.2026, planul valului S4, sectiunea 7): pe site apare doar brandul - numele,
// sigla si, cand exista una confirmata, adresa de e-mail. Nicio data de firma (denumire, sediu,
// numar de registru, cod fiscal, telefon) nu se afiseaza: 3S nu are inca firma. Decizia D10
// (25.09): site-ul nu numeste nicio alta firma. Numele fisierului a ramas de la mecanismul vechi,
// care citea datele unei entitati juridice; acum citeste marca.
//
// Datele de identificare ale unei firme tin de OPERATORUL de date, in `config/operator.json`
// (planul valului, sectiunile 9-10), cu `"operator": null` azi. Il citeste poarta juridica (L-01),
// care cere datele numai din ziua in care operatorul exista.
//
// ADRESA DE E-MAIL se arata numai daca `config/brand.json` o are, ca adresa confirmata de owner.
// Gol = nicio adresa pe site: legaturile de posta devin destinatii NEDECISE (`href: null`), pe
// care navigatia nu le randeaza, iar intrebarile de pe start au o fraza care nu promite un canal.
// O valoare care nu arata a adresa opreste construirea: o greseala de tastare nu are voie nici sa
// ajunga pe pagina, nici sa ascunda tacut adresa buna.

import date from "../../config/brand.json";
import type { Legatura } from "./navigatie";

export type SiglaMarcii = {
  /**
   * Iconita marcii 3S (chenarul de scanare, dosarul si "3S"), decupata din fisierul oficial cu
   * traseele neschimbate. Singura forma a siglei pe site (decizia D10).
   */
  iconita: string;
};

export type Brand = {
  nume: string;
  sigla: SiglaMarcii;
  /** Adresa confirmata, sau sirul gol cand marca nu are inca una. */
  email: string;
};

export const BRAND: Brand = {
  nume: date.nume,
  sigla: date.sigla,
  email: date.email.trim(),
};

/** O adresa de posta plauzibila: un singur @, fara spatii, cu punct in domeniu. */
const FORMA_ADRESEI = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Adresa de e-mail a marcii, daca e confirmata; `null` cat timp configurarea o are goala.
 * Arunca daca valoarea nu e goala dar nici nu arata a adresa.
 */
export function adresaMarcii(valoare: string = BRAND.email): string | null {
  const v = valoare.trim();
  if (v === "") {
    return null;
  }
  if (!FORMA_ADRESEI.test(v)) {
    throw new Error(
      'config/brand.json: "email" trebuie sa fie gol sau o adresa confirmata, nu "' + v + '"',
    );
  }
  return v;
}

/**
 * Legatura de posta a marcii: `mailto:` catre adresa confirmata, sau destinatie NEDECISA
 * (`href: null`, text gol) cand marca nu are adresa. Navigatia nu randeaza o destinatie nedecisa.
 */
export function postaMarcii(valoare: string = BRAND.email): Legatura {
  const adresa = adresaMarcii(valoare);
  return adresa === null
    ? { text: "", href: null, ruta: null }
    : { text: adresa, href: "mailto:" + adresa, ruta: null };
}
