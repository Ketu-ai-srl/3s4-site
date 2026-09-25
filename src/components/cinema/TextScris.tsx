"use client";

// Un text scris litera cu litera, fara salt de pagina si fara text pierdut pentru cititori.
//
// DOUA STRATURI in acelasi loc:
//   - `baza`: textul intreg, in flux. Ocupa locul final de la inceput (deci nimic de sub el nu sare
//     cand textul trece pe al doilea rand) si e ce citesc cititorul de ecran si robotii. In timpul
//     scrierii e transparent;
//   - `copie`: pozitionata peste baza, cu aceeasi latime si acelasi font, deci rupe randurile in
//     aceleasi locuri; arata caracterele scrise pana acum si cursorul. E ascunsa tehnologiilor de
//     asistenta (`aria-hidden`): altfel cititorul ar anunta fiecare litera.
//
// `inainte` e un element pus in fata textului, pe acelasi rand (lupa din terminal): sta in ambele
// straturi, ca textul copiei sa inceapa exact unde incepe baza.
//
// `rezervaLoc={false}` intoarce straturile: in timpul scrierii COPIA sta in flux, deci elementul creste
// odata cu textul (bara de cautare din S5 pe cautare-ai are un rand cat textul incape pe unul, ca la
// referinta), iar baza ramane numai pentru cititori, ascunsa vizual. Locul final il rezerva atunci cine
// foloseste piesa, in afara ei (altfel ce sta dedesubt sare). In starea statica nu se schimba nimic.

import type { ElementType, ReactNode } from "react";
import type { StareScriere } from "./scriere";
import s from "./TextScris.module.css";

export type TextScrisProps = {
  text: string;
  stare: StareScriere;
  scrise: number;
  inainte?: ReactNode;
  ca?: ElementType;
  /** Locul final e rezervat in element (implicit), sau elementul creste odata cu scrierea (`false`). */
  rezervaLoc?: boolean;
  className?: string;
};

export default function TextScris({ text, stare, scrise, inainte, ca: Ca = "p", rezervaLoc = true, className }: TextScrisProps) {
  return (
    <Ca className={[s.scris, rezervaLoc ? "" : s.creste, className].filter(Boolean).join(" ")} data-scriere={stare}>
      <span className={s.baza}>
        {inainte}
        {text}
      </span>
      {stare === "static" ? null : (
        <span className={s.copie} aria-hidden="true">
          {inainte}
          {text.slice(0, scrise)}
          {stare === "scrie" ? <span className={s.cursor} data-cursor="" /> : null}
        </span>
      )}
    </Ca>
  );
}
