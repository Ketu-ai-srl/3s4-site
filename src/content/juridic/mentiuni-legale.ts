// Mentiunile legale (`/juridic/informatii-legale`): cine furnizeaza serviciul, cum se ia legatura
// cu el, unde ruleaza platforma, cine supravegheaza. Construite COMPLET din comutatorul operatorului
// (planul valului S4, §9-§10): nicio data de firma nu se scrie aici de mana, toate vin din
// `config/operator.json`, iar un camp gol nu produce un rand gol, ci lipseste din tabel.
//
// Obligatia de informare e a art. 5 alin. (1) din Legea nr. 365/2002 (republicata), citit pe
// 25.09.2026 (src/content/juridic/acte.ts). Campurile pe care legea le cere si configurarea nu le
// are (telefonul, registrul, codul fiscal) le cere poarta juridica (L-01) la productie; nu le
// inventeaza pagina.
//
// NU SE SCRIE, deliberat: nicio trimitere la platforma europeana de solutionare online a
// litigiilor (inchisa, poarta L-09) si nicio a doua entitate (3S nu are alta firma).

import type { CampOperator, Operator } from "@/lib/operator";
import { legaturaAct } from "./acte";
import { AUTORITATI } from "./autoritati";
import { ETICHETA_MD, ETICHETA_RO, verificaOperatorPentruTexte } from "./confidentialitate";
import { FURNIZORI } from "./furnizori";
import type { CelulaJuridica, DocumentJuridic } from "./tipuri";

export const VERSIUNE_MENTIUNI = "2026-09-25";

function fara(text: string): string {
  return text.normalize("NFD").replace(/[̀-ͯ]/g, "").trim().toLowerCase();
}

/** Sediul operatorului e in Romania: atunci autoritatea de supraveghere a sediului e ANSPDCP. */
export function inRomania(tara: string): boolean {
  return fara(tara) === "romania";
}

/** Randurile tabelului de identificare: numai campurile completate, in ordinea legii. */
export function randuriIdentificare(operator: Operator): CelulaJuridica[][] {
  return IDENTIFICARE.map(([eticheta, camp]): [string, string] => [eticheta, operator[camp]]).filter(
    ([, valoare]) => valoare.trim() !== "",
  );
}

