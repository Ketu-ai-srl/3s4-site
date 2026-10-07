// Formula calculatorului de pe preturi si formatarea cifrelor (fisa `preturi.md` §6b, dedusa pe
// referinta si verificata acolo pe 16 combinatii, la ambele latimi). Functii pure: le folosesc
// componenta si probele, deci o schimbare aici se vede in amandoua.
//
//   ore            = persoane x minute / 60 x zile lucratoare      (exacte; se rotunjesc numai la afisare)
//   bani           = ore x tarif          (pe orele EXACTE; se rotunjesc numai la afisare)
//   plan           = primul pachet ale carui conturi ajung pentru persoane (5 / 10 / 20); peste
//                    cel mai mare niciunul (null), iar iesirea trimite la 3S Enterprise
//   ore-echivalent = rotunjire(pretul planului / tarif x 10) / 10
//
// Cu pretul de astazi (0 RON, decizia D3) ultimul rezultat e 0 h: calculul nu promite nimic, doar
// pune pretul langa timpul pe care vizitatorul spune ca il pierde acum.
//
// DE CE ORELE EXACTE, desi referinta inmultea orele rotunjite: rotunjirea inainte de inmultire muta costul
// pana la 9% fata de datele introduse (1 coleg x 10 min x 22 de zile = 3,67 h; la 5 EUR/h costul e 18,3, iar
// formula veche afisa 20, adica 4 h x 5). Banii se afiseaza intregi, cu separator de mii ("2.200", "2,200" pe EN).
//
// ORELE AFISATE, pe editie. Pe editiile en si ro-MD (3s.md, 3s.com.ro): sub 100 cu o zecimala, de la 100 intregi, cu
// separatorul de mii al editiei (`formatOreZecimal`), ca inmultirea din fraza sa se poata verifica pe ecran: la 1 coleg,
// 10 min si 5 EUR/h fraza spune 18 EUR langa 3,7 h (3,7 x 5 = 18,5), nu langa 4 h (4 x 5 = 20). Editia ro-RO pastreaza
// orele intregi (`formatOre`), fiindca HTML-ul ei e fixat de proba de invarianta RO.

import type { Cursor, Perioada, Plan } from "@/content/preturi";

export type Intrari = { persoane: number; minute: number; tarif: number };

/** Orele pe luna petrecute cautand acte, exacte (fara rotunjire: o face numai afisarea). */
export function oreCautare(persoane: number, minute: number, zileLucratoare: number): number {
  return ((persoane * minute) / 60) * zileLucratoare;
}

/** Valoarea acelor ore, la tariful dat (pe orele exacte). */
export function valoareOre(ore: number, tarif: number): number {
  return ore * tarif;
}

/**
 * Pachetul potrivit numarului de persoane: primul cu destule conturi. Cand nici cel mai mare nu
 * ajunge, null: runda 1 a criticului a masurat recomandarea pachetului cel mare (azi Business) la
 * 50 de persoane, adica un pachet de 20 de conturi recomandat unei echipe care nu incape in el.
 */
export function planPentru(persoane: number, planuri: readonly Plan[]): Plan | null {
  const ordonate = [...planuri].sort((a, b) => a.conturi - b.conturi);
  return ordonate.find((p) => persoane <= p.conturi) ?? null;
}

/** Pretul planului, spus in ore din aceeasi munca, cu o zecimala. */
export function oreEchivalent(pret: number, tarif: number): number {
  if (tarif <= 0) return 0;
  return Math.round((pret / tarif) * 10) / 10;
}

export type Rezultat = {
  ore: number;
  bani: number;
  /** null: echipa nu incape in niciun pachet. */
  plan: Plan | null;
  /** Pretul si orele echivalente exista doar cand exista pachet. */
  pret: number | null;
  oreEchivalent: number | null;
};

export function calculeaza(
  intrari: Intrari,
  perioada: Perioada,
  planuri: readonly Plan[],
  zileLucratoare: number,
): Rezultat {
  const ore = oreCautare(intrari.persoane, intrari.minute, zileLucratoare);
  const plan = planPentru(intrari.persoane, planuri);
  const bani = valoareOre(ore, intrari.tarif);
  if (plan === null) return { ore, bani, plan, pret: null, oreEchivalent: null };
  const pret = plan.pret[perioada];
  return { ore, bani, plan, pret, oreEchivalent: oreEchivalent(pret, intrari.tarif) };
}

