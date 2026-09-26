// Generatorul pseudo-aleator cu samanta fixa al scenelor 3D (COMPONENTE.md §4.2, Scena3D).
//
// De ce nu `Math.random`: o scena trebuie sa arate LA FEL la fiecare incarcare (foile, folderele,
// hartiile cad in acelasi loc), altfel o captura de referinta nu mai poate fi comparata cu una
// noua, iar o proba vizuala ar pica din noroc. Aceeasi samanta da mereu acelasi sir.
//
// Algoritmul e mulberry32 (domeniu public): 32 de biti de stare, perioada 2^32, suficient pentru
// cateva sute de obiecte pe scena. Nu e criptografic si nu trebuie sa fie.

/** Intoarce o functie care da, la fiecare apel, un numar in [0, 1), determinat de samanta. */
export function creeazaAleator(samanta: number): () => number {
  let stare = samanta >>> 0;
  return () => {
    stare = (stare + 0x6d2b79f5) >>> 0;
    let t = stare;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Un numar in [min, max), din generatorul dat. */
export function intre(aleator: () => number, min: number, max: number): number {
  return min + (max - min) * aleator();
}
