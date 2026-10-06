// Geamana pe asezarea `ro` (3s.com.ro: romana la radacina, engleza sub `/en`) a fisierului
// `src/app/(en)/opengraph-image/route.en.tsx`: acelasi modul, servit la adresa asezarii (`src/lib/asezare.ts`).
// Pe asezarea `ro` imaginea sociala se serveste si la radacina: paginile o numesc la `/opengraph-image` (`metadataPagina`),
// cale care nu se traduce; geamana de sub `/en` tine perechea grupului `en` (`RUTE_GRUP` din `asezare.ts`).
// Nu se scrie continut aici; perechea o pazeste `.claude/scripts/porti/poarta-oglinda-asezare.py`.
// Configurarea segmentului se scrie LITERAL, cu valoarea geamanei: Next o citeste din fisierul rutei.
export { GET } from "@/app/(en)/opengraph-image/route.en";
export const dynamic = "force-static";
