"use client";

// Lista de preturi ca PDF, VEDEREA (preturi.md §6e): un buton-text care pune o clasa pe `html` si cheama
// dialogul de tiparire; se tipareste o foaie de oferta ascunsa pe ecran (antet, tabel, note).
//
// La referinta restul paginii era doar ascuns (`visibility`), deci ramanea in flux: 1 pagina cu
// continut si 7 goale (masurat cu `page.pdf`). La 3S tot ce nu e foaia iese din flux (`display:
// none`), iar foaia e un copil direct al lui `body` (portal), ca regula sa nu atinga nimic altceva.
// Regulile de tiparire stau intr-un `<style>` pus numai cat foaia exista: daca omul tipareste
// pagina altfel (Ctrl P), fara clasa, se tipareste pagina, ca de obicei.
//
// PE EDITIE: vederea nu importa niciun continut. Butonul, foaia (cu moneda din antetul coloanelor),
// calea paginii si planurile vin de la invelitoarea editiei (`ListaPdf.tsx` pe RO); data zilei se scrie
// cu `formatData`, tot al editiei, fiindca numele lunilor sunt text.
//
// ADRESA DE PE FOAIE: editia da calea SURSA a paginii de preturi (`/ro/preturi`, `/pricing`), ca toate datele; foaia
// scrie calea SERVITA pe domeniul care tipareste, prin aceeasi traducere ca legaturile din pagina (`hrefTinta`). Pe
// asezarea `md` (3s.md, site-ul RO) e identitatea; pe `ro` (3s.com.ro) `/ro/preturi` devine `/preturi`, iar `/pricing`
// devine `/en/pricing`. Inainte foaia scria calea sursa, iar pe 3s.com.ro `/pricing` raspunde 404.

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { hrefTinta } from "@/components/primitive/Tinta";
import type { Plan } from "@/content/preturi";
import type { CodAsezare, RutaAsezabila } from "@/lib/asezare";
import { ATRIBUT_FOAIE, CLASA_TIPAR } from "./constante";
import IconitaPret from "./iconite";
import s from "./pachete.module.css";

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

/** Continutul listei ca PDF, pe editie; tip structural, constanta RO (`LISTA_PDF`) il satisface. */
export type ContinutListaPdf = {
  buton: string;
  foaie: {
    marca: string;
    titlu: string;
    /** Antetul coloanelor; cele doua coloane de pret poarta moneda. */
    coloane: { plan: string; lunar: string; anual: string };
    note: string[];
    /** Textul dinaintea adresei paginii de preturi. */
    adresa: string;
  };
};

export type FoaieOfertaVedereProps = {
  gazda: string;
  data: string;
  continut: ContinutListaPdf;
  planuri: readonly Plan[];
  /** Calea SURSA a paginii de preturi; ultima nota scrie, dupa gazda, calea ei servita (`adresaFoii`). */
  cale: string;
  /** Manifestul rutelor si asezarea; implicit cele ale build-ului. Parametri numai pentru probe. */
  rute?: readonly RutaAsezabila[];
  asezare?: CodAsezare;
};

/** Adresa scrisa pe foaie: gazda si calea SERVITA a paginii de preturi, tradusa ca `href`-ul unei legaturi. */
export function adresaFoii(gazda: string, cale: string, rute?: readonly RutaAsezabila[], asezare?: CodAsezare): string {
  return gazda + hrefTinta(cale, rute, asezare);
}

export function FoaieOfertaVedere({ gazda, data, continut, planuri, cale, rute, asezare }: FoaieOfertaVedereProps) {
  const f = continut.foaie;
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
          {planuri.map((p) => (
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
          <span className={s.foaieMono}>{adresaFoii(gazda, cale, rute, asezare)}</span>
        </p>
      </div>
    </div>
  );
}

export type ListaPdfVedereProps = {
  gazda: string;
  continut: ContinutListaPdf;
  planuri: readonly Plan[];
  cale: string;
  /** Data zilei, in limba editiei. */
  formatData: (d: Date) => string;
};

export default function ListaPdfVedere({ gazda, continut, planuri, cale, formatData }: ListaPdfVedereProps) {
  const [montat, setMontat] = useState(false);
  const [data, setData] = useState("");

  useEffect(() => {
    setMontat(true);
    setData(formatData(new Date()));
  }, [formatData]);

  const tipareste = () => {
    const html = document.documentElement;
    setData(formatData(new Date()));
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
          {continut.buton}
        </button>
      </div>
      {montat
        ? createPortal(
            <FoaieOfertaVedere gazda={gazda} data={data} continut={continut} planuri={planuri} cale={cale} />,
            document.body,
          )
        : null}
    </>
  );
}
