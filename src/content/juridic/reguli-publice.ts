// Regulile publice (`/juridic/politici-publice`): pagina scurta a grupului, o lista sub un titlu
// (fisa juridic__politici-publice.md). La 3S lista numeste actele normative si standardul pe care
// se sprijina documentele juridice ale site-ului, fiecare cu legatura la textul citit si cu data
// citirii (src/content/juridic/acte.ts). Elementele sunt legaturi, nu text mort (recomandarea fisei).
//
// Nu se listeaza documente interne care nu exista inca (politici de securitate, proceduri): o lista
// de titluri fara documente in spate ar fi o afirmatie falsa.

import type { Operator } from "@/lib/operator";
import { ACTE, type CheieAct } from "./acte";
import { verificaOperatorPentruTexte } from "./confidentialitate";
import { dataInCuvinte, type DocumentJuridic } from "./tipuri";

export const VERSIUNE_REGULI = "2026-09-25";

/** Ce reglementeaza fiecare act, pe scurt, spus pentru cititorul site-ului. */
const ROL_ACT: Record<CheieAct, string> = {
  gdpr: "regulile europene pentru datele personale",
  legea190: "aplicarea în România a regulamentului european",
  legea506: "cookie-urile și confidențialitatea comunicațiilor electronice, în România",
  legea365: "obligațiile unui serviciu oferit online, între care identificarea furnizorului",
  legea195md: "datele personale ale vizitatorilor din Republica Moldova",
  wcag22: "criteriile de accesibilitate folosite de declarația de accesibilitate",
};

function element(cheie: CheieAct): string {
  const a = ACTE[cheie];
  return "[" + a.scurt + "](" + a.adresa + "): " + ROL_ACT[cheie] + "; " + a.citire + " " + dataInCuvinte(a.citit) + ".";
}

export function reguliPublice(operator: Operator): DocumentJuridic {
  verificaOperatorPentruTexte(operator);
  return {
    titlu: "Reguli publice",
    versiune: VERSIUNE_REGULI,
    introducere:
      "Documentele juridice ale site-ului 3S se sprijină pe actele normative și pe standardul de accesibilitate de mai jos. Fiecare legătură duce la locul în care am citit actul, iar lângă ea scrie ce am citit acolo și când.",
    sectiuni: [
      {
        cheie: "acte",
        titlu: "Actele normative",
        blocuri: [
          {
            jurisdictie: null,
            paragrafe: [],
            lista: { elemente: (["gdpr", "legea190", "legea506", "legea365", "legea195md"] as const).map(element) },
          },
        ],
      },
      {
        cheie: "standarde",
        titlu: "Standardul de accesibilitate",
        blocuri: [{ jurisdictie: null, paragrafe: [], lista: { elemente: [element("wcag22")] } }],
      },
    ],
  };
}
