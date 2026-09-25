// Formatele blogului, ca functii pure (probate in `tests/blog-conducta.test.ts`): data, numarul de
// articole, timpul de citit, filtrarea listarii si alegerea articolelor inrudite.

import { normalizeaza } from "@/components/global/paleta";
import type { ArticolBlog, CategorieBlog } from "@/content/blog/registru";
import { LUNI } from "@/content/blog/texte";

/** Ce stie un card: indexul din registru, plus minutele de citit masurate de conducta. */
export type DateCard = ArticolBlog & { minute: number };

/** „25 septembrie 2026": ziua fara zero, luna cu litera mica. Data vine ISO, `YYYY-MM-DD`. */
export function dataRo(iso: string): string {
  const [an, luna, zi] = iso.split("-").map(Number);
  return zi + " " + LUNI[luna - 1] + " " + an;
}

/**
 * Numarul de articole, acordat: „1 articol", „14 articole", „24 de articole", „101 articole".
 * In romana, „de" intra dupa numeralele care se termina in 00 sau in 20-99.
 */
export function numarArticole(n: number): string {
  if (n === 1) return "1 articol";
  const rest = n % 100;
  return n + (n >= 20 && (rest === 0 || rest >= 20) ? " de articole" : " articole");
}

/** Contorul listarii filtrate. */
export function contorGasite(n: number): string {
  if (n === 0) return "Niciun articol găsit";
  if (n === 1) return "1 articol găsit";
  return numarArticole(n) + " găsite";
}

export function minuteText(minute: number): string {
  return minute + " min de citit";
}

/**
 * Articolele care se potrivesc cu interogarea si cu categoria: subsir in titlu sau in extras, fara
 * majuscule si FARA diacritice (o interogare fara ele gaseste titlul scris cu ele; decizia de pe fisa
 * `blog.md` 3g).
 * Interogarea goala nu filtreaza.
 */
export function filtreaza<T extends ArticolBlog>(articole: readonly T[], interogare: string, categorie: CategorieBlog | null): T[] {
  const q = normalizeaza(interogare);
  return articole.filter(
    (a) => (categorie === null || a.categorie === categorie) && (q === "" || normalizeaza(a.titlu + " " + a.extras).includes(q)),
  );
}

/**
 * Cele trei articole inrudite: intai cele din aceeasi categorie, apoi celelalte, fiecare grup de la
 * cel mai nou. La referinta regula nu e masurata (68% din aceeasi categorie); aici e scrisa, deci
 * previzibila. Mai putin de trei articole in registru inseamna mai putine carduri, nu umplutura.
 */
export function alegeInrudite<T extends ArticolBlog>(articole: readonly T[], curent: Pick<ArticolBlog, "slug" | "categorie">, n = 3): T[] {
  const altele = articole.filter((a) => a.slug !== curent.slug);
  const aceeasi = altele.filter((a) => a.categorie === curent.categorie);
  const restul = altele.filter((a) => a.categorie !== curent.categorie);
  return [...aceeasi, ...restul].slice(0, n);
}
