// Contractul de continut al paginii `/preturi` (felia `preturi`, valul S4-3, referinta vizuala
// REF-N): textele si datele fiecarei sectiuni, in ordinea masurata in fisa `preturi.md` (depozitul
// fabricii). Doar date; nicio componenta si nicio formula (formula calculatorului sta in
// `src/components/preturi/calcul.ts`).
//
// CE SPUNE PAGINA, si de unde vine fiecare fapt:
//   - pretul: toate pachetele costa 0 RON astazi, lunar si anual (decizia owner-ului D3, D4c);
//   - structura: trei pachete, identice ca forma cu ale referintei (D4c), care se deosebesc NUMAI
//     prin conturile incluse, 5 / 10 / 20 (sarcina feliei). Limitele referintei (spatiu, spatii de
//     lucru, casute, marcaje, costuri suplimentare) NU se copiaza: in locul lor stau functiile 3S
//     declarate existente de owner (D4b), aceleasi in toate pachetele;
//   - gazduirea si criptarea: Amazon, Germania, o singura regiune UE; AES-256 la stocare, TLS 1.2+
//     in tranzit (D4c);
//   - numele pachetelor (Start, Plus, Pro) si ale celor doua linii (3S Business, 3S Enterprise) sunt
//     propuneri redactionale, trecute in registru ca neconfirmate.
// Fiecare fraza verificabila are intrare in `src/content/afirmatii/preturi.json`.
//
// LUNGIMILE din comentarii sunt ale referintei, pe acelasi rol: `[fisa]` = scrisa in fisa;
// `[numarat]` = numarata pe textul referintei, pentru lungime si rol, niciodata pentru cuvinte.
// Textul de aici e scris pentru 3S: adresarea "tu" (decizia D15); diacritice complete;
// doar cratima.

import { CALE_INREGISTRARE, type Legatura } from "./navigatie";
import { cereDe } from "./limba";

// ---------------------------------------------------------------------------------------------
// Ruta, metadatele si ancorele
// ---------------------------------------------------------------------------------------------

export const CALE_PRETURI = "/preturi";

/**
 * Ancorele paginii (fara diez). `pachete` e tinta legaturii "Pachete" din subsol
 * (`/preturi#pachete`, contractul de navigatie): deschide starea pachetelor si sare la grila.
 * `poarta` e intoarcerea fara JavaScript (vezi `LumeaPreturi`).
 */
export const ANCORE_PRETURI = {
  pachete: "pachete",
  poarta: "alegere",
  intrebari: "intrebari-preturi",
} as const;

/** Numele accesibile ale sectiunilor fara titlu vizibil propriu. */
export const ETICHETE_PRETURI = {
  poarta: "Cele două variante 3S",
  pliuri: "Dispozitivele și funcțiile pachetelor",
};

export const META_PRETURI = {
  // Prag de poarta: 15-65 caractere.
  titlu: "Prețurile 3S: toate pachetele costă 0\u00a0RON astăzi",
  // Prag de poarta: 50-160 caractere.
  descriere:
    "Trei pachete 3S, Start, Plus și Pro, cu 5, 10 sau 20 de conturi și aceleași funcții. Astăzi toate costă 0\u00a0RON, iar contul se deschide fără card.",
};

// ---------------------------------------------------------------------------------------------
// 2. Antetul paginii (preturi.md §2): fir, h1, subtitlu.
// ---------------------------------------------------------------------------------------------

export const ANTET_PRETURI = {
  fir: [
    { text: "Acasă", cale: "/" },
    { text: "Prețuri", cale: CALE_PRETURI },
  ],
  // Rol: numele celor doua linii de produs, legate prin "si", cu punct. Lungime: 39 [fisa].
  titlu: "3S Business și 3S Enterprise",
  // Rol: cele doua linii, pe scurt: cea de baza si pretul ei, cea enterprise si cand se alege.
  // Lungime: 212, 2 propozitii [fisa].
  // E primul paragraf din <main>: raspunsul paginii, 30-80 de cuvinte (poarta G-AI-02).
  // Nu fixeaza conditii comerciale pentru Enterprise (niciun contract, niciun prag): registrul le
  // da drept nestabilite (`preturi-enterprise-contract`).
  subtitlu:
    "Astăzi cele trei pachete 3S, cu 5, 10 sau 20 de conturi, costă 0\u00a0RON și au aceleași funcții. Când arhiva trebuie să rămână pe serverele firmei sau să fie legată de aplicațiile pe care le folosești, lucrezi cu 3S Enterprise.",
};

