// CardCitat: cardurile-citat plutitoare (functionalitati__sablon.md §5.2) si varianta "fantoma" de pe
// portal-clienti (fisa portal, S4). Replici scurte de birou, inclinate, care plutesc lent.
//
//   citat    258-363 px (max 360), alb .03, chenar .08, raza 12, umbra de citat; ghilimea 24 / 600
//            `ardezie-4` (ghilimeaua dreapta, doua linii verticale), text italic 16,8 alb .6; opacitatea urmeaza progresul sectiunii, cu decalaj
//            pe card: la referinta min(1, 2(p - 0,075 x (k - 1))); la 3S aceeasi scara, stransa, intreaga
//            la p 0,45 (motivul in `CardCitat.module.css`).
//   fantoma  max 240, `ardezie-9`, chenar .08, raza 10, umbra de nod; ghilimea 19,2 alb .35, text
//            italic 14,4 alb .75; opacitate fixa (.92 / .7 / .82 / .62).
//
// Ghilimeaua e decor: se deseneaza din CSS (`content`), nu e text de citit si nu intra in masuratorile
// de contrast ale textului (la fantome are .35, ca la referinta).
//
// Plutirea: `translate` 0 -> -10 px -> 0 in 7-10 s, cu intarzieri negative, ca sa nu fie sincrone.
// Se scrie pe proprietatea `translate`, separat de rotatie (`rotate`), deci cele doua nu se ciocnesc.
// La miscare redusa animatia se opreste (regula globala), iar cardul ramane pe loc.
//
// Asezarea (`style`: pozitie absoluta, latime) o da pagina: difera pe fiecare pagina si latime.

import type { CSSProperties } from "react";
import s from "./CardCitat.module.css";

export type CardCitatProps = {
  text: string;
  varianta?: "citat" | "fantoma";
  /** Inclinarea, in grade (-3 ... +4). */
  inclinare: number;
  /** Durata plutirii, in secunde (7-10). */
  plutire: number;
  /** Intarzierea plutirii, in secunde, negativa (0, -1, -2 ...). */
  intarziere: number;
  /** Pozitia in sir (1..n) pentru decalajul opacitatii, la varianta `citat`. */
  ordine?: number;
  /** Opacitatea fixa, la varianta `fantoma`. */
  opacitate?: number;
  className?: string;
  style?: CSSProperties;
};

export default function CardCitat({
  text,
  varianta = "citat",
  inclinare,
  plutire,
  intarziere,
  ordine = 1,
  opacitate,
  className,
  style,
}: CardCitatProps) {
  const variabile = {
    "--inclinare": inclinare + "deg",
    "--plutire": plutire + "s",
    "--intarziere-plutire": intarziere + "s",
    "--k": String(ordine - 1),
    ...(opacitate === undefined ? {} : { "--opacitate-fixa": String(opacitate) }),
    ...style,
  } as CSSProperties;
  return (
    <figure className={[s.card, varianta === "fantoma" ? s.fantoma : s.citat, className].filter(Boolean).join(" ")} style={variabile}>
      <span className={s.ghilimea} aria-hidden="true" />
      <blockquote className={s.text}>{text}</blockquote>
    </figure>
  );
}
