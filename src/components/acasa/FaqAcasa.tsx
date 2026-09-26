// Intrebarile de pe start (acasa.md §12), ancora `#intrebari`: titlul si cardul, fiecare cu
// aparitie la derulare, acordeonul in varianta `start` (prima intrebare deschisa, una singura),
// apoi fraza cu adresa de posta.

import { ANCORE_ACASA, INTREBARI } from "@/content/acasa";
import Acordeon from "@/components/primitive/Acordeon";
import Reveal from "@/components/primitive/Reveal";
import Tinta from "@/components/primitive/Tinta";
import s from "./acasa.module.css";

export default function FaqAcasa() {
  return (
    <section id={ANCORE_ACASA.intrebari} className="sectiune-standard" aria-labelledby="intrebari-titlu">
      <div className="container-site">
        <Reveal>
          <h2 id="intrebari-titlu" className={"t-h2-sectiune " + s.intrebariTitlu}>
            {INTREBARI.titlu}
          </h2>
        </Reveal>
        <Reveal>
          <Acordeon
            varianta="start"
            elemente={INTREBARI.intrebari.map((i) => ({ intrebare: i.intrebare, raspuns: i.raspuns }))}
          />
        </Reveal>
        <p className={s.intrebariSubsol}>
          {INTREBARI.subsol.inainte}{" "}
          <Tinta legatura={INTREBARI.subsol.posta} className={s.intrebariPosta}>
            {INTREBARI.subsol.posta.text}
          </Tinta>
        </p>
      </div>
    </section>
  );
}
