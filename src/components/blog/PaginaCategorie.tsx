// Pagina unei categorii, `/blog/categorie/<c>` (sablonul blog-C, blog.md §B): acelasi antet ca
// listarea, cu eticheta deasupra h1; pastile-legaturi aliniate la stanga (activa pe `albastru`, alta
// culoare decat pe listare), contorul mereu vizibil, grila 3 / 2 / 1 cu cardul C si TOATE articolele
// categoriei randate de server, fara cautare si fara „mai multe".

import Link from "next/link";
import JsonLd from "@/components/seo/JsonLd";
import type { ArticolComplet } from "@/content/blog/conducta";
import { CALE_BLOG, caleCategorie, categoriiCuArticole, type CategorieBlog } from "@/content/blog/registru";
import { CATEGORIE, CATEGORII, LISTARE } from "@/content/blog/texte";
import AntetBlog from "./AntetBlog";
import CardArticol from "./CardArticol";
import { dateCard } from "./carduri";
import { grafListaArticole } from "./date-structurate";
import { numarArticole } from "./format";
import s from "./blog.module.css";

export default function PaginaCategorie({ categorie, articole }: { categorie: CategorieBlog; articole: readonly ArticolComplet[] }) {
  const info = CATEGORII[categorie];
  const toate = articole.map(dateCard);
  const aici = toate.filter((a) => a.categorie === categorie);
  const cale = caleCategorie(categorie);
  return (
    <main className={s.pagina}>
      <AntetBlog
        niveluri={[
          { text: "Acasă", cale: "/" },
          { text: LISTARE.fir, cale: CALE_BLOG },
          { text: info.nume, cale },
        ]}
        eticheta={CATEGORIE.eticheta}
        titlu={info.nume}
        subtitlu={info.descriere}
      />
      <div className={s.sectiuneLista}>
        <div className="container-site">
          <nav aria-label={LISTARE.etichetaPastile}>
            <ul className={s.pastileC}>
              <li>
                <Link href={CALE_BLOG} prefetch={false} className={s.pastilaC}>
                  {LISTARE.toate}
                </Link>
              </li>
              {categoriiCuArticole(toate).map((c) => (
                <li key={c}>
                  <Link
                    href={caleCategorie(c)}
                    prefetch={false}
                    className={s.pastilaC}
                    aria-current={c === categorie ? "page" : undefined}
                  >
                    {CATEGORII[c].nume}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <p className={s.contorC}>{numarArticole(aici.length)}</p>
          <div className={s.grilaC}>
            {aici.map((a) => (
              <CardArticol key={a.slug} articol={a} varianta="C" />
            ))}
          </div>
        </div>
      </div>
      <JsonLd date={grafListaArticole(info.nume, cale, aici)} />
    </main>
  );
}
