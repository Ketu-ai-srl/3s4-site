// Cardul divizat de pe comparatia cu drive-ul (comparatie-drive.md §2): stanga, ce face bine un
// drive (bife, fundal ardezie-0, nota de concesie); dreapta, situatiile care cer o arhiva
// (triunghiuri de avertizare chihlimbar). La 390 coloanele se aseaza una sub alta.

import { Check, TriangleAlert } from "lucide-react";
import s from "./comparatii.module.css";

export type CardDivizatProps = {
  stanga: { titlu: string; elemente: string[]; nota: string };
  dreapta: { titlu: string; elemente: string[] };
};

export default function CardDivizat({ stanga, dreapta }: CardDivizatProps) {
  return (
    <div className={s.divizat}>
      <div className={s.divizatStanga}>
        <h2 className={s.divizatTitlu}>{stanga.titlu}</h2>
        <ul className={s.lista}>
          {stanga.elemente.map((e) => (
            <li key={e} className={s.listaRand}>
              <Check size={15} strokeWidth={2} className={s.listaIconita} aria-hidden="true" focusable="false" />
              <span>{e}</span>
            </li>
          ))}
        </ul>
        <p className={s.divizatNota}>{stanga.nota}</p>
      </div>
      <div className={s.divizatDreapta}>
        <h2 className={s.divizatTitlu}>{dreapta.titlu}</h2>
        <ul className={s.lista}>
          {dreapta.elemente.map((e) => (
            <li key={e} className={s.listaRand}>
              <TriangleAlert
                size={15}
                strokeWidth={1.8}
                className={s.listaIconitaAvertizare}
                aria-hidden="true"
                focusable="false"
              />
              <span>{e}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
