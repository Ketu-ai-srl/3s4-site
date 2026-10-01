// Lista INCHISA de evenimente de analitica (planul valului S4, §8.5): CTA-urile, inceputul si
// trimiterea formularelor, industria aleasa in constructor, folosirea calculatorului de pe preturi.
// Din codul nostru nu pleaca spre GA4 niciun alt eveniment: unul din afara listei nu se trimite, se
// pierde.
//
// CE NU POATE IMPUNE CODUL. Pe langa lista, GA4 masoara singur vizitele si paginile citite (acestea
// sunt si in politica), iar masurarea imbunatatita a fluxului web ar trimite, daca ramane pornita,
// derulari, clicuri spre alte site-uri, cautari, descarcari, video si formulare. Acelea se opresc din
// proprietatea GA4, nu de aici: docs/ziua-operatorului.md, pasul 5, cu comanda de verificare. Fara
// pasul acela, lista nu mai e inchisa si politica nu mai descrie ce pleaca.
//
// DE CE INCHISA. O lista deschisa creste cu fiecare felie care "mai vrea o cifra", iar fiecare
// cifra noua e o prelucrare noua, de declarat in politica. Lista de aici e chiar cea din politica
// de cookie-uri; un eveniment nou intra in AMANDOUA, in acelasi commit.
//
// FARA DATE PERSONALE. Parametrii sunt coduri din multimi cunoscute (formularul, industria, calea
// CTA-ului), verificati la rulare: un text liber - un nume, o adresa de e-mail scapata dintr-un
// camp - nu are forma unui cod si e respins inainte sa plece.
//
// CINE LE TRIMITE: feliile paginilor, prin `trimiteEveniment`, doar dupa ce vizitatorul a acceptat
// statistica; CTA-urile catre cont si contact se prind singure, dintr-un ascultator pe document,
// ca butoanele sa nu poarte fiecare cod de analitica.

import { ga4Pornit } from "./stare-ga4";

/** Formularele site-ului, in ordinea feliilor care le construiesc. */
export const FORMULARE = ["contact", "inregistrare", "enterprise"] as const;
export type Formular = (typeof FORMULARE)[number];

/** Parametrii fiecarui eveniment. Un eveniment fara parametri are obiectul gol. */
export type ParametriEveniment = {
  clic_cta: { tinta: string };
  formular_inceput: { formular: Formular };
  formular_trimis: { formular: Formular };
  industrie_aleasa: { industrie: string };
  calculator_folosit: Record<string, never>;
};

export type NumeEveniment = keyof ParametriEveniment;

/** Numele evenimentelor si cheile de parametri permise: lista inchisa, la rulare. */
export const EVENIMENTE: Record<NumeEveniment, readonly string[]> = {
  clic_cta: ["tinta"],
  formular_inceput: ["formular"],
  formular_trimis: ["formular"],
  industrie_aleasa: ["industrie"],
  calculator_folosit: [],
};

/**
 * Caile CTA-urilor urmarite automat: contul gratuit (`CALE_INREGISTRARE` din navigatie) si contactul.
 * Scrise aici, nu importate, ca modulul navigatiei sa nu intre in codul de browser; proba verifica
 * ca prima cale e chiar `CALE_INREGISTRARE`.
 */
export const CAI_CTA_URMARITE = ["/inregistrare", "/contact"] as const;

/** Un cod: litere mici, cifre si cratima, pana la 40 de caractere. Un text liber nu trece. */
const COD = /^[a-z0-9][a-z0-9-]{0,39}$/;
/** O cale de pe site, fara parametri de cautare. */
const CALE = /^\/[a-z0-9\-/]{0,79}$/;

/** Evenimentul e in lista, cu exact parametrii lui, fiecare cu forma permisa. */
export function evenimentValid(nume: string, parametri: Record<string, unknown>): boolean {
  if (!Object.prototype.hasOwnProperty.call(EVENIMENTE, nume)) return false;
  const permise = EVENIMENTE[nume as NumeEveniment];
  const chei = Object.keys(parametri);
  if (chei.length !== permise.length || chei.some((k) => !permise.includes(k))) return false;
  for (const k of chei) {
    const v = parametri[k];
    if (typeof v !== "string") return false;
    if (k === "tinta" && !CALE.test(v)) return false;
    if (k === "formular" && !(FORMULARE as readonly string[]).includes(v)) return false;
    if (k === "industrie" && !COD.test(v)) return false;
  }
  return true;
}

