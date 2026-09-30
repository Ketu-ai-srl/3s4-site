// Analitica proprie, fara cookie (felia multi-domeniu, planul valului S4, §8): aplicatia de statistica
// Umami, INSTANTA PROPRIE (autogazduita), nu un serviciu de analiza al altcuiva. Pornita numai cand
// mediul are ambele variabile, `UMAMI_URL` si `UMAMI_WEBSITE_ID`, SI domeniul are un operator de date
// numit si complet; fara ele nu exista niciun script, nicio rescriere, nimic in HTML.
//
// FARA OPERATOR, NIMIC (planul §9, decizia owner-ului din 24.09.2026: "analitica prelucreaza date
// personale (cookie-uri, IP), deci cere operator"; aceeasi regula o aplica GA4 in `src/lib/analitica.ts`).
// Statistica proprie primeste de la browser adresa paginii, limba si dimensiunea ecranului, iar adresa IP a
// vizitatorului intra in calculul codului vizitei (mai jos): sunt date personale, iar fara operator nu exista
// nici politica publicata, nici cine sa raspunda de ele. De aceea, cu variabilele date si fara operator nu
// exista script, nu exista rescrierile `/a/` (nici cea de primire, care nu depinde de script) si nu se scrie
// nimic in pagina; jurnalul build-ului spune de ce (`AVERTISMENT_FARA_OPERATOR`). Oprirea e tacuta pentru
// vizitator si nu opreste construirea, la fel ca la GA4 ("ramane oprit chiar cu ID"): variabilele se pot pune
// inaintea operatorului, iar ziua operatorului le porneste fara alt pas. Modulul ramane pur: primeste un singur
// boolean, "exista un operator numit si complet?", pe care il calculeaza apelantul din operatorul rezolvat
// (`OPERATOR_JSON` inaintea lui `config/operator.json`, `src/lib/operator.ts`).
//
// PRIN CALE PROPRIE. Browserul nu vorbeste niciodata cu instanta de statistica: scriptul se cere de la
// `/a/script.js` si evenimentele pleaca la `/a/api/send`, adica la originea site-ului, iar SERVERUL
// site-ului le transmite mai departe (rescrierile din `next.config.ts`, construite aici). Asa ramane
// adevarata poarta C-01 ("zero terti": nicio cerere a browserului spre alta origine) chiar cu
// statistica pornita, iar politica de cookie-uri poate spune ca paginile nu contacteaza niciun tert
// inainte de acord. Trackerul isi ia adresa de trimitere din adresa propriului `src`, fara alt atribut,
// deci `/a/script.js` da `/a/api/send`.
//
// DE UNDE STIM CE FACE APLICATIA. Trei surse, toate citite pe 2026-09-30:
//   (1) codul trackerului, asa cum il serveste instanta noastra (2688 de octeti; comportamentul lui se
//       schimba odata cu versiunea instantei, deci proba de browser masoara ce face PAGINA NOASTRA -
//       cai, atribute, zero cookie-uri si zero stocare scrisa -, nu aplicatia);
//   (2) documentatia oficiala: https://docs.umami.is/docs/faq (intrebarile 1, 2, 5 si 8),
//       https://docs.umami.is/docs/tracker-configuration, https://docs.umami.is/docs/sessions;
//   (3) sursa rutei de primire, `src/app/api/send/route.ts` din depozitul umami-software/umami
//       (ramura principala), si `src/lib/ip.ts` din acelasi depozit.
// Ce rezulta:
//   - nu scrie niciun cookie: cererile pleaca cu `credentials: "omit"` (implicitul din cod), iar FAQ,
//     intrebarea 2, spune "Umami does not use any cookies in the tracking code" (1, 2);
//   - din stocarea locala CITESTE numai `umami.disabled` (marcajul prin care isi exclude cineva singur
//     vizitele) si nu scrie nimic acolo; jetonul de sesiune primit de la server se tine in memorie (1);
//   - `data-do-not-track="true"` (atribut din Umami 2.17.0) opreste orice trimitere cand browserul spune
//     "Do Not Track": `window.doNotTrack`, `navigator.doNotTrack` sau `navigator.msDoNotTrack` egale cu
//     1, "1" sau "yes" (1, 2);
//   - trimite adresa paginii, referrerul, titlul, limba si dimensiunea ecranului (1); tipul de browser,
//     de sistem si de dispozitiv si locul aproximat (tara, regiunea, orasul) le calculeaza serverul din
//     user agent si din adresa IP, cand instanta poate (3);
//   - ADRESA IP NU SE SALVEAZA in sesiune: `createSession` primeste browserul, sistemul, dispozitivul,
//     ecranul, limba, tara, regiunea si orasul, nu adresa. Identificatorul sesiunii se calculeaza din
//     id-ul site-ului, IP, user agent si o sare a carei rotatie implicita e lunara (3, 2);
//   - adresa IP a vizitatorului se citeste, la instanta, din antetele cererii, inclusiv `x-forwarded-for`
//     (primul element) (3): cererile trec prin serverul site-ului, deci ce vede instanta depinde de
//     proxy-urile dintre cele doua (`docs/ziua-operatorului.md`, sectiunea variabilelor pe domeniu);
//   - pe o instanta autogazduita, datele se pastreaza NELIMITAT pana le sterge cineva (FAQ, intrebarea 8).
//
// Modulul e pur si fara importuri: il incarca `next.config.ts` la construire si probele.

