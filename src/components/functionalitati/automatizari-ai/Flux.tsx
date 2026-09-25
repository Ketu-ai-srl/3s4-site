"use client";

// S4 - fluxul (functionalitati__automatizari-ai.md, S4): actul in centru ("inima"), cele patru
// departamente in jur, in zigzag, si razele care pleaca spre ele. Scena 900 x 540 (`aspect-ratio 5/3`),
// la 390 verticala, 3/5.
//
// MISCAREA:
//   - inima: la p >= 0,12 (masurat intre 0,09 si 0,15) primeste `popIn` 0,4 s, `scale(0) -> scale(1)`;
//     sub prag se stinge clasa, deci se repeta la fiecare trecere (fisa S4);
//   - razele si cardurile: la referinta nu se aprind niciodata (conditia e NEMASURATA, fisa S4). La 3S,
//     propunerea fisei: razele se traseaza pe rand, in ordinea drumului din regula (FLUX.ordine), la
//     p = 0,2 / 0,3 / 0,4 / 0,5, iar cardul se aprinde cand raza ajunge la el (chenar albastru .35,
//     cercul iconitei pe albastru .15). In HTML-ul servit si la miscare redusa: totul aprins.
//
// ABATEREA LA 390: la referinta cardurile de la 13% si 87% ies din fereastra (x -9 si x 395), iar
// razele raman pe grila orizontala intr-o scena verticala. Aici cardurile stau la 27% / 73%, doua pe
// rand, si razele au desenul lor vertical (`razeMobil`).

import type { CSSProperties } from "react";
import { PatratTip } from "@/components/cinema/Fereastra";
import SectiuneScena, { useDinProgres } from "@/components/cinema/SectiuneScena";
import { ACT_EXEMPLU, FLUX, ROLURI } from "@/content/functionalitati/automatizari-ai";
import { ICONITE_ROL } from "./Asteptare";
import s from "./automatizari.module.css";

/** Pragul inimii (fisa S4). */
export const PRAG_INIMA = 0.12;

/** Pragul razei spre rolul i: locul lui in drumul actului, de la 0,2, cu pas 0,1. */
export function pragRol(i: number): number {
  const loc = (FLUX.ordine as readonly number[]).indexOf(i);
  return Math.round((0.2 + 0.1 * Math.max(0, loc)) * 100) / 100;
}

type Punct = readonly [number, number];

/** Centrele cardurilor, in procente din scena: 1440 (zigzag) si 390 (doua cate doua). */
const POZITII_LAT: readonly Punct[] = [
  [13, 78],
  [37, 22],
  [63, 78],
  [87, 22],
];
const POZITII_INGUST: readonly Punct[] = [
  [27, 78],
  [27, 22],
  [73, 78],
  [73, 22],
];

/** O raza de la inima (centrul) la centrul cardului, cu o singura curbura. Coordonate in grila data. */
function cale([hx, hy]: Punct, [tx, ty]: Punct): string {
  const c1x = hx + (tx - hx) * 0.5;
  const c2y = hy + (ty - hy) * 0.5;
  return "M" + hx + " " + hy + " C" + c1x + " " + hy + ", " + tx + " " + c2y + ", " + tx + " " + ty;
}

/**
 * Razele, pe o grila cu raportul scenei (600 x 360 la 1440, 300 x 500 la 390), deci scalate uniform.
 * `grosime` e in unitatile grilei, aleasa ca pe ecran sa iasa ~1 px (x 1,5 la 1440, x ~1,17 la 390).
 * Fara `vector-effect: non-scaling-stroke`: cu el, liniutele se masoara pe ecran, iar `pathLength`
 * pe grila, si raza se oprea la doua treimi din drum.
 */
function Raze({
  latime,
  inaltime,
  grosime,
  pozitii,
  className,
}: {
  latime: number;
  inaltime: number;
  grosime: number;
  pozitii: readonly Punct[];
  className: string;
}) {
  const inima: Punct = [latime / 2, inaltime / 2];
  return (
    <svg className={[s.raze, className].join(" ")} viewBox={"0 0 " + latime + " " + inaltime} aria-hidden="true" focusable="false">
      {pozitii.map(([px, py], i) => (
        <path
          key={i}
          className={s.raza}
          d={cale(inima, [(px / 100) * latime, (py / 100) * inaltime])}
          pathLength={1}
          strokeWidth={grosime}
          style={{ "--prag": String(pragRol(i)) } as CSSProperties}
        />
      ))}
    </svg>
  );
}

function RolFlux({ i }: { i: number }) {
  const rol = ROLURI[i];
  const prag = pragRol(i);
  const aprins = useDinProgres((p) => p >= prag);
  const Iconita = ICONITE_ROL[rol.iconita];
  const [xl, yl] = POZITII_LAT[i];
  const [xi, yi] = POZITII_INGUST[i];
  const stil = { "--x": xl + "%", "--y": yl + "%", "--x-mobil": xi + "%", "--y-mobil": yi + "%" } as CSSProperties;
  return (
    <li className={s.rolFlux} style={stil} data-aprins={aprins ? "da" : "nu"}>
      <div className={s.cardRol}>
        <div className={s.capRol}>
          <span className={s.cercRol} aria-hidden="true">
            <Iconita width={20} height={20} strokeWidth={1.75} focusable="false" />
          </span>
          <span className={s.numeRol}>{rol.nume}</span>
        </div>
        <p className={s.sarcinaRol}>{rol.sarcina}</p>
      </div>
    </li>
  );
}

function Inima() {
  const aprins = useDinProgres((p) => p >= PRAG_INIMA);
  return (
    <div className={s.inima}>
      <div className={s.miezInima} data-aprins={aprins ? "da" : "nu"}>
        <PatratTip tip="neutru" />
        <span className={s.numeInima}>{ACT_EXEMPLU}</span>
      </div>
    </div>
  );
}

export default function Flux() {
  return (
    <SectiuneScena inaltime={110} spatiere="scena-sus" latime={980} className={s.sectiuneFlux} nume="flux">
      <figure className={s.figura} data-macheta="flux">
        <div className={s.scena}>
          <Raze latime={600} inaltime={360} grosime={0.7} pozitii={POZITII_LAT} className={s.razeDesktop} />
          <Raze latime={300} inaltime={500} grosime={0.86} pozitii={POZITII_INGUST} className={s.razeMobil} />
          <ul className={s.roluriFlux}>
            {ROLURI.map((rol, i) => (
              <RolFlux key={rol.nume} i={i} />
            ))}
          </ul>
          <Inima />
        </div>
        <figcaption className="doar-cititor">{FLUX.declaratie}</figcaption>
      </figure>
      <p className={s.legendaFlux}>{FLUX.legenda}</p>
    </SectiuneScena>
  );
}
