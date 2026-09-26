"use client";

// Cele doua pliuri de sub pachete (preturi.md §7): biroul si comparatia. Pliuri native
// (`details`): se deschid si fara JavaScript, din tastatura, cu starea spusa cititorului de ecran;
// deschiderea e instantanee, se roteste doar chevronul (0,3 s), si pot sta deschise amandoua.
// Tabelul vine gata randat de pe server (`TabelPlanuri`); aici se tine doar starea biroului, ca
// scena lui sa se monteze numai cat pliul e deschis.

import { useState, type ReactNode, type SyntheticEvent } from "react";
import Iconita from "@/components/primitive/Iconita";
import { BIROU, COMPARATIE, ETICHETE_PRETURI } from "@/content/preturi";
import BirouInteractiv from "./BirouInteractiv";
import s from "./pliuri.module.css";

function Rezumat({ text }: { text: string }) {
  return (
    <summary className={s.rezumat}>
      <span>{text}</span>
      <Iconita nume="chevron-down" marime={20} contur={2} className={s.chevron} />
    </summary>
  );
}

export default function Pliuri({ tabel }: { tabel: ReactNode }) {
  const [birouDeschis, setBirouDeschis] = useState(false);
  return (
    <section className={s.pliuri} aria-label={ETICHETE_PRETURI.pliuri}>
      <div className="container-site">
        <div className={s.bloc}>
          <details
            className={s.pliu}
            onToggle={(e: SyntheticEvent<HTMLDetailsElement>) => setBirouDeschis(e.currentTarget.open)}
          >
            <Rezumat text={BIROU.titlu} />
            <div className={s.corp}>
              <p className={s.paragraf}>{BIROU.paragraf}</p>
              <BirouInteractiv activ={birouDeschis} />
            </div>
          </details>
          <details className={s.pliu}>
            <Rezumat text={COMPARATIE.titlu} />
            <div className={s.corp}>
              <p className={s.paragraf}>{COMPARATIE.paragraf}</p>
              {tabel}
            </div>
          </details>
        </div>
      </div>
    </section>
  );
}