// ---------------------------------------------------------------------------------------------
// 3. Poarta (preturi.md §3): doua carduri. Cardul de baza deschide pachetele pe loc; cardul
//    enterprise duce la `/enterprise`, prin `Tinta` (inert cat timp ruta nu exista).
// ---------------------------------------------------------------------------------------------

export type CardPoarta = {
  /** Eticheta de sus (14/600). */
  nume: string;
  /** Titlul (24/600). */
  titlu: string;
  /** Textul (14/400, doua randuri la 1440). */
  text: string;
  /** Legatura-sageata de jos (14/600). */
  mergi: string;
};

export const POARTA_BAZA: CardPoarta = {
  // Lungime: 16 [numarat].
  nume: "3S Business",
  // Rol: titlul de beneficiu al liniei de baza (24/600, un rand la 1440). Lungime: 34 [numarat].
  titlu: "Toate funcțiile, la 0\u00a0RON",
  // Rol: textul cardului de baza (14/400, 2 randuri la 1440, 3 la 390). Lungime: 105 [numarat].
  // Scris din functiile 3S (D4b): accesul pe persoana si pe dosar, clasarea automata.
  text: "Cu 5, 10 sau 20 de conturi, fiecare coleg lucrează în dosarele lui, iar actele noi se clasează singure.",
  // Lungime: 14 [numarat].
  mergi: "Alege un pachet",
};

export const POARTA_ENTERPRISE: CardPoarta & { tinta: Legatura } = {
  // Lungime: 18 [numarat].
  nume: "3S Enterprise",
  // Rol: titlul cardului enterprise (24/600, doua randuri la 1440). Lungime: 52 [numarat].
  titlu: "Arhiva poate rămâne pe serverele firmei",
  // Rol: textul cardului enterprise (14/400). Lungime: 108 [numarat]. Scris din faptul declarat
  // de owner (D4b): 3S lucreaza pe stocarea proprie a firmei si se leaga de aplicatiile ei.
  text: "3S lucrează direct pe fișierele de acolo și se leagă de aplicațiile pe care firma le folosește deja.",
  // Lungime: 15 [numarat].
  mergi: "Detalii Enterprise",
  tinta: { text: "3S Enterprise", href: "/enterprise", ruta: "/enterprise" },
};

// ---------------------------------------------------------------------------------------------
// 5. Linia de baza (preturi.md §5): inapoi, h2, titlu, paragraf.
// ---------------------------------------------------------------------------------------------

export const LINIA_DE_BAZA = {
  // Rol: intoarcerea la poarta (buton-text 14/500). Lungime: 17 [numarat].
  inapoi: "Cele două variante 3S",
  // Rol: numele liniei (h2 38,4). Lungime: 16 [numarat].
  titlu: "3S Business",
  // Rol: promisiunea liniei (18/500, max 34ch, un rand). Lungime: 34 [numarat].
  promisiune: "Actele firmei, ordonate și ușor de găsit.",
  // Rol: pretul de astazi si ce primeste echipa in oricare pachet (16/400, max 62ch, doua randuri).
  // Lungime: 156 [numarat].
  paragraf:
    "Astăzi fiecare pachet costă 0\u00a0RON. Echipa întreabă arhiva din browser sau de pe WhatsApp și primește răspunsul cu documentul și pagina din care vine.",
};

// ---------------------------------------------------------------------------------------------
// 6a-6b. Calculatorul (preturi.md §6a-§6b): teaserul si cele trei cursoare.
// ---------------------------------------------------------------------------------------------

