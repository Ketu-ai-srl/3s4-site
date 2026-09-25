// Textele juridice ale site-ului, in spatele comutatorului operatorului (planul valului S4, §9-§10).
//
// AZI (operator `null`) nu se publica nimic: nu exista ruta, nu exista intrare in `RUTE`, iar
// `texteJuridice()` intoarce `null`. In ziua operatorului, felia `juridic` randeaza documentele de
// aici; datele firmei vin exclusiv din `config/operator.json` (`src/lib/operator.ts`), nu se scriu
// in pagini. Pasii, in ordine si cu comenzile de verificare: `docs/ziua-operatorului.md`.
//
// Felia 44 a scris politica de confidentialitate si pe cea de cookie-uri; felia `juridic` a adaugat
// celelalte cinci documente ale grupului (mentiunile legale, termenii cu anexa, regulile publice,
// licenta si lista subimputernicitilor), construite din acelasi comutator. Care pagina afiseaza care
// document: `documentPentruSlug`, pe slugurile din `publicare.ts`.

import { OPERATOR, operatorComplet, type Operator } from "@/lib/operator";
import { adresaSite } from "@/lib/site";
import { politicaConfidentialitate } from "./confidentialitate";
import { politicaCookie } from "./cookie-uri";
import { licentaAplicatiei } from "./licenta";
import { mentiuniLegale } from "./mentiuni-legale";
import type { SlugJuridic } from "./publicare";
import { reguliPublice } from "./reguli-publice";
import { listaSubimputerniciti } from "./subimputerniciti";
import { termeni } from "./termeni";
import type { DocumentJuridic } from "./tipuri";

export type TexteJuridice = {
  confidentialitate: DocumentJuridic;
  cookie: DocumentJuridic;
  informatiiLegale: DocumentJuridic;
  termeni: DocumentJuridic;
  reguliPublice: DocumentJuridic;
  licenta: DocumentJuridic;
  subimputerniciti: DocumentJuridic;
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
    informatiiLegale: mentiuniLegale(operator),
    termeni: termeni(operator),
    reguliPublice: reguliPublice(operator),
    licenta: licentaAplicatiei(operator),
    subimputerniciti: listaSubimputerniciti(operator),
  };
}

/** Documentul afisat pe `/juridic/<slug>`. */
export function documentPentruSlug(texte: TexteJuridice, slug: SlugJuridic): DocumentJuridic {
  switch (slug) {
    case "informatii-legale":
      return texte.informatiiLegale;
    case "confidentialitate":
      return texte.confidentialitate;
    case "termeni":
      return texte.termeni;
    case "cookies":
      return texte.cookie;
    case "politici-publice":
      return texte.reguliPublice;
    case "licenta-software":
      return texte.licenta;
    case "subimputerniciti":
      return texte.subimputerniciti;
  }
}
