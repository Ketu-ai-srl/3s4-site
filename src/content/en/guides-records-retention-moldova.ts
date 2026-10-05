// Pagina G2 a editiei `en`: termenele de pastrare a documentelor firmei in Republica Moldova (grupul referinta,
// poarta B), perechea verificatorului RO `/instrumente/termene-pastrare`.
//
// FORMA (decizia 53, felia editie-referinta): pagina compune componentele perechii RO, in aceeasi ordine
// (EroulInstrument, SelectorTari cu PanouTara, IesiriTermene, CtaFinalInchis), cu textul de aici. Intrebarea 5 a
// specificatiei de congruenta, varianta (a): acelasi instrument, in engleza. Iese panoul Romaniei (termenele
// romanesti nu stau pe ghidul EN) si iesirea spre tabelul de tiparit (subpagina nu exista pe 3s.md). Cele noua
// sectiuni-intrebare ale corpului aprobat raman in fisa, nu pe pagina.
//
// SURSA TEXTULUI: fisa de continut a paginii, sectiunea "Component copy (decision 53)" (campurile A, A-adaptat si
// G, cu cheile contractului RO); starea lui e PROPUS pana la aprobarea owner-ului pe capturi. Textul e ASCII, in
// engleza americana; numele actelor moldovenesti sunt traducerile noastre. Adresele surselor raman cele romanesti
// (registrul publica actele in romana).
//
// DATELE STRUCTURATE: nodul Article al fisei (`about` numai tara, citarile ca text: numele sursei si adresa ei) si
// nodul WebPage. Fara FAQPage: perechea RO n-are intrebari vizibile.
//
// POARTA B: articolele 228, 236, 257 si 262 ale Indicatorului se recitesc inainte de publicare; pana atunci
// intrarile termenelor din registru sunt `neconfirmat`.

import type { ContinutEroulInstrument } from "@/components/termene/EroulInstrument";
import type { ContinutPanouTara } from "@/components/termene/PanouTara";
import type {
  CodTip,
  IesireTermene,
  SursaPrimara,
  Tara,
} from "@/content/termene/date";
import {
  ETICHETA_FIR,
  FEREASTRA_NOUA,
  ctaFinal,
  type PaginaReferinta,
} from "./referinta-comun";

const CALE = "/guides/records-retention-moldova";

/** Ziua in care s-au recitit sursele pentru pagina EN. */
export const DATA_CITIRII_EN = "September 30, 2026";

/** Sursele faptelor paginii, citate in Article (numele si adresa). */
const SURSE_ARTICOL = {
  lege: {
    nume: "Law 287/2017 on accounting and financial reporting, article 17",
    url: "https://www.legis.md/cautare/getResults?doc_id=154725&lang=ro",
  },
  ordin: {
    nume: "Order 57/2016 of the State Archive Service, with the Instruction on applying the Indicator (current version)",
    url: "https://www.legis.md/cautare/getResults?doc_id=125078&lang=ro",
  },
  indicator: {
    nume: "The Indicator, annex to the current version of the Order",
    url: "https://www.legis.md/UserFiles/Image/RO/2016/mo247-255md/indicator_57.doc",
  },
} as const;

const META = {
  titlu: "How Long to Keep Company Records in Moldova (2026) | 3S",
  descriere:
    "Retention periods for invoices, registers, payroll, contracts and tax returns in Moldova, per Order 57/2016 and Law 287/2017, with the check date.",
  cale: CALE,
};

// Rol: titlul instrumentului (h1). H1-ul aprobat fara "(2026)"; anul ramane in titlul paginii.
const H1 = "How long to keep company records in Moldova";

export const EROU_EN: ContinutEroulInstrument = {
  fir: [
    { text: "Home", cale: "/" },
    { text: "Records retention in Moldova", cale: CALE },
  ],
  etichetaFir: ETICHETA_FIR,
  // Rol: eticheta-pastila; tarile cu date pe editie (numai Moldova).
  eticheta: "Republic of Moldova",
  titlu: H1,
  // Rol: raspunsul paginii, primul paragraf din <main> (capsula aprobata, scurtata la cutia RO).
  subtitlu:
    "In Moldova, invoices and other primary documents are kept for 6 years, counted from January 1 of the year after the file is closed. Registers take 6 years, contracts 6 years after they end, and income tax returns 7. A dispute extends the term for invoices and registers until the final judgment.",
};

