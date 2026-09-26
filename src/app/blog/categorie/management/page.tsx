// `/blog/categorie/management`: pagina categoriei (sablonul blog-C). Statica si in `RUTE`, ca listarea
// (motivul in `src/app/blog/page.tsx`); proba `tests/blog-articole.test.ts` cere ca fiecare categorie
// din `RUTE` sa aiba articole in registru, si invers.

import type { Metadata } from "next";
import { metadataCategorie } from "@/components/blog/metadata";
import PaginaCategorie from "@/components/blog/PaginaCategorie";
import { toateArticolele } from "@/content/blog/conducta";

export function generateMetadata(): Metadata {
  return metadataCategorie("management");
}

export default function PaginaCategoriei() {
  return <PaginaCategorie categorie="management" articole={toateArticolele()} />;
}
