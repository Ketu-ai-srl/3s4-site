// Pagina G1 a editiei `ro-MD`: arhivarea e-facturilor in UE, pe tari (`/ro/ghiduri/arhivare-e-facturi-ue` pe 3s.md),
// perechea paginii RO `/e-facturare` si a paginii EN `/guides/e-invoice-archiving-eu`.
//
// FORMA (decizia 53): pagina compune sectiunile paginii RO, in aceeasi ordine (cele 11 din
// `src/components/efacturare/SectiuniEfacturare.tsx`, apoi CtaFinalInchis), cu textul de aici, pe contractul
// `ContinutEfacturare`. Campurile scoase, ca pe EN: canalele machetei (deciziile 43 si 49), insigna Peppol a formatelor
// (43), sursele termenului de transmitere si SAF-T din randul Romaniei, calendarul `.ics` (termenele romanesti D406,
// ruta numai pe RO), butonul secundar al blocului de final (`/incepe` nu exista pe 3s.md). Lista declarata:
// `config/congruenta/g1.json`.
//
// SURSA TEXTULUI: fisa paginii (ro-md/ghid-e-facturare.md), sectiunea "Textele componentelor (decizia 53)", cu cheia
// campului RO in comentariu; starea lui e PROPUS pana la aprobarea owner-ului pe capturi. Dupa felia 108 legaturile
// spre paginile EN trec pe caile /ro si pierd marcajul "(în engleză)", cum cer variantele conditionate ale fisei.
// Titlurile surselor raman in limba originala, in atributul `title`, ca pe RO.
//
// Modulul nu exporta `pagina` (forma CorpPagina): `PAGINA_EFACTURARE_RO_MD` e partea pe care o citesc metadata, datele
// structurate si registrul de afirmatii, ca la paginile EN de referinta. Modulul e numai date.

import type { ContinutEfacturare } from "@/components/efacturare/SectiuniEfacturare";
import type { ContinutCtaFinal } from "@/components/primitive/CtaFinalInchis";
import type { Sursa } from "@/content/efacturare/surse";
import type { PaginaReferinta } from "@/content/en/referinta-comun";
import { atributeLimba } from "@/lib/asezare";

const CALE = "/ro/ghiduri/arhivare-e-facturi-ue";

/** Eticheta butonului de canal (WhatsApp) din erou si din blocul de final, pe paginile /ro de referinta (decizia 35). */
export const ETICHETA_BUTON_CANAL_RO_MD = "Scrie-ne pe WhatsApp";

/** Blocul de final al unei pagini /ro de referinta: titlul si subtitlul paginii, restul comun (vizualul de pe /ro). */
export function ctaFinalReferintaRoMd(titlu: string, subtitlu: string): ContinutCtaFinal {
  return {
    titlu,
    subtitlu,
    // Folosit numai daca pagina nu da `butoane`; paginile pun butonul WhatsApp.
    butonPrincipal: { text: ETICHETA_BUTON_CANAL_RO_MD, href: null, ruta: null },
    microtext: "Îți răspunde o persoană din echipa 3S.",
    vizual: {
      declaratie: "Exemplu cu date fictive",
      pasi: [
        { iconita: "laptop", text: "Încărcat pe web", ora: "09:41" },
        { iconita: "tag", text: "Etichetat ca factură", ora: "09:41" },
      ],
      rezultat: { fisier: "Factura_0415_exemplu.pdf", stare: "Indexat pentru căutare", ora: "09:42" },
    },
  };
}

