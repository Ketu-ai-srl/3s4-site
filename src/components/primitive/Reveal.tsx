"use client";

// Aparitia la derulare, comuna (componente-globale.md §8.4): opacitate 0 + 10 px -> vizibil in
// 0,45 s ease-out, o singura data, cand marginea de sus a elementului urca la ~90% din fereastra.
//
// TREI REGULI care la referinta lipsesc sau sunt pe jumatate:
//   1. Fara JavaScript elementul e VIZIBIL. HTML-ul servit nu poarta nicio clasa de ascundere;
//      o pune abia componenta, dupa hidratare. Un cititor care nu executa JS vede tot textul.
//   2. Un element deja in fereastra la hidratare NU se ascunde: altfel ar clipi (vizibil in HTML,
//      ascuns la hidratare, vizibil din nou dupa 0,45 s).
//   3. La `prefers-reduced-motion: reduce` nu se ascunde nimic si nu se anima nimic.

import { useEffect, useRef, type ReactNode } from "react";

export type RevealProps = {
  children: ReactNode;
  as?: "div" | "section" | "figure" | "header" | "article" | "li";
  className?: string;
  id?: string;
};

/** Fractia din inaltimea ferestrei la care porneste aparitia (masurat 88-91%). */
export const PRAG_APARITIE = 0.9;

export default function Reveal({ children, as = "div", className, id }: RevealProps) {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!("IntersectionObserver" in window)) return;
    if (el.getBoundingClientRect().top < window.innerHeight * PRAG_APARITIE) return;

    el.classList.add("reveal-ascuns");
    const observator = new IntersectionObserver(
      (intrari) => {
        for (const intrare of intrari) {
          if (intrare.isIntersecting) {
            el.classList.remove("reveal-ascuns");
            el.classList.add("reveal-intrat");
            observator.disconnect();
          }
        }
      },
      { rootMargin: "0px 0px -" + Math.round((1 - PRAG_APARITIE) * 100) + "% 0px" },
    );
    observator.observe(el);
    return () => observator.disconnect();
  }, []);

  const Eticheta = as;
  return (
    <Eticheta ref={ref as never} className={className} id={id} data-reveal="">
      {children}
    </Eticheta>
  );
}
