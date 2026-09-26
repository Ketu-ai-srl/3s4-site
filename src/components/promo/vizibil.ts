"use client";

// Pornirea pieselor cu ceas de pe paginile promo (tastarea, numaratoarea, scanarea bonului): o singura
// data, cand piesa intra in fereastra, si numai cu miscare permisa. Fara miscare, ramane starea statica.

import { useEffect, useState, type RefObject } from "react";
import { useMiscarePermisa } from "@/components/cinema/miscare";

/**
 * Faza piesei: `static` pe server, la miscare redusa si inainte de montare (forma finala, cea din HTML-ul
 * servit); `asteapta` dupa montare, cu miscare permisa, cat piesa nu a fost vazuta; `porneste` din clipa
 * in care a intrat in fereastra (o singura data, fara reluare).
 */
export type FazaPiesa = "static" | "asteapta" | "porneste";

export function usePornireLaVedere(ref: RefObject<Element | null>, prag = 0.35): FazaPiesa {
  const permisa = useMiscarePermisa();
  const [faza, setFaza] = useState<FazaPiesa>("static");

  useEffect(() => {
    const el = ref.current;
    if (!permisa || !el) {
      setFaza("static");
      return;
    }
    if (typeof IntersectionObserver === "undefined") return;
    setFaza((f) => (f === "porneste" ? f : "asteapta"));
    const obs = new IntersectionObserver(
      (intrari) => {
        if (intrari.some((i) => i.isIntersecting)) {
          setFaza("porneste");
          obs.disconnect();
        }
      },
      // Marginea de jos taiata cu 20%: sectiunea abia intrata e inca stinsa de derulare (e ~ 0).
      { threshold: prag, rootMargin: "0px 0px -20% 0px" },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [permisa, ref, prag]);

  return faza;
}
