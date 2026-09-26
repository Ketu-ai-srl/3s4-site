// S5 - teren -> birou (functionalitati__aplicatie-mobila.md, S5): titlul pe doua randuri, paragraful si
// perechea de carduri (grila 380 / 28 / 380), cu un punct `albastru` care coboara pe linia dintre ele
// (`2,4 s`, pe orizontala la 390).
//
// MISCAREA (fisa S5, in ambele sensuri), in CSS din `--p`: cardul din teren min(1, 2p), cel din birou la
// referinta min(1, 2 (p - 0,1)); aici intreg la p 0,45 (cardul poarta text), tranzitie 0,5 s.

import { Monitor, Smartphone } from "lucide-react";
import SectiuneScena from "@/components/cinema/SectiuneScena";
import { SINCRONIZARE } from "@/content/functionalitati/aplicatie-mobila";
import s from "./mobila.module.css";

export default function Sincronizare() {
  const z = SINCRONIZARE;
  return (
    <SectiuneScena inaltime={90} spatiere="scena" latime={820} nume="sincronizare">
      <h2 className={["t-h2-cinema", s.titluSectiune, s.titluLat].join(" ")}>{z.titlu}</h2>
      <p className={["t-paragraf-cinema", s.paragraf].join(" ")}>{z.paragraf}</p>
      <figure className={s.pereche} data-macheta="teren-birou">
        <div className={[s.cardSync, s.cardTeren].join(" ")}>
          <div className={s.capSync}>
            <span className={[s.pastilaOra, s.oraTeren].join(" ")}>{z.teren.ora}</span>
            <span className={s.cutieMare} aria-hidden="true">
              <Smartphone width={32} height={32} strokeWidth={1.5} />
            </span>
          </div>
          <p className={s.actiune}>{z.teren.actiune}</p>
        </div>
        <div className={s.coloanaSync} aria-hidden="true">
          <span className={s.punctSync} />
        </div>
        <div className={[s.cardSync, s.cardBirou].join(" ")}>
          <div className={s.capSync}>
            <span className={[s.pastilaOra, s.oraBirou].join(" ")}>{z.birou.ora}</span>
            <span className={s.cutieMare} aria-hidden="true">
              <Monitor width={32} height={32} strokeWidth={1.5} />
            </span>
          </div>
          <p className={s.docSync}>
            {z.birou.document} <span className={s.exemplu}>{z.exemplu}</span>
          </p>
          <p className={s.marcaSync}>{z.birou.marca}</p>
          <p className={s.actiune}>{z.birou.actiune}</p>
        </div>
        <figcaption className="doar-cititor">{z.declaratie}</figcaption>
      </figure>
    </SectiuneScena>
  );
}
