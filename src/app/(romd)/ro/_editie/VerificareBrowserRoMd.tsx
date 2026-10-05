"use client";

// Verificarea din browser, INVELITOAREA ro-MD (pagina `/ro/securitate` a lui 3s.md): aceeasi vedere ca pe RO si pe EN
// (`VerificareBrowserVedere`), cu textele editiei din `src/content/ro-md/securitate-componente.ts`, care spun ca se
// masoara conexiunea la acest site, nu platforma (intrebarea 9, decizia 59). Invelitoarea RO nu se incarca pe /ro.

import VerificareBrowserVedere from "@/components/produs/VerificareBrowserVedere";
import { CALE_SANATATE_RO_MD, VERIFICARE_RO_MD } from "@/content/ro-md/securitate-componente";

export default function VerificareBrowserRoMd() {
  return <VerificareBrowserVedere continut={VERIFICARE_RO_MD} cale={CALE_SANATATE_RO_MD} />;
}
