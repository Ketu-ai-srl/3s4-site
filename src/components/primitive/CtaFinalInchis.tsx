// CTA-ul final inchis: aceeasi componenta pe 14 pagini (start, contact, e-facturare, verificatorul
// de termene, integrari, platforma, hub-ul de solutii si cele 7 sectoare). Continutul implicit e
// cel al startului (`CTA_FINAL` din `src/content/acasa.ts`); o pagina care vrea alt text il da prin
// proprietati. Vizualul din dreapta are date fictive, declarate ca exemplu (plan D9).

import { CTA_FINAL, type CtaFinal } from "@/content/acasa";
import Buton from "./Buton";
import Iconita from "./Iconita";
import Reveal from "./Reveal";
import s from "./CtaFinalInchis.module.css";

export type CtaFinalInchisProps = {
  continut?: CtaFinal;
  /** Ancora sectiunii (pe start: `contact`). */
  id?: string;
};

export default function CtaFinalInchis({ continut = CTA_FINAL, id }: CtaFinalInchisProps) {
  const c = continut;
  const idTitlu = (id ?? "cta-final") + "-titlu";
  return (
    <section id={id} className={s.sectiune} aria-labelledby={idTitlu}>
      <div className="container-site">
        <Reveal className={s.card}>
          <div className={s.grila}>
            <div className={s.stanga}>
              <h2 id={idTitlu} className={"t-h2-cta " + s.titlu}>
                {c.titlu}
              </h2>
              <p className={s.subtitlu}>{c.subtitlu}</p>
              <div className={s.butoane}>
                <Buton varianta="alb-pe-inchis" marime="mare" sageata legatura={c.butonPrincipal}>
                  {c.butonPrincipal.text}
                </Buton>
                <Buton varianta="contur-pe-inchis" marime="mare" legatura={c.butonSecundar}>
                  {c.butonSecundar.text}
                </Buton>
              </div>
              <p className={s.microtext}>{c.microtext}</p>
            </div>
            <figure className={s.vizual}>
              <figcaption className="doar-cititor">{c.vizual.declaratie}</figcaption>
              {c.vizual.pasi.map((p) => (
                <div key={p.text} className={s.pas} aria-hidden="true">
                  <Iconita nume={p.iconita} marime={14} contur={1.5} className={s.pasIconita} />
                  <span className={s.pasText}>{p.text}</span>
                  <span className={s.pasOra}>{p.ora}</span>
                </div>
              ))}
              <div className={s.rezultat} aria-hidden="true">
                <span className={s.rezultatCutie}>
                  <Iconita nume="file-text" marime={18} contur={1.5} />
                </span>
                <span className={s.rezultatText}>
                  <span className={s.rezultatFisier}>{c.vizual.rezultat.fisier}</span>
                  <span className={s.rezultatStare}>
                    <span className={s.punctVerde} />
                    {c.vizual.rezultat.stare}
                  </span>
                </span>
                <span className={s.rezultatOra}>{c.vizual.rezultat.ora}</span>
              </div>
            </figure>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
