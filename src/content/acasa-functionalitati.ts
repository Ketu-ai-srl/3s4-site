// Textele celor 3 machete din sectiunea functionalitatilor de pe start (acasa-functionalitati.md
// §5-§7, §11) si etichetele accesibile ale piesei. Textele pasilor (titlul, subtitlul, cele 3
// blocuri, fraza de iesire) NU stau aici: sunt ale contractului `src/content/acasa.ts`
// (`FUNCTIONALITATI`), scris de felia de text.
//
// DATE FICTIVE, DECLARATE CA EXEMPLU (plan D9). Fisierele, sumele, persoanele si firma-client din
// machete sunt inventate, cu nume evident fictive (decizia D11); fiecare macheta poarta o eticheta
// accesibila care o spune (`declaratie`) si una vizibila (`ETICHETA_EXEMPLU`).
// Nicio data a vreunei firme reale si nimic din exemplele referintei (nume de fisiere, firme,
// persoane): rolurile si lungimile vin din fisa, cuvintele sunt scrise pentru 3S.
//
// CE ARATA MACHETELE E CE ARE 3S (plan D4, D4b). Fiecare functie aratata e in registrul de
// afirmatii al startului (`src/content/afirmatii/acasa.json`):
//   - cautarea cu raspunsul si pagina citata: `acasa-raspuns-cu-pagina`, `acasa-functii-in-productie`;
//   - actele scanate de 3S si etichetarea automata: `acasa-scanare-3s`, `acasa-clasare-automata`;
//   - portalul pe categorii: `acasa-acces-pe-persoana-si-dosar`;
//   - registrul si termenul calculat: `acasa-termene-calculate`; jurnalul: `acasa-jurnal-de-acces`.
// La referinta, machetele aratau semnatura electronica si "pregatit pentru o lege din 2026"; 3S nu
// are azi semnatura calificata (plan D4c), iar legea nu e numita, deci randurile acelea nu se iau.
//
// TERMENELE DE PASTRARE din registru sunt un EXEMPLU, nu o regula confirmata. Sunt RELATARE
// NEVERIFICATA: vin din cercetarea proiectului (facturile si extrasele de cont 5 ani, dupa Legea
// contabilitatii 82/1991 art. 25 in forma data de Legea 36/2023; situatiile financiare anuale 10 ani,
// dupa art. 35 alin. (3), cifra luata dintr-un blog de consultanta), iar niciuna nu a fost confruntata
// cu textul legii pe legislatie.just.ro. Evidenta proiectului mai semnaleaza o schimbare legislativa
// in 2026, si ea neverificata. De aceea: macheta isi declara termenele ilustrative (`declaratie`), iar
// fiecare termen sta NECONFIRMAT in registrul de afirmatii al feliei
// (`src/content/afirmatii/functionalitati-acasa.json`), pana il confirma cineva la sursa. La
// referinta factura avea 10 ani; un contract nu apare in registru, fiindca pentru el nici relatarea
// nu are un termen.

/**
 * Eticheta mica VIZIBILA de langa numele fiecarei machete (decizia owner-ului D11, 25.09): datele
 * arata a firma reala (nume de firma, sume, facturi), deci se spune si pe ecran ca sunt un exemplu,
 * nu doar cititorului de ecran (`declaratie`). 11 px, `ardezie-6` pe `ardezie-0` (7,24:1).
 */
export const ETICHETA_EXEMPLU = "exemplu";

/** Tipul unui act, dupa culoarea etichetei lui (fisa §5: factura chihlimbar, albastru, ardezie). */
export type CodTip = "factura" | "albastru" | "raport";

export type TipAct = { cod: CodTip; text: string };

// ---------------------------------------------------------------------------------------------
// Macheta 1 - cautarea in arhiva (fisa §5)
// ---------------------------------------------------------------------------------------------

export type RandCautare = {
  /** Placuta de format, textul ei (8,96/800). */
  placuta: "PDF" | "XLS";
  /** Numele fisierului (14,4/700, pe un rand, cu puncte de suspensie). */
  fisier: string;
  tip: TipAct;
  /** Data actului (12,16/400). */
  data: string;
  /** Actul a fost scanat de 3S dupa original: bifa verde si insigna verde din rezumat. */
  scanat: boolean;
  rezumat: {
    /** Titlul rezumatului, cu pagina citata (12,8/700 `albastru`). */
    titlu: string;
    /** Doua randuri la 1440 (13,44/400, rand 20,83). */
    text: string;
  };
};

export type MachetaCautare = {
  declaratie: string;
  eticheta: string;
  /** Intrebarea din bara de cautare, in limbaj firesc (14,08/500). */
  intrebare: string;
  /** Linia de sub bara, cu cate acte s-au gasit (13,12/600). */
  gasite: string;
  /** Insignele din dreapta randului: `title` nativ si textul pentru cititorul de ecran. */
  insigne: { scanat: string; etichetat: string };
  randuri: [RandCautare, RandCautare, RandCautare];
};

