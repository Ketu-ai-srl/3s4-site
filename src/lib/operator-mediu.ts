// Operatorul de date dintr-o variabila de mediu (felia multi-domeniu, planul valului S4, §10).
//
// DE CE EXISTA. Acelasi cod ruleaza ca aplicatii separate, cate una pe domeniu (mediul de proba,
// site-ul pentru Republica Moldova, mai tarziu domeniul din Romania), iar operatorul de date poate fi
// alta firma pe fiecare. Un singur `config/operator.json` in depozit nu poate spune asta: variabila
// `OPERATOR_JSON` are aceeasi schema ca fisierul si il inlocuieste, aplicatie cu aplicatie. Fara
// variabila, ramane fisierul, exact ca pana acum.
//
// DE CE E UN MODUL SEPARAT, MIC. Il citesc doua locuri care nu se pot imparti un import:
//   - `src/lib/operator.ts` (server): valideaza forma cu `citesteOperator`, aceeasi functie ca pentru
//     fisier, si spune cine e operatorul;
//   - `src/content/juridic/publicare.ts`: ajunge si in pachetul de browser prin `RUTE` si nu are voie
//     sa importe `@/lib/operator` (ar trage tot fisierul de configurare in bucata comuna a layout-ului,
//     proba `tests/juridic.test.ts`). Ii trebuie doar raspunsul la "exista un operator numit?".
// Ambele citesc variabila prin functia de mai jos, deci un JSON stricat produce acelasi mesaj oricare
// modul se incarca primul.
//
// CE SE INTAMPLA IN BROWSER. Next inlocuieste la construire numai variabilele `NEXT_PUBLIC_*`; pentru
// restul, `process.env` e gol in pachetul de browser. Deci browserul nu vede niciodata `OPERATOR_JSON`.
// Masurat pe 2026-09-30, pe o copie cu fisierul pe `null` si operatorul numai in mediu, INAINTE de
// reparatie: serverul avea cele opt pagini juridice, harta, subsolul si formularul, iar consola
// browserului era curata (nicio nepotrivire de hidratare), dar `RUTE` din pachetul de browser nu avea
// paginile juridice, deci cautarea Ctrl+K nu le gasea ("confiden", "cookie", "termeni": zero rezultate).
//
// REPARATIA (runda 1 de reparatii): `next.config.ts` calculeaza, la construire, `NEXT_PUBLIC_OPERATOR_NUMIT`
// din `OPERATOR_JSON` (`String(operatorNumitInMediu())`: "true", "false" sau "null" cand variabila nu e
// setata), iar Next o inlocuieste in TOATE pachetele, ale serverului si ale browserului. `publicare.ts` o
// citeste cu `citesteOperatorNumit` INAINTEA variabilei si a fisierului: "true" / "false" hotarasc, orice
// altceva ("null", goala, alta valoare) lasa sa decida ce era inainte. Cheia e definita mereu in
// `next.config.ts`, deci o valoare pusa de altcineva in mediul build-ului n-o poate inlocui. Acopera si
// cazul invers: operator in fisier si `{"operator": null}` in mediu, unde pachetul de browser ar fi aratat
// pagini pe care serverul nu le construieste. Expresia `process.env.NEXT_PUBLIC_OPERATOR_NUMIT` trebuie sa
// fie LITERALA in `publicare.ts`: Next inlocuieste numai ce recunoaste pe text, iar o citire dinamica
// (`process.env[nume]`) ramane nedefinita in browser fara nicio eroare (proba: `tests/multi-domeniu-operator.test.ts`).
// Tabelul variabilelor pe domeniu: `docs/ziua-operatorului.md`.
//
// Ce NU se verifica aici: continutul campurilor. Forma o verifica `citesteOperator`
// (`src/lib/operator.ts`), completitudinea `lipsuriInformare`.

/** Numele variabilei, ca mesajele sa o spuna la fel peste tot. */
export const VARIABILA_OPERATOR = "OPERATOR_JSON";

/**
 * Variabila prin care pachetul de browser afla daca exista un operator numit: NU se seteaza de mana, o
 * defineste `next.config.ts` din `OPERATOR_JSON` (vezi antetul). Numele apare LITERAL si in `publicare.ts`.
 */
export const VARIABILA_OPERATOR_NUMIT = "NEXT_PUBLIC_OPERATOR_NUMIT";

/** Forma asteptata, pentru mesajele de eroare. */
const FORMA_ASTEPTATA = '{"operator": null} sau {"operator": {"denumire": "...", "sediu": "...", "email": "...", "tara": "..."}}';

/** Continutul variabilei, parsat: schema din `config/operator.json`, inca nevalidata. */
export type ConfigurareMediu = { configurare: unknown };

/**
 * `OPERATOR_JSON` ca obiect, sau `null` cand variabila lipseste sau e goala (Coolify si alte panouri
 * pot defini o variabila cu valoare vida: asta inseamna "nesetata", nu "JSON stricat"). Arunca pe un
 * text care nu e JSON, cu motivul parserului si forma asteptata.
 *
 * `{"operator": null}` e o valoare, nu o lipsa: inseamna "acest domeniu nu are operator", chiar daca
 * fisierul din depozit ar numi unul.
 */
export function configurareOperatorDinMediu(valoare: string | undefined = process.env.OPERATOR_JSON): ConfigurareMediu | null {
  const brut = (valoare ?? "").trim();
  if (brut === "") {
    return null;
  }
  try {
    return { configurare: JSON.parse(brut) as unknown };
  } catch (e) {
    const motiv = e instanceof Error ? e.message : String(e);
    throw new Error(VARIABILA_OPERATOR + " nu e JSON valid (" + motiv + "). Forma: " + FORMA_ASTEPTATA);
  }
}

/**
 * Mediul numeste un operator? `true` / `false` cand `OPERATOR_JSON` e setata, `null` cand nu e (atunci
 * decide fisierul). Nu valideaza campurile: o forma gresita o opreste `src/lib/operator.ts`.
 */
export function operatorNumitInMediu(valoare: string | undefined = process.env.OPERATOR_JSON): boolean | null {
  const dinMediu = configurareOperatorDinMediu(valoare);
  if (dinMediu === null) {
    return null;
  }
  const cfg = dinMediu.configurare;
  return typeof cfg === "object" && cfg !== null && "operator" in cfg && (cfg as { operator: unknown }).operator !== null;
}

/**
 * Valoarea lui `NEXT_PUBLIC_OPERATOR_NUMIT`, ca raspuns: `true` / `false` numai pentru "true" / "false" (ce scrie
 * `next.config.ts`, adica `String(operatorNumitInMediu())`). Orice altceva ("null" = variabila `OPERATOR_JSON`
 * nesetata, valoare goala sau necunoscuta) e `null`: atunci decide ce era inainte, fisierul. Nu arunca: ruleaza si
 * in pachetul de browser, unde o eroare ar strica pagina.
 */
export function citesteOperatorNumit(valoare: string | undefined): boolean | null {
  if (valoare === "true") {
    return true;
  }
  if (valoare === "false") {
    return false;
  }
  return null;
}
