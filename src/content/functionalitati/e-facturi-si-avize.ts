// Textele paginii /functionalitati/e-facturi-si-avize (fisa functionalitati__e-facturi-si-avize.md; sablonul
// cinema, functionalitati__sablon.md). Scrise de noi din faptele 3S (plan D4b, D4c), pe FUNCTIA fiecarui bloc
// si pe lungimea masurata in fisa (plan D1b): alta imagine, alt ritm, alte etichete si alte cifre decat
// referinta. Lungimile din comentarii sunt ale referintei, pe acelasi rol.
//
// CE SPUNE PAGINA E CE ARE 3S: factura pornita din avizul deja incarcat, clientul si preturile dintr-un
// sablon salvat, trimiterea prin integrarile de e-facturare pe care 3S le are (Peppol, Storecove) si
// asezarea facturii in dosarul clientului, langa aviz. NU se afirma acceptarea de catre o autoritate, nici
// o durata de pastrare (fisa S4, "Atentie D4"). Afirmatiile sunt in `src/content/afirmatii/cinema-2.json`.
//
// DATE FICTIVE, DECLARATE CA EXEMPLU (plan D9, D11): firmele (Alfa / Beta / Gama Exemplu), numerele de aviz,
// orele si codul fiscal sunt inventate; codul fiscal are cifra de control gresita, deci nu e al nimanui
// (proba `tests/cinema-2.test.ts`). Machetele cu date de firma poarta si o eticheta VIZIBILA "exemplu".

export const CALE_E_FACTURI = "/functionalitati/e-facturi-si-avize";

export const META_E_FACTURI = {
  titlu: "E-facturi pornite din aviz, arhivate lângă el | 3S",
  descriere:
    "Factura se face din avizul deja încărcat și din șablonul clientului, pleacă prin integrarea de e-facturare și rămâne în dosarul clientului.",
} as const;

/** Declaratia de raspuns a paginii (G-AI-02), ca text: intrebarea la care raspunde. */
export const INTREBARE_PAGINA_E_FACTURI = "Cum face 3S factura direct din avizul de livrare?";

// ---------------------------------------------------------------------------------------------
// S0 - eroul (fisa S0): titlul pe doua randuri, cererea din terminal, subtitlul italic.
// ---------------------------------------------------------------------------------------------

export const EROU_E_FACTURI = {
  // Rol: eticheta paginii (13,6/600).
  eticheta: "Funcționalitate 06 · E-facturi și avize",
  // Rol: titlul eroului, 2 randuri (72/600). Lungime: ~26 [fisa].
  titlu: "Un aviz, o factură, un loc.",
  // Rol: cererea scrisa in terminal (17,6/500). Lungime: ~37 [fisa].
  cerere: "Facturează avizul 118 pentru Beta Exemplu",
  // Rol: subtitlul italic, 1 rand. Lungime: ~54 [fisa].
  subtitlu: "Azi, până pleacă, trece prin mâinile a trei colegi.",
  indiciu: "derulați",
} as const;

// ---------------------------------------------------------------------------------------------
// S1 - harta locurilor prin care trece o factura azi (fisa S1).
// ---------------------------------------------------------------------------------------------

export type IconitaUnealta = "tabel" | "fisier" | "arhiva" | "plic" | "stocare";
export type NodHarta = { eticheta: string; rol: string; iconita: IconitaUnealta };

export const HARTA = {
  // Rol: titlul sectiunii, 1 rand (40/600). Lungime: ~38 [fisa].
  titlu: "Drumul unei facturi, azi.",
  // Rol: paragraful, 2 randuri la max 580.
  paragraf: "Avizul e într-un dosar, prețurile în altul, factura în programul ei. Între ele, cineva copiază de mână.",
  // Cele 5 noduri, in ordinea pozitiilor: stanga-sus, dreapta-sus, centru, stanga-jos, dreapta-jos.
  noduri: [
    { eticheta: "Lista de prețuri", rol: "copiată rând cu rând", iconita: "tabel" },
    { eticheta: "Facturarea", rol: "cifre tastate din nou", iconita: "fisier" },
    { eticheta: "Dosarul lunii", rol: "pus deoparte de mână", iconita: "arhiva" },
    { eticheta: "Mailul contabilei", rol: "PDF atașat", iconita: "plic" },
    { eticheta: "Discul din birou", rol: "încă o copie", iconita: "stocare" },
  ] as readonly NodHarta[],
  // Rol: cuvintele de pe cele 4 legaturi principale (text SVG, roz). Asezarea: sus, dreapta, stanga-jos, dreapta-jos.
  legaturi: ["rescris", "descărcat", "trimis iar", "dublat"] as const,
  // Rol: pastila de rezumat (11,52/700, rosu).
  rezumat: "O factură, cinci ferestre deschise",
  declaratie: "Exemplu: cele cinci locuri prin care trece azi o factură, legate prin copieri de mână",
} as const;

// ---------------------------------------------------------------------------------------------
// S2 - anxietatea, S3 - pivotul (sablon §4.3-§4.4).
// ---------------------------------------------------------------------------------------------

