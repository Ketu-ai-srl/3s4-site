"use client";

// S3 - frustrarea, INVELITOAREA ro-MD (pagina `/ro/functionalitati/cautare-ai` a lui 3s.md): ia textele din modulul
// ro-MD al paginii si randeaza aceeasi vedere ca paginile RO si EN. Nu importa nimic din continutul RO.

import FrustrareVedere from "@/components/functionalitati/cautare-ai/FrustrareVedere";
import { FRUSTRARE_CAUTARE_RO_MD } from "@/content/ro-md/cautare-ai-componente";

export default function FrustrareRoMd() {
  return <FrustrareVedere continut={FRUSTRARE_CAUTARE_RO_MD} />;
}
