// Textele paginii `/enterprise` (fisa enterprise.md, COMPONENTE §4.7). Forma e a referintei
// masurate; textul e scris pentru 3S, din faptele din registrul de afirmatii
// (`src/content/afirmatii/enterprise-formular.json`) si din deciziile D4b / D4c ale planului.
//
// Faptele pe care se sprijina: functionalitatile exista (D4b); gazduire Amazon, Germania, o singura
// regiune UE (D4c); AES-256 la stocare si TLS 1.2+ in tranzit (D4c, neconfirmat de dezvoltator);
// integrarile (D4c) si WhatsApp; digitizarea si arhivarea fizica sunt servicii ale marcii 3S (D10).
// Documentul din banda e FICTIV si e declarat ca exemplu pe pagina (D9).

import type { Legatura } from "./navigatie";

export const META_ENTERPRISE = {
  // Lungime: 50 [numarat]; pragul portii 15-65.
  titlu: "3S pentru organizații: migrare, reguli și contract",
  // Lungime: 137 [numarat]; pragul portii 50-160.
  descriere:
    "Pentru arhive mari: echipa 3S scanează hârtia, mută dosarele și leagă programele firmei. Implicit, fișierele stau în Germania, pe Amazon.",
};

export const CALE_ENTERPRISE = "/enterprise";

/** Ancora formularului: tinta butonului din erou. */
export const ANCORA_FORMULAR = "contact-form";

export const EROU_ENTERPRISE = {
  fir: [
    { text: "Acasă", cale: "/" },
    { text: "Enterprise", cale: CALE_ENTERPRISE },
  ],
  // Rol: intoarcerea la alegerea dintre planuri. Lungime: 17 [numarat].
  inapoi: { text: "Înapoi la planuri", href: "/preturi", ruta: "/preturi" } satisfies Legatura,
  // Rol: titlul de beneficiu, 3 randuri la 20ch. Lungime: 74 [numarat].
  titlu: "3S pentru organizații: arhiva de hârtie răspunde cu actul și pagina exactă",
  // Rol: raspunsul paginii, 3 randuri la 640 px (G-AI-02: 30-80 de cuvinte; 31 aici). Lungime: 189 [numarat].
  subtitlu:
    "Pentru firmele cu mii de dosare, echipa 3S scanează hârtia, mută arhiva și leagă programele pe care le folosiți; nivelul de serviciu se trece în contract. Implicit, datele stau în Germania.",
  // Rol: butonul spre formular. Lungime: 21 [numarat].
  buton: "Programați o discuție",
  // Rol: legatura secundara spre pagina platformei.
  secundara: { text: "Cum lucrează platforma", href: "/platforma", ruta: "/platforma" } satisfies Legatura,
  // Rol: randul de incredere, 4 elemente scurte.
  incredere: ["Găzduire în Germania", "Amazon, o regiune UE", "AES-256 și TLS 1.2+", "WhatsApp inclus"],
};

export type ElementDrum = { text: string };

export const DRUM_DOCUMENT = {
  // Rol: titlul benzii inchise, un rand si la 358 px (21,6 px). Lungime: 23 [numarat].
  titlu: "De la hârtie la răspuns",
  intrare: {
    eticheta: "Primire",
    elemente: ["Hârtie scanată de 3S", "Gmail și Outlook", "WhatsApp", "Interfața web", "Microsoft 365 și Google Workspace"],
  },
  intelegere: {
    eticheta: "Citire",
    elemente: [
      "Recunoașterea textului",
      "Tipul actului, detectat",
      "Câmpuri citite din act",
      "Căutare cu sursa citată",
      "Reguli automate",
    ],
  },
  stocare: {
    eticheta: "Păstrare",
    pastile: ["Amazon, Germania", "o regiune UE", "AES-256"],
  },
  iesire: {
    eticheta: "Livrare",
    elemente: ["Răspuns pe WhatsApp", "Portalul clienților", "Programul de contabilitate", "Dosarul din arhivă", "Export și API"],
  },
  /**
   * Faptele documentului-exemplu, in ordinea aprinderii: numele fisierului (mono), tipul, suma
   * (mono), starea, anul pana la care se pastreaza. Totul fictiv.
   */
  fapte: [
    { text: "pv_receptie_0147.pdf", mono: true },
    { text: "PV recepție", mono: false },
    { text: "4.750,00 RON", mono: true },
    { text: "Semnat", mono: false },
    { text: "termen: 10 ani", mono: false },
  ],
  anStart: "2026",
  anFinal: "2036",
  // Rol: nota de sub axa timpului; declara exemplul (D9).
  // Un rand la 358 px (12 px), ca la referinta.
  nota: "Exemplu fictiv. Termenul îl alege firma, pe tipul de act.",
  // Rol: eticheta mica din coltul machetei (D11), vizibila la orice pas al buclei.
  etichetaExemplu: "exemplu",
};

