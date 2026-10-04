"use client";

// Pachetele, VEDEREA (preturi.md §6), ancora `#pachete` pe RO: calculatorul, comutatorul, grila si lista
// ca PDF. Perioada aleasa in comutator o citesc si grila (sumele), si calculatorul (pretul planului, in
// ore).
//
// PE EDITIE: vederea nu importa niciun continut. Ancora, eticheta sectiunii si cele patru piese ale
// editiei (fiecare cu textele si moneda ei) vin de la invelitoarea editiei (`Pachete.tsx` pe RO). Piesele
// se aleg acolo, fiindca un tip de componenta nu trece granita server-client.

import { useState, type ComponentType } from "react";
import type { Perioada } from "@/content/preturi";
import s from "./pachete.module.css";

/** Piesele pachetelor, pe editie. */
export type PiesePachete = {
  Calculator: ComponentType<{ perioada: Perioada; analitica: boolean }>;
  Comutator: ComponentType<{ perioada: Perioada; laSchimbare: (p: Perioada) => void }>;
  Grila: ComponentType<{ perioada: Perioada }>;
  ListaPdf: ComponentType<{ gazda: string }>;
};

export type PacheteVedereProps = {
  gazda: string;
  analitica: boolean;
  /** Ancora sectiunii, fara diez. */
  ancora: string;
  /** Numele accesibil al sectiunii. */
  eticheta: string;
  piese: PiesePachete;
};

export default function PacheteVedere({ gazda, analitica, ancora, eticheta, piese }: PacheteVedereProps) {
  const [perioada, setPerioada] = useState<Perioada>("anual");
  const { Calculator, Comutator, Grila, ListaPdf } = piese;
  return (
    <section id={ancora} className={s.pachete} aria-label={eticheta}>
      <div className="container-site">
        <Calculator perioada={perioada} analitica={analitica} />
        <Comutator perioada={perioada} laSchimbare={setPerioada} />
        <Grila perioada={perioada} />
        <ListaPdf gazda={gazda} />
      </div>
    </section>
  );
}
