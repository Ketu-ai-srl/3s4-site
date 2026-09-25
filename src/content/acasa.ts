// Contractul de continut al paginii de start (valul S4-1, referinta vizuala REF-N): tipurile si
// textele fiecarei sectiuni, in ordinea masurata (`docs/design/ref-n/pagini/acasa.md`, in
// depozitul fabricii), plus contractul parametrilor pe care constructorul ii trimite la
// `/inregistrare`. Doar date si functii pure; nicio componenta.
//
// CINE IL ATINGE
//   - scris de dispecer (pasul P2 din planul valului), inainte de feliile S4-1;
//   - felia `fundatie` il IMPORTA si nu il modifica: sectiunile statice si cioturile eroului,
//     constructorului si functionalitatilor;
//   - felia `text-acasa` il RESCRIE, dar numai VALORILE de text. Tipurile, cheile, tintele
//     (`href`, `ruta`), ancorele, codurile si numarul de elemente raman: `fundatie` lucreaza in
//     paralel pe ele, iar numarul de elemente e cel masurat pe referinta. O schimbare de forma
//     se cere dispecerului;
//   - feliile S4-2 (`erou`, `constructor`, `functionalitati-acasa`) il citesc; datele machetelor
//     lor stau in modulele lor, nu aici. Contractul parametrilor e inghetat pentru `constructor`
//     (il produce) si pentru `conversie` (il citeste).
//
// LUNGIMILE din comentarii sunt ale referintei, pe acelasi rol: `[fisa]` = scrisa in fisa de
// masurare (`acasa.md`, `acasa-erou.md`, `acasa-constructor.md`, `acasa-functionalitati.md`);
// `[numarat]` = numarata de dispecer pe textul referintei, pentru lungime si rol, niciodata
// pentru cuvinte. Textul de aici e cel al feliei `text-acasa`, scris pentru 3S din faptele
// marcii: o singura forma de adresare (dumneavoastra, scris intreg, niciodata prescurtat),
// diacritice complete, doar cratima. Fiecare valoare sta in +/-15% din lungimea rolului ei.
//
// AFIRMATIILE. Orice fraza verificabila de aici are intrare in `src/content/afirmatii/acasa.json`.
// Singurele fapte permise: registrul de afirmatii, `config/brand.json` si deciziile
// owner-ului din planul valului (D3, D4b, D4c, D5). Nicio cifra de tractiune, niciun client,
// niciun testimonial inventat.

import { postaMarcii } from "./entitate";
import { CALE_INREGISTRARE, type Legatura, type NumeIconita } from "./navigatie";

// ---------------------------------------------------------------------------------------------
// Ancorele si metadatele startului
// ---------------------------------------------------------------------------------------------

/**
 * Identificatorii sectiunilor de pe `/` (fara diez). Navigatia trimite la `/#functionalitati`
 * si la `/#intrebari`; o ancora schimbata aici trebuie schimbata si in `navigatie.ts`.
 */
export const ANCORE_ACASA = {
  // Cheia nu se numeste `constructor`: ar umbri proprietatea mostenita de orice obiect.
  constructorul: "constructor",
  functionalitati: "functionalitati",
  preturi: "preturi",
  intrebari: "intrebari",
  contact: "contact",
} as const;

export const META_ACASA = {
  // Rol: `<title>`-ul paginii de start. Prag de poarta: 15-65 caractere.
  titlu: "3S Scan Store Solve: arhiva firmei care răspunde",
  // Rol: descrierea pentru motoarele de cautare. Prag de poarta: 50-160 caractere.
  descriere:
    "Arhiva firmei, scanată și ținută în ordine, vă răspunde cu pagina citată, pe web sau pe WhatsApp. Toate pachetele costă 0 RON astăzi.",
};

// ---------------------------------------------------------------------------------------------
// 2. Eroul (acasa-erou.md §1.3-§1.4, §1.6.2): partea statica. Bucla animata, macheta si foile
//    zburatoare sunt ale feliei `erou`; aici stau textele pe care ciotul le arata fara JavaScript.
// ---------------------------------------------------------------------------------------------

export type RandPopover = {
  iconita: NumeIconita;
  text: string;
};

export type NodBucla = {
  /** Pozitia pe bucla, ca pe referinta (fractiile 0,12 / 0,38 / 0,62 / 0,88 din drum). */
  pozitie: "sus-stanga" | "jos-stanga" | "sus-dreapta" | "jos-dreapta";
  eticheta: string;
  iconita: NumeIconita;
};

export type Erou = {
  pastile: {
    /** Pastila 1 e buton: deschide popover-ul, nu navigheaza. */
    intrebare: { text: string; iconita: NumeIconita };
    /** Pastila 2 e legatura, cu sageata la final. */
    legatura: Legatura & { iconita: NumeIconita };
  };
  popover: { randuri: RandPopover[]; legatura: Legatura };
  /** h1: doua propozitii pe randuri separate; `accent` e finalul celei de-a doua, in `albastru`. */
  titlu: { primaPropozitie: string; aDouaInainteDeAccent: string; accent: string };
  subtitlu: string;
  butonPrincipal: Legatura;
  butonSecundar: Legatura;
  nota: string;
  bucla: {
    lobStanga: string;
    lobDreapta: string;
    noduri: NodBucla[];
    centru: { eticheta: string; pastila: string };
    legenda: string;
  };
};

