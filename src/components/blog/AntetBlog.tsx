// Antetul paginilor de listare si de categorie (blog.md §A2, §B2): fir centrat, h1 blog, subtitlu
// 18/28,8 `cerneala-2` pe cel mult 600 px, padding 128 / 48 la ambele latimi.
//
// APARITIA (masurata pe referinta: opacitate 0 + 10 px -> 1 / 0 in 0,45 s ease-out, pe titlu si
// subtitlu, fara fir) e o animatie CSS la prima pictare, nu primitiva `Reveal`: `Reveal` nu ascunde
// deliberat ce e deja in fereastra la hidratare (ar clipi), iar antetul e mereu acolo, deci n-ar aparea
// niciodata. Animatia CSS porneste si fara JavaScript, textul e in HTML-ul servit oricum, iar la miscare
// redusa regula globala o termina pe loc.
//
// Pe categorie (varianta C) se adauga eticheta de deasupra h1: 12/600 `albastru`, inline-block in
// randul de 16 / 25,6 al parintelui, deci coboara cu ~5 px si impinge h1-ul la y 211 (masurat pe
// referinta: facuta bloc, ar scurta antetul cu ~6 px).

import FirPagina, { type NivelFir } from "@/components/primitive/FirPagina";
import s from "./blog.module.css";

export type AntetBlogProps = {
  niveluri: NivelFir[];
  titlu: string;
  subtitlu: string;
  eticheta?: string;
};

export default function AntetBlog({ niveluri, titlu, subtitlu, eticheta }: AntetBlogProps) {
  return (
    <div className={s.antet}>
      <div className="container-site">
        <FirPagina niveluri={niveluri} aliniere="centru" className={s.antetFir} />
        <div className={s.antetText} data-aparitie="">
          {eticheta ? (
            <div className={s.etichetaRand}>
              <span className={s.eticheta}>{eticheta}</span>
            </div>
          ) : null}
          <h1 className={"t-h1-blog " + s.antetTitlu}>{titlu}</h1>
          <p className={"t-subtitlu-sectiune " + s.antetSubtitlu}>{subtitlu}</p>
        </div>
      </div>
    </div>
  );
}
