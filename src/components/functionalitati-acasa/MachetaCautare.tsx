"use client";

// Macheta pasului 1 (fisa §5), INVELITOAREA RO: aceeasi cale, acelasi export si aceleasi proprietati
// ca inainte, cu textele din continutul romanesc. Desenul si comportamentul sunt in
// `MachetaCautareVedere.tsx`, care nu importa continut; alta editie isi are invelitoarea ei.

import { BIFA_TEXT, ETICHETA_EXEMPLU, MACHETA_CAUTARE } from "@/content/acasa-functionalitati";
import MachetaCautareVedere, { type ContinutMachetaCautare, type MachetaProps } from "./MachetaCautareVedere";

export {
  deplasareRand,
  INTARZIERE_CAUTARE,
  MARGINE_FOCUS,
  PAUZA_DUPA_ALEGERE,
  PERIOADA_RANDURI,
  type ContinutMachetaCautare,
  type MachetaProps,
} from "./MachetaCautareVedere";

const CONTINUT: ContinutMachetaCautare = { ...MACHETA_CAUTARE, exemplu: ETICHETA_EXEMPLU, bifa: BIFA_TEXT };

export default function MachetaCautare(props: MachetaProps) {
  return <MachetaCautareVedere {...props} continut={CONTINUT} />;
}
