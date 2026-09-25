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
// MARCAJUL IN LINIE, singurul permis in siruri: `**text**` = accent (`strong`) si
// `[text](adresa)` = legatura. `textSimplu` il scoate; `fragmenteInLinie` il desface pentru pagina.

import type { Jurisdictie } from "./autoritati";

export type ListaJuridica = {
  /** `true` = lista numerotata (`ol`); altfel cu buline (`ul`). */
  numerotata?: boolean;
  elemente: string[];
};

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
};

export type SectiuneJuridica = {
  cheie: string;
  titlu: string;
  /** Nivelul titlului: 2 (implicit) sau 3 (articolele unei anexe). */
  nivel?: 2 | 3;
  /** Un separator (`hr`) inaintea sectiunii, cu acest `id`: tinta unei legaturi interne. */
  ancoraInainte?: string;
  blocuri: BlocJuridic[];
};

export type DocumentJuridic = {
  titlu: string;
  /** Paragraful de deschidere, inaintea sectiunilor. */
  introducere: string;
  sectiuni: SectiuneJuridica[];
  /** Data versiunii textului, ISO `YYYY-MM-DD`; o schimba oricine schimba textul. */
  versiune?: string;
};

// ---------------------------------------------------------------------------------------------
// Marcajul in linie
// ---------------------------------------------------------------------------------------------

export type FragmentInLinie =
  | { fel: "text"; text: string }
  | { fel: "accent"; text: string }
  | { fel: "legatura"; text: string; adresa: string };

const TIPAR_IN_LINIE = /\*\*([^*]+)\*\*|\[([^\]]+)\]\(([^)\s]+)\)/g;

/** Desface un sir in text simplu, accente si legaturi, in ordinea lor. */
export function fragmenteInLinie(sir: string): FragmentInLinie[] {
  const fragmente: FragmentInLinie[] = [];
  let pozitie = 0;
  for (const m of sir.matchAll(TIPAR_IN_LINIE)) {
    const inceput = m.index ?? 0;
    if (inceput > pozitie) fragmente.push({ fel: "text", text: sir.slice(pozitie, inceput) });
    if (m[1] !== undefined) fragmente.push({ fel: "accent", text: m[1] });
    else fragmente.push({ fel: "legatura", text: m[2], adresa: m[3] });
    pozitie = inceput + m[0].length;
  }
  if (pozitie < sir.length) fragmente.push({ fel: "text", text: sir.slice(pozitie) });
  return fragmente;
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
    ...(b.lista?.elemente ?? []).map(textSimplu),
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
