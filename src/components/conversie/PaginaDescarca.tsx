// Corpul paginii /descarca (descarca.md; COMPONENTE §4.11), componenta de SERVER: eroul interior pe
// blocul de 880, apoi sectiunea platformelor (cardul recomandat si grila, insula de browser), nota si
// banda cu contul gratuit, pe toata latimea containerului (1152 la 1440, ca la referinta).
//
// Grupurile sunt ale panoului Descarca din antet (`PANOU_DESCARCA`, contractul de navigatie), filtrate
// pe rutele existente: pagina si panoul arata aceleasi platforme, din acelasi loc.

import Buton from "@/components/primitive/Buton";
import EroulInterior from "@/components/primitive/EroulInterior";
import { grupuriVizibile } from "@/components/global/descarcare";
import { CAI_EXISTENTE } from "@/content/cai";
import { CALE_DESCARCA, CALE_INREGISTRARE, DESCARCA } from "@/content/conversie";
import PlatformeDescarca from "./PlatformeDescarca";
import s from "./descarca.module.css";

export default function PaginaDescarca() {
  const d = DESCARCA;
  return (
    <>
      <EroulInterior
        fir={[
          { text: d.fir.acasa, cale: "/" },
          { text: d.fir.pagina, cale: CALE_DESCARCA },
        ]}
        titlu={d.erou.titlu}
        subtitlu={d.erou.subtitlu}
      />
      <section className={s.sectiune} aria-labelledby="descarca-platforme">
        <div className="container-site">
          <PlatformeDescarca grupuri={grupuriVizibile(CAI_EXISTENTE)} />
          <p className={s.nota}>{d.nota}</p>
          <div className={s.banda}>
            <p className={s.bandaTitlu}>{d.banda.titlu}</p>
            <Buton
              varianta="plin"
              className={s.bandaButon}
              legatura={{ text: d.banda.buton, href: CALE_INREGISTRARE, ruta: CALE_INREGISTRARE }}
            >
              {d.banda.buton}
            </Buton>
          </div>
        </div>
      </section>
    </>
  );
}