export const INSTRUMENT_EN = {
  // Numele accesibil al sectiunii instrumentului.
  etichetaSectiune: "Terms by type of record",
  // Numele accesibil al grupului de pastile.
  etichetaSelector: "Country",
};

const NUME_TIPURI: Record<CodTip, string> = {
  facturi: "Purchase and sales invoices",
  registre: "Accounting: registers and annual statements",
  state: "Payroll statements",
  personal: "Personnel files",
  declaratii: "Tax returns and supporting documents",
  contracte: "Company contracts",
  extrase: "Bank statements, payment orders and receipts",
};

export const PANOU_EN: ContinutPanouTara = {
  contor: (confirmate, total) =>
    "Term confirmed for " + confirmate + " of " + total + " record types",
  neconfirmat: "Unconfirmed",
  etichete: {
    inceput: "Counted from",
    temei: "Legal basis",
    motiv: "Why there is no figure",
  },
  // Nota numeste actele citite (Law 287/2017 si Order 57/2016): sunt entitatile raspunsului (G-AI-02) si trebuie
  // sa stea in textul VIZIBIL, fiindca temeiurile randurilor sunt pliate. Text PROPUS, abatere de la fisa: actele in
  // locul formulei "the legal texts".
  nota:
    "We read Law 287/2017 and Order 57/2016 with its Indicator on " +
    DATA_CITIRII_EN +
    ", on legis.md, the State Register of Legal Acts. The term does not run from the date of the document: each confirmed row says when counting starts. A new law can change any figure. Other laws, such as tax, customs, labor or sector rules, can set longer periods for specific documents. This guide is not legal advice. Check your case with your adviser.",
  numeTip: (cod) => NUME_TIPURI[cod],
  fereastraNoua: FEREASTRA_NOUA,
};

const LEGEA_287_2017: SursaPrimara = {
  eticheta: "Law 287/2017, in the State Register of Legal Acts",
  url: "https://www.legis.md/cautare/getResults?doc_id=154725&lang=ro",
};

const INDICATOR_57_2016: SursaPrimara = {
  eticheta:
    "Order 57/2016 and the Indicator of standard documents, in the State Register of Legal Acts",
  url: "https://www.legis.md/cautare/getResults?doc_id=125078&lang=ro",
};

const INCEPUT_PCT_2_11 =
  "January 1 of the year after the file is closed (Instruction on applying the Indicator, point 2.11).";

export const MOLDOVA_EN: Tara = {
  cod: "md",
  nume: "Republic of Moldova",
  randuri: [
    {
      tip: "facturi",
      valoare: "6 years",
      inceput: INCEPUT_PCT_2_11,
      temei:
        "Law 287/2017 on accounting and financial reporting, article 17(1): accounting documents are kept for the terms set by the archives authority. The Indicator of standard documents, approved by Order 57/2016 of the State Archive Service, article 228: primary documents, including invoices and tax invoices, are kept for 6 years; if a dispute arises, until the final and irrevocable judgment.",
      surse: [LEGEA_287_2017, INDICATOR_57_2016],
    },
    {
      tip: "registre",
      valoare: null,
      motiv:
        "This row has two terms, and one of them is missing. Accounting registers (general ledger, trial balance) are kept for 6 years (Indicator, article 236). For annual financial statements, the Indicator requires permanent keeping in organizations that are sources for the Archive Fund and gives no term in the column for other organizations (article 224). Before you dispose of financial statements, ask the National Archives Agency.",
      surse: [INDICATOR_57_2016, LEGEA_287_2017],
    },
    {
      tip: "state",
      valoare: "6-75 years",
      inceput: INCEPUT_PCT_2_11,
      temei:
        "Indicator, article 231: salary payment statements are kept for 6 years, or for 75 years if the company keeps no analytical account for each employee. Analytical accounts of employees (settlement registers) are kept for 75 years minus the employee's age when the file is closed (article 230 and Instruction, point 2.11).",
      surse: [INDICATOR_57_2016],
    },
    {
      tip: "personal",
      valoare: "75 years minus age",
      inceput:
        'From the date the file is closed; for "75 years-V", the term depends on the person\'s age on that date (Instruction, point 2.11).',
      temei:
        "Indicator, article 429(d): personnel files of workers and of technical or engineering staff (applications, individual employment contracts, hiring and termination orders, job descriptions) are kept for \"75 years-V\", that is, 75 years minus the person's age when the file is closed. For someone who left at 40, the file is kept for 35 years. The note to the article sets shorter terms for some documents in a personnel file, such as medical certificates and other secondary documents: 3 years after dismissal. It also sets terms for some pensioners' files. Read the note before you dispose of any personnel file.",
      surse: [INDICATOR_57_2016],
    },
    {
      tip: "declaratii",
      valoare: "6-7 years",
      inceput: INCEPUT_PCT_2_11,
      temei:
        "Indicator, article 262: income tax returns of entities are kept for 7 years, and the primary documents that support them for 6 years (article 228). We found no separate article in the Indicator for other tax returns.",
      surse: [INDICATOR_57_2016],
    },
    {
      tip: "contracte",
      valoare: "6 years",
      inceput:
        "After the contract term expires or its clauses are performed (Indicator, note to article 257).",
      temei:
        "Indicator, article 257: economic, purchasing, operations and service contracts and agreements are kept for 6 years after they expire or are performed; contracts on foreign-currency transactions, 7 years.",
      surse: [INDICATOR_57_2016],
    },
    {
      tip: "extrase",
      valoare: "6 years",
      inceput: INCEPUT_PCT_2_11,
      temei:
        "Indicator, article 228: bank documents are primary documents and are kept for 6 years; if a dispute arises, until the final and irrevocable judgment.",
      surse: [INDICATOR_57_2016, LEGEA_287_2017],
    },
  ],
};

