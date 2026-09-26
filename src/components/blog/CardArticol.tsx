// Cardul unui articol (blog.md 3e si §B3; blog__articol-sablon.md §8), in trei variante:
//   - `L`: listarea; imagine 16:9 cu decupare si linie dedesubt, titlul si extrasul taiate la 2
//     randuri, hover pe chenar si umbra, sageata care aluneca 4 px;
//   - `C`: paginile de categorie; imaginea la proportia ei, fara umbra, titlul intreg, extrasul la 3
//     randuri, hover cu ridicare de 4 px si umbra albastruie;
//   - `inrudit`: cardul L fara randul de data.
//
// TOT CARDUL E CLICABIL, dar legatura e numai TITLUL, intinsa peste card printr-un pseudo-element.
// La referinta tot cardul e un `a`, deci numele accesibil al legaturii era tot textul cardului (data,
// minutele, titlul, extrasul, indemnul); aici e titlul, iar focusul se vede pe conturul cardului.
//
// Fara hooks: se randeaza pe server (categorii, inrudite) si in insula listarii.

import Link from "next/link";
import Iconita from "@/components/primitive/Iconita";
import { caleArticol } from "@/content/blog/registru";
import { CARD } from "@/content/blog/texte";
import Coperta from "./Coperta";
import { dataRo, minuteText, type DateCard } from "./format";
import s from "./blog.module.css";

export type VariantaCard = "L" | "C" | "inrudit";

export type CardArticolProps = {
  articol: DateCard;
  varianta: VariantaCard;
  /** Nivelul titlului: h2 pe listare si categorii (sub h1), h3 printre inrudite (sub h2). */
  nivel?: "h2" | "h3";
  /** Pozitia in grila; dupa „mai multe articole" focusul trece pe primul card nou. */
  index?: number;
};

export default function CardArticol({ articol, varianta, nivel = "h2", index }: CardArticolProps) {
  const Titlu = nivel;
  const clase = [s.card, varianta === "C" ? s.cardC : s.cardL].join(" ");
  return (
    <article className={clase} data-card={varianta}>
      <div className={varianta === "C" ? s.cardImagineC : s.cardImagineL}>
        <Coperta titlu={articol.titlu} categorie={articol.categorie} slug={articol.slug} data={articol.data} />
      </div>
      <div className={s.cardCorp}>
        {varianta === "inrudit" ? null : (
          <p className={s.cardMeta}>
            <time dateTime={articol.data}>{dataRo(articol.data)}</time>
            <span>{minuteText(articol.minute)}</span>
          </p>
        )}
        <Titlu className={s.cardTitlu}>
          <Link href={caleArticol(articol)} prefetch={false} className={s.cardLegatura} data-card-index={index}>
            {articol.titlu}
          </Link>
        </Titlu>
        <p className={s.cardExtras}>{articol.extras}</p>
        <span className={s.cardCiteste} aria-hidden="true">
          {CARD.citeste}
          <Iconita nume="arrow-right" marime={16} contur={2} />
        </span>
      </div>
    </article>
  );
}
