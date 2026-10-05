"use client";

// S1 - avalansa de fisiere, INVELITOAREA ro-MD (pagina `/ro/functionalitati/cautare-ai` a lui 3s.md): ia textele din
// modulul ro-MD al paginii si randeaza aceeasi vedere ca paginile RO si EN. Nu importa nimic din continutul RO.

import AvalansaVedere from "@/components/functionalitati/cautare-ai/AvalansaVedere";
import { AVALANSA_CAUTARE_RO_MD } from "@/content/ro-md/cautare-ai-componente";

export default function AvalansaRoMd() {
  return <AvalansaVedere continut={AVALANSA_CAUTARE_RO_MD} />;
}