export type Cursor = {
  /** Eticheta de deasupra cursorului (13/500). */
  eticheta: string;
  /** Unitatea mica de dupa valoare (12/500); sir gol = fara unitate. */
  unitate: string;
  /**
   * Unitatea spusa intreg, pentru cititorul de ecran: forma de singular (la 1) si cea de plural.
   * Numeralul o leaga prin `valoareSpusa`, nu prin lipire directa.
   */
  unitateSpusa: { unu: string; multe: string };
  min: number;
  max: number;
  pas: number;
  implicit: number;
};

export const CALCULATOR = {
  teaser: {
    // Rol: presupunerile de pornire (14/500). Lungime: 51 [numarat]. Cifrele vin din `cursoare`.
    presupuneri: (oameni: string, minute: string) => "Cu " + oameni + " care caută acte câte " + minute + " zilnic",
    // Rol: rezultatul teaserului (14/600). Lungime: 23 [numarat].
    rezultat: (ore: string) => "se adună " + ore + " lunar",
    // Rol: CTA-ul teaserului (14/600). Lungime: 27 [numarat].
    cta: "Încearcă cu cifrele firmei",
  },
  // Rol: numele accesibil al calculatorului deschis.
  eticheta: "Calculul timpului pierdut căutând acte",
  cursoare: {
    // Domeniul masurat: 1-50, pas 1 [fisa]. Valorile de pornire ale celor trei cursoare sunt ale
    // 3S, nu cifrele de exemplu ale referintei (regula de text D1b). Lungime etichetei: 35 [numarat].
    persoane: {
      eticheta: "Câți colegi au nevoie zilnic de acte",
      unitate: "",
      unitateSpusa: { unu: "persoană", multe: "persoane" },
      min: 1,
      max: 50,
      pas: 1,
      implicit: 4,
    },
    // Domeniul masurat: 10-120, pas 5 [fisa]. Lungime etichetei: 38 [numarat].
    minute: {
      eticheta: "Minutele fiecăruia, zilnic, prin dosare",
      unitate: "min",
      unitateSpusa: { unu: "minut pe zi", multe: "minute pe zi" },
      min: 10,
      max: 120,
      pas: 5,
      implicit: 25,
    },
    // Referinta: 23-210, pas 4; grila pornita din 23 nu contine capatul, deci maximul real e 207
    // (defect masurat in fisa, §6b). La 3S grila porneste din 22: contine si valoarea de pornire, si
    // capatul. Lungime etichetei: 39.
    tarif: {
      eticheta: "Tariful orar mediu al unui coleg",
      unitate: "RON",
      unitateSpusa: { unu: "leu pe oră", multe: "lei pe oră" },
      min: 22,
      max: 210,
      pas: 4,
      implicit: 50,
    },
  } satisfies Record<string, Cursor>,
  /** Zilele lucratoare dintr-o luna, in formula (fisa §6b); spuse si in nota de sub calcul. */
  zileLucratoare: 22,
  // Rol: iesirea stanga (16/400): banii si timpul de acum, in ordinea asta. Cifrele ingrosate vin
  // din calcul. 3 randuri la 1440 si 5 la 390 cu valorile de pornire (masurat pe pagina vie).
  timpAcum: {
    inainte: "Acum plătești ",
    dupaBani: "\u00a0RON lunar pentru cele ",
    dupaOre: " h în care echipa caută acte prin dosare.",
  },
  // Rol: iesirea dreapta (16/400): pachetul potrivit si pretul lui, spus si in ore de lucru la
  // tariful ales. Cu pretul de 0 RON rezultatul e 0 h, si fraza o spune asa, fara promisiune de castig.
  // La 390 fraza are 5 randuri in coloana de 144 px, ca la referinta (randul iesirii de 136 px);
  // masurat pe pagina vie pentru toate trei numele de pachet.
  pretInOre: {
    inainte: "Se potrivește pachetul ",
    dupaPlan: ": ",
    dupaPret: "\u00a0RON pe lună, adică ",
    dupaOre: " h plătite la tariful ales.",
  },
  // Rol: iesirea dreapta cand echipa trece de conturile celui mai mare pachet. Nu fixeaza un prag
  // comercial: spune doar ca pachetele nu ajung si cu cine se discuta.
  pesteConturi: {
    inainte: (persoane: string) => "Pentru " + persoane + " persoane, pachetele nu ajung: discută cu echipa 3S despre ",
    dupa: ".",
  },
  // Rol: nota de sub iesire (12/400, centrata, un rand): presupunerea de calcul. Lungime: 88
  // [numarat]. Cele 22 de zile sunt o PRESUPUNERE a formulei (fisa §6b), spusa ca atare, nu o
  // valoare legala. La 3S spune si ce masoara calculul: timpul pierdut acum.
  nota: "Presupunem 22 de zile lucrătoare pe lună. Rezultatul arată timpul pe care îl pierzi acum.",
};

