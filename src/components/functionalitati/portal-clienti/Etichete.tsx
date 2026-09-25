"use client";

// S3 - etichetele (functionalitati__portal-clienti.md, S3): actul acoperit de sapte etichete lipite pe
// margini, apoi titlul, intrebarea si inchiderea. Blocul apare cu min(1, 2p), tranzitie 0,5 s.
//
// LIPIREA: la referinta animatia ruleaza la incarcarea paginii, cand sectiunea are inca opacitate 0, deci
// nu o vede nimeni (fisa S3). La 3S porneste o singura data, cand sectiunea intra in fereastra
// (propunerea fisei): 0,6 s cu depasire, eticheta k la 0,2 + 0,3 k s. In HTML-ul servit, la miscare
// redusa si daca sectiunea e deja vizibila la hidratare fara miscare, etichetele stau lipite de la inceput.

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { PatratTip } from "@/components/cinema/Fereastra";
import { areMiscareRedusa } from "@/components/cinema/miscare";
import SectiuneScena from "@/components/cinema/SectiuneScena";
import { ETICHETE } from "@/content/functionalitati/portal-clienti";
import s from "./portal.module.css";

/** Pozitia si rotatia fiecarei etichete, in ordinea din fisa: stanga-sus ... stanga (px, grade). */
export const ASEZARE_ETICHETE = [
  { stanga: -8, sus: -10, rotire: -12 },
  { stanga: 199, sus: -8, rotire: 8 },
  { stanga: 276, sus: 28, rotire: 15 },
  { stanga: 268, sus: 83, rotire: -6 },
  { stanga: 202, sus: 118, rotire: 4 },
  { stanga: 44, sus: 116, rotire: -10 },
  { stanga: -14, sus: 36, rotire: -18 },
] as const;

type Lipire = "static" | "asteapta" | "lipeste";

function Teanc() {
  const ref = useRef<HTMLDivElement>(null);
  const [lipire, setLipire] = useState<Lipire>("static");

  useEffect(() => {
    const el = ref.current;
    if (!el || areMiscareRedusa() || typeof IntersectionObserver === "undefined") return;
    setLipire("asteapta");
    const observator = new IntersectionObserver(
      (intrari) => {
        if (intrari.some((i) => i.isIntersecting)) {
          setLipire("lipeste");
          observator.disconnect();
        }
      },
      { threshold: 0.35 },
    );
    observator.observe(el);
    return () => observator.disconnect();
  }, []);

  return (
    <div ref={ref} className={s.teanc} data-lipire={lipire}>
      <div className={s.actEtichetat}>
        <div className={s.capActEtichetat}>
          <PatratTip tip="pdf" />
          <span className={s.numeActEtichetat}>{ETICHETE.fisier}</span>
        </div>
        <span className={s.linieAct} aria-hidden="true" />
        <span className={[s.linieAct, s.linieAct2].join(" ")} aria-hidden="true" />
        <p className={s.stampila}>{ETICHETE.stampila}</p>
        <ul className={s.etichete}>
          {ETICHETE.etichete.map((e, k) => {
            const a = ASEZARE_ETICHETE[k];
            const stil = {
              "--stanga": a.stanga + "px",
              "--sus": a.sus + "px",
              "--rotire": a.rotire + "deg",
              "--intarziere": (0.2 + 0.3 * k).toFixed(1) + "s",
            } as CSSProperties;
            return (
              <li key={e.text} className={[s.eticheta, e.ton === "rosu" ? s.etichetaRosie : s.etichetaNeutra].join(" ")} style={stil}>
                {e.text}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

export default function Etichete() {
  return (
    <SectiuneScena inaltime={80} latime={720} nume="etichete" interiorClassName={s.blocEtichete}>
      <figure className={s.figura} data-macheta="etichete">
        <Teanc />
        <figcaption className="doar-cititor">{ETICHETE.declaratie}</figcaption>
      </figure>
      <h2 className={["t-h2-cinema", s.titluLuminos].join(" ")}>{ETICHETE.titlu}</h2>
      <p className={s.linieEtichete}>{ETICHETE.linie}</p>
      <p className={s.intrebareEtichete}>{ETICHETE.intrebare}</p>
      <div className={s.filet} aria-hidden="true" />
      <p className={s.inchidere}>{ETICHETE.inchidere}</p>
    </SectiuneScena>
  );
}
