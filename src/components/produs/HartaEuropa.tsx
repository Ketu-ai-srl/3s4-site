// Harta Europei din blocul 01 al paginii de securitate (securitate.md §3; COMPONENTE §4.6).
//
// CONTURUL (`public/produs/harta-europa.svg`, 800 x 480, static) e desenat de noi din Natural Earth
// 1:50m land, date in domeniul public: proiectie Lambert azimutala echivalenta cu centrul in
// 10E / 50N, tarm simplificat la 1,3 px, insule sub 14 px patrati scoase, marginile de est si de
// nord stinse in gradient. Generatorul nu sta in depozit (e un script de o singura folosire); valorile
// lui sunt in comentariul din fisierul SVG. Nu e conturul referintei vizuale.
//
// O SINGURA REGIUNE, in Germania, fara oras (decizia D4c: gazduire Amazon, Germania, o regiune).
// Reperul si eticheta sunt HTML asezat peste imagine, in procente din cadru, ca eticheta sa ramana
// la 11 px si lizibila la orice latime; la referinta textul din SVG ajungea la ~4 px la 390.
// Imaginea e decor (text alternativ gol, `role="presentation"`); ce arata harta spune legenda.

import Image from "next/image";
import { BLOC_INFRASTRUCTURA } from "@/content/produs/securitate";
import s from "./securitate.module.css";

export default function HartaEuropa() {
  const h = BLOC_INFRASTRUCTURA.harta;
  const pozitie = { left: h.reper.x + "%", top: h.reper.y + "%" };
  return (
    <figure className={s.harta + " " + s.card + " " + s.hartaCadru}>
      <div className={s.hartaSuprafata}>
        <Image
          src="/produs/harta-europa.svg"
          alt=""
          role="presentation"
          width={800}
          height={480}
          unoptimized
          className={s.hartaImagine}
        />
        <span className={s.reper} style={pozitie} aria-hidden="true" />
        <span className={s.reperEticheta} style={pozitie} aria-hidden="true">
          {h.eticheta}
        </span>
      </div>
      <figcaption className={s.hartaLegenda}>
        <span className="doar-cititor">{h.descriere}</span>
        <span className={s.hartaRegiune}>{h.legenda}</span>
        <span className={s.hartaNota}>{h.nota}</span>
      </figcaption>
    </figure>
  );
}
