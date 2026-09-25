// Textele PAGINILOR feliei `juridic` (nu ale documentelor): bara laterala, indexul, antetul si
// sigiliul unui document, harta de site si declaratia de accesibilitate, plus metadata fiecarei
// rute. Documentele insesi sunt in modulele lor si le da `texteJuridice()` (index.ts).
//
// Lungimile urmeaza fisele (juridic.md, harta-site.md, accesibilitate.md); cuvintele sunt ale 3S.
// Metadata respecta pragurile portii de SEO (titlu 15-65, descriere 50-160), verificate si de
// `metadataPagina` la construire.
//
// DECLARATIA DE ACCESIBILITATE spune numai ce e masurat de portile site-ului sau vizibil in cod,
// cu criteriile WCAG 2.2 citite pe w3.org pe 25.09.2026 (acte.ts). Adresa pentru semnalari vine din
// `config/brand.json`: cat timp owner-ul nu confirma una, pagina nu arata nicio adresa.

import { ACTE, legaturaAct } from "./acte";
import type { SlugJuridic } from "./publicare";
import { dataInCuvinte } from "./tipuri";

export type MetaPagina = { titlu: string; descriere: string };

// ---------------------------------------------------------------------------------------------
// Bara laterala si antetul documentului (juridic__sablon.md §2, §4)
// ---------------------------------------------------------------------------------------------

export const BARA_JURIDICA = {
  // Rol: titlul grupului, deasupra legaturilor. Text simplu, nu legatura (sablon §2).
  titlu: "Juridic",
  // Rol: eticheta accesibila a navigatiei dintre documente.
  eticheta: "Documentele juridice",
};

/** Linia de sub titlul documentului: data versiunii (sablon §4). */
export function linieVersiune(iso: string): string {
  return "Versiunea din " + dataInCuvinte(iso);
}

export const SIGILIU = {
  // Rol: eticheta de langa amprenta, cu explicatia in bula nativa.
  eticheta: "Amprenta textului (SHA-256)",
  explicatie:
    "Amprenta SHA-256 a textului acestui document, calculată la construirea paginii. Orice modificare a textului o schimbă.",
};

// ---------------------------------------------------------------------------------------------
// Indexul juridic (juridic.md §2c)
// ---------------------------------------------------------------------------------------------

export const INDEX_PAGINA = {
  // Rol: titlul colectiei de documente (fisa: 4 cuvinte, ~33 de caractere).
  titlu: "Documentele juridice ale 3S",
  // Rol: fraza care spune ce se gaseste in colectie (fisa: ~85 de caractere, 2 randuri).
  subtitlu: "Condițiile de folosire, datele personale, cookie-urile și licența aplicației, în șapte documente.",
};

// ---------------------------------------------------------------------------------------------
// Metadata
// ---------------------------------------------------------------------------------------------

export const META_INDEX_JURIDIC: MetaPagina = {
  titlu: "Documentele juridice ale platformei 3S",
  descriere:
    "Mențiunile legale, politica de confidențialitate, termenii, cookie-urile, regulile publice, licența și subîmputerniciții platformei 3S.",
};

export const META_DOCUMENTE: Record<SlugJuridic, MetaPagina> = {
  "informatii-legale": {
    titlu: "Mențiuni legale | 3S",
    descriere:
      "Cine furnizează serviciul 3S, cum îl contactați, unde rulează platforma și ce autoritate supraveghează protecția datelor.",
  },
  confidentialitate: {
    titlu: "Politica de confidențialitate | 3S",
    descriere:
      "Ce date personale prelucrează site-ul 3S, în ce scop, pe ce temei, cât timp, cui le transmite și cum vă exercitați drepturile.",
  },
  termeni: {
    titlu: "Termeni și condiții | 3S",
    descriere:
      "Condițiile de folosire a platformei 3S și anexa despre prelucrarea datelor personale din documentele încărcate de clienți.",
  },
  cookies: {
    titlu: "Politica de cookie-uri | 3S",
    descriere:
      "Ce păstrează site-ul 3S în browser, cât timp și de ce, cui ajung datele și cum vă dați sau vă retrageți acordul pentru statistică.",
  },
  "politici-publice": {
    titlu: "Reguli publice | 3S",
    descriere:
      "Actele normative și standardul pe care se sprijină documentele juridice ale site-ului 3S, cu legături la textele citite.",
  },
  "licenta-software": {
    titlu: "Licența aplicației | 3S",
    descriere:
      "Ce drept de folosire primiți asupra aplicației 3S, ce puteți face cu ea și ce nu aveți voie, pe web, pe calculator și pe telefon.",
  },
  subimputerniciti: {
    titlu: "Subîmputerniciții platformei | 3S",
    descriere:
      "Furnizorii care prelucrează pentru platforma 3S datele din documentele clienților: ce face fiecare și în ce țară stau datele.",
  },
};

export const META_HARTA: MetaPagina = {
  titlu: "Harta site-ului 3S: toate paginile, pe secțiuni",
  descriere:
    "Toate paginile site-ului 3S, grupate pe secțiuni și generate din lista rutelor: produs, sectoare, resurse și documentele juridice.",
};

export const META_ACCESIBILITATE: MetaPagina = {
  titlu: "Declarația de accesibilitate a site-ului 3S",
  descriere:
    "Cât de accesibil e site-ul 3S: ținta WCAG 2.2 AA, ce verificăm automat la fiecare versiune și ce nu am verificat încă.",
};

