"use client";

// Calculatorul, INVELITOAREA RO: aceeasi cale, acelasi export si aceleasi proprietati ca inainte.
// Construieste continutul din modulul RO (textele, cursoarele, gramatica numeralului) si randeaza
// `CalculatorVedere`, care nu importa continut; alta editie isi are invelitoarea ei. Teaserul, cele
// trei cursoare si formula sunt descrise in vedere si in `calcul.ts`.
//
// Folosirea calculatorului pleaca spre analitica o singura data, din lista inchisa
// (`calculator_folosit`), si numai cu consimtamant. Codul evenimentelor se cere LENES, la prima
// folosire, si numai cand analitica e pornita la construire (`analitica`). Un import static l-ar fi
// pus in bucata paginii, iar Next o preincarca pe orice pagina cu legatura spre preturi: cu analitica
// oprita, fanionul de oprire GA4 ajungea astfel in JavaScript-ul fiecarei rute
// (tests/browser/comutator.spec.ts, masurat rosu pe /, /preturi si 404 inainte de schimbarea asta).

import { CALCULATOR, PLANURI, POARTA_ENTERPRISE, cuDe, valoareSpusa, type Perioada } from "@/content/preturi";
import { calculeaza, formatOre, type Intrari } from "./calcul";
import CalculatorVedere, { type ContinutCalculator } from "./CalculatorVedere";

const IMPLICITE: Intrari = {
  persoane: CALCULATOR.cursoare.persoane.implicit,
  minute: CALCULATOR.cursoare.minute.implicit,
  tarif: CALCULATOR.cursoare.tarif.implicit,
};

/** Textul teaserului, din valorile de pornire: "Cu 5 colegi care ... 30 de minute ...". */
export function textTeaser(): { presupuneri: string; rezultat: string } {
  const r = calculeaza(IMPLICITE, "anual", PLANURI, CALCULATOR.zileLucratoare);
  const p = IMPLICITE.persoane;
  const m = IMPLICITE.minute;
  return {
    presupuneri: CALCULATOR.teaser.presupuneri(p + cuDe(p) + (p === 1 ? " coleg" : " colegi"), m + cuDe(m) + " minute"),
    rezultat: CALCULATOR.teaser.rezultat(formatOre(r.ore) + cuDe(r.ore) + " ore"),
  };
}

const CONTINUT: ContinutCalculator = {
  teaser: { ...textTeaser(), cta: CALCULATOR.teaser.cta },
  eticheta: CALCULATOR.eticheta,
  cursoare: CALCULATOR.cursoare,
  zileLucratoare: CALCULATOR.zileLucratoare,
  timpAcum: CALCULATOR.timpAcum,
  pretInOre: CALCULATOR.pretInOre,
  pesteConturi: {
    inainte: (persoane) => CALCULATOR.pesteConturi.inainte(persoane + cuDe(persoane)),
    dupa: CALCULATOR.pesteConturi.dupa,
  },
  nota: CALCULATOR.nota,
  valoareSpusa,
  enterprise: POARTA_ENTERPRISE.tinta,
};

export default function Calculator({ perioada, analitica }: { perioada: Perioada; analitica: boolean }) {
  const laPrimaFolosire = () => {
    if (analitica) {
      void import("@/components/consimtamant/evenimente").then((m) => m.trimiteEveniment("calculator_folosit", {}));
    }
  };
  return <CalculatorVedere perioada={perioada} continut={CONTINUT} planuri={PLANURI} laPrimaFolosire={laPrimaFolosire} />;
}
