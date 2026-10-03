// Banda de pret (acasa.md §11), ancora `#preturi`: plan D3, toate pachetele la 0 RON astazi.

import { ANCORE_ACASA, BANDA_PRET } from "@/content/acasa";
import type { Legatura } from "@/content/navigatie";
import LegaturaSageata from "@/components/primitive/LegaturaSageata";
import s from "./acasa.module.css";

/** Continutul benzii, pe editie; tip structural, constanta RO (`BANDA_PRET`) il satisface. */
export type ContinutBandaPret = { titlu: string; fraza: string; legatura: Legatura };

export type BandaPretProps = {
  continut?: ContinutBandaPret;
  /** Ancora sectiunii (pe RO: `preturi`). */
  ancora?: string;
};

export default function BandaPret({ continut = BANDA_PRET, ancora = ANCORE_ACASA.preturi }: BandaPretProps) {
  return (
    <section id={ancora} className={s.pret} aria-labelledby="pret-titlu">
      <div className="container-site">
        <div className={s.pretBloc}>
          <h2 id="pret-titlu" className={"t-h2-pret " + s.pretTitlu}>
            {continut.titlu}
          </h2>
          <p className={s.pretFraza}>{continut.fraza}</p>
          <div>
            <LegaturaSageata legatura={continut.legatura} />
          </div>
        </div>
      </div>
    </section>
  );
}
