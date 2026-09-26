// S6 - extragerea raspunsului (functionalitati__cautare-ai.md, S6): la p > 0,35 o raza albastra coboara
// spre card (scaleY 0 -> 1, 0,6 s) si cardul intra (opacitate 0 -> 1, 20 px -> 0, 0,6 s): fisierul, pagina
// si articolul, fraza citata, bifa verde. Legenda apare cu opacitate 1,5 (p - 0,33) la referinta, la 3S
// intreaga la p 0,45 (abaterea de contrast, in `cautare.module.css`). Totul in CSS, din
// `--p`; in HTML-ul servit si la miscare redusa cardul e deja intrat.
//
// Aici e diferentiatorul 3S (fisa S6, "Atentie"): raspunsul vine cu sursa exacta - documentul si pagina.
// Exemplul e fictiv, declarat; capacitatea e cea reala (registrul feliei, `cinema-1-raspuns-cu-pagina`).

import { Check } from "lucide-react";
import { PatratTip } from "@/components/cinema/Fereastra";
import SectiuneScena from "@/components/cinema/SectiuneScena";
import { EXTRAGERE } from "@/content/functionalitati/cautare-ai";
import f from "@/components/cinema/Fereastra.module.css";
import s from "./cautare.module.css";

export default function Extragere() {
  return (
    <SectiuneScena inaltime={95} latime={680} nume="extragere" interiorClassName={s.extragere}>
      <div className={s.raza} aria-hidden="true" />
      <figure className={[f.fereastra, s.extras].join(" ")} data-macheta="extragere">
        <div className={s.sursaExtras}>
          <PatratTip tip="pdf" />
          <span className={s.fisierExtras}>{EXTRAGERE.fisier}</span>
          <span className={s.paginaExtras}>{EXTRAGERE.pagina}</span>
        </div>
        <blockquote className={s.citatExtras}>{EXTRAGERE.citat}</blockquote>
        <div className={s.metaExtras}>
          <span className={s.bifa} aria-hidden="true">
            <Check width={12} height={12} strokeWidth={2.5} />
          </span>
          {EXTRAGERE.meta}
        </div>
        <figcaption className="doar-cititor">{EXTRAGERE.declaratie}</figcaption>
      </figure>
      <p className={s.legenda}>{EXTRAGERE.legenda}</p>
    </SectiuneScena>
  );
}
