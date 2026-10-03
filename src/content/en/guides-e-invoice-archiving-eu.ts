// Pagina G1 a editiei `en`: arhivarea e-facturilor in UE, pe tari (grupul referinta, poarta B).
//
// SURSA: fisa de continut a paginii (front matter si corpul pana la marcajul de sfarsit al textului paginii), in
// forma de dupa deciziile 38, 41-43 si 49 ale owner-ului si dupa trecerea de continut din 02.10 (termenul de
// pastrare se stabileste pe dosar, jurnalul de acces; fara registrul arhivei). Liniile de constructie ale fisei
// (butoane, legaturi, imagini) devin `cta` si `inJur`; notele fisei, imaginea optionala si blocul propus de date
// structurate in forma lui bruta nu intra aici. Textul e ASCII, in engleza americana.
//
// DATELE STRUCTURATE: nodul Article al fisei, cu doua abateri cerute de poarta de SEO (vocabularul ei inchis nu
// are tipurile folosite de fisa pentru `about` si `citation`): `about` pastreaza numai tarile (`Country`), iar
// citarile sunt text (numele sursei si adresa ei), luate din aceeasi lista cu tabelul surselor. Raspunsurile
// FAQPage nu se scriu aici: le scrie scheletul din textul vizibil.
//
// POARTA B: cifrele de pastrare, formatul si locul arhivei se reverifica la sursa inainte de publicare (Belgia art.
// 60 par. 3, Polonia, Romania 2026, BOFiP); pana atunci intrarile lor din registru sunt `neconfirmat`.

import type { PaginaContinut } from "@/content/model/tipuri";

const CITIT = "September 30, 2026";

