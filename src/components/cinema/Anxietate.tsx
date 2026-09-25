// Anxietatea (functionalitati__sablon.md §4.3): sectiune de text pur, 70vh, bloc 640: doua randuri
// italice (intrebarile omului care lucreaza de mana), apoi o propozitie scurta in `roz` care numeste
// riscul. Opacitate min(1, 2p), tranzitie 0,4 s; se stinge la loc la urcare.
//
// DOUA STRATURI OPTIONALE (portal-clienti, S4):
//   `straturi`  pe toata sectiunea, sub bloc (praful);
//   `fantome`   in jurul textului, intr-o cutie de `latimeFantome` (920) care iese 19 px deasupra si
//               dedesubtul lui: cardurile-fantoma din colturi. Atunci opacitatea min(1, 2p) o poarta
//               toata cutia (fantome + text), ca la referinta.
// `varianta` alege marimile masurate ale paginii (portal: randuri .55, emfaza 29,6 / 37, text 580 cu
// padding 32 0).

import type { ReactNode } from "react";
import SectiuneScena from "./SectiuneScena";
import s from "./Anxietate.module.css";

export type AnxietateProps = {
  /** Cele doua randuri italice. */
  randuri: readonly [string, string];
  /** Emfaza in `roz`. */
  emfaza: string;
  /** `portal`: randuri .55, emfaza 29,6 / 37 (portal-clienti). */
  varianta?: "sablon" | "portal";
  inaltime?: number;
  /** Latimea blocului de text (640 implicit). */
  latime?: number;
  straturi?: ReactNode;
  fantome?: ReactNode;
  /** Latimea cutiei fantomelor (920 pe portal-clienti). */
  latimeFantome?: number;
  className?: string;
};

export default function Anxietate({
  randuri,
  emfaza,
  varianta = "sablon",
  inaltime = 70,
  latime = 640,
  straturi,
  fantome,
  latimeFantome = 920,
  className,
}: AnxietateProps) {
  const text = (
    <div
      className={[s.anxietate, varianta === "portal" ? s.anxietatePortal : "", fantome ? s.textPesteFantome : ""].filter(Boolean).join(" ")}
      style={{ maxWidth: latime }}
    >
      <p className={s.rand}>{randuri[0]}</p>
      <p className={s.rand}>{randuri[1]}</p>
      <p className={s.emfaza}>{emfaza}</p>
    </div>
  );
  return (
    <SectiuneScena inaltime={inaltime} latime={null} className={[s.sectiuneAnxietate, className].filter(Boolean).join(" ")} nume="anxietate">
      {straturi}
      {fantome ? (
        <div className={s.blocFantome} style={{ maxWidth: latimeFantome }}>
          <div className={s.fantome}>{fantome}</div>
          {text}
        </div>
      ) : (
        text
      )}
    </SectiuneScena>
  );
}
