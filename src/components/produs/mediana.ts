// Mediana unui sir de timpi, pentru cardul de verificare din browser (securitate.md §4: trei cereri
// succesive, se afiseaza mediana). Functie pura, ca sa se poata proba fara browser.

/** Mediana; `null` pentru un sir gol sau cu valori care nu sunt numere finite. */
export function mediana(valori: readonly number[]): number | null {
  if (valori.length === 0 || valori.some((v) => !Number.isFinite(v))) return null;
  const ordonate = [...valori].sort((a, b) => a - b);
  const mijloc = Math.floor(ordonate.length / 2);
  return ordonate.length % 2 === 1 ? ordonate[mijloc] : (ordonate[mijloc - 1] + ordonate[mijloc]) / 2;
}
