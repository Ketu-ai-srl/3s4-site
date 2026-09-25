// Pastila (componente-globale.md §8.3, acasa-erou.md §1.3): raza 9999, patru variante.
//   categorie - 12/500 violet, chenar ardezie-2 ("Enterprise")
//   erou      - 12,8/500 cerneala-2, chenar linie, iconita 14 albastru (minim 11 px sub 768)
//   insigna   - 12,8/500 ardezie-6 pe alb (varianta `mare`: 14/500)
//   stare     - punct de 6 px: plin, jumatate sau gol

import type { ReactNode } from "react";
import Iconita from "./Iconita";
import s from "./primitive.module.css";

export type PastilaProps = {
  varianta: "categorie" | "erou" | "insigna" | "stare";
  children: ReactNode;
  iconita?: string;
  /** Pentru `insigna`: treapta mare (14/500, 32 px). */
  mare?: boolean;
  /** Pentru `stare`: umplerea punctului. */
  punct?: "plin" | "jumatate" | "gol";
  className?: string;
};

export function clasePastila(varianta: PastilaProps["varianta"], mare = false): string {
  const clase = [s.pastila];
  if (varianta === "categorie") clase.push(s.pastilaCategorie);
  if (varianta === "erou") clase.push(s.pastilaErou);
  if (varianta === "insigna") clase.push(s.pastilaInsigna, mare ? s.pastilaInsignaMare : "");
  if (varianta === "stare") clase.push(s.pastilaStare);
  return clase.filter(Boolean).join(" ");
}

export default function Pastila({ varianta, children, iconita, mare = false, punct = "plin", className }: PastilaProps) {
  const clase = [clasePastila(varianta, mare), className ?? ""].filter(Boolean).join(" ");
  const clasaPunct = [s.punct, punct === "plin" ? s.punctPlin : punct === "jumatate" ? s.punctJumatate : ""]
    .filter(Boolean)
    .join(" ");
  return (
    <span className={clase}>
      {varianta === "stare" ? <span className={clasaPunct} aria-hidden="true" /> : null}
      {iconita ? <Iconita nume={iconita} marime={14} contur={2} /> : null}
      <span>{children}</span>
    </span>
  );
}
