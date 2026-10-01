// Comutatorul paginilor juridice, partea de SERVER (planul valului S4, §9-§10). Aici se decide, cu
// `operatorComplet` din `@/lib/operator`, daca grupul juridic se publica; `./publicare.ts` (care
// ajunge si in browser, prin `RUTE`) citeste numai daca exista un operator numit.
//
// INVARIANTUL. Un operator numit dar incomplet ar face ca browserul (care vede doar "numit") sa
// arate in paleta legaturi spre pagini pe care serverul nu le-a construit. De aceea construirea se
// OPRESTE pe un asemenea operator, cu lista campurilor care lipsesc: `verificaComutator` se cheama
// din `generateStaticParams` al paginii juridice, care ruleaza la fiecare `next build`.
//
// FAMILIA (felia 73, `./familie.ts`): un operator complet din SEE publica paginile `/juridic` de azi; unul
// din Republica Moldova (familia `md`) NU le publica - documentele lui au alte adrese (`/legal`, `/ro/juridic`,
// `config/juridic-rute.json`), servite de paginile editiilor. `verificaComutator` construieste oricum, la
// fiecare build, documentele `md` in ambele limbi, ca o problema a lor (starea S-C, o legatura spre o cheie
// necunoscuta) sa opreasca build-ul si inainte ca paginile lor sa existe. Alta tara opreste construirea.

import { OPERATOR, SURSA_OPERATOR, lipsuriInformare, operatorComplet, type Operator } from "@/lib/operator";
import { familieJuridica, type FamilieJuridica } from "./familie";
import { texteJuridice } from "./index";

/** Se publica paginile juridice? Numai cu operator numit si complet. */
export function juridicPublicat(operator: Operator | null = OPERATOR): boolean {
  return operatorComplet(operator);
}

/** Familia documentelor publicate: `null` fara operator complet. Arunca pe o tara fara familie. */
export function familiePublicata(operator: Operator | null = OPERATOR): FamilieJuridica | null {
  return operatorComplet(operator) ? familieJuridica(operator) : null;
}

/**
 * Opreste construirea pe un operator numit dar incomplet, pe o tara fara familie si, la familia `md`, pe
 * orice document care nu se poate compune. Fara operator, sau complet si compozabil: nimic.
 */
export function verificaComutator(operator: Operator | null = OPERATOR, sursa: string = SURSA_OPERATOR): void {
  if (operator === null) {
    return;
  }
  if (operatorComplet(operator)) {
    if (familieJuridica(operator) === "md") {
      texteJuridice(operator, { limba: "ro" });
      texteJuridice(operator, { limba: "en" });
    }
    return;
  }
  throw new Error(
    sursa +
      ": operatorul e numit, dar informarea nu e completa (lipsesc: " +
      lipsuriInformare(operator).join(", ") +
      "). Paginile juridice nu se pot publica pe jumatate: se completeaza campurile sau operatorul ramane null.",
  );
}
