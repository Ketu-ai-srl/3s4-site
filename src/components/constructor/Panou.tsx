"use client";

// Panoul constructorului (acasa-constructor.md §5-§6): cardul de 1000 px in care scena industriei
// se construieste dupa programul comun de pasi (~7,5 s), cu bara de progres, benzile de
// automatizare, concluzia, randul de integrari si randul final cu CTA-ul.
//
// PROGRAMUL ruleaza cat sectiunea e vizibila macar 15% (§3). Daca iese inainte de final, se
// opreste; la intoarcere reporneste DE LA 0 (nu continua). Terminat o data, nu se mai reia singur:
// il reiau butonul rotund, confirmarea chestionarului si schimbarile de dupa ea (`cheie`).
// La miscare redusa panoul e direct in starea finala, fara program (§15).
//
// PRIMA PORNIRE se socoteste de la clicul care a ales industria (`momentAlegere`): panoul se
// monteaza in treapta a doua a lumii (Lume.tsx), deci montarea nu e un reper stabil. Daca montarea
// vine dupa momentul programat (procesor lent), programul porneste la montare, fara sa sara pasi.
// RESETUL (pasii si bara la 0) se face in primul cadru al programului, nu in efect: efectul ruleaza
// sincron in clicul care a schimbat `cheie` (confirmarea chestionarului, reluarea), iar o
// re-randare a panoului in clic ar intarzia primul cadru al acelei interactiuni.
//
// Elementele scenei sunt in pagina de la inceput, ascunse prin opacitate: cardul are de la primul
// cadru inaltimea finala, deci pagina nu sare sub ochii omului (ca la referinta).

import { Fragment, useEffect, useMemo, useRef, useState, type MutableRefObject } from "react";
import { CALE_INREGISTRARE } from "@/content/navigatie";
import type { CodIndustrie } from "@/content/acasa";
import { COMUN, completeaza, type Banda, type Scenariu } from "@/content/acasa-constructor";
import Tinta from "@/components/primitive/Tinta";
import { IcBifa, IcChevron, IcMarca, IcPosta, IcReluare, IcServer, IconitaActiuneBanda } from "./Iconite";
import {
  PORNIRE_DUPA_ALEGERE,
  ajuns,
  apropieProgres,
  pasiFacuti,
  programPasi,
  tintaProgres,
  type NumePas,
} from "./program";
import { ScenaIndustriei } from "./Scene";
import s from "./Panou.module.css";

/** Ce citeste arborele 3D: momentele (performance.now) la care programul a atins X1-X5 si finalul. */
export type SemnalArbore = { x: (number | null)[]; final: number | null; static: boolean };

export function semnalGol(): SemnalArbore {
  return { x: [null, null, null, null, null], final: null, static: false };
}

type Props = {
  industrie: CodIndustrie;
  numeIndustrie: string;
  scenariu: Scenariu;
  benzi: Banda[];
  /** Schimbarea ei reia programul de la 0. */
  cheie: number;
  /** Sectiunea e vizibila macar 15%. */
  activ: boolean;
  semnal: MutableRefObject<SemnalArbore>;
  laReluare: () => void;
  /** `performance.now()` la clicul care a ales industria: reperul primei porniri. */
  momentAlegere: number;
};

function cls(...clase: (string | false | null | undefined)[]): string {
  return clase.filter(Boolean).join(" ");
}

