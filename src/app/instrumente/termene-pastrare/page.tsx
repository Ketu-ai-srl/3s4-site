// /instrumente/termene-pastrare (instrumente__termene-pastrare.md): verificatorul de termene de
// pastrare. Eroul cu gradient, selectorul de tara, panoul tarii alese (toate panourile sunt in
// HTML), iesirile si CTA-ul final comun. Tarile si termenele sunt in `src/content/termene/`.

import CtaFinalInchis from "@/components/primitive/CtaFinalInchis";
import { metadataPagina } from "@/components/seo/metadata";
import EroulInstrument from "@/components/termene/EroulInstrument";
import IesiriTermene from "@/components/termene/IesiriTermene";
import PanouTara from "@/components/termene/PanouTara";
import SelectorTari from "@/components/termene/SelectorTari";
import s from "@/components/termene/termene.module.css";
import { CALE_TERMENE, INSTRUMENT, META_TERMENE, TARI } from "@/content/termene/date";

export const metadata = metadataPagina({ ...META_TERMENE, cale: CALE_TERMENE });

export default function PaginaTermenePastrare() {
  return (
    <main>
      <EroulInstrument />
      <section className={s.instrument} aria-label={INSTRUMENT.etichetaSectiune}>
        <div className="container-site">
          <SelectorTari tari={TARI.map((t) => ({ cod: t.cod, nume: t.nume }))} eticheta={INSTRUMENT.etichetaSelector}>
            {TARI.map((t) => (
              <PanouTara key={t.cod} tara={t} />
            ))}
          </SelectorTari>
          <IesiriTermene />
        </div>
      </section>
      <CtaFinalInchis />
    </main>
  );
}
