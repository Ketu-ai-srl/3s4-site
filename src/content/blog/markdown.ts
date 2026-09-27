// Corpul unui articol de blog, din textul de dupa antetul YAML, intr-un arbore pe care il randeaza
// `src/components/blog/CorpArticol.tsx`. Functii pure: nu citesc discul, nu stiu de React.
//
// DE CE UN CITITOR PROPRIU, si nu compilatorul MDX din `next.config.ts`. Acolo `@next/mdx` e pornit
// fara pluginul de antet YAML si fara tabele (GFM), iar pentru App Router ar cere `mdx-components.tsx`,
// fisier al fundatiei. Un articol din lot (antet YAML + tabel) compilat asa ar iesi cu antetul ca
// titlu si cu tabelul ca paragraf cu bare. Cititorul de aici accepta exact gramatica lotului de
// articole si REFUZA restul, cu randul si motivul: o constructie necunoscuta nu se randeaza pe
// ghicite, opreste construirea.
//
// GRAMATICA (subsetul Markdown al fisierelor .mdx din lot):
//   - titluri `##`, `###`, `####` (h1 e titlul articolului, il pune sablonul);
//   - paragrafe, randurile consecutive se lipesc cu un spatiu;
//   - liste cu `-`, `*`, `+` sau cu `1.` / `1)`, pe un singur nivel;
//   - citate `>`; ULTIMUL bloc, daca e un citat care incepe cu `**3S**`, e textul casetei CTA;
//   - tabele cu bare (antet, rand de liniute, randuri);
//   - linie orizontala `---`, cod intre ``` ```;
//   - in text: `**tare**`, `*accent*` / `_accent_`, `` `cod` ``, `[text](adresa)`, `\` de evadare,
//     entitatile `&amp;`, `&lt;`, `&gt;`, `&quot;`, `&#39;`, `&nbsp;` si cele numerice.
// REFUZATE, fiindca in MDX au alt inteles sau ar ocoli sablonul: JSX si HTML (`<`), expresii (`{`),
// `import` / `export`, h1, titluri subliniate (`===` / `---` sub un rand), liste imbricate, adrese
// relative sau cu scheme necunoscute.

export type Inline =
  | { tip: "text"; text: string }
  | { tip: "tare"; copii: Inline[] }
  | { tip: "accent"; copii: Inline[] }
  | { tip: "cod"; text: string }
  | { tip: "legatura"; href: string; copii: Inline[] };

export type Aliniere = "stanga" | "centru" | "dreapta" | null;

export type Bloc =
  | { tip: "titlu"; nivel: 2 | 3 | 4; id: string; copii: Inline[] }
  | { tip: "paragraf"; copii: Inline[] }
  | { tip: "lista"; ordonata: boolean; start: number; elemente: Inline[][] }
  | { tip: "citat"; paragrafe: Inline[][] }
  | { tip: "tabel"; antet: Inline[][]; aliniere: Aliniere[]; randuri: Inline[][][] }
  | { tip: "linie" }
  | { tip: "cod"; limbaj: string; text: string };

export type CorpArticol = {
  blocuri: Bloc[];
  /** Paragrafele casetei CTA (ultimul citat care incepe cu `**3S**`), fara marcaj; `null` daca lipseste. */
  cta: Inline[][] | null;
};

/** O constructie pe care cititorul nu o accepta. `rand` e numarat de la 1, in corpul articolului. */
export class EroareCorp extends Error {
  constructor(
    mesaj: string,
    readonly rand: number,
  ) {
    super("randul " + rand + ": " + mesaj);
    this.name = "EroareCorp";
  }
}

/** Marcajul casetei CTA din lot: primul cuvant ingrosat al ultimului citat. */
export const MARCAJ_CTA = "3S";

// ---------------------------------------------------------------------------------------------
// Blocuri
// ---------------------------------------------------------------------------------------------

