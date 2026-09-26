// Steagurile tarilor din verificatorul de termene, desenate de noi ca SVG (referinta foloseste un
// font de steaguri, pe care site-ul nu-l incarca). Tricolorul romanesc e exact; la Republica
// Moldova stema e SIMPLIFICATA la marimea de iconita (aripi si scut), fiindca la 21 x 14 px desenul
// complet nu se mai distinge. Sunt decorative: numele tarii sta mereu langa ele, ca text.

import type { CodTara } from "@/content/termene/date";

export type SteagProps = {
  cod: CodTara;
  className?: string;
};

// Culorile, in valorile hexazecimale folosite uzual pentru reprezentarea pe ecran a celor doua
// steaguri (albastru, galben, rosu, de la hampa spre margine).
const CULORI: Record<CodTara, [string, string, string]> = {
  ro: ["#002b7f", "#fcd116", "#ce1126"],
  md: ["#0046ae", "#ffd200", "#cc092f"],
};

export default function Steag({ cod, className }: SteagProps) {
  const [stanga, mijloc, dreapta] = CULORI[cod];
  return (
    <svg width="21" height="14" viewBox="0 0 30 20" className={className} aria-hidden="true" focusable="false">
      <rect x="0" y="0" width="10" height="20" fill={stanga} />
      <rect x="10" y="0" width="10" height="20" fill={mijloc} />
      <rect x="20" y="0" width="10" height="20" fill={dreapta} />
      {cod === "md" ? (
        <g>
          <path d="M11.2 6.4 L13.7 7.7 L15 5.2 L16.3 7.7 L18.8 6.4 L17.9 10.1 L16.1 11 H13.9 L12.1 10.1 Z" fill="#b07e28" />
          <path d="M13.7 8.3 H16.3 V10.4 H13.7 Z" fill="#cc092f" />
          <path d="M13.7 10.4 H16.3 V10.9 Q16.3 12.6 15 13.1 Q13.7 12.6 13.7 10.9 Z" fill="#0046ae" />
        </g>
      ) : null}
      <rect x="0.25" y="0.25" width="29.5" height="19.5" fill="none" stroke="#0f172a" strokeOpacity="0.12" strokeWidth="0.5" />
    </svg>
  );
}
