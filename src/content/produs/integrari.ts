// Contractul de continut al paginii `/integrari` (felia `produs`, sablonul "interior-880";
// fisa de masurare `integrari.md`).
//
// Integrarile sunt cele ale referintei vizuale, plus WhatsApp, toate disponibile azi: deciziile
// owner-ului D4b (functionalitatile se prezinta ca existente) si D4c (aceleasi integrari ca la
// sursa, plus WhatsApp). Doua abateri, cu motivul:
//   - randul de facturare electronica: la referinta sta sistemul national al altei tari; aici stau
//     reteaua Peppol si Storecove, deja confirmate in registrul startului. Peppol se descrie pe
//     peppol.org/about ca un cadru de interoperabilitate ("Interoperability Framework"), nu ca
//     furnizor de schimburi, prin care firmele trimit si primesc documente "in an open and secure
//     network"; Storecove se prezinta pe storecove.com ca acces la "the Peppol network" printr-un
//     singur API, furnizor certificat de punct de acces Peppol. Textul il numeste pe fiecare cu
//     rolul lui (sursele deschise pe 2026-09-25, citatele si in registrul de afirmatii);
//   - programele de contabilitate primesc si SAP Business One, integrare confirmata tot acolo.
// Numele produselor tertilor sunt numai text, fara sigle (fisa: "sursa listeaza integrarile doar
// ca text"); marcile raman ale detinatorilor lor. Ordinea din fiecare card e a noastra.
//
// Legenda pastreaza cele trei stari ale formei masurate, desi azi toate pastilele sunt in prima.

import type { Legatura } from "@/content/navigatie";
import type { IconitaProdus } from "./iconite";

export const CALE_INTEGRARI = "/integrari";

export const META_INTEGRARI = {
  titlu: "Integrări 3S: Microsoft 365, Google Workspace, WhatsApp",
  descriere:
    "3S se leagă de Microsoft 365, Google Workspace, WhatsApp, programele de contabilitate, stocarea S3 și autentificarea unică. Toate funcționează azi.",
};

export const FIR_INTEGRARI = [
  { text: "Acasă", cale: "/" },
  { text: "Integrări", cale: CALE_INTEGRARI },
];

export const EROU_INTEGRARI = {
  // Rol: produsul lucreaza cu programele firmei (2 randuri la 1440). Lungime: ~55.
  titlu: "Arhiva 3S, legată de programele în care lucrează firma",
  // Rol: ce se leaga azi si cum intra conturile (5 randuri la 1440). Primul paragraf din <main>:
  // 30-80 de cuvinte (poarta G-AI-02).
  subtitlu:
    "Echipa rămâne în programele cu care lucrează: actele din Microsoft 365, Google Workspace și programul de contabilitate ajung singure în arhiva 3S, iar întrebările se pun și pe WhatsApp. Pentru aplicațiile proprii există API cu webhook-uri, iar conturile vin din directorul firmei, cu autentificare unică, fără parole noi de ținut minte.",
};

export type StareIntegrare = "disponibil" | "lucru" | "plan";

export const LEGENDA_INTEGRARI: { stare: StareIntegrare; text: string }[] = [
  { stare: "disponibil", text: "Funcționează azi" },
  { stare: "lucru", text: "În lucru" },
  { stare: "plan", text: "Planificat" },
];

export type CategorieIntegrari = {
  iconita: IconitaProdus;
  titlu: string;
  descriere: string;
  integrari: { nume: string; stare: StareIntegrare }[];
};

/** Titlul ascuns al grilei: tine ierarhia de titluri (h1, apoi h2, apoi titlurile cardurilor). */
export const TITLU_GRILA_INTEGRARI = "Integrările, pe categorii";

const disponibile = (nume: string[]) => nume.map((n) => ({ nume: n, stare: "disponibil" as StareIntegrare }));

