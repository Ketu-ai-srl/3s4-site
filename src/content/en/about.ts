// Pagina "About & security" a editiei `en` (P11, `/about`), transcrisa din fisa ei de continut, pana la sectiunea
// de resurse nepublicate. Furnizorul de gazduire si nota CLOUD Act sunt decizia 4; datele firmei stau numai pe
// paginile juridice (decizia 5), deci aici e doar legatura spre "Legal information".
//
// CE NU INTRA, cu motivul:
//   - sectiunea "How is my data protected?": nu se publica pana la P-14 (fisa; criptarea, accesul si jurnalul nu
//     sunt confirmate in scris);
//   - frazele despre hartie (prima jumatate a pasului Scan si randul despre hartie din tabelul de limite): poarta
//     juridica a deciziei 40 (rezerva prin omisiune, pana la rescrierea textelor juridice de catre jurist);
//   - asistentul pe WhatsApp (fraza "WhatsApp is available in pilot" si randul lui din tabelul de limite): decizia
//     49, asistentul nu exista in platforma; WhatsApp ramane numai canalul de contact cu un om (butoanele);
//   - `citation` cu noduri `CreativeWork` si tipul `AboutPage` din JSON-LD-ul propus de fisa: vocabularul declarat al
//     portii de SEO nu le are, deci pagina e un `WebPage`; sursele raman pe pagina, in tabelul lor.
//
// Ancorele: `security` pe "Where are my documents stored?" (subsolul si alte pagini trimit la /about#security) si
// `limits` pe tabelul de limite (startul trimite la /about#limits).

import { iduri } from "@/components/seo/date-structurate";
import { caleMd } from "@/content/juridic/md/registru";
import type { PaginaContinut } from "@/content/model/tipuri";
import { adresaSite } from "@/lib/site";
import type { FinalPagina } from "./home";

const BAZA = adresaSite();
const ID = iduri(BAZA);
const LEGAL = caleMd("informatii-legale", "en");

/** Sursele primare ale sectiunii despre legea americana: adresa si data verificarii, citite si de proba. */
export const SURSE_CLOUD_ACT = {
  lege: "https://www.govinfo.gov/content/pkg/USCODE-2023-title18/html/USCODE-2023-title18-partI-chap121-sec2713.htm",
  sediu: "https://data.sec.gov/submissions/CIK0001018724.json",
  verificat: "September 30, 2026",
} as const;

