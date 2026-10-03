// Cardul de securitate (acasa.md §9): card orizontal de 1100, cutie cu scut, titlu si text la
// stanga, legatura-sageata la dreapta. Sub 768 px trece pe coloana, iar legatura se poate rupe.

import { CARD_SECURITATE } from "@/content/acasa";
import type { Legatura } from "@/content/navigatie";
import Iconita from "@/components/primitive/Iconita";
import LegaturaSageata from "@/components/primitive/LegaturaSageata";
import s from "./acasa.module.css";

/** Continutul cardului, pe editie; tip structural, constanta RO (`CARD_SECURITATE`) il satisface. */
export type ContinutCardSecuritate = { titlu: string; text: string; legatura: Legatura };

export default function CardSecuritate({ continut = CARD_SECURITATE }: { continut?: ContinutCardSecuritate }) {
  const c = continut;
  return (
    <section className={s.securitate} aria-labelledby="securitate-titlu">
      <div className="container-site">
        <div className={s.cardOrizontal + " " + s.securitateCard}>
          <div className={s.cardStanga}>
            <span className={s.cardCutie} aria-hidden="true">
              <Iconita nume="shield" marime={20} contur={1.5} />
            </span>
            <div>
              <h2 id="securitate-titlu" className={"t-h3-card " + s.cardTitlu}>
                {c.titlu}
              </h2>
              <p className={s.cardText}>{c.text}</p>
            </div>
          </div>
          <LegaturaSageata legatura={c.legatura} rupeSubTableta className={s.cardLegatura} />
        </div>
      </div>
    </section>
  );
}
