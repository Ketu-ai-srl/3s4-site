"use client";

// Prima pastila a eroului si popover-ul ei (acasa-erou.md §1.6.2).
//
// Comportamentul referintei: se deschide la intrarea mouse-ului, numai pe dispozitive cu hover si
// indicator fin; se inchide la iesire; clicul comuta (singura cale pe ecran tactil); o punte
// invizibila de 12 px tine hover-ul la coborare; intrare de 140 ms.
//
// Abateri, deliberate (COMPONENTE.md §5.6, §1.7 din fisa):
//   - Escape il inchide si intoarce focusul pe pastila (la referinta Escape nu face nimic);
//   - la latimi mici nu iese din fereastra: se centreaza sub pastila si se limiteaza la latimea
//     ecranului minus marginile (la referinta 33,9 px ieseau taiati la 390);
//   - fara JavaScript pastila e un element simplu, fara `aria-expanded`: un popover care nu se
//     poate deschide nu se anunta ca deschizibil. Panoul e in HTML si atunci, ascuns cu aceeasi
//     clasa (`visibility: hidden`, deci nici vazut, nici citit de cititoarele de ecran): cele trei
//     afirmatii si legatura spre securitate se citesc si fara JavaScript (plan §8, G-AI-01), nu doar
//     din datele RSC din <script>. Dupa montare se schimba numai declansatorul, din span in buton.

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { useMontat } from "./hooks";
import s from "./Erou.module.css";

const ID_POPOVER = "erou-popover";

export type PastilaPopoverProps = {
  text: string;
  iconita: ReactNode;
  randuri: { text: string; iconita: ReactNode }[];
  legatura: ReactNode;
};

function areHoverFin(): boolean {
  return window.matchMedia("(hover: hover) and (pointer: fine)").matches;
}

export default function PastilaPopover({ text, iconita, randuri, legatura }: PastilaPopoverProps) {
  const montat = useMontat();
  const [deschis, setDeschis] = useState(false);
  const butonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!deschis) return;
    const laTasta = (ev: KeyboardEvent) => {
      if (ev.key === "Escape") {
        setDeschis(false);
        butonRef.current?.focus();
      }
    };
    document.addEventListener("keydown", laTasta);
    return () => document.removeEventListener("keydown", laTasta);
  }, [deschis]);

  const laIntrare = useCallback(() => {
    if (areHoverFin()) setDeschis(true);
  }, []);
  const laIesire = useCallback(() => {
    if (areHoverFin()) setDeschis(false);
  }, []);

  const continut = (
    <>
      {iconita}
      <span>{text}</span>
    </>
  );

  // Fara rol propriu: e panoul unui buton de dezvaluire (`aria-expanded`, `aria-controls`). Un
  // `role="group"` in plus schimba rezultatul selectorilor de meniu ai antetului (masurat pe proba
  // antetului intreg: ultimul element "vizibil" devenea legatura ascunsa de aici).
  const panou = (
    <div
      id={ID_POPOVER}
      className={s.popover + (deschis ? " " + s.popoverDeschis : "")}
      data-deschis={deschis ? "" : undefined}
    >
      <ul className={s.popoverLista}>
        {randuri.map((r) => (
          <li key={r.text} className={s.popoverRand}>
            {r.iconita}
            <span>{r.text}</span>
          </li>
        ))}
      </ul>
      {legatura}
    </div>
  );

  if (!montat) {
    return (
      <div className={s.ancoraPopover}>
        <span className={s.pastila}>{continut}</span>
        {panou}
      </div>
    );
  }

  return (
    <div className={s.ancoraPopover} onMouseEnter={laIntrare} onMouseLeave={laIesire}>
      <button
        ref={butonRef}
        type="button"
        className={s.pastila}
        aria-expanded={deschis}
        aria-controls={ID_POPOVER}
        onClick={() => setDeschis((d) => !d)}
      >
        {continut}
      </button>
      {panou}
    </div>
  );
}
