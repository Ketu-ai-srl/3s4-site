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

import type { Metadata } from "next";
import { BRAND } from "@/content/entitate";

/**
 * Imaginea sociala: rutele fisierelor care o genereaza (numele lor, fara extensie, pe radacina
 * aplicatiei), marimea, tipul si textul alternativ. Tot de aici o ia si generatorul
 * (`imagine-sociala.tsx`), deci modulul paginii nu trage dupa el codul care deseneaza imaginea.
 */
export const CALE_IMAGINE_OG = "/opengraph-image";
export const CALE_IMAGINE_CARD = "/twitter-image";
export const MARIME_IMAGINE = { width: 1200, height: 630 };
export const TIP_IMAGINE = "image/png";
export const ALT_IMAGINE = "Sigla " + BRAND.nume + ", ADRIA Doc Management";

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
};

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
  const imagine = { ...MARIME_IMAGINE, alt: ALT_IMAGINE, type: TIP_IMAGINE };
  return {
    title: { absolute: titlu },
    description: descriere,
    alternates: { canonical: date.cale },
    openGraph: {
      type: "website",
      locale: "ro_RO",
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