// ---------------------------------------------------------------------------------------------
// 6c. Comutatorul lunar / anual (preturi.md §6c). Porneste pe anual.
// ---------------------------------------------------------------------------------------------

export type Perioada = "lunar" | "anual";

export const COMUTATOR = {
  eticheta: "Perioada de plată",
  lunar: "Lunar",
  anual: "Anual",
  // Rol: insigna de economie din butonul anual (11/600 verde). La referinta un procent; la 3S nu
  // exista nicio diferenta de pret, deci insigna spune exact asta, fara procent. Lungime: 15.
  insigna: "Tot 0\u00a0RON astăzi",
  // Rol: nota de sub comutator (14/400, centrata). Lungime: 89 [numarat]. Scrisa din faptele 3S
  // (D4c): gazduirea si criptarea sunt aceleasi in toate pachetele.
  nota: "Găzduirea în Germania și criptarea AES-256 a fișierelor intră în prețul oricărui pachet.",
};

// ---------------------------------------------------------------------------------------------
// 6d. Grila de planuri (preturi.md §6d): 3 planuri, lista de 9 randuri, tooltip "i".
// ---------------------------------------------------------------------------------------------

export type CheiePlan = "start" | "plus" | "pro";

/** Un rand din lista planului: text, cu o cifra ingrosata optionala in fata. */
export type RandPlan = {
  /** Cifra ingrosata (600, `ardezie-9`) de la inceputul randului; `null` = fara. */
  cifra: string | null;
  text: string;
  /** Explicatia din tooltip-ul "i", la clic; `null` = randul nu are iconita. */
  explicatie: string | null;
};

export type Plan = {
  cheie: CheiePlan;
  nume: string;
  descriere: string;
  /** Pretul lunar si cel anual (pe luna, la plata anuala), in RON. Astazi 0 si 0 (D3). */
  pret: Record<Perioada, number>;
  /** Conturile de utilizator incluse. */
  conturi: number;
  /** Cardul evidentiat: linia albastra de sus, eticheta si butonul plin. */
  recomandat: boolean;
};

export const PLANURI: Plan[] = [
  {
    cheie: "start",
    nume: "Start",
    // Rol: cui i se potriveste pachetul mic. Lungime: 104 [numarat].
    descriere: "Un birou mic, unde până la cinci oameni scanează, caută și trimit acte în fiecare zi, are aici tot necesarul.",
    pret: { lunar: 0, anual: 0 },
    conturi: 5,
    recomandat: true,
  },
  {
    cheie: "plus",
    nume: "Plus",
    // Rol: cui i se potriveste pachetul mijlociu. Lungime: 112 [numarat].
    descriere: "Când același act trece prin mai multe mâini, de la contabilitate la vânzări și la conducere, zece conturi țin toată echipa în același loc.",
    pret: { lunar: 0, anual: 0 },
    conturi: 10,
    recomandat: false,
  },
  {
    cheie: "pro",
    nume: "Pro",
    // Rol: cui i se potriveste pachetul mare. Lungime: 104 [numarat].
    descriere: "Când firma are mai multe departamente și fiecare echipă își păstrează dosarele și drepturile ei, douăzeci de conturi acoperă toată structura.",
    pret: { lunar: 0, anual: 0 },
    conturi: 20,
    recomandat: false,
  },
];

