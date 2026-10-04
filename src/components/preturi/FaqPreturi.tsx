// Intrebarile despre preturi (preturi.md §8): h2 de bloc, subtitlu, 7 intrebari pe acordeonul
// `preturi` (piesa inghetata: exclusiv, deschidere instantanee, chevron 20 in 0,3 s). Aceleasi
// intrebari, cu aceleasi raspunsuri, sunt si in datele structurate ale paginii (`FAQPage`).
//
// PE EDITIE: intrebarile si ancora vin prin proprietati, cu implicitul RO; pagina RO nu pasa nimic.

import Acordeon from "@/components/primitive/Acordeon";
import { ANCORE_PRETURI, INTREBARI_PRETURI, type IntrebarePret } from "@/content/preturi";
import s from "./lume.module.css";

/** Continutul intrebarilor, pe editie; tip structural, constanta RO (`INTREBARI_PRETURI`) il satisface. */
export type ContinutFaqPreturi = { titlu: string; subtitlu: string; intrebari: IntrebarePret[] };

export type FaqPreturiProps = {
  continut?: ContinutFaqPreturi;
  /** Ancora sectiunii (pe RO: `intrebari-preturi`). */
  ancora?: string;
};

export default function FaqPreturi({ continut = INTREBARI_PRETURI, ancora = ANCORE_PRETURI.intrebari }: FaqPreturiProps) {
  const q = continut;
  return (
    <section id={ancora} className={s.intrebari} aria-labelledby="intrebari-preturi-titlu">
      <div className="container-site">
        <div className={s.bloc}>
          <h2 id="intrebari-preturi-titlu" className={"t-h2-bloc " + s.intrebariTitlu}>
            {q.titlu}
          </h2>
          <p className={s.intrebariSubtitlu}>{q.subtitlu}</p>
          <div className={s.intrebariLista}>
            <Acordeon
              varianta="preturi"
              elemente={q.intrebari.map((i) => ({ intrebare: i.intrebare, raspuns: <p>{i.raspuns}</p> }))}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
