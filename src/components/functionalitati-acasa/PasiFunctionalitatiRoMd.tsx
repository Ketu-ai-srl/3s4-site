"use client";

// Partea vie a functionalitatilor de pe start, INVELITOAREA editiei `ro-MD` (decizia 53): aceeasi vedere ca pe RO si
// pe EN (`PasiFunctionalitatiVedere`), cu pasii, machetele si etichetele pistei in romana editiei, din
// `src/content/ro-md/acasa-componente.ts`. Pagina `/ro` o pune in slotul `pasi` al lui `FunctionalitatiAcasa`.
//
// Machetele: cautarea (pasul 1) si dosarul cu termenul lui (pasul 3), prin vederile lor. Pasul 2 n-are macheta:
// macheta portalului clientilor nu se monteaza pe 3s.md (decizia 43); in locul ei sta vizualul fara cuvinte al
// dosarelor (`MachetaDosare.tsx`), acelasi pe toate editiile 3s.md.
//
// Nu importa nimic din continutul RO, ca acesta sa nu intre in pachetul paginilor 3s.md.

import type { ComponentType } from "react";
import {
  ETICHETA_EXEMPLU_RO_MD,
  MACHETA_CAUTARE_RO_MD,
  MACHETA_REGISTRU_RO_MD,
  PASI_RO_MD,
  PUNCTE_PISTA_RO_MD,
} from "@/content/ro-md/acasa-componente";
import MachetaCautareVedere, { type ContinutMachetaCautare, type MachetaProps } from "./MachetaCautareVedere";
import MachetaDosare from "./MachetaDosare";
import MachetaRegistruVedere, { type ContinutMachetaRegistru } from "./MachetaRegistruVedere";
import PasiFunctionalitatiVedere from "./PasiFunctionalitatiVedere";

/** Bifa din insigna verde a rezumatului: acelasi caracter de text ca pe RO, urmat de un spatiu. */
const BIFA = "✓ ";

const CAUTARE: ContinutMachetaCautare = { ...MACHETA_CAUTARE_RO_MD, exemplu: ETICHETA_EXEMPLU_RO_MD, bifa: BIFA };
const REGISTRU: ContinutMachetaRegistru = { ...MACHETA_REGISTRU_RO_MD, exemplu: ETICHETA_EXEMPLU_RO_MD };

function MachetaCautareRoMd(props: MachetaProps) {
  return <MachetaCautareVedere {...props} continut={CAUTARE} />;
}

function MachetaRegistruRoMd(props: MachetaProps) {
  return <MachetaRegistruVedere {...props} continut={REGISTRU} />;
}

const MACHETE: (ComponentType<MachetaProps> | undefined)[] = [MachetaCautareRoMd, MachetaDosare, MachetaRegistruRoMd];

export default function PasiFunctionalitatiRoMd() {
  return <PasiFunctionalitatiVedere pasi={PASI_RO_MD} machete={MACHETE} puncte={PUNCTE_PISTA_RO_MD} />;
}
