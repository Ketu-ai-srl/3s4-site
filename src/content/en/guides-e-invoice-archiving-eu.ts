// Pagina G1 a editiei `en`: arhivarea e-facturilor in UE, pe tari (grupul referinta, poarta B), perechea paginii RO
// `/e-facturare`.
//
// FORMA (decizia 53, felia editie-referinta): pagina compune sectiunile paginii RO, in aceeasi ordine (cele 11 din
// `src/components/efacturare/SectiuniEfacturare.tsx`, apoi CtaFinalInchis), cu textul de aici, pe contractul
// `ContinutEfacturare`. Toate cele 12 sectiuni se monteaza (decizia 59, "totul intra"). Campurile scoase: canalele
// machetei (deciziile 43 si 49), insigna Peppol a formatelor (43), sursele termenului de transmitere si SAF-T din
// randul Romaniei si calendarul `.ics` (termenele romanesti D406, ruta numai pe RO), butonul secundar al blocului de
// final (`/incepe` nu exista pe 3s.md). Lista declarata: `config/congruenta/g1.json`.
//
// SURSA TEXTULUI: fisa de continut a paginii, sectiunea "Component copy (decision 53)" (campurile A, A-adaptat si
// G, cu cheile contractului RO); starea lui e PROPUS pana la aprobarea owner-ului pe capturi. Textul aprobat fara loc
// in compunerea RO (tabelele de pastrare, format si loc, jurnalul complet, tabelul surselor) ramane in fisa. Textul
// e ASCII, in engleza americana; datele in forma americana (decizia 9).
//
// DATELE STRUCTURATE: nodul Article al fisei (`about` numai tarile, citarile ca text: numele sursei si adresa ei) si
// nodul WebPage; FAQPage il pune sectiunea intrebarilor, din intrebarile vizibile.
//
// POARTA B: cifrele de pastrare, formatul si locul arhivei se reverifica la sursa inainte de publicare; pana atunci
// intrarile lor din registru sunt `neconfirmat`.

import type { ContinutEfacturare } from "@/components/efacturare/SectiuniEfacturare";
import type { Sursa } from "@/content/efacturare/surse";
import {
  ETICHETA_BUTON_CANAL,
  ETICHETA_FIR,
  ctaFinal,
  type PaginaReferinta,
} from "./referinta-comun";

const CALE = "/guides/e-invoice-archiving-eu";

/** Ziua verificarii pe editia EN (fisa, `last_verified`). */
const CITIT = "September 30, 2026";

/** Sursele faptelor din fisa (tabelul "Where do these facts come from?" al corpului aprobat), citate in Article. */
const SURSE: readonly {
  tara: string;
  nume: string;
  url: string;
  folosit: string;
}[] = [
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
    folosit:
      "Articles 5 and 6(5): dates from July 1, 2030, and January 1, 2035",
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
    folosit:
      "Invoices as supporting documents, counting from the close of the financial year",
  },
  {
    tara: "France",
    nume: "Tax Procedure Code, art. L102 B",
    url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000041471233/",
    folosit:
      "6 years for tax control, in the version in force to January 1, 2027",
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
    folosit:
      "Questions 3, 40, 70, 75 and 82: format, QR code, printing, long-lived assets",
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
    folosit:
      "Articles 97 and 101: from 10 to 7 years, from taxes due on January 1, 2023",
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
    folosit:
      "Article 305(8): capital goods. Article 319(25) and (32) to (37): format, place of storage, translation",
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
    "How long to keep e-invoices and in what format: Germany, France, Poland, Belgium and Romania, with primary sources and the date they were checked.",
  cale: CALE,
};

// Rol: titlul-teza al eroului (h1 aprobat).
const H1 =
  "E-invoice archiving in the EU: how long to keep them, and in what format";

