"use client";

// Chestionarul de sub panou (acasa-constructor.md §10, §12): expandorul, cele 3 intrebari cu
// dezvaluirea lor pe rand, confirmarea, simularea zilei (Duel) si estimarea cu CTA-ul final.
//
// Parametrii spre `/inregistrare` se compun NUMAI prin contractul din `src/content/acasa.ts`
// (`adresaInregistrare`); aici nu se scrie niciun nume de parametru. Cat timp ruta nu exista in
// `RUTE`, `Tinta` randeaza butonul inert, cu adresa asteptata in `data-tinta-lipsa`.
//
// Accesibilitatea (§15, plus abaterile din COMPONENTE.md §5.6): jetoanele au `aria-pressed`,
// segmentul si randurile sunt `radiogroup` cu `radio` si se muta cu sagetile (focus itinerant),
// capul expandorului are `aria-expanded` si `aria-controls`, pasii ascunsi sunt `inert`.
//
// CORPUL SI DUELUL INTRA DUPA PRIMUL CADRU (`useDeferredValue`): corpul expandorului si pasul
// duelului se deschid oricum de la inaltimea 0, deci un continut montat cu un cadru mai tarziu nu
// se vede, iar clicul (deschiderea, "Confirmati") nu mai asteapta asezarea lui inainte de primul
// cadru (INP, plan §8.4).

import { useDeferredValue, useEffect, useId, useState, type KeyboardEvent, type ReactNode } from "react";
import {
  adresaInregistrare,
  type CodCanal,
  type CodCine,
  type CodIndustrie,
  type CodVolum,
} from "@/content/acasa";
import {
  CHESTIONAR,
  ESTIMARE,
  ZILE_LUCRATOARE,
  completeaza,
  estimare,
  formatMinute,
} from "@/content/acasa-constructor";
import { CALE_INREGISTRARE } from "@/content/navigatie";
import Tinta from "@/components/primitive/Tinta";
import Duel from "./Duel";
import { IcBifa, IcChevronJos, IcSageata, IconitaCanal } from "./Iconite";
import { confirma, schimba, toateRaspunsurile, type Raspunsuri } from "./stare";
import s from "./Chestionar.module.css";

type Props = {
  industrie: CodIndustrie;
  raspunsuri: Raspunsuri;
  setRaspunsuri: (f: (r: Raspunsuri) => Raspunsuri) => void;
};

function cls(...clase: (string | false | null | undefined)[]): string {
  return clase.filter(Boolean).join(" ");
}

/** Un pas al chestionarului: ascuns (`max-height` 0, opacitate 0, `inert`) pana e dezvaluit. */
function Pas({
  vizibil,
  mare,
  className,
  children,
}: {
  vizibil: boolean;
  mare?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cls(s.pas, mare && s.pasMare, vizibil && s.in, className)}
      inert={!vizibil}
      aria-hidden={!vizibil}
      data-pas={vizibil ? "vizibil" : "ascuns"}
    >
      {children}
    </div>
  );
}

/** Muta selectia cu sagetile intr-un grup radio (focus itinerant). */
function sageti<T extends string>(e: KeyboardEvent<HTMLElement>, coduri: readonly T[], curent: T | null, alege: (c: T) => void) {
  const inainte = e.key === "ArrowRight" || e.key === "ArrowDown";
  const inapoi = e.key === "ArrowLeft" || e.key === "ArrowUp";
  if (!inainte && !inapoi) return;
  e.preventDefault();
  const i = curent === null ? -1 : coduri.indexOf(curent);
  const urm = coduri[(i + (inainte ? 1 : coduri.length - 1) + coduri.length) % coduri.length];
  alege(urm);
  const grup = e.currentTarget;
  requestAnimationFrame(() => grup.querySelector<HTMLElement>('[aria-checked="true"]')?.focus());
}

