// `BreadcrumbList` pentru o pagina interioara, ca bloc JSON-LD in HTML-ul servit (componenta de
// server), gata de pus de feliile S4-3 in pagina lor:
//
//     <DateFirAriadnei niveluri={NIVELURI} />
//
// unde `NIVELURI` e lista `{ nume, cale }` de la start la pagina curenta, cu numele scrise ca in
// meniul site-ului. NUMAI pe paginile fara `FirPagina`: primitiva fundatiei emite deja propriul
// `BreadcrumbList`, iar doua pe aceeasi pagina ar fi redundante. Sub doua niveluri construirea se
// opreste (`grafFirAriadnei`).

import { grafFirAriadnei, type NivelFirAriadnei } from "./date-structurate";
import JsonLd from "./JsonLd";

export default function DateFirAriadnei({ niveluri }: { niveluri: NivelFirAriadnei[] }) {
  return <JsonLd date={grafFirAriadnei(niveluri)} />;
}
