// Adresa publica a site-ului, din mediu: `SITE_URL`, cu implicitul de azi (`ADRESA_BAZA` din
// `src/content/rute.ts`, adica mediul de proba). Din ea se compun canonical-urile (prin
// `metadataBase` din layout), harta de site, `robots.txt`, `/llms.txt`, imaginea sociala si
// datele structurate. La lansare, `SITE_URL` devine domeniul real (planul valului S4, §8.1) si
// toate acestea se muta impreuna, fara nicio alta modificare de cod.
//
// Se citeste la CONSTRUIRE: paginile sunt statice, deci o variabila schimbata fara build nou nu
// schimba nimic. Pasul e scris in `docs/ziua-operatorului.md`.
//
// O VALOARE GRESITA OPRESTE CONSTRUIREA. O adresa cu cale, cu parametri sau pe `http` ar produce
// canonical-uri care arata in alta parte decat pagina, iar asta scoate site-ul din index fara ca
// vreun ecran sa se schimbe. Mai bine un build rosu decat un index gol.
//
// Si firul de pagina (`FirPagina`) si foaia de tiparit a termenelor (`FoaieTipar`) compun adresele
// tot prin `adresaSite()` (felia seo-tehnic), deci `ADRESA_BAZA` nu mai are alt consumator decat
// implicitul de aici. Proba: un build cu `SITE_URL` schimbat nu mai contine gazda de proba.
//
// ALTERNATELE HREFLANG (felia multi-domeniu, apoi felia metadata-hreflang): cand acelasi cod ruleaza pe mai
// multe domenii, fiecare pagina spune motoarelor ce echivalente are pe celelalte. Regulile lui Google, citite pe
// 2026-09-30 in documentatia oficiala (https://developers.google.com/search/docs/specialty/international/localized-versions):
// "Each language version must list itself as well as all other language versions" si "If two pages
// don't both point to each other, the tags will be ignored"; adresele trebuie sa fie complete
// (`https://...`), codurile sunt limba (ISO 639-1) cu regiune optionala (ISO 3166-1 alfa-2), iar
// `x-default` e recomandat pentru vizitatorii carora nicio varianta nu li se potriveste.
//
// Aici sta numai LISTA BAZELOR: `SITE_ALTERNATE`, citita la construire, aceeasi pe toate domeniile, validata
// de `alternateSite`. Ce pagina are echivalent pe ce baza NU se mai deduce din cale (regula veche "aceeasi cale
// pe fiecare varianta" s-a retras: `/preturi` si `/pricing` sunt aceeasi pagina, cu cai diferite): o decide
// tabelul de echivalente (`src/content/echivalente.ts`), iar legaturile le scrie `metadataPagina`
// (`src/components/seo/metadata.ts`), pe server, in `<head>`. Fara variabila nu se emite nimic. Regulile
// listei: `alternateSite`, mai jos, si `docs/ziua-operatorului.md`.

import { ADRESA_BAZA } from "@/content/rute";
import { ASEZARI, asezareBuild, prefixServit, type CodAsezare } from "@/lib/asezare";
import { EDITII, editiiBuild, type CodEditie, type Editie } from "@/lib/editii";

/**
 * O varianta a site-ului: codul hreflang si adresa de baza a variantei, adica originea domeniului
 * plus, cand versiunea sta sub un prefix de cale, prefixul (`https://gazda/ro`). Fara bara la final.
 */
export type Alternata = { hreflang: string; adresa: string };

/** Codul pentru "nicio varianta nu se potriveste vizitatorului" (Google: pagina de rezerva). */
export const X_DEFAULT = "x-default";

/**
 * Originea din text: doar `https://gazda`, fara cale, parametri sau credentiale. `nume` e variabila
 * din care vine valoarea, ca mesajul sa spuna care e gresita. Arunca pe o valoare nevalida.
 */
function origineValida(brut: string, nume: string): string {
  let adresa: URL;
  try {
    adresa = new URL(brut);
  } catch {
    throw new Error(nume + ' nu e o adresa web: "' + brut + '"');
  }
  if (adresa.protocol !== "https:") {
    throw new Error(nume + ' trebuie sa inceapa cu https:// , nu "' + brut + '"');
  }
  const doarOrigine =
    (adresa.pathname === "/" || adresa.pathname === "") &&
    adresa.search === "" &&
    adresa.hash === "" &&
    adresa.username === "" &&
    adresa.password === "";
  if (!doarOrigine) {
    throw new Error(nume + ' trebuie sa fie doar originea (https://gazda), fara cale sau parametri: "' + brut + '"');
  }
  return adresa.origin;
}

