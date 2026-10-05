"use client";

// Verificarea din browser, INVELITOAREA EN (pagina `/about` a lui 3s.md): aceeasi vedere ca pe RO
// (`VerificareBrowserVedere`), cu textele editiei EN din `src/content/en/despre-componente.ts`, care spun ca se
// masoara conexiunea la acest site, nu platforma (intrebarea 9 a specificatiei de congruenta, decizia 59). Pagina o
// pune in slotul `verificare` al lui `PaginaSecuritate`; invelitoarea RO (`VerificareBrowser`) nu se incarca pe EN.

import { CALE_SANATATE_EN, VERIFICARE_EN } from "@/content/en/despre-componente";
import VerificareBrowserVedere from "./VerificareBrowserVedere";

export default function VerificareBrowserEn() {
  return <VerificareBrowserVedere continut={VERIFICARE_EN} cale={CALE_SANATATE_EN} />;
}
