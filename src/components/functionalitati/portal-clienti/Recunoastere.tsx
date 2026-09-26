// S2 - recunoasterea (functionalitati__portal-clienti.md, S2): titlul luminos, paragraful si inboxul cu
// cinci mesaje in trepte (fereastra din sablon §5.1, 460 lat).
//
// MISCAREA (fisa S2, [derulare], in ambele sensuri), in CSS din `--p`: la referinta randul i la max(.15,
// min(1, 2 (p - 0,07 i))); la 3S aceeasi scara, stransa, intreaga la p 0,45 (abaterea de contrast, cu
// motivul, in `portal.module.css`); apoi aluneca spre dreapta cu max(0, 36 (p - 0,389 - 0,07 i)) px.

import type { CSSProperties } from "react";
import Fereastra from "@/components/cinema/Fereastra";
import SectiuneScena from "@/components/cinema/SectiuneScena";
import { RECUNOASTERE_PORTAL } from "@/content/functionalitati/portal-clienti";
import s from "./portal.module.css";

/** Latimile barelor-schelet de sub subiecte (fisa S2). */
const SCHELETE = [324, 258, 208, 283, 175] as const;

export default function Recunoastere() {
  const r = RECUNOASTERE_PORTAL;
  return (
    <SectiuneScena inaltime={65} inaltimeMobil={65} latime={760} nume="recunoastere">
      <h2 className={["t-h2-cinema", s.titluLuminos].join(" ")}>{r.titlu}</h2>
      <p className={s.paragrafRecunoastere}>{r.paragraf}</p>
      <Fereastra
        titlu={<span className={s.caleInbox}>{r.cale}</span>}
        dreapta={<span className={s.cipRosu}>{r.necitite}</span>}
        punct="patrat-email"
        declaratie={r.declaratie}
        className={s.inbox}
        baraClassName={s.baraInbox}
        nume="inbox"
      >
        <ul className={s.corpInbox}>
          {r.mesaje.map((m, i) => (
            <li key={m.subiect} className={s.mesaj} style={{ "--i": String(i) } as CSSProperties}>
              <span className={s.patratEmail} aria-hidden="true" />
              <span className={s.corpMesaj}>
                <span className={s.susMesaj}>
                  <span className={[s.subiect, m.urgent ? s.subiectUrgent : ""].filter(Boolean).join(" ")}>{m.subiect}</span>
                  {m.numar ? <span className={s.cipMesaj}>{m.numar}</span> : null}
                  <span className={s.ora}>{m.ora}</span>
                </span>
                <span className={s.schelet} style={{ width: SCHELETE[i] }} aria-hidden="true" />
              </span>
            </li>
          ))}
        </ul>
      </Fereastra>
    </SectiuneScena>
  );
}
