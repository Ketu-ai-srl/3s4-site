// FAMILIA TEXTELOR JURIDICE, dupa jurisdictia operatorului de date (felia 73, valul S4-10).
//
// Doua familii de texte, alese dupa tara operatorului:
//   - `see`: operator cu sediul in Spatiul Economic European. Textele de azi (confidentialitate.ts,
//     cookie-uri.ts, mentiuni-legale.ts si celelalte), neschimbate;
//   - `md`: operator din Republica Moldova. Cele 8 documente din `./md/`, in romana si in engleza.
// Orice alta tara OPRESTE construirea: pentru un operator din afara SEE si din afara Moldovei nu avem
// texte, iar Legea 195/2024 art. 27 i-ar cere un reprezentant in Republica Moldova, cu datele lui in
// politica (mesajul e cel dinaintea feliei, mutat aici din `verificaOperatorPentruTexte`).
//
// DE CE MODULUL E MIC SI NU IMPORTA `@/lib/operator`. Il importa si `./publicare.ts`, care ajunge in
// pachetul de browser (antetul, paleta de cautare): lista de rute juridice difera intre familii, deci
// browserul trebuie sa stie familia. O afla din `NEXT_PUBLIC_FAMILIE_JURIDICA`, calculata in
// `next.config.ts` din operatorul rezolvat si inlocuita de Next in toate pachetele; expresia se scrie
// LITERAL in `publicare.ts` (acelasi tipar ca `NEXT_PUBLIC_OPERATOR_NUMIT`, `src/lib/operator-mediu.ts`).

import type { Operator } from "../../lib/operator";
import { configurareOperatorDinMediu } from "../../lib/operator-mediu";

export type FamilieJuridica = "see" | "md";

/** Numele variabilei calculate de `next.config.ts`: "see", "md" sau "null" (niciun operator complet). */
export const VARIABILA_FAMILIE_JURIDICA = "NEXT_PUBLIC_FAMILIE_JURIDICA";

/** Statele Spatiului Economic European, cum le scrie un om (fara diacritice, litere mici). */
const TARI_SEE = [
  "austria", "belgia", "bulgaria", "cehia", "cipru", "croatia", "danemarca", "estonia", "finlanda",
  "franta", "germania", "grecia", "irlanda", "islanda", "italia", "letonia", "liechtenstein",
  "lituania", "luxemburg", "malta", "norvegia", "olanda", "tarile de jos", "polonia", "portugalia",
  "romania", "slovacia", "slovenia", "spania", "suedia", "ungaria",
];

/** Numele Republicii Moldova admise in campul `tara`: lista INCHISA, dupa normalizare. */
export const TARI_MD = ["republica moldova", "moldova"] as const;

/** Litere mici, fara diacritice, spatii simple, fara spatii la capete. */
export function normalizeazaTara(text: string): string {
  return text.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/\s+/g, " ").trim().toLowerCase();
}

/** Tara operatorului e in SEE: atunci nu e nevoie de reprezentant in Republica Moldova. */
export function inSee(tara: string): boolean {
  return TARI_SEE.includes(normalizeazaTara(tara));
}

/** Familia pentru o tara, sau `null` cand nu avem texte pentru ea. Nu arunca: ruleaza si in browser. */
export function familieDinTara(tara: string): FamilieJuridica | null {
  if (inSee(tara)) return "see";
  if ((TARI_MD as readonly string[]).includes(normalizeazaTara(tara))) return "md";
  return null;
}

/** Mesajul pentru un operator fara familie (textul dinaintea feliei 73, neschimbat). */
export const MESAJ_FARA_FAMILIE =
  "operatorul nu are sediul in SEE: Legea 195/2024 art. 27 cere atunci un reprezentant in Republica Moldova, cu datele lui in politica";

/** Familia textelor pentru operatorul dat. OPRESTE construirea pe o tara din afara SEE si a Moldovei. */
export function familieJuridica(operator: Operator): FamilieJuridica {
  const familie = familieDinTara(operator.tara);
  if (familie === null) {
    throw new Error(MESAJ_FARA_FAMILIE + ' (tara: "' + operator.tara + '")');
  }
  return familie;
}

/**
 * Valoarea lui `NEXT_PUBLIC_FAMILIE_JURIDICA`, ca raspuns: "see" / "md" -> familia, "null" -> nicio familie
 * (fara operator complet). Orice alta valoare, sau lipsa ei, da `undefined`: atunci decide ce era inainte
 * (variabila `OPERATOR_JSON`, apoi fisierul). Nu arunca: ruleaza si in pachetul de browser.
 */
export function citesteFamilie(valoare: string | undefined): FamilieJuridica | null | undefined {
  if (valoare === "see" || valoare === "md") return valoare;
  if (valoare === "null") return null;
  return undefined;
}

/** Familia operatorului dintr-o configurare cu cheia `operator` (fisierul sau `OPERATOR_JSON`), fara validare. */
export function familieDinConfigurare(cfg: unknown): FamilieJuridica | null {
  if (typeof cfg !== "object" || cfg === null || !("operator" in cfg)) return null;
  const operator = (cfg as { operator: unknown }).operator;
  if (typeof operator !== "object" || operator === null) return null;
  const tara = (operator as { tara?: unknown }).tara;
  return typeof tara === "string" ? familieDinTara(tara) : null;
}

/** Familia din `OPERATOR_JSON`: `undefined` cand variabila nu e setata (atunci decide fisierul). */
export function familieInMediu(valoare: string | undefined = process.env.OPERATOR_JSON): FamilieJuridica | null | undefined {
  const dinMediu = configurareOperatorDinMediu(valoare);
  return dinMediu === null ? undefined : familieDinConfigurare(dinMediu.configurare);
}