/** Sursele oficiale de langa valori (tabel, jurnal, ghidul autoritatii), pe aceleasi chei ca pe pagina RO. */
const SURSE_TABEL: Record<string, Sursa> = {
  roGhid: {
    id: "ro-ghid-efactura",
    eticheta: "ANAF, e-Factura",
    autoritate: "ANAF",
    titlu: "Guide to the national RO e-Factura system",
    url: "https://static.anaf.ro/static/10/Anaf/AsistentaContribuabili_r/Ghid_RO_eFactura.pdf",
    ce: "Guide published in December 2023: chapter I (the stages of January 1 and July 1, 2024), chapter III point 5 (60 days to download), chapter IV (EN 16931 and RO_CIUS).",
  },
  ueVida: {
    id: "ue-directiva-2025-516",
    eticheta: "EUR-Lex",
    autoritate: "EUR-Lex, Official Journal of the EU",
    titlu: "Directive (EU) 2025/516",
    url: "https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32025L0516",
    ce: "Article 6(5): the rules on e-invoicing and digital reporting apply from July 1, 2030; the European standard EN 16931.",
  },
  de: {
    id: "de-bmf-e-rechnung",
    eticheta: "BMF",
    autoritate: "Federal Ministry of Finance",
    titlu: "FAQ on the mandatory e-invoice (as of March 2026)",
    url: "https://www.bundesfinanzministerium.de/Content/DE/FAQ/e-rechnung.html",
    ce: "Definition of the e-invoice, accepted formats and question 11 (transition).",
  },
  fr: {
    id: "fr-dgfip-guide-pratique",
    eticheta: "DGFiP",
    autoritate: "Tax administration (DGFiP)",
    titlu: "Start-up guide for e-invoicing at September 1, 2026",
    url: "https://www.impots.gouv.fr/sites/default/files/media/1_metier/2_professionnel/EV/2_gestion/290_facturation_electronique/guide_pratique_facturation_electronique.pdf",
    ce: "Receiving and issuing from September 1, 2026, SMEs from September 1, 2027, accredited platforms.",
  },
  pl: {
    id: "pl-ksef-terminy",
    eticheta: "Ministry of Finance",
    autoritate: "Ministry of Finance (podatki.gov.pl)",
    titlu: "KSeF legal basis and key dates",
    url: "https://ksef.podatki.gov.pl/informacje-ogolne-ksef-20/podstawy-prawne-oraz-kluczowe-terminy",
    ce: "February 1, 2026, and April 1, 2026; simplifications to the end of 2026; the FA(3) structure.",
  },
  be: {
    id: "be-efacture-obligation",
    eticheta: "BOSA",
    autoritate: "BOSA (efacture.belgium.be)",
    titlu: "Structured e-invoices between businesses are mandatory since 2026",
    url: "https://efacture.belgium.be/fr/article/les-factures-electroniques-structurees-entre-entreprises-sont-obligatoires-depuis-2026",
    ce: "The obligation from January 1, 2026, for Belgian VAT-registered businesses, over the Peppol network.",
  },
  beToleranta: {
    id: "be-efacture-tolerance",
    eticheta: "BOSA, tolerance",
    autoritate: "BOSA (efacture.belgium.be)",
    titlu: "End of the tolerance period for e-invoicing (April 7, 2026)",
    url: "https://efacture.belgium.be/fr/news/fin-de-la-periode-de-tolerance-pour-le-facturation",
    ce: "The general tolerance period of the first three months ended; the tolerance for self-billing ran until June 30, 2026.",
  },
};

