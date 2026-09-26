"use client";

// Rigla "o factura, ani de pastrare" (e-facturare.md §8): pista cu gradatii anuale, segmentul
// albastru pana la finalul pastrarii, banda de expirare si eticheta ei.
//
// Animatia de intrare, o singura data: segmentul `scaleX` 0 -> 1 in 1,1 s cubic-bezier(.25,.7,.3,1)
// cu 0,15 s intarziere; banda 0 -> ,75 in 0,5 s dupa 1,05 s; eticheta 0 -> 1 in 0,5 s dupa 1,2 s.
//
// HTML-ul servit poarta STAREA FINALA (fara JavaScript si la miscare redusa rigla e intreaga). Clasa
// de asteptare o pune abia componenta, si numai daca rigla e inca sub ecran; un element deja vizibil
// la hidratare nu se mai ascunde, ca sa nu clipeasca.
//
// La 390 (sub 640) eticheta benzii trece IN FLUX sub pista, deci nu se mai suprapune peste anii
// ramasi - defectul masurat la referinta (COMPONENTE §5, punctul 12) nu se mosteneste.

import { useEffect, useRef } from "react";
import s from "./efacturare.module.css";

export type Rigla11AniProps = {
  fisier: string;
  eticheta: string;
  banda: string;
  anStart: number;
  aniScala: number;
  aniPastrare: number;
};

/** Pragul de declansare: marginea de sus a riglei urca la 85% din fereastra. */
const PRAG = 0.85;

export default function Rigla11Ani({ fisier, eticheta, banda, anStart, aniScala, aniPastrare }: Rigla11AniProps) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!("IntersectionObserver" in window)) return;
    if (el.getBoundingClientRect().top < window.innerHeight * PRAG) return;
    el.dataset.stare = "asteapta";
    const obs = new IntersectionObserver(
      (intrari) => {
        if (intrari.some((i) => i.isIntersecting)) {
          el.dataset.stare = "intrat";
          obs.disconnect();
        }
      },
      { rootMargin: "0px 0px -" + Math.round((1 - PRAG) * 100) + "% 0px" },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const pozitie = (i: number) => (i / aniScala) * 100;
  const sfarsit = pozitie(aniPastrare);
  const ani = Array.from({ length: aniScala + 1 }, (_, i) => i);

  return (
    <div ref={ref} className={s.riglaTabla} data-rigla="">
      <div className={s.riglaEmitere}>
        <span className={s.riglaFisier}>{fisier}</span>
        <span className={s.riglaEticheta}>{eticheta}</span>
      </div>
      <span className={s.riglaAc} aria-hidden="true" />
      <div className={s.riglaPista} aria-hidden="true">
        <span className={s.riglaBaza} />
        <span className={s.riglaSegment} data-rigla-segment="" style={{ width: sfarsit + "%" }} />
        <span className={s.riglaBanda} style={{ left: sfarsit + "%", width: 100 - sfarsit + "%" }} />
        {ani.map((i) => (
          <span
            key={"g" + i}
            className={[s.riglaGradatie, i % 2 === 0 ? s.riglaGradatieMare : ""].join(" ")}
            style={{ left: pozitie(i) + "%" }}
          />
        ))}
        {ani
          .filter((i) => i % 2 === 0)
          .map((i, k) => (
            <span
              key={"a" + i}
              className={[s.riglaAn, k % 2 === 1 ? s.riglaAnImpar : ""].join(" ")}
              data-rigla-an=""
              style={{ left: pozitie(i) + "%" }}
            >
              {anStart + i}
            </span>
          ))}
      </div>
      <p className={s.riglaBandaEticheta} data-rigla-banda="">
        {banda}
      </p>
      <p className="doar-cititor">
        {"Scala anilor: de la " + anStart + " la " + (anStart + aniScala) + "; păstrarea din exemplu ține până în " + (anStart + aniPastrare) + "."}
      </p>
    </div>
  );
}
