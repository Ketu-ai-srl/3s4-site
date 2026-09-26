"use client";

// Lista de preturi ca PDF (preturi.md §6e): un buton-text care pune o clasa pe `html` si cheama
// dialogul de tiparire; se tipareste o foaie de oferta ascunsa pe ecran (antet, tabel, note).
//
// La referinta restul paginii era doar ascuns (`visibility`), deci ramanea in flux: 1 pagina cu
// continut si 7 goale (masurat cu `page.pdf`). La 3S tot ce nu e foaia iese din flux (`display:
// none`), iar foaia e un copil direct al lui `body` (portal), ca regula sa nu atinga nimic altceva.
// Regulile de tiparire stau intr-un `<style>` pus numai cat foaia exista: daca omul tipareste
// pagina altfel (Ctrl P), fara clasa, se tipareste pagina, ca de obicei.

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { CALE_PRETURI, LISTA_PDF, PLANURI } from "@/content/preturi";
import { ATRIBUT_FOAIE, CLASA_TIPAR } from "./constante";
import IconitaPret from "./iconite";
import s from "./pachete.module.css";

const LUNI = [
  "ianuarie",
  "februarie",
  "martie",
  "aprilie",
  "mai",
  "iunie",
  "iulie",
  "august",
  "septembrie",
  "octombrie",
  "noiembrie",
  "decembrie",
];

/** Data zilei, in romana: "25 septembrie 2026". */
export function dataRomaneasca(d: Date): string {
  return d.getDate() + " " + LUNI[d.getMonth()] + " " + d.getFullYear();
}

/** Regulile de tiparire: numai foaia ramane, restul iese din flux. */
export const REGULI_TIPAR =
  "@media print{html." +
  CLASA_TIPAR +
  " body>:not([" +
  ATRIBUT_FOAIE +
  "]){display:none!important}html." +
  CLASA_TIPAR +
  " body>[" +
  ATRIBUT_FOAIE +
  "]{display:block!important}}";

export function FoaieOferta({ gazda, data }: { gazda: string; data: string }) {
  const f = LISTA_PDF.foaie;
  return (
    <div className={s.foaie} {...{ [ATRIBUT_FOAIE]: "" }} aria-hidden="true">
      <style>{REGULI_TIPAR}</style>
      <div className={s.foaieCap}>
        <div className={s.foaieMarca}>
          <span className={s.foaieNume}>{f.marca}</span>
          <span className={s.foaieMic}>{gazda}</span>
        </div>
        <div className={s.foaieMeta}>
          <span className={s.foaieTitlu}>{f.titlu}</span>
          <span className={s.foaieMic}>{data}</span>
        </div>
      </div>
      <table className={s.foaieTabel}>
        <thead>
          <tr>
            <th>{f.coloane.plan}</th>
            <th>{f.coloane.lunar}</th>
            <th>{f.coloane.anual}</th>
          </tr>
        </thead>
        <tbody>
          {PLANURI.map((p) => (
            <tr key={p.cheie}>
              <td>
                <span className={s.foaiePlan}>{p.nume}</span>
                <span className={s.foaieDescriere}>{p.descriere}</span>
              </td>
              <td className={s.foaieCifra}>{p.pret.lunar}</td>
              <td className={s.foaieCifra}>{p.pret.anual}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className={s.foaieNote}>
        {f.note.map((n) => (
          <p key={n}>{n}</p>
        ))}
        <p>
          {f.adresa}
          <span className={s.foaieMono}>{gazda + CALE_PRETURI}</span>
        </p>
      </div>
    </div>
  );
}

export default function ListaPdf({ gazda }: { gazda: string }) {
  const [montat, setMontat] = useState(false);
  const [data, setData] = useState("");

  useEffect(() => {
    setMontat(true);
    setData(dataRomaneasca(new Date()));
  }, []);

  const tipareste = () => {
    const html = document.documentElement;
    setData(dataRomaneasca(new Date()));
    const curata = () => html.classList.remove(CLASA_TIPAR);
    window.addEventListener("afterprint", curata, { once: true });
    html.classList.add(CLASA_TIPAR);
    // Data noua trebuie sa fie in foaie inainte de dialog: un cadru, apoi tiparirea.
    window.requestAnimationFrame(() => {
      window.print();
    });
  };

  return (
    <>
      <div className={s.randPdf}>
        <button type="button" className={s.butonPdf} onClick={tipareste}>
          <IconitaPret nume="imprimanta" marime={14} contur={1.4} />
          {LISTA_PDF.buton}
        </button>
      </div>
      {montat ? createPortal(<FoaieOferta gazda={gazda} data={data} />, document.body) : null}
    </>
  );
}
