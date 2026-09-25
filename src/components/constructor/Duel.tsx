"use client";

// Simularea zilei (duelul, acasa-constructor.md §11): doua firme puse fata in fata, documentele
// care curg, scorul si fraza finala. Evenimentele si starea sunt calculate de `duel-motor.ts`;
// aici doar ceasul si desenul.
//
// CEASUL: porneste numai cand arena e vizibila macar 25% (si are cel putin 60 px); iese din
// fereastra -> se opreste; revine -> reincepe de la 0, daca nu se terminase. "Reluati simularea"
// reincepe oricand. La miscare redusa se arata direct starea finala, fara simulare (§15).
// Toate datele sunt fictive (plan D9); arena le declara in eticheta ei accesibila.

import { useEffect, useMemo, useRef, useState } from "react";
import type { CodCanal, CodCine, CodIndustrie, CodVolum } from "@/content/acasa";
import { DUEL, NUME_CANAL, SCENARII, completeaza, formatTimp, listaCanale } from "@/content/acasa-constructor";
import { construiesteSimularea, evenimentePana, stareDupa, type DocCuloar } from "./duel-motor";
import { IcBifaCerc, IcDosar, IcFisier, IconitaCanal } from "./Iconite";
import s from "./Chestionar.module.css";

type Props = {
  industrie: CodIndustrie;
  canale: CodCanal[];
  volum: CodVolum;
  cine: CodCine;
  /** Schimbarea ei reia simularea de la 0 (confirmarea si schimbarile de dupa ea). */
  cheie: number;
  /** Chemata la finalul fiecarei simulari; prima o data dezvaluie estimarea. */
  laTerminare: () => void;
};

/** Fractia vizibila si inaltimea minima de la care porneste ceasul (§11.2). */
export const PRAG_DUEL = 0.25;
export const INALTIME_MINIMA_DUEL = 60;

function cls(...clase: (string | false | null | undefined)[]): string {
  return clase.filter(Boolean).join(" ");
}

