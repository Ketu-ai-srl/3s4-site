"use client";

// Rama playerului de pe /incepe (COMPONENTE §4.11 "ScenaBunVenit + PlayerVideo"; incepe.md §1), cu o
// DEMONSTRATIE animata in HTML in locul clipului (plan §6.9: fara clip inventat). Forma e a playerului
// masurat: rama 16:9 de 880 (358 la 390), butonul mare de pornire, bara de comenzi care se stinge dupa
// 3,5 s de rulare fara miscare, progresul in gradient, timpul cu cifre tabulare, repetarea, blocul cu
// cele doua iesiri dupa final.
//
// DECLARATA ca demonstratie: eticheta vizibila din colt ("Demonstrație" si "exemplu", 11 px, AA pe
// fundalul ei) si declaratia pentru cititorul de ecran. Datele din interfata sunt fictive (D9, D11).
//
// HTML-UL SERVIT are toate cele 4 scene (textul lor e in pagina fara JavaScript) si arata prima, ca
// un cadru de pornire. Scena curenta o decide timpul; ceasul e `requestAnimationFrame`, pornit numai
// la apasare si oprit la pauza, la final si cand pagina e ascunsa.
//
// MISCARE REDUSA: nicio tranzitie (CSS), textul intrebarii apare intreg, bara de comenzi nu se
// stinge; scenele se schimba tot la timp, fiindca rularea o porneste omul, cu butonul.

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import {
  CircleCheck,
  FileText,
  Folder,
  Inbox,
  MessageCircle,
  Pause,
  Play,
  Repeat,
  RotateCcw,
  Search,
  Workflow,
} from "lucide-react";
import { INCEPE } from "@/content/conversie";
import s from "./incepe.module.css";

type Stare = "repaus" | "ruleaza" | "pauza" | "final";

const SCENE = INCEPE.demo.scene;
export const DURATA_TOTALA = SCENE.reduce((t, x) => t + x.durata, 0);
const STINGERE_MS = 3500;

/** Scena de la momentul `t` (ms) si timpul scurs in ea. */
export function scenaLa(t: number): { index: number; inScena: number } {
  let rest = Math.max(0, Math.min(t, DURATA_TOTALA - 1));
  for (let i = 0; i < SCENE.length; i++) {
    if (rest < SCENE[i].durata) return { index: i, inScena: rest };
    rest -= SCENE[i].durata;
  }
  return { index: SCENE.length - 1, inScena: SCENE[SCENE.length - 1].durata };
}

/** Timpul ca m:ss. */
export function ceas(ms: number): string {
  const sec = Math.floor(ms / 1000);
  return Math.floor(sec / 60) + ":" + String(sec % 60).padStart(2, "0");
}

