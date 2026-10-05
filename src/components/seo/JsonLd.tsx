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

import { RUTE } from "@/content/rute";
import { asezareBuild, caSursa, caleServita, type CodAsezare, type RutaAsezabila } from "@/lib/asezare";
import { adresaSite } from "@/lib/site";
import { serializeaza, type GrafJsonLd } from "./date-structurate";

/** Cheile ale caror valori sunt adrese de pagina. */
const CHEI_ADRESA = new Set(["url", "item"]);

/** Tipurile de nod care descriu site-ul, nu o pagina: `url`-ul lor e radacina domeniului. */
const TIPURI_SITE = new Set(["Organization", "WebSite"]);

/** Ce trebuie sa stie traducerea: originea site-ului, manifestul rutelor si asezarea. */
export type ContextAdrese = { baza: string; rute: readonly RutaAsezabila[]; asezare: CodAsezare };

function esteNodSite(nod: Record<string, unknown>): boolean {
  const tip = nod["@type"];
  return (Array.isArray(tip) ? tip : [tip]).some((t) => typeof t === "string" && TIPURI_SITE.has(t));
}

/** Adresa servita a unei adrese absolute pe originea site-ului; orice alta valoare ramane cum e. */
function adresaServita(valoare: string, c: ContextAdrese): string {
  if (!valoare.startsWith(c.baza + "/")) return valoare;
  return c.baza + caleServita(caSursa(valoare.slice(c.baza.length)), c.rute, c.asezare);
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

/** Graful cu adresele `url`/`item` servite (vezi antetul). Pe asezarea `md`, graful primit, neatins. */
export function adreseServite(date: GrafJsonLd, context: Partial<ContextAdrese> = {}): GrafJsonLd {
  const asezare = context.asezare ?? asezareBuild();
  if (asezare === "md") return date;
  return traduce(date, { baza: context.baza ?? adresaSite(), rute: context.rute ?? RUTE, asezare }) as GrafJsonLd;
}

export default function JsonLd({ date }: { date: GrafJsonLd }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeaza(adreseServite(date)) }} />;
}
