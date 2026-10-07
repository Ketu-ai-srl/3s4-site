"use client";

// Preturile, INVELITOAREA ro-MD (decizia 53): aceleasi vederi ca pe RO si pe EN (`*Vedere.tsx`, felia 102), cu textele
// si sumele editiei din `src/content/ro-md/preturi-componente.ts`, in EUR (decizia 54), cu formatul romanesc al
// cifrelor (punct la mii, virgula zecimala). Nu importa niciun continut RO: tipurile vin prin `import type`, iar
// calculul si formatul sunt functii pure (`calcul.ts`). Sta langa paginile /ro (dosar privat), nu in `src/components`.
//
// Piesele, ca la invelitoarea EN (`PreturiEn.tsx`): lumea (poarta cu doua carduri), pachetele (calculatorul,
// comutatorul, grila, lista ca PDF), pliurile si butonul de intoarcere din linia de baza. Contextul de intoarcere e cel
// comun (`contextLume.ts`). Legatura WhatsApp a butoanelor din grila se rezolva pe server si ajunge ca proprietate a
// pachetelor. Biroul se monteaza fara demonstratia dispozitivelor (`faraDispozitive`), ca pe EN.
//
// AL TREILEA PLIU (felia 129, deciziile 66-68, oglinda lui `PliuriEn`): suplimentele, taxa de conectare si intrebarile
// despre limite, din `SUPLIMENTE_RO_MD`.

import { createContext, useContext, type ReactNode } from "react";
import BirouInteractivVedere from "@/components/preturi/BirouInteractivVedere";
import ButonInapoiVedere from "@/components/preturi/ButonInapoiVedere";
import { calculeaza, FORMAT_ROMANESC, formatOre } from "@/components/preturi/calcul";
import CalculatorVedere, { type ContinutCalculator } from "@/components/preturi/CalculatorVedere";
import ComutatorPerioadaVedere from "@/components/preturi/ComutatorPerioadaVedere";
import GrilaPlanuriVedere from "@/components/preturi/GrilaPlanuriVedere";
import ListaPdfVedere from "@/components/preturi/ListaPdfVedere";
import LumeaPreturiVedere from "@/components/preturi/LumeaPreturiVedere";
import PacheteVedere, { type PiesePachete } from "@/components/preturi/PacheteVedere";
import PliuriVedere from "@/components/preturi/PliuriVedere";
import type { Perioada, Plan } from "@/content/preturi";
import {
  ANCORE_PRETURI_RO_MD,
  BIROU_RO_MD,
  CALCULATOR_RO_MD,
  CALE_PRETURI_RO_MD,
  COMUTATOR_RO_MD,
  CURSOARE_RO_MD,
  ETICHETE_PRETURI_RO_MD,
  GRILA_RO_MD,
  LINIA_DE_BAZA_RO_MD,
  LISTA_PDF_RO_MD,
  PLANURI_RO_MD,
  PLIURI_RO_MD,
  POARTA_BAZA_RO_MD,
  POARTA_ENTERPRISE_RO_MD,
  SUPLIMENTE_RO_MD,
  cuDeRoMd,
  dataRoMd,
  randuriPlanRoMd,
  valoareSpusaRoMd,
} from "@/content/ro-md/preturi-componente";

const PLANURI: readonly Plan[] = PLANURI_RO_MD;

/** Legatura WhatsApp a paginii (cu `ref`-ul ei), rezolvata pe server; `null` = domeniul fara WhatsApp. */
const ContextWhatsApp = createContext<string | null>(null);

export function LumeaPreturiRoMd({ lume }: { lume: ReactNode }) {
  return (
    <LumeaPreturiVedere
      lume={lume}
      continut={{
        ancore: { pachete: ANCORE_PRETURI_RO_MD.pachete, poarta: ANCORE_PRETURI_RO_MD.poarta },
        etichetaPoarta: ETICHETE_PRETURI_RO_MD.poarta,
        baza: POARTA_BAZA_RO_MD,
        enterprise: POARTA_ENTERPRISE_RO_MD,
      }}
    />
  );
}

export function ButonInapoiRoMd() {
  return <ButonInapoiVedere continut={{ text: LINIA_DE_BAZA_RO_MD.inapoi, ancoraPoarta: ANCORE_PRETURI_RO_MD.poarta }} />;
}

const IMPLICITE = {
  persoane: CURSOARE_RO_MD.persoane.implicit,
  minute: CURSOARE_RO_MD.minute.implicit,
  tarif: CURSOARE_RO_MD.tarif.implicit,
};

