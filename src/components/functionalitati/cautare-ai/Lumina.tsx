"use client";

// S5 - lumina (functionalitati__cautare-ai.md, S5), INVELITOAREA RO: aceeasi cale, acelasi export si aceleasi
// proprietati (niciuna) ca inainte. Ia intrebarea eroului si textele barei din modulul RO si randeaza `LuminaVedere`,
// care nu importa continut; editia `en` are invelitoarea ei (`LuminaEn`), pusa direct de pagina EN.

import { EROU_CAUTARE, LUMINA } from "@/content/functionalitati/cautare-ai";
import LuminaVedere from "./LuminaVedere";

export { SCRIERE_LUMINA } from "./LuminaVedere";

export default function Lumina() {
  return <LuminaVedere continut={{ intrebare: EROU_CAUTARE.intrebare, declaratie: LUMINA.declaratie, indicatie: LUMINA.indicatie }} />;
}
