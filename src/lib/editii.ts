// EDITIILE SITE-ULUI: ce arbori de pagini exista intr-un build (fundatia editiilor, varianta A).
//
// Acelasi cod ruleaza ca aplicatii separate, cate una pe domeniu. Fiecare aplicatie construieste numai
// editiile ei, alese din `SITE_EDITII` la CONSTRUIRE:
//   - `ro-RO`: site-ul romanesc de azi, la radacina, din fisierele `page.tsx` (implicitul, cand variabila
//     lipseste sau e goala: un build fara variabila iese exact ca inainte de editii);
//   - `en`: site-ul international, la radacina, din fisierele `page.en.tsx` de sub `src/app/(en)`;
//   - `ro-MD`: romana pentru Republica Moldova, sub `/ro`, din fisierele `page.romd.tsx` de sub `src/app/(romd)`.
// Mecanismul e `pageExtensions` din `next.config.ts`: pe build-ul `ro-RO` lista e cea de azi (`ts`, `tsx`, `md`,
// `mdx`), deci `page.en.tsx` nu e pagina; pe build-ul international `tsx` simplu lipseste din lista, deci
// arborele romanesc nu e construit deloc, si raman numai sufixele editiilor. Pe asezarea `ro` a site-ului international
// (`src/lib/asezare.ts`: romana la radacina, engleza sub `/en`) raman numai fisierele-geamana `*.comro.tsx`.
//
// PROFILURILE ADMISE, si de ce numai ele (o combinatie gresita opreste construirea, nu produce un site stricat):
//   - `ro-RO` singur. Impreuna cu `en`, doua editii ar avea radacina; impreuna cu `ro-MD`, layout-ul radacina
//     romanesc (`src/app/layout.tsx`) ar invelui si radacina RO-MD, deci doua `<html>` unul in altul;
//   - `en`, cu sau fara `ro-MD`. `ro-MD` fara `en` nu are pagina de negasit: singura e `global-not-found.en.tsx`,
//     pornita numai pe profilul cu `en`.
//
// COERENTA CU `SITE_ALTERNATE` (cand e setata si cand `SITE_EDITII` NU e setata). O pereche din lista care
// numeste baza acestui site (`SITE_URL`, cu sau fara prefix) cu o limba pe care profilul nu o construieste
// opreste construirea. Cazul pe care il prinde: aplicatia 3s.md are lista de alternate, dar variabila
// `SITE_EDITII` a fost uitata; fara oprire, build-ul ar publica tacut site-ul romanesc pe domeniul
// international, cu hreflang `en` pe pagini romanesti. Un profil scris EXPLICIT e o decizie, nu o uitare, deci
// nu se mai compara (copiile din probele de browser construiesc site-ul romanesc pe o gazda straina cu
// `SITE_EDITII=ro-RO` scris, tocmai ca sa masoare alternatele).
//
// IN BROWSER. Next inlocuieste in pachetul de browser numai variabilele `NEXT_PUBLIC_*`, deci `next.config.ts`
// pune profilul validat in `NEXT_PUBLIC_SITE_EDITII` (definita mereu), iar `editiiBuild()` o citeste LITERAL,
// inaintea lui `SITE_EDITII`. Fara ea, lista de rute din browser (cautarea Ctrl+K) n-ar sti editiile serverului.
//
// Modulul nu importa nimic: il citesc si `next.config.ts`, si pachetul de browser (prin `src/content/rute.ts`).

/** Codul unei editii: limba cu regiunea, ca in hreflang. */
export type CodEditie = "ro-RO" | "en" | "ro-MD";

export type Editie = {
  cod: CodEditie;
  /** Prefixul de cale al editiei: "" la radacina, "/ro" pentru RO-MD. */
  prefix: "" | "/ro";
  /** Extensia fisierelor de pagina si de layout ale editiei, cum o primeste `pageExtensions`. */
  sufix: "tsx" | "en.tsx" | "romd.tsx";
  /** Grupul de rute din `src/app` care tine arborele editiei; `null` pentru arborele romanesc de azi. */
  grup: "(en)" | "(romd)" | null;
  /** Atributul `lang` al elementului `<html>`. */
  lang: "ro" | "en";
  /** `og:locale`. */
  ogLocale: "ro_RO" | "en_US" | "ro_MD";
  /** `inLanguage` din datele structurate. */
  inLanguage: CodEditie;
};

/** Catalogul editiilor, in ordinea canonica (cea in care se scriu in `NEXT_PUBLIC_SITE_EDITII`). */
export const EDITII: Readonly<Record<CodEditie, Editie>> = {
  "ro-RO": { cod: "ro-RO", prefix: "", sufix: "tsx", grup: null, lang: "ro", ogLocale: "ro_RO", inLanguage: "ro-RO" },
  en: { cod: "en", prefix: "", sufix: "en.tsx", grup: "(en)", lang: "en", ogLocale: "en_US", inLanguage: "en" },
  "ro-MD": { cod: "ro-MD", prefix: "/ro", sufix: "romd.tsx", grup: "(romd)", lang: "ro", ogLocale: "ro_MD", inLanguage: "ro-MD" },
};