/** Originea site-ului (`https://gazda`, fara bara la final). Arunca pe o valoare nevalida. */
export function adresaSite(valoare: string | undefined = process.env.SITE_URL): string {
  const brut = (valoare ?? "").trim();
  if (brut === "") {
    return new URL(ADRESA_BAZA).origin;
  }
  return origineValida(brut, "SITE_URL");
}

/** Adresa absoluta a unei cai de pe site. `cale` incepe cu `/`. */
export function urlAbsolut(cale: string, baza: string = adresaSite()): string {
  return new URL(cale, baza + "/").toString();
}

/** Limba (ISO 639-1) cu regiune optionala (ISO 3166-1 alfa-2), ca in `ro-MD`. Se verifica FORMA, nu apartenenta la liste. */
const FORMA_HREFLANG = /^[a-z]{2}(?:-[A-Z]{2})?$/;

/** Prefixul de cale al unei variante: zero sau mai multe segmente simple, fara segment gol (`/ro`, `/ro/md`). */
const FORMA_PREFIX = /^(?:\/[A-Za-z0-9._~-]+)*$/;

/**
 * Codul, in forma pe care o citeste Google: limba cu litere mici, regiunea cu litere mari. `ro-md`
 * devine `ro-MD`. Intoarce `null` cand textul nu are forma unui cod.
 */
function normalizeazaCod(brut: string): string | null {
  const cod = brut.trim();
  if (cod.toLowerCase() === X_DEFAULT) {
    return X_DEFAULT;
  }
  const [limba, regiune, ...rest] = cod.split("-");
  if (rest.length > 0) {
    return null;
  }
  const normalizat = regiune === undefined ? limba.toLowerCase() : limba.toLowerCase() + "-" + regiune.toUpperCase();
  return FORMA_HREFLANG.test(normalizat) ? normalizat : null;
}

/**
 * Baza unei variante, din text: originea https si, optional, un prefix de cale (`https://gazda/ro`).
 * Bara de la final se scoate, ca adresele paginilor sa nu iasa cu `//`. Parametrii, ancora si
 * credentialele nu au ce cauta intr-o baza. Arunca pe o valoare nevalida; `nume` spune variabila si codul.
 */
function bazaVarianta(brut: string, nume: string): string {
  let adresa: URL;
  try {
    adresa = new URL(brut);
  } catch {
    throw new Error(nume + ' nu e o adresa web: "' + brut + '"');
  }
  if (adresa.protocol !== "https:") {
    throw new Error(nume + ' trebuie sa inceapa cu https:// , nu "' + brut + '"');
  }
  if (adresa.search !== "" || adresa.hash !== "" || adresa.username !== "" || adresa.password !== "") {
    throw new Error(nume + ' trebuie sa fie originea (https://gazda) si cel mult un prefix de cale, fara parametri, ancora sau credentiale: "' + brut + '"');
  }
  const prefix = adresa.pathname.replace(/\/+$/, "");
  if (!FORMA_PREFIX.test(prefix)) {
    throw new Error(nume + ' poate avea doar un prefix de cale de forma /ro, fara segmente goale sau caractere speciale: "' + brut + '"');
  }
  return adresa.origin + prefix;
}

/**
 * Variantele site-ului, din `SITE_ALTERNATE`: perechi `cod=adresa` separate prin virgula, de pilda
 * `ro-RO=https://gazda-ro.exemplu,en=https://gazda-int.exemplu,ro-MD=https://gazda-int.exemplu/ro`.
 * Fiecare adresa e o origine https, cu prefix de cale optional (versiunea unei limbi poate sta sub
 * `/ro` pe acelasi domeniu); fiecare cod e o limba cu regiune optionala.
 *
 * REGULI, cu motivul (o lista care le incalca produce hreflang pe care Google il ignora, fara sa
 * anunte, deci construirea se opreste):
 *   - lista TREBUIE sa contina domeniul curent (`baza`), FARA prefix: fiecare pagina se refera si pe ea
 *     insasi, altfel variantele nu se confirma reciproc. Pe un domeniu cu doua limbi (una la radacina,
 *     una sub `/ro`), varianta de la radacina e cea pe care o servim azi;
 *   - un cod apare o singura data;
 *   - `x-default` se poate da explicit ca pereche (`x-default=https://...`) si trebuie sa fie una dintre
 *     variantele listate; fara el, lista il pune spre PRIMA varianta. Paginile NU il mai iau de aici: dupa
 *     tabelul de echivalente, `x-default` al unei pagini e echivalentul ei EN, cand exista, altfel pagina
 *     insasi (`metadataPagina`). Perechea ramane validata, ca o lista scrisa gresit sa opreasca tot construirea.
 * Intoarce lista goala cand variabila lipseste sau e goala: nimic nu se emite. `x-default` vine ultimul.
 */
