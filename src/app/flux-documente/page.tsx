// /flux-documente (flux-documente.md): eroul pe blocul de 880, scena lipita "azi pe mana / cu 3S",
// banda hub-ului, selectorul de domenii cu 7 machete, nota si cutia CTA de 880. Fara CTA-ul final
// comun (masurat: pagina nu il are).
//
// Textele si datele fictive ale machetelor: `src/content/flux.ts`.

import BandaHub from "@/components/flux/BandaHub";
import Domenii from "@/components/flux/Domenii";
import ScenaFluxLipita from "@/components/flux/ScenaFluxLipita";
import s from "@/components/flux/flux.module.css";
import CutieCta880 from "@/components/primitive/CutieCta880";
import EroulInterior from "@/components/primitive/EroulInterior";
import { metadataPagina } from "@/components/seo/metadata";
import { CALE_FLUX, CUTIE_CTA_FLUX, DOMENII_CAP, EROU_FLUX, FIR_FLUX, META_FLUX } from "@/content/flux";

export const metadata = metadataPagina({ titlu: META_FLUX.titlu, descriere: META_FLUX.descriere, cale: CALE_FLUX });

export default function FluxDocumente() {
  return (
    <main>
      <EroulInterior fir={FIR_FLUX} titlu={EROU_FLUX.titlu} subtitlu={EROU_FLUX.subtitlu} idTitlu="flux-titlu" />

      <ScenaFluxLipita />

      <BandaHub />

      <section className={s.domeniiIntro} aria-labelledby="flux-domenii-titlu">
        <div className="container-site">
          <header className={s.bloc880}>
            <h2 id="flux-domenii-titlu" className={"t-h2-bloc " + s.capTitlu}>
              {DOMENII_CAP.titlu}
            </h2>
            <p className={s.capText}>{DOMENII_CAP.text}</p>
          </header>
        </div>
        <Domenii />
        <div className="container-site">
          <p className={[s.bloc880, s.notaDomenii].join(" ")}>{DOMENII_CAP.nota}</p>
        </div>
      </section>

      <CutieCta880 titlu={CUTIE_CTA_FLUX.titlu} text={CUTIE_CTA_FLUX.text} buton={CUTIE_CTA_FLUX.buton} />
    </main>
  );
}
