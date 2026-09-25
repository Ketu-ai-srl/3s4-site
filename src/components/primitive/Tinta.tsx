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

import Link from "next/link";
import type { AnchorHTMLAttributes, ReactNode } from "react";
import { CAI_EXISTENTE } from "@/content/cai";
import { seVede, type CaiExistente, type Legatura } from "@/content/navigatie";

export type TintaProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
  legatura: Legatura;
  children: ReactNode;
  /** Multimea cailor existente; implicit cea a site-ului. Parametru numai pentru probe. */
  cai?: CaiExistente;
};

/** O legatura e activa cand are destinatie si cand ruta ei exista. */
export function tintaActiva(legatura: Legatura, cai: CaiExistente = CAI_EXISTENTE): boolean {
  return seVede(legatura, cai);
}

function esteExterna(href: string): boolean {
  return /^(mailto:|tel:|https?:)/i.test(href);
}

export default function Tinta({ legatura, children, cai = CAI_EXISTENTE, className, ...rest }: TintaProps) {
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
    <Link href={legatura.href} className={className} {...rest}>
      {children}
    </Link>
  );
}
