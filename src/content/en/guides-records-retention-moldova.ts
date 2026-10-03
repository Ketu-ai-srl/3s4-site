// Pagina G2 a editiei `en`: termenele de pastrare a documentelor firmei in Republica Moldova (grupul referinta,
// poarta B).
//
// SURSA: fisa de continut a paginii (front matter si corpul pana la marcajul de sfarsit al textului paginii), in
// forma de dupa deciziile 38, 43 si 49 ale owner-ului si dupa trecerea de continut din 02.10 (termenul de pastrare
// se stabileste pe dosar, jurnalul de acces; fara registrul arhivei). Liniile de constructie ale fisei devin `cta`
// si `inJur`; notele fisei, imaginea optionala si blocul propus de date structurate in forma lui bruta nu intra
// aici. Textul e ASCII, in engleza americana; numele actelor moldovenesti sunt traducerile noastre.
//
// DATELE STRUCTURATE: nodul Article al fisei, cu aceleasi doua abateri ca la G1 (poarta de SEO are un vocabular
// inchis): `about` pastreaza numai tara, iar citarile sunt text (numele sursei si adresa ei).
//
// POARTA B: articolele 228, 236, 257 si 262 ale Indicatorului se recitesc inainte de publicare; pana atunci
// intrarile termenelor din registru sunt `neconfirmat`.

import type { PaginaContinut } from "@/content/model/tipuri";

const CITIT = "September 30, 2026";

/** Sursele paginii, citate in Article; tabelul surselor le foloseste prin cheie. */
const SURSE = {
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
  ordinInitial: {
    nume: "Order 57/2016 as first published",
    url: "https://www.legis.md/cautare/getResults?doc_id=94329&lang=ro",
  },
  anexaInitiala: {
    nume: "Annex file of Order 57/2016 as first published",
    url: "https://www.legis.md/UserFiles/Image/INDICATORUL.docx",
  },
  agentia: {
    nume: "National Archives Agency, internal normative acts",
    url: "https://arhiva.gov.md/acte/",
  },
  monitorul: {
    nume: "Monitorul Fiscal, August 19, 2016",
    url: "https://monitorul.fisc.md/editorial/noi-prevederi-cu-privire-la-pastrarea-documentelor-contabile-modul-de-nimicire-a-acestora-i-corelarea-lor-cu-necesitatea-entitaii-de-a-fi-supusa-controlului-fiscal-in-mod-obligatoriu.html",
  },
} as const;

/** O legatura in marcajul in linie, spre una dintre surse; textul implicit e numele ei. */
function spre(cheie: keyof typeof SURSE, text: string = SURSE[cheie].nume): string {
  return "[" + text + "](" + SURSE[cheie].url + ")";
}

const META = {
  titlu: "How Long to Keep Company Records in Moldova (2026) | 3S",
  descriere:
    "Retention periods for invoices, registers, payroll, contracts and tax returns in Moldova, per Order 57/2016 and Law 287/2017, with the check date.",
  cale: "/guides/records-retention-moldova",
};

const H1 = "How long to keep company records in Moldova (2026)";

