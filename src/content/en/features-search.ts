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
      "Ask a question about your documents and get the answer with its source shown, so you can check it. English questions over Romanian documents are in beta.",
    cale: "/features/search",
  },
  h1: "Ask questions about your documents and check the source of each answer",
  capsula:
    "Ask a question about your documents and 3S answers from their content, citing the source of each answer so you can check it. Questions in Romanian are supported. English questions over Romanian documents, and citation down to the page, are in beta: we test them on a sample of your files before you decide.",
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
            "Citation down to the exact page is in beta.",
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
            "English questions over Romanian documents are in beta. Questions in Romanian are supported today. We test English questions on a sample of your own files first, so you see what the answers look like before you decide.",
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
      titlu: "What is available today, and what is in beta?",
      ancoraInainte: "status",
      blocuri: [
        {
          paragrafe: [
            'Available today: questions in Romanian, a cited source with each answer, and recognition of the text of scanned documents. In beta: English questions over Romanian documents, and citation down to the exact page. "In beta" means we test the feature on a sample of your own documents before you decide.',
          ],
          tabel: {
            forma: "cu-antet",
            titlu: "What is available today and what is in beta",
            antet: ["Capability", "Status"],
            randuri: [
              ["Questions in Romanian", "Available"],
              ["A cited source with each answer", "Available"],
              ["Recognition of the text of scanned documents", "Available"],
              ["English questions over Romanian documents", "In beta"],
              ["Citation down to the exact page", "In beta"],
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
              "The documents are in Romanian and the person asking does not read Romanian: English questions over Romanian documents are in beta.",
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
            "Other tools answer questions over documents too. If you already use one, compare before you choose: [how 3S compares with other tools](/compare/3s-vs-google-drive).",
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
        "Ask a question about your documents and get the answer with its source shown, so you can check it. English questions over Romanian documents are in beta.",
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
  legaturaSecundara: "[What is available and what is in beta](#status)",
  microtext: "A person replies, in English or Romanian. No form, no account.",
  inainteDeEmail: "Or write to",
  final: {
    paragrafe: [
      "Message us with a short description of your archive: what you keep, in which language and roughly how much. Please do not send documents or personal data in your first message.",
    ],
    veziSi: "See also: [About and security](/about#security) for where your files are stored.",
  },
};

// ---------------------------------------------------------------------------------------------------------------------
// POVESTEA PAGINII (decizia 53, intrebarea 5 varianta a): pagina EN compune aceleasi componente cinema ca perechea RO
// (`/functionalitati/cautare-ai`), in aceeasi ordine, cu textul de mai jos. SURSA: fisa paginii, sectiunea "Component
// copy (decision 53)", cu cheia campului RO in comentariu (`cautare-ai.ts:NN`). Textul e PROPUS, pana la aprobarea
// owner-ului pe capturi. `pagina` si `inJur` de mai sus raman sursa pentru metadata, textul WhatsApp precompletat si
// registrul de afirmatii; sectiunile aprobate raman in fisa si nu se monteaza (pagina RO nu are sectiuni-intrebare).
//
// CE NU E AICI, cu motivul: scena (intrebarea din erou si din bara, pasajul citat si randurile desenului "Acum") e in
// romana, singura limba confirmata pentru intrebari (fisa, nota 2), iar cele doua semne tipografice (punctul de mijloc
// al etichetei si sageata puntii) nu sunt ASCII; stau in `src/content/functionalitati/cautare-ai-3s-md.ts`, fiindca
// modulele din acest dosar sunt numai ASCII (poarta de limba engleza). Iese pe 3s.md: cipul "WhatsApp" din dosar
// (decizia 49); butonul spre cont devine legatura WhatsApp cu `ref`-ul paginii (decizia 3).
//
// GLOSA (decizia 75, "Romana + glosa EN"): demonstratia ramane in romana, cum raspunde produsul, iar sub fiecare
// intrebare si sub fiecare raspuns romanesc VIZIBIL apare traducerea lor in engleza americana, subordonata vizual, cu
// `lang` propriu: sub terminalul eroului (prima aparitie a intrebarii, pe primul ecran), sub bara din lumina, sub
// cardul extragerii si sub desenul "Acum" (intrebarea, apoi raspunsul). E traducerea NOASTRA, fidela, propozitie cu
// propozitie, nu iesirea 3S si nu o promisiune noua (decizia 43): pagina nu promite intrebari in engleza peste documente
// romanesti. Textele stau aici (`glosa` din EROU_POVESTE, LUMINA_POVESTE, EXTRAGERE_POVESTE si CONTRAST_POVESTE.acum),
// ca date; componentele le randeaza numai cand le primesc, deci paginile romanesti raman cum erau.
//
// Modulul e numai date: il importa si invelitorile client ale insulelor (avalansa, frustrarea, lumina).
// ---------------------------------------------------------------------------------------------------------------------

/**
 * Glosa intrebarii scenei (`SCENA_CAUTARE_3S_MD.intrebare`), aceeasi in erou (sub terminal) si in lumina (sub bara),
 * fiindca e aceeasi intrebare scrisa de doua ori. "Garantie" e "warranty".
 */
const GLOSA_INTREBARE = {
  text: "What warranty does the compressor in Building 2 have, and from what date is it calculated?",
  limba: "en",
} as const;

/** Eroul: eticheta-titlu (h1) in doua bucati, legate de pagina cu punctul de mijloc (`cautare-ai.ts:40-49`). */
export const EROU_POVESTE = {
  etichetaNumar: "Feature 01",
  etichetaNume: "AI search with sources",
  rand1: "The report was signed on site.",
  rand2: "...over two years ago.",
  indiciu: "scroll",
  // Decizia 75: glosa intrebarii din terminal, sub el, pe primul ecran.
  glosa: GLOSA_INTREBARE,
} as const;

export const AVALANSA_POVESTE = {
  // cautare-ai.ts:62.
  declaratie:
    "Example with fictional data: a compressor's folder with the quote, order, invoice, photos and emails, and the document you need last",
  // cautare-ai.ts:64, :66.
  cale: ["Shared documents", "Suppliers", "Beta Example", "Compressor Building 2", "2024", "misc"],
  numar: "41 items",
  // cautare-ai.ts:71-83; datele ISO (fisa, nota 4). Randul 8 n-are cip: "WhatsApp" iese pe 3s.md (decizia 49).
  randuri: [
    { tip: "document", nume: "compressor_quote_beta.docx", cip: { text: "Quote", ton: "neutru" }, ora: "2024-03-04" },
    { tip: "email", nume: "fw_order_hall2.eml", cip: { text: "8", ton: "alerta", mono: true }, ora: "2024-03-06" },
    { tip: "pdf", nume: "signed_order.pdf", cip: { text: "Signed", ton: "neutru" }, ora: "2024-03-08" },
    { tip: "tabel", nume: "air_demand_hall2.xlsx", cip: { text: "Sizing", ton: "neutru" }, ora: "2024-03-11" },
    { tip: "pdf", nume: "invoice_beta_1187.pdf", ora: "2024-05-17" },
    { tip: "pdf", nume: "delivery_note_scan.pdf", cip: { text: "Note", ton: "neutru" }, ora: "2024-05-17" },
    { tip: "imagine", nume: "serial_plate_photo.jpg", cip: { text: "Photo", ton: "neutru" }, ora: "2024-05-20" },
    { tip: "imagine", nume: "install_capture.png", ora: "2024-05-24" },
    { tip: "document", nume: "datasheet_translated.docx", cip: { text: "New", ton: "succes" }, ora: "2024-05-27" },
    { tip: "pdf", nume: "scan_0012.pdf", cip: { text: "Unnamed", ton: "alerta" }, ora: "2024-05-28" },
    { tip: "email", nume: "re_service_schedule.eml", cip: { text: "4", ton: "alerta", mono: true }, ora: "2024-11-14" },
    { tip: "tabel", nume: "servicing_2025.xlsx", ora: "2025-01-20" },
    { tip: "pdf", nume: "commissioning_report.pdf", ora: "2024-05-28" },
  ],
  // cautare-ai.ts:31.
  etichetaExemplu: "example",
} as const;

export const RECUNOASTERE_POVESTE = {
  // cautare-ai.ts:93, :96.
  titlu: "Two years of files",
  paragraf:
    "Everyone who worked with the machine added a file of their own, two years running, and nobody deleted anything.",
} as const;

export const FRUSTRARE_POVESTE = {
  // cautare-ai.ts:107-130.
  declaratie:
    "Example with fictional data: a search done by hand, with the files opened, the time lost and the people asked",
  inCurs: "Running",
  sesiune: "Manual search",
  fisiere: { eticheta: "Opened", sub: "some of them twice" },
  timp: { eticheta: "Time", sub: "since the first file" },
  colegi: { eticheta: "People asked", sub: "two were on leave" },
  rezultat: { eticheta: "Status", sub: "warranty still missing" },
  negasit: "No answer",
  continua: "One more folder",
  // Aceleasi valori ca scenariul RO (exemplu, nu masuratoare).
  maxime: { fisiere: 29, minute: 85, colegi: 5 },
  citate: [
    "I think it was in the green folder",
    "Another company did the install",
    "Finance only has the invoice",
    "Who knows how long the warranty is?",
    "The supplier has the original",
  ],
} as const;

export const SOAPTA_POVESTE = {
  // cautare-ai.ts:141, :143, :145.
  intrebare: "What if your archive answered like a colleague?",
  emfaza: "A colleague who read every file.",
  linie: "That is AI search.",
} as const;

export const LUMINA_POVESTE = {
  // cautare-ai.ts:153, :155.
  declaratie: "Example: the archive search bar with the question from the top of the page, in Romanian",
  indicatie: "send with Enter",
  // Decizia 75: traducerea intrebarii din scena, sub bara; aceeasi glosa ca in erou (`GLOSA_INTREBARE`).
  glosa: GLOSA_INTREBARE,
} as const;

export const EXTRAGERE_POVESTE = {
  // cautare-ai.ts:166-176; fara pagina citata (citarea pana la pagina e in beta).
  declaratie:
    "Example with fictional data: the archive's answer in Romanian, with the file the quoted sentence comes from",
  fisier: "commissioning_report.pdf",
  pagina: "Excerpt",
  meta: "Answer with its source",
  legenda: "The excerpt comes with the file it is from.",
  // Decizia 75: traducerea pasajului citat (`SCENA_CAUTARE_3S_MD.citat`), sub cardul raspunsului; data in forma SUA.
  glosa: {
    text: "The warranty period for the compressor is 24 months, from commissioning on May 28, 2024.",
    limba: "en",
  },
} as const;

export const CONTRAST_POVESTE = {
  // cautare-ai.ts:185-222.
  titlu: "The same warranty, searched for twice",
  // Fraza pune fata in fata cele doua feluri de lucru, nu asezarea cardurilor: sub 768 px grila trece pe o
  // coloana si "on the left / on the right" ar fi fals. Nici "Now you get" nu merge: vizitatorul inca nu foloseste 3S.
  paragraf: "Without 3S, you open folders one after another. With 3S, you get the answer with its source, ready to check.",
  inainte: {
    titlu: "Before",
    subtitlu: "folder by folder",
    declaratie: "Drawing: four scattered documents with question marks",
    metrici: [
      { valoare: "29", cheie: "Opened" },
      { valoare: "1 h 25 min", cheie: "Time" },
      { valoare: "5", cheie: "Colleagues" },
      { valoare: "no source", cheie: "Status", calitativ: "rau" },
    ],
  },
  acum: {
    titlu: "Now",
    subtitlu: "one question",
    // Eticheta accesibila a desenului, cu traducerea intrebarii scurte (fisa, nota 2); ghilimele drepte (ASCII).
    declaratie: 'Example: "What warranty does the compressor have?" asked in Romanian, and its answer',
    sursa: "commissioning_report.pdf",
    // Decizia 75: textele romanesti ale desenului se vad, deci au glosa lor, randata ca text sub desen:
    // intrebarea scurta (`SCENA_CAUTARE_3S_MD.intrebareScurta`) si raspunsul (`raspunsInceput` + `raspunsAccent`,
    // apoi `raspunsNota`), fara semn final, ca originalul. "Garantie de 24 de luni" e "a 24-month warranty".
    glosa: {
      intrebare: "What warranty does the compressor have?",
      raspuns: "A 24-month warranty, from the day of commissioning",
      limba: "en",
    },
    metrici: [
      { valoare: "1", cheie: "Question" },
      { valoare: "1 file", cheie: "Source cited" },
      { valoare: "0", cheie: "Colleagues" },
      { valoare: "checkable", cheie: "Status", calitativ: "bun" },
    ],
  },
  // Puntea, in doua bucati; pagina le leaga cu sageata, ca pe RO.
  punteDe: "by hand",
  punteLa: "cited",
} as const;

export const CTA_POVESTE = {
  // cautare-ai.ts:231-237; butonul duce la WhatsApp, cu textul precompletat si `ref`-ul din `pagina.cta`.
  titlu: "Read just the source",
  paragraf: "3S answers questions from the content of your documents and cites the source of each answer.",
  buton: "Message us",
  nota: "A person replies, in English or Romanian. No form, no account.",
} as const;

/** Firul paginii (BreadcrumbList), ca pe RO: startul si pagina (`cautare-ai.ts:242-243`). */
export const FIR_POVESTE = [
  { nume: "Home", cale: "/" },
  { nume: "Search with sources", cale: "/features/search" },
] as const;