/** Sursele paginii: tabelul "Where do these facts come from?" si citarile din Article, din aceeasi lista. */
const SURSE: readonly { tara: string; nume: string; url: string; folosit: string }[] = [
  {
    tara: "EU",
    nume: "VAT Directive 2006/112/EC, consolidated version of April 14, 2025",
    url: "https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:02006L0112-20250414",
    folosit: "Articles 247, 248a and 249",
  },
  {
    tara: "EU",
    nume: "Directive (EU) 2025/516",
    url: "https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32025L0516",
    folosit: "Articles 5 and 6(5): dates from July 1, 2030, and January 1, 2035",
  },
  {
    tara: "Germany",
    nume: "UStG sec. 14",
    url: "https://www.gesetze-im-internet.de/ustg_1980/__14.html",
    folosit: "Definition of the e-invoice, authenticity and integrity",
  },
  {
    tara: "Germany",
    nume: "UStG sec. 14b",
    url: "https://www.gesetze-im-internet.de/ustg_1980/__14b.html",
    folosit: "8 years, counting rule, place of storage",
  },
  {
    tara: "Germany",
    nume: "AO sec. 147",
    url: "https://www.gesetze-im-internet.de/ao_1977/__147.html",
    folosit: "Periods for accounting vouchers, counting rule",
  },
  {
    tara: "Germany",
    nume: "Federal Ministry of Finance, FAQ on the mandatory e-invoice (as of March 2026)",
    url: "https://www.bundesfinanzministerium.de/Content/DE/FAQ/e-rechnung.html",
    folosit: "Calendar, formats, storage of the structured part",
  },
  {
    tara: "France",
    nume: "Commercial Code, art. L123-22",
    url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000006219327",
    folosit: "10 years for accounting documents and supporting documents",
  },
  {
    tara: "France",
    nume: "Service-Public, sheet F10029 (verified by the publisher on July 1, 2024)",
    url: "https://entreprendre.service-public.gouv.fr/vosdroits/F10029",
    folosit: "Invoices as supporting documents, counting from the close of the financial year",
  },
  {
    tara: "France",
    nume: "Tax Procedure Code, art. L102 B",
    url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000041471233/",
    folosit: "6 years for tax control, in the version in force to January 1, 2027",
  },
  {
    tara: "France",
    nume: "Law 2026-534 of June 25, 2026, article 36",
    url: "https://www.legifrance.gouv.fr/jorf/article_jo/JORFARTI000054309787",
    folosit: "Change from 6 to 10 years",
  },
  {
    tara: "France",
    nume: "BOFiP BOI-CF-COM-10-10-30, version in force from September 3, 2025",
    url: "https://bofip.impots.gouv.fr/bofip/645-PGP.html/identifiant=BOI-CF-COM-10-10-30-20250903",
    folosit: "Original format, place of storage, access",
  },
  {
    tara: "France",
    nume: "Tax administration (DGFiP), start-up guide for e-invoicing at September 1, 2026",
    url: "https://www.impots.gouv.fr/sites/default/files/media/1_metier/2_professionnel/EV/2_gestion/290_facturation_electronique/guide_pratique_facturation_electronique.pdf",
    folosit: "Calendar, accredited platform, start-up period",
  },
  {
    tara: "Poland",
    nume: "Ministry of Finance, KSeF legal basis and key dates",
    url: "https://ksef.podatki.gov.pl/informacje-ogolne-ksef-20/podstawy-prawne-oraz-kluczowe-terminy/",
    folosit: "Calendar, simplifications to the end of 2026",
  },
  {
    tara: "Poland",
    nume: "Ministry of Finance, KSeF rules and legal provisions (Q&A)",
    url: "https://ksef.podatki.gov.pl/ksef-news/zasady-obowiazywania-ksef-i-przepisy-prawne/",
    folosit: "Question 10: where invoices are stored and why for 10 years",
  },
  {
    tara: "Poland",
    nume: "Ministry of Finance, KSeF 2.0 questions and answers",
    url: "https://ksef.podatki.gov.pl/pytania-i-odpowiedzi-ksef-20/",
    folosit: "Questions 3, 40, 70, 75 and 82: format, QR code, printing, long-lived assets",
  },
  {
    tara: "Poland",
    nume: "VAT Act, consolidated text, Dziennik Ustaw 2025 item 775",
    url: "https://dziennikustaw.gov.pl/D2025000077501.pdf",
    folosit: "Articles 112, 112a and 112aa",
  },
  {
    tara: "Poland",
    nume: "Law of August 5, 2025, Dziennik Ustaw 2025 item 1203",
    url: "https://dziennikustaw.gov.pl/D2025000120301.pdf",
    folosit: "Phased start of KSeF",
  },
  {
    tara: "Poland",
    nume: "Tax Ordinance, consolidated text, Dziennik Ustaw 2025 item 111",
    url: "https://dziennikustaw.gov.pl/D2025000011101.pdf",
    folosit: "Article 70 para. 1: limitation period",
  },
  {
    tara: "Belgium",
    nume: 'BOSA (the Belgian federal e-invoicing portal), "Structured e-invoices between businesses are mandatory since 2026"',
    url: "https://efacture.belgium.be/fr/article/les-factures-electroniques-structurees-entre-entreprises-sont-obligatoires-depuis-2026",
    folosit: "Scope, Peppol",
  },
  {
    tara: "Belgium",
    nume: 'BOSA, "End of the tolerance period for e-invoicing" (April 7, 2026)',
    url: "https://efacture.belgium.be/fr/news/fin-de-la-periode-de-tolerance-pour-le-facturation",
    folosit: "Tolerance periods",
  },
  {
    tara: "Belgium",
    nume: 'BOSA, "How to keep invoices received through e-invoicing" (April 8, 2026)',
    url: "https://efacture.belgium.be/fr/article/comment-conserver-des-factures-recues-la-facturation-electronique",
    folosit: "7 years, format, place of storage, third-party archives",
  },
  {
    tara: "Belgium",
    nume: "Law of December 18, 2025 (Justel, file 2025121806)",
    url: "https://www.ejustice.just.fgov.be/cgi_loi/article.pl?language=fr&lg_txt=f&type=&sort=&numac_search=&cn_search=2025121806&caller=eli&view_numac=2025121806nl",
    folosit: "Articles 97 and 101: from 10 to 7 years, from taxes due on January 1, 2023",
  },
  {
    tara: "Romania",
    nume: "Accounting Law 82/1991, consolidated on legislatie.just.ro (latest consolidation February 4, 2025)",
    url: "https://legislatie.just.ro/Public/DetaliiDocument/1576",
    folosit: "Article 25: 5 years, counting rule",
  },
  {
    tara: "Romania",
    nume: "Accounting Law 82/1991, republished text of 2008",
    url: "https://legislatie.just.ro/Public/DetaliiDocumentAfis/94309",
    folosit: "The earlier 10 and 50-year rule",
  },
  {
    tara: "Romania",
    nume: "Order 2634/2015 of the Ministry of Public Finance",
    url: "https://static.anaf.ro/static/10/Anaf/legislatie/OMFP_2634_2015.pdf",
    folosit: "Annex 1, point 40: assets with a long useful life",
  },
  {
    tara: "Romania",
    nume: "Fiscal Code, consolidated on legislatie.just.ro (latest consolidation August 8, 2026)",
    url: "https://legislatie.just.ro/Public/DetaliiDocument/171282",
    folosit: "Article 305(8): capital goods. Article 319(25) and (32) to (37): format, place of storage, translation",
  },
  {
    tara: "Romania",
    nume: "ANAF, guide to the RO e-Factura system (2023)",
    url: "https://static.anaf.ro/static/10/Anaf/AsistentaContribuabili_r/Ghid_RO_eFactura.pdf",
    folosit: "Calendar, format, 60 days in the system, then archive",
  },
];

