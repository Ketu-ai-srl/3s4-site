// Carligele de timp si de mediu ale functionalitatilor. Le folosesc numai componentele client.
//
// CEASUL MACHETELOR (acasa-functionalitati.md §14.3, COMPONENTE.md §5.7): la referinta fiecare
// macheta isi pornea ceasul cand cardul intra in ecran, deci la desktop secventa din macheta 3 se
// consuma nevazuta. Aici ceasul bate numai cat macheta e ACTIVA (pasul ei, sau cardul ei pe pista)
// si vizibila cel putin 30%; cand pleaca, ceasul se opreste, iar la revenire reporneste cu aceeasi
// intarziere de 400 ms. Contoarele machetelor raman intre opriri. Pe ecranul culcat nu exista nici
// pas, nici card activ: acolo toate machetele sunt active si ceasul il porneste doar vizibilitatea,
// ca la referinta (`PasiFunctionalitati.tsx`).

import { useEffect, useRef, useState, useSyncExternalStore, type RefObject } from "react";

const MISCARE_REDUSA = "(prefers-reduced-motion: reduce)";

/** Preferinta de miscare redusa, citita direct (in efecte, dupa hidratare). */
export function areMiscareRedusa(): boolean {
  return typeof window !== "undefined" && window.matchMedia(MISCARE_REDUSA).matches;
}

/** O interogare media, urmarita. Pe server si la hidratare e `false`. */
export function useMedia(interogare: string): boolean {
  return useSyncExternalStore(
    (anunta) => {
      const m = window.matchMedia(interogare);
      m.addEventListener("change", anunta);
      return () => m.removeEventListener("change", anunta);
    },
    () => window.matchMedia(interogare).matches,
    () => false,
  );
}

export function useMiscareRedusa(): boolean {
  return useMedia(MISCARE_REDUSA);
}

const nimic = () => () => {};

/** `true` dupa hidratare; pe server si in prima randare a clientului, `false`. */
export function useMontat(): boolean {
  return useSyncExternalStore(
    nimic,
    () => true,
    () => false,
  );
}

/**
 * O bataie la `intarziere` ms dupa ce `ruleaza` devine adevarat, apoi la fiecare `perioada` ms,
 * cat timp ramane adevarat. Oprirea anuleaza tot; repornirea incepe din nou cu intarzierea.
 */
export function useBataie(ruleaza: boolean, intarziere: number, perioada: number, bate: () => void): void {
  const bateRef = useRef(bate);
  useEffect(() => {
    bateRef.current = bate;
  });
  useEffect(() => {
    if (!ruleaza) return;
    let interval = 0;
    const inceput = window.setTimeout(() => {
      bateRef.current();
      interval = window.setInterval(() => bateRef.current(), perioada);
    }, intarziere);
    return () => {
      window.clearTimeout(inceput);
      window.clearInterval(interval);
    };
  }, [ruleaza, intarziere, perioada]);
}

/** Pragul de vizibilitate la care pornesc machetele (fisa §5-§7: "vizibila 30%"). */
export const PRAG_VIZIBIL = 0.3;

/** Elementul e vizibil in fereastra cel putin `prag` din suprafata lui. */
export function useVizibil(ref: RefObject<Element | null>, prag = PRAG_VIZIBIL): boolean {
  const [vizibil, setVizibil] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || !("IntersectionObserver" in window)) return;
    const observator = new IntersectionObserver(
      (intrari) => {
        for (const intrare of intrari) setVizibil(intrare.isIntersecting && intrare.intersectionRatio >= prag - 0.001);
      },
      { threshold: [0, prag] },
    );
    observator.observe(el);
    return () => observator.disconnect();
  }, [ref, prag]);
  return vizibil;
}
