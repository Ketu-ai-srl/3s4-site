// Pagina P03 a editiei `ro-MD`: `/ro/functionalitati/cautare-ai` pe 3s.md. Decizia 53 (intrebarea 5, varianta a):
// aceleasi componente cinema ca perechea RO (`src/app/functionalitati/cautare-ai/page.tsx`) si ca pagina EN
// (`src/app/(en)/features/search/page.en.tsx`), in aceeasi ordine, cu textul editiei din
// `src/content/ro-md/cautare-ai-componente.ts`. Pagina e in romana, deci scena nu primeste `lang` separat.
//
// Diferentele fata de RO, toate in lista declarata a perechii (`config/congruenta/p03.json`): cipul "WhatsApp" din
// dosar iese (decizia 49); butonul CTA-ului duce la WhatsApp, cu textul precompletat si `ref`-ul paginii (decizia 3),
// in locul contului. Fara WhatsApp pe domeniu, butonul nu se randeaza. O pagina, un h1: eticheta eroului, ca pe RO.

import { ArrowRight } from "lucide-react";
import LegaturaCanal from "@/components/canale/LegaturaCanal";
import ContrastInainteAcum from "@/components/cinema/ContrastInainteAcum";
import CtaCinema from "@/components/cinema/CtaCinema";
import EroulCinema, { EtichetaErou, IndiciuDerulare, SubtitluErou, TerminalErou } from "@/components/cinema/EroulCinema";
import InvelisCinema from "@/components/cinema/InvelisCinema";
import Pivot from "@/components/cinema/Pivot";
import { DesenAcum, DesenInainte } from "@/components/functionalitati/cautare-ai/DeseneContrast";
import Extragere from "@/components/functionalitati/cautare-ai/Extragere";
import Recunoastere from "@/components/functionalitati/cautare-ai/Recunoastere";
import TemaPagina from "@/components/global/TemaPagina";
import DateFirAriadnei from "@/components/seo/DateFirAriadnei";
import { metadataPagina } from "@/components/seo/metadata";
import { legaturaWhatsApp } from "@/content/canale";
import { pagina } from "@/content/ro-md/cautare-ai";
import {
  CONTRAST_CAUTARE_RO_MD,
  CTA_CAUTARE_RO_MD,
  EROU_CAUTARE_RO_MD,
  EXTRAGERE_CAUTARE_RO_MD,
  FIR_CAUTARE_RO_MD,
  RECUNOASTERE_CAUTARE_RO_MD,
  SCENA_CAUTARE_RO_MD,
  SEMNE_CAUTARE_RO_MD,
  SOAPTA_CAUTARE_RO_MD,
} from "@/content/ro-md/cautare-ai-componente";
import AvalansaRoMd from "../../_editie/AvalansaRoMd";
import FrustrareRoMd from "../../_editie/FrustrareRoMd";
import LuminaRoMd from "../../_editie/LuminaRoMd";

export const metadata = metadataPagina({
  titlu: pagina.meta.titlu,
  descriere: pagina.meta.descriere,
  cale: pagina.meta.cale,
  editie: "ro-MD",
  cheie: pagina.cheie,
});

export default function Pagina() {
  const c = CONTRAST_CAUTARE_RO_MD;
  const scena = SCENA_CAUTARE_RO_MD;
  const wa = legaturaWhatsApp(pagina.cta.ref, pagina.cta.textWhatsapp);
  return (
    <InvelisCinema pagina="cautare-ai">
      <TemaPagina tema="inchisa" />
      <DateFirAriadnei niveluri={[...FIR_CAUTARE_RO_MD]} />

      <EroulCinema forma="lupa" samanta={11}>
        <EtichetaErou titlu>{EROU_CAUTARE_RO_MD.etichetaNumar + SEMNE_CAUTARE_RO_MD.mijloc + EROU_CAUTARE_RO_MD.etichetaNume}</EtichetaErou>
        <TerminalErou text={scena.intrebare} pas={35} latime={660} marime="mare" />
        <SubtitluErou varianta="rand-1" dupaScriere>
          {EROU_CAUTARE_RO_MD.rand1}
        </SubtitluErou>
        <SubtitluErou varianta="rand-2" dupaScriere intarziere={0.4}>
          {EROU_CAUTARE_RO_MD.rand2}
        </SubtitluErou>
        <IndiciuDerulare text={EROU_CAUTARE_RO_MD.indiciu} />
      </EroulCinema>

      <AvalansaRoMd />
      <Recunoastere continut={RECUNOASTERE_CAUTARE_RO_MD} />
      <FrustrareRoMd />
      <Pivot
        varianta="cautare"
        inaltime={70}
        deschidere={SOAPTA_CAUTARE_RO_MD.intrebare}
        emfaza={SOAPTA_CAUTARE_RO_MD.emfaza}
        linie={SOAPTA_CAUTARE_RO_MD.linie}
      />
      <LuminaRoMd />
      <Extragere continut={{ ...EXTRAGERE_CAUTARE_RO_MD, citat: scena.citat }} />

      <ContrastInainteAcum
        titlu={c.titlu}
        paragraf={c.paragraf}
        latimeParagraf={null}
        fundal="plin"
        inainte={{
          titlu: c.inainte.titlu,
          subtitlu: c.inainte.subtitlu,
          vizual: <DesenInainte continut={c.inainte} />,
          metrici: c.inainte.metrici,
        }}
        acum={{
          titlu: c.acum.titlu,
          subtitlu: c.acum.subtitlu,
          vizual: (
            <DesenAcum
              continut={{
                declaratie: c.acum.declaratie,
                intrebareScurta: scena.intrebareScurta,
                raspunsInceput: scena.raspunsInceput,
                raspunsAccent: scena.raspunsAccent,
                raspunsNota: scena.raspunsNota,
                sursa: c.acum.sursa,
              }}
            />
          ),
          metrici: c.acum.metrici,
        }}
        punte={{ eticheta: c.punteDe + SEMNE_CAUTARE_RO_MD.sageata + c.punteLa, mono: true }}
      />

      <CtaCinema
        titlu={CTA_CAUTARE_RO_MD.titlu}
        paragraf={CTA_CAUTARE_RO_MD.paragraf}
        buton={CTA_CAUTARE_RO_MD.buton}
        nota={CTA_CAUTARE_RO_MD.nota}
        titluMobil="mare"
        latimeParagraf={null}
        butoane={(clasa) =>
          wa === null ? null : (
            <LegaturaCanal legatura={{ implicit: wa, pagini: [] }} canal="whatsapp" className={clasa}>
              <span>{CTA_CAUTARE_RO_MD.buton}</span>
              <ArrowRight width={18} height={18} strokeWidth={2} aria-hidden="true" focusable="false" />
            </LegaturaCanal>
          )
        }
      />
    </InvelisCinema>
  );
}
