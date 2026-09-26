// S7 - desenele contrastului (functionalitati__semnatura-calificata.md, S7), pe `viewBox 0 0 280 200`. Statice:
// pagina asta nu are curgerea liniilor (numai e-facturi o are).
//
//   Inainte  foaia (60, 32) 160 x 138 cu 6 randuri, semnatura ondulata pe linia de baza, stampila de copie
//            rotita -22 de grade (rosu .4, litere rarite), teancul de 3 plicuri in dreapta-sus, eticheta rosie
//            in stanga-sus (un cuvant romanesc; la referinta un cuvant in alta limba) si 7 pasi pe dedesubt.
//   Acum     aceeasi foaie cu 4 randuri, pastila prestatorului (generic, niciun emitent real), amprenta
//            prescurtata si marca temporala. Abatere D4c: in locul sigiliului verde cu bifa, un sigiliu in
//            contur intrerupt, cu un ceas, si o stampila rotita "integrare in curs" peste foaie - desenul arata
//            forma semnaturii de dupa integrare, nu o semnare disponibila azi prin 3S.

import { CONTRAST_SEMNATURA } from "@/content/functionalitati/semnatura-calificata";

const RANDURI_INAINTE: ReadonlyArray<readonly [number, number]> = [
  [50, 125],
  [60, 110],
  [70, 125],
  [80, 95],
  [90, 120],
  [100, 85],
];

function Plic({ x, y, o }: { x: number; y: number; o: number }) {
  return (
    <g transform={"translate(" + x + " " + y + ")"} opacity={o}>
      <rect width="14" height="9" rx="1.5" fill="#0f172a" stroke="rgba(255,255,255,0.2)" strokeWidth="0.8" />
      <path d="M0.8 1 L7 5.2 L13.2 1" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="0.8" />
    </g>
  );
}

export function DesenInainte() {
  const d = CONTRAST_SEMNATURA.inainte;
  return (
    <svg viewBox="0 0 280 200" width="392" height="280" role="img" aria-label={d.declaratie}>
      <rect x="60" y="32" width="160" height="138" rx="3" fill="#0f172a" stroke="rgba(255,255,255,0.12)" strokeWidth="0.8" />
      {RANDURI_INAINTE.map(([y, l]) => (
        <line key={y} x1="75" y1={y} x2={75 + l} y2={y} stroke="rgba(255,255,255,0.1)" strokeWidth="0.6" />
      ))}
      <line x1="90" y1="158" x2="200" y2="158" stroke="rgba(255,255,255,0.2)" strokeWidth="0.5" />
      <path d="M95 146 C 104 132, 112 150, 122 140 S 140 130, 150 142 S 170 150, 180 136 S 192 134, 195 139" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="1.3" strokeLinecap="round" />
      <text x="140" y="105" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="13" fontWeight="600" letterSpacing="3" fill="rgba(248,113,113,0.4)" transform="rotate(-22 140 105)">
        {d.stampila}
      </text>
      <g transform="translate(228 18)">
        <Plic x={-5} y={6} o={0.4} />
        <Plic x={3} y={3} o={0.7} />
        <Plic x={0} y={0} o={1} />
      </g>
      <g transform="translate(12 18)">
        <rect width="40" height="14" rx="3" fill="rgba(220,38,38,0.14)" />
        <text x="20" y="9.4" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="6" fontWeight="600" letterSpacing="1.2" fill="#f87171">
          {d.eticheta}
        </text>
      </g>
      <g transform="translate(50 188)">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <line key={i} x1={i * 30 + 3} y1="0" x2={i * 30 + 27} y2="0" stroke="rgba(255,255,255,0.16)" strokeWidth="0.7" strokeDasharray="2 2" />
        ))}
        {[0, 1, 2, 3, 4, 5, 6].map((i) => (
          <circle key={i} cx={i * 30} cy="0" r="3" fill="rgba(255,255,255,0.28)" />
        ))}
      </g>
    </svg>
  );
}

export function DesenAcum() {
  const d = CONTRAST_SEMNATURA.acum;
  return (
    <svg viewBox="0 0 280 200" width="392" height="280" role="img" aria-label={d.declaratie}>
      <rect x="60" y="32" width="160" height="138" rx="3" fill="#0f172a" stroke="rgba(255,255,255,0.12)" strokeWidth="0.8" />
      {(
        [
          [50, 130],
          [60, 120],
          [70, 130],
          [80, 105],
        ] as const
      ).map(([y, l]) => (
        <line key={y} x1="75" y1={y} x2={75 + l} y2={y} stroke="rgba(255,255,255,0.1)" strokeWidth="0.7" />
      ))}
      <rect x="95" y="20" width="90" height="13" rx="6.5" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.12)" strokeWidth="0.7" />
      <text x="140" y="29" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="6.5" fontWeight="700" fill="rgba(255,255,255,0.6)">
        {d.emitent}
      </text>
      <circle cx="140" cy="115" r="16" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.45)" strokeWidth="1.4" strokeDasharray="3 2.5" />
      <path d="M140 106 L140 115 L146 119" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <text x="140" y="88" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="10" fontWeight="700" letterSpacing="1.6" fill="rgba(251,191,36,0.75)" transform="rotate(-10 140 88)">
        {d.stampila}
      </text>
      <text x="140" y="148" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="6" fill="rgba(255,255,255,0.8)">
        {d.amprenta}
      </text>
      <text x="140" y="160" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="6" fill="rgba(255,255,255,0.55)">
        {d.marca}
      </text>
    </svg>
  );
}
