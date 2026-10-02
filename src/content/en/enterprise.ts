// Pagina Enterprise a editiei `en` (P09, `/enterprise`), transcrisa din fisa ei de continut rescrisa dupa
// decizia 43, pana la sectiunea de resurse nepublicate: fara stocare proprie, fara autentificare unica, fara API
// si fara conexiuni cu nume. Pagina e subtire (fisa o spune si lasa forma dispecerului); nu s-a adaugat nimic ca
// sa umple golul.
//
// Linia de e-mail a blocurilor de canal o randeaza pagina numai cand domeniul are adresa (P-40).

import { iduri } from "@/components/seo/date-structurate";
import type { PaginaContinut } from "@/content/model/tipuri";
import { adresaSite } from "@/lib/site";
import type { FinalPagina } from "./home";

const BAZA = adresaSite();
const ID = iduri(BAZA);

export const pagina: PaginaContinut = {
  cheie: "enterprise",
  meta: {
    titlu: "3S Enterprise for Large Archives and IT Requirements",
    descriere:
      "For organizations with large archives and IT requirements: what 3S does with your documents, where files are stored and what procurement will ask.",
    cale: "/enterprise",
  },
  h1: "3S for organizations with large archives and IT requirements",
  capsula:
    "3S Enterprise is the plan for organizations with more than 20 user accounts, on an annual contract. 3S recognizes the text of scanned documents, detects the document type and answers questions with the source cited. Files are stored in the EU, with Frankfurt as the primary region.",
  sectiuni: [
    {
      cheie: "it-and-procurement",
      titlu: "What should IT and procurement know first?",
      blocuri: [
        {
          paragrafe: [],
          tabel: {
            forma: "cu-antet",
            titlu: "What IT and procurement should know first",
            antet: ["Topic", "What 3S says"],
            randuri: [
              ["Data location", "In the EU, with Frankfurt as the primary region."],
              ["Certifications", "None stated on this site. Tell us what you need."],
              ["Service levels", "None stated on this site. Tell us what you need."],
            ],
          },
        },
      ],
    },
    {
      cheie: "documents",
      titlu: "What does 3S do with our documents?",
      blocuri: [
        {
          paragrafe: ["3S does the following with your documents:"],
          lista: {
            elemente: ["It recognizes the text of scanned documents.", "It detects the document type.", "It searches with the source cited."],
          },
          dupa: ["See [Search with sources](/features/search) and the [platform page](/platform)."],
        },
      ],
    },
    {
      cheie: "export",
      titlu: "Can we take our documents with us?",
      blocuri: [
        {
          paragrafe: [
            "3S delivers documents by export. This site states no exit terms, so if you need a specific exit arrangement, tell us before you decide.",
          ],
        },
      ],
    },
    {
      cheie: "where-stored",
      titlu: "Where are files stored?",
      blocuri: [
        {
          paragrafe: [
            "Files are stored in the EU, with Frankfurt as the primary region. The [About page](/about#security) names the hosting provider and explains what US law says about data held by a US company.",
          ],
        },
      ],
    },
    {
      cheie: "procurement",
      titlu: "What will procurement ask for?",
      blocuri: [
        {
          paragrafe: [
            "Certifications, data processing terms, sub-processors and service levels are the usual questions. This site states no certifications and no service levels. Tell us what your procurement requires. We will say plainly whether we meet it.",
            "Enterprise is the last of the four 3S plans, for more than 20 user accounts: from EUR 800 per month, excluding VAT, on an annual contract. The price is indicative; see [Pricing](/pricing).",
          ],
        },
      ],
    },
  ],
  cta: {
    ref: "en-ent",
    titluBloc: "Talk about your requirements",
    textWhatsapp: "Hello 3S, I read your page on 3S for large archives [ref:en-ent]. I would like to talk about our requirements.",
    subiectEmail: "3S inquiry [ref:en-ent]",
  },
  jsonLd: [
    {
      "@type": "WebPage",
      "@id": BAZA + "/enterprise#webpage",
      url: BAZA + "/enterprise",
      name: "3S Enterprise for Large Archives and IT Requirements",
      description:
        "For organizations with large archives and IT requirements: what 3S does with your documents, where files are stored and what procurement will ask.",
      inLanguage: "en",
      isPartOf: { "@id": ID.site },
      about: { "@id": ID.organizatie },
      breadcrumb: { "@id": BAZA + "/enterprise#breadcrumb" },
    },
    {
      "@type": "BreadcrumbList",
      "@id": BAZA + "/enterprise#breadcrumb",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: BAZA + "/" },
        { "@type": "ListItem", position: 2, name: "Enterprise", item: BAZA + "/enterprise" },
      ],
    },
  ],
  afirmatii: [
    "en-pret-orientativ-eur",
    "en-enterprise-functii-in-productie",
    "en-comparatii-cautare-cu-sursa",
    "en-gazduire-ue-frankfurt",
    "en-produs-amazon-sediu-sua",
  ],
};

export const final: FinalPagina = {
  text: "Tell us what your archive holds and where it lives today. We reply in English or Romanian.",
  dupa: ["See also: [About and security](/about) and [Contact](/contact)."],
};