export const pagina: PaginaContinut = {
  cheie: "guides-records-retention-moldova",
  meta: META,
  h1: H1,
  capsula:
    "In Moldova, invoices and other primary documents are kept for 6 years, counted from January 1 of the year after the file is closed. Accounting registers also take 6 years, contracts 6 years after they end (7 for foreign-currency transactions), and income tax returns 7 years. A dispute extends the term for invoices and registers until the final judgment.",
  sectiuni: [
    {
      cheie: "invoices",
      titlu: "How long must I keep invoices in Moldova?",
      blocuri: [
        {
          paragrafe: [
            "Six years. Article 228 of the Indicator sets 6 years for the primary documents that support business transactions: invoices, tax invoices, purchase acts, bank documents, handover certificates and advance settlements.",
            "The Indicator has two columns: one for organizations that are sources for the Archive Fund of the Republic of Moldova, and one for organizations whose documents are not part of it (Instruction, point 2.4). For invoices both columns say 6 years, so you do not need to know which one applies to you.",
            "The term is counted from January 1 of the year after the file is closed. The Instruction words this as the year in which the documents were finalized in the organization's records work (point 2.11). For example, a file closed in 2025 starts counting on January 1, 2026, and a 6-year term ends on December 31, 2031.",
            "If a dispute or a court case arises, the documents are kept until the final and irrevocable judgment (note to article 228).",
          ],
        },
      ],
    },
    {
      cheie: "other-records",
      titlu: "What about registers, payroll, contracts and tax returns?",
      blocuri: [
        {
          paragrafe: [
            'Each type of document has its own term in the Indicator. The table lists the ones companies ask about most. "General rule" means the counting rule above: January 1 of the year after the file is closed.',
          ],
          tabel: {
            forma: "cu-antet",
            titlu: "Retention terms for company records in Moldova",
            antet: ["Document", "Term", "Counted from", "Indicator article"],
            randuri: [
              [
                "Invoices, tax invoices, purchase acts, bank documents, handover certificates, advance settlements",
                "6 years",
                "General rule",
                "228",
              ],
              ["Accounting registers: general ledger, trial balance and other summary registers", "6 years", "General rule", "236"],
              [
                "Fixed-asset inventory cards, asset registers and primary documents on fixed assets",
                "6 years",
                "After the asset is removed from the balance sheet",
                "232",
              ],
              ["Salary payment statements", "6 years, or 75 years if no analytical account is kept for each employee", "General rule", "231"],
              ["Dividend payment statements", "6 years", "General rule", "231"],
              [
                "Analytical accounts (settlement registers) of employees",
                "75 years minus the employee's age when the file is closed",
                "General rule",
                "230",
              ],
              [
                "Personal files of workers and of technical or engineering staff",
                "75 years minus the employee's age when the file is closed",
                "General rule",
                "429",
              ],
              [
                "Contracts and agreements (economic, purchasing, operations, services)",
                "6 years; 7 years for contracts on foreign-currency transactions",
                "After the contract expires or is performed",
                "257",
              ],
              ["Income tax returns of entities (public authorities and institutions excluded)", "7 years", "General rule", "262"],
            ],
          },
          dupa: [
            "Checked on September 30, 2026, in the Indicator annexed to Order 57/2016. On every row above, both columns of the Indicator give the same term.",
            "The 75-year rule works like this: for an employee aged 40 when the file is closed, the term is 75 minus 40, so 35 years (Instruction, point 2.11). Article 230 also gives 5 years for the personal income-tax card of an employee.",
            "The note to article 429 sets shorter terms for some documents in a personal file, such as medical certificates and other secondary documents: 3 years after dismissal. It also sets terms for some pensioners' files. Read the note before you dispose of any personal file.",
            'Financial statements follow a different pattern. Article 224 gives "permanent" for organizations that are sources for the Archive Fund. For other organizations it states no term for annual statements and 10 years for semi-annual ones. Liquidation and distribution balance sheets, with their annexes and notes (article 225), are permanent, or 10 years for other organizations. Before you dispose of annual financial statements, ask the National Archives Agency.',
          ],
        },
      ],
    },
    {
      cheie: "electronic",
      titlu: "Can I keep records electronically?",
      blocuri: [
        {
          paragrafe: [
            "Yes. Article 17(2) of Law 287/2017 allows accounting documents to be kept on paper or in electronic form. Where the entity keeps its accounts in its own IT systems, the documents may be kept on technical media, provided they can be accessed at any time, as the entity needs or when the authorized bodies ask. Article 17(3) requires the entity to protect them from unauthorized changes.",
            "Article 17 does not say whether a scan can replace a paper original. Check with your adviser before you destroy originals.",
          ],
        },
      ],
    },
    {
      cheie: "lost",
      titlu: "What if documents are lost?",
      blocuri: [
        {
          paragrafe: ["Restore them within 3 months of finding that they were lost, stolen or destroyed (Law 287/2017, article 17(4))."],
        },
      ],
    },
    {
      cheie: "closure",
      titlu: "What happens to records when a company closes?",
      blocuri: [
        {
          paragrafe: [
            "When an entity ceases activity, its accounting documents are handed to the state archives, under the rules of the State body that supervises and administers the Archive Fund (Law 287/2017, article 17(5)). This guide does not cover that procedure.",
          ],
        },
      ],
    },
    {
      cheie: "destroy",
      titlu: "Can I destroy records when the term ends?",
      blocuri: [
        {
          paragrafe: ["Only through the procedure in the Instruction, points 3.1 to 3.9."],
          lista: {
            elemente: [
              "The organization sets up a permanent expert commission that selects documents for keeping or destruction (point 3.1) and prepares the selection protocols (point 3.3).",
              "An organization that is not a source for the Archive Fund does not have to coordinate protocols for expired documents with the state archives. The head of the organization approves them, and where relevant the head of the higher institution, provided the terms in the Indicator are respected (point 3.7^1).",
              "Documents that belong to the Archive Fund cannot be destroyed without authorization. Doing so is penalized under article 329 of the Contravention Code (point 3.8).",
              "Documents in an approved protocol go to a paper-recycling organization against handover invoices (point 3.9).",
            ],
          },
          dupa: ["If you are unsure whether your organization is a source for the Archive Fund, ask the National Archives Agency."],
        },
      ],
    },
    {
      cheie: "five-or-ten",
      titlu: "Why do some websites say 5 or 10 years?",
      blocuri: [
        {
          paragrafe: [
            "The 5-year figure is older. Before August 5, 2016, companies followed an earlier Indicator, approved by the State Archive Service on December 3, 1997, and never published in the Official Gazette. It set 5 years for primary documents, which could be destroyed only if the entity had already been through a tax inspection for that period. The 2016 Indicator dropped that condition and raised the term from 5 to 6 years (Monitorul Fiscal, August 19, 2016). Older pages may still say 5.",
            "The Indicator uses 10 years for some financial statements only: semi-annual statements and liquidation balance sheets of organizations that are not Archive Fund sources (articles 224 and 225). We did not find a 10-year term for invoices, registers or bank documents in the Indicator or in Law 287/2017. If you have a source that says otherwise, tell us.",
          ],
        },
      ],
    },
    {
      cheie: "how-3s-helps",
      titlu: "How can 3S help?",
      blocuri: [
        {
          paragrafe: [
            "In 3S, you can set a retention period for each folder, and it applies to the documents in it. Which period applies to a document is for you and your adviser to decide, and this guide does not decide it for you. The activity log records who opens and downloads documents.",
            "For invoices issued in the EU, read [E-invoice archiving in the EU](/guides/e-invoice-archiving-eu).",
            "To see how documents get in and come back as answers, read about the [3S platform](/platform) and about [search with sources](/features/search).",
          ],
        },
      ],
    },
    {
      cheie: "recent-changes",
      titlu: "What changed recently?",
      blocuri: [
        {
          paragrafe: [
            "This guide was first written on September 30, 2026, so no term has changed since. One amendment is coming: from January 1, 2027, Law 86 of May 21, 2026, changes the size limits in article 4 of Law 287/2017, and legis.md marks no change to article 17 on keeping documents.",
          ],
          tabel: {
            forma: "cu-antet",
            titlu: "Changes to the rules on keeping company records in Moldova",
            antet: ["Date", "Change"],
            randuri: [
              [
                "January 1, 2027",
                "Law 86 of May 21, 2026, takes effect. On legis.md, the amendment markers in Law 287/2017 sit on article 4, which sets the size limits for micro, small, medium and large entities, and on the harmonization clause. Article 17 carries none.",
              ],
              ["September 30, 2026", "First version of this guide. Every row was read on legis.md the same day."],
            ],
          },
          dupa: ["We review this guide every month. Next check: by October 31, 2026."],
        },
      ],
    },
    {
      cheie: "sources",
      titlu: "Where do these facts come from?",
      blocuri: [
        {
          paragrafe: [
            "Every row above comes from the primary sources below, read in a browser on September 30, 2026. Names of laws and orders are as the sources publish them.",
          ],
          tabel: {
            forma: "cu-antet",
            titlu: "Sources of this guide and the date we read them",
            antet: ["Source", "What we used", "Read on"],
            randuri: [
              [spre("lege"), "Duty to keep accounting documents, electronic form, loss, closure", CITIT],
              [spre("ordin"), "Two columns (point 2.4), counting rule (2.11), disposal (3.1 to 3.10)", CITIT],
              [spre("indicator"), "Articles 224, 225, 228, 230, 231, 232, 236, 257, 262 and 429", CITIT],
              [
                spre("ordinInitial") + ", with its " + spre("anexaInitiala", "annex file"),
                "The same articles; the terms on the rows above are identical",
                CITIT,
              ],
              [spre("agentia"), "The Agency lists Order 57/2016 among the acts it applies", CITIT],
              [spre("monitorul") + " (secondary source)", "Background on the change from 5 to 6 years", CITIT],
            ],
          },
          dupa: [
            "This guide covers the Indicator and Law 287/2017. Other laws, such as tax, customs, labor or sector rules, can set longer periods for specific documents.",
          ],
        },
      ],
    },
  ],
  cta: {
    ref: "en-ret-md",
    titluBloc: "Need this for your own archive?",
    textWhatsapp: "Hello 3S, I read your page on record retention in Moldova [ref:en-ret-md]. I would like to ask about a pilot.",
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
      citation: Object.values(SURSE).map((s) => s.nume + ", " + s.url),
    },
    {
      "@type": "WebPage",
      name: META.titlu,
      description: META.descriere,
      inLanguage: "en",
    },
  ],
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

/** Ce pune pagina in jurul corpului: firul, randul cu data verificarii, legatura de semnalare si blocul de final. */
export const inJur = {
  fir: [
    { text: "Home", cale: "/" },
    { text: "Records retention in Moldova", cale: "/guides/records-retention-moldova" },
  ],
  etichetaFir: "Breadcrumb",
  microtext: "A person replies, in English or Romanian. No form, no account.",
  inainteDeEmail: "Or write to",
  verificare:
    "**Last verified: September 30, 2026.** We read Law 287/2017 and Order 57/2016, with its Indicator of standard documents and their retention periods, on legis.md, the State Register of Legal Acts. This guide is not legal advice. Check your case with your adviser.",
  semnalare: {
    text: "Tell us if a row is out of date",
    textWhatsapp: "Hello 3S, a row on the Moldova record retention guide looks out of date [ref:en-ret-md].",
  },
  final: {
    paragrafe: ["Tell us what you keep, in which language and roughly how much."],
    veziSi: "Please do not send documents or personal data in your first message. Prefer another channel? See [Contact](/contact).",
  },
};