export const EROU: Erou = {
  pastile: {
    // Rol: de ce aleg firmele produsul (deschide popover-ul). Lungime: 30 [fisa].
    intrebare: { text: "De ce să vă mutați actele în 3S?", iconita: "check" },
    // Rol: invitatie la modulul de automatizari. Lungime: 27 [fisa].
    legatura: {
      text: "Reguli care sortează singure",
      href: "/functionalitati/automatizari-ai",
      ruta: "/functionalitati/automatizari-ai",
      iconita: "refresh-cw",
    },
  },
  popover: {
    // Trei motive de incredere + legatura spre securitate. Lungimi: 91 / 40 / 62 [fisa].
    randuri: [
      {
        iconita: "lock",
        text: "Fișierele sunt criptate AES-256 pe disc și circulă doar prin conexiuni TLS 1.2 sau mai noi.",
      },
      { iconita: "globe", text: "Documentele stau la Amazon, în Germania." },
      { iconita: "code", text: "Se leagă de e-mail și de facturare, iar pe WhatsApp vă răspunde." },
    ],
    // Rol: spre pagina de securitate. Lungime: 29 [fisa].
    legatura: { text: "Citiți pagina de securitate", href: "/securitate", ruta: "/securitate" },
  },
  titlu: {
    // Rol: documentele isi stiu locul. Lungime: 38 [numarat]; h1 intreg 72, 13 cuvinte [fisa].
    // La 3S: hartia devine arhiva (Scan, Store); a doua propozitie e raspunsul (Solve).
    primaPropozitie: "Hârtiile firmei devin o arhivă digitală.",
    // Rol: inceputul propozitiei a doua, inainte de accent. Lungime: 11 [numarat].
    aDouaInainteDeAccent: "Întrebați-o",
    // Rol: finalul accentuat (in referinta, momentul de dinaintea cautarii). Lungime: 22 [fisa].
    accent: "și vă răspunde cu sursa.",
  },
  // Rol: locul in care documentele stau in ordine, pe masura firmei. Lungime: 97, 14 cuvinte [fisa].
  subtitlu:
    "Predați-ne dosarele de hârtie sau încărcați fișierele. Orice pagină o găsiți apoi pe web sau pe WhatsApp.",
  // Rol: incercarea gratuita (butonul plin). Lungime: 25 [fisa].
  butonPrincipal: {
    text: "Deschideți arhiva firmei",
    href: CALE_INREGISTRARE,
    ruta: CALE_INREGISTRARE,
  },
  // Rol: la referinta, invitatia de a vedea produsul in lucru, cu iconita play, spre aplicatia
  // web externa. Lungime: 21 [fisa]. Tinta 3S: formularul, dupa regula tintelor externe (plan
  // §6.6, D4c); de aceea textul spune intrarea in aplicatie, nu o demonstratie. INTREBARE
  // DESCHISA pentru dispecer: rolul are la 3S echivalent intern, `/incepe` (plan §6.9).
  butonSecundar: { text: "Intrați în aplicație", href: CALE_INREGISTRARE, ruta: CALE_INREGISTRARE },
  // Rol: fara card si fara obligatie (sub butoane, 14/400). Lungime: 26 [fisa].
  nota: "0 RON astăzi, fără card",
  bucla: {
    // Rol: lobul stang, intrarea (11,52/600, majuscule prin CSS, decorativ). Lungime: 7 [numarat].
    lobStanga: "Preluare",
    // Rol: lobul drept, ordinea. Lungime: 6 [numarat].
    lobDreapta: "Arhivă",
    // Nodurile 3S, pe drumul buclei: originalele intra (hartie), se digitizeaza, stau in arhiva
    // protejata si ies ca dialog (intrebare si raspuns). Lungimi la referinta: 8 / 9 / 4 / 6, un
    // cuvant fiecare [fisa]. Iconitele raman cele din contract.
    noduri: [
      { pozitie: "sus-stanga", eticheta: "originale", iconita: "file-text" },
      { pozitie: "jos-stanga", eticheta: "digitizare", iconita: "scan-line" },
      { pozitie: "sus-dreapta", eticheta: "seif", iconita: "archive" },
      { pozitie: "jos-dreapta", eticheta: "dialog", iconita: "message-square-text" },
    ],
    centru: {
      // Rol: eticheta accesibila a butonului central (lanseaza macheta, felia `erou`).
      eticheta: "Porniți demonstrația 3S",
      // Rol: pastila de sub sigla din centru (13/600 `albastru`). Lungime: 17 [fisa].
      pastila: "Vedeți demonstrația",
    },
    // Rol: legenda dintre cele doua coloane desenate (14/500). Lungime: 65, 11 cuvinte [fisa].
    legenda: "Hârtia intră pe o parte, răspunsul cu pagina citată iese pe cealaltă.",
  },
};

// ---------------------------------------------------------------------------------------------
// 3. Banda de integrari (acasa.md §3, acasa-erou.md §2): fraza + 3 grupe de sigle gri. Grupele
//    si numele sunt integrarile declarate de owner (plan D4c: aceleasi ca pe referinta, plus
//    WhatsApp). Siglele sunt ale tertilor, monocrome, dupa regulile de marca ale fiecaruia.
// ---------------------------------------------------------------------------------------------

export type ElementIntegrare = {
  /** Numele produsului tertului, scris cum il scrie producatorul. */
  nume: string;
  /** Cheia siglei monocrome, pentru `fundatie`. */
  sigla: string;
};

export type GrupIntegrari = {
  /** Eticheta grupei (11,52/700, majuscule prin CSS). */
  eticheta: string;
  elemente: ElementIntegrare[];
  /** Nota de sub grupa a treia (12/500). */
  nota: string | null;
};