const ORDINE: readonly CodEditie[] = ["ro-RO", "en", "ro-MD"];

/** Numele variabilei din mediu si al celei pentru pachetul de browser, ca mesajele sa le spuna la fel peste tot. */
export const VARIABILA_EDITII = "SITE_EDITII";
export const VARIABILA_EDITII_PUBLICA = "NEXT_PUBLIC_SITE_EDITII";

/** Profilul implicit: site-ul romanesc, ca inainte de editii. */
export const PROFIL_IMPLICIT: readonly CodEditie[] = ["ro-RO"];

/** Codul in forma canonica (`ro-md` -> `ro-MD`), sau `null` cand nu e o editie din catalog. */
function codCanonic(brut: string): CodEditie | null {
  const text = brut.trim().toLowerCase();
  return ORDINE.find((c) => c.toLowerCase() === text) ?? null;
}

/**
 * Profilul din textul variabilei (`en,ro-MD`), validat si in ordinea canonica. Gol sau lipsa = profilul
 * implicit. Arunca, cu motivul, pe un cod necunoscut, pe un cod repetat si pe o combinatie neadmisa.
 */
export function editiiDinText(valoare: string | undefined, nume: string = VARIABILA_EDITII): CodEditie[] {
  const brut = (valoare ?? "").trim();
  if (brut === "") return [...PROFIL_IMPLICIT];
  const alese = new Set<CodEditie>();
  for (const bucata of brut.split(",")) {
    if (bucata.trim() === "") continue;
    const cod = codCanonic(bucata);
    if (cod === null) {
      throw new Error(nume + ': editia "' + bucata.trim() + '" nu exista; editiile sunt ' + ORDINE.join(", "));
    }
    if (alese.has(cod)) throw new Error(nume + ': editia "' + cod + '" apare de doua ori');
    alese.add(cod);
  }
  if (alese.size === 0) return [...PROFIL_IMPLICIT];
  if (alese.has("ro-RO") && alese.has("en")) {
    throw new Error(nume + ": ro-RO si en nu pot fi in acelasi build - amandoua sunt la radacina (doua site-uri pe aceleasi adrese)");
  }
  if (alese.has("ro-RO") && alese.size > 1) {
    throw new Error(
      nume + ": ro-RO se construieste singur - layout-ul lui radacina ar invelui si celelalte editii (doua <html> unul in altul)",
    );
  }
  if (alese.has("ro-MD") && !alese.has("en")) {
    throw new Error(nume + ": ro-MD se construieste numai impreuna cu en - pagina de negasit a domeniului e cea in engleza");
  }
  return ORDINE.filter((c) => alese.has(c));
}

/**
 * Editiile acestui build. Doua surse, in ordinea asta: `NEXT_PUBLIC_SITE_EDITII` (pusa de `next.config.ts`
 * din profilul validat; scrisa LITERAL, ca Next s-o inlocuiasca si in pachetul de browser), apoi
 * `SITE_EDITII` (pe server in afara build-ului si in probe).
 */
export function editiiBuild(): CodEditie[] {
  const calculata = process.env.NEXT_PUBLIC_SITE_EDITII;
  if (calculata !== undefined && calculata.trim() !== "") return editiiDinText(calculata, VARIABILA_EDITII_PUBLICA);
  return editiiDinText(process.env.SITE_EDITII);
}

/** Editia e in acest build? */
export function editiaInBuild(cod: CodEditie, editii: readonly CodEditie[] = editiiBuild()): boolean {
  return editii.includes(cod);
}

/**
 * Sufixul fisierelor-geamana ale asezarii `ro` (`src/lib/asezare.ts`): grupurile `(comro)` (romana la radacina) si
 * `(comroen)` (engleza sub `/en`). Fiecare fisier de acolo reexporta pagina, ruta sau layout-ul geaman din `(romd)` sau
 * `(en)`, deci continutul ramane unul singur; sufixul decide numai ce arbore construieste un build.
 */
export const SUFIX_ASEZARE_RO = "comro.tsx";

/**
 * Valoarea lui `pageExtensions` pentru un profil si o asezare. Pe `ro-RO`, exact lista de dinainte de editii. Pe
 * asezarea `ro` (care cere profilul `en,ro-MD`), EXACT `["comro.tsx","ts","md","mdx"]`: daca ar ramane `en.tsx` sau
 * `romd.tsx`, `/` ar fi servita de doua pagini (`(en)/page.en.tsx` si `(comro)/page.comro.tsx`), iar romana ar exista si
 * sub `/ro`. Pe asezarea `md` (implicitul) lista e cea de dinainte de asezari, deci fisierele `*.comro.tsx` nu sunt
 * rute nici pe 3s.md, nici pe site-ul romanesc (acelasi principiu ca `page.en.tsx` pe build-ul romanesc).
 * Asezarea se da ca text (`md` / `ro`), nu prin tipul din `asezare.ts`: modulul acesta nu importa nimic.
 */
