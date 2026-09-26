// S2 al paginii de sector (solutii__sablon.md): h2 + subtitlu, apoi sina verticala cu 3 momente.
// Fiecare moment: numarul 01-03 si linia de 1 px pana la numarul urmator, eticheta de timp, h3,
// paragraful si cipul documentului (numele fisierului in mono si starea problemei). Static, fara
// legaturi si fara aparitie animata, ca la referinta.

import CapBloc from "@/components/primitive/CapBloc";
import type { Moment } from "@/content/solutii/tipuri";
import IconitaSolutii from "./IconitaSolutii";
import s from "./solutii.module.css";

export type SinaMomenteProps = {
  titlu: string;
  subtitlu: string;
  momente: Moment[];
};

export function CipDocument({ fisier, problema }: { fisier: string; problema: string }) {
  return (
    <span className={s.cip} data-cip-document="">
      <IconitaSolutii nume="file" marime={14} contur={1.5} className={s.cipIconita} />
      <span className={s.cipFisier}>{fisier}</span>
      <span className={s.cipProblema}>{problema}</span>
    </span>
  );
}

export default function SinaMomente({ titlu, subtitlu, momente }: SinaMomenteProps) {
  return (
    <section className={s.sectiune}>
      <div className="container-site">
        <div className={s.coloana}>
          <CapBloc titlu={titlu} text={subtitlu} marimeText={16} margineJos={32} />
          <ol className={s.sina}>
            {momente.map((m, i) => (
              <li key={m.titlu} className={s.moment}>
                <div className={s.marker} aria-hidden="true">
                  <span className={s.numar}>{String(i + 1).padStart(2, "0")}</span>
                  <span className={s.linieSina} />
                </div>
                <div className={s.corpMoment}>
                  <p className={s.eticheta}>{m.eticheta}</p>
                  <h3 className={"t-h3-moment " + s.titluMoment}>{m.titlu}</h3>
                  <p className={s.textMoment}>{m.text}</p>
                  <CipDocument fisier={m.fisier} problema={m.problema} />
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
