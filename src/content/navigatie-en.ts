// Contractul de navigatie al editiei `en` (site-ul international, la radacina lui 3s.md).
//
// SURSA: arhitectura site-ului EN, §4.1 (antetul), §4.2 (subsolul), §4.3 (regulile CTA), §4.4 (codurile
// `ref` si textele precompletate), §4.7 (bara de pe mobil). Meniurile numesc TOATE paginile EN; o legatura spre
// o pagina care nu exista inca nu se randeaza (filtrul pe `RUTE`, `seVede`), deci meniul creste singur pe
// masura ce feliile de pagini le adauga. Coloana Legal ia adresele din `config/juridic-rute.json` (editia
// `en`) si etichetele din §4.2.
//
// FARA: formular, cont, descarcare, "0 RON". Singura actiune e canalul: WhatsApp cu textul paginii curente,
// e-mailul numai cand domeniul are adresa (`CANALE.email` nevid), numarul ca numar de WhatsApp, numai text (fara
// legatura de apel: decizia 56). Informatiile legale in ROMANA, spre `/ro/juridic/informatii-legale`, stau in
// randul de jos pe fiecare pagina (legea Republicii Moldova le cere in romana).
//
// Se construieste PE SERVER (`navigatieEn()`), cu canalele domeniului: `src/content/canale.ts` citeste
// `CANALE_JSON`, care nu exista in pachetul de browser. Textele sunt ASCII, in engleza americana.

import { CAI_EXISTENTE } from "./cai";
import { CANALE, randNumarWhatsApp, type Canale } from "./canale";
import { caleMd, type CheieMd } from "./juridic/md/registru";
import {
  PALETA,
  seVede,
  type CaiExistente,
  type ContractNavigatie,
  type ElementMeniu,
  type FoaieMeniu,
  type Legatura,
  type LegaturaAntet,
  type LegaturaLocala,
  type Limba,
} from "./navigatie";
import { emailPePagina, propozitieFaraMarcaj, whatsappPePagina, type TextPePagina } from "@/components/canale/pe-pagina";

/** Eticheta butonului de canal: aceeasi peste tot (§4.3 regula 2). */
export const ETICHETA_WHATSAPP_EN = "Message us on WhatsApp";

/** Salutul cu care incep textele precompletate. */
const SALUT = "Hello 3S, ";

/**
 * Textele precompletate ale paginilor EN (§4.4), cu codul `ref` al fiecareia; o pagina fara intrare (de pilda cele
 * juridice, pagina de negasit) foloseste `en-home`. P04-P07 si S1-S4 nu mai au rand: au iesit de la lansare
 * (deciziile 49, 43 si 38) si revin cu textul lor, odata cu pagina.
 */
export const TEXTE_WHATSAPP_EN: readonly TextPePagina[] = [
  { cale: "/", ref: "en-home", text: "Hello 3S, I read your website [ref:en-home]. I would like to ask about a pilot." },
  {
    cale: "/platform",
    ref: "en-platform",
    text: "Hello 3S, I read your page on the platform [ref:en-platform]. I would like to ask how it would work with our documents.",
  },
  {
    cale: "/features/search",
    ref: "en-search",
    text: "Hello 3S, I read your page on search with a cited source [ref:en-search]. I would like to see it on a sample of our documents.",
  },
  { cale: "/pricing", ref: "en-price", text: "Hello 3S, I read your pricing page [ref:en-price]. I would like to ask for a quote." },
  {
    cale: "/enterprise",
    ref: "en-ent",
    text: "Hello 3S, I read your page on 3S for large archives [ref:en-ent]. I would like to talk about our requirements.",
  },
  {
    cale: "/contact",
    ref: "en-contact",
    text: "Hello 3S, I read your contact page [ref:en-contact]. I would like to ask about a pilot.",
  },
  {
    cale: "/about",
    ref: "en-about",
    text: "Hello 3S, I read your page about 3S and data location [ref:en-about]. I have a question about security.",
  },
  {
    cale: "/guides/e-invoice-archiving-eu",
    ref: "en-einv",
    text: "Hello 3S, I read your page on e-invoice archiving [ref:en-einv]. I would like to ask about a pilot.",
  },
  {
    cale: "/guides/records-retention-moldova",
    ref: "en-ret-md",
    text: "Hello 3S, I read your page on record retention in Moldova [ref:en-ret-md]. I would like to ask about a pilot.",
  },
  {
    cale: "/compare/3s-vs-google-and-box",
    ref: "en-vs",
    text: "Hello 3S, I read your comparison with Google Drive [ref:en-vs]. I would like to ask whether 3S fits our case.",
  },
];

