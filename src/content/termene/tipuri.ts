// Tipurile datelor verificatorului de termene de pastrare (instrumente__termene-pastrare.md).
//
// Un rand = un tip de act intr-o tara. Randul CONFIRMAT are valoare, momentul de la care curge
// termenul, temeiul legal si cel putin o sursa PRIMARA (portalul legislativ oficial, monitorul
// oficial, autoritatea fiscala sau autoritatea arhivelor), deschisa si citita la data din
// `DATA_CITIRII`. Randul NECONFIRMAT are `valoare: null` si spune de ce nu dam o cifra; poate avea
// si surse, cand motivul insusi se sprijina pe un text de lege.
//
// Cele 7 tipuri sunt aceleasi pentru toate tarile si stau in aceeasi ordine: forma panoului si a
// tabelului de tiparit depinde de ea.

export type CodTip = "facturi" | "registre" | "state" | "personal" | "declaratii" | "contracte" | "extrase";

export type TipAct = {
  cod: CodTip;
  /** Numele randului in panou si in capul coloanei din tabelul de tiparit. */
  nume: string;
};

export const TIPURI: readonly TipAct[] = [
  { cod: "facturi", nume: "Facturi de intrare și ieșire" },
  { cod: "registre", nume: "Evidența contabilă: registre și bilanțul anual" },
  { cod: "state", nume: "State de salarii" },
  { cod: "personal", nume: "Dosarele angajaților" },
  { cod: "declaratii", nume: "Declarații la fisc și acte justificative" },
  { cod: "contracte", nume: "Contractele firmei" },
  { cod: "extrase", nume: "Extrase bancare, ordine de plată și chitanțe" },
];

export type SursaPrimara = {
  /** Ce e documentul si cine il publica; e textul legaturii. */
  eticheta: string;
  /** Adresa completa, pe https. */
  url: string;
};

export type RandTermen = {
  tip: CodTip;
  /** Termenul scris ca pe ecran ("5 ani", "5-10 ani"); `null` = neconfirmat. */
  valoare: string | null;
  /** De cand curge termenul. Obligatoriu la randul confirmat. */
  inceput?: string;
  /** Temeiul legal, in cuvintele noastre, cu articolele citate. Obligatoriu la randul confirmat. */
  temei?: string;
  /** De ce randul nu are o cifra. Obligatoriu la randul neconfirmat. */
  motiv?: string;
  surse: SursaPrimara[];
};

export type CodTara = "ro" | "md";

export type Tara = {
  cod: CodTara;
  nume: string;
  randuri: RandTermen[];
};

/** Cate randuri au o valoare confirmata. */
export function numarConfirmate(tara: Tara): number {
  return tara.randuri.filter((r) => r.valoare !== null).length;
}

/** Numele tipului dupa cod. */
export function numeTip(cod: CodTip): string {
  const tip = TIPURI.find((t) => t.cod === cod);
  if (!tip) throw new Error("tip de act necunoscut: " + cod);
  return tip.nume;
}
