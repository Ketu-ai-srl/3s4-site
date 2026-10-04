// Ce adauga nivelul enterprise (enterprise.md §3, COMPONENTE §4.7): cap de bloc pe 880, apoi 6
// elemente pe linii `ardezie-2`, titlu 16/600 si text 14/22,4 `ardezie-5` max 62ch. Fara hover.
//
// PE EDITIE: tipul continutului e structural, declarat aici; constanta RO (`LIVRABILE`) il satisface
// fara editare. Alta editie paseaza lista ei (alt numar de elemente e permis).

import CapBloc from "@/components/primitive/CapBloc";
import { LIVRABILE } from "@/content/enterprise";
import s from "./enterprise.module.css";

export type ContinutListaLivrabile = {
  titlu: string;
  text: string;
  elemente: { titlu: string; text: string }[];
};

export default function ListaLivrabile({ continut = LIVRABILE }: { continut?: ContinutListaLivrabile }) {
  const l = continut;
  return (
    <section className={s.livrabile} aria-labelledby="livrabile-titlu">
      <div className="container-site">
        <div className={s.bloc}>
          <CapBloc titlu={l.titlu} text={l.text} marimeText={16} margineJos={0} id="livrabile-titlu" />
          <ul className={s.listaLivrabile}>
            {l.elemente.map((e) => (
              <li key={e.titlu} className={s.livrabil}>
                <h3 className={s.livrabilTitlu}>{e.titlu}</h3>
                <p className={s.livrabilText}>{e.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
