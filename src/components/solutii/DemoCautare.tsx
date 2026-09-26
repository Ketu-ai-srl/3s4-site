"use client";

// Cautarea „in direct” de pe paginile de sector (solutii__sablon.md S4): tasteaza interogarea din
// poveste si arata documentul gasit.
//
// COMPORTAMENTUL, pe fisa:
//   1. porneste O SINGURA DATA, cand cel putin 35% din card e vizibil;
//   2. tasteaza 32 ms pe caracter; cursorul clipeste in 4 trepte de 250 ms, si in bara goala;
//   3. la ultima litera cursorul trece in „gata” (acelasi ciclu, pe 1,4 s);
//   4. dupa 350 ms scheletul lasa locul rezultatului, care apare in 0,45 s din translateY(6px);
//   5. fara bucla, fara reluare.
// Abaterea: INALTIMEA E REZERVATA (vezi `CautareMacheta`), deci pagina nu mai sare 47 px.
//
// ETICHETA „EXEMPLU” (decizia D11): pe machetele care arata nume de firme sau de persoane, cardul
// poarta in coltul din dreapta sus, pe randul etichetei, o pastila mica vizibila (11 px, contrast
// 5,49:1), in afara fluxului, deci inaltimea cardului nu se schimba.
//
// HTML-UL SERVIT are starea finala (interogarea intreaga si rezultatul): asa o citeste un robot fara
// JavaScript si asa o vede cine are miscarea redusa. Dupa hidratare, daca miscarea nu e redusa, cardul
// trece in starea goala si asteapta sa intre in fereastra.

import { useEffect, useRef, useState } from "react";
import { textFragment, type ExempluCautare } from "@/content/solutii/tipuri";
import CautareMacheta, { type FazaCautare } from "./CautareMacheta";
import s from "./demo.module.css";

/** Pragul de vizibilitate la care porneste tastarea. */
export const PRAG_PORNIRE = 0.35;
/** Milisecunde pe caracter. */
export const PAS_TASTARE = 32;
/** Pauza dintre ultima litera si rezultat. */
export const PAUZA_REZULTAT = 350;

export type DemoCautareProps = {
  eticheta: string;
  exemplu: ExempluCautare;
};

export default function DemoCautare({ eticheta, exemplu }: DemoCautareProps) {
  const card = useRef<HTMLDivElement>(null);
  const [faza, setFaza] = useState<FazaCautare>("final");
  const [tastat, setTastat] = useState(0);
  const lungime = exemplu.interogare.length;

  useEffect(() => {
    const el = card.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!("IntersectionObserver" in window)) return;

    setFaza("gol");
    setTastat(0);
    let interval = 0;
    let temporizator = 0;
    const porneste = () => {
      setFaza("tastare");
      let n = 0;
      interval = window.setInterval(() => {
        n += 1;
        setTastat(n);
        if (n >= lungime) {
          window.clearInterval(interval);
          setFaza("gata");
          temporizator = window.setTimeout(() => setFaza("rezultat"), PAUZA_REZULTAT);
        }
      }, PAS_TASTARE);
    };
    const observator = new IntersectionObserver(
      (intrari) => {
        for (const intrare of intrari) {
          if (intrare.isIntersecting && intrare.intersectionRatio >= PRAG_PORNIRE) {
            observator.disconnect();
            porneste();
          }
        }
      },
      { threshold: [0, PRAG_PORNIRE, 0.6, 1] },
    );
    observator.observe(el);
    return () => {
      observator.disconnect();
      window.clearInterval(interval);
      window.clearTimeout(temporizator);
    };
  }, [lungime]);

  const r = exemplu.rezultat;
  return (
    <div ref={card} className={[s.card, s.cardSector].join(" ")} data-demo-cautare="">
      <p className={s.eticheta}>{eticheta}</p>
      {exemplu.insigna ? (
        <span className={s.insigna} aria-hidden="true" data-insigna-exemplu="">
          {exemplu.insigna}
        </span>
      ) : null}
      <CautareMacheta exemple={[exemplu]} activ={0} faza={faza} tastat={tastat} />
      <p className="doar-cititor">
        {"Exemplu: întrebarea „" + exemplu.interogare + "” găsește documentul " + r.fisier + ", " + r.loc + ": " + textFragment(r.fragment)}
      </p>
    </div>
  );
}
