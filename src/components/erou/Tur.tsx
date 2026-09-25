"use client";

// Faza 1 a machetei: turul (acasa-erou.md §1.6.4).
//
// Cronologia masurata, de la intrarea machetei: bun-venit (sigla 52 si un rand de titlu, intrare
// 700 ms), stins dupa 2300 ms in 600 ms; apoi 3 scene a cate 7000 ms; dupa a treia, aplicatia
// demonstrativa. Sageata stanga e circulara, cea dreapta trece de pe scena 3 la aplicatie, punctele
// sar direct; orice actiune reporneste temporizatorul.
//
// La miscare redusa: fara bun-venit (turul incepe pe scena 1), fara avans automat, ilustratii
// statice.

import { useEffect, useState, type ReactNode } from "react";
import { TUR } from "@/content/acasa-erou";
import { Ic } from "./iconite-macheta";
import IlustratieScena from "./IlustratiiTur";
import m from "./Macheta.module.css";

/** Bun-venitul sta 2300 ms, apoi se stinge in 600 ms (§1.6.3: +2641 si +3251 fata de t0). */
const BUN_VENIT_MS = 2300;
const STINGERE_MS = 610;
/** Fiecare scena, 7000 ms. */
const SCENA_MS = 7000;

export type TurProps = {
  redus: boolean;
  sigla: ReactNode;
  laFinal: () => void;
};

export default function Tur({ redus, sigla, laFinal }: TurProps) {
  // -1 = bun-venit; 0..2 = scenele.
  const [pas, setPas] = useState(redus ? 0 : -1);
  const [stingere, setStingere] = useState(false);
  /** Creste la fiecare actiune a omului, ca temporizatorul sa porneasca din nou. */
  const [actiune, setActiune] = useState(0);
  const total = TUR.scene.length;

  // Bun-venitul: 2300 ms vizibil, apoi 600 ms de stingere, apoi scena 1.
  useEffect(() => {
    if (pas !== -1) return;
    const t1 = window.setTimeout(() => setStingere(true), BUN_VENIT_MS);
    const t2 = window.setTimeout(() => setPas(0), BUN_VENIT_MS + STINGERE_MS);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [pas]);

  // Avansul automat: 7000 ms pe scena; dupa ultima, aplicatia.
  useEffect(() => {
    if (redus || pas < 0) return;
    const t = window.setTimeout(() => {
      if (pas + 1 < total) setPas(pas + 1);
      else laFinal();
    }, SCENA_MS);
    return () => window.clearTimeout(t);
  }, [pas, actiune, redus, total, laFinal]);

  const mergiLa = (nou: number) => {
    setActiune((a) => a + 1);
    setPas(nou);
  };

  if (pas === -1) {
    return (
      <div className={m.corpTur}>
        <div className={m.bunVenit + (stingere ? " " + m.bunVenitStins : "")}>
          <span className={m.bunVenitSigla}>{sigla}</span>
          <p className={m.bunVenitTitlu}>{TUR.bunVenit}</p>
        </div>
      </div>
    );
  }

  const scena = TUR.scene[pas];
  return (
    <div className={m.corpTur}>
      <div key={pas} className={m.scenaTur}>
        <div className={m.scenaText}>
          <h2 className={m.scenaTitlu}>{scena.titlu}</h2>
          <p className={m.scenaParagraf}>{scena.paragraf}</p>
        </div>
        <div className={m.scenaIlustratie}>
          <IlustratieScena fel={scena.ilustratie} />
        </div>
      </div>
      <div className={m.navigareTur}>
        <button
          type="button"
          className={m.sageataTur}
          aria-label={TUR.anterioara}
          onClick={() => mergiLa((pas + total - 1) % total)}
        >
          <Ic n="chevron-left" m={14} c={2} />
        </button>
        <div className={m.puncteTur}>
          {TUR.scene.map((sc, i) => (
            <button
              key={sc.titlu}
              type="button"
              className={m.punctTur}
              aria-label={TUR.punct(i + 1, total)}
              aria-current={i === pas ? "step" : undefined}
              onClick={() => mergiLa(i)}
            />
          ))}
        </div>
        <button
          type="button"
          className={m.sageataTur}
          aria-label={TUR.urmatoarea}
          onClick={() => (pas + 1 < total ? mergiLa(pas + 1) : laFinal())}
        >
          <Ic n="chevron-right" m={14} c={2} />
        </button>
      </div>
    </div>
  );
}
