// Continutul componentelor startului pe editia `en` (P01, `/`): aceleasi componente si aceeasi compunere ca pe
// pagina de start RO (decizia 53), cu textul in engleza. Fiecare constanta e tipata pe contractul structural al
// componentei ei (felia 98: proprietati optionale cu implicitul RO), deci un camp lipsa sau in plus pica typecheck-ul.
//
// SURSA TEXTULUI, pe camp: fisa de continut a paginii, sectiunea "Component copy (decision 53)" si randurile deciziei
// 59 (GrilaIndustrii, CardEnterprise), cu cheia campului RO (de pilda `acasa.ts:138`) in comentariu. Campurile pe
// care fisa nu le rescrie au textul aprobat al paginii, neschimbat (`home.ts`, citat pe camp). Textul nou e PROPUS,
// pana la aprobarea owner-ului pe capturi (poarta 1).
//
// CE NU INTRA, cu decizia: pastila-legatura a eroului si randurile 1 si 3 ale popover-ului (d31, d43, d49); centrul
// buclei si legenda (lansarea machetei, d43 si d49; hartia, poarta juridica a deciziilor 40-41); insigna "scanat"
// a machetei cautarii (aceeasi poarta); macheta portalului (d43); cifra AES-256 (d31); butonul secundar al blocului
// de final (pagina lui nu exista pe 3s.md); legaturile cardurilor de situatii spre paginile de segment (d38).
// `home.ts` ramane sursa pentru metadata, JSON-LD si registrul de afirmatii.
//
// Modulul e numai date: il importa si invelitoarea client a pasilor, deci nu aduce nimic din continutul RO.

import type { ContinutBandaPret } from "@/components/acasa/BandaPret";
import type { ContinutCardEnterprise } from "@/components/acasa/CardEnterprise";
import type { ContinutCardSecuritate } from "@/components/acasa/CardSecuritate";
import type { ContinutCifra } from "@/components/acasa/BandaCifre";
import type { ContinutFaqAcasa } from "@/components/acasa/FaqAcasa";
import type { ContinutGrilaIndustrii } from "@/components/acasa/GrilaIndustrii";
import type { ContinutTestimonial } from "@/components/acasa/Testimonial";
import type { ContinutErou } from "@/components/erou/Erou";
import type { ContinutFunctionalitatiAcasa } from "@/components/functionalitati-acasa/FunctionalitatiAcasa";
import type { ContinutMachetaCautare } from "@/components/functionalitati-acasa/MachetaCautareVedere";
import type { ContinutMachetaRegistru } from "@/components/functionalitati-acasa/MachetaRegistruVedere";
import type { ContinutCtaFinal } from "@/components/primitive/CtaFinalInchis";

/** Ancora blocului de final: aceeasi ca pe RO (`ANCORE_ACASA.contact`), deci aceeasi semnatura de forma. */
export const ANCORA_FINAL = "contact";

/** Butoanele de canal ale eroului si ale finalului (`acasa.ts:141`, `:807`): WhatsApp, cu sigla canalului. */
export const ETICHETA_BUTON_CANAL = "Message us";

/** Butonul secundar al eroului: eticheta aprobata, tinta e blocul de final (pilotul pe un esantion). */
export const EROU_SECUNDAR = { text: "See how a pilot starts", href: "#" + ANCORA_FINAL } as const;

