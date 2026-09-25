"use client";

// Faza 2 a machetei: aplicatia demonstrativa (acasa-erou.md §1.6.5, §1.7).
//
// Peste 768 px: fereastra de navigator (bara cu adresa), bara laterala cu cele 4 ecrane si zona de
// continut. Sub 768 px: rama de telefon (bara de stare cu ora si decupajul, ecranul, bara de jos cu
// 4 file si indicatorul "acasa"). Ecranele se schimba numai la clic, ca la referinta.
//
// Abateri: numele filelor de pe telefon au 11 px (la referinta 9,6); textul de citit din machete nu
// coboara sub 4,5:1 (la referinta orele si metadatele erau #94a3b8, 2,56:1); adresa de primire nu
// mai e taiata in mijlocul cuvantului (e scurta si, la nevoie, se incheie cu puncte de suspensie).
//
// Latenta (plan §8.4, INP <= 200 ms pe 390 cu CPU incetinit x4). Prima asezare a unui ecran nou e
// scumpa: text care nu a mai fost asezat si iconitele SVG. Masurat pe build, CPU x4: clicul pe
// Documente, cu ecranul construit in sarcina lui, 184-320 ms (asezarea singura 99 ms, la 390); acelasi
// ecran, asezat deja o data, se reafiseaza in 3,5-7,8 ms de stil si asezare. De aceea:
//   - aplicatia se construieste dinainte, ascunsa, in timpul turului (`Macheta.tsx`), si nu porneste
//     nimic cat e ascunsa (`activ`);
//   - ecranele se construiesc toate, cate unul, in timpul liber, si raman in pagina unul peste altul;
//     cel afisat se vede, celelalte sunt ascunse cu `visibility` (asezate, nepictate, fara focus si
//     fara clic);
//   - fila apasata se schimba pe loc, iar ecranul afisat trece prin `startTransition`: daca omul e
//     mai rapid decat timpul liber, construirea nu mai tine pictura butonului.
// Dupa, cu acelasi script si aceeasi masina incarcata (2 serii de cate 3 rulari, la 390 si la 1440):
// Documente 32-136 ms, trecerea din tur 104-160 ms (inainte 248-336). Proba de latenta din
// `erou.spec.ts` le tine sub buget.
// Un ecran care iese din vedere isi reia povestea de la capat cat e ascuns (`useIesiri`), deci la
// vizita urmatoare porneste de la zero, ca inainte, cand fiecare vizita il construia din nou.

import { startTransition, useEffect, useState, type ReactNode } from "react";
import { MACHETA, type CheieEcran } from "@/content/acasa-erou";
import EcranCautare from "./EcranCautare";
import EcranDocumente from "./EcranDocumente";
import EcranPortal from "./EcranPortal";
import EcranPrimite from "./EcranPrimite";
import { inTimpulLiber } from "./hooks";
import { Ic, type NumeIconitaMacheta } from "./iconite-macheta";
import m from "./Macheta.module.css";

const ICONITA_ECRAN: Record<CheieEcran, NumeIconitaMacheta> = {
  primite: "inbox",
  documente: "folder",
  cautare: "zoom-in",
  portal: "users",
};

/** Ordinea filelor si ordinea in care se construiesc ecranele in timpul liber. */
const ORDINE: readonly CheieEcran[] = MACHETA.meniu.map((e) => e.cheie);

export type AplicatieProps = {
  redus: boolean;
  telefon: boolean;
  /**
   * Aplicatia se vede (faza 2). Construita dinainte, in timpul turului, sta ascunsa si nu porneste
   * nimic: nici ceasurile ecranelor, nici foile zburatoare.
   */
  activ: boolean;
  laMesajNou?: () => void;
};

