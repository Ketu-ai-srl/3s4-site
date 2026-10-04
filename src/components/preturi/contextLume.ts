"use client";

// Contextul lumii preturilor: actiunea "inapoi", pusa de lume si citita de butonul din linia de baza.
// Sta intr-un modul propriu, fara niciun continut, ca lumea si butonul oricarei editii sa foloseasca
// ACELASI context: daca ar sta in invelitoarea RO a lumii, butonul altei editii ar citi un context pe
// care nu-l pune nimeni.

import { createContext, useContext, type MouseEvent as EvenimentReact } from "react";

export type ContextLumii = { inapoi: (e: EvenimentReact<HTMLAnchorElement>) => void };

export const ContextLume = createContext<ContextLumii | null>(null);

/** Actiunea "inapoi" a lumii, pentru legatura din linia de baza. */
export function useInapoi(): ContextLumii["inapoi"] {
  const c = useContext(ContextLume);
  return c ? c.inapoi : () => undefined;
}

/** Un clic pe care il lasam navigatorului: alt buton decat cel principal sau cu modificatori. */
export function clicModificat(e: { button: number; metaKey: boolean; ctrlKey: boolean; shiftKey: boolean; altKey: boolean }): boolean {
  return e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey;
}
