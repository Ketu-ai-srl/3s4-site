// Pagina de preturi a editiei `ro-MD` (P08, `/ro/preturi` pe 3s.md), transcrisa din fisa ei de continut
// (ro-md/preturi.md), pana la sectiunea de resurse nepublicate. Perechea EN e `/pricing` (`../en/pricing.ts`). Grila e
// decizia 18 (Starter 90 / Pro 150 / Business 240 EUR pe luna; anual 75 / 125 / 200; 5 / 10 / 20 de conturi;
// Enterprise de la 800, contract anual), propozitia TVA e decizia 24, pilotul are 14 zile (decizia 65).
//
// Sumele sunt scrise aici, in euro, ca pe EN, si nu vin din `src/content/preturi.ts` (grila RON a site-ului RO).
// Separatorul de mii e punctul (1.500), ca in romana.
//
// Pagina servita compune componentele perechii RO (decizia 53) cu textul din `preturi-componente.ts`; modulul de fata
// ramane sursa pentru metadata, nodul WebPage, textul precompletat si registrul de afirmatii.
//
// CE NU INTRA, ca pe EN: paragraful despre hartie din "Cum obtin o oferta?" (poarta juridica a deciziei 40);
// e-mailul din aceeasi sectiune (varianta de dinainte de P-40); `Offer` si `priceCurrency` in JSON-LD.

import { iduri } from "@/components/seo/date-structurate";
import type { PaginaContinut } from "@/content/model/tipuri";
import { adresaSite } from "@/lib/site";

const BAZA = adresaSite();
const ID = iduri(BAZA);

/** Grila decisa (decizia 18), in forma romaneasca a cifrelor. */
export const GRILA_RO_MD = [
  { plan: "Starter", conturi: "5", lunar: "90", anualPeLuna: "75", anualPeAn: "900" },
  { plan: "Pro", conturi: "10", lunar: "150", anualPeLuna: "125", anualPeAn: "1.500" },
  { plan: "Business", conturi: "20", lunar: "240", anualPeLuna: "200", anualPeAn: "2.400" },
] as const;

/** Propozitia TVA a deciziei 24, cuvant cu cuvant. */
export const PROPOZITIE_TVA_RO_MD = "Prețurile nu includ TVA; acolo unde se aplică TVA, aceasta se adaugă pe factură.";

const TITLU = "Prețurile 3S: Starter, Pro, Business și Enterprise";
const DESCRIERE =
  "Prețurile 3S pentru întreaga firmă, în euro, fără TVA: Starter 90, Pro 150 și Business 240 EUR pe lună; Enterprise de la 800 EUR. Pilot gratuit de 14 zile.";

