// Pagina de preturi a editiei `en` (P08, `/pricing`), transcrisa din fisa ei de continut, pana la sectiunea de
// resurse nepublicate. Grila e decizia 18 (Starter 90 / Pro 150 / Business 240 EUR pe luna; anual 75 / 125 / 200;
// 5 / 10 / 20 conturi; Enterprise de la 800, contract anual), iar propozitia TVA e decizia 24.
//
// Sumele sunt scrise aici, in euro, si nu vin din `src/content/preturi.ts`: acela e grila romaneasca, in RON, a
// altui site (decizia 20: site-ul romanesc ramane diferit, fara explicatie pe 3s.md).
//
// CE NU INTRA, cu motivul:
//   - paragraful despre hartie din "How do I get a quote?": poarta juridica a deciziei 40 (rezerva prin omisiune,
//     pana la rescrierea textelor juridice de catre jurist);
//   - "or write to contact@3s.md" din aceeasi sectiune: varianta de dinainte de P-40;
//   - `Offer` si `priceCurrency` in JSON-LD (fisa: fara ele pana la regimul TVA, P-57).
//
// Ancora `pilot` sta pe "What is an assisted pilot?" (comparatia G3 trimite la /pricing#pilot).

import { iduri } from "@/components/seo/date-structurate";
import type { PaginaContinut } from "@/content/model/tipuri";
import { adresaSite } from "@/lib/site";
import type { FinalPagina } from "./home";

const BAZA = adresaSite();
const ID = iduri(BAZA);

/** Grila decisa (decizia 18), pe care o citesc si tabelul, si proba. */
export const GRILA = [
  { plan: "Starter", conturi: "5", lunar: "90", anualPeLuna: "75", anualPeAn: "900" },
  { plan: "Pro", conturi: "10", lunar: "150", anualPeLuna: "125", anualPeAn: "1,500" },
  { plan: "Business", conturi: "20", lunar: "240", anualPeLuna: "200", anualPeAn: "2,400" },
] as const;

/** Propozitia TVA, decizia 24, cuvant cu cuvant. */
export const PROPOZITIE_TVA = "Prices exclude VAT; where VAT applies, it is added to the invoice.";

