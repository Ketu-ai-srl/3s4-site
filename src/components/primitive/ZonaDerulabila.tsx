"use client";

// Zona derulabila a unui tabel (TabelDate). Sub 768 px tabelul poate fi mai lat decat coloana si se
// deruleaza orizontal in invelisul lui; o zona derulabila trebuie sa se poata atinge de la tastatura
// (WCAG 2.1.1, axe `scrollable-region-focusable`), deci are rol, nume si `tabindex=0`.
//
// HTML-ul servit are deja `tabindex=0`: fara JavaScript zona ramane accesibila de la tastatura. Dupa
// hidratare `tabindex` ramane numai cat timp zona chiar se deruleaza (latimea continutului o
// depaseste pe a ei), ca pe ecranele late tabelul sa nu fie o oprire in plus in ordinea de tabulare.

import { useEffect, useRef, type ReactNode } from "react";

export type ZonaDerulabilaProps = {
  className?: string;
  /** Numele zonei: id-ul elementului care o numeste (legenda tabelului sau randul de capete). */
  numitaDe?: string;
  /** Numele zonei, cand nu exista un element care sa o numeasca. */
  eticheta?: string;
  children: ReactNode;
};

export default function ZonaDerulabila({ className, numitaDe, eticheta, children }: ZonaDerulabilaProps) {
  const zona = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = zona.current;
    if (!el) return;
    const potriveste = () => {
      if (el.scrollWidth > el.clientWidth + 1) el.setAttribute("tabindex", "0");
      else el.removeAttribute("tabindex");
    };
    potriveste();
    if (typeof ResizeObserver === "undefined") return;
    const observator = new ResizeObserver(potriveste);
    observator.observe(el);
    const tabel = el.firstElementChild;
    if (tabel) observator.observe(tabel);
    return () => observator.disconnect();
  }, []);

  return (
    <div
      ref={zona}
      className={className}
      role="region"
      aria-labelledby={numitaDe}
      aria-label={numitaDe ? undefined : eticheta}
      tabIndex={0}
      data-zona-derulabila=""
    >
      {children}
    </div>
  );
}
