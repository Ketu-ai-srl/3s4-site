"use client";

// Lumea preturilor, INVELITOAREA RO: aceeasi cale, acelasi export si aceleasi proprietati ca inainte.
// Construieste continutul din modulul RO si randeaza `LumeaPreturiVedere`, care nu importa continut;
// alta editie isi are invelitoarea ei. Comportamentul (poarta, plecarea, ancora `#pachete`, "inapoi")
// e descris in vedere.

import type { ReactNode } from "react";
import type { CaiExistente } from "@/content/navigatie";
import { ANCORE_PRETURI, ETICHETE_PRETURI, POARTA_BAZA, POARTA_ENTERPRISE } from "@/content/preturi";
import LumeaPreturiVedere, { type ContinutLumeaPreturi } from "./LumeaPreturiVedere";

export { clicModificat, useInapoi } from "./contextLume";

const CONTINUT: ContinutLumeaPreturi = {
  ancore: { pachete: ANCORE_PRETURI.pachete, poarta: ANCORE_PRETURI.poarta },
  etichetaPoarta: ETICHETE_PRETURI.poarta,
  baza: POARTA_BAZA,
  enterprise: POARTA_ENTERPRISE,
};

export default function LumeaPreturi({
  lume,
  cai,
}: {
  lume: ReactNode;
  /** Caile existente, transmise lui `Tinta`; implicit cele ale site-ului. Parametru numai pentru probe. */
  cai?: CaiExistente;
}) {
  return <LumeaPreturiVedere lume={lume} cai={cai} continut={CONTINUT} />;
}
