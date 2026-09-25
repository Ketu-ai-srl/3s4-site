"use client";

// SectiuneScena: sectiunea de baza a paginilor cinema (functionalitati__sablon.md §1.3-§1.4), cu
// progresul p al ei, calculat la fiecare cadru in care pagina se misca.
//
// CE DA COPIILOR, pe doua cai:
//   1. variabila CSS `--p` pe elementul `section` (0..1, 4 zecimale). Efectele proportionale se scriu
//      direct in CSS - `opacity: clamp(0, calc(2 * var(--p)), 1)` -, cu tranzitia lor scurta
//      (0,3-0,6 s), deci nu randeaza nimic din React la derulare;
//   2. `useProgres()` si `useDinProgres(f)`, pentru ce nu se poate scrie in CSS: contoare, texte
//      scrise, comutari de clasa la un prag. `useDinProgres` re-randeaza numai cand rezultatul lui
//      `f` se schimba, deci `f` intoarce o valoare simpla (numar, sir, boolean), niciodata un obiect.
//
// STAREA STATICA: p = 1, si pe server, si la `prefers-reduced-motion: reduce` (fisa §6: "toate
// progresele sunt fortate la 1"). HTML-ul servit arata deci fiecare piesa in forma ei finala.
//
// INALTIMILE sunt in unitati de fereastra, ca la referinta (fisa §1.3): `inaltime` in vh, la 390 aceeasi
// valoare sau `inaltimeMobil`. Continutul mai inalt creste sectiunea peste minim.

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useSyncExternalStore,
  type CSSProperties,
  type ReactNode,
} from "react";
import { urmaresteProgres } from "./ceas-derulare";
import { areMiscareRedusa } from "./miscare";
import s from "./SectiuneScena.module.css";

type Ascultator = () => void;

/** Ce vede un copil al sectiunii: valoarea curenta a lui p si abonarea la schimbari. */
export type ProgresScena = {
  valoare: () => number;
  asculta: (fn: Ascultator) => () => void;
};

/** Progresul in afara oricarei sectiuni: static, 1. */
const STATIC: ProgresScena = { valoare: () => 1, asculta: () => () => {} };

const ContextProgres = createContext<ProgresScena>(STATIC);

const SERVER = () => 1;

/** Progresul p al sectiunii din jur. Re-randeaza la fiecare schimbare: de folosit rar. */
export function useProgres(): number {
  const progres = useContext(ContextProgres);
  return useSyncExternalStore(progres.asculta, progres.valoare, SERVER);
}

/**
 * O valoare derivata din p (un contor, un numar de caractere, o stare la prag). Re-randeaza numai cand
 * rezultatul se schimba. `f` intoarce o valoare simpla, niciodata un obiect nou.
 */
export function useDinProgres<T extends number | string | boolean>(f: (p: number) => T): T {
  const progres = useContext(ContextProgres);
  return useSyncExternalStore(
    progres.asculta,
    () => f(progres.valoare()),
    () => f(1),
  );
}

/** Spatierile masurate (fisa §1.3). La 390: 48 / 20, iar `scena-sus` 64 20 32. */
export type Spatiere = "baza" | "scena" | "scena-sus" | "mica" | "fara";

const CLASA_SPATIERE: Record<Spatiere, string> = {
  baza: s.baza,
  scena: s.scena,
  "scena-sus": s.scenaSus,
  mica: s.mica,
  fara: s.fara,
};

export type SectiuneScenaProps = {
  children: ReactNode;
  /** Inaltimea minima, in vh (fisa §1.3: 55-200). */
  inaltime?: number;
  /** Inaltimea minima sub 768 px, cand difera (cautare-ai S2: 55vh la 1440, 60vh la 390). */
  inaltimeMobil?: number;
  spatiere?: Spatiere;
  /**
   * Latimea maxima a blocului interior, in px (540-980). `null` = fara bloc interior: copiii stau
   * direct in sectiune (o scena lipita, un strat absolut).
   */
  latime?: number | null;
  /** Blocul interior ia latimea continutului (pana la `latime`), ca la referinta pe erou si pivot. */
  interiorLaContinut?: boolean;
  className?: string;
  interiorClassName?: string;
  /** Eticheta accesibila a sectiunii, cand nu are un titlu propriu. */
  eticheta?: string;
  /** Numele sectiunii, pentru probe (`data-sectiune`). */
  nume?: string;
  style?: CSSProperties;
};

export default function SectiuneScena({
  children,
  inaltime = 100,
  inaltimeMobil,
  spatiere = "baza",
  latime = 720,
  interiorLaContinut = false,
  className,
  interiorClassName,
  eticheta,
  nume,
  style,
}: SectiuneScenaProps) {
  const ref = useRef<HTMLElement>(null);
  const stare = useRef<{ p: number; ascultatori: Set<Ascultator> }>({ p: 1, ascultatori: new Set() });

  const progres = useMemo<ProgresScena>(
    () => ({
      valoare: () => stare.current.p,
      asculta: (fn) => {
        stare.current.ascultatori.add(fn);
        return () => {
          stare.current.ascultatori.delete(fn);
        };
      },
    }),
    [],
  );

  useEffect(() => {
    const el = ref.current;
    if (!el || areMiscareRedusa()) return;
    const interna = stare.current;
    return urmaresteProgres(el, (p) => {
      interna.p = p;
      el.style.setProperty("--p", String(p));
      for (const fn of interna.ascultatori) fn();
    });
  }, []);

  const variabile = {
    "--vh-min": String(inaltime),
    "--vh-min-mobil": String(inaltimeMobil ?? inaltime),
    ...(latime === null ? {} : { "--latime-interior": latime + "px" }),
    ...style,
  } as CSSProperties;

  const clase = [s.sectiune, CLASA_SPATIERE[spatiere], className].filter(Boolean).join(" ");
  const claseInterior = [s.interior, interiorLaContinut ? s.laContinut : "", interiorClassName]
    .filter(Boolean)
    .join(" ");

  return (
    <section ref={ref} className={clase} style={variabile} aria-label={eticheta} data-sectiune={nume}>
      <ContextProgres.Provider value={progres}>
        {latime === null ? children : <div className={claseInterior}>{children}</div>}
      </ContextProgres.Provider>
    </section>
  );
}
