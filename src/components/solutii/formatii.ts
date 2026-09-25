// Cele 7 formatii ale scenei hartiilor (solutii__sablon.md S3 si fisele de sector): unde ajunge
// fiecare foaie cand scena trece din „haos” in „ordine”. Functii pure, fara `three`, ca sa poata fi
// probate in Node (`tests/solutii.test.ts`) si ca modulul sa nu traga biblioteca 3D in pachet.
//
// UNITATILE sunt ale scenei: camera la (0; 2,6; 11,5) priveste spre (0; 2; 0), iar o foaie obisnuita
// are 0,72 x 1, un document-erou 1,15 x 1,58. Rotatiile sunt unghiuri Euler in radiani, ordinea XYZ
// (implicita in three.js). Valorile sunt parametrii din fise (pozitii, pasi, unghiuri); codul e scris
// aici. Unde fisa spune „cu mici abateri”, abaterea vine din generatorul cu samanta al scenei, deci e
// aceeasi la fiecare vizita.
//
// Un singur adaos fata de fise: foile care stau in ACELASI plan si se suprapun (piramida, turnurile)
// primesc o diferenta de adancime de 0,004 pe rand. Fara ea, doua fete coplanare se bat pentru
// acelasi pixel (z-fighting) si clipesc; diferenta nu se vede pe ecran.

import type { Formatie } from "@/content/solutii/tipuri";

export type Pozitie = { x: number; y: number; z: number };
export type Rotatie = { x: number; y: number; z: number };
export type Tinta = { pozitie: Pozitie; rotatie: Rotatie };

export type TinteFormatie = {
  /** Foile obisnuite (0,72 x 1), in ordinea in care pleaca spre formatie. */
  foi: Tinta[];
  /** Cele 3 documente-erou (1,15 x 1,58), in ordinea momentelor. */
  eroi: [Tinta, Tinta, Tinta];
};

/** Foaia obisnuita si documentul-erou, in unitati de scena. */
export const FOAIE = { latime: 0.72, inaltime: 1 } as const;
export const EROU = { latime: 1.15, inaltime: 1.58 } as const;

/** Asamblarea: fiecare foaie zboara 1400 ms, esalonat cu 14 ms pe foaie (fisa S3). */
export const ASAMBLARE = { durata: 1400, esalonare: 14 } as const;

/** Durata totala a asamblarii, in ms: 1400 + 14 x numarul de foi (eroii inclusi). */
export function durataAsamblare(totalFoi: number): number {
  return ASAMBLARE.durata + ASAMBLARE.esalonare * totalFoi;
}

const DREPT: Rotatie = { x: 0, y: 0, z: 0 };
const EPS_RAND = 0.004;

function t(x: number, y: number, z: number, rot: Rotatie = DREPT): Tinta {
  return { pozitie: { x, y, z }, rotatie: { ...rot } };
}

/** Constructii: piramida in trepte, 9 randuri (9, 9, 8, 8, 7, 6, 5, 4, 3 = 59), pas 0,78 x 0,5. */
function piramida(): TinteFormatie {
  const randuri = [9, 9, 8, 8, 7, 6, 5, 4, 3];
  const foi: Tinta[] = [];
  randuri.forEach((n, r) => {
    for (let j = 0; j < n; j++) {
      foi.push(t((j - (n - 1) / 2) * 0.78, 0.5 + 0.5 * r, -0.4 - EPS_RAND * r));
    }
  });
  return { foi, eroi: [t(-1.5, 0.85, 0.55), t(0, 0.85, 0.55), t(1.5, 0.85, 0.55)] };
}

/** Contabilitate: raftul inclinat, 7 randuri x 9 (63), pas 0,85, aplecate -0,42 rad. */
function raft(): TinteFormatie {
  const foi: Tinta[] = [];
  for (let r = 0; r < 7; r++) {
    for (let j = 0; j < 9; j++) {
      foi.push(t((j - 4) * 0.85, 3.6 - 0.52 * r, -1.8 + 0.42 * r, { x: -0.42, y: 0, z: 0 }));
    }
  }
  const aplecat: Rotatie = { x: -0.2, y: 0, z: 0 };
  return { foi, eroi: [t(-1.6, 1.1, 1.5, aplecat), t(0, 1.1, 1.5, aplecat), t(1.6, 1.1, 1.5, aplecat)] };
}

/** Imobiliare: trei turnuri la -2,6 / 0 / 2,6, cate 2 coloane de 8 / 9 / 6 foi (46). */
function turnuri(): TinteFormatie {
  const turn = [
    { x: -2.6, foi: 8 },
    { x: 0, foi: 9 },
    { x: 2.6, foi: 6 },
  ];
  const foi: Tinta[] = [];
  for (const { x, foi: n } of turn) {
    for (const dx of [-0.4, 0.4]) {
      for (let k = 0; k < n; k++) foi.push(t(x + dx, 0.5 + 0.5 * k, -0.4 - EPS_RAND * k));
    }
  }
  return { foi, eroi: [t(-2.6, 0.85, 1.3), t(0, 0.85, 1.3), t(2.6, 0.85, 1.3)] };
}

/**
 * Avocatura: trei bibliorafturi la -2,7 / 0 / 2,7, rotite 0,55 rad; in fiecare, 2 straturi (y 0,85
 * si 2,05) de cate 13 foi stivuite in adancime la 0,09, cu mici abateri (78). Eroii in fata grupului.
 */
