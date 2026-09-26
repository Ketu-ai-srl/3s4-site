// Contractul de navigatie al site-ului (valul S4-1, referinta vizuala REF-N): antetul cu
// meniurile lui, panoul de descarcare, selectorul de limba, paleta de cautare, sertarul
// mobil si subsolul. Doar date si cateva functii pure; nicio componenta.
//
// CINE IL ATINGE
//   - scris de dispecer (pasul P2 din planul valului), inainte de feliile S4-1;
//   - felia `fundatie` il IMPORTA si nu il modifica (Antet, MeniuMare, PanouDescarca,
//     SelectorLimba, PaletaCautare, SertarMobil, Subsol);
//   - felia `text-acasa` il RESCRIE, dar numai VALORILE de text. Tipurile, cheile, tintele
//     (`href`, `ruta`), codurile si numarul de elemente din fiecare lista raman: `fundatie`
//     lucreaza in paralel pe ele, iar numarul de elemente e cel masurat pe referinta. O
//     schimbare de forma se cere dispecerului, nu se face dintr-o felie.
//
// FILTRAREA PE RUTE (planul valului, §5.1 regula 5). Navigatia sta in layout, deci apare pe
// fiecare pagina: o legatura spre o ruta care nu exista inca ar fi moarta peste tot deodata.
// De aceea fiecare `Legatura` poarta, pe langa tinta completa (`href`), si `ruta`: calea din
// `RUTE` de care depinde. Componentele arata numai ce trece de `seVede`. La livrarea
// valului (S4-5), proba de completitudine cere `ascunse(toateLegaturileNavigatiei(), cai)`
// gol: nicio intrare nu mai are voie sa fie filtrata.
//
// TINTELE EXTERNE ALE REFERINTEI (aplicatia web, instalatorii, magazinele, parola uitata) si
// "Autentificare" duc la `/inregistrare` pana cand 3S are adrese publice pentru ele (deciziile
// D4c si §6.6 / §6.9 din plan). Un singur loc le schimba pe toate: `CALE_INREGISTRARE`.
//
// LUNGIMILE din comentarii sunt ale referintei, pe acelasi rol: `[fisa]` = scrisa in fisa de
// masurare (`componente-globale.md`, `descarca.md`); `[numarat]` = numarata de dispecer pe
// textul referintei, pentru lungime si rol, niciodata pentru cuvinte. Textul de aici e cel al
// feliei `text-acasa`, scris pentru 3S, cu adresarea dumneavoastra; fiecare afirmatie
// verificabila are intrare in `src/content/afirmatii/acasa.json`.

import { postaMarcii } from "./entitate";

/** Numele unei iconite din setul Lucide (licenta ISC), in forma kebab-case. Nu desenele referintei. */
export type NumeIconita = string;

/**
 * O legatura de navigatie.
 *
 * `href` = tinta completa, exact cum intra in atribut (cu ancora sau cu `mailto:`).
 * `null` inseamna destinatie NEDECISA: legatura nu se randeaza, iar proba de completitudine
 * o raporteaza pana primeste o decizie.
 *
 * `ruta` = calea din `RUTE` (`src/content/rute.ts`, campul `cale`) de care depinde legatura,
 * fara ancora si fara parametri; pentru un articol de blog, calea lui din registrul blogului.
 * `null` = legatura nu depinde de o pagina a site-ului (posta electronica, cont extern).
 */
export type Legatura = {
  text: string;
  href: string | null;
  ruta: string | null;
};

/**
 * Caile care exista azi: `cale` din `RUTE`, plus caile articolelor din registrul blogului.
 * Se construieste cu `multimeaCailor`.
 */
export type CaiExistente = ReadonlySet<string>;

/**
 * Construieste multimea cailor existente. Primeste lista de rute prin parametru, nu o importa,
 * ca modulul asta sa nu depinda de forma interna a lui `rute.ts` (pe care `fundatie` il rescrie).
 */
export function multimeaCailor(
  rute: ReadonlyArray<{ cale: string }>,
  alteCai: Iterable<string> = [],
): Set<string> {
  const cai = new Set<string>(rute.map((r) => r.cale));
  for (const cale of alteCai) {
    cai.add(cale);
  }
  return cai;
}

/** O legatura se arata cand are destinatie si cand ruta de care depinde exista deja. */
export function seVede(legatura: Legatura, cai: CaiExistente): boolean {
  if (legatura.href === null) {
    return false;
  }
  return legatura.ruta === null || cai.has(legatura.ruta);
}

/** Legaturile din lista care se pot arata azi, in ordinea lor. */
export function vizibile<T extends Legatura>(lista: readonly T[], cai: CaiExistente): T[] {
  return lista.filter((l) => seVede(l, cai));
}

