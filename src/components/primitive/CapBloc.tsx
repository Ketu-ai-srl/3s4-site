// Capul de bloc (paginile interioare pe coloana de 880): h2 28/600 (21,6 sub 768) ardezie-9 cu
// margine jos 10, apoi un paragraf ardezie-5, max 640, de 16/25,6 sau 18/28,8. La stanga.

import type { ReactNode } from "react";
import s from "./primitive.module.css";

export type CapBlocProps = {
  titlu: ReactNode;
  text?: ReactNode;
  marimeText?: 16 | 18;
  /** Distanta pana la continut, in px (20 pe e-facturare, 28 pe comparatii). */
  margineJos?: number;
  id?: string;
  className?: string;
};

export default function CapBloc({ titlu, text, marimeText = 18, margineJos = 20, id, className }: CapBlocProps) {
  return (
    <header className={[s.capBloc, className ?? ""].filter(Boolean).join(" ")} style={{ marginBottom: margineJos }}>
      <h2 id={id} className={"t-h2-bloc " + s.capBlocTitlu}>
        {titlu}
      </h2>
      {text ? (
        <p className={[s.capBlocText, marimeText === 16 ? s.capBlocText16 : s.capBlocText18].join(" ")}>{text}</p>
      ) : null}
    </header>
  );
}
