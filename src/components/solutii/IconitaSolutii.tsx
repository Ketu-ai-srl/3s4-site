// Iconitele paginilor de solutii: setul Lucide (licenta ISC), aceeasi familie ca primitiva `Iconita`.
//
// De ce o harta proprie, langa cea a fundatiei: primitiva `Iconita` e piesa inghetata si numeste doar
// iconitele contractelor ei; sectoarele au nevoie de cateva in plus (liniuta, ceas, calendar, tava,
// omul cu plus, sagetile opuse, grila). Numele din contractul de navigatie (iconitele sectoarelor)
// trec prin harta fundatiei, ca meniul si cardurile hub-ului sa deseneze exact aceeasi iconita.
// Un nume necunoscut nu randeaza nimic si e prins de proba `tests/solutii.test.ts`.

import {
  ArrowLeftRight,
  ArrowRight,
  Building,
  Building2,
  CalendarClock,
  CalendarX,
  Check,
  Clock,
  File,
  FilePlus,
  FileText,
  Inbox,
  LayoutGrid,
  Minus,
  Search,
  UserPlus,
  type LucideIcon,
} from "lucide-react";
import { HARTA_ICONITE } from "@/components/primitive/Iconita";

const PROPRII: Record<string, LucideIcon> = {
  "arrow-left-right": ArrowLeftRight,
  "arrow-right": ArrowRight,
  building: Building,
  "building-2": Building2,
  "calendar-clock": CalendarClock,
  "calendar-x": CalendarX,
  check: Check,
  clock: Clock,
  file: File,
  "file-plus": FilePlus,
  "file-text": FileText,
  inbox: Inbox,
  "layout-grid": LayoutGrid,
  minus: Minus,
  search: Search,
  "user-plus": UserPlus,
};

/** Harta folosita de paginile de solutii: a fundatiei, plus iconitele proprii. */
export const ICONITE_SOLUTII: Record<string, LucideIcon> = { ...HARTA_ICONITE, ...PROPRII };

export type IconitaSolutiiProps = {
  nume: string;
  marime?: number;
  contur?: number;
  className?: string;
};

/** Iconita decorativa (`aria-hidden`): pe paginile de solutii textul de langa ea spune tot. */
export default function IconitaSolutii({ nume, marime = 16, contur = 1.75, className }: IconitaSolutiiProps) {
  const Componenta = ICONITE_SOLUTII[nume];
  if (!Componenta) return null;
  return (
    <Componenta
      width={marime}
      height={marime}
      strokeWidth={contur}
      className={className}
      aria-hidden
      focusable="false"
    />
  );
}
