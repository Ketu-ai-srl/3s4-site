// Pagina G3 a editiei `en`: comparatia 3S cu Google Drive (grupul referinta, poarta B), perechea paginii RO
// `/comparatie-drive`.
//
// FORMA (decizia 53, felia editie-referinta): pagina compune componentele perechii RO, in aceeasi ordine
// (EroulInterior, CardDivizat, TabelMarcaje, CutieCta880), cu textul de aici. Intrebarea 7 a specificatiei de
// congruenta, pe recomandarea scrisa (decizia 59, lectura dispecerului): tabelul RO cu un singur tert, Google Drive
// cu functiile Gemini, si numai randurile permise; Gemini Notebook si Box AI raman in fisa. Nu se monteaza
// DiagramaConectori (decizia 43: stocarea proprie) si SinaPasi (actul pe hartie: poarta juridica 40-41, deciziile
// 31 si 43).
//
// RANDURILE TABELULUI. Din cele 13 ale paginii RO raman doua: cautarea cu sursa citata si jurnalul deschiderilor.
// Randul "text din scanari" e TINUT de fisa (sectiunea "Do not say (this page)" interzice pe pagina asta
// recunoasterea textului de catre 3S); textul lui propus sta in fisa, pana decide dispecerul sau owner-ul. Celelalte
// zece ies pe deciziile 31, 43, 49 si pe regulile faptelor confirmate (lista `config/congruenta/g3.json`).
//
// SURSA TEXTULUI: fisa de continut a paginii, sectiunea "Component copy (decision 53)"; starea lui e PROPUS pana la
// aprobarea owner-ului pe capturi. Textul e ASCII, in engleza americana. Celulele 3S trimit la intrari EN din
// registru; marcajele Google sunt cele ale paginii RO (citite pe 25.09.2026, pe paginile romanesti ale documentatiei
// Google); adresele trec pe `hl=en`, iar titlurile EN ale paginilor sunt traducerea noastra pana la recitirea
// dinaintea portii B.
//
// EXCEPTIA PORTII DE AFIRMATII (tiparul certificarilor) se aplica fisierului acestuia: grupul de surse al cardului
// numeste certificarile pe care le declara GOOGLE, cu sursa si data (decizia 11). Compensarea e in
// `tests/en-referinta.test.ts`: nicio afirmatie 3S a paginii nu numeste o certificare.

import type { CardDivizatProps } from "@/components/comparatii/CardDivizat";
import type { SurseSuplimentare } from "@/components/comparatii/TabelMarcaje";
import type { NivelFir } from "@/components/primitive/FirPagina";
import type {
  Marcaj,
  SursaOficiala,
  TabelComparatie,
} from "@/content/comparatii";
import {
  ETICHETA_BUTON_CANAL,
  ETICHETA_FIR,
  FEREASTRA_NOUA,
  type PaginaReferinta,
} from "./referinta-comun";

const CALE = "/compare/3s-vs-google-and-box";

/** Ziua in care s-au citit marcajele Google (citirea paginii RO, aceeasi documentatie). */
export const DATA_CITIRII_MARCAJE = "September 25, 2026";

/** Ziua in care s-au citit sursele cardului (fisa, S2, S11, S12). */
const CITIT_CARD = "September 30, 2026";

const META = {
  titlu: "3S and Google Drive, Compared Feature by Feature",
  descriere:
    "AI search with cited sources and a log of who opens files in 3S, next to Google Drive, with Google's own documentation for each Google mark.",
  cale: CALE,
};

// Rol: titlul paginii (h1 pe 2 randuri).
const H1 = "3S and Google Drive with Gemini, side by side";

export const EROU_EN: {
  fir: NivelFir[];
  etichetaFir: string;
  titlu: string;
  subtitlu: string;
} = {
  fir: [
    { text: "Home", cale: "/" },
    { text: "Comparison", cale: CALE },
  ],
  etichetaFir: ETICHETA_FIR,
  titlu: H1,
  // Rol: ce face fiecare instrument si cand alegi 3S; primul paragraf din <main>.
  subtitlu:
    "If your files already sit in Google Drive, try Gemini there first. Choose 3S for an assisted pilot on your own documents. Need specific certifications? Ask us first.",
};

export const DIVIZAT_EN: CardDivizatProps = {
  stanga: {
    titlu: "When should you not choose 3S?",
    elemente: [
      "You need specific certifications today",
      "You need many ready-made integrations",
      "You need e-signatures inside the archive",
    ],
    nota: "Google Drive covers some of these; check it first.",
  },
  dreapta: {
    titlu: "When does 3S fit?",
    elemente: [
      "You need to try 3S on your own documents first",
      // Numele sistemului nu se rupe: spatiu nedespartitor dupa "RO" si unirea de cuvant U+2060 dupa cratima simpla,
      // ca pe cardul /ro (la 390 si la 768 px se rupea in "RO e-" / "Factura").
      "Your e-invoices arrive as XML from RO\u00a0e-\u2060Factura",
      "Every answer must point to its source",
      "You need help with the first documents",
    ],
  },
};

