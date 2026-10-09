// Continutul componentelor paginii despre 3S pe editia `en` (P11, `/about`): aceleasi componente si aceeasi compunere
// ca pagina RO `/securitate` (decizia 53), cu textul in engleza. Constantele sunt tipate pe contractele structurale ale
// lui `PaginaSecuritate` si ale vederii verificarii din browser (felia 101), deci un camp lipsa sau in plus pica
// typecheck-ul.
//
// SURSA TEXTULUI, pe camp: fisa de continut a paginii, sectiunea "Component copy (decision 53)", cu cheia campului RO
// (de pilda `securitate.ts:47`) in comentariu. Textul nou e PROPUS, pana la aprobarea owner-ului pe capturi.
//
// CE NU INTRA, cu decizia: StocareProprie (d43), Criptare (d31), Acces (d43, d31), Originale (poarta juridica a
// deciziilor 40-41), Raportare (d31; afirmatia despre raportarea vulnerabilitatilor nu e confirmata) si Seiful
// (aceeasi poarta, d31; butonul lui duce la inregistrare, d3). Blocurile numerotate ramase se citesc 01-04. Pagina RO
// nu are bloc de final (seiful ii tine locul), deci nici pagina EN nu are unul.
// Verificarea din browser ramane (intrebarea 9, decizia 59), cu textul care spune ca masoara site-ul, nu platforma.
// `about.ts` ramane sursa pentru metadata, nodul WebPage si registrul de afirmatii.
//
// Modulul e numai date: il importa si invelitoarea client a verificarii (`VerificareBrowserEn`).

import type { ContinutPaginaSecuritate, SectiuneSecuritate } from "@/components/produs/PaginaSecuritate";
import type { ContinutVerificareBrowser } from "@/components/produs/VerificareBrowserVedere";

/** Sectiunile montate pe 3s.md, in ordinea componentei. */
export const SECTIUNI_DESPRE_EN: readonly SectiuneSecuritate[] = [
  "erou",
  "piloni",
  "infrastructura",
  "verificare",
  "ciclu",
  "reglementare",
  "intrebari",
];

/** Eticheta accesibila a firului (`FirPagina.tsx:63`). */
export const ETICHETA_FIR_DESPRE_EN = "Breadcrumb";

/** Numele accesibil al sectiunii de verificare (`PaginaSecuritate.tsx:94`). */
export const ETICHETA_VERIFICARE_EN = "Connection check in your browser";

/**
 * Ancorele paginii, tinte ale legaturilor de pe alte pagini EN si /ro: `security` (locul datelor, blocul de
 * infrastructura) si `limits` (ce e in beta sau inca indisponibil, in intrebari).
 */
export const ANCORE_DESPRE = { securitate: "security", limite: "limits" } as const;

/**
 * Sectiunile, impartite la ancore: pagina randeaza fiecare bucata cu `PaginaSecuritate`, cu marcajul ancorei inainte.
 * Reuniunea bucatilor, in ordine, e exact `SECTIUNI_DESPRE_EN` (o verifica proba feliei).
 */
export const BUCATI_DESPRE_EN: { ancora: string | null; sectiuni: readonly SectiuneSecuritate[] }[] = [
  { ancora: null, sectiuni: ["erou", "piloni"] },
  { ancora: ANCORE_DESPRE.securitate, sectiuni: ["infrastructura", "verificare", "ciclu", "reglementare"] },
  { ancora: ANCORE_DESPRE.limite, sectiuni: ["intrebari"] },
];

