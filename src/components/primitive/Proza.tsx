// Proza (paginile juridice A si articolele): paragraf 16/28 ardezie-6, h2 24, h3 20, liste cu
// marcatori ardezie-4, legaturi albastre subliniate, `strong` ardezie-9, `hr`, citat. Aceeasi
// masura la 1440 si la 390. Stilul se aplica pe copiii directi si indirecti, deci primeste si
// HTML-ul produs dintr-un fisier MDX.

import type { ReactNode } from "react";
import s from "./bloc.module.css";

export type ProzaProps = {
  children: ReactNode;
  className?: string;
  as?: "div" | "article" | "section";
};

export default function Proza({ children, className, as = "div" }: ProzaProps) {
  const Eticheta = as;
  return <Eticheta className={[s.proza, className ?? ""].filter(Boolean).join(" ")}>{children}</Eticheta>;
}
