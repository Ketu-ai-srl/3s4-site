// Legatura cu sageata (componente-globale.md §8.2): 14/600/22,4, albastru, sageata 15 dupa text.
// Hover `albastru-apasat` instant; peste 768 px nu se rupe, sub 768 poate trece pe doua randuri,
// iar sageata ramane la capatul din dreapta, centrata pe verticala.

import type { Legatura } from "@/content/navigatie";
import Iconita from "./Iconita";
import Tinta from "./Tinta";
import s from "./primitive.module.css";

export type LegaturaSageataProps = {
  legatura: Legatura;
  /** Sub 768 px textul se poate rupe, iar legatura ia toata latimea (cardul de securitate). */
  rupeSubTableta?: boolean;
  className?: string;
};

export default function LegaturaSageata({ legatura, rupeSubTableta = false, className }: LegaturaSageataProps) {
  const clase = [s.sageataLeg, rupeSubTableta ? s.sageataLegRupe : "", className ?? ""].filter(Boolean).join(" ");
  return (
    <Tinta legatura={legatura} className={clase}>
      <span>{legatura.text}</span>
      <Iconita nume="arrow-right" marime={15} contur={2} />
    </Tinta>
  );
}
