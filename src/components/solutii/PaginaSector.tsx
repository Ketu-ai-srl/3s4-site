// Sablonul paginii de sector (solutii__sablon.md), aceeasi gramatica pe toate 7 sectoarele:
//
//   S1  eroul de sector (fir pe 3 niveluri, h1, subtitlu, 2 butoane, nota)      - EroulInterior
//   S2  trei momente pe o sina verticala, cu cipul documentului                  - SinaMomente
//   S3  banda „ce se schimba”, cu scena 3D a hartiilor                           - BandaSchimbare
//   S3b (numai contabilitatea) consola cu toti clientii                          - ConsolaClienti
//   S4  3 pasi + cautarea „in direct”                                            - PasiTrei
//   S5  inainte / dupa                                                           - InainteDupa
//   S6  4 intrebari (2 ale sectorului, 2 comune), acordeonul `sector`            - IntrebariSolutii
//   S7  CTA-ul final inchis (comun)                                              - CtaFinalInchis
//
// Toata pagina e randata pe server; piesele client sunt doar scena, cautarea si acordeonul, iar
// fiecare are in HTML-ul servit starea ei statica.

import Buton from "@/components/primitive/Buton";
import CtaFinalInchis from "@/components/primitive/CtaFinalInchis";
import EroulInterior from "@/components/primitive/EroulInterior";
import { SECTOR_COMUN } from "@/content/solutii/comun";
import type { Sector } from "@/content/solutii/tipuri";
import BandaSchimbare from "./BandaSchimbare";
import ConsolaClienti from "./ConsolaClienti";
import InainteDupa from "./InainteDupa";
import IntrebariSolutii from "./IntrebariSolutii";
import PasiTrei from "./PasiTrei";
import SinaMomente from "./SinaMomente";

export default function PaginaSector({ sector }: { sector: Sector }) {
  const c = SECTOR_COMUN;
  const intrebari = [...sector.intrebari, ...c.intrebariComune];
  return (
    <main data-pagina-sector={sector.cale}>
      <EroulInterior
        varianta="sector"
        fir={[
          { text: "Acasă", cale: "/" },
          { text: c.firSolutii.text, cale: c.firSolutii.cale },
          { text: sector.nume, cale: sector.cale },
        ]}
        titlu={sector.erou.titlu}
        subtitlu={sector.erou.subtitlu}
        actiuni={
          <>
            <Buton varianta="plin" marime="plat" legatura={c.butonPrincipal}>
              {c.butonPrincipal.text}
            </Buton>
            <Buton varianta="fantoma-sector" marime="plat" legatura={c.butonSecundar}>
              {c.butonSecundar.text}
            </Buton>
          </>
        }
        nota={c.nota}
      />
      <SinaMomente titlu={c.titluMomente} subtitlu={sector.momente.subtitlu} momente={sector.momente.lista} />
      <BandaSchimbare sector={sector} />
      {sector.consola ? <ConsolaClienti consola={sector.consola} /> : null}
      <PasiTrei titlu={c.titluPasi} pasi={sector.pasi.lista} etichetaDemo={c.etichetaDemo} demo={sector.pasi.demo} />
      <InainteDupa
        titlu={c.titluInainteDupa}
        etichete={{ inainte: c.etichetaInainte, dupa: c.etichetaDupa }}
        inainte={sector.inainteDupa.inainte}
        dupa={sector.inainteDupa.dupa}
      />
      <IntrebariSolutii
        titlu={c.titluIntrebari}
        intrebari={intrebari}
        cale={sector.cale}
        numeDate={c.titluIntrebari + ": " + sector.nume}
      />
      <CtaFinalInchis />
    </main>
  );
}
