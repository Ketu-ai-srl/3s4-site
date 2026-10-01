// Locul analiticii proprii in layout-ul romanesc (componenta de server). De la masurarea S-B (decizia 13 din
// 30.09.2026: Umami porneste numai dupa acordul din banner) NU mai pune niciun script in pagina: scriptul il
// insereaza bannerul, abia la accept (`src/components/consimtamant/incarcator-umami.ts`, cerut din
// `Consimtamant.tsx`), cu aceleasi atribute ca pana acum (identificatorul site-ului, `data-do-not-track`) plus
// `data-before-send`, prin care retragerea opreste trimiterea pe loc. Inainte de accept HTML-ul nu poarta nimic
// din analitica proprie, oricare ar fi variabilele.
//
// CE RAMANE AICI: verificarea configurarii la construire. Cu `UMAMI_URL` si `UMAMI_WEBSITE_ID` date, o valoare
// gresita opreste construirea (`stareAnaliticaProprie`, `./config.ts`), cu sau fara operator, ca inainte.
// Rescrierile `/a/` raman in `next.config.ts` (tot din `./config.ts`): sunt pe server si nu produc nicio cerere
// pana cand scriptul nu e inserat. Pornirea cere, ca la GA4, un operator numit si complet (`OPERATOR_JSON`
// inaintea lui `config/operator.json`); decizia o ia `stareAnalitica` (`src/lib/analitica.ts`), care da bannerului
// identificatorul site-ului. Parametrul `operator` exista pentru probe; in layout componenta se cheama fara props.

import { OPERATOR, operatorComplet, type Operator } from "@/lib/operator";
import { stareAnaliticaProprie } from "./config";

export default function Analitica({ operator = OPERATOR }: { operator?: Operator | null } = {}) {
  stareAnaliticaProprie(process.env, operatorComplet(operator));
  return null;
}
