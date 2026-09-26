// Sigla marcii in piesele globale: antetul, sertarul mobil si subsolul. Fisierul vine din
// `config/brand.json` (prin `src/content/entitate.ts`); regula de folosire e in
// `docs/design/DIRECTIA.md`, sectiunea "Sigla".
//
// O SINGURA FORMA (decizia owner-ului D10, 25.09): pe site sta doar ICONITA marcii 3S - chenarul de
// scanare, dosarul si "3S" - decupata din fisierul vectorial oficial (marca inregistrata OSIM), cu
// traseele neschimbate si fereastra taiata pe iconita. Randurile de text ale siglei oficiale nu
// apar nicaieri pe site. Iconita are numai elemente colorate explicit, deci e aceeasi pe fundal
// deschis si pe fundal inchis.
//
// Imagine, nu SVG in pagina: fisierul are 12,7 KB de trasee. Pus in pagina, s-ar repeta in HTML-ul
// fiecarei pagini (antet, sertar, subsol); ca imagine se descarca o data.
//
// Sigla e mereu intr-o legatura care are deja nume accesibil, deci imaginea e decorativa: alt gol,
// marcat explicit cu `role="presentation"` (regula portii de imagini: alt gol fara marcaj e "am
// uitat", nu "am decis" - tests/browser/ajutor/detectori.ts).

import Image from "next/image";
import { BRAND } from "@/content/entitate";

/** Latime / inaltime, din `viewBox`-ul fisierului (proba `tests/fundatie-brand.test.ts`): patrat. */
export const RAPORT_SIGLA = 219.1 / 219.1;

export type SiglaMarcaProps = {
  /** Latura, in px. Iconita e patrata. */
  inaltime: number;
  prioritar?: boolean;
  className?: string;
};

export default function SiglaMarca({ inaltime, prioritar = false, className }: SiglaMarcaProps) {
  const latime = Math.round(inaltime * RAPORT_SIGLA * 10) / 10;
  return (
    <Image
      src={BRAND.sigla.iconita}
      alt=""
      width={latime}
      height={inaltime}
      unoptimized
      priority={prioritar}
      className={className}
      style={{ width: latime + "px", height: inaltime + "px" }}
      role="presentation"
      data-sigla="iconita"
    />
  );
}
