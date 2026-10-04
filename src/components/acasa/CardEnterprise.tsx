// Cardul enterprise (acasa.md §10): tot cardul e o legatura (prin `Tinta`, deci inert cat timp
// tinta nu exista). Tinta e `/securitate`, ca pe referinta (plan §6.5). Hover: chenar
// `ardezie-3`, chevronul albastru si 2 px spre dreapta, in 0,18 s.
//
// PE EDITIE: continutul vine prin `continut` (implicit constanta RO); tipul e structural, declarat aici,
// iar constanta RO il satisface fara editare.

import { CARD_ENTERPRISE } from "@/content/acasa";
import type { Legatura } from "@/content/navigatie";
import Iconita from "@/components/primitive/Iconita";
import Pastila from "@/components/primitive/Pastila";
import Tinta from "@/components/primitive/Tinta";
import s from "./acasa.module.css";

/** Continutul cardului, pe editie: titlu, pastila, descriere si tinta (tot cardul e legatura). */
export type ContinutCardEnterprise = { titlu: string; pastila: string; descriere: string; tinta: Legatura };

export default function CardEnterprise({ continut = CARD_ENTERPRISE }: { continut?: ContinutCardEnterprise }) {
  const c = continut;
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
