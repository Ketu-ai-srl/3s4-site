// Piesele comune ale paginilor EN de referinta (G1 `/guides/e-invoice-archiving-eu`, G2
// `/guides/records-retention-moldova`, G3 `/compare/3s-vs-google-drive`) dupa decizia 53: paginile compun
// componentele perechilor RO, cu textul in engleza. Aici stau numai textele pe care le folosesc la fel toate trei
// (fisele de continut, sectiunea "Component copy (decision 53)", le propun identice cu cele ale paginii de start).
//
// Textul e ASCII, in engleza americana (poarta de limba EN). Starea lui: PROPUS, pana la aprobarea owner-ului pe
// capturi (specificatia de congruenta, 4.3).

import type { ContinutCtaFinal } from "@/components/primitive/CtaFinalInchis";

/** Eticheta butonului de canal (WhatsApp) din erou si din blocul de final. */
export const ETICHETA_BUTON_CANAL = "Message us";

/** Eticheta accesibila a firului de pagina. */
export const ETICHETA_FIR = "Breadcrumb";

/** Textul pentru cititorul de ecran de dupa o legatura care se deschide in fereastra noua (cu spatiul de inceput). */
export const FEREASTRA_NOUA = " (opens in a new window)";

/** Microtextul de sub butonul de canal din blocul de final. */
export const MICROTEXT_FINAL = "A person replies, in English or Romanian.";

/** Vizualul blocului de final: aceleasi date fictive ca pe pagina de start, declarate ca exemplu. */
export const VIZUAL_FINAL: NonNullable<ContinutCtaFinal["vizual"]> = {
  declaratie: "Example with fictional data",
  pasi: [
    { iconita: "laptop", text: "Browser upload", ora: "09:41" },
    { iconita: "tag", text: "Tagged as invoice", ora: "09:41" },
  ],
  rezultat: {
    fisier: "Invoice_0415_example.pdf",
    stare: "Searchable in the archive",
    ora: "09:42",
  },
};

/** Blocul de final al unei pagini de referinta: titlul si subtitlul paginii, restul comun. */
export function ctaFinal(titlu: string, subtitlu: string): ContinutCtaFinal {
  return {
    titlu,
    subtitlu,
    // Folosit numai daca pagina nu da `butoane`; paginile pun butonul WhatsApp.
    butonPrincipal: { text: ETICHETA_BUTON_CANAL, href: null, ruta: null },
    microtext: MICROTEXT_FINAL,
    vizual: VIZUAL_FINAL,
  };
}

/** Partea paginii pe care o citesc metadata, datele structurate si registrul de afirmatii. */
export type PaginaReferinta = {
  cheie: string;
  meta: { titlu: string; descriere: string; cale: string };
  /** H1-ul paginii, egal cu titlul eroului. */
  h1: string;
  cta: { ref: string; textWhatsapp: string; subiectEmail: string };
  /** Nodurile Article si WebPage ale paginii; FAQPage, unde exista, il construieste pagina din intrebarile vizibile. */
  jsonLd: readonly Record<string, unknown>[];
  /** ID-urile intrarilor din registrul de afirmatii pe care se sprijina pagina (`src/content/afirmatii/`). */
  afirmatii: readonly string[];
};
