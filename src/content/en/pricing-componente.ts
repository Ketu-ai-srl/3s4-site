// Continutul componentelor paginii de preturi pe editia `en` (P08, `/pricing`): aceleasi componente si aceeasi
// compunere ca pagina de preturi RO (decizia 53), cu textul in engleza si sumele in EUR (decizia 54). Fiecare constanta
// e tipata pe contractul structural al componentei ei (felia 102: vedere cu invelitoare pe editie, proprietati optionale
// cu implicitul RO), deci un camp lipsa sau in plus pica typecheck-ul.
//
// SURSA TEXTULUI, pe camp: fisa de continut a paginii, sectiunea "Component copy (decision 53)", cu cheia campului RO
// (de pilda `preturi.ts:100`) in comentariu. Textul nou e PROPUS, pana la aprobarea owner-ului pe capturi (poarta 2).
// `pricing.ts` ramane sursa pentru metadata, nodul WebPage si registrul de afirmatii.
//
// CE NU INTRA, cu decizia: randurile WhatsApp (d49), portal si aplicatii (d43), AES si accesul pe persoana (d31),
// clasarea automata (intrebarea deschisa a valului RO), nota "fara card" (legata de 0 RON); in locul lor stau fapte
// confirmate, ca listele sa pastreze lungimea RO. Demonstratia dispozitivelor din primul pliu (contorul cu nota lui,
// butonul de adaugare, numele scenei: val-ro-1.1) nu are fapt confirmat: biroul se monteaza fara ele
// (`faraDispozitive`), cu scena si banda de conturi; titlul si paragraful pliului spun faptul confirmat (conturile pe plan).
//
// Modulul e numai date si functii pure: il importa invelitoarea client a preturilor, deci nu aduce nimic din
// continutul RO (tipurile vin prin `import type`, care dispare la compilare).

import type { ContinutBirouConturi } from "@/components/preturi/BirouInteractivVedere";
import type { ContinutComutator } from "@/components/preturi/ComutatorPerioadaVedere";
import type { ContinutFaqPreturi } from "@/components/preturi/FaqPreturi";
import type { ContinutListaPdf } from "@/components/preturi/ListaPdfVedere";
import type { ContinutLiniaDeBaza } from "@/components/preturi/LiniaDeBaza";
import type { ContinutPliuri } from "@/components/preturi/PliuriVedere";
import type { ContinutTabelPlanuri } from "@/components/preturi/TabelPlanuri";
import type { NivelFir } from "@/components/primitive/FirPagina";
import type { Legatura } from "@/content/navigatie";
import type { CardPoarta, CategorieTabel, CelulaTabel, CheiePlan, Cursor, Plan, RandPlan } from "@/content/preturi";

/** Calea paginii, scrisa dupa gazda in ultima nota a listei ca PDF. */
export const CALE_PRETURI_EN = "/pricing";

/**
 * Ancorele: aceleasi ca pe RO (`ANCORE_PRETURI`), fiindca semnatura de forma compara id-urile sectiunilor. Blocul de
 * intrebari poarta ancora `pilot`: comparatia G3 trimite la `/pricing#pilot`, iar intrebarea "What is an assisted
 * pilot?" sta in acest bloc (titlul lui ramane legat prin `aria-labelledby`, deci forma nu se schimba).
 */
export const ANCORE_PRETURI_EN = { pachete: "pachete", poarta: "alegere", intrebari: "pilot" } as const;

/** Eticheta accesibila a firului din erou, in limba editiei. */
export const ETICHETA_FIR_EN = "Breadcrumb";

/** Eroul interior: `preturi.ts:66-76`. Subtitlul e capsula aprobata, scurtata la cutia RO. */
export const ANTET_PRETURI_EN: { fir: NivelFir[]; titlu: string; subtitlu: string } = {
  fir: [
    { text: "Home", cale: "/" },
    { text: "Pricing", cale: CALE_PRETURI_EN },
  ],
  titlu: "3S pricing: four plans, in euros",
  subtitlu:
    "3S has four plans, priced per company in euros, excluding VAT: Starter EUR 90, Pro EUR 150 and Business EUR 240 a month, for 5, 10 and 20 user accounts; Enterprise from EUR 800 a month. Every start is a free 30-day pilot.",
};

