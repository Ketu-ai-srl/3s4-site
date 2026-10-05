// Pagina G2 a editiei `ro-MD`: termenele de pastrare a documentelor firmei in Republica Moldova
// (`/ro/ghiduri/termene-pastrare-moldova` pe 3s.md), perechea verificatorului RO `/instrumente/termene-pastrare` si a
// paginii EN `/guides/records-retention-moldova`.
//
// FORMA (decizia 53, intrebarea 5 varianta a): pagina compune componentele perechii RO, in aceeasi ordine
// (EroulInstrument, SelectorTari cu PanouTara, IesiriTermene, CtaFinalInchis), cu textul de aici. Iese panoul Romaniei
// (termenele romanesti nu stau pe ghidurile lui 3s.md) si iesirea spre tabelul de tiparit (subpagina nu exista pe
// 3s.md), ca pe EN. Lista declarata: `config/congruenta/g2.json`.
//
// SURSA TEXTULUI: fisa paginii (ro-md/ghid-termene-moldova.md), sectiunea "Textele componentelor (decizia 53)", cu
// cheia campului RO in comentariu. Randurile Moldovei sunt "identic 3s4, permis" (aceleasi fapte ca pe EN, intrari
// confirmate in registru), scrise aici, nu importate: modulul nu aduce nimic din continutul RO. Exceptia e
// `personal.temei`, ingustat ca pe EN (nota 2 a fisei). Textul e PROPUS, pana la aprobarea owner-ului pe capturi.
// Dupa felia 108, iesirile duc la paginile /ro si pierd marcajul "(în engleză)".
//
// Modulul nu exporta `pagina` (forma CorpPagina): `PAGINA_TERMENE_RO_MD` e partea pe care o citesc metadata, datele
// structurate si registrul de afirmatii. Modulul e numai date.

import type { ContinutEroulInstrument } from "@/components/termene/EroulInstrument";
import type { ContinutPanouTara } from "@/components/termene/PanouTara";
import type { PaginaReferinta } from "@/content/en/referinta-comun";
import type { CodTip, IesireTermene, SursaPrimara, Tara } from "@/content/termene/date";
import { ctaFinalReferintaRoMd } from "./ghid-e-facturare-componente";

const CALE = "/ro/ghiduri/termene-pastrare-moldova";

/** Ziua in care s-au recitit sursele pentru 3s.md (`last_verified` al fisei). */
export const DATA_CITIRII_RO_MD = "30 septembrie 2026";

/** Sursele faptelor paginii, citate in Article (numele si adresa). */
const SURSE_ARTICOL = [
  { nume: "Legea contabilității și raportării financiare nr. 287/2017, art. 17", url: "https://www.legis.md/cautare/getResults?doc_id=154725&lang=ro" },
  {
    nume: "Ordinul Serviciului de Stat de Arhivă nr. 57/2016, cu Instrucțiunea privind aplicarea Indicatorului (versiunea în vigoare)",
    url: "https://www.legis.md/cautare/getResults?doc_id=125078&lang=ro",
  },
  { nume: "Indicatorul, anexa la versiunea în vigoare a ordinului", url: "https://www.legis.md/UserFiles/Image/RO/2016/mo247-255md/indicator_57.doc" },
] as const;

const META = {
  titlu: "Cât timp păstrezi actele firmei în Moldova (2026) | 3S",
  descriere:
    "Termenele de păstrare pentru facturi, registre, state de salarii, contracte și declarații fiscale în Republica Moldova, după Ordinul 57/2016 și Legea 287/2017.",
  cale: CALE,
};

// Rol: titlul instrumentului (h1). H1-ul fisei fara "(2026)"; anul ramane in titlul paginii, ca pe EN.
const H1 = "Cât timp păstrezi actele firmei în Moldova";

export const EROU_TERMENE_RO_MD: ContinutEroulInstrument = {
  // date.ts:55-57.
  fir: [
    { text: "Acasă", cale: "/ro" },
    { text: "Termene de păstrare în Moldova", cale: CALE },
  ],
  // date.ts:63-68.
  eticheta: "Republica Moldova",
  titlu: H1,
  subtitlu:
    "Facturile și celelalte acte primare se păstrează 6 ani, de la 1 ianuarie al anului de după încheierea dosarului; registrele, tot 6 ani; contractele, 6 ani de la încetare; declarațiile de impozit pe venit, 7 ani. Un litigiu prelungește termenul facturilor și registrelor până la hotărârea definitivă.",
};

export const INSTRUMENT_TERMENE_RO_MD = {
  // date.ts:76-78.
  etichetaSectiune: "Termenele, act cu act",
  etichetaSelector: "Țara",
};

