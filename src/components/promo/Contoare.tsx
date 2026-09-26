"use client";

// Contoarele (promo.md §8): 3 perechi valoare / eticheta, separatori de 1 x 50; contorul din mijloc numara
// de la 0 pana la valoarea lui in ~1,8 s, pe easeOutCubic, cand randul intra in fereastra, o singura data.
// Randul e aliniat la centru, deci contorul cu eticheta pe 2 randuri are valoarea mai sus (ca la referinta).
//
// Cifrele sunt fapte din registru (plan §6.3), nu cifre de tractiune: `src/content/promo.ts`, `CONTOARE`.
// Starea statica (server, miscare redusa) arata valoarea finala. Latimea valorii e rezervata la latimea
// textului final (cifre tabulare), deci numaratoarea nu impinge vecinii (fara deplasare de layout).

import { useEffect, useRef, useState } from "react";
import { CONTOARE } from "@/content/promo";
import { DURATA_NUMARATOARE_MS, valoareContor } from "./miscare-promo";
import { usePornireLaVedere } from "./vizibil";
import s from "./promo.module.css";

function ValoareNumarata({ final, text }: { final: number; text: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const faza = usePornireLaVedere(ref, 0.6);
  const [n, setN] = useState<number | null>(null);

  useEffect(() => {
    if (faza === "static") {
      setN(null);
      return;
    }
    if (faza === "asteapta") {
      setN(0);
      return;
    }
    const start = performance.now();
    let cadru = 0;
    const pas = () => {
      const t = performance.now() - start;
      setN(valoareContor(t, final));
      if (t < DURATA_NUMARATOARE_MS) cadru = requestAnimationFrame(pas);
      else setN(null);
    };
    cadru = requestAnimationFrame(pas);
    return () => cancelAnimationFrame(cadru);
  }, [faza, final]);

  return (
    <span ref={ref} className={s.contorValoare} style={{ minWidth: text.length + "ch" }} data-numara={n === null ? "final" : "curge"}>
      {n === null ? text : String(n)}
    </span>
  );
}

export default function Contoare() {
  return (
    <ul className={s.contoare}>
      {CONTOARE.flatMap((c, i) => {
        const el = (
          <li key={c.eticheta} className={s.contor}>
            {c.numara !== undefined ? (
              <ValoareNumarata final={c.numara} text={c.valoare} />
            ) : (
              <span className={s.contorValoare}>{c.valoare}</span>
            )}
            <span className={s.contorEticheta}>{c.eticheta}</span>
          </li>
        );
        return i === 0 ? [el] : [<li key={"sep" + i} className={s.separatorContor} aria-hidden="true" />, el];
      })}
    </ul>
  );
}