export const EFACTURARE_EN: ContinutEfacturare = {
  cale: CALE,
  limba: "en",
  surse: SURSE_TABEL,
  erou: {
    fir: [
      { text: "Home", cale: "/" },
      { text: "E-invoices", cale: CALE },
    ],
    etichetaFir: ETICHETA_FIR,
    titlu: H1,
    // Rol: raspunsul paginii, primul paragraf din <main> (capsula aprobata). Ultima fraza e text PROPUS, de aprobat
    // pe capturi: capsula aprobata promitea randuri de pastrare cu temeiul lor, pe care compunerea perechii RO nu le
    // are; pagina arata tabelul tarilor, cu documentul oficial al fiecarui rand si data verificarii sub tabel.
    subtitlu:
      "Each EU country sets its own retention period for invoices: 8 years in Germany, 10 in France, 7 in Belgium, 5 in Romania. In Poland, the KSeF system stores structured invoices for 10 years. Germany and France expect the original electronic file to be kept, not only a PDF. The table below links each country to its official source.",
    // Butoanele eroului le pune pagina (canalul WhatsApp si celelalte canale); aici numai cel de contur, ca tinta.
    butonPlin: { text: ETICHETA_BUTON_CANAL, href: null, ruta: null },
    butonContur: { text: "Other channels", href: "/contact", ruta: "/contact" },
  },
  macheta: {
    declaratie:
      "Example with fictional data: an invoice's route into the 3S archive",
    eticheta: "Example",
    factura: "F-2026-0412",
    etichete: ["XML", "EN 16931"],
    // Ramane numai incarcarea din browser (decizia 43: Peppol, Storecove, e-mail; decizia 49: WhatsApp).
    canale: ["Upload"],
    arhiva: "3S archive",
    ani: "2026-2034",
    // AES-256 si jurnalul ies (decizia 31); in locul lor, doua fapte confirmate. Gazduirea: decizia 42.
    insigne: ["Search", "Frankfurt", "Export"],
  },
  fraza:
    "RO e-Factura lets you download an invoice's XML for 60 days. Your own archive keeps it for as long as you decide.",
  mandate: {
    titlu: "Five countries and the EU, six calendars",
    text: "Each state chooses its own system, format and start dates. A company that sells in three countries follows three calendars, each with its own technical rules. The table below sets them side by side, with the official document behind each one.",
    batai: [
      "In Poland, invoices go through KSeF; in Belgium, over the Peppol network; in Romania, through RO e-Factura; and in France, through platforms accredited by the tax authority. Germany has required businesses to be able to receive e-invoices since 2025, in XRechnung or ZUGFeRD. Directive (EU) 2025/516 adds common rules for supplies between Member States from July 1, 2030.",
      "Whatever the channel, you can keep the invoices in one place: your company's archive. In 3S, an XML downloaded from RO e-Factura sits next to a scanned PDF invoice, in a folder with its retention period, and one question finds both, with the source of each answer.",
    ],
  },
  tabel: {
    titlu: "Who requires e-invoicing, and from when?",
    text: "The rows cover invoices between businesses. Next to each is the official document we took it from, and below the table, the day we read it.",
    capete: ["Country", "What applies", "From", "Format, channel"],
    eticheteSursa: "Source",
    piete: [
      {
        ancora: "germany",
        tara: "Germany",
        ce: "Every domestic business must be able to receive e-invoices. Issuing becomes mandatory in stages, by turnover.",
        cand: "Receiving from January 1, 2025. Issuing on paper or as a PDF remains allowed until December 31, 2026, or until the end of 2027 for turnover up to EUR 800,000.",
        format: "XRechnung or ZUGFeRD 2.0.1 or later",
        surse: ["de"],
      },
      {
        ancora: "france",
        tara: "France",
        ce: "Every business concerned receives e-invoices. Issuing starts with large and mid-size companies.",
        cand: "Large and mid-size companies must issue e-invoices from September 1, 2026, when all businesses concerned must start receiving them. SMEs and micro-enterprises must issue them from September 1, 2027.",
        format: "Through platforms accredited by the tax authority",
        surse: ["fr"],
      },
      {
        ancora: "poland",
        tara: "Poland",
        ce: "Structured invoices are issued in KSeF, the national system of the Ministry of Finance.",
        cand: "February 1, 2026, for businesses with 2024 sales above PLN 200 million; April 1, 2026, for all others. Some simplifications run to the end of 2026.",
        format: "FA(3) structure, through KSeF",
        surse: ["pl"],
      },
      {
        ancora: "belgium",
        tara: "Belgium",
        ce: "Structured e-invoices between Belgian VAT-registered businesses, sent over the Peppol network.",
        cand: "From January 1, 2026. The general tolerance period ended after the first three months; for self-billing it ran until June 30, 2026.",
        format: "Peppol network",
        surse: ["be", "beToleranta"],
      },
      {
        ancora: "romania",
        tara: "Romania",
        ce: "Invoices between businesses established in Romania go through RO e-Factura.",
        cand: "Reporting of B2B invoices from January 1, 2024. Sending through RO e-Factura from July 1, 2024.",
        format: "XML based on EN 16931 and RO_CIUS",
        surse: ["roGhid"],
      },
      {
        ancora: "european-union",
        tara: "EU (ViDA)",
        ce: "E-invoicing and digital reporting for supplies between Member States (Directive (EU) 2025/516).",
        cand: "Member States apply the new rules from July 1, 2030 (art. 6(5) of the Directive).",
        format: "European standard EN 16931",
        surse: ["ueVida"],
      },
    ],
    ancoraEvidentiata: "romania",
    // Numele tarii duce la ghidul ANAF (PDF extern): iconita externa, ca la celelalte legaturi spre surse.
    taraSursaExterna: true,
    titluModificari: "Recent changes",
    modificari: [
      {
        text: "September 1, 2026, FR: large and mid-size companies issue through accredited platforms.",
      },
      {
        text: "April 1, 2026, PL: the sales threshold ends, and KSeF covers all businesses.",
      },
      {
        text: "April 1, 2026, BE: the general tolerance period of the first three months ended.",
      },
    ],
    // Calendarul .ics nu se monteaza: fisierul are termenele romanesti D406, iar ruta lui exista numai pe site-ul RO.
    verificare: "Checked at the official source on",
    dataVerificarii: "2026-09-30",
    dataVerificariiText: CITIT,
    nota: "This guide is not legal advice, and the table leaves out invoices to consumers. Company records in Moldova have their own guide:",
    notaLegatura: {
      text: "Records retention in Moldova",
      href: "/guides/records-retention-moldova",
      ruta: "/guides/records-retention-moldova",
    },
  },
  jurnal: {
    eticheta: "Verified changes",
    titlu: "2026, country by country",
    text: "We checked each change below against the document published by the relevant authority. Each entry links to it, and its country tag leads to the row in the table.",
    legatura: "Official document",
    prefixTara: "Country row in the table: ",
    intrari: [
      {
        data: "2026-09-01",
        dataText: "September 1, 2026",
        cod: "FR",
        ancora: "france",
        text: "Large and mid-size companies began issuing e-invoices, and every business concerned had to be able to receive them. SMEs and micro-enterprises follow in 2027.",
        sursa: "fr",
      },
      {
        data: "2026-04-01",
        dataText: "April 1, 2026",
        cod: "BE",
        ancora: "belgium",
        text: "The general tolerance period of the first three months ended. A narrower tolerance for self-billing ran until June 30, 2026.",
        sursa: "beToleranta",
      },
      {
        data: "2026-04-01",
        dataText: "April 1, 2026",
        cod: "PL",
        ancora: "poland",
        text: "KSeF became mandatory for all remaining taxpayers. The PLN 200 million sales threshold no longer applies.",
        sursa: "pl",
      },
      {
        data: "2026-02-01",
        dataText: "February 1, 2026",
        cod: "PL",
        ancora: "poland",
        text: "KSeF became mandatory for taxpayers with 2024 sales above PLN 200 million, VAT included, and KSeF 2.0 went into production.",
        sursa: "pl",
      },
      {
        data: "2026-01-01",
        dataText: "January 1, 2026",
        cod: "BE",
        ancora: "belgium",
        text: "Structured e-invoices became mandatory between Belgian VAT-registered businesses, sent over the Peppol network.",
        sursa: "be",
      },
    ],
  },
  treiReguli: {
    titlu: "Three points from the Romanian rule",
    text: "What ANAF's 2023 guide says about RO e-Factura, in three cards.",
    carduri: [
      {
        iconita: "timer",
        titlu: "Two stages in 2024",
        text: "From January 1, 2024, invoices between businesses established in Romania are reported in RO e-Factura. From July 1, 2024, only invoices sent through the system count as invoices between these businesses.",
      },
      {
        iconita: "file-code",
        titlu: "One format",
        text: "The invoice is an XML file that meets the European standard EN 16931 and the national RO_CIUS rules. The original is the XML with the Ministry of Finance's electronic seal. A PDF is not an e-invoice under these rules.",
      },
      {
        iconita: "archive",
        titlu: "60 days in the system",
        text: "How long the file can be downloaded directly from RO e-Factura, according to ANAF's 2023 guide. After that, ANAF archives it and releases it on request. A company that needs the file later keeps its own copy.",
      },
    ],
    ghid: { cheie: "roGhid", text: "ANAF guide to RO e-Factura (2023)" },
  },
  emiterea: {
    titlu:
      "The years after sending: where the invoice is when your accountant, an auditor or a partner asks",
    text: "The retention period depends on the country and the document, and it runs for years. All that time, the invoice must stay legible and intact, and in Germany and France in its original electronic form.",
    paragrafe: [
      "A tax audit, a dispute with a supplier or a question from the bank can bring back an invoice from years ago. Then it matters whether you find it quickly, with the original XML and the date it arrived. A printout or a renamed PDF no longer shows where it came from or whether it was changed.",
      "RO e-Factura does not replace your own archive: according to ANAF's 2023 guide, files can be downloaded directly for 60 days, then requested from ANAF. Copies often end up on several computers, in forwarded attachments and in folders with different names. Some get lost, others get duplicated, and at an audit nobody knows which copy is the original. When the person who downloaded them leaves the company, the folder can leave too, on a laptop nobody opens again.",
    ],
    rezolvare:
      "In 3S, each invoice sits in your company's archive, in the folder you choose. Files are stored in the EU, with Frankfurt as the primary region. You set the retention period on the folder.",
    legatura: {
      text: "Where 3S stores your files",
      href: "/about#security",
      ruta: "/about",
    },
  },
  rigla: {
    titlu: "One invoice, kept as long as you decide",
    subtitlu:
      "Example: an invoice received in 2026, in a folder kept for 8 years.",
    fisier: "F-2026-0412.xml",
    eticheta: "received in October 2026",
    banda: "after 8 years: end of the retention period",
    nota: "In 3S, you can set a retention period for each folder, and it applies to the documents in it.",
    anStart: 2026,
    aniScala: 11,
    aniPastrare: 8,
    descriere: "Year scale: 2026 to 2037; the example is kept until 2034.",
  },
  casa: {
    titlu: "How can 3S help?",
    text: "Three things you do with invoices in 3S, whatever software issues them.",
    pasi: [
      {
        titlu: "Ask in your own words",
        text: 'Type "energy invoices from March" and get the list, each result with the document it comes from. Questions in Romanian are supported; English questions are in beta.',
      },
      {
        titlu: "Export when asked",
        text: "When your accountant or an auditor asks, export the documents they need.",
      },
      {
        titlu: "Set retention per folder",
        text: "You set a retention period on each folder, and it covers the documents in it.",
      },
    ],
    legatura: {
      text: "See the 3S platform",
      href: "/platform",
      ruta: "/platform",
    },
  },
  standarde: {
    titlu: "Formats named in this guide",
    text: "In 3S, you upload an XML invoice like any other file.",
    // Peppol iese (decizia 43: integrare cu nume; e o retea, nu un format).
    insigne: [
      "EN 16931",
      "RO_CIUS",
      "XRechnung",
      "ZUGFeRD",
      "FA(3)",
      "XML",
      "PDF",
    ],
  },
  intrebari: {
    titlu: "Common questions",
    intrebari: [
      {
        intrebare: "How long must e-invoices be kept in each country?",
        raspuns:
          "Germany requires 8 years, France 10 years for accounting documents, Belgium 7 years and Romania 5 years. In Poland, KSeF holds structured invoices for 10 years, and you keep them longer, outside KSeF, only while the tax liability is still open.",
      },
      {
        intrebare: "In what format must e-invoices be kept?",
        raspuns:
          "Keep the original XML as you sent or received it: Germany and France say so. Belgium and Romania allow other formats if authenticity and integrity are ensured.",
      },
      {
        intrebare: "What is Peppol?",
        raspuns:
          "An e-invoice exchange network. Since January 1, 2026, Belgian VAT-registered businesses have sent structured e-invoices to each other over it. The table above shows the channel of each country.",
      },
      {
        intrebare: "Can I upload the XML files from RO e-Factura?",
        raspuns:
          "Yes. You can download invoices as XML files from RO e-Factura and upload them to the archive, like any other file, next to your other documents.",
      },
      {
        intrebare: "Who else stores your invoices?",
        raspuns:
          "In Poland, KSeF stores each structured invoice for 10 years from the end of its year of issue. In Romania, RO e-Factura keeps the XML for download for 60 days, then archives it and releases it on request.",
      },
    ],
  },
};

export const CTA_FINAL_EN = ctaFinal(
  "Need this for your own archive?",
  "Tell us which countries your invoices come from and roughly how many you keep.",
);

export const pagina: PaginaReferinta = {
  cheie: "guides-e-invoice-archiving-eu",
  meta: META,
  h1: H1,
  cta: {
    ref: "en-einv",
    textWhatsapp:
      "Hello 3S, I read your page on e-invoice archiving [ref:en-einv]. I would like to ask about a pilot.",
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
      about: ["Germany", "France", "Poland", "Belgium", "Romania"].map(
        (name) => ({ "@type": "Country", name }),
      ),
      citation: SURSE.map((s) => s.nume + ", " + s.url),
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
    "en-comparatii-cautare-cu-sursa",
    "en-pagina-si-engleza-in-pilot",
    "en-enterprise-functii-in-productie",
    "en-gazduire-ue-frankfurt",
    "en-produs-amazon-sediu-sua",
    "en-operator-din-moldova",
    "en-ghiduri-cu-surse",
  ],
};
