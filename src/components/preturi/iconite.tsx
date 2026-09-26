// Iconitele paginii de preturi care nu sunt in harta primitivei `Iconita` (piesa inghetata a
// fundatiei): "i", imprimanta, plusul si persoana. Tot din setul Lucide (licenta ISC), importate
// nominal, ca in pachet sa intre numai ele. Desenele referintei nu se folosesc.

import { Info, Plus, Printer, User, type LucideIcon } from "lucide-react";

const HARTA: Record<"info" | "imprimanta" | "plus" | "persoana", LucideIcon> = {
  info: Info,
  imprimanta: Printer,
  plus: Plus,
  persoana: User,
};

export type IconitaPretProps = {
  nume: keyof typeof HARTA;
  marime: number;
  contur: number;
  className?: string;
};

/** Iconita decorativa: numele accesibil il poarta elementul care o contine. */
export default function IconitaPret({ nume, marime, contur, className }: IconitaPretProps) {
  const C = HARTA[nume];
  return <C width={marime} height={marime} strokeWidth={contur} className={className} aria-hidden={true} focusable="false" />;
}
