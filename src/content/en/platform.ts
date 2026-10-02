// Pagina platformei, editia `en` (P02, `/platform`), transcrisa din fisa ei de continut, pana la sectiunea de
// resurse nepublicate.
//
// CE NU INTRA, cu motivul:
//   - sectiunile despre dispozitive, portal, reguli, conexiuni si stocare proprie (`#devices`, `#portal`, `#rules`,
//     `#integrations`): decizia 43, functiile nu sunt in codul platformei; fisele paginilor de functie nu se mai
//     pliaza aici;
//   - primirea pe e-mail ca intrare de documente: scoasa de dispecer pe aceeasi regula (codul nu are casuta de
//     primire). Linia "In" a figurii din fisa o mai numea; aici urmeaza textul alternativ al figurii si corpul;
//   - fraza despre hartie din "How do documents get into 3S?": poarta juridica a deciziei 40 (rezerva prin
//     omisiune, pana la rescrierea textelor juridice de catre jurist);
//   - primirea pe WhatsApp, in capsula, in prima sectiune si in figura: decizia 49 (asistentul pe WhatsApp nu
//     exista in platforma). Capsula numeste in locul ei fisierele deja scanate, ca in fisa; WhatsApp ramane numai
//     canalul de contact cu un om (butoanele si textul precompletat).
//
// Figura (drumul unui document) se scrie ca tabel cheie-valoare in prima sectiune, fara titlu nou: liniile ei
// sunt cele din fisa, fara e-mail.

import { iduri } from "@/components/seo/date-structurate";
import type { PaginaContinut } from "@/content/model/tipuri";
import { adresaSite } from "@/lib/site";
import type { FinalPagina } from "./home";

const BAZA = adresaSite();
const ID = iduri(BAZA);

export const pagina: PaginaContinut = {
  cheie: "platform",
  meta: {
    titlu: "3S Platform: A Document Archive That Answers With Sources",
    descriere:
      "See how 3S takes in documents, keeps an archive register and answers questions with the source shown. Hosted in the EU (Frankfurt).",
    cale: "/platform",
  },
  h1: "The 3S platform: documents in, cited answers out",
  capsula:
    "The 3S platform takes in the documents you upload from the browser, including files you already have as scans. It recognizes each one, logs who opens it and keeps the archive register. Then you ask questions, and each answer shows the source it came from.",
  sectiuni: [
    {
      cheie: "documents-in",
      titlu: "How do documents get into 3S?",
      blocuri: [
        {
          paragrafe: [
            "Documents arrive by upload from the browser. Files you already have as scans go straight into the platform.",
          ],
        },
        {
          paragrafe: [],
          tabel: {
            forma: "cheie-valoare",
            titlu: "The path of a document through 3S",
            randuri: [
              ["In", "Upload from the browser, including files already scanned."],
              ["In 3S", "Recognize, log who opens each document, keep the archive register."],
              ["Out", "Answers with the source, export."],
            ],
          },
        },
      ],
    },
    {
      cheie: "retention",
      titlu: "Does 3S record how long each document is kept?",
      blocuri: [
        {
          paragrafe: [
            "Yes. 3S keeps the archive register, with a retention period for each document. Retention rules differ from country to country, so our guides give the primary source and the check date for [Moldova](/guides/records-retention-moldova) and for [e-invoices in the EU](/guides/e-invoice-archiving-eu).",
          ],
        },
      ],
    },
    {
      cheie: "find",
      titlu: "How do I find something?",
      blocuri: [
        {
          paragrafe: [
            "Ask a question in plain words. 3S searches the content of your documents with AI and cites the source of each answer, so you can check it. Questions in Romanian are supported; English questions over Romanian documents are in pilot. [Search with sources](/features/search) shows how it works.",
          ],
        },
      ],
    },
    {
      cheie: "access",
      titlu: "Who can see what?",
      blocuri: [
        {
          paragrafe: [
            "For rules on who inside your organization sees which documents, tell us what you need in your first message, and we will tell you what 3S does today.",
          ],
        },
      ],
    },
    {
      cheie: "where-3s-runs",
      titlu: "Where does 3S run?",
      blocuri: [
        {
          paragrafe: [
            "3S runs in the EU, with Frankfurt as the primary region. The [About page](/about#security) names the hosting provider and explains what US law says about data held by a US company.",
          ],
        },
      ],
    },
  ],
  cta: {
    ref: "en-platform",
    titluBloc: "See how it would work with your documents",
    textWhatsapp: "Hello 3S, I read your page on the platform [ref:en-platform]. I would like to ask how it would work with our documents.",
    subiectEmail: "3S inquiry [ref:en-platform]",
  },
  jsonLd: [
    {
      "@type": "WebPage",
      "@id": BAZA + "/platform#webpage",
      url: BAZA + "/platform",
      name: "3S Platform: A Document Archive That Answers With Sources",
      description:
        "See how 3S takes in documents, keeps an archive register and answers questions with the source shown. Hosted in the EU (Frankfurt).",
      inLanguage: "en",
      isPartOf: { "@id": ID.site },
      about: { "@id": ID.organizatie },
      breadcrumb: { "@id": BAZA + "/platform#breadcrumb" },
    },
    {
      "@type": "BreadcrumbList",
      "@id": BAZA + "/platform#breadcrumb",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: BAZA + "/" },
        { "@type": "ListItem", position: 2, name: "Platform", item: BAZA + "/platform" },
      ],
    },
  ],
  afirmatii: [
    "en-flux-functii-in-productie",
    "en-comparatii-registru-termene",
    "en-acasa-trei-pasi-scan-store-solve",
    "en-enterprise-functii-in-productie",
    "en-produs-functii-in-productie",
    "en-pagina-si-engleza-in-pilot",
    "en-ghiduri-cu-surse",
    "en-gazduire-ue-frankfurt",
    "en-pilot-asistat",
    "en-produs-amazon-sediu-sua",
  ],
};

export const final: FinalPagina = {
  text: "Tell us what you keep, in which language and in which country. We will show you how 3S answers a question on a sample of your documents.",
  dupa: ["See also: [Pricing](/pricing), [Enterprise](/enterprise) and [About and security](/about)."],
};
