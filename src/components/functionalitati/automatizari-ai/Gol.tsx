"use client";

// S0 - golul din erou (functionalitati__automatizari-ai.md, S0): 320 x 280, actul asezat sus si groapa
// de 280 x 60 la 240 px. Dupa ce subtitlul s-a scris (faza `scris` a eroului), actul cade in groapa:
// 3 s, `cubic-bezier(.4,0,.2,1)`, si ramane invizibil la capat.
//
// In HTML-ul servit si la miscare redusa faza e `static`: actul sta sus, intreg, si nu cade (masurat
// pe referinta la miscare redusa: `top 0`, opacitate 1, pana la 7 s).

import { useFazaErou } from "@/components/cinema/EroulCinema";
import { ACT_EXEMPLU, EROU_AUTOMATIZARI } from "@/content/functionalitati/automatizari-ai";
import CardAct from "./CardAct";
import s from "./automatizari.module.css";

export default function Gol() {
  const faza = useFazaErou();
  return (
    <figure className={s.gol} data-macheta="gol">
      <div className={s.actGol} data-cade={faza === "scris" ? "da" : "nu"}>
        <CardAct
          nume={ACT_EXEMPLU}
          bare={[s.baraGol1, s.baraGol2, s.baraGol3]}
          jos={<p className={s.oraAct}>{EROU_AUTOMATIZARI.ora}</p>}
        />
      </div>
      <div className={s.groapa} aria-hidden="true" />
      <figcaption className="doar-cititor">{EROU_AUTOMATIZARI.declaratie}</figcaption>
    </figure>
  );
}
