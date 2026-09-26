// /functionalitati/cautare-ai - pagina cinema a cautarii AI (fisa functionalitati__cautare-ai.md, cea
// mai lunga varianta a sablonului: 9 sectiuni). Cadrul e al feliei `cinema-1` (`src/components/cinema/`),
// machetele unice in `src/components/functionalitati/cautare-ai/`, textele in
// `src/content/functionalitati/cautare-ai.ts`.
//
// Abaterea de structura: la referinta eroul nu are h1 (singurul h1 e in CTA); aici eticheta eroului e
// h1, cu forma ei vizuala, iar titlul CTA-ului e h2 cu forma titlului mare. O pagina, un h1.

import ContrastInainteAcum from "@/components/cinema/ContrastInainteAcum";
import CtaCinema from "@/components/cinema/CtaCinema";
import EroulCinema, { EtichetaErou, IndiciuDerulare, SubtitluErou, TerminalErou } from "@/components/cinema/EroulCinema";
import InvelisCinema from "@/components/cinema/InvelisCinema";
import Pivot from "@/components/cinema/Pivot";
import Avalansa from "@/components/functionalitati/cautare-ai/Avalansa";
import { DesenAcum, DesenInainte } from "@/components/functionalitati/cautare-ai/DeseneContrast";
import Extragere from "@/components/functionalitati/cautare-ai/Extragere";
import Frustrare from "@/components/functionalitati/cautare-ai/Frustrare";
import Lumina from "@/components/functionalitati/cautare-ai/Lumina";
import Recunoastere from "@/components/functionalitati/cautare-ai/Recunoastere";
import TemaPagina from "@/components/global/TemaPagina";
import DateFirAriadnei from "@/components/seo/DateFirAriadnei";
import { metadataPagina } from "@/components/seo/metadata";
import {
  CALE_CAUTARE_AI,
  CONTRAST_CAUTARE,
  CTA_CAUTARE,
  EROU_CAUTARE,
  FIR_CAUTARE_AI,
  META_CAUTARE_AI,
  SOAPTA,
} from "@/content/functionalitati/cautare-ai";

export const metadata = metadataPagina({
  titlu: META_CAUTARE_AI.titlu,
  descriere: META_CAUTARE_AI.descriere,
  cale: CALE_CAUTARE_AI,
});

export default function PaginaCautareAi() {
  const c = CONTRAST_CAUTARE;
  return (
    <InvelisCinema pagina="cautare-ai">
      <TemaPagina tema="inchisa" />
      <DateFirAriadnei niveluri={[...FIR_CAUTARE_AI]} />

      <EroulCinema forma="lupa" samanta={11}>
        <EtichetaErou titlu>{EROU_CAUTARE.eticheta}</EtichetaErou>
        <TerminalErou text={EROU_CAUTARE.intrebare} pas={35} latime={660} marime="mare" />
        <SubtitluErou varianta="rand-1" dupaScriere>
          {EROU_CAUTARE.rand1}
        </SubtitluErou>
        <SubtitluErou varianta="rand-2" dupaScriere intarziere={0.4}>
          {EROU_CAUTARE.rand2}
        </SubtitluErou>
        <IndiciuDerulare text={EROU_CAUTARE.indiciu} />
      </EroulCinema>

      <Avalansa />
      <Recunoastere />
      <Frustrare />
      <Pivot varianta="cautare" inaltime={70} deschidere={SOAPTA.intrebare} emfaza={SOAPTA.emfaza} linie={SOAPTA.linie} />
      <Lumina />
      <Extragere />

      <ContrastInainteAcum
        titlu={c.titlu}
        paragraf={c.paragraf}
        latimeParagraf={null}
        fundal="plin"
        inainte={{ titlu: c.inainte.titlu, subtitlu: c.inainte.subtitlu, vizual: <DesenInainte />, metrici: c.inainte.metrici }}
        acum={{ titlu: c.acum.titlu, subtitlu: c.acum.subtitlu, vizual: <DesenAcum />, metrici: c.acum.metrici }}
        punte={{ eticheta: c.punte, mono: true }}
      />

      <CtaCinema
        titlu={CTA_CAUTARE.titlu}
        paragraf={CTA_CAUTARE.paragraf}
        buton={CTA_CAUTARE.buton}
        nota={CTA_CAUTARE.nota}
        titluMobil="mare"
        latimeParagraf={null}
      />
    </InvelisCinema>
  );
}
