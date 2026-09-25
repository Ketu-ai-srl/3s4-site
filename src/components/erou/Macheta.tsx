"use client";

// Macheta care inlocuieste bucla la clic pe centru (acasa-erou.md §1.6.3-§1.6.5, §1.7). Codul si
// stilurile ei vin intr-o bucata separata, descarcata in timpul liber al navigatorului de dupa prima
// pictura (sau la mouse ori focus pe centru); vezi `ScenaErou.tsx`.
//
// Structura, peste 1180 px (scena 3D): plutitorul (6 s, 6 px, dupa 4,6 s) > stratul de paralaxa
// (rotateY -14, rotateX 5, plus mouse-ul) > cartonasul-fantoma, cadrul si reflexia; butonul
// "inapoi" in coltul din stanga-jos al spatiului. Cadrul intra in 800 ms, cu 100 ms intarziere,
// din adancime. Paralaxa si foile zburatoare exista numai cu indicator fin, peste 1180 px si fara
// miscare redusa. Sub 1180 px scena e plana: cadrul in pagina, butonul centrat sub el.
//
// Datele din macheta sunt fictive si declarate ca exemplu (plan D9): legenda figurii o spune
// cititoarelor de ecran (ca la vizualul CTA-ului final), bara de adresa si bara de stare a
// telefonului o spun pe ecran. Figura, nu `role="group"`: pe pagina, selectorii de meniu ai
// antetului cauta grupurile vizibile, iar un grup in plus le schimba rezultatul.
//
// Aplicatia (faza 2) se construieste in primul timp liber de dupa intrarea machetei, ascunsa, in
// acelasi cadru cu turul (vezi `Aplicatie.tsx`, latenta). Trecerea de pe scena 3 schimba doar
// clasele: turul iese, aplicatia deja asezata devine vizibila si porneste. Daca omul ajunge la
// aplicatie inaintea timpului liber, ea se construieste ca inainte, in clic.

import { startTransition, useCallback, useEffect, useRef, useState, type RefObject } from "react";
import { MACHETA } from "@/content/acasa-erou";
import Sigla from "@/components/primitive/Sigla";
import Aplicatie from "./Aplicatie";
import { inTimpulLiber, useMedia } from "./hooks";
import { Ic } from "./iconite-macheta";
import Tur from "./Tur";
import m from "./Macheta.module.css";

export type MachetaProps = {
  redus: boolean;
  /** Spatiul scenei (`.spatiu` din erou): de la el se masoara foile si se gaseste sectiunea. */
  spatiu: RefObject<HTMLDivElement | null>;
  /** Inapoi la bucla; `tastatura` = actionat de la tastatura (clic fara coordonate). */
  laInapoi: (tastatura: boolean) => void;
};

/** Foile zburatoare (§1.6.3): 3 foi refolosite, zbor de 550 ms dupa 30 ms, stinse dupa 400 ms. */
const FOI = 3;
const ZBOR_MS = 550;
const PORNIRE_MS = 30;
const RESET_MS = 620;

