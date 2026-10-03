// Datele structurate (JSON-LD) ale site-ului, planul valului S4, §8.2. DOAR BRANDUL (§7): numele,
// sigla, adresa site-ului si canalele de contact ale domeniului (`CANALE_JSON`, `src/content/canale.ts`):
// e-mailul numai din `CANALE.email`, WhatsApp numai din `CANALE.whatsapp`. Nicio data de firma - denumire
// legala, sediu, cod fiscal, registru - fiindca site-ul nu vorbeste in numele unei firme; poarta de SEO
// (S-09) refuza aceste campuri in orice nod.
//
// FARA `telephone` (decizia 56, 03.10.2026: fara apeluri GSM, peste tot): un numar in datele structurate poate
// aduce un buton de apel in rezultatele cautarii. Punctul de contact poarta legatura WhatsApp ca `url`
// (`https://wa.me/<numar>`), deci apelurile si mesajele raman pe WhatsApp.
//
// PE EDITIE (felia metadata-hreflang): graful comun e al editiei de la radacina domeniului (`ro-RO` pe
// build-ul romanesc, `en` pe cel international), cu `inLanguage` din catalogul editiilor. Graful startului
// (aplicatia cu pretul in RON si intrebarile in romana) e numai al editiei `ro-RO`.
//
// UN SINGUR `@id` PER ENTITATE, pe tot site-ul: organizatia, site-ul si aplicatia au fiecare un
// identificator fix, derivat din adresa site-ului. Paginile interioare le refera prin `@id`, nu le
// redeclara cu alt identificator; altfel motorul vede doua entitati acolo unde e una.
//
// Ce NU se emite, si de ce:
//   - `aggregateRating` si `review`: 3S nu are recenzii publicate; o nota inventata e publicitate
//     inselatoare (decizia D5 a owner-ului; poarta S-09 le refuza);
//   - `SearchAction`: cautarea site-ului e o paleta in pagina, fara adresa de rezultate;
//   - `parentOrganization`: site-ul nu numeste alta firma decat marca (decizia D10).
//
// Pozitia onesta (cercetarea seo-2026, §2): `FAQPage` nu mai produce rezultate imbogatite in Google
// din 7 mai 2026, iar `SoftwareApplication` fara recenzii nu primeste stele. Le punem pentru
// dezambiguizarea entitatii si pentru motoarele care le citesc, nu ca parghie de clasare.

import { INTREBARI, META_ACASA } from "@/content/acasa";
import { CANALE, type Canale } from "@/content/canale";
import { BRAND, adresaMarcii } from "@/content/entitate";
import { SUBSOL } from "@/content/navigatie";
import { EDITII, type CodEditie } from "@/lib/editii";
import { adresaSite, editiaRadacinii, limbileDomeniului, urlAbsolut } from "@/lib/site";

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

/**
 * Tarile in care lucreaza marca (auditul GEO din 27.09, M2): Romania si Republica Moldova, dupa
 * tintele de lansare (3s.com.ro si 3s.md, plan §8). Codurile ISO 3166-1, ca nume de `Country`.
 */
export const TARI_DESERVITE = ["RO", "MD"] as const;

/**
 * Descrierea marcii in engleza, pentru graful editiei `en`: prima propozitie a rezumatului din `llms.txt`
 * (textul aprobat al site-ului international). Fara cifre si fara preturi.
 */
export const DESCRIERE_EN =
  "3S keeps a company's documents in a digital archive and answers questions about them, showing the document each answer comes from.";

export type OptiuniOrganizatie = {
  /** Editia grafului; implicit, cea de la radacina domeniului. */
  editie?: CodEditie;
  /** Canalele domeniului; implicit, cele ale build-ului. */
  canale?: Canale;
  /** Limbile in care raspundem (`availableLanguage`); implicit, limbile domeniului. */
  limbi?: string[];
};

/**
 * Organizatia (marca). `emailBrut` e adresa de contact a domeniului (`CANALE.email`, care cade pe
 * `config/brand.json` cand `CANALE_JSON` nu o da); parametru si pentru probe (brand sintetic). WhatsApp vine
 * din `CANALE.whatsapp`, ca `url` al punctului de contact; `telephone` nu se emite (decizia 56). Cu macar un
 * canal (e-mail sau WhatsApp) apare `contactPoint`, cu canalele date; fara niciunul lipseste,
 * fiindca un punct de contact fara nicio cale de contact n-ar spune nimic adevarat.
 */
export function nodOrganizatie(
  baza: string = adresaSite(),
  emailBrut: string = CANALE.email,
  optiuni: OptiuniOrganizatie = {},
): NodJsonLd {
  const id = iduri(baza);
  const editie = optiuni.editie ?? editiaRadacinii().cod;
  const canale = optiuni.canale ?? CANALE;
  const posta = adresaMarcii(emailBrut);
  const whatsapp = canale.whatsapp === "" ? null : "https://wa.me/" + canale.whatsapp;
  const tari = TARI_DESERVITE.map((cod) => ({ "@type": "Country", name: cod }));
  // Textele marcii: in romana din subsol; pe editia `en`, descrierea in engleza si fara slogan (n-are inca forma EN).
  const texte = editie === "en" ? { description: DESCRIERE_EN } : { slogan: SUBSOL.brand.slogan, description: SUBSOL.brand.descriere };
  return {
    "@type": "Organization",
    "@id": id.organizatie,
    // Decizia D10 (owner, 25.09): organizatia e marca "3S" si atat; niciun nume de alta firma, nici
    // in `alternateName`, nici in descriere.
    name: "3S",
    alternateName: BRAND.nume,
    url: baza + "/",
    logo: {
      "@type": "ImageObject",
      "@id": id.sigla,
      url: urlAbsolut(BRAND.sigla.iconita, baza),
      contentUrl: urlAbsolut(BRAND.sigla.iconita, baza),
      caption: BRAND.nume,
    },
    ...texte,
    areaServed: tari,
    ...(posta === null ? {} : { email: posta }),
    ...(posta === null && whatsapp === null
      ? {}
      : {
          contactPoint: {
            "@type": "ContactPoint",
            contactType: "customer support",
            ...(posta === null ? {} : { email: posta }),
            ...(whatsapp === null ? {} : { url: whatsapp }),
            availableLanguage: optiuni.limbi ?? limbileDomeniului(),
            areaServed: tari,
          },
        }),
  };
}

export function nodSite(baza: string = adresaSite(), editie: CodEditie = editiaRadacinii().cod): NodJsonLd {
  const id = iduri(baza);
  return {
    "@type": "WebSite",
    "@id": id.site,
    url: baza + "/",
    name: BRAND.nume,
    inLanguage: EDITII[editie].inLanguage,
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
    inLanguage: EDITII["ro-RO"].inLanguage,
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
    inLanguage: EDITII["ro-RO"].inLanguage,
    isPartOf: { "@id": id.site },
    mainEntity: INTREBARI.intrebari.map((i) => ({
      "@type": "Question",
      name: i.intrebare,
      acceptedAnswer: { "@type": "Answer", text: i.raspuns },
    })),
  };
}

/** Graful comun tuturor paginilor: organizatia si site-ul, pe editia data (implicit, cea de la radacina). */
export function grafSite(baza: string = adresaSite(), editie: CodEditie = editiaRadacinii().cod): GrafJsonLd {
  return { "@context": "https://schema.org", "@graph": [nodOrganizatie(baza, CANALE.email, { editie }), nodSite(baza, editie)] };
}

/** Graful propriu paginii de start romanesti: aplicatia, cu pretul in RON, si intrebarile frecvente. Numai pe `ro-RO`. */
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