export const INTEGRARI: { fraza: string; grupuri: GrupIntegrari[] } = {
  // Rol: produsul nu inlocuieste uneltele firmei, lucreaza langa ele. Lungime: 91, 13 cuvinte [fisa].
  fraza: "Păstrați-vă programele de lucru. Actele din ele ajung, toate, în aceeași arhivă 3S.",
  grupuri: [
    {
      // Rol: uneltele de birou ale clientului. Lungime: 18 [fisa].
      eticheta: "Uneltele de birou",
      elemente: [
        { nume: "Google Workspace", sigla: "google-workspace" },
        { nume: "Microsoft 365", sigla: "microsoft-365" },
        { nume: "Gmail", sigla: "gmail" },
        { nume: "Outlook", sigla: "outlook" },
        // Adaugat fata de referinta: canalul WhatsApp (plan D4c).
        { nume: "WhatsApp", sigla: "whatsapp" },
      ],
      nota: null,
    },
    {
      // Rol: sistemele de afaceri. Lungime: 18 [fisa]. La 3S: ERP-ul si reteaua de facturare.
      eticheta: "Facturare și ERP",
      elemente: [
        { nume: "SAP Business One", sigla: "sap" },
        { nume: "Peppol", sigla: "peppol" },
        { nume: "Storecove", sigla: "storecove" },
      ],
      nota: null,
    },
    {
      // Rol: asistentii AI la care se leaga produsul. Lungime: 11 [fisa].
      eticheta: "Asistenți AI",
      elemente: [
        { nume: "Claude", sigla: "claude" },
        { nume: "ChatGPT", sigla: "chatgpt" },
      ],
      // Rol: produsul se leaga de contul asistentului. Lungime: 32 [fisa].
      nota: "Întrebați arhiva direct din asistent",
    },
  ],
};

// ---------------------------------------------------------------------------------------------
// 4. Constructorul pe industrii (acasa-constructor.md §2, §16): capul si poarta (ciotul din
//    `fundatie`) si contractul parametrilor spre `/inregistrare`. Lumea, scenele, chestionarul si
//    duelul sunt ale feliei `constructor`.
// ---------------------------------------------------------------------------------------------

/** Codurile industriilor, in ordinea grilei (3 x 3, citita pe randuri). */
export const CODURI_INDUSTRIE = [
  "constructii",
  "contabilitate",
  "logistica",
  "it",
  "avocatura",
  "imobiliare",
  "asigurari",
  "notariat",
  "consultanta",
] as const;
export type CodIndustrie = (typeof CODURI_INDUSTRIE)[number];

/** Canalele pe care sosesc documentele (intrebarea 1, alegere multipla, cel putin unul). */
export const CODURI_CANAL = ["email", "mesaj", "hartie"] as const;
export type CodCanal = (typeof CODURI_CANAL)[number];

/** Volumul pe zi (intrebarea 2): pana la 10, intre 10 si 50, peste 50. */
export const CODURI_VOLUM = ["v10", "v50", "v99"] as const;
export type CodVolum = (typeof CODURI_VOLUM)[number];

/** Cine sorteaza azi documentele (intrebarea 3). */
export const CODURI_CINE = ["eu", "coleg", "nimeni"] as const;
export type CodCine = (typeof CODURI_CINE)[number];

/** Numele parametrilor din adresa, exact cum apar dupa `?` (acasa-constructor.md §16). */
export const PARAMETRI_INREGISTRARE = {
  industrie: "ind",
  canale: "src",
  volum: "vol",
  cine: "who",
} as const;

/**
 * Ce trimite CTA-ul final al constructorului la `/inregistrare`.
 * Forma in adresa: `/inregistrare?ind=<cod>&src=<cod,cod>&vol=<cod>&who=<cod>`; canalele se
 * scriu despartite prin virgula, fara dubluri, in ordinea din `CODURI_CANAL`.
 */
export type ParametriInregistrare = {
  ind: CodIndustrie;
  src: CodCanal[];
  vol: CodVolum;
  who: CodCine;
};

function esteCod<T extends string>(coduri: readonly T[], valoare: string): valoare is T {
  return (coduri as readonly string[]).includes(valoare);
}

/**
 * Adresa CTA-ului final al constructorului. Codurile sunt numai `[a-z0-9]`, deci nu cer codare;
 * virgula dintre canale ramane literala, ca in contract. Un set gol de canale (interfata nu il
 * permite) omite parametrul `src` in loc sa trimita o valoare goala.
 */
export function adresaInregistrare(p: ParametriInregistrare): string {
  const canale = CODURI_CANAL.filter((c) => p.src.includes(c));
  const perechi = [PARAMETRI_INREGISTRARE.industrie + "=" + p.ind];
  if (canale.length > 0) {
    perechi.push(PARAMETRI_INREGISTRARE.canale + "=" + canale.join(","));
  }
  perechi.push(PARAMETRI_INREGISTRARE.volum + "=" + p.vol);
  perechi.push(PARAMETRI_INREGISTRARE.cine + "=" + p.who);
  return CALE_INREGISTRARE + "?" + perechi.join("&");
}

/** Parametrii cititi dintr-o adresa: `URLSearchParams` sau `searchParams` dintr-o pagina Next.js. */
export type SursaParametri =
  | URLSearchParams
  | Readonly<Record<string, string | string[] | undefined>>;

/**
 * Citeste parametrii constructorului, tolerant: un parametru lipsa sau cu un cod necunoscut
 * lipseste din rezultat, nu rupe pagina. Canalele necunoscute se ignora, dublurile se scot,
 * ordinea devine cea din `CODURI_CANAL`.
 */
