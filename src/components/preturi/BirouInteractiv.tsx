"use client";

// Biroul din primul pliu (preturi.md §7): scena, contorul de dispozitive, butonul "+1" si banda de
// conturi. Fiecare clic adauga un dispozitiv (5 -> 36, adica 31 de clicuri), apoi butonul se
// dezactiveaza. Contorul de dispozitive nu depinde de pachet; banda arata conturile incluse in
// pachetul ales (5 / 10 / 20). Mesajul: dispozitivele nu se numara, pachetele difera doar prin conturi.
//
// Scena se incarca lenes si numai cat pliul e deschis (`activ`): `three` nu intra in pachetul paginii.
// Daca WebGL lipseste, gazda scenei dispare, iar contorul, butonul si banda raman.

import { Suspense, lazy, useId, useState } from "react";
import { BIROU, PLANURI, type CheiePlan } from "@/content/preturi";
import { numarMese } from "./birou-asezare";
import IconitaPret from "./iconite";
import s from "./pliuri.module.css";

const Birou3D = lazy(() => import("./Birou3D"));

export default function BirouInteractiv({ activ }: { activ: boolean }) {
  const idEticheta = useId();
  const [dispozitive, setDispozitive] = useState(BIROU.initial);
  const [plan, setPlan] = useState<CheiePlan>("start");
  const plin = dispozitive >= BIROU.maxim;
  const conturi = PLANURI.find((p) => p.cheie === plan)?.conturi ?? PLANURI[0].conturi;

  return (
    <div className={s.cardBirou}>
      <div className={s.scena}>
        {activ ? (
          <Suspense fallback={null}>
            <Birou3D dispozitive={dispozitive} eticheta={BIROU.scena(dispozitive, numarMese(dispozitive))} />
          </Suspense>
        ) : null}
        <p className={s.contor}>
          <span className={s.contorEticheta}>{BIROU.contor}</span>
          <span className={s.contorValoare} aria-live="polite" data-contor-dispozitive="">
            {dispozitive}
          </span>
          <span className={s.contorNota}>{BIROU.nelimitat}</span>
        </p>
        <button
          type="button"
          className={s.adauga}
          aria-disabled={plin ? "true" : undefined}
          onClick={() => {
            if (!plin) setDispozitive((d) => Math.min(BIROU.maxim, d + 1));
          }}
        >
          {BIROU.adauga}
          <IconitaPret nume="plus" marime={14} contur={2} />
        </button>
      </div>
      <div className={s.conturi}>
        <div className={s.capConturi}>
          <span id={idEticheta} className={s.conturiEticheta}>
            {BIROU.conturi}
          </span>
          <div className={s.segmente} role="group" aria-labelledby={idEticheta}>
            {PLANURI.map((p) => {
              const activPlan = p.cheie === plan;
              return (
                <button
                  key={p.cheie}
                  type="button"
                  className={s.segment + (activPlan ? " " + s.segmentActiv : "")}
                  aria-pressed={activPlan}
                  onClick={() => setPlan(p.cheie)}
                >
                  {p.nume}
                </button>
              );
            })}
          </div>
        </div>
        <div className={s.locuri}>
          {Array.from({ length: conturi }, (_, i) => (
            <span key={i} className={s.loc} aria-hidden="true">
              <IconitaPret nume="persoana" marime={12} contur={2} />
            </span>
          ))}
          <span className={s.etichetaLocuri}>{BIROU.locuri(conturi)}</span>
        </div>
      </div>
    </div>
  );
}
