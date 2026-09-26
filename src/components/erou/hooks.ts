"use client";

// Carlige mici, comune pieselor client ale eroului.

import { useEffect, useRef, useState, useSyncExternalStore } from "react";

const niciunAbonament = () => () => {};

/**
 * `true` dupa montare, `false` pe server si la primul cadru al hidratarii. Asa, ce se randeaza pe
 * server (starea statica, fara JavaScript) e identic cu primul cadru din navigator, iar partile
 * care cer JavaScript apar abia dupa.
 */
export function useMontat(): boolean {
  return useSyncExternalStore(
    niciunAbonament,
    () => true,
    () => false,
  );
}

/** Starea unei interogari media; `false` pe server. */
export function useMedia(interogare: string): boolean {
  return useSyncExternalStore(
    (anunta) => {
      const lista = window.matchMedia(interogare);
      lista.addEventListener("change", anunta);
      return () => lista.removeEventListener("change", anunta);
    },
    () => window.matchMedia(interogare).matches,
    () => false,
  );
}

export function useMiscareRedusa(): boolean {
  return useMedia("(prefers-reduced-motion: reduce)");
}

/**
 * Programeaza `fn` in timpul liber al navigatorului, cel tarziu dupa `asteptareMaxima` ms, si
 * intoarce anularea (buna de intors dintr-un `useEffect`). Fara `requestIdleCallback`, un
 * temporizator scurt.
 */
export function inTimpulLiber(fn: () => void, asteptareMaxima = 2000): () => void {
  const w = window as Window & {
    requestIdleCallback?: (cb: () => void, optiuni?: { timeout: number }) => number;
    cancelIdleCallback?: (id: number) => void;
  };
  if (w.requestIdleCallback) {
    const id = w.requestIdleCallback(fn, { timeout: asteptareMaxima });
    return () => w.cancelIdleCallback?.(id);
  }
  const t = window.setTimeout(fn, 250);
  return () => window.clearTimeout(t);
}

/**
 * De cate ori a iesit un ecran din vedere: creste cand `activ` trece din adevarat in fals. Ecranele
 * aplicatiei raman montate intre vizite (`Aplicatie.tsx`), deci numaratoarea le spune cand sa-si
 * reia povestea de la capat; se reia cat ecranul e ascuns, ca la vizita urmatoare sa porneasca de la
 * zero, ca un ecran nou, fara sa se vada starea veche nici macar un cadru.
 */
export function useIesiri(activ: boolean): number {
  const [iesiri, setIesiri] = useState(0);
  const anterior = useRef(activ);
  useEffect(() => {
    if (anterior.current && !activ) setIesiri((n) => n + 1);
    anterior.current = activ;
  }, [activ]);
  return iesiri;
}

/**
 * Un ceas care numara numai cat `activ` e adevarat si intoarce pasul curent dintr-o cronologie
 * ciclica: `praguri` sunt momentele (ms de la inceputul ciclului) la care se schimba pasul, iar
 * `perioada` e lungimea ciclului. Pauza (mouse peste ecran, ecran ascuns) opreste ceasul fara sa-l
 * reseteze. Intoarce ciclul (cate au trecut) si pasul (indicele ultimului prag atins, -1 inainte de
 * primul). Cu `perioada` = Infinity cronologia ruleaza o singura data.
 */
export function useCronologie(
  praguri: readonly number[],
  perioada: number,
  activ: boolean,
  cheie: unknown = 0,
): { ciclu: number; pas: number } {
  // Starea de la timpul 0 (pragul 0, daca exista, e deja atins): cand ceasul porneste, prima bataie
  // o gaseste neschimbata si nu mai randeaza ecranul inca o data, chiar in clicul care il arata.
  const [stare, setStare] = useState(() => cronologieLa(0, praguri, perioada));
  const scursRef = useRef(0);

  // O cheie noua (alt dosar ales, alt ecran) reia cronologia de la zero.
  useEffect(() => {
    scursRef.current = 0;
    const zero = cronologieLa(0, praguri, perioada);
    setStare((vechi) => (vechi.ciclu === zero.ciclu && vechi.pas === zero.pas ? vechi : zero));
  }, [cheie, praguri, perioada]);

  useEffect(() => {
    if (!activ) return;
    let ultim = performance.now();
    const bataie = () => {
      const acum = performance.now();
      // Un salt mare (fila ascunsa) nu se numara: ceasul masoara timpul vazut.
      scursRef.current += Math.min(acum - ultim, 100);
      ultim = acum;
      const nou = cronologieLa(scursRef.current, praguri, perioada);
      setStare((vechi) => (vechi.ciclu === nou.ciclu && vechi.pas === nou.pas ? vechi : nou));
    };
    bataie();
    const interval = window.setInterval(bataie, 40);
    return () => window.clearInterval(interval);
  }, [activ, perioada, praguri, cheie]);

  return stare;
}

/** Ciclul si pasul unei cronologii dupa `scurs` ms (vezi `useCronologie`). */
function cronologieLa(scurs: number, praguri: readonly number[], perioada: number): { ciclu: number; pas: number } {
  const ciclu = Number.isFinite(perioada) ? Math.floor(scurs / perioada) : 0;
  const inCiclu = Number.isFinite(perioada) ? scurs - ciclu * perioada : scurs;
  let pas = -1;
  for (let i = 0; i < praguri.length; i++) if (inCiclu >= praguri[i]) pas = i;
  return { ciclu, pas };
}
