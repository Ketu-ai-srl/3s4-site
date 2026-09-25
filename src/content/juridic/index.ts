// Textele juridice ale site-ului, in spatele comutatorului operatorului (planul valului S4, §9-§10).
//
// AZI (operator `null`) nu se publica nimic: nu exista ruta, nu exista intrare in `RUTE`, iar
// `texteJuridice()` intoarce `null`. In ziua operatorului, felia `juridic` randeaza documentele de
// aici; datele firmei vin exclusiv din `config/operator.json` (`src/lib/operator.ts`), nu se scriu
// in pagini. Pasii, in ordine si cu comenzile de verificare: `docs/ziua-operatorului.md`.

import { OPERATOR, operatorComplet, type Operator } from "@/lib/operator";
import { adresaSite } from "@/lib/site";
import { politicaConfidentialitate } from "./confidentialitate";
import { politicaCookie } from "./cookie-uri";
import type { DocumentJuridic } from "./tipuri";

export type TexteJuridice = {
  confidentialitate: DocumentJuridic;
  cookie: DocumentJuridic;
};

/** Documentele complete pentru operatorul dat, sau `null` cat timp nu exista unul complet. */
export function texteJuridice(operator: Operator | null = OPERATOR, baza: string = adresaSite()): TexteJuridice | null {
  if (!operatorComplet(operator)) {
    return null;
  }
  const domeniu = new URL(baza).host;
  return {
    confidentialitate: politicaConfidentialitate(operator, { domeniu }),
    cookie: politicaCookie(operator),
  };
}
