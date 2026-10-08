// Pagina de start a editiei `en` (P01, `/`), transcrisa din fisa ei de continut, pana la sectiunea de resurse
// nepublicate. Textul e cel decis (H1 si deviza: decizia 2; pozitionarea generala: deciziile 37-38; preturile:
// deciziile 10 si 18; functiile scoase: decizia 43; asistentul pe WhatsApp scos: decizia 49, cu cardul lui, cu
// intrebarea frecventa despre el si cu oglinda ei din FAQPage; WhatsApp ramane numai canalul de contact cu un om:
// butoanele, textul precompletat si pasul 1 din "How do I start?").
//
// CE NU INTRA, cu motivul:
//   - frazele despre hartie (prima jumatate a pasului Scan, situatia "Part of your archive is still on paper",
//     intrebarea "Can you digitize our paper archive?" si oglinda ei din JSON-LD): poarta juridica a deciziei 40
//     din fisa le tine deoparte pana cand juristul rescrie textele juridice care le acopera (rezerva prin
//     omisiune, ca pe preturi);
//   - randurile de e-mail si cuvintele "or by e-mail": varianta de dinainte de P-40 (adresa domeniului nu poate
//     raspunde inca). Linia de e-mail a blocurilor de canal o randeaza pagina numai cand domeniul are adresa;
//   - titlul de grup "Questions before you message us": modelul nu are sectiuni fara blocuri, deci intrebarile
//     sunt ele insele titluri de nivel 2, fara alt text adaugat.
//
// JSON-LD: nodurile paginii, fara `@context` (pagina le pune intr-un graf); se leaga de organizatia si de site-ul
// emise de layout (acelasi `@id`), nu le redeclara. Raspunsurile din FAQPage sunt textul vizibil, fara marcaj.

import { iduri } from "@/components/seo/date-structurate";
import { caleMd } from "@/content/juridic/md/registru";
import { textSimplu } from "@/content/juridic/tipuri";
import type { PaginaContinut } from "@/content/model/tipuri";
import { adresaSite } from "@/lib/site";

/** Microtextul de sub fiecare buton de canal (decizia 3: fara ore, fara termen de raspuns). */
export const MICROTEXT = "A person replies, in English or Romanian. No form, no account.";

/** Inceputul liniei de e-mail; adresa vine din canalele domeniului, numai cand exista. */
export const INAINTE_DE_EMAIL = "Or write to ";

/** Blocul de final al unei pagini: textul de sub titlu si randurile de dupa buton. */
export type FinalPagina = {
  text: string;
  dupa: readonly string[];
};

const BAZA = adresaSite();
const ID = iduri(BAZA);
const LEGAL = caleMd("informatii-legale", "en");

const INTREBARI: readonly { cheie: string; intrebare: string; raspuns: string }[] = [
  {
    cheie: "english-questions",
    intrebare: "Can I ask questions in English about Romanian documents?",
    raspuns:
      "That is in pilot: we test it on a sample of your files before you decide. Citation down to the page is in pilot too. Questions in Romanian are supported.",
  },
  {
    cheie: "who-operates",
    intrebare: "Who operates 3S?",
    raspuns: "3S is operated from Moldova. The operating company's details are on the [Legal information](" + LEGAL + ") page.",
  },
  {
    cheie: "customer-names",
    intrebare: "Can I see customer names or reviews?",
    raspuns:
      "This site does not publish customer names, numbers or reviews. Judge 3S by the sources in our guides and by a pilot on your own documents; the limits are listed on the [About page](/about#limits).",
  },
];

