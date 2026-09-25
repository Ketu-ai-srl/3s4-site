// Continutul verificatorului de termene (instrumente__termene-pastrare.md) si al subpaginii de
// tiparit: tarile, data la care s-au citit sursele si textele paginii.
//
// TARILE. Numai cele verificate complet la sursa primara: Romania si Republica Moldova. Referinta
// vizuala are 18 jurisdictii; celelalte 16 nu apar, fiindca nu le-am citit la sursa primara si o
// cifra gresita aici poate duce la distrugerea unui act necesar (decizia dispecerului pentru felia
// comparatii-termene: mai bine putine tari exacte decat multe aproximative). Forma selectorului
// ramane aceeasi; o tara se adauga aici, cu datele ei, cand e citita.
//
// LUNGIMILE din comentarii sunt ale referintei, pe acelasi rol, numarate pentru lungime, nu pentru
// cuvinte.

import type { Legatura } from "@/content/navigatie";
import { MOLDOVA } from "./moldova";
import { ROMANIA } from "./romania";
import type { Tara } from "./tipuri";

export { TIPURI, numarConfirmate, numeTip } from "./tipuri";
export type { CodTara, CodTip, RandTermen, SursaPrimara, Tara, TipAct } from "./tipuri";

/** Ziua in care s-au deschis si s-au citit sursele fiecarui rand (ISO). */
export const DATA_CITIRII = "2026-09-25";

/** Aceeasi zi, scrisa ca pe pagina. */
export const DATA_CITIRII_TEXT = "25 septembrie 2026";

/** Tarile, in ordinea pastilelor. Prima e cea aleasa la incarcare. */
export const TARI: readonly Tara[] = [ROMANIA, MOLDOVA];

export const CALE_TERMENE = "/instrumente/termene-pastrare";
export const CALE_TIPAR = "/instrumente/termene-pastrare/tipar";

export const META_TERMENE = {
  // Titlul si descrierea paginii (poarta de SEO: titlu 15-65, descriere 50-160).
  titlu: "Termene de păstrare a actelor în România și Moldova | 3S",
  descriere:
    "Facturi, state de salarii, dosare de personal și contracte: termenele de păstrare din România și din Republica Moldova, după legile citite la sursă.",
};

export const META_TIPAR = {
  titlu: "Termenele de păstrare, varianta de tipărit | 3S",
  descriere:
    "Tabelul termenelor de păstrare din România și din Republica Moldova, pe foaie A4, gata de tipărit sau de salvat ca PDF pentru dosarul firmei.",
};

/** Firul subpaginii de tiparit, pentru datele structurate (pagina nu are fir pe ecran). */
export const FIR_TIPAR: { nume: string; cale: string }[] = [
  { nume: "Acasă", cale: "/" },
  { nume: "Cât se păstrează fiecare act", cale: CALE_TERMENE },
  { nume: "Varianta de tipărit", cale: CALE_TIPAR },
];

/** Firul de pagina: nivelurile, ca in meniul site-ului. */
export const FIR_TERMENE = [
  { text: "Acasă", cale: "/" },
  // Rol: numele instrumentului. Lungime: 4 cuvinte [fisa].
  { text: "Cât se păstrează fiecare act", cale: CALE_TERMENE },
];

export const EROU_TERMENE = {
  // Rol: eticheta-pastila de deasupra titlului (majuscule prin stil). Lungime: 2 cuvinte [fisa].
  // Aici tarile pentru care exista date.
  eticheta: "România și Moldova",
  // Rol: titlul instrumentului (h1, max 20ch, 2 randuri la 1440 si la 390).
  titlu: "Termenele de păstrare ale actelor firmei",
  // Rol: ce acopera instrumentul si ce e propriu arhivei din Romania; 3 randuri la 1440, 7 la 390
  // [fisa; masurat: 3 si 7]. E si primul paragraf din <main>, deci raspunsul paginii (G-AI-02).
  subtitlu:
    "Facturi, state de salarii, dosare de personal și alte acte ale firmelor din România și Republica Moldova, cu termenele din legile citite pe " +
    DATA_CITIRII_TEXT +
    ". În România, un act se elimină numai prin comisia de selecționare, cu confirmarea Arhivelor Naționale.",
};

