// Blocul corectorului de e-mail (COMPONENTE §4.7): `role=status`, avertisment 12/500 `chihlimbar`
// si, dedesubt, un buton-text 12 `ardezie-6` cu adresa propusa 12/600 `albastru` subliniata. Clicul
// pe propunere o pune in camp si inchide blocul (la referinta NEMASURAT; alegerea noastra).
// Campul NU devine rosu: o adresa neobisnuita nu e o eroare.

import { FORMULAR } from "@/content/formular";
import s from "./Formular.module.css";

export default function CorectorEmail({ propunere, laAlegere }: { propunere: string; laAlegere: () => void }) {
  return (
    <div role="status" className={s.corector}>
      <p className={s.corectorAvertisment}>{FORMULAR.corector.avertisment}</p>
      <button type="button" className={s.corectorPropunere} onClick={laAlegere}>
        {FORMULAR.corector.propunereInainte} <span className={s.corectorAdresa}>{propunere}</span>{" "}
        {FORMULAR.corector.propunereDupa}
      </button>
    </div>
  );
}
