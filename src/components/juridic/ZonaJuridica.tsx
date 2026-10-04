// Zona sabloanelor juridice A si A' (juridic__sablon.md §1-§2): padding 120 / 64, grila 240 + 864
// cu gap 48, bara laterala lipita la 96 px (68 antetul in pastila + 28 aer); sub 768 bara devine
// cipuri, deasupra continutului, nelipita. Pe index (A') niciun element al barei nu e activ.
//
// Navigatia poarta eticheta "Documentele juridice", nu titlul vizibil "Juridic": subsolul are deja o
// navigatie numita "Juridic", iar doua repere cu acelasi nume nu se pot deosebi (axe, landmark-unique).
//
// Abaterile de la referinta, masurate acolo ca defecte (sablon §12): grila e `minmax(0, 1fr)`, deci
// un tabel lat defileaza in el insusi si nu impinge pagina la 390; elementul activ poarta
// `aria-current="page"` si are text `albastru-apasat` (5,49:1), nu `albastru` (4,24:1).

import type { ReactNode } from "react";
import Tinta from "@/components/primitive/Tinta";
import { BARA_JURIDICA } from "@/content/juridic/pagini";
import { DOCUMENTE_JURIDICE, caleDocument } from "@/content/juridic/publicare";
import s from "./juridic.module.css";

/** Un document din bara: cheia (comparata cu `activ`), numele scurt si adresa. */
export type DocumentBara = { cheie: string; scurt: string; cale: string };

/** Textele barei: titlul vizibil al grupului si eticheta accesibila a navigatiei. */
export type TexteBara = { titlu: string; eticheta: string };

// EDITIILE (congruenta): paginile juridice ale lui 3s.md (familia `md`, `/legal/*` si `/ro/juridic/*`) folosesc
// aceeasi zona, cu documentele si textele editiei lor. Proprietatile sunt optionale, cu implicitul romanesc de
// azi (documentele familiei SEE si `BARA_JURIDICA`), deci pagina `/juridic` nu pasaza nimic si randeaza la fel.
const DOCUMENTE_RO: readonly DocumentBara[] = DOCUMENTE_JURIDICE.map((d) => ({ cheie: d.slug, scurt: d.scurt, cale: caleDocument(d.slug) }));

export function BaraJuridica({
  activ,
  documente = DOCUMENTE_RO,
  texte = BARA_JURIDICA,
}: {
  activ: string | null;
  documente?: readonly DocumentBara[];
  texte?: TexteBara;
}) {
  return (
    <nav className={s.bara} aria-label={texte.eticheta}>
      <div className={s.baraTitlu}>
        {texte.titlu}
      </div>
      <ul className={s.baraLista}>
        {documente.map((d) => {
          const esteActiv = d.cheie === activ;
          return (
            <li key={d.cheie}>
              <Tinta
                legatura={{ text: d.scurt, href: d.cale, ruta: d.cale }}
                className={s.baraLegatura}
                aria-current={esteActiv ? "page" : undefined}
              >
                {d.scurt}
              </Tinta>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export default function ZonaJuridica({
  activ,
  children,
  documente,
  texte,
}: {
  activ: string | null;
  children: ReactNode;
  /** Documentele barei, in ordinea lor; implicit cele 7 ale familiei SEE. */
  documente?: readonly DocumentBara[];
  /** Titlul si eticheta barei, in limba editiei; implicit cele romanesti. */
  texte?: TexteBara;
}) {
  return (
    <main className={s.zona}>
      <div className="container-site">
        <div className={s.grila}>
          <BaraJuridica activ={activ} {...(documente === undefined ? {} : { documente })} {...(texte === undefined ? {} : { texte })} />
          <div className={s.coloana}>{children}</div>
        </div>
      </div>
    </main>
  );
}
