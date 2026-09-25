// Panoul Descarca din antet: 5 grupuri (Windows, macOS, Linux, Mobil, Web), elemente cu cutie de
// iconita, marcajul "(*)" pe platforma detectata si nota din subsolul panoului.

import Link from "next/link";
import { PANOU_DESCARCA, type GrupDescarca, type PlatformaDescarca } from "@/content/navigatie";
import Iconita from "@/components/primitive/Iconita";
import { ICONITA_PLATFORMA } from "./descarcare";
import s from "./PanouDescarca.module.css";

export type PanouDescarcaProps = {
  id: string;
  grupuri: GrupDescarca[];
  detectata: PlatformaDescarca | null;
};

export default function PanouDescarca({ id, grupuri, detectata }: PanouDescarcaProps) {
  return (
    <div id={id} className={s.zona}>
      <div className={s.card} role="group" aria-label={PANOU_DESCARCA.eticheta}>
        {grupuri.map((g) => (
          <div key={g.titlu} className={s.grup}>
            <p className={s.grupTitlu}>{g.titlu}</p>
            <ul className={s.lista}>
              {g.elemente.map((e) => (
                <li key={e.text}>
                  <Link href={e.href ?? "/"} className={s.element} data-element-meniu="">
                    <span className={s.cutie} aria-hidden="true">
                      <Iconita nume={ICONITA_PLATFORMA[e.platforma]} marime={20} contur={1.6} />
                    </span>
                    <span className={s.text}>
                      <span className={s.titlu}>
                        {e.text}
                        {detectata === e.platforma ? (
                          <span className={s.recomandat}>{PANOU_DESCARCA.marcajRecomandat}</span>
                        ) : null}
                      </span>
                      <span className={s.descriere}>{e.descriere}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
        <p className={s.nota}>{PANOU_DESCARCA.nota}</p>
      </div>
    </div>
  );
}
