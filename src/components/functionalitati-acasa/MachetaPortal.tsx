"use client";

// Macheta pasului 2: portalul clientilor, cu 3 persoane si dosarele pe care le vede fiecare
// (fisa §6).
//
// ROTATIA: la 400 ms dupa pornirea ceasului incepe, iar la fiecare 4000 ms trece la persoana
// urmatoare (prima schimbare la 4400 ms). La schimbare, stilul butonului trece in 200 ms, numele si
// numerele dosarelor se schimba pe loc, doar opacitatea randurilor trece 0,4 <-> 1 in 300 ms.
// Clicul (sau Enter / Space) pe o persoana o alege si opreste rotatia 10 s; apoi rotatia reia la
// urmatoarea bataie. Cat focusul de tastatura e in macheta, rotatia tace (la referinta nu tacea:
// butonul focalizat isi pierdea selectia sub degetele omului).
//
// Butoanele sunt comutatoare (`aria-pressed`), unul singur apasat; panoul le spune ce arata.

import { useEffect, useId, useRef, useState } from "react";
import { Folder, Lock, Users, Zap } from "lucide-react";
import { MACHETA_PORTAL } from "@/content/acasa-functionalitati";
import { areMiscareRedusa, useBataie, useVizibil } from "./ceas";
import { useEstompare } from "./estompare";
import type { MachetaProps } from "./MachetaCautare";
import s from "./Machete.module.css";

/** Pornirea rotatiei si perioada ei (fisa §6). */
export const INTARZIERE_PORTAL = 400;
export const PERIOADA_PERSOANE = 4000;
/** Cat tace rotatia dupa o alegere (fisa §6, masurat: 10 s). */
export const PAUZA_DUPA_CLIC = 10_000;

export default function MachetaPortal({ activ, estompat = false, inert = false, className }: MachetaProps) {
  const m = MACHETA_PORTAL;
  const radacina = useRef<HTMLElement>(null);
  const vizibil = useVizibil(radacina);
  const idPanou = useId();

  const [ales, setAles] = useState(0);
  const [cuMiscare, setCuMiscare] = useState(false);
  const [focusTastatura, setFocusTastatura] = useState(false);
  const pauzaPana = useRef(0);

  useEffect(() => {
    if (!areMiscareRedusa()) setCuMiscare(true);
  }, []);

  useBataie(activ && vizibil && cuMiscare, INTARZIERE_PORTAL + PERIOADA_PERSOANE, PERIOADA_PERSOANE, () => {
    if (focusTastatura || Date.now() < pauzaPana.current) return;
    setAles((a) => (a + 1) % m.persoane.length);
  });

  // Estomparea de jos urmeaza persoana aleasa: numele lung impinge lista in jos (`estompare.ts`).
  useEstompare(radacina, estompat, ales);

  const persoana = m.persoane[ales];

  return (
    <figure
      ref={radacina}
      className={[s.macheta, s.portal, estompat ? s.estompat : "", className ?? ""].filter(Boolean).join(" ")}
      inert={inert}
      onFocus={(e) => {
        if (e.target instanceof HTMLElement && e.target.matches(":focus-visible")) setFocusTastatura(true);
      }}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setFocusTastatura(false);
      }}
    >
      <figcaption className="doar-cititor">{m.declaratie}</figcaption>
      <div className={s.etichetaMacheta}>
        <Users width={14} height={14} strokeWidth={1.5} aria-hidden="true" />
        <span>{m.eticheta}</span>
      </div>
      <div className={s.taburi} role="group" aria-label={m.grup}>
        {m.persoane.map((p, k) => (
          <button
            key={p.nume}
            type="button"
            className={s.tab}
            aria-pressed={ales === k}
            aria-controls={idPanou}
            onClick={() => {
              setAles(k);
              pauzaPana.current = Date.now() + PAUZA_DUPA_CLIC;
            }}
          >
            <span className={s.avatar} data-culoare={p.culoare} aria-hidden="true">
              {p.initiale}
            </span>
            <span className={s.tInfo}>
              <span className={s.tNume}>{p.nume}</span>
              <span className={s.tRol}>{p.rol}</span>
            </span>
          </button>
        ))}
      </div>
      <div className={s.panou} id={idPanou}>
        <div className={s.vizibilPentru}>
          <span>
            {m.vizibilPentru} <strong>{persoana.nume}</strong>
          </span>
          <span className={s.cip}>
            <Zap width={9} height={9} fill="currentColor" stroke="none" aria-hidden="true" />
            {m.cip}
          </span>
        </div>
        <ul className={s.foldere}>
          {persoana.foldere.map((f, k) => {
            const permis = f.numar !== null;
            return (
              <li
                key={k}
                className={s.folder}
                data-interzis={permis ? undefined : ""}
                aria-disabled={permis ? undefined : true}
              >
                {permis ? (
                  <Folder width={16} height={16} fill="#5b8def" stroke="none" aria-hidden="true" />
                ) : (
                  <Lock width={14} height={14} strokeWidth={2} color="#dc2626" aria-hidden="true" />
                )}
                <span className={s.fNume}>{f.nume}</span>
                {permis ? (
                  <span className={s.fNumar}>({f.numar})</span>
                ) : (
                  <span className="doar-cititor">, {m.faraAcces}</span>
                )}
              </li>
            );
          })}
        </ul>
        <div className={s.subsolPanou}>
          <span className={s.subsolStanga}>{m.subsol.stanga}</span>
          <span className={s.subsolDreapta}>{m.subsol.dreapta}</span>
        </div>
      </div>
    </figure>
  );
}
