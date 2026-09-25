"use client";

// Seiful legat de derulare (securitate.md §13; COMPONENTE §4.6), finalul paginii de securitate.
// Cursa sectiunii (260lvh, 230lvh sub 640) muta pe rand zavoarele, roata, eticheta de stare, usa,
// cele trei randuri si nota cu butonul, dupa canalele din `seif-canale.ts`. Totul e reversibil:
// starea se calculeaza din pozitie, nu se acumuleaza. Usa urmeaza tinta cu o netezire scurta
// (~150 ms dupa un salt), ca la referinta.
//
// Elementele se misca prin stiluri puse direct din script, intr-un singur cadru de animatie pe
// derulare, fara randari React pe fiecare cadru; doar eticheta de stare trece prin React, si numai
// cand se schimba.
//
// MISCARE REDUSA si PAGINA FARA SCRIPT: foaia de stil arata forma statica (inaltimea continutului,
// fara usa si fara eticheta, tot textul la vedere), iar scriptul nu se mai leaga de derulare.
// TASTATURA: butonul din seif sta sub usa pana spre final; cand primeste focus cu seiful inca
// inchis, pagina coboara pana unde usa e deschisa si butonul se vede.
//
// Numele de fisiere din randuri sunt fictive, declarate ca exemplu (plan D9).

import { useEffect, useRef, useState } from "react";
import Iconita from "@/components/primitive/Iconita";
import Tinta from "@/components/primitive/Tinta";
import { SEIF } from "@/content/produs/securitate";
import { CANALE_SEIF, pasNetezire, progresSectiune, stareSeif } from "./seif-canale";
import { nerupt } from "./nerupt";
import s from "./Seif.module.css";

const INTERVAL_REDUS = "(prefers-reduced-motion: reduce)";

function RoataSeif() {
  const spite = [0, 60, 120, 180, 240, 300];
  return (
    <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" aria-hidden="true" focusable="false">
      <circle cx="50" cy="50" r="46" />
      <circle cx="50" cy="50" r="9" />
      {spite.map((unghi) => {
        const rad = (unghi * Math.PI) / 180;
        const x1 = 50 + 9 * Math.cos(rad);
        const y1 = 50 + 9 * Math.sin(rad);
        const x2 = 50 + 46 * Math.cos(rad);
        const y2 = 50 + 46 * Math.sin(rad);
        return <line key={unghi} x1={x1.toFixed(2)} y1={y1.toFixed(2)} x2={x2.toFixed(2)} y2={y2.toFixed(2)} />;
      })}
    </svg>
  );
}

