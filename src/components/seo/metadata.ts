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

import type { Metadata } from "next";
import { ECHIVALENTE, type CaiPeEditie } from "@/content/echivalente";
import { BRAND } from "@/content/entitate";
import { EDITII, editiiBuild, type CodEditie } from "@/lib/editii";
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
};

function contextBuild(): ContextAlternate {
  return { alternate: alternateSite(), baza: adresaSite(), editii: editiiBuild(), echivalente: ECHIVALENTE };
}

/** Adresa completa a unei cai pe o origine; radacina fara bara finala, ca `canonical`-ul compus de Next. */
export function adresaPagina(origine: string, cale: string): string {
  return origine + (cale === "/" ? "" : cale);
}

/** Codul unei variante din lista acopera editia? Aceeasi limba; regiunea, cand e scrisa pe ambele, aceeasi. */
function variantaPentru(hreflang: string, editie: CodEditie): boolean {
  const [limba, regiune] = hreflang.toLowerCase().split("-");
  const [limbaE, regiuneE] = EDITII[editie].inLanguage.toLowerCase().split("-");
  return limba === limbaE && (regiune === undefined || regiuneE === undefined || regiune === regiuneE);
}

/**
 * `alternates` pentru o pagina: canonical-ul ei si, cand `SITE_ALTERNATE` e setata, legaturile hreflang.
 *
 * REGULILE (planul 3s.md, P-11 si P-17; harta limbi §5.3):
 *   - fara `SITE_ALTERNATE`, numai canonical-ul, exact ca inainte (HTML-ul romanesc nu se schimba);
 *   - pagina se listeaza pe ea insasi, cu codul editiei ei din catalog (`en`, `ro-MD`, `ro-RO`);
 *   - o alta editie intra numai daca tabelul de echivalente are pagina ei pentru `cheie` SI lista are o baza
 *     pentru limba ei; adresa e originea bazei plus calea din tabel (care include prefixul, `/ro/...`). Pe
 *     domeniul propriu, o editie pe care build-ul nu o construieste nu intra (pagina ei nu exista);
 *   - `ro-RO` si celelalte editii nu se leaga intre ele (P-17): gazda romaneasca nu serveste azi site-ul,
 *     deci reciproca n-ar exista, iar o pereche nereciproca e ignorata de Google;
 *   - `x-default` = echivalentul EN, cand intra; altfel pagina insasi.
 * Reciprocitatea iese din constructie: doua pagini echivalente citesc acelasi rand din tabel si aceeasi lista,
 * deci emit aceeasi multime. Arunca pe un tabel care contrazice pagina (alta cale pentru editia ei) si pe o
 * cale din tabel care nu sta sub prefixul bazei ei.
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
  const canonical = { canonical: date.cale };
  if (context.alternate.length === 0) return canonical;

  const limbi: [string, string][] = [[EDITII[editie].inLanguage, adresaPagina(context.baza, date.cale)]];
  for (const alta of Object.keys(EDITII) as CodEditie[]) {
    const cale = rand?.[alta];
    if (alta === editie || cale === undefined) continue;
    if (alta === "ro-RO" || editie === "ro-RO") continue;
    const varianta = context.alternate.find((a) => a.hreflang !== X_DEFAULT && variantaPentru(a.hreflang, alta));
    if (varianta === undefined) continue;
    const url = new URL(varianta.adresa);
    if (url.origin === context.baza && !context.editii.includes(alta)) continue;
    const prefix = url.pathname.replace(/\/+$/, "");
    if (prefix !== "" && cale !== prefix && !cale.startsWith(prefix + "/")) {
      throw new Error("tabelul de echivalente: calea " + cale + " (" + alta + ") nu sta sub prefixul " + prefix + " al bazei " + varianta.adresa);
    }
    limbi.push([EDITII[alta].inLanguage, adresaPagina(url.origin, cale)]);
  }
  const en = limbi.find(([cod]) => cod === EDITII.en.inLanguage);
  limbi.push([X_DEFAULT, (en ?? limbi[0])[1]]);
  return { ...canonical, languages: Object.fromEntries(limbi) };
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

export function metadataPagina(date: DatePagina): Metadata {
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
    alternates: alternatePagina(date),
    openGraph: {
      type: "website",
      locale: EDITII[editie].ogLocale,
      siteName: BRAND.nume,
      title: titlu,
      description: descriere,
      url: date.cale,
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
