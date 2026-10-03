"use client";

// Partea vie a functionalitatilor de pe start, INVELITOAREA RO: aceeasi cale, acelasi export si
// aceleasi proprietati ca inainte. Alege machetele romanesti si etichetele punctelor pistei si
// randeaza `PasiFunctionalitatiVedere`, care nu importa continut; alta editie isi are invelitoarea ei,
// pusa de pagina in slotul `pasi` al lui `FunctionalitatiAcasa`.

import type { ComponentType } from "react";
import type { PasFunctionalitate } from "@/content/acasa";
import { PUNCTE_PISTA } from "@/content/acasa-functionalitati";
import MachetaCautare, { type MachetaProps } from "./MachetaCautare";
import MachetaPortal from "./MachetaPortal";
import MachetaRegistru from "./MachetaRegistru";
import PasiFunctionalitatiVedere from "./PasiFunctionalitatiVedere";

export { SAMANTA_PANZA } from "./PasiFunctionalitatiVedere";

const MACHETE: ComponentType<MachetaProps>[] = [MachetaCautare, MachetaPortal, MachetaRegistru];

export default function PasiFunctionalitati({ pasi }: { pasi: PasFunctionalitate[] }) {
  return <PasiFunctionalitatiVedere pasi={pasi} machete={MACHETE} puncte={PUNCTE_PISTA} />;
}
