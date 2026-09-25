// Ceasul de derulare al paginilor cinema: UN singur ascultator de derulare si de redimensionare
// pentru toate sectiunile, care citeste pozitiile intr-un cadru de animatie si anunta numai
// schimbarile. La referinta fiecare sectiune isi recalcula progresul pe fiecare cadru; aici calculul
// ruleaza doar cand pagina se misca, cu acelasi rezultat.
//
// Nimic de aici nu ruleaza pe server: modulul se importa numai din efecte ale componentelor client.

import { progresSectiune, rotunjesteProgres } from "./progres";

/** Cum se trece de la cutia elementului la o valoare (implicit: progresul sectiunii). */
export type Formula = (top: number, inaltime: number, vh: number) => number;

type Inregistrare = {
  el: Element;
  formula: Formula;
  laSchimbare: (valoare: number) => void;
  ultima: number;
};

const inregistrate = new Set<Inregistrare>();
let cadruCerut = 0;

function calculeaza(): void {
  cadruCerut = 0;
  const vh = window.innerHeight;
  for (const r of inregistrate) {
    const cutie = r.el.getBoundingClientRect();
    const valoare = rotunjesteProgres(r.formula(cutie.top, cutie.height, vh));
    if (valoare !== r.ultima) {
      r.ultima = valoare;
      r.laSchimbare(valoare);
    }
  }
}

function programeaza(): void {
  if (!cadruCerut) cadruCerut = requestAnimationFrame(calculeaza);
}

/**
 * Urmareste elementul si cheama `laSchimbare` cu valoarea noua (0..1, rotunjita la 4 zecimale) de
 * fiecare data cand derularea sau marimea ferestrei o schimba. Prima valoare vine in cadrul urmator.
 * Intoarce functia care opreste urmarirea.
 */
export function urmaresteProgres(el: Element, laSchimbare: (valoare: number) => void, formula: Formula = progresSectiune): () => void {
  const r: Inregistrare = { el, formula, laSchimbare, ultima: Number.NaN };
  if (inregistrate.size === 0) {
    window.addEventListener("scroll", programeaza, { passive: true });
    window.addEventListener("resize", programeaza, { passive: true });
  }
  inregistrate.add(r);
  programeaza();

  // Inaltimea unei sectiuni se poate schimba fara derulare (fonturile incarcate tarziu, o macheta
  // care se deschide): progresul se reface si atunci.
  let observator: ResizeObserver | null = null;
  if ("ResizeObserver" in window) {
    observator = new ResizeObserver(programeaza);
    observator.observe(el);
  }

  return () => {
    observator?.disconnect();
    inregistrate.delete(r);
    if (inregistrate.size === 0) {
      window.removeEventListener("scroll", programeaza);
      window.removeEventListener("resize", programeaza);
      if (cadruCerut) {
        cancelAnimationFrame(cadruCerut);
        cadruCerut = 0;
      }
    }
  };
}
