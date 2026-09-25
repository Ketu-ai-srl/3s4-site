"use client";

// S4 - generatorul de factura (functionalitati__e-facturi-si-avize.md, S4): titlul in trei cuvinte, paragraful
// si fereastra 580 x ~579: capul cu starea si butonul, randul de sabloane, fluxul de 4 randuri (ultimul in
// lucru) si metadatele.
//
// MISCAREA:
//   - cardul intra cu formula de solutie (sablon §4.5), in CSS din `--p`: la referinta opacitate
//     min(1, 2p - 0,1) si `translateY(max(0, 24 - 50p))`; la 3S aceeasi aparitie, intreaga la p ~0,44 (cardul
//     poarta text de citit, deci se incheie inainte ca sectiunea sa fie centrata; regula din README-ul
//     cadrului);
//   - la PRAGUL 0,25, O SINGURA DATA (`usePragOdata`), randul de sabloane trece de la 0 la 1 si randurile
//     fluxului de la .2 la starea finala (tranzitie 0,5 s); la urcare starea ramane.
//
// ABATEREA DE CONTRAST: la referinta randurile fluxului raman la 1 / .9 / .75 / .6 in starea finala, deci
// ultimul rand de text iese stins; aici 1 / .92 / .84 / .76, aceeasi scara, cu textul peste 4,5:1.
//
// Butonul "genereaza" e DECORATIV, ca la referinta (clicul nu face nimic): e un `span` cu forma de buton,
// nu un element focalizabil care n-ar face nimic la Enter.

import { Check, ChevronsRight } from "lucide-react";
import { useRef, type CSSProperties } from "react";
import Fereastra from "@/components/cinema/Fereastra";
import SectiuneScena from "@/components/cinema/SectiuneScena";
import b from "@/components/cinema/bucle.module.css";
import { GENERATOR } from "@/content/functionalitati/e-facturi-si-avize";
import { usePragOdata } from "./pragOdata";
import s from "./efacturi.module.css";

/** Pragul generatorului (fisa S4: intre 0,193 si 0,258; 0,25 din scriptul referintei). */
export const PRAG_GENERATOR = 0.25;
/** Opacitatea finala a randurilor fluxului (abaterea de contrast, in antet). */
export const OPACITATI_FLUX = [1, 0.92, 0.84, 0.76] as const;

function Card() {
  const ref = useRef<HTMLDivElement>(null);
  const stare = usePragOdata(ref, PRAG_GENERATOR);
  const g = GENERATOR;
  return (
    <div ref={ref} className={s.generatorLoc} data-prag={stare}>
      <Fereastra
        titlu={g.bara}
        dreapta={<span className={s.exemplu}>{g.exemplu}</span>}
        declaratie={g.declaratie}
        className={s.generator}
        nume="generator-factura"
      >
        <div className={s.capGenerator}>
          <span className={s.stareGenerator}>
            <span className={s.punctVerde} aria-hidden="true" />
            <span className={s.cheieMica}>{g.cheieStare}</span>
            <span className={s.valoareStare}>{g.stare}</span>
          </span>
          <span className={s.butonDecorativ}>
            <ChevronsRight width={14} height={14} strokeWidth={2} aria-hidden="true" focusable="false" />
            {g.buton}
          </span>
        </div>
        <div className={s.sabloane}>
          <span className={s.cheieMica}>{g.cheieSabloane}</span>
          {g.sabloane.map((t, i) => (
            <span key={t} className={[s.sablon, i === 0 ? s.sablonActiv : ""].filter(Boolean).join(" ")}>
              {t}
            </span>
          ))}
          <span className={s.sablonMaiMulte}>{g.maiMulte}</span>
        </div>
        <ol className={s.flux}>
          {g.flux.map((t, i) => {
            const inLucru = i === g.flux.length - 1;
            return (
              <li key={t} className={s.randFlux} style={{ "--o": String(OPACITATI_FLUX[i]) } as CSSProperties}>
                <span className={[s.cercFlux, inLucru ? s.cercLucru : ""].filter(Boolean).join(" ")} aria-hidden="true">
                  {inLucru ? <span className={[s.punctLucru, b.clipire16].join(" ")} /> : <Check width={12} height={12} strokeWidth={3} />}
                </span>
                <span className={s.textFlux}>{t}</span>
                {inLucru ? (
                  <span className={s.puncteLucru} aria-hidden="true">
                    ...
                  </span>
                ) : null}
              </li>
            );
          })}
        </ol>
        <dl className={s.meta}>
          {g.meta.map((m) => (
            <div key={m.cheie} className={s.randMeta}>
              <dt className={s.cheieMeta}>{m.cheie}</dt>
              <dd className={[s.valoareMeta, m.fel === "cod" ? s.valoareCod : "", m.fel === "pastila" ? s.valoarePastila : ""].filter(Boolean).join(" ")}>
                {m.valoare}
              </dd>
            </div>
          ))}
        </dl>
      </Fereastra>
    </div>
  );
}

export default function Generator() {
  return (
    <SectiuneScena inaltime={100} latime={720} nume="generator">
      <h2 className={["t-h2-cinema", s.titluSectiune].join(" ")}>{GENERATOR.titlu}</h2>
      <p className={["t-paragraf-cinema", s.paragraf].join(" ")}>{GENERATOR.paragraf}</p>
      <Card />
    </SectiuneScena>
  );
}
