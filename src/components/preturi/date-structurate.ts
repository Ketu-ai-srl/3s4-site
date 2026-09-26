// Datele structurate proprii paginii de preturi: intrebarile frecvente (`FAQPage`), exact cele de pe
// pagina. Firul (`BreadcrumbList`) il emite deja `FirPagina`, din eroul interior, o singura data.
//
// UN SINGUR @id PER ENTITATE (planul valului S4, §8.2): nodul are identificatorul lui, derivat din
// adresa paginii, si trimite la site prin identificatorul comun (`iduri`), fara sa-l redeclare.
// Graful se construieste cu tipurile si identificatorii feliei de SEO (`src/components/seo/`);
// blocul il pune in pagina componenta `JsonLd` a aceleiasi felii.

import { iduri, type GrafJsonLd } from "@/components/seo/date-structurate";
import { CALE_PRETURI, INTREBARI_PRETURI } from "@/content/preturi";
import { adresaSite, urlAbsolut } from "@/lib/site";

export function grafIntrebariPreturi(baza: string = adresaSite()): GrafJsonLd {
  const adresa = urlAbsolut(CALE_PRETURI, baza);
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "FAQPage",
        "@id": adresa + "#intrebari",
        url: adresa,
        name: INTREBARI_PRETURI.titlu,
        inLanguage: "ro-RO",
        isPartOf: { "@id": iduri(baza).site },
        mainEntity: INTREBARI_PRETURI.intrebari.map((i) => ({
          "@type": "Question",
          name: i.intrebare,
          acceptedAnswer: { "@type": "Answer", text: i.raspuns },
        })),
      },
    ],
  };
}
