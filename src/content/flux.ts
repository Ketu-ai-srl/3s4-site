// Textele si datele paginii /flux-documente (flux-documente.md, sablonul interior-880 cu poveste
// derulata). Scrise din faptele 3S (registrul `src/content/afirmatii/flux-efacturare.json`):
// canalele de intrare (e-mail, WhatsApp, scanare, incarcare), regulile automate, cautarea cu sursa
// citata, portalul clientilor, evidenta cu termene de pastrare si gazduirea in Germania.
//
// Toate numele de fisiere, persoanele, sumele si dosarele din machete sunt FICTIVE si se declara ca
// exemplu (plan D9). Comentariile `Rol:` numesc functia blocului, nu textul altcuiva.

import type { Legatura } from "@/content/navigatie";
import { CALE_INREGISTRARE } from "@/content/navigatie";

export const CALE_FLUX = "/flux-documente";

export const META_FLUX = {
  titlu: "Fluxul documentelor: de la primire la arhivă | 3S",
  descriere:
    "Cum ajunge un act din e-mail, WhatsApp sau scanare la omul potrivit și în arhivă, fără copiat de mână. Exemple pe șapte domenii, cu 3S.",
};

export const FIR_FLUX = [
  { text: "Acasă", cale: "/" },
  { text: "Fluxul documentelor", cale: CALE_FLUX },
];

export const EROU_FLUX = {
  // Rol: teza paginii, 2 randuri pe 880.
  titlu: "De la primul e-mail la dosarul cu termen, fără nimic copiat de mână.",
  // Rol: ce se intampla cu actul, 5 randuri pe 640.
  subtitlu:
    "Un furnizor vă trimite pe WhatsApp poza unei facturi. În 3S, poza stă alături de actele venite pe e-mail sau de la scaner, cu suma și data plății la vedere. Peste o lună, colegul de la plăți scrie în căutare „ce mai avem de achitat furnizorului acestuia?” și primește răspunsul cu factura citată ca sursă, fără să deschidă vreun folder.",
};

export type Fereastra = {
  nume: string;
  /** Centrul ferestrei fata de centrul scenei, la 1440 si la 390 (x, y, z, rotatie). */
  lat: [number, number, number, number];
  ingust: [number, number, number, number];
  /** Verbul muncii facute de mana cand actul ajunge aici. */
  verb: string;
};

// Pozitiile masurate ale celor 5 ferestre (flux-documente.md §2, corectate de critic).
export const FERESTRE: Fereastra[] = [
  { nume: "E-mail", lat: [-300, -120, -60, -4], ingust: [-92, -150, -40, -4], verb: "descărcat pe desktop" },
  { nume: "WhatsApp", lat: [40, -165, 20, 3], ingust: [88, -120, 10, 3], verb: "salvat din telefon" },
  { nume: "Tabel", lat: [320, -85, -40, -2], ingust: [-70, -10, -30, -2], verb: "transcris rând cu rând" },
  { nume: "Foldere", lat: [-190, 95, 0, 2], ingust: [104, 48, 0, 2], verb: "căutat locul potrivit" },
  { nume: "Contabilitate", lat: [210, 125, -30, -3], ingust: [-14, 158, -20, -3], verb: "introdus încă o dată" },
];

export type PasSistem = {
  titlu: string;
  /** Nota mono sub pas (ascunsa la 390). */
  nota: string;
  /** Ce scrie stampila cipului cand pasul e curent. */
  stampila: string;
  /** Descrierea de sub scena. */
  descriere: string;
  iconita: "inbox" | "scan-text" | "folder-tree" | "user-check" | "shield-check";
};

