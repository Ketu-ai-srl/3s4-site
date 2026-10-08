// Textele juridice ale site-ului, in spatele comutatorului operatorului (planul valului S4, §9-§10).
//
// AZI (operator `null`) nu se publica nimic: nu exista ruta, nu exista intrare in `RUTE`, iar
// `texteJuridice()` intoarce `null`. In ziua operatorului, felia `juridic` randeaza documentele de
// aici; datele firmei vin exclusiv din operatorul rezolvat (`OPERATOR_JSON`, altfel
// `config/operator.json`, `src/lib/operator.ts`). Pasii, in ordine: `docs/ziua-operatorului.md`.
//
// DOUA FAMILII (felia 73, `./familie.ts`), alese dupa tara operatorului:
//   - `see`: cele 7 documente de azi, numai in romana, pe slugurile din `publicare.ts`;
//   - `md`: cele 8 documente ale pachetului pentru Republica Moldova (`./md/`), in romana si in engleza,
//     numai cele publicate la poarta curenta (`./md/registru.ts`), compuse pe starea masurarii
//     (`./masurare.ts`: S-C opreste construirea) si cu legaturile interne rezolvate pe cheie.
// Alta tara opreste construirea. `texteJuridice(operator, { limba, baza })` intoarce un `Map` cheie ->
// document; `documentPentruSlug` cauta in el dupa slug.

import { OPERATOR, operatorComplet, type Operator } from "@/lib/operator";
import { adresaSite } from "@/lib/site";
import { politicaConfidentialitate } from "./confidentialitate";
import { politicaCookie } from "./cookie-uri";
import { familieJuridica } from "./familie";
import { licentaAplicatiei } from "./licenta";
import { conditiiActive, intrariMasurare, masurareDin, type Masurare } from "./masurare";
import type { ContextMd } from "./md/context";
import { DOCUMENTE_MD } from "./md/documente";
import { POARTA_CURENTA, cheiPublicate, cheiePentruSlug, tintaLegatura, type CheieMd, type PoartaPublicare } from "./md/registru";
import { mentiuniLegale } from "./mentiuni-legale";
import type { SlugJuridic } from "./publicare";
import { reguliPublice } from "./reguli-publice";
import { listaSubimputerniciti } from "./subimputerniciti";
import { termeni } from "./termeni";
import { PREFIX_LEGATURA_RO } from "./tipuri";
import type { BlocJuridic, ConditieMasurare, DocumentJuridic, LimbaJuridica, ListaJuridica, SectiuneJuridica, TabelJuridic } from "./tipuri";

/** Documentele construite: cheie (slugul, la SEE; cheia din registru, la `md`) -> document. */
export type TexteJuridice = Map<string, DocumentJuridic>;

export type OptiuniTexte = {
  /** Limba documentelor: `ro` (implicit) sau `en` (numai familia `md`). */
  limba?: LimbaJuridica;
  /** Adresa site-ului (implicit `adresaSite()`); din ea, domeniul din politica SEE si `domeniu` din contextul `md`. */
  baza?: string;
  /** Familia `md`: poarta de publicare (implicit cea curenta, din registru). */
  poarta?: PoartaPublicare;
  /** Familia `md`: starea masurarii (implicit calculata din operator si din mediu; arunca pe S-C). */
  masurare?: Masurare;
  /** Familia `md`: exista pagina 3S de pe LinkedIn (blocurile `linkedin`)? Implicit nu. */
  linkedin?: boolean;
};

/** Forma de dinaintea feliei 73 (numai SEE): un obiect cu cele 7 documente, pe nume. */
export type TexteJuridiceSee = {
  confidentialitate: DocumentJuridic;
  cookie: DocumentJuridic;
  informatiiLegale: DocumentJuridic;
  termeni: DocumentJuridic;
  reguliPublice: DocumentJuridic;
  licenta: DocumentJuridic;
  subimputerniciti: DocumentJuridic;
};

function texteSee(operator: Operator, baza: string): TexteJuridiceSee {
  const domeniu = new URL(baza).host;
  return {
    confidentialitate: politicaConfidentialitate(operator, { domeniu }),
    cookie: politicaCookie(operator),
    informatiiLegale: mentiuniLegale(operator),
    termeni: termeni(operator),
    reguliPublice: reguliPublice(operator),
    licenta: licentaAplicatiei(operator),
    subimputerniciti: listaSubimputerniciti(operator),
  };
}