export default function Macheta({ redus, spatiu, laInapoi }: MachetaProps) {
  const [faza, setFaza] = useState<"tur" | "aplicatie">("tur");
  /** Aplicatia e construita dinainte, ascunsa, cat ruleaza turul. */
  const [aplicatiePregatita, setAplicatiePregatita] = useState(false);
  const scena3d = useMedia("(min-width: 1181px)");
  const telefon = useMedia("(max-width: 767px)");
  const indicatorFin = useMedia("(hover: hover) and (pointer: fine)");
  const miscare = scena3d && indicatorFin && !redus;

  const radacina = useRef<HTMLElement>(null);
  const paralaxa = useRef<HTMLDivElement>(null);
  const cadru = useRef<HTMLDivElement>(null);
  const strat = useRef<HTMLDivElement>(null);
  const foi = useRef<(HTMLDivElement | null)[]>([]);
  const urmatoareaFoaie = useRef(0);

  // Focusul intra in macheta: centrul de pe care s-a pornit nu mai exista.
  useEffect(() => {
    cadru.current?.focus({ preventScroll: true });
  }, []);

  // Aplicatia, in primul timp liber de dupa intrare (bun-venitul tine 2,9 s, fiecare scena 7 s).
  useEffect(() => inTimpulLiber(() => startTransition(() => setAplicatiePregatita(true))), []);

  // Paralaxa: pozitia mouse-ului in cutia eroului, aplicata pe cadru de animatie; la iesire, 0.
  useEffect(() => {
    const sectiune = spatiu.current?.closest("section");
    const el = paralaxa.current;
    if (!miscare || !sectiune || !el) return;
    let cadruAnimatie = 0;
    let x = 0.5;
    let y = 0.5;
    const aplica = () => {
      cadruAnimatie = 0;
      el.style.setProperty("--paralaxa-ry", (8 * (x - 0.5)).toFixed(3) + "deg");
      el.style.setProperty("--paralaxa-rx", (-8 * (y - 0.5)).toFixed(3) + "deg");
      el.style.setProperty("--paralaxa-tx", (14 * (x - 0.5)).toFixed(2) + "px");
      el.style.setProperty("--paralaxa-ty", (10 * (y - 0.5)).toFixed(2) + "px");
    };
    const programeaza = () => {
      if (cadruAnimatie === 0) cadruAnimatie = requestAnimationFrame(aplica);
    };
    const laMiscare = (ev: MouseEvent) => {
      const r = sectiune.getBoundingClientRect();
      x = Math.min(1, Math.max(0, (ev.clientX - r.left) / r.width));
      y = Math.min(1, Math.max(0, (ev.clientY - r.top) / r.height));
      programeaza();
    };
    const laIesire = () => {
      x = 0.5;
      y = 0.5;
      programeaza();
    };
    sectiune.addEventListener("mousemove", laMiscare);
    sectiune.addEventListener("mouseleave", laIesire);
    return () => {
      sectiune.removeEventListener("mousemove", laMiscare);
      sectiune.removeEventListener("mouseleave", laIesire);
      if (cadruAnimatie !== 0) cancelAnimationFrame(cadruAnimatie);
      el.style.removeProperty("--paralaxa-ry");
      el.style.removeProperty("--paralaxa-rx");
      el.style.removeProperty("--paralaxa-tx");
      el.style.removeProperty("--paralaxa-ty");
    };
  }, [miscare, spatiu]);

  // O foaie zboara de la marginea ferestrei (alternativ stanga si dreapta) spre marginea de sus a
  // cadrului, se roteste o treime inapoi, se strange la 0,5 si se stinge. Geometria se citeste in
  // cadrul de animatie, nu pe loc: primul mesaj soseste chiar in clicul care aduce aplicatia, iar o
  // citire acolo ar forta stilul si asezarea in mijlocul clicului. Foaia apare in acelasi cadru pictat
  // cu randul nou.
  const trimiteFoaie = useCallback(() => {
    if (!miscare) return;
    const k = urmatoareaFoaie.current;
    urmatoareaFoaie.current = k + 1;
    requestAnimationFrame(() => {
      const sp = spatiu.current;
      const c = cadru.current;
      const s = strat.current;
      const foaie = foi.current[k % FOI];
      if (!sp || !c || !s || !foaie) return;
      const stanga = sp.getBoundingClientRect().left;
      s.style.left = -stanga + "px";
      const peStanga = k % 2 === 0;
      const x0 = peStanga ? -10 : window.innerWidth - 50;
      const y0 = 4 + Math.random() * 36;
      const r0 = (peStanga ? -1 : 1) * (10 + Math.random() * 14);
      // Geometria plana a cadrului (offset* ignora transformarile), in coordonatele stratului.
      const x1 = stanga + c.offsetLeft + c.offsetWidth * (0.25 + Math.random() * 0.35);
      const y1 = c.offsetTop + 4 + 60;
      foaie.style.transition = "none";
      foaie.style.opacity = "1";
      foaie.style.transform = "translate3d(" + x0 + "px," + y0 + "px,0) rotate(" + r0 + "deg)";
      window.setTimeout(() => {
        foaie.style.transition =
          "transform " + ZBOR_MS + "ms cubic-bezier(.35,.1,.35,1), opacity 180ms linear 400ms";
        foaie.style.transform = "translate3d(" + x1 + "px," + y1 + "px,0) rotate(" + r0 / 3 + "deg) scale(.5)";
        foaie.style.opacity = "0";
      }, PORNIRE_MS);
      window.setTimeout(() => {
        foaie.style.transition = "none";
        foaie.style.opacity = "0";
      }, RESET_MS);
    });
  }, [miscare, spatiu]);

  const laFinalTur = useCallback(() => setFaza("aplicatie"), []);

  return (
    <figure ref={radacina} className={m.macheta + (scena3d ? " " + m.macheta3d : "")} data-etapa={faza}>
      <figcaption className="doar-cititor">{MACHETA.declaratie}</figcaption>
      <div className={m.plutitor}>
        <div ref={paralaxa} className={m.paralaxa} data-paralaxa="">
          <div className={m.fantoma} aria-hidden="true" />
          <div
            ref={cadru}
            className={m.cadru}
            tabIndex={-1}
            data-cadru={faza}
          >
            {faza === "tur" ? (
              <div className={m.tur}>
                <div className={m.baraTur}>
                  <span className={m.pastilaAdresa}>
                    <Ic n="lock" m={10} c={2.4} className={m.lacat} />
                    {MACHETA.adresa}
                  </span>
                </div>
                <Tur redus={redus} sigla={<Sigla forma="marca" inaltime={52} alt="" />} laFinal={laFinalTur} />
              </div>
            ) : null}
            {faza === "aplicatie" || aplicatiePregatita ? (
              <Aplicatie redus={redus} telefon={telefon} activ={faza === "aplicatie"} laMesajNou={trimiteFoaie} />
            ) : null}
          </div>
          <div className={m.reflexie} aria-hidden="true" />
        </div>
      </div>
      <button type="button" className={m.inapoi} onClick={(ev) => laInapoi(ev.detail === 0)}>
        <Ic n="arrow-left" m={13} c={2.2} />
        {MACHETA.inapoi}
      </button>
      {miscare ? (
        <div ref={strat} className={m.stratFoi} aria-hidden="true">
          {Array.from({ length: FOI }, (_, i) => (
            <div
              key={i}
              ref={(el) => {
                foi.current[i] = el;
              }}
              className={m.foaieZburatoare}
              data-foaie=""
            >
              <svg viewBox="0 0 52 64" width="46" height="58" focusable="false">
                <rect x="1.5" y="1.5" width="49" height="61" rx="4" fill="#fff" stroke="#a9b1bf" strokeWidth="1.5" />
                <path d="M11 18 H41 M11 28 H41 M11 38 H33" stroke="#d9dde5" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
          ))}
        </div>
      ) : null}
    </figure>
  );
}
