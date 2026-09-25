// Linia de baza (preturi.md §5): inceputul lumii pachetelor. "Inapoi", h2 38,4 (25,6 la 390),
// promisiunea 18/500 max 34ch, paragraful 16/400 max 62ch. Componenta de server: numai legatura
// "inapoi" are nevoie de JavaScript.

import { LINIA_DE_BAZA } from "@/content/preturi";
import ButonInapoi from "./ButonInapoi";
import { ID_TITLU_LUME } from "./constante";
import s from "./lume.module.css";

export default function LiniaDeBaza() {
  return (
    <section className={s.linia} aria-labelledby={ID_TITLU_LUME}>
      <div className="container-site">
        <div className={s.bloc}>
          <ButonInapoi />
          <h2 id={ID_TITLU_LUME} className={"t-h2-baza " + s.titlu} tabIndex={-1}>
            {LINIA_DE_BAZA.titlu}
          </h2>
          <p className={s.promisiune}>{LINIA_DE_BAZA.promisiune}</p>
          <p className={s.paragraf}>{LINIA_DE_BAZA.paragraf}</p>
        </div>
      </div>
    </section>
  );
}
