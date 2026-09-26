// /functionalitati/aplicatie-mobila - pagina cinema a aplicatiei de telefon (fisa
// functionalitati__aplicatie-mobila.md: 8 sectiuni, solutia pe doua - telefonul si sincronizarea - si
// contrastul cu machete). Cadrul e al feliei `cinema-1`, machetele in
// `src/components/functionalitati/aplicatie-mobila/`, textele in `src/content/functionalitati/aplicatie-mobila.ts`.
//
// Abaterile de structura: titlul CTA-ului e h2 (o pagina, un h1). Terminalul eroului ia latimea fixa a
// cadrului (600), nu latimea titlului (543 la referinta): cadrul are numai 600 / 660.

import Anxietate from "@/components/cinema/Anxietate";
import ContrastInainteAcum from "@/components/cinema/ContrastInainteAcum";
import CtaCinema from "@/components/cinema/CtaCinema";
import EroulCinema, { EtichetaErou, IndiciuDerulare, SubtitluErou, TerminalErou, TitluErou } from "@/components/cinema/EroulCinema";
import InvelisCinema from "@/components/cinema/InvelisCinema";
import Pivot from "@/components/cinema/Pivot";
import { FoaieAviz, TelefonMini } from "@/components/functionalitati/aplicatie-mobila/MacheteContrast";
import Sincronizare from "@/components/functionalitati/aplicatie-mobila/Sincronizare";
import Telefon from "@/components/functionalitati/aplicatie-mobila/Telefon";
import ZiuaTeren from "@/components/functionalitati/aplicatie-mobila/ZiuaTeren";
import TemaPagina from "@/components/global/TemaPagina";
import DateFirAriadnei from "@/components/seo/DateFirAriadnei";
import { metadataPagina } from "@/components/seo/metadata";
import {
  ANXIETATE_MOBILA,
  CALE_APLICATIE_MOBILA,
  CONTRAST_MOBILA,
  CTA_MOBILA,
  EROU_MOBILA,
  FIR_APLICATIE_MOBILA,
  META_APLICATIE_MOBILA,
  PIVOT_MOBILA,
} from "@/content/functionalitati/aplicatie-mobila";

export const metadata = metadataPagina({
  titlu: META_APLICATIE_MOBILA.titlu,
  descriere: META_APLICATIE_MOBILA.descriere,
  cale: CALE_APLICATIE_MOBILA,
});

export default function PaginaAplicatieMobila() {
  const c = CONTRAST_MOBILA;
  return (
    <InvelisCinema pagina="aplicatie-mobila">
      <TemaPagina tema="inchisa" />
      <DateFirAriadnei niveluri={[...FIR_APLICATIE_MOBILA]} />

      <EroulCinema forma="telefon" samanta={53}>
        <EtichetaErou>{EROU_MOBILA.eticheta}</EtichetaErou>
        <TitluErou>{EROU_MOBILA.titlu}</TitluErou>
        <TerminalErou text={EROU_MOBILA.cerere} />
        <SubtitluErou varianta="italic" dupaScriere>
          {EROU_MOBILA.subtitlu}
        </SubtitluErou>
        <IndiciuDerulare text={EROU_MOBILA.indiciu} />
      </EroulCinema>

      <ZiuaTeren />
      <Anxietate randuri={ANXIETATE_MOBILA.randuri} emfaza={ANXIETATE_MOBILA.emfaza} />
      <Pivot deschidere={PIVOT_MOBILA.intrebare} emfaza={PIVOT_MOBILA.emfaza} linie={PIVOT_MOBILA.linie} />
      <Telefon />
      <Sincronizare />

      <ContrastInainteAcum
        titlu={c.titlu}
        varianta="machete"
        inaltime={90}
        inainte={{ titlu: c.inainte.titlu, subtitlu: c.inainte.subtitlu, vizual: <FoaieAviz />, metrici: c.inainte.metrici }}
        acum={{ titlu: c.acum.titlu, subtitlu: c.acum.subtitlu, vizual: <TelefonMini />, metrici: c.acum.metrici }}
      />

      <CtaCinema titlu={CTA_MOBILA.titlu} paragraf={CTA_MOBILA.paragraf} buton={CTA_MOBILA.buton} nota={CTA_MOBILA.nota} />
    </InvelisCinema>
  );
}
