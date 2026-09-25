// Registrul blogului: lista articolelor publicate. GOL la valul S4-1, deliberat.
//
// CINE IL SCRIE: felia `blog` (valul S4-4), odata cu conducta de continut si primul lot de
// articole. Pana atunci lista e goala, iar asta e o stare adevarata, nu o omisiune: nu exista
// niciun articol, deci nicio legatura catre un articol nu are voie sa apara.
//
// CINE IL CITESTE: multimea cailor existente (`src/content/cai.ts`) - deci filtrul navigatiei,
// paleta de cautare (grupul de articole apare la interogare) si, mai tarziu, harta de site
// generata a feliei `juridic`. Legaturile din subsol catre articole (coloana Resurse) se arata
// singure din clipa in care calea lor apare aici.

/** Slugurile categoriilor (planul valului, §6.6): aceleasi in adresa si in registru. */
export const CATEGORII_BLOG = ["contabilitate", "it", "juridic", "management"] as const;
export type CategorieBlog = (typeof CATEGORII_BLOG)[number];

export type ArticolBlog = {
  /** Segmentul din adresa: `/blog/<slug>`. Litere mici, cifre si cratima. */
  slug: string;
  titlu: string;
  /** Extrasul din listare si din paleta (taiat la 2-3 randuri de componenta). */
  extras: string;
  categorie: CategorieBlog;
  /** Data publicarii, ISO `YYYY-MM-DD`. */
  data: string;
};

export const ARTICOLE: ArticolBlog[] = [];

export function caleArticol(articol: Pick<ArticolBlog, "slug">): string {
  return "/blog/" + articol.slug;
}

/** Caile tuturor articolelor, in ordinea registrului. */
export function caiArticole(): string[] {
  return ARTICOLE.map(caleArticol);
}