function miscareRedusa(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function Jeton({ doc }: { doc: DocCuloar }) {
  return (
    <>
      <span key={"j" + doc.cheie} className={s.jetonDoc}>
        <IcFisier marime={12} contur={1.6} />
        <span>{doc.nume}</span>
      </span>
      <span key={"i" + doc.cheie} className={s.insigna}>
        <IconitaCanal canal={doc.canal} marime={10} contur={1.8} />
        <span>{NUME_CANAL[doc.canal].insigna}</span>
      </span>
    </>
  );
}

/** Frunzele de dafin care incadreaza timpul economisit: desen nou, 26 x 34. */
function Dafin({ oglindit }: { oglindit?: boolean }) {
  return (
    <svg
      className={cls(s.dafin, oglindit && s.oglindit)}
      viewBox="0 0 26 34"
      width="19.9"
      height="26"
      aria-hidden="true"
      focusable="false"
    >
      <path className={s.tulpina} d="M17 33 C 10 27, 8 18, 11 4" />
      <path className={s.frunzaA} d="M11.5 7 C 7 6, 5 3, 6 0.5 C 9.5 1.5, 11.5 4, 11.5 7 Z" />
      <path className={s.frunzaB} d="M10.4 13 C 5.5 13, 2.8 10.5, 3 7.5 C 6.8 8, 9.8 10, 10.4 13 Z" />
      <path className={s.frunzaA} d="M10 19.5 C 5.2 20, 2 17.8, 1.8 14.8 C 5.8 14.8, 9 16.6, 10 19.5 Z" />
      <path className={s.frunzaB} d="M11.2 25.5 C 6.8 26.6, 3.4 25, 2.8 22.2 C 6.8 21.6, 10 23, 11.2 25.5 Z" />
      <path className={s.frunzaA} d="M12.5 12 C 15.8 9.5, 16.2 6, 14.6 3.8 C 12.2 6, 11.6 9, 12.5 12 Z" />
      <path className={s.frunzaB} d="M12.6 19 C 16.6 17.4, 17.8 14, 16.8 11.4 C 13.8 13, 12.4 16, 12.6 19 Z" />
    </svg>
  );
}

export default function Duel({ industrie, canale, volum, cine, cheie, laTerminare }: Props) {
  const parametri = useMemo(() => ({ industrie, canale, volum, cine }), [industrie, canale, volum, cine]);
  const sim = useMemo(() => construiesteSimularea(parametri), [parametri]);
  const [aplicate, setAplicate] = useState(0);
  const [reluari, setReluari] = useState(0);
  const arena = useRef<HTMLDivElement>(null);
  const terminat = useRef<string | null>(null);
  const laTerminareRef = useRef(laTerminare);
  const cheieSim = [cheie, reluari, industrie, canale.join(","), volum, cine].join("|");

  useEffect(() => {
    laTerminareRef.current = laTerminare;
  }, [laTerminare]);

  useEffect(() => {
    const total = sim.evenimente.length;
    if (terminat.current === cheieSim) return;
    if (miscareRedusa()) {
      setAplicate(total);
      terminat.current = cheieSim;
      laTerminareRef.current();
      return;
    }
    const el = arena.current;
    if (!el || !("IntersectionObserver" in window)) return;

    let cadru = 0;
    let ruleaza = false;
    let aplicateLocal = 0;
    let t0 = 0;
    const opreste = () => {
      if (cadru) cancelAnimationFrame(cadru);
      cadru = 0;
      ruleaza = false;
    };
    const pas = () => {
      const k = evenimentePana(sim, performance.now() - t0);
      if (k !== aplicateLocal) {
        aplicateLocal = k;
        setAplicate(k);
      }
      if (k >= total) {
        opreste();
        terminat.current = cheieSim;
        laTerminareRef.current();
        return;
      }
      cadru = requestAnimationFrame(pas);
    };
    const porneste = () => {
      ruleaza = true;
      t0 = performance.now();
      aplicateLocal = 0;
      setAplicate(0);
      cadru = requestAnimationFrame(pas);
    };
    const observator = new IntersectionObserver(
      (intrari) => {
        for (const intrare of intrari) {
          const vede =
            intrare.isIntersecting &&
            intrare.intersectionRatio >= PRAG_DUEL &&
            intrare.boundingClientRect.height >= INALTIME_MINIMA_DUEL;
          if (vede && !ruleaza && terminat.current !== cheieSim) porneste();
          else if (!vede && ruleaza) opreste();
        }
      },
      { threshold: [0, PRAG_DUEL, 0.5, 1] },
    );
    observator.observe(el);
    return () => {
      observator.disconnect();
      opreste();
    };
  }, [cheieSim, sim]);

  const st = useMemo(() => stareDupa(sim, parametri, aplicate), [sim, parametri, aplicate]);
  const duel = SCENARII[industrie].duel;
  const timp = formatTimp(st.timpPierdut);
  const timpBun = formatTimp(st.timpEconomisit);
  const fraza = completeaza(DUEL.final[cine], {
    volum: DUEL.volumInCuvinte[volum],
    canale: listaCanale(canale, "fraza"),
    timp: timpBun,
  });

  return (
    <div className={s.duel} data-duel={st.final ? "gata" : "ruleaza"}>
      <div className={s.capDuel}>
        <p className={s.etichetaDuel}>{DUEL.eticheta}</p>
        <button type="button" className={s.reluareDuel} onClick={() => setReluari((r) => r + 1)}>
          {DUEL.reluare}
        </button>
      </div>

      <div ref={arena} className={s.arena} role="group" aria-label={DUEL.declaratie}>
        {/* Firma fara arhiva */}
        <div className={cls(s.cardDuel, s.cardStang)}>
          <div className={s.capCardDuel}>
            <span className={s.numeFirma}>
              <span className={cls(s.punctFirma, s.punctPortocaliu)} aria-hidden="true" />
              <span className={s.numeFirmaText}>{DUEL.firmaFara}</span>
            </span>
            <span className={s.contorDuel}>
              {DUEL.nesortate}{" "}
              <span className={cls(s.numarContor, s.rau, "cifre")} data-nesortate>
                {st.nesortate}
              </span>
            </span>
          </div>
          <div className={s.culoar}>{st.culoarStanga ? <Jeton doc={st.culoarStanga} /> : null}</div>
          <p key={"s" + (st.stres?.cheie ?? 0)} className={cls(s.stres, st.stres && s.in)}>
            {st.stres?.text ?? ""}
          </p>
          <div className={s.gramada}>
            {st.gramadaStanga.map((r) =>
              r.fel === "termen" ? (
                <div key={r.cheie} className={cls(s.rand, s.randTermen)}>
                  {r.text}
                </div>
              ) : (
                <div key={r.cheie} className={cls(s.rand, s.randStang)}>
                  <IcFisier marime={12} contur={1.6} className={s.iconitaRand} />
                  <span className={s.numeFisier}>{r.text}</span>
                  <span className={s.faraEticheta}>{DUEL.faraEticheta}</span>
                </div>
              ),
            )}
          </div>
          <div className={s.dosare}>
            {duel.dosare.map((d) => (
              <span key={d} className={s.dosar}>
                <IcDosar marime={12} contur={1.6} className={s.iconitaDosar} />
                <span>{d}</span>
                <span className={cls(s.contorDosar, "cifre")}>0</span>
              </span>
            ))}
          </div>
          <div className={s.subsolDuel}>
            <span className={s.rau}>
              {DUEL.timpPierdut} <span className={s.valoareSubsol}>{timp}</span>
            </span>
            {st.termene > 0 ? (
              <span className={s.rau}>
                {DUEL.termeneRatate} <span className={cls(s.valoareSubsol, "cifre")}>{st.termene}</span>
              </span>
            ) : null}
          </div>
        </div>

        {/* Aceeasi firma, cu 3S */}
        <div className={cls(s.cardDuel, s.cardDrept)}>
          <div className={s.capCardDuel}>
            <span className={s.numeFirma}>
              <span className={cls(s.punctFirma, s.punctAlbastru)} aria-hidden="true" />
              <span className={s.numeFirmaText}>{DUEL.firmaCu}</span>
            </span>
            {st.final ? (
              <span className={s.inOrdine}>
                <span className={cls(s.punctFirma, s.punctVerde)} aria-hidden="true" />
                {DUEL.inOrdine}
              </span>
            ) : null}
          </div>
          <div className={s.culoar}>
            {st.culoarDreapta ? (
              <>
                <Jeton doc={st.culoarDreapta} />
                {st.culoarDreapta.ai ? (
                  <span key={"a" + st.culoarDreapta.cheie} className={s.jetonAi}>
                    {DUEL.ai}
                  </span>
                ) : null}
                {st.culoarDreapta.tip ? (
                  <span key={"t" + st.culoarDreapta.cheie} className={s.jetonTip}>
                    {st.culoarDreapta.tip}
                  </span>
                ) : null}
              </>
            ) : null}
          </div>
          <p className={cls(s.calm, st.final && s.in)}>{st.final ? DUEL.calm : ""}</p>
          <div className={s.gramada}>
            {st.gramadaDreapta.map((r) => (
              <div key={r.cheie} className={cls(s.rand, s.randDrept)}>
                <IcBifaCerc marime={13} contur={2} className={s.bifaRand} />
                <span className={s.numeFisier}>{r.nume}</span>
                <span className={s.tipRand}>{r.tip}</span>
              </div>
            ))}
          </div>
          <div className={s.dosare}>
            {duel.dosare.map((d, i) => (
              <span key={d} className={s.dosar}>
                <IcDosar marime={12} contur={1.6} className={s.iconitaDosar} />
                <span>{d}</span>
                <span
                  key={st.puls && st.puls.dosar === i ? "p" + st.puls.cheie : "fix"}
                  className={cls(s.contorDosar, s.contorAlbastru, st.puls?.dosar === i && s.puls, "cifre")}
                >
                  {st.dosareDreapta[i]}
                </span>
              </span>
            ))}
          </div>
          <div className={s.subsolDuel}>
            <span className={s.nesortateZero}>
              {DUEL.nesortate} <span className={cls(s.valoareSubsol, "cifre")}>0</span>
            </span>
            <span className={s.economisit}>
              {st.final ? <Dafin /> : null}
              <span>
                {DUEL.timpEconomisit} <span className={s.valoareSubsol}>+{timpBun}</span>
              </span>
              {st.final ? <Dafin oglindit /> : null}
            </span>
          </div>
          {st.toast ? (
            <div key={"toast" + st.toast.cheie} className={s.toast} role="status">
              <span className={cls(s.punctFirma, s.punctVerde)} aria-hidden="true" />
              {st.toast.text}
            </div>
          ) : null}
        </div>
      </div>

      {st.final ? (
        <>
          <div className={s.scor}>
            <div className={s.celulaScor}>
              <span className={s.etichetaScor}>{DUEL.scor.nesortate}</span>
              <span className={s.valoareScor}>
                <b className={cls(s.rau, "cifre")}>{st.nesortate}</b>
                <span className={s.vs}>{DUEL.scor.vs}</span>
                <b className="cifre">0</b>
              </span>
            </div>
            <div className={s.celulaScor}>
              <span className={s.etichetaScor}>{DUEL.scor.timp}</span>
              <span className={s.valoareScor}>
                <b className={cls(s.rau, "cifre")}>-{timp}</b>
                <span className={s.vs}>{DUEL.scor.vs}</span>
                <b className={cls(s.bun, "cifre")}>+{timpBun}</b>
              </span>
            </div>
            <div className={s.celulaScor}>
              <span className={s.etichetaScor}>{DUEL.scor.termene}</span>
              <span className={s.valoareScor}>
                <b className={cls(s.rau, "cifre")}>{st.termene}</b>
                <span className={s.vs}>{DUEL.scor.vs}</span>
                <b className="cifre">0</b>
              </span>
            </div>
          </div>
          <p className={s.frazaFinala}>{fraza}</p>
        </>
      ) : null}
    </div>
  );
}
