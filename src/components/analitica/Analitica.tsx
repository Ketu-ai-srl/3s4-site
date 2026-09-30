// Locul analiticii proprii in layout (componenta de server). Decide la construire, prin
// `stareAnaliticaProprie`, daca scriptul exista: fara `UMAMI_URL` si `UMAMI_WEBSITE_ID` SAU fara un
// operator de date numit si complet nu randeaza nimic, deci HTML-ul e cel de pana acum. Pornita, pune UN
// script, de pe originea site-ului (`/a/script.js`, rescris de `next.config.ts` spre instanta de
// statistica), niciodata de pe alta origine: browserul vorbeste numai cu site-ul (poarta C-01).
//
// `next/script` cu strategia `afterInteractive`: scriptul se pune dupa hidratare, deci nu incurca LCP
// si INP. Atributele (documentatia trackerului: https://docs.umami.is/docs/tracker-configuration):
//   - `data-website-id`: identificatorul site-ului in aplicatia de statistica (public prin natura lui,
//     se vede in orice pagina care il foloseste);
//   - `data-do-not-track="true"`: masurarea nu porneste cand browserul trimite "Do Not Track";
//   - fara `data-exclude-search`: parametrii `utm_*` din adresa sunt chiar ce arata de unde vin
//     campaniile, iar site-ul nu pune date personale in adrese (formularele trimit prin POST);
//   - fara `data-host-url`: trackerul trimite la directorul propriului `src`, adica la `/a/api/send`
//     ("By default, Umami will send data to wherever the script is located", aceeasi pagina);
//   - fara `data-domains`: fiecare domeniu are aplicatia si variabilele lui, iar un domeniu adaugat in
//     lista ar opri masurarea pe orice alta gazda (adresa de proba, un mediu de previzualizare) fara ca
//     cineva sa observe; ce se masoara, se masoara sub `UMAMI_WEBSITE_ID`, deci separarea se face acolo.
//
// FARA OPERATOR, NIMIC (planul §9; `./config.ts`, antetul): analitica proprie prelucreaza date personale,
// deci porneste numai cand domeniul are un operator numit si complet, exact ca GA4. Regula e aceeasi cu a
// bannerului (`stareAnalitica`, `src/lib/analitica.ts`): `operatorComplet`, pe operatorul rezolvat al
// domeniului (`OPERATOR_JSON` inaintea lui `config/operator.json`). Parametrul `operator` exista pentru
// probe; in layout componenta se cheama fara props si citeste `OPERATOR`. Textele despre ea intra in
// politicile juridice odata cu paginile lor, adica tot cu operatorul (`src/content/juridic/analitica.ts`).
// Nu asteapta alegerea din banner: ce face si ce nu face, in `./config.ts`; daca masurarea are nevoie de
// acord ramane o decizie a juristului (`docs/ziua-operatorului.md`, sectiunea despre analitica proprie).

import Script from "next/script";
import { OPERATOR, operatorComplet, type Operator } from "@/lib/operator";
import { CALE_SCRIPT, stareAnaliticaProprie } from "./config";

export default function Analitica({ operator = OPERATOR }: { operator?: Operator | null } = {}) {
  const stare = stareAnaliticaProprie(process.env, operatorComplet(operator));
  if (!stare.activa) {
    return null;
  }
  return <Script src={CALE_SCRIPT} strategy="afterInteractive" data-website-id={stare.idSite} data-do-not-track="true" />;
}
