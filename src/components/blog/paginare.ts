// Paginarea listarii blogului (felia seo-tehnic, auditul SEO m1). Masurat pe live: `/blog` avea
// legaturi servite spre 9 din 10 articole, iar al 10-lea se vedea numai dupa butonul care aduce inca
// 9 carduri, adica numai cu JavaScript. Acum fiecare pagina de 9 are adresa ei statica,
// `/blog/pagina/<n>` de la a doua incolo, cu legaturile spre pagina urmatoare si cea anterioara
// randate pe server. Butonul ramane imbunatatirea din browser.
//
// Prima pagina e `/blog`, nu `/blog/pagina/1`: o singura adresa pentru acelasi continut. Paginile nu
// intra in `RUTE` si nici in harta de site: sunt drumuri spre articole, iar articolele sunt in harta.
// Fiecare are canonical-ul ei (nu spre `/blog`), fiindca arata alte articole.
//
// Fara hooks si fara JSX: modulul se importa si din insula listarii, si de pe server.

import { CALE_BLOG } from "@/content/blog/registru";

/** Cate carduri are o pagina a listarii, si cate aduce o apasare pe buton (blog.md 3d, 3f). */
export const PE_PAGINA = 9;

/** Radacina paginilor 2..n. */
export const CALE_PAGINI = CALE_BLOG + "/pagina";

/** Numarul de pagini pentru `total` articole; cel putin una, ca listarea sa existe si goala. */
export function numarPagini(total: number, pePagina: number = PE_PAGINA): number {
  return Math.max(1, Math.ceil(total / pePagina));
}

/** Adresa paginii `n` (1 = listarea). */
export function calePagina(n: number): string {
  if (!Number.isInteger(n) || n < 1) throw new Error("pagina de blog nevalida: " + n);
  return n === 1 ? CALE_BLOG : CALE_PAGINI + "/" + n;
}

/** Articolele paginii `n`, in ordinea listarii. */
export function articolePagina<T>(articole: readonly T[], n: number, pePagina: number = PE_PAGINA): T[] {
  return articole.slice((n - 1) * pePagina, n * pePagina);
}

/** Numarul paginii dintr-un segment de adresa (`"2"`), sau `null` daca segmentul nu e o pagina 2..total. */
export function paginaDinSegment(segment: string, total: number): number | null {
  if (!/^[1-9][0-9]*$/.test(segment)) return null;
  const n = Number(segment);
  return n >= 2 && n <= total ? n : null;
}

export type LegaturiPaginare = { anterioara: string | null; urmatoare: string | null };

/** Vecinii paginii `n` dintr-o listare de `total` pagini. */
export function vecini(n: number, total: number): LegaturiPaginare {
  return {
    anterioara: n > 1 ? calePagina(n - 1) : null,
    urmatoare: n < total ? calePagina(n + 1) : null,
  };
}

export const PAGINARE = {
  // Rol: eticheta accesibila a grupului de legaturi.
  eticheta: "Paginile listei de articole",
  // Rol: legatura spre pagina urmatoare.
  urmatoare: "Pagina următoare",
  // Rol: legatura spre pagina anterioara.
  anterioara: "Pagina anterioară",
  // Rol: nivelul curent din fir si numele paginii n.
  fir: (n: number) => "Pagina " + n,
  // Rol: titlul documentului pentru pagina n (15-65, unic pe site).
  titluPagina: (n: number) => "Blog 3S, pagina " + n + ": ghiduri pentru arhiva firmei",
  // Rol: descrierea pentru pagina n (50-160, unica pe site).
  descriere: (n: number) =>
    "Pagina " + n + " a listei de articole 3S despre termenele de păstrare, registrul arhivei, digitizare și căutare.",
} as const;
