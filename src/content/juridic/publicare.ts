// Comutatorul PAGINILOR juridice (planul valului S4, §9-§10): care dintre cele 8 pagini ale
// grupului exista, dupa operatorul de date al domeniului (`OPERATOR_JSON`, altfel `config/operator.json`).
//
// REGULA: cu `"operator": null` (decizia owner-ului din 24.09.2026, "Nimeni deocamdata") paginile
// juridice NU exista - nu intra in `RUTE`, deci nici in harta de site, in subsol, in paleta sau in
// `/llms.txt`, iar adresele lor raspund 404. Din ziua in care operatorul e numit SI complet
// (`operatorComplet`: denumire, sediu, adresa de contact, tara) intra singure, toate opt, fara
// nicio alta modificare de cod. Paginile fara prelucrari de date (harta site si accesibilitatea)
// nu depind de comutator si stau direct in `RUTE`.
//
// DE CE MODULUL E MIC. `src/content/rute.ts` il importa, iar `rute.ts` ajunge si in pachetul de
// browser (antetul si paleta de cautare). Aici stau numai caile, titlurile scurte si descrierile
// rutelor; textele documentelor sunt in modulele lor si le citeste numai pagina, pe server.
//
// DE CE NU IMPORTA `@/lib/operator`. Modulul acela trece TOT `config/operator.json` prin
// `citesteOperator`, deci oricine il importa trage fisierul intreg, cu nota interna, in bucata de
// browser a layout-ului (masurat de critic pe 25.09.2026: `_nota` in `app/layout-*.js`). Aici se
// citeste numai cheia `operator`, iar pachetul de browser primeste doar valoarea ei (astazi `null`;
// in ziua operatorului, campurile publice ale firmei, aceleasi care se afiseaza pe pagini).
// Completitudinea o decide tot `operatorComplet`, pe server (`./comutator.ts`): un operator numit
// dar incomplet OPRESTE construirea, deci "numit" si "numit si complet" coincid pe orice build care
// a reusit, iar browserul si serverul vad aceeasi lista de rute.
//
// DE CE PAGINILE SUNT UN SEGMENT DINAMIC (`src/app/juridic/[[...document]]/page.tsx`). O pagina
// statica e construita si servita oricare ar fi operatorul, iar harta de site, portile de browser
// si poarta de rute o vad ca pagina publica. Segmentul dinamic, cu `generateStaticParams` legat de
// acelasi comutator, face ca pagina sa existe exact cand exista si ruta: fara operator nu se
// construieste nimic, deci nu exista nici HTML, nici adresa.

import configurare from "../../../config/operator.json";
import { citesteOperatorNumit, operatorNumitInMediu } from "../../lib/operator-mediu";
import type { Ruta } from "../rute";
import { citesteFamilie, familieDinConfigurare, familieInMediu, type FamilieJuridica } from "./familie";
import { caleMd, cheiPublicate, type CheieMd, type PoartaPublicare } from "./md/registru";
import type { LimbaJuridica } from "./tipuri";

/**
 * Exista un operator numit? Trei surse, in aceasta ordine (felia multi-domeniu):
 *   1. `NEXT_PUBLIC_OPERATOR_NUMIT`, valoarea pe care `next.config.ts` o calculeaza din `OPERATOR_JSON` la
 *      construire si pe care Next o inlocuieste in TOATE pachetele, si pe cel de browser: "true" / "false"
 *      hotarasc. Expresia e scrisa LITERAL, fiindca Next inlocuieste numai ce recunoaste pe text;
 *   2. variabila `OPERATOR_JSON` insasi (operatorul pe domeniu), acolo unde exista: pe server, si in probe;
 *   3. `config/operator.json`, din care se citeste numai cheia `operator`.
 * Fara prima sursa, pachetul de browser cadea pe fisier si cautarea Ctrl+K nu gasea paginile juridice ale unui
 * domeniu al carui operator vine numai din mediu (antetul `src/lib/operator-mediu.ts`).
 * Modulul din `lib` e mic si nu trage configurarea: `@/lib/operator` ramane interzis aici (proba
 * `tests/juridic.test.ts`).
 */
export const OPERATOR_NUMIT: boolean =
  citesteOperatorNumit(process.env.NEXT_PUBLIC_OPERATOR_NUMIT) ?? operatorNumitInMediu() ?? ((configurare.operator as unknown) !== null);

