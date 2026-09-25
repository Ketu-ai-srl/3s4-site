// Eroul verificatorului de termene (instrumente__termene-pastrare.md §1): doua gradiente radiale
// foarte slabe peste alb, fir de pagina, eticheta-pastila, h1 de 20ch pe 2 randuri si subtitlul,
// care e si primul paragraf din <main> (raspunsul paginii).

import FirPagina from "@/components/primitive/FirPagina";
import { EROU_TERMENE, FIR_TERMENE } from "@/content/termene/date";
import s from "./termene.module.css";

export default function EroulInstrument() {
  return (
    <section className={s.erou}>
      <div className="container-site">
        <div className={s.erouFir}>
          <FirPagina niveluri={FIR_TERMENE} />
        </div>
        <span className={s.erouEticheta}>{EROU_TERMENE.eticheta}</span>
        <h1 className={s.erouTitlu}>{EROU_TERMENE.titlu}</h1>
        <p className={s.erouSubtitlu}>{EROU_TERMENE.subtitlu}</p>
      </div>
    </section>
  );
}
