"use client";

// Cele doua pliuri de sub pachete, VEDEREA (preturi.md §7): biroul si comparatia. Pliuri native
// (`details`): se deschid si fara JavaScript, din tastatura, cu starea spusa cititorului de ecran;
// deschiderea e instantanee, se roteste doar chevronul (0,3 s), si pot sta deschise amandoua.
// Tabelul vine gata randat de pe server (`TabelPlanuri`); aici se tine doar starea biroului, ca
// scena lui sa se monteze numai cat pliul e deschis.
//
// PE EDITIE: vederea nu importa niciun continut. Titlurile si paragrafele pliurilor, eticheta sectiunii
// si biroul (insula, cu textele lui) vin de la invelitoarea editiei (`Pliuri.tsx` pe RO). Biroul se
// alege acolo, fiindca un tip de componenta nu trece granita server-client.

import { useState, type ComponentType, type ReactNode, type SyntheticEvent } from "react";
import Iconita from "@/components/primitive/Iconita";
import s from "./pliuri.module.css";

/** Continutul pliurilor, pe editie. */
export type ContinutPliuri = {
  /** Numele accesibil al sectiunii. */
  eticheta: string;
  birou: { titlu: string; paragraf: string };
  comparatie: { titlu: string; paragraf: string };
};

export type PliuriVedereProps = {
  tabel: ReactNode;
  continut: ContinutPliuri;
  /** Biroul editiei; `activ` = pliul lui e deschis. */
  Birou: ComponentType<{ activ: boolean }>;
};

function Rezumat({ text }: { text: string }) {
  return (
    <summary className={s.rezumat}>
      <span>{text}</span>
      <Iconita nume="chevron-down" marime={20} contur={2} className={s.chevron} />
    </summary>
  );
}

export default function PliuriVedere({ tabel, continut, Birou }: PliuriVedereProps) {
  const [birouDeschis, setBirouDeschis] = useState(false);
  return (
    <section className={s.pliuri} aria-label={continut.eticheta}>
      <div className="container-site">
        <div className={s.bloc}>
          <details
            className={s.pliu}
            onToggle={(e: SyntheticEvent<HTMLDetailsElement>) => setBirouDeschis(e.currentTarget.open)}
          >
            <Rezumat text={continut.birou.titlu} />
            <div className={s.corp}>
              <p className={s.paragraf}>{continut.birou.paragraf}</p>
              <Birou activ={birouDeschis} />
            </div>
          </details>
          <details className={s.pliu}>
            <Rezumat text={continut.comparatie.titlu} />
            <div className={s.corp}>
              <p className={s.paragraf}>{continut.comparatie.paragraf}</p>
              {tabel}
            </div>
          </details>
        </div>
      </div>
    </section>
  );
}