export const INSTRUMENT = {
  // Numele accesibil al sectiunii instrumentului.
  etichetaSectiune: "Termenele, țară cu țară",
  // Rol: eticheta accesibila a grupului de pastile.
  etichetaSelector: "Alegeți țara",
  /**
   * Contorul din capul panoului: "Termen confirmat pentru 5 din 7 acte". ~233 px la 13,6/400, cat
   * al referintei: la 1440 sta langa titlu, la 390 trece sub el (cap de 114 px) [fisa].
   */
  contor: (confirmate: number, total: number) => "Termen confirmat pentru " + confirmate + " din " + total + " acte",
  // Rol: valoarea unui rand fara cifra (14,4/500). Lungime: 11 [fisa].
  neconfirmat: "Neconfirmat",
  etichete: {
    inceput: "De când curge termenul",
    temei: "Temei legal",
    motiv: "De ce nu dăm o cifră",
  },
  // Rol: nota de final a panoului (data citirii, legea se poate schimba, doua exemple romanesti
  // care tin actele mai mult): 3 randuri la 1440 si 10 la 390 (106 si 258 px) [fisa]. Aceeasi nota
  // sta sub ambele tari, deci exemplele poarta "In Romania". Forma cu data spune ce s-a facut si
  // cand, nu ca s-a "verificat" (poarta de afirmatii).
  nota:
    "Am citit textele de lege pe " +
    DATA_CITIRII_TEXT +
    ", la autoritățile care le publică. Termenul nu curge de la data actului: fiecare rând confirmat spune de când se numără. O lege nouă poate schimba oricare cifră. În România, actele unui bun de capital se țin până la 5 ani după perioada de ajustare a TVA (Codul fiscal, art. 305), iar cât timp are statele de salarii, firma eliberează la cerere, în cel mult 60 de zile, adeverințe din ele (Legea nr. 16/1996, art. 29).",
};

export type IesireTermene = Legatura & { iconita: "printer" | "arrow-right" };

// Rol: cele 3 iesiri de sub panou; prima cu imprimanta, celelalte cu sageata [fisa]. La 1440
// referinta are 326 / 390 / 359 px cu iconita, toate pe un rand; aici 325 / 382 / 366 [masurat].
// La 390 blocul are 184 px, ca la referinta: prima incape pe un rand (26), iar a doua si a treia,
// mai late de 358, se rup pe 2 (51 fiecare) [masurat]. O a doua iesire sub 358 ramane pe un rand
// si scurteaza blocul la 158.
export const IESIRI_TERMENE: IesireTermene[] = [
  { text: "Tabelul de tipărit, cu România și Moldova", href: CALE_TIPAR, ruta: CALE_TIPAR, iconita: "printer" },
  {
    text: "Unde stau actele firmei în 3S și cum sunt criptate",
    href: "/securitate",
    ruta: "/securitate",
    iconita: "arrow-right",
  },
  {
    text: "Facturarea electronică, explicată pentru firme",
    href: "/e-facturare",
    ruta: "/e-facturare",
    iconita: "arrow-right",
  },
];

export const TIPAR = {
  inapoi: { text: "Înapoi la verificator", href: CALE_TERMENE, ruta: CALE_TERMENE } as Legatura,
  // Rol: butonul inchis de tiparire. Lungime: 8 [fisa].
  buton: "Tipăriți",
  titlu: "Termene de păstrare în România și în Republica Moldova",
  // Rol: ce e documentul si pentru ce (3 randuri la 1440, max 68ch). E si primul paragraf din <main>.
  paragraf:
    "O copie pe hârtie a verificatorului, pentru dosarul firmei sau pentru comisia de selecționare: România și Republica Moldova, câte șapte tipuri de acte, după legile citite pe " +
    DATA_CITIRII_TEXT +
    ". Se tipărește pe A4 sau se salvează ca PDF.",
  rezumat: "Tabelul-rezumat",
  // Numele stratului cu derulare al tabelului, altul decat al sectiunii (reperele nu se confunda).
  etichetaTabel: "Termenele pe țări și pe tipuri de acte",
  // Capul primei coloane. La referinta aici statea eticheta selectorului, un defect: coloana e tara.
  capTara: "Țara",
  // Rol: semnul celulei neconfirmate si legenda lui.
  semnNeconfirmat: "·",
  legenda: "Punctul median marchează un termen neconfirmat; motivul e în secțiunea țării.",
  // Nota de final, cu adresa paginii-instrument dedesubt.
  nota:
    "Textele de lege au fost citite pe " +
    DATA_CITIRII_TEXT +
    ". În România, un act se elimină numai prin comisia de selecționare a firmei. Tabelul interactiv, cu fiecare rând explicat:",
};