export const MACHETA_CAUTARE: MachetaCautare = {
  declaratie: "Exemplu cu date fictive: o căutare în arhivă, cu trei acte găsite",
  // Rol: numele machetei, langa lupa (15,2/700 `albastru`). Lungime: 17 [numarat].
  eticheta: "Căutare în arhivă",
  // Rol: o intrebare in limbaj firesc despre un an intreg. Lungime: 33 [numarat]; la referinta 32.
  intrebare: "Tot ce privește depozitul în 2025",
  // Rol: cate acte au iesit. Lungime: 31 [numarat]; la referinta 29.
  gasite: "9 acte găsite, cu pagina citată",
  insigne: { scanat: "Scanat de 3S", etichetat: "Etichetat automat" },
  randuri: [
    {
      placuta: "PDF",
      fisier: "Factura_chirie_martie.pdf",
      tip: { cod: "factura", text: "Factură" },
      data: "mar. 2025",
      scanat: true,
      // Rol: emitentul, suma si scadenta. Lungime: 83 [numarat].
      rezumat: {
        titlu: "Rezumat din pagina 1",
        text: "Chiria depozitului pe martie: 3.200,00 lei plus TVA, de plătit până pe 10 aprilie 2025.",
      },
    },
    {
      placuta: "PDF",
      fisier: "Contract_inchiriere_depozit.pdf",
      tip: { cod: "albastru", text: "Contract" },
      data: "ian. 2025",
      scanat: true,
      // Rol: obiectul si valabilitatea. Lungime: 99 [numarat].
      rezumat: {
        titlu: "Rezumat din pagina 2",
        text: "Închiriere pe 12 luni, din ianuarie până în decembrie 2025, cu predarea spațiului pe proces-verbal.",
      },
    },
    {
      placuta: "XLS",
      fisier: "Consum_energie_T1_2025.xlsx",
      tip: { cod: "raport", text: "Raport" },
      data: "apr. 2025",
      scanat: false,
      // Rol: cifrele raportului. Lungime: 101 [numarat].
      rezumat: {
        titlu: "Rezumat din foaia 1",
        text: "Depozitul a consumat 18.450 kWh în primul trimestru, cu 6% mai puțin decât în aceeași perioadă din 2024.",
      },
    },
  ],
};

// ---------------------------------------------------------------------------------------------
// Macheta 2 - portalul clientilor (fisa §6)
// ---------------------------------------------------------------------------------------------

/** Culoarea avatarului: fundal la 12%, initialele in nuanta inchisa (fisa §6). */
export type CuloareAvatar = "albastru" | "chihlimbar" | "teal";

export type FolderPortal = {
  nume: string;
  /** Cate acte are dosarul; lipseste la dosarele fara acces. */
  numar: number | null;
};

export type PersoanaPortal = {
  initiale: string;
  /** Numele (12,8/700). Al treilea trece pe doua randuri la 1440, ca pe referinta. */
  nume: string;
  /** Rolul (11,2/400), un cuvant: pe tabul de 101 px de la 390 trebuie sa incapa pe un rand. */
  rol: string;
  culoare: CuloareAvatar;
  /** Patru dosare: intai cele cu acces, apoi cele fara (`numar: null`). */
  foldere: [FolderPortal, FolderPortal, FolderPortal, FolderPortal];
};

export type MachetaPortal = {
  declaratie: string;
  eticheta: string;
  /** Eticheta grupului de butoane cu persoanele. */
  grup: string;
  /** Inceputul randului "vizibil pentru", urmat de numele persoanei ingrosat. */
  vizibilPentru: string;
  /** Cipul din dreapta: accesul vine dintr-o regula. */
  cip: string;
  /** Textul citit de cititorul de ecran langa un dosar fara acces. */
  faraAcces: string;
  subsol: { stanga: string; dreapta: string };
  persoane: [PersoanaPortal, PersoanaPortal, PersoanaPortal];
};

