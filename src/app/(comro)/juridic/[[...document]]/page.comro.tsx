// Geamana pe asezarea `ro` (3s.com.ro: romana la radacina, engleza sub `/en`) a fisierului
// `src/app/(romd)/ro/juridic/[[...document]]/page.romd.tsx`: acelasi modul, servit la adresa asezarii (`src/lib/asezare.ts`).
// Nu se scrie continut aici; perechea o pazeste `.claude/scripts/porti/poarta-oglinda-asezare.py`.
// Configurarea segmentului se scrie LITERAL, cu valoarea geamanei: Next o citeste din fisierul rutei.
export { default, generateStaticParams, generateMetadata } from "@/app/(romd)/ro/juridic/[[...document]]/page.romd";
export const dynamicParams = false;
