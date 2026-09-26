// Capul de sectiune (start, platforma, formularul de contact): eticheta 12/600 albastru (mb 12),
// h2 40/600 (30 sub 768) centrat, subtitlu 18/28,8 cerneala-2 max 600. Margine jos 40-48.

import type { ReactNode } from "react";
import s from "./primitive.module.css";

export type CapSectiuneProps = {
  titlu: ReactNode;
  eticheta?: string;
  subtitlu?: ReactNode;
  /** Distanta pana la continutul de dedesubt, in px (40-48 la referinta). */
  margineJos?: number;
  id?: string;
  className?: string;
};

export default function CapSectiune({ titlu, eticheta, subtitlu, margineJos = 48, id, className }: CapSectiuneProps) {
  return (
    <div className={[s.capSectiune, className ?? ""].filter(Boolean).join(" ")} style={{ marginBottom: margineJos }}>
      {eticheta ? <span className={"t-eticheta-sectiune " + s.capEticheta}>{eticheta}</span> : null}
      <h2 id={id} className="t-h2-sectiune">
        {titlu}
      </h2>
      {subtitlu ? <p className={"t-subtitlu-sectiune " + s.capSubtitlu}>{subtitlu}</p> : null}
    </div>
  );
}
