// Contextul din care se compune un document `md` (felia 73): operatorul, limba si starea masurarii, plus
// ajutoarele folosite de modulele convertite pentru elementele de lista si randurile de tabel conditionate
// (`daca`, `alese`) si pentru campurile firmei care inca nu exista (`campFirma`, `valoareCamp`, modelul D2).
//
// MODELUL D2 (decizia din 30.09.2026): firma are o singura valoare pe camp, in romana, iar pagina EN arata
// marcajul englezesc. Pana la extrasul din Registrul de stat, campurile admise poarta marcajul D2; lista lor
// si marcajele stau in `config/model-d2.json`, citit si de poarta juridica.
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

import modelD2 from "../../../../config/model-d2.json";
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

/** Marcajul D2 al limbii, din `config/model-d2.json`. */
export function marcajD2(limba: LimbaJuridica): string {
  return modelD2.marcaj[limba];
}

/** Campurile carora modelul D2 le admite marcajul. */
export const CAMPURI_D2: readonly string[] = modelD2.campuri;

/**
 * Valoarea unui camp al operatorului, in limba paginii: cand valoarea (NFC, fara spatii la capete) e
 * EXACT marcajul D2 romanesc si campul e unul admis, marcajul limbii; altfel valoarea, neschimbata.
 */
export function valoareCamp(operator: Operator, camp: CampOperator, limba: LimbaJuridica): string {
  const valoare = operator[camp];
  if (CAMPURI_D2.includes(camp) && valoare.normalize("NFC").trim() === marcajD2("ro").normalize("NFC")) {
    return marcajD2(limba);
  }
  return valoare;
}

/** Campul firmei din context, in limba paginii (vezi `valoareCamp`). */
export function campFirma(c: ContextMd, camp: CampOperator): string {
  return valoareCamp(c.operator, camp, c.limba);
}
