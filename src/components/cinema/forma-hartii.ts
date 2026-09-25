// Forma din hartii a eroului cinema (functionalitati__sablon.md §4.1): ~110 foi care fac un vartej si
// apoi se aseaza pe conturul iconitei paginii. Aici e numai matematica, fara `three` si fara DOM:
// esantionarea conturului, parametrii foilor, poza unei foi la un moment dat. Scena care le deseneaza
// e in `FormaHartii.tsx`, prin gazda comuna `Scena3D` (piesa inghetata a fundatiei).
//
// VALORILE MASURATE (fisa §4.1, [script] + [timp]):
//   - foaia: plan 0,34 x 0,47 unitati; textura 128 x 176 (foaie alba, chenar, 5 randuri gri);
//   - opacitate 0,26 in vartej, 0,15 dupa asezare; o foaie din 8 colorata `albastru-clar-2`;
//   - camera: perspectiva de 34 de grade, la distanta 13; scara grupului 0,82 la latime/inaltime
//     >= 1,6, 0,62 la >= 1, 0,5 sub 1;
//   - vartej 2600 ms pe un inel 3D (raza 2-5,4, viteza 0,1-0,26 rad/s, 15% in sens invers, balans
//     vertical 0,25-0,75 cu viteza 0,4-0,9, rotatie continua);
//   - asezare 1400 ms pe foaie, curba 1 - (1 - t)^3, cu 12 ms intre foi;
//   - mouse: rotatie in jurul axei verticale de cel mult +-0,05 rad (apropierea de 4% e a gazdei).
// NEMASURATE la referinta si alese aici: pozitiile de pornire din vartej (din generatorul cu samanta
// al gazdei, deci aceleasi la fiecare incarcare, cum a masurat criticul), abaterea de pe contur
// (+-0,06 unitati, +-0,3 rad) si coborarea formei sub centru (din cutiile masurate: ~45 px la 1440,
// ~110 px la 390).

import type { FormaIconita, Punct } from "./forme";

export const FOI_FORMA = 110;
export const FOAIE_FORMA = { latime: 0.34, inaltime: 0.47 } as const;
export const TEXTURA_FOAIE = { latime: 128, inaltime: 176 } as const;
export const CAMERA_FORMA = { unghi: 34, distanta: 13 } as const;
export const FAZE_FORMA = { vartej: 2.6, asezare: 1.4, decalaj: 0.012 } as const;
export const OPACITATE_FORMA = { vartej: 0.26, asezat: 0.15 } as const;
/** O foaie din 8 e colorata. */
export const PROPORTIE_COLORATE = 1 / 8;
export const CULOARE_COLORATA = 0x5b8def;
/** Rotatia maxima dupa mouse, in radiani. */
export const ROTATIE_MOUSE = 0.05;

/** Momentul (s, de la pornirea scenei) la care ultima foaie s-a asezat. */
export function finalAsezare(n = FOI_FORMA): number {
  return FAZE_FORMA.vartej + (n - 1) * FAZE_FORMA.decalaj + FAZE_FORMA.asezare;
}

/** Scara grupului dupa raportul latime / inaltime al gazdei. */
export function scaraGrup(raport: number): number {
  if (raport >= 1.6) return 0.82;
  if (raport >= 1) return 0.62;
  return 0.5;
}

/** Cat coboara forma sub centru, in unitati de scena, dupa raportul gazdei. */
export function coborareForma(raport: number): number {
  if (raport >= 1.6) return -0.4;
  if (raport >= 1) return -0.7;
  return -1.0;
}

/** Curba de asezare, 1 - (1 - t)^3. */
export function iesireCubica(t: number): number {
  const u = Math.min(1, Math.max(0, t));
  return 1 - (1 - u) ** 3;
}

/**
 * `n` puncte pe conturul formei, la distante egale de-a lungul tuturor traseelor puse cap la cap
 * (fiecare traseu primeste puncte pe masura lungimii lui). Coordonatele raman pe grila de 24.
 */
export function esantioneaza(forma: FormaIconita, n: number): Punct[] {
  const segmente: Array<{ a: Punct; b: Punct; lungime: number }> = [];
  for (const traseu of forma.trasee) {
    for (let i = 1; i < traseu.length; i++) {
      const a = traseu[i - 1];
      const b = traseu[i];
      const lungime = Math.hypot(b[0] - a[0], b[1] - a[1]);
      if (lungime > 0) segmente.push({ a, b, lungime });
    }
  }
  const total = segmente.reduce((suma, s) => suma + s.lungime, 0);
  if (total === 0 || n <= 0) return [];
  const puncte: Punct[] = [];
  let k = 0;
  let parcurs = 0;
  for (let i = 0; i < n; i++) {
    const tinta = ((i + 0.5) * total) / n;
    while (k < segmente.length - 1 && parcurs + segmente[k].lungime < tinta) {
      parcurs += segmente[k].lungime;
      k++;
    }
    const s = segmente[k];
    const u = Math.min(1, Math.max(0, (tinta - parcurs) / s.lungime));
    puncte.push([s.a[0] + (s.b[0] - s.a[0]) * u, s.a[1] + (s.b[1] - s.a[1]) * u]);
  }
  return puncte;
}