export function alternateSite(
  valoare: string | undefined = process.env.SITE_ALTERNATE,
  baza: string = adresaSite(),
): Alternata[] {
  const brut = (valoare ?? "").trim();
  if (brut === "") {
    return [];
  }
  const limbi: Alternata[] = [];
  let implicit: string | null = null;
  const vazute = new Set<string>();
  for (const intrare of brut.split(",")) {
    const text = intrare.trim();
    if (text === "") {
      continue;
    }
    const semn = text.indexOf("=");
    if (semn < 0) {
      throw new Error('SITE_ALTERNATE: intrarea "' + text + '" nu are forma cod=adresa (de pilda ro-MD=https://gazda)');
    }
    const cod = normalizeazaCod(text.slice(0, semn));
    if (cod === null) {
      throw new Error(
        'SITE_ALTERNATE: codul "' + text.slice(0, semn).trim() + '" nu e o limba cu regiune optionala (ro, ro-MD) si nici x-default',
      );
    }
    if (vazute.has(cod)) {
      throw new Error('SITE_ALTERNATE: codul "' + cod + '" apare de doua ori');
    }
    vazute.add(cod);
    const adresa = bazaVarianta(text.slice(semn + 1).trim(), "SITE_ALTERNATE (" + cod + ")");
    if (cod === X_DEFAULT) {
      implicit = adresa;
    } else {
      limbi.push({ hreflang: cod, adresa });
    }
  }
  if (limbi.length === 0) {
    throw new Error("SITE_ALTERNATE nu contine nicio varianta de limba (doar x-default sau nimic)");
  }
  if (!limbi.some((v) => v.adresa === baza)) {
    // Pe asezarea `ro` (3s.com.ro) codul e stiut: romana de la radacina e varianta ro-RO (`problemeAlternateAsezare`), deci
    // mesajul il numeste. Pe `md` codul e al editiei de la radacina domeniului, ales de cine scrie lista.
    const cod = asezareBuild() === "ro" ? ASEZARI.ro["ro-MD"].inLanguage : "cod";
    throw new Error(
      "SITE_ALTERNATE nu contine adresa acestui site (" +
        baza +
        ") fara prefix de cale: fiecare pagina se refera si pe ea insasi, iar variantele se confirma una pe alta. Se adauga perechea " +
        cod +
        "=" +
        baza,
    );
  }
  if (implicit !== null && !limbi.some((v) => v.adresa === implicit)) {
    throw new Error(
      "SITE_ALTERNATE: x-default trebuie sa fie una dintre variantele listate (" +
        implicit +
        " nu e), altfel pagina lui nu confirma inapoi si Google ignora adnotarea",
    );
  }
  return [...limbi, { hreflang: X_DEFAULT, adresa: implicit ?? limbi[0].adresa }];
}

/**
 * Editia de la radacina domeniului: `ro-RO` pe build-ul romanesc, `en` pe cel international (profilul admis are
 * exact una la radacina, `src/lib/editii.ts`). Din ea vin graful comun de date structurate, `llms.txt`,
 * `security.txt` si manifestul aplicatiei web, care sunt unul singur pe domeniu.
 *
 * PE ASEZARE (`src/lib/asezare.ts`): radacina e a editiei SERVITE fara prefix pe asezarea build-ului, nu a celei cu
 * prefixul sursa gol. Pe `md` sunt aceleasi (`en` pe 3s.md); pe `ro` (3s.com.ro) la radacina sta continutul `ro-MD`,
 * deci editia intoarsa e `ro-MD`. Atributele ei de limba pe domeniu (`inLanguage` `ro-RO`) le da asezarea
 * (`atributeLimba`, `hrefLangServit`), nu catalogul editiilor.
 */
export function editiaRadacinii(editii: readonly CodEditie[] = editiiBuild(), asezare: CodAsezare = asezareBuild()): Editie {
  const cod = editii.find((c) => (c === "ro-RO" ? EDITII[c].prefix : prefixServit(c, asezare)) === "");
  if (cod === undefined) {
    throw new Error("profilul " + editii.join(",") + " nu are nicio editie la radacina domeniului");
  }
  return EDITII[cod];
}

/** Limbile domeniului (`lang`, fara regiune, fara repetitii), in ordinea profilului: `["ro"]` sau `["en", "ro"]`. */
export function limbileDomeniului(editii: readonly CodEditie[] = editiiBuild()): string[] {
  return [...new Set(editii.map((c) => EDITII[c].lang))];
}
