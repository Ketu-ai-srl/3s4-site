// Datele unui card, din articolul citit de conducta: indexul din registru plus minutele de citit.
// Modul separat de `conducta.ts`, ca insula client sa nu traga dupa ea cititorul de fisiere.

import type { ArticolComplet } from "@/content/blog/conducta";
import type { DateCard } from "./format";

export function dateCard(a: ArticolComplet): DateCard {
  return {
    slug: a.slug,
    titlu: a.titlu,
    extras: a.extras,
    categorie: a.categorie,
    data: a.dataPublicarii,
    minute: a.minute,
  };
}