/** `preturi.ts:48-49`: numele accesibile ale poartei si ale pliurilor. */
export const ETICHETE_PRETURI_EN = { poarta: "The two 3S options", pliuri: "Accounts and features by plan" };

/** `preturi.ts:98-105`. */
export const POARTA_BAZA_EN: CardPoarta = {
  nume: "Starter, Pro, Business",
  titlu: "Same features in every plan",
  text: "For 5, 10 or 20 user accounts, priced per company, excluding VAT. The plans differ only in accounts.",
  mergi: "Choose a plan",
};

/** `preturi.ts:110-118`: linia Enterprise, cu tinta pagina ei de pe 3s.md. */
export const POARTA_ENTERPRISE_EN: CardPoarta & { tinta: Legatura } = {
  nume: "Enterprise",
  titlu: "For more than 20 user accounts",
  text: "From EUR 800 a month, on an annual contract. We send you a written offer.",
  mergi: "Enterprise details",
  tinta: { text: "3S Enterprise", href: "/enterprise", ruta: "/enterprise" },
};

/** `preturi.ts:127-134`; `inapoi` = textul butonului din linia de baza. */
export const LINIA_DE_BAZA_EN: ContinutLiniaDeBaza & { inapoi: string } = {
  inapoi: "The two 3S options",
  titlu: "Starter, Pro, Business",
  promisiune: "Your company's documents, easy to find.",
  paragraf:
    "Prices are per company, not per user, in euros, excluding VAT. Starter, Pro and Business have the same features; they differ only in the number of user accounts.",
};

/**
 * Planurile, cu sumele grilei EN (decizia 18): 90 / 150 / 240 EUR pe luna, 75 / 125 / 200 pe luna la plata anuala.
 * Insigna "Recommended" ramane pe Starter, ca pe RO (decizia 59, intrebarea 8). `preturi.ts:283-303`.
 */
export const PLANURI_EN: Plan[] = [
  {
    cheie: "starter",
    nume: "Starter",
    descriere: "A small office where up to five people search and share documents every day has everything it needs here.",
    pret: { lunar: 90, anual: 75 },
    conturi: 5,
    recomandat: true,
  },
  {
    cheie: "pro",
    nume: "Pro",
    descriere:
      "When the same document passes through many hands, from accounting to sales and management, ten accounts keep the team in one place.",
    pret: { lunar: 150, anual: 125 },
    conturi: 10,
    recomandat: false,
  },
  {
    cheie: "business",
    nume: "Business",
    descriere: "When the company has several departments, each with its own folders, twenty accounts cover the whole structure.",
    pret: { lunar: 240, anual: 200 },
    conturi: 20,
    recomandat: false,
  },
];

/** `preturi.ts:311-320`; butonul planului duce la WhatsApp, cu legatura pusa de pagina (`grilaEn`). */
export const GRILA_EN = {
  eticheta: "3S plans",
  recomandat: "Recommended",
  unitate: "EUR / month",
  buton: "Message us",
  detalii: (rand: string) => "What it means: " + rand,
};

/** `preturi.ts:346-362`: lista de 9 randuri a unui plan; iconita "i" ramane pe randul al saselea. */
export function randuriPlanEn(plan: Plan): RandPlan[] {
  return [
    { cifra: String(plan.conturi), text: "user accounts", explicatie: null },
    { cifra: null, text: "Priced per company", explicatie: null },
    { cifra: null, text: "Search with cited sources", explicatie: null },
    { cifra: null, text: "Text from scans and photos", explicatie: null },
    { cifra: null, text: "Automatic type tags", explicatie: null },
    {
      cifra: null,
      text: "Retention set per folder",
      explicatie: "You can set a retention period for each folder, and it applies to the documents in it.",
    },
    { cifra: null, text: "Zip export of originals", explicatie: null },
    { cifra: null, text: "EU hosting, Frankfurt", explicatie: null },
    { cifra: null, text: "Works in the browser", explicatie: null },
  ];
}

/**
 * Cursoarele calculatorului (`preturi.ts:173-197`). Tariful orar e in EUR (decizia 54). Domeniul lui nu e o decizie a
 * owner-ului: e ales aici (5-100 EUR pe ora, pas 1, pornire 15) si se confirma pe capturi, odata cu textul.
 */
