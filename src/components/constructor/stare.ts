// Starea chestionarului constructorului (acasa-constructor.md §9, §10). Sta deasupra lumii, in
// `Constructor`, fiindca raspunsurile si starea expandorului (deschis / inchis) raman la
// schimbarea industriei (masurat pe referinta). Functii pure, probate in `tests/constructor.test.ts`.
//
// Modulul e in pachetul paginii (il importa `Constructor`), deci nu importa nimic din
// `acasa-constructor.ts`: precompletarile vin din modulul lor mic, fara textele scenelor.

import type { CodCanal, CodCine, CodIndustrie, CodVolum } from "@/content/acasa";
import { PRECOMPLETARI } from "@/content/acasa-constructor-precompletari";

export type Raspunsuri = {
  canale: CodCanal[];
  volum: CodVolum | null;
  cine: CodCine | null;
  /** Raspunsurile vin din precompletarea industriei curente (§10.4), atinse sau nu dupa aceea. */
  precompletat: boolean;
  /** Vizitatorul a atins macar un raspuns: de acum precompletarea nu le mai suprascrie. */
  atinse: boolean;
  /** Pasii dezvaluiti: 1 = doar canalele, 2 = + volumul, 3 = + "cine", 4 = + confirmarea. */
  dezvaluit: 1 | 2 | 3 | 4;
  confirmat: boolean;
  deschis: boolean;
  /** Prima simulare s-a terminat, deci estimarea e dezvaluita (§12). */
  estimareDezvaluita: boolean;
  /** Creste la confirmare si la orice schimbare de dupa ea: reia simularea si panoul. */
  rulare: number;
};

export const RASPUNSURI_GOALE: Raspunsuri = {
  canale: [],
  volum: null,
  cine: null,
  precompletat: false,
  atinse: false,
  dezvaluit: 1,
  confirmat: false,
  deschis: false,
  estimareDezvaluita: false,
  rulare: 0,
};

export function toateRaspunsurile(r: Raspunsuri): boolean {
  return r.canale.length > 0 && r.volum !== null && r.cine !== null;
}

/**
 * Raspunsurile la alegerea unei industrii. Ce a dat vizitatorul ramane; altfel se pun raspunsurile
 * precompletate ale industriei noi (sau nimic), cu Q1 singura vizibila. Starea expandorului ramane.
 */
export function raspunsuriLaAlegere(cod: CodIndustrie, anterioare: Raspunsuri): Raspunsuri {
  if (anterioare.atinse || anterioare.confirmat) {
    return { ...anterioare, precompletat: false };
  }
  const p = PRECOMPLETARI[cod];
  if (!p) {
    return { ...RASPUNSURI_GOALE, deschis: anterioare.deschis, rulare: anterioare.rulare };
  }
  return {
    ...RASPUNSURI_GOALE,
    canale: [...p.canale],
    volum: p.volum,
    cine: p.cine,
    precompletat: true,
    deschis: anterioare.deschis,
    rulare: anterioare.rulare,
  };
}

/** Banda canalelor e pe ecran la raspunsurile precompletate si dupa confirmare (§6.3). */
export function bandaCanalelorActiva(r: Raspunsuri): boolean {
  return r.canale.length > 0 && (r.precompletat || r.confirmat);
}

type Schimbare =
  | { fel: "canal"; canal: CodCanal }
  | { fel: "volum"; volum: CodVolum }
  | { fel: "cine"; cine: CodCine };

/**
 * O interactiune a vizitatorului cu o intrebare. Reguli (§10.2-§10.4): ultimul canal nu se poate
 * deselecta; primul canal dezvaluie volumul, volumul dezvaluie "cine", "cine" dezvaluie
 * confirmarea; la raspunsurile precompletate, prima atingere dezvaluie tot deodata. Dupa
 * confirmare, orice schimbare reia simularea si panoul.
 */
export function schimba(r: Raspunsuri, s: Schimbare): Raspunsuri {
  let { canale, volum, cine } = r;
  if (s.fel === "canal") {
    if (canale.includes(s.canal)) {
      if (canale.length === 1) return r;
      canale = canale.filter((c) => c !== s.canal);
    } else {
      canale = [...canale, s.canal];
    }
  } else if (s.fel === "volum") {
    if (volum === s.volum) return r;
    volum = s.volum;
  } else {
    if (cine === s.cine) return r;
    cine = s.cine;
  }
  const urmator: Raspunsuri = { ...r, canale, volum, cine, atinse: true };
  const pas = s.fel === "canal" ? 2 : s.fel === "volum" ? 3 : 4;
  const dezvaluitDeRegula = Math.max(r.dezvaluit, pas) as Raspunsuri["dezvaluit"];
  urmator.dezvaluit = toateRaspunsurile(urmator) && r.precompletat && !r.atinse ? 4 : dezvaluitDeRegula;
  if (urmator.dezvaluit === 4 && !toateRaspunsurile(urmator)) urmator.dezvaluit = 3;
  if (r.confirmat) urmator.rulare = r.rulare + 1;
  return urmator;
}

/** Confirmarea: numai cu toate raspunsurile. Dezvaluie simularea si reia panoul. */
export function confirma(r: Raspunsuri): Raspunsuri {
  if (!toateRaspunsurile(r) || r.confirmat) return r;
  return { ...r, confirmat: true, atinse: true, dezvaluit: 4, rulare: r.rulare + 1 };
}
