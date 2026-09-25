// S6 - desenele contrastului (functionalitati__automatizari-ai.md, S6), pe grila masurata `viewBox
// 0 0 280 200` (sonda `aa-cweek-1440.json`): aceeasi saptamana de 7 casute 30 x 34, raza 3, pas 35.
//
//   Inainte  X-uri rosii in zilele 1, 4 si 6, doua stive de plicuri (4 si 2), doua semne de intrebare,
//            un drum ondulat punctat si cuvantul de sub desen. Static.
//   Acum     un fulger `verde-clar` in fiecare zi, linia de flux cu punctul ei, panoul de jurnal cu trei
//            randuri si cuvantul de sub desen. Fulgerele si punctul se misca la pragul sectiunii (CSS,
//            `--p`); forma fulgerului, a clapei si a drumului ondulat sunt desenate de noi (NEMASURATE).

import type { CSSProperties, ReactNode } from "react";
import { SAPTAMANA } from "@/content/functionalitati/automatizari-ai";
import s from "./automatizari.module.css";

const PAS_ZI = 35;
const X_ZI = 18;

function Zi({ i, y, children }: { i: number; y: number; children?: ReactNode }) {
  return (
    <g transform={"translate(" + (X_ZI + PAS_ZI * i) + " " + y + ")"}>
      <rect width="30" height="34" rx="3" fill="#0f172a" stroke="rgba(255,255,255,0.12)" />
      <text x="15" y="12" textAnchor="middle" fontSize="8" fill="rgba(255,255,255,0.55)" className="t-mono">
        {SAPTAMANA.zile[i]}
      </text>
      {children}
    </g>
  );
}

/** Un plic 14 x 9 cu clapa in V, la (x, y). */
function Plic({ x, y, opacitate, clapa = true }: { x: number; y: number; opacitate: number; clapa?: boolean }) {
  return (
    <g opacity={opacitate}>
      <rect x={x} y={y} width="14" height="9" rx="1" fill="#0f172a" stroke="rgba(255,255,255,0.25)" />
      {clapa ? <path d={"M" + x + " " + y + " L" + (x + 7) + " " + (y + 5) + " L" + (x + 14) + " " + y} fill="none" stroke="rgba(255,255,255,0.25)" /> : null}
    </g>
  );
}

/** Zilele cu X rosu (indici: luni, joi, sambata). */
const ZILE_RATATE = [0, 3, 5] as const;

export function SaptamanaInainte() {
  const d = SAPTAMANA.inainte;
  return (
    <svg viewBox="0 0 280 200" width="392" height="298" role="img" aria-label={d.declaratie}>
      {SAPTAMANA.zile.map((_, i) => (
        <Zi key={i} i={i} y={30} />
      ))}
      <g stroke="#f87171" strokeWidth="1.2" strokeLinecap="round" aria-hidden="true">
        {ZILE_RATATE.map((i) => {
          const x = X_ZI + PAS_ZI * i + 22;
          return (
            <g key={i}>
              <line x1={x} y1="48" x2={x + 10} y2="58" />
              <line x1={x + 10} y1="48" x2={x} y2="58" />
            </g>
          );
        })}
      </g>
      <g transform="translate(78 88)">
        <Plic x={0} y={0} opacitate={1} />
        <Plic x={-3} y={3} opacitate={0.75} />
        <Plic x={-6} y={6} opacitate={0.55} />
        <Plic x={-9} y={9} opacitate={0.35} clapa={false} />
      </g>
      <g transform="translate(193 92)">
        <Plic x={0} y={0} opacitate={1} />
        <Plic x={-4} y={3} opacitate={0.55} clapa={false} />
      </g>
      <g className="t-mono" fontWeight="600">
        <text x="120" y="118" fontSize="14" fill="rgba(255,255,255,0.25)">
          ?
        </text>
        <text x="248" y="135" fontSize="16" fill="rgba(255,255,255,0.22)">
          ?
        </text>
      </g>
      <path
        d="M22 162 C 52 148, 82 176, 116 160 S 176 146, 206 162 S 246 170, 258 158"
        fill="none"
        stroke="rgba(255,255,255,0.25)"
        strokeDasharray="3 3"
      />
      <text x="140" y="190" textAnchor="middle" fontSize="11" className={s.italicDesen} fill="rgba(255,255,255,0.45)">
        {d.cuvant}
      </text>
    </svg>
  );
}

/** Fulgerul dintr-o zi: plin, sub initiala, in casuta de 30 x 34. */
const FULGER = "M17 15 L11.5 25 L15 25 L13 32 L19.5 21.5 L15.8 21.5 L18 15 Z";

export function SaptamanaAcum() {
  const d = SAPTAMANA.acum;
  return (
    <svg viewBox="0 0 280 200" width="392" height="280" role="img" aria-label={d.declaratie} className={s.saptamanaAcum}>
      {SAPTAMANA.zile.map((_, i) => (
        <Zi key={i} i={i} y={22}>
          <path d={FULGER} className={s.fulger} style={{ "--intarziere": (0.12 * i).toFixed(2) + "s" } as CSSProperties} />
        </Zi>
      ))}
      <line x1="20" y1="78" x2="260" y2="78" stroke="rgba(37,99,235,0.55)" />
      <circle cx="20" cy="78" r="3" className={s.punctFlux} />
      <rect x="12" y="95" width="256" height="58" rx="6" fill="#0f172a" stroke="rgba(255,255,255,0.12)" />
      <g className="t-mono" fontSize="7" fill="rgba(255,255,255,0.8)">
        {d.jurnal.map((rand, i) => (
          <text key={rand} x="20" y={108 + 17 * i}>
            {rand}
          </text>
        ))}
      </g>
      <text x="140" y="180" textAnchor="middle" fontSize="11" className={s.italicDesen} fill="rgba(255,255,255,0.45)">
        {d.cuvant}
      </text>
    </svg>
  );
}
