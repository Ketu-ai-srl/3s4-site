// Registrul blogului: lista articolelor publicate. GOL azi, deliberat: primul lot de articole se
// scrie separat, pe surse primare, si intra aici cand e gata.
//
// DE UNDE VINE. Articolele sunt fisiere `src/content/blog/<slug>.mdx`, cu antetul YAML al lotului
// (`antet.ts`) si corpul in Markdown (`markdown.ts`); le citeste `conducta.ts`, la construire. Lista
// de mai jos e INDEXUL lor (slug, titlu, extras, categorie, data), scris in `articole.json`, fiindca o
// citesc si piese care ruleaza in browser (paleta de cautare) si nu pot deschide fisiere. Indexul nu
// se scrie de mana: proba `tests/blog-conducta.test.ts` il reconstruieste din fisierele .mdx si pica
// daca difera; se regenereaza cu `pnpm exec vitest run tests/blog-conducta.test.ts -u`.
//
// CINE IL CITESTE: multimea cailor existente (`src/content/cai.ts`, prin `caiArticole`) - deci filtrul
// navigatiei, firul de pagina si `Tinta`; paleta de cautare; harta de site si `/llms.txt`; paginile
// blogului (`src/app/blog/`), care exista numai pentru ce e aici.
//
// DE CE BLOGUL NU E IN `RUTE`. Paginile lui se nasc din registru (`generateStaticParams`), deci sunt
// rute dinamice: cu registrul gol nu exista nicio pagina de blog, iar cu primul articol apar singure
// listarea, categoria lui si articolul. `caiArticole` le adauga atunci in multimea cailor existente, iar
// meniul, subsolul, paleta si firul de pagina arata legaturile spre ele fara alta interventie.

import generate from "./articole.json";

/** Slugurile categoriilor (planul valului, §6.6): aceleasi in adresa si in registru. */
export const CATEGORII_BLOG = ["contabilitate", "it", "juridic", "management"] as const;
export type CategorieBlog = (typeof CATEGORII_BLOG)[number];

/**
 * Ordinea de AFISARE a categoriilor (pastilele listarii si ale paginii de categorie), masurata in fisa
 * `blog.md` 3b si §B: categoria juridica e a treia, IT-ul al patrulea. Difera de ordinea slugurilor de
 * mai sus, care e cea din plan si ramane cheia registrului.
 */
export const ORDINE_CATEGORII: readonly CategorieBlog[] = ["contabilitate", "juridic", "it", "management"];

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

/** Calea listarii. */
export const CALE_BLOG = "/blog";

export function esteCategorie(valoare: unknown): valoare is CategorieBlog {
  return typeof valoare === "string" && (CATEGORII_BLOG as readonly string[]).includes(valoare);
}

/**
 * Indexul citit din `articole.json`, verificat la import: un index stricat de mana opreste construirea
 * aici, cu numele intrarii, in loc sa ajunga in navigatie.
 */
export function citesteIndexul(lista: unknown): ArticolBlog[] {
  if (!Array.isArray(lista)) throw new Error("articole.json: se astepta o lista");
  return lista.map((intrare, i) => {
    const o = (intrare ?? {}) as Record<string, unknown>;
    const campuri = ["slug", "titlu", "extras", "data"] as const;
    for (const c of campuri) {
      if (typeof o[c] !== "string" || (o[c] as string).trim() === "") {
        throw new Error("articole.json, intrarea " + (i + 1) + ": lipseste `" + c + "`");
      }
    }
    if (!esteCategorie(o.categorie)) {
      throw new Error("articole.json, intrarea " + (i + 1) + ": categorie necunoscuta " + JSON.stringify(o.categorie));
    }
    return {
      slug: o.slug as string,
      titlu: o.titlu as string,
      extras: o.extras as string,
      categorie: o.categorie,
      data: o.data as string,
    };
  });
}

/** Articolele publicate, cele mai noi primele (ordinea o fixeaza conducta la generare). */
export const ARTICOLE: ArticolBlog[] = citesteIndexul(generate);

export function caleArticol(articol: Pick<ArticolBlog, "slug">): string {
  return CALE_BLOG + "/" + articol.slug;
}

export function caleCategorie(categorie: CategorieBlog): string {
  return CALE_BLOG + "/categorie/" + categorie;
}

/** Parametrul din adresa listarii care tine categoria filtrata. */
export const PARAMETRU_CATEGORIE = "categorie";

/**
 * Adresa LISTARII filtrate pe o categorie (pastilele de pe `/blog`); fara categorie, listarea intreaga.
 * Pagina categoriei e `caleCategorie`; pastilele listarii nu duc acolo (motivul in `ListareBlog.tsx`).
 */
export function caleFiltru(c: CategorieBlog | null): string {
  return c === null ? CALE_BLOG : CALE_BLOG + "?" + PARAMETRU_CATEGORIE + "=" + c;
}

/** Categoriile care au cel putin un articol, in ordinea de afisare (`ORDINE_CATEGORII`). */
export function categoriiCuArticole(articole: readonly ArticolBlog[] = ARTICOLE): CategorieBlog[] {
  return ORDINE_CATEGORII.filter((c) => articole.some((a) => a.categorie === c));
}

/**
 * Caile pe care registrul le face sa existe: nimic cu registrul gol; altfel listarea, categoriile
 * care au articole si fiecare articol. Numele vine de la primul consumator, `src/content/cai.ts`
 * (piesa fundatiei), care le adauga la `RUTE` in multimea cailor existente; numai articolele erau
 * rute dinamice la S4-1, listarea si categoriile au devenit si ele dinamice in felia `blog`.
 */
export function caiArticole(articole: readonly ArticolBlog[] = ARTICOLE): string[] {
  if (articole.length === 0) return [];
  return [CALE_BLOG, ...categoriiCuArticole(articole).map(caleCategorie), ...articole.map(caleArticol)];
}
