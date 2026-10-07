// Un bloc JSON-LD in HTML-ul SERVIT (componenta de server): crawlerele care nu executa JavaScript
// il citesc la fel ca Google. Textul trece prin `serializeaza`, deci nu poate inchide eticheta.
//
// ASEZAREA (`src/lib/asezare.ts`): modulele de continut scriu adresele cu calea SURSA (`BAZA + "/ro/contact"`).
// Aici, la emitere, se traduc NUMAI valorile cheilor `url` si `item` care sunt adrese pe originea site-ului
// (`adreseServite`). `@id`-urile raman neatinse: sunt identificatori, nu adrese de vizitat, iar o traducere ar
// trebui sa deosebeasca `/#organizatie` (nivelul site-ului) de pagina EN `/`, adica exact ambiguitatea care ar rupe
// legaturile `{"@id": x}` din graf. Tot la nivelul site-ului stau `url`-urile nodurilor `Organization` si
// `WebSite`: adresa lor e site-ul (radacina domeniului), nu pagina EN de start, deci nu se traduc. Pe asezarea `md`
// graful iese exact cel primit (acelasi obiect).
//
// ADRESELE PAGINILOR ENGLEZE PE ASEZAREA `ro` URMEAZA CANONICAL-UL. Pe 3s.com.ro copia engleza de sub `/en` are
// canonical-ul (si `og:url`, cardul social) pe domeniul englezei din `SITE_ALTERNATE` (baza `en`, adica 3s.md), unde
// engleza e indexata (`canonicalEnglezei` in metadata.ts). Un `url`/`item` care numeste o pagina engleza (o ruta a
// editiei `en` din manifest) se scrie deci pe acel domeniu, cu calea SURSA (pe 3s.md asezarea e `md`, deci calea servita
// acolo e chiar calea sursa): exact adresa pe care o scrie 3s.md pentru aceeasi pagina. Asa nodul `WebPage` si firul nu
// mai spun alta adresa decat canonical-ul. Paginile romanesti si nodurile de site raman cum erau.

import { RUTE } from "@/content/rute";
import { asezareBuild, caSursa, caleServita, type CodAsezare, type RutaAsezabila } from "@/lib/asezare";
import { adresaSite, alternateSite } from "@/lib/site";
import { serializeaza, type GrafJsonLd } from "./date-structurate";

/** Cheile ale caror valori sunt adrese de pagina. */
const CHEI_ADRESA = new Set(["url", "item"]);

/** Tipurile de nod care descriu site-ul, nu o pagina: `url`-ul lor e radacina domeniului. */
const TIPURI_SITE = new Set(["Organization", "WebSite"]);

/**
 * Ce trebuie sa stie traducerea: originea site-ului, manifestul rutelor, asezarea si originea domeniului englezei (baza
 * `en` din `SITE_ALTERNATE`). Ultima se citeste numai cand graful chiar numeste o pagina engleza pe asezarea `ro`.
 */
export type ContextAdrese = { baza: string; rute: readonly RutaAsezabila[]; asezare: CodAsezare; englezei?: () => string };

/** Editia `en` din manifest: numai rutele ei au canonical-ul pe domeniul englezei cand site-ul e asezat `ro`. */
function esteRutaEn(cale: string, rute: readonly RutaAsezabila[]): boolean {
  const i = cale.search(/[?#]/);
  const fara = i < 0 ? cale : cale.slice(0, i);
  return rute.some((r) => r.cale === fara && r.editie === "en");
}

/**
 * Originea domeniului englezei: baza `en` din `SITE_ALTERNATE`, fara prefix de cale (aceeasi conditie ca la canonical-ul
 * paginilor `/en`). Arunca daca lipseste: pe asezarea `ro` metadata o cere deja, deci aici lipsa e o configurare rupta.
 */
export function origineaEnglezei(alternate: ReturnType<typeof alternateSite> = alternateSite()): string {
  const en = alternate.find((a) => a.hreflang === "en");
  if (en === undefined) {
    throw new Error("JSON-LD pe asezarea ro: SITE_ALTERNATE n-are baza en, deci adresele paginilor engleze n-au domeniul canonical-ului");
  }
  const url = new URL(en.adresa);
  if (url.pathname.replace(/\/+$/, "") !== "") {
    throw new Error("JSON-LD pe asezarea ro: baza en din SITE_ALTERNATE (" + en.adresa + ") are prefix de cale");
  }
  return url.origin;
}

function esteNodSite(nod: Record<string, unknown>): boolean {
  const tip = nod["@type"];
  return (Array.isArray(tip) ? tip : [tip]).some((t) => typeof t === "string" && TIPURI_SITE.has(t));
}

/** Adresa servita a unei adrese absolute pe originea site-ului; orice alta valoare ramane cum e. */
function adresaServita(valoare: string, c: ContextAdrese): string {
  if (!valoare.startsWith(c.baza + "/")) return valoare;
  const cale = valoare.slice(c.baza.length);
  // Pagina engleza pe asezarea `ro`: adresa canonical-ului (domeniul englezei, calea sursa), nu copia de sub `/en`.
  if (c.asezare === "ro" && esteRutaEn(cale, c.rute)) return (c.englezei ?? origineaEnglezei)() + cale;
  return c.baza + caleServita(caSursa(cale), c.rute, c.asezare);
}

function traduce(valoare: unknown, c: ContextAdrese): unknown {
  if (Array.isArray(valoare)) return valoare.map((v) => traduce(v, c));
  if (valoare === null || typeof valoare !== "object") return valoare;
  const nod = valoare as Record<string, unknown>;
  const site = esteNodSite(nod);
  const iesire: Record<string, unknown> = {};
  for (const [cheie, v] of Object.entries(nod)) {
    iesire[cheie] = CHEI_ADRESA.has(cheie) && typeof v === "string" && !site ? adresaServita(v, c) : traduce(v, c);
  }
  return iesire;
}

/**
 * Graful cu adresele `url`/`item` servite (vezi antetul): pe asezarea `ro`, paginile romanesti la adresa servita, cele
 * engleze la canonical-ul lor (domeniul englezei). Pe asezarea `md`, graful primit, neatins.
 */
export function adreseServite(date: GrafJsonLd, context: Partial<ContextAdrese> = {}): GrafJsonLd {
  const asezare = context.asezare ?? asezareBuild();
  if (asezare === "md") return date;
  return traduce(date, {
    baza: context.baza ?? adresaSite(),
    rute: context.rute ?? RUTE,
    asezare,
    englezei: context.englezei ?? (() => origineaEnglezei()),
  }) as GrafJsonLd;
}

export default function JsonLd({ date }: { date: GrafJsonLd }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeaza(adreseServite(date)) }} />;
}
