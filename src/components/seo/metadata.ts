// Metadata unei pagini, dintr-un singur apel (planul valului S4, §5.1 regula 7 si §8.1): titlul si
// descrierea in pragurile portii de SEO, canonical-ul pe adresa site-ului, Open Graph si cardul
// social. Feliile de pagini il folosesc asa:
//
//     export const metadata = metadataPagina({ titlu: "...", descriere: "...", cale: "/preturi" });
//
// CANONICAL-UL se da relativ (`/preturi`); Next il compune cu `metadataBase` din layout, care vine
// din `SITE_URL` (`src/lib/site.ts`). Asa, la lansare, toate canonical-urile se muta impreuna.
//
// PRAGURILE sunt ale portii (`.claude/scripts/porti/poarta-seo.py`, PRAGURI: titlu 15-65, descriere
// 50-160); proba le compara cu cele de acolo, ca sa nu poata diverge. Un text in afara lor opreste
// construirea aici, inainte sa ajunga la poarta.
//
// IMAGINEA SOCIALA se da aici EXPLICIT. O genereaza `src/app/opengraph-image.tsx` (si, pentru
// card, `src/app/twitter-image.tsx`) din sigla oficiala, iar Next o pune singur numai pe paginile
// care nu-si declara `openGraph` / `twitter`: obiectul declarat de pagina il inlocuieste pe cel din
// layout, cu imagine cu tot (Next 15.5, `resolve-metadata`: imaginea din fisier intra doar cand
// nivelul curent nu are `images`). Fara randurile de mai jos, fiecare pagina interioara ar iesi
// fara og:image si fara twitter:image - masurat de critic pe 25.09.2026, pe o pagina construita.
// Adresele, marimea si textul imaginii sunt ale fisierelor de mai sus; proba le compara, ca sa nu
// poata diverge (tests/seo-geo-gdpr.test.ts), iar proba de browser cere imaginea servita, 200
// image/png, pe fiecare ruta din RUTE (tests/browser/geo.spec.ts).
//
// Titlul se da ABSOLUT: sablonul "%s | 3S" din layout ar muta lungimea peste prag fara ca pagina
// sa stie.
//
// EDITIA SI CHEIA (felia metadata-hreflang). O pagina a site-ului international da si `editie` (`en`,
// `ro-MD`) si `cheie` (identificatorul ei peste editii, din `src/content/echivalente.ts`):
//
//     export const metadata = metadataPagina({ titlu, descriere, cale: "/pricing", editie: "en", cheie: "preturi" });
//
// Lipsa = `ro-RO`, fara cheie: paginile romanesti nu se schimba. Din editie vin `og:locale` (catalogul din
// `src/lib/editii.ts`) si textul alternativ al imaginii; din cheie, alternatele hreflang.
//
// ALTERNATELE HREFLANG se scriu AICI, in `alternates.languages`, deci Next le pune in `<head>`-ul servit, pe
// server. Inainte le punea o piesa de browser din layout, spre ACEEASI cale pe fiecare varianta; regula aceea
// s-a retras odata cu editiile (`/preturi` si `/pricing` sunt aceeasi pagina). Regulile, in `alternatePagina`.
//
// ASEZAREA (`src/lib/asezare.ts`): `cale` e calea SURSA a paginii (cea din `RUTE` si din tabelul de echivalente) si
// se compara asa; canonical-ul, `og:url` si adresa paginii insesi in lista hreflang se scriu cu calea SERVITA. Lista
// hreflang se face pe variantele servite ale celor doua domenii (`alternatePagina`), iar `og:locale` vine din asezare
// (pe 3s.com.ro romana e `ro_RO`). Pe asezarea `md` calea servita e chiar calea, iar atributele sunt cele din catalog.

import type { Metadata } from "next";
import { ECHIVALENTE, type CaiPeEditie } from "@/content/echivalente";
import { BRAND } from "@/content/entitate";
import { RUTE } from "@/content/rute";
import {
  VARIANTE_SERVITE,
  asezareBuild,
  atributeLimba,
  caSursa,
  caleServita,
  caleServitaEditiei,
  hrefLangServit,
  type CodAsezare,
  type RutaAsezabila,
} from "@/lib/asezare";
import { EDITII, editiiBuild, problemeAlternateAsezare, type CodEditie } from "@/lib/editii";
import { X_DEFAULT, adresaSite, alternateSite, type Alternata } from "@/lib/site";

