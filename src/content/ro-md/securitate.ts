// Pagina despre 3S a editiei `ro-MD` (P11, `/ro/securitate` pe 3s.md), transcrisa din fisa ei de continut
// (ro-md/securitate.md), pana la sectiunea de resurse nepublicate. Perechea EN e `/about` (`../en/about.ts`); calea e a
// fisei (slug-ul `/ro/securitate`, din sarcina dispecerului), ca pe site-ul RO, unde pagina pereche e `/securitate`.
//
// Pagina servita compune componentele perechii RO (decizia 53) cu textul din `securitate-componente.ts`; modulul de fata
// ramane sursa pentru metadata, nodul WebPage, textul precompletat si registrul de afirmatii.
//
// VARIANTELE CONDITIONATE (fisa, "Conditional variants"): titlul, descrierea si sectiunea "Cine opereaza 3S?" numesc
// operatorul numai dupa inregistrarea firmei operatoare (`operatorInregistrat`, aceeasi regula ca startul /ro).
//
// Decizia 63: pe paginile in romana se spun impreuna legea SUA (CLOUD Act) si cadrul european (entitatea AWS din
// Luxemburg, acordul AWS de prelucrare a datelor, conform GDPR). Tipul nodului e `WebPage`, ca pe EN (vocabularul
// portii de SEO nu are `AboutPage`).

import { iduri } from "@/components/seo/date-structurate";
import { caleMd } from "@/content/juridic/md/registru";
import type { PaginaContinut, SectiuneComuna } from "@/content/model/tipuri";
import { atributeLimba } from "@/lib/asezare";
import { adresaSite } from "@/lib/site";
import { operatorInregistrat } from "./acasa";
import { titluSecuritateRoMd } from "./securitate-componente";

const BAZA = adresaSite();
const ID = iduri(BAZA);
const LEGAL = caleMd("informatii-legale", "ro");

/** Firma operatoare e inregistrata, pe build-ul curent. */
export const OPERATOR_SECURITATE_BUILD: boolean = operatorInregistrat();

function descriere(operator: boolean): string {
  return operator
    ? "3S Scan Store Solve este o arhivă digitală cu căutare AI, operată din Republica Moldova. Fișierele sunt păstrate în UE (Frankfurt), pe Amazon Web Services."
    : "3S Scan Store Solve este o arhivă digitală cu căutare AI, iar fiecare răspuns indică documentul-sursă. Fișierele sunt păstrate în UE (Frankfurt), pe AWS.";
}

function sectiuni(operator: boolean): SectiuneComuna[] {
  return [
    {
      cheie: "unde-sunt-pastrate",
      titlu: "Unde sunt păstrate documentele firmei?",
      ancoraInainte: "security",
      blocuri: [
        {
          paragrafe: [
            "Fișierele încărcate în 3S sunt păstrate în Uniunea Europeană, cu regiunea principală Frankfurt, pe serverele Amazon Web Services (AWS). Tot acolo rulează platforma 3S, cu conturile utilizatorilor și arhiva digitală.",
          ],
          lista: {
            elemente: [
              "**Furnizor de găzduire:** Amazon Web Services (SUA), cu o entitate europeană în Luxemburg.",
              "**Locul datelor:** În Uniunea Europeană, regiunea principală Frankfurt.",
              "**Cadrul UE (GDPR):** AWS oferă clienților acordul de prelucrare a datelor (DPA).",
              "**Legea SUA (CLOUD Act):** Poate obliga Amazon să predea datele aflate sub controlul său.",
            ],
          },
        },
      ],
    },
    {
      cheie: "drumul-documentului",
      titlu: "Drumul unui document în 3S, de la încărcare la termenul de păstrare",
      blocuri: [
        {
          paragrafe: ["Pentru fiecare dosar, firma ta stabilește cât timp se păstrează documentele. Știi oricând unde sunt păstrate și până când."],
          lista: {
            elemente: [
              "**Încărcare.** Fișierele se încarcă direct din browser, în arhiva firmei.",
              "**Păstrare.** În UE, cu regiunea principală Frankfurt.",
              "**Indexare.** Indexat automat, cu textul recunoscut și tipul identificat.",
              "**Termen.** Păstrat până la termenul stabilit pentru dosarul lui.",
              "**Decizia firmei.** Termenul potrivit fiecărui dosar îl alegi tu, cu consultantul firmei.",
            ],
          },
        },
      ],
    },
    {
      cheie: "auditor",
      titlu: "Ce poți arăta unui auditor sau unui client",
      blocuri: [
        {
          paragrafe: ["Când un auditor sau un client întreabă unde sunt documentele și cât timp se păstrează, răspunsul îl găsești în 3S."],
        },
      ],
    },
    {
      cheie: "legea-sua-si-gdpr",
      titlu: "Ce prevăd legea SUA și GDPR?",
      ancoraInainte: "limits",
      blocuri: [
        {
          paragrafe: [
            "CLOUD Act, o lege a SUA, poate obliga Amazon să păstreze și să predea datele aflate sub controlul său, indiferent unde se află serverele. Amazon are și entități în Europa, iar AWS oferă clienților un acord de prelucrare a datelor (DPA), conform GDPR. Echipa 3S, moldo-româno-americană, se aliniază la legislația din Republica Moldova, din UE și din SUA. Informația nu înlocuiește consultanța juridică.",
          ],
        },
      ],
    },
    ...(operator
      ? [
          {
            cheie: "cine-opereaza",
            titlu: "Cine operează 3S?",
            blocuri: [
              { paragrafe: ["3S este operat din Republica Moldova. Datele firmei operatoare sunt publicate pe pagina [Informații legale](" + LEGAL + ")."] },
            ],
          },
        ]
      : []),
    {
      cheie: "in-testare",
      titlu: "Ce este încă în testare sau indisponibil?",
      blocuri: [
        {
          paragrafe: [
            "Întrebările în engleză despre documente redactate în română și indicarea paginii exacte sunt deocamdată în testare. Semnătura electronică calificată nu este disponibilă astăzi.",
          ],
        },
      ],
    },
  ];
}

