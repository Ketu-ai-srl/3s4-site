// Furnizorii care primesc date, cu tara si mecanismul de transfer: sursa UNICA pentru politica de
// confidentialitate (destinatarii si transferurile, GDPR art. 13 alin. (1) lit. e)-f)), pentru
// politica de cookie-uri si pentru panoul de setari al bannerului. Un furnizor adaugat aici apare
// in toate trei deodata; unul adaugat in alta parte nu apare nicaieri - asta e ideea.
//
// NEPUBLICAT azi (planul valului S4, §9-§10): textele juridice se construiesc complet si stau in
// spatele comutatorului operatorului; paginile le face felia `juridic` (valul S4-4).
//
// FAPTE, cu sursa lor (verificate 24.09.2026):
//   - gazduirea platformei: Amazon, in Uniunea Europeana, cu regiunea principala Frankfurt - decizia
//     42 a owner-ului (01.10.2026), care inlocuieste formularea din D4c ("Germania, o singura regiune"),
//     confirmata de furnizorul platformei (02.10.2026); in registrul de afirmatii ca
//     `acasa-gazduire-amazon-germania` (id-ul ramane, e cheie stabila);
//   - Google LLC e certificata in EU-U.S. Data Privacy Framework si poate folosi si clauzele
//     contractuale standard (business.safety.google/adsdatatransfers);
//   - cookie-urile GA4 si durata lor, 2 ani (support.google.com/analytics/answer/11397207);
//   - in Republica Moldova decizia de adecvare a Comisiei Europene NU e opozabila (Legea 195/2024,
//     art. 45), deci pentru vizitatorii de acolo mecanismul numit e cel din art. 46 alin. (2)
//     lit. c): clauzele standard adoptate de Comisie (cercetarea gdpr-moldova, §4.2 si §5, rand 4).
// RAMANE DE CONFIRMAT in ziua operatorului (docs/ziua-operatorului.md): entitatea Google cu care se
// incheie contractul GA4 (din termenii acceptati in cont) si gazda reala a site-ului public.

/**
 * Mecanismul de transfer pentru vizitatorii din UE / SEE (GDPR capitolul V): `see` cand datele nu
 * ies din Spatiul Economic European, `dpf` pentru un destinatar certificat in EU-U.S. Data Privacy
 * Framework, `scc-2021-914` pentru clauzele contractuale standard.
 */
export const MECANISME_UE = ["see", "dpf", "scc-2021-914"] as const;
export type MecanismUe = (typeof MECANISME_UE)[number];

/**
 * Mecanismul pentru vizitatorii din Republica Moldova: lista inchisa din poarta G-MD-11 (cercetarea
 * gdpr-moldova, Legea 195/2024 art. 44-46 si 49), plus `see` (art. 44 alin. (2): transferul catre
 * SEE e liber). Decizia de adecvare a Comisiei Europene nu e in lista: acolo nu e opozabila (art. 45).
 */
export const MECANISME_MD = ["see", "scc-2021-914", "bcr", "decizie-centru", "derogare-art49"] as const;
export type MecanismMd = (typeof MECANISME_MD)[number];

/** Categoriile de cookie-uri ale bannerului. `statistica` e singura care cere acord. */
export type CategorieCookie = "strict-necesare" | "statistica";

export type CookieDeclarat = {
  /** Numele exact, cum apare in browser. */
  nume: string;
  /** Unde sta: cookie sau stocare locala. */
  fel: "cookie" | "stocare locală";
  /** Cat timp ramane, spus cum il citeste un om. */
  durata: string;
  scop: string;
};

export type Furnizor = {
  cheie: "gazduire-platforma" | "analitica";
  /** Serviciul, cum il stie cititorul. */
  serviciu: string;
  /** Firma care primeste datele. */
  destinatar: string;
  rol: string;
  /** Tara in care stau datele; pentru gazduirea platformei, Uniunea Europeana (decizia 42). */
  tara: string;
  /** Regiunea principala, cand furnizorul o are numita (gazduirea platformei: Frankfurt, decizia 42). */
  regiune?: string;
  inSee: boolean;
  mecanismUe: MecanismUe;
  mecanismMd: MecanismMd;
  /** Temeiul transferului pentru vizitatorii din UE / SEE. */
  transferUe: string;
  /** Temeiul transferului pentru vizitatorii din Republica Moldova (Legea 195/2024). */
  transferMd: string;
  /** Categoria bannerului care il porneste; `null` = nu depinde de banner. */
  categorie: CategorieCookie | null;
  cookieuri: CookieDeclarat[];
};

