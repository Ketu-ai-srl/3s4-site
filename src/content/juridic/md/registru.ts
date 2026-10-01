// REGISTRUL familiei juridice `md` (operatorul din Republica Moldova, felia 73): cele 8 documente ale
// pachetului, adresa fiecaruia pe limba, poarta la care se publica si maparea sectiunilor pe atributele
// portilor (`data-art13`, `data-l284`). Adresele si portile stau in `config/juridic-rute.json`, pe care il
// citeste si poarta juridica (Python), deci exista un singur loc pentru ele.
//
// PORTILE: B = deschiderea indexarii (01, 02, 03, 04, 07, 08); C = prima vanzare (05 DPA si 06
// subimputernicitii, care au inca marcaje de fapt ale furnizorului platformei). Poarta curenta e cea din
// fisier. O legatura spre un document nepublicat la poarta curenta devine TEXT fara legatura (se scoate
// legatura, nu propozitia).
//
// PAGINILE LEGATE din afara pachetului: `preturi` (pagina de preturi a domeniului, `/pricing`, singura de
// pe 3s.md; pana o publica felia paginilor EN, text fara legatura), `securitate-si-locul-datelor` si
// `comutare-si-export` (cunoscute, nescrise: text fara legatura). Orice alta cheie opreste construirea.
//
// MODULUL E MIC: il importa si `../publicare.ts`, care ajunge in pachetul de browser.

import rute from "../../../../config/juridic-rute.json";
import type { LimbaJuridica } from "../tipuri";

export const CHEI_MD = [
  "informatii-legale",
  "confidentialitate",
  "cookie-uri",
  "termeni",
  "dpa",
  "subimputerniciti",
  "notificare-si-actiune",
  "inteligenta-artificiala",
] as const;

export type CheieMd = (typeof CHEI_MD)[number];

export type PoartaPublicare = "B" | "C";

type IntrareRegistru = { en: string; ro: string; poarta: PoartaPublicare };

const ORDINE_PORTI: readonly PoartaPublicare[] = ["B", "C"];

function poartaValida(p: string, unde: string): PoartaPublicare {
  if (p !== "B" && p !== "C") {
    throw new Error("config/juridic-rute.json: poarta necunoscuta " + JSON.stringify(p) + " la " + unde);
  }
  return p;
}

/** Registrul, validat la incarcare: exact cheile din `CHEI_MD`, fiecare cu adresa EN, RO si poarta. */
export const REGISTRU_MD: Readonly<Record<CheieMd, IntrareRegistru>> = (() => {
  const documente = rute.documente as Record<string, { en: string; ro: string; poarta: string }>;
  const chei = Object.keys(documente);
  if (chei.length !== CHEI_MD.length || !CHEI_MD.every((c) => chei.includes(c))) {
    throw new Error("config/juridic-rute.json: cheile documentelor trebuie sa fie exact " + CHEI_MD.join(", "));
  }
  return Object.fromEntries(
    CHEI_MD.map((c) => [c, { en: documente[c].en, ro: documente[c].ro, poarta: poartaValida(documente[c].poarta, c) }]),
  ) as Record<CheieMd, IntrareRegistru>;
})();

/** Poarta curenta a familiei: ce e publicat azi. */
export const POARTA_CURENTA: PoartaPublicare = poartaValida(rute.poarta_curenta, "poarta_curenta");

export function esteCheieMd(cheie: string): cheie is CheieMd {
  return (CHEI_MD as readonly string[]).includes(cheie);
}

/** Documentul se publica la poarta data (o poarta mai tarzie le include pe cele dinainte)? */
export function publicatLa(cheie: CheieMd, poarta: PoartaPublicare = POARTA_CURENTA): boolean {
  return ORDINE_PORTI.indexOf(REGISTRU_MD[cheie].poarta) <= ORDINE_PORTI.indexOf(poarta);
}

/** Cheile publicate la poarta data, in ordinea registrului. */
export function cheiPublicate(poarta: PoartaPublicare = POARTA_CURENTA): CheieMd[] {
  return CHEI_MD.filter((c) => publicatLa(c, poarta));
}

/** Adresa documentului in limba data. */
export function caleMd(cheie: CheieMd, limba: LimbaJuridica): string {
  return REGISTRU_MD[cheie][limba];
}

