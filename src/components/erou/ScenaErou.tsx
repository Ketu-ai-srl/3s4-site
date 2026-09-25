"use client";

// Scena din dreapta eroului (acasa-erou.md §1.4-§1.6.3): bucla insufletita si lansarea machetei.
//
// Ce vine de la server, gata randat (`Erou.tsx`): desenul SVG al drumului (cometa in starea ei
// statica), etichetele lobilor, nodurile cu iconitele lor, legenda si sigla. Aici se adauga numai
// ce cere JavaScript:
//   - punctele (3 grupuri a cate 3 cercuri) si cometa care alearga pe drum, cu perioada de
//     12 000 ms, liniar; pozitia se calculeaza din timpul scurs de la primul cadru, deci dupa o
//     pauza (fila ascunsa, bucla in afara ferestrei) punctele sar unde ar fi ajuns (§1.5);
//   - pulsurile nodurilor (700 ms) si ale centrului (800 ms), la iesirea capetelor din fereastra
//     de +-0,004 din ciclu;
//   - centrul devine buton: respira (3000 ms) si lanseaza macheta la clic (§1.6.3);
//   - macheta se incarca lenes, in timpul liber al navigatorului de dupa prima pictura (sau mai
//     devreme, la mouse ori focus pe centru), ca pe drumul primei picturi sa nu intre nimic din ea.
//
// La `prefers-reduced-motion: reduce` bucla ramane cea statica (cometa la 30%, fara puncte, fara
// respiratie); macheta se deschide direct pe prima scena (§1.6.4).

import { useCallback, useEffect, useRef, useState, type ComponentType, type ReactNode } from "react";
import {
  CAP_COMETA_STATIC,
  CERCURI_GRUP,
  GRUPURI,
  INALTIME_SCENA,
  LATIME_SCENA,
  PERIOADA_MS,
  capete,
  liniutaCometa,
  punctLaFractie,
  pulsuriIntre,
  type TintaPuls,
} from "./geometrie";
import { useMiscareRedusa, useMontat } from "./hooks";
import type { MachetaProps } from "./Macheta";
import s from "./Erou.module.css";

/**
 * Macheta, incarcata lenes (codul si stilurile ei vin intr-o bucata separata a pachetului). Nu prin
 * `next/dynamic`: acolo componenta lenesa suspenda la prima randare chiar daca bucata e deja
 * descarcata, iar React tine locul gol inca ~300 ms. Masurat pe build-ul de productie, cu bucata
 * descarcata dinainte: prin `next/dynamic` cadrul intra la +644 ms de la clic, asa la +336..+342;
 * referinta, +341. Aici componenta se randeaza numai dupa ce modulul e in memorie.
 *
 * Bucata poate sa nu vina: o livrare noua cu o fila veche deschisa, o retea mobila care cade. Atunci
 * promisiunea se sterge, ca apelul urmator (alt clic, mouse-ul pe centru) sa reincerce descarcarea,
 * iar fiecare apelant isi trateaza respingerea. Masurat pe forma fara tratare, cu bucata oprita:
 * 4 erori necapturate, iar dupa clic scena ramanea goala (doar podeaua si umbra), fara "inapoi".
 */
let modulMacheta: ComponentType<MachetaProps> | null = null;
let descarcareMacheta: Promise<ComponentType<MachetaProps>> | null = null;
const incarcaMacheta = (): Promise<ComponentType<MachetaProps>> => {
  if (modulMacheta) return Promise.resolve(modulMacheta);
  if (!descarcareMacheta) {
    descarcareMacheta = import("./Macheta").then(
      (m) => {
        modulMacheta = m.default;
        return m.default;
      },
      (eroare: unknown) => {
        descarcareMacheta = null;
        throw eroare;
      },
    );
  }
  return descarcareMacheta;
};

/** Descarcarea dinainte (timp liber, mouse, focus): un esec nu are ce anunta, clicul reincearca. */
const faraEroare = () => undefined;

/** Iesirea buclei la lansare: 320 ms de tranzitie, apoi macheta intra (in cod, 330 ms). */
const IESIRE_MS = 330;

type Faza = "bucla" | "iesire" | "macheta";

export type ScenaErouProps = {
  desen: ReactNode;
  suprapuneri: ReactNode;
  legenda: ReactNode;
  sigla: ReactNode;
  sageata: ReactNode;
  etichetaCentru: string;
  pastilaCentru: string;
};

/** Reporneste animatia unui inel: scoate clasa, forteaza calculul stilului, o pune la loc. */
function reportestePuls(el: Element | null, clasa: string) {
  if (!el) return;
  el.classList.remove(clasa);
  void (el as HTMLElement).offsetWidth;
  el.classList.add(clasa);
}

