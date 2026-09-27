"use client";

// Diagrama cu comutator (comparatie-stocare.md §4): documentele, nodul 3S (arhiva, cu iconita de
// arhiva) si locul fisierelor, legate prin doi conectori cu puncte care curg spre dreapta (oprite la
// `prefers-reduced-motion`). Comutatorul segmentat schimba DOAR nodul stocarii, instant; celelalte
// noduri si nota raman pe loc, cum masoara fisa.
//
// Comutatorul e un grup radio complet (WAI-ARIA APG, "Radio Group"): un singur buton in ordinea
// Tab (cel ales), sagetile si Home / End muta si aleg. La referinta ambele butoane erau in ordinea
// Tab si sagetile nu faceau nimic; diferenta nu se vede, se simte doar la tastatura.
//
// Adresa bucketului e un exemplu, declarat pentru cititoarele de ecran (plan D9).

import { Archive, Database, FileText } from "lucide-react";
import { useRef, useState, type KeyboardEvent } from "react";
import type { OptiuneStocare } from "@/content/comparatii";
import s from "./comparatii.module.css";

export type DateComutator = {
  titlu: string;
  eticheta: string;
  declaratie: string;
  documente: string;
  nucleu: { nume: string; eticheta: string; jetoane: string[] };
  optiuni: OptiuneStocare[];
  nota: string;
};

function Conector() {
  return (
    <svg className={s.conector} viewBox="0 0 80 12" preserveAspectRatio="none" aria-hidden="true" focusable="false">
      <path className={s.conectorBaza} d="M0 6 L78 6" fill="none" strokeWidth="1.5" />
      <path
        className={s.conectorPuncte}
        d="M0 6 L78 6"
        fill="none"
        strokeWidth="1.5"
        strokeLinecap="round"
        pathLength={1}
        strokeDasharray="0.06 0.1"
      />
    </svg>
  );
}

export default function DiagramaComutator({ date }: { date: DateComutator }) {
  const [ales, setAles] = useState<OptiuneStocare["cod"]>(date.optiuni[0].cod);
  const butoane = useRef<(HTMLButtonElement | null)[]>([]);
  const optiune = date.optiuni.find((o) => o.cod === ales) ?? date.optiuni[0];

  function laTasta(e: KeyboardEvent<HTMLButtonElement>, index: number) {
    const n = date.optiuni.length;
    let tinta = -1;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") tinta = (index + 1) % n;
    else if (e.key === "ArrowLeft" || e.key === "ArrowUp") tinta = (index - 1 + n) % n;
    else if (e.key === "Home") tinta = 0;
    else if (e.key === "End") tinta = n - 1;
    if (tinta < 0) return;
    e.preventDefault();
    setAles(date.optiuni[tinta].cod);
    butoane.current[tinta]?.focus();
  }

  return (
    <div className={s.comutatorCard}>
      <div className={s.comutatorCap}>
        <h3 className={s.comutatorTitlu}>{date.titlu}</h3>
        <div role="radiogroup" aria-label={date.eticheta} className={s.segmente}>
          {date.optiuni.map((o, i) => (
            <button
              key={o.cod}
              ref={(el) => {
                butoane.current[i] = el;
              }}
              type="button"
              role="radio"
              aria-checked={o.cod === ales}
              tabIndex={o.cod === ales ? 0 : -1}
              className={s.segment}
              onClick={() => setAles(o.cod)}
              onKeyDown={(e) => laTasta(e, i)}
            >
              {o.buton}
            </button>
          ))}
        </div>
      </div>
      <p className="doar-cititor">{date.declaratie}</p>
      <div className={s.flux}>
        <div className={s.nod}>
          <FileText size={18} strokeWidth={1.3} className={s.nodIconita} aria-hidden="true" focusable="false" />
          <span className={s.nodEticheta}>{date.documente}</span>
        </div>
        <Conector />
        <div className={s.nod + " " + s.nodArhiva}>
          <span className={s.arhivaCap}>
            <Archive size={17} strokeWidth={1.3} className={s.arhivaIconita} aria-hidden="true" focusable="false" />
            <span className={s.nodEticheta}>{date.nucleu.nume}</span>
            <span className={s.arhivaEticheta}>{date.nucleu.eticheta}</span>
          </span>
          <ul className={s.arhivaJetoane}>
            {date.nucleu.jetoane.map((j) => (
              <li key={j} className={s.arhivaJeton}>
                {j}
              </li>
            ))}
          </ul>
        </div>
        <Conector />
        <div className={s.nod} aria-live="polite">
          <Database size={18} strokeWidth={1.6} className={s.nodIconita} aria-hidden="true" focusable="false" />
          <span className={s.nodEticheta}>{optiune.titlu}</span>
          <span className={optiune.cod === "s3" ? s.adresa + " " + s.adresaClient : s.adresa}>{optiune.adresa}</span>
        </div>
      </div>
      <p className={s.comutatorNota}>{date.nota}</p>
    </div>
  );
}
