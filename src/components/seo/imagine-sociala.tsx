// Imaginea sociala a site-ului (Open Graph si cardul social), generata la construire cu `next/og`
// din ICONITA MARCII (decupata din sigla oficiala inregistrata la OSIM, fisierul numit in
// `config/brand.json`; decizia D10: doar iconita 3S). Sigla nu se redeseneaza si nu i se adauga
// text: "3S" e deja traseu, deci imaginea nu cere niciun font - si nicio cerere catre un serviciu de
// fonturi, nici la build.
//
// Compozitia: fond alb, iconita centrata in cutia de 840 x 440 px (raportul din `viewBox`-ul
// fisierului, deci nedeformata), o banda de 12 px in albastrul marcii (#226699, planul valului S4,
// §7) la baza.
//
// Marimea si textul alternativ stau in `metadata.ts`, langa helperul paginilor, care da imaginea
// explicit fiecarei pagini interioare (acolo e scris de ce).

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { BRAND } from "@/content/entitate";
import { MARIME_IMAGINE } from "./metadata";

/** Cutia in care se incadreaza iconita, cu margini fata de banda de jos. */
const CUTIE = { latime: 840, inaltime: 440 };
const ALBASTRU_MARCA = "#226699";

/** Latimea si inaltimea din `viewBox`-ul unui SVG. */
export function marimeViewBox(svg: string): { latime: number; inaltime: number } {
  const m = svg.match(/viewBox="\s*[-\d.]+\s+[-\d.]+\s+([\d.]+)\s+([\d.]+)\s*"/);
  if (!m) throw new Error("sigla oficiala nu are viewBox: nu se poate pastra raportul laturilor");
  return { latime: Number(m[1]), inaltime: Number(m[2]) };
}

export function imagineSociala(): ImageResponse {
  const svg = readFileSync(join(process.cwd(), "public", BRAND.sigla.iconita), "utf8");
  const { latime, inaltime } = marimeViewBox(svg);
  const scara = Math.min(CUTIE.latime / latime, CUTIE.inaltime / inaltime);
  const latimeSigla = Math.round(latime * scara);
  const inaltimeSigla = Math.round(inaltime * scara);
  const sursa = "data:image/svg+xml;base64," + Buffer.from(svg, "utf8").toString("base64");
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          background: "#ffffff",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={sursa} width={latimeSigla} height={inaltimeSigla} alt="" />
        <div
          style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 12, background: ALBASTRU_MARCA, display: "flex" }}
        />
      </div>
    ),
    MARIME_IMAGINE,
  );
}