/**
 * FAMILIA TEXTELOR (felia 73, `./familie.ts`): "see" (operator din SEE, paginile `/juridic` de azi), "md"
 * (operator din Republica Moldova, documentele din `./md/`) sau `null` (niciun operator complet). Aceleasi
 * trei surse, in aceeasi ordine: `NEXT_PUBLIC_FAMILIE_JURIDICA` (calculata in `next.config.ts` din
 * operatorul rezolvat, scrisa LITERAL aici ca Next s-o inlocuiasca si in pachetul de browser), apoi
 * `OPERATOR_JSON`, apoi fisierul. Fara ea, browserul unui domeniu `md` ar arata in paleta paginile SEE.
 */
export const FAMILIE_JURIDICA: FamilieJuridica | null = (() => {
  const calculata = citesteFamilie(process.env.NEXT_PUBLIC_FAMILIE_JURIDICA);
  if (calculata !== undefined) return calculata;
  const dinMediu = familieInMediu();
  return dinMediu !== undefined ? dinMediu : familieDinConfigurare(configurare);
})();

/** Calea indexului juridic. */
export const CALE_JURIDIC = "/juridic";

/** Radacinile adreselor juridice ale familiei `md` (engleza la radacina, romana sub `/ro`). */
export const CALE_JURIDIC_EN = "/legal";
export const CALE_JURIDIC_RO_MD = "/ro/juridic";

/** Documentele grupului, in ordinea barei laterale si a cardurilor (juridic__sablon.md §2). */
export const SLUGURI_JURIDICE = [
  "informatii-legale",
  "confidentialitate",
  "termeni",
  "cookies",
  "politici-publice",
  "licenta-software",
  "subimputerniciti",
] as const;

export type SlugJuridic = (typeof SLUGURI_JURIDICE)[number];

export type IntrareJuridica = {
  slug: SlugJuridic;
  /** Eticheta din bara laterala, titlul cardului si randul din harta de site. */
  scurt: string;
  /** O propozitie despre document, pentru `RUTE` (paleta de cautare, `/llms.txt`). */
  descriere: string;
};

// Familia SEE: nepublicata pe 3s.md si 3s.com.ro, dar descrierile ajung in pachetul de browser al startului (rute.ts),
// deci sunt la "tu" ca restul site-ului (decizia 77); poarta-limba le citeste ca a patra suprafata.
export const DOCUMENTE_JURIDICE: readonly IntrareJuridica[] = [
  {
    slug: "informatii-legale",
    // Rol: documentul care identifica furnizorul serviciului. Numele e cel din coloana Juridic a subsolului.
    scurt: "Mențiuni legale",
    descriere: "Cine furnizează serviciul 3S, cum se ia legătura cu el și unde e găzduită platforma.",
  },
  {
    slug: "confidentialitate",
    scurt: "Politica de confidențialitate",
    descriere: "Ce date personale prelucrează site-ul, în ce scop, pe ce temei, cui le transmite și ce drepturi ai.",
  },
  {
    slug: "termeni",
    scurt: "Termeni și condiții",
    descriere: "Condițiile de folosire a platformei 3S și anexa despre prelucrarea datelor clienților.",
  },
  {
    slug: "cookies",
    scurt: "Cookie-uri",
    descriere: "Ce se stochează în browser, pentru ce, cât timp și cum îți dai sau îți retragi acordul.",
  },
  {
    slug: "politici-publice",
    scurt: "Reguli publice",
    descriere: "Actele normative și standardul pe care se sprijină documentele juridice ale site-ului.",
  },
  {
    slug: "licenta-software",
    scurt: "Licența aplicației",
    descriere: "Ce drepturi primește clientul asupra aplicației 3S și ce nu are voie să facă cu ea.",
  },
  {
    slug: "subimputerniciti",
    scurt: "Subîmputerniciții platformei",
    descriere: "Furnizorii care prelucrează datele clienților pentru platforma 3S, cu scopul și țara fiecăruia.",
  },
];

/** Intrarea indexului in `RUTE`. */
export const INDEX_JURIDIC = {
  scurt: "Documente juridice",
  descriere: "Toate documentele juridice ale platformei 3S, într-un singur loc.",
} as const;

export function caleDocument(slug: SlugJuridic): string {
  return CALE_JURIDIC + "/" + slug;
}

/** Documentul cu slugul dat, sau `undefined` pentru un slug necunoscut. */
export function documentJuridic(slug: string): IntrareJuridica | undefined {
  return DOCUMENTE_JURIDICE.find((d) => d.slug === slug);
}

/**
 * Intrarile paginilor juridice `/juridic` in `RUTE`: toate opt cand grupul SEE e publicat, niciuna altfel.
 * Implicit `OPERATOR_NUMIT` si `FAMILIE_JURIDICA`; decizia completa pentru un operator dat e
 * `juridicPublicat` din `./comutator.ts` (numai pe server). O familie necunoscuta (`null`, de pilda in
 * probe fara operator) se trateaza ca SEE, ca inainte de felia 73. Familia `md` nu are pagini `/juridic`:
 * rutele ei, pe limba, le da `ruteJuridiceMd`.
 */
