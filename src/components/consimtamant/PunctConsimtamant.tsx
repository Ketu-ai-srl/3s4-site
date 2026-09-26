// Locul bannerului in layout (componenta de server). Decide la construire, prin `stareAnalitica`,
// daca bannerul exista: fara operator numit si complet, sau fara ID GA4, nu se randeaza nimic.
// Si nici codul lui nu ajunge in pagina: bannerul se cere ca bucata separata de JavaScript numai cand
// e randat (`ConsimtamantLenes`), iar incarcatorul GA4 abia la accept. De aceea, aici bannerul se
// importa numai ca TIP: un import de valoare l-ar pune in bucata comuna a layout-ului, pe fiecare
// pagina. Proba: tests/browser/comutator.spec.ts, pe JavaScript-ul incarcat de fiecare ruta.
//
// Legaturile spre politici se dau numai catre pagini care exista pe site (`CAI_EXISTENTE`): paginile
// juridice intra in `RUTE` odata cu operatorul (felia `juridic`). Cat timp lipsesc, bannerul arata
// numele politicilor fara legatura, nu legaturi moarte; la productie, poarta juridica cere pagina
// politicii de cookie-uri din clipa in care bannerul e in HTML-ul construit (L-15).

import { CAI_EXISTENTE } from "@/content/cai";
import { VERSIUNE_INFORMARE, stareAnalitica } from "@/lib/analitica";
import type { LegaturiPolitici } from "./Consimtamant";
import ConsimtamantLenes from "./ConsimtamantLenes";

/** Caile politicilor, cum le numeste coloana Juridic din contractul de navigatie. */
export const CAI_POLITICI = {
  confidentialitate: "/juridic/confidentialitate",
  cookie: "/juridic/cookies",
} as const;

export function legaturiPolitici(cai: ReadonlySet<string> = CAI_EXISTENTE): LegaturiPolitici {
  return {
    confidentialitate: cai.has(CAI_POLITICI.confidentialitate) ? CAI_POLITICI.confidentialitate : null,
    cookie: cai.has(CAI_POLITICI.cookie) ? CAI_POLITICI.cookie : null,
  };
}

export default function PunctConsimtamant() {
  const stare = stareAnalitica();
  if (!stare.activa) {
    return null;
  }
  return <ConsimtamantLenes idGa4={stare.idGa4} versiune={VERSIUNE_INFORMARE} legaturi={legaturiPolitici()} />;
}
