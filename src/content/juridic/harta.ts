// Harta de site pentru oameni (`/harta-site`), GENERATA din rutele site-ului si din registrul
// blogului, niciodata scrisa de mana (harta-site.md; COMPONENTE §5 punctul 11: la referinta harta
// scrisa de mana avea 3 legaturi "undefined" si 17 rute lipsa).
//
// Aceleasi rute ca harta XML (`rutePentruHarta`), deci o pagina scoasa din index nu apare nici aici.
// Grupele sunt cele ale coloanelor din subsol; fiecare ruta cade in EXACT o grupa, dupa cale:
// solutiile in Sectoare, blogul in Resurse, contactul in Companie, paginile juridice, harta si
// accesibilitatea in Juridic, restul in Produs. O grupa fara nicio ruta nu se randeaza.

import { caleArticol, type ArticolBlog } from "@/content/blog/registru";
import type { Ruta } from "@/content/rute";
import { GRUPE_HARTA, type GrupaHarta } from "./pagini";
import { CALE_JURIDIC } from "./publicare";

export type LegaturaHarta = { cale: string; text: string };
export type GrupaCuLegaturi = { titlu: GrupaHarta; legaturi: LegaturaHarta[] };

function subCale(cale: string, baza: string): boolean {
  return cale === baza || cale.startsWith(baza + "/");
}

/** Grupa in care cade o cale. Totala: orice cale are o grupa. */
export function grupaPentruCale(cale: string): GrupaHarta {
  if (subCale(cale, "/solutii")) return "Sectoare";
  if (subCale(cale, "/blog")) return "Resurse";
  if (cale === "/contact") return "Companie";
  if (subCale(cale, CALE_JURIDIC) || cale === "/harta-site" || cale === "/accesibilitate") return "Juridic";
  return "Produs";
}

/** Grupele hartii, cu legaturile lor in ordinea din `RUTE`, apoi articolele in ordinea registrului. */
export function grupeHarta(rute: readonly Ruta[], articole: readonly ArticolBlog[]): GrupaCuLegaturi[] {
  const toate: LegaturaHarta[] = [
    ...rute.map((r) => ({ cale: r.cale, text: r.scurt })),
    ...articole.map((a) => ({ cale: caleArticol(a), text: a.titlu })),
  ];
  return GRUPE_HARTA.map((titlu) => ({ titlu, legaturi: toate.filter((l) => grupaPentruCale(l.cale) === titlu) })).filter(
    (g) => g.legaturi.length > 0,
  );
}
