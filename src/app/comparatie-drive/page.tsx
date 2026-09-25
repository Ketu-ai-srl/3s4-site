// /comparatie-drive (comparatie-drive.md): pagina interioara pe blocul de 880. Erou cu fir,
// cardul divizat (ce face bine un drive, ce cere o arhiva), diagrama stocarii, sina de 4 pasi,
// tabelul cu marcaje si cutia CTA de 880. Pagina e statica: nicio animatie, nimic interactiv in
// afara legaturilor si a casetei pliate cu sursele marcajelor.

import CardDivizat from "@/components/comparatii/CardDivizat";
import DiagramaConectori from "@/components/comparatii/DiagramaConectori";
import SinaPasi from "@/components/comparatii/SinaPasi";
import TabelMarcaje from "@/components/comparatii/TabelMarcaje";
import s from "@/components/comparatii/comparatii.module.css";
import CapBloc from "@/components/primitive/CapBloc";
import CutieCta880 from "@/components/primitive/CutieCta880";
import EroulInterior from "@/components/primitive/EroulInterior";
import { metadataPagina } from "@/components/seo/metadata";
import { CALE_COMPARATIE_DRIVE, COMPARATIE_DRIVE } from "@/content/comparatii";

export const metadata = metadataPagina({ ...COMPARATIE_DRIVE.meta, cale: CALE_COMPARATIE_DRIVE });

export default function PaginaComparatieDrive() {
  const c = COMPARATIE_DRIVE;
  return (
    <main>
      <EroulInterior fir={c.fir} titlu={c.erou.titlu} subtitlu={c.erou.subtitlu} />

      <section className={s.sectiuneLipita}>
        <div className="container-site">
          <div className={s.bloc}>
            <CardDivizat stanga={c.divizat.stanga} dreapta={c.divizat.dreapta} />
          </div>
        </div>
      </section>

      <section className="sectiune-bloc" aria-labelledby="stocare-titlu">
        <div className="container-site">
          <div className={s.bloc}>
            <CapBloc id="stocare-titlu" titlu={c.stocare.titlu} text={c.stocare.text} marimeText={16} margineJos={28} />
            <DiagramaConectori optiuni={c.stocare.optiuni} nod={c.stocare.nod} eticheta={c.stocare.eticheta} />
          </div>
        </div>
      </section>

      <section className="sectiune-bloc" aria-labelledby="drum-titlu">
        <div className="container-site">
          <div className={s.bloc}>
            <CapBloc id="drum-titlu" titlu={c.drum.titlu} margineJos={0} />
            <SinaPasi pasi={c.drum.pasi} machete={c.drum.machete} declaratie={c.drum.declaratie} exemplu={c.drum.exemplu} />
          </div>
        </div>
      </section>

      <section className="sectiune-bloc" aria-labelledby="tabel-titlu">
        <div className="container-site">
          <div className={s.bloc}>
            <CapBloc id="tabel-titlu" titlu={c.tabel.titlu} margineJos={0} />
            <TabelMarcaje tabel={c.tabel} />
          </div>
        </div>
      </section>

      <CutieCta880 titlu={c.cta.titlu} text={c.cta.text} buton={c.cta.buton} />
    </main>
  );
}
