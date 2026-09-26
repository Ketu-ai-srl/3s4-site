// S1 - ziua de lucru pe teren (functionalitati__aplicatie-mobila.md, S1): titlul cu umbra, paragraful,
// contorul timpului dus pe acte si cardul zilei (bara de 8 segmente, orele, 3 statistici).
//
// MISCAREA (fisa S1, [derulare], in ambele sensuri), toata in CSS din `--p`:
//   - contorul: min(1, 2 (p - 0,025)), tranzitie 0,4 s;
//   - cardul: la referinta min(1, 2p - 0,1) si `translateY(max(0, 20 - 40p))`; aici intreg la p ~0,44;
//   - segmentul i creste de la stanga: `scaleX` si opacitate max(.2, min(1, 6 (p - s_i))). La referinta
//     s_i = 0,05 + 0,04 i, deci ultimul segment e intreg abia la p 0,5; aici s_i = 0,05 + 0,035 i, aceeasi
//     scara, intreaga la p ~0,46 (segmentele poarta text; regula din README-ul cadrului).
// Latimile segmentelor urmeaza duratele lor (flex-grow = minute), deci ziua se aduna corect la 610 minute.

import { Clock } from "lucide-react";
import type { CSSProperties } from "react";
import SectiuneScena from "@/components/cinema/SectiuneScena";
import { minuteDin, ZIUA } from "@/content/functionalitati/aplicatie-mobila";
import s from "./mobila.module.css";

/** Pragul segmentului i (abaterea din antet). */
export function pragSegment(i: number): number {
  return Math.round((0.05 + 0.035 * i) * 1000) / 1000;
}

const CLASA_FEL = { client: s.segClient, acte: s.segActe, pierdut: s.segPierdut } as const;
const CLASA_PUNCT = { client: s.punctClient, acte: s.punctActe, pierdut: s.punctPierdut } as const;
const CLASA_VALOARE = { client: s.valClient, acte: s.valActe, pierdut: s.valPierdut } as const;

export default function ZiuaTeren() {
  const z = ZIUA;
  return (
    <SectiuneScena inaltime={100} spatiere="scena" latime={720} nume="ziua">
      <h2 className={["t-h2-cinema", s.titluUmbra].join(" ")}>{z.titlu}</h2>
      <p className={["t-paragraf-cinema", s.paragraf].join(" ")}>{z.paragraf}</p>
      <p className={s.contor}>
        <span className={s.cutieCeas} aria-hidden="true">
          <Clock width={14} height={14} strokeWidth={2} />
        </span>
        <span className={s.contorEticheta}>{z.contorEticheta}</span>
        <span className={s.contorValoare}>{z.contorValoare}</span>
        <span className={s.lant}>{z.lant.join(" → ")}</span>
      </p>
      <figure className={s.cardZi} data-macheta="ziua-agentului">
        <div className={s.capZi}>
          <span className={s.titluZi}>
            <span className={s.punctAlbastru} aria-hidden="true" />
            {z.titluCard}
          </span>
          <span className={s.subtitluZi}>{z.subtitluCard}</span>
        </div>
        <ol className={s.bara}>
          {z.segmente.map((seg, i) => (
            <li
              key={seg.eticheta}
              className={[s.segment, CLASA_FEL[seg.fel]].join(" ")}
              style={{ flexGrow: minuteDin(seg.durata), "--s": String(pragSegment(i)) } as CSSProperties}
            >
              <span className={s.etichetaSeg}>{seg.eticheta}</span>
              <span className={s.durataSeg}>{seg.durata}</span>
            </li>
          ))}
        </ol>
        <div className={s.ore} aria-hidden="true">
          {z.ore.map((o) => (
            <span key={o}>{o}</span>
          ))}
        </div>
        <dl className={s.statistici}>
          {z.statistici.map((st) => (
            <div key={st.eticheta} className={[s.statistica, CLASA_PUNCT[st.fel]].join(" ")}>
              <dt className={s.etichetaStat}>{st.eticheta}</dt>
              <dd className={[s.valoareStat, CLASA_VALOARE[st.fel]].join(" ")}>{st.valoare}</dd>
            </div>
          ))}
        </dl>
        <figcaption className="doar-cititor">{z.declaratie}</figcaption>
      </figure>
    </SectiuneScena>
  );
}
