// ASEZAREA: unde se servesc paginile editiilor internationale pe un domeniu (`SITE_ASEZARE`, citita la CONSTRUIRE).
//
// Acelasi continut (`page.en.tsx`, `page.romd.tsx`, `src/content/en`, `src/content/ro-md`) ruleaza pe doua domenii,
// cu doua asezari, si numai ele (catalog INCHIS; o valoare necunoscuta opreste construirea):
//   - `md` (implicitul, cand variabila lipseste sau e goala): engleza la radacina, romana sub `/ro`. E asezarea
//     de azi a site-ului international si a site-ului romanesc vechi: pe ea toate functiile de mai jos sunt
//     identitatea, deci HTML-ul nu se schimba;
//   - `ro`: romana (continutul `ro-MD`) la radacina, cu atributele de limba `ro-RO`, iar engleza sub `/en`. Cere
//     exact editiile `en,ro-MD` (`problemeAsezare`).
// Asezarea decide NUMAI adresa servita si atributele de limba (`lang`, `og:locale`, `inLanguage`/hreflang); textul
// paginilor e acelasi pe ambele.
//
// DOUA TIPURI DE CALE. Pe asezarea `ro`, `/contact` e in acelasi timp calea SURSA a paginii de contact in engleza
// si calea SERVITA a paginii de contact in romana, deci un sir nu poate spune singur ce este. De aceea:
//   - REGULA: datele poarta cai SURSA (forma asezarii `md`: `RUTE[i].cale`, echivalentele, contractele de navigatie,
//     calea din metadata); traducerea se face O SINGURA DATA, la emitere (o legatura, canonical-ul, harta), prin
//     `caleServita`. In browser, calea citita din bara de adrese e SERVITA si se aduce inapoi prin `caleSursa`.
//   - `CaleSursa` si `CaleServita` sunt siruri cu marca de tip: `caleServita` nu primeste o cale deja servita, deci
//     traducerea de doua ori cade la compilare. Pe `/contact`, unde rularea nu le poate deosebi, numai tipul apara;
//     restul il prinde garda de rulare (orice `/en` intrat in `caleServita` pe `ro` arunca).
//
// CE SE TRADUCE. Numai rutele din lista data (manifestul `RUTE` al build-ului), cu fragmentul si interogarea
// pastrate. Caile care nu sunt rute (imaginile, `/a/...`, `/_next/...`, fisierele domeniului, o ancora singura) raman
// neschimbate: pe ele nu le alege asezarea.
//
// Modulul nu importa decat catalogul editiilor (care nu importa nimic): il citesc `next.config.ts`, pachetul de
// browser si Node direct (`perechi-asezare.mjs`, unde `next/navigation` nici nu se rezolva). Lista rutelor se da ca
// argument, ca modulul sa nu traga manifestul de rute dupa el (manifestul il importa, fara ciclu: `RUTE[i].servita`);
// tot ca argument primeste carligul de citire si cititorul caii din bara de adrese (`useCaleSursa`).
import { EDITII, type CodEditie } from "./editii";

/** Codul unei asezari: `md` (engleza la radacina, romana sub `/ro`) sau `ro` (romana la radacina, engleza sub `/en`). */
export type CodAsezare = "md" | "ro";

/** Editiile care se aseaza: cele ale site-ului international. Site-ul romanesc vechi (`ro-RO`) sta numai pe `md`. */
export type EditieAsezata = "en" | "ro-MD";

/** Ce primeste o editie pe o asezare: prefixul servit si atributele de limba. */
export type Asezare = {
  /** Prefixul de cale servit: "" la radacina. */
  prefix: "" | "/ro" | "/en";
  /** Atributul `lang` al elementului `<html>`. */
  lang: "ro" | "en";
  /** `og:locale`. */
  ogLocale: "ro_RO" | "en_US" | "ro_MD";
  /** `inLanguage` din datele structurate si codul hreflang al paginilor servite asa. */
  inLanguage: "ro-RO" | "en" | "ro-MD";
};

/** Numele variabilei din mediu si al celei pentru pachetul de browser. */
export const VARIABILA_ASEZARE = "SITE_ASEZARE";
export const VARIABILA_ASEZARE_PUBLICA = "NEXT_PUBLIC_SITE_ASEZARE";

/** Asezarea implicita: cea de azi. */
export const ASEZARE_IMPLICITA: CodAsezare = "md";

