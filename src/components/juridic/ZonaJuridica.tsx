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
import { DOCUMENTE_JURIDICE, caleDocument, type SlugJuridic } from "@/content/juridic/publicare";
import s from "./juridic.module.css";

export function BaraJuridica({ activ }: { activ: SlugJuridic | null }) {
  return (
    <nav className={s.bara} aria-label={BARA_JURIDICA.eticheta}>
      <div className={s.baraTitlu}>
        {BARA_JURIDICA.titlu}
      </div>
      <ul className={s.baraLista}>
        {DOCUMENTE_JURIDICE.map((d) => {
          const cale = caleDocument(d.slug);
          const esteActiv = d.slug === activ;
          return (
            <li key={d.slug}>
              <Tinta
                legatura={{ text: d.scurt, href: cale, ruta: cale }}
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

export default function ZonaJuridica({ activ, children }: { activ: SlugJuridic | null; children: ReactNode }) {
  return (
    <main className={s.zona}>
      <div className="container-site">
        <div className={s.grila}>
          <BaraJuridica activ={activ} />
          <div className={s.coloana}>{children}</div>
        </div>
      </div>
    </main>
  );
}