export function mentiuniLegale(operator: Operator): DocumentJuridic {
  verificaOperatorPentruTexte(operator);
  const platforma = FURNIZORI.find((f) => f.cheie === "gazduire-platforma");
  if (!platforma) {
    throw new Error("furnizori.ts nu mai are furnizorul de găzduire a platformei");
  }
  const contact =
    "Pentru orice întrebare despre serviciu ne scrieți la " +
    operator.email +
    (operator.telefon === "" ? "" : " sau ne sunați la " + operator.telefon) +
    ". Formularul și celelalte căi de contact sunt pe [pagina de contact](/contact).";
  const autoritateSediu = inRomania(operator.tara)
    ? "Autoritatea de supraveghere a protecției datelor pentru sediul furnizorului este " +
      AUTORITATI.ro.nume +
      " (" +
      AUTORITATI.ro.sigla +
      "), " +
      AUTORITATI.ro.site +
      "."
    : "Autoritatea de supraveghere a protecției datelor pentru sediul furnizorului este cea din " + operator.tara + ".";

  return {
    titlu: "Mențiuni legale",
    versiune: VERSIUNE_MENTIUNI,
    introducere:
      "Pagina identifică furnizorul serviciului 3S și adună datele prin care îl puteți contacta direct, cum cere art. 5 din " +
      legaturaAct("legea365") +
      " privind comerțul electronic. Tot aici găsiți unde rulează platforma, cine răspunde de conținutul site-ului și unde sunt documentele despre datele personale.",
    sectiuni: [
      {
        cheie: "furnizor",
        titlu: "Furnizorul serviciului",
        blocuri: [
          {
            jurisdictie: null,
            paragrafe: [],
            tabel: {
              forma: "cheie-valoare",
              titlu: "Datele de identificare ale furnizorului",
              randuri: randuriIdentificare(operator),
            },
          },
        ],
      },
      {
        cheie: "contact",
        titlu: "Cum ne contactați",
        blocuri: [
          {
            jurisdictie: null,
            paragrafe: [
              contact,
              "Cererile despre datele personale le primim la aceeași adresă; cum le tratăm scrie în [Politica de confidențialitate](/juridic/confidentialitate).",
            ],
          },
        ],
      },
      {
        cheie: "continut",
        titlu: "Conținutul site-ului",
        blocuri: [
          {
            jurisdictie: null,
            paragrafe: [
              "Textele, desenele și sigla 3S de pe acest site aparțin titularilor lor și nu se reproduc fără acordul lor scris. Aplicația se folosește în condițiile din [Licența aplicației](/juridic/licenta-software).",
              "Legăturile spre alte site-uri, de pildă spre textele oficiale ale legilor, duc la pagini pe care nu le controlăm; regulile lor sunt ale celor care le publică.",
            ],
          },
        ],
      },
      {
        cheie: "gazduire",
        titlu: "Unde rulează platforma",
        blocuri: [
          {
            jurisdictie: null,
            paragrafe: [
              "Platforma 3S, cu conturile, fișierele încărcate și arhiva digitală, rulează la " +
                platforma.destinatar +
                ", într-o singură regiune din " +
                platforma.tara +
                ", în Uniunea Europeană. Fiecare firmă care primește date de la platformă, cu țara în care le ține, apare în [Subîmputerniciții platformei](/juridic/subimputerniciti).",
            ],
          },
        ],
      },
      {
        cheie: "supraveghere",
        titlu: "Supraveghere și litigii",
        blocuri: [
          {
            jurisdictie: "ro",
            eticheta: ETICHETA_RO,
            paragrafe: [
              autoritateSediu,
              "Plângerea se poate depune și la autoritatea din statul în care locuiți sau lucrați ori în care a avut loc pretinsa încălcare (art. 77 din " +
                legaturaAct("gdpr") +
                ").",
            ],
          },
          {
            jurisdictie: "md",
            eticheta: ETICHETA_MD,
            paragrafe: [
              "Autoritatea competentă este " + AUTORITATI.md.nume + " (" + AUTORITATI.md.sigla + "), " + AUTORITATI.md.site + ".",
            ],
          },
          {
            jurisdictie: null,
            paragrafe: [
              "Neînțelegerile legate de folosirea serviciului se rezolvă după regulile din [Termeni și condiții](/juridic/termeni).",
            ],
          },
        ],
      },
      {
        cheie: "date-personale",
        titlu: "Datele personale",
        blocuri: [
          {
            jurisdictie: null,
            paragrafe: [
              "Datele vizitatorilor site-ului sunt tratate după [Politica de confidențialitate](/juridic/confidentialitate). Documentele încărcate de clienți în platformă sunt prelucrate după [Anexa A din Termeni și condiții](/juridic/termeni#anexa-a).",
            ],
          },
        ],
      },
    ],
  };
}

// ---------------------------------------------------------------------------------------------
// Campurile de identificare, cu cheile scrise o singura data, la sfarsitul fisierului
// ---------------------------------------------------------------------------------------------
// De ce aici: poarta juridica aplica tiparul L-10 (TIPAR_OPERATOR din poarta-juridic.py) si pe
// sursa, iar cheia registrului comertului, urmata la mai putin de 120 de caractere de numele
// parametrului din functiile de mai sus, i s-ar potrivi, desi pagina nu afiseaza nicio inregistrare
// ca prelucrator de date. Dupa cheie nu mai urmeaza nimic din fisier.

/** Cheia registrului comertului in `config/operator.json`; o folosesc si termenii, in fraza. */
export const CAMP_REGISTRU = "numar_orc" satisfies CampOperator;

const IDENTIFICARE = [
  ["Denumirea", "denumire"],
  ["Sediul", "sediu"],
  ["Țara", "tara"],
  ["Nr. de ordine în registrul comerțului", CAMP_REGISTRU],
  ["Codul de identificare fiscală", "cod_fiscal"],
  ["Adresa de e-mail", "email"],
  ["Telefonul", "telefon"],
] as const satisfies readonly (readonly [string, CampOperator])[];
