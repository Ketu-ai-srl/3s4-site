// Continutul componentelor paginii Enterprise pe editia `en` (P09, `/enterprise`): aceleasi componente si aceeasi
// compunere ca pagina Enterprise RO (decizia 53), cu textul in engleza. Fiecare constanta e tipata pe contractul
// structural al componentei ei (felia 101: proprietati optionale cu implicitul RO, vedere cu invelitoare pentru banda).
//
// SURSA TEXTULUI, pe camp: fisa de continut a paginii, sectiunea "Component copy (decision 53)", cu cheia campului RO
// (de pilda `enterprise.ts:36`) in comentariu. Textul nou e PROPUS, pana la aprobarea owner-ului pe capturi (poarta 2).
// `enterprise.ts` ramane sursa pentru metadata, nodul WebPage si registrul de afirmatii.
//
// CE NU INTRA, cu decizia: hartia scanata de 3S si originalele (poarta juridica a deciziilor 40-41), Gmail, Outlook,
// Microsoft 365, Google Workspace, portalul, programul de contabilitate, API-ul si regulile automate (d43), WhatsApp ca
// intrare sau iesire de documente (d49), campurile citite din act si clasarea in dosar (faptele confirmate ale valului
// RO), AES-256 (d31), faptul "semnat" (fara fapt confirmat). Formularul (d3) e inlocuit de blocul de canal WhatsApp,
// in aceeasi sectiune.
//
// Modulul e numai date: il importa si invelitoarea client a benzii, deci nu aduce nimic din continutul RO.

import type { ContinutDrumDocument } from "@/components/enterprise/BandaDrumDocumentVedere";
import type { ContinutEroulEnterprise } from "@/components/enterprise/EroulEnterprise";
import type { ContinutListaLivrabile } from "@/components/enterprise/ListaLivrabile";
import { CONTURI_MINIME_ENTERPRISE, LIMITE_PLANURI } from "@/content/limite-planuri";
import { CONECTARE_EN, limiteEn } from "./pricing-componente";

/**
 * Limitele de baza ale planului Enterprise (deciziile 66-68; coloana Enterprise a tabelului final), din
 * `src/content/limite-planuri.ts`: "500 GB of storage, 600 AI answers a month, ...". Intra in randul despre conturi
 * si contract al listei, ca lista sa ramana la sase elemente.
 */
const LIMITE_ENTERPRISE_EN = limiteEn("enterprise").map((l) => l.cifra + " " + l.text);
const LIMITE_DE_BAZA_EN =
  LIMITE_ENTERPRISE_EN.slice(0, -1).join(", ") + " and " + LIMITE_ENTERPRISE_EN[LIMITE_ENTERPRISE_EN.length - 1];

/** Eticheta accesibila a firului din erou, in limba editiei. */
export const ETICHETA_FIR_EN = "Breadcrumb";

/** Ancora blocului de canal: aceeasi ca a formularului RO (`ANCORA_FORMULAR`), deci aceeasi semnatura de forma. */
export const ANCORA_CANAL = "contact-form";

/** `enterprise.ts:27-42`. Butonul spre formular iese (d3): eroul primeste butonul WhatsApp de la pagina. */
export const EROU_ENTERPRISE_EN: ContinutEroulEnterprise = {
  fir: [
    { text: "Home", cale: "/" },
    { text: "Enterprise", cale: "/enterprise" },
  ],
  inapoi: { text: "Back to plans", href: "/pricing", ruta: "/pricing" },
  titlu: "3S for organizations with large archives and IT requirements",
  subtitlu:
    "3S Enterprise is the plan for organizations with more than 20 user accounts, on an annual contract. 3S recognizes the text of scanned documents, detects the document type and answers questions with the source cited.",
  secundara: { text: "How the platform works", href: "/platform", ruta: "/platform" },
  incredere: ["Hosted in the EU", "Primary: Frankfurt", "Over 20 user accounts", "Annual contract"],
};

/** Butonul de canal al eroului: eticheta aprobata (front matter `cta.button`), tinta WhatsApp cu `ref`-ul paginii. */
export const BUTON_EROU_EN = "Message us on WhatsApp";

/**
 * `enterprise.ts:49-89`: banda cu drumul unui document. Listele sunt mai scurte decat pe RO (elementele scoase de
 * decizii); faptele raman patru din cinci, iar termenul ("kept until 2036") se aprinde odata cu al patrulea pas al
 * faptelor, nu cu axa (ordinea pasilor e a vederii).
 */
export const DRUM_DOCUMENT_EN: ContinutDrumDocument = {
  titlu: "From file to answer",
  intrare: { eticheta: "Receive", elemente: ["Scans you already have", "Browser upload"] },
  intelegere: { eticheta: "Read", elemente: ["Text recognition", "Document type detected", "Search with sources"] },
  stocare: { eticheta: "Store", pastile: ["Primary: Frankfurt", "EU hosting"] },
  iesire: { eticheta: "Deliver", elemente: ["Answer in the browser", "Export"] },
  fapte: [
    { text: "invoice_0147.pdf", mono: true },
    { text: "Invoice", mono: false },
    { text: "Searchable", mono: false },
    { text: "kept until 2036", mono: false },
  ],
  anStart: "2026",
  anFinal: "2036",
  nota: "Fictional example. Your company sets the retention period for each folder.",
  etichetaExemplu: "example",
};

/** `enterprise.ts:96-125`: lista ia rolul blocului aprobat pentru IT si achizitii (specificatia, sectiunea 3). */
export const LIVRABILE_EN: ContinutListaLivrabile = {
  titlu: "What should IT and procurement know first?",
  text: "These are the questions IT and procurement usually ask first, answered with what this site states today.",
  elemente: [
    {
      titlu: "Certifications and service levels",
      text: "None stated on this site. Tell us what you need, and we will say plainly whether we meet it.",
    },
    {
      titlu: "Accounts, allowances and contract",
      text:
        "From " +
        CONTURI_MINIME_ENTERPRISE +
        " to " +
        LIMITE_PLANURI.enterprise.conturi +
        " user accounts on the base plan, on an annual contract billed monthly, from EUR 800 a month, excluding VAT. Base allowances, shared by the whole organization: " +
        LIMITE_DE_BAZA_EN +
        ". Connection: " +
        CONECTARE_EN +
        ".",
    },
    {
      titlu: "A pilot on your own documents",
      text: "Every start is a free 14-day assisted pilot on your own documents. A written offer then confirms the plan and the price.",
    },
    {
      titlu: "Data location",
      text: "Files are stored in the EU, with Frankfurt as the primary region. The About page names the provider and explains what US law says about it.",
      // Tinta aprobata a paginii pentru gazduire (calea SURSA; adresa servita o scrie componenta).
      legaturaInText: { text: "About page", href: "/about#security" },
    },
    {
      titlu: "Answers with their source",
      text: "Ask in the browser, and the answer comes with the document it is taken from, so you can check it before you rely on it.",
    },
    {
      titlu: "Your documents, by export",
      text: "3S delivers documents by export. This site states no exit terms, so if you need a specific exit arrangement, tell us before you decide.",
    },
  ],
};

/** `enterprise.ts:132-136`: capul blocului de canal care tine locul formularului (d3). */
export const CANAL_ENTERPRISE_EN = {
  eticheta: "Enterprise",
  titlu: "Talk about your requirements",
  subtitlu: "Tell us what your archive holds and where it lives today.",
};