/** E-mailul unei pagini (§4.5): subiectul cu `ref`, corpul cu salutul, propozitia paginii si randul despre arhiva. */
const FORMA_EMAIL_EN = {
  subiect: (ref: string) => "3S inquiry [ref:" + ref + "]",
  corp: (t: TextPePagina) =>
    "Hello 3S,\r\n\r\n" + propozitieFaraMarcaj(t, SALUT) + "\r\n\r\nMy archive (paper, scans or files) and country:\r\n",
};

/** Etichetele coloanei Legal (§4.2), pe cheia documentului din registrul familiei `md`. */
const LEGAL_EN: ReadonlyArray<{ cheie: CheieMd; text: string }> = [
  { cheie: "informatii-legale", text: "Legal information" },
  { cheie: "confidentialitate", text: "Privacy notice" },
  { cheie: "cookie-uri", text: "Cookies and measurement" },
  { cheie: "termeni", text: "Terms of service (B2B)" },
  { cheie: "dpa", text: "Data processing agreement" },
  { cheie: "subimputerniciti", text: "Subprocessors" },
  { cheie: "notificare-si-actiune", text: "Notice and action, acceptable use" },
  { cheie: "inteligenta-artificiala", text: "AI notice" },
];

function legatura(text: string, href: string, ruta: string = href.split("#")[0]): Legatura {
  return { text, href, ruta };
}

function element(text: string, href: string, iconita: string): ElementMeniu {
  return { ...legatura(text, href), descriere: "", iconita, marcajAi: false };
}

/** O foaie de meniu fara legatura de subsol. */
function foaie(eticheta: string, elemente: ElementMeniu[]): FoaieMeniu {
  return { eticheta, lider: null, elemente, subsol: { text: "", href: null, ruta: null } };
}

/**
 * Declansatorul unui meniu fara pagina-index (Guides): duce la primul element care exista. Fara
 * niciunul, tinta ramane pe primul element, care nu exista, deci declansatorul nu se randeaza.
 */
function declansator(text: string, f: FoaieMeniu, cai: CaiExistente): LegaturaAntet {
  const prima = f.elemente.find((e) => seVede(e, cai)) ?? f.elemente[0];
  return { text, href: prima.href, ruta: prima.ruta, foaie: f };
}

const FOAIE_PRODUS = foaie("3S product", [
  element("Platform", "/platform", "box"),
  element("Search with sources", "/features/search", "search"),
  element("Enterprise", "/enterprise", "building-2"),
]);

const FOAIE_GHIDURI = foaie("Guides", [
  element("E-invoice archiving in the EU", "/guides/e-invoice-archiving-eu", "file-text"),
  element("Records retention in Moldova", "/guides/records-retention-moldova", "archive"),
  element("3S vs Google Drive", "/compare/3s-vs-google-and-box", "chart-column"),
]);

/** Selectorul de limba al domeniului: engleza la radacina, romana pentru Republica Moldova sub `/ro`. */
export const LIMBI_3S_MD: Limba[] = [
  { text: "English", cod: "EN", editie: "en", href: "/", ruta: "/", activa: false },
  { text: "Română", cod: "RO", editie: "ro-MD", href: "/ro", ruta: "/ro", activa: false },
];

/** Glosa engleza scurta langa eticheta romaneasca a informatiilor legale (m18, prin analogie cu decizia 75). */
export const GLOSA_INFORMATII_LEGALE_EN = "in Romanian";

/**
 * Informatiile legale din randul de jos: eticheta ramane in ROMANA (legea Republicii Moldova le cere in romana), cu
 * `lang` ro si `hrefLang` pe limba paginii tinta (`ro-MD` in date; pe asezarea `ro` subsolul o scrie `ro-RO`, limba
 * servita a perechii romanesti, prin `legaturaLocalaServita`). Langa ea, o glosa engleza scurta, in limba paginii,
 * ca cititorul englez sa stie ce deschide. Glosa e un camp in plus al legaturii: subsolul o randeaza in afara
 * elementului cu `lang` ro, deci cititorul de ecran o pronunta in engleza.
 */
