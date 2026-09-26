// Macheta de cautare comuna celor doua demo-uri (solutii__sablon.md S4, solutii.md S3): bara cu lupa,
// textul tastat si cursorul, scheletul cu stralucire si rezultatul (capul cu fisierul, locul si
// pastila de potrivire, apoi fragmentul cu doi termeni evidentiati).
//
// INALTIMEA E REZERVATA (abaterea de la referinta, COMPONENTE.md §5.4): toate interogarile si toate
// rezultatele stau in DOM, suprapuse in aceeasi celula de grila, iar cele care nu se vad au
// `visibility: hidden`. Celula are deci inaltimea celui mai inalt rezultat si a celei mai lungi
// interogari, oricare ar fi faza: la referinta cardul crestea cu 47 px la fiecare rezultat (si inca o
// data la 390, cand interogarea trecea pe doua randuri). Scheletul sta sus in aceeasi celula.
//
// Macheta e decorativa pentru cititoarele de ecran (`aria-hidden`); componenta care o foloseste pune
// langa ea o descriere statica a exemplului.

import { FileText, Search } from "lucide-react";
import { segmenteFragment, type ExempluCautare } from "@/content/solutii/tipuri";
import s from "./demo.module.css";

/** Fazele demo-ului: `final` e starea statica (HTML servit, miscare redusa). */
export type FazaCautare = "final" | "gol" | "tastare" | "gata" | "rezultat";

export type CautareMachetaProps = {
  exemple: ExempluCautare[];
  activ: number;
  faza: FazaCautare;
  /** Cate caractere din interogarea activa se vad (in `tastare`). */
  tastat: number;
};

export default function CautareMacheta({ exemple, activ, faza, tastat }: CautareMachetaProps) {
  const curent = exemple[activ];
  const textTastat =
    faza === "final" || faza === "gata" || faza === "rezultat"
      ? curent.interogare
      : faza === "tastare"
        ? curent.interogare.slice(0, tastat)
        : "";
  const cuRezultat = faza === "final" || faza === "rezultat";
  const cursorGata = faza === "gata" || faza === "rezultat" || faza === "final";

  return (
    <div className={s.macheta} aria-hidden="true" data-faza={faza}>
      <div className={s.bara}>
        <Search className={s.lupa} width={18} height={18} strokeWidth={2} focusable="false" />
        <div className={s.stiva}>
          {exemple.map((e, i) => (
            <span key={"r" + i} className={s.rezerva}>
              {e.interogare}
            </span>
          ))}
          <span className={s.tastat} data-tastat="">
            {textTastat}
            <span className={[s.cursor, cursorGata ? s.cursorGata : ""].filter(Boolean).join(" ")} />
          </span>
        </div>
      </div>
      <div className={s.stiva}>
        {exemple.map((e, i) => {
          const vizibil = cuRezultat && i === activ;
          return (
            <div
              key={"z" + i}
              className={[s.rezultat, vizibil ? s.rezultatVizibil : "", faza === "final" ? s.faraAparitie : ""]
                .filter(Boolean)
                .join(" ")}
              data-rezultat={vizibil ? "vizibil" : "ascuns"}
            >
              <div className={s.cap}>
                <span className={s.patrat}>
                  <FileText width={18} height={18} strokeWidth={1.5} focusable="false" />
                </span>
                <span className={s.capText}>
                  <span className={s.fisier}>{e.rezultat.fisier}</span>
                  <span className={s.loc}>{e.rezultat.loc}</span>
                </span>
                <span className={s.potrivire}>
                  <span className={s.punctVerde} />
                  {e.rezultat.potrivire}
                </span>
              </div>
              <p className={s.fragment}>
                {segmenteFragment(e.rezultat.fragment).map((seg, k) =>
                  seg.evidentiat ? <mark key={k}>{seg.text}</mark> : <span key={k}>{seg.text}</span>,
                )}
              </p>
            </div>
          );
        })}
        {cuRezultat ? null : (
          <div className={s.schelet} data-schelet="">
            <span className={s.linie} style={{ width: "80%" }} />
            <span className={s.linie} style={{ width: "95%" }} />
            <span className={s.linie} style={{ width: "70%" }} />
          </div>
        )}
      </div>
    </div>
  );
}