export const FURNIZORI: Furnizor[] = [
  {
    cheie: "gazduire-platforma",
    serviciu: "Găzduirea platformei 3S",
    destinatar: "Amazon Web Services (AWS)",
    rol: "Găzduiește contul, fișierele încărcate și arhiva digitală, cu regiunea principală Frankfurt.",
    tara: "Uniunea Europeană",
    regiune: "Frankfurt",
    inSee: true,
    mecanismUe: "see",
    mecanismMd: "see",
    transferUe: "Datele rămân în Uniunea Europeană, deci nu există transfer în afara Spațiului Economic European.",
    transferMd:
      "Transferul către un stat din Spațiul Economic European e liber și nu cere autorizare, potrivit art. 44 alin. (2) din Legea nr. 195/2024.",
    categorie: null,
    cookieuri: [],
  },
  {
    cheie: "analitica",
    serviciu: "Google Analytics 4",
    destinatar: "Google Ireland Limited (Irlanda), cu prelucrare și de către Google LLC (Statele Unite)",
    rol: "Măsoară vizitele și paginile citite pe site, ca să știm ce e util. Pornește numai după acordul dumneavoastră pentru categoria „Statistică”.",
    tara: "Statele Unite ale Americii",
    inSee: false,
    mecanismUe: "dpf",
    mecanismMd: "scc-2021-914",
    transferUe:
      "Google LLC e certificată în cadrul EU-U.S. Data Privacy Framework, recunoscut de Comisia Europeană prin decizia din 10 iulie 2023; Google poate folosi și clauzele contractuale standard.",
    transferMd:
      "Pentru vizitatorii din Republica Moldova, transferul către Statele Unite se face pe baza clauzelor contractuale standard adoptate de Comisia Europeană prin Decizia (UE) 2021/914, potrivit art. 46 alin. (2) lit. c) din Legea nr. 195/2024.",
    categorie: "statistica",
    cookieuri: [
      { nume: "_ga", fel: "cookie", durata: "2 ani", scop: "Deosebește vizitatorii între ei, fără nume sau adresă de e-mail." },
      {
        nume: "_ga_ urmat de codul măsurătorii",
        fel: "cookie",
        durata: "2 ani",
        scop: "Ține minte sesiunea de navigare în curs.",
      },
    ],
  },
];

/** Alegerea din banner, pastrata in browser: strict necesara, fiindca fara ea bannerul ar reveni la fiecare pagina. */
export const COOKIE_ALEGERE: CookieDeclarat = {
  nume: "3s-consimtamant",
  fel: "stocare locală",
  durata: "6 luni",
  scop: "Ține minte ce ați ales în bannerul de cookie-uri, ca să nu vă întrebăm la fiecare pagină.",
};

/** Furnizorii care pornesc numai cu acord, pentru categoria data. */
export function furnizoriCategorie(categorie: CategorieCookie): Furnizor[] {
  return FURNIZORI.filter((f) => f.categorie === categorie);
}

// ---------------------------------------------------------------------------------------------
// PANOUL BANNERULUI: serviciile categoriei "statistica", pe uneltele active si pe limba
// ---------------------------------------------------------------------------------------------
//
// Masurarea S-B (decizia 13: analitica proprie, Umami, porneste numai dupa acordul din banner) aduce in panou
// un al doilea serviciu de statistica. EL NU INTRA IN `FURNIZORI`: de acolo se scriu paginile juridice ale
// familiei SEE (politica de confidentialitate si cea de cookie-uri), iar tara gazdei instantei Umami nu are
// inca un fapt scris; textele juridice ale lui 3s.md vin din modulele `md`, care descriu deja Umami. Deci
// Umami pe site-ul romanesc cere intai randul lui in `FURNIZORI`, cu tara gazdei; pana atunci site-ul RO
// ramane fara Umami (S0 sau S-GA4). Proba ca paginile RO nu se schimba: tests/juridic-ro-furnizori.test.ts.
//
// Serviciile de mai jos sunt numai pentru panou: numele serviciului si randurile tabelului (nume, durata,
// scop), in limba bannerului. GA4 in romana se ia din `FURNIZORI`, ca panoul si politica sa nu poata diverge;
// celelalte texte vin din politica de cookie-uri a lui 3s.md (documentul 03, tabelul din sectiunea 2).

