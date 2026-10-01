// Modelul comun al continutului: forma corpului unei pagini (sectiuni cu blocuri) si forma unei pagini
// de continut intregi (meta, H1, capsula, sectiuni, CTA, JSON-LD, afirmatii).
//
// DE CE UN SINGUR MODEL: documentele juridice (`src/content/juridic/tipuri.ts`) au deja exact forma
// de care au nevoie paginile EN - sectiuni cu o cheie stabila, blocuri cu paragrafe, lista si tabel,
// marcajul in linie `**accent**` si `[text](adresa)`. Un al doilea model ar fi adus un al doilea
// randator, iar doua randatoare deriva. Aici sta forma COMUNA, iar `DocumentJuridic` ramane
// atribuibil ei (verificat de compilator mai jos), deci `CorpDocument` randeaza ambele.
//
// Tipurile juridice NU se schimba din fisierul asta: ele raman sursa lor, cu campurile proprii
// (jurisdictia stricta, conditiile de masurare, subelementele, preambulul). Modelul comun e mai larg
// si fiecare camp nou de acolo trebuie sa ramana compatibil cu el; daca nu, typecheck-ul pica pe
// `JuridicIntraInCorpComun`.
//
// CONVENTIA MODULELOR EN (feliile 81-84): `src/content/en/<cheie>.ts` exporta `pagina`, de tipul
// `PaginaContinut`, cu `pagina.cheie` egala cu numele fisierului. `problemePagina` aplica regulile
// "Dovada de gata" pct. 1 si 6 din arhitectura continutului EN; proba `tests/continut-en.test.ts` o
// ruleaza pe fiecare modul.

import type { DocumentJuridic } from "@/content/juridic/tipuri";

// ---------------------------------------------------------------------------------------------
// Corpul comun
// ---------------------------------------------------------------------------------------------

export type ListaComuna = {
  /** `true` = lista numerotata (`ol`); altfel cu buline (`ul`). */
  numerotata?: boolean;
  elemente: readonly string[];
};

/** O celula de tabel: text, sau un nume in `strong` cu un rand de detaliu in `small`. */
export type CelulaComuna = string | { text: string; detaliu: string };

export type TabelComun = {
  /** `cheie-valoare`: fiecare rand = eticheta + valoare; `cu-antet`: un rand de capete, apoi date. */
  forma: "cheie-valoare" | "cu-antet";
  /** Titlul tabelului pentru cititoarele de ecran (`caption`). */
  titlu: string;
  antet?: readonly string[];
  randuri: readonly (readonly CelulaComuna[])[];
};

export type BlocComun = {
  /**
   * Jurisdictia blocului, numai la documentele juridice: blocul se randeaza intr-un `div` cu
   * `data-jurisdictie`. `null` sau lipsa = blocul e al tuturor cititorilor.
   */
  jurisdictie?: string | null;
  /** Randul de deasupra blocului, cand paragrafele nu spun singure pentru cine sunt. */
  eticheta?: string;
  paragrafe: readonly string[];
  lista?: ListaComuna;
  tabel?: TabelComun;
  /** Paragrafele de dupa lista sau tabel. */
  dupa?: readonly string[];
};

export type SectiuneComuna = {
  /** Cheia stabila a sectiunii: litere mici, cifre si cratime. */
  cheie: string;
  /** Titlul (H2 sau H3). Pe paginile EN e de regula o intrebare reala. */
  titlu: string;
  /** Nivelul titlului: 2 (implicit) sau 3. */
  nivel?: 2 | 3;
  /** Un separator (`hr`) inaintea sectiunii, cu acest `id`: tinta unei legaturi interne. */
  ancoraInainte?: string;
  blocuri: readonly BlocComun[];
};

/** Corpul randat de `CorpDocument`: un paragraf de deschidere si sectiunile. */
export type CorpComun = {
  /** Paragraful de deschidere; sirul gol = niciun paragraf. */
  introducere: string;
  sectiuni: readonly SectiuneComuna[];
};

/** Cere compilatorului ca `A` sa fie atribuibil lui `B`; altfel typecheck-ul pica aici. */
type Atribuibil<A extends B, B> = A extends B ? true : never;

/** Garantia de compatibilitate: orice document juridic e un corp comun, deci il randeaza `CorpDocument`. */
export type JuridicIntraInCorpComun = Atribuibil<DocumentJuridic, CorpComun>;

// ---------------------------------------------------------------------------------------------
// Pagina de continut
// ---------------------------------------------------------------------------------------------

export type MetaPagina = {
  /** `<title>`, 15-65 de caractere. */
  titlu: string;
  /** Meta-descrierea, 120-155 de caractere. */
  descriere: string;
  /** Adresa paginii pe domeniu: incepe cu `/`, fara `/` final (in afara de `/`). */
  cale: string;
};

export type CtaPagina = {
  /** Codul de atribuire al paginii (`en-price`): litere mici, cifre si cratime. */
  ref: string;
  /** Titlul blocului de final ("Ask for a quote"). */
  titluBloc: string;
  /** Textul precompletat de WhatsApp; contine `[ref:<ref>]` o singura data. */
  textWhatsapp: string;
  /** Subiectul e-mailului; contine `[ref:<ref>]` o singura data. */
  subiectEmail: string;
};