export function citesteParametriInregistrare(sursa: SursaParametri): Partial<ParametriInregistrare> {
  const ia = (nume: string): string | undefined => {
    if (sursa instanceof URLSearchParams) {
      return sursa.get(nume) ?? undefined;
    }
    const valoare = sursa[nume];
    return Array.isArray(valoare) ? valoare[0] : valoare;
  };
  const rezultat: Partial<ParametriInregistrare> = {};
  const ind = ia(PARAMETRI_INREGISTRARE.industrie);
  if (ind !== undefined && esteCod(CODURI_INDUSTRIE, ind)) {
    rezultat.ind = ind;
  }
  const src = ia(PARAMETRI_INREGISTRARE.canale);
  if (src !== undefined) {
    const cerute = src.split(",").map((s) => s.trim());
    const canale = CODURI_CANAL.filter((c) => cerute.includes(c));
    if (canale.length > 0) {
      rezultat.src = canale;
    }
  }
  const vol = ia(PARAMETRI_INREGISTRARE.volum);
  if (vol !== undefined && esteCod(CODURI_VOLUM, vol)) {
    rezultat.vol = vol;
  }
  const who = ia(PARAMETRI_INREGISTRARE.cine);
  if (who !== undefined && esteCod(CODURI_CINE, who)) {
    rezultat.who = who;
  }
  return rezultat;
}

// Etichete scurte ale codurilor, pentru a rezuma raspunsurile (de pilda pe `/inregistrare`).
// Intrebarile si optiunile din chestionar, cu descrierile lor, sunt textele feliei `constructor`.
export const ETICHETE_CANAL: Record<CodCanal, string> = {
  email: "e-mailul firmei",
  mesaj: "WhatsApp și alte mesaje",
  hartie: "originale pe hârtie",
};

export const ETICHETE_VOLUM: Record<CodVolum, string> = {
  v10: "cel mult 10 acte pe zi",
  v50: "între 10 și 50 de acte pe zi",
  v99: "peste 50 de acte pe zi",
};

export const ETICHETE_CINE: Record<CodCine, string> = {
  eu: "chiar eu",
  coleg: "cineva din echipă",
  nimeni: "nu le sortează nimeni",
};

export type IndustrieConstructor = {
  cod: CodIndustrie;
  /** Numele de pe butonul-industrie (14,4/600). */
  nume: string;
  /** Iconita de 15 px, contur 1,3. */
  iconita: NumeIconita;
};

export type CapConstructor = {
  titlu: string;
  subtitlu: string;
  intrebare: string;
  industrii: IndustrieConstructor[];
};

export const CONSTRUCTOR: CapConstructor = {
  // Rol: cum ar arata firma vizitatorului in produs (h2 40/600, un rand). Lungime: 34 [numarat].
  titlu: "Arhiva unei firme ca a dumneavoastră",
  // Rol: o singura intrebare si spatiul de lucru se construieste singur. Lungime: 94 [numarat].
  subtitlu:
    "Un clic pe domeniul firmei și 3S vă arată dosarele și regulile pe care le-ar avea arhiva ei.",
  // Rol: intrebarea de deasupra grilei (16/600). Lungime: 24 [numarat].
  intrebare: "În ce domeniu lucrați?",
  // Ordinea si iconitele, ca in acasa-constructor.md §2.1. Lungimi la referinta: 11, 13, 9, 8, 9,
  // 10, 9, 8, 11 [numarat].
  industrii: [
    { cod: "constructii", nume: "Construcții", iconita: "building-2" },
    { cod: "contabilitate", nume: "Contabilitate", iconita: "calculator" },
    { cod: "logistica", nume: "Logistică", iconita: "truck" },
    { cod: "it", nume: "IT și web", iconita: "code-xml" },
    { cod: "avocatura", nume: "Avocatură", iconita: "scale" },
    { cod: "imobiliare", nume: "Imobiliare", iconita: "house" },
    { cod: "asigurari", nume: "Asigurări", iconita: "shield-check" },
    { cod: "notariat", nume: "Notariat", iconita: "file-badge" },
    { cod: "consultanta", nume: "Consultanță", iconita: "chart-column" },
  ],
};

// ---------------------------------------------------------------------------------------------
// 5. Functionalitatile (acasa-functionalitati.md §2, §3, §10): capul sectiunii, cei 3 pasi si
//    blocul final. Ciotul din `fundatie` arata pasii unul sub altul; machetele, cardul lipit si
//    panza 3D sunt ale feliei `functionalitati-acasa`.
// ---------------------------------------------------------------------------------------------

export type PasFunctionalitate = {
  /** Numarul pasului, cifre tabulare. */
  numar: "01" | "02" | "03";
  eticheta: string;
  titlu: string;
  paragraf: string;
};

export type SectiuneFunctionalitati = {
  titlu: string;
  subtitlu: string;
  pasi: PasFunctionalitate[];
  final: { fraza: string; buton: Legatura };
};

