"use client";

// S3 - frustrarea, INVELITOAREA EN (editia `en` a lui 3s.md, pagina `/features/search`): ia textele din modulul EN
// al paginii si randeaza aceeasi vedere ca pagina RO. Nu importa nimic din continutul RO.

import { FRUSTRARE_POVESTE } from "@/content/en/features-search";
import FrustrareVedere from "./FrustrareVedere";

export default function FrustrareEn() {
  return <FrustrareVedere continut={FRUSTRARE_POVESTE} />;
}
