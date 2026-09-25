// CtaCinema: ultima sectiune a paginilor cinema (functionalitati__sablon.md §4.7). 80vh, bloc 680:
// titlul mare, paragraful mare, butonul spre contul gratuit, nota fina. Fara animatie de aparitie.
//
// SINGURA LEGATURA DIN CORPUL PAGINII: butonul -> `/inregistrare` (`CALE_INREGISTRARE`). Trece prin
// `Tinta`: cat timp ruta nu exista in `RUTE`, butonul ramane inert, cu acelasi aspect (RU-02, nicio
// legatura moarta); in ziua in care pagina de inregistrare apare, acelasi cod randeaza legatura.
//
// DOUA ABATERI DE LA REFERINTA, amandoua de accesibilitate si SEO, fara efect vizual:
//   - titlul e `h2`, cu forma vizuala a titlului mare (`t-h1-cinema`): la referinta e al doilea `h1` al
//     paginii (pe cautare-ai, singurul); la 3S pagina are un singur `h1`, cel din erou;
//   - paragraful are alb .5 (5,30:1), nota fina tot .5; la referinta .45 si .2 (1,71:1).

import { ArrowRight } from "lucide-react";
import Tinta from "@/components/primitive/Tinta";
import { CALE_INREGISTRARE } from "@/content/navigatie";
import SectiuneScena from "./SectiuneScena";
import s from "./CtaCinema.module.css";

export type CtaCinemaProps = {
  titlu: string;
  paragraf: string;
  /** Textul butonului (16,8 / 600). */
  buton: string;
  /** Nota fina de sub buton (11,52). */
  nota: string;
  /** Spatierea titlului: -0,03 em (implicit) sau -0,02 em (automatizari-ai). */
  spatiereTitlu?: "normala" | "stransa";
  /** Titlul la 390: 38,4 (implicit) sau 40 / 44 (cautare-ai). */
  titluMobil?: "normal" | "mare";
  /**
   * Latimea maxima a paragrafului, in px: 580 implicit (sablonul), 540 pe automatizari-ai, `null` =
   * tot blocul de 680 (cautare-ai).
   */
  latimeParagraf?: number | null;
  className?: string;
};

export default function CtaCinema({
  titlu,
  paragraf,
  buton,
  nota,
  spatiereTitlu = "normala",
  titluMobil = "normal",
  latimeParagraf = 580,
  className,
}: CtaCinemaProps) {
  const claseTitlu = [
    "t-h1-cinema",
    s.titlu,
    spatiereTitlu === "stransa" ? s.titluStrans : "",
    titluMobil === "mare" ? s.titluMobilMare : "",
  ]
    .filter(Boolean)
    .join(" ");
  return (
    <SectiuneScena inaltime={80} latime={680} className={className} nume="cta">
      <h2 className={claseTitlu}>{titlu}</h2>
      <p className={s.paragraf} style={{ maxWidth: latimeParagraf ?? "none" }}>
        {paragraf}
      </p>
      <Tinta legatura={{ text: buton, href: CALE_INREGISTRARE, ruta: CALE_INREGISTRARE }} className={s.buton}>
        <span>{buton}</span>
        <ArrowRight width={18} height={18} strokeWidth={2} aria-hidden="true" focusable="false" />
      </Tinta>
      <small className={s.nota}>{nota}</small>
    </SectiuneScena>
  );
}
