"use client";

// Pachetele (preturi.md §6), ancora `#pachete`: calculatorul, comutatorul, grila si lista ca PDF.
// Perioada aleasa in comutator o citesc si grila (sumele), si calculatorul (pretul planului, in ore).

import { useState } from "react";
import { ANCORE_PRETURI, GRILA, type Perioada } from "@/content/preturi";
import Calculator from "./Calculator";
import ComutatorPerioada from "./ComutatorPerioada";
import GrilaPlanuri from "./GrilaPlanuri";
import ListaPdf from "./ListaPdf";
import s from "./pachete.module.css";

export default function Pachete({ gazda, analitica }: { gazda: string; analitica: boolean }) {
  const [perioada, setPerioada] = useState<Perioada>("anual");
  return (
    <section id={ANCORE_PRETURI.pachete} className={s.pachete} aria-label={GRILA.eticheta}>
      <div className="container-site">
        <Calculator perioada={perioada} analitica={analitica} />
        <ComutatorPerioada perioada={perioada} laSchimbare={setPerioada} />
        <GrilaPlanuri perioada={perioada} />
        <ListaPdf gazda={gazda} />
      </div>
    </section>
  );
}
