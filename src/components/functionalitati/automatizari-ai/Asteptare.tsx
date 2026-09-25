"use client";

// S1 - asteptarea (functionalitati__automatizari-ai.md, S1): titlul stins, patru departamente care nu
// afla ca a venit actul, si actul care se stinge in timp ce trec zilele.
//
// MISCAREA (fisa S1, [derulare], in ambele sensuri): bula i se aprinde la 1,4 (p - 0,083 i) la referinta,
// la 3S intreaga la p 0,25 + 0,05 i (abaterea de contrast, in `automatizari.module.css`); actul se
// stinge la max(0,45; 1 - 0,76 p); ziua = min(7, 1 + floor(7 p)); de la ziua 4 starea trece in cuvantul
// pentru "uitat", in `rosu-clar`. In HTML-ul servit si la miscare redusa: ziua 7, starea finala.

import { Calculator, Inbox, Pen, Scale, type LucideIcon } from "lucide-react";
import type { CSSProperties } from "react";
import SectiuneScena, { useDinProgres } from "@/components/cinema/SectiuneScena";
import { ACT_EXEMPLU, ASTEPTARE, ROLURI, type IconitaRol } from "@/content/functionalitati/automatizari-ai";
import CardAct from "./CardAct";
import s from "./automatizari.module.css";

export const ICONITE_ROL: Record<IconitaRol, LucideIcon> = {
  tava: Inbox,
  calculator: Calculator,
  stilou: Pen,
  balanta: Scale,
};

/** Ziua din contorul actului uitat, dupa progresul sectiunii. */
export function ziuaAsteptarii(p: number): number {
  return Math.min(7, 1 + Math.floor(7 * p));
}

/** Ziua de la care actul e "uitat" (fisa S1: p ~0,43). */
export const ZI_UITAT = 4;

function ActPrafuit() {
  const zi = useDinProgres(ziuaAsteptarii);
  const uitat = zi >= ZI_UITAT;
  return (
    <CardAct
      nume={ACT_EXEMPLU}
      bare={[s.bara1, s.bara2]}
      className={s.actPrafuit}
      jos={
        <p className={s.metaPraf}>
          <span className={s.ziPraf}>
            {ASTEPTARE.zi} {zi}
          </span>
          <span className={s.starePraf} data-uitat={uitat ? "da" : "nu"}>
            {uitat ? ASTEPTARE.stareUitat : ASTEPTARE.stareInitiala}
          </span>
        </p>
      }
    />
  );
}

export default function Asteptare() {
  return (
    <SectiuneScena inaltime={100} latime={920} nume="asteptare">
      <h2 className={["t-h2-cinema", s.titluStins].join(" ")}>{ASTEPTARE.titlu}</h2>
      <p className={s.paragrafStins}>{ASTEPTARE.paragraf}</p>
      <figure className={s.figura} data-macheta="asteptare">
        <ul className={s.oameni}>
          {ROLURI.map((rol, i) => {
            const Iconita = ICONITE_ROL[rol.iconita];
            return (
              <li key={rol.nume} className={s.persoana}>
                <span className={s.cercIconita} aria-hidden="true">
                  <Iconita width={44} height={44} strokeWidth={1.5} focusable="false" />
                </span>
                <p className={s.numePersoana}>{rol.nume}</p>
                <p className={s.bula} style={{ "--i": String(i) } as CSSProperties}>
                  „{rol.replica}”
                </p>
              </li>
            );
          })}
        </ul>
        <ActPrafuit />
        <figcaption className="doar-cititor">{ASTEPTARE.declaratie}</figcaption>
      </figure>
    </SectiuneScena>
  );
}
