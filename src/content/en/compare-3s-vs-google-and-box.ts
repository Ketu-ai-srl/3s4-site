// Pagina G3 a editiei `en`: comparatia 3S cu Gemini Notebook, Gemini in Google Drive si Box AI (grupul referinta,
// poarta B).
//
// SURSA: fisa de continut a paginii (front matter si corpul pana la marcajul de sfarsit al textului paginii), in
// forma de dupa deciziile 38, 40-43 si 49 ale owner-ului. Numirea produselor Google si Box e decizia 11 (30.09):
// fiecare celula a unui furnizor se termina cu etichetele surselor ei (S1-S19), iar tabelul surselor da legatura si
// data citirii. Coloana 3S e declaratia noastra. Liniile de constructie ale fisei devin `cta` si `inJur`; notele
// fisei si blocul propus de date structurate in forma lui bruta nu intra aici. Textul e ASCII, in engleza americana;
// numele produselor si titlurile surselor raman cum le scriu proprietarii lor.
//
// CERTIFICARILE. Randul "Certifications the vendor names" numeste certificarile pe care le declara Google si Box,
// atribuite lor, cu sursa si data (decizia 11). Celula 3S nu numeste niciuna: o cere proba paginii
// (`tests/en-referinta.test.ts`), iar poarta de afirmatii are pentru fisierul asta o exceptie ingusta, numai pe
// tiparul certificarilor.
//
// DATELE STRUCTURATE: nodul Article al fisei, fara `about` si fara `mentions`: tipurile lor nu sunt in vocabularul
// inchis al portii de SEO, iar `SoftwareApplication` ar cere acolo un `@id` unic pe tot site-ul, rezervat aplicatiei
// 3S. Citarile sunt text (numele sursei si adresa ei), din aceeasi lista cu tabelul surselor.
//
// POARTA B: fiecare celula a unui furnizor se reciteste la sursa inainte de publicare; pana atunci intrarile
// furnizorilor din registru sunt `neconfirmat`.

import type { PaginaContinut } from "@/content/model/tipuri";

const CITIT = "September 30, 2026";

/** Sursele furnizorilor, cu eticheta din celule (S1-S19): tabelul surselor si citarile din Article. */
const SURSE: readonly { eticheta: string; nume: string; url: string; folosit: string }[] = [
  {
    eticheta: "S1",
    nume: 'Google blog, "NotebookLM is now Gemini Notebook" (July 16, 2026)',
    url: "https://blog.google/innovation-and-ai/products/gemini-notebook/notebooklm-gemini-notebook/",
    folosit: 'The renaming and "the same standalone product"',
  },
  {
    eticheta: "S2",
    nume: "Google Workspace, Google Drive product page",
    url: "https://workspace.google.com/products/drive/",
    folosit: "Gemini in Drive, sharing, encryption, e-signatures, marketplace",
  },
  {
    eticheta: "S3",
    nume: "Google Workspace, pricing",
    url: "https://workspace.google.com/pricing",
    folosit: "Plans, per-user pricing, Gemini in Drive by plan, 14-day trial",
  },
  {
    eticheta: "S4",
    nume: "Google Workspace, Gemini Notebook product page",
    url: "https://workspace.google.com/products/gemini-notebook/",
    folosit: "Source types, source size, Workspace access, sharing",
  },
  {
    eticheta: "S5",
    nume: 'Gemini Notebook Help, "Learn about Gemini Notebook"',
    url: "https://support.google.com/gemininotebook/answer/16164461?hl=en",
    folosit: "In-line citations, 80+ languages",
  },
  {
    eticheta: "S6",
    nume: 'Gemini Notebook Help, "Frequently asked questions"',
    url: "https://support.google.com/gemininotebook/answer/16269187?hl=en",
    folosit: "Source size limit, short sources and citations",
  },
  {
    eticheta: "S7",
    nume: 'Gemini Notebook Help, "Upgrade Gemini Notebook"',
    url: "https://support.google.com/gemininotebook/answer/16213268?hl=en",
    folosit: "Limits by plan, free standard access, Google Cloud data handling",
  },
  {
    eticheta: "S8",
    nume: 'Gemini Notebook Help, "Use Gemini Notebook with a work or school Google account"',
    url: "https://support.google.com/gemininotebook/answer/16337734?hl=en",
    folosit: "Limits by Workspace edition",
  },
  {
    eticheta: "S9",
    nume: 'Google Workspace Admin Help, "Data covered by data regions"',
    url: "https://knowledge.workspace.google.com/admin/compliance/data-covered-by-data-regions?hl=en",
    folosit: "Services and data types covered",
  },
  {
    eticheta: "S10",
    nume: 'Google Workspace Admin Help, "Choose a geographic location for your data"',
    url: "https://knowledge.workspace.google.com/admin/compliance/choose-a-geographic-location-for-your-data?hl=en",
    folosit: "Regions and supported editions",
  },
  {
    eticheta: "S11",
    nume: "Google Cloud, ISO/IEC 27001 compliance",
    url: "https://cloud.google.com/security/compliance/iso-27001",
    folosit: "Services in scope",
  },
  {
    eticheta: "S12",
    nume: "Google Cloud, SOC 2 compliance",
    url: "https://cloud.google.com/security/compliance/soc-2",
    folosit: "Services in scope",
  },
  {
    eticheta: "S13",
    nume: "Box, Box AI",
    url: "https://www.box.com/ai",
    folosit: "What Box AI does; single and multi-document questions",
  },
  {
    eticheta: "S14",
    nume: "Box, Box Hubs",
    url: "https://www.box.com/hubs",
    folosit: "Content portals, answers with citations",
  },
  {
    eticheta: "S15",
    nume: "Box, pricing",
    url: "https://www.box.com/pricing",
    folosit: "Plans, per-user pricing, AI units, Hubs, integrations, e-signatures, compliance support",
  },
  {
    eticheta: "S16",
    nume: "Box, security and governance",
    url: "https://www.box.com/security-compliance",
    folosit: "Standards named, KeySafe",
  },
  {
    eticheta: "S17",
    nume: "Box, Box Zones",
    url: "https://www.box.com/zones",
    folosit: "Regional storage, 10 regions",
  },
  {
    eticheta: "S18",
    nume: 'Box Docs, "Box AI for Documents" (page last modified September 22, 2026)',
    url: "https://docs.box.com/en/box-ai/getting-started/box-ai-for-documents",
    folosit: "Plan availability, 10-file limit, hub limit, citations, text size limit",
  },
  {
    eticheta: "S19",
    nume: 'Box developer guide, "Ask questions to Box AI"',
    url: "https://developer.box.com/guides/box-ai/ai-tutorials/ask-questions",
    folosit: "The include_citations parameter",
  },
];

