// S6 - extragerea raspunsului (functionalitati__cautare-ai.md, S6): la p > 0,35 o raza albastra coboara
// spre card (scaleY 0 -> 1, 0,6 s) si cardul intra (opacitate 0 -> 1, 20 px -> 0, 0,6 s): fisierul, pagina
// si articolul, fraza citata, bifa verde. Legenda apare cu opacitate 1,5 (p - 0,33) la referinta, la 3S
// intreaga la p 0,45 (abaterea de contrast, in `cautare.module.css`). Totul in CSS, din
// `--p`; in HTML-ul servit si la miscare redusa cardul e deja intrat.
//
// Aici e diferentiatorul 3S (fisa S6, "Atentie"): raspunsul vine cu sursa exacta - documentul si pagina.
// Exemplul e fictiv, declarat; capacitatea e cea reala (registrul feliei, `cinema-1-raspuns-cu-pagina`).
//
// CONTINUTUL pe editie (`continut`), cu implicitul RO: pagina RO nu paseaza nimic, deci randeaza ce randa. Pe 3s.md
// pasajul citat e in romana (singura limba confirmata), deci `limbaCitat` ii pune `lang`; fara ea, fara atribut.
// Atributul se pune numai prin raspandire conditionata: copiii trec prin `SectiuneScena` (client), deci props-urile
// lor intra in fluxul RSC, iar un `lang` nedefinit ar scrie acolo "$undefined" pe pagina RO.

import { Check } from "lucide-react";
import { PatratTip } from "@/components/cinema/Fereastra";
import SectiuneScena from "@/components/cinema/SectiuneScena";
import { EXTRAGERE } from "@/content/functionalitati/cautare-ai";
import f from "@/components/cinema/Fereastra.module.css";
import s from "./cautare.module.css";

/** Textele extragerii, pe editie; tip structural, constanta RO (`EXTRAGERE`) il satisface. */
export type ContinutExtragere = {
  /** Eticheta accesibila a cardului (figcaption). */
  declaratie: string;
  fisier: string;
  /** Locul din document (pe RO, pagina si punctul). */
  pagina: string;
  citat: string;
  meta: string;
  legenda: string;
};

export default function Extragere({ continut = EXTRAGERE, limbaCitat }: { continut?: ContinutExtragere; limbaCitat?: string }) {
  return (
    <SectiuneScena inaltime={95} latime={680} nume="extragere" interiorClassName={s.extragere}>
      <div className={s.raza} aria-hidden="true" />
      <figure className={[f.fereastra, s.extras].join(" ")} data-macheta="extragere">
        <div className={s.sursaExtras}>
          <PatratTip tip="pdf" />
          <span className={s.fisierExtras}>{continut.fisier}</span>
          <span className={s.paginaExtras}>{continut.pagina}</span>
        </div>
        <blockquote className={s.citatExtras} {...(limbaCitat === undefined ? {} : { lang: limbaCitat })}>
          {continut.citat}
        </blockquote>
        <div className={s.metaExtras}>
          <span className={s.bifa} aria-hidden="true">
            <Check width={12} height={12} strokeWidth={2.5} />
          </span>
          {continut.meta}
        </div>
        <figcaption className="doar-cititor">{continut.declaratie}</figcaption>
      </figure>
      <p className={s.legenda}>{continut.legenda}</p>
    </SectiuneScena>
  );
}
