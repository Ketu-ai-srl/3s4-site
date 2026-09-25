// Legatura in linie (platforma, e-facturare, verificatorul de termene): inline-flex, 16/500
// albastru, sageata 14 dupa text, gap 5,6; hover subliniere. Sageata nu se strange
// (`flex-shrink: 0`): la referinta se ingusta la 10-13 px la 390, defect care nu se copiaza.

import type { Legatura } from "@/content/navigatie";
import Iconita from "./Iconita";
import Tinta from "./Tinta";
import s from "./primitive.module.css";

export type LegaturaInTextProps = {
  legatura: Legatura;
  /** Treapta de marime: 16 (implicit), 16,8, 14,08 sau 14 in note. */
  marime?: 16 | 16.8 | 14.08 | 14;
  className?: string;
};

const TREPTE: Record<number, string> = {
  16: "",
  16.8: s.inText168,
  14.08: s.inText1408,
  14: s.inText14,
};

export default function LegaturaInText({ legatura, marime = 16, className }: LegaturaInTextProps) {
  const clase = [s.inText, TREPTE[marime], className ?? ""].filter(Boolean).join(" ");
  return (
    <Tinta legatura={legatura} className={clase}>
      <span>{legatura.text}</span>
      <Iconita nume="arrow-right" marime={14} contur={2} />
    </Tinta>
  );
}
