// ContrastInainteAcum: sectiunea "Inainte / Acum" (functionalitati__sablon.md §4.6). Titlul, un
// paragraf, apoi doua carduri legate printr-o punte. Fara animatie de aparitie pe carduri.
//
// DOUA CONSTRUCTII masurate:
//   `svg`      grila 439 / 70 / 439 pe 980 (gap 16): card cu cap (pastila numerotata, titlu,
//              subtitlu), vizualul SVG (viewBox 280 x 200) si metricile pe 3 sau 4 coloane; puntea de
//              70 px cu 5 curbe care converg spre dreapta si eticheta ei sub grila.
//   `machete`  grila 412 / 24 / 412 pe 880 (portal-clienti, aplicatie-mobila): card `ardezie-9`, o
//              macheta in loc de SVG, metrici pe randuri; intre carduri, o linie verticala.
//
// LA 390, o coloana de 350. Puntea devine o banda de 70 px (pe `machete`, 56 px) intre carduri.
// ABATEREA: la referinta SVG-ul puntii e doar rotit si iese ~140 px peste ambele carduri (defect
// masurat pe toate paginile cu grila asta); la 3S desenul ramane in banda lui.
//
// CONTRAST: cheile metricilor si subtitlurile cardurilor aveau alb .42 (4,04:1); la 3S alb .5.
//
// Vizualul fiecarui card e al paginii (`vizual`): contrastul e forma, nu desenul.

import type { CSSProperties, ReactNode } from "react";
import SectiuneScena from "./SectiuneScena";
import s from "./ContrastInainteAcum.module.css";

export type TonCalitativ = "rau" | "bun" | "neutru";

export type Metrica = {
  valoare: string;
  cheie: string;
  /** Valoarea e un cuvant calitativ (italic): rosu pe Inainte, verde pe Acum, sau necolorat. */
  calitativ?: TonCalitativ;
  /** Culoarea valorii, cand o poarta o metrica numerica (automatizari-ai: a treia metrica). */
  ton?: "rau" | "bun";
};

export type CardContrast = {
  titlu: string;
  subtitlu: string;
  /** Desenul (SVG pe 280 x 200) sau macheta cardului. */
  vizual: ReactNode;
  metrici: readonly Metrica[];
};

export type ContrastInainteAcumProps = {
  titlu: string;
  paragraf?: string;
  /**
   * Latimea maxima a paragrafului, in px: 580 implicit (sablonul), 540 pe automatizari-ai, `null` =
   * toata latimea sectiunii (cautare-ai: fraza de ~100 de caractere sta pe un rand de 980).
   */
  latimeParagraf?: number | null;
  inainte: CardContrast;
  acum: CardContrast;
  /** Eticheta de sub punte ("x -> y"); `mono` = JetBrains Mono (cautare-ai, e-facturi). */
  punte?: { eticheta: string; mono?: boolean };
  varianta?: "svg" | "machete";
  /** Fundalul cardurilor la varianta `svg`: alb .03 (implicit), `ardezie-9` (cautare-ai), alb .02 cu chenar .07 (automatizari-ai). */
  fundal?: "transparent" | "plin" | "stins";
  /** Pastilele 01 / 02: rosu si verde (implicit) sau neutre (automatizari-ai). */
  pastile?: "colorate" | "neutre";
  /** Marimea cheilor metricilor la 1440, in px: 9,92 (implicit, cautare-ai) sau 8,8 (automatizari-ai). */
  marimeCheie?: number;
  inaltime?: number;
  className?: string;
};

