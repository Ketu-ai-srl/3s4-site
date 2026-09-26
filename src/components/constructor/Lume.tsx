"use client";

// Lumea constructorului (acasa-constructor.md §4-§12): ce apare dupa alegerea unei industrii.
// Modul incarcat lenes din `Constructor`. El si continutul scenelor (`acasa-constructor.ts`) stau
// intr-o bucata JS separata, nu in pachetul paginii de start (proba de browser o verifica pe build).
//
//   - randul de control (industria aleasa + "inapoi la domenii") si fraza industriei;
//   - panoul cu programul de pasi si, in spatele lui, arborele 3D (montat numai de la 1341 px);
//   - chestionarul, cu duelul si estimarea.
//
// IN DOUA TREPTE, ca primul cadru dupa clic sa nu astepte asezarea panoului (plan §8.4: INP de cel
// mult 200 ms la 390, cu procesorul incetinit de 4 ori). Cu tot panoul in clic, primul cadru venea,
// in 8 din 9 rulari, la 0,35-0,62 s, iar in urma clicului asezarea si modelarea textului duceau cam
// jumatate din sarcina (masurat 25.09). Clicul pune acum pe ecran capul lumii: randul de control,
// fraza si locul panoului, inalt cat fereastra, ca sectiunea urmatoare sa nu urce in cadru.
// Panoul, arborele si chestionarul vin in treapta a doua, ca tranzitie React, dupa primul cadru.
// Cardul intra oricum abia la pasul `start` al programului (~205 ms dupa clic), iar programul se
// socoteste de la CLIC (`momentAlegere`), nu de la montarea panoului: cronologia din fisa nu se
// muta cu treapta a doua. Dupa reparatie, primul clic la 390 cu procesorul x4: 88-200 ms in 17
// rulari (masurat 25.09); proba de browser tine pragul de 200 ms.
//
// La montare focusul trece, fara derulare, pe legatura de schimbare (§4.1). Ea e in capul lumii,
// deci in prima treapta.

import { startTransition, useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { CONSTRUCTOR, type CodIndustrie } from "@/content/acasa";
import { COMUN, SCENARII, benziPeEcran } from "@/content/acasa-constructor";
import Iconita from "@/components/primitive/Iconita";
import Arbore3D from "./Arbore3D";
import Chestionar from "./Chestionar";
import Panou, { semnalGol, type SemnalArbore } from "./Panou";
import { bandaCanalelorActiva, type Raspunsuri } from "./stare";
import s from "./Lume.module.css";
import sp from "./Panou.module.css";

type Props = {
  industrie: CodIndustrie;
  raspunsuri: Raspunsuri;
  setRaspunsuri: (f: (r: Raspunsuri) => Raspunsuri) => void;
  /** Sectiunea e vizibila macar 15%: altfel programul panoului se opreste. */
  vizibil: boolean;
  laSchimbare: () => void;
  /** `performance.now()` la clicul care a ales industria: de aici se socoteste programul. */
  momentAlegere: number;
};

/** Latimea de la care arborele are loc langa panou (§8); sub ea nu se monteaza deloc. */
export const INTERVAL_ARBORE = "(min-width: 1341px)";

function abonareArbore(anunta: () => void): () => void {
  const m = window.matchMedia(INTERVAL_ARBORE);
  m.addEventListener("change", anunta);
  return () => m.removeEventListener("change", anunta);
}

function arboreIncape(): boolean {
  return window.matchMedia(INTERVAL_ARBORE).matches;
}

function faraArbore(): boolean {
  return false;
}

export default function Lume({ industrie, raspunsuri, setRaspunsuri, vizibil, laSchimbare, momentAlegere }: Props) {
  const ind = CONSTRUCTOR.industrii.find((i) => i.cod === industrie) ?? CONSTRUCTOR.industrii[0];
  const scenariu = SCENARII[industrie];
  const benzi = benziPeEcran(industrie, bandaCanalelorActiva(raspunsuri) ? raspunsuri.canale : null);
  const [reluari, setReluari] = useState(0);
  /** Treapta a doua: panoul, arborele si chestionarul sunt in pagina. */
  const [completa, setCompleta] = useState(false);
  const cuArbore = useSyncExternalStore(abonareArbore, arboreIncape, faraArbore);
  const semnal = useRef<SemnalArbore>(semnalGol());
  const schimba = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    schimba.current?.focus({ preventScroll: true });
    startTransition(() => setCompleta(true));
  }, []);

  const laReluare = useCallback(() => setReluari((r) => r + 1), []);

  return (
    <div className={s.lume} data-industrie-aleasa={industrie} data-lume={completa ? "completa" : "cap"}>
      <div className={s.control}>
        <span className={s.ales}>
          <Iconita nume={ind.iconita} marime={15} contur={1.3} className={s.iconitaAleasa} />
          <span>{ind.nume}</span>
          <button ref={schimba} type="button" className={s.schimba} onClick={laSchimbare}>
            {COMUN.schimba}
          </button>
        </span>
      </div>
      <p className={s.fraza}>{scenariu.fraza}</p>

      {completa ? (
        <>
          <div className={sp.gazdaScena}>
            {cuArbore ? <Arbore3D semnal={semnal} /> : null}
            <Panou
              key={industrie}
              industrie={industrie}
              numeIndustrie={ind.nume}
              scenariu={scenariu}
              benzi={benzi}
              cheie={raspunsuri.rulare * 1000 + reluari}
              activ={vizibil}
              semnal={semnal}
              laReluare={laReluare}
              momentAlegere={momentAlegere}
            />
          </div>

          <Chestionar industrie={industrie} raspunsuri={raspunsuri} setRaspunsuri={setRaspunsuri} />
        </>
      ) : (
        <div className={s.locPanou} aria-hidden="true" data-loc-panou="" />
      )}
    </div>
  );
}
