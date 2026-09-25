// Diagrama celor trei locuri de stocare (comparatie-drive.md §3): trei carduri in stanga, trei
// curbe Bezier care se strang spre nodul 3S din dreapta. Traseele sunt geometrie simpla, desenata
// dupa masuratori (88 x 190). La 390 curbele dispar si le ia locul o linie verticala de 28 px.

import { Cloud, Database, FileText, Server } from "lucide-react";
import s from "./comparatii.module.css";

export type OptiuneConector = {
  iconita: "server" | "cloud" | "database";
  titlu: string;
  sub: string;
};

export type DiagramaConectoriProps = {
  optiuni: OptiuneConector[];
  nod: string;
  /** Numele accesibil al grupului. */
  eticheta: string;
};

const ICONITE = { server: Server, cloud: Cloud, database: Database } as const;

const TRASEE = ["M0 26 C 48 26, 40 95, 88 95", "M0 95 L 88 95", "M0 164 C 48 164, 40 95, 88 95"];

export default function DiagramaConectori({ optiuni, nod, eticheta }: DiagramaConectoriProps) {
  return (
    <div className={s.conectori} role="group" aria-label={eticheta}>
      <ul className={s.conectoriLista}>
        {optiuni.map((o) => {
          const Iconita = ICONITE[o.iconita];
          return (
            <li key={o.titlu} className={s.conectoriCard}>
              <Iconita size={18} strokeWidth={1.5} className={s.conectoriIconita} aria-hidden="true" focusable="false" />
              <span className={s.conectoriText}>
                <span className={s.conectoriTitlu}>{o.titlu}</span>
                <span className={s.conectoriSub}>{o.sub}</span>
              </span>
            </li>
          );
        })}
      </ul>
      <svg
        className={s.conectoriLinii}
        width="88"
        height="190"
        viewBox="0 0 88 190"
        preserveAspectRatio="none"
        aria-hidden="true"
        focusable="false"
      >
        {TRASEE.map((d) => (
          <path key={d} d={d} fill="none" stroke="currentColor" strokeWidth="1.5" />
        ))}
      </svg>
      <span className={s.conectoriLiniaMica} aria-hidden="true" />
      <div className={s.conectoriNod}>
        <FileText size={18} strokeWidth={1.5} className={s.conectoriNodIconita} aria-hidden="true" focusable="false" />
        <span>{nod}</span>
      </div>
    </div>
  );
}