const NUME_TIPURI: Record<CodTip, string> = {
  facturi: "Facturi de intrare și ieșire",
  registre: "Evidența contabilă: registre și bilanțul anual",
  state: "State de salarii",
  personal: "Dosarele angajaților",
  declaratii: "Declarații la fisc și acte justificative",
  contracte: "Contractele firmei",
  extrase: "Extrase bancare, ordine de plată și chitanțe",
};

export const PANOU_TERMENE_RO_MD: ContinutPanouTara = {
  // date.ts:83-95.
  contor: (confirmate, total) => "Termen confirmat pentru " + confirmate + " din " + total + " acte",
  neconfirmat: "Neconfirmat",
  etichete: { inceput: "De când curge termenul", temei: "Temei legal", motiv: "De ce nu dăm o cifră" },
  nota:
    "Textele de lege au fost citite pe " +
    DATA_CITIRII_RO_MD +
    ", pe portalul legis.md al Registrului de stat al actelor juridice. Termenul nu curge de la data documentului: fiecare rând confirmat arată momentul de la care se socotește. Orice cifră se poate schimba printr-o lege nouă. Alte acte normative, de pildă cele fiscale, vamale, de muncă sau de ramură, pot cere termene mai lungi pentru anumite documente. Ghidul are caracter informativ și nu ține loc de consultanță juridică; verifică situația firmei cu consultantul tău.",
  numeTip: (cod) => NUME_TIPURI[cod],
  // PanouTara.tsx:22, cu spatiul din fata.
  fereastraNoua: " (se deschide într-o fereastră nouă)",
};

const LEGEA_287_2017: SursaPrimara = {
  eticheta: "Legea nr. 287/2017, în Registrul de stat al actelor juridice",
  url: "https://www.legis.md/cautare/getResults?doc_id=154725&lang=ro",
};

const INDICATOR_57_2016: SursaPrimara = {
  eticheta: "Ordinul nr. 57/2016 și Indicatorul documentelor-tip, în Registrul de stat al actelor juridice",
  url: "https://www.legis.md/cautare/getResults?doc_id=125078&lang=ro",
};

const INCEPUT_PCT_2_11 =
  "1 ianuarie al anului următor celui în care dosarul a fost încheiat (Instrucțiunea privind aplicarea Indicatorului, pct. 2.11).";

export const MOLDOVA_RO_MD: Tara = {
  cod: "md",
  nume: "Republica Moldova",
  randuri: [
    {
      tip: "facturi",
      valoare: "6 ani",
      inceput: INCEPUT_PCT_2_11,
      temei:
        "Legea contabilității și raportării financiare nr. 287/2017, art. 17 alin. (1): documentele contabile se păstrează după termenele stabilite de autoritatea arhivelor. Indicatorul documentelor-tip, aprobat prin Ordinul Serviciului de Stat de Arhivă nr. 57/2016, art. 228: documentele primare, printre care factura și factura fiscală, se păstrează 6 ani; dacă apare un litigiu, până la hotărârea definitivă și irevocabilă.",
      surse: [LEGEA_287_2017, INDICATOR_57_2016],
    },
    {
      tip: "registre",
      valoare: null,
      motiv:
        "Rândul are două termene, iar unul lipsește. Registrele contabile (cartea mare, balanța de verificare) se păstrează 6 ani (Indicatorul, art. 236). Pentru situațiile financiare anuale, Indicatorul cere păstrare permanentă în organizațiile care completează Fondul Arhivistic, iar în coloana celorlalte organizații nu trece niciun termen (art. 224). Înainte să elimini situațiile financiare, întreabă Agenția Națională a Arhivelor.",
      surse: [INDICATOR_57_2016, LEGEA_287_2017],
    },
    {
      tip: "state",
      valoare: "6-75 de ani",
      inceput: INCEPUT_PCT_2_11,
      temei:
        "Indicatorul, art. 231: statele (borderourile) de plată a salariului se păstrează 6 ani, iar dacă firma nu ține conturi analitice pentru fiecare salariat, 75 de ani. Conturile analitice ale salariaților (registrele de decontări) se păstrează 75 de ani minus vârsta salariatului la încheierea dosarului (art. 230 și pct. 2.11 din Instrucțiune).",
      surse: [INDICATOR_57_2016],
    },
    {
      tip: "personal",
      valoare: "75 de ani minus vârsta",
      inceput:
        "De la încheierea dosarului; la „75 ani-V”, durata se socotește după vârsta persoanei la acea dată (Instrucțiunea, pct. 2.11).",
      // moldova.ts:76: ingustat ca pe EN (nota 2 a fisei).
      temei:
        "Potrivit art. 429 lit. d) din Indicator, dosarul personal al unui muncitor sau al unui angajat din personalul tehnic-ingineresc (cererea, contractul individual de muncă, ordinele de angajare și de încetare, fișa postului) are termenul „75 ani-V”: din 75 de ani se scade vârsta persoanei la încheierea dosarului. Dacă persoana a plecat la 40 de ani, dosarul rămâne în arhivă 35 de ani. Nota articolului prevede termene mai scurte pentru unele acte din dosar, de pildă certificatele medicale și alte acte secundare: 3 ani după concediere. Aceeași notă fixează termene proprii pentru o parte din dosarele pensionarilor; citește-o înainte să distrugi un dosar personal.",
      surse: [INDICATOR_57_2016],
    },
    {
      tip: "declaratii",
      valoare: "6-7 ani",
      inceput: INCEPUT_PCT_2_11,
      temei:
        "Indicatorul, art. 262: declarațiile entităților privind impozitul pe venit se păstrează 7 ani, iar documentele primare care le justifică, 6 ani (art. 228). Nu am găsit în Indicator un articol separat pentru celelalte declarații fiscale.",
      surse: [INDICATOR_57_2016],
    },
    {
      tip: "contracte",
      valoare: "6 ani",
      inceput: "După expirarea termenului contractului sau după executarea clauzelor lui (Indicatorul, art. 257, nota).",
      temei:
        "Indicatorul, art. 257: contractele și acordurile economice, de achiziții, de operațiuni și de prestări servicii se păstrează 6 ani după expirarea sau executarea lor; contractele de tranzacții valutare, 7 ani.",
      surse: [INDICATOR_57_2016],
    },
    {
      tip: "extrase",
      valoare: "6 ani",
      inceput: INCEPUT_PCT_2_11,
      temei:
        "Indicatorul, art. 228: documentele bancare sunt documente primare și se păstrează 6 ani; dacă apare un litigiu, până la hotărârea definitivă și irevocabilă.",
      surse: [INDICATOR_57_2016, LEGEA_287_2017],
    },
  ],
};

