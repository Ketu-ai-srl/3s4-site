// Forma comuna a textelor juridice: un document are sectiuni cu o CHEIE stabila, iar fiecare
// sectiune are blocuri, eventual legate de o jurisdictie. Pagina care le randeaza (felia `juridic`)
// pune cheia in atributul cerut de porti - `data-art13` pe politica de confidentialitate (G-MD-01),
// `data-l284` pe politica de cookie-uri (G-MD-08) - si jurisdictia in `data-jurisdictie` (G-MD-10).
//
// COMPLETAREA FELIEI `juridic` (valul S4-4), fara sa schimbe ce exista: un bloc poate avea, dupa
// paragrafe, o lista si un tabel (sablonul juridic A, §5-§6), apoi paragrafe de incheiere; o
// sectiune poate avea titlu de nivel 3 (articolele anexei din termeni) si un separator cu ancora
// inaintea ei. Campurile noi sunt optionale, deci textele feliei 44 raman valide asa cum sunt.
//
// COMPLETAREA FELIEI 73 (familia `md`, operatorul din Republica Moldova), tot numai campuri optionale,
// deci textele SEE raman valide si neschimbate: limba documentului; o CONDITIE pe sectiune si pe bloc
// (starea masurarii, `./masurare.ts`: blocul intra in document numai daca toate cheile ei sunt active);
// cheia documentului in registrul familiei; un preambul (blocurile dintre introducere si prima
// sectiune, cum le au documentele pachetului: blocul temporar, rezumatul "pe scurt"); subelementele
// unei liste. LEGATURA INTERNA PE CHEIE: in marcajul in linie, `[text](cale:<cheie>)` si
// `[text](cale-ro:<cheie>)` nu sunt adrese, ci chei; le rezolva `./index.ts` la construire: cheie
// publicata -> adresa ei, cheie cunoscuta dar nepublicata -> text fara legatura, cheie necunoscuta ->
// construirea se opreste. Starea S-C (`umami-c` in pachet) NU are cheie de conditie: nu se compune.
//
// MARCAJUL IN LINIE, singurul permis in siruri: `**text**` = accent (`strong`) si
// `[text](adresa)` = legatura. `textSimplu` il scoate; `fragmenteInLinie` il desface pentru pagina.

import type { Jurisdictie } from "./autoritati";

export type ListaJuridica = {
  /** `true` = lista numerotata (`ol`); altfel cu buline (`ul`). */
  numerotata?: boolean;
  elemente: string[];
  /** Subelementele (lista cu buline) de sub elementul cu indexul dat. */
  subelemente?: Record<number, string[]>;
};

/** Cheile de conditie ale blocurilor din familia `md` (tabelul starilor din pachetul juridic). */
export const CONDITII_MASURARE = ["banner", "ga4", "umami", "umami-b", "activ", "s0", "linkedin"] as const;
export type ConditieMasurare = (typeof CONDITII_MASURARE)[number];

/** Limba unui document: SEE are numai romana; `md` are romana si engleza americana. */
export type LimbaJuridica = "ro" | "en";

/** O legatura interna pe cheie, ca adresa in marcajul in linie: `cale:<cheie>` sau `cale-ro:<cheie>`. */
export const TIPAR_LEGATURA_INTERNA = /^(cale|cale-ro):([a-z0-9-]+)$/;

/** O celula de tabel: text, sau un nume in `strong` cu un rand de detaliu in `small` (sablon §6). */
export type CelulaJuridica = string | { text: string; detaliu: string };

export type TabelJuridic = {
  /** `cheie-valoare`: fiecare rand = eticheta + valoare; `cu-antet`: un rand de capete, apoi date. */
  forma: "cheie-valoare" | "cu-antet";
  /** Titlul tabelului pentru cititoarele de ecran (`caption`). */
  titlu: string;
  antet?: string[];
  randuri: CelulaJuridica[][];
};

export type BlocJuridic = {
  /** `null` = se aplica tuturor vizitatorilor; altfel numai jurisdictiei numite. */
  jurisdictie: Jurisdictie | null;
  /** Randul de deasupra blocului, cand paragrafele nu spun singure pentru cine sunt. */
  eticheta?: string;
  paragrafe: string[];
  lista?: ListaJuridica;
  tabel?: TabelJuridic;
  /** Paragrafele de dupa lista sau tabel. */
  dupa?: string[];
  /** Blocul intra in document numai cand toate aceste conditii sunt active (familia `md`). */
  conditie?: ConditieMasurare[];
};

