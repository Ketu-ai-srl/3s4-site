// Iesirile de sub panou (instrumente__termene-pastrare.md §2): trei legaturi 16/500 albastru, prima
// cu imprimanta, celelalte cu sageata. Trec prin `Tinta`: o tinta care nu exista inca ramane
// inerta, cu acelasi aspect. La 390 cad una sub alta prin rupere naturala (gap 28): prima incape
// si tine iconita dupa text, a doua si a treia se rup pe 2 randuri, cu iconita la marginea dreapta.

import { ArrowRight, Printer } from "lucide-react";
import Tinta from "@/components/primitive/Tinta";
import { IESIRI_TERMENE } from "@/content/termene/date";
import s from "./termene.module.css";

export default function IesiriTermene() {
  return (
    <ul className={s.iesiri}>
      {IESIRI_TERMENE.map((i) => (
        <li key={i.text}>
          <Tinta legatura={i} className={s.iesire}>
            <span>{i.text}</span>
            {i.iconita === "printer" ? (
              <Printer size={14} strokeWidth={2} aria-hidden="true" focusable="false" />
            ) : (
              <ArrowRight size={14} strokeWidth={2} aria-hidden="true" focusable="false" />
            )}
          </Tinta>
        </li>
      ))}
    </ul>
  );
}
