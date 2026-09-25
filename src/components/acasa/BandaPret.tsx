// Banda de pret (acasa.md §11), ancora `#preturi`: plan D3, toate pachetele la 0 RON astazi.

import { ANCORE_ACASA, BANDA_PRET } from "@/content/acasa";
import LegaturaSageata from "@/components/primitive/LegaturaSageata";
import s from "./acasa.module.css";

export default function BandaPret() {
  return (
    <section id={ANCORE_ACASA.preturi} className={s.pret} aria-labelledby="pret-titlu">
      <div className="container-site">
        <div className={s.pretBloc}>
          <h2 id="pret-titlu" className={"t-h2-pret " + s.pretTitlu}>
            {BANDA_PRET.titlu}
          </h2>
          <p className={s.pretFraza}>{BANDA_PRET.fraza}</p>
          <div>
            <LegaturaSageata legatura={BANDA_PRET.legatura} />
          </div>
        </div>
      </div>
    </section>
  );
}