export const MACHETA_PORTAL: MachetaPortal = {
  declaratie: "Exemplu cu date fictive: portalul clienților, cu dosarele văzute de fiecare persoană",
  // Rol: numele machetei, langa iconita cu oameni (15,2/700). Lungime: 19 [numarat].
  eticheta: "Portalul clienților",
  grup: "Persoanele cu acces în portal",
  vizibilPentru: "Acte vizibile pentru",
  // Rol: accesul vine dintr-o regula, nu dat de mana (12,16/600). Lungime: 19 [numarat].
  cip: "Regulă pe categorie",
  faraAcces: "fără acces",
  subsol: {
    // Rol: accesul se da pe reguli, nu act cu act (12,8/400). Lungime: 42 [numarat], 240,6 px la
    // 1440 [masurat], deci UN rand in cei 274,7 px lasati de fraza verde. La referinta erau doua
    // randuri, iar al doilea era taiat de rama la jumatate (fisa §14.7); aici continutul e
    // dimensionat sa intre in rama, una dintre cele doua solutii ale fisei. Cu doua randuri, fraza
    // verde, centrata pe ele, cobora intreaga la 3,25 px de margine [masurat], deci nicio estompare
    // n-ar fi putut inmuia randul taiat de langa ea fara s-o spele.
    stanga: "Accesul se dă pe categorii, nu act cu act.",
    // Rol: nu mai pleaca nimic pe e-mail (12,8/600). Lungime: 25 [numarat].
    dreapta: "Fără atașamente pe e-mail",
  },
  persoane: [
    {
      initiale: "EV",
      nume: "Elena V.",
      rol: "Contabil",
      culoare: "albastru",
      foldere: [
        { nume: "Facturi", numar: 48 },
        { nume: "Rapoarte fiscale", numar: 12 },
        { nume: "Contracte", numar: null },
        { nume: "Proiecte", numar: null },
      ],
    },
    {
      initiale: "ES",
      nume: "Exemplu SRL",
      rol: "Client",
      culoare: "chihlimbar",
      foldere: [
        { nume: "Proiectul lor", numar: 4 },
        { nume: "Facturile lor", numar: 9 },
        { nume: "Contracte", numar: null },
        { nume: "Rapoarte fiscale", numar: null },
      ],
    },
    {
      initiale: "EA",
      nume: "Echipa de achiziții",
      rol: "Echipă",
      culoare: "teal",
      foldere: [
        { nume: "Facturi", numar: 48 },
        { nume: "Contracte", numar: 7 },
        { nume: "Proiecte", numar: 15 },
        { nume: "Rapoarte fiscale", numar: 12 },
      ],
    },
  ],
};

// ---------------------------------------------------------------------------------------------
// Macheta 3 - registrul arhivei (fisa §7)
// ---------------------------------------------------------------------------------------------

/** Iconitele randurilor de verificare (Lucide, contur 2). */
export type IconitaVerificare = "tag" | "clock" | "book-open" | "shield";

export type RandRegistru = {
  /** Numarul de ordine, in JetBrains Mono. */
  nr: string;
  fisier: string;
  tip: TipAct;
  /** Termenul de pastrare (12,48/400, cifre tabulare). */
  termen: string;
};

export type MachetaRegistru = {
  declaratie: string;
  eticheta: string;
  /** Insigna verde din capul machetei (12,16/600). */
  insigna: string;
  /** Capetele celor 5 coloane: numar, document, tip, pastrare, stare. */
  coloane: [string, string, string, string, string];
  /** Textul citit de cititorul de ecran in coloana de stare. */
  stare: string;
  randuri: [RandRegistru, RandRegistru, RandRegistru];
  verificari: [
    { iconita: IconitaVerificare; text: string },
    { iconita: IconitaVerificare; text: string },
    { iconita: IconitaVerificare; text: string },
    { iconita: IconitaVerificare; text: string },
  ];
};

export const MACHETA_REGISTRU: MachetaRegistru = {
  declaratie: "Exemplu cu date fictive: registrul arhivei, cu un termen de păstrare ilustrativ pentru fiecare act",
  // Rol: numele machetei (15,2/700). Lungime: 17 [numarat].
  eticheta: "Registrul arhivei",
  // Rol: registrul se face singur. Lungime: 13 [numarat].
  insigna: "Ținut automat",
  coloane: ["Nr.", "Document", "Tip", "Păstrare", "Stare"],
  stare: "în regulă",
  randuri: [
    { nr: "001", fisier: "Factura_chirie_martie.pdf", tip: { cod: "factura", text: "Factură" }, termen: "5 ani" },
    { nr: "002", fisier: "Extras_cont_martie.pdf", tip: { cod: "albastru", text: "Extras" }, termen: "5 ani" },
    { nr: "003", fisier: "Bilant_2024.xlsx", tip: { cod: "raport", text: "Bilanț" }, termen: "10 ani" },
  ],
  // Rol: patru verificari bifate, cate una la 500 ms (13,6/500). Lungimi: 30 / 27 / 27 / 30.
  verificari: [
    { iconita: "tag", text: "Tipul și categoria recunoscute" },
    { iconita: "clock", text: "Termen de păstrare calculat" },
    { iconita: "book-open", text: "Trecut în registrul arhivei" },
    { iconita: "shield", text: "Deschiderile trecute în jurnal" },
  ],
};

/** Bifa din insigna verde a rezumatului: caracter de text (fisa §5), urmat de un spatiu. */
export const BIFA_TEXT = "✓ ";

// ---------------------------------------------------------------------------------------------
// Punctele pistei de mobil (fisa §11) - etichete in romana (la referinta erau in engleza, §14.5)
// ---------------------------------------------------------------------------------------------

export const PUNCTE_PISTA = {
  grup: "Pașii funcționalităților",
  /** Eticheta unui punct: "Pasul 2 din 3: <eticheta pasului>". */
  punct: (numar: number, total: number, eticheta: string) => "Pasul " + numar + " din " + total + ": " + eticheta,
};
