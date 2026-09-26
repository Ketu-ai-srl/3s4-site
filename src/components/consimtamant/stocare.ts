// Alegerea din banner, pastrata in browserul vizitatorului (stocare locala, cheia de mai jos).
//
// E STRICT NECESARA, deci nu cere acord (Legea 506/2004 art. 4 alin. (6) lit. b)): fara ea bannerul
// ar reveni pe fiecare pagina si un refuz n-ar putea fi respectat. Se scrie NUMAI dupa o alegere a
// vizitatorului, niciodata la simpla vizita - poarta C-01 masoara exact asta: zero stocare fara
// interactiune. E declarata in politica de cookie-uri (`COOKIE_ALEGERE` din furnizori).
//
// O alegere veche se cere din nou in doua cazuri: s-a schimbat informarea (alta versiune, deci alt
// text decat cel la care a spus da sau nu) sau au trecut 6 luni. Pragul de 6 luni e ales de noi:
// legea nu da o durata, iar o jumatate de an tine alegerea fresca fara sa intrebe la fiecare vizita.
//
// Orice citire sau scriere poate cadea (fereastra privata, stocare blocata, cota plina): atunci
// alegerea e tratata ca inexistenta, iar bannerul reapare. Esecul nu porneste niciodata analitica.

/** Cheia din stocarea locala. Aceeasi cu `COOKIE_ALEGERE.nume` (proba o verifica). */
export const CHEIE_ALEGERE = "3s-consimtamant";

/** Dupa cate zile se cere din nou alegerea (6 luni). */
export const VALABILITATE_ZILE = 183;

/** Butonul prin care s-a facut alegerea: primul strat sau panoul de setari. */
export const METODE = ["accept-tot", "refuz-tot", "setari"] as const;
export type Metoda = (typeof METODE)[number];

export type Alegere = {
  /** Versiunea informarii la care s-a raspuns (`VERSIUNE_INFORMARE`). */
  versiune: string;
  /** Identificator aleator al dispozitivului, pentru evidenta; nu leaga alegerea de o persoana. */
  id: string;
  /** Momentul alegerii, ISO 8601. */
  moment: string;
  statistica: boolean;
  metoda: Metoda;
};

const ZI_MS = 24 * 60 * 60 * 1000;

/** Verifica forma unei alegeri citite; orice abatere o face inexistenta. */
export function alegereValida(x: unknown): x is Alegere {
  if (typeof x !== "object" || x === null) return false;
  const a = x as Record<string, unknown>;
  return (
    typeof a.versiune === "string" &&
    typeof a.id === "string" &&
    a.id.length > 0 &&
    a.id.length <= 64 &&
    typeof a.moment === "string" &&
    !Number.isNaN(Date.parse(a.moment)) &&
    typeof a.statistica === "boolean" &&
    (METODE as readonly string[]).includes(a.metoda as string)
  );
}

/** Alegerea pastrata, daca exista, e pe versiunea curenta si nu a expirat. Altfel `null`. */
export function citesteAlegere(versiune: string, acum: number = Date.now()): Alegere | null {
  try {
    const brut = window.localStorage.getItem(CHEIE_ALEGERE);
    if (brut === null) return null;
    const a: unknown = JSON.parse(brut);
    if (!alegereValida(a) || a.versiune !== versiune) return null;
    if (acum - Date.parse(a.moment) > VALABILITATE_ZILE * ZI_MS) return null;
    return a;
  } catch {
    return null;
  }
}

/** Identificatorul pastrat pe dispozitiv, chiar dintr-o alegere expirata: leaga retragerea de acordul dinainte. */
export function idPastrat(): string | null {
  try {
    const brut = window.localStorage.getItem(CHEIE_ALEGERE);
    if (brut === null) return null;
    const a: unknown = JSON.parse(brut);
    return alegereValida(a) ? a.id : null;
  } catch {
    return null;
  }
}

/** Scrie alegerea. Intoarce `false` cand stocarea refuza (alegerea tine atunci doar pe pagina curenta). */
export function scrieAlegere(a: Alegere): boolean {
  try {
    window.localStorage.setItem(CHEIE_ALEGERE, JSON.stringify(a));
    return true;
  } catch {
    return false;
  }
}

/** Un identificator nou, aleator. `randomUUID` exista in orice context securizat (https si localhost). */
export function idNou(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return "id-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 12);
}
