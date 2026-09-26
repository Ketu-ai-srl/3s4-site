// Cardul actului din exemplu (functionalitati__automatizari-ai.md, S0 si S1): `ardezie-9`, chenar .08,
// raza 10, umbra de nod; capul cu patratul PDF si numele fisierului in mono 11,52, barele de "text"
// (alb .1, raza 2, 4 px, pas 4) si, dedesubt, ora sau randul cu zilele. Fara stare: il misca parintele.

import type { CSSProperties, ReactNode } from "react";
import { PatratTip } from "@/components/cinema/Fereastra";
import s from "./automatizari.module.css";

export type CardActProps = {
  nume: string;
  /** Clasele barelor de text, de sus in jos (latimile lor). */
  bare: readonly (string | undefined)[];
  /** Randul de jos: ora (erou) sau zilele si starea (asteptare). */
  jos: ReactNode;
  className?: string;
  style?: CSSProperties;
};

export default function CardAct({ nume, bare, jos, className, style }: CardActProps) {
  return (
    <div className={[s.act, className].filter(Boolean).join(" ")} style={style}>
      <div className={s.capAct}>
        <PatratTip tip="pdf" />
        <span className={s.numeAct}>{nume}</span>
      </div>
      <div className={s.bareAct} aria-hidden="true">
        {bare.map((clasa, i) => (
          <span key={i} className={clasa} />
        ))}
      </div>
      {jos}
    </div>
  );
}