const META = {
  titlu: "E-Invoice Archiving in the EU: Retention and Format by Country",
  descriere:
    "How long to keep e-invoices and in what format: Germany, France, Poland, Belgium and Romania, with primary sources and the date each row was checked.",
  cale: "/guides/e-invoice-archiving-eu",
};

const H1 = "E-invoice archiving in the EU: how long to keep them, and in what format";

export const pagina: PaginaContinut = {
  cheie: "guides-e-invoice-archiving-eu",
  meta: META,
  h1: H1,
  capsula:
    "Each EU country sets its own retention period for invoices: 8 years in Germany, 10 in France, 7 in Belgium, 5 in Romania. In Poland, the KSeF system stores structured invoices for 10 years. Germany and France expect the original electronic file to be kept, not only a PDF. Each retention row names its legal basis and check date.",
  sectiuni: [
    {
      cheie: "how-long",
      titlu: "How long must e-invoices be kept in each country?",
      blocuri: [
        {
          paragrafe: [
            "Germany requires 8 years, France 10 years for accounting documents, Belgium 7 years and Romania 5 years. In Poland, KSeF holds structured invoices for 10 years, and you keep them longer, outside KSeF, only while the tax liability is still open. The table gives the counting rule and the legal basis for each row.",
          ],
          tabel: {
            forma: "cu-antet",
            titlu: "E-invoice retention periods by country",
            antet: ["Country", "How long", "Counted from", "Legal basis", "Checked"],
            randuri: [
              [
                "Germany",
                "8 years",
                "End of the calendar year of issue",
                "VAT Act (UStG) sec. 14b(1); German Fiscal Code (AO) sec. 147(1) no. 4 and (3)",
                "30 Sep 2026",
              ],
              [
                "France, accounting",
                "10 years",
                "Close of the financial year",
                "Commercial Code, art. L123-22; Service-Public sheet F10029",
                "30 Sep 2026",
              ],
              [
                "France, tax control",
                "6 years in the text in force today; 10 years for documents whose period expires after January 1, 2027",
                "Date of the last entry in the books, or the date the document was established",
                "Tax Procedure Code, art. L102 B; Law 2026-534, art. 36",
                "30 Sep 2026",
              ],
              ["Poland, in KSeF", "10 years", "End of the year of issue", "VAT Act, art. 112aa(1)", "30 Sep 2026"],
              [
                "Poland, outside KSeF or after its 10 years",
                "Until the tax liability is time-barred: 5 years",
                "End of the calendar year when the tax payment was due",
                "VAT Act, arts 112, 112a and 112aa(2); Tax Ordinance, art. 70 para. 1",
                "30 Sep 2026",
              ],
              [
                "Belgium",
                "7 years",
                "January 1 of the year after the invoice date",
                "VAT Code, art. 60 para. 3, as amended by the Law of December 18, 2025, art. 97; BOSA guidance",
                "30 Sep 2026",
              ],
              [
                "Romania",
                "5 years",
                "July 1 of the year after the end of the financial year in which the document was prepared",
                "Accounting Law 82/1991, art. 25, as amended by Law 36/2023",
                "30 Sep 2026",
              ],
            ],
          },
        },
        {
          paragrafe: ["These details change the answer in specific cases."],
          lista: {
            elemente: [
              "**Germany.** As long as an assessment period that depends on the invoice is still open, the retention period keeps running (AO sec. 147(3)).",
              "**France.** The BOFiP commentary in force since September 3, 2025, still says 6 years for tax control and does not yet reflect Law 2026-534.",
              "**Poland.** After the 10 years in KSeF, you keep the invoice outside KSeF if the limitation period is still running. The Ministry's example is a fixed asset that you depreciate over more than 10 years.",
              "**Belgium.** The official guidance says the rules are the same as for paper invoices. Invoices tied to VAT deduction on immovable investment goods let with VAT may have to be kept 15 or 25 years under the revision rules.",
              "**Romania.** Before January 15, 2023, the term was 10 years, and 50 years for payroll statements. Documents that show the origin of an asset with a useful life above 5 years are kept for that useful life (Order 2634/2015, annex 1, point 40). Records on capital goods are kept until 5 years after the VAT adjustment period ends (Romanian Fiscal Code, art. 305(8)).",
            ],
          },
        },
      ],
    },
    {
      cheie: "eu-wide",
      titlu: "Is there an EU-wide retention period?",
      blocuri: [
        {
          paragrafe: [
            "No. Article 247(1) of the VAT Directive (2006/112/EC) says that each Member State determines the period for which taxable persons store invoices. That covers invoices for supplies made in its territory and invoices received by businesses established there.",
            "Article 247(2) lets a Member State require invoices to be kept in the original form in which they were sent or made available. For electronic invoices it may also require the data that guarantee authenticity and integrity to be stored. Article 249 gives the tax authorities of the state where the business is established, and of the state where the VAT is due, the right to access, download and use invoices that the business stores electronically with online access.",
            "This guide covers Germany, France, Poland, Belgium and Romania. Other Member States set their own periods under the same article.",
            "Article 248a matters if your invoices are in another language. For control purposes, a Member State may ask for a translation into its official languages for certain taxable persons or cases, but it may not impose a general translation requirement. Romania uses this option in art. 319(36) of its Fiscal Code.",
          ],
        },
      ],
    },
    {
      cheie: "format",
      titlu: "In what format must e-invoices be kept?",
      blocuri: [
        {
          paragrafe: [
            "Keep the original structured file, usually XML, as you sent or received it. Germany and France say so in their official guidance. Belgium and Romania allow other formats when authenticity and integrity are ensured, and Belgium strongly recommends keeping the XML. In Poland and Romania, the XML file is the invoice.",
          ],
          tabel: {
            forma: "cu-antet",
            titlu: "What the official sources say about the format of e-invoices",
            antet: ["Country", "What the official sources say", "Source"],
            randuri: [
              [
                "Germany",
                "An e-invoice is issued, sent and received in a structured electronic format that allows electronic processing. Keep at least the structured part intact and in its original form. In hybrid formats such as ZUGFeRD, the structured data lead if they differ from the image. XRechnung and ZUGFeRD 2.0.1 or later meet the requirements, except the MINIMUM and BASIC-WL profiles.",
                "UStG sec. 14(1); Federal Ministry of Finance FAQ, questions 7, 12a and 13",
              ],
              [
                "France",
                "Keep e-invoices in the original format in which they were issued and transmitted. You may convert them for management purposes if you also keep the original. The guidance gives an example: an XML invoice kept as XML and converted to PDF for internal use.",
                "BOFiP BOI-CF-COM-10-10-30, paragraphs 180 and 360",
              ],
              [
                "Poland",
                "The invoice is an XML file that KSeF holds under a KSeF number. A PDF or printout used outside KSeF must carry a QR code with the KSeF number. Invoices need not be printed for a paper archive.",
                "KSeF Q&A 2.0, questions 3, 40, 70 and 75",
              ],
              [
                "Belgium",
                "Paper or electronic, in any format, as long as authenticity of origin and integrity of content are ensured from issue to the end of the retention period. Keeping the original XML is strongly recommended, because after a conversion the burden of proof is heavier. Prior approval by the tax administration is not needed.",
                'BOSA, "How to keep invoices received through e-invoicing"',
              ],
              [
                "Romania",
                "XML that meets EN 16931 and the national RO_CIUS rules. The original of an e-invoice is the XML file with the Ministry of Finance's electronic seal. A PDF is not an e-invoice under these rules. Invoices may be kept on paper or in electronic form, whatever their original form, if authenticity of origin, integrity of content and legibility are ensured until the end of the retention period.",
                "ANAF, RO e-Factura guide, chapter II point 1 and Q&A 2 and 4; Fiscal Code, art. 319(25) and (35)",
              ],
            ],
          },
        },
      ],
    },
    {
      cheie: "where",
      titlu: "Where can I store the archive?",
      blocuri: [
        {
          paragrafe: [
            "Germany, France, Poland, Belgium and Romania let you store invoices electronically outside their territory, under conditions. In Germany, France, Poland and Romania the condition is online access for the tax authority. Belgium asks that you can hand invoices over without delay, and asks for full online access if you are established in Belgium and keep them abroad. In Belgium, the official guidance adds that if a third-party archive cannot meet your legal obligations, you must find another solution or another provider.",
          ],
          tabel: {
            forma: "cu-antet",
            titlu: "Where the e-invoice archive may be kept, by country",
            antet: ["Country", "Where the archive may be", "Source"],
            randuri: [
              [
                "Germany",
                "In Germany. Electronic storage elsewhere in the EU is allowed if the tax authority has full online access with download and use, and you tell the tax office where the archive is. Storage outside the EU is governed by AO sec. 146(2b).",
                "UStG sec. 14b(2) to (5)",
              ],
              [
                "France",
                "Paper invoices in France. Electronic invoices in France, in another EU Member State, or in a non-EU country that has a mutual-assistance or online-access agreement with France. The tax authority must have online access wherever the archive is.",
                "BOFiP BOI-CF-COM-10-10-30, paragraphs 360 to 430",
              ],
              [
                "Poland",
                "In Poland if the business is based there. Abroad if kept electronically with online access for the tax authority. Invoices in KSeF are stored there.",
                "VAT Act, art. 112a(2) and (3)",
              ],
              [
                "Belgium",
                "Free choice for VAT purposes if you can hand invoices to the tax administration without delay. A business established in Belgium keeps them in Belgium, unless it keeps them electronically with full online access in Belgium. The same applies if the tax on the transactions is due in Belgium, wherever the business is established.",
                'BOSA, "How to keep invoices received through e-invoicing"',
              ],
              [
                "Romania",
                "A business with its seat in Romania keeps its invoices in Romania, except electronic invoices for which it ensures online access for the tax authority. Those may be kept elsewhere if the authority can access, download and use them online, and the business tells the authority where they are. The place cannot be in a country with no mutual-assistance or online-access instrument.",
                "Fiscal Code, art. 319(32) to (34) and (37)",
              ],
              [
                "EU rule",
                "A Member State may set conditions that prohibit or restrict storage in a country with which it has no legal instrument on mutual assistance, or on the right of electronic access, download and use referred to in article 249.",
                "Directive 2006/112/EC, art. 247(3)",
              ],
            ],
          },
          dupa: ["The rows describe a business established in the country named. A business established elsewhere can face different rules."],
        },
      ],
    },
    {
      cheie: "who-else",
      titlu: "Who else stores your invoices?",
      blocuri: [
        {
          paragrafe: [
            "Two of the five countries run a state system that keeps a copy of the invoice. In Poland, KSeF stores each structured invoice for 10 years, counted from the end of its year of issue. In Romania, RO e-Factura keeps the XML files available for download for 60 days from publication, then archives them electronically and releases them on request.",
            "For Germany, France and Belgium, the sources we read describe no state archive of the invoice itself. The archive stays with the business, which may use a third-party service. The Polish Ministry gives the reason for its 10 years: possible periods for correcting input VAT, for example on property.",
          ],
        },
      ],
    },
    {
      cheie: "calendar",
      titlu: "Which countries require e-invoicing, and from when?",
      blocuri: [
        {
          paragrafe: [
            "Belgium, Poland, Romania, Germany and France each require structured e-invoices between businesses, on different dates. Belgium has required them since January 1, 2026, and Poland since February 1 and April 1, 2026. Romania has done so since 2024. Germany has required receiving since January 1, 2025, and France began on September 1, 2026.",
          ],
          tabel: {
            forma: "cu-antet",
            titlu: "E-invoicing requirements and start dates by country",
            antet: ["Country", "What is required", "From", "Source", "Checked"],
            randuri: [
              [
                "Belgium",
                "Structured e-invoices between Belgian VAT-registered businesses, sent over the Peppol network. A business that invoices only consumers must still be able to receive them.",
                "January 1, 2026. A general tolerance period covered the first three months.",
                "BOSA, overview and tolerance news (April 7, 2026)",
                "30 Sep 2026",
              ],
              [
                "Poland",
                "Invoices issued through KSeF, in the FA(3) structure. Some simplifications run to December 31, 2026.",
                "February 1, 2026, for businesses with 2024 sales above PLN 200 million, VAT included. April 1, 2026, for all others.",
                "Ministry of Finance, KSeF key dates; Law of August 5, 2025",
                "30 Sep 2026",
              ],
              [
                "Romania",
                "Between businesses established in Romania: XML that meets EN 16931 and RO_CIUS, sent through RO e-Factura.",
                "Reporting of B2B invoices from January 1, 2024. Sending through RO e-Factura from July 1, 2024.",
                "ANAF, RO e-Factura guide (2023), chapter I",
                "30 Sep 2026",
              ],
              [
                "Germany",
                "Every domestic business must be able to receive e-invoices. For issuing, paper invoices remain allowed during a transition, and so does another electronic format such as a PDF if the recipient agrees.",
                "Receiving from January 1, 2025. The transition for issuing ends on December 31, 2026, or on December 31, 2027, if the issuer's turnover in the previous year was up to EUR 800,000.",
                "Federal Ministry of Finance FAQ, questions 2, 11 and 12",
                "30 Sep 2026",
              ],
              [
                "France",
                "Every business concerned must be able to receive e-invoices. Large and mid-size companies also have to issue them and to send e-reporting data. SMEs and micro-enterprises must issue them. All through an accredited platform.",
                "September 1, 2026, for receiving, and for issuing by large and mid-size companies. September 1, 2027, for issuing by SMEs and micro-enterprises.",
                "DGFiP, start-up guide for e-invoicing",
                "30 Sep 2026",
              ],
              [
                "EU",
                "E-invoicing and digital reporting for supplies between Member States (Directive (EU) 2025/516).",
                "July 1, 2030. States that had, or had authorized, a domestic real-time reporting system before January 1, 2024, may apply the new rules to domestic transactions as late as January 1, 2035.",
                "Directive (EU) 2025/516, articles 5 and 6(5)",
                "30 Sep 2026",
              ],
            ],
          },
          dupa: ["The EUR 800,000 and PLN 200 million figures are legal thresholds set by the two countries. They are not 3S prices."],
        },
      ],
    },
    {
      cheie: "recent-changes",
      titlu: "What changed recently?",
      blocuri: [
        {
          paragrafe: [
            "France, Belgium and Poland changed rules in 2026. Belgium cut its VAT retention period from 10 to 7 years. France passed a law that lengthens its tax-control period from 6 to 10 years for documents whose period expires after January 1, 2027. Poland made KSeF mandatory.",
          ],
          tabel: {
            forma: "cu-antet",
            titlu: "Recent changes to e-invoicing and retention rules",
            antet: ["Date", "Country", "Change", "Source"],
            randuri: [
              [
                "September 1, 2026",
                "France",
                "Mandatory e-invoicing started for large and mid-size companies, and every business concerned must now be able to receive e-invoices. The tax authority's start-up guide says penalties will not be applied automatically to companies making a serious effort to comply. It also says the calendar is not postponed.",
                "DGFiP, start-up guide",
              ],
              [
                "June 26, 2026",
                "France",
                "Law 2026-534 of June 25, 2026, was published. Its article 36 lengthens the tax-control retention period from 6 to 10 years for documents and records whose period expires after January 1, 2027.",
                "Law 2026-534, art. 36 (Legifrance)",
              ],
              ["April 1, 2026", "Poland", "KSeF became mandatory for all remaining taxpayers.", "Ministry of Finance, KSeF key dates"],
              [
                "February 1, 2026",
                "Poland",
                "KSeF became mandatory for taxpayers with 2024 sales above PLN 200 million, VAT included, and KSeF version 2.0 went into production.",
                "Ministry of Finance, KSeF key dates; Law of August 5, 2025",
              ],
              [
                "January 9, 2026",
                "Belgium",
                "The Law of December 18, 2025, entered into force. It cuts the retention period for VAT books and documents from 10 to 7 years, and applies to taxes that became due from January 1, 2023.",
                "Law of December 18, 2025 (Justel), arts 97 and 101",
              ],
              [
                "January 1, 2026",
                "Belgium",
                "B2B e-invoicing became mandatory. The general tolerance period covered the first three months. A narrower tolerance for self-billing ran until June 30, 2026.",
                "BOSA, overview and tolerance news",
              ],
            ],
          },
          dupa: ["We review this guide every month. Next check: by October 31, 2026."],
        },
      ],
    },
    {
      cheie: "how-3s-helps",
      titlu: "How can 3S help?",
      blocuri: [
        {
          paragrafe: [
            "3S is a document archive with AI search, operated from Moldova. You can download invoices as XML files from RO e-Factura and upload them to the archive. In 3S, you can set a retention period for each folder, and it applies to the documents in it. Which period applies to a document is for you and your adviser to decide, and this guide does not decide it for you. The activity log records who opens and downloads documents.",
            "Where the archive sits matters, as the location rules above show. Files are stored in the EU, with Frankfurt as the primary region. The [About page](/about#security) names the hosting provider, which is a US company, and explains what US law says about data in a US provider's care. Whether that location meets your country's rules is a question for your adviser.",
            "For company records in Moldova, read [Records retention in Moldova](/guides/records-retention-moldova).",
            "To see how documents get in and come back as answers, read about the [3S platform](/platform) and about [search with sources](/features/search).",
          ],
        },
      ],
    },
    {
      cheie: "legal-advice",
      titlu: "Is this legal advice?",
      blocuri: [
        {
          paragrafe: [
            "No. This guide reports what the sources say on the date shown. It does not apply them to your company. Periods can depend on the type of document, the legal form and size of the business and the sector. Check your case with your accountant or lawyer before you dispose of any invoice.",
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
            "Every row above comes from the primary sources below, read on September 30, 2026. Names of laws and bodies are as the sources publish them, and we translated the German, French, Polish and Romanian passages ourselves.",
          ],
          tabel: {
            forma: "cu-antet",
            titlu: "Primary sources of this guide and the date we read them",
            antet: ["Country", "Source", "What we used", "Read on"],
            randuri: SURSE.map((s) => [s.tara, "[" + s.nume + "](" + s.url + ")", s.folosit, CITIT]),
          },
        },
      ],
    },
  ],
  cta: {
    ref: "en-einv",
    titluBloc: "Need this for your own archive?",
    textWhatsapp: "Hello 3S, I read your page on e-invoice archiving [ref:en-einv]. I would like to ask about a pilot.",
    subiectEmail: "3S inquiry [ref:en-einv]",
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
      about: ["Germany", "France", "Poland", "Belgium", "Romania"].map((name) => ({ "@type": "Country", name })),
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
    "en-referinta-efacturare-ue-art-247",
    "en-referinta-efacturare-arhivare-de-8-ani",
    "en-referinta-efacturare-arhivare-fr-10-ani-comercial",
    "en-referinta-efacturare-arhivare-fr-fiscal-6-10-ani",
    "en-referinta-efacturare-arhivare-pl-ksef-10-ani",
    "en-referinta-efacturare-arhivare-pl-in-afara-ksef",
    "en-referinta-efacturare-arhivare-be-7-ani",
    "en-referinta-termene-ro-facturi-5-ani",
    "en-referinta-efacturare-format-original-de-fr",
    "en-referinta-efacturare-format-pl-ro-be",
    "en-referinta-efacturare-ro-format",
    "en-referinta-efacturare-stocare-locatie",
    "en-referinta-efacturare-ro-60-zile",
    "en-referinta-efacturare-de-calendar",
    "en-referinta-efacturare-fr-calendar",
    "en-referinta-efacturare-pl-calendar",
    "en-referinta-efacturare-be-calendar",
    "en-referinta-efacturare-ro-etape-2024",
    "en-referinta-efacturare-ue-vida",
    "en-referinta-efacturare-canale-3s",
    "en-referinta-comparatii-registru-termene",
    "en-gazduire-ue-frankfurt",
    "en-produs-amazon-sediu-sua",
    "en-operator-din-moldova",
    "en-ghiduri-cu-surse",
  ],
};

/** Ce pune pagina in jurul corpului: firul, randul cu data verificarii, legatura de semnalare si blocul de final. */
export const inJur = {
  fir: [
    { text: "Home", cale: "/" },
    { text: "E-invoice archiving in the EU", cale: "/guides/e-invoice-archiving-eu" },
  ],
  etichetaFir: "Breadcrumb",
  microtext: "A person replies, in English or Romanian. No form, no account.",
  inainteDeEmail: "Or write to",
  verificare:
    "**Last verified: September 30, 2026.** We read the laws, the tax authorities' guidance and the national e-invoicing portals of the five countries on the date shown. Every source is listed with its link at the end of the page. This guide is not legal advice. Check your case with your adviser.",
  semnalare: {
    text: "Tell us if a row is out of date",
    textWhatsapp: "Hello 3S, a row on the e-invoice archiving guide looks out of date [ref:en-einv].",
  },
  final: {
    paragrafe: ["Tell us which countries your invoices come from and roughly how many you keep."],
    veziSi: "Please do not send documents or personal data in your first message. Prefer another channel? See [Contact](/contact).",
  },
};