export const GRILA = {
  eticheta: "Pachetele 3S",
  // Rol: eticheta cardului evidentiat (12/600 albastru). La referinta o eticheta de popularitate,
  // adica o cifra de tractiune pe care 3S nu o are (plan §6.3); aici o recomandare, spusa ca atare.
  recomandat: "Recomandat",
  // Rol: unitatea de langa suma (13/500). Aceeasi in ambele moduri, ca la referinta.
  unitate: "RON / lună",
  // Rol: butonul fiecarui plan. Tinta: formularul de cont (plan D4c).
  buton: { text: "Testează gratuit", href: CALE_INREGISTRARE, ruta: CALE_INREGISTRARE } satisfies Legatura,
  /** Eticheta accesibila a iconitei "i". */
  detalii: (rand: string) => "Ce înseamnă: " + rand,
};

/** Forma romaneasca a numeralului: "5 conturi", "20 de conturi", "101 conturi", "0 ore" (regula in `limba.ts`). */
export function cuDe(n: number): string {
  return cereDe(n) ? " de" : "";
}

/**
 * Valoarea unui cursor, spusa cititorului de ecran (`aria-valuetext`): singular la 1, apoi numeralul
 * romanesc, "4 persoane", "25 de minute pe zi", "210 de lei pe oră". Sirul se compune la rulare, deci
 * poarta de limba nu il vede: forma lui o tine proba din `tests/preturi.test.ts`.
 */
export function valoareSpusa(cursor: Cursor, n: number): string {
  return n === 1 ? n + " " + cursor.unitateSpusa.unu : n + cuDe(n) + " " + cursor.unitateSpusa.multe;
}

/**
 * Lista de 9 randuri a unui plan (preturi.md §6d). Primul rand e numarul de conturi, al doilea
 * dispozitivele; restul sunt functiile 3S (D4b), aceleasi in toate pachetele, nu limitele
 * referintei. Iconita "i" sta pe randul al saselea, ca la referinta.
 */
export function randuriPlan(plan: Plan): RandPlan[] {
  return [
    {
      cifra: String(plan.conturi),
      text: (cuDe(plan.conturi) === "" ? "" : "de ") + "conturi pentru echipă",
      explicatie: null,
    },
    { cifra: null, text: "Oricâte dispozitive", explicatie: null },
    { cifra: null, text: "Căutare cu sursa citată", explicatie: null },
    { cifra: null, text: "Răspunsuri și pe WhatsApp", explicatie: null },
    { cifra: null, text: "Clasare automată în dosare", explicatie: null },
    {
      cifra: null,
      text: "Termene de păstrare calculate",
      // Rol: explicatia termenului din rand (12/400, 260 de pixeli). Lungime: 40 de cuvinte [fisa].
      explicatie:
        "3S trece fiecare act în registrul arhivei și îi calculează termenul de păstrare după categoria lui. Așa vezi din timp ce documente pot fi scoase din arhivă și ce trebuie păstrat mai departe.",
    },
    { cifra: null, text: "Portal pentru clienți", explicatie: null },
    { cifra: null, text: "Găzduire în Germania, UE", explicatie: null },
    { cifra: null, text: "Aplicația pe toate platformele", explicatie: null },
  ];
}

// ---------------------------------------------------------------------------------------------
// 6e. Lista de preturi ca PDF (preturi.md §6e): butonul si foaia de oferta tiparibila.
// ---------------------------------------------------------------------------------------------

export const LISTA_PDF = {
  // Rol: buton-text cu imprimanta (14/500, subliniat). Lungime: 34 [numarat].
  buton: "Tipărește oferta sau păstreaz-o în PDF",
  foaie: {
    // Numele marcii, cum il scrie configurarea (`config/brand.json`); nu sigla retiparita.
    marca: "3S Scan Store Solve",
    titlu: "Oferta 3S",
    coloane: { plan: "Pachet", lunar: "Lunar (RON)", anual: "Anual, pe lună (RON)" },
    note: [
      "Astăzi toate pachetele costă 0\u00a0RON.",
      "Contul se deschide fără card de plată.",
      "Prețurile sunt cele afișate pe site la data de mai sus.",
    ],
    // Rol: ultima nota, cu adresa in font mono. La referinta adresa de posta; 3S nu are inca una
    // confirmata (`config/brand.json`), deci aici sta pagina de preturi.
    adresa: "Pagina prețurilor: ",
  },
};

