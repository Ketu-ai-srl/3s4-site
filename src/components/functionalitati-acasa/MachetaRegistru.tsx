"use client";

// Macheta pasului 3 (fisa §7), INVELITOAREA RO: aceeasi cale, acelasi export si aceleasi proprietati
// ca inainte, cu textele din continutul romanesc. Desenul si comportamentul sunt in
// `MachetaRegistruVedere.tsx`, care nu importa continut.

import { ETICHETA_EXEMPLU, MACHETA_REGISTRU } from "@/content/acasa-functionalitati";
import type { MachetaProps } from "./MachetaCautareVedere";
import MachetaRegistruVedere, { type ContinutMachetaRegistru } from "./MachetaRegistruVedere";

export {
  INTARZIERE_VERIFICARI,
  PERIOADA_VERIFICARI,
  type ContinutMachetaRegistru,
} from "./MachetaRegistruVedere";

const CONTINUT: ContinutMachetaRegistru = { ...MACHETA_REGISTRU, exemplu: ETICHETA_EXEMPLU };

export default function MachetaRegistru(props: MachetaProps) {
  return <MachetaRegistruVedere {...props} continut={CONTINUT} />;
}
