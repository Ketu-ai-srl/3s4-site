// Pagina de contact a editiei `en` (P10, `/contact`), transcrisa din fisa ei de continut, pana la sectiunea de
// resurse nepublicate. Fara formular (decizia 3 si arhitectura EN, sectiunea 4.6): cele doua carduri de canal sunt
// actiunea paginii, deci pagina nu are bloc de final separat. Decizia 56 (03.10.2026): fara apeluri GSM - cardul de
// telefon a iesit, iar WhatsApp primeste mesaje si apeluri; numarul ramane afisat ca numar de WhatsApp.
//
// Titlul, meta-descrierea si capsula sunt variantele "Before P-40" ale fisei: adresa domeniului nu poate
// raspunde inca, deci e-mailul nu se numeste in text. Cardul de e-mail il randeaza pagina numai cand domeniul
// are adresa (`CANALE.email`), cu textele de mai jos.

import { iduri } from "@/components/seo/date-structurate";
import type { PaginaContinut } from "@/content/model/tipuri";
import { adresaSite } from "@/lib/site";

const BAZA = adresaSite();
const ID = iduri(BAZA);

/**
 * Sectiunea cardurilor de canal ("How can I reach 3S?"): titlul si textul fiecarui card. Randul de dupa carduri a
 * iesit odata cu asistentul pe WhatsApp (decizia 49), din continut, din tip si din pagina.
 */
export const CANALE_PAGINA = {
  titlu: "How can I reach 3S?",
  whatsapp: {
    titlu: "WhatsApp",
    /** Dupa numarul afisat pe card: numarul e de WhatsApp (decizia 56). */
    dupaNumar: " (WhatsApp)",
    text: "WhatsApp is our main channel, for messages and calls. On this number you talk to people from our team.",
  },
  email: {
    titlu: "E-mail",
    text: "For longer questions, or if you prefer e-mail.",
    buton: "E-mail us",
    copiaza: "Copy address",
    copiat: "Address copied",
  },
} as const;

/** Randul de la finalul paginii. */
export const DUPA: readonly string[] = [
  "See also: [Pricing](/pricing), [About and security](/about) and [how the platform works](/platform).",
];

export const pagina: PaginaContinut = {
  cheie: "contact",
  meta: {
    titlu: "Contact 3S: WhatsApp Messages and Calls",
    descriere:
      "Message or call 3S on WhatsApp at +373 60 055 599. Tell us which archive you have and where. We reply in English or Romanian. No form, no account.",
    cale: "/contact",
  },
  h1: "Talk to 3S",
  capsula:
    "You can reach 3S on WhatsApp at +373 60 055 599, for messages and calls. Tell us which archive you have (paper, scans or digital files) and in which country. We reply in English or Romanian. There is no form and no account to create.",
  sectiuni: [
    {
      cheie: "first-message",
      titlu: "What should I write in my first message?",
      blocuri: [
        {
          paragrafe: ["A few lines are enough:"],
          lista: {
            elemente: [
              "which archive you have: paper, scans, files or a mix",
              "in which country it is",
              "in which language the documents are written",
              "what you want to be able to find or answer",
            ],
          },
          dupa: ["Please do not send documents or personal data in your first message."],
        },
      ],
    },
    {
      cheie: "after-message",
      titlu: "What happens after I message you?",
      blocuri: [
        {
          paragrafe: [
            "We reply and ask a few questions about your archive. Then we show you how a question is answered with the source cited. If it fits, we propose a pilot on a sample of your documents.",
          ],
        },
      ],
    },
    {
      cheie: "languages",
      titlu: "Which languages do you speak?",
      blocuri: [{ paragrafe: ["English and Romanian. Write to us in whichever you prefer."] }],
    },
  ],
  cta: {
    ref: "en-contact",
    titluBloc: "Talk to 3S",
    textWhatsapp: "Hello 3S, I read your contact page [ref:en-contact]. I would like to ask about a pilot.",
    subiectEmail: "3S inquiry [ref:en-contact]",
  },
  jsonLd: [
    {
      "@type": "WebPage",
      "@id": BAZA + "/contact#webpage",
      url: BAZA + "/contact",
      name: "Contact 3S: WhatsApp Messages and Calls",
      description:
        "Message or call 3S on WhatsApp at +373 60 055 599. Tell us which archive you have and where. We reply in English or Romanian. No form, no account.",
      inLanguage: "en",
      isPartOf: { "@id": ID.site },
      mainEntity: { "@id": ID.organizatie },
      breadcrumb: { "@id": BAZA + "/contact#breadcrumb" },
    },
    {
      "@type": "BreadcrumbList",
      "@id": BAZA + "/contact#breadcrumb",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: BAZA + "/" },
        { "@type": "ListItem", position: 2, name: "Contact", item: BAZA + "/contact" },
      ],
    },
  ],
  afirmatii: ["en-canale-de-contact", "en-comparatii-cautare-cu-sursa", "en-pilot-asistat"],
};