export default function Aplicatie({ redus, telefon, activ, laMesajNou }: AplicatieProps) {
  /** Fila apasata: se schimba pe loc, ca butonul sa se picteze imediat. */
  const [ales, setAles] = useState<CheieEcran>("primite");
  /** Ecranul afisat: urmeaza fila printr-o tranzitie. */
  const [afisat, setAfisat] = useState<CheieEcran>("primite");
  /** Ecranele construite; un ecran construit ramane in pagina. */
  const [construite, setConstruite] = useState<readonly CheieEcran[]>(["primite"]);

  const alege = (cheie: CheieEcran) => {
    setAles(cheie);
    startTransition(() => {
      setConstruite((c) => (c.includes(cheie) ? c : [...c, cheie]));
      setAfisat(cheie);
    });
  };

  // Restul ecranelor, cate unul pe rand, in timpul liber: fiecare cu sarcina lui, nu toate deodata.
  useEffect(() => {
    const urmatorul = ORDINE.find((k) => !construite.includes(k));
    if (!urmatorul) return;
    return inTimpulLiber(() =>
      startTransition(() => setConstruite((c) => (c.includes(urmatorul) ? c : [...c, urmatorul]))),
    );
  }, [construite]);

  const ecran = (cheie: CheieEcran, vazut: boolean): ReactNode => {
    if (cheie === "primite") return <EcranPrimite redus={redus} telefon={telefon} activ={vazut} laMesajNou={laMesajNou} />;
    if (cheie === "documente") return <EcranDocumente redus={redus} telefon={telefon} activ={vazut} />;
    if (cheie === "cautare") return <EcranCautare redus={redus} activ={vazut} />;
    return <EcranPortal />;
  };

  const continut = ORDINE.filter((k) => construite.includes(k)).map((k) => (
    <div key={k} className={m.stratEcran + (k === afisat ? "" : " " + m.stratAscuns)} data-ecran={k}>
      {ecran(k, activ && k === afisat)}
    </div>
  ));

  const radacina = (telefon ? m.aplicatie + " " + m.telefon : m.aplicatie) + (activ ? "" : " " + m.aplicatiePregatita);

  if (telefon) {
    return (
      <div className={radacina} data-aplicatie={activ ? "activa" : "pregatita"}>
        <div className={m.baraStare}>
          <span className={m.oraTelefon}>{MACHETA.ora}</span>
          <span className={m.decupaj} aria-hidden="true" />
          <span className={m.exempluTelefon}>{MACHETA.exempluTelefon}</span>
        </div>
        <div className={m.ecranTelefon}>{continut}</div>
        <nav className={m.baraFile} aria-label={MACHETA.etichetaMeniu}>
          {MACHETA.meniu.map((e) => (
            <button
              key={e.cheie}
              type="button"
              className={m.fila + (e.cheie === ales ? " " + m.filaActiva : "")}
              aria-pressed={e.cheie === ales}
              onClick={() => alege(e.cheie)}
            >
              <Ic n={ICONITA_ECRAN[e.cheie]} m={22} c={1.6} />
              <span>{e.scurt}</span>
            </button>
          ))}
        </nav>
        <div className={m.indicatorAcasa} aria-hidden="true">
          <span />
        </div>
      </div>
    );
  }

  return (
    <div className={radacina} data-aplicatie={activ ? "activa" : "pregatita"}>
      <div className={m.baraNavigator}>
        <span className={m.casetaAdresa}>
          <Ic n="lock" m={12} c={2.2} className={m.lacat} />
          {MACHETA.adresa}
        </span>
      </div>
      <div className={m.corpAplicatie}>
        <nav className={m.baraLaterala} aria-label={MACHETA.etichetaMeniu}>
          {MACHETA.meniu.map((e) => (
            <button
              key={e.cheie}
              type="button"
              className={m.elementLateral + (e.cheie === ales ? " " + m.elementLateralActiv : "")}
              aria-pressed={e.cheie === ales}
              onClick={() => alege(e.cheie)}
            >
              <Ic n={ICONITA_ECRAN[e.cheie]} m={16} c={1.5} />
              {e.text}
            </button>
          ))}
        </nav>
        <div className={m.zonaContinut}>{continut}</div>
      </div>
    </div>
  );
}