export const pagina: PaginaContinut = {
  cheie: "pricing",
  meta: {
    titlu: "3S Pricing: Starter, Pro, Business and Enterprise Plans",
    descriere:
      "3S pricing per company, in euros, excluding VAT: Starter EUR 90, Pro EUR 150, Business EUR 240 a month; Enterprise from EUR 800. Free 14-day pilot.",
    cale: "/pricing",
  },
  h1: "3S pricing: four plans, in euros",
  capsula:
    "3S has four plans, priced per company in euros, excluding VAT: Starter at EUR 90, Pro at EUR 150 and Business at EUR 240 a month, for 5, 10 and 20 user accounts, and Enterprise from EUR 800 a month. The prices are indicative. Every start is a free 14-day assisted pilot on your own documents.",
  sectiuni: [
    {
      cheie: "plans",
      titlu: "What are the 3S plans?",
      blocuri: [
        {
          paragrafe: [
            "Prices are per company, not per user, in euros, excluding VAT. Starter, Pro and Business have the same features; they differ only in the number of user accounts.",
          ],
          tabel: {
            forma: "cu-antet",
            titlu: "3S plans and prices, in euros, excluding VAT",
            antet: ["Plan", "User accounts", "Billed monthly (EUR per month)", "Billed annually (EUR per month)", "Billed annually (EUR per year)"],
            randuri: [
              ...GRILA.map((g) => [g.plan, g.conturi, g.lunar, g.anualPeLuna, g.anualPeAn]),
              ["Enterprise", "More than 20", "Annual contract only", "From 800", "From 9,600"],
            ],
          },
          dupa: [
            "Enterprise starts from EUR 800 per month, on an annual contract, for more than 20 user accounts; we send you an offer. See [Enterprise](/enterprise).",
          ],
        },
      ],
    },
    {
      cheie: "vat",
      titlu: "Do the prices include VAT?",
      blocuri: [{ paragrafe: ["No. Prices are in euros. " + PROPOZITIE_TVA] }],
    },
    {
      cheie: "discounts",
      titlu: "Are there discounts?",
      blocuri: [
        {
          paragrafe: [
            "Pay annually: two months free. On Starter, Pro and Business, annual billing costs 10 monthly payments for 12 months, 16.7% less than monthly billing. The first month after the pilot is billed at the listed price, with no pilot discount.",
          ],
        },
      ],
    },
    {
      cheie: "payment",
      titlu: "When do I pay, and how long is an offer valid?",
      blocuri: [
        {
          paragrafe: [
            "Invoices are due within 14 days of the invoice date. Subscriptions are billed in advance, monthly or annually. Our written offer, and the price in it, are valid for 30 days from the date we issue it.",
          ],
        },
      ],
    },
    {
      cheie: "indicative",
      titlu: "Why are the prices indicative?",
      blocuri: [
        {
          paragrafe: [
            "The plan depends on how many people will use 3S. After the pilot, we confirm the plan and the price in a written offer, valid for 30 days.",
          ],
        },
      ],
    },
    {
      cheie: "pilot",
      titlu: "What is an assisted pilot?",
      ancoraInainte: "pilot",
      blocuri: [
        {
          paragrafe: [
            "An assisted pilot runs 3S for 14 days, free of charge, on your own documents, with 5 user accounts, as on Starter. We agree on the volume of documents in writing before it starts, and it starts after you accept our Terms and the data processing agreement. You choose the questions you want answered. We run them and check the answers, and the sources behind them, together with you. Your account is opened by invitation. When the pilot is done, we send you a written offer.",
          ],
        },
      ],
    },
    {
      cheie: "try",
      titlu: "Can I try 3S before deciding?",
      blocuri: [
        {
          paragrafe: [
            "Yes. The assisted pilot is free for 14 days, on your own documents. Message us to agree on the documents and the questions.",
          ],
        },
      ],
    },
    {
      cheie: "quote",
      titlu: "How do I get a quote?",
      blocuri: [
        {
          paragrafe: ["Message us on WhatsApp. A few lines are enough. Tell us:"],
          lista: {
            elemente: [
              "what you keep: paper, scans, files or a mix",
              "where the archive is, and in which country",
              "in which language the documents are written",
              "roughly how much there is, and how many people will use 3S",
            ],
          },
          dupa: [
            'For example: "We keep contracts and invoices in Romanian, in Moldova. We would like a quote."',
            "Please do not send documents or personal data in your first message.",
          ],
        },
      ],
    },
  ],
  cta: {
    ref: "en-price",
    titluBloc: "Ask for a quote",
    textWhatsapp: "Hello 3S, I read your pricing page [ref:en-price]. I would like to ask for a quote.",
    subiectEmail: "3S inquiry [ref:en-price]",
  },
  jsonLd: [
    {
      "@type": "WebPage",
      "@id": BAZA + "/pricing#webpage",
      url: BAZA + "/pricing",
      name: "3S Pricing: Starter, Pro, Business and Enterprise Plans",
      description:
        "3S pricing per company, in euros, excluding VAT: Starter EUR 90, Pro EUR 150, Business EUR 240 a month; Enterprise from EUR 800. Free 14-day pilot.",
      inLanguage: "en",
      isPartOf: { "@id": ID.site },
      about: { "@id": ID.organizatie },
      breadcrumb: { "@id": BAZA + "/pricing#breadcrumb" },
    },
    {
      "@type": "BreadcrumbList",
      "@id": BAZA + "/pricing#breadcrumb",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: BAZA + "/" },
        { "@type": "ListItem", position: 2, name: "Pricing", item: BAZA + "/pricing" },
      ],
    },
  ],
  afirmatii: ["en-pret-orientativ-eur", "en-tva-exclus", "en-plata-si-oferta", "en-pilot-asistat", "en-cont-prin-invitatie", "en-canale-de-contact"],
};

export const final: FinalPagina = {
  text: "Tell us about your archive in a few lines. We reply in English or Romanian.",
  dupa: [
    "See also: [Enterprise](/enterprise) for more than 20 accounts, [how the platform works](/platform), [where your data is stored](/about) and [Contact](/contact).",
  ],
};