function miscareRedusa(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export default function Panou({
  industrie,
  numeIndustrie,
  scenariu,
  benzi,
  cheie,
  activ,
  semnal,
  laReluare,
  momentAlegere,
}: Props) {
  const L = benzi.length;
  const pasi = useMemo(() => programPasi(L), [L]);
  // La miscare redusa panoul se monteaza direct in starea finala, fara o randare intermediara goala.
  const [facuti, setFacuti] = useState(() => (miscareRedusa() ? pasi.length : 0));
  const umplere = useRef<HTMLDivElement>(null);
  const procent = useRef<HTMLSpanElement>(null);
  /** Cheia pentru care programul a ajuns la final: nu se mai reia pana nu se schimba cheia. */
  const terminat = useRef<string | null>(null);
  /** Programul a mai pornit o data in panoul asta (reluarile nu mai asteapta, `program.ts`). */
  const pornit = useRef(false);
  const cheieProgram = cheie + ":" + L;

  useEffect(() => {
    const scrie = (valoare: number) => {
      if (umplere.current) umplere.current.style.width = valoare + "%";
      if (procent.current) procent.current.textContent = Math.round(valoare) + "%";
    };
    if (terminat.current === cheieProgram) return;
    if (miscareRedusa()) {
      setFacuti(pasi.length);
      scrie(100);
      semnal.current = { x: [0, 0, 0, 0, 0], final: 0, static: true };
      terminat.current = cheieProgram;
      return;
    }
    if (!activ) return;

    semnal.current = semnalGol();
    const acum0 = performance.now();
    const t0 = pornit.current ? acum0 : Math.max(acum0, momentAlegere + PORNIRE_DUPA_ALEGERE);
    pornit.current = true;
    // -1: primul cadru scrie oricum pasii (0 la o reluare), adica resetul de dinaintea programului.
    let facutiLocal = -1;
    let afisat = 0;
    let cadru = 0;
    const pas = () => {
      const acum = performance.now();
      const f = pasiFacuti(pasi, acum - t0);
      if (f !== facutiLocal) {
        for (let i = Math.max(0, facutiLocal); i < f; i++) {
          const nume = pasi[i].nume;
          const x = /^X([1-5])$/.exec(nume);
          if (x) semnal.current.x[Number(x[1]) - 1] = acum;
          if (nume === "final") semnal.current.final = acum;
        }
        facutiLocal = f;
        setFacuti(f);
      }
      const tinta = facutiLocal === 0 ? 0 : tintaProgres(facutiLocal, L);
      afisat = apropieProgres(afisat, tinta);
      scrie(afisat);
      if (facutiLocal >= pasi.length && afisat === 100) {
        terminat.current = cheieProgram;
        return;
      }
      cadru = requestAnimationFrame(pas);
    };
    cadru = requestAnimationFrame(pas);
    return () => cancelAnimationFrame(cadru);
  }, [cheieProgram, activ, pasi, L, semnal, momentAlegere]);

  const a = ajuns(pasi, facuti);
  const gata = a("final");

  return (
    <div className={cls(s.card, a("start") && s.in)} data-panou={gata ? "gata" : "in-lucru"}>
      <div className={s.capCard}>
        <span className={s.marca}>
          <IcMarca marime={16} contur={1.6} />
        </span>
        <div className={s.titluri}>
          <p className={s.numeSpatiu}>{COMUN.numeSpatiu}</p>
          <p className={s.meta}>
            {COMUN.tipSpatiu} · {numeIndustrie}
          </p>
        </div>
        <div className={s.progres}>
          <div className={s.progresSus}>
            <span>{COMUN.progres}</span>
            <span ref={procent} className="cifre" data-procent>
              0%
            </span>
          </div>
          <div className={s.pista}>
            <div ref={umplere} className={s.umplere} style={{ width: "0%" }} />
          </div>
        </div>
        <button type="button" className={s.reluare} aria-label={COMUN.reluare} onClick={laReluare}>
          <IcReluare marime={13} contur={1.5} />
        </button>
      </div>

      <div className={s.corp}>
        <div className={s.cutie}>
          <div className={s.principal}>
            <div className={s.scena} data-scena={industrie}>
              <h3 className={cls(s.durere, industrie === "contabilitate" && s.durereLata, a("X1") && s.in)}>
                {scenariu.durere}
              </h3>
              <ScenaIndustriei industrie={industrie} a={a} />
            </div>
            <div className={cls(s.automatizari, a("B1") && s.in)}>
              <p className={s.etichetaAuto}>{COMUN.automatizari}</p>
              <div className={s.benzi}>
                {benzi.map((b, i) => (
                  <div
                    key={b.declansator + i}
                    className={cls(
                      s.banda,
                      a(("B" + (i + 1)) as NumePas) && s.in,
                      b.laPas !== null && a(("T" + b.laPas) as NumePas) && s.gata,
                    )}
                    data-banda={b.laPas !== null && a(("T" + b.laPas) as NumePas) ? "gata" : "asteapta"}
                  >
                    <span className={s.declansator}>{b.declansator}</span>
                    <IcChevron marime={14} contur={1.5} className={s.sageata} />
                    <span className={s.actiune}>
                      <IconitaActiuneBanda fel={b.iconita} marime={16} contur={1.5} className={s.iconitaActiune} />
                      <span>{b.actiune}</span>
                    </span>
                    <span className={s.locBifa}>
                      <IcBifa marime={16} contur={2} className={s.bifa} />
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <p className={cls(s.concluzie, gata && s.in)}>
              <IcBifa marime={18} contur={2} className={s.bifaConcluzie} />
              <span>{scenariu.concluzie}</span>
            </p>
          </div>
        </div>
        {/* Punctul dintre elemente e un element al randului, ca la referinta: la rupere ramane la
            capatul randului 1, nu coboara cu al doilea element. */}
        <div className={cls(s.integrari, a("Y1") && s.in)}>
          <span className={s.etichetaIntegrari}>{COMUN.integrari.eticheta}</span>
          {COMUN.integrari.elemente.map((e, i) => (
            <Fragment key={e.text}>
              {i > 0 ? (
                <span className={s.punct} aria-hidden="true">
                  ·
                </span>
              ) : null}
              <span className={s.elementIntegrare}>
                {e.iconita === "server" ? (
                  <IcServer marime={13} contur={1.5} className={s.iconitaIntegrare} />
                ) : (
                  <IcPosta marime={13} contur={1.5} className={s.iconitaIntegrare} />
                )}
                <span>{e.text}</span>
              </span>
            </Fragment>
          ))}
        </div>
      </div>

      <div className={cls(s.final, gata && s.in)}>
        <span className={s.cerc}>
          <IcBifa marime={16} contur={2} className={s.bifa} />
        </span>
        <div className={s.finalText}>
          <p className={s.finalTitlu}>{COMUN.final.titlu}</p>
          <p className={s.finalSub}>{COMUN.final.subRand}</p>
        </div>
        <Tinta
          legatura={{ text: COMUN.final.buton, href: CALE_INREGISTRARE, ruta: CALE_INREGISTRARE }}
          className={s.cta}
        >
          {COMUN.final.buton}
        </Tinta>
      </div>
      <p className={s.anunt} role="status">
        {gata ? completeaza(COMUN.anuntGata, { industrie: numeIndustrie }) : ""}
      </p>
    </div>
  );
}
