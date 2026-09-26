// Cutia CTA de 880 (comparatiile, fluxul de documente): cutie ardezie-9, raza 16, h2 alb 28,
// paragraf ardezie-3, buton plin-plat. Sectiune 64 / 80 (40 / 56 sub 768).

import type { ReactNode } from "react";
import type { Legatura } from "@/content/navigatie";
import Buton from "./Buton";
import s from "./bloc.module.css";

export type CutieCta880Props = {
  titlu: ReactNode;
  text: ReactNode;
  buton: Legatura;
  id?: string;
};

export default function CutieCta880({ titlu, text, buton, id }: CutieCta880Props) {
  return (
    <section id={id} className={s.ctaSectiune}>
      <div className="container-site">
        <div className={s.ctaCutie}>
          <h2 className={s.ctaTitlu}>{titlu}</h2>
          <p className={s.ctaText}>{text}</p>
          <Buton varianta="plin" marime="plat" legatura={buton}>
            {buton.text}
          </Buton>
        </div>
      </div>
    </section>
  );
}