export const FUNCTIONALITATI: SectiuneFunctionalitati = {
  // Rol: stocarea obisnuita face dezordine, produsul o rezolva (h2, doua propozitii scurte, fara
  // accent). Lungime: 49 [fisa].
  titlu: "Un drive ține fișiere. Arhiva 3S le și citește.",
  // Rol: stocarea obisnuita e facuta pentru fisiere, nu pentru actele firmei; de aici unelte in
  // plus; produsul le inlocuieste. Lungime: 180, 25 de cuvinte [fisa].
  subtitlu:
    "Folderele păstrează ce puneți în ele și nimic mai mult. Ca să găsiți un act la timp, cineva trebuie să-l citească și să-i țină evidența. În 3S, treaba asta o face arhiva.",
  // In paragrafele pasilor, comparatia cu un drive spune doar ce e adevarat despre orice drive si
  // nu generalizeaza obiceiurile firmelor (fara "de obicei" nesustinut de o sursa). Unele drive-uri
  // cauta si in textul scanarilor, deci nu se scrie ca un drive cauta doar dupa numele fisierului.
  pasi: [
    {
      numar: "01",
      // Rol: beneficiul, 2-5 cuvinte (13,12/600). Lungime: 24 [numarat]; 21-26 [fisa].
      eticheta: "Clasare fără muncă de mână",
      // Rol: dosarele unui drive fata de un sistem care isi stie continutul. Lungime: 80 [numarat].
      titlu: "Fiecare act nou e citit și așezat singur în dosarul potrivit, cu eticheta lui.",
      // Rol: stocarea obisnuita n-are etichete, tipuri, termene, cautare AI; produsul le face
      // singur, intr-un loc. Lungime: 254 [numarat]; 225-254 [fisa].
      paragraf:
        "Într-un drive, un contract scanat rămâne în folderul ales, cu numele dat la salvare. La noi, textul din scanări se citește, iar actul primește tipul și etichetele potrivite. Căutați apoi după ce scrie în act, de pildă suma sau numele clientului.",
    },
    {
      numar: "02",
      // Rol: partajarea fara batai de cap. Lungime: 26 [numarat].
      eticheta: "Acces pe categorii de acte",
      // Rol: gata cu legaturile trimise si cu drepturile date de mana. Lungime: 62 [numarat].
      // Scris din portalul 3S (plan D4b), fara perechea de actori a referintei.
      titlu: "O factură pusă în portal nu mai trebuie trimisă nimănui.",
      // Rol: pe un drive dai acces om cu om; produsul are portal pe categorii, fara e-mailuri.
      // Lungime: 240 [numarat].
      paragraf:
        "Pe un drive, fiecare om primește acces separat, altfel actele pleacă pe e-mail, ca atașamente. În 3S deschideți o categorie o singură dată, iar documentele noi din ea apar singure în portal, la cei cărora le-ați dat acces.",
    },
    {
      numar: "03",
      // Rol: conformitatea care se face singura. Lungime: 21 [numarat].
      eticheta: "Evidența se ține singură",
      // Rol: stocarea obisnuita nu tine evidenta arhivei si nu stie legea. Lungime: 60 [numarat].
      titlu: "Pentru fiecare act se știe cât se păstrează și până când.",
      // Rol: nicio stocare obisnuita nu tine evidenta, termenele si actele cerute; produsul da,
      // de la inceput. Lungime: 225 [numarat].
      paragraf:
        "Un drive nu cunoaște legea arhivelor, așa că registrul și termenele de păstrare rămân în grija cuiva din firmă. 3S trece fiecare document în registru, îi calculează termenul după categorie și vă arată din timp ce poate fi scos din arhivă.",
    },
  ],
  final: {
    // Rol: poate un drive ajunge; comparatia arata cand da si cand nu (16/400 `ardezie-5`, un
    // rand). Lungime: 59 [fisa].
    fraza: "Pentru câteva zeci de acte, un drive poate fi destul.",
    // Rol: spre comparatia completa (buton contur albastru). Lungime: 26 [numarat].
    buton: { text: "Comparați 3S cu un drive", href: "/comparatie-drive", ruta: "/comparatie-drive" },
  },
};

// ---------------------------------------------------------------------------------------------
// 6. Banda de cifre (acasa.md §6): trei perechi "cifra + eticheta", statice. Plan D5 si §6.3:
//    fapte 3S atribuite, nicio cifra de tractiune.
// ---------------------------------------------------------------------------------------------

export type PerecheCifra = {
  /** Partea evidentiata (16/600 `ardezie-9`, cifre tabulare). */
  cifra: string;
  /** Continuarea (16/500 `ardezie-5`); perechea se citeste ca o singura fraza. */
  eticheta: string;
};

// Lungimile de mai jos sunt ale PERECHII intregi (cifra, un spatiu, eticheta).
export const CIFRE: PerecheCifra[] = [
  // Rol: la referinta, cati clienti. Aici vechimea, atribuita firmei-mame. Pereche: 34 [numarat].
  { cifra: "Din 2019", eticheta: "ADRIA arhivează documente" },
  // Rol: la referinta, un procent de clasificare automata. Aici criptarea la stocare (plan D4c).
  // Pereche: 40 [numarat].
  { cifra: "AES-256", eticheta: "pe disc, iar transferul prin TLS 1.2+" },
  // Rol: la referinta, regiunile de pastrare. Aici una singura, in Germania (plan D4c: nu se
  // scrie "doua regiuni"). Pereche: 36 [numarat].
  { cifra: "1 regiune UE", eticheta: "la Amazon, în Germania" },
];

// ---------------------------------------------------------------------------------------------
// 7. Industriile (acasa.md §7): h2 + 7 carduri spre paginile de sector + cardul "toate".
// ---------------------------------------------------------------------------------------------

export type CardIndustrie = Legatura & {
  /** Descrierea (12,48/400 `ardezie-5`); nu se arata sub 640 px. `text` e numele (14/600). */
  descriere: string;
  iconita: NumeIconita;
};

export type SectiuneIndustrii = {
  titlu: string;
  carduri: CardIndustrie[];
  toate: Legatura;
};

