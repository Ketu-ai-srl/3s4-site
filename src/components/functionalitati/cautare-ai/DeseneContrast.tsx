// S7 - desenele contrastului (functionalitati__cautare-ai.md, S7), desenate de noi pe grila masurata
// (viewBox 280 x 200; pe ecran x 1,4 la 1440, x ~1,1 la 390). Statice, in afara cursorului.
//
//   Inainte  patru documente rasturnate (78 x 100, raza 3), fiecare rotit in jurul centrului lui, cu
//            patratul de tip, bara de titlu si randurile lui; al treilea are banda evidentiata in rosu;
//            trei semne de intrebare.
//   Acum     bara de cautare cu o intrebare scurta si cursorul care clipeste, cardul raspunsului cu
//            partea cautata in `albastru-clar` si cipul sursei, cu punct verde.
//
// CONTINUTUL pe editie (`continut`), cu implicitul RO: pagina RO nu paseaza nimic, deci randeaza ce randa. Pe 3s.md
// textele din desenul "Acum" sunt in romana (singura limba confirmata pentru intrebari), iar eticheta accesibila a
// desenului e in engleza; `limba` pune `lang` pe fiecare `<text>`, numai prin raspandire conditionata (desenul trece
// ca `vizual` prin `SectiuneScena`, client, deci props-urile lui intra in fluxul RSC).
//
// GLOSA (`continut.glosa`, decizia 75): pe pagina EN, textele romanesti ale desenului "Acum" se vad (intrebarea scurta
// din bara, raspunsul din card), deci au si ele traducerea, ca text HTML SUB desen, nu in el: desenul se micsoreaza cu
// scara lui (x ~1,1 la 390), iar un text in SVG ar fi avut un corp efectiv de ~8,9 px (masurat), sub orice prag de
// lizibilitate. Doua paragrafe, intrebarea apoi raspunsul, in ordinea citirii, cu stilul celorlalte glose ale paginii
// (corp 14,4, iar sub 768 px 13,6; interlinie 1,6; alb .5, textul secundar pe inchis; `lang` propriu), aliniate cu
// textul din cardul desenului (x 26 din 280). Stilul e INLINE, nu o clasa: o clasa de modul noua numai pe EN ar fi o
// abatere de forma nedeclarata, iar desenul nu are un parinte cu clasa din modulul acesta. SVG-ul e acelasi ca pe RO;
// fiindca nu mai e copil direct al cutiei vizualului din contrast, primeste aici latimea si inaltimea pe care i le
// dadea ea (`display: block; width: 100%; height: auto`, raportul 280 / 200 din atributele lui). Fara camp (RO),
// marcajul e cel de dinainte, element cu element, fara un loc gol in plus in fluxul RSC: de aceea doua ramuri.

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

/** Textul desenului "Inainte": numai eticheta accesibila. Constanta RO (`CONTRAST_CAUTARE.inainte`) il satisface. */
export type ContinutDesenInainte = { declaratie: string };

/** Textele desenului "Acum", pe editie; constanta RO (`CONTRAST_CAUTARE.acum`) il satisface. */
export type ContinutDesenAcum = {
  /** Eticheta accesibila a desenului (`aria-label`); textele din desen nu se citesc separat. */
  declaratie: string;
  intrebareScurta: string;
  raspunsInceput: string;
  raspunsAccent: string;
  raspunsNota: string;
  sursa: string;
  /** Glosa (decizia 75): traducerea intrebarii si a raspunsului, in limba paginii, cu codul ei. Lipsa = fara glosa (RO). */
  glosa?: { intrebare: string; raspuns: string; limba: string };
};

/** Desenul cu glosa: SVG-ul primeste ce ii dadea cutia vizualului cand era copilul ei direct. */
const SVG_CU_GLOSA = { display: "block", width: "100%", height: "auto" } as const;

/**
 * Glosa desenului, ca celelalte glose ale paginii: 14,4 px pe ecran lat si 13,6 px pe telefon (aici continuu intre
 * 390 si 768, fara media query: stilul e inline), interlinie 1,6, alb .5, aliniata cu textul cardului (26 / 280).
 */
