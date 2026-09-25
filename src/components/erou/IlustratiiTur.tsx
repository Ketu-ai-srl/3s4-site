// Cele trei ilustratii ale turului (acasa-erou.md §1.6.4), desenate aici, pe o panza de 300 x 150:
// linie neagra si `albastru`, cu animatii infinite. Desenele referintei nu se folosesc; se pastreaza
// rolul fiecarei ilustratii, duratele si curbele masurate (animatiile sunt in `Macheta.module.css`).
//
//   posta   - plic, drum punctat, dosar cu bula de discutie; o foaie trece din plic in dosar
//             (3,2 s), iar scanteia din bula se roteste (5 s, liniar);
//   scanare - pagina scanata cu banda albastra, marca, trei randuri, semnatura care se deseneaza
//             (3,4 s) si stampila care apare (scala 1,5 -> 1);
//   flux    - actul, trei oameni legati de el, trei impulsuri (3,6 s, decalate cu 0,25 s), o
//             notificare cu clopotel si semnul "deschis".
//
// La miscare redusa desenele raman statice, in starea care spune povestea: semnatura trasa,
// stampila, notificarea si semnul vizibile.

import type { IlustratieTur } from "@/content/acasa-erou";
import m from "./Macheta.module.css";

const NEGRU = "#1a1a1a";
const ALBASTRU = "#2563eb";
const GRI = "#d9dde5";

function Posta() {
  return (
    <svg viewBox="0 0 300 150" className={m.ilustratie} aria-hidden="true" focusable="false">
      <g fill="none" strokeLinecap="round" strokeLinejoin="round">
        {/* plicul */}
        <rect x="18" y="50" width="78" height="54" rx="7" stroke={NEGRU} strokeWidth="2.6" fill="#fff" />
        <path d="M20 55 L57 83 L94 55" stroke={NEGRU} strokeWidth="2.6" />
        {/* drumul punctat, cu varf */}
        <path d="M110 78 H172" stroke="#b6bdc9" strokeWidth="2.4" strokeDasharray="2 7" />
        <path d="M167 72 L174 78 L167 84" stroke="#b6bdc9" strokeWidth="2.4" />
        {/* dosarul */}
        <path
          d="M190 68 a6 6 0 0 1 6 -6 h20 l8 8 h50 a6 6 0 0 1 6 6 v42 a6 6 0 0 1 -6 6 h-78 a6 6 0 0 1 -6 -6 z"
          stroke={ALBASTRU}
          strokeWidth="2.6"
          fill="#f5f8ff"
        />
        <path d="M190 82 H280" stroke={ALBASTRU} strokeWidth="2" opacity="0.5" />
        {/* bula de discutie deasupra dosarului */}
        <path
          d="M212 12 h56 a8 8 0 0 1 8 8 v18 a8 8 0 0 1 -8 8 h-40 l-10 9 v-9 h-6 a8 8 0 0 1 -8 -8 v-18 a8 8 0 0 1 8 -8 z"
          stroke={NEGRU}
          strokeWidth="2.4"
          fill="#fff"
        />
      </g>
      {/* scanteia din bula */}
      <g className={m.scanteie}>
        <path d="M240 20 L243 26 L249 29 L243 32 L240 38 L237 32 L231 29 L237 26 Z" fill={ALBASTRU} />
      </g>
      {/* foaia care calatoreste din plic in dosar */}
      <g className={m.foaieCalatoare}>
        <rect x="0" y="0" width="15" height="19" rx="2.5" fill="#fff" stroke={ALBASTRU} strokeWidth="1.8" />
        <path d="M4 6 H11 M4 10 H11 M4 14 H9" stroke={ALBASTRU} strokeWidth="1.4" strokeLinecap="round" />
      </g>
    </svg>
  );
}

