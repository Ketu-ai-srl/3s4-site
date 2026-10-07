"use client";

// Preturile, INVELITOAREA EN (decizia 53): aceleasi vederi ca pe RO (`*Vedere.tsx`, felia 102), cu textele si sumele
// editiei `en` din `src/content/en/pricing-componente.ts`, in EUR (decizia 54). Modulul nu importa niciun continut RO:
// tipurile vin prin `import type`, iar calculul si formatul sunt functii pure (`calcul.ts`).
//
// Piesele, ca la invelitoarea RO: lumea (poarta cu doua carduri), pachetele (calculatorul, comutatorul, grila, lista
// ca PDF), pliurile si butonul "inapoi" din linia de baza (intra prin slotul `inapoi` al `LiniaDeBaza`). Contextul
// "inapoi" e cel comun (`contextLume.ts`), deci butonul EN citeste contextul pus de lumea EN.
//
// LEGATURA WHATSAPP a butoanelor din grila se rezolva pe server (canalele domeniului) si ajunge aici ca proprietate a
// pachetelor; grila o citeste dintr-un context al acestui modul, fiindca piesele pachetelor se aleg ca tipuri de
// componenta, cu proprietatile fixate de vedere.
//
// BIROUL din primul pliu se monteaza fara demonstratia dispozitivelor (`faraDispozitive`): faptul ca dispozitivele nu
// se numara nu e confirmat, deci ies contorul cu nota lui, butonul de adaugare si numele scenei; raman scena si banda
// de conturi. Titlul si paragraful pliului sunt scrise pe faptul confirmat (conturile pe plan).
//
// AL TREILEA PLIU (felia 127, deciziile 66-68): suplimentele, taxa de conectare si intrebarile despre limite, din
// `SUPLIMENTE_EN`; pagina RO nu il are (invelitoarea ei nu paseaza `suplimente`).

import { createContext, useContext, type ReactNode } from "react";
import type { Perioada, Plan } from "@/content/preturi";
import {
  ANCORE_PRETURI_EN,
  BIROU_EN,
  CALCULATOR_EN,
  CALE_PRETURI_EN,
  COMUTATOR_EN,
  CURSOARE_EN,
  ETICHETE_PRETURI_EN,
  GRILA_EN,
  LINIA_DE_BAZA_EN,
  LISTA_PDF_EN,
  PLANURI_EN,
  PLIURI_EN,
  POARTA_BAZA_EN,
  SUPLIMENTE_EN,
  POARTA_ENTERPRISE_EN,
  dataEn,
  randuriPlanEn,
  valoareSpusaEn,
} from "@/content/en/pricing-componente";
import BirouInteractivVedere from "./BirouInteractivVedere";
import ButonInapoiVedere from "./ButonInapoiVedere";
import { calculeaza, formatBani, formatOre, formatZecimal, type FormatCifre } from "./calcul";
import CalculatorVedere, { type ContinutCalculator } from "./CalculatorVedere";
import ComutatorPerioadaVedere from "./ComutatorPerioadaVedere";
import GrilaPlanuriVedere from "./GrilaPlanuriVedere";
import ListaPdfVedere from "./ListaPdfVedere";
import LumeaPreturiVedere from "./LumeaPreturiVedere";
import PacheteVedere, { type PiesePachete } from "./PacheteVedere";
import PliuriVedere from "./PliuriVedere";

/** Formatul american: virgula la mii (si la ore), punctul zecimal ("EUR 1,833", "2,200 h", "1.5 h"). */
export const FORMAT_EN: FormatCifre = {
  bani: (n) => formatBani(n, ","),
  ore: (n) => formatOre(n, ","),
  zecimal: (n) => formatZecimal(n, "."),
};

const PLANURI: readonly Plan[] = PLANURI_EN;

/** Legatura WhatsApp a paginii (cu `ref`-ul ei), rezolvata pe server; `null` = domeniul fara WhatsApp. */
const ContextWhatsApp = createContext<string | null>(null);

export function LumeaPreturiEn({ lume }: { lume: ReactNode }) {
  return (
    <LumeaPreturiVedere
      lume={lume}
      continut={{
        ancore: { pachete: ANCORE_PRETURI_EN.pachete, poarta: ANCORE_PRETURI_EN.poarta },
        etichetaPoarta: ETICHETE_PRETURI_EN.poarta,
        baza: POARTA_BAZA_EN,
        enterprise: POARTA_ENTERPRISE_EN,
      }}
    />
  );
}

export function ButonInapoiEn() {
  return <ButonInapoiVedere continut={{ text: LINIA_DE_BAZA_EN.inapoi, ancoraPoarta: ANCORE_PRETURI_EN.poarta }} />;
}

