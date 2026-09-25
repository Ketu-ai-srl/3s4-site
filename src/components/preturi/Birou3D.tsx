"use client";

// Gazda scenei biroului: Scena3D (piesa inghetata a feliei `fundatie`) cu scena din
// `birou-scena.ts`. Modulul se incarca LENES, numai cand primul pliu se deschide, deci nici codul
// scenei, nici `three` nu sunt pe drumul paginii.
//
// Numarul de dispozitive ajunge la scena printr-o referinta citita la fiecare cadru: scena creste
// fara sa se reconstruiasca. La miscare redusa Scena3D deseneaza un singur cadru si nu mai ruleaza
// bucla, deci acolo scena se monteaza din nou la fiecare dispozitiv (cheia), in starea ei finala.

import { useCallback, useEffect, useRef, useSyncExternalStore } from "react";
import Scena3D, { type ContextScena } from "@/components/scena3d/Scena3D";
import { construiesteBirou } from "./birou-scena";
import s from "./pliuri.module.css";

const INTEROGARE = "(prefers-reduced-motion: reduce)";

function aboneaza(f: () => void): () => void {
  const m = window.matchMedia(INTEROGARE);
  m.addEventListener("change", f);
  return () => m.removeEventListener("change", f);
}

export default function Birou3D({ dispozitive, eticheta }: { dispozitive: number; eticheta: string }) {
  const numar = useRef(dispozitive);
  useEffect(() => {
    numar.current = dispozitive;
  }, [dispozitive]);

  const redusa = useSyncExternalStore(
    aboneaza,
    () => window.matchMedia(INTEROGARE).matches,
    () => false,
  );

  const construieste = useCallback((c: ContextScena) => construiesteBirou(c, () => numar.current), []);

  return (
    <Scena3D
      key={redusa ? "static-" + dispozitive : "viu"}
      construieste={construieste}
      samanta={7}
      className={s.panza}
      eticheta={eticheta}
    />
  );
}