function Scanare() {
  return (
    <svg viewBox="0 0 300 150" className={m.ilustratie} aria-hidden="true" focusable="false">
      <defs>
        <clipPath id="erou-pagina-scanata">
          <rect x="106" y="8" width="88" height="132" rx="7" />
        </clipPath>
      </defs>
      <g clipPath="url(#erou-pagina-scanata)">
        <rect x="106" y="8" width="88" height="132" fill="#fff" />
        <rect x="106" y="8" width="88" height="9" fill={ALBASTRU} />
      </g>
      <rect x="106" y="8" width="88" height="132" rx="7" fill="none" stroke={NEGRU} strokeWidth="2.6" />
      {/* semnul scanarii: patru colturi si linia care trece peste pagina (nu o sigla) */}
      <path
        d="M118 32 V27 H123 M132 27 H137 V32 M137 41 V46 H132 M123 46 H118 V41 M121.5 36.5 H133.5"
        fill="none"
        stroke={ALBASTRU}
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <g stroke={GRI} strokeWidth="4" strokeLinecap="round">
        <path d="M118 60 H182" />
        <path d="M118 72 H170" />
        <path d="M118 84 H178" />
      </g>
      {/* semnatura, trasa din nou la fiecare ciclu */}
      <path
        className={m.semnatura}
        d="M118 116 C124 104 128 104 130 112 C132 120 136 122 140 110 C143 102 147 104 148 112 C149 118 153 118 158 110"
        fill="none"
        stroke={NEGRU}
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* stampila */}
      <g className={m.stampila}>
        <circle cx="174" cy="114" r="13" fill="#f5f8ff" stroke={ALBASTRU} strokeWidth="2" />
        <circle cx="174" cy="114" r="9" fill="none" stroke={ALBASTRU} strokeWidth="1.2" strokeDasharray="2 2.4" />
        <path d="M169 114 L172.5 117.5 L179 110.5" fill="none" stroke={ALBASTRU} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </g>
    </svg>
  );
}

function Om({ y }: { y: number }) {
  return (
    <g transform={"translate(214 " + y + ")"}>
      <rect x="0" y="0" width="32" height="32" rx="8" fill="#fff" stroke={NEGRU} strokeWidth="2.4" />
      <circle cx="16" cy="12.5" r="4.6" fill="none" stroke={NEGRU} strokeWidth="2.2" />
      <path d="M8 26 C9.5 20 22.5 20 24 26" fill="none" stroke={NEGRU} strokeWidth="2.2" strokeLinecap="round" />
    </g>
  );
}

function Flux() {
  return (
    <svg viewBox="0 0 300 150" className={m.ilustratie} aria-hidden="true" focusable="false">
      {/* legaturile dintre act si oameni */}
      <g fill="none" stroke="#e2e8f0" strokeWidth="2" strokeLinecap="round">
        <path d="M100 75 C150 75 160 30 212 30" />
        <path d="M100 75 H212" />
        <path d="M100 75 C150 75 160 120 212 120" />
      </g>
      {/* actul */}
      <rect x="40" y="42" width="58" height="68" rx="7" fill="#f5f8ff" stroke={ALBASTRU} strokeWidth="2.6" />
      <g stroke="#b6c9f2" strokeWidth="3" strokeLinecap="round">
        <path d="M51 58 H86" />
        <path d="M51 69 H80" />
        <path d="M51 80 H84" />
        <path d="M51 91 H74" />
      </g>
      <circle cx="100" cy="75" r="3.6" fill={ALBASTRU} />
      <Om y={14} />
      <Om y={59} />
      <Om y={104} />
      {/* impulsurile */}
      <circle className={m.impuls + " " + m.impuls1} r="3.4" fill={ALBASTRU} />
      <circle className={m.impuls + " " + m.impuls2} r="3.4" fill={ALBASTRU} />
      <circle className={m.impuls + " " + m.impuls3} r="3.4" fill={ALBASTRU} />
      {/* notificarea */}
      <g className={m.notificareIlustratie}>
        <rect x="254" y="61" width="38" height="28" rx="7" fill="#fff" stroke="#cbd5e1" strokeWidth="1.8" />
        <path
          d="M267 79 h12 c-1.6 -1.6 -2.2 -3 -2.2 -6.2 a3.8 3.8 0 0 0 -7.6 0 c0 3.2 -0.6 4.6 -2.2 6.2 z M271.2 81.6 a2 2 0 0 0 3.6 0"
          fill="none"
          stroke={ALBASTRU}
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      {/* semnul "deschis" */}
      <g className={m.deschis}>
        <circle cx="249" cy="120" r="7.5" fill={ALBASTRU} />
        <path d="M245.5 120 L248 122.5 L252.8 117.6" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </g>
    </svg>
  );
}

export default function IlustratieScena({ fel }: { fel: IlustratieTur }) {
  if (fel === "posta") return <Posta />;
  if (fel === "scanare") return <Scanare />;
  return <Flux />;
}
