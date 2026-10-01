// Rutele editiei `en` (site-ul international, la radacina): agregatorul grupurilor.
//
// Aici nu se scrie nicio ruta. Fiecare grup are fisierul lui (`rute-en-<grup>.ts`), cu marcajul feliei care il
// umple, ca feliile de pagini din valuri diferite sa scrie in fisiere disjuncte. Ordinea grupurilor de mai jos e
// ordinea din harta de site si din cautare.
import type { RutaEditie } from "./rute";
import { RUTE_EN_JURIDIC } from "./rute-en-juridic";
import { RUTE_EN_NUCLEU } from "./rute-en-nucleu";
import { RUTE_EN_PRODUS } from "./rute-en-produs";
import { RUTE_EN_REFERINTA } from "./rute-en-referinta";
import { RUTE_EN_SEGMENTE } from "./rute-en-segmente";

export const RUTE_EN: RutaEditie<"en">[] = [
  ...RUTE_EN_NUCLEU,
  ...RUTE_EN_PRODUS,
  ...RUTE_EN_SEGMENTE,
  ...RUTE_EN_REFERINTA,
  ...RUTE_EN_JURIDIC,
];