/**
 * Banii, cu punct la mii ("3.850", "156.200"), ca la referinta. Scris de mana, nu prin `Intl`:
 * serverul si navigatorul pot avea date locale diferite, iar o cifra care difera intre HTML-ul
 * servit si randarea din browser strica hidratarea. Separatorul e un parametru al editiei, cu
 * implicitul romanesc (punctul).
 */
export function formatBani(n: number, separatorMii: string = "."): string {
  const semn = n < 0 ? "-" : "";
  return semn + String(Math.abs(Math.round(n))).replace(/\B(?=(\d{3})+(?!\d))/g, separatorMii);
}

/**
 * Orele, rotunjite la ora intreaga, cu separator de mii ca banii ("2.200"; pe EN "2,200"). La referinta orele
 * n-aveau separator ("1155 h"), iar in aceeasi fraza banii il aveau: doua forme pentru cifre vecine. Forma editiei
 * ro-RO; editiile en si ro-MD folosesc `formatOreZecimal`.
 */
export function formatOre(n: number, separatorMii: string = "."): string {
  return formatBani(n, separatorMii);
}

/** Pragul de la care orele se afiseaza intregi pe editiile en si ro-MD; sub el, cu o zecimala. */
export const PRAG_ORE_INTREGI = 100;

/** Valoarea orelor asa cum se afiseaza pe editiile en si ro-MD: sub prag la o zecimala, de la prag la ora intreaga. */
export function oreAfisate(n: number): number {
  return Math.abs(n) < PRAG_ORE_INTREGI ? Math.round(n * 10) / 10 : Math.round(n);
}

/**
 * Orele pe editiile en si ro-MD: sub 100 cu o zecimala ("3,7"; pe EN "3.7"), de la 100 in sus intregi, cu separatorul
 * de mii al editiei ("2.200"; pe EN "2,200"). O valoare care iese intreaga dupa rotunjire se scrie fara zecimala ("22",
 * nu "22,0"), ca la `formatZecimal`. Numeralul romanesc se acorda cu valoarea afisata (`oreAfisate`): "36,7 ore", dar
 * "22 de ore".
 */
export function formatOreZecimal(n: number, separatorMii: string = ".", semnZecimal: string = ","): string {
  const v = oreAfisate(n);
  return Number.isInteger(v) ? formatBani(v, separatorMii) : v.toFixed(1).replace(".", semnZecimal);
}

/**
 * O zecimala cu virgula ("1,6"); un numar intreg ramane fara zecimala ("0"). Semnul zecimal e un
 * parametru al editiei, cu implicitul romanesc (virgula).
 */
export function formatZecimal(n: number, semnZecimal: string = ","): string {
  const r = Math.round(n * 10) / 10;
  return Number.isInteger(r) ? String(r) : r.toFixed(1).replace(".", semnZecimal);
}

/** Formatul cifrelor din calculator, pe editie. */
export type FormatCifre = {
  bani: (n: number) => string;
  ore: (n: number) => string;
  zecimal: (n: number) => string;
};

/** Formatul romanesc: punct la mii (si la ore), virgula zecimala. */
export const FORMAT_ROMANESC: FormatCifre = {
  bani: (n) => formatBani(n),
  ore: (n) => formatOre(n),
  zecimal: (n) => formatZecimal(n),
};

/** Valorile pe care le poate lua un cursor. */
export function valoriCursor(c: Cursor): number[] {
  const valori: number[] = [];
  for (let v = c.min; v <= c.max + 1e-9; v += c.pas) valori.push(Math.round(v * 1000) / 1000);
  return valori;
}

/** Valoarea e pe grila cursorului (intre capete, la un numar intreg de pasi de la minim). */
export function ePeGrila(c: Cursor, v: number): boolean {
  if (v < c.min || v > c.max) return false;
  const pasi = (v - c.min) / c.pas;
  return Math.abs(pasi - Math.round(pasi)) < 1e-9;
}
