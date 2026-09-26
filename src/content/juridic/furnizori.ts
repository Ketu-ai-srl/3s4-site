// Furnizorii care primesc date, cu tara si mecanismul de transfer: sursa UNICA pentru politica de
// confidentialitate (destinatarii si transferurile, GDPR art. 13 alin. (1) lit. e)-f)), pentru
// politica de cookie-uri si pentru panoul de setari al bannerului. Un furnizor adaugat aici apare
// in toate trei deodata; unul adaugat in alta parte nu apare nicaieri - asta e ideea.
//
// NEPUBLICAT azi (planul valului S4, §9-§10): textele juridice se construiesc complet si stau in
// spatele comutatorului operatorului; paginile le face felia `juridic` (valul S4-4).
//
// FAPTE, cu sursa lor (verificate 24.09.2026):
//   - gazduirea platformei: Amazon, Germania, o singura regiune UE - decizia owner-ului D4c, in
//     registrul de afirmatii ca `acasa-gazduire-amazon-germania`;
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
  /** Tara in care stau datele. */
  tara: string;
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
    rol: "Găzduiește contul, fișierele încărcate și arhiva digitală, într-o singură regiune din Germania.",
    tara: "Germania",
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
    rol: "Măsoară vizitele și paginile citite pe site, ca să știm ce e util. Pornește numai după acordul dumneavoastră pentru categoria Statistică.",
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
        scop: "Ține minte sesiunea de vizitare în curs.",
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