// Sursele Google ale randurilor ramase; adresele pe `hl=en`.
const G_CAUTARE: SursaOficiala = {
  eticheta: "Find files in Google Drive, Google Drive Help",
  url: "https://support.google.com/drive/answer/2375114?hl=en",
};
const G_PRODUS: SursaOficiala = {
  eticheta: "Google Drive product page, Google Workspace",
  url: "https://workspace.google.com/products/drive/",
};
const G_JURNAL: SursaOficiala = {
  eticheta: "Drive log events, Google Workspace Admin Help",
  url: "https://knowledge.workspace.google.com/admin/reports/drive-log-events?hl=en",
};

export const TABEL_EN: TabelComparatie = {
  titlu: "Feature by feature: Drive and 3S",
  capFunctie: "Feature",
  // Numele produsului pe doua randuri, ca pe RO ("with Gemini" nu incape in capul de 96 px; sta in titlu).
  coloaneTerti: ["Google\nDrive"],
  coloanaNoi: "3S",
  latimeMinima: 420,
  latimeColoana: 136,
  latimeColoanaMica: 88,
  titluSurse: "Where the Google Drive ratings come from",
  notaSurse:
    "The ratings follow Google's public documentation, read on " +
    DATA_CITIRII_MARCAJE +
    ". Several features depend on the Google Workspace plan you choose.",
  randuri: [
    {
      functie: "Answers show their source",
      terti: [
        {
          marcaj: "da",
          nota: "With Gemini features in Workspace, Drive search gives an answer summarized from your files, with links to the sources it used.",
          surse: [G_CAUTARE, G_PRODUS],
        },
      ],
      noi: { marcaj: "da", afirmatie: "en-comparatii-cautare-cu-sursa" },
    },
    {
      functie: "Log of who opens files",
      terti: [
        {
          marcaj: "partial",
          nota: "The administrator sees Drive events in the Admin console; most are recorded only on plans that include them.",
          surse: [G_JURNAL],
        },
      ],
      noi: { marcaj: "da", afirmatie: "en-flux-functii-in-productie" },
    },
  ],
};

export const LEGENDA_EN: Record<Marcaj, string> = {
  da: "Yes",
  partial: "Partial",
  nu: "No",
};

export const ETICHETA_LEGENDA_EN = "Key to the ratings";

export const FEREASTRA_NOUA_EN = FEREASTRA_NOUA;

/** Sursele afirmatiilor despre Google din cardul divizat (decizia 11: sursa si data pe fiecare afirmatie despre un tert). */
export const SURSE_CARD_EN: SurseSuplimentare[] = [
  {
    titlu: "Card: what Google Drive covers",
    surse: [
      {
        eticheta:
          "Google Drive product page, Google Workspace, read " + CITIT_CARD,
        url: "https://workspace.google.com/products/drive/",
      },
      {
        eticheta: "ISO/IEC 27001 compliance, Google Cloud, read " + CITIT_CARD,
        url: "https://cloud.google.com/security/compliance/iso-27001",
      },
      {
        eticheta: "SOC 2 compliance, Google Cloud, read " + CITIT_CARD,
        url: "https://cloud.google.com/security/compliance/soc-2",
      },
    ],
  },
];

const CTA = {
  ref: "en-vs",
  textWhatsapp:
    "Hello 3S, I read your comparison with Google Drive [ref:en-vs]. I would like to ask whether 3S fits our case.",
  subiectEmail: "3S inquiry [ref:en-vs]",
};

/** Cutia de incheiere; butonul il rezolva pagina (tinta WhatsApp cu textul precompletat). */
export const CUTIE_CTA_EN = {
  titlu: "Not sure whether 3S fits? Ask us.",
  text: "Tell us what you keep and where it lives. We will say plainly whether 3S fits, or which tool to try first.",
  butonText: ETICHETA_BUTON_CANAL,
};

export const pagina: PaginaReferinta = {
  cheie: "compare-3s-vs-google-and-box",
  meta: META,
  h1: H1,
  cta: CTA,
  jsonLd: [
    {
      "@type": "Article",
      headline: H1,
      description: META.descriere,
      inLanguage: "en",
      datePublished: "2026-09-30",
      dateModified: "2026-09-30",
      isAccessibleForFree: true,
      citation: [
        G_CAUTARE,
        G_PRODUS,
        G_JURNAL,
        ...SURSE_CARD_EN[0].surse.slice(1),
      ].map((s) => s.eticheta + ", " + s.url),
    },
    {
      "@type": "WebPage",
      name: META.titlu,
      description: META.descriere,
      inLanguage: "en",
    },
  ],
  // Registrul `en-referinta.json`: intrarile lui numesc modulul in `unde`. Intrarea despre Box AI e retrasa (stare
  // `retras`, cu motivul in registru): pagina compara numai Google Drive, iar Box AI a ramas numai in fisa paginii.
  afirmatii: [
    "en-referinta-comparatii-publicitate-comparativa",
    "en-referinta-comparatii-marcaje-gemini-notebook",
    "en-referinta-comparatii-marcaje-gemini-drive",
    "en-referinta-comparatii-marcaje-box-ai",
    "en-referinta-comparatii-nespuse-pe-site",
    "en-referinta-efacturare-canale-3s",
    "en-comparatii-cautare-cu-sursa",
    "en-flux-functii-in-productie",
    "en-pagina-si-engleza-in-pilot",
    "en-gazduire-ue-frankfurt",
    "en-pret-orientativ-eur",
    "en-pilot-asistat",
    "en-cinema2-semnatura-in-curs",
    "en-ghiduri-cu-surse",
  ],
};
