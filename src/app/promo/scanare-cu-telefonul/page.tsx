// /promo/scanare-cu-telefonul - a doua pagina pe sablonul "cinema-promo" (fisa
// promo__scanare-cu-telefonul.md): aceleasi formule de derulare ca /promo, cu sectiunile de 64 / 32, interior
// de 700, titluri la -0,02 em, accentul `albastru-promo` si ramele cardurilor cu sigla 3S. Piesa proprie:
// scanarea bonului (telefonul, bonul rotit, vizorul, linia de scanare o data, cele 8 randuri de date).
//
// Aceleasi abateri ca pe /promo (un singur h1, contrastul, ultima sectiune la varf dovedita cu subsolul scos
// in proba, subsolul inchis ramas din layout, nerezolvat pana la comutatorul cerut dispecerului); in plus butonul CTA isi schimba la hover doar fundalul, ca la referinta.

import TemaPagina from "@/components/global/TemaPagina";
import InvelisCinema from "@/components/cinema/InvelisCinema";
import CardScanare from "@/components/promo/CardScanare";
import { CardCifre, CardOcr } from "@/components/promo/CarduriScanare";
import { CtaPromo, Declaratie, EtichetaPromo, IndiciuDerulare, Paragraf, TitluCard, TitluMare, TitluSimplu } from "@/components/promo/Piese";
import SectiunePromo from "@/components/promo/SectiunePromo";
import DateFirAriadnei from "@/components/seo/DateFirAriadnei";
import { metadataPagina } from "@/components/seo/metadata";
import {
  AFIRMATIE_SCANARE,
  CALE_PROMO_SCANARE,
  CARD_CIFRE,
  CARD_OCR,
  CARD_SCANARE,
  CTA_SCANARE,
  DECLARATIE_SCANARE,
  EROU_SCANARE,
  FIR_SCANARE,
  META_SCANARE,
} from "@/content/promo";

const PARALAXA_PROMO = 0.2;

export const metadata = metadataPagina({ titlu: META_SCANARE.titlu, descriere: META_SCANARE.descriere, cale: CALE_PROMO_SCANARE });

export default function PaginaScanare() {
  return (
    <InvelisCinema pagina="promo-scanare" factorParalaxa={PARALAXA_PROMO}>
      <TemaPagina tema="inchisa" />
      <DateFirAriadnei niveluri={[...FIR_SCANARE]} />

      <SectiunePromo nume="erou" primul varianta="scanare">
        <EtichetaPromo>{EROU_SCANARE.eticheta}</EtichetaPromo>
        <TitluMare ca="h1" titlu={EROU_SCANARE.titlu} accent="promo" strans />
        <Paragraf mare>{EROU_SCANARE.paragraf}</Paragraf>
        <IndiciuDerulare text={EROU_SCANARE.indiciu} />
      </SectiunePromo>

      <SectiunePromo nume="afirmatie" varianta="scanare">
        <TitluSimplu accent="albastru" strans>
          {AFIRMATIE_SCANARE.titlu}
        </TitluSimplu>
        <Paragraf mare>{AFIRMATIE_SCANARE.paragraf}</Paragraf>
      </SectiunePromo>

      <SectiunePromo nume="scanare" varianta="scanare">
        <CardScanare />
        <TitluCard>{CARD_SCANARE.titlu}</TitluCard>
        <Paragraf>{CARD_SCANARE.paragraf}</Paragraf>
      </SectiunePromo>

      <SectiunePromo nume="ocr" varianta="scanare">
        <CardOcr />
        <TitluCard>{CARD_OCR.titlu}</TitluCard>
        <Paragraf>{CARD_OCR.paragraf}</Paragraf>
      </SectiunePromo>

      <SectiunePromo nume="cifre" varianta="scanare">
        <CardCifre />
        <TitluCard>{CARD_CIFRE.titlu}</TitluCard>
        <Paragraf>{CARD_CIFRE.paragraf}</Paragraf>
      </SectiunePromo>

      <SectiunePromo nume="declaratie" varianta="scanare">
        <Declaratie
          fraza={DECLARATIE_SCANARE.fraza}
          atribuire={DECLARATIE_SCANARE.atribuire}
          initiala={DECLARATIE_SCANARE.initiala}
          scanare
        />
      </SectiunePromo>

      <SectiunePromo nume="cta" varianta="scanare" ultimul>
        <CtaPromo titlu={CTA_SCANARE.titlu} paragraf={CTA_SCANARE.paragraf} buton={CTA_SCANARE.buton} nota={CTA_SCANARE.nota} scanare />
      </SectiunePromo>
    </InvelisCinema>
  );
}