/** Legaturile din lista care NU se pot arata azi (pentru probe si pentru proba de completitudine). */
export function ascunse<T extends Legatura>(lista: readonly T[], cai: CaiExistente): T[] {
  return lista.filter((l) => !seVede(l, cai));
}

/**
 * Formularul care tine loc, azi, pentru toate tintele fara adresa proprie: aplicatia web,
 * autentificarea, instalatorii si magazinele de aplicatii (plan D4c, §6.6, §6.9).
 */
export const CALE_INREGISTRARE = "/inregistrare";

// ---------------------------------------------------------------------------------------------
// Limba (componente-globale.md §3.4): forma identica, o singura optiune azi (plan §6.5).
// ---------------------------------------------------------------------------------------------

export type Limba = Legatura & {
  /** Codul afisat pe buton, in antet si in subsol. */
  cod: string;
  /** Limba paginii curente (bifa si culoarea activa). */
  activa: boolean;
};

export const LIMBI: Limba[] = [
  {
    // Rol: numele limbii in lista (14/500). Lungime: 6 [numarat].
    text: "Română",
    href: "/",
    ruta: "/",
    // Rol: codul de pe buton. Lungime: 2 [fisa].
    cod: "RO",
    activa: true,
  },
];

export const SELECTOR_LIMBA = {
  // Rol: eticheta accesibila a butonului de limba (nevizibila).
  eticheta: "Limba site-ului",
};

// ---------------------------------------------------------------------------------------------
// Meniurile derulante (componente-globale.md §3.2): o foaie Functionalitati (lider + 4) si o
// foaie Solutii (7), fiecare cu o legatura in subsolul foii.
// ---------------------------------------------------------------------------------------------

export type ElementMeniu = Legatura & {
  /** Descrierea de sub titlu (12/400, `cerneala-2`). */
  descriere: string;
  iconita: NumeIconita;
  /** Marcajul "AI" de dupa titlu (10,4/600 `albastru`); il au 2 din cele 4 elemente. */
  marcajAi: boolean;
};

export type FoaieMeniu = {
  /** Eticheta accesibila a panoului. */
  eticheta: string;
  /** Elementul-lider pe toata latimea; exista numai pe foaia Functionalitati. */
  lider: ElementMeniu | null;
  elemente: ElementMeniu[];
  /** Legatura din subsolul foii; in sertarul mobil e ultimul rand al grupului ("vezi tot"). */
  subsol: Legatura;
};

export const FOAIE_FUNCTIONALITATI: FoaieMeniu = {
  eticheta: "Funcționalitățile 3S",
  lider: {
    // Rol: fluxul intreg al documentelor firmei. Lungime: 18 [numarat].
    text: "Fluxul documentelor",
    // Rol: tot ce intra in firma trece pe acelasi drum si ajunge singur unde trebuie. Lungime: 79 [numarat].
    descriere: "Un act nou pleacă singur spre omul care trebuie să-l aprobe sau să-l plătească.",
    href: "/flux-documente",
    ruta: "/flux-documente",
    iconita: "workflow",
    marcajAi: false,
  },
  elemente: [
    {
      // Rol: cautarea dupa continut. Lungime: 25 [numarat].
      text: "Căutare cu sursa citată",
      // Rol: cautati dupa sens, nu prin dosare; primiti actul. Lungime: 118 [numarat].
      descriere:
        "Întrebați arhiva cu vorbele dumneavoastră și primiți actul căutat, deschis la pagina din care vine răspunsul.",
      href: "/functionalitati/cautare-ai",
      ruta: "/functionalitati/cautare-ai",
      iconita: "search",
      marcajAi: true,
    },
    {
      // Rol: regulile care lucreaza singure. Lungime: 15 [numarat].
      text: "Reguli automate",
      // Rol: notificari, sortare si aprobari fara munca de mana. Lungime: 125 [numarat].
      descriere:
        "O factură nouă ajunge singură în dosarul ei și îl anunță pe contabil, după regulile pe care le stabiliți dumneavoastră.",
      href: "/functionalitati/automatizari-ai",
      ruta: "/functionalitati/automatizari-ai",
      iconita: "zap",
      marcajAi: true,
    },
    {
      // Rol: aplicatia de pe telefon, pentru teren. Lungime: 16 [numarat].
      text: "Arhiva pe telefon",
      // Rol: acte create, scanate si trimise de pe teren, fara drum la birou. Lungime: 112 [numarat].
      descriere:
        "Fotografiați avizul sau contractul pe teren. Aplicația face din fotografie o scanare curată și trimite actul în dosarul lui.",
      href: "/functionalitati/aplicatie-mobila",
      ruta: "/functionalitati/aplicatie-mobila",
      iconita: "smartphone",
      marcajAi: false,
    },
    {
      // Rol: portalul in care clientii isi vad documentele. Lungime: 21 [numarat].
      text: "Clienții își văd actele",
      // Rol: acces pentru clienti si contabil in locul atasamentelor pe e-mail. Lungime: 114 [numarat].
      descriere:
        "Facturile și contractele sunt în portal, iar clientul și le ia singur, fără să vă mai sune pentru ele.",
      href: "/functionalitati/portal-clienti",
      ruta: "/functionalitati/portal-clienti",
      iconita: "users",
      marcajAi: false,
    },
  ],
  subsol: {
    // Rol: spre comparatia cu un drive obisnuit. Lungime: 26 + sageata [numarat].
    text: "Comparați 3S cu un drive",
    href: "/comparatie-drive",
    ruta: "/comparatie-drive",
  },
};

