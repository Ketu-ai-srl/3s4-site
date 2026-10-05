"use client";

// Banda cu drumul unui document, INVELITOAREA EN (decizia 53): aceeasi vedere ca pe RO (`BandaDrumDocumentVedere`),
// cu textele editiei `en` din `src/content/en/enterprise-componente.ts`. Nu importa niciun continut RO.

import { DRUM_DOCUMENT_EN } from "@/content/en/enterprise-componente";
import BandaDrumDocumentVedere from "./BandaDrumDocumentVedere";

export default function BandaDrumDocumentEn() {
  return <BandaDrumDocumentVedere continut={DRUM_DOCUMENT_EN} />;
}
