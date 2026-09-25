// Lista de carduri a indexului juridic (juridic.md §2d): 7 carduri de 82 px, cate unul pe document,
// in ordinea barei. Tot cardul e legatura; cutia de 40 pe `albastru-pal` cu iconita de document
// (setul Lucide, conturul 1,5 din fisa), titlul si sageata care la hover trece pe `albastru` si
// aluneca 4 px. Sageata e o forma elementara, desenata aici.
//
// Titlul cardului nu e un `h3` ca la referinta: sub h1-ul paginii ar sari un nivel de titlu (S-03),
// iar lista de legaturi nu are nevoie de titluri ca sa fie parcursa.

import Iconita from "@/components/primitive/Iconita";
import Tinta from "@/components/primitive/Tinta";
import { DOCUMENTE_JURIDICE, caleDocument } from "@/content/juridic/publicare";
import s from "./juridic.module.css";

function Sageata() {
  return (
    <svg className={s.cardSageata} width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
      <path
        d="M3 8 H13 M13 8 L9 4 M13 8 L9 12"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function CarduriDocumente() {
  return (
    <ul className={s.carduri}>
      {DOCUMENTE_JURIDICE.map((d) => {
        const cale = caleDocument(d.slug);
        return (
          <li key={d.slug}>
            <Tinta legatura={{ text: d.scurt, href: cale, ruta: cale }} className={s.card} data-card-document={d.slug}>
              <span className={s.cardIconita}>
                <Iconita nume="file-text" marime={24} contur={1.5} />
              </span>
              <span className={s.cardTitlu}>{d.scurt}</span>
              <Sageata />
            </Tinta>
          </li>
        );
      })}
    </ul>
  );
}