export const FOAIE_SOLUTII: FoaieMeniu = {
  eticheta: "Soluțiile 3S pe domenii",
  lider: null,
  // Ordinea e cea masurata (componente-globale.md §3.2) si e aceeasi in sertarul mobil.
  elemente: [
    {
      // Rol: domeniul. Lungime: 31 [numarat].
      text: "Constructori și proiectanți",
      // Rol: actele tipice imprastiate pe proiecte + un singur loc de cautare. Lungime: 221 [numarat].
      descriere:
        "Pe un șantier, planșele și procesele-verbale se adună lună de lună, până la recepția finală. Le țineți pe proiect și puneți o întrebare când vă trebuie un act: îl primiți deschis direct la pagina potrivită.",
      href: "/solutii/constructii",
      ruta: "/solutii/constructii",
      iconita: "building-2",
      marcajAi: false,
    },
    {
      // Rol: domeniul. Lungime: 29 [numarat].
      text: "Contabili și experți fiscali",
      // Rol: actele vin pe toate canalele; un singur loc pentru toti clientii. Lungime: 122 [numarat].
      descriere:
        "Actele fiecărui client, oricum ar sosi, se adună într-un dosar pe lună. Ce lipsește la închidere vedeți din timp.",
      href: "/solutii/contabilitate",
      ruta: "/solutii/contabilitate",
      iconita: "calculator",
      marcajAi: false,
    },
    {
      // Rol: domeniul. Lungime: 41 [numarat].
      text: "Agenții imobiliare și administratori de clădiri",
      // Rol: contracte si acte pe sisteme diferite; gasite repede. Lungime: 200 [numarat].
      descriere:
        "Țineți portofoliul organizat pe clădiri, de la titlul de proprietate la ultimul contract de închiriere. Vedeți din timp ce contract expiră și ce act mai lipsește înainte de o vânzare.",
      href: "/solutii/imobiliare",
      ruta: "/solutii/imobiliare",
      iconita: "building",
      marcajAi: false,
    },
    {
      // Rol: domeniul. Lungime: 28 [numarat].
      text: "Avocați și case de avocatură",
      // Rol: dosare pe ani de zile, gasite cu confidentialitate. Lungime: 188 [numarat].
      descriere:
        "Dosarul fiecărei cauze adună actele primite cu dată certă și termenele procedurale. Accesul se dă pe dosar, iar orice document deschis se trece în jurnal, cu numele celui care l-a deschis.",
      href: "/solutii/avocatura",
      ruta: "/solutii/avocatura",
      iconita: "scale",
      marcajAi: false,
    },
    {
      // Rol: domeniul. Lungime: 29 [numarat].
      text: "Transportatori și expeditori",
      // Rol: actele de transport, gasite repede, pentru echipe pe drum. Lungime: 117 [numarat].
      descriere:
        "Comenzile și CMR-urile semnate stau legate de cursa lor, ca facturarea să nu mai aștepte după o hârtie.",
      href: "/solutii/logistica",
      ruta: "/solutii/logistica",
      iconita: "truck",
      marcajAi: false,
    },
    {
      // Rol: domeniul. Lungime: 33 [numarat].
      text: "Notari publici și arhivele lor",
      // Rol: registre si acte vechi, regasite dupa mai multe criterii. Lungime: 175 [numarat].
      descriere:
        "Arhiva biroului se preia cu proces-verbal și inventar, apoi se scanează. La o întrebare, primiți actul cu pagina citată, iar originalul pe hârtie vi-l aducem înapoi la cerere.",
      href: "/solutii/notariate",
      ruta: "/solutii/notariate",
      iconita: "stamp",
      marcajAi: false,
    },
    {
      // Rol: domeniul. Lungime: 34 [numarat].
      text: "Asigurări și lichidarea daunelor",
      // Rol: dosare de dauna, polite, arhive vechi; cautare peste ele. Lungime: 182 [numarat].
      // Scris din faptele 3S (acasa-alerte-acte-lipsa-si-expirari, acasa-text-din-scanari), fara
      // nicio generalizare despre piata asigurarilor.
      descriere:
        "În fiecare dosar de daună, 3S vă semnalează din timp actele care mai lipsesc. Polițele le căutați după numele asiguratului sau după dată, inclusiv pe cele vechi, scanate de pe hârtie.",
      href: "/solutii/asigurari",
      ruta: "/solutii/asigurari",
      iconita: "shield-check",
      marcajAi: false,
    },
  ],
  subsol: {
    // Rol: spre toate solutiile. Lungime: 9 + sageata [numarat]; textul referintei, fara
    // sageata, are 7. Valoarea de 8 caractere sta in marja ambelor citiri.
    text: "Sectoare",
    href: "/solutii",
    ruta: "/solutii",
  },
};