/** Antetul celor trei tabele de comparatie: criteriul, apoi 3S si cei trei furnizori. */
const ANTET_COMPARATIE = ["Criterion", "3S", "Gemini in Google Drive", "Gemini Notebook", "Box AI"];

const CITITE_TOATE = "All rows in this table were read on September 30, 2026.";

const META = {
  titlu: "3S vs Gemini Notebook, Gemini in Drive and Box AI",
  descriere:
    "How 3S compares with Gemini Notebook (formerly NotebookLM), Gemini in Google Drive and Box AI, and when not to choose 3S. Each row has a source and date.",
  cale: "/compare/3s-vs-google-and-box",
};

const H1 = "3S compared with Gemini Notebook, Gemini in Google Drive and Box AI";

export const pagina: PaginaContinut = {
  cheie: "compare-3s-vs-google-and-box",
  meta: META,
  h1: H1,
  capsula:
    "Which tool fits depends on where your documents live. If they already sit in Google Workspace or Box, try Gemini in Google Drive, Gemini Notebook (formerly NotebookLM) or Box AI first. Choose 3S for an assisted pilot on your own documents. Need named certifications? Ask us where we stand first.",
  sectiuni: [
    {
      cheie: "notebooklm",
      titlu: "Is Gemini Notebook the same product as NotebookLM?",
      blocuri: [
        {
          paragrafe: [
            "Yes. On July 16, 2026, Google renamed NotebookLM to Gemini Notebook and called it the same standalone product (S1). Some Google pages still use the old name: the compliance pages we read list NotebookLM (S11, S12). This page uses the new name and gives the old one in parentheses.",
            "Gemini Notebook answers questions from the sources you add to a notebook: Google Docs and Slides, PDFs, text files, web pages, videos and audio (S4, S5). Each source can hold up to 500,000 words or 200 MB (S6).",
          ],
        },
      ],
    },
    {
      cheie: "which-tool",
      titlu: "Which tool fits which archive?",
      blocuri: [
        {
          paragrafe: [
            "Start where your documents already are. If they sit in Google Drive or Box, try the AI built into that product first, because it already works on your files. The table gives one starting point for each situation and what the purchase needs.",
          ],
          tabel: {
            forma: "cu-antet",
            titlu: "Which tool to try first for each situation",
            antet: ["Your situation", "Try first", "What the purchase needs"],
            randuri: [
              [
                "Your files are in Google Drive and your staff ask the questions",
                "Gemini in Google Drive",
                "A Workspace plan that includes it: Google's pricing page lists it on Standard, Plus and Enterprise, and not on Starter (S3)",
              ],
              [
                "You have a defined set of sources for one question or one project",
                "Gemini Notebook",
                "A Google account. Standard access is free of charge, and a Workspace or Google AI plan raises the limits (S4, S7)",
              ],
              [
                "Your files are in Box",
                "Box AI",
                "A Box plan from Business for questions on one file. Questions across several files need Enterprise Plus or above (S15, S18)",
              ],
              [
                "You want to start on a sample of your own documents, with help on the first ones",
                "3S",
                "A free 30-day assisted pilot on a sample of your documents. Indicative prices per company in euros, excluding VAT, from EUR 90 a month (see [pricing](/pricing))",
              ],
            ],
          },
          dupa: [
            "All rows in this table were read on September 30, 2026. Each vendor cell ends with the tags of its sources, listed with their links at the end of the page.",
          ],
        },
      ],
    },
    {
      cheie: "how-compare",
      titlu: "How do they compare?",
      blocuri: [
        {
          paragrafe: [
            'The four tools differ most in where your documents must live, how much you can ask across at once, and who can reach the answers. Each vendor cell is the vendor\'s own statement, tagged with its source. "Not stated on the pages we read" means we did not find it, not that the vendor lacks it.',
          ],
        },
      ],
    },
    {
      cheie: "what-for",
      titlu: "What each tool is for and how it answers",
      nivel: 3,
      blocuri: [
        {
          paragrafe: [],
          tabel: {
            forma: "cu-antet",
            titlu: "What each tool is for and how it answers",
            antet: ANTET_COMPARATIE,
            randuri: [
              [
                "Built for",
                "A document archive with AI search.",
                "Finding, summarizing and analyzing files in Google Drive (S2, S3).",
                "Answering questions from the sources you add to a notebook (S4, S5).",
                "Questions on one file, on several files or on a hub of content stored in Box (S13, S18).",
              ],
              [
                "Answers show their source",
                "Yes: 3S cites the source of each answer. Citation down to the page is in pilot. See [search with sources](/features/search).",
                "Google's page says AI Overviews give cited answers, and Ask Gemini gives answers grounded in your content (S2).",
                "Yes: in-line citations to your sources (S5). A very short source is referenced as a whole, without a cited passage (S6).",
                "Citations appear in Box AI for Documents, where you hover to see the source text, and the API can return them (S18, S19). Box says answers in Hubs come with citations (S14).",
              ],
              [
                "How much you can ask across at once",
                "Searches the content of the archive's documents. Volume limits: not stated on this site; ask us.",
                "Volume limits: not stated on the pages we read (S2, S3). Content across Drive and other Workspace apps, inside Drive projects you control (S2).",
                "50 sources per notebook on standard access, up to 600 on the highest tier. Each source up to 500,000 words or 200 MB. Google says limits are subject to change (S6, S7, S8).",
                "Up to 10 files in one question, from Enterprise Plus. Up to 20,000 files in a hub. Text is processed up to 2 MB per file: for larger files, only the first 2 MB (S18).",
              ],
            ],
          },
          dupa: [CITITE_TOATE],
        },
      ],
    },
    {
      cheie: "where-cost",
      titlu: "Where your files live, and what it costs",
      nivel: 3,
      blocuri: [
        {
          paragrafe: [],
          tabel: {
            forma: "cu-antet",
            titlu: "Where your files live, and what it costs",
            antet: ANTET_COMPARATIE,
            randuri: [
              [
                "Where files are stored",
                "In the EU, with Frankfurt as the primary region. See the [About page](/about#security). Where the AI features process documents is not stated on this site: ask us.",
                "In Drive. The data-region policy of the file's creator sets the region: United States, European Union or no preference. Regions apply on supported editions, which include Business Standard and Plus (S9, S10).",
                "Not stated on the Notebook pages we read (S4 to S8). Google's data-regions page lists Drive and Google Workspace with Gemini, and does not list Gemini Notebook (S9). Through Google Cloud, Google says uploaded files stay in your Google Cloud project and regionalization is honored (S7).",
                "Box Zones, which has its own page and price, lets admins choose the region for stored content across 10 regions (S17). Where Box AI processes content: not stated on the pages we read.",
              ],
              [
                "Storage you control",
                "Not stated on this site. Ask us.",
                "Files are stored in Google Drive. Client-side encryption is offered on some Business and Enterprise plans (S2).",
                "Own-storage option: not stated on the pages we read (S4 to S8).",
                "Box KeySafe lets you hold your own encryption keys (S16). Own-storage option: not stated on the pages we read.",
              ],
              [
                "Certifications the vendor names",
                "None stated on this site. Tell us what your auditor or bank requires, and we will say plainly whether we meet it.",
                "Google's ISO/IEC 27001 and SOC 2 pages list Google Drive and Gemini in Workspace among the Google Workspace services in scope (S11, S12).",
                "The same two pages list NotebookLM, the earlier name, among the Workspace services (S11, S12).",
                "Box's security page names GDPR, GxP validation, HIPAA, ITAR, PCI DSS, ISMAP and FedRAMP (S16). Its pricing page lists SOC 1/2/3 compliance support and, on Enterprise plans, FedRAMP Moderate and HIPAA (S15).",
              ],
              [
                "Pricing model",
                "Per company, not per user: Starter EUR 90, Pro EUR 150 and Business EUR 240 a month for 5, 10 and 20 accounts, Enterprise from EUR 800 a month, excluding VAT; two months free on annual billing. Indicative; see [pricing](/pricing).",
                "Per user per month by plan. Gemini in Drive is not on Starter. Enterprise pricing is on request (S3).",
                "Included with a Google Workspace account, with higher limits on qualifying plans. Standard access is free with a Google account (S4, S7).",
                "Per user per month, minimum 3 users. Box AI is part of the plans, and Enterprise plans list a monthly allowance of AI units (S15).",
              ],
            ],
          },
          dupa: [CITITE_TOATE],
        },
      ],
    },
    {
      cheie: "who-reaches",
      titlu: "Who can reach the answers",
      nivel: 3,
      blocuri: [
        {
          paragrafe: [],
          tabel: {
            forma: "cu-antet",
            titlu: "Who can reach the answers",
            antet: ANTET_COMPARATIE,
            randuri: [
              [
                "Client portal",
                "Not stated on this site. Ask us.",
                "Not stated on the pages we read. The Drive page describes sharing permissions and shared drives (S2).",
                "Not stated on the pages we read. A notebook can be shared with other people (S4).",
                "Box Hubs are described as content portals for teams and lines of business (S14). The pricing page lists Hubs from the Enterprise plan (S15).",
              ],
            ],
          },
          dupa: [CITITE_TOATE],
        },
      ],
    },
    {
      cheie: "when-not",
      titlu: "When should you not choose 3S?",
      blocuri: [
        {
          paragrafe: [
            "Do not choose 3S first if you need one of the things below. Google and Box already cover some of them, and we would rather you check them before you talk to us.",
          ],
          lista: {
            elemente: [
              "**You need named certifications today:** 3S names none on this site, while Google and Box name theirs, as the table shows. Tell us what your auditor or bank requires, and we will say plainly whether we meet it.",
              "**You need many ready-made integrations:** Box's pricing page lists 1,500+ integrations (S15), and Google lists a marketplace of apps and partner integrations (S2). This site names no integrations for 3S, so ask us about the tools you use.",
              "**You need electronic signatures inside the archive:** Box's plans list unlimited e-sign requests (S15), and Google lists electronic signatures on some Business and Enterprise plans (S2). Neither page says whether those signatures are qualified. On our side, qualified electronic signature is not available through 3S today, because the integration with accredited providers is in progress.",
              "**You want public customer references first:** 3S does not publish customer names, numbers or reviews. The pilot is how you judge it, with your documents and your questions.",
              "**You need service levels in writing:** none are stated on this site, so tell us what you need.",
            ],
          },
        },
      ],
    },
    {
      cheie: "when-fits",
      titlu: "When does 3S fit?",
      blocuri: [
        {
          paragrafe: ["3S is a good fit if any of these apply to you."],
          lista: {
            elemente: [
              "**You want to start on a sample:** every start is an assisted pilot on a sample of your documents, and you check the answers and their sources with us before you decide.",
              "**You receive e-invoices:** you can download them as XML files from RO e-Factura and upload them to the archive (see [E-invoice archiving in the EU](/guides/e-invoice-archiving-eu)).",
            ],
          },
          dupa: ["For how search with a cited source works in 3S, see [search with sources](/features/search)."],
        },
      ],
    },
    {
      cheie: "test-fairly",
      titlu: "How do you test fairly?",
      blocuri: [
        {
          paragrafe: ["Use the same documents and the same questions in every tool, and check the sources yourself."],
          lista: {
            numerotata: true,
            elemente: [
              "Pick 10 documents whose contents you already know: a contract, an invoice, a poor scan, a table, a document in a second language.",
              "Write 10 questions with known answers, including two whose answer is not in the documents.",
              "Ask every tool the same 10 questions on the same 10 documents.",
              "Open each cited source and check that it supports the answer.",
              'Score each answer as correct, partly correct, wrong or "no answer", and note how long you waited.',
              "Repeat with your real volume. Some tools limit how many files or sources one question can cover.",
            ],
          },
          dupa: [
            "We do not publish benchmark scores, and you should not trust anyone's without running your own. Google's pricing page lists a 14-day trial of Workspace, and Box's pricing page lists a trial (S3, S15). For 3S, the pilot is the test: see [how a pilot works](/pricing#pilot).",
          ],
        },
      ],
    },
    {
      cheie: "sources",
      titlu: "Where do these facts come from?",
      blocuri: [
        {
          paragrafe: [
            "Every vendor cell comes from the pages below, read on September 30, 2026. We paraphrase each vendor and show no logos. Product names belong to their owners.",
          ],
          tabel: {
            forma: "cu-antet",
            titlu: "Vendor pages behind each tag and the date we read them",
            antet: ["Tag", "Source", "What we used", "Read on"],
            randuri: SURSE.map((s) => [s.eticheta, "[" + s.nume + "](" + s.url + ")", s.folosit, CITIT]),
          },
          dupa: ["Vendors change plans, limits and prices often. We review this page every month. Next check: by October 31, 2026."],
        },
      ],
    },
  ],
  cta: {
    ref: "en-vs",
    titluBloc: "Not sure whether 3S fits? Ask us.",
    textWhatsapp: "Hello 3S, I read your comparison with Google and Box AI [ref:en-vs]. I would like to ask whether 3S fits our case.",
    subiectEmail: "3S inquiry [ref:en-vs]",
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
      citation: SURSE.map((s) => s.nume + ", " + s.url),
    },
    {
      "@type": "WebPage",
      name: META.titlu,
      description: META.descriere,
      inLanguage: "en",
    },
  ],
  afirmatii: [
    "en-referinta-comparatii-publicitate-comparativa",
    "en-referinta-comparatii-marcaje-gemini-notebook",
    "en-referinta-comparatii-marcaje-gemini-drive",
    "en-referinta-comparatii-marcaje-box-ai",
    "en-referinta-comparatii-nespuse-pe-site",
    "en-referinta-efacturare-canale-3s",
    "en-comparatii-cautare-cu-sursa",
    "en-pagina-si-engleza-in-pilot",
    "en-gazduire-ue-frankfurt",
    "en-pret-orientativ-eur",
    "en-pilot-asistat",
    "en-cinema2-semnatura-in-curs",
    "en-ghiduri-cu-surse",
  ],
};

/** Ce pune pagina in jurul corpului: firul, randul cu data verificarii, legatura de semnalare si blocul de final. */
export const inJur = {
  fir: [
    { text: "Home", cale: "/" },
    { text: "3S vs Google and Box AI", cale: "/compare/3s-vs-google-and-box" },
  ],
  etichetaFir: "Breadcrumb",
  microtext: "A person replies, in English or Romanian. No form, no account.",
  inainteDeEmail: "Or write to",
  verificare:
    "**Last verified: September 30, 2026.** We read each vendor's own pages. Every vendor cell in the tables below ends with the tags of its sources, and the list at the end gives each link and the date we read it. The 3S column is our own statement. 3S wrote this page and is not affiliated with Google or Box.",
  semnalare: {
    text: "Tell us if something is out of date",
    textWhatsapp: "Hello 3S, a row on the comparison page looks out of date [ref:en-vs].",
  },
  final: {
    paragrafe: [
      "Tell us what you keep, where it lives today and what you want to ask it. We will say plainly whether 3S fits, and if it does not, which tool on this page to try first.",
    ],
    veziSi: "Please do not send documents or personal data in your first message. Prefer another channel? See [Contact](/contact).",
  },
};
