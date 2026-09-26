"use client";

// SectiunePromo (COMPONENTE.md §4.4, "SectiuneCinemaPromo"): o sectiune de 80svh (primul ecran 100svh),
// flex centrata, cu un interior de 780 px (700 pe pagina de scanare), a carui intrare si iesire sunt legate
// de derulare, fara netezire (formulele: `miscare-promo.ts`).
//
// Cum se leaga: sectiunea se inregistreaza la ceasul de derulare al cadrului cinema (`urmaresteProgres`,
// un singur ascultator pe pagina), cu o formula proprie: faza bruta impartita la 4, ca sa incapa in
// intervalul [0, 1] pe care il intoarce ceasul. La fiecare schimbare se scriu pe interior opacitatea,
// transformul, estomparea si variabila `--cascada`, din care CSS-ul calculeaza opacitatea si deplasarea
// fiecarui copil (primii 4, `SectiunePromo.module.css`). Nimic nu se re-randeaza din React la derulare.
//
// STAREA STATICA: pe server, fara JavaScript si la `prefers-reduced-motion: reduce` interiorul nu are
// niciun stil scris, deci totul e vizibil, la scara 1 (HTML-ul servit e forma finala, G-AI-01). Daca
// preferinta se schimba in timpul vizitei, stilurile scrise se sterg.

import { useEffect, useRef, type ReactNode } from "react";
import { urmaresteProgres } from "@/components/cinema/ceas-derulare";
import { useMiscarePermisa } from "@/components/cinema/miscare";
import { fazaSectiune, MAX_FAZA, stareErou, stareSectiune } from "./miscare-promo";
import s from "./SectiunePromo.module.css";

export type SectiunePromoProps = {
  children: ReactNode;
  /** Numele sectiunii, pentru probe (`data-sectiune`). */
  nume: string;
  /** Primul ecran: 100svh, se stinge si se micsoreaza cand pagina coboara. */
  primul?: boolean;
  /** Ultima sectiune a paginii: isi asigura singura varful (90svh, spatiul in plus jos). */
  ultimul?: boolean;
  /** `promo` (padding 48 / 32, interior 780) sau `scanare` (64 / 32, interior 700). */
  varianta?: "promo" | "scanare";
  /** Eticheta accesibila a sectiunii. */
  eticheta?: string;
  className?: string;
  interiorClassName?: string;
};

function curata(el: HTMLElement): void {
  el.style.removeProperty("opacity");
  el.style.removeProperty("transform");
  el.style.removeProperty("filter");
  el.style.removeProperty("--cascada");
}

export default function SectiunePromo({
  children,
  nume,
  primul = false,
  ultimul = false,
  varianta = "promo",
  eticheta,
  className,
  interiorClassName,
}: SectiunePromoProps) {
  const sectiune = useRef<HTMLElement>(null);
  const interior = useRef<HTMLDivElement>(null);
  const permisa = useMiscarePermisa();

  useEffect(() => {
    const sec = sectiune.current;
    const el = interior.current;
    if (!sec || !el || !permisa) return;

    if (primul) {
      const opreste = urmaresteProgres(
        sec,
        (v) => {
          const vh = window.innerHeight;
          const st = stareErou(v * 0.5 * vh, vh);
          el.style.opacity = st.opacitate.toFixed(4);
          el.style.transform = "scale(" + st.scara.toFixed(4) + ")";
        },
        // y = -top (primul ecran sta la varful paginii); impartit la 0,5 vh, taiat la [0, 1].
        (top, _h, vh) => (vh > 0 ? -top / (0.5 * vh) : 0),
      );
      return () => {
        opreste();
        curata(el);
      };
    }

    const opreste = urmaresteProgres(
      sec,
      (v) => {
        const st = stareSectiune(v * MAX_FAZA);
        el.style.opacity = st.opacitate.toFixed(4);
        el.style.transform = "translate3d(0, " + st.y.toFixed(2) + "px, 0) scale(" + st.scara.toFixed(4) + ")";
        el.style.filter = st.blur > 0.01 ? "blur(" + st.blur.toFixed(2) + "px)" : "";
        el.style.setProperty("--cascada", st.cascada.toFixed(4));
      },
      (top, _h, vh) => fazaSectiune(top, vh) / MAX_FAZA,
    );
    return () => {
      opreste();
      curata(el);
    };
  }, [permisa, primul]);

  const clase = [s.sectiune, primul ? s.primul : "", ultimul ? s.ultimul : "", varianta === "scanare" ? s.scanare : "", className].filter(Boolean).join(" ");
  const claseInterior = [s.interior, primul ? "" : s.cascada, interiorClassName].filter(Boolean).join(" ");
  return (
    <section ref={sectiune} className={clase} data-sectiune={nume} aria-label={eticheta}>
      <div ref={interior} className={claseInterior} data-interior-promo="">
        {children}
      </div>
    </section>
  );
}
