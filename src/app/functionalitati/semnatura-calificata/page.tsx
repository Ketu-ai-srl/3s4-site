// /functionalitati/semnatura-calificata - pagina cinema a semnaturii electronice calificate (fisa
// functionalitati__semnatura-calificata.md: 9 sectiuni, solutia pe trei - sigiliul, lotul, termenele).
//
// SEMNATURA CALIFICATA NU E DISPONIBILA AZI IN 3S (decizia D4c): pagina are forma referintei, dar textul
// spune "integrare in curs cu furnizorii acreditati" oriunde referinta promite semnarea, iar machetele sunt
// previzualizari declarate. Textele: `src/content/functionalitati/semnatura-calificata.ts`.
//
// Abaterea de structura, ca pe toate paginile cinema: titlul CTA-ului e h2 (o pagina, un h1).

import Anxietate from "@/components/cinema/Anxietate";
import ContrastInainteAcum from "@/components/cinema/ContrastInainteAcum";
import CtaCinema from "@/components/cinema/CtaCinema";
import EroulCinema, { EtichetaErou, IndiciuDerulare, SubtitluErou, TerminalErou, TitluErou } from "@/components/cinema/EroulCinema";
import InvelisCinema from "@/components/cinema/InvelisCinema";
import Pivot from "@/components/cinema/Pivot";
import { DesenAcum, DesenInainte } from "@/components/functionalitati/semnatura-calificata/DeseneContrast";
import Drum from "@/components/functionalitati/semnatura-calificata/Drum";
import Lot from "@/components/functionalitati/semnatura-calificata/Lot";
import Sigiliu from "@/components/functionalitati/semnatura-calificata/Sigiliu";
import Termene from "@/components/functionalitati/semnatura-calificata/Termene";
import TemaPagina from "@/components/global/TemaPagina";
import DateFirAriadnei from "@/components/seo/DateFirAriadnei";
import { metadataPagina } from "@/components/seo/metadata";
import {
  ANXIETATE_SEMNATURA,
  CALE_SEMNATURA,
  CONTRAST_SEMNATURA,
  CTA_SEMNATURA,
  EROU_SEMNATURA,
  FIR_SEMNATURA,
  META_SEMNATURA,
  PIVOT_SEMNATURA,
} from "@/content/functionalitati/semnatura-calificata";

export const metadata = metadataPagina({
  titlu: META_SEMNATURA.titlu,
  descriere: META_SEMNATURA.descriere,
  cale: CALE_SEMNATURA,
});

export default function PaginaSemnatura() {
  const c = CONTRAST_SEMNATURA;
  return (
    <InvelisCinema pagina="semnatura-calificata">
      <TemaPagina tema="inchisa" />
      <DateFirAriadnei niveluri={[...FIR_SEMNATURA]} />

      <EroulCinema forma="semnatura" samanta={47}>
        <EtichetaErou>{EROU_SEMNATURA.eticheta}</EtichetaErou>
        <TitluErou>{EROU_SEMNATURA.titlu}</TitluErou>
        <TerminalErou text={EROU_SEMNATURA.cerere} />
        <SubtitluErou varianta="italic" dupaScriere>
          {EROU_SEMNATURA.subtitlu}
        </SubtitluErou>
        <IndiciuDerulare text={EROU_SEMNATURA.indiciu} spatiere="stransa" />
      </EroulCinema>

      <Drum />
      <Anxietate randuri={ANXIETATE_SEMNATURA.randuri} emfaza={ANXIETATE_SEMNATURA.emfaza} />
      <Pivot deschidere={PIVOT_SEMNATURA.intrebare} emfaza={PIVOT_SEMNATURA.emfaza} linie={PIVOT_SEMNATURA.linie} />
      <Sigiliu />
      <Lot />
      <Termene />

      <ContrastInainteAcum
        titlu={c.titlu}
        paragraf={c.paragraf}
        inainte={{ titlu: c.inainte.titlu, subtitlu: c.inainte.subtitlu, vizual: <DesenInainte />, metrici: c.inainte.metrici }}
        acum={{ titlu: c.acum.titlu, subtitlu: c.acum.subtitlu, vizual: <DesenAcum />, metrici: c.acum.metrici }}
        punte={{ eticheta: c.punte }}
      />

      <CtaCinema titlu={CTA_SEMNATURA.titlu} paragraf={CTA_SEMNATURA.paragraf} buton={CTA_SEMNATURA.buton} nota={CTA_SEMNATURA.nota} />
    </InvelisCinema>
  );
}