export type PaginaContinut = {
  /** Cheia modulului: numele fisierului din `src/content/en`, fara extensie. */
  cheie: string;
  meta: MetaPagina;
  /** Singurul H1 al paginii. */
  h1: string;
  /** Capsula de sub H1: 40-60 de cuvinte, cu marcajul in linie permis. */
  capsula: string;
  sectiuni: readonly SectiuneComuna[];
  cta: CtaPagina;
  /** Obiectele JSON-LD ale paginii; fiecare are `@type`. */
  jsonLd: readonly Record<string, unknown>[];
  /** ID-urile intrarilor din registrul de afirmatii pe care se sprijina pagina. */
  afirmatii: readonly string[];
};

// ---------------------------------------------------------------------------------------------
// Verificarea formei
// ---------------------------------------------------------------------------------------------

const FORMA_CHEIE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const TIPAR_IN_LINIE = /\*\*([^*]+)\*\*|\[([^\]]+)\]\(([^)\s]+)\)/g;

/** Textul unui sir fara marcajul in linie: ce citeste omul. */
function farMarcaj(sir: string): string {
  return sir.replace(TIPAR_IN_LINIE, (_m, accent: string | undefined, text: string | undefined) => accent ?? text ?? "");
}

/** Numarul de cuvinte al unui sir, fara marcaj. */
export function numarCuvinte(sir: string): number {
  const curat = farMarcaj(sir).trim();
  return curat === "" ? 0 : curat.split(/\s+/).length;
}

function aparitii(text: string, cautat: string): number {
  return text.split(cautat).length - 1;
}

function intre(n: number, min: number, max: number): boolean {
  return n >= min && n <= max;
}

/**
 * Problemele de forma ale unei pagini; lista goala = pagina respecta modelul. Regulile sunt cele din
 * "Dovada de gata" (pct. 1: lungimile titlului, ale meta-descrierii si ale capsulei, un singur H1;
 * pct. 6: CTA cu `ref`-ul paginii), plus unicitatea cheilor. Ce nu se poate verifica pe forma (sursa
 * fiecarei afirmatii, rubrica "Nu spune", revizia nativa) ramane in seama portilor si a omului.
 */
export function problemePagina(p: PaginaContinut, cheieAsteptata?: string): string[] {
  const gasite: string[] = [];
  const eticheta = p.cheie || "(fara cheie)";
  const adauga = (mesaj: string) => gasite.push(eticheta + ": " + mesaj);

  if (!FORMA_CHEIE.test(p.cheie)) adauga("cheia trebuie sa fie litere mici, cifre si cratime");
  if (cheieAsteptata !== undefined && p.cheie !== cheieAsteptata) {
    adauga("cheia `" + p.cheie + "` difera de numele modulului `" + cheieAsteptata + "`");
  }

  if (!intre(p.meta.titlu.length, 15, 65)) adauga("titlul are " + p.meta.titlu.length + " caractere (cerut 15-65)");
  if (!intre(p.meta.descriere.length, 120, 155)) {
    adauga("meta-descrierea are " + p.meta.descriere.length + " caractere (cerut 120-155)");
  }
  if (!/^\/(?:[a-z0-9-]+(?:\/[a-z0-9-]+)*)?$/.test(p.meta.cale)) {
    adauga("calea `" + p.meta.cale + "` trebuie sa inceapa cu `/`, fara `/` final, cu segmente din litere mici");
  }

  if (p.h1.trim() === "") adauga("H1 gol");
  const cuvinte = numarCuvinte(p.capsula);
  if (!intre(cuvinte, 40, 60)) adauga("capsula are " + cuvinte + " cuvinte (cerut 40-60)");

  const chei = new Set<string>();
  for (const s of p.sectiuni) {
    if (!FORMA_CHEIE.test(s.cheie)) adauga("sectiunea `" + s.cheie + "`: cheie invalida");
    if (chei.has(s.cheie)) adauga("sectiunea `" + s.cheie + "` apare de doua ori");
    chei.add(s.cheie);
    if (s.titlu.trim() === "") adauga("sectiunea `" + s.cheie + "` nu are titlu");
    if (s.blocuri.length === 0) adauga("sectiunea `" + s.cheie + "` nu are niciun bloc");
    for (const b of s.blocuri) {
      if (b.paragrafe.length === 0 && !b.lista && !b.tabel && (b.dupa ?? []).length === 0) {
        adauga("sectiunea `" + s.cheie + "` are un bloc gol");
      }
    }
  }

  if (!FORMA_CHEIE.test(p.cta.ref)) adauga("ref-ul `" + p.cta.ref + "` e invalid");
  const marcaj = "[ref:" + p.cta.ref + "]";
  if (aparitii(p.cta.textWhatsapp, marcaj) !== 1) adauga("textul WhatsApp trebuie sa contina " + marcaj + " o singura data");
  if (aparitii(p.cta.subiectEmail, marcaj) !== 1) adauga("subiectul e-mailului trebuie sa contina " + marcaj + " o singura data");
  if (p.cta.titluBloc.trim() === "") adauga("CTA fara titlu de bloc");

  for (const [i, obiect] of p.jsonLd.entries()) {
    if (typeof obiect["@type"] !== "string" || obiect["@type"] === "") adauga("JSON-LD " + (i + 1) + " nu are `@type`");
  }

  const ids = new Set<string>();
  for (const id of p.afirmatii) {
    if (!FORMA_CHEIE.test(id)) adauga("afirmatia `" + id + "`: ID invalid");
    if (ids.has(id)) adauga("afirmatia `" + id + "` apare de doua ori");
    ids.add(id);
  }
  return gasite;
}