// ---------------------------------------------------------------------------------------------
// 7. Pliurile (preturi.md §7): biroul si comparatia.
// ---------------------------------------------------------------------------------------------

export const BIROU = {
  // Rol: titlul pliului (16/600). Lungime: 39 [numarat].
  titlu: "Aparatele echipei nu intră la socoteală",
  // Rol: ce schimba pachetul si ce ramane liber (14/400, max 640). Lungime: 148 [numarat].
  paragraf:
    "Pachetul hotărăște câți colegi au cont în 3S; aparatele pe care le folosesc nu se numără. Același cont merge la birou, acasă sau pe drum, fără cost în plus.",
  contor: "Dispozitive",
  // Rol: nota de langa contor (12/600 verde).
  nelimitat: "fără plafon",
  // Rol: butonul de adaugare (14/600 albastru, "+" dupa text). Lungime: 18 [numarat].
  adauga: "Încă un dispozitiv",
  /** Pornirea si plafonul demonstratiei: 5 -> 36, adica 31 de clicuri [fisa]. */
  initial: 5,
  maxim: 36,
  conturi: "Conturi în pachet",
  planuri: "Pachetul arătat",
  // Rol: eticheta locurilor (14/500). La 390 coboara pe al doilea rand al benzii, ca la referinta
  // (banda de 52 px); masurat pe pagina vie cu 5 locuri.
  locuri: (n: number) => n + cuDe(n) + " conturi, câte unul pentru fiecare coleg",
  scena: (dispozitive: number, mese: number) =>
    "Desen: un birou cu " + dispozitive + cuDe(dispozitive) + " dispozitive pe " + mese + cuDe(mese) + (mese === 1 ? " masă" : " mese"),
};

export type CelulaTabel =
  /** O valoare scrisa (600, `ardezie-9`). */
  | { fel: "valoare"; text: string }
  /** Inclus: bifa, cu text ascuns pentru cititorul de ecran. */
  | { fel: "da" };

export type RandTabel = { functie: string; celule: Record<CheiePlan, CelulaTabel> };
export type CategorieTabel = { titlu: string; randuri: RandTabel[] };

const DA: CelulaTabel = { fel: "da" };
const toate = (c: CelulaTabel): Record<CheiePlan, CelulaTabel> => ({ start: c, plus: c, pro: c });
const valoare = (text: string): CelulaTabel => ({ fel: "valoare", text });

export const COMPARATIE = {
  // Rol: titlul pliului (16/600). Lungime: 33 [numarat].
  titlu: "Pachetele, față în față",
  // Rol: legenda tabelului (14/400). Lungime: 34 [numarat].
  paragraf: "Ce primești în fiecare pachet, rând cu rând",
  functie: "Funcție",
  inclus: "inclus",
  derulare: "Tabelul pachetelor; pe ecran îngust se derulează orizontal",
  // 4 categorii, 14 randuri, ca la referinta (2 + 5 + 4 + 3) [fisa]. Valorile sunt faptele 3S:
  // aceleasi in toate pachetele, in afara conturilor.
  categorii: [
    {
      titlu: "Unde și cum stau fișierele",
      randuri: [
        { functie: "Locul fișierelor", celule: toate(valoare("Germania")) },
        { functie: "Criptarea fișierelor", celule: toate(valoare("AES-256")) },
      ],
    },
    {
      titlu: "Echipa și accesul",
      randuri: [
        { functie: "Acces pe persoană și pe dosar", celule: toate(DA) },
        {
          functie: "Conturi pentru echipă",
          celule: { start: valoare("5"), plus: valoare("10"), pro: valoare("20") },
        },
        { functie: "Portal pentru clienți", celule: toate(DA) },
        { functie: "Cost pe persoană", celule: toate(valoare("Inclus")) },
        { functie: "Aparate pe cont", celule: toate(valoare("Oricâte")) },
      ],
    },
    {
      titlu: "Inteligența arhivei",
      randuri: [
        { functie: "Căutare cu sursa citată", celule: toate(DA) },
        { functie: "Text scos din scanări și poze", celule: toate(DA) },
        { functie: "Clasare automată în dosare", celule: toate(DA) },
        { functie: "Reguli automate și notificări", celule: toate(DA) },
      ],
    },
    {
      titlu: "Canale și preț",
      // Primele doua valori rup randul in coloanele de 120 (110 la 390), ca la referinta in aceeasi
      // categorie: 3 randuri (94 px la 1440) si 2 randuri (72); masurat pe pagina vie.
      randuri: [
        { functie: "Unde primești răspunsuri", celule: toate(valoare("Web, aplicație și WhatsApp")) },
        { functie: "Aplicația 3S", celule: toate(valoare("Toate platformele")) },
        { functie: "Prețul astăzi", celule: toate(valoare("0\u00a0RON")) },
      ],
    },
  ] satisfies CategorieTabel[],
};

