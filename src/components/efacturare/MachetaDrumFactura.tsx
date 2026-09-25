// Macheta "drumul facturii" din eroul /e-facturare (e-facturare.md §1): factura, cele 5 canale
// cu pulsul in val (3 s, decalaj 0,6 s), nodul arhivei, 3 insigne. Componenta de server: pulsul e
// numai CSS si se opreste la miscare redusa. Date fictive, declarate ca exemplu (plan D9).

import { Archive } from "lucide-react";
import { MACHETA_DRUM } from "@/content/efacturare/pagina";
import s from "./efacturare.module.css";

function Sageata() {
  return (
    <svg className={s.drumSageata} width="30" height="14" viewBox="0 0 30 14" aria-hidden="true" focusable="false">
      <path d="M1 7 H27 M21 1.5 L27.5 7 L21 12.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function MachetaDrumFactura() {
  const m = MACHETA_DRUM;
  return (
    <figure className={s.drum}>
      <figcaption className="doar-cititor">{m.declaratie}</figcaption>
      <div className={s.drumCard} aria-hidden="true">
        <span className={s.eticheteExemplu}>Exemplu</span>
        <div className={s.drumFactura}>
          <span className={s.drumNumar}>{m.factura}</span>
          <span className={s.drumBara} />
          <span className={[s.drumBara, s.drumBaraScurta].join(" ")} />
          <span className={s.drumEtichete}>
            {m.etichete.map((e) => (
              <span key={e} className={s.drumEticheta}>
                {e}
              </span>
            ))}
          </span>
        </div>
        <Sageata />
        <div className={s.drumCanale}>
          {m.canale.map((c, i) => (
            <span key={c} className={s.drumCanal} style={{ animationDelay: i * 0.6 + "s" }}>
              {c}
            </span>
          ))}
        </div>
        <Sageata />
        <div className={s.drumArhiva}>
          <Archive width={24} height={24} strokeWidth={2} className={s.drumArhivaIconita} aria-hidden="true" />
          <span className={s.drumArhivaNume}>{m.arhiva}</span>
          <span className={s.drumAni}>{m.ani}</span>
        </div>
        <div className={s.drumInsigne}>
          {m.insigne.map((i) => (
            <span key={i} className={s.drumInsigna}>
              {i}
            </span>
          ))}
        </div>
      </div>
    </figure>
  );
}
