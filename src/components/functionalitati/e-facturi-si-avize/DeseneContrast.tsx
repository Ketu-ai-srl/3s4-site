// S5 - desenele contrastului (functionalitati__e-facturi-si-avize.md, S5), pe `viewBox 0 0 280 200`.
//
//   Inainte  5 carduri mici de document (22 x 16, rotite), legate prin 4 legaturi .15 (liniuta 4 5) si 3
//            slabe .08 (2 6); legaturile CURG (`stroke-dashoffset -22` in 12 s, numai pe pagina asta); doua
//            cuvinte rosii pe legaturi; un singur patrat rosu, pe cardul din dreapta-sus.
//   Acum     inelul r 40, 5 raze .5 spre puncte r 4, nucleul r 22 cu marca 3S. Static.
//
// Pozitiile si marimile sunt cele masurate de critic (fisa S5); curbele sunt desenate de noi pe aceleasi
// capete. Desenele sunt decor cu eticheta proprie (`aria-label` pe `svg`), textul lor nu se citeste separat.

import { CONTRAST_E_FACTURI } from "@/content/functionalitati/e-facturi-si-avize";
import s from "./efacturi.module.css";

const CARDURI: ReadonlyArray<readonly [number, number, number]> = [
  [50, 50, -6],
  [230, 55, 5],
  [140, 105, -3],
  [50, 155, 7],
  [230, 155, -4],
];

export function DesenInainte() {
  const [e1, e2] = CONTRAST_E_FACTURI.inainte.etichete;
  return (
    <svg viewBox="0 0 280 200" width="392" height="280" role="img" aria-label={CONTRAST_E_FACTURI.inainte.declaratie}>
      <g fill="none" strokeWidth="1.25">
        <path className={s.curgeContrast} d="M50 50 Q140 26 230 55" stroke="rgba(255,255,255,0.15)" strokeDasharray="4 5" />
        <path className={s.curgeContrast} d="M50 50 Q100 72 140 105" stroke="rgba(255,255,255,0.15)" strokeDasharray="4 5" />
        <path className={s.curgeContrast} d="M230 55 Q190 88 140 105" stroke="rgba(255,255,255,0.15)" strokeDasharray="4 5" />
        <path className={s.curgeContrast} d="M140 105 Q95 128 50 155" stroke="rgba(255,255,255,0.15)" strokeDasharray="4 5" />
        <path className={s.curgeContrast} d="M50 50 L50 155" stroke="rgba(255,255,255,0.08)" strokeDasharray="2 6" />
        <path className={s.curgeContrast} d="M230 55 L230 155" stroke="rgba(255,255,255,0.08)" strokeDasharray="2 6" />
        <path className={s.curgeContrast} d="M50 50 Q150 110 230 155" stroke="rgba(255,255,255,0.08)" strokeDasharray="2 6" />
      </g>
      {CARDURI.map(([x, y, r], i) => (
        <g key={x + "-" + y} transform={"translate(" + x + " " + y + ") rotate(" + r + ")"}>
          <rect x="-11" y="-8" width="22" height="16" rx="3" fill="#0f172a" stroke="rgba(255,255,255,0.08)" />
          <rect x="-8" y="-4.5" width="3.5" height="3.5" rx="1" fill={i === 1 ? "#dc2626" : "#94a3b8"} />
          <line x1="-2.5" y1="-3" x2="6.5" y2="-3" stroke="rgba(255,255,255,0.1)" strokeWidth="1.4" />
          <line x1="-8" y1="1" x2="6.5" y2="1" stroke="rgba(255,255,255,0.1)" strokeWidth="1.4" />
          <line x1="-8" y1="4.5" x2="2" y2="4.5" stroke="rgba(255,255,255,0.1)" strokeWidth="1.4" />
        </g>
      ))}
      <text x="140" y="38" textAnchor="middle" fontSize="8" fontWeight="500" fill="rgba(252,165,165,0.6)">
        {e1}
      </text>
      <text x="90" y="140" textAnchor="middle" fontSize="8" fontWeight="500" fill="rgba(252,165,165,0.6)">
        {e2}
      </text>
    </svg>
  );
}

const CAPETE: ReadonlyArray<readonly [number, number]> = [
  [50, 50],
  [230, 55],
  [140, 22],
  [50, 155],
  [230, 155],
];

export function DesenAcum() {
  const a = CONTRAST_E_FACTURI.acum;
  return (
    <svg viewBox="0 0 280 200" width="392" height="280" role="img" aria-label={a.declaratie}>
      <circle cx="140" cy="100" r="40" fill="none" stroke="rgba(37,99,235,0.25)" strokeWidth="1" />
      {CAPETE.map(([x, y]) => (
        <g key={x + "-" + y}>
          <line x1="140" y1="100" x2={x} y2={y} stroke="rgba(37,99,235,0.5)" strokeWidth="1" />
          <circle cx={x} cy={y} r="4" fill="rgba(37,99,235,0.65)" />
        </g>
      ))}
      <circle cx="140" cy="100" r="22" fill="#0f172a" stroke="#2563eb" strokeWidth="1.5" />
      <text x="140" y="105.5" textAnchor="middle" fontSize="14" fontWeight="600" fill="#60a5fa">
        {a.initiala}
      </text>
    </svg>
  );
}