function Card({
  card,
  numar,
  varianta,
  pastile,
  latura,
}: {
  card: CardContrast;
  numar: "01" | "02";
  varianta: "svg" | "machete";
  pastile: "colorate" | "neutre";
  latura: "inainte" | "acum";
}) {
  const tonPastila = pastile === "neutre" ? s.numarNeutru : numar === "01" ? s.numarRau : s.numarBun;
  return (
    <div className={[s.card, varianta === "machete" ? s.cardMachete : ""].filter(Boolean).join(" ")} data-latura={latura}>
      <div className={s.cap}>
        <span className={[s.numar, tonPastila].join(" ")}>{numar}</span>
        <div className={s.capText}>
          <h3 className={s.titluCard}>{card.titlu}</h3>
          <p className={s.subtitluCard}>{card.subtitlu}</p>
        </div>
      </div>
      <div className={varianta === "machete" ? s.macheta : s.vizual}>{card.vizual}</div>
      {varianta === "machete" ? (
        <dl className={s.metriciRanduri}>
          {card.metrici.map((m) => (
            <div key={m.cheie} className={s.metricaRand}>
              <dt className={s.cheieRand}>{m.cheie}</dt>
              <dd className={[s.valoareRand, m.calitativ ? s["calitativ-" + m.calitativ] : ""].filter(Boolean).join(" ")}>{m.valoare}</dd>
            </div>
          ))}
        </dl>
      ) : (
        <div className={s.metrici} style={{ gridTemplateColumns: "repeat(" + card.metrici.length + ", minmax(0, 1fr))" }}>
          {card.metrici.map((m) => (
            <div key={m.cheie} className={s.metrica}>
              <span
                className={[
                  s.valoare,
                  m.calitativ ? s.valoareCalitativa : "",
                  m.calitativ ? s["calitativ-" + m.calitativ] : "",
                  m.ton ? s["ton-" + m.ton] : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                {m.valoare}
              </span>
              <span className={s.cheie}>{m.cheie}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/** Puntea de 70 px: 5 curbe subtiri (alb .15) care converg spre dreapta. */
function DesenPunte() {
  const inceputuri = [20, 70, 120, 170, 220];
  return (
    <svg className={s.desenPunte} viewBox="0 0 70 240" width="70" height="240" aria-hidden="true" focusable="false">
      {inceputuri.map((y) => (
        <path key={y} d={"M0 " + y + " C 36 " + y + ", 34 120, 70 120"} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
      ))}
    </svg>
  );
}

export default function ContrastInainteAcum({
  titlu,
  paragraf,
  latimeParagraf = 580,
  inainte,
  acum,
  punte,
  varianta = "svg",
  fundal = "transparent",
  pastile = "colorate",
  marimeCheie,
  inaltime = 100,
  className,
}: ContrastInainteAcumProps) {
  const clasaFundal = fundal === "plin" ? s.fundalPlin : fundal === "stins" ? s.fundalStins : "";
  return (
    <SectiuneScena
      inaltime={inaltime}
      latime={varianta === "machete" ? 880 : 980}
      className={className}
      interiorClassName={clasaFundal}
      nume="contrast"
      style={marimeCheie === undefined ? undefined : ({ "--marime-cheie": marimeCheie + "px" } as CSSProperties)}
    >
      <h2 className={["t-h2-cinema", s.titlu].join(" ")}>{titlu}</h2>
      {paragraf ? (
        <p className={["t-paragraf-cinema", s.paragraf].join(" ")} style={{ maxWidth: latimeParagraf ?? "none" }}>
          {paragraf}
        </p>
      ) : null}
      <div className={varianta === "machete" ? s.grilaMachete : s.grila}>
        <Card card={inainte} numar="01" varianta={varianta} pastile={pastile} latura="inainte" />
        {varianta === "machete" ? (
          <div className={s.coloanaLinie} aria-hidden="true" />
        ) : (
          <div className={s.punte}>
            <DesenPunte />
            {punte ? <span className={[s.eticheta, punte.mono ? s.etichetaMono : ""].filter(Boolean).join(" ")}>{punte.eticheta}</span> : null}
          </div>
        )}
        <Card card={acum} numar="02" varianta={varianta} pastile={pastile} latura="acum" />
      </div>
    </SectiuneScena>
  );
}
