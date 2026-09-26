// `/blog/<slug>`: pagina unui articol (sablonul blog-articol), nascuta din registru la construire
// (`src/content/blog/conducta.ts`). `dynamicParams = false`: orice alta adresa sub `/blog` e 404, fara
// randare la cerere (continutul se citeste de pe disc numai la construire). Articolele nu stau in
// `RUTE`: harta de site si caile existente le iau din registru.

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { metadataArticol } from "@/components/blog/metadata";
import PaginaArticol from "@/components/blog/PaginaArticol";
import { articolDupaSlug, toateArticolele } from "@/content/blog/conducta";

export const dynamicParams = false;

export function generateStaticParams(): { slug: string }[] {
  return toateArticolele().map((a) => ({ slug: a.slug }));
}

type Parametri = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Parametri): Promise<Metadata> {
  const articol = articolDupaSlug((await params).slug);
  return articol === null ? {} : metadataArticol(articol);
}

export default async function PaginaArticolului({ params }: Parametri) {
  const articol = articolDupaSlug((await params).slug);
  if (articol === null) notFound();
  return <PaginaArticol articol={articol} toate={toateArticolele()} />;
}