export const SCENA = {
  // Rol: capul sectiunii derulate (h2 de 4 cuvinte + paragraf de 2 randuri).
  titlu: "Drumul unui act, pas cu pas",
  text: "Mai jos, același act trece de două ori prin firmă: o dată cum se lucrează des astăzi, pe mână, și o dată prin 3S.",
  declaratie: "Exemplu cu date fictive",
  faza1: "Azi, pe mână",
  faza2: "Cu 3S",
  /** Contorul fazei 1: de cate ori a fost salvat de mana acelasi act. */
  contor1: (n: number) => "salvat de mână " + (n === 1 ? "o dată" : "de " + n + " ori"),
  contor2: "un original, cu jurnal",
  fisier: "Factura_F2026-0412.pdf",
  persoana: { nume: "Ioana, contabilitate", initiala: "I" },
  pasi: [
    {
      titlu: "Sosește",
      nota: "e-mail · WhatsApp · scanare",
      stampila: "primit pe e-mail · 09:14",
      descriere:
        "Actul vine pe canalul pe care îl folosește partenerul: căsuța de e-mail a firmei, WhatsApp, un teanc predat la scanat sau un fișier încărcat din browser.",
      iconita: "inbox",
    },
    {
      titlu: "Se citește",
      nota: "câmpuri recunoscute",
      stampila: "factură · Furnizor Exemplu · 4.180 lei",
      descriere:
        "3S recunoaște ce fel de act este și scoate din el datele care contează: cine l-a emis, pentru ce sumă și până când trebuie rezolvat.",
      iconita: "scan-text",
    },
    {
      titlu: "Se clasează",
      nota: "regula firmei",
      stampila: "Contabilitate / 2026 / Octombrie",
      descriere:
        "Factura de la Furnizor Exemplu intră la Contabilitate, în octombrie, după tipul actului și după emitent. Cine o caută peste un an pornește din același loc.",
      iconita: "folder-tree",
    },
    {
      titlu: "Ajunge la om",
      nota: "responsabil · termen",
      stampila: "→ Ioana · plată până la 30.10",
      descriere:
        "Ioana găsește factura în lista ei de lucru, cu data plății afișată alături. Nu trebuie să întrebe pe nimeni de unde a venit actul sau cine l-a primit.",
      iconita: "user-check",
    },
    {
      titlu: "Rămâne în arhivă",
      nota: "jurnal · păstrare · Germania",
      stampila: "păstrat · jurnal #A-2291",
      descriere:
        "Criptat pe servere Amazon din Germania, actul se regăsește și peste ani printr-o întrebare simplă. Cine l-a deschis apare în jurnal, iar ștergerea vine la capătul termenului, cu evidență.",
      iconita: "shield-check",
    },
  ] satisfies PasSistem[],
};

export const HUB = {
  // Rol: ideea benzii (3 randuri) si explicatia (4 randuri).
  titlu: "Arhiva își face treaba și când nu sunteți la birou.",
  text: "Un act sosit sâmbătă noaptea are dosar și responsabil până luni dimineață. Legăturile de mai jos aduc în aceeași arhivă ce vine prin poștă, prin rețeaua Peppol sau din SAP Business One. Fiecare act își păstrează canalul și ora sosirii, așa că știți oricând de unde a venit.",
  documente: [
    { titlu: "Factură", meta: "Exemplu · 4.180 lei", iconita: "file-text" },
    { titlu: "Contract", meta: "Închiriere · 2026", iconita: "file-signature" },
    { titlu: "Extras de cont", meta: "Septembrie 2026", iconita: "landmark" },
  ],
  nucleu: "Pus la locul lui",
  grupuri: [
    { eticheta: "Poștă și birou", elemente: [{ text: "Gmail", iconita: "mail" }, { text: "Outlook", iconita: "mail" }] },
    {
      eticheta: "Sisteme de afaceri",
      elemente: [
        { text: "SAP Business One", iconita: "building" },
        { text: "Peppol", iconita: "network", mono: true },
      ],
    },
    { eticheta: "Asistenți AI", elemente: [{ text: "Claude · ChatGPT", iconita: "bot", mono: true }] },
  ],
  legenda: "Exemplu cu date fictive. Legăturile arătate sunt integrări 3S care există azi.",
};

export const DOMENII_CAP = {
  // Rol: capul selectorului (h2 de 4 cuvinte + paragraf de 3 randuri).
  titlu: "Exemple din șapte domenii",
  text: "Un transportator adună avize și CMR-uri, un cabinet de avocatură ține termene, o agenție imobiliară predă apartamente cu proces-verbal. Alegeți domeniul și urmăriți cum se comportă 3S cu actele lui.",
  eticheta: "Domeniul firmei",
  nota: "Lista are șapte exemple, nu șapte limite: 3S primește orice act care intră într-o firmă și îl duce pe același drum.",
  legatura: "Pagina sectorului",
};

export type Domeniu = {
  cheie: "imobiliare" | "contabilitate" | "constructii" | "avocatura" | "asigurari" | "logistica" | "notariat";
  tab: string;
  eticheta: string;
  titlu: string;
  legatura: Legatura;
};

