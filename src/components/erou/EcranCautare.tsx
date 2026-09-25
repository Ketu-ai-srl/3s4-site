"use client";

// Ecranul 3 al aplicatiei demonstrative: intrebarea pusa arhivei (acasa-erou.md §1.6.5, "cautare
// AI"). Cererea se scrie litera cu litera, 40 ms pe caracter, cu cursorul care clipeste; la 500 ms
// dupa ultima litera apar rezultatele (numarul, doua acte cu pagina citata, restul numarate), cele
// doua butoane si cardul care face din cerere o regula. Scrierea incepe cand ecranul e afisat si se
// reia la fiecare vizita. La miscare redusa totul apare deodata.
//
// Rezultatele sunt in pagina de la inceput, ascunse (`visibility`) pana la aparitie: asa sunt deja
// asezate, iar aparitia lor nu mai aseaza nimic de la zero in mijlocul animatiei (vezi Aplicatie.tsx).

import { memo, useEffect, useState } from "react";
import { MACHETA } from "@/content/acasa-erou";
import { Ic } from "./iconite-macheta";
import m from "./Macheta.module.css";

const PE_CARACTER_MS = 40;
const DUPA_SCRIERE_MS = 500;

// `memo`: ecranele raman montate unul langa altul (Aplicatie.tsx); vezi EcranPrimite.tsx.
export default memo(function EcranCautare({ redus, activ }: { redus: boolean; activ: boolean }) {
  const c = MACHETA.cautare;
  const caractere = Array.from(c.cerere);
  const [scrise, setScrise] = useState(redus ? caractere.length : 0);
  const [rezultate, setRezultate] = useState(redus);

  // Iesirea din ecran reia cererea de la prima litera, cat ecranul e ascuns.
  useEffect(() => {
    if (activ || redus) return;
    setScrise(0);
    setRezultate(false);
  }, [activ, redus]);

  useEffect(() => {
    if (redus || !activ) return;
    if (scrise < caractere.length) {
      const t = window.setTimeout(() => setScrise((n) => n + 1), PE_CARACTER_MS);
      return () => window.clearTimeout(t);
    }
    const t = window.setTimeout(() => setRezultate(true), DUPA_SCRIERE_MS);
    return () => window.clearTimeout(t);
  }, [scrise, caractere.length, redus, activ]);

  return (
    <div className={m.ecran}>
      <div className={m.ecranBara}>
        <span className={m.ecranTitlu}>
          <Ic n="zoom-in" m={15} />
          {c.titlu}
        </span>
      </div>
      <div className={m.ecranCorp + " " + m.corpCautare}>
        <div className={m.casetaCautare}>
          <Ic n="search" m={18} c={2} className={m.iconitaAlbastra} />
          <span className={m.cerere}>
            <span className="doar-cititor">{c.cerere}</span>
            <span aria-hidden="true">{caractere.slice(0, scrise).join("")}</span>
            <span className={m.cursor} aria-hidden="true" />
          </span>
        </div>
        <div className={m.rezultate + (rezultate ? " " + m.rezultateVazute : "")} data-rezultate={rezultate ? "vazute" : "ascunse"}>
          <p className={m.numarRezultate}>
            <Ic n="circle-check" m={16} c={2} className={m.bifaVerde} />
            {c.gasite}
          </p>
          <div className={m.listaRezultate}>
            {c.rezultate.map((r) => (
              <div key={r.fisier} className={m.randRezultat}>
                <span className={m.fisierRezultat}>{r.fisier}</span>
                <span className={m.locRezultat}>{r.loc}</span>
              </div>
            ))}
            <div className={m.randRezultat + " " + m.incaRezultate}>… {c.inca}</div>
          </div>
          <div className={m.actiuniRezultat}>
            <span className={m.butonMacheta + " " + m.butonMachetaPlin}>
              <Ic n="message-circle" m={13} c={2} />
              {c.trimite}
            </span>
            <span className={m.butonMacheta}>
              <Ic n="download" m={13} c={2} />
              {c.descarca}
            </span>
          </div>
          <div className={m.cardAutomatizare}>
            <div className={m.capAutomatizare}>
              <Ic n="zap" m={13} c={2} />
              {c.regula.titlu}
            </div>
            <div className={m.corpAutomatizare}>
              <div className={m.randAutomatizare}>
                <span className={m.etichetaAutomatizare}>{c.regula.cand}</span>
                <span className={m.valoareAutomatizare}>{c.regula.candValoare}</span>
              </div>
              <div className={m.randAutomatizare}>
                <span className={m.etichetaAutomatizare}>{c.regula.actiune}</span>
                <span className={m.valoareAutomatizare}>{c.regula.actiuneValoare}</span>
              </div>
              <span className={m.butonCreeaza}>{c.regula.buton}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});
