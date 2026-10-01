// STAREA MASURARII, din care se compun blocurile conditionate ale documentelor `md` (felia 73).
//
// Textul despre masurare si masurarea care ruleaza se citesc din ACELEASI intrari, deci nu se pot
// desparti: GA4 din `stareAnalitica` (`src/lib/analitica.ts`: operator complet si ID GA4 in stare) si analitica
// proprie (Umami) din `stareAnaliticaProprie` (`src/components/analitica/config.ts`: variabilele
// `UMAMI_*` si operator complet), plus un indicator de cod: porneste Umami numai dupa acordul din banner?
//
//   fara GA4, fara Umami                      -> S0     (blocurile `s0`)
//   GA4, fara Umami                           -> S-GA4  (`banner`, `ga4`, `activ`)
//   Umami activ, care asteapta acordul        -> S-B    (`banner`, `umami`, `umami-b`, `activ`, plus `ga4` daca e)
//   Umami activ, care NU asteapta acordul     -> S-C    construirea se OPRESTE (decizia 13: S-C nu se publica)
//
// `UMAMI_ASTEAPTA_ACORDUL` e `true` de la felia masurarii S-B: scriptul Umami nu mai sta in layout, il
// incarca bannerul numai dupa accept (`src/components/consimtamant/incarcator-umami.ts`), iar retragerea il
// opreste pe loc. Constanta DECLARA ce face codul bannerului; o constanta falsa ar insemna S-C, pe care
// construirea o refuza: `stareMasurare` se cheama la construire din `PunctConsimtamant` (pe toate cele trei
// layout-uri radacina), deci un domeniu cu `UMAMI_*` si operator nu se construieste pe S-C, oricare ar fi
// familia juridica. `linkedin` (pagina 3S de pe LinkedIn) nu tine de masurare; e un parametru al apelantului,
// implicit oprit.

import { stareAnaliticaProprie, type MediuAnalitica } from "@/components/analitica/config";
import { idGa4, stareAnalitica, type StareAnalitica } from "@/lib/analitica";
import { OPERATOR, operatorComplet, type Operator } from "@/lib/operator";
import type { ConditieMasurare } from "./tipuri";

export type StareMasurare = "S0" | "S-GA4" | "S-B";

/** Porneste analitica proprie numai dupa acordul din banner? Da: o incarca bannerul, la accept (masurarea S-B). */
export const UMAMI_ASTEAPTA_ACORDUL = true;

export type Masurare = { stare: StareMasurare; ga4: boolean };

export type IntrariMasurare = { ga4: boolean; umami: boolean; umamiAsteaptaAcordul: boolean };

/** Mesajul opririi pe S-C. */
export const MESAJ_S_C =
  "starea masurarii ar fi S-C (analitica proprie pornita fara sa astepte acordul din banner), pe care decizia 13 o exclude: domeniul se construieste fara UMAMI_* pana cand Umami porneste numai dupa acord";

/** GA4 ruleaza in starea data (bannerul poate exista si numai cu Umami, deci `.activa` nu ajunge). */
function gaPornit(stare: StareAnalitica): boolean {
  return stare.activa && stare.idGa4 !== null;
}

/** Intrarile, din aceleasi functii ca ce ruleaza pe site. */
export function intrariMasurare(
  operator: Operator | null = OPERATOR,
  mediu: MediuAnalitica = process.env,
  umamiAsteaptaAcordul: boolean = UMAMI_ASTEAPTA_ACORDUL,
): IntrariMasurare {
  return {
    ga4: gaPornit(stareAnalitica(operator, idGa4(mediu.NEXT_PUBLIC_GA4_ID), mediu)),
    umami: stareAnaliticaProprie(mediu, operatorComplet(operator)).activa,
    umamiAsteaptaAcordul,
  };
}

/** Starea, din intrari date. Arunca pe S-C. */
export function masurareDin(intrari: IntrariMasurare): Masurare {
  if (intrari.umami && !intrari.umamiAsteaptaAcordul) {
    throw new Error(MESAJ_S_C);
  }
  if (intrari.umami) return { stare: "S-B", ga4: intrari.ga4 };
  if (intrari.ga4) return { stare: "S-GA4", ga4: true };
  return { stare: "S0", ga4: false };
}

/** Starea masurarii pe domeniul construit. Arunca pe S-C. */
export function stareMasurare(operator: Operator | null = OPERATOR, mediu: MediuAnalitica = process.env): StareMasurare {
  return masurareDin(intrariMasurare(operator, mediu)).stare;
}

/** Cheile de conditie active intr-o stare. */
export function conditiiActive(m: Masurare, linkedin: boolean = false): ReadonlySet<ConditieMasurare> {
  const active = new Set<ConditieMasurare>();
  if (m.stare === "S0") active.add("s0");
  if (m.stare === "S-GA4" || m.stare === "S-B") {
    active.add("banner");
    active.add("activ");
  }
  if (m.stare === "S-B") {
    active.add("umami");
    active.add("umami-b");
  }
  if (m.ga4) active.add("ga4");
  if (linkedin) active.add("linkedin");
  return active;
}
