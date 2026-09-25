// Corpul paginii `/integrari` (fisa integrari.md; COMPONENTE §4.6): eroul interior pe blocul de 880,
// legenda cu cele trei stari, grila celor sase categorii, importul de director in trei pasi si
// cardul "lipseste". CTA-ul final il pune pagina.
//
// Fara sigle de terti: numele produselor sunt text, ca in forma masurata. Starea fiecarei pastile
// se vede prin punct (forma si culoare) si se citeste cititoarelor de ecran ca text.

import Buton from "@/components/primitive/Buton";
import EroulInterior from "@/components/primitive/EroulInterior";
import {
  CATEGORII_INTEGRARI,
  DIRECTOR_INTEGRARI,
  EROU_INTEGRARI,
  FIR_INTEGRARI,
  LEGENDA_INTEGRARI,
  LIPSESTE_INTEGRARI,
  TITLU_GRILA_INTEGRARI,
  type StareIntegrare,
} from "@/content/produs/integrari";
import IconitaProdus from "./IconitaProdus";
import { nerupt } from "./nerupt";
import s from "./integrari.module.css";

const CLASA_PUNCT: Record<StareIntegrare, string> = {
  disponibil: s.punctDisponibil,
  lucru: s.punctLucru,
  plan: s.punctPlan,
};

const TEXT_STARE: Record<StareIntegrare, string> = Object.fromEntries(
  LEGENDA_INTEGRARI.map((l) => [l.stare, l.text.toLowerCase()]),
) as Record<StareIntegrare, string>;

function Punct({ stare }: { stare: StareIntegrare }) {
  return <span className={s.punct + " " + CLASA_PUNCT[stare]} aria-hidden="true" />;
}

export default function PaginaIntegrari() {
  const d = DIRECTOR_INTEGRARI;
  const l = LIPSESTE_INTEGRARI;
  return (
    <>
      <EroulInterior fir={FIR_INTEGRARI} titlu={EROU_INTEGRARI.titlu} subtitlu={EROU_INTEGRARI.subtitlu} />
      <section className={s.sectiune} aria-labelledby="integrari-grila">
        <div className="container-site">
          <div className={s.lat}>
            <h2 id="integrari-grila" className="doar-cititor">
              {TITLU_GRILA_INTEGRARI}
            </h2>
            <ul className={s.legenda} aria-label="Stările integrărilor">
              {LEGENDA_INTEGRARI.map((x) => (
                <li key={x.stare} className={s.legendaElement}>
                  <Punct stare={x.stare} />
                  {x.text}
                </li>
              ))}
            </ul>
            <ul className={s.grila}>
              {CATEGORII_INTEGRARI.map((c) => (
                <li key={c.titlu} className={s.card}>
                  <div className={s.cardCap}>
                    <span className={s.cardIconita}>
                      <IconitaProdus nume={c.iconita} marime={20} contur={1.5} />
                    </span>
                    <h3 className={"t-h3-card " + s.cardTitlu}>{nerupt(c.titlu)}</h3>
                  </div>
                  <p className={s.cardDescriere}>{nerupt(c.descriere)}</p>
                  <ul className={s.pastile} aria-label={c.titlu}>
                    {c.integrari.map((i) => (
                      <li key={i.nume} className={s.pastila + (i.stare === "disponibil" ? "" : " " + s.pastilaStearsa)}>
                        <Punct stare={i.stare} />
                        {i.nume}
                        <span className="doar-cititor">{" (" + TEXT_STARE[i.stare] + ")"}</span>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          </div>

          <div className={s.bloc}>
            <h2 className={"t-h2-bloc " + s.directorTitlu}>{nerupt(d.titlu)}</h2>
            <p className={s.directorText}>{nerupt(d.text)}</p>
            <ol className={s.pasi}>
              {d.pasi.map((p, i) => (
                <li key={p.titlu} className={s.pas}>
                  <span className={s.pasNumar} aria-hidden="true">
                    {i + 1}
                  </span>
                  <div>
                    <h3 className={s.pasTitlu}>{nerupt(p.titlu)}</h3>
                    <p className={s.pasText}>{nerupt(p.text)}</p>
                  </div>
                </li>
              ))}
            </ol>
            <p className={s.nota}>{nerupt(d.nota)}</p>
          </div>

          <div className={s.lipseste}>
            <div>
              <h2 className={"t-h2-bloc " + s.lipsesteTitlu}>{nerupt(l.titlu)}</h2>
              <p className={s.lipsesteText}>{nerupt(l.text)}</p>
            </div>
            <Buton varianta="contur" legatura={l.buton}>
              {l.buton.text}
            </Buton>
          </div>
        </div>
      </section>
    </>
  );
}
