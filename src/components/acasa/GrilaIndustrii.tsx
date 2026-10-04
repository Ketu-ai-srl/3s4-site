// Industriile (acasa.md §7): titlu si 7 carduri spre paginile de sector, plus cardul "toate".
// Fiecare card e o legatura prin `Tinta`: pana apare pagina sectorului, cardul ramane cu acelasi
// aspect, dar inert. Sub 640 px cardurile devin compacte (fara descriere, cu chevron).
//
// PE EDITIE: continutul vine prin `continut` (implicit constanta RO). Tipul e structural, declarat
// aici: legatura unui card e optionala. Un card fara legatura (pe o editie fara paginile de sector)
// se randeaza ca element simplu, fara chevron, ca sa nu para ca se poate deschide. Pe RO fiecare card
// are legatura, deci ramura da acelasi DOM.

import { INDUSTRII } from "@/content/acasa";
import type { Legatura, NumeIconita } from "@/content/navigatie";
import Iconita from "@/components/primitive/Iconita";
import Reveal from "@/components/primitive/Reveal";
import Tinta from "@/components/primitive/Tinta";
import s from "./acasa.module.css";

/** Un card: numele (`text`), descrierea si iconita; `href` si `ruta` numai cand cardul duce undeva. */
export type CardGrilaIndustrii = {
  text: string;
  descriere: string;
  iconita: NumeIconita;
  href?: string | null;
  ruta?: string | null;
};

/** Continutul grilei, pe editie; tip structural, constanta RO (`INDUSTRII`) il satisface. */
export type ContinutGrilaIndustrii = {
  titlu: string;
  carduri: CardGrilaIndustrii[];
  toate: Legatura;
};

export default function GrilaIndustrii({ continut = INDUSTRII }: { continut?: ContinutGrilaIndustrii }) {
  const c = continut;
  return (
    <section className={s.industrii} aria-labelledby="industrii-titlu">
      <div className="container-site">
        <Reveal>
          <h2 id="industrii-titlu" className={"t-h2-industrii " + s.industriiTitlu}>
            {c.titlu}
          </h2>
          <ul className={s.industriiGrila}>
            {c.carduri.map((card) => {
              const interior = (
                <>
                  <span className={s.industrieCutie} aria-hidden="true">
                    <Iconita nume={card.iconita} marime={19} contur={1.75} />
                  </span>
                  <span className={s.industrieText}>
                    <span className={s.industrieNume}>{card.text}</span>
                    <span className={s.industrieDescriere}>{card.descriere}</span>
                  </span>
                </>
              );
              return (
                <li key={card.text}>
                  {card.href === undefined ? (
                    <span className={s.industrie}>{interior}</span>
                  ) : (
                    <Tinta legatura={{ text: card.text, href: card.href, ruta: card.ruta ?? null }} className={s.industrie}>
                      {interior}
                      <Iconita nume="chevron-right" marime={14} contur={2} className={s.industrieChevron} />
                    </Tinta>
                  )}
                </li>
              );
            })}
            <li>
              <Tinta legatura={c.toate} className={s.industrie + " " + s.industrieToate}>
                <span>{c.toate.text}</span>
                <Iconita nume="arrow-right" marime={15} contur={2} />
              </Tinta>
            </li>
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