export const EROU_EN: ContinutErou = {
  pastile: {
    // acasa.ts:103; H2-ul aprobat "Where are my documents stored?".
    intrebare: { text: "Where are my documents stored?", iconita: "check" },
  },
  popover: {
    // acasa.ts:119; numai randul gazduirii ramane (d42).
    randuri: [{ iconita: "globe", text: "Stored in the EU, primary region Frankfurt." }],
    // Eticheta si tinta aprobate ("About page", /about#security).
    legatura: { text: "About page", href: "/about#security", ruta: "/about" },
  },
  // H1 aprobat (decizia 2), impartit ca pe RO: prima propozitie, apoi a doua cu accentul (acasa.ts:132, :134).
  titlu: {
    primaPropozitie: "Ask your company's documents.",
    aDouaInainteDeAccent: "Get the answer",
    accent: "and its source.",
  },
  // acasa.ts:138.
  subtitlu:
    "3S keeps your company's documents in a digital archive and answers questions about them, with the cited source.",
  // acasa.ts:151.
  nota: "No form, no account.",
  bucla: {
    // Decizia 61 (inlocuieste raspunsul la intrebarea 6): figura din pagina de autentificare a aplicatiei
    // 3S, cu textele ei in engleza. Aceleasi pozitii si iconite ca pe RO (acasa.ts, blocul buclei).
    lobStanga: "Intake",
    lobDreapta: "Archive",
    noduri: [
      { pozitie: "sus-stanga", eticheta: "Scan", iconita: "scan-line" },
      { pozitie: "capat-stanga", eticheta: "OCR text", iconita: "file-text" },
      { pozitie: "jos-stanga", eticheta: "Upload", iconita: "cloud-upload" },
      { pozitie: "sus-dreapta", eticheta: "3S classification", iconita: "sparkles" },
      { pozitie: "capat-dreapta", eticheta: "Search", iconita: "search" },
      { pozitie: "jos-dreapta", eticheta: "3S chat", iconita: "message-square-text" },
    ],
    etichetaFigura:
      "The path a document takes: scanned, read by OCR, uploaded, classified, searchable by meaning, and answerable in chat.",
  },
};

export const FUNCTIONALITATI_EN: ContinutFunctionalitatiAcasa = {
  // acasa.ts:435, :440.
  titlu: "What is 3S Scan Store Solve?",
  subtitlu:
    "3S is a digital archive, operated from Moldova, that answers questions about your files. Its name gives the three steps.",
  final: {
    // acasa.ts:479; butonul: legatura aprobata spre comparatie (decizia 11).
    fraza: "For a few dozen files, Google Drive or Box may be enough.",
    buton: { text: "3S vs Google and Box AI", href: "/compare/3s-vs-google-and-box", ruta: "/compare/3s-vs-google-and-box" },
  },
};

/** Pasii sectiunii (invelitoarea EN a partii vii); etichetele sunt numele aprobate ale pasilor. */
export const PASI_EN: { numar: "01" | "02" | "03"; eticheta: string; titlu: string; paragraf: string }[] = [
  {
    numar: "01",
    eticheta: "Scan",
    // Pasul Scan aprobat, fara jumatatea despre hartie (poarta juridica a deciziilor 40-41).
    titlu: "Files you already have as scans go straight into the platform.",
    // acasa.ts:453.
    paragraf:
      "3S reads the text of scans and photos and tags each document by type, such as contract or invoice. You can then search by what a document says, for example a client's name.",
  },
  {
    numar: "02",
    eticheta: "Store",
    // acasa.ts:460, :463.
    titlu: "Each document sits in your organization's own space",
    paragraf:
      "Every upload is prepared for search automatically, and you can export the originals in a zip that keeps your folder structure.",
  },
  {
    numar: "03",
    eticheta: "Solve",
    // acasa.ts:470, :473.
    titlu: "Ask in Romanian. Get the answer and the document it comes from.",
    paragraf:
      "Ask 3S for a fact or a document, and the answer links to its source. Retention is set on each folder: you choose the date, and 3S shows a notice in the app before that date.",
  },
];

/** Eticheta vizibila "exemplu" din capul machetelor. */
export const ETICHETA_EXEMPLU_EN = "example";

