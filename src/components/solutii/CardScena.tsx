"use client";

// Cardul-scena din banda „ce se schimba” (solutii__sablon.md S3): gradientul, cipul de stare si
// butonul, peste gazda scenei 3D.
//
// STARILE, pe fisa:
//   - „haos”: cip rosu si buton; butonul exista NUMAI in starea asta si dispare la pornire;
//   - pornirea vine de la buton sau, dupa 4,6 s de bucla activa, de la scena insasi;
//   - „ordine”: cipul trece in verde cand ultima foaie a ajuns la locul ei (`aria-live`, deci
//     schimbarea se anunta cititorului de ecran);
//   - miscare redusa: direct „ordine”, fara buton (gazda deseneaza un singur cadru, formatia gata);
//   - esec WebGL: gazda se ascunde, iar CSS-ul ascunde tot cardul (`:has`), cip si buton cu tot.
//
// HTML-UL SERVIT are starea de la incarcare a referintei (cipul „haos” si butonul). Scena se incarca
// lenes, dupa hidratare: nici modulul ei, nici `three` nu stau pe drumul primei randari.

import dynamic from "next/dynamic";
import { ArrowRight } from "lucide-react";
import { useRef, useState } from "react";
import type { Formatie } from "@/content/solutii/tipuri";
import { useMiscareRedusa } from "./hooks";
import type { ComenziScena } from "./scena-hartii";
import s from "./scena.module.css";

const ScenaHartii = dynamic(() => import("./ScenaHartii"), { ssr: false, loading: () => null });

export type CardScenaProps = {
  formatie: Formatie;
  samanta: number;
  fisiere: [string, string, string];
  eticheta: string;
  texte: { haos: string; ordine: string; buton: string };
};

export default function CardScena({ formatie, samanta, fisiere, eticheta, texte }: CardScenaProps) {
  const redus = useMiscareRedusa();
  const [stare, setStare] = useState<"haos" | "pornit" | "ordine">("haos");
  const comenzi = useRef<ComenziScena | null>(null);
  if (comenzi.current === null) {
    comenzi.current = {
      ceruta: { valoare: false },
      laPornire: () => setStare((x) => (x === "haos" ? "pornit" : x)),
      laOrdine: () => setStare("ordine"),
    };
  }

  const ordine = redus || stare === "ordine";
  const cuButon = !redus && stare === "haos";

  const porneste = () => {
    if (comenzi.current) comenzi.current.ceruta.valoare = true;
    setStare((x) => (x === "haos" ? "pornit" : x));
  };

  return (
    <div className={s.card} data-scena-stare={ordine ? "ordine" : "haos"}>
      <ScenaHartii
        formatie={formatie}
        samanta={samanta}
        fisiere={fisiere}
        comenzi={comenzi.current}
        eticheta={eticheta}
        className={s.gazda}
      />
      <div className={s.cip} data-stare={ordine ? "ordine" : "haos"} role="status" aria-live="polite">
        <span className={s.punct} aria-hidden="true" />
        <span>{ordine ? texte.ordine : texte.haos}</span>
      </div>
      {cuButon ? (
        <button type="button" className={s.buton} onClick={porneste}>
          <span>{texte.buton}</span>
          <ArrowRight width={14} height={14} strokeWidth={2} aria-hidden focusable="false" />
        </button>
      ) : null}
    </div>
  );
}
