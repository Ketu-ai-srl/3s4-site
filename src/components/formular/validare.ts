// Validarea formularului de contact: ACEEASI functie in browser (inainte de trimitere) si pe server
// (in `src/app/api/formular/`), ca regula sa nu poata diverge intre cele doua.
//
// Campurile obligatorii sunt minimul fara de care nu se poate raspunde (GDPR art. 5 alin. (1)
// lit. c), gdprscan FORM-04): numele, adresa de e-mail si mesajul. Telefonul si firma sunt optionale,
// ca la referinta. Bifa de noutati e separata si neobligatorie (FORM-01..03, G-MD-07): valoarea ei
// nu schimba niciodata rezultatul validarii.

import type { Formular } from "@/components/consimtamant/evenimente";

/**
 * Tipurile de formular, aceleasi cu `FORMULARE` din lista inchisa de evenimente. Scrise aici, nu
 * importate: modulul evenimentelor trage dupa el codul analiticii, iar cu analitica oprita acel cod
 * nu are voie sa fie in JavaScript-ul paginii (proba comutatorului). Proba feliei cere egalitatea.
 */
export const TIPURI_FORMULAR = ["contact", "inregistrare", "enterprise"] as const satisfies readonly Formular[];

export const CAMPURI_TEXT = ["nume", "email", "telefon", "companie", "mesaj"] as const;
export type CampText = (typeof CAMPURI_TEXT)[number];

export const OBLIGATORII: readonly CampText[] = ["nume", "email", "mesaj"];

/** Lungimile maxime, in caractere. Un mesaj mai lung nu are ce cauta intr-un prim contact. */
export const LUNGIMI: Record<CampText, number> = {
  nume: 120,
  email: 254,
  telefon: 40,
  companie: 160,
  mesaj: 5000,
};

export type DateFormular = Record<CampText, string> & { marketing: boolean };

export type CodEroare = "lipsa" | "forma" | "lung";
export type Erori = Partial<Record<CampText, CodEroare>>;

/** O adresa de posta plauzibila: un singur @, fara spatii, cu punct in domeniu. */
const FORMA_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
/** Un numar de telefon: cifre, spatii, plus, paranteze, puncte si cratime; cel putin 6 cifre. */
const FORMA_TELEFON = /^[+()\d.\s-]*$/;

export function formaEmail(valoare: string): boolean {
  return FORMA_EMAIL.test(valoare.trim());
}

/** Erorile campurilor. Obiect gol = datele se pot trimite. */
export function valideaza(date: DateFormular): Erori {
  const erori: Erori = {};
  for (const camp of CAMPURI_TEXT) {
    const v = date[camp].trim();
    if (v === "") {
      if (OBLIGATORII.includes(camp)) erori[camp] = "lipsa";
      continue;
    }
    if (v.length > LUNGIMI[camp]) {
      erori[camp] = "lung";
      continue;
    }
    if (camp === "email" && !formaEmail(v)) erori[camp] = "forma";
    if (camp === "telefon" && (!FORMA_TELEFON.test(v) || v.replace(/\D/g, "").length < 6)) erori[camp] = "forma";
  }
  return erori;
}

/**
 * Campul-capcana (ascuns, 3S4-F-008): numele lui in HTML si cheia din corp. Un om nu il vede si nu
 * ajunge la el cu tastatura; un robot care completeaza tot ce gaseste il umple. Numele e unul pe
 * care completarea automata a navigatorului nu il recunoaste.
 */
export const CAMP_CAPCANA = "adresa_site";
/** Cheia duratei de completare din corp: milisecunde de la afisarea formularului la trimitere. */
export const CHEIE_DURATA = "durata";
/**
 * Sub atat timp de la afisarea formularului, serverul trateaza trimiterea ca pe a unui robot. Formularul
 * din pagina nu trimite niciodata sub prag: asteapta diferenta inainte de cerere (`asteptareInainteDeTrimitere`),
 * deci un om rapid (completare automata a navigatorului) nu pierde mesajul. Pragul prinde numai cererile
 * care declara singure o durata mai mica.
 */
export const DURATA_MINIMA_MS = 3_000;

/** Cat mai asteapta formularul inainte de cerere, ca durata trimisa sa nu fie sub prag. */
export function asteptareInainteDeTrimitere(durata: number): number {
  return Math.max(0, DURATA_MINIMA_MS - durata);
}

export type CorpCitit = {
  formular: Formular;
  date: DateFormular;
  /** Valoarea campului-capcana; sir gol cand lipseste. */
  capcana: string;
  /** Durata de completare, in milisecunde, sau `null` cand clientul nu a trimis-o. */
  durata: number | null;
};

/**
 * Corpul unei cereri, citit pe server: exact cheile asteptate, fiecare cu tipul ei. Orice alta
 * forma intoarce `null` (cererea se respinge fara sa fie citita mai departe). Capcana si durata sunt
 * optionale: formularul de cont (felia conversie) nu le trimite inca.
 */
export function citesteCorp(corp: unknown): CorpCitit | null {
  if (typeof corp !== "object" || corp === null || Array.isArray(corp)) return null;
  const o = corp as Record<string, unknown>;
  const permise = new Set<string>([...CAMPURI_TEXT, "marketing", "formular", CAMP_CAPCANA, CHEIE_DURATA]);
  if (Object.keys(o).some((k) => !permise.has(k))) return null;
  if (typeof o.formular !== "string" || !(TIPURI_FORMULAR as readonly string[]).includes(o.formular)) return null;
  const date = { marketing: o.marketing === true } as DateFormular;
  if (o.marketing !== undefined && typeof o.marketing !== "boolean") return null;
  for (const camp of CAMPURI_TEXT) {
    const v = o[camp] ?? "";
    if (typeof v !== "string") return null;
    date[camp] = v;
  }
  const capcana = o[CAMP_CAPCANA] ?? "";
  if (typeof capcana !== "string") return null;
  const durata = o[CHEIE_DURATA];
  if (durata !== undefined && (typeof durata !== "number" || !Number.isFinite(durata) || durata < 0)) return null;
  return { formular: o.formular as Formular, date, capcana, durata: durata === undefined ? null : durata };
}
