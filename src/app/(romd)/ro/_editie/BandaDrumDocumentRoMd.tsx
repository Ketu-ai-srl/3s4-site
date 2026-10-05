"use client";

// Banda cu drumul unui document, INVELITOAREA ro-MD (decizia 53): aceeasi vedere ca pe RO si pe EN
// (`BandaDrumDocumentVedere`), cu textele editiei din `src/content/ro-md/enterprise-componente.ts`. Nu importa niciun
// continut RO. Sta langa paginile /ro (dosar privat al rutelor), nu in `src/components`: e intrarea editiei, nu o piesa.

import BandaDrumDocumentVedere from "@/components/enterprise/BandaDrumDocumentVedere";
import { DRUM_DOCUMENT_RO_MD } from "@/content/ro-md/enterprise-componente";

export default function BandaDrumDocumentRoMd() {
  return <BandaDrumDocumentVedere continut={DRUM_DOCUMENT_RO_MD} />;
}