/** Trimite un eveniment din lista. Intoarce `true` numai daca a plecat efectiv spre GA4. */
export function trimiteEveniment<N extends NumeEveniment>(nume: N, parametri: ParametriEveniment[N]): boolean {
  if (!evenimentValid(nume, parametri as Record<string, unknown>)) return false;
  if (typeof window === "undefined" || typeof window.gtag !== "function" || !ga4Pornit()) return false;
  window.gtag("event", nume, parametri);
  return true;
}

/** Porneste ascultatorul CTA-urilor. Intoarce functia care il opreste. */
export function urmaresteCta(): () => void {
  const laClic = (e: MouseEvent) => {
    const tinta = e.target instanceof Element ? e.target.closest("a[href]") : null;
    if (!(tinta instanceof HTMLAnchorElement)) return;
    let adresa: URL;
    try {
      adresa = new URL(tinta.href, window.location.href);
    } catch {
      return;
    }
    if (adresa.origin !== window.location.origin) return;
    const cale = (CAI_CTA_URMARITE as readonly string[]).find((c) => adresa.pathname === c);
    if (cale) trimiteEveniment("clic_cta", { tinta: cale });
  };
  document.addEventListener("click", laClic, true);
  return () => document.removeEventListener("click", laClic, true);
}

// ---------------------------------------------------------------------------------------------
// EVENIMENTELE UMAMI (masurarea S-B): lista inchisa, SEPARATA de cea GA4
// ---------------------------------------------------------------------------------------------
//
// Trei actiuni, cum le descrie politica de cookie-uri a lui 3s.md (sectiunea despre masurarea fara cookie:
// "un clic pe un canal de contact, un clic pe un buton care duce la contact si schimbarea limbii paginii"):
//   - `contact`, cu `canal` (whatsapp, telefon, email) si `lang` (limba paginii): legaturile `wa.me`, `tel:` si
//     `mailto:`, oriunde in pagina; un singur eveniment, fiindca un obiectiv Umami urmareste un singur eveniment;
//   - `cta_contact`, cu `lang`: o legatura interna spre pagina de contact a editiei (`/contact`, `/ro/contact`);
//   - `lang_switch`, cu `lang` = limba TINTA: o legatura interna care poarta alta limba decat pagina (selectorul
//     de limba si legatura spre editia locala din subsol au atributul `lang`).
// Parametrii sunt coduri din multimi cunoscute, verificati la rulare, ca la GA4: un text liber nu pleaca.
//
// CUM SE PRIND: un singur ascultator pe document, in faza de captura, pornit numai dupa accept
// (`Consimtamant.tsx`) si oprit la retragere. NU cheama `preventDefault` si nu pune `data-umami-event` pe
// legaturi: scriptul instantei ar opri navigarea pe acelea pana raspunde instanta, deci un Umami lent ar
// intarzia `tel:` si `mailto:`. Trimiterea trece prin `window.umami.track`, adica prin aceeasi functie
// `data-before-send` ca vizitele: dupa o retragere nu pleaca nimic, nici daca ascultatorul ar mai rula.

/** Canalele de contact ale evenimentului `contact`. */
export const CANALE_CONTACT = ["whatsapp", "telefon", "email"] as const;
export type CanalContact = (typeof CANALE_CONTACT)[number];

/** Limbile paginilor si ale tintelor. */
export const LIMBI_EVENIMENT = ["en", "ro"] as const;
export type LimbaEveniment = (typeof LIMBI_EVENIMENT)[number];

/** Caile paginilor de contact ale editiilor (romana si engleza la `/contact`, romana pentru Moldova sub `/ro`). */
export const CAI_CONTACT = ["/contact", "/ro/contact"] as const;

export type ParametriEvenimentUmami = {
  contact: { canal: CanalContact; lang: LimbaEveniment };
  cta_contact: { lang: LimbaEveniment };
  lang_switch: { lang: LimbaEveniment };
};

export type NumeEvenimentUmami = keyof ParametriEvenimentUmami;

/** Numele evenimentelor Umami si cheile de parametri permise: lista inchisa, la rulare. */
export const EVENIMENTE_UMAMI: Record<NumeEvenimentUmami, readonly string[]> = {
  contact: ["canal", "lang"],
  cta_contact: ["lang"],
  lang_switch: ["lang"],
};

