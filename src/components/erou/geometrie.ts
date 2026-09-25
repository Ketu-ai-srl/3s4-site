// Geometria si ceasul buclei din erou (acasa-erou.md §1.4.3-§1.5), ca functii pure: se probeaza
// fara navigator (`tests/erou.test.ts`) si le foloseste aceeasi bucla de animatie din pagina, deci
// proba si pagina nu pot drifta una fata de alta.
//
// Unitatile sunt ale scenei (viewBox 640 x 420). Timpul e in milisecunde de la primul cadru.

export type Punct = { x: number; y: number };
type Bezier = readonly [Punct, Punct, Punct, Punct];

/** Scena SVG, in unitati (acasa-erou.md §1.4.1). */
export const LATIME_SCENA = 640;
export const INALTIME_SCENA = 420;

/**
 * Drumul: un "8" culcat din 4 curbe Bezier cubice, parcurs centru -> sus-stanga -> capatul stang ->
 * jos-stanga -> centru -> sus-dreapta -> capatul drept -> jos-dreapta -> centru (§1.4.3).
 */
const SEGMENTE: readonly Bezier[] = [
  [
    { x: 320, y: 210 },
    { x: 320, y: 70 },
    { x: 90, y: 70 },
    { x: 90, y: 210 },
  ],
  [
    { x: 90, y: 210 },
    { x: 90, y: 350 },
    { x: 320, y: 350 },
    { x: 320, y: 210 },
  ],
  [
    { x: 320, y: 210 },
    { x: 320, y: 70 },
    { x: 550, y: 70 },
    { x: 550, y: 210 },
  ],
  [
    { x: 550, y: 210 },
    { x: 550, y: 350 },
    { x: 320, y: 350 },
    { x: 320, y: 210 },
  ],
];

/** Acelasi drum, ca atribut `d`. */
export const DRUM_BUCLA =
  "M320 210C320 70 90 70 90 210C90 350 320 350 320 210C320 70 550 70 550 210C550 350 320 350 320 210";

/** Lungimea masurata pe referinta cu `getTotalLength` (§1.4.3). Proba o compara cu cea calculata. */
export const LUNGIME_BUCLA = 1396.34;

/** Perioada ciclului, liniara (§1.5: 12 000 ms, regresie pe 757 de esantioane). */
export const PERIOADA_MS = 12000;

/** Arcul cometei: 10% din lungime (§1.4.4). */
export const ARC_COMETA = 0.1;

/** La miscare redusa cometa sta cu capul la 30% din drum (§1.5). */
export const CAP_COMETA_STATIC = 0.3;

/** Cele trei cercuri ale unui grup: raza (unitati) si decalajul fata de cap, in fractii (§1.4.4). */
export const CERCURI_GRUP = [
  { raza: 4.2, decalaj: 0, clasa: "cap" },
  { raza: 3.2, decalaj: -0.014, clasa: "mijloc" },
  { raza: 2.4, decalaj: -0.028, clasa: "coada" },
] as const;

/** Trei grupuri, defazate cu o treime din ciclu; cometa e legata de grupul 0. */
export const GRUPURI = 3;

export type PozitieNod = "sus-stanga" | "jos-stanga" | "sus-dreapta" | "jos-dreapta";

/** Nodurile stau pe drum la aceste fractii din lungime (§1.4.5). */
export const FRACTII_NODURI: Record<PozitieNod, number> = {
  "sus-stanga": 0.12,
  "jos-stanga": 0.38,
  "sus-dreapta": 0.62,
  "jos-dreapta": 0.88,
};

/** Centrul e atins de doua ori pe tur: la 0 si la 0,5. */
export const FRACTII_CENTRU = [0, 0.5] as const;

/**
 * Fereastra pulsului: +-0,004 din ciclu (+-48 ms). Referinta reaplica clasa la fiecare cadru din
 * fereastra, deci inelul porneste efectiv la IESIREA din ea; aici porneste direct acolo.
 */
export const FEREASTRA_PULS = 0.004;

export type TintaPuls = PozitieNod | "centru";

function punctBezier(b: Bezier, t: number): Punct {
  const u = 1 - t;
  const a = u * u * u;
  const c = 3 * u * u * t;
  const d = 3 * u * t * t;
  const e = t * t * t;
  return {
    x: a * b[0].x + c * b[1].x + d * b[2].x + e * b[3].x,
    y: a * b[0].y + c * b[1].y + d * b[2].y + e * b[3].y,
  };
}

/** Pasi de esantionare pe segment; eroarea de lungime scade sub 0,01 u (proba o masoara). */
const PASI_SEGMENT = 512;