export default function DemoInterfata({ final }: { final: ReactNode }) {
  const d = INCEPE.demo;
  const a = d.aplicatie;
  const [stare, setStare] = useState<Stare>("repaus");
  const [timp, setTimp] = useState(0);
  const [repetare, setRepetare] = useState(false);
  const [comenziAscunse, setComenziAscunse] = useState(false);
  const [redusa, setRedusa] = useState(false);
  const cadru = useRef<number | null>(null);
  const ultim = useRef<number | null>(null);
  const stingere = useRef<number | null>(null);
  const timpRef = useRef(0);
  const repetareRef = useRef(repetare);
  repetareRef.current = repetare;

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const aplica = () => setRedusa(mq.matches);
    aplica();
    mq.addEventListener("change", aplica);
    return () => mq.removeEventListener("change", aplica);
  }, []);

  const opresteCeasul = useCallback(() => {
    if (cadru.current !== null) cancelAnimationFrame(cadru.current);
    cadru.current = null;
    ultim.current = null;
  }, []);

  const bucla = useCallback((acum: number) => {
    const dt = ultim.current === null ? 0 : acum - ultim.current;
    ultim.current = acum;
    let urm = timpRef.current + dt;
    if (urm >= DURATA_TOTALA) {
      if (repetareRef.current) {
        urm = 0;
      } else {
        timpRef.current = DURATA_TOTALA;
        setTimp(DURATA_TOTALA);
        cadru.current = null;
        ultim.current = null;
        setStare("final");
        return;
      }
    }
    timpRef.current = urm;
    setTimp(urm);
    cadru.current = requestAnimationFrame(bucla);
  }, []);

  const porneste = useCallback(() => {
    if (cadru.current !== null) return;
    ultim.current = null;
    cadru.current = requestAnimationFrame(bucla);
  }, [bucla]);

  // Ceasul merge numai cat starea e "ruleaza"; se opreste la demontare.
  useEffect(() => {
    if (stare === "ruleaza") porneste();
    else opresteCeasul();
    return opresteCeasul;
  }, [stare, porneste, opresteCeasul]);

  // Pagina ascunsa (alt tab): pauza.
  useEffect(() => {
    const laVizibilitate = () => {
      if (document.hidden) setStare((x) => (x === "ruleaza" ? "pauza" : x));
    };
    document.addEventListener("visibilitychange", laVizibilitate);
    return () => document.removeEventListener("visibilitychange", laVizibilitate);
  }, []);

  // Bara de comenzi se stinge dupa 3,5 s de rulare fara miscare (nu si la miscare redusa).
  const aratComenzile = useCallback(() => {
    setComenziAscunse(false);
    if (stingere.current !== null) window.clearTimeout(stingere.current);
    stingere.current = null;
    if (stare === "ruleaza" && !redusa) {
      stingere.current = window.setTimeout(() => setComenziAscunse(true), STINGERE_MS);
    }
  }, [stare, redusa]);

  useEffect(() => {
    aratComenzile();
    return () => {
      if (stingere.current !== null) window.clearTimeout(stingere.current);
    };
  }, [aratComenzile]);

  const comuta = () => {
    if (stare === "ruleaza") setStare("pauza");
    else if (stare === "final") {
      timpRef.current = 0;
      setTimp(0);
      setStare("ruleaza");
    } else setStare("ruleaza");
  };

  const reia = () => {
    timpRef.current = 0;
    setTimp(0);
    setStare("ruleaza");
  };

  const { index, inScena } = scenaLa(timp);
  const scena = stare === "final" ? SCENE.length - 1 : index;
  const progres = Math.min(1, timp / DURATA_TOTALA);
  const textCautat = a.intrebare.text;
  // Textul intrebarii apare numai de la scena a treia; la miscare redusa, intreg, fara tastare.
  const litere =
    scena < 2
      ? 0
      : redusa || scena > 2
        ? textCautat.length
        : Math.min(textCautat.length, Math.floor((inScena / 2600) * textCautat.length));
  const eticheta = stare === "ruleaza" ? d.pauza : stare === "pauza" ? d.continua : stare === "final" ? d.reia : d.porneste;

  return (
    <>
      <figure
        className={[s.rama, comenziAscunse ? s.ramaLinistita : ""].filter(Boolean).join(" ")}
        data-stare={stare}
        data-scena={scena}
        onPointerMove={aratComenzile}
        onFocusCapture={aratComenzile}
      >
        <figcaption className="doar-cititor">{d.declaratie}</figcaption>

        <div className={s.demo} aria-hidden="true">
          <div className={s.app}>
            <aside className={s.appMeniu}>
              <p className={s.appSpatiu}>
                <span className={s.appSigla}>3S</span>
                <span>{a.spatiu}</span>
              </p>
              <ul className={s.appLista}>
                {a.meniu.map((m, i) => (
                  <li key={m} className={i === Math.min(scena, 2) ? s.appActiv : undefined}>
                    {m}
                  </li>
                ))}
              </ul>
            </aside>
            <div className={s.appCorp}>
              <div className={s.appCautare}>
                <Search className={s.appLupa} />
                <span className={s.appCamp}>
                  {litere > 0 ? textCautat.slice(0, litere) : a.intrebare.camp}
                  {scena === 2 && litere < textCautat.length ? <span className={s.cursor} /> : null}
                </span>
              </div>

              <div className={s.cadru} data-activa={scena === 0 ? "" : undefined}>
                <p className={s.scenaTitlu}>
                  <Inbox className={s.scenaIconita} />
                  {a.intrare.titlu}
                </p>
                <div className={s.randIntrare}>
                  <span className={s.canal}>
                    <MessageCircle className={s.canalIconita} />
                    {a.intrare.canal}
                  </span>
                  <span className={s.fisier}>{a.intrare.fisier}</span>
                  <span className={s.eticheta}>{a.intrare.stare}</span>
                </div>
              </div>

              <div className={s.cadru} data-activa={scena === 1 ? "" : undefined}>
                <p className={s.scenaTitlu}>
                  <Folder className={s.scenaIconita} />
                  {a.dosar.titlu}
                </p>
                <p className={s.cale}>{a.dosar.cale.join(" / ")}</p>
                <div className={s.cardFisier}>
                  <FileText className={s.cardFisierIconita} />
                  <span className={s.fisier}>{a.intrare.fisier}</span>
                  <span className={s.eticheta}>{a.dosar.eticheta}</span>
                </div>
                <p className={s.regula}>
                  <Workflow className={s.regulaIconita} />
                  {a.dosar.regula}
                  <CircleCheck className={s.bifa} />
                </p>
              </div>

              <div className={s.cadru} data-activa={scena >= 2 ? "" : undefined}>
                <p className={s.scenaTitlu}>
                  <Search className={s.scenaIconita} />
                  {a.intrebare.camp}
                </p>
                <div className={s.raspuns} data-vizibil={scena === 3 ? "" : undefined}>
                  <p className={s.raspunsText}>{a.raspuns.text}</p>
                  <p className={s.sursa}>
                    <FileText className={s.sursaIconita} />
                    <span>{a.raspuns.sursa}</span>
                    <span className={s.sursaPagina}>{a.raspuns.pagina}</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
          <p className={s.insigna}>
            <span>{d.eticheta}</span>
            <span className={s.insignaExemplu}>{d.exemplu}</span>
          </p>
        </div>

        {stare === "repaus" || stare === "final" ? (
          <button type="button" className={s.butonMare} onClick={comuta} aria-label={eticheta}>
            {stare === "final" ? <RotateCcw className={s.butonMareIconita} /> : <Play className={s.butonMareIconita} />}
          </button>
        ) : null}

        <div className={s.comenzi}>
          <div
            className={s.pista}
            role="progressbar"
            aria-label={d.progres}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(progres * 100)}
            aria-valuetext={SCENE[scena].eticheta}
          >
            <span className={s.progres} style={{ transform: "scaleX(" + progres + ")" }} />
          </div>
          <div className={s.butoane}>
            <button type="button" className={s.buton} onClick={comuta} aria-label={eticheta}>
              {stare === "ruleaza" ? <Pause /> : <Play />}
            </button>
            <button type="button" className={s.buton} onClick={reia} aria-label={d.reia}>
              <RotateCcw />
            </button>
            <span className={s.timp}>
              <span className={s.timpCurent}>{ceas(timp)}</span>
              <span className={s.timpSeparator}>/</span>
              <span className={s.timpTotal}>{ceas(DURATA_TOTALA)}</span>
            </span>
            <span className={s.scenaCurenta}>{SCENE[scena].eticheta}</span>
            <button
              type="button"
              className={[s.buton, s.butonDreapta, repetare ? s.butonActiv : ""].filter(Boolean).join(" ")}
              onClick={() => setRepetare((r) => !r)}
              aria-pressed={repetare}
              aria-label={d.repetare}
            >
              <Repeat />
            </button>
          </div>
        </div>
      </figure>
      <div className={s.final} hidden={stare !== "final"} data-final-demo="">
        {final}
      </div>
    </>
  );
}
