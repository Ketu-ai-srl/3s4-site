// Formula calculatorului de pe preturi si formatarea cifrelor (fisa `preturi.md` §6b, dedusa pe
// referinta si verificata acolo pe 16 combinatii, la ambele latimi). Functii pure: le folosesc
// componenta si probele, deci o schimbare aici se vede in amandoua.
//
//   ore            = rotunjire(persoane x minute / 60 x zile lucratoare)
//   bani           = ore x tarif          (pe orele deja rotunjite, ca la referinta)
//   plan           = primul pachet ale carui conturi ajung pentru persoane (5 / 10 / 20); peste
//                    cel mai mare niciunul (null), iar iesirea trimite la 3S Enterprise
//   ore-echivalent = rotunjire(pretul planului / tarif x 10) / 10
//
// Cu pretul de astazi (0 RON, decizia D3) ultimul rezultat e 0 h: calculul nu promite nimic, doar
// pune pretul langa timpul pe care vizitatorul spune ca il pierde acum.

import type { Cursor, Perioada, Plan } from "@/content/preturi";

export type Intrari = { persoane: number; minute: number; tarif: number };

/** Orele pe luna petrecute cautand acte. */
export function oreCautare(persoane: number, minute: number, zileLucratoare: number): number {
  return Math.round(((persoane * minute) / 60) * zileLucratoare);
}

/** Valoarea acelor ore, la tariful dat (pe orele deja rotunjite). */
export function valoareOre(ore: number, tarif: number): number {
  return ore * tarif;
}

/**
 * Pachetul potrivit numarului de persoane: primul cu destule conturi. Cand nici cel mai mare nu
 * ajunge, null: runda 1 a criticului a masurat "Se potriveste Pro" la 50 de persoane, adica un
 * pachet de 20 de conturi recomandat unei echipe care nu incape in el.
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
 * servit si randarea din browser strica hidratarea.
 */
export function formatBani(n: number): string {
  const semn = n < 0 ? "-" : "";
  return semn + String(Math.abs(Math.round(n))).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

/** Orele, fara separator de mii ("1155 h" la referinta). */
export function formatOre(n: number): string {
  return String(Math.round(n));
}

/** O zecimala cu virgula ("1,6"); un numar intreg ramane fara zecimala ("0"). */
export function formatZecimal(n: number): string {
  const r = Math.round(n * 10) / 10;
  return Number.isInteger(r) ? String(r) : r.toFixed(1).replace(".", ",");
}

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
