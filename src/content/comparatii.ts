// Continutul celor doua pagini de comparatie (comparatie-drive.md, comparatie-stocare.md).
//
// PUBLICITATE COMPARATIVA (Legea nr. 158/2008). Paginile numesc doua produse ale unor terti, Google
// Drive si Amazon S3, doar nominativ (fara siglele lor). Fiecare marcaj al unui tert are nota lui si
// cel putin o sursa din documentatia OFICIALA publica a producatorului, citita pe 25.09.2026; unde
// produsul face ceva bine, marcajul o spune (da / partial), iar nota de concesie de pe pagina e un
// fapt adevarat. Unde documentatia depinde de planul de abonament, nota o spune. Un marcaj fara
// sursa nu trece proba `tests/comparatii-termene.test.ts`.
//
// COLOANA 3S. Fiecare marcaj trimite la o intrare din registrul feliei
// (`src/content/afirmatii/comparatii-termene.json`), confirmata sau nu. Semnatura calificata nu
// apare: 3S o are in curs de integrare (decizia D4c), deci un rand cu ea nu putea primi "da".
//
// DATE FICTIVE in machete (numele fisierului, rolurile, adresa bucket-ului), declarate ca exemplu
// pentru cititoarele de ecran (plan D9). Nimic din exemplele referintei vizuale.
//
// LUNGIMILE din comentarii sunt ale referintei, pe acelasi rol, numarate pentru lungime.

import type { Legatura } from "@/content/navigatie";
import { CALE_INREGISTRARE } from "@/content/navigatie";

export type Marcaj = "da" | "partial" | "nu";

export type SursaOficiala = {
  /** Titlul paginii de documentatie si cine o publica. */
  eticheta: string;
  url: string;
};

export type CelulaTert = {
  marcaj: Marcaj;
  /** Ce spune documentatia, in cuvintele noastre: temeiul marcajului. */
  nota: string;
  surse: SursaOficiala[];
};

export type Celula3S = {
  marcaj: Marcaj;
  /** Id-ul intrarii din registrul de afirmatii al feliei. */
  afirmatie: string;
};

export type RandComparatie = {
  functie: string;
  /** Cate o celula pentru fiecare coloana de tert, in ordinea din `coloaneTerti`. */
  terti: CelulaTert[];
  noi: Celula3S;
};

export type TabelComparatie = {
  titlu: string;
  capFunctie: string;
  coloaneTerti: string[];
  coloanaNoi: string;
  randuri: RandComparatie[];
  /** Latimea minima a tabelului si latimea coloanelor de marcaj (px), apoi cea de sub 768. */
  latimeMinima: number;
  latimeColoana: number;
  latimeColoanaMica: number;
  /** Titlul casetei pliate cu sursele marcajelor tertilor. */
  titluSurse: string;
  notaSurse: string;
};

export const LEGENDA_MARCAJE: Record<Marcaj, string> = {
  da: "Da",
  partial: "Parțial",
  nu: "Nu",
};

export const DATA_CITIRII_COMPARATII = "25 septembrie 2026";

// ---------------------------------------------------------------------------------------------
// Sursele oficiale, citite pe 25.09.2026
// ---------------------------------------------------------------------------------------------

