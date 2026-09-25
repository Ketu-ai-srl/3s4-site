// Cardul enterprise (acasa.md §10): tot cardul e o legatura (prin `Tinta`, deci inert cat timp
// tinta nu exista). Tinta e `/securitate`, ca pe referinta (plan §6.5). Hover: chenar
// `ardezie-3`, chevronul albastru si 2 px spre dreapta, in 0,18 s.

import { CARD_ENTERPRISE } from "@/content/acasa";
import Iconita from "@/components/primitive/Iconita";
import Pastila from "@/components/primitive/Pastila";
import Tinta from "@/components/primitive/Tinta";
import s from "./acasa.module.css";

export default function CardEnterprise() {
  const c = CARD_ENTERPRISE;
  return (
    <section className={s.enterprise} aria-labelledby="enterprise-titlu">
      <div className="container-site">
        <Tinta legatura={c.tinta} className={s.cardOrizontal + " " + s.enterpriseCard} aria-label={c.tinta.text}>
          <span className={s.cardCutie} aria-hidden="true">
            <Iconita nume="server" marime={20} contur={1.5} />
          </span>
          <span className={s.enterpriseCorp}>
            <span className={s.enterpriseCap}>
              <h2 id="enterprise-titlu" className="t-h3-card">
                {c.titlu}
              </h2>
              <Pastila varianta="categorie">{c.pastila}</Pastila>
            </span>
            <span className={s.enterpriseDescriere}>{c.descriere}</span>
          </span>
          <Iconita nume="chevron-right" marime={16} contur={1.75} className={s.enterpriseChevron} />
        </Tinta>
      </div>
    </section>
  );
}