export const CATEGORII_INTEGRARI: CategorieIntegrari[] = [
  {
    iconita: "document-randuri",
    titlu: "Programe de contabilitate",
    descriere:
      "Arhiva se leagă de programul în care ții contabilitatea, ca actele să nu mai fie trimise de mână de la unul la altul, nici exportate în fiecare lună.",
    integrari: disponibile(["SAP Business One", "Sage", "QuickBooks", "Zoho Books", "Xero", "NetSuite"]),
  },
  {
    iconita: "document",
    titlu: "Facturare electronică",
    descriere:
      "Facturile primite prin rețeaua Peppol, direct sau prin Storecove, se găsesc apoi în 3S după furnizor, număr sau sumă, alături de restul actelor firmei.",
    integrari: disponibile(["Peppol", "Storecove"]),
  },
  {
    iconita: "panou",
    titlu: "Productivitate și comunicare",
    descriere:
      "Slack, Notion, Microsoft Teams, Microsoft 365 și Google Workspace se leagă de arhivă, iar pe WhatsApp echipa primește răspunsuri despre acte, cu pagina citată.",
    integrari: disponibile(["Microsoft 365", "Google Workspace", "WhatsApp", "Slack", "Microsoft Teams", "Notion"]),
  },
  {
    iconita: "cilindru",
    titlu: "Infrastructură de stocare",
    descriere:
      "În planul Enterprise, 3S lucrează direct pe stocarea firmei, iar fișierele stau în contul ei; colegii întreabă mai departe pe web și pe WhatsApp, ca înainte.",
    integrari: disponibile(["AWS S3", "MinIO", "Azure Blob Storage", "Backblaze B2", "Wasabi", "Compatibil S3"]),
  },
  {
    iconita: "rotita",
    titlu: "Automatizare și API",
    descriere:
      "Aplicațiile firmei trimit și citesc acte prin API-ul REST, iar webhook-urile, Zapier, Make și n8n pornesc fluxurile firmei când un act intră în arhivă.",
    integrari: disponibile(["REST API v1", "Webhook-uri", "Zapier", "Make", "n8n"]),
  },
  {
    iconita: "lacat",
    titlu: "Autentificare și SSO",
    descriere:
      "Colegii intră în 3S cu contul de la serviciu, prin Microsoft Entra ID, Google sau Okta. Sunt acceptate atât SAML 2.0, cât și OIDC, fără o parolă separată pentru 3S.",
    integrari: disponibile([
      "SSO / SAML 2.0",
      "Microsoft Entra ID",
      "Conturi din director",
      "Grupuri Entra ID",
      "Google SSO",
      "Okta",
      "OIDC",
    ]),
  },
];

export const DIRECTOR_INTEGRARI = {
  titlu: "Conturile echipei vin din Microsoft Entra ID",
  text: "Pentru firmele care își țin echipa în Microsoft Entra ID, 3S află de acolo cine lucrează în firmă și în ce grup, așa că lista de utilizatori are o singură sursă.",
  pasi: [
    {
      titlu: "Lista de colegi, deja plină",
      text: "După legătură, administratorul 3S găsește colegii firmei în pagina de utilizatori, fără să fi trimis vreo invitație și fără un tabel cu adrese încărcat de mână.",
    },
    {
      titlu: "Fără o parolă separată",
      text: "Fiecare coleg intră cu contul de la serviciu, prin SAML 2.0 sau OIDC, deci pentru 3S nu mai are nicio parolă de ținut minte, iar echipa IT nu mai are una de resetat.",
    },
    {
      titlu: "Dosarele, deschise de administrator",
      text: "Grupurile din Entra ID apar și ele în 3S, iar administratorul hotărăște ce dosare deschide fiecărui coleg, pe nume, după ce face fiecare în firmă.",
    },
  ],
  nota: "După import, accesul rămâne pe persoană și pe dosar, ca pentru orice cont din 3S, iar fiecare act deschis intră în jurnal, cu numele și ora.",
};

// Pe lungimea rolului masurat (fisa integrari.md §2d): titlul si textul incap fiecare pe un rand la
// 1440, iar butonul ramane in dreapta, pe acelasi rand (card 880 x 117).
export const LIPSESTE_INTEGRARI = {
  titlu: "Un program care lipsește din listă",
  text: "Scrie-ne numele lui și îți spunem dacă 3S se poate lega de el.",
  buton: { text: "Cere o integrare", href: "/contact", ruta: "/contact" } as Legatura,
};

export function toateLegaturileIntegrari(): Legatura[] {
  return [LIPSESTE_INTEGRARI.buton];
}
