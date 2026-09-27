// `/blog/pagina/<n>`: paginile 2..n ale listarii blogului (felia seo-tehnic, auditul SEO m1), statice,
// nascute din registru la construire. `dynamicParams = false`: `/blog/pagina/1` (prima pagina e
// `/blog`) si orice pagina peste ultima dau 404. Paginile nu stau in `RUTE` si nici in harta de site
// (motivul in `src/components/blog/paginare.ts`); canonical-ul fiecareia e propria adresa.

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PaginaListareN from "@/components/blog/PaginaListareN";
import { PAGINARE, calePagina, numarPagini, paginaDinSegment } from "@/components/blog/paginare";
import { metadataPagina } from "@/components/seo/metadata";
import { toateArticolele } from "@/content/blog/conducta";

export const dynamicParams = false;

export function generateStaticParams(): { pagina: string }[] {
  const total = numarPagini(toateArticolele().length);
  return Array.from({ length: total - 1 }, (_, i) => ({ pagina: String(i + 2) }));
}

type Parametri = { params: Promise<{ pagina: string }> };

async function paginaCeruta({ params }: Parametri): Promise<number | null> {
  return paginaDinSegment((await params).pagina, numarPagini(toateArticolele().length));
}

export async function generateMetadata(p: Parametri): Promise<Metadata> {
  const n = await paginaCeruta(p);
  return n === null
    ? {}
    : metadataPagina({ titlu: PAGINARE.titluPagina(n), descriere: PAGINARE.descriere(n), cale: calePagina(n) });
}

export default async function PaginaBloguluiN(p: Parametri) {
  const n = await paginaCeruta(p);
  if (n === null) notFound();
  return <PaginaListareN articole={toateArticolele()} pagina={n} />;
}