export const CURSOARE_EN: Record<"persoane" | "minute" | "tarif", Cursor> = {
  persoane: {
    eticheta: "Colleagues who need documents daily",
    unitate: "",
    unitateSpusa: { unu: "person", multe: "people" },
    min: 1,
    max: 50,
    pas: 1,
    implicit: 4,
  },
  minute: {
    eticheta: "Minutes each spends in folders daily",
    unitate: "min",
    unitateSpusa: { unu: "minute a day", multe: "minutes a day" },
    min: 10,
    max: 120,
    pas: 5,
    implicit: 25,
  },
  tarif: {
    eticheta: "Average hourly cost of a colleague",
    unitate: "EUR",
    unitateSpusa: { unu: "euro an hour", multe: "euros an hour" },
    min: 5,
    max: 100,
    pas: 1,
    implicit: 15,
  },
};

/** Textele calculatorului (`preturi.ts:161-232`); moneda sta inaintea sumei ("EUR 1,833"). */
export const CALCULATOR_EN = {
  teaser: {
    presupuneri: (oameni: string, minute: string) => "With " + oameni + " searching for documents " + minute + " a day",
    rezultat: (ore: string) => "totals " + ore + " a month",
    cta: "Try it with your own figures",
  },
  eticheta: "Time lost searching for documents",
  zileLucratoare: 22,
  timpAcum: { inainte: "Today you pay EUR ", dupaBani: " a month for the ", dupaOre: " h your team spends searching through folders." },
  pretInOre: { inainte: "The plan that fits is ", dupaPlan: ": EUR ", dupaPret: " a month, the cost of ", dupaOre: " h of work at the chosen rate." },
  pesteConturi: {
    inainte: (persoane: number) => "For " + persoane + " people, the plans are not enough: talk to the 3S team about ",
    dupa: ".",
  },
  nota: "We assume 22 working days a month. The result shows the time you lose today.",
};

/** Valoarea unui cursor spusa cititorului de ecran: singular la 1, altfel pluralul, fara "de" romanesc. */
export function valoareSpusaEn(cursor: Cursor, n: number): string {
  return n + " " + (n === 1 ? cursor.unitateSpusa.unu : cursor.unitateSpusa.multe);
}

/** `preturi.ts:242-250`: nota de sub comutator e propozitia TVA a deciziei 24, cuvant cu cuvant. */
export const COMUTATOR_EN: ContinutComutator = {
  eticheta: "Billing period",
  lunar: "Monthly",
  anual: "Annual",
  insigna: "2 months free",
  nota: "Prices exclude VAT; where VAT applies, it is added to the invoice.",
};

const LUNI_EN = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

/** Data zilei in engleza americana: "September 25, 2026". */
export function dataEn(d: Date): string {
  return LUNI_EN[d.getMonth()] + " " + d.getDate() + ", " + d.getFullYear();
}

/** `preturi.ts:372-385`: "price list", nu "offer" (oferta scrisa e alt document, valabil 30 de zile). */
export const LISTA_PDF_EN: ContinutListaPdf = {
  buton: "Print the price list or save it as PDF",
  foaie: {
    marca: "3S Scan Store Solve",
    titlu: "3S prices",
    coloane: { plan: "Plan", lunar: "Monthly, EUR", anual: "Annual, per month, EUR" },
    note: ["Indicative prices, excluding VAT.", "Every start is a free 30-day pilot.", "Prices as shown on the website on the date above."],
    adresa: "Pricing page: ",
  },
};

/** `preturi.ts:395-397` si `:431-433`: titlurile si paragrafele celor doua pliuri. */
export const PLIURI_EN: ContinutPliuri = {
  eticheta: ETICHETE_PRETURI_EN.pliuri,
  birou: {
    titlu: "Each plan sets your number of accounts",
    paragraf: "Starter, Pro and Business differ only in the number of user accounts: 5, 10 or 20. The price is per company, not per user.",
  },
  comparatie: { titlu: "The plans, side by side", paragraf: "What each plan includes, row by row" },
};

/**
 * `preturi.ts:405-411`: biroul fara demonstratia dispozitivelor (`:399`, `:401`, `:403`, `:412` sunt X, val-ro-1.1).
 * Pornirea scenei e cea RO (5); banda de conturi are eticheta si textul locurilor.
 */
