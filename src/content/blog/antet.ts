// Antetul YAML al unui articol (formatul lotului de articole al fabricii): ce campuri are voie sa
// aiba, ce forma are fiecare si ce inseamna. Functii pure; citirea fisierului e in `conducta.ts`.
//
//   slug              segmentul din adresa, egal cu numele fisierului fara `.mdx`
//   titlu             15-65 de caractere (pragul portii de SEO: titlul paginii e titlul articolului)
//   extras            50-160 de caractere (descrierea paginii, sapoul si textul din carduri)
//   categorie         una din `CATEGORII_BLOG`
//   data_verificarii  ziua in care faptele au fost verificate la sursa; `dateModified`
//   data_publicarii   OPTIONAL: ziua publicarii, cand difera de verificare (o re-verificare nu
//                     muta data publicarii); lipsa inseamna ca articolul a iesit in ziua verificarii
//   caseta_fapte      lista de fapte scurte (poate fi goala: caseta nu se arata)
//   surse             cel putin o sursa: `url` (http/https) si `ce_sustine`
//
// Un camp necunoscut e o eroare, nu se ignora: o greseala de tastare (`categori:`) ar lasa articolul
// fara categorie fara ca nimeni sa afle.

import { LIMITE_SEO } from "@/components/seo/metadata";
import { CATEGORII_BLOG, type CategorieBlog } from "./registru";

export type SursaArticol = { url: string; ceSustine: string };

export type AntetArticol = {
  slug: string;
  titlu: string;
  extras: string;
  categorie: CategorieBlog;
  /** ISO `YYYY-MM-DD`. */
  dataVerificarii: string;
  /** ISO `YYYY-MM-DD`: `data_publicarii` daca exista, altfel ziua verificarii. */
  dataPublicarii: string;
  casetaFapte: string[];
  surse: SursaArticol[];
};

export const CAMPURI_ANTET = [
  "slug",
  "titlu",
  "extras",
  "categorie",
  "data_verificarii",
  "data_publicarii",
  "caseta_fapte",
  "surse",
] as const;

/** Slugurile care ar umbri o ruta a blogului: `/blog/categorie/...` e ruta categoriilor. */
export const SLUGURI_REZERVATE = ["categorie"] as const;

const TIPAR_SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const TIPAR_DATA = /^(\d{4})-(\d{2})-(\d{2})$/;

// Liniuta medie (U+2013) si cea lunga (U+2014): pe site se scrie doar cratima (regula depozitului).
// Construite din coduri, ca fisierul sa nu poarte el insusi caracterele pe care le vaneaza.
export const LINIUTE_INTERZISE = new RegExp("[" + String.fromCharCode(0x2013, 0x2014) + "]");

/** O data calendaristica valida, ca sir ISO; YAML poate da un obiect `Date` pentru o valoare nescrisa intre ghilimele. */
export function dataIso(valoare: unknown): string | null {
  if (valoare instanceof Date) {
    if (Number.isNaN(valoare.getTime())) return null;
    return valoare.toISOString().slice(0, 10);
  }
  if (typeof valoare !== "string") return null;
  const m = TIPAR_DATA.exec(valoare.trim());
  if (!m) return null;
  const d = new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])));
  if (d.getUTCFullYear() !== Number(m[1]) || d.getUTCMonth() !== Number(m[2]) - 1 || d.getUTCDate() !== Number(m[3])) {
    return null;
  }
  return m[0];
}

function text(valoare: unknown): string | null {
  return typeof valoare === "string" && valoare.trim() !== "" ? valoare.trim() : null;
}

/**
 * Valideaza antetul citit din fisier. Intoarce antetul normalizat sau lista completa de erori (toate
 * deodata, ca autorul sa le repare intr-o singura trecere).
 */