export type SectiuneJuridica = {
  cheie: string;
  titlu: string;
  /** Nivelul titlului: 2 (implicit) sau 3 (articolele unei anexe). */
  nivel?: 2 | 3;
  /** Un separator (`hr`) inaintea sectiunii, cu acest `id`: tinta unei legaturi interne. */
  ancoraInainte?: string;
  /** Sectiunea intra in document numai cand toate aceste conditii sunt active (familia `md`). */
  conditie?: ConditieMasurare[];
  blocuri: BlocJuridic[];
};

export type DocumentJuridic = {
  titlu: string;
  /** Paragraful de deschidere, inaintea sectiunilor. */
  introducere: string;
  sectiuni: SectiuneJuridica[];
  /** Data versiunii textului, ISO `YYYY-MM-DD`; o schimba oricine schimba textul. */
  versiune?: string;
  /** Cheia documentului in registrul familiei `md`; lipseste la textele SEE. */
  cheie?: string;
  /** Limba textului; lipseste la textele SEE (romana). */
  limba?: LimbaJuridica;
  /** Blocurile dintre introducere si prima sectiune (familia `md`). */
  preambul?: BlocJuridic[];
};

// ---------------------------------------------------------------------------------------------
// Marcajul in linie
// ---------------------------------------------------------------------------------------------

// LEGATURA IN ACCENT (felia 94): un accent poate contine o legatura intreaga (stelutele in afara,
// parantezele inauntru) - forma titlului de card care e legatura. Accentul isi desface interiorul pe UN
// singur nivel: numai text si legaturi, fara accent in accent. `text` ramane textul simplu al intregului
// accent, deci `textSimplu` si orice cititor al lui `f.text` raman neschimbati; `fragmente` poarta
// interiorul pentru pagina. Forma inversa (stelutele in textul legaturii) NU e suportata: textul
// legaturii ar ramane cu stelute. E interzisa in sursa (detectorul din tests/marcaj-in-linie.test.ts).

export type FragmentInLinie =
  | { fel: "text"; text: string }
  | { fel: "accent"; text: string; fragmente: readonly FragmentInLinie[] }
  | { fel: "legatura"; text: string; adresa: string };

const TIPAR_IN_LINIE = /\*\*([^*]+)\*\*|\[([^\]]+)\]\(([^)\s]+)\)/g;
const TIPAR_LEGATURA = /\[([^\]]+)\]\(([^)\s]+)\)/g;

/** Interiorul unui accent: text si legaturi, in ordinea lor (fara accent in accent). */
function fragmenteAccent(sir: string): FragmentInLinie[] {
  const fragmente: FragmentInLinie[] = [];
  let pozitie = 0;
  for (const m of sir.matchAll(TIPAR_LEGATURA)) {
    const inceput = m.index ?? 0;
    if (inceput > pozitie) fragmente.push({ fel: "text", text: sir.slice(pozitie, inceput) });
    fragmente.push({ fel: "legatura", text: m[1], adresa: m[2] });
    pozitie = inceput + m[0].length;
  }
  if (pozitie < sir.length) fragmente.push({ fel: "text", text: sir.slice(pozitie) });
  return fragmente;
}

/** Desface un sir in text simplu, accente si legaturi, in ordinea lor. */
export function fragmenteInLinie(sir: string): FragmentInLinie[] {
  const fragmente: FragmentInLinie[] = [];
  let pozitie = 0;
  for (const m of sir.matchAll(TIPAR_IN_LINIE)) {
    const inceput = m.index ?? 0;
    if (inceput > pozitie) fragmente.push({ fel: "text", text: sir.slice(pozitie, inceput) });
    if (m[1] !== undefined) {
      const interior = fragmenteAccent(m[1]);
      fragmente.push({ fel: "accent", text: interior.map((f) => f.text).join(""), fragmente: interior });
    } else fragmente.push({ fel: "legatura", text: m[2], adresa: m[3] });
    pozitie = inceput + m[0].length;
  }
  if (pozitie < sir.length) fragmente.push({ fel: "text", text: sir.slice(pozitie) });
  return fragmente;
}