/** Slugul (ultimul segment al adresei) in limba data. */
export function slugMd(cheie: CheieMd, limba: LimbaJuridica): string {
  const cale = caleMd(cheie, limba);
  return cale.slice(cale.lastIndexOf("/") + 1);
}

/** Cheia documentului cu slugul dat, in oricare limba, sau `undefined`. */
export function cheiePentruSlug(slug: string, limba?: LimbaJuridica): CheieMd | undefined {
  return CHEI_MD.find((c) => (limba === undefined ? slugMd(c, "ro") === slug || slugMd(c, "en") === slug : slugMd(c, limba) === slug));
}

type PaginaLegata = { en: string | null; ro: string | null; publicata: boolean };

/** Paginile din afara pachetului spre care trimit documentele. */
export const PAGINI_LEGATE: Readonly<Record<string, PaginaLegata>> = rute.pagini_legate as Record<string, PaginaLegata>;

/** Unde duce o legatura interna: o adresa, sau text fara legatura. */
export type Tinta = { fel: "adresa"; cale: string } | { fel: "text" };

/**
 * Tinta legaturii `cale:<cheie>` (in limba paginii) sau `cale-ro:<cheie>` (calea romaneasca, din pagina
 * EN). Document nepublicat la poarta data sau pagina legata nepublicata -> text. Cheie necunoscuta ->
 * construirea se opreste.
 */
export function tintaLegatura(fel: "cale" | "cale-ro", cheie: string, limba: LimbaJuridica, poarta: PoartaPublicare = POARTA_CURENTA): Tinta {
  const limbaTintei: LimbaJuridica = fel === "cale-ro" ? "ro" : limba;
  if (esteCheieMd(cheie)) {
    return publicatLa(cheie, poarta) ? { fel: "adresa", cale: caleMd(cheie, limbaTintei) } : { fel: "text" };
  }
  const pagina = PAGINI_LEGATE[cheie];
  if (pagina === undefined) {
    throw new Error("legatura interna spre o cheie necunoscuta: " + fel + ":" + cheie + " (config/juridic-rute.json nu o are)");
  }
  const cale = pagina[limbaTintei];
  return pagina.publicata && cale !== null ? { fel: "adresa", cale } : { fel: "text" };
}

/**
 * MAPAREA sectiunilor pe atributele portilor, PROPUNERE pentru jurist (felia 73): fiecare element din
 * GDPR art. 13 / Legea 195/2024 art. 13 (cheile `CHEI_ART13`) si din Legea 284/2004 art. 10 alin. (2)
 * lit. b)-h) (cheile `CHEI_L284`) -> sectiunea documentului `md` care il acopera, dupa numarul ei.
 */
export const MARCAJ_SECTIUNI_MD = {
  confidentialitate: {
    atribut: "data-art13",
    sectiuni: {
      "1a": "s1", // cine prelucreaza datele (identitatea si contactul operatorului)
      "1b": "s2", // responsabilul cu protectia datelor
      "1c": "s3", // ce date, pentru ce si pe ce temei
      "1d": "s4", // interesele legitime
      "1e": "s5", // cine primeste datele
      "1f": "s6", // transferuri in afara SEE
      "2a": "s7", // cat timp pastram datele
      "2b": "s8", // drepturile
      "2c": "s11", // retragerea consimtamantului
      "2d": "s12", // plangere la o autoritate
      "2e": "s13", // daca trebuie sa ne dati datele
      "2f": "s14", // decizii automate
    },
  },
  "cookie-uri": {
    atribut: "data-l284",
    sectiuni: {
      "2b": "s2", // ce informatii pastram in browser si de ce
      "2c": "s3", // drepturile
      "2d": "s4", // cui pot ajunge datele
      "2e": "s5", // punctul de contact
      "2f": "s6", // cum cerem consimtamantul
      "2g": "s7", // dreptul de a refuza
      "2h": "s8", // cum va retrageti acordul
      masuri: "s9", // cum protejam datele
    },
  },
} as const satisfies Partial<Record<CheieMd, { atribut: "data-art13" | "data-l284"; sectiuni: Record<string, string> }>>;