export function valideazaAntet(
  date: Record<string, unknown>,
  numeFisier: string,
): { antet: AntetArticol; erori: [] } | { antet: null; erori: string[] } {
  const erori: string[] = [];
  const asteptat = numeFisier.replace(/\.mdx$/, "");

  for (const cheie of Object.keys(date)) {
    if (!(CAMPURI_ANTET as readonly string[]).includes(cheie)) {
      erori.push("camp necunoscut `" + cheie + "` (permise: " + CAMPURI_ANTET.join(", ") + ")");
    }
  }

  const slug = text(date.slug);
  if (slug === null) erori.push("lipseste `slug`");
  else {
    if (!TIPAR_SLUG.test(slug)) erori.push("`slug` are alte caractere decat litere mici, cifre si cratime: " + slug);
    if (slug !== asteptat) erori.push("`slug` (" + slug + ") difera de numele fisierului (" + asteptat + ")");
    if ((SLUGURI_REZERVATE as readonly string[]).includes(slug)) erori.push("`slug` rezervat: " + slug);
  }

  const titlu = text(date.titlu);
  if (titlu === null) erori.push("lipseste `titlu`");
  else if (titlu.length < LIMITE_SEO.titluMin || titlu.length > LIMITE_SEO.titluMax) {
    erori.push("`titlu` are " + titlu.length + " caractere, in afara intervalului " + LIMITE_SEO.titluMin + "-" + LIMITE_SEO.titluMax);
  }

  const extras = text(date.extras);
  if (extras === null) erori.push("lipseste `extras`");
  else if (extras.length < LIMITE_SEO.descriereMin || extras.length > LIMITE_SEO.descriereMax) {
    erori.push(
      "`extras` are " + extras.length + " caractere, in afara intervalului " + LIMITE_SEO.descriereMin + "-" + LIMITE_SEO.descriereMax,
    );
  }

  const categorie = date.categorie;
  if (typeof categorie !== "string" || !(CATEGORII_BLOG as readonly string[]).includes(categorie)) {
    erori.push("`categorie` trebuie sa fie una din " + CATEGORII_BLOG.join(", ") + ", nu " + JSON.stringify(categorie));
  }

  const dataVerificarii = dataIso(date.data_verificarii);
  if (dataVerificarii === null) erori.push("`data_verificarii` lipseste sau nu e o data YYYY-MM-DD");

  let dataPublicarii = dataVerificarii;
  if (date.data_publicarii !== undefined) {
    dataPublicarii = dataIso(date.data_publicarii);
    if (dataPublicarii === null) erori.push("`data_publicarii` nu e o data YYYY-MM-DD");
  }

  const fapte = date.caseta_fapte;
  const casetaFapte: string[] = [];
  if (fapte === undefined || fapte === null) {
    // lipsa inseamna caseta goala
  } else if (!Array.isArray(fapte)) {
    erori.push("`caseta_fapte` trebuie sa fie o lista");
  } else {
    fapte.forEach((f, i) => {
      const t = text(f);
      if (t === null) erori.push("`caseta_fapte`, elementul " + (i + 1) + ": gol sau nu e text");
      else casetaFapte.push(t);
    });
  }

  const surse: SursaArticol[] = [];
  if (!Array.isArray(date.surse) || date.surse.length === 0) {
    erori.push("`surse` trebuie sa aiba cel putin o sursa: articolele se sprijina pe acte citate");
  } else {
    date.surse.forEach((s, i) => {
      const eticheta = "`surse`, elementul " + (i + 1);
      if (typeof s !== "object" || s === null || Array.isArray(s)) {
        erori.push(eticheta + ": nu are forma { url, ce_sustine }");
        return;
      }
      const o = s as Record<string, unknown>;
      for (const k of Object.keys(o)) {
        if (k !== "url" && k !== "ce_sustine") erori.push(eticheta + ": camp necunoscut `" + k + "`");
      }
      const url = text(o.url);
      const ceSustine = text(o.ce_sustine);
      if (url === null || !/^https?:\/\/[^\s]+$/i.test(url)) erori.push(eticheta + ": `url` lipseste sau nu e o adresa http(s)");
      if (ceSustine === null) erori.push(eticheta + ": lipseste `ce_sustine`");
      if (url !== null && ceSustine !== null) surse.push({ url, ceSustine });
    });
  }

  const texte = [titlu, extras, ...casetaFapte, ...surse.map((s) => s.ceSustine)].filter((t): t is string => t !== null);
  if (texte.some((t) => LINIUTE_INTERZISE.test(t))) {
    erori.push("liniuta lunga sau medie in antet: pe site se scrie doar cratima");
  }

  if (erori.length > 0 || slug === null || titlu === null || extras === null || dataVerificarii === null || dataPublicarii === null) {
    return { antet: null, erori: erori.length > 0 ? erori : ["antet incomplet"] };
  }
  return {
    antet: {
      slug,
      titlu,
      extras,
      categorie: categorie as CategorieBlog,
      dataVerificarii,
      dataPublicarii,
      casetaFapte,
      surse,
    },
    erori: [],
  };
}
