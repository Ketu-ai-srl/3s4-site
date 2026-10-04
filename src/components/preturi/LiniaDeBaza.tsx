// Linia de baza (preturi.md §5): inceputul lumii pachetelor. "Inapoi", h2 38,4 (25,6 la 390),
// promisiunea 18/500 max 34ch, paragraful 16/400 max 62ch. Componenta de server: numai legatura
// "inapoi" are nevoie de JavaScript.
//
// PE EDITIE: textul vine prin `continut`, cu implicitul RO; butonul "inapoi" e un slot (`inapoi`), cu
// implicitul butonului RO, fiindca e o insula client montata aici, nu de pagina. Pagina RO nu pasa nimic.

import type { ReactNode } from "react";
import { LINIA_DE_BAZA } from "@/content/preturi";
import ButonInapoi from "./ButonInapoi";
import { ID_TITLU_LUME } from "./constante";
import s from "./lume.module.css";

/** Continutul liniei de baza, pe editie; tip structural, constanta RO (`LINIA_DE_BAZA`) il satisface. */
export type ContinutLiniaDeBaza = { titlu: string; promisiune: string; paragraf: string };

export type LiniaDeBazaProps = {
  continut?: ContinutLiniaDeBaza;
  /** Butonul "inapoi" al editiei (insula client); implicit cel RO. */
  inapoi?: ReactNode;
};

export default function LiniaDeBaza({ continut = LINIA_DE_BAZA, inapoi = <ButonInapoi /> }: LiniaDeBazaProps) {
  return (
    <section className={s.linia} aria-labelledby={ID_TITLU_LUME}>
      <div className="container-site">
        <div className={s.bloc}>
          {inapoi}
          <h2 id={ID_TITLU_LUME} className={"t-h2-baza " + s.titlu} tabIndex={-1}>
            {continut.titlu}
          </h2>
          <p className={s.promisiune}>{continut.promisiune}</p>
          <p className={s.paragraf}>{continut.paragraf}</p>
        </div>
      </div>
    </section>
  );
}
