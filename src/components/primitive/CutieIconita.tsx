// Cutia de iconita: 32-56 px, raza 8-12, iconita 18-22 cu contur 1,5-2, pe `ceata-albastra`,
// `albastru-pal` sau `ardezie-1`; varianta `cerc` e cercul numerotat de 28-32.

import type { ReactNode } from "react";
import Iconita from "./Iconita";
import s from "./primitive.module.css";

export type CutieIconitaProps = {
  iconita?: string;
  /** Latura cutiei, in px. */
  latura?: number;
  raza?: number;
  marimeIconita?: number;
  contur?: number;
  fundal?: "ceata" | "pal" | "ardezie" | "cerc";
  /** Pentru `cerc`: numarul afisat. */
  children?: ReactNode;
  className?: string;
};

const FUNDAL: Record<NonNullable<CutieIconitaProps["fundal"]>, string> = {
  ceata: s.cutieCeata,
  pal: s.cutiePal,
  ardezie: s.cutieArdezie,
  cerc: s.cutieCerc,
};

export default function CutieIconita({
  iconita,
  latura = 36,
  raza = 8,
  marimeIconita = 20,
  contur = 1.75,
  fundal = "ceata",
  children,
  className,
}: CutieIconitaProps) {
  return (
    <span
      className={[s.cutie, FUNDAL[fundal], className ?? ""].filter(Boolean).join(" ")}
      style={{ width: latura, height: latura, borderRadius: fundal === "cerc" ? "50%" : raza }}
      aria-hidden={children ? undefined : true}
    >
      {iconita ? <Iconita nume={iconita} marime={marimeIconita} contur={contur} /> : children}
    </span>
  );
}