const G_CAUTARE: SursaOficiala = {
  eticheta: "Căutarea fișierelor în Google Drive, Ajutor Google Drive",
  url: "https://support.google.com/drive/answer/2375114?hl=ro",
};
const G_OCR: SursaOficiala = {
  eticheta: "Conversia fișierelor PDF și foto în text, Ajutor Google Drive",
  url: "https://support.google.com/drive/answer/176692?hl=ro",
};
const G_ETICHETE_AI: SursaOficiala = {
  eticheta: "Etichetarea automată a fișierelor Drive cu clasificare AI, Ajutor Google Workspace",
  url: "https://knowledge.workspace.google.com/admin/security/label-google-drive-files-automatically-using-ai-classification?hl=ro",
};
const G_VAULT: SursaOficiala = {
  eticheta: "Cum funcționează păstrarea în Google Vault, Ajutor Google Workspace",
  url: "https://knowledge.workspace.google.com/vault/retention/how-retention-works?hl=ro",
};
const G_PRODUS: SursaOficiala = {
  eticheta: "Pagina produsului Google Drive, Google Workspace",
  url: "https://workspace.google.com/products/drive/",
};
const G_PARTAJARE: SursaOficiala = {
  eticheta: "Trimiterea fișierelor din Google Drive, Ajutor Google Drive",
  url: "https://support.google.com/drive/answer/2494822?hl=ro",
};
const G_ATASAMENTE: SursaOficiala = {
  eticheta: "Deschiderea și descărcarea atașamentelor în Gmail, Ajutor Gmail",
  url: "https://support.google.com/mail/answer/30719?hl=ro",
};
const G_JURNAL: SursaOficiala = {
  eticheta: "Evenimentele din jurnalul Drive, Ajutor Google Workspace",
  url: "https://knowledge.workspace.google.com/admin/reports/drive-log-events?hl=ro",
};
const G_SCANARE: SursaOficiala = {
  eticheta: "Scanarea documentelor cu Google Drive, Ajutor Google Drive",
  url: "https://support.google.com/drive/answer/3145835?hl=ro",
};
const G_CRIPTARE_STOCARE: SursaOficiala = {
  eticheta: "Criptarea implicită a datelor stocate, documentația Google Cloud",
  url: "https://cloud.google.com/docs/security/encryption/default-encryption",
};
const G_CRIPTARE_TRANZIT: SursaOficiala = {
  eticheta: "Criptarea datelor în tranzit, documentația Google Cloud",
  url: "https://cloud.google.com/docs/security/encryption-in-transit",
};
const G_REGIUNI: SursaOficiala = {
  eticheta: "Alegerea locației geografice a datelor, Ajutor Google Workspace",
  url: "https://knowledge.workspace.google.com/admin/compliance/choose-a-geographic-location-for-your-data?hl=ro",
};

const A_CRIPTARE: SursaOficiala = {
  eticheta: "Configuring default encryption, documentația Amazon S3",
  url: "https://docs.aws.amazon.com/AmazonS3/latest/userguide/default-bucket-encryption.html",
};
const A_BUNE_PRACTICI: SursaOficiala = {
  eticheta: "Security best practices for Amazon S3, documentația Amazon S3",
  url: "https://docs.aws.amazon.com/AmazonS3/latest/userguide/security-best-practices.html",
};
const A_BUCKET: SursaOficiala = {
  eticheta: "Creating a general purpose bucket, documentația Amazon S3",
  url: "https://docs.aws.amazon.com/AmazonS3/latest/userguide/create-bucket-overview.html",
};
const A_ACCES: SursaOficiala = {
  eticheta: "Access control in Amazon S3, documentația Amazon S3",
  url: "https://docs.aws.amazon.com/AmazonS3/latest/userguide/access-management.html",
};
const A_JURNALE: SursaOficiala = {
  eticheta: "Logging requests with server access logging, documentația Amazon S3",
  url: "https://docs.aws.amazon.com/AmazonS3/latest/userguide/ServerLogs.html",
};
const A_OBJECT_LOCK: SursaOficiala = {
  eticheta: "Locking objects with Object Lock, documentația Amazon S3",
  url: "https://docs.aws.amazon.com/AmazonS3/latest/userguide/object-lock.html",
};

/** Toate sursele oficiale folosite, pentru probe. */
export const SURSE_OFICIALE: SursaOficiala[] = [
  G_CAUTARE,
  G_OCR,
  G_ETICHETE_AI,
  G_VAULT,
  G_PRODUS,
  G_PARTAJARE,
  G_ATASAMENTE,
  G_JURNAL,
  G_SCANARE,
  G_CRIPTARE_STOCARE,
  G_CRIPTARE_TRANZIT,
  G_REGIUNI,
  A_CRIPTARE,
  A_BUNE_PRACTICI,
  A_BUCKET,
  A_ACCES,
  A_JURNALE,
  A_OBJECT_LOCK,
];

/** Domeniile documentatiei oficiale a celor doi producatori. */
export const DOMENII_OFICIALE = [
  "support.google.com",
  "knowledge.workspace.google.com",
  "workspace.google.com",
  "cloud.google.com",
  "docs.aws.amazon.com",
];

