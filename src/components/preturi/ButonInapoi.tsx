"use client";

// "Inapoi la variante", INVELITOAREA RO: aceeasi cale si acelasi export ca inainte. Intra in pagina prin
// `LiniaDeBaza` (componenta de server), nu prin pagina, deci alta editie isi pune butonul in slotul
// `inapoi` al liniei de baza. Aspectul si comportamentul sunt in `ButonInapoiVedere`.

import { ANCORE_PRETURI, LINIA_DE_BAZA } from "@/content/preturi";
import ButonInapoiVedere, { type ContinutButonInapoi } from "./ButonInapoiVedere";

const CONTINUT: ContinutButonInapoi = { text: LINIA_DE_BAZA.inapoi, ancoraPoarta: ANCORE_PRETURI.poarta };

export default function ButonInapoi() {
  return <ButonInapoiVedere continut={CONTINUT} />;
}
