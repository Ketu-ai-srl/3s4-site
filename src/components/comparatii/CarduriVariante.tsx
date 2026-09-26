// Cele trei carduri de varianta de pe comparatia stocarii (comparatie-stocare.md §2): 3 x 1fr pe
// 1100, cardul 3S cu chenar albastru, scut cu bifa si bife; cardurile tertilor cu persoana si
// liniute. Sursele rezervelor tertilor stau in caseta pliata de sub tabel (`TabelMarcaje`).

import { Check, Minus, ShieldCheck, UserRound } from "lucide-react";
import type { CardVarianta } from "@/content/comparatii";
import s from "./comparatii.module.css";

export default function CarduriVariante({ carduri }: { carduri: CardVarianta[] }) {
  return (
    <ul className={s.variante}>
      {carduri.map((c) => (
        <li key={c.titlu} className={c.noi ? s.varianta + " " + s.variantaNoi : s.varianta}>
          <h2 className={s.variantaTitlu}>{c.titlu}</h2>
          <p className={s.variantaDescriere}>{c.descriere}</p>
          <p className={c.noi ? s.verdict + " " + s.verdictNoi : s.verdict}>
            {c.noi ? (
              <ShieldCheck size={15} strokeWidth={1.8} aria-hidden="true" focusable="false" />
            ) : (
              <UserRound size={15} strokeWidth={1.8} aria-hidden="true" focusable="false" />
            )}
            <span>{c.verdict}</span>
          </p>
          <ul className={s.lista}>
            {c.elemente.map((e) => (
              <li key={e} className={c.noi ? s.variantaRand + " " + s.variantaRandNoi : s.variantaRand}>
                {c.noi ? (
                  <Check size={14} strokeWidth={2} className={s.variantaIconita} aria-hidden="true" focusable="false" />
                ) : (
                  <Minus size={14} strokeWidth={2} className={s.variantaIconita} aria-hidden="true" focusable="false" />
                )}
                <span>{e}</span>
              </li>
            ))}
          </ul>
        </li>
      ))}
    </ul>
  );
}
