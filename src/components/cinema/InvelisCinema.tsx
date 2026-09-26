// InvelisCinema: `main`-ul paginilor cinema (functionalitati__sablon.md §1.1): fundal `negru-cinema`
// peste toata zona de continut, taiat pe ambele axe (`overflow: clip`, ca textele uriase si cardurile
// laterale sa nu produca derulare orizontala), cu stratul de fundal (lumina + grila) inauntru.
//
// Pagina pune separat `<TemaPagina tema="inchisa" />` (antetul, sertarul si subsolul pe varianta
// inchisa): invelisul nu o pune singur, fiindca tema e o decizie a paginii, nu a cadrului.
//
//     <InvelisCinema>
//       <TemaPagina tema="inchisa" />
//       <EroulCinema ... />
//       <SectiuneScena ...>...</SectiuneScena>
//       <CtaCinema ... />
//     </InvelisCinema>

import type { ReactNode } from "react";
import FundalCinema from "./FundalCinema";
import s from "./InvelisCinema.module.css";

export type InvelisCinemaProps = {
  children: ReactNode;
  /** Factorul paralaxei grilei: 0,18 pe functionalitati (implicit), 0,2 pe promo. */
  factorParalaxa?: number;
  className?: string;
  /** Numele paginii, pentru probe (`data-pagina-cinema`). */
  pagina?: string;
};

export default function InvelisCinema({ children, factorParalaxa, className, pagina }: InvelisCinemaProps) {
  return (
    <main className={[s.invelis, className].filter(Boolean).join(" ")} data-invelis="cinema" data-pagina-cinema={pagina}>
      <FundalCinema factor={factorParalaxa} />
      {children}
    </main>
  );
}