export type Poza = { x: number; y: number; z: number; rx: number; ry: number; rz: number };

/** Locul unei foi pe contur, in unitati de scena (centrul grilei in origine, y in sus). */
export type TintaFoaie = Poza & { colorata: boolean };

/** Parametrii vartejului unei foi. */
export type VartejFoaie = {
  raza: number;
  viteza: number;
  faza: number;
  inaltime: number;
  amplitudine: number;
  vitezaBalans: number;
  fazaBalans: number;
  rotatie: readonly [number, number, number];
  rotire: readonly [number, number, number];
};

/** Tintele foilor: punctele conturului, cu abaterea lor mica, si foile colorate. */
export function tinteFoi(forma: FormaIconita, n: number, aleator: () => number): TintaFoaie[] {
  const puncte = esantioneaza(forma, n);
  const abatere = (m: number) => (aleator() * 2 - 1) * m;
  return puncte.map(([gx, gy]) => ({
    x: (gx - 12) * forma.unitate + abatere(0.06),
    y: -(gy - 12) * forma.unitate + abatere(0.06),
    z: abatere(0.12),
    rx: abatere(0.12),
    ry: abatere(0.12),
    rz: abatere(0.3),
    colorata: aleator() < PROPORTIE_COLORATE,
  }));
}

/** Parametrii vartejului, in intervalele masurate. */
export function vartejFoi(n: number, aleator: () => number): VartejFoaie[] {
  const intre = (a: number, b: number) => a + (b - a) * aleator();
  return Array.from({ length: n }, () => {
    const sens = aleator() < 0.15 ? -1 : 1;
    return {
      raza: intre(2, 5.4),
      viteza: sens * intre(0.1, 0.26),
      faza: intre(0, Math.PI * 2),
      inaltime: intre(-1.6, 1.6),
      amplitudine: intre(0.25, 0.75),
      vitezaBalans: intre(0.4, 0.9),
      fazaBalans: intre(0, Math.PI * 2),
      rotatie: [intre(0, Math.PI * 2), intre(0, Math.PI * 2), intre(0, Math.PI * 2)] as const,
      rotire: [intre(-0.8, 0.8), intre(-0.8, 0.8), intre(-0.6, 0.6)] as const,
    };
  });
}

/** Poza unei foi in vartej la momentul `t` (s). */
export function pozaVartej(v: VartejFoaie, t: number): Poza {
  const unghi = v.faza + v.viteza * t;
  return {
    x: v.raza * Math.cos(unghi),
    y: v.inaltime + v.amplitudine * Math.sin(v.vitezaBalans * t + v.fazaBalans),
    z: v.raza * Math.sin(unghi),
    rx: v.rotatie[0] + v.rotire[0] * t,
    ry: v.rotatie[1] + v.rotire[1] * t,
    rz: v.rotatie[2] + v.rotire[2] * t,
  };
}

/** Unghiul `de` adus langa `spre` (aceeasi directie, diferenta sub o jumatate de tura). */
export function unghiApropiat(de: number, spre: number): number {
  const tura = Math.PI * 2;
  return spre + ((((de - spre) % tura) + tura * 1.5) % tura) - tura / 2;
}

/** Poza foii `i` la momentul `t` (s): vartej, zbor spre contur, apoi asezata. */
export function pozaFoaie(i: number, t: number, v: VartejFoaie, tinta: Poza): Poza {
  const start = FAZE_FORMA.vartej + i * FAZE_FORMA.decalaj;
  if (t <= start) return pozaVartej(v, t);
  const e = iesireCubica((t - start) / FAZE_FORMA.asezare);
  if (e >= 1) return { x: tinta.x, y: tinta.y, z: tinta.z, rx: tinta.rx, ry: tinta.ry, rz: tinta.rz };
  const de = pozaVartej(v, start);
  const m = (a: number, b: number) => a + (b - a) * e;
  return {
    x: m(de.x, tinta.x),
    y: m(de.y, tinta.y),
    z: m(de.z, tinta.z),
    rx: m(unghiApropiat(de.rx, tinta.rx), tinta.rx),
    ry: m(unghiApropiat(de.ry, tinta.ry), tinta.ry),
    rz: m(unghiApropiat(de.rz, tinta.rz), tinta.rz),
  };
}

/** Opacitatea foilor: 0,26 in vartej, apoi scade liniar la 0,15 pana se aseaza ultima foaie. */
export function opacitateFoi(t: number, n = FOI_FORMA): number {
  const { vartej, asezat } = OPACITATE_FORMA;
  if (t <= FAZE_FORMA.vartej) return vartej;
  const final = finalAsezare(n);
  if (t >= final) return asezat;
  return vartej + (asezat - vartej) * ((t - FAZE_FORMA.vartej) / (final - FAZE_FORMA.vartej));
}