export const DESPRE_EN: ContinutPaginaSecuritate = {
  // securitate.ts:38-39.
  fir: [
    { text: "Home", cale: "/" },
    { text: "About", cale: "/about" },
  ],
  erou: {
    // securitate.ts:44, H1 aprobat.
    titlu: "About 3S: what it is, who runs it and where your data is",
    // securitate.ts:47, capsula aprobata scurtata la primele doua propozitii.
    subtitlu:
      "3S Scan Store Solve is a document archive with AI search, operated from Moldova. Files you upload are stored in the EU, with Frankfurt as the primary region, on Amazon Web Services, a US company.",
  },
  piloni: {
    // securitate.ts:52-73. Iconitele nu sugereaza protectie (d31).
    titlu: "Key facts about 3S",
    elemente: [
      {
        iconita: "arhiva",
        titlu: "An archive that answers",
        text: "3S keeps your company's documents and answers questions about them, showing the source of each answer.",
      },
      {
        iconita: "panou",
        titlu: "Operated from Moldova",
        text: "3S is run from Moldova; the Legal notice names the operating company.",
      },
      {
        iconita: "glob",
        titlu: "Frankfurt, in the EU",
        text: "The primary hosting region is Frankfurt, in the European Union.",
      },
      {
        iconita: "server",
        titlu: "Hosted by Amazon",
        text: "The platform runs on Amazon Web Services, a US company. US law (the CLOUD Act) can require it to disclose data in its care.",
      },
    ],
  },
  infrastructura: {
    // securitate.ts:80-111.
    numar: "01",
    titlu: "Where are my documents stored?",
    subtitlu:
      "Files you upload to 3S are stored in the EU, with Frankfurt as the primary region, on Amazon Web Services. The 3S platform, with its accounts, uploaded files and digital archive, runs there.",
    harta: {
      descriere: "Map of Europe with the primary hosting region, Frankfurt, in the EU.",
      eticheta: "Frankfurt",
      // Pozitia Frankfurtului (8,68 E / 50,11 N) in proiectia hartii (Lambert azimutala echivalenta, centru 10 E /
      // 50 N): scara si originea ajustate pe 8 puncte de tarm cunoscute ale conturului, cu eroarea medie sub 0,5 px;
      // aceeasi ajustare pune centrul Germaniei exact pe reperul RO (45,076 / 47,39).
      reper: { x: 43.017, y: 50.58 },
      legenda: "Frankfurt (EU)",
      nota: "Primary region: files you upload are stored here.",
    },
    specificatii: [
      { termen: "Hosting provider", valoare: "Amazon Web Services, which runs the 3S platform.", mono: null },
      { termen: "Data location", valoare: "In the EU, with Frankfurt as the primary region.", mono: null },
      { termen: "Provider headquarters", valoare: "The United States.", mono: null },
      { termen: "US law (CLOUD Act)", valoare: "Can require a US provider to disclose data in its care.", mono: null },
    ],
  },
  ciclu: {
    // securitate.ts:249-258; renumerotat (blocurile 02-04 ale RO nu se monteaza).
    numar: "02",
    titlu: "Each document has a clear path, from upload to disposal",
    subtitlu:
      "You set a retention date on each folder, and 3S shows a notice in the app before it arrives. That date is always your company's decision.",
    pasi: [
      { numar: "01", iconita: "incarcare", titlu: "Upload", text: "Files are uploaded from the browser, on a computer or a phone." },
      { numar: "02", iconita: "cilindru", titlu: "Store", text: "Stored in the EU, primary region Frankfurt." },
      { numar: "03", iconita: "arhiva", titlu: "Index", text: "Text read, tagged by document type and made searchable." },
      { numar: "04", iconita: "ceas", titlu: "Retain", text: "Kept until the retention date set on its folder." },
      { numar: "05", iconita: "iesire", titlu: "Dispose", text: "A notice appears in the app before the date you set." },
    ],
  },
  reglementare: {
    // securitate.ts:265-292. Legatura de partajare cu termen si exportul zip al originalelor nu au inca o intrare
    // confirmata in registrul de afirmatii EN, deci iese tot ce depinde de ele; din subtitlu (:268) iese partea
    // despre fisierele insesi (exportul). Sloturile lor (insignele :271 si :274, cardurile :287-292) iau fapte
    // confirmate, ca la Conformitate pe /platform: raspunsul cu sursa (en-comparatii-cautare-cu-sursa) si legea
    // americana (en-produs-amazon-sediu-sua). Jurnalul nu intra aici: pe /about ramane in afara lansarii (d31).
    // Numarul de sloturi ramane cel RO (6 insigne, 4 carduri). Text PROPUS, pana la aprobarea pe capturi.
    numar: "03",
    titlu: "What you can show an auditor or a client",
    subtitlu: "When an auditor or a client asks, you answer from 3S: where the files are stored and how long they stay.",
    insigne: [
      { marca: "EU", nume: "Frankfurt", nota: "primary region" },
      { marca: "AI", nume: "Answers", nota: "source cited" },
      { marca: "MD", nume: "Operator", nota: "run from Moldova" },
      { marca: "Amazon", nume: "Hosting", nota: "Web Services, EU" },
      { marca: "US", nume: "CLOUD Act", nota: "stated up front" },
      { marca: "Folder", nume: "Retention", nota: "date set by you" },
    ],
    carduri: [
      {
        titlu: "Data location, known in advance",
        text: "Files you upload are stored in the EU, with Frankfurt as the primary region, on Amazon Web Services. You know in advance where your company's documents are, and you can tell anyone who asks.",
      },
      {
        titlu: "Retention, set per folder",
        text: "You set a retention date on each folder, and it applies to every document in it. When someone asks how long a document is kept, the answer is on its folder in 3S.",
      },
      {
        titlu: "Answers, with their source",
        text: "Each answer from 3S cites the document it comes from. When a client or an auditor asks where a figure came from, you open that document and show it.",
      },
      {
        titlu: "US law, stated up front",
        text: "Amazon Web Services is a US company, and US law (the CLOUD Act) can require it to disclose data in its care. You can tell a client this before they ask.",
      },
    ],
  },
  intrebari: {
    // securitate.ts:349-380; renumerotat.
    numar: "04",
    titlu: "Common questions about 3S and your data",
    intrebari: [
      {
        intrebare: "Where are my documents stored?",
        raspuns:
          "In the EU, with Frankfurt as the primary region, on Amazon Web Services: the region marked on the map above. Where AI features process your documents is not stated on this site, so ask us before you send real documents.",
      },
      {
        intrebare: "Can US law reach my data?",
        raspuns:
          "US law (the CLOUD Act) can require a US provider such as Amazon to preserve and disclose data in its care, wherever its servers are. This is not legal advice.",
      },
      {
        intrebare: "Who runs 3S?",
        raspuns: "3S is operated from Moldova. The operating company's details are in the Legal notice.",
      },
      {
        intrebare: "What is in beta or not available yet?",
        raspuns:
          "English questions over Romanian documents, and citation down to the page, are in beta; questions in Romanian are supported. Qualified electronic signatures are not available yet.",
      },
      {
        intrebare: "Why are there no customer names or reviews?",
        raspuns:
          "This site does not publish customer names, numbers or reviews. Judge 3S by the sources in our guides and by a pilot on your own documents.",
      },
      {
        intrebare: "Who sets how long a document is kept?",
        raspuns:
          "The retention date is set by your company on the document's folder and applies to everything in it. 3S shows a notice in the app before that date.",
      },
    ],
  },
};

/** Verificarea conexiunii (securitate.ts:122-130): spune ca masoara acest site, nu platforma (intrebarea 9). */
export const VERIFICARE_EN: ContinutVerificareBrowser = {
  titlu: "This website's connection, measured in your browser",
  reia: "Measure again",
  chei: { server: "Server", criptare: "Encrypted connection", timp: "Response time" },
  asteptare: { server: "reading", criptare: "checking", timp: "measuring" },
  criptareDa: "Yes, HTTPS",
  criptareNu: "No, HTTP",
  indisponibil: "unavailable",
  nota: "Your browser sends three requests to the server of this website, not of the 3S platform; the time shown is their median, in milliseconds.",
};

/** Punctul de sanatate interogat de verificare: acelasi server care serveste pagina. */
export const CALE_SANATATE_EN = "/api/sanatate";
