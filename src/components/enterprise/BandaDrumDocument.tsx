"use client";

// Banda inchisa cu drumul unui document (enterprise.md §2, COMPONENTE §4.7).
//
// BUCLA de 11,0 s in 10 pasi (masurata): la +2,0 s intrarile, legatura 1 si faptul 1; +2,8 / +3,4 /
// +4,0 / +4,7 / +5,3 s elementele citirii, cu faptele 2-4; +5,9 s stratul de pastrare; +6,8 s
// legatura 2 si iesirile; +7,8 s faptul 5, axa timpului (sina 2,6 s) si nota; la 11,0 s totul se
// stinge si bucla reia.
//
// PORNESTE cand banda intra in fereastra si SE OPRESTE pe pasul curent cand iese; la revenire,
// pasul urmator vine dupa 0,8 s (masurat: 3 s plecat -> starea neschimbata, apoi +0,8 s).
//
// STAREA STATICA: HTML-ul servit e starea FINALA (toate elementele aprinse), deci textul se citeste
// fara JavaScript si la miscare redusa. Ca sa nu clipeasca la hidratare, clasa `asteapta` stinge
// banda din CSS numai cand scriptul ruleaza si miscarea nu e redusa (`@media (scripting: enabled)`);
// componenta o scoate dupa ce preia controlul.

import { useEffect, useRef, useState } from "react";
import { Clock, Cpu, Database, Inbox, Share2 } from "lucide-react";
import { DRUM_DOCUMENT } from "@/content/enterprise";
import s from "./enterprise.module.css";

/** Momentele pasilor 1-9, in ms de la repornire; pasul 0 = totul stins. */
export const MOMENTE_PASI = [2000, 2800, 3400, 4000, 4700, 5300, 5900, 6800, 7800] as const;
export const DURATA_BUCLA = 11_000;
export const PAS_FINAL = MOMENTE_PASI.length;
/** Pauza de dupa revenirea in fereastra, pana la pasul urmator (masurat 0,8 s). */
export const REVENIRE_MS = 800;

/** Pasul la care se aprinde fiecare fapt (in ordinea din continut). */
const PAS_FAPT = [1, 3, 4, 6, 9];
/** Pasul la care se aprinde fiecare element al citirii. */
const PAS_CITIRE = [2, 3, 4, 5, 6];

/** Cat asteapta pasul `pas` (1..9) dupa cel dinainte; dupa pasul final, pana la repornire. */
export function asteptare(pasCurent: number): number {
  if (pasCurent >= PAS_FINAL) return DURATA_BUCLA - MOMENTE_PASI[PAS_FINAL - 1];
  const anterior = pasCurent === 0 ? 0 : MOMENTE_PASI[pasCurent - 1];
  return MOMENTE_PASI[pasCurent] - anterior;
}

export default function BandaDrumDocument() {
  const [pas, setPas] = useState<number>(PAS_FINAL);
  const [asteapta, setAsteapta] = useState(true);
  const radacina = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = radacina.current;
    const redus = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!el || redus || !("IntersectionObserver" in window)) {
      setPas(PAS_FINAL);
      setAsteapta(false);
      return;
    }
    let curent = 0;
    let ceas: ReturnType<typeof setTimeout> | null = null;
    let vizibil = false;
    let pornit = false;
    setPas(0);
    setAsteapta(false);

    const programeaza = (ms: number) => {
      if (ceas) clearTimeout(ceas);
      ceas = setTimeout(() => {
        curent = curent >= PAS_FINAL ? 0 : curent + 1;
        setPas(curent);
        programeaza(asteptare(curent));
      }, ms);
    };

    const observator = new IntersectionObserver((intrari) => {
      const acum = intrari.some((i) => i.isIntersecting);
      if (acum === vizibil) return;
      vizibil = acum;
      if (vizibil) {
        programeaza(pornit ? REVENIRE_MS : asteptare(curent));
        pornit = true;
      } else if (ceas) {
        clearTimeout(ceas);
        ceas = null;
      }
    });
    observator.observe(el);
    return () => {
      observator.disconnect();
      if (ceas) clearTimeout(ceas);
    };
  }, []);

  const a = (k: number) => (pas >= k ? s.aprins : "");
  const d = DRUM_DOCUMENT;

  return (
    <section
      ref={radacina}
      className={[s.banda, asteapta ? s.asteapta : ""].join(" ")}
      aria-labelledby="drum-document-titlu"
      data-pas={pas}
    >
      <div className="container-site">
        <div className={s.bandaInterior}>
          <h2 id="drum-document-titlu" className={s.bandaTitlu}>
            {d.titlu}
          </h2>
          <div className={s.diagrama}>
            <div className={s.lateral}>
              <p className={s.eticheta}>
                <Inbox size={15} strokeWidth={1.5} aria-hidden="true" className={s.etichetaIconita} />
                {d.intrare.eticheta}
              </p>
              <ul className={s.lista}>
                {d.intrare.elemente.map((t) => (
                  <li key={t} className={[s.element, a(1)].join(" ")}>
                    {t}
                  </li>
                ))}
              </ul>
            </div>
            <span className={[s.legatura, a(1)].join(" ")} aria-hidden="true" />
            <div className={s.miez}>
              <div className={s.stratSus}>
                <p className={s.eticheta}>
                  <Cpu size={15} strokeWidth={1.5} aria-hidden="true" className={s.etichetaIconita} />
                  {d.intelegere.eticheta}
                </p>
                <ul className={s.lista}>
                  {d.intelegere.elemente.map((t, i) => (
                    <li key={t} className={[s.element, a(PAS_CITIRE[i])].join(" ")}>
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
              <div className={[s.stratJos, a(7)].join(" ")}>
                <p className={s.eticheta}>
                  <Database size={15} strokeWidth={1.5} aria-hidden="true" className={s.etichetaIconita} />
                  {d.stocare.eticheta}
                </p>
                <ul className={s.pastile}>
                  {d.stocare.pastile.map((t) => (
                    <li key={t} className={s.pastila}>
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <span className={[s.legatura, a(8)].join(" ")} aria-hidden="true" />
            <div className={s.lateral}>
              <p className={s.eticheta}>
                <Share2 size={15} strokeWidth={1.5} aria-hidden="true" className={s.etichetaIconita} />
                {d.iesire.eticheta}
              </p>
              <ul className={s.lista}>
                {d.iesire.elemente.map((t) => (
                  <li key={t} className={[s.element, a(8)].join(" ")}>
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className={s.subsolDiagrama}>
            {/* D11: eticheta vizibila tot timpul; declaratia pentru cititoare e nota de mai jos. */}
            <span className={s.etichetaExemplu} aria-hidden="true">
              {d.etichetaExemplu}
            </span>
            <ul className={s.fapte}>
              {d.fapte.map((f, i) => (
                <li key={f.text} className={[s.fapt, f.mono ? s.faptMono : "", a(PAS_FAPT[i])].join(" ")}>
                  {f.text}
                </li>
              ))}
            </ul>
            <div className={[s.axa, a(9)].join(" ")}>
              <Clock size={14} strokeWidth={1.5} aria-hidden="true" className={s.axaIconita} />
              <span className={s.an}>{d.anStart}</span>
              <span className={s.sina} aria-hidden="true">
                <span className={s.umplere} />
              </span>
              <span className={s.an}>{d.anFinal}</span>
            </div>
            <p className={[s.nota, a(9)].join(" ")}>{d.nota}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
