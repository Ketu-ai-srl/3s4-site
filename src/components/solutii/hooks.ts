"use client";

// Carlige mici ale pieselor client de pe paginile de solutii (scena, cautarile).

import { useSyncExternalStore } from "react";

const MISCARE_REDUSA = "(prefers-reduced-motion: reduce)";

/**
 * `prefers-reduced-motion: reduce`, citit fara clipire la hidratare: pe server si la primul cadru al
 * hidratarii raspunsul e `false`, deci HTML-ul servit e identic cu primul cadru din navigator.
 */
export function useMiscareRedusa(): boolean {
  return useSyncExternalStore(
    (anunta) => {
      const lista = window.matchMedia(MISCARE_REDUSA);
      lista.addEventListener("change", anunta);
      return () => lista.removeEventListener("change", anunta);
    },
    () => window.matchMedia(MISCARE_REDUSA).matches,
    () => false,
  );
}

const niciunAbonament = () => () => {};

/** `true` dupa montare, `false` pe server si la primul cadru al hidratarii. */
export function useMontat(): boolean {
  return useSyncExternalStore(
    niciunAbonament,
    () => true,
    () => false,
  );
}
