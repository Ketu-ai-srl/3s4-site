// Pagina `/blog` (sablonul blog-L, blog.md §A): antetul centrat, apoi lista cu cautare, pastile,
// contor, grila de 3 / 1 si „mai multe articole". Cardurile pleaca spre insula client ca date; primele
// 9 sunt in HTML-ul servit.

import JsonLd from "@/components/seo/JsonLd";
import type { ArticolComplet } from "@/content/blog/conducta";
import { CALE_BLOG, caleFiltru, categoriiCuArticole } from "@/content/blog/registru";
import { CATEGORII, LISTARE } from "@/content/blog/texte";
import AntetBlog from "./AntetBlog";
import { grafListaArticole } from "./date-structurate";
import ListareBlog from "./ListareBlog";
import { dateCard } from "./carduri";
import s from "./blog.module.css";

export default function PaginaListare({ articole }: { articole: readonly ArticolComplet[] }) {
  const carduri = articole.map(dateCard);
  const categorii = categoriiCuArticole(carduri).map((c) => ({ slug: c, nume: CATEGORII[c].nume, cale: caleFiltru(c) }));
  return (
    <main className={s.pagina}>
      <AntetBlog
        niveluri={[
          { text: "Acasă", cale: "/" },
          { text: LISTARE.fir, cale: CALE_BLOG },
        ]}
        titlu={LISTARE.titlu}
        subtitlu={LISTARE.subtitlu}
      />
      <div className={s.sectiuneLista}>
        <div className="container-site">
          <ListareBlog articole={carduri} categorii={categorii} />
        </div>
      </div>
      <JsonLd date={grafListaArticole(LISTARE.titlu, CALE_BLOG, carduri)} />
    </main>
  );
}
