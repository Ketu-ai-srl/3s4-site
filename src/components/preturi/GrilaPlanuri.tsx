"use client";

// Grila de planuri, INVELITOAREA RO: aceeasi cale, acelasi export si aceleasi proprietati ca inainte.
// Da lui `GrilaPlanuriVedere` planurile RO, randurile lor si textele grilei; vederea nu importa
// continut, iar alta editie isi are invelitoarea ei. Toate sumele sunt 0 RON (decizia D3), in ambele
// perioade; cardul recomandat e Starter, din datele planurilor. Butoanele duc la formularul de cont.

import { GRILA, PLANURI, randuriPlan, type Perioada } from "@/content/preturi";
import GrilaPlanuriVedere from "./GrilaPlanuriVedere";

export default function GrilaPlanuri({ perioada }: { perioada: Perioada }) {
  return <GrilaPlanuriVedere perioada={perioada} continut={GRILA} planuri={PLANURI} randuri={randuriPlan} />;
}