const BUTON_CONT: Legatura = {
  // Rol: incercarea gratuita (buton plin-plat, 232x52 [fisa]). Textul are ~168 px la 16/600, cat
  // cere butonul de 232 cu padding 32 + 32 (masurat: 167,9).
  text: "Începeți acum, gratuit",
  href: CALE_INREGISTRARE,
  ruta: CALE_INREGISTRARE,
};

// ---------------------------------------------------------------------------------------------
// /comparatie-drive
// ---------------------------------------------------------------------------------------------

export const CALE_COMPARATIE_DRIVE = "/comparatie-drive";
export const CALE_COMPARATIE_STOCARE = "/comparatie-stocare";

export const COMPARATIE_DRIVE = {
  meta: {
    titlu: "3S și Google Drive, comparate funcție cu funcție",
    descriere:
      "Registrul arhivei, termenele legale și căutarea cu sursa citată din 3S, puse lângă Google Drive, cu documentația oficială a fiecărui marcaj.",
  },
  fir: [
    { text: "Acasă", cale: "/" },
    // Rol: pagina curenta, un cuvant [fisa].
    { text: "Comparație", cale: CALE_COMPARATIE_DRIVE },
  ],
  erou: {
    // Rol: titlul paginii, ce devine drive-ul firmei cu 3S; h1 pe 2 randuri. Lungime: ~48 [fisa].
    titlu: "Drive-ul firmei, dar cu registru și termene legale",
    // Rol: ce lipseste unui drive si ce face 3S; 2 randuri la 1440. Lungime: ~150 [numarat].
    subtitlu:
      "Un drive nu știe cât se păstrează o factură sau unde e statul de plată al unui fost salariat. 3S le ține în registru și le găsește la o întrebare pe WhatsApp.",
  },
  divizat: {
    stanga: {
      titlu: "Unde un drive își face treaba",
      // Trei randuri scurte: cate unul la 1440 si la 390 [fisa].
      elemente: [
        "Fișiere care se schimbă de la o zi la alta",
        "Același document, editat de colegi deodată",
        "Schițe, prezentări, oferte în lucru",
      ],
      // Rol: nota de concesie, ce face tertul bine (1 rand la 1440).
      nota: "Pentru lucrul în echipă, Google Drive e foarte bun.",
    },
    dreapta: {
      titlu: "Unde începe treaba unei arhive",
      // La 390 primele trei au 2 randuri si ultimul 1 (42 / 42 / 42 / 21), la 1440 toate 1 [fisa].
      elemente: [
        "Foști salariați cer adeverințe din anii trecuți",
        "Un control fiscal cere facturi de acum câțiva ani",
        "Fiecare tip de act are alt termen de păstrare",
        "Actele se caută după ce scrie în ele",
      ],
    },
  },
  stocare: {
    // Rol: capul diagramei; h2 si paragraful pe 1 rand la 1440 si pe 2 la 390 [fisa].
    titlu: "Unde pot sta fișierele cu care lucrează 3S",
    text: "3S lucrează pe un bucket S3, pe Google Drive sau pe stocarea 3S din Germania.",
    // Sub-titlul primului card: 1 rand la 1440, 2 la 390 (card de 92 px); celelalte, 1 rand [fisa].
    optiuni: [
      {
        iconita: "server",
        titlu: "Un bucket S3 propriu",
        sub: "În contul Amazon al firmei sau la alt furnizor compatibil S3",
      },
      { iconita: "cloud", titlu: "Google Drive, cont de firmă", sub: "Legat prin contul Google Workspace" },
      { iconita: "database", titlu: "Stocarea 3S", sub: "Pe serverele Amazon din Germania" },
    ] as { iconita: "server" | "cloud" | "database"; titlu: string; sub: string }[],
    nod: "3S",
    // Eticheta accesibila a diagramei (liniile sunt decorative).
    eticheta: "Cele trei locuri de stocare cu care lucrează 3S",
  },
  drum: {
    // Rol: capul sinei de 4 pasi; aici viata unui act pe hartie in arhiva 3S, de la scanare la
    // capatul termenului. h2 pe 1 rand la 1440 si pe 2 la 390 [fisa].
    titlu: "Un act pe hârtie, pas cu pas, în arhiva 3S",
    declaratie: "Exemplu cu date fictive: numele fișierului, mărimea, rolurile și poziția din registru sunt inventate.",
    // Eticheta vizibila din coltul primei scene (decizia D11: macheta cu o factura poarta
    // "exemplu" la vedere, nu doar pentru cititoarele de ecran).
    exemplu: "exemplu",
    // Textul fiecarui pas: cel mult 2 randuri si la 1440 (202 px), si la 390 (169 px) [fisa].
    pasi: [
      { numar: "01", titlu: "Predat și scanat", text: "3S scanează hârtia și îi scoate textul" },
      { numar: "02", titlu: "Intră în registru", text: "Primește termenul legal, numărat de 3S" },
      { numar: "03", titlu: "Acces pe persoană", text: "Îl deschide doar biroul financiar, nu toată echipa" },
      { numar: "04", titlu: "La capătul termenului", text: "3S anunță, iar comisia de selecționare decide" },
    ],
    machete: {
      fisier: "scan-exemplu-0417.pdf",
      marime: "312 KB",
      tip: "Factură",
      // Termenul unei facturi in Romania: 5 ani (src/content/termene/romania.ts, randul facturi).
      termen: "5 ani",
      // Bara din scena 2: cat s-a scurs din termen.
      progres: 72,
      // Scena 3: primul rol are acces (randul activ), celelalte doua nu.
      persoane: ["Financiar", "Vânzări", "Logistică"],
      // Scena 4: pozitia actului in registru (acelasi numar ca in numele fisierului).
      registru: "Poziția 0417",
    },
  },
  tabel: {
    titlu: "Funcție cu funcție: Drive și 3S",
    capFunctie: "Funcția",
    // Capul coloanei tertului sta pe 2 randuri la ambele latimi, ca la referinta (73 px la 1440,
    // 69 la 390). "Google Drive" incape pe un rand in cele 96 px de la 1440 (87,5 masurat), deci
    // randul se rupe explicit, prin "\n" (foaia pune `white-space: pre-line` pe capetele de marcaj).
    // Un cuvant mai lung de 60 px ar fi largit coloana la 390 peste cele 88 px. Dependenta de
    // planul Workspace e spusa in nota surselor, nu in cap.
    coloaneTerti: ["Google\nDrive"],
    coloanaNoi: "3S",
    latimeMinima: 420,
    latimeColoana: 136,
    latimeColoanaMica: 88,
    titluSurse: "De unde vin marcajele pentru Google Drive",
    notaSurse:
      "Marcajele urmează documentația publică Google, citită pe " +
      DATA_CITIRII_COMPARATII +
      ". Mai multe funcții depind de planul Google Workspace ales.",
    randuri: [
      {
        functie: "Evidența arhivei",
        terti: [
          {
            marcaj: "nu",
            nota: "Google Vault păstrează sau șterge datele după reguli puse de administrator, fără un registru de arhivă cu termenul fiecărui act.",
            surse: [G_VAULT],
          },
        ],
        noi: { marcaj: "da", afirmatie: "comparatii-registru-termene" },
      },
      {
        functie: "Avertizare la termene",
        terti: [
          {
            marcaj: "partial",
            nota: "Regulile de păstrare din Google Vault țin sau șterg datele după o durată aleasă de administrator.",
            surse: [G_VAULT],
          },
        ],
        noi: { marcaj: "da", afirmatie: "comparatii-termene-avertizare" },
      },
      {
        functie: "Căutare AI cu sursa citată",
        terti: [
          {
            marcaj: "da",
            nota: "Cu funcțiile Gemini din Workspace, căutarea din Drive dă un răspuns rezumat din fișiere, cu legături spre sursele folosite.",
            surse: [G_CAUTARE, G_PRODUS],
          },
        ],
        noi: { marcaj: "da", afirmatie: "comparatii-cautare-cu-sursa" },
      },
      {
        functie: "Text din scanări și fotografii",
        terti: [
          {
            marcaj: "partial",
            nota: "Textul se obține deschizând fiecare PDF sau fotografie în Google Docs; Google recomandă fișiere de cel mult 2 MB.",
            surse: [G_OCR],
          },
        ],
        noi: { marcaj: "da", afirmatie: "comparatii-text-din-scanari" },
      },
      {
        functie: "Clasare după conținut",
        terti: [
          {
            marcaj: "partial",
            nota: "Etichetarea automată cu AI există în planurile Enterprise Plus și Frontline Plus sau prin suplimente, configurată de administrator.",
            surse: [G_ETICHETE_AI],
          },
        ],
        noi: { marcaj: "da", afirmatie: "comparatii-clasare-automata" },
      },
      {
        functie: "Preluarea e-facturilor",
        terti: [
          {
            marcaj: "nu",
            nota: "Pagina produsului Google Drive nu prezintă preluarea facturilor electronice.",
            surse: [G_PRODUS],
          },
        ],
        noi: { marcaj: "da", afirmatie: "comparatii-facturi-electronice" },
      },
      {
        functie: "Aplicație mobilă cu scanare",
        terti: [
          {
            marcaj: "da",
            nota: "Aplicația mobilă Google Drive scanează documente și le salvează ca PDF-uri în care se poate căuta; versiunea web nu are scanarea.",
            surse: [G_SCANARE],
          },
        ],
        noi: { marcaj: "da", afirmatie: "comparatii-aplicatie-scanare" },
      },
      {
        functie: "Jurnalul deschiderilor",
        terti: [
          {
            marcaj: "partial",
            nota: "Administratorul vede evenimentele din Drive în consola de administrare; cele mai multe se înregistrează doar pentru planurile care le includ.",
            surse: [G_JURNAL],
          },
        ],
        noi: { marcaj: "da", afirmatie: "comparatii-jurnal-acces" },
      },
      // Randurile 9, 10 si 13 au eticheta pe 2 randuri la 390 (70 / 70 / 69 px), restul pe unul;
      // la 1440, toate pe un rand [fisa, arbore-390]. Ordinea pune intai ce tine de arhiva.
      {
        functie: "Atașamente din e-mail, puse la dosar",
        terti: [
          {
            marcaj: "partial",
            nota: "Din Gmail, un atașament se salvează în Drive printr-un clic, câte unul.",
            surse: [G_ATASAMENTE],
          },
        ],
        noi: { marcaj: "da", afirmatie: "comparatii-atasamente-email" },
      },
      {
        functie: "Drept de acces pe persoană și dosar",
        terti: [
          {
            marcaj: "da",
            nota: "Fiecare fișier sau dosar se poate da unor persoane anume, cu drept de citire, comentare sau editare.",
            surse: [G_PARTAJARE],
          },
        ],
        noi: { marcaj: "da", afirmatie: "comparatii-acces-nominal" },
      },
      {
        functie: "Portalul clienților",
        terti: [
          {
            marcaj: "partial",
            nota: "Fișierele și dosarele se pot da unor persoane din afara firmei, cu drept de citire, comentare sau editare, prin partajare.",
            surse: [G_PARTAJARE],
          },
        ],
        noi: { marcaj: "da", afirmatie: "comparatii-portal-clienti" },
      },
      {
        functie: "Răspunsuri pe WhatsApp",
        terti: [
          {
            marcaj: "nu",
            nota: "Pagina produsului Google Drive nu prezintă un canal WhatsApp.",
            surse: [G_PRODUS],
          },
        ],
        noi: { marcaj: "da", afirmatie: "comparatii-whatsapp" },
      },
      {
        functie: "Criptare AES-256 la stocare și în tranzit",
        terti: [
          {
            marcaj: "da",
            nota: "Google criptează cu AES-256 toate datele stocate și criptează datele în tranzit.",
            surse: [G_CRIPTARE_STOCARE, G_CRIPTARE_TRANZIT],
          },
        ],
        noi: { marcaj: "da", afirmatie: "comparatii-criptare" },
      },
    ],
  } satisfies TabelComparatie,
  cta: {
    // Rol: cutia de incheiere; h2 pe 1 rand la 1440 si pe 2 la 390, paragraful pe 1 si pe 3 [fisa].
    titlu: "Deschideți arhiva 3S peste Drive-ul firmei",
    text: "Contul costă 0 RON azi. Primul act urcat primește termenul legal și se găsește apoi pe WhatsApp.",
    buton: BUTON_CONT,
  },
};

