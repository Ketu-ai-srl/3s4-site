// Intrebarile frecvente ale paginilor de solutii (solutii__sablon.md S6, solutii.md S7): h2, apoi
// acordeonul fundatiei in varianta `sector` (randuri de 880 x 55, raza 12, unul singur deschis,
// chenarul trece in albastru in 0,15 s, raspunsul apare in 0,25 s). 4 randuri pe sector, 7 pe hub.
//
// DATELE STRUCTURATE: un nod `FAQPage` cu exact intrebarile si raspunsurile de pe pagina, in HTML-ul
// servit, prin componenta `JsonLd` a feliei de SEO. `@id` e adresa paginii plus `#intrebari`, deci
// unul singur pe entitate; pagina e legata de site prin `@id`-ul lui (`iduri().site`), fara sa-l
// redeclare. Raspunsurile acordeonului nu sunt in HTML cat sunt inchise, deci nodul e singurul loc
// din care un robot le citeste fara sa apese.

import Acordeon from "@/components/primitive/Acordeon";
import CapBloc from "@/components/primitive/CapBloc";
import JsonLd from "@/components/seo/JsonLd";
import { iduri, type GrafJsonLd } from "@/components/seo/date-structurate";
import type { Intrebare } from "@/content/solutii/tipuri";
import { urlAbsolut } from "@/lib/site";
import s from "./solutii.module.css";

/** Graful `FAQPage` al unei pagini de solutii. */
export function grafIntrebari(cale: string, nume: string, intrebari: Intrebare[]): GrafJsonLd {
  const adresa = urlAbsolut(cale);
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "FAQPage",
        "@id": adresa + "#intrebari",
        url: adresa,
        name: nume,
        inLanguage: "ro-RO",
        isPartOf: { "@id": iduri().site },
        mainEntity: intrebari.map((q) => ({
          "@type": "Question",
          name: q.intrebare,
          acceptedAnswer: { "@type": "Answer", text: q.raspuns },
        })),
      },
    ],
  };
}

export type IntrebariSolutiiProps = {
  titlu: string;
  intrebari: Intrebare[];
  /** Calea paginii si numele nodului din datele structurate. */
  cale: string;
  numeDate: string;
};

export default function IntrebariSolutii({ titlu, intrebari, cale, numeDate }: IntrebariSolutiiProps) {
  return (
    <section className={s.sectiune}>
      <div className="container-site">
        <div className={s.coloana}>
          <CapBloc titlu={titlu} margineJos={20} />
          <Acordeon varianta="sector" elemente={intrebari} />
        </div>
      </div>
      <JsonLd date={grafIntrebari(cale, numeDate, intrebari)} />
    </section>
  );
}