/** Tarile editiei, in ordinea pastilelor: numai Moldova. */
export const TARI_EN: readonly Tara[] = [MOLDOVA_EN];

// Rol: iesirile de sub panou. Tabelul de tiparit iese (subpagina nu exista pe 3s.md); securitatea e ancora paginii
// About, iar e-facturarea e perechea G1.
export const IESIRI_EN: IesireTermene[] = [
  {
    text: "Where 3S stores your documents",
    href: "/about#security",
    ruta: "/about",
    iconita: "arrow-right",
  },
  {
    text: "E-invoice archiving in the EU",
    href: "/guides/e-invoice-archiving-eu",
    ruta: "/guides/e-invoice-archiving-eu",
    iconita: "arrow-right",
  },
];

export const CTA_FINAL_EN = ctaFinal(
  "Need this for your own archive?",
  "Tell us what you keep, in which language and roughly how much.",
);

export const pagina: PaginaReferinta = {
  cheie: "guides-records-retention-moldova",
  meta: META,
  h1: H1,
  cta: {
    ref: "en-ret-md",
    textWhatsapp:
      "Hello 3S, I read your page on record retention in Moldova [ref:en-ret-md]. I would like to ask about a pilot.",
    subiectEmail: "3S inquiry [ref:en-ret-md]",
  },
  jsonLd: [
    {
      "@type": "Article",
      headline: H1,
      description: META.descriere,
      inLanguage: "en",
      datePublished: "2026-09-30",
      dateModified: "2026-09-30",
      isAccessibleForFree: true,
      about: [{ "@type": "Country", name: "Moldova" }],
      citation: Object.values(SURSE_ARTICOL).map((s) => s.nume + ", " + s.url),
    },
    {
      "@type": "WebPage",
      name: META.titlu,
      description: META.descriere,
      inLanguage: "en",
    },
  ],
  // Registrul `en-referinta.json` ramane neschimbat (felia en-referinta): intrarile lui numesc modulul in `unde`.
  afirmatii: [
    "en-referinta-termene-md-facturi-6-ani",
    "en-referinta-termene-md-extrase-6-ani",
    "en-referinta-termene-md-registre-6-ani-situatii-nedefinite",
    "en-referinta-termene-md-mijloace-fixe-6-ani",
    "en-referinta-termene-md-state-6-75-ani",
    "en-referinta-termene-md-personal-75-minus-varsta",
    "en-referinta-termene-md-contracte-6-ani",
    "en-referinta-termene-md-declaratii-6-7-ani",
    "en-referinta-termene-md-doua-coloane",
    "en-referinta-termene-md-lege-287-art-17",
    "en-referinta-termene-md-distrugere",
    "en-referinta-termene-md-istoric-5-ani",
    "en-referinta-termene-md-zece-ani",
    "en-referinta-termene-md-lege-86-2026",
    "en-referinta-comparatii-registru-termene",
    "en-ghiduri-cu-surse",
  ],
};
