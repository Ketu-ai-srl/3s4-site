"use client";

// Tranzitia de vedere la navigarea client (juridic__sablon.md §9): cross-fade de 160 ms pe radacina,
// grupul 250 ms (duratele sunt in `globals.css`). Comportament global al site-ului.
//
// CUM: un ascultator de clic in faza de CAPTURA, pe document, prinde clicul pe o legatura interna
// inaintea componentei `Link`, il opreste si face aceeasi navigare prin `router.push`, dar inauntrul
// lui `document.startViewTransition`. Promisiunea tranzitiei se rezolva cand calea s-a schimbat
// (efectul pe `usePathname`), cu o plasa de o secunda ca navigarea sa nu ramana niciodata agatata.
//
// NU porneste: la `prefers-reduced-motion: reduce`, in navigatoarele fara API, pe clicuri cu
// modificatori sau cu alt buton decat cel principal, pe legaturi externe, `target` sau `download`,
// si pe legaturi catre aceeasi pagina (ancorele isi fac derularea obisnuita).

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

type DocumentCuTranzitie = Document & {
  startViewTransition?: (actualizare: () => Promise<void>) => unknown;
};

export default function TranzitieVedere() {
  const router = useRouter();
  const cale = usePathname();
  const rezolva = useRef<(() => void) | null>(null);

  useEffect(() => {
    rezolva.current?.();
    rezolva.current = null;
  }, [cale]);

  useEffect(() => {
    const laClic = (e: MouseEvent) => {
      const doc = document as DocumentCuTranzitie;
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      if (typeof doc.startViewTransition !== "function") return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const tinta = e.target instanceof Element ? e.target.closest("a") : null;
      if (!tinta || !tinta.href) return;
      if ((tinta.target && tinta.target !== "_self") || tinta.hasAttribute("download")) return;
      const adresa = new URL(tinta.href, window.location.href);
      if (adresa.origin !== window.location.origin) return;
      if (adresa.pathname === window.location.pathname) return;

      e.preventDefault();
      doc.startViewTransition(
        () =>
          new Promise<void>((gata) => {
            rezolva.current = gata;
            router.push(adresa.pathname + adresa.search + adresa.hash);
            window.setTimeout(gata, 1000);
          }),
      );
    };
    document.addEventListener("click", laClic, true);
    return () => document.removeEventListener("click", laClic, true);
  }, [router]);

  return null;
}