// ---------------------------------------------------------------------------------------------
// Panoul Descarca (componente-globale.md §3.3, descarca.md "Meniul Descarca"): 5 grupuri, ca pe
// referinta. Aplicatia exista pe toate platformele (plan D4c), dar nu are inca adrese publice:
// toate elementele duc la `CALE_INREGISTRARE` (plan §6.9).
// ---------------------------------------------------------------------------------------------

/** Platforma, pentru sigla din placa (sigla tertului, din sursa oficiala) si pentru detectie. */
export type PlatformaDescarca =
  | "windows"
  | "macos-arm"
  | "macos-intel"
  | "linux"
  | "ios"
  | "android"
  | "web";

export type ElementDescarca = Legatura & {
  descriere: string;
  platforma: PlatformaDescarca;
};

export type GrupDescarca = {
  /** Titlul grupului (11,2/600, majuscule prin CSS). */
  titlu: string;
  elemente: ElementDescarca[];
};

export const PANOU_DESCARCA: {
  eticheta: string;
  grupuri: GrupDescarca[];
  marcajRecomandat: string;
  nota: string;
  inapoi: string;
} = {
  // Rol: eticheta accesibila a panoului.
  eticheta: "Descărcați aplicația 3S",
  grupuri: [
    {
      // Lungime: 7 [numarat].
      titlu: "Windows",
      elemente: [
        {
          // Rol: varianta pentru Windows. Lungime: 16 [numarat].
          text: "Pentru Windows",
          // Rol: versiunile de sistem si felul pachetului. Lungime: 31 [numarat].
          descriere: "Aplicație de instalat pe PC",
          href: CALE_INREGISTRARE,
          ruta: CALE_INREGISTRARE,
          platforma: "windows",
        },
      ],
    },
    {
      // Lungime: 5 [numarat].
      titlu: "macOS",
      elemente: [
        {
          // Rol: varianta pentru procesoarele ARM (seria M). Lungime: 12 [numarat].
          text: "Mac cu cip M",
          // Rol: ce calculatoare Mac acopera. Lungime: 45 [numarat].
          descriere: "Pentru calculatoarele Mac cu cipuri din seria M",
          href: CALE_INREGISTRARE,
          ruta: CALE_INREGISTRARE,
          platforma: "macos-arm",
        },
        {
          // Rol: varianta pentru procesoarele Intel. Lungime: 14 [numarat].
          text: "Mac cu Intel",
          // Rol: ce calculatoare Mac acopera. Lungime: 30 [numarat].
          descriere: "Modelele Mac cu procesor Intel",
          href: CALE_INREGISTRARE,
          ruta: CALE_INREGISTRARE,
          platforma: "macos-intel",
        },
      ],
    },
    {
      // Lungime: 5 [numarat].
      titlu: "Linux",
      elemente: [
        {
          // Rol: varianta pentru Linux. Lungime: 13 [numarat].
          text: "Pentru Linux",
          // Rol: cum se obtine. Lungime: 49 [numarat]. La 3S: ce dispozitive acopera; nicio
          // promisiune despre felul in care se primeste pachetul.
          descriere: "Stații de lucru și laptopuri cu Linux instalat",
          href: CALE_INREGISTRARE,
          ruta: CALE_INREGISTRARE,
          platforma: "linux",
        },
      ],
    },
    {
      // Lungime: 5 [numarat].
      titlu: "Mobil",
      elemente: [
        {
          // Rol: magazinul de aplicatii pentru iOS (nume de magazin). Lungime: 9 [numarat].
          text: "App Store",
          // Rol: dispozitivele acoperite. Lungime: 12 [numarat].
          descriere: "iOS și iPadOS",
          href: CALE_INREGISTRARE,
          ruta: CALE_INREGISTRARE,
          platforma: "ios",
        },
        {
          // Rol: magazinul Google (nume de magazin). Lungime: 11 [numarat].
          text: "Google Play",
          // Rol: dispozitivele acoperite. Lungime: 26 [numarat].
          descriere: "Dispozitivele cu Android",
          href: CALE_INREGISTRARE,
          ruta: CALE_INREGISTRARE,
          platforma: "android",
        },
      ],
    },
    {
      // Lungime: 3 [numarat].
      titlu: "Web",
      elemente: [
        {
          // Rol: aplicatia in browser. Lungime: 21 [numarat].
          text: "Versiunea din browser",
          // Rol: fara instalare (la referinta cu adresa aplicatiei). Lungime: 31 [numarat].
          descriere: "Se deschide fără nicio instalare",
          href: CALE_INREGISTRARE,
          ruta: CALE_INREGISTRARE,
          platforma: "web",
        },
      ],
    },
  ],
  // Rol: marcajul platformei detectate, dupa titlu (14/700 `albastru`). Lungime: 3 [fisa].
  marcajRecomandat: "(*)",
  // Rol: explica marcajul, in subsolul panoului. Lungime: 46 [numarat].
  nota: "(*) recomandată pentru sistemul dumneavoastră",
  // Rol: butonul "inapoi" din sub-vederea Descarca a sertarului mobil (16/600).
  inapoi: "Înapoi la meniu",
};