// ---------------------------------------------------------------------------------------------
// Harta site (harta-site.md)
// ---------------------------------------------------------------------------------------------

export const HARTA_PAGINA = {
  // Rol: titlul paginii (fisa: 2 cuvinte).
  titlu: "Harta site-ului",
  // Rol: fraza de sub titlu, despre ce contine lista si cum se tine la zi (fisa: ~120 de caractere).
  subtitlu: "Toate paginile 3S, pe secțiuni. Lista se generează din rutele site-ului, așa că o pagină nouă apare aici singură.",
};

/** Grupele hartii, in ordinea coloanelor din subsol; numele sunt cele ale coloanelor. */
export const GRUPE_HARTA = ["Produs", "Sectoare", "Resurse", "Companie", "Juridic"] as const;
export type GrupaHarta = (typeof GRUPE_HARTA)[number];

// ---------------------------------------------------------------------------------------------
// Declaratia de accesibilitate (accesibilitate.md)
// ---------------------------------------------------------------------------------------------

/** Data la care a fost intocmita declaratia; se schimba odata cu textul ei. */
export const DATA_DECLARATIE = "2026-09-25";

export type SectiuneDeclaratie = {
  id: string;
  titlu: string;
  paragrafe: string[];
  lista?: string[];
  /** Paragrafele de dupa lista. */
  dupa?: string[];
};

export type Declaratie = {
  titlu: string;
  data: string;
  sectiuni: SectiuneDeclaratie[];
};

/**
 * Declaratia, pentru gazda site-ului (`3s4.ke2.in` azi) si adresa confirmata a marcii (`null` cat
 * timp `config/brand.json` n-o are).
 */
export function declaratieAccesibilitate(gazda: string, adresa: string | null): Declaratie {
  return {
    titlu: "Declarația de accesibilitate",
    data: "Întocmită pe " + dataInCuvinte(DATA_DECLARATIE),
    sectiuni: [
      {
        id: "acoperire",
        titlu: "Ce acoperă declarația",
        paragrafe: [
          "Declarația privește site-ul " +
            gazda +
            " al mărcii 3S, cu toate paginile lui publice. Ținta este nivelul AA din " +
            legaturaAct("wcag22") +
            ", recomandarea W3C din 12 decembrie 2024. Nu declarăm încă o conformitate deplină: unele criterii nu au fost verificate, iar lista lor e mai jos.",
        ],
      },
      {
        id: "verificari",
        titlu: "Ce verificăm la fiecare versiune",
        paragrafe: ["Verificările automate ale site-ului, rulate la fiecare versiune nouă, cer:"],
        lista: [
          "zero încălcări grave sau critice ale regulilor implicite din biblioteca axe-core, pe fiecare pagină publică, la o fereastră de desktop de 1280 de pixeli;",
          "contrast de cel puțin 4,5:1 pentru textul obișnuit (criteriul 1.4.3), verificat de aceleași reguli acolo unde biblioteca poate calcula culoarea fundalului;",
          "nicio derulare pe orizontală la o lățime de 390 de pixeli.",
        ],
      },
      {
        id: "implementat",
        titlu: "Ce am făcut pentru acces",
        paragrafe: [],
        lista: [
          "legătura „Săriți la conținut”, prima pe fiecare pagină, pentru tastatură și pentru cititoarele de ecran (criteriul 2.4.1);",
          "un contur albastru de 2 pixeli, definit pentru tot site-ul, pe elementele care primesc focus de la tastatură (criteriul 2.4.7);",
          "la setarea de mișcare redusă a sistemului, tranzițiile și animațiile din foile de stil și derularea lină se opresc;",
          "pagina curentă marcată pentru cititoarele de ecran în firul de navigare;",
          "limba paginilor declarată ca română, ca textul să fie citit cu pronunția potrivită.",
        ],
      },
      {
        id: "limitari",
        titlu: "Ce nu am verificat încă",
        paragrafe: ["Următoarele nu sunt verificate, deci nu le declarăm conforme:"],
        lista: [
          "mărirea textului la 200% și afișarea la 320 de pixeli lățime (criteriile 1.4.4 și 1.4.10);",
          "contrastul textului așezat peste imagini sau peste fundaluri cu trecere între culori, pe care biblioteca nu îl poate calcula;",
          "focusul câmpului de căutare din paleta de comenzi, care își ascunde conturul și arată numai cursorul de scriere (criteriul 2.4.7);",
          "mărimea minimă a țintelor de atingere (criteriul 2.5.8), pe care regulile implicite ale bibliotecii nu o verifică;",
          "folosirea site-ului cu cititoare de ecran și numai cu tastatura, pe toate piesele interactive, de către oameni care lucrează zilnic așa;",
          "afișarea pe ecrane tactile, unde nu există trecerea cu mouse-ul peste elemente.",
        ],
      },
      {
        id: "semnalare",
        titlu: "Semnalați o problemă",
        paragrafe:
          adresa === null
            ? [
                "Adresa pentru semnalarea problemelor de accesibilitate se publică aici după ce devine activă.",
                "Până atunci, declarația descrie numai ce am verificat noi.",
              ]
            : [
                "Dacă întâlniți pe site o barieră de accesibilitate, scrieți-ne la [" +
                  adresa +
                  "](mailto:" +
                  adresa +
                  "), cu pagina și ce încercați să faceți.",
              ],
      },
    ],
  };
}

/** Textul standardului, pentru probe: forma scurta si adresa din care a fost citit. */
export const STANDARD_ACCESIBILITATE = ACTE.wcag22;
