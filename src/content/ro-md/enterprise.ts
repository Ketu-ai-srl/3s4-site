// Pagina Enterprise a editiei `ro-MD` (P09, `/ro/enterprise` pe 3s.md), transcrisa din fisa ei de continut
// (ro-md/enterprise.md), pana la sectiunea de resurse nepublicate. Perechea EN e `/enterprise` (`../en/enterprise.ts`):
// aceleasi fapte, aceeasi ordine a sectiunilor, textul scris din nou in romana de business, la "tu" (deciziile 35, 39).
//
// Pagina servita compune componentele perechii RO (decizia 53) cu textul din `enterprise-componente.ts`; modulul de fata
// ramane sursa pentru metadata, nodul WebPage, textul precompletat si registrul de afirmatii.
//
// CE NU INTRA, ca pe EN: stocarea proprie, autentificarea unica, API-ul, conexiunile cu nume si regulile automate
// (d43), criptarea (d31), scanarea si originalele (poarta juridica a deciziilor 40-41). Pilotul are 14 zile (decizia 65).
// Legaturile spre paginile /ro folosesc caile acestei felii: pagina despre 3S si securitate e `/ro/securitate` (slug-ul
// fisei ei), nu `/ro/despre` din arhitectura veche.

import { iduri } from "@/components/seo/date-structurate";
import type { PaginaContinut } from "@/content/model/tipuri";
import { atributeLimba } from "@/lib/asezare";
import { adresaSite } from "@/lib/site";

/** Calea paginii de cautare; caile stau in constante, nu in proza (poarta de limba citeste proza). */
const CALE_CAUTARE = "/ro/functionalitati/cautare-ai";

const BAZA = adresaSite();
const ID = iduri(BAZA);

const TITLU = "3S Enterprise pentru arhive mari și cerințe IT";
const DESCRIERE =
  "Pentru organizațiile cu arhive mari și cerințe IT: ce face 3S cu documentele, unde sunt păstrate fișierele și ce întreabă de obicei achizițiile.";

export const pagina: PaginaContinut = {
  cheie: "enterprise",
  meta: { titlu: TITLU, descriere: DESCRIERE, cale: "/ro/enterprise" },
  h1: "3S pentru organizațiile cu arhive mari și cerințe IT",
  capsula:
    "3S Enterprise este pachetul pentru organizațiile cu peste 20 de conturi de utilizator, cu contract anual. 3S recunoaște textul documentelor scanate, identifică tipul lor și răspunde la întrebări cu sursa indicată. Fișierele sunt găzduite în Uniunea Europeană, cu regiunea principală Frankfurt.",
  sectiuni: [
    {
      cheie: "it-si-achizitii",
      titlu: "Ce verifică întâi IT-ul și achizițiile?",
      blocuri: [
        {
          paragrafe: [],
          tabel: {
            forma: "cu-antet",
            titlu: "Ce verifică întâi IT-ul și achizițiile",
            antet: ["Subiect", "Ce spune 3S"],
            randuri: [
              ["Locul datelor", "În Uniunea Europeană, cu regiunea principală Frankfurt."],
              ["Certificări", "Site-ul nu declară certificări. Spune-ne de ce ai nevoie."],
              ["Niveluri de serviciu", "Site-ul nu declară niveluri de serviciu. Spune-ne de ce ai nevoie."],
            ],
          },
        },
      ],
    },
    {
      cheie: "documente",
      titlu: "Ce face 3S cu documentele organizației?",
      blocuri: [
        {
          paragrafe: ["Pe documentele pe care le încarci, 3S:"],
          lista: {
            elemente: [
              "recunoaște textul documentelor scanate;",
              "identifică tipul fiecărui document;",
              "caută în conținut și indică sursa fiecărui răspuns.",
            ],
          },
          dupa: ["Detaliile sunt pe paginile [Căutare cu sursă](" + CALE_CAUTARE + ") și [Platforma](/ro/platforma)."],
        },
      ],
    },
    {
      cheie: "export",
      titlu: "Pot recupera documentele dacă renunț la 3S?",
      blocuri: [
        {
          paragrafe: [
            "Poți exporta documentele din 3S. Site-ul nu publică condiții pentru încheierea colaborării; dacă ai nevoie de o procedură anume, spune-ne înainte să decizi.",
          ],
        },
      ],
    },
    {
      cheie: "unde-sunt-pastrate",
      titlu: "Unde sunt păstrate fișierele?",
      blocuri: [
        {
          paragrafe: [
            "Fișierele sunt găzduite în Uniunea Europeană, cu regiunea principală Frankfurt. Pagina [Despre 3S și securitate](/ro/securitate) numește furnizorul de găzduire și explică ce prevede legislația americană pentru datele aflate la o companie din Statele Unite.",
          ],
        },
      ],
    },
    {
      cheie: "achizitii",
      titlu: "Ce va cere departamentul de achiziții?",
      blocuri: [
        {
          paragrafe: [
            "De obicei, achizițiile întreabă de certificări, de condițiile de prelucrare a datelor, de lista subprocesatorilor și de nivelurile de serviciu. Site-ul nu declară certificări și nici niveluri de serviciu. Spune-ne ce cerințe are procedura de achiziție a organizației, iar noi îți spunem deschis dacă le îndeplinim.",
            "Enterprise este ultimul dintre cele patru pachete 3S și se adresează organizațiilor cu peste 20 de conturi de utilizator: de la 800 EUR pe lună, fără TVA, cu contract anual. Prețul are caracter orientativ; grila completă este pe pagina [Prețuri](/ro/preturi).",
          ],
        },
      ],
    },
  ],
  cta: {
    ref: "ro-md-enterprise",
    titluBloc: "Discută cu noi cerințele organizației",
    textWhatsapp:
      "Bună ziua, 3S. Am citit pagina despre 3S Enterprise [ref:ro-md-enterprise]. Aș dori să discutăm cerințele organizației noastre.",
    subiectEmail: "Întrebare 3S Enterprise [ref:ro-md-enterprise]",
  },
  jsonLd: [
    {
      "@type": "WebPage",
      "@id": BAZA + "/ro/enterprise#webpage",
      url: BAZA + "/ro/enterprise",
      name: TITLU,
      description: DESCRIERE,
      inLanguage: atributeLimba("ro-MD").inLanguage,
      isPartOf: { "@id": ID.site },
      about: { "@id": ID.organizatie },
      breadcrumb: { "@id": BAZA + "/ro/enterprise#breadcrumb" },
    },
    {
      "@type": "BreadcrumbList",
      "@id": BAZA + "/ro/enterprise#breadcrumb",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Acasă", item: BAZA + "/ro" },
        { "@type": "ListItem", position: 2, name: "Enterprise", item: BAZA + "/ro/enterprise" },
      ],
    },
  ],
  afirmatii: [
    "ro-md-pret-orientativ-eur",
    "ro-md-fraza-tva",
    "ro-md-functii-in-productie",
    "ro-md-arhiva-cu-sursa",
    "ro-md-gazduire-ue-frankfurt",
    "ro-md-amazon-sediu-sua",
    "ro-md-pilot-asistat",
    "ro-md-trei-pasi-scan-store-solve",
    "ro-md-termene-si-jurnal",
    "ro-md-raspunde-o-persoana",
    "ro-md-canale-de-contact",
  ],
};
