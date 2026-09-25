"use client";

// Ecranul 2 al aplicatiei demonstrative: dosarele si o regula automata (acasa-erou.md §1.6.5,
// "documente").
//
// Pasii masurati ai regulii, in ms: +354 actul se aprinde, +1316 dosarul se aprinde si pornesc cei
// doi destinatari (al doilea cu 180 ms intarziere, din CSS), +2309 livrat; bucla la 5000 ms. Clicul
// pe alt dosar schimba dosarul regulii si reia bucla; mouse-ul pe panou o opreste. Ceasul merge numai
// cat ecranul e afisat, iar fiecare vizita porneste de la primul dosar. La miscare redusa regula se
// arata direct livrata.

import { memo, useEffect, useState } from "react";
import { MACHETA } from "@/content/acasa-erou";
import { useCronologie, useIesiri } from "./hooks";
import { Ic } from "./iconite-macheta";
import m from "./Macheta.module.css";

const PRAGURI = [0, 354, 1316, 2309] as const;
const PERIOADA = 5000;
const PAS_ACT = 1;
const PAS_PORNIT = 2;
const PAS_LIVRAT = 3;

// `memo`: ecranele raman montate unul langa altul (Aplicatie.tsx); vezi EcranPrimite.tsx.
export default memo(function EcranDocumente({ redus, telefon, activ }: { redus: boolean; telefon: boolean; activ: boolean }) {
  const d = MACHETA.documente;
  const [ales, setAles] = useState(0);
  const [pauza, setPauza] = useState(false);
  const iesiri = useIesiri(activ);

  // Iesirea din ecran il readuce la inceput, cat e ascuns (vezi `useIesiri`).
  useEffect(() => {
    if (activ) return;
    setAles(0);
    setPauza(false);
  }, [activ]);

  const cronologie = useCronologie(PRAGURI, PERIOADA, activ && !redus && !pauza, ales + ":" + iesiri);
  const pas = redus ? PAS_LIVRAT : cronologie.pas;
  const dosar = d.dosare[ales];

  const stareDestinatar = pas >= PAS_LIVRAT ? "livrat" : pas >= PAS_PORNIT ? "pornit" : "asteptare";
  const textStare = pas >= PAS_LIVRAT ? d.stari.livrat : pas >= PAS_PORNIT ? d.stari.trimite : d.stari.asteptare;

  return (
    <div className={m.ecran}>
      <div className={m.ecranBara}>
        <span className={m.ecranTitlu + " " + m.spatiuLucru}>
          <Ic n="building-2" m={15} />
          {d.spatiu}
          <Ic n="chevron-down" m={14} c={2} />
        </span>
      </div>
      <div className={m.ecranCorp}>
        <p className={m.fir}>
          <Ic n="house" m={14} c={1.8} />
          <span className="doar-cititor">{d.acasa}</span>
        </p>
        <div className={m.grilaDosare}>
          {d.dosare.map((x, i) => (
            <button
              key={x.nume}
              type="button"
              className={m.cardDosar + (i === ales ? " " + m.cardDosarActiv : "")}
              aria-pressed={i === ales}
              onClick={() => setAles(i)}
            >
              <span className={m.reguliDosar}>
                <Ic n="zap" m={10} c={2.2} />
                {x.reguli}
              </span>
              <Ic n="folder" m={22} c={1.6} className={m.iconitaDosar} />
              <span className={m.numeDosar}>{x.nume}</span>
              <span className={m.metaDosar}>
                {d.unitateFisiere(x.fisiere)} ·<span className={m.acces}>{x.acces}</span>
              </span>
            </button>
          ))}
        </div>

        <div className={m.panouRegula} onMouseEnter={() => setPauza(true)} onMouseLeave={() => setPauza(false)}>
          <div className={m.capRegula}>
            <span className={m.titluRegula}>
              <Ic n="zap" m={14} c={2} className={m.iconitaAlbastra} />
              {d.regulaTitlu}
              <span className={m.dosarRegula}>· {dosar.nume}</span>
            </span>
            <span className={m.butonRegula}>
              <Ic n="plus" m={12} c={2.2} />
              {d.regulaNoua}
            </span>
          </div>
          <div className={m.fluxRegula}>
            <div className={m.randRegula}>
              <span className={m.etichetaCand}>{d.cand}</span>
              <span className={m.fisierRegula + (pas >= PAS_ACT ? " " + m.aprins : "")}>{dosar.regula.fisier}</span>
              <Ic n="arrow-right" m={14} c={2} className={m.sageataRegula} />
              <span className={m.dosarTinta + (pas >= PAS_PORNIT ? " " + m.aprins : "")}>
                <Ic n="folder" m={13} c={2} />
                {dosar.nume}
              </span>
            </div>
            <div className={m.randRegula + " " + m.randAtunci}>
              <span className={m.etichetaAtunci}>{d.atunci}</span>
              <div className={m.destinatari}>
                {dosar.regula.destinatari.map((dest) => (
                  <div key={dest.nume + dest.canal} className={m.destinatar + " " + m["dest-" + stareDestinatar]}>
                    <span className={m.placa + " " + m["placa-" + dest.canal]}>
                      <Ic n={dest.canal === "email" ? "mail" : "bell"} m={13} c={1.8} />
                    </span>
                    <span className={m.initiale}>{dest.initiale}</span>
                    <span className={m.numeDest}>{dest.nume}</span>
                    <span className={m.rolMic}>{dest.rol}</span>
                    <span className={m.stareDest}>
                      {stareDestinatar === "livrat" ? (
                        <Ic n="check" m={9} c={3} className={m.bifaVerde} />
                      ) : (
                        <span className={m.punctStare} />
                      )}
                      {textStare}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {!telefon ? (
          <>
            <p className={m.etichetaSectiune}>{d.recente}</p>
            <div className={m.grilaRecente}>
              {d.acteRecente.map((a) => (
                <div key={a.fisier} className={m.cardRecent}>
                  <span className={m.previzualizare + (a.fel === "XLS" ? " " + m.previzualizareTabel : "")}>
                    <span className={m.insigna + " " + (a.fel === "PDF" ? m.insignaPdf : m.insignaXls)}>{a.fel}</span>
                  </span>
                  <span className={m.numeRecent}>{a.fisier}</span>
                  <span className={m.metaRecent}>{a.meta}</span>
                </div>
              ))}
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
});
