// /functionalitati/automatizari-ai - pagina cinema a regulilor automate (fisa
// functionalitati__automatizari-ai.md: 8 sectiuni, cea mai mare abatere de la ordinea canonica - eroul
// fara terminal, problema pe doua sectiuni, fara "anxietate"). Cadrul e al feliei `cinema-1`
// (`src/components/cinema/`), machetele unice in `src/components/functionalitati/automatizari-ai/`,
// textele in `src/content/functionalitati/automatizari-ai.ts`.
//
// Abaterea de structura: la referinta titlul CTA-ului e al doilea h1 al paginii; aici e h2, cu forma
// titlului mare. O pagina, un h1: cel din erou.

import ContrastInainteAcum from "@/components/cinema/ContrastInainteAcum";
import CtaCinema from "@/components/cinema/CtaCinema";
import EroulCinema, { EtichetaErou, IndiciuDerulare, SubtitluErou, SubtitluScris, TitluErou } from "@/components/cinema/EroulCinema";
import InvelisCinema from "@/components/cinema/InvelisCinema";
import Pivot from "@/components/cinema/Pivot";
import Asteptare from "@/components/functionalitati/automatizari-ai/Asteptare";
import Cronologie from "@/components/functionalitati/automatizari-ai/Cronologie";
import { SaptamanaAcum, SaptamanaInainte } from "@/components/functionalitati/automatizari-ai/DeseneSaptamana";
import Flux from "@/components/functionalitati/automatizari-ai/Flux";
import Gol from "@/components/functionalitati/automatizari-ai/Gol";
import Regula from "@/components/functionalitati/automatizari-ai/Regula";
import TemaPagina from "@/components/global/TemaPagina";
import DateFirAriadnei from "@/components/seo/DateFirAriadnei";
import { metadataPagina } from "@/components/seo/metadata";
import {
  CALE_AUTOMATIZARI_AI,
  CTA_AUTOMATIZARI,
  EROU_AUTOMATIZARI,
  FIR_AUTOMATIZARI_AI,
  INTREBARE_AUTOMATIZARI,
  META_AUTOMATIZARI_AI,
  SAPTAMANA,
} from "@/content/functionalitati/automatizari-ai";

export const metadata = metadataPagina({
  titlu: META_AUTOMATIZARI_AI.titlu,
  descriere: META_AUTOMATIZARI_AI.descriere,
  cale: CALE_AUTOMATIZARI_AI,
});

export default function PaginaAutomatizariAi() {
  const w = SAPTAMANA;
  return (
    <InvelisCinema pagina="automatizari-ai">
      <TemaPagina tema="inchisa" />
      <DateFirAriadnei niveluri={[...FIR_AUTOMATIZARI_AI]} />

      <EroulCinema forma="fulger" samanta={23}>
        <EtichetaErou>{EROU_AUTOMATIZARI.eticheta}</EtichetaErou>
        <TitluErou spatiere="stransa">{EROU_AUTOMATIZARI.titlu}</TitluErou>
        <SubtitluScris text={EROU_AUTOMATIZARI.subtitlu} pas={35} />
        <Gol />
        <SubtitluErou varianta="liniste" dupaScriere intarziere={1.5} durata={0.8}>
          {EROU_AUTOMATIZARI.liniste}
        </SubtitluErou>
        <IndiciuDerulare />
      </EroulCinema>

      <Asteptare />
      <Cronologie />
      <Pivot
        varianta="automatizari"
        inaltime={80}
        latime={680}
        deschidere={INTREBARE_AUTOMATIZARI.intrebare}
        emfaza={INTREBARE_AUTOMATIZARI.emfaza}
        linie={INTREBARE_AUTOMATIZARI.linie}
      />
      <Flux />
      <Regula />

      <ContrastInainteAcum
        titlu={w.titlu}
        paragraf={w.paragraf}
        latimeParagraf={540}
        fundal="stins"
        pastile="neutre"
        marimeCheie={8.8}
        inainte={{ titlu: w.inainte.titlu, subtitlu: w.inainte.subtitlu, vizual: <SaptamanaInainte />, metrici: w.inainte.metrici }}
        acum={{ titlu: w.acum.titlu, subtitlu: w.acum.subtitlu, vizual: <SaptamanaAcum />, metrici: w.acum.metrici }}
        punte={{ eticheta: w.punte }}
      />

      <CtaCinema
        titlu={CTA_AUTOMATIZARI.titlu}
        paragraf={CTA_AUTOMATIZARI.paragraf}
        buton={CTA_AUTOMATIZARI.buton}
        nota={CTA_AUTOMATIZARI.nota}
        spatiereTitlu="stransa"
        latimeParagraf={540}
      />
    </InvelisCinema>
  );
}