/** Tarile editiei, in ordinea pastilelor: numai Moldova. */
export const TARI_TERMENE_RO_MD: readonly Tara[] = [MOLDOVA_RO_MD];

/** Iesirile de sub panou (`date.ts:111`, `:117`): tabelul de tiparit iese; tintele sunt perechile /ro. */
export const IESIRI_TERMENE_RO_MD: IesireTermene[] = [
  { text: "Unde sunt păstrate documentele în 3S", href: "/ro/securitate#security", ruta: "/ro/securitate", iconita: "arrow-right" },
  {
    text: "Arhivarea facturilor electronice în UE",
    href: "/ro/ghiduri/arhivare-e-facturi-ue",
    ruta: "/ro/ghiduri/arhivare-e-facturi-ue",
    iconita: "arrow-right",
  },
];

/** `acasa.ts:800-829`: blocul de final, cu titlul si subtitlul fisei. */
export const CTA_FINAL_TERMENE_RO_MD = ctaFinalReferintaRoMd(
  "Vrei o arhivă digitală pentru documentele firmei?",
  "Spune-ne ce documente păstrezi, în ce limbă sunt redactate și ce volum au, aproximativ.",
);

export const PAGINA_TERMENE_RO_MD: PaginaReferinta = {
  cheie: "guides-records-retention-moldova",
  meta: META,
  h1: H1,
  cta: {
    ref: "ro-md-termene-moldova",
    textWhatsapp:
      "Bună ziua, 3S. Am citit ghidul despre termenele de păstrare în Moldova [ref:ro-md-termene-moldova]. Aș dori să întreb despre un pilot.",
    subiectEmail: "Întrebare 3S [ref:ro-md-termene-moldova]",
  },
  jsonLd: [
    {
      "@type": "Article",
      headline: H1,
      description: META.descriere,
      inLanguage: "ro-MD",
      datePublished: "2026-09-30",
      dateModified: "2026-09-30",
      isAccessibleForFree: true,
      about: [{ "@type": "Country", name: "Republica Moldova" }],
      citation: SURSE_ARTICOL.map((s) => s.nume + ", " + s.url),
    },
    {
      "@type": "WebPage",
      name: META.titlu,
      description: META.descriere,
      inLanguage: "ro-MD",
    },
  ],
  afirmatii: ["ro-md-referinta-termene-moldova", "ro-md-termene-si-jurnal", "ro-md-ghiduri-cu-surse", "ro-md-raspunde-o-persoana", "ro-md-canale-de-contact"],
};
