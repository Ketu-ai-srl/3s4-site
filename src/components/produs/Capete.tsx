// Capetele de sectiune ale paginilor de produs, in cele trei forme masurate:
//
//   CapCentrat          platforma: max 720, centrat, eticheta optionala, fraza-metafora optionala
//                       (17,6/500 albastru), h2 40 (30 sub 768), subtitlu 18 cerneala-2 max 600
//   CapNumeratPlatforma platforma, blocurile 01-03: numarul 25,6/600 albastru langa titlu, flex
//                       cu gap 20, max 820; sub 760 numarul trece deasupra (gap 8)
//   CapNumeratSecuritate securitate, blocurile 01-09: grila 80 + 1fr pe linia de baza, max 880;
//                       numarul discret (ardezie-3); sub 900 o coloana, sub 560 numarul la 25,6.
//                       Varianta `centrat` (09): numar si titlu centrate, si pe mobil (la referinta
//                       titlul iesea la stanga sub 760, defect care nu se copiaza)
//
// NUMERELE DE ORDINE sunt decor: titlul spune deja despre ce e blocul. Pe securitate stau intr-un
// pseudo-element, ascunse cititoarelor, cu culoarea discreta a referintei (WCAG 1.4.3 scuteste
// textul pur decorativ); pe platforma sunt albastre, 5,17:1, si se citesc ca text.

import type { ReactNode } from "react";
import { nerupt } from "./nerupt";
import s from "./produs.module.css";

type CapCentratProps = {
  titlu: ReactNode;
  eticheta?: string;
  metafora?: string;
  subtitlu?: ReactNode;
  id?: string;
  className?: string;
};

export function CapCentrat({ titlu, eticheta, metafora, subtitlu, id, className }: CapCentratProps) {
  return (
    <header className={[s.capCentrat, className ?? ""].filter(Boolean).join(" ")}>
      {eticheta ? <span className={"t-eticheta-sectiune " + s.capEticheta}>{eticheta}</span> : null}
      <h2 id={id} className={"t-h2-sectiune " + s.capTitlu}>
        {nerupt(titlu)}
      </h2>
      {metafora ? <p className={s.capMetafora}>{nerupt(metafora)}</p> : null}
      {subtitlu ? <p className={"t-subtitlu-sectiune " + s.capSubtitluCentrat}>{nerupt(subtitlu)}</p> : null}
    </header>
  );
}

type CapNumeratProps = {
  numar: string;
  titlu: ReactNode;
  subtitlu?: ReactNode;
  id?: string;
};

export function CapNumeratPlatforma({ numar, titlu, subtitlu, id }: CapNumeratProps) {
  return (
    <header className={s.capNumeratPlatforma}>
      <span className={s.numarPlatforma}>{numar}</span>
      <div className={s.capMeta}>
        <h2 id={id} className={"t-h2-sectiune " + s.capTitlu}>
          {nerupt(titlu)}
        </h2>
        {subtitlu ? <p className={"t-subtitlu-sectiune " + s.capSubtitluPlatforma}>{nerupt(subtitlu)}</p> : null}
      </div>
    </header>
  );
}

export function CapNumeratSecuritate({ numar, titlu, subtitlu, id, centrat = false }: CapNumeratProps & { centrat?: boolean }) {
  return (
    <header className={[s.capNumeratSecuritate, centrat ? s.capNumeratCentrat : ""].filter(Boolean).join(" ")}>
      <span className={s.numarSecuritate} data-numar={numar} aria-hidden="true" />
      <div className={s.capMeta}>
        <h2 id={id} className={"t-h2-sectiune " + s.capTitluSecuritate}>
          {nerupt(titlu)}
        </h2>
        {subtitlu ? <p className={"t-subtitlu-sectiune " + s.capSubtitluSecuritate}>{nerupt(subtitlu)}</p> : null}
      </div>
    </header>
  );
}
