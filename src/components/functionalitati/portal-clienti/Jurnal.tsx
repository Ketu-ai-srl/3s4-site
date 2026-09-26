// S7 - jurnalul (functionalitati__portal-clienti.md, S7): titlul, paragraful si fereastra jurnalului cu
// patru deschideri, fiecare cu cine, ce, cand si de pe ce aparat.
//
// MISCAREA (fisa S7, [derulare], in ambele sensuri), in CSS din `--p`: la referinta randul i la max(.2,
// min(1, 2 (p - 0,06 - 0,06 i))); la 3S aceeasi scara, stransa, intreaga la p 0,45 (abaterea de contrast,
// cu motivul, in `portal.module.css`); apoi aluneca spre dreapta cu max(0, 40 (p - 0,46 - 0,06 i)) px.

import type { CSSProperties } from "react";
import Fereastra from "@/components/cinema/Fereastra";
import SectiuneScena from "@/components/cinema/SectiuneScena";
import b from "@/components/cinema/bucle.module.css";
import { JURNAL } from "@/content/functionalitati/portal-clienti";
import s from "./portal.module.css";

export default function Jurnal() {
  return (
    <SectiuneScena inaltime={90} latime={720} nume="jurnal">
      <h2 className={["t-h2-cinema", s.titluSectiune].join(" ")}>{JURNAL.titlu}</h2>
      <p className={["t-paragraf-cinema", s.paragrafJurnal].join(" ")}>{JURNAL.paragraf}</p>
      <Fereastra
        titlu={JURNAL.fisier}
        dreapta={
          <span className={s.inDirect}>
            <span className={[s.punctViu, b.clipire14].join(" ")} aria-hidden="true" />
            {JURNAL.inDirect}
          </span>
        }
        declaratie={JURNAL.declaratie}
        className={s.fereastraJurnal}
        nume="jurnal"
      >
        <ul className={s.corpJurnal}>
          {JURNAL.randuri.map((r, i) => (
            <li key={r.eveniment} className={s.intrare} style={{ "--i": String(i) } as CSSProperties}>
              <span className={s.punctIntrare} aria-hidden="true" />
              <span className={s.textIntrare}>
                <span className={s.eveniment}>{r.eveniment}</span>
                <span className={s.cand}>{r.cand}</span>
              </span>
            </li>
          ))}
        </ul>
      </Fereastra>
    </SectiuneScena>
  );
}