/**
 * Imaginea sociala: rutele fisierelor care o genereaza (numele lor, fara extensie, pe radacina
 * aplicatiei), marimea, tipul si textul alternativ. Tot de aici o ia si generatorul
 * (`imagine-sociala.tsx`), deci modulul paginii nu trage dupa el codul care deseneaza imaginea.
 */
export const CALE_IMAGINE_OG = "/opengraph-image";
export const CALE_IMAGINE_CARD = "/twitter-image";
export const MARIME_IMAGINE = { width: 1200, height: 630 };
export const TIP_IMAGINE = "image/png";
export const ALT_IMAGINE = "Sigla " + BRAND.nume;
/**
 * Textul alternativ al imaginii pe paginile editiei `en`. Imaginea e aceeasi (iconita marcii); pe build-ul
 * international o servesc rutele `src/app/(en)/opengraph-image/route.en.tsx` si `twitter-image/route.en.tsx`,
 * la aceleasi adrese. Rute, nu fisiere de metadata: un `opengraph-image.en.tsx` schimba build-ul romanesc
 * (masurat la alegerea variantei editiilor).
 */
export const ALT_IMAGINE_EN = BRAND.nume + " logo";

/** Textul alternativ al imaginii sociale pe editia data. */
export function altImagine(editie: CodEditie): string {
  return editie === "en" ? ALT_IMAGINE_EN : ALT_IMAGINE;
}

export const LIMITE_SEO = {
  titluMin: 15,
  titluMax: 65,
  descriereMin: 50,
  descriereMax: 160,
} as const;

export type DatePagina = {
  titlu: string;
  descriere: string;
  /** Calea paginii, exact ca in `RUTE`: incepe cu `/`, fara parametri si fara ancora. */
  cale: string;
  /** Editia paginii; lipsa = `ro-RO`. */
  editie?: CodEditie;
  /** Cheia paginii peste editii (`src/content/echivalente.ts`); lipsa = pagina fara echivalente. */
  cheie?: string;
};

/** Ce primeste `alternatePagina` din afara; probele dau valori proprii, paginile iau implicitele build-ului. */
export type ContextAlternate = {
  /** Variantele din `SITE_ALTERNATE`, validate (`alternateSite`). Lista goala = nicio legatura. */
  alternate: readonly Alternata[];
  /** Originea acestui site (`SITE_URL`). */
  baza: string;
  /** Editiile acestui build (`SITE_EDITII`). */
  editii: readonly CodEditie[];
  /** Tabelul de echivalente. */
  echivalente: Readonly<Record<string, CaiPeEditie>>;
  /** Asezarea si manifestul rutelor, pentru calea servita; lipsa = cele ale build-ului. */
  asezare?: CodAsezare;
  rute?: readonly RutaAsezabila[];
};

/** Calea servita a paginii, pe asezarea si rutele din context (implicit cele ale build-ului). */
export function caleServitaPagina(cale: string, context: Pick<ContextAlternate, "asezare" | "rute"> = {}): string {
  return caleServita(caSursa(cale), context.rute ?? RUTE, context.asezare ?? asezareBuild());
}

function contextBuild(): ContextAlternate {
  return { alternate: alternateSite(), baza: adresaSite(), editii: editiiBuild(), echivalente: ECHIVALENTE };
}

/** Adresa completa a unei cai pe o origine; radacina fara bara finala, ca `canonical`-ul compus de Next. */
export function adresaPagina(origine: string, cale: string): string {
  return origine + (cale === "/" ? "" : cale);
}