/** Slugurile SEE -> documentul, in ordinea din `publicare.ts`. */
function mapaSee(t: TexteJuridiceSee): TexteJuridice {
  const pe: Record<SlugJuridic, DocumentJuridic> = {
    "informatii-legale": t.informatiiLegale,
    confidentialitate: t.confidentialitate,
    termeni: t.termeni,
    cookies: t.cookie,
    "politici-publice": t.reguliPublice,
    "licenta-software": t.licenta,
    subimputerniciti: t.subimputerniciti,
  };
  return new Map(Object.entries(pe));
}

// ---------------------------------------------------------------------------------------------
// Familia md: conditiile si legaturile
// ---------------------------------------------------------------------------------------------

const TIPAR_LEGATURA = /\[([^\]]+)\]\(([^)\s]+)\)/g;
const TIPAR_CHEIE = /^(cale|cale-ro):([a-z0-9-]+)$/;

/**
 * Rezolva legaturile interne pe cheie dintr-un sir: adresa, sau textul legaturii fara legatura. O legatura `cale-ro:`
 * isi pastreaza forma in adresa rezolvata, prin `PREFIX_LEGATURA_RO`: tinta e in romana, deci pagina ii scrie `lang`
 * si `hrefLang` (`TextInLinie`). Fara prefix, forma s-ar pierde aici si ancora ar iesi fara atributele de limba.
 */
export function rezolvaLegaturi(sir: string, limba: LimbaJuridica, poarta: PoartaPublicare = POARTA_CURENTA): string {
  return sir.replace(TIPAR_LEGATURA, (tot: string, text: string, adresa: string) => {
    const m = TIPAR_CHEIE.exec(adresa);
    if (m === null) return tot;
    const tinta = tintaLegatura(m[1] as "cale" | "cale-ro", m[2], limba, poarta);
    if (tinta.fel === "text") return text;
    return "[" + text + "](" + (m[1] === "cale-ro" ? PREFIX_LEGATURA_RO : "") + tinta.cale + ")";
  });
}

function activ(conditie: readonly ConditieMasurare[] | undefined, active: ReadonlySet<ConditieMasurare>): boolean {
  return (conditie ?? []).every((c) => active.has(c));
}

function blocCompus(b: BlocJuridic, r: (s: string) => string): BlocJuridic {
  const lista: ListaJuridica | undefined = b.lista && {
    ...b.lista,
    elemente: b.lista.elemente.map(r),
    ...(b.lista.subelemente
      ? { subelemente: Object.fromEntries(Object.entries(b.lista.subelemente).map(([k, v]) => [k, v.map(r)])) }
      : {}),
  };
  const tabel: TabelJuridic | undefined = b.tabel && {
    ...b.tabel,
    titlu: r(b.tabel.titlu),
    antet: b.tabel.antet?.map(r),
    randuri: b.tabel.randuri.map((rand) => rand.map((c) => (typeof c === "string" ? r(c) : { text: r(c.text), detaliu: r(c.detaliu) }))),
  };
  return {
    ...b,
    ...(b.eticheta !== undefined ? { eticheta: r(b.eticheta) } : {}),
    paragrafe: b.paragrafe.map(r),
    ...(lista ? { lista } : {}),
    ...(tabel ? { tabel } : {}),
    ...(b.dupa ? { dupa: b.dupa.map(r) } : {}),
  };
}

/**
 * Compune un document `md`: pastreaza sectiunile si blocurile ale caror conditii sunt active si aplica
 * `r` pe fiecare sir (rezolvarea legaturilor; identitatea, pentru forma bruta din probe).
 */
export function compune(d: DocumentJuridic, active: ReadonlySet<ConditieMasurare>, r: (s: string) => string): DocumentJuridic {
  const blocuri = (bs: readonly BlocJuridic[]) => bs.filter((b) => activ(b.conditie, active)).map((b) => blocCompus(b, r));
  const sectiuni: SectiuneJuridica[] = d.sectiuni
    .filter((s) => activ(s.conditie, active))
    .map((s) => ({ ...s, titlu: r(s.titlu), blocuri: blocuri(s.blocuri) }));
  return {
    ...d,
    titlu: r(d.titlu),
    introducere: r(d.introducere),
    ...(d.preambul ? { preambul: blocuri(d.preambul) } : {}),
    sectiuni,
  };
}

