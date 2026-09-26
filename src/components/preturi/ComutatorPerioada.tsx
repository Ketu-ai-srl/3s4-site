"use client";

// Comutatorul lunar / anual (preturi.md §6c): pastila cu doua butoane si un indicator alb care
// aluneca pe `left` si `width` in 0,3 s. Porneste pe anual. Insigna din butonul anual spune
// adevarul de azi (acelasi pret), fara procent.
//
// Indicatorul se aseaza dupa masurarea butonului activ; pana atunci (HTML-ul servit, primul cadru)
// fundalul alb sta chiar pe butonul activ, deci pastila arata la fel si fara JavaScript. Masurarea se
// reia cand pastila isi schimba marimea (fontul incarcat mai tarziu, latimea ferestrei).

import { useLayoutEffect, useRef, useState } from "react";
import { COMUTATOR, type Perioada } from "@/content/preturi";
import s from "./pachete.module.css";

type Pozitie = { left: number; width: number };

const OPTIUNI: Perioada[] = ["lunar", "anual"];

export default function ComutatorPerioada({
  perioada,
  laSchimbare,
}: {
  perioada: Perioada;
  laSchimbare: (p: Perioada) => void;
}) {
  const pastila = useRef<HTMLDivElement>(null);
  const butoane = useRef<Record<Perioada, HTMLButtonElement | null>>({ lunar: null, anual: null });
  const [pozitie, setPozitie] = useState<Pozitie | null>(null);

  useLayoutEffect(() => {
    const el = pastila.current;
    if (!el) return;
    const masoara = () => {
      const b = butoane.current[perioada];
      if (!b || b.offsetWidth === 0) return;
      setPozitie({ left: b.offsetLeft, width: b.offsetWidth });
    };
    masoara();
    if (!("ResizeObserver" in window)) return;
    const ro = new ResizeObserver(masoara);
    ro.observe(el);
    return () => ro.disconnect();
  }, [perioada]);

  return (
    <div className={s.comutatorInvelis}>
      <div ref={pastila} className={s.comutator} role="group" aria-label={COMUTATOR.eticheta}>
        {pozitie ? (
          <span className={s.indicator} style={{ left: pozitie.left, width: pozitie.width }} aria-hidden="true" />
        ) : null}
        {OPTIUNI.map((o) => {
          const activ = o === perioada;
          return (
            <button
              key={o}
              ref={(b) => {
                butoane.current[o] = b;
              }}
              type="button"
              className={s.optiune + (activ ? " " + s.optiuneActiva : "")}
              aria-pressed={activ}
              data-fara-indicator={activ && !pozitie ? "" : undefined}
              onClick={() => laSchimbare(o)}
            >
              {o === "lunar" ? COMUTATOR.lunar : COMUTATOR.anual}
              {o === "anual" ? <span className={s.insigna}>{COMUTATOR.insigna}</span> : null}
            </button>
          );
        })}
      </div>
      <p className={s.notaComutator}>{COMUTATOR.nota}</p>
    </div>
  );
}
