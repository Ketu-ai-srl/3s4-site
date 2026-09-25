// Pivotul (functionalitati__sablon.md §4.4): sectiune de text pur, 80vh, bloc 720: intrebarea
// ipotetica, raspunsul in alb mare, apoi linia albastra cu numele functionalitatii 3S. Opacitate: la
// referinta min(1, 2(p - 0,05)), la 3S intreaga la p 0,45 (abaterea de contrast, in `Anxietate.module.css`),
// tranzitie 0,4 s; se stinge la loc la urcare.
//
// ABATEREA DE CONTRAST: la referinta intrebarea are alb .4 (3,71:1) pe cautare-ai si automatizari-ai;
// la 3S textul de citit nu coboara sub .5 (5,30:1 pe `negru-cinema`).
//
// Variantele masurate: `cautare` (bloc 640, emfaza `text-macheta`), `automatizari` (intrebarea 20 / 32,
// emfaza 36,8 / 46), `portal` (intrebarea cu 22,4 dedesubt). Blocul ia latimea continutului, ca la
// referinta (504 px pe portal-clienti).

import SectiuneScena from "./SectiuneScena";
import s from "./Anxietate.module.css";

export type PivotProps = {
  /** Randul de deschidere, intrebarea ipotetica. */
  deschidere: string;
  /** Raspunsul, in alb mare (2-4 fraze scurte). */
  emfaza: string;
  /** Linia albastra, cu numele functionalitatii 3S. */
  linie: string;
  /** `cautare`: bloc 640, emfaza `text-macheta`; `automatizari`: intrebare 20 / 32, emfaza 36,8 / 46; `portal`: 22,4 sub intrebare. */
  varianta?: "sablon" | "cautare" | "automatizari" | "portal";
  inaltime?: number;
  latime?: number;
  className?: string;
};

export default function Pivot({ deschidere, emfaza, linie, varianta = "sablon", inaltime = 80, latime, className }: PivotProps) {
  const clasaVarianta =
    varianta === "cautare" ? s.pivotCautare : varianta === "automatizari" ? s.pivotAutomatizari : varianta === "portal" ? s.pivotPortal : "";
  const latimeBloc = latime ?? (varianta === "cautare" ? 640 : 720);
  return (
    <SectiuneScena inaltime={inaltime} latime={latimeBloc} interiorLaContinut className={className} nume="pivot" interiorClassName={[s.pivot, clasaVarianta].filter(Boolean).join(" ")}>
      <p className={s.intrebare}>{deschidere}</p>
      <p className={s.raspuns}>{emfaza}</p>
      <p className={s.linie}>{linie}</p>
    </SectiuneScena>
  );
}
