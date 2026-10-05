"use client";

// S1 - avalansa de fisiere (functionalitati__cautare-ai.md, S1), VEDEREA: nu importa niciun continut; textele vin
// de la invelitoarea editiei (`Avalansa` pe RO, `AvalansaEn` pe 3s.md). O sectiune de 200vh in care fereastra
// dosarului sta lipita cat dureaza inca o fereastra de derulare, iar cele 13 randuri se aprind pe rand,
// dupa progresul sectiunii. Ultimul rand e tinta (numele `albastru-clar`, fundal albastru .15).
//
// ETICHETA "exemplu" (decizia D11): dosarul are nume de firma si o factura, deci pe langa declaratia
// pentru cititori (`figcaption`) poarta eticheta vizibila in coltul de sus-dreapta, dupa numarul de fisiere.
//
// PULSUL (fisa S1, masurat pe pagina vie): la fiecare 2,4 s un rand ales la intamplare licare 1,1 s,
// numai cat p e intre 0,05 si 0,95. La 3S ceasul merge doar cat sectiunea e in acel interval si
// numai cu miscare permisa (COMPONENTE.md §5.7: fara ceasuri pornite nevazut).

import { useEffect, useState } from "react";
import Fereastra, { Cip, RandFisier, type TipFisier, type TonCip } from "@/components/cinema/Fereastra";
import { useMiscarePermisa } from "@/components/cinema/miscare";
import SectiuneScena, { useDinProgres } from "@/components/cinema/SectiuneScena";
import s from "./cautare.module.css";

/** Un rand al dosarului; cipul e optional (un rand fara cip se randeaza fara el). */
export type RandAvalansaVedere = {
  tip: TipFisier;
  nume: string;
  cip?: { text: string; ton: TonCip; mono?: boolean };
  ora: string;
};

/** Textele avalansei, pe editie; tip structural, constanta RO (`AVALANSA` plus eticheta) il satisface. */
export type ContinutAvalansa = {
  /** Eticheta accesibila a ferestrei (figcaption). */
  declaratie: string;
  cale: readonly string[];
  numar: string;
  randuri: readonly RandAvalansaVedere[];
  /** Eticheta vizibila "exemplu" din colt. */
  etichetaExemplu: string;
};

/**
 * Pragurile de aprindere ale celor 13 randuri: k / 14. Valorile din fisa S1 sunt primul pas de 60 px
 * la care randul era aprins, deci limite de sus, decalate cu pana la un pas; k / 14 e singura
 * scara uniforma care cade in toate cele 13 intervale masurate si in captura la p = 0,8, unde
 * randul 12 e deja aprins.
 */
export const PRAGURI_AVALANSA = Array.from({ length: 13 }, (_, k) => Math.round((k / 14) * 1000) / 1000);
/** Perioada pulsului si durata licaririi (fisa S1). */
export const PULS = { perioada: 2400, durata: 1100, de: 0.05, pana: 0.95 } as const;

function CaleDosar({ cale }: { cale: readonly string[] }) {
  return (
    <span className={s.caleDosar}>
      {cale.map((segment, i) => (
        <span key={segment} className={s.caleDosar}>
          {i > 0 ? <span className={s.separator} aria-hidden="true" /> : null}
          {segment}
        </span>
      ))}
    </span>
  );
}

function Randuri({ randuri }: { randuri: readonly RandAvalansaVedere[] }) {
  const activ = useDinProgres((p) => p > PULS.de && p < PULS.pana);
  const miscare = useMiscarePermisa();
  const [puls, setPuls] = useState<number | null>(null);

  useEffect(() => {
    if (!activ || !miscare) return;
    let stinge = 0;
    const ceas = window.setInterval(() => {
      // Tinta are fundalul ei; pulsul cade pe unul din celelalte 12 randuri.
      setPuls(Math.floor(Math.random() * (randuri.length - 1)));
      window.clearTimeout(stinge);
      stinge = window.setTimeout(() => setPuls(null), PULS.durata);
    }, PULS.perioada);
    return () => {
      window.clearInterval(ceas);
      window.clearTimeout(stinge);
      setPuls(null);
    };
  }, [activ, miscare, randuri.length]);

  const ultim = randuri.length - 1;
  return (
    <div className={s.corpDosar}>
      {randuri.map((rand, i) => (
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

export default function AvalansaVedere({ continut }: { continut: ContinutAvalansa }) {
  return (
    <SectiuneScena inaltime={200} spatiere="fara" latime={null} className={s.avalansa} nume="avalansa">
      <div className={s.lipit}>
        <Fereastra
          titlu={<CaleDosar cale={continut.cale} />}
          dreapta={
            <span className={s.dreaptaExemplu}>
              {continut.numar}
              <span className={s.exemplu} aria-hidden="true">
                {continut.etichetaExemplu}
              </span>
            </span>
          }
          declaratie={continut.declaratie}
          compactMobil
          className={s.dosar}
          nume="avalansa"
        >
          <Randuri randuri={continut.randuri} />
        </Fereastra>
      </div>
    </SectiuneScena>
  );
}