type Tabel = { puncte: Punct[]; cumulat: number[]; lungime: number };

function construiesteTabel(): Tabel {
  const puncte: Punct[] = [SEGMENTE[0][0]];
  const cumulat: number[] = [0];
  let total = 0;
  for (const segment of SEGMENTE) {
    let anterior = segment[0];
    for (let i = 1; i <= PASI_SEGMENT; i++) {
      const p = punctBezier(segment, i / PASI_SEGMENT);
      total += Math.hypot(p.x - anterior.x, p.y - anterior.y);
      puncte.push(p);
      cumulat.push(total);
      anterior = p;
    }
  }
  return { puncte, cumulat, lungime: total };
}

let tabel: Tabel | null = null;

function tabelul(): Tabel {
  if (tabel === null) tabel = construiesteTabel();
  return tabel;
}

/** Lungimea drumului, calculata prin integrare numerica (se compara cu `LUNGIME_BUCLA`). */
export function lungimeCalculata(): number {
  return tabelul().lungime;
}

/** Fractia adusa in [0, 1). */
export function normalizeaza(f: number): number {
  const r = f % 1;
  return r < 0 ? r + 1 : r;
}

/** Punctul de pe drum aflat la fractia `f` din lungime (parametrizare dupa lungimea arcului). */
export function punctLaFractie(f: number): Punct {
  const { puncte, cumulat, lungime } = tabelul();
  const tinta = normalizeaza(f) * lungime;
  let jos = 0;
  let sus = cumulat.length - 1;
  while (sus - jos > 1) {
    const mijloc = (jos + sus) >> 1;
    if (cumulat[mijloc] <= tinta) jos = mijloc;
    else sus = mijloc;
  }
  const bucata = cumulat[sus] - cumulat[jos];
  const k = bucata > 0 ? (tinta - cumulat[jos]) / bucata : 0;
  return {
    x: puncte[jos].x + (puncte[sus].x - puncte[jos].x) * k,
    y: puncte[jos].y + (puncte[sus].y - puncte[jos].y) * k,
  };
}

/** Capetele celor trei grupuri la momentul `t` (ms de la primul cadru), in fractii. */
export function capete(t: number): number[] {
  const baza = t / PERIOADA_MS;
  return Array.from({ length: GRUPURI }, (_, g) => normalizeaza(baza + g / GRUPURI));
}

/** Liniuta cometei cu capul la fractia `cap`: arcul de 10% din spatele capului. */
export function liniutaCometa(cap: number, lungime = LUNGIME_BUCLA): { dasharray: string; dashoffset: number } {
  const arc = ARC_COMETA * lungime;
  return {
    dasharray: arc.toFixed(2) + " " + (lungime - arc).toFixed(2),
    dashoffset: -(normalizeaza(cap) - ARC_COMETA) * lungime,
  };
}

type Programare = { tinta: TintaPuls; perioada: number; faza: number };

/**
 * Programul pulsurilor: fiecare nod pulseaza o data la 4000 ms (trei capete, defazate cu 4000),
 * centrul o data la 2000 (atins de doua ori pe tur). `faza` = momentul iesirii din fereastra.
 */
export const PROGRAM_PULSURI: readonly Programare[] = [
  ...(Object.keys(FRACTII_NODURI) as PozitieNod[]).map((tinta) => ({
    tinta,
    perioada: PERIOADA_MS / GRUPURI,
    faza: ((FRACTII_NODURI[tinta] + FEREASTRA_PULS) * PERIOADA_MS) % (PERIOADA_MS / GRUPURI),
  })),
  {
    tinta: "centru",
    perioada: PERIOADA_MS / GRUPURI / 2,
    faza: (FEREASTRA_PULS * PERIOADA_MS) % (PERIOADA_MS / GRUPURI / 2),
  },
];

/**
 * Pulsurile de pornit intre doua cadre (`anterior` exclus, `acum` inclus). Dupa o pauza lunga
 * (fila ascunsa, bucla in afara ferestrei) nu se pornesc pulsuri de recuperare: punctele sar la
 * pozitia la care ar fi ajuns, iar inelele raman doar pentru trecerile vazute.
 */
export function pulsuriIntre(anterior: number, acum: number, pauzaMaxima = 250): TintaPuls[] {
  if (!(acum > anterior) || acum - anterior > pauzaMaxima) return [];
  const rezultat: TintaPuls[] = [];
  for (const p of PROGRAM_PULSURI) {
    const inainte = Math.floor((anterior - p.faza) / p.perioada);
    const dupa = Math.floor((acum - p.faza) / p.perioada);
    if (dupa > inainte) rezultat.push(p.tinta);
  }
  return rezultat;
}
