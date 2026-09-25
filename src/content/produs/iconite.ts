// Numele iconitelor folosite de paginile de produs (platforma, integrari, securitate). Continutul
// numeste iconita, componenta `src/components/produs/IconitaProdus.tsx` o deseneaza din setul
// Lucide (licenta ISC). Proba `tests/produs.test.ts` cere ca fiecare nume de aici sa aiba desen.

export const ICONITE_PRODUS = [
  "straturi",
  "scut-bifa",
  "scantei",
  "randuri",
  "lupa",
  "balon",
  "clopot",
  "document",
  "document-randuri",
  "panou",
  "cilindru",
  "rotita",
  "lacat",
  "glob",
  "scut",
  "cheie",
  "ecran",
  "server",
  "lant",
  "incarcare",
  "arhiva",
  "ceas",
  "iesire",
] as const;

export type IconitaProdus = (typeof ICONITE_PRODUS)[number];