export type Livrabil = { titlu: string; text: string };

export const LIVRABILE = {
  // Rol: titlul listei. Lungime: 39 [numarat].
  titlu: "Ce face echipa 3S la nivelul enterprise",
  // Rol: subtitlul, 2 randuri la 640 px.
  text: "În primele săptămâni lucrăm alături de oamenii firmei, până când arhiva voastră răspunde la întrebări cu actul și pagina din care vine răspunsul.",
  // Ordinea: intai cele doua elemente scurte (un rand de text la 635 px), apoi cele patru lungi.
  // Continutul vine din serviciile 3S: termenele, colegul alocat, scanarea, gazduirea implicita,
  // intrebarile pe WhatsApp si arhiva fizica.
  elemente: [
    {
      titlu: "Termene de păstrare pe tipuri de acte",
      text: "Fiecare tip de act primește termenul stabilit cu voi, aplicat apoi automat de 3S.",
    },
    {
      titlu: "Un coleg 3S alocat firmei",
      text: "Îl găsiți pe WhatsApp sau pe e-mail când vreți o regulă nouă sau un răspuns lămurit.",
    },
    {
      titlu: "Cutiile din depozit, în aceeași căutare",
      text: "Echipa 3S scanează hârtia și o citește, iar o întrebare despre un act vechi primește răspuns cu sursa citată, ca la unul digital.",
    },
    {
      titlu: "Găzduire implicită în Germania",
      text: "Fișierele stau pe Amazon, în Germania, într-o singură regiune UE, criptate AES-256 la stocare și transmise prin TLS 1.2 sau mai nou.",
    },
    {
      titlu: "Arhiva întrebată din WhatsApp",
      text: "Oricine din firmă trimite întrebarea pe WhatsApp și primește înapoi actul găsit, cu pagina din care vine răspunsul, în aceeași conversație.",
    },
    {
      titlu: "Originalele, în arhiva fizică 3S",
      text: "După scanare, dosarele de hârtie pot rămâne în arhiva fizică 3S: biroul se eliberează, iar originalul rămâne la îndemână când e cerut.",
    },
  ] satisfies Livrabil[],
};

export const FORMULAR_ENTERPRISE = {
  // Rol: eticheta sectiunii. Lungime: 10 [numarat].
  eticheta: "Enterprise",
  // Rol: titlul formularului; tinta masurata: 3 randuri la 40 px pe 640 si 4 la 30 px pe 358.
  titlu: "O discuție despre arhiva firmei și programele ei, înainte de orice ofertă sau contract",
  // Rol: subtitlul, un rand. Lungime: 53 [numarat].
  subtitlu: "Pornim de la dosarele și programele pe care le aveți.",
  // Rol: textul-exemplu al mesajului, propriu paginii.
  exempluMesaj:
    "De exemplu: câte cutii de arhivă aveți, în ce program țineți contabilitatea și ce ați vrea să găsiți mai repede.",
  // Rol: subiectul din previzualizarea de rezerva; firma se adauga dupa cratima.
  subiect: "Cerere enterprise",
};
