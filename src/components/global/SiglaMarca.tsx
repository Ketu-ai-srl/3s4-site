// Sigla marcii in piesele globale: antetul, sertarul mobil si subsolul. Fisierele vin din
// `config/brand.json` (prin `src/content/entitate.ts`); regula de folosire e in
// `docs/design/DIRECTIA.md`, sectiunea "Sigla".
//
// DOUA FORME, un singur desen oficial (marca inregistrata OSIM):
//   - `completa`: fisierul oficial intreg - iconita si cele trei randuri, ADRIA / DOC MANAGEMENT /
//     scan-store-solve. Se foloseste numai la o marime la care cel mai mic rand trece de 11 px.
//   - `compacta`: iconita oficiala si cuvantul ADRIA, decupate din fisierul oficial cu traseele
//     neschimbate, pentru locurile inguste. Taiata la latimea iconitei, da iconita singura.
// Varianta pentru fundal inchis exista numai la forma completa: acolo DOC MANAGEMENT e desenat in
// negrul implicit si trece pe alb. Forma compacta are numai elemente colorate explicit, deci e
// aceeasi pe ambele fundaluri.
//
// Imagine, nu SVG in pagina: fisierele au 15-29 KB de trasee. Puse in pagina, s-ar repeta in
// HTML-ul fiecarei pagini (antet, sertar, subsol); ca imagine se descarca o data.
//
// Sigla e mereu intr-o legatura care are deja nume accesibil, deci imaginea e decorativa: alt gol,
// marcat explicit cu `role="presentation"` (regula portii de imagini: alt gol fara marcaj e "am
// uitat", nu "am decis" - tests/browser/ajutor/detectori.ts).

import Image from "next/image";
import { BRAND } from "@/content/entitate";

/** Latime / inaltime, din `viewBox`-ul fiecarui fisier (proba `tests/fundatie-brand.test.ts`). */
export const RAPORT_SIGLA = {
  completa: 685.0901 / 288.69996,
  compacta: 522.4 / 219.1,
} as const;

export type SiglaMarcaProps = {
  forma: keyof typeof RAPORT_SIGLA;
  /** Inaltimea, in px. Latimea urmeaza raportul desenului. */
  inaltime: number;
  /** `inchis` = varianta pentru fundal inchis (doar la forma completa). */
  tema?: "deschis" | "inchis";
  prioritar?: boolean;
  className?: string;
};

export function fisierSigla(forma: SiglaMarcaProps["forma"], tema: "deschis" | "inchis" = "deschis"): string {
  if (forma === "compacta") {
    return BRAND.sigla.compacta;
  }
  return tema === "inchis" ? BRAND.sigla.completaPeInchis : BRAND.sigla.completa;
}

export default function SiglaMarca({ forma, inaltime, tema = "deschis", prioritar = false, className }: SiglaMarcaProps) {
  const latime = Math.round(inaltime * RAPORT_SIGLA[forma] * 10) / 10;
  return (
    <Image
      src={fisierSigla(forma, tema)}
      alt=""
      width={latime}
      height={inaltime}
      unoptimized
      priority={prioritar}
      className={className}
      style={{ width: latime + "px", height: inaltime + "px" }}
      role="presentation"
      data-sigla={forma}
    />
  );
}
