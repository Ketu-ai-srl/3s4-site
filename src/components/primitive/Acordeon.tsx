"use client";

// Acordeonul, cu cele sase variante masurate pe referinta (DIRECTIA.md, "Variantele acordeonului").
//
//   start       card 780; prima deschisa; una singura; randul grilei 0fr -> 1fr in 0,35 s  (/)
//   sector      randuri de 880 cu chenar; una singura; raspunsul apare in 0,25 s           (sectoare, hub)
//   preturi     randuri pe linii; exclusiv; deschidere instanta; chevron 20 in 0,3 s       (/preturi)
//   platforma   `details`, toate inchise, independente, instant; chevron 0,2 s             (/platforma)
//   securitate  `details`, primul deschis, independente; chevron albastru cand e deschis   (/securitate)
//   e-facturare `details`, independente; chevron 0,15 s                                   (/e-facturare)
//
// La 3S miscarea redusa opreste si animatia raspunsului (la referinta startul o pastra): regula
// globala din `globals.css` aduce toate duratele la zero.
//
// Intrebarea sta intr-un titlu (`h3` implicit), iar butonul poarta `aria-expanded` si
// `aria-controls`: forma din modelul de acordeon ARIA, care la referinta lipsea.

import { useId, useState, type ReactNode } from "react";
import Iconita from "./Iconita";
import s from "./Acordeon.module.css";

export type ElementAcordeon = {
  intrebare: string;
  raspuns: ReactNode;
};

export type VariantaAcordeon = "start" | "sector" | "preturi" | "platforma" | "securitate" | "e-facturare";

export type AcordeonProps = {
  varianta: VariantaAcordeon;
  elemente: ElementAcordeon[];
  /**
   * Indicele elementului deschis la incarcare; `null` = toate inchise. Implicit: primul la
   * `start` si `securitate`, niciunul la celelalte (cum e masurat).
   */
  deschisInitial?: number | null;
  /** Nivelul titlului care tine intrebarea. */
  nivelTitlu?: 2 | 3 | 4;
  className?: string;
};

const IMPLICIT: Record<VariantaAcordeon, number | null> = {
  start: 0,
  sector: null,
  preturi: null,
  platforma: null,
  securitate: 0,
  "e-facturare": null,
};

const CHEVRON: Record<VariantaAcordeon, { marime: number; contur: number }> = {
  start: { marime: 16, contur: 1.75 },
  sector: { marime: 14, contur: 2 },
  preturi: { marime: 20, contur: 2 },
  platforma: { marime: 16, contur: 2 },
  securitate: { marime: 20, contur: 2 },
  "e-facturare": { marime: 16, contur: 2 },
};

function Titlu({ nivel, children }: { nivel: 2 | 3 | 4; children: ReactNode }) {
  if (nivel === 2) return <h2 className={s.intrebareTitlu}>{children}</h2>;
  if (nivel === 4) return <h4 className={s.intrebareTitlu}>{children}</h4>;
  return <h3 className={s.intrebareTitlu}>{children}</h3>;
}

export default function Acordeon({ varianta, elemente, deschisInitial, nivelTitlu = 3, className }: AcordeonProps) {
  const baza = useId();
  const initial = deschisInitial === undefined ? IMPLICIT[varianta] : deschisInitial;
  const [deschis, setDeschis] = useState<number | null>(initial);
  const chevron = CHEVRON[varianta];

  if (varianta === "platforma" || varianta === "securitate" || varianta === "e-facturare") {
    const clasaVarianta = varianta === "platforma" ? s.platforma : varianta === "securitate" ? s.securitate : s.efacturare;
    const clasaRaspuns =
      varianta === "platforma" ? s.platformaRaspuns : varianta === "securitate" ? s.securitateRaspuns : s.efacturareRaspuns;
    return (
      <div className={[s.detalii, clasaVarianta, className ?? ""].filter(Boolean).join(" ")}>
        {elemente.map((e, i) => (
          <details key={i} open={i === initial ? true : undefined}>
            <summary>
              <span>{e.intrebare}</span>
              <Iconita nume="chevron-down" marime={chevron.marime} contur={chevron.contur} className={s.chevron} />
            </summary>
            <div className={clasaRaspuns}>{e.raspuns}</div>
          </details>
        ))}
      </div>
    );
  }

  const comuta = (i: number) => setDeschis((d) => (d === i ? null : i));

  if (varianta === "start") {
    return (
      <div className={[s.start, className ?? ""].filter(Boolean).join(" ")}>
        {elemente.map((e, i) => {
          const esteDeschis = deschis === i;
          const idButon = baza + "-q" + i;
          const idRaspuns = baza + "-r" + i;
          return (
            <div key={i} className={[s.startElement, esteDeschis ? s.startElementDeschis : ""].join(" ")}>
              <Titlu nivel={nivelTitlu}>
                <button
                  type="button"
                  id={idButon}
                  className={s.startIntrebare}
                  aria-expanded={esteDeschis}
                  aria-controls={idRaspuns}
                  onClick={() => comuta(i)}
                >
                  <span>{e.intrebare}</span>
                  <Iconita nume="chevron-down" marime={chevron.marime} contur={chevron.contur} className={s.chevron} />
                </button>
              </Titlu>
              <div
                id={idRaspuns}
                role="region"
                aria-labelledby={idButon}
                className={s.startRaspunsInvelis}
                aria-hidden={esteDeschis ? undefined : true}
              >
                <div className={s.startRaspunsInterior}>
                  <div className={s.startRaspuns}>{e.raspuns}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  const esteSector = varianta === "sector";
  return (
    <div className={[esteSector ? s.sector : s.preturi, className ?? ""].filter(Boolean).join(" ")}>
      {elemente.map((e, i) => {
        const esteDeschis = deschis === i;
        const idButon = baza + "-q" + i;
        const idRaspuns = baza + "-r" + i;
        const clasaElement = esteSector
          ? [s.sectorElement, esteDeschis ? s.sectorElementDeschis : ""].join(" ")
          : [s.preturiElement, esteDeschis ? s.preturiElementDeschis : ""].join(" ");
        return (
          <div key={i} className={clasaElement}>
            <Titlu nivel={nivelTitlu}>
              <button
                type="button"
                id={idButon}
                className={esteSector ? s.sectorIntrebare : s.preturiIntrebare}
                aria-expanded={esteDeschis}
                aria-controls={idRaspuns}
                onClick={() => comuta(i)}
              >
                <span>{e.intrebare}</span>
                <Iconita nume="chevron-down" marime={chevron.marime} contur={chevron.contur} className={s.chevron} />
              </button>
            </Titlu>
            {/* Raspunsul sta MEREU in HTML-ul servit, ascuns prin `hidden` cat e inchis (G-AI-01, plan
                §8.3): randat doar la deschidere, lipsea din textul fara script - masurat de criticul
                feliei 51 pe /preturi, 0 din 2 fraze-proba. Animatia de aparitie (sector) reporneste
                oricum, fiindca `hidden` scoate elementul din randare. */}
            <div id={idRaspuns} role="region" aria-labelledby={idButon} hidden={!esteDeschis}>
              <div className={esteSector ? s.sectorRaspuns : s.preturiRaspuns}>{e.raspuns}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
