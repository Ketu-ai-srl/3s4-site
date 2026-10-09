// Un sir din textele juridice, cu marcajul lui in linie (`src/content/juridic/tipuri.ts`): accentul
// devine `strong`, legatura devine ancora, iar o legatura dintr-un accent devine ancora in `strong`. O legatura spre o ruta a site-ului trece prin `Tinta`, deci
// ramane inerta (acelasi aspect, fara adresa) cat timp ruta nu exista in `RUTE`: nicio legatura moarta.
// `clasaLegatura` stilizeaza ancorele acolo unde textul nu sta in `Proza` (declaratia de accesibilitate).
// O legatura spre pagina romaneasca dintr-o pagina in alta limba (`limba: "ro"`, din `cale-ro:`) primeste `lang="ro"`
// si `hrefLang` al editiei RO-MD, scris pe asezare (pe `ro` devine `ro-RO`), ca eticheta locala din subsolul EN.
// Celelalte legaturi nu primesc niciun atribut in plus, deci HTML-ul lor ramane cel dinainte.
//
// ADRESELE DE E-MAIL scrise in text (de exemplu adresa operatorului din documentele juridice) devin legaturi
// `mailto:` cu exact acelasi text, ca sa se poata scrie cu o atingere (masurat pe baza: 6 adrese pe pagina de
// informatii legale si 16 pe cea de confidentialitate, toate text simplu, zero `mailto:`). Textul paginii nu se
// schimba, deci nici amprenta documentului. Numerele de telefon NU devin legaturi (decizia 56, fara apeluri).
// Un sir fara adresa trece neatins, ca HTML-ul lui sa ramana cel dinainte.
// NUMAI PE EDITII (en, ro-MD: build-urile 3s.md si 3s.com.ro). Build-ul ro-RO se construieste singur (`editii.ts`),
// iar paginile lui `/juridic` sunt pazite octet cu octet de garda RO (tests/editie-juridic.test.ts, partea A, si
// tests/juridic-ro-furnizori.test.ts); pe productie ele nici nu se servesc (operatorul RO e `null`, raspund 404).
// Deci pe ro-RO textul ramane exact cel de pe baza.
// IN CELULELE DE TABEL (`posta="celula"`, pus de CorpDocument) adresa devine legatura numai cand celula e chiar adresa
// (randul "E-mail" din informatiile legale). O adresa din mijlocul unei fraze dintr-o celula ramane text: comparatia de
// identitate dintre domenii (`.claude/scripts/porti/compara-build.py`, regula 11) scoate randurile DNS si posta ale
// tabelului destinatarilor dupa textul INTREG al celulei, iar legatura l-ar rupe in bucati (masurat in CI pe felia 151:
// 2 diferente, ambele pe acele randuri).

import { Fragment, type ReactNode } from "react";
import Tinta from "@/components/primitive/Tinta";
import { fragmenteInLinie, type FragmentInLinie } from "@/content/juridic/tipuri";
import { hrefLangServit } from "@/lib/asezare";
import { editiaInBuild } from "@/lib/editii";

/** Editia de continut a paginilor romanesti spre care trimite o legatura `cale-ro:` (codul din datele subsolului EN). */
const EDITIE_RO = "ro-MD";

function legatura(adresa: string, text: string, cheie: number, clasa: string | undefined, limba?: "ro"): ReactNode {
  const atributeLimba = limba === "ro" ? { lang: "ro", hrefLang: hrefLangServit(EDITIE_RO) } : {};
  if (adresa.startsWith("#") || /^(https?:|mailto:)/i.test(adresa)) {
    return (
      <a key={cheie} href={adresa} className={clasa} {...atributeLimba}>
        {text}
      </a>
    );
  }
  const ruta = adresa.split("#")[0].split("?")[0];
  return (
    <Tinta key={cheie} legatura={{ text, href: adresa, ruta }} className={clasa} {...atributeLimba}>
      {text}
    </Tinta>
  );
}

/** O adresa de e-mail intreaga; punctul de dupa ea (sfarsit de propozitie) nu intra in adresa. */
const ADRESA_EMAIL = /[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}/g;

/** Unde leaga adresele: `oriunde` in text (proza), sau `celula` = numai cand tot sirul e o adresa. */
export type PostaInText = "oriunde" | "celula";

/** Un sir de text cu adresele lui de e-mail ca legaturi `mailto:`; fara adresa (sau pe build-ul ro-RO), sirul insusi. */
function cuPosta(text: string, cheie: number | string, clasa: string | undefined, posta: PostaInText): ReactNode {
  if (editiaInBuild("ro-RO")) return text;
  const adrese = [...text.matchAll(ADRESA_EMAIL)];
  if (posta === "celula" && !(adrese.length === 1 && adrese[0][0] === text.trim())) return text;
  if (adrese.length === 0) return text;
  const bucati: ReactNode[] = [];
  let pozitie = 0;
  for (const [j, a] of adrese.entries()) {
    const inceput = a.index ?? 0;
    if (inceput > pozitie) bucati.push(text.slice(pozitie, inceput));
    bucati.push(
      <a key={"e" + j} href={"mailto:" + a[0]} className={clasa}>
        {a[0]}
      </a>,
    );
    pozitie = inceput + a[0].length;
  }
  if (pozitie < text.length) bucati.push(text.slice(pozitie));
  return <Fragment key={cheie}>{bucati}</Fragment>;
}

/**
 * Interiorul unui accent (felia 94): legaturile din el devin ancore in `strong`. Un accent fara legatura
 * primeste copilul de dinainte, sirul intreg (nu o lista de un element), ca HTML-ul si fluxul RSC ale
 * paginilor existente sa ramana neschimbate.
 */
function accent(fragmente: readonly FragmentInLinie[], text: string, clasa: string | undefined, posta: PostaInText): ReactNode {
  if (!fragmente.some((g) => g.fel === "legatura")) return cuPosta(text, "p", clasa, posta);
  return fragmente.map((g, j) => (g.fel === "legatura" ? legatura(g.adresa, g.text, j, clasa, g.limba) : cuPosta(g.text, j, clasa, posta)));
}

export default function TextInLinie({
  text,
  clasaLegatura,
  posta = "oriunde",
}: {
  text: string;
  clasaLegatura?: string;
  /** Unde devin legaturi adresele de e-mail; in celulele de tabel, `celula`. */
  posta?: PostaInText;
}) {
  return (
    <>
      {fragmenteInLinie(text).map((f, i) =>
        f.fel === "text" ? (
          cuPosta(f.text, i, clasaLegatura, posta)
        ) : f.fel === "accent" ? (
          <strong key={i}>{accent(f.fragmente, f.text, clasaLegatura, posta)}</strong>
        ) : (
          legatura(f.adresa, f.text, i, clasaLegatura, f.limba)
        ),
      )}
    </>
  );
}
