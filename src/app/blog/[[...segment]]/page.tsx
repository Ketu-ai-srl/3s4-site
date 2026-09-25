// `/blog` si `/blog/<slug>`: listarea (fara segment) si articolele (un segment). Paginile se nasc DIN
// REGISTRU la construire (`src/content/blog/conducta.ts`): cu registrul gol, `generateStaticParams`
// nu intoarce nimic, deci nu exista nicio pagina de blog (404), iar primul articol le aduce pe toate.
//
// DE CE O SINGURA RUTA CU REST OPTIONAL, si nu `blog/page.tsx` plus `blog/[slug]/page.tsx`: o pagina
// statica `/blog` ar exista si cu registrul gol, deci ar cere o intrare in `RUTE` (poarta de rute,
// RU-01), iar planul valului o vrea in afara navigatiei pana la primul articol. Segmentul optional face
// ca listarea sa existe exact cand exista articole, la fel ca articolele insesi. `dynamicParams =
// false`: orice alta adresa sub `/blog` e 404, fara randare la cerere (continutul se citeste de pe
// disc numai la construire).
//
// Categoriile au ruta lor, `blog/categorie/[categorie]` (un segment static bate restul optional).

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { metadataArticol, metadataListare } from "@/components/blog/metadata";
import PaginaArticol from "@/components/blog/PaginaArticol";
import PaginaListare from "@/components/blog/PaginaListare";
import { articolDupaSlug, toateArticolele, type ArticolComplet } from "@/content/blog/conducta";

export const dynamicParams = false;

export function generateStaticParams(): { segment: string[] }[] {
  const articole = toateArticolele();
  if (articole.length === 0) return [];
  return [{ segment: [] }, ...articole.map((a) => ({ segment: [a.slug] }))];
}

type Parametri = { params: Promise<{ segment?: string[] }> };

type Tinta = { tip: "listare" } | { tip: "articol"; articol: ArticolComplet };

function rezolva(segment: string[] | undefined): Tinta | null {
  if (toateArticolele().length === 0) return null;
  if (segment === undefined || segment.length === 0) return { tip: "listare" };
  if (segment.length !== 1) return null;
  const articol = articolDupaSlug(segment[0]);
  return articol === null ? null : { tip: "articol", articol };
}

export async function generateMetadata({ params }: Parametri): Promise<Metadata> {
  const tinta = rezolva((await params).segment);
  if (tinta === null) return {};
  return tinta.tip === "listare" ? metadataListare() : metadataArticol(tinta.articol);
}

export default async function PaginaBlog({ params }: Parametri) {
  const tinta = rezolva((await params).segment);
  if (tinta === null) notFound();
  if (tinta.tip === "listare") return <PaginaListare articole={toateArticolele()} />;
  return <PaginaArticol articol={tinta.articol} toate={toateArticolele()} />;
}
