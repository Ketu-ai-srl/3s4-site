// Tabelul pietelor, cutia "modificari recente" si jurnalul de pe /e-facturare.
//
// Fiecare rand poarta cheia sursei lui oficiale (`surse.ts`); pagina afiseaza legatura langa
// valoare. Textul e scris de noi din documentul oficial, nu tradus din alta pagina.
// Ordinea randurilor e ordinea masurata a tabelului referintei, fara tarile neverificate.

import { SURSE, type CheieSursa } from "./surse";

export type Piata = {
  /** Ancora randului (`#germania`), tinta etichetelor din jurnal. */
  ancora: string;
  tara: string;
  /** Rol: ce obligatie se aplica. */
  ce: string;
  /** Rol: de cand, cu etapele. */
  cand: string;
  /** Rol: formatul si canalul. */
  format: string;
  surse: CheieSursa[];
};

export const PIETE: Piata[] = [
  {
    ancora: "germania",
    tara: "Germania",
    ce: "Orice firmă germană trebuie să poată primi e-facturi; emiterea devine obligatorie treptat, după cifra de afaceri.",
    cand: "Primire din 1 ianuarie 2025. Factura pe hârtie sau PDF la emitere e permisă până la 31 decembrie 2026, iar sub 800.000 EUR cifră de afaceri, până la finalul lui 2027.",
    format: "XRechnung sau ZUGFeRD 2.0.1+, pe EN 16931",
    surse: ["de"],
  },
  {
    ancora: "franta",
    tara: "Franța",
    ce: "Toate firmele vizate primesc e-facturi; emiterea pornește cu firmele mari și cu cele de mărime intermediară.",
    cand: "Firmele mari și intermediare emit din 1 septembrie 2026, dată de la care toate primesc. IMM-urile și microîntreprinderile emit din 1 septembrie 2027.",
    format: "Prin platforme agreate de administrația fiscală",
    surse: ["fr"],
  },
  {
    ancora: "polonia",
    tara: "Polonia",
    ce: "Facturile structurate se emit în KSeF, sistemul național al Ministerului de Finanțe.",
    cand: "1 februarie 2026 pentru vânzări de peste 200 mil. PLN în 2024; 1 aprilie 2026 pentru ceilalți. Unele facilități țin până la finalul lui 2026.",
    format: "Structura FA(3), prin KSeF",
    surse: ["pl"],
  },
  {
    ancora: "belgia",
    tara: "Belgia",
    ce: "Între firmele belgiene plătitoare de TVA circulă doar e-facturi structurate; un PDF pe e-mail nu mai este suficient.",
    cand: "Din 1 ianuarie 2026. Toleranța generală s-a încheiat după primele trei luni; la autofacturare a ținut până la 30 iunie 2026.",
    format: "Rețeaua Peppol",
    surse: ["be", "beToleranta"],
  },
  {
    ancora: "romania",
    tara: "România",
    ce: "Facturile dintre firmele stabilite în România trec prin RO e-Factura, în termenul legal de transmitere. SAF-T (D406) se depune separat.",
    cand: "Raportare din 1 ianuarie 2024; din 1 iulie 2024 sunt facturi doar cele trecute prin sistem. D406: mari 2022, mijlocii 2023, mici 2025.",
    format: "XML EN 16931, RO_CIUS; D406 lunar/trimestrial",
    surse: ["roGhid", "roTermen", "roSaft"],
  },
  {
    ancora: "uniunea-europeana",
    tara: "UE (ViDA)",
    ce: "Directiva (UE) 2025/516 aduce facturarea electronică și raportarea digitală pentru livrările dintre statele membre.",
    cand: "Statele membre aplică noile reguli de la 1 iulie 2030 (art. 6 alin. (5) din directivă).",
    format: "Standardul european EN 16931",
    surse: ["ueVida"],
  },
];

/** Tara al carei nume e legatura in tabel (pe referinta: randul Romaniei). */
export const ANCORA_EVIDENTIATA = "romania";

export type Modificare = {
  /** Data schimbarii, ISO. */
  data: string;
  /** Data in cuvinte, cum apare pe pagina. */
  dataText: string;
  /** Codul tarii (eticheta mono), legat de ancora din tabel. */
  cod: string;
  ancora: string;
  text: string;
  sursa: CheieSursa;
};

/** Jurnalul: schimbarile datate din 2026, cea mai noua prima. */
export const JURNAL: Modificare[] = [
  {
    data: "2026-09-01",
    dataText: "1 septembrie 2026",
    cod: "FR",
    ancora: "franta",
    text: "Firmele mari și intermediare emit prin platformele agreate, iar toate firmele vizate primesc. IMM-urile emit din 1 septembrie 2027.",
    sursa: "fr",
  },
  {
    data: "2026-04-01",
    dataText: "1 aprilie 2026",
    cod: "BE",
    ancora: "belgia",
    text: "La trei luni de la start se închide toleranța generală. La autofacturare, când clientul emite factura în locul furnizorului, amenzile rămân suspendate până la 30 iunie 2026.",
    sursa: "beToleranta",
  },
  {
    data: "2026-04-01",
    dataText: "1 aprilie 2026",
    cod: "PL",
    ancora: "polonia",
    text: "Pragul de 200 mil. PLN nu mai contează: de la această dată, orice firmă poloneză emite facturile structurate în KSeF, sistemul național al Ministerului de Finanțe.",
    sursa: "pl",
  },
  {
    data: "2026-02-01",
    dataText: "1 februarie 2026",
    cod: "PL",
    ancora: "polonia",
    text: "KSeF 2.0 intră în producție; primele obligate să emită prin el sunt firmele cu vânzări de peste 200 mil. PLN în 2024.",
    sursa: "pl",
  },
  {
    data: "2026-01-01",
    dataText: "1 ianuarie 2026",
    cod: "BE",
    ancora: "belgia",
    text: "Între firmele belgiene plătitoare de TVA circulă de acum numai e-facturi structurate, trimise prin rețeaua Peppol; un PDF atașat la e-mail nu mai ține loc de factură.",
    sursa: "be",
  },
];

/** Cutia de sub tabel: cele mai noi trei schimbari, pe scurt. */
export const MODIFICARI_RECENTE: { text: string; sursa: CheieSursa }[] = [
  { text: "1 septembrie 2026, FR: firmele mari și intermediare emit prin platformele agreate.", sursa: "fr" },
  { text: "1 aprilie 2026, PL: pragul de vânzări dispare, KSeF e pentru toate firmele.", sursa: "pl" },
  { text: "1 aprilie 2026, BE: toleranța generală de la start ia sfârșit.", sursa: "beToleranta" },
];

export function sursa(cheie: CheieSursa) {
  return SURSE[cheie];
}
