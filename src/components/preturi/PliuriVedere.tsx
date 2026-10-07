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
//
// AL TREILEA PLIU, OPTIONAL (`suplimente`): suplimentele, taxa de conectare si intrebarile despre limite, pe editiile
// care publica limitele planurilor (date in `src/content/limite-planuri.ts`). Fara proprietate, pliul nu exista, deci
// pagina RO ramane cu cele doua pliuri si acelasi HTML. Pliul foloseste numai clasele pliurilor si ale tabelului (si
// acordeonul `preturi`, acelasi ca la intrebarile paginii), deci nu aduce nicio clasa de modul noua pe pagina; nu are
// legaturi, ca numarul legaturilor de canal din <main> sa ramana cel al perechii RO.

import { useEffect, useRef, useState, type ComponentType, type ReactNode, type RefObject, type SyntheticEvent } from "react";
import Acordeon from "@/components/primitive/Acordeon";
import Iconita from "@/components/primitive/Iconita";
import s from "./pliuri.module.css";

/** Continutul pliurilor, pe editie. */
export type ContinutPliuri = {
  /** Numele accesibil al sectiunii. */
  eticheta: string;
  birou: { titlu: string; paragraf: string };
  comparatie: { titlu: string; paragraf: string };
};

/** Un rand din tabelul suplimentelor: ce adauga, pretul si felul facturarii, ca text al editiei. */
export type RandSupliment = { supliment: string; pret: string; facturare: string };

/** Continutul pliului cu suplimentele, pe editie (textele si cifrele deja scrise in limba ei). */
export type ContinutSuplimente = {
  /** Titlul pliului. */
  titlu: string;
  /** Paragrafele de deasupra tabelului (pe 3s.md: ce sunt suplimentele, apoi taxa de conectare). */
  paragrafe: string[];
  /** Antetul coloanelor. */
  coloane: RandSupliment;
  /** Numele accesibil al panoului derulabil. */
  derulare: string;
  /** Randurile, grupate pe resursa (titlul grupului e randul de categorie). */
  grupuri: { titlu: string; randuri: RandSupliment[] }[];
  /** Nota de sub tabel (pe 3s.md: propozitia TVA). */
  nota: string;
  /** Intrebarile despre limite, pe acordeonul `preturi`. */
  intrebari: { intrebare: string; raspuns: string }[];
};

export type PliuriVedereProps = {
  tabel: ReactNode;
  continut: ContinutPliuri;
  /** Biroul editiei; `activ` = pliul lui e deschis. */
  Birou: ComponentType<{ activ: boolean }>;
  /** Al treilea pliu (suplimentele si limitele); fara el, pagina are numai cele doua pliuri. */
  suplimente?: ContinutSuplimente;
};

function Rezumat({ text }: { text: string }) {
  return (
    <summary className={s.rezumat}>
      <span>{text}</span>
      <Iconita nume="chevron-down" marime={20} contur={2} className={s.chevron} />
    </summary>
  );
}

/** Tabelul suplimentelor: acelasi panou, aceeasi derulare si aceleasi clase ca tabelul planurilor. */
function TabelSuplimente({ c }: { c: ContinutSuplimente }) {
  return (
    <div className={s.panouTabel}>
      <div className={s.derulare} role="region" aria-label={c.derulare} tabIndex={0}>
        <table className={s.tabel}>
          <thead>
            <tr>
              <th scope="col">{c.coloane.supliment}</th>
              <th scope="col" className={s.coloanaPlan}>
                {c.coloane.pret}
              </th>
              <th scope="col" className={s.coloanaPlan}>
                {c.coloane.facturare}
              </th>
            </tr>
          </thead>
          <tbody>
            {c.grupuri.flatMap((g) => [
              <tr key={g.titlu} className={s.randCategorie}>
                <th colSpan={3} scope="colgroup">
                  {g.titlu}
                </th>
              </tr>,
              ...g.randuri.map((r) => (
                <tr key={g.titlu + "|" + r.supliment}>
                  <th scope="row" className={s.celulaFunctie}>
                    {r.supliment}
                  </th>
                  <td className={s.celulaValoare}>
                    <span className={s.valoareTabel}>{r.pret}</span>
                  </td>
                  <td className={s.celulaValoare}>
                    <span className={s.valoareTabel}>{r.facturare}</span>
                  </td>
                </tr>
              )),
            ])}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/**
 * Marcheaza panourile de tabel care chiar se deruleaza (`data-deruleaza`), ca foaia de stil sa arate indicatia
 * scrisa numai atunci: pe 390 tabelul pachetelor se deruleaza, al suplimentelor incape. Atributul il pune numai
 * clientul, dupa masuratoare, deci HTML-ul servit ramane cel de pana acum. Masuratoarea se reia cand panoul isi
 * schimba marimea, inclusiv la deschiderea pliului (inchis, panoul are latimea 0).
 *
 * Tot aici, deplasarea orizontala a panoului ajunge in variabila `--derulat`: randurile de categorie au o singura
 * celula pe toata latimea, care nu se poate lipi la stanga ca prima coloana, deci titlul ei se muta cu atat cat s-a
 * derulat (foaia de stil, `text-indent`) si ramane citibil langa eticheta randului.
 */
function useDerulareTabele(sectiune: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const radacina = sectiune.current;
    if (!radacina || typeof ResizeObserver === "undefined") return;
    const panouri = Array.from(radacina.querySelectorAll<HTMLElement>("." + s.derulare));
    const potriveste = (el: HTMLElement) => el.toggleAttribute("data-deruleaza", el.scrollWidth > el.clientWidth + 1);
    const observator = new ResizeObserver((intrari) => {
      for (const i of intrari) {
        const panou = (i.target as HTMLElement).closest<HTMLElement>("." + s.derulare);
        if (panou) potriveste(panou);
      }
    });
    const laDerulare = (e: Event) => {
      const panou = e.currentTarget as HTMLElement;
      panou.style.setProperty("--derulat", panou.scrollLeft + "px");
    };
    for (const p of panouri) {
      potriveste(p);
      observator.observe(p);
      if (p.firstElementChild) observator.observe(p.firstElementChild);
      p.addEventListener("scroll", laDerulare, { passive: true });
    }
    return () => {
      observator.disconnect();
      for (const p of panouri) p.removeEventListener("scroll", laDerulare);
    };
  }, [sectiune]);
}

export default function PliuriVedere({ tabel, continut, Birou, suplimente }: PliuriVedereProps) {
  const [birouDeschis, setBirouDeschis] = useState(false);
  const sectiune = useRef<HTMLElement>(null);
  useDerulareTabele(sectiune);
  return (
    <section ref={sectiune} className={s.pliuri} aria-label={continut.eticheta}>
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
          {suplimente ? (
            <details className={s.pliu} data-pliu-suplimente="">
              <Rezumat text={suplimente.titlu} />
              <div className={s.corp}>
                {suplimente.paragrafe.map((p) => (
                  <p key={p} className={s.paragraf}>
                    {p}
                  </p>
                ))}
                <TabelSuplimente c={suplimente} />
                <p className={s.paragraf} style={{ marginTop: 16 }}>
                  {suplimente.nota}
                </p>
                <Acordeon
                  varianta="preturi"
                  elemente={suplimente.intrebari.map((i) => ({ intrebare: i.intrebare, raspuns: <p>{i.raspuns}</p> }))}
                />
              </div>
            </details>
          ) : null}
        </div>
      </div>
    </section>
  );
}