const IMPLICITE = {
  persoane: CURSOARE_EN.persoane.implicit,
  minute: CURSOARE_EN.minute.implicit,
  tarif: CURSOARE_EN.tarif.implicit,
};

/** Textul teaserului, din valorile de pornire: "With 4 people searching for documents 25 minutes a day". */
export function textTeaserEn(): { presupuneri: string; rezultat: string } {
  const r = calculeaza(IMPLICITE, "anual", PLANURI, CALCULATOR_EN.zileLucratoare);
  const p = IMPLICITE.persoane;
  const m = IMPLICITE.minute;
  return {
    presupuneri: CALCULATOR_EN.teaser.presupuneri(p + (p === 1 ? " person" : " people"), m + (m === 1 ? " minute" : " minutes")),
    rezultat: CALCULATOR_EN.teaser.rezultat(FORMAT_EN.ore(r.ore) + " h"),
  };
}

const CONTINUT_CALCULATOR: ContinutCalculator = {
  teaser: { ...textTeaserEn(), cta: CALCULATOR_EN.teaser.cta },
  eticheta: CALCULATOR_EN.eticheta,
  cursoare: CURSOARE_EN,
  zileLucratoare: CALCULATOR_EN.zileLucratoare,
  timpAcum: CALCULATOR_EN.timpAcum,
  pretInOre: CALCULATOR_EN.pretInOre,
  pesteConturi: CALCULATOR_EN.pesteConturi,
  nota: CALCULATOR_EN.nota,
  valoareSpusa: valoareSpusaEn,
  enterprise: POARTA_ENTERPRISE_EN.tinta,
};

/** Cu comutatorul pe Annual, fraza planului spune ca pretul e cel la plata anuala. */
const CONTINUT_CALCULATOR_ANUAL: ContinutCalculator = { ...CONTINUT_CALCULATOR, pretInOre: CALCULATOR_EN.pretInOreAnual };

function CalculatorEn({ perioada, analitica }: { perioada: Perioada; analitica: boolean }) {
  // Ca pe RO: evenimentul pleaca o singura data, la prima folosire, iar codul lui se cere lenes, numai cu analitica.
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
      format={FORMAT_EN}
      laPrimaFolosire={laPrimaFolosire}
    />
  );
}

function ComutatorEn({ perioada, laSchimbare }: { perioada: Perioada; laSchimbare: (p: Perioada) => void }) {
  return <ComutatorPerioadaVedere perioada={perioada} laSchimbare={laSchimbare} continut={COMUTATOR_EN} />;
}

function GrilaEn({ perioada }: { perioada: Perioada }) {
  const whatsapp = useContext(ContextWhatsApp);
  return (
    <GrilaPlanuriVedere
      perioada={perioada}
      continut={{
        recomandat: GRILA_EN.recomandat,
        unitate: perioada === "anual" ? GRILA_EN.unitateAnual : GRILA_EN.unitate,
        buton: { text: GRILA_EN.buton, href: whatsapp, ruta: null },
        detalii: GRILA_EN.detalii,
      }}
      planuri={PLANURI}
      randuri={randuriPlanEn}
      formatSuma={FORMAT_EN.bani}
    />
  );
}

function ListaPdfEn({ gazda }: { gazda: string }) {
  return <ListaPdfVedere gazda={gazda} continut={LISTA_PDF_EN} planuri={PLANURI} cale={CALE_PRETURI_EN} formatData={dataEn} />;
}

const PIESE: PiesePachete = { Calculator: CalculatorEn, Comutator: ComutatorEn, Grila: GrilaEn, ListaPdf: ListaPdfEn };

export function PacheteEn({ gazda, analitica, whatsapp }: { gazda: string; analitica: boolean; whatsapp: string | null }) {
  return (
    <ContextWhatsApp.Provider value={whatsapp}>
      <PacheteVedere gazda={gazda} analitica={analitica} ancora={ANCORE_PRETURI_EN.pachete} eticheta={GRILA_EN.eticheta} piese={PIESE} />
    </ContextWhatsApp.Provider>
  );
}

/** Biroul pe editia EN: fara demonstratia dispozitivelor (vezi antetul). */
function BirouInteractivEn({ activ }: { activ: boolean }) {
  return <BirouInteractivVedere activ={activ} continut={BIROU_EN} planuri={PLANURI} faraDispozitive />;
}

export function PliuriEn({ tabel }: { tabel: ReactNode }) {
  return <PliuriVedere tabel={tabel} continut={PLIURI_EN} Birou={BirouInteractivEn} suplimente={SUPLIMENTE_EN} />;
}
