"use client";

// S3 - frustrarea (functionalitati__cautare-ai.md, S3), INVELITOAREA RO: aceeasi cale, acelasi export si aceleasi
// proprietati (niciuna) ca inainte. Ia textele din modulul RO si randeaza `FrustrareVedere`, care nu importa
// continut; editia `en` are invelitoarea ei (`FrustrareEn`), pusa direct de pagina EN.

import { FRUSTRARE } from "@/content/functionalitati/cautare-ai";
import FrustrareVedere from "./FrustrareVedere";

export { formatTimp } from "./FrustrareVedere";

export default function Frustrare() {
  return <FrustrareVedere continut={FRUSTRARE} />;
}