function Estimare({
  industrie,
  canale,
  volum,
  cine,
  deschis,
}: {
  industrie: CodIndustrie;
  canale: CodCanal[];
  volum: CodVolum;
  cine: CodCine;
  deschis: boolean;
}) {
  const e = estimare(canale.length, volum);
  // Barele cresc din stanga la fiecare deschidere a expandorului: pornesc de la 0, apoi tinta.
  const [pornit, setPornit] = useState(false);
  useEffect(() => {
    if (!deschis) {
      setPornit(false);
      return;
    }
    const r = requestAnimationFrame(() => setPornit(true));
    return () => cancelAnimationFrame(r);
  }, [deschis]);
  const href = adresaInregistrare({ ind: industrie, src: canale, vol: volum, who: cine });
  return (
    <>
      <div className={s.estimare} data-estimare={e.manual}>
        <div className={s.stangaEstimare}>
          <p className={s.etichetaEstimare}>{ESTIMARE.eticheta}</p>
          <p className={cls(s.cifraEstimare, "cifre")}>{completeaza(ESTIMARE.cifra, { ore: e.manual })}</p>
          <p className={s.formula}>
            {completeaza(ESTIMARE.formula, { docs: e.documente, k: formatMinute(e.minute), zile: ZILE_LUCRATOARE })}
          </p>
        </div>
        <div className={s.dreaptaEstimare}>
          <div className={s.randComparatie}>
            <span className={s.numeComparatie}>{ESTIMARE.manual}</span>
            <span className={s.baraComparatie}>
              <span
                className={cls(s.umplereComparatie, s.umplereManual)}
                style={{ transform: "scaleX(" + (pornit ? 1 : 0) + ")" }}
              />
            </span>
            <span className={cls(s.valoareComparatie, "cifre")}>{e.manual} h</span>
          </div>
          <div className={s.randComparatie}>
            <span className={s.numeComparatie}>{ESTIMARE.cuProdus}</span>
            <span className={s.baraComparatie}>
              <span
                className={cls(s.umplereComparatie, s.umplereProdus)}
                style={{ transform: "scaleX(" + (pornit ? e.raport : 0) + ")" }}
                data-raport={e.raport}
              />
            </span>
            <span className={cls(s.valoareComparatie, "cifre")}>≈ {e.cuProdus} h</span>
          </div>
          <p className={s.morala}>{ESTIMARE.morala[cine]}</p>
        </div>
      </div>
      <div className={s.ctaFinal} data-cta-constructor="">
        <Tinta legatura={{ text: ESTIMARE.buton, href, ruta: CALE_INREGISTRARE }} className={s.butonFinal}>
          <span>{ESTIMARE.buton}</span>
          <IcSageata marime={18} contur={2} />
        </Tinta>
        <p className={s.notaFinala}>{ESTIMARE.nota}</p>
      </div>
    </>
  );
}

