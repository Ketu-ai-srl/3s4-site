"use client";

// S5 - lumina, INVELITOAREA EN (editia `en` a lui 3s.md, pagina `/features/search`): ia eticheta si indicatia din
// modulul EN al paginii, iar intrebarea, in romana, din modulul scenei (aceeasi cu cea din terminalul eroului), cu
// `lang` pe elementul care o poarta. Nu importa nimic din continutul RO.

import { LUMINA_POVESTE } from "@/content/en/features-search";
import { LIMBA_SCENEI, SCENA_CAUTARE_3S_MD } from "@/content/functionalitati/cautare-ai-3s-md";
import LuminaVedere from "./LuminaVedere";

export default function LuminaEn() {
  return <LuminaVedere continut={{ ...LUMINA_POVESTE, intrebare: SCENA_CAUTARE_3S_MD.intrebare }} limbaIntrebare={LIMBA_SCENEI} />;
}