export const pagina: PaginaContinut = {
  cheie: "pricing",
  meta: { titlu: TITLU, descriere: DESCRIERE, cale: "/ro/preturi" },
  h1: "Prețurile 3S: patru pachete, în euro",
  capsula:
    "3S are patru pachete, cu prețuri pentru întreaga firmă, în euro, fără TVA: Starter costă 90 EUR, Pro 150 EUR și Business 240 EUR pe lună, pentru 5, 10 și 20 de conturi, iar Enterprise pornește de la 800 EUR pe lună. Prețurile sunt orientative. Orice colaborare începe cu un pilot asistat, gratuit, de 14 zile, pe documentele firmei.",
  sectiuni: [
    {
      cheie: "pachete",
      titlu: "Ce pachete are 3S?",
      blocuri: [
        {
          paragrafe: [
            "Prețurile sunt calculate pentru întreaga firmă, în euro, fără TVA. Starter, Pro și Business au aceleași funcții; fiecare include alt număr de conturi de utilizator.",
          ],
          tabel: {
            forma: "cu-antet",
            titlu: "Pachetele 3S și prețurile lor",
            antet: ["Pachet", "Conturi de utilizator", "Plata lunară (EUR pe lună)", "Plata anuală (EUR pe lună)", "Plata anuală (EUR pe an)"],
            randuri: [
              ...GRILA_RO_MD.map((g) => [g.plan, g.conturi, g.lunar, g.anualPeLuna, g.anualPeAn]),
              ["Enterprise", "Peste 20", "Numai contract anual", "De la 800", "De la 9.600"],
            ],
          },
          dupa: [
            "Enterprise pornește de la 800 EUR pe lună, cu contract anual, pentru peste 20 de conturi; pentru acest pachet îți transmitem o ofertă. Detaliile sunt pe pagina [Enterprise](/ro/enterprise).",
          ],
        },
      ],
    },
    {
      cheie: "tva",
      titlu: "Prețurile includ TVA?",
      blocuri: [{ paragrafe: ["Nu. Prețurile sunt exprimate în euro și nu includ TVA; acolo unde se aplică TVA, aceasta se adaugă pe factură."] }],
    },
    {
      cheie: "reduceri",
      titlu: "Există reduceri?",
      blocuri: [
        {
          paragrafe: [
            "Da, la plata anuală: două luni sunt gratuite. La Starter, Pro și Business, plata anuală înseamnă 10 plăți lunare pentru 12 luni, adică un preț cu 16,7% mai mic decât la plata lunară. Prima lună după pilot se facturează la prețul din grilă, fără reducere de pilot.",
          ],
        },
      ],
    },
    {
      cheie: "plata-si-oferta",
      titlu: "Când se face plata și cât este valabilă o ofertă?",
      blocuri: [
        {
          paragrafe: [
            "Factura se achită în 14 zile de la data emiterii. Abonamentele se facturează în avans, lunar sau anual. Oferta noastră scrisă și prețul din ea sunt valabile 30 de zile de la data la care o emitem.",
          ],
        },
      ],
    },
    {
      cheie: "orientative",
      titlu: "De ce sunt prețurile orientative?",
      blocuri: [
        {
          paragrafe: [
            "Pachetul potrivit depinde de numărul de persoane care vor folosi 3S. După pilot, confirmăm pachetul și prețul într-o ofertă scrisă, valabilă 30 de zile.",
          ],
        },
      ],
    },
    {
      cheie: "pilot",
      titlu: "Ce este un pilot asistat?",
      ancoraInainte: "pilot",
      blocuri: [
        {
          paragrafe: [
            "Pilotul asistat înseamnă 14 zile de lucru gratuit în 3S, pe documentele firmei tale, cu 5 conturi de utilizator, ca în pachetul Starter. Înainte de început stabilim în scris volumul documentelor, iar pilotul pornește după ce accepți Termenii și condițiile, precum și Acordul de prelucrare a datelor. Tu alegi întrebările la care vrei răspuns; le formulăm în 3S și verificăm împreună cu tine răspunsurile și sursele lor. Contul ți se creează pe bază de invitație. La final îți transmitem o ofertă scrisă.",
          ],
        },
      ],
    },
    {
      cheie: "incercare",
      titlu: "Pot încerca 3S înainte să decid?",
      blocuri: [
        {
          paragrafe: [
            "Da. Pilotul asistat este gratuit timp de 14 zile și se desfășoară pe documentele firmei. Scrie-ne ca să stabilim documentele și întrebările.",
          ],
        },
      ],
    },
    {
      cheie: "oferta",
      titlu: "Cum obțin o ofertă?",
      blocuri: [
        {
          paragrafe: ["Scrie-ne pe WhatsApp. Sunt suficiente câteva rânduri despre:"],
          lista: {
            elemente: [
              "documentele pe care le păstrezi: pe hârtie, scanate, fișiere electronice sau o combinație;",
              "locul în care se află arhiva și țara;",
              "limba în care sunt redactate documentele;",
              "volumul aproximativ al arhivei și numărul de persoane care vor folosi 3S.",
            ],
          },
          dupa: [
            "De exemplu: „Păstrăm contracte și facturi redactate în română, la sediul din Chișinău. Am dori o ofertă.”",
            "Nu trimite documente sau date cu caracter personal în primul mesaj.",
          ],
        },
      ],
    },
  ],
  cta: {
    ref: "ro-md-preturi",
    titluBloc: "Solicită o ofertă",
    textWhatsapp: "Bună ziua, 3S. Am citit pagina de prețuri [ref:ro-md-preturi]. Aș dori o ofertă.",
    subiectEmail: "Întrebare 3S [ref:ro-md-preturi]",
  },
  jsonLd: [
    {
      "@type": "WebPage",
      "@id": BAZA + "/ro/preturi#webpage",
      url: BAZA + "/ro/preturi",
      name: TITLU,
      description: DESCRIERE,
      inLanguage: "ro-MD",
      isPartOf: { "@id": ID.site },
      about: { "@id": ID.organizatie },
      breadcrumb: { "@id": BAZA + "/ro/preturi#breadcrumb" },
    },
    {
      "@type": "BreadcrumbList",
      "@id": BAZA + "/ro/preturi#breadcrumb",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Acasă", item: BAZA + "/ro" },
        { "@type": "ListItem", position: 2, name: "Prețuri", item: BAZA + "/ro/preturi" },
      ],
    },
  ],
  afirmatii: [
    "ro-md-pret-orientativ-eur",
    "ro-md-fraza-tva",
    "ro-md-plata-si-oferta",
    "ro-md-pilot-asistat",
    "ro-md-cont-prin-invitatie",
    "ro-md-canale-de-contact",
    "ro-md-raspunde-o-persoana",
    "ro-md-arhiva-cu-sursa",
    "ro-md-termene-si-jurnal",
    "ro-md-gazduire-ue-frankfurt",
    "ro-md-functii-in-productie",
  ],
};