export const pagina: PaginaContinut = {
  cheie: "about",
  meta: {
    titlu: "About 3S: What It Is, Who Runs It, Where Data Is Stored",
    descriere:
      "3S Scan Store Solve is a document archive with AI search, operated from Moldova. Files are stored in the EU (Frankfurt) on Amazon Web Services.",
    cale: "/about",
  },
  h1: "About 3S: what it is, who runs it and where your data is",
  capsula:
    "3S Scan Store Solve is a document archive with AI search, operated from Moldova. Documents you upload are stored in the EU, with Frankfurt as the primary region, on Amazon Web Services. Amazon is a US company, and US law (the CLOUD Act) can require a US provider to preserve and disclose data in its care, wherever its servers are.",
  sectiuni: [
    {
      cheie: "key-facts",
      titlu: "What are the key facts about 3S?",
      blocuri: [
        {
          paragrafe: [],
          tabel: {
            forma: "cu-antet",
            titlu: "Key facts about 3S",
            antet: ["Question", "Answer"],
            randuri: [
              ["What is 3S?", "A digital archive that answers questions about your documents and shows the source of each answer"],
              ["Where is it operated from?", "Moldova"],
              ["Where are files stored?", "In the EU, with Frankfurt as the primary region"],
              ["Who hosts the platform?", "Amazon Web Services"],
              ["Where is that provider headquartered?", "The United States"],
            ],
          },
        },
      ],
    },
    {
      cheie: "what-is-3s",
      titlu: "What is 3S Scan Store Solve?",
      blocuri: [
        {
          paragrafe: [
            "3S keeps a company's documents in a digital archive and answers questions about them, showing the document each answer comes from. It works in the browser. The name gives the three steps:",
          ],
          lista: {
            elemente: [
              "**Scan.** Files you already have as scans go straight into the platform.",
              "**Store.** Each document you upload sits in your organization's own space and is prepared automatically for search.",
              "**Solve.** You ask a question in Romanian, and 3S answers with the information and the document it comes from.",
            ],
          },
          dupa: ["[See the platform](/platform) or read about [search with sources](/features/search)."],
        },
      ],
    },
    {
      cheie: "who-runs-3s",
      titlu: "Who runs 3S?",
      blocuri: [
        {
          paragrafe: [
            "3S is operated from Moldova. The operating company's details are on the [Legal information](" +
              LEGAL +
              ") page. To talk to the team, see [Contact](/contact).",
          ],
        },
      ],
    },
    {
      cheie: "where-stored",
      titlu: "Where are my documents stored?",
      ancoraInainte: "security",
      blocuri: [
        {
          paragrafe: [
            "Files you upload to 3S are stored in the EU, with Frankfurt as the primary region, on Amazon Web Services. The 3S platform, with its accounts, uploaded files and digital archive, runs there.",
            "Ask us about anything security-related, such as encryption, access control or logs, and we will answer your questions directly.",
          ],
        },
      ],
    },
    {
      cheie: "us-law",
      titlu: "Can US authorities require access to my data?",
      blocuri: [
        {
          paragrafe: [
            "US law (the CLOUD Act) can require a US provider to preserve and disclose data in its care, wherever its servers are. Amazon is headquartered in the United States. This is a plain-language summary, not legal advice: if it matters to your organization, ask your own adviser.",
            "This section is about the hosting provider. Whether other providers handle your documents for AI features is not stated on this site: see the limits table below.",
            "Primary sources for this section:",
          ],
          tabel: {
            forma: "cu-antet",
            titlu: "Primary sources for this section",
            antet: ["What this page says", "Primary source", "What the source says"],
            randuri: [
              [
                "US law can require a US provider to preserve and disclose data in its care, wherever its servers are",
                '[18 U.S.C. 2713, "Required preservation and disclosure of communications and records"](' +
                  SURSE_CLOUD_ACT.lege +
                  "), United States Code, 2023 edition, added by the CLOUD Act (Pub. L. 115-141, division V, March 23, 2018)",
                'A provider of electronic communication service or remote computing service must comply with the chapter\'s obligations to preserve, back up or disclose communications and records within its possession, custody or control, "regardless of whether such communication, record, or other information is located within or outside of the United States".',
              ],
              [
                "Amazon is headquartered in the United States",
                "[SEC EDGAR submissions record for Amazon.com, Inc., CIK 0001018724 (JSON)](" + SURSE_CLOUD_ACT.sediu + ")",
                "Business address: 410 Terry Avenue North, Seattle, WA 98109. State of incorporation: Delaware.",
              ],
            ],
          },
          dupa: ["Last verified: " + SURSE_CLOUD_ACT.verificat + "."],
        },
      ],
    },
    {
      cheie: "limits",
      titlu: "What does 3S not do, and what is still in pilot?",
      ancoraInainte: "limits",
      blocuri: [
        {
          paragrafe: ["These are the limits today."],
          tabel: {
            forma: "cu-antet",
            titlu: "What 3S does today, what is in pilot and what is not stated",
            antet: ["Topic", "Status", "What it means for you"],
            randuri: [
              ["Search with the source shown", "In the product today", "Ask in Romanian and get the answer with the document it comes from."],
              ["English questions over Romanian documents", "In pilot", "We test it on a sample of your files before you decide."],
              ["Citation down to the page", "In pilot", "3S cites the source of each answer; page-level citation is tested on your sample."],
              ["Qualified electronic signature", "Not available today", "Integration with accredited providers is in progress."],
              [
                "Where AI features process your documents",
                "Not stated on this site",
                "This page says where files are stored. Ask us where AI processing takes place before you send real documents.",
              ],
              ["Certifications", "None stated on this site", "Tell us what your procurement requires, and we will say plainly whether we meet it."],
            ],
          },
        },
      ],
    },
    {
      cheie: "no-reviews",
      titlu: "Why does this site publish no customer names or reviews?",
      blocuri: [
        {
          paragrafe: [
            "This site does not publish customer names, numbers or reviews. Judge 3S by the sources in our guides and by a pilot on your own documents. The limits are listed above.",
          ],
        },
      ],
    },
    {
      cheie: "guides",
      titlu: "How do we write our guides?",
      blocuri: [
        {
          paragrafe: [
            "Guides cite primary sources with links and the date they were checked. They are not legal advice: check with your own adviser. Read [Records retention in Moldova](/guides/records-retention-moldova), [E-invoice archiving in the EU](/guides/e-invoice-archiving-eu) or [3S vs Google Drive](/compare/3s-vs-google-and-box).",
          ],
        },
      ],
    },
  ],
  cta: {
    ref: "en-about",
    titluBloc: "Ask a security question",
    textWhatsapp: "Hello 3S, I read your page about 3S and data location [ref:en-about]. I have a question about security.",
    subiectEmail: "3S inquiry [ref:en-about]",
  },
  jsonLd: [
    {
      "@type": "WebPage",
      "@id": BAZA + "/about#webpage",
      url: BAZA + "/about",
      name: "About 3S: What It Is, Who Runs It, Where Data Is Stored",
      description:
        "3S Scan Store Solve is a document archive with AI search, operated from Moldova. Files are stored in the EU (Frankfurt) on Amazon Web Services.",
      inLanguage: "en",
      isPartOf: { "@id": ID.site },
      mainEntity: { "@id": ID.organizatie },
      breadcrumb: { "@id": BAZA + "/about#breadcrumb" },
    },
    {
      "@type": "BreadcrumbList",
      "@id": BAZA + "/about#breadcrumb",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: BAZA + "/" },
        { "@type": "ListItem", position: 2, name: "About and security", item: BAZA + "/about" },
      ],
    },
  ],
  afirmatii: [
    "en-juridic-serviciu-web-si-whatsapp",
    "en-comparatii-cautare-cu-sursa",
    "en-acasa-trei-pasi-scan-store-solve",
    "en-operator-din-moldova",
    "en-gazduire-ue-frankfurt",
    "en-juridic-gazduire-amazon-germania",
    "en-produs-amazon-sediu-sua",
    "en-cinema2-semnatura-in-curs",
    "en-pagina-si-engleza-in-pilot",
    "en-ghiduri-cu-surse",
  ],
};

export const final: FinalPagina = {
  text: "Tell us what you need to know about where your data is and who can reach it. We reply in English or Romanian.",
  dupa: ["See also: [Platform](/platform), [Pricing](/pricing), [Enterprise](/enterprise) and [Contact](/contact)."],
};