export const INDUSTRII: SectiuneIndustrii = {
  // Rol: fiecare industrie are actele ei si produsul le stie (h2 27,2/600, un rand). Lungime:
  // 58 [numarat]. La 3S scris din faptul marcii (raspunsul cu pagina citata), nu din fraza rolului.
  titlu: "De la planșe la CMR-uri, fiecare răspuns vine cu pagina citată.",
  // Ordinea si tintele din acasa.md §7. Numele 28-41 si descrierile 51-112 de caractere, pe
  // carduri [numarat]. Pe card, in ordine, la referinta: 31/112, 29/51, 41/93, 28/67, 29/73,
  // 33/71, 34/61.
  carduri: [
    {
      text: "Constructori și proiectanți",
      descriere:
        "Planșele și situațiile de lucrări ale fiecărui șantier stau în dosarul proiectului, gata de căutat.",
      href: "/solutii/constructii",
      ruta: "/solutii/constructii",
      iconita: "building-2",
    },
    {
      text: "Contabili și experți fiscali",
      descriere: "Facturile și extrasele fiecărui client, adunate pe luni.",
      href: "/solutii/contabilitate",
      ruta: "/solutii/contabilitate",
      iconita: "calculator",
    },
    {
      text: "Agenții imobiliare și administratori de clădiri",
      descriere:
        "Scrieți adresa unei clădiri și primiți contractele de închiriere și actele ei de proprietate.",
      href: "/solutii/imobiliare",
      ruta: "/solutii/imobiliare",
      iconita: "building",
    },
    {
      text: "Avocați și case de avocatură",
      descriere: "Dosarele cauzelor, cu termenele procedurale și actele primite cu dată certă.",
      href: "/solutii/avocatura",
      ruta: "/solutii/avocatura",
      iconita: "scale",
    },
    {
      text: "Transportatori și expeditori",
      descriere: "CMR-urile semnate și dovezile de livrare, găsite după cursă sau după client.",
      href: "/solutii/logistica",
      ruta: "/solutii/logistica",
      iconita: "truck",
    },
    {
      text: "Notari publici și arhivele lor",
      descriere: "Originalele rămân ale biroului, iar răspunsurile vin din copia scanată.",
      href: "/solutii/notariate",
      ruta: "/solutii/notariate",
      iconita: "stamp",
    },
    {
      text: "Asigurări și lichidarea daunelor",
      descriere: "Actele lipsă dintr-un dosar de daună, semnalate înainte de termen.",
      href: "/solutii/asigurari",
      ruta: "/solutii/asigurari",
      iconita: "shield-check",
    },
  ],
  // Rol: cardul al optulea, pe `ceata-albastra`, spre hub. Lungime: 15 [numarat].
  toate: { text: "Lista completă", href: "/solutii", ruta: "/solutii" },
};

// ---------------------------------------------------------------------------------------------
// 8. Testimonialul (acasa.md §8): se pastreaza FORMA (cardul inchis, fraza mare, continuarea,
//    atribuirea cu bara). Plan §6.3: o afirmatie atribuita firmei-mame, fara persoana si fara
//    citat pana la acordul scris al administratorului ADRIA.
// ---------------------------------------------------------------------------------------------

export type Testimonial = {
  /**
   * `false` cat timp nu exista acord scris pentru un citat: ghilimeaua decorativa nu se randeaza,
   * ca fraza sa nu para spusa de cineva.
   */
  esteCitat: boolean;
  fraza: string;
  continuare: string;
  atribuire: { rol: string; firma: string };
};

export const TESTIMONIAL: Testimonial = {
  esteCitat: false,
  // Rol: fraza mare (24/600, doua randuri). Lungime: 65 [numarat].
  fraza: "Hârtia rămâne la ADRIA, firma-mamă. La dumneavoastră ajunge răspunsul.",
  // Rol: continuarea (16/400, alb 72%, trei randuri). Lungime: 198 [numarat].
  continuare:
    "Originalele predate spre arhivare se preiau pe bază de proces-verbal și stau în depozitul ADRIA până le cereți înapoi. Copiile scanate intră în 3S, iar orice răspuns din arhivă vă arată pagina din care vine.",
  atribuire: {
    // Rol: la referinta, functia persoanei. Aici relatia cu marca, fara persoana. Lungime: 22 [numarat].
    rol: "Firma-mamă a mărcii 3S",
    // Rol: firma si marimea ei. Aici numele din sigla si ce face; fara denumirea juridica si
    // fara sediu (plan §7: pe site apare doar brandul). Lungime: 38 [numarat].
    firma: "ADRIA, arhivare fizică și digitală",
  },
};

// ---------------------------------------------------------------------------------------------
// 9-10. Cardurile de securitate si enterprise (acasa.md §9-§10). Cardul enterprise duce, ca pe
//       referinta, la `/securitate` (plan §6.5).
// ---------------------------------------------------------------------------------------------

export type CardSecuritate = {
  titlu: string;
  text: string;
  legatura: Legatura;
};

export type CardEnterprise = {
  titlu: string;
  /** Pastila violet de langa titlu (12/500). */
  pastila: string;
  descriere: string;
  /** Tot cardul e legatura; `text` e numele ei accesibil (vizibile sunt titlul si chevronul). */
  tinta: Legatura;
};

export const CARD_SECURITATE: CardSecuritate = {
  // Rol: grija legata de securitatea documentelor (16/600). Lungime: 42 [numarat].
  titlu: "Cât de bine sunt păzite actele firmei?",
  // Rol: criptare, regiuni UE, acces controlat pe document (14/400, doua randuri). Lungime: 145
  // [numarat].
  // Accesul e spus ca mecanism al aplicatiei (acasa-acces-pe-persoana-si-dosar), nu ca promisiune
  // ca nimeni altcineva nu deschide dosarele: vezi raspunsul 2 de la intrebari.
  text: "Găzduirea e la Amazon, în Germania, cu fișierele criptate AES-256 și transferul prin TLS 1.2+. În aplicație, accesul la fiecare dosar îl dați dumneavoastră.",
  // Rol: spre comparatia modurilor de stocare (legatura-sageata). Lungime: 42 [numarat].
  legatura: {
    text: "Vedeți unde pot sta documentele firmei",
    href: "/comparatie-stocare",
    ruta: "/comparatie-stocare",
  },
};