/** Calea scriptului pe originea site-ului. */
export const CALE_SCRIPT = "/a/script.js";

/** Calea la care trackerul isi trimite evenimentele: directorul scriptului plus `/api/send`. */
export const CALE_TRIMITERE = "/a/api/send";

/** Caile instantei de statistica la care se transmit cererile. */
const CALE_SCRIPT_INSTANTA = "/script.js";
const CALE_TRIMITERE_INSTANTA = "/api/send";

/** Identificatorul unui site in Umami: un UUID. */
const FORMA_ID_SITE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Gazdele pe care `http` e acceptat (numai pentru probe si lucru local): orice altceva cere `https`. */
const GAZDE_LOCALE = new Set(["localhost", "127.0.0.1", "[::1]"]);

/** Configurarea din mediu, fara operator: `activa` spune numai ca variabilele sunt date si valide. */
export type AnaliticaProprie = { activa: false } | { activa: true; origine: string; idSite: string };

/**
 * Starea de RULARE: configurata SI cu operator. `motiv` spune de ce nu ruleaza: variabilele nu sunt date
 * (`nesetata`) sau sunt date, dar domeniul n-are un operator numit si complet (`fara-operator`).
 */
export type StareAnaliticaProprie =
  | { activa: false; motiv: "nesetata" | "fara-operator" }
  | { activa: true; origine: string; idSite: string };

/**
 * Mesajul din jurnalul build-ului cand variabilele sunt date si operatorul lipseste. ASCII, fara diacritice:
 * jurnalul unui build trece prin terminale si panouri care nu le afiseaza toate la fel. Se scrie o singura
 * data pe proces, din `next.config.ts`; nu se scrie din componenta (ar iesi la fiecare pagina).
 */
export const AVERTISMENT_FARA_OPERATOR =
  "UMAMI_URL si UMAMI_WEBSITE_ID sunt setate, dar domeniul nu are un operator de date numit si complet " +
  "(OPERATOR_JSON sau config/operator.json): analitica proprie ramane OPRITA, fara script si fara rescrierile /a/, " +
  "ca si GA4 (planul S4, sectiunea 9). Porneste singura la urmatorul build cu operator, fara alta schimbare " +
  "(docs/ziua-operatorului.md).";

/** Variabilele de mediu citite aici; `process.env` se potriveste, iar probele dau un obiect propriu. */
export type MediuAnalitica = Readonly<Record<string, string | undefined>>;

