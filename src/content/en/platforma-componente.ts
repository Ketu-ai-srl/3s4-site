// Continutul componentelor paginii platformei pe editia `en` (P02, `/platform`): aceleasi componente si aceeasi
// compunere ca pagina RO `/platforma` (decizia 53), cu textul in engleza. Constanta e tipata pe contractul structural
// al lui `PaginaPlatforma` (felia 101: proprietati optionale cu implicitul RO), deci un camp lipsa sau in plus pica
// typecheck-ul.
//
// SURSA TEXTULUI, pe camp: fisa de continut a paginii, sectiunea "Component copy (decision 53)", cu cheia campului RO
// (de pilda `platforma.ts:40`) in comentariu. Textul nou e PROPUS, pana la aprobarea owner-ului pe capturi.
//
// CE NU INTRA, cu decizia: sectiunile Problema si BlocDate (hartia si scanarea facuta de 3S: poarta juridica a
// deciziilor 40-41) si Apeluri (API-ul, webhook-urile si integrarile nu sunt in codul platformei: d43); din Cazuri,
// scolile (aceeasi poarta) si asigurarile (d43, d49), plus legatura spre paginile de segment (d38); din intrebari,
// cele despre programul de contabilitate si despre blocurile de cod (d43); butonul secundar al blocului de final
// (pagina lui nu exista pe 3s.md). Blocurile numerotate raman doua, deci se citesc 01 si 02.
// `platform.ts` ramane sursa pentru metadata, nodul WebPage si registrul de afirmatii.
//
// Modulul e numai date.

import type { ContinutCtaFinal } from "@/components/primitive/CtaFinalInchis";
import type { ContinutPaginaPlatforma, SectiunePlatforma } from "@/components/produs/PaginaPlatforma";

/** Sectiunile montate pe 3s.md, in ordinea componentei; Problema, BlocDate si Apeluri ies. */
export const SECTIUNI_PLATFORMA_EN: readonly SectiunePlatforma[] = [
  "erou",
  "piloni",
  "model",
  "blocArhiva",
  "blocIntrebari",
  "comparatie",
  "suveranitate",
  "cazuri",
  "conformitate",
  "intrebari",
];

/** Eticheta accesibila a firului (`FirPagina.tsx`, implicitul RO "Fir de navigare"). */
export const ETICHETA_FIR_EN = "Breadcrumb";

/** Butonul de canal al eroului si al finalului (`platforma.ts:41`, `acasa.ts:807`): WhatsApp, sigla numeste canalul. */
export const ETICHETA_BUTON_CANAL_PLATFORMA = "Message us";

/** Butonul secundar al eroului (`platforma.ts:42`): pagina de contact exista pe 3s.md; nu se promite o demonstratie. */
export const EROU_SECUNDAR_PLATFORMA = { text: "Contact us", href: "/contact", ruta: "/contact" } as const;

