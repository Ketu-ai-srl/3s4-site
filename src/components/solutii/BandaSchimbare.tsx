// S3 al paginii de sector (solutii__sablon.md): banda `ardezie-0` cu chenare pe toata latimea, h2,
// paragraful-punte, 3 buline cu bifa si cardul cu scena hartiilor (piesa client, `CardScena`).

import type { Sector } from "@/content/solutii/tipuri";
import { SECTOR_COMUN } from "@/content/solutii/comun";
import CardScena from "./CardScena";
import IconitaSolutii from "./IconitaSolutii";
import s from "./solutii.module.css";

export default function BandaSchimbare({ sector }: { sector: Sector }) {
  const sc = sector.schimbare;
  const [m0, m1, m2] = sector.momente.lista;
  return (
    <section className={s.banda}>
      <div className="container-site">
        <div className={s.coloana}>
          <h2 className={"t-h2-bloc " + s.titluBanda}>{SECTOR_COMUN.titluSchimbare}</h2>
          <p className={"t-punte " + s.punte}>{sc.punte}</p>
          <ul className={s.buline}>
            {sc.buline.map((b) => (
              <li key={b} className={s.bulina}>
                <IconitaSolutii nume="check" marime={16} contur={2} className={s.bifaBulina} />
                <span>{b}</span>
              </li>
            ))}
          </ul>
          <CardScena
            formatie={sc.formatie}
            samanta={sc.samanta}
            fisiere={[m0.fisier, m1.fisier, m2.fisier]}
            eticheta={sc.etichetaScena}
            texte={SECTOR_COMUN.stareScena}
          />
        </div>
      </div>
    </section>
  );
}