/**
 * Contextul unui document `md`: operatorul, limba, masurarea si conditiile active, plus contactul operatorului
 * (`email`, `telefon` din `OPERATOR_JSON`) si domeniul (gazda adresei `baza`, adica a lui `SITE_URL`).
 */
export function contextMd(operator: Operator, limba: LimbaJuridica, masurare: Masurare, active: ReadonlySet<ConditieMasurare>, baza: string): ContextMd {
  return { operator, limba, masurare, active, contact: { email: operator.email, telefon: operator.telefon }, domeniu: new URL(baza).host };
}

/** Documentul `md` cerut, compus (conditii aplicate), cu legaturile NErezolvate. Pentru probe. */
export function documentMdBrut(
  cheie: CheieMd,
  operator: Operator,
  limba: LimbaJuridica,
  masurare: Masurare,
  linkedin = false,
  baza: string = adresaSite(),
): DocumentJuridic {
  const active = conditiiActive(masurare, linkedin);
  return compune(DOCUMENTE_MD[cheie][limba](contextMd(operator, limba, masurare, active, baza)), active, (s) => s);
}

function texteMd(operator: Operator, limba: LimbaJuridica, o: OptiuniTexte): TexteJuridice {
  const masurare = o.masurare ?? masurareDin(intrariMasurare(operator));
  const poarta = o.poarta ?? POARTA_CURENTA;
  const active = conditiiActive(masurare, o.linkedin ?? false);
  const r = (s: string) => rezolvaLegaturi(s, limba, poarta);
  const c = contextMd(operator, limba, masurare, active, o.baza ?? adresaSite());
  return new Map(cheiPublicate(poarta).map((cheie) => [cheie, compune(DOCUMENTE_MD[cheie][limba](c), active, r)]));
}

// ---------------------------------------------------------------------------------------------
// Intrarea
// ---------------------------------------------------------------------------------------------

/**
 * Documentele complete pentru operatorul dat, sau `null` cat timp nu exista unul complet. Opreste
 * construirea pe o tara fara familie, pe engleza ceruta unei familii SEE si, la `md`, pe starea S-C.
 *
 * Forma veche, cu adresa site-ului ca al doilea parametru (sir), intoarce obiectul SEE pe nume; ramane
 * cat timp o proba din afara feliei 73 o foloseste (`tests/multi-domeniu-analitica.test.ts`).
 */
export function texteJuridice(operator: Operator | null | undefined, baza: string): TexteJuridiceSee | null;
export function texteJuridice(operator?: Operator | null, optiuni?: OptiuniTexte): TexteJuridice | null;
export function texteJuridice(
  operator: Operator | null = OPERATOR,
  optiuni: OptiuniTexte | string = {},
): TexteJuridice | TexteJuridiceSee | null {
  if (!operatorComplet(operator)) {
    return null;
  }
  const familie = familieJuridica(operator);
  const o: OptiuniTexte = typeof optiuni === "string" ? { baza: optiuni } : optiuni;
  const limba = o.limba ?? "ro";
  if (familie === "md") {
    if (typeof optiuni === "string") {
      throw new Error("forma veche a lui texteJuridice (cu adresa ca sir) are numai familia SEE; pentru md: texteJuridice(operator, { limba })");
    }
    return texteMd(operator, limba, o);
  }
  if (limba !== "ro") {
    throw new Error("familia SEE are texte numai cu limba \"ro\", nu cu " + JSON.stringify(limba));
  }
  const see = texteSee(operator, o.baza ?? adresaSite());
  return typeof optiuni === "string" ? see : mapaSee(see);
}

/**
 * Documentul afisat pe adresa cu slugul dat: la SEE, slugul e cheia; la `md`, slugul (romanesc sau
 * englezesc) se cauta in registru. Arunca daca documentul nu e in texte (nepublicat la poarta curenta).
 */
export function documentPentruSlug(texte: TexteJuridice, slug: string): DocumentJuridic {
  const cheie = texte.has(slug) ? slug : cheiePentruSlug(slug);
  const document = cheie === undefined ? undefined : texte.get(cheie);
  if (document === undefined) {
    throw new Error("niciun document juridic construit pentru slugul " + JSON.stringify(slug));
  }
  return document;
}
