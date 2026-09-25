// /promo - pagina promo pe sablonul "cinema-promo" (fisa promo.md; COMPONENTE.md §3 si §4.4): pagina neagra
// de 10 ecrane, fiecare sectiune centrata pe un ecran, cu intrarea si iesirea legate de derulare. Invelisul
// si fundalul sunt ale cadrului cinema, inghetat (`src/components/cinema/`), cu paralaxa grilei de 0,2;
// sectiunile, cardurile si textele sunt ale feliei (`src/components/promo/`, `src/content/promo.ts`).
//
// ABATERI DE LA REFERINTA:
//   - un singur h1, pe primul ecran; celelalte titluri mari si titlul CTA sunt h2 cu aceeasi forma (la
//     referinta erau toate h1);
//   - textul pe romana (la referinta ruta romaneasca era servita in sarba);
//   - contrastul: paragrafele, etichetele si nota finala au alb .5 (COMPONENTE.md §5.1);
//   - ultima sectiune ajunge la varf (la referinta ramanea la e = 0,875): 90svh cu spatiul in plus jos, deci
//     si fara subsol (proba `tests/browser/promo.spec.ts`, cu subsolul ascuns);
//   - SUBSOLUL RAMANE: fisa cere pagina fara subsol, dar subsolul sta in layout-ul inghetat si nu are un
//     comutator pe pagina (cererea catre dispecer e in raportul feliei). Pagina pune tema inchisa, deci
//     subsolul e pe varianta inchisa, ca pe paginile de functionalitate.

import TemaPagina from "@/components/global/TemaPagina";
import InvelisCinema from "@/components/cinema/InvelisCinema";
import CardCautare from "@/components/promo/CardCautare";
import Contoare from "@/components/promo/Contoare";
import {
  CardAutomatizare,
  CardPrimire,
  CardSistemNational,
  CtaPromo,
  Declaratie,
  EtichetaPromo,
  IconiteHaos,
  IndiciuDerulare,
  Paragraf,
  StatisticiHaos,
  TitluCard,
  TitluMare,
  TitluSimplu,
} from "@/components/promo/Piese";
import SectiunePromo from "@/components/promo/SectiunePromo";
import DateFirAriadnei from "@/components/seo/DateFirAriadnei";
import { metadataPagina } from "@/components/seo/metadata";
import {
  AUTOMATIZARE,
  CALE_PROMO,
  CAUTARE,
  CTA_PROMO,
  DECLARATIE_PROMO,
  EROU_PROMO,
  FIR_PROMO,
  HAOS,
  META_PROMO,
  PRIMIRE,
  SISTEM_NATIONAL,
  SOLUTIE,
} from "@/content/promo";

/** Paralaxa grilei pe promo (fisa: -0,2 x scrollY). */
const PARALAXA_PROMO = 0.2;

export const metadata = metadataPagina({ titlu: META_PROMO.titlu, descriere: META_PROMO.descriere, cale: CALE_PROMO });

export default function PaginaPromo() {
  return (
    <InvelisCinema pagina="promo" factorParalaxa={PARALAXA_PROMO}>
      <TemaPagina tema="inchisa" />
      <DateFirAriadnei niveluri={[...FIR_PROMO]} />

      <SectiunePromo nume="erou" primul>
        <EtichetaPromo>{EROU_PROMO.eticheta}</EtichetaPromo>
        <TitluMare ca="h1" titlu={EROU_PROMO.titlu} accent="rosu" />
        <Paragraf>{EROU_PROMO.paragraf}</Paragraf>
        <IndiciuDerulare text={EROU_PROMO.indiciu} />
      </SectiunePromo>

      <SectiunePromo nume="haos">
        <IconiteHaos />
        <TitluSimplu>
          {HAOS.titlu.randul1}
          <br />
          {HAOS.titlu.randul2}
        </TitluSimplu>
        <Paragraf mare>{HAOS.paragraf}</Paragraf>
        <StatisticiHaos />
      </SectiunePromo>

      <SectiunePromo nume="solutie">
        <TitluMare titlu={SOLUTIE.titlu} accent="albastru" />
        <Paragraf mare>{SOLUTIE.paragraf}</Paragraf>
      </SectiunePromo>

      <SectiunePromo nume="primire">
        <CardPrimire />
        <TitluCard>{PRIMIRE.titlu}</TitluCard>
        <Paragraf>{PRIMIRE.paragraf}</Paragraf>
      </SectiunePromo>

      <SectiunePromo nume="cautare">
        <CardCautare />
        <TitluCard>{CAUTARE.titlu}</TitluCard>
        <Paragraf>{CAUTARE.paragraf}</Paragraf>
      </SectiunePromo>

      <SectiunePromo nume="automatizare">
        <CardAutomatizare />
        <TitluCard>{AUTOMATIZARE.titlu}</TitluCard>
        <Paragraf>{AUTOMATIZARE.paragraf}</Paragraf>
      </SectiunePromo>

      <SectiunePromo nume="sistem-national">
        <CardSistemNational />
        <TitluCard>{SISTEM_NATIONAL.titlu}</TitluCard>
        <Paragraf>{SISTEM_NATIONAL.paragraf}</Paragraf>
      </SectiunePromo>

      <SectiunePromo nume="declaratie">
        <Declaratie fraza={DECLARATIE_PROMO.fraza} atribuire={DECLARATIE_PROMO.atribuire} />
      </SectiunePromo>

      <SectiunePromo nume="contoare">
        <Contoare />
      </SectiunePromo>

      <SectiunePromo nume="cta" ultimul>
        <CtaPromo
          titlu={
            <>
              {CTA_PROMO.titlu.inainte}
              <br />
              {CTA_PROMO.titlu.accent}
            </>
          }
          paragraf={CTA_PROMO.paragraf}
          buton={CTA_PROMO.buton}
          nota={CTA_PROMO.nota}
        />
      </SectiunePromo>
    </InvelisCinema>
  );
}
