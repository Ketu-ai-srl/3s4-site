"use client";

// Grila de planuri (preturi.md §6d): trei carduri intr-un singur chenar de raza 24, fara spatiu
// intre ele; cardul recomandat are linia albastra de sus si butonul plin. Fiecare card apare la
// derulare. Toate sumele sunt 0 RON (decizia D3), in ambele perioade.
//
// Tooltip-ul "i": se deschide la CLIC (nu la hover), unul singur odata, fara animatie; se inchide la
// al doilea clic sau la clic in afara. La referinta Escape nu il inchidea (COMPONENTE §5, punctul 6);
// la 3S il inchide, iar focusul ramane pe iconita.
//
// Butoanele planurilor duc la formularul de cont prin `Tinta`: inerte cat timp ruta nu exista.

import { useEffect, useId, useState } from "react";
import Iconita from "@/components/primitive/Iconita";
import Reveal from "@/components/primitive/Reveal";
import Tinta from "@/components/primitive/Tinta";
import { GRILA, PLANURI, randuriPlan, type Perioada, type Plan } from "@/content/preturi";
import IconitaPret from "./iconite";
import s from "./pachete.module.css";

function Card({
  plan,
  perioada,
  deschis,
  comuta,
  idBaza,
}: {
  plan: Plan;
  perioada: Perioada;
  deschis: string | null;
  comuta: (cheie: string) => void;
  idBaza: string;
}) {
  const randuri = randuriPlan(plan);
  const cuTooltipDeschis = randuri.some((_, i) => deschis === plan.cheie + "-" + i);
  return (
    <Reveal className={s.card + (plan.recomandat ? " " + s.cardRecomandat : "")}>
      <div className={s.capCard}>
        <div className={s.randNume}>
          <h3 className={s.numePlan}>{plan.nume}</h3>
          {plan.recomandat ? <span className={s.eticheta}>{GRILA.recomandat}</span> : null}
        </div>
        <p className={s.descriere}>{plan.descriere}</p>
      </div>
      <p className={s.randPret}>
        <span className={s.suma}>{plan.pret[perioada]}</span>
        <span className={s.unitatePret}>{GRILA.unitate}</span>
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
                    aria-label={GRILA.detalii(r.text)}
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
      <Tinta legatura={GRILA.buton} className={s.butonPlan + (plan.recomandat ? " " + s.butonPlin : "")}>
        {GRILA.buton.text}
      </Tinta>
    </Reveal>
  );
}

export default function GrilaPlanuri({ perioada }: { perioada: Perioada }) {
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
      {PLANURI.map((plan) => (
        <Card key={plan.cheie} plan={plan} perioada={perioada} deschis={deschis} comuta={comuta} idBaza={idBaza} />
      ))}
    </div>
  );
}