/** Sursele primare ale ghidului (tabelul "De unde provin informațiile?" al fisei), citate in nodul Article. */
const SURSE_ARTICOL: readonly { nume: string; url: string }[] = [
  { nume: "Directiva TVA 2006/112/CE, versiunea consolidată din 14 aprilie 2025", url: "https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:02006L0112-20250414" },
  { nume: "Directiva (UE) 2025/516", url: "https://eur-lex.europa.eu/legal-content/RO/TXT/?uri=CELEX:32025L0516" },
  { nume: "UStG, § 14", url: "https://www.gesetze-im-internet.de/ustg_1980/__14.html" },
  { nume: "UStG, § 14b", url: "https://www.gesetze-im-internet.de/ustg_1980/__14b.html" },
  { nume: "AO, § 147", url: "https://www.gesetze-im-internet.de/ao_1977/__147.html" },
  { nume: "Ministerul Federal de Finanțe, întrebări frecvente despre e-factura obligatorie (martie 2026)", url: "https://www.bundesfinanzministerium.de/Content/DE/FAQ/e-rechnung.html" },
  { nume: "Codul comercial, art. L123-22", url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000006219327" },
  { nume: "Service-Public, fișa F10029", url: "https://entreprendre.service-public.gouv.fr/vosdroits/F10029" },
  { nume: "Codul de procedură fiscală, art. L102 B", url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000041471233/" },
  { nume: "Legea 2026-534 din 25 iunie 2026, art. 36", url: "https://www.legifrance.gouv.fr/jorf/article_jo/JORFARTI000054309787" },
  { nume: "BOFiP BOI-CF-COM-10-10-30, în versiunea în vigoare din 3 septembrie 2025", url: "https://bofip.impots.gouv.fr/bofip/645-PGP.html/identifiant=BOI-CF-COM-10-10-30-20250903" },
  {
    nume: "Administrația fiscală (DGFiP), ghidul practic pentru începerea facturării electronice la 1 septembrie 2026",
    url: "https://www.impots.gouv.fr/sites/default/files/media/1_metier/2_professionnel/EV/2_gestion/290_facturation_electronique/guide_pratique_facturation_electronique.pdf",
  },
  { nume: "Ministerul Finanțelor, KSeF: temeiul legal și datele-cheie", url: "https://ksef.podatki.gov.pl/informacje-ogolne-ksef-20/podstawy-prawne-oraz-kluczowe-terminy/" },
  { nume: "Ministerul Finanțelor, regulile și prevederile legale KSeF", url: "https://ksef.podatki.gov.pl/ksef-news/zasady-obowiazywania-ksef-i-przepisy-prawne/" },
  { nume: "Ministerul Finanțelor, întrebări și răspunsuri KSeF 2.0", url: "https://ksef.podatki.gov.pl/pytania-i-odpowiedzi-ksef-20/" },
  { nume: "Legea TVA, text consolidat, Dziennik Ustaw 2025, poziția 775", url: "https://dziennikustaw.gov.pl/D2025000077501.pdf" },
  { nume: "Legea din 5 august 2025, Dziennik Ustaw 2025, poziția 1203", url: "https://dziennikustaw.gov.pl/D2025000120301.pdf" },
  { nume: "Ordonanța fiscală, text consolidat, Dziennik Ustaw 2025, poziția 111", url: "https://dziennikustaw.gov.pl/D2025000011101.pdf" },
  {
    nume: "BOSA, e-facturile structurate între firme sunt obligatorii din 2026",
    url: "https://efacture.belgium.be/fr/article/les-factures-electroniques-structurees-entre-entreprises-sont-obligatoires-depuis-2026",
  },
  { nume: "BOSA, sfârșitul perioadei de toleranță (7 aprilie 2026)", url: "https://efacture.belgium.be/fr/news/fin-de-la-periode-de-tolerance-pour-le-facturation" },
  {
    nume: "BOSA, cum se păstrează facturile primite prin facturarea electronică (8 aprilie 2026)",
    url: "https://efacture.belgium.be/fr/article/comment-conserver-des-factures-recues-la-facturation-electronique",
  },
  {
    nume: "Legea din 18 decembrie 2025 (Justel, dosarul 2025121806)",
    url: "https://www.ejustice.just.fgov.be/cgi_loi/article.pl?language=fr&lg_txt=f&type=&sort=&numac_search=&cn_search=2025121806&caller=eli&view_numac=2025121806nl",
  },
  { nume: "Legea contabilității nr. 82/1991, forma consolidată", url: "https://legislatie.just.ro/Public/DetaliiDocument/1576" },
  { nume: "Legea contabilității nr. 82/1991, textul republicat în 2008", url: "https://legislatie.just.ro/Public/DetaliiDocumentAfis/94309" },
  { nume: "OMFP nr. 2634/2015", url: "https://static.anaf.ro/static/10/Anaf/legislatie/OMFP_2634_2015.pdf" },
  { nume: "Codul fiscal, forma consolidată", url: "https://legislatie.just.ro/Public/DetaliiDocument/171282" },
  { nume: "ANAF, ghidul sistemului RO e-Factura (2023)", url: "https://static.anaf.ro/static/10/Anaf/AsistentaContribuabili_r/Ghid_RO_eFactura.pdf" },
];

const META = {
  titlu: "Arhivarea e-facturilor în UE: termene și format pe țări",
  descriere:
    "Cât timp păstrezi e-facturile și în ce format: Germania, Franța, Polonia, Belgia și România, cu surse primare și data verificării fiecărui rând.",
  cale: CALE,
};

// Rol: titlul-teza al eroului (h1 al fisei).
const H1 = "Arhivarea e-facturilor în UE: cât timp le păstrezi și în ce format";

/**
 * Sursele oficiale de langa valori (tabel, jurnal, ghidul autoritatii), pe aceleasi chei ca pe paginile RO si EN.
 * Eticheta, autoritatea si titlul sunt cele publicate de surse (identice cu RO, permise); `ce` e o nota de lucru,
 * nerandata.
 */
const SURSE_TABEL: Record<string, Sursa> = {
  roGhid: {
    id: "ro-ghid-efactura",
    eticheta: "ANAF, e-Factura",
    autoritate: "ANAF",
    titlu: "Ghid privind utilizarea sistemului național RO e-Factura",
    url: "https://static.anaf.ro/static/10/Anaf/AsistentaContribuabili_r/Ghid_RO_eFactura.pdf",
    ce: "Cap. I, cap. III pct. 5 și cap. IV ale ghidului din 2023.",
  },
  ueVida: {
    id: "ue-directiva-2025-516",
    eticheta: "EUR-Lex",
    autoritate: "EUR-Lex, Jurnalul Oficial al UE",
    titlu: "Directiva (UE) 2025/516 a Consiliului din 11 martie 2025 (TVA în era digitală)",
    url: "https://eur-lex.europa.eu/legal-content/RO/TXT/?uri=CELEX:32025L0516",
    ce: "Art. 6 alin. (5): data de 1 iulie 2030; standardul EN 16931.",
  },
  de: {
    id: "de-bmf-e-rechnung",
    eticheta: "BMF",
    autoritate: "Bundesministerium der Finanzen",
    titlu: "Fragen und Antworten zur Einführung der obligatorischen (verpflichtenden) E-Rechnung zum 1. Januar 2025 (Stand: März 2026)",
    url: "https://www.bundesfinanzministerium.de/Content/DE/FAQ/e-rechnung.html",
    ce: "Definiția e-facturii, formatele admise, întrebarea 11.",
  },
  fr: {
    id: "fr-dgfip-guide-pratique",
    eticheta: "DGFiP",
    autoritate: "Direction générale des Finances publiques (impots.gouv.fr)",
    titlu: "Guide pratique pour accompagner la mise en œuvre de la réforme de la facturation électronique",
    url: "https://www.impots.gouv.fr/sites/default/files/media/1_metier/2_professionnel/EV/2_gestion/290_facturation_electronique/guide_pratique_facturation_electronique.pdf",
    ce: "Calendarul din 2026 și 2027, platformele acreditate.",
  },
  pl: {
    id: "pl-ksef-terminy",
    eticheta: "Ministerstwo Finansów",
    autoritate: "Ministerstwo Finansów (podatki.gov.pl)",
    titlu: "Podstawy prawne oraz kluczowe terminy KSeF",
    url: "https://ksef.podatki.gov.pl/informacje-ogolne-ksef-20/podstawy-prawne-oraz-kluczowe-terminy",
    ce: "Datele din 2026, facilitățile, structura FA(3).",
  },
  be: {
    id: "be-efacture-obligation",
    eticheta: "SPF BOSA",
    autoritate: "SPF Stratégie et Appui (efacture.belgium.be)",
    titlu: "Les factures électroniques structurées entre entreprises sont obligatoires depuis 2026",
    url: "https://efacture.belgium.be/fr/article/les-factures-electroniques-structurees-entre-entreprises-sont-obligatoires-depuis-2026",
    ce: "Obligația din 1 ianuarie 2026, prin rețeaua Peppol.",
  },
  beToleranta: {
    id: "be-efacture-tolerance",
    eticheta: "SPF BOSA, toleranța",
    autoritate: "SPF Stratégie et Appui (efacture.belgium.be)",
    titlu: "Fin de la période de tolérance pour l’e-facturation (7 aprilie 2026)",
    url: "https://efacture.belgium.be/fr/news/fin-de-la-periode-de-tolerance-pour-le-facturation",
    ce: "Sfârșitul toleranței generale; autofacturarea, până la 30 iunie 2026.",
  },
};

export const EFACTURARE_RO_MD: ContinutEfacturare = {
  cale: CALE,
  // `limba` e `inLanguage` al nodului FAQPage (singurul cititor): din asezare, ca nodurile de mai jos.
  limba: atributeLimba("ro-MD").inLanguage,
  surse: SURSE_TABEL,
  erou: {
    // pagina.ts:20-21.
    fir: [
      { text: "Acasă", cale: "/ro" },
      { text: "E-facturi", cale: CALE },
    ],
    titlu: H1,
    // pagina.ts:29: capsula fisei.
    subtitlu:
      "Fiecare stat din UE își stabilește termenul de păstrare a facturilor: 8 ani în Germania, 10 în Franța, 7 în Belgia și 5 în România. În Polonia, sistemul KSeF păstrează facturile structurate timp de 10 ani. Germania și Franța prevăd păstrarea fișierului electronic original, de regulă XML-ul. Pentru fiecare termen, ghidul indică temeiul legal și data verificării.",
    // Butoanele eroului le pune pagina (canalul WhatsApp si celelalte canale); aici numai cel de contur, ca tinta.
    butonPlin: { text: ETICHETA_BUTON_CANAL_RO_MD, href: null, ruta: null },
    butonContur: { text: "Alte canale", href: "/ro/contact", ruta: "/ro/contact" },
  },
  macheta: {
    // pagina.ts:35-43.
    declaratie: "Exemplu cu date fictive: drumul unei facturi până în arhiva 3S",
    eticheta: "Exemplu",
    factura: "F-2026-0412",
    etichete: ["XML", "EN 16931"],
    // Ramane numai incarcarea din browser (decizia 43: Peppol, Storecove, e-mail; decizia 49: WhatsApp).
    canale: ["Încărcare"],
    arhiva: "Arhiva 3S",
    ani: "2026 → 2034",
    // AES-256 si jurnalul ies (decizia 31); in locul lor, doua fapte confirmate. Gazduirea: decizia 42.
    insigne: ["Căutare", "Frankfurt", "Export"],
  },
  // pagina.ts:48.
  fraza: "RO e-Factura îți permite să descarci XML-ul unei facturi timp de 60 de zile. În arhiva firmei îl păstrezi cât hotărăști tu.",
  mandate: {
    // pagina.ts:52-56.
    titlu: "Șase piețe, șase calendare diferite",
    text: "Fiecare stat își stabilește sistemul, formatul și datele de aplicare. O firmă care vinde în trei state ține evidența a trei calendare, fiecare cu propriile cerințe tehnice. Tabelul de mai jos le prezintă comparativ, cu documentul oficial pentru fiecare țară.",
    batai: [
      "Polonia folosește sistemul național KSeF, Belgia rețeaua Peppol, România sistemul RO e-Factura, iar Franța platformele acreditate de administrația fiscală. În Germania, din 2025, orice firmă trebuie să poată primi e-facturi în format XRechnung sau ZUGFeRD. Din 1 iulie 2030, Directiva (UE) 2025/516 introduce reguli comune pentru livrările între statele membre.",
      "Indiferent de canal, facturile pot fi păstrate într-un singur loc: arhiva firmei. În 3S, un XML descărcat din RO e-Factura stă lângă o factură PDF scanată, într-un dosar cu propriul termen de păstrare, iar o singură întrebare le găsește pe amândouă, fiecare cu sursa răspunsului.",
    ],
  },
  tabel: {
    // pagina.ts:61-73, piete.ts.
    titlu: "Ce țări impun e-facturarea și de când?",
    text: "Rândurile se referă la facturile dintre firme. Fiecare rând indică documentul oficial folosit, iar sub tabel apare data la care l-am consultat.",
    capete: ["Țara", "Ce se aplică", "De când", "Format și canal"],
    eticheteSursa: "Sursa",
    piete: [
      {
        ancora: "germania",
        tara: "Germania",
        ce: "Orice firmă germană trebuie să poată primi e-facturi; emiterea devine obligatorie treptat, după cifra de afaceri.",
        cand: "Primirea, din 1 ianuarie 2025. Hârtia sau PDF-ul la emitere rămân permise până la 31 decembrie 2026, iar la o cifră de afaceri anterioară de cel mult 800.000 EUR, până la finalul lui 2027.",
        format: "XRechnung sau ZUGFeRD 2.0.1 ori mai nou",
        surse: ["de"],
      },
      {
        ancora: "franta",
        tara: "Franța",
        ce: "Toate firmele vizate trebuie să poată primi e-facturi; emiterea începe cu firmele mari și cele intermediare.",
        cand: "Din 1 septembrie 2026 emit firmele mari și cele intermediare; toate firmele vizate trebuie să poată primi. IMM-urile și microîntreprinderile emit de la 1 septembrie 2027.",
        format: "Prin platforme autorizate de administrația fiscală",
        surse: ["fr"],
      },
      {
        ancora: "polonia",
        tara: "Polonia",
        ce: "Facturile structurate se emit în KSeF, sistemul național al Ministerului Finanțelor.",
        cand: "De la 1 februarie 2026, pentru firmele cu vânzări în 2024 de peste 200 mil. PLN; de la 1 aprilie 2026, pentru celelalte. Unele facilități se aplică până la finalul lui 2026.",
        format: "Structura FA(3), prin KSeF",
        surse: ["pl"],
      },
      {
        ancora: "belgia",
        tara: "Belgia",
        ce: "Între firmele belgiene înregistrate în scopuri de TVA se transmit numai e-facturi structurate, prin rețeaua Peppol.",
        cand: "Din 1 ianuarie 2026. Toleranța generală a acoperit primele trei luni, iar pentru autofacturare s-a prelungit până la 30 iunie 2026.",
        format: "Rețeaua Peppol",
        surse: ["be", "beToleranta"],
      },
      {
        ancora: "romania",
        tara: "România",
        ce: "Între firmele stabilite în România, facturile se transmit prin RO e-Factura.",
        cand: "Raportarea facturilor B2B din 1 ianuarie 2024; transmiterea prin RO e-Factura din 1 iulie 2024.",
        format: "XML conform EN 16931 și RO_CIUS",
        surse: ["roGhid"],
      },
      {
        ancora: "uniunea-europeana",
        tara: "UE (ViDA)",
        ce: "Directiva (UE) 2025/516 aduce facturarea electronică și raportarea digitală pentru livrările dintre statele membre.",
        cand: "Statele membre aplică noile reguli de la 1 iulie 2030 (art. 6 alin. (5) din directivă).",
        format: "Standardul european EN 16931",
        surse: ["ueVida"],
      },
    ],
    ancoraEvidentiata: "romania",
    titluModificari: "Schimbări recente",
    modificari: [
      { text: "1 septembrie 2026, FR: încep să emită firmele mari și cele de talie intermediară." },
      { text: "1 aprilie 2026, PL: KSeF devine obligatoriu pentru toate firmele." },
      { text: "1 aprilie 2026, BE: se încheie perioada generală de toleranță din primele trei luni." },
    ],
    // Calendarul .ics nu se monteaza: fisierul are termenele romanesti D406, iar ruta lui exista numai pe site-ul RO.
    verificare: "Date verificate la sursa oficială pe",
    dataVerificarii: "2026-09-30",
    dataVerificariiText: "30 septembrie 2026",
    nota: "Ghidul are caracter informativ și nu constituie consultanță juridică. Tabelul nu cuprinde facturile către persoane fizice. Pentru firmele din Republica Moldova, consultă",
    notaLegatura: {
      text: "ghidul pentru Moldova",
      href: "/ro/ghiduri/termene-pastrare-moldova",
      ruta: "/ro/ghiduri/termene-pastrare-moldova",
    },
  },
  jurnal: {
    // pagina.ts:77-80, piete.ts:92-127.
    eticheta: "Istoric verificat",
    titlu: "Anul 2026, țară cu țară",
    text: "Fiecare schimbare de mai jos a fost verificată în documentul publicat de autoritatea competentă. Intrarea trimite la acel document, iar eticheta țării duce la rândul corespunzător din tabel.",
    legatura: "Documentul oficial",
    prefixTara: "Rândul țării în tabel: ",
    intrari: [
      {
        data: "2026-09-01",
        dataText: "1 septembrie 2026",
        cod: "FR",
        ancora: "franta",
        text: "Emit firmele mari și cele de talie intermediară, iar orice firmă vizată trebuie să poată primi e-facturi. IMM-urile și microîntreprinderile emit din 2027.",
        sursa: "fr",
      },
      {
        data: "2026-04-01",
        dataText: "1 aprilie 2026",
        cod: "BE",
        ancora: "belgia",
        text: "Se încheie perioada generală de toleranță din primele trei luni. Pentru autofacturare se aplică o toleranță mai restrânsă, până la 30 iunie 2026.",
        sursa: "beToleranta",
      },
      {
        data: "2026-04-01",
        dataText: "1 aprilie 2026",
        cod: "PL",
        ancora: "polonia",
        text: "KSeF devine obligatoriu pentru toți contribuabilii rămași. Pragul de vânzări de 200 mil. PLN nu se mai aplică.",
        sursa: "pl",
      },
      {
        data: "2026-02-01",
        dataText: "1 februarie 2026",
        cod: "PL",
        ancora: "polonia",
        text: "KSeF devine obligatoriu pentru firmele cu vânzări în 2024 de peste 200 mil. PLN, cu TVA inclus, și intră în producție KSeF 2.0.",
        sursa: "pl",
      },
      {
        data: "2026-01-01",
        dataText: "1 ianuarie 2026",
        cod: "BE",
        ancora: "belgia",
        text: "E-facturile structurate devin obligatorii între firmele belgiene înregistrate în scopuri de TVA și se transmit prin rețeaua Peppol.",
        sursa: "be",
      },
    ],
  },
  treiReguli: {
    // pagina.ts:84-100, page.tsx:275.
    titlu: "Trei repere din regula românească",
    text: "Ce spune ghidul ANAF din 2023 despre RO e-Factura, rezumat în trei carduri.",
    carduri: [
      {
        iconita: "timer",
        titlu: "Două etape în 2024",
        text: "Din 1 ianuarie 2024, firmele stabilite în România au obligația de a raporta în RO e-Factura facturile pe care și le emit reciproc. Din 1 iulie 2024, între aceste firme au valoare de factură numai documentele transmise prin sistem.",
      },
      {
        iconita: "file-code",
        titlu: "Un singur format",
        text: "Factura este un fișier XML care respectă standardul european EN 16931 și regulile naționale RO_CIUS. Originalul este fișierul XML cu sigiliul electronic al Ministerului Finanțelor. Un PDF nu este e-factură în sensul acestor reguli.",
      },
      {
        iconita: "archive",
        titlu: "60 de zile în sistem",
        text: "Este perioada în care XML-ul se descarcă direct din RO e-Factura, conform ghidului publicat de ANAF în 2023. Ulterior, ANAF arhivează fișierul electronic și îl eliberează numai la cerere. O firmă care va avea nevoie de factură peste ani își păstrează propria copie.",
      },
    ],
    ghid: { cheie: "roGhid", text: "Ghidul ANAF pentru RO e-Factura (2023)" },
  },
  emiterea: {
    // pagina.ts:106-114.
    titlu: "Anii de după transmitere: unde se află factura când o solicită contabilul, un auditor sau un partener",
    text: "Termenul de păstrare diferă după țară și document și se întinde pe ani. Pe toată această durată, factura trebuie să rămână lizibilă și integră, iar în Germania și Franța, în forma electronică originală.",
    paragrafe: [
      "O inspecție fiscală, o dispută cu un furnizor sau o solicitare a băncii pot aduce din nou în discuție o factură emisă cu ani în urmă. În acel moment contează să o găsești repede, împreună cu fișierul XML original și cu data primirii. Un exemplar tipărit sau un PDF cu alt nume nu mai arată de unde provine documentul și nici dacă a fost modificat.",
      "RO e-Factura nu înlocuiește arhiva proprie: ghidul ANAF din 2023 arată că fișierele pot fi descărcate direct 60 de zile, după care se solicită de la ANAF. Copiile ajung adesea pe mai multe calculatoare, în atașamente redirecționate și în foldere denumite diferit. Unele dispar, altele apar în dublu exemplar, iar la un control nu mai este clar care este originalul. Când persoana care le-a descărcat pleacă din firmă, documentele pot pleca odată cu ea, rămase pe un laptop pe care nimeni nu îl mai folosește.",
    ],
    rezolvare:
      "În 3S, fiecare factură se află în arhiva firmei, în dosarul pe care îl alegi. Fișierele sunt stocate în Uniunea Europeană, cu regiunea principală la Frankfurt. Termenul de păstrare îl stabilești pe dosar.",
    legatura: { text: "Unde stochează 3S fișierele", href: "/ro/securitate#security", ruta: "/ro/securitate" },
  },
  rigla: {
    // pagina.ts:118-123, Rigla11Ani.tsx:93 (implicitul RO al descrierii ramane).
    titlu: "O factură, păstrată cât timp hotărăști tu",
    subtitlu: "Exemplu: o factură primită în 2026, într-un dosar păstrat 8 ani.",
    fisier: "F-2026-0412.xml",
    eticheta: "primită în octombrie 2026",
    banda: "după 8 ani: sfârșitul termenului de păstrare",
    nota: "În 3S poți stabili un termen de păstrare pentru fiecare dosar, iar acesta se aplică documentelor din el.",
    anStart: 2026,
    aniScala: 11,
    aniPastrare: 8,
    descriere: "Scala anilor: de la 2026 la 2037; păstrarea din exemplu ține până în 2034.",
  },
  casa: {
    // pagina.ts:131-147.
    titlu: "Cum te poate ajuta 3S?",
    text: "Trei lucruri pe care le poți face cu facturile în 3S, indiferent de programul care le emite.",
    pasi: [
      {
        titlu: "Întreabă în cuvintele tale",
        text: "Caută, de exemplu, „facturile de energie din martie”: primești lista, iar fiecare rezultat indică documentul din care provine. Întrebările în română sunt disponibile, iar cele în engleză sunt în testare.",
      },
      {
        titlu: "Exportă documentele la cerere",
        text: "Când contabilul sau un auditor îți solicită documente, exporți din arhivă pe cele de care are nevoie.",
      },
      {
        titlu: "Termen de păstrare pe dosar",
        text: "Fiecare dosar poate avea propriul termen de păstrare, valabil pentru toate documentele pe care le conține.",
      },
    ],
    legatura: { text: "Vezi platforma 3S", href: "/ro/platforma", ruta: "/ro/platforma" },
  },
  standarde: {
    // pagina.ts:151-153; Peppol iese (decizia 43: integrare cu nume; e o retea, nu un format).
    titlu: "Formatele menționate în acest ghid",
    text: "În 3S, o factură XML se încarcă la fel ca orice alt fișier.",
    insigne: ["EN 16931", "RO_CIUS", "XRechnung", "ZUGFeRD", "FA(3)", "XML", "PDF"],
  },
  intrebari: {
    // pagina.ts:157-182.
    titlu: "Întrebări frecvente",
    intrebari: [
      {
        intrebare: "Cât timp se păstrează e-facturile în fiecare țară?",
        raspuns:
          "Germania cere 8 ani, Franța 10 ani pentru documentele contabile, Belgia 7 ani, iar România 5 ani. În Polonia, KSeF păstrează facturile structurate 10 ani; după acest termen, le păstrezi în afara KSeF numai dacă obligația fiscală nu s-a prescris.",
      },
      {
        intrebare: "În ce format se păstrează e-facturile?",
        raspuns:
          "Păstrează XML-ul original, așa cum l-ai trimis sau primit: Germania și Franța cer acest lucru. Belgia și România acceptă și alte formate, dacă sunt garantate autenticitatea și integritatea.",
      },
      {
        intrebare: "Ce este Peppol?",
        raspuns:
          "O rețea pentru schimbul de e-facturi. Din 1 ianuarie 2026, firmele belgiene înregistrate în scopuri de TVA își transmit prin ea e-facturile structurate. Tabelul de mai sus arată canalul folosit în fiecare țară.",
      },
      {
        intrebare: "Pot încărca în 3S fișierele XML din RO e-Factura?",
        raspuns:
          "Da. Descarci facturile ca fișiere XML din RO e-Factura și le încarci în arhivă, ca pe orice alt fișier, alături de celelalte documente ale firmei.",
      },
      {
        intrebare: "Cine mai păstrează facturile tale?",
        raspuns:
          "În Polonia, KSeF păstrează fiecare factură structurată 10 ani de la sfârșitul anului emiterii. În România, RO e-Factura ține XML-ul disponibil pentru descărcare 60 de zile, apoi îl arhivează și îl eliberează la cerere.",
      },
    ],
  },
};

/** `acasa.ts:800-829`: blocul de final, cu titlul si subtitlul fisei. */
export const CTA_FINAL_EFACTURARE_RO_MD = ctaFinalReferintaRoMd(
  "Ai nevoie de o arhivă proprie pentru facturi?",
  "Spune-ne din ce țări provin facturile tale și câte păstrezi, aproximativ.",
);

export const PAGINA_EFACTURARE_RO_MD: PaginaReferinta = {
  cheie: "guides-e-invoice-archiving-eu",
  meta: META,
  h1: H1,
  cta: {
    ref: "ro-md-einv",
    textWhatsapp: "Bună ziua, 3S. Am citit ghidul despre arhivarea e-facturilor [ref:ro-md-einv]. Aș dori să întreb despre un pilot.",
    subiectEmail: "Întrebare 3S [ref:ro-md-einv]",
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
      about: ["Germania", "Franța", "Polonia", "Belgia", "România"].map((name) => ({ "@type": "Country", name })),
      citation: SURSE_ARTICOL.map((s) => s.nume + ", " + s.url),
    },
    {
      "@type": "WebPage",
      name: META.titlu,
      description: META.descriere,
      inLanguage: atributeLimba("ro-MD").inLanguage,
    },
  ],
  afirmatii: [
    "ro-md-referinta-efacturare-ue-art-247",
    "ro-md-referinta-efacturare-arhivare-pe-tari",
    "ro-md-referinta-efacturare-format",
    "ro-md-referinta-efacturare-stocare-locatie",
    "ro-md-referinta-efacturare-ro-60-zile",
    "ro-md-referinta-efacturare-calendar",
    "ro-md-referinta-efacturare-incarcare-xml",
    "ro-md-arhiva-cu-sursa",
    "ro-md-engleza-si-pagina-in-testare",
    "ro-md-functii-in-productie",
    "ro-md-termene-si-jurnal",
    "ro-md-gazduire-ue-frankfurt",
    "ro-md-ghiduri-cu-surse",
    "ro-md-raspunde-o-persoana",
    "ro-md-canale-de-contact",
  ],
};
