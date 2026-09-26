"use client";

// Bara de progres a lecturii (blog__articol-sablon.md §1): fixa sus, 2,5 px `albastru`, peste antet
// (strat 1300), fara evenimente de mouse; se intinde din stanga cu `scaleX(p)`, unde
// p = (derulare - y corp) / (inaltimea corpului - inaltimea ferestrei), taiat la [0, 1]. Corpul e
// textul articolului, nu toata pagina (verificat la referinta pe 3 esantioane).
//
// Cat timp p = 0 bara e transparenta; apare in 0,25 s. Latimea urmeaza derularea fara tranzitie. La
// miscare redusa tranzitia de aparitie e oprita de regula globala; bara ramane, fiindca e informatie,
// nu decor. Pentru cititoarele de ecran nu spune nimic (`aria-hidden`): pozitia in text o dau ele.

import { useEffect, useRef } from "react";
import s from "./blog.module.css";

/** p pentru o pozitie de derulare; pura, ca proba s-o poata masura fara navigator. */
export function progresLectura(derulare: number, yCorp: number, hCorp: number, hFereastra: number): number {
  const drum = hCorp - hFereastra;
  if (drum <= 0) return derulare >= yCorp ? 1 : 0;
  return Math.min(1, Math.max(0, (derulare - yCorp) / drum));
}

export default function BaraProgres({ tinta }: { tinta: string }) {
  const bara = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const corp = document.getElementById(tinta);
    const el = bara.current;
    if (!corp || !el) return;
    let cadru = 0;
    const actualizeaza = () => {
      cadru = 0;
      const y = corp.getBoundingClientRect().top + window.scrollY;
      const p = progresLectura(window.scrollY, y, corp.offsetHeight, window.innerHeight);
      el.style.transform = "scaleX(" + p + ")";
      el.dataset.vizibila = p > 0 ? "da" : "nu";
    };
    const cere = () => {
      if (cadru === 0) cadru = window.requestAnimationFrame(actualizeaza);
    };
    actualizeaza();
    window.addEventListener("scroll", cere, { passive: true });
    window.addEventListener("resize", cere);
    return () => {
      window.removeEventListener("scroll", cere);
      window.removeEventListener("resize", cere);
      if (cadru !== 0) window.cancelAnimationFrame(cadru);
    };
  }, [tinta]);

  return <div ref={bara} className={s.progres} data-vizibila="nu" aria-hidden="true" />;
}
