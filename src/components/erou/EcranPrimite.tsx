"use client";

// Ecranul 1 al aplicatiei demonstrative: actele primite (acasa-erou.md §1.6.5, "inbox").
//
// Ciclul unui mesaj, masurat, in ms de la sosire: 0 soseste (rand nou, plus o foaie zburatoare),
// 886 se citeste, 1679 tipul e recunoscut, 2582 se arhiveaza (eticheta dosarului e atinsa si
// contorul creste), 3478 notificarea, 5400 urmatorul mesaj. Patru exemple se rotesc; lista pastreaza
// ultimele doua, arhivate. Ceasul merge numai cat ecranul se vede (afisat in aplicatie si in
// fereastra, prag 0,25) si se opreste cat mouse-ul sta pe el. La fiecare vizita ciclul porneste de la
// primul mesaj. La miscare redusa ecranul arata direct starea de dupa primul ciclu.

import { memo, useEffect, useRef, useState } from "react";
import { MACHETA, type ActPrimit, type TipAct } from "@/content/acasa-erou";
import { useCronologie, useIesiri } from "./hooks";
import { Ic, type NumeIconitaMacheta } from "./iconite-macheta";
import m from "./Macheta.module.css";

const PRAGURI = [0, 886, 1679, 2582, 3478] as const;
const PERIOADA = 5400;
const PAS_ARHIVARE = 3;
const PAS_NOTIFICARE = 4;

const ICONITA_TIP: Record<TipAct, NumeIconitaMacheta> = {
  factura: "zap",
  contract: "file-pen-line",
  aviz: "truck",
  raport: "calculator",
};

type StareRand = "intra" | "citire" | "recunoscut" | "arhivare" | "arhivat";

const STARE_PAS: readonly StareRand[] = ["intra", "citire", "recunoscut", "arhivare", "arhivare"];

function modPozitiv(n: number, k: number): number {
  return ((n % k) + k) % k;
}

export type EcranPrimiteProps = {
  redus: boolean;
  telefon: boolean;
  /** Ecranul e cel afisat de aplicatie, iar aplicatia se vede. Ascuns, ecranul sta pe loc. */
  activ: boolean;
  /** Anunta sosirea unui mesaj nou (foaia zburatoare). */
  laMesajNou?: () => void;
};