const CODURI: readonly CodAsezare[] = ["md", "ro"];
const EDITII_ASEZATE: readonly EditieAsezata[] = ["en", "ro-MD"];

/** Asezarea `md` e chiar catalogul editiilor (o singura sursa, deci nu poate diverge de el). */
function dinCatalog(cod: EditieAsezata): Asezare {
  const { prefix, lang, ogLocale, inLanguage } = EDITII[cod];
  return { prefix, lang, ogLocale, inLanguage };
}

/** Catalogul inchis al asezarilor, pe editie. */
export const ASEZARI: Readonly<Record<CodAsezare, Readonly<Record<EditieAsezata, Asezare>>>> = {
  md: { en: dinCatalog("en"), "ro-MD": dinCatalog("ro-MD") },
  ro: {
    en: { prefix: "/en", lang: "en", ogLocale: "en_US", inLanguage: "en" },
    "ro-MD": { prefix: "", lang: "ro", ogLocale: "ro_RO", inLanguage: "ro-RO" },
  },
};

/** Asezarea din textul variabilei. Gol sau lipsa = implicitul; arunca, cu motivul, pe o valoare necunoscuta. */
export function asezareDinText(valoare: string | undefined, nume: string = VARIABILA_ASEZARE): CodAsezare {
  const brut = (valoare ?? "").trim();
  if (brut === "") return ASEZARE_IMPLICITA;
  const cod = CODURI.find((c) => c === brut.toLowerCase());
  if (cod === undefined) throw new Error(nume + ': asezarea "' + brut + '" nu exista; asezarile sunt ' + CODURI.join(", "));
  return cod;
}

/**
 * Asezarea acestui build. Doua surse, in ordinea asta: `NEXT_PUBLIC_SITE_ASEZARE` (pusa de `next.config.ts` numai
 * pe asezarea `ro`; scrisa LITERAL, ca Next s-o inlocuiasca si in pachetul de browser), apoi `SITE_ASEZARE` (pe
 * server in afara build-ului si in probe).
 */
export function asezareBuild(): CodAsezare {
  const calculata = process.env.NEXT_PUBLIC_SITE_ASEZARE;
  if (calculata !== undefined && calculata.trim() !== "") return asezareDinText(calculata, VARIABILA_ASEZARE_PUBLICA);
  return asezareDinText(process.env.SITE_ASEZARE);
}

/** Coerenta asezarii cu profilul editiilor. Goala = coerent. Pe `ro` profilul trebuie sa fie exact `en,ro-MD`. */
export function problemeAsezare(asezare: CodAsezare, editii: readonly CodEditie[]): string[] {
  if (asezare === "md") return [];
  const asteptat = [...EDITII_ASEZATE];
  if (editii.length === asteptat.length && asteptat.every((c, i) => editii[i] === c)) return [];
  return [
    VARIABILA_ASEZARE +
      "=" +
      asezare +
      " cere SITE_EDITII exact " +
      asteptat.join(",") +
      " (continutul international, cu editia ro-MD la radacina), dar profilul construit e " +
      editii.join(",") +
      ". Se seteaza SITE_EDITII=" +
      asteptat.join(",") +
      " sau se scoate " +
      VARIABILA_ASEZARE,
  ];
}

/** Prefixul servit al unei editii pe o asezare. */
export function prefixServit(editie: EditieAsezata, asezare: CodAsezare = asezareBuild()): Asezare["prefix"] {
  return ASEZARI[asezare][editie].prefix;
}

/** Atributele de limba (`lang`, `og:locale`, `inLanguage`) ale unei editii pe o asezare. */
export function atributeLimba(editie: EditieAsezata, asezare: CodAsezare = asezareBuild()): Omit<Asezare, "prefix"> {
  const { lang, ogLocale, inLanguage } = ASEZARI[asezare][editie];
  return { lang, ogLocale, inLanguage };
}

/**
 * Codul `hrefLang` scris pe o legatura spre o pagina a editiei `cod`: datele poarta codul editiei de CONTINUT (ca si
 * calea sursa), iar la emitere se scrie limba servita pe asezare (pe `ro`, `ro-MD` -> `ro-RO`). Pe `md` identitatea;
 * un cod care nu e al unei editii asezate (`ro-RO`, orice alt cod de limba) ramane neschimbat.
 */