/** Macheta pasului 1, fara insigna de scanare (poarta juridica a deciziilor 40-41). */
export const MACHETA_CAUTARE_EN: Omit<ContinutMachetaCautare, "exemplu" | "bifa"> = {
  // acasa-functionalitati.ts:79-121.
  declaratie: "Example with fictional data: an archive search with three documents found",
  eticheta: "Archive search",
  intrebare: "All about the warehouse in 2025",
  gasite: "9 documents found, with sources",
  insigne: { etichetat: "Auto-tagged" },
  randuri: [
    {
      placuta: "PDF",
      fisier: "Rent_invoice_March.pdf",
      tip: { cod: "factura", text: "Invoice" },
      data: "Mar 2025",
      scanat: false,
      rezumat: {
        titlu: "Excerpt from the file",
        text: "Warehouse rent for March: EUR 3,200.00 plus VAT, due by April 10, 2025.",
      },
    },
    {
      placuta: "PDF",
      fisier: "Warehouse_lease_contract.pdf",
      tip: { cod: "albastru", text: "Contract" },
      data: "Jan 2025",
      scanat: false,
      rezumat: {
        titlu: "Excerpt from the file",
        text: "A 12-month lease, January through December 2025, with a signed handover of the space.",
      },
    },
    {
      placuta: "XLS",
      fisier: "Energy_use_Q1_2025.xlsx",
      tip: { cod: "raport", text: "Report" },
      data: "Apr 2025",
      scanat: false,
      rezumat: {
        titlu: "Excerpt from the file",
        text: "The warehouse used 18,450 kWh in the first quarter, 6% less than in the same period of 2024.",
      },
    },
  ],
};

/** Macheta pasului 3: un dosar, cu anul de eliminare al dosarului pe fiecare rand (termenul e pe dosar). */
export const MACHETA_REGISTRU_EN: Omit<ContinutMachetaRegistru, "exemplu"> = {
  // acasa-functionalitati.ts:261-278.
  declaratie: "Example with fictional data: one folder whose retention date covers every document in it",
  eticheta: "Folder retention",
  insigna: "Folder rule",
  coloane: ["No.", "Document", "Type", "Disposal", "Status"],
  stare: "Current",
  randuri: [
    { nr: "001", fisier: "Rent_invoice_March.pdf", tip: { cod: "factura", text: "Invoice" }, termen: "2034" },
    { nr: "002", fisier: "Supplier_offer_March.pdf", tip: { cod: "albastru", text: "Offer" }, termen: "2034" },
    { nr: "003", fisier: "Report_2024.xlsx", tip: { cod: "raport", text: "Report" }, termen: "2034" },
  ],
  verificari: [
    { iconita: "tag", text: "Document type tagged" },
    { iconita: "clock", text: "Retention set on the folder" },
    { iconita: "book-open", text: "Searchable in the archive" },
    { iconita: "shield", text: "Shareable by expiring link" },
  ],
};

/** Etichetele punctelor pistei de mobil (acasa-functionalitati.ts:290, :292). */
export const PUNCTE_PISTA_EN = {
  grup: "Feature steps",
  punct: (numar: number, total: number, eticheta: string) => "Step " + numar + " of " + total + ": " + eticheta,
};

/** Banda de cifre (acasa.ts:502, :508); perechea AES-256 iese (d31). */
export const CIFRE_EN: ContinutCifra[] = [
  { cifra: "EUR 0", eticheta: "for the 14-day pilot" },
  { cifra: "Frankfurt", eticheta: "as the primary EU region" },
];

/** Situatiile de lucru (decizia 59; acasa.ts:530-588): fara legaturi spre segmente (d38). */
export const INDUSTRII_EN: ContinutGrilaIndustrii = {
  titlu: "Who is 3S for?",
  carduri: [
    {
      text: "Requests for the same contract",
      descriere: "Ask the question and open the document shown under the answer.",
      iconita: "file-text",
    },
    { text: "Documents in too many places", descriere: "Once uploaded, they sit in one archive.", iconita: "archive" },
    {
      text: "Only one colleague knows where things are",
      descriere: "Colleagues with an account ask the same archive and reach the same document.",
      iconita: "users",
    },
    {
      text: "A growing team or a new office",
      descriere: "A new colleague signs in and asks the same archive from the browser.",
      iconita: "building",
    },
    {
      text: "Scans with no searchable text",
      descriere: "3S recognizes the text of scanned documents, so you can search them too.",
      iconita: "scan-line",
    },
    {
      text: "Documents with a retention period",
      descriere: "Set a retention date on each folder, and it applies to every document in it.",
      iconita: "file-check",
    },
    {
      text: "Strict rules on access or export",
      descriere: "Tell us at the start, and we will say plainly whether 3S meets them.",
      iconita: "shield-check",
    },
  ],
  toate: { text: "Tell us yours", href: "/contact", ruta: "/contact" },
};

