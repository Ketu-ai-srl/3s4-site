// Starea analiticii si a consimtamantului: UN singur loc care decide daca bannerul, uneltele de masurare si
// legatura "Setari cookie-uri" exista pe site. Se decide la CONSTRUIRE, pe server.
//
// CONDITIA (planul valului S4, §8 si §9, decizia owner-ului din 24.09.2026; masurarea S-B, decizia 13 din
// 30.09.2026): bannerul exista numai cand exista AMANDOUA - un operator de date numit si complet
// (`config/operator.json` sau `OPERATOR_JSON`) si cel putin o unealta de masurare configurata: un ID GA4 in mediu
// (`NEXT_PUBLIC_GA4_ID`) SAU analitica proprie, Umami (`UMAMI_URL` si `UMAMI_WEBSITE_ID`,
// `src/components/analitica/config.ts`). Fara operator, nicio unealta nu porneste CHIAR CU ID: masurarea
// prelucreaza date personale (cookie-uri, adresa IP), iar fara operator nu are cine sa raspunda de ele. Fara
// nicio unealta nu exista nimic de consimtit, deci nici banner: un banner fara obiect ar fi o afirmatie falsa
// (plan §6.4).
//
// Si cand sunt pornite, uneltele se incarca DOAR dupa acceptul categoriei "statistica": GA4 in modul de baza al
// Consent Mode v2, Umami prin incarcatorul lui (`src/components/consimtamant/incarcator-umami.ts`); nicio cerere
// inainte de accept. Asta se intampla in browser, in `src/components/consimtamant/`; aici se decide numai ce
// exista. Consumatorii care citesc numai `.activa` (subsolul, middleware-ul evidentei, formularele, preturile)
// inteleg "bannerul exista", cu oricare unealta.

import { COOKIE_ALEGERE, ALEGERE_PANOU, furnizoriActivi, serviciiStatistica, type UnelteActive } from "@/content/juridic/furnizori";
import { stareAnaliticaProprie, type MediuAnalitica } from "@/components/analitica/config";
import { ETICHETA_NUMAI_CITIT, texteConsimtamant, type LimbaBanner } from "@/components/consimtamant/texte";
import { OPERATOR, lipsuriInformare, operatorComplet, type Operator } from "./operator";

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

/** Analitica proprie care ruleaza pe domeniu: identificatorul site-ului in Umami. */
export type UmamiActiv = { idSite: string };

export type StareAnalitica =
  | { activa: false; motiv: "fara-operator" | "operator-incomplet" | "fara-id" }
  | { activa: true; idGa4: string | null; umami: UmamiActiv | null };

/**
 * Decizia, pe intrari date: operatorul din comutator, ID-ul GA4 din mediu si mediul analiticii proprii.
 * `fara-id` = operator complet, dar nicio unealta configurata (nici GA4, nici Umami).
 */
export function stareAnalitica(
  operator: Operator | null = OPERATOR,
  id: string | null = idGa4(),
  mediu: MediuAnalitica = process.env,
): StareAnalitica {
  if (operator === null) {
    return { activa: false, motiv: "fara-operator" };
  }
  if (lipsuriInformare(operator).length > 0) {
    return { activa: false, motiv: "operator-incomplet" };
  }
  const proprie = stareAnaliticaProprie(mediu, operatorComplet(operator));
  const umami = proprie.activa ? { idSite: proprie.idSite } : null;
  if (id === null && umami === null) {
    return { activa: false, motiv: "fara-id" };
  }
  return { activa: true, idGa4: id, umami };
}

/** Uneltele care ruleaza, dintr-o stare pornita. */
export function unelteActive(stare: Extract<StareAnalitica, { activa: true }>): UnelteActive {
  return { ga4: stare.idGa4 !== null, umami: stare.umami !== null };
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
 * Versiunea informarii pe care o vede vizitatorul cand alege: textele bannerului si ale panoului, plus furnizorii
 * si cookie-urile declarate, pentru uneltele care RULEAZA si in limba paginii. Evidenta consimtamantului o poarta
 * pe fiecare rand, ca sa se poata dovedi CE text a vazut omul (EDPB, raportul pe bannere; GDPR art. 7 alin. (1)).
 * O schimbare de text, o unealta adaugata sau scoasa, sau alta limba dau o versiune noua, iar bannerul intreaba
 * din nou - fara pas manual. Prefixul e limba (`ro-`, `en-`), forma pe care o accepta evidenta (`evidenta.ts`).
 *
 * Romana cu GA4 singur (S-GA4) pastreaza FORMA intrarii de dinaintea masurarii S-B (aceleasi chei, nimic adaugat),
 * deci versiunea ei se schimba numai cand i se schimba textul. Textul s-a schimbat (descrierea bannerului numeste
 * acordul in a doua propozitie), deci si versiunea; setul nu e servit azi (GA4 nu ruleaza, decizia 26), asa ca
 * nimeni nu e intrebat din nou din cauza asta. Ce se adauga pentru Umami sau pentru engleza
 * (serviciile panoului, randul alegerii in limba lui, eticheta "numai citit") intra numai in starile acelea.
 */
export function versiuneInformare(limba: LimbaBanner, unelte: UnelteActive): string {
  const texte = texteConsimtamant(limba, unelte);
  const baza = { TEXTE_BANNER: texte.banner, TEXTE_PANOU: texte.panou, FURNIZORI: furnizoriActivi(unelte), COOKIE_ALEGERE };
  const intrare =
    limba === "ro" && !unelte.umami
      ? baza
      : {
          ...baza,
          PANOU: {
            alegere: ALEGERE_PANOU[limba],
            statistica: serviciiStatistica(unelte, limba),
            numaiCitit: ETICHETA_NUMAI_CITIT[limba],
          },
        };
  return limba + "-" + amprenta(JSON.stringify(intrare));
}

/** Versiunea starii S-GA4 in romana: aceeasi cu cea de dinaintea masurarii S-B (proba o compara). */
export const VERSIUNE_INFORMARE = versiuneInformare("ro", { ga4: true, umami: false });
