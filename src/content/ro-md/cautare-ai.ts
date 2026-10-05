// Pagina P03 a editiei `ro-MD` (`/ro/functionalitati/cautare-ai` pe 3s.md): cautarea in documente, cu sursa citata.
// Perechea EN e `/features/search` (`../en/features-search.ts`).
//
// SURSA: fisa paginii (ro-md/cautare-ai.md), front matter si corpul pana la resursele nepublicate. Pagina servita
// compune povestea cinema (decizia 53, intrebarea 5 varianta a) cu textul din `cautare-ai-componente.ts`; modulul de
// fata ramane sursa pentru metadata, nodul WebPage, textul precompletat si registrul de afirmatii. Pagina RO n-are
// sectiuni-intrebare, deci nici /ro: `sectiuni` urmeaza titlurile corpului fisei, in ordinea de citire.
//
// Ce NU spune pagina: pagina exacta ca fapt (in testare), timpi de raspuns, procente de acuratete, WhatsApp ca loc al
// intrebarilor (d49), hartia (poarta juridica 40-41).

import { iduri } from "@/components/seo/date-structurate";
import type { PaginaContinut } from "@/content/model/tipuri";
import { adresaSite } from "@/lib/site";

const BAZA = adresaSite();
const ID = iduri(BAZA);

/** Codul `ref` al paginii; caile si codurile stau in constante, nu in proza (poarta de limba citeste proza). */
const REF = "ro-md-cautare-ai";

const DESCRIERE =
  "Formulezi o întrebare despre documentele firmei și primești răspunsul cu documentul din care provine, ca să-l poți verifica.";

export const pagina: PaginaContinut = {
  cheie: "features-search",
  meta: { titlu: "Căutare AI în documentele firmei, cu sursa citată | 3S", descriere: DESCRIERE, cale: "/ro/functionalitati/cautare-ai" },
  h1: "Funcționalitate 01 · Căutare AI cu sursa citată",
  capsula:
    "Formulezi o întrebare despre documentele firmei și primești răspunsul cu documentul din care provine, ca să-l poți verifica. 3S răspunde la întrebările tale din conținutul documentelor firmei și indică sursa fiecărui răspuns. Îți răspunde o persoană din echipa 3S, în română sau în engleză.",
  sectiuni: [
    {
      cheie: "doi-ani-un-dosar",
      titlu: "Doi ani, un dosar",
      blocuri: [
        { paragrafe: ["Timp de doi ani, fiecare coleg care a lucrat cu utilajul a adăugat câte un fișier, fără să șteargă vreunul."] },
      ],
    },
    {
      cheie: "aceeasi-garantie",
      titlu: "Aceeași garanție, căutată de două ori",
      blocuri: [
        { paragrafe: ["În stânga, dosarele deschise pe rând. În dreapta, răspunsul cu documentul-sursă, pe care îl poți verifica."] },
      ],
    },
    {
      cheie: "citeste-sursa",
      titlu: "Citește doar sursa",
      blocuri: [
        { paragrafe: ["3S răspunde la întrebările tale din conținutul documentelor firmei și indică sursa fiecărui răspuns."] },
      ],
    },
  ],
  cta: {
    ref: REF,
    titluBloc: "Citește doar sursa",
    textWhatsapp:
      "Bună ziua, 3S. Am citit pagina despre căutarea cu sursa citată [ref:" + REF + "]. Aș dori să văd cum funcționează pe documentele firmei.",
    subiectEmail: "Întrebare 3S [ref:" + REF + "]",
  },
  jsonLd: [
    {
      "@type": "WebPage",
      "@id": BAZA + "/ro/functionalitati/cautare-ai#webpage",
      url: BAZA + "/ro/functionalitati/cautare-ai",
      name: "Căutare AI în documentele firmei, cu sursa citată",
      description: DESCRIERE,
      inLanguage: "ro-MD",
      isPartOf: { "@id": ID.site },
    },
  ],
  afirmatii: ["ro-md-arhiva-cu-sursa", "ro-md-engleza-si-pagina-in-testare", "ro-md-raspunde-o-persoana", "ro-md-canale-de-contact"],
};