function bibliorafturi(aleator: () => number): TinteFormatie {
  const unghi = 0.55;
  const cos = Math.cos(unghi);
  const sin = Math.sin(unghi);
  // Un punct local (lx, lz) al grupului, rotit cu `unghi` in jurul verticalei (ca in three.js).
  const roteste = (gx: number, lx: number, lz: number) => ({ x: gx + lx * cos + lz * sin, z: -lx * sin + lz * cos });
  const foi: Tinta[] = [];
  const eroi: Tinta[] = [];
  for (const gx of [-2.7, 0, 2.7]) {
    for (const y of [0.85, 2.05]) {
      for (let k = 0; k < 13; k++) {
        const abatereX = (aleator() - 0.5) * 0.1;
        const abatereY = (aleator() - 0.5) * 0.04;
        const p = roteste(gx, abatereX, -0.54 + 0.09 * k);
        foi.push(t(p.x, y + abatereY, p.z, { x: (aleator() - 0.5) * 0.06, y: unghi + (aleator() - 0.5) * 0.16, z: (aleator() - 0.5) * 0.06 }));
      }
    }
    const pe = roteste(gx, 0, 0.72);
    eroi.push(t(pe.x, 1.05, pe.z, { x: -0.06, y: unghi, z: 0 }));
  }
  return { foi, eroi: [eroi[0], eroi[1], eroi[2]] };
}

/** Logistica: drumul serpuit, 60 de foi pe o sinusoida de la -4,1 la 4,1 (amplitudine 1,5, 0,9 perioade). */
function drum(): TinteFormatie {
  const n = 60;
  const perioade = 0.9;
  const amplitudine = 1.5;
  const foi: Tinta[] = [];
  for (let i = 0; i < n; i++) {
    const u = i / (n - 1);
    const x = -4.1 + 8.2 * u;
    const faza = 2 * Math.PI * perioade * u;
    const z = amplitudine * Math.sin(faza);
    // Tangenta la drum: dx / du = 8,2; dz / du = A * 2 pi f * cos. Foaia sta in lungul drumului.
    const dx = 8.2;
    const dz = amplitudine * 2 * Math.PI * perioade * Math.cos(faza);
    foi.push(t(x, 0.55, z, { x: 0, y: -Math.atan2(dz, dx), z: 0 }));
  }
  return { foi, eroi: [t(-3.4, 1.9, 1), t(0, 2.1, 0.2), t(3.4, 1.9, 1)] };
}

/** Notariate: peretele de registre, 4 randuri x 15 (60), pas 0,42, rotite 0,32 rad. */
function perete(): TinteFormatie {
  const foi: Tinta[] = [];
  for (let r = 0; r < 4; r++) {
    for (let j = 0; j < 15; j++) foi.push(t((j - 7) * 0.42, 0.55 + 1.02 * r, -0.6, { x: 0, y: 0.32, z: 0 }));
  }
  return { foi, eroi: [t(-1.6, 1.15, 1.5), t(0, 1.15, 1.5), t(1.6, 1.15, 1.5)] };
}

/**
 * Asigurari: cercuri concentrice. In centru un evantai de 12 foi (pas 0,09, rotite progresiv pana la
 * +-0,55 rad, abateri in adancime -0,08 ... +0,06), in jur doua inele de 20 si 26 de foi (raze 2,3 si
 * 3,4, turtite la 0,72 in adancime), fiecare foaie tangenta la cerc. Eroii ridicati deasupra.
 */
function cercuri(aleator: () => number): TinteFormatie {
  const foi: Tinta[] = [];
  for (let k = 0; k < 12; k++) {
    const f = k / 11;
    foi.push(t((k - 5.5) * 0.09, 0.55, -0.08 + 0.14 * aleator(), { x: 0, y: -0.55 + 1.1 * f, z: 0 }));
  }
  for (const [n, raza] of [
    [20, 2.3],
    [26, 3.4],
  ] as const) {
    for (let k = 0; k < n; k++) {
      const a = (2 * Math.PI * k) / n;
      const x = raza * Math.cos(a);
      const z = raza * Math.sin(a) * 0.72;
      const dx = -raza * Math.sin(a);
      const dz = raza * Math.cos(a) * 0.72;
      foi.push(t(x, 0.55, z, { x: 0, y: -Math.atan2(dz, dx), z: 0 }));
    }
  }
  return { foi, eroi: [t(-1.5, 2, 0.6), t(0, 2.2, 0.6), t(1.5, 2, 0.6)] };
}

/** Tintele formatiei unui sector. `aleator` e generatorul cu samanta al scenei. */
export function tinteFormatie(formatie: Formatie, aleator: () => number): TinteFormatie {
  switch (formatie) {
    case "piramida":
      return piramida();
    case "raft":
      return raft();
    case "turnuri":
      return turnuri();
    case "bibliorafturi":
      return bibliorafturi(aleator);
    case "drum":
      return drum();
    case "perete":
      return perete();
    case "cercuri":
      return cercuri(aleator);
  }
}

/** Numarul de foi obisnuite al fiecarei formatii, cum il dau fisele. */
export const FOI_PE_FORMATIE: Record<Formatie, number> = {
  piramida: 59,
  raft: 63,
  turnuri: 46,
  bibliorafturi: 78,
  drum: 60,
  perete: 60,
  cercuri: 58,
};
