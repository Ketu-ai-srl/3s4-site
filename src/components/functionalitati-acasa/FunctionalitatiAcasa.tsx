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
// PE EDITIE: continutul vine prin `continut` (implicit constanta RO), iar partea vie prin slotul
// `pasi`: o pagina a altei editii pune acolo invelitoarea ei (client), cu machetele si textele ei.
// Fara slot, randul ramane cel de azi, `PasiFunctionalitati` cu pasii din continut.
//
// FORMA STATICA (HTML-ul servit, miscare redusa) e cea a ciotului, cu aceleasi inaltimi: 2677,6 la
// 1440 x 900 si 2265,6 la 390, aparate de `tests/browser/fundatie-start.spec.ts`. Pista de mobil
// (300lvh, 3059,8 la 390 x 844) apare numai cu JavaScript si fara miscare redusa.

import type { ReactNode } from "react";
import { ANCORE_ACASA, FUNCTIONALITATI, type PasFunctionalitate } from "@/content/acasa";
import type { Legatura } from "@/content/navigatie";
import Buton from "@/components/primitive/Buton";
import Reveal from "@/components/primitive/Reveal";
import PasiFunctionalitati from "./PasiFunctionalitati";
import s from "./FunctionalitatiAcasa.module.css";

/** Continutul sectiunii, pe editie; tip structural, constanta RO (`FUNCTIONALITATI`) il satisface. */
export type ContinutFunctionalitatiAcasa = {
  titlu: string;
  subtitlu: string;
  /** Pasii pentru partea vie implicita; nefolositi cand pagina da slotul `pasi`. */
  pasi?: PasFunctionalitate[];
  final: { fraza: string; buton: Legatura };
};

export type FunctionalitatiAcasaProps = {
  continut?: ContinutFunctionalitatiAcasa;
  /** Ancora sectiunii (pe RO: `functionalitati`). */
  ancora?: string;
  /** Partea vie a editiei (invelitoarea ei); lipsa = `PasiFunctionalitati` cu pasii din continut. */
  pasi?: ReactNode;
};

export default function FunctionalitatiAcasa({
  continut = FUNCTIONALITATI,
  ancora = ANCORE_ACASA.functionalitati,
  pasi,
}: FunctionalitatiAcasaProps) {
  const f = continut;
  return (
    <section
      id={ancora}
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

        {pasi ?? (f.pasi ? <PasiFunctionalitati pasi={f.pasi} /> : null)}

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
