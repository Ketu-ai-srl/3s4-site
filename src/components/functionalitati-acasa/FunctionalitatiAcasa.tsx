// Functionalitatile de pe start, in derulare lipita cu 3 pasi (acasa-functionalitati.md), felia
// `functionalitati-acasa` (S4-2). Inlocuieste ciotul feliei `fundatie` la aceeasi cale; ancora
// (`ANCORE_ACASA.functionalitati`) si marcajul `data-ciot` raman, ca antetul si probele de start sa
// gaseasca sectiunea ca inainte.
//
// Ce sta aici, pe server: antetul sectiunii si fraza de iesire, cu aparitia comuna. Partea vie
// (pasii, cardul lipit, machetele, panza 3D, pista de mobil) e in `PasiFunctionalitati.tsx`.
// Textele pasilor vin din contractul startului (`src/content/acasa.ts`); textele machetelor, din
// `src/content/acasa-functionalitati.ts`.
//
// FORMA STATICA (HTML-ul servit, miscare redusa) e cea a ciotului, cu aceleasi inaltimi: 2677,6 la
// 1440 x 900 si 2265,6 la 390, aparate de `tests/browser/fundatie-start.spec.ts`. Pista de mobil
// (300lvh, 3059,8 la 390 x 844) apare numai cu JavaScript si fara miscare redusa.

import { ANCORE_ACASA, FUNCTIONALITATI } from "@/content/acasa";
import Buton from "@/components/primitive/Buton";
import Reveal from "@/components/primitive/Reveal";
import PasiFunctionalitati from "./PasiFunctionalitati";
import s from "./FunctionalitatiAcasa.module.css";

export default function FunctionalitatiAcasa() {
  const f = FUNCTIONALITATI;
  return (
    <section
      id={ANCORE_ACASA.functionalitati}
      className={s.sectiune}
      aria-labelledby="functionalitati-titlu"
      data-ciot="functionalitati"
    >
      <div className="container-site">
        <Reveal as="header" className={s.cap}>
          <h2 id="functionalitati-titlu" className={"t-h2-sectiune " + s.titlu}>
            {f.titlu}
          </h2>
          <p className={"t-subtitlu-sectiune " + s.subtitlu}>{f.subtitlu}</p>
        </Reveal>

        <PasiFunctionalitati pasi={f.pasi} />

        <Reveal className={s.final}>
          <p className={s.fraza}>{f.final.fraza}</p>
          <Buton varianta="contur-albastru" marime="mare" sageata legatura={f.final.buton}>
            {f.final.buton.text}
          </Buton>
        </Reveal>
      </div>
    </section>
  );
}