/** Originea instantei: `https://gazda`, fara cale, parametri sau credentiale. Arunca pe o valoare nevalida. */
function origineInstanta(brut: string): string {
  let adresa: URL;
  try {
    adresa = new URL(brut);
  } catch {
    throw new Error('UMAMI_URL nu e o adresa web: "' + brut + '"');
  }
  const localHttp = adresa.protocol === "http:" && GAZDE_LOCALE.has(adresa.hostname);
  if (adresa.protocol !== "https:" && !localHttp) {
    throw new Error('UMAMI_URL trebuie sa inceapa cu https:// , nu "' + brut + '"');
  }
  const doarOrigine =
    (adresa.pathname === "/" || adresa.pathname === "") &&
    adresa.search === "" &&
    adresa.hash === "" &&
    adresa.username === "" &&
    adresa.password === "";
  if (!doarOrigine) {
    throw new Error('UMAMI_URL trebuie sa fie doar originea (https://gazda), fara cale sau parametri: "' + brut + '"');
  }
  return adresa.origin;
}

/**
 * Starea analiticii proprii, din mediu. Nesetate sau goale AMANDOUA: oprita. Numai una dintre ele:
 * eroare, fiindca o statistica pe jumatate configurata nu masoara nimic si nu spune de ce. Valori care
 * nu au forma cerata: eroare. Arunca la construire (rescrierile din `next.config.ts` chiar inainte de
 * compilare), nu la prima cerere.
 */
export function analiticaProprie(mediu: MediuAnalitica = process.env): AnaliticaProprie {
  const url = (mediu.UMAMI_URL ?? "").trim();
  const id = (mediu.UMAMI_WEBSITE_ID ?? "").trim();
  if (url === "" && id === "") {
    return { activa: false };
  }
  if (url === "" || id === "") {
    throw new Error(
      "UMAMI_URL si UMAMI_WEBSITE_ID se seteaza impreuna: lipseste " + (url === "" ? "UMAMI_URL" : "UMAMI_WEBSITE_ID"),
    );
  }
  if (!FORMA_ID_SITE.test(id)) {
    throw new Error('UMAMI_WEBSITE_ID trebuie sa fie un UUID (8-4-4-4-12 cifre hexazecimale), nu "' + id + '"');
  }
  return { activa: true, origine: origineInstanta(url), idSite: id.toLowerCase() };
}

/**
 * Starea de rulare a analiticii proprii: configurarea din mediu (`analiticaProprie`) SI un operator de date
 * numit si complet (`operatorComplet`, calculat de apelant din operatorul rezolvat al domeniului). Fara
 * operator ruleaza nimic, chiar cu variabilele date: vezi antetul modulului. O configurare gresita se
 * raporta oricum, cu sau fara operator: eroarea nu se ascunde in spatele lipsei lui.
 */
export function stareAnaliticaProprie(mediu: MediuAnalitica, operatorComplet: boolean): StareAnaliticaProprie {
  const configurata = analiticaProprie(mediu);
  if (!configurata.activa) {
    return { activa: false, motiv: "nesetata" };
  }
  if (!operatorComplet) {
    return { activa: false, motiv: "fara-operator" };
  }
  return configurata;
}

/**
 * Rescrierile Next.js care duc cele doua cai proprii spre instanta de statistica. Lista goala cand
 * analitica nu ruleaza (variabile nesetate SAU fara operator: fara rescrierea de primire, o cerere
 * `POST /a/api/send` primeste 404 chiar daca nimeni nu incarca scriptul). Se cheama din `next.config.ts`
 * (`rewrites`), deci se citesc la CONSTRUIRE: o schimbare de `UMAMI_URL` sau de operator cere build nou.
 */
export function rescrieriAnalitica(mediu: MediuAnalitica, operatorComplet: boolean): { source: string; destination: string }[] {
  const stare = stareAnaliticaProprie(mediu, operatorComplet);
  if (!stare.activa) {
    return [];
  }
  return [
    { source: CALE_SCRIPT, destination: stare.origine + CALE_SCRIPT_INSTANTA },
    { source: CALE_TRIMITERE, destination: stare.origine + CALE_TRIMITERE_INSTANTA },
  ];
}