// ---------------------------------------------------------------------------------------------
// 8. Intrebarile despre preturi (preturi.md §8): 7 intrebari, acordeonul `preturi`.
// ---------------------------------------------------------------------------------------------

export type IntrebarePret = { intrebare: string; raspuns: string };

export const INTREBARI_PRETURI: { titlu: string; subtitlu: string; intrebari: IntrebarePret[] } = {
  // Rol: h2 de bloc (28/600). Lungime: 18 [numarat].
  titlu: "Plata și pachetele, pe scurt",
  // Rol: subtitlul (16/400). Lungime: 55 [numarat].
  subtitlu: "Ce primești în pachet, cât plătești și unde stau fișierele",
  // Lungimile raspunsurilor la referinta: 53 / 36 / 42 / 41 / 40 / 30 / 48 de cuvinte [fisa].
  // Intrebarile sunt alese din faptele 3S: fiecare are un raspuns adevarat astazi.
  intrebari: [
    {
      intrebare: "Plătesc în plus pentru căutare sau WhatsApp?",
      raspuns:
        "Nu. Căutarea cu sursa citată, răspunsurile pe WhatsApp, clasarea automată în dosare și termenele de păstrare calculate vin în fiecare pachet, fără vreo taxă adăugată. Ce alegi între Start, Plus și Pro e doar numărul de conturi, iar astăzi oricare dintre ele costă 0\u00a0RON.",
    },
    {
      intrebare: "Ce pachet să aleg?",
      raspuns:
        "Numără oamenii care lucrează cu actele firmei: până la 5, Start; până la 10, Plus; până la 20, Pro. Dacă ai nevoie de mai multe conturi, discută cu echipa 3S. Funcțiile sunt aceleași în toate trei.",
    },
    {
      intrebare: "Cât costă pachetele astăzi?",
      raspuns:
        "Astăzi toate cele trei pachete costă 0\u00a0RON, la plata lunară și la cea anuală. În preț intră toate funcțiile de pe această pagină. Lista de prețuri o poți salva oricând ca PDF, din butonul de sub pachete.",
    },
    {
      intrebare: "Am nevoie de un card de plată ca să deschid contul 3S?",
      raspuns:
        "Nu. Contul se deschide fără card de plată. Cât timp prețul este 0\u00a0RON, nu ai nimic de plătit și nu ți se cere nicio metodă de plată.",
    },
    {
      intrebare: "Unde sunt păstrate fișierele?",
      raspuns:
        "În Germania, pe serverele Amazon, într-o singură regiune a Uniunii Europene. Fișierele sunt criptate AES-256 la stocare și circulă doar prin conexiuni TLS 1.2 sau mai noi. Locul și criptarea sunt aceleași în toate pachetele.",
    },
    {
      intrebare: "Pot folosi 3S de pe telefon?",
      raspuns:
        "Da. Aplicația 3S există pentru Windows, Mac, Linux, iOS, iPadOS și Android, precum și în browser, iar întrebările le poți pune și pe WhatsApp. Toate intră în fiecare pachet.",
    },
    {
      intrebare: "Cum arată un răspuns cu sursa citată?",
      raspuns:
        "La fiecare întrebare, 3S îți răspunde cu documentul și cu pagina din care e luat răspunsul. Deschizi pagina cu un clic și citești fraza exactă, fără să cauți prin dosare, așa că știi mereu de unde vine informația. Funcția e inclusă în toate pachetele.",
    },
  ],
};
