// Intrebarile frecvente ale paginilor de produs (felia `produs`): o singura forma pentru textul de
// pe pagina si pentru datele structurate `FAQPage`, ca cele doua sa nu poata diverge.
//
// DE CE AICI, si nu in `src/components/seo/`: dosarul acela e piesa inghetata a feliei de SEO si
// are graful intrebarilor numai pentru start (`nodIntrebariAcasa`). Aici se aduna doar DATELE unei
// pagini interioare, in forma pe care o citeste componenta existenta `JsonLd`; identificatorul
// urmeaza regula startului (`<adresa paginii>#intrebari`), deci fiecare pagina are un singur @id,
// acelasi la fiecare construire.

import { iduri, type GrafJsonLd } from "@/components/seo/date-structurate";
import { adresaSite, urlAbsolut } from "@/lib/site";

export type IntrebareFrecventa = {
  intrebare: string;
  /** Text simplu: acelasi sir apare pe pagina si in datele structurate. */
  raspuns: string;
};

export type BlocIntrebari = {
  titlu: string;
  intrebari: IntrebareFrecventa[];
};

/** Graful `FAQPage` al unei pagini interioare, cu intrebarile exact cum stau pe pagina. */
export function grafIntrebariPagina(cale: string, bloc: BlocIntrebari, baza: string = adresaSite()): GrafJsonLd {
  const pagina = urlAbsolut(cale, baza);
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "FAQPage",
        "@id": pagina + "#intrebari",
        url: pagina,
        name: bloc.titlu,
        inLanguage: "ro-RO",
        isPartOf: { "@id": iduri(baza).site },
        mainEntity: bloc.intrebari.map((i) => ({
          "@type": "Question",
          name: i.intrebare,
          acceptedAnswer: { "@type": "Answer", text: i.raspuns },
        })),
      },
    ],
  };
}