export const CARD_ENTERPRISE: CardEnterprise = {
  // Rol: cautati o solutie pentru infrastructura proprie? Lungime: 29 [numarat].
  titlu: "Aveți deja stocare proprie?",
  // Rol: pastila nivelului. Lungime: 11 [numarat].
  pastila: "Enterprise",
  // Rol: produsul se leaga de stocarea clientului ca strat de ordine, AI si automatizari;
  // fisierele raman la client (plan D4b). Lungime: 176 [numarat].
  descriere:
    "Dacă firma își ține fișierele pe servere proprii sau într-un cont de stocare în cloud, ele pot rămâne acolo. 3S lucrează direct pe ele: căutare cu sursa citată și reguli automate.",
  tinta: {
    text: "Securitate pentru firmele cu stocare proprie",
    href: "/securitate",
    ruta: "/securitate",
  },
};

// ---------------------------------------------------------------------------------------------
// 11. Banda de pret (acasa.md §11), ancora `#preturi`: plan D3, 0 RON astazi.
// ---------------------------------------------------------------------------------------------

export type BandaPret = {
  titlu: string;
  fraza: string;
  legatura: Legatura;
};

export const BANDA_PRET: BandaPret = {
  // Rol: preturi publice (h2 20/600, centrat). Lungime: 26 [numarat].
  titlu: "Prețul 3S, spus pe față",
  // Rol: cum se plateste si de la cat pornesti (16/400, un rand la 1440). Lungime: 85 [numarat].
  fraza: "Astăzi, toate pachetele costă 0 RON. Alegeți-l pe cel potrivit din pagina de prețuri.",
  // Rol: spre pachete si preturi (legatura-sageata). Lungime: 29 [numarat].
  legatura: { text: "Ce include fiecare pachet", href: "/preturi", ruta: "/preturi" },
};

// ---------------------------------------------------------------------------------------------
// 12. Intrebarile frecvente (acasa.md §12), ancora `#intrebari`: 4 intrebari, prima deschisa.
// ---------------------------------------------------------------------------------------------

export type IntrebareFrecventa = {
  intrebare: string;
  raspuns: string;
};

export type SectiuneIntrebari = {
  titlu: string;
  intrebari: IntrebareFrecventa[];
  /** Fraza de sub card: `inainte` + adresa de posta ca legatura. */
  subsol: { inainte: string; posta: Legatura };
};

// Posta marcii, din `config/brand.json`. Fara adresa confirmata (azi): destinatie NEDECISA, iar
// fraza de sub intrebari se schimba intr-una care nu promite niciun canal (plan S4 §7).
const POSTA_ACASA = postaMarcii();

export const INTREBARI: SectiuneIntrebari = {
  // Rol: titlul sectiunii (h2 40/600). Lungime: 19 [numarat].
  titlu: "Ce trebuie să știți",
  // Intrebarile sunt cu vocea clientului (persoana intai), raspunsurile i se adreseaza lui.
  intrebari: [
    {
      // Rol: unde stau documentele. Lungime: 35 [numarat].
      intrebare: "În ce țară stau fișierele mele?",
      // Rol: furnizorul si locul, criptarea automata (4 randuri la 1440). Lungime: 357 [numarat].
      // Pe faptele din plan D4c: o singura regiune, in Germania.
      raspuns:
        "În Germania, pe serverele Amazon, într-o singură regiune a Uniunii Europene. Pe disc, fișierele sunt criptate AES-256, iar între calculatorul dumneavoastră și server circulă prin conexiuni TLS 1.2 sau mai noi. Dacă ne predați și originalele pe hârtie, acestea rămân în depozitul ADRIA, firma-mamă a mărcii 3S.",
    },
    {
      // Rol: intrebarea despre cine altcineva ajunge la documente. Lungime: 48 [numarat].
      intrebare: "Cine mai poate deschide documentele mele?",
      // Rol: accesul trece numai prin regulile clientului (5 randuri la 1440). Lungime: 535
      // [numarat]. La 3S raspunsul e scris din mecanica marcii: arhive separate pe firma, acces
      // nominal pe dosar, portalul pe categorii, originalele cerute numai de persoanele de pe lista
      // clientului, jurnalul. Angajamentele despre accesul echipei 3S si despre antrenarea
      // modelelor NU se scriu pana nu le confirma owner-ul in scris; criptarea sta in raspunsul 1.
      // Prima propozitie spune cine da accesul IN APLICATIE (acasa-acces-pe-persoana-si-dosar) si
      // nu promite ca nimeni altcineva nu vede actele: scanarea si depozitul ADRIA inseamna oameni
      // care le deschid (raspunsul 4, testimonialul).
      raspuns:
        "Accesul în aplicație îl hotărâți dumneavoastră. Arhiva fiecărei firme stă separat, pe raft și în format digital, iar căutarea nu trece în arhiva altei firme. În firmă, accesul se dă nominal și pe dosar: colegul de la achiziții nu vede contractele de muncă dacă nu i le deschideți. Clienții intră prin portal și găsesc acolo numai categoriile lor. Un original din depozitul ADRIA îl poate cere doar cine e trecut în scris pe lista dumneavoastră. Orice căutare și orice document deschis se trec în jurnal, cu nume și oră, iar jurnalul vă stă la dispoziție.",
    },
    {
      // Rol: ce face AI-ul in produs. Lungime: 43 [numarat].
      intrebare: "Cum găsește AI-ul actul de care am nevoie?",
      // Rol: indexeaza fiecare document si raspunde la cereri in limbaj firesc, cu un exemplu
      // (3 randuri la 1440). Lungime: 323 [numarat].
      raspuns:
        "La fiecare act încărcat, AI-ul scoate textul, chiar și dintr-o poză sau dintr-o scanare veche, și îl pune în index. Întrebați apoi în română, cum ați întreba un coleg: ce termen de plată are contractul cu firma X? Răspunsul vine cu documentul și cu pagina din care e luat, ca să-l verificați pe loc.",
    },
    {
      // Rol: e usor de folosit. Lungime: 60 [numarat]. La 3S o singura intrebare, pusa din
      // faptul marcii (raspunsul cu pagina citata), fara cadrul "nu ma pricep"; pretul sta in
      // raspuns (plan D3: 0 RON astazi).
      intrebare: "Ce am de făcut ca să primesc primul răspuns din arhivă?",
      // Rol: raspuns scurt, apoi cum se lucreaza in cativa pasi simpli (3 randuri la 1440).
      // Lungime: 247 [numarat].
      raspuns:
        "Întâi actele: fișierele le încărcați din browser, iar dosarele de hârtie ni le predați la scanat. Apoi scrieți întrebarea pe web sau pe WhatsApp și primiți răspunsul cu pagina citată. Contul se deschide fără card, iar astăzi toate pachetele costă 0 RON.",
    },
  ],
  // Rol: n-ati gasit raspunsul, scrieti-ne (14/400). Lungime: 54 cu adresa [numarat]; partea de
  // dinaintea adresei are 34 la referinta. Adresa vine din `config/brand.json`; cat timp nu exista
  // una confirmata, randul inchide lista fara adresa si fara sa trimita spre un canal (52).
  subsol:
    POSTA_ACASA.href === null
      ? { inainte: "Răspunsurile descriu 3S așa cum funcționează astăzi.", posta: POSTA_ACASA }
      : { inainte: "Orice altă întrebare o primim la", posta: POSTA_ACASA },
};

