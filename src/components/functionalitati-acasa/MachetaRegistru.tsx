"use client";

// Macheta pasului 3: registrul arhivei, cu 3 acte si 4 verificari bifate (fisa §7).
//
// ANIMATIA: verificarile apar pe rand, cate una la 500 ms, prima la 900 ms dupa pornirea ceasului
// (400 ms intarziere + primul pas). Fiecare urca 6 px si apare din transparent in 250 ms ease-out
// cubic. Randurile se INSEREAZA, nu se ascund: pana la primul, lista e doar cutia ei, inalta de 2 px,
// si macheta creste pe masura ce apar (fisa §7, "logica").
//
// La referinta ceasul pornea cand cardul intra in ecran, deci la desktop secventa se termina inainte
// ca omul sa ajunga la pasul 3 (fisa §14.3). Aici porneste la activarea pasului (pe ecranul culcat,
// unde nu exista pas activ, la intrarea in ecran); daca pasul pleaca in mijlocul secventei, ea se
// opreste si continua la revenire. O data completa, lista ramane completa.
//
// STAREA STATICA (HTML fara JavaScript, miscare redusa): toate cele 4 verificari, starea finala.

import { useEffect, useRef, useState } from "react";
import { BookOpen, Check, Clock, FileText, Shield, Tag, Zap, type LucideIcon } from "lucide-react";
import { MACHETA_REGISTRU, type IconitaVerificare, ETICHETA_EXEMPLU } from "@/content/acasa-functionalitati";
import { areMiscareRedusa, useBataie, useVizibil } from "./ceas";
import { useEstompare } from "./estompare";
import type { MachetaProps } from "./MachetaCautare";
import s from "./Machete.module.css";

/** Prima verificare la 900 ms, apoi cate una la 500 ms (fisa §7). */
export const INTARZIERE_VERIFICARI = 900;
export const PERIOADA_VERIFICARI = 500;

const ICONITE: Record<IconitaVerificare, LucideIcon> = {
  tag: Tag,
  clock: Clock,
  "book-open": BookOpen,
  shield: Shield,
};

export default function MachetaRegistru({ activ, estompat = false, inert = false, className }: MachetaProps) {
  const m = MACHETA_REGISTRU;
  const radacina = useRef<HTMLElement>(null);
  const vizibil = useVizibil(radacina);
  const total = m.verificari.length;

  const [aparute, setAparute] = useState<number>(total);
  const [cuMiscare, setCuMiscare] = useState(false);

  useEffect(() => {
    if (areMiscareRedusa()) return;
    setCuMiscare(true);
    setAparute(0);
  }, []);

  useBataie(activ && vizibil && cuMiscare && aparute < total, INTARZIERE_VERIFICARI, PERIOADA_VERIFICARI, () => {
    setAparute((n) => Math.min(total, n + 1));
  });

  // Estomparea de jos urmeaza lista care creste (`estompare.ts`).
  useEstompare(radacina, estompat, aparute);

  return (
    <figure
      ref={radacina}
      className={[s.macheta, s.registru, estompat ? s.estompat : "", className ?? ""].filter(Boolean).join(" ")}
      inert={inert}
      data-verificari={aparute}
    >
      <figcaption className="doar-cititor">{m.declaratie}</figcaption>
      <div className={s.capRegistru}>
        <span className={s.etichetaMacheta}>
          <FileText width={13} height={13} strokeWidth={1.6} aria-hidden="true" />
          <span>{m.eticheta}</span>
          <span className={s.exemplu} aria-hidden="true">
            {ETICHETA_EXEMPLU}
          </span>
        </span>
        <span className={s.insignaCap}>
          <Zap width={9} height={9} fill="currentColor" stroke="none" aria-hidden="true" />
          {m.insigna}
        </span>
      </div>
      <div className={s.tabel} role="table" aria-label={m.eticheta}>
        <div className={s.tRandCap} role="row">
          {m.coloane.map((c) => (
            <span key={c} role="columnheader">
              {c}
            </span>
          ))}
        </div>
        {m.randuri.map((r) => (
          <div key={r.nr} className={s.tRand} role="row">
            <span role="cell" className={s.nr}>
              {r.nr}
            </span>
            <span role="cell" className={s.doc}>
              {r.fisier}
            </span>
            <span role="cell">
              <span className={s.tip} data-tip={r.tip.cod}>
                {r.tip.text}
              </span>
            </span>
            <span role="cell" className={s.termen}>
              {r.termen}
            </span>
            <span role="cell" className={s.stareCelula}>
              <Check width={13} height={13} strokeWidth={2.4} aria-hidden="true" />
              <span className="doar-cititor">{m.stare}</span>
            </span>
          </div>
        ))}
      </div>
      <ul className={s.verificari}>
        {m.verificari.slice(0, aparute).map((v) => {
          const Iconita = ICONITE[v.iconita];
          return (
            <li key={v.text} className={s.verificare}>
              <span className={s.vIconita} aria-hidden="true">
                <Iconita width={13} height={13} strokeWidth={2} />
              </span>
              <span className={s.vText}>{v.text}</span>
              <Check width={13} height={13} strokeWidth={2.4} className={s.vBifa} aria-hidden="true" />
            </li>
          );
        })}
      </ul>
    </figure>
  );
}
