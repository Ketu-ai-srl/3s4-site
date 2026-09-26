// S5 al paginii de sector (solutii__sablon.md): h2 si doua carduri de aceeasi inaltime. „Inainte”
// pe `ardezie-0`, fara umbra, cu liniuta gri; „dupa” alb, cu umbra de fir si bifa albastra.
// Iconitele de 14, contur 2, coborate 2 px pe linia de baza. Static.

import CapBloc from "@/components/primitive/CapBloc";
import IconitaSolutii from "./IconitaSolutii";
import s from "./solutii.module.css";

export type InainteDupaProps = {
  titlu: string;
  etichete: { inainte: string; dupa: string };
  inainte: string[];
  dupa: string[];
};

export default function InainteDupa({ titlu, etichete, inainte, dupa }: InainteDupaProps) {
  return (
    <section className={s.sectiune}>
      <div className="container-site">
        <div className={s.coloana}>
          <CapBloc titlu={titlu} margineJos={28} />
          <div className={s.inainteDupa}>
            <div className={s.cardInainte}>
              <p className={s.etichetaCard}>{etichete.inainte}</p>
              <ul className={s.randuri}>
                {inainte.map((r) => (
                  <li key={r} className={s.rand}>
                    <IconitaSolutii nume="minus" marime={14} contur={2} className={s.liniuta} />
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className={s.cardDupa}>
              <p className={s.etichetaCard}>{etichete.dupa}</p>
              <ul className={s.randuri}>
                {dupa.map((r) => (
                  <li key={r} className={s.rand}>
                    <IconitaSolutii nume="check" marime={14} contur={2} className={s.bifaDupa} />
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
