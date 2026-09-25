// Comutatorul paginilor juridice, partea de SERVER (planul valului S4, §9-§10). Aici se decide, cu
// `operatorComplet` din `@/lib/operator`, daca grupul juridic se publica; `./publicare.ts` (care
// ajunge si in browser, prin `RUTE`) citeste numai daca exista un operator numit.
//
// INVARIANTUL. Un operator numit dar incomplet ar face ca browserul (care vede doar "numit") sa
// arate in paleta legaturi spre pagini pe care serverul nu le-a construit. De aceea construirea se
// OPRESTE pe un asemenea operator, cu lista campurilor care lipsesc: `verificaComutator` se cheama
// din `generateStaticParams` al paginii juridice, care ruleaza la fiecare `next build`.

import { OPERATOR, lipsuriInformare, operatorComplet, type Operator } from "@/lib/operator";

/** Se publica paginile juridice? Numai cu operator numit si complet. */
export function juridicPublicat(operator: Operator | null = OPERATOR): boolean {
  return operatorComplet(operator);
}

/** Opreste construirea pe un operator numit dar incomplet. Fara operator sau complet: nimic. */
export function verificaComutator(operator: Operator | null = OPERATOR): void {
  if (operator === null || operatorComplet(operator)) {
    return;
  }
  throw new Error(
    "config/operator.json: operatorul e numit, dar informarea nu e completa (lipsesc: " +
      lipsuriInformare(operator).join(", ") +
      "). Paginile juridice nu se pot publica pe jumatate: se completeaza campurile sau operatorul ramane null.",
  );
}
