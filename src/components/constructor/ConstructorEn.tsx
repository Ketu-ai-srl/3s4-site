"use client";

// Constructorul de pe start, INVELITOAREA editiei `en` (3s.md, decizia 59, forma (a) a intrebarii 2):
// aceeasi vedere ca pe RO (`ConstructorVedere`), cu capul in engleza (`src/content/en/acasa-constructor-cap-componente.ts`)
// si lumea editiei (`ConstructorLumeEn.tsx`, adusa lenes, cu scenele in engleza). Pagina EN o monteaza in
// locul pe care il are `Constructor` in compunerea RO si ii da legatura WhatsApp a paginii, rezolvata pe
// server: butonul final al panoului si CTA-ul estimarii duc acolo (decizia 3: fara cont si fara formular).
//
// Nu importa nimic din continutul RO, ca acesta (cu sumele in lei) sa nu intre in pachetul paginilor 3s.md.

import { CAP_CONSTRUCTOR_EN } from "@/content/en/acasa-constructor-cap-componente";
import ConstructorVedere, { type ComponentaLume } from "./ConstructorVedere";

/** Ancora sectiunii: aceeasi ca pe RO. */
const ANCORA = "constructor";

function incarcaLumeaEn(): Promise<ComponentaLume> {
  return import("./ConstructorLumeEn").then((m) => m.default);
}

export default function ConstructorEn({ tinta }: { tinta: string | null }) {
  return <ConstructorVedere cap={CAP_CONSTRUCTOR_EN} ancora={ANCORA} incarcaLumea={incarcaLumeaEn} tinta={tinta} />;
}
