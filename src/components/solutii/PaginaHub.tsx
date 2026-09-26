// Hub-ul solutiilor, `/solutii` (solutii.md), in ordinea masurata:
//
//   S1  eroul de sector cu rand de dovada (fir pe 2 niveluri, fara nota)        - EroulInterior `hub`
//   S2  banda „principale”: 2 carduri mari                                      - CarduriHub
//   S3  cautarea cu 4 file (ciclu de 6,5 s, oprit in afara ferestrei)           - DemoCautareFile
//   S4  banda „alte domenii”: 4 carduri mici                                    - CarduriHub
//   S5  banda a treia: 1 card, pe o coloana de 540                              - CarduriHub
//   S6  caseta de conformitate, numai fapte confirmate                          - CasetaConformitate
//   S7  7 intrebari, acordeonul `sector`                                        - IntrebariSolutii
//   S8  CTA-ul final inchis (comun)                                             - CtaFinalInchis

import Buton from "@/components/primitive/Buton";
import CapBloc from "@/components/primitive/CapBloc";
import CtaFinalInchis from "@/components/primitive/CtaFinalInchis";
import EroulInterior from "@/components/primitive/EroulInterior";
import { HUB } from "@/content/solutii/hub";
import CarduriHub from "./CarduriHub";
import CasetaConformitate from "./CasetaConformitate";
import DemoCautareFile from "./DemoCautareFile";
import IntrebariSolutii from "./IntrebariSolutii";
import s from "./hub.module.css";

export default function PaginaHub() {
  const h = HUB;
  const [principale, alte, transport] = h.benzi;
  return (
    <main data-pagina-hub="">
      <EroulInterior
        varianta="hub"
        fir={[
          { text: "Acasă", cale: "/" },
          { text: h.nume, cale: h.cale },
        ]}
        titlu={h.erou.titlu}
        subtitlu={h.erou.subtitlu}
        dovada={h.erou.dovada}
        actiuni={
          <>
            <Buton varianta="plin" marime="plat" legatura={h.erou.butonPrincipal}>
              {h.erou.butonPrincipal.text}
            </Buton>
            <Buton varianta="fantoma-sector" marime="plat" legatura={h.erou.butonSecundar}>
              {h.erou.butonSecundar.text}
            </Buton>
          </>
        }
      />
      <CarduriHub titlu={principale.titlu} elemente={principale.elemente} marime="mare" legatura={h.legaturaCard} prima />
      <section className={s.banda}>
        <div className="container-site">
          <div className={s.coloana}>
            <CapBloc titlu={h.cautare.titlu} text={h.cautare.subtitlu} marimeText={16} margineJos={20} />
            <DemoCautareFile eticheta={h.cautare.etichetaFile} file={h.cautare.file} />
          </div>
        </div>
      </section>
      <CarduriHub titlu={alte.titlu} elemente={alte.elemente} marime="mic" legatura={h.legaturaCard} />
      <CarduriHub titlu={transport.titlu} elemente={transport.elemente} marime="una" legatura={h.legaturaCard} />
      <CasetaConformitate eticheta={h.conformitate.eticheta} insigne={h.conformitate.insigne} />
      <IntrebariSolutii
        titlu={h.intrebari.titlu}
        intrebari={h.intrebari.lista}
        cale={h.cale}
        numeDate={h.intrebari.titlu + ": soluții pe domenii"}
      />
      <CtaFinalInchis />
    </main>
  );
}
