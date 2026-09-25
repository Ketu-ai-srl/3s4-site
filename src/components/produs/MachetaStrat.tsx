// Macheta stratului din eroul platformei (platforma.md §1): patru jetoane de fisier intra, miezul 3S
// cu bara albastra, trei campuri JSON ies, patru insigne jos. Bucla de 3,6 s ease-in-out pe fiecare
// jeton, cu doua valuri de intarzieri (fisierele 0 / 0,9 / 1,8 / 2,7 s, campurile 0,4 / 1,3 / 2,2 s),
// numai in CSS: componenta e de server si nu trimite JavaScript in pagina.
//
// Datele sunt fictive, declarate ca exemplu (plan D9): cititoarele de ecran primesc declaratia, iar
// jetoanele sunt ascunse lor (o lista de etichete fara context n-ar spune nimic in plus). Pentru ochi,
// o eticheta mica in coltul panoului spune acelasi lucru (abatere declarata de la forma masurata:
// la referinta panoul nu are eticheta, dar acolo datele nu sunt fictive).
// La miscare redusa bucla se opreste, jetoanele raman pe loc, opace.

import { Layers } from "lucide-react";
import { MACHETA_STRAT } from "@/content/produs/platforma";
import s from "./MachetaStrat.module.css";

const INTARZIERI_FISIERE = ["0s", "0.9s", "1.8s", "2.7s"];
const INTARZIERI_CAMPURI = ["0.4s", "1.3s", "2.2s"];

export default function MachetaStrat() {
  const m = MACHETA_STRAT;
  return (
    <figure className={s.macheta}>
      <figcaption className="doar-cititor">{m.declaratie}</figcaption>
      <span className={s.eticheta} aria-hidden="true">
        {m.eticheta}
      </span>
      <div className={s.intrare} aria-hidden="true">
        {m.fisiere.map((f, i) => (
          <span key={f} className={s.fisier} style={{ animationDelay: INTARZIERI_FISIERE[i] }}>
            {f}
          </span>
        ))}
      </div>
      <div className={s.miez} aria-hidden="true">
        <Layers width={26} height={26} strokeWidth={2} aria-hidden="true" focusable="false" />
        <span className={s.miezNume}>{m.miez}</span>
      </div>
      <div className={s.iesire} aria-hidden="true">
        {m.campuri.map((c, i) => (
          <span key={c} className={s.camp} style={{ animationDelay: INTARZIERI_CAMPURI[i] }}>
            <i className={s.acolada}>{"{"}</i>
            {c}
          </span>
        ))}
      </div>
      <div className={s.insigne} aria-hidden="true">
        {m.insigne.map((x) => (
          <span key={x}>{x}</span>
        ))}
      </div>
    </figure>
  );
}