export default function Chestionar({ industrie, raspunsuri: r, setRaspunsuri }: Props) {
  const idCorp = useId() + "-corp";
  const idCanale = useId() + "-canale";
  const idVolum = useId() + "-volum";
  const idCine = useId() + "-cine";
  const toate = toateRaspunsurile(r);
  const q = CHESTIONAR;
  // Pasii se pun in pagina abia la prima deschidere: inchis, corpul are inaltime 0 si e `inert`,
  // deci nu se vede nimic din ei, dar i-ar aseza la fiecare alegere de industrie, in acelasi cadru
  // cu lumea. Odata montati raman, ca inchiderea sa aiba ce sa stranga.
  const [corpMontat, setCorpMontat] = useState(r.deschis);
  const corpInPagina = useDeferredValue(corpMontat);
  const duelInPagina = useDeferredValue(r.confirmat);

  const deschide = () => {
    setCorpMontat(true);
    setRaspunsuri((x) => ({ ...x, deschis: !x.deschis }));
  };

  return (
    <div className={cls(s.expandor, r.deschis && s.deschis)} data-chestionar={r.deschis ? "deschis" : "inchis"}>
      <button
        type="button"
        className={s.capExpandor}
        aria-expanded={r.deschis}
        aria-controls={idCorp}
        onClick={deschide}
      >
        <span className={s.titluriExpandor}>
          <span className={s.titluExpandor}>{q.titlu}</span>
          <span className={s.descriereExpandor}>{q.descriere}</span>
        </span>
        <IcChevronJos marime={16} contur={1.8} className={s.chevronExpandor} />
      </button>

      <div id={idCorp} className={s.corpExpandor} inert={!r.deschis} aria-hidden={!r.deschis}>
        <div className={s.interiorExpandor}>
          {corpInPagina ? (
            <>
              <Pas vizibil>
                <p id={idCanale} className={s.intrebare}>
                  {q.canale.intrebare}
                </p>
                <div className={s.jetoane} role="group" aria-labelledby={idCanale}>
                  {q.canale.optiuni.map((o) => {
                    const ales = r.canale.includes(o.cod);
                    return (
                      <button
                        key={o.cod}
                        type="button"
                        className={cls(s.jeton, ales && s.ales)}
                        aria-pressed={ales}
                        data-canal={o.cod}
                        onClick={() => setRaspunsuri((x) => schimba(x, { fel: "canal", canal: o.cod }))}
                      >
                        <IconitaCanal canal={o.cod} marime={14} contur={1.7} className={s.iconitaJeton} />
                        <span>{o.text}</span>
                      </button>
                    );
                  })}
                </div>
              </Pas>

              <Pas vizibil={r.dezvaluit >= 2}>
                <p id={idVolum} className={s.intrebare}>
                  {q.volum.intrebare}
                </p>
                <div
                  className={s.segment}
                  role="radiogroup"
                  aria-labelledby={idVolum}
                  onKeyDown={(e) =>
                    sageti(
                      e,
                      q.volum.optiuni.map((o) => o.cod),
                      r.volum,
                      (v) => setRaspunsuri((x) => schimba(x, { fel: "volum", volum: v })),
                    )
                  }
                >
                  {q.volum.optiuni.map((o, i) => {
                    const ales = r.volum === o.cod;
                    return (
                      <button
                        key={o.cod}
                        type="button"
                        role="radio"
                        aria-checked={ales}
                        tabIndex={ales || (r.volum === null && i === 0) ? 0 : -1}
                        className={cls(s.optiuneSegment, ales && s.activ)}
                        data-volum={o.cod}
                        onClick={() => setRaspunsuri((x) => schimba(x, { fel: "volum", volum: o.cod }))}
                      >
                        {o.text}
                      </button>
                    );
                  })}
                </div>
              </Pas>

              <Pas vizibil={r.dezvaluit >= 3}>
                <p id={idCine} className={s.intrebare}>
                  {q.cine.intrebare}
                </p>
                <div
                  className={s.randuri}
                  role="radiogroup"
                  aria-labelledby={idCine}
                  onKeyDown={(e) =>
                    sageti(
                      e,
                      q.cine.optiuni.map((o) => o.cod),
                      r.cine,
                      (c) => setRaspunsuri((x) => schimba(x, { fel: "cine", cine: c })),
                    )
                  }
                >
                  {q.cine.optiuni.map((o, i) => {
                    const ales = r.cine === o.cod;
                    return (
                      <button
                        key={o.cod}
                        type="button"
                        role="radio"
                        aria-checked={ales}
                        tabIndex={ales || (r.cine === null && i === 0) ? 0 : -1}
                        className={cls(s.randCine, ales && s.activ)}
                        data-cine={o.cod}
                        onClick={() => setRaspunsuri((x) => schimba(x, { fel: "cine", cine: o.cod }))}
                      >
                        <span className={s.radio} aria-hidden="true" />
                        <span className={s.textCine}>
                          <span className={s.titluCine}>{o.titlu}</span>
                          <span className={s.descriereCine}>{o.descriere}</span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </Pas>

              <Pas vizibil={r.dezvaluit >= 4} className={s.pasConfirmare}>
                <div className={s.randConfirmare}>
                  <button
                    type="button"
                    className={cls(s.confirma, r.confirmat && s.confirmat)}
                    disabled={!toate || r.confirmat}
                    data-confirma={r.confirmat ? "confirmat" : "de-confirmat"}
                    onClick={() => setRaspunsuri(confirma)}
                  >
                    <IcBifa marime={14} contur={2} className={s.bifaConfirma} />
                    <span>{r.confirmat ? q.confirmat : q.confirma}</span>
                  </button>
                </div>
              </Pas>

              <Pas vizibil={r.confirmat} mare>
                {duelInPagina && r.confirmat && r.volum && r.cine ? (
                  <Duel
                    industrie={industrie}
                    canale={r.canale}
                    volum={r.volum}
                    cine={r.cine}
                    cheie={r.rulare}
                    laTerminare={() => setRaspunsuri((x) => (x.estimareDezvaluita ? x : { ...x, estimareDezvaluita: true }))}
                  />
                ) : null}
              </Pas>

              <Pas vizibil={r.confirmat && r.estimareDezvaluita}>
                {r.confirmat && r.estimareDezvaluita && r.volum && r.cine ? (
                  <Estimare industrie={industrie} canale={r.canale} volum={r.volum} cine={r.cine} deschis={r.deschis} />
                ) : null}
              </Pas>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