/**
 * `alternates` pentru o pagina: canonical-ul ei si, cand `SITE_ALTERNATE` e setata, legaturile hreflang.
 *
 * REGULILE (planul 3s.md, P-11 si P-17; harta limbi §5.3; doua domenii, specificatia 3s.com.ro §3):
 *   - fara `SITE_ALTERNATE`, numai canonical-ul, exact ca inainte (HTML-ul romanesc nu se schimba);
 *   - grupul se face pe VARIANTELE SERVITE (`VARIANTE_SERVITE`, `src/lib/asezare.ts`), nu pe editiile de continut: un cod
 *     numeste un continut asezat pe un domeniu (`ro-RO` = continutul `ro-MD` la radacina 3s.com.ro, `ro-MD` = acelasi
 *     continut sub `/ro` pe 3s.md). Pagina se listeaza pe ea insasi, cu codul variantei ei (pe asezarea `ro`, pagina
 *     `ro-MD` e `ro-RO`), si sare numai varianta ei, nu editia ei de continut: altfel, pe 3s.com.ro, echivalentul
 *     `https://3s.md/ro/...` (acelasi continut, alta varianta) n-ar fi emis niciodata;
 *   - o alta varianta intra numai daca tabelul de echivalente are pagina editiei ei pentru `cheie` SI lista are baza
 *     codului ei; adresa e originea bazei plus calea SERVITA pe asezarea variantei. Pe domeniul propriu, o varianta pe
 *     care build-ul nu o construieste (alta asezare, editie lipsa din profil) nu intra (pagina ei nu exista);
 *   - P-17, ingustata: paginile site-ului romanesc vechi (editia `ro-RO`, 3s4.ke2.in) se listeaza numai pe ele;
 *   - pe asezarea `ro`, paginile engleze (`/en/...`) nu au legaturi hreflang si au canonical-ul spre aceeasi pagina de
 *     pe domeniul englezei din lista (`canonicalEnglezei`): nu sunt varianta canonica a englezei, deci nu intra in grup;
 *   - `x-default` = varianta `en`, cand intra; altfel pagina insasi.
 * Reciprocitatea iese din constructie: paginile unui grup citesc acelasi rand din tabel si aceeasi lista, pe orice
 * domeniu, deci emit aceeasi multime. Adresa altei variante se traduce dupa EDITIA ei (`caleServitaEditiei`), nu dupa
 * manifestul acestui build: pe 3s.md, pagina `/ro/contact` scrie `ro-RO` -> `https://3s.com.ro/contact`. Arunca pe un
 * tabel care contrazice pagina (alta cale pentru editia ei), pe o cale care nu sta sub prefixul editiei ei sau al bazei
 * ei, si pe o lista necoerenta cu asezarea (`problemeAlternateAsezare`).
 */
export function alternatePagina(
  date: Pick<DatePagina, "cale" | "editie" | "cheie">,
  context: ContextAlternate = contextBuild(),
): NonNullable<Metadata["alternates"]> {
  const editie = date.editie ?? "ro-RO";
  const rand = date.cheie === undefined ? undefined : context.echivalente[date.cheie];
  const proprie = rand?.[editie];
  if (proprie !== undefined && proprie !== date.cale) {
    throw new Error(
      "metadataPagina(" + date.cale + "): tabelul de echivalente da pentru cheia " + date.cheie + " si editia " + editie + " calea " + proprie,
    );
  }
  const servita = caleServitaPagina(date.cale, context);
  const canonical = { canonical: servita };
  if (context.alternate.length === 0) return canonical;
  const adresaProprie = adresaPagina(context.baza, servita);
  if (editie === "ro-RO") {
    return { ...canonical, languages: { [EDITII["ro-RO"].inLanguage]: adresaProprie, [X_DEFAULT]: adresaProprie } };
  }
  const asezare = context.asezare ?? asezareBuild();
  const probleme = problemeAlternateAsezare(asezare, context.alternate, context.baza, Object.keys(VARIANTE_SERVITE));
  if (probleme.length > 0) throw new Error(probleme.join(" | "));
  if (asezare === "ro" && editie === "en") return { canonical: canonicalEnglezei(date.cale, context.alternate) };

  const limbi: [string, string][] = [[hrefLangServit(editie, asezare), adresaProprie]];
  for (const [cod, varianta] of Object.entries(VARIANTE_SERVITE)) {
    if (varianta.editie === editie && varianta.asezare === asezare) continue;
    const cale = rand?.[varianta.editie];
    if (cale === undefined) continue;
    const baza = context.alternate.find((a) => a.hreflang === cod);
    if (baza === undefined) continue;
    const url = new URL(baza.adresa);
    if (url.origin === context.baza && (varianta.asezare !== asezare || !context.editii.includes(varianta.editie))) continue;
    const servitaVariantei: string = caleServitaEditiei(caSursa(cale), varianta.editie, varianta.asezare);
    const prefix = url.pathname.replace(/\/+$/, "");
    if (prefix !== "" && servitaVariantei !== prefix && !servitaVariantei.startsWith(prefix + "/")) {
      throw new Error(
        "tabelul de echivalente: calea " + servitaVariantei + " (" + cod + ") nu sta sub prefixul " + prefix + " al bazei " + baza.adresa,
      );
    }
    limbi.push([cod, adresaPagina(url.origin, servitaVariantei)]);
  }
  const en = limbi.find(([cod]) => cod === EDITII.en.inLanguage);
  limbi.push([X_DEFAULT, (en ?? limbi[0])[1]]);
  return { ...canonical, languages: Object.fromEntries(limbi) };
}

