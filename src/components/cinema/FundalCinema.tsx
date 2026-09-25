"use client";

// Stratul de fundal al paginilor cinema (functionalitati__sablon.md §1.1; promo.md, "Fundalul fix"):
// lumina radiala albastra si grila de 72 px, care urca cu 18% din viteza derularii (promo: 20%).
//
// ABATEREA DE LA REFERINTA, decisa unitar la 3S: grila acopera TOATA pagina. La referinta stratul de
// grila avea o inaltime fixa si iesea din ecran dupa ~5000 px de derulare (fisa promo il numeste
// defect); aici grila e periodica, iar deplasarea se ia modulo o celula (`decalajGrila`), deci arata
// la fel ca la referinta si nu se termina niciodata.
//
// DE CE LIPIT, NU FIX. La referinta stratul e `position: fixed` si picteaza peste tot ecranul, deci si
// peste subsol, daca grila ar fi ramas vizibila pana acolo. Aici stratul e lipit (`sticky`) in invelis,
// cu `margin-bottom: -100vh`: sta pe fereastra cat timp invelisul e pe ecran si se opreste la capatul
// lui, deci subsolul ramane curat. Sectiunile au `z-index: 1`, deasupra lui.
//
// La miscare redusa grila sta pe loc (fara paralaxa); lumina e statica oricum.

import { useEffect, useRef } from "react";
import { areMiscareRedusa } from "./miscare";
import { decalajGrila, FACTOR_PARALAXA } from "./progres";
import s from "./InvelisCinema.module.css";

export type FundalCinemaProps = {
  /** Factorul paralaxei: 0,18 pe functionalitati, 0,2 pe promo. */
  factor?: number;
};

export default function FundalCinema({ factor = FACTOR_PARALAXA }: FundalCinemaProps) {
  const grila = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = grila.current;
    if (!el || areMiscareRedusa()) return;
    let cerut = 0;
    const aplica = () => {
      cerut = 0;
      el.style.transform = "translate3d(0, " + decalajGrila(window.scrollY, factor).toFixed(2) + "px, 0)";
    };
    const laDerulare = () => {
      if (!cerut) cerut = requestAnimationFrame(aplica);
    };
    aplica();
    window.addEventListener("scroll", laDerulare, { passive: true });
    return () => {
      window.removeEventListener("scroll", laDerulare);
      if (cerut) cancelAnimationFrame(cerut);
    };
  }, [factor]);

  return (
    <div className={s.fundal} aria-hidden="true" data-fundal-cinema="">
      <div className={s.lumina} />
      <div ref={grila} className={s.grila} data-grila-cinema="" />
    </div>
  );
}