export function hrefLangServit(cod: string, asezare: CodAsezare = asezareBuild()): string {
  const editie = EDITII_ASEZATE.find((e) => e === cod);
  return editie === undefined ? cod : ASEZARI[asezare][editie].inLanguage;
}

/** O varianta a grupului hreflang: editia de CONTINUT si asezarea pe care o serveste. */
export type VariantaServita = { readonly editie: EditieAsezata; readonly asezare: CodAsezare };

/**
 * VARIANTELE SERVITE ale grupului hreflang, pe codul lor: tabel INCHIS. Codul hreflang numeste o pagina servita (un
 * domeniu cu o asezare), nu un continut: `ro-RO` e continutul `ro-MD` asezat la radacina 3s.com.ro, `ro-MD` acelasi
 * continut sub `/ro` pe 3s.md. Fiecare cod e chiar `inLanguage` al editiei pe asezarea ei (proba o cere). Engleza de
 * pe asezarea `ro` (`/en/...`) NU e varianta: e o copie pentru vizitatori, cu canonical-ul spre 3s.md, deci nu intra
 * in grup. Un cod din `SITE_ALTERNATE` care nu e aici opreste construirea (`problemeAlternateAsezare`, editii.ts).
 * Ordinea cheilor e ordinea in care se scriu legaturile in `<head>`.
 */
export const VARIANTE_SERVITE: Readonly<Record<string, VariantaServita>> = {
  en: { editie: "en", asezare: "md" },
  "ro-MD": { editie: "ro-MD", asezare: "md" },
  "ro-RO": { editie: "ro-MD", asezare: "ro" },
};

/**
 * Redirectarile permanente ale asezarii, in forma cheii `redirects` din `next.config.ts`. Pe `ro`, vechile adrese ale
 * romanei (`/ro`, `/ro/...`) duc la adresele de la radacina. Pe `md` nu exista niciuna (cheia nici nu se scrie).
 */
export function redirectariAsezare(asezare: CodAsezare): { source: string; destination: string; permanent: true }[] {
  if (asezare === "md") return [];
  const vechi = EDITII["ro-MD"].prefix;
  return [
    { source: vechi, destination: "/", permanent: true },
    { source: vechi + "/:cale*", destination: "/:cale*", permanent: true },
  ];
}

// ------------------------------------------------------------------ cele doua tipuri de cale

declare const MARCA: unique symbol;
/** Calea unei pagini in forma datelor (asezarea `md`): ce poarta `RUTE`, echivalentele, contractele. */
export type CaleSursa = string & { readonly [MARCA]: "sursa" };
/** Calea asa cum o serveste domeniul (ce apare in HTML si in bara de adrese). */
export type CaleServita = string & { readonly [MARCA]: "servita" };

/** Marcheaza un sir din date drept cale SURSA. Nu traduce nimic. */
export function caSursa(cale: string): CaleSursa {
  return cale as CaleSursa;
}

/** Marcheaza un sir citit din bara de adrese (`usePathname()`) drept cale SERVITA. Nu traduce nimic. */
export function caServita(cale: string): CaleServita {
  return cale as CaleServita;
}

/** Ce trebuie sa stie asezarea despre o ruta: calea sursa si editia (lipsa = `ro-RO`, ca in manifest). */
export type RutaAsezabila = { readonly cale: string; readonly editie?: CodEditie };

type Harta = { servita: ReadonlyMap<string, string>; sursa: ReadonlyMap<string, string> };

// O harta pe lista de rute si pe asezare, calculata o data: `Tinta` cheama traducerea pe fiecare legatura.
const HARTI = new WeakMap<readonly RutaAsezabila[], Map<CodAsezare, Harta>>();

/** Calea servita a unei rute: prefixul editiei de continut inlocuit cu cel al asezarii. */
function servitaRutei(ruta: RutaAsezabila, asezare: CodAsezare): string {
  const editie = ruta.editie ?? "ro-RO";
  if (editie === "ro-RO") {
    throw new Error("asezarea " + asezare + ": ruta " + ruta.cale + " e a site-ului romanesc vechi (ro-RO), care nu se aseaza");
  }
  const vechi = EDITII[editie].prefix;
  if (vechi !== "" && ruta.cale !== vechi && !ruta.cale.startsWith(vechi + "/")) {
    throw new Error("asezarea " + asezare + ": ruta " + ruta.cale + " (" + editie + ") nu incepe cu prefixul editiei " + vechi);
  }
  let rest = ruta.cale.slice(vechi.length);
  if (rest === "/") rest = "";
  const servita = prefixServit(editie, asezare) + rest;
  return servita === "" ? "/" : servita;
}

