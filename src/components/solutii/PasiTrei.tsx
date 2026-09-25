// S4 al paginii de sector (solutii__sablon.md): h2, grila de 3 pasi (3 x 280, gap 20; o coloana sub
// 768) cu cercul numerotat, h3 si paragraf, apoi cardul cu cautarea „in direct” (piesa client).

import CapBloc from "@/components/primitive/CapBloc";
import type { ExempluCautare, Pas } from "@/content/solutii/tipuri";
import DemoCautare from "./DemoCautare";
import s from "./solutii.module.css";

export type PasiTreiProps = {
  titlu: string;
  pasi: Pas[];
  etichetaDemo: string;
  demo: ExempluCautare;
};

export default function PasiTrei({ titlu, pasi, etichetaDemo, demo }: PasiTreiProps) {
  return (
    <section className={s.sectiune}>
      <div className="container-site">
        <div className={s.coloana}>
          <CapBloc titlu={titlu} margineJos={28} />
          <ol className={s.pasi}>
            {pasi.map((p, i) => (
              <li key={p.titlu}>
                <span className={s.cerc} aria-hidden="true">
                  {i + 1}
                </span>
                <h3 className={"t-h3-card " + s.titluPas}>{p.titlu}</h3>
                <p className={s.textPas}>{p.text}</p>
              </li>
            ))}
          </ol>
          <DemoCautare eticheta={etichetaDemo} exemplu={demo} />
        </div>
      </div>
    </section>
  );
}
