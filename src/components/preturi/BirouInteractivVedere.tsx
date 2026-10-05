"use client";

// Biroul din primul pliu, VEDEREA (preturi.md §7): scena, contorul de dispozitive, butonul "+1" si banda
// de conturi. Fiecare clic adauga un dispozitiv (5 -> 36, adica 31 de clicuri), apoi butonul se
// dezactiveaza. Contorul de dispozitive nu depinde de pachet; banda arata conturile incluse in
// pachetul ales (5 / 10 / 20). Mesajul: dispozitivele nu se numara, pachetele difera doar prin conturi.
//
// Scena se incarca lenes si numai cat pliul e deschis (`activ`): `three` nu intra in pachetul paginii.
// Daca WebGL lipseste, gazda scenei dispare, iar contorul, butonul si banda raman.
//
// PE EDITIE: textele (cu numeralele lor, compuse de editie) si planurile vin de la invelitoarea
// editiei (`BirouInteractiv.tsx` pe RO); vederea nu importa niciun continut. Pachetul aratat la
// pornire e primul din lista.
//
// FARA DISPOZITIVE (`faraDispozitive`, implicit absent = forma RO): pentru o editie fara faptul confirmat ca
// dispozitivele nu se numara. Ies numai piesele lui: contorul (cu nota de langa el), butonul "+1" si numele
// accesibil al scenei; scena ramane, decorativa (fara nume, deci ascunsa cititorului de ecran) si oprita la
// numarul de pornire, iar banda de conturi ramane intreaga. Pe forma RO nimic nu se schimba.

import { Suspense, lazy, useId, useState } from "react";
import type { CheiePlan, Plan } from "@/content/preturi";
import { numarMese } from "./birou-asezare";
import IconitaPret from "./iconite";
import s from "./pliuri.module.css";

const Birou3D = lazy(() => import("./Birou3D"));

/** Continutul biroului, pe editie; tip structural, constanta RO (`BIROU`) il satisface. */
export type ContinutBirou = {
  contor: string;
  /** Nota de langa contor. */
  nelimitat: string;
  adauga: string;
  /** Pornirea si plafonul demonstratiei. */
  initial: number;
  maxim: number;
  /** Eticheta benzii de conturi. */
  conturi: string;
  locuri: (n: number) => string;
  /** Numele accesibil al scenei. */
  scena: (dispozitive: number, mese: number) => string;
};

/** Continutul biroului fara demonstratia dispozitivelor: numai pornirea scenei si banda de conturi. */
export type ContinutBirouConturi = Pick<ContinutBirou, "initial" | "conturi" | "locuri">;

export type BirouInteractivVedereProps = {
  activ: boolean;
  planuri: readonly Plan[];
} & ({ continut: ContinutBirou; faraDispozitive?: false } | { continut: ContinutBirouConturi; faraDispozitive: true });

export default function BirouInteractivVedere(props: BirouInteractivVedereProps) {
  const { activ, continut, planuri } = props;
  /** Textele demonstratiei; `null` = editia fara dispozitive. */
  const demo = props.faraDispozitive ? null : props.continut;
  const idEticheta = useId();
  const [dispozitive, setDispozitive] = useState(continut.initial);
  const [plan, setPlan] = useState<CheiePlan>(planuri[0].cheie);
  const plin = demo === null || dispozitive >= demo.maxim;
  const conturi = planuri.find((p) => p.cheie === plan)?.conturi ?? planuri[0].conturi;

  return (
    <div className={s.cardBirou}>
      <div className={s.scena}>
        {activ ? (
          <Suspense fallback={null}>
            <Birou3D dispozitive={dispozitive} eticheta={demo === null ? "" : demo.scena(dispozitive, numarMese(dispozitive))} />
          </Suspense>
        ) : null}
        {demo === null ? null : (
          <>
            <p className={s.contor}>
              <span className={s.contorEticheta}>{demo.contor}</span>
              <span className={s.contorValoare} aria-live="polite" data-contor-dispozitive="">
                {dispozitive}
              </span>
              <span className={s.contorNota}>{demo.nelimitat}</span>
            </p>
            <button
              type="button"
              className={s.adauga}
              aria-disabled={plin ? "true" : undefined}
              onClick={() => {
                if (!plin) setDispozitive((d) => Math.min(demo.maxim, d + 1));
              }}
            >
              {demo.adauga}
              <IconitaPret nume="plus" marime={14} contur={2} />
            </button>
          </>
        )}
      </div>
      <div className={s.conturi}>
        <div className={s.capConturi}>
          <span id={idEticheta} className={s.conturiEticheta}>
            {continut.conturi}
          </span>
          <div className={s.segmente} role="group" aria-labelledby={idEticheta}>
            {planuri.map((p) => {
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
          <span className={s.etichetaLocuri}>{continut.locuri(conturi)}</span>
        </div>
      </div>
    </div>
  );
}
