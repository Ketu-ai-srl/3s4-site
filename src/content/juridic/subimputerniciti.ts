// Lista subimputernicitilor platformei (`/juridic/subimputerniciti`): furnizorii pe care platforma
// 3S ii foloseste cand prelucreaza, in numele clientului, datele din documentele incarcate (GDPR
// art. 28 alin. (2) si (4), citit pe EUR-Lex pe 25.09.2026). Aceeasi lista intra ca tabel in
// articolul 5 al anexei din termeni.
//
// SURSA UNICA pentru fapte: `furnizori.ts`. Gazduirea platformei (Amazon, Germania, o singura
// regiune; decizia D4c a owner-ului, afirmatia `acasa-gazduire-amazon-germania`) e singurul
// subimputernicit CONFIRMAT azi. Nu se trec aici, pana nu le confirma owner-ul cu numele si tara:
// furnizorul modelelor de inteligenta artificiala, cel de posta electronica si cel prin care trece
// canalul WhatsApp. Pasul e in docs/ziua-operatorului.md, iar pagina spune cinstit regula: un
// furnizor intra in tabel INAINTE sa primeasca date.
//
// Google Analytics nu e aici: masoara vizitele pe site, in numele operatorului site-ului, nu
// prelucreaza documentele clientilor. Sta in politica de confidentialitate, ca destinatar.

import type { Operator } from "@/lib/operator";
import { verificaOperatorPentruTexte } from "./confidentialitate";
import { FURNIZORI, type Furnizor } from "./furnizori";
import type { CelulaJuridica, DocumentJuridic, TabelJuridic } from "./tipuri";

export const VERSIUNE_SUBIMPUTERNICITI = "2026-09-25";

export type Subimputernicit = {
  /** Firma care primeste datele. */
  furnizor: string;
  /** Tara in care stau datele. */
  tara: string;
  /** Ce face pentru platforma. */
  scop: string;
  /** Ce date primeste. */
  date: string;
  /** Unde se prelucreaza, spus cum il citeste clientul. */
  loc: string;
};

function dinFurnizor(f: Furnizor, scop: string, date: string): Subimputernicit {
  return {
    furnizor: f.destinatar,
    tara: f.tara,
    scop,
    date,
    loc: f.inSee ? f.tara + ", în Uniunea Europeană" : f.tara,
  };
}

/** Subimputernicitii confirmati azi, in ordinea importantei lor pentru platforma. */
export function subimputerniciti(): Subimputernicit[] {
  const gazduire = FURNIZORI.find((f) => f.cheie === "gazduire-platforma");
  if (!gazduire) {
    throw new Error("furnizori.ts nu mai are furnizorul de găzduire a platformei");
  }
  return [
    dinFurnizor(
      gazduire,
      "Găzduiește platforma: conturile, fișierele încărcate și arhiva digitală, într-o singură regiune.",
      "Tot ce încarcă clientul, cu datele personale din documente, și datele utilizatorilor contului.",
    ),
  ];
}

/** Tabelul cu antet al subimputernicitilor (sablon §6, varianta cu `small` sub nume). */
export function tabelSubimputerniciti(): TabelJuridic {
  return {
    forma: "cu-antet",
    titlu: "Subîmputerniciții platformei 3S",
    antet: ["Furnizorul", "Ce face", "Ce date primește", "Unde stau datele"],
    randuri: subimputerniciti().map((s): CelulaJuridica[] => [
      { text: s.furnizor, detaliu: "Țara datelor: " + s.tara },
      s.scop,
      s.date,
      s.loc,
    ]),
  };
}

export function listaSubimputerniciti(operator: Operator): DocumentJuridic {
  verificaOperatorPentruTexte(operator);
  return {
    titlu: "Subîmputerniciții platformei",
    versiune: VERSIUNE_SUBIMPUTERNICITI,
    introducere:
      "Pentru documentele pe care le încărcați în 3S, firma dumneavoastră este operatorul datelor, iar furnizorul serviciului le prelucrează în numele ei, după [Anexa A din Termeni și condiții](/juridic/termeni#anexa-a). Tabelul de mai jos arată ce alți furnizori folosește platforma pentru această prelucrare, ce face fiecare și unde stau datele.",
    sectiuni: [
      {
        cheie: "lista",
        titlu: "Cine prelucrează datele pentru platformă",
        blocuri: [{ jurisdictie: null, paragrafe: [], tabel: tabelSubimputerniciti() }],
      },
      {
        cheie: "inteligenta-artificiala",
        titlu: "Modelele de inteligență artificială",
        blocuri: [
          {
            jurisdictie: null,
            paragrafe: [
              "Căutarea și citirea automată a documentelor folosesc modele de inteligență artificială. Furnizorul unui model care primește conținutul documentelor intră în tabelul de mai sus, cu țara lui și cu temeiul transferului, înainte să primească vreun document.",
            ],
          },
        ],
      },
      {
        cheie: "schimbari",
        titlu: "Cum anunțăm schimbările",
        blocuri: [
          {
            jurisdictie: null,
            paragrafe: ["Înainte ca un subîmputernicit nou să primească date, vă anunțăm în cont și pe e-mail:"],
            lista: {
              elemente: [
                "cine este și în ce țară stau datele;",
                "ce parte din prelucrare preia;",
                "până când vă puteți opune schimbării.",
              ],
            },
          },
        ],
      },
      {
        cheie: "opozitie",
        titlu: "Dacă nu sunteți de acord",
        blocuri: [
          {
            jurisdictie: null,
            paragrafe: [
              "Vă puteți opune unui subîmputernicit nou, cum prevede art. 28 alin. (2) din regulamentul european. Căutăm întâi împreună o soluție.",
              "Dacă nu există una, puteți închide contul înainte ca schimbarea să se aplice; datele se returnează și se șterg după articolul 8 din anexă.",
            ],
          },
        ],
      },
      {
        cheie: "contact",
        titlu: "Întrebări despre listă",
        blocuri: [{ jurisdictie: null, paragrafe: ["Ne scrieți la " + operator.email + "."] }],
      },
    ],
  };
}
