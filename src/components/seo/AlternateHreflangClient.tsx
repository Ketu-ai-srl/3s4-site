"use client";

// Legaturile `<link rel="alternate" hreflang>` ale paginii curente, spre aceeasi cale pe fiecare
// varianta din `SITE_ALTERNATE` (inclusiv spre pagina insasi) si spre `x-default`. Elementele `<link>`
// randate oriunde in arbore ajung in `<head>` (React 19), deci sunt in HTML-ul servit, nu construite
// de un script; la navigarea in browser se schimba odata cu calea.
//
// Adresa se compune cu `adresaAlternata` (`./alternate-cale`), aceeasi functie pe care o citeste
// serverul: modulul nu importa nimic, deci piesa de browser nu trage dupa ea manifestul de rute.
//
// PAGINA DE NEGASIT NU PRIMESTE ALTERNATE. Ea e prerandata o singura data, pentru orice adresa
// necunoscuta, cu calea interna `/_not-found`; in browser insa `usePathname()` da adresa ceruta de om,
// deci fara o a doua verificare piesa ar pune, dupa hidratare, alternate spre o cale inventata (masurat
// pe un build: pe `/o-cale-care-nu-exista` aparusera patru). Verificarea a doua: segmentul din arborele
// paginii, `/_not-found`, pe care il vad la fel serverul si browserul (`useSelectedLayoutSegments`).

import { usePathname, useSelectedLayoutSegments } from "next/navigation";
import { adresaAlternata, type Alternata } from "./alternate-cale";

export type AlternateHreflangClientProps = {
  alternate: Alternata[];
};

/** Segmentul pe care Next il pune pagina de negasit in arborele rutelor. */
const SEGMENT_NEGASIT = "/_not-found";

export default function AlternateHreflangClient({ alternate }: AlternateHreflangClientProps) {
  const cale = usePathname();
  const segmente = useSelectedLayoutSegments();
  if (!cale || cale.startsWith("/_") || segmente[0] === SEGMENT_NEGASIT) {
    return null;
  }
  return (
    <>
      {alternate.map((a) => (
        <link key={a.hreflang} rel="alternate" hrefLang={a.hreflang} href={adresaAlternata(a.adresa, cale)} />
      ))}
    </>
  );
}
