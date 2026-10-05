// Limitele planurilor, taxa de conectare si suplimentele, ca DATE (deciziile 66-68 ale owner-ului, 05.10.2026, cu
// tabelul final al deciziei: descarcarile si coloana Enterprise incluse, Starter la 80 de raspunsuri).
// Modulul nu are text: fiecare editie (EN pe 3s.md, /ro, site-ul RO) isi scrie unitatile in limba ei si citeste
// cifrele de aici, ca o schimbare de limita sa se faca intr-un singur loc.
//
// Ce se publica: conturile, stocarea in GB, raspunsurile AI pe luna, paginile OCR pe luna, descarcarile in GB pe luna,
// taxa de conectare si suplimentele. Ce NU se publica si deci nu sta aici: plafonul intern de text indexat (decizia 66:
// clientul vede GB, nu caractere si nu documente), costurile si marjele.
//
// Cotele sunt pe ORGANIZATIE, nu pe utilizator, iar perioada e luna calendaristica (resetare pe 1 ale lunii).
//
// Modulul e numai date: il pot importa si invelitorile client, fara sa aduca nimic din continutul vreunei editii.

/** Planurile cu limite publicate. Enterprise = planul de baza, de la 21 de conturi. */
export type CheiePlanLimite = "starter" | "pro" | "business" | "enterprise";

/** Limitele unui plan; cele lunare se reiau pe 1 ale fiecarei luni calendaristice. */
export type LimitePlan = {
  /** Conturile de utilizator incluse (pe Enterprise: plafonul planului de baza). */
  conturi: number;
  /** Spatiul de stocare, in GB (nu e lunar: e ce ocupa documentele in orice moment). */
  stocareGb: number;
  /** Raspunsurile AI pe luna. */
  raspunsuriAiPeLuna: number;
  /** Paginile OCR pe luna. */
  paginiOcrPeLuna: number;
  /** Descarcarile pe luna, in GB. */
  descarcariGbPeLuna: number;
};

/** Ordinea planurilor, de la cel mai mic la cel mai mare. */
export const ORDINE_PLANURI: readonly CheiePlanLimite[] = ["starter", "pro", "business", "enterprise"];

export const LIMITE_PLANURI: Readonly<Record<CheiePlanLimite, Readonly<LimitePlan>>> = {
  starter: { conturi: 5, stocareGb: 100, raspunsuriAiPeLuna: 80, paginiOcrPeLuna: 1000, descarcariGbPeLuna: 15 },
  pro: { conturi: 10, stocareGb: 200, raspunsuriAiPeLuna: 200, paginiOcrPeLuna: 2500, descarcariGbPeLuna: 30 },
  business: { conturi: 20, stocareGb: 400, raspunsuriAiPeLuna: 400, paginiOcrPeLuna: 5000, descarcariGbPeLuna: 60 },
  enterprise: { conturi: 60, stocareGb: 500, raspunsuriAiPeLuna: 600, paginiOcrPeLuna: 20000, descarcariGbPeLuna: 200 },
};

/** Enterprise incepe de unde se termina Business: de la 21 de conturi. */
export const CONTURI_MINIME_ENTERPRISE = LIMITE_PLANURI.business.conturi + 1;

/**
 * Taxa de conectare (decizia 68): tarif fix publicat, platit o singura data, pe paginile arhivei aduse la pornire.
 * Paginile importate in pilotul gratuit intra in ea la trecerea pe plata; daca clientul nu continua, nu plateste nimic.
 */
export const CONECTARE = { eur: 6, pagini: 1000 } as const;

/** Pragul la care platforma avertizeaza in aplicatie, in procente din limita. */
export const PRAG_AVERTIZARE_PROCENT = 80;

/** Valabilitatea suplimentelor platite o data, in zile. */
export const VALABILITATE_SUPLIMENT_ZILE = 90;

/** Resursa pe care o mareste un supliment. Fara procesare de documente si fara text (decizia 66). */
export type ResursaSupliment = "raspunsuriAi" | "stocare" | "paginiOcr" | "descarcari";

/**
 * Un supliment: `o-data` = platit o singura data, valabil `VALABILITATE_SUPLIMENT_ZILE`; `lunar` = recurent, cat timp
 * e activ. `cantitate` e in unitatea resursei: raspunsuri, GB sau pagini.
 */
export type Supliment = {
  resursa: ResursaSupliment;
  cantitate: number;
  pretEur: number;
  facturare: "o-data" | "lunar";
};

/** Suplimentele, grupate pe resursa, in ordinea in care se afiseaza. Preturi in EUR, fara TVA. */
export const SUPLIMENTE: readonly Readonly<Supliment>[] = [
  { resursa: "raspunsuriAi", cantitate: 25, pretEur: 22, facturare: "o-data" },
  { resursa: "raspunsuriAi", cantitate: 100, pretEur: 79, facturare: "o-data" },
  { resursa: "stocare", cantitate: 25, pretEur: 9, facturare: "lunar" },
  { resursa: "stocare", cantitate: 100, pretEur: 29, facturare: "lunar" },
  { resursa: "stocare", cantitate: 500, pretEur: 139, facturare: "lunar" },
  { resursa: "paginiOcr", cantitate: 1000, pretEur: 6, facturare: "o-data" },
  { resursa: "paginiOcr", cantitate: 5000, pretEur: 24, facturare: "o-data" },
  { resursa: "descarcari", cantitate: 50, pretEur: 12, facturare: "o-data" },
];

/** Resursele suplimentelor, in ordinea primei aparitii. */
export const RESURSE_SUPLIMENTE: readonly ResursaSupliment[] = [...new Set(SUPLIMENTE.map((s) => s.resursa))];
