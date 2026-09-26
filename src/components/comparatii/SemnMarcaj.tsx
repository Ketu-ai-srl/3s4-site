// Marcajul unei celule din tabelele de comparatie (comparatie-drive.md §5): da = bifa, partial =
// cerc pe jumatate plin, nu = liniuta. Desenul e decorativ; textul pentru cititoarele de ecran il
// pune celula, langa el (`LEGENDA_MARCAJE`).

import { Check, Minus } from "lucide-react";
import type { Marcaj } from "@/content/comparatii";

export type SemnMarcajProps = {
  marcaj: Marcaj;
  marime?: number;
  className?: string;
};

export default function SemnMarcaj({ marcaj, marime = 16, className }: SemnMarcajProps) {
  if (marcaj === "da") {
    return <Check size={marime} strokeWidth={2} className={className} aria-hidden="true" focusable="false" />;
  }
  if (marcaj === "nu") {
    return <Minus size={marime} strokeWidth={2} className={className} aria-hidden="true" focusable="false" />;
  }
  // Partial: cercul pe grila de 16, cu jumatatea dreapta plina.
  return (
    <svg
      width={marime}
      height={marime}
      viewBox="0 0 16 16"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <circle cx="8" cy="8" r="6.25" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8 1.75 A 6.25 6.25 0 0 1 8 14.25 Z" fill="currentColor" />
    </svg>
  );
}