/** Textul teaserului, din valorile de pornire: "Cu 4 colegi care cauta acte cate 25 de minute zilnic". */
export function textTeaserRoMd(): { presupuneri: string; rezultat: string } {
  const r = calculeaza(IMPLICITE, "anual", PLANURI, CALCULATOR_RO_MD.zileLucratoare);
  const p = IMPLICITE.persoane;
  const m = IMPLICITE.minute;
  return {
    presupuneri: CALCULATOR_RO_MD.teaser.presupuneri(p + cuDeRoMd(p) + (p === 1 ? " coleg" : " colegi"), m + cuDeRoMd(m) + " minute"),
    rezultat: CALCULATOR_RO_MD.teaser.rezultat(formatOre(r.ore) + cuDeRoMd(Math.round(r.ore)) + " ore"),
  };
}

const CONTINUT_CALCULATOR: ContinutCalculator = {
  teaser: { ...textTeaserRoMd(), cta: CALCULATOR_RO_MD.teaser.cta },
  eticheta: CALCULATOR_RO_MD.eticheta,
  cursoare: CURSOARE_RO_MD,
  zileLucratoare: CALCULATOR_RO_MD.zileLucratoare,
  timpAcum: CALCULATOR_RO_MD.timpAcum,
  pretInOre: CALCULATOR_RO_MD.pretInOre,
  pesteConturi: CALCULATOR_RO_MD.pesteConturi,
  nota: CALCULATOR_RO_MD.nota,
  valoareSpusa: valoareSpusaRoMd,
  enterprise: POARTA_ENTERPRISE_RO_MD.tinta,
};

/** Cu comutatorul pe Anual, fraza pachetului spune ca pretul e cel la plata anuala. */
const CONTINUT_CALCULATOR_ANUAL: ContinutCalculator = { ...CONTINUT_CALCULATOR, pretInOre: CALCULATOR_RO_MD.pretInOreAnual };

function CalculatorRoMd({ perioada, analitica }: { perioada: Perioada; analitica: boolean }) {
  // Ca pe RO si pe EN: evenimentul pleaca o singura data, la prima folosire, iar codul lui se cere lenes, numai cu analitica.
  const laPrimaFolosire = () => {
    if (analitica) {
      void import("@/components/consimtamant/evenimente").then((m) => m.trimiteEveniment("calculator_folosit", {}));
    }
  };
  return (
    <CalculatorVedere
      perioada={perioada}
      continut={perioada === "anual" ? CONTINUT_CALCULATOR_ANUAL : CONTINUT_CALCULATOR}
      planuri={PLANURI}
      format={FORMAT_ROMANESC}
      laPrimaFolosire={laPrimaFolosire}
    />
  );
}

function ComutatorRoMd({ perioada, laSchimbare }: { perioada: Perioada; laSchimbare: (p: Perioada) => void }) {
  return <ComutatorPerioadaVedere perioada={perioada} laSchimbare={laSchimbare} continut={COMUTATOR_RO_MD} />;
}

function GrilaRoMd({ perioada }: { perioada: Perioada }) {
  const whatsapp = useContext(ContextWhatsApp);
  return (
    <GrilaPlanuriVedere
      perioada={perioada}
      continut={{
        recomandat: GRILA_RO_MD.recomandat,
        unitate: perioada === "anual" ? GRILA_RO_MD.unitateAnual : GRILA_RO_MD.unitate,
        buton: { text: GRILA_RO_MD.buton, href: whatsapp, ruta: null },
        detalii: GRILA_RO_MD.detalii,
      }}
      planuri={PLANURI}
      randuri={randuriPlanRoMd}
      formatSuma={FORMAT_ROMANESC.bani}
    />
  );
}

function ListaPdfRoMd({ gazda }: { gazda: string }) {
  return <ListaPdfVedere gazda={gazda} continut={LISTA_PDF_RO_MD} planuri={PLANURI} cale={CALE_PRETURI_RO_MD} formatData={dataRoMd} />;
}

const PIESE: PiesePachete = { Calculator: CalculatorRoMd, Comutator: ComutatorRoMd, Grila: GrilaRoMd, ListaPdf: ListaPdfRoMd };

export function PacheteRoMd({ gazda, analitica, whatsapp }: { gazda: string; analitica: boolean; whatsapp: string | null }) {
  return (
    <ContextWhatsApp.Provider value={whatsapp}>
      <PacheteVedere gazda={gazda} analitica={analitica} ancora={ANCORE_PRETURI_RO_MD.pachete} eticheta={GRILA_RO_MD.eticheta} piese={PIESE} />
    </ContextWhatsApp.Provider>
  );
}

/** Biroul pe editia ro-MD: fara demonstratia dispozitivelor, ca pe EN. */
function BirouInteractivRoMd({ activ }: { activ: boolean }) {
  return <BirouInteractivVedere activ={activ} continut={BIROU_RO_MD} planuri={PLANURI} faraDispozitive />;
}

export function PliuriRoMd({ tabel }: { tabel: ReactNode }) {
  return <PliuriVedere tabel={tabel} continut={PLIURI_RO_MD} Birou={BirouInteractivRoMd} suplimente={SUPLIMENTE_RO_MD} />;
}
