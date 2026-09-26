// S2 - pretul tacerii (functionalitati__automatizari-ai.md, S2): cronologia unei saptamani fara reguli, in
// care acelasi act e inregistrat si platit de doua ori - cinci zile, fiecare cu costul ei pe cinci trepte de gravitate, si bilantul.
//
// MISCAREA (fisa S2, [derulare], in ambele sensuri), toata in CSS, din `--p`: randul i iese din
// penumbra la max(0,15; min(1; 2(p - 0,06 i))), coborat cu max(0, 20 + 3,6 i - 60 p) px; bilantul
// la min(1, max(0, 2(p - 0,475))), coborat cu max(0, 30 - 50 p) px. Tranzitii de 0,5 s. Asa la referinta;
// la 3S randurile si bilantul sunt intregi la p 0,45 (abaterea de contrast, in `automatizari.module.css`).

import { Banknote, Clock, Copy, FileUp, TriangleAlert, type LucideIcon } from "lucide-react";
import type { CSSProperties } from "react";
import SectiuneScena from "@/components/cinema/SectiuneScena";
import { PRET, type IconitaEveniment } from "@/content/functionalitati/automatizari-ai";
import s from "./automatizari.module.css";

const ICONITE_EVENIMENT: Record<IconitaEveniment, LucideIcon> = {
  incarcare: FileUp,
  dublura: Copy,
  ceas: Clock,
  plata: Banknote,
  avertizare: TriangleAlert,
};

export default function Cronologie() {
  const ultim = PRET.evenimente.length - 1;
  return (
    <SectiuneScena inaltime={100} spatiere="scena" latime={720} nume="cost">
      <h2 className={["t-h2-cinema", s.titluSectiune].join(" ")}>{PRET.titlu}</h2>
      <p className={["t-paragraf-cinema", s.paragrafCost].join(" ")}>{PRET.paragraf}</p>
      <figure className={s.figura} data-macheta="cronologie">
        <div className={s.cronologie}>
          <ol className={s.listaEvenimente}>
            {PRET.evenimente.map((e, i) => {
              const Iconita = ICONITE_EVENIMENT[e.iconita];
              return (
                <li key={e.zi} className={s.eveniment} style={{ "--i": String(i) } as CSSProperties}>
                  <span className={s.ziEveniment}>
                    <span aria-hidden="true">{e.zi}</span>
                    <span className="doar-cititor">{"Ziua " + e.zi.slice(1) + ":"}</span>
                  </span>
                  <span className={s.cutieEveniment} aria-hidden="true">
                    <Iconita width={18} height={18} strokeWidth={1.75} focusable="false" />
                  </span>
                  <span className={[s.textEveniment, i === ultim ? s.textUltim : ""].filter(Boolean).join(" ")}>{e.text}</span>
                  <span className={[s.cost, s["cost-" + e.gravitate]].join(" ")}>{e.cost}</span>
                </li>
              );
            })}
          </ol>
          <p className={s.total}>
            <span className={[s.cost, s["cost-urgenta"]].join(" ")}>{PRET.totalEticheta}</span>
            <span className={s.valoareTotal}>{PRET.totalValoare}</span>
          </p>
        </div>
        <figcaption className="doar-cititor">{PRET.declaratie}</figcaption>
      </figure>
    </SectiuneScena>
  );
}
