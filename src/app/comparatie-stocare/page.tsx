// /comparatie-stocare (comparatie-stocare.md): erou cu fir, trei carduri de varianta pe 1100,
// tabelul cu marcaje, diagrama cu comutator (singura piesa interactiva), caseta pentru bucket-ul propriu
// si cutia CTA de 880.

import CarduriVariante from "@/components/comparatii/CarduriVariante";
import DiagramaComutator from "@/components/comparatii/DiagramaComutator";
import TabelMarcaje from "@/components/comparatii/TabelMarcaje";
import s from "@/components/comparatii/comparatii.module.css";
import CapBloc from "@/components/primitive/CapBloc";
import CasetaGri from "@/components/primitive/CasetaGri";
import CutieCta880 from "@/components/primitive/CutieCta880";
import EroulInterior from "@/components/primitive/EroulInterior";
import { metadataPagina } from "@/components/seo/metadata";
import { CALE_COMPARATIE_STOCARE, COMPARATIE_STOCARE } from "@/content/comparatii";

export const metadata = metadataPagina({ ...COMPARATIE_STOCARE.meta, cale: CALE_COMPARATIE_STOCARE });

export default function PaginaComparatieStocare() {
  const c = COMPARATIE_STOCARE;
  // Rezervele din cardurile tertilor, cu sursele lor, in aceeasi caseta pliata cu marcajele.
  const surseCarduri = c.carduri
    .filter((k) => !k.noi)
    .map((k) => ({ titlu: "Cardul „" + k.titlu + "”: rezervele de mai sus", surse: k.surse }));
  return (
    <main>
      <EroulInterior fir={c.fir} titlu={c.erou.titlu} subtitlu={c.erou.subtitlu} />

      <section className={s.sectiuneLipita}>
        <div className="container-site">
          <div className={s.lat}>
            <CarduriVariante carduri={c.carduri} />
          </div>
        </div>
      </section>

      <section className="sectiune-bloc" aria-labelledby="tabel-titlu">
        <div className="container-site">
          <div className={s.bloc}>
            <CapBloc id="tabel-titlu" titlu={c.tabel.titlu} margineJos={0} />
            <TabelMarcaje tabel={c.tabel} surseSuplimentare={surseCarduri} />
          </div>
        </div>
      </section>

      <section className={s.sectiuneBlocFix}>
        <div className="container-site">
          <div className={s.bloc}>
            <DiagramaComutator date={c.comutator} />
          </div>
        </div>
      </section>

      <section className="sectiune-bloc" aria-labelledby="caseta-titlu">
        <div className="container-site">
          <div className={s.bloc}>
            <CasetaGri>
              <h2 id="caseta-titlu" className={"t-h2-bloc " + s.casetaTitlu}>
                {c.caseta.titlu}
              </h2>
              <p className={s.casetaText}>{c.caseta.text}</p>
            </CasetaGri>
          </div>
        </div>
      </section>

      <CutieCta880 titlu={c.cta.titlu} text={c.cta.text} buton={c.cta.buton} />
    </main>
  );
}
