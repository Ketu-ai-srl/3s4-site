"use client";

// Un bloc JSON-LD randat NUMAI pe o cale data. Punte pentru pagina de start: `src/app/page.tsx` e al
// feliei `fundatie`, iar datele ei structurate (aplicatia si intrebarile) le pune layout-ul, care nu
// stie pe ce pagina e. `usePathname` raspunde si la prerandare, deci blocul ajunge in HTML-ul
// servit al paginii `/` si lipseste de pe celelalte.
//
// Costul, acceptat: textul blocului circula si in datele de hidratare ale celorlalte pagini. Masurat
// pe build-ul din 24.09: blocul startului are 2.772 de octeti; ca sir evadat in datele paginii 404
// ajunge la ~3 KB necomprimat (estimat din lungimea sirului, nu cantarit separat). Cand fundatia
// pune `<JsonLd date={grafAcasa()} />` direct in pagina de start, puntea asta se sterge.

import { usePathname } from "next/navigation";

export default function JsonLdPeCale({ cale, json }: { cale: string; json: string }) {
  if (usePathname() !== cale) return null;
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}
