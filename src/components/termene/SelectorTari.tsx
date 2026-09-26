"use client";

// Selectorul de tara (instrumente__termene-pastrare.md §2 si "Logica instrumentului"): pastile in
// `role="group"`, fiecare un buton cu `aria-pressed`. Panourile TUTUROR tarilor vin randate de
// server (copiii acestei componente, in ordinea tarilor) si stau in HTML, cele nealese cu `hidden`:
// continutul intreg se citeste si fara JavaScript. Clicul schimba panoul instant, fara animatie si
// fara sa miste pagina.
//
// In plus fata de referinta: tara aleasa intra in adresa (`?tara=md`), ca un rezultat sa poata fi
// trimis cuiva, iar la incarcare adresa o alege. Fara parametru, prima tara (Romania) e aleasa,
// oricare ar fi limba sau fusul orar al navigatorului.

import { Children, useEffect, useState, type ReactNode } from "react";
import type { CodTara } from "@/content/termene/date";
import Steag from "./Steag";
import s from "./termene.module.css";

export type TaraSelector = { cod: CodTara; nume: string };

export type SelectorTariProps = {
  tari: TaraSelector[];
  eticheta: string;
  /** Panourile, cate unul pe tara, in ordinea din `tari`. */
  children: ReactNode;
};

export const PARAMETRU_TARA = "tara";

export default function SelectorTari({ tari, eticheta, children }: SelectorTariProps) {
  const [aleasa, setAleasa] = useState<CodTara>(tari[0].cod);
  const panouri = Children.toArray(children);

  useEffect(() => {
    const dinAdresa = new URLSearchParams(window.location.search).get(PARAMETRU_TARA);
    const gasita = tari.find((t) => t.cod === dinAdresa);
    if (gasita) setAleasa(gasita.cod);
  }, [tari]);

  function alege(cod: CodTara) {
    setAleasa(cod);
    const adresa = new URL(window.location.href);
    adresa.searchParams.set(PARAMETRU_TARA, cod);
    window.history.replaceState(window.history.state, "", adresa.toString());
  }

  return (
    <>
      <div role="group" aria-label={eticheta} className={s.selector}>
        {tari.map((t) => (
          <button
            key={t.cod}
            type="button"
            className={s.pastila}
            aria-pressed={t.cod === aleasa}
            aria-controls={"panou-" + t.cod}
            onClick={() => alege(t.cod)}
          >
            <Steag cod={t.cod} className={s.steag} />
            <span>{t.nume}</span>
          </button>
        ))}
      </div>
      {tari.map((t, i) => (
        <div key={t.cod} id={"panou-" + t.cod} hidden={t.cod !== aleasa}>
          {panouri[i]}
        </div>
      ))}
    </>
  );
}
