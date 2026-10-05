// Eroul verificatorului de termene (instrumente__termene-pastrare.md §1): doua gradiente radiale
// foarte slabe peste alb, fir de pagina, eticheta-pastila, h1 de 20ch pe 2 randuri si subtitlul,
// care e si primul paragraf din <main> (raspunsul paginii).
//
// PE EDITIE: textele vin prin `continut`, cu implicitul romanesc (pagina RO nu paseaza nimic, deci
// randeaza ce randa). Eticheta accesibila a firului e optionala: lipsa = implicitul din `FirPagina`.

import FirPagina, { type NivelFir } from "@/components/primitive/FirPagina";
import { EROU_TERMENE, FIR_TERMENE } from "@/content/termene/date";
import s from "./termene.module.css";

export type ContinutEroulInstrument = {
  fir: NivelFir[];
  /** Eticheta accesibila a firului, in limba editiei. */
  etichetaFir?: string;
  eticheta: string;
  titlu: string;
  subtitlu: string;
};

const IMPLICIT: ContinutEroulInstrument = { fir: FIR_TERMENE, ...EROU_TERMENE };

export default function EroulInstrument({ continut = IMPLICIT }: { continut?: ContinutEroulInstrument }) {
  const c = continut;
  return (
    <section className={s.erou}>
      <div className="container-site">
        <div className={s.erouFir}>
          <FirPagina niveluri={c.fir} {...(c.etichetaFir !== undefined ? { eticheta: c.etichetaFir } : {})} />
        </div>
        <span className={s.erouEticheta}>{c.eticheta}</span>
        <h1 className={s.erouTitlu}>{c.titlu}</h1>
        <p className={s.erouSubtitlu}>{c.subtitlu}</p>
      </div>
    </section>
  );
}