/** Toate legaturile unui sir, inclusiv cele din accente, in ordinea lor. */
export function legaturiInLinie(sir: string): { text: string; adresa: string }[] {
  const legaturi: { text: string; adresa: string }[] = [];
  const aduna = (fragmente: readonly FragmentInLinie[]) => {
    for (const f of fragmente) {
      if (f.fel === "legatura") legaturi.push({ text: f.text, adresa: f.adresa });
      else if (f.fel === "accent") aduna(f.fragmente);
    }
  };
  aduna(fragmenteInLinie(sir));
  return legaturi;
}

/** Sirul fara marcaj: ce citeste omul pe pagina. */
export function textSimplu(sir: string): string {
  return fragmenteInLinie(sir)
    .map((f) => f.text)
    .join("");
}

function textCelula(c: CelulaJuridica): string[] {
  return typeof c === "string" ? [textSimplu(c)] : [textSimplu(c.text), textSimplu(c.detaliu)];
}

/** Textul unui bloc, in ordinea din pagina: eticheta, paragrafe, lista, tabel, paragrafe de dupa. */
export function textBloc(b: BlocJuridic): string[] {
  return [
    ...(b.eticheta ? [textSimplu(b.eticheta)] : []),
    ...b.paragrafe.map(textSimplu),
    ...(b.lista?.elemente ?? []).flatMap((e, i) => [e, ...(b.lista?.subelemente?.[i] ?? [])]).map(textSimplu),
    ...(b.tabel ? [textSimplu(b.tabel.titlu), ...(b.tabel.antet ?? []).map(textSimplu), ...b.tabel.randuri.flat().flatMap(textCelula)] : []),
    ...(b.dupa ?? []).map(textSimplu),
  ];
}

/**
 * Tot textul unui document, fara marcaj, in ordinea din pagina: titlu, introducere si, pe fiecare
 * sectiune, titlul si textul blocurilor. Folosit de probe si, cu linia versiunii, de amprenta.
 */
export function textIntreg(d: DocumentJuridic): string {
  return [
    textSimplu(d.titlu),
    textSimplu(d.introducere),
    ...(d.preambul ?? []).flatMap(textBloc),
    ...d.sectiuni.flatMap((s) => [textSimplu(s.titlu), ...s.blocuri.flatMap(textBloc)]),
  ].join("\n");
}

/**
 * Textul pe care se calculeaza amprenta SHA-256 a documentului (sigiliul, juridic__sablon.md §7):
 * tot ce se vede in document, in ordinea din pagina - titlul, linia versiunii, introducerea si
 * corpul -, fara marcaj si fara NICIUN spatiu alb. Fara spatii, fiindca pagina desparte blocurile
 * prin elemente, nu prin spatii: `textContent`-ul documentului randat, fara spatiile lui, e exact
 * sirul de aici, iar proba de browser chiar asa il recalculeaza. Orice litera schimbata schimba
 * amprenta; o schimbare numai de spatiere, nu.
 */
export function textPentruAmprenta(d: DocumentJuridic, linieVersiune: string): string {
  const bucati = [
    textSimplu(d.titlu),
    linieVersiune,
    ...(d.introducere === "" ? [] : [textSimplu(d.introducere)]),
    ...(d.preambul ?? []).flatMap(textBloc),
    ...d.sectiuni.flatMap((s) => [textSimplu(s.titlu), ...s.blocuri.flatMap(textBloc)]),
  ];
  return bucati.join("").replace(/\s+/g, "");
}

// ---------------------------------------------------------------------------------------------
// Versiunea
// ---------------------------------------------------------------------------------------------

const LUNI = [
  "ianuarie",
  "februarie",
  "martie",
  "aprilie",
  "mai",
  "iunie",
  "iulie",
  "august",
  "septembrie",
  "octombrie",
  "noiembrie",
  "decembrie",
];

/** `2026-09-25` -> `25 septembrie 2026`. Arunca pe o data care nu are forma ISO. */
export function dataInCuvinte(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  const luna = m ? LUNI[Number(m[2]) - 1] : undefined;
  if (!m || luna === undefined || Number(m[3]) < 1 || Number(m[3]) > 31) {
    throw new Error("data versiunii trebuie sa aiba forma AAAA-LL-ZZ, nu " + JSON.stringify(iso));
  }
  return Number(m[3]) + " " + luna + " " + m[1];
}