export function extensiiPagini(editii: readonly CodEditie[], asezare: "md" | "ro" = "md"): string[] {
  if (editii.includes("ro-RO")) return ["ts", "tsx", "md", "mdx"];
  if (asezare === "ro") return [SUFIX_ASEZARE_RO, "ts", "md", "mdx"];
  return [...editii.map((c) => EDITII[c].sufix), "ts", "md", "mdx"];
}

/**
 * Pagina de negasit globala e pornita numai pe profilul cu `en`. Fisierul il alege `pageExtensions`, deci urmeaza
 * singur asezarea: `global-not-found.en.tsx` pe `md`, `global-not-found.comro.tsx` (romana) pe `ro`. Asezarea `ro` cere
 * profilul `en,ro-MD`, deci raspunsul e acelasi pe ambele asezari.
 */
export function cuNegasitGlobal(editii: readonly CodEditie[]): boolean {
  return editii.includes("en");
}

/** Limba (fara regiune) a unui cod hreflang, si regiunea, daca are. */
function parti(cod: string): { limba: string; regiune: string | null } {
  const [limba, regiune] = cod.split("-");
  return { limba: limba.toLowerCase(), regiune: regiune === undefined ? null : regiune.toUpperCase() };
}

/** Un cod hreflang (`ro`, `ro-MD`, `en-US`) acopera editia data? Limba trebuie sa fie aceeasi, iar regiunea, cand e scrisa, si ea. */
function hreflangPentruEditie(hreflang: string, editie: Editie): boolean {
  const h = parti(hreflang);
  const e = parti(editie.inLanguage);
  if (h.limba !== e.limba) return false;
  return h.regiune === null || e.regiune === null || h.regiune === e.regiune;
}

/**
 * Perechile `cod=adresa` din textul lui `SITE_ALTERNATE`, cu adresa redusa la origine plus prefix (fara bara
 * finala). Citire INGADUITOARE: o intrare fara forma se sare, fiindca validarea completa a listei o face
 * `alternateSite` (`src/lib/site.ts`) la construirea paginilor si opreste build-ul acolo, cu mesajul ei.
 * Modulul nu o importa: `src/lib/site.ts` trage manifestul de rute, iar acesta e citit de `next.config.ts`.
 */
export function perechiAlternate(valoare: string | undefined): { hreflang: string; adresa: string }[] {
  const perechi: { hreflang: string; adresa: string }[] = [];
  for (const intrare of (valoare ?? "").split(",")) {
    const semn = intrare.indexOf("=");
    if (semn < 0) continue;
    try {
      const url = new URL(intrare.slice(semn + 1).trim());
      perechi.push({ hreflang: intrare.slice(0, semn).trim(), adresa: url.origin + url.pathname.replace(/\/+$/, "") });
    } catch {
      continue;
    }
  }
  return perechi;
}

/** Originea din `SITE_URL`, sau `null` cand variabila lipseste ori nu e o adresa (atunci coerenta nu se masoara). */
export function origineSite(valoare: string | undefined): string | null {
  const brut = (valoare ?? "").trim();
  if (brut === "") return null;
  try {
    return new URL(brut).origin;
  } catch {
    return null;
  }
}

/**
 * Coerenta profilului cu `SITE_ALTERNATE` (antetul modulului). `alternate` sunt perechile listei, `baza`
 * originea acestui site. Intoarce lista problemelor; goala = coerent. `explicit` spune daca `SITE_EDITII` a
 * fost scrisa: un profil explicit nu se compara.
 */
export function problemeCoerenta(
  editii: readonly CodEditie[],
  alternate: readonly { hreflang: string; adresa: string }[],
  baza: string,
  explicit: boolean,
): string[] {
  if (explicit) return [];
  const probleme: string[] = [];
  for (const a of alternate) {
    if (a.hreflang === "x-default") continue;
    const peBaza = a.adresa === baza || a.adresa.startsWith(baza + "/");
    if (!peBaza) continue;
    const prefix = a.adresa.slice(baza.length);
    const potrivita = editii.some((c) => EDITII[c].prefix === prefix && hreflangPentruEditie(a.hreflang, EDITII[c]));
    if (!potrivita) {
      probleme.push(
        "SITE_ALTERNATE numeste acest site (" +
          a.adresa +
          ") pentru limba " +
          a.hreflang +
          ", dar profilul construit e " +
          editii.join(",") +
          " (SITE_EDITII nesetata). Se seteaza SITE_EDITII cu editiile domeniului (de pilda en,ro-MD), altfel site-ul romanesc ar iesi pe adresa declarata " +
          a.hreflang,
      );
    }
  }
  return probleme;
}
