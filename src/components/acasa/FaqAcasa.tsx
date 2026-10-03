// Intrebarile de pe start (acasa.md §12), ancora `#intrebari`: titlul si cardul, fiecare cu
// aparitie la derulare, acordeonul in varianta `start` (prima intrebare deschisa, una singura),
// apoi fraza cu adresa de posta.

import { ANCORE_ACASA, INTREBARI } from "@/content/acasa";
import type { Legatura } from "@/content/navigatie";
import Acordeon from "@/components/primitive/Acordeon";
import Reveal from "@/components/primitive/Reveal";
import Tinta from "@/components/primitive/Tinta";
import s from "./acasa.module.css";

/** Continutul intrebarilor, pe editie; tip structural, constanta RO (`INTREBARI`) il satisface. */
export type ContinutFaqAcasa = {
  titlu: string;
  intrebari: { intrebare: string; raspuns: string }[];
  /** Fraza de sub card: `inainte` + adresa de posta ca legatura. */
  subsol: { inainte: string; posta: Legatura };
};

export type FaqAcasaProps = {
  continut?: ContinutFaqAcasa;
  /** Ancora sectiunii (pe RO: `intrebari`). */
  ancora?: string;
};

export default function FaqAcasa({ continut = INTREBARI, ancora = ANCORE_ACASA.intrebari }: FaqAcasaProps) {
  const c = continut;
  return (
    <section id={ancora} className="sectiune-standard" aria-labelledby="intrebari-titlu">
      <div className="container-site">
        <Reveal>
          <h2 id="intrebari-titlu" className={"t-h2-sectiune " + s.intrebariTitlu}>
            {c.titlu}
          </h2>
        </Reveal>
        <Reveal>
          <Acordeon
            varianta="start"
            elemente={c.intrebari.map((i) => ({ intrebare: i.intrebare, raspuns: i.raspuns }))}
          />
        </Reveal>
        <p className={s.intrebariSubsol}>
          {c.subsol.inainte}{" "}
          <Tinta legatura={c.subsol.posta} className={s.intrebariPosta}>
            {c.subsol.posta.text}
          </Tinta>
        </p>
      </div>
    </section>
  );
}
