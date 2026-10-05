"use client";

// S1 - avalansa de fisiere, INVELITOAREA EN (editia `en` a lui 3s.md, pagina `/features/search`): ia textele din
// modulul EN al paginii si randeaza aceeasi vedere ca pagina RO. Nu importa nimic din continutul RO.

import { AVALANSA_POVESTE } from "@/content/en/features-search";
import AvalansaVedere from "./AvalansaVedere";

export default function AvalansaEn() {
  return <AvalansaVedere continut={AVALANSA_POVESTE} />;
}
