// Benzile de carduri ale hub-ului (solutii.md S2, S4, S5): h2 de banda si o grila de carduri-legatura.
//   mare  430 x 337,5: padding 32 (24 la 390), iconita 32, h3 21,6 fluid, descriere 16, legatura
//         14/600 cu sageata 16 si gap 8 -> 12 la hover;
//   mic   432 x 257,3: padding 24, iconita 28, h3 16, descriere 14/21,7, gap 6 -> 10 la hover;
//   una   cardul mic pe o coloana de cel mult 540 (banda a treia).
// Hover: chenarul trece in `ardezie-3`, legatura in albastru, sageata fuge 4 px; 0,15 s.
// Tot cardul e legatura, prin `Tinta`: inert (acelasi aspect) cat timp ruta sectorului nu exista.

import Tinta from "@/components/primitive/Tinta";
import type { ElementMeniu } from "@/content/navigatie";
import IconitaSolutii from "./IconitaSolutii";
import s from "./hub.module.css";

export type CarduriHubProps = {
  titlu: string;
  elemente: ElementMeniu[];
  marime: "mare" | "mic" | "una";
  legatura: string;
  /** Distanta de sus a benzii: 24 pe prima banda, 64 pe celelalte (40 la 390). */
  prima?: boolean;
};

export default function CarduriHub({ titlu, elemente, marime, legatura, prima = false }: CarduriHubProps) {
  const mare = marime === "mare";
  const clasaGrila = mare ? s.grilaMare : marime === "mic" ? s.grilaMica : s.grilaUna;
  return (
    <section className={prima ? s.bandaPrima : s.banda}>
      <div className="container-site">
        <div className={s.coloana}>
          <h2 className={"t-h2-bloc " + s.titluBanda}>{titlu}</h2>
          <ul className={clasaGrila}>
            {elemente.map((e) => (
              <li key={e.text} className={s.celula}>
                <Tinta legatura={e} className={[s.card, mare ? s.cardMare : s.cardMic].join(" ")}>
                  <span className={mare ? s.iconitaMare : s.iconitaMica}>
                    <IconitaSolutii nume={e.iconita} marime={mare ? 32 : 28} contur={1.5} />
                  </span>
                  <h3 className={mare ? s.titluMare : "t-h3-card " + s.titluMic}>{e.text}</h3>
                  <p className={mare ? s.descriereMare : s.descriereMica}>{e.descriere}</p>
                  <span className={mare ? s.legaturaMare : s.legaturaMica}>
                    <span>{legatura}</span>
                    <IconitaSolutii nume="arrow-right" marime={16} contur={2} />
                  </span>
                </Tinta>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
