// Banda de cifre (acasa.md §6): trei perechi "cifra + eticheta", statice, fara numarare animata.
// Continutul e din `CIFRE` (plan D5: fapte 3S atribuite, nicio cifra de tractiune).

import { Fragment } from "react";
import { CIFRE } from "@/content/acasa";
import s from "./acasa.module.css";

export default function BandaCifre() {
  return (
    <section className={s.cifre}>
      <div className="container-site">
        <p className={s.cifreRand}>
          {CIFRE.map((c, i) => (
            <Fragment key={c.cifra}>
              {i > 0 ? <span className={s.cifreSeparator} aria-hidden="true" /> : null}
              <span>
                <span className={s.cifra}>{c.cifra}</span> {c.eticheta}
              </span>
            </Fragment>
          ))}
        </p>
      </div>
    </section>
  );
}
