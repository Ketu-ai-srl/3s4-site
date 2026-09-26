// Cronologia scenei lipite de pe /flux-documente, ca functie pura de derulare (flux-documente.md §2,
// linia de timp masurata la 1440). `u` e distanta derulata in pin, adusa pe scara masurata de
// 1800 px (pinul de 300lvh la o fereastra de 900 lasa 1800 px de derulare), deci aceeasi cronologie
// merge la orice inaltime de fereastra. Pozitiile sunt LEGATE de derulare, fara netezire: la o
// derulare fixa nimic nu se misca (proba de timp a fisei).
//
// Separata de componenta ca sa se poata proba fara navigator (tests/flux-efacturare.test.ts).

export const SCARA = 1800;

/** Sosirile documentului in ferestrele 1-4 (fereastra 0 il primeste la aparitie). */
export const SOSIRI = [208, 308, 408, 508];
/** Aparitia documentului peste prima fereastra. */
export const APARITIE_DOC = 58;
/** Durata unui salt dintre doua ferestre. */
export const SALT = 70;
/** Inceputul trecerii in faza a doua si schimbarea fazei. */
export const TRECERE = 658;
export const FAZA_DOI = 808;
/** Momentele in care pasii 1-5 devin curenti. */
export const PASI = [858, 958, 1058, 1208, 1358];
/** Aparitia pastilei persoanei (pasul 4). */
export const PERSOANA = 1308;
/** Decalajul orizontal al celor 5 pasi fata de centrul panoului. */
export const SX = [-320, -160, 0, 160, 320];
/** Taierea traseului documentului, ca sa nu iasa din panou. */
export const TAIERE = 284;

export type Punct = { x: number; y: number };

export type StareScena = {
  faza: 1 | 2;
  /** Contorul fazei 1: cate locuri a atins actul (1-5). */
  locuri: number;
  ferestre: { opacitate: number; dy: number }[];
  doc: { x: number; y: number; rotatie: number; scara: number; opacitate: number };
  /** Fereastra langa care sta pastila de actiune, sau -1. */
  pastila: number;
  panou: number;
  /** Indicele pasului curent (-1 = niciunul). */
  pas: number;
  persoana: boolean;
};

const lim = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const neted = (t: number) => t * t * (3 - 2 * t);
const interp = (a: number, b: number, t: number) => a + (b - a) * t;

/**
 * Starea scenei la distanta `u` (0-1800). `centre` sunt centrele celor 5 ferestre; `ingust` = aspectul
 * de sub 600 px, unde documentul nu urmeaza pasii si sta fix deasupra panoului.
 */
export function stareScena(u: number, centre: Punct[], ingust: boolean): StareScena {
  const ferestre = centre.map((_, i) => {
    const w = lim((u - (8 + 30 * i)) / 60);
    const stingere = lim((u - (TRECERE + 20 * i)) / 60);
    return { opacitate: w * (1 - stingere), dy: 18 * (1 - w) };
  });

  // Faza 1: documentul sta peste fereastra la care a ajuns (cu 34 px sub centrul ei) si sare la
  // urmatoarea in ultimii SALT px dinaintea sosirii, rotit spre -6 grade la mijlocul saltului.
  const peste = (k: number): Punct => ({ x: centre[k].x, y: centre[k].y + 34 });
  let x = peste(0).x;
  let y = peste(0).y;
  let rotatie = 0;
  for (let k = 0; k < SOSIRI.length; k++) {
    const t = lim((u - (SOSIRI[k] - SALT)) / SALT);
    if (t <= 0) break;
    const a = peste(k);
    const b = peste(k + 1);
    const e = neted(t);
    x = interp(a.x, b.x, e);
    y = interp(a.y, b.y, e) - Math.sin(Math.PI * t) * 24;
    rotatie = -6 * Math.sin(Math.PI * t);
  }
  let scara = 1;
  const pasCurent = PASI.filter((p) => u >= p).length - 1;

  // Faza 2: tinta documentului e pasul curent (legat de derulare intre doi pasi), taiata la +-284.
  if (u > TRECERE) {
    const t = neted(lim((u - TRECERE) / (FAZA_DOI - TRECERE)));
    let tx = SX[0];
    if (!ingust) {
      for (let k = 0; k < PASI.length - 1; k++) {
        const f = lim((u - PASI[k]) / (PASI[k + 1] - PASI[k]));
        if (u >= PASI[k]) tx = interp(SX[k], SX[k + 1], f);
      }
      tx = lim(tx, -TAIERE, TAIERE);
    } else {
      tx = 0;
    }
    const ty = ingust ? -168 : -40;
    x = interp(x, tx, t);
    y = interp(y, ty, t);
    rotatie = interp(rotatie, 0, t);
    scara = interp(1, 0.9, t);
  }

  const sosiri = [APARITIE_DOC + 50, ...SOSIRI];
  let pastila = -1;
  if (u < TRECERE) {
    for (let k = 0; k < sosiri.length; k++) {
      const plecare = k < SOSIRI.length ? SOSIRI[k] - SALT : TRECERE;
      if (u >= sosiri[k] && u < plecare) pastila = k;
    }
  }

  return {
    faza: u >= FAZA_DOI ? 2 : 1,
    locuri: 1 + SOSIRI.filter((s) => u >= s).length,
    ferestre,
    doc: { x, y, rotatie, scara, opacitate: lim((u - APARITIE_DOC) / 50) },
    pastila,
    panou: lim((u - 700) / 100),
    pas: u >= FAZA_DOI ? pasCurent : -1,
    persoana: u >= PERSOANA,
  };
}

/** Distanta derulata in pin, pe scara de 1800, din pozitia pinului si inaltimea ferestrei. */
export function distantaPeScara(topPin: number, inaltimePin: number, inaltimeFereastra: number): number {
  const drum = Math.max(1, inaltimePin - inaltimeFereastra);
  return lim(-topPin / drum, 0, 1) * SCARA;
}
