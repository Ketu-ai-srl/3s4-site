"use client";

// S1 - avalansa de fisiere (functionalitati__cautare-ai.md, S1): o sectiune de 200vh in care fereastra
// dosarului sta lipita cat dureaza inca o fereastra de derulare, iar cele 13 randuri se aprind pe rand,
// dupa progresul sectiunii. Ultimul rand e tinta (numele `albastru-clar`, fundal albastru .15).
//
// PULSUL (fisa S1, masurat pe pagina vie): la fiecare 2,4 s un rand ales la intamplare licare 1,1 s,
// numai cat p e intre 0,05 si 0,95. La 3S ceasul merge doar cat sectiunea e in acel interval si
// numai cu miscare permisa (COMPONENTE.md §5.7: fara ceasuri pornite nevazut).

import { useEffect, useState } from "react";
import Fereastra, { Cip, RandFisier } from "@/components/cinema/Fereastra";
import { useMiscarePermisa } from "@/components/cinema/miscare";
import SectiuneScena, { useDinProgres } from "@/components/cinema/SectiuneScena";
import { AVALANSA } from "@/content/functionalitati/cautare-ai";
import s from "./cautare.module.css";

/**
 * Pragurile de aprindere ale celor 13 randuri: k / 14. Valorile din fisa S1 sunt primul pas de 60 px
 * la care randul era aprins, deci limite de sus, decalate cu pana la un pas; k / 14 e singura
 * scara uniforma care cade in toate cele 13 intervale masurate si in captura la p = 0,8, unde
 * randul 12 e deja aprins.
 */
export const PRAGURI_AVALANSA = Array.from({ length: 13 }, (_, k) => Math.round((k / 14) * 1000) / 1000);
/** Perioada pulsului si durata licaririi (fisa S1). */
export const PULS = { perioada: 2400, durata: 1100, de: 0.05, pana: 0.95 } as const;

function CaleDosar() {
  return (
    <span className={s.caleDosar}>
      {AVALANSA.cale.map((segment, i) => (
        <span key={segment} className={s.caleDosar}>
          {i > 0 ? <span className={s.separator} aria-hidden="true" /> : null}
          {segment}
        </span>
      ))}
    </span>
  );
}

function Randuri() {
  const activ = useDinProgres((p) => p > PULS.de && p < PULS.pana);
  const miscare = useMiscarePermisa();
  const [puls, setPuls] = useState<number | null>(null);

  useEffect(() => {
    if (!activ || !miscare) return;
    let stinge = 0;
    const ceas = window.setInterval(() => {
      // Tinta are fundalul ei; pulsul cade pe unul din celelalte 12 randuri.
      setPuls(Math.floor(Math.random() * (AVALANSA.randuri.length - 1)));
      window.clearTimeout(stinge);
      stinge = window.setTimeout(() => setPuls(null), PULS.durata);
    }, PULS.perioada);
    return () => {
      window.clearInterval(ceas);
      window.clearTimeout(stinge);
      setPuls(null);
    };
  }, [activ, miscare]);

  const ultim = AVALANSA.randuri.length - 1;
  return (
    <div className={s.corpDosar}>
      {AVALANSA.randuri.map((rand, i) => (
        <RandFisier
          key={rand.nume}
          tip={rand.tip}
          nume={rand.nume}
          ora={rand.ora}
          tinta={i === ultim}
          cip={
            rand.cip ? (
              <Cip ton={rand.cip.ton} mono={rand.cip.mono}>
                {rand.cip.text}
              </Cip>
            ) : undefined
          }
          className={[s.randAvalansa, i === ultim ? s.randTinta : "", puls === i ? s.puls : ""].filter(Boolean).join(" ")}
          style={{ ["--prag" as string]: String(PRAGURI_AVALANSA[i]) }}
        />
      ))}
    </div>
  );
}

export default function Avalansa() {
  return (
    <SectiuneScena inaltime={200} spatiere="fara" latime={null} className={s.avalansa} nume="avalansa">
      <div className={s.lipit}>
        <Fereastra
          titlu={<CaleDosar />}
          dreapta={AVALANSA.numar}
          declaratie={AVALANSA.declaratie}
          compactMobil
          className={s.dosar}
          nume="avalansa"
        >
          <Randuri />
        </Fereastra>
      </div>
    </SectiuneScena>
  );
}
