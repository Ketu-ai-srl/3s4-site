import EroulInterior from "@/components/primitive/EroulInterior";
import FaqPreturi from "@/components/preturi/FaqPreturi";
import LiniaDeBaza from "@/components/preturi/LiniaDeBaza";
import LumeaPreturi from "@/components/preturi/LumeaPreturi";
import Pachete from "@/components/preturi/Pachete";
import Pliuri from "@/components/preturi/Pliuri";
import TabelPlanuri from "@/components/preturi/TabelPlanuri";
import { grafIntrebariPreturi } from "@/components/preturi/date-structurate";
import JsonLd from "@/components/seo/JsonLd";
import { metadataPagina } from "@/components/seo/metadata";
import { ANTET_PRETURI, CALE_PRETURI, META_PRETURI } from "@/content/preturi";
import { stareAnalitica } from "@/lib/analitica";
import { adresaSite } from "@/lib/site";

// Pagina de preturi (felia `preturi`, valul S4-3; fisa `preturi.md` si COMPONENTE §4.8, in depozitul
// fabricii). Sablonul "interior-880": eroul interior pe blocul de 880, apoi, pe aceeasi ruta, doua
// stari - poarta cu doua carduri si lumea pachetelor (linia de baza, pachetele, pliurile, intrebarile).
// Ambele stari sunt in HTML-ul servit; `LumeaPreturi` o arata pe cea curenta. Toate sumele sunt
// 0 RON astazi (decizia D3). Textele vin din contractul `src/content/preturi.ts`.

export const metadata = metadataPagina({
  titlu: META_PRETURI.titlu,
  descriere: META_PRETURI.descriere,
  cale: CALE_PRETURI,
});

export default function Preturi() {
  const baza = adresaSite();
  const gazda = new URL(baza).host;
  // Analitica se decide la construire (felia de consimtamant): fara ea, pagina nu cere niciodata
  // codul evenimentelor, nici dupa folosirea calculatorului.
  const analitica = stareAnalitica().activa;
  return (
    <main>
      <EroulInterior fir={ANTET_PRETURI.fir} titlu={ANTET_PRETURI.titlu} subtitlu={ANTET_PRETURI.subtitlu} />
      <LumeaPreturi
        lume={
          <>
            <LiniaDeBaza />
            <Pachete gazda={gazda} analitica={analitica} />
            <Pliuri tabel={<TabelPlanuri />} />
            <FaqPreturi />
          </>
        }
      />
      <JsonLd date={grafIntrebariPreturi(baza)} />
    </main>
  );
}
