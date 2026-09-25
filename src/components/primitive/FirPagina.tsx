// Firul de pagina (breadcrumb): juridic__sablon.md §3, solutii__sablon.md S1.
// Legaturile 14/400 cerneala-2 (hover albastru, 0,15 s), chevron 16 cu contur 1,5 cerneala-3,
// nivelul curent 14/500 cerneala, fara legatura, cu `aria-current`. Se rupe pe randuri cand nu
// incape. Date structurate `BreadcrumbList` o singura data, aici, pe fiecare pagina care il are.

import { ADRESA_BAZA } from "@/content/rute";
import Tinta from "./Tinta";
import s from "./primitive.module.css";

export type NivelFir = {
  text: string;
  /** Calea nivelului. Ultimul nivel e pagina curenta si nu devine legatura. */
  cale: string;
};

export type FirPaginaProps = {
  niveluri: NivelFir[];
  aliniere?: "stanga" | "centru";
  /** Ascuns sub 600 px (pagina de inregistrare). */
  ascunsSub600?: boolean;
  className?: string;
};

function Chevron() {
  return (
    <svg className={s.firSeparator} width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
      <path
        d="M6 4 L10 8 L6 12"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function dateFir(niveluri: NivelFir[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: niveluri.map((n, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: n.text,
      item: new URL(n.cale, ADRESA_BAZA).toString(),
    })),
  };
}

export default function FirPagina({ niveluri, aliniere = "stanga", ascunsSub600 = false, className }: FirPaginaProps) {
  const clase = [s.fir, aliniere === "centru" ? s.firCentru : "", className ?? ""].filter(Boolean).join(" ");
  return (
    <nav aria-label="Fir de navigare" className={ascunsSub600 ? s.firAscunsMic : undefined}>
      <ol className={clase}>
        {niveluri.map((n, i) => {
          const ultim = i === niveluri.length - 1;
          return (
            <li key={n.cale + i} className={s.firElement}>
              {ultim ? (
                <span className={s.firCurent} aria-current="page">
                  {n.text}
                </span>
              ) : (
                <>
                  <Tinta legatura={{ text: n.text, href: n.cale, ruta: n.cale }} className={s.firLegatura}>
                    {n.text}
                  </Tinta>
                  <Chevron />
                </>
              )}
            </li>
          );
        })}
      </ol>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(dateFir(niveluri)) }} />
    </nav>
  );
}
