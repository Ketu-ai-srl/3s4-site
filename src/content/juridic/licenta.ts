// Licenta aplicatiei (`/juridic/licenta-software`): ce drept de folosire primeste clientul si ce nu
// are voie sa faca. Forma e a sablonului juridic A (fisa juridic__licenta-software.md): corpul incepe
// direct cu un titlu si un tabel cheie-valoare, apoi doua liste sub acelasi titlu.
//
// CE NU SCRIE, deliberat: CINE detine drepturile asupra codului. Titularul nu e consemnat nicaieri
// in depozit, iar a numi furnizorul serviciului drept titular ar fi o afirmatie fara sursa. Tabelul
// numeste furnizorul serviciului (din `config/operator.json`), nu titularul codului; textul spune ca
// drepturile raman "ale titularilor lor". Decizia e a owner-ului (docs/ziua-operatorului.md). Nici
// legea dreptului de autor nu se citeaza cu indicativul ei: textul ei consolidat nu s-a putut
// deschide la sursa oficiala pe 25.09.2026.

import type { Operator } from "@/lib/operator";
import { verificaOperatorPentruTexte } from "./confidentialitate";
import type { DocumentJuridic } from "./tipuri";

export const VERSIUNE_LICENTA = "2026-09-25";

export function licentaAplicatiei(operator: Operator): DocumentJuridic {
  verificaOperatorPentruTexte(operator);
  return {
    titlu: "Licența aplicației",
    versiune: VERSIUNE_LICENTA,
    introducere: "",
    sectiuni: [
      {
        cheie: "date",
        titlu: "Pe scurt",
        blocuri: [
          {
            jurisdictie: null,
            paragrafe: [],
            tabel: {
              forma: "cheie-valoare",
              titlu: "Datele licenței aplicației 3S",
              randuri: [
                ["Produsul", "Platforma 3S Scan Store Solve, pe web, pe calculator, pe telefon și pe WhatsApp"],
                ["Furnizorul serviciului", operator.denumire],
                ["Licența", "De folosire, neexclusivă și netransmisibilă, cât timp contul e activ; fără codul sursă"],
              ],
            },
          },
        ],
      },
      {
        cheie: "drepturi",
        titlu: "Ce primiți și ce rămâne al titularilor",
        blocuri: [
          {
            jurisdictie: null,
            paragrafe: [
              "Codul, interfața, bazele de date și documentația platformei 3S sunt protejate de dreptul de autor. Primiți numai dreptul de folosire descris pe această pagină, pentru contul dumneavoastră și cât timp contul e activ; toate celelalte drepturi rămân ale titularilor lor.",
            ],
          },
        ],
      },
      {
        cheie: "permis",
        titlu: "Ce puteți face",
        nivel: 3,
        blocuri: [
          {
            jurisdictie: null,
            paragrafe: [],
            lista: {
              elemente: [
                "să folosiți platforma pentru actele firmei dumneavoastră, în limitele pachetului ales;",
                "să dați acces colegilor și clienților, cu rolurile pe care le stabiliți;",
                "să legați platforma de aplicațiile cu care lucrați, prin integrările din cont.",
              ],
            },
          },
        ],
      },
      {
        cheie: "interzis",
        titlu: "Ce nu aveți voie să faceți",
        nivel: 3,
        blocuri: [
          {
            jurisdictie: null,
            paragrafe: [],
            lista: {
              elemente: [
                "să vindeți, să închiriați sau să cedați aplicația ori accesul la ea;",
                "să decompilați aplicația sau să încercați să aflați codul ei sursă, în afara cazurilor permise expres de lege;",
                "să ocoliți limitele pachetului sau măsurile de securitate;",
                "să folosiți platforma ca să construiți un produs care o înlocuiește.",
              ],
            },
          },
        ],
      },
      {
        cheie: "incalcare",
        titlu: "Dacă licența e încălcată",
        blocuri: [
          {
            jurisdictie: null,
            paragrafe: [
              "Folosirea în afara licenței poate duce la suspendarea contului și la răspundere, potrivit legii.",
              "Întrebările despre licență le primim la " + operator.email + ".",
            ],
          },
        ],
      },
    ],
  };
}