export const BIROU_EN: ContinutBirouConturi = {
  initial: 5,
  conturi: "Accounts in plan",
  locuri: (n: number) => n + " accounts, one for each colleague",
};

const DA: CelulaTabel = { fel: "da" };
const toate = (c: CelulaTabel): Record<CheiePlan, CelulaTabel> => ({ starter: c, pro: c, business: c });
const valoare = (text: string): CelulaTabel => ({ fel: "valoare", text });

/** `preturi.ts:431-476`: 4 categorii, 14 randuri, ca pe RO; randurile scoase sunt inlocuite cu fapte confirmate. */
export const TABEL_EN: ContinutTabelPlanuri = {
  functie: "Feature",
  inclus: "included",
  derulare: "Plans table; on a narrow screen it scrolls sideways",
  categorii: [
    {
      titlu: "Where your files are stored",
      randuri: [
        { functie: "EU hosting region", celule: toate(valoare("Frankfurt")) },
        { functie: "Retention per folder", celule: toate(DA) },
      ],
    },
    {
      titlu: "Team and accounts",
      randuri: [
        { functie: "Share by expiring link", celule: toate(DA) },
        { functie: "User accounts", celule: { starter: valoare("5"), pro: valoare("10"), business: valoare("20") } },
        { functie: "Free 30-day pilot", celule: toate(DA) },
        { functie: "Per-user fee", celule: toate(valoare("None")) },
        { functie: "Zip export", celule: toate(DA) },
      ],
    },
    {
      titlu: "What the archive does",
      randuri: [
        { functie: "Answers with sources", celule: toate(DA) },
        { functie: "Text from scans and photos", celule: toate(DA) },
        { functie: "Automatic type tags", celule: toate(DA) },
        { functie: "Upload from the browser", celule: toate(DA) },
      ],
    },
    {
      titlu: "Access and price",
      randuri: [
        { functie: "Where you ask", celule: toate(valoare("In the browser")) },
        { functie: "Sign-up", celule: toate(valoare("By invitation")) },
        { functie: "Monthly, EUR", celule: { starter: valoare("90"), pro: valoare("150"), business: valoare("240") } },
      ],
    },
  ] satisfies CategorieTabel[],
};

/**
 * `preturi.ts:490-529`: cele sapte sectiuni aprobate ale fisei, in ordinea in care fiecare intrebare isi gaseste
 * cutia RO. Raspunsurile sunt text simplu (aceleasi siruri ajung in FAQPage).
 */
export const INTREBARI_EN: ContinutFaqPreturi = {
  titlu: "Plans and payment, in short",
  subtitlu: "What each plan includes, what you pay and when",
  intrebari: [
    { intrebare: "Do the prices include VAT?", raspuns: "No. Prices are in euros and exclude VAT; where VAT applies, it is added to the invoice." },
    {
      intrebare: "Are there discounts?",
      raspuns:
        "Pay annually: two months free. On Starter, Pro and Business, annual billing costs 10 monthly payments for 12 months, 16.7% less. The first month after the pilot is billed at the listed price, with no pilot discount.",
    },
    {
      intrebare: "Why are the prices indicative?",
      raspuns: "The plan depends on how many people will use 3S. After the pilot, we confirm the plan and the price in a written offer, valid for 30 days.",
    },
    {
      intrebare: "When do I pay, and how long is an offer valid?",
      raspuns:
        "Invoices are due within 14 days of the invoice date, and subscriptions are billed in advance. Our written offer, and its price, are valid for 30 days.",
    },
    {
      intrebare: "What is an assisted pilot?",
      raspuns:
        "A free 30-day pilot on your own documents, with 5 user accounts, as on Starter. We agree on the volume in writing, and it starts once you accept our Terms and the DPA. You choose the questions; we check the answers and sources with you.",
    },
    {
      intrebare: "Can I try 3S before deciding?",
      raspuns: "Yes. The assisted pilot is free for 30 days, on your own documents. Message us to agree on the documents and the questions.",
    },
    {
      intrebare: "How do I get a quote?",
      raspuns:
        "Message us on WhatsApp. A few lines are enough: what you keep (paper, scans, files or a mix), where the archive is and in which country, the language of the documents, roughly how much there is and how many people will use 3S. Please send no documents or personal data yet.",
    },
  ],
};
