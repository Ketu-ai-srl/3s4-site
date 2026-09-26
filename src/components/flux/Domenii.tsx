"use client";

// Selectorul de domenii si panoul lui (flux-documente.md §5-§6, COMPONENTE §4.10).
//
// Tastatura: `tablist` cu tabindex itinerant (0 pe cel selectat, -1 pe rest); sagetile stanga si
// dreapta, Home si End muta focusul SI selectia (activare automata, cum e masurat la referinta).
//
// Toate cele 7 panouri sunt in HTML-ul servit, cele neselectate cu `hidden`: textul lor e citibil
// fara JavaScript, iar cand unul devine vizibil animatiile lui CSS pornesc de la zero (un element
// scos din `display: none` isi reia animatiile).
//
// Machetele pornesc LA VEDERE, nu la incarcare: pana cand panoul intra in fereastra, containerul
// sta in `data-stare="asteapta"` (animatiile in primul cadru, oprite), apoi trece in "ruleaza".
// Fara JavaScript si la miscare redusa atributul lipseste si machetele arata direct starea finala.

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import LegaturaInText from "@/components/primitive/LegaturaInText";
import { DOMENII, DOMENII_CAP } from "@/content/flux";
import { MACHETA_PE_DOMENIU } from "./Machete";
import s from "./flux.module.css";

export default function Domenii() {
  const [activ, setActiv] = useState(0);
  const [stare, setStare] = useState<"asteapta" | "ruleaza" | undefined>(undefined);
  const taburi = useRef<(HTMLButtonElement | null)[]>([]);
  const zona = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const el = zona.current;
    if (!el || !("IntersectionObserver" in window)) return;
    setStare("asteapta");
    const obs = new IntersectionObserver(
      (intrari) => {
        if (intrari.some((i) => i.isIntersecting)) {
          setStare("ruleaza");
          obs.disconnect();
        }
      },
      { rootMargin: "0px 0px -15% 0px" },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const alege = (i: number) => {
    const n = (i + DOMENII.length) % DOMENII.length;
    setActiv(n);
    taburi.current[n]?.focus();
  };

  const laTasta = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === "ArrowRight") alege(activ + 1);
    else if (e.key === "ArrowLeft") alege(activ - 1);
    else if (e.key === "Home") alege(0);
    else if (e.key === "End") alege(DOMENII.length - 1);
    else return;
    e.preventDefault();
  };

  return (
    <>
      <div className="container-site">
        <div className={s.selector}>
          <p id="flux-domenii-eticheta" className={s.selectorEticheta}>
            {DOMENII_CAP.eticheta}
          </p>
          <div className={s.taburi} role="tablist" aria-labelledby="flux-domenii-eticheta">
            {DOMENII.map((d, i) => (
              <button
                key={d.cheie}
                ref={(el) => {
                  taburi.current[i] = el;
                }}
                type="button"
                role="tab"
                id={"flux-tab-" + d.cheie}
                aria-selected={i === activ}
                aria-controls={"flux-panou-" + d.cheie}
                tabIndex={i === activ ? 0 : -1}
                className={s.tab}
                onClick={() => setActiv(i)}
                onKeyDown={laTasta}
              >
                {d.tab}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div ref={zona} className={s.panouri} data-panouri-domenii="" data-stare={stare}>
        {DOMENII.map((d, i) => {
          const Macheta = MACHETA_PE_DOMENIU[d.cheie];
          return (
            <section
              key={d.cheie}
              id={"flux-panou-" + d.cheie}
              role="tabpanel"
              aria-labelledby={"flux-tab-" + d.cheie}
              hidden={i !== activ}
              className={s.panouDomeniu}
            >
              <div className="container-site">
                <div className={s.panouCap}>
                  <p className={s.panouEticheta}>{d.eticheta}</p>
                  <h3 className={s.panouTitlu}>{d.titlu}</h3>
                </div>
                <figure className={s.panouScena}>
                  <figcaption className="doar-cititor">Exemplu cu date fictive</figcaption>
                  <span className={s.eticheteExemplu} aria-hidden="true">Exemplu</span>
                  <Macheta />
                </figure>
                <p className={s.panouLegatura}>
                  <LegaturaInText legatura={d.legatura} marime={14} />
                </p>
              </div>
            </section>
          );
        })}
      </div>
    </>
  );
}