export default function ScenaErou({
  desen,
  suprapuneri,
  legenda,
  sigla,
  sageata,
  etichetaCentru,
  pastilaCentru,
}: ScenaErouProps) {
  const montat = useMontat();
  const redus = useMiscareRedusa();
  const [faza, setFaza] = useState<Faza>("bucla");
  const spatiuRef = useRef<HTMLDivElement>(null);
  const scenaRef = useRef<HTMLDivElement>(null);
  const centruRef = useRef<HTMLButtonElement>(null);
  const puncteRef = useRef<SVGGElement>(null);
  /** Momentul primului cadru: ciclul continua din el si dupa intoarcerea din macheta. */
  const inceputRef = useRef<number | null>(null);
  /** Dupa intoarcerea din macheta focusul revine pe centru; `null` = nu e nimic de intors. */
  const revinePeCentru = useRef<{ tastatura: boolean } | null>(null);
  /** Componenta machetei, cand modulul ei e deja in memorie. */
  const [Macheta, setMacheta] = useState<ComponentType<MachetaProps> | null>(() => modulMacheta);

  const animat = montat && !redus && faza !== "macheta";

  // Bucla de animatie: ruleaza numai cat scena e in fereastra (prag 0,15) si fila e vizibila.
  useEffect(() => {
    if (!animat) return;
    const scena = scenaRef.current;
    const grupuri = puncteRef.current;
    if (!scena || !grupuri) return;
    const cometa = scena.querySelector<SVGPathElement>("[data-cometa]");
    const cercuri = Array.from(grupuri.querySelectorAll<SVGCircleElement>("circle"));
    const tinte: Record<TintaPuls, Element | null> = {
      "sus-stanga": scena.querySelector('[data-nod="sus-stanga"]'),
      "jos-stanga": scena.querySelector('[data-nod="jos-stanga"]'),
      "sus-dreapta": scena.querySelector('[data-nod="sus-dreapta"]'),
      "jos-dreapta": scena.querySelector('[data-nod="jos-dreapta"]'),
      centru: centruRef.current,
    };

    let cadru = 0;
    let vizibil = true;
    let anterior = -1;

    const deseneaza = (acum: number) => {
      // Primul cadru porneste cu capul cometei exact unde il lasa starea statica (30% din drum),
      // ca hidratarea sa nu faca cometa sa sara. Ordinea pulsurilor din ciclu ramane aceeasi.
      if (inceputRef.current === null) inceputRef.current = acum - CAP_COMETA_STATIC * PERIOADA_MS;
      const t = acum - inceputRef.current;
      const cap = capete(t);
      if (cometa) {
        const l = liniutaCometa(cap[0]);
        cometa.setAttribute("stroke-dasharray", l.dasharray);
        cometa.setAttribute("stroke-dashoffset", l.dashoffset.toFixed(2));
      }
      for (let g = 0; g < GRUPURI; g++) {
        CERCURI_GRUP.forEach((c, i) => {
          const p = punctLaFractie(cap[g] + c.decalaj);
          const cerc = cercuri[g * CERCURI_GRUP.length + i];
          if (cerc) {
            cerc.setAttribute("cx", p.x.toFixed(2));
            cerc.setAttribute("cy", p.y.toFixed(2));
          }
        });
      }
      if (anterior >= 0) {
        for (const tinta of pulsuriIntre(anterior, t)) {
          reportestePuls(tinte[tinta], tinta === "centru" ? s.centruPuls : s.discPuls);
        }
      }
      anterior = t;
      cadru = requestAnimationFrame(deseneaza);
    };

    const porneste = () => {
      if (cadru === 0 && vizibil && document.visibilityState === "visible") {
        anterior = -1;
        cadru = requestAnimationFrame(deseneaza);
      }
    };
    const opreste = () => {
      if (cadru !== 0) cancelAnimationFrame(cadru);
      cadru = 0;
    };

    const observator = new IntersectionObserver(
      (intrari) => {
        vizibil = intrari[intrari.length - 1].isIntersecting;
        if (vizibil) porneste();
        else opreste();
      },
      { threshold: 0.15 },
    );
    observator.observe(scena);
    const laSchimbareFila = () => (document.visibilityState === "visible" ? porneste() : opreste());
    document.addEventListener("visibilitychange", laSchimbareFila);
    porneste();

    return () => {
      opreste();
      observator.disconnect();
      document.removeEventListener("visibilitychange", laSchimbareFila);
      // Daca animatia se opreste cu bucla inca in pagina (omul a cerut miscare redusa din sistem),
      // cometa revine in starea statica, nu ramane unde a prins-o oprirea.
      if (cometa) {
        const l = liniutaCometa(CAP_COMETA_STATIC);
        cometa.setAttribute("stroke-dasharray", l.dasharray);
        cometa.setAttribute("stroke-dashoffset", l.dashoffset.toFixed(2));
      }
    };
  }, [animat]);

  // Macheta se descarca in timpul liber al navigatorului, dupa ce pagina s-a pictat, ca la clic sa
  // intre fara asteptare: la referinta codul ei vine odata cu al eroului (fisa, §4), deci cadrul
  // porneste la 341 ms de la clic. Pe drumul primei picturi nu intra nimic din ea.
  useEffect(() => {
    if (!montat) return;
    const w = window as Window & {
      requestIdleCallback?: (cb: () => void, optiuni?: { timeout: number }) => number;
      cancelIdleCallback?: (id: number) => void;
    };
    let anulat = false;
    const incarca = () =>
      void incarcaMacheta().then((c) => {
        if (!anulat) setMacheta(() => c);
      }, faraEroare);
    if (w.requestIdleCallback) {
      const id = w.requestIdleCallback(incarca, { timeout: 3000 });
      return () => {
        anulat = true;
        w.cancelIdleCallback?.(id);
      };
    }
    const t = window.setTimeout(incarca, 2000);
    return () => {
      anulat = true;
      window.clearTimeout(t);
    };
  }, [montat]);

  // Dupa intoarcerea din macheta, focusul revine pe centru, de unde a plecat. Pagina se deruleaza
  // pana la el numai cand omul lucreaza de la tastatura; dupa un clic nu sare nimic.
  useEffect(() => {
    const cerere = revinePeCentru.current;
    if (faza === "bucla" && cerere) {
      revinePeCentru.current = null;
      centruRef.current?.focus({ preventScroll: !cerere.tastatura });
    }
  }, [faza]);

  useEffect(() => {
    if (faza !== "iesire") return;
    const temporizator = window.setTimeout(() => setFaza("macheta"), redus ? 0 : IESIRE_MS);
    return () => window.clearTimeout(temporizator);
  }, [faza, redus]);

  // Bucla pleaca numai cand modulul machetei e in memorie, ca in locul ei sa nu ramana doar podeaua.
  // De obicei e deja acolo (descarcat in timpul liber sau la mouse ori focus pe centru), iar
  // promisiunea rezolvata porneste iesirea imediat, in aceeasi sarcina. Daca bucata nu vine, bucla
  // ramane pe loc si butonul activ, iar un clic nou reincearca descarcarea; daca cererea atarna,
  // bucla ramane vizibila cat atarna, nu dispare.
  const lanseaza = useCallback(() => {
    void incarcaMacheta().then((c) => {
      setMacheta(() => c);
      setFaza((f) => (f === "bucla" ? "iesire" : f));
    }, faraEroare);
  }, []);

  const inapoi = useCallback((tastatura: boolean) => {
    revinePeCentru.current = { tastatura };
    setFaza("bucla");
  }, []);

  const preincarca = useCallback(() => {
    void incarcaMacheta().then((c) => setMacheta(() => c), faraEroare);
  }, []);

  const continutCentru = (
    <>
      {sigla}
      <span className={s.centruPastila} data-pastila-centru="">
        <span>{pastilaCentru}</span>
        {sageata}
      </span>
      <span className="doar-cititor">{etichetaCentru}</span>
    </>
  );

  return (
    <div
      ref={spatiuRef}
      className={s.spatiu}
      data-faza={faza}
      data-viu={animat ? "" : undefined}
    >
      <div className={s.podea} aria-hidden="true" />
      <div className={s.umbra} aria-hidden="true" />

      {/* Bucla ramane in pagina si cat se vede macheta, asezata dar ascunsa (Erou.module.css): la
          "inapoi" reapare fara sa-si construiasca din nou desenul, etichetele si legenda si fara sa le
          aseze de la zero. Masurat la 390, CPU x4, in clicul pe "inapoi": asezarea 4-22 ms cand bucla
          se construia din nou (2 rulari), 0,3-2,5 ms asa (3 rulari). */}
      <div
        className={
          s.bucla +
          (faza === "iesire" ? " " + s.buclaIesire : "") +
          (faza === "macheta" && Macheta ? " " + s.buclaAscunsa : "")
        }
      >
        <div ref={scenaRef} className={s.scena}>
          {desen}
          {animat ? (
            <svg
              className={s.desen}
              viewBox={"0 0 " + LATIME_SCENA + " " + INALTIME_SCENA}
              aria-hidden="true"
              focusable="false"
            >
              <g ref={puncteRef} data-puncte="">
                {Array.from({ length: GRUPURI }, (_, g) =>
                  CERCURI_GRUP.map((c) => (
                    <circle key={g + c.clasa} r={c.raza} cx={-20} cy={-20} className={s["punct-" + c.clasa]} />
                  )),
                )}
              </g>
            </svg>
          ) : null}
          {suprapuneri}
          {montat ? (
            <button
              ref={centruRef}
              type="button"
              className={s.centru}
              onClick={lanseaza}
              onPointerEnter={preincarca}
              onFocus={preincarca}
              disabled={faza !== "bucla"}
            >
              {continutCentru}
            </button>
          ) : (
            <span className={s.centru}>{continutCentru}</span>
          )}
        </div>
        {legenda}
      </div>
      {faza === "macheta" && Macheta ? <Macheta redus={redus} spatiu={spatiuRef} laInapoi={inapoi} /> : null}
    </div>
  );
}
