// Autoritatile la care se poate depune plangere (GDPR art. 13 alin. (2) lit. d); Legea 195/2024,
// art. 13 alin. (2) lit. d); G-MD-10): cate una pe jurisdictie, numite corect si tinute SEPARAT, ca
// un vizitator din Republica Moldova sa nu fie trimis la autoritatea romana si invers.
//
// Datele de contact sunt cele publicate de autoritati pe site-urile lor, citite pe 24.09.2026:
// dataprotection.ro (pagina de contact) si datepersonale.md (pagina principala). Telefonul nu se
// scrie: se schimba mai des decat adresa, iar legea cere autoritatea si calea de plangere, nu un
// apel. Inainte de publicare, datele se reiau de pe cele doua site-uri (docs/ziua-operatorului.md).

export type Jurisdictie = "ro" | "md";

export type Autoritate = {
  jurisdictie: Jurisdictie;
  /** Unde se aplica, spus cum il citeste vizitatorul. */
  pentru: string;
  nume: string;
  sigla: string;
  adresa: string;
  email: string;
  site: string;
};

export const AUTORITATI: Record<Jurisdictie, Autoritate> = {
  ro: {
    jurisdictie: "ro",
    pentru: "România și Uniunea Europeană",
    nume: "Autoritatea Națională de Supraveghere a Prelucrării Datelor cu Caracter Personal",
    sigla: "ANSPDCP",
    adresa: "B-dul G-ral. Gheorghe Magheru 28-30, sector 1, cod poștal 010336, București, România",
    email: "anspdcp@dataprotection.ro",
    site: "https://www.dataprotection.ro",
  },
  md: {
    jurisdictie: "md",
    pentru: "Republica Moldova",
    nume: "Centrul Național pentru Protecția Datelor cu Caracter Personal",
    sigla: "CNPDCP",
    adresa: "str. Serghei Lazo nr. 48, MD-2004, mun. Chișinău, Republica Moldova",
    email: "centru@datepersonale.md",
    site: "https://datepersonale.md",
  },
};
