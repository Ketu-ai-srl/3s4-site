// O legatura din CORPUL unei pagini, care stie daca tinta ei exista.
//
// De ce: in valurile intermediare cele mai multe tinte nu exista inca (`/inregistrare`, paginile de
// sector, preturile). O legatura spre o ruta inexistenta e o legatura moarta, prinsa de poarta de
// legaturi. Dar un buton scos din pagina ar schimba forma si inaltimea sectiunii, iar paginile se
// construiesc la forma referintei de la inceput. Asa ca elementul ramane, cu acelasi aspect, dar
// INERT: un `span` fara `href`, marcat `data-tinta-lipsa` cu tinta pe care o asteapta. In clipa in
// care ruta apare in `RUTE`, acelasi cod randeaza legatura.
//
// Navigatia (antet, meniuri, sertar, subsol, paleta) NU trece pe aici: acolo o legatura fara tinta
// nu se arata deloc (contractul din `navigatie.ts`, `seVede`). Diferenta e deliberata: meniul e o
// lista de drumuri, corpul paginii e o compozitie.
//
// Stilul de hover al primitivelor e scris pe `a` si `button`, deci un element inert nu reactioneaza
// la mouse si nu primeste focus.
//
// ASEZAREA (`src/lib/asezare.ts`): `legatura.href` e o cale SURSA, ca toate datele; existenta se verifica pe ea
// (`tintaActiva`, multimea cailor e tot sursa), iar adresa scrisa in `href` e cea SERVITA (`hrefTinta`). E punctul
// de emitere pentru legaturile din corpul paginilor, inclusiv cele din text (`TextInLinie`) si butoanele cu
// legatura. Pe asezarea `md` adresa e chiar calea.

import Link from "next/link";
import type { AnchorHTMLAttributes, ReactNode } from "react";
import { CAI_EXISTENTE } from "@/content/cai";
import { seVede, type CaiExistente, type Legatura } from "@/content/navigatie";
import { RUTE } from "@/content/rute";
import { asezareBuild, caSursa, caleServita, type CaleServita, type CodAsezare, type RutaAsezabila } from "@/lib/asezare";

export type TintaProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
  legatura: Legatura;
  children: ReactNode;
  /** Multimea cailor existente; implicit cea a site-ului. Parametru numai pentru probe. */
  cai?: CaiExistente;
  /** Manifestul rutelor si asezarea; implicit cele ale build-ului. Parametri numai pentru probe. */
  rute?: readonly RutaAsezabila[];
  asezare?: CodAsezare;
};

/** O legatura e activa cand are destinatie si cand ruta ei exista. */
export function tintaActiva(legatura: Legatura, cai: CaiExistente = CAI_EXISTENTE): boolean {
  return seVede(legatura, cai);
}

// Fara legaturi de apel (decizia 56): o tinta externa e numai posta sau o adresa web.
function esteExterna(href: string): boolean {
  return /^(mailto:|https?:)/i.test(href);
}

/** Adresa scrisa in `href` pentru o tinta interna: calea servita a caii sursa din legatura. */
export function hrefTinta(href: string, rute: readonly RutaAsezabila[] = RUTE, asezare: CodAsezare = asezareBuild()): CaleServita {
  return caleServita(caSursa(href), rute, asezare);
}

export default function Tinta({ legatura, children, cai = CAI_EXISTENTE, rute = RUTE, asezare, className, ...rest }: TintaProps) {
  if (!tintaActiva(legatura, cai) || legatura.href === null) {
    return (
      <span className={className} data-tinta-lipsa={legatura.href ?? "nedecisa"}>
        {children}
      </span>
    );
  }
  if (esteExterna(legatura.href)) {
    return (
      <a href={legatura.href} className={className} {...rest}>
        {children}
      </a>
    );
  }
  return (
    <Link href={hrefTinta(legatura.href, rute, asezare)} className={className} {...rest}>
      {children}
    </Link>
  );
}