const INFORMATII_LEGALE_EN: LegaturaLocala & { glosa: string } = {
  text: "Informații legale",
  href: caleMd("informatii-legale", "ro"),
  ruta: caleMd("informatii-legale", "ro"),
  lang: "ro",
  hrefLang: "ro-MD",
  glosa: GLOSA_INFORMATII_LEGALE_EN,
};

/** Contractul EN, cu canalele domeniului si caile existente ale build-ului. */
export function navigatieEn(canale: Canale = CANALE, cai: CaiExistente = CAI_EXISTENTE): ContractNavigatie {
  const whatsapp = whatsappPePagina(TEXTE_WHATSAPP_EN, "/", canale);
  const email = emailPePagina(TEXTE_WHATSAPP_EN, "/", FORMA_EMAIL_EN, canale);
  const numar = randNumarWhatsApp(canale);

  return {
    antet: {
      sigla: { text: "3S Scan Store Solve, home page", href: "/", ruta: "/" },
      meniu: "Main menu",
      legaturi: [
        { text: "Product", href: "/platform", ruta: "/platform", foaie: FOAIE_PRODUS },
        declansator("Guides", FOAIE_GHIDURI, cai),
        { ...legatura("Pricing", "/pricing"), foaie: null },
        { ...legatura("About & security", "/about"), foaie: null },
      ],
      cautare: { eticheta: "Open search", tasta: "Ctrl K" },
      autentificare: { text: "", href: null, ruta: null },
      descarca: null,
      cta:
        whatsapp === null
          ? { text: ETICHETA_WHATSAPP_EN, href: null, ruta: null }
          : { text: ETICHETA_WHATSAPP_EN, href: whatsapp.implicit, ruta: null, peCale: whatsapp },
      hamburger: { deschide: "Open menu", inchide: "Close menu" },
    },
    limbi: LIMBI_3S_MD,
    selector: { eticheta: "Site language" },
    paleta: {
      ...PALETA,
      eticheta: "Search the site",
      campExemplu: "Type a word",
      inchide: "Close search",
      grupuri: [
        {
          titlu: "Pages",
          elemente: [
            legatura("Home", "/"),
            legatura("Platform", "/platform"),
            legatura("Pricing", "/pricing"),
            legatura("Enterprise", "/enterprise"),
            legatura("About & security", "/about"),
            legatura("Contact", "/contact"),
          ],
        },
        { titlu: "Actions", elemente: [legatura("Contact 3S", "/contact")] },
      ],
      grupArticole: "Articles",
      faraRezultate: "Nothing found",
      ajutor: { sageti: "Arrow keys move the selection", enter: "Enter opens the page", scurtatura: "Ctrl K" },
    },
    sertar: { eticheta: "Site menu", inchide: "Close menu" },
    subsol: {
      brand: {
        slogan: "Documents that answer you.",
        descriere:
          "3S keeps a company's documents in a digital archive and answers questions about them, showing the document each answer comes from.",
        posta: { text: "", href: null, ruta: null },
      },
      coloane: [
        {
          titlu: "Product",
          legaturi: FOAIE_PRODUS.elemente.map(({ text, href, ruta }) => ({ text, href, ruta })),
        },
        {
          titlu: "Guides",
          legaturi: FOAIE_GHIDURI.elemente.map(({ text, href, ruta }) => ({ text, href, ruta })),
        },
        {
          titlu: "Company",
          legaturi: [
            legatura("About & security", "/about"),
            legatura("Security and data location", "/about#security"),
            legatura("Pricing", "/pricing"),
            legatura("Contact", "/contact"),
          ],
        },
        {
          titlu: "Legal",
          legaturi: LEGAL_EN.map(({ cheie, text }) => legatura(text, caleMd(cheie, "en"))),
        },
      ],
      contact: {
        titlu: "Contact",
        whatsapp: whatsapp === null ? null : { text: ETICHETA_WHATSAPP_EN, legatura: whatsapp },
        numar,
        email: email === null ? null : { text: canale.email, legatura: email },
      },
      insigne: [],
      copyright: { detinator: "3S Scan Store Solve", mentiune: "", drepturi: "All rights reserved." },
      urmariti: "",
      retele: [],
      legaturaLocala: INFORMATII_LEGALE_EN,
      setariCookie: "Cookie settings",
    },
    bara: {
      eticheta: "Contact",
      whatsapp: whatsapp === null ? null : { text: "WhatsApp", legatura: whatsapp },
    },
  };
}
