"use client";

// S5 - lumina, INVELITOAREA ro-MD (pagina `/ro/functionalitati/cautare-ai` a lui 3s.md): eticheta, indicatia si
// intrebarea scenei (aceeasi cu cea din terminalul eroului) vin din modulul ro-MD al paginii. Pagina e in romana, deci
// intrebarea nu primeste `lang` separat. Nu importa nimic din continutul RO.

import LuminaVedere from "@/components/functionalitati/cautare-ai/LuminaVedere";
import { LUMINA_CAUTARE_RO_MD, SCENA_CAUTARE_RO_MD } from "@/content/ro-md/cautare-ai-componente";

export default function LuminaRoMd() {
  return <LuminaVedere continut={{ ...LUMINA_CAUTARE_RO_MD, intrebare: SCENA_CAUTARE_RO_MD.intrebare }} />;
}
