// Campul comun al formularelor (COMPONENTE §4.7, §1 #15): eticheta 14/600 deasupra, camp 47 px
// (padding 12x16, 16 px, chenar 1,5 `linie`, raza 12), focus `albastru` + inel 3 px, eroare 12
// `rosu` sub camp. La referinta campurile au doar `id`; aici au si `name`, `autocomplete`,
// `aria-invalid` si `aria-describedby`, ca eroarea sa fie citita odata cu campul.

import type { ReactNode } from "react";
import s from "./Formular.module.css";

export type CampFormularProps = {
  id: string;
  nume: string;
  eticheta: string;
  tip: "text" | "email" | "tel" | "textarea";
  valoare: string;
  laSchimbare: (v: string) => void;
  laFocus?: () => void;
  exemplu?: string;
  autocomplete?: string;
  obligatoriu?: boolean;
  eroare?: string | null;
  /** Ce sta sub camp in afara erorii (corectorul de e-mail). */
  sub?: ReactNode;
  latimePlina?: boolean;
};

export default function CampFormular({
  id,
  nume,
  eticheta,
  tip,
  valoare,
  laSchimbare,
  laFocus,
  exemplu,
  autocomplete,
  obligatoriu = false,
  eroare,
  sub,
  latimePlina = false,
}: CampFormularProps) {
  const idEroare = id + "-eroare";
  const comune = {
    id,
    name: nume,
    value: valoare,
    placeholder: exemplu,
    autoComplete: autocomplete,
    onFocus: laFocus,
    "aria-invalid": eroare ? true : undefined,
    "aria-required": obligatoriu ? true : undefined,
    "aria-describedby": eroare ? idEroare : undefined,
    className: [s.camp, eroare ? s.campEroare : ""].filter(Boolean).join(" "),
  };
  return (
    <div className={[s.grup, latimePlina ? s.grupLat : ""].filter(Boolean).join(" ")}>
      <label htmlFor={id} className={s.eticheta}>
        {eticheta}
      </label>
      {tip === "textarea" ? (
        <textarea {...comune} rows={4} className={comune.className + " " + s.zona} onChange={(e) => laSchimbare(e.target.value)} />
      ) : (
        <input {...comune} type={tip} onChange={(e) => laSchimbare(e.target.value)} />
      )}
      {eroare ? (
        <p id={idEroare} className={s.eroare}>
          {eroare}
        </p>
      ) : null}
      {sub}
    </div>
  );
}
