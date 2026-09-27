// Reguli de limba aplicate textelor compuse la rulare (decizia D15 din planul valului S4).
//
// Numeralul cardinal de la 20 in sus cere prepozitia "de" inaintea substantivului ("30 de acte"),
// cu exceptia numerelor care se termina in 01-19 ("101 acte", "8 acte"). Regula se aplica si
// sumelor in lei. Sabloanele cu valoare variabila nu pot scrie "de" pe litere, deci il cer aici.

/** Adevarat cand numarul cere "de" inaintea substantivului: 20-100, 120, 1.000, dar nu 101-119. */
export function cereDe(n: number): boolean {
  if (!Number.isInteger(n)) return false;
  const rest = Math.abs(n) % 100;
  return Math.abs(n) >= 20 && (rest === 0 || rest >= 20);
}

/** Numarul, urmat de " de" cand forma literara o cere: 8 -> "8", 30 -> "30 de". */
export function numarCuDe(n: number): string {
  return cereDe(n) ? n + " de" : String(n);
}
