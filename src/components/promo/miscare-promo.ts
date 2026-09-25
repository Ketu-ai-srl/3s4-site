// Logica pura a miscarii de pe paginile promo (promo.md, "Miscarea legata de derulare"), fara DOM, ca sa
// poata fi probata cu cifre (`tests/promo.test.ts`).
//
// Pentru o sectiune de dupa primul ecran, cu `top` = varful ei fata de fereastra si `vh` = inaltimea
// ferestrei:
//   intrare  e = (0,9 vh - top) / 0,8 vh, taiat la [0, 1]:
//            opacitate clamp((e - 1/6) x 1,2), scara 0,88 + 0,12 e, translateY(50 (1 - e) px);
//   iesire   x = e - 1 (distanta de dupa varf, in unitati de 0,8 vh):
//            opacitatea scade simetric (aceeasi formula pe 1 - x), scara 1 - 0,08 min(x, 1),
//            translateY(-25 min(x, 1) px), blur((x - 0,3) x 10 px), fara limita;
//   copiii   (pana la 4) opacitate clamp((e' - 1/6 - k/12) x 1,8) si translateY(12 (1 - op) px), unde
//            e' e e la intrare si 1 - x la iesire (cascada simetrica).
// Primul ecran: opacitate 1 - y / 0,5 vh, scara 1 - 0,15 min(y / 0,5 vh, 1), cu y derularea.
//
// Varful (e = 1) e cand sectiunea incepe la 10% din fereastra. La referinta ultima sectiune nu ajungea
// acolo (derularea maxima se oprea la e = 0,875); la 3S ultima sectiune are 90svh, cu spatiul in plus jos,
// deci ajunge singura la varf, cu sau fara subsol (proba `tests/browser/promo.spec.ts`).

/** Taie o valoare la [min, max]. */
export function taie(v: number, min = 0, max = 1): number {
  if (Number.isNaN(v)) return min;
  return Math.min(max, Math.max(min, v));
}

/**
 * Faza bruta a unei sectiuni: (0,9 vh - top) / 0,8 vh, taiata jos la 0 si sus la `MAX_FAZA`.
 * Sub 1 e intrarea (e), peste 1 e iesirea (1 + x).
 */
export function fazaSectiune(top: number, vh: number): number {
  if (!(vh > 0)) return 1;
  return taie((0.9 * vh - top) / (0.8 * vh), 0, MAX_FAZA);
}

/** Dincolo de faza 4 sectiunea e de mult in afara ferestrei (x = 3). */
export const MAX_FAZA = 4;

export type StareSectiune = {
  opacitate: number;
  scara: number;
  /** Deplasarea verticala a interiorului, in px. */
  y: number;
  /** Estomparea, in px. */
  blur: number;
  /** Faza efectiva pentru cascada copiilor: e la intrare, 1 - x la iesire. */
  cascada: number;
};

export const STARE_STATICA: StareSectiune = { opacitate: 1, scara: 1, y: 0, blur: 0, cascada: 1 };

/** Starea interiorului unei sectiuni pentru o faza bruta (0..4). */
export function stareSectiune(faza: number): StareSectiune {
  if (faza <= 1) {
    const e = taie(faza);
    return {
      opacitate: taie((e - 1 / 6) * 1.2),
      scara: 0.88 + 0.12 * e,
      y: 50 * (1 - e),
      blur: 0,
      cascada: e,
    };
  }
  const x = faza - 1;
  const simetric = taie(1 - x);
  const m = Math.min(x, 1);
  return {
    opacitate: taie((simetric - 1 / 6) * 1.2),
    scara: 1 - 0.08 * m,
    y: -25 * m,
    blur: Math.max(0, (x - 0.3) * 10),
    cascada: simetric,
  };
}

/** Opacitatea copilului `k` (0..3) din cascada, pentru faza efectiva `cascada`. */
export function opacitateCopil(cascada: number, k: number): number {
  const i = Math.min(3, Math.max(0, k));
  return taie((cascada - 1 / 6 - i / 12) * 1.8);
}

/** Starea primului ecran pentru o derulare `y` (px) si inaltimea ferestrei `vh`. */
export function stareErou(y: number, vh: number): { opacitate: number; scara: number } {
  if (!(vh > 0)) return { opacitate: 1, scara: 1 };
  const r = Math.max(0, y) / (0.5 * vh);
  return { opacitate: taie(1 - r), scara: 1 - 0.15 * Math.min(r, 1) };
}

// ---------------------------------------------------------------------------------------------
// Timpii pieselor animate (promo.md si promo__scanare-cu-telefonul.md, "Interactiuni")
// ---------------------------------------------------------------------------------------------

/** Tastarea din cardul de cautare: ~37 ms pe caracter. */
export const PAS_TASTARE_MS = 37;
/** Numaratoarea contorului: ~1,8 s, curba easeOutCubic (potrivita pe 318 / 418 / 472 / 495 / 500). */
export const DURATA_NUMARATOARE_MS = 1800;

/** easeOutCubic: 1 - (1 - t)^3. */
export function easeOutCubic(t: number): number {
  const u = 1 - taie(t);
  return 1 - u * u * u;
}

/** Valoarea contorului la `ms` de la pornire, rotunjita in jos. */
export function valoareContor(ms: number, final: number, durata = DURATA_NUMARATOARE_MS): number {
  if (ms <= 0) return 0;
  return Math.floor(easeOutCubic(ms / durata) * final + 1e-9);
}

/** Caractere tastate la `ms` de la pornire. */
export function caractereTastate(ms: number, lungime: number, pas = PAS_TASTARE_MS): number {
  if (ms < 0) return 0;
  return Math.min(lungime, Math.floor(ms / pas) + 1);
}

/**
 * Intarzierile randurilor de date de sub scanare, in secunde: cele 6 randuri simple, apoi randul QR si
 * randul fisierului (fisa: 0,69 / 0,83 / 0,97 / 1,11 / 1,25 / 1,39, apoi 1,5 si 1,8).
 */
export const INTARZIERI_RANDURI_S = [0.69, 0.83, 0.97, 1.11, 1.25, 1.39, 1.5, 1.8] as const;
