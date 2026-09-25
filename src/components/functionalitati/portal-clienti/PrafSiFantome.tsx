// S4 - straturile anxietatii (functionalitati__portal-clienti.md, S4): praful de pe toata sectiunea si
// cele patru carduri-fantoma din colturile blocului de text.
//
//   Praful    20 de puncte rotunde de 2-5 px, alb .3, opacitati proprii .25-.42, statice; stratul apare cu
//             min(1, 1,5 p). Asezarea e a noastra: o grila de 5 x 4 celule, cu fiecare punct mutat in
//             celula lui de un generator cu samanta fixa (acelasi desen la fiecare incarcare).
//   Fantomele carduri-citat "fantoma" (CardCitat), opacitati .92 / .7 / .82 / .62, inclinate -3 / +2 /
//             +4 / -2 grade, plutire 7 / 9 / 8 / 10 s cu intarzieri 0 / -2 / -4 / -1 s.

import type { CSSProperties } from "react";
import CardCitat from "@/components/cinema/CardCitat";
import { ANXIETATE_PORTAL } from "@/content/functionalitati/portal-clienti";
import s from "./portal.module.css";

/** Generator determinist (mulberry32): aceeasi samanta, acelasi praf. */
function mulberry32(samanta: number): () => number {
  let a = samanta >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export type FirPraf = { stanga: number; sus: number; marime: number; opacitate: number };

/** Cele 20 de fire: grila 5 x 4, fiecare in celula lui, cu marime 2-5 px si opacitate .25-.42. */
export function firePraf(samanta = 41): FirPraf[] {
  const aleator = mulberry32(samanta);
  const fire: FirPraf[] = [];
  for (let rand = 0; rand < 4; rand++) {
    for (let col = 0; col < 5; col++) {
      fire.push({
        stanga: Math.round((col * 20 + 3 + aleator() * 14) * 10) / 10,
        sus: Math.round((rand * 25 + 4 + aleator() * 17) * 10) / 10,
        marime: 2 + Math.floor(aleator() * 4),
        opacitate: Math.round((0.25 + aleator() * 0.17) * 100) / 100,
      });
    }
  }
  return fire;
}

export function Praf() {
  return (
    <div className={s.praf} aria-hidden="true">
      {firePraf().map((f, i) => (
        <span
          key={i}
          className={s.fir}
          style={{ left: f.stanga + "%", top: f.sus + "%", width: f.marime, height: f.marime, opacity: f.opacitate } as CSSProperties}
        />
      ))}
    </div>
  );
}

const ASEZARE_FANTOME = [
  { clasa: s.fantoma1, inclinare: -3, plutire: 7, intarziere: 0, opacitate: 0.92 },
  { clasa: s.fantoma2, inclinare: 2, plutire: 9, intarziere: -2, opacitate: 0.7 },
  { clasa: s.fantoma3, inclinare: 4, plutire: 8, intarziere: -4, opacitate: 0.82 },
  { clasa: s.fantoma4, inclinare: -2, plutire: 10, intarziere: -1, opacitate: 0.62 },
] as const;

export function Fantome() {
  return (
    <>
      {ANXIETATE_PORTAL.fantome.map((text, i) => {
        const a = ASEZARE_FANTOME[i];
        return (
          <CardCitat
            key={text}
            text={text}
            varianta="fantoma"
            inclinare={a.inclinare}
            plutire={a.plutire}
            intarziere={a.intarziere}
            opacitate={a.opacitate}
            className={[s.fantoma, a.clasa].join(" ")}
          />
        );
      })}
    </>
  );
}
