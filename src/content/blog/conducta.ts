// Conducta de continut a blogului: citeste fisierele `src/content/blog/<slug>.mdx`, valideaza antetul
// YAML (`antet.ts`), citeste corpul (`markdown.ts`) si masoara articolul. Ruleaza NUMAI pe server, la
// construire: paginile blogului sunt statice (`generateStaticParams`, `dynamicParams = false`), deci
// nicio cerere nu citeste discul. Nu se importa din componente de browser: registrul (`registru.ts`)
// e partea pe care o pot citi si ele.
//
// Un articol stricat OPRESTE construirea, cu fisierul si toate erorile lui. Un articol publicat pe
// jumatate (antet ignorat, tabel randat ca text, sursa lipsa) e mai rau decat un build rosu.

import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import matter from "gray-matter";
import { valideazaAntet, type AntetArticol } from "./antet";
import { minuteDeCitit, numaraCuvinte, parseazaCorp, type CorpArticol } from "./markdown";
import type { ArticolBlog } from "./registru";

export type ArticolComplet = AntetArticol & {
  corp: CorpArticol;
  cuvinte: number;
  minute: number;
};

/** Dosarul articolelor, fata de radacina proiectului (directorul din care ruleaza `next build`). */
export const DOSAR_ARTICOLE = join("src", "content", "blog");

export class EroareArticol extends Error {
  constructor(
    readonly fisier: string,
    readonly erori: string[],
  ) {
    super(fisier + ":\n  - " + erori.join("\n  - "));
    this.name = "EroareArticol";
  }
}

/**
 * Un articol din textul fisierului. Antetul trebuie sa inceapa pe primul rand, cu exact `---`: un
 * antet `---js` ar fi EXECUTAT de cititorul de antete, deci se refuza inainte de a ajunge la el.
 */
export function articolDinText(text: string, numeFisier: string): ArticolComplet {
  const curat = text.replace(/^﻿/, "").replace(/\r\n?/g, "\n");
  if (!/^---\n/.test(curat)) {
    throw new EroareArticol(numeFisier, ["antetul YAML lipseste: fisierul trebuie sa inceapa cu un rand `---`"]);
  }
  let date: Record<string, unknown>;
  let continut: string;
  try {
    // Cu optiuni, cititorul nu foloseste memoria lui interna (care ar intoarce acelasi obiect la doua
    // texte identice); `language` fixeaza YAML-ul.
    const rezultat = matter(curat, { language: "yaml" });
    date = (rezultat.data ?? {}) as Record<string, unknown>;
    continut = rezultat.content;
  } catch (e) {
    throw new EroareArticol(numeFisier, ["antetul YAML nu se poate citi: " + String(e)]);
  }

  // Datele se iau din TEXTUL antetului, nu din valoarea citita de YAML: o data nescrisa intre
  // ghilimele devine obiect `Date`, iar o zi inexistenta (30 februarie) se muta tacut pe 2 martie.
  const bloc = /^---\n([\s\S]*?)\n---(?:\n|$)/.exec(curat)?.[1] ?? "";
  for (const cheie of ["data_verificarii", "data_publicarii"]) {
    const brut = new RegExp("^" + cheie + ":[ \\t]*[\"']?([^\"'\\n]*?)[\"']?[ \\t]*$", "m").exec(bloc);
    if (brut && cheie in date) date = { ...date, [cheie]: brut[1] };
  }

  const verdict = valideazaAntet(date, numeFisier);
  if (verdict.antet === null) throw new EroareArticol(numeFisier, verdict.erori);

  let corp: CorpArticol;
  try {
    corp = parseazaCorp(continut);
  } catch (e) {
    throw new EroareArticol(numeFisier, ["corpul: " + (e instanceof Error ? e.message : String(e))]);
  }
  if (corp.blocuri.length === 0) throw new EroareArticol(numeFisier, ["corpul e gol"]);

  const cuvinte = numaraCuvinte(corp);
  return { ...verdict.antet, corp, cuvinte, minute: minuteDeCitit(cuvinte) };
}

/** Ordinea listarii: cele mai noi primele; la aceeasi data, dupa slug (stabila si previzibila). */
export function comparaArticole(a: Pick<ArticolBlog, "data" | "slug">, b: Pick<ArticolBlog, "data" | "slug">): number {
  if (a.data !== b.data) return a.data < b.data ? 1 : -1;
  return a.slug < b.slug ? -1 : a.slug > b.slug ? 1 : 0;
}

/**
 * Toate articolele din dosar, validate si ordonate. Pe langa erorile fiecarui fisier, refuza ce nu se
 * vede dintr-un singur fisier: acelasi titlu sau acelasi extras la doua articole (poarta de SEO cere
 * titluri si descrieri unice pe tot site-ul) si fisierele `.md` puse din greseala in locul `.mdx`.
 */
export function citesteArticolele(radacina: string = process.cwd()): ArticolComplet[] {
  const dosar = join(radacina, DOSAR_ARTICOLE);
  const nume = readdirSync(dosar).sort();
  const gresite = nume.filter((n) => n.endsWith(".md"));
  if (gresite.length > 0) {
    throw new EroareArticol(gresite.join(", "), ["articolele se pun ca .mdx, nu ca .md"]);
  }
  const articole = nume
    .filter((n) => n.endsWith(".mdx"))
    .map((n) => articolDinText(readFileSync(join(dosar, n), "utf8"), n));

  const erori: string[] = [];
  const dubluri = (camp: "titlu" | "extras") => {
    const vazute = new Map<string, string>();
    for (const a of articole) {
      const cheie = a[camp].toLowerCase();
      const altul = vazute.get(cheie);
      if (altul) erori.push("`" + camp + "` identic la " + altul + " si " + a.slug);
      else vazute.set(cheie, a.slug);
    }
  };
  dubluri("titlu");
  dubluri("extras");
  if (erori.length > 0) throw new EroareArticol(DOSAR_ARTICOLE, erori);

  return articole.sort((a, b) => comparaArticole({ data: a.dataPublicarii, slug: a.slug }, { data: b.dataPublicarii, slug: b.slug }));
}

let memorie: ArticolComplet[] | null = null;

/** Articolele proiectului curent, citite o singura data pe proces. */
export function toateArticolele(): ArticolComplet[] {
  if (memorie === null) memorie = citesteArticolele();
  return memorie;
}

export function articolDupaSlug(slug: string): ArticolComplet | null {
  return toateArticolele().find((a) => a.slug === slug) ?? null;
}

/** Indexul scris in `articole.json`: ce citesc navigatia, paleta, harta de site si `/llms.txt`. */
export function indexRegistru(articole: readonly ArticolComplet[]): ArticolBlog[] {
  return articole.map((a) => ({
    slug: a.slug,
    titlu: a.titlu,
    extras: a.extras,
    categorie: a.categorie,
    data: a.dataPublicarii,
  }));
}
