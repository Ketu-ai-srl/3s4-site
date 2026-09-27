// Pagina `n` a listarii, `/blog/pagina/<n>` (felia seo-tehnic, auditul SEO m1): acelasi antet si
// aceeasi grila de carduri L ca `/blog`, cu articolele paginii randate pe server, apoi legaturile
// spre pagina anterioara si urmatoare. Fara cautare, pastile si buton: acelea lucreaza pe toata lista
// si stau pe `/blog`; aici pagina e un drum static spre articole, pentru cine n-are JavaScript.

import JsonLd from "@/components/seo/JsonLd";
import type { ArticolComplet } from "@/content/blog/conducta";
import { CALE_BLOG } from "@/content/blog/registru";
import { LISTARE } from "@/content/blog/texte";
import AntetBlog from "./AntetBlog";
import CardArticol from "./CardArticol";
import { dateCard } from "./carduri";
import { grafListaArticole } from "./date-structurate";
import NavPaginare from "./NavPaginare";
import { PAGINARE, articolePagina, calePagina, numarPagini, vecini } from "./paginare";
import s from "./blog.module.css";

export default function PaginaListareN({ articole, pagina }: { articole: readonly ArticolComplet[]; pagina: number }) {
  const carduri = articolePagina(articole.map(dateCard), pagina);
  const cale = calePagina(pagina);
  return (
    <main className={s.pagina}>
      <AntetBlog
        niveluri={[
          { text: "Acasă", cale: "/" },
          { text: LISTARE.fir, cale: CALE_BLOG },
          { text: PAGINARE.fir(pagina), cale },
        ]}
        titlu={LISTARE.titlu}
        subtitlu={LISTARE.subtitlu}
      />
      <div className={s.sectiuneLista}>
        <div className="container-site">
          <div className={s.grilaL}>
            {carduri.map((a) => (
              <CardArticol key={a.slug} articol={a} varianta="L" />
            ))}
          </div>
          <NavPaginare {...vecini(pagina, numarPagini(articole.length))} />
        </div>
      </div>
      <JsonLd date={grafListaArticole(PAGINARE.titluPagina(pagina), cale, carduri)} />
    </main>
  );
}
