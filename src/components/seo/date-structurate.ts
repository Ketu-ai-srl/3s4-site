// Datele structurate (JSON-LD) ale site-ului, planul valului S4, §8.2. DOAR BRANDUL (§7): numele,
// sigla, adresa site-ului si, cand exista una confirmata, adresa de e-mail a marcii. Nicio data de
// firma - denumire legala, sediu, cod fiscal, registru, telefon - fiindca site-ul nu are operator si
// nu vorbeste in numele unei firme. Poarta de SEO (S-09) refuza aceste campuri in orice nod.
//
// UN SINGUR `@id` PER ENTITATE, pe tot site-ul: organizatia, site-ul si aplicatia au fiecare un
// identificator fix, derivat din adresa site-ului. Paginile interioare le refera prin `@id`, nu le
// redeclara cu alt identificator; altfel motorul vede doua entitati acolo unde e una.
//
// Ce NU se emite, si de ce:
//   - `aggregateRating` si `review`: 3S nu are recenzii publicate; o nota inventata e publicitate
//     inselatoare (decizia D5 a owner-ului; poarta S-09 le refuza);
//   - `SearchAction`: cautarea site-ului e o paleta in pagina, fara adresa de rezultate;
//   - `parentOrganization`: firma-mama e pomenita in text, dar ar fi prima data de firma din graf.
//
// Pozitia onesta (cercetarea seo-2026, §2): `FAQPage` nu mai produce rezultate imbogatite in Google
// din 7 mai 2026, iar `SoftwareApplication` fara recenzii nu primeste stele. Le punem pentru
// dezambiguizarea entitatii si pentru motoarele care le citesc, nu ca parghie de clasare.

import { INTREBARI, META_ACASA } from "@/content/acasa";
import { BRAND, adresaMarcii } from "@/content/entitate";
import { SUBSOL } from "@/content/navigatie";
import { adresaSite, urlAbsolut } from "@/lib/site";

export type NodJsonLd = { "@type": string } & Record<string, unknown>;
export type GrafJsonLd = { "@context": "https://schema.org"; "@graph": NodJsonLd[] };

/** Identificatorii entitatilor, aceiasi pe tot site-ul. */
export function iduri(baza: string = adresaSite()) {
  return {
    organizatie: baza + "/#organizatie",
    site: baza + "/#site",
    aplicatie: baza + "/#aplicatie",
    sigla: baza + "/#sigla",
    intrebariAcasa: baza + "/#intrebari",
  };
}

/**
 * Platformele aplicatiei, dupa afirmatia confirmata din registru (`acasa-aplicatie-pe-toate-platformele`,
 * decizia D4c a owner-ului).
 */
export const SISTEME_APLICATIE = "Web, Windows, macOS, Linux, Android, iOS, iPadOS";

export function nodOrganizatie(baza: string = adresaSite()): NodJsonLd {
  const id = iduri(baza);
  const posta = adresaMarcii();
  return {
    "@type": "Organization",
    "@id": id.organizatie,
    name: BRAND.nume,
    alternateName: ["3S", SUBSOL.copyright.mentiune],
    url: baza + "/",
    logo: {
      "@type": "ImageObject",
      "@id": id.sigla,
      url: urlAbsolut(BRAND.sigla.completa, baza),
      contentUrl: urlAbsolut(BRAND.sigla.completa, baza),
      caption: BRAND.nume,
    },
    slogan: SUBSOL.brand.slogan,
    description: SUBSOL.brand.descriere,
    ...(posta === null ? {} : { email: posta }),
  };
}

export function nodSite(baza: string = adresaSite()): NodJsonLd {
  const id = iduri(baza);
  return {
    "@type": "WebSite",
    "@id": id.site,
    url: baza + "/",
    name: BRAND.nume,
    inLanguage: "ro-RO",
    publisher: { "@id": id.organizatie },
  };
}

export function nodAplicatie(baza: string = adresaSite()): NodJsonLd {
  const id = iduri(baza);
  return {
    "@type": "SoftwareApplication",
    "@id": id.aplicatie,
    name: BRAND.nume,
    url: baza + "/",
    applicationCategory: "BusinessApplication",
    operatingSystem: SISTEME_APLICATIE,
    description: META_ACASA.descriere,
    inLanguage: "ro-RO",
    publisher: { "@id": id.organizatie },
    // Planul valului, D3: toate pachetele costa 0 RON astazi (afirmatia `acasa-pret-0-ron`).
    offers: { "@type": "Offer", price: "0", priceCurrency: "RON" },
  };
}

/** Intrebarile startului, exact cele vizibile pe pagina (contractul `INTREBARI`). */
export function nodIntrebariAcasa(baza: string = adresaSite()): NodJsonLd {
  const id = iduri(baza);
  return {
    "@type": "FAQPage",
    "@id": id.intrebariAcasa,
    url: baza + "/",
    name: INTREBARI.titlu,
    inLanguage: "ro-RO",
    isPartOf: { "@id": id.site },
    mainEntity: INTREBARI.intrebari.map((i) => ({
      "@type": "Question",
      name: i.intrebare,
      acceptedAnswer: { "@type": "Answer", text: i.raspuns },
    })),
  };
}

/** Graful comun tuturor paginilor: organizatia si site-ul. */
export function grafSite(baza: string = adresaSite()): GrafJsonLd {
  return { "@context": "https://schema.org", "@graph": [nodOrganizatie(baza), nodSite(baza)] };
}

/** Graful propriu paginii de start: aplicatia, cu pretul, si intrebarile frecvente. */
export function grafAcasa(baza: string = adresaSite()): GrafJsonLd {
  return { "@context": "https://schema.org", "@graph": [nodAplicatie(baza), nodIntrebariAcasa(baza)] };
}

export type NivelFirAriadnei = { nume: string; cale: string };

/**
 * `BreadcrumbList` pentru o pagina interioara, gata de folosit de feliile S4-3 pe paginile FARA
 * `FirPagina` (primitiva fundatiei emite deja unul; doua pe aceeasi pagina ar fi redundante).
 * Nivelurile incep cu pagina de start si se termina cu pagina curenta.
 */
export function grafFirAriadnei(niveluri: NivelFirAriadnei[], baza: string = adresaSite()): GrafJsonLd {
  if (niveluri.length < 2) {
    throw new Error("firul are nevoie de cel putin doua niveluri: pagina de start si pagina curenta");
  }
  const curenta = niveluri[niveluri.length - 1];
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        "@id": urlAbsolut(curenta.cale, baza) + "#fir",
        itemListElement: niveluri.map((n, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: n.nume,
          item: urlAbsolut(n.cale, baza),
        })),
      },
    ],
  };
}

/** JSON sigur in `<script>`: `<` devine `<`, deci un `</script>` din text nu poate inchide eticheta. */
export function serializeaza(date: unknown): string {
  return JSON.stringify(date).replace(/</g, "\\u003c");
}