function harta(rute: readonly RutaAsezabila[], asezare: CodAsezare): Harta {
  let peAsezare = HARTI.get(rute);
  if (peAsezare === undefined) {
    peAsezare = new Map();
    HARTI.set(rute, peAsezare);
  }
  const gata = peAsezare.get(asezare);
  if (gata !== undefined) return gata;
  const servita = new Map<string, string>();
  const sursa = new Map<string, string>();
  for (const ruta of rute) {
    const s = servitaRutei(ruta, asezare);
    const alta = sursa.get(s);
    // Bijectia pe multimea rutelor e o conditie, nu o speranta: doua rute servite la aceeasi adresa opresc totul.
    if (alta !== undefined && alta !== ruta.cale) {
      throw new Error("asezarea " + asezare + ": rutele " + alta + " si " + ruta.cale + " ar fi servite amandoua la " + s);
    }
    servita.set(ruta.cale, s);
    sursa.set(s, ruta.cale);
  }
  const noua = { servita, sursa };
  peAsezare.set(asezare, noua);
  return noua;
}

/** Calea fara fragment si interogare, si restul (`#...` sau `?...`), pastrat la traducere. */
function desparte(cale: string): [string, string] {
  const i = cale.search(/[?#]/);
  return i < 0 ? [cale, ""] : [cale.slice(0, i), cale.slice(i)];
}

/** Calea e sub prefixul englezei de pe asezarea `ro`, adica o cale deja servita? */
function subEn(cale: string): boolean {
  const en = ASEZARI.ro.en.prefix;
  return cale === en || cale.startsWith(en + "/");
}

/**
 * Calea SERVITA a unei cai SURSA. Pe `md` identitatea. Pe `ro`, o ruta din `rute` primeste prefixul asezarii,
 * cu fragmentul si interogarea pastrate; orice alta cale ramane neschimbata. Arunca pe `ro` la o cale `/en`
 * sau `/en/...`: aceea nu poate fi decat o cale deja servita (traducere de doua ori).
 */
export function caleServita(cale: CaleSursa, rute: readonly RutaAsezabila[], asezare: CodAsezare = asezareBuild()): CaleServita {
  if (asezare === "md") return cale as string as CaleServita;
  const [baza, rest] = desparte(cale);
  if (subEn(baza)) {
    throw new Error(
      "caleServita: " + cale + " e deja o cale servita pe asezarea " + asezare + " (sub " + ASEZARI.ro.en.prefix + "); datele poarta cai sursa",
    );
  }
  const s = harta(rute, asezare).servita.get(baza);
  return (s === undefined ? cale : s + rest) as CaleServita;
}

/**
 * Calea SERVITA a unei pagini a carei editie e STIUTA (o cale din tabelul de echivalente, pe randul editiei ei), pe o
 * asezare oarecare: prefixul editiei inlocuit cu cel al asezarii, fara manifestul rutelor. Pentru adresele altui
 * domeniu (grupul hreflang): pagina 3s.md `/ro/contact` e servita pe 3s.com.ro la `/contact`, oricare ar fi build-ul
 * care scrie legatura. Pe `md` identitatea (ca `caleServita`); arunca pe o cale care nu sta sub prefixul editiei ei.
 */
export function caleServitaEditiei(cale: CaleSursa, editie: EditieAsezata, asezare: CodAsezare): CaleServita {
  if (asezare === "md") return cale as string as CaleServita;
  const [baza, rest] = desparte(cale);
  return (servitaRutei({ cale: baza, editie }, asezare) + rest) as CaleServita;
}

/**
 * Calea SURSA a unei cai SERVITE: inversa lui `caleServita`, pentru ce se citeste din bara de adrese. Pe `md`
 * identitatea; pe `ro`, bijectiva pe multimea rutelor; o cale care nu e servita de nicio ruta ramane neschimbata.
 */
export function caleSursa(cale: CaleServita, rute: readonly RutaAsezabila[], asezare: CodAsezare = asezareBuild()): CaleSursa {
  if (asezare === "md") return cale as string as CaleSursa;
  const [baza, rest] = desparte(cale);
  const s = harta(rute, asezare).sursa.get(baza);
  return (s === undefined ? cale : s + rest) as CaleSursa;
}

// ------------------------------------------------------------------ citirea din browser

/**
 * Calea SURSA a paginii curente, pentru componentele de browser care aleg dupa pagina (selectorul de limba, antetul,
 * canalul pe pagina, bara mobila, blocul JSON-LD pe cale). Cititorul caii (`usePathname` din `next/navigation`, dat
 * de componenta) intoarce calea SERVITA, iar datele cu care se compara sunt SURSA; acesta e singurul loc in care cele
 * doua se intalnesc. Pe asezarea `md` intoarce exact ce da cititorul (si `null` cand el da `null`, ca fiecare
 * componenta sa-si pastreze implicitul de azi), deci randarea nu se schimba. `rute` = manifestul `RUTE`. Ambele vin ca argument: modulul nu importa nici manifestul, nici Next.
 */
export function useCaleSursa(
  rute: readonly RutaAsezabila[],
  useCaleServita: () => string | null,
  asezare: CodAsezare = asezareBuild(),
): CaleSursa | null {
  const servita = useCaleServita();
  return servita === null ? null : caleSursa(caServita(servita), rute, asezare);
}

// ------------------------------------------------------------------ perechile pentru proba de identitate

/**
 * Rutele servite de grupul unei editii care NU sunt pagini (imaginile de previzualizare ale layout-ului): nu intra in
 * `RUTE` si nu trec prin `caleServita` (adresa lor o scrie Next, din locul fisierului), dar se muta odata cu grupul,
 * deci perechea lor are prefixul asezarii. Lista se tine aici, langa regula; se schimba cand se schimba grupul.
 */
export const RUTE_GRUP: Readonly<Record<EditieAsezata, readonly string[]>> = {
  en: ["/opengraph-image", "/twitter-image"],
  "ro-MD": [],
};

/**
 * Fisierele domeniului (rutele `.ts` comune tuturor build-urilor): aceeasi cale pe orice asezare. Lista e cea din
 * colectia build-ului 3s.md. Pictogramele din `src/app` (conventia de metadate Next: `favicon.ico`, `icon.*`,
 * `<nume>-icon.*`) sunt tot fisiere ale domeniului, dar nu se scriu aici: `perechi-asezare.mjs` le citeste din
 * director si le da prin `comune`. O cale noua a colectiei care nu e nici ruta, nici aici, nici pictograma, e
 * refuzata de `perechi-asezare.mjs --colectie` (nu se imperecheaza tacut cu ea insasi).
 */
export const FISIERE_DOMENIU: readonly string[] = [
  "/robots.txt",
  "/sitemap.xml",
  "/llms.txt",
  "/manifest.webmanifest",
  "/.well-known/security.txt",
  "/indexnow.txt",
  "/instrumente/termene.ics",
  "/stamp",
];

/** Calea unei rute de grup pe o asezare. */
function servitaGrup(cale: string, editie: EditieAsezata, asezare: CodAsezare): string {
  return servitaRutei({ cale: EDITII[editie].prefix + cale, editie }, asezare);
}

/**
 * Perechile de cai intre doua asezari (`a` -> `b`), in forma fisierului citit de `compara-build.py --perechi`: fiecare
 * ruta, fiecare ruta de grup, fiecare fisier al domeniului si fiecare cale din `comune` (aceeasi pe ambele parti).
 * Arunca daca o cale ar aparea de doua ori pe vreo parte.
 */
export function perechiAsezare(
  rute: readonly RutaAsezabila[],
  a: CodAsezare = "md",
  b: CodAsezare = "ro",
  comune: readonly string[] = [],
): { a: string; b: string }[] {
  const perechi: { a: string; b: string }[] = [];
  for (const ruta of rute) perechi.push({ a: servitaRutei(ruta, a), b: servitaRutei(ruta, b) });
  for (const editie of EDITII_ASEZATE) {
    for (const cale of RUTE_GRUP[editie]) perechi.push({ a: servitaGrup(cale, editie, a), b: servitaGrup(cale, editie, b) });
  }
  for (const cale of [...FISIERE_DOMENIU, ...comune]) perechi.push({ a: cale, b: cale });
  for (const parte of ["a", "b"] as const) {
    const vazute = new Set<string>();
    for (const p of perechi) {
      if (vazute.has(p[parte])) throw new Error("perechiAsezare: calea " + p[parte] + " apare de doua ori pe partea " + parte);
      vazute.add(p[parte]);
    }
  }
  return perechi;
}
