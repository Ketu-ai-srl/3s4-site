// Industriile (acasa.md §7): titlu si 7 carduri spre paginile de sector, plus cardul "toate".
// Fiecare card e o legatura prin `Tinta`: pana apare pagina sectorului, cardul ramane cu acelasi
// aspect, dar inert. Sub 640 px cardurile devin compacte (fara descriere, cu chevron).

import { INDUSTRII } from "@/content/acasa";
import Iconita from "@/components/primitive/Iconita";
import Reveal from "@/components/primitive/Reveal";
import Tinta from "@/components/primitive/Tinta";
import s from "./acasa.module.css";

export default function GrilaIndustrii() {
  return (
    <section className={s.industrii} aria-labelledby="industrii-titlu">
      <div className="container-site">
        <Reveal>
          <h2 id="industrii-titlu" className={"t-h2-industrii " + s.industriiTitlu}>
            {INDUSTRII.titlu}
          </h2>
          <ul className={s.industriiGrila}>
            {INDUSTRII.carduri.map((c) => (
              <li key={c.text}>
                <Tinta legatura={c} className={s.industrie}>
                  <span className={s.industrieCutie} aria-hidden="true">
                    <Iconita nume={c.iconita} marime={19} contur={1.75} />
                  </span>
                  <span className={s.industrieText}>
                    <span className={s.industrieNume}>{c.text}</span>
                    <span className={s.industrieDescriere}>{c.descriere}</span>
                  </span>
                  <Iconita nume="chevron-right" marime={14} contur={2} className={s.industrieChevron} />
                </Tinta>
              </li>
            ))}
            <li>
              <Tinta legatura={INDUSTRII.toate} className={s.industrie + " " + s.industrieToate}>
                <span>{INDUSTRII.toate.text}</span>
                <Iconita nume="arrow-right" marime={15} contur={2} />
              </Tinta>
            </li>
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