export const ANXIETATE_E_FACTURI = {
  // Rol: doua intrebari italice despre greselile de copiere.
  randuri: ["Suma de pe aviz e aceeași cu cea din factură?", "Cine a mutat ultimul fișierul, și unde?"] as const,
  // Rol: emfaza in roz, riscul numit.
  emfaza: "Clientul vede greșeala înaintea voastră.",
} as const;

export const PIVOT_E_FACTURI = {
  intrebare: "Și dacă factura s-ar face direct din aviz?",
  emfaza: "Avizul intră, factura iese, dosarul se închide.",
  linie: "Pentru asta există e-facturile 3S.",
} as const;

// ---------------------------------------------------------------------------------------------
// S4 - generatorul de factura (fisa S4): fereastra cu starea, sabloanele, fluxul si metadatele.
// ---------------------------------------------------------------------------------------------

export type RandMeta = { cheie: string; valoare: string; fel?: "pastila" | "cod" };

export const GENERATOR = {
  // Rol: titlul sectiunii, 1 rand (40/600).
  titlu: "Căutați avizul, găsiți factura.",
  // Rol: paragraful, 4 randuri la max 580. Porneste de la cautarea de la inchiderea lunii, nu de la pasii facturii.
  paragraf:
    "La închiderea lunii, contabila caută în 3S după client sau după numărul avizului și le găsește împreună: avizul semnat și factura făcută din el, cu integrarea de e-facturare prin care a plecat. Nimic nu se mai adună din trei dosare diferite.",
  // Bara ferestrei.
  bara: "3S · facturi",
  exemplu: "exemplu",
  // Capul: starea si butonul decorativ.
  cheieStare: "Stare",
  stare: "Generată din avizul 118",
  buton: "Generează factura",
  // Randul de sabloane.
  cheieSabloane: "Șablon",
  sabloane: ["Beta · pe comandă", "Alfa · lunar", "Gama · trimestrial"] as const,
  maiMulte: "+ 5",
  // Fluxul: 4 randuri, ultimul in lucru; urmeaza legatura aviz - factura, nu pasii de completare.
  flux: [
    "Avizul 118 recunoscut după număr, client și data livrării",
    "Legat de factură în registrul arhivei",
    "Căutabil după client sau după aviz",
    "Pleacă prin e-facturare integrată",
  ] as const,
  // Metadatele: 4 randuri; una e pastila, alta un cod fiscal.
  meta: [
    { cheie: "Client", valoare: "Beta Exemplu SRL" },
    { cheie: "CUI", valoare: "RO 38456120", fel: "cod" },
    { cheie: "Trimisă prin", valoare: "Peppol · Storecove", fel: "pastila" },
    { cheie: "Dosar", valoare: "Beta Exemplu / 2026 / aprilie" },
  ] as readonly RandMeta[],
  declaratie: "Exemplu cu date fictive: o factură generată din avizul 118 al clientului Beta Exemplu",
} as const;

// ---------------------------------------------------------------------------------------------
// S5 - contrastul Inainte / Acum (sablon §4.6, varianta svg).
// ---------------------------------------------------------------------------------------------

export const CONTRAST_E_FACTURI = {
  titlu: "Aceeași factură, pe un drum mult mai scurt",
  paragraf: "Înainte, fiecare factură trecea prin cinci ferestre. Acum pleacă dintr-un singur loc și se întoarce acolo, arhivată.",
  inainte: {
    titlu: "Înainte",
    subtitlu: "cinci ferestre",
    // Cuvintele rosii de pe legaturile desenului.
    etichete: ["rescris", "atașat"] as const,
    declaratie: "Desen: cinci documente împrăștiate, legate prin copieri de mână",
    metrici: [
      { valoare: "5", cheie: "Programe deschise" },
      { valoare: "de mână", cheie: "Datele avizului" },
      { valoare: "pierdută", cheie: "Legătura cu avizul", calitativ: "rau" },
    ],
  },
  acum: {
    titlu: "Acum",
    subtitlu: "din avizul încărcat",
    initiala: "3S",
    declaratie: "Desen: aceleași cinci puncte legate de 3S, în centru",
    metrici: [
      { valoare: "1", cheie: "Program deschis" },
      { valoare: "din aviz", cheie: "Datele avizului" },
      { valoare: "păstrată", cheie: "Legătura cu avizul", calitativ: "bun" },
    ],
  },
  punte: "aviz · factură",
} as const;

// ---------------------------------------------------------------------------------------------
// S6 - CTA final (sablon §4.7).
// ---------------------------------------------------------------------------------------------

export const CTA_E_FACTURI = {
  // Rol: titlul CTA, 2 randuri. Lungime: ~36 [fisa].
  titlu: "Avizul de azi, facturat până diseară.",
  // Rol: paragraful mare, 2 randuri.
  paragraf: "Șablonul se face o dată. De acolo, fiecare aviz nou devine factură, pleacă la client și intră în arhivă.",
  buton: "Deschideți un cont",
  nota: "Contul e gratuit azi, la 0 RON, și nu cere card.",
} as const;

/** Firul paginii (BreadcrumbList). */
export const FIR_E_FACTURI = [
  { nume: "Acasă", cale: "/" },
  { nume: "E-facturi și avize", cale: CALE_E_FACTURI },
] as const;
