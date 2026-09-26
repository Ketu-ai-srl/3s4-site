// Datele comune panoului Descarca din antet si sub-vederii Descarca din sertar: grupurile filtrate
// pe caile existente, iconita fiecarei platforme si platforma detectata.
//
// Iconitele sunt GENERICE (setul Lucide): siglele sistemelor de operare sunt marci ale tertilor,
// iar la doua dintre ele numele producatorului e un cuvant pe care fabrica nu il scrie in depozit.

import {
  PANOU_DESCARCA,
  vizibile,
  type CaiExistente,
  type GrupDescarca,
  type PlatformaDescarca,
} from "@/content/navigatie";

export const ICONITA_PLATFORMA: Record<PlatformaDescarca, string> = {
  windows: "monitor",
  "macos-arm": "laptop",
  "macos-intel": "laptop",
  linux: "terminal",
  ios: "smartphone",
  android: "tablet-smartphone",
  web: "globe",
};

/** Grupurile cu cel putin un element vizibil; elementele fara tinta existenta se scot. */
export function grupuriVizibile(cai: CaiExistente): GrupDescarca[] {
  return PANOU_DESCARCA.grupuri
    .map((g) => ({ ...g, elemente: vizibile(g.elemente, cai) }))
    .filter((g) => g.elemente.length > 0);
}

/**
 * Platforma vizitatorului, dupa sirul agentului. `null` cand nu se poate spune. Se cheama numai in
 * navigator (dupa hidratare), ca HTML-ul servit sa fie acelasi pentru toti.
 */
export function detecteazaPlatforma(agent: string): PlatformaDescarca | null {
  const a = agent.toLowerCase();
  if (/iphone|ipad|ipod/.test(a)) return "ios";
  if (/android/.test(a)) return "android";
  if (/windows/.test(a)) return "windows";
  if (/mac os x|macintosh/.test(a)) return "macos-arm";
  if (/linux|x11/.test(a)) return "linux";
  return null;
}
