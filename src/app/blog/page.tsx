// `/blog`: listarea articolelor (sablonul blog-L). Pagina e STATICA si sta in `RUTE`, sub marcajul
// feliei blog, de cand registrul are articole (felia blog-articole, primul lot).
//
// DE CE STATICA, si nu restul optional al feliei 59. Cat timp registrul era gol, listarea trebuia sa
// NU existe, deci era nascuta din registru (`[[...segment]]`). Cu registrul plin ea trebuie sa fie in
// `RUTE` (harta de site, declaratia GEO, afirmatiile rutei), iar poarta de rute cere pentru fiecare
// intrare din `RUTE` un `page.tsx` cu cale fixa (RU-02). Proba `tests/blog-articole.test.ts` cere ca
// intrarile blogului din `RUTE` sa fie exact caile pe care le deschide registrul, deci un registru
// golit din nou inroseste proba in loc sa lase o listare goala in meniu.

import type { Metadata } from "next";
import { metadataListare } from "@/components/blog/metadata";
import PaginaListare from "@/components/blog/PaginaListare";
import { toateArticolele } from "@/content/blog/conducta";

export function generateMetadata(): Metadata {
  return metadataListare();
}

export default function PaginaBlog() {
  return <PaginaListare articole={toateArticolele()} />;
}
