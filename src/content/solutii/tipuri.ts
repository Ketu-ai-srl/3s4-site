// Tipurile continutului paginilor de solutii (felia `solutii`, valul S4-3): hubul si cele 7 sectoare
// pe acelasi sablon (fisa `solutii__sablon.md` din depozitul fabricii). Doar tipuri si functii pure;
// nicio componenta.
//
// LUNGIMILE din comentariile modulelor de sector sunt ale referintei, pe acelasi rol (fisele de
// sector, masurate la 1440). Textul e scris pentru 3S, din faptele marcii; nicio fraza nu e luata
// de la referinta. Afirmatiile verificabile au intrare in `src/content/afirmatii/solutii.json`.
//
// DATELE DIN MACHETE SUNT FICTIVE si se declara ca exemplu (plan D9): numele de fisiere, cautarile,
// scorurile de potrivire, firmele si codurile fiscale din consola. Codurile fiscale sunt INVALIDE prin
// constructie (cifra de control gresita), ca sa nu poata apartine unei firme reale.

import type { Legatura } from "@/content/navigatie";

/** Cele 7 formatii ale scenei hartiilor, cate una pe sector (solutii__sablon.md S3 si fisele). */
export type Formatie = "piramida" | "raft" | "turnuri" | "bibliorafturi" | "drum" | "perete" | "cercuri";

/** Un moment de pe sina (S2): eticheta de timp, titlul, textul si cipul documentului. */
export type Moment = {
  eticheta: string;
  titlu: string;
  text: string;
  /** Numele fisierului din cip; acelasi nume sta pe documentul-erou din scena 3D. */
  fisier: string;
  /** Starea problemei, dupa linia verticala a cipului (rosu). */
  problema: string;
};

export type Pas = { titlu: string; text: string };

/**
 * Rezultatul unei cautari din macheta. `fragment` poarta exact doi termeni evidentiati, scrisi
 * intre `[[` si `]]`; `segmenteFragment` il desface pentru componenta.
 */
export type RezultatCautare = {
  fisier: string;
  loc: string;
  /** Pastila de potrivire, forma „NN% potrivire · N,N s” (valori de exemplu). */
  potrivire: string;
  fragment: string;
};

export type ExempluCautare = {
  interogare: string;
  rezultat: RezultatCautare;
  /**
   * Eticheta mica VIZIBILA din coltul cardului (decizia D11): pe machetele care arata nume de firme
   * sau de persoane. Cititoarele de ecran au deja declaratia „Exemplu: ...” de sub macheta.
   */
  insigna?: string;
};

export type Intrebare = { intrebare: string; raspuns: string };

/** O tigla de indicator din consola (contabilitate): ton neutru (gri) sau de actiune (albastru). */
export type TiglaConsola = {
  valoare: string;
  eticheta: string;
  iconita: string;
  ton: "neutru" | "actiune";
};

export type ClientConsola = {
  nume: string;
  /** Cod fiscal FICTIV si INVALID (cifra de control gresita), fara prefixul RO. */
  cui: string;
  /** Punctul albastru: clientul are ceva de facut. Gri: e la zi. */
  deFacut: boolean;
  asteptare: number;
  depasite: number;
  noi: number;
};

export type Capabilitate = { iconita: string; titlu: string; text: string };

/** Eticheta unui indicator, la singular (pentru 1) si la plural (pentru 0 si 2 sau mai mult). */
export type FormeNumar = { unul: string; multe: string };

/** Forma etichetei care se acorda cu `n`: „1 depasit”, dar „0 depasite” si „3 depasite”. */
export function formaNumar(n: number, forme: FormeNumar): string {
  return n === 1 ? forme.unul : forme.multe;
}

/** Sectiunea in plus a paginii de contabilitate (S3b): consola cu toti clientii. */
export type Consola = {
  titlu: string;
  subtitlu: string;
  /** Eticheta accesibila a machetei: declara datele fictive. */
  declaratie: string;
  bara: { eticheta: string; pastila: string };
  tigle: [TiglaConsola, TiglaConsola, TiglaConsola, TiglaConsola];
  cautare: { indemn: string; contor: string };
  indicatori: { asteptare: FormeNumar; depasite: FormeNumar; noi: FormeNumar };
  clienti: ClientConsola[];
  maiMulti: string;
  capabilitati: Capabilitate[];
  nota: string;
  legatura: Legatura;
};

export type Sector = {
  cale: string;
  /** Numele sectorului: ultimul nivel din firul de pagina si din datele structurate. */
  nume: string;
  meta: { titlu: string; descriere: string };
  erou: { titlu: string; subtitlu: string };
  momente: { subtitlu: string; lista: [Moment, Moment, Moment] };
  schimbare: {
    punte: string;
    buline: [string, string, string];
    formatie: Formatie;
    /** Samanta generatorului: aceeasi coregrafie la fiecare vizita, alta pe fiecare sector. */
    samanta: number;
    /** Eticheta accesibila a scenei 3D: ce se vede cand foile se aseaza. */
    etichetaScena: string;
  };
  pasi: { lista: [Pas, Pas, Pas]; demo: ExempluCautare };
  inainteDupa: { inainte: [string, string, string]; dupa: [string, string, string] };
  /** Cele doua intrebari proprii sectorului; celelalte doua sunt comune (`comun.ts`). */
  intrebari: [Intrebare, Intrebare];
  consola?: Consola;
};

export type SegmentFragment = { text: string; evidentiat: boolean };

/** Desface fragmentul in bucati de text simplu si termeni evidentiati (`[[...]]`). */
export function segmenteFragment(fragment: string): SegmentFragment[] {
  const segmente: SegmentFragment[] = [];
  const tipar = /\[\[([^\]]+)\]\]/g;
  let ultim = 0;
  for (const m of fragment.matchAll(tipar)) {
    const inceput = m.index ?? 0;
    if (inceput > ultim) segmente.push({ text: fragment.slice(ultim, inceput), evidentiat: false });
    segmente.push({ text: m[1], evidentiat: true });
    ultim = inceput + m[0].length;
  }
  if (ultim < fragment.length) segmente.push({ text: fragment.slice(ultim), evidentiat: false });
  return segmente;
}

/** Fragmentul ca text simplu, fara marcaje (pentru cititoarele de ecran si datele structurate). */
export function textFragment(fragment: string): string {
  return segmenteFragment(fragment)
    .map((s) => s.text)
    .join("");
}
