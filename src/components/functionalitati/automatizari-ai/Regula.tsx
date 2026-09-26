// S5 - regula (functionalitati__automatizari-ai.md, S5): titlul, paragraful si fereastra unei reguli
// "Cand -> Atunci" in trei perechi, cu sageti intre randuri.
//
// MISCAREA (fisa S5, [derulare], in ambele sensuri): randurile si sagetile se aprind in 6 trepte;
// treapta 0 e primul rand, treapta k e sageata k plus randul k + 1; la referinta opacitate 2,5 (p - 0,04 k),
// la 3S panta 4 (ultima treapta intreaga la p 0,45, ca textul sa fie citibil cu sectiunea centrata; motivul
// e in `automatizari.module.css`), tranzitie 0,4 s. Totul in CSS, din `--p`.

import { ChevronDown } from "lucide-react";
import type { CSSProperties } from "react";
import Fereastra from "@/components/cinema/Fereastra";
import SectiuneScena from "@/components/cinema/SectiuneScena";
import { REGULA } from "@/content/functionalitati/automatizari-ai";
import s from "./automatizari.module.css";

export default function Regula() {
  return (
    <SectiuneScena inaltime={100} latime={680} nume="regula">
      <h2 className={["t-h2-cinema", s.titluSectiune].join(" ")}>{REGULA.titlu}</h2>
      <p className={["t-paragraf-cinema", s.paragrafRegula].join(" ")}>{REGULA.paragraf}</p>
      <Fereastra
        titlu={REGULA.fisier}
        declaratie={REGULA.declaratie}
        className={s.fereastraRegula}
        baraClassName={s.baraRegula}
        nume="regula"
      >
        <ol className={s.corpRegula}>
          {REGULA.randuri.map((rand, k) => {
            const treapta = { "--k": String(k) } as CSSProperties;
            const atunci = rand.tip === "atunci";
            return [
              k > 0 ? (
                <li key={"sageata-" + k} className={[s.treapta, s.sageata].join(" ")} style={treapta} aria-hidden="true">
                  <ChevronDown width={14} height={14} strokeWidth={1.5} focusable="false" />
                </li>
              ) : null,
              <li key={"rand-" + k} className={[s.treapta, s.randRegula].join(" ")} style={treapta}>
                <span className={[s.etichetaRegula, atunci ? s.etichetaAtunci : ""].filter(Boolean).join(" ")}>
                  {atunci ? REGULA.atunci : REGULA.cand}
                </span>
                <span className={s.textRegula}>
                  {rand.inainte}
                  <em className={atunci ? s.departamentRegula : s.valoareRegula}>{rand.accent}</em>
                  {rand.dupa ?? null}
                </span>
              </li>,
            ];
          })}
        </ol>
      </Fereastra>
    </SectiuneScena>
  );
}
