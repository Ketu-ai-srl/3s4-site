// Comutatorul PAGINILOR juridice (planul valului S4, §9-§10): care dintre cele 8 pagini ale
// grupului exista, dupa operatorul de date din `config/operator.json`.
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
import type { Ruta } from "../rute";

/** Exista un operator numit in `config/operator.json`? Numai cheia `operator` se citeste. */
export const OPERATOR_NUMIT: boolean = (configurare.operator as unknown) !== null;

/** Calea indexului juridic. */
export const CALE_JURIDIC = "/juridic";

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
    descriere: "Ce date personale prelucrează site-ul, în ce scop, pe ce temei, cui le transmite și ce drepturi aveți.",
  },
  {
    slug: "termeni",
    scurt: "Termeni și condiții",
    descriere: "Condițiile de folosire a platformei 3S și anexa despre prelucrarea datelor clienților.",
  },
  {
    slug: "cookies",
    scurt: "Cookie-uri",
    descriere: "Ce se stochează în browser, pentru ce, cât timp și cum vă dați sau vă retrageți acordul.",
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
 * Intrarile paginilor juridice in `RUTE`: toate opt cand grupul e publicat, niciuna altfel.
 * Implicit `OPERATOR_NUMIT`; decizia completa pentru un operator dat e `juridicPublicat` din
 * `./comutator.ts` (numai pe server).
 */
export function ruteJuridice(publicat: boolean = OPERATOR_NUMIT): Ruta[] {
  if (!publicat) {
    return [];
  }
  return [
    { cale: CALE_JURIDIC, scurt: INDEX_JURIDIC.scurt, descriere: INDEX_JURIDIC.descriere, inHarta: true },
    ...DOCUMENTE_JURIDICE.map((d) => ({ cale: caleDocument(d.slug), scurt: d.scurt, descriere: d.descriere, inHarta: true })),
  ];
}
