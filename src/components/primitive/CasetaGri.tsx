// Caseta gri: ardezie-0, chenar 1 ardezie-2, raza 16, padding 24 (32 cu `mare`); varianta
// `rezolvare` are linia din stanga de 3 px albastru.

import type { ReactNode } from "react";
import s from "./primitive.module.css";

export type CasetaGriProps = {
  children: ReactNode;
  mare?: boolean;
  rezolvare?: boolean;
  className?: string;
};

export default function CasetaGri({ children, mare = false, rezolvare = false, className }: CasetaGriProps) {
  const clase = [s.caseta, mare ? s.casetaMare : "", rezolvare ? s.casetaRezolvare : "", className ?? ""]
    .filter(Boolean)
    .join(" ");
  return <div className={clase}>{children}</div>;
}
