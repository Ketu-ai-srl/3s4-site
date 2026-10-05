"use client";

// Constructorul de pe start, INVELITOAREA editiei `ro-MD` (`/ro` pe 3s.md, decizia 59, forma (a) a
// intrebarii 2): aceeasi vedere ca pe RO (`ConstructorVedere`), cu capul in romana editiei
// (`src/content/ro-md/acasa-constructor-cap-componente.ts`) si lumea editiei (`ConstructorLumeRoMd.tsx`, adusa lenes).
// Se monteaza pe /ro cand pagina compune startul RO (pana atunci /ro e randata prin `CorpPagina` si nu are
// constructor), in locul pe care il are `Constructor` in compunerea RO, cu legatura WhatsApp a paginii,
// rezolvata pe server: butonul final al panoului si CTA-ul estimarii duc acolo (decizia 3: fara cont si
// fara formular pe 3s.md).
//
// Nu importa nimic din continutul RO, ca acesta (cu sumele in lei) sa nu intre in pachetul paginilor 3s.md.

import { CAP_CONSTRUCTOR_RO_MD } from "@/content/ro-md/acasa-constructor-cap-componente";
import ConstructorVedere, { type ComponentaLume } from "./ConstructorVedere";

/** Ancora sectiunii: aceeasi ca pe RO. */
const ANCORA = "constructor";

function incarcaLumeaRoMd(): Promise<ComponentaLume> {
  return import("./ConstructorLumeRoMd").then((m) => m.default);
}

export default function ConstructorRoMd({ tinta }: { tinta: string | null }) {
  return <ConstructorVedere cap={CAP_CONSTRUCTOR_RO_MD} ancora={ANCORA} incarcaLumea={incarcaLumeaRoMd} tinta={tinta} />;
}
