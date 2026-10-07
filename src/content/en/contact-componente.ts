// Continutul componentelor paginii de contact pe editia `en` (P10, `/contact`): aceleasi componente si aceeasi
// compunere ca pagina de contact RO (decizia 53), cu textul in engleza. Constantele sunt tipate pe contractul
// structural al componentei (felia 101: `PaginaContact` cu `continut?`, `randuri?` si `butonCaseta?`; `CtaFinalInchis`
// cu `continut?` si `butoane?`).
//
// SURSA TEXTULUI, pe camp: fisa de continut a paginii, sectiunea "Component copy (decision 53)", cu cheia campului RO
// (de pilda `conversie.ts:58`) in comentariu; blocul de final are textul startului EN (aceeasi componenta, acelasi
// text). Textul nou e PROPUS, pana la aprobarea owner-ului pe capturi (poarta 2). `contact.ts` ramane sursa pentru
// metadata, nodul WebPage si registrul de afirmatii.
//
// CE NU INTRA, cu decizia: cardurile spre integrari (d43) si spre paginile de segment (d38); randurile formularului si
// al contului (d3) si al demonstratiei (`/incepe` nu exista pe 3s.md); criptarea (d31); butonul secundar al blocului de
// final. Numarul si adresa de e-mail vin din canalele aplicatiei (`CANALE_JSON`), nu sunt scrise aici: aceeasi pagina
// ruleaza si pe alte domenii, cu alte canale.

import type { ContinutPaginaContact } from "@/components/conversie/PaginaContact";
import type { ContinutCtaFinal } from "@/components/primitive/CtaFinalInchis";
import type { CardSubiect } from "@/content/conversie";
import { caleMd } from "@/content/juridic/md/registru";

/** Eticheta accesibila a firului din erou, in limba editiei. */
export const ETICHETA_FIR_EN = "Breadcrumb";

/** Butonul casetei si al blocului de final: eticheta aprobata (decizia 35), tinta WhatsApp cu `ref`-ul paginii. */
export const BUTON_CASETA_EN = "Message us on WhatsApp";
export const BUTON_FINAL_EN = "Message us";

const cale = (c: string) => ({ text: c, href: c, ruta: c });

/** `conversie.ts:76-118`: cinci carduri din sapte, in ordinea RO; fiecare duce la perechea lui de pe 3s.md. */
const CARDURI_EN: CardSubiect[] = [
  {
    iconita: "building-2",
    titlu: "Large archives and teams",
    descriere: "The Enterprise plan: more than 20 user accounts, on an annual contract.",
    legatura: cale("/enterprise"),
  },
  {
    iconita: "wallet",
    titlu: "Plans and pricing",
    descriere: "What each plan includes and what it costs in euros, excluding VAT.",
    legatura: cale("/pricing"),
  },
  {
    iconita: "shield-check",
    titlu: "Operator and hosting",
    descriere: "Who operates 3S, and where files are stored: in the EU, with Frankfurt as the primary region.",
    legatura: cale("/about"),
  },
  {
    iconita: "layers",
    titlu: "How the platform works",
    descriere: "From an uploaded file to an answer that shows the document it comes from.",
    legatura: cale("/platform"),
  },
  {
    iconita: "calendar-clock",
    titlu: "How long to keep records",
    descriere: "Invoices, payroll and contracts: how long companies in Moldova keep them.",
    legatura: cale("/guides/records-retention-moldova"),
  },
];

/** Bucatile subtitlului din erou (`conversie.ts:58`), cu numarul si adresa puse la randare. */
export const SUBTITLU_EN = {
  inainte: "You can reach 3S on WhatsApp at ",
  dupaNumar: ", for messages and calls",
  inainteDeEmail: ", or by e-mail at ",
  final: ". We reply in English or Romanian.",
};

/** Subtitlul eroului, cu canalele aplicatiei: fara adresa (inainte de P-40) sau cu ea. */
export function subtitluContactEn(numar: string, email: string): string {
  const s = SUBTITLU_EN;
  return s.inainte + numar + s.dupaNumar + (email === "" ? "" : s.inainteDeEmail + email) + s.final;
}

/**
 * Randurile panoului de canale (`conversie.ts:123-149`): WhatsApp in locul formularului, e-mailul dupa P-40. Fara stare:
 * textul panoului spune ca nu publicam un program, deci un "Open" cu ceas langa canal ar contrazice fraza.
 */
export const CANALE_EN = {
  whatsapp: "WhatsApp, for messages and calls",
  email: "E-mail",
};

/** Numele paginii din textul blocului marcii, legat la pagina de informatii legale a editiei. */
export const LEGATURA_INFORMATII_LEGALE_EN = { text: "Legal information", href: caleMd("informatii-legale", "en") };

/** Continutul paginii (`conversie.ts:52-170`); subtitlul eroului se completeaza cu `subtitluContactEn`. */
export const CONTACT_EN: ContinutPaginaContact = {
  fir: { acasa: "Home", pagina: "Contact", caleAcasa: "/", calePagina: "/contact" },
  erou: { titlu: "Talk to 3S", subtitlu: "" },
  caseta: {
    titlu: "Any question about 3S",
    text: "A few lines are enough: what documents your company keeps, in which country and language, and what you need to find or answer.",
    butonFormular: BUTON_CASETA_EN,
    nota: "No form, no account.",
  },
  subiecte: {
    titlu: "Answers already on this site",
    text: "Some questions need no message. Each card opens the page that covers the topic in full.",
    carduri: CARDURI_EN,
  },
  canale: {
    titlu: "How can I reach 3S?",
    text: "Where you can reach 3S today. We publish no hours and promise no response time.",
    notaEticheta: "Please note:",
    // O singura fraza pentru ambele stari: pe 3s.md nu exista formular, deci nici comutatorul lui.
    notaInchis: "do not send documents or personal data in your first message.",
    notaDeschis: "do not send documents or personal data in your first message.",
  },
  marca: {
    titlu: "What is behind the 3S name",
    text: "3S is operated from Moldova. The operating company's details are on the Legal information page.",
    carduri: [
      {
        titlu: "3S brand",
        rol: "Scan, Store, Solve",
        fapte: [
          { eticheta: "Full name", valoare: "3S Scan Store Solve", mono: false },
          { eticheta: "Purpose", valoare: "Digital archive, answers with sources", mono: false },
          { eticheta: "Access", valoare: "Web browser", mono: false },
        ],
      },
      {
        titlu: "3S platform",
        rol: "Where the files are stored",
        fapte: [{ eticheta: "Hosting", valoare: "AWS, EU, primary region Frankfurt", mono: false }],
      },
    ],
  },
};

/** Blocul de final: textul startului EN (`acasa.ts:800-829`), butonul il pune pagina. */
export const CTA_FINAL_CONTACT_EN: ContinutCtaFinal = {
  titlu: "Try it on a sample of your documents",
  subtitlu: "Tell us what your archive looks like and which country it is in.",
  butonPrincipal: { text: BUTON_FINAL_EN, href: null, ruta: null },
  microtext: "A person replies, in English or Romanian.",
  vizual: {
    declaratie: "Example with fictional data",
    pasi: [
      { iconita: "laptop", text: "Browser upload", ora: "09:41" },
      { iconita: "tag", text: "Tagged as invoice", ora: "09:41" },
    ],
    rezultat: { fisier: "Invoice_0415_example.pdf", stare: "Searchable in the archive", ora: "09:42" },
  },
};
