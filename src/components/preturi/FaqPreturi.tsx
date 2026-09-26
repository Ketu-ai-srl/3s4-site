// Intrebarile despre preturi (preturi.md §8): h2 de bloc, subtitlu, 7 intrebari pe acordeonul
// `preturi` (piesa inghetata: exclusiv, deschidere instantanee, chevron 20 in 0,3 s). Aceleasi
// intrebari, cu aceleasi raspunsuri, sunt si in datele structurate ale paginii (`FAQPage`).

import Acordeon from "@/components/primitive/Acordeon";
import { ANCORE_PRETURI, INTREBARI_PRETURI } from "@/content/preturi";
import s from "./lume.module.css";

export default function FaqPreturi() {
  const q = INTREBARI_PRETURI;
  return (
    <section id={ANCORE_PRETURI.intrebari} className={s.intrebari} aria-labelledby="intrebari-preturi-titlu">
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
