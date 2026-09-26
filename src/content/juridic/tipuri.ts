// Forma comuna a textelor juridice: un document are sectiuni cu o CHEIE stabila, iar fiecare
// sectiune are blocuri, eventual legate de o jurisdictie. Pagina care le randeaza (felia `juridic`)
// pune cheia in atributul cerut de porti - `data-art13` pe politica de confidentialitate (G-MD-01),
// `data-l284` pe politica de cookie-uri (G-MD-08) - si jurisdictia in `data-jurisdictie` (G-MD-10).

import type { Jurisdictie } from "./autoritati";

export type BlocJuridic = {
  /** `null` = se aplica tuturor vizitatorilor; altfel numai jurisdictiei numite. */
  jurisdictie: Jurisdictie | null;
  paragrafe: string[];
};

export type SectiuneJuridica = {
  cheie: string;
  titlu: string;
  blocuri: BlocJuridic[];
};

export type DocumentJuridic = {
  titlu: string;
  /** Paragraful de deschidere, inaintea sectiunilor. */
  introducere: string;
  sectiuni: SectiuneJuridica[];
};

/** Tot textul unui document, pentru probe: titlu, introducere si fiecare paragraf, in ordine. */
export function textIntreg(d: DocumentJuridic): string {
  return [d.titlu, d.introducere, ...d.sectiuni.flatMap((s) => [s.titlu, ...s.blocuri.flatMap((b) => b.paragrafe)])].join("\n");
}