export const DOMENII: Domeniu[] = [
  {
    cheie: "imobiliare",
    tab: "Agenții imobiliare",
    eticheta: "Imobiliare",
    titlu: "Indexul de la predare, găsit când pleacă chiriașul",
    legatura: { text: DOMENII_CAP.legatura, href: "/solutii/imobiliare", ruta: "/solutii/imobiliare" },
  },
  {
    cheie: "contabilitate",
    tab: "Contabilitate",
    eticheta: "Contabilitate",
    titlu: "Actele clienților, strânse într-o lună închisă",
    legatura: { text: DOMENII_CAP.legatura, href: "/solutii/contabilitate", ruta: "/solutii/contabilitate" },
  },
  {
    cheie: "constructii",
    tab: "Construcții",
    eticheta: "Construcții",
    titlu: "Cartea construcției se scrie pe măsură ce se ridică",
    legatura: { text: DOMENII_CAP.legatura, href: "/solutii/constructii", ruta: "/solutii/constructii" },
  },
  {
    cheie: "avocatura",
    tab: "Avocatură",
    eticheta: "Avocatură",
    titlu: "Teancul de la grefă devine dosar cu termen",
    legatura: { text: DOMENII_CAP.legatura, href: "/solutii/avocatura", ruta: "/solutii/avocatura" },
  },
  {
    cheie: "asigurari",
    tab: "Asigurări",
    eticheta: "Asigurări",
    titlu: "Dosarul de daună se completează singur",
    legatura: { text: DOMENII_CAP.legatura, href: "/solutii/asigurari", ruta: "/solutii/asigurari" },
  },
  {
    cheie: "logistica",
    tab: "Transport și logistică",
    eticheta: "Transport și logistică",
    titlu: "Trei hârtii ale aceleiași curse, un singur transport",
    legatura: { text: DOMENII_CAP.legatura, href: "/solutii/logistica", ruta: "/solutii/logistica" },
  },
  {
    cheie: "notariat",
    tab: "Birouri notariale",
    eticheta: "Birouri notariale",
    titlu: "Actul de azi, găsit și peste zeci de ani",
    legatura: { text: DOMENII_CAP.legatura, href: "/solutii/notariate", ruta: "/solutii/notariate" },
  },
];

/** Datele fictive ale celor 7 machete (declarate ca exemplu). */
export const MACHETE = {
  imobiliare: {
    interogare: "indexul la apă din procesul-verbal de predare, ap. 12",
    fisier: "PV_predare_ap12_2026.pdf",
    loc: "Bloc Exemplu · Predări · Ap. 12",
    risc: "De comparat la ieșire",
    fragment: ["Pct. 4: la predare, ", "contorul de apă rece arată 00412 m³", ", iar chiriașul primește ", "trei seturi de chei", ", fiecare cu cartelă de interfon."],
  },
  contabilitate: {
    canale: ["e-mail de la client", "poze pe WhatsApp", "plic predat la birou"],
    lipsa: "Lipsește extrasul din septembrie",
    randuri: ["Extras bancar · septembrie", "Facturi furnizori · 38", "Bonuri fiscale · 112"],
  },
  constructii: {
    fisier: "PV_receptie_Bloc_B.pdf",
    etape: [
      { titlu: "Autorizație de construire", data: "martie 2025" },
      { titlu: "Proces-verbal de recepție", data: "iunie 2026" },
      { titlu: "Cartea tehnică", data: "septembrie 2026" },
    ],
  },
  avocatura: {
    fisier: "Intampinare_dosar_1432.pdf",
    lipsa: "Neînregistrat",
    loc: "Dosar 1432/2026 · termen 14 noiembrie",
    rezultat: ["Întâmpinarea a fost depusă la ", "termenul din 14 noiembrie", "; următorul pas este ", "răspunsul la întâmpinare", "."],
  },
  asigurari: {
    fisiere: ["poza_dauna_03.jpg", "constatare_amiabila.pdf", "deviz_service.pdf"],
    dosar: "Daună D-2026-118",
    incomplet: "Incomplet",
    complet: "Complet, trimis la evaluare",
  },
  logistica: {
    fisiere: ["CMR_4471.pdf", "aviz_4471.jpg", "factura_4471.xml"],
    rezultat: "Transport 4471",
    stare: "Toate actele cursei",
  },
  notariat: {
    fisier: "Act_autentificat_0815.pdf",
    nota: "Regula biroului: păstrare îndelungată",
    ani: ["2026", "2036", "2046", "2056"],
    confirmare: "Regula de păstrare aplicată",
  },
};

export const CUTIE_CTA_FLUX = {
  // Rol: invitatia de a porni fluxul firmei (h2 alb 28, paragraf 2 randuri, buton).
  titlu: "Porniți arhiva firmei de la primul e-mail",
  text: "Contul costă 0 RON astăzi și se deschide fără card. Legați căsuța de e-mail sau trimiteți un act pe WhatsApp, iar el intră pe drumul de mai sus.",
  buton: { text: "Deschideți un cont", href: CALE_INREGISTRARE, ruta: CALE_INREGISTRARE } satisfies Legatura,
};
