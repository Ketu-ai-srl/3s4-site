"use client";

// Grila de planuri, VEDEREA (preturi.md §6d): trei carduri intr-un singur chenar de raza 24, fara spatiu
// intre ele; cardul recomandat are linia albastra de sus si butonul plin. Fiecare card apare la
// derulare.
//
// Tooltip-ul "i": se deschide la CLIC (nu la hover), unul singur odata, fara animatie; se inchide la
// al doilea clic sau la clic in afara. La referinta Escape nu il inchidea (COMPONENTE §5, punctul 6);
// la 3S il inchide, iar focusul ramane pe iconita.
//
// Butoanele planurilor trec prin `Tinta`: inerte cat timp ruta lor nu exista.
//
// PE EDITIE: vederea nu importa niciun continut. Planurile (cu cardul recomandat), randurile fiecarui
// plan, eticheta "recomandat", unitatea de langa suma (moneda si perioada), butonul si eticheta iconitei
// "i" vin de la invelitoarea editiei (`GrilaPlanuri.tsx` pe RO); forma sumei e o proprietate.

import { useEffect, useId, useState } from "react";
import Iconita from "@/components/primitive/Iconita";
import Reveal from "@/components/primitive/Reveal";
import Tinta from "@/components/primitive/Tinta";
import type { Legatura } from "@/content/navigatie";
import type { Perioada, Plan, RandPlan } from "@/content/preturi";
import IconitaPret from "./iconite";
import s from "./pachete.module.css";

/** Continutul grilei, pe editie; tip structural, constanta RO (`GRILA`) il satisface. */
export type ContinutGrila = {
  /** Eticheta cardului recomandat. */
  recomandat: string;
  /** Unitatea de langa suma: moneda si perioada. */
  unitate: string;
  /** Butonul fiecarui plan. */
  buton: Legatura;
  /** Eticheta accesibila a iconitei "i", din textul randului. */
  detalii: (rand: string) => string;
};

export type GrilaPlanuriVedereProps = {
  perioada: Perioada;
  continut: ContinutGrila;
  planuri: readonly Plan[];
  /** Randurile listei unui plan. */
  randuri: (plan: Plan) => RandPlan[];
  /** Forma sumei; implicit cifra ca atare. */
  formatSuma?: (n: number) => string;
};

function Card({
  plan,
  perioada,
  deschis,
  comuta,
  idBaza,
  continut,
  randuriPlan,
  formatSuma,
}: {
  plan: Plan;
  perioada: Perioada;
  deschis: string | null;
  comuta: (cheie: string) => void;
  idBaza: string;
  continut: ContinutGrila;
  randuriPlan: (plan: Plan) => RandPlan[];
  formatSuma: (n: number) => string;
}) {
  const randuri = randuriPlan(plan);
  const cuTooltipDeschis = randuri.some((_, i) => deschis === plan.cheie + "-" + i);
  return (
    <Reveal className={s.card + (plan.recomandat ? " " + s.cardRecomandat : "")}>
      <div className={s.capCard}>
        <div className={s.randNume}>
          <h3 className={s.numePlan}>{plan.nume}</h3>
          {plan.recomandat ? <span className={s.eticheta}>{continut.recomandat}</span> : null}
        </div>
        <p className={s.descriere}>{plan.descriere}</p>
      </div>
      <p className={s.randPret}>
        <span className={s.suma}>{formatSuma(plan.pret[perioada])}</span>
        <span className={s.unitatePret}>{continut.unitate}</span>
      </p>
      <div className={s.despartitor} aria-hidden="true" />
      <ul className={s.lista + (cuTooltipDeschis ? " " + s.listaDeasupra : "")}>
        {randuri.map((r, i) => {
          const cheie = plan.cheie + "-" + i;
          const idTooltip = idBaza + "-" + cheie;
          const esteDeschis = deschis === cheie;
          return (
            <li key={cheie} className={s.rand}>
              <Iconita nume="check" marime={16} contur={1.5} className={s.bifa} />
              <span className={s.textRand}>
                {r.cifra ? <strong>{r.cifra}</strong> : null}
                {r.cifra ? " " : null}
                {r.text}
              </span>
              {r.explicatie ? (
                <span className={s.ancoraInfo} data-tooltip-ancora={cheie}>
                  <button
                    type="button"
                    className={s.info + (esteDeschis ? " " + s.infoDeschis : "")}
                    aria-label={continut.detalii(r.text)}
                    aria-expanded={esteDeschis}
                    aria-controls={esteDeschis ? idTooltip : undefined}
                    onClick={() => comuta(cheie)}
                  >
                    <IconitaPret nume="info" marime={14} contur={2} />
                  </button>
                  {esteDeschis ? (
                    <span id={idTooltip} role="tooltip" className={s.tooltip}>
                      {r.explicatie}
                    </span>
                  ) : null}
                </span>
              ) : null}
            </li>
          );
        })}
      </ul>
      <Tinta legatura={continut.buton} className={s.butonPlan + (plan.recomandat ? " " + s.butonPlin : "")}>
        {continut.buton.text}
      </Tinta>
    </Reveal>
  );
}

export default function GrilaPlanuriVedere({
  perioada,
  continut,
  planuri,
  randuri,
  formatSuma = String,
}: GrilaPlanuriVedereProps) {
  const idBaza = useId();
  const [deschis, setDeschis] = useState<string | null>(null);

  useEffect(() => {
    if (deschis === null) return;
    const inAfara = (e: PointerEvent) => {
      const ancora = e.target instanceof Element ? e.target.closest("[data-tooltip-ancora]") : null;
      if (!ancora || ancora.getAttribute("data-tooltip-ancora") !== deschis) setDeschis(null);
    };
    const tasta = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDeschis(null);
    };
    document.addEventListener("pointerdown", inAfara);
    document.addEventListener("keydown", tasta);
    return () => {
      document.removeEventListener("pointerdown", inAfara);
      document.removeEventListener("keydown", tasta);
    };
  }, [deschis]);

  const comuta = (c: string) => setDeschis((d) => (d === c ? null : c));
  return (
    <div className={s.grila}>
      {planuri.map((plan) => (
        <Card
          key={plan.cheie}
          plan={plan}
          perioada={perioada}
          deschis={deschis}
          comuta={comuta}
          idBaza={idBaza}
          continut={continut}
          randuriPlan={randuri}
          formatSuma={formatSuma}
        />
      ))}
    </div>
  );
}