const GLOSA_DESEN = {
  margin: "12px 0 0",
  padding: "0 9.2857%",
  fontSize: "clamp(13.6px, calc(12.8px + 0.2vw), 14.4px)",
  lineHeight: 1.6,
  textAlign: "left",
  textWrap: "pretty",
  color: "rgba(255, 255, 255, 0.5)",
} as const;

export function DesenInainte({ continut = CONTRAST_CAUTARE.inainte }: { continut?: ContinutDesenInainte }) {
  return (
    <svg viewBox="0 0 280 200" width="392" height="298" role="img" aria-label={continut.declaratie} preserveAspectRatio="xMidYMid meet">
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

export function DesenAcum({ continut = CONTRAST_CAUTARE.acum, limba }: { continut?: ContinutDesenAcum; limba?: string }) {
  const a = continut;
  const l = limba === undefined ? {} : { lang: limba };
  const bara = <rect x="14" y="20" width="252" height="30" rx="6" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.12)" strokeWidth="0.7" />;
  const lupaCerc = <circle cx="30" cy="33" r="3.5" fill="none" stroke="#2563eb" strokeWidth="1.2" />;
  const lupaCoada = <path d="M32.6 35.6 L35.3 38.3" stroke="#2563eb" strokeWidth="1.2" strokeLinecap="round" />;
  const intrebare = (
    <text x="40" y="38" fontSize="9" fill="#e6ecf5" {...l}>
      {a.intrebareScurta}
    </text>
  );
  const cursor = <rect className={s.cursorDesen} x="251" y="28" width="1" height="14" fill="#2563eb" />;
  const card = <rect x="14" y="70" width="252" height="100" rx="8" fill="#0f172a" stroke="rgba(37,99,235,0.4)" strokeWidth="1" />;
  const raspuns = (
    <text x="26" y="96" fontSize="9" fill="#e6ecf5" {...l}>
      {a.raspunsInceput}
      <tspan fontWeight="600" fill="#60a5fa">
        {a.raspunsAccent}
      </tspan>
    </text>
  );
  const nota = (
    <text x="26" y="114" fontSize="9" fill="rgba(255,255,255,0.5)" {...l}>
      {a.raspunsNota}
    </text>
  );
  const cip = <rect x="26" y="138" width="200" height="16" rx="8" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.12)" strokeWidth="0.6" />;
  const punct = <circle cx="36" cy="146" r="2.5" fill="#4ade80" />;
  const sursa = (
    <text className="t-mono" x="46" y="149" fontSize="7" fill="rgba(255,255,255,0.55)" {...l}>
      {a.sursa}
    </text>
  );
  const g = a.glosa;
  if (g === undefined) {
    return (
      <svg viewBox="0 0 280 200" width="392" height="280" role="img" aria-label={a.declaratie} preserveAspectRatio="xMidYMid meet">
        {bara}
        {lupaCerc}
        {lupaCoada}
        {intrebare}
        {cursor}
        {card}
        {raspuns}
        {nota}
        {cip}
        {punct}
        {sursa}
      </svg>
    );
  }
  // Desenul, apoi glosa intrebarii si glosa raspunsului, ca text HTML sub el (vezi antetul).
  return (
    <div data-desen-glosa="" style={{ width: "100%" }}>
      <svg viewBox="0 0 280 200" width="392" height="280" role="img" aria-label={a.declaratie} preserveAspectRatio="xMidYMid meet" style={SVG_CU_GLOSA}>
        {bara}
        {lupaCerc}
        {lupaCoada}
        {intrebare}
        {cursor}
        {card}
        {raspuns}
        {nota}
        {cip}
        {punct}
        {sursa}
      </svg>
      <p style={GLOSA_DESEN} lang={g.limba} data-glosa="intrebare">
        {g.intrebare}
      </p>
      <p style={{ ...GLOSA_DESEN, margin: "4px 0 0" }} lang={g.limba} data-glosa="raspuns">
        {g.raspuns}
      </p>
    </div>
  );
}