// ---------------------------------------------------------------------------------------------
// Antetul (componente-globale.md §2): 5 legaturi, cautare, limba, autentificare, Descarca, CTA.
// ---------------------------------------------------------------------------------------------

export type LegaturaAntet = Legatura & {
  /** Foaia deschisa la hover sau la focus; lipseste pe legaturile simple. */
  foaie: FoaieMeniu | null;
};

export const ANTET: {
  sigla: Legatura;
  legaturi: LegaturaAntet[];
  cautare: { eticheta: string; tasta: string };
  autentificare: Legatura;
  descarca: { text: string };
  cta: Legatura;
  hamburger: { deschide: string; inchide: string };
} = {
  // Rol: eticheta accesibila a siglei 3S (imaginea e activ de produs, nu text).
  sigla: { text: "3S Scan Store Solve, pagina de start", href: "/", ruta: "/" },
  legaturi: [
    // Lungime: 5 [numarat].
    { text: "Acasă", href: "/", ruta: "/", foaie: null },
    // Clicul pe declansator navigheaza la sectiunea de pe start (componente-globale.md §3.1).
    // Lungime: 15 [numarat].
    {
      text: "Funcționalități",
      href: "/#functionalitati",
      ruta: "/",
      foaie: FOAIE_FUNCTIONALITATI,
    },
    // Lungime: 7 [numarat].
    { text: "Soluții", href: "/solutii", ruta: "/solutii", foaie: FOAIE_SOLUTII },
    // Lungime: 7 [numarat].
    { text: "Prețuri", href: "/preturi", ruta: "/preturi", foaie: null },
    // Lungime: 4 [numarat].
    { text: "Blog", href: "/blog", ruta: "/blog", foaie: null },
  ],
  cautare: {
    // Rol: eticheta accesibila a butonului de cautare (vizibil sunt doar lupa si tasta).
    eticheta: "Deschideți căutarea",
    // Rol: tasta afisata in butonul de cautare (JetBrains Mono 9,92). Lungime: 6 [fisa].
    tasta: "Ctrl K",
  },
  // Rol: intrarea in cont. Lungime: 13 [numarat]. Tinta: formularul, pana la adresa aplicatiei (D4c).
  autentificare: { text: "Conectați-vă", href: CALE_INREGISTRARE, ruta: CALE_INREGISTRARE },
  // Rol: butonul care deschide panoul de descarcare (nu navigheaza). Lungime: 8 [numarat].
  descarca: { text: "Aplicația" },
  // Rol: butonul plin din dreapta, incercarea gratuita. Lungime: 16 [numarat].
  cta: { text: "Deschideți un cont", href: CALE_INREGISTRARE, ruta: CALE_INREGISTRARE },
  hamburger: {
    // Rol: etichetele accesibile ale butonului de meniu sub 1200 px.
    deschide: "Deschideți meniul",
    inchide: "Închideți meniul",
  },
};

// ---------------------------------------------------------------------------------------------
// Paleta de cautare (componente-globale.md §4): Pagini (10) si Actiuni (2) fara interogare;
// grupul de articole se adauga la interogare, din registrul blogului.
// ---------------------------------------------------------------------------------------------

export type GrupPaleta = {
  /** Eticheta grupului (10,88/600 `ardezie-4`). */
  titlu: string;
  /** Titlul fiecarui element e `text`; ruta afisata in mono, la dreapta, e `href`. */
  elemente: Legatura[];
};