/** Pagina `/ro/securitate`, cu variantele alese dupa starea firmei operatoare. */
export function paginaSecuritate(operator: boolean = OPERATOR_SECURITATE_BUILD): PaginaContinut {
  const titlu = titluSecuritateRoMd(operator);
  const desc = descriere(operator);
  return {
    cheie: "about",
    meta: { titlu, descriere: desc, cale: "/ro/securitate" },
    h1: titlu,
    // Capsula = subtitlul eroului plus doua fraze ale specificatiilor (cadrul UE si legea SUA, decizia 63), ca sa
    // ajunga la 40-60 de cuvinte cerute de model; nu se randeaza (pagina compune componentele).
    capsula:
      (operator
        ? "3S Scan Store Solve este o arhivă digitală cu căutare AI, operată din Republica Moldova. Fișierele încărcate în 3S sunt păstrate în Uniunea Europeană, cu regiunea principală Frankfurt, pe serverele Amazon Web Services."
        : "3S Scan Store Solve este o arhivă digitală cu căutare AI: fiecare răspuns indică documentul din care provine. Fișierele încărcate în 3S sunt păstrate în Uniunea Europeană, cu regiunea principală Frankfurt, pe serverele Amazon Web Services.") +
      " AWS oferă clienților acordul de prelucrare a datelor (DPA). Legea SUA (CLOUD Act) poate obliga Amazon să predea datele aflate sub controlul său.",
    sectiuni: sectiuni(operator),
    cta: {
      ref: "ro-md-securitate",
      titluBloc: "Scrie-ne pe WhatsApp",
      textWhatsapp: "Bună ziua, 3S. Am citit pagina Despre 3S [ref:ro-md-securitate]. Am o întrebare despre locul în care sunt păstrate datele.",
      subiectEmail: "Întrebare 3S [ref:ro-md-securitate]",
    },
    jsonLd: [
      {
        "@type": "WebPage",
        "@id": BAZA + "/ro/securitate#webpage",
        url: BAZA + "/ro/securitate",
        name: titlu,
        description: desc,
        inLanguage: atributeLimba("ro-MD").inLanguage,
        isPartOf: { "@id": ID.site },
        mainEntity: { "@id": ID.organizatie },
        breadcrumb: { "@id": BAZA + "/ro/securitate#breadcrumb" },
      },
      {
        "@type": "BreadcrumbList",
        "@id": BAZA + "/ro/securitate#breadcrumb",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Acasă", item: BAZA + "/ro" },
          { "@type": "ListItem", position: 2, name: "Despre 3S", item: BAZA + "/ro/securitate" },
        ],
      },
    ],
    afirmatii: [
      "ro-md-arhiva-cu-sursa",
      "ro-md-gazduire-ue-frankfurt",
      "ro-md-amazon-sediu-sua",
      "ro-md-platforma-pe-aws",
      "ro-md-aws-entitate-europeana",
      "ro-md-aws-dpa-gdpr",
      "ro-md-echipa-moldo-romano-americana",
      "ro-md-trei-pasi-scan-store-solve",
      "ro-md-functii-in-productie",
      "ro-md-termene-si-jurnal",
      "ro-md-engleza-si-pagina-in-testare",
      "ro-md-semnatura-in-curs",
      "ro-md-ghiduri-cu-surse",
      "ro-md-pilot-asistat",
      ...(operator ? ["ro-md-operator-din-moldova"] : []),
    ],
  };
}

export const pagina: PaginaContinut = paginaSecuritate();
