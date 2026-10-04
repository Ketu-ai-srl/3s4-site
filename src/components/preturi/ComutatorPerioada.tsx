"use client";

// Comutatorul lunar / anual, INVELITOAREA RO: aceeasi cale, acelasi export si aceleasi proprietati ca
// inainte. Da textele RO lui `ComutatorPerioadaVedere`, care nu importa continut; alta editie isi are
// invelitoarea ei. Pastila, indicatorul si insigna sunt descrise in vedere.

import { COMUTATOR, type Perioada } from "@/content/preturi";
import ComutatorPerioadaVedere from "./ComutatorPerioadaVedere";

export default function ComutatorPerioada({
  perioada,
  laSchimbare,
}: {
  perioada: Perioada;
  laSchimbare: (p: Perioada) => void;
}) {
  return <ComutatorPerioadaVedere perioada={perioada} laSchimbare={laSchimbare} continut={COMUTATOR} />;
}
