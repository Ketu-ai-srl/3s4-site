// Starea formularului, decisa pe SERVER la construire, din comutatorul operatorului
// (`config/operator.json`, citit prin `src/lib/operator.ts`) si din adresa marcii
// (`config/brand.json`). Componenta de browser primeste doar rezultatul, nu configurarea.
//
// Formularul trimite numai cand exista un operator de date COMPLET (planul valului S4, §9-§10).
// Cat timp operatorul e `null`, formularul arata identic, valideaza tot, dar nu trimite nimic.

import { adresaMarcii } from "@/content/entitate";
import { stareAnalitica } from "@/lib/analitica";
import { PASTRARE } from "@/content/juridic/confidentialitate";
import { OPERATOR, operatorComplet, type Operator } from "@/lib/operator";

export type StareFormular = {
  /** Trimiterea e pornita: exista operator complet. */
  activ: boolean;
  /** Adresa aratata ca rezerva ("scrieti-ne direct"), sau `null` cand nu exista una confirmata. */
  adresa: string | null;
  /** Denumirea operatorului pentru nota de informare, sau `null`. */
  operator: string | null;
  /** Termenul de pastrare din politica, acelasi text. */
  pastrare: string;
  /**
   * Analitica e pornita (operator + ID GA4). Numai atunci formularul incarca, la prima interactiune,
   * modulul evenimentelor; altfel codul analiticii nu ajunge deloc in pagina.
   */
  analitica: boolean;
};

export function stareFormular(
  operator: Operator | null = OPERATOR,
  emailMarca: string | null = adresaMarcii(),
  analitica: boolean = stareAnalitica().activa,
): StareFormular {
  const complet = operatorComplet(operator);
  return {
    activ: complet,
    adresa: emailMarca ?? (complet ? operator.email : null),
    operator: complet ? operator.denumire : null,
    analitica,
    pastrare: PASTRARE.formulareFaraOferta + "; " + PASTRARE.formulareCuOferta + " dacă primiți o ofertă",
  };
}
