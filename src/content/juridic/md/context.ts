// Contextul din care se compune un document `md` (felia 73): operatorul, limba si starea masurarii, plus
// ajutoarele folosite de modulele convertite pentru elementele de lista si randurile de tabel conditionate
// (`daca`, `alese`) si pentru campurile firmei, in limba paginii (`campFirma`, `valoareCamp`).
//
// O SINGURA VALOARE PE CAMP, IN ROMANA (din extrasul din Registrul de stat, decizia 84 din 22.10.2026): pagina
// in alta limba arata echivalentul din `./echivalente.json`, pe camp si pe valoarea exacta (de pilda sediul,
// scris in romana cu forma municipiului, apare pe paginile EN in forma engleza). Acelasi fisier il citeste
// poarta juridica (L-01) cand cauta datele pe pagina de informatii legale a limbii. Modelul D2 de dinainte
// (marcajul pe campurile inca inexistente ale firmei) a iesit odata cu extrasul.
//
// Modulele convertite cer campurile prin `campFirma(c, camp)`, nu direct din context: poarta juridica
// (L-10) cauta un numar urmat de cuvantul care numeste firma la mai putin de 120 de caractere, iar
// identificatorii de camp ai registrului de stat ar fi declansat-o pe cod, fara nimic vizibil pe pagina.
//
// CONTACTUL SI DOMENIUL (felia contacte-din-canale): modulele nu mai scriu literal adresa de e-mail, telefonul si
// numele domeniului; le iau din `c.contact` si `c.domeniu`, construite de `../index.ts` din campurile firmei si
// din `SITE_URL`.
// Raman literale numerele autoritatilor si tabelele de destinatari (furnizorii DNS si ai postei unui domeniu
// anume), care asteapta juristul.

import echivalente from "./echivalente.json";
import type { CampOperator, Operator } from "@/lib/operator";
import type { Masurare } from "../masurare";
import type { ConditieMasurare, LimbaJuridica } from "../tipuri";

export type ContextMd = {
  operator: Operator;
  limba: LimbaJuridica;
  masurare: Masurare;
  /** Cheile de conditie active (din `masurare`, plus `linkedin` cand exista pagina). */
  active: ReadonlySet<ConditieMasurare>;
  /**
   * Contactul operatorului, asa cum il arata textele: adresa de e-mail si telefonul, din `OPERATOR_JSON`
   * (campurile `email` si `telefon`, neschimbate). Pe 3s.md sunt exact valorile scrise inainte literal in
   * module, deci textul randat ramane acelasi; pe alt domeniu vin din operatorul lui.
   */
  contact: { email: string; telefon: string };
  /**
   * Numele domeniului pe care e publicat site-ul, ca in "site-ul <domeniu>": gazda din `SITE_URL`
   * (adresa data constructorului, altfel `adresaSite()`). Destinatarii legati de un domeniu anume
   * (serviciul DNS, posta) NU se scriu prin el: sunt o diferenta de fond, nu de adresa.
   */
  domeniu: string;
};

/** Elementul, daca conditia e activa; altfel `null` (il scoate `alese`). */
export function daca<T>(c: ContextMd, conditie: ConditieMasurare, element: T): T | null {
  return c.active.has(conditie) ? element : null;
}

/** Elementele ramase dupa `daca`. */
export function alese<T>(elemente: readonly (T | null)[]): T[] {
  return elemente.filter((e): e is T => e !== null);
}

/** Forma de comparatie a unei valori: NFC, fara spatii la capete. */
const forma = (text: string): string => text.normalize("NFC").trim();

/**
 * Echivalentul valorii romanesti a unui camp in `limba`, din `./echivalente.json`, sau `null` cand nu exista
 * (romana nu are echivalente: valoarea ei e chiar cea din extras).
 */
export function echivalent(camp: CampOperator, valoare: string, limba: LimbaJuridica): string | null {
  if (limba === "ro") return null;
  const peLimba = (echivalente as Record<string, unknown>)[limba];
  const peCamp = typeof peLimba === "object" && peLimba !== null ? (peLimba as Record<string, unknown>)[camp] : undefined;
  if (typeof peCamp !== "object" || peCamp === null) return null;
  for (const [ro, tradus] of Object.entries(peCamp as Record<string, unknown>)) {
    if (typeof tradus === "string" && forma(ro) === forma(valoare)) return tradus;
  }
  return null;
}

/**
 * Valoarea unui camp al operatorului, in limba paginii: echivalentul din `./echivalente.json` cand exista
 * pentru valoarea EXACTA (NFC, fara spatii la capete); altfel valoarea, neschimbata.
 */
export function valoareCamp(operator: Operator, camp: CampOperator, limba: LimbaJuridica): string {
  const valoare = operator[camp];
  return echivalent(camp, valoare, limba) ?? valoare;
}

/** Campul firmei din context, in limba paginii (vezi `valoareCamp`). */
export function campFirma(c: ContextMd, camp: CampOperator): string {
  return valoareCamp(c.operator, camp, c.limba);
}
