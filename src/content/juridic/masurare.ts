// STAREA MASURARII, din care se compun blocurile conditionate ale documentelor `md` (felia 73).
//
// Textul despre masurare si masurarea care ruleaza se citesc din ACELEASI intrari, deci nu se pot
// desparti: GA4 din `stareAnalitica` (`src/lib/analitica.ts`: operator complet si ID GA4) si analitica
// proprie (Umami) din `stareAnaliticaProprie` (`src/components/analitica/config.ts`: variabilele
// `UMAMI_*` si operator complet), plus un indicator de cod: porneste Umami numai dupa acordul din banner?
//
//   fara GA4, fara Umami                      -> S0     (blocurile `s0`)
//   GA4, fara Umami                           -> S-GA4  (`banner`, `ga4`, `activ`)
//   Umami activ, care asteapta acordul        -> S-B    (`banner`, `umami`, `umami-b`, `activ`, plus `ga4` daca e)
//   Umami activ, care NU asteapta acordul     -> S-C    construirea se OPRESTE (decizia 13: S-C nu se publica)
//
// `UMAMI_ASTEAPTA_ACORDUL` e azi `false`: codul porneste Umami fara sa astepte bannerul. Il aprinde felia
// care pune Umami dupa acord; pana atunci un domeniu cu operator `md` se construieste numai fara `UMAMI_*`
// (S0) sau cu GA4 singur (S-GA4). `linkedin` (pagina 3S de pe LinkedIn) nu tine de masurare; e un
// parametru al apelantului, implicit oprit.

import { stareAnaliticaProprie, type MediuAnalitica } from "@/components/analitica/config";
import { idGa4, stareAnalitica } from "@/lib/analitica";
import { OPERATOR, operatorComplet, type Operator } from "@/lib/operator";
import type { ConditieMasurare } from "./tipuri";

export type StareMasurare = "S0" | "S-GA4" | "S-B";

/** Porneste analitica proprie numai dupa acordul din banner? Azi nu (o aprinde felia de analitica). */
export const UMAMI_ASTEAPTA_ACORDUL = false;

export type Masurare = { stare: StareMasurare; ga4: boolean };

export type IntrariMasurare = { ga4: boolean; umami: boolean; umamiAsteaptaAcordul: boolean };

/** Mesajul opririi pe S-C. */
export const MESAJ_S_C =
  "starea masurarii ar fi S-C (analitica proprie pornita fara sa astepte acordul din banner), pe care decizia 13 o exclude: domeniul se construieste fara UMAMI_* pana cand Umami porneste numai dupa acord";

/** Intrarile, din aceleasi functii ca ce ruleaza pe site. */
export function intrariMasurare(
  operator: Operator | null = OPERATOR,
  mediu: MediuAnalitica = process.env,
  umamiAsteaptaAcordul: boolean = UMAMI_ASTEAPTA_ACORDUL,
): IntrariMasurare {
  return {
    ga4: stareAnalitica(operator, idGa4(mediu.NEXT_PUBLIC_GA4_ID)).activa,
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
