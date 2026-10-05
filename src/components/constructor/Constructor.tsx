"use client";

// Constructorul pe industrii de pe start, INVELITOAREA RO (felia `constructor`, valul S4-2; fisa de
// masurare `acasa-constructor.md`). Aceeasi cale, acelasi export si aceleasi proprietati (niciuna) ca
// inainte: `page.tsx` nu se atinge. Capul vine din `src/content/acasa.ts` (`CONSTRUCTOR`), ancora
// sectiunii e `ANCORE_ACASA.constructorul` (navigatia trimite la ea), iar lumea e `Lume.tsx`, adusa prin
// import dinamic. Tot comportamentul (tema inchisa, alinierea, antetul plecat, preluarea lumii, starea
// chestionarului) e in `ConstructorVedere.tsx`, care nu importa continut; editiile 3s.md au invelitoarele
// lor (`ConstructorEn.tsx`, `ConstructorRoMd.tsx`).

import { ANCORE_ACASA, CONSTRUCTOR } from "@/content/acasa";
import ConstructorVedere, { type ComponentaLume } from "./ConstructorVedere";

export { MARGINE_TEMA, PRAG_ALINIERE, PRAG_OPRIRE } from "./ConstructorVedere";

/** Lumea RO: modulul `Lume.tsx`, intr-o bucata JS separata (o functie stabila, la nivel de modul). */
function incarcaLumeaRo(): Promise<ComponentaLume> {
  return import("./Lume").then((m) => m.default);
}

export default function Constructor() {
  return <ConstructorVedere cap={CONSTRUCTOR} ancora={ANCORE_ACASA.constructorul} incarcaLumea={incarcaLumeaRo} />;
}
