"use client";

// Miscarea pe paginile cinema: o singura intrebare, pusa la fel peste tot - are voie pagina sa se
// miste? Raspunsul e NU pe server (HTML-ul servit e starea statica, finala) si NU la
// `prefers-reduced-motion: reduce` (COMPONENTE.md §2.5: fara aparitii, scenele direct in starea
// finala, 3D intr-un singur cadru). Abia dupa montare, cu preferinta `no-preference`, piesele pornesc.

import { useEffect, useState } from "react";

/** Preferinta de miscare redusa a vizitatorului, citita acum. Pe server: `true` (starea statica). */
export function areMiscareRedusa(): boolean {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return true;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * `true` numai dupa montare si numai daca vizitatorul nu cere miscare redusa. Prima randare (si
 * hidratarea) da `false`, deci serverul si clientul pornesc din aceeasi stare statica.
 */
export function useMiscarePermisa(): boolean {
  const [permisa, setPermisa] = useState(false);
  useEffect(() => {
    if (typeof window.matchMedia !== "function") return;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const aplica = () => setPermisa(!media.matches);
    aplica();
    media.addEventListener("change", aplica);
    return () => media.removeEventListener("change", aplica);
  }, []);
  return permisa;
}
