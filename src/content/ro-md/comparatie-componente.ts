// Pagina G3 a editiei `ro-MD`: comparatia 3S cu Google Drive (`/ro/comparatie-drive` pe 3s.md), perechea paginii RO
// `/comparatie-drive` si a paginii EN `/compare/3s-vs-google-and-box`. Calea repeta calea paginii RO (slug-ul fisei),
// ca adresa sa ramana aceeasi pe 3s.com.ro, unde romana sta la radacina (decizia 55).
//
// FORMA (decizia 53): pagina compune componentele perechii RO, in aceeasi ordine (EroulInterior, CardDivizat,
// TabelMarcaje, CutieCta880), cu textul de aici. Intrebarea 7 (decizia 59, lectura dispecerului): un singur tert,
// Google Drive cu functiile Gemini. Nu se monteaza DiagramaConectori (d43) si SinaPasi (poarta juridica 40-41, d31,
// d43). Din cele 13 randuri ale tabelului RO raman doua, ca pe EN: cautarea cu sursa citata si jurnalul deschiderilor;
// randul "text din scanari" e tinut, ca pe EN. Lista declarata: `config/congruenta/g3.json`.
//
// SURSA TEXTULUI: fisa paginii (ro-md/comparatie.md), sectiunea "Textele componentelor (decizia 53)". Marcajele si
// notele Google sunt cele ale paginii RO ("identic 3s4, permis"), citite pe paginile romanesti ale documentatiei
// Google (`?hl=ro`). Textul e PROPUS, pana la aprobarea owner-ului pe capturi.
//
// ABATERE DE LA FISA, ca sa se vada: etichetele surselor de certificare ale cardului spun in clar ca certificarile
// sunt declarate de Google, nu de 3S (fisa le lasa ca titluri englezesti ale paginilor). Motivul e poarta de afirmatii:
// exceptia ei pentru certificarile atribuite furnizorilor (decizia 11) e scrisa numai pe fisierul paginii EN, iar
// forma care numeste cui apartine certificarea e chiar forma ceruta de poarta.
//
// Modulul nu exporta `pagina` (forma CorpPagina): `PAGINA_COMPARATIE_RO_MD` e partea pe care o citesc metadata, datele
// structurate si registrul de afirmatii. Modulul e numai date.

import type { CardDivizatProps } from "@/components/comparatii/CardDivizat";
import type { SurseSuplimentare } from "@/components/comparatii/TabelMarcaje";
import type { NivelFir } from "@/components/primitive/FirPagina";
import type { Marcaj, SursaOficiala, TabelComparatie } from "@/content/comparatii";
import type { PaginaReferinta } from "@/content/en/referinta-comun";
import { atributeLimba } from "@/lib/asezare";
import { ETICHETA_BUTON_CANAL_RO_MD } from "./ghid-e-facturare-componente";

const CALE = "/ro/comparatie-drive";

/** Ziua in care s-au citit marcajele Google (citirea paginii RO, aceeasi documentatie, in romana). */
export const DATA_CITIRII_MARCAJE_RO_MD = "25 septembrie 2026";

/** Ziua in care s-au citit sursele cardului (fisa, S2, S11, S12). */
const CITIT_CARD = "30 septembrie 2026";

const META = {
  titlu: "3S și Google Drive, comparate funcție cu funcție",
  descriere:
    "Ce oferă 3S și Google Drive cu Gemini la căutarea cu sursa citată și la jurnalul deschiderilor, cu documentația oficială Google pentru fiecare marcaj.",
  cale: CALE,
};

// Rol: titlul paginii (h1 pe 2 randuri).
const H1 = "3S și Google Drive cu Gemini, față în față";

export const EROU_COMPARATIE_RO_MD: { fir: NivelFir[]; titlu: string; subtitlu: string } = {
  // comparatii.ts:204-213.
  fir: [
    { text: "Acasă", cale: "/ro" },
    { text: "Comparație", cale: CALE },
  ],
  titlu: H1,
  subtitlu:
    "Dacă documentele firmei sunt deja în Google Drive, încearcă întâi Gemini. Alege 3S pentru un pilot asistat pe documentele tale. Dacă ai nevoie de anumite certificări, întreabă-ne.",
};

export const DIVIZAT_COMPARATIE_RO_MD: CardDivizatProps = {
  // comparatii.ts:217-234.
  stanga: {
    titlu: "Când 3S nu este prima alegere",
    elemente: ["Auditorul sau banca cer certificări anume", "Ai nevoie de multe integrări gata făcute", "Semnezi electronic direct în arhivă"],
    nota: "Google Drive acoperă o parte din ele: verifică-l întâi.",
  },
  dreapta: {
    titlu: "Când se potrivește 3S",
    elemente: [
      "Ai nevoie să testezi 3S pe documentele firmei",
      "Descarci e-facturile ca XML din RO e-Factura",
      "Fiecare răspuns trebuie să indice sursa",
      "Ai nevoie de ajutor la primele documente",
    ],
  },
};

// Sursele Google ale randurilor ramase; adresele pe `hl=ro`, ca pe RO (comparatii.ts:78, :94, :106).
const G_CAUTARE: SursaOficiala = {
  eticheta: "Căutarea fișierelor în Google Drive, Ajutor Google Drive",
  url: "https://support.google.com/drive/answer/2375114?hl=ro",
};
const G_PRODUS: SursaOficiala = {
  eticheta: "Pagina produsului Google Drive, Google Workspace",
  url: "https://workspace.google.com/products/drive/",
};
const G_JURNAL: SursaOficiala = {
  eticheta: "Evenimentele din jurnalul Drive, Ajutor Google Workspace",
  url: "https://knowledge.workspace.google.com/admin/reports/drive-log-events?hl=ro",
};

