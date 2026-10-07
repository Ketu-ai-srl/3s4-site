// Cardul divizat de pe comparatia cu drive-ul (comparatie-drive.md §2): stanga, ce face bine un
// drive (bife, fundal ardezie-0, nota de concesie); dreapta, situatiile care cer o arhiva
// (triunghiuri de avertizare chihlimbar). La 390 coloanele se aseaza una sub alta.
//
// PE EDITIE: pe 3s.md (EN si /ro) coloanele spun altceva, "cand nu alegi 3S" la stanga si "cand se potriveste
// 3S" la dreapta; acolo bifele stau pe motivele pentru 3S, iar avertizarile pe cazurile in care 3S nu e prima
// alegere (`bifeLaDreapta`). Fara proprietate ramane forma RO, cu acelasi HTML. Clasele iconitelor sunt aceleasi
// pe ambele forme, deci multimea claselor paginii nu se schimba.

import { Check, TriangleAlert } from "lucide-react";
import s from "./comparatii.module.css";

export type CardDivizatProps = {
  stanga: { titlu: string; elemente: string[]; nota: string };
  dreapta: { titlu: string; elemente: string[] };
  /** Bifele la dreapta si avertizarile la stanga (3s.md); lipsa = forma RO, bife la stanga. */
  bifeLaDreapta?: boolean;
};

function Bifa() {
  return <Check size={15} strokeWidth={2} className={s.listaIconita} aria-hidden="true" focusable="false" />;
}

function Avertizare() {
  return (
    <TriangleAlert
      size={15}
      strokeWidth={1.8}
      className={s.listaIconitaAvertizare}
      aria-hidden="true"
      focusable="false"
    />
  );
}

export default function CardDivizat({ stanga, dreapta, bifeLaDreapta = false }: CardDivizatProps) {
  const IconitaStanga = bifeLaDreapta ? Avertizare : Bifa;
  const IconitaDreapta = bifeLaDreapta ? Bifa : Avertizare;
  return (
    <div className={s.divizat}>
      <div className={s.divizatStanga}>
        <h2 className={s.divizatTitlu}>{stanga.titlu}</h2>
        <ul className={s.lista}>
          {stanga.elemente.map((e) => (
            <li key={e} className={s.listaRand}>
              <IconitaStanga />
              <span>{e}</span>
            </li>
          ))}
        </ul>
        <p className={s.divizatNota}>{stanga.nota}</p>
      </div>
      <div className={s.divizatDreapta}>
        <h2 className={s.divizatTitlu}>{dreapta.titlu}</h2>
        <ul className={s.lista}>
          {dreapta.elemente.map((e) => (
            <li key={e} className={s.listaRand}>
              <IconitaDreapta />
              <span>{e}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
