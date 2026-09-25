// Starea analiticii si a consimtamantului: UN singur loc care decide daca bannerul, GA4 si legatura
// "Setari cookie-uri" exista pe site. Se decide la CONSTRUIRE, pe server.
//
// CONDITIA (planul valului S4, §8 si §9, decizia owner-ului din 24.09.2026): analitica porneste
// numai cand exista AMANDOUA - un operator de date numit si complet (`config/operator.json`) si un
// ID de masurare GA4 in mediu (`NEXT_PUBLIC_GA4_ID`). Fara operator, GA4 ramane oprit CHIAR CU ID:
// analitica prelucreaza date personale (cookie-uri, adresa IP), iar fara operator nu are cine sa
// raspunda de ele. Fara ID nu exista nimic de consimtit, deci nici banner: un banner fara obiect ar
// fi o afirmatie falsa (plan §6.4).
//
// Si cand e pornita, GA4 se incarca DOAR dupa acceptul categoriei "statistica" (modul de baza al
// Consent Mode v2: nicio cerere catre Google inainte de accept). Asta se intampla in browser, in
// `src/components/consimtamant/`; aici se decide numai daca piesa exista.

import { COOKIE_ALEGERE, FURNIZORI } from "@/content/juridic/furnizori";
import { TEXTE_BANNER, TEXTE_PANOU } from "@/components/consimtamant/texte";
import { OPERATOR, lipsuriInformare, type Operator } from "./operator";

/** Forma unui ID de masurare GA4: `G-` si litere mari sau cifre. */
const FORMA_ID_GA4 = /^G-[A-Z0-9]{4,20}$/;

/** ID-ul GA4 din mediu, sau `null` cand lipseste. Arunca pe o valoare care nu arata a ID. */
export function idGa4(valoare: string | undefined = process.env.NEXT_PUBLIC_GA4_ID): string | null {
  const v = (valoare ?? "").trim();
  if (v === "") {
    return null;
  }
  if (!FORMA_ID_GA4.test(v)) {
    throw new Error('NEXT_PUBLIC_GA4_ID trebuie sa aiba forma G-XXXXXXXX, nu "' + v + '"');
  }
  return v;
}

export type StareAnalitica =
  | { activa: false; motiv: "fara-operator" | "operator-incomplet" | "fara-id" }
  | { activa: true; idGa4: string };

/** Decizia, pe intrari date: operatorul din comutator si ID-ul din mediu. */
export function stareAnalitica(operator: Operator | null = OPERATOR, id: string | null = idGa4()): StareAnalitica {
  if (operator === null) {
    return { activa: false, motiv: "fara-operator" };
  }
  if (lipsuriInformare(operator).length > 0) {
    return { activa: false, motiv: "operator-incomplet" };
  }
  if (id === null) {
    return { activa: false, motiv: "fara-id" };
  }
  return { activa: true, idGa4: id };
}

/**
 * Amprenta unui text (FNV-1a pe 32 de biti), ca sir hexazecimal de 8 caractere. Nu e criptografie:
 * e o eticheta care se schimba cand se schimba textul, calculata la fel oriunde ruleaza.
 */
export function amprenta(text: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h.toString(16).padStart(8, "0");
}

/**
 * Versiunea informarii pe care o vede vizitatorul cand alege: textele bannerului si ale panoului,
 * plus furnizorii si cookie-urile declarate. Evidenta consimtamantului o poarta pe fiecare rand,
 * ca sa se poata dovedi CE text a vazut omul (EDPB, raportul pe bannere; GDPR art. 7 alin. (1)).
 * O schimbare de text da o versiune noua, iar bannerul intreaba din nou - fara pas manual.
 */
export const VERSIUNE_INFORMARE =
  "ro-" + amprenta(JSON.stringify({ TEXTE_BANNER, TEXTE_PANOU, FURNIZORI, COOKIE_ALEGERE }));
