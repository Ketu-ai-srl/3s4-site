// Pagina P03 a editiei `en`: cautarea in documente, cu sursa citata (grupul produs).
//
// SURSA: fisa de continut a paginii (front matter si corpul pana la resursele nepublicate), in forma de dupa
// deciziile 38, 40, 43 si 49 ale owner-ului (decizia 49: intrebarile puse pe WhatsApp au iesit din prima sectiune si
// din tabelul de stare; WhatsApp ramane numai canalul de contact cu un om). Notele fisei si resursele ei nu intra
// aici. Textul e ASCII, in engleza americana; cele doua randuri romanesti ale exemplului sunt fara diacritice, cum le
// scrie fisa.
//
// Ce NU spune pagina (fisa, "Nu spune"): pagina exacta ca fapt, timpi de raspuns, procente de acuratete, un
// raspuns in engleza peste un document romanesc. Citarea pana la pagina si intrebarile in engleza peste
// documente romanesti raman "in pilot" pana la testul P-13.
//
// Linia de e-mail din erou si din final se randeaza numai cand domeniul are adresa (`CANALE.email`).

import type { PaginaContinut } from "@/content/model/tipuri";

export const pagina: PaginaContinut = {
  cheie: "features-search",
  meta: {
    titlu: "AI Search in Company Documents, With the Source Cited | 3S",
    descriere:
      "Ask a question about your documents and get the answer with its source shown, so you can check it. English questions over Romanian documents are in pilot.",
    cale: "/features/search",
  },
  h1: "Ask questions about your documents and check the source of each answer",
  capsula:
    "Ask a question about your documents and 3S answers from their content, citing the source of each answer so you can check it. Questions in Romanian are supported. English questions over Romanian documents, and citation down to the page, are in pilot: we test them on a sample of your files before you decide.",
  sectiuni: [
    {
      cheie: "how-it-answers",
      titlu: "How does 3S answer questions about my documents?",
      blocuri: [
        {
          paragrafe: [
            "3S searches the content of your documents with AI. You ask a question, and 3S answers from what the documents say, citing the source of the answer. Each document you upload is prepared for search automatically.",
            "You ask in the browser. For how documents reach the archive in the first place, see the [platform overview](/platform).",
          ],
        },
        {
          eticheta: "Example",
          paragrafe: [],
          tabel: {
            forma: "cheie-valoare",
            titlu: "Example question and answer, with fictional data",
            randuri: [
              ["Question", "Cine a semnat contractul cu Alpha Example SRL?"],
              ["In English", "Who signed the contract with Alpha Example SRL?"],
              ["Answer", "Contractul a fost semnat de Ana Exemplu, administrator al Alpha Example SRL."],
              ["Source", "contract_alpha_example.pdf"],
            ],
          },
          dupa: [
            "Example with fictional data: no real company or document is shown. The question and the answer are in Romanian; the English line is our translation of the question, not 3S output. The answer names the person who signed and the company.",
          ],
        },
      ],
    },
    {
      cheie: "check-source",
      titlu: "Can I check where an answer comes from?",
      blocuri: [
        {
          paragrafe: [
            "Yes. 3S cites the source of each answer, and the answer comes with the document it is taken from. For anything that matters, such as a notice period or a payment term, read the source before you act on the answer.",
            "Citation down to the exact page is in pilot.",
          ],
        },
      ],
    },
    {
      cheie: "english",
      titlu: "Can I ask in English about documents in Romanian?",
      blocuri: [
        {
          paragrafe: [
            "English questions over Romanian documents are in pilot. Questions in Romanian are supported today. We test English questions on a sample of your own files first, so you see what the answers look like before you decide.",
          ],
        },
      ],
    },
    {
      cheie: "scanned",
      titlu: "Does it work on scanned documents?",
      blocuri: [
        {
          paragrafe: [
            "Yes. 3S recognizes the text of scanned documents, and files you already have as scans go straight into the platform. Each uploaded document is prepared for search.",
            "If your archive is on paper, tell us where it is and how much there is: paper needs a conversation first.",
          ],
        },
      ],
    },
    {
      cheie: "ai-wrong",
      titlu: "Can the AI be wrong?",
      blocuri: [
        {
          paragrafe: [
            "Yes. Like any AI system, 3S can give an incomplete or wrong answer. That is why each answer comes with its source: read the source before you rely on the answer. For a legal, tax or financial decision, rely on the document itself.",
          ],
        },
      ],
    },
    {
      cheie: "status",
      titlu: "What is available today, and what is in pilot?",
      ancoraInainte: "status",
      blocuri: [
        {
          paragrafe: [
            'Available today: questions in Romanian, a cited source with each answer, and recognition of the text of scanned documents. In pilot: English questions over Romanian documents, and citation down to the exact page. "In pilot" means we test the feature on a sample of your own documents before you decide.',
          ],
          tabel: {
            forma: "cu-antet",
            titlu: "What is available today and what is in pilot",
            antet: ["Capability", "Status"],
            randuri: [
              ["Questions in Romanian", "Available"],
              ["A cited source with each answer", "Available"],
              ["Recognition of the text of scanned documents", "Available"],
              ["English questions over Romanian documents", "In pilot"],
              ["Citation down to the exact page", "In pilot"],
            ],
          },
        },
      ],
    },
    {
      cheie: "who",
      titlu: "Who is it for?",
      blocuri: [
        {
          paragrafe: [
            "Anyone who works with documents and has to find the right one when someone asks for it, without opening every file. A few situations where that happens:",
          ],
          lista: {
            elemente: [
              "The same contract, annex or procedure is asked for again and again.",
              "Only one colleague knows how the files are organized, and requests wait for that person.",
              "Documents sit in several places, under different names or versions.",
              "The documents are in Romanian and the person asking does not read Romanian: English questions over Romanian documents are in pilot.",
            ],
          },
          dupa: [
            "The examples differ by line of business: client files in an accounting or law firm, contracts and procedures in a services company, orders and their documents in distribution and transport.",
          ],
        },
      ],
    },
    {
      cheie: "compare",
      titlu: "How does it compare with other AI document tools?",
      blocuri: [
        {
          paragrafe: [
            "Other tools answer questions over documents too. If you already use one, compare before you choose: [how 3S compares with other tools](/compare/3s-vs-google-and-box).",
          ],
        },
      ],
    },
    {
      cheie: "pilot",
      titlu: "How does the pilot work?",
      blocuri: [
        {
          paragrafe: [
            "We start with an assisted pilot on a sample of your documents. You tell us which questions matter to you, and we check the answers and their sources together. After the pilot, we quote for the full archive.",
          ],
        },
      ],
    },
  ],
  cta: {
    ref: "en-search",
    titluBloc: "See it on your own documents",
    textWhatsapp:
      "Hello 3S, I read your page on search with a cited source [ref:en-search]. I would like to see it on a sample of our documents.",
    subiectEmail: "3S inquiry [ref:en-search]",
  },
  jsonLd: [
    {
      "@type": "WebPage",
      name: "AI Search in Company Documents, With the Source Cited",
      description:
        "Ask a question about your documents and get the answer with its source shown, so you can check it. English questions over Romanian documents are in pilot.",
      inLanguage: "en",
    },
  ],
  afirmatii: [
    "en-produs-comparatii-cautare-cu-sursa",
    "en-produs-acasa-trei-pasi-scan-store-solve",
    "en-produs-juridic-serviciu-web-si-whatsapp",
    "en-produs-cinema-cautare-web-si-whatsapp",
    "en-produs-enterprise-functii-in-productie",
    "en-produs-conversie-demonstratie-exemplu",
    "en-produs-pagina-si-engleza-in-pilot",
    "en-produs-pilot-asistat",
    "en-produs-om-raspunde",
  ],
};

/** Ce pune pagina in jurul corpului: firul, eroul (legatura secundara, microtextul) si blocul de final. */
export const inJur = {
  fir: [
    { text: "Home", cale: "/" },
    { text: "Platform", cale: "/platform" },
    { text: "Search with sources", cale: "/features/search" },
  ],
  etichetaFir: "Breadcrumb",
  legaturaSecundara: "[What is available and what is in pilot](#status)",
  microtext: "A person replies, in English or Romanian. No form, no account.",
  inainteDeEmail: "Or write to",
  final: {
    paragrafe: [
      "Message us with a short description of your archive: what you keep, in which language and roughly how much. Please do not send documents or personal data in your first message.",
    ],
    veziSi: "See also: [About and security](/about#security) for where your files are stored.",
  },
};