export const TABEL_COMPARATIE_RO_MD: TabelComparatie = {
  // comparatii.ts:286-300.
  titlu: "Funcție cu funcție: Drive și 3S",
  capFunctie: "Funcția",
  // Numele produsului pe doua randuri, ca pe RO si pe EN.
  coloaneTerti: ["Google\nDrive"],
  coloanaNoi: "3S",
  latimeMinima: 420,
  latimeColoana: 136,
  latimeColoanaMica: 88,
  titluSurse: "De unde vin marcajele pentru Google Drive",
  notaSurse:
    "Marcajele urmează documentația publică Google, citită pe " +
    DATA_CITIRII_MARCAJE_RO_MD +
    ". Mai multe funcții depind de planul Google Workspace ales.",
  randuri: [
    {
      // comparatii.ts:327-331.
      functie: "Căutare AI cu sursa citată",
      terti: [
        {
          marcaj: "da",
          nota: "Cu funcțiile Gemini din Workspace, căutarea din Drive dă un răspuns rezumat din fișiere, cu legături spre sursele folosite.",
          surse: [G_CAUTARE, G_PRODUS],
        },
      ],
      noi: { marcaj: "da", afirmatie: "ro-md-arhiva-cu-sursa" },
    },
    {
      // comparatii.ts:382-386.
      functie: "Jurnalul deschiderilor",
      terti: [
        {
          marcaj: "partial",
          nota: "Administratorul vede evenimentele din Drive în consola de administrare; cele mai multe se înregistrează doar pentru planurile care le includ.",
          surse: [G_JURNAL],
        },
      ],
      noi: { marcaj: "da", afirmatie: "ro-md-termene-si-jurnal" },
    },
  ],
};

/** comparatii.ts:66-68 si `TabelMarcaje.tsx:89`, `:35`: implicitul RO, scris aici ca pe EN. */
export const LEGENDA_COMPARATIE_RO_MD: Record<Marcaj, string> = { da: "Da", partial: "Parțial", nu: "Nu" };
export const ETICHETA_LEGENDA_RO_MD = "Legenda marcajelor";
export const FEREASTRA_NOUA_RO_MD = " (se deschide într-o fereastră nouă)";

/** Sursele afirmatiilor despre Google din cardul divizat (decizia 11: sursa si data pe fiecare afirmatie despre un tert). */
export const SURSE_CARD_COMPARATIE_RO_MD: SurseSuplimentare[] = [
  {
    titlu: "Cardul „Când 3S nu este prima alegere”: ce acoperă Google Drive",
    surse: [
      { eticheta: "Pagina produsului Google Drive, Google Workspace, citită pe " + CITIT_CARD, url: "https://workspace.google.com/products/drive/" },
      {
        eticheta: "Certificare declarată de Google, nu de 3S: ISO/IEC 27001, pagina Google Cloud, citită pe " + CITIT_CARD,
        url: "https://cloud.google.com/security/compliance/iso-27001",
      },
      {
        eticheta: "Certificare declarată de Google, nu de 3S: SOC 2, pagina Google Cloud, citită pe " + CITIT_CARD,
        url: "https://cloud.google.com/security/compliance/soc-2",
      },
    ],
  },
];

/** Cutia de incheiere (comparatii.ts:453-454, :185); butonul il rezolva pagina (tinta WhatsApp). */
export const CUTIE_CTA_COMPARATIE_RO_MD = {
  titlu: "Nu știi dacă 3S se potrivește? Întreabă-ne.",
  text: "Spune-ne ce documente ai și unde se află. Îți spunem direct dacă 3S se potrivește sau ce să încerci întâi.",
  butonText: ETICHETA_BUTON_CANAL_RO_MD,
};

export const PAGINA_COMPARATIE_RO_MD: PaginaReferinta = {
  cheie: "compare-3s-vs-google-and-box",
  meta: META,
  h1: H1,
  cta: {
    ref: "ro-md-comparatie",
    textWhatsapp:
      "Bună ziua, 3S. Am citit comparația dintre 3S și Google Drive [ref:ro-md-comparatie]. Aș dori să aflu dacă 3S se potrivește firmei noastre.",
    subiectEmail: "Întrebare 3S [ref:ro-md-comparatie]",
  },
  jsonLd: [
    {
      "@type": "Article",
      headline: H1,
      description: META.descriere,
      inLanguage: atributeLimba("ro-MD").inLanguage,
      datePublished: "2026-09-30",
      dateModified: "2026-09-30",
      isAccessibleForFree: true,
      citation: [G_CAUTARE, G_PRODUS, G_JURNAL, ...SURSE_CARD_COMPARATIE_RO_MD[0].surse.slice(1)].map((s) => s.eticheta + ", " + s.url),
    },
    {
      "@type": "WebPage",
      name: META.titlu,
      description: META.descriere,
      inLanguage: atributeLimba("ro-MD").inLanguage,
    },
  ],
  afirmatii: [
    "ro-md-referinta-comparatie-drive",
    "ro-md-arhiva-cu-sursa",
    "ro-md-termene-si-jurnal",
    "ro-md-pilot-asistat",
    "ro-md-referinta-efacturare-incarcare-xml",
    "ro-md-semnatura-in-curs",
    "ro-md-raspunde-o-persoana",
    "ro-md-canale-de-contact",
  ],
};
