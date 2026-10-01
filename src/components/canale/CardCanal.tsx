// Cardul unui canal (pagina de contact, blocurile de final): titlul canalului, o propozitie despre el si
// actiunea (butonul WhatsApp, numarul, adresa cu copiere), primita ca element. Fara actiune, cardul nu se
// randeaza: un canal gol al domeniului nu lasa un card fara nimic de apasat.

import type { ReactNode } from "react";
import s from "./Canale.module.css";

export type CardCanalProps = {
  titlu: string;
  descriere?: string;
  children?: ReactNode;
  className?: string;
};

export default function CardCanal({ titlu, descriere, children, className }: CardCanalProps) {
  if (children === null || children === undefined || children === false) {
    return null;
  }
  return (
    <div className={[s.card, className ?? ""].filter(Boolean).join(" ")} data-card-canal="">
      <h3 className={s.cardTitlu}>{titlu}</h3>
      {descriere ? <p className={s.cardDescriere}>{descriere}</p> : null}
      <div className={s.cardActiune}>{children}</div>
    </div>
  );
}
