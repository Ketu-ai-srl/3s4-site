// S7 - desenele contrastului (functionalitati__cautare-ai.md, S7), desenate de noi pe grila masurata
// (viewBox 280 x 200; pe ecran x 1,4 la 1440, x ~1,1 la 390). Statice, in afara cursorului.
//
//   Inainte  patru documente rasturnate (78 x 100, raza 3), fiecare rotit in jurul centrului lui, cu
//            patratul de tip, bara de titlu si randurile lui; al treilea are banda evidentiata in rosu;
//            trei semne de intrebare.
//   Acum     bara de cautare cu o intrebare scurta si cursorul care clipeste, cardul raspunsului cu
//            partea cautata in `albastru-clar` si cipul sursei, cu punct verde.

import { CONTRAST_CAUTARE } from "@/content/functionalitati/cautare-ai";
import s from "./cautare.module.css";

type Doc = { x: number; y: number; unghi: number; contur: number; banda: "neutra" | "rosie" };

const DOCUMENTE: readonly Doc[] = [
  { x: 35, y: 28, unghi: -9, contur: 0.08, banda: "neutra" },
  { x: 110, y: 22, unghi: 7, contur: 0.08, banda: "neutra" },
  { x: 70, y: 78, unghi: -3, contur: 0.14, banda: "rosie" },
  { x: 160, y: 70, unghi: 8, contur: 0.08, banda: "neutra" },
];

/** Randurile de "text" ale unui document: y si latime. */
const RANDURI: readonly (readonly [number, number])[] = [
  [20, 60],
  [26, 52],
  [32, 64],
  [38, 44],
  [58, 50],
  [64, 38],
];

export function DesenInainte() {
  return (
    <svg viewBox="0 0 280 200" width="392" height="298" role="img" aria-label={CONTRAST_CAUTARE.inainte.declaratie} preserveAspectRatio="xMidYMid meet">
      {DOCUMENTE.map((d) => (
        <g key={d.x + "-" + d.y} transform={"translate(" + d.x + " " + d.y + ") rotate(" + d.unghi + " 39 50)"}>
          <rect width="78" height="100" rx="3" fill="#0f172a" stroke={"rgba(255,255,255," + d.contur + ")"} strokeWidth="0.7" />
          <rect x="6" y="7" width="6" height="6" rx="1.5" fill="#dc2626" />
          <rect x="16" y="9" width={d.banda === "rosie" ? 32 : 40} height="3" rx="1" fill="rgba(255,255,255,0.25)" />
          {RANDURI.map(([y, l]) => (
            <rect key={y} x="6" y={y} width={l} height="2" rx="1" fill="rgba(255,255,255,0.1)" />
          ))}
          <rect
            x="6"
            y="46"
            width={d.banda === "rosie" ? 48 : 56}
            height="6"
            rx="1"
            fill={d.banda === "rosie" ? "rgba(220,38,38,0.3)" : "rgba(255,255,255,0.06)"}
          />
        </g>
      ))}
      <g className="t-mono" fontWeight="600" aria-hidden="true">
        <text x="32" y="178" fontSize="18" fill="rgba(248,113,113,0.55)">
          ?
        </text>
        <text x="244" y="40" fontSize="22" fill="rgba(255,255,255,0.22)">
          ?
        </text>
        <text x="135" y="20" fontSize="14" fill="rgba(255,255,255,0.18)">
          ?
        </text>
      </g>
    </svg>
  );
}

export function DesenAcum() {
  const a = CONTRAST_CAUTARE.acum;
  return (
    <svg viewBox="0 0 280 200" width="392" height="280" role="img" aria-label={a.declaratie} preserveAspectRatio="xMidYMid meet">
      <rect x="14" y="20" width="252" height="30" rx="6" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.12)" strokeWidth="0.7" />
      <circle cx="30" cy="33" r="3.5" fill="none" stroke="#2563eb" strokeWidth="1.2" />
      <path d="M32.6 35.6 L35.3 38.3" stroke="#2563eb" strokeWidth="1.2" strokeLinecap="round" />
      <text x="40" y="38" fontSize="9" fill="#e6ecf5">
        {a.intrebareScurta}
      </text>
      <rect className={s.cursorDesen} x="251" y="28" width="1" height="14" fill="#2563eb" />
      <rect x="14" y="70" width="252" height="100" rx="8" fill="#0f172a" stroke="rgba(37,99,235,0.4)" strokeWidth="1" />
      <text x="26" y="96" fontSize="9" fill="#e6ecf5">
        {a.raspunsInceput}
        <tspan fontWeight="600" fill="#60a5fa">
          {a.raspunsAccent}
        </tspan>
      </text>
      <text x="26" y="114" fontSize="9" fill="rgba(255,255,255,0.5)">
        {a.raspunsNota}
      </text>
      <rect x="26" y="138" width="200" height="16" rx="8" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.12)" strokeWidth="0.6" />
      <circle cx="36" cy="146" r="2.5" fill="#4ade80" />
      <text className="t-mono" x="46" y="149" fontSize="7" fill="rgba(255,255,255,0.55)">
        {a.sursa}
      </text>
    </svg>
  );
}