const TIPAR_TITLU = /^(#{1,6})(?:[ \t]+(.*?))?[ \t]*$/;
const TIPAR_LINIE = /^ {0,3}([-*_])(?:[ \t]*\1){2,}[ \t]*$/;
const TIPAR_GARD = /^ {0,3}(`{3,}|~{3,})[ \t]*([A-Za-z0-9_-]*)[ \t]*$/;
const TIPAR_CITAT = /^ {0,3}>[ ]?(.*)$/;
const TIPAR_MARCAJ_NEORDONAT = /^( *)([-*+])[ \t]+(.*)$/;
const TIPAR_MARCAJ_ORDONAT = /^( *)(\d{1,9})([.)])[ \t]+(.*)$/;
const TIPAR_DELIMITARE_TABEL = /^ *\|? *:?-{3,}:? *(?:\| *:?-{3,}:? *)*\|? *$/;
const TIPAR_SUBLINIERE = /^ {0,3}(=+|-+)[ \t]*$/;

function gol(rand: string): boolean {
  return rand.trim() === "";
}

function incepeTabel(randuri: string[], i: number): boolean {
  return randuri[i].includes("|") && i + 1 < randuri.length && TIPAR_DELIMITARE_TABEL.test(randuri[i + 1]);
}

/** Randul porneste un bloc nou, deci intrerupe un paragraf. */
function pornesteBloc(randuri: string[], i: number): boolean {
  const r = randuri[i];
  return (
    TIPAR_TITLU.test(r) ||
    TIPAR_GARD.test(r) ||
    TIPAR_CITAT.test(r) ||
    TIPAR_MARCAJ_NEORDONAT.test(r) ||
    TIPAR_MARCAJ_ORDONAT.test(r) ||
    incepeTabel(randuri, i)
  );
}

function refuzaRand(rand: string, numar: number): void {
  const t = rand.trim();
  if (t.startsWith("<")) {
    throw new EroareCorp("JSX sau HTML in corp (" + t.slice(0, 40) + "): conducta accepta doar Markdown", numar);
  }
  if (/^(import|export)\s/.test(t)) {
    throw new EroareCorp("`import` / `export` in corp: articolele nu au cod", numar);
  }
}

function celule(rand: string): string[] {
  let t = rand.trim();
  if (t.startsWith("|")) t = t.slice(1);
  if (t.endsWith("|") && !t.endsWith("\\|")) t = t.slice(0, -1);
  const rezultat: string[] = [];
  let curenta = "";
  for (let i = 0; i < t.length; i++) {
    const c = t[i];
    if (c === "\\" && t[i + 1] === "|") {
      curenta += "|";
      i++;
    } else if (c === "|") {
      rezultat.push(curenta.trim());
      curenta = "";
    } else {
      curenta += c;
    }
  }
  rezultat.push(curenta.trim());
  return rezultat;
}

function aliniereDin(delimitare: string): Aliniere {
  const d = delimitare.trim();
  const stanga = d.startsWith(":");
  const dreapta = d.endsWith(":");
  if (stanga && dreapta) return "centru";
  if (dreapta) return "dreapta";
  if (stanga) return "stanga";
  return null;
}

/** Textul simplu al unui sir de elemente in linie (pentru identificatori si numarat cuvinte). */
export function textDin(copii: Inline[]): string {
  return copii
    .map((c) => {
      if (c.tip === "text" || c.tip === "cod") return c.text;
      return textDin(c.copii);
    })
    .join("");
}

/** Identificatorul unui titlu: litere mici fara diacritice, cifre si cratime. */
export function identificator(text: string): string {
  const baza = text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return baza === "" ? "sectiune" : baza;
}

export function parseazaCorp(sursa: string): CorpArticol {
  const randuri = sursa.replace(/\r\n?/g, "\n").split("\n");
  const blocuri: Bloc[] = [];
  const iduriFolosite = new Map<string, number>();
  let i = 0;

  const idUnic = (text: string): string => {
    const baza = identificator(text);
    const n = (iduriFolosite.get(baza) ?? 0) + 1;
    iduriFolosite.set(baza, n);
    return n === 1 ? baza : baza + "-" + n;
  };

  while (i < randuri.length) {
    const rand = randuri[i];
    const numar = i + 1;
    if (gol(rand)) {
      i++;
      continue;
    }

    const gard = TIPAR_GARD.exec(rand);
    if (gard) {
      const inchidere = gard[1];
      const continut: string[] = [];
      i++;
      while (i < randuri.length && !randuri[i].trim().startsWith(inchidere)) {
        continut.push(randuri[i]);
        i++;
      }
      if (i >= randuri.length) throw new EroareCorp("bloc de cod neinchis", numar);
      i++;
      blocuri.push({ tip: "cod", limbaj: gard[2], text: continut.join("\n") });
      continue;
    }

    const titlu = TIPAR_TITLU.exec(rand);
    if (titlu) {
      const nivel = titlu[1].length;
      if (nivel === 1) throw new EroareCorp("titlu de nivel 1: titlul articolului il pune sablonul, din antet", numar);
      if (nivel > 4) throw new EroareCorp("titlu de nivel " + nivel + ": sablonul are doar ##, ### si ####", numar);
      const text = (titlu[2] ?? "").replace(/[ \t]+#+[ \t]*$/, "").trim();
      if (text === "") throw new EroareCorp("titlu gol", numar);
      const copii = parseazaInline(text, numar);
      blocuri.push({ tip: "titlu", nivel: nivel as 2 | 3 | 4, id: idUnic(textDin(copii)), copii });
      i++;
      continue;
    }

    if (TIPAR_LINIE.test(rand)) {
      blocuri.push({ tip: "linie" });
      i++;
      continue;
    }

    if (TIPAR_CITAT.test(rand)) {
      const interior: string[] = [];
      while (i < randuri.length) {
        const m = TIPAR_CITAT.exec(randuri[i]);
        if (!m) break;
        interior.push(m[1]);
        i++;
      }
      const paragrafe: Inline[][] = [];
      let bucata: string[] = [];
      const inchide = () => {
        if (bucata.length > 0) {
          paragrafe.push(parseazaInline(bucata.map((r) => r.trim()).join(" "), numar));
          bucata = [];
        }
      };
      for (const r of interior) {
        if (gol(r)) inchide();
        else {
          refuzaRand(r, numar);
          if (TIPAR_TITLU.test(r) || TIPAR_MARCAJ_NEORDONAT.test(r) || TIPAR_MARCAJ_ORDONAT.test(r) || TIPAR_CITAT.test(r)) {
            throw new EroareCorp("titlu, lista sau citat in interiorul unui citat: sablonul are doar paragrafe acolo", numar);
          }
          bucata.push(r);
        }
      }
      inchide();
      blocuri.push({ tip: "citat", paragrafe });
      continue;
    }

    if (incepeTabel(randuri, i)) {
      const antet = celule(rand);
      const aliniere = celule(randuri[i + 1]).map(aliniereDin);
      if (aliniere.length !== antet.length) {
        throw new EroareCorp("tabelul are " + antet.length + " capete si " + aliniere.length + " coloane in randul de liniute", numar);
      }
      i += 2;
      const corp: Inline[][][] = [];
      while (i < randuri.length && !gol(randuri[i]) && randuri[i].includes("|")) {
        const c = celule(randuri[i]);
        if (c.length > antet.length) {
          throw new EroareCorp("rand de tabel cu " + c.length + " celule, antetul are " + antet.length, i + 1);
        }
        while (c.length < antet.length) c.push("");
        corp.push(c.map((x) => parseazaInline(x, i + 1)));
        i++;
      }
      blocuri.push({ tip: "tabel", antet: antet.map((x) => parseazaInline(x, numar)), aliniere, randuri: corp });
      continue;
    }

    const neordonat = TIPAR_MARCAJ_NEORDONAT.exec(rand);
    const ordonat = TIPAR_MARCAJ_ORDONAT.exec(rand);
    if (neordonat || ordonat) {
      const esteOrdonata = !neordonat;
      const start = ordonat && !neordonat ? Number(ordonat[2]) : 1;
      const elemente: string[][] = [];
      while (i < randuri.length) {
        const r = randuri[i];
        if (gol(r)) {
          // O lista se poate intinde peste un rand gol, daca urmatorul rand e tot un element al ei.
          let j = i;
          while (j < randuri.length && gol(randuri[j])) j++;
          const urmator = j < randuri.length ? randuri[j] : "";
          const continua = esteOrdonata ? TIPAR_MARCAJ_ORDONAT.exec(urmator) : TIPAR_MARCAJ_NEORDONAT.exec(urmator);
          if (continua && continua[1].length < 2) {
            i = j;
            continue;
          }
          break;
        }
        const mn = TIPAR_MARCAJ_NEORDONAT.exec(r);
        const mo = TIPAR_MARCAJ_ORDONAT.exec(r);
        const marcaj = esteOrdonata ? mo : mn;
        const strain = esteOrdonata ? mn : mo;
        if ((marcaj && marcaj[1].length >= 2) || (strain && strain[1].length >= 2)) {
          throw new EroareCorp("lista imbricata: sablonul are liste pe un singur nivel", i + 1);
        }
        if (!marcaj && strain) {
          throw new EroareCorp("lista ordonata si neordonata lipite: despartiti-le printr-un paragraf", i + 1);
        }
        if (marcaj) {
          elemente.push([esteOrdonata ? marcaj[4] : marcaj[3]]);
          i++;
          continue;
        }
        if (elemente.length > 0 && !pornesteBloc(randuri, i)) {
          refuzaRand(r, i + 1);
          elemente[elemente.length - 1].push(r.trim());
          i++;
          continue;
        }
        break;
      }
      blocuri.push({
        tip: "lista",
        ordonata: esteOrdonata,
        start,
        elemente: elemente.map((e) => parseazaInline(e.join(" ").trim(), numar)),
      });
      continue;
    }

    // Paragraf: randurile pana la un rand gol sau pana la inceputul altui bloc.
    refuzaRand(rand, numar);
    const bucata: string[] = [rand.trim()];
    i++;
    while (i < randuri.length && !gol(randuri[i])) {
      if (TIPAR_SUBLINIERE.test(randuri[i])) {
        throw new EroareCorp("titlu subliniat (=== sau --- sub un rand): folositi ## pentru titluri", i + 1);
      }
      if (pornesteBloc(randuri, i) || TIPAR_LINIE.test(randuri[i])) break;
      refuzaRand(randuri[i], i + 1);
      bucata.push(randuri[i].trim());
      i++;
    }
    blocuri.push({ tip: "paragraf", copii: parseazaInline(bucata.join(" "), numar) });
  }

  // Caseta CTA: ultimul bloc, daca e un citat al carui prim paragraf incepe cu **3S**.
  let cta: Inline[][] | null = null;
  const ultim = blocuri[blocuri.length - 1];
  if (ultim && ultim.tip === "citat" && ultim.paragrafe.length > 0) {
    const [primul, ...restul] = ultim.paragrafe;
    const cap = primul[0];
    if (cap && cap.tip === "tare" && textDin(cap.copii).trim() === MARCAJ_CTA) {
      const fara = primul.slice(1);
      if (fara[0] && fara[0].tip === "text") fara[0] = { tip: "text", text: fara[0].text.replace(/^\s+/, "") };
      cta = [fara, ...restul].filter((p) => textDin(p).trim() !== "");
      blocuri.pop();
    }
  }

  return { blocuri, cta };
}

// ---------------------------------------------------------------------------------------------
// In linie
// ---------------------------------------------------------------------------------------------

const ENTITATI: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: "\u00a0",
};

const PUNCTUATIE_EVADABILA = "\\`*_{}[]()#+-.!|<>&\"'~^";

function esteSpatiu(c: string | undefined): boolean {
  return c === undefined || /\s/.test(c);
}

function esteAlfanumeric(c: string | undefined): boolean {
  return c !== undefined && /[\p{L}\p{N}]/u.test(c);
}

/** Adresa unei legaturi: interna (`/...`), ancora (`#...`) sau externa (http, https, mailto). */
function adresaValida(href: string): boolean {
  return /^\/(?!\/)/.test(href) || /^#[A-Za-z0-9-]+$/.test(href) || /^(https?:\/\/|mailto:)/i.test(href);
}

/**
 * Pozitia delimitatorului de inchidere pentru un marcaj de accent care incepe la `start`, sau -1.
 * Inchiderea nu are spatiu inainte; la `_` nu are litera sau cifra dupa (fara accent in cuvant).
 * Un marcaj simplu care face parte dintr-o pereche (`**`) nu inchide un accent simplu.
 */
function gasesteInchiderea(s: string, start: number, marcaj: string): number {
  let i = start;
  while (i < s.length) {
    const c = s[i];
    if (c === "\\") {
      i += 2;
      continue;
    }
    if (c === "`") {
      const lung = /^`+/.exec(s.slice(i))?.[0].length ?? 1;
      const inchis = s.indexOf("`".repeat(lung), i + lung);
      i = inchis < 0 ? i + lung : inchis + lung;
      continue;
    }
    if (s.startsWith(marcaj, i)) {
      const inainte = s[i - 1];
      const dupa = s[i + marcaj.length];
      if (marcaj.length === 1 && (s[i + 1] === marcaj || inainte === marcaj)) {
        i++;
        continue;
      }
      if (i > start && !esteSpatiu(inainte) && (marcaj[0] !== "_" || !esteAlfanumeric(dupa))) return i;
      i += marcaj.length;
      continue;
    }
    i++;
  }
  return -1;
}

/** Paranteza care inchide adresa unei legaturi, cu parantezele din adresa perechi; -1 daca lipseste. */
function sfarsitAdresa(s: string, deschis: number): number {
  let adancime = 0;
  for (let i = deschis; i < s.length; i++) {
    const c = s[i];
    if (c === "\\") {
      i++;
      continue;
    }
    if (c === "(") adancime++;
    if (c === ")") {
      adancime--;
      if (adancime === 0) return i;
    }
  }
  return -1;
}

/** Sfarsitul textului unei legaturi: `]` pereche, cu evadari si cod sarite; -1 daca lipseste. */
function sfarsitEticheta(s: string, deschis: number): number {
  let adancime = 0;
  for (let i = deschis; i < s.length; i++) {
    const c = s[i];
    if (c === "\\") {
      i++;
      continue;
    }
    if (c === "[") adancime++;
    if (c === "]") {
      adancime--;
      if (adancime === 0) return i;
    }
  }
  return -1;
}

/**
 * Ghilimelele romanesti (DOOM3): o ghilimea dreapta ASCII care inchide un citat deschis cu cea
 * de jos devine ghilimeaua de sus, dreapta. In afara codului inline, si numai daca nu e evadata;
 * o ghilimea ASCII fara citat deschis ramane cum e (decizia D15).
 */
export function inchideGhilimele(s: string): string {
  let rezultat = "";
  let deschis = false;
  let inCod = false;
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (c === "\\" && i + 1 < s.length) {
      rezultat += c + s[i + 1];
      i++;
      continue;
    }
    if (c === "`") inCod = !inCod;
    else if (!inCod && c === "„") deschis = true;
    else if (!inCod && c === "”") deschis = false;
    else if (!inCod && c === '"' && deschis) {
      rezultat += "”";
      deschis = false;
      continue;
    }
    rezultat += c;
  }
  return rezultat;
}

export function parseazaInline(sursa: string, rand = 0): Inline[] {
  const s = inchideGhilimele(sursa);
  const rezultat: Inline[] = [];
  let tampon = "";
  const scoate = () => {
    if (tampon !== "") {
      const ultim = rezultat[rezultat.length - 1];
      if (ultim && ultim.tip === "text") ultim.text += tampon;
      else rezultat.push({ tip: "text", text: tampon });
      tampon = "";
    }
  };

  let i = 0;
  while (i < s.length) {
    const c = s[i];

    if (c === "\\" && i + 1 < s.length && PUNCTUATIE_EVADABILA.includes(s[i + 1])) {
      tampon += s[i + 1];
      i += 2;
      continue;
    }

    if (c === "`") {
      const lung = /^`+/.exec(s.slice(i))?.[0].length ?? 1;
      const deschidere = "`".repeat(lung);
      const inchis = s.indexOf(deschidere, i + lung);
      if (inchis < 0) {
        tampon += deschidere;
        i += lung;
        continue;
      }
      scoate();
      rezultat.push({ tip: "cod", text: s.slice(i + lung, inchis).replace(/^ (.*) $/, "$1") });
      i = inchis + lung;
      continue;
    }

    if (c === "{" || c === "}") {
      throw new EroareCorp("acolada in text: in MDX porneste o expresie; scrieti-o in cod (`{`) sau evadata (\\{)", rand);
    }

    if (c === "<") {
      throw new EroareCorp("`<` in text: in MDX porneste o eticheta JSX; scrieti &lt; sau \\<", rand);
    }

    if (c === "&") {
      const m = /^&(#\d{1,7}|#x[0-9a-fA-F]{1,6}|[a-z]+);/.exec(s.slice(i));
      if (m) {
        const nume = m[1];
        let valoare: string | undefined;
        if (nume.startsWith("#x")) valoare = String.fromCodePoint(parseInt(nume.slice(2), 16));
        else if (nume.startsWith("#")) valoare = String.fromCodePoint(parseInt(nume.slice(1), 10));
        else valoare = ENTITATI[nume];
        if (valoare !== undefined) {
          tampon += valoare;
          i += m[0].length;
          continue;
        }
      }
      tampon += c;
      i++;
      continue;
    }

    if (c === "[") {
      const sfarsit = sfarsitEticheta(s, i);
      if (sfarsit > 0 && s[sfarsit + 1] === "(") {
        const inchis = sfarsitAdresa(s, sfarsit + 1);
        if (inchis > 0) {
          const interior = s.slice(sfarsit + 2, inchis).trim();
          const href = interior.split(/\s+/)[0] ?? "";
          if (!adresaValida(href)) {
            throw new EroareCorp(
              "adresa de legatura nepermisa (" + href + "): interna cu `/`, ancora cu `#` sau http(s) / mailto",
              rand,
            );
          }
          scoate();
          rezultat.push({ tip: "legatura", href, copii: parseazaInline(s.slice(i + 1, sfarsit), rand) });
          i = inchis + 1;
          continue;
        }
      }
      tampon += c;
      i++;
      continue;
    }

    if (c === "*" || c === "_") {
      const dublu = s[i + 1] === c;
      const marcaj = dublu ? c + c : c;
      const dupa = s[i + marcaj.length];
      const inainte = s[i - 1];
      const poateDeschide = !esteSpatiu(dupa) && (c === "*" || !esteAlfanumeric(inainte));
      if (poateDeschide) {
        const inchis = gasesteInchiderea(s, i + marcaj.length, marcaj);
        if (inchis > 0) {
          scoate();
          const copii = parseazaInline(s.slice(i + marcaj.length, inchis), rand);
          rezultat.push(dublu ? { tip: "tare", copii } : { tip: "accent", copii });
          i = inchis + marcaj.length;
          continue;
        }
      }
      tampon += marcaj;
      i += marcaj.length;
      continue;
    }

    tampon += c;
    i++;
  }
  scoate();
  return rezultat;
}

// ---------------------------------------------------------------------------------------------
// Masuri
// ---------------------------------------------------------------------------------------------

function textBloc(b: Bloc): string {
  switch (b.tip) {
    case "titlu":
    case "paragraf":
      return textDin(b.copii);
    case "lista":
      return b.elemente.map(textDin).join(" ");
    case "citat":
      return b.paragrafe.map(textDin).join(" ");
    case "tabel":
      return [...b.antet.map(textDin), ...b.randuri.flatMap((r) => r.map(textDin))].join(" ");
    case "cod":
      return b.text;
    case "linie":
      return "";
  }
}

/** Cuvintele corpului (fara caseta CTA): orice secventa cu cel putin o litera sau o cifra. */
export function numaraCuvinte(corp: CorpArticol): number {
  return corp.blocuri
    .map(textBloc)
    .join(" ")
    .split(/\s+/)
    .filter((c) => /[\p{L}\p{N}]/u.test(c)).length;
}

/** Minutele de citit, la 200 de cuvinte pe minut, cel putin unul (blog.md, "Continutul la 3S"). */
export const CUVINTE_PE_MINUT = 200;

export function minuteDeCitit(cuvinte: number): number {
  return Math.max(1, Math.round(cuvinte / CUVINTE_PE_MINUT));
}
