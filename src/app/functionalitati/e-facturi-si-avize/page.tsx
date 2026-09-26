// /functionalitati/e-facturi-si-avize - pagina cinema a facturilor facute din aviz (fisa
// functionalitati__e-facturi-si-avize.md: 7 sectiuni, ordinea canonica completa). Cadrul e al feliei
// `cinema-1` (`src/components/cinema/`), machetele unice in `src/components/functionalitati/e-facturi-si-avize/`,
// textele in `src/content/functionalitati/e-facturi-si-avize.ts`.
//
// Abaterea de structura, ca pe toate paginile cinema: titlul CTA-ului e h2 cu forma titlului mare, deci
// pagina are un singur h1, cel din erou.

import Anxietate from "@/components/cinema/Anxietate";
import ContrastInainteAcum from "@/components/cinema/ContrastInainteAcum";
import CtaCinema from "@/components/cinema/CtaCinema";
import EroulCinema, { EtichetaErou, IndiciuDerulare, SubtitluErou, TerminalErou, TitluErou } from "@/components/cinema/EroulCinema";
import InvelisCinema from "@/components/cinema/InvelisCinema";
import Pivot from "@/components/cinema/Pivot";
import { DesenAcum, DesenInainte } from "@/components/functionalitati/e-facturi-si-avize/DeseneContrast";
import Generator from "@/components/functionalitati/e-facturi-si-avize/Generator";
import HartaUnelte from "@/components/functionalitati/e-facturi-si-avize/HartaUnelte";
import TemaPagina from "@/components/global/TemaPagina";
import DateFirAriadnei from "@/components/seo/DateFirAriadnei";
import { metadataPagina } from "@/components/seo/metadata";
import {
  ANXIETATE_E_FACTURI,
  CALE_E_FACTURI,
  CONTRAST_E_FACTURI,
  CTA_E_FACTURI,
  EROU_E_FACTURI,
  FIR_E_FACTURI,
  META_E_FACTURI,
  PIVOT_E_FACTURI,
} from "@/content/functionalitati/e-facturi-si-avize";

export const metadata = metadataPagina({
  titlu: META_E_FACTURI.titlu,
  descriere: META_E_FACTURI.descriere,
  cale: CALE_E_FACTURI,
});

export default function PaginaEFacturi() {
  const c = CONTRAST_E_FACTURI;
  return (
    <InvelisCinema pagina="e-facturi-si-avize">
      <TemaPagina tema="inchisa" />
      <DateFirAriadnei niveluri={[...FIR_E_FACTURI]} />

      <EroulCinema forma="document" samanta={61}>
        <EtichetaErou>{EROU_E_FACTURI.eticheta}</EtichetaErou>
        <TitluErou>{EROU_E_FACTURI.titlu}</TitluErou>
        <TerminalErou text={EROU_E_FACTURI.cerere} />
        <SubtitluErou varianta="italic" dupaScriere>
          {EROU_E_FACTURI.subtitlu}
        </SubtitluErou>
        <IndiciuDerulare text={EROU_E_FACTURI.indiciu} />
      </EroulCinema>

      <HartaUnelte />
      <Anxietate randuri={ANXIETATE_E_FACTURI.randuri} emfaza={ANXIETATE_E_FACTURI.emfaza} />
      <Pivot deschidere={PIVOT_E_FACTURI.intrebare} emfaza={PIVOT_E_FACTURI.emfaza} linie={PIVOT_E_FACTURI.linie} />
      <Generator />

      <ContrastInainteAcum
        titlu={c.titlu}
        paragraf={c.paragraf}
        inainte={{ titlu: c.inainte.titlu, subtitlu: c.inainte.subtitlu, vizual: <DesenInainte />, metrici: c.inainte.metrici }}
        acum={{ titlu: c.acum.titlu, subtitlu: c.acum.subtitlu, vizual: <DesenAcum />, metrici: c.acum.metrici }}
        punte={{ eticheta: c.punte, mono: true }}
        marimeCheie={9.92}
      />

      <CtaCinema titlu={CTA_E_FACTURI.titlu} paragraf={CTA_E_FACTURI.paragraf} buton={CTA_E_FACTURI.buton} nota={CTA_E_FACTURI.nota} />
    </InvelisCinema>
  );
}