/** acasa.ts:612-618: un principiu al produsului, fara citat si fara persoana. */
export const TESTIMONIAL_EN: ContinutTestimonial = {
  esteCitat: false,
  fraza: "Test 3S on a sample of your own documents before you decide.",
  continuare:
    "Every answer in 3S comes with the document it was drawn from, so you can check the source before you rely on it.",
  atribuire: { rol: "How 3S answers", firma: "3S Scan Store Solve" },
};

/** acasa.ts:647-655. */
export const CARD_SECURITATE_EN: ContinutCardSecuritate = {
  titlu: "How are your company's documents kept?",
  text: "Files you upload are stored in the EU, with Frankfurt as the primary region. The About page names the hosting provider and what US law means for your data.",
  legatura: { text: "Where your documents are stored", href: "/about#security", ruta: "/about" },
};

/** acasa.ts:663-671 (decizia 59): planul Enterprise, spre /enterprise. */
export const CARD_ENTERPRISE_EN: ContinutCardEnterprise = {
  titlu: "More than 20 user accounts?",
  pastila: "Enterprise",
  descriere:
    "3S Enterprise is the plan for organizations with more than 20 user accounts, on an annual contract. 3S recognizes the text of scanned documents, detects the document type and cites each answer's source.",
  tinta: { text: "For large archives and IT requirements", href: "/enterprise", ruta: "/enterprise" },
};

/** acasa.ts:689-693. */
export const BANDA_PRET_EN: ContinutBandaPret = {
  titlu: "3S pricing, up front",
  fraza: "Indicative prices from EUR 90 a month, excluding VAT. You begin with a free 14-day pilot.",
  legatura: { text: "See the plans", href: "/pricing", ruta: "/pricing" },
};

/** acasa.ts:718-767. Raspunsurile sunt text simplu: FAQPage din JSON-LD le oglindeste exact. */
export const INTREBARI_EN: ContinutFaqAcasa = {
  titlu: "Common questions",
  intrebari: [
    {
      intrebare: "Where are my documents stored?",
      raspuns:
        "Files you upload to 3S are stored in the EU, with Frankfurt as the primary region. The About page names the hosting provider, which is a US company, and explains what US law says about data in a US provider's care.",
    },
    {
      intrebare: "Who operates 3S?",
      raspuns: "3S is operated from Moldova. The operating company's details are on the Legal information page.",
    },
    {
      intrebare: "Can I ask in English about Romanian documents?",
      raspuns:
        "That is in pilot: we test it on a sample of your files before you decide. Citation down to the page is in pilot too. Questions in Romanian are supported.",
    },
    {
      intrebare: "How do I start?",
      raspuns:
        "You begin with an assisted pilot on a sample of your documents. Message us on WhatsApp about your archive; send no documents or personal data yet. We agree on the sample and the questions, then check the answers and sources with you. During the pilot, accounts are invitation-only.",
    },
  ],
  // acasa.ts:767: fara adresa de posta pana la P-40, ca pe RO cand marca nu are adresa confirmata.
  subsol: { inainte: "These answers describe 3S as it works today.", posta: { text: "", href: null, ruta: null } },
};

/** acasa.ts:800-828. Butonul secundar iese (`/incepe` nu exista pe 3s.md); butoanele le pune pagina. */
export const CTA_FINAL_EN: ContinutCtaFinal = {
  // Titlul aprobat al blocului de final.
  titlu: "Try it on a sample of your documents",
  subtitlu: "Tell us what your archive looks like and which country it is in.",
  // Folosit numai daca pagina nu da `butoane`; pagina pune butonul WhatsApp.
  butonPrincipal: { text: ETICHETA_BUTON_CANAL, href: null, ruta: null },
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
