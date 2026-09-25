// Comutatorul operatorului de date (planul valului S4, §9-§10): SINGURA sursa din care site-ul afla
// cine prelucreaza datele. Fisierul e `config/operator.json`, cu `"operator": null` azi (decizia
// owner-ului din 24.09.2026: niciun operator pana la infiintarea firmei 3S).
//
// CINE IL CITESTE: starea consimtamantului (`src/lib/analitica.ts`), deci bannerul, analitica si
// legatura "Setari cookie-uri" din subsol; textele juridice (`src/content/juridic/`); poarta juridica
// (L-01, L-15), care il citeste separat, din Python. Nicio alta piesa nu are o a doua sursa pentru
// aceleasi date.
//
// Ce se verifica aici e FORMA: cheia `operator` e `null` sau un obiect numai cu campurile din
// `_forma`, toate text. O forma gresita opreste construirea. Ce inseamna "complet" pentru textele de
// informare (denumire, sediu, adresa de contact, tara) decide `operatorComplet`; un operator numit
// dar incomplet lasa analitica OPRITA, fiindca fara acele campuri informarea din politica ar fi
// goala. Campurile de identificare ale firmei pe fiecare pagina le cere poarta juridica, nu codul.

import configurare from "../../config/operator.json";

/** Numele campurilor, luate din `_forma`: niciun camp nu se scrie a doua oara aici. */
export type CampOperator = keyof typeof configurare._forma;

/** Operatorul numit: fiecare camp din `_forma`, ca text (poate fi gol). */
export type Operator = Record<CampOperator, string>;

const CAMPURI = Object.keys(configurare._forma) as CampOperator[];

/** Ce trebuie sa existe ca informarea din politica sa numeasca operatorul (GDPR art. 13 alin. (1) lit. a)). */
export const CAMPURI_INFORMARE = ["denumire", "sediu", "email", "tara"] as const satisfies readonly CampOperator[];

/**
 * Un loc gol mascat drept valoare: un substituent ajunge pe pagina tocmai fiindca nu e sir vid.
 *
 * N/A, TODO, TBD si lorem sunt CUVINTE: se potrivesc numai cand nu au o litera lipita in stanga sau
 * in dreapta. Cautate ca bucati de cuvant, prindeau nume si adrese reale - "Str. Ana Ipatescu",
 * "Poiana", "Arhiva Romana SRL", "Todoran", tara "Ucraina" - iar in ziua operatorului analitica
 * ramanea oprita si textele juridice nu se construiau, cu mesajul ca lipseste campul (masurat de
 * critic, 25.09.2026). Granita e de LITERA, nu `\b`: "TODO_sediu" si "RO1234XXXX" raman prinse.
 * Restul (XXX, ???, "de completat", "necunoscut", "<...>") nu apare in nume reale si se cauta oriunde.
 */
const SUBSTITUENT = /(?<!\p{L})(?:TODO|TBD|N\/?A|lorem)(?!\p{L})|XXX+|\?\?\?|de\s+completat|necunoscut|<[^>]*>/iu;

/** O adresa de posta plauzibila: un singur @, fara spatii, cu punct in domeniu. */
const FORMA_ADRESEI = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Citeste comutatorul dintr-o configurare data. Arunca pe o forma gresita. */
export function citesteOperator(cfg: unknown): Operator | null {
  if (typeof cfg !== "object" || cfg === null || !("operator" in cfg)) {
    throw new Error('config/operator.json: lipseste cheia "operator" (null sau obiectul firmei)');
  }
  const brut = (cfg as { operator: unknown }).operator;
  if (brut === null) {
    return null;
  }
  if (typeof brut !== "object" || Array.isArray(brut)) {
    throw new Error('config/operator.json: "operator" trebuie sa fie null sau un obiect');
  }
  const necunoscute = Object.keys(brut).filter((k) => !(CAMPURI as string[]).includes(k));
  if (necunoscute.length > 0) {
    throw new Error("config/operator.json: camp necunoscut " + necunoscute.join(", ") + " (campurile sunt cele din _forma)");
  }
  const operator = {} as Operator;
  for (const camp of CAMPURI) {
    const valoare = (brut as Record<string, unknown>)[camp] ?? "";
    if (typeof valoare !== "string") {
      throw new Error("config/operator.json: campul " + camp + " trebuie sa fie text");
    }
    operator[camp] = valoare.trim();
  }
  return operator;
}

/** Campurile de informare care lipsesc sau poarta un substituent. Lista goala = complet. */
export function lipsuriInformare(operator: Operator): string[] {
  const lipsuri: string[] = CAMPURI_INFORMARE.filter((c) => operator[c] === "" || SUBSTITUENT.test(operator[c]));
  if (!lipsuri.includes("email") && !FORMA_ADRESEI.test(operator.email)) {
    lipsuri.push("email");
  }
  return lipsuri;
}

/** Operatorul exista si are tot ce cere informarea din politica. */
export function operatorComplet(operator: Operator | null): operator is Operator {
  return operator !== null && lipsuriInformare(operator).length === 0;
}

/** Comutatorul, citit la construire din `config/operator.json`. */
export const OPERATOR: Operator | null = citesteOperator(configurare as unknown);
