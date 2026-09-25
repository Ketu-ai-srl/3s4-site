// Fereastra si piesele ei (functionalitati__sablon.md §5.1): panoul de aplicatie pe care stau toate
// machetele paginilor cinema. Componente fara stare, randate pe server.
//
//   Fereastra        `figure` pe `ardezie-9`, chenar alb .08, raza 12, umbra de fereastra (sau cea
//                    mare); bara de 35-37 px cu punct, titlu mono si, optional, o informatie la dreapta.
//                    `declaratie` e eticheta accesibila (`figcaption` ascuns vederii): machetele au date
//                    FICTIVE si se declara ca exemplu (plan D9).
//   RandFisier       rand cu patrat de tip, nume mono, cip si ora.
//   PatratTip        patratul de 8 x 8 al tipului de fisier.
//   Cip              eticheta mica: neutru, alerta, succes (cu punct care clipeste), activ.
//   PastilaStare     pastila rotunda cu punct: rosu, verde, chihlimbar.
//   CutieIconitaCinema  cutia de iconita 32-34 px, pe alb .04 cu chenar .12.
//   Nod              cardul mic ("nod") cu umbra de nod.

import type { CSSProperties, ElementType, ReactNode } from "react";
import s from "./Fereastra.module.css";

export type TonPunct = "albastru" | "chihlimbar" | "rosu" | "verde" | "neutru";

export type FereastraProps = {
  children: ReactNode;
  /** Titlul din bara (o cale, un nume de fisier), mono 11,52 alb .55. */
  titlu: ReactNode;
  /** Informatia din dreapta barei (numar de fisiere, stare), mono alb .5. */
  dreapta?: ReactNode;
  /** Culoarea punctului din bara; ferestrele "cu probleme" il au chihlimbar sau rosu. */
  punct?: TonPunct | "patrat-email" | "niciunul";
  /** Umbra mare (`0 30px 80px rgba(0,0,0,.5)`). */
  mare?: boolean;
  /**
   * La 390, textele mono mai mici: bara de 33 px (padding 8 x 12, gap 7,2, titlu si dreapta 9,92), nume
   * de fisier 10,88, ora 8,96 (avalansa de pe cautare-ai). Fara efect la 1440.
   */
  compactMobil?: boolean;
  /** Eticheta accesibila a machetei: ce arata si ca datele sunt fictive. */
  declaratie: string;
  className?: string;
  baraClassName?: string;
  corpClassName?: string;
  style?: CSSProperties;
  /** Numele machetei, pentru probe (`data-macheta`). */
  nume?: string;
};

export default function Fereastra({
  children,
  titlu,
  dreapta,
  punct = "albastru",
  mare = false,
  compactMobil = false,
  declaratie,
  className,
  baraClassName,
  corpClassName,
  style,
  nume,
}: FereastraProps) {
  return (
    <figure
      className={[s.fereastra, mare ? s.mare : "", compactMobil ? s.compact : "", className].filter(Boolean).join(" ")}
      style={style}
      data-macheta={nume}
    >
      <div className={[s.bara, baraClassName].filter(Boolean).join(" ")}>
        {punct === "niciunul" ? null : punct === "patrat-email" ? (
          <PatratTip tip="email" />
        ) : (
          <span className={[s.punct, s["punct-" + punct]].join(" ")} aria-hidden="true" />
        )}
        <span className={s.titlu}>{titlu}</span>
        {dreapta ? <span className={s.dreapta}>{dreapta}</span> : null}
      </div>
      <div className={corpClassName}>{children}</div>
      <figcaption className="doar-cititor">{declaratie}</figcaption>
    </figure>
  );
}

export type TipFisier = "pdf" | "imagine" | "tabel" | "document" | "email" | "neutru";

/** Patratul de tip (8 x 8, raza 2): PDF rosu, imagine ardezie, tabel verde, document albastru, e-mail chihlimbar. */
export function PatratTip({ tip, className }: { tip: TipFisier; className?: string }) {
  return <span className={[s.tip, s["tip-" + tip], className].filter(Boolean).join(" ")} aria-hidden="true" />;
}

export type TonCip = "neutru" | "alerta" | "succes" | "activ";

/** Cipul mic (9,92 / 600): neutru .55 pe .06, alerta, succes cu punct care clipeste, activ albastru. */
export function Cip({ ton = "neutru", mono = false, children, className }: { ton?: TonCip; mono?: boolean; children: ReactNode; className?: string }) {
  return (
    <span className={[s.cip, s["cip-" + ton], mono ? s.cipMono : "", className].filter(Boolean).join(" ")}>
      {ton === "succes" ? <span className={s.cipPunct} aria-hidden="true" /> : null}
      {children}
    </span>
  );
}

export type TonPastila = "rosu" | "verde" | "chihlimbar";

/** Pastila de stare (11,2 / 600, raza 6 sau pastila), cu punct de 6 px. */
export function PastilaStare({ ton, children, rotunda = false, className }: { ton: TonPastila; children: ReactNode; rotunda?: boolean; className?: string }) {
  return (
    <span className={[s.pastila, s["pastila-" + ton], rotunda ? s.pastilaRotunda : "", className].filter(Boolean).join(" ")}>
      <span className={s.pastilaPunct} aria-hidden="true" />
      {children}
    </span>
  );
}

/** Cutia de iconita din machete: 32 px, raza 8, alb .04, chenar .12; `rosie` pe rosu .14. */
export function CutieIconitaCinema({ children, rosie = false, className }: { children: ReactNode; rosie?: boolean; className?: string }) {
  return <span className={[s.cutie, rosie ? s.cutieRosie : "", className].filter(Boolean).join(" ")}>{children}</span>;
}

/** Cardul mic ("nod"): `ardezie-9`, chenar .08, raza 10, umbra de nod. */
export function Nod({ children, ca: Ca = "div", className, style }: { children: ReactNode; ca?: ElementType; className?: string; style?: CSSProperties }) {
  return (
    <Ca className={[s.nod, className].filter(Boolean).join(" ")} style={style}>
      {children}
    </Ca>
  );
}

export type RandFisierProps = {
  tip: TipFisier;
  nume: string;
  cip?: ReactNode;
  ora?: string;
  /** Randul-tinta: nume `albastru-clar`. */
  tinta?: boolean;
  className?: string;
  style?: CSSProperties;
};

/** Randul de fisier (sablon §5.1): patrat de tip, nume mono .8 taiat, cip optional, ora mono .4. */
export function RandFisier({ tip, nume, cip, ora, tinta = false, className, style }: RandFisierProps) {
  return (
    <div className={[s.rand, tinta ? s.randTinta : "", className].filter(Boolean).join(" ")} style={style}>
      <PatratTip tip={tip} />
      <span className={s.numeFisier}>{nume}</span>
      {cip}
      {ora ? <span className={s.ora}>{ora}</span> : null}
    </div>
  );
}
