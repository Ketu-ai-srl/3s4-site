// Cardul standard: alb, chenar 1 ardezie-2, raza 16, umbra de fir, padding 24, fara hover.
// Variante: `evidentiat` (chenar albastru, "cardul nostru"), `gri` (ardezie-0, fara umbra),
// `hover` (chenar ardezie-3 sau albastru la trecere, numai cand cardul e legatura).

import type { ReactNode } from "react";
import type { Legatura } from "@/content/navigatie";
import Tinta from "./Tinta";
import s from "./primitive.module.css";

export type CardProps = {
  children: ReactNode;
  varianta?: "standard" | "evidentiat" | "gri";
  /** Cand e dat, tot cardul e legatura (prin Tinta: inert daca tinta lipseste). */
  legatura?: Legatura;
  hover?: "ardezie" | "albastru";
  as?: "div" | "article" | "li" | "section";
  className?: string;
};

export default function Card({ children, varianta = "standard", legatura, hover, as = "div", className }: CardProps) {
  const clase = [
    s.card,
    varianta === "evidentiat" ? s.cardEvidentiat : "",
    varianta === "gri" ? s.cardGri : "",
    hover ? s.cardHover : "",
    hover === "albastru" ? s.cardHoverAlbastru : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");
  if (legatura) {
    return (
      <Tinta legatura={legatura} className={clase}>
        {children}
      </Tinta>
    );
  }
  const Eticheta = as;
  return <Eticheta className={clase}>{children}</Eticheta>;
}