export function ruteJuridice(publicat: boolean = OPERATOR_NUMIT, familie: FamilieJuridica | null = FAMILIE_JURIDICA): Ruta[] {
  if (!publicat || familie === "md") {
    return [];
  }
  return [
    { cale: CALE_JURIDIC, scurt: INDEX_JURIDIC.scurt, descriere: INDEX_JURIDIC.descriere, inHarta: true },
    ...DOCUMENTE_JURIDICE.map((d) => ({ cale: caleDocument(d.slug), scurt: d.scurt, descriere: d.descriere, inHarta: true })),
  ];
}

// ---------------------------------------------------------------------------------------------
// Familia md: rutele pe limba (felia 73). Le leaga in `RUTE` paginile editiilor (`/legal`, `/ro/juridic`).
// ---------------------------------------------------------------------------------------------

/** Titlul scurt al fiecarui document `md`, pe limba (bara laterala, harta, paleta). */
export const SCURT_MD: Readonly<Record<CheieMd, Record<LimbaJuridica, string>>> = {
  "informatii-legale": { ro: "Informații legale", en: "Legal notice" },
  confidentialitate: { ro: "Politica de confidențialitate", en: "Privacy policy" },
  "cookie-uri": { ro: "Politica de cookie-uri", en: "Cookie policy" },
  termeni: { ro: "Termeni și condiții", en: "Terms and conditions" },
  dpa: { ro: "Acord de prelucrare a datelor (DPA)", en: "Data Processing Agreement (DPA)" },
  subimputerniciti: { ro: "Subîmputerniciții platformei", en: "Sub-processors of the platform" },
  "notificare-si-actiune": { ro: "Notificare și acțiune", en: "Notice and action" },
  "inteligenta-artificiala": { ro: "Inteligența artificială în serviciile 3S", en: "Artificial intelligence in 3S services" },
};

/**
 * O propozitie despre fiecare document `md`, pe limba (`RUTE`, paleta, `/llms.txt`). Romana la "tu" (decizia 77).
 * Descrierea Cookie-urilor e una pentru toate starile masurarii, deci nu pomeneste masurarea vizitelor: pe
 * asezarea fara masurare (S0) ar fi falsa. Aceeasi regula ca meta-descrierea ei (`META_DOCUMENTE_MD`).
 */
export const DESCRIERE_MD: Readonly<Record<CheieMd, Record<LimbaJuridica, string>>> = {
  "informatii-legale": {
    ro: "Cine furnizează serviciul 3S, cum ne contactezi și ce autorități supraveghează serviciul.",
    en: "Who provides the 3S service, how to contact us and which authorities oversee the service.",
  },
  confidentialitate: {
    ro: "Ce date personale prelucrăm, în ce scop, pe ce temei, cui le transmitem și ce drepturi ai.",
    en: "What personal data we process, for what purpose, on what legal basis, who receives it and your rights.",
  },
  "cookie-uri": {
    ro: "Ce informații stochează sau citește site-ul în browserul tău, pe ce temei și cine primește datele.",
    en: "What information the website stores or reads in your browser, on what legal basis and who receives the data.",
  },
  termeni: {
    ro: "Condițiile în care 3S furnizează serviciul clienților profesioniști.",
    en: "The terms on which 3S provides the service to professional clients.",
  },
  dpa: {
    ro: "Cum prelucrează 3S, ca persoană împuternicită, datele personale din documentele clienților.",
    en: "How 3S, as a processor, processes the personal data in its clients' documents.",
  },
  subimputerniciti: {
    ro: "Furnizorii care prelucrează conținutul documentelor clienților, cu rolul și țara fiecăruia.",
    en: "The providers that process the content of client documents, with the role and country of each.",
  },
  "notificare-si-actiune": {
    ro: "Cum ne semnalezi o informație ilicită, cum hotărâm și regulile de utilizare acceptabilă.",
    en: "How to report unlawful information, how we decide and the acceptable use rules.",
  },
  "inteligenta-artificiala": {
    ro: "Cum funcționează asistentul de inteligență artificială al 3S și ce limite are.",
    en: "How the 3S artificial intelligence assistant works and what its limits are.",
  },
};

/** Intrarile documentelor `md` publicate la poarta data, in limba data, in ordinea registrului. */
export function ruteJuridiceMd(limba: LimbaJuridica, poarta?: PoartaPublicare): Ruta[] {
  return cheiPublicate(poarta).map((c) => ({ cale: caleMd(c, limba), scurt: SCURT_MD[c][limba], descriere: DESCRIERE_MD[c][limba], inHarta: true }));
}