export const PLATFORMA_EN: ContinutPaginaPlatforma = {
  // platforma.ts:28-29.
  fir: [
    { text: "Home", cale: "/" },
    { text: "Platform", cale: "/platform" },
  ],
  erou: {
    // platforma.ts:36, H1 aprobat.
    titlu: "The 3S platform: documents in, cited answers out",
    // platforma.ts:40, capsula aprobata scurtata la cutia RO.
    subtitlu:
      "3S takes in the documents you upload from the browser, including files you already have as scans. It recognizes each one and logs who opens it. You can set a retention period for each folder, and it applies to the documents in it. Then you ask questions, and each answer shows the source it came from.",
  },
  macheta: {
    // platforma.ts:52-57.
    declaratie:
      "Example with fictional data: TIFF scans, PDF documents, PNG and JPG photos go into 3S, which reads the text and tags each one by type.",
    eticheta: "Example with fictional data",
    fisiere: ["TIFF", "PDF", "PNG", "JPG"],
    miez: "3S",
    campuri: ['"type": "contract"', '"folder": "Logistics"', '"text": "searchable"'],
    insigne: ["Frankfurt", "Retention", "Log", "Export"],
  },
  piloni: {
    // platforma.ts:64-82.
    fraza: "Upload once, ask as often as you need.",
    piloni: [
      {
        numar: "01",
        iconita: "straturi",
        titlu: "All your files in one archive",
        text: "PDFs, scans and photos your team uploads land in the same archive, where 3S reads the text and tags each file by type.",
      },
      {
        numar: "02",
        iconita: "scut-bifa",
        titlu: "Stored in the EU",
        text: "Files you upload are stored in the EU, with Frankfurt as the primary region, and you can export them whenever you need.",
      },
      {
        numar: "03",
        iconita: "scantei",
        titlu: "Answers with the source",
        text: "A question asked in the browser gets an answer from your documents, with the document it came from, so you can check it.",
      },
    ],
  },
  model: {
    // platforma.ts:104-115.
    titlu: "How a team question reaches the right document",
    metafora: "One place for all your company's documents.",
    subtitlu:
      "Your team asks its questions in the browser. Documents come into 3S by upload, and answers go back with the source they came from.",
    noduri: [
      { eticheta: "Your team", descriere: "Colleagues and your accountant, in the browser." },
      { eticheta: "3S archive", descriere: "Every document read, stored in the EU, ready for questions." },
      { eticheta: "Your documents", descriere: "Shared folders, email attachments, scans and photos." },
    ],
    conectori: ["Questions and searches", "Documents by upload"],
  },
  blocArhiva: {
    // platforma.ts:146-174; randurile despre originalul pe hartie ies (poarta juridica 40-41).
    numar: "01",
    titlu: "Where each document is kept, for how long, and who opened it",
    subtitlu: "Three facts hold for every file in 3S, whether it started as a scan or as a digital document.",
    randuri: [
      { eticheta: "Stored files", valoare: "Files you upload are stored in the EU, with Frankfurt as the primary region." },
      { eticheta: "Retention period", valoare: "You set a retention period on each folder, and it applies to every document in it." },
      { eticheta: "Access log", valoare: "3S logs who opens each document." },
    ],
    legatura: { text: "Where your documents are stored", href: "/about#security", ruta: "/about" },
  },
  blocIntrebari: {
    // platforma.ts:178-201.
    numar: "02",
    titlu: "Ask one question, get what your documents say",
    subtitlu: "Ask in plain words, and 3S shows the answer together with the document it came from.",
    carduri: [
      {
        iconita: "balon",
        titlu: "The source in plain view",
        text: 'Ask as you would ask a colleague, for example "What did we pay in rent in March?", and see the answer next to the document 3S took it from, so you can check it on the spot.',
      },
      {
        iconita: "lupa",
        titlu: "Questions in Romanian",
        text: "Questions in Romanian are supported. English questions over Romanian documents are in beta.",
      },
      {
        // Iconita ceasului in locul clopotului: alertele nu sunt in cod (d43).
        iconita: "ceas",
        titlu: "Retention by folder",
        text: "Set a retention period on a folder once, and it covers every document in it, so how long you keep a file no longer depends on anyone's memory.",
      },
      {
        iconita: "randuri",
        titlu: "Document types",
        text: "3S tags each document by type, such as contract or invoice, so you know what a file is before you open it.",
      },
    ],
  },
  comparatie: {
    // platforma.ts:211-223 si `PaginaPlatforma.tsx:260`.
    titlu: "A stack of scanned PDFs is not yet a company archive",
    subtitlu: "Five things a company needs every day, side by side: what a plain scan leaves you with and what 3S does.",
    coloane: ["Scan only", "3S archive"],
    randuri: [
      { dimensiune: "Text in the scans", alternativa: "Locked in the image", noi: "Read and searchable" },
      { dimensiune: "Document types", alternativa: "Sorted by hand", noi: "Tagged automatically" },
      { dimensiune: "File location", alternativa: "On an office computer", noi: "In the EU (Frankfurt)" },
      { dimensiune: "Finding a fact", alternativa: "Open file after file", noi: "One question, with the source" },
      { dimensiune: "Retention period", alternativa: "Kept in someone's head", noi: "Set on each folder" },
    ],
    nota: "Retention rules for e-invoices differ from country to country; our guide gives the primary source and the check date.",
    legatura: { text: "E-invoicing", href: "/guides/e-invoice-archiving-eu", ruta: "/guides/e-invoice-archiving-eu" },
    etichetaCriteriu: "Criterion",
  },
  suveranitate: {
    // platforma.ts:229-250.
    eticheta: "Data location",
    titlu: "Your files, in the EU. Frankfurt is the primary region.",
    subtitlu: "Every file you upload has a known location, and you can name it to anyone who asks.",
    proza: [
      "Files you upload to 3S are stored in the EU, with Frankfurt as the primary region. 3S reads the text of each file once, tags it by type and keeps it ready for search.",
      "The hosting provider is a US company. A US law known as the CLOUD Act can require such a provider to preserve and disclose data in its care, even when its servers are outside the US. The About page names the provider.",
    ],
    evidentiat:
      "Each folder carries its retention period, and 3S logs who opens each document. If a client, an auditor or an inspector asks where a document is, the answer is the same every time: in the EU, with Frankfurt as the primary region.",
    legatura: { text: "Read the About page", href: "/about#security", ruta: "/about" },
    carduri: [
      {
        titlu: "Text read once",
        text: "3S reads the text of each scan or photo once, so you can search it from then on without opening the file.",
      },
      {
        titlu: "A log of who opens what",
        text: "3S logs who opens each document. For rules on who inside your organization sees which documents, tell us what you need.",
      },
      {
        titlu: "Retention, by folder",
        text: "You set a retention period on each folder, and it applies to every document in it. Our guides give the primary sources for Moldova and EU e-invoices.",
      },
    ],
  },
  cazuri: {
    // platforma.ts:324-338; fara legatura spre paginile de segment (d38).
    titlu: "Examples from daily work",
    subtitlu: "A few examples from fields where a working day means many documents and many questions about them.",
    cazuri: [
      {
        titlu: "Logistics",
        text: "Orders, signed CMRs and proofs of delivery sit in each trip's folder, so invoicing does not wait for a document left in a driver's cab.",
      },
      {
        titlu: "Construction",
        text: "For each site, permits, acceptance reports and progress statements sit in one folder, and a search by the site's address finds them.",
      },
      {
        titlu: "Accounting",
        text: "Each client's documents sit in their own folders, by month, and a question finds an invoice without another email asking the client to resend it.",
      },
    ],
  },
  conformitate: {
    // platforma.ts:355-357 si `PaginaPlatforma.tsx:402`.
    titlu: "What an auditor asks, 3S can show on the spot",
    text: "Folder retention periods and the log of who opened what are in 3S at any time, with no preparation for an audit.",
    insigne: ["Export", "Retention", "EU", "Frankfurt", "AWS", "Log"],
    etichetaInsigne: "What 3S can show",
  },
  intrebari: {
    // platforma.ts:363-388: titlurile H2 aprobate ale fisei, cu raspunsurile lor (text simplu, fara marcaj).
    titlu: "Common questions",
    intrebari: [
      {
        intrebare: "How do documents get into 3S?",
        raspuns: "Documents arrive by upload from the browser. Files you already have as scans go straight into the platform.",
      },
      {
        intrebare: "Who can see what?",
        raspuns:
          "For rules on who inside your organization sees which documents, tell us what you need, and we will tell you what 3S does today.",
      },
      {
        intrebare: "Where does 3S run?",
        raspuns:
          "3S runs in the EU, with Frankfurt as the primary region. The About page names the hosting provider and explains what US law says about data held by a US company.",
        legaturiInText: [{ text: "About page", href: "/about#security" }],
      },
      {
        intrebare: "How do I find something?",
        raspuns:
          "Ask in plain words: 3S cites the source of each answer, so you can check it. English questions over Romanian documents are in beta.",
      },
      {
        intrebare: "Can I set how long documents are kept?",
        // Site-ul nu are o pagina-index a ghidurilor, deci raspunsul numeste cele doua ghiduri si le leaga pe fiecare.
        raspuns:
          "Yes. You can set a retention period for each folder, and it applies to the documents in it. Our guides to records retention in Moldova and to e-invoice archiving in the EU cite their sources.",
        legaturiInText: [
          { text: "records retention in Moldova", href: "/guides/records-retention-moldova" },
          { text: "e-invoice archiving in the EU", href: "/guides/e-invoice-archiving-eu" },
        ],
      },
    ],
  },
};

/** Blocul de final (`acasa.ts:800-828`): textul fisei paginii, macheta ca pe start. */
export const CTA_FINAL_PLATFORMA_EN: ContinutCtaFinal = {
  titlu: "See how it would work with your documents",
  subtitlu: "We will show you how 3S answers a question on a sample of your documents.",
  // Folosit numai daca pagina nu da `butoane`; pagina pune butonul WhatsApp.
  butonPrincipal: { text: ETICHETA_BUTON_CANAL_PLATFORMA, href: null, ruta: null },
  microtext: "A person replies, in English or Romanian.",
  vizual: {
    declaratie: "Example with fictional data",
    pasi: [
      { iconita: "laptop", text: "Browser upload", ora: "09:41" },
      { iconita: "tag", text: "Tagged as invoice", ora: "09:41" },
    ],
    rezultat: { fisier: "Invoice_0415_example.pdf", stare: "Searchable in the archive", ora: "09:42" },
  },
};
