"use client";

// Pliurile de sub pachete, INVELITOAREA RO: aceeasi cale, acelasi export si aceleasi proprietati ca
// inainte. Da lui `PliuriVedere` textele RO si biroul RO; vederea nu importa continut, iar alta editie
// isi are invelitoarea ei. Tabelul vine tot de pe server, din pagina (`TabelPlanuri`).

import type { ReactNode } from "react";
import { BIROU, COMPARATIE, ETICHETE_PRETURI } from "@/content/preturi";
import BirouInteractiv from "./BirouInteractiv";
import PliuriVedere, { type ContinutPliuri } from "./PliuriVedere";

const CONTINUT: ContinutPliuri = {
  eticheta: ETICHETE_PRETURI.pliuri,
  birou: { titlu: BIROU.titlu, paragraf: BIROU.paragraf },
  comparatie: { titlu: COMPARATIE.titlu, paragraf: COMPARATIE.paragraf },
};

export default function Pliuri({ tabel }: { tabel: ReactNode }) {
  return <PliuriVedere tabel={tabel} continut={CONTINUT} Birou={BirouInteractiv} />;
}