export const pagina: PaginaContinut = {
  cheie: "home",
  meta: {
    titlu: "AI Document Search With Cited Sources | 3S Scan Store Solve",
    descriere:
      "3S keeps your company documents in a digital archive and answers questions about them, showing the source behind each answer. Hosted in the EU (Frankfurt).",
    cale: "/",
  },
  h1: "Ask your company's documents. Get the answer and its source.",
  capsula:
    "3S Scan Store Solve keeps your company's documents in a digital archive and answers questions about them, showing the document each answer comes from. You use it in the browser. Files are stored in the EU, with Frankfurt as the primary region. 3S is operated from Moldova, and its plans are priced in euros.",
  sectiuni: [
    {
      cheie: "what-is-3s",
      titlu: "What is 3S Scan Store Solve?",
      blocuri: [
        {
          paragrafe: ["3S is a digital archive for your company's documents that also answers questions about them. Its name gives the three steps."],
          lista: {
            elemente: [
              "**Scan.** Files you already have as scans go straight into the platform.",
              "**Store.** Each document you upload sits in your organization's own space and is prepared automatically for search.",
              "**Solve.** You ask a question in Romanian, and 3S answers with the information and the document it comes from.",
            ],
          },
        },
      ],
    },
    {
      cheie: "how-3s-answers",
      titlu: "How does 3S answer a question?",
      blocuri: [
        {
          paragrafe: [
            "Ask your documents a question the way you would ask a colleague. 3S answers from the content of your documents. Each answer comes with a cited source: the document 3S used, so you can check it.",
          ],
        },
        {
          eticheta: "Example",
          paragrafe: [],
          tabel: {
            forma: "cheie-valoare",
            titlu: "Example with fictional data: a question, its answer and the source",
            randuri: [
              ["Question", "Cine este furnizorul din contract?"],
              ["In English", "Who is the supplier named in the contract?"],
              ["Answer", "Furnizorul este Alpha Example SRL."],
              ["Source", "Contract_furnizare_example.pdf"],
            ],
          },
          dupa: [
            "Example with fictional data: no real company or document is shown. The question and the answer are in Romanian; the English line is our translation of the question, not 3S output. Questions in Romanian are supported; English questions over Romanian documents are in pilot.",
          ],
        },
      ],
    },
    {
      cheie: "who-is-3s-for",
      titlu: "Who is 3S for?",
      blocuri: [
        {
          paragrafe: ["3S is for any team that works with documents, in any line of business. You will recognize your own situation:"],
          lista: {
            elemente: [
              "**The same contract or annex is asked for again and again.** Ask the question and open the document shown under the answer.",
              "**One colleague is the only one who knows where things are.** Colleagues with an account ask the same archive and reach the same document.",
              "**Documents are spread over folders, mailboxes and drives.** Once uploaded, they sit in one archive.",
              "**The team is growing, or a new office opens.** A new colleague signs in and asks the same archive from the browser.",
              "**You have strict rules on access, retention or export.** Tell us what your company requires at the start, and we will say plainly whether 3S meets it.",
            ],
          },
          dupa: [
            "For example: accounting and law firms with client files, services companies with contracts and procedures, distribution and transport companies with orders and their documents, construction companies with projects and annexes.",
          ],
        },
      ],
    },
    {
      cheie: "what-can-i-do",
      titlu: "What can I do with 3S?",
      blocuri: [
        {
          paragrafe: [],
          lista: {
            elemente: [
              "**[Search with sources](/features/search).** Ask a question about your documents and check the source of each answer.",
            ],
          },
          dupa: ["To follow a document from arrival to answer, read the [platform page](/platform)."],
        },
      ],
    },
    {
      cheie: "where-stored",
      titlu: "Where are my documents stored?",
      blocuri: [
        {
          paragrafe: [
            "Files you upload to 3S are stored in the EU, with Frankfurt as the primary region. The [About page](/about#security) names the hosting provider, which is a US company, and explains what US law says about data in a US provider's care.",
          ],
        },
      ],
    },
    {
      cheie: "how-do-i-start",
      titlu: "How do I start?",
      ancoraInainte: "how-do-i-start",
      blocuri: [
        {
          paragrafe: ["Every start is an assisted pilot on a sample of your documents."],
          lista: {
            numerotata: true,
            elemente: [
              "Message us on WhatsApp and tell us about your archive. Please do not send documents or personal data in this first message.",
              "We agree on a sample of your documents and the questions you want answered.",
              "We run the sample and check the answers, and their sources, with you.",
              "If 3S fits, we quote for the full archive.",
            ],
          },
          dupa: ["During the pilot, accounts are opened by invitation. There is no self-service sign-up."],
        },
      ],
    },
    {
      cheie: "cost",
      titlu: "What does 3S cost?",
      blocuri: [
        {
          paragrafe: [
            "3S has four plans, priced per company in euros, excluding VAT: Starter EUR 90, Pro EUR 150 and Business EUR 240 a month, and Enterprise from EUR 800 a month. The prices are indicative, and paying annually, you pay for 10 months and get 12. Every start is a free 14-day assisted pilot on your own documents. [See the plans](/pricing).",
          ],
        },
      ],
    },
    {
      cheie: "check-facts",
      titlu: "Can I check your facts?",
      blocuri: [
        {
          paragrafe: ["Each guide on this site cites primary sources and shows the date they were checked. Guides are not legal advice."],
          lista: {
            elemente: [
              "[Records retention in Moldova](/guides/records-retention-moldova)",
              "[E-invoice archiving in the EU](/guides/e-invoice-archiving-eu)",
              "[3S vs Google Drive](/compare/3s-vs-google-and-box)",
            ],
          },
        },
      ],
    },
    ...INTREBARI.map((i) => ({ cheie: i.cheie, titlu: i.intrebare, blocuri: [{ paragrafe: [i.raspuns] }] })),
  ],
  cta: {
    ref: "en-home",
    titluBloc: "Try it on a sample of your documents",
    textWhatsapp: "Hello 3S, I read your website [ref:en-home]. I would like to ask about a pilot.",
    subiectEmail: "3S inquiry [ref:en-home]",
  },
  jsonLd: [
    {
      "@type": "WebPage",
      "@id": BAZA + "/#webpage",
      url: BAZA + "/",
      name: "AI Document Search With Cited Sources | 3S Scan Store Solve",
      description:
        "3S keeps your company documents in a digital archive and answers questions about them, showing the source behind each answer. Hosted in the EU (Frankfurt).",
      inLanguage: "en",
      isPartOf: { "@id": ID.site },
      about: { "@id": ID.organizatie },
    },
    {
      "@type": "FAQPage",
      "@id": BAZA + "/#faq",
      inLanguage: "en",
      mainEntity: INTREBARI.map((i) => ({
        "@type": "Question",
        name: i.intrebare,
        acceptedAnswer: { "@type": "Answer", text: textSimplu(i.raspuns) },
      })),
    },
  ],
  afirmatii: [
    "en-juridic-serviciu-web-si-whatsapp",
    "en-comparatii-cautare-cu-sursa",
    "en-gazduire-ue-frankfurt",
    "en-operator-din-moldova",
    "en-pret-orientativ-eur",
    "en-acasa-trei-pasi-scan-store-solve",
    "en-produs-functii-in-productie",
    "en-pilot-asistat",
    "en-cont-prin-invitatie",
    "en-ghiduri-cu-surse",
    "en-pagina-si-engleza-in-pilot",
  ],
};

/** Legatura secundara a eroului: spre sectiunea "How do I start?". */
export const eroSecundar = { text: "See how a pilot starts", href: "#how-do-i-start" } as const;

export const final: FinalPagina = {
  text: "Tell us what your archive looks like and in which country it is. We reply in English or Romanian. Prefer a call on WhatsApp? See [Contact](/contact).",
  dupa: ["Documents that answer you."],
};
