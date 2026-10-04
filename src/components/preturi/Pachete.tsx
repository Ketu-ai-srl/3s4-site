"use client";

// Pachetele, INVELITOAREA RO: aceeasi cale, acelasi export si aceleasi proprietati ca inainte. Alege
// piesele RO (calculatorul, comutatorul, grila, lista ca PDF, fiecare cu textele lui) si randeaza
// `PacheteVedere`, care nu importa continut; alta editie isi are invelitoarea ei.

import { ANCORE_PRETURI, GRILA } from "@/content/preturi";
import Calculator from "./Calculator";
import ComutatorPerioada from "./ComutatorPerioada";
import GrilaPlanuri from "./GrilaPlanuri";
import ListaPdf from "./ListaPdf";
import PacheteVedere, { type PiesePachete } from "./PacheteVedere";

const PIESE: PiesePachete = { Calculator, Comutator: ComutatorPerioada, Grila: GrilaPlanuri, ListaPdf };

export default function Pachete({ gazda, analitica }: { gazda: string; analitica: boolean }) {
  return <PacheteVedere gazda={gazda} analitica={analitica} ancora={ANCORE_PRETURI.pachete} eticheta={GRILA.eticheta} piese={PIESE} />;
}