/** Uneltele de masurare care pot rula pe un domeniu. */
export type Unealta = "ga4" | "umami";

/** Ce ruleaza pe domeniul construit: GA4, Umami, amandoua. */
export type UnelteActive = { ga4: boolean; umami: boolean };

/** Limba bannerului si a panoului. */
export type LimbaPanou = "ro" | "en";

/** Un rand din tabelul unei categorii, in panou. `numaiCitit` = o cheie pe care site-ul o citeste, nu o scrie. */
export type RandPanou = { nume: string; durata: string; scop: string; numaiCitit?: true };

export type ServiciuPanou = { unealta: Unealta; serviciu: string; randuri: RandPanou[] };

const GA4 = FURNIZORI.find((f) => f.cheie === "analitica");
if (GA4 === undefined) {
  throw new Error("furnizori.ts: lipseste furnizorul de analitica (GA4)");
}

const randPanou = (c: CookieDeclarat): RandPanou => ({ nume: c.nume, durata: c.durata, scop: c.scop });

/** Serviciile de statistica ale panoului, pe unealta si pe limba. */
export const SERVICII_STATISTICA_PANOU: Readonly<Record<Unealta, Readonly<Record<LimbaPanou, ServiciuPanou>>>> = {
  umami: {
    ro: {
      unealta: "umami",
      serviciu: "Umami",
      randuri: [
        {
          nume: "umami.disabled",
          durata: "Nu îl scriem noi",
          scop: "Dacă l-ați pus dumneavoastră în browser, măsurarea vă exclude.",
          numaiCitit: true,
        },
      ],
    },
    en: {
      unealta: "umami",
      serviciu: "Umami",
      randuri: [
        {
          nume: "umami.disabled",
          durata: "We do not write it",
          scop: "If you have put it in your browser yourself, the measurement excludes you.",
          numaiCitit: true,
        },
      ],
    },
  },
  ga4: {
    ro: { unealta: "ga4", serviciu: GA4.serviciu, randuri: GA4.cookieuri.map(randPanou) },
    en: {
      unealta: "ga4",
      serviciu: GA4.serviciu,
      randuri: [
        { nume: "_ga", durata: "2 years", scop: "Tells visitors apart, without name or e-mail address." },
        { nume: "_ga_ followed by the measurement code", durata: "2 years", scop: "Remembers the current browsing session." },
      ],
    },
  },
};

/** Alegerea din banner, ca rand al categoriei strict necesare, pe limba (in romana, din `COOKIE_ALEGERE`). */
export const ALEGERE_PANOU: Readonly<Record<LimbaPanou, RandPanou>> = {
  ro: randPanou(COOKIE_ALEGERE),
  en: {
    nume: COOKIE_ALEGERE.nume,
    durata: "6 months",
    scop: "Remembers what you chose in the cookie banner, so that we do not ask you on every page.",
  },
};

/**
 * Serviciile de statistica care RULEAZA pe domeniu, in ordinea din textul bannerului (aplicatia proprie intai,
 * apoi Google Analytics): panoul listeaza numai ce porneste la accept.
 */
export function serviciiStatistica(unelte: UnelteActive, limba: LimbaPanou): ServiciuPanou[] {
  const ordine: Unealta[] = ["umami", "ga4"];
  return ordine.filter((u) => unelte[u]).map((u) => SERVICII_STATISTICA_PANOU[u][limba]);
}

/**
 * Furnizorii din `FURNIZORI` care privesc domeniul: cei fara categorie (gazduirea platformei) si GA4 numai cand
 * ruleaza. Intra in versiunea informarii (`src/lib/analitica.ts`).
 */
export function furnizoriActivi(unelte: UnelteActive): Furnizor[] {
  return FURNIZORI.filter((f) => f.categorie !== "statistica" || unelte.ga4);
}
