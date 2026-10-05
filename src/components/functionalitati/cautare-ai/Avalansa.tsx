"use client";

// S1 - avalansa de fisiere (functionalitati__cautare-ai.md, S1), INVELITOAREA RO: aceeasi cale, acelasi export si
// aceleasi proprietati (niciuna) ca inainte. Ia textele din modulul RO si randeaza `AvalansaVedere`, care nu importa
// continut; editia `en` are invelitoarea ei (`AvalansaEn`), pusa direct de pagina EN.

import { AVALANSA, ETICHETA_EXEMPLU } from "@/content/functionalitati/cautare-ai";
import AvalansaVedere from "./AvalansaVedere";

export { PRAGURI_AVALANSA, PULS } from "./AvalansaVedere";

export default function Avalansa() {
  return <AvalansaVedere continut={{ ...AVALANSA, etichetaExemplu: ETICHETA_EXEMPLU }} />;
}
