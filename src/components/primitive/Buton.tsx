// Butonul site-ului: o singura componenta, cu variantele masurate (componente-globale.md §8.1).
//
// Cu `legatura`, se randeaza prin `Tinta`: legatura cand tinta exista, element inert cu acelasi
// aspect cand nu. Fara `legatura`, e un `button` (pentru formulare si piese interactive).

import type { ButtonHTMLAttributes, ReactNode } from "react";
import type { Legatura } from "@/content/navigatie";
import Iconita from "./Iconita";
import Tinta from "./Tinta";
import s from "./Buton.module.css";

export type VariantaButon =
  | "plin"
  | "contur"
  | "fantoma"
  | "fantoma-sector"
  | "alb-pe-inchis"
  | "contur-pe-inchis"
  | "contur-albastru";

export type MarimeButon = "baza" | "mare" | "antet" | "plat";

const CLASA_VARIANTA: Record<VariantaButon, string> = {
  plin: s.plin,
  contur: s.contur,
  fantoma: s.fantoma,
  "fantoma-sector": s.fantomaSector,
  "alb-pe-inchis": s.albPeInchis,
  "contur-pe-inchis": s.conturPeInchis,
  "contur-albastru": s.conturAlbastru,
};

const CLASA_MARIME: Record<MarimeButon, string> = {
  baza: "",
  mare: s.mare,
  antet: s.antet,
  plat: s.plat,
};

/** Sageata de dupa text: marimea si grosimea masurate pe fiecare treapta. */
const SAGEATA: Record<MarimeButon, { marime: number; contur: number }> = {
  baza: { marime: 16, contur: 2 },
  mare: { marime: 18, contur: 1.5 },
  antet: { marime: 14, contur: 2.25 },
  plat: { marime: 15, contur: 2 },
};

type Comune = {
  varianta?: VariantaButon;
  marime?: MarimeButon;
  latimePlina?: boolean;
  /** Sageata spre dreapta dupa text. */
  sageata?: boolean;
  /** O iconita inaintea textului (de pilda `circle-play` pe butonul secundar al eroului). */
  iconitaInainte?: string;
  /** Dunga de lumina la hover (butonul plin al eroului). */
  stralucire?: boolean;
  className?: string;
  children: ReactNode;
};

export type ButonProps = Comune &
  (
    | { legatura: Legatura }
    | ({ legatura?: undefined } & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className" | "children">)
  );

export function claseButon(
  varianta: VariantaButon = "plin",
  marime: MarimeButon = "baza",
  latimePlina = false,
  stralucire = false,
  extra?: string,
): string {
  return [
    s.buton,
    CLASA_VARIANTA[varianta],
    CLASA_MARIME[marime],
    latimePlina ? s.latimePlina : "",
    stralucire ? s.stralucire : "",
    extra ?? "",
  ]
    .filter(Boolean)
    .join(" ");
}

export default function Buton(props: ButonProps) {
  const {
    varianta = "plin",
    marime = "baza",
    latimePlina = false,
    sageata = false,
    iconitaInainte,
    stralucire = false,
    className,
    children,
  } = props;
  const clase = claseButon(varianta, marime, latimePlina, stralucire, className);
  const dimensiune = SAGEATA[marime];
  const continut = (
    <>
      {iconitaInainte ? (
        <Iconita nume={iconitaInainte} marime={dimensiune.marime} contur={1.5} className={s.iconita} />
      ) : null}
      <span>{children}</span>
      {sageata ? (
        <Iconita nume="arrow-right" marime={dimensiune.marime} contur={dimensiune.contur} className={s.sageata} />
      ) : null}
    </>
  );

  if (props.legatura) {
    return (
      <Tinta legatura={props.legatura} className={clase}>
        {continut}
      </Tinta>
    );
  }

  return (
    <button type={props.type ?? "button"} className={clase} {...atributeButon(props)}>
      {continut}
    </button>
  );
}

const PROPRII = new Set([
  "varianta",
  "marime",
  "latimePlina",
  "sageata",
  "iconitaInainte",
  "stralucire",
  "className",
  "children",
  "legatura",
  "type",
]);

/** Atributele native ale butonului, fara proprietatile componentei. */
function atributeButon(props: object): ButtonHTMLAttributes<HTMLButtonElement> {
  const rezultat: Record<string, unknown> = {};
  for (const [cheie, valoare] of Object.entries(props)) {
    if (!PROPRII.has(cheie)) {
      rezultat[cheie] = valoare;
    }
  }
  return rezultat as ButtonHTMLAttributes<HTMLButtonElement>;
}
