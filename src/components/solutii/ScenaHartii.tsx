"use client";

// Gazda scenei hartiilor: piesa inghetata `Scena3D` cu scena construita in `scena-hartii.ts`. Modulul
// se incarca lenes din `CardScena` (dupa hidratare), deci nici el, nici `three` nu stau pe drumul
// primei randari a paginii.

import { useCallback } from "react";
import Scena3D, { type ContextScena } from "@/components/scena3d/Scena3D";
import { construiesteScenaHartii, type ComenziScena, type DateScena } from "./scena-hartii";

export type ScenaHartiiProps = DateScena & {
  comenzi: ComenziScena;
  eticheta: string;
  className?: string;
};

export default function ScenaHartii({ formatie, fisiere, samanta, comenzi, eticheta, className }: ScenaHartiiProps) {
  const [f0, f1, f2] = fisiere;
  const construieste = useCallback(
    (ctx: ContextScena) => construiesteScenaHartii(ctx, { formatie, fisiere: [f0, f1, f2], samanta }, comenzi),
    [formatie, f0, f1, f2, samanta, comenzi],
  );
  return <Scena3D construieste={construieste} samanta={samanta} className={className} eticheta={eticheta} />;
}