// ---------------------------------------------------------------------------------------------
// /comparatie-stocare
// ---------------------------------------------------------------------------------------------

export type CardVarianta = {
  titlu: string;
  descriere: string;
  verdict: string;
  noi: boolean;
  elemente: string[];
  /** Sursele oficiale pe care se sprijina rezervele unui tert (goale la cardul 3S). */
  surse: SursaOficiala[];
};

export type OptiuneStocare = {
  cod: "nor" | "s3";
  /** Textul butonului din comutator. */
  buton: string;
  /** Titlul nodului de stocare. */
  titlu: string;
  /** Adresa sau locul, in mono. */
  adresa: string;
};

export const COMPARATIE_STOCARE = {
  meta: {
    titlu: "Unde stau actele firmei în 3S, în S3 și în Google Drive",
    descriere:
      "Țara în care stau actele, criptarea și jurnalul de acces, puse față în față pentru 3S, un bucket S3 propriu și Google Drive, cu sursa fiecărui marcaj.",
  },
  fir: [
    { text: "Acasă", cale: "/" },
    // Rol: numele paginii, 5 cuvinte [fisa].
    { text: "În ce țară stau actele", cale: CALE_COMPARATIE_STOCARE },
  ],
  erou: {
    // Rol: intrebarea paginii, care numeste cele trei variante; 3 randuri la 1440 si 4 la 390 [fisa].
    // Aici intrebarea e despre tara in care stau actele; lungimea e potrivita pe randuri, masurat.
    titlu: "În ce țară și pe ce servere stau actele firmei în 3S, într-un bucket S3 propriu sau în Google Drive?",
    // Rol: raspunsul pentru 3S si ce urmeaza pe pagina; 2 randuri la 1440, 4 la 390.
    subtitlu:
      "În 3S, actele stau pe serverele Amazon din Germania, într-o singură regiune UE. Mai jos, fiecare variantă pusă lângă celelalte, cu sursa fiecărui marcaj.",
  },
  // Randurile cardurilor, masurate la 390 (textul are 308 px si la 1440, deci aceleasi randuri):
  // descriere 2 / 1 / 2, verdict 2 / 2 / 2, lista 2+2+2+2 / 3+2+3 / 3+2+2, adica 409 / 378 / 378
  // [fisa, arbore-390]. Verdictul spune, pe scurt, unde sta sau cum se alege locul datelor.
  carduri: [
    {
      titlu: "3S",
      descriere: "Arhiva firmei, cu registrul și termenele fiecărui act.",
      verdict: "Stă în Germania, criptată AES-256 pe disc și TLS pe drum.",
      noi: true,
      elemente: [
        "Fiecare act intră în registru, cu termenul legal calculat după tipul lui",
        "Accesul se dă pe persoană și pe dosar, iar fiecare deschidere intră în jurnal",
        "Căutarea cu AI găsește actul după conținut și citează sursa",
        "Întrebările primesc răspuns și pe WhatsApp, din aceeași arhivă",
      ],
      surse: [],
    },
    {
      titlu: "S3 propriu",
      descriere: "Obiecte într-un bucket din contul firmei.",
      verdict: "Regiunea se alege la crearea bucket-ului și rămâne aceeași.",
      noi: false,
      elemente: [
        "S3 Object Lock poate bloca ștergerea unui fișier până la o dată, dar nu ține un registru cu termenul fiecărui act",
        "Jurnalele de acces ajung într-un bucket ales de firmă; stocarea lor se plătește",
        "Din 2023, S3 criptează singur fiecare obiect nou; conexiunile numai prin HTTPS le cere o regulă separată a bucket-ului",
      ],
      surse: [A_OBJECT_LOCK, A_JURNALE, A_CRIPTARE, A_BUNE_PRACTICI, A_BUCKET],
    },
    {
      titlu: "Google Drive",
      descriere: "Documente de lucru, editate și comentate în echipă.",
      verdict: "Stocarea în UE depinde de planul Google Workspace ales.",
      noi: false,
      elemente: [
        "Păstrarea și ștergerea se reglează în Google Vault, după reguli puse de administrator, fără registru de arhivă",
        "Jurnalul Drive îl vede administratorul, în planurile care îl au",
        "Fișierele se dau unor persoane anume, cu drept de citire, comentare sau editare",
      ],
      surse: [G_VAULT, G_JURNAL, G_PARTAJARE, G_REGIUNI],
    },
  ] satisfies CardVarianta[],
  tabel: {
    titlu: "Cele trei variante, luate cerință cu cerință",
    capFunctie: "Cerința",
    coloaneTerti: ["S3 propriu", "Google Drive"],
    coloanaNoi: "3S",
    latimeMinima: 560,
    latimeColoana: 120,
    latimeColoanaMica: 120,
    titluSurse: "De unde vin marcajele pentru S3 și Google Drive",
    notaSurse:
      "Marcajele urmează documentația publică Amazon S3 și Google, citită pe " +
      DATA_CITIRII_COMPARATII +
      ". La Google Drive, mai multe funcții depind de planul Workspace ales.",
    // La 390 toate cele 4 etichete au 2 randuri (70 / 70 / 70 / 69 px); la 1440, unul [fisa].
    // Regiunea sta prima, fiindca e intrebarea paginii.
    randuri: [
      {
        functie: "Regiune din UE, aleasă și cunoscută",
        terti: [
          {
            marcaj: "da",
            nota: "Regiunea se alege la crearea bucket-ului și nu se mai poate schimba după aceea.",
            surse: [A_BUCKET],
          },
          {
            marcaj: "partial",
            nota: "Regiunea UE se poate alege doar în unele planuri, de pildă Business Standard, Business Plus și Enterprise.",
            surse: [G_REGIUNI],
          },
        ],
        noi: { marcaj: "da", afirmatie: "comparatii-gazduire-germania" },
      },
      {
        functie: "Criptare AES-256 pe disc și TLS pe drum",
        terti: [
          {
            marcaj: "partial",
            nota: "Criptarea la stocare e pornită pentru obiectele noi din 5 ianuarie 2023; conexiunile numai prin HTTPS le impuneți printr-o politică a bucket-ului.",
            surse: [A_CRIPTARE, A_BUNE_PRACTICI],
          },
          {
            marcaj: "da",
            nota: "Google criptează cu AES-256 toate datele stocate și criptează datele în tranzit.",
            surse: [G_CRIPTARE_STOCARE, G_CRIPTARE_TRANZIT],
          },
        ],
        noi: { marcaj: "da", afirmatie: "comparatii-criptare" },
      },
      {
        functie: "Acces nominal, pe fiecare dosar",
        terti: [
          {
            marcaj: "partial",
            nota: "Resursele sunt private implicit; cine are acces decide proprietarul, prin politici pe care le scrie singur.",
            surse: [A_ACCES],
          },
          {
            marcaj: "da",
            nota: "Fiecare fișier sau dosar se poate da unor persoane anume, cu drept de citire, comentare sau editare.",
            surse: [G_PARTAJARE],
          },
        ],
        noi: { marcaj: "da", afirmatie: "comparatii-acces-nominal" },
      },
      {
        functie: "Jurnal: cine a deschis actul și când",
        terti: [
          {
            marcaj: "partial",
            nota: "Jurnalele de acces le pornește proprietarul bucket-ului; livrarea într-un bucket e gratuită, stocarea lor se plătește.",
            surse: [A_JURNALE],
          },
          {
            marcaj: "partial",
            nota: "Administratorul vede evenimentele din Drive în consola de administrare; cele mai multe se înregistrează doar pentru planurile care le includ.",
            surse: [G_JURNAL],
          },
        ],
        noi: { marcaj: "da", afirmatie: "comparatii-jurnal-acces" },
      },
    ],
  } satisfies TabelComparatie,
  comutator: {
    titlu: "Două locuri pentru fișiere",
    eticheta: "Unde stau fișierele",
    declaratie: "Schemă ilustrativă; adresa bucket-ului este un exemplu.",
    // Latimile fluxului in starea A sunt 223 | 88 | 288 | 88 | 144 [fisa]: un nod are latimea celui
    // mai lat rand al lui + 34, conectorii iau restul. Eticheta documentelor are ~189 px la 13,44/600
    // (masurat 190,8). In nodul stocarii randul cel mai lat trebuie sa aiba ~110 px, iar la noi e
    // adresa in mono, nu titlul (77,2): 14 caractere x 6,72 + 14 de padding = 108,1, deci nodul 142,1
    // si conectorii 87,5 [masurat]. Cu 16 caractere nodul avea 155,5 si conectorii 80,8, cu 13 nodul
    // 135,4 si conectorii 90,9. In starea B nodul are 219 (titlul, 183,6 + 34). Jetoanele stau pe
    // 2 randuri in 250 px.
    documente: "Actele firmei, din toate sursele",
    nucleu: {
      nume: "3S",
      eticheta: "registru și căutare",
      jetoane: ["Registru", "Termene", "Căutare cu sursă", "WhatsApp"],
    },
    optiuni: [
      { cod: "nor", buton: "Stocarea 3S", titlu: "Stocarea 3S", adresa: "AWS · Germania" },
      {
        cod: "s3",
        buton: "Bucket-ul S3 al firmei",
        titlu: "Bucket-ul S3 propriu al firmei",
        adresa: "s3://exemplu-arhiva-01",
      },
    ] satisfies OptiuneStocare[],
    nota: "Stocarea 3S e în Germania; un bucket propriu stă în regiunea aleasă de firmă.",
  },
  caseta: {
    // Rol: blocul pentru cine are deja stocare S3; titlul pe 1 rand, paragraful pe 3 randuri la
    // 1440 si 5 la 390 [fisa; masurat].
    titlu: "Pentru un bucket S3 propriu",
    text: "Legați bucket-ul de 3S și întrebați pe WhatsApp de orice act din el: răspunsul vine cu sursa citată, iar actul intră în registru cu termenul lui. Factura de stocare vine tot de la Amazon.",
  },
  cta: {
    titlu: "Încercați arhiva pe actele firmei",
    // Rol: paragraful cutiei, 1 rand la 1440 si 3 la 390 (cutie de 368) [fisa].
    text: "Contul costă 0 RON azi. Legați bucket-ul firmei sau urcați primele acte în stocarea 3S din Germania.",
    buton: BUTON_CONT,
  },
};

