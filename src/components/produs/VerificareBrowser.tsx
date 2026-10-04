"use client";

// Verificarea din browser (securitate.md §4; COMPONENTE §4.6), INVELITOAREA RO: aceeasi cale, acelasi
// export si aceleasi proprietati (niciuna) ca inainte. Ia textele si calea punctului de sanatate din
// modulul RO si randeaza `VerificareBrowserVedere`, care nu importa continut; alta editie isi are
// invelitoarea ei, pusa de pagina in slotul `verificare` al lui `PaginaSecuritate`.

import { CALE_SANATATE, VERIFICARE_BROWSER } from "@/content/produs/securitate";
import VerificareBrowserVedere from "./VerificareBrowserVedere";

export default function VerificareBrowser() {
  return <VerificareBrowserVedere continut={VERIFICARE_BROWSER} cale={CALE_SANATATE} />;
}
