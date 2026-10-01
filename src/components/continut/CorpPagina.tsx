// Corpul unei pagini de continut (modelul comun, `src/content/model/tipuri.ts`): H1, capsula si
// sectiunile. Sectiunile le randeaza `CorpDocument`, acelasi randator ca la documentele juridice, deci
// marcajul in linie, listele si tabelele arata la fel pe ambele familii de pagini.
//
// Capsula se randeaza aici, in antet, nu ca `introducere` a corpului: intre ea si prima sectiune
// pagina poate pune blocul de contact al eroului (`dupaCapsula`), iar la final blocul de CTA (`final`).
// Componenta nu stie de canale si nu scrie niciun cuvant al ei: tot textul vine din modul.

import type { ReactNode } from "react";
import CorpDocument from "@/components/juridic/CorpDocument";
import TextInLinie from "@/components/juridic/TextInLinie";
import type { PaginaContinut } from "@/content/model/tipuri";

export default function CorpPagina({
  pagina,
  dupaCapsula,
  final,
}: {
  pagina: PaginaContinut;
  /** Ce sta intre capsula si prima sectiune (de regula, CTA-ul eroului). */
  dupaCapsula?: ReactNode;
  /** Ce sta dupa ultima sectiune (de regula, blocul de CTA de final). */
  final?: ReactNode;
}) {
  return (
    <article data-pagina={pagina.cheie}>
      <header>
        <h1 className="t-h1-interior">{pagina.h1}</h1>
        <p data-capsula="">
          <TextInLinie text={pagina.capsula} />
        </p>
        {dupaCapsula}
      </header>
      <CorpDocument document={{ introducere: "", sectiuni: pagina.sectiuni }} />
      {final}
    </article>
  );
}