/** Evenimentul Umami e in lista, cu exact parametrii lui, fiecare dintr-o multime cunoscuta. */
export function evenimentUmamiValid(nume: string, parametri: Record<string, unknown>): boolean {
  if (!Object.prototype.hasOwnProperty.call(EVENIMENTE_UMAMI, nume)) return false;
  const permise = EVENIMENTE_UMAMI[nume as NumeEvenimentUmami];
  const chei = Object.keys(parametri);
  if (chei.length !== permise.length || chei.some((k) => !permise.includes(k))) return false;
  for (const k of chei) {
    const v = parametri[k];
    if (typeof v !== "string") return false;
    if (k === "canal" && !(CANALE_CONTACT as readonly string[]).includes(v)) return false;
    if (k === "lang" && !(LIMBI_EVENIMENT as readonly string[]).includes(v)) return false;
  }
  return true;
}

/** Limba din atributul `lang` (`ro`, `ro-MD`, `en-US`), redusa la codul de doua litere, sau `null`. */
export function limbaDin(atribut: string | null | undefined): LimbaEveniment | null {
  const cod = (atribut ?? "").trim().slice(0, 2).toLowerCase();
  return (LIMBI_EVENIMENT as readonly string[]).includes(cod) ? (cod as LimbaEveniment) : null;
}

type EvenimentUmami = { [N in NumeEvenimentUmami]: [N, ParametriEvenimentUmami[N]] }[NumeEvenimentUmami];

/**
 * Evenimentul unui clic pe legatura data, sau `null`. Pura (fara document), ca s-o poata masura proba:
 * `href` e adresa absoluta a legaturii, `lang` atributul ei, `pagina` adresa paginii si `limbaPagina` limba ei.
 */
export function evenimentDinLegatura(
  legatura: { href: string; lang: string | null },
  pagina: string,
  limbaPagina: string | null,
): EvenimentUmami | null {
  const lang = limbaDin(limbaPagina);
  if (lang === null) return null;
  let adresa: URL;
  let origine: URL;
  try {
    adresa = new URL(legatura.href, pagina);
    origine = new URL(pagina);
  } catch {
    return null;
  }
  if (adresa.protocol === "tel:") return ["contact", { canal: "telefon", lang }];
  if (adresa.protocol === "mailto:") return ["contact", { canal: "email", lang }];
  if (adresa.protocol === "https:" && (adresa.hostname === "wa.me" || adresa.hostname === "api.whatsapp.com")) {
    return ["contact", { canal: "whatsapp", lang }];
  }
  if (adresa.origin !== origine.origin) return null;
  const tinta = limbaDin(legatura.lang);
  if (tinta !== null && tinta !== lang) return ["lang_switch", { lang: tinta }];
  if ((CAI_CONTACT as readonly string[]).includes(adresa.pathname)) return ["cta_contact", { lang }];
  return null;
}

/** Trimite un eveniment Umami din lista. Intoarce `true` numai daca l-a predat trackerului. */
export function trimiteEvenimentUmami<N extends NumeEvenimentUmami>(nume: N, parametri: ParametriEvenimentUmami[N]): boolean {
  if (!evenimentUmamiValid(nume, parametri as Record<string, unknown>)) return false;
  if (typeof window === "undefined") return false;
  const umami = (window as unknown as { umami?: { track: (n: string, d: Record<string, string>) => unknown } }).umami;
  if (typeof umami?.track !== "function") return false;
  umami.track(nume, parametri as Record<string, string>);
  return true;
}

/** Porneste ascultatorul evenimentelor Umami. Intoarce functia care il opreste. Nu opreste navigarea. */
export function urmaresteUmami(): () => void {
  const laClic = (e: MouseEvent) => {
    const tinta = e.target instanceof Element ? e.target.closest("a[href]") : null;
    if (!(tinta instanceof HTMLAnchorElement)) return;
    const eveniment = evenimentDinLegatura(
      { href: tinta.href, lang: tinta.getAttribute("lang") },
      window.location.href,
      document.documentElement.getAttribute("lang"),
    );
    if (eveniment !== null) trimiteEvenimentUmami(eveniment[0], eveniment[1] as never);
  };
  document.addEventListener("click", laClic, true);
  return () => document.removeEventListener("click", laClic, true);
}
