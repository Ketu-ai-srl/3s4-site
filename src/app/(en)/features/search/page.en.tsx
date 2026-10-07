// Pagina P03 a editiei `en`: `/features/search` (grupul produs). Decizia 53 (intrebarea 5, varianta a): aceleasi
// componente cinema ca perechea RO (`src/app/functionalitati/cautare-ai/page.tsx`), in aceeasi ordine, cu textul in
// engleza din modulul `src/content/en/features-search.ts`, importat DIRECT (conditia portii de registru: afirmatiile
// paginii numesc modulul). Scena (intrebarea, pasajul citat, desenul "Acum") e in romana, cu `lang="ro"` pe fiecare
// element care o poarta; ea si cele doua semne non-ASCII vin din `src/content/functionalitati/cautare-ai-3s-md.ts`.
//
// Diferentele fata de RO, toate in lista declarata a perechii (`config/congruenta/p03.json`): cipul "WhatsApp" din
// dosar iese (decizia 49); butonul CTA-ului duce la WhatsApp, cu textul precompletat si `ref`-ul paginii (decizia 3),
// in locul contului. Fara WhatsApp pe domeniu, butonul nu se randeaza. O pagina, un h1: eticheta eroului, ca pe RO.
// Glosa EN a scenei (decizia 75) e notata in aceeasi lista (`_nedeclarate`): sub terminalul eroului (`glosa` pe
// TerminalErou), sub bara din lumina, sub cardul extragerii si sub desenul "Acum" (`glosa` in continutul lui), cu
// textele din `EROU_POVESTE`, `LUMINA_POVESTE`, `EXTRAGERE_POVESTE` si `CONTRAST_POVESTE.acum`.

import { ArrowRight } from "lucide-react";
import LegaturaCanal from "@/components/canale/LegaturaCanal";
import ContrastInainteAcum from "@/components/cinema/ContrastInainteAcum";
import CtaCinema from "@/components/cinema/CtaCinema";
import EroulCinema, { EtichetaErou, IndiciuDerulare, SubtitluErou, TerminalErou } from "@/components/cinema/EroulCinema";
import InvelisCinema from "@/components/cinema/InvelisCinema";
import Pivot from "@/components/cinema/Pivot";
import AvalansaEn from "@/components/functionalitati/cautare-ai/AvalansaEn";
import { DesenAcum, DesenInainte } from "@/components/functionalitati/cautare-ai/DeseneContrast";
import Extragere from "@/components/functionalitati/cautare-ai/Extragere";
import FrustrareEn from "@/components/functionalitati/cautare-ai/FrustrareEn";
import LuminaEn from "@/components/functionalitati/cautare-ai/LuminaEn";
import Recunoastere from "@/components/functionalitati/cautare-ai/Recunoastere";
import TemaPagina from "@/components/global/TemaPagina";
import DateFirAriadnei from "@/components/seo/DateFirAriadnei";
import { metadataPagina } from "@/components/seo/metadata";
import { legaturaWhatsApp } from "@/content/canale";
import {
  CONTRAST_POVESTE,
  CTA_POVESTE,
  EROU_POVESTE,
  EXTRAGERE_POVESTE,
  FIR_POVESTE,
  RECUNOASTERE_POVESTE,
  SOAPTA_POVESTE,
  pagina,
} from "@/content/en/features-search";
import { LIMBA_SCENEI, SCENA_CAUTARE_3S_MD, SEMNE_3S_MD } from "@/content/functionalitati/cautare-ai-3s-md";

export const metadata = metadataPagina({
  titlu: pagina.meta.titlu,
  descriere: pagina.meta.descriere,
  cale: pagina.meta.cale,
  editie: "en",
  cheie: pagina.cheie,
});

export default function Pagina() {
  const c = CONTRAST_POVESTE;
  const scena = SCENA_CAUTARE_3S_MD;
  const wa = legaturaWhatsApp(pagina.cta.ref, pagina.cta.textWhatsapp);
  return (
    <InvelisCinema pagina="cautare-ai">
      <TemaPagina tema="inchisa" />
      <DateFirAriadnei niveluri={[...FIR_POVESTE]} />

      <EroulCinema forma="lupa" samanta={11}>
        <EtichetaErou titlu>{EROU_POVESTE.etichetaNumar + SEMNE_3S_MD.mijloc + EROU_POVESTE.etichetaNume}</EtichetaErou>
        <TerminalErou text={scena.intrebare} pas={35} latime={660} marime="mare" limba={LIMBA_SCENEI} glosa={EROU_POVESTE.glosa} />
        <SubtitluErou varianta="rand-1" dupaScriere>
          {EROU_POVESTE.rand1}
        </SubtitluErou>
        <SubtitluErou varianta="rand-2" dupaScriere intarziere={0.4}>
          {EROU_POVESTE.rand2}
        </SubtitluErou>
        <IndiciuDerulare text={EROU_POVESTE.indiciu} />
      </EroulCinema>

      <AvalansaEn />
      <Recunoastere continut={RECUNOASTERE_POVESTE} />
      <FrustrareEn />
      <Pivot
        varianta="cautare"
        inaltime={70}
        deschidere={SOAPTA_POVESTE.intrebare}
        emfaza={SOAPTA_POVESTE.emfaza}
        linie={SOAPTA_POVESTE.linie}
      />
      <LuminaEn />
      <Extragere continut={{ ...EXTRAGERE_POVESTE, citat: scena.citat }} limbaCitat={LIMBA_SCENEI} />

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
                glosa: c.acum.glosa,
              }}
              limba={LIMBA_SCENEI}
            />
          ),
          metrici: c.acum.metrici,
        }}
        punte={{ eticheta: c.punteDe + SEMNE_3S_MD.sageata + c.punteLa, mono: true }}
      />

      <CtaCinema
        titlu={CTA_POVESTE.titlu}
        paragraf={CTA_POVESTE.paragraf}
        buton={CTA_POVESTE.buton}
        nota={CTA_POVESTE.nota}
        titluMobil="mare"
        latimeParagraf={null}
        butoane={(clasa) =>
          wa === null ? null : (
            <LegaturaCanal legatura={{ implicit: wa, pagini: [] }} canal="whatsapp" className={clasa}>
              <span>{CTA_POVESTE.buton}</span>
              <ArrowRight width={18} height={18} strokeWidth={2} aria-hidden="true" focusable="false" />
            </LegaturaCanal>
          )
        }
      />
    </InvelisCinema>
  );
}
