// `/blog/categorie/<c>`: pagina unei categorii, numai pentru categoriile care au cel putin un articol
// in registru (`generateStaticParams`). Cu registrul gol nu exista niciuna; `dynamicParams = false`
// face ca orice alta categorie sa fie 404, fara randare la cerere.

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { metadataCategorie } from "@/components/blog/metadata";
import PaginaCategorie from "@/components/blog/PaginaCategorie";
import { toateArticolele } from "@/content/blog/conducta";
import { categoriiCuArticole, esteCategorie, type CategorieBlog } from "@/content/blog/registru";

export const dynamicParams = false;

function categoriiPublicate(): CategorieBlog[] {
  return categoriiCuArticole(toateArticolele().map((a) => ({ ...a, data: a.dataPublicarii })));
}

export function generateStaticParams(): { categorie: string }[] {
  return categoriiPublicate().map((categorie) => ({ categorie }));
}

type Parametri = { params: Promise<{ categorie: string }> };

function rezolva(categorie: string): CategorieBlog | null {
  return esteCategorie(categorie) && categoriiPublicate().includes(categorie) ? categorie : null;
}

export async function generateMetadata({ params }: Parametri): Promise<Metadata> {
  const categorie = rezolva((await params).categorie);
  return categorie === null ? {} : metadataCategorie(categorie);
}

export default async function PaginaCategoriei({ params }: Parametri) {
  const categorie = rezolva((await params).categorie);
  if (categorie === null) notFound();
  return <PaginaCategorie categorie={categorie} articole={toateArticolele()} />;
}