/** Toate id-urile de afirmatii la care trimit coloanele 3S, pentru probe. */
export function afirmatiileComparatiilor(): string[] {
  const din = (t: TabelComparatie) => t.randuri.map((r) => r.noi.afirmatie);
  return [...new Set([...din(COMPARATIE_DRIVE.tabel), ...din(COMPARATIE_STOCARE.tabel)])];
}

/**
 * Regulile publicitatii comparative pe datele unui tabel, ca functie pura: probele o cheama pe
 * tabelele reale si pe martori fabricati. Lista goala = tabelul e in regula.
 *   - fiecare rand are cate o celula pentru fiecare coloana de tert;
 *   - fiecare marcaj al unui tert are nota si cel putin o sursa, pe https, pe un domeniu al
 *     documentatiei oficiale a producatorului;
 *   - fiecare marcaj 3S trimite la o intrare din registrul de afirmatii.
 */
export function abateriTabel(tabel: TabelComparatie, domenii: readonly string[] = DOMENII_OFICIALE): string[] {
  const abateri: string[] = [];
  for (const r of tabel.randuri) {
    if (r.terti.length !== tabel.coloaneTerti.length) {
      abateri.push(r.functie + ": " + r.terti.length + " celule de tert pentru " + tabel.coloaneTerti.length + " coloane");
    }
    r.terti.forEach((c, i) => {
      const eticheta = r.functie + " / " + (tabel.coloaneTerti[i] ?? "coloana " + (i + 1));
      if (!c.nota.trim()) abateri.push(eticheta + ": marcaj fara nota");
      if (c.surse.length === 0) abateri.push(eticheta + ": marcaj fara sursa oficiala");
      for (const s of c.surse) {
        let url: URL | null = null;
        try {
          url = new URL(s.url);
        } catch {
          abateri.push(eticheta + ": adresa care nu se poate citi: " + s.url);
        }
        if (url && url.protocol !== "https:") abateri.push(eticheta + ": sursa nu e pe https: " + s.url);
        if (url && !domenii.includes(url.hostname)) {
          abateri.push(eticheta + ": sursa nu e pe un domeniu oficial: " + url.hostname);
        }
      }
    });
    if (!r.noi.afirmatie.trim()) abateri.push(r.functie + ": marcajul 3S nu trimite la registru");
  }
  return abateri;
}
