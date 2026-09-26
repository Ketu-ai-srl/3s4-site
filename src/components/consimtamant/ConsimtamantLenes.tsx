"use client";

// Bannerul, cerut in pagina numai cand chiar se randeaza (planul valului S4, §8.5 si §10).
//
// `PunctConsimtamant` il randeaza numai cu analitica pornita. Un import static l-ar fi pus, cu tot
// codul lui (textele, evidenta, oprirea GA4), in bucata comuna a layout-ului, deci pe FIECARE pagina,
// si cu analitica oprita. `lazy` il muta intr-o bucata separata, pe care browserul o cere abia cand
// componenta se randeaza; fara analitica, bucata nu se cere niciodata. Proba:
// tests/browser/comutator.spec.ts, pe JavaScript-ul incarcat de fiecare ruta.
//
// Pe server bucata se randeaza intreaga (constructia statica asteapta granita Suspense), deci
// bannerul si legatura raman in HTML-ul servit. Granita proprie, cu `fallback` null, tine asteptarea
// bucatii la banner: fara ea, o bucata inca nedescarcata ar amana hidratarea granitei de deasupra.

import { Suspense, lazy } from "react";
import type { ConsimtamantProps } from "./Consimtamant";

const Consimtamant = lazy(() => import("./Consimtamant"));

export default function ConsimtamantLenes(props: ConsimtamantProps) {
  return (
    <Suspense fallback={null}>
      <Consimtamant {...props} />
    </Suspense>
  );
}