export const PALETA: {
  eticheta: string;
  campExemplu: string;
  tastaInchidere: string;
  grupuri: GrupPaleta[];
  grupArticole: string;
  faraRezultate: string;
  ajutor: { sageti: string; enter: string; scurtatura: string };
} = {
  // Rol: eticheta accesibila a ferestrei de cautare.
  eticheta: "Căutare pe site",
  // Rol: textul-exemplu din camp. Lungime: 15 [numarat].
  campExemplu: "Scrieți un cuvânt",
  // Rol: tasta de inchidere din dreapta campului. Lungime: 3 [numarat].
  tastaInchidere: "esc",
  grupuri: [
    {
      // Lungime: 6 [numarat].
      titlu: "Pagini",
      elemente: [
        // Lungimile titlurilor la referinta: 5, 7, 10, 11, 18, 9, 9, 8, 4, 7 [numarat].
        { text: "Acasă", href: "/", ruta: "/" },
        { text: "Prețuri", href: "/preturi", ruta: "/preturi" },
        { text: "Securitate", href: "/securitate", ruta: "/securitate" },
        { text: "E-facturare", href: "/e-facturare", ruta: "/e-facturare" },
        { text: "Moduri de stocare", href: "/comparatie-stocare", ruta: "/comparatie-stocare" },
        { text: "Integrări", href: "/integrari", ruta: "/integrari" },
        { text: "Platforma", href: "/platforma", ruta: "/platforma" },
        { text: "Aplicația", href: "/descarca", ruta: "/descarca" },
        { text: "Blog", href: "/blog", ruta: "/blog" },
        { text: "Contact", href: "/contact", ruta: "/contact" },
      ],
    },
    {
      // Lungime: 7 [numarat].
      titlu: "Acțiuni",
      elemente: [
        // Rol: incercarea gratuita. Lungime: 16 [numarat].
        { text: "Deschideți un cont", href: CALE_INREGISTRARE, ruta: CALE_INREGISTRARE },
        // Rol: cererea unei oferte / un mesaj. Lungime: 19 [numarat].
        { text: "Scrieți-ne un mesaj", href: "/contact", ruta: "/contact" },
      ],
    },
  ],
  // Rol: eticheta grupului adaugat la interogare, cu articolele potrivite. Lungime: 4 [numarat].
  grupArticole: "Blog",
  // Rol: randul centrat cand nu se potriveste nimic. Lungime: 15 [numarat].
  faraRezultate: "Nu am găsit nimic",
  ajutor: {
    // Rol: textele accesibile ale tastelor din subsolul paletei (vizibile sunt doar simbolurile).
    sageti: "Săgețile mută selecția",
    enter: "Enter deschide pagina",
    scurtatura: "Ctrl K",
  },
};

// ---------------------------------------------------------------------------------------------
// Sertarul mobil (componente-globale.md §5): foloseste aceleasi date ca antetul. Grupurile sunt
// foile meniului mare (lider + elemente + `subsol` ca ultim rand), limba e `LIMBI`, piciorul
// are `ANTET.autentificare`, butonul Descarca si `ANTET.cta`.
// ---------------------------------------------------------------------------------------------

export const SERTAR = {
  // Rol: eticheta accesibila a sertarului.
  eticheta: "Meniul site-ului",
  // Rol: eticheta accesibila a butonului X din capul sertarului.
  inchide: "Închideți meniul",
};

// ---------------------------------------------------------------------------------------------
// Subsolul (componente-globale.md §6, §6.1): brand, 5 coloane (11 / 5 / 7 / 4 / 8), banda de 5
// insigne (numai fapte adevarate), randul de copyright cu limba si retelele. Randul de credit al
// referintei (dezvoltator + recenzii) nu are echivalent si nu se reproduce.
// ---------------------------------------------------------------------------------------------

export type ColoanaSubsol = {
  /** Titlul coloanei (13/600). */
  titlu: string;
  legaturi: Legatura[];
};

export type InsignaSubsol = {
  text: string;
  iconita: NumeIconita;
};

/** Reteaua, pentru iconita (sigla tertului, din sursa oficiala); `text` e eticheta accesibila. */
export type ReteaSociala = Legatura & {
  retea: "linkedin" | "youtube" | "x" | "email";
};

// Posta marcii, din `config/brand.json`: `mailto:` numai cu o adresa confirmata de owner; fara ea,
// destinatie NEDECISA (`href: null`), deci randul din brand, legatura de ajutor si iconita de posta
// nu se randeaza deloc (plan S4 §7; masurat 24.09: vechea adresa nu primea posta).
const POSTA: Legatura = postaMarcii();