/**
 * Canonical-ul unei pagini engleze de pe asezarea `ro` (3s.com.ro/en/...): adresa COMPLETA a aceleiasi pagini pe
 * domeniul englezei din grup (baza `en` din `SITE_ALTERNATE`, adica 3s.md), unde engleza e indexata. Copia de sub `/en`
 * ramane pentru vizitatori, cu contactele domeniului, dar nu concureaza in index cu originalul. Fara lista, domeniul
 * englezei nu se cunoaste, deci canonical-ul ramane calea servita a paginii (ca fara `SITE_ALTERNATE` peste tot).
 */
function canonicalEnglezei(cale: string, alternate: readonly Alternata[]): string {
  const en = alternate.find((a) => a.hreflang === EDITII.en.inLanguage);
  if (en === undefined) return caleServitaPagina(cale, { asezare: "ro" });
  const url = new URL(en.adresa);
  const prefix = url.pathname.replace(/\/+$/, "");
  if (prefix !== "") {
    throw new Error("SITE_ALTERNATE: baza en (" + en.adresa + ") are prefix de cale; pe asezarea ro canonical-ul englezei cere engleza la radacina");
  }
  return adresaPagina(url.origin, caleServitaEditiei(caSursa(cale), "en", "md"));
}

/** Ce nu respecta pragurile sau forma caii. Lista goala = metadata buna. */
export function abateriMetadata({ titlu, descriere, cale }: DatePagina): string[] {
  const abateri: string[] = [];
  const t = titlu.trim();
  const d = descriere.trim();
  if (t.length < LIMITE_SEO.titluMin || t.length > LIMITE_SEO.titluMax) {
    abateri.push("titlu de " + t.length + " caractere, in afara intervalului 15-65: " + t);
  }
  if (d.length < LIMITE_SEO.descriereMin || d.length > LIMITE_SEO.descriereMax) {
    abateri.push("descriere de " + d.length + " caractere, in afara intervalului 50-160");
  }
  if (!/^\/[^?#\s]*$/.test(cale) || (cale.length > 1 && cale.endsWith("/"))) {
    abateri.push("cale care nu e o ruta a site-ului: " + cale);
  }
  return abateri;
}

export function metadataPagina(date: DatePagina, asezare: Pick<ContextAlternate, "asezare" | "rute"> = {}): Metadata {
  const abateri = abateriMetadata(date);
  if (abateri.length > 0) {
    throw new Error("metadataPagina(" + date.cale + "): " + abateri.join("; "));
  }
  const titlu = date.titlu.trim();
  const descriere = date.descriere.trim();
  const editie = date.editie ?? "ro-RO";
  const imagine = { ...MARIME_IMAGINE, alt: altImagine(editie), type: TIP_IMAGINE };
  return {
    title: { absolute: titlu },
    description: descriere,
    alternates: alternatePagina(date, { ...contextBuild(), ...asezare }),
    openGraph: {
      type: "website",
      locale: editie === "ro-RO" ? EDITII[editie].ogLocale : atributeLimba(editie, asezare.asezare ?? asezareBuild()).ogLocale,
      siteName: BRAND.nume,
      title: titlu,
      description: descriere,
      url: caleServitaPagina(date.cale, asezare),
      images: [{ url: CALE_IMAGINE_OG, ...imagine }],
    },
    twitter: {
      card: "summary_large_image",
      title: titlu,
      description: descriere,
      images: [{ url: CALE_IMAGINE_CARD, ...imagine }],
    },
  };
}
