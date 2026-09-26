// Testimonialul (acasa.md §8), cu forma pastrata: cardul inchis, fraza mare, continuarea si
// atribuirea cu bara. Plan §6.3: cat timp nu exista acord scris pentru un citat, `esteCitat` e
// fals, deci nu apare ghilimeaua si nici `blockquote`: e o afirmatie a marcii, atribuita firmei.

import { TESTIMONIAL } from "@/content/acasa";
import Iconita from "@/components/primitive/Iconita";
import Reveal from "@/components/primitive/Reveal";
import s from "./acasa.module.css";

export default function Testimonial() {
  const t = TESTIMONIAL;
  const Fraza = t.esteCitat ? "blockquote" : "div";
  return (
    <section className={s.testimonial}>
      <div className="container-site">
        <Reveal as="figure" className={s.testimonialCard}>
          <Fraza>
            <span className={s.testimonialSemn} aria-hidden="true">
              {t.esteCitat ? "”" : <Iconita nume="archive" marime={26} contur={1.75} />}
            </span>
            <p className={s.testimonialFraza}>{t.fraza}</p>
            <p className={s.testimonialContinuare}>{t.continuare}</p>
          </Fraza>
          <figcaption className={s.testimonialAtribuire}>
            <span className={s.testimonialRol}>{t.atribuire.rol}</span>
            <span className={s.testimonialFirma}>{t.atribuire.firma}</span>
          </figcaption>
        </Reveal>
      </div>
    </section>
  );
}