export const SUBSOL: {
  brand: { slogan: string; descriere: string; posta: Legatura };
  coloane: ColoanaSubsol[];
  insigne: InsignaSubsol[];
  copyright: { detinator: string; mentiune: string; drepturi: string };
  urmariti: string;
  retele: ReteaSociala[];
} = {
  brand: {
    // Rol: sloganul de sub sigla (14/600). Lungime: 35 [numarat].
    slogan: "Arhiva care răspunde cu sursa citată",
    // Rol: ce este produsul, pe scurt (14/400, 4 randuri la 1440). Lungime: 107 [numarat].
    descriere:
      "3S scanează actele firmei, le ține în ordine și răspunde la întrebări despre ele, inclusiv pe WhatsApp.",
    // Adresa vine din `config/brand.json`; cat timp e goala, randul nu se randeaza.
    posta: POSTA,
  },
  coloane: [
    {
      // Lungime: 6 [numarat].
      titlu: "Produs",
      // 11 legaturi, in ordinea masurata. Lungimile la referinta: 9, 10, 11, 31, 7, 7, 17, 23,
      // 10, 9, 8 [numarat].
      legaturi: [
        { text: "Platforma", href: "/platforma", ruta: "/platforma" },
        { text: "Enterprise", href: "/enterprise", ruta: "/enterprise" },
        { text: "E-facturare", href: "/e-facturare", ruta: "/e-facturare" },
        {
          text: "Cât se păstrează fiecare act",
          href: "/instrumente/termene-pastrare",
          ruta: "/instrumente/termene-pastrare",
        },
        { text: "Prețuri", href: "/preturi", ruta: "/preturi" },
        // Ancora starii de pachete de pe pagina de preturi (preturi.md, antet).
        { text: "Pachete", href: "/preturi#pachete", ruta: "/preturi" },
        { text: "Deschideți un cont", href: CALE_INREGISTRARE, ruta: CALE_INREGISTRARE },
        { text: "3S comparat cu un drive", href: "/comparatie-drive", ruta: "/comparatie-drive" },
        { text: "Securitate", href: "/securitate", ruta: "/securitate" },
        { text: "Integrări", href: "/integrari", ruta: "/integrari" },
        { text: "Aplicația", href: "/descarca", ruta: "/descarca" },
      ],
    },
    {
      // Lungime: 8 [numarat].
      titlu: "Sectoare",
      // 5 legaturi. Lungimile la referinta: 16, 22, 25, 23, 21 [numarat].
      legaturi: [
        { text: "Soluții pe domenii", href: "/solutii", ruta: "/solutii" },
        { text: "Transport și expediții", href: "/solutii/logistica", ruta: "/solutii/logistica" },
        {
          text: "Contabili și experți fiscali",
          href: "/solutii/contabilitate",
          ruta: "/solutii/contabilitate",
        },
        {
          text: "Șantiere și proiecte",
          href: "/solutii/constructii",
          ruta: "/solutii/constructii",
        },
        { text: "Avocatură și litigii", href: "/solutii/avocatura", ruta: "/solutii/avocatura" },
      ],
    },
    {
      // Lungime: 7 [numarat].
      titlu: "Resurse",
      // 7 legaturi: listarea, 5 articole, intrebarile de pe start. Slugurile articolelor sunt
      // PROPUNERI pe subiectele masurate (componente-globale.md §6.1): cautare, digitizare,
      // birou fara hartie, fluxuri automate, GDPR. Felia `blog` le confirma sau cere
      // dispecerului alte sluguri; pana exista in registrul blogului, `seVede` le ascunde.
      // Lungimile la referinta: 16, 20, 20, 17, 26, 25, 19 [numarat].
      legaturi: [
        { text: "Lista articolelor", href: "/blog", ruta: "/blog" },
        {
          text: "Căutarea cu AI în acte",
          href: "/blog/cautarea-in-documente-dupa-sens",
          ruta: "/blog/cautarea-in-documente-dupa-sens",
        },
        {
          text: "Scanarea arhivei vechi",
          href: "/blog/digitizarea-arhivei-de-hartie",
          ruta: "/blog/digitizarea-arhivei-de-hartie",
        },
        {
          text: "Mai puțină hârtie",
          href: "/blog/biroul-fara-hartie",
          ruta: "/blog/biroul-fara-hartie",
        },
        {
          text: "Fluxuri automate de acte",
          href: "/blog/fluxuri-automate-de-documente",
          ruta: "/blog/fluxuri-automate-de-documente",
        },
        {
          text: "GDPR și actele din arhivă",
          href: "/blog/actele-firmei-si-gdpr",
          ruta: "/blog/actele-firmei-si-gdpr",
        },
        { text: "Ce trebuie să știți", href: "/#intrebari", ruta: "/" },
      ],
    },
    {
      // Lungime: 8 [numarat].
      titlu: "Companie",
      // 4 legaturi. Lungimile la referinta: 7, 17, 15, 11 [numarat].
      legaturi: [
        { text: "Contact", href: "/contact", ruta: "/contact" },
        // Rol: asistenta tehnica, pe adresa marcii din `config/brand.json` (azi fara adresa: ascunsa).
        { text: "Ajutor prin e-mail", href: POSTA.href, ruta: null },
        // Rol: materialele de invatare (la referinta, tutoriale video spre blog). 3S nu are
        // tutoriale video; ghidurile scrise stau pe blog.
        { text: "Ghiduri practice", href: "/blog", ruta: "/blog" },
        // Rol: pagina externa a dezvoltatorului, la referinta. NEDECIS la 3S (componente-globale.md
        // §6.1): candidatul e site-ul firmei-mame, cu adresa inca neverificata si fara acordul
        // owner-ului. Pana la decizie legatura nu se randeaza (`href: null`).
        { text: "Despre ADRIA", href: null, ruta: null },
      ],
    },
    {
      // Lungime: 7 [numarat].
      titlu: "Juridic",
      // 8 legaturi. Lungimile la referinta: 17, 29, 19, 10, 16, 16, 10, 14 [numarat].
      legaturi: [
        {
          text: "Mențiuni legale",
          href: "/juridic/informatii-legale",
          ruta: "/juridic/informatii-legale",
        },
        {
          text: "Politica de confidențialitate",
          href: "/juridic/confidentialitate",
          ruta: "/juridic/confidentialitate",
        },
        { text: "Termeni și condiții", href: "/juridic/termeni", ruta: "/juridic/termeni" },
        { text: "Cookie-uri", href: "/juridic/cookies", ruta: "/juridic/cookies" },
        {
          text: "Reguli publice",
          href: "/juridic/politici-publice",
          ruta: "/juridic/politici-publice",
        },
        {
          text: "Licența aplicației",
          href: "/juridic/licenta-software",
          ruta: "/juridic/licenta-software",
        },
        { text: "Harta site", href: "/harta-site", ruta: "/harta-site" },
        { text: "Accesibilitate", href: "/accesibilitate", ruta: "/accesibilitate" },
      ],
    },
  ],
  // Banda de 5 insigne: numai fapte din registrul de afirmatii (plan D4c, D5). Lungimile la
  // referinta: 12, 24, 16, 26, 18 [numarat]. Textul urmeaza iconita pastrata din contract.
  insigne: [
    { text: "Germania, UE", iconita: "cloud" },
    { text: "Fișiere criptate cu AES-256", iconita: "lock" },
    { text: "Conexiuni TLS 1.2+", iconita: "shield-check" },
    { text: "Răspunsuri cu sursa citată", iconita: "file-check" },
    { text: "Arhivă fizică ADRIA", iconita: "archive" },
  ],
  copyright: {
    // Rol: randul 1, cine detine drepturile (12/400 `cerneala-3`). Anul se pune la randare. Datele
    // de identificare ale unei firme nu apar pe site (plan §7); tin de operatorul din
    // `config/operator.json`, null azi.
    // Plan §7 (owner, 24.09): pe site apare doar brandul, fara informatii despre firma, iar
    // copyright-ul vorbeste in numele brandului. De aceea randul numeste marca si nu firma.
    detinator: "3S Scan Store Solve",
    // Rol: randul 1, a doua parte. In contractul provizoriu era starea juridica a marcii; dupa
    // plan §7 ramane numele din sigla oficiala (3S, ADRIA Doc Management, scan-store-solve).
    mentiune: "ADRIA Doc Management",
    // Rol: randul 2. Lungime: 27 [numarat].
    drepturi: "Toate drepturile rezervate.",
  },
  // Rol: eticheta de langa iconitele sociale (12/600). Lungime: 11 [numarat].
  urmariti: "3S pe rețele",
  // 4 retele, ca pe referinta. Conturile 3S de LinkedIn, YouTube si X nu sunt cunoscute:
  // `href: null` pana le da owner-ul (pagina de Facebook 3S exista, dupa README-ul marcii, dar
  // adresa ei nu e consemnata aici). Posta electronica are destinatie numai cand
  // `config/brand.json` are o adresa confirmata.
  retele: [
    { retea: "linkedin", text: "3S pe LinkedIn", href: null, ruta: null },
    { retea: "youtube", text: "3S pe YouTube", href: null, ruta: null },
    { retea: "x", text: "3S pe X", href: null, ruta: null },
    { retea: "email", text: "Scrieți-ne pe e-mail", href: POSTA.href, ruta: null },
  ],
};

/**
 * Toate legaturile navigatiei, intr-o singura lista: antetul cu foile lui, panoul Descarca,
 * limba, paleta si subsolul. Pentru probe si pentru proba de completitudine de la livrare.
 */
export function toateLegaturileNavigatiei(): Legatura[] {
  const foi = ANTET.legaturi.flatMap((l) =>
    l.foaie === null
      ? []
      : [...(l.foaie.lider === null ? [] : [l.foaie.lider]), ...l.foaie.elemente, l.foaie.subsol],
  );
  return [
    ANTET.sigla,
    ...ANTET.legaturi,
    ...foi,
    ANTET.autentificare,
    ANTET.cta,
    ...PANOU_DESCARCA.grupuri.flatMap((g) => g.elemente),
    ...LIMBI,
    ...PALETA.grupuri.flatMap((g) => g.elemente),
    SUBSOL.brand.posta,
    ...SUBSOL.coloane.flatMap((c) => c.legaturi),
    ...SUBSOL.retele,
  ];
}