// ---------------------------------------------------------------------------------------------
// 13. CTA-ul final inchis (acasa.md §13), ancora `#contact`. Vizualul din dreapta are date
//     fictive, declarate ca exemplu (plan D9). Randul de credit al referintei nu se reproduce.
// ---------------------------------------------------------------------------------------------

export type PasCta = {
  iconita: NumeIconita;
  text: string;
  /** Ora, in JetBrains Mono (10,4/400). */
  ora: string;
};

export type CtaFinal = {
  titlu: string;
  subtitlu: string;
  butonPrincipal: Legatura;
  butonSecundar: Legatura;
  microtext: string;
  vizual: {
    /** Eticheta accesibila care declara datele fictive (plan D9). */
    declaratie: string;
    pasi: PasCta[];
    rezultat: { fisier: string; stare: string; ora: string };
  };
};

export const CTA_FINAL: CtaFinal = {
  // Rol: documentele "prind viata" si circula singure (h2 32/600 alb, doua randuri). Lungime:
  // 49 [numarat].
  titlu: "Faceți din dulapul cu dosare o arhivă care răspunde.",
  // Rol: un flux automat de documente, disponibil oricand (18/400, doua randuri). Lungime: 99
  // [numarat].
  subtitlu:
    "După ce actele ajung în arhivă, scanate de noi sau încărcate de dumneavoastră, puteți întreba arhiva orice.",
  // Rol: incercarea gratuita (buton alb). Lungime: 25 [numarat].
  butonPrincipal: {
    text: "Deschideți arhiva firmei",
    href: CALE_INREGISTRARE,
    ruta: CALE_INREGISTRARE,
  },
  // Rol: invitatia de a vedea produsul in lucru (buton contur pe inchis). Lungime: 21 [numarat].
  // Tinta, ca pe referinta: pagina de pornire (`/incepe`), cu demonstratia declarata (plan §6.9).
  butonSecundar: { text: "Un tur prin aplicație", href: "/incepe", ruta: "/incepe" },
  // Rol: fara obligatii, fara card (12/400, alb 45%). Lungime: 36 [numarat].
  microtext: "Contul se deschide fără card de plată.",
  vizual: {
    declaratie: "Exemplu cu date fictive",
    pasi: [
      // Rol: documentul a sosit pe un canal. Lungime: 18 [numarat].
      { iconita: "message-circle", text: "Poză pe WhatsApp", ora: "09:41" },
      // Rol: documentul a fost clasificat singur. Lungime: 19 [numarat].
      { iconita: "tag", text: "Recunoscut ca aviz", ora: "09:41" },
    ],
    rezultat: {
      // Rol: numele unui fisier fictiv (JetBrains Mono 11,52/500). Lungime: 22 [numarat].
      fisier: "Aviz_expeditie_0415.pdf",
      // Rol: starea finala, dupa punctul verde (10,88/400). Lungime: 27 [numarat].
      stare: "Pus în dosarul Transport",
      ora: "09:42",
    },
  },
};

/**
 * Toate legaturile din corpul paginii de start, pentru probe si pentru filtrarea pe rute
 * (`seVede` din `navigatie.ts`): la S4-1 cele mai multe tinte nu exista inca.
 */
export function toateLegaturileAcasa(): Legatura[] {
  return [
    EROU.pastile.legatura,
    EROU.popover.legatura,
    EROU.butonPrincipal,
    EROU.butonSecundar,
    FUNCTIONALITATI.final.buton,
    ...INDUSTRII.carduri,
    INDUSTRII.toate,
    CARD_SECURITATE.legatura,
    CARD_ENTERPRISE.tinta,
    BANDA_PRET.legatura,
    INTREBARI.subsol.posta,
    CTA_FINAL.butonPrincipal,
    CTA_FINAL.butonSecundar,
  ];
}
