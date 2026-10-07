// O legatura pusa pe un nume de pagina dintr-un text simplu: "... pe pagina Informatii legale." devine "... pe
// pagina <a>Informatii legale</a>.". Textul ramane sir in continut (acelasi sir ajunge in datele structurate), iar
// legatura o adauga componenta la randare, numai cand pagina editiei o cere.
//
// DE CE STIL IN LINIE, si nu o clasa de modul: proba de congruenta compara multimea claselor de modul din `<main>`
// intre pagina 3s.md si perechea ei RO; o clasa noua, prezenta numai pe 3s.md, ar fi o abatere. Elementul `a` nu
// poarta nicio clasa, iar regula globala ii da `color: inherit` si fara subliniere, deci culoarea si sublinierea
// stau aici, ca legatura sa se deosebeasca de text si fara culoare (subliniat).
//
// ASEZAREA: `href` e o cale SURSA (ca toate datele); adresa scrisa in `<a>` e cea SERVITA, prin `hrefTinta`, ca la
// orice legatura din corpul paginii. Pe asezarea `ro` (3s.com.ro) calea sursa EN nu exista fara /en, iar cea ro-MD
// sub /ro redirectioneaza.

import Link from "next/link";
import type { ReactNode } from "react";
import { hrefTinta } from "@/components/primitive/Tinta";

/** Numele paginii, cum apare in text, si adresa ei. */
export type LegaturaInText = { text: string; href: string };

const STIL = { color: "var(--color-albastru)", textDecoration: "underline", textUnderlineOffset: "2px" } as const;

/**
 * Textul, cu prima aparitie a numelui paginii facuta legatura. Fara legatura sau fara nume in text, textul trece
 * neatins (acelasi sir, deci acelasi HTML). Bucatile dinainte si de dupa trec prin `bucata` (de pilda `nerupt`).
 */
export function cuLegatura(
  text: string,
  legatura: LegaturaInText | undefined,
  bucata: (s: string) => ReactNode = (s) => s,
): ReactNode {
  if (legatura === undefined) return bucata(text);
  const i = text.indexOf(legatura.text);
  if (i < 0) return bucata(text);
  return (
    <>
      {bucata(text.slice(0, i))}
      <Link href={hrefTinta(legatura.href)} style={STIL}>
        {legatura.text}
      </Link>
      {bucata(text.slice(i + legatura.text.length))}
    </>
  );
}
