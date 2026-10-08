// Un sir din textele juridice, cu marcajul lui in linie (`src/content/juridic/tipuri.ts`): accentul
// devine `strong`, legatura devine ancora, iar o legatura dintr-un accent devine ancora in `strong`. O legatura spre o ruta a site-ului trece prin `Tinta`, deci
// ramane inerta (acelasi aspect, fara adresa) cat timp ruta nu exista in `RUTE`: nicio legatura moarta.
// `clasaLegatura` stilizeaza ancorele acolo unde textul nu sta in `Proza` (declaratia de accesibilitate).
// O legatura spre pagina romaneasca dintr-o pagina in alta limba (`limba: "ro"`, din `cale-ro:`) primeste `lang="ro"`
// si `hrefLang` al editiei RO-MD, scris pe asezare (pe `ro` devine `ro-RO`), ca eticheta locala din subsolul EN.
// Celelalte legaturi nu primesc niciun atribut in plus, deci HTML-ul lor ramane cel dinainte.

import type { ReactNode } from "react";
import Tinta from "@/components/primitive/Tinta";
import { fragmenteInLinie, type FragmentInLinie } from "@/content/juridic/tipuri";
import { hrefLangServit } from "@/lib/asezare";

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

/**
 * Interiorul unui accent (felia 94): legaturile din el devin ancore in `strong`. Un accent fara legatura
 * primeste copilul de dinainte, sirul intreg (nu o lista de un element), ca HTML-ul si fluxul RSC ale
 * paginilor existente sa ramana neschimbate.
 */
function accent(fragmente: readonly FragmentInLinie[], text: string, clasa: string | undefined): ReactNode {
  if (!fragmente.some((g) => g.fel === "legatura")) return text;
  return fragmente.map((g, j) => (g.fel === "legatura" ? legatura(g.adresa, g.text, j, clasa, g.limba) : g.text));
}

export default function TextInLinie({ text, clasaLegatura }: { text: string; clasaLegatura?: string }) {
  return (
    <>
      {fragmenteInLinie(text).map((f, i) =>
        f.fel === "text" ? (
          f.text
        ) : f.fel === "accent" ? (
          <strong key={i}>{accent(f.fragmente, f.text, clasaLegatura)}</strong>
        ) : (
          legatura(f.adresa, f.text, i, clasaLegatura, f.limba)
        ),
      )}
    </>
  );
}
