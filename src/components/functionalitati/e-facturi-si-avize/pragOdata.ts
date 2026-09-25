"use client";

// Pragul "o singura data" (functionalitati__sablon.md §4.5): o macheta trece in starea finala cand progresul
// sectiunii ei atinge pragul (~0,25) si RAMANE acolo si la urcare, spre deosebire de efectele proportionale.
// Il folosesc generatorul de factura (e-facturi-si-avize, S4) si lotul (semnatura-calificata, S5).
//
// De ce nu `useDinProgres`: pana la primul cadru al ceasului, progresul sectiunii e 1 (starea statica), deci
// un prag citit de acolo s-ar declansa la montare, inainte de orice derulare. Aici progresul se citeste
// direct din ceasul comun (`urmaresteProgres`), care da prima valoare REALA in cadrul urmator.
//
// Stari: `static` pe server, la miscare redusa si inainte de montare (forma finala, ca in HTML-ul servit);
// `asteapta` cu miscare, sub prag; `gata` dupa prag, pentru totdeauna.

import { useEffect, useState, type RefObject } from "react";
import { urmaresteProgres } from "@/components/cinema/ceas-derulare";
import { useMiscarePermisa } from "@/components/cinema/miscare";

export type StarePrag = "static" | "asteapta" | "gata";

export function usePragOdata(ref: RefObject<HTMLElement | null>, prag: number): StarePrag {
  const miscare = useMiscarePermisa();
  const [stare, setStare] = useState<StarePrag>("static");

  useEffect(() => {
    const sectiune = ref.current?.closest("section");
    if (!miscare || !sectiune) {
      setStare("static");
      return;
    }
    let trecut = false;
    let opreste: (() => void) | null = null;
    setStare("asteapta");
    opreste = urmaresteProgres(sectiune, (p) => {
      if (trecut || p < prag) return;
      trecut = true;
      setStare("gata");
      opreste?.();
    });
    return () => opreste?.();
  }, [miscare, prag, ref]);

  return stare;
}