export default function Seif() {
  const sectiune = useRef<HTMLElement>(null);
  const usa = useRef<HTMLDivElement>(null);
  const roata = useRef<HTMLDivElement>(null);
  const zavoare = useRef<(HTMLSpanElement | null)[]>([]);
  const randuri = useRef<(HTMLLIElement | null)[]>([]);
  const nota = useRef<HTMLParagraphElement>(null);
  const cta = useRef<HTMLDivElement>(null);
  const [deschis, setDeschis] = useState(false);
  const [redus, setRedus] = useState<boolean | null>(null);

  // Preferinta de miscare, urmarita si cand se schimba in timpul vizitei.
  useEffect(() => {
    const interogare = window.matchMedia(INTERVAL_REDUS);
    const aplica = () => setRedus(interogare.matches);
    aplica();
    interogare.addEventListener("change", aplica);
    return () => interogare.removeEventListener("change", aplica);
  }, []);

  useEffect(() => {
    if (redus !== false) return;
    const el = sectiune.current;
    if (!el) return;

    let cadru = 0;
    let unghiUsa = 0;
    let tintaUsa = 0;
    let ultimul = 0;
    let deschisAcum = false;

    const deseneazaUsa = (acum: number) => {
      const dt = ultimul === 0 ? 16 : acum - ultimul;
      ultimul = acum;
      unghiUsa = pasNetezire(unghiUsa, tintaUsa, dt);
      if (Math.abs(tintaUsa - unghiUsa) < 0.05) unghiUsa = tintaUsa;
      if (usa.current) usa.current.style.transform = "rotateY(" + unghiUsa.toFixed(2) + "deg)";
      if (unghiUsa !== tintaUsa) {
        cadru = requestAnimationFrame(deseneazaUsa);
      } else {
        cadru = 0;
        ultimul = 0;
      }
    };

    const actualizeaza = () => {
      const r = el.getBoundingClientRect();
      const st = stareSeif(progresSectiune(r.top, r.height, window.innerHeight));
      st.zavoare.forEach((x, i) => {
        const z = zavoare.current[i];
        if (z) z.style.transform = "translateX(" + x.toFixed(2) + "px)";
      });
      if (roata.current) roata.current.style.transform = "rotate(" + st.roata.toFixed(2) + "deg)";
      st.randuri.forEach((a, i) => {
        const rand = randuri.current[i];
        if (rand) {
          rand.style.opacity = a.opacitate.toFixed(3);
          rand.style.transform = "translateY(" + a.y.toFixed(2) + "px)";
        }
      });
      for (const bucata of [nota.current, cta.current]) {
        if (bucata) {
          bucata.style.opacity = st.final.opacitate.toFixed(3);
          bucata.style.transform = "translateY(" + st.final.y.toFixed(2) + "px)";
        }
      }
      if (st.deschis !== deschisAcum) {
        deschisAcum = st.deschis;
        setDeschis(st.deschis);
      }
      tintaUsa = st.usa;
      if (cadru === 0 && tintaUsa !== unghiUsa) cadru = requestAnimationFrame(deseneazaUsa);
    };

    let programat = 0;
    const laDerulare = () => {
      if (programat !== 0) return;
      programat = requestAnimationFrame(() => {
        programat = 0;
        actualizeaza();
      });
    };

    actualizeaza();
    window.addEventListener("scroll", laDerulare, { passive: true });
    window.addEventListener("resize", laDerulare);
    return () => {
      window.removeEventListener("scroll", laDerulare);
      window.removeEventListener("resize", laDerulare);
      if (programat !== 0) cancelAnimationFrame(programat);
      if (cadru !== 0) cancelAnimationFrame(cadru);
    };
  }, [redus]);

  // Focus pe buton cu seiful inca inchis: pagina coboara pana la capatul canalului final.
  const laFocus = () => {
    const el = sectiune.current;
    if (redus !== false || !el) return;
    const r = el.getBoundingClientRect();
    const cursa = r.height - window.innerHeight;
    if (cursa <= 0) return;
    const p = progresSectiune(r.top, r.height, window.innerHeight);
    const tinta = CANALE_SEIF.final[1];
    if (p >= tinta) return;
    window.scrollTo({ top: window.scrollY + r.top + tinta * cursa, behavior: "instant" });
  };

  return (
    <section ref={sectiune} className={s.seif} aria-labelledby="seif-titlu">
      <div className={s.lipit}>
        <div className={s.cap}>
          <h2 id="seif-titlu" className={"t-h2-seif " + s.titlu}>
            {nerupt(SEIF.titlu)}
          </h2>
          <p className={s.subtitlu}>{nerupt(redus ? SEIF.subtitluStatic : SEIF.subtitlu)}</p>
        </div>
        <div className={s.scena}>
          <div className={s.camera}>
            <div className={s.interior} onFocusCapture={laFocus}>
              <p className="doar-cititor">{SEIF.declaratie}</p>
              <span className={s.eticheta} aria-hidden="true">
                {SEIF.etichetaExemplu}
              </span>
              <ul className={s.raft}>
                {SEIF.randuri.map((r, i) => (
                  <li
                    key={r.fisier}
                    className={s.rand}
                    ref={(n) => {
                      randuri.current[i] = n;
                    }}
                  >
                    <span className={s.nume}>{r.fisier}</span>
                    <span className={s.linie} aria-hidden="true" />
                    <span className={s.pastrat}>{r.pastrat}</span>
                  </li>
                ))}
              </ul>
              <p ref={nota} className={s.nota}>
                {nerupt(SEIF.nota)}
              </p>
              <div ref={cta} className={s.cta}>
                <Tinta legatura={SEIF.buton} className={s.buton}>
                  <span>{SEIF.buton.text}</span>
                  <Iconita nume="arrow-right" marime={15} contur={2} />
                </Tinta>
              </div>
            </div>
            <div ref={usa} className={s.usa} aria-hidden="true">
              <span className={s.inel + " " + s.inel1} />
              <span className={s.inel + " " + s.inel2} />
              {[s.zavor1, s.zavor2, s.zavor3].map((clasa, i) => (
                <span
                  key={clasa}
                  className={s.zavor + " " + clasa}
                  ref={(n) => {
                    zavoare.current[i] = n;
                  }}
                />
              ))}
              <div ref={roata} className={s.roata}>
                <RoataSeif />
              </div>
            </div>
          </div>
          <p className={s.stareRand}>
            <span className={s.stare + (deschis ? " " + s.stareDeschis : "")}>
              {deschis ? SEIF.stare.deschis : SEIF.stare.inchis}
            </span>
          </p>
        </div>
      </div>
    </section>
  );
}
