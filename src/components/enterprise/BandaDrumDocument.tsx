"use client";

// Banda inchisa cu drumul unui document (enterprise.md §2, COMPONENTE §4.7), INVELITOAREA RO:
// aceeasi cale, acelasi export si aceleasi proprietati (niciuna) ca inainte. Ia continutul din modulul
// RO si randeaza `BandaDrumDocumentVedere`, care nu importa continut; alta editie isi are invelitoarea
// ei, care importa textele editiei. Bucla, pasii si starea statica sunt descrise in vedere.

import { DRUM_DOCUMENT } from "@/content/enterprise";
import BandaDrumDocumentVedere from "./BandaDrumDocumentVedere";

export { asteptare, DURATA_BUCLA, MOMENTE_PASI, PAS_FINAL, REVENIRE_MS } from "./BandaDrumDocumentVedere";

export default function BandaDrumDocument() {
  return <BandaDrumDocumentVedere continut={DRUM_DOCUMENT} />;
}
