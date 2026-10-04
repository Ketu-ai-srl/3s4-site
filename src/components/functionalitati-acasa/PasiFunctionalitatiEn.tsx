"use client";

// Partea vie a functionalitatilor de pe start, INVELITOAREA editiei `en` (decizia 53): aceeasi vedere ca pe RO
// (`PasiFunctionalitatiVedere`), cu pasii, machetele si etichetele pistei in engleza, din
// `src/content/en/acasa-componente.ts`. Pagina EN o pune in slotul `pasi` al lui `FunctionalitatiAcasa`.
//
// Machetele: cautarea (pasul 1) si registrul (pasul 3), prin vederile lor, cu textele EN. Pasul 2 n-are macheta:
// macheta portalului clientilor nu se monteaza pe 3s.md (decizia 43), iar vederea lasa locul gol.
//
// Nu importa nimic din continutul RO, ca acesta sa nu intre in pachetul paginilor 3s.md.

import type { ComponentType } from "react";
import {
  ETICHETA_EXEMPLU_EN,
  MACHETA_CAUTARE_EN,
  MACHETA_REGISTRU_EN,
  PASI_EN,
  PUNCTE_PISTA_EN,
} from "@/content/en/acasa-componente";
import MachetaCautareVedere, { type ContinutMachetaCautare, type MachetaProps } from "./MachetaCautareVedere";
import MachetaRegistruVedere, { type ContinutMachetaRegistru } from "./MachetaRegistruVedere";
import PasiFunctionalitatiVedere from "./PasiFunctionalitatiVedere";

/** Bifa din insigna verde a rezumatului: acelasi caracter de text ca pe RO, urmat de un spatiu. */
const BIFA = "✓ ";

const CAUTARE: ContinutMachetaCautare = { ...MACHETA_CAUTARE_EN, exemplu: ETICHETA_EXEMPLU_EN, bifa: BIFA };
const REGISTRU: ContinutMachetaRegistru = { ...MACHETA_REGISTRU_EN, exemplu: ETICHETA_EXEMPLU_EN };

function MachetaCautareEn(props: MachetaProps) {
  return <MachetaCautareVedere {...props} continut={CAUTARE} />;
}

function MachetaRegistruEn(props: MachetaProps) {
  return <MachetaRegistruVedere {...props} continut={REGISTRU} />;
}

const MACHETE: (ComponentType<MachetaProps> | undefined)[] = [MachetaCautareEn, undefined, MachetaRegistruEn];

export default function PasiFunctionalitatiEn() {
  return <PasiFunctionalitatiVedere pasi={PASI_EN} machete={MACHETE} puncte={PUNCTE_PISTA_EN} />;
}