// `memo`: ecranele raman montate unul langa altul (Aplicatie.tsx); cand se schimba ecranul afisat, se
// randeaza din nou doar cele doua ale caror proprietati s-au schimbat.
export default memo(function EcranPrimite({ redus, telefon, activ, laMesajNou }: EcranPrimiteProps) {
  const p = MACHETA.primite;
  const radacina = useRef<HTMLDivElement>(null);
  const [vizibil, setVizibil] = useState(false);
  const [pauza, setPauza] = useState(false);
  const iesiri = useIesiri(activ);

  useEffect(() => {
    const el = radacina.current;
    if (!el) return;
    const observator = new IntersectionObserver((intrari) => setVizibil(intrari[intrari.length - 1].isIntersecting), {
      threshold: 0.25,
    });
    observator.observe(el);
    return () => observator.disconnect();
  }, []);

  // Mouse-ul ramas pe ecran cand acesta iese din vedere nu mai trimite `mouseleave`.
  useEffect(() => {
    if (!activ) setPauza(false);
  }, [activ]);

  const cronologie = useCronologie(PRAGURI, PERIOADA, activ && !redus && vizibil && !pauza, iesiri);
  const ciclu = redus ? 0 : cronologie.ciclu;
  const pas = redus ? PAS_NOTIFICARE : Math.max(0, cronologie.pas);

  // Foaia zburatoare pleaca o singura data pe mesaj: la schimbarea ciclului, cat ecranul se vede.
  // O vizita noua porneste iar de la primul mesaj, deci si foaia lui pleaca din nou.
  const ultimulCiclu = useRef({ iesiri, ciclu: -1 });
  useEffect(() => {
    const u = ultimulCiclu.current;
    if (redus || !activ || !vizibil || (u.iesiri === iesiri && u.ciclu === ciclu)) return;
    ultimulCiclu.current = { iesiri, ciclu };
    laMesajNou?.();
  }, [ciclu, iesiri, redus, activ, vizibil, laMesajNou]);

  const act = (k: number): ActPrimit => p.acte[modPozitiv(k, p.acte.length)];
  const randuri: { k: number; stare: StareRand }[] = [
    { k: ciclu, stare: STARE_PAS[pas] },
    { k: ciclu - 1, stare: "arhivat" },
    { k: ciclu - 2, stare: "arhivat" },
  ];

  // Contoarele dosarelor: valoarea de pornire plus fiecare arhivare vazuta.
  const numar = (dosar: string) => {
    const baza = p.dosare.find((d) => d.nume === dosar)?.numar ?? 0;
    let arhivate = 0;
    for (let c = 0; c <= ciclu; c++) {
      if ((c < ciclu || pas >= PAS_ARHIVARE) && act(c).dosar === dosar) arhivate++;
    }
    return baza + arhivate;
  };
  const curent = act(ciclu);

  return (
    <div
      ref={radacina}
      className={m.ecran}
      onMouseEnter={() => setPauza(true)}
      onMouseLeave={() => setPauza(false)}
    >
      <div className={m.ecranBara}>
        <span className={m.ecranTitlu}>
          <Ic n="inbox" m={15} />
          {p.titlu}
        </span>
        <span className={m.adresaPrimire}>
          <Ic n="mail" m={12} c={1.8} />
          <span className={m.adresaPrimireText}>{p.adresaPrimire}</span>
        </span>
      </div>
      <div className={m.ecranCorp}>
        <p className={m.etichetaSectiune}>{p.eticheta}</p>
        <div className={m.listaPrimite}>
          {randuri.map((r, i) => {
            const a = act(r.k);
            return (
              <div
                key={r.k}
                className={m.randPrimit + " " + m["rand-" + r.stare] + (i === 0 && activ && !redus ? " " + m.randNou : "")}
              >
                <span className={m.avatar + " " + m["ton-" + a.tip]}>
                  <Ic n={ICONITA_TIP[a.tip]} m={17} c={1.8} />
                </span>
                <span className={m.randContinut}>
                  <span className={m.randSus}>
                    {r.stare !== "arhivat" ? <span className={m.necitit} /> : null}
                    <span className={m.expeditor}>{a.expeditor}</span>
                    <span className={m.ora}>{p.momente[i]}</span>
                  </span>
                  <span className={m.subiect}>{a.subiect}</span>
                  <span className={m.randJos}>
                    <span className={m.atasament}>
                      <Ic n="paperclip" m={12} c={1.8} />
                      <span>{a.fisier}</span>
                    </span>
                    <EtichetaStare stare={r.stare} act={a} seCiteste={p.seCiteste} />
                  </span>
                </span>
              </div>
            );
          })}
        </div>
        {pas >= PAS_NOTIFICARE ? (
          <div className={m.notificare} key={"n" + ciclu}>
            <Ic n="bell" m={14} c={1.8} className={m.notificareClopotel} />
            <span>
              {p.anuntat} <strong>{curent.anuntat.nume}</strong>
            </span>
            <span className={m.rolMic}>{curent.anuntat.rol}</span>
            <Ic n="check" m={13} c={2.4} className={m.notificareBifa} />
          </div>
        ) : null}
        {!telefon ? (
          <>
            <p className={m.etichetaSectiune}>{p.arhivateIn}</p>
            <div className={m.dosareDestinatie}>
              {p.dosare.map((d) => (
                <span
                  key={d.nume}
                  className={
                    m.dosarDestinatie + (pas === PAS_ARHIVARE && curent.dosar === d.nume && !redus ? " " + m.dosarAtins : "")
                  }
                >
                  <Ic n="folder" m={13} c={1.8} />
                  {d.nume}
                  <span className={m.contor}>{numar(d.nume)}</span>
                </span>
              ))}
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
});

function EtichetaStare({ stare, act, seCiteste }: { stare: StareRand; act: ActPrimit; seCiteste: string }) {
  if (stare === "intra") return null;
  if (stare === "citire") {
    return (
      <span className={m.etichetaTip}>
        <Ic n="zap" m={11} c={2} />
        {seCiteste}
      </span>
    );
  }
  if (stare === "recunoscut" || stare === "arhivare") {
    return (
      <span className={m.etichetaTip}>
        <Ic n="zap" m={11} c={2} />
        {act.recunoscut}
      </span>
    );
  }
  return (
    <span className={m.etichetaArhivat + " " + m["dosar-" + act.tip]}>
      <Ic n="check" m={11} c={2.4} />
      {act.dosar}
    </span>
  );
}
