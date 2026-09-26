"use client";

// Cardul "cautare" (promo.md §4): campul in care intrebarea se tasteaza litera cu litera (~37 ms pe
// caracter) dupa ce cardul intra in fereastra, cursorul care clipeste (1 s, step-end) si cele 3 rezultate,
// al treilea stins.
//
// Starea statica (server, fara JavaScript, miscare redusa): intrebarea intreaga. In timpul tastarii
// textul intreg ramane in pagina, ascuns vederii (loc rezervat, cititori de ecran), iar copia tastata sta
// peste el, `aria-hidden`.

import { Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { CAUTARE } from "@/content/promo";
import { caractereTastate, PAS_TASTARE_MS } from "./miscare-promo";
import { CardMacheta } from "./Piese";
import { usePornireLaVedere } from "./vizibil";
import s from "./promo.module.css";

export default function CardCautare() {
  const ref = useRef<HTMLDivElement>(null);
  const faza = usePornireLaVedere(ref);
  const text = CAUTARE.intrebare;
  const [scrise, setScrise] = useState(text.length);

  useEffect(() => {
    if (faza === "static") {
      setScrise(text.length);
      return;
    }
    if (faza === "asteapta") {
      setScrise(0);
      return;
    }
    const start = performance.now();
    let cadru = 0;
    const pas = () => {
      const n = caractereTastate(performance.now() - start, text.length, PAS_TASTARE_MS);
      setScrise(n);
      if (n < text.length) cadru = requestAnimationFrame(pas);
    };
    cadru = requestAnimationFrame(pas);
    return () => cancelAnimationFrame(cadru);
  }, [faza, text.length]);

  const tasteaza = faza !== "static" && scrise < text.length;
  return (
    <div ref={ref}>
      <CardMacheta
        rama={CAUTARE.rama}
        nume="cautare"
        declaratie="Exemplu cu date fictive: o întrebare scrisă în 3S și contractele găsite, cu termenul lor."
      >
        <div className={s.camp}>
          <Search width={13} height={13} strokeWidth={2} aria-hidden="true" focusable="false" />
          <span className={s.intrebare} data-tastare={faza === "static" ? "static" : tasteaza ? "tasteaza" : "gata"}>
            <span className={s.intrebareBaza} data-stare={tasteaza ? "tasteaza" : "gata"}>
              {text}
            </span>
            {tasteaza ? (
              <span className={s.intrebareCopie} aria-hidden="true">
                {text.slice(0, scrise)}
              </span>
            ) : null}
          </span>
          <span className={s.cursor} aria-hidden="true">
            |
          </span>
        </div>
        <ul className={s.rezultate}>
          {CAUTARE.rezultate.map((r) => (
            <li key={r.fisier} className={[s.rezultat, r.stins ? s.rezultatStins : ""].filter(Boolean).join(" ")}>
              <b>{r.fisier}</b>
              <span className={[s.eticheta8, r.ton === "rosu" ? s.tonRosu : s.tonVerde].join(" ")}>{r.eticheta}</span>
            </li>
          ))}
        </ul>
      </CardMacheta>
    </div>
  );
}
