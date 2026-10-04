// Toate cifrele figurii din erou stau aici, in functii fara efecte: `tests/erou.test.ts` le verifica
// direct, iar `Erou.tsx` (desenul randat pe server) si `ScenaErou.tsx` (pulsurile centrului) le
// importa. O schimbare de geometrie se face deci intr-un singur loc.
//
// Ce arata figura (decizia 61): un document intra pe inelul din stanga, "preluarea" (scanare, text
// OCR, incarcare), trece prin sigla din mijloc si iese pe inelul din dreapta, "arhiva" (clasificare
// AI, cautare, chat AI). Pe fiecare inel se roteste o cometa, cu perioada de 14 s; cand cometa ajunge
// la un nod, nodul pulseaza, iar sigla pulseaza o data pentru fiecare cometa.
//
// Rotirea o face CSS-ul (`Erou.module.css`), pe `stroke-dashoffset`; cercurile au `pathLength="1"`,
// asa ca lungimile de mai jos sunt fractiuni de tur, oricare ar fi raza. Codul de aici calculeaza
// numai momentele de pornire ale pulsurilor.
//
// Conventii: unitatile sunt cele ale viewBox-ului (640 x 420); unghiul 0 e la dreapta centrului si
// creste spre jos (orar), la fel ca punctul de start al unui <circle>. Asa, unghiul / 360 da direct
// fractiunea de tur parcursa de la start.

export type Punct = { x: number; y: number };

/** Scena SVG, in unitati. */
export const LATIME_SCENA = 640;
export const INALTIME_SCENA = 420;

/** Raza celor doua inele si linia mijloacelor lor. */
export const RAZA_INEL = 121;
export const Y_INELE = 210;

/** Al doilea cerc, mai mic si mutat cu cativa pasi: impreuna cu primul da pistei grosime de banda. */
export const INEL_INTERIOR = { dx: 4, dy: -5, raza: RAZA_INEL - 10 } as const;

/** Durata unui tur, in secunde; aceeasi valoare (14s) e scrisa in Erou.module.css la `tur-figura` si `puls-inel`. */
export const TUR_S = 14;

/** Urma: 22% din tur. Capul: o liniuta de 1%, care o conduce cu 0,5% din tur. */
export const PARTE_URMA = 0.22;
export const PARTE_CAP = 0.01;
export const AVANS_CAP = 0.005;

export type NumeInel = "preluare" | "arhiva";
export type SensInel = "normal" | "reverse";

/**
 * Pentru fiecare inel: abscisa centrului, sensul rotirii si decalajul de start (secunde). Sensurile sunt
 * alese dupa ordinea din `ORDINE_NODURI` (tests/erou.test.ts o verifica); decalajul arhivei impiedica
 * cele doua comete sa se miste simetric.
 */
export const INELE: Record<NumeInel, { cx: number; sens: SensInel; pornire: number }> = {
  preluare: { cx: 194, sens: "reverse", pornire: 0 },
  arhiva: { cx: 446, sens: "normal", pornire: -4.7 },
};

export const ORDINE_INELE: readonly NumeInel[] = ["preluare", "arhiva"];

export type PozitieNod = "sus-stanga" | "capat-stanga" | "jos-stanga" | "sus-dreapta" | "capat-dreapta" | "jos-dreapta";

/** Cele sase noduri: inelul si unghiul fiecaruia. */
export const NODURI: Record<PozitieNod, { inel: NumeInel; unghi: number }> = {
  "sus-stanga": { inel: "preluare", unghi: 270 },
  "capat-stanga": { inel: "preluare", unghi: 180 },
  "jos-stanga": { inel: "preluare", unghi: 90 },
  "sus-dreapta": { inel: "arhiva", unghi: 270 },
  "capat-dreapta": { inel: "arhiva", unghi: 0 },
  "jos-dreapta": { inel: "arhiva", unghi: 90 },
};

/** Ordinea drumului, de la intrare la raspuns. */
export const ORDINE_NODURI: readonly PozitieNod[] = ["sus-stanga", "capat-stanga", "jos-stanga", "sus-dreapta", "capat-dreapta", "jos-dreapta"];

const radiani = (grade: number) => (grade * Math.PI) / 180;

/** Punctul de pe inel aflat la unghiul dat. */
export function punctPeInel(inel: NumeInel, unghi: number): Punct {
  return {
    x: INELE[inel].cx + RAZA_INEL * Math.cos(radiani(unghi)),
    y: Y_INELE + RAZA_INEL * Math.sin(radiani(unghi)),
  };
}

/** Punctul nodului, pe inelul lui. */
export function punctNod(pozitie: PozitieNod): Punct {
  const n = NODURI[pozitie];
  return punctPeInel(n.inel, n.unghi);
}

/** Pozitia unui punct al scenei, in procente din latimea si inaltimea ei (suprapunerile HTML). */
export function procente(p: Punct): { left: string; top: string } {
  return {
    left: ((p.x / LATIME_SCENA) * 100).toFixed(2) + "%",
    top: ((p.y / INALTIME_SCENA) * 100).toFixed(2) + "%",
  };
}

/**
 * Cu cate secunde e decalata animatia capului fata de cea a urmei. Liniuta urmei incepe la offset 0 si
 * se intinde PARTE_URMA din tur; capul trebuie sa stea la marginea ei din fata, iar marginea din fata
 * e la offset 0 cand rotirea e inversa si la PARTE_URMA cand e normala. Proba din tests/erou.test.ts
 * fixeaza ambele ramuri.
 */
export function fazaCap(sens: SensInel): number {
  return sens === "reverse" ? -AVANS_CAP * TUR_S : -(PARTE_URMA - AVANS_CAP) * TUR_S;
}

/** Intarzierea animatiei unei urme (`cap`: liniuta scurta; altfel urma lunga). */
export function intarziereUrma(inel: NumeInel, cap: boolean): number {
  const i = INELE[inel];
  return cap ? i.pornire + fazaCap(i.sens) : i.pornire;
}

/** Secunda (fata de start) la care capul cometei de pe inel trece prin unghiul dat. */
export function sosireCap(inel: NumeInel, unghi: number): number {
  const i = INELE[inel];
  const parte = unghi / 360;
  const parcurs = i.sens === "reverse" ? 1 - parte : parte;
  return i.pornire + fazaCap(i.sens) + TUR_S * parcurs;
}

/** Pornirea pulsului unui nod = secunda la care cometa inelului lui ajunge in dreptul nodului. */
export function intarziereNod(pozitie: PozitieNod): number {
  const n = NODURI[pozitie];
  return sosireCap(n.inel, n.unghi);
}

/**
 * Pulsurile siglei: sigla sta intre inele, deci o cometa ii trece prin dreptul cand e in punctul cel
 * mai apropiat de mijlocul scenei (unghiul 0 pe preluare, 180 pe arhiva). Doua comete, doua pulsuri.
 */
export const INTARZIERI_CENTRU: readonly number[] = [sosireCap("preluare", 0), sosireCap("arhiva", 180)];

/** Secundele, scrise cum le cere `animation-delay` (doua zecimale, fara zerouri de prisos). */
export function secunde(s: number): string {
  return Number(s.toFixed(2)) + "s";
}
