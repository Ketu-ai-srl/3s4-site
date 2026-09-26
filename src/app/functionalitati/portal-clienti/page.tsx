// /functionalitati/portal-clienti - pagina cinema a portalului pentru clienti (fisa
// functionalitati__portal-clienti.md: cea mai lunga din grup, 10 sectiuni; problema pe trei sectiuni,
// solutia pe doua, contrastul cu machete). Cadrul e al feliei `cinema-1` (`src/components/cinema/`),
// machetele unice in `src/components/functionalitati/portal-clienti/`, textele in
// `src/content/functionalitati/portal-clienti.ts`.
//
// Abaterea de structura: la referinta titlul CTA-ului e al doilea h1 al paginii; aici e h2, cu forma
// titlului mare. O pagina, un h1: cel din erou.

import Anxietate from "@/components/cinema/Anxietate";
import ContrastInainteAcum from "@/components/cinema/ContrastInainteAcum";
import CtaCinema from "@/components/cinema/CtaCinema";
import EroulCinema, { EtichetaErou, IndiciuDerulare, SubtitluErou, TerminalErou, TitluErou } from "@/components/cinema/EroulCinema";
import InvelisCinema from "@/components/cinema/InvelisCinema";
import Pivot from "@/components/cinema/Pivot";
import Arbore from "@/components/functionalitati/portal-clienti/Arbore";
import CameraPortal from "@/components/functionalitati/portal-clienti/CameraPortal";
import Etichete from "@/components/functionalitati/portal-clienti/Etichete";
import Jurnal from "@/components/functionalitati/portal-clienti/Jurnal";
import { InboxMini, PortalMini } from "@/components/functionalitati/portal-clienti/MacheteContrast";
import { Fantome, Praf } from "@/components/functionalitati/portal-clienti/PrafSiFantome";
import Recunoastere from "@/components/functionalitati/portal-clienti/Recunoastere";
import TemaPagina from "@/components/global/TemaPagina";
import DateFirAriadnei from "@/components/seo/DateFirAriadnei";
import { metadataPagina } from "@/components/seo/metadata";
import {
  ANXIETATE_PORTAL,
  CALE_PORTAL_CLIENTI,
  CONTRAST_PORTAL,
  CTA_PORTAL,
  EROU_PORTAL,
  FIR_PORTAL_CLIENTI,
  META_PORTAL_CLIENTI,
  PIVOT_PORTAL,
} from "@/content/functionalitati/portal-clienti";

export const metadata = metadataPagina({
  titlu: META_PORTAL_CLIENTI.titlu,
  descriere: META_PORTAL_CLIENTI.descriere,
  cale: CALE_PORTAL_CLIENTI,
});

export default function PaginaPortalClienti() {
  const c = CONTRAST_PORTAL;
  return (
    <InvelisCinema pagina="portal-clienti">
      <TemaPagina tema="inchisa" />
      <DateFirAriadnei niveluri={[...FIR_PORTAL_CLIENTI]} />

      <EroulCinema forma="persoane" samanta={31}>
        <EtichetaErou>{EROU_PORTAL.eticheta}</EtichetaErou>
        <TitluErou>{EROU_PORTAL.titlu}</TitluErou>
        <TerminalErou text={EROU_PORTAL.cerere} />
        <SubtitluErou varianta="italic" dupaScriere>
          {EROU_PORTAL.subtitlu}
        </SubtitluErou>
        <IndiciuDerulare text={EROU_PORTAL.indiciu} spatiere="stransa" />
      </EroulCinema>

      <Arbore />
      <Recunoastere />
      <Etichete />
      <Anxietate
        varianta="portal"
        inaltime={95}
        latime={580}
        randuri={ANXIETATE_PORTAL.randuri}
        emfaza={ANXIETATE_PORTAL.emfaza}
        straturi={<Praf />}
        fantome={<Fantome />}
        latimeFantome={920}
      />
      <Pivot varianta="portal" inaltime={80} deschidere={PIVOT_PORTAL.intrebare} emfaza={PIVOT_PORTAL.emfaza} linie={PIVOT_PORTAL.linie} />
      <CameraPortal />
      <Jurnal />

      <ContrastInainteAcum
        titlu={c.titlu}
        varianta="machete"
        inaltime={90}
        inainte={{ titlu: c.inainte.titlu, subtitlu: c.inainte.subtitlu, vizual: <InboxMini />, metrici: c.inainte.metrici }}
        acum={{ titlu: c.acum.titlu, subtitlu: c.acum.subtitlu, vizual: <PortalMini />, metrici: c.acum.metrici }}
      />

      <CtaCinema titlu={CTA_PORTAL.titlu} paragraf={CTA_PORTAL.paragraf} buton={CTA_PORTAL.buton} nota={CTA_PORTAL.nota} />
    </InvelisCinema>
  );
}
