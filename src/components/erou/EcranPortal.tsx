// Ecranul 4 al aplicatiei demonstrative: portalul unui client (acasa-erou.md §1.6.5, "portal").
// Static, ca la referinta: vizitatorul, firma lui, dosarul cu actele puse la dispozitie si doua note.

import { memo } from "react";
import { MACHETA } from "@/content/acasa-erou";
import { Ic } from "./iconite-macheta";
import m from "./Macheta.module.css";

// `memo`: ecranele raman montate unul langa altul (Aplicatie.tsx); vezi EcranPrimite.tsx.
export default memo(function EcranPortal() {
  const p = MACHETA.portal;
  return (
    <div className={m.ecran}>
      <div className={m.ecranBara}>
        <span className={m.ecranTitlu}>
          <Ic n="users" m={15} />
          {p.titlu}
        </span>
        <span className={m.vizitator}>
          <span className={m.avatarVizitator}>{p.vizitator.initiale}</span>
          <span className={m.numeVizitator}>{p.vizitator.nume}</span>
          <span className={m.rolVizitator}>{p.vizitator.rol}</span>
        </span>
      </div>
      <div className={m.ecranCorp}>
        <div className={m.cardFirma}>
          <span className={m.siglaFirma}>{p.firma.initiala}</span>
          <span className={m.textFirma}>
            <span className={m.numeFirma}>{p.firma.nume}</span>
            <span className={m.subtitluFirma}>{p.firma.subtitlu}</span>
          </span>
        </div>
        <div className={m.dosarPortal}>
          <div className={m.capDosarPortal}>
            <span className={m.titluDosarPortal}>
              <Ic n="folder" m={15} c={2} className={m.iconitaAlbastra} />
              {p.dosar}
            </span>
            <span className={m.numarDosarPortal}>{p.numar}</span>
          </div>
          {p.acte.map((a) => (
            <div key={a.fisier} className={m.randPortal}>
              <span className={m.insigna + " " + m.insignaPdf + " " + m.insignaRand}>PDF</span>
              <span className={m.fisierPortal}>{a.fisier}</span>
              {a.nou ? <span className={m.etichetaNou}>{p.nou}</span> : null}
              <span className={m.dataPortal}>{a.data}</span>
              <span className={m.butonDescarca} role="img" aria-label={p.descarca}>
                <Ic n="download" m={13} c={2} />
              </span>
            </div>
          ))}
          <div className={m.incaPortal}>+ {p.inca}</div>
        </div>
        <p className={m.notaPortal}>
          <Ic n="zap" m={13} c={1.8} />
          {p.note[0]}
        </p>
        <p className={m.notaPortal}>
          <Ic n="search" m={13} c={1.8} />
          {p.note[1]}
        </p>
      </div>
    </div>
  );
});
